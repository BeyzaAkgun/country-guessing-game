// // FlagQuizGame.tsx - Flag Quiz Mode: See flag, find country
// import React, { useState, useEffect, useMemo } from "react";
// import { AnimatePresence, motion } from "motion/react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { Statistics } from "@/app/components/Statistics";
// import {
//   AchievementsList,
//   AchievementNotification,
//   defaultAchievements,
//   type Achievement,
// } from "@/app/components/Achievements";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { useDisplayMode } from "@/app/hooks/useDisplayMode";
// import { ClassroomHUD } from "@/app/components/ClassroomHUD";
// import { toast, Toaster } from "sonner";
// import { Loader2, Flag, ChevronUp, ChevronDown } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { soundEffects } from "@/app/utils/soundEffects";



// interface FlagQuizGameProps {
//   onBackToMenu: () => void;
// }

// // Maps normalized country names → ISO 3166-1 alpha-2 codes for flagcdn.com
// const COUNTRY_CODE_MAP: { [key: string]: string } = {
//   // A
//   "Afghanistan": "af",
//   "Albania": "al",
//   "Algeria": "dz",
//   "Angola": "ao",
//   "Argentina": "ar",
//   "Armenia": "am",
//   "Australia": "au",
//   "Austria": "at",
//   "Azerbaijan": "az",
//   // B
//   "Bahamas": "bs",
//   "Bahrain": "bh",
//   "Bangladesh": "bd",
//   "Barbados": "bb",
//   "Belarus": "by",
//   "Belgium": "be",
//   "Belize": "bz",
//   "Benin": "bj",
//   "Bhutan": "bt",
//   "Bolivia": "bo",
//   "Bosnia and Herzegovina": "ba",
//   "Botswana": "bw",
//   "Brazil": "br",
//   "Brunei": "bn",
//   "Bulgaria": "bg",
//   "Burkina Faso": "bf",
//   "Burundi": "bi",
//   // C
//   "Cambodia": "kh",
//   "Cameroon": "cm",
//   "Canada": "ca",
//   "Cabo Verde": "cv",
//   "Central African Republic": "cf",
//   "Chad": "td",
//   "Chile": "cl",
//   "China": "cn",
//   "Colombia": "co",
//   "Comoros": "km",
//   "Republic of the Congo": "cg",
//   "Democratic Republic of the Congo": "cd",
//   "Costa Rica": "cr",
//   "Croatia": "hr",
//   "Cuba": "cu",
//   "Cyprus": "cy",
//   "Czechia": "cz",
//   // D
//   "Denmark": "dk",
//   "Djibouti": "dj",
//   "Dominican Republic": "do",
//   // E
//   "Ecuador": "ec",
//   "Egypt": "eg",
//   "El Salvador": "sv",
//   "Equatorial Guinea": "gq",
//   "Eritrea": "er",
//   "Eswatini": "sz",
//   "Estonia": "ee",
//   "Ethiopia": "et",
//   // F
//   "Falkland Islands": "fk",
//   "Fiji": "fj",
//   "Finland": "fi",
//   "France": "fr",
//   // G
//   "Gabon": "ga",
//   "Gambia": "gm",
//   "Georgia": "ge",
//   "Germany": "de",
//   "Ghana": "gh",
//   "Greece": "gr",
//   "Greenland": "gl",
//   "Guatemala": "gt",
//   "Guinea": "gn",
//   "Guinea-Bissau": "gw",
//   "Guyana": "gy",
//   // H
//   "Haiti": "ht",
//   "Honduras": "hn",
//   "Hungary": "hu",
//   // I
//   "Iceland": "is",
//   "India": "in",
//   "Indonesia": "id",
//   "Iran": "ir",
//   "Iraq": "iq",
//   "Ireland": "ie",
//   "Israel": "il",
//   "Italy": "it",
//   "Ivory Coast": "ci",
//   // J
//   "Jamaica": "jm",
//   "Japan": "jp",
//   "Jordan": "jo",
//   // K
//   "Kazakhstan": "kz",
//   "Kenya": "ke",
//   "Kosovo": "xk",
//   "Kuwait": "kw",
//   "Kyrgyzstan": "kg",
//   // L
//   "Laos": "la",
//   "Latvia": "lv",
//   "Lebanon": "lb",
//   "Lesotho": "ls",
//   "Liberia": "lr",
//   "Libya": "ly",
//   "Liechtenstein": "li",
//   "Lithuania": "lt",
//   "Luxembourg": "lu",
//   // M
//   "Madagascar": "mg",
//   "Malawi": "mw",
//   "Malaysia": "my",
//   "Maldives": "mv",
//   "Mali": "ml",
//   "Malta": "mt",
//   "Marshall Islands": "mh",
//   "Mauritania": "mr",
//   "Mauritius": "mu",
//   "Mexico": "mx",
//   "Micronesia": "fm",
//   "Moldova": "md",
//   "Monaco": "mc",
//   "Mongolia": "mn",
//   "Montenegro": "me",
//   "Morocco": "ma",
//   "Mozambique": "mz",
//   "Myanmar": "mm",
//   // N
//   "Namibia": "na",
//   "Nauru": "nr",
//   "Nepal": "np",
//   "Netherlands": "nl",
//   "New Caledonia": "nc",
//   "New Zealand": "nz",
//   "Nicaragua": "ni",
//   "Niger": "ne",
//   "Nigeria": "ng",
//   "North Korea": "kp",
//   "North Macedonia": "mk",
//   "Northern Cyprus": "cy",
//   "Norway": "no",
//   // O
//   "Oman": "om",
//   // P
//   "Pakistan": "pk",
//   "Palau": "pw",
//   "Palestine": "ps",
//   "Panama": "pa",
//   "Papua New Guinea": "pg",
//   "Paraguay": "py",
//   "Peru": "pe",
//   "Philippines": "ph",
//   "Poland": "pl",
//   "Portugal": "pt",
//   // Q
//   "Qatar": "qa",
//   // R
//   "Romania": "ro",
//   "Russia": "ru",
//   "Rwanda": "rw",
//   // S
//   "Saudi Arabia": "sa",
//   "Senegal": "sn",
//   "Serbia": "rs",
//   "Seychelles": "sc",
//   "Sierra Leone": "sl",
//   "Slovakia": "sk",
//   "Slovenia": "si",
//   "Solomon Islands": "sb",
//   "Somalia": "so",
//   "Somaliland": "so",
//   "South Africa": "za",
//   "South Korea": "kr",
//   "South Sudan": "ss",
//   "Spain": "es",
//   "Sri Lanka": "lk",
//   "Sudan": "sd",
//   "Suriname": "sr",
//   "Sweden": "se",
//   "Switzerland": "ch",
//   "Syria": "sy",
//   // T
//   "Taiwan": "tw",
//   "Tajikistan": "tj",
//   "Tanzania": "tz",
//   "Thailand": "th",
//   "Timor-Leste": "tl",
//   "Togo": "tg",
//   "Tonga": "to",
//   "Trinidad and Tobago": "tt",
//   "Tunisia": "tn",
//   "Turkey": "tr",
//   "Turkmenistan": "tm",
//   "Tuvalu": "tv",
//   // U
//   "Uganda": "ug",
//   "Ukraine": "ua",
//   "United Arab Emirates": "ae",
//   "United Kingdom": "gb",
//   "United States of America": "us",
//   "Uruguay": "uy",
//   "Uzbekistan": "uz",
//   // V
//   "Vanuatu": "vu",
//   "Venezuela": "ve",
//   "Vietnam": "vn",
//   // W
//   "Western Sahara": "eh",
//   // Y
//   "Yemen": "ye",
//   // Z
//   "Zambia": "zm",
//   "Zimbabwe": "zw",
// };

// export function FlagQuizGame({ onBackToMenu }: FlagQuizGameProps) {
//   const { countries, loading } = useCountryData();
//   const { config, toggleTVMode } = useDisplayMode();

//   const [targetCountryName, setTargetCountryName] = useState<string | null>(null);
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [waitingForNextRound, setWaitingForNextRound] = useState(false);
//   const [flagUrl, setFlagUrl] = useState<string>("");

//   // Show/hide the flag card so the map stays fully visible when needed
//   const [flagVisible, setFlagVisible] = useState(true);

//   // Polish features
//   const [showStats, setShowStats] = useState(false);
//   const [showAchievements, setShowAchievements] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
//   const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
//   const [totalGuesses, setTotalGuesses] = useState(0);
//   const [currentStreak, setCurrentStreak] = useState(0);
//   const [bestStreak, setBestStreak] = useState(0);
  
//   const { state, setState, setTargetCountry: saveTargetCountry, resetState } = useGameState("flag-quiz" as any);
//   const { correctCountries, wrongCountries, score, targetCountry } = state;
//   const [localTargetCountry, setLocalTargetCountry] = useState<string | null>(targetCountry || null);

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);
//   const remainingCountries = useMemo(() => {
//     return allCountryNames.filter(name => !correctCountries.includes(name));
//   }, [allCountryNames, correctCountries]);

//   const getCountryCode = (countryName: string): string => {
//     const code = COUNTRY_CODE_MAP[countryName];
//     if (!code) {
//       console.warn(`No flag code found for: "${countryName}" — add it to COUNTRY_CODE_MAP`);
//       return "xx";
//     }
//     return code;
//   };

//   // Check achievements
//   const checkAchievements = (newScore: number, newStreak: number) => {
//     let updatedAchievements = [...achievements];
//     let newlyUnlocked: Achievement | null = null;

//     if (newScore >= 1 && !achievements.find(a => a.id === "first_country")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "first_country");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
//       newlyUnlocked = updatedAchievements[idx];
//     }
//     if (newScore >= 5 && !achievements.find(a => a.id === "five_countries")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "five_countries");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === "five_countries");
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 5) };
//     }
//     if (newScore >= 10 && !achievements.find(a => a.id === "ten_countries")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "ten_countries");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === "ten_countries");
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 10) };
//     }
//     if (newScore >= 50 && !achievements.find(a => a.id === "fifty_countries")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "fifty_countries");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === "fifty_countries");
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 50) };
//     }
//     if (newStreak >= 5 && !achievements.find(a => a.id === "streak_5")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "streak_5");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === "streak_5");
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 5) };
//     }
//     if (newStreak >= 10 && !achievements.find(a => a.id === "streak_10")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "streak_10");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === "streak_10");
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 10) };
//     }

//     if (newlyUnlocked) {
//       if (soundEnabled) soundEffects.playAchievement();
//       setUnlockedAchievement(newlyUnlocked);
//     }
//     setAchievements(updatedAchievements);
//   };

//   const startNewRound = () => {
//     if (remainingCountries.length === 0) {
//       toast.success("🎉 Congratulations! You've identified all flags!", { duration: 5000 });
//       return;
//     }
//     const randomIndex = Math.floor(Math.random() * remainingCountries.length);
//     const randomCountry = remainingCountries[randomIndex];

//     const code = getCountryCode(randomCountry);
//     console.log(`Target country: "${randomCountry}" | Code: "${code}"`);

//     setLocalTargetCountry(randomCountry);
//     saveTargetCountry(randomCountry);
//     setFlagUrl(`https://flagcdn.com/w320/${code}.png`);
//     setSelectedCountryName(null);
//     setFlagVisible(true); // always show flag at start of new round
//   };

//   useEffect(() => {
//     if (countries.length === 0 || waitingForNextRound) return;
//     if (targetCountry && !correctCountries.includes(targetCountry)) {
//       setLocalTargetCountry(targetCountry);
//       const code = getCountryCode(targetCountry);
//       setFlagUrl(`https://flagcdn.com/w320/${code}.png`);
//     } else if (!localTargetCountry) {
//       startNewRound();
//     }
//   }, [countries, targetCountry]);

//   const handleCountryClick = (geo: any) => {
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
//       toast.success(`🎉 Correct! That's the flag of ${localTargetCountry}!`, {
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
//         targetCountry: null,
//       });

//       checkAchievements(newScore, newStreak);
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
//       toast.error(`Wrong! That's ${selectedCountryName}, not the flag we're looking for.`, {
//         description: "Look at the flag carefully and try again!",
//         duration: 3000,
//       });
//       setCurrentStreak(0);
//       if (!wrongCountries.includes(selectedCountryName)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, selectedCountryName] });
//       }
//       setSelectedCountryName(null);
//     }
//   };

//   const handleRestart = () => {
//     if (window.confirm("Are you sure you want to restart this game? All progress will be lost.")) {
//       resetState();
//       setLocalTargetCountry(null);
//       setSelectedCountryName(null);
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

//       {/* ── Flag card + hide/show toggle ─────────────────────────────────────
//           Toggle button is always at a fixed position (top of the stack).
//           The flag card appears below it, sliding in/out instantly.
//       ──────────────────────────────────────────────────────────────────────── */}
//       {localTargetCountry && flagUrl && (
//         <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-1">

//           {/* Toggle button — always on top, always clickable */}
//           <button
//             onClick={() => setFlagVisible(v => !v)}
//             className="
//               flex items-center gap-1.5 px-4 py-1.5
//               bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
//               text-sm font-semibold rounded-full shadow-lg
//               border border-slate-200 dark:border-slate-700
//               hover:bg-slate-50 dark:hover:bg-slate-700
//               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
//               active:scale-95 transition-transform
//             "
//           >
//             {flagVisible
//               ? <><ChevronUp className="w-4 h-4" /> Hide flag</>
//               : <><ChevronDown className="w-4 h-4" /> Show flag</>
//             }
//           </button>

//           {/* Flag card — snappy fade in/out below the button */}
//           <AnimatePresence initial={false}>
//             {flagVisible && (
//               <motion.div
//                 key="flag-card"
//                 initial={{ opacity: 0, scale: 0.97 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.97 }}
//                 transition={{ duration: 0.12 }}
//               >
//                 <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border-4 border-blue-500">
//                   <div className="flex items-center gap-3 mb-4">
//                     <Flag className="w-6 h-6 text-blue-600" />
//                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">
//                       Which country is this?
//                     </h3>
//                   </div>
//                   <div className="relative w-64 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner">
//                     <img
//                       src={flagUrl}
//                       alt="Country flag"
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         e.currentTarget.src =
//                           'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect fill="%23ddd" width="320" height="240"/><text x="50%" y="50%" text-anchor="middle" fill="%23666" font-size="20">Flag not found</text></svg>';
//                       }}
//                     />
//                   </div>
//                   <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 text-center">
//                     Click the country on the map
//                   </p>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Normal controls — hidden in TV mode */}
//       {!config.isTV && (
//         <div className="absolute inset-0 z-10 pointer-events-none">
//           <div className="pointer-events-auto">
//             <GameControls
//               selectedCountryName={selectedCountryName}
//               onGuess={handleGuess}
//               onHint={() => {}}
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
//               hintsAvailable={false}
//               remainingHints={0}
//             />
//           </div>
//         </div>
//       )}

//       {/* TV / Classroom HUD */}
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
//           targetLabel="Selected country"
//           mode="flag-quiz"
//         />
//       )}

//       <Statistics
//         isOpen={showStats}
//         onClose={() => setShowStats(false)}
//         stats={{
//           totalGuesses,
//           correctGuesses: score,
//           wrongGuesses: totalGuesses - score,
//           hintsUsed: 0,
//           currentStreak,
//           bestStreak,
//           countriesFound: score,
//           totalCountries: countries.length,
//           accuracy: totalGuesses > 0 ? (score / totalGuesses) * 100 : 0,
//           averageHintsPerCountry: 0,
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










//newly added pass
// FlagQuizGame.tsx - Flag Quiz Mode: See flag, find country
// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { AnimatePresence, motion } from "motion/react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { Statistics } from "@/app/components/Statistics";
// import {
//   AchievementsList,
//   AchievementNotification,
//   defaultAchievements,
//   type Achievement,
// } from "@/app/components/Achievements";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { useDisplayMode } from "@/app/hooks/useDisplayMode";
// import { ClassroomHUD } from "@/app/components/ClassroomHUD";
// import { toast, Toaster } from "sonner";
// import { Loader2, Flag, ChevronUp, ChevronDown } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
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



// interface FlagQuizGameProps {
//   onBackToMenu: () => void;
// }

// // Maps normalized country names → ISO 3166-1 alpha-2 codes for flagcdn.com
// const COUNTRY_CODE_MAP: { [key: string]: string } = {
//   // A
//   "Afghanistan": "af",
//   "Albania": "al",
//   "Algeria": "dz",
//   "Angola": "ao",
//   "Argentina": "ar",
//   "Armenia": "am",
//   "Australia": "au",
//   "Austria": "at",
//   "Azerbaijan": "az",
//   // B
//   "Bahamas": "bs",
//   "Bahrain": "bh",
//   "Bangladesh": "bd",
//   "Barbados": "bb",
//   "Belarus": "by",
//   "Belgium": "be",
//   "Belize": "bz",
//   "Benin": "bj",
//   "Bhutan": "bt",
//   "Bolivia": "bo",
//   "Bosnia and Herzegovina": "ba",
//   "Botswana": "bw",
//   "Brazil": "br",
//   "Brunei": "bn",
//   "Bulgaria": "bg",
//   "Burkina Faso": "bf",
//   "Burundi": "bi",
//   // C
//   "Cambodia": "kh",
//   "Cameroon": "cm",
//   "Canada": "ca",
//   "Cabo Verde": "cv",
//   "Central African Republic": "cf",
//   "Chad": "td",
//   "Chile": "cl",
//   "China": "cn",
//   "Colombia": "co",
//   "Comoros": "km",
//   "Republic of the Congo": "cg",
//   "Democratic Republic of the Congo": "cd",
//   "Costa Rica": "cr",
//   "Croatia": "hr",
//   "Cuba": "cu",
//   "Cyprus": "cy",
//   "Czechia": "cz",
//   // D
//   "Denmark": "dk",
//   "Djibouti": "dj",
//   "Dominican Republic": "do",
//   // E
//   "Ecuador": "ec",
//   "Egypt": "eg",
//   "El Salvador": "sv",
//   "Equatorial Guinea": "gq",
//   "Eritrea": "er",
//   "Eswatini": "sz",
//   "Estonia": "ee",
//   "Ethiopia": "et",
//   // F
//   "Falkland Islands": "fk",
//   "Fiji": "fj",
//   "Finland": "fi",
//   "France": "fr",
//   // G
//   "Gabon": "ga",
//   "Gambia": "gm",
//   "Georgia": "ge",
//   "Germany": "de",
//   "Ghana": "gh",
//   "Greece": "gr",
//   "Greenland": "gl",
//   "Guatemala": "gt",
//   "Guinea": "gn",
//   "Guinea-Bissau": "gw",
//   "Guyana": "gy",
//   // H
//   "Haiti": "ht",
//   "Honduras": "hn",
//   "Hungary": "hu",
//   // I
//   "Iceland": "is",
//   "India": "in",
//   "Indonesia": "id",
//   "Iran": "ir",
//   "Iraq": "iq",
//   "Ireland": "ie",
//   "Israel": "il",
//   "Italy": "it",
//   "Ivory Coast": "ci",
//   // J
//   "Jamaica": "jm",
//   "Japan": "jp",
//   "Jordan": "jo",
//   // K
//   "Kazakhstan": "kz",
//   "Kenya": "ke",
//   "Kosovo": "xk",
//   "Kuwait": "kw",
//   "Kyrgyzstan": "kg",
//   // L
//   "Laos": "la",
//   "Latvia": "lv",
//   "Lebanon": "lb",
//   "Lesotho": "ls",
//   "Liberia": "lr",
//   "Libya": "ly",
//   "Liechtenstein": "li",
//   "Lithuania": "lt",
//   "Luxembourg": "lu",
//   // M
//   "Madagascar": "mg",
//   "Malawi": "mw",
//   "Malaysia": "my",
//   "Maldives": "mv",
//   "Mali": "ml",
//   "Malta": "mt",
//   "Marshall Islands": "mh",
//   "Mauritania": "mr",
//   "Mauritius": "mu",
//   "Mexico": "mx",
//   "Micronesia": "fm",
//   "Moldova": "md",
//   "Monaco": "mc",
//   "Mongolia": "mn",
//   "Montenegro": "me",
//   "Morocco": "ma",
//   "Mozambique": "mz",
//   "Myanmar": "mm",
//   // N
//   "Namibia": "na",
//   "Nauru": "nr",
//   "Nepal": "np",
//   "Netherlands": "nl",
//   "New Caledonia": "nc",
//   "New Zealand": "nz",
//   "Nicaragua": "ni",
//   "Niger": "ne",
//   "Nigeria": "ng",
//   "North Korea": "kp",
//   "North Macedonia": "mk",
//   "Northern Cyprus": "cy",
//   "Norway": "no",
//   // O
//   "Oman": "om",
//   // P
//   "Pakistan": "pk",
//   "Palau": "pw",
//   "Palestine": "ps",
//   "Panama": "pa",
//   "Papua New Guinea": "pg",
//   "Paraguay": "py",
//   "Peru": "pe",
//   "Philippines": "ph",
//   "Poland": "pl",
//   "Portugal": "pt",
//   // Q
//   "Qatar": "qa",
//   // R
//   "Romania": "ro",
//   "Russia": "ru",
//   "Rwanda": "rw",
//   // S
//   "Saudi Arabia": "sa",
//   "Senegal": "sn",
//   "Serbia": "rs",
//   "Seychelles": "sc",
//   "Sierra Leone": "sl",
//   "Slovakia": "sk",
//   "Slovenia": "si",
//   "Solomon Islands": "sb",
//   "Somalia": "so",
//   "Somaliland": "so",
//   "South Africa": "za",
//   "South Korea": "kr",
//   "South Sudan": "ss",
//   "Spain": "es",
//   "Sri Lanka": "lk",
//   "Sudan": "sd",
//   "Suriname": "sr",
//   "Sweden": "se",
//   "Switzerland": "ch",
//   "Syria": "sy",
//   // T
//   "Taiwan": "tw",
//   "Tajikistan": "tj",
//   "Tanzania": "tz",
//   "Thailand": "th",
//   "Timor-Leste": "tl",
//   "Togo": "tg",
//   "Tonga": "to",
//   "Trinidad and Tobago": "tt",
//   "Tunisia": "tn",
//   "Turkey": "tr",
//   "Turkmenistan": "tm",
//   "Tuvalu": "tv",
//   // U
//   "Uganda": "ug",
//   "Ukraine": "ua",
//   "United Arab Emirates": "ae",
//   "United Kingdom": "gb",
//   "United States of America": "us",
//   "Uruguay": "uy",
//   "Uzbekistan": "uz",
//   // V
//   "Vanuatu": "vu",
//   "Venezuela": "ve",
//   "Vietnam": "vn",
//   // W
//   "Western Sahara": "eh",
//   // Y
//   "Yemen": "ye",
//   // Z
//   "Zambia": "zm",
//   "Zimbabwe": "zw",
// };

// export function FlagQuizGame({ onBackToMenu }: FlagQuizGameProps) {
//   const { countries, loading } = useCountryData();
//   const { config, toggleTVMode } = useDisplayMode();

//   const [targetCountryName, setTargetCountryName] = useState<string | null>(null);
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [waitingForNextRound, setWaitingForNextRound] = useState(false);
//   const [flagUrl, setFlagUrl] = useState<string>("");

//   // Show/hide the flag card so the map stays fully visible when needed
//   const [flagVisible, setFlagVisible] = useState(true);

//   // Polish features
//   const [showStats, setShowStats] = useState(false);
//   const [showAchievements, setShowAchievements] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
//   const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
//   const [totalGuesses, setTotalGuesses] = useState(0);
//   const [currentStreak, setCurrentStreak] = useState(0);
//   const [bestStreak, setBestStreak] = useState(0);
  
//   const { state, setState, setTargetCountry: saveTargetCountry, resetState } = useGameState("flag-quiz" as any);
//   const { correctCountries, wrongCountries, score, targetCountry } = state;
//   const [localTargetCountry, setLocalTargetCountry] = useState<string | null>(targetCountry || null);

//   // Queue system state
//   const QUEUE_STORAGE_KEY = "passQueue_flag-quiz";
//   const [queueState, setQueueState] = useState<PassQueueState | null>(null);
//   const [isFeedbackLocked, setIsFeedbackLocked] = useState(false);
//   const [gameComplete, setGameComplete] = useState(false);
//   const [inputResetToken, setInputResetToken] = useState(0);
//   const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);
//   const remainingCountries = useMemo(() => {
//     return allCountryNames.filter(name => !correctCountries.includes(name));
//   }, [allCountryNames, correctCountries]);

//   const getCountryCode = (countryName: string): string => {
//     const code = COUNTRY_CODE_MAP[countryName];
//     if (!code) {
//       console.warn(`No flag code found for: "${countryName}" — add it to COUNTRY_CODE_MAP`);
//       return "xx";
//     }
//     return code;
//   };

//   const clearPendingTransition = () => {
//     if (transitionTimerRef.current) {
//       clearTimeout(transitionTimerRef.current);
//       transitionTimerRef.current = null;
//     }
//   };

//   const loadFlagRound = (countryName: string | null, clearLock = true) => {
//     setLocalTargetCountry(countryName);
//     saveTargetCountry(countryName);
//     setSelectedCountryName(null);
//     setFlagVisible(true);
//     setGameComplete(false);
//     if (clearLock) setIsFeedbackLocked(false);
//     setInputResetToken((t) => t + 1);

//     if (countryName) {
//       const code = getCountryCode(countryName);
//       setFlagUrl(`https://flagcdn.com/w320/${code}.png`);
//     } else {
//       setFlagUrl("");
//     }
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
//       loadFlagRound(initialTarget, true);
//     } else {
//       setLocalTargetCountry(null);
//       saveTargetCountry(null);
//       setSelectedCountryName(null);
//       setFlagUrl("");
//     }
//   };

//   // Check achievements
//   const checkAchievements = (newScore: number, newStreak: number) => {
//     let updatedAchievements = [...achievements];
//     let newlyUnlocked: Achievement | null = null;

//     if (newScore >= 1 && !achievements.find(a => a.id === "first_country")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "first_country");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
//       newlyUnlocked = updatedAchievements[idx];
//     }
//     if (newScore >= 5 && !achievements.find(a => a.id === "five_countries")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "five_countries");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === "five_countries");
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 5) };
//     }
//     if (newScore >= 10 && !achievements.find(a => a.id === "ten_countries")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "ten_countries");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === "ten_countries");
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 10) };
//     }
//     if (newScore >= 50 && !achievements.find(a => a.id === "fifty_countries")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "fifty_countries");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === "fifty_countries");
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 50) };
//     }
//     if (newStreak >= 5 && !achievements.find(a => a.id === "streak_5")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "streak_5");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === "streak_5");
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 5) };
//     }
//     if (newStreak >= 10 && !achievements.find(a => a.id === "streak_10")?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === "streak_10");
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === "streak_10");
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 10) };
//     }

//     if (newlyUnlocked) {
//       if (soundEnabled) soundEffects.playAchievement();
//       setUnlockedAchievement(newlyUnlocked);
//     }
//     setAchievements(updatedAchievements);
//   };

//   // Initialization effect
//   useEffect(() => {
//     if (countries.length === 0) return;
//     if (queueState) return;

//     bootstrapQueue();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [countries, allCountryNames]);

//   // Persistence effect
//   useEffect(() => {
//     if (queueState) {
//       saveQueueState(QUEUE_STORAGE_KEY, queueState);
//     }
//   }, [queueState]);

//   // Cleanup effect
//   useEffect(() => {
//     return () => clearPendingTransition();
//   }, []);

//   useEffect(() => {
//     if (countries.length === 0 || waitingForNextRound) return;
//     if (targetCountry && !correctCountries.includes(targetCountry)) {
//       setLocalTargetCountry(targetCountry);
//       const code = getCountryCode(targetCountry);
//       setFlagUrl(`https://flagcdn.com/w320/${code}.png`);
//     } else if (!localTargetCountry) {
//       // Queue handles the next country, no need for random startNewRound
//     }
//   }, [countries, targetCountry]);

//   const handleCountryClick = (geo: any) => {
//     const name = geo.properties.name || geo.name;
//     if (correctCountries.includes(name)) {
//       toast.info(`You already found ${name}!`);
//       return;
//     }
//     if (soundEnabled) soundEffects.playClick();
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName || !localTargetCountry || !queueState || isFeedbackLocked || gameComplete) {
//       return;
//     }

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

//       toast.error(`Wrong! That's ${selectedCountryName}, not the flag we're looking for.`, {
//         description: "Look at the flag carefully and try again!",
//         duration: 3000,
//       });

//       setIsFeedbackLocked(true);
//       setCurrentStreak(0);

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

//     // Correct
//     if (soundEnabled) soundEffects.playCorrect();

//     toast.success(`🎉 Correct! That's the flag of ${localTargetCountry}!`, {
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
//     setSelectedCountryName(null);
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

//       loadFlagRound(nextCountry.name);
//     }, 2000);
//   };

//   const handlePass = () => {
//     if (!queueState || !localTargetCountry || isFeedbackLocked || gameComplete) return;

//     clearPendingTransition();

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
//       const nextCountry = result.queueState.queue[0] ?? null;

//       if (result.passesRemaining === 2) {
//         toast.info("⏩ Moved to end of queue. 2 passes remaining.", { duration: 2500 });
//       } else if (result.passesRemaining === 1) {
//         toast.info("⏩ Moved to end of queue. 1 pass remaining.", { duration: 2500 });
//       } else {
//         toast.info("⏩ Moved to end of queue. Passes remaining.", { duration: 2500 });
//       }

//       if (nextCountry) {
//         loadFlagRound(nextCountry.name);
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

//     setIsFeedbackLocked(true);

//     transitionTimerRef.current = setTimeout(() => {
//       setIsFeedbackLocked(false);
//       const nextCountry = result.queueState.queue[0] ?? null;

//       if (!nextCountry) {
//         setGameComplete(true);
//         toast.success("🎉 Game Complete! Great job!", { duration: 2500 });
//         return;
//       }

//       loadFlagRound(nextCountry.name);
//     }, 1500);
//   };

//   const handleReveal = () => {
//     if (!queueState || !localTargetCountry || isFeedbackLocked || gameComplete) return;

//     clearPendingTransition();

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

//     setIsFeedbackLocked(true);

//     transitionTimerRef.current = setTimeout(() => {
//       setIsFeedbackLocked(false);
//       const nextCountry = result.queueState.queue[0] ?? null;

//       if (!nextCountry) {
//         setGameComplete(true);
//         toast.success("🎉 Game Complete! Great job!", { duration: 2500 });
//         return;
//       }

//       loadFlagRound(nextCountry.name);
//     }, 1500);
//   };

//   const handleRestart = () => {
//     if (window.confirm("Are you sure you want to restart this game? All progress will be lost.")) {
//       clearPendingTransition();
//       clearQueueState(QUEUE_STORAGE_KEY);

//       resetState();
//       setLocalTargetCountry(null);
//       setSelectedCountryName(null);
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

//       {/* ── Flag card + hide/show toggle ─────────────────────────────────────
//           Toggle button is always at a fixed position (top of the stack).
//           The flag card appears below it, sliding in/out instantly.
//       ──────────────────────────────────────────────────────────────────────── */}
//       {localTargetCountry && flagUrl && (
//         <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-1">

//           {/* Toggle button — always on top, always clickable */}
//           <button
//             onClick={() => setFlagVisible(v => !v)}
//             className="
//               flex items-center gap-1.5 px-4 py-1.5
//               bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
//               text-sm font-semibold rounded-full shadow-lg
//               border border-slate-200 dark:border-slate-700
//               hover:bg-slate-50 dark:hover:bg-slate-700
//               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
//               active:scale-95 transition-transform
//             "
//           >
//             {flagVisible
//               ? <><ChevronUp className="w-4 h-4" /> Hide flag</>
//               : <><ChevronDown className="w-4 h-4" /> Show flag</>
//             }
//           </button>

//           {/* Flag card — snappy fade in/out below the button */}
//           <AnimatePresence initial={false}>
//             {flagVisible && (
//               <motion.div
//                 key="flag-card"
//                 initial={{ opacity: 0, scale: 0.97 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.97 }}
//                 transition={{ duration: 0.12 }}
//               >
//                 <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border-4 border-blue-500">
//                   <div className="flex items-center gap-3 mb-4">
//                     <Flag className="w-6 h-6 text-blue-600" />
//                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">
//                       Which country is this?
//                     </h3>
//                   </div>
//                   <div className="relative w-64 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner">
//                     <img
//                       src={flagUrl}
//                       alt="Country flag"
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         e.currentTarget.src =
//                           'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect fill="%23ddd" width="320" height="240"/><text x="50%" y="50%" text-anchor="middle" fill="%23666" font-size="20">Flag not found</text></svg>';
//                       }}
//                     />
//                   </div>
//                   <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 text-center">
//                     Click the country on the map
//                   </p>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Normal controls — hidden in TV mode */}
//       {!config.isTV && (
//         <div className="absolute inset-0 z-10 pointer-events-none">
//           <div className="pointer-events-auto">
//             <GameControls
//               selectedCountryName={selectedCountryName}
//               onGuess={handleGuess}
//               onHint={() => {}}
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
//               hintsAvailable={false}
//               remainingHints={0}
//               queueCount={queueCount}
//               passesLeft={passesLeft}
//               inputResetToken={inputResetToken}
//             />
//           </div>
//         </div>
//       )}

//       {/* TV / Classroom HUD */}
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
//           targetLabel="Selected country"
//           mode="flag-quiz"
//         />
//       )}

//       <Statistics
//         isOpen={showStats}
//         onClose={() => setShowStats(false)}
//         stats={{
//           totalGuesses,
//           correctGuesses: score,
//           wrongGuesses: totalGuesses - score,
//           hintsUsed: 0,
//           currentStreak,
//           bestStreak,
//           countriesFound: score,
//           totalCountries: countries.length,
//           accuracy: totalGuesses > 0 ? (score / totalGuesses) * 100 : 0,
//           averageHintsPerCountry: 0,
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


//NEWEST VERSION OF FLAG QUIZ(Burda da text input la click submit butonu geliyor)
// FlagQuizGame.tsx - Flag Quiz Mode: See flag, find country
// FlagQuizGame.tsx - Flag Quiz Mode: See flag, find country
import React, { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import WorldMap from "@/app/components/WorldMap";
import { GameControls } from "@/app/components/GameControls";
import { Statistics } from "@/app/components/Statistics";
import {
  AchievementsList,
  AchievementNotification,
  defaultAchievements,
  type Achievement,
} from "@/app/components/Achievements";
import { useCountryData } from "@/app/hooks/useCountryData";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";
import { ClassroomHUD } from "@/app/components/ClassroomHUD";
import { toast, Toaster } from "sonner";
import { Loader2, Flag, ChevronUp, ChevronDown } from "lucide-react";
import { useGameState } from "@/app/hooks/useGameState";
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
import posthog from "posthog-js";



interface FlagQuizGameProps {
  onBackToMenu: () => void;
}

// Maps normalized country names → ISO 3166-1 alpha-2 codes for flagcdn.com
const COUNTRY_CODE_MAP: { [key: string]: string } = {
  // A
  "Afghanistan": "af",
  "Albania": "al",
  "Algeria": "dz",
  "Angola": "ao",
  "Argentina": "ar",
  "Armenia": "am",
  "Australia": "au",
  "Austria": "at",
  "Azerbaijan": "az",
  // B
  "Bahamas": "bs",
  "Bahrain": "bh",
  "Bangladesh": "bd",
  "Barbados": "bb",
  "Belarus": "by",
  "Belgium": "be",
  "Belize": "bz",
  "Benin": "bj",
  "Bhutan": "bt",
  "Bolivia": "bo",
  "Bosnia and Herzegovina": "ba",
  "Botswana": "bw",
  "Brazil": "br",
  "Brunei": "bn",
  "Bulgaria": "bg",
  "Burkina Faso": "bf",
  "Burundi": "bi",
  // C
  "Cambodia": "kh",
  "Cameroon": "cm",
  "Canada": "ca",
  "Cabo Verde": "cv",
  "Central African Republic": "cf",
  "Chad": "td",
  "Chile": "cl",
  "China": "cn",
  "Colombia": "co",
  "Comoros": "km",
  "Republic of the Congo": "cg",
  "Democratic Republic of the Congo": "cd",
  "Costa Rica": "cr",
  "Croatia": "hr",
  "Cuba": "cu",
  "Cyprus": "cy",
  "Czechia": "cz",
  // D
  "Denmark": "dk",
  "Djibouti": "dj",
  "Dominican Republic": "do",
  // E
  "Ecuador": "ec",
  "Egypt": "eg",
  "El Salvador": "sv",
  "Equatorial Guinea": "gq",
  "Eritrea": "er",
  "Eswatini": "sz",
  "Estonia": "ee",
  "Ethiopia": "et",
  // F
  "Falkland Islands": "fk",
  "Fiji": "fj",
  "Finland": "fi",
  "France": "fr",
  // G
  "Gabon": "ga",
  "Gambia": "gm",
  "Georgia": "ge",
  "Germany": "de",
  "Ghana": "gh",
  "Greece": "gr",
  "Greenland": "gl",
  "Guatemala": "gt",
  "Guinea": "gn",
  "Guinea-Bissau": "gw",
  "Guyana": "gy",
  // H
  "Haiti": "ht",
  "Honduras": "hn",
  "Hungary": "hu",
  // I
  "Iceland": "is",
  "India": "in",
  "Indonesia": "id",
  "Iran": "ir",
  "Iraq": "iq",
  "Ireland": "ie",
  "Israel": "il",
  "Italy": "it",
  "Ivory Coast": "ci",
  // J
  "Jamaica": "jm",
  "Japan": "jp",
  "Jordan": "jo",
  // K
  "Kazakhstan": "kz",
  "Kenya": "ke",
  "Kosovo": "xk",
  "Kuwait": "kw",
  "Kyrgyzstan": "kg",
  // L
  "Laos": "la",
  "Latvia": "lv",
  "Lebanon": "lb",
  "Lesotho": "ls",
  "Liberia": "lr",
  "Libya": "ly",
  "Liechtenstein": "li",
  "Lithuania": "lt",
  "Luxembourg": "lu",
  // M
  "Madagascar": "mg",
  "Malawi": "mw",
  "Malaysia": "my",
  "Maldives": "mv",
  "Mali": "ml",
  "Malta": "mt",
  "Marshall Islands": "mh",
  "Mauritania": "mr",
  "Mauritius": "mu",
  "Mexico": "mx",
  "Micronesia": "fm",
  "Moldova": "md",
  "Monaco": "mc",
  "Mongolia": "mn",
  "Montenegro": "me",
  "Morocco": "ma",
  "Mozambique": "mz",
  "Myanmar": "mm",
  // N
  "Namibia": "na",
  "Nauru": "nr",
  "Nepal": "np",
  "Netherlands": "nl",
  "New Caledonia": "nc",
  "New Zealand": "nz",
  "Nicaragua": "ni",
  "Niger": "ne",
  "Nigeria": "ng",
  "North Korea": "kp",
  "North Macedonia": "mk",
  "Northern Cyprus": "cy",
  "Norway": "no",
  // O
  "Oman": "om",
  // P
  "Pakistan": "pk",
  "Palau": "pw",
  "Palestine": "ps",
  "Panama": "pa",
  "Papua New Guinea": "pg",
  "Paraguay": "py",
  "Peru": "pe",
  "Philippines": "ph",
  "Poland": "pl",
  "Portugal": "pt",
  // Q
  "Qatar": "qa",
  // R
  "Romania": "ro",
  "Russia": "ru",
  "Rwanda": "rw",
  // S
  "Saudi Arabia": "sa",
  "Senegal": "sn",
  "Serbia": "rs",
  "Seychelles": "sc",
  "Sierra Leone": "sl",
  "Slovakia": "sk",
  "Slovenia": "si",
  "Solomon Islands": "sb",
  "Somalia": "so",
  "Somaliland": "so",
  "South Africa": "za",
  "South Korea": "kr",
  "South Sudan": "ss",
  "Spain": "es",
  "Sri Lanka": "lk",
  "Sudan": "sd",
  "Suriname": "sr",
  "Sweden": "se",
  "Switzerland": "ch",
  "Syria": "sy",
  // T
  "Taiwan": "tw",
  "Tajikistan": "tj",
  "Tanzania": "tz",
  "Thailand": "th",
  "Timor-Leste": "tl",
  "Togo": "tg",
  "Tonga": "to",
  "Trinidad and Tobago": "tt",
  "Tunisia": "tn",
  "Turkey": "tr",
  "Turkmenistan": "tm",
  "Tuvalu": "tv",
  // U
  "Uganda": "ug",
  "Ukraine": "ua",
  "United Arab Emirates": "ae",
  "United Kingdom": "gb",
  "United States of America": "us",
  "Uruguay": "uy",
  "Uzbekistan": "uz",
  // V
  "Vanuatu": "vu",
  "Venezuela": "ve",
  "Vietnam": "vn",
  // W
  "Western Sahara": "eh",
  // Y
  "Yemen": "ye",
  // Z
  "Zambia": "zm",
  "Zimbabwe": "zw",
};

export function FlagQuizGame({ onBackToMenu }: FlagQuizGameProps) {
  const { countries, loading } = useCountryData();
  const { config, toggleTVMode } = useDisplayMode();

  const [targetCountryName, setTargetCountryName] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [waitingForNextRound, setWaitingForNextRound] = useState(false);
  const [flagUrl, setFlagUrl] = useState<string>("");

  // Show/hide the flag card so the map stays fully visible when needed
  const [flagVisible, setFlagVisible] = useState(true);

  // Polish features
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  
  const { state, setState, setTargetCountry: saveTargetCountry, resetState } = useGameState("flag-quiz" as any);
  const { correctCountries, wrongCountries, score, targetCountry } = state;
  const [localTargetCountry, setLocalTargetCountry] = useState<string | null>(targetCountry || null);

  // Queue system state
  const QUEUE_STORAGE_KEY = "passQueue_flag-quiz";
  const [queueState, setQueueState] = useState<PassQueueState | null>(null);
  const [isFeedbackLocked, setIsFeedbackLocked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [inputResetToken, setInputResetToken] = useState(0);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);
  const remainingCountries = useMemo(() => {
    return allCountryNames.filter(name => !correctCountries.includes(name));
  }, [allCountryNames, correctCountries]);

  const getCountryCode = (countryName: string): string => {
    const code = COUNTRY_CODE_MAP[countryName];
    if (!code) {
      console.warn(`No flag code found for: "${countryName}" — add it to COUNTRY_CODE_MAP`);
      return "xx";
    }
    return code;
  };

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

  const loadFlagRound = (countryName: string | null, clearLock = true) => {
    clearWrongCountries(); // clear red countries for the new round

    setLocalTargetCountry(countryName);
    saveTargetCountry(countryName);
    setSelectedCountryName(null);
    setFlagVisible(true);
    setGameComplete(false);
    if (clearLock) setIsFeedbackLocked(false);
    setInputResetToken((t) => t + 1);

    if (countryName) {
      const code = getCountryCode(countryName);
      setFlagUrl(`https://flagcdn.com/w320/${code}.png`);
    } else {
      setFlagUrl("");
    }
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
      loadFlagRound(initialTarget, true);
    } else {
      setLocalTargetCountry(null);
      saveTargetCountry(null);
      setSelectedCountryName(null);
      setFlagUrl("");
    }
  };

  // Check achievements
  const checkAchievements = (newScore: number, newStreak: number) => {
    let updatedAchievements = [...achievements];
    let newlyUnlocked: Achievement | null = null;

    if (newScore >= 1 && !achievements.find(a => a.id === "first_country")?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === "first_country");
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
      newlyUnlocked = updatedAchievements[idx];
    }
    if (newScore >= 5 && !achievements.find(a => a.id === "five_countries")?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === "five_countries");
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
      newlyUnlocked = updatedAchievements[idx];
    } else {
      const idx = updatedAchievements.findIndex(a => a.id === "five_countries");
      if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 5) };
    }
    if (newScore >= 10 && !achievements.find(a => a.id === "ten_countries")?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === "ten_countries");
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
      newlyUnlocked = updatedAchievements[idx];
    } else {
      const idx = updatedAchievements.findIndex(a => a.id === "ten_countries");
      if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 10) };
    }
    if (newScore >= 50 && !achievements.find(a => a.id === "fifty_countries")?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === "fifty_countries");
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
      newlyUnlocked = updatedAchievements[idx];
    } else {
      const idx = updatedAchievements.findIndex(a => a.id === "fifty_countries");
      if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 50) };
    }
    if (newStreak >= 5 && !achievements.find(a => a.id === "streak_5")?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === "streak_5");
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
      newlyUnlocked = updatedAchievements[idx];
    } else {
      const idx = updatedAchievements.findIndex(a => a.id === "streak_5");
      if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 5) };
    }
    if (newStreak >= 10 && !achievements.find(a => a.id === "streak_10")?.unlocked) {
      const idx = updatedAchievements.findIndex(a => a.id === "streak_10");
      updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
      newlyUnlocked = updatedAchievements[idx];
    } else {
      const idx = updatedAchievements.findIndex(a => a.id === "streak_10");
      if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 10) };
    }

    if (newlyUnlocked) {
      if (soundEnabled) soundEffects.playAchievement();
      setUnlockedAchievement(newlyUnlocked);
    }
    setAchievements(updatedAchievements);
  };

  useEffect(() => {
  posthog.capture("game_start", { mode: "flag-quiz" });
}, []);

  // Initialization effect
  useEffect(() => {
    if (countries.length === 0) return;
    if (queueState) return;

    bootstrapQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, allCountryNames]);

  // Persistence effect
  useEffect(() => {
    if (queueState) {
      saveQueueState(QUEUE_STORAGE_KEY, queueState);
    }
  }, [queueState]);

  // Cleanup effect
  useEffect(() => {
    return () => clearPendingTransition();
  }, []);

  useEffect(() => {
    if (countries.length === 0 || waitingForNextRound) return;
    if (targetCountry && !correctCountries.includes(targetCountry)) {
      setLocalTargetCountry(targetCountry);
      const code = getCountryCode(targetCountry);
      setFlagUrl(`https://flagcdn.com/w320/${code}.png`);
    } else if (!localTargetCountry) {
      // Queue handles the next country, no need for random startNewRound
    }
  }, [countries, targetCountry]);

  const handleCountryClick = (geo: any) => {
    if (waitingForNextRound || isFeedbackLocked || gameComplete) return;

    const name = geo.properties?.name || geo.name;
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

    const normalizedSelected = selectedCountryName.toLowerCase().trim();
    const normalizedTarget = localTargetCountry.toLowerCase().trim();

    setTotalGuesses((prev) => prev + 1);

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
    setSelectedCountryName(null);
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

      loadFlagRound(nextCountry.name);
    }, 2000);
  };

  const handlePass = () => {
    if (!queueState || !localTargetCountry || isFeedbackLocked || gameComplete) return;

    setSelectedCountryName(null);
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
        toast.info("⏩ Moved to end of queue. 2 passes remaining.", { duration: 2500 });
      } else if (result.passesRemaining === 1) {
        toast.info("⏩ Moved to end of queue. 1 pass remaining.", { duration: 2500 });
      } else {
        toast.info("⏩ Moved to end of queue. Passes remaining.", { duration: 2500 });
      }

      const nextCountry = result.queueState.queue[0] ?? null;
      if (nextCountry) loadFlagRound(nextCountry.name);
      return;
    }

    toast.error(`❌ Country revealed: ${currentQueueCountry.name}`, { duration: 2500 });

    if (!wrongCountries.includes(currentQueueCountry.name)) {
      setState((prev) => ({
        ...prev,
        wrongCountries: [...prev.wrongCountries, currentQueueCountry.name],
      }));
    }

    setIsFeedbackLocked(true);
    setTimeout(() => {
      setIsFeedbackLocked(false);
      const nextCountry = result.queueState.queue[0] ?? null;
      if (!nextCountry) {
        setGameComplete(true);
        toast.success("🎉 Game Complete! Great job!", { duration: 2500 });
        return;
      }
      loadFlagRound(nextCountry.name);
    }, 1500);
  };

  const handleReveal = () => {
    if (!queueState || !localTargetCountry || isFeedbackLocked || gameComplete) return;

    setSelectedCountryName(null);
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

    setIsFeedbackLocked(true);
    setTimeout(() => {
      setIsFeedbackLocked(false);
      const nextCountry = result.queueState.queue[0] ?? null;
      if (!nextCountry) {
        setGameComplete(true);
        toast.success("🎉 Game Complete! Great job!", { duration: 2500 });
        return;
      }
      loadFlagRound(nextCountry.name);
    }, 1500);
  };

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart this game? All progress will be lost.")) {
      clearPendingTransition();
      clearQueueState(QUEUE_STORAGE_KEY);

      resetState();
      setLocalTargetCountry(null);
      setSelectedCountryName(null);
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

      {/* ── Flag card + hide/show toggle ─────────────────────────────────────
          Toggle button is always at a fixed position (top of the stack).
          The flag card appears below it, sliding in/out instantly.
      ──────────────────────────────────────────────────────────────────────── */}
      {localTargetCountry && flagUrl && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-1">

          {/* Toggle button — always on top, always clickable */}
          <button
            onClick={() => setFlagVisible(v => !v)}
            className="
              flex items-center gap-1.5 px-4 py-1.5
              bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
              text-sm font-semibold rounded-full shadow-lg
              border border-slate-200 dark:border-slate-700
              hover:bg-slate-50 dark:hover:bg-slate-700
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              active:scale-95 transition-transform
            "
          >
            {flagVisible
              ? <><ChevronUp className="w-4 h-4" /> Hide flag</>
              : <><ChevronDown className="w-4 h-4" /> Show flag</>
            }
          </button>

          {/* Flag card — snappy fade in/out below the button */}
          <AnimatePresence initial={false}>
            {flagVisible && (
              <motion.div
                key="flag-card"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.12 }}
              >
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border-4 border-blue-500">
                  <div className="flex items-center gap-3 mb-4">
                    <Flag className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Which country is this?
                    </h3>
                  </div>
                  <div className="relative w-64 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner">
                    <img
                      src={flagUrl}
                      alt="Country flag"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect fill="%23ddd" width="320" height="240"/><text x="50%" y="50%" text-anchor="middle" fill="%23666" font-size="20">Flag not found</text></svg>';
                      }}
                    />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 text-center">
                    Click the country on the map
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Normal controls — hidden in TV mode */}
      {!config.isTV && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <GameControls
              selectedCountryName={selectedCountryName}
              onGuess={() => {}}
              onConfirm={handleConfirm}
              confirmDisabled={!selectedCountryName || isFeedbackLocked || waitingForNextRound || gameComplete}
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
              hintsAvailable={false}
              remainingHints={0}
              queueCount={queueCount}
              passesLeft={passesLeft}
              inputResetToken={inputResetToken}
            />
          </div>
        </div>
      )}

      {/* TV / Classroom HUD */}
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
          targetLabel="Selected country"
          mode="flag-quiz"
        />
      )}

      <Statistics
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={{
          totalGuesses,
          correctGuesses: score,
          wrongGuesses: totalGuesses - score,
          hintsUsed: 0,
          currentStreak,
          bestStreak,
          countriesFound: score,
          totalCountries: countries.length,
          accuracy: totalGuesses > 0 ? (score / totalGuesses) * 100 : 0,
          averageHintsPerCountry: 0,
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