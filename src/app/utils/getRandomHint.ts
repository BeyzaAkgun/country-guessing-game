// getRandomHint.ts - Updated: Tracks used hints to avoid duplicates
import { countryHints } from "@/app/data/countryHints";

export function getRandomHint(
  countryName: string, 
  usedHintTexts: string[] = []
): string | null {
  const hints = countryHints[countryName];

  if (!hints || hints.length === 0) {
    return null;
  }

  // Filter out hints that have already been used
  const availableHints = hints.filter(hint => !usedHintTexts.includes(hint.text));

  // If no hints available, return null
  if (availableHints.length === 0) {
    return null;
  }

  // Get random hint from available hints
  const randomIndex = Math.floor(Math.random() * availableHints.length);
  return availableHints[randomIndex].text;
}

// Helper function to get total hint count for a country
export function getTotalHintCount(countryName: string): number {
  const hints = countryHints[countryName];
  return hints ? hints.length : 0;
}

// Helper function to get remaining hint count
export function getRemainingHintCount(
  countryName: string, 
  usedHintTexts: string[]
): number {
  const hints = countryHints[countryName];
  if (!hints) return 0;
  
  const availableHints = hints.filter(hint => !usedHintTexts.includes(hint.text));
  return availableHints.length;
}