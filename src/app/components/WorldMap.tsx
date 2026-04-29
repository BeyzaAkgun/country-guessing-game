// //WorldMap.tsx
// import React, { memo, useEffect, useState } from "react";
// import {
//   ComposableMap,
//   Geographies,
//   Geography,
//   ZoomableGroup,
//   Sphere,
//   Graticule
// } from "react-simple-maps";
// import { motion } from "motion/react";

// interface WorldMapProps {
//   countries: any[]; // Ideally strict typing if possible, but any works for generic geojson
//   onCountryClick: (geo: any) => void;
//   selectedCountryName?: string | null;
//   correctCountries: string[];
//   wrongCountries: string[];
  
// }

// const WorldMap = ({
//   countries,
//   onCountryClick,
//   selectedCountryName,
//   correctCountries = [],
//   wrongCountries = []
// }: WorldMapProps) => {
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   // Dark mode detection
//   useEffect(() => {
//     const checkDarkMode = () => {
//       // Check if user has explicitly set dark mode or prefers dark scheme
//       const isDark = document.documentElement.classList.contains('dark') || 
//                      window.matchMedia('(prefers-color-scheme: dark)').matches;
//       setIsDarkMode(isDark);
//     };
    
//     checkDarkMode();
    
//     // Observer for class changes on html element
//     const observer = new MutationObserver(checkDarkMode);
//     observer.observe(document.documentElement, { 
//       attributes: true, 
//       attributeFilter: ['class'] 
//     });
    
//     // Listener for system preference changes
//     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
//     mediaQuery.addEventListener('change', handleChange);
    
//     return () => {
//       observer.disconnect();
//       mediaQuery.removeEventListener('change', handleChange);
//     };
//   }, []);

//   return (
//     <div className={`w-full h-full relative overflow-hidden flex items-center justify-center touch-none select-none transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-blue-50'}`}>
      
//       {/* Decorative Background Elements for Space Theme (Dark Mode) */}
//       {isDarkMode && (
//         <div className="absolute inset-0 pointer-events-none opacity-40">
//           <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
//           <div className="absolute top-40 right-40 w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
//           <div className="absolute bottom-20 left-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
//           {/* Subtle gradient overlay */}
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/50 to-slate-950" />
//         </div>
//       )}

//       <motion.div 
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.8 }}
//         className="w-full h-full"
//       >
//         <ComposableMap
//           projection="geoEqualEarth"
//           projectionConfig={{ scale: 160 }}
//           width={800}
//           height={400}
//           className="w-full h-full"
//           style={{ width: "100%", height: "100%" }}
//         >
//           <ZoomableGroup center={[0, 0]} maxZoom={4} minZoom={0.8}>
//             {/* Ocean Sphere */}
//             <Sphere
//               stroke={isDarkMode ? "#1e293b" : "#cbd5e1"}
//               strokeWidth={0.5}
//               id="rsm-sphere"
//               fill={isDarkMode ? "#0f172a" : "#eff6ff"} 
//               // Dark mode uses a very dark slate, Light mode uses a very light blue
//             />
            
//             {/* Grid Lines */}
//             <Graticule 
//               stroke={isDarkMode ? "#334155" : "#cbd5e1"} 
//               strokeWidth={0.3} 
//               strokeOpacity={0.4}
//             />

//             {countries && countries.length > 0 && (
//               <Geographies geography={countries}>
//                 {({ geographies }) =>
//                   geographies.map((geo) => {
//                     const countryName =
//                       geo.properties?.name ||
//                       geo.properties?.ADMIN ||
//                       geo.properties?.NAME_EN ||
//                       geo.properties?.ISO_A3 ||
//                       "Unknown";

//                     const isCorrect = correctCountries.includes(countryName);
//                     const isWrong = wrongCountries.includes(countryName);
//                     const isSelected = selectedCountryName === countryName;

//                     // Improved Color Palette
//                     let fillColor, strokeColor, strokeWidth;

//                     if (isCorrect) {
//                       // Success: Emerald Green
//                       fillColor = isDarkMode ? "#059669" : "#10b981";
//                       strokeColor = isDarkMode ? "#34d399" : "#047857";
//                       strokeWidth = 1.5;
//                     } else if (isWrong) {
//                       // Error: Red / Rose
//                       fillColor = isDarkMode ? "#9f1239" : "#f43f5e";
//                       strokeColor = isDarkMode ? "#fb7185" : "#881337";
//                       strokeWidth = 1.5;
//                     } else if (isSelected) {
//                       // Selected: Bright Blue / Cyan
//                       fillColor = isDarkMode ? "#2563eb" : "#3b82f6";
//                       strokeColor = isDarkMode ? "#60a5fa" : "#1d4ed8";
//                       strokeWidth = 2;
//                     } else {
//                       // Default
//                       fillColor = isDarkMode ? "#1e293b" : "#f8fafc"; 
//                       // Dark mode: dark slate country, Light mode: off-white
//                       strokeColor = isDarkMode ? "#475569" : "#cbd5e1";
//                       strokeWidth = 0.5;
//                     }

//                     // Hover state colors (calculated dynamically based on current state)
//                     const hoverFill = isCorrect 
//                       ? (isDarkMode ? "#047857" : "#34d399")
//                       : isWrong 
//                         ? (isDarkMode ? "#be123c" : "#fb7185")
//                         : isSelected 
//                           ? (isDarkMode ? "#1d4ed8" : "#60a5fa")
//                           : (isDarkMode ? "#334155" : "#e2e8f0"); // Slightly lighter on hover

//                     const hoverStroke = isDarkMode ? "#94a3b8" : "#94a3b8"; // Light grey stroke on hover for contrast

//                     return (
//                       <Geography
//                         key={geo.rsmKey || geo.id}
//                         geography={geo}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onCountryClick(geo);
//                         }}
//                         style={{
//                           default: {
//                             fill: fillColor,
//                             stroke: strokeColor,
//                             strokeWidth: strokeWidth,
//                             outline: "none",
//                             transition: "all 0.3s ease",
//                           },
//                           hover: {
//                             fill: hoverFill,
//                             stroke: hoverStroke,
//                             strokeWidth: 1.5,
//                             outline: "none",
//                             cursor: "pointer",
//                             filter: isDarkMode ? "drop-shadow(0 0 8px rgba(56, 189, 248, 0.3))" : "none", // Neon glow effect in dark mode
//                             zIndex: 10, // Bring to front visually
//                           },
//                           pressed: {
//                             fill: isDarkMode ? "#1e40af" : "#2563eb",
//                             stroke: strokeColor,
//                             strokeWidth: 2,
//                             outline: "none",
//                           }
//                         }}
//                       />
//                     );
//                   })
//                 }
//               </Geographies>
//             )}
//           </ZoomableGroup>
//         </ComposableMap>
//       </motion.div>
      
//       {/* Legend / Overlay UI could go here */}
//       <div className="absolute bottom-6 left-6 flex gap-4 text-xs font-mono opacity-70 pointer-events-none">
//         <div className="flex items-center gap-2">
//           <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-emerald-600' : 'bg-emerald-500'}`}></div>
//           <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Correct</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-rose-700' : 'bg-rose-500'}`}></div>
//           <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Incorrect</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
//           <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Selected</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default memo(WorldMap);










//WorldMap.tsx
import React, { memo, useEffect, useState, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Sphere,
  Graticule
} from "react-simple-maps";
import { motion } from "motion/react";


interface WorldMapProps {
  countries: any[];
  onCountryClick: (geo: any) => void;
  selectedCountryName?: string | null;
  correctCountries: string[];
  wrongCountries: string[];
}

const WorldMap = ({
  countries,
  onCountryClick,
  selectedCountryName,
  correctCountries = [],
  wrongCountries = []
}: WorldMapProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Track zoom/center so we can offer a "reset view" button when user has panned far
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 0],
    zoom: 1,
  });
  const isDefaultView = position.zoom === 1 && position.coordinates[0] === 0 && position.coordinates[1] === 0;

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(isDark);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <div
      className={`w-full h-full relative overflow-hidden flex items-center justify-center select-none transition-colors duration-500 ${isDarkMode ? "bg-slate-950" : "bg-blue-50"}`}
      // touch-action: none prevents the browser from hijacking touch events for
      // page scroll / pinch-zoom while the user is interacting with the map.
      style={{ touchAction: "none" }}
    >
      {/* Dark mode decorative background */}
      {isDarkMode && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDuration: "3s" }} />
          <div className="absolute top-40 right-40 w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDuration: "5s" }} />
          <div className="absolute bottom-20 left-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/50 to-slate-950" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full h-full"
      >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 160 }}
          width={800}
          height={400}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            maxZoom={8}
            minZoom={0.8}
            onMoveEnd={({ coordinates, zoom }) =>
              setPosition({ coordinates: coordinates as [number, number], zoom })
            }
          >
            <Sphere
              stroke={isDarkMode ? "#1e293b" : "#cbd5e1"}
              strokeWidth={0.5}
              id="rsm-sphere"
              fill={isDarkMode ? "#0f172a" : "#eff6ff"}
            />
            <Graticule
              stroke={isDarkMode ? "#334155" : "#cbd5e1"}
              strokeWidth={0.3}
              strokeOpacity={0.4}
            />

            {countries && countries.length > 0 && (
              <Geographies geography={countries}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName =
                      geo.properties?.name ||
                      geo.properties?.ADMIN ||
                      geo.properties?.NAME_EN ||
                      geo.properties?.ISO_A3 ||
                      "Unknown";

                    const isCorrect = correctCountries.includes(countryName);
                    const isWrong = wrongCountries.includes(countryName);
                    const isSelected = selectedCountryName === countryName;

                    let fillColor, strokeColor, strokeWidth;

                    if (isCorrect) {
                      fillColor = isDarkMode ? "#059669" : "#10b981";
                      strokeColor = isDarkMode ? "#34d399" : "#047857";
                      strokeWidth = 1.5;
                    } else if (isWrong) {
                      fillColor = isDarkMode ? "#9f1239" : "#f43f5e";
                      strokeColor = isDarkMode ? "#fb7185" : "#881337";
                      strokeWidth = 1.5;
                    } else if (isSelected) {
                      fillColor = isDarkMode ? "#2563eb" : "#3b82f6";
                      strokeColor = isDarkMode ? "#60a5fa" : "#1d4ed8";
                      strokeWidth = 2;
                    } else {
                      fillColor = isDarkMode ? "#1e293b" : "#f8fafc";
                      strokeColor = isDarkMode ? "#475569" : "#cbd5e1";
                      strokeWidth = 0.5;
                    }

                    const hoverFill = isCorrect
                      ? isDarkMode ? "#047857" : "#34d399"
                      : isWrong
                        ? isDarkMode ? "#be123c" : "#fb7185"
                        : isSelected
                          ? isDarkMode ? "#1d4ed8" : "#60a5fa"
                          : isDarkMode ? "#334155" : "#e2e8f0";

                    return (
                      <Geography
                        key={geo.rsmKey || geo.id}
                        geography={geo}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCountryClick(geo);
                        }}
                        style={{
                          default: {
                            fill: fillColor,
                            stroke: strokeColor,
                            strokeWidth: strokeWidth,
                            outline: "none",
                            transition: "fill 0.2s ease",
                          },
                          hover: {
                            fill: hoverFill,
                            stroke: isDarkMode ? "#94a3b8" : "#94a3b8",
                            strokeWidth: 1.5,
                            outline: "none",
                            cursor: "pointer",
                            filter: isDarkMode
                              ? "drop-shadow(0 0 8px rgba(56, 189, 248, 0.3))"
                              : "none",
                          },
                          pressed: {
                            fill: isDarkMode ? "#1e40af" : "#2563eb",
                            stroke: strokeColor,
                            strokeWidth: 2,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            )}
          </ZoomableGroup>
        </ComposableMap>
      </motion.div>

      {/* Reset View button — appears when user has panned/zoomed away from default */}
      {!isDefaultView && (
        <button
          onClick={() => setPosition({ coordinates: [0, 0], zoom: 1 })}
          className="absolute bottom-16 right-3 z-20 flex items-center gap-1.5 px-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all active:scale-95 hover:bg-white dark:hover:bg-slate-700"
          title="Reset map view"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4M2 12h4m12 0h4m-4.93-6.07l-2.83 2.83M6.76 17.24l-2.83 2.83M17.24 17.24l2.83 2.83M6.76 6.76L3.93 3.93" />
         </svg>
          <span className="hidden sm:inline">Reset View</span>
        </button>
      )}

      {/* Legend */}
      {/* <div className="absolute bottom-3 left-3 flex gap-3 text-xs font-mono opacity-70 pointer-events-none"> */}
         <div className="absolute bottom-3 left-3 z-10 flex gap-3 text-xs font-mono opacity-70 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? "bg-emerald-600" : "bg-emerald-500"}`} />
          <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>Correct</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? "bg-rose-700" : "bg-rose-500"}`} />
          <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>Wrong</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? "bg-blue-600" : "bg-blue-500"}`} />
          <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default memo(WorldMap);