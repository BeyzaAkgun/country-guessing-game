// // DailyChallenge.tsx - Daily 10-country challenge, same for everyone each day
// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { AnimatePresence, motion } from "motion/react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { CountryFactCard } from "@/app/components/CountryFactCard";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { useDisplayMode } from "@/app/hooks/useDisplayMode";
// import { ClassroomHUD } from "@/app/components/ClassroomHUD";
// import { toast, Toaster } from "sonner";
// import {
//   Loader2, Calendar, Share2, Trophy, CheckCircle2,
//   XCircle, Clock, Home, RotateCcw, Star,
// } from "lucide-react";
// import { soundEffects } from "@/app/utils/soundEffects";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface DailyChallengeProps {
//   onBackToMenu: () => void;
// }

// interface DailyResult {
//   date: string;       // "YYYY-MM-DD"
//   score: number;
//   totalTime: number;  // seconds
//   results: ("correct" | "wrong" | "skipped")[];
//   countryNames: string[];
//   completed: boolean;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const CHALLENGE_SIZE = 10;
// const STORAGE_KEY = "dailyChallenge_result";
// const STREAK_KEY = "dailyChallenge_streak";

// function todayString(): string {
//   return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
// }

// // Deterministic seeded RNG (mulberry32)
// function seededRng(seed: number) {
//   return function () {
//     seed |= 0;
//     seed = seed + 0x6d2b79f5 | 0;
//     let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
//     t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
//     return ((t ^ t >>> 14) >>> 0) / 4294967296;
//   };
// }

// // Convert "YYYY-MM-DD" to a stable integer seed
// function dateToSeed(dateStr: string): number {
//   return dateStr.split("-").reduce((acc, part, i) => acc + parseInt(part) * [10000, 100, 1][i], 0);
// }

// // Pick N unique countries from list using seeded rng
// function pickDailyCountries(allNames: string[], date: string, n: number): string[] {
//   const rng = seededRng(dateToSeed(date));
//   const pool = [...allNames];
//   const result: string[] = [];
//   while (result.length < n && pool.length > 0) {
//     const idx = Math.floor(rng() * pool.length);
//     result.push(pool.splice(idx, 1)[0]);
//   }
//   return result;
// }

// function loadResult(): DailyResult | null {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (!raw) return null;
//     const parsed: DailyResult = JSON.parse(raw);
//     if (parsed.date !== todayString()) return null;
//     return parsed;
//   } catch { return null; }
// }

// function saveResult(r: DailyResult) {
//   try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); } catch {}
// }

// function loadStreak(): number {
//   try { return parseInt(localStorage.getItem(STREAK_KEY) || "0", 10) || 0; } catch { return 0; }
// }

// function updateStreak(won: boolean): number {
//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 1);
//   const yStr = yesterday.toISOString().slice(0, 10);
//   try {
//     const lastKey = "dailyChallenge_lastDate";
//     const lastDate = localStorage.getItem(lastKey);
//     let streak = loadStreak();
//     if (won) {
//       streak = lastDate === yStr ? streak + 1 : 1;
//       localStorage.setItem(lastKey, todayString());
//       localStorage.setItem(STREAK_KEY, String(streak));
//     }
//     return streak;
//   } catch { return 0; }
// }

// // Generate shareable emoji grid
// function buildShareText(result: DailyResult): string {
//   const emojiMap = { correct: "🟩", wrong: "🟥", skipped: "⬜" } as const;
//   const grid = result.results.map((r) => emojiMap[r]).join("");
//   return (
//     `🌍 Geography Daily Challenge — ${result.date}\n` +
//     `Score: ${result.score}/${CHALLENGE_SIZE} | Time: ${formatTime(result.totalTime)}\n\n` +
//     `${grid}\n\n` +
//     `Play at: Geography Master 🗺️`
//   );
// }

// function formatTime(secs: number): string {
//   const m = Math.floor(secs / 60);
//   const s = secs % 60;
//   return m > 0 ? `${m}m ${s}s` : `${s}s`;
// }

// // ─── Component ────────────────────────────────────────────────────────────────
// export function DailyChallenge({ onBackToMenu }: DailyChallengeProps) {
//   const { countries, loading } = useCountryData();
//   const { config, toggleTVMode } = useDisplayMode();

//   // Game phases: lobby → playing → finished
//   const [phase, setPhase] = useState<"lobby" | "playing" | "finished">("lobby");
//   const [soundEnabled, setSoundEnabled] = useState(true);

//   // Challenge state
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [results, setResults] = useState<("correct" | "wrong" | "skipped")[]>([]);
//   const [score, setScore] = useState(0);
//   const [correctCountries, setCorrectCountries] = useState<string[]>([]);
//   const [wrongCountries, setWrongCountries] = useState<string[]>([]);
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [elapsedSeconds, setElapsedSeconds] = useState(0);
//   const [timerActive, setTimerActive] = useState(false);
//   const [streak, setStreak] = useState(loadStreak);
//   const [factCardCountry, setFactCardCountry] = useState<string | null>(null);

//   // Saved result (if already played today)
//   const [savedResult, setSavedResult] = useState<DailyResult | null>(() => loadResult());

//   const allCountryNames = useMemo(() => countries.map((c) => c.properties.name), [countries]);
//   const today = todayString();

//   const dailyCountries = useMemo(
//     () => (allCountryNames.length > 0 ? pickDailyCountries(allCountryNames, today, CHALLENGE_SIZE) : []),
//     [allCountryNames, today]
//   );

//   const currentTarget = dailyCountries[currentIndex] ?? null;

//   // Timer
//   useEffect(() => {
//     if (!timerActive) return;
//     const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
//     return () => clearInterval(id);
//   }, [timerActive]);

//   // ── Actions ─────────────────────────────────────────────────────────────────
//   const startChallenge = () => {
//     setPhase("playing");
//     setTimerActive(true);
//     setCurrentIndex(0);
//     setResults([]);
//     setScore(0);
//     setCorrectCountries([]);
//     setWrongCountries([]);
//     setSelectedCountryName(null);
//     setElapsedSeconds(0);
//   };

//   const advanceRound = useCallback(
//     (outcome: "correct" | "wrong" | "skipped", countryName: string) => {
//       const newResults = [...results, outcome];
//       const newScore = outcome === "correct" ? score + 1 : score;

//       setResults(newResults);
//       setScore(newScore);

//       if (newResults.length >= CHALLENGE_SIZE) {
//         // Challenge complete
//         setTimerActive(false);
//         setSelectedCountryName(null);
//         const finalResult: DailyResult = {
//           date: today,
//           score: newScore,
//           totalTime: elapsedSeconds,
//           results: newResults,
//           countryNames: dailyCountries,
//           completed: true,
//         };
//         saveResult(finalResult);
//         setSavedResult(finalResult);
//         const newStreak = updateStreak(newScore >= Math.ceil(CHALLENGE_SIZE / 2));
//         setStreak(newStreak);
//         if (soundEnabled) soundEffects.playAchievement();
//         setPhase("finished");
//       } else {
//         setCurrentIndex((i) => i + 1);
//         setSelectedCountryName(null);
//         // Remove from wrong list after moving on
//         setWrongCountries((w) => w.filter((c) => c !== countryName));
//       }
//     },
//     [results, score, today, elapsedSeconds, dailyCountries, soundEnabled]
//   );

//   const handleCountryClick = (geo: any) => {
//     if (phase !== "playing") return;
//     const name = geo.properties.name || geo.name;
//     if (correctCountries.includes(name)) {
//       toast.info(`Already found ${name}!`, { duration: 1000 });
//       return;
//     }
//     if (soundEnabled) soundEffects.playClick();
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName || !currentTarget || phase !== "playing") return;

//     const normGuess = guess.toLowerCase().trim();
//     const normSelected = selectedCountryName.toLowerCase().trim();
//     const normTarget = currentTarget.toLowerCase().trim();

//     if (normGuess !== normSelected) {
//       toast.error("Guess doesn't match selected country!", { duration: 900 });
//       return;
//     }

//     if (normGuess === normTarget) {
//       if (soundEnabled) soundEffects.playCorrect();
//       toast.success(`✓ ${currentTarget}`, {
//         duration: 1200,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });
//       setCorrectCountries((prev) => [...prev, currentTarget]);
//       setFactCardCountry(currentTarget);
//       setTimeout(() => advanceRound("correct", currentTarget), 1400);
//     } else {
//       if (soundEnabled) soundEffects.playWrong();
//       toast.error(`Wrong — that's ${selectedCountryName}`, { duration: 1500 });
//       if (!wrongCountries.includes(selectedCountryName)) {
//         setWrongCountries((w) => [...w, selectedCountryName]);
//         setTimeout(() => setWrongCountries((w) => w.filter((c) => c !== selectedCountryName)), 1200);
//       }
//       advanceRound("wrong", selectedCountryName);
//     }
//   };

//   const handleSkip = () => {
//     if (!currentTarget || phase !== "playing") return;
//     if (soundEnabled) soundEffects.playWrong();
//     toast.info(`Skipped — it was ${currentTarget}`, { duration: 2000 });
//     advanceRound("skipped", currentTarget);
//   };

//   const handleShare = () => {
//     const text = buildShareText(savedResult!);
//     if (navigator.share) {
//       navigator.share({ text }).catch(() => {});
//     } else {
//       navigator.clipboard.writeText(text).then(() =>
//         toast.success("Result copied to clipboard!", { duration: 2000 })
//       );
//     }
//   };

//   // ── Loading ──────────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
//           <p className="text-muted-foreground font-medium">Loading Today's Challenge…</p>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // LOBBY (or already-played today)
//   // ═══════════════════════════════════════════════════════════════════════════
//   if (phase === "lobby") {
//     return (
//       <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//         <div className="absolute inset-0 z-0 opacity-35">
//           <WorldMap countries={countries} onCountryClick={() => {}} correctCountries={[]} wrongCountries={[]} />
//         </div>

//         <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
//           <motion.div
//             initial={{ scale: 0.88, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", damping: 20 }}
//             className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-white/20"
//           >
//             {/* Icon + title */}
//             <div className="text-center mb-5">
//               <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-3">
//                 <Calendar className="w-8 h-8 text-white" />
//               </div>
//               <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daily Challenge</h1>
//               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{today}</p>
//             </div>

//             {/* Streak */}
//             <div className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl px-4 py-3 mb-5">
//               <Star className="w-5 h-5 text-indigo-500" />
//               <div className="text-center">
//                 <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Current Streak</p>
//                 <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{streak} day{streak !== 1 ? "s" : ""}</p>
//               </div>
//             </div>

//             {/* Already played today */}
//             {savedResult ? (
//               <>
//                 <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 mb-5 text-center">
//                   <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
//                     Today's Result
//                   </p>
//                   <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
//                     {savedResult.score}/{CHALLENGE_SIZE}
//                   </p>
//                   <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
//                     in {formatTime(savedResult.totalTime)}
//                   </p>
//                   {/* Mini emoji grid */}
//                   <div className="flex justify-center gap-0.5 mt-3 text-xl">
//                     {savedResult.results.map((r, i) => (
//                       <span key={i}>{r === "correct" ? "🟩" : r === "wrong" ? "🟥" : "⬜"}</span>
//                     ))}
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleShare}
//                   className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   Share Result
//                 </button>
//                 <p className="text-center text-xs text-slate-400 mb-3">
//                   Come back tomorrow for a new challenge!
//                 </p>
//               </>
//             ) : (
//               <>
//                 {/* How to play */}
//                 <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-5 space-y-1.5">
//                   {[
//                     `📍 ${CHALLENGE_SIZE} countries — one at a time`,
//                     "🗺️  Click the country on the map",
//                     "⏩  Skip if you're not sure",
//                     "📊  Same challenge for everyone today",
//                   ].map((l) => (
//                     <p key={l} className="text-xs text-slate-600 dark:text-slate-300">{l}</p>
//                   ))}
//                 </div>
//                 <button
//                   onClick={startChallenge}
//                   className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
//                 >
//                   <Calendar className="w-5 h-5" />
//                   Start Today's Challenge
//                 </button>
//               </>
//             )}

//             <button
//               onClick={onBackToMenu}
//               className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
//             >
//               <Home className="w-4 h-4" />
//               Back to Menu
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // FINISHED
//   // ═══════════════════════════════════════════════════════════════════════════
//   if (phase === "finished" && savedResult) {
//     const pct = Math.round((savedResult.score / CHALLENGE_SIZE) * 100);
//     const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🌟" : pct >= 40 ? "👍" : "💪";

//     return (
//       <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//         <div className="absolute inset-0 z-0 opacity-25">
//           <WorldMap countries={countries} onCountryClick={() => {}} correctCountries={correctCountries} wrongCountries={[]} />
//         </div>

//         <div className="absolute inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
//           <motion.div
//             initial={{ scale: 0.85, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", damping: 18 }}
//             className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-white/20 my-4"
//           >
//             {/* Header */}
//             <div className="text-center mb-5">
//               <motion.p
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", delay: 0.2 }}
//                 className="text-5xl mb-2"
//               >
//                 {emoji}
//               </motion.p>
//               <h2 className="text-2xl font-black text-slate-900 dark:text-white">Challenge Complete!</h2>
//               <p className="text-xs text-slate-400 mt-1">{today}</p>
//             </div>

//             {/* Score */}
//             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl p-4 text-center mb-4">
//               <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Your Score</p>
//               <motion.p
//                 initial={{ scale: 0.5, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ type: "spring", delay: 0.15 }}
//                 className="text-5xl font-black text-indigo-600 dark:text-indigo-400"
//               >
//                 {savedResult.score}<span className="text-2xl text-indigo-400">/{CHALLENGE_SIZE}</span>
//               </motion.p>
//               <p className="text-xs text-indigo-500 mt-1">{formatTime(savedResult.totalTime)} • {pct}%</p>
//             </div>

//             {/* Emoji grid */}
//             <div className="flex justify-center gap-1 text-2xl mb-4">
//               {savedResult.results.map((r, i) => (
//                 <motion.span
//                   key={i}
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ delay: 0.05 * i, type: "spring" }}
//                 >
//                   {r === "correct" ? "🟩" : r === "wrong" ? "🟥" : "⬜"}
//                 </motion.span>
//               ))}
//             </div>

//             {/* Per-country breakdown */}
//             <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 mb-4 space-y-1.5 max-h-44 overflow-y-auto">
//               {savedResult.countryNames.map((name, i) => {
//                 const r = savedResult.results[i];
//                 const Icon = r === "correct" ? CheckCircle2 : r === "wrong" ? XCircle : Clock;
//                 const col = r === "correct"
//                   ? "text-emerald-600 dark:text-emerald-400"
//                   : r === "wrong"
//                   ? "text-red-500 dark:text-red-400"
//                   : "text-slate-400";
//                 return (
//                   <div key={name} className="flex items-center gap-2">
//                     <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${col}`} />
//                     <p className={`text-xs font-medium ${col}`}>{name}</p>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Streak */}
//             <div className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl px-3 py-2 mb-4">
//               <Star className="w-4 h-4 text-indigo-500" />
//               <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
//                 {streak} day streak — come back tomorrow!
//               </p>
//             </div>

//             {/* Buttons */}
//             <button
//               onClick={handleShare}
//               className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-2"
//             >
//               <Share2 className="w-4 h-4" />
//               Share Result
//             </button>
//             <button
//               onClick={onBackToMenu}
//               className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
//             >
//               <Home className="w-4 h-4" />
//               Back to Menu
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // PLAYING
//   // ═══════════════════════════════════════════════════════════════════════════
//   return (
//     <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//       <Toaster position="top-center" />

//       {/* Map */}
//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       {/* ── Top HUD — hidden in TV mode ── */}
//       {!config.isTV && <div className="absolute top-4 left-0 right-0 z-50 px-4">
//         <div className="flex justify-center">
//           <motion.div
//             initial={{ y: -30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-xl rounded-2xl border border-white/30 px-4 py-3 w-full max-w-lg"
//           >
//             <div className="flex items-center justify-between gap-3 mb-2.5">
//               {/* Progress */}
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-4 h-4 text-indigo-500" />
//                 <span className="text-sm font-bold text-slate-900 dark:text-white">
//                   {currentIndex + 1}
//                   <span className="text-slate-400 font-normal">/{CHALLENGE_SIZE}</span>
//                 </span>
//               </div>

//               {/* Country target name */}
//               <div className="flex-1 text-center">
//                 <p className="text-xs text-slate-400 font-medium">Find this country</p>
//                 <p className="text-base font-black text-indigo-600 dark:text-indigo-400 leading-tight truncate">
//                   {currentTarget}
//                 </p>
//               </div>

//               {/* Timer + skip */}
//               <div className="flex items-center gap-2">
//                 <div className="flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400">
//                   <Clock className="w-3.5 h-3.5" />
//                   {formatTime(elapsedSeconds)}
//                 </div>
//                 <button
//                   onClick={handleSkip}
//                   className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-semibold transition-all active:scale-95"
//                 >
//                   Skip
//                 </button>
//               </div>
//             </div>

//             {/* Progress dots */}
//             <div className="flex items-center gap-1">
//               {dailyCountries.map((_, i) => {
//                 const r = results[i];
//                 return (
//                   <div
//                     key={i}
//                     className={`flex-1 h-2 rounded-full transition-all ${
//                       r === "correct"
//                         ? "bg-emerald-500"
//                         : r === "wrong"
//                         ? "bg-red-400"
//                         : r === "skipped"
//                         ? "bg-slate-300 dark:bg-slate-600"
//                         : i === currentIndex
//                         ? "bg-indigo-400 animate-pulse"
//                         : "bg-slate-200 dark:bg-slate-700"
//                     }`}
//                   />
//                 );
//               })}
//             </div>
//           </motion.div>
//         </div>
//       </div>
//       }

//       {/* ── Normal guess panel + hint — hidden in TV mode ── */}
//       {!config.isTV && (
//         <>
//           <AnimatePresence>
//             {selectedCountryName && (
//               <motion.div
//                 initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
//                 transition={{ type: "spring", damping: 25, stiffness: 300 }}
//                 className="absolute left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[460px] z-50"
//                 style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)" }}
//               >
//                 <DailyGuessPanel selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
//                   onGuess={handleGuess} onDismiss={() => setSelectedCountryName(null)} />
//               </motion.div>
//             )}
//           </AnimatePresence>
//           <AnimatePresence>
//             {!selectedCountryName && (
//               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
//                 className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none z-50"
//                 style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 3rem)" }}>
//                 <div className="bg-black/80 text-white px-5 py-2.5 rounded-full backdrop-blur-sm text-sm font-medium shadow-2xl">
//                   👆 Find <span className="font-bold text-indigo-300">{currentTarget}</span> on the map
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </>
//       )}

//       {/* ── TV Classroom HUD ── */}
//       <AnimatePresence>
//         {config.isTV && (
//           <ClassroomHUD
//             score={score} totalCountries={CHALLENGE_SIZE}
//             selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
//             onGuess={handleGuess} onExitTVMode={toggleTVMode}
//             onBackToMenu={onBackToMenu}
//             onRestart={() => { setPhase("lobby"); setSelectedCountryName(null); }}
//             targetLabel="Find this country" mode="daily-challenge"
//           />
//         )}
//       </AnimatePresence>

//       {/* Fact card */}
//       <CountryFactCard countryName={factCardCountry} onClose={() => setFactCardCountry(null)} autoCloseDuration={4000} />
//     </div>
//   );
// }

// // ─── Inline guess panel for daily challenge ────────────────────────────────────
// interface DailyGuessPanelProps {
//   selectedCountryName: string;
//   allCountryNames: string[];
//   onGuess: (name: string) => void;
//   onDismiss: () => void;
// }

// function DailyGuessPanel({ selectedCountryName, allCountryNames, onGuess, onDismiss }: DailyGuessPanelProps) {
//   const [input, setInput] = React.useState("");
//   const [showSuggestions, setShowSuggestions] = React.useState(false);
//   const inputRef = React.useRef<HTMLInputElement>(null);

//   React.useEffect(() => {
//     setInput("");
//     setShowSuggestions(false);
//     setTimeout(() => inputRef.current?.focus(), 80);
//   }, [selectedCountryName]);

//   const filtered = React.useMemo(() => {
//     if (!input) return [];
//     return allCountryNames
//       .filter((n) => n.toLowerCase().startsWith(input.toLowerCase()) || n.toLowerCase().includes(input.toLowerCase()))
//       .sort((a, b) => {
//         const aS = a.toLowerCase().startsWith(input.toLowerCase());
//         const bS = b.toLowerCase().startsWith(input.toLowerCase());
//         if (aS && !bS) return -1;
//         if (!aS && bS) return 1;
//         return a.localeCompare(b);
//       })
//       .slice(0, 8);
//   }, [input, allCountryNames]);

//   const submit = (val?: string) => {
//     const v = (val ?? input).trim();
//     if (!v) return;
//     onGuess(v);
//     setInput("");
//     setShowSuggestions(false);
//   };

//   return (
//     <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl p-4 border border-border/50">
//       <div className="flex items-center justify-between mb-3">
//         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
//           Is this <span className="text-indigo-500 font-bold">{selectedCountryName}</span>?
//         </p>
//         <button onClick={onDismiss} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">✕</button>
//       </div>
//       <div className="relative">
//         <div className="relative flex items-center">
//           <input
//             ref={inputRef}
//             type="text"
//             value={input}
//             onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
//             onFocus={() => setShowSuggestions(true)}
//             onKeyDown={(e) => e.key === "Enter" && submit()}
//             placeholder="Confirm country name…"
//             className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-4 pr-12 text-base focus:ring-2 focus:ring-indigo-400/60 outline-none transition-all"
//             autoFocus
//           />
//           <button
//             onClick={() => submit()}
//             className="absolute right-2 p-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all active:scale-95"
//           >
//             <CheckCircle2 className="w-4 h-4" />
//           </button>
//         </div>
//         {showSuggestions && filtered.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-border/50 overflow-hidden max-h-48 overflow-y-auto z-50"
//           >
//             {filtered.map((s) => (
//               <button
//                 key={s}
//                 type="button"
//                 onClick={() => { setInput(s); submit(s); setShowSuggestions(false); }}
//                 className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-border/30 last:border-0 transition-colors text-sm font-medium truncate"
//               >
//                 {s}
//               </button>
//             ))}
//           </motion.div>
//         )}
//       </div>
//     </div>
//   )
// }

//HATA OLURSA USTE DON
// // DailyChallenge.tsx - Daily 10-country challenge, same for everyone each day
// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { AnimatePresence, motion } from "motion/react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { CountryFactCard } from "@/app/components/CountryFactCard";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { useDisplayMode } from "@/app/hooks/useDisplayMode";
// import { ClassroomHUD } from "@/app/components/ClassroomHUD";
// import { toast, Toaster } from "sonner";
// import {
//   Loader2, Calendar, Share2, Trophy, CheckCircle2,
//   XCircle, Clock, Home, RotateCcw, Star,
// } from "lucide-react";
// import { soundEffects } from "@/app/utils/soundEffects";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface DailyChallengeProps {
//   onBackToMenu: () => void;
// }

// interface DailyResult {
//   date: string;       // "YYYY-MM-DD"
//   score: number;
//   totalTime: number;  // seconds
//   results: ("correct" | "wrong" | "skipped")[];
//   countryNames: string[];
//   completed: boolean;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const CHALLENGE_SIZE = 10;
// const STORAGE_KEY = "dailyChallenge_result";
// const STREAK_KEY = "dailyChallenge_streak";

// function todayString(): string {
//   return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
// }

// // Deterministic seeded RNG (mulberry32)
// function seededRng(seed: number) {
//   return function () {
//     seed |= 0;
//     seed = seed + 0x6d2b79f5 | 0;
//     let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
//     t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
//     return ((t ^ t >>> 14) >>> 0) / 4294967296;
//   };
// }

// // Convert "YYYY-MM-DD" to a stable integer seed
// function dateToSeed(dateStr: string): number {
//   return dateStr.split("-").reduce((acc, part, i) => acc + parseInt(part) * [10000, 100, 1][i], 0);
// }

// // Pick N unique countries from list using seeded rng
// function pickDailyCountries(allNames: string[], date: string, n: number): string[] {
//   const rng = seededRng(dateToSeed(date));
//   const pool = [...allNames];
//   const result: string[] = [];
//   while (result.length < n && pool.length > 0) {
//     const idx = Math.floor(rng() * pool.length);
//     result.push(pool.splice(idx, 1)[0]);
//   }
//   return result;
// }

// function loadResult(): DailyResult | null {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (!raw) return null;
//     const parsed: DailyResult = JSON.parse(raw);
//     if (parsed.date !== todayString()) return null;
//     return parsed;
//   } catch { return null; }
// }

// function saveResult(r: DailyResult) {
//   try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); } catch {}
// }

// function loadStreak(): number {
//   try { return parseInt(localStorage.getItem(STREAK_KEY) || "0", 10) || 0; } catch { return 0; }
// }

// function updateStreak(won: boolean): number {
//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 1);
//   const yStr = yesterday.toISOString().slice(0, 10);
//   try {
//     const lastKey = "dailyChallenge_lastDate";
//     const lastDate = localStorage.getItem(lastKey);
//     let streak = loadStreak();
//     if (won) {
//       streak = lastDate === yStr ? streak + 1 : 1;
//       localStorage.setItem(lastKey, todayString());
//       localStorage.setItem(STREAK_KEY, String(streak));
//     }
//     return streak;
//   } catch { return 0; }
// }

// // Generate shareable emoji grid
// function buildShareText(result: DailyResult): string {
//   const emojiMap = { correct: "🟩", wrong: "🟥", skipped: "⬜" } as const;
//   const grid = result.results.map((r) => emojiMap[r]).join("");
//   return (
//     `🌍 Geography Daily Challenge — ${result.date}\n` +
//     `Score: ${result.score}/${CHALLENGE_SIZE} | Time: ${formatTime(result.totalTime)}\n\n` +
//     `${grid}\n\n` +
//     `Play at: Geography Master 🗺️`
//   );
// }

// function formatTime(secs: number): string {
//   const m = Math.floor(secs / 60);
//   const s = secs % 60;
//   return m > 0 ? `${m}m ${s}s` : `${s}s`;
// }

// // ─── Component ────────────────────────────────────────────────────────────────
// export function DailyChallenge({ onBackToMenu }: DailyChallengeProps) {
//   const { countries, loading } = useCountryData();
//   const { config, toggleTVMode } = useDisplayMode();

//   // Game phases: lobby → playing → finished
//   const [phase, setPhase] = useState<"lobby" | "playing" | "finished">("lobby");
//   const [soundEnabled, setSoundEnabled] = useState(true);

//   // Challenge state
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [results, setResults] = useState<("correct" | "wrong" | "skipped")[]>([]);
//   const [score, setScore] = useState(0);
//   const [correctCountries, setCorrectCountries] = useState<string[]>([]);
//   const [wrongCountries, setWrongCountries] = useState<string[]>([]);
//   const [skippedCountries, setSkippedCountries] = useState<string[]>([]);
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [elapsedSeconds, setElapsedSeconds] = useState(0);
//   const [timerActive, setTimerActive] = useState(false);
//   const [streak, setStreak] = useState(loadStreak);
//   const [factCardCountry, setFactCardCountry] = useState<string | null>(null);

//   // Saved result (if already played today)
//   const [savedResult, setSavedResult] = useState<DailyResult | null>(() => loadResult());

//   const allCountryNames = useMemo(() => countries.map((c) => c.properties.name), [countries]);
//   const today = todayString();

//   const dailyCountries = useMemo(
//     () => (allCountryNames.length > 0 ? pickDailyCountries(allCountryNames, today, CHALLENGE_SIZE) : []),
//     [allCountryNames, today]
//   );

//   const currentTarget = dailyCountries[currentIndex] ?? null;

//   // Timer
//   useEffect(() => {
//     if (!timerActive) return;
//     const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
//     return () => clearInterval(id);
//   }, [timerActive]);

//   // ── Actions ─────────────────────────────────────────────────────────────────
//   const startChallenge = () => {
//     setPhase("playing");
//     setTimerActive(true);
//     setCurrentIndex(0);
//     setResults([]);
//     setScore(0);
//     setCorrectCountries([]);
//     setWrongCountries([]);
//     setSkippedCountries([]);
//     setSelectedCountryName(null);
//     setElapsedSeconds(0);
//   };

//   const advanceRound = useCallback(
//     (outcome: "correct" | "wrong" | "skipped", countryName: string) => {
//       const newResults = [...results, outcome];
//       const newScore = outcome === "correct" ? score + 1 : score;

//       setResults(newResults);
//       setScore(newScore);

//       if (newResults.length >= CHALLENGE_SIZE) {
//         // Challenge complete
//         setTimerActive(false);
//         setSelectedCountryName(null);
//         const finalResult: DailyResult = {
//           date: today,
//           score: newScore,
//           totalTime: elapsedSeconds,
//           results: newResults,
//           countryNames: dailyCountries,
//           completed: true,
//         };
//         saveResult(finalResult);
//         setSavedResult(finalResult);
//         const newStreak = updateStreak(newScore >= Math.ceil(CHALLENGE_SIZE / 2));
//         setStreak(newStreak);
//         if (soundEnabled) soundEffects.playAchievement();
//         setPhase("finished");
//       } else {
//         setCurrentIndex((i) => i + 1);
//         setSelectedCountryName(null);
//         // Remove from wrong list after moving on (but skipped stays)
//         setWrongCountries((w) => w.filter((c) => c !== countryName));
//       }
//     },
//     [results, score, today, elapsedSeconds, dailyCountries, soundEnabled]
//   );

//   const handleCountryClick = (geo: any) => {
//     if (phase !== "playing") return;
//     const name = geo.properties.name || geo.name;
//     if (correctCountries.includes(name) || skippedCountries.includes(name)) {
//       toast.info(`Already processed ${name}!`, { duration: 1000 });
//       return;
//     }
//     if (soundEnabled) soundEffects.playClick();
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName || !currentTarget || phase !== "playing") return;

//     const normGuess = guess.toLowerCase().trim();
//     const normSelected = selectedCountryName.toLowerCase().trim();
//     const normTarget = currentTarget.toLowerCase().trim();

//     if (normGuess !== normSelected) {
//       toast.error("Guess doesn't match selected country!", { duration: 900 });
//       return;
//     }

//     if (normGuess === normTarget) {
//       if (soundEnabled) soundEffects.playCorrect();
//       toast.success(`✓ ${currentTarget}`, {
//         duration: 1200,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });
//       setCorrectCountries((prev) => [...prev, currentTarget]);
//       setFactCardCountry(currentTarget);
//       setTimeout(() => advanceRound("correct", currentTarget), 1400);
//     } else {
//       if (soundEnabled) soundEffects.playWrong();
//       toast.error(`Wrong — that's ${selectedCountryName}`, { duration: 1500 });
//       if (!wrongCountries.includes(selectedCountryName)) {
//         setWrongCountries((w) => [...w, selectedCountryName]);
//         setTimeout(() => setWrongCountries((w) => w.filter((c) => c !== selectedCountryName)), 1200);
//       }
//       advanceRound("wrong", selectedCountryName);
//     }
//   };

//   const handleSkip = () => {
//     if (!currentTarget || phase !== "playing") return;

//     if (soundEnabled) soundEffects.playWrong();
//     toast.info(`Skipped — it was ${currentTarget}`, { duration: 2000 });

//     setSkippedCountries((prev) =>
//       prev.includes(currentTarget) ? prev : [...prev, currentTarget]
//     );

//     advanceRound("skipped", currentTarget);
//   };

//   const handleShare = () => {
//     const text = buildShareText(savedResult!);
//     if (navigator.share) {
//       navigator.share({ text }).catch(() => {});
//     } else {
//       navigator.clipboard.writeText(text).then(() =>
//         toast.success("Result copied to clipboard!", { duration: 2000 })
//       );
//     }
//   };

//   // ── Loading ──────────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
//           <p className="text-muted-foreground font-medium">Loading Today's Challenge…</p>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // LOBBY (or already-played today)
//   // ═══════════════════════════════════════════════════════════════════════════
//   if (phase === "lobby") {
//     return (
//       <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//         <div className="absolute inset-0 z-0 opacity-35">
//           <WorldMap
//             countries={countries}
//             onCountryClick={() => {}}
//             correctCountries={[]}
//             wrongCountries={[]}
//             skippedCountries={[]}
//           />
//         </div>

//         <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
//           <motion.div
//             initial={{ scale: 0.88, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", damping: 20 }}
//             className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-white/20"
//           >
//             {/* Icon + title */}
//             <div className="text-center mb-5">
//               <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-3">
//                 <Calendar className="w-8 h-8 text-white" />
//               </div>
//               <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daily Challenge</h1>
//               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{today}</p>
//             </div>

//             {/* Streak */}
//             <div className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl px-4 py-3 mb-5">
//               <Star className="w-5 h-5 text-indigo-500" />
//               <div className="text-center">
//                 <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Current Streak</p>
//                 <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{streak} day{streak !== 1 ? "s" : ""}</p>
//               </div>
//             </div>

//             {/* Already played today */}
//             {savedResult ? (
//               <>
//                 <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 mb-5 text-center">
//                   <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
//                     Today's Result
//                   </p>
//                   <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
//                     {savedResult.score}/{CHALLENGE_SIZE}
//                   </p>
//                   <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
//                     in {formatTime(savedResult.totalTime)}
//                   </p>
//                   {/* Mini emoji grid */}
//                   <div className="flex justify-center gap-0.5 mt-3 text-xl">
//                     {savedResult.results.map((r, i) => (
//                       <span key={i}>{r === "correct" ? "🟩" : r === "wrong" ? "🟥" : "⬜"}</span>
//                     ))}
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleShare}
//                   className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   Share Result
//                 </button>
//                 <p className="text-center text-xs text-slate-400 mb-3">
//                   Come back tomorrow for a new challenge!
//                 </p>
//               </>
//             ) : (
//               <>
//                 {/* How to play */}
//                 <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-5 space-y-1.5">
//                   {[
//                     `📍 ${CHALLENGE_SIZE} countries — one at a time`,
//                     "🗺️  Click the country on the map",
//                     "⏩  Skip if you're not sure",
//                     "📊  Same challenge for everyone today",
//                   ].map((l) => (
//                     <p key={l} className="text-xs text-slate-600 dark:text-slate-300">{l}</p>
//                   ))}
//                 </div>
//                 <button
//                   onClick={startChallenge}
//                   className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
//                 >
//                   <Calendar className="w-5 h-5" />
//                   Start Today's Challenge
//                 </button>
//               </>
//             )}

//             <button
//               onClick={onBackToMenu}
//               className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
//             >
//               <Home className="w-4 h-4" />
//               Back to Menu
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // FINISHED
//   // ═══════════════════════════════════════════════════════════════════════════
//   if (phase === "finished" && savedResult) {
//     const pct = Math.round((savedResult.score / CHALLENGE_SIZE) * 100);
//     const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🌟" : pct >= 40 ? "👍" : "💪";

//     return (
//       <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//         <div className="absolute inset-0 z-0 opacity-25">
//           <WorldMap
//             countries={countries}
//             onCountryClick={() => {}}
//             correctCountries={correctCountries}
//             wrongCountries={[]}
//             skippedCountries={skippedCountries}
//           />
//         </div>

//         <div className="absolute inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
//           <motion.div
//             initial={{ scale: 0.85, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", damping: 18 }}
//             className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-white/20 my-4"
//           >
//             {/* Header */}
//             <div className="text-center mb-5">
//               <motion.p
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", delay: 0.2 }}
//                 className="text-5xl mb-2"
//               >
//                 {emoji}
//               </motion.p>
//               <h2 className="text-2xl font-black text-slate-900 dark:text-white">Challenge Complete!</h2>
//               <p className="text-xs text-slate-400 mt-1">{today}</p>
//             </div>

//             {/* Score */}
//             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl p-4 text-center mb-4">
//               <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Your Score</p>
//               <motion.p
//                 initial={{ scale: 0.5, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ type: "spring", delay: 0.15 }}
//                 className="text-5xl font-black text-indigo-600 dark:text-indigo-400"
//               >
//                 {savedResult.score}<span className="text-2xl text-indigo-400">/{CHALLENGE_SIZE}</span>
//               </motion.p>
//               <p className="text-xs text-indigo-500 mt-1">{formatTime(savedResult.totalTime)} • {pct}%</p>
//             </div>

//             {/* Emoji grid */}
//             <div className="flex justify-center gap-1 text-2xl mb-4">
//               {savedResult.results.map((r, i) => (
//                 <motion.span
//                   key={i}
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ delay: 0.05 * i, type: "spring" }}
//                 >
//                   {r === "correct" ? "🟩" : r === "wrong" ? "🟥" : "⬜"}
//                 </motion.span>
//               ))}
//             </div>

//             {/* Per-country breakdown */}
//             <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 mb-4 space-y-1.5 max-h-44 overflow-y-auto">
//               {savedResult.countryNames.map((name, i) => {
//                 const r = savedResult.results[i];
//                 const Icon = r === "correct" ? CheckCircle2 : r === "wrong" ? XCircle : Clock;
//                 const col = r === "correct"
//                   ? "text-emerald-600 dark:text-emerald-400"
//                   : r === "wrong"
//                   ? "text-red-500 dark:text-red-400"
//                   : "text-slate-400";
//                 return (
//                   <div key={name} className="flex items-center gap-2">
//                     <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${col}`} />
//                     <p className={`text-xs font-medium ${col}`}>{name}</p>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Streak */}
//             <div className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl px-3 py-2 mb-4">
//               <Star className="w-4 h-4 text-indigo-500" />
//               <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
//                 {streak} day streak — come back tomorrow!
//               </p>
//             </div>

//             {/* Buttons */}
//             <button
//               onClick={handleShare}
//               className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-2"
//             >
//               <Share2 className="w-4 h-4" />
//               Share Result
//             </button>
//             <button
//               onClick={onBackToMenu}
//               className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
//             >
//               <Home className="w-4 h-4" />
//               Back to Menu
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // PLAYING
//   // ═══════════════════════════════════════════════════════════════════════════
//   return (
//     <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//       <Toaster position="top-center" />

//       {/* Map */}
//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//           skippedCountries={skippedCountries}
//         />
//       </div>

//       {/* ── Top HUD — hidden in TV mode ── */}
//       {!config.isTV && <div className="absolute top-4 left-0 right-0 z-50 px-4">
//         <div className="flex justify-center">
//           <motion.div
//             initial={{ y: -30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-xl rounded-2xl border border-white/30 px-4 py-3 w-full max-w-lg"
//           >
//             <div className="flex items-center justify-between gap-3 mb-2.5">
//               {/* Progress */}
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-4 h-4 text-indigo-500" />
//                 <span className="text-sm font-bold text-slate-900 dark:text-white">
//                   {currentIndex + 1}
//                   <span className="text-slate-400 font-normal">/{CHALLENGE_SIZE}</span>
//                 </span>
//               </div>

//               {/* Country target name */}
//               <div className="flex-1 text-center">
//                 <p className="text-xs text-slate-400 font-medium">Find this country</p>
//                 <p className="text-base font-black text-indigo-600 dark:text-indigo-400 leading-tight truncate">
//                   {currentTarget}
//                 </p>
//               </div>

//               {/* Timer + skip */}
//               <div className="flex items-center gap-2">
//                 <div className="flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400">
//                   <Clock className="w-3.5 h-3.5" />
//                   {formatTime(elapsedSeconds)}
//                 </div>
//                 <button
//                   onClick={handleSkip}
//                   className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-semibold transition-all active:scale-95"
//                 >
//                   Skip
//                 </button>
//               </div>
//             </div>

//             {/* Progress dots */}
//             <div className="flex items-center gap-1">
//               {dailyCountries.map((_, i) => {
//                 const r = results[i];
//                 return (
//                   <div
//                     key={i}
//                     className={`flex-1 h-2 rounded-full transition-all ${
//                       r === "correct"
//                         ? "bg-emerald-500"
//                         : r === "wrong"
//                         ? "bg-red-400"
//                         : r === "skipped"
//                         ? "bg-slate-300 dark:bg-slate-600"
//                         : i === currentIndex
//                         ? "bg-indigo-400 animate-pulse"
//                         : "bg-slate-200 dark:bg-slate-700"
//                     }`}
//                   />
//                 );
//               })}
//             </div>
//           </motion.div>
//         </div>
//       </div>
//       }

//       {/* ── Normal guess panel + hint — hidden in TV mode ── */}
//       {!config.isTV && (
//         <>
//           <AnimatePresence>
//             {selectedCountryName && (
//               <motion.div
//                 initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
//                 transition={{ type: "spring", damping: 25, stiffness: 300 }}
//                 className="absolute left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[460px] z-50"
//                 style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)" }}
//               >
//                 <DailyGuessPanel selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
//                   onGuess={handleGuess} onDismiss={() => setSelectedCountryName(null)} />
//               </motion.div>
//             )}
//           </AnimatePresence>
//           <AnimatePresence>
//             {!selectedCountryName && (
//               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
//                 className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none z-50"
//                 style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 3rem)" }}>
//                 <div className="bg-black/80 text-white px-5 py-2.5 rounded-full backdrop-blur-sm text-sm font-medium shadow-2xl">
//                   👆 Find <span className="font-bold text-indigo-300">{currentTarget}</span> on the map
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </>
//       )}

//       {/* ── TV Classroom HUD ── */}
//       <AnimatePresence>
//         {config.isTV && (
//           <ClassroomHUD
//             score={score} totalCountries={CHALLENGE_SIZE}
//             selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
//             onGuess={handleGuess} onExitTVMode={toggleTVMode}
//             onBackToMenu={onBackToMenu}
//             onRestart={() => { setPhase("lobby"); setSelectedCountryName(null); }}
//             targetLabel="Find this country" mode="daily-challenge"
//           />
//         )}
//       </AnimatePresence>

//       {/* Fact card */}
//       <CountryFactCard countryName={factCardCountry} onClose={() => setFactCardCountry(null)} autoCloseDuration={4000} />
//     </div>
//   );
// }

// // ─── Inline guess panel for daily challenge ────────────────────────────────────
// interface DailyGuessPanelProps {
//   selectedCountryName: string;
//   allCountryNames: string[];
//   onGuess: (name: string) => void;
//   onDismiss: () => void;
// }

// function DailyGuessPanel({ selectedCountryName, allCountryNames, onGuess, onDismiss }: DailyGuessPanelProps) {
//   const [input, setInput] = React.useState("");
//   const [showSuggestions, setShowSuggestions] = React.useState(false);
//   const inputRef = React.useRef<HTMLInputElement>(null);

//   React.useEffect(() => {
//     setInput("");
//     setShowSuggestions(false);
//     setTimeout(() => inputRef.current?.focus(), 80);
//   }, [selectedCountryName]);

//   const filtered = React.useMemo(() => {
//     if (!input) return [];
//     return allCountryNames
//       .filter((n) => n.toLowerCase().startsWith(input.toLowerCase()) || n.toLowerCase().includes(input.toLowerCase()))
//       .sort((a, b) => {
//         const aS = a.toLowerCase().startsWith(input.toLowerCase());
//         const bS = b.toLowerCase().startsWith(input.toLowerCase());
//         if (aS && !bS) return -1;
//         if (!aS && bS) return 1;
//         return a.localeCompare(b);
//       })
//       .slice(0, 8);
//   }, [input, allCountryNames]);

//   const submit = (val?: string) => {
//     const v = (val ?? input).trim();
//     if (!v) return;
//     onGuess(v);
//     setInput("");
//     setShowSuggestions(false);
//   };

//   return (
//     <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl p-4 border border-border/50">
//       <div className="flex items-center justify-between mb-3">
//         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
//           Is this <span className="text-indigo-500 font-bold">{selectedCountryName}</span>?
//         </p>
//         <button onClick={onDismiss} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">✕</button>
//       </div>
//       <div className="relative">
//         <div className="relative flex items-center">
//           <input
//             ref={inputRef}
//             type="text"
//             value={input}
//             onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
//             onFocus={() => setShowSuggestions(true)}
//             onKeyDown={(e) => e.key === "Enter" && submit()}
//             placeholder="Confirm country name…"
//             className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-4 pr-12 text-base focus:ring-2 focus:ring-indigo-400/60 outline-none transition-all"
//             autoFocus
//           />
//           <button
//             onClick={() => submit()}
//             className="absolute right-2 p-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all active:scale-95"
//           >
//             <CheckCircle2 className="w-4 h-4" />
//           </button>
//         </div>
//         {showSuggestions && filtered.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-border/50 overflow-hidden max-h-48 overflow-y-auto z-50"
//           >
//             {filtered.map((s) => (
//               <button
//                 key={s}
//                 type="button"
//                 onClick={() => { setInput(s); submit(s); setShowSuggestions(false); }}
//                 className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-border/30 last:border-0 transition-colors text-sm font-medium truncate"
//               >
//                 {s}
//               </button>
//             ))}
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }


// //hATA OLURSA USTE DON
// // DailyChallenge.tsx - Daily 10-country challenge, same for everyone each day
// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { AnimatePresence, motion } from "motion/react";
// import WorldMap from "@/app/components/WorldMap";
// import { CountryFactCard } from "@/app/components/CountryFactCard";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { useDisplayMode } from "@/app/hooks/useDisplayMode";
// import { ClassroomHUD } from "@/app/components/ClassroomHUD";
// import { toast, Toaster } from "sonner";
// import {
//   Loader2, Calendar, Share2, Trophy, CheckCircle2,
//   XCircle, Clock, Home, RotateCcw, Star,
// } from "lucide-react";
// import { soundEffects } from "@/app/utils/soundEffects";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface DailyChallengeProps {
//   onBackToMenu: () => void;
// }

// interface DailyResult {
//   date: string;       // "YYYY-MM-DD"
//   score: number;
//   totalTime: number;  // seconds
//   results: ("correct" | "wrong" | "skipped")[];
//   countryNames: string[];
//   completed: boolean;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const CHALLENGE_SIZE = 10;
// const STORAGE_KEY = "dailyChallenge_result";
// const STREAK_KEY = "dailyChallenge_streak";

// function todayString(): string {
//   return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
// }

// // Deterministic seeded RNG (mulberry32)
// function seededRng(seed: number) {
//   return function () {
//     seed |= 0;
//     seed = seed + 0x6d2b79f5 | 0;
//     let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
//     t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
//     return ((t ^ t >>> 14) >>> 0) / 4294967296;
//   };
// }

// // Convert "YYYY-MM-DD" to a stable integer seed
// function dateToSeed(dateStr: string): number {
//   return dateStr.split("-").reduce((acc, part, i) => acc + parseInt(part) * [10000, 100, 1][i], 0);
// }

// // Pick N unique countries from list using seeded rng
// function pickDailyCountries(allNames: string[], date: string, n: number): string[] {
//   const rng = seededRng(dateToSeed(date));
//   const pool = [...allNames];
//   const result: string[] = [];
//   while (result.length < n && pool.length > 0) {
//     const idx = Math.floor(rng() * pool.length);
//     result.push(pool.splice(idx, 1)[0]);
//   }
//   return result;
// }

// function loadResult(): DailyResult | null {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (!raw) return null;
//     const parsed: DailyResult = JSON.parse(raw);
//     if (parsed.date !== todayString()) return null;
//     return parsed;
//   } catch { return null; }
// }

// function saveResult(r: DailyResult) {
//   try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); } catch {}
// }

// function loadStreak(): number {
//   try { return parseInt(localStorage.getItem(STREAK_KEY) || "0", 10) || 0; } catch { return 0; }
// }

// function updateStreak(won: boolean): number {
//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 1);
//   const yStr = yesterday.toISOString().slice(0, 10);
//   try {
//     const lastKey = "dailyChallenge_lastDate";
//     const lastDate = localStorage.getItem(lastKey);
//     let streak = loadStreak();
//     if (won) {
//       streak = lastDate === yStr ? streak + 1 : 1;
//       localStorage.setItem(lastKey, todayString());
//       localStorage.setItem(STREAK_KEY, String(streak));
//     }
//     return streak;
//   } catch { return 0; }
// }

// // Generate shareable emoji grid
// function buildShareText(result: DailyResult): string {
//   const emojiMap = { correct: "🟩", wrong: "🟥", skipped: "⬜" } as const;
//   const grid = result.results.map((r) => emojiMap[r]).join("");
//   return (
//     `🌍 Geography Daily Challenge — ${result.date}\n` +
//     `Score: ${result.score}/${CHALLENGE_SIZE} | Time: ${formatTime(result.totalTime)}\n\n` +
//     `${grid}\n\n` +
//     `Play at: Geography Master 🗺️`
//   );
// }

// function formatTime(secs: number): string {
//   const m = Math.floor(secs / 60);
//   const s = secs % 60;
//   return m > 0 ? `${m}m ${s}s` : `${s}s`;
// }

// // ─── Component ────────────────────────────────────────────────────────────────
// export function DailyChallenge({ onBackToMenu }: DailyChallengeProps) {
//   const { countries, loading } = useCountryData();
//   const { config, toggleTVMode } = useDisplayMode();

//   // Game phases: lobby → playing → finished
//   const [phase, setPhase] = useState<"lobby" | "playing" | "finished">("lobby");
//   const [soundEnabled, setSoundEnabled] = useState(true);

//   // Challenge state
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [results, setResults] = useState<("correct" | "wrong" | "skipped")[]>([]);
//   const [score, setScore] = useState(0);
//   const [correctCountries, setCorrectCountries] = useState<string[]>([]);
//   const [skippedCountries, setSkippedCountries] = useState<string[]>([]);
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [elapsedSeconds, setElapsedSeconds] = useState(0);
//   const [timerActive, setTimerActive] = useState(false);
//   const [streak, setStreak] = useState(loadStreak);
//   const [factCardCountry, setFactCardCountry] = useState<string | null>(null);

//   // Saved result (if already played today)
//   const [savedResult, setSavedResult] = useState<DailyResult | null>(() => loadResult());

//   const allCountryNames = useMemo(() => countries.map((c) => c.properties.name), [countries]);
//   const today = todayString();

//   const dailyCountries = useMemo(
//     () => (allCountryNames.length > 0 ? pickDailyCountries(allCountryNames, today, CHALLENGE_SIZE) : []),
//     [allCountryNames, today]
//   );

//   const currentTarget = dailyCountries[currentIndex] ?? null;

//   // Timer
//   useEffect(() => {
//     if (!timerActive) return;
//     const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
//     return () => clearInterval(id);
//   }, [timerActive]);

//   // ── Actions ─────────────────────────────────────────────────────────────────
//   const startChallenge = () => {
//     setPhase("playing");
//     setTimerActive(true);
//     setCurrentIndex(0);
//     setResults([]);
//     setScore(0);
//     setCorrectCountries([]);
//     setSkippedCountries([]);
//     setSelectedCountryName(null);
//     setElapsedSeconds(0);
//   };

//   const advanceRound = useCallback(
//     (outcome: "correct" | "wrong" | "skipped") => {
//       const newResults = [...results, outcome];
//       const newScore = outcome === "correct" ? score + 1 : score;

//       setResults(newResults);
//       setScore(newScore);

//       if (newResults.length >= CHALLENGE_SIZE) {
//         setTimerActive(false);
//         setSelectedCountryName(null);

//         const finalResult: DailyResult = {
//           date: today,
//           score: newScore,
//           totalTime: elapsedSeconds,
//           results: newResults,
//           countryNames: dailyCountries,
//           completed: true,
//         };

//         saveResult(finalResult);
//         setSavedResult(finalResult);

//         const newStreak = updateStreak(newScore >= Math.ceil(CHALLENGE_SIZE / 2));
//         setStreak(newStreak);

//         if (soundEnabled) soundEffects.playAchievement();
//         setPhase("finished");
//       } else {
//         setCurrentIndex((i) => i + 1);
//         setSelectedCountryName(null);
//       }
//     },
//     [results, score, today, elapsedSeconds, dailyCountries, soundEnabled]
//   );

//   const handleCountryClick = (geo: any) => {
//     if (phase !== "playing") return;
//     const name = geo.properties.name || geo.name;
//     if (correctCountries.includes(name) || skippedCountries.includes(name)) {
//       toast.info(`Already processed ${name}!`, { duration: 1000 });
//       return;
//     }
//     if (soundEnabled) soundEffects.playClick();
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName || !currentTarget || phase !== "playing") return;

//     const normGuess = guess.toLowerCase().trim();
//     const normSelected = selectedCountryName.toLowerCase().trim();
//     const normTarget = currentTarget.toLowerCase().trim();

//     if (normGuess !== normSelected) {
//       toast.error("Selected country changed. Try again.", { duration: 900 });
//       return;
//     }

//     if (normGuess === normTarget) {
//       if (soundEnabled) soundEffects.playCorrect();
//       toast.success(`✓ ${currentTarget}`, {
//         duration: 1200,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });

//       setCorrectCountries((prev) => [...prev, currentTarget]);
//       setFactCardCountry(currentTarget);
//       setTimeout(() => advanceRound("correct"), 1400);
//     } else {
//       if (soundEnabled) soundEffects.playWrong();
//       toast.error("Wrong country — try another one.", { duration: 1200 });
//       // Do not advance, do not color the map. Let the player try again.
//     }
//   };

//   const handleSkip = () => {
//     if (!currentTarget || phase !== "playing") return;

//     if (soundEnabled) soundEffects.playWrong();

//     setSkippedCountries((prev) =>
//       prev.includes(currentTarget) ? prev : [...prev, currentTarget]
//     );

//     advanceRound("skipped");
//   };

//   const handleShare = () => {
//     const text = buildShareText(savedResult!);
//     if (navigator.share) {
//       navigator.share({ text }).catch(() => {});
//     } else {
//       navigator.clipboard.writeText(text).then(() =>
//         toast.success("Result copied to clipboard!", { duration: 2000 })
//       );
//     }
//   };

//   // ── Loading ──────────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
//           <p className="text-muted-foreground font-medium">Loading Today's Challenge…</p>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // LOBBY (or already-played today)
//   // ═══════════════════════════════════════════════════════════════════════════
//   if (phase === "lobby") {
//     return (
//       <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//         <div className="absolute inset-0 z-0 opacity-35">
//           <WorldMap
//             countries={countries}
//             onCountryClick={() => {}}
//             correctCountries={[]}
//             wrongCountries={[]}
//             skippedCountries={[]}
//             hideLegend={true}
//           />
//         </div>

//         <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
//           <motion.div
//             initial={{ scale: 0.88, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", damping: 20 }}
//             className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-white/20"
//           >
//             {/* Icon + title */}
//             <div className="text-center mb-5">
//               <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-3">
//                 <Calendar className="w-8 h-8 text-white" />
//               </div>
//               <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daily Challenge</h1>
//               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{today}</p>
//             </div>

//             {/* Streak */}
//             <div className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl px-4 py-3 mb-5">
//               <Star className="w-5 h-5 text-indigo-500" />
//               <div className="text-center">
//                 <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Current Streak</p>
//                 <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{streak} day{streak !== 1 ? "s" : ""}</p>
//               </div>
//             </div>

//             {/* Already played today */}
//             {savedResult ? (
//               <>
//                 <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 mb-5 text-center">
//                   <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
//                     Today's Result
//                   </p>
//                   <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
//                     {savedResult.score}/{CHALLENGE_SIZE}
//                   </p>
//                   <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
//                     in {formatTime(savedResult.totalTime)}
//                   </p>
//                   {/* Mini emoji grid */}
//                   <div className="flex justify-center gap-0.5 mt-3 text-xl">
//                     {savedResult.results.map((r, i) => (
//                       <span key={i}>{r === "correct" ? "🟩" : r === "wrong" ? "🟥" : "⬜"}</span>
//                     ))}
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleShare}
//                   className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   Share Result
//                 </button>
//                 <p className="text-center text-xs text-slate-400 mb-3">
//                   Come back tomorrow for a new challenge!
//                 </p>
//               </>
//             ) : (
//               <>
//                 {/* How to play */}
//                 <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-5 space-y-1.5">
//                   {[
//                     `📍 ${CHALLENGE_SIZE} countries — one at a time`,
//                     "🗺️  Click the country on the map",
//                     "⏩  Skip if you're not sure",
//                     "📊  Same challenge for everyone today",
//                   ].map((l) => (
//                     <p key={l} className="text-xs text-slate-600 dark:text-slate-300">{l}</p>
//                   ))}
//                 </div>
//                 <button
//                   onClick={startChallenge}
//                   className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
//                 >
//                   <Calendar className="w-5 h-5" />
//                   Start Today's Challenge
//                 </button>
//               </>
//             )}

//             <button
//               onClick={onBackToMenu}
//               className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
//             >
//               <Home className="w-4 h-4" />
//               Back to Menu
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // FINISHED
//   // ═══════════════════════════════════════════════════════════════════════════
//   if (phase === "finished" && savedResult) {
//     const pct = Math.round((savedResult.score / CHALLENGE_SIZE) * 100);
//     const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🌟" : pct >= 40 ? "👍" : "💪";

//     return (
//       <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//         <div className="absolute inset-0 z-0 opacity-25">
//           <WorldMap
//             countries={countries}
//             onCountryClick={() => {}}
//             correctCountries={correctCountries}
//             wrongCountries={[]}
//             skippedCountries={skippedCountries}
//             hideLegend={true}
//           />
//         </div>

//         <div className="absolute inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
//           <motion.div
//             initial={{ scale: 0.85, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", damping: 18 }}
//             className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-white/20 my-4"
//           >
//             {/* Header */}
//             <div className="text-center mb-5">
//               <motion.p
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", delay: 0.2 }}
//                 className="text-5xl mb-2"
//               >
//                 {emoji}
//               </motion.p>
//               <h2 className="text-2xl font-black text-slate-900 dark:text-white">Challenge Complete!</h2>
//               <p className="text-xs text-slate-400 mt-1">{today}</p>
//             </div>

//             {/* Score */}
//             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl p-4 text-center mb-4">
//               <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Your Score</p>
//               <motion.p
//                 initial={{ scale: 0.5, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ type: "spring", delay: 0.15 }}
//                 className="text-5xl font-black text-indigo-600 dark:text-indigo-400"
//               >
//                 {savedResult.score}<span className="text-2xl text-indigo-400">/{CHALLENGE_SIZE}</span>
//               </motion.p>
//               <p className="text-xs text-indigo-500 mt-1">{formatTime(savedResult.totalTime)} • {pct}%</p>
//             </div>

//             {/* Emoji grid */}
//             <div className="flex justify-center gap-1 text-2xl mb-4">
//               {savedResult.results.map((r, i) => (
//                 <motion.span
//                   key={i}
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ delay: 0.05 * i, type: "spring" }}
//                 >
//                   {r === "correct" ? "🟩" : r === "wrong" ? "🟥" : "⬜"}
//                 </motion.span>
//               ))}
//             </div>

//             {/* Per-country breakdown */}
//             <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 mb-4 space-y-1.5 max-h-44 overflow-y-auto">
//               {savedResult.countryNames.map((name, i) => {
//                 const r = savedResult.results[i];
//                 const Icon = r === "correct" ? CheckCircle2 : r === "wrong" ? XCircle : Clock;
//                 const col = r === "correct"
//                   ? "text-emerald-600 dark:text-emerald-400"
//                   : r === "wrong"
//                   ? "text-red-500 dark:text-red-400"
//                   : "text-slate-400";
//                 return (
//                   <div key={name} className="flex items-center gap-2">
//                     <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${col}`} />
//                     <p className={`text-xs font-medium ${col}`}>{name}</p>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Streak */}
//             <div className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl px-3 py-2 mb-4">
//               <Star className="w-4 h-4 text-indigo-500" />
//               <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
//                 {streak} day streak — come back tomorrow!
//               </p>
//             </div>

//             {/* Buttons */}
//             <button
//               onClick={handleShare}
//               className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-2"
//             >
//               <Share2 className="w-4 h-4" />
//               Share Result
//             </button>
//             <button
//               onClick={onBackToMenu}
//               className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
//             >
//               <Home className="w-4 h-4" />
//               Back to Menu
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // PLAYING
//   // ═══════════════════════════════════════════════════════════════════════════
//   return (
//     <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//       <Toaster position="top-center" />

//       {/* Map */}
//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={[]}
//           skippedCountries={skippedCountries}
//           hideLegend={true}
//         />
//       </div>

//       {/* ── Top HUD — hidden in TV mode ── */}
//       {!config.isTV && <div className="absolute top-4 left-0 right-0 z-50 px-4">
//         <div className="flex justify-center">
//           <motion.div
//             initial={{ y: -30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-xl rounded-2xl border border-white/30 px-4 py-3 w-full max-w-lg"
//           >
//             <div className="flex items-center justify-between gap-3 mb-2.5">
//               {/* Progress */}
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-4 h-4 text-indigo-500" />
//                 <span className="text-sm font-bold text-slate-900 dark:text-white">
//                   {currentIndex + 1}
//                   <span className="text-slate-400 font-normal">/{CHALLENGE_SIZE}</span>
//                 </span>
//               </div>

//               {/* Country target name */}
//               <div className="flex-1 text-center">
//                 <p className="text-xs text-slate-400 font-medium">Find this country</p>
//                 <p className="text-base font-black text-indigo-600 dark:text-indigo-400 leading-tight truncate">
//                   {currentTarget}
//                 </p>
//               </div>

//               {/* Timer + skip */}
//               <div className="flex items-center gap-2">
//                 <div className="flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400">
//                   <Clock className="w-3.5 h-3.5" />
//                   {formatTime(elapsedSeconds)}
//                 </div>
//                 <button
//                   onClick={handleSkip}
//                   className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-semibold transition-all active:scale-95"
//                 >
//                   Skip
//                 </button>
//               </div>
//             </div>

//             {/* Progress dots */}
//             <div className="flex items-center gap-1">
//               {dailyCountries.map((_, i) => {
//                 const r = results[i];
//                 return (
//                   <div
//                     key={i}
//                     className={`flex-1 h-2 rounded-full transition-all ${
//                       r === "correct"
//                         ? "bg-emerald-500"
//                         : r === "wrong"
//                         ? "bg-red-400"
//                         : r === "skipped"
//                         ? "bg-slate-300 dark:bg-slate-600"
//                         : i === currentIndex
//                         ? "bg-indigo-400 animate-pulse"
//                         : "bg-slate-200 dark:bg-slate-700"
//                     }`}
//                   />
//                 );
//               })}
//             </div>
//           </motion.div>
//         </div>
//       </div>
//       }

//       {/* ── Simple submit card — no text input ── */}
//       {!config.isTV && (
//         <motion.div
//           initial={{ y: 100, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ type: "spring", damping: 25, stiffness: 300 }}
//           className="fixed left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[380px] z-50"
//           style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
//         >
//           <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl px-4 py-3">
//             <div className="text-center">
//               {/* <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 mb-2">
//                 Daily Challenge
//               </p> */}

//               <div className="min-h-[40px] flex items-center justify-center">
//                 <p
//                   className={`font-black leading-tight text-[16px] sm:text-[18px] ${
//                     selectedCountryName ? "text-white" : "text-slate-300"
//                   }`}
//                 >
//                   {selectedCountryName || "Tap a country on the map"}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => selectedCountryName && handleGuess(selectedCountryName)}
//                 disabled={!selectedCountryName}
//                 className={`mt-3 w-full rounded-2xl py-2.5 font-bold text-white transition-all active:scale-[0.98] min-h-[44px] ${
//                   selectedCountryName
//                     ? "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 shadow-lg"
//                     : "bg-slate-700/70 opacity-50 cursor-not-allowed"
//                 }`}
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}

//       {/* ── TV Classroom HUD ── */}
//       <AnimatePresence>
//         {config.isTV && (
//           <ClassroomHUD
//             score={score} totalCountries={CHALLENGE_SIZE}
//             selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
//             onGuess={handleGuess} onExitTVMode={toggleTVMode}
//             onBackToMenu={onBackToMenu}
//             onRestart={() => { setPhase("lobby"); setSelectedCountryName(null); }}
//             targetLabel="Find this country" mode="daily-challenge"
//           />
//         )}
//       </AnimatePresence>

//       {/* Fact card */}
//       {/* <CountryFactCard countryName={factCardCountry} onClose={() => setFactCardCountry(null)} autoCloseDuration={4000} /> */}
//     </div>
//   );
// }


//Daily Challenge yeni.Leaderboard,streak login eklendi.Database e eklendikten sonra
//yeni kod.Hata olursa github daki son commit e  af41371 dön.Bu commit ten sonra
//yapılan değişikliklerden biri de bu kod.Alembic,daily.py kodları ve burası
// DailyChallenge.tsx - Daily 10-country challenge, same for everyone each day
// DailyChallenge.tsx
// Fixes in this version vs step2:
//   1. localStorage result is scoped to user ID — guest results never block logged-in users
//   2. On login after guest play, server /daily/status is the truth — if not completed
//      server-side, user can play again even if localStorage has a guest result
//   3. Post-game registration prompt works correctly (was already correct, but
//      now user prop is guaranteed to arrive from App.tsx)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import WorldMap from "@/app/components/WorldMap";
import { useCountryData } from "@/app/hooks/useCountryData";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";
import { ClassroomHUD } from "@/app/components/ClassroomHUD";
import { toast, Toaster } from "sonner";
import {
  Loader2, Calendar, Share2, Trophy, CheckCircle2,
  XCircle, Clock, Home, Star, Medal, LogIn,
} from "lucide-react";
import { soundEffects } from "@/app/utils/soundEffects";
import {
  daily,
  type StoredUser,
  type DailyCompleteResponse,
  type DailyLeaderboardEntry,
} from "@/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DailyChallengeProps {
  onBackToMenu: () => void;
  user: StoredUser | null;
  onShowAuth?: () => void;
}

interface DailyResult {
  date: string;
  score: number;
  totalTime: number;
  results: ("correct" | "wrong" | "skipped")[];
  countryNames: string[];
  completed: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CHALLENGE_SIZE = 10;

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── localStorage keys scoped to user ID ──────────────────────────────────────
// Guest results use key "guest", logged-in users use their UUID.
// This means a guest result never blocks player1 from playing.
function resultKey(userId: string | null)  { return `dailyChallenge_result_${userId ?? "guest"}`; }
function streakKey(userId: string | null)  { return `dailyChallenge_streak_${userId ?? "guest"}`; }
function lastDateKey(userId: string | null){ return `dailyChallenge_lastDate_${userId ?? "guest"}`; }

function loadResult(userId: string | null): DailyResult | null {
  try {
    const raw = localStorage.getItem(resultKey(userId));
    if (!raw) return null;
    const parsed: DailyResult = JSON.parse(raw);
    return parsed.date === todayString() ? parsed : null;
  } catch { return null; }
}

function saveResult(r: DailyResult, userId: string | null) {
  try { localStorage.setItem(resultKey(userId), JSON.stringify(r)); } catch {}
}

function loadLocalStreak(userId: string | null): number {
  try {
    return parseInt(localStorage.getItem(streakKey(userId)) || "0", 10) || 0;
  } catch { return 0; }
}

function updateLocalStreak(userId: string | null): number {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  try {
    const lastDate = localStorage.getItem(lastDateKey(userId));
    let streak = loadLocalStreak(userId);
    streak = lastDate === yStr ? streak + 1 : 1;
    localStorage.setItem(lastDateKey(userId), todayString());
    localStorage.setItem(streakKey(userId), String(streak));
    return streak;
  } catch { return 1; }
}

// ─── Seeded RNG (unchanged) ───────────────────────────────────────────────────
function seededRng(seed: number) {
  return function () {
    seed |= 0;
    seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function dateToSeed(dateStr: string): number {
  return dateStr.split("-").reduce(
    (acc, part, i) => acc + parseInt(part) * [10000, 100, 1][i], 0
  );
}
function pickDailyCountries(allNames: string[], date: string, n: number): string[] {
  const rng  = seededRng(dateToSeed(date));
  const pool = [...allNames];
  const result: string[] = [];
  while (result.length < n && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function buildShareText(result: DailyResult, rank?: number | null): string {
  const emojiMap = { correct: "🟩", wrong: "🟥", skipped: "⬜" } as const;
  const grid = result.results.map((r) => emojiMap[r]).join("");
  const rankLine = rank ? `\nRank: #${rank} on today's leaderboard` : "";
  return (
    `🌍 Geography Daily Challenge — ${result.date}\n` +
    `Score: ${result.score}/${CHALLENGE_SIZE} | Time: ${formatTime(result.totalTime)}` +
    rankLine + `\n\n${grid}\n\nPlay at: Geography Master 🗺️`
  );
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─── Leaderboard table ────────────────────────────────────────────────────────
function LeaderboardTable({
  entries, userRank, username,
}: {
  entries: DailyLeaderboardEntry[];
  userRank: number | null;
  username: string;
}) {
  if (entries.length === 0) {
    return <p className="text-center text-xs text-slate-400 py-4">No results yet for today.</p>;
  }
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[28px_1fr_36px_52px] gap-1 px-2 pb-1 border-b border-slate-100 dark:border-slate-700">
        <span className="text-[10px] font-bold text-slate-400 uppercase">#</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase">Player</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase text-center">Score</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase text-right">Time</span>
      </div>
      {entries.map((entry) => {
        const isMe = entry.username === username;
        const rankEmoji = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;
        return (
          <div key={entry.rank}
            className={`grid grid-cols-[28px_1fr_36px_52px] gap-1 px-2 py-1.5 rounded-xl items-center ${
              isMe
                ? "bg-indigo-50 dark:bg-indigo-900/25 border border-indigo-200 dark:border-indigo-700/50"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}>
            <span className="text-xs font-black text-slate-500 dark:text-slate-400">
              {rankEmoji ?? entry.rank}
            </span>
            <span className={`text-xs font-semibold truncate ${
              isMe ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"
            }`}>
              {isMe ? "You" : entry.username}
            </span>
            <span className={`text-xs font-black text-center ${
              entry.correct_count === 10 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
            }`}>
              {entry.correct_count}/10
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 text-right">
              {entry.time_formatted}
            </span>
          </div>
        );
      })}
      {userRank !== null && !entries.find((e) => e.username === username) && (
        <div className="mt-1 pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-[28px_1fr_36px_52px] gap-1 px-2 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/25 border border-indigo-200 dark:border-indigo-700/50 items-center">
            <span className="text-xs font-black text-indigo-500">#{userRank}</span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">You</span>
            <span className="text-xs font-black text-center text-slate-700 dark:text-slate-300">—</span>
            <span className="text-[11px] font-mono text-slate-500 text-right">—</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DailyChallenge({ onBackToMenu, user, onShowAuth }: DailyChallengeProps) {
  const { countries, loading } = useCountryData();
  const { config, toggleTVMode } = useDisplayMode();

  const userId = user?.id ?? null;

  const [phase, setPhase] = useState<"lobby" | "playing" | "finished">("lobby");

  // Game state
  const [currentIndex, setCurrentIndex]               = useState(0);
  const [results, setResults]                         = useState<("correct" | "wrong" | "skipped")[]>([]);
  const [score, setScore]                             = useState(0);
  const [correctCountries, setCorrectCountries]       = useState<string[]>([]);
  const [skippedCountries, setSkippedCountries]       = useState<string[]>([]);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds]           = useState(0);
  const [timerActive, setTimerActive]                 = useState(false);

  const [streak, setStreak]         = useState(() => loadLocalStreak(userId));
  const [bestStreak, setBestStreak] = useState(0);

  const [serverResult, setServerResult]   = useState<DailyCompleteResponse | null>(null);
  const [serverLoading, setServerLoading] = useState(false);
  const [activeTab, setActiveTab]         = useState<"result" | "leaderboard">("result");

  // ── KEY FIX: savedResult is scoped to userId ─────────────────────────────
  // Guest results (userId=null) use a different key than player1's results.
  // So player1 logging in after guest play gets a clean slate.
  const [savedResult, setSavedResult] = useState<DailyResult | null>(() => loadResult(userId));

  // When user logs in mid-session, re-check their specific result
  // and sync streak from server
  useEffect(() => {
    const userSpecificResult = loadResult(userId);
    setSavedResult(userSpecificResult);
    setStreak(loadLocalStreak(userId));

    if (!user) return;

    // Sync from server — server is the authoritative source for logged-in users
    daily.status().then((s) => {
      setStreak(s.streak);
      setBestStreak(s.best_streak);

      if (s.completed_today && !userSpecificResult && s.today_result) {
        // Played on another device — sync to localStorage so lobby shows "done"
        const synced: DailyResult = {
          date: todayString(),
          score: s.today_result.correct_count,
          totalTime: s.today_result.total_time_seconds,
          results: [
            ...Array(s.today_result.correct_count).fill("correct") as ("correct")[],
            ...Array(CHALLENGE_SIZE - s.today_result.correct_count).fill("skipped") as ("skipped")[],
          ],
          countryNames: [],
          completed: true,
        };
        saveResult(synced, userId);
        setSavedResult(synced);
      } else if (!s.completed_today && userSpecificResult) {
        // localStorage says done but server doesn't — server wins, clear local
        // (edge case: user cleared DB or result expired)
        setSavedResult(null);
      }
    }).catch(() => {
      // Server unreachable — trust localStorage
    });
  }, [userId]); // re-runs whenever user logs in or out

  const allCountryNames = useMemo(() => countries.map((c) => c.properties.name), [countries]);
  const today = todayString();

  const dailyCountries = useMemo(
    () => allCountryNames.length > 0 ? pickDailyCountries(allCountryNames, today, CHALLENGE_SIZE) : [],
    [allCountryNames, today]
  );

  const currentTarget = dailyCountries[currentIndex] ?? null;

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const startChallenge = () => {
    setPhase("playing");
    setTimerActive(true);
    setCurrentIndex(0);
    setResults([]);
    setScore(0);
    setCorrectCountries([]);
    setSkippedCountries([]);
    setSelectedCountryName(null);
    setElapsedSeconds(0);
    setServerResult(null);
    setActiveTab("result");
  };

  const advanceRound = useCallback(
    async (outcome: "correct" | "wrong" | "skipped") => {
      const newResults = [...results, outcome];
      const newScore   = outcome === "correct" ? score + 1 : score;

      setResults(newResults);
      setScore(newScore);

      if (newResults.length >= CHALLENGE_SIZE) {
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

        // Save scoped to this user (guest or logged-in)
        saveResult(finalResult, userId);
        setSavedResult(finalResult);
        soundEffects.playAchievement();

        // ── Guest path ────────────────────────────────────────────────────
        if (!user) {
          const newStreak = updateLocalStreak(userId);
          setStreak(newStreak);
          setPhase("finished");
          return;
        }

        // ── Logged-in path ────────────────────────────────────────────────
        setPhase("finished");
        setServerLoading(true);
        try {
          const res = await daily.complete(newScore, elapsedSeconds);
          setServerResult(res);
          setStreak(res.streak);
          setBestStreak(res.best_streak);
          // Sync local streak
          try {
            localStorage.setItem(streakKey(userId), String(res.streak));
            localStorage.setItem(lastDateKey(userId), today);
          } catch {}
        } catch (err: any) {
          if (!err.message?.includes("409") && !err.message?.includes("Already completed")) {
            console.warn("Daily submit error:", err.message);
          }
          try {
            const lb = await daily.leaderboard();
            setServerResult({
              streak, best_streak: bestStreak,
              perfect_count: 0,
              user_rank: lb.user_rank,
              leaderboard: lb.leaderboard,
            });
          } catch {}
        } finally {
          setServerLoading(false);
        }
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedCountryName(null);
      }
    },
    [results, score, today, elapsedSeconds, dailyCountries, user, userId, streak, bestStreak]
  );

  const handleCountryClick = (geo: any) => {
    if (phase !== "playing") return;
    const name = geo.properties.name || geo.name;
    if (correctCountries.includes(name) || skippedCountries.includes(name)) {
      toast.info(`Already processed ${name}!`, { duration: 1000 });
      return;
    }
    soundEffects.playClick();
    setSelectedCountryName(name);
  };

  const handleGuess = (guess: string) => {
    if (!selectedCountryName || !currentTarget || phase !== "playing") return;
    const normGuess    = guess.toLowerCase().trim();
    const normSelected = selectedCountryName.toLowerCase().trim();
    const normTarget   = currentTarget.toLowerCase().trim();

    if (normGuess !== normSelected) {
      toast.error("Selected country changed. Try again.", { duration: 900 });
      return;
    }
    if (normGuess === normTarget) {
      soundEffects.playCorrect();
      toast.success(`✓ ${currentTarget}`, { duration: 1200 });
      setCorrectCountries((prev) => [...prev, currentTarget]);
      setTimeout(() => advanceRound("correct"), 1400);
    } else {
      soundEffects.playWrong();
      toast.error("Wrong country — try another one.", { duration: 1200 });
    }
  };

  const handleSkip = () => {
    if (!currentTarget || phase !== "playing") return;
    soundEffects.playWrong();
    setSkippedCountries((prev) =>
      prev.includes(currentTarget) ? prev : [...prev, currentTarget]
    );
    advanceRound("skipped");
  };

  const handleShare = () => {
    const text = buildShareText(savedResult!, serverResult?.user_rank);
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() =>
        toast.success("Result copied to clipboard!", { duration: 2000 })
      );
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
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
  // LOBBY
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "lobby") {
    return (
      <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-35">
          <WorldMap countries={countries} onCountryClick={() => {}}
            correctCountries={[]} wrongCountries={[]} skippedCountries={[]} hideLegend={true} />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-white/20">

            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-3">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daily Challenge</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{today}</p>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl px-4 py-3 mb-5">
              <Star className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <div className="text-center">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {user ? "Current Streak" : "Your Streak"}
                </p>
                <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                  {streak} day{streak !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

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
                  <div className="flex justify-center gap-0.5 mt-3 text-xl">
                    {savedResult.results.map((r, i) => (
                      <span key={i}>{r === "correct" ? "🟩" : r === "wrong" ? "🟥" : "⬜"}</span>
                    ))}
                  </div>
                </div>
                <button onClick={handleShare}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3">
                  <Share2 className="w-4 h-4" /> Share Result
                </button>
                <p className="text-center text-xs text-slate-400 mb-3">
                  Come back tomorrow for a new challenge!
                </p>
              </>
            ) : (
              <>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-4 space-y-1.5">
                  {[
                    `📍 ${CHALLENGE_SIZE} countries — one at a time`,
                    "🗺️  Click the country on the map",
                    "⏩  Skip if you're not sure",
                    "📊  Same challenge for everyone today",
                  ].map((l) => <p key={l} className="text-xs text-slate-600 dark:text-slate-300">{l}</p>)}
                </div>

                {/* Guest nudge — doesn't block play */}
                {!user && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl px-4 py-3 mb-4 flex items-start gap-3">
                    <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Sign in to appear on the leaderboard
                      </p>
                      <p className="text-[11px] text-amber-600/70 dark:text-amber-500/70 mt-0.5">
                        Your streak will persist across devices.
                      </p>
                    </div>
                    {onShowAuth && (
                      <button onClick={onShowAuth}
                        className="flex-shrink-0 text-[11px] font-bold text-amber-600 dark:text-amber-400 underline underline-offset-2">
                        Sign in
                      </button>
                    )}
                  </div>
                )}

                <button onClick={startChallenge}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3">
                  <Calendar className="w-5 h-5" /> Start Today's Challenge
                </button>
              </>
            )}

            <button onClick={onBackToMenu}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Back to Menu
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
    const pct   = Math.round((savedResult.score / CHALLENGE_SIZE) * 100);
    const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🌟" : pct >= 40 ? "👍" : "💪";

    return (
      <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-25">
          <WorldMap countries={countries} onCountryClick={() => {}}
            correctCountries={correctCountries} wrongCountries={[]}
            skippedCountries={skippedCountries} hideLegend={true} />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-white/20 my-4">

            <div className="text-center mb-4">
              <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }} className="text-5xl mb-2">
                {emoji}
              </motion.p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Challenge Complete!</h2>
              <p className="text-xs text-slate-400 mt-1">{today}</p>
            </div>

            {/* Score */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl p-4 text-center mb-4">
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Your Score</p>
              <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.15 }}
                className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
                {savedResult.score}<span className="text-2xl text-indigo-400">/{CHALLENGE_SIZE}</span>
              </motion.p>
              <p className="text-xs text-indigo-500 mt-1">
                {formatTime(savedResult.totalTime)} • {pct}%
                {serverResult?.user_rank && (
                  <span className="ml-2 font-bold">• Rank #{serverResult.user_rank}</span>
                )}
              </p>
            </div>

            {/* Emoji grid */}
            <div className="flex justify-center gap-1 text-2xl mb-4">
              {savedResult.results.map((r, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.05 * i, type: "spring" }}>
                  {r === "correct" ? "🟩" : r === "wrong" ? "🟥" : "⬜"}
                </motion.span>
              ))}
            </div>

            {/* Streak */}
            <div className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl px-3 py-2 mb-4">
              <Star className="w-4 h-4 text-indigo-500" />
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                🔥 {streak} day streak
                {bestStreak > streak ? ` · Best: ${bestStreak}` : ""}
                {" "}— come back tomorrow!
              </p>
            </div>

            {/* Tabs — only for logged-in users */}
            {user && (
              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-3">
                <button onClick={() => setActiveTab("result")}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${
                    activeTab === "result"
                      ? "bg-indigo-500 text-white"
                      : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}>
                  Your Results
                </button>
                <button onClick={() => setActiveTab("leaderboard")}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${
                    activeTab === "leaderboard"
                      ? "bg-indigo-500 text-white"
                      : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}>
                  🏆 Leaderboard
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* Result breakdown */}
              {(activeTab === "result" || !user) && (
                <motion.div key="result-tab"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 mb-4 space-y-1.5 max-h-44 overflow-y-auto">
                    {savedResult.countryNames.map((name, i) => {
                      const r = savedResult.results[i];
                      const Icon = r === "correct" ? CheckCircle2 : r === "skipped" ? Clock : XCircle;
                      const col = r === "correct"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : r === "skipped" ? "text-slate-400"
                        : "text-red-500 dark:text-red-400";
                      return (
                        <div key={name} className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${col}`} />
                          <p className={`text-xs font-medium ${col}`}>{name}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Post-game sign-in prompt for guests ── */}
                  {!user && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/25 dark:to-purple-900/25 border border-indigo-200 dark:border-indigo-700/50 rounded-2xl px-4 py-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Medal className="w-5 h-5 text-indigo-500" />
                        <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                          See where you rank!
                        </p>
                      </div>
                      <p className="text-[12px] text-indigo-600/80 dark:text-indigo-400/80 mb-3 leading-relaxed">
                        Sign in to submit your score to today's leaderboard and keep your streak forever.
                      </p>
                      {onShowAuth && (
                        <button onClick={onShowAuth}
                          className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg">
                          <LogIn className="w-4 h-4" />
                          Sign in to compete
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Leaderboard */}
              {activeTab === "leaderboard" && user && (
                <motion.div key="lb-tab"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 mb-4 max-h-52 overflow-y-auto">
                    {serverLoading ? (
                      <div className="flex items-center justify-center py-6 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        <span className="text-xs text-slate-400">Loading leaderboard…</span>
                      </div>
                    ) : serverResult ? (
                      <LeaderboardTable
                        entries={serverResult.leaderboard}
                        userRank={serverResult.user_rank}
                        username={user.username}
                      />
                    ) : (
                      <p className="text-center text-xs text-slate-400 py-4">
                        Leaderboard unavailable right now.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handleShare}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-2">
              <Share2 className="w-4 h-4" /> Share Result
            </button>
            <button onClick={onBackToMenu}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Back to Menu
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

      <div className="absolute inset-0 z-0">
        <WorldMap countries={countries} onCountryClick={handleCountryClick}
          selectedCountryName={selectedCountryName}
          correctCountries={correctCountries} wrongCountries={[]}
          skippedCountries={skippedCountries} hideLegend={true} />
      </div>

      {!config.isTV && (
        <div className="absolute top-4 left-0 right-0 z-50 px-4">
          <div className="flex justify-center">
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-xl rounded-2xl border border-white/30 px-4 py-3 w-full max-w-lg">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentIndex + 1}<span className="text-slate-400 font-normal">/{CHALLENGE_SIZE}</span>
                  </span>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-slate-400 font-medium">Find this country</p>
                  <p className="text-base font-black text-indigo-600 dark:text-indigo-400 leading-tight truncate">
                    {currentTarget}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(elapsedSeconds)}
                  </div>
                  <button onClick={handleSkip}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-semibold transition-all active:scale-95">
                    Skip
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {dailyCountries.map((_, i) => {
                  const r = results[i];
                  return (
                    <div key={i} className={`flex-1 h-2 rounded-full transition-all ${
                      r === "correct" ? "bg-emerald-500"
                      : r === "wrong" ? "bg-red-400"
                      : r === "skipped" ? "bg-slate-300 dark:bg-slate-600"
                      : i === currentIndex ? "bg-indigo-400 animate-pulse"
                      : "bg-slate-200 dark:bg-slate-700"
                    }`} />
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {!config.isTV && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[380px] z-50"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}>
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl px-4 py-3">
            <div className="text-center">
              <div className="min-h-[40px] flex items-center justify-center">
                <p className={`font-black leading-tight text-[16px] sm:text-[18px] ${
                  selectedCountryName ? "text-white" : "text-slate-300"}`}>
                  {selectedCountryName || "Tap a country on the map"}
                </p>
              </div>
              <button type="button"
                onClick={() => selectedCountryName && handleGuess(selectedCountryName)}
                disabled={!selectedCountryName}
                className={`mt-3 w-full rounded-2xl py-2.5 font-bold text-white transition-all active:scale-[0.98] min-h-[44px] ${
                  selectedCountryName
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 shadow-lg"
                    : "bg-slate-700/70 opacity-50 cursor-not-allowed"
                }`}>
                Submit
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
    </div>
  );
}