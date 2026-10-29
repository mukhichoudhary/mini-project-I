from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserProfile
from app.schemas.user import (
    UserRegister, UserLogin, TokenResponse, UserProfileResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse, VerifyResetTokenResponse
)
from app.auth.security import hash_password, verify_password, create_access_token, get_current_user
from app.services.email_service import EmailService
from app.services.password_reset_service import PasswordResetService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def format_profile_response(user: User, profile: UserProfile) -> UserProfileResponse:
    return UserProfileResponse(
        id=profile.id,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        chosen_language=profile.chosen_language,
        daily_goal=profile.daily_goal,
        total_xp=profile.total_xp,
        streak_days=profile.streak_days,
        current_level=profile.current_level,
        rank_tier=profile.rank_tier,
        role=user.role
    )

def normalize_subject_str(subject: str) -> str:
    if not subject:
        return "Python"
    s = subject.strip()
    s_lower = s.lower()
    if s_lower == "python":
        return "Python"
    elif s_lower == "java":
        return "Java"
    elif s_lower in ("c++", "cpp"):
        return "C++"
    elif s_lower == "english":
        return "English"
    return s[0].upper() + s[1:] if len(s) > 1 else s.upper()

@router.post("/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new learner in Bhasha_AI."""
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create new user
    new_user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role="learner"
    )
    db.add(new_user)
    db.flush()

    # Create associated profile
    new_profile = UserProfile(
        user_id=new_user.id,
        chosen_language=normalize_subject_str(payload.chosen_language) if payload.chosen_language else "Python",
        daily_goal=payload.daily_goal or 15,
        total_xp=100,  # Welcome bonus XP
        streak_days=1,
        current_level=1,
        rank_tier="Stage 1 • Fundamentals"
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_user)
    db.refresh(new_profile)

    # Issue token
    access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=format_profile_response(new_user, new_profile)
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate an existing learner and return JWT session."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please try again."
        )

    # Ensure profile exists
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=format_profile_response(user, profile)
    )

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve current logged-in user profile."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return format_profile_response(current_user, profile)

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    """
    Handle password recovery securely:
    - Enforces rate limiting per email.
    - Honest SMTP configuration and error handling.
    - Zero user enumeration (consistent public response for registered and unregistered accounts).
    - Single-use, time-limited token with salted SHA-256 hash stored in DB.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    base_url = str(request.base_url).rstrip("/")

    res = PasswordResetService.request_password_reset(
        db=db,
        email=payload.email,
        ip_address=client_ip,
        base_url=base_url
    )

    if res.get("http_status") and res["http_status"] != 200:
        raise HTTPException(
            status_code=res["http_status"],
            detail=res["message"]
        )

    return ForgotPasswordResponse(
        status=res["status"],
        message=res["message"]
    )

@router.get("/verify-reset-token", response_model=VerifyResetTokenResponse)
def verify_reset_token(token: str, db: Session = Depends(get_db)):
    """Validate a password reset token before displaying the reset password interface."""
    res = PasswordResetService.verify_reset_token(db, token)
    return VerifyResetTokenResponse(
        valid=res["valid"],
        email=res.get("email"),
        message=res.get("message")
    )

@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Complete password reset with validated single-use token:
    - Validates token against SQLite hash.
    - Checks expiration and single-use status.
    - Securely updates password with bcrypt hash.
    - Invalidates token immediately.
    """
    res = PasswordResetService.reset_password(
        db=db,
        raw_token=payload.token,
        new_password=payload.new_password
    )

    if not res["success"]:
        raise HTTPException(
            status_code=res.get("http_status", status.HTTP_400_BAD_REQUEST),
            detail=res["error"]
        )

    return ResetPasswordResponse(
        status="success",
        message=res["message"]
    )

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.services.otp_service import OTPService

class SendOTPRequest(BaseModel):
    email: str
    name: Optional[str] = "Scholar"

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str
    temp_token: Optional[str] = None

class ResendOTPRequest(BaseModel):
    email: str
    name: Optional[str] = "Scholar"


@router.get("/config")
def get_auth_config():
    """Expose platform auth config to frontend SDK."""
    return {
        "platform_name": "AI-Based Natural & Programming Language Proficiency System",
        "otp_expiry_minutes": OTPService.EXPIRY_MINUTES,
        "max_attempts": OTPService.MAX_ATTEMPTS
    }




@router.post("/send-otp")
def send_otp(payload: SendOTPRequest, db: Session = Depends(get_db)):
    """Generate and dispatch an email OTP with rate-limiting."""
    otp_res = OTPService.create_and_send_otp(db, payload.email, recipient_name=payload.name or "Scholar")
    if not otp_res["success"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=otp_res["error"]
        )
    return {
        "status": "otp_sent",
        "message": f"Verification code dispatched to {payload.email}.",
        "email": payload.email,
        "expires_in_seconds": otp_res["expires_in_seconds"]
    }


@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Step 2 of Authentication:
    1. Verify 6-digit OTP against hashed record in SQLite.
    2. Enforce 5-minute expiry and maximum 5 verification attempts.
    3. If valid:
       - Create or update user in `users` table
       - Set `email_verified = True`
       - Update `last_login = datetime.utcnow()`
       - Issue full session JWT access token
    4. If invalid: Return error with remaining attempts count.
    """
    ver_res = OTPService.verify_otp(db, payload.email, payload.otp)
    if not ver_res["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ver_res["error"]
        )

    email = payload.email.lower().strip()
    now = datetime.utcnow()

    # Find or create user
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # First-time registration
        user = User(
            email=email,
            full_name=email.split("@")[0],
            role="learner",
            email_verified=True,
            created_at=now,
            last_login=now
        )
        db.add(user)
        db.flush()

        # Initialize student profile
        profile = UserProfile(
            user_id=user.id,
            chosen_language="Python",
            daily_goal=15,
            total_xp=100,
            streak_days=1,
            current_level=1,
            rank_tier="Stage 1 • Fundamentals"
        )
        db.add(profile)
        db.commit()
        db.refresh(user)
        db.refresh(profile)
    else:
        # Existing user: update verification and last_login
        user.email_verified = True
        user.last_login = now
        db.commit()
        db.refresh(user)

        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if not profile:
            profile = UserProfile(user_id=user.id)
            db.add(profile)
            db.commit()
            db.refresh(profile)

    # Issue authenticated JWT session token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return {
        "status": "success",
        "message": "OTP verification successful. Welcome to LingoX!",
        "access_token": access_token,
        "token_type": "bearer",
        "user": format_profile_response(user, profile)
    }


@router.post("/resend-otp")
def resend_otp(payload: ResendOTPRequest, db: Session = Depends(get_db)):
    """Resend a new 6-digit OTP, enforcing maximum 3 requests per hour limit."""
    otp_res = OTPService.create_and_send_otp(db, payload.email, recipient_name=payload.name or "Scholar")
    if not otp_res["success"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=otp_res["error"]
        )

    return {
        "status": "otp_resent",
        "message": f"Fresh verification code dispatched to {payload.email}.",
        "email": payload.email,
        "expires_in_seconds": otp_res["expires_in_seconds"],
        "remaining_resends": otp_res["remaining_resends"]
    }


@router.post("/logout")
def logout():
    """Client session logout endpoint."""
    return {
        "status": "success",
        "message": "Signed out successfully."
    }

# Direct /auth router alias matching user specification
router_direct = APIRouter(prefix="/auth", tags=["Authentication Direct"])
router_direct.add_api_route("/config", get_auth_config, methods=["GET"])
router_direct.add_api_route("/send-otp", send_otp, methods=["POST"])
router_direct.add_api_route("/verify-otp", verify_otp, methods=["POST"])
router_direct.add_api_route("/resend-otp", resend_otp, methods=["POST"])
router_direct.add_api_route("/logout", logout, methods=["POST"])
router_direct.add_api_route("/login", login, methods=["POST"])
router_direct.add_api_route("/register", register, methods=["POST"])
router_direct.add_api_route("/me", get_me, methods=["GET"])
router_direct.add_api_route("/forgot-password", forgot_password, methods=["POST"])
router_direct.add_api_route("/verify-reset-token", verify_reset_token, methods=["GET"])
router_direct.add_api_route("/reset-password", reset_password, methods=["POST"])


