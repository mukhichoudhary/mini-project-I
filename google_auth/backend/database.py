"""
Database Configuration & Session Management
Uses SQLite with SQLAlchemy ORM for the Google Authentication System.
"""

from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Path to SQLite database file
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "users.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create SQLite engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy declarative models
Base = declarative_base()

def get_db():
    """
    FastAPI dependency yielding a database session per request,
    ensuring proper closure upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
