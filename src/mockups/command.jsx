import React from "react";
import { createRoot } from "react-dom/client";

// ============================================================================
// OLYMPUS COMMAND — Tactical Data Dashboard
// Vibe: Bloomberg Terminal × NORAD common-operating-picture × launch control
// ============================================================================

const C = {
  bg: "#0b1220",
  panel: "#111a2e",
  panelHi: "#172240",
  border: "#243559",
  borderHi: "#3a5391",
  grid: "#1c2a4a",
  text: "#cfdaf2",
  textDim: "#7e8aa6",
  textFaint: "#3f4a66",
  amber: "#ffb000",
  green: "#3aff7a",
  red: "#ff3b3b",
  cyan: "#56c2ff",
  violet: "#a78bfa",
  white: "#fff",
};

const F = {
  mono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
  ui: "'Inter', system-ui, sans-serif",
};

const SPIRITS = [
  {
    code: "PHA-01",
    name: "PHAETHON",
    sport: "SWIMMING",
    affinity: "PAC",
    hp: 88,
    moves: [
      { id: "SW-FRE-100", name: "100m Freestyle", g: 0.43, s: 0.16, b: 0.16, n: 51 },
      { id: "SW-MED-4X1", name: "4×100 Medley Relay", g: 0.79, s: 0.18, b: 0.0, n: 34 },
      { id: "SW-BCK-200", name: "200m Backstroke", g: 0.45, s: 0.24, b: 0.0, n: 29 },
    ],
  },
  {
    code: "ATA-02",
    name: "ATALANTA",
    sport: "TRACK & FIELD",
    affinity: "PLN",
    hp: 65,
    moves: [
      { id: "TF-100M", name: "100m Sprint", g: 0.51, s: 0.2, b: 0.08, n: 51 },
      { id: "TF-4X4", name: "4×400m Relay", g: 0.7, s: 0.2, b: 0.03, n: 40 },
      { id: "TF-MAR", name: "Marathon", g: 0.1, s: 0.05, b: 0.12, n: 40 },
    ],
  },
  {
    code: "HER-03",
    name: "HERACLES",
    sport: "WRESTLING",
    affinity: "HRT",
    hp: 92,
    moves: [
      { id: "WR-FRE-HVY", name: "Freestyle Heavyweight", g: 0.32, s: 0.18, b: 0.22, n: 28 },
      { id: "WR-GR-097", name: "Greco-Roman 97kg", g: 0.28, s: 0.12, b: 0.18, n: 24 },
    ],
  },
];

const MONSTER = {
  code: "HX-CAP-09",
  name: "HYDRA OF CAPITOLIA",
  threat: "MAJOR",
  hp: 64,
  maxHp: 100,
  region: "CAP",
  abilities: ["Multi-strike (×2)", "Regen (+8/turn)"],
};

// ─── Atomic UI ──────────────────────────────────────────────────────────────

function Mono({ children, color = C.text, size = 12, bold = false, tracking = 0 }) {
  return (
    <span
      style={{
        fontFamily: F.mono,
        color,
        fontSize: size,
        fontWeight: bold ? 600 : 400,
        letterSpacing: tracking,
      }}
    >
      {children}
    </span>
  );
}

function Panel({ title, status, children, style = {}, headerRight = null }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <div
        style={{
          background: C.panelHi,
          borderBottom: `1px solid ${C.border}`,
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: F.mono,
          fontSize: 10,
          letterSpacing: 1.2,
        }}
      >
        <span style={{ color: C.cyan }}>▸</span>
        <span style={{ color: C.text, fontWeight: 600, textTransform: "uppercase" }}>
          {title}
        </span>
        {status && (
          <span
            style={{
              color: status.includes("LIVE") ? C.green : C.amber,
              animation: status.includes("LIVE") ? "blink 1.4s infinite" : "none",
            }}
          >
            ● {status}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {headerRight}
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0.45 } }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
@keyframes sweep { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function StatusPill({ label, color, blink = false }) {
  return (
    <span
      style={{
        fontFamily: F.mono,
        fontSize: 9,
        letterSpacing: 1,
        color,
        border: `1px solid ${color}`,
        padding: "2px 6px",
        animation: blink ? "blink 1.6s infinite" : "none",
      }}
    >
      ● {label}
    </span>
  );
}

function HBar({ pct, color = C.green, height = 8, max = 100, segments = false }) {
  const w = Math.max(0, Math.min(100, (pct / max) * 100));
  if (segments) {
    return (
      <div style={{ display: "flex", gap: 1, height }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const filled = i < Math.round(w / 5);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: filled ? color : C.grid,
                borderRight: `1px solid ${C.bg}`,
              }}
            />
          );
        })}
      </div>
    );
  }
  return (
    <div
      style={{
        width: "100%",
        height,
        background: C.grid,
        position: "relative",
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          width: `${w}%`,
          height: "100%",
          background: color,
          boxShadow: `0 0 6px ${color}66`,
        }}
      />
    </div>
  );
}

function Sparkline({ data, color = C.cyan, w = 100, h = 24 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const r = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / r) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline fill="none" stroke={color} strokeWidth="1.4" points={pts} />
      <polyline
        fill={`${color}22`}
        stroke="none"
        points={`0,${h} ${pts} ${w},${h}`}
      />
    </svg>
  );
}

function Crosshair() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        position: "relative",
        marginRight: 4,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 4,
          top: 0,
          bottom: 0,
          width: 1,
          background: C.amber,
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 4,
          left: 0,
          right: 0,
          height: 1,
          background: C.amber,
        }}
      />
    </span>
  );
}

// ─── TOP COMMAND BAR ────────────────────────────────────────────────────────

function CommandBar() {
  const time = "14:02:11Z";
  return (
    <div
      style={{
        background: "#070d18",
        borderBottom: `1px solid ${C.borderHi}`,
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontFamily: F.mono,
        fontSize: 11,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: C.amber,
            boxShadow: `0 0 8px ${C.amber}`,
          }}
        />
        <Mono color={C.amber} bold>
          OLYMPUS://COMMAND
        </Mono>
        <Mono color={C.textDim} size={10}>
          v0.9.4 — TACTICAL OVERWATCH
        </Mono>
      </span>

      <span style={{ flex: 1 }} />

      <span style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <Mono color={C.textDim} size={10}>
          THEATER
        </Mono>
        <Mono color={C.cyan} bold>
          USA-CONUS
        </Mono>
        <span style={{ color: C.borderHi }}>│</span>
        <Mono color={C.textDim} size={10}>
          OPNAME
        </Mono>
        <Mono color={C.amber} bold>
          OLYMPUS_RISING
        </Mono>
        <span style={{ color: C.borderHi }}>│</span>
        <Mono color={C.textDim} size={10}>
          DTG
        </Mono>
        <Mono color={C.green} bold>
          071402Z MAY 26
        </Mono>
        <span style={{ color: C.borderHi }}>│</span>
        <StatusPill label="DEFCON 3" color={C.amber} blink />
      </span>
    </div>
  );
}

// ─── 1. LANDING — MISSION BRIEFING DASHBOARD ────────────────────────────────

function LandingPanel() {
  return (
    <section style={{ padding: 14, background: C.bg }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* HERO BRIEFING */}
        <Panel title="01 · MISSION BRIEFING" status="LIVE">
          <div style={{ padding: 22 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
              <Mono color={C.amber} size={11} tracking={3}>
                OPERATION
              </Mono>
              <Mono color={C.text} size={11}>
                CLASSIFICATION: UNCLASSIFIED // FOUO
              </Mono>
            </div>
            <h1
              style={{
                fontFamily: F.mono,
                fontSize: 64,
                fontWeight: 700,
                color: C.text,
                margin: "12px 0 0",
                letterSpacing: -1,
                lineHeight: 1.02,
              }}
            >
              OLYMPUS
              <br />
              <span style={{ color: C.amber }}>RISING</span>
              <span style={{ color: C.textFaint, fontSize: 36, marginLeft: 14 }}>v.0.9.4</span>
            </h1>
            <div style={{ marginTop: 18, fontFamily: F.ui, fontSize: 14, color: C.textDim, maxWidth: 540, lineHeight: 1.55 }}>
              Probabilistic combat operations system, calibrated against{" "}
              <span style={{ color: C.text }}>26,859 historical Team USA results</span> across{" "}
              <span style={{ color: C.text }}>137 event-level engagement profiles</span>. Each strike resolves as
              a real-time roll against archival medal rates; outcomes are streamed to this terminal.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 28 }}>
              {[
                { v: "1,184", l: "GOLD", c: C.amber },
                { v: "963", l: "SILVER", c: C.cyan },
                { v: "834", l: "BRONZE", c: C.violet },
                { v: "8/8", l: "FRONTS ACTIVE", c: C.green },
              ].map((s) => (
                <div
                  key={s.l}
                  style={{
                    border: `1px solid ${C.border}`,
                    background: C.bg,
                    padding: "10px 12px",
                  }}
                >
                  <Mono color={C.textDim} size={9} tracking={2}>
                    {s.l}
                  </Mono>
                  <div
                    style={{
                      fontFamily: F.mono,
                      color: s.c,
                      fontSize: 28,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    {s.v}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <CmdBtn primary>[ENTER]  ENGAGE</CmdBtn>
              <CmdBtn>[F2]  SCOUT ROSTER</CmdBtn>
              <CmdBtn>[F3]  ARCHIVE</CmdBtn>
              <CmdBtn>[F4]  TRAINING SIM</CmdBtn>
            </div>
          </div>
        </Panel>

        {/* SYSTEM STATUS */}
        <Panel title="02 · SYSTEM STATUS" status="NOMINAL">
          <div style={{ padding: 12, fontFamily: F.mono, fontSize: 11 }}>
            {[
              ["DATA FEED", "ONLINE", C.green, "26,859 records"],
              ["MEDAL_RATES.JSON", "LOADED", C.green, "137 / 137 moves"],
              ["GEMINI BRIDGE", "DEGRADED", C.amber, "rate-limited 31%"],
              ["MONTE CARLO", "READY", C.green, "1000 runs / 84ms"],
              ["MAP TILES", "LOADED", C.green, "8 regions cached"],
              ["TELEMETRY UPLINK", "OK", C.cyan, "256 ms RTT"],
            ].map(([label, st, c, det]) => (
              <div
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 70px 1fr",
                  gap: 8,
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: `1px solid ${C.grid}`,
                }}
              >
                <span style={{ color: C.textDim }}>{label}</span>
                <span style={{ color: c, fontWeight: 600 }}>{st}</span>
                <span style={{ color: C.textFaint, fontSize: 10 }}>{det}</span>
              </div>
            ))}

            <div style={{ marginTop: 18 }}>
              <Mono color={C.textDim} size={9} tracking={2}>
                CPU LOAD · LAST 60s
              </Mono>
              <Sparkline
                data={[12, 18, 15, 28, 32, 24, 19, 22, 41, 38, 27, 30, 29, 35, 44, 36]}
                color={C.cyan}
                w={280}
                h={32}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <Mono color={C.textFaint} size={9}>
                  -60s
                </Mono>
                <Mono color={C.text} size={11} bold>
                  36%
                </Mono>
                <Mono color={C.textFaint} size={9}>
                  now
                </Mono>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Mono color={C.textDim} size={9} tracking={2}>
                SUMMON QUEUE
              </Mono>
              <div style={{ marginTop: 4 }}>
                <SummonRow label="HX-CAP-09 / Hydra of Capitolia" eta="ACTIVE" c={C.red} />
                <SummonRow label="MN-ATL-04 / Wraith of the Atlantic" eta="00:42" c={C.amber} />
                <SummonRow label="MN-MTN-07 / Stoneborn Cyclops" eta="01:08" c={C.amber} />
                <SummonRow label="MN-NWA-02 / Albion Specter" eta="01:55" c={C.textDim} />
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function SummonRow({ label, eta, c }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 60px",
        gap: 10,
        padding: "4px 0",
        fontFamily: F.mono,
        fontSize: 10.5,
      }}
    >
      <span style={{ color: C.text }}>{label}</span>
      <span style={{ color: c, textAlign: "right", fontWeight: 600 }}>{eta}</span>
    </div>
  );
}

function CmdBtn({ children, primary = false }) {
  return (
    <button
      style={{
        fontFamily: F.mono,
        fontSize: 11,
        letterSpacing: 1.5,
        padding: "10px 14px",
        background: primary ? C.amber : "transparent",
        color: primary ? C.bg : C.text,
        border: `1px solid ${primary ? C.amber : C.borderHi}`,
        cursor: "pointer",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
}

// ─── 2. REGION — TACTICAL SITREP ────────────────────────────────────────────

function RegionPanel() {
  return (
    <section style={{ padding: 14, background: C.bg }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* SITREP MAP */}
        <Panel
          title="03 · CONUS SITREP"
          status="LIVE"
          headerRight={
            <span style={{ display: "flex", gap: 8 }}>
              <Mono color={C.textDim} size={9}>
                ZOOM
              </Mono>
              <Mono color={C.cyan}>1.0×</Mono>
              <Mono color={C.textDim} size={9}>
                THREATS
              </Mono>
              <Mono color={C.red}>8</Mono>
            </span>
          }
        >
          <div style={{ padding: 12 }}>
            <SitrepMap />
            <div
              style={{
                display: "flex",
                gap: 18,
                marginTop: 12,
                fontFamily: F.mono,
                fontSize: 10,
                color: C.textDim,
              }}
            >
              <LegendDot color={C.red} text="HOSTILE" />
              <LegendDot color={C.amber} text="SUMMONING" />
              <LegendDot color={C.green} text="CLEARED" />
              <LegendDot color={C.cyan} text="FRIENDLY" />
              <LegendDot color={C.violet} text="OBJECTIVE" />
            </div>
          </div>
        </Panel>

        {/* FORCE COMPOSITION */}
        <Panel title="04 · FORCE COMPOSITION" status="STAGED">
          <div style={{ padding: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 60px 60px",
                gap: 8,
                padding: "6px 0",
                borderBottom: `1px solid ${C.border}`,
                fontFamily: F.mono,
                fontSize: 9,
                color: C.textDim,
                letterSpacing: 1.5,
              }}
            >
              <span>UNIT</span>
              <span>PROFILE</span>
              <span style={{ textAlign: "right" }}>HP</span>
              <span style={{ textAlign: "right" }}>WIN%</span>
            </div>

            {SPIRITS.map((sp) => (
              <div
                key={sp.code}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 60px 60px",
                  gap: 8,
                  padding: "10px 0",
                  borderBottom: `1px solid ${C.grid}`,
                  alignItems: "center",
                  fontFamily: F.mono,
                  fontSize: 11,
                }}
              >
                <div>
                  <div style={{ color: C.amber, fontWeight: 600 }}>{sp.code}</div>
                  <Mono color={C.textFaint} size={9}>
                    {sp.affinity} · ACTIVE
                  </Mono>
                </div>
                <div>
                  <div style={{ color: C.text, fontWeight: 600 }}>{sp.name}</div>
                  <Mono color={C.textDim} size={10}>
                    {sp.sport}
                  </Mono>
                  <div style={{ marginTop: 4 }}>
                    <HBar pct={sp.hp} color={sp.hp > 75 ? C.green : sp.hp > 40 ? C.amber : C.red} height={4} />
                  </div>
                </div>
                <span style={{ textAlign: "right", color: C.text }}>{sp.hp}/100</span>
                <span
                  style={{
                    textAlign: "right",
                    color: C.green,
                    fontWeight: 600,
                  }}
                >
                  {[78, 62, 71][SPIRITS.indexOf(sp)]}%
                </span>
              </div>
            ))}

            <div style={{ marginTop: 14 }}>
              <Mono color={C.textDim} size={9} tracking={2}>
                AGGREGATE OFFENSIVE PROFILE
              </Mono>
              <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                {[
                  { k: "G", v: 0.51, c: C.amber },
                  { k: "S", v: 0.18, c: C.cyan },
                  { k: "B", v: 0.11, c: C.violet },
                  { k: "M", v: 0.2, c: C.textFaint },
                ].map((seg) => (
                  <div
                    key={seg.k}
                    style={{
                      border: `1px solid ${C.border}`,
                      padding: "6px 8px",
                      background: `${seg.c}11`,
                    }}
                  >
                    <Mono color={seg.c} size={9} tracking={2} bold>
                      {seg.k}
                    </Mono>
                    <div
                      style={{
                        fontFamily: F.mono,
                        fontSize: 18,
                        color: seg.c,
                        fontWeight: 600,
                      }}
                    >
                      {Math.round(seg.v * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* TARGET DOSSIER + READINESS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Panel title="05 · TARGET DOSSIER · HX-CAP-09" status="HOSTILE">
          <div style={{ padding: 12, fontFamily: F.mono, fontSize: 11 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 70,
                  height: 70,
                  background: `linear-gradient(135deg, ${C.red}33, ${C.bg})`,
                  border: `1px solid ${C.red}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  position: "relative",
                }}
              >
                <Crosshair />
                🐍
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.red, fontWeight: 600, fontSize: 13 }}>
                  HYDRA OF CAPITOLIA
                </div>
                <Mono color={C.textDim} size={10}>
                  designation HX-CAP-09 · region CAP
                </Mono>
                <div style={{ marginTop: 6 }}>
                  <Mono color={C.textDim} size={9}>HP</Mono>
                  <HBar pct={MONSTER.hp} color={C.red} height={6} segments />
                </div>
                <Mono color={C.text} size={10}>
                  {MONSTER.hp} / {MONSTER.maxHp} · regen +8 / turn
                </Mono>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Mono color={C.textDim} size={9} tracking={1.5}>
                ABILITY SET
              </Mono>
              {MONSTER.abilities.map((a) => (
                <div
                  key={a}
                  style={{
                    padding: "4px 0",
                    color: C.text,
                    borderBottom: `1px dashed ${C.grid}`,
                  }}
                >
                  ▸ {a}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <Mono color={C.textDim} size={9} tracking={1.5}>
                INTEL NOTE
              </Mono>
              <div style={{ color: C.textDim, marginTop: 4, lineHeight: 1.45, fontFamily: F.ui, fontSize: 12 }}>
                Multi-headed adversary with regenerative phasing. Recommend
                relay-class engagements for sustained pressure.
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="06 · ENGAGEMENT FORECAST" status="MONTE-CARLO">
          <div style={{ padding: 12, fontFamily: F.mono }}>
            <Mono color={C.textDim} size={9} tracking={2}>
              WIN PROBABILITY · 1000 RUNS
            </Mono>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 56,
                color: C.green,
                fontWeight: 700,
                marginTop: 4,
                lineHeight: 1,
              }}
            >
              71<span style={{ fontSize: 24, color: C.textDim }}>%</span>
            </div>
            <Mono color={C.textDim} size={10}>
              ±4.2pp · CI 95% · n=1000
            </Mono>

            <div style={{ marginTop: 14 }}>
              <Mono color={C.textDim} size={9} tracking={2}>
                DAMAGE DISTRIBUTION (avg=72)
              </Mono>
              <DamageHistogram />
            </div>

            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
                fontSize: 11,
              }}
            >
              <Stat lab="P(GOLD)" v="51%" c={C.amber} />
              <Stat lab="P(KILL)" v="71%" c={C.green} />
              <Stat lab="AVG DMG" v="72" c={C.cyan} />
              <Stat lab="EXPECTED TURNS" v="4.8" c={C.violet} />
            </div>
          </div>
        </Panel>

        <Panel title="07 · RECON · ARCHIVAL TREND" status="">
          <div style={{ padding: 12, fontFamily: F.mono, fontSize: 11 }}>
            <Mono color={C.textDim} size={9} tracking={2}>
              SWIMMING · GOLD RATE BY DECADE (USA)
            </Mono>
            <DecadeChart />

            <div style={{ marginTop: 14 }}>
              <Mono color={C.textDim} size={9} tracking={2}>
                TOP 5 STRIKE PROFILES (LOADED)
              </Mono>
              {[
                ["SW-MED-4X1", "4×100 Medley Relay", 0.79],
                ["TF-4X4", "4×400m Relay", 0.7],
                ["TF-400H", "400m Hurdles", 0.63],
                ["TF-100M", "100m Sprint", 0.51],
                ["SW-BCK-200", "200m Backstroke", 0.45],
              ].map(([id, name, g]) => (
                <div
                  key={id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "82px 1fr 80px 36px",
                    gap: 6,
                    alignItems: "center",
                    padding: "5px 0",
                    borderBottom: `1px solid ${C.grid}`,
                  }}
                >
                  <Mono color={C.amber} size={10}>
                    {id}
                  </Mono>
                  <Mono color={C.text} size={11}>
                    {name}
                  </Mono>
                  <HBar pct={g * 100} color={C.amber} height={4} />
                  <Mono color={C.amber} size={11} bold>
                    {Math.round(g * 100)}%
                  </Mono>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function LegendDot({ color, text }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 8, height: 8, background: color, borderRadius: "50%", boxShadow: `0 0 6px ${color}` }} />
      <span>{text}</span>
    </span>
  );
}

function SitrepMap() {
  return (
    <svg viewBox="0 0 600 320" style={{ width: "100%", display: "block" }}>
      <defs>
        <pattern id="cmd-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={C.grid} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="600" height="320" fill={C.bg} />
      <rect width="600" height="320" fill="url(#cmd-grid)" />

      {/* Lat/lon labels */}
      {[40, 80, 120, 160, 200, 240, 280].map((y) => (
        <text key={y} x={4} y={y + 3} fontFamily={F.mono} fontSize="8" fill={C.textFaint}>
          {49 - (y - 40) / 8}°N
        </text>
      ))}

      {/* USA outline */}
      <path
        d="M60 110 Q80 80 140 80 L 230 70 Q 310 65 380 75 L 470 85 Q 530 95 540 130 L 530 210 Q 510 260 470 270 L 410 285 Q 350 290 300 285 L 220 290 Q 160 295 120 275 L 70 240 Q 50 190 60 110 Z"
        fill={`${C.cyan}11`}
        stroke={C.borderHi}
        strokeWidth="1"
      />

      {/* Range rings around capital */}
      {[40, 70, 100].map((r, i) => (
        <circle
          key={r}
          cx={432}
          cy={195}
          r={r}
          fill="none"
          stroke={C.red}
          strokeWidth="1"
          opacity={0.5 - i * 0.12}
          strokeDasharray="3 3"
        />
      ))}

      {/* Threats */}
      {[
        { x: 110, y: 200, code: "MN-PAC-01", st: "active", c: C.red },
        { x: 200, y: 165, code: "MN-MTN-07", st: "summon", c: C.amber },
        { x: 290, y: 195, code: "ATA-02", st: "friendly", c: C.cyan },
        { x: 370, y: 155, code: "HER-03", st: "friendly", c: C.cyan },
        { x: 410, y: 235, code: "MN-DLT-05", st: "summon", c: C.amber },
        { x: 470, y: 175, code: "MN-ATL-04", st: "active", c: C.red },
        { x: 470, y: 130, code: "MN-NWA-02", st: "cleared", c: C.green },
        { x: 432, y: 195, code: "HX-CAP-09", st: "boss", c: C.red },
        { x: 110, y: 205, code: "PHA-01", st: "friendly", c: C.cyan, off: 28 },
      ].map((t) => (
        <g key={t.code}>
          {t.st === "boss" && (
            <circle cx={t.x} cy={t.y} r={18} fill="none" stroke={C.red} strokeWidth="1" opacity="0.6">
              <animate attributeName="r" values="18;26;18" dur="1.5s" repeatCount="indefinite" />
            </circle>
          )}
          {t.st === "friendly" ? (
            <g>
              <path
                d={`M ${t.x - 6} ${t.y - 6} L ${t.x + 6} ${t.y - 6} L ${t.x} ${t.y + 6} Z`}
                fill={t.c}
                stroke={C.bg}
                strokeWidth="1"
              />
            </g>
          ) : (
            <g>
              <rect
                x={t.x - 6}
                y={t.y - 6}
                width={12}
                height={12}
                fill={t.c}
                stroke={C.bg}
                strokeWidth="1"
                transform={`rotate(45 ${t.x} ${t.y})`}
              />
            </g>
          )}
          <text
            x={t.x + 10}
            y={t.y - 6}
            fontFamily={F.mono}
            fontSize="9"
            fill={t.c}
            fontWeight="600"
          >
            {t.code}
          </text>
          <text
            x={t.x + 10}
            y={t.y + 6}
            fontFamily={F.mono}
            fontSize="8"
            fill={C.textDim}
          >
            {t.st.toUpperCase()}
          </text>
        </g>
      ))}

      {/* Engagement vector */}
      <line
        x1={110}
        y1={200}
        x2={432}
        y2={195}
        stroke={C.amber}
        strokeWidth="1.2"
        strokeDasharray="4 3"
        opacity="0.7"
      />
      <text
        x={270}
        y={188}
        fontFamily={F.mono}
        fontSize="9"
        fill={C.amber}
      >
        VECTOR · INTERCEPT 04:42 ETA
      </text>

      {/* Compass / scale */}
      <g transform="translate(540 290)">
        <line x1={-30} y1={0} x2={0} y2={0} stroke={C.text} strokeWidth="1" />
        <text x={-30} y={-4} fontFamily={F.mono} fontSize="8" fill={C.textDim}>
          800 km
        </text>
      </g>
    </svg>
  );
}

function Stat({ lab, v, c }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, padding: "6px 8px" }}>
      <Mono color={C.textDim} size={9} tracking={1.5}>
        {lab}
      </Mono>
      <div style={{ fontFamily: F.mono, fontSize: 18, color: c, fontWeight: 600 }}>{v}</div>
    </div>
  );
}

function DamageHistogram() {
  const buckets = [2, 5, 11, 22, 38, 64, 92, 118, 134, 142, 128, 102, 76, 48, 22, 9, 4, 2, 1, 0];
  const max = Math.max(...buckets);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 50, marginTop: 4 }}>
      {buckets.map((b, i) => {
        const h = (b / max) * 100;
        const isPeak = b === max;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              background: isPeak ? C.green : i < 8 ? C.red : C.green,
              opacity: isPeak ? 1 : 0.6,
              boxShadow: isPeak ? `0 0 6px ${C.green}` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function DecadeChart() {
  const decades = [
    ["1960s", 0.42],
    ["1970s", 0.45],
    ["1980s", 0.39],
    ["1990s", 0.51],
    ["2000s", 0.48],
    ["2010s", 0.55],
    ["2020s", 0.58],
  ];
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
        {decades.map(([d, v]) => (
          <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
            <div
              style={{
                height: `${v * 100}%`,
                background: `linear-gradient(180deg, ${C.amber}, ${C.amber}55)`,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {decades.map(([d]) => (
          <Mono key={d} color={C.textFaint} size={8}>
            <span style={{ flex: 1, textAlign: "center", display: "inline-block", width: "100%" }}>{d}</span>
          </Mono>
        ))}
      </div>
    </div>
  );
}

// ─── 3. BATTLE — LIVE OP FEED ───────────────────────────────────────────────

function BattlePanel() {
  return (
    <section style={{ padding: 14, background: C.bg }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 14 }}>
        {/* PLAYER UNITS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel title="08 · FRIENDLY UNITS" status="ENGAGED">
            <div style={{ padding: 10 }}>
              {SPIRITS.map((sp, i) => (
                <UnitCard key={sp.code} sp={sp} active={i === 0} />
              ))}
            </div>
          </Panel>

          <Panel title="09 · STRIKE OPTIONS · PHA-01" status="READY">
            <div style={{ padding: 10, fontFamily: F.mono }}>
              {SPIRITS[0].moves.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    padding: "8px 10px",
                    marginBottom: 4,
                    border: `1px solid ${i === 1 ? C.amber : C.border}`,
                    background: i === 1 ? `${C.amber}11` : "transparent",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {i === 1 && (
                    <span
                      style={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: C.amber,
                        fontSize: 10,
                        animation: "blink 1.2s infinite",
                      }}
                    >
                      ▶ SELECTED
                    </span>
                  )}
                  <Mono color={C.amber} size={10} tracking={1.5}>
                    {m.id}
                  </Mono>
                  <div style={{ color: C.text, fontSize: 12, marginTop: 2 }}>{m.name}</div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto auto auto auto",
                      gap: 8,
                      marginTop: 6,
                      fontSize: 10,
                    }}
                  >
                    <Mono color={C.amber}>G {Math.round(m.g * 100)}%</Mono>
                    <Mono color={C.cyan}>S {Math.round(m.s * 100)}%</Mono>
                    <Mono color={C.violet}>B {Math.round(m.b * 100)}%</Mono>
                    <Mono color={C.textDim}>n={m.n}</Mono>
                  </div>
                  <div style={{ marginTop: 6, display: "flex", gap: 1, height: 4 }}>
                    <div style={{ flex: m.g, background: C.amber }} />
                    <div style={{ flex: m.s, background: C.cyan }} />
                    <div style={{ flex: m.b, background: C.violet }} />
                    <div style={{ flex: 1 - m.g - m.s - m.b, background: C.grid }} />
                  </div>
                </div>
              ))}
              <button
                style={{
                  width: "100%",
                  marginTop: 6,
                  fontFamily: F.mono,
                  fontSize: 11,
                  letterSpacing: 2,
                  padding: "10px 12px",
                  background: C.green,
                  color: C.bg,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                [SPACE]  EXECUTE STRIKE
              </button>
            </div>
          </Panel>
        </div>

        {/* CENTER: TARGETING */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel title="10 · TARGETING · HX-CAP-09" status="LOCKED">
            <div style={{ padding: 14, position: "relative", background: `radial-gradient(circle, ${C.red}22 0%, transparent 60%)` }}>
              <div
                style={{
                  position: "relative",
                  height: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Reticle */}
                <svg
                  viewBox="-100 -100 200 200"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                >
                  {[60, 80, 95].map((r) => (
                    <circle
                      key={r}
                      cx={0}
                      cy={0}
                      r={r}
                      fill="none"
                      stroke={C.red}
                      strokeWidth="0.5"
                      strokeDasharray="2 4"
                      opacity={0.7 - (r - 60) / 60}
                    />
                  ))}
                  <line x1={-95} y1={0} x2={-50} y2={0} stroke={C.red} strokeWidth="1" />
                  <line x1={50} y1={0} x2={95} y2={0} stroke={C.red} strokeWidth="1" />
                  <line x1={0} y1={-95} x2={0} y2={-50} stroke={C.red} strokeWidth="1" />
                  <line x1={0} y1={50} x2={0} y2={95} stroke={C.red} strokeWidth="1" />
                  <text x={-95} y={-72} fontFamily={F.mono} fontSize="6" fill={C.red}>
                    LOCK
                  </text>
                  <text x={68} y={-72} fontFamily={F.mono} fontSize="6" fill={C.red}>
                    071402Z
                  </text>
                  <text x={-95} y={92} fontFamily={F.mono} fontSize="6" fill={C.red}>
                    AZ 087°
                  </text>
                  <text x={50} y={92} fontFamily={F.mono} fontSize="6" fill={C.red}>
                    EL +12°
                  </text>
                </svg>
                <div
                  style={{
                    fontSize: 130,
                    filter: `drop-shadow(0 0 18px ${C.red})`,
                    position: "relative",
                    zIndex: 2,
                    animation: "pulse 2s infinite",
                  }}
                >
                  🐍
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <div>
                  <Mono color={C.textDim} size={9} tracking={2}>
                    TARGET HP
                  </Mono>
                  <Mono color={C.red} size={20} bold>
                    {MONSTER.hp} / {MONSTER.maxHp}
                  </Mono>
                  <div style={{ marginTop: 4 }}>
                    <HBar pct={MONSTER.hp} color={C.red} height={6} segments />
                  </div>
                </div>
                <div>
                  <Mono color={C.textDim} size={9} tracking={2}>
                    KILL PROBABILITY · NEXT 3 TURNS
                  </Mono>
                  <Mono color={C.green} size={26} bold>
                    71%
                  </Mono>
                  <Sparkline
                    data={[42, 48, 55, 60, 65, 71]}
                    color={C.green}
                    w={140}
                    h={20}
                  />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="11 · TURN PHASE" status="ROUND 4 / OFFENSIVE">
            <div style={{ padding: 14, fontFamily: F.mono }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {["DETECT", "ASSESS", "TARGET", "STRIKE", "RESOLVE"].map((p, i) => {
                  const active = i === 3;
                  const done = i < 3;
                  return (
                    <React.Fragment key={p}>
                      <div
                        style={{
                          flex: 1,
                          textAlign: "center",
                          padding: "10px 6px",
                          background: active ? `${C.amber}22` : done ? `${C.green}11` : C.bg,
                          border: `1px solid ${active ? C.amber : done ? C.green : C.border}`,
                          color: active ? C.amber : done ? C.green : C.textDim,
                          fontSize: 10,
                          letterSpacing: 1.5,
                          fontWeight: 600,
                        }}
                      >
                        {done ? "✓ " : active ? "▶ " : "  "}
                        {p}
                      </div>
                      {i < 4 && <span style={{ color: C.borderHi }}>►</span>}
                    </React.Fragment>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 14,
                  background: C.bg,
                  border: `1px solid ${C.amber}`,
                  padding: 10,
                  fontSize: 11,
                  color: C.text,
                }}
              >
                <Mono color={C.amber} size={10} tracking={2}>
                  PROJECTED RESULT — STRIKE PHASE
                </Mono>
                <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <Mono color={C.textDim} size={9}>P(GOLD)</Mono>
                    <Mono color={C.amber} size={20} bold>79%</Mono>
                  </div>
                  <div>
                    <Mono color={C.textDim} size={9}>EXPECTED DMG</Mono>
                    <Mono color={C.cyan} size={20} bold>21</Mono>
                  </div>
                  <div>
                    <Mono color={C.textDim} size={9}>SYNERGY</Mono>
                    <Mono color={C.green} size={20} bold>+RELAY</Mono>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* RIGHT: EVENT LOG + TELEMETRY */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel title="12 · EVENT LOG · LIVE" status="STREAMING">
            <div
              style={{
                padding: 10,
                fontFamily: F.mono,
                fontSize: 10.5,
                lineHeight: 1.55,
                maxHeight: 320,
                overflow: "auto",
              }}
            >
              {[
                ["14:01:02Z", C.cyan, "[SUMMON]", "HX-CAP-09 instantiated at CAP grid 432,195"],
                ["14:01:08Z", C.cyan, "[INTEL]", "threat=MAJOR, regen=8/turn, abilities=2"],
                ["14:01:14Z", C.green, "[RECON]", "PHA-01 vector locked, ETA 04:42"],
                ["14:01:30Z", C.amber, "[ROUND 1]", "ATA-02 → TF-4X4 → roll 0.62 < 0.70 → ", { c: C.amber, t: "[GOLD]" }, " dmg=18"],
                ["14:01:48Z", C.red, "[ROUND 1]", "HX-CAP-09 → multistrike → HER-03 dmg=14"],
                ["14:02:01Z", C.cyan, "[ROUND 2]", "PHA-01 → SW-FRE-100 → roll 0.51 → ", { c: C.cyan, t: "[SILVER]" }, " dmg=8"],
                ["14:02:11Z", C.amber, "[ROUND 4]", "PHA-01 → SW-MED-4X1 → roll 0.34 < 0.79 → ", { c: C.amber, t: "[GOLD]" }, " dmg=21"],
                ["14:02:11Z", C.green, "[SYNERGY]", "RELAY_CHAIN ×3 active · +30% dmg next turn"],
                ["14:02:12Z", C.red, "[STATUS]", "HX-CAP-09 hp=64/100 · regen primed"],
                ["14:02:14Z", C.violet, "[FORECAST]", "win_p=0.71±0.04 (n=1000)"],
              ].map(([ts, c, tag, msg, glow], i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "2px 0" }}>
                  <span style={{ color: C.textFaint, minWidth: 70 }}>{ts}</span>
                  <span style={{ color: c, minWidth: 76, fontWeight: 600 }}>{tag}</span>
                  <span style={{ color: C.text, flex: 1 }}>
                    {msg}
                    {glow && (
                      <span
                        style={{
                          background: glow.c,
                          color: C.bg,
                          padding: "0 5px",
                          fontWeight: 700,
                        }}
                      >
                        {glow.t}
                      </span>
                    )}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "4px 0",
                  color: C.green,
                  borderTop: `1px solid ${C.grid}`,
                  marginTop: 4,
                }}
              >
                <span style={{ animation: "blink 1s infinite" }}>▌</span>
                <span>awaiting input — [SPACE] to confirm strike</span>
              </div>
            </div>
          </Panel>

          <Panel title="13 · TELEMETRY · HP TRACE" status="">
            <div style={{ padding: 10 }}>
              <Mono color={C.textDim} size={9} tracking={2}>
                FRIENDLY HP · LAST 4 ROUNDS
              </Mono>
              <Sparkline data={[100, 100, 92, 88, 88]} color={C.cyan} w={260} h={26} />
              <Mono color={C.textDim} size={9} tracking={2}>
                HOSTILE HP · LAST 4 ROUNDS
              </Mono>
              <Sparkline data={[100, 82, 78, 74, 64]} color={C.red} w={260} h={26} />

              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                <Stat lab="ROUNDS" v="4" c={C.cyan} />
                <Stat lab="STRIKES" v="6" c={C.amber} />
                <Stat lab="HITS" v="5" c={C.green} />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}

function UnitCard({ sp, active }) {
  return (
    <div
      style={{
        padding: 10,
        marginBottom: 6,
        background: active ? `${C.amber}11` : "transparent",
        border: `1px solid ${active ? C.amber : C.grid}`,
        position: "relative",
      }}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            top: -1,
            right: -1,
            background: C.amber,
            color: C.bg,
            fontFamily: F.mono,
            fontSize: 9,
            padding: "2px 6px",
            fontWeight: 700,
          }}
        >
          ACTIVE
        </span>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Mono color={active ? C.amber : C.cyan} size={11} bold>
          {sp.code}
        </Mono>
        <Mono color={C.textDim} size={9}>
          AFFINITY · {sp.affinity}
        </Mono>
      </div>
      <Mono color={C.text} size={13} bold>
        {sp.name}
      </Mono>
      <Mono color={C.textDim} size={10}>
        {sp.sport}
      </Mono>
      <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
        <Mono color={C.textDim} size={9}>HP</Mono>
        <div style={{ flex: 1 }}>
          <HBar pct={sp.hp} color={sp.hp > 75 ? C.green : sp.hp > 40 ? C.amber : C.red} height={5} segments />
        </div>
        <Mono color={C.text} size={11} bold>
          {sp.hp}
        </Mono>
      </div>
    </div>
  );
}

// ─── PANEL HEADERS ──────────────────────────────────────────────────────────

function SectionLabel({ n, name }) {
  return (
    <div
      style={{
        background: "#070d18",
        borderTop: `1px solid ${C.amber}`,
        borderBottom: `1px solid ${C.border}`,
        padding: "8px 18px",
        display: "flex",
        gap: 14,
        alignItems: "center",
        fontFamily: F.mono,
        fontSize: 11,
        letterSpacing: 2,
      }}
    >
      <span style={{ color: C.amber, fontWeight: 700 }}>§ {n}</span>
      <span style={{ color: C.text, fontWeight: 600 }}>{name}</span>
      <span style={{ flex: 1 }} />
      <span style={{ color: C.textDim, fontSize: 9 }}>
        MOCKUP C · OLYMPUS COMMAND · TACTICAL OVERWATCH
      </span>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────

function App() {
  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: F.ui,
        minHeight: "100vh",
      }}
    >
      <CommandBar />
      <SectionLabel n="I" name="MISSION BRIEFING / SYSTEM STATUS" />
      <LandingPanel />
      <SectionLabel n="II" name="THEATER SITREP / FORCE COMPOSITION / FORECAST" />
      <RegionPanel />
      <SectionLabel n="III" name="LIVE ENGAGEMENT / TARGETING / EVENT FEED" />
      <BattlePanel />
      <div
        style={{
          background: "#070d18",
          borderTop: `1px solid ${C.border}`,
          padding: "10px 18px",
          fontFamily: F.mono,
          fontSize: 10,
          color: C.textDim,
          display: "flex",
          justifyContent: "space-between",
          letterSpacing: 1.5,
        }}
      >
        <span>OLYMPUS://COMMAND v0.9.4</span>
        <span>UPLINK 256ms · 0 ERRORS · CACHE 91%</span>
        <span>UNCLASSIFIED // FOUO</span>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
