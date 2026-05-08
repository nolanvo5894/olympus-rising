// Generate one avatar PNG per sport that the game can match a player to.
// Run: `npm run gen:avatars`  (uses Node's --env-file to load .env.local)

import { GoogleGenAI } from "@google/genai";
import { mkdir, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const IMAGE_MODEL = "gemini-3-pro-image-preview";
const ASPECT_RATIO = "1:1";

// Every sport rendered in the game (the SPIRITS roster in src/App.jsx).
// Kept inline so this script is self-contained.
const SPORTS = [
  // Olympic / non-para
  "Track & Field", "Rowing", "Swimming", "Ice Hockey", "Basketball",
  "Wrestling", "Volleyball", "Cycling", "Speed Skating", "Shooting",
  "Boxing", "Sailing", "Fencing", "Alpine Skiing", "Canoe / Kayak",
  "Water Polo", "Gymnastics", "Figure Skating", "Diving", "Baseball",
  "Equestrian", "Freestyle Skiing", "Weightlifting", "Snowboarding", "Judo",
  "Tennis", "Rugby Sevens", "Archery", "Modern Pentathlon", "Softball",
  "Table Tennis", "Triathlon", "Flag Football", "Taekwondo", "Skateboarding",
  "Surfing", "Golf", "Sport Climbing",
  // Paralympic
  "Para Swimming", "Para Track & Field", "Wheelchair Rugby", "Sitting Volleyball",
  "Wheelchair Basketball", "Sled Hockey", "Para Alpine", "Para Nordic",
  "Para Cycling", "Para Archery", "Goalball", "Para Powerlifting",
  "Para Triathlon", "Wheelchair Tennis",
];

// Per-sport subject overrides — used when the sport name alone is ambiguous or
// when adaptive equipment must be visible to identify the discipline.
const SUBJECT_OVERRIDES = {
  "Wheelchair Rugby": "a heroic Paralympic athlete competing in Wheelchair Rugby, seated in a reinforced sport wheelchair clearly visible, gripping the ball mid-play",
  "Wheelchair Basketball": "a heroic Paralympic athlete competing in Wheelchair Basketball, seated in a sport wheelchair clearly visible, holding a basketball mid-game",
  "Wheelchair Tennis": "a heroic Paralympic athlete competing in Wheelchair Tennis, seated in a sport wheelchair clearly visible, swinging a tennis racquet",
  "Sitting Volleyball": "a heroic Paralympic athlete competing in Sitting Volleyball, seated on the court mid-spike, the low net visible behind",
  "Sled Hockey": "a heroic Paralympic athlete competing in Sled Hockey, seated on a hockey sled with two short sticks, ice and goal visible",
  "Para Alpine": "a heroic Paralympic athlete competing in Para Alpine Skiing, on a sit-ski or mono-ski racing down a slalom course",
  "Para Nordic": "a heroic Paralympic athlete competing in Para Nordic Skiing, on cross-country skis or a sit-ski with poles",
  "Para Cycling": "a heroic Paralympic athlete competing in Para Cycling, on a handcycle or adapted racing bicycle",
  "Para Archery": "a heroic Paralympic athlete competing in Para Archery, drawing a recurve bow with focused aim",
  "Para Powerlifting": "a heroic Paralympic athlete competing in Para Powerlifting, performing a bench press with a loaded barbell",
  "Para Triathlon": "a heroic Paralympic triathlete mid-race, suggestion of swim/bike/run gear, athletic and determined",
  "Para Swimming": "a heroic Paralympic athlete competing in Para Swimming, mid-stroke in clear pool water, goggles and cap",
  "Para Track & Field": "a heroic Paralympic athlete competing in Para Track & Field, sprinting on a track (with a running blade prosthetic or racing chair as appropriate)",
  "Goalball": "a heroic Paralympic athlete competing in Goalball, wearing the sport's eyeshades, defending a goal with the bell-ball mid-roll",
};

const STYLE_BLOCK = [
  "centered portrait of a single athlete, framed from chest up",
  "Greek-mythology / Mount Olympus aesthetic, painterly digital illustration",
  "dramatic rim light, soft volumetric haze, marble-and-gold colour palette",
  "subtle laurel motifs welcome",
  "neutral pale background with faint cloud / sky texture",
  "the artwork fills the entire square canvas edge-to-edge with no border, no vignette, no circular mask, no frame, no letterboxing, no black bars, no text, no watermarks, no logos",
].join("; ");

function buildPrompt(sport) {
  const subject = SUBJECT_OVERRIDES[sport]
    ?? `a heroic Olympian athlete competing in ${sport}, shown in characteristic gear, posture, and equipment for the sport so the discipline is unmistakable at a glance`;
  return [
    `Subject: ${subject}.`,
    `Style: ${STYLE_BLOCK}.`,
  ].join("\n");
}

function slug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

function extractImage(res) {
  const parts = res.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    if (p.inlineData?.data) {
      return {
        buffer: Buffer.from(p.inlineData.data, "base64"),
        mime: p.inlineData.mimeType || "image/png",
      };
    }
  }
  throw new Error("Gemini image response contained no image data");
}

function extFor(mime) {
  if (/jpeg|jpg/i.test(mime)) return "jpg";
  if (/webp/i.test(mime)) return "webp";
  return "png";
}

async function generateOne(client, sport, outDir, baseSlug) {
  const maxAttempts = 4;
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await client.models.generateContent({
        model: IMAGE_MODEL,
        contents: buildPrompt(sport),
        config: { imageConfig: { aspectRatio: ASPECT_RATIO } },
      });
      const { buffer, mime } = extractImage(res);
      const outPath = join(outDir, `${baseSlug}.${extFor(mime)}`);
      await writeFile(outPath, buffer);
      return outPath;
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message ?? err);
      const retriable = /429|5\d\d|rate|timeout|temporar/i.test(msg);
      if (!retriable || attempt === maxAttempts) break;
      const delay = 1500 * 2 ** (attempt - 1);
      console.warn(`  ↻ retry ${attempt}/${maxAttempts - 1} after ${delay}ms — ${msg.slice(0, 120)}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

async function main() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is not set. Add it to .env.local and run via `npm run gen:avatars`.");
    process.exit(1);
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = join(here, "..", "public", "avatars");
  await mkdir(outDir, { recursive: true });

  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : SPORTS.length;
  const targets = SPORTS.slice(0, limit);

  const client = new GoogleGenAI({ apiKey });

  async function existingFor(baseSlug) {
    for (const ext of ["png", "jpg", "webp"]) {
      const p = join(outDir, `${baseSlug}.${ext}`);
      if (await exists(p)) return p;
    }
    return null;
  }

  let generated = 0, skipped = 0, failed = 0;
  for (let i = 0; i < targets.length; i++) {
    const sport = targets[i];
    const baseSlug = slug(sport);
    const tag = `[${i + 1}/${targets.length}] ${sport}`;
    const have = await existingFor(baseSlug);
    if (have) {
      console.log(`${tag} — skip (exists: ${have})`);
      skipped++;
      continue;
    }
    process.stdout.write(`${tag} — generating… `);
    const t0 = Date.now();
    try {
      const outPath = await generateOne(client, sport, outDir, baseSlug);
      console.log(`✓ ${(Date.now() - t0) / 1000 | 0}s → ${outPath}`);
      generated++;
    } catch (err) {
      console.log(`✗ ${err?.message ?? err}`);
      failed++;
    }
  }

  console.log(`\nDone. generated=${generated} skipped=${skipped} failed=${failed}`);
  if (failed) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
