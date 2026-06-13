import {
  DRINKING_MATCH_LISTS,
  type DrinkingEventId,
  type DrinkingState,
  type GolfMatch,
} from './matches';
import {
  BEER_PONG_CAPTAINS_POINTS,
  DRINKING_POINTS_PER_WIN_BY_EVENT,
  EVENT_IDS,
  type EventId,
} from './cup';

export type Side = 'harvey' | 'carbery';

export type Totals = { harvey: number; carbery: number };

export function matchScores(match: GolfMatch): Totals {
  const ties = match.holes.filter(h => h === 2).length;
  return {
    harvey: match.holes.filter(h => h === 1).length + ties * 0.5,
    carbery: match.holes.filter(h => h === -1).length + ties * 0.5,
  };
}

export function golfTotals(golfMatches: GolfMatch[]): Totals {
  let harvey = 0;
  let carbery = 0;
  golfMatches.forEach(m => {
    const s = matchScores(m);
    harvey += s.harvey;
    carbery += s.carbery;
  });
  return { harvey, carbery };
}

export function captainsBeerPongTotals(winner: 'harvey' | 'carbery' | null): Totals {
  return {
    harvey: winner === 'harvey' ? BEER_PONG_CAPTAINS_POINTS : 0,
    carbery: winner === 'carbery' ? BEER_PONG_CAPTAINS_POINTS : 0,
  };
}

export function drinkingEventTotals(
  eventId: DrinkingEventId,
  drinking: DrinkingState,
): Totals {
  let h = 0;
  let c = 0;
  const pts = DRINKING_POINTS_PER_WIN_BY_EVENT[eventId];
  Object.values(drinking[eventId] ?? {}).forEach(m => {
    if (m.winner === 'harvey') h += pts;
    else if (m.winner === 'carbery') c += pts;
  });
  return { harvey: h, carbery: c };
}

export function eventTotal(
  eventId: EventId,
  args: {
    golfMatches: GolfMatch[];
    drinking: DrinkingState;
    captainsBeerPongWinner: 'harvey' | 'carbery' | null;
  },
): Totals {
  if (eventId === 'golf') return golfTotals(args.golfMatches);
  if (eventId === 'captains-beer-pong') return captainsBeerPongTotals(args.captainsBeerPongWinner);
  return drinkingEventTotals(eventId as DrinkingEventId, args.drinking);
}

export function teamTotals(args: {
  golfMatches: GolfMatch[];
  drinking: DrinkingState;
  captainsBeerPongWinner: 'harvey' | 'carbery' | null;
}): Totals {
  let harvey = 0;
  let carbery = 0;
  EVENT_IDS.forEach(id => {
    const t = eventTotal(id, args);
    harvey += t.harvey;
    carbery += t.carbery;
  });
  return { harvey, carbery };
}

// === MVP Stats ===
export type EventStats = {
  w: number;
  l: number;
  t: number;
  pf: number;
  pa: number;
  pm: number;
};
export type PlayerStats = {
  team: Side;
  events: Record<EventId, EventStats>;
  overall: EventStats & { gp: number };
  winPct: number;
};

const blankEvent = (): EventStats => ({ w: 0, l: 0, t: 0, pf: 0, pa: 0, pm: 0 });

function blankStats(team: Side): PlayerStats {
  return {
    team,
    events: {
      golf: blankEvent(),
      'beer-die': blankEvent(),
      bags: blankEvent(),
      'beer-pong': blankEvent(),
      'captains-beer-pong': blankEvent(),
    },
    overall: { ...blankEvent(), gp: 0 },
    winPct: 0,
  };
}

export function computePlayerStats(args: {
  golfMatches: GolfMatch[];
  drinking: DrinkingState;
  captainsBeerPongWinner: 'harvey' | 'carbery' | null;
}): Record<string, PlayerStats> {
  const stats: Record<string, PlayerStats> = {};
  const ensure = (name: string, team: Side) => {
    if (!stats[name]) stats[name] = blankStats(team);
    return stats[name];
  };

  // 1. Golf
  args.golfMatches.forEach(m => {
    const anyPlayed = m.holes.some(h => h !== 0);
    if (!anyPlayed && m.status !== 'Final') return;
    const { harvey, carbery } = matchScores(m);
    const hp = m.customHarvey ?? [];
    const cp = m.customCarbery ?? [];
    if (hp.length === 0 && cp.length === 0) return;

    let hRes: 'w' | 'l' | 't';
    let cRes: 'w' | 'l' | 't';
    if (harvey > carbery) { hRes = 'w'; cRes = 'l'; }
    else if (carbery > harvey) { hRes = 'l'; cRes = 'w'; }
    else { hRes = 't'; cRes = 't'; }

    hp.forEach(p => {
      const s = ensure(p, 'harvey');
      s.events.golf[hRes]++;
      s.events.golf.pf += harvey;
      s.events.golf.pa += carbery;
    });
    cp.forEach(p => {
      const s = ensure(p, 'carbery');
      s.events.golf[cRes]++;
      s.events.golf.pf += carbery;
      s.events.golf.pa += harvey;
    });
  });

  // 2. Drinking events
  (['beer-die', 'bags', 'beer-pong'] as const).forEach(eventId => {
    const matches = DRINKING_MATCH_LISTS[eventId];
    const map = args.drinking[eventId];
    matches.forEach(m => {
      const w = map[m.id];
      if (!w || !w.winner) return;
      let hPlayers: string[];
      let cPlayers: string[];
      if (m.type === 'captain-pick') {
        hPlayers = w.customHarvey ?? [];
        cPlayers = w.customCarbery ?? [];
        if (hPlayers.length === 0 && cPlayers.length === 0) return;
      } else {
        hPlayers = m.harvey.split(' & ').map(x => x.trim());
        cPlayers = m.carbery.split(' & ').map(x => x.trim());
      }
      const harveyWon = w.winner === 'harvey';
      const pts = DRINKING_POINTS_PER_WIN_BY_EVENT[eventId];
      hPlayers.forEach(p => {
        const s = ensure(p, 'harvey');
        s.events[eventId][harveyWon ? 'w' : 'l']++;
        s.events[eventId].pf += harveyWon ? pts : 0;
        s.events[eventId].pa += harveyWon ? 0 : pts;
      });
      cPlayers.forEach(p => {
        const s = ensure(p, 'carbery');
        s.events[eventId][harveyWon ? 'l' : 'w']++;
        s.events[eventId].pf += harveyWon ? 0 : pts;
        s.events[eventId].pa += harveyWon ? pts : 0;
      });
    });
  });

  // 3. Captains' beer pong
  if (args.captainsBeerPongWinner) {
    const h = ensure('Harvey', 'harvey');
    const c = ensure('Carbery', 'carbery');
    if (args.captainsBeerPongWinner === 'harvey') {
      h.events['captains-beer-pong'].w++;
      h.events['captains-beer-pong'].pf += 1;
      c.events['captains-beer-pong'].l++;
      c.events['captains-beer-pong'].pa += 1;
    } else {
      c.events['captains-beer-pong'].w++;
      c.events['captains-beer-pong'].pf += 1;
      h.events['captains-beer-pong'].l++;
      h.events['captains-beer-pong'].pa += 1;
    }
  }

  // Derive pm + overall + win%
  Object.values(stats).forEach(s => {
    Object.values(s.events).forEach(e => { e.pm = e.pf - e.pa; });
    let w = 0, l = 0, t = 0, pf = 0, pa = 0;
    Object.values(s.events).forEach(e => {
      w += e.w; l += e.l; t += e.t; pf += e.pf; pa += e.pa;
    });
    const gp = w + l + t;
    s.overall = { w, l, t, pf, pa, pm: pf - pa, gp };
    s.winPct = gp > 0 ? ((w + 0.5 * t) / gp) * 100 : 0;
  });

  return stats;
}

export function aggregateEvents(playerStats: PlayerStats, eventIds: EventId[]): EventStats & { gp: number; pct: number } {
  let w = 0, l = 0, t = 0, pf = 0, pa = 0;
  eventIds.forEach(id => {
    const e = playerStats.events[id];
    if (e) { w += e.w; l += e.l; t += e.t; pf += e.pf; pa += e.pa; }
  });
  const gp = w + l + t;
  return { w, l, t, pf, pa, pm: pf - pa, gp, pct: gp > 0 ? ((w + 0.5 * t) / gp) * 100 : 0 };
}
