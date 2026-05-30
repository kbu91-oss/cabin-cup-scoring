import { HISTORY, type HistoryYear, type HistoryTeam } from '@/lib/history';

export const metadata = { title: 'History · Cabin Cup' };

export default function HistoryPage() {
  return (
    <>
      <section className="text-center border-b border-border pb-6 mb-2">
        <h1 className="text-3xl font-black tracking-tight">History</h1>
        <p className="text-sm text-text-muted mt-1.5 font-medium">
          Past Cabin Cup champions, MVPs &amp; rosters
        </p>
      </section>

      <SectionLabel>All-Time Results</SectionLabel>
      <AllTimeTable />

      <SectionLabel>Year-by-Year</SectionLabel>
      <div className="flex flex-col gap-5">
        {HISTORY.filter(y => !y.lockout).map(y => (
          <YearCard key={y.year} year={y} />
        ))}
      </div>

      <div className="mt-3 p-3 px-4 bg-surface border border-border border-l-[3px] border-l-gold rounded-lg text-xs text-text-muted">
        Add future years by appending to <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]">HISTORY</code> in
        <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]"> src/lib/history.ts</code>.
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold tracking-wider text-text-muted uppercase border-b-2 border-gold pb-1.5 mt-7 first:mt-0 mb-3">
      {children}
    </div>
  );
}

function AllTimeTable() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy text-gold text-left text-[11px] font-bold uppercase tracking-wider">
            <th className="px-4 py-2.5">Year</th>
            <th className="px-4 py-2.5">Captains</th>
            <th className="px-4 py-2.5">Cabin Cup Winner</th>
            <th className="px-4 py-2.5">Golden Putter</th>
            <th className="px-4 py-2.5">Al Carbone MVP</th>
          </tr>
        </thead>
        <tbody>
          {HISTORY.map(y => (
            <AllTimeRow key={y.year} year={y} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AllTimeRow({ year }: { year: HistoryYear }) {
  if (year.lockout) {
    return (
      <tr className="bg-bg italic text-text-soft">
        <td className="px-4 py-2.5 not-italic"><strong>{year.year}</strong></td>
        <td className="px-4 py-2.5" colSpan={4}>
          <span className="not-italic inline-block bg-c-gray-200 text-text-muted px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider">
            🚫 Lockout — no tournament held
          </span>
        </td>
      </tr>
    );
  }
  const isHockey = year.format === 'street-hockey';
  return (
    <tr className="border-t border-c-gray-100">
      <td className="px-4 py-2.5"><strong>{year.year}</strong></td>
      <td className="px-4 py-2.5">
        {year.matchup ?? (
          isHockey ? (
            <span className="inline-block bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider">
              🏒 Street Hockey
            </span>
          ) : (
            `${year.champion ?? ''}${year.runnerUp ? ' vs. ' + year.runnerUp : ''}`
          )
        )}
      </td>
      <td className="px-4 py-2.5">
        {year.champion ?? <span className="text-text-soft">— TBD —</span>}
      </td>
      <td className={`px-4 py-2.5 ${isHockey ? 'text-text-soft' : ''}`}>
        {isHockey ? '—' : year.goldenPutter ?? '—'}
      </td>
      <td className="px-4 py-2.5">{year.mvp ?? '—'}</td>
    </tr>
  );
}

function YearCard({ year }: { year: HistoryYear }) {
  const isHockey = year.format === 'street-hockey';
  const teams = year.teams ?? [];
  const winning = teams.find(t => t.winner);
  const losing = teams.find(t => !t.winner);
  const hasRosters = teams.length > 0;
  const champName = winning?.name ?? year.champion ?? 'Champion TBD';

  return (
    <div className={`bg-surface border border-border rounded-2xl shadow-sm overflow-hidden ${isHockey ? 'border-t-[3px] border-t-gold-dark' : ''}`}>
      {/* Header band */}
      <div className="bg-navy text-white px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-[28px] font-black text-gold -tracking-[0.5px] leading-none">{year.year}</div>
        {isHockey ? (
          <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-[11px] font-bold tracking-wider">
            🏒 STREET HOCKEY ERA
          </span>
        ) : (
          <div className="text-[13px] text-white/70 font-medium">{year.matchup}</div>
        )}
      </div>

      {/* Champions banner */}
      <div className="bg-navy px-6 py-4 flex items-center gap-3.5 border-t border-white/[0.08]">
        <span className="text-2xl bg-gold/[0.18] w-11 h-11 rounded-full inline-flex items-center justify-center shrink-0">🏆</span>
        <div>
          <div className="text-[18px] font-black text-gold -tracking-[0.2px]">{champName}</div>
          <div className="text-[11px] text-white/70 font-semibold uppercase tracking-wider">Cup Champions</div>
        </div>
      </div>

      {/* Awards */}
      {isHockey ? (
        <div className="grid grid-cols-1 gap-2.5 px-6 py-4 bg-bg">
          <Award label="🥇 Al Carbone MVP" value={year.mvp ?? '—'} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-6 py-4 bg-bg">
          <Award label="⛳ Golden Putter" value={year.goldenPutter ?? '—'} />
          <Award label="🥇 Al Carbone MVP" value={year.mvp ?? '—'} />
        </div>
      )}

      {hasRosters ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-5">
          {winning ? <TeamRoster team={winning} /> : null}
          {losing ? <TeamRoster team={losing} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function Award({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg px-3.5 py-3">
      <div className="text-[10px] font-bold tracking-wider text-text-muted uppercase mb-1">{label}</div>
      <div className="text-[15px] font-bold text-navy">{value}</div>
    </div>
  );
}

function TeamRoster({ team }: { team: HistoryTeam }) {
  const winnerClass = team.winner
    ? 'border-t-[4px] border-t-gold bg-gold/[0.06]'
    : 'border-t-[4px] border-t-text-soft';
  const badgeClass = team.winner
    ? 'bg-gold text-navy'
    : 'bg-c-gray-200 text-text-muted';
  const captainBadge = team.winner ? 'bg-gold-dark text-white' : 'bg-navy text-gold';

  return (
    <div className={`bg-surface border border-border rounded-xl overflow-hidden ${winnerClass}`}>
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <span className="text-base font-bold">{team.name}</span>
        <span className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap ${badgeClass}`}>
          {team.winner ? '🏆 CHAMPION' : 'RUNNER-UP'}
        </span>
      </div>
      <ul className="py-2">
        {team.players.map(p => (
          <li
            key={p.name}
            className="flex items-center justify-between px-4 py-2 border-b border-c-gray-100 last:border-b-0 text-sm"
          >
            <span className="font-medium flex items-center gap-2 flex-wrap">
              {p.name}
              {p.captain ? (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${captainBadge}`}>
                  CAPTAIN
                </span>
              ) : null}
            </span>
            {p.cls ? <span className="text-text-muted text-xs font-semibold">&apos;{p.cls}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
