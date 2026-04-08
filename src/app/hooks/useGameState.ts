// useGameState.ts 
import { useState, useEffect } from "react";

export interface Hint {
  id: string;
  countryName: string;
  text: string;
  type: "continent" | "fact" | "capital" | "flag";
  timestamp: number;
}

interface GameState {
  correctCountries: string[];
  wrongCountries: string[];
  score: number;
  hints: Hint[];
  selectedCountry?: string | null;  // NEW: For Classic mode
  targetCountry?: string | null;    // NEW: For Hint-Based mode
}

const getStorageKey = (mode?: string) => {
  return mode ? `gameState_${mode}` : "gameState";
};

export function useGameState(mode?: "classic" | "hint-based") {
  const storageKey = getStorageKey(mode);

  // Initialize state from localStorage only once
  const [state, setState] = useState<GameState>(() => {
    if (typeof window === "undefined") {
      return { 
        correctCountries: [], 
        wrongCountries: [], 
        score: 0,
        hints: [],
        selectedCountry: null,
        targetCountry: null
      };
    }
    
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all fields exist (backward compatibility)
        return {
          correctCountries: parsed.correctCountries || [],
          wrongCountries: parsed.wrongCountries || [],
          score: parsed.score || 0,
          hints: Array.isArray(parsed.hints) ? parsed.hints : [],
          selectedCountry: parsed.selectedCountry || null,
          targetCountry: parsed.targetCountry || null
        };
      } catch (err) {
        console.error("Failed to parse saved game state:", err);
        localStorage.removeItem(storageKey);
      }
    }
    
    return { 
      correctCountries: [], 
      wrongCountries: [], 
      score: 0,
      hints: [],
      selectedCountry: null,
      targetCountry: null
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const addHint = (hint: Omit<Hint, "id" | "timestamp">) => {
    const newHint: Hint = {
      ...hint,
      id: `hint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    setState(prev => {
      const currentHints = Array.isArray(prev.hints) ? prev.hints : [];
      return {
        ...prev,
        hints: [...currentHints, newHint]
      };
    });
    
    return newHint;
  };

  const removeHint = (hintId: string) => {
    setState(prev => {
      const currentHints = Array.isArray(prev.hints) ? prev.hints : [];
      return {
        ...prev,
        hints: currentHints.filter(h => h.id !== hintId)
      };
    });
  };

  // Clear all hints (called when country is guessed correctly)
  const clearHints = () => {
    setState(prev => ({
      ...prev,
      hints: []
    }));
  };

  // Set selected country (for Classic mode)
  const setSelectedCountry = (country: string | null) => {
    setState(prev => ({
      ...prev,
      selectedCountry: country
    }));
  };

  // Set target country (for Hint-Based mode)
  const setTargetCountry = (country: string | null) => {
    setState(prev => ({
      ...prev,
      targetCountry: country
    }));
  };

  // Reset only this mode's state
  const resetState = () => {
    const emptyState: GameState = { 
      correctCountries: [], 
      wrongCountries: [], 
      score: 0,
      hints: [],
      selectedCountry: null,
      targetCountry: null
    };
    setState(emptyState);
    localStorage.removeItem(storageKey);
  };

  return { 
    state, 
    setState, 
    addHint, 
    removeHint, 
    clearHints, 
    setSelectedCountry,
    setTargetCountry,
    resetState 
  };
}