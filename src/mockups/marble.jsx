import React from "react";
import { createRoot } from "react-dom/client";

// ============================================================================
// MARBLE & GOLD — Editorial Mythos
// Vibe: museum exhibit × National Geographic feature × ancient archive
// ============================================================================

const C = {
  paper: "#f4ecd8",
  paperDeep: "#ebe0c4",
  ink: "#1a1410",
  inkSoft: "#3b2f24",
  gold: "#a8804a",
  goldDeep: "#7a5a30",
  oxblood: "#7a2f1f",
  stone: "#cdc4b3",
  stoneDeep: "#9a8e76",
  rule: "#5c4a3a",
};

const F = {
  display: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  body: "'Crimson Pro', 'Crimson Text', Georgia, serif",
};

// Real sport+move data from datasets/medal_rates.json
const SPIRITS = [
  {
    name: "Phaethon of the Lane",
    sport: "Swimming",
    epithet: "Bearer of the Sun-chariot",
    moves: [
      { name: "100m Freestyle", g: 0.43, s: 0.16, b: 0.16 },
      { name: "4×100m Medley Relay", g: 0.79, s: 0.18, b: 0.0 },
      { name: "200m Backstroke", g: 0.45, s: 0.24, b: 0.0 },
    ],
    region: "Pacific Coast",
    medals: { g: 257, s: 168, b: 121 },
  },
  {
    name: "Atalanta Resurgent",
    sport: "Track & Field",
    epithet: "Swift-footed huntress",
    moves: [
      { name: "100m Sprint", g: 0.51, s: 0.2, b: 0.08 },
      { name: "4×400m Relay", g: 0.7, s: 0.2, b: 0.03 },
      { name: "Marathon", g: 0.1, s: 0.05, b: 0.12 },
    ],
    region: "Plains",
    medals: { g: 339, s: 290, b: 196 },
  },
  {
    name: "Heracles Bound",
    sport: "Wrestling",
    epithet: "Twelve-labored, ever-patient",
    moves: [
      { name: "Freestyle Heavyweight", g: 0.32, s: 0.18, b: 0.22 },
      { name: "Greco-Roman 97kg", g: 0.28, s: 0.12, b: 0.18 },
    ],
    region: "Heartland",
    medals: { g: 56, s: 42, b: 38 },
  },
];

const MONSTER = {
  name: "The Hydra of Capitolia",
  sigil: "𓆗",
  region: "The Capital",
  story:
    "Born of swamp-mist and political grievance, the nine-headed Hydra coils beneath the marble district. Each head is a faction; each fang, a cudgel. To strike one is to summon two.",
  hp: 64,
  maxHp: 100,
  threat: "MAJOR",
};

// ─── Atomic visuals ─────────────────────────────────────────────────────────

function Rule({ ornament = false, color = C.rule, mt = 18, mb = 18 }) {
  if (!ornament) {
    return (
      <div
        style={{
          height: 1,
          background: color,
          marginTop: mt,
          marginBottom: mb,
          opacity: 0.5,
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginTop: mt,
        marginBottom: mb,
        color: C.gold,
      }}
    >
      <div style={{ flex: 1, height: 1, background: C.rule, opacity: 0.4 }} />
      <span style={{ fontFamily: F.display, fontSize: 22, letterSpacing: 4 }}>❦</span>
      <div style={{ flex: 1, height: 1, background: C.rule, opacity: 0.4 }} />
    </div>
  );
}

function SmallCaps({ children, color = C.goldDeep, size = 11, tracking = 3 }) {
  return (
    <span
      style={{
        fontFamily: F.body,
        fontSize: size,
        letterSpacing: tracking,
        textTransform: "uppercase",
        fontWeight: 600,
        color,
      }}
    >
      {children}
    </span>
  );
}

function InkBar({ pct, height = 6, max = 100 }) {
  const w = Math.max(0, Math.min(100, (pct / max) * 100));
  return (
    <div
      style={{
        height,
        width: "100%",
        background: C.paperDeep,
        position: "relative",
        border: `1px solid ${C.rule}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: `${w}%`,
          background: `repeating-linear-gradient(135deg, ${C.ink} 0 2px, ${C.inkSoft} 2px 4px)`,
        }}
      />
    </div>
  );
}

function MedalRow({ g, s, b }) {
  const miss = Math.max(0, 1 - g - s - b);
  const cell = (label, val, fill) => (
    <div style={{ flex: val || 0.001, minWidth: 0 }}>
      <div style={{ height: 8, background: fill, borderTop: `1px solid ${C.ink}` }} />
      <div
        style={{
          fontFamily: F.body,
          fontSize: 9,
          letterSpacing: 1,
          color: C.inkSoft,
          marginTop: 3,
          textAlign: "center",
        }}
      >
        {Math.round(val * 100)}%
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {cell("g", g, C.gold)}
      {cell("s", s, C.stoneDeep)}
      {cell("b", b, C.oxblood)}
      {cell("m", miss, C.paperDeep)}
    </div>
  );
}

// ─── Panels ─────────────────────────────────────────────────────────────────

function PanelLabel({ n, name }) {
  return (
    <div
      style={{
        background: C.ink,
        color: C.paper,
        padding: "10px 40px",
        display: "flex",
        alignItems: "baseline",
        gap: 18,
        borderTop: `1px solid ${C.gold}`,
        borderBottom: `1px solid ${C.gold}`,
      }}
    >
      <span
        style={{
          fontFamily: F.display,
          fontSize: 28,
          color: C.gold,
          fontWeight: 500,
        }}
      >
        {n}
      </span>
      <SmallCaps color={C.stone} size={13} tracking={6}>
        {name}
      </SmallCaps>
      <div style={{ flex: 1, height: 1, background: C.gold, opacity: 0.3 }} />
      <SmallCaps color={C.stoneDeep} size={10} tracking={4}>
        Folio I · Mockup A · Marble & Gold
      </SmallCaps>
    </div>
  );
}

// 1. Landing — Editorial cover
function LandingPanel() {
  return (
    <section
      style={{
        background: C.paper,
        backgroundImage:
          "radial-gradient(circle at 30% 20%, rgba(168,128,74,0.06), transparent 50%), radial-gradient(circle at 80% 70%, rgba(122,47,31,0.05), transparent 50%)",
        padding: "70px 60px 90px",
        color: C.ink,
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingBottom: 14,
          borderBottom: `2px solid ${C.ink}`,
          marginBottom: 60,
        }}
      >
        <SmallCaps tracking={5} size={12} color={C.ink}>
          Folio I · MMXXVI
        </SmallCaps>
        <span
          style={{
            fontFamily: F.display,
            fontSize: 16,
            fontStyle: "italic",
            color: C.goldDeep,
          }}
        >
          The Mythography of American Sport
        </span>
        <SmallCaps tracking={5} size={12} color={C.ink}>
          № 042 · Free with Membership
        </SmallCaps>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "5fr 4fr", gap: 80 }}>
        <div>
          <SmallCaps color={C.oxblood} tracking={6} size={13}>
            A Volume in Three Parts
          </SmallCaps>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: 124,
              fontWeight: 500,
              lineHeight: 0.92,
              margin: "16px 0 8px",
              letterSpacing: -1,
              color: C.ink,
            }}
          >
            Olympus
            <br />
            <span style={{ fontStyle: "italic", color: C.goldDeep }}>
              Rising
            </span>
          </h1>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 22,
              fontStyle: "italic",
              color: C.inkSoft,
              marginBottom: 32,
              maxWidth: 460,
              lineHeight: 1.4,
            }}
          >
            A campaign of spirits and statistics, drawn from one hundred and
            twenty-eight years of Team USA's record at the Games.
          </div>

          <p
            style={{
              fontFamily: F.body,
              fontSize: 17,
              lineHeight: 1.65,
              color: C.inkSoft,
              maxWidth: 480,
              margin: 0,
              textIndent: 24,
            }}
          >
            <span
              style={{
                float: "left",
                fontFamily: F.display,
                fontSize: 78,
                lineHeight: 0.78,
                marginRight: 10,
                marginTop: 6,
                color: C.oxblood,
                fontWeight: 600,
              }}
            >
              T
            </span>
            he monsters now stalking the seven regions of the United States are
            not invented; they are corollaries — drawn from the historical
            record. Each blow you strike is a probability rolled against a real
            event-level medal rate. To play this game is to consult the archive.
          </p>

          <div style={{ display: "flex", gap: 18, marginTop: 46 }}>
            <button
              style={{
                background: C.ink,
                color: C.paper,
                border: `1px solid ${C.ink}`,
                padding: "16px 34px",
                fontFamily: F.body,
                fontSize: 12,
                letterSpacing: 4,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Begin Campaign →
            </button>
            <button
              style={{
                background: "transparent",
                color: C.ink,
                border: `1px solid ${C.ink}`,
                padding: "16px 34px",
                fontFamily: F.body,
                fontSize: 12,
                letterSpacing: 4,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Browse the Archive
            </button>
          </div>
        </div>

        {/* Right column — exhibit plate */}
        <div style={{ paddingTop: 18 }}>
          <div
            style={{
              border: `1px solid ${C.rule}`,
              padding: 18,
              background: C.paperDeep,
              boxShadow: `12px 12px 0 ${C.stone}`,
            }}
          >
            <div
              style={{
                aspectRatio: "3 / 4",
                background:
                  "radial-gradient(ellipse at 40% 35%, #d9c69a 0%, #a8804a 35%, #5c4126 70%, #2e1f10 100%)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 220,
                  color: C.paper,
                  textShadow: "0 4px 30px rgba(0,0,0,0.6)",
                  fontFamily: F.display,
                }}
              >
                ⚜
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,0.04) 6px 7px)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 14,
                fontFamily: F.body,
                fontSize: 11,
                letterSpacing: 2,
                color: C.inkSoft,
              }}
            >
              <span>PLATE I</span>
              <span style={{ fontStyle: "italic" }}>
                Wreath of the High Council
              </span>
              <span>c. 1896–2024</span>
            </div>
          </div>

          <div style={{ marginTop: 36 }}>
            <SmallCaps tracking={5}>By the Numbers</SmallCaps>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 14 }}>
              {[
                ["1,184", "Gold medals"],
                ["963", "Silver"],
                ["834", "Bronze"],
                ["137", "Combat moves"],
              ].map(([big, lab]) => (
                <div key={lab} style={{ borderTop: `1px solid ${C.ink}`, paddingTop: 8 }}>
                  <div
                    style={{
                      fontFamily: F.display,
                      fontSize: 56,
                      lineHeight: 1,
                      color: C.ink,
                    }}
                  >
                    {big}
                  </div>
                  <SmallCaps>{lab}</SmallCaps>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: F.body,
          fontSize: 11,
          letterSpacing: 2,
          color: C.inkSoft,
        }}
      >
        <span>i. The Cover</span>
        <span style={{ fontStyle: "italic" }}>
          continued in the regions of the country
        </span>
        <span>↓</span>
      </div>
    </section>
  );
}

// 2. Region + Scout — Cartographer's plate
function RegionPanel() {
  return (
    <section
      style={{
        background: C.paper,
        padding: "70px 60px 90px",
        color: C.ink,
        position: "relative",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "5fr 4fr", gap: 60 }}>
        {/* Cartographer's map */}
        <div>
          <SmallCaps tracking={5}>Plate II — A Map of the Theaters</SmallCaps>
          <h2
            style={{
              fontFamily: F.display,
              fontSize: 56,
              fontWeight: 500,
              margin: "10px 0 8px",
              letterSpacing: -0.5,
            }}
          >
            Where the monsters now sit.
          </h2>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 17,
              fontStyle: "italic",
              color: C.inkSoft,
              marginBottom: 24,
            }}
          >
            Eight regions, eight sieges. Each marked by a beast of local
            character.
          </div>

          <div
            style={{
              border: `2px solid ${C.ink}`,
              padding: 26,
              background: `${C.paperDeep}`,
              backgroundImage:
                "radial-gradient(circle at 50% 50%, transparent 60%, rgba(168,128,74,0.18) 100%)",
              position: "relative",
              boxShadow: `0 0 0 6px ${C.paper}, 0 0 0 7px ${C.rule}`,
            }}
          >
            <svg viewBox="0 0 600 380" style={{ width: "100%", display: "block" }}>
              <defs>
                <pattern id="grain" width="3" height="3" patternUnits="userSpaceOnUse">
                  <rect width="3" height="3" fill={C.paperDeep} />
                  <circle cx="1" cy="1" r="0.3" fill={C.rule} opacity="0.3" />
                </pattern>
              </defs>
              <rect width="600" height="380" fill="url(#grain)" />
              {/* Stylized US silhouette */}
              <path
                d="M60 130 Q90 90 150 95 L 230 80 Q 300 70 380 80 L 470 90 Q 530 100 540 130 L 530 200 Q 510 260 470 280 L 410 295 Q 350 305 300 300 L 220 305 Q 160 310 120 290 L 70 250 Q 50 200 60 130 Z"
                fill="#e9dcb6"
                stroke={C.ink}
                strokeWidth="1.4"
              />
              {/* Region anchors */}
              {[
                { x: 110, y: 200, name: "Pacific", icon: "🌊", st: "active" },
                { x: 200, y: 165, name: "Mountain", icon: "🏔︎", st: "fallen" },
                { x: 290, y: 195, name: "Plains", icon: "🌾", st: "active" },
                { x: 370, y: 155, name: "Heartland", icon: "♣", st: "active" },
                { x: 410, y: 235, name: "Delta", icon: "𓆟", st: "summon" },
                { x: 465, y: 175, name: "Atlantic", icon: "⚓", st: "active" },
                { x: 470, y: 130, name: "New Albion", icon: "♔", st: "fallen" },
                { x: 432, y: 200, name: "The Capital", icon: "𓆗", st: "boss" },
              ].map((r) => (
                <g key={r.name}>
                  <circle
                    cx={r.x}
                    cy={r.y}
                    r={r.st === "boss" ? 22 : 14}
                    fill={
                      r.st === "boss"
                        ? C.oxblood
                        : r.st === "fallen"
                        ? C.stoneDeep
                        : r.st === "summon"
                        ? C.gold
                        : C.paper
                    }
                    stroke={C.ink}
                    strokeWidth="1.5"
                  />
                  <text
                    x={r.x}
                    y={r.y + (r.st === "boss" ? 7 : 5)}
                    textAnchor="middle"
                    fontSize={r.st === "boss" ? 22 : 16}
                    fill={r.st === "fallen" ? C.paper : C.ink}
                    fontFamily={F.display}
                  >
                    {r.icon}
                  </text>
                  <text
                    x={r.x}
                    y={r.y + (r.st === "boss" ? 42 : 32)}
                    textAnchor="middle"
                    fontFamily={F.body}
                    fontSize="10"
                    letterSpacing="1.5"
                    fill={C.ink}
                  >
                    {r.name.toUpperCase()}
                  </text>
                </g>
              ))}
              {/* Compass rose */}
              <g transform="translate(540 320)">
                <circle r="22" fill={C.paper} stroke={C.ink} strokeWidth="1" />
                <path d="M0 -20 L 4 0 L 0 20 L -4 0 Z" fill={C.ink} />
                <path d="M-20 0 L 0 -4 L 20 0 L 0 4 Z" fill={C.gold} />
                <text
                  y="-26"
                  textAnchor="middle"
                  fontFamily={F.body}
                  fontSize="9"
                  letterSpacing="2"
                  fill={C.ink}
                >
                  N
                </text>
              </g>
              {/* Decorative cartouche */}
              <g transform="translate(80 50)">
                <rect width="180" height="32" fill={C.paper} stroke={C.ink} strokeWidth="1" />
                <text
                  x="90"
                  y="20"
                  textAnchor="middle"
                  fontFamily={F.display}
                  fontStyle="italic"
                  fontSize="14"
                  fill={C.ink}
                >
                  Tabula Olympica MMXXVI
                </text>
              </g>
            </svg>

            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 18,
                flexWrap: "wrap",
                fontFamily: F.body,
                fontSize: 11,
                letterSpacing: 2,
                color: C.inkSoft,
              }}
            >
              <Legend swatch={C.paper} stroke text="Active Siege" />
              <Legend swatch={C.gold} stroke text="Summoning" />
              <Legend swatch={C.stoneDeep} stroke text="Fallen" />
              <Legend swatch={C.oxblood} stroke text="Boss · The Capital" />
            </div>
          </div>
        </div>

        {/* Spirit roster */}
        <div>
          <SmallCaps tracking={5}>The Roster of Spirits</SmallCaps>
          <h3
            style={{
              fontFamily: F.display,
              fontSize: 36,
              fontWeight: 500,
              margin: "8px 0 24px",
            }}
          >
            Three champions, drawn from the archive.
          </h3>

          {SPIRITS.map((sp, i) => (
            <article
              key={sp.name}
              style={{
                marginBottom: 26,
                paddingBottom: 22,
                borderBottom: i < SPIRITS.length - 1 ? `1px solid ${C.rule}` : "none",
                display: "grid",
                gridTemplateColumns: "60px 1fr",
                gap: 18,
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 64,
                  lineHeight: 0.85,
                  color: C.gold,
                  fontWeight: 600,
                  fontStyle: "italic",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 26,
                    fontWeight: 500,
                    color: C.ink,
                    lineHeight: 1.05,
                  }}
                >
                  {sp.name}
                </div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontStyle: "italic",
                    fontSize: 14,
                    color: C.goldDeep,
                    marginBottom: 8,
                  }}
                >
                  “{sp.epithet}” · {sp.sport} · Affinity: {sp.region}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                  {sp.moves.slice(0, 2).map((m) => (
                    <div key={m.name}>
                      <div
                        style={{
                          fontFamily: F.body,
                          fontSize: 11,
                          fontStyle: "italic",
                          color: C.inkSoft,
                          marginBottom: 4,
                        }}
                      >
                        {m.name}
                      </div>
                      <MedalRow g={m.g} s={m.s} b={m.b} />
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 18, marginTop: 12 }}>
                  <Stat label="GOLD" v={sp.medals.g} c={C.gold} />
                  <Stat label="SILVER" v={sp.medals.s} c={C.stoneDeep} />
                  <Stat label="BRONZE" v={sp.medals.b} c={C.oxblood} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Legend({ swatch, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 12,
          height: 12,
          background: swatch,
          border: `1px solid ${C.ink}`,
          display: "inline-block",
        }}
      />
      <span>{text.toUpperCase()}</span>
    </div>
  );
}

function Stat({ label, v, c }) {
  return (
    <div>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 24,
          fontWeight: 600,
          color: c,
          lineHeight: 1,
        }}
      >
        {v}
      </div>
      <SmallCaps size={9} tracking={2.5} color={C.inkSoft}>
        {label}
      </SmallCaps>
    </div>
  );
}

// 3. Battle — Combat Dispatch
function BattlePanel() {
  return (
    <section
      style={{
        background: C.paper,
        padding: "70px 60px 90px",
        color: C.ink,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <SmallCaps color={C.oxblood} tracking={6}>
          Plate III · Combat Dispatch
        </SmallCaps>
        <h2
          style={{
            fontFamily: F.display,
            fontSize: 64,
            fontWeight: 500,
            margin: "8px 0 0",
            letterSpacing: -0.5,
          }}
        >
          Of the Engagement at <span style={{ fontStyle: "italic" }}>Capitolia</span>
        </h2>
        <div
          style={{
            fontFamily: F.display,
            fontStyle: "italic",
            fontSize: 17,
            color: C.inkSoft,
          }}
        >
          A field report, transcribed from the rolls of the Twelve.
        </div>
        <Rule ornament />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px 1fr", gap: 40, alignItems: "start" }}>
        {/* Left: Player roster */}
        <div>
          <SmallCaps tracking={4}>Our Champions</SmallCaps>
          <Rule mt={6} mb={14} />
          {SPIRITS.map((sp) => (
            <div
              key={sp.name}
              style={{
                marginBottom: 20,
                padding: "14px 16px",
                border: `1px solid ${C.rule}`,
                background: C.paperDeep,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: 12,
                  background: C.paper,
                  padding: "0 8px",
                  fontFamily: F.body,
                  fontSize: 10,
                  letterSpacing: 3,
                  color: C.goldDeep,
                  fontWeight: 600,
                }}
              >
                {sp.sport.toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 22,
                  fontWeight: 500,
                  marginTop: 4,
                  color: C.ink,
                }}
              >
                {sp.name}
              </div>
              <div
                style={{
                  fontFamily: F.display,
                  fontStyle: "italic",
                  fontSize: 12,
                  color: C.inkSoft,
                  marginBottom: 10,
                }}
              >
                Affinity · {sp.region}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SmallCaps size={9} tracking={2} color={C.inkSoft}>
                  HP
                </SmallCaps>
                <div style={{ flex: 1 }}>
                  <InkBar pct={70 + Math.random() * 25} />
                </div>
                <span style={{ fontFamily: F.display, fontSize: 14 }}>
                  {Math.floor(70 + Math.random() * 25)}/100
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Center: Dispatch text */}
        <div
          style={{
            border: `2px solid ${C.ink}`,
            background: "#fbf6e8",
            padding: "28px 26px 32px",
            position: "relative",
            boxShadow: `8px 8px 0 ${C.stone}`,
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontFamily: F.display,
              fontStyle: "italic",
              fontSize: 12,
              letterSpacing: 4,
              color: C.goldDeep,
            }}
          >
            ✦ ROUND IV ✦
          </div>
          <Rule mt={10} mb={14} />

          <div style={{ textAlign: "center" }}>
            <SmallCaps color={C.oxblood} tracking={5}>
              The Adversary
            </SmallCaps>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 96,
                lineHeight: 1,
                color: C.ink,
                margin: "10px 0",
                textShadow: `4px 4px 0 ${C.stone}`,
              }}
            >
              {MONSTER.sigil}
            </div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 28,
                fontWeight: 500,
              }}
            >
              {MONSTER.name}
            </div>
            <div
              style={{
                fontFamily: F.display,
                fontStyle: "italic",
                fontSize: 13,
                color: C.inkSoft,
              }}
            >
              {MONSTER.region} · Threat: {MONSTER.threat}
            </div>

            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: F.body,
                  fontSize: 10,
                  letterSpacing: 2,
                  color: C.inkSoft,
                  marginBottom: 4,
                }}
              >
                <span>VITALITY</span>
                <span>
                  {MONSTER.hp} / {MONSTER.maxHp}
                </span>
              </div>
              <InkBar pct={MONSTER.hp} max={MONSTER.maxHp} height={10} />
            </div>
          </div>

          <Rule ornament mt={22} mb={18} />

          <div
            style={{
              fontFamily: F.body,
              fontSize: 14.5,
              lineHeight: 1.7,
              color: C.inkSoft,
              fontStyle: "normal",
              textAlign: "justify",
            }}
          >
            <span
              style={{
                float: "left",
                fontFamily: F.display,
                fontSize: 56,
                lineHeight: 0.78,
                marginRight: 8,
                marginTop: 4,
                color: C.oxblood,
                fontWeight: 600,
              }}
            >
              A
            </span>
            t the fourth bell, Phaethon broke from the eastern lane and struck
            true — a <strong style={{ color: C.gold }}>gold roll</strong> at
            seventy-nine percent confidence (the Medley Relay being a
            historically secured event). The Hydra lost a head; two more
            sprouted, as is its custom.
          </div>

          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: C.paperDeep,
              borderLeft: `3px solid ${C.gold}`,
              fontFamily: F.display,
              fontStyle: "italic",
              fontSize: 13,
              color: C.inkSoft,
            }}
          >
            “No relay falls when the chain is true.” — coach's marginalia
          </div>
        </div>

        {/* Right: Move ledger */}
        <div>
          <SmallCaps tracking={4}>Available Strikes</SmallCaps>
          <Rule mt={6} mb={14} />
          {SPIRITS[0].moves.map((m, i) => (
            <div
              key={m.name}
              style={{
                marginBottom: 14,
                padding: "12px 14px",
                border: `1px solid ${C.rule}`,
                background: i === 1 ? "#fbf6e8" : "transparent",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {i === 1 && (
                <div
                  style={{
                    position: "absolute",
                    right: -8,
                    top: 8,
                    background: C.gold,
                    color: C.paper,
                    fontFamily: F.body,
                    fontSize: 9,
                    letterSpacing: 2,
                    padding: "3px 8px",
                  }}
                >
                  CHOSEN
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontFamily: F.display, fontSize: 17, fontWeight: 500 }}>
                  {m.name}
                </span>
                <span
                  style={{
                    fontFamily: F.display,
                    fontStyle: "italic",
                    fontSize: 13,
                    color: C.goldDeep,
                  }}
                >
                  {Math.round((m.g + m.s + m.b) * 100)}% landed
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <MedalRow g={m.g} s={m.s} b={m.b} />
              </div>
              <div
                style={{
                  fontFamily: F.body,
                  fontSize: 11,
                  fontStyle: "italic",
                  color: C.inkSoft,
                  marginTop: 8,
                }}
              >
                Sample size: {30 + i * 6} games · Modern era
              </div>
            </div>
          ))}

          <button
            style={{
              width: "100%",
              marginTop: 14,
              background: C.ink,
              color: C.paper,
              border: "none",
              padding: "14px 20px",
              fontFamily: F.body,
              fontSize: 12,
              letterSpacing: 4,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Strike →
          </button>
        </div>
      </div>

      {/* Battle log as marginalia */}
      <div style={{ marginTop: 60 }}>
        <SmallCaps tracking={5}>Field Log</SmallCaps>
        <Rule mt={4} mb={14} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px 60px",
            fontFamily: F.body,
            fontSize: 14,
            color: C.inkSoft,
          }}
        >
          {[
            ["I.", "The Hydra rises from the marble. Threat assessed: MAJOR."],
            ["II.", "Atalanta opens with the 4×400 — gold (70%). −18 vitality."],
            ["III.", "Hydra retaliates, claws Heracles for 14."],
            ["IV.", "Phaethon's Medley Relay — gold (79%). −21 vitality. Combo: RELAY CHAIN."],
            ["V.", "Atalanta marathons in. Bronze roll. −6."],
            ["VI.", "The Hydra's second head appears. Damage doubled next turn."],
          ].map(([num, txt]) => (
            <div key={num} style={{ display: "flex", gap: 14 }}>
              <span style={{ fontFamily: F.display, fontStyle: "italic", color: C.goldDeep, minWidth: 28 }}>
                {num}
              </span>
              <span>{txt}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <div style={{ background: C.paper, minHeight: "100vh", color: C.ink, fontFamily: F.body }}>
      <PanelLabel n="i." name="The Cover · Landing" />
      <LandingPanel />
      <PanelLabel n="ii." name="The Theaters · Region & Roster" />
      <RegionPanel />
      <PanelLabel n="iii." name="The Engagement · Combat" />
      <BattlePanel />
      <footer
        style={{
          background: C.ink,
          color: C.stone,
          padding: "24px 40px",
          fontFamily: F.body,
          fontSize: 11,
          letterSpacing: 3,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>OLYMPUS RISING · MOCKUP A · MARBLE & GOLD</span>
        <span style={{ fontStyle: "italic", fontFamily: F.display, fontSize: 13 }}>
          Editorial Mythos
        </span>
        <span>FINIS</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
