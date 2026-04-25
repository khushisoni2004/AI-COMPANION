import { useState, useEffect, useRef, useMemo } from "react";

const sessions = [
  {
    id: 1,
    title: "Morning Calm",
    duration: 5,
    type: "Breathwork",
    color: "#4cc9f0",
    icon: "🌅",
    description: "Start your day with clear, focused breathing.",
    guide: [
      { label: "Inhale softly through your nose", duration: 4, scale: 1.3, voice: "Inhale softly through your nose" },
      { label: "Hold and relax your shoulders", duration: 4, scale: 1.3, voice: "Hold your breath and relax your shoulders" },
      { label: "Exhale slowly through your mouth", duration: 6, scale: 1.0, voice: "Exhale slowly through your mouth" },
      { label: "Pause in stillness", duration: 2, scale: 1.0, voice: "Pause and stay calm" },
    ],
  },
  {
    id: 2,
    title: "Anxiety Relief",
    duration: 10,
    type: "Guided",
    color: "#00d4aa",
    icon: "💚",
    description: "Gentle guidance to dissolve tension and worry.",
    guide: [
      { label: "Sit comfortably and notice your breath", duration: 10, voice: "Sit comfortably and notice your natural breathing" },
      { label: "Relax your jaw, neck, and shoulders", duration: 10, voice: "Relax your jaw, neck, and shoulders" },
      { label: "Notice one worry and let it pass", duration: 12, voice: "Notice one anxious thought and let it pass without fighting it" },
      { label: "Breathe in calm, breathe out tension", duration: 10, voice: "Breathe in calm and breathe out tension" },
      { label: "Repeat: I am safe in this moment", duration: 12, voice: "Repeat silently, I am safe in this moment" },
    ],
  },
  {
    id: 3,
    title: "Deep Sleep",
    duration: 20,
    type: "Sleep",
    color: "#7c5cfc",
    icon: "🌙",
    description: "Wind down and prepare your mind for deep rest.",
    guide: [
      { label: "Lie down and close your eyes", duration: 12, voice: "Lie down comfortably and gently close your eyes" },
      { label: "Slow your breathing", duration: 12, voice: "Take slow easy breaths, no effort needed" },
      { label: "Relax your forehead and jaw", duration: 12, voice: "Relax your forehead, jaw, and shoulders" },
      { label: "Let the body feel heavy", duration: 14, voice: "Let your body feel heavy and supported" },
      { label: "Drift into stillness", duration: 14, voice: "Allow your mind to become quiet and restful" },
    ],
  },
  {
    id: 4,
    title: "Focus Flow",
    duration: 15,
    type: "Concentration",
    color: "#ffd166",
    icon: "🎯",
    description: "Sharpen attention and enter a productive state.",
    guide: [
      { label: "Sit upright and steady", duration: 8, voice: "Sit upright and steady" },
      { label: "Focus only on your breath", duration: 10, voice: "Focus only on your breath" },
      { label: "Count 1 to 5 with each breath", duration: 10, voice: "Count from 1 to 5 with each breath" },
      { label: "If distracted, gently return", duration: 10, voice: "If your mind wanders, gently return to the breath" },
      { label: "Hold your attention on one point", duration: 12, voice: "Now hold your attention on one point with calm focus" },
    ],
  },
  {
    id: 5,
    title: "Body Scan",
    duration: 12,
    type: "Relaxation",
    color: "#ff6b6b",
    icon: "✨",
    description: "Travel through your body releasing held tension.",
    guide: [
      { label: "Notice your head and face", duration: 10, voice: "Bring awareness to your head and face, and soften them" },
      { label: "Relax your neck and shoulders", duration: 10, voice: "Relax your neck and shoulders" },
      { label: "Release your chest and arms", duration: 10, voice: "Let your chest and arms relax fully" },
      { label: "Soften your stomach and back", duration: 10, voice: "Soften your stomach and lower back" },
      { label: "Relax your legs and feet", duration: 12, voice: "Relax your legs and feet all the way down" },
    ],
  },
  {
    id: 6,
    title: "Gratitude",
    duration: 8,
    type: "Mindfulness",
    color: "#f72585",
    icon: "🙏",
    description: "Cultivate appreciation for the present moment.",
    guide: [
      { label: "Take one slow breath", duration: 8, voice: "Take one slow deep breath" },
      { label: "Think of one good thing today", duration: 10, voice: "Think of one good thing that happened today" },
      { label: "Think of one person you value", duration: 10, voice: "Think of one person you are thankful for" },
      { label: "Feel appreciation in your heart", duration: 10, voice: "Feel appreciation in your heart" },
      { label: "End with a soft smile", duration: 8, voice: "End with a soft smile and gentle breath" },
    ],
  },
];

const STORAGE_KEY = "meditation_stats_v2";

const defaultStats = {
  sessionsDone: 0,
  minutesMeditated: 0,
  currentStreak: 0,
  avgCalmScore: 0,
  totalCalmScore: 0,
  completedSessions: [],
  lastCompletedDate: null,
};

export default function Meditation() {
  const [activeSession, setActiveSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepRemaining, setStepRemaining] = useState(0);
  const [stats, setStats] = useState(defaultStats);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [calmScore, setCalmScore] = useState(4);

  const intervalRef = useRef(null);
  const speechEnabledRef = useRef(true);
  const currentStepElapsedRef = useRef(0);
  const hasSpokenIntroRef = useRef(false);

  const guideSteps = useMemo(() => activeSession?.guide || [], [activeSession]);
  const currentStep = guideSteps[stepIndex] || null;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch {
        setStats(defaultStats);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (activeSession) {
      setTotalTime(activeSession.duration * 60);
      setStepIndex(0);
      setTimer(0);
      setSessionCompleted(false);
      currentStepElapsedRef.current = 0;
      setStepRemaining(activeSession.guide[0]?.duration || 0);
      hasSpokenIntroRef.current = false;
    }
  }, [activeSession]);

  useEffect(() => {
    if (!isPlaying || !activeSession || !currentStep) {
      clearInterval(intervalRef.current);
      return;
    }

    if (!hasSpokenIntroRef.current) {
      speakText(`Starting ${activeSession.title}. ${currentStep.voice || currentStep.label}`);
      hasSpokenIntroRef.current = true;
    }

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        const nextTime = prev + 1;
        if (nextTime >= totalTime) {
          clearInterval(intervalRef.current);
          finishSession();
          return totalTime;
        }
        return nextTime;
      });

      currentStepElapsedRef.current += 1;
      const remaining = Math.max(0, currentStep.duration - currentStepElapsedRef.current);
      setStepRemaining(remaining);

      if (currentStepElapsedRef.current >= currentStep.duration) {
        currentStepElapsedRef.current = 0;

        setStepIndex((prev) => {
          const next = (prev + 1) % guideSteps.length;
          const nextStep = guideSteps[next];
          setStepRemaining(nextStep.duration);
          speakText(nextStep.voice || nextStep.label);
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, activeSession, currentStep, guideSteps, totalTime]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      stopSpeech();
    };
  }, []);

  const speakText = (text) => {
    if (!speechEnabledRef.current || !window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleStartSession = (session) => {
    setActiveSession(session);
    setIsPlaying(false);
    setCalmScore(4);
    stopSpeech();
  };

  const startMeditation = () => {
    setIsPlaying(true);
    if (currentStep) {
      speakText(currentStep.voice || currentStep.label);
    }
  };

  const pauseMeditation = () => {
    setIsPlaying(false);
    stopSpeech();
  };

  const resetMeditation = () => {
    clearInterval(intervalRef.current);
    stopSpeech();
    setIsPlaying(false);
    setTimer(0);
    setStepIndex(0);
    currentStepElapsedRef.current = 0;
    setStepRemaining(guideSteps[0]?.duration || 0);
    setSessionCompleted(false);
    hasSpokenIntroRef.current = false;
  };

  const finishSession = () => {
    setIsPlaying(false);
    setSessionCompleted(true);
    stopSpeech();
    speakText("Session complete. Take a deep breath and notice how you feel.");

    const today = new Date();
    const todayStr = today.toDateString();

    let newStreak = 1;
    if (stats.lastCompletedDate) {
      const lastDate = new Date(stats.lastCompletedDate);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (lastDate.toDateString() === todayStr) {
        newStreak = stats.currentStreak;
      } else if (diffDays === 1) {
        newStreak = stats.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    }

    const totalSessions = stats.sessionsDone + 1;
    const totalCalm = stats.totalCalmScore + calmScore;

    setStats((prev) => ({
      ...prev,
      sessionsDone: prev.sessionsDone + 1,
      minutesMeditated: prev.minutesMeditated + activeSession.duration,
      currentStreak: newStreak,
      totalCalmScore: totalCalm,
      avgCalmScore: (totalCalm / totalSessions).toFixed(1),
      completedSessions: [
        {
          id: activeSession.id,
          title: activeSession.title,
          type: activeSession.type,
          duration: activeSession.duration,
          calmScore,
          completedAt: new Date().toISOString(),
        },
        ...prev.completedSessions,
      ].slice(0, 10),
      lastCompletedDate: new Date().toISOString(),
    }));
  };

  const goBack = () => {
    clearInterval(intervalRef.current);
    stopSpeech();
    setIsPlaying(false);
    setActiveSession(null);
    setSessionCompleted(false);
    setTimer(0);
    setStepIndex(0);
    currentStepElapsedRef.current = 0;
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const progress = totalTime > 0 ? Math.min((timer / totalTime) * 100, 100) : 0;

  const getVisualScale = () => {
    if (!activeSession || !currentStep) return 1;

    if (activeSession.type === "Breathwork") return currentStep.scale || 1.2;
    if (activeSession.type === "Sleep") return 1.08;
    if (activeSession.type === "Guided") return 1.12;
    if (activeSession.type === "Concentration") return 1.05;
    if (activeSession.type === "Relaxation") return 1.1;
    if (activeSession.type === "Mindfulness") return 1.07;

    return 1.1;
  };

  const orbScale = isPlaying ? getVisualScale() : 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-label">Wellness Module</div>
        <h1 className="page-title">Meditation</h1>
        <p className="page-subtitle">
          Real guided meditation with voice instructions, different session flows, and saved progress
        </p>
      </div>

      {!activeSession ? (
        <>
          <div className="grid-4" style={{ marginBottom: 28 }}>
            {[
              { label: "Sessions done", value: stats.sessionsDone, icon: "🧘" },
              { label: "Minutes meditated", value: stats.minutesMeditated, icon: "⏱" },
              { label: "Current streak", value: stats.currentStreak, icon: "🔥" },
              { label: "Avg. calm score", value: stats.avgCalmScore || 0, icon: "💚" },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>{item.icon}</div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#4cc9f0",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {item.value}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#8892b0", marginTop: 4 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="section-label">Choose a session</div>
          <div className="grid-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="card"
                style={{ cursor: "pointer", border: `1px solid ${s.color}20` }}
                onClick={() => handleStartSession(s)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: "2rem" }}>{s.icon}</div>
                  <div
                    className="badge"
                    style={{
                      background: `${s.color}15`,
                      color: s.color,
                      border: `1px solid ${s.color}30`,
                      fontSize: "0.72rem",
                    }}
                  >
                    {s.type}
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#e8eaf6",
                    marginBottom: 6,
                  }}
                >
                  {s.title}
                </h3>

                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#8892b0",
                    lineHeight: 1.5,
                    marginBottom: 16,
                  }}
                >
                  {s.description}
                </p>

                <div
                  style={{
                    background: "#111827",
                    borderRadius: 14,
                    padding: 12,
                    marginBottom: 14,
                    fontSize: "0.76rem",
                    color: "#cbd5e1",
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: s.color }}>How it works:</strong>{" "}
                  {s.guide[0]?.label}, then step-by-step voice guidance continues during the session.
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", color: s.color, fontWeight: 600 }}>
                    ⏱ {s.duration} min
                  </span>
                  <button
                    className="btn-primary"
                    style={{
                      padding: "7px 18px",
                      fontSize: "0.8rem",
                      background: `linear-gradient(135deg, ${s.color}, ${s.color}88)`,
                    }}
                  >
                    Begin
                  </button>
                </div>
              </div>
            ))}
          </div>

          {stats.completedSessions.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <div className="section-label">Recent sessions</div>
              <div className="grid-3">
                {stats.completedSessions.slice(0, 3).map((item, index) => (
                  <div key={index} className="card">
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#e8eaf6", marginBottom: 6 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#8892b0", marginBottom: 4 }}>
                      Type: {item.type}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#8892b0", marginBottom: 4 }}>
                      Duration: {item.duration} min
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#8892b0" }}>
                      Calm Score: {item.calmScore}/5
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <button className="btn-ghost" onClick={goBack} style={{ marginBottom: 24 }}>
            ← Back to Sessions
          </button>

          <div className="card" style={{ textAlign: "center", padding: "48px 32px", marginBottom: 20 }}>
            <div style={{ fontSize: "1rem", color: "#8892b0", marginBottom: 4 }}>
              {activeSession.icon} {activeSession.title}
            </div>

            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.6rem",
                color: "#e8eaf6",
                marginBottom: 10,
              }}
            >
              {currentStep?.label}
            </h2>

            <p style={{ color: activeSession.color, fontWeight: 600, marginBottom: 26 }}>
              {activeSession.type} Meditation
            </p>

            <div
              style={{
                background: "#111827",
                borderRadius: 16,
                padding: 14,
                marginBottom: 28,
                fontSize: "0.9rem",
                color: "#cbd5e1",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: activeSession.color }}>Instruction:</strong>{" "}
              {currentStep?.voice || currentStep?.label}
            </div>

            <div
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 40,
              }}
            >
              {[1.8, 1.5, 1.2].map((scale, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    border: `1px solid ${activeSession.color}${15 - i * 4}`,
                    transform: `scale(${isPlaying ? scale * (orbScale * 0.72) : scale})`,
                    transition: "transform 1s ease-in-out",
                  }}
                />
              ))}

              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${activeSession.color}40, ${activeSession.color}15)`,
                  border: `2px solid ${activeSession.color}60`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  transform: `scale(${orbScale})`,
                  transition: "transform 1s ease-in-out",
                  boxShadow: isPlaying ? `0 0 50px ${activeSession.color}40` : "none",
                }}
              >
                <div style={{ fontSize: "2rem" }}>{activeSession.icon}</div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: activeSession.color,
                    fontFamily: "'Playfair Display', serif",
                    marginTop: 4,
                  }}
                >
                  {stepRemaining}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#dbeafe", marginTop: 6 }}>
                  Step timer
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.78rem",
                  color: "#8892b0",
                  marginBottom: 8,
                }}
              >
                <span>Elapsed: {formatTime(timer)}</span>
                <span>Remaining: {formatTime(Math.max(0, totalTime - timer))}</span>
              </div>

              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${activeSession.color}, ${activeSession.color}88)`,
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="btn-primary"
                onClick={isPlaying ? pauseMeditation : startMeditation}
                style={{
                  padding: "14px 40px",
                  fontSize: "1rem",
                  background: `linear-gradient(135deg, ${activeSession.color}, ${activeSession.color}aa)`,
                }}
              >
                {isPlaying ? "⏸ Pause" : "▶ Start"}
              </button>

              <button className="btn-ghost" onClick={resetMeditation}>
                ↺ Reset
              </button>

              <button
                className="btn-ghost"
                onClick={() => {
                  speechEnabledRef.current = !speechEnabledRef.current;
                  if (!speechEnabledRef.current) stopSpeech();
                }}
              >
                {speechEnabledRef.current ? "🔊 Voice On" : "🔇 Voice Off"}
              </button>
            </div>

            {sessionCompleted && (
              <div
                style={{
                  marginTop: 24,
                  background: "#0f172a",
                  padding: 18,
                  borderRadius: 16,
                  textAlign: "left",
                }}
              >
                <div style={{ color: "#e8eaf6", fontWeight: 700, marginBottom: 10 }}>
                  Session completed 🎉
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: 10 }}>
                  How calm do you feel now?
                </div>

                <input
                  type="range"
                  min="1"
                  max="5"
                  value={calmScore}
                  onChange={(e) => setCalmScore(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ color: activeSession.color, fontWeight: 700, marginTop: 8 }}>
                  Calm Score: {calmScore}/5
                </div>
              </div>
            )}
          </div>

          <div className="grid-3">
            {[
              { label: "Current step", value: stepIndex + 1 },
              { label: "Meditation type", value: activeSession.type },
              { label: "Session", value: `${activeSession.duration} min` },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: activeSession.color }}>
                  {item.value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#8892b0", marginTop: 4 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#e8eaf6", marginBottom: 12 }}>
              Session steps
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {guideSteps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: index === stepIndex ? `${activeSession.color}18` : "#111827",
                    border: index === stepIndex ? `1px solid ${activeSession.color}55` : "1px solid #1f2937",
                    color: index === stepIndex ? "#ffffff" : "#cbd5e1",
                  }}
                >
                  <strong>Step {index + 1}:</strong> {step.label} ({step.duration}s)
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}