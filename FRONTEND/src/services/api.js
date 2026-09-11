export const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

class APIService {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  getOrCreateSessionId() {
    let sessionId = localStorage.getItem("mindcare_session_id");

    if (!sessionId) {
      sessionId = `mindcare_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem("mindcare_session_id", sessionId);
    }

    return sessionId;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Request failed: ${endpoint}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async checkHealth() {
    return this.request("/health");
  }

  async sendMessage(message) {
    return this.request("/chat", {
      method: "POST",
      body: JSON.stringify({
        session_id: this.sessionId,
        message,
      }),
    });
  }

  async logMood(moodValue, moodLabel) {
    return this.request("/mood", {
      method: "POST",
      body: JSON.stringify({
        session_id: this.sessionId,
        mood_value: Number(moodValue),
        mood_label: moodLabel,
      }),
    });
  }

  async logEvent(eventType, section, details = "", durationSeconds = 0) {
    return this.request("/event", {
      method: "POST",
      body: JSON.stringify({
        session_id: this.sessionId,
        event_type: eventType,
        section,
        details,
        duration_seconds: Number(durationSeconds),
      }),
    });
  }

  async logMeditation(durationSeconds, meditationType, calmScore = null) {
    return this.request("/meditation", {
      method: "POST",
      body: JSON.stringify({
        session_id: this.sessionId,
        duration_seconds: Number(durationSeconds),
        meditation_type: meditationType,
        calm_score: calmScore,
      }),
    });
  }

  async logExercise(exerciseType, durationSeconds, intensity = "moderate") {
    return this.request("/exercise", {
      method: "POST",
      body: JSON.stringify({
        session_id: this.sessionId,
        exercise_type: exerciseType,
        duration_seconds: Number(durationSeconds),
        intensity,
      }),
    });
  }

  async getStats() {
    return this.request("/stats");
  }

  async getHistory() {
    return this.request(`/session/${this.sessionId}/history`);
  }

  async getAllData() {
    return this.request("/all-data");
  }
}

export default new APIService();
