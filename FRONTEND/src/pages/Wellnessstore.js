// ─── Wellness Store — real-time session tracking with persistent storage ───
// All data is saved to window.storage and updated live.

const MODULE_META = {
  avatar:    { label: "AI Companion",   icon: "◎", color: "#7c5cfc" },
  meditation:{ label: "Meditation",     icon: "◯", color: "#4cc9f0" },
  exercise:  { label: "Exercise",       icon: "◈", color: "#ff6b6b" },
  music:     { label: "Music Therapy",  icon: "♪", color: "#ffd166" },
  growth:    { label: "Mental Growth",  icon: "◻", color: "#06d6a0" },
  games:     { label: "Mind Games",     icon: "◆", color: "#f72585" },
};

// ── helpers ────────────────────────────────────────────────────────────────

function todayKey() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function weekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  return d.toISOString().slice(0, 10);
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)} days ago`;
}

// ── Session tracking ───────────────────────────────────────────────────────

export async function startSession(moduleId) {
  const session = {
    id: `${moduleId}_${Date.now()}`,
    moduleId,
    startTime: new Date().toISOString(),
    endTime: null,
    durationMinutes: 0,
  };
  await window.storage.set(`session:active:${moduleId}`, JSON.stringify(session));
  return session;
}

export async function endSession(moduleId) {
  try {
    const raw = await window.storage.get(`session:active:${moduleId}`);
    if (!raw) return;
    const session = JSON.parse(raw.value);
    session.endTime = new Date().toISOString();
    session.durationMinutes = Math.max(
      1,
      Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000)
    );

    // Save to history
    const histKey = `history:${todayKey()}:${session.id}`;
    await window.storage.set(histKey, JSON.stringify(session));

    // Remove active
    await window.storage.delete(`session:active:${moduleId}`);

    // Update streak + stats
    await updateStats(session);
    return session;
  } catch (e) {
    console.error("endSession error", e);
  }
}

// ── Stats aggregation ──────────────────────────────────────────────────────

async function updateStats(completedSession) {
  try {
    let statsRaw;
    try { statsRaw = await window.storage.get("stats:global"); } catch {}
    const stats = statsRaw ? JSON.parse(statsRaw.value) : {
      totalSessions: 0,
      totalMinutes: 0,
      streakDays: 0,
      lastActiveDate: null,
      sessionsByDay: {},
    };

    const today = todayKey();
    stats.totalSessions += 1;
    stats.totalMinutes += completedSession.durationMinutes;
    stats.sessionsByDay[today] = (stats.sessionsByDay[today] || 0) + 1;

    // Streak logic
    if (stats.lastActiveDate === null) {
      stats.streakDays = 1;
    } else {
      const last = new Date(stats.lastActiveDate);
      const now = new Date(today);
      const dayDiff = Math.round((now - last) / 86400000);
      if (dayDiff === 1) stats.streakDays += 1;
      else if (dayDiff > 1) stats.streakDays = 1;
      // same day: no change
    }
    stats.lastActiveDate = today;

    await window.storage.set("stats:global", JSON.stringify(stats));
  } catch (e) {
    console.error("updateStats error", e);
  }
}

// ── Mood logging ───────────────────────────────────────────────────────────

export async function logMood(moodValue) {
  // moodValue: 1–5
  const entry = { value: moodValue, time: new Date().toISOString() };
  await window.storage.set(`mood:${todayKey()}`, JSON.stringify(entry));
}

export async function getTodayMood() {
  try {
    const raw = await window.storage.get(`mood:${todayKey()}`);
    return raw ? JSON.parse(raw.value) : null;
  } catch { return null; }
}

// ── Dashboard data loader ──────────────────────────────────────────────────

export async function loadDashboardData() {
  // 1. Global stats
  let stats = null;
  try {
    const raw = await window.storage.get("stats:global");
    if (raw) stats = JSON.parse(raw.value);
  } catch {}

  // 2. Weekly minutes (sum sessions this week)
  let weekMinutes = 0;
  let weekMoods = Array(7).fill(0);
  const wk = weekKey();

  try {
    const keys = await window.storage.list("history:");
    for (const key of keys.keys) {
      const raw = await window.storage.get(key);
      if (!raw) continue;
      const session = JSON.parse(raw.value);
      const sessionDate = session.endTime?.slice(0, 10);
      if (!sessionDate) continue;

      // Week minutes
      if (sessionDate >= wk) {
        weekMinutes += session.durationMinutes || 0;
      }
    }

    // Week moods
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - today.getDay() + 1 + i); // Mon=0
      const dk = d.toISOString().slice(0, 10);
      try {
        const mRaw = await window.storage.get(`mood:${dk}`);
        if (mRaw) weekMoods[i] = JSON.parse(mRaw.value).value;
      } catch {}
    }
  } catch {}

  // 3. Recent activity (last 10 completed sessions)
  let recentActivity = [];
  try {
    const keys = await window.storage.list("history:");
    const allSessions = [];
    for (const key of keys.keys) {
      try {
        const raw = await window.storage.get(key);
        if (raw) allSessions.push(JSON.parse(raw.value));
      } catch {}
    }
    allSessions.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    recentActivity = allSessions.slice(0, 10).map(s => {
      const meta = MODULE_META[s.moduleId] || { label: s.moduleId, icon: "◎", color: "#8892b0" };
      return {
        module: meta.label,
        icon: meta.icon,
        color: meta.color,
        time: timeAgo(s.endTime),
        duration: `${s.durationMinutes} min`,
      };
    });
  } catch {}

  // 4. This month session count
  const thisMonth = todayKey().slice(0, 7); // "YYYY-MM"
  let sessionsThisMonth = 0;
  if (stats?.sessionsByDay) {
    for (const [day, count] of Object.entries(stats.sessionsByDay)) {
      if (day.startsWith(thisMonth)) sessionsThisMonth += count;
    }
  }

  // 5. Mood avg last 7 days
  let moodAvg = null;
  const moodValues = weekMoods.filter(v => v > 0);
  if (moodValues.length > 0) {
    moodAvg = (moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(1);
  }

  // 6. Today's goal progress (sum today's session minutes)
  let todayMinutes = 0;
  try {
    const keys = await window.storage.list(`history:${todayKey()}`);
    for (const key of keys.keys) {
      try {
        const raw = await window.storage.get(key);
        if (raw) todayMinutes += JSON.parse(raw.value).durationMinutes || 0;
      } catch {}
    }
  } catch {}

  return {
    stats: {
      streakDays: stats?.streakDays ?? 0,
      sessionsThisMonth,
      moodAvg: moodAvg ?? "—",
      minutesThisWeek: weekMinutes,
    },
    weekMoods,
    recentActivity,
    goalProgress: { done: todayMinutes, total: 20 },
  };
}