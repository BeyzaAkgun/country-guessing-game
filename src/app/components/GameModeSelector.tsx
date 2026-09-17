// GameModeSelector.tsx — Deep-space redesign + live daily leaderboard teaser on Daily card
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Map, Lightbulb, Flag, Building2, Timer, BookOpen,
  Swords, Calendar, ArrowLeft, ChevronRight,
} from "lucide-react";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";
import { daily, getToken, type DailyLeaderboardEntry } from "@/api/client";

export type GameMode =
  | "classic" | "hint-based" | "flag-quiz" | "capital-city"
  | "speed-round" | "daily-challenge" | "continent-study"
  | "multiplayer";

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
}

function getDailyStreak(): number {
  try {
    return parseInt(localStorage.getItem("dailyChallenge_streak") || "0", 10) || 0;
  } catch { return 0; }
}

// ── Fetch today's top entry for the teaser (no auth required for leaderboard) ─
// We try the API; if it fails (not logged in) we gracefully show nothing.
async function fetchTopEntry(): Promise<DailyLeaderboardEntry | null> {
  try {
    const res = await daily.leaderboard();
    return res.leaderboard[0] ?? null;
  } catch {
    return null;
  }
}

const SOLO_MODES: {
  mode: GameMode;
  Icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
}[] = [
  {
    mode: "classic", Icon: Map, title: "Classic",
    description: "Find every country on the map at your own pace.",
    color: "#60a5fa", bg: "rgba(96,165,250,0.10)",
    border: "rgba(96,165,250,0.22)", glow: "rgba(96,165,250,0.15)",
  },
  {
    mode: "hint-based", Icon: Lightbulb, title: "Hint",
    description: "A clue is shown first — figure out the country from context.",
    color: "#fb923c", bg: "rgba(251,146,60,0.10)",
    border: "rgba(251,146,60,0.22)", glow: "rgba(251,146,60,0.15)",
  },
  {
    mode: "flag-quiz", Icon: Flag, title: "Flags",
    description: "See a flag and click the matching country on the map.",
    color: "#4ade80", bg: "rgba(74,222,128,0.10)",
    border: "rgba(74,222,128,0.22)", glow: "rgba(74,222,128,0.15)",
  },
  {
    mode: "capital-city", Icon: Building2, title: "Capitals",
    description: "A capital city is shown — find its country on the map.",
    color: "#c084fc", bg: "rgba(192,132,252,0.10)",
    border: "rgba(192,132,252,0.22)", glow: "rgba(192,132,252,0.15)",
  },
  {
    mode: "speed-round", Icon: Timer, title: "Speed",
    description: "Race the clock — find as many countries as you can.",
    color: "#fbbf24", bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.22)", glow: "rgba(251,191,36,0.15)",
  },
  {
    mode: "continent-study", Icon: BookOpen, title: "Study",
    description: "Pick a continent and learn its countries step by step.",
    color: "#f97316", bg: "rgba(249,115,22,0.10)",
    border: "rgba(249,115,22,0.22)", glow: "rgba(249,115,22,0.15)",
  },
];

// ── Starfield ─────────────────────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const stars: { x: number; y: number; r: number; alpha: number; speed: number; phase: number }[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 130; i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() > 0.85 ? 1.5 : 1,
        alpha: Math.random() * 0.5 + 0.15,
        speed: Math.random() * 3 + 2,
        phase: Math.random() * Math.PI * 2,
      });
    }
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.012;
      stars.forEach((s) => {
        const a = s.alpha * (0.4 + 0.6 * Math.abs(Math.sin(t / s.speed + s.phase)));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0,
      width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

// ── TV fallback ───────────────────────────────────────────────────────────────
function TVModeSelector({ onSelectMode }: GameModeSelectorProps) {
  const [view, setView] = useState<"main" | "solo">("main");
  const tvSolo = [
    { mode: "classic" as GameMode, label: "Classic", sub: "Find every country at your own pace" },
    { mode: "hint-based" as GameMode, label: "Hint", sub: "Start with a clue, find the country" },
    { mode: "flag-quiz" as GameMode, label: "Flags", sub: "See a flag, find the country" },
    { mode: "capital-city" as GameMode, label: "Capitals", sub: "See a capital, find the country" },
    { mode: "speed-round" as GameMode, label: "Speed", sub: "Race the clock" },
    { mode: "continent-study" as GameMode, label: "Study", sub: "Learn continent by continent" },
  ];
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020817", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 80px" }}>
      <h1 style={{ color: "#fff", fontSize: 64, fontWeight: 900, marginBottom: 48, textAlign: "center" }}>
        {view === "main" ? "Choose Your Mode" : "Solo Play"}
      </h1>
      {view === "main" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, maxWidth: 1400, width: "100%" }}>
          {[
            { label: "Solo Play", sub: "Six modes to explore", action: () => setView("solo") },
            { label: "Daily Challenge", sub: "One puzzle every day", action: () => onSelectMode("daily-challenge") },
            { label: "Multiplayer", sub: "Ranked real-time matches", action: () => onSelectMode("multiplayer") },
          ].map((c) => (
            <button key={c.label} onClick={c.action} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24, padding: "40px 36px", cursor: "pointer", color: "#fff", textAlign: "left" }}>
              <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>{c.label}</div>
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.55)" }}>{c.sub}</div>
            </button>
          ))}
        </div>
      ) : (
        <>
          <button onClick={() => setView("main")} style={{ marginBottom: 32, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: 20, padding: "12px 24px", borderRadius: 12, cursor: "pointer" }}>← Back</button>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, maxWidth: 1400, width: "100%" }}>
            {tvSolo.map((c) => (
              <button key={c.mode} onClick={() => onSelectMode(c.mode)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "32px 28px", cursor: "pointer", color: "#fff", textAlign: "left" }}>
                <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 10 }}>{c.label}</div>
                <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }}>{c.sub}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  const { config } = useDisplayMode();
  const [view, setView]           = useState<"main" | "solo">("main");
  const dailyStreak               = getDailyStreak();
  const isLoggedIn                = !!getToken();

  // Live top entry for the Daily card teaser
  const [topEntry, setTopEntry]   = useState<DailyLeaderboardEntry | null>(null);

  // Only fetch if user is logged in — leaderboard endpoint requires auth
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchTopEntry().then(setTopEntry).catch(() => {});
  }, [isLoggedIn]);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (config.isTV) return <TVModeSelector onSelectMode={onSelectMode} />;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(160deg, #020817 0%, #060d1f 50%, #020817 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <StarField />

      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(30,64,175,0.13) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 320, height: 320, background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 2,
        width: "100%", maxWidth: 900,
        padding: isMobile ? "0 14px" : "0 20px",
        maxHeight: "100vh", overflowY: "auto",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: isMobile ? 22 : 32, width: "100%" }}
        >
          <h1 style={{ fontSize: isMobile ? 28 : "clamp(30px, 5vw, 50px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1, margin: 0 }}>
            Choose Your{" "}
            <span style={{ background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Mode
            </span>
          </h1>
          <p style={{ marginTop: 8, fontSize: isMobile ? 12 : 14, color: "rgba(255,255,255,0.42)", letterSpacing: "0.3px" }}>
            How do you want to explore the world?
          </p>
        </motion.div>

        {/* View switcher */}
        <div style={{ width: "100%" }}>
          <AnimatePresence mode="wait">

            {/* ════ MAIN VIEW ════ */}
            {view === "main" && (
              <motion.div key="main"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 10 : 13 }}>

                  {/* ── Solo Play ── */}
                  <MainCard delay={0.05} isMobile={isMobile}
                    bgGradient="linear-gradient(145deg, #0b1a35 0%, #091528 100%)"
                    borderColor="rgba(96,165,250,0.22)" glowColor="rgba(96,165,250,0.10)"
                    hoverBorder="rgba(96,165,250,0.5)" hoverGlow="rgba(96,165,250,0.20)"
                    topEdge="rgba(96,165,250,0.5)"
                    onClick={() => setView("solo")}>
                    <IconBox bg="rgba(96,165,250,0.12)" border="rgba(96,165,250,0.25)" isMobile={isMobile}>
                      <Map size={isMobile ? 18 : 22} color="#60a5fa" />
                    </IconBox>
                    <CardTitle isMobile={isMobile}>Solo Play</CardTitle>
                    <CardDesc isMobile={isMobile}>
                      Six modes — relaxed exploration to flags, capitals, and speed runs.
                    </CardDesc>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                      {["Classic", "Hints", "Flags", "+3"].map((p) => (
                        <span key={p} style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.22)", color: "rgba(96,165,250,0.85)", textTransform: "uppercase", letterSpacing: "0.4px" }}>{p}</span>
                      ))}
                    </div>
                    <CardCTA color="#60a5fa" label="Explore modes" />
                  </MainCard>

                  {/* ── Daily Challenge — with live leaderboard teaser ── */}
                  <MainCard delay={0.12} isMobile={isMobile}
                    bgGradient="linear-gradient(145deg, #160d30 0%, #110a24 100%)"
                    borderColor="rgba(167,139,250,0.28)" glowColor="rgba(139,92,246,0.14)"
                    hoverBorder="rgba(167,139,250,0.6)" hoverGlow="rgba(139,92,246,0.22)"
                    topEdge="rgba(167,139,250,0.75)" highlight
                    badge={{ text: "TODAY", color: "#a78bfa", bg: "rgba(167,139,250,0.13)", border: "rgba(167,139,250,0.35)" }}
                    onClick={() => onSelectMode("daily-challenge")}>
                    <IconBox bg="rgba(167,139,250,0.12)" border="rgba(167,139,250,0.28)" isMobile={isMobile}>
                      <Calendar size={isMobile ? 18 : 22} color="#a78bfa" />
                    </IconBox>
                    <CardTitle isMobile={isMobile}>Daily Challenge</CardTitle>
                    <CardDesc isMobile={isMobile}>
                      One new puzzle every day. Build your streak and share your results.
                    </CardDesc>

                    {/* Streak pill */}
                    {dailyStreak > 0 && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, background: "rgba(251,146,60,0.13)", border: "1px solid rgba(251,146,60,0.32)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#fb923c", width: "fit-content" }}>
                        🔥 {dailyStreak}-day streak
                      </div>
                    )}

                    {/* ── Live leaderboard teaser ── */}
                    {!isMobile && topEntry && (
                      <div style={{ marginTop: 8, padding: "6px 10px", background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 10, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12 }}>🏆</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 10, color: "rgba(167,139,250,0.7)", margin: 0, lineHeight: 1.2 }}>Today's leader</p>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#c4b5fd", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {topEntry.username} · {topEntry.correct_count}/10 · {topEntry.time_formatted}
                          </p>
                        </div>
                      </div>
                    )}

                    <CardCTA color="#a78bfa" label="Play today's puzzle" />
                  </MainCard>

                  {/* ── Multiplayer ── */}
                  <MainCard delay={0.19} isMobile={isMobile}
                    bgGradient="linear-gradient(145deg, #240810 0%, #1a060c 100%)"
                    borderColor="rgba(251,113,133,0.20)" glowColor="rgba(251,113,133,0.08)"
                    hoverBorder="rgba(251,113,133,0.48)" hoverGlow="rgba(251,113,133,0.18)"
                    topEdge="rgba(251,113,133,0.55)"
                    badge={{ text: "LIVE", color: "#fb7185", bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.35)", pulse: true }}
                    onClick={() => onSelectMode("multiplayer")}>
                    <IconBox bg="rgba(251,113,133,0.12)" border="rgba(251,113,133,0.22)" isMobile={isMobile}>
                      <Swords size={isMobile ? 18 : 22} color="#fb7185" />
                    </IconBox>
                    <CardTitle isMobile={isMobile}>Multiplayer</CardTitle>
                    <CardDesc isMobile={isMobile}>
                      Real-time ranked matches against a live opponent. 10 rounds, earn rank points.
                    </CardDesc>
                    <CardCTA color="#fb7185" label="Find a match" />
                  </MainCard>

                </div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  style={{ textAlign: "center", color: "rgba(255,255,255,0.22)", fontSize: 11, marginTop: isMobile ? 18 : 24, letterSpacing: "0.3px" }}>
                  Select a mode to begin your geography journey 🌍
                </motion.p>
              </motion.div>
            )}

            {/* ════ SOLO SUB-VIEW ════ */}
            {view === "solo" && (
              <motion.div key="solo"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>

                <div style={{ marginBottom: isMobile ? 16 : 22 }}>
                  <motion.button
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setView("main")}
                    whileHover={{ background: "rgba(255,255,255,0.13)" } as any}
                    whileTap={{ scale: 0.96 }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 14, minHeight: 44 }}>
                    <ArrowLeft size={14} /> Back
                  </motion.button>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
                    <h2 style={{ fontSize: isMobile ? 22 : "clamp(22px, 4vw, 34px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.3px", margin: 0 }}>
                      Solo Play
                    </h2>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 4 }}>
                      Pick a mode and start playing
                    </p>
                  </motion.div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? 8 : 10 }}>
                  {SOLO_MODES.map((m, i) => (
                    <motion.button key={m.mode}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                      onClick={() => onSelectMode(m.mode)}
                      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${m.border}`, borderRadius: 16, padding: isMobile ? "12px 12px" : "14px 14px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 12, minHeight: 44, transition: "background 0.18s, border-color 0.18s, box-shadow 0.18s" }}
                      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.075)"; el.style.boxShadow = `0 4px 20px ${m.glow}`; }}
                      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.boxShadow = "none"; }}>
                      <div style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, flexShrink: 0, borderRadius: 10, background: m.bg, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <m.Icon size={isMobile ? 14 : 16} color={m.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "#fff", marginBottom: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span>{m.title}</span>
                          <ChevronRight size={13} color="rgba(255,255,255,0.25)" />
                        </div>
                        <p style={{ fontSize: isMobile ? 10 : 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.55, margin: 0 }}>
                          {m.description}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                  style={{ textAlign: "center", color: "rgba(255,255,255,0.22)", fontSize: 11, marginTop: isMobile ? 16 : 20 }}>
                  All modes earn XP and track your progress 🌍
                </motion.p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
        @keyframes dotBlink  { 0%,100%{opacity:1} 50%{opacity:0.15} }
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function MainCard({ children, delay, isMobile, bgGradient, borderColor, glowColor, hoverBorder, hoverGlow, topEdge, highlight, badge, onClick }: {
  children: React.ReactNode; delay: number; isMobile: boolean;
  bgGradient: string; borderColor: string; glowColor: string;
  hoverBorder: string; hoverGlow: string; topEdge: string;
  highlight?: boolean;
  badge?: { text: string; color: string; bg: string; border: string; pulse?: boolean };
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: isMobile ? -2 : -5, scale: 1.015 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{ position: "relative", background: bgGradient, border: `1px solid ${borderColor}`, borderRadius: isMobile ? 16 : 20, padding: isMobile ? "14px 14px" : "20px 18px 18px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: isMobile ? "row" : "column", alignItems: isMobile ? "center" : "flex-start", gap: isMobile ? 12 : 0, minHeight: isMobile ? 72 : 210, overflow: "hidden", boxShadow: highlight ? `0 0 24px ${glowColor}, 0 0 0 1px ${borderColor}` : `0 0 14px ${glowColor}`, transition: "border-color 0.2s, box-shadow 0.2s", outline: "none", width: "100%" }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = hoverBorder; el.style.boxShadow = `0 10px 36px ${hoverGlow}, 0 0 0 1px ${hoverBorder}`; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = borderColor; el.style.boxShadow = highlight ? `0 0 24px ${glowColor}, 0 0 0 1px ${borderColor}` : `0 0 14px ${glowColor}`; }}>
      {!isMobile && (
        <div style={{ position: "absolute", top: 0, left: "18%", right: "18%", height: 1, background: `linear-gradient(90deg, transparent, ${topEdge}, transparent)`, pointerEvents: "none" }} />
      )}
      {badge && (
        <div style={{ position: "absolute", top: isMobile ? 8 : 12, right: isMobile ? 8 : 12, fontSize: 9, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", padding: "3px 8px", borderRadius: 20, background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, animation: badge.pulse ? "livePulse 2s ease-in-out infinite" : undefined, display: "flex", alignItems: "center", gap: 3 }}>
          {badge.pulse && <span style={{ width: 5, height: 5, borderRadius: "50%", background: badge.color, flexShrink: 0, animation: "dotBlink 1s ease-in-out infinite" }} />}
          {badge.text}
        </div>
      )}
      {children}
    </motion.button>
  );
}

function IconBox({ children, bg, border, isMobile }: { children: React.ReactNode; bg: string; border: string; isMobile: boolean }) {
  return (
    <div style={{ width: isMobile ? 36 : 42, height: isMobile ? 36 : 42, flexShrink: 0, borderRadius: 11, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: isMobile ? 0 : 13 }}>
      {children}
    </div>
  );
}
function CardTitle({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) {
  return (
    <div style={{ fontSize: isMobile ? 15 : "clamp(15px, 2.6vw, 19px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.2px", marginBottom: isMobile ? 0 : 6, lineHeight: 1.2, flex: isMobile ? 1 : undefined }}>
      {children}
    </div>
  );
}
function CardDesc({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) {
  if (isMobile) return null;
  return (
    <p style={{ fontSize: "clamp(10px, 1.8vw, 12px)", color: "rgba(255,255,255,0.42)", lineHeight: 1.6, margin: 0, flex: 1 }}>
      {children}
    </p>
  );
}
function CardCTA({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color, letterSpacing: "0.2px" }}>
      {label} <span style={{ fontSize: 13 }}>→</span>
    </div>
  );
}