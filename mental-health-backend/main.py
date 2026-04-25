from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Tuple
from datetime import datetime, date, timedelta
from pathlib import Path
import hashlib
import secrets
import sqlite3
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

from jose import JWTError, jwt

# =========================
# PATHS / CONFIG
# =========================
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "Aurora_Model_Merged"
DB_PATH = BASE_DIR / "aurora_app.db"

SECRET_KEY = "aurora_secret_key_change_later"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24



# =========================
# LOAD MODEL
# =========================
print("Loading Aurora merged model...")
print("Model path:", MODEL_PATH)
print("DB path:", DB_PATH)

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model folder not found: {MODEL_PATH}")

tokenizer = AutoTokenizer.from_pretrained(str(MODEL_PATH), local_files_only=True)

if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

if torch.backends.mps.is_available():
    DEVICE = "mps"
elif torch.cuda.is_available():
    DEVICE = "cuda"
else:
    DEVICE = "cpu"

print("Using device:", DEVICE)

model = AutoModelForCausalLM.from_pretrained(
    str(MODEL_PATH),
    local_files_only=True,
    torch_dtype=torch.float16 if DEVICE in ["cuda", "mps"] else torch.float32,
)

model = model.to(DEVICE)
model.eval()

print("✅ Aurora merged model loaded successfully!")

# =========================
# APP
# =========================
app = FastAPI(title="Aurora API", version="5.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# SQLITE SETUP
# =========================
conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
conn.row_factory = sqlite3.Row

with conn:
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        age INTEGER,
        created_at TEXT NOT NULL,
        last_login TEXT,
        is_active INTEGER DEFAULT 1
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        text TEXT NOT NULL,
        time TEXT NOT NULL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        section TEXT NOT NULL,
        details TEXT,
        duration_seconds INTEGER DEFAULT 0,
        calm_score INTEGER,
        time TEXT NOT NULL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS mood_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        mood_value INTEGER NOT NULL,
        mood_label TEXT NOT NULL,
        time TEXT NOT NULL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        category TEXT,
        description TEXT,
        image TEXT,
        created_at TEXT NOT NULL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS book_reads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        book_id INTEGER NOT NULL,
        opened_at TEXT NOT NULL,
        closed_at TEXT,
        duration_seconds INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (book_id) REFERENCES books(id)
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS favorite_books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        book_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(session_id, book_id),
        FOREIGN KEY (book_id) REFERENCES books(id)
    )
    """)

print("✅ SQLite tables ready")

# =========================
# PROMPT / SAFETY
# =========================
SYSTEM_PROMPT = """
You are Aurora, a warm and supportive AI mental health companion.

Rules:
- Your name is always Aurora.
- Answer the user's actual question directly first.
- If the user is emotional, respond with empathy and one practical suggestion.
- Keep responses short, natural, relevant, and non-repetitive.
- Never say you are Ruby, Codex, ChatGPT, or any other assistant.
- Do not diagnose mental health or medical conditions.
- Do not claim to be a therapist, psychologist, or doctor.
"""

CRISIS_PATTERNS = [
    "suicide", "suicidal", "kill myself", "end my life", "want to die",
    "self harm", "self-harm", "hurt myself", "cut myself", "cutting myself",
    "overdose", "better off dead", "don't want to live", "no reason to live",
    "can't go on", "life is not worth living", "want everything to stop"
]

DIAGNOSIS_PATTERNS = [
    "do i have depression", "diagnose me", "am i mentally ill",
    "what disorder do i have", "am i depressed", "do i have anxiety disorder",
    "do i have adhd", "do i have bipolar"
]

CRISIS_RESPONSE = """I'm really glad you reached out. What you're feeling matters, and you do not have to handle this alone.

Please contact crisis support right now:

- iCall India: 9152987821
- Vandrevala Foundation: 1860-2662-345
- AASRA: 9820466627

If you are in immediate danger, call local emergency services or go to the nearest hospital now.
"""

DIAGNOSIS_RESPONSE = """I can support you emotionally, but I can't diagnose mental health conditions. A licensed mental health professional can help assess what you're experiencing."""

# =========================
# PYDANTIC MODELS
# =========================
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    age: Optional[int] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
    email: str
    message: str


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class ChatResponse(BaseModel):
    response: str
    is_crisis: bool
    session_id: str


class ActivityRequest(BaseModel):
    session_id: Optional[str] = "default"
    section: str
    event_type: str = "visit"
    details: Optional[str] = ""
    duration_seconds: Optional[int] = 0
    calm_score: Optional[int] = None


class MoodRequest(BaseModel):
    session_id: Optional[str] = "default"
    mood_value: int
    mood_label: str


class BookCreate(BaseModel):
    id: int
    title: str
    author: Optional[str] = ""
    category: Optional[str] = ""
    description: Optional[str] = ""
    image: Optional[str] = ""


class BookOpenRequest(BaseModel):
    session_id: Optional[str] = "default"
    book_id: int


class BookCloseRequest(BaseModel):
    session_id: Optional[str] = "default"
    book_id: int
    duration_seconds: Optional[int] = 0
    pages_read: Optional[int] = 0
    completed: Optional[int] = 0


class FavoriteRequest(BaseModel):
    session_id: Optional[str] = "default"
    book_id: int

# =========================
# HELPERS
# =========================
def utc_now_iso() -> str:
    return datetime.utcnow().isoformat()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()
    return f"{salt}${hashed}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, hashed = stored_hash.split("$")
        check_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100000
        ).hex()
        return secrets.compare_digest(check_hash, hashed)
    except Exception:
        return False
    
def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_user_by_email(email: str):
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM users WHERE email = ? AND is_active = 1",
        (email.strip().lower(),)
    )
    row = cur.fetchone()
    return dict(row) if row else None


def is_crisis_message(message: str) -> bool:
    return any(pattern in message.lower().strip() for pattern in CRISIS_PATTERNS)


def is_diagnosis_request(message: str) -> bool:
    return any(pattern in message.lower().strip() for pattern in DIAGNOSIS_PATTERNS)


def format_duration_label(seconds: int) -> str:
    sec = int(seconds or 0)
    if sec <= 0:
        return "Opened"
    if sec < 60:
        return f"{sec} sec"
    if sec < 3600:
        return f"{sec // 60} min"
    return f"{sec // 3600} hr {(sec % 3600) // 60} min"


def save_message(session_id: str, role: str, text: str):
    with conn:
        conn.cursor().execute(
            "INSERT INTO chats (session_id, role, text, time) VALUES (?, ?, ?, ?)",
            (session_id, role, text, utc_now_iso())
        )


def save_event(session_id: str, event_type: str, section: str, details: str = "", duration_seconds: int = 0, calm_score: Optional[int] = None):
    with conn:
        conn.cursor().execute("""
            INSERT INTO events (session_id, event_type, section, details, duration_seconds, calm_score, time)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id, event_type, section, details,
            int(duration_seconds or 0), calm_score, utc_now_iso()
        ))


def save_mood(session_id: str, mood_value: int, mood_label: str):
    with conn:
        conn.cursor().execute(
            "INSERT INTO mood_logs (session_id, mood_value, mood_label, time) VALUES (?, ?, ?, ?)",
            (session_id, mood_value, mood_label, utc_now_iso())
        )


def get_history_from_sqlite(session_id: str) -> List[Tuple[str, str]]:
    cur = conn.cursor()
    cur.execute("SELECT role, text FROM chats WHERE session_id = ? ORDER BY id ASC", (session_id,))
    rows = cur.fetchall()

    history = []
    last_user = None

    for row in rows:
        if row["role"] == "user":
            last_user = row["text"]
        elif row["role"] == "avatar" and last_user:
            history.append((last_user, row["text"]))
            last_user = None

    return history


def book_exists(book_id: int) -> bool:
    cur = conn.cursor()
    cur.execute("SELECT id FROM books WHERE id = ?", (book_id,))
    return cur.fetchone() is not None


def generate_response(user_message: str, history=None) -> str:
    if is_crisis_message(user_message):
        return CRISIS_RESPONSE

    if is_diagnosis_request(user_message):
        return DIAGNOSIS_RESPONSE

    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if history:
            for u, a in history[-1:]:
                messages.append({"role": "user", "content": str(u)[:100]})
                messages.append({"role": "assistant", "content": str(a)[:100]})

        messages.append({"role": "user", "content": str(user_message)[:150]})

        prompt = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=256
        ).to(DEVICE)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=40,
                do_sample=True,
                temperature=0.6,
                top_p=0.9,
                use_cache=True,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id,
            )

        new_tokens = outputs[0][inputs["input_ids"].shape[1]:]
        response = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
        return response if response else "I'm here for you."

    except Exception as e:
        print("Model generation error:", repr(e))
        return "I'm here for you. Please try again."

# =========================
# ROOT / HEALTH
# =========================
@app.get("/")
def root():
    return {"status": "Aurora API running", "db": str(DB_PATH)}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "device": DEVICE,
        "db_path": str(DB_PATH)
    }

# =========================
# AUTH ROUTES
# =========================
@app.post("/auth/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    name = req.name.strip()
    email = req.email.strip().lower()

    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Enter a valid email")
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if req.age is not None and (req.age < 13 or req.age > 120):
        raise HTTPException(status_code=400, detail="Enter valid age between 13 and 120")
    if get_user_by_email(email):
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = hash_password(req.password)

    with conn:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO users (name, email, password_hash, age, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (name, email, password_hash, req.age, utc_now_iso()))
        user_id = cur.lastrowid

    token = create_token({"sub": str(user_id), "email": email, "name": name})

    return AuthResponse(
        access_token=token,
        name=name,
        email=email,
        message="Account created successfully"
    )


@app.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = get_user_by_email(email)

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    with conn:
        conn.cursor().execute(
            "UPDATE users SET last_login = ? WHERE email = ?",
            (utc_now_iso(), email)
        )

    token = create_token({"sub": str(user["id"]), "email": email, "name": user["name"]})

    return AuthResponse(
        access_token=token,
        name=user["name"],
        email=email,
        message="Login successful"
    )


@app.get("/auth/me")
def auth_me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = get_user_by_email(email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "age": user["age"],
        "created_at": user["created_at"],
        "last_login": user["last_login"]
    }


@app.get("/auth/users")
def list_users():
    cur = conn.cursor()
    cur.execute("""
        SELECT id, name, email, age, created_at, last_login
        FROM users
        ORDER BY id DESC
    """)
    return {"users": [dict(row) for row in cur.fetchall()]}

# =========================
# CHAT ROUTES
# =========================
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        sid = req.session_id or "default"
        history = get_history_from_sqlite(sid)
        response = generate_response(req.message, history)

        save_message(sid, "user", req.message)
        save_message(sid, "avatar", response)
        save_event(sid, "chat_message", "avatar", details=req.message[:80])

        return ChatResponse(response=response, is_crisis=is_crisis_message(req.message), session_id=sid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=repr(e))


@app.get("/session/{session_id}/history")
def get_history(session_id: str):
    cur = conn.cursor()
    cur.execute("SELECT role, text, time FROM chats WHERE session_id = ? ORDER BY id ASC", (session_id,))
    return {"session_id": session_id, "messages": [dict(row) for row in cur.fetchall()]}


@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    with conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM chats WHERE session_id = ?", (session_id,))
        cur.execute("DELETE FROM events WHERE session_id = ?", (session_id,))
        cur.execute("DELETE FROM mood_logs WHERE session_id = ?", (session_id,))
        cur.execute("DELETE FROM favorite_books WHERE session_id = ?", (session_id,))
        cur.execute("DELETE FROM book_reads WHERE session_id = ?", (session_id,))
    return {"message": f"Session {session_id} cleared"}

# =========================
# ACTIVITY / MOOD / DASHBOARD
# =========================
@app.post("/activity")
def log_activity(req: ActivityRequest):
    sid = req.session_id or "default"
    save_event(sid, req.event_type, req.section, req.details or "", req.duration_seconds or 0, req.calm_score)
    return {"status": "ok"}


@app.post("/mood")
def log_mood(req: MoodRequest):
    sid = req.session_id or "default"
    save_mood(sid, req.mood_value, req.mood_label)
    save_event(sid, "mood_checkin", "dashboard", details=req.mood_label)
    return {"status": "ok"}


@app.get("/dashboard")
def dashboard_data():
    cur = conn.cursor()
    today = date.today()
    week_ago = today - timedelta(days=6)
    month_ago = today - timedelta(days=29)

    cur.execute("""
        SELECT COUNT(*) AS c FROM events
        WHERE event_type IN ('visit', 'duration', 'mood_checkin', 'chat_message', 'book_open', 'book_close')
    """)
    sessions_done = cur.fetchone()["c"]

    cur.execute("""
        SELECT COALESCE(SUM(duration_seconds), 0) AS total
        FROM events WHERE section = 'meditation' AND date(time) >= date(?)
    """, (month_ago.isoformat(),))
    row1 = cur.fetchone()
    minutes_meditated = round((row1["total"] or 0) / 60) if row1 else 0

    cur.execute("""
        SELECT COALESCE(AVG(mood_value), 0) AS avg_mood
        FROM mood_logs WHERE date(time) >= date(?)
    """, (week_ago.isoformat(),))
    row2 = cur.fetchone()
    avg_mood = row2["avg_mood"] if row2 and row2["avg_mood"] is not None else 0

    cur.execute("SELECT DISTINCT date(time) AS d FROM mood_logs ORDER BY d DESC")
    mood_date_set = set(row["d"] for row in cur.fetchall())

    streak = 0
    check_day = today
    while check_day.isoformat() in mood_date_set:
        streak += 1
        check_day -= timedelta(days=1)

    cur.execute("""
        SELECT date(time) AS d, ROUND(AVG(mood_value), 0) AS avg_mood
        FROM mood_logs WHERE date(time) >= date(?)
        GROUP BY date(time)
        ORDER BY d ASC
    """, (week_ago.isoformat(),))
    mood_map = {row["d"]: int(row["avg_mood"]) for row in cur.fetchall() if row["avg_mood"] is not None}

    week_days = []
    week_moods = []
    for i in range(7):
        d = week_ago + timedelta(days=i)
        week_days.append(d.strftime("%a"))
        week_moods.append(mood_map.get(d.isoformat(), 0))

    cur.execute("""
        SELECT section, event_type, details, duration_seconds, time
        FROM events ORDER BY id DESC LIMIT 20
    """)
    recent_activity = []
    for row in cur.fetchall():
        recent_activity.append({
            "module": row["section"].title(),
            "time": row["time"],
            "duration": format_duration_label(row["duration_seconds"]),
            "details": row["details"] or "",
            "event_type": row["event_type"],
        })

    return {
        "stats": {
            "streak": streak,
            "sessions_done": sessions_done,
            "mood_avg": round(avg_mood, 1),
            "minutes": minutes_meditated,
        },
        "week_moods": week_moods,
        "week_days": week_days,
        "recent_activity": recent_activity,
    }

# =========================
# BOOK ROUTES
# =========================
@app.post("/books/bulk")
def save_books_bulk(books: List[BookCreate]):
    with conn:
        cur = conn.cursor()
        for book in books:
            cur.execute("""
                INSERT OR REPLACE INTO books (id, title, author, category, description, image, created_at)
                VALUES (?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM books WHERE id = ?), ?))
            """, (
                book.id, book.title, book.author or "", book.category or "",
                book.description or "", book.image or "", book.id, utc_now_iso()
            ))
    return {"status": "ok", "count": len(books)}


@app.get("/books")
def get_books():
    cur = conn.cursor()
    cur.execute("SELECT id, title, author, category, description, image, created_at FROM books ORDER BY title ASC")
    return [dict(row) for row in cur.fetchall()]


@app.post("/mental-growth/open")
def open_book(req: BookOpenRequest):
    sid = req.session_id or "default"
    if not book_exists(req.book_id):
        raise HTTPException(status_code=404, detail="Book not found")

    with conn:
        conn.cursor().execute("""
            INSERT INTO book_reads (session_id, book_id, opened_at, closed_at, duration_seconds, pages_read, completed)
            VALUES (?, ?, ?, NULL, 0, 0, 0)
        """, (sid, req.book_id, utc_now_iso()))

    save_event(sid, "book_open", "growth", details=f"book_id:{req.book_id}")
    return {"status": "ok", "message": "Book opened"}


@app.post("/mental-growth/close")
def close_book(req: BookCloseRequest):
    sid = req.session_id or "default"
    with conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT id FROM book_reads
            WHERE session_id = ? AND book_id = ?
            ORDER BY id DESC LIMIT 1
        """, (sid, req.book_id))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="No open read session found")

        cur.execute("""
            UPDATE book_reads
            SET closed_at = ?, duration_seconds = ?, pages_read = ?, completed = ?
            WHERE id = ?
        """, (
            utc_now_iso(),
            int(req.duration_seconds or 0),
            int(req.pages_read or 0),
            int(req.completed or 0),
            row["id"]
        ))

    save_event(sid, "book_close", "growth", details=f"book_id:{req.book_id}", duration_seconds=req.duration_seconds or 0)
    return {"status": "ok", "message": "Book closed"}


@app.post("/mental-growth/favorite")
def toggle_favorite(req: FavoriteRequest):
    sid = req.session_id or "default"

    if not book_exists(req.book_id):
        raise HTTPException(status_code=404, detail="Book not found")

    cur = conn.cursor()
    cur.execute("SELECT id FROM favorite_books WHERE session_id = ? AND book_id = ?", (sid, req.book_id))
    existing = cur.fetchone()

    with conn:
        cur = conn.cursor()
        if existing:
            cur.execute("DELETE FROM favorite_books WHERE session_id = ? AND book_id = ?", (sid, req.book_id))
            return {"status": "ok", "favorite": False}

        cur.execute(
            "INSERT INTO favorite_books (session_id, book_id, created_at) VALUES (?, ?, ?)",
            (sid, req.book_id, utc_now_iso())
        )
        return {"status": "ok", "favorite": True}


@app.get("/mental-growth/favorites/{session_id}")
def get_favorites(session_id: str):
    cur = conn.cursor()
    cur.execute("""
        SELECT b.id, b.title, b.author, b.category, b.description, b.image
        FROM favorite_books f
        JOIN books b ON f.book_id = b.id
        WHERE f.session_id = ?
        ORDER BY f.id DESC
    """, (session_id,))
    return [dict(row) for row in cur.fetchall()]


@app.get("/mental-growth/history/{session_id}")
def get_book_history(session_id: str):
    cur = conn.cursor()
    cur.execute("""
        SELECT br.*, b.title, b.author, b.category
        FROM book_reads br
        JOIN books b ON br.book_id = b.id
        WHERE br.session_id = ?
        ORDER BY br.id DESC
        LIMIT 100
    """, (session_id,))
    return [dict(row) for row in cur.fetchall()]


@app.get("/mental-growth/stats")
def mental_growth_stats():
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) AS total_books FROM books")
    total_books = cur.fetchone()["total_books"]

    cur.execute("SELECT COUNT(*) AS total_reads FROM book_reads")
    total_reads = cur.fetchone()["total_reads"]

    cur.execute("SELECT COALESCE(SUM(duration_seconds), 0) AS total_read_time FROM book_reads")
    total_read_time = cur.fetchone()["total_read_time"]

    cur.execute("SELECT COALESCE(SUM(pages_read), 0) AS total_pages FROM book_reads")
    total_pages = cur.fetchone()["total_pages"]

    cur.execute("""
        SELECT b.id, b.title, b.author, b.category,
               COUNT(br.id) AS read_count,
               COALESCE(SUM(br.duration_seconds), 0) AS total_read_time
        FROM books b
        LEFT JOIN book_reads br ON b.id = br.book_id
        GROUP BY b.id, b.title, b.author, b.category
        ORDER BY read_count DESC, total_read_time DESC
        LIMIT 10
    """)
    top_books = [dict(row) for row in cur.fetchall()]

    return {
        "total_books": total_books,
        "total_reads": total_reads,
        "total_read_time_seconds": total_read_time,
        "total_pages_read": total_pages,
        "top_books": top_books,
    }