// ClassicGame.tsx - Classic mode with FAB handling global stats + TV mode
import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "motion/react";
import WorldMap from "@/app/components/WorldMap";
import { GameControls } from "@/app/components/GameControls";
import { HintStack } from "@/app/components/HintStack";
import { NewHintModal } from "@/app/components/NewHintModal";
import { Statistics } from "@/app/components/Statistics";
import { CountryFactCard } from "@/app/components/CountryFactCard";
import { XPToast } from "@/app/components/LevelBadge";
import { ClassroomHUD } from "@/app/components/ClassroomHUD";
import { AchievementsList, AchievementNotification, defaultAchievements, type Achievement } from "@/app/components/Achievements";
import { useCountryData } from "@/app/hooks/useCountryData";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { useGameState } from "@/app/hooks/useGameState";
import { getRandomHint, getRemainingHintCount } from "@/app/utils/getRandomHint";
import { soundEffects } from "@/app/utils/soundEffects";
import { addXP, calculateXPReward } from "@/app/utils/xpSystem";

interface ClassicGameProps {
  onBackToMenu: () => void;
}

export default function ClassicGame({ onBackToMenu }: ClassicGameProps) {
  const { countries, loading } = useCountryData();
  const { config, toggleTVMode } = useDisplayMode();
  const [newHint, setNewHint] = useState<{ text: string; type: any; countryName: string } | null>(null);
  const [isMapLocked, setIsMapLocked] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintsUsedForCurrentCountry, setHintsUsedForCurrentCountry] = useState(0);
  const [factCardCountry, setFactCardCountry] = useState<string | null>(null);
  const [xpToast, setXpToast] = useState<{ xp: number; breakdown: string[] } | null>(null);
  const [xpVersion, setXpVersion] = useState(0);

  const { state, setState, addHint, removeHint, clearHints, setSelectedCountry: saveSelectedCountry, resetState } = useGameState("classic");
  const { correctCountries, wrongCountries, score, hints, selectedCountry } = state;
  const [localSelectedCountry, setLocalSelectedCountry] = useState<string | null>(selectedCountry || null);

  useEffect(() => { if (selectedCountry) setLocalSelectedCountry(selectedCountry); }, [selectedCountry]);

  const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);
  const usedHintTexts = useMemo(() => {
    if (!localSelectedCountry) return [];
    return hints.filter(h => h.countryName === localSelectedCountry).map(h => h.text);
  }, [hints, localSelectedCountry]);
  const hintsAvailable = useMemo(() => {
    if (!localSelectedCountry) return false;
    return getRemainingHintCount(localSelectedCountry, usedHintTexts) > 0;
  }, [localSelectedCountry, usedHintTexts]);

  const checkAchievements = (newScore: number, newStreak: number) => {
    let updated = [...achievements];
    let newlyUnlocked: Achievement | null = null;
    [{ id: "first_country", t: 1 }, { id: "five_countries", t: 5 }, { id: "ten_countries", t: 10 }, { id: "fifty_countries", t: 50 }].forEach(({ id, t }) => {
      const i = updated.findIndex(a => a.id === id);
      if (i === -1) return;
      if (!updated[i].unlocked && newScore >= t) { updated[i] = { ...updated[i], unlocked: true, progress: newScore }; newlyUnlocked = updated[i]; }
      else updated[i] = { ...updated[i], progress: Math.min(newScore, t) };
    });
    [{ id: "streak_5", t: 5 }, { id: "streak_10", t: 10 }].forEach(({ id, t }) => {
      const i = updated.findIndex(a => a.id === id);
      if (i === -1) return;
      if (!updated[i].unlocked && newStreak >= t) { updated[i] = { ...updated[i], unlocked: true, progress: newStreak }; newlyUnlocked = updated[i]; }
      else updated[i] = { ...updated[i], progress: Math.min(newStreak, t) };
    });
    if (newlyUnlocked) { if (soundEnabled) soundEffects.playAchievement(); setUnlockedAchievement(newlyUnlocked); }
    setAchievements(updated);
  };

  const handleCountryClick = (geo: any) => {
    if (isMapLocked) { toast.error("Please wait for the hint timer"); return; }
    const name = geo.properties.name || geo.name;
    if (correctCountries.includes(name)) { toast.info(`Already found ${name}!`); return; }
    if (soundEnabled) soundEffects.playClick();
    setLocalSelectedCountry(name);
    saveSelectedCountry(name);
    setHintsUsedForCurrentCountry(0);
  };

  const handleGuess = (guess: string) => {
    if (!localSelectedCountry) return;
    setTotalGuesses(p => p + 1);
    if (guess.toLowerCase().trim() === localSelectedCountry.toLowerCase().trim()) {
      if (soundEnabled) soundEffects.playCorrect();
      toast.success(`✓ ${localSelectedCountry}`, { duration: 2000, className: "bg-green-50 text-green-800 border-green-200" });
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setBestStreak(p => Math.max(p, newStreak));
      const newScore = score + 1;
      setState({ ...state, correctCountries: [...correctCountries, localSelectedCountry], wrongCountries: wrongCountries.filter(c => c !== localSelectedCountry), score: newScore, selectedCountry: null });
      checkAchievements(newScore, newStreak);
      clearHints();
      setFactCardCountry(localSelectedCountry);
      const { xp, breakdown } = calculateXPReward({ mode: "classic", streak: newStreak, usedHints: hintsUsedForCurrentCountry > 0 });
      addXP(xp);
      setXpToast({ xp, breakdown });
      setXpVersion(v => v + 1);
      setLocalSelectedCountry(null);
      saveSelectedCountry(null);
    } else {
      if (soundEnabled) soundEffects.playWrong();
      toast.error("Incorrect — try again!", { description: "Or use a hint if you're stuck." });
      setCurrentStreak(0);
      if (!wrongCountries.includes(localSelectedCountry))
        setState({ ...state, wrongCountries: [...wrongCountries, localSelectedCountry] });
    }
  };

  const handleHint = () => {
    if (!localSelectedCountry || !hintsAvailable) { toast.error("No more hints available!"); return; }
    if (soundEnabled) soundEffects.playHint?.();
    const hintText = getRandomHint(localSelectedCountry, usedHintTexts);
    if (!hintText) { toast.error("No more hints available!"); return; }
    const hintType = hintText.includes("Located in") ? "continent" : hintText.includes("Capital city") ? "capital" : "fact";
    addHint({ countryName: localSelectedCountry, text: hintText, type: hintType });
    setNewHint({ text: hintText, type: hintType, countryName: localSelectedCountry });
    setHintsUsedForCurrentCountry(p => p + 1);
    setIsMapLocked(true);
  };

  const handleRestart = () => {
    if (window.confirm("Restart? All progress will be lost.")) {
      resetState(); setLocalSelectedCountry(null); setNewHint(null);
      setIsMapLocked(false); setTotalGuesses(0); setCurrentStreak(0);
      setBestStreak(0); setAchievements(defaultAchievements); setFactCardCountry(null);
      toast.success("Game restarted!");
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-muted-foreground font-medium">Loading World Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Toaster position="top-center" />
      <div className="absolute inset-0 z-0">
        <WorldMap countries={countries} onCountryClick={handleCountryClick}
          selectedCountryName={localSelectedCountry} correctCountries={correctCountries} wrongCountries={wrongCountries} />
      </div>

      {/* Normal controls — hidden in TV mode */}
      {!config.isTV && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <GameControls
              selectedCountryName={localSelectedCountry}
              onGuess={handleGuess} onHint={handleHint} onRestart={handleRestart}
              onBackToMenu={onBackToMenu}
              onOpenStats={() => setShowStats(true)}
              onOpenAchievements={() => setShowAchievements(true)}
              onToggleSound={() => { const s = soundEffects.toggle(); setSoundEnabled(s); }}
              soundEnabled={soundEnabled} score={score} totalCountries={countries.length}
              allCountryNames={allCountryNames} hintsAvailable={hintsAvailable}
              remainingHints={localSelectedCountry ? getRemainingHintCount(localSelectedCountry, usedHintTexts) : 0}
              xpVersion={xpVersion}
            />
            <HintStack hints={hints} onClose={removeHint} />
          </div>
        </div>
      )}

      {/* TV / Classroom HUD */}
      {config.isTV && (
        <ClassroomHUD
          score={score}
          totalCountries={countries.length}
          selectedCountryName={localSelectedCountry}
          allCountryNames={allCountryNames}
          onGuess={handleGuess}
          onExitTVMode={toggleTVMode}
          onBackToMenu={onBackToMenu}
          onRestart={handleRestart}
          streak={currentStreak}
          mode="classic"
        />
      )}

      <NewHintModal hint={newHint} onComplete={() => { setNewHint(null); setIsMapLocked(false); }} lockDuration={5} />
      {isMapLocked && <div className="absolute inset-0 z-40 bg-black/10 pointer-events-none" />}

      <Statistics isOpen={showStats} onClose={() => setShowStats(false)}
        stats={{ totalGuesses, correctGuesses: score, wrongGuesses: totalGuesses - score, hintsUsed: hints.length, currentStreak, bestStreak, countriesFound: score, totalCountries: countries.length, accuracy: totalGuesses > 0 ? (score / totalGuesses) * 100 : 0, averageHintsPerCountry: score > 0 ? hints.length / score : 0 }} />
      <AchievementsList achievements={achievements} isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
      <AnimatePresence>
        {unlockedAchievement && <AchievementNotification achievement={unlockedAchievement} onClose={() => setUnlockedAchievement(null)} />}
      </AnimatePresence>
      <CountryFactCard countryName={factCardCountry} onClose={() => setFactCardCountry(null)} autoCloseDuration={6000} />
      <AnimatePresence>
        {xpToast && <XPToast xp={xpToast.xp} breakdown={xpToast.breakdown} onDone={() => setXpToast(null)} />}
      </AnimatePresence>
    </div>
  );
}