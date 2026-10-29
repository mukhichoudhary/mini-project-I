from typing import List, Optional
from pydantic import BaseModel

class QuestionResponse(BaseModel):
    id: int
    question: str
    description: str
    options: List[str]
    answer: int
    explanation: Optional[str] = None

class LessonResponse(BaseModel):
    id: int
    track_slug: str
    lesson_number: int
    title: str
    description: Optional[str] = None
    theory: Optional[str] = None
    questions: List[QuestionResponse] = []

class TrackResponse(BaseModel):
    slug: str
    name: str
    icon: str
    description: Optional[str] = None
    total_lessons: int

class ProjectResponse(BaseModel):
    slug: str
    title: str
    subject: str
    icon: str
    lesson: str
    language: str
    file: str
    description: str
    xp: int
    defaultProgress: int = 0
    instructions: List[str]
    requirements: List[str]
    starter_code: Optional[str] = None

class ProjectCreate(BaseModel):
    title: str
    subject: str
    slug: Optional[str] = None
    icon: Optional[str] = None
    lesson: Optional[str] = None
    language: Optional[str] = None
    file: Optional[str] = None
    description: Optional[str] = None
    xp: Optional[int] = 100
    instructions: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    starter_code: Optional[str] = None

from datetime import datetime

class TrackProgressItem(BaseModel):
    slug: str
    name: str
    icon: str
    completed_lessons: int
    total_lessons: int
    progress_percent: int
    status: str  # "Completed ✓", "In Progress", "Not Started"

class BadgeResponse(BaseModel):
    slug: str
    title: str
    description: str
    icon: str
    category: str
    xp_required: int
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None
    current_progress: int = 0
    target_progress: int = 1
    progress_percentage: int = 0
    progress_label: str = ""

class AchievementsOverviewResponse(BaseModel):
    user_authenticated: bool
    learner_name: str
    learner_avatar: str
    current_level: int
    total_xp: int
    streak_days: int
    rank_tier: str
    xp_to_next_level: int
    next_level: int
    level_progress_percent: int
    total_lessons_completed: int
    total_curriculum_lessons: int
    total_courses_completed: int
    total_curriculum_courses: int
    overall_progress_percent: int
    tracks: List[TrackProgressItem]
    unlocked_badges_count: int
    total_badges_count: int
    badges: List[BadgeResponse]
