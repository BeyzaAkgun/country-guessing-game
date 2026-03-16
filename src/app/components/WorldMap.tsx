//WorldMap.tsx
import React, { memo, useEffect, useState } from "react";
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
  countries: any[]; // Ideally strict typing if possible, but any works for generic geojson
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

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      // Check if user has explicitly set dark mode or prefers dark scheme
      const isDark = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };
    
    checkDarkMode();
    
    // Observer for class changes on html element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    // Listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div className={`w-full h-full relative overflow-hidden flex items-center justify-center touch-none select-none transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-blue-50'}`}>
      
      {/* Decorative Background Elements for Space Theme (Dark Mode) */}
      {isDarkMode && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute top-40 right-40 w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute bottom-20 left-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
          {/* Subtle gradient overlay */}
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
          <ZoomableGroup center={[0, 0]} maxZoom={4} minZoom={0.8}>
            {/* Ocean Sphere */}
            <Sphere
              stroke={isDarkMode ? "#1e293b" : "#cbd5e1"}
              strokeWidth={0.5}
              id="rsm-sphere"
              fill={isDarkMode ? "#0f172a" : "#eff6ff"} 
              // Dark mode uses a very dark slate, Light mode uses a very light blue
            />
            
            {/* Grid Lines */}
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

                    // Improved Color Palette
                    let fillColor, strokeColor, strokeWidth;

                    if (isCorrect) {
                      // Success: Emerald Green
                      fillColor = isDarkMode ? "#059669" : "#10b981";
                      strokeColor = isDarkMode ? "#34d399" : "#047857";
                      strokeWidth = 1.5;
                    } else if (isWrong) {
                      // Error: Red / Rose
                      fillColor = isDarkMode ? "#9f1239" : "#f43f5e";
                      strokeColor = isDarkMode ? "#fb7185" : "#881337";
                      strokeWidth = 1.5;
                    } else if (isSelected) {
                      // Selected: Bright Blue / Cyan
                      fillColor = isDarkMode ? "#2563eb" : "#3b82f6";
                      strokeColor = isDarkMode ? "#60a5fa" : "#1d4ed8";
                      strokeWidth = 2;
                    } else {
                      // Default
                      fillColor = isDarkMode ? "#1e293b" : "#f8fafc"; 
                      // Dark mode: dark slate country, Light mode: off-white
                      strokeColor = isDarkMode ? "#475569" : "#cbd5e1";
                      strokeWidth = 0.5;
                    }

                    // Hover state colors (calculated dynamically based on current state)
                    const hoverFill = isCorrect 
                      ? (isDarkMode ? "#047857" : "#34d399")
                      : isWrong 
                        ? (isDarkMode ? "#be123c" : "#fb7185")
                        : isSelected 
                          ? (isDarkMode ? "#1d4ed8" : "#60a5fa")
                          : (isDarkMode ? "#334155" : "#e2e8f0"); // Slightly lighter on hover

                    const hoverStroke = isDarkMode ? "#94a3b8" : "#94a3b8"; // Light grey stroke on hover for contrast

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
                            transition: "all 0.3s ease",
                          },
                          hover: {
                            fill: hoverFill,
                            stroke: hoverStroke,
                            strokeWidth: 1.5,
                            outline: "none",
                            cursor: "pointer",
                            filter: isDarkMode ? "drop-shadow(0 0 8px rgba(56, 189, 248, 0.3))" : "none", // Neon glow effect in dark mode
                            zIndex: 10, // Bring to front visually
                          },
                          pressed: {
                            fill: isDarkMode ? "#1e40af" : "#2563eb",
                            stroke: strokeColor,
                            strokeWidth: 2,
                            outline: "none",
                          }
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
      
      {/* Legend / Overlay UI could go here */}
      <div className="absolute bottom-6 left-6 flex gap-4 text-xs font-mono opacity-70 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-emerald-600' : 'bg-emerald-500'}`}></div>
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Correct</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-rose-700' : 'bg-rose-500'}`}></div>
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Incorrect</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default memo(WorldMap);