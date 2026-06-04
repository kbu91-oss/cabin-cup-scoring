import Link from 'next/link';
import { REQUIRED_VOTER_COUNT } from '@/lib/teams';

export const metadata = { title: 'Details · Cabin Cup 2026' };

const LOCATIONS = [
  { label: 'Cabin', address: '2285 Saranac Ave, Lake Placid, NY 12946' },
  { label: 'Lake Placid Club (Golf)', address: '88 Morningside Dr, Lake Placid, NY 12946' },
];

const SCORING_ROWS: [string, string, string][] = [
  ['Golf', '1 pt per hole won · ½ pt for ties', '108 pts max (12 matches × 9 holes)'],
  ['Beer Die', '2 pts per win', '36 pts max (18 matches)'],
  ['Bags', '2 pts per win', '36 pts max (18 matches)'],
  ['Beer Pong', '2 pts per win', '36 pts max (18 matches)'],
  ["Captains' Beer Pong", '1 pt · single match Thursday night', '1 pt max'],
];

const mapsUrl = (addr: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

export default function DetailsPage() {
  return (
    <>
      <section className="text-center border-b border-border pb-6 mb-2">
        <h1 className="text-3xl font-black tracking-tight">Details</h1>
        <p className="text-sm text-text-muted mt-1.5 font-medium">
          Everything you need to know for Cabin Cup 2026
        </p>
      </section>

      <div className="bg-surface border border-border border-t-[6px] border-t-gold rounded-2xl shadow-sm overflow-hidden">
        {/* Locations */}
        <Section title="📍 Locations">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LOCATIONS.map(loc => (
              <div key={loc.label} className="bg-bg rounded-lg p-3 px-4">
                <div className="text-sm font-bold mb-0.5">{loc.label}</div>
                <div className="text-[13px] text-text-muted mb-2">{loc.address}</div>
                <a
                  href={mapsUrl(loc.address)}
                  target="_blank"
                  rel="noopener"
                  className="text-[13px] font-semibold text-red-600 hover:underline inline-flex items-center gap-1"
                >
                  📍 Open in Maps
                </a>
              </div>
            ))}
          </div>
        </Section>

        {/* Scoring & Cup Math */}
        <Section title="🏆 Scoring & Cup Math">
          <table className="w-full text-[13px] mt-1">
            <thead>
              <tr className="text-left text-[11px] font-bold text-text-muted uppercase tracking-wider border-b border-border bg-bg">
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Scoring</th>
                <th className="px-3 py-2">Max Points</th>
              </tr>
            </thead>
            <tbody>
              {SCORING_ROWS.map(([ev, scoring, max]) => (
                <tr key={ev} className="border-b border-c-gray-100">
                  <td className="px-3 py-2.5">{ev}</td>
                  <td className="px-3 py-2.5">{scoring}</td>
                  <td className="px-3 py-2.5">{max}</td>
                </tr>
              ))}
              <tr className="bg-gold/10 font-semibold">
                <td className="px-3 py-2.5"><strong>Total</strong></td>
                <td className="px-3 py-2.5"></td>
                <td className="px-3 py-2.5"><strong>217 pts · 109 to win</strong></td>
              </tr>
            </tbody>
          </table>
          <Callout>
            First team to <strong>109 points</strong> clinches the Cabin Cup. Total possible is 217,
            so 109 is more than half — no ties possible.
          </Callout>
        </Section>

        {/* Golf Format */}
        <Section title="⛳ Golf Format">
          <UL>
            <li><strong>4 rounds</strong>: Mountain Front 9, Mountain Back 9, Links Front 9, Links Back 9</li>
            <li><strong>3 matches per round</strong>: 2v2 + 2v2 + 3v3 = all 7 players per side play every round</li>
            <li>Each hole won = <strong>1 pt</strong> for the team · ties = <strong>½ pt each</strong></li>
            <li>Captains pick the lineups</li>
            <li>Tap any hole circle on the scoreboard to assign that hole's winner</li>
          </UL>
        </Section>

        {/* Drinking Format */}
        <Section title="🍻 Drinking Games Format">
          <p className="text-sm leading-relaxed mb-2">
            Three events on Saturday: <strong>Beer Die</strong>, <strong>Bags</strong>,{' '}
            <strong>Beer Pong</strong>. All 2v2 match play, win or loss (no ties).
          </p>
          <UL>
            <li><strong>18 matches per event</strong>, <strong>2 pts per win</strong> = 36 pts max per event</li>
            <li><strong>14 rotation matches</strong>: every player plays exactly 4 games per event</li>
            <li><strong>4 captain&apos;s pick matches</strong>: captains choose the pairings (no roster restrictions)</li>
          </UL>
        </Section>

        {/* Awards */}
        <Section title="👑 Awards">
          <div className="flex flex-col gap-2.5">
            <Award name="🏆 The Cabin Cup">
              Awarded to the team that crosses <strong>109 points</strong> first across all events.
            </Award>
            <Award name="🥇 Al Carbone MVP">
              Individual award voted by the players. 1st place = 5 pts, 2nd = 3 pts, 3rd = 1 pt. {REQUIRED_VOTER_COUNT}{' '}
              ballots required to reveal results.
            </Award>
            <Award name="⛳ Golden Putter">
              Awarded at Friday night&apos;s 1st Day Awards to the team that finishes Friday with
              the most golf points across the 12 matches.
            </Award>
            <Award name="🍻 Captains' Beer Pong Champion">
              Whichever captain wins the Thursday night beer pong match takes home +1 cup point for
              their team.
            </Award>
          </div>
        </Section>

        {/* MVP Voting */}
        <Section title="🗳️ MVP Voting Rules" last>
          <UL>
            <li>
              Open the{' '}
              <Link href="/mvp" className="text-navy underline font-semibold">
                Al Carbone MVP
              </Link>{' '}
              page and tap your own name pill to cast a ballot.
            </li>
            <li>Pick your top 3 — <strong>1st = 5 pts, 2nd = 3 pts, 3rd = 1 pt</strong>. Picks must be different players.</li>
            <li>Re-tapping your name lets you update your existing ballot. Your pill shows a ✓ once you&apos;ve voted.</li>
            <li><strong>{REQUIRED_VOTER_COUNT} required voters</strong> · Glaicar is optional (departs early). The &ldquo;Reveal Now&rdquo; button unlocks once all {REQUIRED_VOTER_COUNT} required ballots are in.</li>
            <li>Organizer can unlock early with the password (see <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]">MVP_REVEAL_PASSWORD</code> in <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]">src/lib/cup.ts</code>).</li>
          </UL>
        </Section>
      </div>
    </>
  );
}

function Section({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`px-6 py-5 ${last ? '' : 'border-b border-border'}`}>
      <h2 className="text-base font-bold mb-3 -tracking-[0.2px]">{title}</h2>
      {children}
    </div>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 text-sm leading-7 [&_strong]:text-text">{children}</ul>;
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 p-2.5 px-3.5 bg-bg border-l-[3px] border-gold rounded-md text-[13px] text-text">
      {children}
    </div>
  );
}

function Award({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="p-2.5 px-3.5 bg-bg border-l-[3px] border-navy rounded-md">
      <div className="text-sm font-bold mb-0.5">{name}</div>
      <div className="text-[13px] text-text-muted leading-relaxed">{children}</div>
    </div>
  );
}
