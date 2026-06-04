import { TEAMS, type Player, type Team } from '@/lib/teams';

export const metadata = { title: 'Teams · Cabin Cup 2026' };

export default function TeamsPage() {
  return (
    <>
      <section className="text-center border-b border-border pb-6 mb-2">
        <h1 className="text-3xl font-black tracking-tight">Teams &amp; Rosters</h1>
        <p className="text-sm text-text-muted mt-1.5 font-medium">Cabin Cup 2026 · Pour It On</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TeamCard team={TEAMS.harvey} accent="navy" />
        <TeamCard team={TEAMS.carbery} accent="gold" />
      </div>

      <div className="mt-5 p-3.5 px-4 bg-surface border border-border border-l-[3px] border-l-gold rounded-lg text-[13px] text-text-muted leading-relaxed">
        <strong className="text-text">Roster notes:</strong> Mike Glaicar plays Friday golf only;
        Soren Jonzzon plays Saturday drinking games only — they&apos;re drafted as one combined
        Carbery pick. Both rosters play 7 v 7 across the rotations.
      </div>
    </>
  );
}

function TeamCard({ team, accent }: { team: Team; accent: 'navy' | 'gold' }) {
  const allWithHcp = [team.captain, ...team.players].filter(p => p.hcp !== null);
  const avgHcp =
    allWithHcp.reduce((s, p) => s + (p.hcp ?? 0), 0) / Math.max(1, allWithHcp.length);
  const playerCount = team.players.length + 1;
  const sorted = [...team.players].sort((a, b) => {
    if (a.hcp === null && b.hcp === null) return 0;
    if (a.hcp === null) return 1;
    if (b.hcp === null) return -1;
    return a.hcp - b.hcp;
  });
  const borderTop = accent === 'navy' ? 'border-t-navy' : 'border-t-gold';

  return (
    <div className={`bg-surface border border-border border-t-[6px] ${borderTop} rounded-2xl shadow-sm overflow-hidden flex flex-col`}>
      <div className="px-6 py-4 pb-3 border-b border-border flex items-baseline justify-between flex-wrap gap-2">
        <div className="text-[22px] font-black tracking-tight">{team.name}</div>
        <span className="text-xs text-text-muted font-semibold tracking-wider bg-bg px-2.5 py-1 rounded-full">
          Avg HCP {avgHcp.toFixed(1)} · {playerCount} players
        </span>
      </div>

      <div className="px-6 pb-4 pt-2">
        <SectionLabel>Captain</SectionLabel>
        <PlayerRow player={team.captain} accent={accent} isCaptain />

        <SectionLabel>Roster</SectionLabel>
        {sorted.map(p => (
          <PlayerRow key={p.last} player={p} accent={accent} />
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold tracking-wider text-text-muted mt-4 mb-1">{children}</div>
  );
}

function PlayerRow({
  player,
  accent,
  isCaptain,
}: {
  player: Player;
  accent: 'navy' | 'gold';
  isCaptain?: boolean;
}) {
  const meta = [player.cls ? `Class of '${player.cls}` : null, player.shirt ? `Shirt ${player.shirt}` : null]
    .filter(Boolean)
    .join(' · ');
  const isCombo = !!player.combo;
  const captainBadgeClass = accent === 'navy' ? 'bg-navy text-gold' : 'bg-gold-dark text-white';
  const hcpClass =
    player.hcp === null
      ? 'bg-c-gray-100 text-text-soft'
      : accent === 'navy'
        ? 'bg-navy/10 text-navy'
        : 'bg-gold/20 text-gold-dark';

  const rowExtra =
    isCaptain
      ? '-mx-6 px-6 bg-bg border-b-0'
      : isCombo
        ? '-mx-6 px-6 bg-gold/5'
        : '';

  return (
    <div className={`flex items-center gap-3 py-3 border-b border-c-gray-100 last:border-b-0 ${rowExtra}`}>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold flex items-center gap-2 flex-wrap">
          {player.display}
          {isCaptain ? (
            <span className={`${captainBadgeClass} px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider`}>
              CAPTAIN
            </span>
          ) : null}
        </div>
        {meta ? <div className="text-xs text-text-muted mt-0.5">{meta}</div> : null}
        {player.note ? (
          <div className="text-[11px] text-text-soft italic mt-1">{player.note}</div>
        ) : null}
      </div>
      <span
        className={`text-[13px] font-bold px-3 py-1.5 rounded-full min-w-[64px] text-center whitespace-nowrap ${hcpClass}`}
      >
        {player.hcp === null ? '—' : `HCP ${player.hcp}`}
      </span>
    </div>
  );
}
