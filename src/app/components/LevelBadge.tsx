// LevelBadge.tsx
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, TrendingUp } from "lucide-react";
import { getXPState, getLevelTitle, loadTotalXP, type XPState } from "@/app/utils/xpSystem";

interface LevelBadgeProps {
  xpVersion?: number;
  isGuest?: boolean;
}

export function LevelBadge({ xpVersion = 0, isGuest = false }: LevelBadgeProps) {
  const [xpState, setXpState] = useState<XPState>(() => getXPState(loadTotalXP()));
  const [showPopup, setShowPopup] = useState(false);
  const prevLevel = useRef(xpState.level);

  useEffect(() => {
    // Don't track level-ups or read XP for guests
    if (isGuest) return;

    const newState = getXPState(loadTotalXP());
    if (newState.level > prevLevel.current) {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3500);
    }
    prevLevel.current = newState.level;
    setXpState(newState);
  }, [xpVersion, isGuest]);

  // Guests see nothing
  if (isGuest) return null;

  const pct = xpState.xpForNextLevel > 0
    ? Math.min((xpState.xpInCurrentLevel / xpState.xpForNextLevel) * 100, 100)
    : 100;

  return (
    <>
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-sm">
          <span className="text-[10px] font-black text-white leading-none">{xpState.level}</span>
        </div>
        <div className="hidden sm:flex flex-col gap-0.5 min-w-[64px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate max-w-[80px]">
              {getLevelTitle(xpState.level)}
            </span>
            {xpState.xpForNextLevel > 0 && (
              <span className="text-[9px] text-slate-400 ml-1 flex-shrink-0">
                {xpState.xpInCurrentLevel}/{xpState.xpForNextLevel}
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 18 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-[2px] rounded-2xl shadow-2xl">
              <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-3 flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Level Up!</p>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    Level {xpState.level} — {getLevelTitle(xpState.level)}
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface XPToastProps {
  xp: number;
  breakdown: string[];
  onDone: () => void;
}

export function XPToast({ xp, breakdown, onDone }: XPToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.85 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-36 right-4 z-50 pointer-events-none"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl px-4 py-2.5 border border-yellow-200 dark:border-yellow-800/50">
        <p className="text-base font-black text-yellow-600 dark:text-yellow-400">+{xp} XP</p>
        {breakdown.slice(0, 2).map((b) => (
          <p key={b} className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{b}</p>
        ))}
      </div>
    </motion.div>
  );
}