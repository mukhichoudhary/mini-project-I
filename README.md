# Bhasha_AI (LingoX) 🌿
### AI-Powered Natural & Programming Language Proficiency Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Google_Gemini-4285F4.svg?style=flat&logo=google&logoColor=white)](https://aistudio.google.com/)
[![OAuth 2.0](https://img.shields.io/badge/Auth-Google_OAuth_2.0-EA4335.svg?style=flat&logo=google&logoColor=white)](https://developers.google.com/identity)

---

## 📖 Overview

**Bhasha_AI (LingoX)** is a full-stack, gamified educational platform combining natural language fluency (Technical English, speaking, pronunciation) and core programming mastery (Python, Java, C++). 

Styled in an organic **Pale Moss Green botanical aesthetic**, it offers an immersive gamified experience featuring a 5-stage car evolution garage, live AI tutoring with **Google Gemini**, real-time speech evaluation, screen-time rewarded premium status, interactive code playgrounds, and an administrative control suite.

---

## 🚀 Quick Setup & Run

### 1. Install Dependencies
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r backend/requirements.txt
```

### 2. Configure Environment
```bash
# Copy template to .env
cp backend/.env.example backend/.env
```
*(Optional: add your `GEMINI_API_KEY` for live AI tutoring and Gmail App Password for SMTP resets).*

### 3. Launch the Server
```bash
python backend/run.py
```
*Or double click `frontend/start-server.bat` on Windows.*

### 4. Access in Browser
- **Onboarding & Track Selection**: [http://localhost:8000/index.html](http://localhost:8000/index.html)
- **Student Login**: [http://localhost:8000/login.html](http://localhost:8000/login.html)
- **Admin Portal**: [http://localhost:8000/admin-login.html](http://localhost:8000/admin-login.html)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔑 Default Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@bhasha.ai` | `admin123` | Full access to [admin.html](http://localhost:8000/admin.html) |
| **Sample Scholar** | `alex.chen@example.com` | `admin123` | Python Track • Stage 3 (1850 XP) |
| **Sample Learner** | `sarah.miller@example.com` | `admin123` | Java Track • Stage 2 (1420 XP) |
| **Sample Scholar** | `david.kumar@example.com` | `admin123` | C++ Track • Stage 4 (2650 XP) |
| **Sample Learner** | `elena.rostova@example.com` | `admin123` | English Track • Stage 2 (920 XP) |

*(New users can also register freely or test with the one-click Google OAuth simulator on the login page).*

---

## 📂 Architecture & Directory Structure

```
Bhasa_AI/
├── frontend/                   # HTML5 client views
│   ├── index.html              # Multi-track onboarding & daily goal selection
│   ├── login.html              # Dual auth (JWT / Google Identity Services)
│   ├── admin-login.html        # Secure admin login
│   ├── admin.html              # Management dashboard (users, metrics, logs)
│   ├── dashboard.html          # Student hub, daily streaks & car garage
│   ├── roadmap.html            # Curriculum path with unsealing letters
│   ├── subject.html            # Course syllabus & unit explorer
│   ├── lesson.html             # Theory cards, code playgrounds, interactive quizzes
│   ├── AiMentor.html           # Google Gemini AI conversational tutor & speech
│   ├── projects.html           # Project catalog
│   ├── project.html            # Guided code workspace & editor
│   ├── leaderboard.html        # Podium rankings (Global & Track)
│   ├── achievements.html       # Vehicle evolution (Stage 1 to 5) & badges
│   ├── settings.html           # Profile settings & screen-time reward exchange
│   ├── reset-password.html     # OTP / HMAC-salted password recovery
│   └── start-server.bat        # Windows launch shortcut
│
├── backend/                    # Python FastAPI application
│   ├── run.py                  # Server runner with auto-detected LAN IP (0.0.0.0)
│   ├── requirements.txt        # Backend dependencies
│   ├── .env.example            # Configuration template
│   ├── bhasha.db               # SQLite database
│   └── app/
│       ├── main.py             # FastAPI entry, routing, CORS & security rules
│       ├── config.py           # Configuration loader & constants
│       ├── database.py         # SQLAlchemy engine & session factory
│       ├── seed.py             # Database seeder & schema migration
│       ├── curriculum_data.py  # W3Schools-aligned questions & tracks
│       ├── curriculum_theories.py # Comprehensive syllabus theory
│       ├── speaking_prompts_data.py # Speech evaluation prompts
│       ├── auth/               # Bcrypt password hashing & JWT generation
│       ├── models/             # SQLAlchemy ORM models (User, Progress, etc.)
│       ├── schemas/            # Pydantic validation schemas
│       ├── routers/            # REST API route handlers
│       └── services/           # Gemini AI, Email, Screen-time & Quiz services
│
├── assets/                     # Graphics, vehicle evolution stages, icons
├── css/                        # Botanical Pale Moss Green stylesheets
├── js/                         # Frontend API clients & controllers
└── scratch/                    # Automated testing & verification suite
```

---

## 🌟 Key Highlights

- **Dual Technical & Language Mastery**: Complete learning paths in Python, Java, C++, and Technical English.
- **Google Gemini AI Mentorship**: Real-time code analysis, bug debugging, grammar improvement, and interview preparation with offline fallback.
- **Voice & Pronunciation Assessment**: Live microphone capture with browser Web Speech API and phoneme transcription scoring.
- **Academy Garage Gamification**: Advance your student vehicle through 5 visual upgrade stages as you build streaks and gain XP.
- **Learn-to-Earn Screen Time**: Time spent actively learning automatically accumulates reward minutes for free premium status.
- **Multi-Device LAN Access**: Automatically binds to `0.0.0.0:8000` so mobile phones and tablets on the same Wi-Fi can run the app seamlessly.

---

## 🧪 Testing

To run the automated verification suite:

```bash
# Security & Auth Suite
python scratch/test_security_suite.py

# AI Mentor & Gemini Full Test
python scratch/test_ai_mentor_full.py

# Adaptive Quiz Verification
python scratch/test_adaptive_quiz.py

# Speaking Assessment Tests
python scratch/test_speaking_backend.py

# Screen-Time & Premium System
python scratch/test_premium_system.py

# Full Regression Audit
python scratch/test_independent_audit.py
```

