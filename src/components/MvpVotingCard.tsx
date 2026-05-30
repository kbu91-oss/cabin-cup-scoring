'use client';

import { useState } from 'react';
import { useStore, type MvpVote } from '@/lib/store';
import { VOTERS, REQUIRED_VOTER_COUNT, TEAMS } from '@/lib/teams';
import { MVP_REVEAL_PASSWORD, MVP_VOTE_WEIGHTS } from '@/lib/cup';
import { Modal } from './Modal';

type VoteResults = Record<string, { first: number; second: number; third: number; total: number }>;

function computeResults(votes: MvpVote[]): VoteResults {
  const out: VoteResults = {};
  votes.forEach(v => {
    (Object.keys(MVP_VOTE_WEIGHTS) as ('first' | 'second' | 'third')[]).forEach(rank => {
      const p = v[rank];
      if (!p) return;
      if (!out[p]) out[p] = { first: 0, second: 0, third: 0, total: 0 };
      out[p][rank]++;
      out[p].total += MVP_VOTE_WEIGHTS[rank];
    });
  });
  return out;
}

const lookupDisplay = (name: string | null) => {
  if (!name) return null;
  for (const tk of ['harvey', 'carbery'] as const) {
    if (TEAMS[tk].captain.last === name) return TEAMS[tk].captain.display;
    const p = TEAMS[tk].players.find(pp => pp.last === name);
    if (p) return p.display;
  }
  return name;
};

const candidateList = (() => {
  const out: { value: string; display: string; team: 'harvey' | 'carbery' }[] = [];
  (['harvey', 'carbery'] as const).forEach(tk => {
    const t = TEAMS[tk];
    [t.captain, ...t.players].forEach(p => {
      if (p.last === 'Ghost') return;
      out.push({ value: p.last, display: p.display, team: tk });
    });
  });
  return out;
})();

export function MvpVotingCard() {
  const { state, patch } = useStore();
  const [modalVoter, setModalVoter] = useState<string | null>(null);
  const [modalState, setModalState] = useState<Pick<MvpVote, 'first' | 'second' | 'third'>>({
    first: null,
    second: null,
    third: null,
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordErr, setPasswordErr] = useState(false);

  const votes = state.mvpVotes;
  const totalBallots = votes.length;
  const votedIds = new Set(votes.map(v => v.voterId));
  const requiredVotedCount = votes.filter(v => {
    const voter = VOTERS.find(x => x.id === v.voterId);
    return voter && !voter.optional;
  }).length;
  const allRequiredIn = requiredVotedCount >= REQUIRED_VOTER_COUNT;
  const isRevealed = state.mvpResultsRevealed;

  function openModal(voterId: string) {
    const existing = votes.find(v => v.voterId === voterId);
    setModalVoter(voterId);
    setModalState({
      first: existing?.first ?? null,
      second: existing?.second ?? null,
      third: existing?.third ?? null,
    });
  }
  function closeModal() {
    setModalVoter(null);
  }
  function submitBallot() {
    if (!modalVoter) return;
    if (!modalState.first && !modalState.second && !modalState.third) {
      alert('Pick at least one player before submitting.');
      return;
    }
    const newBallot: MvpVote = {
      voterId: modalVoter,
      first: modalState.first,
      second: modalState.second,
      third: modalState.third,
      timestamp: Date.now(),
    };
    const idx = votes.findIndex(x => x.voterId === modalVoter);
    const next = [...votes];
    if (idx >= 0) next[idx] = newBallot;
    else next.push(newBallot);
    patch({ mvpVotes: next });
    setModalVoter(null);
  }
  function deleteBallot(voterId: string) {
    if (!confirm("Delete this voter's ballot?")) return;
    patch({ mvpVotes: votes.filter(v => v.voterId !== voterId) });
  }
  function resetAllBallots() {
    if (votes.length === 0) return;
    if (!confirm('Clear all submitted MVP ballots? This cannot be undone.')) return;
    patch({ mvpVotes: [] });
  }
  function tryReveal() {
    if (passwordInput !== MVP_REVEAL_PASSWORD) {
      setPasswordErr(true);
      setTimeout(() => setPasswordErr(false), 500);
      return;
    }
    patch({ mvpResultsRevealed: true });
    setPasswordInput('');
  }
  function revealNow() {
    if (!allRequiredIn) return;
    patch({ mvpResultsRevealed: true });
  }
  function hideResults() {
    patch({ mvpResultsRevealed: false });
  }

  const results = computeResults(votes);
  const ranked = candidateList
    .map(c => ({ ...c, votes: results[c.value] ?? { first: 0, second: 0, third: 0, total: 0 } }))
    .filter(c => c.votes.total > 0)
    .sort((a, b) => {
      if (b.votes.total !== a.votes.total) return b.votes.total - a.votes.total;
      if (b.votes.first !== a.votes.first) return b.votes.first - a.votes.first;
      return b.votes.second - a.votes.second;
    });

  const modalVoterInfo = modalVoter ? VOTERS.find(v => v.id === modalVoter) : null;
  const isUpdate = modalVoter ? votes.some(v => v.voterId === modalVoter) : false;

  return (
    <div className="bg-surface border border-border border-t-[6px] border-t-gold rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
        <div>
          <div className="text-xl font-black -tracking-[0.3px]">MVP Voting · Official Award</div>
          <div className="text-xs text-text-muted font-medium mt-0.5">
            1st = 5 pts · 2nd = 3 pts · 3rd = 1 pt
          </div>
        </div>
      </div>

      {/* Voter pills */}
      <div className="bg-bg rounded-xl px-4 py-3.5 mb-4">
        <TeamLabel team="harvey">TEAM HARVEY</TeamLabel>
        <VoterRow team="harvey" votedIds={votedIds} onClick={openModal} />
        <TeamLabel team="carbery">TEAM CARBERY</TeamLabel>
        <VoterRow team="carbery" votedIds={votedIds} onClick={openModal} />
        <div className="text-xs text-text-muted mt-2">
          <strong className="text-text font-bold">
            {requiredVotedCount} of {REQUIRED_VOTER_COUNT} required ballots in
          </strong>
          {totalBallots > requiredVotedCount ? ` · +${totalBallots - requiredVotedCount} optional` : ''}
          {' '}· Tap your name to vote (or re-vote).
        </div>
      </div>

      {/* Results block */}
      {!isRevealed ? (
        <div className="bg-bg border border-dashed border-border rounded-xl text-center px-5 py-7">
          <div className="text-3xl mb-2">🔒</div>
          <div className="text-sm font-bold mb-1">Results are hidden while voting is open</div>
          <div className="text-xs text-text-muted mb-4">
            {requiredVotedCount} of {REQUIRED_VOTER_COUNT} required ballots submitted
          </div>
          {allRequiredIn ? (
            <>
              <div className="mx-auto max-w-[360px] mb-2 py-2 px-3 bg-green-600/10 border border-green-600/40 rounded-full text-xs font-bold text-green-700">
                ✅ All {REQUIRED_VOTER_COUNT} required ballots in — ready to reveal
              </div>
              <button
                onClick={revealNow}
                className="bg-green-600 text-white px-6 py-2.5 rounded-full text-[13px] font-bold tracking-wider hover:opacity-85 mt-2"
              >
                Reveal Now
              </button>
            </>
          ) : null}
          <div className="text-[11px] text-text-soft uppercase tracking-wider mt-3.5 mb-2">
            or organizer can unlock early
          </div>
          <div className="flex gap-2 items-center justify-center flex-wrap max-w-[360px] mx-auto">
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="Organizer password"
              className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-full border border-border bg-surface text-[13px] outline-none focus:border-navy"
              onKeyDown={e => e.key === 'Enter' && tryReveal()}
            />
            <button
              onClick={tryReveal}
              className="bg-navy text-gold px-6 py-2.5 rounded-full text-[13px] font-bold hover:opacity-85"
            >
              Unlock
            </button>
          </div>
          <div className={`text-xs font-bold text-red-600 mt-2 min-h-[16px] ${passwordErr ? 'animate-shake' : ''}`}>
            {passwordErr ? 'Incorrect password' : ''}
          </div>
        </div>
      ) : totalBallots === 0 ? (
        <div className="bg-bg rounded-xl px-5 py-6 text-center text-sm text-text-muted">
          No ballots submitted yet.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-bg text-[10px] uppercase tracking-wider text-text-soft">
                  <th className="px-3 py-2.5 w-9 text-center">#</th>
                  <th className="px-3 py-2.5 text-left">Player</th>
                  <th className="px-3 py-2.5 w-20 text-center">Team</th>
                  <th className="px-3 py-2.5 text-center" title="First-place votes (5 pts)">1st</th>
                  <th className="px-3 py-2.5 text-center" title="Second-place votes (3 pts)">2nd</th>
                  <th className="px-3 py-2.5 text-center" title="Third-place votes (1 pt)">3rd</th>
                  <th className="px-3 py-2.5 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((p, i) => (
                  <tr
                    key={p.value}
                    className={`border-b border-c-gray-100 last:border-b-0 ${i === 0 ? 'bg-gold/10 font-bold' : ''}`}
                  >
                    <td className="px-3 py-2.5 text-center text-text-muted font-bold">{i + 1}</td>
                    <td className="px-3 py-2.5"><strong>{p.display}</strong></td>
                    <td className="px-3 py-2.5 text-center">
                      <TeamPill team={p.team} />
                    </td>
                    <td className="px-3 py-2.5 text-center">{p.votes.first}</td>
                    <td className="px-3 py-2.5 text-center">{p.votes.second}</td>
                    <td className="px-3 py-2.5 text-center">{p.votes.third}</td>
                    <td className="px-3 py-2.5 text-center"><strong>{p.votes.total}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="mt-4 border-t border-border pt-4">
            <summary className="text-xs text-text-muted font-semibold cursor-pointer">
              {totalBallots} ballot{totalBallots !== 1 ? 's' : ''} submitted · tap to view who voted for whom
            </summary>
            <ul className="flex flex-col gap-1.5 mt-3">
              {votes.map(v => {
                const voter = VOTERS.find(x => x.id === v.voterId);
                return (
                  <li
                    key={v.voterId}
                    className="bg-bg rounded-lg px-3 py-2 text-xs flex items-center gap-3 flex-wrap"
                  >
                    <span className="font-bold text-text-muted min-w-[60px]">{voter?.display ?? v.voterId}</span>
                    <span>1: {lookupDisplay(v.first) ?? <em className="text-text-soft">—</em>}</span>
                    <span>2: {lookupDisplay(v.second) ?? <em className="text-text-soft">—</em>}</span>
                    <span>3: {lookupDisplay(v.third) ?? <em className="text-text-soft">—</em>}</span>
                    <button
                      onClick={() => deleteBallot(v.voterId)}
                      className="ml-auto text-text-soft hover:text-red-600 text-lg leading-none px-1"
                      title="Delete ballot"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex gap-2 flex-wrap mt-3">
              <button
                onClick={resetAllBallots}
                className="bg-transparent border border-border rounded-full px-3 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-soft"
              >
                Clear all ballots
              </button>
              <button
                onClick={hideResults}
                className="bg-transparent border border-border rounded-full px-3 py-1.5 text-[11px] font-semibold text-text-muted hover:bg-c-gray-100 hover:text-text"
              >
                Hide results again
              </button>
            </div>
          </details>
        </>
      )}

      {/* Voting modal */}
      <Modal open={!!modalVoter} onClose={closeModal} maxWidth="max-w-md">
        {modalVoterInfo ? (
          <>
            <div
              className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider mb-3 ${
                modalVoterInfo.team === 'harvey' ? 'bg-navy text-white' : 'bg-gold text-navy'
              }`}
            >
              VOTING AS
            </div>
            <h3 className="text-lg font-bold mb-1">{modalVoterInfo.display}</h3>
            <p className="text-xs text-text-muted mb-4">
              {isUpdate ? 'Updating your existing ballot.' : 'Pick your top 3. They must be different players.'}
            </p>

            {(['first', 'second', 'third'] as const).map((rank, i) => {
              const pts = [5, 3, 1][i];
              return (
                <div key={rank} className="mb-3.5">
                  <label className="block text-xs font-bold mb-1.5">
                    {rank === 'first' ? '1st place' : rank === 'second' ? '2nd place' : '3rd place'}{' '}
                    <span className="bg-bg text-text-muted text-[10px] px-2 py-0.5 rounded-full font-bold ml-1.5">
                      +{pts} pts
                    </span>
                  </label>
                  <select
                    value={modalState[rank] ?? ''}
                    onChange={e =>
                      setModalState(prev => ({
                        ...prev,
                        [rank]: e.target.value || null,
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-surface outline-none focus:border-navy"
                  >
                    <option value="">— Select a player —</option>
                    {candidateList.map(p => {
                      const takenElsewhere =
                        (rank !== 'first' && modalState.first === p.value) ||
                        (rank !== 'second' && modalState.second === p.value) ||
                        (rank !== 'third' && modalState.third === p.value);
                      return (
                        <option key={p.value} value={p.value} disabled={takenElsewhere}>
                          {p.display}
                          {takenElsewhere ? ' (already picked)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            })}

            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
              <button onClick={closeModal} className="bg-c-gray-200 text-text px-4 py-2.5 rounded-full text-[13px] font-bold hover:opacity-85">
                Cancel
              </button>
              <button onClick={submitBallot} className="bg-navy text-gold px-4 py-2.5 rounded-full text-[13px] font-bold hover:opacity-85">
                {isUpdate ? 'Update Ballot' : 'Submit Ballot'}
              </button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}

function TeamLabel({ team, children }: { team: 'harvey' | 'carbery'; children: React.ReactNode }) {
  const cls = team === 'harvey' ? 'bg-navy text-gold' : 'bg-gold text-navy';
  return (
    <div className={`inline-block text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full mt-1 mb-2 ${cls}`}>
      {children}
    </div>
  );
}

function VoterRow({
  team,
  votedIds,
  onClick,
}: {
  team: 'harvey' | 'carbery';
  votedIds: Set<string>;
  onClick: (voterId: string) => void;
}) {
  const voters = VOTERS.filter(v => v.team === team);
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {voters.map(v => {
        const voted = votedIds.has(v.id);
        const baseColor = team === 'harvey' ? 'border-navy' : 'border-gold-dark';
        const checkBg = team === 'harvey' ? 'bg-navy text-gold' : 'bg-gold text-navy';
        return (
          <button
            key={v.id}
            onClick={() => onClick(v.id)}
            className={`bg-surface border border-border rounded-full px-3 py-1.5 text-[13px] font-semibold flex items-center gap-1 hover:bg-c-gray-100 transition ${
              voted ? `bg-bg text-text-soft line-through ${baseColor}` : ''
            } ${v.optional ? 'italic' : ''}`}
          >
            <span>{v.display}</span>
            {v.optional ? (
              <span className="bg-c-gray-200 text-text-muted px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider">
                OPT
              </span>
            ) : null}
            {voted ? (
              <span className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-black ${checkBg}`}>
                ✓
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function TeamPill({ team }: { team: 'harvey' | 'carbery' }) {
  const cls = team === 'harvey' ? 'bg-navy/10 text-navy' : 'bg-gold/20 text-gold-dark';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${cls}`}>
      {team === 'harvey' ? 'Harvey' : 'Carbery'}
    </span>
  );
}
