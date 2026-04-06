// FlagQuizGame.tsx - Flag Quiz Mode: See flag, find country
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
import { Loader2, Flag, ChevronUp, ChevronDown } from "lucide-react";
import { useGameState } from "@/app/hooks/useGameState";
import { soundEffects } from "@/app/utils/soundEffects";

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

  const startNewRound = () => {
    if (remainingCountries.length === 0) {
      toast.success("🎉 Congratulations! You've identified all flags!", { duration: 5000 });
      return;
    }
    const randomIndex = Math.floor(Math.random() * remainingCountries.length);
    const randomCountry = remainingCountries[randomIndex];

    const code = getCountryCode(randomCountry);
    console.log(`Target country: "${randomCountry}" | Code: "${code}"`);

    setLocalTargetCountry(randomCountry);
    saveTargetCountry(randomCountry);
    setFlagUrl(`https://flagcdn.com/w320/${code}.png`);
    setSelectedCountryName(null);
    setFlagVisible(true); // always show flag at start of new round
  };

  useEffect(() => {
    if (countries.length === 0 || waitingForNextRound) return;
    if (targetCountry && !correctCountries.includes(targetCountry)) {
      setLocalTargetCountry(targetCountry);
      const code = getCountryCode(targetCountry);
      setFlagUrl(`https://flagcdn.com/w320/${code}.png`);
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

    setTotalGuesses(prev => prev + 1);

    if (normalizedGuess === normalizedTarget) {
      if (soundEnabled) soundEffects.playCorrect();
      toast.success(`🎉 Correct! That's the flag of ${localTargetCountry}!`, {
        duration: 2000,
        className: "bg-green-50 text-green-800 border-green-200",
      });

      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      const newScore = score + 1;

      setState({
        ...state,
        correctCountries: [...correctCountries, localTargetCountry],
        wrongCountries: wrongCountries.filter(c => c !== localTargetCountry),
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
      }, 2000);
    } else {
      if (soundEnabled) soundEffects.playWrong();
      toast.error(`Wrong! That's ${selectedCountryName}, not the flag we're looking for.`, {
        description: "Look at the flag carefully and try again!",
        duration: 3000,
      });
      setCurrentStreak(0);
      if (!wrongCountries.includes(selectedCountryName)) {
        setState({ ...state, wrongCountries: [...wrongCountries, selectedCountryName] });
      }
      setSelectedCountryName(null);
    }
  };

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart this game? All progress will be lost.")) {
      resetState();
      setLocalTargetCountry(null);
      setSelectedCountryName(null);
      setWaitingForNextRound(false);
      setTotalGuesses(0);
      setCurrentStreak(0);
      setBestStreak(0);
      setAchievements(defaultAchievements);
      toast.success("Game restarted!");
    }
  };

  const handleBackToMenu = () => {
    onBackToMenu();
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
              onGuess={handleGuess}
              onHint={() => {}}
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
          onGuess={handleGuess}
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