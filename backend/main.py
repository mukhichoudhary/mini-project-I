import os
import socket
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse
from app.config import (
    FRONTEND_DIR,
    ALLOWED_ORIGINS_RAW,
    IS_PRODUCTION,
    ENABLE_API_DOCS,
    AUTO_SEED,
)
from app.seed import seed_database
from app.routers import auth, users, content, leaderboard, mentor, ai_mentor, admin, premium, adaptive_quiz

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Only execute database seeding if explicitly instructed via AUTO_SEED=true
    # This prevents accidental alteration of existing student progress and curriculum data
    if AUTO_SEED:
        seed_database()
    yield

# Configure OpenAPI / Swagger documentation visibility
# In production, documentation and OpenAPI schemas are disabled by default to prevent reconnaissance
app = FastAPI(
    title="Bhasha_AI Royal Academy API",
    description="Python FastAPI backend providing user authentication, curriculum content, progress tracking, projects, leaderboard rankings, and AI mentor intelligence.",
    version="1.0.0",
    docs_url="/docs" if ENABLE_API_DOCS else None,
    redoc_url="/redoc" if ENABLE_API_DOCS else None,
    openapi_url="/openapi.json" if ENABLE_API_DOCS else None,
    lifespan=lifespan
)

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

lan_ip = get_lan_ip()

# Safe default origins for local development and LAN network testing ONLY
default_dev_origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5500",
    "http://localhost:8000",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5173",
    f"http://{lan_ip}:8000",
    f"http://{lan_ip}",
    "null",  # Supports opening HTML directly from local file:// path in development
]

# Parse ALLOWED_ORIGINS environment variable
custom_origins = [o.strip() for o in ALLOWED_ORIGINS_RAW.split(",") if o.strip()]

# In production, ACCEPT ONLY explicitly configured trusted origins
# Localhost/LAN/null origins are strictly excluded unless explicitly specified in ALLOWED_ORIGINS
if IS_PRODUCTION:
    allowed_origins = custom_origins
else:
    allowed_origins = list(dict.fromkeys(default_dev_origins + custom_origins))

# Strictly explicit CORS - wildcard regex completely eliminated
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    expose_headers=["*"],
)

# Security middleware: strictly prevent serving source files, database, backups, or internal directories
BLOCKED_EXTENSIONS = (
    ".py", ".pyc", ".db", ".sqlite", ".sqlite3",
    ".zip", ".tar", ".gz", ".bak", ".env", ".md",
    ".bat", ".sh", ".ps1", ".yaml", ".yml", ".toml",
    ".log", ".txt", ".conf", ".ini", ".lock"
)
BLOCKED_SEGMENTS = {
    "backend", "scratch", ".git", ".gitignore", ".agents", "backups", "__pycache__"
}

@app.middleware("http")
async def block_sensitive_files(request, call_next):
    raw_path = request.scope.get("raw_path", b"").decode("utf-8", errors="replace").lower()
    path = request.url.path.lower()
    query = request.url.query.lower()
    path_segments = [p.strip() for p in path.split("/") if p.strip()]

    # Path traversal guard: checks raw socket path, parsed path, and query string
    if ".." in raw_path or ".." in path or "%2e%2e" in raw_path or "%2e" in raw_path or ".." in query:
        return PlainTextResponse("Not Found", status_code=404)

    # Backup and hidden file guard on segments
    for seg in path_segments:
        if seg.startswith(".env") or seg in BLOCKED_SEGMENTS or ".bak" in seg:
            return PlainTextResponse("Not Found", status_code=404)

    # Extension guard on trailing segment
    if path_segments and any(path_segments[-1].endswith(ext) for ext in BLOCKED_EXTENSIONS):
        return PlainTextResponse("Not Found", status_code=404)

    return await call_next(request)

# Register API routers
app.include_router(auth.router)
app.include_router(auth.router_direct)
app.include_router(admin.router)
app.include_router(premium.router)
app.include_router(premium.router_direct)
app.include_router(users.router)
app.include_router(content.router)
app.include_router(leaderboard.router)
app.include_router(mentor.router)
app.include_router(ai_mentor.router)
app.include_router(adaptive_quiz.router)

# Healthcheck endpoint
@app.get("/api/health", tags=["Health"])
def healthcheck():
    current_lan = get_lan_ip()
    return {
        "status": "healthy",
        "service": "Bhasha_AI Backend",
        "version": "1.0.0",
        "environment": "production" if IS_PRODUCTION else "development",
        "lan_ip": current_lan,
        "access_url": f"http://{current_lan}:8000"
    }

# Network info endpoint for multi-device setup
@app.get("/api/system/network-info", tags=["Health"])
def network_info():
    current_lan = get_lan_ip()
    return {
        "status": "online",
        "local_url": "http://localhost:8000",
        "lan_ip": current_lan,
        "lan_url": f"http://{current_lan}:8000",
        "login_url": f"http://{current_lan}:8000/login.html",
        "devices_instruction": f"On your phone or other device (connected to the same Wi-Fi), open: http://{current_lan}:8000/login.html"
    }

# Explicit allowlist of permissible frontend HTML pages
ALLOWED_HTML_PAGES = {
    "index.html",
    "login.html",
    "admin-login.html",
    "admin.html",
    "admin-dashboard.html",
    "dashboard.html",
    "lesson.html",
    "subject.html",
    "project.html",
    "projects.html",
    "reset-password.html",
    "achievements.html",
    "leaderboard.html",
    "roadmap.html",
    "settings.html",
    "AiMentor.html",
}
HTML_LOOKUP = {p.lower(): p for p in ALLOWED_HTML_PAGES}

# Mount dedicated frontend static assets and explicit HTML routes
if FRONTEND_DIR.exists():
    assets_dir = FRONTEND_DIR / "assets"
    css_dir = FRONTEND_DIR / "css"
    js_dir = FRONTEND_DIR / "js"

    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
    if css_dir.exists():
        app.mount("/css", StaticFiles(directory=str(css_dir)), name="css")
    if js_dir.exists():
        app.mount("/js", StaticFiles(directory=str(js_dir)), name="js")

    # Route for root index.html
    @app.get("/", include_in_schema=False)
    def read_root():
        index_path = FRONTEND_DIR / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        return {"message": "Welcome to Bhasha_AI API. Visit /docs for API documentation."}

    # Explicit allowlist routing for root HTML pages (case-insensitive)
    @app.get("/{page_name}.html", include_in_schema=False)
    def read_html_page(page_name: str):
        normalized_key = f"{page_name.lower()}.html"
        if normalized_key not in HTML_LOOKUP:
            raise HTTPException(status_code=404, detail="Page not found")
        canonical_filename = HTML_LOOKUP[normalized_key]
        page_path = (FRONTEND_DIR / canonical_filename).resolve()

        # Strict path traversal escape check
        try:
            page_path.relative_to(FRONTEND_DIR.resolve())
        except ValueError:
            raise HTTPException(status_code=403, detail="Forbidden")

        if not page_path.exists() or not page_path.is_file():
            raise HTTPException(status_code=404, detail="Page not found")
        return FileResponse(page_path)

    # Clean URL routing without .html extension (e.g. /login -> login.html)
    @app.get("/{page_name}", include_in_schema=False)
    def read_clean_html_page(page_name: str):
        normalized_key = f"{page_name.lower()}.html"
        if normalized_key not in HTML_LOOKUP:
            raise HTTPException(status_code=404, detail="Page not found")
        canonical_filename = HTML_LOOKUP[normalized_key]
        page_path = (FRONTEND_DIR / canonical_filename).resolve()

        try:
            page_path.relative_to(FRONTEND_DIR.resolve())
        except ValueError:
            raise HTTPException(status_code=403, detail="Forbidden")

        if not page_path.exists() or not page_path.is_file():
            raise HTTPException(status_code=404, detail="Page not found")
        return FileResponse(page_path)
