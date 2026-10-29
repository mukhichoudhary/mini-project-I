import re
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import (
    User, UserProfile, UserLessonProgress, UserProjectProgress, UserBadge,
    Progress, SpeakingAssessment
)
from app.models.content import Project
from app.schemas.user import (
    UserProfileResponse, ProfileUpdate, LessonProgressSubmit,
    LessonProgressResponse, ProjectProgressSubmit, ProjectProgressResponse,
    SpeakingAssessmentSubmit, SpeakingAssessmentResponse, SpeakingStatsResponse
)
from app.auth.security import get_current_user, get_optional_user
from app.routers.auth import format_profile_response

router = APIRouter(prefix="/api/users", tags=["Users & Progress"])

def normalize_subject_name(subject: Optional[str]) -> str:
    if not subject:
        return "Python"
    s = subject.strip()
    s_lower = s.lower().replace("%2b", "+").replace("c plus plus", "c++")
    if s_lower in ("python", "py"):
        return "Python"
    elif s_lower in ("java",):
        return "Java"
    elif s_lower in ("c++", "cpp", "cplusplus", "c") or s_lower.replace(" ", "+") in ("c++", "c+"):
        return "C++"
    elif s_lower in ("english", "technical english", "tech english", "technical-english"):
        return "English"
    elif s_lower in ("general", "general concepts", "cs", "computer science", "general-concepts", "dbms", "algorithms"):
        return "General"
    return s[0].upper() + s[1:] if len(s) > 1 else s.upper()

def calculate_tier(xp: int) -> str:
    if xp >= 2500:
        return "Stage 4 • Curriculum Mastery"
    elif xp >= 1500:
        return "Stage 3 • Advanced Algorithms"
    elif xp >= 750:
        return "Stage 2 • Core Architecture"
    return "Stage 1 • Fundamentals"

@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    return format_profile_response(current_user, profile)

@router.put("/settings", response_model=UserProfileResponse)
def update_settings(payload: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.full_name:
        current_user.full_name = payload.full_name.strip()

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    if payload.chosen_language:
        profile.chosen_language = normalize_subject_name(payload.chosen_language)
    if payload.daily_goal is not None:
        profile.daily_goal = payload.daily_goal

    db.commit()
    db.refresh(current_user)
    db.refresh(profile)
    return format_profile_response(current_user, profile)

@router.post("/progress", response_model=LessonProgressResponse)
def submit_lesson_progress(
    payload: LessonProgressSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit quiz/lesson results, grant XP, and update progress."""
    normalized_subject = normalize_subject_name(payload.subject)
    progress = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == current_user.id,
        func.lower(UserLessonProgress.subject) == func.lower(normalized_subject),
        UserLessonProgress.lesson_number == payload.lesson_number
    ).first()

    is_new_completion = False
    if not progress:
        progress = UserLessonProgress(
            user_id=current_user.id,
            subject=normalized_subject,
            lesson_number=payload.lesson_number,
            score=payload.score,
            total_questions=payload.total_questions,
            xp_earned=payload.xp_earned,
            completed=True
        )
        db.add(progress)
        is_new_completion = True
    else:
        # Update existing progress with better score or new attempt
        if payload.score > progress.score:
            progress.score = payload.score
        progress.subject = normalized_subject
        progress.completed = True
        progress.total_questions = payload.total_questions
        progress.xp_earned = max(progress.xp_earned, payload.xp_earned)

    # Update User Profile XP and calculate level
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if profile:
        added_xp = payload.xp_earned if is_new_completion else max(10, payload.xp_earned // 4)
        profile.total_xp += added_xp
        profile.current_level = max(1, profile.total_xp // 300)
        profile.rank_tier = calculate_tier(profile.total_xp)

    db.commit()
    db.refresh(progress)
    return progress

@router.get("/progress", response_model=List[LessonProgressResponse])
def get_user_progress(
    subject: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        return []
    query = db.query(UserLessonProgress).filter(UserLessonProgress.user_id == current_user.id)
    if subject:
        normalized_subject = normalize_subject_name(subject)
        query = query.filter(func.lower(UserLessonProgress.subject) == func.lower(normalized_subject))
    return query.order_by(UserLessonProgress.lesson_number.asc()).all()

@router.post("/projects", response_model=ProjectProgressResponse)
def save_project_progress(
    payload: ProjectProgressSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(UserProjectProgress).filter(
        UserProjectProgress.user_id == current_user.id,
        UserProjectProgress.project_id == payload.project_id
    ).first()

    was_completed = bool(record.is_completed) if record else False

    # Determine code and progress values to evaluate completion requirements
    code_val = payload.saved_code if payload.saved_code is not None else (record.saved_code if record else "")
    prog_val = payload.progress_percent if payload.progress_percent is not None else (record.progress_percent if record else 0)

    # Genuine completion requirements:
    # 1. is_completed requested as True
    # 2. progress is at 100%
    # 3. code is provided and non-empty
    is_qualifying = bool(
        payload.is_completed and
        prog_val >= 100 and
        code_val and code_val.strip()
    )

    if payload.is_completed is False:
        target_completed = False
    elif was_completed:
        target_completed = True
    else:
        target_completed = is_qualifying

    is_new_completion = target_completed and not was_completed

    # Resolve project subject
    proj_def = db.query(Project).filter(Project.slug == payload.project_id).first()
    resolved_subject = proj_def.subject if (proj_def and proj_def.subject) else (
        normalize_subject_name(payload.subject) if payload.subject else None
    )

    if not record:
        record = UserProjectProgress(
            user_id=current_user.id,
            project_id=payload.project_id,
            subject=resolved_subject,
            saved_code=payload.saved_code,
            progress_percent=payload.progress_percent or 0,
            is_completed=target_completed
        )
        db.add(record)
    else:
        if payload.saved_code is not None:
            record.saved_code = payload.saved_code
        if payload.progress_percent is not None:
            record.progress_percent = payload.progress_percent
        if resolved_subject and (not record.subject or record.subject == ""):
            record.subject = resolved_subject
        record.is_completed = target_completed

    if is_new_completion:
        # Look up project XP from Project definitions or default 100
        xp_gain = proj_def.xp if (proj_def and proj_def.xp) else 100
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        if profile:
            profile.total_xp += xp_gain
            profile.current_level = max(1, profile.total_xp // 300)
            profile.rank_tier = calculate_tier(profile.total_xp)

    db.commit()
    db.refresh(record)
    return record

@router.get("/projects", response_model=List[ProjectProgressResponse])
def get_all_user_projects(
    subject: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(UserProjectProgress).filter(
        UserProjectProgress.user_id == current_user.id
    )
    if subject is not None:
        norm = normalize_subject_name(subject)
        if norm in ("Python", "Java", "C++", "English", "General"):
            query = query.filter(UserProjectProgress.subject.ilike(norm))
        else:
            return []
    return query.all()

@router.get("/projects/{project_id}", response_model=Optional[ProjectProgressResponse])
def get_project_progress(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(UserProjectProgress).filter(
        UserProjectProgress.user_id == current_user.id,
        UserProjectProgress.project_id == project_id
    ).first()
    return record

@router.post("/reset")
def reset_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset learning progress, streak, and XP for the authenticated user."""
    db.query(UserLessonProgress).filter(UserLessonProgress.user_id == current_user.id).delete()
    db.query(UserProjectProgress).filter(UserProjectProgress.user_id == current_user.id).delete()
    db.query(UserBadge).filter(UserBadge.user_id == current_user.id).delete()

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if profile:
        profile.total_xp = 0
        profile.streak_days = 0
        profile.current_level = 1
        profile.rank_tier = "Stage 1 • Fundamentals"

    db.commit()
    return {"status": "success", "message": "All user progress has been successfully reset."}


# ---------------- SPEAKING & SPEECH-TO-TEXT ASSESSMENT ----------------

def compute_transcription_similarity(target: str, spoken: str) -> float:
    """
    Calculate genuine word-level transcription accuracy comparing spoken text
    to the target text using normalized token matching and Word Error Rate (WER).
    """
    def tokenize(s: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", "", s.lower())
        return [w.strip() for w in cleaned.split() if w.strip()]

    target_tokens = tokenize(target)
    spoken_tokens = tokenize(spoken)

    if not target_tokens:
        return 0.0
    if not spoken_tokens:
        return 0.0

    n = len(target_tokens)
    m = len(spoken_tokens)
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if target_tokens[i - 1] == spoken_tokens[j - 1]:
                cost = 0
            else:
                cost = 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,        # deletion
                dp[i][j - 1] + 1,        # insertion
                dp[i - 1][j - 1] + cost  # substitution
            )

    edit_distance = dp[n][m]
    wer = edit_distance / n
    accuracy = max(0.0, min(100.0, round((1.0 - wer) * 100.0, 1)))
    return accuracy


@router.post("/speaking-assessment", response_model=SpeakingAssessmentResponse)
def submit_speaking_assessment(
    payload: SpeakingAssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save genuine speech-to-text assessment:
    - Never trusts client-supplied user ID; explicitly uses current_user.id.
    - Server independently calculates transcription accuracy using normalized Word Error Rate.
    - Explicitly marks pronunciation_status = 'unavailable' per acoustic model separation.
    - Updates normalized progress for English pronunciation module.
    """
    server_accuracy = compute_transcription_similarity(payload.target_text, payload.spoken_text)
    # Server-verified accuracy prevents client fabrication
    verified_accuracy = min(payload.transcription_accuracy, server_accuracy)

    # Generate intelligent, actionable feedback
    feedback_notes = []
    if verified_accuracy >= 90:
        feedback_notes.append("High transcription fidelity with clear phonetic clarity.")
    elif verified_accuracy >= 75:
        feedback_notes.append("Good articulation with minor lexical or ending consonant omissions.")
    elif verified_accuracy >= 50:
        feedback_notes.append("Moderate accuracy. Several target words were omitted or misaligned.")
    else:
        feedback_notes.append("Low transcription accuracy. Practice listening to the model prompt and speak at a steady pace.")

    if payload.speaking_rate_wpm is not None and payload.speaking_rate_wpm > 0:
        w = payload.speaking_rate_wpm
        if w > 160:
            feedback_notes.append(f"Fast speaking pace ({int(w)} WPM). Slightly deliberate pacing improves intelligibility.")
        elif w >= 110:
            feedback_notes.append(f"Optimal conversational pace ({int(w)} WPM).")
        else:
            feedback_notes.append(f"Deliberate pace ({int(w)} WPM). Focus on smooth word linking to build fluency.")
    else:
        feedback_notes.append("Recording duration was under 1s; speaking rate was not measured.")

    feedback_str = " ".join(feedback_notes)
    diff_val = (payload.difficulty or "intermediate").strip().lower()
    task_val = (payload.task_type or "sentence_reading").strip().lower()

    assessment = SpeakingAssessment(
        user_id=current_user.id,
        target_text=payload.target_text.strip(),
        spoken_text=payload.spoken_text.strip(),
        transcription_accuracy=verified_accuracy,
        duration_seconds=payload.duration_seconds,
        speaking_rate_wpm=payload.speaking_rate_wpm,
        pronunciation_status="unavailable",
        difficulty=diff_val,
        task_type=task_val,
        feedback_text=feedback_str,
        created_at=datetime.utcnow()
    )
    db.add(assessment)

    # Update English pronunciation module in normalized Progress table
    prog_row = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.course_slug == "english",
        Progress.module_key == "pronunciation"
    ).first()

    if prog_row:
        prog_row.highest_score = max(prog_row.highest_score or 0, int(round(verified_accuracy)))
        prog_row.total_attempts = (prog_row.total_attempts or 0) + 1
        prog_row.completion_percent = max(prog_row.completion_percent or 0, int(round(verified_accuracy)))
        if verified_accuracy >= 70.0:
            prog_row.is_completed = True
        prog_row.last_accessed = datetime.utcnow()
    else:
        prog_row = Progress(
            user_id=current_user.id,
            course_slug="english",
            module_key="pronunciation",
            module_name="Pronunciation & Spoken English",
            completion_percent=int(round(verified_accuracy)),
            highest_score=int(round(verified_accuracy)),
            total_attempts=1,
            time_spent_mins=1,
            is_completed=(verified_accuracy >= 70.0),
            last_accessed=datetime.utcnow()
        )
        db.add(prog_row)

    # Award speaking practice XP
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if profile:
        profile.total_xp += 15
        profile.current_level = max(1, profile.total_xp // 300)
        profile.rank_tier = calculate_tier(profile.total_xp)

    db.commit()
    db.refresh(assessment)

    return SpeakingAssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        target_text=assessment.target_text,
        spoken_text=assessment.spoken_text,
        transcription_accuracy=assessment.transcription_accuracy,
        duration_seconds=assessment.duration_seconds,
        speaking_rate_wpm=assessment.speaking_rate_wpm,
        pronunciation_status=assessment.pronunciation_status,
        pronunciation_notice="Acoustic phoneme assessment engine is unavailable. Transcription similarity reflects speech-to-text recognition accuracy only.",
        difficulty=assessment.difficulty,
        task_type=assessment.task_type,
        feedback_text=assessment.feedback_text,
        created_at=assessment.created_at
    )


@router.get("/speaking-assessment", response_model=List[SpeakingAssessmentResponse])
def get_user_speaking_assessments(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve speaking assessments for the authenticated user only (strictly user-isolated)."""
    rows = db.query(SpeakingAssessment).filter(
        SpeakingAssessment.user_id == current_user.id
    ).order_by(SpeakingAssessment.created_at.desc()).limit(min(limit, 100)).all()

    return [
        SpeakingAssessmentResponse(
            id=r.id,
            user_id=r.user_id,
            target_text=r.target_text,
            spoken_text=r.spoken_text,
            transcription_accuracy=r.transcription_accuracy,
            duration_seconds=r.duration_seconds,
            speaking_rate_wpm=r.speaking_rate_wpm,
            pronunciation_status=r.pronunciation_status,
            pronunciation_notice="Acoustic phoneme assessment engine is unavailable. Transcription similarity reflects speech-to-text recognition accuracy only.",
            difficulty=r.difficulty or "intermediate",
            task_type=r.task_type or "sentence_reading",
            feedback_text=r.feedback_text,
            created_at=r.created_at
        )
        for r in rows
    ]


@router.get("/speaking-assessment/latest", response_model=Optional[SpeakingAssessmentResponse])
def get_latest_speaking_assessment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve latest speaking assessment for the authenticated user."""
    r = db.query(SpeakingAssessment).filter(
        SpeakingAssessment.user_id == current_user.id
    ).order_by(SpeakingAssessment.created_at.desc()).first()

    if not r:
        return None

    return SpeakingAssessmentResponse(
        id=r.id,
        user_id=r.user_id,
        target_text=r.target_text,
        spoken_text=r.spoken_text,
        transcription_accuracy=r.transcription_accuracy,
        duration_seconds=r.duration_seconds,
        speaking_rate_wpm=r.speaking_rate_wpm,
        pronunciation_status=r.pronunciation_status,
        pronunciation_notice="Acoustic phoneme assessment engine is unavailable. Transcription similarity reflects speech-to-text recognition accuracy only.",
        difficulty=r.difficulty or "intermediate",
        task_type=r.task_type or "sentence_reading",
        feedback_text=r.feedback_text,
        created_at=r.created_at
    )


@router.get("/speaking-assessment/stats", response_model=SpeakingStatsResponse)
def get_user_speaking_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes aggregate speaking analytics for the authenticated user:
    - Overall accuracy and pace averages
    - Attempts broken down by difficulty
    - Recent progress trend (last 5 attempts) distinguishing unmeasured pace (<1s) from zero.
    """
    rows = (
        db.query(SpeakingAssessment)
        .filter(SpeakingAssessment.user_id == current_user.id)
        .order_by(SpeakingAssessment.created_at.desc())
        .all()
    )

    total_attempts = len(rows)
    if total_attempts == 0:
        return SpeakingStatsResponse(
            total_attempts=0,
            average_accuracy=0.0,
            average_wpm=None,
            best_accuracy=0.0,
            attempts_by_difficulty={"Beginner": 0, "Intermediate": 0, "Advanced": 0},
            recent_trend=[]
        )

    avg_acc = round(sum(r.transcription_accuracy for r in rows) / total_attempts, 1)
    best_acc = max(r.transcription_accuracy for r in rows)

    wpm_measured_rows = [r.speaking_rate_wpm for r in rows if r.speaking_rate_wpm is not None and r.speaking_rate_wpm > 0]
    avg_wpm = round(sum(wpm_measured_rows) / len(wpm_measured_rows), 1) if wpm_measured_rows else None

    diff_counts = {"Beginner": 0, "Intermediate": 0, "Advanced": 0}
    for r in rows:
        d = (r.difficulty or "intermediate").capitalize()
        if d in diff_counts:
            diff_counts[d] += 1
        else:
            diff_counts["Intermediate"] += 1

    recent = []
    for r in rows[:5]:
        is_measured = bool(r.duration_seconds and r.duration_seconds >= 1.0 and r.speaking_rate_wpm and r.speaking_rate_wpm > 0)
        recent.append({
            "id": r.id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "accuracy": r.transcription_accuracy,
            "speaking_rate_wpm": r.speaking_rate_wpm if is_measured else None,
            "is_wpm_measured": is_measured,
            "difficulty": (r.difficulty or "intermediate").capitalize(),
            "task_type": r.task_type or "sentence_reading",
            "duration_seconds": r.duration_seconds
        })

    return SpeakingStatsResponse(
        total_attempts=total_attempts,
        average_accuracy=avg_acc,
        average_wpm=avg_wpm,
        best_accuracy=best_acc,
        attempts_by_difficulty=diff_counts,
        recent_trend=recent
    )
