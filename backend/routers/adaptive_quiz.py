from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.database import get_db
from app.models.user import User
from app.models.content import AdaptiveQuizAttempt
from app.auth.security import get_current_user
from app.schemas.adaptive_quiz import (
    AdaptiveAnalyticsResponse,
    AdaptiveQuizGenerateRequest,
    AdaptiveQuizGenerateResponse,
    AdaptiveQuizSubmitRequest,
    AdaptiveQuizSubmitResponse,
    AdaptiveAttemptHistoryItem
)
from app.services.adaptive_quiz_service import (
    normalize_subject_name,
    analyze_student_performance,
    generate_adaptive_quiz,
    evaluate_and_record_adaptive_quiz
)

router = APIRouter(prefix="/api/adaptive-quiz", tags=["Adaptive Quiz System"])


@router.get("/analytics/{subject}", response_model=AdaptiveAnalyticsResponse)
def get_adaptive_analytics(
    subject: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyzes genuine saved quiz performance for the authenticated student in the chosen subject.
    Computes overall accuracy, trend, topic-wise strengths/weaknesses, and next difficulty.
    Isolates data strictly to the caller's account.
    """
    norm_subject = normalize_subject_name(subject)
    analytics = analyze_student_performance(db, current_user.id, norm_subject)
    return AdaptiveAnalyticsResponse(**analytics)


@router.post("/generate", response_model=AdaptiveQuizGenerateResponse)
async def generate_quiz_endpoint(
    payload: AdaptiveQuizGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a personalized 5-question adaptive quiz tailored to the learner's
    performance profile using Gemini API with robust validation and curated fallback.
    """
    quiz_data = await generate_adaptive_quiz(
        db=db,
        user=current_user,
        subject=payload.subject,
        lesson_number=payload.lesson_number,
        target_topic_override=payload.target_topic
    )
    return AdaptiveQuizGenerateResponse(**quiz_data)


@router.post("/submit", response_model=AdaptiveQuizSubmitResponse)
def submit_adaptive_quiz_endpoint(
    payload: AdaptiveQuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates student quiz answers strictly on the backend.
    Calculates genuine score, awards XP, updates progress tables,
    and returns personalized feedback.
    """
    if len(payload.answers) != len(payload.questions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Number of answers must match number of questions."
        )

    result = evaluate_and_record_adaptive_quiz(
        db=db,
        user=current_user,
        subject=payload.subject,
        topic=payload.topic,
        difficulty=payload.difficulty,
        lesson_number=payload.lesson_number,
        student_answers=payload.answers,
        questions_data=payload.questions
    )
    return AdaptiveQuizSubmitResponse(**result)


@router.get("/history/{subject}", response_model=List[AdaptiveAttemptHistoryItem])
def get_adaptive_history(
    subject: str,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves recent genuine adaptive quiz attempt history for the authenticated student.
    Strictly isolated to current_user.
    """
    norm_subject = normalize_subject_name(subject)
    attempts = (
        db.query(AdaptiveQuizAttempt)
        .filter(
            AdaptiveQuizAttempt.user_id == current_user.id,
            func.lower(AdaptiveQuizAttempt.subject) == norm_subject.lower()
        )
        .order_by(desc(AdaptiveQuizAttempt.created_at))
        .limit(limit)
        .all()
    )

    return [
        AdaptiveAttemptHistoryItem(
            id=a.id,
            subject=a.subject,
            topic=a.topic,
            difficulty=a.difficulty,
            score=a.score,
            total_questions=a.total_questions,
            percentage=a.percentage,
            passed=a.passed,
            xp_earned=a.xp_earned,
            feedback=a.feedback,
            created_at=a.created_at.strftime("%Y-%m-%d %H:%M:%S") if a.created_at else ""
        ) for a in attempts
    ]
