from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Authentication schemas
class UserRegister(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1, max_length=100)
    chosen_language: Optional[str] = "Python"
    daily_goal: Optional[int] = 15

class UserLogin(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)

class ForgotPasswordResponse(BaseModel):
    status: str
    message: str

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10)
    new_password: str = Field(..., min_length=6)

class ResetPasswordResponse(BaseModel):
    status: str
    message: str

class VerifyResetTokenResponse(BaseModel):
    valid: bool
    email: Optional[str] = None
    message: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    email: str
    full_name: str
    chosen_language: str
    daily_goal: int
    total_xp: int
    streak_days: int
    current_level: int
    rank_tier: str
    role: Optional[str] = "learner"

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    chosen_language: Optional[str] = None
    daily_goal: Optional[int] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse

# Progress schemas
class LessonProgressSubmit(BaseModel):
    subject: str
    lesson_number: int
    score: int
    total_questions: int = 5
    xp_earned: int = 0

class LessonProgressResponse(BaseModel):
    id: int
    subject: str
    lesson_number: int
    score: int
    total_questions: int
    xp_earned: int
    completed: bool
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProjectProgressSubmit(BaseModel):
    project_id: str
    subject: Optional[str] = None
    saved_code: Optional[str] = None
    progress_percent: Optional[int] = 0
    is_completed: Optional[bool] = False

class ProjectProgressResponse(BaseModel):
    id: int
    project_id: str
    subject: Optional[str] = None
    saved_code: Optional[str] = None
    progress_percent: int
    is_completed: bool

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    rank: int
    name: str
    track: str
    xp: int
    streak: int
    level: int
    is_current_user: bool = False
    accuracy: Optional[int] = None
    completed_lessons: int = 0

# Speaking Assessment schemas
class SpeakingAssessmentSubmit(BaseModel):
    target_text: str = Field(..., min_length=3, max_length=500)
    spoken_text: str = Field(..., max_length=500)
    transcription_accuracy: float = Field(..., ge=0.0, le=100.0)
    duration_seconds: Optional[float] = Field(None, ge=0.0, le=300.0)
    speaking_rate_wpm: Optional[float] = Field(None, ge=0.0, le=500.0)
    difficulty: Optional[str] = Field("intermediate", max_length=20)
    task_type: Optional[str] = Field("sentence_reading", max_length=50)

class SpeakingAssessmentResponse(BaseModel):
    id: int
    user_id: int
    target_text: str
    spoken_text: str
    transcription_accuracy: float
    duration_seconds: Optional[float] = None
    speaking_rate_wpm: Optional[float] = None
    pronunciation_status: str = "unavailable"
    pronunciation_notice: str = "Acoustic phoneme assessment engine is unavailable. Transcription similarity reflects speech-to-text recognition accuracy only."
    difficulty: Optional[str] = "intermediate"
    task_type: Optional[str] = "sentence_reading"
    feedback_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SpeakingPromptItem(BaseModel):
    id: str
    prompt_text: str
    target_text: Optional[str] = None
    difficulty: str  # Beginner, Intermediate, Advanced
    task_type: str  # sentence_reading, conversation, topic_description, short_response
    category: str
    target_pace_wpm_guide: str
    guidance: str

class SpeakingPromptListResponse(BaseModel):
    total: int
    total_count: Optional[int] = None
    prompts: List[SpeakingPromptItem]
    selected_prompt: Optional[SpeakingPromptItem] = None

class SpeakingStatsResponse(BaseModel):
    total_attempts: int
    average_accuracy: float
    average_wpm: Optional[float] = None
    best_accuracy: float
    attempts_by_difficulty: Dict[str, int]
    recent_trend: List[Dict[str, Any]]
