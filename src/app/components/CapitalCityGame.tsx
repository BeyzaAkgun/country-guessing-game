// // CapitalCityGame.tsx - Capital City Mode: See capital city name, find the country on the map
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
// import { toast, Toaster } from "sonner";
// import { Loader2, Building2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { soundEffects } from "@/app/utils/soundEffects";

// interface CapitalCityGameProps {
//   onBackToMenu: () => void;
// }

// // Maps country name → capital city
// // Covers all countries available in the world-atlas dataset
// const COUNTRY_CAPITALS: { [key: string]: string } = {
//   "Afghanistan": "Kabul",
//   "Albania": "Tirana",
//   "Algeria": "Algiers",
//   "Angola": "Luanda",
//   "Argentina": "Buenos Aires",
//   "Armenia": "Yerevan",
//   "Australia": "Canberra",
//   "Austria": "Vienna",
//   "Azerbaijan": "Baku",
//   "Bahrain": "Manama",
//   "Bangladesh": "Dhaka",
//   "Belarus": "Minsk",
//   "Belgium": "Brussels",
//   "Belize": "Belmopan",
//   "Benin": "Porto-Novo",
//   "Bhutan": "Thimphu",
//   "Bolivia": "Sucre",
//   "Bosnia and Herzegovina": "Sarajevo",
//   "Botswana": "Gaborone",
//   "Brazil": "Brasília",
//   "Brunei": "Bandar Seri Begawan",
//   "Bulgaria": "Sofia",
//   "Burkina Faso": "Ouagadougou",
//   "Burundi": "Gitega",
//   "Cambodia": "Phnom Penh",
//   "Cameroon": "Yaoundé",
//   "Canada": "Ottawa",
//   "Central African Republic": "Bangui",
//   "Chad": "N'Djamena",
//   "Chile": "Santiago",
//   "China": "Beijing",
//   "Colombia": "Bogotá",
//   "Comoros": "Moroni",
//   "Republic of the Congo": "Brazzaville",
//   "Democratic Republic of the Congo": "Kinshasa",
//   "Costa Rica": "San José",
//   "Croatia": "Zagreb",
//   "Cuba": "Havana",
//   "Cyprus": "Nicosia",
//   "Czechia": "Prague",
//   "Denmark": "Copenhagen",
//   "Djibouti": "Djibouti City",
//   "Dominican Republic": "Santo Domingo",
//   "Ecuador": "Quito",
//   "Egypt": "Cairo",
//   "El Salvador": "San Salvador",
//   "Equatorial Guinea": "Malabo",
//   "Eritrea": "Asmara",
//   "Eswatini": "Mbabane",
//   "Estonia": "Tallinn",
//   "Ethiopia": "Addis Ababa",
//   "Falkland Islands": "Stanley",
//   "Fiji": "Suva",
//   "Finland": "Helsinki",
//   "France": "Paris",
//   "Gabon": "Libreville",
//   "Gambia": "Banjul",
//   "Georgia": "Tbilisi",
//   "Germany": "Berlin",
//   "Ghana": "Accra",
//   "Greece": "Athens",
//   "Greenland": "Nuuk",
//   "Guatemala": "Guatemala City",
//   "Guinea": "Conakry",
//   "Guinea-Bissau": "Bissau",
//   "Guyana": "Georgetown",
//   "Haiti": "Port-au-Prince",
//   "Honduras": "Tegucigalpa",
//   "Hungary": "Budapest",
//   "Iceland": "Reykjavík",
//   "India": "New Delhi",
//   "Indonesia": "Jakarta",
//   "Iran": "Tehran",
//   "Iraq": "Baghdad",
//   "Ireland": "Dublin",
//   "Israel": "Jerusalem",
//   "Italy": "Rome",
//   "Ivory Coast": "Yamoussoukro",
//   "Jamaica": "Kingston",
//   "Japan": "Tokyo",
//   "Jordan": "Amman",
//   "Kazakhstan": "Astana",
//   "Kenya": "Nairobi",
//   "Kosovo": "Pristina",
//   "Kuwait": "Kuwait City",
//   "Kyrgyzstan": "Bishkek",
//   "Laos": "Vientiane",
//   "Latvia": "Riga",
//   "Lebanon": "Beirut",
//   "Lesotho": "Maseru",
//   "Liberia": "Monrovia",
//   "Libya": "Tripoli",
//   "Lithuania": "Vilnius",
//   "Luxembourg": "Luxembourg City",
//   "Madagascar": "Antananarivo",
//   "Malawi": "Lilongwe",
//   "Malaysia": "Kuala Lumpur",
//   "Maldives": "Malé",
//   "Mali": "Bamako",
//   "Malta": "Valletta",
//   "Mauritania": "Nouakchott",
//   "Mauritius": "Port Louis",
//   "Mexico": "Mexico City",
//   "Moldova": "Chișinău",
//   "Mongolia": "Ulaanbaatar",
//   "Montenegro": "Podgorica",
//   "Morocco": "Rabat",
//   "Mozambique": "Maputo",
//   "Myanmar": "Naypyidaw",
//   "Namibia": "Windhoek",
//   "Nepal": "Kathmandu",
//   "Netherlands": "Amsterdam",
//   "New Zealand": "Wellington",
//   "Nicaragua": "Managua",
//   "Niger": "Niamey",
//   "Nigeria": "Abuja",
//   "North Korea": "Pyongyang",
//   "North Macedonia": "Skopje",
//   "Norway": "Oslo",
//   "Oman": "Muscat",
//   "Pakistan": "Islamabad",
//   "Palestine": "Ramallah",
//   "Panama": "Panama City",
//   "Papua New Guinea": "Port Moresby",
//   "Paraguay": "Asunción",
//   "Peru": "Lima",
//   "Philippines": "Manila",
//   "Poland": "Warsaw",
//   "Portugal": "Lisbon",
//   "Qatar": "Doha",
//   "Romania": "Bucharest",
//   "Russia": "Moscow",
//   "Rwanda": "Kigali",
//   "Saudi Arabia": "Riyadh",
//   "Senegal": "Dakar",
//   "Serbia": "Belgrade",
//   "Sierra Leone": "Freetown",
//   "Slovakia": "Bratislava",
//   "Slovenia": "Ljubljana",
//   "Solomon Islands": "Honiara",
//   "Somalia": "Mogadishu",
//   "South Africa": "Pretoria",
//   "South Korea": "Seoul",
//   "South Sudan": "Juba",
//   "Spain": "Madrid",
//   "Sri Lanka": "Sri Jayawardenepura Kotte",
//   "Sudan": "Khartoum",
//   "Suriname": "Paramaribo",
//   "Sweden": "Stockholm",
//   "Switzerland": "Bern",
//   "Syria": "Damascus",
//   "Taiwan": "Taipei",
//   "Tajikistan": "Dushanbe",
//   "Tanzania": "Dodoma",
//   "Thailand": "Bangkok",
//   "Timor-Leste": "Dili",
//   "Togo": "Lomé",
//   "Trinidad and Tobago": "Port of Spain",
//   "Tunisia": "Tunis",
//   "Turkey": "Ankara",
//   "Turkmenistan": "Ashgabat",
//   "Uganda": "Kampala",
//   "Ukraine": "Kyiv",
//   "United Arab Emirates": "Abu Dhabi",
//   "United Kingdom": "London",
//   "United States of America": "Washington, D.C.",
//   "Uruguay": "Montevideo",
//   "Uzbekistan": "Tashkent",
//   "Venezuela": "Caracas",
//   "Vietnam": "Hanoi",
//   "Western Sahara": "El Aaiún",
//   "Yemen": "Sana'a",
//   "Zambia": "Lusaka",
//   "Zimbabwe": "Harare",
//   "Cabo Verde": "Praia",
//   "New Caledonia": "Nouméa",
//   "Somaliland": "Hargeisa",
//   "Northern Cyprus": "Nicosia",
// };

// export function CapitalCityGame({ onBackToMenu }: CapitalCityGameProps) {
//   const { countries, loading } = useCountryData();
//   const [targetCountryName, setTargetCountryName] = useState<string | null>(null);
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [currentCapital, setCurrentCapital] = useState<string>("");
//   const [waitingForNextRound, setWaitingForNextRound] = useState(false);
//   const [showAnswer, setShowAnswer] = useState(false);

//   // Polish features
//   const [showStats, setShowStats] = useState(false);
//   const [showAchievements, setShowAchievements] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
//   const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
//   const [totalGuesses, setTotalGuesses] = useState(0);
//   const [currentStreak, setCurrentStreak] = useState(0);
//   const [bestStreak, setBestStreak] = useState(0);

//   const { state, setState, setTargetCountry: saveTargetCountry, resetState } = useGameState("hint-based");
//   const { correctCountries, wrongCountries, score, targetCountry } = state;
//   const [localTargetCountry, setLocalTargetCountry] = useState<string | null>(targetCountry || null);

//   const allCountryNames = useMemo(() => countries.map((c) => c.properties.name), [countries]);

//   // Only include countries that have a capital defined
//   const eligibleCountries = useMemo(() => {
//     return allCountryNames.filter((name) => !!COUNTRY_CAPITALS[name]);
//   }, [allCountryNames]);

//   const remainingCountries = useMemo(() => {
//     return eligibleCountries.filter((name) => !correctCountries.includes(name));
//   }, [eligibleCountries, correctCountries]);

//   // Check achievements
//   const checkAchievements = (newScore: number, newStreak: number) => {
//     let updatedAchievements = [...achievements];
//     let newlyUnlocked: Achievement | null = null;

//     const milestones = [
//       { id: "first_country", threshold: 1, total: 1 },
//       { id: "five_countries", threshold: 5, total: 5 },
//       { id: "ten_countries", threshold: 10, total: 10 },
//       { id: "fifty_countries", threshold: 50, total: 50 },
//     ];

//     milestones.forEach(({ id, threshold, total }) => {
//       const idx = updatedAchievements.findIndex((a) => a.id === id);
//       if (idx === -1) return;
//       if (!updatedAchievements[idx].unlocked && newScore >= threshold) {
//         updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//         newlyUnlocked = updatedAchievements[idx];
//       } else {
//         updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, total) };
//       }
//     });

//     const streakMilestones = [
//       { id: "streak_5", threshold: 5 },
//       { id: "streak_10", threshold: 10 },
//     ];

//     streakMilestones.forEach(({ id, threshold }) => {
//       const idx = updatedAchievements.findIndex((a) => a.id === id);
//       if (idx === -1) return;
//       if (!updatedAchievements[idx].unlocked && newStreak >= threshold) {
//         updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//         newlyUnlocked = updatedAchievements[idx];
//       } else {
//         updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, threshold) };
//       }
//     });

//     if (newlyUnlocked) {
//       if (soundEnabled) soundEffects.playAchievement();
//       setUnlockedAchievement(newlyUnlocked);
//     }
//     setAchievements(updatedAchievements);
//   };

//   const startNewRound = () => {
//     if (remainingCountries.length === 0) {
//       toast.success("🎉 Congratulations! You've identified all capitals!", { duration: 5000 });
//       return;
//     }
//     const randomIndex = Math.floor(Math.random() * remainingCountries.length);
//     const randomCountry = remainingCountries[randomIndex];
//     const capital = COUNTRY_CAPITALS[randomCountry];

//     setLocalTargetCountry(randomCountry);
//     saveTargetCountry(randomCountry);
//     setCurrentCapital(capital);
//     setSelectedCountryName(null);
//     setShowAnswer(false);
//   };

//   useEffect(() => {
//     if (countries.length === 0 || waitingForNextRound) return;
//     if (targetCountry && COUNTRY_CAPITALS[targetCountry] && !correctCountries.includes(targetCountry)) {
//       setLocalTargetCountry(targetCountry);
//       setCurrentCapital(COUNTRY_CAPITALS[targetCountry]);
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

//     setTotalGuesses((prev) => prev + 1);

//     if (normalizedGuess === normalizedTarget) {
//       if (soundEnabled) soundEffects.playCorrect();
//       toast.success(`🎉 Correct! ${currentCapital} is the capital of ${localTargetCountry}!`, {
//         duration: 2500,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });

//       const newStreak = currentStreak + 1;
//       setCurrentStreak(newStreak);
//       setBestStreak((prev) => Math.max(prev, newStreak));
//       const newScore = score + 1;

//       setState({
//         ...state,
//         correctCountries: [...correctCountries, localTargetCountry],
//         wrongCountries: wrongCountries.filter((c) => c !== localTargetCountry),
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
//       }, 2500);
//     } else {
//       if (soundEnabled) soundEffects.playWrong();
//       toast.error(`Wrong! ${selectedCountryName} is not the right country.`, {
//         description: `Hint: Look for the country whose capital is ${currentCapital}.`,
//         duration: 3000,
//       });
//       setCurrentStreak(0);
//       if (!wrongCountries.includes(selectedCountryName)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, selectedCountryName] });
//       }
//       setSelectedCountryName(null);
//     }
//   };

//   const handleSkip = () => {
//     if (!localTargetCountry) return;
//     setShowAnswer(true);
//     if (soundEnabled) soundEffects.playWrong();

//     toast.info(`The answer was ${localTargetCountry}! Capital: ${currentCapital}`, {
//       duration: 3000,
//     });

//     setCurrentStreak(0);
//     setTotalGuesses((prev) => prev + 1);

//     if (!wrongCountries.includes(localTargetCountry)) {
//       setState({ ...state, wrongCountries: [...wrongCountries, localTargetCountry] });
//     }

//     setTimeout(() => {
//       setShowAnswer(false);
//       setSelectedCountryName(null);
//       setLocalTargetCountry(null);
//       saveTargetCountry(null);
//       setWaitingForNextRound(true);
//       setTimeout(() => {
//         setWaitingForNextRound(false);
//         startNewRound();
//       }, 500);
//     }, 3000);
//   };

//   const handleRestart = () => {
//     if (window.confirm("Are you sure you want to restart? All progress will be lost.")) {
//       resetState();
//       setLocalTargetCountry(null);
//       setSelectedCountryName(null);
//       setCurrentCapital("");
//       setWaitingForNextRound(false);
//       setShowAnswer(false);
//       setTotalGuesses(0);
//       setCurrentStreak(0);
//       setBestStreak(0);
//       setAchievements(defaultAchievements);
//       toast.success("Game restarted!");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
//           <p className="text-muted-foreground font-medium">Loading World Map...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//       <Toaster position="top-center" />

//       {/* World Map */}
//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       {/* Capital City Card */}
//       <AnimatePresence>
//         {localTargetCountry && currentCapital && (
//           <motion.div
//             key={currentCapital}
//             initial={{ y: -120, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -120, opacity: 0 }}
//             transition={{ type: "spring", damping: 22, stiffness: 260 }}
//             className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
//           >
//             <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border-4 border-purple-500 min-w-[300px] max-w-[90vw]">
//               {/* Header */}
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
//                   <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
//                 </div>
//                 <h3 className="text-lg font-bold text-slate-900 dark:text-white">
//                   Find this country's capital
//                 </h3>
//               </div>

//               {/* Capital Name */}
//               <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800/50 text-center mb-4">
//                 <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-widest mb-2">
//                   Capital City
//                 </p>
//                 <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
//                   {currentCapital}
//                 </p>
//               </div>

//               {/* Instruction */}
//               <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
//                 🗺️ Click the country on the map, then confirm your guess
//               </p>

//               {/* Skip button — pointer-events-auto so it's clickable */}
//               <div className="pointer-events-auto mt-4 flex justify-center">
//                 <button
//                   onClick={handleSkip}
//                   className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 underline underline-offset-2 transition-colors"
//                 >
//                   Skip & reveal answer
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Correct Answer Reveal Overlay */}
//       <AnimatePresence>
//         {showAnswer && localTargetCountry && (
//           <motion.div
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.8, opacity: 0 }}
//             className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
//           >
//             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-4 border-red-400 text-center max-w-sm mx-4">
//               <p className="text-5xl mb-3">😅</p>
//               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
//                 The answer was...
//               </h3>
//               <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
//                 {localTargetCountry}
//               </p>
//               <p className="text-sm text-slate-500 dark:text-slate-400">
//                 Capital: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentCapital}</span>
//               </p>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Game Controls */}
//       <div className="absolute inset-0 z-10 pointer-events-none">
//         <div className="pointer-events-auto">
//           <GameControls
//             selectedCountryName={selectedCountryName}
//             onGuess={handleGuess}
//             onHint={() => {}}
//             onRestart={handleRestart}
//             onBackToMenu={onBackToMenu}
//             onOpenStats={() => setShowStats(true)}
//             onOpenAchievements={() => setShowAchievements(true)}
//             onToggleSound={() => {
//               const newState = soundEffects.toggle();
//               setSoundEnabled(newState);
//             }}
//             soundEnabled={soundEnabled}
//             score={score}
//             totalCountries={eligibleCountries.length}
//             allCountryNames={allCountryNames}
//             hintsAvailable={false}
//             remainingHints={0}
//           />
//         </div>
//       </div>

//       {/* Statistics */}
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
//           totalCountries: eligibleCountries.length,
//           accuracy: totalGuesses > 0 ? (score / totalGuesses) * 100 : 0,
//           averageHintsPerCountry: 0,
//         }}
//       />

//       {/* Achievements */}
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










// // CapitalCityGame.tsx - Capital City Mode: See capital city name, find the country on the map
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
// import { Loader2, Building2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { soundEffects } from "@/app/utils/soundEffects";

// interface CapitalCityGameProps {
//   onBackToMenu: () => void;
// }

// // Maps country name → capital city
// // Covers all countries available in the world-atlas dataset
// const COUNTRY_CAPITALS: { [key: string]: string } = {
//   "Afghanistan": "Kabul",
//   "Albania": "Tirana",
//   "Algeria": "Algiers",
//   "Angola": "Luanda",
//   "Argentina": "Buenos Aires",
//   "Armenia": "Yerevan",
//   "Australia": "Canberra",
//   "Austria": "Vienna",
//   "Azerbaijan": "Baku",
//   "Bahrain": "Manama",
//   "Bangladesh": "Dhaka",
//   "Belarus": "Minsk",
//   "Belgium": "Brussels",
//   "Belize": "Belmopan",
//   "Benin": "Porto-Novo",
//   "Bhutan": "Thimphu",
//   "Bolivia": "Sucre",
//   "Bosnia and Herzegovina": "Sarajevo",
//   "Botswana": "Gaborone",
//   "Brazil": "Brasília",
//   "Brunei": "Bandar Seri Begawan",
//   "Bulgaria": "Sofia",
//   "Burkina Faso": "Ouagadougou",
//   "Burundi": "Gitega",
//   "Cambodia": "Phnom Penh",
//   "Cameroon": "Yaoundé",
//   "Canada": "Ottawa",
//   "Central African Republic": "Bangui",
//   "Chad": "N'Djamena",
//   "Chile": "Santiago",
//   "China": "Beijing",
//   "Colombia": "Bogotá",
//   "Comoros": "Moroni",
//   "Republic of the Congo": "Brazzaville",
//   "Democratic Republic of the Congo": "Kinshasa",
//   "Costa Rica": "San José",
//   "Croatia": "Zagreb",
//   "Cuba": "Havana",
//   "Cyprus": "Nicosia",
//   "Czechia": "Prague",
//   "Denmark": "Copenhagen",
//   "Djibouti": "Djibouti City",
//   "Dominican Republic": "Santo Domingo",
//   "Ecuador": "Quito",
//   "Egypt": "Cairo",
//   "El Salvador": "San Salvador",
//   "Equatorial Guinea": "Malabo",
//   "Eritrea": "Asmara",
//   "Eswatini": "Mbabane",
//   "Estonia": "Tallinn",
//   "Ethiopia": "Addis Ababa",
//   "Falkland Islands": "Stanley",
//   "Fiji": "Suva",
//   "Finland": "Helsinki",
//   "France": "Paris",
//   "Gabon": "Libreville",
//   "Gambia": "Banjul",
//   "Georgia": "Tbilisi",
//   "Germany": "Berlin",
//   "Ghana": "Accra",
//   "Greece": "Athens",
//   "Greenland": "Nuuk",
//   "Guatemala": "Guatemala City",
//   "Guinea": "Conakry",
//   "Guinea-Bissau": "Bissau",
//   "Guyana": "Georgetown",
//   "Haiti": "Port-au-Prince",
//   "Honduras": "Tegucigalpa",
//   "Hungary": "Budapest",
//   "Iceland": "Reykjavík",
//   "India": "New Delhi",
//   "Indonesia": "Jakarta",
//   "Iran": "Tehran",
//   "Iraq": "Baghdad",
//   "Ireland": "Dublin",
//   "Israel": "Jerusalem",
//   "Italy": "Rome",
//   "Ivory Coast": "Yamoussoukro",
//   "Jamaica": "Kingston",
//   "Japan": "Tokyo",
//   "Jordan": "Amman",
//   "Kazakhstan": "Astana",
//   "Kenya": "Nairobi",
//   "Kosovo": "Pristina",
//   "Kuwait": "Kuwait City",
//   "Kyrgyzstan": "Bishkek",
//   "Laos": "Vientiane",
//   "Latvia": "Riga",
//   "Lebanon": "Beirut",
//   "Lesotho": "Maseru",
//   "Liberia": "Monrovia",
//   "Libya": "Tripoli",
//   "Lithuania": "Vilnius",
//   "Luxembourg": "Luxembourg City",
//   "Madagascar": "Antananarivo",
//   "Malawi": "Lilongwe",
//   "Malaysia": "Kuala Lumpur",
//   "Maldives": "Malé",
//   "Mali": "Bamako",
//   "Malta": "Valletta",
//   "Mauritania": "Nouakchott",
//   "Mauritius": "Port Louis",
//   "Mexico": "Mexico City",
//   "Moldova": "Chișinău",
//   "Mongolia": "Ulaanbaatar",
//   "Montenegro": "Podgorica",
//   "Morocco": "Rabat",
//   "Mozambique": "Maputo",
//   "Myanmar": "Naypyidaw",
//   "Namibia": "Windhoek",
//   "Nepal": "Kathmandu",
//   "Netherlands": "Amsterdam",
//   "New Zealand": "Wellington",
//   "Nicaragua": "Managua",
//   "Niger": "Niamey",
//   "Nigeria": "Abuja",
//   "North Korea": "Pyongyang",
//   "North Macedonia": "Skopje",
//   "Norway": "Oslo",
//   "Oman": "Muscat",
//   "Pakistan": "Islamabad",
//   "Palestine": "Ramallah",
//   "Panama": "Panama City",
//   "Papua New Guinea": "Port Moresby",
//   "Paraguay": "Asunción",
//   "Peru": "Lima",
//   "Philippines": "Manila",
//   "Poland": "Warsaw",
//   "Portugal": "Lisbon",
//   "Qatar": "Doha",
//   "Romania": "Bucharest",
//   "Russia": "Moscow",
//   "Rwanda": "Kigali",
//   "Saudi Arabia": "Riyadh",
//   "Senegal": "Dakar",
//   "Serbia": "Belgrade",
//   "Sierra Leone": "Freetown",
//   "Slovakia": "Bratislava",
//   "Slovenia": "Ljubljana",
//   "Solomon Islands": "Honiara",
//   "Somalia": "Mogadishu",
//   "South Africa": "Pretoria",
//   "South Korea": "Seoul",
//   "South Sudan": "Juba",
//   "Spain": "Madrid",
//   "Sri Lanka": "Sri Jayawardenepura Kotte",
//   "Sudan": "Khartoum",
//   "Suriname": "Paramaribo",
//   "Sweden": "Stockholm",
//   "Switzerland": "Bern",
//   "Syria": "Damascus",
//   "Taiwan": "Taipei",
//   "Tajikistan": "Dushanbe",
//   "Tanzania": "Dodoma",
//   "Thailand": "Bangkok",
//   "Timor-Leste": "Dili",
//   "Togo": "Lomé",
//   "Trinidad and Tobago": "Port of Spain",
//   "Tunisia": "Tunis",
//   "Turkey": "Ankara",
//   "Turkmenistan": "Ashgabat",
//   "Uganda": "Kampala",
//   "Ukraine": "Kyiv",
//   "United Arab Emirates": "Abu Dhabi",
//   "United Kingdom": "London",
//   "United States of America": "Washington, D.C.",
//   "Uruguay": "Montevideo",
//   "Uzbekistan": "Tashkent",
//   "Venezuela": "Caracas",
//   "Vietnam": "Hanoi",
//   "Western Sahara": "El Aaiún",
//   "Yemen": "Sana'a",
//   "Zambia": "Lusaka",
//   "Zimbabwe": "Harare",
//   "Cabo Verde": "Praia",
//   "New Caledonia": "Nouméa",
//   "Somaliland": "Hargeisa",
//   "Northern Cyprus": "Nicosia",
// };

// export function CapitalCityGame({ onBackToMenu }: CapitalCityGameProps) {
//   const { countries, loading } = useCountryData();
//   const { config, toggleTVMode } = useDisplayMode();
//   const [targetCountryName, setTargetCountryName] = useState<string | null>(null);
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [currentCapital, setCurrentCapital] = useState<string>("");
//   const [waitingForNextRound, setWaitingForNextRound] = useState(false);
//   const [showAnswer, setShowAnswer] = useState(false);

//   // Polish features
//   const [showStats, setShowStats] = useState(false);
//   const [showAchievements, setShowAchievements] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
//   const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
//   const [totalGuesses, setTotalGuesses] = useState(0);
//   const [currentStreak, setCurrentStreak] = useState(0);
//   const [bestStreak, setBestStreak] = useState(0);

//   const { state, setState, setTargetCountry: saveTargetCountry, resetState } = useGameState("hint-based");
//   const { correctCountries, wrongCountries, score, targetCountry } = state;
//   const [localTargetCountry, setLocalTargetCountry] = useState<string | null>(targetCountry || null);

//   const allCountryNames = useMemo(() => countries.map((c) => c.properties.name), [countries]);

//   // Only include countries that have a capital defined
//   const eligibleCountries = useMemo(() => {
//     return allCountryNames.filter((name) => !!COUNTRY_CAPITALS[name]);
//   }, [allCountryNames]);

//   const remainingCountries = useMemo(() => {
//     return eligibleCountries.filter((name) => !correctCountries.includes(name));
//   }, [eligibleCountries, correctCountries]);

//   // Check achievements
//   const checkAchievements = (newScore: number, newStreak: number) => {
//     let updatedAchievements = [...achievements];
//     let newlyUnlocked: Achievement | null = null;

//     const milestones = [
//       { id: "first_country", threshold: 1, total: 1 },
//       { id: "five_countries", threshold: 5, total: 5 },
//       { id: "ten_countries", threshold: 10, total: 10 },
//       { id: "fifty_countries", threshold: 50, total: 50 },
//     ];

//     milestones.forEach(({ id, threshold, total }) => {
//       const idx = updatedAchievements.findIndex((a) => a.id === id);
//       if (idx === -1) return;
//       if (!updatedAchievements[idx].unlocked && newScore >= threshold) {
//         updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//         newlyUnlocked = updatedAchievements[idx];
//       } else {
//         updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, total) };
//       }
//     });

//     const streakMilestones = [
//       { id: "streak_5", threshold: 5 },
//       { id: "streak_10", threshold: 10 },
//     ];

//     streakMilestones.forEach(({ id, threshold }) => {
//       const idx = updatedAchievements.findIndex((a) => a.id === id);
//       if (idx === -1) return;
//       if (!updatedAchievements[idx].unlocked && newStreak >= threshold) {
//         updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//         newlyUnlocked = updatedAchievements[idx];
//       } else {
//         updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, threshold) };
//       }
//     });

//     if (newlyUnlocked) {
//       if (soundEnabled) soundEffects.playAchievement();
//       setUnlockedAchievement(newlyUnlocked);
//     }
//     setAchievements(updatedAchievements);
//   };

//   const startNewRound = () => {
//     if (remainingCountries.length === 0) {
//       toast.success("🎉 Congratulations! You've identified all capitals!", { duration: 5000 });
//       return;
//     }
//     const randomIndex = Math.floor(Math.random() * remainingCountries.length);
//     const randomCountry = remainingCountries[randomIndex];
//     const capital = COUNTRY_CAPITALS[randomCountry];

//     setLocalTargetCountry(randomCountry);
//     saveTargetCountry(randomCountry);
//     setCurrentCapital(capital);
//     setSelectedCountryName(null);
//     setShowAnswer(false);
//   };

//   useEffect(() => {
//     if (countries.length === 0 || waitingForNextRound) return;
//     if (targetCountry && COUNTRY_CAPITALS[targetCountry] && !correctCountries.includes(targetCountry)) {
//       setLocalTargetCountry(targetCountry);
//       setCurrentCapital(COUNTRY_CAPITALS[targetCountry]);
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

//     setTotalGuesses((prev) => prev + 1);

//     if (normalizedGuess === normalizedTarget) {
//       if (soundEnabled) soundEffects.playCorrect();
//       toast.success(`🎉 Correct! ${currentCapital} is the capital of ${localTargetCountry}!`, {
//         duration: 2500,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });

//       const newStreak = currentStreak + 1;
//       setCurrentStreak(newStreak);
//       setBestStreak((prev) => Math.max(prev, newStreak));
//       const newScore = score + 1;

//       setState({
//         ...state,
//         correctCountries: [...correctCountries, localTargetCountry],
//         wrongCountries: wrongCountries.filter((c) => c !== localTargetCountry),
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
//       }, 2500);
//     } else {
//       if (soundEnabled) soundEffects.playWrong();
//       toast.error(`Wrong! ${selectedCountryName} is not the right country.`, {
//         description: `Hint: Look for the country whose capital is ${currentCapital}.`,
//         duration: 3000,
//       });
//       setCurrentStreak(0);
//       if (!wrongCountries.includes(selectedCountryName)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, selectedCountryName] });
//       }
//       setSelectedCountryName(null);
//     }
//   };

//   const handleSkip = () => {
//     if (!localTargetCountry) return;
//     setShowAnswer(true);
//     if (soundEnabled) soundEffects.playWrong();

//     toast.info(`The answer was ${localTargetCountry}! Capital: ${currentCapital}`, {
//       duration: 3000,
//     });

//     setCurrentStreak(0);
//     setTotalGuesses((prev) => prev + 1);

//     if (!wrongCountries.includes(localTargetCountry)) {
//       setState({ ...state, wrongCountries: [...wrongCountries, localTargetCountry] });
//     }

//     setTimeout(() => {
//       setShowAnswer(false);
//       setSelectedCountryName(null);
//       setLocalTargetCountry(null);
//       saveTargetCountry(null);
//       setWaitingForNextRound(true);
//       setTimeout(() => {
//         setWaitingForNextRound(false);
//         startNewRound();
//       }, 500);
//     }, 3000);
//   };

//   const handleRestart = () => {
//     if (window.confirm("Are you sure you want to restart? All progress will be lost.")) {
//       resetState();
//       setLocalTargetCountry(null);
//       setSelectedCountryName(null);
//       setCurrentCapital("");
//       setWaitingForNextRound(false);
//       setShowAnswer(false);
//       setTotalGuesses(0);
//       setCurrentStreak(0);
//       setBestStreak(0);
//       setAchievements(defaultAchievements);
//       toast.success("Game restarted!");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
//           <p className="text-muted-foreground font-medium">Loading World Map...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
//       <Toaster position="top-center" />

//       {/* World Map */}
//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       {/* Capital City Card */}
//       <AnimatePresence>
//         {localTargetCountry && currentCapital && (
//           <motion.div
//             key={currentCapital}
//             initial={{ y: -120, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -120, opacity: 0 }}
//             transition={{ type: "spring", damping: 22, stiffness: 260 }}
//             className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
//           >
//             <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border-4 border-purple-500 min-w-[300px] max-w-[90vw]">
//               {/* Header */}
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
//                   <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
//                 </div>
//                 <h3 className="text-lg font-bold text-slate-900 dark:text-white">
//                   Find this country's capital
//                 </h3>
//               </div>

//               {/* Capital Name */}
//               <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800/50 text-center mb-4">
//                 <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-widest mb-2">
//                   Capital City
//                 </p>
//                 <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
//                   {currentCapital}
//                 </p>
//               </div>

//               {/* Instruction */}
//               <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
//                 🗺️ Click the country on the map, then confirm your guess
//               </p>

//               {/* Skip button — pointer-events-auto so it's clickable */}
//               <div className="pointer-events-auto mt-4 flex justify-center">
//                 <button
//                   onClick={handleSkip}
//                   className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 underline underline-offset-2 transition-colors"
//                 >
//                   Skip & reveal answer
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Correct Answer Reveal Overlay */}
//       <AnimatePresence>
//         {showAnswer && localTargetCountry && (
//           <motion.div
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.8, opacity: 0 }}
//             className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
//           >
//             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-4 border-red-400 text-center max-w-sm mx-4">
//               <p className="text-5xl mb-3">😅</p>
//               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
//                 The answer was...
//               </h3>
//               <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
//                 {localTargetCountry}
//               </p>
//               <p className="text-sm text-slate-500 dark:text-slate-400">
//                 Capital: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentCapital}</span>
//               </p>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Game Controls — hidden in TV mode */}
//       {!config.isTV && (
//         <div className="absolute inset-0 z-10 pointer-events-none">
//           <div className="pointer-events-auto">
//             <GameControls
//               selectedCountryName={selectedCountryName}
//               onGuess={handleGuess}
//               onHint={() => {}}
//               onRestart={handleRestart}
//               onBackToMenu={onBackToMenu}
//               onOpenStats={() => setShowStats(true)}
//               onOpenAchievements={() => setShowAchievements(true)}
//               onToggleSound={() => { const newState = soundEffects.toggle(); setSoundEnabled(newState); }}
//               soundEnabled={soundEnabled}
//               score={score}
//               totalCountries={eligibleCountries.length}
//               allCountryNames={allCountryNames}
//               hintsAvailable={false}
//               remainingHints={0}
//             />
//           </div>
//         </div>
//       )}

//       {/* TV Classroom HUD */}
//       <AnimatePresence>
//         {config.isTV && (
//           <ClassroomHUD
//             score={score} totalCountries={eligibleCountries.length}
//             selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
//             onGuess={handleGuess} onExitTVMode={toggleTVMode}
//             onBackToMenu={onBackToMenu} onRestart={handleRestart}
//             streak={currentStreak} targetLabel="Identify this country" mode="capital-city"
//           />
//         )}
//       </AnimatePresence>

//       {/* Statistics */}
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
//           totalCountries: eligibleCountries.length,
//           accuracy: totalGuesses > 0 ? (score / totalGuesses) * 100 : 0,
//           averageHintsPerCountry: 0,
//         }}
//       />

//       {/* Achievements */}
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








// CapitalCityGame.tsx - Capital City Mode: See capital city name, find the country on the map
import React, { useState, useEffect, useMemo } from "react";
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
import { Loader2, Building2, ChevronUp, ChevronDown } from "lucide-react";
import { useGameState } from "@/app/hooks/useGameState";
import { soundEffects } from "@/app/utils/soundEffects";

interface CapitalCityGameProps {
  onBackToMenu: () => void;
}

// Maps country name → capital city
// Covers all countries available in the world-atlas dataset
const COUNTRY_CAPITALS: { [key: string]: string } = {
  "Afghanistan": "Kabul",
  "Albania": "Tirana",
  "Algeria": "Algiers",
  "Angola": "Luanda",
  "Argentina": "Buenos Aires",
  "Armenia": "Yerevan",
  "Australia": "Canberra",
  "Austria": "Vienna",
  "Azerbaijan": "Baku",
  "Bahrain": "Manama",
  "Bangladesh": "Dhaka",
  "Belarus": "Minsk",
  "Belgium": "Brussels",
  "Belize": "Belmopan",
  "Benin": "Porto-Novo",
  "Bhutan": "Thimphu",
  "Bolivia": "Sucre",
  "Bosnia and Herzegovina": "Sarajevo",
  "Botswana": "Gaborone",
  "Brazil": "Brasília",
  "Brunei": "Bandar Seri Begawan",
  "Bulgaria": "Sofia",
  "Burkina Faso": "Ouagadougou",
  "Burundi": "Gitega",
  "Cambodia": "Phnom Penh",
  "Cameroon": "Yaoundé",
  "Canada": "Ottawa",
  "Central African Republic": "Bangui",
  "Chad": "N'Djamena",
  "Chile": "Santiago",
  "China": "Beijing",
  "Colombia": "Bogotá",
  "Comoros": "Moroni",
  "Republic of the Congo": "Brazzaville",
  "Democratic Republic of the Congo": "Kinshasa",
  "Costa Rica": "San José",
  "Croatia": "Zagreb",
  "Cuba": "Havana",
  "Cyprus": "Nicosia",
  "Czechia": "Prague",
  "Denmark": "Copenhagen",
  "Djibouti": "Djibouti City",
  "Dominican Republic": "Santo Domingo",
  "Ecuador": "Quito",
  "Egypt": "Cairo",
  "El Salvador": "San Salvador",
  "Equatorial Guinea": "Malabo",
  "Eritrea": "Asmara",
  "Eswatini": "Mbabane",
  "Estonia": "Tallinn",
  "Ethiopia": "Addis Ababa",
  "Falkland Islands": "Stanley",
  "Fiji": "Suva",
  "Finland": "Helsinki",
  "France": "Paris",
  "Gabon": "Libreville",
  "Gambia": "Banjul",
  "Georgia": "Tbilisi",
  "Germany": "Berlin",
  "Ghana": "Accra",
  "Greece": "Athens",
  "Greenland": "Nuuk",
  "Guatemala": "Guatemala City",
  "Guinea": "Conakry",
  "Guinea-Bissau": "Bissau",
  "Guyana": "Georgetown",
  "Haiti": "Port-au-Prince",
  "Honduras": "Tegucigalpa",
  "Hungary": "Budapest",
  "Iceland": "Reykjavík",
  "India": "New Delhi",
  "Indonesia": "Jakarta",
  "Iran": "Tehran",
  "Iraq": "Baghdad",
  "Ireland": "Dublin",
  "Israel": "Jerusalem",
  "Italy": "Rome",
  "Ivory Coast": "Yamoussoukro",
  "Jamaica": "Kingston",
  "Japan": "Tokyo",
  "Jordan": "Amman",
  "Kazakhstan": "Astana",
  "Kenya": "Nairobi",
  "Kosovo": "Pristina",
  "Kuwait": "Kuwait City",
  "Kyrgyzstan": "Bishkek",
  "Laos": "Vientiane",
  "Latvia": "Riga",
  "Lebanon": "Beirut",
  "Lesotho": "Maseru",
  "Liberia": "Monrovia",
  "Libya": "Tripoli",
  "Lithuania": "Vilnius",
  "Luxembourg": "Luxembourg City",
  "Madagascar": "Antananarivo",
  "Malawi": "Lilongwe",
  "Malaysia": "Kuala Lumpur",
  "Maldives": "Malé",
  "Mali": "Bamako",
  "Malta": "Valletta",
  "Mauritania": "Nouakchott",
  "Mauritius": "Port Louis",
  "Mexico": "Mexico City",
  "Moldova": "Chișinău",
  "Mongolia": "Ulaanbaatar",
  "Montenegro": "Podgorica",
  "Morocco": "Rabat",
  "Mozambique": "Maputo",
  "Myanmar": "Naypyidaw",
  "Namibia": "Windhoek",
  "Nepal": "Kathmandu",
  "Netherlands": "Amsterdam",
  "New Zealand": "Wellington",
  "Nicaragua": "Managua",
  "Niger": "Niamey",
  "Nigeria": "Abuja",
  "North Korea": "Pyongyang",
  "North Macedonia": "Skopje",
  "Norway": "Oslo",
  "Oman": "Muscat",
  "Pakistan": "Islamabad",
  "Palestine": "Ramallah",
  "Panama": "Panama City",
  "Papua New Guinea": "Port Moresby",
  "Paraguay": "Asunción",
  "Peru": "Lima",
  "Philippines": "Manila",
  "Poland": "Warsaw",
  "Portugal": "Lisbon",
  "Qatar": "Doha",
  "Romania": "Bucharest",
  "Russia": "Moscow",
  "Rwanda": "Kigali",
  "Saudi Arabia": "Riyadh",
  "Senegal": "Dakar",
  "Serbia": "Belgrade",
  "Sierra Leone": "Freetown",
  "Slovakia": "Bratislava",
  "Slovenia": "Ljubljana",
  "Solomon Islands": "Honiara",
  "Somalia": "Mogadishu",
  "South Africa": "Pretoria",
  "South Korea": "Seoul",
  "South Sudan": "Juba",
  "Spain": "Madrid",
  "Sri Lanka": "Sri Jayawardenepura Kotte",
  "Sudan": "Khartoum",
  "Suriname": "Paramaribo",
  "Sweden": "Stockholm",
  "Switzerland": "Bern",
  "Syria": "Damascus",
  "Taiwan": "Taipei",
  "Tajikistan": "Dushanbe",
  "Tanzania": "Dodoma",
  "Thailand": "Bangkok",
  "Timor-Leste": "Dili",
  "Togo": "Lomé",
  "Trinidad and Tobago": "Port of Spain",
  "Tunisia": "Tunis",
  "Turkey": "Ankara",
  "Turkmenistan": "Ashgabat",
  "Uganda": "Kampala",
  "Ukraine": "Kyiv",
  "United Arab Emirates": "Abu Dhabi",
  "United Kingdom": "London",
  "United States of America": "Washington, D.C.",
  "Uruguay": "Montevideo",
  "Uzbekistan": "Tashkent",
  "Venezuela": "Caracas",
  "Vietnam": "Hanoi",
  "Western Sahara": "El Aaiún",
  "Yemen": "Sana'a",
  "Zambia": "Lusaka",
  "Zimbabwe": "Harare",
  "Cabo Verde": "Praia",
  "New Caledonia": "Nouméa",
  "Somaliland": "Hargeisa",
  "Northern Cyprus": "Nicosia",
};

export function CapitalCityGame({ onBackToMenu }: CapitalCityGameProps) {
  const { countries, loading } = useCountryData();
  const { config, toggleTVMode } = useDisplayMode();
  const [targetCountryName, setTargetCountryName] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [currentCapital, setCurrentCapital] = useState<string>("");
  const [waitingForNextRound, setWaitingForNextRound] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);

  // Polish features
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const { state, setState, setTargetCountry: saveTargetCountry, resetState } = useGameState("hint-based");
  const { correctCountries, wrongCountries, score, targetCountry } = state;
  const [localTargetCountry, setLocalTargetCountry] = useState<string | null>(targetCountry || null);

  const allCountryNames = useMemo(() => countries.map((c) => c.properties.name), [countries]);

  // Only include countries that have a capital defined
  const eligibleCountries = useMemo(() => {
    return allCountryNames.filter((name) => !!COUNTRY_CAPITALS[name]);
  }, [allCountryNames]);

  const remainingCountries = useMemo(() => {
    return eligibleCountries.filter((name) => !correctCountries.includes(name));
  }, [eligibleCountries, correctCountries]);

  // Check achievements
  const checkAchievements = (newScore: number, newStreak: number) => {
    let updatedAchievements = [...achievements];
    let newlyUnlocked: Achievement | null = null;

    const milestones = [
      { id: "first_country", threshold: 1, total: 1 },
      { id: "five_countries", threshold: 5, total: 5 },
      { id: "ten_countries", threshold: 10, total: 10 },
      { id: "fifty_countries", threshold: 50, total: 50 },
    ];

    milestones.forEach(({ id, threshold, total }) => {
      const idx = updatedAchievements.findIndex((a) => a.id === id);
      if (idx === -1) return;
      if (!updatedAchievements[idx].unlocked && newScore >= threshold) {
        updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
        newlyUnlocked = updatedAchievements[idx];
      } else {
        updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, total) };
      }
    });

    const streakMilestones = [
      { id: "streak_5", threshold: 5 },
      { id: "streak_10", threshold: 10 },
    ];

    streakMilestones.forEach(({ id, threshold }) => {
      const idx = updatedAchievements.findIndex((a) => a.id === id);
      if (idx === -1) return;
      if (!updatedAchievements[idx].unlocked && newStreak >= threshold) {
        updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
        newlyUnlocked = updatedAchievements[idx];
      } else {
        updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, threshold) };
      }
    });

    if (newlyUnlocked) {
      if (soundEnabled) soundEffects.playAchievement();
      setUnlockedAchievement(newlyUnlocked);
    }
    setAchievements(updatedAchievements);
  };

  const startNewRound = () => {
    if (remainingCountries.length === 0) {
      toast.success("🎉 Congratulations! You've identified all capitals!", { duration: 5000 });
      return;
    }
    const randomIndex = Math.floor(Math.random() * remainingCountries.length);
    const randomCountry = remainingCountries[randomIndex];
    const capital = COUNTRY_CAPITALS[randomCountry];

    setLocalTargetCountry(randomCountry);
    saveTargetCountry(randomCountry);
    setCurrentCapital(capital);
    setSelectedCountryName(null);
    setShowAnswer(false);
    setCardVisible(true); // always show card at start of new round
  };

  useEffect(() => {
    if (countries.length === 0 || waitingForNextRound) return;
    if (targetCountry && COUNTRY_CAPITALS[targetCountry] && !correctCountries.includes(targetCountry)) {
      setLocalTargetCountry(targetCountry);
      setCurrentCapital(COUNTRY_CAPITALS[targetCountry]);
    } else if (!localTargetCountry) {
      startNewRound();
    }
  }, [countries, targetCountry]);

  const handleCountryClick = (geo: any) => {
    const name = geo.properties.name || geo.name;
    if (correctCountries.includes(name)) {
      toast.info(`You already found ${name}!`);
      return;
    }
    if (soundEnabled) soundEffects.playClick();
    setSelectedCountryName(name);
  };

  const handleGuess = (guess: string) => {
    if (!selectedCountryName || !localTargetCountry) return;

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedSelected = selectedCountryName.toLowerCase().trim();
    const normalizedTarget = localTargetCountry.toLowerCase().trim();

    if (normalizedGuess !== normalizedSelected) {
      if (soundEnabled) soundEffects.playWrong();
      toast.error("Guess doesn't match selected country!");
      return;
    }

    setTotalGuesses((prev) => prev + 1);

    if (normalizedGuess === normalizedTarget) {
      if (soundEnabled) soundEffects.playCorrect();
      toast.success(`🎉 Correct! ${currentCapital} is the capital of ${localTargetCountry}!`, {
        duration: 2500,
        className: "bg-green-50 text-green-800 border-green-200",
      });

      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
      const newScore = score + 1;

      setState({
        ...state,
        correctCountries: [...correctCountries, localTargetCountry],
        wrongCountries: wrongCountries.filter((c) => c !== localTargetCountry),
        score: newScore,
        targetCountry: null,
      });

      checkAchievements(newScore, newStreak);
      setSelectedCountryName(null);
      setLocalTargetCountry(null);
      saveTargetCountry(null);
      setWaitingForNextRound(true);

      setTimeout(() => {
        setWaitingForNextRound(false);
        startNewRound();
      }, 2500);
    } else {
      if (soundEnabled) soundEffects.playWrong();
      toast.error(`Wrong! ${selectedCountryName} is not the right country.`, {
        description: `Hint: Look for the country whose capital is ${currentCapital}.`,
        duration: 3000,
      });
      setCurrentStreak(0);
      if (!wrongCountries.includes(selectedCountryName)) {
        setState({ ...state, wrongCountries: [...wrongCountries, selectedCountryName] });
      }
      setSelectedCountryName(null);
    }
  };

  const handleSkip = () => {
    if (!localTargetCountry) return;
    setShowAnswer(true);
    if (soundEnabled) soundEffects.playWrong();

    toast.info(`The answer was ${localTargetCountry}! Capital: ${currentCapital}`, {
      duration: 3000,
    });

    setCurrentStreak(0);
    setTotalGuesses((prev) => prev + 1);

    if (!wrongCountries.includes(localTargetCountry)) {
      setState({ ...state, wrongCountries: [...wrongCountries, localTargetCountry] });
    }

    setTimeout(() => {
      setShowAnswer(false);
      setSelectedCountryName(null);
      setLocalTargetCountry(null);
      saveTargetCountry(null);
      setWaitingForNextRound(true);
      setTimeout(() => {
        setWaitingForNextRound(false);
        startNewRound();
      }, 500);
    }, 3000);
  };

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart? All progress will be lost.")) {
      resetState();
      setLocalTargetCountry(null);
      setSelectedCountryName(null);
      setCurrentCapital("");
      setWaitingForNextRound(false);
      setShowAnswer(false);
      setTotalGuesses(0);
      setCurrentStreak(0);
      setBestStreak(0);
      setAchievements(defaultAchievements);
      toast.success("Game restarted!");
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          <p className="text-muted-foreground font-medium">Loading World Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Toaster position="top-center" toastOptions={{ style: { fontSize: "clamp(1rem,1.8vw,1.5rem)", minHeight: "clamp(3rem,5vh,4rem)" } }} />

      {/* World Map */}
      <div className="absolute inset-0 z-0">
        <WorldMap
          countries={countries}
          onCountryClick={handleCountryClick}
          selectedCountryName={selectedCountryName}
          correctCountries={correctCountries}
          wrongCountries={wrongCountries}
        />
      </div>

      {/* Capital City Card + hide/show toggle */}
      {localTargetCountry && currentCapital && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-1">

          {/* Toggle button — always on top, always clickable */}
          <button
            onClick={() => setCardVisible(v => !v)}
            className="
              flex items-center gap-1.5 px-4 py-1.5
              bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
              text-sm font-semibold rounded-full shadow-lg
              border border-slate-200 dark:border-slate-700
              hover:bg-slate-50 dark:hover:bg-slate-700
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
              active:scale-95 transition-transform
            "
          >
            {cardVisible
              ? <><ChevronUp className="w-4 h-4" /> Hide card</>
              : <><ChevronDown className="w-4 h-4" /> Show card</>
            }
          </button>

          {/* Capital card — snappy fade in/out below the button */}
          <AnimatePresence initial={false}>
            {cardVisible && (
              <motion.div
                key="capital-card"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.12 }}
              >
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border-4 border-purple-500 min-w-[300px] max-w-[90vw]">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                      <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Find this country's capital
                    </h3>
                  </div>

                  {/* Capital Name */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800/50 text-center mb-4">
                    <p className="text-base font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-widest mb-2">
                      Capital City
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {currentCapital}
                    </p>
                  </div>

                  {/* Instruction */}
                  <p className="text-base text-slate-500 dark:text-slate-400 text-center">
                    🗺️ Click the country on the map, then confirm your guess
                  </p>

                  {/* Skip button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleSkip}
                      className="text-base text-slate-400 hover:text-red-500 dark:hover:text-red-400 underline underline-offset-2 transition-colors"
                    >
                      Skip & reveal answer
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Correct Answer Reveal Overlay */}
      <AnimatePresence>
        {showAnswer && localTargetCountry && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-4 border-red-400 text-center max-w-sm mx-4">
              <p className="text-5xl mb-3">😅</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                The answer was...
              </h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {localTargetCountry}
              </p>
              <p className="text-base text-slate-500 dark:text-slate-400">
                Capital: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentCapital}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Controls — hidden in TV mode */}
      {!config.isTV && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <GameControls
              selectedCountryName={selectedCountryName}
              onGuess={handleGuess}
              onHint={() => {}}
              onRestart={handleRestart}
              onBackToMenu={onBackToMenu}
              onOpenStats={() => setShowStats(true)}
              onOpenAchievements={() => setShowAchievements(true)}
              onToggleSound={() => { const newState = soundEffects.toggle(); setSoundEnabled(newState); }}
              soundEnabled={soundEnabled}
              score={score}
              totalCountries={eligibleCountries.length}
              allCountryNames={allCountryNames}
              hintsAvailable={false}
              remainingHints={0}
            />
          </div>
        </div>
      )}

      {/* TV Classroom HUD */}
      <AnimatePresence>
        {config.isTV && (
          <ClassroomHUD
            score={score} totalCountries={eligibleCountries.length}
            selectedCountryName={selectedCountryName} allCountryNames={allCountryNames}
            onGuess={handleGuess} onExitTVMode={toggleTVMode}
            onBackToMenu={onBackToMenu} onRestart={handleRestart}
            streak={currentStreak} targetLabel="Identify this country" mode="capital-city"
          />
        )}
      </AnimatePresence>

      {/* Statistics */}
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
          totalCountries: eligibleCountries.length,
          accuracy: totalGuesses > 0 ? (score / totalGuesses) * 100 : 0,
          averageHintsPerCountry: 0,
        }}
      />

      {/* Achievements */}
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