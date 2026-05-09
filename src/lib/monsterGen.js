import { geminiText, geminiImage } from "./gemini.js";

export const SPECIALS = [
  "hit_strongest",
  "hit_weakest",
  "aoe",
  "regenerate",
  "block_weak",
];

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

const SPECIAL_HINTS = {
  hit_strongest: "charges your strongest spirit first",
  hit_weakest: "swoops on the weakest spirit",
  aoe: "hits all spirits each turn",
  regenerate: "regenerates HP each turn — focus fire",
  block_weak: "blocks moves with low total hit rate",
};

function buildTextPrompt({ regionName, states, basis }) {
  const specialList = SPECIALS.map(s => `"${s}" (${SPECIAL_HINTS[s]})`).join(", ");
  const lines = [
    `You are designing a mythological monster threatening the ${regionName} region of America (${states}) before the LA28 Olympics.`,
    `Style: dark Greek-mythology meets modern sports drama. Tone: dramatic, evocative.`,
  ];
  if (basis) {
    lines.push(
      `IMPORTANT: This is a returning rival. Its previous form "${basis.name}" was defeated. Generate its STRONGER reincarnation.`,
      `Reuse the same archetype/creature family. Give it a new name using a suffix like "Elder", "Reborn", "II", or "Ascendant".`,
    );
  } else {
    lines.push("Invent a fresh monster — do not reuse classic Greek monster names like Hydra, Cerberus, Minotaur, Scylla, Chimera, Harpy, or Typhon.");
  }
  lines.push(
    "Output JSON with these fields:",
    "- name: monster name (1-3 words)",
    "- emoji: ONE single unicode emoji that visually represents it",
    `- hp: integer 60-250 (tougher monsters = higher HP; ${basis ? "this is a stronger reincarnation, lean higher" : "balanced"})`,
    "- has_special: true if it has a special ability, false for a basic monster",
    `- special: one of [${specialList}] — meaningful only when has_special is true`,
    "- desc: ONE short sentence describing its mechanic for the player (e.g., 'Charges your strongest spirit first.')",
    "- backstory: TWO sentences of dramatic flavor lore.",
  );
  return lines.join("\n");
}

export const DEFAULT_STYLE_BLOCK = [
  "The output is the direct image itself — a vibrant modern anime cartoon depiction with confident inked outlines, bold cel-shaded coloring, and clean flat shadows in the spirit of contemporary Japanese animated films.",
  "The monster is the antagonist a player must defeat in an Olympic-themed game, so it must look formidable, expressive, and clearly readable as a single hero subject.",
  "Frame the monster as a single full-body character centered and filling the canvas edge to edge so the subject reaches all four borders; the background is a simple atmospheric color wash that flows seamlessly to the edges.",
  "Light the scene with a dramatic warm key light from the upper left and a deep crimson rim light from below to evoke firelight, casting cinematic shadows that emphasize the silhouette.",
  "Use a palette of antique gold, deep crimson, charcoal black, and bronze accents to match a Greek-mythology UI.",
  "Critical: the image must NOT depict a photograph of a poster, print, painting, canvas, framed picture, or piece of paper. It must NOT show any human, hands, fingers, arms, body parts, easel, gallery wall, room, table, or display device holding or surrounding the artwork. There is no real-world object containing the image — the monster fills the entire output directly.",
  "Do not draw any decorative borders, picture frames, panel layouts, ornamental edges, vignettes, mat boards, paper edges, or inner outlines around the monster; the depiction must bleed cleanly to every edge of the output.",
  "The image must contain no text, no captions, no logos, no watermarks, no signatures, and no UI elements anywhere.",
].join("\n\n");

/**
 * Compose the full image prompt for a monster.
 * Exported so the prompt lab and any other tools share one source of truth.
 * @param {{name:string, backstory:string}} monster
 * @param {string} [styleBlock=DEFAULT_STYLE_BLOCK]
 */
export function buildImagePrompt(monster, styleBlock = DEFAULT_STYLE_BLOCK) {
  return `Direct full-frame depiction of a mythological monster named "${monster.name}". ${monster.backstory}\n\n${styleBlock}`;
}

export function pickSpawnBasis(defeatedHistory) {
  if (!defeatedHistory?.length) return null;
  if (Math.random() < 0.5) return null;
  return defeatedHistory[(Math.random() * defeatedHistory.length) | 0];
}

function uid() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function generateMonster(region, opts = {}) {
  const { basis = null, onTextReady } = opts;
  const textPrompt = buildTextPrompt({
    regionName: region.name,
    states: region.states,
    basis,
  });
  const data = await geminiText(textPrompt, MONSTER_SCHEMA);
  const baseHp = Math.max(60, Math.min(250, data.hp | 0));
  const hp = basis ? Math.min(300, Math.round(baseHp * 1.3)) : baseHp;
  const partial = {
    id: uid(),
    name: data.name,
    emoji: data.emoji || "👹",
    hp,
    maxHp: hp,
    special: data.has_special ? data.special : null,
    desc: data.desc,
    backstory: data.backstory,
    regionId: region.id,
    level: basis ? (basis.level || 1) + 1 : 1,
    basisId: basis?.id ?? null,
    imageDataUrl: null,
    imageStatus: "loading",
  };
  if (onTextReady) {
    try { onTextReady(partial); } catch {}
  }
  let imageDataUrl = null;
  try {
    imageDataUrl = await geminiImage(buildImagePrompt(partial));
  } catch (e) {
    console.error("[monsterGen] image generation failed:", e);
  }
  return {
    ...partial,
    imageDataUrl,
    imageStatus: imageDataUrl ? "ready" : "failed",
  };
}
