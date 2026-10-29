"""
Earnable Premium Membership Service
AI-Based Natural & Programming Language Proficiency System (LingoX)

Core Rule:
Every 200 minutes of verified active learning screen time = 1 day (24 hours) of Premium Membership.
Repeats automatically and indefinitely; unused minutes roll over.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.user import User, ScreenTimeLog, PremiumHistory

class PremiumService:
    REWARD_THRESHOLD_MINUTES = 200.0
    DAY_SECONDS = 86400

    @classmethod
    def start_session(cls, db: Session, user_id: int, page_name: str) -> Dict[str, Any]:
        """Initialize a new active screen-time tracking session."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        log = ScreenTimeLog(
            user_id=user.id,
            page_name=page_name[:100] if page_name else "workspace",
            session_start=datetime.utcnow(),
            active_minutes=0.0
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return {
            "session_id": log.id,
            "page_name": log.page_name,
            "session_start": log.session_start.isoformat()
        }

    @classmethod
    def update_screen_time(
        cls,
        db: Session,
        user_id: int,
        active_seconds: float,
        session_id: Optional[int] = None,
        page_name: Optional[str] = "learning"
    ) -> Dict[str, Any]:
        """
        Record verified active seconds (capped to prevent manipulation),
        increment user total and available minutes, and auto-reward Premium days
        whenever available minutes reach or exceed 200.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Sanitize active seconds (max 120s per heartbeat interval to prevent spoofing)
        clean_seconds = max(0.0, min(float(active_seconds), 120.0))
        delta_minutes = clean_seconds / 60.0

        # Initialize nullable columns if needed
        if user.total_screen_minutes is None:
            user.total_screen_minutes = 0.0
        if user.available_reward_minutes is None:
            user.available_reward_minutes = 0.0

        user.total_screen_minutes += delta_minutes
        user.available_reward_minutes += delta_minutes

        # Update or create session log
        now = datetime.utcnow()
        if session_id:
            log = db.query(ScreenTimeLog).filter(
                ScreenTimeLog.id == session_id,
                ScreenTimeLog.user_id == user.id
            ).first()
            if log:
                log.active_minutes = (log.active_minutes or 0.0) + delta_minutes
                log.session_end = now
        else:
            log = ScreenTimeLog(
                user_id=user.id,
                page_name=page_name or "active_session",
                session_start=now - timedelta(seconds=clean_seconds),
                session_end=now,
                active_minutes=delta_minutes
            )
            db.add(log)

        # REWARD ALGORITHM: Every 200 minutes = 1 day (24 hours) of Premium Membership
        reward_info = None
        earned_days = int(user.available_reward_minutes // cls.REWARD_THRESHOLD_MINUTES)

        if earned_days > 0:
            minutes_spent = earned_days * cls.REWARD_THRESHOLD_MINUTES
            user.available_reward_minutes -= minutes_spent

            # Extension logic: if already active, extend from current expiry; otherwise extend from now
            base_time = user.premium_until if (user.premium_until and user.premium_until > now) else now
            new_expiry = base_time + timedelta(days=earned_days)
            user.premium_until = new_expiry

            # Record in audit history
            history = PremiumHistory(
                user_id=user.id,
                minutes_spent=minutes_spent,
                days_rewarded=earned_days,
                rewarded_at=now,
                expires_at=new_expiry
            )
            db.add(history)

            reward_info = {
                "reward_earned": True,
                "days_added": earned_days,
                "minutes_deducted": minutes_spent,
                "new_expiry": new_expiry.isoformat(),
                "new_expiry_formatted": new_expiry.strftime("%d %b %Y, %H:%M UTC")
            }

        db.commit()
        db.refresh(user)

        status = cls.get_premium_status(db, user_id)
        return {
            "status": "updated",
            "delta_minutes": round(delta_minutes, 2),
            "reward": reward_info,
            "premium_status": status
        }

    @classmethod
    def end_session(cls, db: Session, user_id: int, session_id: int) -> Dict[str, Any]:
        """Close an active screen-time tracking session."""
        log = db.query(ScreenTimeLog).filter(
            ScreenTimeLog.id == session_id,
            ScreenTimeLog.user_id == user_id
        ).first()

        now = datetime.utcnow()
        if log:
            log.session_end = now
            db.commit()
            return {"status": "ended", "session_id": session_id, "session_end": now.isoformat()}
        return {"status": "not_found", "session_id": session_id}

    @classmethod
    def get_premium_status(cls, db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get current premium status, remaining time, and progress towards next reward.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        now = datetime.utcnow()
        is_premium = bool(user.premium_until and user.premium_until > now)

        days_left = 0
        hours_left = 0
        expiry_formatted = None
        expiry_iso = None

        if is_premium:
            diff = user.premium_until - now
            days_left = diff.days
            hours_left = int(diff.total_seconds() // 3600)
            expiry_formatted = user.premium_until.strftime("%d %b %Y, %H:%M UTC")
            expiry_iso = user.premium_until.isoformat()

        available_mins = round(user.available_reward_minutes or 0.0, 1)
        total_mins = round(user.total_screen_minutes or 0.0, 1)
        mins_remaining = round(max(0.0, cls.REWARD_THRESHOLD_MINUTES - available_mins), 1)
        progress_pct = min(100.0, round((available_mins / cls.REWARD_THRESHOLD_MINUTES) * 100.0, 1))

        return {
            "user_id": user.id,
            "full_name": user.full_name,
            "is_premium": is_premium,
            "premium_until": expiry_iso,
            "expiry_formatted": expiry_formatted,
            "days_left": days_left,
            "hours_left": hours_left,
            "total_screen_minutes": total_mins,
            "available_reward_minutes": available_mins,
            "reward_threshold_minutes": int(cls.REWARD_THRESHOLD_MINUTES),
            "minutes_remaining": mins_remaining,
            "progress_percent": progress_pct
        }

    @classmethod
    def get_premium_history(cls, db: Session, user_id: int) -> List[Dict[str, Any]]:
        """Retrieve audit history of rewarded premium access."""
        records = db.query(PremiumHistory).filter(
            PremiumHistory.user_id == user_id
        ).order_by(PremiumHistory.rewarded_at.desc()).all()

        return [
            {
                "id": r.id,
                "minutes_spent": r.minutes_spent,
                "days_rewarded": r.days_rewarded,
                "rewarded_at": r.rewarded_at.strftime("%d %b %Y, %H:%M"),
                "expires_at": r.expires_at.strftime("%d %b %Y, %H:%M")
            }
            for r in records
        ]
