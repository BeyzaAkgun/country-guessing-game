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




