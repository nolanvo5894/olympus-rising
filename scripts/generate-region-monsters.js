// Pre-bake one monster per ACTIVE region so the first encounter loads instantly
// without hitting Gemini. Replacements after defeat still use the live API
// (handled by the in-game nextSlots queue).
//
// Run: `npm run gen:monsters`

import { GoogleGenAI } from "@google/genai";
import { mkdir, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const TEXT_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "gemini-3-pro-image-preview";

// Mirrors ACTIVE_REGIONS in src/App.jsx (REGIONS minus la28).
const REGIONS = [
  { id: "pacific",   name: "Pacific",   states: "CA, OR, WA, NV" },
  { id: "mountain",  name: "Mountain",  states: "CO, UT, WY, MT, ID" },
  { id: "southwest", name: "Southwest", states: "TX, AZ, NM, OK" },
  { id: "heartland", name: "Heartland", states: "OH, IN, IL, MI, MN, WI" },
  { id: "south",     name: "South",     states: "FL, GA, AL, TN, NC, SC" },
  { id: "northeast", name: "Northeast", states: "NY, NJ, MA, PA, ME" },
  { id: "capital",   name: "Capital",   states: "DC, MD, VA, WV, DE" },
];

const SPECIALS = ["hit_strongest", "hit_weakest", "aoe", "regenerate", "block_weak", "shift_weakness"];
const SPECIAL_HINTS = {
  hit_strongest: "charges your strongest spirit first",
  hit_weakest: "swoops on the weakest spirit",
  aoe: "hits all spirits each turn",
  regenerate: "regenerates HP each turn — focus fire",
  block_weak: "blocks moves with low total hit rate",
  shift_weakness: "weakness shifts each turn — match the medal type for bonus damage",
};

const MONSTER_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    emoji: { type: "string" },
    hp: { type: "integer", minimum: 60, maximum: 250 },
    has_special: { type: "boolean" },
    special: { type: "string", enum: SPECIALS },
    desc: { type: "string" },
    backstory: { type: "string" },
  },
  required: ["name", "emoji", "hp", "has_special", "special", "desc", "backstory"],
};

const STYLE_BLOCK = [
  "The output is the direct image itself — a vibrant modern anime cartoon depiction with confident inked outlines, bold cel-shaded coloring, and clean flat shadows in the spirit of contemporary Japanese animated films.",
  "The monster is the antagonist a player must defeat in an Olympic-themed game, so it must look formidable, expressive, and clearly readable as a single hero subject.",
  "Frame the monster as a single full-body character centered and filling the canvas edge to edge so the subject reaches all four borders; the background is a simple atmospheric color wash that flows seamlessly to the edges.",
  "Light the scene with a dramatic warm key light from the upper left and a deep crimson rim light from below to evoke firelight, casting cinematic shadows that emphasize the silhouette.",
  "Use a palette of antique gold, deep crimson, charcoal black, and bronze accents to match a Greek-mythology UI.",
  "Critical: the image must NOT depict a photograph of a poster, print, painting, canvas, framed picture, or piece of paper. It must NOT show any human, hands, fingers, arms, body parts, easel, gallery wall, room, table, or display device holding or surrounding the artwork. There is no real-world object containing the image — the monster fills the entire output directly.",
  "Do not draw any decorative borders, picture frames, panel layouts, ornamental edges, vignettes, mat boards, paper edges, or inner outlines around the monster; the depiction must bleed cleanly to every edge of the output.",
  "The image must contain no text, no captions, no logos, no watermarks, no signatures, and no UI elements anywhere.",
].join("\n\n");

function buildTextPrompt(region) {
  const specialList = SPECIALS.map(s => `"${s}" (${SPECIAL_HINTS[s]})`).join(", ");
  return [
    `You are designing a mythological monster threatening the ${region.name} region of America (${region.states}) before the LA28 Olympics.`,
    `Style: dark Greek-mythology meets modern sports drama. Tone: dramatic, evocative.`,
    "Invent a fresh monster — do not reuse classic Greek monster names like Hydra, Cerberus, Minotaur, Scylla, Chimera, Harpy, or Typhon.",
    "Output JSON with these fields:",
    "- name: monster name (1-3 words)",
    "- emoji: ONE single unicode emoji that visually represents it",
    "- hp: integer 60-250 (tougher monsters = higher HP; balanced)",
    "- has_special: true if it has a special ability, false for a basic monster",
    `- special: one of [${specialList}] — meaningful only when has_special is true`,
    "- desc: ONE short sentence describing its mechanic for the player (e.g., 'Charges your strongest spirit first.')",
    "- backstory: TWO sentences of dramatic flavor lore.",
  ].join("\n");
}

function buildImagePrompt(monster) {
  return `Direct full-frame depiction of a mythological monster named "${monster.name}". ${monster.backstory}\n\n${STYLE_BLOCK}`;
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

function extFor(mime) {
  if (/jpeg|jpg/i.test(mime)) return "jpg";
  if (/webp/i.test(mime)) return "webp";
  return "png";
}

function uid() {
  return `m_baked_${Math.random().toString(36).slice(2, 10)}`;
}

async function generateRegion(client, region, outDir) {
  const jsonPath = join(outDir, `${region.id}.json`);
  if (await exists(jsonPath)) return { skipped: true };

  // 1) Text — monster identity
  const textRes = await client.models.generateContent({
    model: TEXT_MODEL,
    contents: buildTextPrompt(region),
    config: { responseMimeType: "application/json", responseSchema: MONSTER_SCHEMA },
  });
  const data = JSON.parse(textRes.text);
  const hp = Math.max(60, Math.min(250, data.hp | 0));

  // 2) Image — saved next to the JSON
  const imgRes = await client.models.generateContent({
    model: IMAGE_MODEL,
    contents: buildImagePrompt({ name: data.name, backstory: data.backstory }),
    config: { imageConfig: { aspectRatio: "1:1" } },
  });
  const parts = imgRes.candidates?.[0]?.content?.parts ?? [];
  let imgFile = null;
  for (const p of parts) {
    if (p.inlineData?.data) {
      const ext = extFor(p.inlineData.mimeType);
      imgFile = `${region.id}.${ext}`;
      await writeFile(join(outDir, imgFile), Buffer.from(p.inlineData.data, "base64"));
      break;
    }
  }
  if (!imgFile) throw new Error("no image data in response");

  // 3) JSON manifest — shaped to match the monster object the React app expects.
  // imageDataUrl points at the public path so <img src> works without changes.
  const monster = {
    id: uid(),
    name: data.name,
    emoji: data.emoji || "👹",
    hp,
    maxHp: hp,
    special: data.has_special ? data.special : null,
    desc: data.desc,
    backstory: data.backstory,
    regionId: region.id,
    level: 1,
    basisId: null,
    imageDataUrl: `/monsters/${imgFile}`,
    imageStatus: "ready",
    baked: true,
  };
  await writeFile(jsonPath, JSON.stringify(monster, null, 2));
  return { skipped: false, monster };
}

async function main() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is not set. Run via `npm run gen:monsters`.");
    process.exit(1);
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = join(here, "..", "public", "monsters");
  await mkdir(outDir, { recursive: true });

  const client = new GoogleGenAI({ apiKey });
  let generated = 0, skipped = 0, failed = 0;
  for (let i = 0; i < REGIONS.length; i++) {
    const r = REGIONS[i];
    const tag = `[${i + 1}/${REGIONS.length}] ${r.name}`;
    process.stdout.write(`${tag} — `);
    const t0 = Date.now();
    try {
      const res = await generateRegion(client, r, outDir);
      if (res.skipped) { console.log("skip (exists)"); skipped++; }
      else { console.log(`✓ ${(Date.now() - t0) / 1000 | 0}s · ${res.monster.name} (HP ${res.monster.hp})`); generated++; }
    } catch (err) {
      console.log(`✗ ${err?.message ?? err}`);
      failed++;
    }
  }
  console.log(`\nDone. generated=${generated} skipped=${skipped} failed=${failed}`);
  if (failed) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
