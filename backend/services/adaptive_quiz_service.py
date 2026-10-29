"""
Bhasa_AI - AI-Powered Adaptive Quiz Service
Analyzes real student performance history and generates personalized next quizzes
using Google Gemini API with strict validation and resilient curated fallbacks.
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.config import GEMINI_API_KEY, GEMINI_MODEL
from app.models.content import Question, Lesson, Track, AdaptiveQuizAttempt
from app.models.user import User, UserProfile, UserLessonProgress, Progress
from app.curriculum_data import CURRICULUM

logger = logging.getLogger(__name__)

# Subject-specific topic taxonomy mapping
SUBJECT_TOPICS = {
    "Python": {
        1: "Syntax, Indentation & Scope",
        2: "Data Types, Numbers & Casting",
        3: "Operators & String Slicing",
        4: "Conditionals & Pattern Matching",
        5: "Loops & Iterators",
        6: "Functions & Lambda Expressions",
        7: "Collections: Lists, Sets & Dicts",
        8: "OOP: Classes & Inheritance"
    },
    "Java": {
        1: "Java Syntax & JVM Entrypoint",
        2: "Variables, Data Types & Casting",
        3: "Operators & String Pool",
        4: "Decision Making & Switch",
        5: "Loops & Array Iteration",
        6: "Methods & Method Overloading",
        7: "Classes, Objects & 'this'",
        8: "OOP: Inheritance & Dynamic Dispatch"
    },
    "C++": {
        1: "C++ Syntax, Streams & Namespaces",
        2: "Variables, Constants & auto",
        3: "Operators & Logical Expressions",
        4: "Conditions & Switch Logic",
        5: "Loops & Range-based For",
        6: "Functions & Pass-by-Reference",
        7: "Pointers & Memory Addresses",
        8: "Classes, Objects & Constructors"
    },
    "English": {
        1: "Basic Vocabulary & Syntax",
        2: "Greetings & Professional Introductions",
        3: "Numbers, Quantifiers & Data Metrics",
        4: "Everyday Conversations & Collocations",
        5: "Grammar Basics: Parts of Speech & Prepositions",
        6: "Sentence Building & Syntactic Connectors",
        7: "Tenses Mastery & Temporal Precision",
        8: "Technical Reading Comprehension & Synthesis"
    }
}


def normalize_subject_name(subject: Optional[str]) -> str:
    """Normalize user input to canonical subject name: Python, Java, C++, English."""
    if not subject:
        return "Python"
    s = subject.strip().lower()
    if s in ("python", "py"):
        return "Python"
    elif s in ("java",):
        return "Java"
    elif s in ("c++", "cpp"):
        return "C++"
    elif s in ("english", "eng", "en"):
        return "English"
    return subject.strip().capitalize()


# =============================================================================
# 1. PERFORMANCE ANALYZER (GENUINE DATA ONLY)
# =============================================================================

def analyze_student_performance(
    db: Session,
    user_id: int,
    subject: str
) -> Dict[str, Any]:
    """
    Examines genuine saved quiz and lesson-attempt records for the given student and subject.
    Computes overall accuracy, recent accuracy trend, topic strengths, weak areas,
    and the appropriate difficulty recommendation for the next quiz.
    """
    norm_subject = normalize_subject_name(subject)

    # 1. Query real lesson attempts for this subject
    lesson_attempts = (
        db.query(UserLessonProgress)
        .filter(
            UserLessonProgress.user_id == user_id,
            func.lower(UserLessonProgress.subject) == norm_subject.lower()
        )
        .order_by(UserLessonProgress.updated_at.desc())
        .all()
    )

    # 2. Query real adaptive quiz attempts for this subject
    adaptive_attempts = (
        db.query(AdaptiveQuizAttempt)
        .filter(
            AdaptiveQuizAttempt.user_id == user_id,
            func.lower(AdaptiveQuizAttempt.subject) == norm_subject.lower()
        )
        .order_by(AdaptiveQuizAttempt.created_at.desc())
        .all()
    )

    total_attempts = len(lesson_attempts) + len(adaptive_attempts)

    # First-time learner handling (no fake data)
    if total_attempts == 0:
        topic_map = SUBJECT_TOPICS.get(norm_subject, {})
        first_topic = topic_map.get(1, "Fundamentals")
        return {
            "subject": norm_subject,
            "total_attempts": 0,
            "overall_accuracy": 0.0,
            "recent_accuracy": 0.0,
            "trend": "new",
            "recommended_difficulty": "Beginner",
            "is_diagnostic": True,
            "weak_topics": [],
            "strong_topics": [],
            "target_topic": first_topic,
            "target_lesson_number": 1,
            "topic_breakdown": {},
            "status_summary": f"First-time learner in {norm_subject}. Baseline diagnostic assessment recommended."
        }

    # Aggregate scores
    total_score = sum(l.score for l in lesson_attempts) + sum(a.score for a in adaptive_attempts)
    total_q = sum(l.total_questions for l in lesson_attempts) + sum(a.total_questions for a in adaptive_attempts)
    overall_accuracy = round((total_score / max(1, total_q)) * 100, 1)

    # Recent accuracy (last 3 attempts)
    recent_events = []
    for l in lesson_attempts[:3]:
        pct = (l.score / max(1, l.total_questions)) * 100
        recent_events.append({"pct": pct, "date": l.updated_at})
    for a in adaptive_attempts[:3]:
        recent_events.append({"pct": a.percentage, "date": a.created_at})

    recent_events.sort(key=lambda x: x["date"] or datetime.min, reverse=True)
    recent_window = recent_events[:3]
    recent_accuracy = round(sum(e["pct"] for e in recent_window) / max(1, len(recent_window)), 1) if recent_window else overall_accuracy

    # Trend calculation
    if recent_accuracy >= overall_accuracy + 6:
        trend = "improving"
    elif recent_accuracy <= overall_accuracy - 10 or recent_accuracy < 60:
        trend = "struggling"
    elif recent_accuracy < 70:
        trend = "needs_revision"
    else:
        trend = "steady"

    # Topic-wise performance breakdown
    topic_map = SUBJECT_TOPICS.get(norm_subject, {})
    topic_stats: Dict[str, Dict[str, Any]] = {}

    for l in lesson_attempts:
        t_name = topic_map.get(l.lesson_number, f"Lesson {l.lesson_number}")
        if t_name not in topic_stats:
            topic_stats[t_name] = {"score": 0, "total": 0, "attempts": 0, "lesson_number": l.lesson_number}
        topic_stats[t_name]["score"] += l.score
        topic_stats[t_name]["total"] += l.total_questions
        topic_stats[t_name]["attempts"] += 1

    for a in adaptive_attempts:
        t_name = a.topic
        if t_name not in topic_stats:
            topic_stats[t_name] = {"score": 0, "total": 0, "attempts": 0, "lesson_number": None}
        topic_stats[t_name]["score"] += a.score
        topic_stats[t_name]["total"] += a.total_questions
        topic_stats[t_name]["attempts"] += 1

    topic_breakdown = {}
    weak_topics = []
    strong_topics = []

    for t_name, stat in topic_stats.items():
        pct = round((stat["score"] / max(1, stat["total"])) * 100, 1)
        topic_breakdown[t_name] = {
            "accuracy": pct,
            "attempts": stat["attempts"],
            "lesson_number": stat.get("lesson_number")
        }
        if pct < 70:
            weak_topics.append(t_name)
        elif pct >= 80:
            strong_topics.append(t_name)

    # Recommended difficulty
    if trend == "improving" and recent_accuracy >= 80:
        recommended_difficulty = "Advanced"
    elif trend == "struggling" or recent_accuracy < 65:
        recommended_difficulty = "Beginner"
    else:
        recommended_difficulty = "Intermediate"

    # Select target topic: prioritize weakest topic, else advance to next incomplete lesson
    target_topic = None
    target_lesson_num = 1

    if weak_topics:
        target_topic = weak_topics[0]
        # find matching lesson number if any
        for l_num, t_title in topic_map.items():
            if t_title == target_topic:
                target_lesson_num = l_num
                break
    else:
        # Check next uncompleted lesson
        completed_lessons = {l.lesson_number for l in lesson_attempts if l.completed}
        for i in range(1, 9):
            if i not in completed_lessons:
                target_lesson_num = i
                target_topic = topic_map.get(i, f"Lesson {i}")
                break
        if not target_topic:
            target_topic = topic_map.get(8, "Advanced Synthesis")
            target_lesson_num = 8

    return {
        "subject": norm_subject,
        "total_attempts": total_attempts,
        "overall_accuracy": overall_accuracy,
        "recent_accuracy": recent_accuracy,
        "trend": trend,
        "recommended_difficulty": recommended_difficulty,
        "is_diagnostic": False,
        "weak_topics": weak_topics,
        "strong_topics": strong_topics,
        "target_topic": target_topic,
        "target_lesson_number": target_lesson_num,
        "topic_breakdown": topic_breakdown,
        "status_summary": (
            f"Learner has {total_attempts} recorded attempts in {norm_subject} with {overall_accuracy}% accuracy. "
            f"Trend: {trend}. Weak areas: {', '.join(weak_topics) if weak_topics else 'None'}. "
            f"Next recommended focus: '{target_topic}' at {recommended_difficulty} level."
        )
    }


# =============================================================================
# 2. QUESTION QUALITY & VALIDATION
# =============================================================================

def validate_quiz_question(q: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validates that a question dictionary adheres strictly to the curriculum schema:
    - question: non-empty string
    - options: list of exactly 4 non-empty distinct strings
    - answer: integer in range 0-3
    - explanation: non-empty string
    """
    if not isinstance(q, dict):
        return False, "Question item must be a dictionary"

    question_text = q.get("question") or q.get("question_text")
    if not question_text or not isinstance(question_text, str) or len(question_text.strip()) < 5:
        return False, "Question text must be at least 5 characters"

    options = q.get("options")
    if not options or not isinstance(options, list) or len(options) != 4:
        return False, "Question options must be a list of exactly 4 items"

    for idx, opt in enumerate(options):
        if not isinstance(opt, str) or len(opt.strip()) == 0:
            return False, f"Option {idx} cannot be empty"

    if len(set(options)) != len(options):
        return False, "Question options must be 4 distinct choices"

    answer = q.get("answer")
    if answer is None:
        answer = q.get("answer_index")
    if not isinstance(answer, int) or answer < 0 or answer > 3:
        return False, f"Answer index must be an integer between 0 and 3, got: {answer}"

    explanation = q.get("explanation")
    if not explanation or not isinstance(explanation, str) or len(explanation.strip()) < 5:
        return False, "Question explanation must be provided"

    return True, None


def validate_adaptive_quiz_payload(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Validates the complete Gemini response payload containing 5 questions."""
    if not isinstance(data, dict):
        return False, "Response must be a JSON object"

    questions = data.get("questions")
    if not questions or not isinstance(questions, list):
        return False, "Payload must contain a 'questions' list"

    if len(questions) < 3 or len(questions) > 5:
        return False, f"Quiz must contain between 3 and 5 questions, got {len(questions)}"

    for i, q in enumerate(questions):
        valid, err = validate_quiz_question(q)
        if not valid:
            return False, f"Question {i+1} validation failed: {err}"

    return True, None


# =============================================================================
# 3. CURATED QUESTION BANK FALLBACK ENGINE
# =============================================================================

def get_curated_fallback_quiz(
    db: Session,
    subject: str,
    target_lesson_num: int,
    difficulty: str,
    weak_topic: Optional[str] = None
) -> Dict[str, Any]:
    """
    Intelligent resilient fallback when Gemini is offline, rate-limited, or returns malformed output.
    Selects validated curriculum questions matching the student's weak topic and desired difficulty.
    """
    norm_subject = normalize_subject_name(subject)
    topic_map = SUBJECT_TOPICS.get(norm_subject, {})
    topic_name = weak_topic or topic_map.get(target_lesson_num, f"Lesson {target_lesson_num}")

    # 1. Query database questions for this lesson
    lesson = db.query(Lesson).filter(
        Lesson.track_slug.ilike(norm_subject),
        Lesson.lesson_number == target_lesson_num
    ).first()

    questions_list = []
    if lesson and lesson.questions:
        for q in lesson.questions:
            try:
                opts = json.loads(q.options_json) if q.options_json else []
            except Exception:
                opts = []
            if len(opts) == 4 and 0 <= q.answer_index <= 3:
                questions_list.append({
                    "question": q.question_text,
                    "description": q.description or f"Adaptive problem on {topic_name}",
                    "options": opts,
                    "answer": q.answer_index,
                    "explanation": q.explanation or "Carefully trace variable values and syntax rules."
                })

    # 2. If lesson had fewer than 5 questions, inspect CURRICULUM data file
    if len(questions_list) < 5 and norm_subject in CURRICULUM:
        track_curriculum = CURRICULUM[norm_subject].get("lessons", [])
        for l_item in track_curriculum:
            if l_item.get("lesson_number") == target_lesson_num:
                for q_item in l_item.get("questions", []):
                    opts = q_item.get("options", [])
                    ans = q_item.get("answer_index", 0)
                    if len(opts) == 4 and 0 <= ans <= 3:
                        cand = {
                            "question": q_item.get("question_text"),
                            "description": q_item.get("description", "Choose the correct answer."),
                            "options": opts,
                            "answer": ans,
                            "explanation": q_item.get("explanation", "Review the concept rules.")
                        }
                        # Avoid duplicates
                        if not any(existing["question"] == cand["question"] for existing in questions_list):
                            questions_list.append(cand)

    # 3. For English or missing tracks, provide verified curated diagnostic sets
    if len(questions_list) < 5 and norm_subject == "English":
        english_curated = [
            {
                "question": "Choose the sentence with correct subject-verb agreement:",
                "description": "Evaluate grammatical consistency in complex sentences.",
                "options": [
                    "The committee gives its report on Friday.",
                    "The committee give their report on Friday.",
                    "The committee are giving their reports on Friday.",
                    "The committee were gives its report on Friday."
                ],
                "answer": 0,
                "explanation": "In standard English, collective nouns like 'committee' take a singular verb ('gives') when acting as a unified body."
            },
            {
                "question": "Which word is the closest synonym for 'meticulous' in academic writing?",
                "description": "Assess technical and academic vocabulary proficiency.",
                "options": ["Precise and thorough", "Careless", "Quick", "Superficial"],
                "answer": 0,
                "explanation": "'Meticulous' means showing great attention to detail; very careful and precise."
            },
            {
                "question": "Identify the passive voice construction among the choices below:",
                "description": "Distinguish active vs passive voice structures.",
                "options": [
                    "The software patch was deployed by the engineering team.",
                    "The engineering team deployed the software patch.",
                    "Engineers will deploy the software tomorrow.",
                    "Everyone cheered after deploying the patch."
                ],
                "answer": 0,
                "explanation": "'Was deployed by' follows the 'form of be + past participle + by agent' passive structure."
            },
            {
                "question": "Select the correct conditional sentence denoting a hypothetical scenario:",
                "description": "Analyze subjunctive and conditional clauses.",
                "options": [
                    "If I were you, I would refactor this module immediately.",
                    "If I was you, I will refactor this module.",
                    "If I am you, I would refactored this module.",
                    "If I had been you, I will refactor this module."
                ],
                "answer": 0,
                "explanation": "Second conditional for hypothetical advice uses 'If + were', followed by 'would + base verb'."
            },
            {
                "question": "What is the primary function of a transitional word like 'Furthermore'?",
                "description": "Evaluate discourse markers and reading coherence.",
                "options": [
                    "To introduce an additional supporting point that reinforces the preceding idea.",
                    "To contradict the preceding sentence.",
                    "To summarize and conclude the entire paragraph.",
                    "To illustrate a chronological time delay."
                ],
                "answer": 0,
                "explanation": "'Furthermore' is an additive transition used to introduce additional evidence or arguments."
            }
        ]
        questions_list = english_curated

    # Format adaptive package
    return {
        "subject": norm_subject,
        "lesson_number": target_lesson_num,
        "topic": topic_name,
        "difficulty": difficulty,
        "adaptation_rationale": f"Curated adaptive quiz calibrated for {norm_subject} '{topic_name}' at {difficulty} level.",
        "improvement_suggestions": [
            f"Review the core theory for '{topic_name}' before testing your comprehension.",
            "Trace each option carefully to eliminate common boundary condition bugs."
        ],
        "is_ai_generated": False,
        "questions": questions_list[:5]
    }


# =============================================================================
# 4. GEMINI ADAPTIVE QUIZ GENERATOR
# =============================================================================

async def generate_adaptive_quiz(
    db: Session,
    user: User,
    subject: str,
    lesson_number: Optional[int] = None,
    target_topic_override: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main entry point: Analyzes student performance and requests Gemini to generate
    a tailored 5-question adaptive quiz. Validates response and falls back safely.
    """
    norm_subject = normalize_subject_name(subject)
    profile = analyze_student_performance(db, user.id, norm_subject)

    target_lesson_num = lesson_number or profile["target_lesson_number"]
    topic_map = SUBJECT_TOPICS.get(norm_subject, {})
    target_topic = target_topic_override or profile["target_topic"] or topic_map.get(target_lesson_num, f"Lesson {target_lesson_num}")
    difficulty = profile["recommended_difficulty"]

    # If Gemini API key is missing, return curated fallback immediately
    if not GEMINI_API_KEY or len(GEMINI_API_KEY.strip()) < 8:
        logger.info(f"GEMINI_API_KEY unconfigured; serving curated fallback for {norm_subject} - {target_topic}")
        fallback = get_curated_fallback_quiz(db, norm_subject, target_lesson_num, difficulty, target_topic)
        fallback["analytics"] = profile
        return fallback

    # System prompt for structured adaptive quiz generation
    system_instruction = (
        "You are the Bhasa_AI Adaptive Quiz Engine, an expert academic programming and language tutor.\n"
        "Your task is to generate a personalized 5-question multiple choice quiz tailored directly to a student's learning history.\n\n"
        "Guidelines:\n"
        f"1. Subject: {norm_subject}\n"
        f"2. Target Topic: {target_topic}\n"
        f"3. Target Difficulty: {difficulty} (Beginner, Intermediate, or Advanced)\n"
        "4. Adapt questions to test the exact cognitive level:\n"
        "   - Beginner: Foundational syntax, direct rules, clean output predictions.\n"
        "   - Intermediate: Tracing control flow, compound conditions, edge cases, error analysis.\n"
        "   - Advanced: Memory mechanics, time complexity, design patterns, deep analytical problems.\n"
        "5. For programming (Python, Java, C++), include realistic, well-formatted code snippets in the question.\n"
        "6. For English, test vocabulary in professional/technical contexts, grammar rules, reading inference, or syntax structure.\n"
        "7. Ensure each question has EXACTLY 4 distinct plausible options, a 0-indexed answer key (0, 1, 2, or 3), and a clear pedagogical explanation.\n"
        "8. Output MUST BE A STRICT JSON OBJECT matching this exact schema:\n"
        "{\n"
        '  "topic": "string",\n'
        '  "difficulty": "Beginner" | "Intermediate" | "Advanced",\n'
        '  "adaptation_rationale": "string explaining why these questions were generated based on learner metrics",\n'
        '  "improvement_suggestions": ["string", "string"],\n'
        '  "questions": [\n'
        '    {\n'
        '      "question": "string with optional code block",\n'
        '      "description": "short 1-line guidance",\n'
        '      "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        '      "answer": 0,\n'
        '      "explanation": "educational explanation of why the answer is correct"\n'
        '    }\n'
        '  ]\n'
        "}"
    )

    user_prompt = (
        f"Student Academic Context:\n"
        f"- Name: {user.full_name}\n"
        f"- Subject: {norm_subject}\n"
        f"- Target Topic: {target_topic}\n"
        f"- Current Overall Accuracy: {profile['overall_accuracy']}%\n"
        f"- Recent Accuracy Trend: {profile['trend']} ({profile['recent_accuracy']}%)\n"
        f"- Diagnosed Weak Areas: {profile['weak_topics'] or 'None (foundational exploration)'}\n"
        f"- Diagnosed Strong Areas: {profile['strong_topics'] or 'Building initial mastery'}\n"
        f"- Target Difficulty: {difficulty}\n"
        f"- Diagnostic Mode: {profile['is_diagnostic']}\n\n"
        f"Generate 5 distinct, high-quality, adaptive {difficulty} questions for {norm_subject} topic '{target_topic}' now."
    )

    candidate_models = [GEMINI_MODEL, "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
    seen = set()
    models_to_try = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

    for model_name in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "systemInstruction": {"parts": [{"text": system_instruction}]},
                "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
                "generationConfig": {
                    "temperature": 0.35,
                    "maxOutputTokens": 2000,
                    "responseMimeType": "application/json"
                }
            }
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    body = res.json()
                    candidates = body.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            raw_text = parts[0]["text"].strip()
                            if raw_text.startswith("```"):
                                lines = raw_text.split("\n")
                                if lines[0].startswith("```"): lines = lines[1:]
                                if lines and lines[-1].startswith("```"): lines = lines[:-1]
                                raw_text = "\n".join(lines).strip()
                            parsed_quiz = json.loads(raw_text)

                            # Validate strictly
                            valid, err = validate_adaptive_quiz_payload(parsed_quiz)
                            if valid:
                                # Normalize question keys if needed
                                formatted_questions = []
                                for q in parsed_quiz["questions"]:
                                    ans = q.get("answer") if q.get("answer") is not None else q.get("answer_index", 0)
                                    formatted_questions.append({
                                        "question": q.get("question") or q.get("question_text"),
                                        "description": q.get("description", "Analyze and choose the correct answer."),
                                        "options": q.get("options"),
                                        "answer": int(ans),
                                        "explanation": q.get("explanation", "Review the concept rules.")
                                    })

                                return {
                                    "subject": norm_subject,
                                    "lesson_number": target_lesson_num,
                                    "topic": parsed_quiz.get("topic", target_topic),
                                    "difficulty": parsed_quiz.get("difficulty", difficulty),
                                    "adaptation_rationale": parsed_quiz.get("adaptation_rationale", f"Tailored {difficulty} practice for {target_topic}."),
                                    "improvement_suggestions": parsed_quiz.get("improvement_suggestions", [
                                        "Focus on conceptual precision and edge-case testing."
                                    ]),
                                    "is_ai_generated": True,
                                    "questions": formatted_questions,
                                    "analytics": profile
                                }
                            else:
                                logger.warning(f"Gemini output validation failed ({err}); trying fallback.")
                else:
                    logger.warning(f"Gemini API returned status {res.status_code} for {model_name}: {res.text[:100]}")
        except Exception as e:
            logger.warning(f"Error calling Gemini model {model_name}: {e}")

    # Fallback to curated question bank if all AI attempts fail
    logger.info(f"Activating curated adaptive fallback for {norm_subject} - {target_topic}")
    fallback = get_curated_fallback_quiz(db, norm_subject, target_lesson_num, difficulty, target_topic)
    fallback["analytics"] = profile
    return fallback


# =============================================================================
# 5. SERVER-SIDE EVALUATION & PROGRESS PERSISTENCE
# =============================================================================

def evaluate_and_record_adaptive_quiz(
    db: Session,
    user: User,
    subject: str,
    topic: str,
    difficulty: str,
    lesson_number: Optional[int],
    student_answers: List[int],
    questions_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Evaluates student quiz submissions on the backend (never trusts client scoring).
    Computes genuine score, awards XP, logs AdaptiveQuizAttempt, updates UserLessonProgress,
    and returns personalized improvement recommendations.
    """
    norm_subject = normalize_subject_name(subject)
    total_q = len(questions_data)
    if total_q == 0:
        raise ValueError("Questions data cannot be empty")

    # Calculate genuine score
    correct_count = 0
    feedback_breakdown = []

    for idx, q in enumerate(questions_data):
        user_choice = student_answers[idx] if idx < len(student_answers) else -1
        correct_answer = q.get("answer") if q.get("answer") is not None else q.get("answer_index", 0)
        is_correct = (user_choice == correct_answer)
        if is_correct:
            correct_count += 1

        feedback_breakdown.append({
            "question_index": idx,
            "user_choice": user_choice,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    pct = round((correct_count / float(total_q)) * 100, 1)
    passed = (pct >= 60.0)

    # Calculate XP
    base_xp = correct_count * 10
    bonus_xp = 20 if passed else 0
    total_xp = base_xp + bonus_xp

    # Construct actionable feedback
    if pct >= 80.0:
        feedback_text = f"Mastery demonstrated in {topic} ({pct}%). You are ready for advanced synthesis and complex problem-solving."
    elif pct >= 60.0:
        feedback_text = f"Good grasp of {topic} ({pct}%). Review explanations for missed questions to solidify edge cases."
    else:
        feedback_text = f"Need further reinforcement on {topic} ({pct}%). Revisit the chapter theory and repeat practice drills."

    # 1. Record in AdaptiveQuizAttempt table
    meta = {
        "difficulty": difficulty,
        "correct_count": correct_count,
        "total_questions": total_q,
        "evaluated_at": datetime.utcnow().isoformat()
    }
    attempt = AdaptiveQuizAttempt(
        user_id=user.id,
        subject=norm_subject,
        topic=topic,
        difficulty=difficulty,
        score=correct_count,
        total_questions=total_q,
        percentage=pct,
        passed=passed,
        xp_earned=total_xp,
        feedback=feedback_text,
        adaptation_meta_json=json.dumps(meta),
        created_at=datetime.utcnow()
    )
    db.add(attempt)

    # 2. Update UserLessonProgress if lesson_number is specified
    if lesson_number and lesson_number > 0:
        ulp = db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == user.id,
            func.lower(UserLessonProgress.subject) == norm_subject.lower(),
            UserLessonProgress.lesson_number == lesson_number
        ).first()

        if not ulp:
            ulp = UserLessonProgress(
                user_id=user.id,
                subject=norm_subject,
                lesson_number=lesson_number,
                score=correct_count,
                total_questions=total_q,
                xp_earned=total_xp,
                completed=passed
            )
            db.add(ulp)
        else:
            if correct_count > ulp.score:
                ulp.score = correct_count
            ulp.total_questions = total_q
            ulp.xp_earned = max(ulp.xp_earned, total_xp)
            if passed:
                ulp.completed = True

    # 3. Update UserProfile XP
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if profile:
        profile.total_xp += total_xp
        profile.current_level = max(1, profile.total_xp // 300)

    db.commit()
    db.refresh(attempt)

    # Determine next adaptive recommendation
    next_difficulty = "Advanced" if pct >= 80 else ("Intermediate" if pct >= 60 else "Beginner")

    return {
        "status": "success",
        "attempt_id": attempt.id,
        "subject": norm_subject,
        "topic": topic,
        "difficulty": difficulty,
        "score": correct_count,
        "total_questions": total_q,
        "percentage": pct,
        "passed": passed,
        "xp_earned": total_xp,
        "feedback": feedback_text,
        "next_recommended_difficulty": next_difficulty,
        "feedback_breakdown": feedback_breakdown
    }
