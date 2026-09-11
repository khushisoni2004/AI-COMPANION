import { lazy, Suspense, useState } from "react";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";

const AvatarCompanion = lazy(() => import("./pages/AvatarCompanion"));
const Meditation = lazy(() => import("./pages/Meditation"));
const Exercise = lazy(() => import("./pages/Exercise"));
const MusicTherapy = lazy(() => import("./pages/MusicTherapy"));
const MentalGrowth = lazy(() => import("./pages/MentalGrowth"));
const MindGames = lazy(() => import("./pages/MindGames"));

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("aurora_token")
  );

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 760);


  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("aurora_token");
    localStorage.removeItem("aurora_user");
    localStorage.removeItem("wellness_session_id");
    localStorage.removeItem("aurora_session_id");
    localStorage.removeItem("mindcare_session_id");
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

  const navigate = (page) => {
    setActivePage(page);
    if (window.innerWidth <= 760) setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={navigate} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(open => !open)} onLogout={handleLogout} />
      <button className="mobile-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">☰ <span>MindAura</span></button>
      <main className={`app-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Suspense fallback={<div style={{ padding: 24, color: "#8892b0" }}>Loading…</div>}>
          {renderPage()}
        </Suspense>
      </main>
    </div>
  );
}
