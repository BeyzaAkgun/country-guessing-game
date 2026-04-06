// NewHintModal.tsx - Shows new hints with map lock countdown
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, Lock, Unlock } from "lucide-react";

interface NewHintModalProps {
  hint: {
    text: string;
    type: "continent" | "fact" | "capital" | "flag";
    countryName: string;
    flagUrl?: string;
  } | null;
  onComplete: () => void;
  lockDuration?: number;
}

export function NewHintModal({ hint, onComplete, lockDuration = 5 }: NewHintModalProps) {
  const [timeLeft, setTimeLeft] = useState(lockDuration);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hint) {
      setIsVisible(true);
      setTimeLeft(lockDuration);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimeout(() => {
              setIsVisible(false);
              setTimeout(onComplete, 300);
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [hint, lockDuration, onComplete]);

  if (!hint) return null;

  const progress = ((lockDuration - timeLeft) / lockDuration) * 100;
  const isFlag = hint.type === "flag";

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/20">
              {/* Header */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold">New Hint!</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    {timeLeft > 0 ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span className="font-bold text-lg">{timeLeft}s</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span className="font-bold">Ready!</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Type badge — hide country name for flag hints */}
                <span className={`
                  text-xs font-semibold px-3 py-1 rounded-full
                  ${hint.type === "continent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : ""}
                  ${hint.type === "fact"      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : ""}
                  ${hint.type === "capital"   ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : ""}
                  ${hint.type === "flag"      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : ""}
                `}>
                  {hint.type.toUpperCase()}
                </span>

                {/* Flag: show image only, no country name */}
                {isFlag && hint.flagUrl ? (
                  <div className="flex justify-center pt-2">
                    <img
                      src={hint.flagUrl}
                      alt="Country flag"
                      className="rounded-xl shadow-lg max-h-40 object-contain border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                ) : (
                  <p className="text-xl font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {hint.text}
                  </p>
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                    {timeLeft > 0
                      ? `Map will unlock in ${timeLeft} second${timeLeft !== 1 ? "s" : ""}...`
                      : "Find this country on the map!"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}