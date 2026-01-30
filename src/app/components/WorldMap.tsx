import React, { memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Sphere,
  Graticule
} from "react-simple-maps";

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
  return (
    <div className="size-full bg-blue-50 dark:bg-slate-950 rounded-lg overflow-hidden border border-border/50 shadow-inner flex items-center justify-center relative touch-none">
      {/* touch-none prevents browser scrolling/zooming on mobile while interacting with map */}
      
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 160,
        }}
        className="size-full max-h-full max-w-full"
      >
         <ZoomableGroup center={[0, 0]} maxZoom={4} minZoom={0.8}>
           <Sphere stroke="#E4E5E6" strokeWidth={0.5} id="rsm-sphere" fill="transparent" />
           <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
           
           {/* We pass the pre-loaded countries GeoJSON features array directly */}
           <Geographies geography={countries}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Safeguard against missing properties
                const countryName = geo.properties?.name || "Unknown";
                const isCorrect = correctCountries.includes(countryName);
                const isWrong = wrongCountries.includes(countryName);
                const isSelected = selectedCountryName === countryName;

                let fillColor = "#D6D6DA"; 
                if (isCorrect) fillColor = "#4ADE80"; 
                if (isWrong) fillColor = "#F87171"; 
                if (isSelected) fillColor = "#60A5FA"; 

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
                        outline: "none",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        transition: "all 250ms ease"
                      },
                      hover: {
                        fill: isCorrect ? "#4ADE80" : isWrong ? "#F87171" : "#94A3B8",
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: "#3B82F6",
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default memo(WorldMap);

