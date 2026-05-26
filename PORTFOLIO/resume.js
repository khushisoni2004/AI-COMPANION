import { useState, useEffect, useRef } from "react";

const PHOTO = "data:image/jpeg;base64,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";

const skills = {
  "Languages": ["Python", "JavaScript", "C++", "Java", "TypeScript", "SQL", "PHP", "Rust", "Go"],
  "Web Tech": ["React.js", "Vite", "HTML5", "CSS3", "Tailwind CSS", "Node.js", "Express.js", "REST APIs"],
  "Frameworks": ["FastAPI", "Flask", "Hugging Face", "Transformers", "MediaPipe", "OpenCV", "NumPy", "Pandas"],
  "Databases": ["SQLite", "MongoDB", "MySQL", "SQL Queries", "CRUD Operations"],
  "Cloud": ["Vercel", "Render", "Google Colab"],
  "AI/ML": ["Machine Learning", "LLM Fine-Tuning", "LoRA", "NLP", "Prompt Engineering", "AI Chatbot"],
};

const projects = [
  {
    title: "AI Mental Health Support System",
    tech: ["React.js", "FastAPI", "Python", "SQLite", "MediaPipe", "LLM"],
    desc: "Full-stack AI mental health platform with companion chat, mood tracking, meditation, music therapy, yoga/exercise, and dashboard analytics.",
    icon: "🧠",
    color: "#a78bfa",
  },
  {
    title: "Yojana Sathi – Scheme Finder",
    tech: ["Node.js", "Python", "BeautifulSoup", "PostgreSQL", "HTML", "CSS"],
    desc: "Government scheme finder platform helping users search and access public welfare schemes, with Python scraping and PostgreSQL storage.",
    icon: "🏛️",
    color: "#34d399",
  },
  {
    title: "#include Club Website",
    tech: ["HTML", "CSS", "JavaScript", "Node.js", "Express.js", "MongoDB"],
    desc: "Official website for SGSITS technical club with dynamic event sections, member records, newsletter subscriptions, and responsive UI.",
    icon: "💻",
    color: "#60a5fa",
  },
  {
    title: "Customer Cluster-Pro",
    tech: ["Python", "Pandas", "NumPy", "scikit-learn", "K-Means", "t-SNE"],
    desc: "ML-based segmentation of 2200+ customers into 5 behavioral groups using K-Means Clustering, optimized with Elbow Method and t-SNE visualization.",
    icon: "📊",
    color: "#fb923c",
  },
];

const achievements = [
  { icon: "🎯", label: "GATE 2026", value: "AIR 32388", desc: "Qualified national engineering exam" },
  { icon: "💡", label: "Coding Problems", value: "700+", desc: "Solved across platforms" },
  { icon: "⭐", label: "CodeChef", value: "3-Star", desc: "Rating 1657 · 21+ contests" },
  { icon: "🏆", label: "GeeksforGeeks", value: "Top 7%", desc: "300+ problems · Score 1330" },
];

function useInView(ref, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return inView;
}

function Section({ children, className = "" }) {
  const ref = useRef();
  const inView = useInView(ref);
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(40px)",
      transition: "opacity 0.75s ease, transform 0.75s ease",
    }}>
      {children}
    </div>
  );
}

export default function Portfolio() {
  const [activeSkill, setActiveSkill] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [typed, setTyped] = useState("");
  const roles = ["Full Stack Developer", "AI/ML Enthusiast", "Problem Solver", "B.Tech IT Student"];
  const [roleIdx, setRoleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = roles[roleIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setTyped(current.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        } else {
          setTimeout(() => setDeleting(true), 1400);
        }
      } else {
        if (charIdx > 0) {
          setTyped(current.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        } else {
          setDeleting(false);
          setRoleIdx(r => (r + 1) % roles.length);
        }
      }
    }, deleting ? 45 : 90);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, roleIdx]);

  const skillColors = {
    "Languages": "#a78bfa", "Web Tech": "#60a5fa", "Frameworks": "#34d399",
    "Databases": "#fb923c", "Cloud": "#f472b6", "AI/ML": "#fbbf24",
  };

  return (
    <div style={{
      fontFamily: "'Sora', 'DM Sans', sans-serif",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0f1a 100%)",
      minHeight: "100vh",
      color: "#e2e8f0",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #a78bfa; border-radius: 10px; }
        .nav-link { color: #94a3b8; text-decoration: none; font-size: 0.9rem; font-weight: 500; padding: 8px 14px; border-radius: 8px; transition: all 0.25s; }
        .nav-link:hover { color: #a78bfa; background: rgba(167,139,250,0.1); }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #a78bfa); border: none; color: white; padding: 12px 28px; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 0.95rem; font-family: inherit; transition: all 0.3s; display: inline-block; text-decoration: none; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(124,58,237,0.4); }
        .btn-outline { border: 1.5px solid rgba(167,139,250,0.5); color: #a78bfa; background: transparent; padding: 12px 28px; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 0.95rem; font-family: inherit; transition: all 0.3s; display: inline-block; text-decoration: none; }
        .btn-outline:hover { background: rgba(167,139,250,0.1); transform: translateY(-2px); }
        .skill-tag { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; margin: 4px; transition: all 0.2s; cursor: default; }
        .skill-tag:hover { transform: scale(1.05); }
        .glow-text { background: linear-gradient(135deg, #a78bfa, #60a5fa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glass-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; backdrop-filter: blur(10px); }
        .floating { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        .spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pulse-ring { animation: pulseRing 2.5s ease-in-out infinite; }
        @keyframes pulseRing { 0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,0.4); } 50% { box-shadow: 0 0 0 18px rgba(167,139,250,0); } }
        .project-card { transition: transform 0.3s, box-shadow 0.3s; cursor: default; }
        .project-card:hover { transform: translateY(-6px) scale(1.01); }
        .achievement-card { transition: transform 0.3s, box-shadow 0.3s; }
        .achievement-card:hover { transform: translateY(-4px); }
        .cursor { display: inline-block; width: 2px; height: 1.1em; background: #a78bfa; margin-left: 2px; animation: blink 0.7s step-end infinite; vertical-align: text-bottom; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 48px", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "1.1rem", color: "#a78bfa", fontWeight: 700 }}>
          &lt;KS /&gt;
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {["About", "Skills", "Projects", "Achievements", "Contact"].map(s => (
            <a key={s} href={`#${s.toLowerCase()}`} className="nav-link">{s}</a>
          ))}
        </div>
        <a href="mailto:er.soni.khushi@gmail.com" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>Hire Me</a>
      </nav>

      {/* HERO */}
      <section id="about" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: "80px" }}>
        {/* Orbs */}
        <div className="orb" style={{ width: 500, height: 500, background: "rgba(124,58,237,0.15)", top: -100, right: -100 }} />
        <div className="orb" style={{ width: 400, height: 400, background: "rgba(52,211,153,0.08)", bottom: -100, left: -100 }} />
        <div className="orb" style={{ width: 300, height: 300, background: "rgba(96,165,250,0.1)", top: "40%", left: "30%" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", width: "100%" }}>
          {/* Left */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 50, padding: "6px 16px", marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, background: "#34d399", borderRadius: "50%", animation: "pulseRing 2s infinite" }} />
              <span style={{ fontSize: "0.8rem", color: "#a78bfa", fontWeight: 600 }}>Available for opportunities</span>
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
              Hi, I'm <span className="glow-text">Khushi Soni</span>
            </h1>
            <div style={{ fontSize: "1.35rem", color: "#94a3b8", marginBottom: 24, height: 40, display: "flex", alignItems: "center", fontFamily: "'Space Mono', monospace", fontWeight: 400 }}>
              <span style={{ color: "#60a5fa" }}>{'>'}</span>&nbsp;
              <span style={{ color: "#e2e8f0" }}>{typed}</span>
              <span className="cursor" />
            </div>
            <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: "1rem", marginBottom: 36, maxWidth: 480 }}>
              B.Tech IT student at SGSITS Indore with a CGPA of 8.85. I build AI-powered full-stack apps, love competitive coding, and recently qualified GATE 2026.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 36 }}>
              <a href="https://linkedin.com/in/khushi-soni-989438292" target="_blank" className="btn-primary" rel="noreferrer">LinkedIn</a>
              <a href="https://github.com/khushisoni2004" target="_blank" className="btn-outline" rel="noreferrer">GitHub</a>
              <a href="mailto:er.soni.khushi@gmail.com" className="btn-outline">Email Me</a>
            </div>
            {/* Quick stats */}
            <div style={{ display: "flex", gap: 28 }}>
              {[["8.85", "CGPA"], ["700+", "Problems"], ["4+", "Projects"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#a78bfa", fontFamily: "'Space Mono', monospace" }}>{val}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, letterSpacing: 1 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Photo */}
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="spin-slow" style={{ width: 380, height: 380, border: "1px dashed rgba(167,139,250,0.25)", borderRadius: "50%" }} />
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="spin-slow" style={{ width: 310, height: 310, border: "1px dashed rgba(96,165,250,0.2)", borderRadius: "50%", animationDirection: "reverse" }} />
            </div>
            {/* Floating dots */}
            {[["-20px", "40%"], ["105%", "30%"], ["50%", "-20px"]].map(([l, t], i) => (
              <div key={i} style={{ position: "absolute", left: l, top: t, width: 12, height: 12, background: ["#a78bfa", "#34d399", "#60a5fa"][i], borderRadius: "50%", animation: `float ${4 + i}s ease-in-out infinite` }} />
            ))}
            <div className="floating" style={{ position: "relative", zIndex: 2 }}>
              {/* Glow behind card */}
              <div style={{ position: "absolute", inset: -16, borderRadius: 32, background: "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(96,165,250,0.2))", filter: "blur(24px)", zIndex: -1 }} />
              <div style={{
                width: 270,
                borderRadius: 28,
                overflow: "hidden",
                border: "2px solid rgba(167,139,250,0.55)",
                boxShadow: "0 0 50px rgba(124,58,237,0.35), 0 20px 60px rgba(0,0,0,0.5)",
                background: "#0d0d1a",
              }}>
                <img
                  src={PHOTO}
                  alt="Khushi Soni"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    verticalAlign: "bottom",
                  }}
                />
              </div>
              {/* Badge */}
              <div style={{ position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #7c3aed, #a78bfa)", borderRadius: 50, padding: "6px 20px", whiteSpace: "nowrap", fontSize: "0.78rem", fontWeight: 700, color: "#fff", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>
                ✨ Open to Opportunities
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#a78bfa", fontWeight: 600, letterSpacing: 2, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: 12 }}>What I work with</p>
            <h2 style={{ fontSize: "2.8rem", fontWeight: 800 }}>Technical <span className="glow-text">Skills</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {Object.entries(skills).map(([cat, items]) => (
              <div key={cat} className="glass-card" style={{ padding: 24, borderTop: `2px solid ${skillColors[cat]}` }}
                onMouseEnter={() => setActiveSkill(cat)} onMouseLeave={() => setActiveSkill(null)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 10, height: 10, background: skillColors[cat], borderRadius: "50%" }} />
                  <span style={{ fontWeight: 700, color: skillColors[cat], fontSize: "0.9rem", letterSpacing: 0.5 }}>{cat}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {items.map(skill => (
                    <span key={skill} className="skill-tag" style={{
                      background: `${skillColors[cat]}15`,
                      color: skillColors[cat],
                      border: `1px solid ${skillColors[cat]}30`,
                    }}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* EXPERIENCE */}
      <section style={{ padding: "0 48px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#a78bfa", fontWeight: 600, letterSpacing: 2, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: 12 }}>Work</p>
            <h2 style={{ fontSize: "2.8rem", fontWeight: 800 }}>Experience</h2>
          </div>
          <div className="glass-card" style={{ padding: 40, borderLeft: "3px solid #a78bfa", position: "relative" }}>
            <div style={{ position: "absolute", top: 40, right: 40, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: "0.78rem", color: "#a78bfa", fontWeight: 600 }}>
              Mar 2026 – May 2026
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #7c3aed, #a78bfa)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>🤖</div>
              <div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>AI Code Reviewer</h3>
                <p style={{ color: "#a78bfa", fontWeight: 600 }}>Xelron / Xelrom AI</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                "Evaluated AI-generated code changes and PRs for real-world GitHub repositories using structured diff-based review workflows.",
                "Reviewed backend refactoring, testing updates, architecture modifications, and type-system changes.",
                "Compared multiple implementations for correctness, maintainability, test coverage, and production readiness.",
                "Wrote clear technical justifications explaining bugs, backward compatibility issues, and expected behavior.",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 6, height: 6, background: "#a78bfa", borderRadius: "50%", marginTop: 8, flexShrink: 0 }} />
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.7 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </section>

      {/* PROJECTS */}
      <section id="projects" style={{ padding: "0 48px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#a78bfa", fontWeight: 600, letterSpacing: 2, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: 12 }}>What I've built</p>
            <h2 style={{ fontSize: "2.8rem", fontWeight: 800 }}>Featured <span className="glow-text">Projects</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {projects.map((p, i) => (
              <div key={i} className="glass-card project-card" style={{ padding: 32, borderTop: `2px solid ${p.color}` }}
                onMouseEnter={() => setHoveredProject(i)} onMouseLeave={() => setHoveredProject(null)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ fontSize: "2.2rem" }}>{p.icon}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ width: 10, height: 10, background: "#34d399", borderRadius: "50%" }} />
                    <div style={{ width: 10, height: 10, background: "#fbbf24", borderRadius: "50%" }} />
                    <div style={{ width: 10, height: 10, background: "#f87171", borderRadius: "50%" }} />
                  </div>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 10, color: hoveredProject === i ? p.color : "#e2e8f0", transition: "color 0.3s" }}>{p.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 20 }}>{p.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.tech.map(t => (
                    <span key={t} style={{ padding: "3px 10px", background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30`, borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* ACHIEVEMENTS */}
      <section id="achievements" style={{ padding: "0 48px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#a78bfa", fontWeight: 600, letterSpacing: 2, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: 12 }}>Milestones</p>
            <h2 style={{ fontSize: "2.8rem", fontWeight: 800 }}>Achievements & <span className="glow-text">Certifications</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
            {achievements.map((a, i) => (
              <div key={i} className="glass-card achievement-card" style={{ padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>{a.icon}</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#a78bfa", fontFamily: "'Space Mono', monospace" }}>{a.value}</div>
                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.9rem", margin: "6px 0" }}>{a.label}</div>
                <div style={{ color: "#64748b", fontSize: "0.78rem" }}>{a.desc}</div>
              </div>
            ))}
          </div>

          {/* Education Timeline */}
          <div style={{ marginTop: 60 }}>
            <h3 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 700, marginBottom: 40 }}>Education</h3>
            <div style={{ position: "relative", paddingLeft: 32 }}>
              <div style={{ position: "absolute", left: 12, top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom, #7c3aed, #a78bfa, #60a5fa)" }} />
              {[
                { yr: "2023–2026", school: "Shri G.S. Institute of Technology and Science, Indore", deg: "B.Tech – Information Technology", score: "CGPA: 8.85", color: "#a78bfa" },
                { yr: "2020–2023", school: "Government Polytechnic College, Itarsi", deg: "Diploma – Computer Science Engineering", score: "CGPA: 9.01", color: "#60a5fa" },
                { yr: "2020", school: "St. Mary's Co-ed Senior Secondary School, Itarsi", deg: "CBSE Class X", score: "CGPA: 8.90", color: "#34d399" },
              ].map((e, i) => (
                <div key={i} style={{ position: "relative", paddingLeft: 32, paddingBottom: 36 }}>
                  <div style={{ position: "absolute", left: -20, top: 4, width: 16, height: 16, background: e.color, borderRadius: "50%", border: "3px solid #0a0a0f", boxShadow: `0 0 12px ${e.color}` }} />
                  <div className="glass-card" style={{ padding: "20px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ color: e.color, fontWeight: 700, fontSize: "0.85rem", fontFamily: "'Space Mono', monospace" }}>{e.yr}</span>
                      <span style={{ background: `${e.color}18`, color: e.color, padding: "3px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700 }}>{e.score}</span>
                    </div>
                    <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{e.deg}</h4>
                    <p style={{ color: "#64748b", fontSize: "0.85rem" }}>{e.school}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "0 48px 120px", maxWidth: 1200, margin: "0 auto" }}>
        <Section>
          <div className="glass-card" style={{ padding: "60px 48px", textAlign: "center", background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(96,165,250,0.05))", position: "relative", overflow: "hidden" }}>
            <div className="orb" style={{ width: 300, height: 300, background: "rgba(124,58,237,0.12)", top: -100, right: -100, filter: "blur(60px)" }} />
            <p style={{ color: "#a78bfa", fontWeight: 600, letterSpacing: 2, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: 16 }}>Get in touch</p>
            <h2 style={{ fontSize: "2.8rem", fontWeight: 800, marginBottom: 16 }}>Let's <span className="glow-text">Connect</span></h2>
            <p style={{ color: "#94a3b8", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.8 }}>
              I'm open to internships, full-time roles, and exciting collaborations. Feel free to reach out!
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <a href="mailto:er.soni.khushi@gmail.com" className="btn-primary">📧 er.soni.khushi@gmail.com</a>
              <a href="tel:+917000488770" className="btn-outline">📞 +91 7000488770</a>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 28 }}>
              <a href="https://linkedin.com/in/khushi-soni-989438292" target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid rgba(96,165,250,0.4)", paddingBottom: 2 }}>LinkedIn ↗</a>
              <a href="https://github.com/khushisoni2004" target="_blank" rel="noreferrer" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid rgba(167,139,250,0.4)", paddingBottom: 2 }}>GitHub ↗</a>
            </div>
          </div>
        </Section>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center", padding: "28px 48px", color: "#475569", fontSize: "0.82rem" }}>
        Designed & built by <span style={{ color: "#a78bfa", fontWeight: 600 }}>Khushi Soni</span> · 2025 · &lt;KS /&gt;
      </footer>
    </div>
  );
}