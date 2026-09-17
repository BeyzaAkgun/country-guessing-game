// GameControls.tsx - Per-game top bar. TV + Profile handled by root GameFAB.
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  MapPin,
  HelpCircle,
  Check,
  Globe,
  RotateCcw,
  Home,
  BarChart3,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { LevelBadge } from "@/app/components/LevelBadge";

interface GameControlsProps {
  selectedCountryName: string | null;

  onGuess: (name: string) => void;

  onHint?: () => void;

  onPass?: () => void;
  onReveal?: () => void;

  onConfirm?: () => void;
  confirmDisabled?: boolean;
  passDisabled?: boolean;
  revealDisabled?: boolean;

  useClickConfirm?: boolean;

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

  passesLeft?: number;
  queueCount?: number;

  inputResetToken?: number;
}

export function GameControls({
  selectedCountryName,
  onGuess,
  onHint,
  onPass,
  onReveal,
  onConfirm,
  confirmDisabled = false,
  passDisabled = false,
  revealDisabled = false,
  useClickConfirm = false,
  onRestart,
  onBackToMenu,
  onOpenStats,
  onOpenAchievements,
  onToggleSound,
  soundEnabled = true,
  score,
  totalCountries,
  allCountryNames,
  hintsAvailable = true,
  remainingHints = 0,
  xpVersion = 0,
  passesLeft = 0,
  queueCount,
  inputResetToken = 0,
}: GameControlsProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (useClickConfirm) return;
    if (!inputRef.current) return;

    const handleFocus = () => {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    };

    const input = inputRef.current;
    input.addEventListener("focus", handleFocus);
    return () => input.removeEventListener("focus", handleFocus);
  }, [useClickConfirm]);

  useEffect(() => {
    if (useClickConfirm) return;

    if (selectedCountryName) {
      setInput("");
      setShowSuggestions(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedCountryName, useClickConfirm]);

  useEffect(() => {
    if (useClickConfirm) return;
    setInput("");
    setShowSuggestions(false);
  }, [inputResetToken, useClickConfirm]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    onGuess(input.trim());
    setInput("");
    setShowSuggestions(false);
  };

  const filteredSuggestions =
    input.length > 0
      ? allCountryNames
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
          .slice(0, 8)
      : [];

  const isClickConfirm = useClickConfirm;

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-50 p-2 sm:p-3">
        <div className="flex justify-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-xl rounded-xl sm:rounded-2xl border border-white/30 px-2 sm:px-4 py-2 w-full max-w-2xl"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex-shrink-0">
                <LevelBadge xpVersion={xpVersion} />
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 ml-1 sm:ml-2">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                <span className="text-sm sm:text-lg font-bold tabular-nums">
                  {score}
                  <span className="text-xs text-slate-400 font-normal">
                    /{totalCountries}
                  </span>
                </span>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-1 sm:gap-1">
                {onToggleSound && (
                  <button
                    onClick={onToggleSound}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-blue-500" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                )}

                {onOpenStats && (
                  <button
                    onClick={onOpenStats}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-green-600" />
                  </button>
                )}

                {onOpenAchievements && (
                  <button
                    onClick={onOpenAchievements}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trophy className="w-4 h-4 text-yellow-600" />
                  </button>
                )}

                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

                {onBackToMenu && (
                  <button
                    onClick={onBackToMenu}
                    className="min-h-[44px] px-2.5 sm:px-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Home className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Menu</span>
                  </button>
                )}

                <button
                  onClick={onRestart}
                  className="min-h-[44px] px-2.5 sm:px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">Restart</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Pill Bar - Click Confirm Mode */}
      {isClickConfirm && (
        <motion.div
          ref={panelRef}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="fixed z-40 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto md:max-w-[720px]"
          style={{ bottom: 0 }}
        >
          <div className="bg-slate-900/85 backdrop-blur-xl rounded-t-2xl md:rounded-full px-3 py-2.5 border border-white/10 shadow-2xl shadow-black/50"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
            <div className="flex items-center gap-2 flex-wrap md:flex-nowrap justify-center">
              {/* Selected Country or Prompt */}
              <div className="flex-shrink-0 bg-slate-700/80 rounded-full px-3 py-1.5 min-w-0">
                <p className="text-white text-sm font-medium truncate max-w-[140px] md:max-w-[180px]">
                  {selectedCountryName ? selectedCountryName : "Tap a country"}
                </p>
              </div>

              {/* Confirm Button */}
              <button
                onClick={onConfirm}
                disabled={confirmDisabled || !selectedCountryName}
                className="flex-shrink-0 h-10 px-4 md:px-5 rounded-full font-bold text-white text-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
              >
                <span className="hidden md:inline">Confirm Answer</span>
                <span className="md:hidden">Confirm</span>
              </button>

              {/* Pass Button */}
              {onPass && (
                <button
                  onClick={onPass}
                  disabled={passDisabled}
                  className="flex-shrink-0 h-10 px-3 md:px-4 rounded-full font-semibold text-white text-sm bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center gap-1.5"
                >
                  <span className="hidden md:inline">Pass</span>
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{passesLeft}</span>
                </button>
              )}

              {/* Reveal Button */}
              {onReveal && (
                <button
                  onClick={onReveal}
                  disabled={revealDisabled}
                  className="flex-shrink-0 h-10 px-3 md:px-4 rounded-full font-semibold text-white text-sm bg-rose-500 hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Reveal</span>
                </button>
              )}

              {/* Hint Button */}
              {onHint && hintsAvailable && (
                <button
                  onClick={onHint}
                  className="flex-shrink-0 h-10 px-3 rounded-full font-semibold text-amber-400 text-sm bg-amber-500/20 hover:bg-amber-500/30 transition-all active:scale-[0.97] flex items-center gap-1.5"
                >
                  <span className="hidden md:inline">Hint</span>
                  {remainingHints > 0 && (
                    <span className="text-xs bg-amber-500/30 px-1.5 py-0.5 rounded-full">{remainingHints}</span>
                  )}
                </button>
              )}

              {/* Stats - Desktop only */}
              <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 pl-2 border-l border-white/10 ml-1">
                {typeof queueCount === "number" && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {queueCount}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Stats Row */}
            <div className="flex md:hidden items-center justify-center gap-4 mt-2 pt-2 border-t border-white/10 text-xs text-slate-400">
              {typeof queueCount === "number" && (
                <span>{queueCount} left</span>
              )}
              <span>{passesLeft} passes</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Pill Bar - Text Input Mode */}
      <AnimatePresence>
        {!isClickConfirm && selectedCountryName && (
          <motion.div
            ref={panelRef}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed z-40 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[500px]"
            style={{ bottom: 0 }}
          >
            <div className="bg-slate-900/85 backdrop-blur-xl rounded-t-2xl md:rounded-2xl px-3 py-3 border border-white/10 shadow-2xl shadow-black/50"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
              {/* Selected Country Display */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300 font-medium">Name this country</span>
                </div>

                {onHint && hintsAvailable && (
                  <button
                    onClick={onHint}
                    className="h-8 px-2.5 text-xs flex items-center gap-1 text-amber-400 font-semibold rounded-full bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {remainingHints > 0 && (
                      <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded-full">{remainingHints}</span>
                    )}
                  </button>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={(e) => {
                      setShowSuggestions(true);
                      setTimeout(() => {
                        e.currentTarget.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }, 300);
                    }}
                    placeholder="Type country name..."
                    className="w-full bg-slate-800/80 border border-white/10 rounded-full py-3 pl-4 pr-14 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                  />

                  <button
                    type="submit"
                    className="absolute right-1.5 w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-400 text-white rounded-full transition-colors active:scale-95"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden max-h-48 overflow-y-auto z-50"
                  >
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setInput(s);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 min-h-[44px] flex items-center hover:bg-slate-700/50 border-b border-white/5 last:border-0 transition-colors gap-2 text-white"
                      >
                        <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
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

      {/* Floating Prompt - When no country selected and not click-confirm mode */}
      <AnimatePresence>
        {!selectedCountryName && !isClickConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed left-1/2 -translate-x-1/2 pointer-events-none z-10"
            style={{
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
            }}
          >
            <div className="bg-slate-900/85 backdrop-blur-xl text-white px-5 py-3 rounded-full border border-white/10 text-sm font-medium shadow-2xl shadow-black/50 whitespace-nowrap">
              Tap any country to start guessing
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}