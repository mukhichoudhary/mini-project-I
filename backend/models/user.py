from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True, default="")
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="learner")  # "learner", "scholar", "admin"
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    profile_picture = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)
    email_verified = Column(Boolean, default=False)
    
    # Earnable Premium Membership tracking
    premium_until = Column(DateTime, nullable=True)
    total_screen_minutes = Column(Float, default=0.0)
    available_reward_minutes = Column(Float, default=0.0)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    lesson_progress = relationship("UserLessonProgress", back_populates="user", cascade="all, delete-orphan")
    project_progress = relationship("UserProjectProgress", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    mentor_messages = relationship("MentorMessage", back_populates="user", cascade="all, delete-orphan")
    
    # Normalized learning progress & quiz records
    progress_records = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    admin_logs = relationship("AdminLog", back_populates="admin", foreign_keys="AdminLog.admin_id", cascade="all, delete-orphan")
    
    # Screen time logs and premium reward history
    screen_time_logs = relationship("ScreenTimeLog", back_populates="user", cascade="all, delete-orphan")
    premium_history = relationship("PremiumHistory", back_populates="user", cascade="all, delete-orphan")
    adaptive_attempts = relationship("AdaptiveQuizAttempt", back_populates="user", cascade="all, delete-orphan")
    speaking_assessments = relationship("SpeakingAssessment", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    chosen_language = Column(String(50), default="Python")
    daily_goal = Column(Integer, default=15)  # in minutes
    total_xp = Column(Integer, default=1250)
    streak_days = Column(Integer, default=7)
    current_level = Column(Integer, default=4)
    rank_tier = Column(String(50), default="Stage 2 • Core Architecture")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Progress(Base):
    """
    Normalized progress storage for each user across all syllabus subjects:
    - English: Vocabulary, Grammar, Reading, Pronunciation
    - Python: Syntax, OOP, Functions, Projects
    - Java: Core Java, Collections, OOP
    - C++: STL, Pointers, DSA
    Includes highest score, total attempts, and time spent learning.
    """
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_slug = Column(String(50), nullable=False, index=True)  # english, python, java, cpp
    module_key = Column(String(100), nullable=False, index=True)  # vocabulary, grammar, syntax, oop, etc.
    module_name = Column(String(100), nullable=False)
    completion_percent = Column(Integer, default=0)
    highest_score = Column(Integer, default=0)
    total_attempts = Column(Integer, default=0)
    time_spent_mins = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    last_accessed = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="progress_records")


class AdminLog(Base):
    """
    Normalized audit logging table recording administrative operations.
    """
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    admin_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)  # CREATE_STUDENT, UPDATE_STUDENT, DELETE_STUDENT, etc.
    target_type = Column(String(50), nullable=False)  # student, quiz, course, system
    target_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow)

    admin = relationship("User", back_populates="admin_logs", foreign_keys=[admin_id])


class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(50), nullable=False)
    lesson_number = Column(Integer, nullable=False)
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=5)
    xp_earned = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="lesson_progress")


class UserProjectProgress(Base):
    __tablename__ = "user_project_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(String(100), nullable=False)  # e.g. "python-calculator"
    subject = Column(String(50), nullable=True)
    saved_code = Column(Text, nullable=True)
    progress_percent = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="project_progress")


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_slug = Column(String(100), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="badges")
    

class OTPCode(Base):
    """
    Temporary One-Time Password storage for email verification.
    Stores securely hashed OTPs with strict 5-minute expiration,
    attempt tracking (max 5 attempts), and rate-limiting support.
    """
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True, nullable=False)
    otp_code = Column(String(255), nullable=False)  # securely hashed
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class ScreenTimeLog(Base):
    """
    Tracks verified active learning time per session.
    Only counts time during active interaction in lessons, quizzes, or coding.
    """
    __tablename__ = "screen_time_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    page_name = Column(String(100), nullable=False)
    session_start = Column(DateTime, default=datetime.utcnow)
    session_end = Column(DateTime, nullable=True)
    active_minutes = Column(Float, default=0.0)

    user = relationship("User", back_populates="screen_time_logs")


class PremiumHistory(Base):
    """
    Audit log of earned Premium Membership days.
    Every 200 minutes of active learning = 1 day (+24 hours) of Premium access.
    """
    __tablename__ = "premium_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    minutes_spent = Column(Float, default=200.0)
    days_rewarded = Column(Integer, default=1)
    rewarded_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="premium_history")


class PasswordResetToken(Base):
    """
    Secure, single-use, time-limited password reset tokens.
    Only cryptographically salted SHA-256 hashes of tokens are stored in the database.
    Invalidated immediately upon consumption or expiration.
    """
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    used = Column(Boolean, default=False, nullable=False, index=True)
    used_at = Column(DateTime, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class SystemSetting(Base):
    """
    Persistent system configuration key-value storage for academy and AI mentor settings.
    """
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SpeakingAssessment(Base):
    """
    Records genuine microphone-based speech-to-text speaking assessments.
    Stores target sentence, transcribed spoken text, transcription accuracy (Word Error Rate),
    recording duration, calculated speaking rate (WPM), and explicit pronunciation status.
    """
    __tablename__ = "speaking_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_text = Column(Text, nullable=False)
    spoken_text = Column(Text, nullable=False)
    transcription_accuracy = Column(Float, nullable=False)
    duration_seconds = Column(Float, nullable=True)
    speaking_rate_wpm = Column(Float, nullable=True)
    pronunciation_status = Column(String(50), default="unavailable")
    difficulty = Column(String(20), default="intermediate", nullable=True)
    task_type = Column(String(50), default="sentence_reading", nullable=True)
    feedback_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="speaking_assessments")

