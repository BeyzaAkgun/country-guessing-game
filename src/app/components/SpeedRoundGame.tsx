// SpeedRoundGame.tsx - Speed Round Mode: Find as many countries as possible before time runs out
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import WorldMap from "@/app/components/WorldMap";
import { GameControls } from "@/app/components/GameControls";
import { useCountryData } from "@/app/hooks/useCountryData";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";
import { ClassroomHUD } from "@/app/components/ClassroomHUD";
import { toast, Toaster } from "sonner";
import { Loader2, Timer, Trophy, Zap, RotateCcw, Home, Star } from "lucide-react";
import { soundEffects } from "@/app/utils/soundEffects";

interface SpeedRoundGameProps {
  onBackToMenu: () => void;
  duration?: number; // seconds, default 60
}

type Phase = "lobby" | "playing" | "finished";

// Personal best storage key per duration
const pbKey = (d: number) => `speedRound_pb_${d}`;

function loadPB(duration: number): number {
  try {
    return parseInt(localStorage.getItem(pbKey(duration)) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function savePB(duration: number, score: number) {
  try {
    const current = loadPB(duration);
    if (score > current) localStorage.setItem(pbKey(duration), String(score));
  } catch {}
}

// Colour band for the timer bar
function timerColour(ratio: number) {
  if (ratio > 0.5) return "from-green-400 to-emerald-500";
  if (ratio > 0.25) return "from-yellow-400 to-orange-400";
  return "from-red-500 to-rose-600";
}

// Duration options (seconds)
const DURATION_OPTIONS = [
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "120s", value: 120 },
];

export function SpeedRoundGame({ onBackToMenu }: SpeedRoundGameProps) {
  const { countries, loading } = useCountryData();
  const { config, toggleTVMode } = useDisplayMode();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("lobby");
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ── Game state ────────────────────────────────────────────────────────────
  const [correctCountries, setCorrectCountries] = useState<string[]>([]);
  const [wrongCountries, setWrongCountries] = useState<string[]>([]);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [isNewPB, setIsNewPB] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allCountryNames = useMemo(
    () => countries.map((c) => c.properties.name),
    [countries]
  );

  // Load PB whenever duration changes
  useEffect(() => {
    setPersonalBest(loadPB(selectedDuration));
  }, [selectedDuration]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          endGame();
          return 0;
        }
        // Warning sounds
        if (prev === 11 || prev === 6) {
          if (soundEnabled) soundEffects.playClick();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const endGame = useCallback(() => {
    setPhase("finished");
    setSelectedCountryName(null);
    setScore((s) => {
      const pb = loadPB(selectedDuration);
      if (s > pb) {
        savePB(selectedDuration, s);
        setPersonalBest(s);
        setIsNewPB(true);
        if (soundEnabled) soundEffects.playAchievement();
      } else {
        setPersonalBest(pb);
        setIsNewPB(false);
      }
      return s;
    });
  }, [selectedDuration, soundEnabled]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const startGame = () => {
    setCorrectCountries([]);
    setWrongCountries([]);
    setSelectedCountryName(null);
    setScore(0);
    setIsNewPB(false);
    setTimeLeft(selectedDuration);
    setPhase("playing");
  };

  const handleCountryClick = (geo: any) => {
    if (phase !== "playing") return;
    const name = geo.properties.name || geo.name;
    if (correctCountries.includes(name)) {
      toast.info(`Already found ${name}!`, { duration: 1200 });
      return;
    }
    if (soundEnabled) soundEffects.playClick();
    setSelectedCountryName(name);
  };

  const handleGuess = (guess: string) => {
    if (!selectedCountryName || phase !== "playing") return;

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedSelected = selectedCountryName.toLowerCase().trim();

    if (normalizedGuess !== normalizedSelected) {
      if (soundEnabled) soundEffects.playWrong();
      toast.error("Guess doesn't match selected country!", { duration: 1000 });
      return;
    }

    // Correct!
    if (soundEnabled) soundEffects.playCorrect();
    toast.success(`✓ ${selectedCountryName}`, {
      duration: 900,
      className: "bg-green-50 text-green-800 border-green-200",
    });

    setCorrectCountries((prev) => [...prev, selectedCountryName]);
    setScore((prev) => prev + 1);
    setSelectedCountryName(null);
  };

  const handleWrongCountryClick = (name: string) => {
    // Mark as wrong (red) briefly but don't block
    if (!wrongCountries.includes(name)) {
      setWrongCountries((prev) => [...prev, name]);
      setTimeout(() => {
        setWrongCountries((prev) => prev.filter((c) => c !== name));
      }, 1000);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const timerRatio = timeLeft / selectedDuration;
  const progressPercent = (score / allCountryNames.length) * 100;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
          <p className="text-muted-foreground font-medium">Loading World Map...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOBBY
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "lobby") {
    return (
      <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
        {/* Dim map in background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <WorldMap
            countries={countries}
            onCountryClick={() => {}}
            correctCountries={[]}
            wrongCountries={[]}
          />
        </div>

        {/* Lobby card */}
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20"
          >
            {/* Icon + Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg mb-4">
                <Zap className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                Speed Round
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Find as many countries as you can before time runs out!
              </p>
            </div>

            {/* How to play */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 space-y-2">
              {[
                "⏱️  Clock starts the moment you press Start",
                "🗺️  Click a country → type its name → confirm",
                "✅  Every correct country = +1 point",
                "🏆  Beat your personal best to set a new record",
              ].map((line) => (
                <p key={line} className="text-xs text-slate-600 dark:text-slate-300">
                  {line}
                </p>
              ))}
            </div>

            {/* Duration picker */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Time Limit
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedDuration(value)}
                    className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                      selectedDuration === value
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md scale-105"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Best */}
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl px-4 py-3 mb-6">
              <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold">
                  Personal Best ({selectedDuration}s)
                </p>
                <p className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
                  {loadPB(selectedDuration)} countries
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onBackToMenu}
                className="flex-none px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Menu
              </button>
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-base"
              >
                <Zap className="w-5 h-5" />
                Start!
              </button>
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => {
                const s = soundEffects.toggle();
                setSoundEnabled(s);
              }}
              className="mt-3 w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Sound: {soundEnabled ? "🔊 On" : "🔇 Off"}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FINISHED
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "finished") {
    const pb = loadPB(selectedDuration);
    const accuracy =
      correctCountries.length + wrongCountries.length > 0
        ? Math.round(
            (correctCountries.length /
              (correctCountries.length + wrongCountries.length)) *
              100
          )
        : 0;

    return (
      <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
        {/* Dimmed map */}
        <div className="absolute inset-0 z-0 opacity-30">
          <WorldMap
            countries={countries}
            onCountryClick={() => {}}
            correctCountries={correctCountries}
            wrongCountries={[]}
          />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20"
          >
            {/* Header */}
            <div className="text-center mb-6">
              {isNewPB ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg mb-3"
                  >
                    <Star className="w-9 h-9 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    New Personal Best! 🎉
                  </h2>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-3">
                    <Timer className="w-9 h-9 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Time's Up!
                  </h2>
                </>
              )}
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {selectedDuration}s round complete
              </p>
            </div>

            {/* Big score */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-2xl p-5 text-center mb-4">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-1">
                Countries Found
              </p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.15 }}
                className="text-6xl font-black text-yellow-600 dark:text-yellow-400"
              >
                {score}
              </motion.p>
              <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                out of {allCountryNames.length} total
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {score}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Correct</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {pb}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Best</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {score > 0
                    ? Math.round((score / selectedDuration) * 10) / 10
                    : 0}
                  /s
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Rate</p>
              </div>
            </div>

            {/* Countries found list (collapsed if long) */}
            {score > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 mb-6 max-h-28 overflow-y-auto">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Countries you found
                </p>
                <div className="flex flex-wrap gap-1">
                  {correctCountries.map((c) => (
                    <span
                      key={c}
                      className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onBackToMenu}
                className="flex-none px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Menu
              </button>
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYING
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Toaster position="top-center" />

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <WorldMap
          countries={countries}
          onCountryClick={handleCountryClick}
          selectedCountryName={selectedCountryName}
          correctCountries={correctCountries}
          wrongCountries={wrongCountries}
        />
      </div>

      {/* ── Top HUD — hidden in TV mode ── */}
      {!config.isTV && <div className="absolute top-4 left-0 right-0 z-50 px-4">
        <div className="flex justify-center">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-xl rounded-2xl border border-white/30 px-4 py-3 w-full max-w-xl"
          >
            {/* Row 1: score + timer number + buttons */}
            <div className="flex items-center justify-between gap-3 mb-2">
              {/* Score */}
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {score}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  / {allCountryNames.length}
                </span>
              </div>

              {/* Countdown */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-2xl tabular-nums ${
                  timerRatio <= 0.25
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                    : timerRatio <= 0.5
                    ? "text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                    : "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                }`}
              >
                <Timer className="w-5 h-5" />
                {timeLeft}s
              </div>

              {/* Quit */}
              <button
                onClick={() => {
                  if (window.confirm("Quit this round? Your score will be lost.")) {
                    setPhase("lobby");
                    setSelectedCountryName(null);
                  }
                }}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                Quit
              </button>
            </div>

            {/* Row 2: Timer progress bar */}
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${timerRatio * 100}%` }}
                transition={{ duration: 0.5, ease: "linear" }}
                className={`h-full rounded-full bg-gradient-to-r ${timerColour(timerRatio)}`}
              />
            </div>
          </motion.div>
        </div>
      </div>
      }

      {/* ── Normal guess panel + hint — hidden in TV mode ── */}
      {!config.isTV && (
        <>
          <AnimatePresence>
            {selectedCountryName && (
              <motion.div
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[460px] z-40"
              >
                <GuessPanel selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
                  onGuess={handleGuess} onDismiss={() => setSelectedCountryName(null)} />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!selectedCountryName && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
                <div className="bg-black/80 text-white px-5 py-2.5 rounded-full backdrop-blur-sm text-sm font-medium shadow-2xl">
                  👆 Tap any country to name it
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── TV Classroom HUD ── */}
      <AnimatePresence>
        {config.isTV && (
          <ClassroomHUD
            score={score} totalCountries={allCountryNames.length}
            selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
            onGuess={handleGuess} onExitTVMode={toggleTVMode}
            onBackToMenu={onBackToMenu}
            onRestart={() => { setPhase("lobby"); setSelectedCountryName(null); }}
            timeLeft={timeLeft} mode="speed-round"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline guess panel (lightweight, no hints/restart needed for speed round)
// ─────────────────────────────────────────────────────────────────────────────
interface GuessPanelProps {
  selectedCountryName: string;
  allCountryNames: string[];
  onGuess: (name: string) => void;
  onDismiss: () => void;
}

function GuessPanel({ selectedCountryName, allCountryNames, onGuess, onDismiss }: GuessPanelProps) {
  const [input, setInput] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setInput("");
    setShowSuggestions(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [selectedCountryName]);

  const filtered = React.useMemo(() => {
    if (!input) return [];
    return allCountryNames
      .filter(
        (n) =>
          n.toLowerCase().startsWith(input.toLowerCase()) ||
          n.toLowerCase().includes(input.toLowerCase())
      )
      .sort((a, b) => {
        const aS = a.toLowerCase().startsWith(input.toLowerCase());
        const bS = b.toLowerCase().startsWith(input.toLowerCase());
        if (aS && !bS) return -1;
        if (!aS && bS) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 8);
  }, [input, allCountryNames]);

  const submit = (val?: string) => {
    const v = (val ?? input).trim();
    if (!v) return;
    onGuess(v);
    setInput("");
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Selected country
        </p>
        <button
          onClick={onDismiss}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          ✕ Dismiss
        </button>
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type country name..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-4 pr-12 text-base focus:ring-2 focus:ring-yellow-400/60 outline-none transition-all"
            autoFocus
          />
          <button
            onClick={() => submit()}
            className="absolute right-2 p-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>

        {/* Suggestions */}
        {showSuggestions && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-border/50 overflow-hidden max-h-[200px] overflow-y-auto z-50"
          >
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setInput(s);
                  submit(s);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-border/30 last:border-0 transition-colors text-sm font-medium truncate"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}