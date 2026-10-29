from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserProfile, UserLessonProgress
from app.schemas.user import LeaderboardEntry
from app.auth.security import get_optional_user

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(
    track: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    entries = []

    # 1. Fetch lesson progress stats for genuine accuracy and completed lesson counts
    progress_rows = db.query(UserLessonProgress).all()
    stats_by_user = {}
    for p in progress_rows:
        uid = p.user_id
        if uid not in stats_by_user:
            stats_by_user[uid] = {
                "completed_lessons": 0,
                "total_score": 0,
                "total_questions": 0
            }
        if p.completed:
            stats_by_user[uid]["completed_lessons"] += 1
        if p.total_questions and p.total_questions > 0:
            stats_by_user[uid]["total_score"] += (p.score or 0)
            stats_by_user[uid]["total_questions"] += p.total_questions

    # 2. Fetch all real database users with profiles (no fabricated baseline scholars)
    users_with_profiles = (
        db.query(User, UserProfile)
        .join(UserProfile, User.id == UserProfile.user_id)
        .all()
    )

    for u, p in users_with_profiles:
        is_cur = (current_user is not None and current_user.id == u.id)
        ustats = stats_by_user.get(u.id, {
            "completed_lessons": 0,
            "total_score": 0,
            "total_questions": 0
        })

        acc = None
        if ustats["total_questions"] > 0:
            acc = int(round((ustats["total_score"] / ustats["total_questions"]) * 100))

        entries.append({
            "user_id": u.id,
            "name": u.full_name,
            "track": p.chosen_language,
            "xp": p.total_xp,
            "streak": p.streak_days,
            "level": p.current_level,
            "is_current_user": is_cur,
            "accuracy": acc,
            "completed_lessons": ustats["completed_lessons"]
        })

    # 3. Filter by track if requested
    if track and track.lower() != "all":
        entries = [e for e in entries if e["track"].lower() == track.lower()]

    # 4. Deterministic tie-breaking sort:
    # 1st: XP descending
    # 2nd: Streak descending
    # 3rd: Completed lessons descending
    # 4th: Name ascending (case-insensitive)
    # 5th: User ID ascending
    entries.sort(key=lambda x: (-x["xp"], -x["streak"], -x["completed_lessons"], x["name"].lower(), x["user_id"]))

    # 5. Assign 1-indexed ranks
    result = []
    for idx, e in enumerate(entries, start=1):
        result.append(LeaderboardEntry(
            rank=idx,
            name=e["name"],
            track=e["track"],
            xp=e["xp"],
            streak=e["streak"],
            level=e["level"],
            is_current_user=e["is_current_user"],
            accuracy=e["accuracy"],
            completed_lessons=e["completed_lessons"]
        ))

    return result
