from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AdaptiveQuestionItem(BaseModel):
    question: str
    description: Optional[str] = "Analyze and choose the correct answer."
    options: List[str]
    answer: int
    explanation: Optional[str] = None

class AdaptiveAnalyticsResponse(BaseModel):
    subject: str
    total_attempts: int
    overall_accuracy: float
    recent_accuracy: float
    trend: str
    recommended_difficulty: str
    is_diagnostic: bool
    weak_topics: List[str] = []
    strong_topics: List[str] = []
    target_topic: Optional[str] = None
    target_lesson_number: Optional[int] = 1
    topic_breakdown: Dict[str, Any] = {}
    status_summary: str

class AdaptiveQuizGenerateRequest(BaseModel):
    subject: str = "Python"
    lesson_number: Optional[int] = None
    target_topic: Optional[str] = None

class AdaptiveQuizGenerateResponse(BaseModel):
    subject: str
    lesson_number: Optional[int] = None
    topic: str
    difficulty: str
    adaptation_rationale: str
    improvement_suggestions: List[str] = []
    is_ai_generated: bool = False
    questions: List[AdaptiveQuestionItem]
    analytics: Optional[Dict[str, Any]] = None

class AdaptiveQuizSubmitRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str = "Intermediate"
    lesson_number: Optional[int] = None
    answers: List[int]
    questions: List[Dict[str, Any]]

class AdaptiveQuizSubmitResponse(BaseModel):
    status: str
    attempt_id: int
    subject: str
    topic: str
    difficulty: str
    score: int
    total_questions: int
    percentage: float
    passed: bool
    xp_earned: int
    feedback: str
    next_recommended_difficulty: str
    feedback_breakdown: List[Dict[str, Any]] = []

class AdaptiveAttemptHistoryItem(BaseModel):
    id: int
    subject: str
    topic: str
    difficulty: str
    score: int
    total_questions: int
    percentage: float
    passed: bool
    xp_earned: int
    feedback: Optional[str] = None
    created_at: str
