// src/app/utils/queueSystem.ts

export const MAX_PASSES_BEFORE_REVEAL = 3;

export type QueueCountryLike =
  | string
  | {
      id?: string;
      name?: string;
      properties?: {
        id?: string;
        name?: string;
      };
    };

export interface QueueCountry {
  id: string;
  name: string;
}

export interface PassQueueState {
  queue: QueueCountry[];
  passCountMap: Map<string, number>;
}

export interface PassActionResult {
  action: "defer" | "reveal" | "complete";
  country: QueueCountry | null;
  queueState: PassQueueState;
  passesRemaining: number;
}

export interface CorrectGuessResult {
  correct: boolean;
  country: QueueCountry | null;
  queueState: PassQueueState;
}

export interface SerializedPassQueueState {
  queue: QueueCountry[];
  passCountEntries: [string, number][];
}

const normalize = (value: string) => value.toLowerCase().trim();

export function getCountryName(country: QueueCountryLike): string {
  if (typeof country === "string") return country;
  return String(
    country?.properties?.name ??
      country?.name ??
      country?.properties?.id ??
      country?.id ??
      ""
  );
}

export function getCountryId(country: QueueCountryLike): string {
  if (typeof country === "string") return country;
  return String(
    country?.properties?.id ??
      country?.id ??
      country?.properties?.name ??
      country?.name ??
      ""
  );
}

export function toQueueCountry(country: QueueCountryLike): QueueCountry {
  const name = getCountryName(country);
  const id = getCountryId(country) || name;
  return {
    id: String(id),
    name: String(name),
  };
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function removeCountryById(queue: QueueCountry[], id: string): QueueCountry[] {
  return queue.filter((country) => country.id !== id);
}

export function initializeQueue(
  countriesList: QueueCountryLike[],
  shuffleQueue = true
): PassQueueState {
  const queue = (shuffleQueue ? shuffle(countriesList) : countriesList).map(
    toQueueCountry
  );

  const passCountMap = new Map<string, number>();
  for (const country of queue) {
    passCountMap.set(country.id, 0);
  }

  return { queue, passCountMap };
}

export function getCurrentCountry(
  state: PassQueueState | null | undefined
): QueueCountry | null {
  if (!state || state.queue.length === 0) return null;
  return state.queue[0];
}

export function getRemainingPassesForCurrentCountry(
  state: PassQueueState | null | undefined,
  currentCountry?: QueueCountryLike | null
): number {
  if (!state) return 0;

  const country = currentCountry
    ? toQueueCountry(currentCountry)
    : getCurrentCountry(state);

  if (!country) return 0;

  const usedPasses = state.passCountMap.get(country.id) ?? 0;
  return Math.max(0, MAX_PASSES_BEFORE_REVEAL - usedPasses);
}

export function handlePass(
  state: PassQueueState,
  currentCountry?: QueueCountryLike | null
): PassActionResult {
  const country = currentCountry
    ? toQueueCountry(currentCountry)
    : getCurrentCountry(state);

  if (!country) {
    return {
      action: "complete",
      country: null,
      queueState: state,
      passesRemaining: 0,
    };
  }

  const usedPasses = state.passCountMap.get(country.id) ?? 0;
  const nextPassCount = usedPasses + 1;

  if (nextPassCount >= MAX_PASSES_BEFORE_REVEAL) {
    const nextQueue = removeCountryById(state.queue, country.id);
    const nextMap = new Map(state.passCountMap);
    nextMap.delete(country.id);

    return {
      action: "reveal",
      country,
      queueState: {
        queue: nextQueue,
        passCountMap: nextMap,
      },
      passesRemaining: 0,
    };
  }

  const nextQueue = [...removeCountryById(state.queue, country.id), country];
  const nextMap = new Map(state.passCountMap);
  nextMap.set(country.id, nextPassCount);

  return {
    action: "defer",
    country,
    queueState: {
      queue: nextQueue,
      passCountMap: nextMap,
    },
    passesRemaining: Math.max(0, MAX_PASSES_BEFORE_REVEAL - nextPassCount),
  };
}

export function handleReveal(
  state: PassQueueState,
  currentCountry?: QueueCountryLike | null
): PassActionResult {
  const country = currentCountry
    ? toQueueCountry(currentCountry)
    : getCurrentCountry(state);

  if (!country) {
    return {
      action: "complete",
      country: null,
      queueState: state,
      passesRemaining: 0,
    };
  }

  const nextQueue = removeCountryById(state.queue, country.id);
  const nextMap = new Map(state.passCountMap);
  nextMap.delete(country.id);

  return {
    action: "reveal",
    country,
    queueState: {
      queue: nextQueue,
      passCountMap: nextMap,
    },
    passesRemaining: 0,
  };
}

export function handleCorrectGuess(
  state: PassQueueState,
  guessedCountry: QueueCountryLike,
  currentCountry?: QueueCountryLike | null
): CorrectGuessResult {
  const country = currentCountry
    ? toQueueCountry(currentCountry)
    : getCurrentCountry(state);

  if (!country) {
    return {
      correct: false,
      country: null,
      queueState: state,
    };
  }

  const guessed = toQueueCountry(guessedCountry);
  const sameCountry =
    normalize(guessed.id) === normalize(country.id) ||
    normalize(guessed.name) === normalize(country.name) ||
    normalize(guessed.name) === normalize(country.id);

  if (!sameCountry) {
    return {
      correct: false,
      country,
      queueState: state,
    };
  }

  const nextQueue = removeCountryById(state.queue, country.id);
  const nextMap = new Map(state.passCountMap);
  nextMap.delete(country.id);

  return {
    correct: true,
    country,
    queueState: {
      queue: nextQueue,
      passCountMap: nextMap,
    },
  };
}

export function serializeQueueState(
  state: PassQueueState
): SerializedPassQueueState {
  return {
    queue: state.queue,
    passCountEntries: Array.from(state.passCountMap.entries()),
  };
}

export function deserializeQueueState(
  raw: unknown
): PassQueueState | null {
  if (!raw || typeof raw !== "object") return null;

  const value = raw as Partial<SerializedPassQueueState> & {
    passCountMap?: Record<string, number>;
  };

  const queue = Array.isArray(value.queue)
    ? value.queue.map(toQueueCountry).filter((c) => c.name.length > 0)
    : [];

  let entries: [string, number][] = [];

  if (Array.isArray(value.passCountEntries)) {
    entries = value.passCountEntries.filter(
      (entry): entry is [string, number] =>
        Array.isArray(entry) &&
        entry.length === 2 &&
        typeof entry[0] === "string" &&
        typeof entry[1] === "number"
    );
  } else if (value.passCountMap && typeof value.passCountMap === "object") {
    entries = Object.entries(value.passCountMap).map(
      ([key, val]) => [key, Number(val)] as [string, number]
    );
  }

  const passCountMap = new Map<string, number>(entries);

  for (const country of queue) {
    if (!passCountMap.has(country.id)) {
      passCountMap.set(country.id, 0);
    }
  }

  return { queue, passCountMap };
}

export function loadQueueState(storageKey: string): PassQueueState | null {
  if (typeof window === "undefined") return null;

  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return null;

  try {
    return deserializeQueueState(JSON.parse(saved));
  } catch (error) {
    console.error("Failed to parse queue state:", error);
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function saveQueueState(
  storageKey: string,
  state: PassQueueState
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey,
    JSON.stringify(serializeQueueState(state))
  );
}

export function clearQueueState(storageKey: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey);
}