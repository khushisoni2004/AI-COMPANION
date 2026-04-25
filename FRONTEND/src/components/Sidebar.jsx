import { useState } from "react";

const navItems = [
  { id: "dashboard", icon: "⬡", label: "Dashboard", color: "#00d4aa" },
  { id: "avatar", icon: "◎", label: "AI Companion", color: "#7c5cfc" },
  { id: "meditation", icon: "◯", label: "Meditation", color: "#4cc9f0" },
  { id: "exercise", icon: "◈", label: "Exercise", color: "#ff6b6b" },
  { id: "music", icon: "♪", label: "Music Therapy", color: "#ffd166" },
  { id: "growth", icon: "◻", label: "Mental Growth", color: "#06d6a0" },
  { id: "games", icon: "◆", label: "Mind Games", color: "#f72585" },
];

export default function Sidebar({ activePage, setActivePage, isOpen, toggleSidebar }) {
  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: isOpen ? "260px" : "72px",
        background: "linear-gradient(180deg, #0d1526 0%, #0a0f1e 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div style={{
        padding: isOpen ? "28px 24px 24px" : "28px 16px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: 10,
          background: "linear-gradient(135deg, #00d4aa, #7c5cfc)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
          boxShadow: "0 0 20px rgba(0,212,170,0.35)",
        }}>🧠</div>
        {isOpen && (
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#e8eaf6" }}>MindAura</div>
            <div style={{ fontSize: "0.68rem", color: "#4a5568", letterSpacing: 1, textTransform: "uppercase" }}>Wellness AI</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {isOpen && (
          <div style={{ fontSize: "0.65rem", color: "#4a5568", letterSpacing: "2px", textTransform: "uppercase", padding: "8px 8px 4px", fontWeight: 600 }}>
            Navigation
          </div>
        )}
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: isOpen ? "11px 14px" : "11px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: isActive
                  ? `linear-gradient(135deg, ${item.color}22, ${item.color}11)`
                  : "transparent",
                borderLeft: isActive ? `3px solid ${item.color}` : "3px solid transparent",
                justifyContent: isOpen ? "flex-start" : "center",
                position: "relative",
              }}
            >
              <span style={{
                fontSize: "1.2rem",
                color: isActive ? item.color : "#4a5568",
                transition: "color 0.2s",
                flexShrink: 0,
              }}>{item.icon}</span>
              {isOpen && (
                <span style={{
                  fontSize: "0.88rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? item.color : "#8892b0",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}>{item.label}</span>
              )}
              {isActive && isOpen && (
                <div style={{
                  marginLeft: "auto",
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}`,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom user */}
      <div style={{
        padding: isOpen ? "16px 20px" : "16px 12px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c5cfc, #00d4aa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.9rem",
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
        }}>A</div>
        {isOpen && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: "0.85rem", color: "#e8eaf6", fontWeight: 500 }}></div>
            <div style={{ fontSize: "0.72rem", color: "#4a5568" }}>Free Plan</div>
          </div>
        )}
        {isOpen && (
          <button
            onClick={toggleSidebar}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#4a5568",
              width: 28, height: 28,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "0.8rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
          >◁</button>
        )}
        {!isOpen && (
          <button
            onClick={toggleSidebar}
            style={{
              background: "transparent",
              border: "none",
              color: "#4a5568",
              cursor: "pointer",
              fontSize: "1rem",
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >▷</button>
        )}
      </div>
    </aside>
  );
}
