"""
FastAPI Application Entry Point for Google Authentication System
AI-Based Natural & Programming Language Proficiency System
"""

import os
from pathlib import Path
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import User
from auth import (
    verify_google_id_token, create_session_token,
    get_current_user, get_current_admin, GOOGLE_CLIENT_ID
)

# Paths
BACKEND_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BACKEND_DIR.parent / "frontend"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database tables on startup
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized in users.db")
    yield

# Initialize FastAPI application
app = FastAPI(
    title="AI Language Proficiency System - Google Authentication API",
    description="Secure Google OAuth 2.0 (Google Identity Services) authentication backend.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema for Google Sign-In
class GoogleAuthRequest(BaseModel):
    credential: str

# ----------------- AUTHENTICATION ROUTES -----------------

@app.get("/api/auth/config")
def get_auth_config():
    """
    Public configuration endpoint exposing Google Client ID
    to the frontend Google Identity Services SDK.
    """
    return {
        "google_client_id": GOOGLE_CLIENT_ID or "",
        "platform_name": "AI-Based Natural & Programming Language Proficiency System"
    }

@app.post("/api/auth/google")
def google_sign_in(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate user via Google ID Token:
    1. Verify token signature with Google.
    2. Check if user exists by google_id or email.
    3. Create user if first login, or update last_login.
    4. Issue secure JWT session token.
    """
    # 1. Verify token
    google_data = verify_google_id_token(payload.credential)

    google_id = google_data["sub"]
    email = google_data["email"].lower().strip()
    full_name = google_data["name"]
    picture = google_data["picture"]

    # 2. Check if user already exists
    user = db.query(User).filter(
        (User.google_id == google_id) | (User.email == email)
    ).first()

    now = datetime.utcnow()

    if not user:
        # First time login: Create new user record
        user = User(
            google_id=google_id,
            email=email,
            full_name=full_name,
            profile_picture=picture,
            role="student",  # Default role
            created_at=now,
            last_login=now
        )
        db.add(user)
        is_new_user = True
    else:
        # Subsequent login: Update activity and profile fields
        user.google_id = google_id  # Link Google ID if registered previously
        user.full_name = full_name or user.full_name
        if picture:
            user.profile_picture = picture
        user.last_login = now
        is_new_user = False

    db.commit()
    db.refresh(user)

    # 3. Create signed JWT session token (Never stores or returns Google passwords)
    access_token = create_session_token(user)

    return {
        "status": "success",
        "message": "Welcome to AI-Based Language Proficiency System!" if is_new_user else "Welcome back!",
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": is_new_user,
        "user": user.to_dict()
    }

@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Protected authentication endpoint:
    Returns current authenticated user profile using Bearer JWT.
    """
    return {
        "status": "authenticated",
        "user": current_user.to_dict()
    }

@app.post("/api/auth/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Server-side logout acknowledgment.
    Client clears stored JWT token from localStorage.
    """
    return {
        "status": "success",
        "message": f"User {current_user.email} successfully logged out."
    }

@app.get("/api/users")
def list_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Protected route to view registered users in the academy.
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {
        "total": len(users),
        "users": [u.to_dict() for u in users]
    }

# ----------------- STATIC FRONTEND SERVING -----------------

if FRONTEND_DIR.exists():
    @app.get("/", include_in_schema=False)
    def serve_index():
        login_file = FRONTEND_DIR / "login.html"
        if login_file.exists():
            return FileResponse(login_file)
        return {"message": "Google Authentication API is active. Open /docs for Swagger UI."}

    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    print("==================================================================")
    print("  AI-Based Language Proficiency System - Google Auth Server       ")
    print("  Local URL: http://localhost:8000                                ")
    print("  API Docs : http://localhost:8000/docs                           ")
    print("==================================================================")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
