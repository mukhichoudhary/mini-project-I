from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class MentorChatRequest(BaseModel):
    subject: str = "General"
    message: str
    api_key: Optional[str] = None

class MentorMessageItem(BaseModel):
    id: int
    role: str
    content: str
    subject: str
    created_at: datetime

    class Config:
        from_attributes = True

class MentorChatResponse(BaseModel):
    reply: str
    subject: str
    source: Optional[str] = "offline_engine"
    action_suggestion: Optional[str] = None

class MentorStatusResponse(BaseModel):
    gemini_configured: bool
    model: str
    status: str
    message: str
