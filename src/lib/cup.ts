// Cup-level constants — scoring math, dates, and the organizer password.

export const CUP_LABEL = 'Cabin Cup 2026';

// Cup dates — Thursday June 11 to Sunday June 14, 2026.
export const CUP_START = new Date('2026-06-11T15:00:00-04:00'); // Thu 3pm ET
export const CUP_END = new Date('2026-06-14T19:00:00-04:00'); // Sun evening

// Organizer password to reveal MVP voting results early.
export const MVP_REVEAL_PASSWORD = 'cabincup';

// Organizer password required to wipe all scores. Separate so you can rotate
// it without affecting MVP reveal access (or vice versa).
export const RESET_SCORES_PASSWORD = 'cabincup';

// Cup scoring math
export const GOLF_POINTS = 108;

// Per-event drinking points-per-win. Beer die and beer pong are 3 pts each
// (fewer matches, higher stakes); bags is 2 (more matches, lower stakes).
export const DRINKING_POINTS_PER_WIN_BY_EVENT: Record<'beer-die' | 'bags' | 'beer-pong', number> = {
  'beer-die': 3,
  bags: 2,
  'beer-pong': 3,
};
// Legacy export for any code still importing the old uniform constant.
export const DRINKING_POINTS_PER_WIN = 2;

export const BEER_PONG_CAPTAINS_POINTS = 1;
// beer-die 12 × 3 + bags 18 × 2 + beer-pong 12 × 3 = 36 + 36 + 36 = 108
export const TOTAL_POINTS = 217; // golf 108 + drinking 108 + captains BP 1
export const WIN_THRESHOLD = 109; // odd total → 109 to win outright

// MVP voting weights
export const MVP_VOTE_WEIGHTS: Record<'first' | 'second' | 'third', number> = {
  first: 5,
  second: 3,
  third: 1,
};

export const EVENT_IDS = [
  'captains-beer-pong',
  'golf',
  'beer-die',
  'bags',
  'beer-pong',
] as const;
export type EventId = (typeof EVENT_IDS)[number];

export const ROUND_LABELS: Record<string, string> = {
  'mountain-front': 'Mountain Front 9',
  'mountain-back': 'Mountain Back 9',
  'links-front': 'Links Front 9',
  'links-back': 'Links Back 9',
};
export type RoundId = keyof typeof ROUND_LABELS;

export const fmt = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));
