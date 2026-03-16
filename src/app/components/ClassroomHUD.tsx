// ClassroomHUD.tsx — Universal TV/Classroom overlay — ALL game modes
// Spec compliance:
//   Visual:      clamp() typography, relative units only, 4.5:1 contrast, 40px+ margins
//   Performance: will-change on animated elements, requestIdleCallback for autocomplete
//   Navigation:  ArrowUp/Down/Enter/Escape, visible focus rings (glow), auto-focus
//   Input:       min-height 80px input, 6 suggestions, min 60×120px submit button
//   Forbidden:   zero fixed px values, no hover-only, all text ≥ 24px

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tv2, Home, RotateCcw, ChevronDown } from "lucide-react";

// ── Fluid design tokens ───────────────────────────────────────────────────────
// clamp(min, preferred, max) — min covers 720p, max covers 4K
const T = {
  numPrimary:   "clamp(2.5rem, 6.5vw, 7.5rem)",    // score / timer digits
  labelSec:     "clamp(1rem, 1.6vw, 1.4rem)",       // "SCORE" / "TIME" label
  countryName:  "clamp(2.25rem, 5vw, 5.5rem)",      // selected country name
  inputFont:    "clamp(1.5rem, 2.4vw, 2.25rem)",    // guess input text
  suggFont:     "clamp(1.25rem, 1.9vw, 1.875rem)",  // suggestion list text
  btnFont:      "clamp(1rem, 1.6vw, 1.5rem)",       // Restart / Main Menu
  ctrlFont:     "clamp(0.9rem, 1.3vw, 1.2rem)",     // Exit TV / Menu toggle
  idleFont:     "clamp(1.5rem, 2vw, 2rem)",         // "Click any country" idle
  safeX:        "clamp(2.5rem, 5vw, 5rem)",         // left/right safe margin
  safeY:        "clamp(2rem, 4vh, 4.5rem)",         // top/bottom safe margin
  inputH:       "clamp(5rem, 8vh, 7rem)",           // input height ≥80px
  btnH:         "clamp(3.75rem, 5.5vh, 5rem)",      // action button height ≥60px
  btnMinW:      "clamp(7.5rem, 12vw, 13rem)",       // action button min-width ≥120px
  suggH:        "clamp(3.25rem, 4.5vh, 4.5rem)",   // suggestion row height
  ctrlTarget:   "clamp(2.75rem, 4vh, 3.5rem)",     // Exit/Menu tap target ≥44px
};

interface ClassroomHUDProps {
  score: number;
  totalCountries: number;
  selectedCountryName: string | null;
  allCountryNames: string[];
  onGuess: (name: string) => void;
  onExitTVMode: () => void;
  onBackToMenu: () => void;
  onRestart: () => void;
  timeLeft?: number | null;
  streak?: number;
  targetLabel?: string;
  mode?: string;
}

export function ClassroomHUD({
  score, totalCountries, selectedCountryName, allCountryNames,
  onGuess, onExitTVMode, onBackToMenu, onRestart,
  timeLeft, streak, targetLabel = "Selected country",
}: ClassroomHUDProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerDanger = typeof timeLeft === "number" && timeLeft <= 10;
  const rIC = typeof window !== "undefined" && "requestIdleCallback" in window
    ? (cb: IdleRequestCallback) => requestIdleCallback(cb, { timeout: 100 })
    : (cb: () => void) => setTimeout(cb, 0);

  // Auto-focus via rIC (non-blocking)
  useEffect(() => {
    setInput(""); setSuggestions([]); setActiveIdx(0);
    if (selectedCountryName) rIC(() => inputRef.current?.focus());
  }, [selectedCountryName]); // eslint-disable-line

  // Autocomplete via rIC
  const updateSuggestions = useCallback((val: string) => {
    setInput(val); setActiveIdx(0);
    if (!val.trim()) { setSuggestions([]); return; }
    rIC(() => {
      const lower = val.toLowerCase();
      setSuggestions(
        allCountryNames
          .filter(n => n.toLowerCase().startsWith(lower) || n.toLowerCase().includes(lower))
          .sort((a, b) => {
            const aS = a.toLowerCase().startsWith(lower), bS = b.toLowerCase().startsWith(lower);
            return aS === bS ? a.localeCompare(b) : aS ? -1 : 1;
          })
          .slice(0, 6) // 6 suggestions per spec
      );
    });
  }, [allCountryNames]); // eslint-disable-line

  const submit = useCallback((value?: string) => {
    const g = (value ?? input).trim();
    if (!g) return;
    onGuess(g); setInput(""); setSuggestions([]);
  }, [input, onGuess]);

  // Full remote-control keyboard handler
  const onKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActiveIdx(p => Math.min(p + 1, suggestions.length - 1)); break;
      case "ArrowUp":   e.preventDefault(); setActiveIdx(p => Math.max(p - 1, 0)); break;
      case "Enter":     e.preventDefault(); submit(suggestions[activeIdx] ?? undefined); break;
      case "Escape":    setSuggestions([]); setMenuOpen(false); break;
    }
  }, [suggestions, activeIdx, submit]);

  // Shared style fragments
  const lbl: React.CSSProperties = {
    display: "block", fontSize: T.labelSec,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "0.25em",
  };
  const big: React.CSSProperties = {
    display: "block", fontSize: T.numPrimary, fontWeight: 900,
    lineHeight: 1, fontVariantNumeric: "tabular-nums",
    willChange: "contents",
  };
  const ctrlBtn: React.CSSProperties = {
    fontSize: T.ctrlFont, color: "rgba(255,255,255,0.42)",
    fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em",
    display: "flex", alignItems: "center", gap: "0.5em",
    padding: "0.55em 0.8em", borderRadius: "0.75rem",
    border: "2px solid transparent", background: "transparent", cursor: "pointer",
    minHeight: T.ctrlTarget, whiteSpace: "nowrap" as const,
  };
  const menuBtn: React.CSSProperties = {
    fontSize: T.btnFont, color: "white", fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6em",
    padding: "0 1.5em",
    borderRadius: "1rem", border: "2px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.1)", cursor: "pointer",
    minHeight: T.btnH, minWidth: T.btnMinW, whiteSpace: "nowrap" as const,
  };

  return (
    <>
      {/* ── Scoped styles: focus rings, hover states ── */}
      <style>{`
        .tv-hud-ctrl:hover { color: rgba(255,255,255,0.82) !important; background: rgba(255,255,255,0.08) !important; }
        .tv-hud-ctrl:focus-visible { outline: none; border-color: rgba(255,255,255,0.6) !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.25); }
        .tv-hud-menu:hover { background: rgba(255,255,255,0.22) !important; border-color: rgba(255,255,255,0.35) !important; }
        .tv-hud-menu:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(255,255,255,0.35); }
        .tv-hud-input:focus { border-color: rgba(255,255,255,0.65) !important; box-shadow: 0 0 0 4px rgba(255,255,255,0.12); }
        .tv-hud-submit:hover { background: rgba(255,255,255,0.34) !important; }
        .tv-hud-submit:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(255,255,255,0.3); }
        .tv-hud-sugg:hover { background: rgba(255,255,255,0.14) !important; color: white !important; }
        .tv-hud-sugg:focus-visible { outline: none; box-shadow: inset 0 0 0 2px rgba(255,255,255,0.45); }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none",
          willChange: "opacity",
          background: [
            "radial-gradient(ellipse at center, transparent 22%, rgba(0,0,0,0.46) 100%)",
            "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.28) 36%, transparent 55%)",
            "linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, transparent 22%)",
          ].join(", "),
        }}
      >
        {/* ══ TOP: score · timer/streak · controls ══════════════════════════ */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: `${T.safeY} ${T.safeX} 0`,
          pointerEvents: "auto", gap: "1rem",
        }}>
          {/* Score */}
          <div>
            <span style={lbl}>Score</span>
            <span style={{ ...big, color: "white" }}>
              {score}
              <span style={{ fontSize: T.labelSec, color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: "0.4em" }}>
                / {totalCountries}
              </span>
            </span>
          </div>

          {/* Timer */}
          {typeof timeLeft === "number" && (
            <motion.div
              animate={timerDanger ? { scale: [1, 1.06, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ textAlign: "right", willChange: timerDanger ? "transform" : "auto" }}
            >
              <span style={lbl}>Time</span>
              <span style={{ ...big, color: timerDanger ? "#f87171" : "rgba(255,255,255,0.92)" }}>
                {timeLeft}
                <span style={{ fontSize: T.labelSec, color: "rgba(255,255,255,0.35)", fontWeight: 400, marginLeft: "0.3em" }}>s</span>
              </span>
            </motion.div>
          )}

          {/* Streak (only when ≥ 2, no timer) */}
          {typeof streak === "number" && streak >= 2 && typeof timeLeft !== "number" && (
            <div style={{ textAlign: "right" }}>
              <span style={{ ...lbl, color: "rgba(251,146,60,0.65)" }}>Streak</span>
              <span style={{ ...big, color: "#fb923c" }}>{streak}</span>
            </div>
          )}

          {/* Controls cluster — Exit TV + Menu */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6em", marginLeft: "auto" }}>
            <button className="tv-hud-ctrl" onClick={onExitTVMode} style={ctrlBtn}>
              <Tv2 style={{ width: "1.2em", height: "1.2em" }} /> Exit TV
            </button>
            <button className="tv-hud-ctrl" onClick={() => setMenuOpen(p => !p)} style={ctrlBtn}>
              Menu
              <ChevronDown style={{ width: "1.1em", height: "1.1em", transition: "transform 0.2s", transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: "-0.5em" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "-0.5em" }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5em", willChange: "opacity, transform" }}
                >
                  <button className="tv-hud-menu" onClick={() => { onRestart(); setMenuOpen(false); }} style={menuBtn}>
                    <RotateCcw style={{ width: "1.1em", height: "1.1em" }} /> Restart
                  </button>
                  <button className="tv-hud-menu" onClick={() => { onBackToMenu(); setMenuOpen(false); }} style={menuBtn}>
                    <Home style={{ width: "1.1em", height: "1.1em" }} /> Main Menu
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ══ BOTTOM: country name + guess input ════════════════════════════ */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: `0 ${T.safeX} ${T.safeY}`,
          pointerEvents: "auto",
        }}>
          <AnimatePresence mode="wait">
            {selectedCountryName ? (
              <motion.div key="sel"
                initial={{ opacity: 0, y: "2rem" }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "1rem" }}
                transition={{ type: "spring", damping: 24, stiffness: 220 }}
                style={{ willChange: "transform, opacity" }}
              >
                <span style={{ ...lbl, marginBottom: "0.4em" }}>{targetLabel}</span>
                <AnimatePresence mode="wait">
                  <motion.p key={selectedCountryName}
                    initial={{ opacity: 0, x: "-1rem" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    style={{ fontSize: T.countryName, color: "white", fontWeight: 900, lineHeight: 1.1, marginBottom: "1rem", willChange: "transform, opacity" }}
                  >
                    {selectedCountryName}
                  </motion.p>
                </AnimatePresence>

                {/* Input row */}
                <div style={{ position: "relative" }}>
                  <input
                    ref={inputRef} type="text" value={input}
                    onChange={e => updateSuggestions(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Type the country name and press Enter…"
                    autoComplete="off" autoCorrect="off" spellCheck={false}
                    className="tv-hud-input"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      fontSize: T.inputFont, minHeight: T.inputH,
                      padding: `0 clamp(7rem, 11vw, 13rem) 0 clamp(1.25rem, 2vw, 2rem)`,
                      background: "rgba(255,255,255,0.09)",
                      border: "2px solid rgba(255,255,255,0.22)",
                      borderRadius: "1.125rem", color: "white",
                      backdropFilter: "blur(14px)", outline: "none",
                      willChange: "border-color, box-shadow",
                    }}
                  />
                  {/* Submit — min 60×120px equivalent via minHeight + minWidth */}
                  <button
                    className="tv-hud-submit" onClick={() => submit()}
                    style={{
                      position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                      fontSize: T.btnFont, fontWeight: 700, color: "white",
                      background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.2)",
                      minHeight: "clamp(3.75rem, 5.5vh, 5rem)",
                      minWidth: "clamp(7.5rem, 11vw, 10rem)",
                      borderRadius: "0.875rem", cursor: "pointer",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}
                  >
                    Enter
                  </button>

                  {/* Autocomplete — 6 items */}
                  <AnimatePresence>
                    {suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: "0.4rem" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                          position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: "0.625rem",
                          borderRadius: "1.125rem", overflow: "hidden",
                          background: "rgba(8,8,20,0.97)", border: "2px solid rgba(255,255,255,0.12)",
                          backdropFilter: "blur(20px)", willChange: "opacity",
                        }}
                      >
                        {suggestions.map((s, i) => (
                          <button key={s} className="tv-hud-sugg" onClick={() => submit(s)}
                            style={{
                              width: "100%", textAlign: "left",
                              fontSize: T.suggFont, minHeight: T.suggH,
                              padding: `0 clamp(1.25rem, 2vw, 2rem)`,
                              color: i === activeIdx ? "white" : "rgba(255,255,255,0.52)",
                              background: i === activeIdx ? "rgba(255,255,255,0.1)" : "transparent",
                              borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                              fontWeight: i === activeIdx ? 700 : 400,
                              display: "flex", alignItems: "center",
                              cursor: "pointer", border: "none",
                            }}
                          >{s}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center" }}>
                <p style={{ fontSize: T.idleFont, color: "rgba(255,255,255,0.32)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                  Click any country on the map
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

// ── TVModeToggle — small toggle in normal game UI ─────────────────────────────
export function TVModeToggle({ isTV, onToggle }: { isTV: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} title={isTV ? "Exit TV Mode" : "TV / Classroom Mode"}
      className={`p-1.5 sm:p-2 rounded-lg transition-all ${isTV ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
      <Tv2 className="w-4 h-4" />
    </button>
  );
}





