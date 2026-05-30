'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { TEAMS } from '@/lib/teams';
import { computePlayerStats, aggregateEvents, type PlayerStats } from '@/lib/scoring';
import { EVENT_IDS, type EventId } from '@/lib/cup';

type Row = {
  display: string;
  last: string;
  team: 'harvey' | 'carbery';
  isCaptain: boolean;
  hcp: number | null;
  stats: PlayerStats;
};

const EVENT_DISPLAY: { id: EventId; label: string }[] = [
  { id: 'golf', label: 'Golf' },
  { id: 'beer-die', label: 'Beer Die' },
  { id: 'bags', label: 'Bags' },
  { id: 'beer-pong', label: 'Beer Pong' },
  { id: 'captains-beer-pong', label: "Captains' BP" },
];

const EVENT_SECTIONS: { id: string; label: string; eventIds: EventId[]; captainsOnly?: boolean }[] = [
  { id: 'golf',                label: '⛳ Golf',                eventIds: ['golf'] },
  { id: 'all-drinking',        label: '🍻 Total Drinking',     eventIds: ['beer-die', 'bags', 'beer-pong', 'captains-beer-pong'] },
  { id: 'beer-die',            label: '🎲 Beer Die',           eventIds: ['beer-die'] },
  { id: 'bags',                label: '🎯 Bags',               eventIds: ['bags'] },
  { id: 'beer-pong',           label: '🏓 Beer Pong',          eventIds: ['beer-pong'] },
  { id: 'captains-beer-pong',  label: "👑 Captains' Beer Pong", eventIds: ['captains-beer-pong'], captainsOnly: true },
];

export function MvpLeaderboard() {
  const { state } = useStore();
  const [subTab, setSubTab] = useState<'overall' | 'events' | 'cards'>('overall');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const allPlayers = useMemo<Row[]>(() => {
    const stats = computePlayerStats({
      golfMatches: state.golfMatches,
      drinking: state.drinkingMatches,
      captainsBeerPongWinner: state.beerPongWinner,
    });
    const rows: Row[] = [];
    (['harvey', 'carbery'] as const).forEach(teamKey => {
      const team = TEAMS[teamKey];
      [team.captain, ...team.players].forEach(p => {
        rows.push({
          display: p.display,
          last: p.last,
          team: teamKey,
          isCaptain: p === team.captain,
          hcp: p.hcp,
          stats:
            stats[p.last] ?? {
              team: teamKey,
              events: {
                golf: blankE(), 'beer-die': blankE(), bags: blankE(), 'beer-pong': blankE(), 'captains-beer-pong': blankE(),
              },
              overall: { w: 0, l: 0, t: 0, pf: 0, pa: 0, pm: 0, gp: 0 },
              winPct: 0,
            },
        });
      });
    });
    return rows;
  }, [state.golfMatches, state.drinkingMatches, state.beerPongWinner]);

  function toggleExpand(eventKey: string) {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventKey)) next.delete(eventKey);
      else next.add(eventKey);
      return next;
    });
  }

  return (
    <>
      {/* Sub-tabs */}
      <div className="flex gap-1.5 bg-bg p-1 rounded-full w-fit max-w-full overflow-x-auto mb-3">
        {(['overall', 'events', 'cards'] as const).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition ${
              subTab === t ? 'bg-navy text-gold' : 'text-text-muted hover:text-text'
            }`}
          >
            {t === 'overall' ? 'Overall Leaderboard' : t === 'events' ? 'By Event' : 'Player Cards'}
          </button>
        ))}
      </div>

      {subTab === 'overall' ? (
        <>
          <SectionHeader>Overall leaderboard · all events combined</SectionHeader>
          <LeaderboardCard>
            <LeaderboardTable
              rows={allPlayers}
              getStats={p => ({
                w: p.stats.overall.w,
                l: p.stats.overall.l,
                t: p.stats.overall.t,
                pf: p.stats.overall.pf,
                pa: p.stats.overall.pa,
                pm: p.stats.overall.pm,
                gp: p.stats.overall.gp,
                pct: p.stats.winPct,
              })}
            />
          </LeaderboardCard>
        </>
      ) : null}

      {subTab === 'events' ? (
        <>
          {EVENT_SECTIONS.map(section => {
            const candidates = section.captainsOnly ? allPlayers.filter(p => p.isCaptain) : allPlayers;
            const isExpanded = expandedEvents.has(section.id);
            const showButton = candidates.length > 3;
            const limit = isExpanded || !showButton ? Infinity : 3;
            return (
              <div key={section.id} className="mb-2">
                <SectionHeader>{section.label}</SectionHeader>
                <LeaderboardCard>
                  <LeaderboardTable
                    rows={candidates}
                    getStats={p => aggregateEvents(p.stats, section.eventIds)}
                    limit={limit}
                  />
                  {showButton ? (
                    <button
                      onClick={() => toggleExpand(section.id)}
                      className="w-full bg-bg border-t border-border px-4 py-2.5 text-xs font-semibold text-text-muted hover:bg-c-gray-100 hover:text-text flex items-center justify-center gap-2"
                    >
                      {isExpanded ? (
                        <>
                          <span>Show top 3</span> <span className="text-[10px]">▴</span>
                        </>
                      ) : (
                        <>
                          <span>Show all {candidates.length} players</span> <span className="text-[10px]">▾</span>
                        </>
                      )}
                    </button>
                  ) : null}
                </LeaderboardCard>
              </div>
            );
          })}
        </>
      ) : null}

      {subTab === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPlayers.map(p => (
            <PlayerCard key={p.last} row={p} />
          ))}
        </div>
      ) : null}

      <div className="mt-5 p-3 px-4 bg-surface border border-border border-l-[3px] border-l-navy rounded-lg text-xs text-text-muted leading-relaxed">
        <strong className="text-text">How this is computed:</strong> Each player gets credit for
        matches their lineup played in. <em className="text-navy not-italic font-bold">W-L-T</em>
        {' '}counts wins, losses, and tied matches.{' '}
        <em className="text-navy not-italic font-bold">+/-</em> sums team point differential (golf:
        hole differential; drinking: 2 pts per win). Ranking sorts by wins → win% → +/-.{' '}
        <strong className="text-text">Stats are for context only</strong> — the Al Carbone MVP is
        decided by the ballot above.
      </div>
    </>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold tracking-wider uppercase text-text-muted my-3 mt-7 first:mt-0">
      {children}
    </div>
  );
}

function LeaderboardCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">{children}</div>
  );
}

type StatsRow = {
  w: number;
  l: number;
  t: number;
  pf: number;
  pa: number;
  pm: number;
  gp: number;
  pct: number;
};

function LeaderboardTable({
  rows,
  getStats,
  limit = Infinity,
}: {
  rows: Row[];
  getStats: (r: Row) => StatsRow;
  limit?: number;
}) {
  const ranked = [...rows].sort((a, b) => {
    const sa = getStats(a);
    const sb = getStats(b);
    if (sb.w !== sa.w) return sb.w - sa.w;
    if (sb.pct !== sa.pct) return sb.pct - sa.pct;
    return sb.pm - sa.pm;
  });
  const visible = ranked.slice(0, limit);
  const fmtN = (n: number, gp: number) => (gp === 0 ? '—' : n % 1 === 0 ? String(n) : n.toFixed(1));
  const fmtPM = (pm: number, gp: number) => (gp === 0 ? '—' : pm > 0 ? `+${pm}` : `${pm}`);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-navy text-gold text-[10px] uppercase tracking-wider text-left">
            <th className="px-3 py-2.5 w-9 text-center">#</th>
            <th className="px-3 py-2.5">Player</th>
            <th className="px-3 py-2.5 text-right">W-L-T</th>
            <th className="px-3 py-2.5 text-right">Win %</th>
            <th className="px-3 py-2.5 text-right">Points For</th>
            <th className="px-3 py-2.5 text-right">Points Against</th>
            <th className="px-3 py-2.5 text-right">+/-</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((p, i) => {
            const s = getStats(p);
            const pmCls = s.pm > 0 ? 'text-navy font-bold' : s.pm < 0 ? 'text-red-600 font-bold' : '';
            return (
              <tr
                key={p.last}
                className={`border-b border-c-gray-100 last:border-b-0 ${i === 0 && s.gp > 0 ? 'bg-gold/10' : ''}`}
              >
                <td className="px-3 py-2.5 text-center text-text-muted font-bold">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </td>
                <td className="px-3 py-2.5">
                  <strong>{p.display}</strong>{' '}
                  <span
                    className={`inline-block ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                      p.team === 'harvey' ? 'bg-navy/10 text-navy' : 'bg-gold/20 text-gold-dark'
                    }`}
                  >
                    {p.team === 'harvey' ? 'Harvey' : 'Carbery'}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">{s.gp === 0 ? '—' : `${s.w}-${s.l}-${s.t}`}</td>
                <td className="px-3 py-2.5 text-right">
                  {s.gp > 0 ? `${s.pct.toFixed(0)}%` : '—'}
                </td>
                <td className="px-3 py-2.5 text-right">{fmtN(s.pf, s.gp)}</td>
                <td className="px-3 py-2.5 text-right">{fmtN(s.pa, s.gp)}</td>
                <td className={`px-3 py-2.5 text-right ${pmCls}`}>{fmtPM(s.pm, s.gp)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlayerCard({ row }: { row: Row }) {
  const p = row;
  const o = p.stats.overall;
  const overallWlt = `${o.w}-${o.l}-${o.t}`;
  const overallPct = o.gp > 0 ? `${p.stats.winPct.toFixed(0)}%` : '—';
  const overallPmStr = o.pm > 0 ? `+${o.pm}` : `${o.pm}`;
  const pmCls = o.pm > 0 ? 'text-navy' : o.pm < 0 ? 'text-red-600' : 'text-text-muted';
  const borderTop = p.team === 'harvey' ? 'border-t-navy' : 'border-t-gold';

  return (
    <div className={`bg-surface border border-border border-t-[4px] ${borderTop} rounded-2xl shadow-sm overflow-hidden`}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap text-base font-bold">
          {p.display}
          {p.isCaptain ? (
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                p.team === 'harvey' ? 'bg-navy text-gold' : 'bg-gold-dark text-white'
              }`}
            >
              CAPTAIN
            </span>
          ) : null}
          {p.hcp !== null ? (
            <span className="bg-bg text-text-muted px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
              HCP {p.hcp}
            </span>
          ) : null}
        </div>
        <div className="text-right leading-none">
          <span className={`text-[26px] font-black -tracking-[0.5px] ${pmCls}`}>
            {o.gp ? overallPmStr : '—'}
          </span>
          <span className="block text-[10px] text-text-soft tracking-wider font-bold mt-0.5">+/-</span>
        </div>
      </div>

      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-bg text-[10px] uppercase tracking-wider text-text-soft text-right">
            <th className="px-3 py-2 text-left"></th>
            <th className="px-3 py-2 text-right">W-L-T</th>
            <th className="px-3 py-2 text-right">Win %</th>
            <th className="px-3 py-2 text-right">+/-</th>
          </tr>
        </thead>
        <tbody>
          {EVENT_DISPLAY.map(ev => {
            const e = p.stats.events[ev.id];
            const gp = e.w + e.l + e.t;
            const wlt = gp === 0 ? '—' : `${e.w}-${e.l}-${e.t}`;
            const pct = gp > 0 ? `${((e.w + 0.5 * e.t) / gp * 100).toFixed(0)}%` : '—';
            const pmStr = gp === 0 ? '—' : e.pm > 0 ? `+${e.pm}` : `${e.pm}`;
            const rowPmCls = e.pm > 0 ? 'text-navy font-bold' : e.pm < 0 ? 'text-red-600 font-bold' : '';
            return (
              <tr key={ev.id} className="border-b border-c-gray-100">
                <td className="px-3 py-2 text-text-muted font-semibold text-xs">{ev.label}</td>
                <td className="px-3 py-2 text-right">{wlt}</td>
                <td className="px-3 py-2 text-right">{pct}</td>
                <td className={`px-3 py-2 text-right ${rowPmCls}`}>{pmStr}</td>
              </tr>
            );
          })}
          <tr className="bg-bg border-t-2 border-border">
            <td className="px-3 py-2.5 text-text-muted font-bold text-xs"><strong>OVERALL</strong></td>
            <td className="px-3 py-2.5 text-right"><strong>{o.gp ? overallWlt : '—'}</strong></td>
            <td className="px-3 py-2.5 text-right"><strong>{overallPct}</strong></td>
            <td className={`px-3 py-2.5 text-right ${pmCls}`}><strong>{o.gp ? overallPmStr : '—'}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function blankE() {
  return { w: 0, l: 0, t: 0, pf: 0, pa: 0, pm: 0 };
}
