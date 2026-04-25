import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { Mic, MicOff } from "lucide-react";

const API_BASE_URL = "/api";

const emotions = [
  { label: "Happy", icon: "😊", color: "#ffd166" },
  { label: "Calm", icon: "😌", color: "#00d4aa" },
  { label: "Anxious", icon: "😰", color: "#ff6b6b" },
  { label: "Sad", icon: "😢", color: "#4cc9f0" },
  { label: "Focused", icon: "🎯", color: "#7c5cfc" },
];

const suggestedMessages = [
  "I'm feeling overwhelmed today",
  "I need some motivation",
  "Talk me through anxiety",
  "Help me calm down",
  "I want to share something",
];

const avatarResponses = {
  greeting: "Hello! I'm so glad you're here today. How are you doing?",
};

function AvatarScene({ emotion, isSpeaking }) {
  const mountRef = useRef(null);
  const headRef = useRef(null);
  const frameRef = useRef(null);
  const speakingRef = useRef(false);

  useEffect(() => {
    speakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    if (!mountRef.current) return;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x8892b0, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00d4aa, 2.5, 10);
    pointLight1.position.set(2, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7c5cfc, 1.5, 10);
    pointLight2.position.set(-2, 1, 2);
    scene.add(pointLight2);

    const rimLight = new THREE.DirectionalLight(0x4cc9f0, 0.5);
    rimLight.position.set(0, 5, -3);
    scene.add(rimLight);

    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0xf0c8a0, roughness: 0.7 })
    );
    neck.position.y = -0.35;
    bodyGroup.add(neck);

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.45, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x2d3a5c, roughness: 0.6, metalness: 0.1 })
    );
    torso.position.y = -0.85;
    bodyGroup.add(torso);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.1;
    bodyGroup.add(headGroup);
    headRef.current = headGroup;

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xf0c8a0, roughness: 0.65, metalness: 0.0 })
    );
    headGroup.add(head);

    const eyeGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.13, 0.08, 0.37);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.13, 0.08, 0.37);
    headGroup.add(rightEye);

    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const shineGeo = new THREE.SphereGeometry(0.022, 8, 8);

    const ls = new THREE.Mesh(shineGeo, shineMat);
    ls.position.set(-0.115, 0.095, 0.43);
    headGroup.add(ls);

    const rs = new THREE.Mesh(shineGeo, shineMat);
    rs.position.set(0.145, 0.095, 0.43);
    headGroup.add(rs);

    const browMat = new THREE.MeshStandardMaterial({ color: 0x6b4226 });
    const browGeo = new THREE.BoxGeometry(0.12, 0.02, 0.02);

    const lBrow = new THREE.Mesh(browGeo, browMat);
    lBrow.position.set(-0.13, 0.2, 0.39);
    headGroup.add(lBrow);

    const rBrow = new THREE.Mesh(browGeo, browMat);
    rBrow.position.set(0.13, 0.2, 0.39);
    headGroup.add(rBrow);

    const mouth = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.018, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xd45c5c })
    );
    mouth.position.set(0, -0.12, 0.38);
    mouth.rotation.z = Math.PI;
    headGroup.add(mouth);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.9 })
    );
    hair.position.y = 0.05;
    headGroup.add(hair);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00d4aa,
      transparent: true,
      opacity: 0.4,
    });

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.9, 0.012, 8, 64),
      ringMat
    );
    ring.position.y = 0.1;
    ring.rotation.x = Math.PI / 2;
    bodyGroup.add(ring);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.006, 8, 64),
      new THREE.MeshBasicMaterial({
        color: 0x7c5cfc,
        transparent: true,
        opacity: 0.25,
      })
    );
    ring2.position.y = 0.1;
    ring2.rotation.x = Math.PI / 2;
    bodyGroup.add(ring2);

    const particles = [];
    for (let i = 0; i < 40; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 6, 6),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x00d4aa : 0x7c5cfc,
          transparent: true,
          opacity: Math.random() * 0.5 + 0.2,
        })
      );

      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 0.8;

      p.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3,
        Math.sin(angle) * radius
      );

      p.userData = {
        baseY: p.position.y,
        speed: Math.random() * 0.5 + 0.2,
        angle,
      };

      scene.add(p);
      particles.push(p);
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;

      if (headRef.current) {
        headRef.current.position.y = 0.1 + Math.sin(t * 0.8) * 0.04;
        headRef.current.rotation.y = Math.sin(t * 0.4) * 0.12;
      }

      mouth.scale.y = speakingRef.current ? 1 + Math.sin(t * 12) * 0.4 : 1;

      ring.rotation.z = t * 0.3;
      ring2.rotation.z = -t * 0.2;

      particles.forEach((p) => {
        p.position.y = p.userData.baseY + Math.sin(t * p.userData.speed + p.userData.angle) * 0.3;
        p.rotation.y = t * 0.5;
      });

      bodyGroup.rotation.y = Math.sin(t * 0.3) * 0.05;

      if (emotion === "Happy") ringMat.color.set("#ffd166");
      else if (emotion === "Calm") ringMat.color.set("#00d4aa");
      else if (emotion === "Anxious") ringMat.color.set("#ff6b6b");
      else if (emotion === "Sad") ringMat.color.set("#4cc9f0");
      else if (emotion === "Focused") ringMat.color.set("#7c5cfc");
      else ringMat.color.set("#00d4aa");

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const w2 = mountRef.current?.clientWidth || 400;
      const h2 = mountRef.current?.clientHeight || 400;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      particles.forEach((p) => {
        p.geometry.dispose();
        p.material.dispose();
        scene.remove(p);
      });
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [emotion]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", borderRadius: 20 }} />;
}

export default function AvatarCompanion() {
  const [messages, setMessages] = useState([
    { role: "avatar", text: avatarResponses.greeting, time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const sessionIdRef = useRef(
    localStorage.getItem("aurora_session_id") || `session_${Date.now()}`
  );

  useEffect(() => {
    localStorage.setItem("aurora_session_id", sessionIdRef.current);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: msg, time: new Date() },
    ]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: msg,
          session_id: sessionIdRef.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || `Backend error: ${response.status}`);
      }

      const reply = data.response || "I'm here with you.";

      setMessages((prev) => [
        ...prev,
        {
          role: "avatar",
          text: reply,
          time: new Date(),
          isCrisis: data.is_crisis,
        },
      ]);

      setIsTyping(false);
      setIsSpeaking(true);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.pitch = 1.1;
        utterance.rate = 0.92;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsSpeaking(false), 2500);
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setIsSpeaking(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "avatar",
          text: "I'm having trouble connecting to the backend right now.",
          time: new Date(),
        },
      ]);
    }
  }, [input]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-label">AI Module</div>
        <h1 className="page-title">AI Companion</h1>
        <p className="page-subtitle">Your empathetic 3D AI friend — voice-enabled, emotionally aware</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: 24,
          height: "calc(100vh - 200px)",
          minHeight: 560,
        }}
      >
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00d4aa",
                boxShadow: "0 0 8px #00d4aa",
              }}
            />
            <span style={{ fontSize: "0.85rem", color: "#8892b0" }}>
              Aurora is {isSpeaking ? "speaking..." : isTyping ? "thinking..." : isListening ? "listening..." : "ready"}
            </span>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {isSpeaking && <div className="badge badge-teal">🔊 Speaking</div>}
              {isListening && <div className="badge badge-teal">🎤 Listening</div>}
              {selectedEmotion && (
                <div className="badge badge-violet">
                  {emotions.find((e) => e.label === selectedEmotion)?.icon} {selectedEmotion}
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, position: "relative", minHeight: 320 }}>
            <AvatarScene emotion={selectedEmotion} isSpeaking={isSpeaking} />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                background: "linear-gradient(transparent, #131d35)",
                pointerEvents: "none",
              }}
            />
          </div>

          <div style={{ padding: "16px 24px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#4a5568",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              Select your emotion
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {emotions.map((e) => (
                <button
                  key={e.label}
                  onClick={() => setSelectedEmotion(selectedEmotion === e.label ? null : e.label)}
                  style={{
                    flex: 1,
                    padding: "10px 6px",
                    borderRadius: 10,
                    border:
                      selectedEmotion === e.label
                        ? `2px solid ${e.color}`
                        : "1px solid rgba(255,255,255,0.07)",
                    background:
                      selectedEmotion === e.label ? `${e.color}18` : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>{e.icon}</span>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      color: selectedEmotion === e.label ? e.color : "#4a5568",
                    }}
                  >
                    {e.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#e8eaf6" }}>Chat with Aurora</div>
            <div style={{ fontSize: "0.72rem", color: "#4a5568", marginTop: 2 }}>Voice-enabled conversation</div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: 8,
                  animation: "fadeInUp 0.3s ease",
                }}
              >
                {msg.role === "avatar" && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #7c5cfc, #00d4aa)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      flexShrink: 0,
                    }}
                  >
                    🧠
                  </div>
                )}

                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #7c5cfc, #5a3fcf)"
                        : "rgba(255,255,255,0.06)",
                    border: msg.role === "avatar" ? "1px solid rgba(255,255,255,0.06)" : "none",
                    fontSize: "0.85rem",
                    color: "#e8eaf6",
                    lineHeight: 1.5,
                  }}
                >
                  {msg.text}
                  <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                    {msg.time.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c5cfc, #00d4aa)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  🧠
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    padding: "12px 16px",
                    borderRadius: "4px 16px 16px 16px",
                  }}
                >
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#00d4aa",
                          animation: `pulse-glow 1s ${i * 0.2}s ease infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {suggestedMessages.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#8892b0",
                    padding: "5px 10px",
                    borderRadius: 20,
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#00d4aa44";
                    e.currentTarget.style.color = "#00d4aa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#8892b0";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: 10,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type how you're feeling..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "10px 14px",
                color: "#e8eaf6",
                fontSize: "0.88rem",
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />

            <button
              onClick={startListening}
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: isListening ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.04)",
                color: isListening ? "#ff6b6b" : "#e8eaf6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title={isListening ? "Listening..." : "Start voice input"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              className="btn-primary"
              onClick={() => sendMessage()}
              style={{ padding: "10px 18px", borderRadius: 12, fontSize: "1rem" }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}