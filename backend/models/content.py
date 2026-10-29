from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Course(Base):
    """
    Normalized courses table representing academic tracks.
    """
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, index=True, nullable=False)  # english, python, java, cpp
    name = Column(String(100), nullable=False)
    icon = Column(String(20), default="📚")
    category = Column(String(50), default="Programming")  # Language, Programming, Systems
    description = Column(Text, nullable=True)
    total_modules = Column(Integer, default=4)
    created_at = Column(DateTime, default=datetime.utcnow)

    quizzes = relationship("Quiz", back_populates="course", cascade="all, delete-orphan")


class Quiz(Base):
    """
    Normalized quizzes table linked to courses.
    """
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    topic = Column(String(100), nullable=False)  # e.g., Vocabulary, Grammar, Syntax, OOP, STL, etc.
    difficulty = Column(String(20), default="Intermediate")  # Beginner, Intermediate, Advanced
    total_questions = Column(Integer, default=5)
    time_limit_mins = Column(Integer, default=10)
    pass_percentage = Column(Integer, default=70)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="quizzes")
    results = relationship("QuizResult", back_populates="quiz", cascade="all, delete-orphan")


class QuizResult(Base):
    """
    Normalized quiz results and user attempt history.
    """
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    attempt_number = Column(Integer, default=1)
    time_taken_seconds = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_results")
    quiz = relationship("Quiz", back_populates="results")


class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, index=True, nullable=False) # python, java, cpp, english
    name = Column(String(100), nullable=False) # Python, Java, C++, English
    icon = Column(String(20), default="🐍")
    description = Column(Text, nullable=True)
    total_lessons = Column(Integer, default=12)

    lessons = relationship("Lesson", back_populates="track", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    track_slug = Column(String(50), ForeignKey("tracks.slug", ondelete="CASCADE"), nullable=False)
    lesson_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    theory = Column(Text, nullable=True)

    track = relationship("Track", back_populates="lessons")
    questions = relationship("Question", back_populates="lesson", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    description = Column(String(255), default="Choose the correct answer.")
    options_json = Column(Text, nullable=False)  # JSON string of options array: ["A", "B", "C", "D"]
    answer_index = Column(Integer, nullable=False) # 0-indexed correct option
    explanation = Column(Text, nullable=True)

    lesson = relationship("Lesson", back_populates="questions")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False) # e.g. python-calculator
    title = Column(String(200), nullable=False)
    subject = Column(String(50), nullable=False)
    icon = Column(String(20), default="🐍")
    lesson_tag = Column(String(100), default="Core Module")
    language = Column(String(50), default="PYTHON")
    file_name = Column(String(100), default="main.py")
    description = Column(Text, nullable=False)
    xp = Column(Integer, default=100)
    default_progress = Column(Integer, default=0)
    instructions_json = Column(Text, nullable=True) # JSON array of instruction strings
    requirements_json = Column(Text, nullable=True) # JSON array of requirement tags
    starter_code = Column(Text, nullable=True)


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(50), default="🏅")
    category = Column(String(50), default="achievement")
    xp_required = Column(Integer, default=0)


class RoadmapStage(Base):
    __tablename__ = "roadmap_stages"

    id = Column(Integer, primary_key=True, index=True)
    stage_number = Column(Integer, nullable=False)
    track_slug = Column(String(50), nullable=False, default="all")
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    milestones_json = Column(Text, nullable=True)


class AdaptiveQuizAttempt(Base):
    """
    Stores genuine AI-personalized adaptive quiz attempts and student diagnostics.
    Keeps programming and natural language performance strictly isolated.
    """
    __tablename__ = "adaptive_quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String(50), nullable=False, index=True)  # Python, Java, C++, English
    topic = Column(String(100), nullable=False)
    difficulty = Column(String(20), default="Intermediate")   # Beginner, Intermediate, Advanced
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False, default=5)
    percentage = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    xp_earned = Column(Integer, default=0)
    feedback = Column(Text, nullable=True)                    # Personalized tutor advice
    adaptation_meta_json = Column(Text, nullable=True)        # JSON with weak_topics, strong_topics, rationale
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="adaptive_attempts")
