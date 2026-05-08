import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { geminiImage, hasApiKey } from "./lib/gemini.js";
import { DEFAULT_STYLE_BLOCK, buildImagePrompt } from "./lib/monsterGen.js";

const T = {
  bg: "#06080c",
  s1: "#0c0f16",
  s2: "#111620",
  gold: "#d4a843",
  gd: "#8b7530",
  red: "#ef4444",
  txt: "#e8e0d4",
  dim: "#8a8278",
  fnt: "#3a3630",
  hd: "'Cinzel',serif",
  bd: "'Crimson Pro',Georgia,serif",
};

const DEFAULT_STYLE = DEFAULT_STYLE_BLOCK;

const GREEK_MONSTERS = [
  { name: "Cerberus", backstory: "A three-headed hellhound chained at the gates of the Underworld, born of Echidna and Typhon. Its triple jaws drip black ichor and its eyes glow like dying coals." },
  { name: "Hydra", backstory: "A serpentine swamp-beast of Lerna whose severed heads each grow back twofold, hissing acid and steam. Its central immortal head crowns a writhing forest of necks." },
  { name: "Minotaur", backstory: "A bull-headed giant imprisoned in the labyrinth beneath Crete, hungering for tribute in the dark. Coarse fur mats his shoulders and bronze rings pierce his snout." },
  { name: "Chimera", backstory: "A fire-breathing fusion of lion, goat, and serpent, said to herald disaster wherever its silhouette is glimpsed. Each head speaks a different curse in chorus." },
  { name: "Medusa", backstory: "A Gorgon whose snake-laced hair hisses warnings as her gaze petrifies any who meet it. Bronze scales armor her shoulders and her eyes burn jade." },
  { name: "Scylla", backstory: "A six-headed sea horror lurking in the strait, plucking sailors from passing ships with whip-fast lunges. Below the waist, a girdle of barking dog-heads thrashes the surf." },
  { name: "Charybdis", backstory: "A monstrous maw beneath the waves that swallows entire seas three times a day, then vomits them back as black whirlpools. Her endless throat opens beneath the storm." },
  { name: "Harpy", backstory: "A wind-borne predator with the body of a vulture and the face of a furious woman. She steals food and souls alike, leaving feathers black as oil in her wake." },
  { name: "Sphinx", backstory: "A lion-bodied riddler with a woman's face and feathered wings, perched at the gates of Thebes. Travelers who fail her riddle are devoured before sundown." },
  { name: "Cyclops", backstory: "A one-eyed mountain-smith forging thunderbolts deep in volcanic caverns. Soot blackens his hide and a single molten eye blazes beneath his brow." },
  { name: "Typhon", backstory: "Father of monsters, a hundred serpent-headed titan whose roar shakes Olympus itself. Wings of storm-cloud unfurl from his shoulders and lightning crackles between his fangs." },
  { name: "Echidna", backstory: "Mother of monsters, half-woman and half-serpent, dwelling in a deep cave from which she births the world's worst horrors. Her tail coils through the dark like a living river." },
  { name: "Lamia", backstory: "A child-eating serpent woman cursed by Hera's grief, prowling the night with hollow eyes and a too-wide smile. Her lower body unspools into endless coils." },
  { name: "Empusa", backstory: "A shape-shifting demon of the dark roads with one bronze leg and one of donkey-bone, draining lonely travelers. Her hair flickers like firelight." },
  { name: "Ladon", backstory: "A hundred-headed dragon coiled around the golden apple tree of the Hesperides, sleeplessly guarding the fruit of immortality. His scales gleam like beaten brass." },
  { name: "Stymphalian Birds", backstory: "A flock of bronze-beaked man-eaters with metal feathers they fling like arrows. Their wings clatter like a marching army through the marsh." },
  { name: "Nemean Lion", backstory: "A golden-furred giant lion whose hide turns aside every blade and arrow ever forged. Its claws are sharper than any sword and its roar paralyzes the brave." },
  { name: "Erymanthian Boar", backstory: "A mountain-sized boar whose tusks splinter trees and whose hooves crack stone. Steam jets from its snout in the cold morning air." },
  { name: "Gorgon", backstory: "An ancient sister-monster older than Medusa, with brass tusks, golden wings, and a serpent crown. The light in her eyes drinks color from the world." },
  { name: "Cretan Bull", backstory: "A divine white bull breathing fire across the fields of Crete, gift and curse of Poseidon. Its hooves leave black scorch-marks in the grass." },
];

const ASPECTS = ["1:1", "2:3", "3:2", "4:5", "5:4", "9:16", "16:9"];

// Lab uses the same builder as the main app so prompt experiments transfer 1:1.
const buildFullPrompt = buildImagePrompt;

const MAP_PROMPT_INTRO = [
  "A mythic chart of the contiguous United States as imagined by an ancient Greek cartographer reborn in a modern anime fantasy world. The land of America is depicted as a sacred continent floating on a dark mythic sea, divided into seven kingdoms that mortals must defend.",
  "",
  "The seven regions, each rendered as a single unified colored shape with a bold colored perimeter outline (internal state lines barely visible):",
  "- Pacific (deep cobalt blue): California, Oregon, Washington, Nevada.",
  "- Mountain (slate stone gray): Colorado, Utah, Wyoming, Montana, Idaho.",
  "- Southwest (deep crimson red): Texas, Arizona, New Mexico, Oklahoma.",
  "- Heartland (antique gold): Ohio, Indiana, Illinois, Michigan, Minnesota, Wisconsin, Iowa, Missouri, Kansas, Nebraska, North Dakota, South Dakota.",
  "- South (vibrant emerald green): Florida, Georgia, Alabama, Tennessee, North Carolina, South Carolina, Mississippi, Louisiana, Arkansas, Kentucky.",
  "- Northeast (royal purple): New York, New Jersey, Massachusetts, Pennsylvania, Maine, Vermont, New Hampshire, Rhode Island, Connecticut.",
  "- Capital (deep indigo): Washington DC, Maryland, Virginia, West Virginia, Delaware.",
  "",
  "The continent's geographic shape is recognizable — Florida peninsula, Texas, the Great Lakes notch, the long western coastline.",
  "",
  "Embellish the chart with Greek-mythology details, sized so they read as flavor without obscuring the regions:",
  "- Coiled sea monsters lurking in the oceans off both coasts: a hydra rising in the Pacific, a kraken's tentacles breaking the Atlantic surface, a serpent in the Gulf of Mexico.",
  "- Stylized whitecap waves rippling outward from the coastline in clean anime line work.",
  "- Tiny mythic iconography scattered subtly within regions — a small temple, a laurel wreath, a thunderbolt, a chariot, a discus, an olive branch — each barely larger than a coin, dotted sparsely across the kingdoms.",
  "- An ornate compass-rose / wind-rose in one open ocean corner, with a single classical wind-god face (an Anemoi) blowing across it.",
  "- A faint Greek meander key pattern running as a thin border ornament along the outer edge of the canvas (NOT a heavy frame, just a narrow decorative band integrated into the artwork).",
  "- A scatter of constellation dots and faint star-lines in the deep ocean night sky around the continent.",
  "- A warm golden brazier-glow behind each region in its accent color, as if each kingdom were lit from within by firelight.",
  "",
  "The composition feels like a sacred parchment scroll reimagined in vibrant anime cartoon ink — bold confident outlines, flat cel-shaded color, dramatic shadows. Dark charcoal-black mythic-sea background.",
  "",
  "No state names, no city names, no country labels, no compass labels, no legend, no text of any kind anywhere on the map.",
].join("\n");

function buildMapPrompt(styleBlock) {
  return `${MAP_PROMPT_INTRO}\n\n${styleBlock}`;
}

function KeyMissing() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.txt, display: "flex", alignItems: "center", justifyContent: "center", padding: 30, fontFamily: T.bd }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 36 }}>🔑</div>
        <h2 style={{ fontFamily: T.hd, color: T.gold }}>Gemini API Key Required</h2>
        <p style={{ color: T.dim, lineHeight: 1.6 }}>
          Add <code style={{ color: T.gold, background: T.s2, padding: "1px 5px", borderRadius: 3 }}>VITE_GEMINI_API_KEY</code> to <code style={{ color: T.gold, background: T.s2, padding: "1px 5px", borderRadius: 3 }}>.env.local</code> and restart the dev server.
        </p>
      </div>
    </div>
  );
}

function PromptLab() {
  const [styleBlock, setStyleBlock] = useState(DEFAULT_STYLE);
  const [aspect, setAspect] = useState("2:3");
  const [monster, setMonster] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [fullPrompt, setFullPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(null);

  const generate = async () => {
    const m = GREEK_MONSTERS[(Math.random() * GREEK_MONSTERS.length) | 0];
    const prompt = buildFullPrompt(m, styleBlock);
    setMonster(m);
    setFullPrompt(prompt);
    setImageUrl(null);
    setError(null);
    setLoading(true);
    setElapsed(null);
    const t0 = performance.now();
    try {
      const url = await geminiImage(prompt, { aspectRatio: aspect });
      setImageUrl(url);
      setElapsed(((performance.now() - t0) / 1000).toFixed(1));
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const generateMap = async () => {
    const prompt = buildMapPrompt(styleBlock);
    setMonster({ name: "USA Map", backstory: "Stylized regional map of the contiguous United States." });
    setFullPrompt(prompt);
    setImageUrl(null);
    setError(null);
    setLoading(true);
    setElapsed(null);
    const t0 = performance.now();
    try {
      const url = await geminiImage(prompt, { aspectRatio: "16:9" });
      setImageUrl(url);
      setElapsed(((performance.now() - t0) / 1000).toFixed(1));
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.txt, fontFamily: T.bd }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:${T.bg}}textarea,select,input,button{font-family:inherit}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${T.fnt};border-radius:3px}`}</style>
      <header style={{ borderBottom: `1px solid ${T.fnt}`, padding: "14px 24px", display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: T.hd, color: T.gold, fontSize: 22, letterSpacing: 4 }}>PROMPT LAB</h1>
        <span style={{ color: T.dim, fontSize: 12, fontStyle: "italic" }}>iterate on the monster image prompt — main game at <a href="/" style={{ color: T.gold }}>/</a></span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: 20, padding: 20, maxWidth: 1400, margin: "0 auto" }}>
        {/* Left: controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: T.gd, fontFamily: T.hd, letterSpacing: 3, marginBottom: 6 }}>STYLE BLOCK (shared portion of every prompt)</div>
            <textarea
              value={styleBlock}
              onChange={(e) => setStyleBlock(e.target.value)}
              spellCheck={false}
              style={{ width: "100%", minHeight: 320, background: T.s1, border: `1px solid ${T.fnt}`, borderRadius: 8, padding: 12, color: T.txt, fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: T.gd, fontFamily: T.hd, letterSpacing: 2 }}>ASPECT</span>
              <select value={aspect} onChange={(e) => setAspect(e.target.value)} style={{ background: T.s1, border: `1px solid ${T.fnt}`, color: T.txt, borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                {ASPECTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>

            <button
              onClick={generate}
              disabled={loading}
              style={{ background: "transparent", border: `2px solid ${loading ? T.fnt : T.gold}`, color: loading ? T.fnt : T.gold, fontFamily: T.hd, fontSize: 12, padding: "8px 18px", borderRadius: 7, cursor: loading ? "default" : "pointer", letterSpacing: 2, textTransform: "uppercase" }}
            >
              {loading ? "Summoning…" : "Generate Random Greek Monster"}
            </button>

            <button
              onClick={generateMap}
              disabled={loading}
              style={{ background: "transparent", border: `2px solid ${loading ? T.fnt : T.blu}`, color: loading ? T.fnt : T.blu, fontFamily: T.hd, fontSize: 12, padding: "8px 18px", borderRadius: 7, cursor: loading ? "default" : "pointer", letterSpacing: 2, textTransform: "uppercase" }}
            >
              {loading ? "Drawing…" : "Generate USA Map"}
            </button>

            <button
              onClick={() => setStyleBlock(DEFAULT_STYLE)}
              style={{ background: "transparent", border: `1px solid ${T.dim}`, color: T.dim, fontFamily: T.hd, fontSize: 10, padding: "6px 12px", borderRadius: 6, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase" }}
            >
              Reset Style
            </button>
          </div>

          <p style={{ fontSize: 11, color: T.dim, lineHeight: 1.6, fontStyle: "italic" }}>
            <strong style={{ color: T.gold }}>Monster:</strong> picks a random Greek monster and combines its name + backstory with your style block. Aspect goes to Nano Banana 2 via <code style={{ color: T.gold }}>imageConfig.aspectRatio</code>.<br/>
            <strong style={{ color: T.blu }}>USA Map:</strong> generates a 16:9 stylized map of the 7 regions in the same anime style. When you find one you like, right-click → Save Image As <code style={{ color: T.gold }}>public/usa-map.png</code> at the project root, then reload the main game — the start screen will use it automatically.
          </p>
        </div>

        {/* Right: result */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: T.s1, border: `1px solid ${T.fnt}`, borderRadius: 12, padding: 16, minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            {loading && (
              <div style={{ textAlign: "center", color: T.dim }}>
                <div style={{ fontSize: 32 }}>✨</div>
                <div style={{ fontFamily: T.hd, fontSize: 12, color: T.gold, letterSpacing: 3, marginTop: 8 }}>SUMMONING {monster?.name?.toUpperCase()}…</div>
                <div style={{ fontSize: 11, marginTop: 6 }}>Nano Banana 2 takes ~10-15s</div>
              </div>
            )}
            {!loading && imageUrl && (
              <img src={imageUrl} alt={monster?.name} style={{ maxWidth: "100%", maxHeight: 540, borderRadius: 8, boxShadow: `0 0 40px ${T.gold}22` }} />
            )}
            {!loading && error && (
              <div style={{ color: T.red, fontFamily: "monospace", fontSize: 12, padding: 16, background: T.s2, borderRadius: 8, maxWidth: "100%", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {error}
              </div>
            )}
            {!loading && !imageUrl && !error && (
              <div style={{ color: T.dim, fontStyle: "italic", fontSize: 13 }}>Click Generate to summon a monster.</div>
            )}
          </div>

          {monster && (
            <div style={{ background: T.s2, borderRadius: 8, padding: 12 }}>
              <div style={{ fontFamily: T.hd, color: T.gold, fontSize: 16 }}>{monster.name}</div>
              {elapsed && <div style={{ fontSize: 10, color: T.dim, marginBottom: 4 }}>generated in {elapsed}s · {aspect}</div>}
              <div style={{ fontSize: 12, color: T.txt, lineHeight: 1.6, marginTop: 4 }}>{monster.backstory}</div>
            </div>
          )}

          {fullPrompt && (
            <details style={{ background: T.s2, borderRadius: 8, padding: 12 }}>
              <summary style={{ cursor: "pointer", fontFamily: T.hd, color: T.gd, fontSize: 11, letterSpacing: 2 }}>SHOW FULL PROMPT SENT TO NANO BANANA 2</summary>
              <pre style={{ marginTop: 10, fontSize: 11, color: T.txt, whiteSpace: "pre-wrap", lineHeight: 1.6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fullPrompt}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(hasApiKey() ? <PromptLab /> : <KeyMissing />);
