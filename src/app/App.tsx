// import React, { useState, useMemo } from "react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";

// export default function App() {
//   const { countries, loading } = useCountryData();
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [correctCountries, setCorrectCountries] = useState<string[]>([]);
//   const [wrongCountries, setWrongCountries] = useState<string[]>([]);
//   const [score, setScore] = useState(0);

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

//   const handleCountryClick = (geo: any) => {
//     const name = geo.properties.name || geo.name;
//     if (correctCountries.includes(name)) {
//       toast.info(`You already found ${name}!`);
//       return;
//     }
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedTarget = selectedCountryName.toLowerCase().trim();

//     if (normalizedGuess === normalizedTarget) {
//       // Correct
//       toast.success(`Correct! It is ${selectedCountryName}`, {
//         duration: 2000,
//         className: "bg-green-50 text-green-800 border-green-200"
//       });
//       setCorrectCountries(prev => [...prev, selectedCountryName]);
//       setScore(s => s + 1);
//       setSelectedCountryName(null);
//       // Remove from wrong list if it was there previously (optional, but cleaner)
//       setWrongCountries(prev => prev.filter(c => c !== selectedCountryName));
//     } else {
//       // Wrong
//       toast.error("Incorrect, try again!", {
//         description: "Or use a hint if you're stuck."
//       });
//       setWrongCountries(prev => prev.includes(selectedCountryName) ? prev : [...prev, selectedCountryName]);
//     }
//   };

//   const handleHint = () => {
//     if (!selectedCountryName) return;
//     // Simple hint: First letter
//     const firstLetter = selectedCountryName.charAt(0);
//     const length = selectedCountryName.length;
//     toast.message("Hint", {
//       description: `Starts with "${firstLetter}" and has ${length} letters.`
//     });
//   };

//   // if (loading) {
//   //   return (
//   //     <div className="size-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
//   //       <div className="flex flex-col items-center gap-4">
//   //         <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
//   //         <p className="text-muted-foreground font-medium">Loading World Map...</p>
//   //       </div>
//   //     </div>
//   //   );
//   // }

//   if (loading) {
//   return (
//     <div className="w-screen h-screen relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
//       <div className="flex flex-col items-center gap-4">
//         <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
//         <p className="text-muted-foreground font-medium">Loading World Map...</p>
//       </div>
//     </div>
//   );
// }


//   return (
//     <div className="size-full relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
//       <Toaster position="top-center" />
      
//       {/* Map Layer */}
//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//         {/* <div style={{height: 400, background: "red"}}>
//         MAP SHOULD BE HERE
//          </div> */}
//       </div>

//       {/* UI Layer */}
//       <GameControls
//         selectedCountryName={selectedCountryName}
//         onGuess={handleGuess}
//         onHint={handleHint}
//         score={score}
//         totalCountries={countries.length}
//         allCountryNames={allCountryNames}
//       />
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <div style={{ padding: 40, fontSize: 24 }}>
//       COUNTRY GAME UI BOOT OK
//     </div>
//   );
// }


// import React, { useState, useMemo } from "react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { useGameState } from "@/app/hooks/useGameState";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";

// export default function App() {
//   /* ---------- MAP DATA ---------- */
//   const { countries, loading: mapLoading } = useCountryData();

//   /* ---------- GAME STATE ---------- */
//   const { state, setState, resetState, loaded } = useGameState();

//   const { correctCountries, wrongCountries, score } = state;

//   /* ---------- UI STATE ---------- */
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);

//   /* ---------- DERIVED DATA ---------- */
//   const allCountryNames = useMemo(
//     () => countries.map((c) => c.properties.name),
//     [countries]
//   );

//   /* ---------- EARLY RETURNS ---------- */

//   // 1️⃣ Game state loading (backend / localStorage)
//   if (!loaded) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
//         <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   // 2️⃣ Map loading (GeoJSON)
//   if (mapLoading) {
//     return (
//       <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
//           <p className="text-muted-foreground font-medium">
//             Loading World Map...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /* ---------- HANDLERS ---------- */

//   const handleCountryClick = (geo: any) => {
//     const name = geo.properties?.name || geo.name;

//     if (correctCountries.includes(name)) {
//       toast.info(`You already found ${name}!`);
//       return;
//     }

//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedTarget = selectedCountryName.toLowerCase().trim();

//     if (normalizedGuess === normalizedTarget) {
//       toast.success(`Correct! It is ${selectedCountryName}`, {
//         duration: 2000,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });

//       setState({
//         ...state,
//         correctCountries: [...correctCountries, selectedCountryName],
//         wrongCountries: wrongCountries.filter(
//           (c) => c !== selectedCountryName
//         ),
//         score: score + 1,
//       });

//       setSelectedCountryName(null);
//     } else {
//       toast.error("Incorrect, try again!", {
//         description: "Or use a hint if you're stuck.",
//       });

//       if (!wrongCountries.includes(selectedCountryName)) {
//         setState({
//           ...state,
//           wrongCountries: [...wrongCountries, selectedCountryName],
//         });
//       }
//     }
//   };

//   const handleHint = () => {
//     if (!selectedCountryName) return;

//     toast.message("Hint", {
//       description: `Starts with "${selectedCountryName[0]}" and has ${selectedCountryName.length} letters.`,
//     });
//   };

//   const handleRestart = () => {
//     resetState();
//     setSelectedCountryName(null);
//   };

//   /* ---------- RENDER ---------- */

//   return (
//     <div className="size-full relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
//       <Toaster position="top-center" />

//       {/* MAP */}
//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       {/* UI */}
//       <GameControls
//         selectedCountryName={selectedCountryName}
//         onGuess={handleGuess}
//         onHint={handleHint}
//         score={score}
//         totalCountries={countries.length}
//         allCountryNames={allCountryNames}
//       />

//       {/* RESTART */}
//       <button
//         onClick={handleRestart}
//         className="fixed top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
//       >
//         Restart Game
//       </button>
//     </div>
//   );
// }

//ASIL KOD

//App.tsx
// import React, { useState, useMemo } from "react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { getRandomHint } from "@/app/utils/getRandomHint";


// export default function App() {
//   const { countries, loading } = useCountryData();
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const { state, setState, resetState } = useGameState();

//   const { correctCountries, wrongCountries, score } = state;

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

//   const handleCountryClick = (geo: any) => {
//     const name = geo.properties.name || geo.name;
//     if (correctCountries.includes(name)) {
//       toast.info(`You already found ${name}!`);
//       return;
//     }
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedTarget = selectedCountryName.toLowerCase().trim();

//     if (normalizedGuess === normalizedTarget) {
//       // Correct
//       toast.success(`Correct! It is ${selectedCountryName}`, {
//         duration: 2000,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });
//       setState({
//         ...state,
//         correctCountries: [...correctCountries, selectedCountryName],
//         wrongCountries: wrongCountries.filter(c => c !== selectedCountryName),
//         score: score + 1,
//       });
//       setSelectedCountryName(null);
//     } else {
//       // Wrong
//       toast.error("Incorrect, try again!", {
//         description: "Or use a hint if you're stuck.",
//       });
//       if (!wrongCountries.includes(selectedCountryName)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, selectedCountryName] });
//       }
//     }
//   };

//   // const handleHint = () => {
//   //   if (!selectedCountryName) return;
//   //   const firstLetter = selectedCountryName.charAt(0);
//   //   const length = selectedCountryName.length;
//   //   toast.message("Hint", {
//   //     description: `Starts with "${firstLetter}" and has ${length} letters.`,
//   //   });
//   // };

//   const handleHint = () => {
//   if (!selectedCountryName) return;

//   const hint = getRandomHint(selectedCountryName);

//   if (!hint) {
//     toast.message("Hint", {
//       description: "No hint available for this country yet.",
//     });
//     return;
//   }

//   toast.message("Hint", {
//     description: hint,
//   });
// };


//   const handleRestart = () => resetState();

//   if (loading) {
//     return (
//       <div className="w-screen h-screen relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
//           <p className="text-muted-foreground font-medium">Loading World Map...</p>
//         </div>
//       </div>
//     );
//   }
  

//   return (
//     <div className="size-full relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
//       <Toaster position="top-center" />

//       {/* Map Layer */}
//       {/* <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div> */}
//       <div className="absolute inset-0 z-0 p-0 m-0">  {/* Padding ve margin sıfırla */}
//       <WorldMap
//         countries={countries}
//         onCountryClick={handleCountryClick}
//         selectedCountryName={selectedCountryName}
//         correctCountries={correctCountries}
//         wrongCountries={wrongCountries}
//       />
// </div>
      

//       {/* UI Layer */}
//       <GameControls
//         selectedCountryName={selectedCountryName}
//         onGuess={handleGuess}
//         onHint={handleHint}
//         score={score}
//         totalCountries={countries.length}
//         allCountryNames={allCountryNames}
//       />

//       {/* Restart Game Button */}
//       {/* <button
//         onClick={handleRestart}
//         className="fixed top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
//       >
//         Restart Game
//       </button> */}
//     </div>
//   );
// }




// // App.tsx - Updated with Fullscreen Map Layout
// import React, { useState, useMemo } from "react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { getRandomHint } from "@/app/utils/getRandomHint";

// export default function App() {
//   const { countries, loading } = useCountryData();
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const { state, setState, resetState } = useGameState();

//   const { correctCountries, wrongCountries, score } = state;

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

//   const handleCountryClick = (geo: any) => {
//     const name = geo.properties.name || geo.name;
//     if (correctCountries.includes(name)) {
//       toast.info(`You already found ${name}!`);
//       return;
//     }
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedTarget = selectedCountryName.toLowerCase().trim();

//     if (normalizedGuess === normalizedTarget) {
//       // Correct
//       toast.success(`Correct! It is ${selectedCountryName}`, {
//         duration: 2000,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });
//       setState({
//         ...state,
//         correctCountries: [...correctCountries, selectedCountryName],
//         wrongCountries: wrongCountries.filter(c => c !== selectedCountryName),
//         score: score + 1,
//       });
//       setSelectedCountryName(null);
//     } else {
//       // Wrong
//       toast.error("Incorrect, try again!", {
//         description: "Or use a hint if you're stuck.",
//       });
//       if (!wrongCountries.includes(selectedCountryName)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, selectedCountryName] });
//       }
//     }
//   };

//   const handleHint = () => {
//     if (!selectedCountryName) return;

//     const hint = getRandomHint(selectedCountryName);

//     if (!hint) {
//       toast.message("Hint", {
//         description: "No hint available for this country yet.",
//       });
//       return;
//     }

//     toast.message("Hint", {
//       description: hint,
//     });
//   };

//   const handleRestart = () => resetState();

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

//       {/* FULLSCREEN MAP LAYER - No padding, no margin */}
//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       {/* UI OVERLAY LAYER */}
//       <div className="absolute inset-0 z-10 pointer-events-none">
//         <div className="pointer-events-auto">
//           <GameControls
//             selectedCountryName={selectedCountryName}
//             onGuess={handleGuess}
//             onHint={handleHint}
//             onRestart={handleRestart}
//             score={score}
//             totalCountries={countries.length}
//             allCountryNames={allCountryNames}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }


// App.tsx - Updated: Prevents duplicate hints and tracks usage
// import React, { useState, useMemo } from "react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { HintStack } from "@/app/components/HintStack";
// import { NewHintModal } from "@/app/components/NewHintModal";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { getRandomHint, getTotalHintCount, getRemainingHintCount } from "@/app/utils/getRandomHint";

// export default function App() {
//   const { countries, loading } = useCountryData();
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [newHint, setNewHint] = useState<{ text: string; type: any; countryName: string } | null>(null);
//   const [isMapLocked, setIsMapLocked] = useState(false);
  
//   const { state, setState, addHint, removeHint, clearHints, resetState } = useGameState();

//   const { correctCountries, wrongCountries, score, hints } = state;

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

//   // Get all used hint texts for the currently selected country
//   const usedHintTexts = useMemo(() => {
//     if (!selectedCountryName) return [];
//     return hints
//       .filter(h => h.countryName === selectedCountryName)
//       .map(h => h.text);
//   }, [hints, selectedCountryName]);

//   // Check if hints are available for current country
//   const hintsAvailable = useMemo(() => {
//     if (!selectedCountryName) return false;
//     const remaining = getRemainingHintCount(selectedCountryName, usedHintTexts);
//     return remaining > 0;
//   }, [selectedCountryName, usedHintTexts]);

//   const handleCountryClick = (geo: any) => {
//     // Prevent clicks when map is locked (new hint showing)
//     if (isMapLocked) {
//       toast.error("Please wait for the hint timer to complete");
//       return;
//     }

//     const name = geo.properties.name || geo.name;
//     if (correctCountries.includes(name)) {
//       toast.info(`You already found ${name}!`);
//       return;
//     }
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedTarget = selectedCountryName.toLowerCase().trim();

//     if (normalizedGuess === normalizedTarget) {
//       // Correct - Clear all hints for this country
//       toast.success(`Correct! It is ${selectedCountryName}`, {
//         duration: 2000,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });
      
//       setState({
//         ...state,
//         correctCountries: [...correctCountries, selectedCountryName],
//         wrongCountries: wrongCountries.filter(c => c !== selectedCountryName),
//         score: score + 1,
//       });
      
//       // Clear all hints after correct guess
//       clearHints();
      
//       setSelectedCountryName(null);
//     } else {
//       // Wrong
//       toast.error("Incorrect, try again!", {
//         description: "Or use a hint if you're stuck.",
//       });
//       if (!wrongCountries.includes(selectedCountryName)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, selectedCountryName] });
//       }
//     }
//   };

//   const handleHint = () => {
//     if (!selectedCountryName) return;

//     // Check if hints are available
//     if (!hintsAvailable) {
//       const total = getTotalHintCount(selectedCountryName);
//       toast.error("No more hints available!", {
//         description: `You've used all ${total} hint${total !== 1 ? 's' : ''} for this country.`,
//         duration: 3000,
//       });
//       return;
//     }

//     // Get a hint that hasn't been used yet
//     const hintText = getRandomHint(selectedCountryName, usedHintTexts);

//     if (!hintText) {
//       toast.error("No more hints available!", {
//         description: "You've used all available hints for this country.",
//         duration: 3000,
//       });
//       return;
//     }

//     // Determine hint type
//     const hintType = hintText.includes("Located in") ? "continent" 
//                    : hintText.includes("Capital city") ? "capital"
//                    : "fact";

//     // Add to hint stack
//     const hint = addHint({
//       countryName: selectedCountryName,
//       text: hintText,
//       type: hintType
//     });

//     // Show new hint modal with lock
//     setNewHint({
//       text: hintText,
//       type: hintType,
//       countryName: selectedCountryName
//     });
//     setIsMapLocked(true);
//   };

//   const handleHintComplete = () => {
//     setNewHint(null);
//     setIsMapLocked(false);
//   };

//   const handleRestart = () => {
//     if (window.confirm("Are you sure you want to restart? All progress will be lost.")) {
//       resetState();
//       setSelectedCountryName(null);
//       setNewHint(null);
//       setIsMapLocked(false);
//       toast.success("Game restarted!");
//     }
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

//       {/* FULLSCREEN MAP LAYER */}
//       <div className="absolute inset-0 z-0">
//         <WorldMap
//           countries={countries}
//           onCountryClick={handleCountryClick}
//           selectedCountryName={selectedCountryName}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       {/* UI OVERLAY LAYER */}
//       <div className="absolute inset-0 z-10 pointer-events-none">
//         <div className="pointer-events-auto">
//           <GameControls
//             selectedCountryName={selectedCountryName}
//             onGuess={handleGuess}
//             onHint={handleHint}
//             onRestart={handleRestart}
//             score={score}
//             totalCountries={countries.length}
//             allCountryNames={allCountryNames}
//             hintsAvailable={hintsAvailable}
//             remainingHints={selectedCountryName ? getRemainingHintCount(selectedCountryName, usedHintTexts) : 0}
//           />

//           {/* Hint Stack */}
//           <HintStack 
//             hints={hints}
//             onClose={removeHint}
//           />
//         </div>
//       </div>

//       {/* New Hint Modal (locks map for 5 seconds) */}
//       <NewHintModal
//         hint={newHint}
//         onComplete={handleHintComplete}
//         lockDuration={5}
//       />

//       {/* Map Lock Overlay (visual indicator) */}
//       {isMapLocked && (
//         <div className="absolute inset-0 z-40 bg-black/10 pointer-events-none" />
//       )}
//     </div>
//   );
// }






// App.tsx - Updated: Clears hints when switching modes
// import React, { useState, useMemo, useEffect } from "react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { HintStack } from "@/app/components/HintStack";
// import { NewHintModal } from "@/app/components/NewHintModal";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { getRandomHint, getRemainingHintCount } from "@/app/utils/getRandomHint";

// type GameMode = "classic" | "hint-based" | null;

// export default function App() {
//   const [gameMode, setGameMode] = useState<GameMode>(null);
//   const { clearHints } = useGameState();

//   // Clear hints when mode changes
//   const handleModeChange = (mode: GameMode) => {
//     clearHints(); // Clear all hints from previous mode
//     setGameMode(mode);
//   };

//   // Show mode selector if no mode selected
//   if (gameMode === null) {
//     return <GameModeSelector onSelectMode={handleModeChange} />;
//   }

//   // Show hint-based game
//   if (gameMode === "hint-based") {
//     return <HintBasedGame onBackToMenu={() => handleModeChange(null)} />;
//   }

//   // Show classic game
//   return <ClassicGame onBackToMenu={() => handleModeChange(null)} />;
// }

// // Classic Mode Component
// function ClassicGame({ onBackToMenu }: { onBackToMenu: () => void }) {
//   const { countries, loading } = useCountryData();
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [newHint, setNewHint] = useState<{ text: string; type: any; countryName: string } | null>(null);
//   const [isMapLocked, setIsMapLocked] = useState(false);
  
//   const { state, setState, addHint, removeHint, clearHints, resetState } = useGameState();

//   const { correctCountries, wrongCountries, score, hints } = state;

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

//   const usedHintTexts = useMemo(() => {
//     if (!selectedCountryName) return [];
//     return hints
//       .filter(h => h.countryName === selectedCountryName)
//       .map(h => h.text);
//   }, [hints, selectedCountryName]);

//   const hintsAvailable = useMemo(() => {
//     if (!selectedCountryName) return false;
//     const remaining = getRemainingHintCount(selectedCountryName, usedHintTexts);
//     return remaining > 0;
//   }, [selectedCountryName, usedHintTexts]);

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
//     setSelectedCountryName(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!selectedCountryName) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedTarget = selectedCountryName.toLowerCase().trim();

//     if (normalizedGuess === normalizedTarget) {
//       toast.success(`Correct! It is ${selectedCountryName}`, {
//         duration: 2000,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });
      
//       setState({
//         ...state,
//         correctCountries: [...correctCountries, selectedCountryName],
//         wrongCountries: wrongCountries.filter(c => c !== selectedCountryName),
//         score: score + 1,
//       });
      
//       clearHints();
//       setSelectedCountryName(null);
//     } else {
//       toast.error("Incorrect, try again!", {
//         description: "Or use a hint if you're stuck.",
//       });
//       if (!wrongCountries.includes(selectedCountryName)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, selectedCountryName] });
//       }
//     }
//   };

//   const handleHint = () => {
//     if (!selectedCountryName) return;

//     if (!hintsAvailable) {
//       toast.error("No more hints available!", {
//         description: "You've used all available hints for this country.",
//         duration: 3000,
//       });
//       return;
//     }

//     const hintText = getRandomHint(selectedCountryName, usedHintTexts);

//     if (!hintText) {
//       toast.error("No more hints available!", {
//         description: "You've used all available hints for this country.",
//         duration: 3000,
//       });
//       return;
//     }

//     const hintType = hintText.includes("Located in") ? "continent" 
//                    : hintText.includes("Capital city") ? "capital"
//                    : "fact";

//     addHint({
//       countryName: selectedCountryName,
//       text: hintText,
//       type: hintType
//     });

//     setNewHint({
//       text: hintText,
//       type: hintType,
//       countryName: selectedCountryName
//     });
//     setIsMapLocked(true);
//   };

//   const handleHintComplete = () => {
//     setNewHint(null);
//     setIsMapLocked(false);
//   };

//   // Restart only the current game mode
//   const handleRestart = () => {
//     if (window.confirm("Are you sure you want to restart this game? All progress will be lost.")) {
//       resetState();
//       setSelectedCountryName(null);
//       setNewHint(null);
//       setIsMapLocked(false);
//       toast.success("Game restarted!");
//     }
//   };

//   // Back to menu - hints will be cleared by handleModeChange
//   const handleBackToMenu = () => {
//     if (window.confirm("Return to menu? Your current progress will be saved.")) {
//       onBackToMenu();
//     }
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

//       <div className="absolute inset-0 z-10 pointer-events-none">
//         <div className="pointer-events-auto">
//           <GameControls
//             selectedCountryName={selectedCountryName}
//             onGuess={handleGuess}
//             onHint={handleHint}
//             onRestart={handleRestart}
//             onBackToMenu={handleBackToMenu}
//             score={score}
//             totalCountries={countries.length}
//             allCountryNames={allCountryNames}
//             hintsAvailable={hintsAvailable}
//             remainingHints={selectedCountryName ? getRemainingHintCount(selectedCountryName, usedHintTexts) : 0}
//           />

//           <HintStack 
//             hints={hints}
//             onClose={removeHint}
//           />
//         </div>
//       </div>

//       <NewHintModal
//         hint={newHint}
//         onComplete={handleHintComplete}
//         lockDuration={5}
//       />

//       {isMapLocked && (
//         <div className="absolute inset-0 z-40 bg-black/10 pointer-events-none" />
//       )}
//     </div>
//   );
// }









// // App.tsx - Updated: Classic mode saves selected country
// import React, { useState, useMemo, useEffect } from "react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { HintStack } from "@/app/components/HintStack";
// import { NewHintModal } from "@/app/components/NewHintModal";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { getRandomHint, getRemainingHintCount } from "@/app/utils/getRandomHint";

// type GameMode = "classic" | "hint-based" | null;

// export default function App() {
//   const [gameMode, setGameMode] = useState<GameMode>(null);

//   if (gameMode === null) {
//     return <GameModeSelector onSelectMode={(mode) => setGameMode(mode)} />;
//   }

//   if (gameMode === "hint-based") {
//     return <HintBasedGame onBackToMenu={() => setGameMode(null)} />;
//   }

//   return <ClassicGame onBackToMenu={() => setGameMode(null)} />;
// }

// // Classic Mode Component
// function ClassicGame({ onBackToMenu }: { onBackToMenu: () => void }) {
//   const { countries, loading } = useCountryData();
//   const [newHint, setNewHint] = useState<{ text: string; type: any; countryName: string } | null>(null);
//   const [isMapLocked, setIsMapLocked] = useState(false);
  
//   const { 
//     state, 
//     setState, 
//     addHint, 
//     removeHint, 
//     clearHints, 
//     setSelectedCountry: saveSelectedCountry,
//     resetState 
//   } = useGameState("classic");

//   const { correctCountries, wrongCountries, score, hints, selectedCountry } = state;

//   // Use selectedCountry from state (persisted)
//   const [localSelectedCountry, setLocalSelectedCountry] = useState<string | null>(selectedCountry || null);

//   // Sync local state with persisted state on mount
//   useEffect(() => {
//     if (selectedCountry) {
//       setLocalSelectedCountry(selectedCountry);
//     }
//   }, [selectedCountry]);

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

//   const usedHintTexts = useMemo(() => {
//     if (!localSelectedCountry) return [];
//     return hints
//       .filter(h => h.countryName === localSelectedCountry)
//       .map(h => h.text);
//   }, [hints, localSelectedCountry]);

//   const hintsAvailable = useMemo(() => {
//     if (!localSelectedCountry) return false;
//     const remaining = getRemainingHintCount(localSelectedCountry, usedHintTexts);
//     return remaining > 0;
//   }, [localSelectedCountry, usedHintTexts]);

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
    
//     // Save selected country to state (persisted)
//     setLocalSelectedCountry(name);
//     saveSelectedCountry(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!localSelectedCountry) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedTarget = localSelectedCountry.toLowerCase().trim();

//     if (normalizedGuess === normalizedTarget) {
//       toast.success(`Correct! It is ${localSelectedCountry}`, {
//         duration: 2000,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });
      
//       setState({
//         ...state,
//         correctCountries: [...correctCountries, localSelectedCountry],
//         wrongCountries: wrongCountries.filter(c => c !== localSelectedCountry),
//         score: score + 1,
//         selectedCountry: null  // Clear selected country
//       });
      
//       clearHints();
//       setLocalSelectedCountry(null);
//       saveSelectedCountry(null);
//     } else {
//       toast.error("Incorrect, try again!", {
//         description: "Or use a hint if you're stuck.",
//       });
//       if (!wrongCountries.includes(localSelectedCountry)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, localSelectedCountry] });
//       }
//     }
//   };

//   const handleHint = () => {
//     if (!localSelectedCountry) return;

//     if (!hintsAvailable) {
//       toast.error("No more hints available!", {
//         description: "You've used all available hints for this country.",
//         duration: 3000,
//       });
//       return;
//     }

//     const hintText = getRandomHint(localSelectedCountry, usedHintTexts);

//     if (!hintText) {
//       toast.error("No more hints available!", {
//         description: "You've used all available hints for this country.",
//         duration: 3000,
//       });
//       return;
//     }

//     const hintType = hintText.includes("Located in") ? "continent" 
//                    : hintText.includes("Capital city") ? "capital"
//                    : "fact";

//     addHint({
//       countryName: localSelectedCountry,
//       text: hintText,
//       type: hintType
//     });

//     setNewHint({
//       text: hintText,
//       type: hintType,
//       countryName: localSelectedCountry
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
//       setLocalSelectedCountry(null);
//       setNewHint(null);
//       setIsMapLocked(false);
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
//           selectedCountryName={localSelectedCountry}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       <div className="absolute inset-0 z-10 pointer-events-none">
//         <div className="pointer-events-auto">
//           <GameControls
//             selectedCountryName={localSelectedCountry}
//             onGuess={handleGuess}
//             onHint={handleHint}
//             onRestart={handleRestart}
//             onBackToMenu={handleBackToMenu}
//             score={score}
//             totalCountries={countries.length}
//             allCountryNames={allCountryNames}
//             hintsAvailable={hintsAvailable}
//             remainingHints={localSelectedCountry ? getRemainingHintCount(localSelectedCountry, usedHintTexts) : 0}
//           />

//           <HintStack 
//             hints={hints}
//             onClose={removeHint}
//           />
//         </div>
//       </div>

//       <NewHintModal
//         hint={newHint}
//         onComplete={handleHintComplete}
//         lockDuration={5}
//       />

//       {isMapLocked && (
//         <div className="absolute inset-0 z-40 bg-black/10 pointer-events-none" />
//       )}
//     </div>
//   );
// }








// // App.tsx - Updated: Center zoom + no scrollbars
// import React, { useState, useMemo, useEffect } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { HintStack } from "@/app/components/HintStack";
// import { NewHintModal } from "@/app/components/NewHintModal";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { Globe3D } from "@/app/components/Globe3D";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { getRandomHint, getRemainingHintCount } from "@/app/utils/getRandomHint";


// type GameMode = "classic" | "hint-based" | null;
// type ViewMode = "globe" | "mode-select" | "game";

// export default function App() {
//   const [viewMode, setViewMode] = useState<ViewMode>("globe");
//   const [gameMode, setGameMode] = useState<GameMode>(null);

//   // Prevent scrollbars on body
//   useEffect(() => {
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, []);

//   // Show 3D Globe on first load
//   if (viewMode === "globe") {
//     return (
//       <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="globe"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ 
//               opacity: 0, 
//               scale: 1.5,
//               transition: { duration: 0.8, ease: "easeIn" }
//             }}
//             style={{ width: '100%', height: '100%' }}
//           >
//             <Globe3D 
//               onTransitionToMap={() => setViewMode("mode-select")} 
//               showButton={true}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // Show mode selector with globe background
//   if (viewMode === "mode-select" && gameMode === null) {
//     return (
//       <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="mode-select"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ 
//               opacity: 0,
//               scale: 15,
//               x: 0,
//               y: 0,
//               transition: { 
//                 duration: 1.5,
//                 ease: [0.6, 0.01, 0.05, 0.95]
//               }
//             }}
//             style={{ 
//               width: '100%', 
//               height: '100%',
//               transformOrigin: 'center center'
//             }}
//           >
//             <GameModeSelector 
//               onSelectMode={(mode) => {
//                 setGameMode(mode);
//                 setTimeout(() => {
//                   setViewMode("game");
//                 }, 1500);
//               }} 
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // Handle back to menu
//   const handleBackToMenu = () => {
//     setGameMode(null);
//     setViewMode("mode-select");
//   };

//   // Show hint-based game
//   if (gameMode === "hint-based") {
//     return (
//       <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="hint-based-game"
//             initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//             animate={{ 
//               scale: 1, 
//               opacity: 1,
//               filter: "blur(0px)",
//               transition: {
//                 duration: 1,
//                 ease: [0.34, 1.56, 0.64, 1]
//               }
//             }}
//             exit={{ 
//               opacity: 0, 
//               scale: 0.8,
//               transition: { duration: 0.5 }
//             }}
//             style={{ width: '100%', height: '100%' }}
//           >
//             <HintBasedGame onBackToMenu={handleBackToMenu} />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // Show classic game with zoom-from-center effect
//   return (
//     <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//       <AnimatePresence mode="wait">
//         <motion.div
//           key="classic-game"
//           initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//           animate={{ 
//             scale: 1, 
//             opacity: 1,
//             filter: "blur(0px)",
//             transition: {
//               duration: 1,
//               ease: [0.34, 1.56, 0.64, 1]
//             }
//           }}
//           exit={{ 
//             opacity: 0, 
//             scale: 0.8,
//             transition: { duration: 0.5 }
//           }}
//           style={{ width: '100%', height: '100%' }}
//         >
//           <ClassicGame onBackToMenu={handleBackToMenu} />
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// }

// // Classic Mode Component
// function ClassicGame({ onBackToMenu }: { onBackToMenu: () => void }) {
//   const { countries, loading } = useCountryData();
//   const [newHint, setNewHint] = useState<{ text: string; type: any; countryName: string } | null>(null);
//   const [isMapLocked, setIsMapLocked] = useState(false);
  
//   const { 
//     state, 
//     setState, 
//     addHint, 
//     removeHint, 
//     clearHints, 
//     setSelectedCountry: saveSelectedCountry,
//     resetState 
//   } = useGameState("classic");

//   const { correctCountries, wrongCountries, score, hints, selectedCountry } = state;

//   const [localSelectedCountry, setLocalSelectedCountry] = useState<string | null>(selectedCountry || null);

//   useEffect(() => {
//     if (selectedCountry) {
//       setLocalSelectedCountry(selectedCountry);
//     }
//   }, [selectedCountry]);

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

//   const usedHintTexts = useMemo(() => {
//     if (!localSelectedCountry) return [];
//     return hints
//       .filter(h => h.countryName === localSelectedCountry)
//       .map(h => h.text);
//   }, [hints, localSelectedCountry]);

//   const hintsAvailable = useMemo(() => {
//     if (!localSelectedCountry) return false;
//     const remaining = getRemainingHintCount(localSelectedCountry, usedHintTexts);
//     return remaining > 0;
//   }, [localSelectedCountry, usedHintTexts]);

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
    
//     setLocalSelectedCountry(name);
//     saveSelectedCountry(name);
//   };

//   const handleGuess = (guess: string) => {
//     if (!localSelectedCountry) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedTarget = localSelectedCountry.toLowerCase().trim();

//     if (normalizedGuess === normalizedTarget) {
//       toast.success(`Correct! It is ${localSelectedCountry}`, {
//         duration: 2000,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });
      
//       setState({
//         ...state,
//         correctCountries: [...correctCountries, localSelectedCountry],
//         wrongCountries: wrongCountries.filter(c => c !== localSelectedCountry),
//         score: score + 1,
//         selectedCountry: null
//       });
      
//       clearHints();
//       setLocalSelectedCountry(null);
//       saveSelectedCountry(null);
//     } else {
//       toast.error("Incorrect, try again!", {
//         description: "Or use a hint if you're stuck.",
//       });
//       if (!wrongCountries.includes(localSelectedCountry)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, localSelectedCountry] });
//       }
//     }
//   };

//   const handleHint = () => {
//     if (!localSelectedCountry) return;

//     if (!hintsAvailable) {
//       toast.error("No more hints available!", {
//         description: "You've used all available hints for this country.",
//         duration: 3000,
//       });
//       return;
//     }

//     const hintText = getRandomHint(localSelectedCountry, usedHintTexts);

//     if (!hintText) {
//       toast.error("No more hints available!", {
//         description: "You've used all available hints for this country.",
//         duration: 3000,
//       });
//       return;
//     }

//     const hintType = hintText.includes("Located in") ? "continent" 
//                    : hintText.includes("Capital city") ? "capital"
//                    : "fact";

//     addHint({
//       countryName: localSelectedCountry,
//       text: hintText,
//       type: hintType
//     });

//     setNewHint({
//       text: hintText,
//       type: hintType,
//       countryName: localSelectedCountry
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
//       setLocalSelectedCountry(null);
//       setNewHint(null);
//       setIsMapLocked(false);
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
//           selectedCountryName={localSelectedCountry}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       <div className="absolute inset-0 z-10 pointer-events-none">
//         <div className="pointer-events-auto">
//           <GameControls
//             selectedCountryName={localSelectedCountry}
//             onGuess={handleGuess}
//             onHint={handleHint}
//             onRestart={handleRestart}
//             onBackToMenu={handleBackToMenu}
//             score={score}
//             totalCountries={countries.length}
//             allCountryNames={allCountryNames}
//             hintsAvailable={hintsAvailable}
//             remainingHints={localSelectedCountry ? getRemainingHintCount(localSelectedCountry, usedHintTexts) : 0}
//           />

//           <HintStack 
//             hints={hints}
//             onClose={removeHint}
//           />
//         </div>
//       </div>

//       <NewHintModal
//         hint={newHint}
//         onComplete={handleHintComplete}
//         lockDuration={5}
//       />

//       {isMapLocked && (
//         <div className="absolute inset-0 z-40 bg-black/10 pointer-events-none" />
//       )}
//     </div>
//   );
// }







// // App.tsx - Complete with Sound, Statistics, and Achievements
// import React, { useState, useMemo, useEffect } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import WorldMap from "@/app/components/WorldMap";
// import { GameControls } from "@/app/components/GameControls";
// import { HintStack } from "@/app/components/HintStack";
// import { NewHintModal } from "@/app/components/NewHintModal";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { Globe3D } from "@/app/components/Globe3D";
// import { Statistics } from "@/app/components/Statistics";
// import { AchievementsList, AchievementNotification, defaultAchievements, type Achievement } from "@/app/components/Achievements";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import { toast, Toaster } from "sonner";
// import { Loader2 } from "lucide-react";
// import { useGameState } from "@/app/hooks/useGameState";
// import { getRandomHint, getRemainingHintCount } from "@/app/utils/getRandomHint";
// import { soundEffects } from "@/app/utils/soundEffects";

// type GameMode = "classic" | "hint-based" | null;
// type ViewMode = "globe" | "mode-select" | "game";

// export default function App() {
//   const [viewMode, setViewMode] = useState<ViewMode>("globe");
//   const [gameMode, setGameMode] = useState<GameMode>(null);

//   useEffect(() => {
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, []);

//   if (viewMode === "globe") {
//     return (
//       <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="globe"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
//             style={{ width: '100%', height: '100%' }}
//           >
//             <Globe3D 
//               onTransitionToMap={() => setViewMode("mode-select")} 
//               showButton={true}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   if (viewMode === "mode-select" && gameMode === null) {
//     return (
//       <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="mode-select"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ 
//               opacity: 0, scale: 15, x: 0, y: 0,
//               transition: { duration: 1.5, ease: [0.6, 0.01, 0.05, 0.95] }
//             }}
//             style={{ width: '100%', height: '100%', transformOrigin: 'center center' }}
//           >
//             <GameModeSelector 
//               onSelectMode={(mode) => {
//                 setGameMode(mode);
//                 setTimeout(() => setViewMode("game"), 1500);
//               }} 
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   const handleBackToMenu = () => {
//     setGameMode(null);
//     setViewMode("mode-select");
//   };

//   if (gameMode === "hint-based") {
//     return (
//       <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="hint-based-game"
//             initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//             animate={{ 
//               scale: 1, opacity: 1, filter: "blur(0px)",
//               transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] }
//             }}
//             exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
//             style={{ width: '100%', height: '100%' }}
//           >
//             <HintBasedGame onBackToMenu={handleBackToMenu} />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   return (
//     <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//       <AnimatePresence mode="wait">
//         <motion.div
//           key="classic-game"
//           initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//           animate={{ 
//             scale: 1, opacity: 1, filter: "blur(0px)",
//             transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] }
//           }}
//           exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
//           style={{ width: '100%', height: '100%' }}
//         >
//           <ClassicGame onBackToMenu={handleBackToMenu} />
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// }

// function ClassicGame({ onBackToMenu }: { onBackToMenu: () => void }) {
//   const { countries, loading } = useCountryData();
//   const [newHint, setNewHint] = useState<{ text: string; type: any; countryName: string } | null>(null);
//   const [isMapLocked, setIsMapLocked] = useState(false);
  
//   // Polish features state
//   const [showStats, setShowStats] = useState(false);
//   const [showAchievements, setShowAchievements] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
//   const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
//   const [totalGuesses, setTotalGuesses] = useState(0);
//   const [currentStreak, setCurrentStreak] = useState(0);
//   const [bestStreak, setBestStreak] = useState(0);
//   const [countriesWithoutHints, setCountriesWithoutHints] = useState(0);
  
//   const { 
//     state, setState, addHint, removeHint, clearHints, 
//     setSelectedCountry: saveSelectedCountry, resetState 
//   } = useGameState("classic");

//   const { correctCountries, wrongCountries, score, hints, selectedCountry } = state;
//   const [localSelectedCountry, setLocalSelectedCountry] = useState<string | null>(selectedCountry || null);
//   const [hintsUsedForCurrentCountry, setHintsUsedForCurrentCountry] = useState(0);

//   useEffect(() => {
//     if (selectedCountry) {
//       setLocalSelectedCountry(selectedCountry);
//     }
//   }, [selectedCountry]);

//   const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

//   const usedHintTexts = useMemo(() => {
//     if (!localSelectedCountry) return [];
//     return hints.filter(h => h.countryName === localSelectedCountry).map(h => h.text);
//   }, [hints, localSelectedCountry]);

//   const hintsAvailable = useMemo(() => {
//     if (!localSelectedCountry) return false;
//     return getRemainingHintCount(localSelectedCountry, usedHintTexts) > 0;
//   }, [localSelectedCountry, usedHintTexts]);

//   // Check achievements
//   const checkAchievements = (newScore: number, newStreak: number) => {
//     let updatedAchievements = [...achievements];
//     let newlyUnlocked: Achievement | null = null;

//     // First country
//     if (newScore >= 1 && !achievements.find(a => a.id === 'first_country')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'first_country');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
//       newlyUnlocked = updatedAchievements[idx];
//     }
    
//     // Five countries
//     if (newScore >= 5 && !achievements.find(a => a.id === 'five_countries')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'five_countries');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'five_countries');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 5) };
//     }
    
//     // Ten countries
//     if (newScore >= 10 && !achievements.find(a => a.id === 'ten_countries')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'ten_countries');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'ten_countries');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 10) };
//     }
    
//     // Fifty countries
//     if (newScore >= 50 && !achievements.find(a => a.id === 'fifty_countries')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'fifty_countries');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newScore };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'fifty_countries');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newScore, 50) };
//     }
    
//     // Streak 5
//     if (newStreak >= 5 && !achievements.find(a => a.id === 'streak_5')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_5');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_5');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 5) };
//     }
    
//     // Streak 10
//     if (newStreak >= 10 && !achievements.find(a => a.id === 'streak_10')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_10');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, progress: newStreak };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'streak_10');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(newStreak, 10) };
//     }
    
//     // No hints achievement
//     if (countriesWithoutHints >= 10 && !achievements.find(a => a.id === 'no_hints')?.unlocked) {
//       const idx = updatedAchievements.findIndex(a => a.id === 'no_hints');
//       updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true };
//       newlyUnlocked = updatedAchievements[idx];
//     } else {
//       const idx = updatedAchievements.findIndex(a => a.id === 'no_hints');
//       if (idx !== -1) updatedAchievements[idx] = { ...updatedAchievements[idx], progress: Math.min(countriesWithoutHints, 10) };
//     }
    
//     // Perfect accuracy
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
//     setLocalSelectedCountry(name);
//     saveSelectedCountry(name);
//     setHintsUsedForCurrentCountry(0);
//   };

//   const handleGuess = (guess: string) => {
//     if (!localSelectedCountry) return;

//     const normalizedGuess = guess.toLowerCase().trim();
//     const normalizedTarget = localSelectedCountry.toLowerCase().trim();

//     setTotalGuesses(prev => prev + 1);

//     if (normalizedGuess === normalizedTarget) {
//       if (soundEnabled) soundEffects.playCorrect();
      
//       toast.success(`Correct! It is ${localSelectedCountry}`, {
//         duration: 2000,
//         className: "bg-green-50 text-green-800 border-green-200",
//       });
      
//       const newStreak = currentStreak + 1;
//       setCurrentStreak(newStreak);
//       setBestStreak(prev => Math.max(prev, newStreak));
      
//       if (hintsUsedForCurrentCountry === 0) {
//         setCountriesWithoutHints(prev => prev + 1);
//       }
      
//       const newScore = score + 1;
//       setState({
//         ...state,
//         correctCountries: [...correctCountries, localSelectedCountry],
//         wrongCountries: wrongCountries.filter(c => c !== localSelectedCountry),
//         score: newScore,
//         selectedCountry: null
//       });
      
//       checkAchievements(newScore, newStreak);
//       clearHints();
//       setLocalSelectedCountry(null);
//       saveSelectedCountry(null);
//     } else {
//       if (soundEnabled) soundEffects.playWrong();
      
//       toast.error("Incorrect, try again!", {
//         description: "Or use a hint if you're stuck.",
//       });
      
//       setCurrentStreak(0);
      
//       if (!wrongCountries.includes(localSelectedCountry)) {
//         setState({ ...state, wrongCountries: [...wrongCountries, localSelectedCountry] });
//       }
//     }
//   };

//   const handleHint = () => {
//     if (!localSelectedCountry) return;

//     if (!hintsAvailable) {
//       toast.error("No more hints available!", {
//         description: "You've used all available hints for this country.",
//         duration: 3000,
//       });
//       return;
//     }

//     if (soundEnabled) soundEffects.playHint();

//     const hintText = getRandomHint(localSelectedCountry, usedHintTexts);
//     if (!hintText) {
//       toast.error("No more hints available!");
//       return;
//     }

//     const hintType = hintText.includes("Located in") ? "continent" 
//                    : hintText.includes("Capital city") ? "capital"
//                    : "fact";

//     addHint({
//       countryName: localSelectedCountry,
//       text: hintText,
//       type: hintType
//     });

//     setNewHint({
//       text: hintText,
//       type: hintType,
//       countryName: localSelectedCountry
//     });
    
//     setHintsUsedForCurrentCountry(prev => prev + 1);
//     setIsMapLocked(true);
//   };

//   const handleHintComplete = () => {
//     setNewHint(null);
//     setIsMapLocked(false);
//   };

//   const handleRestart = () => {
//     if (window.confirm("Are you sure you want to restart this game? All progress will be lost.")) {
//       resetState();
//       setLocalSelectedCountry(null);
//       setNewHint(null);
//       setIsMapLocked(false);
//       setTotalGuesses(0);
//       setCurrentStreak(0);
//       setBestStreak(0);
//       setCountriesWithoutHints(0);
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
//           selectedCountryName={localSelectedCountry}
//           correctCountries={correctCountries}
//           wrongCountries={wrongCountries}
//         />
//       </div>

//       <div className="absolute inset-0 z-10 pointer-events-none">
//         <div className="pointer-events-auto">
//           <GameControls
//             selectedCountryName={localSelectedCountry}
//             onGuess={handleGuess}
//             onHint={handleHint}
//             onRestart={handleRestart}
//             onBackToMenu={handleBackToMenu}
//             onOpenStats={() => setShowStats(true)}
//             onOpenAchievements={() => setShowAchievements(true)}
//             onToggleSound={() => {
//               const newState = soundEffects.toggle();
//               setSoundEnabled(newState);
//             }}
//             soundEnabled={soundEnabled}
//             score={score}
//             totalCountries={countries.length}
//             allCountryNames={allCountryNames}
//             hintsAvailable={hintsAvailable}
//             remainingHints={localSelectedCountry ? getRemainingHintCount(localSelectedCountry, usedHintTexts) : 0}
//           />

//           <HintStack 
//             hints={hints}
//             onClose={removeHint}
//           />
//         </div>
//       </div>

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





// // App.tsx - Updated with Flag Quiz Mode
// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { FlagQuizGame } from "@/app/components/FlagQuizGame";
// import { Globe3D } from "@/app/components/Globe3D";
// import ClassicGame from "@/app/components/ClassicGame"; // Your existing Classic game component

// type GameMode = "classic" | "hint-based" | "flag-quiz" | null;
// type ViewMode = "globe" | "mode-select" | "game";

// export default function App() {
//   const [viewMode, setViewMode] = useState<ViewMode>("globe");
//   const [gameMode, setGameMode] = useState<GameMode>(null);

//   useEffect(() => {
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, []);

//   // Show 3D Globe
//   if (viewMode === "globe") {
//     return (
//       <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="globe"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
//             style={{ width: '100%', height: '100%' }}
//           >
//             <Globe3D 
//               onTransitionToMap={() => setViewMode("mode-select")} 
//               showButton={true}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // Show mode selector
//   if (viewMode === "mode-select" && gameMode === null) {
//     return (
//       <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="mode-select"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ 
//               opacity: 0, scale: 15, x: 0, y: 0,
//               transition: { duration: 1.5, ease: [0.6, 0.01, 0.05, 0.95] }
//             }}
//             style={{ width: '100%', height: '100%', transformOrigin: 'center center' }}
//           >
//             <GameModeSelector 
//               onSelectMode={(mode) => {
//                 setGameMode(mode);
//                 setTimeout(() => setViewMode("game"), 1500);
//               }} 
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   const handleBackToMenu = () => {
//     setGameMode(null);
//     setViewMode("mode-select");
//   };

//   // Show selected game mode
//   if (gameMode === "hint-based") {
//     return (
//       <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="hint-based-game"
//             initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//             animate={{ 
//               scale: 1, opacity: 1, filter: "blur(0px)",
//               transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] }
//             }}
//             exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
//             style={{ width: '100%', height: '100%' }}
//           >
//             <HintBasedGame onBackToMenu={handleBackToMenu} />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   if (gameMode === "flag-quiz") {
//     return (
//       <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="flag-quiz-game"
//             initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//             animate={{ 
//               scale: 1, opacity: 1, filter: "blur(0px)",
//               transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] }
//             }}
//             exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
//             style={{ width: '100%', height: '100%' }}
//           >
//             <FlagQuizGame onBackToMenu={handleBackToMenu} />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // Classic mode
//   return (
//     <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
//       <AnimatePresence mode="wait">
//         <motion.div
//           key="classic-game"
//           initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//           animate={{ 
//             scale: 1, opacity: 1, filter: "blur(0px)",
//             transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] }
//           }}
//           exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
//           style={{ width: '100%', height: '100%' }}
//         >
//           <ClassicGame onBackToMenu={handleBackToMenu} />
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// }



// // App.tsx - Updated with Capital City Mode
// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { FlagQuizGame } from "@/app/components/FlagQuizGame";
// import { CapitalCityGame } from "@/app/components/CapitalCityGame";
// import { Globe3D } from "@/app/components/Globe3D";
// import ClassicGame from "@/app/components/ClassicGame";

// type GameMode = "classic" | "hint-based" | "flag-quiz" | "capital-city" | null;
// type ViewMode = "globe" | "mode-select" | "game";

// // Shared transition wrapper to keep entry animations DRY
// function GameTransition({ children, id }: { children: React.ReactNode; id: string }) {
//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={id}
//         initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//         animate={{
//           scale: 1,
//           opacity: 1,
//           filter: "blur(0px)",
//           transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] },
//         }}
//         exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
//         style={{ width: "100%", height: "100%" }}
//       >
//         {children}
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// export default function App() {
//   const [viewMode, setViewMode] = useState<ViewMode>("globe");
//   const [gameMode, setGameMode] = useState<GameMode>(null);

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, []);

//   const handleBackToMenu = () => {
//     setGameMode(null);
//     setViewMode("mode-select");
//   };

//   // ── 3D Globe ──────────────────────────────────────────────────────────────
//   if (viewMode === "globe") {
//     return (
//       <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="globe"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
//             style={{ width: "100%", height: "100%" }}
//           >
//             <Globe3D
//               onTransitionToMap={() => setViewMode("mode-select")}
//               showButton={true}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // ── Mode Selector ──────────────────────────────────────────────────────────
//   if (viewMode === "mode-select" && gameMode === null) {
//     return (
//       <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="mode-select"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{
//               opacity: 0,
//               scale: 15,
//               transition: { duration: 1.5, ease: [0.6, 0.01, 0.05, 0.95] },
//             }}
//             style={{ width: "100%", height: "100%", transformOrigin: "center center" }}
//           >
//             <GameModeSelector
//               onSelectMode={(mode) => {
//                 setGameMode(mode);
//                 setTimeout(() => setViewMode("game"), 1500);
//               }}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // ── Game Modes ─────────────────────────────────────────────────────────────
//   return (
//     <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//       {gameMode === "hint-based" && (
//         <GameTransition id="hint-based-game">
//           <HintBasedGame onBackToMenu={handleBackToMenu} />
//         </GameTransition>
//       )}

//       {gameMode === "flag-quiz" && (
//         <GameTransition id="flag-quiz-game">
//           <FlagQuizGame onBackToMenu={handleBackToMenu} />
//         </GameTransition>
//       )}

//       {gameMode === "capital-city" && (
//         <GameTransition id="capital-city-game">
//           <CapitalCityGame onBackToMenu={handleBackToMenu} />
//         </GameTransition>
//       )}

//       {(gameMode === "classic" || gameMode === null) && (
//         <GameTransition id="classic-game">
//           <ClassicGame onBackToMenu={handleBackToMenu} />
//         </GameTransition>
//       )}
//     </div>
//   );
// }



// // App.tsx - Updated with Speed Round Mode
// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { FlagQuizGame } from "@/app/components/FlagQuizGame";
// import { CapitalCityGame } from "@/app/components/CapitalCityGame";
// import { SpeedRoundGame } from "@/app/components/SpeedRoundGame";
// import { Globe3D } from "@/app/components/Globe3D";
// import ClassicGame from "@/app/components/ClassicGame";

// type GameMode = "classic" | "hint-based" | "flag-quiz" | "capital-city" | "speed-round" | null;
// type ViewMode = "globe" | "mode-select" | "game";

// // Reusable animated wrapper for game transitions
// function GameTransition({ children, id }: { children: React.ReactNode; id: string }) {
//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={id}
//         initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//         animate={{
//           scale: 1,
//           opacity: 1,
//           filter: "blur(0px)",
//           transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] },
//         }}
//         exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
//         style={{ width: "100%", height: "100%" }}
//       >
//         {children}
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// export default function App() {
//   const [viewMode, setViewMode] = useState<ViewMode>("globe");
//   const [gameMode, setGameMode] = useState<GameMode>(null);

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, []);

//   const handleBackToMenu = () => {
//     setGameMode(null);
//     setViewMode("mode-select");
//   };

//   // ── 3D Globe ──────────────────────────────────────────────────────────────
//   if (viewMode === "globe") {
//     return (
//       <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="globe"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
//             style={{ width: "100%", height: "100%" }}
//           >
//             <Globe3D
//               onTransitionToMap={() => setViewMode("mode-select")}
//               showButton={true}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // ── Mode Selector ──────────────────────────────────────────────────────────
//   if (viewMode === "mode-select" && gameMode === null) {
//     return (
//       <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="mode-select"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{
//               opacity: 0,
//               scale: 15,
//               transition: { duration: 1.5, ease: [0.6, 0.01, 0.05, 0.95] },
//             }}
//             style={{ width: "100%", height: "100%", transformOrigin: "center center" }}
//           >
//             <GameModeSelector
//               onSelectMode={(mode) => {
//                 setGameMode(mode);
//                 // Speed round has its own lobby so can transition faster
//                 const delay = mode === "speed-round" ? 800 : 1500;
//                 setTimeout(() => setViewMode("game"), delay);
//               }}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // ── Game Modes ─────────────────────────────────────────────────────────────
//   return (
//     <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//       {gameMode === "hint-based" && (
//         <GameTransition id="hint-based-game">
//           <HintBasedGame onBackToMenu={handleBackToMenu} />
//         </GameTransition>
//       )}

//       {gameMode === "flag-quiz" && (
//         <GameTransition id="flag-quiz-game">
//           <FlagQuizGame onBackToMenu={handleBackToMenu} />
//         </GameTransition>
//       )}

//       {gameMode === "capital-city" && (
//         <GameTransition id="capital-city-game">
//           <CapitalCityGame onBackToMenu={handleBackToMenu} />
//         </GameTransition>
//       )}

//       {gameMode === "speed-round" && (
//         <GameTransition id="speed-round-game">
//           <SpeedRoundGame onBackToMenu={handleBackToMenu} />
//         </GameTransition>
//       )}

//       {(gameMode === "classic" || gameMode === null) && (
//         <GameTransition id="classic-game">
//           <ClassicGame onBackToMenu={handleBackToMenu} />
//         </GameTransition>
//       )}
//     </div>
//   );
// }








// // App.tsx - Updated with Daily Challenge + all 6 game modes
// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { FlagQuizGame } from "@/app/components/FlagQuizGame";
// import { CapitalCityGame } from "@/app/components/CapitalCityGame";
// import { SpeedRoundGame } from "@/app/components/SpeedRoundGame";
// import { DailyChallenge } from "@/app/components/DailyChallenge";
// import { Globe3D } from "@/app/components/Globe3D";
// import ClassicGame from "@/app/components/ClassicGame";

// type GameMode =
//   | "classic"
//   | "hint-based"
//   | "flag-quiz"
//   | "capital-city"
//   | "speed-round"
//   | "daily-challenge"
//   | null;

// type ViewMode = "globe" | "mode-select" | "game";

// function GameTransition({ children, id }: { children: React.ReactNode; id: string }) {
//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={id}
//         initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//         animate={{
//           scale: 1, opacity: 1, filter: "blur(0px)",
//           transition: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] },
//         }}
//         exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.4 } }}
//         style={{ width: "100%", height: "100%" }}
//       >
//         {children}
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// export default function App() {
//   const [viewMode, setViewMode] = useState<ViewMode>("globe");
//   const [gameMode, setGameMode] = useState<GameMode>(null);

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => { document.body.style.overflow = ""; };
//   }, []);

//   const handleBackToMenu = () => {
//     setGameMode(null);
//     setViewMode("mode-select");
//   };

//   // ── 3D Globe ──────────────────────────────────────────────────────────────
//   if (viewMode === "globe") {
//     return (
//       <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="globe"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
//             style={{ width: "100%", height: "100%" }}
//           >
//             <Globe3D onTransitionToMap={() => setViewMode("mode-select")} showButton={true} />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // ── Mode Selector ──────────────────────────────────────────────────────────
//   if (viewMode === "mode-select" && gameMode === null) {
//     return (
//       <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="mode-select"
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{
//               opacity: 0, scale: 15,
//               transition: { duration: 1.4, ease: [0.6, 0.01, 0.05, 0.95] },
//             }}
//             style={{ width: "100%", height: "100%", transformOrigin: "center center" }}
//           >
//             <GameModeSelector
//               onSelectMode={(mode) => {
//                 setGameMode(mode);
//                 // Daily & Speed have their own lobby, transition faster
//                 const delay = mode === "speed-round" || mode === "daily-challenge" ? 700 : 1400;
//                 setTimeout(() => setViewMode("game"), delay);
//               }}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // ── Game Modes ─────────────────────────────────────────────────────────────
//   return (
//     <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//       {gameMode === "hint-based" && (
//         <GameTransition id="hint-based"><HintBasedGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {gameMode === "flag-quiz" && (
//         <GameTransition id="flag-quiz"><FlagQuizGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {gameMode === "capital-city" && (
//         <GameTransition id="capital-city"><CapitalCityGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {gameMode === "speed-round" && (
//         <GameTransition id="speed-round"><SpeedRoundGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {gameMode === "daily-challenge" && (
//         <GameTransition id="daily-challenge"><DailyChallenge onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {(gameMode === "classic" || gameMode === null) && (
//         <GameTransition id="classic"><ClassicGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//     </div>
//   );
// }







// // App.tsx - All 7 game modes routed
// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { FlagQuizGame } from "@/app/components/FlagQuizGame";
// import { CapitalCityGame } from "@/app/components/CapitalCityGame";
// import { SpeedRoundGame } from "@/app/components/SpeedRoundGame";
// import { DailyChallenge } from "@/app/components/DailyChallenge";
// import { ContinentStudyGame } from "@/app/components/ContinentStudyGame";
// import { Globe3D } from "@/app/components/Globe3D";
// import ClassicGame from "@/app/components/ClassicGame";

// type GameMode =
//   | "classic"
//   | "hint-based"
//   | "flag-quiz"
//   | "capital-city"
//   | "speed-round"
//   | "daily-challenge"
//   | "continent-study"
//   | null;

// type ViewMode = "globe" | "mode-select" | "game";

// function GameTransition({ children, id }: { children: React.ReactNode; id: string }) {
//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={id}
//         initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//         animate={{
//           scale: 1, opacity: 1, filter: "blur(0px)",
//           transition: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] },
//         }}
//         exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.4 } }}
//         style={{ width: "100%", height: "100%" }}
//       >
//         {children}
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// export default function App() {
//   const [viewMode, setViewMode] = useState<ViewMode>("globe");
//   const [gameMode, setGameMode] = useState<GameMode>(null);

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => { document.body.style.overflow = ""; };
//   }, []);

//   const handleBackToMenu = () => {
//     setGameMode(null);
//     setViewMode("mode-select");
//   };

//   // ── 3D Globe intro ────────────────────────────────────────────────────────
//   if (viewMode === "globe") {
//     return (
//       <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="globe"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
//             style={{ width: "100%", height: "100%" }}
//           >
//             <Globe3D onTransitionToMap={() => setViewMode("mode-select")} showButton={true} />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // ── Mode Selector ─────────────────────────────────────────────────────────
//   if (viewMode === "mode-select" && gameMode === null) {
//     return (
//       <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="mode-select"
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{
//               opacity: 0, scale: 15,
//               transition: { duration: 1.4, ease: [0.6, 0.01, 0.05, 0.95] },
//             }}
//             style={{ width: "100%", height: "100%", transformOrigin: "center center" }}
//           >
//             <GameModeSelector
//               onSelectMode={(mode) => {
//                 setGameMode(mode);
//                 const quickModes = ["speed-round", "daily-challenge", "continent-study"];
//                 const delay = quickModes.includes(mode) ? 700 : 1400;
//                 setTimeout(() => setViewMode("game"), delay);
//               }}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // ── Game Modes ────────────────────────────────────────────────────────────
//   return (
//     <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
//       {gameMode === "hint-based" && (
//         <GameTransition id="hint-based"><HintBasedGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {gameMode === "flag-quiz" && (
//         <GameTransition id="flag-quiz"><FlagQuizGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {gameMode === "capital-city" && (
//         <GameTransition id="capital-city"><CapitalCityGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {gameMode === "speed-round" && (
//         <GameTransition id="speed-round"><SpeedRoundGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {gameMode === "daily-challenge" && (
//         <GameTransition id="daily-challenge"><DailyChallenge onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {gameMode === "continent-study" && (
//         <GameTransition id="continent-study"><ContinentStudyGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//       {(gameMode === "classic" || gameMode === null) && (
//         <GameTransition id="classic"><ClassicGame onBackToMenu={handleBackToMenu} /></GameTransition>
//       )}
//     </div>
//   );
// }





// // App.tsx - FAB at root = visible on EVERY screen (globe, mode selector, all 7 game modes)
// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { FlagQuizGame } from "@/app/components/FlagQuizGame";
// import { CapitalCityGame } from "@/app/components/CapitalCityGame";
// import { SpeedRoundGame } from "@/app/components/SpeedRoundGame";
// import { DailyChallenge } from "@/app/components/DailyChallenge";
// import { ContinentStudyGame } from "@/app/components/ContinentStudyGame";
// import { Globe3D } from "@/app/components/Globe3D";
// import { GameFAB } from "@/app/components/GameFAB";
// import ClassicGame from "@/app/components/ClassicGame";

// type GameMode =
//   | "classic"
//   | "hint-based"
//   | "flag-quiz"
//   | "capital-city"
//   | "speed-round"
//   | "daily-challenge"
//   | "continent-study"
//   | null;

// type ViewMode = "globe" | "mode-select" | "game";

// function GameTransition({ children, id }: { children: React.ReactNode; id: string }) {
//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={id}
//         initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//         animate={{
//           scale: 1, opacity: 1, filter: "blur(0px)",
//           transition: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] },
//         }}
//         exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.4 } }}
//         style={{ width: "100%", height: "100%" }}
//       >
//         {children}
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// export default function App() {
//   const [viewMode, setViewMode] = useState<ViewMode>("globe");
//   const [gameMode, setGameMode] = useState<GameMode>(null);

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => { document.body.style.overflow = ""; };
//   }, []);

//   const handleBackToMenu = () => {
//     setGameMode(null);
//     setViewMode("mode-select");
//   };

//   const renderContent = () => {
//     if (viewMode === "globe") {
//       return (
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="globe"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
//             style={{ width: "100%", height: "100%" }}
//           >
//             <Globe3D onTransitionToMap={() => setViewMode("mode-select")} showButton={true} />
//           </motion.div>
//         </AnimatePresence>
//       );
//     }

//     if (viewMode === "mode-select" && gameMode === null) {
//       return (
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="mode-select"
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{
//               opacity: 0, scale: 15,
//               transition: { duration: 1.4, ease: [0.6, 0.01, 0.05, 0.95] },
//             }}
//             style={{ width: "100%", height: "100%", transformOrigin: "center center" }}
//           >
//             <GameModeSelector
//               onSelectMode={(mode) => {
//                 setGameMode(mode);
//                 const quickModes = ["speed-round", "daily-challenge", "continent-study"];
//                 const delay = quickModes.includes(mode) ? 700 : 1400;
//                 setTimeout(() => setViewMode("game"), delay);
//               }}
//             />
//           </motion.div>
//         </AnimatePresence>
//       );
//     }

//     return (
//       <>
//         {gameMode === "hint-based" && (
//           <GameTransition id="hint-based"><HintBasedGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {gameMode === "flag-quiz" && (
//           <GameTransition id="flag-quiz"><FlagQuizGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {gameMode === "capital-city" && (
//           <GameTransition id="capital-city"><CapitalCityGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {gameMode === "speed-round" && (
//           <GameTransition id="speed-round"><SpeedRoundGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {gameMode === "daily-challenge" && (
//           <GameTransition id="daily-challenge"><DailyChallenge onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {gameMode === "continent-study" && (
//           <GameTransition id="continent-study"><ContinentStudyGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {(gameMode === "classic" || gameMode === null) && (
//           <GameTransition id="classic"><ClassicGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//       </>
//     );
//   };

//   return (
//     // Position relative so the fixed FAB stacks above everything
//     <div style={{ overflow: "hidden", width: "100vw", height: "100vh", position: "relative" }}>
//       {renderContent()}

//       {/* ── GLOBAL FAB — always rendered on top of everything ── */}
//       <GameFAB />
//     </div>
//   );
// }


// //LATEST BEFORE BACKEND INTEGRATION

// // App.tsx - FAB at root = visible on EVERY screen (globe, mode selector, all 7 game modes)
// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import { GameModeSelector } from "@/app/components/GameModeSelector";
// import { HintBasedGame } from "@/app/components/HintBasedGame";
// import { FlagQuizGame } from "@/app/components/FlagQuizGame";
// import { CapitalCityGame } from "@/app/components/CapitalCityGame";
// import { SpeedRoundGame } from "@/app/components/SpeedRoundGame";
// import { DailyChallenge } from "@/app/components/DailyChallenge";
// import { ContinentStudyGame } from "@/app/components/ContinentStudyGame";
// import { Globe3D } from "@/app/components/Globe3D";
// import { GameFAB } from "@/app/components/GameFAB";
// import ClassicGame from "@/app/components/ClassicGame";

// type GameMode =
//   | "classic"
//   | "hint-based"
//   | "flag-quiz"
//   | "capital-city"
//   | "speed-round"
//   | "daily-challenge"
//   | "continent-study"
//   | null;

// type ViewMode = "globe" | "mode-select" | "game";

// function GameTransition({ children, id }: { children: React.ReactNode; id: string }) {
//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={id}
//         initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
//         animate={{
//           scale: 1, opacity: 1, filter: "blur(0px)",
//           transition: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] },
//         }}
//         exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.4 } }}
//         style={{ width: "100%", height: "100%" }}
//       >
//         {children}
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// export default function App() {
//   const [viewMode, setViewMode] = useState<ViewMode>("globe");
//   const [gameMode, setGameMode] = useState<GameMode>(null);

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => { document.body.style.overflow = ""; };
//   }, []);

//   const handleBackToMenu = () => {
//     setGameMode(null);
//     setViewMode("mode-select");
//   };

//   const renderContent = () => {
//     if (viewMode === "globe") {
//       return (
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="globe"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
//             style={{ width: "100%", height: "100%" }}
//           >
//             <Globe3D onTransitionToMap={() => setViewMode("mode-select")} showButton={true} />
//           </motion.div>
//         </AnimatePresence>
//       );
//     }

//     if (viewMode === "mode-select" && gameMode === null) {
//       return (
//         <AnimatePresence mode="wait">
//           <motion.div
//             key="mode-select"
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{
//               opacity: 0, scale: 15,
//               transition: { duration: 1.4, ease: [0.6, 0.01, 0.05, 0.95] },
//             }}
//             style={{ width: "100%", height: "100%", transformOrigin: "center center" }}
//           >
//             <GameModeSelector
//               onSelectMode={(mode) => {
//                 setGameMode(mode);
//                 const quickModes = ["speed-round", "daily-challenge", "continent-study"];
//                 const delay = quickModes.includes(mode) ? 700 : 1400;
//                 setTimeout(() => setViewMode("game"), delay);
//               }}
//             />
//           </motion.div>
//         </AnimatePresence>
//       );
//     }

//     return (
//       <>
//         {gameMode === "hint-based" && (
//           <GameTransition id="hint-based"><HintBasedGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {gameMode === "flag-quiz" && (
//           <GameTransition id="flag-quiz"><FlagQuizGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {gameMode === "capital-city" && (
//           <GameTransition id="capital-city"><CapitalCityGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {gameMode === "speed-round" && (
//           <GameTransition id="speed-round"><SpeedRoundGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {gameMode === "daily-challenge" && (
//           <GameTransition id="daily-challenge"><DailyChallenge onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {gameMode === "continent-study" && (
//           <GameTransition id="continent-study"><ContinentStudyGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//         {(gameMode === "classic" || gameMode === null) && (
//           <GameTransition id="classic"><ClassicGame onBackToMenu={handleBackToMenu} /></GameTransition>
//         )}
//       </>
//     );
//   };

//   return (
//     // Position relative so the fixed FAB stacks above everything
//     <div style={{ overflow: "hidden", width: "100vw", height: "100vh", position: "relative" }}>
//       {renderContent()}

//       {/* ── GLOBAL FAB — always rendered on top of everything ── */}
//       <GameFAB />
//     </div>
//   );
// }


// Party mode.If there is error go back here
// App.tsx - Guest access allowed for solo modes; multiplayer requires auth
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameModeSelector } from "@/app/components/GameModeSelector";
import { HintBasedGame } from "@/app/components/HintBasedGame";
import { FlagQuizGame } from "@/app/components/FlagQuizGame";
import { CapitalCityGame } from "@/app/components/CapitalCityGame";
import { SpeedRoundGame } from "@/app/components/SpeedRoundGame";
import { DailyChallenge } from "@/app/components/DailyChallenge";
import { ContinentStudyGame } from "@/app/components/ContinentStudyGame";
import { Globe3D } from "@/app/components/Globe3D";
import { GameFAB } from "@/app/components/GameFAB";
import { AuthScreen } from "@/app/components/AuthScreen";
import { MultiplayerGame } from "@/app/components/MultiplayerGame";
import ClassicGame from "@/app/components/ClassicGame";
import { useAuth } from "@/app/hooks/useAuth";

type GameMode =
  | "classic"
  | "hint-based"
  | "flag-quiz"
  | "capital-city"
  | "speed-round"
  | "daily-challenge"
  | "continent-study"
  | "multiplayer"
  | null;

type ViewMode = "globe" | "mode-select" | "game" | "auth";

const SESSION_MATCH_KEY = "mp_active_match_id";

function GameTransition({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ scale: 0.1, opacity: 0, filter: "blur(30px)" }}
        animate={{
          scale: 1, opacity: 1, filter: "blur(0px)",
          transition: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] },
        }}
        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.4 } }}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { user, state: authState, error, loading, login, register, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("globe");
  const [gameMode, setGameMode] = useState<GameMode>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Stored match id (if any) is passed to MultiplayerGame so its lobby can show reconnect UI
  const pendingMatchId = sessionStorage.getItem(SESSION_MATCH_KEY);

  const handleBackToMenu = () => {
    setGameMode(null);
    setViewMode("mode-select");
  };

  // ── Loading spinner while verifying token ─────────────────────────────────
  if (authState === "loading") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ── If user went to auth screen (from multiplayer button or FAB), show it ──
  if (viewMode === "auth") {
    if (authState === "authenticated") {
      // Auth succeeded — go back to where they came from
      setViewMode("mode-select");
    } else {
      return (
        <AuthScreen
          onLogin={login}
          onRegister={register}
          loading={loading}
          error={error}
          onBack={() => setViewMode("mode-select")}  // guest can go back
        />
      );
    }
  }

  // ── Main app — accessible to guests AND logged-in users ───────────────────
  const renderContent = () => {
    if (viewMode === "globe") {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="globe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
            style={{ width: "100%", height: "100%" }}
          >
            <Globe3D onTransitionToMap={() => setViewMode("mode-select")} showButton={true} />
          </motion.div>
        </AnimatePresence>
      );
    }

    if (viewMode === "mode-select" && gameMode === null) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0, scale: 15,
              transition: { duration: 1.4, ease: [0.6, 0.01, 0.05, 0.95] },
            }}
            style={{ width: "100%", height: "100%", transformOrigin: "center center" }}
          >
            <GameModeSelector
              onSelectMode={(mode) => {
                // Multiplayer requires auth — redirect to auth screen
                if (mode === "multiplayer" && authState !== "authenticated") {
                  setViewMode("auth");
                  return;
                }
                setGameMode(mode);
                const quickModes = ["speed-round", "daily-challenge", "continent-study", "multiplayer"];
                const delay = quickModes.includes(mode) ? 700 : 1400;
                setTimeout(() => setViewMode("game"), delay);
              }}
            />
          </motion.div>
        </AnimatePresence>
      );
    }

    return (
      <>
        {gameMode === "hint-based" && (
          <GameTransition id="hint-based">
            <HintBasedGame onBackToMenu={handleBackToMenu} />
          </GameTransition>
        )}
        {gameMode === "flag-quiz" && (
          <GameTransition id="flag-quiz">
            <FlagQuizGame onBackToMenu={handleBackToMenu} />
          </GameTransition>
        )}
        {gameMode === "capital-city" && (
          <GameTransition id="capital-city">
            <CapitalCityGame onBackToMenu={handleBackToMenu} />
          </GameTransition>
        )}
        {gameMode === "speed-round" && (
          <GameTransition id="speed-round">
            <SpeedRoundGame onBackToMenu={handleBackToMenu} />
          </GameTransition>
        )}
        {gameMode === "daily-challenge" && (
          <GameTransition id="daily-challenge">
            <DailyChallenge onBackToMenu={handleBackToMenu} />
          </GameTransition>
        )}
        {gameMode === "continent-study" && (
          <GameTransition id="continent-study">
            <ContinentStudyGame onBackToMenu={handleBackToMenu} />
          </GameTransition>
        )}
        {gameMode === "multiplayer" && (
          <GameTransition id="multiplayer">
            <MultiplayerGame
              onBackToMenu={handleBackToMenu}
              user={user}
              initialMatchId={pendingMatchId}
            />
          </GameTransition>
        )}
        {(gameMode === "classic" || gameMode === null) && (
          <GameTransition id="classic">
            <ClassicGame onBackToMenu={handleBackToMenu} />
          </GameTransition>
        )}
      </>
    );
  };

  return (
    <div style={{ overflow: "hidden", width: "100vw", height: "100vh", position: "relative" }}>
      {renderContent()}

      {/* GLOBAL FAB — passes onShowAuth so guest can sign in from anywhere */}
      <GameFAB
        onLogout={logout}
        user={user}
        onShowAuth={() => setViewMode("auth")}
      />
    </div>
  );
}




