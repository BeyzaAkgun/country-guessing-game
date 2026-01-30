import React, { useState, useMemo } from "react";
import WorldMap from "@/app/components/WorldMap";
import { GameControls } from "@/app/components/GameControls";
import { useCountryData } from "@/app/hooks/useCountryData";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";

export default function App() {
  const { countries, loading } = useCountryData();
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [correctCountries, setCorrectCountries] = useState<string[]>([]);
  const [wrongCountries, setWrongCountries] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const allCountryNames = useMemo(() => countries.map(c => c.properties.name), [countries]);

  const handleCountryClick = (geo: any) => {
    const name = geo.properties.name || geo.name;
    if (correctCountries.includes(name)) {
      toast.info(`You already found ${name}!`);
      return;
    }
    setSelectedCountryName(name);
  };

  const handleGuess = (guess: string) => {
    if (!selectedCountryName) return;

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedTarget = selectedCountryName.toLowerCase().trim();

    if (normalizedGuess === normalizedTarget) {
      // Correct
      toast.success(`Correct! It is ${selectedCountryName}`, {
        duration: 2000,
        className: "bg-green-50 text-green-800 border-green-200"
      });
      setCorrectCountries(prev => [...prev, selectedCountryName]);
      setScore(s => s + 1);
      setSelectedCountryName(null);
      // Remove from wrong list if it was there previously (optional, but cleaner)
      setWrongCountries(prev => prev.filter(c => c !== selectedCountryName));
    } else {
      // Wrong
      toast.error("Incorrect, try again!", {
        description: "Or use a hint if you're stuck."
      });
      setWrongCountries(prev => prev.includes(selectedCountryName) ? prev : [...prev, selectedCountryName]);
    }
  };

  const handleHint = () => {
    if (!selectedCountryName) return;
    // Simple hint: First letter
    const firstLetter = selectedCountryName.charAt(0);
    const length = selectedCountryName.length;
    toast.message("Hint", {
      description: `Starts with "${firstLetter}" and has ${length} letters.`
    });
  };

  // if (loading) {
  //   return (
  //     <div className="size-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
  //       <div className="flex flex-col items-center gap-4">
  //         <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
  //         <p className="text-muted-foreground font-medium">Loading World Map...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (loading) {
  return (
    <div className="w-screen h-screen relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-muted-foreground font-medium">Loading World Map...</p>
      </div>
    </div>
  );
}


  return (
    <div className="size-full relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <WorldMap
          countries={countries}
          onCountryClick={handleCountryClick}
          selectedCountryName={selectedCountryName}
          correctCountries={correctCountries}
          wrongCountries={wrongCountries}
        />
        {/* <div style={{height: 400, background: "red"}}>
        MAP SHOULD BE HERE
         </div> */}
      </div>

      {/* UI Layer */}
      <GameControls
        selectedCountryName={selectedCountryName}
        onGuess={handleGuess}
        onHint={handleHint}
        score={score}
        totalCountries={countries.length}
        allCountryNames={allCountryNames}
      />
    </div>
  );
}

// export default function App() {
//   return (
//     <div style={{ padding: 40, fontSize: 24 }}>
//       COUNTRY GAME UI BOOT OK
//     </div>
//   );
// }
