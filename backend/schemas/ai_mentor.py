from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class LearningPlanItem(BaseModel):
    topic: str
    reason: str
    activity: str
    priority: str = Field(default="Medium", description="High, Medium, or Low")

class AIMentorAssessmentRequest(BaseModel):
    subject: Optional[str] = None
    studentId: Optional[str] = None
    studentName: Optional[str] = None
    overallScore: Optional[float] = None
    proficiencyLevel: Optional[str] = None
    grammarScore: Optional[float] = None
    vocabularyScore: Optional[float] = None
    writingScore: Optional[float] = None
    readingScore: Optional[float] = None
    pronunciationScore: Optional[float] = None
    semanticSimilarityScore: Optional[float] = None
    strengths: Optional[List[str]] = None
    weakAreas: Optional[List[str]] = None
    programmingLanguage: Optional[str] = None  # Python / Java / C++
    programmingScore: Optional[float] = None
    syntaxScore: Optional[float] = None
    conceptsScore: Optional[float] = None
    logicScore: Optional[float] = None
    codeTracingScore: Optional[float] = None
    programmingWeakAreas: Optional[List[str]] = None
    previousAssessments: Optional[List[Dict[str, Any]]] = None

class AIMentorAssessmentResponse(BaseModel):
    overallFeedback: str
    strengths: List[str]
    weakAreas: List[str]
    recommendations: List[str]
    learningPlan: List[LearningPlanItem]
    motivationalMessage: str
