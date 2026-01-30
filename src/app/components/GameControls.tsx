import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, HelpCircle, Check, X, Globe } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

interface GameControlsProps {
  selectedCountryName: string | null;
  onGuess: (name: string) => void;
  onHint: () => void;
  score: number;
  totalCountries: number;
  allCountryNames: string[];
}

export function GameControls({
  selectedCountryName,
  onGuess,
  onHint,
  score,
  totalCountries,
  allCountryNames
}: GameControlsProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (selectedCountryName) {
      setInput("");
      setShowSuggestions(false);
    }
  }, [selectedCountryName]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    onGuess(input.trim());
    setInput("");
    setShowSuggestions(false);
  };

  const filteredSuggestions = input.length > 0
    ? allCountryNames.filter(name => 
        name.toLowerCase().startsWith(input.toLowerCase()) || 
        name.toLowerCase().includes(input.toLowerCase())
      )
      // Sort to prioritize startsWith matches
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(input.toLowerCase());
        const bStarts = b.toLowerCase().startsWith(input.toLowerCase());
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 100) 
    : [];

  return (
    <>
      {/* Top Bar - Stats */}
      <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[300px] z-10 pointer-events-none">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg rounded-full px-6 py-3 flex items-center justify-between pointer-events-auto border border-white/20">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-lg">{score} <span className="text-muted-foreground text-sm font-normal">/ {totalCountries}</span></span>
          </div>
          <h1 className="hidden md:block font-bold text-foreground/80 ml-4">Country Guessor</h1>
        </div>
      </div>

      {/* Bottom Interaction Area */}
      <AnimatePresence>
        {selectedCountryName && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-20"
          >
            <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Selected Country</span>
                </div>
                <button
                  onClick={onHint}
                  className="text-xs flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium px-2 py-1 rounded-md hover:bg-orange-50 transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                  Hint
                </button>
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type country name..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 text-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-border/50 overflow-hidden max-h-[200px] overflow-y-auto">
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setInput(suggestion);
                          onGuess(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-border/50 last:border-0 transition-colors flex items-center gap-2"
                      >
                        <Search className="w-3 h-3 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!selectedCountryName && (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm"
        >
          Click on a country to guess it
        </motion.div>
      )}
    </>
  );
}
