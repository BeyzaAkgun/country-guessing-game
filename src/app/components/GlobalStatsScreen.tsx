// GlobalStatsScreen.tsx - Full profile/stats page
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Star, Trophy, Zap, Calendar, BookOpen, Timer,
  Globe, Award, BarChart3, TrendingUp, Map,
} from "lucide-react";
import { getXPState, getLevelTitle, loadTotalXP } from "@/app/utils/xpSystem";

function loadSpeedBest(duration: number): number {
  try { return parseInt(localStorage.getItem(`speedRound_pb_${duration}`) || "0", 10) || 0; } catch { return 0; }
}

function loadDailyResult(): { score: number; date: string; streak: number } | null {
  try {
    const raw = localStorage.getItem("dailyChallenge_result");
    const streak = parseInt(localStorage.getItem("dailyChallenge_streak") || "0", 10) || 0;
    if (!raw) return { score: 0, date: "—", streak };
    const r = JSON.parse(raw);
    return { score: r.score ?? 0, date: r.date ?? "—", streak };
  } catch { return null; }
}

function loadContinentProgress(): Record<string, { done: number; total: number }> {
  const continents = ["Africa", "Europe", "Asia", "North America", "South America", "Oceania"];
  const totals: Record<string, number> = {
    "Africa": 54, "Europe": 41, "Asia": 49,
    "North America": 15, "South America": 12, "Oceania": 8,
  };
  const result: Record<string, { done: number; total: number }> = {};
  for (const c of continents) {
    try {
      const arr = JSON.parse(localStorage.getItem(`study_progress_${c}`) || "[]");
      result[c] = { done: Array.isArray(arr) ? arr.length : 0, total: totals[c] };
    } catch { result[c] = { done: 0, total: totals[c] }; }
  }
  return result;
}

function loadClassicStats(): { score: number } {
  try {
    const raw = localStorage.getItem("gameState_classic");
    if (!raw) return { score: 0 };
    const s = JSON.parse(raw);
    return { score: s.score ?? 0 };
  } catch { return { score: 0 }; }
}

function StatCard({ icon, label, value, sub, color = "blue" }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-indigo-600", yellow: "from-yellow-400 to-orange-500",
    green: "from-emerald-500 to-teal-600", purple: "from-purple-500 to-indigo-600",
    amber: "from-amber-400 to-orange-500",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
      <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${colorMap[color] ?? colorMap.blue} mb-3`}>
        <div className="text-white w-4 h-4">{icon}</div>
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function ModeRow({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <div className={`p-1.5 rounded-lg ${accent}`}>{icon}</div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ContinentBar({ name, done, total, gradient }: {
  name: string; done: number; total: number; gradient: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{name}</p>
        <p className="text-xs text-slate-400">{done}/{total} ({pct}%)</p>
      </div>
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
        />
      </div>
    </div>
  );
}

interface GlobalStatsScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalStatsScreen({ isOpen, onClose }: GlobalStatsScreenProps) {
  const xpState = useMemo(() => getXPState(loadTotalXP()), [isOpen]);
  const daily = useMemo(() => loadDailyResult(), [isOpen]);
  const continentProgress = useMemo(() => loadContinentProgress(), [isOpen]);
  const classicStats = useMemo(() => loadClassicStats(), [isOpen]);

  const speedBest60 = loadSpeedBest(60);
  const speedBest90 = loadSpeedBest(90);
  const speedBest120 = loadSpeedBest(120);
  const totalStudied = Object.values(continentProgress).reduce((s, c) => s + c.done, 0);
  const totalCountries = Object.values(continentProgress).reduce((s, c) => s + c.total, 0);
  const continentsCompleted = Object.values(continentProgress).filter(c => c.done > 0 && c.done >= c.total).length;
  const levelPct = xpState.xpForNextLevel > 0
    ? Math.min((xpState.xpInCurrentLevel / xpState.xpForNextLevel) * 100, 100) : 100;

  const continentGradients: Record<string, string> = {
    "Africa": "from-amber-400 to-orange-500", "Europe": "from-blue-400 to-indigo-500",
    "Asia": "from-red-400 to-rose-500", "North America": "from-green-400 to-emerald-500",
    "South America": "from-yellow-400 to-lime-500", "Oceania": "from-cyan-400 to-teal-500",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" />
          <motion.div
            initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[90] pointer-events-none"
          >
            <div className="pointer-events-auto w-full sm:max-w-lg sm:mx-4 bg-slate-50 dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 pt-5 pb-6 flex-shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Your Profile</p>
                    <h2 className="text-2xl font-black text-white">Geography Stats</h2>
                  </div>
                  <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="bg-white/15 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-xl font-black text-white">{xpState.level}</span>
                    </div>
                    <div>
                      <p className="text-white font-black text-lg leading-tight">{getLevelTitle(xpState.level)}</p>
                      <p className="text-indigo-200 text-xs">
                        {xpState.level < 10 ? `${xpState.xpInCurrentLevel} / ${xpState.xpForNextLevel} XP to Level ${xpState.level + 1}` : "Max Level Reached 🏆"}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-white font-black text-lg">{xpState.totalXP}</p>
                      <p className="text-indigo-200 text-[10px]">Total XP</p>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${levelPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={<Globe className="w-4 h-4" />} label="Countries Found (Classic)" value={classicStats.score} color="blue" />
                  <StatCard icon={<BookOpen className="w-4 h-4" />} label="Countries Studied" value={totalStudied} sub={`of ${totalCountries} total`} color="amber" />
                  <StatCard icon={<Calendar className="w-4 h-4" />} label="Daily Streak" value={`${daily?.streak ?? 0} days`} sub={`Last score: ${daily?.score ?? 0}/10`} color="purple" />
                  <StatCard icon={<Award className="w-4 h-4" />} label="Continents Completed" value={`${continentsCompleted}/6`} color="green" />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Timer className="w-4 h-4 text-yellow-500" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Speed Round — Personal Bests</p>
                  </div>
                  <ModeRow icon={<Timer className="w-3.5 h-3.5 text-green-600" />} label="60 seconds" value={speedBest60 > 0 ? `${speedBest60} countries` : "Not played"} accent="bg-green-100 dark:bg-green-900/30" />
                  <ModeRow icon={<Timer className="w-3.5 h-3.5 text-yellow-600" />} label="90 seconds" value={speedBest90 > 0 ? `${speedBest90} countries` : "Not played"} accent="bg-yellow-100 dark:bg-yellow-900/30" />
                  <ModeRow icon={<Timer className="w-3.5 h-3.5 text-orange-600" />} label="120 seconds" value={speedBest120 > 0 ? `${speedBest120} countries` : "Not played"} accent="bg-orange-100 dark:bg-orange-900/30" />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Mode Activity</p>
                  </div>
                  <ModeRow icon={<Map className="w-3.5 h-3.5 text-blue-600" />} label="Classic Mode" value={classicStats.score > 0 ? `${classicStats.score} found` : "Not started"} accent="bg-blue-100 dark:bg-blue-900/30" />
                  <ModeRow icon={<Calendar className="w-3.5 h-3.5 text-indigo-600" />} label="Daily Challenge" value={daily && daily.score > 0 ? `Last: ${daily.score}/10` : "Not played today"} accent="bg-indigo-100 dark:bg-indigo-900/30" />
                  <ModeRow icon={<BookOpen className="w-3.5 h-3.5 text-amber-600" />} label="Study Mode" value={totalStudied > 0 ? `${totalStudied} studied` : "Not started"} accent="bg-amber-100 dark:bg-amber-900/30" />
                  <ModeRow icon={<Zap className="w-3.5 h-3.5 text-yellow-600" />} label="Speed Round" value={speedBest60 + speedBest90 + speedBest120 > 0 ? "Played ✓" : "Not played"} accent="bg-yellow-100 dark:bg-yellow-900/30" />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-4 h-4 text-teal-500" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Continent Study Progress</p>
                  </div>
                  {Object.entries(continentProgress).map(([name, { done, total }]) => (
                    <ContinentBar key={name} name={name} done={done} total={total} gradient={continentGradients[name] ?? "from-slate-400 to-slate-500"} />
                  ))}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Level Path</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(lvl => {
                      const unlocked = xpState.level >= lvl;
                      const current = xpState.level === lvl;
                      return (
                        <div key={lvl} className={`aspect-square rounded-xl flex items-center justify-center text-sm font-black transition-all ${current ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md scale-110" : unlocked ? "bg-gradient-to-br from-indigo-400 to-purple-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}>
                          {lvl}
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-1.5">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(lvl => (
                      <p key={lvl} className="text-[8px] text-center text-slate-400 leading-tight truncate px-0.5">
                        {getLevelTitle(lvl).split(" ").slice(-1)[0]}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-center">
                  <p className="text-white font-bold text-sm mb-1">
                    {xpState.level < 10 ? `${xpState.xpForNextLevel - xpState.xpInCurrentLevel} XP until Level ${xpState.level + 1}` : "You've reached the top! 🏆"}
                  </p>
                  <p className="text-indigo-200 text-xs">
                    {totalStudied < totalCountries ? `${totalCountries - totalStudied} more countries to study across all continents` : "All continents mastered — you're a Geography Legend!"}
                  </p>
                </div>
                <div className="h-2" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}