import csv
import io
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_

from app.database import get_db
from app.models.user import (
    User, UserProfile, UserLessonProgress, UserProjectProgress, UserBadge,
    Progress, AdminLog, SystemSetting
)
from app.models.content import (
    Track, Lesson, Question, Project, Badge, RoadmapStage,
    Course, Quiz, QuizResult
)
from app.auth.security import (
    hash_password, verify_password, create_access_token,
    get_current_admin, get_current_user
)
from app.schemas.user import UserLogin, TokenResponse, UserProfileResponse

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

# ----------------- SCHEMAS -----------------

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class StudentCreateRequest(BaseModel):
    full_name: str
    email: str
    password: str
    chosen_language: Optional[str] = "Python"
    role: Optional[str] = "learner"
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None

class StudentUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    chosen_language: Optional[str] = None
    role: Optional[str] = None
    total_xp: Optional[int] = None
    streak_days: Optional[int] = None
    current_level: Optional[int] = None
    password: Optional[str] = None
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None

class QuestionCreateRequest(BaseModel):
    lesson_id: int
    question_text: str
    description: Optional[str] = "Choose the correct answer."
    options: List[str]
    answer_index: int
    explanation: Optional[str] = ""

class QuestionUpdateRequest(BaseModel):
    question_text: Optional[str] = None
    description: Optional[str] = None
    options: Optional[List[str]] = None
    answer_index: Optional[int] = None
    explanation: Optional[str] = None

class LessonCreateRequest(BaseModel):
    track_slug: str
    lesson_number: int
    title: str
    description: Optional[str] = ""
    theory: Optional[str] = ""

class LessonUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    theory: Optional[str] = None

class RoadmapStageRequest(BaseModel):
    stage_number: int
    track_slug: Optional[str] = "all"
    title: str
    description: Optional[str] = ""
    milestones: Optional[List[str]] = []

class SystemSettingsRequest(BaseModel):
    platform_name: Optional[str] = None
    default_language: Optional[str] = None
    min_pass_score: Optional[int] = None
    daily_goal_minutes: Optional[int] = None
    ai_mentor_model: Optional[str] = None
    ai_mentor_temperature: Optional[float] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# Persistent settings helpers
DEFAULT_SYSTEM_SETTINGS: Dict[str, Any] = {
    "platform_name": "Bhasha_AI Royal Academy",
    "default_language": "Python",
    "min_pass_score": 70,
    "daily_goal_minutes": 15,
    "ai_mentor_model": "gemini-1.5-flash",
    "ai_mentor_temperature": 0.7
}

def load_persistent_settings(db: Session) -> Dict[str, Any]:
    """Retrieve settings from SQLite system_settings table, falling back to defaults if not set."""
    try:
        from app.database import Base, engine
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass

    settings = dict(DEFAULT_SYSTEM_SETTINGS)
    try:
        rows = db.query(SystemSetting).all()
        for r in rows:
            try:
                settings[r.key] = json.loads(r.value)
            except Exception:
                settings[r.key] = r.value
    except Exception:
        pass
    return settings

def save_persistent_setting(db: Session, key: str, value: Any):
    """Upsert key-value configuration into SQLite system_settings table."""
    try:
        from app.database import Base, engine
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass

    row = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    val_str = json.dumps(value)
    if row:
        row.value = val_str
        row.updated_at = datetime.utcnow()
    else:
        db.add(SystemSetting(key=key, value=val_str, updated_at=datetime.utcnow()))


# ----------------- ADMIN AUTH -----------------

@router.post("/login", response_model=TokenResponse)
def admin_login(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    """Authenticate administrator credentials and return JWT session."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator credentials. Please check email and password."
        )

    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: This account does not possess administrator privileges."
        )

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(user_id=user.id, chosen_language="Python", rank_tier="Administrator")
        db.add(profile)
        db.commit()
        db.refresh(profile)

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": "admin"})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserProfileResponse(
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
    )


# ----------------- DASHBOARD STATS -----------------

@router.get("/dashboard/stats")
def get_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Aggregate high-level metrics, language stats, activity timeline, and recent logs."""
    today = datetime.utcnow().date()
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    # 1. Total Students
    total_students = db.query(User).filter(User.role != "admin").count()

    # 2. Active Users (genuine login/activity within 30 days)
    active_users = db.query(User).filter(
        User.role != "admin",
        or_(User.last_login >= thirty_days_ago, User.profile.has(UserProfile.total_xp > 100))
    ).count()

    # 3. Total Quizzes / Assessment Questions
    total_quizzes = db.query(Quiz).count()
    if total_quizzes == 0:
        total_quizzes = db.query(Question).count()

    # 4. Average Score (% across genuine UserLessonProgress assessments)
    prog_stats = db.query(
        func.sum(UserLessonProgress.score),
        func.sum(UserLessonProgress.total_questions)
    ).first()
    if prog_stats and prog_stats[1] and prog_stats[1] > 0:
        average_score = round((float(prog_stats[0]) / float(prog_stats[1])) * 100, 1)
    else:
        avg_score_raw = db.query(func.avg(QuizResult.percentage)).scalar()
        average_score = round(float(avg_score_raw), 1) if avg_score_raw is not None else 0.0

    # 5. Registered Today
    registered_today = db.query(User).filter(
        User.role != "admin",
        func.date(User.created_at) == today
    ).count()

    total_lessons = db.query(Lesson).count()
    total_projects = db.query(Project).count()

    # 6. Genuine Platform Completion Rate
    completed_lesson_count = db.query(UserLessonProgress).filter(
        UserLessonProgress.completed == True
    ).count()
    if total_students > 0 and total_lessons > 0:
        completion_rate = round(min(100.0, (completed_lesson_count / (total_students * total_lessons)) * 100), 1)
    else:
        completion_rate = 0.0

    # Track breakdown
    tracks = db.query(Track).all()
    track_stats = []

    profiles = db.query(UserProfile.chosen_language, func.count(UserProfile.id)).group_by(UserProfile.chosen_language).all()
    lang_count_map = {p[0]: p[1] for p in profiles if p[0]}

    for t in tracks:
        student_count = lang_count_map.get(t.slug, 0)
        lesson_count = db.query(Lesson).filter(Lesson.track_slug.ilike(t.slug)).count()
        track_stats.append({
            "slug": t.slug,
            "name": t.name,
            "icon": t.icon,
            "students_count": student_count,
            "lessons_count": lesson_count
        })

    # Recent student activity feed
    recent_progress = (
        db.query(UserLessonProgress, User)
        .join(User, User.id == UserLessonProgress.user_id)
        .order_by(desc(UserLessonProgress.updated_at))
        .limit(10)
        .all()
    )

    activity_feed = []
    for prog, usr in recent_progress:
        activity_feed.append({
            "id": prog.id,
            "user_id": usr.id,
            "user_name": usr.full_name,
            "user_email": usr.email,
            "subject": prog.subject,
            "lesson_number": prog.lesson_number,
            "score": prog.score,
            "total_questions": prog.total_questions,
            "xp_earned": prog.xp_earned,
            "timestamp": prog.updated_at.strftime("%Y-%m-%d %H:%M") if prog.updated_at else datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        })

    # 7-day activity trend calculation (strictly genuine submission counts)
    timeline_days = []
    submission_counts = []
    new_user_counts = []

    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.strftime("%b %d")
        timeline_days.append(d_str)

        subs = db.query(UserLessonProgress).filter(
            func.date(UserLessonProgress.updated_at) == d
        ).count()
        submission_counts.append(subs)

        nus = db.query(User).filter(
            func.date(User.created_at) == d
        ).count()
        new_user_counts.append(nus)

    # Average scores per track
    track_avg_scores = {}
    for t_slug in ["Python", "Java", "C++", "English"]:
        prog_agg = db.query(
            func.sum(UserLessonProgress.score),
            func.sum(UserLessonProgress.total_questions)
        ).filter(
            UserLessonProgress.subject.ilike(t_slug)
        ).first()
        if prog_agg and prog_agg[1] and prog_agg[1] > 0:
            track_avg_scores[t_slug] = round((float(prog_agg[0]) / float(prog_agg[1])) * 100, 1)
        else:
            track_avg_scores[t_slug] = 0.0

    return {
        "summary": {
            "total_students": total_students,
            "active_users": active_users,
            "total_quizzes": total_quizzes,
            "average_score": average_score,
            "registered_today": registered_today,
            "completion_rate": completion_rate,
            "total_lessons": total_lessons,
            "total_projects": total_projects,
            "languages_count": len(tracks)
        },
        "tracks": track_stats,
        "recent_activity": activity_feed,
        "activity_timeline": {
            "labels": timeline_days,
            "submissions": submission_counts,
            "new_users": new_user_counts
        },
        "track_avg_scores": track_avg_scores
    }


# ----------------- STUDENT MANAGEMENT -----------------

MODULES_SPEC = {
    "English": [
        {"key": "vocabulary", "name": "Vocabulary", "default_pct": 82, "score": 90, "attempts": 3, "time": 45},
        {"key": "grammar", "name": "Grammar", "default_pct": 75, "score": 85, "attempts": 4, "time": 60},
        {"key": "reading", "name": "Reading", "default_pct": 90, "score": 95, "attempts": 2, "time": 30},
        {"key": "pronunciation", "name": "Pronunciation", "default_pct": 65, "score": 78, "attempts": 5, "time": 50},
    ],
    "Python": [
        {"key": "syntax", "name": "Syntax", "default_pct": 95, "score": 98, "attempts": 2, "time": 40},
        {"key": "oop", "name": "OOP", "default_pct": 80, "score": 88, "attempts": 4, "time": 75},
        {"key": "functions", "name": "Functions", "default_pct": 88, "score": 92, "attempts": 3, "time": 55},
        {"key": "projects", "name": "Projects", "default_pct": 70, "score": 85, "attempts": 2, "time": 120},
    ],
    "Java": [
        {"key": "core_java", "name": "Core Java", "default_pct": 85, "score": 90, "attempts": 3, "time": 65},
        {"key": "collections", "name": "Collections", "default_pct": 72, "score": 80, "attempts": 4, "time": 80},
        {"key": "oop", "name": "OOP", "default_pct": 78, "score": 85, "attempts": 3, "time": 70},
    ],
    "C++": [
        {"key": "stl", "name": "STL", "default_pct": 80, "score": 86, "attempts": 3, "time": 60},
        {"key": "pointers", "name": "Pointers", "default_pct": 68, "score": 75, "attempts": 6, "time": 90},
        {"key": "dsa", "name": "DSA", "default_pct": 74, "score": 82, "attempts": 4, "time": 110},
    ],
}

def init_student_progress(db: Session, user_id: int, chosen_language: str = "Python"):
    """Initialize granular progress across all courses and modules for a student."""
    now = datetime.utcnow()
    for lang, modules in MODULES_SPEC.items():
        is_chosen = (lang.lower() == chosen_language.lower())
        multiplier = 1.0 if is_chosen else 0.4
        for mod in modules:
            exist = db.query(Progress).filter(
                Progress.user_id == user_id,
                Progress.course_slug == lang.lower(),
                Progress.module_key == mod["key"]
            ).first()
            if not exist:
                pct = int(min(100, mod["default_pct"] * multiplier))
                db.add(Progress(
                    user_id=user_id,
                    course_slug=lang.lower(),
                    module_key=mod["key"],
                    module_name=mod["name"],
                    completion_percent=pct,
                    highest_score=int(mod["score"] * multiplier),
                    total_attempts=max(1, int(mod["attempts"] * multiplier)),
                    time_spent_mins=int(mod["time"] * multiplier),
                    is_completed=(pct >= 80),
                    last_accessed=now
                ))
    db.commit()


@router.get("/students")
def list_students(
    search: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    skip: Optional[int] = Query(None),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve filtered, paginated student roster with Google ID, progress, and activity timestamps."""
    query = db.query(User, UserProfile).outerjoin(UserProfile, User.id == UserProfile.user_id)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search_pattern),
                User.email.ilike(search_pattern),
                User.google_id.ilike(search_pattern)
            )
        )

    if language and language != "all":
        query = query.filter(UserProfile.chosen_language.ilike(language))

    if role and role != "all":
        query = query.filter(User.role == role)

    total_count = query.count()

    # Pagination calculation
    if skip is None:
        effective_skip = (page - 1) * limit
    else:
        effective_skip = skip
        page = (skip // limit) + 1

    total_pages = max(1, (total_count + limit - 1) // limit)
    results = query.order_by(desc(User.created_at)).offset(effective_skip).limit(limit).all()

    students = []
    for usr, prof in results:
        completed_lessons = db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == usr.id,
            UserLessonProgress.completed == True
        ).count()

        chosen_track = prof.chosen_language if prof else "Python"
        total_track_lessons = db.query(Lesson).filter(Lesson.track_slug.ilike(chosen_track)).count()
        if total_track_lessons == 0:
            total_track_lessons = db.query(Lesson).count()

        if total_track_lessons > 0 and completed_lessons > 0:
            course_progress = round(min(100.0, (completed_lessons / total_track_lessons) * 100), 1)
        else:
            course_progress = 0.0

        students.append({
            "id": usr.id,
            "full_name": usr.full_name,
            "email": usr.email,
            "google_id": usr.google_id or "",
            "profile_picture": usr.profile_picture or "",
            "role": usr.role,
            "chosen_language": prof.chosen_language if prof else "Python",
            "course_progress": course_progress,
            "total_xp": prof.total_xp if prof else 0,
            "streak_days": prof.streak_days if prof else 0,
            "current_level": prof.current_level if prof else 1,
            "rank_tier": prof.rank_tier if prof else "Stage 1 • Fundamentals",
            "lessons_completed": completed_lessons,
            "created_at": usr.created_at.strftime("%Y-%m-%d") if usr.created_at else "",
            "last_login": usr.last_login.strftime("%Y-%m-%d %H:%M") if usr.last_login else (usr.created_at.strftime("%Y-%m-%d %H:%M") if usr.created_at else "")
        })

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "skip": effective_skip,
        "students": students
    }


@router.post("/students", status_code=status.HTTP_201_CREATED)
def create_student(
    payload: StudentCreateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Manually add a student or admin user with zero synthetic progress, and log audit trail."""
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    now = datetime.utcnow()
    new_user = User(
        email=payload.email.lower(),
        full_name=payload.full_name.strip(),
        hashed_password=hash_password(payload.password),
        role=payload.role or "learner",
        google_id=payload.google_id,
        profile_picture=payload.profile_picture or "",
        created_at=now,
        last_login=now
    )
    db.add(new_user)
    db.flush()

    new_profile = UserProfile(
        user_id=new_user.id,
        chosen_language=payload.chosen_language or "Python",
        daily_goal=15,
        total_xp=0,
        streak_days=0,
        current_level=1,
        rank_tier="Stage 1 • Fundamentals",
        updated_at=now
    )
    db.add(new_profile)

    # Record in audit log
    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="CREATE_STUDENT",
        target_type="student",
        target_id=str(new_user.id),
        details=f"Created student '{new_user.full_name}' ({new_user.email}) with role '{new_user.role}'.",
        created_at=now
    ))
    db.commit()
    db.refresh(new_user)

    return {
        "status": "success",
        "message": f"Student '{new_user.full_name}' created successfully.",
        "user_id": new_user.id
    }


@router.get("/students/{user_id}")
def get_student_detail(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Fetch complete academic dossier including genuine progress across all subjects and quiz history."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    
    # 1. Existing Progress records (strictly read-only, never inject synthetic records)
    all_prog = db.query(Progress).filter(Progress.user_id == user.id).all()
    prog_map = {(p.course_slug.lower(), p.module_key.lower()): p for p in all_prog}

    progress_by_subject = {}
    total_time = 0
    highest_score = 0
    total_attempts = 0

    for subj, modules in MODULES_SPEC.items():
        progress_by_subject[subj] = []
        for mod in modules:
            p = prog_map.get((subj.lower(), mod["key"].lower()))
            if p:
                total_time += p.time_spent_mins
                if p.highest_score > highest_score:
                    highest_score = p.highest_score
                total_attempts += p.total_attempts
                progress_by_subject[subj].append({
                    "module_key": p.module_key,
                    "module_name": p.module_name,
                    "completion_percent": p.completion_percent,
                    "highest_score": p.highest_score,
                    "total_attempts": p.total_attempts,
                    "time_spent_mins": p.time_spent_mins,
                    "is_completed": p.is_completed,
                    "last_accessed": p.last_accessed.strftime("%Y-%m-%d %H:%M") if p.last_accessed else ""
                })
            else:
                progress_by_subject[subj].append({
                    "module_key": mod["key"],
                    "module_name": mod["name"],
                    "completion_percent": 0,
                    "highest_score": 0,
                    "total_attempts": 0,
                    "time_spent_mins": 0,
                    "is_completed": False,
                    "last_accessed": ""
                })

    # 2. Genuine Quiz History from UserLessonProgress
    lessons = db.query(UserLessonProgress).filter(UserLessonProgress.user_id == user.id).order_by(desc(UserLessonProgress.updated_at)).all()
    projects = db.query(UserProjectProgress).filter(UserProjectProgress.user_id == user.id).all()
    badges = db.query(UserBadge).filter(UserBadge.user_id == user.id).all()

    quiz_results = (
        db.query(QuizResult, Quiz)
        .join(Quiz, Quiz.id == QuizResult.quiz_id)
        .filter(QuizResult.user_id == user.id)
        .order_by(desc(QuizResult.completed_at))
        .all()
    )

    quiz_history = []
    total_quiz_pct = 0.0

    # Include all real lesson quiz submissions
    for l in lessons:
        total_q = l.total_questions if l.total_questions and l.total_questions > 0 else 5
        pct = round((l.score / float(total_q)) * 100, 1)
        total_quiz_pct += pct
        if pct > highest_score:
            highest_score = int(pct)
        quiz_history.append({
            "id": f"lesson_{l.id}",
            "quiz_id": l.id,
            "title": f"{l.subject} • Lesson {l.lesson_number} Assessment",
            "topic": l.subject,
            "score": l.score,
            "total_questions": total_q,
            "percentage": pct,
            "passed": (pct >= 70) if not l.completed else True,
            "attempt_number": 1,
            "time_taken_seconds": 0,
            "completed_at": l.updated_at.strftime("%Y-%m-%d %H:%M") if l.updated_at else ""
        })

    # Also include any QuizResult rows
    for r, q in quiz_results:
        total_quiz_pct += r.percentage
        if r.percentage > highest_score:
            highest_score = int(r.percentage)
        quiz_history.append({
            "id": f"qr_{r.id}",
            "quiz_id": q.id,
            "title": q.title,
            "topic": q.topic,
            "score": r.score,
            "total_questions": r.total_questions,
            "percentage": r.percentage,
            "passed": r.passed,
            "attempt_number": r.attempt_number,
            "time_taken_seconds": r.time_taken_seconds,
            "completed_at": r.completed_at.strftime("%Y-%m-%d %H:%M") if r.completed_at else ""
        })

    avg_quiz_score = round(total_quiz_pct / len(quiz_history), 1) if quiz_history else 0.0

    return {
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "google_id": user.google_id or "",
            "profile_picture": user.profile_picture or "",
            "created_at": user.created_at.strftime("%Y-%m-%d %H:%M") if user.created_at else "",
            "last_login": user.last_login.strftime("%Y-%m-%d %H:%M") if user.last_login else (user.created_at.strftime("%Y-%m-%d %H:%M") if user.created_at else "")
        },
        "profile": {
            "chosen_language": profile.chosen_language if profile else "Python",
            "daily_goal": profile.daily_goal if profile else 15,
            "total_xp": profile.total_xp if profile else 0,
            "streak_days": profile.streak_days if profile else 0,
            "current_level": profile.current_level if profile else 1,
            "rank_tier": profile.rank_tier if profile else "Stage 1 • Fundamentals"
        },
        "stats": {
            "highest_score": highest_score,
            "total_attempts": max(len(quiz_history), total_attempts),
            "time_spent_learning_mins": total_time,
            "average_quiz_score": avg_quiz_score
        },
        "progress_by_subject": progress_by_subject,
        "quiz_history": quiz_history,
        "lessons": [
            {
                "subject": l.subject,
                "lesson_number": l.lesson_number,
                "score": l.score,
                "total_questions": l.total_questions,
                "xp_earned": l.xp_earned,
                "completed": l.completed,
                "updated_at": l.updated_at.strftime("%Y-%m-%d") if l.updated_at else ""
            } for l in lessons
        ],
        "projects": [
            {
                "project_id": p.project_id,
                "progress_percent": p.progress_percent,
                "is_completed": p.is_completed
            } for p in projects
        ],
        "badges": [b.badge_slug for b in badges]
    }


@router.put("/students/{user_id}")
def update_student(
    user_id: int,
    payload: StudentUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Modify student credentials, role, or progress stats and log audit entry."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if payload.full_name:
        user.full_name = payload.full_name.strip()
    if payload.email:
        existing = db.query(User).filter(User.email == payload.email.lower(), User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already taken.")
        user.email = payload.email.lower()
    if payload.role:
        user.role = payload.role
    if payload.password and payload.password.strip():
        user.hashed_password = hash_password(payload.password.strip())
    if payload.google_id is not None:
        user.google_id = payload.google_id
    if payload.profile_picture is not None:
        user.profile_picture = payload.profile_picture

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)

    if payload.chosen_language:
        profile.chosen_language = payload.chosen_language
    if payload.total_xp is not None:
        profile.total_xp = payload.total_xp
    if payload.streak_days is not None:
        profile.streak_days = payload.streak_days
    if payload.current_level is not None:
        profile.current_level = payload.current_level

    # Log in audit table
    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="UPDATE_STUDENT",
        target_type="student",
        target_id=str(user.id),
        details=f"Updated profile for student '{user.full_name}' ({user.email}).",
        created_at=datetime.utcnow()
    ))
    db.commit()
    return {"status": "success", "message": f"Student '{user.full_name}' updated successfully."}


@router.delete("/students/{user_id}")
def delete_student(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Permanently delete student account and cascade their academic records."""
    if admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot delete their own active account."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    name = user.full_name
    email = user.email
    db.delete(user)

    # Log in audit table
    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="DELETE_STUDENT",
        target_type="student",
        target_id=str(user_id),
        details=f"Deleted student '{name}' ({email}).",
        created_at=datetime.utcnow()
    ))
    db.commit()
    return {"status": "success", "message": f"Student '{name}' has been deleted."}


# ----------------- QUIZ MANAGEMENT -----------------

@router.get("/quizzes")
def list_quizzes(
    track: Optional[str] = Query(None),
    lesson_number: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List quiz questions with option choices, track associations, and answers."""
    query = (
        db.query(Question, Lesson)
        .join(Lesson, Lesson.id == Question.lesson_id)
    )

    if track and track != "all":
        query = query.filter(Lesson.track_slug.ilike(track))

    if lesson_number:
        query = query.filter(Lesson.lesson_number == lesson_number)

    if search:
        search_pat = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Question.question_text.ilike(search_pat),
                Question.explanation.ilike(search_pat),
                Lesson.title.ilike(search_pat)
            )
        )

    total_count = query.count()
    results = query.offset(skip).limit(limit).all()

    quizzes = []
    for q, l in results:
        options = json.loads(q.options_json) if q.options_json else []
        quizzes.append({
            "id": q.id,
            "lesson_id": l.id,
            "track_slug": l.track_slug,
            "lesson_number": l.lesson_number,
            "lesson_title": l.title,
            "question_text": q.question_text,
            "description": q.description,
            "options": options,
            "answer_index": q.answer_index,
            "explanation": q.explanation
        })

    return {
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "quizzes": quizzes
    }


@router.post("/quizzes", status_code=status.HTTP_201_CREATED)
def create_quiz_question(
    payload: QuestionCreateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new quiz question into a syllabus lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == payload.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    if payload.answer_index < 0 or payload.answer_index >= len(payload.options):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Answer index must point to a valid option.")

    question = Question(
        lesson_id=payload.lesson_id,
        question_text=payload.question_text.strip(),
        description=payload.description or "Choose the correct answer.",
        options_json=json.dumps(payload.options),
        answer_index=payload.answer_index,
        explanation=payload.explanation or ""
    )
    db.add(question)
    db.flush()
    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="CREATE_QUESTION",
        target_type="quiz",
        target_id=str(question.id),
        details=f"Added assessment question to lesson #{lesson.lesson_number} in {lesson.track_slug}.",
        created_at=datetime.utcnow()
    ))
    db.commit()
    db.refresh(question)

    return {
        "status": "success",
        "message": "Question created successfully.",
        "question_id": question.id
    }


@router.put("/quizzes/{question_id}")
def update_quiz_question(
    question_id: int,
    payload: QuestionUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Edit question wording, choices, correct answer, or explanation."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found.")

    if payload.question_text is not None:
        question.question_text = payload.question_text.strip()
    if payload.description is not None:
        question.description = payload.description.strip()
    if payload.options is not None:
        question.options_json = json.dumps(payload.options)
    if payload.answer_index is not None:
        question.answer_index = payload.answer_index
    if payload.explanation is not None:
        question.explanation = payload.explanation.strip()

    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="UPDATE_QUESTION",
        target_type="quiz",
        target_id=str(question_id),
        details=f"Updated quiz question ID {question_id}.",
        created_at=datetime.utcnow()
    ))
    db.commit()
    return {"status": "success", "message": "Question updated successfully."}


@router.delete("/quizzes/{question_id}")
def delete_quiz_question(
    question_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Remove a question from the curriculum database."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found.")

    db.delete(question)
    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="DELETE_QUESTION",
        target_type="quiz",
        target_id=str(question_id),
        details=f"Deleted quiz question ID {question_id}.",
        created_at=datetime.utcnow()
    ))
    db.commit()
    return {"status": "success", "message": "Question deleted successfully."}


# ----------------- COURSE & ROADMAP MANAGEMENT -----------------

@router.get("/courses")
def get_courses_overview(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve complete curriculum hierarchy with tracks and chapters."""
    tracks = db.query(Track).all()
    result = []

    for t in tracks:
        lessons = db.query(Lesson).filter(Lesson.track_slug.ilike(t.slug)).order_by(Lesson.lesson_number).all()
        lesson_items = []
        for l in lessons:
            q_count = db.query(Question).filter(Question.lesson_id == l.id).count()
            lesson_items.append({
                "id": l.id,
                "lesson_number": l.lesson_number,
                "title": l.title,
                "description": l.description,
                "theory": l.theory or "",
                "questions_count": q_count
            })

        result.append({
            "id": t.id,
            "slug": t.slug,
            "name": t.name,
            "icon": t.icon,
            "description": t.description,
            "total_lessons": t.total_lessons,
            "lessons": lesson_items
        })

    return result


@router.post("/courses/lessons", status_code=status.HTTP_201_CREATED)
def create_course_lesson(
    payload: LessonCreateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new lesson chapter to an existing language track."""
    track = db.query(Track).filter(Track.slug.ilike(payload.track_slug)).first()
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found.")

    lesson = Lesson(
        track_slug=payload.track_slug,
        lesson_number=payload.lesson_number,
        title=payload.title.strip(),
        description=payload.description or "",
        theory=payload.theory or ""
    )
    db.add(lesson)
    db.flush()
    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="CREATE_LESSON",
        target_type="course",
        target_id=str(lesson.id),
        details=f"Created lesson '{lesson.title}' (#{lesson.lesson_number}) for track '{lesson.track_slug}'.",
        created_at=datetime.utcnow()
    ))
    db.commit()
    db.refresh(lesson)

    return {"status": "success", "message": f"Lesson '{lesson.title}' created.", "lesson_id": lesson.id}


@router.put("/courses/lessons/{lesson_id}")
def update_course_lesson(
    lesson_id: int,
    payload: LessonUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update title, theory synopsis, or description for a lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    if payload.title is not None:
        lesson.title = payload.title.strip()
    if payload.description is not None:
        lesson.description = payload.description.strip()
    if payload.theory is not None:
        lesson.theory = payload.theory

    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="UPDATE_LESSON",
        target_type="course",
        target_id=str(lesson_id),
        details=f"Updated lesson chapter '{lesson.title}' (#{lesson.lesson_number}).",
        created_at=datetime.utcnow()
    ))
    db.commit()
    return {"status": "success", "message": "Lesson updated successfully."}


@router.delete("/courses/lessons/{lesson_id}")
def delete_course_lesson(
    lesson_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a lesson chapter and its associated questions."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    l_title = lesson.title
    db.delete(lesson)
    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="DELETE_LESSON",
        target_type="course",
        target_id=str(lesson_id),
        details=f"Deleted lesson chapter '{l_title}' (ID {lesson_id}).",
        created_at=datetime.utcnow()
    ))
    db.commit()
    return {"status": "success", "message": "Lesson chapter deleted."}


@router.get("/roadmap")
def get_roadmap_stages(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List career roadmap stages and milestones."""
    stages = db.query(RoadmapStage).order_by(RoadmapStage.stage_number).all()
    result = []
    for s in stages:
        milestones = json.loads(s.milestones_json) if s.milestones_json else []
        result.append({
            "id": s.id,
            "stage_number": s.stage_number,
            "track_slug": s.track_slug,
            "title": s.title,
            "description": s.description,
            "milestones": milestones
        })

    if not result:
        default_stages = [
            {"stage_number": 1, "track_slug": "all", "title": "Phase 1 • Foundations & Syntax", "description": "Variables, conditionals, loops, basic syntax.", "milestones": ["Master variables & types", "Complete 5 foundation quizzes", "Build terminal calculator"]},
            {"stage_number": 2, "track_slug": "all", "title": "Phase 2 • Data Structures & OOP", "description": "Lists, classes, encapsulation, methods.", "milestones": ["Build Bank Account module", "Master OOP inheritance", "Solve 10 algorithm problems"]},
            {"stage_number": 3, "track_slug": "all", "title": "Phase 3 • Architecture & Systems", "description": "Dynamic memory, pointers, error handling.", "milestones": ["Complete C++ memory tracker", "Achieve 85% quiz accuracy", "Reach 1,500 total XP"]},
            {"stage_number": 4, "track_slug": "all", "title": "Phase 4 • Industry Fluency", "description": "Professional English and technical proficiency.", "milestones": ["Professional communication track", "AI-assisted code reviews", "Royal Scholar Graduation"]}
        ]
        for ds in default_stages:
            stg = RoadmapStage(
                stage_number=ds["stage_number"],
                track_slug=ds["track_slug"],
                title=ds["title"],
                description=ds["description"],
                milestones_json=json.dumps(ds["milestones"])
            )
            db.add(stg)
        db.commit()
        return default_stages

    return result


@router.post("/roadmap", status_code=status.HTTP_201_CREATED)
def create_or_update_roadmap_stage(
    payload: RoadmapStageRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add or replace a career roadmap stage."""
    existing = db.query(RoadmapStage).filter(RoadmapStage.stage_number == payload.stage_number).first()
    if existing:
        existing.title = payload.title
        existing.description = payload.description
        existing.track_slug = payload.track_slug or "all"
        existing.milestones_json = json.dumps(payload.milestones or [])
    else:
        new_stage = RoadmapStage(
            stage_number=payload.stage_number,
            track_slug=payload.track_slug or "all",
            title=payload.title,
            description=payload.description,
            milestones_json=json.dumps(payload.milestones or [])
        )
        db.add(new_stage)

    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="SAVE_ROADMAP_STAGE",
        target_type="roadmap",
        target_id=str(payload.stage_number),
        details=f"Saved roadmap stage {payload.stage_number}: '{payload.title}'.",
        created_at=datetime.utcnow()
    ))
    db.commit()
    return {"status": "success", "message": f"Roadmap Stage {payload.stage_number} saved."}


@router.delete("/roadmap/{stage_id}")
def delete_roadmap_stage(
    stage_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Remove a roadmap milestone stage."""
    stg = db.query(RoadmapStage).filter(RoadmapStage.id == stage_id).first()
    if not stg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stage not found.")
    stg_title = stg.title
    db.delete(stg)
    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="DELETE_ROADMAP_STAGE",
        target_type="roadmap",
        target_id=str(stage_id),
        details=f"Deleted roadmap stage '{stg_title}' (ID {stage_id}).",
        created_at=datetime.utcnow()
    ))
    db.commit()
    return {"status": "success", "message": "Stage removed."}


# ----------------- ANALYTICS & REPORTS -----------------

@router.get("/analytics/overview")
def get_analytics_overview(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Deep-dive metrics on quiz accuracy, subject popularity, and completion rates."""
    total_attempts = db.query(UserLessonProgress).count()
    successful_attempts = db.query(UserLessonProgress).filter(UserLessonProgress.score >= 3).count()
    overall_pass_rate = round((successful_attempts / total_attempts * 100) if total_attempts > 0 else 0.0, 1)

    subjects = ["Python", "Java", "C++", "English"]
    subject_metrics = []
    for s in subjects:
        attempts = db.query(UserLessonProgress).filter(UserLessonProgress.subject.ilike(s)).count()
        avg_score = db.query(func.avg(UserLessonProgress.score)).filter(UserLessonProgress.subject.ilike(s)).scalar()
        avg_score_val = round(float(avg_score), 2) if avg_score is not None else 0.0
        pct = round((avg_score_val / 5.0) * 100, 1) if avg_score_val > 0 else 0.0
        subject_metrics.append({
            "subject": s,
            "attempts": attempts,
            "average_score": avg_score_val,
            "percentage": pct
        })

    score_counts = {}
    for sc in range(6):
        cnt = db.query(UserLessonProgress).filter(UserLessonProgress.score == sc).count()
        score_counts[f"{sc}/5"] = cnt

    badges_count = db.query(UserBadge).count()

    return {
        "total_attempts": total_attempts,
        "overall_pass_rate": overall_pass_rate,
        "subject_metrics": subject_metrics,
        "score_distribution": score_counts,
        "total_badges_unlocked": badges_count
    }


@router.get("/reports/students.csv")
def export_students_csv(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Stream student roster, Google IDs, and performance data in CSV format."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Student ID", "Full Name", "Email", "Google ID", "Role", "Chosen Language",
        "Course Progress %", "Total XP", "Current Level", "Streak Days", "Rank Tier",
        "Registered Date", "Last Login"
    ])

    users = db.query(User, UserProfile).outerjoin(UserProfile, User.id == UserProfile.user_id).order_by(desc(User.created_at)).all()
    for usr, prof in users:
        completed_lessons = db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == usr.id,
            UserLessonProgress.completed == True
        ).count()

        chosen_track = prof.chosen_language if prof else "Python"
        total_track_lessons = db.query(Lesson).filter(Lesson.track_slug.ilike(chosen_track)).count()
        if total_track_lessons == 0:
            total_track_lessons = db.query(Lesson).count()

        if total_track_lessons > 0 and completed_lessons > 0:
            course_progress = round(min(100.0, (completed_lessons / total_track_lessons) * 100), 1)
        else:
            course_progress = 0.0

        writer.writerow([
            usr.id,
            usr.full_name,
            usr.email,
            usr.google_id or "N/A",
            usr.role,
            prof.chosen_language if prof else "Python",
            f"{course_progress}%",
            prof.total_xp if prof else 0,
            prof.current_level if prof else 1,
            prof.streak_days if prof else 0,
            prof.rank_tier if prof else "Stage 1 • Fundamentals",
            usr.created_at.strftime("%Y-%m-%d") if usr.created_at else "",
            usr.last_login.strftime("%Y-%m-%d %H:%M") if usr.last_login else ""
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bhasha_students_report.csv"}
    )


@router.get("/logs")
def get_admin_logs(
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve audit trail of administrative operations."""
    logs = db.query(AdminLog).order_by(desc(AdminLog.created_at)).limit(limit).all()
    return {
        "total": len(logs),
        "logs": [
            {
                "id": l.id,
                "admin_email": l.admin_email,
                "action": l.action,
                "target_type": l.target_type,
                "target_id": l.target_id,
                "details": l.details,
                "ip_address": l.ip_address,
                "created_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S") if l.created_at else ""
            } for l in logs
        ]
    }


@router.get("/reports/quizzes.csv")
def export_quizzes_csv(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Stream complete question bank and syllabus data in CSV format."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Question ID", "Track", "Lesson Number", "Lesson Title",
        "Question Text", "Correct Option", "Options List", "Explanation"
    ])

    results = (
        db.query(Question, Lesson)
        .join(Lesson, Lesson.id == Question.lesson_id)
        .order_by(Lesson.track_slug, Lesson.lesson_number, Question.id)
        .all()
    )

    for q, l in results:
        options = json.loads(q.options_json) if q.options_json else []
        correct_opt = options[q.answer_index] if 0 <= q.answer_index < len(options) else ""
        writer.writerow([
            q.id,
            l.track_slug,
            l.lesson_number,
            l.title,
            q.question_text,
            correct_opt,
            " | ".join(options),
            q.explanation or ""
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bhasha_quizzes_report.csv"}
    )


# ----------------- SETTINGS & SECURITY -----------------

@router.get("/settings")
def get_system_settings(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve global platform configurations from persistent storage."""
    return load_persistent_settings(db)


@router.put("/settings")
def update_system_settings(
    payload: SystemSettingsRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update academy and AI mentor configuration parameters persistently."""
    updated_keys = []
    if payload.platform_name is not None:
        save_persistent_setting(db, "platform_name", payload.platform_name)
        updated_keys.append("platform_name")
    if payload.default_language is not None:
        save_persistent_setting(db, "default_language", payload.default_language)
        updated_keys.append("default_language")
    if payload.min_pass_score is not None:
        save_persistent_setting(db, "min_pass_score", payload.min_pass_score)
        updated_keys.append("min_pass_score")
    if payload.daily_goal_minutes is not None:
        save_persistent_setting(db, "daily_goal_minutes", payload.daily_goal_minutes)
        updated_keys.append("daily_goal_minutes")
    if payload.ai_mentor_model is not None:
        save_persistent_setting(db, "ai_mentor_model", payload.ai_mentor_model)
        updated_keys.append("ai_mentor_model")
    if payload.ai_mentor_temperature is not None:
        save_persistent_setting(db, "ai_mentor_temperature", payload.ai_mentor_temperature)
        updated_keys.append("ai_mentor_temperature")

    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="UPDATE_SETTINGS",
        target_type="system",
        target_id="system_settings",
        details=f"Updated platform settings: {', '.join(updated_keys) if updated_keys else 'no changes'}.",
        created_at=datetime.utcnow()
    ))
    db.commit()

    current_settings = load_persistent_settings(db)
    return {"status": "success", "message": "Platform settings updated successfully.", "settings": current_settings}


@router.post("/change-password")
def change_admin_password(
    payload: ChangePasswordRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Securely change current administrator password and log audit entry."""
    if not verify_password(payload.current_password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed."
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters in length."
        )

    admin.hashed_password = hash_password(payload.new_password)
    db.add(AdminLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="CHANGE_ADMIN_PASSWORD",
        target_type="security",
        target_id=str(admin.id),
        details=f"Administrator '{admin.full_name}' changed password successfully.",
        created_at=datetime.utcnow()
    ))
    db.commit()
    return {"status": "success", "message": "Administrator password updated successfully."}
