"""
Non-destructive, idempotent migration to populate English curriculum Chapters 1-8.
Inserts only missing lessons and questions, and preserves all user data, progress, and other tracks.
"""

import os
import sys
import json
import sqlite3
import hashlib
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.curriculum_data import CURRICULUM
from app.curriculum_theories import THEORIES


def compute_file_hash(filepath: str) -> str:
    """Compute SHA-256 hash of a file."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def run_migration(db_path: str = None):
    if db_path is None:
        db_path = str(backend_dir / "bhasha.db")

    print(f"Target Database: {db_path}")
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database not found at {db_path}")

    # Step 1: Pre-migration Hash
    pre_hash = compute_file_hash(db_path)
    print(f"Pre-migration SHA-256:  {pre_hash}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Step 2: Baseline Audits
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count_before = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM progress")
    progress_count_before = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM user_lesson_progress")
    user_lesson_progress_before = cursor.fetchone()[0]

    cursor.execute("SELECT track_slug, COUNT(*) FROM lessons GROUP BY track_slug")
    tracks_lessons_before = dict(cursor.fetchall())
    print(f"Baseline Users: {user_count_before}, Progress Records: {progress_count_before}, UserLessonProg: {user_lesson_progress_before}")
    print(f"Baseline Lessons by Track: {tracks_lessons_before}")

    # Ensure English Track in 'tracks' table has total_lessons = 8
    cursor.execute("SELECT id, slug, total_lessons FROM tracks WHERE slug = 'English' OR slug = 'english'")
    track_row = cursor.fetchone()
    if track_row:
        if track_row[2] != 8:
            cursor.execute("UPDATE tracks SET total_lessons = 8 WHERE id = ?", (track_row[0],))
            print("Updated English track total_lessons to 8.")
    else:
        cursor.execute(
            "INSERT INTO tracks (slug, name, icon, description, total_lessons) VALUES (?, ?, ?, ?, ?)",
            ("English", "English Fluency Track", "🇬🇧", "Professional communication, grammar precision, and conversational mastery.", 8)
        )
        print("Inserted English track record into tracks table.")

    # Step 3: Insert missing English lessons & questions
    english_curriculum = CURRICULUM.get("English", {})
    lessons_data = english_curriculum.get("lessons", [])

    lessons_added = 0
    theories_updated = 0
    questions_added = 0

    for lesson_item in lessons_data:
        l_num = lesson_item["lesson_number"]
        l_title = lesson_item["title"]
        l_desc = lesson_item.get("description", "")
        theory_content = THEORIES.get("English", {}).get(l_num, "")

        # Check if lesson exists
        cursor.execute(
            "SELECT id, title, description, theory FROM lessons WHERE (track_slug = 'English' OR track_slug = 'english') AND lesson_number = ?",
            (l_num,)
        )
        existing_lesson = cursor.fetchone()

        if existing_lesson is None:
            cursor.execute(
                "INSERT INTO lessons (track_slug, lesson_number, title, description, theory) VALUES (?, ?, ?, ?, ?)",
                ("English", l_num, l_title, l_desc, theory_content)
            )
            lesson_id = cursor.lastrowid
            lessons_added += 1
            print(f"  + Added Lesson {l_num}: '{l_title}' (ID: {lesson_id})")
        else:
            lesson_id = existing_lesson[0]
            # Update theory if missing or empty
            if not existing_lesson[3] or len(existing_lesson[3].strip()) == 0:
                cursor.execute("UPDATE lessons SET theory = ? WHERE id = ?", (theory_content, lesson_id))
                theories_updated += 1
                print(f"  * Updated Theory for Lesson {l_num} (ID: {lesson_id})")

        # Process questions for this lesson
        for q in lesson_item.get("questions", []):
            q_text = q["question_text"]
            cursor.execute(
                "SELECT id FROM questions WHERE lesson_id = ? AND question_text = ?",
                (lesson_id, q_text)
            )
            existing_q = cursor.fetchone()

            if existing_q is None:
                cursor.execute(
                    "INSERT INTO questions (lesson_id, question_text, description, options_json, answer_index, explanation) VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        lesson_id,
                        q_text,
                        q.get("description", "Choose the correct answer."),
                        json.dumps(q["options"]),
                        q["answer_index"],
                        q.get("explanation", "")
                    )
                )
                questions_added += 1
                print(f"    + Added Question to Lesson {l_num}: {q_text[:60]}...")

    conn.commit()

    # Step 4: Verification of Integrity & Idempotency Check
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count_after = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM progress")
    progress_count_after = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM user_lesson_progress")
    user_lesson_progress_after = cursor.fetchone()[0]

    cursor.execute("SELECT track_slug, COUNT(*) FROM lessons GROUP BY track_slug")
    tracks_lessons_after = dict(cursor.fetchall())

    cursor.execute("SELECT COUNT(*) FROM questions q JOIN lessons l ON q.lesson_id = l.id WHERE l.track_slug = 'English' OR l.track_slug = 'english'")
    total_english_questions = cursor.fetchone()[0]

    cursor.execute("SELECT id, lesson_number, title, length(theory), (SELECT COUNT(*) FROM questions WHERE lesson_id = lessons.id) FROM lessons WHERE track_slug = 'English' OR track_slug = 'english' ORDER BY lesson_number")
    english_lessons_summary = cursor.fetchall()

    conn.close()

    # Step 5: Post-migration Hash
    post_hash = compute_file_hash(db_path)
    print("\n" + "="*60)
    print("MIGRATION EXECUTION SUMMARY:")
    print("="*60)
    print(f"Pre-migration SHA-256:   {pre_hash}")
    print(f"Post-migration SHA-256:  {post_hash}")
    print(f"Hash Changed:           {pre_hash != post_hash}")
    print(f"Lessons Added:          {lessons_added}")
    print(f"Theories Updated:       {theories_updated}")
    print(f"Questions Added:        {questions_added}")
    print(f"Total English Lessons:  {tracks_lessons_after.get('English', 0)}")
    print(f"Total English Questions:{total_english_questions}")
    print("\nDetailed English Curriculum Breakdown:")
    for row in english_lessons_summary:
        print(f"  Chapter {row[1]}: '{row[2]}' | Theory Length: {row[3]} chars | Questions: {row[4]}")

    print("\nIntegrity Verification:")
    print(f"  Users:               {user_count_before} -> {user_count_after} (MATCH: {user_count_before == user_count_after})")
    print(f"  Progress:            {progress_count_before} -> {progress_count_after} (MATCH: {progress_count_before == progress_count_after})")
    print(f"  UserLessonProgress:  {user_lesson_progress_before} -> {user_lesson_progress_after} (MATCH: {user_lesson_progress_before == user_lesson_progress_after})")
    print(f"  Other Tracks Lessons: Python={tracks_lessons_after.get('Python', 0)}, Java={tracks_lessons_after.get('Java', 0)}, C++={tracks_lessons_after.get('C++', 0)}")

    assert user_count_before == user_count_after, "FATAL: User count changed!"
    assert progress_count_before == progress_count_after, "FATAL: Progress count changed!"
    assert tracks_lessons_after.get('Python', 0) == 8, "Python lessons corrupted"
    assert tracks_lessons_after.get('Java', 0) == 8, "Java lessons corrupted"
    assert tracks_lessons_after.get('C++', 0) == 8, "C++ lessons corrupted"
    assert tracks_lessons_after.get('English', 0) == 8, "English lessons count != 8"
    assert total_english_questions == 40, f"Expected 40 English questions (5 per chapter * 8 chapters), got {total_english_questions}"

    print("\n[SUCCESS] Migration completed with 100% data integrity!")
    return {
        "pre_hash": pre_hash,
        "post_hash": post_hash,
        "lessons_added": lessons_added,
        "theories_updated": theories_updated,
        "questions_added": questions_added,
        "total_english_lessons": tracks_lessons_after.get('English', 0),
        "total_english_questions": total_english_questions
    }


if __name__ == "__main__":
    run_migration()
