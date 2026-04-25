import { useState, useEffect } from "react";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AvatarCompanion from "./pages/AvatarCompanion";
import Meditation from "./pages/Meditation";
import Exercise from "./pages/Exercise";
import MusicTherapy from "./pages/MusicTherapy";
import MentalGrowth from "./pages/MentalGrowth";
import MindGames from "./pages/MindGames";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("aurora_token")
  );

  const [activePage, setActivePage] = useState("dashboard");
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPrompt || null);

  useEffect(() => {
    // If it already fired before React mounted
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      window.deferredPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Automatic install is blocked by your browser.\n\nTo install manually:\n1. Look for the 'Install' or '+' icon in your URL address bar.\n2. Or open your browser menu (⋮) and click 'Install MindAura'.");
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      window.deferredPrompt = null;
    }
  };

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("aurora_token");
    localStorage.removeItem("aurora_user");
    localStorage.removeItem("wellness_session_id");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard setActivePage={setActivePage} />;

      case "avatar":
        return <AvatarCompanion />;

      case "meditation":
        return <Meditation />;

      case "exercise":
        return <Exercise />;

      case "music":
        return <MusicTherapy />;

      case "growth":
        return <MentalGrowth />;

      case "games":
        return <MindGames />;

      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div>
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: 230,
          background: "#08101f",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: 20,
          zIndex: 10,
        }}
      >
        <h2 style={{ color: "#e8eaf6", marginBottom: 24 }}>Aurora</h2>

        {[
          ["dashboard", "Dashboard"],
          ["avatar", "AI Companion"],
          ["meditation", "Meditation"],
          ["exercise", "Exercise"],
          ["music", "Music Therapy"],
          ["growth", "Mental Growth"],
          ["games", "Mind Games"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActivePage(id)}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: 8,
              borderRadius: 10,
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              color: activePage === id ? "#00d4aa" : "#8892b0",
              background:
                activePage === id
                  ? "rgba(0,212,170,0.12)"
                  : "transparent",
            }}
          >
            {label}
          </button>
        ))}

          <button
            onClick={handleInstallClick}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginTop: 20,
              borderRadius: 10,
              border: "1px solid rgba(0, 212, 170, 0.4)",
              background: "rgba(0, 212, 170, 0.1)",
              color: "#00d4aa",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Install App
          </button>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "12px 14px",
            marginTop: 20,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "#ff6b6b",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <main
        style={{
          marginLeft: 230,
          minHeight: "100vh",
          background: "#0a0f1e",
          color: "#e8eaf6",
          padding: 24,
        }}
      >
        {renderPage()}
      </main>
    </div>
  );
}