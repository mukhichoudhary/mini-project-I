"""
Password Reset Management Service for Bhasa_AI
Features:
- Cryptographically secure single-use time-limited tokens (secrets.token_urlsafe).
- Salted SHA-256 token hashing in SQLite (raw token is never stored).
- Strict invalidation upon consumption or expiration.
- Zero account enumeration (consistent response for registered and unregistered emails).
- Rate limiting to prevent abuse.
- Honest handling of unconfigured SMTP and delivery transport failures.
"""

import os
import time
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user import User, PasswordResetToken
from app.services.email_service import EmailService
from app.auth.security import hash_password
from app.config import PASSWORD_RESET_SALT, PASSWORD_RESET_EXPIRY_MINUTES

class PasswordResetService:
    EXPIRY_MINUTES = PASSWORD_RESET_EXPIRY_MINUTES
    MAX_REQUESTS_PER_15_MIN = 3
    MAX_REQUESTS_PER_HOUR = 5

    @classmethod
    def hash_token(cls, raw_token: str) -> str:
        """Hash the raw reset token with SHA-256 and an application salt."""
        hasher = hashlib.sha256()
        hasher.update(f"{PASSWORD_RESET_SALT}:{raw_token.strip()}".encode("utf-8"))
        return hasher.hexdigest()

    @classmethod
    def check_rate_limit(cls, db: Session, email: str) -> Tuple[bool, str]:
        """
        Enforce rate limits per email:
        - Max 3 requests per 15 minutes.
        - Max 5 requests per hour.
        """
        now = datetime.utcnow()
        fifteen_min_ago = now - timedelta(minutes=15)
        one_hour_ago = now - timedelta(hours=1)

        recent_15m = db.query(PasswordResetToken).filter(
            PasswordResetToken.email == email.lower().strip(),
            PasswordResetToken.created_at >= fifteen_min_ago
        ).count()

        if recent_15m >= cls.MAX_REQUESTS_PER_15_MIN:
            return (False, "Too many password reset attempts for this email. Please wait 15 minutes before trying again.")

        recent_1h = db.query(PasswordResetToken).filter(
            PasswordResetToken.email == email.lower().strip(),
            PasswordResetToken.created_at >= one_hour_ago
        ).count()

        if recent_1h >= cls.MAX_REQUESTS_PER_HOUR:
            return (False, "Hourly password reset limit reached for this email. Please try again later.")

        return (True, "")

    @classmethod
    def request_password_reset(
        cls,
        db: Session,
        email: str,
        ip_address: Optional[str] = "127.0.0.1",
        base_url: Optional[str] = None
    ) -> dict:
        """
        Initiates the password recovery flow:
        1. Checks SMTP service readiness.
        2. Applies rate limiting.
        3. Looks up user account without exposing existence.
        4. If account exists: generates single-use token, saves hash, sends email via Gmail SMTP.
        5. If mail dispatch fails, honestly reports delivery error.
        6. Returns consistent public response for registered and unregistered accounts.
        """
        norm_email = email.lower().strip()

        # Check rate limit first
        allowed, limit_msg = cls.check_rate_limit(db, norm_email)
        if not allowed:
            return {
                "status": "rate_limited",
                "message": limit_msg,
                "http_status": 429
            }

        # Check if email service is configured
        if not EmailService.is_configured():
            return {
                "status": "unavailable",
                "message": "Automated email password recovery is currently not configured on this server. Please contact your platform administrator at support@bhasha.ai or your course instructor to assist with your account.",
                "http_status": 200
            }

        user = db.query(User).filter(User.email == norm_email).first()

        if user:
            # Generate a cryptographically strong 32-byte URL-safe token (approx 43 chars)
            raw_token = secrets.token_urlsafe(32)
            token_hash = cls.hash_token(raw_token)
            now = datetime.utcnow()
            expires_at = now + timedelta(minutes=cls.EXPIRY_MINUTES)

            # Invalidate any existing active tokens for this user
            existing_tokens = db.query(PasswordResetToken).filter(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used == False,
                PasswordResetToken.expires_at > now
            ).all()
            for old_token in existing_tokens:
                old_token.used = True
                old_token.used_at = now

            # Save new hashed token to database
            reset_record = PasswordResetToken(
                user_id=user.id,
                email=norm_email,
                token_hash=token_hash,
                expires_at=expires_at,
                used=False,
                ip_address=ip_address,
                created_at=now
            )
            db.add(reset_record)
            db.commit()
            db.refresh(reset_record)

            # Build full reset URL
            client_base = base_url or os.getenv("APP_BASE_URL", "http://localhost:8000")
            reset_url = f"{client_base}/reset-password.html?token={raw_token}"

            # Dispatch real email via Gmail SMTP
            delivery_res = EmailService.send_password_reset_email(
                to_email=user.email,
                reset_url=reset_url,
                recipient_name=user.full_name or "Scholar",
                expires_minutes=cls.EXPIRY_MINUTES
            )

            # Handle delivery failure honestly
            if not delivery_res.get("success"):
                # Invalidate the token because delivery failed
                reset_record.used = True
                reset_record.used_at = now
                db.commit()

                return {
                    "status": "error",
                    "message": f"Failed to deliver password reset email: {delivery_res.get('error')}. Please contact support.",
                    "http_status": 502
                }

        else:
            # Unregistered address: simulate realistic timing to prevent side-channel enumeration
            time.sleep(0.12)

        # Consistent public response for registered and unregistered addresses
        return {
            "status": "success",
            "message": "If an account is associated with this email address, password reset instructions have been sent to your inbox.",
            "http_status": 200
        }

    @classmethod
    def verify_reset_token(cls, db: Session, raw_token: str) -> dict:
        """
        Verify that a reset token exists, matches its hash, has not been used, and is not expired.
        """
        if not raw_token or len(raw_token.strip()) < 10:
            return {
                "valid": False,
                "message": "Invalid password reset token format."
            }

        token_hash = cls.hash_token(raw_token)
        now = datetime.utcnow()

        record = db.query(PasswordResetToken).filter(
            PasswordResetToken.token_hash == token_hash
        ).first()

        if not record:
            return {
                "valid": False,
                "message": "Invalid password reset token. The link may be malformed or invalid."
            }

        if record.used:
            return {
                "valid": False,
                "message": "This password reset token has already been used. Please request a new password reset link."
            }

        if record.expires_at < now:
            return {
                "valid": False,
                "message": "This password reset token has expired. Please request a fresh password reset link."
            }

        # Mask email for safe confirmation display (e.g., j***e@example.com)
        parts = record.email.split("@")
        if len(parts) == 2:
            name_part, domain = parts
            masked_name = name_part[0] + "***" + (name_part[-1] if len(name_part) > 1 else "")
            masked_email = f"{masked_name}@{domain}"
        else:
            masked_email = record.email

        return {
            "valid": True,
            "email": masked_email,
            "message": "Reset token is valid."
        }

    @classmethod
    def reset_password(cls, db: Session, raw_token: str, new_password: str) -> dict:
        """
        Validates token and updates user password with a secure bcrypt hash.
        Marks token as consumed immediately upon completion.
        """
        if not new_password or len(new_password) < 6:
            return {
                "success": False,
                "error": "Password must be at least 6 characters long.",
                "http_status": 400
            }

        token_hash = cls.hash_token(raw_token)
        now = datetime.utcnow()

        record = db.query(PasswordResetToken).filter(
            PasswordResetToken.token_hash == token_hash
        ).first()

        if not record:
            return {
                "success": False,
                "error": "Invalid password reset token.",
                "http_status": 400
            }

        if record.used:
            return {
                "success": False,
                "error": "This password reset token has already been used.",
                "http_status": 400
            }

        if record.expires_at < now:
            return {
                "success": False,
                "error": "This password reset token has expired. Please request a fresh reset link.",
                "http_status": 400
            }

        user = db.query(User).filter(User.id == record.user_id).first()
        if not user:
            return {
                "success": False,
                "error": "Associated user account was not found.",
                "http_status": 404
            }

        # Update password with bcrypt hash
        user.hashed_password = hash_password(new_password)

        # Invalidate the consumed token immediately
        record.used = True
        record.used_at = now

        db.commit()
        db.refresh(user)

        return {
            "success": True,
            "message": "Your password has been successfully updated. You may now sign in with your new password.",
            "http_status": 200
        }
