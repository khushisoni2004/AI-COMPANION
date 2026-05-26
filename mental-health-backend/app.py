from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
import random
import logging

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "chatDB"

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

conversations_collection = db["conversations"]
mood_logs_collection = db["mood_logs"]
events_collection = db["events"]
meditation_sessions_collection = db["meditation_sessions"]
exercise_logs_collection = db["exercise_logs"]

app = FastAPI(title="MindCare AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class MoodRequest(BaseModel):
    session_id: Optional[str] = "default"
    mood_value: int
    mood_label: str


class EventRequest(BaseModel):
    session_id: Optional[str] = "default"
    event_type: str
    section: str
    details: Optional[str] = ""
    duration_seconds: Optional[int] = 0


class MeditationRequest(BaseModel):
    session_id: Optional[str] = "default"
    duration_seconds: int
    meditation_type: str
    calm_score: Optional[int] = None


class ExerciseRequest(BaseModel):
    session_id: Optional[str] = "default"
    exercise_type: str
    duration_seconds: int
    intensity: Optional[str] = "moderate"


def serialize_doc(doc):
    clean_doc = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            clean_doc[key] = str(value)
        elif isinstance(value, datetime):
            clean_doc[key] = value.isoformat()
        else:
            clean_doc[key] = value
    return clean_doc


def is_crisis(message: str) -> bool:
    crisis_keywords = ["suicide", "suicidal", "kill myself", "hurt myself", "end my life"]
    return any(word in message.lower() for word in crisis_keywords)


def generate_response(user_message: str) -> str:
    msg = user_message.lower()

    if is_crisis(user_message):
        return "Please contact immediate crisis support. You matter and help is available."

    if any(word in msg for word in ["anxious", "anxiety", "worried", "stressed"]):
        return random.choice([
            "I hear that you are feeling anxious. Can you tell me more?",
            "Stress can feel heavy. Let us take this slowly.",
            "Thank you for sharing. Would you like to try a short breathing exercise?"
        ])

    if any(word in msg for word in ["sad", "depressed", "down", "hopeless"]):
        return random.choice([
            "I am sorry you are feeling this way. I am here to listen.",
            "That sounds difficult. Can you tell me what happened today?",
            "Your feelings are valid. Let us understand them together."
        ])

    return "I am here with you. Tell me more about how you are feeling."


@app.on_event("startup")
async def startup_db():
    try:
        await db.command("ping")

        existing = await db.list_collection_names()
        needed = [
            "conversations",
            "mood_logs",
            "events",
            "meditation_sessions",
            "exercise_logs",
        ]

        for name in needed:
            if name not in existing:
                await db.create_collection(name)

        logger.info("MongoDB connected successfully")

    except Exception as e:
        logger.error(f"MongoDB startup error: {e}")


@app.get("/")
async def root():
    return {
        "message": "MindCare backend is running",
        "database": DATABASE_NAME,
        "docs": "/docs",
        "health": "/health",
        "all_data": "/all-data",
    }


@app.get("/health")
async def health():
    try:
        await db.command("ping")
        return {
            "status": "healthy",
            "database": DATABASE_NAME,
            "mongodb": "connected",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/collections")
async def collections():
    names = await db.list_collection_names()
    return {
        "database": DATABASE_NAME,
        "collections": sorted(names),
    }


@app.post("/chat")
async def chat(req: ChatRequest):
    message = req.message.strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    ai_response = generate_response(message)
    crisis = is_crisis(message)

    doc = {
        "session_id": req.session_id or "default",
        "user_message": message,
        "ai_response": ai_response,
        "is_crisis": crisis,
        "page": "AvatarCompanion",
        "timestamp": datetime.utcnow(),
    }

    result = await conversations_collection.insert_one(doc)

    return {
        "status": "ok",
        "inserted_id": str(result.inserted_id),
        "response": ai_response,
        "is_crisis": crisis,
        "session_id": req.session_id,
    }


@app.post("/mood")
async def mood(req: MoodRequest):
    doc = {
        "session_id": req.session_id or "default",
        "mood_value": req.mood_value,
        "mood_label": req.mood_label,
        "page": "Dashboard",
        "timestamp": datetime.utcnow(),
    }

    result = await mood_logs_collection.insert_one(doc)

    return {
        "status": "ok",
        "message": "Mood logged",
        "inserted_id": str(result.inserted_id),
    }


@app.post("/event")
async def event(req: EventRequest):
    doc = {
        "session_id": req.session_id or "default",
        "event_type": req.event_type,
        "section": req.section,
        "details": req.details,
        "duration_seconds": req.duration_seconds,
        "timestamp": datetime.utcnow(),
    }

    result = await events_collection.insert_one(doc)

    return {
        "status": "ok",
        "message": "Event logged",
        "inserted_id": str(result.inserted_id),
    }


@app.post("/meditation")
async def meditation(req: MeditationRequest):
    doc = {
        "session_id": req.session_id or "default",
        "duration_seconds": req.duration_seconds,
        "meditation_type": req.meditation_type,
        "calm_score": req.calm_score,
        "page": "Meditation",
        "timestamp": datetime.utcnow(),
    }

    result = await meditation_sessions_collection.insert_one(doc)

    return {
        "status": "ok",
        "message": "Meditation logged",
        "inserted_id": str(result.inserted_id),
    }


@app.post("/exercise")
async def exercise(req: ExerciseRequest):
    doc = {
        "session_id": req.session_id or "default",
        "exercise_type": req.exercise_type,
        "duration_seconds": req.duration_seconds,
        "intensity": req.intensity,
        "page": "Exercise",
        "timestamp": datetime.utcnow(),
    }

    result = await exercise_logs_collection.insert_one(doc)

    return {
        "status": "ok",
        "message": "Exercise logged",
        "inserted_id": str(result.inserted_id),
    }


@app.get("/stats")
async def stats():
    return {
        "database": DATABASE_NAME,
        "total_conversations": await conversations_collection.count_documents({}),
        "total_mood_logs": await mood_logs_collection.count_documents({}),
        "total_events": await events_collection.count_documents({}),
        "total_meditations": await meditation_sessions_collection.count_documents({}),
        "total_exercises": await exercise_logs_collection.count_documents({}),
    }


@app.get("/all-data")
async def all_data():
    conversations = await conversations_collection.find().sort("timestamp", -1).limit(200).to_list(200)
    moods = await mood_logs_collection.find().sort("timestamp", -1).limit(200).to_list(200)
    events = await events_collection.find().sort("timestamp", -1).limit(200).to_list(200)
    meditations = await meditation_sessions_collection.find().sort("timestamp", -1).limit(200).to_list(200)
    exercises = await exercise_logs_collection.find().sort("timestamp", -1).limit(200).to_list(200)

    return {
        "database": DATABASE_NAME,
        "collections": {
            "conversations": {
                "count": len(conversations),
                "data": [serialize_doc(doc) for doc in conversations],
            },
            "mood_logs": {
                "count": len(moods),
                "data": [serialize_doc(doc) for doc in moods],
            },
            "events": {
                "count": len(events),
                "data": [serialize_doc(doc) for doc in events],
            },
            "meditation_sessions": {
                "count": len(meditations),
                "data": [serialize_doc(doc) for doc in meditations],
            },
            "exercise_logs": {
                "count": len(exercises),
                "data": [serialize_doc(doc) for doc in exercises],
            },
        },
    }


@app.get("/session/{session_id}/history")
async def history(session_id: str):
    cursor = conversations_collection.find({"session_id": session_id}).sort("timestamp", 1)

    messages = []
    async for doc in cursor:
        messages.append({
            "user": doc.get("user_message", ""),
            "ai": doc.get("ai_response", ""),
            "timestamp": doc.get("timestamp").isoformat() if doc.get("timestamp") else None,
        })

    return {
        "session_id": session_id,
        "messages": messages,
    }