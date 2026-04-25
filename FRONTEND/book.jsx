import { useState } from "react";

const books = [
  { id: 1, title: "The Anxiety & Phobia Workbook", author: "Edmund J. Bourne", category: "Anxiety", pages: 496, rating: 4.7, color: "#7c5cfc", icon: "📘", summary: "Comprehensive cognitive-behavioral techniques for managing anxiety disorders, phobias, and panic attacks through practical exercises and evidence-based strategies." },
  { id: 2, title: "Lost Connections", author: "Johann Hari", category: "Depression", pages: 320, rating: 4.5, color: "#ff6b6b", icon: "📕", summary: "Groundbreaking investigation into the real causes of depression and anxiety, offering nine evidence-based ways to reconnect with life and find joy." },
  { id: 3, title: "The Power of Now", author: "Eckhart Tolle", category: "Mindfulness", pages: 236, rating: 4.8, color: "#00d4aa", icon: "📗", summary: "A transformative spiritual guide to living fully in the present moment, dissolving pain through conscious presence and inner stillness." },
  { id: 4, title: "Atomic Habits", author: "James Clear", category: "Self-Help", pages: 320, rating: 4.9, color: "#ffd166", icon: "📙", summary: "A proven framework for building good habits and breaking bad ones through small, incremental improvements compounded over time." },
  { id: 5, title: "Why Has Nobody Told Me This Before?", author: "Dr. Julie Smith", category: "Psychology", pages: 320, rating: 4.8, color: "#4cc9f0", icon: "📘", summary: "Essential mental health tools and life skills explained by a clinical psychologist, covering low mood, anxiety, grief, and emotional regulation." },
  { id: 6, title: "Feeling Good", author: "David D. Burns", category: "CBT", pages: 736, rating: 4.6, color: "#06d6a0", icon: "📗", summary: "The groundbreaking clinically proven drug-free treatment for depression based on cognitive behavioral therapy principles." },
];

const articles = [
  { id: 1, title: "Understanding the Window of Tolerance", tag: "Trauma", readTime: "7 min", color: "#7c5cfc", icon: "🧠" },
  { id: 2, title: "How Sleep Affects Mental Health", tag: "Sleep", readTime: "5 min", color: "#4cc9f0", icon: "😴" },
  { id: 3, title: "The Science of Self-Compassion", tag: "CBT", readTime: "8 min", color: "#00d4aa", icon: "💚" },
  { id: 4, title: "Dopamine Detox: Does It Work?", tag: "Neuroscience", readTime: "6 min", color: "#ffd166", icon: "⚡" },
  { id: 5, title: "Grounding Techniques for Panic Attacks", tag: "Anxiety", readTime: "4 min", color: "#ff6b6b", icon: "🌿" },
  { id: 6, title: "Building Emotional Resilience", tag: "Resilience", readTime: "9 min", color: "#f72585", icon: "🛡️" },
];

const categories = ["All", "Anxiety", "Depression", "Mindfulness", "Self-Help", "Psychology", "CBT"];

export default function MentalGrowth() {
  const [activeBook, setActiveBook] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("books");
  const [savedBooks, setSavedBooks] = useState([1, 3]);

  const filteredBooks = books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || b.category === activeCategory;
    return matchSearch && matchCat;
  });

  const toggleSave = (id) => {
    setSavedBooks(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-label">Wellness Module</div>
        <h1 className="page-title">Mental Growth</h1>
        <p className="page-subtitle">Self-help library, psychology articles & AI-powered summaries</p>
      </div>

      {!activeBook ? (
        <>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4, width: "fit-content" }}>
            {[{ id: "books", label: "📚 Books" }, { id: "articles", label: "📄 Articles" }].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "8px 22px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: activeTab === t.id ? 600 : 400,
                  background: activeTab === t.id ? "linear-gradient(135deg, #7c5cfc, #00d4aa)" : "transparent",
                  color: activeTab === t.id ? "#fff" : "#8892b0",
                  transition: "all 0.2s",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >{t.label}</button>
            ))}
          </div>

          {activeTab === "books" && (
            <>
              {/* Search + Filters */}
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search books, authors..."
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    color: "#e8eaf6",
                    fontSize: "0.88rem",
                    outline: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    width: 240,
                  }}
                />
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      border: activeCategory === cat ? "1px solid #06d6a0" : "1px solid rgba(255,255,255,0.08)",
                      background: activeCategory === cat ? "rgba(6,214,160,0.12)" : "transparent",
                      color: activeCategory === cat ? "#06d6a0" : "#8892b0",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >{cat}</button>
                ))}
              </div>

              <div className="grid-3">
                {filteredBooks.map(book => (
                  <div key={book.id} className="card" style={{ borderColor: `${book.color}18`, cursor: "pointer" }} onClick={() => setActiveBook(book)}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                      <span style={{ fontSize: "2rem" }}>{book.icon}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div className="badge" style={{ background: `${book.color}15`, color: book.color, border: `1px solid ${book.color}25`, fontSize: "0.68rem" }}>{book.category}</div>
                        <button
                          onClick={e => { e.stopPropagation(); toggleSave(book.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: savedBooks.includes(book.id) ? "#ffd166" : "#4a5568" }}
                        >
                          {savedBooks.includes(book.id) ? "★" : "☆"}
                        </button>
                      </div>
                    </div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e8eaf6", marginBottom: 4, lineHeight: 1.3 }}>{book.title}</h3>
                    <div style={{ fontSize: "0.78rem", color: "#8892b0", marginBottom: 10 }}>{book.author}</div>
                    <p style={{ fontSize: "0.8rem", color: "#4a5568", lineHeight: 1.5, marginBottom: 14 }}>{book.summary.slice(0, 90)}...</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "#8892b0" }}>⭐ {book.rating} · {book.pages}p</span>
                      <button
                        className="btn-primary"
                        style={{ padding: "6px 14px", fontSize: "0.78rem", background: `linear-gradient(135deg, ${book.color}, ${book.color}88)` }}
                        onClick={e => { e.stopPropagation(); setActiveBook(book); }}
                      >Read →</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "articles" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {articles.map(article => (
                <div key={article.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer", borderColor: `${article.color}15` }}>
                  <div style={{
                    width: 50, height: 50,
                    borderRadius: 12,
                    background: `${article.color}15`,
                    border: `1px solid ${article.color}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem",
                    flexShrink: 0,
                  }}>{article.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#e8eaf6", marginBottom: 4 }}>{article.title}</h4>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div className="badge" style={{ background: `${article.color}12`, color: article.color, border: `1px solid ${article.color}25`, fontSize: "0.68rem" }}>{article.tag}</div>
                      <span style={{ fontSize: "0.75rem", color: "#4a5568" }}>⏱ {article.readTime} read</span>
                    </div>
                  </div>
                  <button className="btn-ghost" style={{ fontSize: "0.8rem", padding: "7px 16px", flexShrink: 0 }}>Read</button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <button className="btn-ghost" onClick={() => setActiveBook(null)} style={{ marginBottom: 24 }}>← Back to Library</button>
          <div className="card" style={{ borderColor: `${activeBook.color}25` }}>
            <div style={{ display: "flex", gap: 24, marginBottom: 28, alignItems: "flex-start" }}>
              <div style={{
                width: 80, height: 110,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${activeBook.color}30, ${activeBook.color}15)`,
                border: `2px solid ${activeBook.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2.5rem",
                flexShrink: 0,
              }}>{activeBook.icon}</div>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#e8eaf6", marginBottom: 6 }}>{activeBook.title}</h2>
                <div style={{ fontSize: "0.88rem", color: "#8892b0", marginBottom: 10 }}>{activeBook.author}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div className="badge" style={{ background: `${activeBook.color}15`, color: activeBook.color, border: `1px solid ${activeBook.color}25` }}>{activeBook.category}</div>
                  <div className="badge badge-teal">⭐ {activeBook.rating}</div>
                  <div className="badge badge-violet">{activeBook.pages} pages</div>
                </div>
              </div>
            </div>

            <div className="section-label">About this Book</div>
            <p style={{ fontSize: "0.92rem", color: "#c4cad8", lineHeight: 1.8, marginBottom: 24 }}>{activeBook.summary}</p>

            <div style={{ background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 12, padding: "18px 20px", marginBottom: 24 }}>
              <div className="section-label">AI Summary</div>
              <p style={{ fontSize: "0.88rem", color: "#8892b0", lineHeight: 1.7 }}>
                This book is particularly recommended for individuals experiencing <span style={{ color: "#00d4aa" }}>{activeBook.category.toLowerCase()}</span>. 
                The core technique involves identifying negative thought patterns and replacing them with evidence-based, balanced thinking. 
                Most readers report noticeable improvement within 3–4 weeks of applying the methods.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-primary" style={{ flex: 1 }}>📖 Start Reading</button>
              <button
                className="btn-ghost"
                onClick={() => toggleSave(activeBook.id)}
                style={{ borderColor: savedBooks.includes(activeBook.id) ? "#ffd166" : undefined, color: savedBooks.includes(activeBook.id) ? "#ffd166" : undefined }}
              >{savedBooks.includes(activeBook.id) ? "★ Saved" : "☆ Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
