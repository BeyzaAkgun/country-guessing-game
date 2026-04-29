// // GameModeSelector.tsx - All 8 modes, TV-aware sizing
// import React from "react";
// import { motion } from "motion/react";
// import { Map, Lightbulb, Flag, Building2, Timer, Calendar, BookOpen, Swords } from "lucide-react";
// import { Globe3D } from "@/app/components/Globe3D";
// import { useDisplayMode } from "@/app/hooks/useDisplayMode";

// export type GameMode =
//   | "classic" | "hint-based" | "flag-quiz" | "capital-city"
//   | "speed-round" | "daily-challenge" | "continent-study"
//   | "multiplayer";

// interface GameModeSelectorProps {
//   onSelectMode: (mode: GameMode) => void;
// }

// interface CardDef {
//   icon: React.ReactNode; iconBg: string; title: string;
//   bullets: string[]; label: string; labelColor: string;
//   hoverGradient: string; accentDot: string;
//   badge?: string; badgeGradient?: string;
//   delay: number; initial: Record<string, number>; mode: GameMode;
// }

// function ModeCard({ card, onSelectMode, isTV }: {
//   card: CardDef; onSelectMode: (m: GameMode) => void; isTV: boolean;
// }) {
//   return (
//     <motion.button
//       initial={card.initial}
//       animate={{ x: 0, y: 0, opacity: 1 }}
//       transition={{ duration: 0.45, delay: card.delay }}
//       whileHover={{ scale: 1.04, y: -6 }} whileTap={{ scale: 0.97 }}
//       onClick={() => onSelectMode(card.mode)}
//       className="group relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-left overflow-hidden w-full h-full"
//       style={{ padding: isTV ? "28px 32px" : undefined }}
//     >
//       {card.badge && (
//         <div
//           className={`absolute top-2 right-2 bg-gradient-to-r ${card.badgeGradient ?? "from-yellow-400 to-orange-500"} text-white font-black px-2 py-0.5 rounded-full shadow z-10 uppercase tracking-wide`}
//           style={{ fontSize: isTV ? 14 : 9 }}
//         >
//           {card.badge}
//         </div>
//       )}
//       <div className={`absolute inset-0 ${card.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
//       <div className="relative z-10 flex flex-col h-full" style={isTV ? {} : { padding: "12px 20px 12px 20px" }}>
//         <div className="flex items-center gap-3 mb-3">
//           <div className={`${card.iconBg} rounded-xl flex-shrink-0`} style={{ padding: isTV ? 14 : 8 }}>
//             {card.icon}
//           </div>
//           <h2
//             className="font-bold text-slate-900 dark:text-white leading-tight"
//             style={{ fontSize: isTV ? 28 : undefined }}
//           >
//             {card.title}
//           </h2>
//         </div>
//         <div className="space-y-1 mb-3 flex-1">
//           {card.bullets.map(b => (
//             <div key={b} className="flex items-start gap-2">
//               <div
//                 className={`${card.accentDot} rounded-full flex-shrink-0`}
//                 style={{ width: isTV ? 8 : 4, height: isTV ? 8 : 4, marginTop: isTV ? 9 : 6 }}
//               />
//               <p
//                 className="text-slate-600 dark:text-slate-300 leading-snug"
//                 style={{ fontSize: isTV ? 20 : undefined }}
//               >
//                 {b}
//               </p>
//             </div>
//           ))}
//         </div>
//         <span
//           className={`font-black ${card.labelColor} uppercase tracking-widest`}
//           style={{ fontSize: isTV ? 14 : 9 }}
//         >
//           {card.label}
//         </span>
//       </div>
//     </motion.button>
//   );
// }

// export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
//   const { config } = useDisplayMode();
//   const isTV = config.isTV;
//   const iconSize = isTV ? "w-8 h-8" : "w-4 h-4 sm:w-5 sm:h-5";

//   const cards: CardDef[] = [
//     {
//       mode: "classic",
//       icon: <Map className={`${iconSize} text-blue-600 dark:text-blue-400`} />,
//       iconBg: "bg-blue-100 dark:bg-blue-900/30",
//       title: "Classic",
//       bullets: ["Click any country", "Use hints when stuck", "No time pressure"],
//       label: "For Beginners", labelColor: "text-blue-600 dark:text-blue-400",
//       hoverGradient: "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
//       accentDot: "bg-blue-500", delay: 0.10, initial: { x: -40, opacity: 0 },
//     },
//     {
//       mode: "hint-based",
//       icon: <Lightbulb className={`${iconSize} text-orange-600 dark:text-orange-400`} />,
//       iconBg: "bg-orange-100 dark:bg-orange-900/30",
//       title: "Hint-Based",
//       bullets: ["Hint shown first", "Find the country", "More challenging"],
//       label: "For Experts", labelColor: "text-orange-600 dark:text-orange-400",
//       hoverGradient: "bg-gradient-to-br from-orange-500/10 to-yellow-500/10",
//       accentDot: "bg-orange-500", delay: 0.16, initial: { y: 40, opacity: 0 },
//     },
//     {
//       mode: "flag-quiz",
//       icon: <Flag className={`${iconSize} text-green-600 dark:text-green-400`} />,
//       iconBg: "bg-green-100 dark:bg-green-900/30",
//       title: "Flag Quiz",
//       bullets: ["Flag shown", "Click the country", "Learn flag patterns"],
//       label: "Visual Learning", labelColor: "text-green-600 dark:text-green-400",
//       hoverGradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
//       accentDot: "bg-green-500", delay: 0.22, initial: { y: 40, opacity: 0 },
//     },
//     {
//       mode: "capital-city",
//       icon: <Building2 className={`${iconSize} text-purple-600 dark:text-purple-400`} />,
//       iconBg: "bg-purple-100 dark:bg-purple-900/30",
//       title: "Capitals",
//       bullets: ["Capital name shown", "Find on the map", "Skip if stuck"],
//       label: "Geography Pro", labelColor: "text-purple-600 dark:text-purple-400",
//       hoverGradient: "bg-gradient-to-br from-purple-500/10 to-indigo-500/10",
//       accentDot: "bg-purple-500", delay: 0.28, initial: { y: 40, opacity: 0 },
//     },
//     {
//       mode: "speed-round",
//       icon: <Timer className={`${iconSize} text-yellow-600 dark:text-yellow-400`} />,
//       iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
//       title: "Speed Round",
//       bullets: ["60 / 90 / 120s", "Every country = +1", "Beat your best"],
//       label: "Adrenaline Rush", labelColor: "text-yellow-600 dark:text-yellow-400",
//       hoverGradient: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10",
//       accentDot: "bg-yellow-500", delay: 0.34, initial: { y: 40, opacity: 0 },
//     },
//     {
//       mode: "daily-challenge",
//       icon: <Calendar className={`${iconSize} text-indigo-600 dark:text-indigo-400`} />,
//       iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
//       title: "Daily Challenge",
//       bullets: ["New puzzle daily", "Shareable results", "Track your streak"],
//       label: "Daily Puzzle", labelColor: "text-indigo-600 dark:text-indigo-400",
//       hoverGradient: "bg-gradient-to-br from-indigo-500/10 to-purple-500/10",
//       accentDot: "bg-indigo-500", delay: 0.40, initial: { y: 40, opacity: 0 },
//     },
//     {
//       mode: "continent-study",
//       icon: <BookOpen className={`${iconSize} text-amber-600 dark:text-amber-400`} />,
//       iconBg: "bg-amber-100 dark:bg-amber-900/30",
//       title: "Study Mode",
//       bullets: ["Pick a continent", "Track your progress", "Earn XP"],
//       label: "Learn & Earn", labelColor: "text-amber-600 dark:text-amber-400",
//       hoverGradient: "bg-gradient-to-br from-amber-500/10 to-orange-500/10",
//       accentDot: "bg-amber-500",
//       badge: "NEW", badgeGradient: "from-amber-500 to-orange-600",
//       delay: 0.46, initial: { x: 40, opacity: 0 },
//     },
//     {
//       mode: "multiplayer",
//       icon: <Swords className={`${iconSize} text-rose-600 dark:text-rose-400`} />,
//       iconBg: "bg-rose-100 dark:bg-rose-900/30",
//       title: "Multiplayer",
//       bullets: ["Match vs a real player", "10 rounds, fastest wins", "Earn rank points"],
//       label: "Ranked PvP", labelColor: "text-rose-600 dark:text-rose-400",
//       hoverGradient: "bg-gradient-to-br from-rose-500/10 to-pink-500/10",
//       accentDot: "bg-rose-500",
//       badge: "LIVE", badgeGradient: "from-rose-500 to-pink-600",
//       delay: 0.52, initial: { x: 40, opacity: 0 },
//     },
//   ];

//   return (
//     <div className="w-screen h-screen fixed inset-0 overflow-hidden">
//       <div className="absolute inset-0 z-0">
//         <Globe3D onTransitionToMap={() => {}} showButton={false} />
//       </div>
//       <div className="absolute inset-0 bg-black/50 z-10" />
//       <div className="relative z-20 w-full h-full overflow-y-auto">
//         <div
//           className="min-h-full flex items-center justify-center"
//           style={{ padding: isTV ? "48px 80px" : "12px 12px 24px" }}
//         >
//           <div className="w-full" style={{ maxWidth: isTV ? 1600 : 896 }}>
//             <motion.div
//               initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
//               transition={{ duration: 0.45 }}
//               className="text-center"
//               style={{ marginBottom: isTV ? 48 : 16 }}
//             >
//               <h1
//                 className="font-black text-white drop-shadow-2xl"
//                 style={{ fontSize: isTV ? 72 : undefined }}
//                 {...(!isTV && { className: "text-2xl sm:text-4xl md:text-5xl font-black text-white mb-1 drop-shadow-2xl" })}
//               >
//                 Choose Your Mode
//               </h1>
//               <p
//                 className="text-white/75"
//                 style={{ fontSize: isTV ? 28 : undefined }}
//                 {...(!isTV && { className: "text-xs sm:text-sm text-white/75" })}
//               >
//                 How do you want to explore the world?
//               </p>
//             </motion.div>

//             {/* Top 4 */}
//             <div
//               style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: isTV ? 24 : undefined, marginBottom: isTV ? 24 : undefined }}
//               className={isTV ? "" : "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-3"}
//             >
//               {cards.slice(0, 4).map(card =>
//                 <ModeCard key={card.mode} card={card} onSelectMode={onSelectMode} isTV={isTV} />
//               )}
//             </div>

//             {/* Bottom 4 — now 4 instead of 3 */}
//             <div
//               style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: isTV ? 24 : undefined }}
//               className={isTV ? "" : "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"}
//             >
//               {cards.slice(4).map(card =>
//                 <ModeCard key={card.mode} card={card} onSelectMode={onSelectMode} isTV={isTV} />
//               )}
//             </div>

//             <motion.p
//               initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
//               transition={{ duration: 0.45, delay: 0.58 }}
//               className="text-center text-white/55"
//               style={{ marginTop: isTV ? 40 : 16, fontSize: isTV ? 22 : 11 }}
//             >
//               Select a mode to begin your geography journey 🌍
//             </motion.p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// GameModeSelector.tsx - All 8 modes, TV-aware sizing, mobile-first responsive
import React from "react";
import { motion } from "motion/react";
import { Map, Lightbulb, Flag, Building2, Timer, Calendar, BookOpen, Swords } from "lucide-react";
import { Globe3D } from "@/app/components/Globe3D";
import { useDisplayMode } from "@/app/hooks/useDisplayMode";

export type GameMode =
  | "classic" | "hint-based" | "flag-quiz" | "capital-city"
  | "speed-round" | "daily-challenge" | "continent-study"
  | "multiplayer";

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
}

interface CardDef {
  icon: React.ReactNode; iconBg: string; title: string;
  bullets: string[]; label: string; labelColor: string;
  hoverGradient: string; accentDot: string;
  badge?: string; badgeGradient?: string;
  delay: number; initial: Record<string, number>; mode: GameMode;
}

function ModeCard({ card, onSelectMode, isTV }: {
  card: CardDef; onSelectMode: (m: GameMode) => void; isTV: boolean;
}) {
  return (
    <motion.button
      initial={card.initial}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: card.delay }}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelectMode(card.mode)}
      className="group relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 text-left overflow-hidden w-full h-full"
      style={isTV ? { padding: "28px 32px" } : undefined}
    >
      {/* Badge */}
      {card.badge && (
        <div
          className={`absolute top-2 right-2 bg-gradient-to-r ${card.badgeGradient ?? "from-yellow-400 to-orange-500"} text-white font-black px-2 py-0.5 rounded-full shadow z-10 uppercase tracking-wide`}
          style={{ fontSize: isTV ? 14 : 8 }}
        >
          {card.badge}
        </div>
      )}

      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 ${card.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col h-full"
        style={isTV ? {} : { padding: "10px 14px 10px 14px" }}
      >
        {/* Icon + title row */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`${card.iconBg} rounded-xl flex-shrink-0`}
            style={{ padding: isTV ? 14 : 7 }}
          >
            {card.icon}
          </div>
          <h2
            className="font-bold text-slate-900 dark:text-white leading-tight text-sm sm:text-base"
            style={isTV ? { fontSize: 28 } : undefined}
          >
            {card.title}
          </h2>
        </div>

        {/* Bullets — min 12px on mobile (readable), hidden on very small cards if needed */}
        <div className="space-y-0.5 mb-2 flex-1">
          {card.bullets.map(b => (
            <div key={b} className="flex items-start gap-1.5">
              <div
                className={`${card.accentDot} rounded-full flex-shrink-0 mt-1.5`}
                style={{ width: isTV ? 8 : 4, height: isTV ? 8 : 4 }}
              />
              <p
                className="text-slate-600 dark:text-slate-300 leading-snug text-[11px] sm:text-xs"
                style={isTV ? { fontSize: 20 } : undefined}
              >
                {b}
              </p>
            </div>
          ))}
        </div>

        {/* Label — must be readable, min 10px */}
        <span
          className={`font-black ${card.labelColor} uppercase tracking-widest text-[10px] sm:text-[11px]`}
          style={isTV ? { fontSize: 14 } : undefined}
        >
          {card.label}
        </span>
      </div>
    </motion.button>
  );
}

export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  const { config } = useDisplayMode();
  const isTV = config.isTV;
  // Icon sizes: slightly larger on mobile for tappability
  const iconSize = isTV ? "w-8 h-8" : "w-4 h-4 sm:w-5 sm:h-5";

  const cards: CardDef[] = [
    {
      mode: "classic",
      icon: <Map className={`${iconSize} text-blue-600 dark:text-blue-400`} />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      title: "Classic",
      bullets: ["Click any country", "Use hints when stuck", "No time pressure"],
      label: "For Beginners", labelColor: "text-blue-600 dark:text-blue-400",
      hoverGradient: "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
      accentDot: "bg-blue-500", delay: 0.10, initial: { x: -40, opacity: 0 },
    },
    {
      mode: "hint-based",
      icon: <Lightbulb className={`${iconSize} text-orange-600 dark:text-orange-400`} />,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      title: "Hint-Based",
      bullets: ["Hint shown first", "Find the country", "More challenging"],
      label: "For Experts", labelColor: "text-orange-600 dark:text-orange-400",
      hoverGradient: "bg-gradient-to-br from-orange-500/10 to-yellow-500/10",
      accentDot: "bg-orange-500", delay: 0.16, initial: { y: 40, opacity: 0 },
    },
    {
      mode: "flag-quiz",
      icon: <Flag className={`${iconSize} text-green-600 dark:text-green-400`} />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      title: "Flag Quiz",
      bullets: ["Flag shown", "Click the country", "Learn flag patterns"],
      label: "Visual Learning", labelColor: "text-green-600 dark:text-green-400",
      hoverGradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
      accentDot: "bg-green-500", delay: 0.22, initial: { y: 40, opacity: 0 },
    },
    {
      mode: "capital-city",
      icon: <Building2 className={`${iconSize} text-purple-600 dark:text-purple-400`} />,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      title: "Capitals",
      bullets: ["Capital name shown", "Find on the map", "Skip if stuck"],
      label: "Geography Pro", labelColor: "text-purple-600 dark:text-purple-400",
      hoverGradient: "bg-gradient-to-br from-purple-500/10 to-indigo-500/10",
      accentDot: "bg-purple-500", delay: 0.28, initial: { y: 40, opacity: 0 },
    },
    {
      mode: "speed-round",
      icon: <Timer className={`${iconSize} text-yellow-600 dark:text-yellow-400`} />,
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      title: "Speed Round",
      bullets: ["60 / 90 / 120s", "Every country = +1", "Beat your best"],
      label: "Adrenaline Rush", labelColor: "text-yellow-600 dark:text-yellow-400",
      hoverGradient: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10",
      accentDot: "bg-yellow-500", delay: 0.34, initial: { y: 40, opacity: 0 },
    },
    {
      mode: "daily-challenge",
      icon: <Calendar className={`${iconSize} text-indigo-600 dark:text-indigo-400`} />,
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      title: "Daily",
      bullets: ["New puzzle daily", "Shareable results", "Track your streak"],
      label: "Daily Puzzle", labelColor: "text-indigo-600 dark:text-indigo-400",
      hoverGradient: "bg-gradient-to-br from-indigo-500/10 to-purple-500/10",
      accentDot: "bg-indigo-500", delay: 0.40, initial: { y: 40, opacity: 0 },
    },
    {
      mode: "continent-study",
      icon: <BookOpen className={`${iconSize} text-amber-600 dark:text-amber-400`} />,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      title: "Study Mode",
      bullets: ["Pick a continent", "Track progress", "Earn XP"],
      label: "Learn & Earn", labelColor: "text-amber-600 dark:text-amber-400",
      hoverGradient: "bg-gradient-to-br from-amber-500/10 to-orange-500/10",
      accentDot: "bg-amber-500",
      badge: "NEW", badgeGradient: "from-amber-500 to-orange-600",
      delay: 0.46, initial: { x: 40, opacity: 0 },
    },
    {
      mode: "multiplayer",
      icon: <Swords className={`${iconSize} text-rose-600 dark:text-rose-400`} />,
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
      title: "Multiplayer",
      bullets: ["vs real player", "10 rounds", "Earn rank points"],
      label: "Ranked PvP", labelColor: "text-rose-600 dark:text-rose-400",
      hoverGradient: "bg-gradient-to-br from-rose-500/10 to-pink-500/10",
      accentDot: "bg-rose-500",
      badge: "LIVE", badgeGradient: "from-rose-500 to-pink-600",
      delay: 0.52, initial: { x: 40, opacity: 0 },
    },
  ];

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Globe3D onTransitionToMap={() => {}} showButton={false} />
      </div>
      <div className="absolute inset-0 bg-black/50 z-10" />

      <div className="relative z-20 w-full h-full overflow-y-auto">
        <div
          className="min-h-full flex items-center justify-center"
          style={{ padding: isTV ? "48px 80px" : "8px 8px 20px" }}
        >
          <div className="w-full" style={{ maxWidth: isTV ? 1600 : 896 }}>
            {/* Header */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="text-center"
              style={{ marginBottom: isTV ? 48 : 10 }}
            >
              {isTV ? (
                <>
                  <h1 className="font-black text-white drop-shadow-2xl" style={{ fontSize: 72 }}>
                    Choose Your Mode
                  </h1>
                  <p className="text-white/75" style={{ fontSize: 28 }}>
                    How do you want to explore the world?
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-xl sm:text-4xl md:text-5xl font-black text-white mb-0.5 drop-shadow-2xl">
                    Choose Your Mode
                  </h1>
                  <p className="text-xs sm:text-sm text-white/75">
                    How do you want to explore the world?
                  </p>
                </>
              )}
            </motion.div>

            {/* Top 4 cards */}
            <div
  className={isTV ? "" : "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-3"}
  style={isTV ? { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 24 } : undefined}
>
              {cards.slice(0, 4).map(card =>
                <ModeCard key={card.mode} card={card} onSelectMode={onSelectMode} isTV={isTV} />
              )}
            </div>

            {/* Bottom 4 cards */}
           <div
  className={isTV ? "" : "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"}
  style={isTV ? { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 } : undefined}
>
              {cards.slice(4).map(card =>
                <ModeCard key={card.mode} card={card} onSelectMode={onSelectMode} isTV={isTV} />
              )}
            </div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.58 }}
              className="text-center text-white/55"
              style={{ marginTop: isTV ? 40 : 12, fontSize: isTV ? 22 : 11 }}
            >
              Select a mode to begin your geography journey 🌍
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}








