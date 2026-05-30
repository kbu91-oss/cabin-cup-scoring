'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import {
  INITIAL_GOLF_MATCHES,
  emptyDrinkingState,
  type GolfMatch,
  type DrinkingState,
  type DrinkingEventId,
  type DrinkingMatchState,
  DRINKING_MATCH_LISTS,
} from './matches';
import { VOTERS } from './teams';

export type MvpVote = {
  voterId: string;
  first: string | null;
  second: string | null;
  third: string | null;
  timestamp: number;
};

export type AppState = {
  golfMatches: GolfMatch[];
  drinkingMatches: DrinkingState;
  beerPongWinner: 'harvey' | 'carbery' | null;
  beerPongStatus: 'in-progress' | 'final';
  mvpVotes: MvpVote[];
  mvpResultsRevealed: boolean;
};

function initialState(): AppState {
  return {
    golfMatches: JSON.parse(JSON.stringify(INITIAL_GOLF_MATCHES)),
    drinkingMatches: emptyDrinkingState(),
    beerPongWinner: null,
    beerPongStatus: 'in-progress',
    mvpVotes: [],
    mvpResultsRevealed: false,
  };
}

const STORAGE_KEY = 'cabin-cup-next-v1';

type Action =
  | { type: 'set'; state: AppState }
  | { type: 'patch'; patch: Partial<AppState> }
  | { type: 'reset' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'set':
      return action.state;
    case 'patch':
      return { ...state, ...action.patch };
    case 'reset':
      return initialState();
  }
}

function loadFromStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<AppState>;
    const validIds = new Set(VOTERS.map(v => v.id));
    const next = initialState();
    if (Array.isArray(data.golfMatches) && data.golfMatches.length === next.golfMatches.length) {
      next.golfMatches = next.golfMatches.map((m, i) => {
        const saved = data.golfMatches?.[i];
        if (!saved) return m;
        return {
          ...m,
          holes: Array.isArray(saved.holes) && saved.holes.length === 9 ? saved.holes : m.holes,
          status: saved.status === 'Final' || saved.status === 'In Progress' ? saved.status : m.status,
          customHarvey: Array.isArray(saved.customHarvey)
            ? (saved.customHarvey as string[]).filter(x => typeof x === 'string')
            : m.customHarvey,
          customCarbery: Array.isArray(saved.customCarbery)
            ? (saved.customCarbery as string[]).filter(x => typeof x === 'string')
            : m.customCarbery,
        };
      });
    }
    if (data.drinkingMatches && typeof data.drinkingMatches === 'object') {
      (Object.keys(DRINKING_MATCH_LISTS) as DrinkingEventId[]).forEach(eventId => {
        const stored = (data.drinkingMatches as DrinkingState)[eventId];
        if (!stored) return;
        DRINKING_MATCH_LISTS[eventId].forEach(m => {
          const s = stored[m.id] as DrinkingMatchState | undefined;
          if (!s || typeof s !== 'object') return;
          next.drinkingMatches[eventId][m.id] = {
            winner: s.winner === 'harvey' || s.winner === 'carbery' ? s.winner : null,
            status: s.status === 'final' ? 'final' : 'in-progress',
            customHarvey: Array.isArray(s.customHarvey)
              ? s.customHarvey.filter(x => typeof x === 'string')
              : null,
            customCarbery: Array.isArray(s.customCarbery)
              ? s.customCarbery.filter(x => typeof x === 'string')
              : null,
          };
        });
      });
    }
    if (data.beerPongWinner === 'harvey' || data.beerPongWinner === 'carbery') {
      next.beerPongWinner = data.beerPongWinner;
    }
    if (data.beerPongStatus === 'final' || data.beerPongStatus === 'in-progress') {
      next.beerPongStatus = data.beerPongStatus;
    }
    if (typeof data.mvpResultsRevealed === 'boolean') next.mvpResultsRevealed = data.mvpResultsRevealed;
    if (Array.isArray(data.mvpVotes)) {
      next.mvpVotes = data.mvpVotes
        .filter((v): v is MvpVote => !!v && typeof v === 'object' && typeof v.voterId === 'string' && validIds.has(v.voterId))
        .map(v => ({
          voterId: v.voterId,
          first: typeof v.first === 'string' ? v.first : null,
          second: typeof v.second === 'string' ? v.second : null,
          third: typeof v.third === 'string' ? v.third : null,
          timestamp: typeof v.timestamp === 'number' ? v.timestamp : Date.now(),
        }));
    }
    return next;
  } catch {
    return null;
  }
}

function saveToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

type Ctx = {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
  reset: () => void;
  hydrated: boolean;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as unknown as AppState, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once, after first paint.
  useEffect(() => {
    const loaded = loadFromStorage();
    if (loaded) dispatch({ type: 'set', state: loaded });
    setHydrated(true);
  }, []);

  // Persist on every change (but not before hydration).
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(state);
  }, [state, hydrated]);

  const patch = useCallback((p: Partial<AppState>) => dispatch({ type: 'patch', patch: p }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  const value = useMemo<Ctx>(() => ({ state, patch, reset, hydrated }), [state, patch, reset, hydrated]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
