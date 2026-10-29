"""
OTP Generation, Hashing, Validation, and Rate-Limiting Service
Enforces strict 5-minute expiry, max 5 verification attempts, and max 3 resends/hour.
"""

import hashlib
import os
import secrets
from datetime import datetime, timedelta
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user import OTPCode
from app.services.email_service import EmailService

# Global salt for OTP hashing
OTP_SALT = os.getenv("OTP_SECRET_SALT", "lingox_otp_salt_super_secure_2026")

class OTPService:
    EXPIRY_MINUTES = 5
    MAX_ATTEMPTS = 5
    MAX_HOURLY_RESENDS = 3

    @staticmethod
    def generate_digit_otp() -> str:
        """Generate a cryptographically secure 6-digit numerical OTP."""
        # Generates numbers from 100000 to 999999 inclusive
        return f"{secrets.SystemRandom().randint(100000, 999999)}"

    @staticmethod
    def hash_otp(otp_code: str) -> str:
        """Hash the OTP code using SHA-256 with an application secret salt."""
        hasher = hashlib.sha256()
        hasher.update(f"{OTP_SALT}:{otp_code.strip()}".encode("utf-8"))
        return hasher.hexdigest()

    @classmethod
    def check_resend_rate_limit(cls, db: Session, email: str) -> Tuple[bool, int]:
        """
        Check if the email has exceeded the maximum 3 resend requests in the last hour.
        Returns (is_allowed, remaining_resends).
        """
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        recent_count = db.query(OTPCode).filter(
            OTPCode.email == email.lower().strip(),
            OTPCode.created_at >= one_hour_ago
        ).count()

        remaining = max(0, cls.MAX_HOURLY_RESENDS - recent_count)
        return (recent_count < cls.MAX_HOURLY_RESENDS, remaining)

    @classmethod
    def create_and_send_otp(cls, db: Session, email: str, recipient_name: str = "Scholar") -> dict:
        """
        Generate, store hashed OTP with 5-minute expiry, and dispatch email.
        Enforces maximum 3 resends per hour rate-limit.
        """
        norm_email = email.lower().strip()

        # 1. Check rate limit
        allowed, remaining = cls.check_resend_rate_limit(db, norm_email)
        if not allowed:
            return {
                "success": False,
                "error": "Rate limit exceeded: Maximum 3 OTP requests allowed per hour. Please wait.",
                "remaining_resends": 0
            }

        # 2. Invalidate any existing active OTPs for this email to prevent reuse
        existing_otps = db.query(OTPCode).filter(
            OTPCode.email == norm_email,
            OTPCode.expires_at > datetime.utcnow()
        ).all()
        for old_otp in existing_otps:
            old_otp.expires_at = datetime.utcnow() - timedelta(seconds=1)

        # 3. Generate raw 6-digit code and calculate hash
        raw_code = cls.generate_digit_otp()
        hashed_code = cls.hash_otp(raw_code)
        expires_at = datetime.utcnow() + timedelta(minutes=cls.EXPIRY_MINUTES)

        # 4. Save to database
        otp_record = OTPCode(
            email=norm_email,
            otp_code=hashed_code,
            expires_at=expires_at,
            attempts=0,
            created_at=datetime.utcnow()
        )
        db.add(otp_record)
        db.commit()
        db.refresh(otp_record)

        # 5. Send Email
        delivery_res = EmailService.send_otp_email(
            to_email=norm_email,
            otp_code=raw_code,
            recipient_name=recipient_name
        )

        return {
            "success": True,
            "email": norm_email,
            "expires_in_seconds": cls.EXPIRY_MINUTES * 60,
            "remaining_resends": remaining - 1,
            "delivery": delivery_res,
            "dev_otp_preview": delivery_res.get("dev_otp_preview")
        }

    @classmethod
    def verify_otp(cls, db: Session, email: str, user_otp: str) -> dict:
        """
        Verify user-submitted OTP against stored hash in SQLite.
        Checks:
        - Exists
        - Expiration (5 mins)
        - Max attempts (<= 5)
        - Hash match
        """
        norm_email = email.lower().strip()
        clean_otp = user_otp.strip().replace(" ", "")

        now = datetime.utcnow()

        # Fetch latest OTP record for this email
        otp_record = db.query(OTPCode).filter(
            OTPCode.email == norm_email
        ).order_by(desc(OTPCode.created_at)).first()

        if not otp_record:
            return {
                "valid": False,
                "error": "No verification code was requested for this email. Please request a new OTP."
            }

        # Check if expired
        if otp_record.expires_at < now:
            return {
                "valid": False,
                "error": "This verification code has expired (5-minute limit). Please request a new code.",
                "expired": True
            }

        # Check maximum attempts lockout
        if otp_record.attempts >= cls.MAX_ATTEMPTS:
            return {
                "valid": False,
                "error": "Maximum verification attempts (5) exceeded. This code has been locked. Please request a new OTP.",
                "locked": True
            }

        # Compare hash
        submitted_hash = cls.hash_otp(clean_otp)

        if submitted_hash != otp_record.otp_code:
            # Increment attempts on failure
            otp_record.attempts += 1
            db.commit()
            db.refresh(otp_record)

            remaining_attempts = max(0, cls.MAX_ATTEMPTS - otp_record.attempts)
            if remaining_attempts == 0:
                # Invalidate immediately
                otp_record.expires_at = now - timedelta(seconds=1)
                db.commit()
                return {
                    "valid": False,
                    "error": "Maximum 5 verification attempts exceeded. Code has been invalidated. Please request a new OTP.",
                    "locked": True,
                    "remaining_attempts": 0
                }

            return {
                "valid": False,
                "error": f"Invalid verification code. {remaining_attempts} attempt{'s' if remaining_attempts != 1 else ''} remaining.",
                "remaining_attempts": remaining_attempts
            }

        # OTP is valid! Invalidate so it cannot be reused
        otp_record.expires_at = now - timedelta(seconds=1)
        db.commit()

        return {
            "valid": True,
            "email": norm_email
        }
