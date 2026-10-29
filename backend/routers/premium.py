"""
FastAPI Router: Screen Time Tracking & Earnable Premium Membership
AI-Based Natural & Programming Language Proficiency System (LingoX)

Endpoints:
- POST /screen-time/start
- POST /screen-time/update
- POST /screen-time/end
- GET /premium/status
- GET /premium/history
"""

import json
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.auth.security import get_optional_user
from app.services.premium_service import PremiumService

# Create router instances for both prefixing strategies
router = APIRouter(prefix="/api", tags=["Premium & Screen Time API"])
router_direct = APIRouter(tags=["Premium & Screen Time Direct"])

# Pydantic Schemas
class ScreenTimeStartRequest(BaseModel):
    page_name: str = Field(default="lesson", description="Name or route of the learning activity")
    user_id: Optional[int] = Field(default=None, description="Optional user ID fallback if unauthenticated")

class ScreenTimeUpdateRequest(BaseModel):
    session_id: Optional[int] = Field(default=None, description="Active session ID from /screen-time/start")
    active_seconds: float = Field(default=30.0, ge=0.0, le=120.0, description="Verified active seconds in this heartbeat")
    page_name: Optional[str] = Field(default="learning", description="Activity name")
    user_id: Optional[int] = Field(default=None, description="Optional user ID fallback")

class ScreenTimeEndRequest(BaseModel):
    session_id: int = Field(description="Session ID to end")
    user_id: Optional[int] = Field(default=None, description="Optional user ID fallback")


def resolve_user(
    db: Session,
    auth_user: Optional[User],
    fallback_user_id: Optional[int] = None
) -> User:
    """Helper to resolve the target user from Bearer JWT or fallback user ID."""
    if auth_user:
        return auth_user
    if fallback_user_id:
        user = db.query(User).filter(User.id == fallback_user_id).first()
        if user:
            return user
    # Fallback to first available learner/scholar for local dev convenience
    user = db.query(User).first()
    if user:
        return user
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required to record screen time."
    )


# =========================================================
# ENDPOINTS IMPLEMENTATION
# =========================================================

def handle_start(payload: ScreenTimeStartRequest, db: Session, auth_user: Optional[User]):
    user = resolve_user(db, auth_user, payload.user_id)
    return PremiumService.start_session(db, user.id, payload.page_name)

async def handle_update(request: Request, db: Session, auth_user: Optional[User]):
    try:
        raw_body = await request.body()
        if raw_body:
            data = json.loads(raw_body.decode("utf-8"))
        else:
            data = {}
    except Exception:
        data = {}

    session_id = data.get("session_id")
    try:
        active_seconds = float(data.get("active_seconds", 30.0))
    except (TypeError, ValueError):
        active_seconds = 30.0

    page_name = str(data.get("page_name") or "learning")
    user_id = data.get("user_id")

    user = resolve_user(db, auth_user, user_id)
    return PremiumService.update_screen_time(
        db=db,
        user_id=user.id,
        active_seconds=active_seconds,
        session_id=session_id,
        page_name=page_name
    )

def handle_end(payload: ScreenTimeEndRequest, db: Session, auth_user: Optional[User]):
    user = resolve_user(db, auth_user, payload.user_id)
    return PremiumService.end_session(db, user.id, payload.session_id)

def handle_status(user_id: Optional[int], db: Session, auth_user: Optional[User]):
    user = resolve_user(db, auth_user, user_id)
    return PremiumService.get_premium_status(db, user.id)

def handle_history(user_id: Optional[int], db: Session, auth_user: Optional[User]):
    user = resolve_user(db, auth_user, user_id)
    return PremiumService.get_premium_history(db, user.id)


# =========================================================
# ROUTE DEFINITIONS FOR ROOT PATHS (/screen-time, /premium)
# =========================================================

@router_direct.post("/screen-time/start")
def start_screen_time_direct(
    payload: ScreenTimeStartRequest,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_optional_user)
):
    return handle_start(payload, db, auth_user)

@router_direct.post("/screen-time/update")
async def update_screen_time_direct(
    request: Request,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_optional_user)
):
    return await handle_update(request, db, auth_user)

@router_direct.post("/screen-time/end")
def end_screen_time_direct(
    payload: ScreenTimeEndRequest,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_optional_user)
):
    return handle_end(payload, db, auth_user)

@router_direct.get("/premium/status")
def get_premium_status_direct(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_optional_user)
):
    return handle_status(user_id, db, auth_user)

@router_direct.get("/premium/history")
def get_premium_history_direct(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_optional_user)
):
    return handle_history(user_id, db, auth_user)


# =========================================================
# ROUTE DEFINITIONS FOR PREFIXED API PATHS (/api/screen-time, /api/premium)
# =========================================================

@router.post("/screen-time/start")
def start_screen_time_api(
    payload: ScreenTimeStartRequest,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_optional_user)
):
    return handle_start(payload, db, auth_user)

@router.post("/screen-time/update")
async def update_screen_time_api(
    request: Request,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_optional_user)
):
    return await handle_update(request, db, auth_user)

@router.post("/screen-time/end")
def end_screen_time_api(
    payload: ScreenTimeEndRequest,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_optional_user)
):
    return handle_end(payload, db, auth_user)

@router.get("/premium/status")
def get_premium_status_api(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_optional_user)
):
    return handle_status(user_id, db, auth_user)

@router.get("/premium/history")
def get_premium_history_api(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    auth_user: Optional[User] = Depends(get_optional_user)
):
    return handle_history(user_id, db, auth_user)
