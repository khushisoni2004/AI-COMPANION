import { useState, useEffect, useRef } from "react";
import { FilesetResolver, PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

/* ---------------------------------------------
   EXERCISES
--------------------------------------------- */
const exercises = [
  {
    id: 1,
    title: "Sun Salutation",
    category: "Yoga",
    duration: "10 min",
    level: "Beginner",
    color: "#FF6B35",
    icon: "🌞",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
    description: "A flowing sequence of 12 poses that warm up the entire body, improve flexibility and build strength.",
    steps: [
      "Stand tall at the top of your mat, feet together, hands at heart center.",
      "Inhale: Sweep arms overhead, slight backbend.",
      "Exhale: Forward fold, bringing hands to the mat.",
      "Inhale: Step right foot back into a low lunge.",
      "Hold: Plank pose, keeping body in a straight line.",
      "Lower down with control.",
      "Inhale: Cobra or Upward Dog — open the chest.",
      "Exhale: Downward Facing Dog — hold for 5 breaths.",
      "Walk feet to hands, return to standing.",
      "Inhale arms up, exhale back to heart center. Repeat.",
    ],
  },
  {
    id: 2,
    title: "Warrior I & II",
    category: "Yoga",
    duration: "12 min",
    level: "Beginner",
    color: "#E63946",
    icon: "⚔️",
    image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80",
    description: "Powerful standing poses that build leg strength, open hips and develop focus and balance.",
    steps: [
      "Step your left foot back 3-4 feet, turn it out 45 degrees.",
      "Bend your right knee to 90 degrees.",
      "Raise both arms straight up, look forward.",
      "Open your hips to the side — transition to Warrior II.",
      "Extend arms parallel to the floor, gaze over front fingertips.",
      "Hold each side for 5 deep breaths.",
      "Repeat on the other side.",
    ],
  },
  {
    id: 3,
    title: "Child's Pose Flow",
    category: "Yoga",
    duration: "8 min",
    level: "Beginner",
    color: "#FF9F1C",
    icon: "🌿",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&q=80",
    description: "A restorative resting pose that gently stretches the back, hips, thighs and ankles.",
    steps: [
      "Kneel on your mat, big toes touching, knees hip-width apart.",
      "Sit back onto your heels.",
      "Slowly lower your torso between your thighs.",
      "Extend arms forward or lay them alongside your body.",
      "Rest your forehead on the mat.",
      "Breathe deeply, hold for 1-3 minutes.",
      "Slowly rise back up on an inhale.",
    ],
  },
  {
    id: 4,
    title: "Tree Pose",
    category: "Yoga",
    duration: "6 min",
    level: "Beginner",
    color: "#2DC653",
    icon: "🌳",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80",
    description: "A balancing posture that improves focus, stability and strengthens the legs and core.",
    steps: [
      "Stand tall, feet together, arms at sides.",
      "Shift weight onto your left foot.",
      "Place right foot on left inner thigh or calf, avoid the knee.",
      "Bring hands to heart center or raise overhead.",
      "Fix gaze on a non-moving point.",
      "Hold for 30 seconds, switch sides.",
    ],
  },
  {
    id: 5,
    title: "Downward Dog Hold",
    category: "Yoga",
    duration: "5 min",
    level: "Beginner",
    color: "#7B2D8B",
    icon: "🐕",
    image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&q=80",
    description: "A foundational inversion that stretches the hamstrings, calves and spine while building arm strength.",
    steps: [
      "Start on hands and knees, wrists under shoulders.",
      "Tuck toes, lift hips up and back.",
      "Straighten legs as much as comfortable.",
      "Press palms firmly into mat, spread fingers wide.",
      "Let your head hang between arms.",
      "Hold for 5-10 breaths, pedal feet to warm up.",
    ],
  },
  {
    id: 6,
    title: "Neck & Shoulder Release",
    category: "Stretch",
    duration: "8 min",
    level: "All Levels",
    color: "#00B4D8",
    icon: "💆",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    description: "Targeted stretches to release tension in the neck and shoulder region, perfect for desk workers.",
    steps: [
      "Sit tall, drop right ear to right shoulder — hold 30 seconds.",
      "Gently roll chin down to chest.",
      "Drop left ear to left shoulder — hold 30 seconds.",
      "Shoulder rolls: 5 forward, 5 backward.",
      "Cross right arm across chest, hold at elbow — 30 seconds.",
      "Repeat with left arm.",
      "Thread the needle on all fours.",
    ],
  },
  {
    id: 7,
    title: "Hip Flexor Stretch",
    category: "Stretch",
    duration: "10 min",
    level: "All Levels",
    color: "#F72585",
    icon: "🦋",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    description: "Opens tight hip flexors from prolonged sitting, reducing lower back pain and improving posture.",
    steps: [
      "Kneel on left knee, right foot forward in a lunge.",
      "Keep torso upright, tuck pelvis slightly.",
      "Shift weight forward until you feel a stretch in left hip.",
      "Hold 30 seconds, breathe deeply.",
      "Option: raise left arm overhead for deeper stretch.",
      "Switch sides and repeat.",
    ],
  },
  {
    id: 8,
    title: "Seated Forward Fold",
    category: "Stretch",
    duration: "6 min",
    level: "All Levels",
    color: "#4CC9F0",
    icon: "🪑",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
    description: "Deeply stretches the entire back side of the body from heels to the back of the head.",
    steps: [
      "Sit on mat with legs extended straight in front.",
      "Flex feet, pressing heels forward.",
      "Inhale, lengthen spine, raise arms overhead.",
      "Exhale, hinge at hips and fold forward.",
      "Reach toward feet, hold ankles or shins.",
      "Hold for 1-3 minutes, breathing steadily.",
    ],
  },
  {
    id: 9,
    title: "Figure Four Stretch",
    category: "Stretch",
    duration: "8 min",
    level: "All Levels",
    color: "#06D6A0",
    icon: "4️⃣",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80",
    description: "An effective piriformis and glute stretch that helps relieve sciatic nerve pain.",
    steps: [
      "Lie on your back, knees bent, feet flat.",
      "Cross right ankle over left thigh.",
      "Flex right foot to protect the knee.",
      "Thread hands around left thigh, pull toward chest.",
      "Hold 30-60 seconds, feel stretch in right glute.",
      "Switch legs and repeat.",
    ],
  },
  {
    id: 10,
    title: "Chest Opener Stretch",
    category: "Stretch",
    duration: "5 min",
    level: "All Levels",
    color: "#FFB703",
    icon: "💪",
    image: "https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=600&q=80",
    description: "Counteracts rounded shoulders from sitting by opening the chest and stretching the pectorals.",
    steps: [
      "Stand in a doorway, arms at 90 degrees.",
      "Place forearms on door frame.",
      "Step one foot forward, lean slightly into the doorway.",
      "Feel the stretch across your chest.",
      "Hold 30 seconds, avoid shrugging shoulders.",
      "Repeat 3 times.",
    ],
  },
  {
    id: 11,
    title: "Core Stability",
    category: "Strength",
    duration: "15 min",
    level: "Intermediate",
    color: "#7C5CFC",
    icon: "⚡",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    description: "A comprehensive core workout targeting all abdominal muscles for a stable, injury-resistant midsection.",
    steps: [
      "Start in plank position — hands under shoulders.",
      "Hold plank for 30 seconds, breathing steadily.",
      "Side plank right — hold 20 seconds.",
      "Side plank left — hold 20 seconds.",
      "Dead bug: Extend opposite arm and leg simultaneously.",
      "Bird dog: On all fours, extend opposite arm and leg.",
      "Hollow body hold: Arms and legs slightly elevated.",
      "15 bicycle crunches — slow and controlled.",
    ],
  },
  {
    id: 12,
    title: "Push-Up Progression",
    category: "Strength",
    duration: "12 min",
    level: "Beginner",
    color: "#E63946",
    icon: "💪",
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&q=80",
    description: "Progressive push-up variations to build upper body strength from wall to full push-ups.",
    steps: [
      "Start with wall push-ups if you're a beginner.",
      "Place hands on wall, slightly wider than shoulder-width.",
      "Bend elbows, bring chest toward wall.",
      "Push back to start — 3 sets of 10.",
      "Progress to knee push-ups on the floor.",
      "Progress to full push-ups when ready.",
      "Keep body straight as a board throughout.",
      "3 sets of 8-12 reps with 60s rest.",
    ],
  },
  {
    id: 13,
    title: "Bodyweight Squats",
    category: "Strength",
    duration: "10 min",
    level: "Beginner",
    color: "#FF6B35",
    icon: "🦵",
    image: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&q=80",
    description: "The king of lower body exercises that builds quad, glute, and hamstring strength.",
    steps: [
      "Stand with feet shoulder-width apart.",
      "Turn toes slightly outward.",
      "Brace core, chest up.",
      "Push hips back and bend knees to lower.",
      "Aim for thighs parallel to the floor.",
      "Drive through heels to stand back up.",
      "3 sets of 15 reps.",
    ],
  },
  {
    id: 14,
    title: "Glute Bridges",
    category: "Strength",
    duration: "10 min",
    level: "Beginner",
    color: "#F72585",
    icon: "🍑",
    image: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=600&q=80",
    description: "Activates and strengthens the glutes, hamstrings and core while being gentle on the lower back.",
    steps: [
      "Lie on back, knees bent, feet flat on floor.",
      "Place feet hip-width apart.",
      "Press through heels, squeeze glutes.",
      "Lift hips until body forms a straight line.",
      "Hold 2 seconds at the top.",
      "Lower with control.",
      "3 sets of 15 reps.",
    ],
  },
  {
    id: 15,
    title: "Tricep Dips",
    category: "Strength",
    duration: "8 min",
    level: "Intermediate",
    color: "#4361EE",
    icon: "💺",
    image: "https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=600&q=80",
    description: "Uses bodyweight to target the triceps, shoulders and chest using a chair or bench.",
    steps: [
      "Sit on edge of sturdy chair or bench.",
      "Place hands beside hips, fingers forward.",
      "Slide off the edge, legs extended.",
      "Bend elbows to lower body toward floor.",
      "Lower until upper arms are parallel to floor.",
      "Push back up, straightening arms.",
      "3 sets of 10-12 reps.",
    ],
  },
  {
    id: 16,
    title: "Superman Hold",
    category: "Strength",
    duration: "8 min",
    level: "Beginner",
    color: "#3A86FF",
    icon: "🦸",
    image: "https://images.unsplash.com/photo-1602827114135-2e53a81cb5f3?w=600&q=80",
    description: "Strengthens the posterior chain — lower back, glutes and hamstrings — crucial for posture.",
    steps: [
      "Lie face down on mat, arms extended overhead.",
      "Engage core and glutes.",
      "Simultaneously lift arms, chest and legs off floor.",
      "Hold for 2-3 seconds at the top.",
      "Lower with control.",
      "3 sets of 12 reps.",
    ],
  },
  {
    id: 17,
    title: "Lunges",
    category: "Strength",
    duration: "12 min",
    level: "Beginner",
    color: "#2DC653",
    icon: "🚶",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    description: "A unilateral leg exercise that builds strength, balance and corrects muscle imbalances.",
    steps: [
      "Stand tall, feet together.",
      "Step right foot forward 2-3 feet.",
      "Lower back knee toward floor.",
      "Keep front knee above ankle.",
      "Push off front foot to return.",
      "Alternate legs — 10 reps each.",
      "3 sets total.",
    ],
  },
  {
    id: 18,
    title: "Mindful Walking",
    category: "Cardio",
    duration: "20 min",
    level: "Beginner",
    color: "#FFD166",
    icon: "🚶",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
    description: "A meditative walking practice that combines cardio benefits with mindfulness and stress reduction.",
    steps: [
      "Begin by standing still, feeling your weight on both feet.",
      "Take a slow step forward, heel first.",
      "Notice the sensation of the ground.",
      "Breathe in for 4 steps, out for 4 steps.",
      "Maintain a steady, comfortable pace.",
      "Continue for the full 20 minutes.",
      "End standing still, returning to center.",
    ],
  },
  {
    id: 19,
    title: "Jump Rope (No Rope)",
    category: "Cardio",
    duration: "10 min",
    level: "Intermediate",
    color: "#FF6B6B",
    icon: "🪢",
    image: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&q=80",
    description: "Simulate jump rope movements without a rope for a high-intensity cardio burn anywhere.",
    steps: [
      "Stand with feet together, arms at sides.",
      "Begin small hops on balls of feet.",
      "Rotate forearms as if turning a rope.",
      "Jump continuously for 30 seconds.",
      "Rest 15 seconds.",
      "Progress to double-unders simulation.",
      "Repeat for 10 minutes total.",
    ],
  },
  {
    id: 20,
    title: "High Knees",
    category: "Cardio",
    duration: "8 min",
    level: "Beginner",
    color: "#EF476F",
    icon: "🦵",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80",
    description: "An effective cardio move that raises heart rate while strengthening hip flexors and core.",
    steps: [
      "Stand tall with feet hip-width apart.",
      "Lift right knee to hip height.",
      "Quickly switch, lifting left knee.",
      "Pump arms in opposition.",
      "Maintain an upright posture.",
      "Continue for 30 seconds on, 15 off.",
      "Total 8 minutes.",
    ],
  },
  {
    id: 21,
    title: "Burpees",
    category: "Cardio",
    duration: "10 min",
    level: "Advanced",
    color: "#FF4500",
    icon: "💥",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    description: "The ultimate full-body cardio exercise that builds strength, endurance and burns maximum calories.",
    steps: [
      "Stand with feet shoulder-width apart.",
      "Drop into a squat, hands on floor.",
      "Jump feet back into plank position.",
      "Perform one push-up.",
      "Jump feet back to squat position.",
      "Explosively jump up with arms overhead.",
      "Land softly and repeat.",
      "Aim for 10 reps per set.",
    ],
  },
  {
    id: 22,
    title: "Mountain Climbers",
    category: "Cardio",
    duration: "8 min",
    level: "Intermediate",
    color: "#6A0572",
    icon: "⛰️",
    image: "https://images.unsplash.com/photo-1616279967983-ec413476e824?w=600&q=80",
    description: "A dynamic core exercise that doubles as cardio by driving knees alternately toward the chest.",
    steps: [
      "Start in a high plank position.",
      "Keep hips level with the body.",
      "Drive right knee toward chest.",
      "Quickly switch legs.",
      "Maintain a fast, controlled pace.",
      "30 seconds on, 15 off.",
      "Repeat for 8 minutes.",
    ],
  },
  {
    id: 23,
    title: "Jumping Jacks",
    category: "Cardio",
    duration: "6 min",
    level: "Beginner",
    color: "#00B4D8",
    icon: "⭐",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
    description: "A classic warm-up exercise that elevates heart rate and loosens the whole body.",
    steps: [
      "Stand tall, feet together, arms at sides.",
      "Jump, spreading feet to shoulder width.",
      "Simultaneously raise arms overhead.",
      "Jump back to starting position.",
      "Keep a brisk, rhythmic pace.",
      "3 sets of 30 seconds.",
    ],
  },
  {
    id: 24,
    title: "Step-Ups",
    category: "Cardio",
    duration: "12 min",
    level: "Beginner",
    color: "#FB8500",
    icon: "🪜",
    image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&q=80",
    description: "A low-impact cardio option using stairs or a step that also tones the legs and glutes.",
    steps: [
      "Stand in front of a step or stair.",
      "Step right foot up onto the step.",
      "Bring left foot up to meet it.",
      "Step right foot back down.",
      "Follow with left foot.",
      "Alternate leading foot every 10 reps.",
      "Continue for 12 minutes at a steady pace.",
    ],
  },
  {
    id: 25,
    title: "4-7-8 Breathing",
    category: "Breathing",
    duration: "5 min",
    level: "All Levels",
    color: "#80FFDB",
    icon: "🌬️",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
    description: "A powerful relaxation technique that activates the parasympathetic nervous system in minutes.",
    steps: [
      "Sit comfortably, close your eyes.",
      "Exhale completely through your mouth.",
      "Inhale through nose for 4 counts.",
      "Hold breath for 7 counts.",
      "Exhale slowly through mouth for 8 counts.",
      "This is one breath cycle.",
      "Repeat 4 cycles, twice a day.",
    ],
  },
  {
    id: 26,
    title: "Box Breathing",
    category: "Breathing",
    duration: "5 min",
    level: "All Levels",
    color: "#48CAE4",
    icon: "📦",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    description: "Used by Navy SEALs to calm the nervous system under extreme stress. Works anywhere, anytime.",
    steps: [
      "Sit upright, relax shoulders.",
      "Exhale all air from lungs.",
      "Inhale slowly for 4 counts.",
      "Hold breath for 4 counts.",
      "Exhale slowly for 4 counts.",
      "Hold for 4 counts.",
      "Repeat 4-6 cycles.",
    ],
  },
  {
    id: 27,
    title: "Alternate Nostril Breathing",
    category: "Breathing",
    duration: "8 min",
    level: "All Levels",
    color: "#C77DFF",
    icon: "👃",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&q=80",
    description: "Nadi Shodhana pranayama that balances the left and right hemispheres of the brain.",
    steps: [
      "Sit comfortably with spine erect.",
      "Place right thumb on right nostril.",
      "Inhale through left nostril.",
      "Close left nostril with ring finger.",
      "Open and exhale through right nostril.",
      "Inhale through right nostril.",
      "Alternate for 8 minutes.",
    ],
  },
  {
    id: 28,
    title: "Spinal Twist",
    category: "Mobility",
    duration: "6 min",
    level: "All Levels",
    color: "#06D6A0",
    icon: "🌀",
    image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&q=80",
    description: "Rotational stretches that decompress the spine, improve mobility and aid digestion.",
    steps: [
      "Sit on mat with legs extended.",
      "Bend right knee, foot flat outside left thigh.",
      "Inhale, lengthen spine.",
      "Exhale, twist right, left elbow to outside of right knee.",
      "Look over right shoulder.",
      "Hold 5 breaths, return to center.",
      "Repeat on other side.",
    ],
  },
  {
    id: 29,
    title: "Cat-Cow Flow",
    category: "Mobility",
    duration: "5 min",
    level: "All Levels",
    color: "#FFB703",
    icon: "🐱",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
    description: "A gentle spinal warm-up that syncs movement with breath, perfect to start any practice.",
    steps: [
      "Start on hands and knees, wrists under shoulders.",
      "Inhale: Drop belly, lift head and tailbone — Cow.",
      "Exhale: Round spine to ceiling, tuck chin — Cat.",
      "Flow between these two positions.",
      "Sync each movement with breath.",
      "Continue for 10 rounds.",
    ],
  },
  {
    id: 30,
    title: "90/90 Hip Stretch",
    category: "Mobility",
    duration: "8 min",
    level: "Intermediate",
    color: "#EF476F",
    icon: "🦯",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    description: "A comprehensive hip mobility exercise targeting both internal and external hip rotation.",
    steps: [
      "Sit on floor, both legs bent at 90-degree angles.",
      "Front leg: knee and ankle on the floor.",
      "Back leg: hip, knee bent to the side.",
      "Sit tall, avoid rounding forward.",
      "Hold position for 2 minutes.",
      "Switch sides.",
      "Gradually progress to forward fold.",
    ],
  },
  {
    id: 31,
    title: "Wrist & Ankle Circles",
    category: "Mobility",
    duration: "4 min",
    level: "All Levels",
    color: "#4CC9F0",
    icon: "⭕",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80",
    description: "Joint mobility circles to lubricate the wrists and ankles, preventing injury during workouts.",
    steps: [
      "Extend arms in front of you.",
      "Make fists with both hands.",
      "Circle wrists 10 times clockwise.",
      "Circle 10 times counterclockwise.",
      "Lift one foot off the floor.",
      "Circle ankle 10 times each direction.",
      "Switch feet.",
    ],
  },
  {
    id: 32,
    title: "Foam Roll Back",
    category: "Mobility",
    duration: "10 min",
    level: "All Levels",
    color: "#7B2D8B",
    icon: "🛞",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80",
    description: "Self-myofascial release for the thoracic spine to improve posture and reduce back pain.",
    steps: [
      "Place foam roller under upper back horizontally.",
      "Support head with hands, knees bent.",
      "Lift hips slightly off ground.",
      "Roll slowly from mid to upper back.",
      "Pause on tight spots for 30 seconds.",
      "Avoid rolling the lower back.",
      "Repeat for 10 minutes.",
    ],
  },
];

const categories = ["All", "Yoga", "Stretch", "Strength", "Cardio", "Breathing", "Mobility"];
const categoryColors = {
  All: "#ffffff", Yoga: "#FF6B35", Stretch: "#00B4D8", Strength: "#7C5CFC",
  Cardio: "#EF476F", Breathing: "#80FFDB", Mobility: "#06D6A0",
};
const metricCardStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 8px", textAlign: "center" };
const metricLabelStyle = { fontSize: "0.68rem", color: "#8892b0", marginBottom: 4 };
const metricValueStyle = { fontSize: "0.95rem", fontWeight: 700, color: "#e8eaf6" };

/* ---------------------------------------------
   HELPERS
--------------------------------------------- */
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function angle3(a, b, c) {
  if (!a || !b || !c) return 0;
  const abx = a.x - b.x, aby = a.y - b.y;
  const cbx = c.x - b.x, cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magAB = Math.sqrt(abx * abx + aby * aby);
  const magCB = Math.sqrt(cbx * cbx + cby * cby);
  if (!magAB || !magCB) return 0;
  return (Math.acos(clamp(dot / (magAB * magCB), -1, 1)) * 180) / Math.PI;
}

function avg(a, b) { return (a + b) / 2; }

// Check if person is roughly horizontal (lying down / prone / plank)
function isBodyHorizontal(lm) {
  const leftShoulder = lm[11], rightShoulder = lm[12];
  const leftHip = lm[23], rightHip = lm[24];
  const leftAnkle = lm[27], rightAnkle = lm[28];
  const shoulderY = avg(leftShoulder.y, rightShoulder.y);
  const hipY = avg(leftHip.y, rightHip.y);
  const ankleY = avg(leftAnkle.y, rightAnkle.y);
  // Vertical spread between shoulder and ankle — if small, body is horizontal
  const verticalSpread = Math.abs(ankleY - shoulderY);
  return verticalSpread < 0.35; // horizontal if all landmarks at similar heights
}

// Check if person is standing (upright)
function isBodyUpright(lm) {
  const leftShoulder = lm[11], rightShoulder = lm[12];
  const leftHip = lm[23], rightHip = lm[24];
  const leftAnkle = lm[27], rightAnkle = lm[28];
  const shoulderY = avg(leftShoulder.y, rightShoulder.y);
  const hipY = avg(leftHip.y, rightHip.y);
  const ankleY = avg(leftAnkle.y, rightAnkle.y);
  // In normalized coords, Y increases downward. Head at top (small Y), feet at bottom (large Y)
  const verticalSpread = Math.abs(ankleY - shoulderY);
  return verticalSpread > 0.4 && shoulderY < hipY && hipY < ankleY;
}

// Check if person is sitting / kneeling (hips near mid-height, not as low as ankles)
function isBodySeated(lm) {
  const leftHip = lm[23], rightHip = lm[24];
  const leftKnee = lm[25], rightKnee = lm[26];
  const leftAnkle = lm[27], rightAnkle = lm[28];
  const hipY = avg(leftHip.y, rightHip.y);
  const kneeY = avg(leftKnee.y, rightKnee.y);
  const ankleY = avg(leftAnkle.y, rightAnkle.y);
  // Seated: hips lower than mid-point, knees bent significantly
  const kneeAngleL = angle3(lm[23], lm[25], lm[27]);
  const kneeAngleR = angle3(lm[24], lm[26], lm[28]);
  return kneeAngleL < 120 && kneeAngleR < 120 && hipY < ankleY;
}

/* ==============================================
   ACCURATE POSE FEEDBACK - Per Exercise
   Uses body orientation + joint angles strictly
   ============================================== */
function getPoseFeedback(exerciseTitle, lm) {
  if (!lm || lm.length < 29) {
    return { ok: false, label: "No pose detected", advice: "Stand where your full body is visible.", score: 0 };
  }

  const nose = lm[0];
  const leftShoulder = lm[11], rightShoulder = lm[12];
  const leftElbow = lm[13], rightElbow = lm[14];
  const leftWrist = lm[15], rightWrist = lm[16];
  const leftHip = lm[23], rightHip = lm[24];
  const leftKnee = lm[25], rightKnee = lm[26];
  const leftAnkle = lm[27], rightAnkle = lm[28];

  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  const hipTilt = Math.abs(leftHip.y - rightHip.y);
  const shoulderCenterX = avg(leftShoulder.x, rightShoulder.x);
  const hipCenterX = avg(leftHip.x, rightHip.x);
  const backLean = Math.abs(shoulderCenterX - hipCenterX);

  const leftKneeAngle = angle3(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = angle3(rightHip, rightKnee, rightAnkle);
  const leftElbowAngle = angle3(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = angle3(rightShoulder, rightElbow, rightWrist);
  const leftHipAngle = angle3(leftShoulder, leftHip, leftKnee);
  const rightHipAngle = angle3(rightShoulder, rightHip, rightKnee);

  const horizontal = isBodyHorizontal(lm);
  const upright = isBodyUpright(lm);

  // Wrist positions relative to body
  const wristsAboveShoulders = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
  const wristsAtShoulderLevel = Math.abs(avg(leftWrist.y, rightWrist.y) - avg(leftShoulder.y, rightShoulder.y)) < 0.1;
  const wristsBelowHips = leftWrist.y > leftHip.y && rightWrist.y > rightHip.y;

  const stanceWide = Math.abs(leftAnkle.x - rightAnkle.x) > 0.22;
  const armsWide = Math.abs(leftWrist.x - rightWrist.x) > Math.abs(leftShoulder.x - rightShoulder.x) + 0.12;
  const oneFootRaised = Math.abs(leftAnkle.y - rightAnkle.y) > 0.08 || Math.abs(leftKnee.y - rightKnee.y) > 0.08;

  switch (exerciseTitle) {

    /* ---- YOGA ---- */
    case "Sun Salutation": {
      // Accept multiple valid poses in the sequence: standing, forward fold, plank, downdog
      // Standing with arms up is valid
      const standingArmsUp = upright && wristsAboveShoulders && shoulderTilt < 0.07;
      // Forward fold: standing but wrists near ground level
      const forwardFold = upright && wristsBelowHips;
      // Plank: horizontal, arms straight
      const plankPose = horizontal && leftElbowAngle > 155 && rightElbowAngle > 155 && backLean < 0.08;
      // Downdog: hips highest, arms straight
      const hipY = avg(leftHip.y, rightHip.y);
      const shoulderY = avg(leftShoulder.y, rightShoulder.y);
      const downdogPose = hipY < shoulderY && leftElbowAngle > 150 && rightElbowAngle > 150;

      const ok = standingArmsUp || forwardFold || plankPose || downdogPose;
      let advice = "Perform one of the sequence poses: stand with arms up, forward fold, plank, or downward dog.";
      if (ok) advice = "Good form! Flow through the sequence with breath.";
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice, score: ok ? 90 : 45 };
    }

    case "Warrior I & II": {
      // MUST be upright/standing
      if (!upright) return { ok: false, label: "Wrong Pose", advice: "Stand up for Warrior pose.", score: 30 };
      // Wide stance required
      if (!stanceWide) return { ok: false, label: "Wrong Pose", advice: "Widen your stance — step feet further apart.", score: 40 };
      // Front knee must be bent (60–120°), not straight
      const frontKneeBent = (leftKneeAngle > 60 && leftKneeAngle < 125) || (rightKneeAngle > 60 && rightKneeAngle < 125);
      if (!frontKneeBent) return { ok: false, label: "Wrong Pose", advice: "Bend your front knee to 90 degrees.", score: 45 };
      // Arms raised (Warrior I) or arms wide (Warrior II)
      const warriorArms = wristsAboveShoulders || armsWide;
      if (!warriorArms) return { ok: false, label: "Wrong Pose", advice: "Raise arms overhead or extend arms to the sides.", score: 50 };
      return { ok: true, label: "Right Pose", advice: "Strong Warrior! Keep front knee directly over ankle.", score: 92 };
    }

    case "Child's Pose Flow": {
      // Body should be horizontal/low — NOT upright
      if (upright) return { ok: false, label: "Wrong Pose", advice: "Kneel down and fold forward into Child's Pose.", score: 25 };
      // Hips should be back (near ankles), shoulders forward/low
      const hipY = avg(leftHip.y, rightHip.y);
      const shoulderY = avg(leftShoulder.y, rightShoulder.y);
      const ankleY = avg(leftAnkle.y, rightAnkle.y);
      // In child's pose: hips sit back towards heels (hips close to ankles in position)
      const hipsSitBack = Math.abs(hipY - ankleY) < 0.25;
      const armsExtended = wristsAboveShoulders || Math.abs(avg(leftWrist.y, rightWrist.y) - shoulderY) < 0.15;
      const ok = hipsSitBack && !upright;
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? "Beautiful Child's Pose. Relax and breathe." : "Sit hips back to heels and lower your torso.", score: ok ? 91 : 44 };
    }

    case "Tree Pose": {
      // MUST be upright
      if (!upright) return { ok: false, label: "Wrong Pose", advice: "Stand upright for Tree Pose.", score: 25 };
      // One foot must be raised
      if (!oneFootRaised) return { ok: false, label: "Wrong Pose", advice: "Lift one foot and place it on the opposite inner thigh or calf.", score: 40 };
      // Shoulders must be level (no lean)
      if (shoulderTilt > 0.07) return { ok: false, label: "Wrong Pose", advice: "Level your shoulders — don't lean to one side.", score: 50 };
      // Body shouldn't lean much
      if (backLean > 0.09) return { ok: false, label: "Wrong Pose", advice: "Keep your torso centered and upright.", score: 50 };
      return { ok: true, label: "Right Pose", advice: "Excellent balance! Breathe steadily and hold.", score: 94 };
    }

    case "Downward Dog Hold": {
      const hipY = avg(leftHip.y, rightHip.y);
      const shoulderY = avg(leftShoulder.y, rightShoulder.y);
      const ankleY = avg(leftAnkle.y, rightAnkle.y);
      // Hips must be HIGHER than shoulders (inverted V)
      if (hipY >= shoulderY) return { ok: false, label: "Wrong Pose", advice: "Push hips up higher to form an inverted V shape.", score: 35 };
      // Arms must be straight
      if (leftElbowAngle < 145 || rightElbowAngle < 145) return { ok: false, label: "Wrong Pose", advice: "Straighten your arms fully — press palms into the floor.", score: 45 };
      // Legs should be relatively straight
      const legsExtended = leftKneeAngle > 130 && rightKneeAngle > 130;
      if (!legsExtended) return { ok: false, label: "Wrong Pose", advice: "Try to straighten your legs more.", score: 55 };
      // Wrists should be below/at shoulder level (hands on floor)
      if (!wristsBelowHips && !wristsAtShoulderLevel) return { ok: false, label: "Wrong Pose", advice: "Place hands flat on the floor.", score: 50 };
      return { ok: true, label: "Right Pose", advice: "Perfect Downward Dog! Keep pushing hips to the sky.", score: 95 };
    }

    /* ---- STRETCH ---- */
    case "Neck & Shoulder Release": {
      // Seated or standing, head should be tilted (asymmetric shoulder tilt)
      if (!upright && !isBodySeated(lm)) return { ok: false, label: "Wrong Pose", advice: "Sit or stand upright for this stretch.", score: 30 };
      const headTilted = shoulderTilt > 0.04; // Ear toward shoulder
      const shouldersRelaxed = backLean < 0.1;
      const ok = shouldersRelaxed; // Accept if spine is neutral; head tilt is optional cue
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? "Good. Tilt your ear gently toward your shoulder." : "Sit tall and relax your shoulders down.", score: ok ? 85 : 45 };
    }

    case "Hip Flexor Stretch": {
      // One knee should be lower (kneeling lunge) — body somewhat upright
      if (!upright && !stanceWide) return { ok: false, label: "Wrong Pose", advice: "Step one foot forward into a kneeling lunge position.", score: 30 };
      const inLunge = stanceWide && ((leftKneeAngle > 70 && leftKneeAngle < 125) || (rightKneeAngle > 70 && rightKneeAngle < 125));
      const torsoUpright = backLean < 0.12 && shoulderTilt < 0.1;
      const ok = inLunge && torsoUpright;
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? "Great lunge! Keep torso tall and push hips forward." : "Step into a wide lunge and keep your torso upright.", score: ok ? 89 : 44 };
    }

    case "Seated Forward Fold": {
      // Should NOT be fully upright — body folding forward
      if (upright && !wristsBelowHips) return { ok: false, label: "Wrong Pose", advice: "Sit on the floor and fold forward over extended legs.", score: 30 };
      const legsExtended = leftKneeAngle > 150 && rightKneeAngle > 150;
      const foldingForward = wristsBelowHips || (avg(leftWrist.y, rightWrist.y) > avg(leftHip.y, rightHip.y));
      const ok = legsExtended && foldingForward;
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? "Deep fold! Breathe into the stretch." : "Sit with legs straight and reach hands toward feet.", score: ok ? 88 : 42 };
    }

    case "Figure Four Stretch": {
      // Lying on back — horizontal
      if (!horizontal) return { ok: false, label: "Wrong Pose", advice: "Lie flat on your back for this stretch.", score: 25 };
      // Knees should be bent
      const kneesBent = leftKneeAngle < 120 && rightKneeAngle < 120;
      if (!kneesBent) return { ok: false, label: "Wrong Pose", advice: "Bend both knees with feet flat, then cross one ankle over thigh.", score: 45 };
      // One leg should be more bent / at different angle (figure four shape)
      const asymmetricKnee = Math.abs(leftKneeAngle - rightKneeAngle) > 25;
      const ok = kneesBent && asymmetricKnee;
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? "Perfect! Feel the stretch in your glute." : "Cross your ankle over your opposite thigh to create the '4' shape.", score: ok ? 90 : 48 };
    }

    case "Chest Opener Stretch": {
      // Standing, arms at or behind shoulder level
      if (!upright) return { ok: false, label: "Wrong Pose", advice: "Stand in a doorway for this stretch.", score: 25 };
      // Elbows bent at ~90° and out to sides (arms wide, elbows visible)
      const elbowsBentRight = leftElbowAngle > 70 && leftElbowAngle < 115 && rightElbowAngle > 70 && rightElbowAngle < 115;
      // Wrists behind / at shoulder line
      const armsOpened = armsWide;
      const ok = elbowsBentRight && armsOpened && shoulderTilt < 0.07;
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? "Nice chest opener! Feel the stretch across your pecs." : "Bend elbows 90° and spread arms wide like a goalpost.", score: ok ? 88 : 43 };
    }

    /* ---- STRENGTH ---- */
    case "Core Stability": {
      // Plank position: horizontal, arms straight, body aligned
      if (!horizontal) return { ok: false, label: "Wrong Pose", advice: "Get into a plank position — face down, arms straight.", score: 25 };
      const armsStr = leftElbowAngle > 155 && rightElbowAngle > 155;
      if (!armsStr) return { ok: false, label: "Wrong Pose", advice: "Straighten your arms fully in the plank.", score: 40 };
      // Back alignment — hips shouldn't sag or pike
      const hipY = avg(leftHip.y, rightHip.y);
      const shoulderY = avg(leftShoulder.y, rightShoulder.y);
      const ankleY = avg(leftAnkle.y, rightAnkle.y);
      const hipSagging = hipY > avg(shoulderY, ankleY) + 0.05;
      const hipPiking = hipY < avg(shoulderY, ankleY) - 0.08;
      if (hipSagging) return { ok: false, label: "Wrong Pose", advice: "Don't let hips sag — squeeze core and glutes.", score: 50 };
      if (hipPiking) return { ok: false, label: "Wrong Pose", advice: "Lower hips — body should be in a straight line.", score: 50 };
      return { ok: true, label: "Right Pose", advice: "Solid plank! Keep breathing and hold the position.", score: 93 };
    }

    case "Push-Up Progression": {
      // MUST be horizontal (prone/plank position) — NOT standing or sitting
      if (!horizontal) {
        return { ok: false, label: "Wrong Pose", advice: "Get into a push-up position — face down, hands on floor.", score: 20 };
      }
      // Arms should be BENT for the down phase or straight for the up phase
      const armsDown = leftElbowAngle < 100 && rightElbowAngle < 100;  // Lowered position
      const armsUp = leftElbowAngle > 155 && rightElbowAngle > 155;    // Pushed up position
      const validArmPosition = armsDown || armsUp;
      if (!validArmPosition) {
        return { ok: false, label: "Wrong Pose", advice: "Bend elbows to lower chest, or push up to straighten arms.", score: 40 };
      }
      // Body must be aligned (hip not sagging/piking)
      const hipY = avg(leftHip.y, rightHip.y);
      const shoulderY = avg(leftShoulder.y, rightShoulder.y);
      const ankleY = avg(leftAnkle.y, rightAnkle.y);
      const bodyMidY = avg(shoulderY, ankleY);
      if (hipY > bodyMidY + 0.06) {
        return { ok: false, label: "Wrong Pose", advice: "Hips are sagging — tighten core and glutes.", score: 50 };
      }
      if (hipY < bodyMidY - 0.08) {
        return { ok: false, label: "Wrong Pose", advice: "Hips too high — lower them into a straight line.", score: 50 };
      }
      const phase = armsDown ? "Down phase — chest nearly touching floor." : "Up phase — arms fully extended.";
      return { ok: true, label: "Right Pose", advice: `Great push-up form! ${phase}`, score: armsDown ? 91 : 93 };
    }

    case "Bodyweight Squats": {
      if (!upright) return { ok: false, label: "Wrong Pose", advice: "Stand up to perform squats.", score: 25 };
      const squatDepth = (leftKneeAngle > 60 && leftKneeAngle < 130) || (rightKneeAngle > 60 && rightKneeAngle < 130);
      if (!squatDepth) return { ok: false, label: "Wrong Pose", advice: "Bend your knees deeper — aim for thighs parallel to floor.", score: 40 };
      if (backLean > 0.12) return { ok: false, label: "Wrong Pose", advice: "Keep chest up and don't lean forward excessively.", score: 50 };
      const feetWidth = Math.abs(leftAnkle.x - rightAnkle.x);
      if (feetWidth < 0.15) return { ok: false, label: "Wrong Pose", advice: "Feet should be shoulder-width apart.", score: 45 };
      return { ok: true, label: "Right Pose", advice: "Great squat depth! Drive through heels to stand.", score: 92 };
    }

    case "Glute Bridges": {
      // Must be lying on back — horizontal
      if (!horizontal) return { ok: false, label: "Wrong Pose", advice: "Lie flat on your back with knees bent.", score: 25 };
      const kneesBent = leftKneeAngle < 130 && rightKneeAngle < 130;
      if (!kneesBent) return { ok: false, label: "Wrong Pose", advice: "Bend your knees, feet flat on floor.", score: 40 };
      // Hips should be lifted — in normalized coords, hips lifted means less Y (higher on screen)
      const hipY = avg(leftHip.y, rightHip.y);
      const ankleY = avg(leftAnkle.y, rightAnkle.y);
      const shoulderY = avg(leftShoulder.y, rightShoulder.y);
      // Hips lifted: hip Y should be LESS than midpoint of shoulder and ankle
      const hipsLifted = hipY < avg(shoulderY, ankleY) - 0.02;
      if (!hipsLifted) return { ok: false, label: "Wrong Pose", advice: "Press through heels and lift hips off the floor.", score: 50 };
      return { ok: true, label: "Right Pose", advice: "Perfect bridge! Squeeze glutes at the top.", score: 93 };
    }

    case "Tricep Dips": {
      // Seated position, arms behind supporting body, elbows bent
      if (horizontal) return { ok: false, label: "Wrong Pose", advice: "Sit on a chair/bench, hands beside hips, slide off edge.", score: 25 };
      // Elbows should be bent (dipping) or straight (top)
      const elbowsBent = leftElbowAngle < 110 && rightElbowAngle < 110;
      const elbowsStraight = leftElbowAngle > 155 && rightElbowAngle > 155;
      if (!elbowsBent && !elbowsStraight) return { ok: false, label: "Wrong Pose", advice: "Bend elbows to lower body or straighten to push back up.", score: 40 };
      // Wrists should be behind/at sides, below shoulders
      const wristsBehindHips = leftWrist.y > leftHip.y && rightWrist.y > rightHip.y;
      if (!wristsBehindHips && elbowsBent) return { ok: false, label: "Wrong Pose", advice: "Place hands on the chair behind you.", score: 45 };
      return { ok: true, label: "Right Pose", advice: elbowsBent ? "Good dip! Keep elbows pointing backward." : "Top of dip — arms straight.", score: 89 };
    }

    case "Superman Hold": {
      // Must be face down / prone — horizontal
      if (!horizontal) return { ok: false, label: "Wrong Pose", advice: "Lie face down on your mat with arms extended overhead.", score: 25 };
      // Arms should be extended forward (above head — wrists above shoulders)
      const armsForwardOverhead = wristsAboveShoulders || avg(leftWrist.y, rightWrist.y) < avg(leftShoulder.y, rightShoulder.y) + 0.1;
      if (!armsForwardOverhead) return { ok: false, label: "Wrong Pose", advice: "Extend arms straight above your head.", score: 40 };
      // Body should be lifted — hips/legs raised
      const hipY = avg(leftHip.y, rightHip.y);
      const shoulderY = avg(leftShoulder.y, rightShoulder.y);
      const ankleY = avg(leftAnkle.y, rightAnkle.y);
      // When lifted, body is more uniform height
      const liftDetected = Math.abs(hipY - avg(shoulderY, ankleY)) < 0.1;
      if (!liftDetected) return { ok: false, label: "Wrong Pose", advice: "Lift arms, chest and legs simultaneously off the floor.", score: 50 };
      return { ok: true, label: "Right Pose", advice: "Excellent Superman! Squeeze glutes and hold steady.", score: 91 };
    }

    case "Lunges": {
      if (!upright) return { ok: false, label: "Wrong Pose", advice: "Stand upright to perform lunges.", score: 25 };
      if (!stanceWide) return { ok: false, label: "Wrong Pose", advice: "Step one foot forward — take a bigger step.", score: 40 };
      const oneLegBent = (leftKneeAngle > 60 && leftKneeAngle < 125) || (rightKneeAngle > 60 && rightKneeAngle < 125);
      if (!oneLegBent) return { ok: false, label: "Wrong Pose", advice: "Bend front knee to 90°, lower back knee toward floor.", score: 45 };
      if (backLean > 0.12) return { ok: false, label: "Wrong Pose", advice: "Keep torso tall — don't lean forward.", score: 55 };
      return { ok: true, label: "Right Pose", advice: "Great lunge! Front knee over ankle, back tall.", score: 90 };
    }

    /* ---- CARDIO ---- */
    case "Mindful Walking": {
      if (!upright) return { ok: false, label: "Wrong Pose", advice: "Stand tall for mindful walking.", score: 30 };
      const goodPosture = shoulderTilt < 0.07 && backLean < 0.1;
      return { ok: goodPosture, label: goodPosture ? "Right Pose" : "Wrong Pose", advice: goodPosture ? "Great posture! Walk with awareness." : "Stand tall, level shoulders, relaxed arms.", score: goodPosture ? 88 : 50 };
    }

    case "Jump Rope (No Rope)": {
      if (!upright) return { ok: false, label: "Wrong Pose", advice: "Stand upright to simulate jump rope.", score: 25 };
      // Arms should be at sides rotating (elbows slightly bent, wrists at hip level)
      const armsAtSides = !wristsAboveShoulders && !wristsBelowHips;
      const feetClose = Math.abs(leftAnkle.x - rightAnkle.x) < 0.2;
      const ok = feetClose && armsAtSides && shoulderTilt < 0.08;
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? "Good jump rope simulation! Keep a light bounce." : "Feet together, arms rotating at sides, bounce lightly.", score: ok ? 87 : 44 };
    }

    case "High Knees": {
      if (!upright) return { ok: false, label: "Wrong Pose", advice: "Stand upright for high knees.", score: 25 };
      const kneeLifted = leftKnee.y < leftHip.y || rightKnee.y < rightHip.y;
      if (!kneeLifted) return { ok: false, label: "Wrong Pose", advice: "Drive your knees up above hip height.", score: 40 };
      if (backLean > 0.12) return { ok: false, label: "Wrong Pose", advice: "Keep torso upright — don't lean back.", score: 50 };
      return { ok: true, label: "Right Pose", advice: "Great knee drive! Pump arms in rhythm.", score: 90 };
    }

    case "Burpees": {
      // Accept plank, squat, or standing-with-arms-up phase
      const plankPhase = horizontal && leftElbowAngle > 155 && rightElbowAngle > 155;
      const squat = upright && (leftKneeAngle < 115 || rightKneeAngle < 115);
      const jumpPhase = upright && wristsAboveShoulders;
      const ok = plankPhase || squat || jumpPhase;
      let advice = "Perform the full burpee: squat → plank → push-up → jump.";
      if (plankPhase) advice = "Plank phase — good! Go into push-up or jump back up.";
      else if (squat) advice = "Squat phase — good! Now jump back to plank.";
      else if (jumpPhase) advice = "Jump phase — great! Land softly and repeat.";
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice, score: ok ? 89 : 40 };
    }

    case "Mountain Climbers": {
      if (!horizontal) return { ok: false, label: "Wrong Pose", advice: "Get into a high plank — hands on floor, arms straight.", score: 25 };
      if (leftElbowAngle < 145 || rightElbowAngle < 145) return { ok: false, label: "Wrong Pose", advice: "Keep arms straight in the plank.", score: 40 };
      const kneeTowardChest = leftKnee.y < leftHip.y || rightKnee.y < rightHip.y;
      if (!kneeTowardChest) return { ok: false, label: "Wrong Pose", advice: "Drive one knee toward your chest.", score: 50 };
      // Hips shouldn't pike up
      const hipY = avg(leftHip.y, rightHip.y);
      const shoulderY = avg(leftShoulder.y, rightShoulder.y);
      if (hipY < shoulderY - 0.08) return { ok: false, label: "Wrong Pose", advice: "Lower your hips — keep body in a plank line.", score: 55 };
      return { ok: true, label: "Right Pose", advice: "Great mountain climbers! Keep hips level.", score: 91 };
    }

    case "Jumping Jacks": {
      if (!upright) return { ok: false, label: "Wrong Pose", advice: "Stand upright for jumping jacks.", score: 25 };
      const feetWide = Math.abs(leftAnkle.x - rightAnkle.x) > 0.24;
      const armsOverhead = wristsAboveShoulders;
      // Either wide (open) or closed position is valid
      const closedPosition = Math.abs(leftAnkle.x - rightAnkle.x) < 0.12 && !armsOverhead;
      if (!feetWide && !closedPosition) return { ok: false, label: "Wrong Pose", advice: "Jump feet wide while raising arms overhead, or return to start.", score: 45 };
      if (feetWide && !armsOverhead) return { ok: false, label: "Wrong Pose", advice: "Raise arms overhead when feet are wide.", score: 50 };
      const ok = (feetWide && armsOverhead) || closedPosition;
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? (feetWide ? "Open position — great!" : "Closed position — good!") : "Sync arms and legs.", score: ok ? 91 : 44 };
    }

    case "Step-Ups": {
      if (!upright) return { ok: false, label: "Wrong Pose", advice: "Stand upright in front of a step.", score: 25 };
      const oneFootHigher = Math.abs(leftAnkle.y - rightAnkle.y) > 0.07;
      if (!oneFootHigher) return { ok: false, label: "Wrong Pose", advice: "Step one foot up onto the step.", score: 40 };
      const torsoStraight = backLean < 0.1 && shoulderTilt < 0.08;
      if (!torsoStraight) return { ok: false, label: "Wrong Pose", advice: "Keep torso upright as you step up.", score: 55 };
      return { ok: true, label: "Right Pose", advice: "Good step-up form! Drive through the heel.", score: 88 };
    }

    /* ---- BREATHING (seated/upright) ---- */
    case "4-7-8 Breathing":
    case "Box Breathing":
    case "Alternate Nostril Breathing": {
      // Should be seated or upright, spine straight
      const goodSeat = !horizontal;
      const spineOk = shoulderTilt < 0.08 && backLean < 0.1;
      const ok = goodSeat && spineOk;
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? "Good seated posture. Focus on your breath." : "Sit upright with spine tall and shoulders relaxed.", score: ok ? 90 : 50 };
    }

    /* ---- MOBILITY ---- */
    case "Spinal Twist": {
      if (horizontal) return { ok: false, label: "Wrong Pose", advice: "Sit upright for the spinal twist.", score: 25 };
      // One knee bent (foot outside opposite thigh)
      const oneLegCrossed = (leftKneeAngle < 120) || (rightKneeAngle < 120);
      if (!oneLegCrossed) return { ok: false, label: "Wrong Pose", advice: "Bend one knee and place foot outside opposite thigh.", score: 40 };
      // Some lateral rotation — shoulder offset from hips
      const twisting = Math.abs(leftShoulder.x - leftHip.x) > 0.05 || Math.abs(rightShoulder.x - rightHip.x) > 0.05;
      if (!twisting) return { ok: false, label: "Wrong Pose", advice: "Rotate your torso toward the bent knee.", score: 50 };
      return { ok: true, label: "Right Pose", advice: "Good spinal twist! Lengthen spine on each inhale.", score: 89 };
    }

    case "Cat-Cow Flow": {
      // On hands and knees — horizontal but not face-down or face-up flat
      if (upright) return { ok: false, label: "Wrong Pose", advice: "Get on hands and knees for Cat-Cow.", score: 25 };
      const onAllFours = leftElbowAngle > 140 && rightElbowAngle > 140; // arms straight
      if (!onAllFours) return { ok: false, label: "Wrong Pose", advice: "Place hands directly under shoulders.", score: 40 };
      // Spine movement: Cat (rounded) or Cow (arched)
      const hipY = avg(leftHip.y, rightHip.y);
      const shoulderY = avg(leftShoulder.y, rightShoulder.y);
      const hipHigher = hipY < shoulderY; // cat position
      const hipLower = hipY > shoulderY; // cow position
      const ok = onAllFours && (hipHigher || hipLower);
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? (hipHigher ? "Cat pose — round that spine!" : "Cow pose — open the chest!") : "On all fours, alternate between arching and rounding your back.", score: ok ? 90 : 43 };
    }

    case "90/90 Hip Stretch": {
      // Seated on floor
      if (upright) return { ok: false, label: "Wrong Pose", advice: "Sit on the floor for the 90/90 hip stretch.", score: 25 };
      // Both knees bent ~90°
      const leftBent = leftKneeAngle > 60 && leftKneeAngle < 115;
      const rightBent = rightKneeAngle > 60 && rightKneeAngle < 115;
      if (!leftBent || !rightBent) return { ok: false, label: "Wrong Pose", advice: "Bend both knees to 90° in the 90/90 position.", score: 45 };
      const torsoTall = backLean < 0.12;
      if (!torsoTall) return { ok: false, label: "Wrong Pose", advice: "Sit tall — avoid rounding your lower back.", score: 55 };
      return { ok: true, label: "Right Pose", advice: "Perfect 90/90! Feel the hip rotation stretch.", score: 91 };
    }

    case "Wrist & Ankle Circles": {
      // Standing or seated, arms extended
      const armsExtendedForward = wristsAtShoulderLevel || Math.abs(avg(leftWrist.y, rightWrist.y) - avg(leftShoulder.y, rightShoulder.y)) < 0.18;
      const ok = armsExtendedForward && shoulderTilt < 0.09;
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice: ok ? "Good! Rotate wrists or ankles in full circles." : "Extend arms forward at shoulder height.", score: ok ? 87 : 50 };
    }

    case "Foam Roll Back": {
      // Lying on back — horizontal
      if (!horizontal) return { ok: false, label: "Wrong Pose", advice: "Lie on your back with the foam roller under your upper back.", score: 25 };
      const kneesBent = leftKneeAngle < 130 && rightKneeAngle < 130;
      if (!kneesBent) return { ok: false, label: "Wrong Pose", advice: "Keep knees bent, feet flat on floor.", score: 40 };
      return { ok: true, label: "Right Pose", advice: "Good position! Roll slowly and pause on tight spots.", score: 88 };
    }

    default: {
      // Generic: just check upright posture
      let ok = true, advice = "Keep spine neutral and shoulders relaxed.";
      if (shoulderTilt > 0.06) { ok = false; advice = "Level your shoulders."; }
      else if (backLean > 0.09) { ok = false; advice = "Center your torso."; }
      return { ok, label: ok ? "Right Pose" : "Wrong Pose", advice, score: ok ? 82 : 50 };
    }
  }
}

function speakText(text, rate = 0.95) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate; utterance.pitch = 1; utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

/* ---------------------------------------------
   POSTURE TRACKER
--------------------------------------------- */
function PostureTracker({ color, isActive, activeExercise }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lastVoiceStateRef = useRef("");
  const lastVoiceTimeRef = useRef(0);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postureStatus, setPostureStatus] = useState("Camera Off");
  const [activityLog, setActivityLog] = useState([]);
  const [metrics, setMetrics] = useState({ score: 0, shoulderTilt: 0, backLean: 0 });
  const [poseColor, setPoseColor] = useState("#22c55e");

  const addLog = (text) => {
    setActivityLog((prev) => {
      const next = [{ id: Date.now() + Math.random(), text, time: new Date().toLocaleTimeString() }, ...prev];
      return next.slice(0, 6);
    });
  };

  const maybeSpeakPoseState = (ok, advice) => {
    const now = Date.now();
    const nextState = ok ? "right" : "wrong";
    if (lastVoiceStateRef.current !== nextState || now - lastVoiceTimeRef.current > 6000) {
      speakText(ok ? "Right pose" : `Wrong pose. ${advice}`, 0.95);
      lastVoiceStateRef.current = nextState;
      lastVoiceTimeRef.current = now;
    }
  };

  const predictWebcam = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseLandmarker = poseLandmarkerRef.current;
    if (!video || !canvas || !poseLandmarker) { animationRef.current = requestAnimationFrame(predictWebcam); return; }
    const canvasCtx = canvas.getContext("2d");
    if (video.readyState >= 2) {
      canvas.width = video.videoWidth || 960;
      canvas.height = video.videoHeight || 540;
      if (lastVideoTimeRef.current !== video.currentTime) {
        lastVideoTimeRef.current = video.currentTime;
        const startTimeMs = performance.now();
        const results = poseLandmarker.detectForVideo(video, startTimeMs);
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const drawingUtils = new DrawingUtils(canvasCtx);
          const feedback = getPoseFeedback(activeExercise?.title || "", landmarks);
          const leftShoulder = landmarks[11], rightShoulder = landmarks[12];
          const leftHip = landmarks[23], rightHip = landmarks[24];
          const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
          const backLean = Math.abs(avg(leftShoulder.x, rightShoulder.x) - avg(leftHip.x, rightHip.x));
          setMetrics({ score: feedback.score, shoulderTilt: Number(shoulderTilt.toFixed(3)), backLean: Number(backLean.toFixed(3)) });
          setPoseColor(feedback.ok ? "#22c55e" : "#ef4444");
          setPostureStatus(`${feedback.label} — ${feedback.advice}`);
          drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: feedback.ok ? "#22c55e" : "#ef4444", lineWidth: 4 });
          drawingUtils.drawLandmarks(landmarks, { color: feedback.ok ? "#22c55e" : "#ef4444", lineWidth: 2, radius: 4 });
          maybeSpeakPoseState(feedback.ok, feedback.advice);
        } else {
          setPostureStatus("No body detected — stand in front of the camera.");
          setPoseColor("#ef4444");
        }
        canvasCtx.restore();
      }
    }
    animationRef.current = requestAnimationFrame(predictWebcam);
  };

  const startCamera = async () => {
    try {
      setLoading(true);
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task" },
        runningMode: "VIDEO", numPoses: 1,
        minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5,
      });
      poseLandmarkerRef.current = poseLandmarker;
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 960, height: 540, facingMode: "user" }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      setIsCameraOn(true);
      setPostureStatus("Tracking started...");
      addLog("Camera started and posture tracking enabled.");
      speakText("Camera started. I will tell you if the pose is right or wrong.");
      predictWebcam();
    } catch (error) {
      console.error("Posture tracker error:", error);
      setPostureStatus("Camera access failed.");
      addLog("Could not start camera or MediaPipe.");
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (animationRef.current) { cancelAnimationFrame(animationRef.current); animationRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (poseLandmarkerRef.current) { poseLandmarkerRef.current.close(); poseLandmarkerRef.current = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsCameraOn(false); setPostureStatus("Camera Off"); addLog("Camera stopped.");
  };

  useEffect(() => { return () => { stopCamera(); }; }, []);
  useEffect(() => { if (!isActive && isCameraOn) stopCamera(); }, [isActive, isCameraOn]);

  return (
    <div style={{ width: "100%", borderRadius: 16, background: `${color}12`, border: `1px solid ${color}30`, padding: 14 }}>
      <div style={{ position: "relative", width: "100%", height: 260, borderRadius: 14, overflow: "hidden", background: "#08101c", marginBottom: 12 }}>
        <video ref={videoRef} style={{ display: "none" }} playsInline muted />
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        {!isCameraOn && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#8892b0", fontSize: "0.95rem", textAlign: "center", padding: 20 }}>
            Open camera to start real-time pose checking
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {!isCameraOn ? (
          <button className="start-btn" onClick={startCamera} disabled={loading} style={{ background: `linear-gradient(135deg, ${color}dd, ${color}88)`, color: "#fff", flex: 1 }}>
            {loading ? "Starting..." : "📷 Open Camera"}
          </button>
        ) : (
          <button className="start-btn" onClick={stopCamera} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#e8eaf6", flex: 1 }}>
            ⏹ Stop Camera
          </button>
        )}
      </div>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: poseColor, marginBottom: 6 }}>Pose Status</div>
        <div style={{ fontSize: "0.88rem", color: "#e8eaf6", lineHeight: 1.5 }}>{postureStatus}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
        <div style={metricCardStyle}><div style={metricLabelStyle}>Pose Score</div><div style={{ ...metricValueStyle, color: poseColor }}>{metrics.score}</div></div>
        <div style={metricCardStyle}><div style={metricLabelStyle}>Shoulder Tilt</div><div style={metricValueStyle}>{metrics.shoulderTilt}</div></div>
        <div style={metricCardStyle}><div style={metricLabelStyle}>Back Lean</div><div style={metricValueStyle}>{metrics.backLean}</div></div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8892b0", marginBottom: 8 }}>Activity Log</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activityLog.length === 0 ? (
            <div style={{ color: "#8892b0", fontSize: "0.82rem" }}>No activity yet.</div>
          ) : (
            activityLog.map(item => (
              <div key={item.id} style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.04)", fontSize: "0.8rem", color: "#cfd8ea" }}>
                <div>{item.text}</div>
                <div style={{ fontSize: "0.72rem", color: "#7f8aa3", marginTop: 3 }}>{item.time}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   MAIN EXERCISE PAGE
--------------------------------------------- */
export default function Exercise() {
  const [activeExercise, setActiveExercise] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showImage, setShowImage] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) { intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000); }
    else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (voiceOn && activeExercise) speakText(`${activeExercise.title}. ${activeExercise.steps[currentStep]}`);
  }, [currentStep, activeExercise, voiceOn]);

  const filtered = exercises.filter(ex => {
    const matchCat = filter === "All" || ex.category === filter;
    const matchSearch = ex.title.toLowerCase().includes(searchTerm.toLowerCase()) || ex.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const progress = activeExercise ? (completedSteps.size / activeExercise.steps.length) * 100 : 0;

  const toggleStep = (i) => {
    setCompletedSteps(prev => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
    setCurrentStep(i);
    if (voiceOn && activeExercise) speakText(`Step ${i + 1}. ${activeExercise.steps[i]}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e1a 0%, #0d1525 50%, #0a0e1a 100%)", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#e8eaf6", padding: "0 0 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .ex-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 20px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden; }
        .ex-card::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s; background: radial-gradient(circle at 50% 0%, var(--card-color, #7c5cfc)10, transparent 70%); }
        .ex-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.14); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .ex-card:hover::before { opacity: 1; }
        .cat-btn { padding: 8px 18px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #8892b0; font-size: 0.82rem; font-family: inherit; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .cat-btn.active, .cat-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.07); }
        .step-row { display: flex; gap: 14px; padding: 12px 14px; border-radius: 12px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; align-items: flex-start; }
        .step-row:hover { background: rgba(255,255,255,0.04); }
        .step-row.active { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); }
        .img-container { width: 100%; height: 220px; border-radius: 16px; overflow: hidden; position: relative; margin-bottom: 16px; }
        .img-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .img-container:hover img { transform: scale(1.05); }
        .toggle-btn { display: flex; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 3px; width: fit-content; margin-bottom: 14px; }
        .toggle-option { padding: 6px 16px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; color: #8892b0; border: none; background: transparent; font-family: inherit; }
        .toggle-option.active { background: rgba(255,255,255,0.1); color: #e8eaf6; }
        .search-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 16px; color: #e8eaf6; font-family: inherit; font-size: 0.88rem; outline: none; width: 200px; transition: all 0.2s; }
        .search-input:focus { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); width: 240px; }
        .search-input::placeholder { color: #4a5568; }
        .back-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #8892b0; padding: 10px 18px; border-radius: 10px; font-family: inherit; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; margin-bottom: 24px; display: inline-flex; align-items: center; gap: 8px; }
        .back-btn:hover { color: #e8eaf6; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); }
        .start-btn { padding: 10px 20px; border-radius: 10px; border: none; font-family: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .level-badge { padding: 3px 10px; border-radius: 100px; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em; }
        @media (max-width: 960px) { .exercise-detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ padding: "40px 32px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {!activeExercise ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c5cfc", marginBottom: 8 }}>Wellness Module</div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>Exercise Library</h1>
                <p style={{ color: "#8892b0", fontSize: "0.9rem", marginTop: 8 }}>{exercises.length} exercises · yoga · stretch · strength · cardio · breathwork · mobility</p>
              </div>
              <input className="search-input" placeholder="🔍  Search exercises..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: "2rem", width: 52, height: 52, borderRadius: 14, background: `${activeExercise.color}20`, border: `1px solid ${activeExercise.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeExercise.icon}</div>
              <div>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: activeExercise.color }}>{activeExercise.category}</div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "#ffffff" }}>{activeExercise.title}</h1>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: "2.5rem", fontFamily: "'Syne', sans-serif", fontWeight: 800, color: activeExercise.color, lineHeight: 1 }}>{formatTime(timer)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px 0" }}>
        {!activeExercise ? (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
              {categories.map(cat => (
                <button key={cat} className={`cat-btn ${filter === cat ? "active" : ""}`}
                  style={filter === cat ? { color: categoryColors[cat], borderColor: `${categoryColors[cat]}50`, background: `${categoryColors[cat]}10` } : {}}
                  onClick={() => setFilter(cat)}>{cat}</button>
              ))}
              <div style={{ marginLeft: "auto", color: "#4a5568", fontSize: "0.8rem", alignSelf: "center", whiteSpace: "nowrap" }}>{filtered.length} results</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map(ex => (
                <div key={ex.id} className="ex-card" style={{ "--card-color": ex.color }}
                  onClick={() => { setActiveExercise(ex); setCurrentStep(0); setTimer(0); setIsRunning(false); setCompletedSteps(new Set()); setShowImage(true); if (voiceOn) speakText(`${ex.title}. ${ex.steps[0]}`); }}>
                  <div style={{ width: "100%", height: 140, borderRadius: 12, overflow: "hidden", marginBottom: 14, position: "relative" }}>
                    <img src={ex.image} alt={ex.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${ex.color}60, transparent)` }} />
                    <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "3px 8px", fontSize: "0.7rem", color: "#fff" }}>⏱ {ex.duration}</div>
                    <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: "1.8rem" }}>{ex.icon}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#e8eaf6", lineHeight: 1.3 }}>{ex.title}</h3>
                    <span className="level-badge" style={{ background: `${ex.color}15`, color: ex.color, border: `1px solid ${ex.color}30`, flexShrink: 0, marginLeft: 8 }}>{ex.level === "All Levels" ? "All" : ex.level}</span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#8892b0", lineHeight: 1.5, marginBottom: 14 }}>{ex.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: "0.7rem", background: "rgba(255,255,255,0.05)", color: "#8892b0" }}>📋 {ex.steps.length} steps</span>
                    <button className="start-btn" style={{ background: `linear-gradient(135deg, ${ex.color}dd, ${ex.color}88)`, color: "#fff", padding: "6px 16px", fontSize: "0.78rem" }}>Start →</button>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#4a5568" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
                <div>No exercises found for "{searchTerm}"</div>
              </div>
            )}
          </>
        ) : (
          <>
            <button className="back-btn" onClick={() => { setActiveExercise(null); setIsRunning(false); if (window.speechSynthesis) window.speechSynthesis.cancel(); }}>← All Exercises</button>
            <div className="exercise-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
              <div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#8892b0", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Progress</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e8eaf6" }}>{completedSteps.size}/{activeExercise.steps.length} steps done</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${activeExercise.color}, ${activeExercise.color}88)`, borderRadius: 3, transition: "width 0.4s" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="start-btn" onClick={() => { setIsRunning(!isRunning); if (!isRunning && voiceOn) speakText(`Starting ${activeExercise.title}. ${activeExercise.steps[currentStep]}`); }}
                      style={{ background: isRunning ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${activeExercise.color}dd, ${activeExercise.color}88)`, color: isRunning ? "#8892b0" : "#fff", border: isRunning ? "1px solid rgba(255,255,255,0.1)" : "none", padding: "8px 20px" }}>
                      {isRunning ? "⏸ Pause" : "▶ Start"}
                    </button>
                    <button className="start-btn" onClick={() => { setTimer(0); setIsRunning(false); setCompletedSteps(new Set()); setCurrentStep(0); if (voiceOn) speakText(`Reset complete. Step 1. ${activeExercise.steps[0]}`); }}
                      style={{ background: "rgba(255,255,255,0.05)", color: "#8892b0", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 14px" }}>↺</button>
                    <button className="start-btn" onClick={() => { setVoiceOn(v => !v); if (!voiceOn && activeExercise) setTimeout(() => speakText(`Voice guidance on. ${activeExercise.steps[currentStep]}`), 100); else if (window.speechSynthesis) window.speechSynthesis.cancel(); }}
                      style={{ background: "rgba(255,255,255,0.05)", color: voiceOn ? activeExercise.color : "#8892b0", border: `1px solid ${voiceOn ? activeExercise.color + "55" : "rgba(255,255,255,0.08)"}`, padding: "8px 14px" }}>
                      {voiceOn ? "🔊 Voice On" : "🔇 Voice Off"}
                    </button>
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "16px" }}>
                  <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8892b0", marginBottom: 14, paddingLeft: 4 }}>Steps — tap to mark complete</div>
                  {activeExercise.steps.map((step, i) => (
                    <div key={i} className={`step-row ${i === currentStep ? "active" : ""}`} onClick={() => toggleStep(i)}
                      style={{ opacity: completedSteps.has(i) ? 0.5 : 1 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${completedSteps.has(i) ? activeExercise.color : "rgba(255,255,255,0.15)"}`, background: completedSteps.has(i) ? `${activeExercise.color}30` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.7rem", color: completedSteps.has(i) ? activeExercise.color : "#8892b0", fontWeight: 700, marginTop: 2 }}>
                        {completedSteps.has(i) ? "✓" : i + 1}
                      </div>
                      <div style={{ fontSize: "0.88rem", color: completedSteps.has(i) ? "#8892b0" : "#e8eaf6", lineHeight: 1.6 }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="toggle-btn">
                  <button className={`toggle-option ${showImage ? "active" : ""}`} onClick={() => setShowImage(true)}>📸 Guide</button>
                  <button className={`toggle-option ${!showImage ? "active" : ""}`} onClick={() => setShowImage(false)}>📷 Camera</button>
                </div>

                {showImage ? (
                  <div>
                    <div className="img-container">
                      <img src={activeExercise.image} alt={activeExercise.title} onError={e => { e.target.style.display = "none"; }} />
                      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${activeExercise.color}60, transparent 60%)` }} />
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                      <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8892b0", marginBottom: 8 }}>About</div>
                      <p style={{ fontSize: "0.88rem", color: "#cfd8ea", lineHeight: 1.7 }}>{activeExercise.description}</p>
                      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                        {[activeExercise.duration, activeExercise.level, activeExercise.category].map(tag => (
                          <span key={tag} style={{ padding: "4px 12px", borderRadius: 100, fontSize: "0.72rem", background: `${activeExercise.color}15`, color: activeExercise.color, border: `1px solid ${activeExercise.color}30` }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <PostureTracker color={activeExercise.color} isActive={!showImage} activeExercise={activeExercise} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
