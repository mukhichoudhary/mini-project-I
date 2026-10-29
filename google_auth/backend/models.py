"""
SQLAlchemy Database Models for User Authentication
Defines the `users` table schema with unique Google ID and Email constraints.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base

class User(Base):
    """
    User model storing Google OAuth identity details,
    role-based authorization, and activity timestamps.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    google_id = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    profile_picture = Column(Text, nullable=True)
    role = Column(String(50), default="student", nullable=False)  # "student" or "admin"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        """Serialize model instance to dictionary representation."""
        return {
            "id": self.id,
            "google_id": self.google_id,
            "full_name": self.full_name,
            "email": self.email,
            "profile_picture": self.profile_picture,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }
