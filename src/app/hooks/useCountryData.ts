import { useState, useEffect } from "react";
import { feature } from "topojson-client";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export interface Country {
  type: string;
  id: string | number;
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: any;
}

export function useCountryData() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(GEO_URL)
      .then((response) => response.json())
      .then((data) => {
        // world-atlas topojson usually has objects.countries
        // We use 'feature' to convert to GeoJSON features
        const countriesData = (feature(data, data.objects.countries) as any).features;
        
        // Filter out Antarctica and ensure properties exist
        const filtered = countriesData.filter((c: any) => 
          c.properties && 
          c.properties.name !== "Antarctica"
        );
        
        setCountries(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load map data", err);
        setLoading(false);
      });
  }, []);

  return { countries, loading };
}
