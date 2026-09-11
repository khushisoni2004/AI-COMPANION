"""Production entrypoint for the Aurora mental-wellness API.

The app intentionally uses SQLite and the Python standard library so it can run
locally or on a small deployment without MongoDB or a multi-gigabyte ML model.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("AURORA_DB_PATH", str(BASE_DIR / "aurora_app.db")))
SECRET_KEY = os.getenv("AURORA_SECRET_KEY", "change-this-secret-in-production")
TOKEN_TTL = timedelta(days=1)

app = FastAPI(title="Aurora API", version="6.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",")],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
conn.row_factory = sqlite3.Row
with conn:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
            age INTEGER, created_at TEXT NOT NULL, last_login TEXT
        );
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL,
            role TEXT NOT NULL, text TEXT NOT NULL, time TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL,
            event_type TEXT NOT NULL, section TEXT NOT NULL, details TEXT,
            duration_seconds INTEGER DEFAULT 0, calm_score INTEGER, time TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS mood_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL,
            mood_value INTEGER NOT NULL, mood_label TEXT NOT NULL, time TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT, category TEXT,
            description TEXT, image TEXT, created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS book_reads (
            id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL,
            book_id INTEGER NOT NULL, opened_at TEXT NOT NULL, closed_at TEXT,
            duration_seconds INTEGER DEFAULT 0, pages_read INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS favorite_books (
            id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL,
            book_id INTEGER NOT NULL, created_at TEXT NOT NULL,
            UNIQUE(session_id, book_id)
        );
    """)


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    age: Optional[int] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class MoodRequest(BaseModel):
    session_id: Optional[str] = "default"
    mood_value: int
    mood_label: str


class ActivityRequest(BaseModel):
    session_id: Optional[str] = "default"
    section: str
    event_type: str = "visit"
    details: Optional[str] = ""
    duration_seconds: Optional[int] = 0
    calm_score: Optional[int] = None


class MeditationRequest(BaseModel):
    session_id: Optional[str] = "default"
    duration_seconds: int
    meditation_type: str
    calm_score: Optional[int] = None


class ExerciseRequest(BaseModel):
    session_id: Optional[str] = "default"
    exercise_type: str
    duration_seconds: int
    intensity: str = "moderate"


class BookCreate(BaseModel):
    id: int
    title: str
    author: str = ""
    category: str = ""
    description: str = ""
    image: str = ""


class BookOpenRequest(BaseModel):
    session_id: Optional[str] = "default"
    book_id: int


class BookCloseRequest(BookOpenRequest):
    duration_seconds: int = 0
    pages_read: int = 0
    completed: int = 0


class FavoriteRequest(BookOpenRequest):
    pass


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def sid(value: Optional[str]) -> str:
    return (value or "default").strip() or "default"


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
    return f"{salt}${digest}"


def password_matches(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split("$", 1)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
        return hmac.compare_digest(actual, digest)
    except ValueError:
        return False


def encode_token(user: sqlite3.Row) -> str:
    payload = {"sub": user["id"], "email": user["email"], "exp": int((datetime.now(timezone.utc) + TOKEN_TTL).timestamp())}
    body = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
    return f"{body}.{signature}"


def decode_token(token: str) -> dict:
    try:
        body, signature = token.split(".", 1)
        expected = hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise ValueError
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if payload["exp"] < datetime.now(timezone.utc).timestamp():
            raise ValueError
        return payload
    except (ValueError, KeyError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_user(email: str):
    return conn.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()


def save_event(req: ActivityRequest) -> None:
    with conn:
        conn.execute(
            "INSERT INTO events (session_id,event_type,section,details,duration_seconds,calm_score,time) VALUES (?,?,?,?,?,?,?)",
            (sid(req.session_id), req.event_type, req.section, req.details or "", max(0, req.duration_seconds or 0), req.calm_score, now()),
        )


CRISIS_TERMS = ("suicide", "suicidal", "kill myself", "end my life", "self harm", "self-harm", "hurt myself", "want to die")
ABUSE_TERMS = {
    "asshole", "bastard", "behenchod", "bhenchod", "bhosdike", "bitch",
    "chutiya", "fuck", "fucker", "gaand", "gandu", "gelchode", "harami",
    "madarchod", "randi",
}
ABUSE_MESSAGE = "Abusive language is not allowed here. Please express what you're feeling without insults, and I'll be glad to listen."
NORMALIZATION_MAP = str.maketrans({"@": "a", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "0": "o", "$": "s"})


def normalized_words(message: str) -> set[str]:
    """Normalize common punctuation/number evasions without substring false positives."""
    normalized = message.casefold().translate(NORMALIZATION_MAP)
    words = re.findall(r"[a-z]+", normalized)
    return {re.sub(r"(.)\1{2,}", r"\1\1", word) for word in words}


def is_abusive_message(message: str) -> bool:
    words = normalized_words(message)
    compact = re.sub(r"[^a-z]", "", message.casefold().translate(NORMALIZATION_MAP))
    repeated_patterns = ("".join(f"{re.escape(char)}+" for char in term) for term in ABUSE_TERMS)
    abusive_suffix = any(re.fullmatch(r"[a-z]{2,}(?:chod|chode)", word) for word in words)
    return bool(words & ABUSE_TERMS) or abusive_suffix or any(re.search(pattern, compact) for pattern in repeated_patterns)


RESPONSE_POOLS = {
    "overwhelmed": (
        "It sounds like too many things are demanding your attention at once. Let's shrink the moment: name the one thing that truly needs you in the next ten minutes. Everything else can wait.",
        "Overwhelm often means your mind is trying to hold everything simultaneously. Put both feet on the floor, take one slow breath, and tell me the most urgent thought on your mind.",
    ),
    "motivation": (
        "You do not need to feel fully motivated before you begin. Choose one task, make it tiny—just two minutes—and let starting create the momentum. What would your two-minute step be?",
        "Let's make progress feel possible: pick the smallest useful action you can finish now, then give yourself credit for showing up. What are you trying to move forward today?",
        "A difficult day does not erase your ability. Lower the bar from ‘finish it’ to ‘begin it’: open the page, write one line, or take one step. Which goal needs a gentle push?",
    ),
    "calm": (
        "Let's slow this down together. Relax your jaw, drop your shoulders, inhale through your nose for four counts, then exhale for six. Repeat that three times and tell me what you notice.",
        "For the next thirty seconds, you do not need to solve anything. Notice five things you can see, four you can feel, and three you can hear. I’ll stay with you while the intensity settles.",
    ),
    "anxiety": (
        "We can take anxiety one step at a time. First, place both feet on the ground. Breathe in for four and out for six. Now ask: is there a danger happening right now, or is my mind predicting one?",
        "Anxiety can make every thought feel urgent. Let's separate facts from fears: what do you know is happening, and what are you worried might happen?",
        "I’m with you. Try naming the feeling—‘this is anxiety, not certainty’—then take one longer exhale. What thought keeps returning most strongly?",
    ),
    "share": (
        "Of course. Take your time—you can start anywhere, and you do not have to explain it perfectly. What would you like me to understand?",
        "I’m listening, without judgment. Share as much or as little as feels comfortable. What happened?",
    ),
    "sad": (
        "I'm sorry this feels so heavy. You deserve gentleness right now. Would it help more to talk about what happened, or to focus on getting through the next hour?",
        "Thank you for saying it out loud. You do not have to carry the whole feeling alone—what part of today has hurt the most?",
    ),
    "angry": (
        "That anger is telling you something mattered. Before acting on it, take one slow breath and give yourself a little space. What boundary, need, or hurt is underneath it?",
    ),
    "lonely": (
        "Loneliness can feel painfully quiet. I’m here with you in this moment. Is there someone safe you could message—even just to say hello—or would you rather talk with me about what feels missing?",
    ),
    "sleep": (
        "Let's help your mind shift toward rest. Dim the screen, unclench your body from forehead to toes, and make each exhale longer than the inhale. What is keeping your mind awake tonight?",
    ),
    "thanks": ("You’re very welcome. I’m glad you reached out—would you like to keep talking or take a quiet moment for yourself?",),
    "greeting": ("Hi—I'm glad you're here. How are you feeling right now: calm, low, anxious, overwhelmed, or something else?",),
    "default": (
        "I’m listening. Tell me what happened and what you need most right now—support, a practical next step, or simply space to be heard.",
        "You can say it in your own words. What feels most important for me to understand right now?",
    ),
}


def detect_intent(text: str) -> str:
    if text in {"hi", "hello", "hey", "hi aurora", "hello aurora"}:
        return "greeting"
    checks = (
        ("overwhelmed", ("overwhelmed", "too much", "can't handle", "cannot handle", "burned out", "burnt out")),
        ("motivation", ("motivat", "procrastinat", "no energy", "give up", "encourage", "inspire")),
        ("calm", ("calm down", "help me calm", "ground me", "breathing exercise", "panic", "panicking")),
        ("anxiety", ("anxious", "anxiety", "worried", "worry", "nervous", "stressed", "stress")),
        ("share", ("share something", "need to talk", "can we talk", "listen to me", "tell you something")),
        ("sad", ("sad", "depressed", "down", "hopeless", "crying", "empty")),
        ("angry", ("angry", "furious", "frustrated", "irritated")),
        ("lonely", ("lonely", "alone", "nobody cares", "isolated")),
        ("sleep", ("can't sleep", "cannot sleep", "insomnia", "fall asleep", "awake at night")),
        ("thanks", ("thank you", "thanks", "helpful")),
        ("greeting", ("hello", "hi ", "hey", "good morning", "good evening")),
    )
    return next((intent for intent, phrases in checks if any(phrase in text for phrase in phrases)), "default")


def reply_to(message: str) -> tuple[str, bool, bool]:
    text = message.casefold().strip()
    crisis = any(term in text for term in CRISIS_TERMS)
    if crisis:
        return ("I'm really glad you reached out. Please contact local emergency services now if you are in immediate danger. In India, you can also call Tele-MANAS at 14416. Please stay with someone you trust while you get support.", True, is_abusive_message(message))
    if is_abusive_message(message):
        return (ABUSE_MESSAGE, False, True)
    intent = detect_intent(text)
    return (secrets.choice(RESPONSE_POOLS[intent]), False, False)


@app.get("/")
def root():
    return {"status": "Aurora API running", "docs": "/docs"}


@app.get("/health")
def health():
    conn.execute("SELECT 1").fetchone()
    return {"status": "healthy", "database": "sqlite", "timestamp": now()}


@app.post("/auth/register")
def register(req: RegisterRequest):
    name, email = req.name.strip(), req.email.strip().lower()
    if len(name) < 2:
        raise HTTPException(400, "Name must be at least 2 characters")
    if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        raise HTTPException(400, "Enter a valid email")
    if len(req.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    if req.age is not None and not 13 <= req.age <= 120:
        raise HTTPException(400, "Enter a valid age between 13 and 120")
    if get_user(email):
        raise HTTPException(409, "Email already registered")
    with conn:
        cursor = conn.execute("INSERT INTO users(name,email,password_hash,age,created_at) VALUES(?,?,?,?,?)", (name, email, hash_password(req.password), req.age, now()))
    user = conn.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return {"access_token": encode_token(user), "token_type": "bearer", "name": name, "email": email, "message": "Account created successfully"}


@app.post("/auth/login")
def login(req: LoginRequest):
    user = get_user(req.email)
    if not user or not password_matches(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    with conn:
        conn.execute("UPDATE users SET last_login = ? WHERE id = ?", (now(), user["id"]))
    return {"access_token": encode_token(user), "token_type": "bearer", "name": user["name"], "email": user["email"], "message": "Login successful"}


@app.post("/auth/forgot-password")
def forgot_password(_: ForgotPasswordRequest):
    return {"message": "If this email exists, reset instructions will be sent."}


@app.get("/auth/me")
def auth_me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    payload = decode_token(authorization[7:])
    user = get_user(payload["email"])
    if not user:
        raise HTTPException(404, "User not found")
    return {key: user[key] for key in ("id", "name", "email", "age", "created_at", "last_login")}


@app.post("/chat")
def chat(req: ChatRequest):
    message = req.message.strip()
    if not message:
        raise HTTPException(400, "Message cannot be empty")
    session_id, (response, crisis, abusive) = sid(req.session_id), reply_to(message)
    if abusive:
        details = "crisis_with_abusive_language" if crisis else "abusive_language"
        save_event(ActivityRequest(session_id=session_id, section="avatar", event_type="message_blocked", details=details))
        return {"response": response, "is_crisis": crisis, "is_abusive": True, "accepted": False, "session_id": session_id}
    timestamp = now()
    with conn:
        conn.execute("INSERT INTO chats(session_id,role,text,time) VALUES(?,?,?,?)", (session_id, "user", message, timestamp))
        conn.execute("INSERT INTO chats(session_id,role,text,time) VALUES(?,?,?,?)", (session_id, "avatar", response, now()))
    save_event(ActivityRequest(session_id=session_id, section="avatar", event_type="chat_message", details=message[:80]))
    return {"response": response, "is_crisis": crisis, "is_abusive": False, "accepted": True, "session_id": session_id}


@app.get("/session/{session_id}/history")
def history(session_id: str):
    rows = conn.execute("SELECT role,text,time FROM chats WHERE session_id=? ORDER BY id", (session_id,)).fetchall()
    return {"session_id": session_id, "messages": [dict(row) for row in rows]}


@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    with conn:
        for table in ("chats", "events", "mood_logs", "favorite_books", "book_reads"):
            conn.execute(f"DELETE FROM {table} WHERE session_id = ?", (session_id,))
    return {"message": "Session cleared"}


@app.post("/activity")
@app.post("/event")
def activity(req: ActivityRequest):
    save_event(req)
    return {"status": "ok"}


@app.post("/mood")
def mood(req: MoodRequest):
    if not 1 <= req.mood_value <= 5:
        raise HTTPException(400, "Mood value must be between 1 and 5")
    with conn:
        conn.execute("INSERT INTO mood_logs(session_id,mood_value,mood_label,time) VALUES(?,?,?,?)", (sid(req.session_id), req.mood_value, req.mood_label.strip(), now()))
    save_event(ActivityRequest(session_id=req.session_id, section="dashboard", event_type="mood_checkin", details=req.mood_label))
    return {"status": "ok", "message": "Mood logged"}


@app.post("/meditation")
def meditation(req: MeditationRequest):
    save_event(ActivityRequest(session_id=req.session_id, section="meditation", event_type=req.meditation_type, duration_seconds=max(0, req.duration_seconds), calm_score=req.calm_score))
    return {"status": "ok", "message": "Meditation logged"}


@app.post("/exercise")
def exercise(req: ExerciseRequest):
    save_event(ActivityRequest(session_id=req.session_id, section="exercise", event_type=req.exercise_type, details=req.intensity, duration_seconds=max(0, req.duration_seconds)))
    return {"status": "ok", "message": "Exercise logged"}


@app.get("/dashboard")
def dashboard(session_id: str = "default"):
    session_id = sid(session_id)
    today = date.today()
    start = today - timedelta(days=6)
    total = conn.execute("SELECT COUNT(*) c FROM events WHERE session_id=?", (session_id,)).fetchone()["c"]
    seconds = conn.execute("SELECT COALESCE(SUM(duration_seconds),0) total FROM events WHERE session_id=? AND section='meditation'", (session_id,)).fetchone()["total"]
    avg = conn.execute("SELECT COALESCE(AVG(mood_value),0) avg FROM mood_logs WHERE session_id=? AND date(time)>=date(?)", (session_id, start.isoformat())).fetchone()["avg"]
    mood_rows = conn.execute("SELECT date(time) d, ROUND(AVG(mood_value),0) mood FROM mood_logs WHERE session_id=? AND date(time)>=date(?) GROUP BY date(time)", (session_id, start.isoformat())).fetchall()
    mood_map = {row["d"]: int(row["mood"]) for row in mood_rows}
    mood_days = {row["d"] for row in conn.execute("SELECT DISTINCT date(time) d FROM mood_logs WHERE session_id=?", (session_id,))}
    streak, cursor = 0, today
    while cursor.isoformat() in mood_days:
        streak, cursor = streak + 1, cursor - timedelta(days=1)
    recent = [dict(row) for row in conn.execute("SELECT section AS module,time,duration_seconds,event_type,details FROM events WHERE session_id=? ORDER BY id DESC LIMIT 20", (session_id,))]
    for item in recent:
        item["module"] = item["module"].title()
        item["duration"] = f'{item.pop("duration_seconds")} sec'
    days = [start + timedelta(days=i) for i in range(7)]
    module_rows = conn.execute("SELECT section,COUNT(*) count FROM events WHERE session_id=? GROUP BY section", (session_id,)).fetchall()
    return {"stats": {"streak": streak, "sessions_done": total, "mood_avg": round(avg, 1), "minutes": round(seconds / 60)}, "week_days": [d.strftime("%a") for d in days], "week_moods": [mood_map.get(d.isoformat(), 0) for d in days], "recent_activity": recent, "visits": {row["section"]: row["count"] for row in module_rows}}


@app.get("/stats")
def stats():
    def count(table: str) -> int:
        return conn.execute(f"SELECT COUNT(*) c FROM {table}").fetchone()["c"]
    return {"database": "sqlite", "total_conversations": count("chats") // 2, "total_mood_logs": count("mood_logs"), "total_events": count("events"), "total_meditations": conn.execute("SELECT COUNT(*) c FROM events WHERE section='meditation'").fetchone()["c"], "total_exercises": conn.execute("SELECT COUNT(*) c FROM events WHERE section='exercise'").fetchone()["c"]}


def ensure_book(book_id: int) -> None:
    if not conn.execute("SELECT id FROM books WHERE id=?", (book_id,)).fetchone():
        raise HTTPException(404, "Book not found")


@app.post("/books/bulk")
def books_bulk(books: list[BookCreate]):
    with conn:
        for book in books:
            conn.execute("INSERT OR REPLACE INTO books(id,title,author,category,description,image,created_at) VALUES(?,?,?,?,?,?,COALESCE((SELECT created_at FROM books WHERE id=?),?))", (book.id, book.title, book.author, book.category, book.description, book.image, book.id, now()))
    return {"status": "ok", "count": len(books)}


@app.get("/books")
def books():
    return [dict(row) for row in conn.execute("SELECT * FROM books ORDER BY title")]


@app.post("/mental-growth/open")
def book_open(req: BookOpenRequest):
    ensure_book(req.book_id)
    with conn:
        conn.execute("INSERT INTO book_reads(session_id,book_id,opened_at) VALUES(?,?,?)", (sid(req.session_id), req.book_id, now()))
    save_event(ActivityRequest(session_id=req.session_id, section="growth", event_type="book_open", details=f"book_id:{req.book_id}"))
    return {"status": "ok"}


@app.post("/mental-growth/close")
def book_close(req: BookCloseRequest):
    row = conn.execute("SELECT id FROM book_reads WHERE session_id=? AND book_id=? ORDER BY id DESC LIMIT 1", (sid(req.session_id), req.book_id)).fetchone()
    if not row:
        raise HTTPException(404, "No open read session found")
    with conn:
        conn.execute("UPDATE book_reads SET closed_at=?,duration_seconds=?,pages_read=?,completed=? WHERE id=?", (now(), max(0, req.duration_seconds), max(0, req.pages_read), int(bool(req.completed)), row["id"]))
    save_event(ActivityRequest(session_id=req.session_id, section="growth", event_type="book_close", details=f"book_id:{req.book_id}", duration_seconds=req.duration_seconds))
    return {"status": "ok"}


@app.post("/mental-growth/favorite")
def favorite(req: FavoriteRequest):
    ensure_book(req.book_id)
    session_id = sid(req.session_id)
    existing = conn.execute("SELECT id FROM favorite_books WHERE session_id=? AND book_id=?", (session_id, req.book_id)).fetchone()
    with conn:
        if existing:
            conn.execute("DELETE FROM favorite_books WHERE id=?", (existing["id"],))
            return {"status": "ok", "favorite": False}
        conn.execute("INSERT INTO favorite_books(session_id,book_id,created_at) VALUES(?,?,?)", (session_id, req.book_id, now()))
    return {"status": "ok", "favorite": True}


@app.get("/mental-growth/favorites/{session_id}")
def favorites(session_id: str):
    query = "SELECT b.id,b.title,b.author,b.category,b.description,b.image FROM favorite_books f JOIN books b ON b.id=f.book_id WHERE f.session_id=? ORDER BY f.id DESC"
    return [dict(row) for row in conn.execute(query, (session_id,))]


@app.get("/mental-growth/history/{session_id}")
def reading_history(session_id: str):
    query = "SELECT r.*,b.title,b.author,b.category FROM book_reads r JOIN books b ON b.id=r.book_id WHERE r.session_id=? ORDER BY r.id DESC LIMIT 100"
    return [dict(row) for row in conn.execute(query, (session_id,))]


@app.get("/mental-growth/stats")
def reading_stats():
    row = conn.execute("SELECT COUNT(*) total_reads,COALESCE(SUM(duration_seconds),0) total_time,COALESCE(SUM(pages_read),0) pages FROM book_reads").fetchone()
    return {"total_books": conn.execute("SELECT COUNT(*) c FROM books").fetchone()["c"], "total_reads": row["total_reads"], "total_read_time_seconds": row["total_time"], "total_pages_read": row["pages"], "top_books": []}


@app.get("/all-data")
def all_data():
    result = {}
    for table in ("chats", "mood_logs", "events", "book_reads"):
        rows = [dict(row) for row in conn.execute(f"SELECT * FROM {table} ORDER BY id DESC LIMIT 200")]
        result[table] = {"count": len(rows), "data": rows}
    return {"database": "sqlite", "collections": result}
