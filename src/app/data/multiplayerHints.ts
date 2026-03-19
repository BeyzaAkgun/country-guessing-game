/**
 * multiplayerHints.ts
 *
 * Ordered hint system for multiplayer mode only.
 * In solo HintBasedGame, hints are still random (uses getRandomHint from getRandomHint.ts).
 *
 * Multiplayer hint order per country (max 6 hints):
 *   Hint 1: Continent  (from countryHints.ts, type "continent")
 *   Hint 2: Flag image (from COUNTRY_CODE_MAP)
 *   Hint 3: Capital    (from COUNTRY_CAPITALS)
 *   Hints 4-6: Facts   (from countryHints.ts, type "fact", in order)
 *
 * Both players always receive hints at the same index — no randomness.
 * Hint 1 is shown automatically. Hints 2-6 require "Get Hint" button.
 */

import { countryHints } from "@/app/data/countryHints";

// ── Capital cities ────────────────────────────────────────────────────────────
export const COUNTRY_CAPITALS: Record<string, string> = {
  "Afghanistan": "Kabul", "Albania": "Tirana", "Algeria": "Algiers",
  "Angola": "Luanda", "Argentina": "Buenos Aires", "Armenia": "Yerevan",
  "Australia": "Canberra", "Austria": "Vienna", "Azerbaijan": "Baku",
  "Bahrain": "Manama", "Bangladesh": "Dhaka", "Belarus": "Minsk",
  "Belgium": "Brussels", "Belize": "Belmopan", "Benin": "Porto-Novo",
  "Bhutan": "Thimphu", "Bolivia": "Sucre", "Bosnia and Herzegovina": "Sarajevo",
  "Botswana": "Gaborone", "Brazil": "Brasília", "Brunei": "Bandar Seri Begawan",
  "Bulgaria": "Sofia", "Burkina Faso": "Ouagadougou", "Burundi": "Gitega",
  "Cambodia": "Phnom Penh", "Cameroon": "Yaoundé", "Canada": "Ottawa",
  "Central African Republic": "Bangui", "Chad": "N'Djamena", "Chile": "Santiago",
  "China": "Beijing", "Colombia": "Bogotá", "Comoros": "Moroni",
  "Republic of the Congo": "Brazzaville", "Democratic Republic of the Congo": "Kinshasa",
  "Costa Rica": "San José", "Croatia": "Zagreb", "Cuba": "Havana",
  "Cyprus": "Nicosia", "Czechia": "Prague", "Denmark": "Copenhagen",
  "Djibouti": "Djibouti City", "Dominican Republic": "Santo Domingo",
  "Ecuador": "Quito", "Egypt": "Cairo", "El Salvador": "San Salvador",
  "Equatorial Guinea": "Malabo", "Eritrea": "Asmara", "Eswatini": "Mbabane",
  "Estonia": "Tallinn", "Ethiopia": "Addis Ababa", "Fiji": "Suva",
  "Finland": "Helsinki", "France": "Paris", "Gabon": "Libreville",
  "Gambia": "Banjul", "Georgia": "Tbilisi", "Germany": "Berlin",
  "Ghana": "Accra", "Greece": "Athens", "Greenland": "Nuuk",
  "Guatemala": "Guatemala City", "Guinea": "Conakry", "Guinea-Bissau": "Bissau",
  "Guyana": "Georgetown", "Haiti": "Port-au-Prince", "Honduras": "Tegucigalpa",
  "Hungary": "Budapest", "Iceland": "Reykjavík", "India": "New Delhi",
  "Indonesia": "Jakarta", "Iran": "Tehran", "Iraq": "Baghdad",
  "Ireland": "Dublin", "Israel": "Jerusalem", "Italy": "Rome",
  "Ivory Coast": "Yamoussoukro", "Jamaica": "Kingston", "Japan": "Tokyo",
  "Jordan": "Amman", "Kazakhstan": "Astana", "Kenya": "Nairobi",
  "Kosovo": "Pristina", "Kuwait": "Kuwait City", "Kyrgyzstan": "Bishkek",
  "Laos": "Vientiane", "Latvia": "Riga", "Lebanon": "Beirut",
  "Lesotho": "Maseru", "Liberia": "Monrovia", "Libya": "Tripoli",
  "Lithuania": "Vilnius", "Luxembourg": "Luxembourg City",
  "Madagascar": "Antananarivo", "Malawi": "Lilongwe", "Malaysia": "Kuala Lumpur",
  "Maldives": "Malé", "Mali": "Bamako", "Malta": "Valletta",
  "Mauritania": "Nouakchott", "Mauritius": "Port Louis", "Mexico": "Mexico City",
  "Moldova": "Chișinău", "Mongolia": "Ulaanbaatar", "Montenegro": "Podgorica",
  "Morocco": "Rabat", "Mozambique": "Maputo", "Myanmar": "Naypyidaw",
  "Namibia": "Windhoek", "Nepal": "Kathmandu", "Netherlands": "Amsterdam",
  "New Zealand": "Wellington", "Nicaragua": "Managua", "Niger": "Niamey",
  "Nigeria": "Abuja", "North Korea": "Pyongyang", "North Macedonia": "Skopje",
  "Norway": "Oslo", "Oman": "Muscat", "Pakistan": "Islamabad",
  "Palestine": "Ramallah", "Panama": "Panama City",
  "Papua New Guinea": "Port Moresby", "Paraguay": "Asunción", "Peru": "Lima",
  "Philippines": "Manila", "Poland": "Warsaw", "Portugal": "Lisbon",
  "Qatar": "Doha", "Romania": "Bucharest", "Russia": "Moscow",
  "Rwanda": "Kigali", "Saudi Arabia": "Riyadh", "Senegal": "Dakar",
  "Serbia": "Belgrade", "Sierra Leone": "Freetown", "Slovakia": "Bratislava",
  "Slovenia": "Ljubljana", "Solomon Islands": "Honiara", "Somalia": "Mogadishu",
  "South Africa": "Pretoria", "South Korea": "Seoul", "South Sudan": "Juba",
  "Spain": "Madrid", "Sri Lanka": "Sri Jayawardenepura Kotte", "Sudan": "Khartoum",
  "Suriname": "Paramaribo", "Sweden": "Stockholm", "Switzerland": "Bern",
  "Syria": "Damascus", "Taiwan": "Taipei", "Tajikistan": "Dushanbe",
  "Tanzania": "Dodoma", "Thailand": "Bangkok", "Timor-Leste": "Dili",
  "Togo": "Lomé", "Trinidad and Tobago": "Port of Spain", "Tunisia": "Tunis",
  "Turkey": "Ankara", "Turkmenistan": "Ashgabat", "Uganda": "Kampala",
  "Ukraine": "Kyiv", "United Arab Emirates": "Abu Dhabi",
  "United Kingdom": "London", "United States of America": "Washington, D.C.",
  "Uruguay": "Montevideo", "Uzbekistan": "Tashkent", "Venezuela": "Caracas",
  "Vietnam": "Hanoi", "Yemen": "Sana'a", "Zambia": "Lusaka",
  "Zimbabwe": "Harare", "Cabo Verde": "Praia", "New Caledonia": "Nouméa",
  "Western Sahara": "El Aaiún",
};

// ── Flag codes (ISO alpha-2 → flagcdn.com) ────────────────────────────────────
export const COUNTRY_CODE_MAP: Record<string, string> = {
  "Afghanistan": "af", "Albania": "al", "Algeria": "dz", "Angola": "ao",
  "Argentina": "ar", "Armenia": "am", "Australia": "au", "Austria": "at",
  "Azerbaijan": "az", "Bahrain": "bh", "Bangladesh": "bd", "Belarus": "by",
  "Belgium": "be", "Belize": "bz", "Benin": "bj", "Bhutan": "bt",
  "Bolivia": "bo", "Bosnia and Herzegovina": "ba", "Botswana": "bw",
  "Brazil": "br", "Brunei": "bn", "Bulgaria": "bg", "Burkina Faso": "bf",
  "Burundi": "bi", "Cambodia": "kh", "Cameroon": "cm", "Canada": "ca",
  "Cabo Verde": "cv", "Central African Republic": "cf", "Chad": "td",
  "Chile": "cl", "China": "cn", "Colombia": "co", "Comoros": "km",
  "Republic of the Congo": "cg", "Democratic Republic of the Congo": "cd",
  "Costa Rica": "cr", "Croatia": "hr", "Cuba": "cu", "Cyprus": "cy",
  "Czechia": "cz", "Denmark": "dk", "Djibouti": "dj", "Dominican Republic": "do",
  "Ecuador": "ec", "Egypt": "eg", "El Salvador": "sv",
  "Equatorial Guinea": "gq", "Eritrea": "er", "Eswatini": "sz",
  "Estonia": "ee", "Ethiopia": "et", "Fiji": "fj", "Finland": "fi",
  "France": "fr", "Gabon": "ga", "Gambia": "gm", "Georgia": "ge",
  "Germany": "de", "Ghana": "gh", "Greece": "gr", "Greenland": "gl",
  "Guatemala": "gt", "Guinea": "gn", "Guinea-Bissau": "gw", "Guyana": "gy",
  "Haiti": "ht", "Honduras": "hn", "Hungary": "hu", "Iceland": "is",
  "India": "in", "Indonesia": "id", "Iran": "ir", "Iraq": "iq",
  "Ireland": "ie", "Israel": "il", "Italy": "it", "Ivory Coast": "ci",
  "Jamaica": "jm", "Japan": "jp", "Jordan": "jo", "Kazakhstan": "kz",
  "Kenya": "ke", "Kosovo": "xk", "Kuwait": "kw", "Kyrgyzstan": "kg",
  "Laos": "la", "Latvia": "lv", "Lebanon": "lb", "Lesotho": "ls",
  "Liberia": "lr", "Libya": "ly", "Lithuania": "lt", "Luxembourg": "lu",
  "Madagascar": "mg", "Malawi": "mw", "Malaysia": "my", "Maldives": "mv",
  "Mali": "ml", "Malta": "mt", "Mauritania": "mr", "Mauritius": "mu",
  "Mexico": "mx", "Moldova": "md", "Mongolia": "mn", "Montenegro": "me",
  "Morocco": "ma", "Mozambique": "mz", "Myanmar": "mm", "Namibia": "na",
  "Nepal": "np", "Netherlands": "nl", "New Zealand": "nz",
  "Nicaragua": "ni", "Niger": "ne", "Nigeria": "ng", "North Korea": "kp",
  "North Macedonia": "mk", "Norway": "no", "Oman": "om", "Pakistan": "pk",
  "Palestine": "ps", "Panama": "pa", "Papua New Guinea": "pg",
  "Paraguay": "py", "Peru": "pe", "Philippines": "ph", "Poland": "pl",
  "Portugal": "pt", "Qatar": "qa", "Romania": "ro", "Russia": "ru",
  "Rwanda": "rw", "Saudi Arabia": "sa", "Senegal": "sn", "Serbia": "rs",
  "Sierra Leone": "sl", "Slovakia": "sk", "Slovenia": "si",
  "Solomon Islands": "sb", "Somalia": "so", "South Africa": "za",
  "South Korea": "kr", "South Sudan": "ss", "Spain": "es",
  "Sri Lanka": "lk", "Sudan": "sd", "Suriname": "sr", "Sweden": "se",
  "Switzerland": "ch", "Syria": "sy", "Taiwan": "tw", "Tajikistan": "tj",
  "Tanzania": "tz", "Thailand": "th", "Timor-Leste": "tl", "Togo": "tg",
  "Trinidad and Tobago": "tt", "Tunisia": "tn", "Turkey": "tr",
  "Turkmenistan": "tm", "Uganda": "ug", "Ukraine": "ua",
  "United Arab Emirates": "ae", "United Kingdom": "gb",
  "United States of America": "us", "Uruguay": "uy", "Uzbekistan": "uz",
  "Venezuela": "ve", "Vietnam": "vn", "Yemen": "ye", "Zambia": "zm",
  "Zimbabwe": "zw", "New Caledonia": "nc", "Falkland Islands": "fk",
  "Western Sahara": "eh",
};

// ── Types ─────────────────────────────────────────────────────────────────────
export type MPHintType = "continent" | "flag" | "capital" | "fact";

export interface MPHint {
  index: number;      // 0-based position (0 = first hint shown automatically)
  type: MPHintType;
  text: string;       // Display text — for flag hints this is "Flag of <country>"
  flagUrl?: string;   // Only present when type === "flag"
}

// ── Point values by hint index used ──────────────────────────────────────────
// hintsUsed = number of hints revealed when player submits (min 1, max 6)
const POINTS_TABLE: Record<number, number> = {
  1: 100,
  2: 80,
  3: 60,
  4: 40,
  5: 20,
  6: 10,
};

export function calculatePoints(hintsUsed: number): number {
  const clamped = Math.max(1, Math.min(6, hintsUsed));
  return POINTS_TABLE[clamped] ?? 10;
}

// ── Build the ordered hint list for a country ─────────────────────────────────
/**
 * Returns up to 6 hints in fixed order for multiplayer.
 * Skips flag/capital if the data doesn't exist for that country.
 * Always starts with the continent hint from countryHints.ts.
 */

// ── Name aliases ──────────────────────────────────────────────────────────────
// Maps backend country names to countryHints.ts keys where they differ
const COUNTRY_NAME_ALIASES: Record<string, string> = {
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Central African Republic": "Central African Rep.",
  "Democratic Republic of the Congo": "Dem. Rep. Congo",
  "Republic of the Congo": "Congo",
  "Dominican Republic": "Dominican Rep.",
  "Equatorial Guinea": "Eq. Guinea",
  "Eswatini": "eSwatini",
  "Ivory Coast": "Côte d'Ivoire",
  "North Macedonia": "Macedonia",
  "Solomon Islands": "Solomon Is.",
  "South Sudan": "S. Sudan",
  // These countries have no hints entry — will get flag+capital only
  // "Bahrain", "Cabo Verde", "Comoros", "Maldives", "Malta", "Mauritius"
};

/** Resolve a country name to its hints key */
function resolveHintName(countryName: string): string {
  return COUNTRY_NAME_ALIASES[countryName] ?? countryName;
}

export function getOrderedHints(countryName: string): MPHint[] {
  const hints: MPHint[] = [];
  const resolvedName = resolveHintName(countryName);
  const source = countryHints[resolvedName];

  // Hint 1 — Continent (type "continent" from countryHints.ts)
  const continentHint = source?.find((h) => h.type === "continent");
  if (continentHint) {
    hints.push({ index: 0, type: "continent", text: continentHint.text });
  }

  // Hint 2 — Flag
  const code = COUNTRY_CODE_MAP[countryName];
  if (code) {
    hints.push({
      index: hints.length,
      type: "flag",
      text: `Flag of ${countryName}`,
      flagUrl: `https://flagcdn.com/w320/${code}.png`,
    });
  }

  // Hint 3 — Capital
  const capital = COUNTRY_CAPITALS[countryName];
  if (capital) {
    hints.push({
      index: hints.length,
      type: "capital",
      text: `Capital city: ${capital}`,
    });
  }

  // Hints 4-6 — Facts (in order from countryHints.ts, skipping continent)
  // Filter out any fact that mentions the capital city — avoids duplicate capital hints
  const capitalLower = capital?.toLowerCase() ?? "";
  const facts = source?.filter((h) => h.type === "fact") ?? [];
  for (const fact of facts) {
    if (hints.length >= 6) break;
    // Skip if fact text mentions the capital (e.g. "Capital city is Khartoum")
    if (capitalLower && fact.text.toLowerCase().includes(capitalLower)) continue;
    hints.push({ index: hints.length, type: "fact", text: fact.text });
  }

  return hints;
}

/** How many hints exist for this country (max 6) */
export function getTotalHintCount(countryName: string): number {
  return getOrderedHints(countryName).length;
}

/** Get a single hint by 0-based index */
export function getHintAtIndex(countryName: string, index: number): MPHint | null {
  const hints = getOrderedHints(countryName);
  return hints[index] ?? null;
}