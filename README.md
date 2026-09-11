<div align="center">

# ✦ MindAura

### Your private, interactive AI wellness companion

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=DM+Sans&weight=600&size=22&pause=1000&color=5EEAD4&center=true&vCenter=true&width=680&lines=Talk.+Breathe.+Reflect.+Grow.;30+cognitive+games+for+a+sharper+mind.;A+calmer+space%2C+one+small+step+at+a+time." alt="MindAura animated introduction" /></a>

[![Live App](https://img.shields.io/badge/Live_App-Open_MindAura-5eead4?style=for-the-badge&logo=vercel&logoColor=06101a)](https://ai-companion-coral-chi.vercel.app)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)

**[Experience the live app](https://ai-companion-coral-chi.vercel.app)** · **[Explore features](#-the-mindaura-experience)** · **[Run locally](#-run-locally)**

</div>

---

## 🌌 What is MindAura?

MindAura brings supportive conversation, mood awareness, mindful breathing,
movement, therapeutic sound, personal-growth reading, and cognitive play into
one focused experience. Aurora responds to common emotional needs with distinct,
practical guidance while keeping clear boundaries around crisis support,
diagnosis, and abusive language.

> [!IMPORTANT]
> MindAura is an educational wellness-support project. It is not a replacement
> for professional medical advice, diagnosis, therapy, or emergency care.

## ✨ The MindAura experience

| Space | What you can do |
|---|---|
| **Aurora Companion** | Have natural, intent-aware conversations with voice input and spoken replies |
| **Mood Dashboard** | Log daily mood, follow streaks, and review private session activity |
| **Meditation Studio** | Use guided breathing, calm timers, and mindful sessions |
| **Move & Yoga** | Follow structured exercises and camera-assisted posture experiences |
| **Sound Therapy** | Explore relaxing playlists, playback controls, and sleep timers |
| **Growth Library** | Read curated personal-growth material and save favourites |
| **Mind Games** | Play 30 exercises across memory, focus, language, speed, math, and logic |

### 🧠 A 30-game cognitive studio

The game library includes Memory Match, 2048, Wordle, Sudoku, Simon Says,
Typing Speed, Trivia, Pattern Recall, Mental Math, Word Hunt, Grid Navigator,
Logic Gates, Reflex Trainer, 2-Back Focus, Mindful Recall, Odd One Out, and more.

### 🛡️ Safety by design

- Crisis language receives immediate, region-relevant support guidance.
- English and Hindi/Hinglish abusive language—including common evasive spellings—is rejected.
- Rejected abusive content is not stored in conversation history.
- Wellness analytics are isolated by session rather than shared across users.
- Aurora does not diagnose conditions or present itself as a therapist.

## 🏗️ Architecture

```mermaid
flowchart LR
    A[React + Vite] --> B[FastAPI]
    B --> C[(SQLite)]
    A --> D[Three.js Avatar]
    A --> E[MediaPipe Vision]
    B --> F[Safety + Intent Engine]
    F --> B
```

| Layer | Technology |
|---|---|
| Interface | React 18, Vite, CSS, Lucide React |
| Interactive media | Three.js, MediaPipe Tasks Vision, Web Speech APIs |
| API | Python, FastAPI, Pydantic, Uvicorn |
| Storage | SQLite |
| Production | Vercel frontend with configurable backend URL |

## 🚀 Run locally

### 1. Start the API

```bash
cd mental-health-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

The API is available at `http://127.0.0.1:8000`; interactive documentation is
available at `http://127.0.0.1:8000/docs`.

### 2. Start the interface

```bash
cd FRONTEND
npm install
npm run dev
```

Open the local address printed by Vite.

## ⚙️ Production configuration

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Public URL of the deployed FastAPI service |
| `AURORA_SECRET_KEY` | Strong private signing secret for authentication tokens |
| `AURORA_DB_PATH` | Optional SQLite database location |
| `CORS_ORIGINS` | Comma-separated trusted frontend origins |

Never commit production secrets or local `.env` files.

## 📁 Project map

```text
AI-COMPANION/
├── FRONTEND/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── mental-health-backend/
│   ├── app.py
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## 🤝 Contributing

Thoughtful improvements are welcome. Please open an issue for substantial
changes and keep accessibility, privacy, emotional safety, and mobile usability
at the centre of every contribution.

---

<div align="center">

Built with care by [Khushi Soni](https://github.com/khushisoni2004)

**Pause. Breathe. Begin again.**

</div>
