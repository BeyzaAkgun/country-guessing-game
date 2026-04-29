// GameFAB.tsx - Universal floating action button, always on screen everywhere
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Tv2, Volume2, VolumeX, X, ChevronRight, Star, LogOut, LogIn } from "lucide-react";
import { GlobalStatsScreen } from "@/app/components/GlobalStatsScreen";
import { getXPState, getLevelTitle, loadTotalXP } from "@/app/utils/xpSystem";
import { soundEffects } from "@/app/utils/soundEffects";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";
import type { StoredUser } from "@/api/client";

// interface GameFABProps {
//   onTVModeChange?: (isTV: boolean) => void;
//   onLogout?: () => void;
//   onShowAuth?: () => void;
//   user?: StoredUser | null;
// }

  interface GameFABProps {
    onTVModeChange?: (isTV: boolean) => void;
    onLogout?: () => void;
    onShowAuth?: () => void;
    user?: StoredUser | null;
    inGame?: boolean;
  }

// export function GameFAB({ onTVModeChange, onLogout, onShowAuth, user }: GameFABProps) {
export function GameFAB({ onTVModeChange, onLogout, onShowAuth, user, inGame = false }: GameFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showGlobalStats, setShowGlobalStats] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem("geogame_sound") !== "false"; } catch { return true; }
  });
  const [xpTick, setXpTick] = useState(0);
  const { config, toggleTVMode } = useDisplayMode();

  useEffect(() => {
    const handler = () => setXpTick(t => t + 1);
    window.addEventListener("xp-updated", handler);
    return () => window.removeEventListener("xp-updated", handler);
  }, []);

  // Guests never see XP/level data — use a zero state so nothing leaks through
  const isGuest = !user;
  const xpState = isGuest ? getXPState(0) : getXPState(loadTotalXP());
  const levelPct = isGuest
    ? 0
    : xpState.xpForNextLevel > 0
      ? Math.min((xpState.xpInCurrentLevel / xpState.xpForNextLevel) * 100, 100)
      : 100;

  const handleToggleSound = useCallback(() => {
    const next = soundEffects.toggle();
    setSoundEnabled(next);
    try { localStorage.setItem("geogame_sound", String(next)); } catch {}
  }, []);

  const handleToggleTV = useCallback(() => {
    toggleTVMode();
    onTVModeChange?.(!config.isTV);
    setIsOpen(false);
  }, [toggleTVMode, config.isTV, onTVModeChange]);

  const handleOpenStats = useCallback(() => {
    setShowGlobalStats(true);
    setIsOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    setIsOpen(false);
    onLogout?.();
  }, [onLogout]);

  const handleShowAuth = useCallback(() => {
    setIsOpen(false);
    onShowAuth?.();
  }, [onShowAuth]);

  if (config.isTV) {
    return (
      <button
        onClick={handleToggleTV}
        className="fixed bottom-6 right-6 z-[200] bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-semibold text-sm transition-all active:scale-95"
      >
        <Tv2 className="w-4 h-4" />
        Exit TV Mode
      </button>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[190] bg-black/30 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[200] w-72 sm:w-80"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                      {isGuest
                        ? <User className="w-6 h-6 text-white/80" />
                        : <span className="text-xl font-black text-white">{xpState.level}</span>
                      }
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">
                        {isGuest ? "Guest" : (user?.username ?? getLevelTitle(xpState.level))}
                      </p>
                      <p className="text-indigo-200 text-xs">
                        {isGuest ? "Sign in to save progress" : `${xpState.totalXP} XP total`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Only show XP bar for logged-in users */}
                {!isGuest && (
                  <>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${levelPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full bg-white/80 rounded-full"
                      />
                    </div>
                    {xpState.level < 10 && (
                      <p className="text-indigo-200 text-[10px] mt-1">
                        {xpState.xpForNextLevel - xpState.xpInCurrentLevel} XP to Level {xpState.level + 1}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Menu items */}
              <div className="p-2">
                {/* Profile & Stats only shown to logged-in users */}
                {!isGuest && (
                  <DrawerItem
                    icon={<User className="w-4 h-4 text-indigo-500" />}
                    label="Profile & Stats"
                    sub="XP, levels, all-mode records"
                    bg="bg-indigo-50 dark:bg-indigo-900/20"
                    onClick={handleOpenStats}
                  />
                )}
                <DrawerItem
                  icon={<Tv2 className="w-4 h-4 text-blue-500" />}
                  label="Classroom / TV Mode"
                  sub="Large display for projectors"
                  bg="bg-blue-50 dark:bg-blue-900/20"
                  onClick={handleToggleTV}
                />
                <DrawerItem
                  icon={
                    soundEnabled
                      ? <Volume2 className="w-4 h-4 text-green-500" />
                      : <VolumeX className="w-4 h-4 text-slate-400" />
                  }
                  label={soundEnabled ? "Sound: On" : "Sound: Off"}
                  sub="Toggle sound effects"
                  bg={soundEnabled ? "bg-green-50 dark:bg-green-900/20" : "bg-slate-100 dark:bg-slate-800"}
                  onClick={handleToggleSound}
                  rightEl={
                    <div className={`w-8 h-4 rounded-full transition-colors flex items-center ${soundEnabled ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                      <div className={`w-3 h-3 bg-white rounded-full shadow mx-0.5 transition-transform ${soundEnabled ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  }
                />

                {!user && onShowAuth && (
                  <DrawerItem
                    icon={<LogIn className="w-4 h-4 text-emerald-500" />}
                    label="Sign In / Register"
                    sub="Save progress & play ranked multiplayer"
                    bg="bg-emerald-50 dark:bg-emerald-900/20"
                    onClick={handleShowAuth}
                  />
                )}
                {user && onLogout && (
                  <DrawerItem
                    icon={<LogOut className="w-4 h-4 text-red-500" />}
                    label="Sign Out"
                    sub={`Signed in as ${user.username}`}
                    bg="bg-red-50 dark:bg-red-900/20"
                    onClick={handleLogout}
                  />
                )}
              </div>

              <div className="px-4 pb-3 pt-1">
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                  Geography Master · {isGuest ? "Sign in to save your progress" : "Your progress saves automatically"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button — no level number or XP ring for guests */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        // className="fixed
        // bottom-5
        
        //   right-4 sm:bottom-6 sm:right-6 z-[200] w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden"
        // style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)" }}
        // title={isGuest ? "Guest — Sign in to save progress" : "Profile & Settings"}
        className="fixed right-4 sm:right-6 z-[200] w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden"
        style={{ bottom: inGame ? 'calc(env(safe-area-inset-bottom, 0px) + 140px)' : 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}

      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : isGuest ? (
            // Guest: plain person icon, no level number, no XP ring
            <motion.div key="guest" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <User className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            // Logged-in: level number + star
            <motion.div key="fab" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col items-center">
              <span className="text-lg font-black text-white leading-none">{xpState.level}</span>
              <Star className="w-3 h-3 text-yellow-300 mt-0.5" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* XP progress ring — only rendered for logged-in users */}
        {!isGuest && (
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
            <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - levelPct / 100)}`}
              strokeLinecap="round" className="transition-all duration-700"
            />
          </svg>
        )}
      </motion.button>

      <GlobalStatsScreen isOpen={showGlobalStats} onClose={() => setShowGlobalStats(false)} />
    </>
  );
}

function DrawerItem({ icon, label, sub, bg, onClick, rightEl }: {
  icon: React.ReactNode; label: string; sub: string;
  bg: string; onClick: () => void; rightEl?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
    >
      <div className={`p-2 ${bg} rounded-xl flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{label}</p>
        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{sub}</p>
      </div>
      {rightEl ?? <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
    </button>
  );
}