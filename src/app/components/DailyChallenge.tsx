// DailyChallenge.tsx - Daily 10-country challenge, same for everyone each day
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import WorldMap from "@/app/components/WorldMap";
import { GameControls } from "@/app/components/GameControls";
import { CountryFactCard } from "@/app/components/CountryFactCard";
import { useCountryData } from "@/app/hooks/useCountryData";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";
import { ClassroomHUD } from "@/app/components/ClassroomHUD";
import { toast, Toaster } from "sonner";
import {
  Loader2, Calendar, Share2, Trophy, CheckCircle2,
  XCircle, Clock, Home, RotateCcw, Star,
} from "lucide-react";
import { soundEffects } from "@/app/utils/soundEffects";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DailyChallengeProps {
  onBackToMenu: () => void;
}

interface DailyResult {
  date: string;       // "YYYY-MM-DD"
  score: number;
  totalTime: number;  // seconds
  results: ("correct" | "wrong" | "skipped")[];
  countryNames: string[];
  completed: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CHALLENGE_SIZE = 10;
const STORAGE_KEY = "dailyChallenge_result";
const STREAK_KEY = "dailyChallenge_streak";

function todayString(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// Deterministic seeded RNG (mulberry32)
function seededRng(seed: number) {
  return function () {
    seed |= 0;
    seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Convert "YYYY-MM-DD" to a stable integer seed
function dateToSeed(dateStr: string): number {
  return dateStr.split("-").reduce((acc, part, i) => acc + parseInt(part) * [10000, 100, 1][i], 0);
}

// Pick N unique countries from list using seeded rng
function pickDailyCountries(allNames: string[], date: string, n: number): string[] {
  const rng = seededRng(dateToSeed(date));
  const pool = [...allNames];
  const result: string[] = [];
  while (result.length < n && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function loadResult(): DailyResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: DailyResult = JSON.parse(raw);
    if (parsed.date !== todayString()) return null;
    return parsed;
  } catch { return null; }
}

function saveResult(r: DailyResult) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); } catch {}
}

function loadStreak(): number {
  try { return parseInt(localStorage.getItem(STREAK_KEY) || "0", 10) || 0; } catch { return 0; }
}

function updateStreak(won: boolean): number {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  try {
    const lastKey = "dailyChallenge_lastDate";
    const lastDate = localStorage.getItem(lastKey);
    let streak = loadStreak();
    if (won) {
      streak = lastDate === yStr ? streak + 1 : 1;
      localStorage.setItem(lastKey, todayString());
      localStorage.setItem(STREAK_KEY, String(streak));
    }
    return streak;
  } catch { return 0; }
}

// Generate shareable emoji grid
function buildShareText(result: DailyResult): string {
  const emojiMap = { correct: "🟩", wrong: "🟥", skipped: "⬜" } as const;
  const grid = result.results.map((r) => emojiMap[r]).join("");
  return (
    `🌍 Geography Daily Challenge — ${result.date}\n` +
    `Score: ${result.score}/${CHALLENGE_SIZE} | Time: ${formatTime(result.totalTime)}\n\n` +
    `${grid}\n\n` +
    `Play at: Geography Master 🗺️`
  );
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DailyChallenge({ onBackToMenu }: DailyChallengeProps) {
  const { countries, loading } = useCountryData();
  const { config, toggleTVMode } = useDisplayMode();

  // Game phases: lobby → playing → finished
  const [phase, setPhase] = useState<"lobby" | "playing" | "finished">("lobby");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Challenge state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<("correct" | "wrong" | "skipped")[]>([]);
  const [score, setScore] = useState(0);
  const [correctCountries, setCorrectCountries] = useState<string[]>([]);
  const [wrongCountries, setWrongCountries] = useState<string[]>([]);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [streak, setStreak] = useState(loadStreak);
  const [factCardCountry, setFactCardCountry] = useState<string | null>(null);

  // Saved result (if already played today)
  const [savedResult, setSavedResult] = useState<DailyResult | null>(() => loadResult());

  const allCountryNames = useMemo(() => countries.map((c) => c.properties.name), [countries]);
  const today = todayString();

  const dailyCountries = useMemo(
    () => (allCountryNames.length > 0 ? pickDailyCountries(allCountryNames, today, CHALLENGE_SIZE) : []),
    [allCountryNames, today]
  );

  const currentTarget = dailyCountries[currentIndex] ?? null;

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const startChallenge = () => {
    setPhase("playing");
    setTimerActive(true);
    setCurrentIndex(0);
    setResults([]);
    setScore(0);
    setCorrectCountries([]);
    setWrongCountries([]);
    setSelectedCountryName(null);
    setElapsedSeconds(0);
  };

  const advanceRound = useCallback(
    (outcome: "correct" | "wrong" | "skipped", countryName: string) => {
      const newResults = [...results, outcome];
      const newScore = outcome === "correct" ? score + 1 : score;

      setResults(newResults);
      setScore(newScore);

      if (newResults.length >= CHALLENGE_SIZE) {
        // Challenge complete
        setTimerActive(false);
        setSelectedCountryName(null);
        const finalResult: DailyResult = {
          date: today,
          score: newScore,
          totalTime: elapsedSeconds,
          results: newResults,
          countryNames: dailyCountries,
          completed: true,
        };
        saveResult(finalResult);
        setSavedResult(finalResult);
        const newStreak = updateStreak(newScore >= Math.ceil(CHALLENGE_SIZE / 2));
        setStreak(newStreak);
        if (soundEnabled) soundEffects.playAchievement();
        setPhase("finished");
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedCountryName(null);
        // Remove from wrong list after moving on
        setWrongCountries((w) => w.filter((c) => c !== countryName));
      }
    },
    [results, score, today, elapsedSeconds, dailyCountries, soundEnabled]
  );

  const handleCountryClick = (geo: any) => {
    if (phase !== "playing") return;
    const name = geo.properties.name || geo.name;
    if (correctCountries.includes(name)) {
      toast.info(`Already found ${name}!`, { duration: 1000 });
      return;
    }
    if (soundEnabled) soundEffects.playClick();
    setSelectedCountryName(name);
  };

  const handleGuess = (guess: string) => {
    if (!selectedCountryName || !currentTarget || phase !== "playing") return;

    const normGuess = guess.toLowerCase().trim();
    const normSelected = selectedCountryName.toLowerCase().trim();
    const normTarget = currentTarget.toLowerCase().trim();

    if (normGuess !== normSelected) {
      toast.error("Guess doesn't match selected country!", { duration: 900 });
      return;
    }

    if (normGuess === normTarget) {
      if (soundEnabled) soundEffects.playCorrect();
      toast.success(`✓ ${currentTarget}`, {
        duration: 1200,
        className: "bg-green-50 text-green-800 border-green-200",
      });
      setCorrectCountries((prev) => [...prev, currentTarget]);
      setFactCardCountry(currentTarget);
      setTimeout(() => advanceRound("correct", currentTarget), 1400);
    } else {
      if (soundEnabled) soundEffects.playWrong();
      toast.error(`Wrong — that's ${selectedCountryName}`, { duration: 1500 });
      if (!wrongCountries.includes(selectedCountryName)) {
        setWrongCountries((w) => [...w, selectedCountryName]);
        setTimeout(() => setWrongCountries((w) => w.filter((c) => c !== selectedCountryName)), 1200);
      }
      advanceRound("wrong", selectedCountryName);
    }
  };

  const handleSkip = () => {
    if (!currentTarget || phase !== "playing") return;
    if (soundEnabled) soundEffects.playWrong();
    toast.info(`Skipped — it was ${currentTarget}`, { duration: 2000 });
    advanceRound("skipped", currentTarget);
  };

  const handleShare = () => {
    const text = buildShareText(savedResult!);
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() =>
        toast.success("Result copied to clipboard!", { duration: 2000 })
      );
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-muted-foreground font-medium">Loading Today's Challenge…</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOBBY (or already-played today)
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "lobby") {
    return (
      <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-35">
          <WorldMap countries={countries} onCountryClick={() => {}} correctCountries={[]} wrongCountries={[]} />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-white/20"
          >
            {/* Icon + title */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-3">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daily Challenge</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{today}</p>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl px-4 py-3 mb-5">
              <Star className="w-5 h-5 text-indigo-500" />
              <div className="text-center">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Current Streak</p>
                <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{streak} day{streak !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Already played today */}
            {savedResult ? (
              <>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 mb-5 text-center">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    Today's Result
                  </p>
                  <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                    {savedResult.score}/{CHALLENGE_SIZE}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    in {formatTime(savedResult.totalTime)}
                  </p>
                  {/* Mini emoji grid */}
                  <div className="flex justify-center gap-0.5 mt-3 text-xl">
                    {savedResult.results.map((r, i) => (
                      <span key={i}>{r === "correct" ? "🟩" : r === "wrong" ? "🟥" : "⬜"}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
                >
                  <Share2 className="w-4 h-4" />
                  Share Result
                </button>
                <p className="text-center text-xs text-slate-400 mb-3">
                  Come back tomorrow for a new challenge!
                </p>
              </>
            ) : (
              <>
                {/* How to play */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-5 space-y-1.5">
                  {[
                    `📍 ${CHALLENGE_SIZE} countries — one at a time`,
                    "🗺️  Click the country on the map",
                    "⏩  Skip if you're not sure",
                    "📊  Same challenge for everyone today",
                  ].map((l) => (
                    <p key={l} className="text-xs text-slate-600 dark:text-slate-300">{l}</p>
                  ))}
                </div>
                <button
                  onClick={startChallenge}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
                >
                  <Calendar className="w-5 h-5" />
                  Start Today's Challenge
                </button>
              </>
            )}

            <button
              onClick={onBackToMenu}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Menu
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FINISHED
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "finished" && savedResult) {
    const pct = Math.round((savedResult.score / CHALLENGE_SIZE) * 100);
    const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🌟" : pct >= 40 ? "👍" : "💪";

    return (
      <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-25">
          <WorldMap countries={countries} onCountryClick={() => {}} correctCountries={correctCountries} wrongCountries={[]} />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-white/20 my-4"
          >
            {/* Header */}
            <div className="text-center mb-5">
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-5xl mb-2"
              >
                {emoji}
              </motion.p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Challenge Complete!</h2>
              <p className="text-xs text-slate-400 mt-1">{today}</p>
            </div>

            {/* Score */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl p-4 text-center mb-4">
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Your Score</p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.15 }}
                className="text-5xl font-black text-indigo-600 dark:text-indigo-400"
              >
                {savedResult.score}<span className="text-2xl text-indigo-400">/{CHALLENGE_SIZE}</span>
              </motion.p>
              <p className="text-xs text-indigo-500 mt-1">{formatTime(savedResult.totalTime)} • {pct}%</p>
            </div>

            {/* Emoji grid */}
            <div className="flex justify-center gap-1 text-2xl mb-4">
              {savedResult.results.map((r, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.05 * i, type: "spring" }}
                >
                  {r === "correct" ? "🟩" : r === "wrong" ? "🟥" : "⬜"}
                </motion.span>
              ))}
            </div>

            {/* Per-country breakdown */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 mb-4 space-y-1.5 max-h-44 overflow-y-auto">
              {savedResult.countryNames.map((name, i) => {
                const r = savedResult.results[i];
                const Icon = r === "correct" ? CheckCircle2 : r === "wrong" ? XCircle : Clock;
                const col = r === "correct"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : r === "wrong"
                  ? "text-red-500 dark:text-red-400"
                  : "text-slate-400";
                return (
                  <div key={name} className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${col}`} />
                    <p className={`text-xs font-medium ${col}`}>{name}</p>
                  </div>
                );
              })}
            </div>

            {/* Streak */}
            <div className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl px-3 py-2 mb-4">
              <Star className="w-4 h-4 text-indigo-500" />
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {streak} day streak — come back tomorrow!
              </p>
            </div>

            {/* Buttons */}
            <button
              onClick={handleShare}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-2"
            >
              <Share2 className="w-4 h-4" />
              Share Result
            </button>
            <button
              onClick={onBackToMenu}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Menu
            </button>
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
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-xl rounded-2xl border border-white/30 px-4 py-3 w-full max-w-lg"
          >
            <div className="flex items-center justify-between gap-3 mb-2.5">
              {/* Progress */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentIndex + 1}
                  <span className="text-slate-400 font-normal">/{CHALLENGE_SIZE}</span>
                </span>
              </div>

              {/* Country target name */}
              <div className="flex-1 text-center">
                <p className="text-xs text-slate-400 font-medium">Find this country</p>
                <p className="text-base font-black text-indigo-600 dark:text-indigo-400 leading-tight truncate">
                  {currentTarget}
                </p>
              </div>

              {/* Timer + skip */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(elapsedSeconds)}
                </div>
                <button
                  onClick={handleSkip}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-semibold transition-all active:scale-95"
                >
                  Skip
                </button>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1">
              {dailyCountries.map((_, i) => {
                const r = results[i];
                return (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      r === "correct"
                        ? "bg-emerald-500"
                        : r === "wrong"
                        ? "bg-red-400"
                        : r === "skipped"
                        ? "bg-slate-300 dark:bg-slate-600"
                        : i === currentIndex
                        ? "bg-indigo-400 animate-pulse"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                );
              })}
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
                <DailyGuessPanel selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
                  onGuess={handleGuess} onDismiss={() => setSelectedCountryName(null)} />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!selectedCountryName && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
                <div className="bg-black/80 text-white px-5 py-2.5 rounded-full backdrop-blur-sm text-sm font-medium shadow-2xl">
                  👆 Find <span className="font-bold text-indigo-300">{currentTarget}</span> on the map
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
            score={score} totalCountries={CHALLENGE_SIZE}
            selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
            onGuess={handleGuess} onExitTVMode={toggleTVMode}
            onBackToMenu={onBackToMenu}
            onRestart={() => { setPhase("lobby"); setSelectedCountryName(null); }}
            targetLabel="Find this country" mode="daily-challenge"
          />
        )}
      </AnimatePresence>

      {/* Fact card */}
      <CountryFactCard countryName={factCardCountry} onClose={() => setFactCardCountry(null)} autoCloseDuration={4000} />
    </div>
  );
}

// ─── Inline guess panel for daily challenge ────────────────────────────────────
interface DailyGuessPanelProps {
  selectedCountryName: string;
  allCountryNames: string[];
  onGuess: (name: string) => void;
  onDismiss: () => void;
}

function DailyGuessPanel({ selectedCountryName, allCountryNames, onGuess, onDismiss }: DailyGuessPanelProps) {
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
      .filter((n) => n.toLowerCase().startsWith(input.toLowerCase()) || n.toLowerCase().includes(input.toLowerCase()))
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
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Is this <span className="text-indigo-500 font-bold">{selectedCountryName}</span>?
        </p>
        <button onClick={onDismiss} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">✕</button>
      </div>
      <div className="relative">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Confirm country name…"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-4 pr-12 text-base focus:ring-2 focus:ring-indigo-400/60 outline-none transition-all"
            autoFocus
          />
          <button
            onClick={() => submit()}
            className="absolute right-2 p-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
        {showSuggestions && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-border/50 overflow-hidden max-h-48 overflow-y-auto z-50"
          >
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setInput(s); submit(s); setShowSuggestions(false); }}
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