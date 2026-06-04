'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
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
import { supabase, SUPABASE_ENABLED, CUP_YEAR } from './supabase';
import { MENU_BY_ID, type SubSize } from './menu';

export type MvpVote = {
  voterId: string;
  first: string | null;
  second: string | null;
  third: string | null;
  timestamp: number;
};

export type LunchLineItem = {
  // Stable id (uuid-ish) so items can be edited/removed without re-keying.
  lineId: string;
  itemId: string;           // matches MenuItem.id
  size?: SubSize;           // for sized items only
  bread?: string;
  cheese?: string;
  vegetables?: string[];
  condiments?: string[];
  notes?: string;
};

export type LunchOrder = {
  playerId: string;         // voter.id (last name) — uniquely identifies the player
  items: LunchLineItem[];
  timestamp: number;
};

export type TravelMode = 'flying' | 'driving';

export type TravelArrival = {
  playerId: string;         // voter.id (last name)
  date: string;             // YYYY-MM-DD
  time: string;             // HH:MM (24-hour)
  mode?: TravelMode;        // flying or driving (optional for back-compat)
  airport?: string;         // free text, only when mode === 'flying'
  notes?: string;           // e.g. "DL5121, terminal 4" or "driving with Yuri"
  timestamp: number;
};

export type AppState = {
  golfMatches: GolfMatch[];
  drinkingMatches: DrinkingState;
  beerPongWinner: 'harvey' | 'carbery' | null;
  beerPongStatus: 'in-progress' | 'final';
  mvpVotes: MvpVote[];
  mvpResultsRevealed: boolean;
  lunchOrders: LunchOrder[];
  travelArrivals: TravelArrival[];
};

function initialState(): AppState {
  return {
    golfMatches: JSON.parse(JSON.stringify(INITIAL_GOLF_MATCHES)),
    drinkingMatches: emptyDrinkingState(),
    beerPongWinner: null,
    beerPongStatus: 'in-progress',
    mvpVotes: [],
    mvpResultsRevealed: false,
    lunchOrders: [],
    travelArrivals: [],
  };
}

const STORAGE_KEY = 'cabin-cup-next-v1';

type Action =
  | { type: 'set'; state: AppState }
  | { type: 'patch'; patch: Partial<AppState> }
  | { type: 'reset' };

// Fields that survive a "Reset all scores" — coordination state, not scoring.
function preserveOnReset(state: AppState): Pick<AppState, 'lunchOrders' | 'travelArrivals'> {
  return {
    lunchOrders: state.lunchOrders,
    travelArrivals: state.travelArrivals,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'set':
      return action.state;
    case 'patch':
      return { ...state, ...action.patch };
    case 'reset':
      return { ...initialState(), ...preserveOnReset(state) };
  }
}

// Defensive normaliser used for both localStorage and Supabase payloads.
function normaliseState(raw: unknown): AppState {
  const data = (raw ?? {}) as Partial<AppState>;
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
  if (Array.isArray(data.lunchOrders)) {
    next.lunchOrders = data.lunchOrders
      .filter((o): o is LunchOrder => !!o && typeof o === 'object' && typeof o.playerId === 'string' && validIds.has(o.playerId))
      .map(o => ({
        playerId: o.playerId,
        timestamp: typeof o.timestamp === 'number' ? o.timestamp : Date.now(),
        items: Array.isArray(o.items)
          ? o.items
              .filter(it => !!it && typeof it === 'object' && typeof it.itemId === 'string' && MENU_BY_ID[it.itemId])
              .map(it => ({
                lineId: typeof it.lineId === 'string' ? it.lineId : `line-${Math.random().toString(36).slice(2, 10)}`,
                itemId: it.itemId,
                size: it.size === '6' || it.size === '12' ? it.size : undefined,
                bread: typeof it.bread === 'string' ? it.bread : undefined,
                cheese: typeof it.cheese === 'string' ? it.cheese : undefined,
                vegetables: Array.isArray(it.vegetables) ? it.vegetables.filter(v => typeof v === 'string') : undefined,
                condiments: Array.isArray(it.condiments) ? it.condiments.filter(v => typeof v === 'string') : undefined,
                notes: typeof it.notes === 'string' ? it.notes : undefined,
              }))
          : [],
      }));
  }
  if (Array.isArray(data.travelArrivals)) {
    next.travelArrivals = data.travelArrivals
      .filter((t): t is TravelArrival =>
        !!t && typeof t === 'object'
        && typeof t.playerId === 'string' && validIds.has(t.playerId)
        && typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date)
        && typeof t.time === 'string' && /^\d{2}:\d{2}$/.test(t.time)
      )
      .map(t => {
        const mode = t.mode === 'flying' || t.mode === 'driving' ? t.mode : undefined;
        return {
          playerId: t.playerId,
          date: t.date,
          time: t.time,
          mode,
          // Only keep airport when actually flying — otherwise it's stale ghost data.
          airport: mode === 'flying' && typeof t.airport === 'string' ? t.airport : undefined,
          notes: typeof t.notes === 'string' ? t.notes : undefined,
          timestamp: typeof t.timestamp === 'number' ? t.timestamp : Date.now(),
        };
      });
  }
  return next;
}

function loadFromStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normaliseState(JSON.parse(raw));
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

export type SyncStatus = 'offline' | 'connecting' | 'live' | 'error';

type Ctx = {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
  reset: () => void;
  hydrated: boolean;
  syncStatus: SyncStatus;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as unknown as AppState, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    SUPABASE_ENABLED ? 'connecting' : 'offline'
  );

  // We track the most recent JSON we either pushed or pulled, so that
  // realtime echoes don't trigger another save, and locally-induced state
  // changes don't trip a redundant write.
  const lastSyncedJsonRef = useRef<string>('');
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Hydrate from localStorage first (instant), then Supabase will overwrite.
  useEffect(() => {
    const loaded = loadFromStorage();
    if (loaded) dispatch({ type: 'set', state: loaded });
    setHydrated(true);
  }, []);

  // Pull initial state from Supabase + subscribe to realtime updates.
  useEffect(() => {
    if (!hydrated || !supabase) return;

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('cup_state')
          .select('state')
          .eq('year', CUP_YEAR)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.error('Supabase initial fetch failed', error);
          setSyncStatus('error');
          return;
        }
        if (data?.state) {
          const remote = normaliseState(data.state);
          const json = JSON.stringify(remote);
          lastSyncedJsonRef.current = json;
          dispatch({ type: 'set', state: remote });
        } else {
          // No row yet — seed with whatever we have locally.
          const seed = stateRef.current;
          lastSyncedJsonRef.current = JSON.stringify(seed);
          await supabase.from('cup_state').insert({ year: CUP_YEAR, state: seed });
        }
        setSyncStatus('live');
      } catch (err) {
        if (!cancelled) {
          console.error('Supabase init error', err);
          setSyncStatus('error');
        }
      }
    })();

    const channel = supabase
      .channel(`cup_state:${CUP_YEAR}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cup_state', filter: `year=eq.${CUP_YEAR}` },
        payload => {
          const incoming = (payload.new as { state?: unknown } | null)?.state;
          if (!incoming) return;
          const normalised = normaliseState(incoming);
          const json = JSON.stringify(normalised);
          if (json === lastSyncedJsonRef.current) return; // echo of our own write
          lastSyncedJsonRef.current = json;
          dispatch({ type: 'set', state: normalised });
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') setSyncStatus('live');
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setSyncStatus('error');
      });

    const sb = supabase;
    return () => {
      cancelled = true;
      sb.removeChannel(channel);
    };
  }, [hydrated]);

  // Persist on every change: always to localStorage; debounced to Supabase.
  const writeTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(state);

    const sb = supabase;
    if (!sb) return;
    const json = JSON.stringify(state);
    if (json === lastSyncedJsonRef.current) return;

    if (writeTimerRef.current) window.clearTimeout(writeTimerRef.current);
    writeTimerRef.current = window.setTimeout(async () => {
      // Optimistically advance the sync marker — if the write fails we roll it
      // back so the next state change (or our retry tick) re-attempts the push.
      const previousSynced = lastSyncedJsonRef.current;
      lastSyncedJsonRef.current = json;
      const { error } = await sb
        .from('cup_state')
        .upsert({ year: CUP_YEAR, state, updated_at: new Date().toISOString() });
      if (error) {
        console.error('Supabase upsert failed', error);
        lastSyncedJsonRef.current = previousSynced; // rollback for retry
        setSyncStatus('error');
      } else {
        setSyncStatus('live');
      }
    }, 400);
  }, [state, hydrated]);

  // When sync goes into error state, retry the last unsaved push every 5s
  // until it succeeds (or another state change supersedes it).
  useEffect(() => {
    if (syncStatus !== 'error') return;
    const sb = supabase;
    if (!sb) return;
    const tick = window.setInterval(async () => {
      const json = JSON.stringify(stateRef.current);
      if (json === lastSyncedJsonRef.current) return; // nothing pending
      const previous = lastSyncedJsonRef.current;
      lastSyncedJsonRef.current = json;
      const { error } = await sb
        .from('cup_state')
        .upsert({ year: CUP_YEAR, state: stateRef.current, updated_at: new Date().toISOString() });
      if (error) {
        lastSyncedJsonRef.current = previous;
      } else {
        setSyncStatus('live');
      }
    }, 5000);
    return () => window.clearInterval(tick);
  }, [syncStatus]);

  const patch = useCallback((p: Partial<AppState>) => dispatch({ type: 'patch', patch: p }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  const value = useMemo<Ctx>(
    () => ({ state, patch, reset, hydrated, syncStatus }),
    [state, patch, reset, hydrated, syncStatus]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
