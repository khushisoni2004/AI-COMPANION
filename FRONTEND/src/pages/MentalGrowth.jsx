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
  const krishnaLines = getKrishnaLines();

  const categoryContent = {
    Spiritual: [
      {
        title: "Beginning the Inner Journey",
        body: `${book.title} opens a doorway toward inner reflection. It reminds the reader that spiritual growth is not only about rituals or beliefs, but also about becoming more truthful, peaceful, and aware in daily life.\n\nThis book encourages the heart to slow down and listen. In a noisy world, spiritual wisdom becomes a soft lamp that helps us see our path more clearly.`
      },
      {
        title: "Faith and Self-Trust",
        body: `A central lesson in this reading is the importance of faith. Faith does not mean ignoring difficulty. It means continuing with hope even when the road is unclear.\n\nThe reader is reminded that strength often grows quietly. When the mind feels doubtful, even one sincere prayer, one honest action, or one peaceful thought can become a step toward healing.`
      },
      {
        title: "Duty and Devotion",
        body: `Spiritual life becomes meaningful when devotion is connected with action. ${book.title} teaches that the sacred is not separate from ordinary responsibilities.\n\nA kind word, a disciplined routine, and a helpful attitude can all become forms of devotion. The book encourages us to perform our duties with humility rather than ego.`
      },
      {
        title: "Peace Beyond Fear",
        body: `Fear often grows when the mind feels alone. This book offers the comfort that life has a deeper order, and that the soul is greater than temporary struggle.\n\nThe message is simple but powerful: breathe, remember your values, and take the next right step. Peace does not always come suddenly; sometimes it is built through repeated trust.`
      },
      {
        title: "The Power of Surrender",
        body: `Surrender does not mean weakness. It means releasing the belief that we must control every result. ${book.title} invites the reader to offer worries, efforts, and outcomes to something higher.\n\nWhen surrender is practiced sincerely, the mind becomes lighter. The heart learns to work fully while carrying less fear.`
      },
      {
        title: "Seeing Goodness in Life",
        body: `The book encourages us to look at life with reverence. Even ordinary moments can become meaningful when seen with gratitude.\n\nA quiet morning, a helpful friend, a moment of courage, or a small act of kindness can reveal beauty. Spiritual awareness begins when we stop rushing past life.`
      },
      {
        title: "Discipline of the Mind",
        body: `A restless mind can make even simple situations feel heavy. ${book.title} reminds us that inner discipline is a form of freedom.\n\nThrough prayer, reflection, meditation, or mindful action, the mind slowly becomes more stable. Discipline is not punishment; it is care for the soul.`
      },
      {
        title: "Compassion and Humility",
        body: `True spiritual growth softens the heart. It makes a person less judgmental and more compassionate.\n\nThis book guides the reader to treat others with patience and to remember that everyone carries unseen struggles. Humility allows wisdom to enter.`
      },
      {
        title: "Daily Practice",
        body: `The teachings of ${book.title} become powerful only when practiced. Reading is the first step; living the message is the deeper step.\n\nPractice one small thing today: speak gently, act honestly, forgive slowly, or sit silently for a few minutes. Spiritual growth happens through small repeated choices.`
      },
      {
        title: "Closing Reflection",
        body: `At the end of this reading, the reader is invited to ask: What is one truth I can carry into my life today?\n\n${krishnaLines[book.id % krishnaLines.length]}\n\nLet this book become not only something you read, but something that quietly shapes how you live.`
      },
    ],

    Mindfulness: [
      {
        title: "Returning to the Present",
        body: `${book.title} teaches that peace often begins by returning to the present moment. The mind may travel into regret or worry, but the breath always brings us back to now.\n\nThis reading reminds us that the present is not empty. It contains awareness, choice, and the possibility of calm.`
      },
      {
        title: "The Breath as an Anchor",
        body: `Breathing is simple, but it is powerful. A slow breath can tell the body that it is safe.\n\nWhen thoughts become too loud, this book encourages the reader to come back to breathing. Not to force the mind silent, but to give it a gentle place to rest.`
      },
      {
        title: "Observing Without Judging",
        body: `Mindfulness is not about fighting thoughts. It is about noticing them without becoming trapped inside them.\n\n${book.title} teaches the reader to observe emotions with kindness. A thought can be seen, named, and released without shame.`
      },
      {
        title: "Small Moments of Awareness",
        body: `Peace is not found only during meditation. It can be found while walking, eating, listening, studying, or sitting quietly.\n\nThis book shows that every ordinary moment can become a mindful moment when attention is gentle and complete.`
      },
      {
        title: "Softening the Inner Voice",
        body: `Many people speak to themselves harshly. Mindfulness invites a softer inner voice.\n\nInstead of saying, “I am failing,” the reader can say, “I am learning.” Instead of “I cannot handle this,” one may say, “I can take one step at a time.”`
      },
      {
        title: "Letting Thoughts Pass",
        body: `Thoughts are like clouds. They appear, change shape, and pass. The sky does not fight the clouds.\n\n${book.title} helps the reader understand that awareness is wider than thought. You can notice worry without becoming worry itself.`
      },
      {
        title: "Mindful Healing",
        body: `Healing requires patience. Mindfulness does not promise instant change, but it creates space for healthier responses.\n\nWhen we pause before reacting, we protect our peace. When we listen before judging, we improve our relationships.`
      },
      {
        title: "Living Slowly",
        body: `Modern life often rewards speed, but the heart needs slowness. This book reminds us that slowing down is not laziness; it is awareness.\n\nA slow life can still be productive. It simply becomes less mechanical and more meaningful.`
      },
      {
        title: "Daily Mindfulness Practice",
        body: `Try this practice: pause for one minute. Feel your breath. Notice your shoulders. Relax your jaw. Observe one sound around you.\n\nThis simple practice can be repeated many times a day. Small mindful pauses can change the quality of your whole day.`
      },
      {
        title: "Closing Reflection",
        body: `After reading ${book.title}, ask yourself: Where can I be more present today?\n\nMindfulness does not remove all problems, but it changes how we meet them. A calm mind can see more clearly, love more deeply, and respond more wisely.`
      },
    ],

    Psychology: [
      {
        title: "Understanding the Mind",
        body: `${book.title} helps the reader look at the mind with curiosity. Human thoughts, emotions, memories, and habits shape how we experience life.\n\nUnderstanding the mind does not mean judging it. It means learning how inner patterns work so that we can live with more awareness.`
      },
      {
        title: "Thoughts and Feelings",
        body: `Thoughts and feelings are deeply connected. A single interpretation can change the emotional meaning of an event.\n\nThis book encourages the reader to notice how the mind creates stories. Some stories help us grow, while others keep us stuck.`
      },
      {
        title: "The Role of Self-Awareness",
        body: `Self-awareness is one of the most important tools for growth. It allows us to notice our reactions instead of being controlled by them.\n\n${book.title} reminds us that awareness creates choice. Once we see a pattern, we can begin to change it.`
      },
      {
        title: "Memory and Meaning",
        body: `The mind stores experiences, but it also gives meaning to them. Two people may experience the same situation differently because their minds interpret it differently.\n\nThis reading encourages gentle reflection on past experiences without becoming trapped in them.`
      },
      {
        title: "Emotional Balance",
        body: `Emotional balance does not mean never feeling sadness, anger, or fear. It means learning how to respond without losing yourself completely.\n\nThe book reminds us that emotions carry information. They ask to be understood, not blindly obeyed.`
      },
      {
        title: "Healing Through Insight",
        body: `Insight can be healing when it leads to compassion and action. Understanding why we behave a certain way can reduce shame.\n\n${book.title} encourages the reader to replace self-criticism with honest understanding. Growth begins when we stop hiding from ourselves.`
      },
      {
        title: "Changing Mental Habits",
        body: `The mind learns through repetition. This means harmful patterns can become strong, but helpful patterns can also be trained.\n\nSmall daily practices—journaling, reflection, balanced thinking, and rest—can slowly reshape the inner life.`
      },
      {
        title: "Relationships and the Mind",
        body: `Our inner world affects how we connect with others. Fear may create distance, while trust creates openness.\n\nThis book invites the reader to notice emotional reactions in relationships and ask: What is this reaction trying to protect?`
      },
      {
        title: "Practical Reflection",
        body: `A useful practice is to write down one strong emotion from the day. Then ask: What triggered it? What thought came with it? What did I need in that moment?\n\nThis simple reflection builds emotional intelligence.`
      },
      {
        title: "Closing Reflection",
        body: `After reading ${book.title}, remember that the mind is not your enemy. It is a system that can be understood, guided, and healed.\n\nGrowth becomes possible when awareness meets patience.`
      },
    ],

    CBT: [
      {
        title: "Thoughts Shape Mood",
        body: `${book.title} introduces a powerful idea: our thoughts strongly influence our emotions. A difficult situation can feel even heavier when the mind adds harsh or fearful interpretations.\n\nCBT helps us pause and examine those thoughts more fairly.`
      },
      {
        title: "Identifying Negative Thoughts",
        body: `Many painful moods are connected to automatic thoughts. These thoughts appear quickly and often feel true.\n\nThis book encourages the reader to notice thoughts like “I always fail,” “Nothing will improve,” or “Everyone is judging me.” Naming the thought is the first step.`
      },
      {
        title: "Testing the Evidence",
        body: `CBT asks a practical question: What is the evidence?\n\nInstead of accepting every thought as fact, the reader learns to examine it. Is this thought completely true? Is there another explanation? What would I say to a friend?`
      },
      {
        title: "Balanced Thinking",
        body: `Balanced thinking is not forced positivity. It is a fairer way of seeing.\n\nFor example, instead of “I ruined everything,” one might say, “I made a mistake, but I can learn from it.” This small shift can reduce emotional pain.`
      },
      {
        title: "Mood and Action",
        body: `CBT also teaches that actions affect mood. When mood is low, small helpful actions can create movement.\n\nA short walk, a completed task, or a conversation with someone safe can gently interrupt the cycle of withdrawal.`
      },
      {
        title: "Breaking Mental Loops",
        body: `The mind sometimes repeats the same worry again and again. CBT offers tools to step out of these loops.\n\nWriting the worry, checking its truth, and choosing one practical response can help the mind feel less trapped.`
      },
      {
        title: "Self-Compassion in CBT",
        body: `CBT is not about blaming yourself for thoughts. It is about learning new mental skills.\n\n${book.title} reminds us that changing thought patterns takes practice. A gentle attitude makes the process easier and more sustainable.`
      },
      {
        title: "Daily CBT Exercise",
        body: `Try this exercise: write one upsetting thought. Then write the emotion it creates. Next, write one balanced replacement thought.\n\nRepeat this often. Over time, the mind learns to respond with more fairness and less fear.`
      },
      {
        title: "Realistic Hope",
        body: `CBT gives realistic hope. It does not say life will always be easy. It says we can learn better ways to meet difficulty.\n\nThis book offers tools that make emotional healing practical and understandable.`
      },
      {
        title: "Closing Reflection",
        body: `After reading ${book.title}, ask: What thought today needs to be questioned gently?\n\nA thought can feel powerful, but it is still something you can examine. Balanced thinking is a form of self-care.`
      },
    ],

    Anxiety: [
      {
        title: "Understanding Anxiety",
        body: `${book.title} helps the reader understand anxiety as a body-mind alarm system. Anxiety is uncomfortable, but it is not always dangerous.\n\nThe goal is not to hate anxiety, but to understand it and respond skillfully.`
      },
      {
        title: "The Worry Cycle",
        body: `Worry often creates more worry. The mind asks “what if?” again and again, hoping to feel safe.\n\nThis book teaches that endless thinking does not always create safety. Sometimes safety begins with grounding in the present.`
      },
      {
        title: "Calming the Body",
        body: `Anxiety lives in the body: fast heartbeat, tight chest, restless hands, shallow breathing.\n\nSlow breathing, relaxed shoulders, and grounding exercises can send the body a message: I am safe in this moment.`
      },
      {
        title: "Challenging Fearful Predictions",
        body: `Anxious thoughts often predict the worst. This book encourages the reader to ask: Is this fear a fact, or a possibility?\n\nA calmer question can open a calmer response.`
      },
      {
        title: "Facing Avoidance",
        body: `Avoidance can make anxiety smaller for a moment but bigger over time. Gentle exposure helps rebuild confidence.\n\nSmall brave steps are better than harsh pressure. Courage grows through practice.`
      },
      {
        title: "One Task at a Time",
        body: `Anxiety often jumps into the future. The reader is reminded to return to one real task.\n\nYou do not need to solve your whole life today. You only need to meet the next moment with steadiness.`
      },
      {
        title: "Kindness Toward Yourself",
        body: `Feeling anxious does not mean you are weak. It means your nervous system is asking for care.\n\n${book.title} encourages patience, structure, and self-kindness.`
      },
      {
        title: "Daily Anxiety Practice",
        body: `Try this: breathe in for four counts, hold for two, breathe out for six. Repeat five times.\n\nThen name five things you can see. This brings the mind back from imagined danger to present reality.`
      },
      {
        title: "Building Confidence",
        body: `Confidence is not the absence of anxiety. It is the belief that you can move forward even with discomfort.\n\nEvery small action taken despite fear becomes evidence of strength.`
      },
      {
        title: "Closing Reflection",
        body: `After reading ${book.title}, ask: What is one worry I can respond to more gently today?\n\nAnxiety may speak loudly, but your calm choices can speak steadily.`
      },
    ],

    Depression: [
      {
        title: "When Life Feels Heavy",
        body: `${book.title} speaks to the experience of sadness, heaviness, and emotional exhaustion. Depression can make even simple tasks feel difficult.\n\nThis reading reminds the reader that a low mood is not a final truth about life.`
      },
      {
        title: "Small Steps Matter",
        body: `When energy is low, small steps become important. Getting out of bed, drinking water, opening a window, or sending one message can matter.\n\nHealing does not always begin dramatically. Sometimes it begins quietly.`
      },
      {
        title: "Thoughts in Low Mood",
        body: `Depression often makes thoughts darker. It may say, “Nothing will change” or “I am not enough.”\n\nThis book encourages the reader to treat such thoughts carefully. They are symptoms of pain, not complete truths.`
      },
      {
        title: "Meaning and Hope",
        body: `Meaning can survive even in difficult seasons. Hope may not feel bright at first; sometimes it begins as the decision to continue.\n\n${book.title} reminds the reader that life can hold future light even when today feels dim.`
      },
      {
        title: "Gentle Routine",
        body: `Routine can support the mind when motivation is low. A simple rhythm gives the day structure.\n\nSleep, food, movement, sunlight, and connection are not small things. They are foundations.`
      },
      {
        title: "Self-Compassion",
        body: `Depression often brings self-blame. This book encourages a kinder voice.\n\nInstead of asking, “Why am I like this?” ask, “What support do I need right now?”`
      },
      {
        title: "Connection and Support",
        body: `Pain grows heavier in isolation. Talking to a trusted person can help the mind feel less alone.\n\nThe reader is reminded that needing support is human. It is not a weakness.`
      },
      {
        title: "Finding Light in Small Things",
        body: `A warm drink, a peaceful song, a short walk, a kind message—small things can become gentle signals of life.\n\n${book.title} encourages noticing these small lights without forcing happiness.`
      },
      {
        title: "Daily Healing Practice",
        body: `Write down one thing you did today, even if it was small. Then write one thing you need tomorrow.\n\nThis practice builds continuity and reminds the mind that effort still exists.`
      },
      {
        title: "Closing Reflection",
        body: `After reading ${book.title}, remember: you are not your lowest day.\n\nHealing may be slow, but slow healing is still healing. Be gentle with the person you are becoming.`
      },
    ],

    Trauma: [
      {
        title: "Understanding Trauma",
        body: `${book.title} explores how painful experiences can affect both mind and body. Trauma is not simply a memory; it can shape reactions, emotions, and the sense of safety.\n\nThe first step is understanding without blame.`
      },
      {
        title: "The Body Remembers",
        body: `The body may react before the mind fully understands why. A sound, place, tone, or situation can awaken old fear.\n\nThis book reminds the reader that these reactions are not weakness. They are survival responses.`
      },
      {
        title: "Restoring Safety",
        body: `Healing begins with safety. This may mean safe people, safe spaces, calming routines, or professional support.\n\nThe nervous system learns slowly. It needs repetition, patience, and care.`
      },
      {
        title: "Choice and Control",
        body: `Trauma can make a person feel powerless. Recovery often involves slowly regaining choice.\n\nSmall choices—what to say, when to rest, who to trust—can rebuild inner strength.`
      },
      {
        title: "Gentle Awareness",
        body: `Awareness should be gentle, not forceful. The reader is reminded not to rush healing or pressure themselves to “move on.”\n\nHealing is not a race. It is a return to safety and wholeness.`
      },
      {
        title: "The Role of Support",
        body: `Support matters deeply. A trusted friend, therapist, mentor, or community can help the healing process feel less lonely.\n\n${book.title} reminds us that trauma often happens in isolation, but healing can happen in connection.`
      },
      {
        title: "Grounding the Present",
        body: `Grounding helps the mind recognize that the present is different from the past.\n\nName five things you see, four things you feel, three things you hear, two things you smell, and one thing you taste. This brings attention back to now.`
      },
      {
        title: "Rebuilding Trust",
        body: `Trust may return slowly. That is okay. The reader is encouraged to honor their pace.\n\nTrusting yourself again is also part of healing: trusting your boundaries, your feelings, and your right to safety.`
      },
      {
        title: "Compassion for the Survivor",
        body: `The person who survived deserves compassion. Instead of asking why you reacted a certain way, ask what that reaction was trying to protect.\n\nThis shift can reduce shame and create space for recovery.`
      },
      {
        title: "Closing Reflection",
        body: `After reading ${book.title}, remember that healing is possible, even if it happens slowly.\n\nYour body can learn safety again. Your mind can find steadiness again. You deserve gentleness.`
      },
    ],

    "Self-Help": [
      {
        title: "Purpose and Direction",
        body: `${book.title} encourages the reader to live with direction. A meaningful life is not built by wishing alone; it grows through clear intention and consistent effort.\n\nThis book reminds us that purpose gives energy to discipline.`
      },
      {
        title: "Power of Thought",
        body: `Thoughts influence behavior. A focused thought can become a plan, and a plan can become action.\n\nThe reader is encouraged to protect the mind from constant negativity and feed it with clarity, hope, and responsibility.`
      },
      {
        title: "Discipline and Habit",
        body: `Success often comes from repeated small habits, not sudden inspiration.\n\n${book.title} reminds us that discipline is not about being perfect. It is about returning again and again to what matters.`
      },
      {
        title: "Confidence Through Action",
        body: `Confidence grows after action. Waiting to feel ready can keep a person stuck.\n\nA small brave step gives the mind evidence: I can move forward. This is how self-belief becomes real.`
      },
      {
        title: "Learning from Failure",
        body: `Failure is not the opposite of growth. It is often part of growth.\n\nThis book teaches that setbacks can become teachers when we reflect honestly and continue with better understanding.`
      },
      {
        title: "Focus and Simplicity",
        body: `A scattered life drains energy. A focused life protects it.\n\nThe reader is encouraged to choose priorities and reduce distractions. Simplicity creates space for meaningful progress.`
      },
      {
        title: "Inner Motivation",
        body: `Outer rewards can inspire, but inner motivation lasts longer. Values, purpose, and service create deeper strength.\n\n${book.title} invites the reader to ask: Why does this goal matter to me?`
      },
      {
        title: "Positive Action",
        body: `Positive thinking is useful only when connected with positive action.\n\nOne planned step, completed honestly, is more powerful than many vague wishes. Progress loves clarity.`
      },
      {
        title: "Daily Growth Practice",
        body: `Write one goal for today. Break it into one small action. Complete that action before judging your progress.\n\nThis simple practice builds momentum and self-respect.`
      },
      {
        title: "Closing Reflection",
        body: `After reading ${book.title}, remember that growth is built daily.\n\nYou do not need to change your whole life in one day. You need one sincere step, repeated with patience.`
      },
    ],

    Philosophy: [
      {
        title: "Asking Better Questions",
        body: `${book.title} invites the reader into deeper questioning. Philosophy is not only about difficult ideas; it is about learning how to think clearly about life.\n\nA thoughtful question can open a wiser path.`
      },
      {
        title: "Truth and Perspective",
        body: `Different people see life through different lenses. Philosophy teaches us to examine those lenses.\n\nThis book encourages the reader to ask: Is this belief truly mine, or did I inherit it without reflection?`
      },
      {
        title: "Character and Choice",
        body: `A good life is shaped by choices. Character is not created in one grand moment, but through repeated actions.\n\n${book.title} reminds us that ordinary decisions reveal who we are becoming.`
      },
      {
        title: "Reason and Humility",
        body: `Reason helps us think clearly. Humility helps us admit when we may be wrong.\n\nTogether, they make the mind strong but not arrogant. This balance is central to wisdom.`
      },
      {
        title: "Freedom of Thought",
        body: `Philosophy gives the courage to think independently. It asks us not to accept every opinion simply because it is popular.\n\nThe reader is encouraged to examine, question, and understand before believing.`
      },
      {
        title: "The Meaning of a Good Life",
        body: `Many philosophical works ask: What makes life good?\n\nIs it pleasure, virtue, truth, peace, courage, love, or service? ${book.title} invites reflection on what truly matters.`
      },
      {
        title: "Facing Difficulty",
        body: `Philosophy does not remove suffering, but it can change how we understand suffering.\n\nA wise mind asks not only “Why is this happening?” but also “How should I respond?”`
      },
      {
        title: "Living with Integrity",
        body: `Integrity means living close to what you believe is true and good.\n\nThis book encourages the reader to reduce the gap between values and actions. A peaceful life often begins there.`
      },
      {
        title: "Daily Philosophical Practice",
        body: `At the end of the day, ask three questions: What did I learn? Where did I act well? Where can I improve?\n\nSuch reflection turns ordinary life into a classroom for wisdom.`
      },
      {
        title: "Closing Reflection",
        body: `After reading ${book.title}, carry one question with you: What kind of person am I becoming?\n\nPhilosophy becomes powerful when it changes not only thought, but life.`
      },
    ],
  };

  const pages = categoryContent[book.category] || categoryContent["Mindfulness"];

  return pages.map((page, index) => {
    const selectedImage =
      index % 3 === 0
        ? book.image || IMAGE_POOL[index % IMAGE_POOL.length]
        : IMAGE_POOL[(book.id + index) % IMAGE_POOL.length];

    return makePage({
      title: `${book.title} — ${page.title}`,
      body: page.body,
      image: selectedImage,
    });
  });
}
const SPECIAL_BOOK_CONTENT = {
  "Bhagavad Gita As It Is": [
    makePage({
      title: "Bhagavad Gita — The Confused Mind of Arjuna",
      image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&q=80",
      body: "Arjuna stands on the battlefield with a trembling heart. He is skilled, brave, and respected, yet in this moment he feels completely confused.\n\nThis opening is powerful because it shows that even strong people can feel lost. Krishna does not reject Arjuna for his weakness. Instead, He guides him toward clarity.\n\nThe lesson is beautiful: confusion is not the end of wisdom. Sometimes it is the beginning of a deeper awakening."
    }),
    makePage({
      title: "Bhagavad Gita — Krishna’s Call to Duty",
      image: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?w=1200&q=80",
      body: "Krishna teaches Arjuna that running away from rightful duty does not create peace. True peace comes when a person performs their duty with courage and sincerity.\n\nDuty does not always feel easy. Sometimes it asks us to stand firm when the heart wants to escape.\n\nThis page reminds us to ask: What is the right thing for me to do now? The answer may be small, but doing it with honesty builds strength."
    }),
    makePage({
      title: "Bhagavad Gita — Action Without Attachment",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80",
      body: "One of the most famous teachings of the Gita is to perform action without attachment to the result.\n\nThis does not mean we should stop caring. It means we should give our best effort without allowing success or failure to decide our worth.\n\nThe effort belongs to us. The result depends on many things: time, situation, other people, and divine will. When we understand this, work becomes lighter and the mind becomes calmer."
    }),
    makePage({
      title: "Bhagavad Gita — The Stable Mind",
      image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80",
      body: "Krishna describes a wise person as one who remains steady in pleasure and pain, success and failure, praise and criticism.\n\nThis does not mean becoming emotionless. It means not being controlled by every emotional wave.\n\nA stable mind can feel deeply and still respond wisely. This is an important lesson for students, workers, and anyone facing pressure in daily life."
    }),
    makePage({
      title: "Bhagavad Gita — The Eternal Self",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=80",
      body: "Krishna teaches that the soul is eternal. The body changes, emotions change, situations change, but the deepest Self is not destroyed.\n\nThis teaching gives courage during loss, fear, and uncertainty. It reminds us that we are more than one failure, one bad day, or one painful chapter.\n\nWhen identity is rooted in the soul, life becomes less frightening."
    }),
    makePage({
      title: "Bhagavad Gita — Training the Mind",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
      body: "The Gita says the mind can be a friend or an enemy. If guided, it supports peace. If uncontrolled, it creates confusion and suffering.\n\nTraining the mind takes practice. Meditation, discipline, prayer, reflection, and right action slowly make the mind steadier.\n\nThis lesson is practical: do not believe every thought blindly. Guide the mind like a loving teacher."
    }),
    makePage({
      title: "Bhagavad Gita — Devotion and Surrender",
      image: "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=1200&q=80",
      body: "Krishna teaches the path of devotion. Devotion is not only ritual; it is love, remembrance, trust, and offering.\n\nSurrender does not mean giving up. It means offering anxiety, pride, and fear to the Divine while continuing to act sincerely.\n\nWhen devotion enters action, even ordinary work becomes meaningful."
    }),
    makePage({
      title: "Bhagavad Gita — Seeing the Divine Everywhere",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
      body: "The Gita expands the vision of the reader. Krishna teaches that the Divine can be seen in strength, wisdom, beauty, light, compassion, and order.\n\nThis changes how we look at the world. Life stops feeling empty and begins to feel sacred.\n\nA grateful person sees signs of grace even in small things."
    }),
    makePage({
      title: "Bhagavad Gita — Courage in Difficult Times",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
      body: "Krishna does not ask Arjuna to become careless. He asks him to become courageous.\n\nCourage in the Gita is not loud aggression. It is calm strength guided by wisdom. It is the ability to act rightly even when the heart feels afraid.\n\nThis teaching is helpful whenever life feels heavy: breathe, remember your values, and take the next right step."
    }),
    makePage({
      title: "Bhagavad Gita — Daily Life Reflection",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=80",
      body: "The Gita becomes powerful when its teachings enter daily life.\n\nDo your work honestly. Speak with kindness. Control the mind gently. Offer the result. Remember the Divine. Help others when you can.\n\nClosing thought: You are not defined by one confused moment. Like Arjuna, you can listen, rise, and act with a steadier heart."
    }),
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
         <span style={{ color: "#64748B", fontSize: 11 }}>10 pages · Simple reading</span>
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