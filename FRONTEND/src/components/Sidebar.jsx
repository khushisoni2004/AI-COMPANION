const navItems = [
  { id: "dashboard", icon: "⌂", label: "Overview", color: "#5eead4" },
  { id: "avatar", icon: "✦", label: "AI Companion", color: "#a78bfa" },
  { id: "meditation", icon: "◌", label: "Meditation", color: "#38bdf8" },
  { id: "exercise", icon: "◇", label: "Move & Yoga", color: "#fb7185" },
  { id: "music", icon: "♫", label: "Sound Therapy", color: "#fbbf24" },
  { id: "growth", icon: "▤", label: "Growth Library", color: "#34d399" },
  { id: "games", icon: "◆", label: "Mind Games", color: "#f472b6" },
];

export default function Sidebar({ activePage, onNavigate, isOpen, onToggle, onLogout }) {
  let user = {};
  try { user = JSON.parse(localStorage.getItem("aurora_user") || "{}"); } catch { user = {}; }
  const displayName = user.name || "Aurora Member";
  const initials = displayName.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      {isOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onToggle} />}
      <aside className={`app-sidebar ${isOpen ? "is-open" : "is-closed"}`}>
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span>✦</span></div>
          <div className="brand-copy">
            <strong>MindAura</strong>
            <span>Care for your inner world</span>
          </div>
        </div>

        <div className="nav-caption">Your wellness space</div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navItems.map(item => (
            <button
              key={item.id}
              className={activePage === item.id ? "active" : ""}
              onClick={() => onNavigate(item.id)}
              aria-current={activePage === item.id ? "page" : undefined}
              title={!isOpen ? item.label : undefined}
              style={{ "--item-color": item.color }}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-dot" />
            </button>
          ))}
        </nav>

        <div className="sidebar-wellness-note">
          <span>Daily reminder</span>
          <strong>Small steps still move you forward.</strong>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">{initials || "A"}</div>
          <div className="profile-copy"><strong>{displayName}</strong><span>{user.email || "Your private space"}</span></div>
          <button className="logout-button" onClick={onLogout} aria-label="Log out" title="Log out">↗</button>
        </div>
        <button className="sidebar-toggle" onClick={onToggle} aria-label={isOpen ? "Collapse navigation" : "Expand navigation"}>
          {isOpen ? "‹" : "›"}
        </button>
      </aside>
    </>
  );
}
