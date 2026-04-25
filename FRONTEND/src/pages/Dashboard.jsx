import { useState, useEffect, useRef } from "react";

const API_BASE_URL = "/api";

const moodEmojis = ["😞", "😔", "😐", "🙂", "😊"];
const moodLabels = ["Very Low", "Low", "Neutral", "Good", "Excellent"];

const moduleMeta = {
  avatar: { label: "AI Companion", icon: "◎", color: "#7c5cfc" },
  meditation: { label: "Meditation", icon: "◯", color: "#4cc9f0" },
  exercise: { label: "Exercise", icon: "◈", color: "#ff6b6b" },
  music: { label: "Music Therapy", icon: "♪", color: "#ffd166" },
  growth: { label: "Mental Growth", icon: "◻", color: "#06d6a0" },
  games: { label: "Mind Games", icon: "◆", color: "#f72585" },
  dashboard: { label: "Dashboard", icon: "⬢", color: "#00d4aa" },
};

const moduleCards = [
  { id: "avatar", desc: "Talk to your empathetic AI friend", gradient: "135deg, #7c5cfc22, #7c5cfc08" },
  { id: "meditation", desc: "Guided breathing & calm", gradient: "135deg, #4cc9f022, #4cc9f008" },
  { id: "exercise", desc: "Yoga & posture correction", gradient: "135deg, #ff6b6b22, #ff6b6b08" },
  { id: "music", desc: "Healing soundscapes", gradient: "135deg, #ffd16622, #ffd16608" },
  { id: "growth", desc: "Books & psychology library", gradient: "135deg, #06d6a022, #06d6a008" },
  { id: "games", desc: "Cognitive exercises & puzzles", gradient: "135deg, #f7258522, #f7258508" },
];

const dayGoals = {
  Sunday: "10 min gratitude + light reflection",
  Monday: "20 min mindfulness",
  Tuesday: "15 min deep breathing",
  Wednesday: "10 min body scan",
  Thursday: "20 min mindfulness",
  Friday: "15 min calm music + journaling",
  Saturday: "20 min relaxation session",
};

export default function Dashboard({ setActivePage }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSubmitted, setMoodSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    stats: { streak: 0, sessions_done: 0, mood_avg: 0, minutes: 0 },
    week_moods: [0, 0, 0, 0, 0, 0, 0],
    week_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    recent_activity: [],
    visits: {},
  });

  const sessionIdRef = useRef(
    localStorage.getItem("wellness_session_id") || `session_${Date.now()}`
  );

  useEffect(() => {
    localStorage.setItem("wellness_session_id", sessionIdRef.current);
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const normalizeDashboardData = (data) => {
    const recent = (data.recent_activity || []).map((item) => {
      const key = String(item.module || item.section || "").toLowerCase().replaceAll(" ", "_");
      const section =
        key.includes("avatar") || key.includes("companion") ? "avatar" :
        key.includes("meditation") ? "meditation" :
        key.includes("exercise") ? "exercise" :
        key.includes("music") ? "music" :
        key.includes("growth") ? "growth" :
        key.includes("games") ? "games" :
        key.includes("dashboard") ? "dashboard" :
        "dashboard";

      const meta = moduleMeta[section] || moduleMeta.dashboard;

      return {
        ...item,
        module: item.module || meta.label,
        icon: item.icon || meta.icon,
        color: item.color || meta.color,
        duration: item.duration || item.event_type || "Opened",
      };
    });

    return {
      stats: {
        streak: Number(data?.stats?.streak || 0),
        sessions_done: Number(data?.stats?.sessions_done || 0),
        mood_avg: Number(data?.stats?.mood_avg || 0),
        minutes: Number(data?.stats?.minutes || 0),
      },
      week_moods: data?.week_moods || [0, 0, 0, 0, 0, 0, 0],
      week_days: data?.week_days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      recent_activity: recent,
      visits: data?.visits || {},
    };
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`);
      if (!res.ok) throw new Error(`Dashboard error: ${res.status}`);
      const data = await res.json();
      setDashboardData(normalizeDashboardData(data));
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  const logActivity = async (
    section,
    eventType = "visit",
    details = "",
    durationSeconds = 0,
    calmScore = null
  ) => {
    try {
      await fetch(`${API_BASE_URL}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          section,
          event_type: eventType,
          details,
          duration_seconds: durationSeconds,
          calm_score: calmScore,
        }),
      });
    } catch (error) {
      console.error("Activity log error:", error);
    }
  };

  useEffect(() => {
    fetchDashboard();
    logActivity("dashboard", "visit", "dashboard_opened");

    const poll = setInterval(fetchDashboard, 3000);
    return () => clearInterval(poll);
  }, []);

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const todayName = currentTime.toLocaleDateString("en-US", { weekday: "long" });
  const todayGoal = dayGoals[todayName] || "20 min mindfulness";

  const handleMoodSubmit = async () => {
    if (selectedMood === null) {
      alert("Please select a mood first.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          mood_value: selectedMood + 1,
          mood_label: moodLabels[selectedMood],
        }),
      });

      if (!res.ok) throw new Error(`Mood error: ${res.status}`);

      setMoodSubmitted(true);
      await fetchDashboard();
    } catch (error) {
      console.error("Mood submit error:", error);
      alert("Mood save failed. Check backend.");
    }
  };

  const handleModuleOpen = async (moduleId) => {
    await logActivity(moduleId, "visit", `${moduleId}_opened`);
    await fetchDashboard();

    if (typeof setActivePage === "function") {
      setActivePage(moduleId);
    } else {
      console.warn("setActivePage is not passed to Dashboard");
    }
  };

  const stats = [
    {
      label: "Streak",
      value: `${dashboardData.stats.streak} day${dashboardData.stats.streak === 1 ? "" : "s"}`,
      icon: "🔥",
      color: "#ff6b6b",
      sub: "Live from database",
    },
    {
      label: "Sessions",
      value: String(dashboardData.stats.sessions_done),
      icon: "🧘",
      color: "#00d4aa",
      sub: "Completed total",
    },
    {
      label: "Mood Avg",
      value: `${Number(dashboardData.stats.mood_avg || 0).toFixed(1)}/5`,
      icon: "💚",
      color: "#7c5cfc",
      sub: "Last 7 days",
    },
    {
      label: "Minutes",
      value: String(dashboardData.stats.minutes || 0),
      icon: "⏱",
      color: "#ffd166",
      sub: "Meditation total",
    },
  ];

  return (
    <div className="page-container" style={{ paddingTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
        <div>
          <div className="section-label">Welcome back</div>
          <h1 className="page-title">{greeting()} ✨</h1>
          <p className="page-subtitle">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            •{" "}
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(0,212,170,0.12), rgba(124,92,252,0.08))",
            border: "1px solid rgba(0,212,170,0.2)",
            borderRadius: 14,
            padding: "12px 20px",
            textAlign: "center",
            minWidth: 250,
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#8892b0", textTransform: "uppercase", letterSpacing: 1 }}>
            Today's Goal • {todayName}
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#00d4aa", marginTop: 4 }}>
            {todayGoal}
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, ((dashboardData.stats.minutes || 0) / 20) * 100)}%` }}
              />
            </div>
            <div style={{ fontSize: "0.72rem", color: "#8892b0", marginTop: 4 }}>
              {dashboardData.stats.minutes || 0} / 20 min
            </div>
          </div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${s.color}22, transparent)`,
              }}
            />
            <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color, fontFamily: "'Playfair Display', serif" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#8892b0", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: "0.72rem", color: "#4a5568", marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, marginBottom: 28 }}>
        <div className="card">
          <div className="section-label">Daily Check-in</div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 20, color: "#e8eaf6" }}>
            How are you feeling today?
          </h3>

          {!moodSubmitted ? (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                {moodEmojis.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedMood(i)}
                    style={{
                      flex: 1,
                      padding: "16px 8px",
                      borderRadius: 12,
                      border: selectedMood === i ? "2px solid #00d4aa" : "1px solid rgba(255,255,255,0.07)",
                      background: selectedMood === i ? "rgba(0,212,170,0.1)" : "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: "1.8rem" }}>{emoji}</span>
                    <span style={{ fontSize: "0.65rem", color: selectedMood === i ? "#00d4aa" : "#4a5568" }}>
                      {moodLabels[i]}
                    </span>
                  </button>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={handleMoodSubmit}
                disabled={selectedMood === null}
                style={{ width: "100%", opacity: selectedMood === null ? 0.6 : 1 }}
              >
                {selectedMood === null ? "Select mood first" : "Log Today's Mood"}
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: 10 }}>{moodEmojis[selectedMood]}</div>
              <div style={{ color: "#00d4aa", fontWeight: 600, fontSize: "1rem" }}>
                Mood logged! Keep going 💪
              </div>
              <div style={{ color: "#8892b0", fontSize: "0.85rem", marginTop: 6 }}>
                You're feeling {moodLabels[selectedMood]}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-label">This Week</div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 20, color: "#e8eaf6" }}>
            Mood Trend
          </h3>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {dashboardData.week_moods.map((mood, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: "100%",
                    height: `${((mood || 0) / 5) * 80}px`,
                    borderRadius: 6,
                    background:
                      i === dashboardData.week_moods.length - 1
                        ? "linear-gradient(180deg, #00d4aa, #7c5cfc)"
                        : "rgba(255,255,255,0.08)",
                    transition: "height 0.5s ease",
                  }}
                />
                <div style={{ fontSize: "0.68rem", color: "#4a5568" }}>
                  {dashboardData.week_days[i]}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <div style={{ fontSize: "0.78rem", color: "#8892b0" }}>
              Weekly avg:{" "}
              <span style={{ color: "#00d4aa", fontWeight: 600 }}>
                {Number(dashboardData.stats.mood_avg || 0).toFixed(1)}/5
              </span>
            </div>
            <div className="badge badge-teal">Live</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="section-label">Wellness Modules</div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16, color: "#e8eaf6" }}>
          Quick Access
        </h3>

        <div className="grid-3">
          {moduleCards.map((m) => {
            const meta = moduleMeta[m.id];
            return (
              <button
                key={m.id}
                onClick={() => handleModuleOpen(m.id)}
                style={{
                  background: `linear-gradient(${m.gradient})`,
                  border: `1px solid ${meta.color}25`,
                  borderRadius: 16,
                  padding: "20px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.25s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: `${meta.color}22`,
                    border: `1px solid ${meta.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    color: meta.color,
                    flexShrink: 0,
                  }}
                >
                  {meta.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e8eaf6" }}>
                    {meta.label}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#8892b0", marginTop: 2 }}>
                    {m.desc}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", color: "#4a5568", fontSize: "1rem" }}>→</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div className="section-label">History</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#e8eaf6" }}>
              Recent Activity
            </h3>
          </div>
          <button className="btn-ghost" style={{ fontSize: "0.8rem", padding: "8px 16px" }} onClick={fetchDashboard}>
            Refresh
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {dashboardData.recent_activity.length > 0 ? (
            dashboardData.recent_activity.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${a.color}18`,
                    border: `1px solid ${a.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: a.color,
                    fontSize: "1rem",
                  }}
                >
                  {a.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 500, color: "#e8eaf6" }}>
                    {a.module}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#4a5568" }}>
                    {a.time}
                  </div>
                </div>
                <div
                  className="badge"
                  style={{
                    background: `${a.color}15`,
                    color: a.color,
                    border: `1px solid ${a.color}25`,
                    fontSize: "0.72rem",
                  }}
                >
                  {a.duration}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "#8892b0", fontSize: "0.9rem" }}>
              No activity yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}