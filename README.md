# Cabin Cup 2026

Live scoreboard, MVP voting, schedule, team rosters, history, and detail reference for the 2026 Cabin Cup ("Pour It On" · est. 2010).

Built with Next.js 16 + React 19 + Tailwind 4 + TypeScript. State is currently device-local (localStorage). Cross-device sync via Supabase is the next planned upgrade.

## Run locally

```bash
npm install   # only needed the first time, or after dep changes
npm run dev
```

Open <http://localhost:3000>.

## Pages

| Route        | What it does |
| ------------ | ------------ |
| `/`          | Live cup scoreboard — team totals, event tabs (Golf · Captains' Beer Pong · Beer Die · Bags · Beer Pong), hole-by-hole golf scoring, drinking-match toggles with finalize/edit, captain pick modal. |
| `/teams`     | Both rosters with handicaps, captains, shirt sizes, class years, Glaicar/Soren combo + Ghost notes. |
| `/mvp`       | Al Carbone MVP — voter pills with checkmarks, password-protected results reveal, sub-tabs (Overall / By Event / Player Cards), live stats. |
| `/schedule`  | Thursday → Sunday day cards. Some events deep-link into the scoreboard. |
| `/details`   | Locations w/ map links, scoring & cup math, format rules, awards, MVP voting rules. |
| `/history`   | All-time results table + year-by-year cards back to 2010, including the street-hockey era. |

## Editing data

All the static data lives in `src/lib/`:

| File          | What it holds |
| ------------- | ------------- |
| `teams.ts`    | Both team rosters, handicaps, derived voter list. |
| `cup.ts`      | Cup constants (totals, dates, win threshold, MVP weights, organizer password). |
| `matches.ts`  | 12 golf matches + pre-computed 18-match drinking schedules (slot-disjoint, partner-covered, matchup-unique). |
| `history.ts`  | Past Cabin Cup years. |
| `schedule.ts` | 2026 itinerary day-by-day. |

Want to change a date? `cup.ts` → `CUP_START` / `CUP_END`.
Want to change the MVP unlock password? `cup.ts` → `MVP_REVEAL_PASSWORD`.
Want to add a new history year? Append to the `HISTORY` array in `history.ts`.

## Storage

State persists to `localStorage` under the key `cabin-cup-next-v1`. Per device, not synced across devices. Use the "Reset all scores" button at the bottom of the scoreboard to clear.

## Deploy

```bash
# from the project root
vercel
```

Or push to a Git repo and import in the [Vercel dashboard](https://vercel.com/new).
