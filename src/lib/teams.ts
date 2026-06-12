// Team rosters, handicaps, and derived voter/roster lookups.
// Source of truth for everything player-related across the app.

export type Player = {
  display: string;
  last: string;
  cls: number | null;
  shirt: string | null;
  hcp: number | null;
  combo?: boolean;
  days?: string;
  note?: string;
};

export type Team = {
  name: string;
  color: 'navy' | 'gold';
  captain: Player;
  players: Player[];
};

export const TEAMS: { harvey: Team; carbery: Team } = {
  harvey: {
    name: 'Team Harvey',
    color: 'navy',
    captain: { display: 'Clay Harvey', last: 'Harvey', cls: 13, shirt: 'L', hcp: 11 },
    players: [
      { display: 'Yuri Bouharevich', last: 'Bouharevich', cls: 12, shirt: 'L', hcp: 15 },
      { display: 'Ben Arnt',         last: 'Arnt',        cls: 13, shirt: 'L', hcp: 12 },
      { display: 'Cory Hibbeler',    last: 'Hibbeler',    cls: 14, shirt: 'L', hcp: 10 },
      { display: 'Jake Meyers',      last: 'Meyers',      cls: 16, shirt: 'M', hcp: 14 },
      { display: 'KJ Tiefenwerth',   last: 'Tiefenwerth', cls: 17, shirt: 'L', hcp: 16 },
    ],
  },
  carbery: {
    name: 'Team Carbery',
    color: 'gold',
    captain: { display: 'Dan Carbery', last: 'Carbery', cls: 13, shirt: 'M', hcp: 18 },
    players: [
      { display: 'Kevin Bui',       last: 'Bui',       cls: 12, shirt: 'L',  hcp: 18 },
      { display: 'Zach Luczyk',     last: 'Luczyk',    cls: 16, shirt: 'L',  hcp: 3.4 },
      {
        display: 'Mike Glaicar', last: 'Glaicar', cls: 12, shirt: 'L', hcp: 12,
        combo: true, days: 'Friday golf only', note: 'Combo pick with Soren · Friday golf only',
      },
      {
        display: 'Soren Jonzzon', last: 'Soren', cls: 16, shirt: 'M', hcp: null,
        combo: true, days: 'Saturday drinking only', note: 'Combo pick with Glaicar · Saturday drinking only',
      },
      { display: 'Steve Sanner',    last: 'Sanner',    cls: null, shirt: 'L',  hcp: 13 },
      { display: 'Brooks Robinson', last: 'Robinson',  cls: 14,   shirt: 'M',  hcp: 20 },
      { display: 'Tom Hilbrich',    last: 'Hilbrich',  cls: 16,   shirt: 'XL', hcp: 20 },
    ],
  },
};

// Roster arrays used by the captain pick modal — Carbery swaps Glaicar/Soren by day.
export const HARVEY_ROSTER = [TEAMS.harvey.captain.last, ...TEAMS.harvey.players.map(p => p.last)];
export const CARBERY_GOLF_ROSTER = [
  TEAMS.carbery.captain.last,
  ...TEAMS.carbery.players.filter(p => p.last !== 'Soren').map(p => p.last),
];
export const CARBERY_DRINKING_ROSTER = [
  TEAMS.carbery.captain.last,
  ...TEAMS.carbery.players.filter(p => p.last !== 'Glaicar').map(p => p.last),
];

export const HANDICAPS: Record<string, number | null> = {};
[TEAMS.harvey.captain, ...TEAMS.harvey.players,
 TEAMS.carbery.captain, ...TEAMS.carbery.players].forEach(p => {
  HANDICAPS[p.last] = p.hcp;
});
export const hcpFor = (last: string): number | null => HANDICAPS[last] ?? null;

export const harveyRosterFor = (_eventId: string) => HARVEY_ROSTER;
export const carberyRosterFor = (eventId: string) =>
  eventId === 'golf' ? CARBERY_GOLF_ROSTER : CARBERY_DRINKING_ROSTER;

// Eligible MVP voters — Ghost excluded (placeholder). Optional voters don't count toward required count.
export const OPTIONAL_VOTER_IDS = new Set<string>(['Glaicar']);

export type Voter = {
  id: string;
  display: string;
  team: 'harvey' | 'carbery';
  isCaptain: boolean;
  optional: boolean;
};

export const VOTERS: Voter[] = (() => {
  const out: Voter[] = [];
  (['harvey', 'carbery'] as const).forEach(teamKey => {
    const team = TEAMS[teamKey];
    const isOpt = (id: string) => OPTIONAL_VOTER_IDS.has(id);
    out.push({
      id: team.captain.last,
      display: team.captain.display,
      team: teamKey,
      isCaptain: true,
      optional: isOpt(team.captain.last),
    });
    team.players.forEach(p => {
      if (p.last === 'Ghost') return;
      out.push({
        id: p.last,
        display: p.display,
        team: teamKey,
        isCaptain: false,
        optional: isOpt(p.last),
      });
    });
  });
  return out;
})();

export const REQUIRED_VOTER_COUNT = VOTERS.filter(v => !v.optional).length;
