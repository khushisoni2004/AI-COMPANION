import { useState, useRef, useEffect } from "react";

const playlists = [
  { id: "calm", title: "Deep Calm", desc: "Slow ambient music for stress relief", icon: "🌊", color: "#4cc9f0", tag: "relaxing" },
  { id: "sleep", title: "Sleep Stories", desc: "Gentle soundscapes for deep sleep", icon: "🌙", color: "#7c5cfc", tag: "ambient" },
  { id: "focus", title: "Focus Flow", desc: "Binaural beats & concentration music", icon: "🎯", color: "#ffd166", tag: "focus" },
  { id: "nature", title: "Nature Therapy", desc: "Healing sounds from the natural world", icon: "🌿", color: "#06d6a0", tag: "nature" },
];

export default function MusicTherapy() {
  const [activePlaylist, setActivePlaylist] = useState(playlists[0]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [tracks, setTracks] = useState([]);
  const [timerId, setTimerId] = useState(null);
  const [visualizerBars, setVisualizerBars] = useState(Array.from({ length: 32 }, () => 20));

  const audioRef = useRef(new Audio());
  const timerRef = useRef(null);
  const animRef = useRef(null);
  const CLIENT_ID = "f4392db1";

  // Fetch tracks from Jamendo
  useEffect(() => {
    fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=json&limit=50&tags=${activePlaylist.tag}&audioformat=mp32`)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          setTracks(data.results);
          setCurrentTrack(0);
          setProgress(0);
        }
      }).catch(err => console.error("Fetch error:", err));
  }, [activePlaylist]);

  // Load audio src when track changes
  useEffect(() => {
    if (tracks.length > 0 && tracks[currentTrack]) {
      audioRef.current.src = tracks[currentTrack].audio;
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack, tracks]);

  // Play/pause
  useEffect(() => {
    isPlaying ? audioRef.current.play().catch(() => setIsPlaying(false)) : audioRef.current.pause();
  }, [isPlaying]);

  // Volume
  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  // Sleep Timer
  const handleSleepTimer = (value) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (value === "Off") {
      setTimerId(null);
      return;
    }
    setTimerId(value);
    const minutes = parseInt(value);
    const ms = minutes * 60 * 1000;
    timerRef.current = setTimeout(() => {
      setIsPlaying(false);
      audioRef.current.pause();
      setTimerId(null);
      alert(`Sleep timer (${minutes} min) complete. Music stopped.`);
    }, ms);
  };

  // Visualizer + Progress
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setVisualizerBars(prev => prev.map(b => Math.max(8, Math.min(90, b + (Math.random() - 0.5) * 30))));
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);

      const progInterval = setInterval(() => {
        if (audioRef.current.duration) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      }, 1000);

      return () => {
        cancelAnimationFrame(animRef.current);
        clearInterval(progInterval);
      };
    }
  }, [isPlaying]);

  if (!tracks.length) return <div style={{ color: "white", padding: 20 }}>Loading tracks...</div>;

  const track = tracks[currentTrack] || {};

  // Duration seconds → m:ss
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Current time from progress
  const currentSecs = track.duration ? Math.floor((progress / 100) * track.duration) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-label">Wellness Module</div>
        <h1 className="page-title">Music Therapy</h1>
        <p className="page-subtitle">Healing soundscapes, nature audio & sleep playlists for mental wellness</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>

        {/* ── LEFT COLUMN: Player + Sleep Timer ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Now Playing Card */}
          <div className="card" style={{
            textAlign: "center",
            background: `linear-gradient(135deg, ${activePlaylist.color}18, rgba(13,21,38,0.95))`,
            border: `1px solid ${activePlaylist.color}25`,
          }}>
            {/* Album Art */}
            <div style={{
              width: 160, height: 160,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${activePlaylist.color}30, ${activePlaylist.color}10)`,
              border: `3px solid ${activePlaylist.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "4rem",
              margin: "0 auto 20px",
              overflow: "hidden",
              animation: isPlaying ? "spin-slow 8s linear infinite" : "none",
              boxShadow: isPlaying ? `0 0 50px ${activePlaylist.color}30` : "none",
            }}>
              {track.image ? (
                <img src={track.image} alt="Album Art" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                activePlaylist.icon
              )}
            </div>

            {/* Track name & artist */}
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: "#e8eaf6", marginBottom: 4 }}>
              {track.name || "Loading..."}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#8892b0", marginBottom: 16 }}>
              {track.artist_name || "Artist"}
            </div>

            {/* Visualizer */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2, height: 50, marginBottom: 20, padding: "0 8px" }}>
              {visualizerBars.map((h, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: 2,
                  background: isPlaying
                    ? `linear-gradient(180deg, ${activePlaylist.color}, ${activePlaylist.color}44)`
                    : "rgba(255,255,255,0.08)",
                  transition: "height 0.1s ease",
                  maxWidth: 6,
                }} />
              ))}
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: 16, padding: "0 4px" }}>
              <input
                type="range"
                min={0} max={100}
                value={progress}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setProgress(val);
                  if (audioRef.current.duration) {
                    audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
                  }
                }}
                style={{ width: "100%", accentColor: activePlaylist.color, height: 4, cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#4a5568", marginTop: 4 }}>
                <span>{formatDuration(currentSecs)}</span>
                <span>{track.duration ? formatDuration(track.duration) : "0:00"}</span>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 20 }}>
              <button
                onClick={() => setCurrentTrack(t => (t - 1 + tracks.length) % tracks.length)}
                style={{ background: "none", border: "none", color: "#8892b0", fontSize: "1.3rem", cursor: "pointer" }}
              >⏮</button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  width: 54, height: 54,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${activePlaylist.color}, ${activePlaylist.color}88)`,
                  border: "none",
                  color: "#fff",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isPlaying ? `0 0 25px ${activePlaylist.color}50` : "none",
                  transition: "all 0.2s",
                }}
              >{isPlaying ? "⏸" : "▶"}</button>
              <button
                onClick={() => setCurrentTrack(t => (t + 1) % tracks.length)}
                style={{ background: "none", border: "none", color: "#8892b0", fontSize: "1.3rem", cursor: "pointer" }}
              >⏭</button>
            </div>

            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#4a5568", fontSize: "0.9rem" }}>🔈</span>
              <input
                type="range"
                min={0} max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                style={{ flex: 1, accentColor: activePlaylist.color, cursor: "pointer" }}
              />
              <span style={{ color: "#4a5568", fontSize: "0.9rem" }}>🔊</span>
            </div>
          </div>

          {/* ── Sleep Timer — LEFT COLUMN KE NEECHE ── */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "0.75rem", color: "#8892b0", marginBottom: 10 }}>⏰ Sleep Timer</div>

            {/* Row 1: 15 30 45 60 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {["15 min", "30 min", "45 min", "60 min"].map(t => (
                <button
                  key={t}
                  onClick={() => handleSleepTimer(t)}
                  style={{
                    flex: 1,
                    fontSize: "0.75rem",
                    padding: "7px 0",
                    cursor: "pointer",
                    background: timerId === t ? `${activePlaylist.color}30` : "transparent",
                    border: timerId === t ? `1px solid ${activePlaylist.color}` : "1px solid #333",
                    color: timerId === t ? activePlaylist.color : "#8892b0",
                    borderRadius: "6px",
                    transition: "all 0.2s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Row 2: Off button full width */}
            <button
              onClick={() => handleSleepTimer("Off")}
              style={{
                width: "100%",
                fontSize: "0.75rem",
                padding: "7px 0",
                cursor: "pointer",
                background: timerId === null ? "rgba(255,255,255,0.06)" : "transparent",
                border: timerId === null ? "1px solid #555" : "1px solid #333",
                color: "#8892b0",
                borderRadius: "6px",
                transition: "all 0.2s",
              }}
            >
              Off
            </button>

            {/* Active timer indicator */}
            {timerId && (
              <div style={{ marginTop: 10, fontSize: "0.72rem", color: activePlaylist.color, textAlign: "center" }}>
                ✓ Timer active: {timerId}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Playlists + Track List + AI Rec ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Playlist Switcher */}
          <div>
            <div className="section-label">Playlists</div>
            <div className="grid-2" style={{ gap: 12 }}>
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => { setActivePlaylist(pl); setCurrentTrack(0); setIsPlaying(false); setProgress(0); }}
                  style={{
                    background: activePlaylist.id === pl.id
                      ? `linear-gradient(135deg, ${pl.color}22, ${pl.color}08)`
                      : "rgba(255,255,255,0.02)",
                    border: activePlaylist.id === pl.id ? `1.5px solid ${pl.color}50` : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "16px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{pl.icon}</span>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: activePlaylist.id === pl.id ? pl.color : "#e8eaf6" }}>{pl.title}</div>
                    <div style={{ fontSize: "0.72rem", color: "#4a5568" }}>{pl.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Track List */}
          <div className="card">
            <div className="section-label">Tracks — {activePlaylist.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tracks.map((t, i) => (
                <div
                  key={i}
                  onClick={() => { setCurrentTrack(i); setIsPlaying(true); setProgress(0); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 14px",
                    borderRadius: 12,
                    cursor: "pointer",
                    background: i === currentTrack ? `${activePlaylist.color}10` : "rgba(255,255,255,0.02)",
                    border: i === currentTrack ? `1px solid ${activePlaylist.color}30` : "1px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Track Thumbnail */}
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: `${activePlaylist.color}18`,
                    border: `1px solid ${activePlaylist.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {i === currentTrack && isPlaying ? (
                      <span style={{ fontSize: "1rem", color: activePlaylist.color }}>▶</span>
                    ) : (
                      <img
                        src={t.image}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    )}
                  </div>

                  {/* Name + Artist */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.88rem",
                      fontWeight: i === currentTrack ? 600 : 400,
                      color: i === currentTrack ? activePlaylist.color : "#e8eaf6",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#4a5568" }}>{t.artist_name}</div>
                  </div>

                  {/* Duration */}
                  <div style={{ fontSize: "0.78rem", color: "#4a5568", flexShrink: 0 }}>
                    {formatDuration(t.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="card" style={{ background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(124,92,252,0.08))", border: "1px solid rgba(0,212,170,0.15)" }}>
            <div className="section-label">AI Recommendation</div>
            <p style={{ fontSize: "0.88rem", color: "#8892b0", lineHeight: 1.6 }}>
              Based on your evening mood check-in, <span style={{ color: "#00d4aa" }}>Deep Calm</span> is recommended. Ocean sounds activate the parasympathetic nervous system, reducing cortisol within 15 minutes of listening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
