import React from "react";
import { createRoot } from "react-dom/client";

// ============================================================================
// ARCADE HELLAS — Neon CRT Pantheon
// Vibe: 80s arcade fighter × synthwave × pixel-art Greek myth
// ============================================================================

const C = {
  bg: "#0a0014",
  bgDeep: "#05000a",
  panel: "#1a0033",
  magenta: "#ff2d95",
  cyan: "#22e0ff",
  chart: "#caff00",
  yellow: "#ffd400",
  red: "#ff3939",
  white: "#fbfbff",
  dim: "#7a4fb0",
};

const F = {
  hud: "'Press Start 2P', monospace",
  body: "'VT323', monospace",
};

const SPIRITS = [
  {
    name: "PHAETHON",
    title: "SUN-CHARIOT",
    sport: "SWIMMING",
    sprite: "🏊",
    color: C.cyan,
    moves: [
      { name: "100M FREESTYLE", dmg: 18, gold: 43 },
      { name: "MEDLEY RELAY", dmg: 24, gold: 79 },
      { name: "BACKSTROKE", dmg: 16, gold: 45 },
    ],
    hp: 88,
    maxHp: 100,
  },
  {
    name: "ATALANTA",
    title: "HUNTRESS",
    sport: "TRACK",
    sprite: "🏃",
    color: C.magenta,
    moves: [
      { name: "100M SPRINT", dmg: 20, gold: 51 },
      { name: "4X400 RELAY", dmg: 22, gold: 70 },
      { name: "MARATHON", dmg: 12, gold: 10 },
    ],
    hp: 65,
    maxHp: 100,
  },
  {
    name: "HERACLES",
    title: "TWELVE-LABORED",
    sport: "WRESTLING",
    sprite: "🤼",
    color: C.chart,
    moves: [
      { name: "FREESTYLE HEAVYWEIGHT", dmg: 26, gold: 32 },
      { name: "GRECO-ROMAN 97KG", dmg: 22, gold: 28 },
    ],
    hp: 92,
    maxHp: 100,
  },
];

const MONSTER = {
  name: "HYDRA OF CAPITOLIA",
  sprite: "🐍",
  hp: 64,
  maxHp: 100,
  threat: "BOSS",
};

// ─── CRT shell ──────────────────────────────────────────────────────────────

function Scanlines() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.0) 0 2px, rgba(0,0,0,0.35) 2px 3px)",
        zIndex: 5,
      }}
    />
  );
}

function CRTGlow() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        zIndex: 4,
      }}
    />
  );
}

function Glow({ children, color = C.cyan, size = 14 }) {
  return (
    <span
      style={{
        color,
        textShadow: `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}, 0 0 4px #fff`,
      }}
    >
      {children}
    </span>
  );
}

function PixelHP({ hp, max, color = C.chart, height = 18 }) {
  const seg = 20;
  const filled = Math.round((hp / max) * seg);
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        height,
        background: "#000",
        padding: 2,
        border: `2px solid ${C.white}`,
      }}
    >
      {Array.from({ length: seg }).map((_, i) => {
        const c = i < filled ? color : "#1a0033";
        const danger = i < filled && filled <= 5 ? C.red : c;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              background: danger,
              boxShadow: i < filled ? `0 0 6px ${danger}` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function Marquee({ items }) {
  const text = items.join("    ★    ");
  return (
    <div
      style={{
        background: C.magenta,
        color: C.bg,
        padding: "8px 0",
        fontFamily: F.hud,
        fontSize: 10,
        letterSpacing: 2,
        overflow: "hidden",
        whiteSpace: "nowrap",
        position: "relative",
        borderTop: `2px solid ${C.cyan}`,
        borderBottom: `2px solid ${C.cyan}`,
      }}
    >
      <div style={{ display: "inline-block", animation: "scroll 22s linear infinite" }}>
        {text} ★ {text}
      </div>
      <style>{`@keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes blink { 50% { opacity: 0.2 } }
@keyframes pulse { 50% { transform: scale(1.05) } }
@keyframes flicker { 0%,99% { opacity: 1 } 50% { opacity: 0.92 } }`}</style>
    </div>
  );
}

// ─── 1. LANDING (TITLE / ATTRACT MODE) ──────────────────────────────────────

function LandingPanel() {
  return (
    <section
      style={{
        background: `linear-gradient(180deg, ${C.bgDeep} 0%, #1a0033 50%, ${C.bgDeep} 100%)`,
        position: "relative",
        padding: "60px 40px 80px",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Synthwave grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 240,
          background: `
            linear-gradient(180deg, transparent 0%, ${C.magenta} 100%),
            repeating-linear-gradient(90deg, ${C.cyan}33 0 1px, transparent 1px 60px),
            repeating-linear-gradient(0deg, ${C.cyan}33 0 1px, transparent 1px 30px)
          `,
          backgroundBlendMode: "multiply",
          transform: "perspective(400px) rotateX(50deg)",
          transformOrigin: "center bottom",
          opacity: 0.4,
        }}
      />
      {/* Sun */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: 240,
          transform: "translateX(-50%)",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `linear-gradient(180deg, ${C.yellow} 0%, ${C.magenta} 100%)`,
          boxShadow: `0 0 80px ${C.magenta}, 0 0 160px ${C.magenta}66`,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: 460,
          transform: "translateX(-50%)",
          width: 320,
          height: 50,
          background: C.bgDeep,
          backgroundImage: `repeating-linear-gradient(180deg, transparent 0 4px, ${C.bgDeep} 4px 14px)`,
          maskImage: `linear-gradient(180deg, transparent, black, transparent)`,
        }}
      />

      <Scanlines />
      <CRTGlow />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
        <div
          style={{
            fontFamily: F.hud,
            fontSize: 11,
            letterSpacing: 4,
            color: C.cyan,
            animation: "blink 1.4s infinite",
          }}
        >
          ▶ INSERT COIN TO CONTINUE
        </div>

        <div style={{ marginTop: 80 }}>
          <h1
            style={{
              fontFamily: F.hud,
              fontSize: 88,
              lineHeight: 1.05,
              margin: 0,
              color: C.white,
              textShadow: `
                4px 4px 0 ${C.magenta},
                8px 8px 0 ${C.cyan},
                0 0 28px ${C.magenta}
              `,
              letterSpacing: 6,
              animation: "flicker 6s infinite",
            }}
          >
            OLYMPUS
          </h1>
          <h1
            style={{
              fontFamily: F.hud,
              fontSize: 72,
              lineHeight: 1.05,
              margin: "8px 0 0",
              color: C.yellow,
              textShadow: `
                3px 3px 0 ${C.red},
                6px 6px 0 ${C.magenta},
                0 0 22px ${C.yellow}
              `,
              letterSpacing: 6,
            }}
          >
            RISING
          </h1>

          <div
            style={{
              fontFamily: F.body,
              fontSize: 28,
              color: C.cyan,
              marginTop: 24,
              letterSpacing: 4,
              textShadow: `0 0 10px ${C.cyan}`,
            }}
          >
            ★ A 1-3 PLAYER MYTH-BRAWLER ★
          </div>

          <div
            style={{
              fontFamily: F.body,
              fontSize: 22,
              color: C.white,
              marginTop: 12,
              opacity: 0.85,
            }}
          >
            POWERED BY 128 YEARS OF REAL OLYMPIC DATA
          </div>

          <div style={{ marginTop: 48, display: "inline-flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
            <ArcadeButton color={C.magenta}>★ START GAME</ArcadeButton>
            <ArcadeButton color={C.cyan}>SCOUT SPIRITS</ArcadeButton>
            <ArcadeButton color={C.chart}>HOW TO PLAY</ArcadeButton>
          </div>
        </div>

        {/* Stats blocks */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            marginTop: 80,
            flexWrap: "wrap",
            position: "relative",
            zIndex: 10,
          }}
        >
          {[
            { n: "1184", l: "GOLDS", c: C.yellow },
            { n: "137", l: "MOVES", c: C.cyan },
            { n: "8", l: "REGIONS", c: C.magenta },
            { n: "∞", l: "MONSTERS", c: C.chart },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                fontFamily: F.hud,
                background: "rgba(0,0,0,0.5)",
                border: `2px solid ${s.c}`,
                padding: "14px 22px",
                boxShadow: `0 0 22px ${s.c}55, inset 0 0 12px ${s.c}33`,
              }}
            >
              <div style={{ fontSize: 28, color: s.c, textShadow: `0 0 12px ${s.c}` }}>
                {s.n}
              </div>
              <div style={{ fontSize: 8, color: C.white, marginTop: 6, letterSpacing: 3 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: F.hud,
          fontSize: 8,
          color: C.dim,
          letterSpacing: 3,
          zIndex: 10,
        }}
      >
        © MMXXVI HEPHAESTUS COIN-OP · 2 PLAY 50¢ · NO REFUNDS, NO MERCY
      </div>
    </section>
  );
}

function ArcadeButton({ children, color = C.magenta }) {
  return (
    <button
      style={{
        fontFamily: F.hud,
        fontSize: 12,
        padding: "16px 24px",
        background: "transparent",
        color: C.white,
        border: `3px solid ${color}`,
        boxShadow: `0 0 16px ${color}, inset 0 0 16px ${color}44, 4px 4px 0 ${color}`,
        cursor: "pointer",
        letterSpacing: 3,
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
}

// ─── 2. REGION + SCOUT (OVERWORLD MAP) ──────────────────────────────────────

function RegionPanel() {
  return (
    <section
      style={{
        background: C.bg,
        padding: "60px 40px 80px",
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <Scanlines />

      <div style={{ position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: F.hud, fontSize: 9, letterSpacing: 4, color: C.cyan }}>
            ★ STAGE SELECT ★
          </div>
          <h2
            style={{
              fontFamily: F.hud,
              fontSize: 36,
              color: C.yellow,
              textShadow: `3px 3px 0 ${C.magenta}, 0 0 18px ${C.yellow}`,
              letterSpacing: 4,
              margin: "12px 0 4px",
            }}
          >
            CHOOSE YOUR FRONT
          </h2>
          <div style={{ fontFamily: F.body, fontSize: 22, color: C.white }}>
            <Glow color={C.cyan}>8 STAGES</Glow> ·{" "}
            <Glow color={C.magenta}>3 CHAMPIONS</Glow> · NO CONTINUES
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36 }}>
          {/* PIXEL OVERWORLD */}
          <div
            style={{
              background: "#000",
              border: `4px solid ${C.cyan}`,
              boxShadow: `0 0 28px ${C.cyan}, inset 0 0 28px ${C.magenta}33`,
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: F.hud,
                fontSize: 9,
                color: C.chart,
                marginBottom: 12,
                letterSpacing: 2,
              }}
            >
              <span>WORLD 1-1</span>
              <Glow color={C.yellow} size={6}>
                <span style={{ animation: "blink 1s infinite" }}>● LIVE</span>
              </Glow>
              <span>HISCORE: 999900</span>
            </div>
            <PixelMap />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 14,
                fontFamily: F.hud,
                fontSize: 8,
                color: C.dim,
                letterSpacing: 2,
              }}
            >
              <span>← →  MOVE</span>
              <span>SPACE  CONFIRM</span>
              <span>ESC  RETREAT</span>
            </div>
          </div>

          {/* SPIRIT SELECT */}
          <div>
            <div
              style={{
                fontFamily: F.hud,
                fontSize: 11,
                color: C.yellow,
                letterSpacing: 3,
                marginBottom: 14,
                textShadow: `0 0 8px ${C.yellow}`,
              }}
            >
              ★ PICK YOUR FIGHTER ★
            </div>

            {SPIRITS.map((sp, i) => (
              <div
                key={sp.name}
                style={{
                  background: i === 0 ? "rgba(34,224,255,0.12)" : "rgba(255,255,255,0.04)",
                  border: `3px solid ${i === 0 ? C.yellow : sp.color}`,
                  padding: 14,
                  marginBottom: 14,
                  display: "grid",
                  gridTemplateColumns: "70px 1fr auto",
                  gap: 16,
                  alignItems: "center",
                  position: "relative",
                  boxShadow: i === 0 ? `0 0 22px ${C.yellow}88, 6px 6px 0 ${C.magenta}` : `4px 4px 0 ${sp.color}33`,
                }}
              >
                {i === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -16,
                      left: 12,
                      background: C.yellow,
                      color: C.bg,
                      fontFamily: F.hud,
                      fontSize: 8,
                      letterSpacing: 2,
                      padding: "5px 10px",
                      animation: "blink 1s infinite",
                    }}
                  >
                    ▶ P1 SELECTED
                  </div>
                )}
                <div
                  style={{
                    width: 70,
                    height: 70,
                    background: `${sp.color}22`,
                    border: `2px solid ${sp.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    boxShadow: `inset 0 0 18px ${sp.color}55`,
                  }}
                >
                  {sp.sprite}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: F.hud,
                      fontSize: 14,
                      color: sp.color,
                      letterSpacing: 2,
                      textShadow: `0 0 8px ${sp.color}`,
                    }}
                  >
                    {sp.name}
                  </div>
                  <div
                    style={{
                      fontFamily: F.body,
                      fontSize: 18,
                      color: C.white,
                      lineHeight: 1,
                    }}
                  >
                    {sp.title} · {sp.sport}
                  </div>
                  <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                    {sp.moves.slice(0, 3).map((m) => (
                      <span
                        key={m.name}
                        style={{
                          fontFamily: F.hud,
                          fontSize: 7,
                          color: C.bg,
                          background: m.gold > 50 ? C.chart : m.gold > 30 ? C.cyan : C.dim,
                          padding: "3px 6px",
                          letterSpacing: 1,
                        }}
                      >
                        {m.gold}%
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: F.hud,
                      fontSize: 22,
                      color: sp.color,
                      textShadow: `0 0 10px ${sp.color}`,
                    }}
                  >
                    {sp.maxHp}
                  </div>
                  <div style={{ fontFamily: F.hud, fontSize: 7, color: C.white, letterSpacing: 2 }}>
                    HP
                  </div>
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: 18,
                background: "#000",
                border: `2px solid ${C.magenta}`,
                padding: 14,
                fontFamily: F.body,
                fontSize: 18,
                color: C.white,
                lineHeight: 1.4,
                boxShadow: `0 0 18px ${C.magenta}55`,
              }}
            >
              <Glow color={C.magenta} size={6}>
                ❯ READY UP
              </Glow>
              <div style={{ marginTop: 4, fontSize: 16, color: C.cyan }}>
                Stage selected: <Glow color={C.yellow} size={6}>THE CAPITAL</Glow>
              </div>
              <div style={{ marginTop: 4, fontSize: 14, color: C.dim }}>
                BOSS: HYDRA OF CAPITOLIA · 100 HP · x9 PHASES
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PixelMap() {
  // 24x10 grid pixel overworld
  const W = 24;
  const H = 10;
  const cell = 18;

  const tiles = {
    grass: C.chart,
    water: C.cyan,
    desert: C.yellow,
    rock: C.dim,
    road: "#5a3a8a",
    capital: C.magenta,
  };

  // Crude USA-like map
  const map = [
    "rrrrrrrrrrrrrrrrrrrrrrrr",
    "rwwwwggggggggggggrrrrrrr",
    "rwwwwgggggggggrrrrrrrrrr",
    "rrwwgggggggrrrrrrrrgrrrr",
    "rrrwgggggrrrrrCgrgggrrrr",
    "rrrrgggggrrrrgrrrgggggrr",
    "rrrrgggggdddddrrrrgggggr",
    "rrrrgggddddddddrrgggggrr",
    "rrrrrgddddddddrrgggrrrrr",
    "rrrrrrrdddddddrrrrrrrrrr",
  ];

  const monsterAt = {
    "4-13": "🐍",
    "1-7": "🌊",
    "5-15": "🔥",
    "3-19": "⚓",
    "8-9": "🏔",
    "6-12": "♔",
  };
  const partyAt = "2-5";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${W}, ${cell}px)`,
        gridTemplateRows: `repeat(${H}, ${cell}px)`,
        gap: 0,
        margin: "0 auto",
        width: W * cell,
        imageRendering: "pixelated",
      }}
    >
      {map.flatMap((row, y) =>
        row.split("").map((ch, x) => {
          const key = `${y}-${x}`;
          const c =
            ch === "g"
              ? tiles.grass
              : ch === "w"
              ? tiles.water
              : ch === "d"
              ? tiles.desert
              : ch === "r"
              ? tiles.rock
              : ch === "C"
              ? tiles.capital
              : "#000";
          const isParty = key === partyAt;
          const monster = monsterAt[key];
          return (
            <div
              key={key}
              style={{
                background: c,
                position: "relative",
                boxShadow: `inset -1px -1px 0 rgba(0,0,0,0.4), inset 1px 1px 0 rgba(255,255,255,0.18)`,
                fontSize: 14,
                lineHeight: `${cell}px`,
                textAlign: "center",
              }}
            >
              {monster && (
                <span
                  style={{
                    fontSize: ch === "C" ? 20 : 14,
                    filter: ch === "C" ? `drop-shadow(0 0 6px ${C.yellow})` : "none",
                    animation: ch === "C" ? "pulse 1.4s infinite" : "none",
                    display: "inline-block",
                  }}
                >
                  {monster}
                </span>
              )}
              {isParty && (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    fontSize: 16,
                    animation: "blink 0.7s infinite",
                  }}
                >
                  ★
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── 3. BATTLE (FIGHTER UI) ─────────────────────────────────────────────────

function BattlePanel() {
  const p1 = SPIRITS[0];
  return (
    <section
      style={{
        background: `linear-gradient(180deg, #2a0044 0%, #1a0033 50%, #000 100%)`,
        padding: "30px 40px 60px",
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(0deg, ${C.cyan}11 0 1px, transparent 1px 40px),
            repeating-linear-gradient(90deg, ${C.cyan}11 0 1px, transparent 1px 40px)
          `,
        }}
      />
      <Scanlines />

      <div style={{ position: "relative", zIndex: 10 }}>
        {/* TOP HUD: HP bars + names + portraits */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 18, marginBottom: 30 }}>
          {/* Player side */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span
                style={{
                  fontFamily: F.hud,
                  fontSize: 14,
                  color: p1.color,
                  textShadow: `0 0 8px ${p1.color}`,
                  letterSpacing: 2,
                }}
              >
                P1 · {p1.name}
              </span>
              <span style={{ fontFamily: F.hud, fontSize: 11, color: C.white }}>
                {p1.hp}/{p1.maxHp}
              </span>
            </div>
            <PixelHP hp={p1.hp} max={p1.maxHp} color={C.chart} height={22} />
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {SPIRITS.map((s) => (
                <div
                  key={s.name}
                  style={{
                    flex: 1,
                    background: "rgba(0,0,0,0.55)",
                    border: `2px solid ${s.color}`,
                    padding: 6,
                    boxShadow: `0 0 8px ${s.color}66`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: F.hud,
                      fontSize: 8,
                      letterSpacing: 1.5,
                      color: s.color,
                    }}
                  >
                    {s.name}
                  </div>
                  <PixelHP hp={s.hp} max={s.maxHp} color={s.color} height={8} />
                </div>
              ))}
            </div>
          </div>

          {/* CENTER: VS / ROUND */}
          <div style={{ textAlign: "center", padding: "0 18px" }}>
            <div
              style={{
                fontFamily: F.hud,
                fontSize: 10,
                color: C.cyan,
                letterSpacing: 4,
                marginBottom: 4,
              }}
            >
              ROUND 4
            </div>
            <div
              style={{
                fontFamily: F.hud,
                fontSize: 44,
                color: C.yellow,
                textShadow: `4px 4px 0 ${C.red}, 0 0 22px ${C.yellow}`,
                animation: "pulse 1.6s infinite",
              }}
            >
              VS
            </div>
            <div
              style={{
                fontFamily: F.hud,
                fontSize: 9,
                color: C.magenta,
                letterSpacing: 3,
                marginTop: 6,
                animation: "blink 0.8s infinite",
              }}
            >
              FIGHT!
            </div>
          </div>

          {/* Boss side */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: F.hud, fontSize: 11, color: C.white }}>
                {MONSTER.hp}/{MONSTER.maxHp}
              </span>
              <span
                style={{
                  fontFamily: F.hud,
                  fontSize: 14,
                  color: C.red,
                  textShadow: `0 0 8px ${C.red}`,
                  letterSpacing: 2,
                }}
              >
                {MONSTER.name} · {MONSTER.threat}
              </span>
            </div>
            <PixelHP hp={MONSTER.hp} max={MONSTER.maxHp} color={C.red} height={22} />
            <div
              style={{
                marginTop: 10,
                background: "rgba(255,57,57,0.1)",
                border: `2px solid ${C.red}`,
                padding: "8px 12px",
                fontFamily: F.body,
                fontSize: 16,
                color: C.white,
              }}
            >
              <Glow color={C.red} size={6}>
                ⚠ BOSS ABILITY:
              </Glow>{" "}
              <span style={{ color: C.yellow }}>HYDRA REGEN</span> · regrows 2 heads next turn
            </div>
          </div>
        </div>

        {/* CENTER STAGE: portraits */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
            marginBottom: 26,
          }}
        >
          <div
            style={{
              background: `radial-gradient(circle, ${C.cyan}44 0%, transparent 70%)`,
              padding: 18,
              textAlign: "center",
              borderRight: `2px dashed ${C.yellow}`,
            }}
          >
            <div
              style={{
                fontSize: 220,
                lineHeight: 1,
                filter: `drop-shadow(0 0 18px ${p1.color}) drop-shadow(0 8px 4px rgba(0,0,0,0.6))`,
                animation: "pulse 1.4s infinite",
              }}
            >
              {p1.sprite}
            </div>
            <div
              style={{
                position: "relative",
                top: -28,
                fontFamily: F.hud,
                fontSize: 18,
                color: C.yellow,
                textShadow: `3px 3px 0 ${C.red}, 0 0 18px ${C.yellow}`,
                letterSpacing: 4,
                animation: "pulse 0.6s infinite",
              }}
            >
              SUPER!
            </div>
            <div
              style={{
                fontFamily: F.hud,
                fontSize: 11,
                color: C.chart,
                letterSpacing: 3,
                marginTop: -4,
              }}
            >
              MEDLEY RELAY · 79% GOLD
            </div>
          </div>

          <div
            style={{
              background: `radial-gradient(circle, ${C.red}44 0%, transparent 70%)`,
              padding: 18,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 220,
                lineHeight: 1,
                filter: `drop-shadow(0 0 18px ${C.red}) hue-rotate(0deg)`,
                animation: "pulse 2s infinite",
              }}
            >
              {MONSTER.sprite}
            </div>
            <div
              style={{
                fontFamily: F.hud,
                fontSize: 14,
                color: C.red,
                letterSpacing: 4,
                textShadow: `0 0 12px ${C.red}`,
                marginTop: -6,
              }}
            >
              -21 HP
            </div>
            <div
              style={{
                fontFamily: F.hud,
                fontSize: 9,
                color: C.white,
                letterSpacing: 2,
                marginTop: 6,
                opacity: 0.7,
              }}
            >
              CRITICAL HIT! ★ COMBO x3
            </div>
          </div>
        </div>

        {/* BOTTOM HUD: moves + log */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 18 }}>
          <div
            style={{
              background: "#000",
              border: `3px solid ${C.cyan}`,
              padding: 14,
              boxShadow: `0 0 18px ${C.cyan}55`,
            }}
          >
            <div
              style={{
                fontFamily: F.hud,
                fontSize: 9,
                color: C.cyan,
                letterSpacing: 3,
                marginBottom: 12,
              }}
            >
              ★ SELECT MOVE ★
            </div>
            {p1.moves.map((m, i) => (
              <div
                key={m.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "30px 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  padding: "10px 8px",
                  marginBottom: 6,
                  background: i === 1 ? `${C.yellow}22` : "transparent",
                  border: `2px solid ${i === 1 ? C.yellow : "transparent"}`,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontFamily: F.hud,
                    fontSize: 10,
                    color: C.bg,
                    background: C.chart,
                    width: 26,
                    height: 26,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontFamily: F.hud, fontSize: 11, color: C.white, letterSpacing: 1 }}>
                    {m.name}
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: 16, color: C.dim, marginTop: 2 }}>
                    DMG {m.dmg} · GOLD {m.gold}%
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: F.hud,
                    fontSize: 12,
                    color: m.gold > 50 ? C.chart : C.cyan,
                    textShadow: `0 0 6px currentColor`,
                  }}
                >
                  {i === 1 ? "▶" : ""}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#000",
              border: `3px solid ${C.magenta}`,
              padding: 14,
              boxShadow: `0 0 18px ${C.magenta}55`,
              fontFamily: F.body,
              fontSize: 18,
              color: C.white,
              lineHeight: 1.35,
            }}
          >
            <div
              style={{
                fontFamily: F.hud,
                fontSize: 9,
                color: C.magenta,
                letterSpacing: 3,
                marginBottom: 10,
              }}
            >
              ★ BATTLE LOG ★
            </div>
            {[
              ["[T1]", C.cyan, "★ THE HYDRA APPEARS! BOSS THEME PLAYS."],
              ["[T2]", C.chart, "ATALANTA → 4×400 RELAY → ", { c: C.yellow, t: "GOLD! (70%) -18 HP" }],
              ["[T2]", C.red, "HYDRA bites HERACLES for -14 HP"],
              ["[T3]", C.chart, "PHAETHON → 100M FREESTYLE → ", { c: C.cyan, t: "SILVER (16%) -8 HP" }],
              ["[T4]", C.yellow, "PHAETHON → MEDLEY RELAY → ", { c: C.yellow, t: "★ SUPER! GOLD! -21 HP" }],
              ["[T4]", C.magenta, "★ COMBO ACTIVATED: RELAY CHAIN x3 ★"],
              ["[T4]", C.red, "HYDRA REGEN charging…"],
            ].map(([tag, color, txt, glow], i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <span style={{ color, fontFamily: F.hud, fontSize: 9, letterSpacing: 1 }}>
                  {tag}
                </span>{" "}
                <span style={{ color: C.white }}>
                  {txt}
                  {glow && (
                    <Glow color={glow.c} size={6}>
                      {glow.t}
                    </Glow>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Combo / score footer */}
        <div
          style={{
            marginTop: 22,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: F.hud,
            fontSize: 12,
            color: C.white,
            letterSpacing: 3,
          }}
        >
          <span>
            <Glow color={C.yellow} size={6}>
              SCORE
            </Glow>{" "}
            00104250
          </span>
          <span>
            <Glow color={C.magenta} size={6}>
              COMBO x3
            </Glow>
          </span>
          <span>
            <Glow color={C.cyan} size={6}>
              TIME
            </Glow>{" "}
            01:42
          </span>
          <span>
            <Glow color={C.red} size={6}>
              CONTINUES
            </Glow>{" "}
            2
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────

function PanelLabel({ n, name }) {
  return (
    <div
      style={{
        background: "#000",
        borderTop: `4px solid ${C.cyan}`,
        borderBottom: `4px solid ${C.magenta}`,
        padding: "12px 40px",
        fontFamily: F.hud,
        fontSize: 11,
        letterSpacing: 4,
        display: "flex",
        gap: 18,
        alignItems: "center",
      }}
    >
      <span style={{ color: C.yellow, fontSize: 22 }}>★</span>
      <Glow color={C.cyan} size={8}>
        STAGE {n}
      </Glow>
      <span style={{ color: C.white }}>·</span>
      <Glow color={C.magenta} size={8}>
        {name}
      </Glow>
      <span style={{ flex: 1 }} />
      <span style={{ color: C.dim, fontSize: 8 }}>MOCKUP B / NEON CRT</span>
    </div>
  );
}

function App() {
  return (
    <div
      style={{
        background: C.bg,
        color: C.white,
        fontFamily: F.body,
        minHeight: "100vh",
      }}
    >
      <Marquee
        items={[
          "INSERT COIN",
          "1-3 PLAYERS",
          "REAL OLYMPIC DATA",
          "8 STAGES OF MYTHIC FURY",
          "BEAT THE HYDRA",
          "GO FOR GOLD",
        ]}
      />
      <PanelLabel n="1-1" name="ATTRACT MODE / TITLE" />
      <LandingPanel />
      <PanelLabel n="1-2" name="STAGE SELECT / FIGHTER PICK" />
      <RegionPanel />
      <PanelLabel n="1-3" name="ROUND FOUR / FIGHT!" />
      <BattlePanel />
      <Marquee items={["GAME OVER?", "PRESS START", "© MMXXVI HEPHAESTUS COIN-OP"]} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
