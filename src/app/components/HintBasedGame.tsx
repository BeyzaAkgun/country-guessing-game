// // HintBasedGame.tsx - Complete with Sound, Stats, Achievements, and TV Mode
// import React, { useState, useEffect, useMemo } from "react";
// import { AnimatePresence } from "motion/react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { HintStack } from "@/app/components/HintStack";
// import { NewHintModal } from "@/app/components/NewHintModal";
// import { Statistics } from "@/app/components/Statistics";
// import { AchievementsList, AchievementNotification, defaultAchievements, type Achievement } from "@/app/components/Achievements";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { useDisplayMode } from "@/app/hooks/useDisplayMode";
// import { ClassroomHUD } from "@/app/components/ClassroomHUD";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { getRandomHint, getRemainingHintCount } from "@/app/utils/getRandomHint";
// import { soundEffects } from "@/app/utils/soundEffects";

// interface HintBasedGameProps {
//   onBackToMenu: () => void;
// }

// export function HintBasedGame({ onBackToMenu }: HintBasedGameProps) {
//   const { countries, loading } = useCountryData();
//   const { config, toggleTVMode } = useDisplayMode();

//   const [targetCountryName, setTargetCountryName] = useState<string | null>(null);
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [newHint, setNewHint] = useState<{ text: string; type: any; countryName: string } | null>(null);
//   const [isMapLocked, setIsMapLocked] = useState(false);
//   const [waitingForNextRound, setWaitingForNextRound] = useState(false);
  
//   // Polish features state
//   const [showStats, setShowStats] = useState(false);
//   const [showAchievements, setShowAchievements] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
//   const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
//   const [totalGuesses, setTotalGuesses] = useState(0);
//   const [currentStreak, setCurrentStreak] = useState(0);
//   const [bestStreak, setBestStreak] = useState(0);
  
//   const { 
//     state, setState, addHint, removeHint, clearHints, 
//     setTargetCountry: saveTargetCountry, resetState 
//   } = useGameState("hint-based");
  
//   const { correctCountries, wrongCountries, score, hints, targetCountry } = state;

//   const [localTargetCountry, setLocalTargetCountry] = useState<string | null>(targetCountry || null);

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

//   const remainingCountries = useMemo(() => {
//     return allCountryNames.filter(name => !correctCountries.includes(name));
//   }, [allCountryNames, correctCountries]);

//   const hasExistingHintsForTarget = useMemo(() => {
//     if (!localTargetCountry) return false;
//     return hints.some(h => h.countryName === localTargetCountry);
//   }, [hints, localTargetCountry]);

//   // Check achievements
//   const checkAchievements = (newScore: number, newStreak: number) => {
//     let updatedAchievements = [...achievements];
//     let newlyUnlocked: Achievement | null = null;

//     if (newScore >= 1 && !achievements.find(a => a.id === 'first_country')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'first_country');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
//       newlyUnlocked = updatedAchievements[idx];
//     }
    
//     if (newScore >= 5 && !achievements.find(a => a.id === 'five_countries')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'five_countries');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'five_countries');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 5) };
//     }
    
//     if (newScore >= 10 && !achievements.find(a => a.id === 'ten_countries')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'ten_countries');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'ten_countries');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 10) };
//     }
    
//     if (newScore >= 50 && !achievements.find(a => a.id === 'fifty_countries')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'fifty_countries');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'fifty_countries');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 50) };
//     }
    
//     if (newStreak >= 5 && !achievements.find(a => a.id === 'streak_5')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_5');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_5');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 5) };
//     }
    
//     if (newStreak >= 10 && !achievements.find(a => a.id === 'streak_10')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_10');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_10');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 10) };
//     }
    
//     const accuracy = totalGuesses > 0 ? (newScore / totalGuesses) * 100 : 0;
//     if (accuracy === 100 && totalGuesses >= 20 && !achievements.find(a => a.id === 'perfect_accuracy')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'perfect_accuracy');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
//       newlyUnlocked = updatedAchievements[idx];
//     }
    
//     if (newlyUnlocked) {
//       if (soundEnabled) soundEffects.playAchievement();
//       setUnlockedAchievement(newlyUnlocked);
//     }
    
//     setAchievements(updatedAchievements);
//   };

//   const startNewRound = () => {
//     if (remainingCountries.length === 0) {
//       toast.success("🎉 Congratulations! You've found all countries!", {
//         duration: 5000,
//       });
//       return;
//     }

//     const randomIndex = Math.floor(Math.random() * remainingCountries.length);
//     const randomCountry = remainingCountries[randomIndex];
//     setLocalTargetCountry(randomCountry);
//     saveTargetCountry(randomCountry);

//     const usedHintTexts = hints
//       .filter(h => h.countryName === randomCountry)
//       .map(h => h.text);

//     const hintText = getRandomHint(randomCountry, usedHintTexts);

//     if (!hintText) {
//       toast.error(`No hints available for ${randomCountry}, skipping...`);
//       setTimeout(() => startNewRound(), 1000);
//       return;
//     }

//     const hintType = hintText.includes("Located in") ? "continent" 
//                    : hintText.includes("Capital city") ? "capital"
//                    : "fact";

//     if (soundEnabled) {
//       soundEffects.playHint();
//     }

//     addHint({
//       countryName: randomCountry,
//       text: hintText,
//       type: hintType
//     });

//     setNewHint({
//       text: hintText,
//       type: hintType,
//       countryName: randomCountry
//     });
//     setIsMapLocked(true);
//     setSelectedCountryName(null);
//   };

//   useEffect(() => {
//     if (countries.length === 0 || waitingForNextRound) return;

//     if (targetCountry && hasExistingHintsForTarget) {
//       setLocalTargetCountry(targetCountry);
//     } else if (targetCountry && !hasExistingHintsForTarget) {
//       setLocalTargetCountry(null);
//       saveTargetCountry(null);
//       startNewRound();
//     } else if (!localTargetCountry) {
//       startNewRound();
//     }
//   }, [countries, targetCountry, hasExistingHintsForTarget]);

//   const handleCountryClick = (geo: any) => {
//     if (isMapLocked) {
//       toast.error("Please wait for the hint timer to complete");
//       return;
//     }

//     const name = geo.properties.name || geo.name;
    
//     if (correctCountries.includes(name)) {
//       toast.info(`You already found ${name}!`);
//       return;
//     }

//     if (soundEnabled) soundEffects.playClick();
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName || !localTargetCountry) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedSelected = selectedCountryName.toLowerCase().trim();
//     const normalizedTarget = localTargetCountry.toLowerCase().trim();

//     if (normalizedGuess !== normalizedSelected) {
//       if (soundEnabled) soundEffects.playWrong();
//       toast.error("Guess doesn't match selected country!");
//       return;
//     }

//     setTotalGuesses(prev => prev + 1);

//     if (normalizedGuess === normalizedTarget) {
//       if (soundEnabled) soundEffects.playCorrect();
      
//       toast.success(`🎉 Correct! It is ${localTargetCountry}`, {
//         duration: 2000,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });
      
//       const newStreak = currentStreak + 1;
//       setCurrentStreak(newStreak);
//       setBestStreak(prev => Math.max(prev, newStreak));
      
//       const newScore = score + 1;
//       setState({
//         ...state,
//         correctCountries: [...correctCountries, localTargetCountry],
//         wrongCountries: wrongCountries.filter(c => c !== localTargetCountry),
//         score: newScore,
//         targetCountry: null
//       });
      
//       checkAchievements(newScore, newStreak);
      
//       clearHints();
//       setSelectedCountryName(null);
//       setLocalTargetCountry(null);
//       saveTargetCountry(null);
//       setWaitingForNextRound(true);
      
//       setTimeout(() => {
//         setWaitingForNextRound(false);
//         startNewRound();
//       }, 2000);
      
//     } else {
//       if (soundEnabled) soundEffects.playWrong();
      
//       toast.error(`Wrong! That's ${selectedCountryName}, not what we're looking for.`, {
//         description: "Try another country or request more hints.",
//         duration: 3000,
//       });
      
//       setCurrentStreak(0);
      
//       if (!wrongCountries.includes(selectedCountryName)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, selectedCountryName] });
//       }
//       setSelectedCountryName(null);
//     }
//   };

//   const handleRequestHint = () => {
//     if (!localTargetCountry) return;

//     const usedHintTexts = hints
//       .filter(h => h.countryName === localTargetCountry)
//       .map(h => h.text);

//     const remaining = getRemainingHintCount(localTargetCountry, usedHintTexts);
    
//     if (remaining === 0) {
//       toast.error("No more hints available for this country!");
//       return;
//     }

//     if (soundEnabled) soundEffects.playHint();

//     const hintText = getRandomHint(localTargetCountry, usedHintTexts);
//     if (!hintText) {
//       toast.error("No more hints available!");
//       return;
//     }

//     const hintType = hintText.includes("Located in") ? "continent" 
//                    : hintText.includes("Capital city") ? "capital"
//                    : "fact";

//     addHint({
//       countryName: localTargetCountry,
//       text: hintText,
//       type: hintType
//     });

//     setNewHint({
//       text: hintText,
//       type: hintType,
//       countryName: localTargetCountry
//     });
//     setIsMapLocked(true);
//   };

//   const handleHintComplete = () => {
//     setNewHint(null);
//     setIsMapLocked(false);
//   };

//   const handleRestart = () => {
//     if (window.confirm("Are you sure you want to restart this game? All progress will be lost.")) {
//       resetState();
//       setLocalTargetCountry(null);
//       setSelectedCountryName(null);
//       setNewHint(null);
//       setIsMapLocked(false);
//       setWaitingForNextRound(false);
//       setTotalGuesses(0);
//       setCurrentStreak(0);
//       setBestStreak(0);
//       setAchievements(defaultAchievements);
//       toast.success("Game restarted!");
//     }
//   };

//   const handleBackToMenu = () => {
//     onBackToMenu();
//   };

//   if (loading) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
//           <p className="text-muted-foreground font-medium">Loading World Map...</p>
//         </div>
//       </div>
//     );
//   }

//   const usedHintTexts = localTargetCountry 
//     ? hints.filter(h => h.countryName === localTargetCountry).map(h => h.text)
//     : [];
//   const hintsAvailable = localTargetCountry 
//     ? getRemainingHintCount(localTargetCountry, usedHintTexts) > 0
//     : false;
//   const remainingHints = localTargetCountry
//     ? getRemainingHintCount(localTargetCountry, usedHintTexts)
//     : 0;

//   return (
//     <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//       <Toaster position="top-center" />

//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       {/* Normal controls — hidden in TV mode */}
//       {!config.isTV && (
//         <div className="absolute inset-0 z-10 pointer-events-none">
//           <div className="pointer-events-auto">
//             <GameControls
//               selectedCountryName={selectedCountryName}
//               onGuess={handleGuess}
//               onHint={handleRequestHint}
//               onRestart={handleRestart}
//               onBackToMenu={handleBackToMenu}
//               onOpenStats={() => setShowStats(true)}
//               onOpenAchievements={() => setShowAchievements(true)}
//               onToggleSound={() => {
//                 const newState = soundEffects.toggle();
//                 setSoundEnabled(newState);
//               }}
//               soundEnabled={soundEnabled}
//               score={score}
//               totalCountries={countries.length}
//               allCountryNames={allCountryNames}
//               hintsAvailable={hintsAvailable}
//               remainingHints={remainingHints}
//             />

//             <HintStack 
//               hints={hints}
//               onClose={removeHint}
//               onRequestHint={handleRequestHint}
//               showRequestButton={true}
//               hintsAvailable={hintsAvailable}
//             />
//           </div>
//         </div>
//       )}

//       {/* TV mode — HintStack stays visible so the class can read the clues on screen */}
//       {config.isTV && (
//         <div className="absolute inset-0 z-10 pointer-events-none">
//           <div className="pointer-events-auto">
//             <HintStack 
//               hints={hints}
//               onClose={removeHint}
//               onRequestHint={handleRequestHint}
//               showRequestButton={true}
//               hintsAvailable={hintsAvailable}
//             />
//           </div>
//         </div>
//       )}

//       {/* TV / Classroom HUD overlay */}
//       {config.isTV && (
//         <ClassroomHUD
//           score={score}
//           totalCountries={countries.length}
//           selectedCountryName={selectedCountryName}
//           allCountryNames={allCountryNames}
//           onGuess={handleGuess}
//           onExitTVMode={toggleTVMode}
//           onBackToMenu={handleBackToMenu}
//           onRestart={handleRestart}
//           streak={currentStreak}
//           targetLabel="Selected country"
//           mode="hint-based"
//         />
//       )}

//       <NewHintModal
//         hint={newHint}
//         onComplete={handleHintComplete}
//         lockDuration={5}
//       />

//       {isMapLocked && (
//         <div className="absolute inset-0 z-40 bg-black/10 pointer-events-none" />
//       )}

//       <Statistics
//         isOpen={showStats}
//         onClose={() => setShowStats(false)}
//         stats={{
//           totalGuesses,
//           correctGuesses: score,
//           wrongGuesses: totalGuesses - score,
//           hintsUsed: hints.length,
//           currentStreak,
//           bestStreak,
//           countriesFound: score,
//           totalCountries: countries.length,
//           accuracy: totalGuesses > 0 ? (score / totalGuesses) * 100 : 0,
//           averageHintsPerCountry: score > 0 ? hints.length / score : 0,
//         }}
//       />

//       <AchievementsList
//         achievements={achievements}
//         isOpen={showAchievements}
//         onClose={() => setShowAchievements(false)}
//       />

//       <AnimatePresence>
//         {unlockedAchievement && (
//           <AchievementNotification
//             achievement={unlockedAchievement}
//             onClose={() => setUnlockedAchievement(null)}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


//newly added
// HintBasedGame.tsx - Complete with Sound, Stats, Achievements, TV Mode, and Queue System
// HintBasedGame.tsx - Complete with Sound, Stats, Achievements, TV Mode, and Queue System
// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { AnimatePresence } from "motion/react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { HintStack } from "@/app/components/HintStack";
// import { NewHintModal } from "@/app/components/NewHintModal";
// import { Statistics } from "@/app/components/Statistics";
// import { AchievementsList, AchievementNotification, defaultAchievements, type Achievement } from "@/app/components/Achievements";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { useDisplayMode } from "@/app/hooks/useDisplayMode";
// import { ClassroomHUD } from "@/app/components/ClassroomHUD";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { getRandomHint, getRemainingHintCount } from "@/app/utils/getRandomHint";
// import { soundEffects } from "@/app/utils/soundEffects";
// import {
//   initializeQueue,
//   loadQueueState,
//   saveQueueState,
//   clearQueueState,
//   handlePass as queueHandlePass,
//   handleReveal as queueHandleReveal,
//   handleCorrectGuess as queueHandleCorrectGuess,
//   getRemainingPassesForCurrentCountry,
//   toQueueCountry,
//   type PassQueueState,
// } from "@/app/utils/queueSystem";

// interface HintBasedGameProps {
//   onBackToMenu: () => void;
// }

// export function HintBasedGame({ onBackToMenu }: HintBasedGameProps) {
//   const { countries, loading } = useCountryData();
//   const { config, toggleTVMode } = useDisplayMode();

//   const [targetCountryName, setTargetCountryName] = useState<string | null>(null);
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [newHint, setNewHint] = useState<{ text: string; type: any; countryName: string } | null>(null);
//   const [isMapLocked, setIsMapLocked] = useState(false);
//   const [waitingForNextRound, setWaitingForNextRound] = useState(false);
  
//   // Polish features state
//   const [showStats, setShowStats] = useState(false);
//   const [showAchievements, setShowAchievements] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
//   const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
//   const [totalGuesses, setTotalGuesses] = useState(0);
//   const [currentStreak, setCurrentStreak] = useState(0);
//   const [bestStreak, setBestStreak] = useState(0);
  
//   // Queue system state
//   const QUEUE_STORAGE_KEY = "passQueue_hint-based";
//   const [queueState, setQueueState] = useState<PassQueueState | null>(null);
//   const [isFeedbackLocked, setIsFeedbackLocked] = useState(false);
//   const [gameComplete, setGameComplete] = useState(false);
//   const [inputResetToken, setInputResetToken] = useState(0);
//   const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
//   const { 
//     state, setState, addHint, removeHint, clearHints, 
//     setTargetCountry: saveTargetCountry, resetState 
//   } = useGameState("hint-based");
  
//   const { correctCountries, wrongCountries, score, hints, targetCountry } = state;

//   const [localTargetCountry, setLocalTargetCountry] = useState<string | null>(targetCountry || null);

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

//   const remainingCountries = useMemo(() => {
//     return allCountryNames.filter(name => !correctCountries.includes(name));
//   }, [allCountryNames, correctCountries]);

//   const hasExistingHintsForTarget = useMemo(() => {
//     if (!localTargetCountry) return false;
//     return hints.some(h => h.countryName === localTargetCountry);
//   }, [hints, localTargetCountry]);

//   const clearPendingTransition = () => {
//     if (transitionTimerRef.current) {
//       clearTimeout(transitionTimerRef.current);
//       transitionTimerRef.current = null;
//     }
//   };

//   const loadHintRound = (
//     countryName: string | null,
//     options?: { freshHints?: boolean }
//   ) => {
//     setLocalTargetCountry(countryName);
//     saveTargetCountry(countryName);
//     setSelectedCountryName(null);
//     setGameComplete(false);
//     setInputResetToken((t) => t + 1);

//     if (!countryName) {
//       setNewHint(null);
//       setIsMapLocked(false);
//       return;
//     }

//     const usedHintTexts = options?.freshHints
//       ? []
//       : hints.filter((h) => h.countryName === countryName).map((h) => h.text);

//     const hasExistingHints = !options?.freshHints && usedHintTexts.length > 0;

//     if (!hasExistingHints) {
//       const hintText = getRandomHint(countryName, usedHintTexts);

//       if (hintText) {
//         const hintType = hintText.includes("Located in")
//           ? "continent"
//           : hintText.includes("Capital city")
//           ? "capital"
//           : "fact";

//         if (soundEnabled) soundEffects.playHint();

//         addHint({
//           countryName,
//           text: hintText,
//           type: hintType,
//         });

//         setNewHint({
//           text: hintText,
//           type: hintType,
//           countryName,
//         });
//         setIsMapLocked(true);
//         return;
//       }
//     }

//     // Existing hints already present for this country
//     setNewHint(null);
//     setIsMapLocked(false);
//   };

//   const bootstrapQueue = () => {
//     const saved = loadQueueState(QUEUE_STORAGE_KEY);
//     const initial = saved ?? initializeQueue(allCountryNames, true);

//     setQueueState(initial);
//     setGameComplete(initial.queue.length === 0);

//     const initialTarget =
//       targetCountry ??
//       initial.queue[0]?.name ??
//       null;

//     if (initialTarget) {
//       loadHintRound(initialTarget, { freshHints: false });
//     } else {
//       setLocalTargetCountry(null);
//       saveTargetCountry(null);
//       setSelectedCountryName(null);
//       setNewHint(null);
//       setIsMapLocked(false);
//     }
//   };

//   // Check achievements
//   const checkAchievements = (newScore: number, newStreak: number) => {
//     let updatedAchievements = [...achievements];
//     let newlyUnlocked: Achievement | null = null;

//     if (newScore >= 1 && !achievements.find(a => a.id === 'first_country')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'first_country');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
//       newlyUnlocked = updatedAchievements[idx];
//     }
    
//     if (newScore >= 5 && !achievements.find(a => a.id === 'five_countries')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'five_countries');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'five_countries');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 5) };
//     }
    
//     if (newScore >= 10 && !achievements.find(a => a.id === 'ten_countries')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'ten_countries');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'ten_countries');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 10) };
//     }
    
//     if (newScore >= 50 && !achievements.find(a => a.id === 'fifty_countries')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'fifty_countries');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'fifty_countries');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 50) };
//     }
    
//     if (newStreak >= 5 && !achievements.find(a => a.id === 'streak_5')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_5');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_5');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 5) };
//     }
    
//     if (newStreak >= 10 && !achievements.find(a => a.id === 'streak_10')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_10');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_10');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 10) };
//     }
    
//     const accuracy = totalGuesses > 0 ? (newScore / totalGuesses) * 100 : 0;
//     if (accuracy === 100 && totalGuesses >= 20 && !achievements.find(a => a.id === 'perfect_accuracy')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'perfect_accuracy');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
//       newlyUnlocked = updatedAchievements[idx];
//     }
    
//     if (newlyUnlocked) {
//       if (soundEnabled) soundEffects.playAchievement();
//       setUnlockedAchievement(newlyUnlocked);
//     }
    
//     setAchievements(updatedAchievements);
//   };

//   // Initialization effects
//   useEffect(() => {
//     if (countries.length === 0) return;
//     if (queueState) return;

//     bootstrapQueue();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [countries, allCountryNames]);

//   useEffect(() => {
//     if (queueState) {
//       saveQueueState(QUEUE_STORAGE_KEY, queueState);
//     }
//   }, [queueState]);

//   useEffect(() => {
//     return () => clearPendingTransition();
//   }, []);

//   useEffect(() => {
//     if (countries.length === 0 || waitingForNextRound) return;

//     if (targetCountry && hasExistingHintsForTarget) {
//       setLocalTargetCountry(targetCountry);
//     } else if (targetCountry && !hasExistingHintsForTarget) {
//       setLocalTargetCountry(null);
//       saveTargetCountry(null);
//       // Queue handles next round
//     } else if (!localTargetCountry && !gameComplete && queueState?.queue.length) {
//       // This will be handled by the queue system
//     }
//   }, [countries, targetCountry, hasExistingHintsForTarget, waitingForNextRound, queueState, gameComplete]);

//   const handleCountryClick = (geo: any) => {
//     if (isMapLocked) {
//       toast.error("Please wait for the hint timer to complete");
//       return;
//     }

//     const name = geo.properties.name || geo.name;
    
//     if (correctCountries.includes(name)) {
//       toast.info(`You already found ${name}!`);
//       return;
//     }

//     if (soundEnabled) soundEffects.playClick();
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName || !localTargetCountry || !queueState || isFeedbackLocked || gameComplete) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedSelected = selectedCountryName.toLowerCase().trim();
//     const normalizedTarget = localTargetCountry.toLowerCase().trim();

//     if (normalizedGuess !== normalizedSelected) {
//       if (soundEnabled) soundEffects.playWrong();
//       toast.error("Guess doesn't match selected country!");
//       return;
//     }

//     setTotalGuesses((prev) => prev + 1);

//     if (normalizedGuess !== normalizedTarget) {
//       if (soundEnabled) soundEffects.playWrong();

//       toast.error(`Wrong! That's ${selectedCountryName}, not what we're looking for.`, {
//         description: "Try another country or request more hints.",
//         duration: 3000,
//       });

//       setCurrentStreak(0);
//       setIsFeedbackLocked(true);

//       if (!wrongCountries.includes(selectedCountryName)) {
//         setState((prev) => ({
//           ...prev,
//           wrongCountries: [...prev.wrongCountries, selectedCountryName],
//         }));
//       }

//       setSelectedCountryName(null);

//       setTimeout(() => {
//         setIsFeedbackLocked(false);
//       }, 1500);

//       return;
//     }

//     if (soundEnabled) soundEffects.playCorrect();

//     toast.success(`🎉 Correct! It is ${localTargetCountry}`, {
//       duration: 2000,
//       className: "bg-green-50 text-green-800 border-green-200",
//     });

//     const newStreak = currentStreak + 1;
//     setCurrentStreak(newStreak);
//     setBestStreak((prev) => Math.max(prev, newStreak));

//     const newScore = score + 1;

//     setState((prev) => ({
//       ...prev,
//       correctCountries: [...prev.correctCountries, localTargetCountry],
//       wrongCountries: prev.wrongCountries.filter((c) => c !== localTargetCountry),
//       score: newScore,
//       targetCountry: null,
//     }));

//     checkAchievements(newScore, newStreak);

//     const currentQueueCountry = toQueueCountry(localTargetCountry);
//     const result = queueHandleCorrectGuess(queueState, currentQueueCountry, currentQueueCountry);

//     setQueueState(result.queueState);
//     clearHints();
//     setSelectedCountryName(null);
//     setLocalTargetCountry(null);
//     saveTargetCountry(null);
//     setInputResetToken((t) => t + 1);
//     setIsFeedbackLocked(true);

//     clearPendingTransition();

//     transitionTimerRef.current = setTimeout(() => {
//       setIsFeedbackLocked(false);

//       const nextCountry = result.queueState.queue[0] ?? null;

//       if (!nextCountry) {
//         setGameComplete(true);
//         toast.success("🎉 Game Complete! Great job!");
//         return;
//       }

//       loadHintRound(nextCountry.name, { freshHints: true });
//     }, 2000);
//   };

//   const handleRequestHint = () => {
//     if (!localTargetCountry || isFeedbackLocked || gameComplete) return;

//     const usedHintTexts = hints
//       .filter((h) => h.countryName === localTargetCountry)
//       .map((h) => h.text);

//     const remaining = getRemainingHintCount(localTargetCountry, usedHintTexts);

//     if (remaining === 0) {
//       toast.error("No more hints available for this country!");
//       return;
//     }

//     if (soundEnabled) soundEffects.playHint();

//     const hintText = getRandomHint(localTargetCountry, usedHintTexts);
//     if (!hintText) {
//       toast.error("No more hints available!");
//       return;
//     }

//     const hintType = hintText.includes("Located in")
//       ? "continent"
//       : hintText.includes("Capital city")
//       ? "capital"
//       : "fact";

//     addHint({
//       countryName: localTargetCountry,
//       text: hintText,
//       type: hintType,
//     });

//     setNewHint({
//       text: hintText,
//       type: hintType,
//       countryName: localTargetCountry,
//     });
//     setIsMapLocked(true);
//   };

//   const handlePass = () => {
//     if (!queueState || !localTargetCountry || isFeedbackLocked || gameComplete) return;

//     clearPendingTransition();
//     setNewHint(null);
//     setIsMapLocked(false);

//     const currentQueueCountry = toQueueCountry(localTargetCountry);
//     const result = queueHandlePass(queueState, currentQueueCountry);

//     setQueueState(result.queueState);
//     setSelectedCountryName(null);
//     setInputResetToken((t) => t + 1);

//     if (result.action === "complete") {
//       setGameComplete(true);
//       toast.success("Game Complete! Great job!", { duration: 2500 });
//       return;
//     }

//     if (result.action === "defer") {
//       if (result.passesRemaining === 2) {
//         toast.info("⏩ Moved to end. 2 passes left.", { duration: 2500 });
//       } else if (result.passesRemaining === 1) {
//         toast.info("⏩ Moved to end. 1 pass left.", { duration: 2500 });
//       } else {
//         toast.info("⏩ Moved to end. Passes left.", { duration: 2500 });
//       }

//       clearHints();

//       const nextCountry = result.queueState.queue[0] ?? null;
//       if (nextCountry) {
//         loadHintRound(nextCountry.name, { freshHints: true });
//       }
//       return;
//     }

//     toast.error(`❌ Country revealed: ${currentQueueCountry.name}`, { duration: 2500 });

//     if (!wrongCountries.includes(currentQueueCountry.name)) {
//       setState((prev) => ({
//         ...prev,
//         wrongCountries: [...prev.wrongCountries, currentQueueCountry.name],
//       }));
//     }

//     clearHints();
//     addHint({
//       countryName: currentQueueCountry.name,
//       text: `Answer: ${currentQueueCountry.name}`,
//       type: "fact",
//     });

//     setIsFeedbackLocked(true);

//     transitionTimerRef.current = setTimeout(() => {
//       setIsFeedbackLocked(false);
//       const nextCountry = result.queueState.queue[0] ?? null;

//       if (!nextCountry) {
//         setGameComplete(true);
//         toast.success("🎉 Game Complete! Great job!", { duration: 2500 });
//         return;
//       }

//       clearHints();
//       loadHintRound(nextCountry.name, { freshHints: true });
//     }, 1500);
//   };

//   const handleReveal = () => {
//     if (!queueState || !localTargetCountry || isFeedbackLocked || gameComplete) return;

//     clearPendingTransition();
//     setNewHint(null);
//     setIsMapLocked(false);

//     const currentQueueCountry = toQueueCountry(localTargetCountry);
//     const result = queueHandleReveal(queueState, currentQueueCountry);

//     setQueueState(result.queueState);
//     setSelectedCountryName(null);
//     setInputResetToken((t) => t + 1);

//     toast.info(`💡 Revealed: ${currentQueueCountry.name}. Removed from queue.`, {
//       duration: 2500,
//     });

//     if (!wrongCountries.includes(currentQueueCountry.name)) {
//       setState((prev) => ({
//         ...prev,
//         wrongCountries: [...prev.wrongCountries, currentQueueCountry.name],
//       }));
//     }

//     clearHints();
//     addHint({
//       countryName: currentQueueCountry.name,
//       text: `Answer: ${currentQueueCountry.name}`,
//       type: "fact",
//     });

//     setIsFeedbackLocked(true);

//     transitionTimerRef.current = setTimeout(() => {
//       setIsFeedbackLocked(false);
//       const nextCountry = result.queueState.queue[0] ?? null;

//       if (!nextCountry) {
//         setGameComplete(true);
//         toast.success("🎉 Game Complete! Great job!", { duration: 2500 });
//         return;
//       }

//       clearHints();
//       loadHintRound(nextCountry.name, { freshHints: true });
//     }, 1500);
//   };

//   const handleHintComplete = () => {
//     setNewHint(null);
//     setIsMapLocked(false);
//   };

//   const handleRestart = () => {
//     if (window.confirm("Are you sure you want to restart this game? All progress will be lost.")) {
//       clearPendingTransition();
//       clearQueueState(QUEUE_STORAGE_KEY);

//       resetState();
//       setLocalTargetCountry(null);
//       setSelectedCountryName(null);
//       setNewHint(null);
//       setIsMapLocked(false);
//       setWaitingForNextRound(false);
//       setTotalGuesses(0);
//       setCurrentStreak(0);
//       setBestStreak(0);
//       setAchievements(defaultAchievements);
//       setQueueState(null);
//       setGameComplete(false);
//       setIsFeedbackLocked(false);
//       setInputResetToken((t) => t + 1);

//       bootstrapQueue();
//       toast.success("Game restarted!");
//     }
//   };

//   const handleBackToMenu = () => {
//     onBackToMenu();
//   };

//   const passesLeft = getRemainingPassesForCurrentCountry(
//     queueState,
//     localTargetCountry ? toQueueCountry(localTargetCountry) : null
//   );

//   const queueCount = queueState?.queue.length ?? 0;

//   if (loading) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
//           <p className="text-muted-foreground font-medium">Loading World Map...</p>
//         </div>
//       </div>
//     );
//   }

//   const usedHintTexts = localTargetCountry 
//     ? hints.filter(h => h.countryName === localTargetCountry).map(h => h.text)
//     : [];
//   const hintsAvailable = localTargetCountry 
//     ? getRemainingHintCount(localTargetCountry, usedHintTexts) > 0
//     : false;
//   const remainingHints = localTargetCountry
//     ? getRemainingHintCount(localTargetCountry, usedHintTexts)
//     : 0;

//   return (
//     <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//       <Toaster position="top-center" />

//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       {/* Normal controls — hidden in TV mode */}
//       {!config.isTV && (
//         <div className="absolute inset-0 z-10 pointer-events-none">
//           <div className="pointer-events-auto">
//             <GameControls
//               selectedCountryName={selectedCountryName}
//               onGuess={handleGuess}
//               onHint={handleRequestHint}
//               onPass={handlePass}
//               onReveal={handleReveal}
//               passDisabled={isFeedbackLocked || gameComplete || !localTargetCountry}
//               revealDisabled={false}
//               onRestart={handleRestart}
//               onBackToMenu={handleBackToMenu}
//               onOpenStats={() => setShowStats(true)}
//               onOpenAchievements={() => setShowAchievements(true)}
//               onToggleSound={() => {
//                 const newState = soundEffects.toggle();
//                 setSoundEnabled(newState);
//               }}
//               soundEnabled={soundEnabled}
//               score={score}
//               totalCountries={countries.length}
//               allCountryNames={allCountryNames}
//               hintsAvailable={hintsAvailable}
//               remainingHints={remainingHints}
//               queueCount={queueCount}
//               passesLeft={passesLeft}
//               inputResetToken={inputResetToken}
//             />

//             <HintStack 
//               hints={hints}
//               onClose={removeHint}
//               onRequestHint={handleRequestHint}
//               showRequestButton={true}
//               hintsAvailable={hintsAvailable}
//             />
//           </div>
//         </div>
//       )}

//       {/* TV mode — HintStack stays visible so the class can read the clues on screen */}
//       {config.isTV && (
//         <div className="absolute inset-0 z-10 pointer-events-none">
//           <div className="pointer-events-auto">
//             <HintStack 
//               hints={hints}
//               onClose={removeHint}
//               onRequestHint={handleRequestHint}
//               showRequestButton={true}
//               hintsAvailable={hintsAvailable}
//             />
//           </div>
//         </div>
//       )}

//       {/* TV / Classroom HUD overlay */}
//       {config.isTV && (
//         <ClassroomHUD
//           score={score}
//           totalCountries={countries.length}
//           selectedCountryName={selectedCountryName}
//           allCountryNames={allCountryNames}
//           onGuess={handleGuess}
//           onExitTVMode={toggleTVMode}
//           onBackToMenu={handleBackToMenu}
//           onRestart={handleRestart}
//           streak={currentStreak}
//           targetLabel="Selected country"
//           mode="hint-based"
//         />
//       )}

//       <NewHintModal
//         hint={newHint}
//         onComplete={handleHintComplete}
//         lockDuration={5}
//       />

//       {isMapLocked && (
//         <div className="absolute inset-0 z-40 bg-black/10 pointer-events-none" />
//       )}

//       <Statistics
//         isOpen={showStats}
//         onClose={() => setShowStats(false)}
//         stats={{
//           totalGuesses,
//           correctGuesses: score,
//           wrongGuesses: totalGuesses - score,
//           hintsUsed: hints.length,
//           currentStreak,
//           bestStreak,
//           countriesFound: score,
//           totalCountries: countries.length,
//           accuracy: totalGuesses > 0 ? (score / totalGuesses) * 100 : 0,
//           averageHintsPerCountry: score > 0 ? hints.length / score : 0,
//         }}
//       />

//       <AchievementsList
//         achievements={achievements}
//         isOpen={showAchievements}
//         onClose={() => setShowAchievements(false)}
//       />

//       <AnimatePresence>
//         {unlockedAchievement && (
//           <AchievementNotification
//             achievement={unlockedAchievement}
//             onClose={() => setUnlockedAchievement(null)}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


//newest(text input to click and submit)

// HintBasedGame.tsx - Complete with Sound, Stats, Achievements, TV Mode, and Queue System
// HintBasedGame.tsx - Complete with Sound, Stats, Achievements, TV Mode, and Queue System
import React, { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence } from "motion/react";
import WorldMap from "@/app/components/WorldMap";
import { GameControls } from "@/app/components/GameControls";
import { HintStack } from "@/app/components/HintStack";
import { NewHintModal } from "@/app/components/NewHintModal";
import { Statistics } from "@/app/components/Statistics";
import { AchievementsList, AchievementNotification, defaultAchievements, type Achievement } from "@/app/components/Achievements";
import { useCountryData } from "@/app/hooks/useCountryData";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";
import { ClassroomHUD } from "@/app/components/ClassroomHUD";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { useGameState } from "@/app/hooks/useGameState";
import { getRandomHint, getRemainingHintCount } from "@/app/utils/getRandomHint";
import { soundEffects } from "@/app/utils/soundEffects";
import {
  initializeQueue,
  loadQueueState,
  saveQueueState,
  clearQueueState,
  handlePass as queueHandlePass,
  handleReveal as queueHandleReveal,
  handleCorrectGuess as queueHandleCorrectGuess,
  getRemainingPassesForCurrentCountry,
  toQueueCountry,
  type PassQueueState,
} from "@/app/utils/queueSystem";

interface HintBasedGameProps {
  onBackToMenu: () => void;
}

export function HintBasedGame({ onBackToMenu }: HintBasedGameProps) {
  const { countries, loading } = useCountryData();
  const { config, toggleTVMode } = useDisplayMode();

  const [targetCountryName, setTargetCountryName] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [newHint, setNewHint] = useState<{ text: string; type: any; countryName: string } | null>(null);
  const [isMapLocked, setIsMapLocked] = useState(false);
  const [waitingForNextRound, setWaitingForNextRound] = useState(false);
  
  // Polish features state
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  
  // Queue system state
  const QUEUE_STORAGE_KEY = "passQueue_hint-based";
  const [queueState, setQueueState] = useState<PassQueueState | null>(null);
  const [isFeedbackLocked, setIsFeedbackLocked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [inputResetToken, setInputResetToken] = useState(0);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { 
    state, setState, addHint, removeHint, clearHints, 
    setTargetCountry: saveTargetCountry, resetState 
  } = useGameState("hint-based");
  
  const { correctCountries, wrongCountries, score, hints, targetCountry } = state;

  const [localTargetCountry, setLocalTargetCountry] = useState<string | null>(targetCountry || null);

  const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

  const remainingCountries = useMemo(() => {
    return allCountryNames.filter(name => !correctCountries.includes(name));
  }, [allCountryNames, correctCountries]);

  const hasExistingHintsForTarget = useMemo(() => {
    if (!localTargetCountry) return false;
    return hints.some(h => h.countryName === localTargetCountry);
  }, [hints, localTargetCountry]);

  const clearPendingTransition = () => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  };

  const clearWrongCountries = () => {
    setState(prev => ({
      ...prev,
      wrongCountries: [],
    }));
  };

  const loadHintRound = (
    countryName: string | null,
    options?: { freshHints?: boolean }
  ) => {
    clearWrongCountries(); // clear red countries for the new round

    setLocalTargetCountry(countryName);
    saveTargetCountry(countryName);
    setSelectedCountryName(null);
    setGameComplete(false);
    setInputResetToken((t) => t + 1);

    if (!countryName) {
      setNewHint(null);
      setIsMapLocked(false);
      return;
    }

    const usedHintTexts = options?.freshHints
      ? []
      : hints.filter((h) => h.countryName === countryName).map((h) => h.text);

    const hasExistingHints = !options?.freshHints && usedHintTexts.length > 0;

    if (!hasExistingHints) {
      const hintText = getRandomHint(countryName, usedHintTexts);

      if (hintText) {
        const hintType = hintText.includes("Located in")
          ? "continent"
          : hintText.includes("Capital city")
          ? "capital"
          : "fact";

        if (soundEnabled) soundEffects.playHint();

        addHint({
          countryName,
          text: hintText,
          type: hintType,
        });

        setNewHint({
          text: hintText,
          type: hintType,
          countryName,
        });
        setIsMapLocked(true);
        return;
      }
    }

    // Existing hints already present for this country
    setNewHint(null);
    setIsMapLocked(false);
  };

  const bootstrapQueue = () => {
    const saved = loadQueueState(QUEUE_STORAGE_KEY);
    const initial = saved ?? initializeQueue(allCountryNames, true);

    setQueueState(initial);
    setGameComplete(initial.queue.length === 0);

    const initialTarget =
      targetCountry ??
      initial.queue[0]?.name ??
      null;

    if (initialTarget) {
      loadHintRound(initialTarget, { freshHints: false });
    } else {
      setLocalTargetCountry(null);
      saveTargetCountry(null);
      setSelectedCountryName(null);
      setNewHint(null);
      setIsMapLocked(false);
    }
  };

  // Check achievements
  const checkAchievements = (newScore: number, newStreak: number) => {
    let updatedAchievements = [...achievements];
    let newlyUnlocked: Achievement | null = null;

    if (newScore >= 1 && !achievements.find(a => a.id === 'first_country')?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === 'first_country');
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
      newlyUnlocked = updatedAchievements[idx];
    }
    
    if (newScore >= 5 && !achievements.find(a => a.id === 'five_countries')?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === 'five_countries');
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
      newlyUnlocked = updatedAchievements[idx];
    } else {
      const idx = updatedAchievements.findIndex(a => a.id === 'five_countries');
      if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 5) };
    }
    
    if (newScore >= 10 && !achievements.find(a => a.id === 'ten_countries')?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === 'ten_countries');
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
      newlyUnlocked = updatedAchievements[idx];
    } else {
      const idx = updatedAchievements.findIndex(a => a.id === 'ten_countries');
      if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 10) };
    }
    
    if (newScore >= 50 && !achievements.find(a => a.id === 'fifty_countries')?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === 'fifty_countries');
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
      newlyUnlocked = updatedAchievements[idx];
    } else {
      const idx = updatedAchievements.findIndex(a => a.id === 'fifty_countries');
      if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 50) };
    }
    
    if (newStreak >= 5 && !achievements.find(a => a.id === 'streak_5')?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === 'streak_5');
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
      newlyUnlocked = updatedAchievements[idx];
    } else {
      const idx = updatedAchievements.findIndex(a => a.id === 'streak_5');
      if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 5) };
    }
    
    if (newStreak >= 10 && !achievements.find(a => a.id === 'streak_10')?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === 'streak_10');
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
      newlyUnlocked = updatedAchievements[idx];
    } else {
      const idx = updatedAchievements.findIndex(a => a.id === 'streak_10');
      if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 10) };
    }
    
    const accuracy = totalGuesses > 0 ? (newScore / totalGuesses) * 100 : 0;
    if (accuracy === 100 && totalGuesses >= 20 && !achievements.find(a => a.id === 'perfect_accuracy')?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === 'perfect_accuracy');
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
      newlyUnlocked = updatedAchievements[idx];
    }
    
    if (newlyUnlocked) {
      if (soundEnabled) soundEffects.playAchievement();
      setUnlockedAchievement(newlyUnlocked);
    }
    
    setAchievements(updatedAchievements);
  };

  // Initialization effects
  useEffect(() => {
    if (countries.length === 0) return;
    if (queueState) return;

    bootstrapQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, allCountryNames]);

  useEffect(() => {
    if (queueState) {
      saveQueueState(QUEUE_STORAGE_KEY, queueState);
    }
  }, [queueState]);

  useEffect(() => {
    return () => clearPendingTransition();
  }, []);

  useEffect(() => {
    if (countries.length === 0 || waitingForNextRound) return;

    if (targetCountry && hasExistingHintsForTarget) {
      setLocalTargetCountry(targetCountry);
    } else if (targetCountry && !hasExistingHintsForTarget) {
      setLocalTargetCountry(null);
      saveTargetCountry(null);
      // Queue handles next round
    } else if (!localTargetCountry && !gameComplete && queueState?.queue.length) {
      // This will be handled by the queue system
    }
  }, [countries, targetCountry, hasExistingHintsForTarget, waitingForNextRound, queueState, gameComplete]);

  const handleCountryClick = (geo: any) => {
    if (isMapLocked || waitingForNextRound || isFeedbackLocked || gameComplete) {
      if (isMapLocked) toast.error("Please wait for the hint timer to complete");
      return;
    }

    const name = geo.properties.name || geo.name;
    
    if (correctCountries.includes(name)) {
      toast.info(`You already found ${name}!`);
      return;
    }

    if (soundEnabled) soundEffects.playClick();
    setSelectedCountryName(name);
  };

  const handleConfirm = () => {
    if (isFeedbackLocked || waitingForNextRound || gameComplete) return;

    if (!selectedCountryName) {
      toast.warning("Please click a country on the map first", { duration: 2500 });
      return;
    }

    if (!localTargetCountry || !queueState) return;

    setTotalGuesses((prev) => prev + 1);

    const normalizedSelected = selectedCountryName.toLowerCase().trim();
    const normalizedTarget = localTargetCountry.toLowerCase().trim();

    if (normalizedSelected !== normalizedTarget) {
      if (soundEnabled) soundEffects.playWrong();

      toast.error("❌ Wrong! Try again.", { duration: 2500 });
      setCurrentStreak(0);
      setSelectedCountryName(null);

      if (!wrongCountries.includes(selectedCountryName)) {
        setState((prev) => ({
          ...prev,
          wrongCountries: [...prev.wrongCountries, selectedCountryName],
        }));
      }
      return;
    }

    if (soundEnabled) soundEffects.playCorrect();

    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    setBestStreak((prev) => Math.max(prev, newStreak));

    const newScore = score + 1;

    toast.success(`✅ Correct! +1 point`, {
      duration: 2500,
      className: "bg-green-50 text-green-800 border-green-200",
    });

    setState((prev) => ({
      ...prev,
      correctCountries: [...prev.correctCountries, localTargetCountry],
      wrongCountries: prev.wrongCountries.filter((c) => c !== localTargetCountry),
      score: newScore,
      targetCountry: null,
    }));

    checkAchievements(newScore, newStreak);

    const currentQueueCountry = toQueueCountry(localTargetCountry);
    const result = queueHandleCorrectGuess(queueState, currentQueueCountry, currentQueueCountry);

    setQueueState(result.queueState);
    clearHints();
    setSelectedCountryName(null);
    setLocalTargetCountry(null);
    saveTargetCountry(null);
    setInputResetToken((t) => t + 1);
    setIsFeedbackLocked(true);
    setWaitingForNextRound(true);

    setTimeout(() => {
      setIsFeedbackLocked(false);
      setWaitingForNextRound(false);

      const nextCountry = result.queueState.queue[0] ?? null;
      if (!nextCountry) {
        setGameComplete(true);
        toast.success("🎉 Game Complete! Great job!", { duration: 2500 });
        return;
      }

      loadHintRound(nextCountry.name, { freshHints: true });
    }, 2000);
  };

  const handleRequestHint = () => {
    if (!localTargetCountry || isFeedbackLocked || gameComplete || waitingForNextRound) return;

    const usedHintTexts = hints
      .filter((h) => h.countryName === localTargetCountry)
      .map((h) => h.text);

    const remaining = getRemainingHintCount(localTargetCountry, usedHintTexts);

    if (remaining === 0) {
      toast.error("No more hints available for this country!");
      return;
    }

    if (soundEnabled) soundEffects.playHint();

    const hintText = getRandomHint(localTargetCountry, usedHintTexts);
    if (!hintText) {
      toast.error("No more hints available!");
      return;
    }

    const hintType = hintText.includes("Located in")
      ? "continent"
      : hintText.includes("Capital city")
      ? "capital"
      : "fact";

    addHint({
      countryName: localTargetCountry,
      text: hintText,
      type: hintType,
    });

    setNewHint({
      text: hintText,
      type: hintType,
      countryName: localTargetCountry,
    });
    setIsMapLocked(true);
  };

  const handlePass = () => {
    if (!queueState || !localTargetCountry || isFeedbackLocked || gameComplete) return;

    setSelectedCountryName(null);
    setNewHint(null);
    setIsMapLocked(false);
    clearPendingTransition();

    const currentQueueCountry = toQueueCountry(localTargetCountry);
    const result = queueHandlePass(queueState, currentQueueCountry);

    setQueueState(result.queueState);
    setInputResetToken((t) => t + 1);

    if (result.action === "complete") {
      setGameComplete(true);
      toast.success("Game Complete! Great job!", { duration: 2500 });
      return;
    }

    if (result.action === "defer") {
      if (result.passesRemaining === 2) {
        toast.info("⏩ Moved to end. 2 passes left.", { duration: 2500 });
      } else if (result.passesRemaining === 1) {
        toast.info("⏩ Moved to end. 1 pass left.", { duration: 2500 });
      } else {
        toast.info("⏩ Moved to end. Passes left.", { duration: 2500 });
      }

      clearHints();
      const nextCountry = result.queueState.queue[0] ?? null;
      if (nextCountry) loadHintRound(nextCountry.name, { freshHints: true });
      return;
    }

    toast.error(`❌ Country revealed: ${currentQueueCountry.name}`, { duration: 2500 });

    if (!wrongCountries.includes(currentQueueCountry.name)) {
      setState((prev) => ({
        ...prev,
        wrongCountries: [...prev.wrongCountries, currentQueueCountry.name],
      }));
    }

    clearHints();
    addHint({
      countryName: currentQueueCountry.name,
      text: `Answer: ${currentQueueCountry.name}`,
      type: "fact",
    });

    setIsFeedbackLocked(true);
    setTimeout(() => {
      setIsFeedbackLocked(false);
      const nextCountry = result.queueState.queue[0] ?? null;
      if (!nextCountry) {
        setGameComplete(true);
        toast.success("🎉 Game Complete! Great job!", { duration: 2500 });
        return;
      }
      clearHints();
      loadHintRound(nextCountry.name, { freshHints: true });
    }, 1500);
  };

  const handleReveal = () => {
    if (!queueState || !localTargetCountry || isFeedbackLocked || gameComplete) return;

    setSelectedCountryName(null);
    setNewHint(null);
    setIsMapLocked(false);
    clearPendingTransition();

    const currentQueueCountry = toQueueCountry(localTargetCountry);
    const result = queueHandleReveal(queueState, currentQueueCountry);

    setQueueState(result.queueState);
    setInputResetToken((t) => t + 1);

    toast.info(`💡 Revealed: ${currentQueueCountry.name}. Removed from queue.`, {
      duration: 2500,
    });

    if (!wrongCountries.includes(currentQueueCountry.name)) {
      setState((prev) => ({
        ...prev,
        wrongCountries: [...prev.wrongCountries, currentQueueCountry.name],
      }));
    }

    clearHints();
    addHint({
      countryName: currentQueueCountry.name,
      text: `Answer: ${currentQueueCountry.name}`,
      type: "fact",
    });

    setIsFeedbackLocked(true);
    setTimeout(() => {
      setIsFeedbackLocked(false);
      const nextCountry = result.queueState.queue[0] ?? null;
      if (!nextCountry) {
        setGameComplete(true);
        toast.success("🎉 Game Complete! Great job!", { duration: 2500 });
        return;
      }
      clearHints();
      loadHintRound(nextCountry.name, { freshHints: true });
    }, 1500);
  };

  const handleHintComplete = () => {
    setNewHint(null);
    setIsMapLocked(false);
  };

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart this game? All progress will be lost.")) {
      clearPendingTransition();
      clearQueueState(QUEUE_STORAGE_KEY);

      resetState();
      setLocalTargetCountry(null);
      setSelectedCountryName(null);
      setNewHint(null);
      setIsMapLocked(false);
      setWaitingForNextRound(false);
      setTotalGuesses(0);
      setCurrentStreak(0);
      setBestStreak(0);
      setAchievements(defaultAchievements);
      setQueueState(null);
      setGameComplete(false);
      setIsFeedbackLocked(false);
      setInputResetToken((t) => t + 1);

      bootstrapQueue();
      toast.success("Game restarted!");
    }
  };

  const handleBackToMenu = () => {
    onBackToMenu();
  };

  const passesLeft = getRemainingPassesForCurrentCountry(
    queueState,
    localTargetCountry ? toQueueCountry(localTargetCountry) : null
  );

  const queueCount = queueState?.queue.length ?? 0;

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

  const usedHintTexts = localTargetCountry 
    ? hints.filter(h => h.countryName === localTargetCountry).map(h => h.text)
    : [];
  const hintsAvailable = localTargetCountry 
    ? getRemainingHintCount(localTargetCountry, usedHintTexts) > 0
    : false;
  const remainingHints = localTargetCountry
    ? getRemainingHintCount(localTargetCountry, usedHintTexts)
    : 0;

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Toaster position="top-center" />

      <div className="absolute inset-0 z-0">
        <WorldMap
          countries={countries}
          onCountryClick={handleCountryClick}
          selectedCountryName={selectedCountryName}
          correctCountries={correctCountries}
          wrongCountries={wrongCountries}
        />
      </div>

      {/* Normal controls — hidden in TV mode */}
      {!config.isTV && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <GameControls
              selectedCountryName={selectedCountryName}
              onGuess={() => {}}
              onConfirm={handleConfirm}
              confirmDisabled={!selectedCountryName || isFeedbackLocked || waitingForNextRound || gameComplete}
              onHint={handleRequestHint}
              onPass={handlePass}
              onReveal={handleReveal}
              passDisabled={isFeedbackLocked || gameComplete || !localTargetCountry}
              revealDisabled={false}
              useClickConfirm
              onRestart={handleRestart}
              onBackToMenu={handleBackToMenu}
              onOpenStats={() => setShowStats(true)}
              onOpenAchievements={() => setShowAchievements(true)}
              onToggleSound={() => {
                const newState = soundEffects.toggle();
                setSoundEnabled(newState);
              }}
              soundEnabled={soundEnabled}
              score={score}
              totalCountries={countries.length}
              allCountryNames={allCountryNames}
              hintsAvailable={hintsAvailable}
              remainingHints={remainingHints}
              queueCount={queueCount}
              passesLeft={passesLeft}
              inputResetToken={inputResetToken}
            />

            <HintStack 
              hints={hints}
              onClose={removeHint}
              onRequestHint={handleRequestHint}
              showRequestButton={true}
              hintsAvailable={hintsAvailable}
            />
          </div>
        </div>
      )}

      {/* TV mode — HintStack stays visible so the class can read the clues on screen */}
      {config.isTV && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <HintStack 
              hints={hints}
              onClose={removeHint}
              onRequestHint={handleRequestHint}
              showRequestButton={true}
              hintsAvailable={hintsAvailable}
            />
          </div>
        </div>
      )}

      {/* TV / Classroom HUD overlay */}
      {config.isTV && (
        <ClassroomHUD
          score={score}
          totalCountries={countries.length}
          selectedCountryName={selectedCountryName}
          allCountryNames={allCountryNames}
          onGuess={handleConfirm}
          onExitTVMode={toggleTVMode}
          onBackToMenu={handleBackToMenu}
          onRestart={handleRestart}
          streak={currentStreak}
          targetLabel="Selected country"
          mode="hint-based"
        />
      )}

      <NewHintModal
        hint={newHint}
        onComplete={handleHintComplete}
        lockDuration={5}
      />

      {isMapLocked && (
        <div className="absolute inset-0 z-40 bg-black/10 pointer-events-none" />
      )}

      <Statistics
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={{
          totalGuesses,
          correctGuesses: score,
          wrongGuesses: totalGuesses - score,
          hintsUsed: hints.length,
          currentStreak,
          bestStreak,
          countriesFound: score,
          totalCountries: countries.length,
          accuracy: totalGuesses > 0 ? (score / totalGuesses) * 100 : 0,
          averageHintsPerCountry: score > 0 ? hints.length / score : 0,
        }}
      />

      <AchievementsList
        achievements={achievements}
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

      <AnimatePresence>
        {unlockedAchievement && (
          <AchievementNotification
            achievement={unlockedAchievement}
            onClose={() => setUnlockedAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}