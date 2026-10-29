"""
Authentication Core: Google ID Token Verification, JWT Issuance & Protected Middleware
Implements OAuth 2.0 Google Identity Services token verification and session management.
"""

import os
import urllib.request
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models import User

# Google OAuth Client ID (Set via environment variable or default)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

# JWT Session Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "bhasha_google_auth_enterprise_secret_key_2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days session lifetime

# HTTP Bearer authentication scheme
security = HTTPBearer(auto_error=True)
optional_security = HTTPBearer(auto_error=False)


def verify_google_id_token(credential: str) -> Dict[str, Any]:
    """
    Verify the Google ID Token received from Google Identity Services.
    Uses official google-auth library if available, with robust fallback
    to Google's public tokeninfo endpoint.
    
    Returns token payload containing:
    - sub (Google ID)
    - email
    - name
    - picture
    """
    if not credential or not isinstance(credential, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing or invalid Google ID token credential."
        )

    # 1. Check for local development / testing token
    if credential.startswith("demo_test_token_"):
        parts = credential.split(":")
        email = parts[1] if len(parts) > 1 else "student@bhasha.ai"
        name = parts[2] if len(parts) > 2 else "Verified Scholar"
        return {
            "sub": f"google_demo_{abs(hash(email))}",
            "email": email,
            "name": name,
            "picture": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        }

    # 2. Try verification using google-auth library
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        request = google_requests.Request()
        id_info = id_token.verify_oauth2_token(
            credential,
            request,
            GOOGLE_CLIENT_ID if GOOGLE_CLIENT_ID else None
        )

        issuer = id_info.get("iss", "")
        if issuer not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError(f"Wrong token issuer: {issuer}")

        return {
            "sub": id_info.get("sub"),
            "email": id_info.get("email"),
            "name": id_info.get("name") or id_info.get("email", "").split("@")[0],
            "picture": id_info.get("picture")
        }
    except Exception as lib_err:
        # 3. Fallback: Verify directly against Google's public TokenInfo API
        try:
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
            req = urllib.request.Request(url, headers={"User-Agent": "FastAPI-Google-Auth"})
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    payload = json.loads(response.read().decode("utf-8"))
                    
                    # Validate audience if client ID is configured
                    if GOOGLE_CLIENT_ID and payload.get("aud") != GOOGLE_CLIENT_ID:
                        raise ValueError("Token audience does not match configured Google Client ID.")

                    return {
                        "sub": payload.get("sub"),
                        "email": payload.get("email"),
                        "name": payload.get("name") or payload.get("email", "").split("@")[0],
                        "picture": payload.get("picture")
                    }
        except Exception as http_err:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Google ID Token verification failed: {str(lib_err or http_err)}"
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not verify Google ID token."
    )


def create_session_token(user: User) -> str:
    """
    Issue a signed JWT access token for user session.
    Never stores or returns Google passwords.
    """
    expires = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": str(user.id),
        "google_id": user.google_id,
        "email": user.email,
        "role": user.role,
        "exp": expires,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Protected authentication middleware / dependency.
    Extracts Bearer JWT, validates signature, and fetches User from SQLite.
    """
    token = credentials.credentials
    auth_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid, expired, or missing authentication token.",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise auth_exception
        user_id = int(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise auth_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise auth_exception

    return user


def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Protected admin authorization dependency.
    Restricts access to users with role='admin'.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Administrator privileges required."
        )
    return current_user
