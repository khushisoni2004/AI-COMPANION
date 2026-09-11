# AI Companion - Mental Health Support Platform

AI Companion is an AI-powered mental wellness platform designed to provide supportive emotional conversations, mood tracking, meditation, music therapy, self-help content, mind games, and yoga posture detection in one place.

This project focuses on making mental wellness support more accessible through an interactive AI companion, a clean user interface, and useful wellness modules.

## Live Demo

Frontend: https://ai-companion-three-gray.vercel.app

## Repository

GitHub: https://github.com/khushisoni2004/AI-COMPANION

## Important Disclaimer

This platform is created for educational and wellness-support purposes only. It is not a replacement for professional medical advice, diagnosis, therapy, or emergency care.

## Key Features

- AI companion chatbot for supportive conversations
- Mood tracking and emotional activity logging
- Meditation and breathing support
- Music therapy for relaxation and focus
- Yoga and exercise posture detection using MediaPipe
- Self-help reading and mental growth section
- 30 interactive mind games for focus, memory, language, logic, and relaxation
- Secure backend APIs
- Private session-scoped wellness analytics
- Lightweight SQLite storage with no external database required
- Crisis-safe response handling
- Abuse moderation that rejects and does not store abusive messages

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Three.js
- MediaPipe

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn

## Run Locally

Start the backend:

```bash
cd mental-health-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Start the frontend in a second terminal:

```bash
cd FRONTEND
npm install
npm run dev
```

For production, set `VITE_API_URL` to the public backend URL and set a strong
`AURORA_SECRET_KEY` on the backend. Configure `CORS_ORIGINS` with the frontend
origin.

## Project Structure

```text
AI-COMPANION/
├── FRONTEND/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── mental-health-backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── screenshots/
│   └── .gitkeep
│
├── README.md
├── .gitignore
└── LICENSE
