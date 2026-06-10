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

// ---------------------------------------------------------------------------
// Types — unchanged from previous versions; rest of app should not care that
// the storage backend moved from one blob to per-row tables.
// ---------------------------------------------------------------------------

export type MvpVote = {
  voterId: string;
  first: string | null;
  second: string | null;
  third: string | null;
  timestamp: number;
};

export type LunchLineItem = {
  lineId: string;
  itemId: string;
  size?: SubSize;
  bread?: string;
  cheese?: string;
  vegetables?: string[];
  condiments?: string[];
  notes?: string;
};

export type LunchOrder = {
  playerId: string;
  items: LunchLineItem[];
  timestamp: number;
};

export type TravelMode = 'flying' | 'driving';

export type TravelArrival = {
  playerId: string;
  date: string;
  time: string;
  mode?: TravelMode;
  airport?: string;
  notes?: string;
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

// Things that survive a "Reset all scores" — coordination state and captain
// picks, never the scores themselves. Captain picks are the tournament's
// pre-game setup; wiping them on every reset would mean re-entering 12 + 54
// matchups every time we want to clear scores.
function preserveOnReset(state: AppState): Partial<AppState> {
  const fresh = initialState();

  // Overlay captain picks back onto the fresh golf matches
  const golfMatches = fresh.golfMatches.map(m => {
    const existing = state.golfMatches.find(x => x.id === m.id);
    if (!existing) return m;
    return {
      ...m,
      customHarvey: existing.customHarvey,
      customCarbery: existing.customCarbery,
    };
  });

  // Overlay captain picks back onto the fresh drinking matches
  const drinkingMatches = { ...fresh.drinkingMatches };
  (Object.keys(drinkingMatches) as DrinkingEventId[]).forEach(eventId => {
    const existingEvent = state.drinkingMatches[eventId] ?? {};
    Object.keys(drinkingMatches[eventId]).forEach(matchId => {
      const existing = existingEvent[matchId];
      if (!existing) return;
      drinkingMatches[eventId][matchId] = {
        ...drinkingMatches[eventId][matchId],
        customHarvey: existing.customHarvey,
        customCarbery: existing.customCarbery,
      };
    });
  });

  return {
    golfMatches,
    drinkingMatches,
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

// ---------------------------------------------------------------------------
// Defensive normaliser — used for both localStorage payloads and any external
// payloads. Keeps the rest of the app safe from malformed remote data.
// ---------------------------------------------------------------------------

function normaliseState(raw: unknown): AppState {
  const data = (raw ?? {}) as Partial<AppState>;
  const validIds = new Set(VOTERS.map(v => v.id));
  const next = initialState();
  if (Array.isArray(data.golfMatches) && data.golfMatches.length === next.golfMatches.length) {
    next.golfMatches = next.golfMatches.map((m, i) => {
      const saved = data.golfMatches?.[i];
      if (!saved) return m;
      return normaliseGolfMatch(saved, m);
    });
  }
  if (data.drinkingMatches && typeof data.drinkingMatches === 'object') {
    (Object.keys(DRINKING_MATCH_LISTS) as DrinkingEventId[]).forEach(eventId => {
      const stored = (data.drinkingMatches as DrinkingState)[eventId];
      if (!stored) return;
      DRINKING_MATCH_LISTS[eventId].forEach(m => {
        const s = stored[m.id] as DrinkingMatchState | undefined;
        if (!s) return;
        next.drinkingMatches[eventId][m.id] = normaliseDrinkingMatch(s);
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
      .map(normaliseMvpVote);
  }
  if (Array.isArray(data.lunchOrders)) {
    next.lunchOrders = data.lunchOrders
      .filter((o): o is LunchOrder => !!o && typeof o === 'object' && typeof o.playerId === 'string' && validIds.has(o.playerId))
      .map(normaliseLunchOrder);
  }
  if (Array.isArray(data.travelArrivals)) {
    next.travelArrivals = data.travelArrivals
      .filter((t): t is TravelArrival =>
        !!t && typeof t === 'object'
        && typeof t.playerId === 'string' && validIds.has(t.playerId)
        && typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date)
        && typeof t.time === 'string' && /^\d{2}:\d{2}$/.test(t.time)
      )
      .map(normaliseTravelArrival);
  }
  return next;
}

function normaliseGolfMatch(saved: Partial<GolfMatch>, base: GolfMatch): GolfMatch {
  return {
    ...base,
    holes: Array.isArray(saved.holes) && saved.holes.length === 9 ? saved.holes : base.holes,
    status: saved.status === 'Final' || saved.status === 'In Progress' ? saved.status : base.status,
    customHarvey: Array.isArray(saved.customHarvey)
      ? (saved.customHarvey as string[]).filter(x => typeof x === 'string')
      : base.customHarvey,
    customCarbery: Array.isArray(saved.customCarbery)
      ? (saved.customCarbery as string[]).filter(x => typeof x === 'string')
      : base.customCarbery,
  };
}

function normaliseDrinkingMatch(s: DrinkingMatchState): DrinkingMatchState {
  return {
    winner: s.winner === 'harvey' || s.winner === 'carbery' ? s.winner : null,
    status: s.status === 'final' ? 'final' : 'in-progress',
    customHarvey: Array.isArray(s.customHarvey)
      ? s.customHarvey.filter(x => typeof x === 'string')
      : null,
    customCarbery: Array.isArray(s.customCarbery)
      ? s.customCarbery.filter(x => typeof x === 'string')
      : null,
  };
}

function normaliseMvpVote(v: MvpVote): MvpVote {
  return {
    voterId: v.voterId,
    first: typeof v.first === 'string' ? v.first : null,
    second: typeof v.second === 'string' ? v.second : null,
    third: typeof v.third === 'string' ? v.third : null,
    timestamp: typeof v.timestamp === 'number' ? v.timestamp : Date.now(),
  };
}

function normaliseLunchOrder(o: LunchOrder): LunchOrder {
  return {
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
  };
}

function normaliseTravelArrival(t: TravelArrival): TravelArrival {
  const mode = t.mode === 'flying' || t.mode === 'driving' ? t.mode : undefined;
  return {
    playerId: t.playerId,
    date: t.date,
    time: t.time,
    mode,
    airport: mode === 'flying' && typeof t.airport === 'string' ? t.airport : undefined,
    notes: typeof t.notes === 'string' ? t.notes : undefined,
    timestamp: typeof t.timestamp === 'number' ? t.timestamp : Date.now(),
  };
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

// ---------------------------------------------------------------------------
// Per-row Supabase sync — assemble AppState from 6 tables, diff on writes,
// merge incoming rows from realtime.
// ---------------------------------------------------------------------------

// Row shapes (what Supabase actually stores).
type GolfRow      = { match_id: number; state: GolfMatch };
type DrinkRow     = { event_id: DrinkingEventId; match_id: string; state: DrinkingMatchState };
type MetaRow      = { beer_pong_winner: 'harvey' | 'carbery' | null; beer_pong_status: 'in-progress' | 'final'; mvp_results_revealed: boolean };
type MvpRow       = { voter_id: string; first_pick: string | null; second_pick: string | null; third_pick: string | null; vote_ts: number };
type LunchRow     = { player_id: string; items: LunchLineItem[]; order_ts: number };
type TravelRow    = { player_id: string; arr_date: string; arr_time: string; mode: string | null; airport: string | null; notes: string | null; arr_ts: number };

async function fetchAllRows(): Promise<AppState | null> {
  if (!supabase) return null;
  const [golf, drink, meta, mvp, lunch, travel] = await Promise.all([
    supabase.from('golf_matches').select('match_id, state').eq('year', CUP_YEAR),
    supabase.from('drinking_matches').select('event_id, match_id, state').eq('year', CUP_YEAR),
    supabase.from('cup_meta').select('beer_pong_winner, beer_pong_status, mvp_results_revealed').eq('year', CUP_YEAR).maybeSingle(),
    supabase.from('mvp_votes').select('voter_id, first_pick, second_pick, third_pick, vote_ts').eq('year', CUP_YEAR),
    supabase.from('lunch_orders').select('player_id, items, order_ts').eq('year', CUP_YEAR),
    supabase.from('travel_arrivals').select('player_id, arr_date, arr_time, mode, airport, notes, arr_ts').eq('year', CUP_YEAR),
  ]);

  // If any fetch errored at the network level, surface it.
  if (golf.error || drink.error || meta.error || mvp.error || lunch.error || travel.error) {
    const err = golf.error || drink.error || meta.error || mvp.error || lunch.error || travel.error;
    throw new Error(`Initial fetch failed: ${err?.message ?? 'unknown'}`);
  }

  const next = initialState();

  // Golf matches — per-id merge into the default 12.
  (golf.data as GolfRow[] | null)?.forEach(row => {
    const idx = next.golfMatches.findIndex(m => m.id === row.match_id);
    if (idx < 0) return;
    next.golfMatches[idx] = normaliseGolfMatch(row.state, next.golfMatches[idx]);
  });

  // Drinking matches — per (event_id, match_id) merge.
  (drink.data as DrinkRow[] | null)?.forEach(row => {
    if (!next.drinkingMatches[row.event_id]) return;
    next.drinkingMatches[row.event_id][row.match_id] = normaliseDrinkingMatch(row.state);
  });

  // Cup meta — singleton row.
  const metaRow = meta.data as MetaRow | null;
  if (metaRow) {
    next.beerPongWinner = metaRow.beer_pong_winner ?? null;
    next.beerPongStatus = metaRow.beer_pong_status ?? 'in-progress';
    next.mvpResultsRevealed = !!metaRow.mvp_results_revealed;
  }

  const validIds = new Set(VOTERS.map(v => v.id));

  // MVP votes — one row per voter.
  next.mvpVotes = ((mvp.data as MvpRow[] | null) ?? [])
    .filter(r => validIds.has(r.voter_id))
    .map(r => normaliseMvpVote({
      voterId: r.voter_id,
      first: r.first_pick,
      second: r.second_pick,
      third: r.third_pick,
      timestamp: r.vote_ts,
    }));

  // Lunch orders — one row per player.
  next.lunchOrders = ((lunch.data as LunchRow[] | null) ?? [])
    .filter(r => validIds.has(r.player_id))
    .map(r => normaliseLunchOrder({
      playerId: r.player_id,
      items: r.items as LunchLineItem[],
      timestamp: r.order_ts,
    }));

  // Travel arrivals — one row per player.
  next.travelArrivals = ((travel.data as TravelRow[] | null) ?? [])
    .filter(r => validIds.has(r.player_id))
    .map(r => normaliseTravelArrival({
      playerId: r.player_id,
      date: r.arr_date,
      time: r.arr_time,
      mode: r.mode === 'flying' || r.mode === 'driving' ? r.mode : undefined,
      airport: r.airport ?? undefined,
      notes: r.notes ?? undefined,
      timestamp: r.arr_ts,
    }));

  return next;
}

// Quick check: is this state functionally equivalent to a fresh initialState?
// Used to decide whether to overwrite local with remote on initial hydration.
function isEmptyState(s: AppState): boolean {
  return (
    s.golfMatches.every(m => m.status === 'In Progress' && m.holes.every(h => h === 0) && !m.customHarvey && !m.customCarbery)
    && Object.values(s.drinkingMatches).every(em =>
      Object.values(em).every(m => !m.winner && m.status === 'in-progress' && !m.customHarvey && !m.customCarbery)
    )
    && s.beerPongWinner === null
    && s.beerPongStatus === 'in-progress'
    && !s.mvpResultsRevealed
    && s.mvpVotes.length === 0
    && s.lunchOrders.length === 0
    && s.travelArrivals.length === 0
  );
}

// Diff prev → next state and issue per-row upserts/deletes only for the
// rows that actually changed.
async function persistDiff(prev: AppState, next: AppState): Promise<void> {
  if (!supabase) return;
  const writes: PromiseLike<unknown>[] = [];

  // --- Golf matches (12 rows max) ---
  next.golfMatches.forEach(m => {
    const old = prev.golfMatches.find(x => x.id === m.id);
    if (!old || JSON.stringify(old) !== JSON.stringify(m)) {
      writes.push(supabase!.from('golf_matches').upsert({
        year: CUP_YEAR, match_id: m.id, state: m,
        updated_at: new Date().toISOString(),
      }));
    }
  });

  // --- Drinking matches ---
  (Object.keys(next.drinkingMatches) as DrinkingEventId[]).forEach(eventId => {
    const newMap = next.drinkingMatches[eventId];
    const oldMap = prev.drinkingMatches?.[eventId] ?? {};
    Object.keys(newMap).forEach(matchId => {
      const newMatch = newMap[matchId];
      const oldMatch = oldMap[matchId];
      if (!oldMatch || JSON.stringify(oldMatch) !== JSON.stringify(newMatch)) {
        writes.push(supabase!.from('drinking_matches').upsert({
          year: CUP_YEAR, event_id: eventId, match_id: matchId, state: newMatch,
          updated_at: new Date().toISOString(),
        }));
      }
    });
  });

  // --- Cup meta (singleton row) ---
  if (
    next.beerPongWinner    !== prev.beerPongWinner ||
    next.beerPongStatus    !== prev.beerPongStatus ||
    next.mvpResultsRevealed !== prev.mvpResultsRevealed
  ) {
    writes.push(supabase!.from('cup_meta').upsert({
      year: CUP_YEAR,
      beer_pong_winner: next.beerPongWinner,
      beer_pong_status: next.beerPongStatus,
      mvp_results_revealed: next.mvpResultsRevealed,
      updated_at: new Date().toISOString(),
    }));
  }

  // --- MVP votes (one row per voter) ---
  next.mvpVotes.forEach(v => {
    const old = prev.mvpVotes.find(x => x.voterId === v.voterId);
    if (!old || JSON.stringify(old) !== JSON.stringify(v)) {
      writes.push(supabase!.from('mvp_votes').upsert({
        year: CUP_YEAR, voter_id: v.voterId,
        first_pick: v.first, second_pick: v.second, third_pick: v.third,
        vote_ts: v.timestamp,
        updated_at: new Date().toISOString(),
      }));
    }
  });
  // Deleted votes (e.g., reset)
  prev.mvpVotes.forEach(v => {
    if (!next.mvpVotes.some(x => x.voterId === v.voterId)) {
      writes.push(supabase!.from('mvp_votes').delete().eq('year', CUP_YEAR).eq('voter_id', v.voterId));
    }
  });

  // --- Lunch orders (one row per player) ---
  next.lunchOrders.forEach(o => {
    const old = prev.lunchOrders.find(x => x.playerId === o.playerId);
    if (!old || JSON.stringify(old) !== JSON.stringify(o)) {
      writes.push(supabase!.from('lunch_orders').upsert({
        year: CUP_YEAR, player_id: o.playerId,
        items: o.items, order_ts: o.timestamp,
        updated_at: new Date().toISOString(),
      }));
    }
  });
  prev.lunchOrders.forEach(o => {
    if (!next.lunchOrders.some(x => x.playerId === o.playerId)) {
      writes.push(supabase!.from('lunch_orders').delete().eq('year', CUP_YEAR).eq('player_id', o.playerId));
    }
  });

  // --- Travel arrivals (one row per player) ---
  next.travelArrivals.forEach(t => {
    const old = prev.travelArrivals.find(x => x.playerId === t.playerId);
    if (!old || JSON.stringify(old) !== JSON.stringify(t)) {
      writes.push(supabase!.from('travel_arrivals').upsert({
        year: CUP_YEAR, player_id: t.playerId,
        arr_date: t.date, arr_time: t.time,
        mode: t.mode ?? null, airport: t.airport ?? null, notes: t.notes ?? null,
        arr_ts: t.timestamp,
        updated_at: new Date().toISOString(),
      }));
    }
  });
  prev.travelArrivals.forEach(t => {
    if (!next.travelArrivals.some(x => x.playerId === t.playerId)) {
      writes.push(supabase!.from('travel_arrivals').delete().eq('year', CUP_YEAR).eq('player_id', t.playerId));
    }
  });

  if (writes.length === 0) return;
  await Promise.all(writes);
}

// ---------------------------------------------------------------------------
// React provider
// ---------------------------------------------------------------------------

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

  // Last state we successfully synced (sent to or received from Supabase).
  // Used to compute diffs for writes and skip echoes from realtime.
  const lastSyncedRef = useRef<AppState>(initialState());
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Tracks whether the latest state change came from a user action vs a
  // remote sync. Only user actions trigger debounced Supabase writes.
  const userInitiatedRef = useRef(false);

  // 1) Hydrate from localStorage immediately (instant first paint).
  useEffect(() => {
    const loaded = loadFromStorage();
    if (loaded) {
      dispatch({ type: 'set', state: loaded });
      lastSyncedRef.current = loaded;
    }
    setHydrated(true);
  }, []);

  // 2) Fetch from Supabase + subscribe to realtime changes.
  useEffect(() => {
    if (!hydrated || !supabase) return;

    let cancelled = false;

    (async () => {
      try {
        const remote = await fetchAllRows();
        if (cancelled || !remote) return;

        // Did any per-row table actually contain a row? If yes, remote is the
        // authoritative shared state and we adopt it. If no, this is a fresh
        // Supabase and we push our local state up to seed it.
        const remoteIsEmpty = isEmptyState(remote);

        if (!remoteIsEmpty) {
          lastSyncedRef.current = remote;
          dispatch({ type: 'set', state: remote });
        } else {
          const seed = stateRef.current;
          if (!isEmptyState(seed)) {
            lastSyncedRef.current = initialState();
            await persistDiff(initialState(), seed);
          }
          lastSyncedRef.current = seed;
        }
        setSyncStatus('live');
      } catch (err) {
        if (!cancelled) {
          console.error('Supabase init error', err);
          setSyncStatus('error');
        }
      }
    })();

    // One channel, multiple table listeners.
    const channel = supabase.channel(`cup:${CUP_YEAR}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const on = (table: string, handler: (p: any) => void) =>
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `year=eq.${CUP_YEAR}` },
        handler
      );

    on('golf_matches',     handleGolfChange);
    on('drinking_matches', handleDrinkingChange);
    on('cup_meta',         handleMetaChange);
    on('mvp_votes',        handleMvpChange);
    on('lunch_orders',     handleLunchChange);
    on('travel_arrivals',  handleTravelChange);

    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') setSyncStatus('live');
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setSyncStatus('error');
    });

    const sb = supabase;
    return () => {
      cancelled = true;
      sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // --- Realtime row handlers ---

  function applyMerged(merge: (s: AppState) => AppState) {
    const merged = merge(stateRef.current);
    lastSyncedRef.current = merged;
    dispatch({ type: 'set', state: merged });
  }

  function handleGolfChange(payload: { eventType: string; new: GolfRow; old: GolfRow | null }) {
    const row = payload.new;
    if (!row || typeof row.match_id !== 'number') return;
    applyMerged(s => ({
      ...s,
      golfMatches: s.golfMatches.map(m =>
        m.id === row.match_id ? normaliseGolfMatch(row.state, m) : m
      ),
    }));
  }

  function handleDrinkingChange(payload: { eventType: string; new: DrinkRow; old: DrinkRow | null }) {
    const row = payload.new;
    if (!row || !row.event_id || !row.match_id) return;
    applyMerged(s => {
      const newDrinking = { ...s.drinkingMatches } as DrinkingState;
      newDrinking[row.event_id] = {
        ...newDrinking[row.event_id],
        [row.match_id]: normaliseDrinkingMatch(row.state),
      };
      return { ...s, drinkingMatches: newDrinking };
    });
  }

  function handleMetaChange(payload: { eventType: string; new: MetaRow; old: MetaRow | null }) {
    const row = payload.new;
    if (!row) return;
    applyMerged(s => ({
      ...s,
      beerPongWinner: row.beer_pong_winner === 'harvey' || row.beer_pong_winner === 'carbery' ? row.beer_pong_winner : null,
      beerPongStatus: row.beer_pong_status === 'final' ? 'final' : 'in-progress',
      mvpResultsRevealed: !!row.mvp_results_revealed,
    }));
  }

  function handleMvpChange(payload: { eventType: string; new: MvpRow; old: MvpRow | null }) {
    const row = payload.new;
    const old = payload.old;
    applyMerged(s => {
      let votes = s.mvpVotes;
      if (payload.eventType === 'DELETE' && old?.voter_id) {
        votes = votes.filter(v => v.voterId !== old.voter_id);
      } else if (row?.voter_id) {
        const next = normaliseMvpVote({
          voterId: row.voter_id,
          first: row.first_pick, second: row.second_pick, third: row.third_pick,
          timestamp: row.vote_ts,
        });
        votes = votes.some(v => v.voterId === next.voterId)
          ? votes.map(v => v.voterId === next.voterId ? next : v)
          : [...votes, next];
      }
      return { ...s, mvpVotes: votes };
    });
  }

  function handleLunchChange(payload: { eventType: string; new: LunchRow; old: LunchRow | null }) {
    const row = payload.new;
    const old = payload.old;
    applyMerged(s => {
      let orders = s.lunchOrders;
      if (payload.eventType === 'DELETE' && old?.player_id) {
        orders = orders.filter(o => o.playerId !== old.player_id);
      } else if (row?.player_id) {
        const next = normaliseLunchOrder({
          playerId: row.player_id,
          items: row.items as LunchLineItem[],
          timestamp: row.order_ts,
        });
        orders = orders.some(o => o.playerId === next.playerId)
          ? orders.map(o => o.playerId === next.playerId ? next : o)
          : [...orders, next];
      }
      return { ...s, lunchOrders: orders };
    });
  }

  function handleTravelChange(payload: { eventType: string; new: TravelRow; old: TravelRow | null }) {
    const row = payload.new;
    const old = payload.old;
    applyMerged(s => {
      let arrivals = s.travelArrivals;
      if (payload.eventType === 'DELETE' && old?.player_id) {
        arrivals = arrivals.filter(a => a.playerId !== old.player_id);
      } else if (row?.player_id) {
        const next = normaliseTravelArrival({
          playerId: row.player_id,
          date: row.arr_date, time: row.arr_time,
          mode: row.mode === 'flying' || row.mode === 'driving' ? row.mode : undefined,
          airport: row.airport ?? undefined,
          notes: row.notes ?? undefined,
          timestamp: row.arr_ts,
        });
        arrivals = arrivals.some(a => a.playerId === next.playerId)
          ? arrivals.map(a => a.playerId === next.playerId ? next : a)
          : [...arrivals, next];
      }
      return { ...s, travelArrivals: arrivals };
    });
  }

  // 3) Persist on every state change: localStorage immediately, Supabase debounced.
  const writeTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(state);

    if (!supabase) return;

    // Only push to Supabase for USER-initiated changes. Remote-originated
    // changes already are at Supabase — we'd just be echoing.
    if (!userInitiatedRef.current) return;
    userInitiatedRef.current = false;

    if (writeTimerRef.current) window.clearTimeout(writeTimerRef.current);
    writeTimerRef.current = window.setTimeout(async () => {
      try {
        await persistDiff(lastSyncedRef.current, state);
        lastSyncedRef.current = state;
        setSyncStatus('live');
      } catch (err) {
        console.error('Supabase persist failed', err);
        setSyncStatus('error');
      }
    }, 150);
  }, [state, hydrated]);

  // 4) Retry on error: every 5s, attempt to push any pending diff or ping read.
  useEffect(() => {
    if (syncStatus !== 'error') return;
    const sb = supabase;
    if (!sb) return;
    const tick = window.setInterval(async () => {
      try {
        await persistDiff(lastSyncedRef.current, stateRef.current);
        lastSyncedRef.current = stateRef.current;
        setSyncStatus('live');
      } catch {
        // Connectivity ping
        const { error } = await sb.from('cup_meta').select('year').eq('year', CUP_YEAR).limit(1);
        if (!error) setSyncStatus('live');
      }
    }, 5000);
    return () => window.clearInterval(tick);
  }, [syncStatus]);

  const patch = useCallback((p: Partial<AppState>) => {
    userInitiatedRef.current = true;
    dispatch({ type: 'patch', patch: p });
  }, []);
  const reset = useCallback(() => {
    userInitiatedRef.current = true;
    dispatch({ type: 'reset' });
  }, []);

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
