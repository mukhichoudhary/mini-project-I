import os
from pathlib import Path

# Base directory of the backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Lightweight .env file loader
def load_env_file():
    for env_path in [BASE_DIR.parent / ".env", BASE_DIR / ".env"]:
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k and k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

load_env_file()

# Environment mode ("development", "staging", "production")
ENVIRONMENT = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development")).strip().lower()
IS_PRODUCTION = ENVIRONMENT in ("production", "prod")

# Database configuration
# Store bhasha.db in the backend directory
DB_PATH = BASE_DIR / "bhasha.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# Known insecure default keys that MUST be rejected in production
KNOWN_INSECURE_KEYS = {
    "bhasha_secret_jwt_royal_academy_super_key_2026",
    "secret",
    "changeme",
    "your-secret-key",
    "default_secret_key",
    "jwt_secret_key",
    "supersecretkey"
}
KNOWN_INSECURE_SALTS = {
    "bhasha_pwd_reset_salt_2026_secure",
    "salt",
    "changeme",
    "default_salt"
}

# Security & JWT settings
raw_secret = os.getenv("SECRET_KEY", "").strip()
raw_salt = os.getenv("PASSWORD_RESET_SALT", "").strip()

if IS_PRODUCTION:
    if not raw_secret or raw_secret in KNOWN_INSECURE_KEYS or len(raw_secret) < 32:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: A strong, cryptographically random SECRET_KEY "
            "(minimum 32 characters) must be configured in your environment or .env for production. "
            "Generate one via: python -c \"import secrets; print(secrets.token_hex(32))\""
        )
    SECRET_KEY = raw_secret

    if not raw_salt or raw_salt in KNOWN_INSECURE_SALTS or len(raw_salt) < 16:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: A strong, cryptographically random PASSWORD_RESET_SALT "
            "(minimum 16 characters) must be configured in your environment or .env for production. "
            "Generate one via: python -c \"import secrets; print(secrets.token_hex(16))\""
        )
    PASSWORD_RESET_SALT = raw_salt
else:
    # Development mode: allow fallback with explicit logged security notice
    SECRET_KEY = raw_secret or "bhasha_secret_jwt_royal_academy_super_key_2026"
    PASSWORD_RESET_SALT = raw_salt or "bhasha_pwd_reset_salt_2026_secure"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# CORS Allowed Origins from environment
ALLOWED_ORIGINS_RAW = os.getenv("ALLOWED_ORIGINS", "").strip()

# Production API Documentation visibility (disabled by default in production)
ENABLE_API_DOCS = os.getenv("ENABLE_API_DOCS", "false" if IS_PRODUCTION else "true").lower() == "true"

# Database Auto-Seeding (disabled by default to prevent accidental overwrite of existing records)
AUTO_SEED = os.getenv("AUTO_SEED", "false").lower() == "true"

# Google Gemini / AI API configuration
AI_API_KEY = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
GEMINI_API_KEY = AI_API_KEY
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# Frontend directory for static file serving
FRONTEND_DIR = BASE_DIR.parent

# SMTP Email configuration (Gmail SMTP)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Bhasa_AI").strip()
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "").strip() or SMTP_USERNAME

# Password Reset security settings
PASSWORD_RESET_EXPIRY_MINUTES = int(os.getenv("PASSWORD_RESET_EXPIRY_MINUTES", "15"))
