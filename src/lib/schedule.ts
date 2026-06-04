// 2026 itinerary — update dates as they lock in.

export type ScheduleNote =
  | string
  | { text: string; link?: ScheduleLink };

export type ScheduleEvent = {
  time: string;
  title: string;
  sub?: string;
  notes?: ScheduleNote[];
  link?: ScheduleLink;
};

export type ScheduleLink =
  | 'captains-beer-pong'
  | 'golf-mountain'
  | 'golf-links'
  | 'beer-die'
  | 'bags'
  | 'beer-pong'
  | 'mvp'
  | 'lunch'
  | 'travel';

export type ScheduleDay = {
  id: string;
  label: string;
  date: string;
  tag: string;
  events: ScheduleEvent[];
};

export const SCHEDULE_DAYS: ScheduleDay[] = [
  {
    id: 'thursday',
    label: 'Thursday',
    date: 'June 11, 2026',
    tag: 'Opening Day',
    events: [
      { time: '3:00pm – 3:30pm', title: 'Optional Round of Golf', sub: 'Tee off window — early arrivals welcome' },
      { time: '3:00pm – 9:00pm', title: 'Arrivals', sub: 'Share your time on the Travel tab', link: 'travel' },
      {
        time: '9:45pm',
        title: 'Opening Ceremonies',
        notes: [
          'Matchups announced',
          'Rules and Awards announced',
          'Captains speeches',
          { text: "Captains' Beer Pong Match for 1st point", link: 'captains-beer-pong' },
        ],
      },
    ],
  },
  {
    id: 'friday',
    label: 'Friday',
    date: 'June 12, 2026',
    tag: 'Golf Day',
    events: [
      { time: '7:30am', title: 'Wakey Wakey' },
      {
        time: '8:00am',
        title: 'Catered breakfast at Cabin',
        sub: 'ADK Diner',
        notes: ['Scrambled eggs', 'Pancakes', 'Bacon', 'Breakfast potatoes'],
      },
      { time: '9:24am', title: 'First Tee Off — Mountain Course', sub: 'Mountain Front 9 → Mountain Back 9', link: 'golf-mountain' },
      { time: '2:15pm', title: 'Lunch at Lake Placid Club', sub: 'Adirondack Corner Store · order in advance', link: 'lunch' },
      { time: '3:00pm', title: '2nd 18 Tee Off — Links Course', sub: 'Links Front 9 → Links Back 9', link: 'golf-links' },
      { time: '7:30pm', title: 'Depart course for cabin' },
      { time: '7:45pm', title: 'Pizza and wings delivered to Cabin' },
      { time: '9:00pm', title: '1st Day Awards', notes: ['Golden Putter Ceremony'] },
    ],
  },
  {
    id: 'saturday',
    label: 'Saturday',
    date: 'June 13, 2026',
    tag: 'Backyard Games',
    events: [
      { time: '8:00am – 9:30am', title: 'Breakfast sandwiches at Cabin', sub: 'ADK Diner' },
      {
        time: '11:00am',
        title: 'Backyard competitions begin',
        sub: 'Team event all day · scores kept and tallied',
        notes: [
          { text: 'Beer Die', link: 'beer-die' },
          { text: 'Bags', link: 'bags' },
          { text: 'Beer Pong', link: 'beer-pong' },
        ],
      },
      { time: '4:30pm', title: 'Games conclude' },
      { time: '5:00pm', title: 'Cabin Cup and Awards Ceremony', sub: 'Speeches · Al Carbone MVP revealed', link: 'mvp' },
      { time: '6:00pm', title: 'Supper' },
      { time: '7:00pm', title: 'Marbles and Games' },
    ],
  },
  {
    id: 'sunday',
    label: 'Sunday',
    date: 'June 14, 2026',
    tag: 'Wrap Up',
    events: [
      { time: 'Morning', title: 'Clean cabin' },
      { time: 'All day', title: 'Departures' },
    ],
  },
];

// Map "link" hints onto a (page href, optional scoreboard hint) so cross-links work.
export function linkHrefFor(link?: ScheduleLink): { href: string; hash?: string } | null {
  if (!link) return null;
  switch (link) {
    case 'captains-beer-pong':  return { href: '/', hash: 'event=captains-beer-pong' };
    case 'golf-mountain':       return { href: '/', hash: 'event=golf&round=mountain-front' };
    case 'golf-links':          return { href: '/', hash: 'event=golf&round=links-front' };
    case 'beer-die':            return { href: '/', hash: 'event=beer-die' };
    case 'bags':                return { href: '/', hash: 'event=bags' };
    case 'beer-pong':           return { href: '/', hash: 'event=beer-pong' };
    case 'mvp':                 return { href: '/mvp' };
    case 'lunch':               return { href: '/lunch' };
    case 'travel':              return { href: '/travel' };
  }
}
