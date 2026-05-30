export type HistoryPlayer = {
  name: string;
  cls?: number;
  captain?: boolean;
};

export type HistoryTeam = {
  name: string;
  winner: boolean;
  players: HistoryPlayer[];
};

export type HistoryYear = {
  year: number;
  format: 'golf' | 'street-hockey';
  lockout?: boolean;
  location?: string;
  matchup?: string;
  champion?: string;
  runnerUp?: string;
  mvp?: string;
  goldenPutter?: string;
  teams?: HistoryTeam[];
};

export const HISTORY: HistoryYear[] = [
  {
    year: 2025,
    format: 'golf',
    location: 'Lake Placid, NY',
    matchup: 'Bouharevich vs. Bui',
    champion: 'Team Bouharevich',
    runnerUp: 'Team Bui',
    mvp: 'Yuri Bouharevich',
    goldenPutter: 'Team Bouharevich',
    teams: [
      {
        name: 'Team Bouharevich',
        winner: true,
        players: [
          { name: 'Yuri Bouharevich', cls: 12, captain: true },
          { name: 'Dan Clarke', cls: 12 },
          { name: 'Russell Goodman', cls: 13 },
          { name: 'Clay Harvey', cls: 13 },
          { name: 'Brooks Robinson', cls: 14 },
          { name: 'Steven Sanner' },
        ],
      },
      {
        name: 'Team Bui',
        winner: false,
        players: [
          { name: 'Kevin Bui', cls: 12, captain: true },
          { name: 'Jeremy Langlois', cls: 13 },
          { name: 'Zach Currie', cls: 13 },
          { name: 'Dan Carbery', cls: 13 },
          { name: 'Scott Davidson', cls: 19 },
          { name: 'Joey Cipollone', cls: 23 },
        ],
      },
    ],
  },
  { year: 2017, format: 'street-hockey', champion: 'Champions', mvp: 'KJ Tiefenwerth', teams: [
    { name: 'Champions', winner: true, players: [
      { name: 'Derek Smith' },
      { name: 'KJ Tiefenwerth' },
      { name: 'Joe Fiala' },
      { name: 'Devon Toews' },
      { name: 'Tommy Schutt' },
      { name: 'Brandon Fortunato' },
      { name: 'Michael Garteig' },
    ]},
  ] },
  { year: 2016, format: 'street-hockey', champion: 'Champions', mvp: 'Sam Anas', teams: [
    { name: 'Champions', winner: true, players: [
      { name: 'Sam Anas' },
      { name: 'Derek Smith' },
      { name: 'Joe Fiala' },
      { name: 'Devon Toews' },
      { name: 'Tommy Schutt' },
    ]},
  ] },
  { year: 2015, format: 'street-hockey', mvp: 'Borja Angoita' },
  { year: 2014, format: 'street-hockey', champion: 'Champions', mvp: 'Travis St. Denis', teams: [
    { name: 'Champions', winner: true, players: [
      { name: 'KJ Tiefenwerth' },
      { name: 'Cory Hibbeler' },
      { name: 'Brooks Robinson' },
      { name: 'Michael Garteig' },
      { name: 'Travis St. Denis' },
    ]},
  ] },
  { year: 2013, format: 'street-hockey', lockout: true },
  { year: 2012, format: 'street-hockey', champion: "Thik'T", mvp: 'Matt Peca', teams: [
    { name: "Thik'T", winner: true, players: [
      { name: 'Cory Hibbeler' },
      { name: 'Connor Jones' },
      { name: 'Kellen Jones' },
      { name: 'Zach Tolkinen' },
    ]},
  ] },
  { year: 2011, format: 'street-hockey', lockout: true },
  {
    year: 2010,
    format: 'street-hockey',
    champion: 'Top Titties',
    mvp: 'Dan Clarke',
    teams: [
      {
        name: 'Top Titties',
        winner: true,
        players: [
          { name: 'Kevin Bui' },
          { name: 'Mike Glaicar' },
          { name: 'Yuri Bouharevich' },
          { name: 'Zach Hansen' },
          { name: 'Pat McGann' },
        ],
      },
    ],
  },
];
