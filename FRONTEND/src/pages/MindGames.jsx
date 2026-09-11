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
  { q: "How many letters are in the English alphabet?", opts: ["24", "25", "26", "27"], ans: 2 },
  { q: "What gas do plants absorb from the air?", opts: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], ans: 2 },

  { q: "Which organ pumps blood in the human body?", opts: ["Brain", "Heart", "Lungs", "Kidney"], ans: 1 },
  { q: "Which planet is known as the Red Planet?", opts: ["Earth", "Mars", "Venus", "Saturn"], ans: 1 },
  { q: "What is H2O commonly known as?", opts: ["Salt", "Water", "Oxygen", "Hydrogen"], ans: 1 },
  { q: "How many days are there in a leap year?", opts: ["364", "365", "366", "367"], ans: 2 },
  { q: "Which animal is known as the King of the Jungle?", opts: ["Tiger", "Lion", "Elephant", "Bear"], ans: 1 },
  { q: "Which sense organ is used for hearing?", opts: ["Eye", "Ear", "Nose", "Tongue"], ans: 1 },
  { q: "What is the freezing point of water?", opts: ["0°C", "10°C", "50°C", "100°C"], ans: 0 },
  { q: "Which is the smallest prime number?", opts: ["0", "1", "2", "3"], ans: 2 },
  { q: "Which language is used for styling web pages?", opts: ["HTML", "CSS", "Python", "SQL"], ans: 1 },
  { q: "Which tag is used for the largest heading in HTML?", opts: ["h1", "h6", "p", "div"], ans: 0 },

  { q: "Which country is known as the Land of the Rising Sun?", opts: ["India", "Japan", "China", "Thailand"], ans: 1 },
  { q: "Which is the national animal of India?", opts: ["Lion", "Tiger", "Elephant", "Peacock"], ans: 1 },
  { q: "Which is the national bird of India?", opts: ["Sparrow", "Eagle", "Peacock", "Parrot"], ans: 2 },
  { q: "Which city is known as the Pink City of India?", opts: ["Jaipur", "Jodhpur", "Udaipur", "Bhopal"], ans: 0 },
  { q: "Which river is considered the longest river in the world?", opts: ["Amazon", "Nile", "Ganga", "Yangtze"], ans: 1 },
  { q: "How many continents are there on Earth?", opts: ["5", "6", "7", "8"], ans: 2 },
  { q: "Which is the largest desert in the world?", opts: ["Sahara", "Gobi", "Antarctic Desert", "Thar"], ans: 2 },
  { q: "Which is the fastest land animal?", opts: ["Lion", "Cheetah", "Horse", "Leopard"], ans: 1 },
  { q: "Which part of the plant makes food?", opts: ["Root", "Stem", "Leaf", "Flower"], ans: 2 },
  { q: "Which vitamin is produced when sunlight falls on skin?", opts: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], ans: 3 },

  { q: "What is the capital of India?", opts: ["Mumbai", "New Delhi", "Kolkata", "Chennai"], ans: 1 },
  { q: "What is the capital of Madhya Pradesh?", opts: ["Indore", "Bhopal", "Gwalior", "Jabalpur"], ans: 1 },
  { q: "Which is the largest planet in our solar system?", opts: ["Earth", "Mars", "Jupiter", "Venus"], ans: 2 },
  { q: "Which planet is closest to the Sun?", opts: ["Mercury", "Venus", "Earth", "Mars"], ans: 0 },
  { q: "How many players are there in a cricket team?", opts: ["9", "10", "11", "12"], ans: 2 },
  { q: "How many minutes are there in one hour?", opts: ["30", "45", "60", "90"], ans: 2 },
  { q: "How many seconds are there in one minute?", opts: ["30", "45", "60", "100"], ans: 2 },
  { q: "What is the value of 15 × 2?", opts: ["20", "25", "30", "35"], ans: 2 },
  { q: "What is the value of 100 ÷ 4?", opts: ["20", "25", "30", "40"], ans: 1 },
  { q: "What is the value of 9 + 8?", opts: ["15", "16", "17", "18"], ans: 2 },

  { q: "Which device is used to type text into a computer?", opts: ["Mouse", "Keyboard", "Monitor", "Printer"], ans: 1 },
  { q: "Which device displays computer output?", opts: ["Monitor", "Keyboard", "Scanner", "Speaker"], ans: 0 },
  { q: "What does CPU stand for?", opts: ["Central Processing Unit", "Computer Power Unit", "Central Program Utility", "Control Processing User"], ans: 0 },
  { q: "Which one is an input device?", opts: ["Monitor", "Printer", "Keyboard", "Speaker"], ans: 2 },
  { q: "Which one is an output device?", opts: ["Mouse", "Keyboard", "Printer", "Scanner"], ans: 2 },
  { q: "Which data structure works on FIFO?", opts: ["Stack", "Queue", "Tree", "Graph"], ans: 1 },
  { q: "Which data structure works on LIFO?", opts: ["Queue", "Stack", "Array", "Linked List"], ans: 1 },
  { q: "Which symbol is used for comments in JavaScript single-line comments?", opts: ["//", "/*", "#", "<!--"], ans: 0 },
  { q: "Which keyword is used to declare a constant in JavaScript?", opts: ["var", "let", "const", "static"], ans: 2 },
  { q: "Which command is used to create a React app with Vite?", opts: ["npm create vite@latest", "npm start vite", "react new app", "vite install react"], ans: 0 },
];
function TriviaGame() {
  const QUESTIONS_PER_GAME = 10;

  const getRandomQuestions = () => {
    return [...TRIVIA]
      .sort(() => Math.random() - 0.5)
      .slice(0, QUESTIONS_PER_GAME);
  };

  const [questions, setQuestions] = useState(getRandomQuestions);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  const handleAnswer = (i) => {
    if (selected !== null) return;

    setSelected(i);

    if (i === q.ans) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setDone(true);
      } else {
        setIdx(prev => prev + 1);
        setSelected(null);
      }
    }, 1000);
  };

  const reset = () => {
    setQuestions(getRandomQuestions());
    setIdx(0);
    setScore(0);
    setSelected(null);
    setDone(false);
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: "30px 20px" }}>
      <div style={{ fontSize: "3rem", marginBottom: 12 }}>
        {score >= 8 ? "🏆" : score >= 5 ? "👍" : "📚"}
      </div>

      <div style={{
        fontSize: "1.5rem",
        fontWeight: 800,
        color: "#e8eaf6",
        marginBottom: 8
      }}>
        {score}/{questions.length}
      </div>

      <div style={{ color: "#8892b0", marginBottom: 20 }}>
        {score >= 9 ? "Excellent!" : score >= 7 ? "Great job!" : score >= 5 ? "Good effort!" : "Keep learning!"}
      </div>

      <button className="btn-primary" onClick={reset} style={{ padding: "10px 28px" }}>
        Play Again
      </button>
    </div>
  );

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16
      }}>
        <div style={{ fontSize: "0.82rem", color: "#4a5568" }}>
          Question {idx + 1} / {questions.length}
        </div>

        <div className="card" style={{ padding: "6px 14px" }}>
          <span style={{ fontWeight: 700, color: "#ffd166" }}>{score}</span>
          <span style={{ fontSize: "0.7rem", color: "#4a5568" }}> pts</span>
        </div>
      </div>

      <div style={{
        height: 6,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 99,
        marginBottom: 20
      }}>
        <div style={{
          height: "100%",
          width: `${((idx + 1) / questions.length) * 100}%`,
          background: "linear-gradient(90deg,#7c5cfc,#00d4aa)",
          borderRadius: 99,
          transition: "width 0.4s"
        }} />
      </div>

      <div style={{
        fontSize: "1.05rem",
        fontWeight: 700,
        color: "#e8eaf6",
        marginBottom: 20,
        lineHeight: 1.5
      }}>
        {q.q}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, i) => {
          let bg = "rgba(255,255,255,0.04)";
          let border = "rgba(255,255,255,0.1)";
          let color = "#8892b0";

          if (selected !== null) {
            if (i === q.ans) {
              bg = "rgba(0,212,170,0.15)";
              border = "rgba(0,212,170,0.5)";
              color = "#00d4aa";
            } else if (i === selected) {
              bg = "rgba(255,107,107,0.12)";
              border = "rgba(255,107,107,0.4)";
              color = "#ff6b6b";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: bg,
                color,
                textAlign: "left",
                fontSize: "0.92rem",
                cursor: selected !== null ? "default" : "pointer",
                transition: "all 0.3s",
                fontWeight: selected !== null && i === q.ans ? 700 : 400
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 13. COLOR MATCHER ────────────────────────────────────────────────────────
function ColorMatcher() {
  const COLORS = [
    { name: "RED", color: "#ff6b6b" },
    { name: "BLUE", color: "#4cc9f0" },
    { name: "GREEN", color: "#06d6a0" },
    { name: "YELLOW", color: "#ffd166" },
    { name: "PURPLE", color: "#7c5cfc" },
    { name: "ORANGE", color: "#f8961e" },
  ];
  
  const [current, setCurrent] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(30);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const genQuestion = () => {
    const textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const displayColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setCurrent({ textColor, displayColor });
  };

  useEffect(() => {
    if (started && !gameOver) {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { setGameOver(true); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [started, gameOver]);

  const start = () => {
    setScore(0); setStreak(0); setTimer(30); setStarted(true); setGameOver(false);
    genQuestion();
  };

  const handleAnswer = (correct) => {
    if (gameOver) return;
    if (!started) setStarted(true);
    
    const isCorrect = correct === (current.textColor.name === current.displayColor.name);
    if (isCorrect) {
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    genQuestion();
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {[{ l: "Score", v: score, c: "#ffd166" }, { l: "Streak", v: `🔥 ${streak}`, c: "#f72585" }, { l: "Time", v: `${timer}s`, c: timer < 10 ? "#ff6b6b" : "#00d4aa" }].map(s => (
          <div key={s.l} className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {gameOver ? (
        <div style={{ textAlign: "center", padding: 30 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎨</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e8eaf6", marginBottom: 8 }}>Final Score: {score}</div>
          <button className="btn-primary" onClick={start}>Play Again</button>
        </div>
      ) : !started ? (
        <div style={{ textAlign: "center", padding: 30 }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🎨</div>
          <div style={{ fontSize: "0.9rem", color: "#8892b0", marginBottom: 20, lineHeight: 1.6 }}>Click "MATCH" if the word and color match.<br/>Click "DIFFERENT" if they don't match.</div>
          <button className="btn-primary" onClick={start}>Start Game</button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", padding: 40, background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 20 }}>
            <div style={{ fontSize: "3rem", fontWeight: 900, color: current?.displayColor.color, marginBottom: 10 }}>
              {current?.textColor.name}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#4a5568" }}>Does the word match the color?</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button className="btn-primary" onClick={() => handleAnswer(true)} style={{ padding: 16, background: "linear-gradient(135deg,#00d4aa,#06d6a0)" }}>✓ MATCH</button>
            <button className="btn-primary" onClick={() => handleAnswer(false)} style={{ padding: 16, background: "linear-gradient(135deg,#ff6b6b,#f72585)" }}>✗ DIFFERENT</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── 14. NUMBER SEQUENCE ──────────────────────────────────────────────────────
function SequenceNumbers() {
  const genSequence = (level) => {
    const types = ["arithmetic", "geometric", "fibonacci", "squares"];
    const type = types[Math.floor(Math.random() * Math.min(level, types.length))];
    
    if (type === "arithmetic") {
      const start = Math.floor(Math.random() * 20) + 1;
      const diff = Math.floor(Math.random() * 5) + 2;
      return { seq: [start, start + diff, start + 2*diff, start + 3*diff], ans: start + 4*diff };
    } else if (type === "geometric") {
      const start = Math.floor(Math.random() * 5) + 2;
      const ratio = 2;
      return { seq: [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio], ans: start * ratio * ratio * ratio * ratio };
    } else if (type === "fibonacci") {
      const a = 1, b = 1;
      return { seq: [a, b, a+b, a+2*b], ans: 2*a+3*b };
    } else {
      const n = Math.floor(Math.random() * 3) + 2;
      return { seq: [n*n, (n+1)*(n+1), (n+2)*(n+2), (n+3)*(n+3)], ans: (n+4)*(n+4) };
    }
  };

  const [level, setLevel] = useState(1);
  const [current, setCurrent] = useState(() => genSequence(1));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const submit = () => {
    if (input === "") return;
    if (parseInt(input) === current.ans) {
      setScore(s => s + level * 5);
      setLevel(l => l + 1);
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        setCurrent(genSequence(level + 1));
        setInput("");
      }, 800);
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        setCurrent(genSequence(level));
        setInput("");
      }, 1200);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#7c5cfc" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#00d4aa" }}>{level}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Level</div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: 30, background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 16 }}>
        <div style={{ fontSize: "0.8rem", color: "#4a5568", marginBottom: 12 }}>What's the next number?</div>
        <div style={{ fontSize: "2rem", fontWeight: 800, color: "#e8eaf6", letterSpacing: 8 }}>
          {current.seq.join(" , ")} , ?
        </div>
        {feedback && (
          <div style={{ fontSize: "0.9rem", color: feedback === "correct" ? "#00d4aa" : "#ff6b6b", marginTop: 12 }}>
            {feedback === "correct" ? "✓ Correct!" : `✗ Answer: ${current.ans}`}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Next number..." style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 16px", color: "#e8eaf6", fontSize: "1.1rem", textAlign: "center" }} />
        <button className="btn-primary" onClick={submit} style={{ padding: "10px 24px" }}>Check</button>
      </div>
    </div>
  );
}

// ─── 15. CARD FLIP ────────────────────────────────────────────────────────────
function CardFlip() {
  const [cards, setCards] = useState(Array(16).fill(false));
  const [flips, setFlips] = useState(0);
  const [won, setWon] = useState(false);

  const handleFlip = (i) => {
    const newCards = [...cards];
    newCards[i] = !newCards[i];
    
    // Flip adjacent cards
    if (i > 3) newCards[i-4] = !newCards[i-4]; // top
    if (i < 12) newCards[i+4] = !newCards[i+4]; // bottom
    if (i % 4 !== 0) newCards[i-1] = !newCards[i-1]; // left
    if (i % 4 !== 3) newCards[i+1] = !newCards[i+1]; // right
    
    setCards(newCards);
    setFlips(f => f + 1);
    
    if (newCards.every(c => c)) setWon(true);
  };

  const reset = () => {
    const randomCards = Array(16).fill(false).map(() => Math.random() > 0.5);
    setCards(randomCards);
    setFlips(0);
    setWon(false);
  };

  useEffect(() => { reset(); }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="card" style={{ padding: "8px 20px" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#4cc9f0" }}>{flips}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Flips</div>
        </div>
        <button className="btn-ghost" onClick={reset}>↺ New</button>
      </div>

      {won && (
        <div style={{ textAlign: "center", padding: 12, background: "rgba(0,212,170,0.1)", borderRadius: 10, marginBottom: 14, color: "#00d4aa", fontWeight: 700 }}>
          🎉 All cards flipped in {flips} moves!
        </div>
      )}

      <div style={{ fontSize: "0.8rem", color: "#8892b0", marginBottom: 14 }}>Click a card to flip it and its neighbors. Flip all cards!</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {cards.map((flipped, i) => (
          <button key={i} onClick={() => handleFlip(i)} style={{
            aspectRatio: "1",
            borderRadius: 10,
            border: `2px solid ${flipped ? "rgba(0,212,170,0.5)" : "rgba(255,255,255,0.1)"}`,
            background: flipped ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.04)",
            fontSize: "1.5rem",
            cursor: "pointer",
            transition: "all 0.3s",
          }}>
            {flipped ? "✓" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 16. MENTAL MATH ──────────────────────────────────────────────────────────
function MentalMath() {
  const genProblem = () => {
    const ops = [
      () => {
        const a = Math.floor(Math.random() * 90) + 10;
        const b = Math.floor(Math.random() * 90) + 10;
        return { q: `${a} + ${b}`, ans: a + b };
      },
      () => {
        const a = Math.floor(Math.random() * 90) + 10;
        const b = Math.floor(Math.random() * a);
        return { q: `${a} - ${b}`, ans: a - b };
      },
      () => {
        const a = Math.floor(Math.random() * 12) + 2;
        const b = Math.floor(Math.random() * 12) + 2;
        return { q: `${a} × ${b}`, ans: a * b };
      },
    ];
    return ops[Math.floor(Math.random() * ops.length)]();
  };

  const [problem, setProblem] = useState(genProblem);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timer, setTimer] = useState(60);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const opts = [problem.ans];
    while (opts.length < 4) {
      const wrong = problem.ans + Math.floor(Math.random() * 20) - 10;
      if (!opts.includes(wrong) && wrong > 0) opts.push(wrong);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  }, [problem]);

  useEffect(() => {
    if (started && !gameOver) {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { setGameOver(true); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [started, gameOver]);

  const handleAnswer = (ans) => {
    if (!started) setStarted(true);
    if (ans === problem.ans) {
      setScore(s => s + 10 + combo);
      setCombo(c => c + 1);
    } else {
      setCombo(0);
    }
    setProblem(genProblem());
  };

  const restart = () => {
    setScore(0); setCombo(0); setTimer(60); setStarted(false); setGameOver(false);
    setProblem(genProblem());
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {[{ l: "Score", v: score, c: "#ffd166" }, { l: "Combo", v: `🔥${combo}`, c: "#f72585" }, { l: "Time", v: `${timer}s`, c: timer < 15 ? "#ff6b6b" : "#00d4aa" }].map(s => (
          <div key={s.l} className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {gameOver ? (
        <div style={{ textAlign: "center", padding: 30 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🧮</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e8eaf6", marginBottom: 20 }}>Final: {score}</div>
          <button className="btn-primary" onClick={restart}>Play Again</button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", padding: 30, background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 16 }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#e8eaf6" }}>{problem.q} = ?</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(opt)} className="btn-primary" style={{ padding: 16, fontSize: "1.2rem" }}>
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 17. VISUAL MEMORY ────────────────────────────────────────────────────────
function VisualMemory() {
  const SIZE = 5;
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState([]);
  const [shown, setShown] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);

  const genPattern = (lv) => {
    const count = lv + 2;
    const cells = [];
    while (cells.length < count) {
      const cell = Math.floor(Math.random() * SIZE * SIZE);
      if (!cells.includes(cell)) cells.push(cell);
    }
    return cells;
  };

  const showPattern = async (pat) => {
    setPattern(pat);
    setShown(true);
    setPhase("showing");
    await new Promise(r => setTimeout(r, 2000 + level * 300));
    setShown(false);
    setPhase("recall");
  };

  const start = () => {
    const pat = genPattern(level);
    setSelected([]);
    setScore(0);
    setLevel(1);
    showPattern(pat);
  };

  const handleClick = (i) => {
    if (phase !== "recall") return;
    const ns = [...selected, i];
    setSelected(ns);
    
    if (ns.length === pattern.length) {
      const correct = ns.every(v => pattern.includes(v));
      if (correct) {
        setScore(s => s + level);
        const nl = level + 1;
        setLevel(nl);
        setTimeout(() => {
          const pat = genPattern(nl);
          setSelected([]);
          showPattern(pat);
        }, 1000);
      } else {
        setPhase("wrong");
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="card" style={{ padding: "8px 14px" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#7c5cfc" }}>{score}</div>
            <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div>
          </div>
          <div className="card" style={{ padding: "8px 14px" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#ffd166" }}>{level}</div>
            <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Level</div>
          </div>
        </div>
        <div style={{ fontSize: "0.85rem", color: "#8892b0" }}>
          {phase === "showing" ? "👀 Memorize..." : phase === "recall" ? "🎯 Click the squares!" : ""}
        </div>
      </div>

      {phase === "wrong" && (
        <div style={{ textAlign: "center", padding: 12, background: "rgba(255,107,107,0.1)", borderRadius: 10, marginBottom: 14, color: "#ff6b6b", fontWeight: 700 }}>
          ❌ Wrong! Final level: {level}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 6, marginBottom: 16, maxWidth: 300, margin: "0 auto 16px" }}>
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const isPattern = pattern.includes(i);
          const isSelected = selected.includes(i);
          const show = shown && isPattern;
          
          return (
            <button key={i} onClick={() => handleClick(i)} style={{
              aspectRatio: "1",
              borderRadius: 8,
              border: `2px solid ${show || isSelected ? "rgba(124,92,252,0.6)" : "rgba(255,255,255,0.1)"}`,
              background: show || isSelected ? "rgba(124,92,252,0.3)" : "rgba(255,255,255,0.04)",
              cursor: phase === "recall" ? "pointer" : "default",
              transition: "all 0.2s",
            }} />
          );
        })}
      </div>

      {phase === "idle" && (
        <button className="btn-primary" onClick={start} style={{ width: "100%", padding: 12 }}>
          {phase === "wrong" ? "🔄 Try Again" : "▶ Start"}
        </button>
      )}
    </div>
  );
}

// ─── 18. QUICK DRAW ───────────────────────────────────────────────────────────
function QuickDraw() {
  const SHAPES = ["🔴", "🟦", "🟢", "🟡", "🟣", "🟤"];
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(45);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const newRound = () => {
    const t = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setTarget(t);
    const opts = [t];
    while (opts.length < 6) {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      if (!opts.includes(shape)) opts.push(shape);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    if (started && !gameOver) {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { setGameOver(true); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [started, gameOver]);

  const handleClick = (shape) => {
    if (!started) setStarted(true);
    if (shape === target) {
      setScore(s => s + 1);
    }
    newRound();
  };

  const restart = () => {
    setScore(0); setTimer(45); setStarted(false); setGameOver(false);
    newRound();
  };

  useEffect(() => { newRound(); }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#00d4aa" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: timer < 10 ? "#ff6b6b" : "#ffd166" }}>{timer}s</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Time</div>
        </div>
      </div>

      {gameOver ? (
        <div style={{ textAlign: "center", padding: 30 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e8eaf6", marginBottom: 20 }}>Score: {score}</div>
          <button className="btn-primary" onClick={restart}>Play Again</button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", padding: 30, background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 16 }}>
            <div style={{ fontSize: "0.8rem", color: "#8892b0", marginBottom: 12 }}>Find this shape:</div>
            <div style={{ fontSize: "4rem" }}>{target}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {options.map((shape, i) => (
              <button key={i} onClick={() => handleClick(shape)} style={{
                padding: 20,
                fontSize: "2.5rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}>
                {shape}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 19. LETTER CHAIN ─────────────────────────────────────────────────────────
function LetterChain() {
  const WORDS = ["APPLE","ELEPHANT","TIGER","ROBOT","TABLE","EARTH","HOUSE","SMILE","ENERGY","YELLOW"];
  
  const [chain, setChain] = useState(["APPLE"]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [used, setUsed] = useState(["APPLE"]);
  const [error, setError] = useState(null);

  const submit = () => {
    const word = input.toUpperCase().trim();
    const lastWord = chain[chain.length - 1];
    const lastLetter = lastWord[lastWord.length - 1];
    
    if (word.length < 3) {
      setError("Too short! (min 3 letters)");
      return;
    }
    if (!word.startsWith(lastLetter)) {
      setError(`Must start with "${lastLetter}"`);
      return;
    }
    if (used.includes(word)) {
      setError("Already used!");
      return;
    }
    
    setChain([...chain, word]);
    setUsed([...used, word]);
    setScore(s => s + word.length);
    setInput("");
    setError(null);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#7c5cfc" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffd166" }}>{chain.length}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Chain</div>
        </div>
      </div>

      <div style={{ fontSize: "0.85rem", color: "#8892b0", marginBottom: 14, lineHeight: 1.6 }}>
        Each word must start with the last letter of the previous word. No repeats!
      </div>

      <div style={{ padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 14, maxHeight: 200, overflow: "auto" }}>
        {chain.map((word, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: "0.75rem", color: "#4a5568" }}>{i + 1}.</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e8eaf6" }}>{word}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: 8, background: "rgba(255,107,107,0.1)", borderRadius: 8, marginBottom: 12, color: "#ff6b6b", fontSize: "0.85rem", textAlign: "center" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder={`Start with "${chain[chain.length - 1][chain[chain.length - 1].length - 1]}"...`} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", color: "#e8eaf6", fontSize: "1rem", textTransform: "uppercase" }} />
        <button className="btn-primary" onClick={submit}>Add →</button>
      </div>
    </div>
  );
}

// ─── 20. RHYTHM TAPPER ────────────────────────────────────────────────────────
function RhythmTapper() {
  const [pattern, setPattern] = useState([]);
  const [taps, setTaps] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const genPattern = (lv) => {
    const len = lv + 2;
    return Array.from({ length: len }, () => Math.floor(Math.random() * 500) + 200);
  };

  const playPattern = async (pat) => {
    setPhase("showing");
    setTaps([]);
    
    for (let i = 0; i < pat.length; i++) {
      setPhase(`showing-${i}`);
      await new Promise(r => setTimeout(r, pat[i]));
    }
    
    setPhase("input");
  };

  const start = () => {
    const pat = genPattern(level);
    setPattern(pat);
    setScore(0);
    setLevel(1);
    playPattern(pat);
  };

  const handleTap = () => {
    if (phase !== "input") return;
    
    const now = Date.now();
    const newTaps = [...taps, now];
    setTaps(newTaps);
    
    if (newTaps.length === pattern.length) {
      // Calculate accuracy
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i-1]);
      }
      
      let correct = true;
      for (let i = 0; i < intervals.length; i++) {
        const diff = Math.abs(intervals[i] - pattern[i]);
        if (diff > 150) correct = false;
      }
      
      if (correct) {
        setScore(s => s + level);
        const nl = level + 1;
        setLevel(nl);
        setTimeout(() => {
          const pat = genPattern(nl);
          setPattern(pat);
          playPattern(pat);
        }, 1000);
      } else {
        setPhase("wrong");
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f72585" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#00d4aa" }}>{level}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Level</div>
        </div>
      </div>

      <div style={{ fontSize: "0.85rem", color: "#8892b0", marginBottom: 16, textAlign: "center" }}>
        {phase.startsWith("showing") ? "👀 Watch the rhythm..." : phase === "input" ? "🎵 Tap it back!" : "Press Start"}
      </div>

      {phase === "wrong" && (
        <div style={{ textAlign: "center", padding: 12, background: "rgba(255,107,107,0.1)", borderRadius: 10, marginBottom: 14, color: "#ff6b6b", fontWeight: 700 }}>
          ❌ Wrong rhythm!
        </div>
      )}

      <button onClick={phase === "input" ? handleTap : undefined} style={{
        width: "100%",
        height: 200,
        borderRadius: 16,
        border: `3px solid ${phase.startsWith("showing") ? "#ffd166" : "rgba(255,255,255,0.1)"}`,
        background: phase.startsWith("showing") ? "rgba(255,209,102,0.3)" : "rgba(255,255,255,0.04)",
        fontSize: "3rem",
        cursor: phase === "input" ? "pointer" : "default",
        transition: "all 0.1s",
        marginBottom: 16,
      }}>
        {phase === "input" ? "🥁" : "🎵"}
      </button>

      {phase === "idle" && (
        <button className="btn-primary" onClick={start} style={{ width: "100%", padding: 12 }}>
          {phase === "wrong" ? "🔄 Try Again" : "▶ Start"}
        </button>
      )}
    </div>
  );
}

// ─── 21. WORD HUNT ────────────────────────────────────────────────────────────
function WordHunt() {
  const GRID_SIZE = 4;
  const WORDS = ["CAT","DOG","RAT","BAT","HAT","PIG","COW","FOX","BEE"];
  
  const genGrid = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() =>
        letters[Math.floor(Math.random() * letters.length)]
      )
    );
  };

  const [grid] = useState(genGrid);
  const [found, setFound] = useState([]);
  const [selected, setSelected] = useState([]);
  const [currentWord, setCurrentWord] = useState("");

  const handleSelect = (r, c) => {
    const cell = `${r}-${c}`;
    if (selected.includes(cell)) return;
    
    const newSelected = [...selected, cell];
    const newWord = currentWord + grid[r][c];
    
    setSelected(newSelected);
    setCurrentWord(newWord);
    
    if (WORDS.includes(newWord) && !found.includes(newWord)) {
      setFound([...found, newWord]);
      setSelected([]);
      setCurrentWord("");
    }
  };

  const reset = () => {
    setSelected([]);
    setCurrentWord("");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="card" style={{ padding: "8px 20px" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#00d4aa" }}>{found.length}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Found</div>
        </div>
        <button className="btn-ghost" onClick={reset}>Clear</button>
      </div>

      {currentWord && (
        <div style={{ textAlign: "center", padding: 10, background: "rgba(124,92,252,0.1)", borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#7c5cfc" }}>{currentWord}</div>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {found.map(word => (
          <div key={word} style={{ padding: "4px 10px", background: "rgba(0,212,170,0.15)", borderRadius: 6, fontSize: "0.8rem", color: "#00d4aa", fontWeight: 700 }}>
            {word}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: 6, marginBottom: 14 }}>
        {grid.map((row, r) => row.map((letter, c) => {
          const cell = `${r}-${c}`;
          const isSelected = selected.includes(cell);
          
          return (
            <button key={cell} onClick={() => handleSelect(r, c)} style={{
              aspectRatio: "1",
              borderRadius: 10,
              border: `2px solid ${isSelected ? "rgba(124,92,252,0.6)" : "rgba(255,255,255,0.1)"}`,
              background: isSelected ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.04)",
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#e8eaf6",
              cursor: "pointer",
            }}>
              {letter}
            </button>
          );
        }))}
      </div>

      <div style={{ fontSize: "0.75rem", color: "#8892b0" }}>
        Find: {WORDS.join(", ")}
      </div>
    </div>
  );
}

// ─── 22. SPOT THE DIFFERENCE ──────────────────────────────────────────────────
function SpotDifference() {
  const SIZE = 6;
  const [grid1, setGrid1] = useState([]);
  const [grid2, setGrid2] = useState([]);
  const [differences, setDifferences] = useState([]);
  const [found, setFound] = useState([]);
  const [won, setWon] = useState(false);

  const genGrids = () => {
    const emojis = ["🌟","🎈","🎨","🎭","🎪","🎯","🎲","🎸","🎹","🎺","🎻","🎼"];
    const g = Array(SIZE).fill(null).map(() =>
      Array(SIZE).fill(null).map(() => emojis[Math.floor(Math.random() * emojis.length)])
    );
    
    const g2 = g.map(row => [...row]);
    const diffs = [];
    
    for (let i = 0; i < 5; i++) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      const cell = `${r}-${c}`;
      
      if (!diffs.includes(cell)) {
        g2[r][c] = emojis[Math.floor(Math.random() * emojis.length)];
        diffs.push(cell);
      }
    }
    
    setGrid1(g);
    setGrid2(g2);
    setDifferences(diffs);
    setFound([]);
    setWon(false);
  };

  useEffect(() => { genGrids(); }, []);

  const handleClick = (r, c) => {
    const cell = `${r}-${c}`;
    if (found.includes(cell)) return;
    
    if (differences.includes(cell)) {
      const newFound = [...found, cell];
      setFound(newFound);
      if (newFound.length === differences.length) setWon(true);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="card" style={{ padding: "8px 20px" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffd166" }}>{found.length}/{differences.length}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Found</div>
        </div>
        <button className="btn-ghost" onClick={genGrids}>↺ New</button>
      </div>

      {won && (
        <div style={{ textAlign: "center", padding: 12, background: "rgba(0,212,170,0.1)", borderRadius: 10, marginBottom: 14, color: "#00d4aa", fontWeight: 700 }}>
          🎉 All differences found!
        </div>
      )}

      <div style={{ fontSize: "0.8rem", color: "#8892b0", marginBottom: 14, textAlign: "center" }}>
        Find 5 differences between the grids
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[grid1, grid2].map((grid, gridIdx) => (
          <div key={gridIdx}>
            <div style={{ fontSize: "0.7rem", color: "#4a5568", marginBottom: 6, textAlign: "center" }}>
              Grid {gridIdx + 1}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 3 }}>
              {grid.map((row, r) => row.map((emoji, c) => {
                const cell = `${r}-${c}`;
                const isFound = found.includes(cell);
                
                return (
                  <button key={cell} onClick={() => gridIdx === 1 && handleClick(r, c)} style={{
                    aspectRatio: "1",
                    fontSize: "1rem",
                    borderRadius: 6,
                    border: `1px solid ${isFound ? "rgba(0,212,170,0.5)" : "rgba(255,255,255,0.1)"}`,
                    background: isFound ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.04)",
                    cursor: gridIdx === 1 ? "pointer" : "default",
                  }}>
                    {emoji}
                  </button>
                );
              }))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 23. ANAGRAM SOLVER ───────────────────────────────────────────────────────
function AnagramSolver() {
  const ANAGRAMS = [
    { word: "LISTEN", anagram: "SILENT" },
    { word: "EARTH", anagram: "HEART" },
    { word: "NIGHT", anagram: "THING" },
    { word: "BREAD", anagram: "BEARD" },
    { word: "STONE", anagram: "NOTES" },
    { word: "SWING", anagram: "WINGS" },
    { word: "ACTOR", anagram: "TRACT" },
  ];

  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const newQuestion = () => {
    const item = ANAGRAMS[Math.floor(Math.random() * ANAGRAMS.length)];
    setCurrent(item);
    setInput("");
    setFeedback(null);
  };

  useEffect(() => { newQuestion(); }, []);

  const submit = () => {
    if (input.toUpperCase() === current.anagram) {
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      setFeedback("correct");
      setTimeout(newQuestion, 800);
    } else {
      setStreak(0);
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#7c5cfc" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f72585" }}>🔥 {streak}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Streak</div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: 30, background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 16 }}>
        <div style={{ fontSize: "0.8rem", color: "#8892b0", marginBottom: 12 }}>Rearrange to make a new word:</div>
        <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#7c5cfc", letterSpacing: 6 }}>
          {current?.word}
        </div>
        {feedback && (
          <div style={{ fontSize: "0.9rem", color: feedback === "correct" ? "#00d4aa" : "#ff6b6b", marginTop: 12 }}>
            {feedback === "correct" ? "✓ Correct!" : `✗ Answer: ${current.anagram}`}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Your answer..." style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 16px", color: "#e8eaf6", fontSize: "1rem", textTransform: "uppercase", textAlign: "center", letterSpacing: 4 }} />
        <button className="btn-primary" onClick={submit}>Check</button>
      </div>
    </div>
  );
}

// ─── 24. GRID NAVIGATOR ───────────────────────────────────────────────────────
function GridNavigator() {
  const SIZE = 5;
  const [pos, setPos] = useState({ r: 0, c: 0 });
  const [target, setTarget] = useState({ r: 4, c: 4 });
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [obstacles, setObstacles] = useState([]);

  const genGame = () => {
    const obs = [];
    for (let i = 0; i < 5; i++) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      const cell = `${r}-${c}`;
      if (cell !== "0-0" && cell !== "4-4" && !obs.includes(cell)) {
        obs.push(cell);
      }
    }
    setObstacles(obs);
    setPos({ r: 0, c: 0 });
    setTarget({ r: 4, c: 4 });
    setMoves(0);
    setWon(false);
  };

  useEffect(() => { genGame(); }, []);

  const move = (dr, dc) => {
    const nr = pos.r + dr;
    const nc = pos.c + dc;
    
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return;
    if (obstacles.includes(`${nr}-${nc}`)) return;
    
    setPos({ r: nr, c: nc });
    setMoves(m => m + 1);
    
    if (nr === target.r && nc === target.c) setWon(true);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowUp") move(-1, 0);
      if (e.key === "ArrowDown") move(1, 0);
      if (e.key === "ArrowLeft") move(0, -1);
      if (e.key === "ArrowRight") move(0, 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pos, obstacles]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="card" style={{ padding: "8px 20px" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#4cc9f0" }}>{moves}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Moves</div>
        </div>
        <button className="btn-ghost" onClick={genGame}>↺ New</button>
      </div>

      {won && (
        <div style={{ textAlign: "center", padding: 12, background: "rgba(0,212,170,0.1)", borderRadius: 10, marginBottom: 14, color: "#00d4aa", fontWeight: 700 }}>
          🎉 Target reached in {moves} moves!
        </div>
      )}

      <div style={{ fontSize: "0.8rem", color: "#8892b0", marginBottom: 14, textAlign: "center" }}>
        Use arrow keys or buttons to reach the target 🎯
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 6, marginBottom: 16, maxWidth: 300, margin: "0 auto 16px" }}>
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const r = Math.floor(i / SIZE);
          const c = i % SIZE;
          const cell = `${r}-${c}`;
          const isPlayer = pos.r === r && pos.c === c;
          const isTarget = target.r === r && target.c === c;
          const isObstacle = obstacles.includes(cell);
          
          return (
            <div key={cell} style={{
              aspectRatio: "1",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: isObstacle ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}>
              {isPlayer ? "🚀" : isTarget ? "🎯" : isObstacle ? "🧱" : ""}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, maxWidth: 200, margin: "0 auto" }}>
        <div />
        <button className="btn-primary" onClick={() => move(-1, 0)} style={{ padding: 12 }}>↑</button>
        <div />
        <button className="btn-primary" onClick={() => move(0, -1)} style={{ padding: 12 }}>←</button>
        <button className="btn-primary" onClick={() => move(1, 0)} style={{ padding: 12 }}>↓</button>
        <button className="btn-primary" onClick={() => move(0, 1)} style={{ padding: 12 }}>→</button>
      </div>
    </div>
  );
}

// ─── 25. EMOJI MATCH ──────────────────────────────────────────────────────────
function EmojiMatch() {
  const EMOJIS = ["😀","😎","🤔","😴","🤗","😇","🥳","😜"];
  const [target, setTarget] = useState(null);
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(20);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const newRound = () => {
    const t = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setTarget(t);
    
    const g = Array(16).fill(null).map(() =>
      EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    );
    
    // Ensure target exists at least once
    const targetIdx = Math.floor(Math.random() * 16);
    g[targetIdx] = t;
    
    setGrid(g);
  };

  useEffect(() => { newRound(); }, []);

  useEffect(() => {
    if (started && !gameOver) {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { setGameOver(true); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [started, gameOver]);

  const handleClick = (emoji) => {
    if (!started) setStarted(true);
    if (emoji === target) {
      setScore(s => s + 1);
      newRound();
    }
  };

  const restart = () => {
    setScore(0); setTimer(20); setStarted(false); setGameOver(false);
    newRound();
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffd166" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: timer < 5 ? "#ff6b6b" : "#00d4aa" }}>{timer}s</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Time</div>
        </div>
      </div>

      {gameOver ? (
        <div style={{ textAlign: "center", padding: 30 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>😊</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e8eaf6", marginBottom: 20 }}>Score: {score}</div>
          <button className="btn-primary" onClick={restart}>Play Again</button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", padding: 20, background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 16 }}>
            <div style={{ fontSize: "0.8rem", color: "#8892b0", marginBottom: 8 }}>Find this emoji:</div>
            <div style={{ fontSize: "3rem" }}>{target}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {grid.map((emoji, i) => (
              <button key={i} onClick={() => handleClick(emoji)} style={{
                aspectRatio: "1",
                fontSize: "2rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}>
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 26. LOGIC GATES ──────────────────────────────────────────────────────────
function LogicGates() {
  const genProblem = () => {
    const gates = ["AND", "OR", "XOR"];
    const gate = gates[Math.floor(Math.random() * gates.length)];
    const a = Math.random() > 0.5;
    const b = Math.random() > 0.5;
    
    let result;
    if (gate === "AND") result = a && b;
    else if (gate === "OR") result = a || b;
    else result = a !== b; // XOR
    
    return { gate, a, b, result };
  };

  const [problem, setProblem] = useState(genProblem);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const handleAnswer = (ans) => {
    if (ans === problem.result) {
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      setFeedback("correct");
    } else {
      setStreak(0);
      setFeedback("wrong");
    }
    
    setTimeout(() => {
      setFeedback(null);
      setProblem(genProblem());
    }, 800);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#7c5cfc" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Score</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f72585" }}>🔥 {streak}</div>
          <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>Streak</div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: 30, background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 16 }}>
        <div style={{ fontSize: "0.8rem", color: "#8892b0", marginBottom: 16 }}>Logical {problem.gate} operation:</div>
        <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#e8eaf6", marginBottom: 12 }}>
          {problem.a ? "TRUE" : "FALSE"} {problem.gate} {problem.b ? "TRUE" : "FALSE"}
        </div>
        <div style={{ fontSize: "1rem", color: "#8892b0" }}>= ?</div>
        {feedback && (
          <div style={{ fontSize: "0.9rem", color: feedback === "correct" ? "#00d4aa" : "#ff6b6b", marginTop: 12 }}>
            {feedback === "correct" ? "✓ Correct!" : "✗ Wrong!"}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button className="btn-primary" onClick={() => handleAnswer(true)} style={{ padding: 16, fontSize: "1.1rem", background: "linear-gradient(135deg,#00d4aa,#06d6a0)" }}>
          TRUE
        </button>
        <button className="btn-primary" onClick={() => handleAnswer(false)} style={{ padding: 16, fontSize: "1.1rem", background: "linear-gradient(135deg,#ff6b6b,#f72585)" }}>
          FALSE
        </button>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8, fontSize: "0.75rem", color: "#8892b0", lineHeight: 1.6 }}>
        <div><strong>AND:</strong> Both must be TRUE</div>
        <div><strong>OR:</strong> At least one must be TRUE</div>
        <div><strong>XOR:</strong> Exactly one must be TRUE</div>
      </div>
    </div>
  );
}

// ─── 27. REFLEX TRAINER ───────────────────────────────────────────────────────
function ReflexTrainer() {
  const [active, setActive] = useState(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timer, setTimer] = useState(30);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (started && !gameOver) {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { setGameOver(true); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [started, gameOver]);

  useEffect(() => {
    if (!started || gameOver) return undefined;
    if (active === null) {
      const spawn = setTimeout(() => setActive(Math.floor(Math.random() * 9)), 300);
      return () => clearTimeout(spawn);
    }
    const miss = setTimeout(() => {
      setActive(null);
      setMisses(value => value + 1);
    }, 1000);
    return () => clearTimeout(miss);
  }, [started, gameOver, active]);

  const start = () => {
    setScore(0);
    setMisses(0);
    setTimer(30);
    setStarted(true);
    setGameOver(false);
    setActive(null);
  };

  const handleClick = (idx) => {
    if (idx === active) {
      setScore(s => s + 1);
      setActive(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {[{ l: "Score", v: score, c: "#00d4aa" }, { l: "Misses", v: misses, c: "#ff6b6b" }, { l: "Time", v: `${timer}s`, c: timer < 10 ? "#ffd166" : "#7c5cfc" }].map(s => (
          <div key={s.l} className="card" style={{ flex: 1, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {gameOver ? (
        <div style={{ textAlign: "center", padding: 30 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e8eaf6", marginBottom: 8 }}>Score: {score}</div>
          <div style={{ fontSize: "0.9rem", color: "#8892b0", marginBottom: 20 }}>Accuracy: {score + misses > 0 ? Math.round((score / (score + misses)) * 100) : 0}%</div>
          <button className="btn-primary" onClick={start}>Play Again</button>
        </div>
      ) : !started ? (
        <div style={{ textAlign: "center", padding: 30 }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: "0.9rem", color: "#8892b0", marginBottom: 20 }}>Click the red targets as fast as you can!</div>
          <button className="btn-primary" onClick={start}>Start</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {Array.from({ length: 9 }, (_, i) => (
            <button key={i} onClick={() => handleClick(i)} style={{
              aspectRatio: "1",
              borderRadius: 12,
              border: `2px solid ${active === i ? "#ff6b6b" : "rgba(255,255,255,0.1)"}`,
              background: active === i ? "rgba(255,107,107,0.3)" : "rgba(255,255,255,0.04)",
              cursor: "pointer",
              transition: "all 0.1s",
              fontSize: "2rem",
            }}>
              {active === i ? "🎯" : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 28. N-BACK FOCUS ────────────────────────────────────────────────────────
const FOCUS_SYMBOLS = ["🌿", "🌊", "☀️", "🌙", "✨", "🪷"];
function NBackFocus() {
  const makeRound = () => {
    const sequence = [];
    for (let i = 0; i < 16; i += 1) {
      sequence.push(i > 1 && Math.random() < 0.35 ? sequence[i - 2] : FOCUS_SYMBOLS[Math.floor(Math.random() * FOCUS_SYMBOLS.length)]);
    }
    return sequence;
  };
  const [round, setRound] = useState(makeRound);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const isMatch = index > 1 && round[index] === round[index - 2];
  const answer = (choice) => {
    if (answered || index < 2) return;
    if (choice === isMatch) setScore(value => value + 1);
    setAnswered(true);
    setTimeout(() => { setIndex(value => Math.min(round.length, value + 1)); setAnswered(false); }, 450);
  };
  const reset = () => { setRound(makeRound()); setIndex(0); setScore(0); setAnswered(false); };
  if (index >= round.length) return <div style={{ textAlign:"center",padding:28 }}><div style={{fontSize:"3rem"}}>🧠</div><h3 style={{margin:"10px 0"}}>Focus score: {score}/{round.length - 2}</h3><button className="btn-primary" onClick={reset}>Play again</button></div>;
  return <div style={{textAlign:"center"}}>
    <div style={{display:"flex",justifyContent:"space-between",color:"#8892b0",fontSize:12,marginBottom:18}}><span>Round {index + 1}/{round.length}</span><span>Score {score}</span></div>
    <p style={{color:"#8892b0",fontSize:13}}>Does this symbol match the one shown two turns ago?</p>
    <div style={{fontSize:"5rem",padding:"28px 0"}}>{round[index]}</div>
    {index < 2 ? <button className="btn-primary" onClick={() => setIndex(value => value + 1)}>Remember →</button> : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><button className="btn-primary" onClick={() => answer(true)}>Match</button><button className="btn-ghost" onClick={() => answer(false)}>Different</button></div>}
  </div>;
}

// ─── 29. MINDFUL WORD RECALL ────────────────────────────────────────────────
const WORD_BANK = ["calm", "river", "kind", "bloom", "light", "breathe", "forest", "gentle", "hope", "quiet", "cloud", "balance", "warm", "present", "smile", "rest"];
function WordRecall() {
  const makeGame = () => [...WORD_BANK].sort(() => Math.random() - .5);
  const [words, setWords] = useState(makeGame);
  const [phase, setPhase] = useState("study");
  const [chosen, setChosen] = useState([]);
  const targets = words.slice(0, 6);
  const choices = [...words.slice(8, 11), ...words.slice(0, 6), ...words.slice(11, 14)];
  const reset = () => { setWords(makeGame()); setChosen([]); setPhase("study"); };
  if (phase === "result") return <div style={{textAlign:"center",padding:26}}><div style={{fontSize:"3rem"}}>🌱</div><h3 style={{margin:"10px 0"}}>You recalled {chosen.filter(word => targets.includes(word)).length}/6</h3><button className="btn-primary" onClick={reset}>New words</button></div>;
  return <div style={{textAlign:"center"}}><p style={{color:"#8892b0",marginBottom:20}}>{phase === "study" ? "Take a calm moment to remember these six words." : "Select only the words you remember."}</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>{(phase === "study" ? targets : choices).map(word => <button key={word} disabled={phase === "study"} onClick={() => setChosen(items => items.includes(word) ? items.filter(item => item !== word) : [...items,word])} style={{padding:"14px 8px",borderRadius:12,border:`1px solid ${chosen.includes(word) ? "#34d399" : "rgba(255,255,255,.1)"}`,background:chosen.includes(word)?"rgba(52,211,153,.12)":"rgba(255,255,255,.035)",color:"#e8eaf6",cursor:phase === "study"?"default":"pointer"}}>{word}</button>)}</div>
    <button className="btn-primary" onClick={() => setPhase(phase === "study" ? "recall" : "result")}>{phase === "study" ? "I'm ready" : "Check recall"}</button>
  </div>;
}

// ─── 30. ODD ONE OUT ────────────────────────────────────────────────────────
const ODD_SETS = [["🍃","🌿"],["🌊","💧"],["🌙","⭐"],["🟣","🔵"],["😊","🙂"]];
function OddOneOut() {
  const create = () => { const [common, odd] = ODD_SETS[Math.floor(Math.random()*ODD_SETS.length)]; const oddAt=Math.floor(Math.random()*20); return {cells:Array.from({length:20},(_,i)=>i===oddAt?odd:common),oddAt}; };
  const [board,setBoard]=useState(create); const [score,setScore]=useState(0); const [round,setRound]=useState(1); const [feedback,setFeedback]=useState("");
  const choose = i => { const correct=i===board.oddAt; setFeedback(correct?"Sharp focus!":"Look a little closer"); if(correct)setScore(value=>value+1); setTimeout(()=>{ if(round<10){setRound(value=>value+1);setBoard(create());setFeedback("");} },500); };
  const reset=()=>{setBoard(create());setScore(0);setRound(1);setFeedback("");};
  if(round===10&&feedback) return <div style={{textAlign:"center",padding:28}}><div style={{fontSize:"3rem"}}>👁️</div><h3 style={{margin:"10px 0"}}>Visual score: {score}/10</h3><button className="btn-primary" onClick={reset}>Play again</button></div>;
  return <div><div style={{display:"flex",justifyContent:"space-between",color:"#8892b0",fontSize:12,marginBottom:16}}><span>Round {round}/10</span><span>Score {score}</span></div><p style={{textAlign:"center",color:feedback==="Sharp focus!"?"#34d399":"#8892b0",height:22}}>{feedback||"Find the symbol that is different"}</p><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>{board.cells.map((cell,i)=><button key={i} onClick={()=>choose(i)} style={{aspectRatio:"1",fontSize:"1.8rem",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",cursor:"pointer"}}>{cell}</button>)}</div></div>;
}

// ─── UPDATE GAME REGISTRY ────────────────────────────────────────────────────
const gameList = [
  // ... (keep all your existing games 1-12)
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
  
  // NEW GAMES 13-27
  { id: "colorMatch", title: "Color Matcher", desc: "Match word with color quickly", icon: "🎨", color: "#e63946", component: ColorMatcher, tag: "Speed" },
  { id: "numSeq", title: "Number Sequence", desc: "Find the next number", icon: "🔢", color: "#f4a261", component: SequenceNumbers, tag: "Math" },
  { id: "cardFlip", title: "Card Flip", desc: "Flip all cards to win", icon: "🃏", color: "#2a9d8f", component: CardFlip, tag: "Logic" },
  { id: "mentalMath", title: "Mental Math", desc: "Quick calculation challenge", icon: "🧮", color: "#e76f51", component: MentalMath, tag: "Math" },
  { id: "visualMem", title: "Visual Memory", desc: "Remember the pattern", icon: "👁️", color: "#264653", component: VisualMemory, tag: "Memory" },
  { id: "quickDraw", title: "Quick Draw", desc: "Find the shape fast", icon: "⚡", color: "#e9c46a", component: QuickDraw, tag: "Speed" },
  { id: "letterChain", title: "Letter Chain", desc: "Build a word chain", icon: "🔗", color: "#f4a259", component: LetterChain, tag: "Language" },
  { id: "rhythm", title: "Rhythm Tapper", desc: "Match the rhythm pattern", icon: "🥁", color: "#bc4749", component: RhythmTapper, tag: "Memory" },
  { id: "wordHunt", title: "Word Hunt", desc: "Find words in the grid", icon: "🔍", color: "#6a994e", component: WordHunt, tag: "Language" },
  { id: "spotDiff", title: "Spot Difference", desc: "Find the differences", icon: "👀", color: "#a7c957", component: SpotDifference, tag: "Focus" },
  { id: "anagram", title: "Anagram Solver", desc: "Rearrange the letters", icon: "🔤", color: "#386641", component: AnagramSolver, tag: "Language" },
  { id: "gridNav", title: "Grid Navigator", desc: "Reach the target", icon: "🧭", color: "#588157", component: GridNavigator, tag: "Strategy" },
  { id: "emojiMatch", title: "Emoji Match", desc: "Find the matching emoji", icon: "😊", color: "#fb8500", component: EmojiMatch, tag: "Speed" },
  { id: "logicGates", title: "Logic Gates", desc: "Solve boolean operations", icon: "🔌", color: "#8338ec", component: LogicGates, tag: "Logic" },
  { id: "reflex", title: "Reflex Trainer", desc: "Click targets quickly", icon: "🎯", color: "#ff006e", component: ReflexTrainer, tag: "Speed" },
  { id: "nBack", title: "2-Back Focus", desc: "Strengthen working memory one symbol at a time", icon: "🧠", color: "#a78bfa", component: NBackFocus, tag: "Focus" },
  { id: "wordRecall", title: "Mindful Recall", desc: "Remember calming words and test your recall", icon: "🌱", color: "#34d399", component: WordRecall, tag: "Memory" },
  { id: "oddOne", title: "Odd One Out", desc: "Train visual attention across ten rounds", icon: "👁️", color: "#38bdf8", component: OddOneOut, tag: "Focus" },
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
        <p className="page-subtitle">30 interactive exercises for focus, memory, language, speed and logic</p>
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
            <p style={{ fontSize: "0.88rem", color: "#8892b0", lineHeight: 1.7 }}>Short cognitive exercises can help practise attention, working memory and flexible thinking. Treat these games as a gentle mental warm-up—not a medical assessment—and pause whenever you feel tired.</p>
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
