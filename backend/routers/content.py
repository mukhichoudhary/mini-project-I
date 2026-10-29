import json
import re
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.content import Track, Lesson, Question, Project, Badge
from app.models.user import User, UserBadge, UserLessonProgress, UserProjectProgress, UserProfile, SpeakingAssessment
from app.schemas.content import (
    TrackResponse, LessonResponse, QuestionResponse, ProjectResponse,
    ProjectCreate, BadgeResponse, TrackProgressItem, AchievementsOverviewResponse
)
from app.schemas.user import SpeakingPromptItem, SpeakingPromptListResponse
from app.speaking_prompts_data import SPEAKING_PROMPTS
from app.auth.security import get_optional_user

router = APIRouter(prefix="/api/content", tags=["Content & Curriculum"])

@router.get("/tracks", response_model=List[TrackResponse])
def get_tracks(db: Session = Depends(get_db)):
    tracks = db.query(Track).all()
    result = []
    for t in tracks:
        actual_count = db.query(Lesson).filter(Lesson.track_slug.ilike(t.slug)).count()
        result.append(TrackResponse(
            slug=t.slug,
            name=t.name,
            icon=t.icon,
            description=t.description,
            total_lessons=actual_count if actual_count > 0 else t.total_lessons
        ))
    return result

def normalize_curriculum_track_slug(track_slug: str) -> str:
    if not track_slug:
        return "Python"
    s = str(track_slug).strip().lower()
    if s in ("python", "py"):
        return "Python"
    if s in ("java",):
        return "Java"
    if s in ("c++", "cpp", "cplusplus", "c%2b%2b", "c", "c  "):
        return "C++"
    if s in ("english", "technical english", "tech english", "technical_english", "technical-english"):
        return "English"
    if s in ("general", "general concepts", "general_concepts", "general-concepts", "cs"):
        return "General"
    return track_slug.strip()

@router.get("/lessons/{track_slug}", response_model=List[LessonResponse])
def get_lessons_for_track(track_slug: str, db: Session = Depends(get_db)):
    norm_slug = normalize_curriculum_track_slug(track_slug)
    lessons = db.query(Lesson).filter(Lesson.track_slug.ilike(norm_slug)).all()
    result = []
    for l in lessons:
        result.append(LessonResponse(
            id=l.id,
            track_slug=l.track_slug,
            lesson_number=l.lesson_number,
            title=l.title,
            description=l.description,
            questions=[]
        ))
    return result

@router.get("/lessons/{track_slug}/{lesson_number}", response_model=LessonResponse)
def get_lesson_detail(track_slug: str, lesson_number: int, db: Session = Depends(get_db)):
    norm_slug = normalize_curriculum_track_slug(track_slug)
    lesson = db.query(Lesson).filter(
        Lesson.track_slug.ilike(norm_slug),
        Lesson.lesson_number == lesson_number
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson {lesson_number} not found for track '{track_slug}'"
        )

    q_responses = []
    for q in lesson.questions:
        options = json.loads(q.options_json) if q.options_json else []
        q_responses.append(QuestionResponse(
            id=q.id,
            question=q.question_text,
            description=q.description or "Choose the correct answer.",
            options=options,
            answer=q.answer_index,
            explanation=q.explanation
        ))

    return LessonResponse(
        id=lesson.id,
        track_slug=lesson.track_slug,
        lesson_number=lesson.lesson_number,
        title=lesson.title,
        description=lesson.description,
        theory=lesson.theory,
        questions=q_responses
    )

def normalize_project_subject(subject: Optional[str]) -> Optional[str]:
    """
    Strictly and safely normalizes subject queries to the five canonical categories:
    Python, Java, C++, English, General.
    Returns None if subject is empty or unrecognized.
    """
    if not subject:
        return None
    s = str(subject).strip().lower()
    s = s.replace("%2b", "+").replace("c plus plus", "c++")
    s_plus = s.replace(" ", "+")
    if s in ("python", "py"):
        return "Python"
    if s in ("java",):
        return "Java"
    if s in ("c++", "cpp", "cplusplus", "c") or s_plus in ("c++", "c+"):
        return "C++"
    if s in ("english", "technical english", "tech english", "technical-english"):
        return "English"
    if s in ("general", "general concepts", "cs", "computer science", "general-concepts", "dbms", "algorithms"):
        return "General"
    return None

@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(subject: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Project)
    if subject is not None:
        norm_subject = normalize_project_subject(subject)
        if not norm_subject:
            # If an unknown subject is requested, return empty list (prevents leaking across tracks)
            return []
        query = query.filter(Project.subject.ilike(norm_subject))
    else:
        # Exclude any records with missing/null subject
        query = query.filter(Project.subject.isnot(None), Project.subject != "")

    projects = query.all()

    result = []
    for p in projects:
        instructions = json.loads(p.instructions_json) if p.instructions_json else []
        requirements = json.loads(p.requirements_json) if p.requirements_json else []
        result.append(ProjectResponse(
            slug=p.slug,
            title=p.title,
            subject=p.subject,
            icon=p.icon,
            lesson=p.lesson_tag,
            language=p.language,
            file=p.file_name,
            description=p.description,
            xp=p.xp,
            defaultProgress=p.default_progress,
            instructions=instructions,
            requirements=requirements,
            starter_code=p.starter_code
        ))
    return result

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    norm_subject = normalize_project_subject(payload.subject)
    if not norm_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid subject '{payload.subject}'. Must be one of: Python, Java, C++, English, General."
        )

    # Derive slug
    clean_title = payload.title.strip().lower()
    base_slug = re.sub(r'[^a-z0-9]+', '-', clean_title).strip('-') or "custom-project"
    slug = payload.slug.strip() if payload.slug else f"{base_slug}-{norm_subject.lower()}"

    existing = db.query(Project).filter(Project.slug == slug).first()
    if existing:
        import time
        slug = f"{slug}-{int(time.time())}"

    default_meta = {
        "Python": ("🐍", "PYTHON", "main.py"),
        "Java": ("☕", "JAVA", "Main.java"),
        "C++": ("⚙️", "CPP", "main.cpp"),
        "English": ("📝", "MARKDOWN", "document.md"),
        "General": ("🗄️", "SQL", "solution.sql")
    }
    def_icon, def_lang, def_file = default_meta.get(norm_subject, ("💻", "TEXT", "main.txt"))

    proj = Project(
        slug=slug,
        title=payload.title.strip(),
        subject=norm_subject,
        icon=payload.icon or def_icon,
        lesson_tag=payload.lesson or f"{norm_subject} • Custom Workspace",
        language=payload.language or def_lang,
        file_name=payload.file or def_file,
        description=payload.description or f"Custom {norm_subject} project created by scholar.",
        xp=payload.xp or 100,
        default_progress=0,
        instructions_json=json.dumps(payload.instructions if payload.instructions else ["Define problem requirements.", "Implement solution.", "Test functionality."]),
        requirements_json=json.dumps(payload.requirements if payload.requirements else ["Problem Solving", "Architecture", "Clean Code"]),
        starter_code=payload.starter_code or f"# {payload.title}\n"
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)

    if current_user:
        progress_rec = UserProjectProgress(
            user_id=current_user.id,
            project_id=proj.slug,
            subject=norm_subject,
            saved_code=proj.starter_code,
            progress_percent=0,
            is_completed=False
        )
        db.add(progress_rec)
        db.commit()

    instructions = json.loads(proj.instructions_json) if proj.instructions_json else []
    requirements = json.loads(proj.requirements_json) if proj.requirements_json else []

    return ProjectResponse(
        slug=proj.slug,
        title=proj.title,
        subject=proj.subject,
        icon=proj.icon,
        lesson=proj.lesson_tag,
        language=proj.language,
        file=proj.file_name,
        description=proj.description,
        xp=proj.xp,
        defaultProgress=proj.default_progress,
        instructions=instructions,
        requirements=requirements,
        starter_code=proj.starter_code
    )

@router.get("/projects/{project_slug}", response_model=ProjectResponse)
def get_project_detail(project_slug: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.slug == project_slug).first()
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    instructions = json.loads(p.instructions_json) if p.instructions_json else []
    requirements = json.loads(p.requirements_json) if p.requirements_json else []

    return ProjectResponse(
        slug=p.slug,
        title=p.title,
        subject=p.subject,
        icon=p.icon,
        lesson=p.lesson_tag,
        language=p.language,
        file=p.file_name,
        description=p.description,
        xp=p.xp,
        defaultProgress=p.default_progress,
        instructions=instructions,
        requirements=requirements,
        starter_code=p.starter_code
    )

ALL_BADGES_SPEC = [
    {
        "slug": "first_step",
        "title": "First Step",
        "icon": "🌱",
        "category": "milestone",
        "description": "Complete your very first coding lesson and submit code.",
        "xp_required": 50,
        "target_progress": 1,
        "unit": "Lesson"
    },
    {
        "slug": "on_fire",
        "title": "On Fire",
        "icon": "🔥",
        "category": "dedication",
        "description": "Maintain a 7-day unbroken coding practice streak.",
        "xp_required": 350,
        "target_progress": 7,
        "unit": "Days"
    },
    {
        "slug": "graduate",
        "title": "Graduate",
        "icon": "🎓",
        "category": "mastery",
        "description": "Complete your first full syllabus track.",
        "xp_required": 500,
        "target_progress": 1,
        "unit": "Course"
    },
    {
        "slug": "xp_hunter",
        "title": "XP Hunter",
        "icon": "⚡",
        "category": "honor",
        "description": "Accumulate your first 1,000 XP in competitive practice.",
        "xp_required": 1000,
        "target_progress": 1000,
        "unit": "XP"
    },
    {
        "slug": "bookworm",
        "title": "Bookworm",
        "icon": "📖",
        "category": "milestone",
        "description": "Complete 10 interactive code lessons across all tracks.",
        "xp_required": 500,
        "target_progress": 10,
        "unit": "Lessons"
    },
    {
        "slug": "code_craftsman",
        "title": "Code Craftsman",
        "icon": "🛠️",
        "category": "mastery",
        "description": "Complete real-world hands-on coding projects.",
        "xp_required": 300,
        "target_progress": 1,
        "unit": "Project"
    },
    {
        "slug": "curriculum_master",
        "title": "Curriculum Master",
        "icon": "🏛️",
        "category": "mastery",
        "description": "Complete 2 complete certification course syllabi.",
        "xp_required": 1500,
        "target_progress": 2,
        "unit": "Courses"
    },
    {
        "slug": "unstoppable_streak",
        "title": "Unstoppable Streak",
        "icon": "🌊",
        "category": "dedication",
        "description": "Maintain a 30-day continuous learning commitment.",
        "xp_required": 1500,
        "target_progress": 30,
        "unit": "Days"
    },
    {
        "slug": "knowledge_seeker",
        "title": "Knowledge Seeker",
        "icon": "💎",
        "category": "honor",
        "description": "Accumulate 5,000 XP through lessons, challenges, and mentors.",
        "xp_required": 5000,
        "target_progress": 5000,
        "unit": "XP"
    },
    {
        "slug": "polyglot_pioneer",
        "title": "Polyglot Pioneer",
        "icon": "🌐",
        "category": "milestone",
        "description": "Begin learning and completing lessons in all 4 tracks.",
        "xp_required": 400,
        "target_progress": 4,
        "unit": "Languages"
    }
]

SLUG_ALIASES = {
    "first_steps": "first_step",
    "streak_master": "on_fire",
    "code_artisan": "code_craftsman",
    "royal_scholar": "xp_hunter"
}

def ensure_badges_exist(db: Session):
    for b_spec in ALL_BADGES_SPEC:
        existing = db.query(Badge).filter(Badge.slug == b_spec["slug"]).first()
        if not existing:
            db.add(Badge(
                slug=b_spec["slug"],
                title=b_spec["title"],
                description=b_spec["description"],
                icon=b_spec["icon"],
                category=b_spec["category"],
                xp_required=b_spec["xp_required"]
            ))
    db.commit()

def calculate_tier(xp: int) -> str:
    if xp >= 2500:
        return "STAGE 4 • CURRICULUM MASTERY"
    elif xp >= 1500:
        return "STAGE 3 • ADVANCED ALGORITHMS"
    elif xp >= 750:
        return "STAGE 2 • CORE ARCHITECTURE"
    return "STAGE 1 • FUNDAMENTALS & BASICS"

def evaluate_user_achievements(db: Session, current_user: Optional[User]):
    ensure_badges_exist(db)

    track_definitions = [
        {"slug": "Python", "name": "Python Essentials", "icon": "🐍", "total": 8},
        {"slug": "Java", "name": "Java Fundamentals", "icon": "☕", "total": 8},
        {"slug": "C++", "name": "C++ Systems", "icon": "⚙️", "total": 8},
        {"slug": "English", "name": "Technical English", "icon": "🇬🇧", "total": 8},
    ]

    for td in track_definitions:
        actual_lessons = db.query(Lesson).filter(Lesson.track_slug.ilike(td["slug"])).count()
        if actual_lessons > 0:
            td["total"] = actual_lessons

    total_curriculum_lessons = sum(t["total"] for t in track_definitions)
    total_curriculum_courses = len(track_definitions)

    if not current_user:
        # Honest guest/empty state
        track_progress_list = []
        for t in track_definitions:
            track_progress_list.append(TrackProgressItem(
                slug=t["slug"],
                name=t["name"],
                icon=t["icon"],
                completed_lessons=0,
                total_lessons=t["total"],
                progress_percent=0,
                status="Not Started"
            ))

        badges_list = []
        for b_spec in ALL_BADGES_SPEC:
            badges_list.append(BadgeResponse(
                slug=b_spec["slug"],
                title=b_spec["title"],
                description=b_spec["description"],
                icon=b_spec["icon"],
                category=b_spec["category"],
                xp_required=b_spec["xp_required"],
                unlocked=False,
                unlocked_at=None,
                current_progress=0,
                target_progress=b_spec["target_progress"],
                progress_percentage=0,
                progress_label=f"Progress: 0 / {b_spec['target_progress']} {b_spec['unit']}"
            ))

        return {
            "user_authenticated": False,
            "learner_name": "Guest Scholar",
            "learner_avatar": "G",
            "current_level": 1,
            "total_xp": 0,
            "streak_days": 0,
            "rank_tier": "STAGE 1 • FUNDAMENTALS & BASICS",
            "xp_to_next_level": 300,
            "next_level": 2,
            "level_progress_percent": 0,
            "total_lessons_completed": 0,
            "total_curriculum_lessons": total_curriculum_lessons,
            "total_courses_completed": 0,
            "total_curriculum_courses": total_curriculum_courses,
            "overall_progress_percent": 0,
            "tracks": track_progress_list,
            "unlocked_badges_count": 0,
            "total_badges_count": len(badges_list),
            "badges": badges_list
        }

    # Authenticated user evaluation
    user_id = current_user.id
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    total_xp = profile.total_xp if profile else 0
    streak_days = profile.streak_days if profile else 0
    current_level = profile.current_level if profile else max(1, total_xp // 300)
    rank_tier = calculate_tier(total_xp)

    # Real user lesson completions (explicitly scoped to current_user.id)
    completed_lessons_rows = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.completed == True
    ).all()

    track_completed_lessons = {"Python": set(), "Java": set(), "C++": set(), "English": set()}
    for row in completed_lessons_rows:
        subj = (row.subject or "").strip().title()
        if subj.lower() in ("c++", "cpp"):
            subj = "C++"
        if subj in track_completed_lessons:
            track_completed_lessons[subj].add(row.lesson_number)

    track_progress_list = []
    completed_courses_count = 0
    distinct_active_tracks = 0
    total_distinct_completed_lessons = 0

    for t in track_definitions:
        completed_set = track_completed_lessons.get(t["slug"], set())
        completed_count = len(completed_set)
        total_distinct_completed_lessons += completed_count
        if completed_count > 0:
            distinct_active_tracks += 1

        is_track_completed = (completed_count >= t["total"])
        if is_track_completed:
            completed_courses_count += 1
            status_text = "Completed ✓"
        elif completed_count > 0:
            status_text = "In Progress"
        else:
            status_text = "Not Started"

        pct = min(100, int((completed_count / t["total"]) * 100)) if t["total"] > 0 else 0
        track_progress_list.append(TrackProgressItem(
            slug=t["slug"],
            name=t["name"],
            icon=t["icon"],
            completed_lessons=completed_count,
            total_lessons=t["total"],
            progress_percent=pct,
            status=status_text
        ))

    # Real project completions (explicitly scoped to current_user.id)
    completed_projects_count = db.query(UserProjectProgress).filter(
        UserProjectProgress.user_id == user_id,
        UserProjectProgress.is_completed == True
    ).count()

    # User badges currently in database
    existing_ub_rows = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    user_badges_map = {}
    for ub in existing_ub_rows:
        canonical_slug = SLUG_ALIASES.get(ub.badge_slug, ub.badge_slug)
        user_badges_map[canonical_slug] = ub

    now = datetime.utcnow()
    newly_awarded = False
    badges_list = []
    unlocked_count = 0

    for b_spec in ALL_BADGES_SPEC:
        slug = b_spec["slug"]
        target = b_spec["target_progress"]

        # Calculate accurate current progress from real recorded activity
        if slug == "first_step":
            current_val = total_distinct_completed_lessons
        elif slug == "on_fire":
            current_val = streak_days
        elif slug == "graduate":
            current_val = completed_courses_count
        elif slug == "xp_hunter":
            current_val = total_xp
        elif slug == "bookworm":
            current_val = total_distinct_completed_lessons
        elif slug == "code_craftsman":
            current_val = completed_projects_count
        elif slug == "curriculum_master":
            current_val = completed_courses_count
        elif slug == "unstoppable_streak":
            current_val = streak_days
        elif slug == "knowledge_seeker":
            current_val = total_xp
        elif slug == "polyglot_pioneer":
            current_val = distinct_active_tracks
        else:
            current_val = 0

        is_qualifying = (current_val >= target)

        # Award badge only if qualifying and not previously awarded
        if is_qualifying and slug not in user_badges_map:
            new_ub = UserBadge(user_id=user_id, badge_slug=slug, unlocked_at=now)
            db.add(new_ub)
            user_badges_map[slug] = new_ub
            newly_awarded = True

        is_unlocked = (slug in user_badges_map)
        if is_unlocked:
            unlocked_count += 1
            unlocked_at = user_badges_map[slug].unlocked_at
            pct = 100
            prog_label = f"Progress: {target} / {target} {b_spec['unit']}"
        else:
            unlocked_at = None
            pct = min(99, int((current_val / target) * 100)) if target > 0 else 0
            prog_label = f"Progress: {current_val} / {target} {b_spec['unit']}"

        badges_list.append(BadgeResponse(
            slug=slug,
            title=b_spec["title"],
            description=b_spec["description"],
            icon=b_spec["icon"],
            category=b_spec["category"],
            xp_required=b_spec["xp_required"],
            unlocked=is_unlocked,
            unlocked_at=unlocked_at,
            current_progress=current_val,
            target_progress=target,
            progress_percentage=pct,
            progress_label=prog_label
        ))

    if newly_awarded:
        db.commit()

    # Next level calculation (300 XP per level step)
    next_level = current_level + 1
    next_level_target_xp = next_level * 300
    xp_to_next = max(0, next_level_target_xp - total_xp)
    current_level_base = (current_level - 1) * 300
    level_progress_percent = min(100, max(0, int(((total_xp - current_level_base) / 300) * 100)))

    # Overall curriculum progress
    overall_progress_percent = min(100, int((total_distinct_completed_lessons / total_curriculum_lessons) * 100)) if total_curriculum_lessons > 0 else 0

    learner_name = current_user.full_name or "Scholar"
    learner_avatar = learner_name[0].upper() if learner_name else "S"

    return {
        "user_authenticated": True,
        "learner_name": learner_name,
        "learner_avatar": learner_avatar,
        "current_level": current_level,
        "total_xp": total_xp,
        "streak_days": streak_days,
        "rank_tier": rank_tier,
        "xp_to_next_level": xp_to_next,
        "next_level": next_level,
        "level_progress_percent": level_progress_percent,
        "total_lessons_completed": total_distinct_completed_lessons,
        "total_curriculum_lessons": total_curriculum_lessons,
        "total_courses_completed": completed_courses_count,
        "total_curriculum_courses": total_curriculum_courses,
        "overall_progress_percent": overall_progress_percent,
        "tracks": track_progress_list,
        "unlocked_badges_count": unlocked_count,
        "total_badges_count": len(badges_list),
        "badges": badges_list
    }

@router.get("/badges", response_model=List[BadgeResponse])
def get_badges(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Retrieve badges with real unlock status and progress for authenticated user."""
    overview = evaluate_user_achievements(db, current_user)
    return overview["badges"]

@router.get("/achievements/overview", response_model=AchievementsOverviewResponse)
def get_achievements_overview(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Retrieve comprehensive real achievements and curriculum stats for authenticated user."""
    overview = evaluate_user_achievements(db, current_user)
    return AchievementsOverviewResponse(**overview)


@router.get("/speaking-prompts", response_model=SpeakingPromptListResponse)
def get_speaking_prompts(
    difficulty: Optional[str] = None,
    task_type: Optional[str] = None,
    category: Optional[str] = None,
    exclude_recent: bool = False,
    limit: int = 50,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves varied English speaking assessment prompts filtered by difficulty and task type.
    If exclude_recent is enabled and user is authenticated, deprioritizes/excludes prompts
    the user attempted recently to prevent unnecessary prompt repetition.
    """
    candidates = list(SPEAKING_PROMPTS)

    if difficulty and difficulty.strip().lower() not in ("all", ""):
        diff_lower = difficulty.strip().lower()
        candidates = [p for p in candidates if p["difficulty"].lower() == diff_lower]

    if task_type and task_type.strip().lower() not in ("all", ""):
        task_lower = task_type.strip().lower()
        candidates = [p for p in candidates if p["task_type"].lower() == task_lower]

    if category and category.strip().lower() not in ("all", ""):
        cat_lower = category.strip().lower()
        candidates = [p for p in candidates if cat_lower in p["category"].lower()]

    if not candidates:
        candidates = list(SPEAKING_PROMPTS)

    # Exclude recent attempts if requested and authenticated
    recent_targets = set()
    if exclude_recent and current_user:
        recent_rows = (
            db.query(SpeakingAssessment.target_text)
            .filter(SpeakingAssessment.user_id == current_user.id)
            .order_by(SpeakingAssessment.created_at.desc())
            .limit(10)
            .all()
        )
        recent_targets = {r[0].strip().lower() for r in recent_rows if r[0]}

    fresh_candidates = [p for p in candidates if p["prompt_text"].strip().lower() not in recent_targets]
    filtered_candidates = fresh_candidates if (fresh_candidates and exclude_recent and recent_targets) else candidates
    selected_pool = fresh_candidates if fresh_candidates else candidates

    import random
    selected = random.choice(selected_pool) if selected_pool else None

    prompt_items = [
        SpeakingPromptItem(
            id=p["id"],
            prompt_text=p["prompt_text"],
            target_text=p["prompt_text"],
            difficulty=p["difficulty"],
            task_type=p["task_type"],
            category=p["category"],
            target_pace_wpm_guide=p["target_pace_wpm_guide"],
            guidance=p["guidance"]
        )
        for p in filtered_candidates[:limit]
    ]

    selected_item = SpeakingPromptItem(
        id=selected["id"],
        prompt_text=selected["prompt_text"],
        target_text=selected["prompt_text"],
        difficulty=selected["difficulty"],
        task_type=selected["task_type"],
        category=selected["category"],
        target_pace_wpm_guide=selected["target_pace_wpm_guide"],
        guidance=selected["guidance"]
    ) if selected else None

    return SpeakingPromptListResponse(
        total=len(prompt_items),
        total_count=len(prompt_items),
        prompts=prompt_items,
        selected_prompt=selected_item
    )


