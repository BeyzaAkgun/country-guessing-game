// CountryFactCard.tsx - TV-aware fact card shown after correct guesses
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Globe, Users, MapPin, Languages, BookOpen } from "lucide-react";
import { countryFacts } from "@/app/data/countryFacts";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";

interface CountryFactCardProps {
  countryName: string | null;
  onClose: () => void;
  autoCloseDuration?: number;
}

export function CountryFactCard({ countryName, onClose, autoCloseDuration = 6000 }: CountryFactCardProps) {
  const [progress, setProgress] = useState(100);
  const { config } = useDisplayMode();
  const isTV = config.isTV;

  useEffect(() => {
    if (!countryName) return;
    setProgress(100);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / autoCloseDuration) * 100);
      setProgress(remaining);
      if (remaining <= 0) { clearInterval(interval); onClose(); }
    }, 50);
    return () => clearInterval(interval);
  }, [countryName, autoCloseDuration, onClose]);

  const fact = countryName ? countryFacts[countryName] : null;
  if (!countryName || !fact) return null;

  // ── TV version: large centred modal ──────────────────────────────────────
  if (isTV) {
    return (
      <AnimatePresence>
        <motion.div key={countryName}
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }} transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div className="pointer-events-auto bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
            style={{ width: "min(860px, 88vw)" }}>
            {/* Progress bar */}
            <div style={{ height: 6, background: "rgba(255,255,255,0.08)" }}>
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.05 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            </div>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700" style={{ padding: "32px 40px" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <span style={{ fontSize: 72 }}>{fact.emoji}</span>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 18, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Correct!</p>
                    <p style={{ color: "white", fontSize: 48, fontWeight: 900, lineHeight: 1, marginBottom: 6 }}>{countryName}</p>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 22 }}>{fact.region}</p>
                  </div>
                </div>
                <button onClick={onClose} className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl" style={{ padding: 12 }}>
                  <X style={{ width: 28, height: 28, color: "white" }} />
                </button>
              </div>
            </div>
            {/* Stats */}
            <div style={{ padding: "28px 40px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 18 }}>
                <TVStatCell icon={<Users style={{ width: 24, height: 24, color: "#60a5fa" }} />} label="Population" value={fact.population} />
                <TVStatCell icon={<Globe style={{ width: 24, height: 24, color: "#34d399" }} />} label="Area" value={fact.area} />
                <TVStatCell icon={<MapPin style={{ width: 24, height: 24, color: "#f87171" }} />} label="Capital" value={fact.capital} />
              </div>
              <div className="flex items-start gap-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", padding: "18px 22px", marginBottom: 14 }}>
                <Languages style={{ width: 22, height: 22, color: "#c084fc", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 22, color: "rgba(255,255,255,0.8)" }}>
                  <span style={{ fontWeight: 700 }}>Languages: </span>
                  {Array.isArray(fact.languages) ? fact.languages.join(", ") : String(fact.languages)}
                </p>
              </div>
              <div className="flex items-start gap-4 rounded-2xl" style={{ background: "rgba(251,191,36,0.1)", padding: "18px 22px" }}>
                <BookOpen style={{ width: 22, height: 22, color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 22, color: "rgba(255,255,255,0.75)" }}>{fact.funFact}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Normal (desktop/mobile) version ──────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div key={countryName}
        initial={{ y: 100, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4 pointer-events-none"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 pointer-events-auto">
          <div className="h-1 bg-slate-100 dark:bg-slate-800">
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.05 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          </div>
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 px-5 py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{fact.emoji}</span>
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">Correct!</p>
                  <p className="text-white font-black text-xl leading-tight">{countryName}</p>
                  <p className="text-white/80 text-xs mt-0.5">{fact.region}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <StatCell icon={<Users className="w-3.5 h-3.5 text-blue-500" />} label="Population" value={fact.population} />
              <StatCell icon={<Globe className="w-3.5 h-3.5 text-green-500" />} label="Area" value={fact.area} />
              <StatCell icon={<MapPin className="w-3.5 h-3.5 text-red-500" />} label="Capital" value={fact.capital} />
            </div>
            <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2 mb-3">
              <Languages className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Languages: </span>
                {Array.isArray(fact.languages) ? fact.languages.join(", ") : String(fact.languages)}
              </p>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-300">{fact.funFact}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-[10px] text-slate-400 font-medium mb-0.5">{label}</p>
      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{value}</p>
    </div>
  );
}

function TVStatCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.06)", padding: "18px 14px" }}>
      <div className="flex justify-center" style={{ marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: "white", lineHeight: 1.2 }}>{value}</p>
    </div>
  );
}