import asyncio
import json
import logging
from typing import Optional, List, Dict, Any
import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserProfile, UserLessonProgress
from app.schemas.ai_mentor import (
    AIMentorAssessmentRequest,
    AIMentorAssessmentResponse,
    LearningPlanItem
)
from app.auth.security import get_optional_user
from app.config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai-mentor", tags=["AI Mentor Assessment"])

def generate_dynamic_fallback(req: AIMentorAssessmentRequest) -> AIMentorAssessmentResponse:
    """
    Intelligent dynamic feedback generator when AI API is unreachable or rate-limited.
    Strictly isolated: English evaluations focus purely on linguistic & communication metrics;
    Programming evaluations focus purely on the target coding language.
    """
    name = req.studentName or "Scholar"
    level = req.proficiencyLevel or "Intermediate"
    overall = req.overallScore or 70.0
    prog_lang = (req.subject or req.programmingLanguage or "Python").strip()
    is_english = prog_lang.lower() in ("english", "technical english", "tech english", "technical-english", "technical_english")

    if is_english:
        scores = {}
        if req.grammarScore is not None: scores["English Grammar"] = req.grammarScore
        if req.vocabularyScore is not None: scores["Vocabulary Mastery"] = req.vocabularyScore
        if req.writingScore is not None: scores["Writing & Syntactic Logic"] = req.writingScore
        if req.readingScore is not None: scores["Reading Comprehension"] = req.readingScore
        if req.semanticSimilarityScore is not None: scores["Spoken Articulation"] = req.semanticSimilarityScore

        strengths = [k for k, v in scores.items() if v >= 70] or ["Vocabulary Knowledge", "Sentence Building"]
        weak_areas = [k for k, v in scores.items() if v < 70] or ["Grammar Consistency"]

        strengths_str = ", ".join(strengths)
        weaks_str = ", ".join(weak_areas)

        overall_feedback = (
            f"Hello {name}. In the English Communication Track, your overall proficiency is {overall}% ({level} Level). "
            f"You demonstrate notable aptitude in {strengths_str}. "
            f"Your key linguistic growth focus is directed toward {weaks_str}."
        )

        learning_plan = []
        if any("grammar" in w.lower() for w in weak_areas) or (req.grammarScore is not None and req.grammarScore < 70):
            learning_plan.append(LearningPlanItem(
                topic="Grammar & Sentence Cohesion",
                reason="Tense consistency, prepositions, and syntactic connectors will elevate your professional expression.",
                activity="Complete daily 15-minute sentence reconstruction drills and grammar precision exercises.",
                priority="High"
            ))
        if any("vocabulary" in w.lower() for w in weak_areas) or (req.vocabularyScore is not None and req.vocabularyScore < 70):
            learning_plan.append(LearningPlanItem(
                topic="Lexical Expansion & Collocations",
                reason="Broadening active technical vocabulary improves nuance and fluency in workplace communication.",
                activity="Learn 5 new thematic collocations daily and apply them in writing and speaking practice.",
                priority="High" if req.vocabularyScore is not None and req.vocabularyScore < 60 else "Medium"
            ))
        if any("writing" in w.lower() for w in weak_areas) or (req.writingScore is not None and req.writingScore < 70):
            learning_plan.append(LearningPlanItem(
                topic="Writing and Linguistic Logic",
                reason="Syntactic connectors and clear paragraph structuring strengthen professional documentation.",
                activity="Draft concise summaries for engineering scenarios and PR reviews using parallel sentence structure.",
                priority="Medium"
            ))
        if any("reading" in w.lower() or "comprehension" in w.lower() for w in weak_areas) or (req.readingScore is not None and req.readingScore < 70):
            learning_plan.append(LearningPlanItem(
                topic="Reading Comprehension & Synthesis",
                reason="Analyzing complex technical texts and RFCs sharpens cognitive reading fluency.",
                activity="Read one technical engineering article daily and write a 3-bullet core takeaway summary.",
                priority="Medium"
            ))
        if any("spoken" in w.lower() or "pronunciation" in w.lower() for w in weak_areas) or (req.semanticSimilarityScore is not None and req.semanticSimilarityScore < 75):
            learning_plan.append(LearningPlanItem(
                topic="Spoken Fluency & Verbal Articulation",
                reason="Regular vocalization with steady cadence builds conversational confidence.",
                activity="Practice 5 speaking prompts daily aiming for 110-140 WPM fluent pace.",
                priority="Medium"
            ))
        if not learning_plan:
            learning_plan.append(LearningPlanItem(
                topic="Advanced Professional Discourse",
                reason="Your linguistic fundamentals are strong; focus on persuasive executive presentation and nuanced discourse.",
                activity="Deliver a 60-second spontaneous spoken presentation on a modern technical topic.",
                priority="Medium"
            ))

        recommendations = [
            f"Dedicate the first 20 minutes of each study session to your highest priority English area: {learning_plan[0].topic}.",
            "Practice reading technical prompts aloud to build verbal muscle memory and speaking cadence.",
            "Review explanations of missed questions to solidify grammatical conventions and vocabulary usage.",
            "Maintain a steady daily streak to strengthen long-term language retention."
        ]
        motivational = (
            f"You are making steady, measurable strides in English communication, {name}! "
            f"Consistent practice in grammar and vocabulary will advance you to fluent professional proficiency."
        )

        return AIMentorAssessmentResponse(
            overallFeedback=overall_feedback,
            strengths=strengths,
            weakAreas=weak_areas,
            recommendations=recommendations,
            learningPlan=learning_plan,
            motivationalMessage=motivational
        )
    else:
        # Strictly programming-only evaluation for Python, Java, C++
        scores = {}
        if req.syntaxScore is not None: scores[f"{prog_lang} Syntax"] = req.syntaxScore
        if req.conceptsScore is not None: scores[f"{prog_lang} Concepts"] = req.conceptsScore
        if req.logicScore is not None: scores[f"{prog_lang} Programming Logic"] = req.logicScore
        if req.codeTracingScore is not None: scores[f"{prog_lang} Code Tracing & Output"] = req.codeTracingScore

        scores_strengths = [k for k, v in scores.items() if v >= 70]
        scores_weaks = [k for k, v in scores.items() if v < 70]

        filtered_strengths = [s for s in (req.strengths or []) if not any(x in s.lower() for x in ["grammar", "vocabulary", "reading", "pronunciation", "speech"])]
        strengths = scores_strengths or filtered_strengths or ([f"{prog_lang} Syntax & Structure", f"{prog_lang} Programming Logic"] if overall >= 60 else [f"{prog_lang} Core Concepts"])

        filtered_weaks = [w for w in (req.programmingWeakAreas or req.weakAreas or []) if not any(x in w.lower() for x in ["grammar", "vocabulary", "reading", "pronunciation", "speech"])]
        weak_areas = scores_weaks or filtered_weaks or ([f"{prog_lang} Control Flow & Logic"] if overall < 80 else [f"{prog_lang} Algorithmic Optimization"])

        strengths_str = ", ".join(strengths)
        weaks_str = ", ".join(weak_areas)

        overall_feedback = (
            f"Hello {name}. In the {prog_lang} Masterclass, your programming proficiency stands at {overall}% ({level} Level). "
            f"Your performance indicates solid execution in {strengths_str}. "
            f"Targeted practice on {weaks_str} will elevate your engineering rigor."
        )

        learning_plan = []
        if (req.syntaxScore is not None and req.syntaxScore < 70) or any("syntax" in w.lower() for w in weak_areas):
            learning_plan.append(LearningPlanItem(
                topic=f"{prog_lang}: Syntax & Code Structure",
                reason=f"Eliminating syntax ambiguity and mastering {prog_lang} operators ensures error-free compilation and execution.",
                activity=f"Complete 5 syntax debugging and code-correction drills focusing specifically on {prog_lang} keywords and structure.",
                priority="High"
            ))
        if (req.conceptsScore is not None and req.conceptsScore < 70) or any("concept" in w.lower() for w in weak_areas):
            learning_plan.append(LearningPlanItem(
                topic=f"{prog_lang}: Core Concepts & Types",
                reason=f"Strengthening mental models for {prog_lang} variables, data types, functions, and memory constructs.",
                activity=f"Implement small modules in {prog_lang} practicing data types, function scope, and language-specific constructs.",
                priority="High" if req.conceptsScore is not None and req.conceptsScore < 60 else "Medium"
            ))
        if (req.logicScore is not None and req.logicScore < 70) or any("logic" in w.lower() for w in weak_areas):
            learning_plan.append(LearningPlanItem(
                topic=f"{prog_lang}: Programming Logic & Problem Solving",
                reason=f"Handling nested conditions, loop boundaries, and algorithmic edge cases prevents runtime bugs.",
                activity=f"Solve 5 algorithmic logic tracing challenges with branching conditions and loop iteration in {prog_lang}.",
                priority="High"
            ))
        if (req.codeTracingScore is not None and req.codeTracingScore < 70) or any("tracing" in w.lower() or "output" in w.lower() for w in weak_areas):
            learning_plan.append(LearningPlanItem(
                topic=f"{prog_lang}: Code Tracing & Output Prediction",
                reason=f"Tracing execution paths and variable states step-by-step builds intuitive debugging capability.",
                activity=f"Manually trace and predict execution outputs for 5 complex {prog_lang} code snippets before running them.",
                priority="Medium"
            ))

        if not learning_plan:
            learning_plan.append(LearningPlanItem(
                topic=f"{prog_lang}: Modular Design & Architectural Efficiency",
                reason=f"Your {prog_lang} fundamentals are sound; focus on decoupled design patterns, clean code, and time complexity.",
                activity=f"Build an end-to-end modular terminal application in {prog_lang} applying clean separation of concerns.",
                priority="Medium"
            ))

        recommendations = [
            f"Dedicate the first 20 minutes of each study session to your highest priority area: {learning_plan[0].topic}.",
            f"Trace {prog_lang} code line-by-line on paper before running it to build strong mental execution models.",
            f"Analyze time and space complexity (Big-O) for all data manipulation routines in {prog_lang}.",
            f"Write comprehensive test cases covering boundary values, empty inputs, and type constraints in {prog_lang}."
        ]
        motivational = (
            f"You are writing cleaner, more resilient {prog_lang} code every day, {name}! "
            f"With disciplined practice targeting {weaks_str}, you will comfortably advance to senior engineering tiers."
        )

        return AIMentorAssessmentResponse(
            overallFeedback=overall_feedback,
            strengths=strengths,
            weakAreas=weak_areas,
            recommendations=recommendations,
            learningPlan=learning_plan,
            motivationalMessage=motivational
        )


async def call_gemini_assessment_mentor(
    req: AIMentorAssessmentRequest,
    api_key: str
) -> Optional[AIMentorAssessmentResponse]:
    """
    Sends detailed student assessment metrics to Google Gemini and extracts structured JSON feedback.
    Strictly isolates language learning from programming subjects.
    """
    prog_lang = (req.subject or req.programmingLanguage or "Python").strip()
    is_english = prog_lang.lower() in ("english", "technical english", "tech english", "technical-english", "technical_english")

    if is_english:
        system_instruction = (
            "You are the Chief Academic English & Communication Mentor for Bhasa_AI.\n"
            "Your task is to analyze a student's English language and communication proficiency results.\n\n"
            "STRICT RULES:\n"
            "1. Focus 100% on English language skills: Grammar, Vocabulary, Writing and Logic, and Reading and Comprehension.\n"
            "2. DO NOT mention computer programming, programming syntax, code, algorithms, loops, OOP, Python, Java, or C++.\n"
            "3. Accurately identify their actual strongest and weakest English areas based on the provided metrics.\n"
            "4. Output MUST BE A STRICT JSON OBJECT matching this exact schema:\n"
            "{\n"
            '  "overallFeedback": "string",\n'
            '  "strengths": ["string", "string"],\n'
            '  "weakAreas": ["string", "string"],\n'
            '  "recommendations": ["string", "string"],\n'
            '  "learningPlan": [\n'
            '    {\n'
            '      "topic": "string",\n'
            '      "reason": "string",\n'
            '      "activity": "string",\n'
            '      "priority": "High" | "Medium" | "Low"\n'
            '    }\n'
            '  ],\n'
            '  "motivationalMessage": "string"\n'
            "}"
        )
        student_prompt = (
            f"English Track Student Assessment Profile:\n"
            f"- Student ID: {req.studentId or 'N/A'}\n"
            f"- Student Name: {req.studentName or 'Student'}\n"
            f"- Overall Proficiency Score: {req.overallScore}%\n"
            f"- Predicted Proficiency Level: {req.proficiencyLevel or 'Intermediate'}\n"
            f"- Grammar Score: {req.grammarScore}%\n"
            f"- Vocabulary Score: {req.vocabularyScore}%\n"
            f"- Writing & Syntactic Logic Score: {req.writingScore}%\n"
            f"- Reading Comprehension Score: {req.readingScore}%\n"
            f"- Spoken Transcription Accuracy: {req.semanticSimilarityScore}%\n"
            f"- Declared Strengths: {req.strengths}\n"
            f"- Declared Weak Areas: {req.weakAreas}\n"
            f"- Previous Assessment History: {json.dumps(req.previousAssessments or [])}\n\n"
            "Generate the personalized English communication evaluation JSON now."
        )
    else:
        system_instruction = (
            f"You are the Senior Academic Software Engineering Mentor for {prog_lang} at Bhasa_AI.\n"
            f"Your task is to analyze a college student's {prog_lang} programming proficiency results.\n\n"
            "STRICT RULES:\n"
            f"1. Focus 100% on {prog_lang} software engineering skills across: Programming Syntax, Programming Concepts, and Programming Logic.\n"
            "2. DO NOT mention English grammar, reading comprehension essays, vocabulary drills, or spoken pronunciation.\n"
            f"3. Address student strengths and weaknesses specifically in {prog_lang} syntax, concepts, logic, and debugging.\n"
            f"4. All programming explanations, code examples, recommendations, and learning plans MUST correspond directly to {prog_lang}.\n"
            "5. Output MUST BE A STRICT JSON OBJECT matching this exact schema:\n"
            "{\n"
            '  "overallFeedback": "string",\n'
            '  "strengths": ["string", "string"],\n'
            '  "weakAreas": ["string", "string"],\n'
            '  "recommendations": ["string", "string"],\n'
            '  "learningPlan": [\n'
            '    {\n'
            '      "topic": "string",\n'
            '      "reason": "string",\n'
            '      "activity": "string",\n'
            '      "priority": "High" | "Medium" | "Low"\n'
            '    }\n'
            '  ],\n'
            '  "motivationalMessage": "string"\n'
            "}"
        )
        student_prompt = (
            f"{prog_lang} Masterclass Student Assessment Profile:\n"
            f"- Student ID: {req.studentId or 'N/A'}\n"
            f"- Student Name: {req.studentName or 'Student'}\n"
            f"- Programming Language: {prog_lang}\n"
            f"- Overall Proficiency Score: {req.overallScore}%\n"
            f"- Predicted Proficiency Level: {req.proficiencyLevel or 'Intermediate'}\n"
            f"- Programming Syntax Score: {req.syntaxScore or req.overallScore}%\n"
            f"- Programming Concepts Score: {req.conceptsScore or req.overallScore}%\n"
            f"- Programming Logic Score: {req.logicScore or req.overallScore}%\n"
            f"- Code Tracing & Output Score: {req.codeTracingScore or req.overallScore}%\n"
            f"- Programming Weak Areas: {req.programmingWeakAreas}\n"
            f"- Declared Strengths: {req.strengths}\n"
            f"- Declared Weak Areas: {req.weakAreas}\n"
            f"- Previous Assessment History: {json.dumps(req.previousAssessments or [])}\n\n"
            f"Generate the personalized {prog_lang} engineering evaluation JSON now."
        )

    models_to_try = [GEMINI_MODEL]

    # 1. Try REST API First (Fastest and most reliable on Windows)
    for target_model in models_to_try:
        try:
            rest_url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"
            payload_data = {
                "systemInstruction": {"parts": [{"text": system_instruction}]},
                "contents": [{"role": "user", "parts": [{"text": student_prompt}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 1200,
                    "responseMimeType": "application/json"
                }
            }
            async with httpx.AsyncClient(timeout=10.0) as http_client:
                resp = await http_client.post(rest_url, json=payload_data)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            cleaned_json = parts[0]["text"].strip()
                            if cleaned_json.startswith("```"):
                                lines = cleaned_json.split("\n")
                                if lines[0].startswith("```"): lines = lines[1:]
                                if lines and lines[-1].startswith("```"): lines = lines[:-1]
                                cleaned_json = "\n".join(lines).strip()
                            parsed = json.loads(cleaned_json)
                            return AIMentorAssessmentResponse(**parsed)
                else:
                    logger.warning(f"REST assessment call to {target_model} returned {resp.status_code}")
        except Exception as rest_err:
            logger.warning(f"REST assessment call error: {rest_err}")

    return None


@router.post("", response_model=AIMentorAssessmentResponse)
async def generate_ai_mentor_feedback(
    payload: AIMentorAssessmentRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Main AI Mentor endpoint:
    Accepts student assessment data, analyzes proficiency metrics, identifies strongest/weakest areas,
    and returns dynamically generated personalized feedback, topics, learning plans, and encouragement.
    """
    from sqlalchemy import func

    # Auto-enrich missing fields from database if student is logged in
    if current_user:
        if not payload.studentId:
            payload.studentId = str(current_user.id)
        if not payload.studentName:
            payload.studentName = current_user.full_name

        target_lang = (payload.subject or payload.programmingLanguage or (profile.chosen_language if profile else "Python")).strip()
        is_eng = target_lang.lower() in ("english", "technical english", "tech english", "technical-english", "technical_english")
        norm_subj = "English" if is_eng else target_lang

        if profile:
            if is_eng:
                payload.programmingLanguage = None
            elif not payload.programmingLanguage:
                payload.programmingLanguage = norm_subj
            if not payload.proficiencyLevel:
                payload.proficiencyLevel = "Intermediate" if profile.current_level >= 3 else "Beginner"

        # Check completed lesson progress strictly for this subject
        progress_records = (
            db.query(UserLessonProgress)
            .filter(
                UserLessonProgress.user_id == current_user.id,
                func.lower(UserLessonProgress.subject) == func.lower(norm_subj)
            )
            .all()
        )
        if progress_records and payload.overallScore is None:
            total_score = sum(p.score for p in progress_records)
            total_possible = sum(p.total_questions for p in progress_records)
            if total_possible > 0:
                payload.overallScore = round((total_score / total_possible) * 100, 1)

    # Use server key or fallback
    api_key = GEMINI_API_KEY.strip()

    if api_key:
        try:
            ai_response = await call_gemini_assessment_mentor(payload, api_key)
            if ai_response:
                return ai_response
        except Exception as e:
            logger.error(f"Error calling Gemini assessment mentor: {e}")

    # Fallback to intelligent dynamic feedback generation
    return generate_dynamic_fallback(payload)
