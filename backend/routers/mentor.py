import asyncio
import logging
from typing import List, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.mentor import MentorMessage
from app.schemas.mentor import (
    MentorChatRequest,
    MentorChatResponse,
    MentorMessageItem,
    MentorStatusResponse,
)
from app.auth.security import get_optional_user
from app.config import GEMINI_API_KEY, GEMINI_MODEL
from app.services.tutor_engine import generate_patient_tutor_reply, normalize_subject

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/mentor", tags=["AI Mentor"])


def build_system_instruction(subject: str) -> str:
    """
    Builds structured, pedagogically tailored system instructions ensuring the AI model
    behaves as a patient, beginner-friendly tutor strictly aligned with the selected subject.
    """
    norm_sub = normalize_subject(subject)

    if norm_sub == "English":
        track_instruction = (
            "The learner's current Active Learning Focus is TECHNICAL ENGLISH. "
            "Focus on English communication, vocabulary, grammar, pronunciation, code review phrasing, and documentation. "
            "Explain linguistic concepts clearly with sentence examples. "
            "CRITICAL REQUIREMENT: DO NOT provide programming code unless the user explicitly requests code in a programming language."
        )
    elif norm_sub == "Java":
        track_instruction = (
            "The learner's current Active Learning Focus is JAVA FUNDAMENTALS. "
            "All programming explanations and code examples MUST be provided in Java. "
            "Explain core OOP principles (Encapsulation, Inheritance, Polymorphism, Abstraction) and standard Java conventions."
        )
    elif norm_sub == "Python":
        track_instruction = (
            "The learner's current Active Learning Focus is PYTHON MASTERCLASS. "
            "All programming explanations and code examples MUST be provided in Python. "
            "Emphasize clean, readable, Pythonic code and standard idioms."
        )
    elif norm_sub == "C++":
        track_instruction = (
            "The learner's current Active Learning Focus is C++ SYSTEMS. "
            "All programming explanations and code examples MUST be provided in modern C++. "
            "Focus on memory management, pointers, references, RAII, and systems performance."
        )
    else:
        track_instruction = (
            "The learner's current Active Learning Focus is GENERAL CONCEPTS. "
            "Explain computer science fundamentals, data structures, algorithms, databases (DBMS), and system architecture. "
            "Do not force a specific programming language unless requested by the learner."
        )

    return (
        "You are the Bhasa_AI Natural Code Mentor, a patient, encouraging, and beginner-friendly educator.\n\n"
        f"{track_instruction}\n\n"
        "Core Teaching Principles:\n"
        "1. Directly answer the user's actual question first before adding deeper explanations.\n"
        "2. Explain concepts in beginner-friendly, plain language with clear steps and practical analogies.\n"
        "3. For programming questions, provide correct code, explain important lines, and show expected output.\n"
        "4. For debugging questions, identify the likely root cause, explain why it occurs, and provide corrected code or specific troubleshooting steps.\n"
        "5. For practice requests, generate relevant exercises with clear instructions and progressive difficulty.\n"
        "6. Maintain conversational context so follow-up inquiries refer to previous discussion turns.\n"
        "7. Keep formatting clear with Markdown headings, lists, and formatted code blocks."
    )


async def call_gemini_api(
    api_key: str,
    subject: str,
    user_message: str,
    history_records: List[MentorMessage],
    model_name: str = GEMINI_MODEL
) -> Optional[str]:
    """
    Dispatches request to Google Gemini API REST endpoint using modern active models.
    """
    system_instruction = build_system_instruction(subject)

    # Modern Gemini candidate models to try in order
    candidates = [model_name, "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-2.5-flash"]
    seen = set()
    models_to_try = []
    for m in candidates:
        if m and m not in seen:
            seen.add(m)
            models_to_try.append(m)

    # Prepare conversation history turns
    contents_rest = []
    for h in history_records[-4:]:
        role = "user" if h.role == "user" else "model"
        contents_rest.append({"role": role, "parts": [{"text": h.content}]})

    contents_rest.append({"role": "user", "parts": [{"text": user_message}]})

    last_error = None
    for target_model in models_to_try:
        try:
            rest_url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"
            payload = {
                "systemInstruction": {"parts": [{"text": system_instruction}]},
                "contents": contents_rest,
                "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1200}
            }
            async with httpx.AsyncClient(timeout=14.0) as http_client:
                resp = await http_client.post(rest_url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates_data = data.get("candidates", [])
                    if candidates_data and "content" in candidates_data[0]:
                        parts = candidates_data[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            text = parts[0]["text"].strip()
                            if text:
                                return text
                else:
                    err_snippet = resp.text[:140]
                    last_error = f"Model {target_model} HTTP {resp.status_code}: {err_snippet}"
                    logger.warning(f"REST attempt with {target_model} failed ({resp.status_code}): {err_snippet}")
        except Exception as rest_err:
            last_error = f"Model {target_model} Exception: {str(rest_err)}"
            logger.warning(f"REST attempt with {target_model} error: {rest_err}")

    logger.warning(f"All Gemini model candidate attempts failed. Last error: {last_error}")
    return None


@router.get("/status", response_model=MentorStatusResponse)
def get_mentor_status():
    """Returns the operational status of Google Gemini API connection."""
    configured = bool(GEMINI_API_KEY and len(GEMINI_API_KEY.strip()) > 5)
    return MentorStatusResponse(
        gemini_configured=configured,
        model=GEMINI_MODEL,
        status="active" if configured else "fallback_mode",
        message="Google Gemini API is configured and operational."
        if configured
        else "No GEMINI_API_KEY found in server environment or .env. Running on local Academic Knowledge Engine."
    )


@router.post("/chat", response_model=MentorChatResponse)
async def chat(
    payload: MentorChatRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    target_subject = normalize_subject(payload.subject)

    # Fetch recent conversation context strictly isolated to user (or guest session) AND chosen subject
    history_records = []
    if user_id:
        history_records = (
            db.query(MentorMessage)
            .filter(
                MentorMessage.user_id == user_id,
                func.lower(MentorMessage.subject) == func.lower(target_subject)
            )
            .order_by(MentorMessage.created_at.desc())
            .limit(6)
            .all()
        )
        history_records.reverse()
    else:
        history_records = (
            db.query(MentorMessage)
            .filter(
                MentorMessage.user_id.is_(None),
                func.lower(MentorMessage.subject) == func.lower(target_subject)
            )
            .order_by(MentorMessage.created_at.desc())
            .limit(6)
            .all()
        )
        history_records.reverse()

    # Save user message to database
    user_msg = MentorMessage(
        user_id=user_id,
        subject=target_subject,
        role="user",
        content=payload.message
    )
    db.add(user_msg)
    db.commit()

    effective_api_key = GEMINI_API_KEY.strip() if GEMINI_API_KEY else ""
    bot_reply = None
    source = "offline_tutor"

    if effective_api_key:
        try:
            gemini_reply = await call_gemini_api(
                api_key=effective_api_key,
                subject=target_subject,
                user_message=payload.message,
                history_records=history_records,
                model_name=GEMINI_MODEL
            )
            if gemini_reply:
                bot_reply = gemini_reply
                source = "google_gemini"
            else:
                # Requirement: If AI provider fails, times out, or returns empty response,
                # show clear error instead of pretending request succeeded.
                logger.error("Configured Gemini API failed to respond across all model candidates.")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="The AI provider (Google Gemini) failed to return a response or timed out. Please retry."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Unexpected error invoking Gemini API")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI provider communication error: {str(e)}. Please retry."
            )

    # Honest fallback when Gemini is not configured
    if not bot_reply:
        bot_reply = generate_patient_tutor_reply(target_subject, payload.message, history_records)
        source = "offline_tutor"

    # Persist assistant reply to database
    bot_msg = MentorMessage(
        user_id=user_id,
        subject=target_subject,
        role="assistant",
        content=bot_reply
    )
    db.add(bot_msg)
    db.commit()

    return MentorChatResponse(
        reply=bot_reply,
        subject=target_subject,
        source=source,
        action_suggestion=f"Explore related {target_subject} challenges in your Roadmap"
    )


@router.get("/history", response_model=List[MentorMessageItem])
def get_history(
    subject: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Retrieve chat history isolated to the authenticated user and specified subject."""
    if not current_user:
        return []

    query = db.query(MentorMessage).filter(MentorMessage.user_id == current_user.id)
    if subject and subject.strip():
        norm_subj = normalize_subject(subject)
        query = query.filter(func.lower(MentorMessage.subject) == func.lower(norm_subj))
    return query.order_by(MentorMessage.created_at.asc()).limit(50).all()


@router.delete("/history")
def clear_history(
    subject: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Clear chat history for the authenticated user, optionally isolated to a single subject."""
    if current_user:
        q = db.query(MentorMessage).filter(MentorMessage.user_id == current_user.id)
        if subject and subject.strip():
            norm_subj = normalize_subject(subject)
            q = q.filter(func.lower(MentorMessage.subject) == func.lower(norm_subj))
        q.delete(synchronize_session=False)
        db.commit()
    return {"status": "success", "message": "Chat history cleared."}
