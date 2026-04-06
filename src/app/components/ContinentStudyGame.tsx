// ContinentStudyGame.tsx - Study mode filtered by continent with XP integration
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import WorldMap from "@/app/components/WorldMap";
import { CountryFactCard } from "@/app/components/CountryFactCard";
import { XPToast } from "@/app/components/LevelBadge";
import { useCountryData } from "@/app/hooks/useCountryData";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";
import { ClassroomHUD } from "@/app/components/ClassroomHUD";
import { toast, Toaster } from "sonner";
import { Loader2, BookOpen, Globe, RotateCcw, Home, ChevronRight, CheckCircle2 } from "lucide-react";
import { soundEffects } from "@/app/utils/soundEffects";
import { addXP, calculateXPReward } from "@/app/utils/xpSystem";

interface ContinentStudyGameProps {
  onBackToMenu: () => void;
}

const CONTINENT_COUNTRIES: Record<string, string[]> = {
  "Africa": ["Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cabo Verde","Cameroon","Central African Republic","Chad","Comoros","Democratic Republic of the Congo","Republic of the Congo","Djibouti","Egypt","Equatorial Guinea","Eritrea","Eswatini","Ethiopia","Gabon","Gambia","Ghana","Guinea","Guinea-Bissau","Ivory Coast","Kenya","Lesotho","Liberia","Libya","Madagascar","Malawi","Mali","Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria","Rwanda","Senegal","Sierra Leone","Somalia","South Africa","South Sudan","Sudan","Tanzania","Togo","Tunisia","Uganda","Zambia","Zimbabwe"],
  "Europe": ["Albania","Austria","Belarus","Belgium","Bosnia and Herzegovina","Bulgaria","Croatia","Cyprus","Czechia","Denmark","Estonia","Finland","France","Germany","Greece","Hungary","Iceland","Ireland","Italy","Kosovo","Latvia","Lithuania","Luxembourg","Malta","Moldova","Montenegro","Netherlands","North Macedonia","Norway","Poland","Portugal","Romania","Russia","Serbia","Slovakia","Slovenia","Spain","Sweden","Switzerland","Ukraine","United Kingdom"],
  "Asia": ["Afghanistan","Armenia","Azerbaijan","Bahrain","Bangladesh","Bhutan","Brunei","Cambodia","China","Georgia","India","Indonesia","Iran","Iraq","Israel","Japan","Jordan","Kazakhstan","Kuwait","Kyrgyzstan","Laos","Lebanon","Malaysia","Maldives","Mongolia","Myanmar","Nepal","North Korea","Oman","Pakistan","Palestine","Philippines","Qatar","Saudi Arabia","Singapore","South Korea","Sri Lanka","Syria","Taiwan","Tajikistan","Thailand","Timor-Leste","Turkey","Turkmenistan","United Arab Emirates","Uzbekistan","Vietnam","Yemen"],
  "North America": ["Belize","Canada","Costa Rica","Cuba","Dominican Republic","El Salvador","Guatemala","Haiti","Honduras","Jamaica","Mexico","Nicaragua","Panama","Trinidad and Tobago","United States of America"],
  "South America": ["Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Guyana","Paraguay","Peru","Suriname","Uruguay","Venezuela"],
  "Oceania": ["Australia","Fiji","New Zealand","Papua New Guinea","Solomon Islands","Vanuatu"],
};

const CONTINENT_EMOJIS: Record<string, string> = {
  "Africa": "🌍", "Europe": "🌍", "Asia": "🌏",
  "North America": "🌎", "South America": "🌎", "Oceania": "🌏",
};

const CONTINENT_COLORS: Record<string, { bg: string; dot: string }> = {
  "Africa":        { bg: "from-amber-500 to-orange-600",  dot: "bg-amber-500" },
  "Europe":        { bg: "from-blue-500 to-indigo-600",   dot: "bg-blue-500" },
  "Asia":          { bg: "from-red-500 to-rose-600",      dot: "bg-red-500" },
  "North America": { bg: "from-green-500 to-emerald-600", dot: "bg-green-500" },
  "South America": { bg: "from-yellow-500 to-lime-600",   dot: "bg-yellow-500" },
  "Oceania":       { bg: "from-cyan-500 to-teal-600",     dot: "bg-cyan-500" },
};

function studyKey(continent: string) { return `study_progress_${continent}`; }
function loadStudied(continent: string): string[] {
  try { return JSON.parse(localStorage.getItem(studyKey(continent)) || "[]"); } catch { return []; }
}
function saveStudied(continent: string, countries: string[]) {
  try { localStorage.setItem(studyKey(continent), JSON.stringify(countries)); } catch {}
}

export function ContinentStudyGame({ onBackToMenu }: ContinentStudyGameProps) {
  const { countries, loading } = useCountryData();
  const { config, toggleTVMode } = useDisplayMode();
  const [phase, setPhase] = useState<"picker" | "playing" | "complete">("picker");
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [correctCountries, setCorrectCountries] = useState<string[]>([]);
  const [wrongCountries, setWrongCountries] = useState<string[]>([]);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [soundEnabled] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [factCardCountry, setFactCardCountry] = useState<string | null>(null);
  const [xpToast, setXpToast] = useState<{ xp: number; breakdown: string[] } | null>(null);
  const [xpVersion, setXpVersion] = useState(0);

  const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

  const continentPool = useMemo(() => {
    if (!selectedContinent) return [];
    return (CONTINENT_COUNTRIES[selectedContinent] ?? []).filter(n => allCountryNames.includes(n));
  }, [selectedContinent, allCountryNames]);

  useEffect(() => {
    if (selectedContinent && phase === "playing") {
      const studied = loadStudied(selectedContinent);
      setCorrectCountries(studied);
      setScore(studied.length);
    }
  }, [selectedContinent, phase]);

  const remaining = useMemo(() => continentPool.filter(n => !correctCountries.includes(n)), [continentPool, correctCountries]);

  const handleStartContinent = (continent: string) => {
    setSelectedContinent(continent);
    setWrongCountries([]);
    setSelectedCountryName(null);
    setCurrentStreak(0);
    setFactCardCountry(null);
    setPhase("playing");
  };

  const handleCountryClick = (geo: any) => {
    const name = geo.properties.name || geo.name;
    if (!continentPool.includes(name)) { toast.info(`${name} is not in ${selectedContinent}`, { duration: 1200 }); return; }
    if (correctCountries.includes(name)) { toast.info(`Already studied ${name}!`, { duration: 1000 }); return; }
    if (soundEnabled) soundEffects.playClick();
    setSelectedCountryName(name);
  };

  const handleGuess = useCallback((guess: string) => {
    if (!selectedCountryName || !selectedContinent) return;
    if (guess.toLowerCase().trim() !== selectedCountryName.toLowerCase().trim()) {
      toast.error("Guess doesn't match selected country!"); return;
    }
    if (soundEnabled) soundEffects.playCorrect();
    toast.success(`✓ ${selectedCountryName}`, { duration: 1500, className: "bg-green-50 text-green-800 border-green-200" });
    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    const newCorrect = [...correctCountries, selectedCountryName];
    setCorrectCountries(newCorrect);
    setScore(newCorrect.length);
    saveStudied(selectedContinent, newCorrect);
    setFactCardCountry(selectedCountryName);
    const { xp, breakdown } = calculateXPReward({ mode: "continent-study", streak: newStreak, usedHints: false });
    addXP(xp);
    setXpToast({ xp, breakdown });
    setXpVersion(v => v + 1);
    setSelectedCountryName(null);
    if (newCorrect.length >= continentPool.length) setTimeout(() => setPhase("complete"), 1000);
  }, [selectedCountryName, selectedContinent, continentPool, correctCountries, currentStreak, soundEnabled]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (phase === "picker") {
    return (
      <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-30">
          <WorldMap countries={countries} onCountryClick={() => {}} correctCountries={[]} wrongCountries={[]} />
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg mb-3">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Continent Study</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pick a region and learn every country in it</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {Object.entries(CONTINENT_COUNTRIES).map(([continent, countryList]) => {
                const pool = countryList.filter(n => allCountryNames.includes(n));
                const studied = loadStudied(continent);
                const done = studied.length; const total = pool.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const colors = CONTINENT_COLORS[continent];
                return (
                  <motion.button key={continent} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleStartContinent(continent)}
                    className="group relative text-left rounded-2xl overflow-hidden border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-all bg-slate-50 dark:bg-slate-800 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xl">{CONTINENT_EMOJIS[continent]}</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-tight">{continent}</p>
                        <p className="text-xs text-slate-400">{total} countries</p>
                      </div>
                      {done === total && total > 0 && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${colors.bg} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{done}/{total} studied</p>
                  </motion.button>
                );
              })}
            </div>
            <button onClick={onBackToMenu} className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Back to Menu
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (phase === "complete" && selectedContinent) {
    const colors = CONTINENT_COLORS[selectedContinent];
    return (
      <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 18 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-6xl mb-4">🏆</motion.p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{selectedContinent} Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">You've studied all {continentPool.length} countries!</p>
          <div className={`bg-gradient-to-r ${colors.bg} rounded-2xl p-4 mb-6`}>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Countries Mastered</p>
            <p className="text-5xl font-black text-white">{continentPool.length}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { saveStudied(selectedContinent, []); setPhase("picker"); setCorrectCountries([]); setScore(0); }}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Again
            </button>
            <button onClick={() => setPhase("picker")}
              className={`flex-1 py-3 bg-gradient-to-r ${colors.bg} text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}>
              <Globe className="w-4 h-4" /> New Region
            </button>
          </div>
          <button onClick={onBackToMenu} className="w-full mt-3 py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Menu
          </button>
        </motion.div>
      </div>
    );
  }

  // Playing
  const colors = CONTINENT_COLORS[selectedContinent!] ?? CONTINENT_COLORS["Africa"];
  const progressPct = continentPool.length > 0 ? (score / continentPool.length) * 100 : 0;

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Toaster position="top-center" />
      <div className="absolute inset-0 z-0">
        <WorldMap countries={countries} onCountryClick={handleCountryClick} selectedCountryName={selectedCountryName} correctCountries={correctCountries} wrongCountries={wrongCountries} />
      </div>

      {/* HUD — hidden in TV mode */}
      {!config.isTV && <div className="absolute top-3 left-0 right-0 z-50 px-3 sm:px-4">
        <div className="flex justify-center">
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-xl rounded-2xl border border-white/30 px-4 py-3 w-full max-w-xl">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{CONTINENT_EMOJIS[selectedContinent!]}</span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 leading-none">Studying</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedContinent}</p>
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums flex-shrink-0">
                {score}<span className="text-sm font-normal text-slate-400">/{continentPool.length}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setPhase("picker")}
                  className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center gap-1">
                  <Home className="w-3 h-3" /><span className="hidden sm:inline">Regions</span>
                </button>
                <button onClick={onBackToMenu}
                  className={`px-2.5 py-1.5 bg-gradient-to-r ${colors.bg} text-white rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center gap-1`}>
                  <ChevronRight className="w-3 h-3" /><span className="hidden sm:inline">Menu</span>
                </button>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${colors.bg} rounded-full`} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-right">{remaining.length} remaining</p>
          </motion.div>
        </div>
      </div>
      }

      {/* Normal guess panel — hidden in TV mode */}
      {!config.isTV && (
        <>
          <AnimatePresence>
            {selectedCountryName && (
              <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute bottom-4 sm:bottom-6 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[460px] z-40">
                <StudyGuessPanel selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
                  onGuess={handleGuess} onDismiss={() => setSelectedCountryName(null)} accentGradient={colors.bg} />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!selectedCountryName && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                <div className="bg-black/80 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full backdrop-blur-sm text-xs sm:text-sm font-medium shadow-2xl whitespace-nowrap">
                  👆 Click a country in <span className="font-bold text-yellow-300">{selectedContinent}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* TV Classroom HUD */}
      <AnimatePresence>
        {config.isTV && (
          <ClassroomHUD
            score={score} totalCountries={continentPool.length}
            selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
            onGuess={handleGuess} onExitTVMode={toggleTVMode}
            onBackToMenu={onBackToMenu}
            onRestart={() => { setPhase("picker"); setCorrectCountries([]); setScore(0); setSelectedCountryName(null); }}
            targetLabel="Name this country" mode="continent-study"
          />
        )}
      </AnimatePresence>

      <CountryFactCard countryName={factCardCountry} onClose={() => setFactCardCountry(null)} autoCloseDuration={5000} />
      <AnimatePresence>
        {xpToast && <XPToast xp={xpToast.xp} breakdown={xpToast.breakdown} onDone={() => setXpToast(null)} />}
      </AnimatePresence>
    </div>
  );
}

function StudyGuessPanel({ selectedCountryName, allCountryNames, onGuess, onDismiss, accentGradient }: {
  selectedCountryName: string; allCountryNames: string[];
  onGuess: (n: string) => void; onDismiss: () => void; accentGradient: string;
}) {
  const [input, setInput] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { setInput(""); setShowSuggestions(false); setTimeout(() => inputRef.current?.focus(), 80); }, [selectedCountryName]);

  const filtered = React.useMemo(() => {
    if (!input) return [];
    return allCountryNames.filter(n => n.toLowerCase().startsWith(input.toLowerCase()) || n.toLowerCase().includes(input.toLowerCase()))
      .sort((a, b) => { const aS = a.toLowerCase().startsWith(input.toLowerCase()); const bS = b.toLowerCase().startsWith(input.toLowerCase()); if (aS && !bS) return -1; if (!aS && bS) return 1; return a.localeCompare(b); }).slice(0, 8);
  }, [input, allCountryNames]);

  const submit = (val?: string) => { const v = (val ?? input).trim(); if (!v) return; onGuess(v); setInput(""); setShowSuggestions(false); };

  return (
    <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl sm:rounded-3xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Name this country</p>
        <button onClick={onDismiss} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">✕</button>
      </div>
      <div className="relative">
        <div className="relative flex items-center">
          <input ref={inputRef} type="text" value={input}
            onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Type country name…"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 text-base focus:ring-2 focus:ring-blue-400/50 outline-none"
            autoFocus
          />
          <button onClick={() => submit()}
            className={`absolute right-2 p-2 bg-gradient-to-r ${accentGradient} text-white rounded-xl transition-all active:scale-95`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
        {showSuggestions && filtered.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-border/50 overflow-hidden max-h-44 overflow-y-auto z-50">
            {filtered.map(s => (
              <button key={s} type="button" onClick={() => { setInput(s); submit(s); setShowSuggestions(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-border/30 last:border-0 transition-colors text-sm font-medium truncate">
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}