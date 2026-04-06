// xpSystem.ts - XP and levelling system
export interface XPState {
  totalXP: number;
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
}

const LEVEL_TITLES: Record<number, string> = {
  1: "Map Rookie", 2: "Explorer", 3: "Traveller", 4: "Navigator",
  5: "Geographer", 6: "Cartographer", 7: "World Scholar",
  8: "Globe Trotter", 9: "Atlas Master", 10: "Geography Legend",
};

const LEVEL_THRESHOLDS = [0, 50, 130, 250, 420, 650, 950, 1330, 1800, 2400, 3100];

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) { level = i + 1; break; }
  }
  return Math.min(level, 10);
}

export function getXPState(totalXP: number): XPState {
  const level = getLevelFromXP(totalXP);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return {
    totalXP, level,
    xpInCurrentLevel: totalXP - currentThreshold,
    xpForNextLevel: level >= 10 ? 0 : nextThreshold - currentThreshold,
  };
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] ?? "Geography Legend";
}

export interface XPRewardConfig {
  mode: "classic" | "hint-based" | "flag-quiz" | "capital-city" | "speed-round" | "daily-challenge" | "continent-study";
  streak?: number;
  usedHints?: boolean;
  isDaily?: boolean;
}

export function calculateXPReward(config: XPRewardConfig): { xp: number; breakdown: string[] } {
  const breakdown: string[] = [];
  let xp = 0;
  const baseXP: Record<XPRewardConfig["mode"], number> = {
    "classic": 10, "hint-based": 12, "flag-quiz": 12,
    "capital-city": 15, "speed-round": 8, "daily-challenge": 18, "continent-study": 10,
  };
  const base = baseXP[config.mode];
  xp += base;
  breakdown.push(`+${base} correct answer`);
  if (config.streak && config.streak >= 3) {
    const streakBonus = Math.min(Math.floor(config.streak / 3) * 3, 15);
    xp += streakBonus;
    breakdown.push(`+${streakBonus} streak bonus (×${config.streak})`);
  }
  if (config.usedHints === false && ["classic", "hint-based", "continent-study"].includes(config.mode)) {
    xp += 5;
    breakdown.push(`+5 no hints used`);
  }
  if (config.isDaily) { xp += 10; breakdown.push(`+10 daily challenge`); }
  return { xp, breakdown };
}

const STORAGE_KEY = "geogame_totalXP";

export function loadTotalXP(): number {
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0; } catch { return 0; }
}

export function saveTotalXP(xp: number): void {
  try { localStorage.setItem(STORAGE_KEY, String(xp)); } catch {}
}

export function addXP(amount: number): { newTotal: number; newState: XPState; didLevelUp: boolean; newLevel: number } {
  const oldTotal = loadTotalXP();
  const oldLevel = getLevelFromXP(oldTotal);
  const newTotal = oldTotal + amount;
  saveTotalXP(newTotal);
  const newLevel = getLevelFromXP(newTotal);
  return { newTotal, newState: getXPState(newTotal), didLevelUp: newLevel > oldLevel, newLevel };
}