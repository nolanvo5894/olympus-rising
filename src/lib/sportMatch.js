import { geminiText } from "./gemini.js";

// ── Sport body types (avg height/weight from Team USA Olympians) ──
export const SPORT_BODY_TYPES = [
  { sport: "Track & Field", emoji: "🏃", avgH: 179.1, avgW: 73.0, n: 1742 },
  { sport: "Rowing", emoji: "🚣", avgH: 185.0, avgW: 80.0, n: 535 },
  { sport: "Swimming", emoji: "🏊", avgH: 179.8, avgW: 71.9, n: 510 },
  { sport: "Ice Hockey", emoji: "🏒", avgH: 179.4, avgW: 81.8, n: 374 },
  { sport: "Basketball", emoji: "🏀", avgH: 193.3, avgW: 88.1, n: 283 },
  { sport: "Wrestling", emoji: "🤼", avgH: 173.1, avgW: 76.0, n: 205 },
  { sport: "Volleyball", emoji: "🏐", avgH: 188.2, avgW: 80.9, n: 204 },
  { sport: "Cycling", emoji: "🚴", avgH: 177.0, avgW: 71.2, n: 195 },
  { sport: "Speed Skating", emoji: "⏱️", avgH: 172.7, avgW: 68.7, n: 179 },
  { sport: "Shooting", emoji: "🎯", avgH: 175.4, avgW: 76.6, n: 176 },
  { sport: "Boxing", emoji: "🥊", avgH: 175.2, avgW: 67.3, n: 171 },
  { sport: "Sailing", emoji: "⛵", avgH: 180.0, avgW: 78.7, n: 169 },
  { sport: "Fencing", emoji: "🤺", avgH: 178.1, avgW: 72.7, n: 164 },
  { sport: "Alpine Skiing", emoji: "⛷️", avgH: 172.7, avgW: 71.5, n: 163 },
  { sport: "Canoe / Kayak", emoji: "🛶", avgH: 178.9, avgW: 74.1, n: 151 },
  { sport: "Water Polo", emoji: "🤽", avgH: 186.9, avgW: 85.7, n: 147 },
  { sport: "Gymnastics", emoji: "🤸", avgH: 161.9, avgW: 56.3, n: 144 },
  { sport: "Figure Skating", emoji: "⛸️", avgH: 166.8, avgW: 59.0, n: 144 },
  { sport: "Diving", emoji: "🤿", avgH: 168.4, avgW: 62.0, n: 103 },
  { sport: "Baseball", emoji: "⚾", avgH: 186.1, avgW: 88.3, n: 97 },
  { sport: "Equestrian", emoji: "🐴", avgH: 173.5, avgW: 64.6, n: 92 },
  { sport: "Freestyle Skiing", emoji: "🎿", avgH: 172.8, avgW: 69.2, n: 91 },
  { sport: "Weightlifting", emoji: "🏋️", avgH: 172.5, avgW: 94.3, n: 89 },
  { sport: "Snowboarding", emoji: "🏂", avgH: 172.7, avgW: 70.5, n: 71 },
  { sport: "Judo", emoji: "🥋", avgH: 174.1, avgW: 78.2, n: 65 },
  { sport: "Tennis", emoji: "🎾", avgH: 182.6, avgW: 76.2, n: 59 },
  { sport: "Rugby Sevens", emoji: "🏉", avgH: 177.7, avgW: 82.7, n: 46 },
  { sport: "Archery", emoji: "🏹", avgH: 175.2, avgW: 69.9, n: 34 },
  { sport: "Modern Pentathlon", emoji: "🤺", avgH: 180.6, avgW: 72.2, n: 32 },
  { sport: "Softball", emoji: "🥎", avgH: 173.7, avgW: 73.8, n: 28 },
  { sport: "Table Tennis", emoji: "🏓", avgH: 171.3, avgW: 62.8, n: 26 },
  { sport: "Triathlon", emoji: "🏊‍♂️", avgH: 175.0, avgW: 64.0, n: 22 },
  { sport: "Flag Football", emoji: "🏈", avgH: 178.3, avgW: 77.6, n: 14 },
  { sport: "Taekwondo", emoji: "🥋", avgH: 176.0, avgW: 66.0, n: 13 },
  { sport: "Skateboarding", emoji: "🛹", avgH: 170.0, avgW: 65.0, n: 10 },
  { sport: "Surfing", emoji: "🏄", avgH: 175.0, avgW: 72.0, n: 9 },
  { sport: "Golf", emoji: "⛳", avgH: 178.9, avgW: 74.6, n: 9 },
  { sport: "Sport Climbing", emoji: "🧗", avgH: 172.0, avgW: 62.0, n: 8 },
];

// ── Personality scenarios ──
export const PERSONALITY_QUESTIONS = [
  { id: "pressure", q: "Tied final, 30 seconds left. You…",
    choices: [
      "Want the ball — give me the clutch moment.",
      "Trust the team — run the play we drilled.",
      "Stay calm, breathe, execute the fundamentals.",
      "Improvise something the opponent won't expect.",
    ] },
  { id: "training", q: "Your perfect training day is…",
    choices: [
      "Solo grind, headphones in, no distractions.",
      "With teammates pushing each other.",
      "Mixing drills, skills, and scrimmage.",
      "Pure repetition until the form is automatic.",
    ] },
  { id: "body", q: "What does your body do best?",
    choices: [
      "Explosive bursts — sprint, jump, throw.",
      "Long endurance — go for hours.",
      "Coordination & precision — hand-eye, balance.",
      "Strength & control — lift heavy, hold positions.",
    ] },
  { id: "risk", q: "Learning a new skill, you…",
    choices: [
      "Go big — try the hardest version first.",
      "Build it brick by brick, fundamentals first.",
      "Watch experts, then copy.",
      "Improvise and feel your way through.",
    ] },
  { id: "win", q: "Your favorite kind of victory is…",
    choices: [
      "Crossing the line first, alone.",
      "Lifting the trophy with my team.",
      "Hitting a perfect score on form/technique.",
      "Outsmarting an opponent head-to-head.",
    ] },
];

/**
 * Deterministic body-type ranking using Euclidean distance against avg
 * height/weight of Team USA Olympians per sport. Returns ALL sports
 * sorted best-fit first, with `dist` (lower = closer match).
 */
export function rankByBodyMatch(heightCm, weightKg) {
  return SPORT_BODY_TYPES
    .map(s => {
      const dist = Math.sqrt((heightCm - s.avgH) ** 2 + (weightKg - s.avgW) ** 2);
      return { ...s, dist };
    })
    .sort((a, b) => a.dist - b.dist);
}

function buildSchema(enumNames) {
  return {
    type: "object",
    properties: {
      rankings: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            rank: { type: "integer", minimum: 1, maximum: 5 },
            sport: { type: "string", enum: enumNames },
          },
          required: ["rank", "sport"],
        },
      },
    },
    required: ["rankings"],
  };
}

function buildPrompt({ heightCm, weightKg, personality, hasPhoto, shortlist }) {
  const personalityLines = PERSONALITY_QUESTIONS.map(q => {
    const ans = personality?.[q.id];
    return `  · "${q.q}" → "${ans ?? "(no answer)"}"`;
  }).join("\n");

  const shortlistTable = shortlist
    .map((s, i) => `  ${i + 1}. ${s.sport} — avg ${Math.round(s.avgH)}cm / ${Math.round(s.avgW)}kg (body-fit distance ${s.dist.toFixed(2)}, ${s.n.toLocaleString()} athletes)`)
    .join("\n");

  return [
    "You are a Team USA Olympic talent scout helping match a candidate to a sport.",
    "",
    "A deterministic body-type pre-filter has already shortlisted the 10 sports below by",
    "comparing the candidate's height/weight against the average build of Team USA Olympians",
    "per sport (lower body-fit distance = closer body match).",
    "",
    "Your job: re-rank these 10 sports into a final TOP 5, using the photo (if attached)",
    "and the personality answers to qualitatively reweight the body-fit shortlist.",
    "Body fit is the strongest single signal, but personality and visible athletic indicators",
    "in the photo can promote a sport up or down within the shortlist.",
    "",
    "Candidate profile:",
    `- Height: ${heightCm.toFixed(1)} cm`,
    `- Weight: ${weightKg.toFixed(1)} kg`,
    "- Personality answers:",
    personalityLines,
    hasPhoto
      ? "- Reference photo attached. Use it for build, frame, posture, and visible athletic indicators only. Do not speculate about protected attributes."
      : "- No photo provided.",
    "",
    "Body-type shortlist (rank from these 10 only):",
    shortlistTable,
    "",
    "Output JSON: { rankings: [{ rank, sport }, ...] }.",
    "Pick the 5 best matches from the shortlist. Each sport must appear at most once.",
    "rank must be 1..5 with no gaps. Order the array by rank ascending.",
  ].join("\n");
}

/**
 * Match a candidate to top-5 sports using a hybrid pipeline:
 *   1. Deterministic body-type ranking → top 10 shortlist
 *   2. Gemini reranks the 10 to top 5 using photo + personality
 * @param {object} input
 * @param {number} input.heightCm
 * @param {number} input.weightKg
 * @param {{[id:string]: string}} input.personality
 * @param {string} [input.photoBase64]
 * @param {string} [input.photoMimeType]
 * @param {number} [input.shortlistSize=10]
 * @returns {Promise<Array<{rank,sport,emoji,avgH,avgW,n,dist}>>}
 */
export async function matchSports({ heightCm, weightKg, personality, photoBase64, photoMimeType = "image/jpeg", shortlistSize = 10 }) {
  const shortlist = rankByBodyMatch(heightCm, weightKg).slice(0, shortlistSize);
  const enumNames = shortlist.map(s => s.sport);
  const schema = buildSchema(enumNames);
  const text = buildPrompt({ heightCm, weightKg, personality, hasPhoto: !!photoBase64, shortlist });
  const parts = photoBase64
    ? [{ text }, { inlineData: { mimeType: photoMimeType, data: photoBase64 } }]
    : text;
  const data = await geminiText(parts, schema);
  const byName = Object.fromEntries(shortlist.map(s => [s.sport, s]));
  return (data.rankings || [])
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .map(r => {
      const meta = byName[r.sport];
      return meta ? { rank: r.rank, ...meta } : null;
    })
    .filter(Boolean);
}
