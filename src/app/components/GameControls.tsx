// GameControls.tsx - Per-game top bar. TV + Profile handled by root GameFAB.
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, HelpCircle, Check, Globe, RotateCcw, Home, BarChart3, Trophy, Volume2, VolumeX } from "lucide-react";
import { LevelBadge } from "@/app/components/LevelBadge";

interface GameControlsProps {
  selectedCountryName: string | null;
  onGuess: (name: string) => void;
  onHint?: () => void;
  onRestart: () => void;
  onBackToMenu?: () => void;
  onOpenStats?: () => void;
  onOpenAchievements?: () => void;
  onToggleSound?: () => void;
  soundEnabled?: boolean;
  score: number;
  totalCountries: number;
  allCountryNames: string[];
  hintsAvailable?: boolean;
  remainingHints?: number;
  xpVersion?: number;
}

export function GameControls({
  selectedCountryName, onGuess, onHint, onRestart, onBackToMenu,
  onOpenStats, onOpenAchievements, onToggleSound,
  soundEnabled = true, score, totalCountries, allCountryNames,
  hintsAvailable = true, remainingHints = 0, xpVersion = 0,
}: GameControlsProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (selectedCountryName) { setInput(""); setShowSuggestions(false); }
  }, [selectedCountryName]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    onGuess(input.trim());
    setInput(""); setShowSuggestions(false);
  };

  const filteredSuggestions = input.length > 0
    ? allCountryNames
        .filter(n => n.toLowerCase().startsWith(input.toLowerCase()) || n.toLowerCase().includes(input.toLowerCase()))
        .sort((a, b) => {
          const aS = a.toLowerCase().startsWith(input.toLowerCase());
          const bS = b.toLowerCase().startsWith(input.toLowerCase());
          if (aS && !bS) return -1; if (!aS && bS) return 1;
          return a.localeCompare(b);
        }).slice(0, 8)
    : [];

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-50 p-2 sm:p-3">
        <div className="flex justify-center">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-xl rounded-xl sm:rounded-2xl border border-white/30 px-2 sm:px-4 py-2 w-full max-w-2xl">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex-shrink-0"><LevelBadge xpVersion={xpVersion} /></div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-1 sm:ml-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-sm sm:text-lg font-bold tabular-nums">
                  {score}<span className="text-xs text-slate-400 font-normal">/{totalCountries}</span>
                </span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-0.5 sm:gap-1">
                {onToggleSound && (
                  <button onClick={onToggleSound} className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  </button>
                )}
                {onOpenStats && (
                  <button onClick={onOpenStats} className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                  </button>
                )}
                {onOpenAchievements && (
                  <button onClick={onOpenAchievements} className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                  </button>
                )}
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />
                {onBackToMenu && (
                  <button onClick={onBackToMenu} className="px-1.5 sm:px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95">
                    <Home className="w-3.5 h-3.5" /><span className="hidden sm:inline">Menu</span>
                  </button>
                )}
                <button onClick={onRestart} className="px-1.5 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95">
                  <RotateCcw className="w-3.5 h-3.5" /><span className="hidden sm:inline">Restart</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom guess panel — full-width sheet on mobile */}
      <AnimatePresence>
        {selectedCountryName && (
          <motion.div
            initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="absolute z-40 bottom-0 left-0 right-0 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-[500px]"
          >
            <div className="bg-white dark:bg-slate-900 shadow-2xl border-t sm:border border-border/50 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5">
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-xs sm:text-sm text-slate-500">
                    Selected: <span className="font-bold text-slate-800 dark:text-slate-100">{selectedCountryName}</span>
                  </span>
                </div>
                {onHint && (hintsAvailable ? (
                  <button onClick={onHint} className="text-xs flex items-center gap-1 text-orange-500 hover:text-orange-600 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Hint {remainingHints > 0 && <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-1 py-0.5 rounded-full text-[10px]">{remainingHints}</span>}
                  </button>
                ) : <span className="text-xs text-slate-400">No hints left</span>)}
              </div>
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                  <input type="text" value={input}
                    onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type country name..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-4 sm:pl-5 pr-12 text-base sm:text-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                    autoFocus
                  />
                  <button type="submit" className="absolute right-2 p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl transition-colors active:scale-95">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl border border-border/50 overflow-hidden max-h-48 overflow-y-auto z-50">
                    {filteredSuggestions.map(s => (
                      <button key={s} type="button"
                        onClick={() => { setInput(s); onGuess(s); setShowSuggestions(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-border/30 last:border-0 transition-colors flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium">{s}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap hint */}
      <AnimatePresence>
        {!selectedCountryName && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            <div className="bg-black/80 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full backdrop-blur-sm text-xs sm:text-sm font-medium shadow-2xl whitespace-nowrap">
              👆 Tap any country to start guessing
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}