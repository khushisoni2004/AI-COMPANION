import { useState, useEffect, useMemo, useCallback, useRef } from "react";

const API_BASE_URL = "/api";

const BOOKS_DB = [
  { id: 1, title: "Bhagavad Gita As It Is", author: "A.C. Bhaktivedanta Swami", category: "Spiritual", icon: "🕉️", color: "#7C3AED", description: "The eternal dialogue between Arjuna and Krishna on duty, devotion, and the nature of the Self.", featured: true, image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&q=80" },
  { id: 2, title: "The Gospel of Ramakrishna", author: "Mahendranath Gupta", category: "Spiritual", icon: "🙏", color: "#DB2777", description: "Teachings and conversations of Sri Ramakrishna, the great saint of Bengal.", featured: true, image: "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=1200&q=80" },
  { id: 3, title: "Autobiography of a Yogi", author: "Paramahansa Yogananda", category: "Spiritual", icon: "🧘", color: "#D97706", description: "A spiritual classic recounting the life of Yogananda and his encounters with saints.", featured: true, image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80" },
  { id: 4, title: "The Upanishads", author: "Various Sages", category: "Spiritual", icon: "⚙️", color: "#059669", description: "Meditations on Brahman, Atman and liberation.", image: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?w=1200&q=80" },
  { id: 5, title: "Ramayana (Inspired Reading)", author: "Valmiki", category: "Spiritual", icon: "🏹", color: "#DC2626", description: "The story of Rama, Sita and Hanuman as a guide to courage and dharma.", image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=1200&q=80" },
  { id: 6, title: "Mahabharata (Inspired Reading)", author: "Vyasa", category: "Spiritual", icon: "⚔️", color: "#7C3AED", description: "A moral tale of war, duty and spiritual truth.", image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=80" },
  { id: 7, title: "The Dhammapada", author: "Buddha", category: "Spiritual", icon: "☸️", color: "#0891B2", description: "Timeless teachings on mind, peace and wisdom.", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80" },
  { id: 8, title: "Thus Spake Zarathustra", author: "Friedrich Nietzsche", category: "Philosophy", icon: "⚡", color: "#B45309", description: "A philosophical reflection on growth, courage and becoming.", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&q=80" },
  { id: 9, title: "The Power of Now", author: "Eckhart Tolle", category: "Mindfulness", icon: "⏰", color: "#0EA5E9", description: "A guide to present-moment awareness.", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80" },
  { id: 10, title: "Wherever You Go, There You Are", author: "Jon Kabat-Zinn", category: "Mindfulness", icon: "🧭", color: "#10B981", description: "Mindfulness meditation in everyday life.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80" },
  { id: 11, title: "The Miracle of Mindfulness", author: "Thich Nhat Hanh", category: "Mindfulness", icon: "🌸", color: "#EC4899", description: "A gentle guide to mindful living.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80" },
  { id: 12, title: "Zen Mind, Beginner's Mind", author: "Shunryu Suzuki", category: "Mindfulness", icon: "🌿", color: "#059669", description: "Zen meditation and the spirit of openness.", image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=80" },
  { id: 13, title: "Man's Search for Meaning", author: "Viktor Frankl", category: "Psychology", icon: "💡", color: "#8B5CF6", description: "Finding meaning even in suffering.", image: "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=1200&q=80" },
  { id: 14, title: "The Interpretation of Dreams", author: "Sigmund Freud", category: "Psychology", icon: "💭", color: "#7C3AED", description: "Reflections on dreams and the mind.", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80" },
  { id: 15, title: "Principles of Psychology", author: "William James", category: "Psychology", icon: "🧠", color: "#2563EB", description: "Foundational ideas about thought, emotion and attention.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80" },
  { id: 16, title: "Beyond Good and Evil", author: "Friedrich Nietzsche", category: "Philosophy", icon: "🌑", color: "#1F2937", description: "Questioning fixed morals and inherited beliefs.", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&q=80" },
  { id: 17, title: "Walden", author: "Henry David Thoreau", category: "Mindfulness", icon: "🌲", color: "#16A34A", description: "Simple living and inner clarity.", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80" },
  { id: 18, title: "Meditations", author: "Marcus Aurelius", category: "Philosophy", icon: "🏛️", color: "#78716C", description: "Stoic wisdom on resilience and virtue.", image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&q=80" },
  { id: 19, title: "The Anatomy of Melancholy", author: "Robert Burton", category: "Depression", icon: "🌧️", color: "#475569", description: "Old reflections on sadness and healing.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80" },
  { id: 20, title: "Feeling Good", author: "David D. Burns", category: "CBT", icon: "🌤️", color: "#F59E0B", description: "Helpful CBT-based mood reframing.", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&q=80" },
  { id: 21, title: "The Anxiety and Worry Workbook", author: "Clark & Beck", category: "Anxiety", icon: "🗒️", color: "#06B6D4", description: "Tools for anxiety, worry and calmer thinking.", image: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?w=1200&q=80" },
  { id: 22, title: "Think and Grow Rich", author: "Napoleon Hill", category: "Self-Help", icon: "🎯", color: "#D97706", description: "Achievement, desire and disciplined thought.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80" },
  { id: 23, title: "As a Man Thinketh", author: "James Allen", category: "Self-Help", icon: "💪", color: "#9333EA", description: "How thought shapes character and destiny.", image: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=1200&q=80" },
  { id: 24, title: "The Art of War", author: "Sun Tzu", category: "Self-Help", icon: "⚔️", color: "#DC2626", description: "Strategy, clarity and intelligent action.", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&q=80" },
  { id: 25, title: "Essays", author: "Ralph Waldo Emerson", category: "Philosophy", icon: "✍️", color: "#0369A1", description: "Self-reliance, nature and the over-soul.", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80" },
  { id: 26, title: "The Republic", author: "Plato", category: "Philosophy", icon: "🏺", color: "#B45309", description: "Justice, governance and the ideal society.", image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&q=80" },
  { id: 27, title: "The Body Keeps the Score", author: "Bessel van der Kolk", category: "Trauma", icon: "💝", color: "#DB2777", description: "How trauma lives in body and mind.", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&q=80" },
  { id: 28, title: "When Things Fall Apart", author: "Pema Chödrön", category: "Mindfulness", icon: "🌑", color: "#6366F1", description: "Fearlessness and softness in hard times.", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80" },
  { id: 29, title: "The Tao Te Ching", author: "Lao Tzu", category: "Spiritual", icon: "☯️", color: "#1E293B", description: "The way of softness, balance and simplicity.", image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=80" },
  { id: 30, title: "Siddhartha", author: "Hermann Hesse", category: "Spiritual", icon: "🌅", color: "#F59E0B", description: "A journey of spiritual self-discovery.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80" },
  { id: 31, title: "The Alchemist", author: "Paulo Coelho", category: "Self-Help", icon: "✨", color: "#D97706", description: "A story of dreams, signs and purpose.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80" },
  { id: 32, title: "Confessions", author: "Augustine of Hippo", category: "Spiritual", icon: "📖", color: "#7C2D12", description: "An inner journey of longing, honesty and faith.", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80" },
  { id: 33, title: "Imitation of Christ", author: "Thomas à Kempis", category: "Spiritual", icon: "✝️", color: "#4C1D95", description: "A devotional classic on humility and faith.", image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&q=80" },
  { id: 34, title: "The Divine Comedy", author: "Dante Alighieri", category: "Spiritual", icon: "🌌", color: "#1E40AF", description: "An epic inner journey through darkness and light.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80" },
  { id: 35, title: "The Problems of Philosophy", author: "Bertrand Russell", category: "Philosophy", icon: "🤔", color: "#4338CA", description: "A clear introduction to philosophical questions.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80" },
  { id: 36, title: "Pragmatism", author: "William James", category: "Philosophy", icon: "⚖️", color: "#B45309", description: "Truth, action and practical wisdom.", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&q=80" },
  { id: 37, title: "The Will to Believe", author: "William James", category: "Psychology", icon: "🌟", color: "#0EA5E9", description: "Faith, free will and meaningful choice.", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80" },
  { id: 38, title: "The Varieties of Religious Experience", author: "William James", category: "Spiritual", icon: "🙏", color: "#7C3AED", description: "Mysticism, conversion and inner experience.", image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&q=80" },
  { id: 39, title: "Discourses", author: "Epictetus", category: "Philosophy", icon: "🏛️", color: "#1F2937", description: "Stoic lessons on freedom and character.", image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&q=80" },
  { id: 40, title: "Letters from a Stoic", author: "Seneca", category: "Philosophy", icon: "📜", color: "#78716C", description: "Letters on life, calmness and wisdom.", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80" },
];

const CATEGORIES = ["All", "Spiritual", "Mindfulness", "Psychology", "CBT", "Anxiety", "Depression", "Trauma", "Self-Help", "Philosophy"];

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
  "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=80",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&q=80",
  "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&q=80",
];

function getKrishnaLines() {
  return [
    "Do your work with a steady heart. Peace comes when action is offered without fear.",
    "You are stronger than the confusion of one difficult day.",
    "When the mind shakes, return to duty, breath, and trust.",
    "Do not measure yourself only by result. The sincerity of effort has its own beauty.",
    "The soul is not reduced by failure. It learns, rises, and continues.",
    "Stand up gently, not harshly. Real courage can also be calm.",
    "When you feel lost, remember: clarity often comes after honest action.",
    "Offer your anxiety to the Divine, then do the next right thing.",
  ];
}

function makePage({ title, body, image }) {
  return { title, body, image };
}

function generateSimplePages(book) {
  const krishna = getKrishnaLines();
  const themesByCategory = {
    Spiritual: [
      "The deepest journey is not always outward. Often it is the return to what is already sacred within you.",
      "Spiritual reading becomes powerful when it turns from information into reflection.",
      "The heart grows quiet when it stops fighting every moment and starts listening.",
      "Grace often enters through patience, humility, and honest effort.",
      "Peace is not escape from life. It is a wiser way of standing inside life.",
    ],
    Mindfulness: [
      "One calm breath can interrupt a hundred rushed thoughts.",
      "The present moment may not solve everything, but it gives you one place to stand.",
      "A softer mind notices more, reacts less, and heals faster.",
      "What you observe with kindness begins to loosen.",
      "Gentle attention is a form of inner care.",
    ],
    Psychology: [
      "To understand the mind is to notice patterns without becoming imprisoned by them.",
      "Thoughts are important, but they are not the whole of you.",
      "Healing often begins when insight meets practice.",
      "Self-awareness is not self-judgment. It is honest seeing.",
      "A wiser inner life is built one reflection at a time.",
    ],
    CBT: [
      "A thought can feel true and still be unhelpful.",
      "When the mind predicts the worst, pause and test the prediction gently.",
      "Small shifts in thinking can create large shifts in mood.",
      "Ask: what is the evidence, what is the story, and what is another fairer view?",
      "Progress does not require perfect thinking, only more balanced thinking.",
    ],
    Anxiety: [
      "Anxiety speaks loudly, but it is not always accurate.",
      "You do not need to solve your whole future to calm the next ten minutes.",
      "Slow breathing gives the body a message of safety.",
      "When worry loops, return to body, ground, and one real task.",
      "Courage is staying present even while your mind asks to run.",
    ],
    Depression: [
      "Even dim mornings can still hold meaning.",
      "A low day is not a final truth about your life.",
      "Tiny actions matter when energy is small.",
      "Hope can begin as a quiet decision to continue.",
      "Rest is not failure. It can be part of repair.",
    ],
    Trauma: [
      "Safety grows slowly through repetition, support, and permission to soften.",
      "The body remembers, but it can also learn new signals of safety.",
      "Healing is not forgetting. It is regaining choice.",
      "Gentleness is not weakness in recovery. It is intelligence.",
      "Your nervous system deserves patience, not punishment.",
    ],
    "Self-Help": [
      "Purpose becomes stronger when matched with steady daily practice.",
      "Ambition works best when guided by values and calmness.",
      "Discipline is easier when the goal feels meaningful.",
      "A focused life is built through repeated small decisions.",
      "Success without inner balance feels thin. Growth with peace lasts longer.",
    ],
    Philosophy: [
      "A good life is not only about answers. It is also about better questions.",
      "Wisdom asks us to think clearly and live honestly.",
      "Character is shaped by repeated choices in ordinary moments.",
      "The examined life is not a burden. It is a path to freedom.",
      "Reason and humility make strong companions.",
    ],
  };

  const themes = themesByCategory[book.category] || themesByCategory["Mindfulness"];
  const pages = [];
  for (let i = 0; i < 15; i += 1) {
    const image = i % 3 === 0 ? book.image || IMAGE_POOL[i % IMAGE_POOL.length] : IMAGE_POOL[(book.id + i) % IMAGE_POOL.length];
    const body = [
      `${book.title} invites the reader into a simple but serious conversation about life, mind, and inner strength. ${book.description}`,
      themes[i % themes.length],
      book.category === "Spiritual" ? krishna[i % krishna.length] : "Pause after reading this page. Ask yourself what one sentence here you can carry into the rest of your day.",
      `Reflection: In your present life, where do you most need more ${book.category === "Mindfulness" ? "awareness" : book.category === "Philosophy" ? "clarity" : book.category === "Self-Help" ? "discipline" : book.category === "Anxiety" ? "steadiness" : book.category === "Depression" ? "gentleness" : book.category === "Trauma" ? "safety" : book.category === "Spiritual" ? "faith" : "understanding"}?`,
      `Practice: Spend one minute breathing slowly and reading this page again, this time more softly than before.`,
    ].join("\n\n");

    pages.push(makePage({
      title: `${book.title} — Page ${i + 1}`,
      body,
      image,
    }));
  }
  return pages;
}

const SPECIAL_BOOK_CONTENT = {
  "Bhagavad Gita As It Is": [
    makePage({ title: "Kurukshetra and the Troubled Mind", image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&q=80", body: "Arjuna stands in the field of action with a mind full of sorrow. He is not weak because he feels deeply; he is human. Krishna does not mock his confusion. He teaches him how to see clearly inside it.\n\nMany readers come to this book not because they are on a battlefield, but because they too must make difficult decisions. The Gita reminds us that inner confusion is often the doorway to deeper wisdom.\n\nWhen the heart trembles, the first answer is not panic. It is pause, inquiry, and guidance." }),
    makePage({ title: "Krishna on Duty", image: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?w=1200&q=80", body: "Krishna teaches that a person should not run away from rightful action simply because action feels difficult. Work becomes lighter when it is rooted in dharma, not ego.\n\nDo what is yours to do with sincerity. This teaching is deeply motivating because it frees the mind from endless comparison. Your path does not need to look like another person's path.\n\nA steady life is built by doing the next rightful thing with a clean intention." }),
    makePage({ title: "Action Without Attachment", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80", body: "One of the most remembered teachings is to act without attachment to outcome. This does not mean laziness. It means giving full effort without allowing success or failure to define your worth.\n\nMuch suffering comes from trying to control what is not fully ours to control. The result belongs partly to time, circumstance, and grace. The effort belongs to us.\n\nWhen you work this way, the mind becomes stronger and calmer." }),
    makePage({ title: "The Stable Mind", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80", body: "Krishna describes the person of steady wisdom as someone who remains balanced in pleasure and pain, gain and loss, praise and blame. This balance is not indifference. It is inner maturity.\n\nA stable mind does not react to every wave. It knows how to witness, breathe, and respond.\n\nMotivation becomes purer when it comes from balance instead of panic." }),
    makePage({ title: "Self, Soul, and Courage", image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=80", body: "The Gita repeatedly teaches that the deepest self is not destroyed by outward change. The body changes, situations change, emotions change, but the soul remains.\n\nThis teaching is comforting during fear. It invites us to build identity on something deeper than temporary success, beauty, or approval.\n\nInner courage grows when identity rests in the eternal rather than the unstable." }),
    makePage({ title: "Yoga of Discipline", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80", body: "Krishna presents yoga as disciplined union: right thought, right action, right devotion, right awareness. Spiritual life is not escape from discipline; it is discipline with love.\n\nA scattered mind suffers. A trained mind serves.\n\nThe Gita encourages simple daily steadiness: regular effort, regular reflection, regular remembrance." }),
    makePage({ title: "The Friend and Enemy Within", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80", body: "The mind can become a dear friend or a difficult enemy. This is one of the most practical teachings in the Gita.\n\nIf the mind is guided, it supports peace. If it is left to every impulse, it intensifies confusion.\n\nTraining the mind does not happen in one moment. It happens through repeated return." }),
    makePage({ title: "Bhakti and Love", image: "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=1200&q=80", body: "Devotion in the Gita is not merely ritual. It is loving orientation toward the Divine. Krishna repeatedly shows that sincere love, humility, and remembrance are powerful forms of spiritual practice.\n\nA heart that remembers the sacred becomes less restless.\n\nLove makes discipline warm. It turns effort into offering." }),
    makePage({ title: "Seeing the Divine Everywhere", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80", body: "The Gita expands the reader's vision. Krishna is not limited to one place or image. The Divine appears through light, strength, wisdom, compassion, and order.\n\nThis vision helps a person move from isolation to reverence. Life stops feeling random and starts feeling meaningful.\n\nWhen sacredness is seen everywhere, gratitude comes more naturally." }),
    makePage({ title: "Fear, Surrender, and Peace", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80", body: "At many points the Gita leads the reader toward surrender. Surrender is not giving up on life. It is giving up the illusion that anxiety alone can save us.\n\nSurrender softens the chest. It allows effort without obsession.\n\nOften peace enters when control loosens." }),
    makePage({ title: "The Three Qualities", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&q=80", body: "The Gita describes modes of nature: clarity, agitation, and inertia. These qualities shape thought and action.\n\nThis teaching is useful for self-observation. On some days you are clear. On some days restless. On some days dull. Instead of shame, the Gita offers understanding and discipline.\n\nNotice your state, then choose the next elevating action." }),
    makePage({ title: "Simple Practice for Daily Life", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80", body: "Read one teaching. Breathe slowly. Offer one action without attachment. Speak one truthful and kind sentence. Serve someone without seeking attention.\n\nThese simple acts bring the Gita off the page and into life.\n\nThe greatest scripture becomes living only when it becomes practiced." }),
    makePage({ title: "Motivation from Krishna", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80", body: "Krishna motivates not by fear alone but by awakening strength. He calls Arjuna toward courage, steadiness, and deeper vision.\n\nYou too can hear this message personally: do not collapse into hopelessness. Rise with awareness. Act with sincerity. Trust what is higher than your fear.\n\nThis is not harsh motivation. It is sacred encouragement." }),
    makePage({ title: "A Calm Heart in a Busy World", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80", body: "Modern life is noisy, fast, and full of comparison. The Gita remains relevant because it speaks directly to the inner life beneath all that noise.\n\nIts answer is not withdrawal from responsibility, but transformation of the way responsibility is carried.\n\nWork, but from peace. Love, but without fear. Serve, but without pride." }),
    makePage({ title: "Closing Reflection", image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=80", body: "Ask yourself: where in my life am I like Arjuna today? Where do I need Krishna's reminder to stand up, breathe, and act with clarity?\n\nCarry one line with you: do your work steadily, offer the result, and protect the peace of your heart.\n\nThat is a beautiful way to live." }),
  ],
};

function fetchBookContent(book) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(SPECIAL_BOOK_CONTENT[book.title] || generateSimplePages(book));
    }, 250);
  });
}

function PageFlipReader({ book, pages, onClose, onSpreadChange }) {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState(null);
  const totalSpreads = Math.ceil(pages.length / 2);

  const leftPage = pages[currentSpread * 2] || null;
  const rightPage = pages[currentSpread * 2 + 1] || null;

  useEffect(() => {
    if (onSpreadChange) onSpreadChange(currentSpread);
  }, [currentSpread, onSpreadChange]);

  const goNext = useCallback(() => {
    if (flipping || currentSpread >= totalSpreads - 1) return;
    setFlipDir("next");
    setFlipping(true);
    setTimeout(() => {
      setCurrentSpread((s) => s + 1);
      setFlipping(false);
      setFlipDir(null);
    }, 550);
  }, [flipping, currentSpread, totalSpreads]);

  const goPrev = useCallback(() => {
    if (flipping || currentSpread <= 0) return;
    setFlipDir("prev");
    setFlipping(true);
    setTimeout(() => {
      setCurrentSpread((s) => s - 1);
      setFlipping(false);
      setFlipDir(null);
    }, 550);
  }, [flipping, currentSpread]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  const pageProgress = ((currentSpread + 1) / totalSpreads) * 100;

  const renderPage = (page, pageNumber, isRight = false) => (
    <div style={{
      flex: 1,
      background: "#F8F2E8",
      borderRadius: isRight ? "0 6px 6px 0" : "6px 0 0 6px",
      overflow: "hidden",
      position: "relative",
      boxShadow: isRight
        ? "8px 0 35px rgba(0,0,0,0.45), inset 4px 0 12px rgba(0,0,0,0.06)"
        : "-8px 0 35px rgba(0,0,0,0.45), inset -4px 0 12px rgba(0,0,0,0.12)",
      transformOrigin: isRight ? "left center" : "right center",
      transition: flipping ? "transform 0.55s ease" : "none",
      transform: flipping && flipDir === (isRight ? "next" : "prev") ? `rotateY(${isRight ? 12 : -12}deg)` : "rotateY(0deg)",
      display: "flex",
      flexDirection: "column",
    }}>
      {page ? (
        <>
          <div style={{ height: 170, background: "#E5E7EB", overflow: "hidden", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <img src={page.image} alt={page.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ padding: "22px 24px 40px", overflowY: "auto", flex: 1 }}>
            <div style={{ color: book.color, fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>
              {book.category}
            </div>
            <div style={{ color: "#2D2416", fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 14, lineHeight: 1.25 }}>
              {page.title}
            </div>
            <div style={{ color: "#2D2416", fontFamily: "Georgia, serif", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {page.body}
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", color: "#9C8B70", fontSize: 11, fontFamily: "Georgia, serif" }}>
            {pageNumber}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#9C8B70", fontStyle: "italic", height: "100%" }}>
          ~ End of book ~
        </div>
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(5,5,15,0.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(18px)" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg, rgba(0,0,0,0.82) 0%, transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>{book.icon}</span>
          <div>
            <div style={{ color: "#E2E8F0", fontSize: 15, fontWeight: 600, fontFamily: "Georgia, serif" }}>{book.title}</div>
            <div style={{ color: "#94A3B8", fontSize: 12 }}>{book.author}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#64748B", fontSize: 12 }}>Page {currentSpread * 2 + 1}–{Math.min(currentSpread * 2 + 2, pages.length)} of {pages.length}</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#E2E8F0", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>✕ Close</button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "stretch", width: "min(980px, 95vw)", height: "min(650px, 80vh)", perspective: "2000px", position: "relative" }}>
        {renderPage(leftPage, currentSpread * 2 + 1, false)}
        <div style={{ width: 14, background: "linear-gradient(90deg, #8B7355, #C4A882, #8B7355)", boxShadow: "0 0 18px rgba(0,0,0,0.8)", flexShrink: 0, zIndex: 2 }} />
        {renderPage(rightPage, currentSpread * 2 + 2, true)}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 28 }}>
        <button onClick={goPrev} disabled={currentSpread === 0 || flipping} style={{ background: currentSpread === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", color: currentSpread === 0 ? "#4B5563" : "#E2E8F0", borderRadius: 10, padding: "10px 24px", cursor: currentSpread === 0 ? "default" : "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>← Previous</button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: 220, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
            <div style={{ width: `${pageProgress}%`, height: "100%", background: book.color, borderRadius: 999, transition: "width 0.3s" }} />
          </div>
          <span style={{ color: "#64748B", fontSize: 11 }}>{pageProgress.toFixed(0)}% read</span>
        </div>
        <button onClick={goNext} disabled={currentSpread >= totalSpreads - 1 || flipping} style={{ background: currentSpread >= totalSpreads - 1 ? "rgba(255,255,255,0.05)" : book.color + "33", border: `1px solid ${book.color}66`, color: currentSpread >= totalSpreads - 1 ? "#4B5563" : "#E2E8F0", borderRadius: 10, padding: "10px 24px", cursor: currentSpread >= totalSpreads - 1 ? "default" : "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>Next →</button>
      </div>
    </div>
  );
}

function BookCard({ book, onRead, favorites, toggleFav }) {
  const isFav = favorites.includes(book.id);
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, transition: "all 0.25s ease", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ background: book.color + "22", border: `1px solid ${book.color}44`, color: book.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{book.category}</span>
        <button onClick={() => toggleFav(book.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 2, color: isFav ? "#FBBF24" : "#4B5563" }}>{isFav ? "★" : "☆"}</button>
      </div>
      <div style={{ width: "100%", height: 136, borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
        <img src={book.image} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ fontSize: 30, marginBottom: 10 }}>{book.icon}</div>
      <div style={{ color: "#E2E8F0", fontSize: 15, fontWeight: 600, marginBottom: 4, lineHeight: 1.3, fontFamily: "Georgia, serif" }}>{book.title}</div>
      <div style={{ color: book.color, fontSize: 12, marginBottom: 10 }}>{book.author}</div>
      <div style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.5, marginBottom: 16 }}>{book.description}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
          <span style={{ color: "#64748B", fontSize: 11 }}>15 pages · Simple reading</span>
        </div>
        <button onClick={() => onRead(book)} style={{ background: book.color + "22", border: `1px solid ${book.color}44`, color: book.color, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Read →</button>
      </div>
    </div>
  );
}

export default function MentalGrowthBooks() {
  const [activeTab, setActiveTab] = useState("Books");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookPages, setBookPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const sessionIdRef = useRef(
    localStorage.getItem("wellness_session_id") || `session_${Date.now()}`
  );
  const readingStartRef = useRef(null);
  const currentBookIdRef = useRef(null);
  const pagesReadRef = useRef(0);

  useEffect(() => {
    localStorage.setItem("wellness_session_id", sessionIdRef.current);
  }, []);

  useEffect(() => {
    const storeBooksAndLoadFavorites = async () => {
      try {
        await fetch(`${API_BASE_URL}/books/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            BOOKS_DB.map((book) => ({
              id: book.id,
              title: book.title,
              author: book.author || "",
              category: book.category || "",
              description: book.description || "",
              image: book.image || "",
            }))
          ),
        });
      } catch (error) {
        console.error("Bulk books save failed:", error);
      }

      try {
        const res = await fetch(`${API_BASE_URL}/mental-growth/favorites/${sessionIdRef.current}`);
        if (res.ok) {
          const data = await res.json();
          setFavorites(data.map((b) => b.id));
        }
      } catch (error) {
        console.error("Favorites load failed:", error);
      }
    };

    storeBooksAndLoadFavorites();
  }, []);

  const filteredBooks = useMemo(() => {
    return BOOKS_DB.filter((b) => {
      const matchCat = activeCategory === "All" || b.category === activeCategory;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const toggleFav = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/mental-growth/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          book_id: id,
        }),
      });

      const data = await res.json();
      if (data.favorite) {
        setFavorites((f) => (f.includes(id) ? f : [...f, id]));
      } else {
        setFavorites((f) => f.filter((x) => x !== id));
      }
    } catch (error) {
      console.error("Favorite toggle failed:", error);
    }
  };

  const handleRead = async (book) => {
    setLoading(true);
    setSelectedBook(book);
    currentBookIdRef.current = book.id;
    readingStartRef.current = Date.now();
    pagesReadRef.current = 1;

    try {
      await fetch(`${API_BASE_URL}/mental-growth/open`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          book_id: book.id,
        }),
      });
    } catch (error) {
      console.error("Book open save failed:", error);
    }

    try {
      const pages = await fetchBookContent(book);
      setBookPages(pages);
    } catch {
      setBookPages(generateSimplePages(book));
    }

    setLoading(false);
  };

  const handleClose = async () => {
    if (currentBookIdRef.current && readingStartRef.current) {
      const durationSeconds = Math.max(
        1,
        Math.floor((Date.now() - readingStartRef.current) / 1000)
      );

      try {
        await fetch(`${API_BASE_URL}/mental-growth/close`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionIdRef.current,
            book_id: currentBookIdRef.current,
            duration_seconds: durationSeconds,
            pages_read: pagesReadRef.current,
            completed: pagesReadRef.current >= bookPages.length ? 1 : 0,
          }),
        });
      } catch (error) {
        console.error("Book close save failed:", error);
      }
    }

    setSelectedBook(null);
    setBookPages([]);
    currentBookIdRef.current = null;
    readingStartRef.current = null;
    pagesReadRef.current = 0;
  };

  const handleSpreadChange = useCallback((spreadIndex) => {
    const pagesReached = Math.min(bookPages.length || 0, spreadIndex * 2 + 2);
    pagesReadRef.current = Math.max(1, pagesReached);
  }, [bookPages.length]);

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2E8F0", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(5,5,15,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ fontSize: 40, animation: "spin 1s linear infinite" }}>{selectedBook?.icon}</div>
          <div style={{ color: "#94A3B8", fontSize: 14 }}>Loading {selectedBook?.title}...</div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {selectedBook && !loading && bookPages.length > 0 && (
        <PageFlipReader
          book={selectedBook}
          pages={bookPages}
          onClose={handleClose}
          onSpreadChange={handleSpreadChange}
        />
      )}

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: "#22C55E", fontSize: 11, letterSpacing: 2, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Wellness Module</div>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 8px", fontFamily: "Georgia, serif", color: "#F1F5F9" }}>Mental Growth</h1>
          <p style={{ color: "#64748B", margin: 0, fontSize: 14 }}>{filteredBooks.length} books · image pages · simple reflective reading</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["Books", "Articles"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 20px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: activeTab === tab ? "linear-gradient(135deg, #7C3AED, #4F46E5)" : "rgba(255,255,255,0.06)",
                color: activeTab === tab ? "#fff" : "#94A3B8",
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tab === "Books" ? "📚" : "📄"} {tab}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, authors..."
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "10px 16px",
              color: "#E2E8F0",
              fontSize: 13,
              width: "100%",
              maxWidth: 320,
              outline: "none",
              marginBottom: 14,
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: "1px solid",
                  borderColor: activeCategory === cat ? "#22C55E" : "rgba(255,255,255,0.1)",
                  background: activeCategory === cat ? "#22C55E22" : "transparent",
                  color: activeCategory === cat ? "#22C55E" : "#94A3B8",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: activeCategory === cat ? 600 : 400,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ color: "#4B5563", fontSize: 12, marginBottom: 20 }}>{filteredBooks.length} books found</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onRead={handleRead}
              favorites={favorites}
              toggleFav={toggleFav}
            />
          ))}
        </div>
      </div>
    </div>
  );
}