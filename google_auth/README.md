# Google Authentication System for AI-Based Natural & Programming Language Proficiency System

A production-ready, secure **Google OAuth 2.0 (Google Identity Services)** authentication system built with **FastAPI**, **SQLite**, and **HTML5/Bootstrap 5** using a dark glassmorphic design.

---

## 📁 Project Structure

```
google_auth/
├── frontend/
│   ├── login.html              # Dark glassmorphic login UI & authenticated profile view
│   ├── css/
│   │   └── style.css           # Glassmorphism, animations, responsive design
│   └── js/
│       └── auth.js             # Google Identity Services SDK controller & session storage
└── backend/
    ├── app.py                  # FastAPI server, endpoints, static file mounting
    ├── auth.py                 # Google ID token verification & JWT session middleware
    ├── database.py             # SQLite engine & session dependency
    ├── models.py               # SQLAlchemy User model (id, google_id, email, etc.)
    ├── users.db                # Auto-generated SQLite database
    └── requirements.txt        # Python package dependencies
```

---

## 🗄️ SQLite Database Schema (`users` table)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique record ID |
| `google_id` | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED | Google OAuth unique identifier (`sub`) |
| `full_name` | VARCHAR(255) | NOT NULL | User's full name from Google profile |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED | User's verified email address |
| `profile_picture` | TEXT | NULLABLE | Google avatar image URL |
| `role` | VARCHAR(50) | DEFAULT 'student', NOT NULL | Role: `student` or `admin` |
| `created_at` | DATETIME | NOT NULL | Initial registration timestamp |
| `last_login` | DATETIME | NOT NULL | Last authentication timestamp (auto-updated) |

---

## ⚙️ Google Cloud Console Setup Instructions

To obtain your official **Google Client ID**:

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `Bhasha-Language-AI`).
3. Under **APIs & Services** &rarr; **OAuth consent screen**:
   - Choose **External** user type.
   - Enter **App name** (e.g., `AI Language Proficiency System`) and support email.
   - Click Save and continue through Scopes (`email`, `profile`, `openid`).
4. Under **Credentials** &rarr; **Create Credentials** &rarr; **OAuth client ID**:
   - Application type: **Web application**.
   - Name: `Language AI Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:8000`
     - `http://127.0.0.1:8000`
   - Click **Create** and copy your **Client ID** (format: `xxxxxxxx.apps.googleusercontent.com`).
5. Set your client ID in your terminal or environment variable before starting:
   ```bash
   # Windows PowerShell
   $env:GOOGLE_CLIENT_ID="YOUR_COPIED_CLIENT_ID.apps.googleusercontent.com"
   ```

---

## 🚀 How to Run the Server

1. **Navigate to the backend directory**:
   ```bash
   cd d:\project\google_auth\backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI application**:
   ```bash
   python app.py
   # Or directly with uvicorn:
   # uvicorn app:app --host 127.0.0.1 --port 8000 --reload
   ```

4. **Access the Application**:
   - **Frontend Login Page**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - **Interactive API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔒 Security Best Practices Implemented

1. **Zero Password Storage**: Passwords are never handled or stored. Authentication relies strictly on Google-signed asymmetric cryptographic tokens.
2. **Cryptographic ID Token Verification**: Validates signature, audience (`aud`), expiration (`exp`), and issuer (`iss = accounts.google.com`).
3. **Session Management**: Issues standard JWT Bearer tokens with 7-day expiration.
4. **Protected Route Middleware**: `get_current_user` extracts Bearer JWT and injects the database `User` object into protected routes.
5. **Instant Local Testing**: Includes an instant developer simulator to test user creation, `last_login` updating, and profile rendering immediately without requiring immediate Google Cloud credentials.
