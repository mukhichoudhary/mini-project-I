import json
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.user import (
    User, UserProfile, UserLessonProgress, UserProjectProgress, UserBadge,
    Progress, AdminLog
)
from app.models.content import (
    Track, Lesson, Question, Project, Badge, RoadmapStage,
    Course, Quiz, QuizResult
)
from app.auth.security import hash_password
from app.curriculum_data import CURRICULUM
from app.curriculum_theories import THEORIES

MODULES_SPEC = {
    "English": [
        {"key": "vocabulary", "name": "Vocabulary", "default_pct": 82, "score": 90, "attempts": 3, "time": 45},
        {"key": "grammar", "name": "Grammar", "default_pct": 75, "score": 85, "attempts": 4, "time": 60},
        {"key": "reading", "name": "Reading", "default_pct": 90, "score": 95, "attempts": 2, "time": 30},
        {"key": "pronunciation", "name": "Pronunciation", "default_pct": 65, "score": 78, "attempts": 5, "time": 50},
    ],
    "Python": [
        {"key": "syntax", "name": "Syntax", "default_pct": 95, "score": 98, "attempts": 2, "time": 40},
        {"key": "oop", "name": "OOP", "default_pct": 80, "score": 88, "attempts": 4, "time": 75},
        {"key": "functions", "name": "Functions", "default_pct": 88, "score": 92, "attempts": 3, "time": 55},
        {"key": "projects", "name": "Projects", "default_pct": 70, "score": 85, "attempts": 2, "time": 120},
    ],
    "Java": [
        {"key": "core_java", "name": "Core Java", "default_pct": 85, "score": 90, "attempts": 3, "time": 65},
        {"key": "collections", "name": "Collections", "default_pct": 72, "score": 80, "attempts": 4, "time": 80},
        {"key": "oop", "name": "OOP", "default_pct": 78, "score": 85, "attempts": 3, "time": 70},
    ],
    "C++": [
        {"key": "stl", "name": "STL", "default_pct": 80, "score": 86, "attempts": 3, "time": 60},
        {"key": "pointers", "name": "Pointers", "default_pct": 68, "score": 75, "attempts": 6, "time": 90},
        {"key": "dsa", "name": "DSA", "default_pct": 74, "score": 82, "attempts": 4, "time": 110},
    ],
}

def seed_database(force_refresh_curriculum: bool = False):
    """Seed initial tracks, courses, quizzes, lessons, progress, and admin logs into SQLite."""
    Base.metadata.create_all(bind=engine)

    # 1. Dynamic database migration for users and lessons table
    with engine.connect() as conn:
        # Check users table columns
        cols = [row[1] for row in conn.execute(text("PRAGMA table_info(users);")).fetchall()]
        if "google_id" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255);"))
        if "profile_picture" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture TEXT;"))
        if "last_login" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN last_login DATETIME;"))
        if "email_verified" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0;"))
        if "premium_until" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN premium_until DATETIME;"))
        if "total_screen_minutes" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN total_screen_minutes FLOAT DEFAULT 0.0;"))
        if "available_reward_minutes" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN available_reward_minutes FLOAT DEFAULT 0.0;"))
        conn.commit()
        
        # Check lessons table columns
        lesson_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(lessons);")).fetchall()]
        if "theory" not in lesson_cols:
            conn.execute(text("ALTER TABLE lessons ADD COLUMN theory TEXT;"))
            
        conn.commit()

    db: Session = SessionLocal()
    try:
        # 2. Seed Normalized Courses table
        courses_data = [
            {
                "slug": "english",
                "name": "English Communication Mastery",
                "icon": "🇬🇧",
                "category": "Language",
                "description": "Vocabulary building, grammatical accuracy, reading comprehension, and pronunciation precision.",
                "total_modules": 4
            },
            {
                "slug": "python",
                "name": "Python Software Engineering",
                "icon": "🐍",
                "category": "Programming",
                "description": "Syntax fundamentals, object-oriented paradigms, functional modularity, and applied projects.",
                "total_modules": 4
            },
            {
                "slug": "java",
                "name": "Enterprise Java Architecture",
                "icon": "☕",
                "category": "Programming",
                "description": "Core Java language specs, collections framework algorithms, and enterprise OOP patterns.",
                "total_modules": 3
            },
            {
                "slug": "cpp",
                "name": "High-Performance C++ Systems",
                "icon": "⚙️",
                "category": "Systems",
                "description": "Standard Template Library (STL), memory management via pointers, and data structures.",
                "total_modules": 3
            }
        ]

        course_id_map = {}
        for c in courses_data:
            existing = db.query(Course).filter(Course.slug == c["slug"]).first()
            if not existing:
                new_c = Course(**c)
                db.add(new_c)
                db.flush()
                course_id_map[c["slug"]] = new_c.id
            else:
                existing.name = c["name"]
                existing.description = c["description"]
                existing.total_modules = c["total_modules"]
                course_id_map[c["slug"]] = existing.id
        db.commit()

        # 3. Seed Normalized Quizzes table
        quizzes_seed = [
            # English Quizzes
            {"course_slug": "english", "topic": "Vocabulary", "title": "Academic & Tech Vocabulary", "difficulty": "Intermediate", "total_questions": 5, "time_limit_mins": 10, "pass_percentage": 70},
            {"course_slug": "english", "topic": "Grammar", "title": "Syntax & Subject-Verb Agreement", "difficulty": "Beginner", "total_questions": 5, "time_limit_mins": 8, "pass_percentage": 75},
            {"course_slug": "english", "topic": "Reading", "title": "Technical Reading & Inference", "difficulty": "Intermediate", "total_questions": 5, "time_limit_mins": 12, "pass_percentage": 70},
            {"course_slug": "english", "topic": "Pronunciation", "title": "Phonetics & Word Stress", "difficulty": "Advanced", "total_questions": 5, "time_limit_mins": 10, "pass_percentage": 80},
            # Python Quizzes
            {"course_slug": "python", "topic": "Syntax", "title": "Python Control Flow & Types", "difficulty": "Beginner", "total_questions": 5, "time_limit_mins": 8, "pass_percentage": 70},
            {"course_slug": "python", "topic": "OOP", "title": "Classes, Dunder Methods & Inheritance", "difficulty": "Intermediate", "total_questions": 5, "time_limit_mins": 12, "pass_percentage": 75},
            {"course_slug": "python", "topic": "Functions", "title": "Decorators, Generators & Closures", "difficulty": "Advanced", "total_questions": 5, "time_limit_mins": 15, "pass_percentage": 80},
            {"course_slug": "python", "topic": "Projects", "title": "Module Architecture & Clean Code", "difficulty": "Intermediate", "total_questions": 5, "time_limit_mins": 15, "pass_percentage": 70},
            # Java Quizzes
            {"course_slug": "java", "topic": "Core Java", "title": "JVM, Bytecode & Primitives", "difficulty": "Beginner", "total_questions": 5, "time_limit_mins": 10, "pass_percentage": 70},
            {"course_slug": "java", "topic": "Collections", "title": "Lists, HashMaps & Generics", "difficulty": "Intermediate", "total_questions": 5, "time_limit_mins": 12, "pass_percentage": 75},
            {"course_slug": "java", "topic": "OOP", "title": "Abstract Classes & Polymorphism", "difficulty": "Advanced", "total_questions": 5, "time_limit_mins": 15, "pass_percentage": 80},
            # C++ Quizzes
            {"course_slug": "cpp", "topic": "STL", "title": "Vector, Map & Algorithm Iterators", "difficulty": "Intermediate", "total_questions": 5, "time_limit_mins": 12, "pass_percentage": 75},
            {"course_slug": "cpp", "topic": "Pointers", "title": "Smart Pointers & Memory Allocation", "difficulty": "Advanced", "total_questions": 5, "time_limit_mins": 15, "pass_percentage": 80},
            {"course_slug": "cpp", "topic": "DSA", "title": "Binary Trees & Complexity Analysis", "difficulty": "Advanced", "total_questions": 5, "time_limit_mins": 20, "pass_percentage": 75},
        ]

        quiz_id_list = []
        for qz in quizzes_seed:
            c_id = course_id_map.get(qz["course_slug"])
            if not c_id:
                continue
            existing_q = db.query(Quiz).filter(Quiz.course_id == c_id, Quiz.title == qz["title"]).first()
            if not existing_q:
                new_q = Quiz(
                    course_id=c_id,
                    title=qz["title"],
                    topic=qz["topic"],
                    difficulty=qz["difficulty"],
                    total_questions=qz["total_questions"],
                    time_limit_mins=qz["time_limit_mins"],
                    pass_percentage=qz["pass_percentage"]
                )
                db.add(new_q)
                db.flush()
                quiz_id_list.append(new_q.id)
            else:
                quiz_id_list.append(existing_q.id)
        db.commit()

        # 4. Check if tracks exist (for frontend syllabus compatibility)
        tracks_data = [
            {"slug": "Python", "name": "Python Masterclass", "icon": "🐍", "description": "Master Python fundamentals, advanced data structures, OOP, and algorithms (W3Schools Syllabus).", "total_lessons": 8},
            {"slug": "Java", "name": "Java Royal Academy", "icon": "☕", "description": "Enterprise Java programming, JVM internals, type safety, and OOP paradigms (W3Schools Syllabus).", "total_lessons": 8},
            {"slug": "C++", "name": "C++ Architecture", "icon": "⚙️", "description": "High-performance systems programming, pointers, references, and object architecture (W3Schools Syllabus).", "total_lessons": 8},
            {"slug": "English", "name": "English Fluency Track", "icon": "🇬🇧", "description": "Professional communication, grammar precision, and conversational mastery.", "total_lessons": 8}
        ]
        for t in tracks_data:
            existing_track = db.query(Track).filter(Track.slug == t["slug"]).first()
            if not existing_track:
                db.add(Track(**t))
            else:
                existing_track.name = t["name"]
                existing_track.description = t["description"]
                existing_track.total_lessons = t["total_lessons"]
        db.commit()

        # 5. Seed legacy lessons & questions if missing
        if db.query(Question).count() < 10:
            for track_slug, track_info in CURRICULUM.items():
                for lesson_item in track_info["lessons"]:
                    l_num = lesson_item["lesson_number"]
                    theory_text = THEORIES.get(track_slug, {}).get(l_num, "")
                    new_lesson = Lesson(
                        track_slug=track_slug,
                        lesson_number=l_num,
                        title=lesson_item["title"],
                        description=lesson_item.get("description", ""),
                        theory=theory_text
                    )
                    db.add(new_lesson)
                    db.flush()
                    for q in lesson_item["questions"]:
                        db.add(Question(
                            lesson_id=new_lesson.id,
                            question_text=q["question_text"],
                            description=q.get("description", "Choose the correct answer."),
                            options_json=json.dumps(q["options"]),
                            answer_index=q["answer_index"],
                            explanation=q.get("explanation", "")
                        ))
            db.commit()

        # 6. Seed Projects (All 5 Categories: Python, Java, C++, English, General)
        projects_data = [
            {"slug": "python-calculator", "title": "Python Terminal Calculator", "subject": "Python", "icon": "🐍", "lesson_tag": "Python • Functions & Operators", "language": "PYTHON", "file_name": "main.py", "description": "Build a modular calculator supporting arithmetic operations.", "xp": 100, "default_progress": 0, "instructions_json": json.dumps(["Create calculator functions."]), "requirements_json": json.dumps(["Variables", "Functions"]), "starter_code": "# Python Calculator\n"},
            {"slug": "todo-list", "title": "Task Manager CLI", "subject": "Python", "icon": "📝", "lesson_tag": "Python • Lists & Loops", "language": "PYTHON", "file_name": "todo.py", "description": "Build a command-line to-do list manager.", "xp": 90, "default_progress": 0, "instructions_json": json.dumps(["Manage list of tasks."]), "requirements_json": json.dumps(["Lists", "File I/O"]), "starter_code": "# Task Manager\n"},
            {"slug": "java-atm", "title": "Java Bank Account Management", "subject": "Java", "icon": "☕", "lesson_tag": "Java • Encapsulation & Classes", "language": "JAVA", "file_name": "Main.java", "description": "Design an Object-Oriented bank account system with private balance fields and audit checks.", "xp": 120, "default_progress": 0, "instructions_json": json.dumps(["Build BankAccount class."]), "requirements_json": json.dumps(["Encapsulation", "Classes"]), "starter_code": "// Java Bank Account\n"},
            {"slug": "student-management", "title": "Student Management System", "subject": "Java", "icon": "☕", "lesson_tag": "Java • OOP & Classes", "language": "JAVA", "file_name": "Main.java", "description": "Build a student record management system with classes.", "xp": 120, "default_progress": 0, "instructions_json": json.dumps(["Build Student class."]), "requirements_json": json.dumps(["Classes", "OOP"]), "starter_code": "// Student Management\n"},
            {"slug": "banking-system", "title": "Banking Account System", "subject": "Java", "icon": "🏦", "lesson_tag": "Java • Encapsulation", "language": "JAVA", "file_name": "Bank.java", "description": "Design an OOP banking account system with balance safeguards.", "xp": 150, "default_progress": 0, "instructions_json": json.dumps(["Create BankAccount class."]), "requirements_json": json.dumps(["Encapsulation", "Methods"]), "starter_code": "// Banking System\n"},
            {"slug": "cpp-task-manager", "title": "C++ High Performance Task Manager", "subject": "C++", "icon": "⚙️", "lesson_tag": "C++ • Memory & References", "language": "CPP", "file_name": "main.cpp", "description": "Create a high performance CLI task manager in C++.", "xp": 110, "default_progress": 0, "instructions_json": json.dumps(["Implement task structs."]), "requirements_json": json.dumps(["Memory", "References"]), "starter_code": "// C++ Task Manager\n"},
            {"slug": "number-game", "title": "Number Guessing Game", "subject": "C++", "icon": "⚙️", "lesson_tag": "C++ • Conditionals & Loops", "language": "CPP", "file_name": "main.cpp", "description": "Create an interactive number guessing challenge in C++.", "xp": 80, "default_progress": 0, "instructions_json": json.dumps(["Generate random number."]), "requirements_json": json.dumps(["Loops", "Random"]), "starter_code": "// Number Game\n"},
            {"slug": "my-introduction", "title": "Personal Introduction", "subject": "English", "icon": "🇬🇧", "lesson_tag": "English • Vocabulary & Structure", "language": "ENGLISH", "file_name": "intro.txt", "description": "Write a professional self-introduction for interviews.", "xp": 60, "default_progress": 0, "instructions_json": json.dumps(["Write introduction."]), "requirements_json": json.dumps(["Grammar", "Vocabulary"]), "starter_code": "# Personal Introduction\n"},
            {"slug": "technical-doc-writing", "title": "API Technical Documentation Guide", "subject": "English", "icon": "📝", "lesson_tag": "Technical English • Technical Writing", "language": "MARKDOWN", "file_name": "api_docs.md", "description": "Draft comprehensive API technical documentation, endpoint specifications, parameter tables, and integration examples.", "xp": 90, "default_progress": 0, "instructions_json": json.dumps(["Document RESTful API endpoint."]), "requirements_json": json.dumps(["Technical Writing", "API Documentation", "Markdown"]), "starter_code": "# API Technical Documentation\n"},
            {"slug": "pr-code-review-kit", "title": "Code Review & PR Communication Guide", "subject": "English", "icon": "💬", "lesson_tag": "Technical English • Professional Communication", "language": "MARKDOWN", "file_name": "pull_request.md", "description": "Craft professional Pull Request descriptions, architectural change summaries, and constructive code review feedback.", "xp": 100, "default_progress": 0, "instructions_json": json.dumps(["Write PR description and constructive comments."]), "requirements_json": json.dumps(["Professional Communication", "Code Review"]), "starter_code": "# Pull Request & Review Guide\n"},
            {"slug": "dbms-schema-designer", "title": "Relational Database Schema & SQL Design", "subject": "General", "icon": "🗄️", "lesson_tag": "General Concepts • Database Management", "language": "SQL", "file_name": "schema.sql", "description": "Design normalized relational database schemas with primary/foreign keys, indexing strategies, and analytical SQL queries.", "xp": 110, "default_progress": 0, "instructions_json": json.dumps(["Design 3NF schema and queries."]), "requirements_json": json.dumps(["DBMS", "Normalization", "SQL"]), "starter_code": "-- Relational Schema\n"},
            {"slug": "algorithm-complexity-analyzer", "title": "Algorithm Complexity & Sorting Benchmark", "subject": "General", "icon": "📊", "lesson_tag": "General Concepts • Algorithms & Data Structures", "language": "PSEUDOCODE", "file_name": "analysis.txt", "description": "Analyze asymptotic time and space complexity (Big-O) across searching, sorting, and tree traversal algorithms.", "xp": 120, "default_progress": 0, "instructions_json": json.dumps(["Analyze Big-O bounds."]), "requirements_json": json.dumps(["Big-O Notation", "Time Complexity", "Space Complexity"]), "starter_code": "-- Algorithm Complexity Analysis\n"}
        ]
        for p in projects_data:
            existing_p = db.query(Project).filter(Project.slug == p["slug"]).first()
            if not existing_p:
                db.add(Project(**p))
            else:
                existing_p.title = p["title"]
                existing_p.subject = p["subject"]
                existing_p.xp = p["xp"]
        db.commit()

        # 7. Seed Badges (all 10 official curriculum achievement honors)
        badges_data = [
            {"slug": "first_step", "title": "First Step", "description": "Complete your very first coding lesson and submit code.", "icon": "🌱", "category": "milestone", "xp_required": 50},
            {"slug": "on_fire", "title": "On Fire", "description": "Maintain a 7-day unbroken coding practice streak.", "icon": "🔥", "category": "dedication", "xp_required": 350},
            {"slug": "graduate", "title": "Graduate", "description": "Complete your first full syllabus track.", "icon": "🎓", "category": "mastery", "xp_required": 500},
            {"slug": "xp_hunter", "title": "XP Hunter", "description": "Accumulate your first 1,000 XP in competitive practice.", "icon": "⚡", "category": "honor", "xp_required": 1000},
            {"slug": "bookworm", "title": "Bookworm", "description": "Complete 10 interactive code lessons across all tracks.", "icon": "📖", "category": "milestone", "xp_required": 500},
            {"slug": "code_craftsman", "title": "Code Craftsman", "description": "Complete real-world hands-on coding projects.", "icon": "🛠️", "category": "mastery", "xp_required": 300},
            {"slug": "curriculum_master", "title": "Curriculum Master", "description": "Complete 2 complete certification course syllabi.", "icon": "🏛️", "category": "mastery", "xp_required": 1500},
            {"slug": "unstoppable_streak", "title": "Unstoppable Streak", "description": "Maintain a 30-day continuous learning commitment.", "icon": "🌊", "category": "dedication", "xp_required": 1500},
            {"slug": "knowledge_seeker", "title": "Knowledge Seeker", "description": "Accumulate 5,000 XP through lessons, challenges, and mentors.", "icon": "💎", "category": "honor", "xp_required": 5000},
            {"slug": "polyglot_pioneer", "title": "Polyglot Pioneer", "description": "Begin learning and completing lessons in all 4 tracks.", "icon": "🌐", "category": "milestone", "xp_required": 400}
        ]
        for b in badges_data:
            existing_b = db.query(Badge).filter(Badge.slug == b["slug"]).first()
            if not existing_b:
                db.add(Badge(**b))
            else:
                existing_b.title = b["title"]
                existing_b.description = b["description"]
                existing_b.icon = b["icon"]
                existing_b.category = b["category"]
                existing_b.xp_required = b["xp_required"]
        db.commit()

        # 8. Seed default Administrator
        admin_user = db.query(User).filter(User.email == "admin@bhasha.ai").first()
        if not admin_user:
            admin_user = User(
                email="admin@bhasha.ai",
                full_name="Chief Academic Administrator",
                hashed_password=hash_password("admin123"),
                role="admin",
                google_id="admin_109283746501928374",
                profile_picture="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                last_login=datetime.utcnow()
            )
            db.add(admin_user)
            db.flush()
            admin_profile = UserProfile(
                user_id=admin_user.id,
                chosen_language="Python",
                daily_goal=30,
                total_xp=5000,
                streak_days=30,
                current_level=10,
                rank_tier="Administrator"
            )
            db.add(admin_profile)
            db.commit()
            print("Default administrator seeded: admin@bhasha.ai / admin123")
        else:
            admin_user.role = "admin"
            if not admin_user.google_id:
                admin_user.google_id = "admin_109283746501928374"
            if not admin_user.profile_picture:
                admin_user.profile_picture = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            if not admin_user.last_login:
                admin_user.last_login = datetime.utcnow()
            db.commit()

        # 9. Seed sample students with realistic Google ID, photos, and progress
        sample_students = [
            {
                "email": "alex.chen@example.com",
                "full_name": "Alex Chen",
                "lang": "Python",
                "xp": 1850,
                "streak": 14,
                "tier": "Stage 3 • Advanced Algorithms",
                "role": "scholar",
                "google_id": "google_11823746192837461234",
                "pic": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
                "reg_days_ago": 25,
                "last_active_hours_ago": 2
            },
            {
                "email": "sarah.miller@example.com",
                "full_name": "Sarah Miller",
                "lang": "Java",
                "xp": 1420,
                "streak": 9,
                "tier": "Stage 2 • Core Architecture",
                "role": "learner",
                "google_id": "google_10293847561029384756",
                "pic": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                "reg_days_ago": 18,
                "last_active_hours_ago": 6
            },
            {
                "email": "david.kumar@example.com",
                "full_name": "David Kumar",
                "lang": "C++",
                "xp": 2650,
                "streak": 21,
                "tier": "Stage 4 • Curriculum Mastery",
                "role": "scholar",
                "google_id": "google_19283746501928374650",
                "pic": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "reg_days_ago": 45,
                "last_active_hours_ago": 1
            },
            {
                "email": "elena.rostova@example.com",
                "full_name": "Elena Rostova",
                "lang": "English",
                "xp": 920,
                "streak": 5,
                "tier": "Stage 2 • Core Architecture",
                "role": "learner",
                "google_id": "google_17283940516273849501",
                "pic": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
                "reg_days_ago": 10,
                "last_active_hours_ago": 14
            },
            {
                "email": "priya.sharma@example.com",
                "full_name": "Priya Sharma",
                "lang": "Python",
                "xp": 3100,
                "streak": 28,
                "tier": "Stage 4 • Royal Scholar",
                "role": "scholar",
                "google_id": "google_16253443526172839405",
                "pic": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
                "reg_days_ago": 60,
                "last_active_hours_ago": 3
            },
            {
                "email": "marcus.vance@example.com",
                "full_name": "Marcus Vance",
                "lang": "Java",
                "xp": 640,
                "streak": 3,
                "tier": "Stage 1 • Foundations",
                "role": "learner",
                "google_id": None,
                "pic": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
                "reg_days_ago": 0,  # Registered today!
                "last_active_hours_ago": 0
            }
        ]

        now = datetime.utcnow()
        for stu in sample_students:
            exist_s = db.query(User).filter(User.email == stu["email"]).first()
            if not exist_s:
                reg_date = now - timedelta(days=stu["reg_days_ago"])
                last_active = now - timedelta(hours=stu["last_active_hours_ago"])
                new_s = User(
                    email=stu["email"],
                    full_name=stu["full_name"],
                    hashed_password=hash_password("password123"),
                    role=stu["role"],
                    google_id=stu["google_id"],
                    profile_picture=stu["pic"],
                    created_at=reg_date,
                    last_login=last_active
                )
                db.add(new_s)
                db.flush()
                new_p = UserProfile(
                    user_id=new_s.id,
                    chosen_language=stu["lang"],
                    daily_goal=20,
                    total_xp=stu["xp"],
                    streak_days=stu["streak"],
                    current_level=max(1, stu["xp"] // 300),
                    rank_tier=stu["tier"]
                )
                db.add(new_p)
                db.flush()
                exist_s = new_s
            else:
                # Update existing user fields if empty
                if not exist_s.google_id and stu.get("google_id"):
                    exist_s.google_id = stu["google_id"]
                if not exist_s.profile_picture:
                    exist_s.profile_picture = stu["pic"]
                if not exist_s.last_login:
                    exist_s.last_login = now - timedelta(hours=stu["last_active_hours_ago"])
                db.commit()

            # 10. Seed granular learning Progress for this student across all 4 subjects
            for lang, modules in MODULES_SPEC.items():
                is_chosen = (lang == stu["lang"])
                multiplier = 1.0 if is_chosen else 0.4
                for mod in modules:
                    existing_prog = db.query(Progress).filter(
                        Progress.user_id == exist_s.id,
                        Progress.course_slug == lang.lower(),
                        Progress.module_key == mod["key"]
                    ).first()
                    if not existing_prog:
                        pct = int(min(100, mod["default_pct"] * multiplier))
                        db.add(Progress(
                            user_id=exist_s.id,
                            course_slug=lang.lower(),
                            module_key=mod["key"],
                            module_name=mod["name"],
                            completion_percent=pct,
                            highest_score=int(mod["score"] * multiplier),
                            total_attempts=max(1, int(mod["attempts"] * multiplier)),
                            time_spent_mins=int(mod["time"] * multiplier),
                            is_completed=(pct >= 80),
                            last_accessed=exist_s.last_login or now
                        ))
            db.commit()

            # 11. Seed Quiz Results for this student
            existing_results = db.query(QuizResult).filter(QuizResult.user_id == exist_s.id).count()
            if existing_results == 0 and quiz_id_list:
                for idx, q_id in enumerate(quiz_id_list[:5]):
                    score_val = 4 if idx % 2 == 0 else 5
                    pct_val = (score_val / 5.0) * 100.0
                    db.add(QuizResult(
                        user_id=exist_s.id,
                        quiz_id=q_id,
                        score=score_val,
                        total_questions=5,
                        percentage=pct_val,
                        passed=(pct_val >= 70.0),
                        attempt_number=1,
                        time_taken_seconds=320 + (idx * 45),
                        completed_at=now - timedelta(days=idx * 2, hours=3)
                    ))
            db.commit()

        # 12. Seed Admin Logs
        if db.query(AdminLog).count() == 0 and admin_user:
            sample_logs = [
                {"action": "SYSTEM_INITIALIZED", "target_type": "system", "target_id": "core", "details": "Bhasha_AI Royal Academy normalized tables initialized.", "created_at": now - timedelta(days=2)},
                {"action": "CURRICULUM_SYNCED", "target_type": "course", "target_id": "all", "details": "Synced English, Python, Java, and C++ modules with quiz banks.", "created_at": now - timedelta(days=1)},
                {"action": "STUDENT_VERIFIED", "target_type": "student", "target_id": "alex.chen@example.com", "details": "Verified academic scholar status and granted Stage 3 badge.", "created_at": now - timedelta(hours=5)}
            ]
            for log in sample_logs:
                db.add(AdminLog(
                    admin_id=admin_user.id,
                    admin_email=admin_user.email,
                    action=log["action"],
                    target_type=log["target_type"],
                    target_id=log["target_id"],
                    details=log["details"],
                    ip_address="127.0.0.1",
                    created_at=log["created_at"]
                ))
            db.commit()

        print("Database seed complete: All normalized tables, quizzes, progress, and logs populated successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()
