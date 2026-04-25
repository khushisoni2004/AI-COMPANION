// ============================================================
// Auth.jsx — Complete Registration & Login System
// Matches your existing dark dashboard aesthetic exactly
//


import { useState, useEffect, useRef } from "react";
const API_BASE_URL = "/api";

// ── Particle background (matches your app aesthetic) ─────────────────────────
function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 1.5 + 0.5,
      dx:   (Math.random() - 0.5) * 0.4,
      dy:   (Math.random() - 0.5) * 0.4,
      o:    Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? "#00d4aa" : "#7c5cfc",
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.o * 255).toString(16).padStart(2, "0");
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none"
    }} />
  );
}

// ── Input field component ─────────────────────────────────────────────────────
function Field({ label, type, value, onChange, placeholder, error, icon }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: "0.78rem", fontWeight: 600,
        color: "#8892b0", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em"
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: "1rem", color: "#4a5568", pointerEvents: "none"
          }}>{icon}</span>
        )}
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={isPassword ? "new-password" : "off"}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${error ? "#ff6b6b55" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 10,
            padding: icon ? "12px 44px 12px 44px" : "12px 14px",
            color: "#e8eaf6",
            fontSize: "0.92rem",
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#00d4aa55"}
          onBlur={e => e.target.style.borderColor = error ? "#ff6b6b55" : "rgba(255,255,255,0.1)"}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "#4a5568", fontSize: "0.85rem", padding: 0
            }}
          >
            {show ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {error && (
        <div style={{ color: "#ff6b6b", fontSize: "0.74rem", marginTop: 4 }}>⚠ {error}</div>
      )}
    </div>
  );
}

// ── Password strength indicator ───────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["#ff6b6b", "#ff6b6b", "#ffd166", "#00d4aa", "#00d4aa"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? colors[score] : "rgba(255,255,255,0.08)",
            transition: "background 0.3s"
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {checks.map(c => (
            <span key={c.label} style={{
              fontSize: "0.68rem",
              color: c.ok ? "#00d4aa" : "#4a5568",
              transition: "color 0.2s"
            }}>
              {c.ok ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span style={{ fontSize: "0.72rem", color: colors[score], fontWeight: 600 }}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Auth Component ───────────────────────────────────────────────────────
export default function Auth({ onAuthSuccess }) {
  const [mode,     setMode]     = useState("login");    // "login" | "register" | "forgot"
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState(null);       // { type: "success"|"error", text }
  const [animated, setAnimated] = useState(false);

  // Login fields
  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors,   setLoginErrors]   = useState({});

  // Register fields
  const [regName,      setRegName]      = useState("");
  const [regEmail,     setRegEmail]     = useState("");
  const [regPassword,  setRegPassword]  = useState("");
  const [regConfirm,   setRegConfirm]   = useState("");
  const [regAge,       setRegAge]       = useState("");
  const [regErrors,    setRegErrors]    = useState({});

  // Forgot password
  const [forgotEmail,  setForgotEmail]  = useState("");

  useEffect(() => {
    setTimeout(() => setAnimated(true), 50);
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateLogin = () => {
    const errs = {};
    if (!loginEmail)                    errs.email    = "Email is required";
    else if (!validateEmail(loginEmail)) errs.email   = "Enter a valid email";
    if (!loginPassword)                 errs.password = "Password is required";
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegister = () => {
    const errs = {};
    if (!regName.trim())                          errs.name     = "Full name is required";
    else if (regName.trim().length < 2)           errs.name     = "Name must be at least 2 characters";
    if (!regEmail)                                errs.email    = "Email is required";
    else if (!validateEmail(regEmail))            errs.email    = "Enter a valid email";
    if (!regPassword)                             errs.password = "Password is required";
    else if (regPassword.length < 8)              errs.password = "Minimum 8 characters";
    if (!regConfirm)                              errs.confirm  = "Please confirm your password";
    else if (regConfirm !== regPassword)          errs.confirm  = "Passwords do not match";
    if (regAge && (isNaN(regAge) || Number(regAge) < 13 || Number(regAge) > 120))
                                                  errs.age      = "Enter a valid age (13-120)";
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── API Calls ───────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.detail || "Invalid email or password" });
        return;
      }

      // Save token and user info to localStorage
      localStorage.setItem("aurora_token",   data.access_token);
      localStorage.setItem("aurora_user",    JSON.stringify({ name: data.name, email: loginEmail }));
      localStorage.setItem("wellness_session_id", `session_${Date.now()}`);

      setMessage({ type: "success", text: `Welcome back, ${data.name}!` });
      setTimeout(() => onAuthSuccess(data), 800);

    } catch (err) {
      setMessage({ type: "error", text: "Cannot connect to server. Make sure the backend is running." });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     regName.trim(),
          email:    regEmail.trim().toLowerCase(),
          password: regPassword,
          age:      regAge ? Number(regAge) : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.detail || "Registration failed" });
        return;
      }

      localStorage.setItem("aurora_token",         data.access_token);
      localStorage.setItem("aurora_user",          JSON.stringify({ name: data.name, email: regEmail }));
      localStorage.setItem("wellness_session_id",  `session_${Date.now()}`);

      setMessage({ type: "success", text: `Account created! Welcome, ${data.name}!` });
      setTimeout(() => onAuthSuccess(data), 800);

    } catch (err) {
      setMessage({ type: "error", text: "Cannot connect to server. Make sure the backend is running." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !validateEmail(forgotEmail)) {
      setMessage({ type: "error", text: "Enter a valid email address" });
      return;
    }
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      setMessage({ type: "success", text: "If this email exists, a reset link has been sent." });
    } catch {
      setMessage({ type: "success", text: "If this email exists, a reset link has been sent." });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessage(null);
    setLoginErrors({});
    setRegErrors({});
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const S = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a0f1e 100%)",
      position: "relative",
      padding: "20px",
    },
    card: {
      position: "relative",
      zIndex: 1,
      width: "100%",
      maxWidth: 460,
      background: "rgba(19,29,53,0.92)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 24,
      padding: "40px 36px",
      backdropFilter: "blur(20px)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,170,0.06)",
      opacity: animated ? 1 : 0,
      transform: animated ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    },
    logo: {
      textAlign: "center",
      marginBottom: 28,
    },
    logoIcon: {
      width: 56, height: 56,
      background: "linear-gradient(135deg, #00d4aa22, #7c5cfc22)",
      border: "1px solid rgba(0,212,170,0.25)",
      borderRadius: 16,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "1.6rem",
      margin: "0 auto 12px",
      animation: "pulse-glow 3s ease infinite",
    },
    logoName: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "1.6rem",
      color: "#e8eaf6",
      letterSpacing: "0.05em",
    },
    logoSub: {
      fontSize: "0.78rem",
      color: "#4a5568",
      marginTop: 3,
    },
    tabs: {
      display: "flex",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12,
      padding: 3,
      marginBottom: 28,
    },
    tab: (active) => ({
      flex: 1,
      padding: "9px 0",
      borderRadius: 9,
      border: "none",
      background: active ? "linear-gradient(135deg, rgba(0,212,170,0.18), rgba(124,92,252,0.12))" : "transparent",
      color: active ? "#00d4aa" : "#4a5568",
      fontSize: "0.85rem",
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      transition: "all 0.2s",
      fontFamily: "'DM Sans', sans-serif",
      borderBottom: active ? "1px solid rgba(0,212,170,0.3)" : "1px solid transparent",
    }),
    submitBtn: {
      width: "100%",
      padding: "13px 0",
      borderRadius: 12,
      border: "none",
      background: loading
        ? "rgba(0,212,170,0.3)"
        : "linear-gradient(135deg, #00d4aa, #7c5cfc)",
      color: "#fff",
      fontSize: "0.95rem",
      fontWeight: 600,
      cursor: loading ? "not-allowed" : "pointer",
      fontFamily: "'DM Sans', sans-serif",
      marginTop: 4,
      transition: "all 0.2s",
      letterSpacing: "0.02em",
    },
    message: (type) => ({
      padding: "11px 14px",
      borderRadius: 10,
      fontSize: "0.84rem",
      marginBottom: 18,
      background: type === "success" ? "rgba(0,212,170,0.1)" : "rgba(255,107,107,0.1)",
      border: `1px solid ${type === "success" ? "rgba(0,212,170,0.25)" : "rgba(255,107,107,0.25)"}`,
      color: type === "success" ? "#00d4aa" : "#ff6b6b",
      display: "flex", alignItems: "flex-start", gap: 8,
    }),
    divider: {
      display: "flex", alignItems: "center", gap: 12,
      margin: "20px 0",
    },
    dividerLine: {
      flex: 1, height: 1,
      background: "rgba(255,255,255,0.06)",
    },
    dividerText: {
      fontSize: "0.72rem", color: "#4a5568",
    },
    link: {
      background: "none", border: "none",
      color: "#00d4aa", cursor: "pointer",
      fontSize: "0.84rem", fontFamily: "'DM Sans', sans-serif",
      padding: 0, textDecoration: "underline",
      textDecorationColor: "rgba(0,212,170,0.3)",
    },
    footer: {
      textAlign: "center",
      marginTop: 20,
      fontSize: "0.82rem",
      color: "#4a5568",
    },
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,212,170,0); }
          50%      { box-shadow: 0 0 20px 4px rgba(0,212,170,0.15); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #4a5568; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0d1b2a inset !important;
          -webkit-text-fill-color: #e8eaf6 !important;
        }
      `}</style>

      <ParticleBackground />

      <div style={S.card}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>🧠</div>
          <div style={S.logoName}>Aurora</div>
          <div style={S.logoSub}>AI Mental Health Companion</div>
        </div>

        {/* Message */}
        {message && (
          <div style={S.message(message.type)}>
            <span>{message.type === "success" ? "✓" : "⚠"}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* ── LOGIN FORM ─────────────────────────────────────────────────── */}
        {mode === "login" && (
          <>
            <div style={S.tabs}>
              <button style={S.tab(true)}  onClick={() => switchMode("login")}>Sign In</button>
              <button style={S.tab(false)} onClick={() => switchMode("register")}>Create Account</button>
            </div>

            <form onSubmit={handleLogin} noValidate>
              <Field
                label="Email Address"
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
                error={loginErrors.email}
                icon="✉"
              />
              <Field
                label="Password"
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Your password"
                error={loginErrors.password}
                icon="🔒"
              />

              <div style={{ textAlign: "right", marginBottom: 20, marginTop: -8 }}>
                <button type="button" style={S.link} onClick={() => switchMode("forgot")}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" style={S.submitBtn} disabled={loading}>
                {loading
                  ? <span>Signing in <span style={{ display:"inline-block", animation:"spin 1s linear infinite" }}>⟳</span></span>
                  : "Sign In →"
                }
              </button>
            </form>

            <div style={S.footer}>
              Don't have an account?{" "}
              <button style={S.link} onClick={() => switchMode("register")}>Create one free</button>
            </div>
          </>
        )}

        {/* ── REGISTER FORM ──────────────────────────────────────────────── */}
        {mode === "register" && (
          <>
            <div style={S.tabs}>
              <button style={S.tab(false)} onClick={() => switchMode("login")}>Sign In</button>
              <button style={S.tab(true)}  onClick={() => switchMode("register")}>Create Account</button>
            </div>

            <form onSubmit={handleRegister} noValidate>
              <Field
                label="Full Name"
                type="text"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="Your full name"
                error={regErrors.name}
                icon="👤"
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <Field
                    label="Email Address"
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="your@email.com"
                    error={regErrors.email}
                    icon="✉"
                  />
                </div>
                <div>
                  <Field
                    label="Age (optional)"
                    type="number"
                    value={regAge}
                    onChange={e => setRegAge(e.target.value)}
                    placeholder="e.g. 22"
                    error={regErrors.age}
                    icon="🎂"
                  />
                </div>
              </div>

              <Field
                label="Password"
                type="password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Create a strong password"
                error={regErrors.password}
                icon="🔒"
              />

              <PasswordStrength password={regPassword} />

              <Field
                label="Confirm Password"
                type="password"
                value={regConfirm}
                onChange={e => setRegConfirm(e.target.value)}
                placeholder="Repeat your password"
                error={regErrors.confirm}
                icon="🔑"
              />

              {/* Terms notice */}
              <div style={{
                fontSize: "0.72rem", color: "#4a5568",
                marginBottom: 16, lineHeight: 1.6,
              }}>
                By creating an account you confirm this platform is a supportive tool,
                not a replacement for professional mental health care.
                Crisis help: iCall <strong style={{color:"#8892b0"}}>9152987821</strong>
              </div>

              <button type="submit" style={S.submitBtn} disabled={loading}>
                {loading
                  ? <span>Creating account <span style={{ display:"inline-block", animation:"spin 1s linear infinite" }}>⟳</span></span>
                  : "Create Account →"
                }
              </button>
            </form>

            <div style={S.footer}>
              Already have an account?{" "}
              <button style={S.link} onClick={() => switchMode("login")}>Sign in</button>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD FORM ───────────────────────────────────────── */}
        {mode === "forgot" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔑</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#e8eaf6" }}>Reset Password</div>
              <div style={{ fontSize: "0.82rem", color: "#4a5568", marginTop: 4 }}>
                Enter your email and we will send a reset link
              </div>
            </div>

            <form onSubmit={handleForgot} noValidate>
              <Field
                label="Email Address"
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="your@email.com"
                icon="✉"
              />
              <button type="submit" style={S.submitBtn} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link →"}
              </button>
            </form>

            <div style={S.footer}>
              <button style={S.link} onClick={() => switchMode("login")}>← Back to sign in</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}