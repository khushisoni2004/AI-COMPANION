import { useState, useEffect, useCallback, useRef } from "react";

// ─── 1. MEMORY MATCH ──────────────────────────────────────────────────────────
const EMOJI_PAIRS = ["🧠", "💚", "⭐", "🌙", "🎯", "🔥", "🌊", "✨"];
function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [started, setStarted] = useState(false);

  const initGame = useCallback(() => {
    const pairs = [...EMOJI_PAIRS, ...EMOJI_PAIRS]
      .map((emoji, i) => ({ id: i, emoji, key: Math.random() }))
      .sort(() => Math.random() - 0.5);
    setCards(pairs); setFlipped([]); setMatched([]);
    setMoves(0); setGameOver(false); setTimer(0); setStarted(false);
  }, []);
  useEffect(() => { initGame(); }, []);
  useEffect(() => {
    let interval;
    if (started && !gameOver) interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, gameOver]);
  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      if (cards[a]?.emoji === cards[b]?.emoji) {
        setMatched(prev => { const next = [...prev, cards[a].emoji]; if (next.length === EMOJI_PAIRS.length) setGameOver(true); return next; });
        setFlipped([]);
      } else { const t = setTimeout(() => setFlipped([]), 900); return () => clearTimeout(t); }
    }
  }, [flipped, cards]);

  const handleFlip = (i) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(cards[i]?.emoji)) return;
    if (!started) setStarted(true);
    setFlipped(prev => [...prev, i]);
    setMoves(m => m + 1);
  };
  const isRevealed = (i) => flipped.includes(i) || matched.includes(cards[i]?.emoji);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[{ label: "Moves", val: moves, color: "#f72585" }, { label: "Time", val: `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`, color: "#00d4aa" }, { label: "Matched", val: `${matched.length}/${EMOJI_PAIRS.length}`, color: "#ffd166" }].map(s => (
            <div key={s.label} className="card" style={{ padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button className="btn-ghost" onClick={initGame}>↺ New</button>
      </div>
      {gameOver && <div style={{ textAlign: "center", padding: 12, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.25)", borderRadius: 12, marginBottom: 14 }}>
        <div style={{ color: "#00d4aa", fontWeight: 700 }}>🎉 Done in {moves} moves & {timer}s!</div>
      </div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {cards.map((card, i) => (
          <button key={card.key} onClick={() => handleFlip(i)} style={{
            aspectRatio: "1", borderRadius: 12, border: isRevealed(i) ? `2px solid ${matched.includes(card.emoji) ? "#00d4aa" : "#7c5cfc"}40` : "1px solid rgba(255,255,255,0.08)",
            background: isRevealed(i) ? (matched.includes(card.emoji) ? "rgba(0,212,170,0.12)" : "rgba(124,92,252,0.15)") : "rgba(255,255,255,0.04)",
            cursor: isRevealed(i) ? "default" : "pointer", fontSize: "1.8rem", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center",
          }}>{isRevealed(i) ? card.emoji : "?"}</button>
        ))}
      </div>
    </div>
  );
}

// ─── 2. 2048 PUZZLE ───────────────────────────────────────────────────────────
function NumberPuzzle() {
  const SIZE = 4;
  const initGrid = () => Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
  const addRandom = (g) => {
    const empty = [];
    g.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]); }));
    if (!empty.length) return g;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const newG = g.map(row => [...row]);
    newG[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newG;
  };
  const [grid, setGrid] = useState(() => addRandom(addRandom(initGrid())));
  const [score, setScore] = useState(0);

  const moveLeft = (g) => {
    let ns = 0;
    const newG = g.map(row => {
      const f = row.filter(v => v !== 0), m = [];
      let i = 0;
      while (i < f.length) { if (i + 1 < f.length && f[i] === f[i + 1]) { m.push(f[i] * 2); ns += f[i] * 2; i += 2; } else { m.push(f[i]); i++; } }
      return [...m, ...Array(SIZE - m.length).fill(0)];
    });
    return { newG, ns };
  };
  const rotate = (g) => g[0].map((_, i) => g.map(row => row[i]).reverse());

  const handleKey = useCallback((e) => {
    const rMap = { ArrowLeft: 0, ArrowRight: 2, ArrowUp: 1, ArrowDown: 3 };
    if (!(e.key in rMap)) return;
    e.preventDefault();
    setGrid(g => {
      let rot = g;
      for (let i = 0; i < rMap[e.key]; i++) rot = rotate(rot);
      const { newG, ns } = moveLeft(rot);
      let unrot = newG;
      for (let i = 0; i < (4 - rMap[e.key]) % 4; i++) unrot = rotate(unrot);
      setScore(s => s + ns);
      return addRandom(unrot);
    });
  }, []);
  useEffect(() => { window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [handleKey]);

  const tileColor = (v) => ({ 2: "#e8eaf6", 4: "#ffd166", 8: "#ff6b6b", 16: "#f72585", 32: "#7c5cfc", 64: "#4cc9f0", 128: "#00d4aa", 256: "#06d6a0", 512: "#ffd166", 1024: "#ff6b6b", 2048: "#f72585" }[v] || "#e8eaf6");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="card" style={{ padding: "8px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffd166" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div>
        </div>
        <div style={{ fontSize: "0.78rem", color: "#4a5568" }}>Arrow keys to move</div>
        <button className="btn-ghost" onClick={() => { setGrid(addRandom(addRandom(initGrid()))); setScore(0); }}>↺ Reset</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 10 }}>
        {grid.flat().map((val, i) => (
          <div key={i} style={{
            aspectRatio: "1", borderRadius: 10,
            background: val ? `${tileColor(val)}22` : "rgba(255,255,255,0.03)",
            border: val ? `1px solid ${tileColor(val)}40` : "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: val >= 100 ? "1rem" : "1.4rem", fontWeight: 700,
            color: val ? tileColor(val) : "transparent", transition: "all 0.15s",
          }}>{val || ""}</div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. REACTION TIME ─────────────────────────────────────────────────────────
function ReactionGame() {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const startTime = useRef(null);
  const timeout = useRef(null);

  const start = () => {
    setState("waiting");
    timeout.current = setTimeout(() => { setState("go"); startTime.current = Date.now(); }, 2000 + Math.random() * 3000);
  };
  const handleClick = () => {
    if (state === "go") {
      const rt = Date.now() - startTime.current;
      setResult(rt); setHistory(h => [...h.slice(-4), rt]); setState("result");
    } else if (state === "waiting") { clearTimeout(timeout.current); setState("idle"); }
  };
  const avg = history.length ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {history.map((h, i) => (
          <div key={i} className="card" style={{ flex: 1, minWidth: 60, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: h < 300 ? "#00d4aa" : h < 500 ? "#ffd166" : "#ff6b6b" }}>{h}ms</div>
          </div>
        ))}
        {avg && <div className="card" style={{ flex: 1, minWidth: 60, padding: 8, textAlign: "center" }}><div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#7c5cfc" }}>Avg: {avg}ms</div></div>}
      </div>
      <div onClick={state === "idle" || state === "result" ? start : handleClick} style={{
        height: 200, borderRadius: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12,
        background: state === "go" ? "linear-gradient(135deg,rgba(0,212,170,0.2),rgba(6,214,160,0.1))" : state === "waiting" ? "linear-gradient(135deg,rgba(255,107,107,0.12),rgba(255,107,107,0.05))" : "rgba(255,255,255,0.03)",
        border: state === "go" ? "2px solid rgba(0,212,170,0.4)" : state === "waiting" ? "2px solid rgba(255,107,107,0.3)" : "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.2s", userSelect: "none",
      }}>
        <div style={{ fontSize: "3rem" }}>{state === "idle" ? "👆" : state === "waiting" ? "⏳" : state === "go" ? "⚡" : "✅"}</div>
        <div style={{ fontSize: "1rem", fontWeight: 700, color: state === "go" ? "#00d4aa" : "#e8eaf6" }}>
          {state === "idle" || state === "result" ? "Click to Start" : state === "waiting" ? "Wait for green..." : "CLICK NOW!"}
        </div>
        {state === "result" && result && <div style={{ fontSize: "0.85rem", color: "#8892b0" }}>{result < 250 ? "⚡ Lightning fast!" : result < 400 ? "👍 Great!" : result < 600 ? "😊 Good effort" : "🐢 Try again!"}</div>}
      </div>
    </div>
  );
}

// ─── 4. WORDLE ────────────────────────────────────────────────────────────────
const WORD_LIST = ["BRAIN","FOCUS","THINK","LOGIC","SHARP","SMART","GRASP","LEARN","SOLVE","CHESS","SPEED","GREAT","DREAM","CLEAR","FLAME","GLOBE","HAPPY","JUDGE","KNOCK","LATER","MAGIC","NIGHT","OCEAN","POWER","QUEST","RANGE","SOUND","TRUTH","UNITY","VALID","WORLD","YOUTH","ZONES","BLAST","CRANE","DRIVE","EVERY","FOUND","GRANT","HEART","INDEX"];
function WordleGame() {
  const getWord = () => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  const [target, setTarget] = useState(getWord);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState("playing");
  const [shake, setShake] = useState(false);

  const reset = () => { setTarget(getWord()); setGuesses([]); setCurrent(""); setStatus("playing"); };

  const getColors = (guess) => guess.split("").map((ch, i) => {
    if (ch === target[i]) return "correct";
    if (target.includes(ch)) return "present";
    return "absent";
  });

  const submit = () => {
    if (current.length !== 5) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    const colors = getColors(current);
    const newGuesses = [...guesses, { word: current, colors }];
    setGuesses(newGuesses);
    setCurrent("");
    if (current === target) { setStatus("won"); return; }
    if (newGuesses.length >= 6) setStatus("lost");
  };

  const handleKey = useCallback((e) => {
    if (status !== "playing") return;
    if (e.key === "Enter") { submit(); return; }
    if (e.key === "Backspace") { setCurrent(c => c.slice(0, -1)); return; }
    if (/^[A-Za-z]$/.test(e.key) && current.length < 5) setCurrent(c => c + e.key.toUpperCase());
  }, [current, status, guesses, target]);

  useEffect(() => { window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [handleKey]);

  const colorStyle = (c) => ({ correct: { bg: "rgba(0,212,170,0.25)", border: "rgba(0,212,170,0.6)", color: "#00d4aa" }, present: { bg: "rgba(255,209,102,0.2)", border: "rgba(255,209,102,0.5)", color: "#ffd166" }, absent: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", color: "#4a5568" } }[c] || { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", color: "#e8eaf6" });

  const rows = [...guesses, ...Array(6 - guesses.length).fill(null)];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: "0.8rem", color: "#4a5568" }}>Guess the 5-letter word (6 tries)</div>
        <button className="btn-ghost" onClick={reset}>↺ New</button>
      </div>
      {(status === "won" || status === "lost") && (
        <div style={{ textAlign: "center", padding: 12, background: status === "won" ? "rgba(0,212,170,0.1)" : "rgba(255,107,107,0.1)", border: `1px solid ${status === "won" ? "rgba(0,212,170,0.3)" : "rgba(255,107,107,0.3)"}`, borderRadius: 10, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: status === "won" ? "#00d4aa" : "#ff6b6b" }}>{status === "won" ? "🎉 Brilliant!" : `😔 It was: ${target}`}</div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", marginBottom: 16 }}>
        {rows.map((row, ri) => {
          const isCurrent = !row && ri === guesses.length;
          const word = isCurrent ? current.padEnd(5, " ") : (row ? row.word : "     ");
          return (
            <div key={ri} style={{ display: "flex", gap: 6, animation: isCurrent && shake ? "shake 0.5s ease" : "none" }}>
              {word.split("").map((ch, ci) => {
                const c = row ? colorStyle(row.colors[ci]) : { bg: "rgba(255,255,255,0.04)", border: isCurrent && ch.trim() ? "rgba(124,92,252,0.5)" : "rgba(255,255,255,0.1)", color: "#e8eaf6" };
                return (
                  <div key={ci} style={{ width: 48, height: 48, borderRadius: 8, background: c.bg, border: `2px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, color: c.color, transition: "all 0.3s" }}>{ch.trim()}</div>
                );
              })}
            </div>
          );
        })}
      </div>
      {status === "playing" && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <input value={current} readOnly placeholder="Type a word..." style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 14px", color: "#e8eaf6", fontSize: "1rem", fontWeight: 700, width: 160, textAlign: "center", letterSpacing: 4 }} />
          <button className="btn-primary" onClick={submit} style={{ padding: "8px 20px" }}>Enter</button>
        </div>
      )}
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }`}</style>
    </div>
  );
}

// ─── 5. MATH QUIZ ─────────────────────────────────────────────────────────────
function MathQuiz() {
  const genQ = (level) => {
    const ops = level < 3 ? ["+", "-"] : level < 6 ? ["+", "-", "*"] : ["+", "-", "*", "/"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, ans;
    if (op === "+") { a = Math.floor(Math.random() * (level * 10 + 10)); b = Math.floor(Math.random() * (level * 10 + 10)); ans = a + b; }
    else if (op === "-") { a = Math.floor(Math.random() * (level * 10 + 10)) + 5; b = Math.floor(Math.random() * a); ans = a - b; }
    else if (op === "*") { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; ans = a * b; }
    else { b = Math.floor(Math.random() * 11) + 2; ans = Math.floor(Math.random() * 11) + 1; a = b * ans; }
    return { q: `${a} ${op} ${b}`, ans };
  };
  const [level, setLevel] = useState(1);
  const [q, setQ] = useState(() => genQ(1));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(15);
  const timerRef = useRef(null);

  const nextQ = useCallback((lv) => { setQ(genQ(lv)); setInput(""); setTimer(15); }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { setFeedback("timeout"); setStreak(0); setTimeout(() => { setFeedback(null); nextQ(level); }, 900); return 15; } return t - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, [level, nextQ]);

  const submit = () => {
    if (input === "") return;
    clearInterval(timerRef.current);
    if (parseInt(input) === q.ans) {
      const ns = streak + 1;
      const nl = Math.min(10, Math.floor(ns / 3) + 1);
      setScore(s => s + level * 10);
      setStreak(ns);
      setLevel(nl);
      setFeedback("correct");
      setTimeout(() => { setFeedback(null); nextQ(nl); }, 600);
    } else {
      setStreak(0);
      setFeedback("wrong");
      setTimeout(() => { setFeedback(null); nextQ(level); }, 900);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        {[{ l: "Score", v: score, c: "#ffd166" }, { l: "Streak", v: `🔥 ${streak}`, c: "#f72585" }, { l: "Level", v: level, c: "#7c5cfc" }, { l: "Time", v: timer + "s", c: timer < 5 ? "#ff6b6b" : "#00d4aa" }].map(s => (
          <div key={s.l} className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", padding: "28px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: `2px solid ${feedback === "correct" ? "rgba(0,212,170,0.4)" : feedback === "wrong" || feedback === "timeout" ? "rgba(255,107,107,0.4)" : "rgba(255,255,255,0.08)"}`, marginBottom: 16, transition: "border 0.3s" }}>
        <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#e8eaf6", letterSpacing: 2, marginBottom: 4 }}>{q.q} = ?</div>
        {feedback && <div style={{ fontSize: "1rem", color: feedback === "correct" ? "#00d4aa" : "#ff6b6b", marginTop: 6 }}>{feedback === "correct" ? "✓ Correct!" : feedback === "wrong" ? `✗ Answer: ${q.ans}` : `⏰ Too slow! ${q.ans}`}</div>}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <input type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} autoFocus placeholder="Your answer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 16px", color: "#e8eaf6", fontSize: "1.1rem", width: 140, textAlign: "center" }} />
        <button className="btn-primary" onClick={submit} style={{ padding: "10px 24px" }}>Check</button>
      </div>
    </div>
  );
}

// ─── 6. SIMON SAYS ────────────────────────────────────────────────────────────
const SIMON_COLORS = ["#f72585", "#00d4aa", "#ffd166", "#7c5cfc"];
const SIMON_LABELS = ["🔴", "🟢", "🟡", "🟣"];
function SimonSays() {
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [active, setActive] = useState(null);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);

  const playSequence = async (seq) => {
    setPhase("showing");
    await new Promise(r => setTimeout(r, 500));
    for (const idx of seq) {
      setActive(idx);
      await new Promise(r => setTimeout(r, 600));
      setActive(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setPhase("input");
  };

  const startGame = () => {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first); setPlayerSeq([]); setFailed(false); setScore(0);
    setTimeout(() => playSequence(first), 300);
  };

  const handlePress = (idx) => {
    if (phase !== "input") return;
    const newP = [...playerSeq, idx];
    setPlayerSeq(newP);
    setActive(idx);
    setTimeout(() => setActive(null), 200);
    if (sequence[newP.length - 1] !== idx) { setFailed(true); setPhase("idle"); return; }
    if (newP.length === sequence.length) {
      setScore(s => s + 1);
      const next = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(next);
      setPlayerSeq([]);
      setTimeout(() => playSequence(next), 800);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div className="card" style={{ padding: "8px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffd166" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Round</div>
        </div>
        <div style={{ fontSize: "0.85rem", color: phase === "showing" ? "#ffd166" : phase === "input" ? "#00d4aa" : "#4a5568", fontWeight: 600 }}>
          {phase === "showing" ? "👀 Watch..." : phase === "input" ? "🎯 Your turn!" : "Press Start"}
        </div>
        {failed && <div style={{ color: "#ff6b6b", fontWeight: 700, fontSize: "0.9rem" }}>❌ Wrong!</div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {SIMON_COLORS.map((color, i) => (
          <button key={i} onClick={() => handlePress(i)} style={{
            height: 110, borderRadius: 16, border: `3px solid ${active === i ? color : color + "40"}`,
            background: active === i ? color + "40" : color + "12",
            fontSize: "2.5rem", cursor: phase === "input" ? "pointer" : "default",
            transition: "all 0.15s", transform: active === i ? "scale(1.05)" : "scale(1)",
          }}>{SIMON_LABELS[i]}</button>
        ))}
      </div>
      {(phase === "idle") && <button className="btn-primary" onClick={startGame} style={{ width: "100%", padding: "12px" }}>{failed ? "🔄 Try Again" : "▶ Start Simon"}</button>}
    </div>
  );
}

// ─── 7. TYPING SPEED ──────────────────────────────────────────────────────────
const TYPING_TEXTS = [
  "The quick brown fox jumps over the lazy dog near the river bank.",
  "Mindfulness is the practice of bringing attention to the present moment.",
  "Cognitive training exercises help improve focus, memory, and mental clarity.",
  "The brain is a powerful organ that can adapt and grow throughout life.",
  "Regular puzzles and games can sharpen the mind and reduce cognitive decline.",
];
function TypingGame() {
  const [text] = useState(() => TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [timer, setTimer] = useState(0);
  const [wpm, setWpm] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (started && !done) interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, done]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (!started && val.length > 0) setStarted(true);
    setInput(val);
    if (val === text) {
      setDone(true);
      const mins = timer / 60 || 1 / 60;
      setWpm(Math.round((text.split(" ").length / mins)));
    }
  };

  const reset = () => { setInput(""); setStarted(false); setDone(false); setTimer(0); setWpm(0); if (inputRef.current) inputRef.current.focus(); };

  const getCharStyle = (i) => {
    if (i >= input.length) return { color: "#4a5568" };
    return input[i] === text[i] ? { color: "#00d4aa" } : { color: "#ff6b6b", background: "rgba(255,107,107,0.15)", borderRadius: 2 };
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {[{ l: "Time", v: `${timer}s`, c: "#ffd166" }, { l: "WPM", v: wpm || "—", c: "#f72585" }, { l: "Accuracy", v: input.length ? `${Math.round((input.split("").filter((c, i) => c === text[i]).length / input.length) * 100)}%` : "—", c: "#00d4aa" }].map(s => (
          <div key={s.l} className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "1.05rem", lineHeight: 1.8, padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 14, letterSpacing: "0.05em" }}>
        {text.split("").map((ch, i) => <span key={i} style={getCharStyle(i)}>{ch}</span>)}
      </div>
      {done ? (
        <div style={{ textAlign: "center", padding: 14, background: "rgba(0,212,170,0.1)", borderRadius: 12, border: "1px solid rgba(0,212,170,0.3)" }}>
          <div style={{ color: "#00d4aa", fontWeight: 700, fontSize: "1.1rem" }}>🏁 {wpm} WPM in {timer}s!</div>
          <button className="btn-ghost" onClick={reset} style={{ marginTop: 10 }}>↺ Try Again</button>
        </div>
      ) : (
        <textarea ref={inputRef} value={input} onChange={handleChange} placeholder="Start typing here..." style={{ width: "100%", height: 72, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#e8eaf6", fontSize: "1rem", resize: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
      )}
    </div>
  );
}

// ─── 8. SUDOKU (4×4 mini) ─────────────────────────────────────────────────────
const SUDOKU_PUZZLES = [
  { puzzle: [[1,0,0,2],[0,0,1,0],[0,3,0,0],[4,0,0,1]], solution: [[1,4,3,2],[2,3,1,4],[3,1,4,2],[4,2,1,3]] },  // simplified
  { puzzle: [[0,2,0,0],[3,0,0,1],[1,0,0,3],[0,0,2,0]], solution: [[1,2,4,3],[3,4,2,1],[1,2,3,4],[4,3,2,1]] },
];
function SudokuGame() {
  const getPuzzle = () => SUDOKU_PUZZLES[Math.floor(Math.random() * SUDOKU_PUZZLES.length)];
  const [data, setData] = useState(getPuzzle);
  const [grid, setGrid] = useState(() => data.puzzle.map(r => [...r]));
  const [errors, setErrors] = useState([]);
  const [solved, setSolved] = useState(false);

  const reset = () => { const d = getPuzzle(); setData(d); setGrid(d.puzzle.map(r => [...r])); setErrors([]); setSolved(false); };

  const handleInput = (r, c, val) => {
    if (data.puzzle[r][c] !== 0) return;
    const v = parseInt(val) || 0;
    if (v < 0 || v > 4) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = v;
    setGrid(newGrid);
    const newErrors = [];
    newGrid.forEach((row, ri) => row.forEach((cell, ci) => { if (cell !== 0 && cell !== data.solution[ri][ci]) newErrors.push(`${ri}-${ci}`); }));
    setErrors(newErrors);
    if (newGrid.flat().every((v, i) => v === data.solution[Math.floor(i / 4)][i % 4])) setSolved(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: "0.82rem", color: "#4a5568" }}>Fill 1–4, no repeats in row/col/box</div>
        <button className="btn-ghost" onClick={reset}>↺ New</button>
      </div>
      {solved && <div style={{ textAlign: "center", padding: 12, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.3)", borderRadius: 10, marginBottom: 14 }}><div style={{ color: "#00d4aa", fontWeight: 700 }}>🎉 Solved!</div></div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, maxWidth: 240, margin: "0 auto" }}>
        {grid.map((row, ri) => row.map((cell, ci) => {
          const isFixed = data.puzzle[ri][ci] !== 0;
          const isError = errors.includes(`${ri}-${ci}`);
          return (
            <input key={`${ri}-${ci}`} type="number" min={1} max={4} value={cell || ""} readOnly={isFixed}
              onChange={e => handleInput(ri, ci, e.target.value)} style={{
                width: "100%", aspectRatio: "1", textAlign: "center", fontSize: "1.3rem", fontWeight: 700,
                background: isFixed ? "rgba(124,92,252,0.15)" : isError ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.04)",
                border: `2px solid ${isFixed ? "rgba(124,92,252,0.4)" : isError ? "rgba(255,107,107,0.5)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8, color: isFixed ? "#7c5cfc" : isError ? "#ff6b6b" : "#e8eaf6", cursor: isFixed ? "default" : "text",
              }} />
          );
        }))}
      </div>
    </div>
  );
}

// ─── 9. SEQUENCE MEMORY ───────────────────────────────────────────────────────
function SequenceMemory() {
  const SIZE = 9;
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [active, setActive] = useState(null);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);

  const flashSequence = async (seq) => {
    setPhase("showing");
    await new Promise(r => setTimeout(r, 400));
    for (const idx of seq) {
      setActive(idx);
      await new Promise(r => setTimeout(r, 500));
      setActive(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setPhase("input");
  };

  const start = () => {
    const first = [Math.floor(Math.random() * SIZE)];
    setSequence(first); setPlayerSeq([]); setFailed(false); setScore(0);
    setTimeout(() => flashSequence(first), 300);
  };

  const handleClick = (idx) => {
    if (phase !== "input") return;
    const np = [...playerSeq, idx];
    setPlayerSeq(np);
    if (sequence[np.length - 1] !== idx) { setFailed(true); setPhase("idle"); return; }
    if (np.length === sequence.length) {
      setScore(s => s + 1);
      const next = [...sequence, Math.floor(Math.random() * SIZE)];
      setSequence(next); setPlayerSeq([]);
      setTimeout(() => flashSequence(next), 700);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="card" style={{ padding: "8px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#4cc9f0" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Level</div>
        </div>
        <div style={{ fontSize: "0.85rem", color: phase === "showing" ? "#ffd166" : phase === "input" ? "#00d4aa" : "#4a5568", fontWeight: 600 }}>
          {phase === "showing" ? "👀 Memorize..." : phase === "input" ? "🎯 Repeat it!" : failed ? "❌ Wrong!" : "Press Start"}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
        {Array.from({ length: SIZE }, (_, i) => (
          <button key={i} onClick={() => handleClick(i)} style={{
            height: 72, borderRadius: 12, border: `2px solid ${active === i ? "#4cc9f0" : "rgba(76,201,240,0.2)"}`,
            background: active === i ? "rgba(76,201,240,0.3)" : "rgba(76,201,240,0.05)",
            cursor: phase === "input" ? "pointer" : "default",
            transition: "all 0.15s", transform: active === i ? "scale(1.06)" : "scale(1)",
            fontSize: "1.4rem",
          }}>{"⬜"}</button>
        ))}
      </div>
      {phase === "idle" && <button className="btn-primary" onClick={start} style={{ width: "100%", padding: "11px" }}>{failed ? "🔄 Try Again" : "▶ Start"}</button>}
    </div>
  );
}

// ─── 10. WORD SCRAMBLE ────────────────────────────────────────────────────────
const SCRAMBLE_WORDS = [
  { word: "MEMORY", hint: "The ability to recall information" },
  { word: "PUZZLE", hint: "A game that tests ingenuity" },
  { word: "FOCUS", hint: "Concentrated attention" },
  { word: "LOGIC", hint: "Reasoning based on evidence" },
  { word: "BRAIN", hint: "The organ of thought" },
  { word: "CLEVER", hint: "Quick to understand" },
  { word: "WISDOM", hint: "Knowledge applied well" },
  { word: "THINK", hint: "To use your mind" },
  { word: "GENIUS", hint: "Exceptional intelligence" },
  { word: "SOLVE", hint: "Find the answer to" },
];
function ScrambleGame() {
  const getNew = () => {
    const item = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    const scrambled = item.word.split("").sort(() => Math.random() - 0.5).join("");
    return { ...item, scrambled: scrambled === item.word ? item.word.split("").reverse().join("") : scrambled };
  };
  const [current, setCurrent] = useState(getNew);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("playing");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const submit = () => {
    if (input.toUpperCase() === current.word) { setStatus("correct"); setScore(s => s + (showHint ? 5 : 10)); }
    else setStatus("wrong");
  };
  const next = () => { setCurrent(getNew()); setInput(""); setStatus("playing"); setShowHint(false); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div className="card" style={{ padding: "8px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffd166" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div>
        </div>
        <button className="btn-ghost" onClick={next}>Skip →</button>
      </div>
      <div style={{ textAlign: "center", padding: "28px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
        <div style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: 8, color: "#7c5cfc", marginBottom: 8 }}>{current.scrambled}</div>
        {showHint && <div style={{ fontSize: "0.85rem", color: "#8892b0", marginTop: 4 }}>💡 {current.hint}</div>}
      </div>
      {status === "correct" && <div style={{ textAlign: "center", padding: 10, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.3)", borderRadius: 10, marginBottom: 12 }}><div style={{ color: "#00d4aa", fontWeight: 700 }}>✓ Correct! +{showHint ? 5 : 10} pts</div></div>}
      {status === "wrong" && <div style={{ textAlign: "center", padding: 10, background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 10, marginBottom: 12 }}><div style={{ color: "#ff6b6b", fontWeight: 700 }}>✗ Try again!</div></div>}
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (status === "playing" ? submit() : next())} placeholder="Unscramble the word..." style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", color: "#e8eaf6", fontSize: "1rem", textTransform: "uppercase" }} />
        {status === "playing" ? <button className="btn-primary" onClick={submit} style={{ padding: "10px 18px" }}>Check</button> : <button className="btn-primary" onClick={next} style={{ padding: "10px 18px" }}>Next →</button>}
      </div>
      {status === "playing" && !showHint && <button className="btn-ghost" onClick={() => setShowHint(true)} style={{ marginTop: 10, width: "100%" }}>💡 Show Hint (-5pts)</button>}
    </div>
  );
}

// ─── 11. VISUAL PATTERN ───────────────────────────────────────────────────────
function PatternGame() {
  const SIZE = 4;
  const genPattern = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * SIZE * SIZE));
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const showPattern = async (pat) => {
    setPhase("showing"); setSelected([]);
    await new Promise(r => setTimeout(r, 400));
    for (const idx of pat) {
      setActive(idx);
      await new Promise(r => setTimeout(r, 500));
      setActive(null);
      await new Promise(r => setTimeout(r, 150));
    }
    setPhase("input");
  };

  const start = () => {
    const pat = genPattern(level + 2);
    setPattern(pat); setScore(0); setLevel(1); setFeedback(null);
    setTimeout(() => showPattern(pat), 300);
  };

  const handleClick = (idx) => {
    if (phase !== "input") return;
    const ns = [...selected, idx];
    setSelected(ns);
    if (ns.length === pattern.length) {
      const correct = ns.every((v, i) => v === pattern[i]);
      setFeedback(correct ? "correct" : "wrong");
      setPhase("idle");
      if (correct) { setScore(s => s + level); const nl = level + 1; setLevel(nl); setTimeout(() => { setFeedback(null); const p = genPattern(nl + 2); setPattern(p); showPattern(p); }, 1000); }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="card" style={{ padding: "8px 14px", textAlign: "center" }}><div style={{ fontSize: "1rem", fontWeight: 700, color: "#f72585" }}>{score}</div><div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div></div>
          <div className="card" style={{ padding: "8px 14px", textAlign: "center" }}><div style={{ fontSize: "1rem", fontWeight: 700, color: "#7c5cfc" }}>{level}</div><div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Level</div></div>
        </div>
        <div style={{ fontSize: "0.85rem", color: phase === "showing" ? "#ffd166" : phase === "input" ? "#00d4aa" : "#4a5568", fontWeight: 600 }}>
          {phase === "showing" ? "👀 Watch the pattern" : phase === "input" ? `🎯 Repeat (${selected.length}/${pattern.length})` : "Press Start"}
        </div>
      </div>
      {feedback && <div style={{ textAlign: "center", padding: 10, background: feedback === "correct" ? "rgba(0,212,170,0.1)" : "rgba(255,107,107,0.1)", borderRadius: 10, marginBottom: 12, color: feedback === "correct" ? "#00d4aa" : "#ff6b6b", fontWeight: 700 }}>{feedback === "correct" ? "✓ Perfect!" : "✗ Wrong order!"}</div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 6, marginBottom: 14 }}>
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const isActive = active === i;
          const isSelected = selected.includes(i);
          return (
            <button key={i} onClick={() => handleClick(i)} style={{
              aspectRatio: "1", borderRadius: 8, border: `2px solid ${isActive ? "#ffd166" : isSelected ? "rgba(247,37,133,0.5)" : "rgba(255,255,255,0.08)"}`,
              background: isActive ? "rgba(255,209,102,0.3)" : isSelected ? "rgba(247,37,133,0.15)" : "rgba(255,255,255,0.03)",
              cursor: phase === "input" ? "pointer" : "default", transition: "all 0.15s",
              transform: isActive ? "scale(1.1)" : "scale(1)",
            }} />
          );
        })}
      </div>
      {phase === "idle" && <button className="btn-primary" onClick={start} style={{ width: "100%", padding: "11px" }}>{feedback === "wrong" ? "🔄 Try Again" : "▶ Start Pattern"}</button>}
    </div>
  );
}

// ─── 12. TRIVIA QUIZ ──────────────────────────────────────────────────────────
const TRIVIA = [
  { q: "How many bones are in the adult human body?", opts: ["196", "206", "216", "226"], ans: 1 },
  { q: "What is the powerhouse of the cell?", opts: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], ans: 2 },
  { q: "Which planet has the most moons?", opts: ["Jupiter", "Saturn", "Uranus", "Neptune"], ans: 1 },
  { q: "How many sides does a heptagon have?", opts: ["5", "6", "7", "8"], ans: 2 },
  { q: "What is the chemical symbol for Gold?", opts: ["Gd", "Go", "Au", "Ag"], ans: 2 },
  { q: "Who painted the Mona Lisa?", opts: ["Michelangelo", "Raphael", "Botticelli", "Leonardo da Vinci"], ans: 3 },
  { q: "What is the square root of 144?", opts: ["10", "11", "12", "13"], ans: 2 },
  { q: "Which is the largest ocean on Earth?", opts: ["Atlantic", "Indian", "Arctic", "Pacific"], ans: 3 },
  { q: "How many letters are in the alphabet?", opts: ["24", "25", "26", "27"], ans: 2 },
  { q: "What gas do plants absorb from the air?", opts: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], ans: 2 },
];
function TriviaGame() {
  const [questions] = useState(() => [...TRIVIA].sort(() => Math.random() - 0.5).slice(0, 7));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const handleAnswer = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.ans) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true);
      else { setIdx(i => i + 1); setSelected(null); }
    }, 1000);
  };

  const reset = () => { setIdx(0); setScore(0); setSelected(null); setDone(false); };

  if (done) return (
    <div style={{ textAlign: "center", padding: "30px 20px" }}>
      <div style={{ fontSize: "3rem", marginBottom: 12 }}>{score >= 5 ? "🏆" : score >= 3 ? "👍" : "📚"}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e8eaf6", marginBottom: 8 }}>{score}/{questions.length}</div>
      <div style={{ color: "#8892b0", marginBottom: 20 }}>{score >= 6 ? "Genius!" : score >= 4 ? "Well done!" : "Keep learning!"}</div>
      <button className="btn-primary" onClick={reset} style={{ padding: "10px 28px" }}>Play Again</button>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: "0.82rem", color: "#4a5568" }}>Question {idx + 1} / {questions.length}</div>
        <div className="card" style={{ padding: "6px 14px" }}><span style={{ fontWeight: 700, color: "#ffd166" }}>{score}</span> <span style={{ fontSize: "0.7rem", color: "#4a5568" }}>pts</span></div>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginBottom: 20 }}>
        <div style={{ height: "100%", width: `${((idx) / questions.length) * 100}%`, background: "linear-gradient(90deg,#7c5cfc,#00d4aa)", borderRadius: 99, transition: "width 0.4s" }} />
      </div>
      <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e8eaf6", marginBottom: 20, lineHeight: 1.5 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, i) => {
          let bg = "rgba(255,255,255,0.04)", border = "rgba(255,255,255,0.1)", color = "#8892b0";
          if (selected !== null) {
            if (i === q.ans) { bg = "rgba(0,212,170,0.15)"; border = "rgba(0,212,170,0.5)"; color = "#00d4aa"; }
            else if (i === selected) { bg = "rgba(255,107,107,0.12)"; border = "rgba(255,107,107,0.4)"; color = "#ff6b6b"; }
          } else if (selected === null) { bg = "rgba(255,255,255,0.04)"; }
          return (
            <button key={i} onClick={() => handleAnswer(i)} style={{ padding: "12px 18px", borderRadius: 10, border: `1px solid ${border}`, background: bg, color, textAlign: "left", fontSize: "0.92rem", cursor: selected !== null ? "default" : "pointer", transition: "all 0.3s", fontWeight: selected !== null && i === q.ans ? 700 : 400 }}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── GAME REGISTRY ────────────────────────────────────────────────────────────
const gameList = [
  { id: "memory", title: "Memory Match", desc: "Flip cards to find matching pairs", icon: "🧩", color: "#f72585", component: MemoryGame, tag: "Memory" },
  { id: "numbers", title: "2048 Puzzle", desc: "Combine tiles to reach 2048", icon: "🔢", color: "#ffd166", component: NumberPuzzle, tag: "Strategy" },
  { id: "reaction", title: "Reaction Test", desc: "Test your response speed", icon: "⚡", color: "#00d4aa", component: ReactionGame, tag: "Speed" },
  { id: "wordle", title: "Wordle", desc: "Guess the hidden 5-letter word", icon: "🔤", color: "#7c5cfc", component: WordleGame, tag: "Language" },
  { id: "math", title: "Math Blitz", desc: "Solve equations against the clock", icon: "🧮", color: "#ff6b6b", component: MathQuiz, tag: "Math" },
  { id: "simon", title: "Simon Says", desc: "Repeat the colour sequence", icon: "🎨", color: "#4cc9f0", component: SimonSays, tag: "Memory" },
  { id: "typing", title: "Typing Speed", desc: "How fast can you type?", icon: "⌨️", color: "#06d6a0", component: TypingGame, tag: "Speed" },
  { id: "sudoku", title: "Sudoku 4×4", desc: "Fill the grid, no repeats", icon: "🔢", color: "#f8961e", component: SudokuGame, tag: "Logic" },
  { id: "sequence", title: "Sequence Memory", desc: "Remember and repeat the order", icon: "🧠", color: "#43aa8b", component: SequenceMemory, tag: "Memory" },
  { id: "scramble", title: "Word Scramble", desc: "Unscramble the hidden word", icon: "🔀", color: "#f3722c", component: ScrambleGame, tag: "Language" },
  { id: "pattern", title: "Pattern Recall", desc: "Memorise the flashing pattern", icon: "💡", color: "#90be6d", component: PatternGame, tag: "Focus" },
  { id: "trivia", title: "Trivia Quiz", desc: "Test your general knowledge", icon: "❓", color: "#577590", component: TriviaGame, tag: "Knowledge" },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function MindGames() {
  const [activeGame, setActiveGame] = useState(null);
  const [filter, setFilter] = useState("All");
  const tags = ["All", ...Array.from(new Set(gameList.map(g => g.tag)))];
  const filtered = filter === "All" ? gameList : gameList.filter(g => g.tag === filter);

  const GameComponent = activeGame ? gameList.find(g => g.id === activeGame)?.component : null;
  const gameInfo = activeGame ? gameList.find(g => g.id === activeGame) : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-label">Wellness Module</div>
        <h1 className="page-title">Mind Games</h1>
        <p className="page-subtitle">12 cognitive exercises to sharpen focus, memory, speed & logic</p>
      </div>

      {!activeGame ? (
        <>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {tags.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: "6px 14px", borderRadius: 99, border: `1px solid ${filter === t ? "rgba(124,92,252,0.5)" : "rgba(255,255,255,0.1)"}`,
                background: filter === t ? "rgba(124,92,252,0.15)" : "transparent",
                color: filter === t ? "#7c5cfc" : "#8892b0", fontSize: "0.78rem", fontWeight: filter === t ? 700 : 400, cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
            {filtered.map(game => (
              <div key={game.id} className="card" style={{ cursor: "pointer", textAlign: "center", padding: "24px 18px", borderColor: `${game.color}20`, transition: "transform 0.2s, border-color 0.2s" }}
                onClick={() => setActiveGame(game.id)}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = `${game.color}40`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = `${game.color}20`; }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: `${game.color}15`, border: `2px solid ${game.color}30`, fontSize: "1.8rem", marginBottom: 14 }}>{game.icon}</div>
                <div style={{ fontSize: "0.62rem", color: game.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{game.tag}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", color: "#e8eaf6", marginBottom: 6 }}>{game.title}</h3>
                <p style={{ fontSize: "0.78rem", color: "#8892b0", lineHeight: 1.5, marginBottom: 16 }}>{game.desc}</p>
                <button className="btn-primary" style={{ background: `linear-gradient(135deg,${game.color},${game.color}88)`, width: "100%", padding: "8px" }}>Play →</button>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: "linear-gradient(135deg,rgba(124,92,252,0.08),rgba(0,212,170,0.05))", border: "1px solid rgba(124,92,252,0.15)" }}>
            <div className="section-label">Why Mind Games?</div>
            <p style={{ fontSize: "0.88rem", color: "#8892b0", lineHeight: 1.7 }}>Cognitive exercises improve neuroplasticity — the brain's ability to form new connections. Regular puzzles and memory games can reduce anxiety, improve working memory, and increase attention span. Just 15 minutes daily can make a measurable difference.</p>
          </div>
        </>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${gameInfo.color}18`, border: `1px solid ${gameInfo.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>{gameInfo.icon}</div>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: "#e8eaf6" }}>{gameInfo.title}</h2>
                <div style={{ fontSize: "0.75rem", color: "#8892b0" }}>{gameInfo.desc}</div>
              </div>
            </div>
            <button className="btn-ghost" onClick={() => setActiveGame(null)}>← All Games</button>
          </div>
          <div className="card">{GameComponent && <GameComponent />}</div>

          {/* Other games quick-nav */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: "0.72rem", color: "#4a5568", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Try another game</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {gameList.filter(g => g.id !== activeGame).slice(0, 5).map(g => (
                <button key={g.id} onClick={() => setActiveGame(g.id)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${g.color}30`, background: `${g.color}10`, color: g.color, fontSize: "0.78rem", cursor: "pointer" }}>{g.icon} {g.title}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}