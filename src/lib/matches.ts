import type { RoundId } from './cup';

// === GOLF ===
export type GolfMatchFormat = '2v2' | '3v3';
export type GolfMatchStatus = 'In Progress' | 'Final';

export type GolfMatch = {
  id: number;
  round: RoundId;
  holeStart: number;
  format: GolfMatchFormat;
  status: GolfMatchStatus;
  holes: number[]; // 9 ints — 0 not played, 1 harvey win, -1 carbery win, 2 tie
  customHarvey: string[] | null;
  customCarbery: string[] | null;
};

const makeGolfMatch = (
  id: number,
  round: RoundId,
  holeStart: number,
  format: GolfMatchFormat,
): GolfMatch => ({
  id,
  round,
  holeStart,
  format,
  status: 'In Progress',
  holes: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  customHarvey: null,
  customCarbery: null,
});

export const INITIAL_GOLF_MATCHES: GolfMatch[] = [
  makeGolfMatch(1, 'mountain-front', 1, '2v2'),
  makeGolfMatch(2, 'mountain-front', 1, '2v2'),
  makeGolfMatch(3, 'mountain-front', 1, '3v3'),
  makeGolfMatch(4, 'mountain-back', 10, '2v2'),
  makeGolfMatch(5, 'mountain-back', 10, '2v2'),
  makeGolfMatch(6, 'mountain-back', 10, '3v3'),
  makeGolfMatch(7, 'links-front', 1, '2v2'),
  makeGolfMatch(8, 'links-front', 1, '2v2'),
  makeGolfMatch(9, 'links-front', 1, '3v3'),
  makeGolfMatch(10, 'links-back', 10, '2v2'),
  makeGolfMatch(11, 'links-back', 10, '2v2'),
  makeGolfMatch(12, 'links-back', 10, '3v3'),
];

// === DRINKING ===
export const ROTATION_MATCH_COUNT = 14;
export const CAPTAIN_PICK_COUNT = 4;
export const DRINKING_MATCH_COUNT = ROTATION_MATCH_COUNT + CAPTAIN_PICK_COUNT; // 18

export type DrinkingEventId = 'beer-die' | 'bags' | 'beer-pong';

export type DrinkingMatch = {
  id: string;
  type: 'rotation' | 'captain-pick';
  slot: number;
  harvey: string;  // joined display like "Harvey & Bouharevich"
  carbery: string;
};

// Pre-computed schedules — slot-disjoint, partner-covered, matchup-unique.
const SCHEDULED: Record<DrinkingEventId, { harvey: string; carbery: string; slot: number }[]> = {
  'beer-die': [
    { harvey: 'Harvey & Bouharevich',     carbery: 'Carbery & Bui',         slot: 1 },
    { harvey: 'Arnt & Hibbeler',          carbery: 'Luczyk & Sanner',        slot: 1 },
    { harvey: 'Meyers & Tiefenwerth',     carbery: 'Robinson & Hilbrich',   slot: 2 },
    { harvey: 'Barron & Harvey',           carbery: 'Soren & Carbery',       slot: 2 },
    { harvey: 'Bouharevich & Arnt',       carbery: 'Bui & Luczyk',           slot: 3 },
    { harvey: 'Hibbeler & Meyers',        carbery: 'Sanner & Robinson',     slot: 3 },
    { harvey: 'Tiefenwerth & Barron',      carbery: 'Hilbrich & Soren',      slot: 4 },
    { harvey: 'Harvey & Arnt',            carbery: 'Carbery & Luczyk',       slot: 4 },
    { harvey: 'Bouharevich & Hibbeler',   carbery: 'Bui & Sanner',          slot: 5 },
    { harvey: 'Meyers & Barron',           carbery: 'Robinson & Soren',      slot: 5 },
    { harvey: 'Tiefenwerth & Harvey',     carbery: 'Hilbrich & Carbery',    slot: 6 },
    { harvey: 'Arnt & Meyers',            carbery: 'Luczyk & Robinson',      slot: 6 },
    { harvey: 'Hibbeler & Tiefenwerth',   carbery: 'Sanner & Hilbrich',     slot: 7 },
    { harvey: 'Bouharevich & Barron',      carbery: 'Bui & Soren',           slot: 7 },
  ],
  'bags': [
    { harvey: 'Harvey & Hibbeler',          carbery: 'Carbery & Sanner',      slot: 1 },
    { harvey: 'Bouharevich & Meyers',       carbery: 'Bui & Robinson',        slot: 1 },
    { harvey: 'Harvey & Meyers',            carbery: 'Carbery & Robinson',    slot: 2 },
    { harvey: 'Bouharevich & Tiefenwerth',  carbery: 'Bui & Hilbrich',        slot: 2 },
    { harvey: 'Arnt & Barron',               carbery: 'Luczyk & Soren',         slot: 3 },
    { harvey: 'Bouharevich & Hibbeler',     carbery: 'Robinson & Hilbrich',   slot: 3 },
    { harvey: 'Hibbeler & Barron',           carbery: 'Sanner & Soren',        slot: 4 },
    { harvey: 'Arnt & Tiefenwerth',         carbery: 'Luczyk & Hilbrich',      slot: 4 },
    { harvey: 'Harvey & Arnt',              carbery: 'Bui & Sanner',          slot: 5 },
    { harvey: 'Meyers & Tiefenwerth',       carbery: 'Carbery & Luczyk',       slot: 5 },
    { harvey: 'Harvey & Barron',             carbery: 'Luczyk & Robinson',      slot: 6 },
    { harvey: 'Arnt & Meyers',              carbery: 'Carbery & Soren',       slot: 6 },
    { harvey: 'Bouharevich & Barron',        carbery: 'Sanner & Hilbrich',     slot: 7 },
    { harvey: 'Hibbeler & Tiefenwerth',     carbery: 'Bui & Soren',           slot: 7 },
  ],
  'beer-pong': [
    { harvey: 'Harvey & Bouharevich',       carbery: 'Luczyk & Sanner',        slot: 1 },
    { harvey: 'Arnt & Hibbeler',            carbery: 'Carbery & Bui',         slot: 1 },
    { harvey: 'Bouharevich & Arnt',         carbery: 'Sanner & Robinson',     slot: 2 },
    { harvey: 'Hibbeler & Meyers',          carbery: 'Bui & Luczyk',           slot: 2 },
    { harvey: 'Tiefenwerth & Barron',        carbery: 'Robinson & Soren',      slot: 3 },
    { harvey: 'Harvey & Hibbeler',          carbery: 'Hilbrich & Carbery',    slot: 3 },
    { harvey: 'Meyers & Barron',             carbery: 'Hilbrich & Soren',      slot: 4 },
    { harvey: 'Tiefenwerth & Harvey',       carbery: 'Carbery & Sanner',      slot: 4 },
    { harvey: 'Harvey & Meyers',            carbery: 'Bui & Robinson',        slot: 5 },
    { harvey: 'Bouharevich & Tiefenwerth',  carbery: 'Luczyk & Soren',         slot: 5 },
    { harvey: 'Bouharevich & Meyers',       carbery: 'Carbery & Robinson',    slot: 6 },
    { harvey: 'Arnt & Barron',               carbery: 'Bui & Hilbrich',        slot: 6 },
    { harvey: 'Hibbeler & Barron',           carbery: 'Luczyk & Hilbrich',      slot: 7 },
    { harvey: 'Arnt & Tiefenwerth',         carbery: 'Sanner & Soren',        slot: 7 },
  ],
};

export const DRINKING_MATCH_LISTS: Record<DrinkingEventId, DrinkingMatch[]> = (() => {
  const out = {} as Record<DrinkingEventId, DrinkingMatch[]>;
  (Object.keys(SCHEDULED) as DrinkingEventId[]).forEach(eventId => {
    const matches: DrinkingMatch[] = [];
    SCHEDULED[eventId].forEach((m, i) => {
      matches.push({
        id: `${eventId}-r${i + 1}`,
        type: 'rotation',
        slot: m.slot,
        harvey: m.harvey,
        carbery: m.carbery,
      });
    });
    for (let i = 0; i < CAPTAIN_PICK_COUNT; i++) {
      matches.push({
        id: `${eventId}-cp${i + 1}`,
        type: 'captain-pick',
        slot: 8 + Math.floor(i / 2),
        harvey: 'TBD · Captain Harvey picks',
        carbery: 'TBD · Captain Carbery picks',
      });
    }
    out[eventId] = matches;
  });
  return out;
})();

export type DrinkingMatchState = {
  winner: 'harvey' | 'carbery' | null;
  status: 'in-progress' | 'final';
  customHarvey: string[] | null;
  customCarbery: string[] | null;
};

export function emptyDrinkingState(): Record<DrinkingEventId, Record<string, DrinkingMatchState>> {
  const out = {} as Record<DrinkingEventId, Record<string, DrinkingMatchState>>;
  (Object.keys(DRINKING_MATCH_LISTS) as DrinkingEventId[]).forEach(eventId => {
    out[eventId] = {};
    DRINKING_MATCH_LISTS[eventId].forEach(m => {
      out[eventId][m.id] = {
        winner: null,
        status: 'in-progress',
        customHarvey: null,
        customCarbery: null,
      };
    });
  });
  return out;
}

export type DrinkingState = ReturnType<typeof emptyDrinkingState>;
