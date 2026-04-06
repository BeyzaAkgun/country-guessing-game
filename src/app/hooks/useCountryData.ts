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

// Maps world-atlas abbreviated names → full standardized names
const NAME_NORMALIZATION: { [key: string]: string } = {
  "Dem. Rep. Congo": "Democratic Republic of the Congo",
  "Dominican Rep.": "Dominican Republic",
  "Côte d'Ivoire": "Ivory Coast",
  "S. Sudan": "South Sudan",
  "Central African Rep.": "Central African Republic",
  "Bosnia and Herz.": "Bosnia and Herzegovina",
  "W. Sahara": "Western Sahara",
  "Eq. Guinea": "Equatorial Guinea",
  "Solomon Is.": "Solomon Islands",
  "N. Cyprus": "Northern Cyprus",
  "Macedonia": "North Macedonia",
  "Falkland Is.": "Falkland Islands",
  "Fr. S. Antarctic Lands": "French Southern Territories",
  "eSwatini": "Eswatini",
  "Congo": "Republic of the Congo",
  "Trinidad and Tobago": "Trinidad and Tobago",
  "Somaliland": "Somaliland",
  "Kosovo": "Kosovo",
};

export function useCountryData() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(GEO_URL)
      .then((response) => response.json())
      .then((data) => {
        const countriesData = (feature(data, data.objects.countries) as any).features;

        const filtered = countriesData
          .filter((c: any) =>
            c.properties &&
            c.properties.name !== "Antarctica"
          )
          .map((c: any) => ({
            ...c,
            properties: {
              ...c.properties,
              // Normalize abbreviated names to full names
              name: NAME_NORMALIZATION[c.properties.name] ?? c.properties.name,
            },
          }));

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