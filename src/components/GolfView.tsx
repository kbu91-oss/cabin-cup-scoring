'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { ROUND_LABELS, type RoundId, fmt } from '@/lib/cup';
import { matchScores } from '@/lib/scoring';
import { Modal } from './Modal';
import { CaptainPickModal, type CaptainPickTarget } from './CaptainPickModal';
import type { GolfMatch } from '@/lib/matches';

const ROUND_IDS: RoundId[] = ['mountain-front', 'mountain-back', 'links-front', 'links-back'];

export function GolfView({ initialRound }: { initialRound?: RoundId }) {
  const { state, patch } = useStore();
  const [round, setRound] = useState<RoundId>(initialRound ?? 'mountain-front');
  const [holeModal, setHoleModal] = useState<{ matchId: number; holeIdx: number } | null>(null);
  const [captainTarget, setCaptainTarget] = useState<CaptainPickTarget | null>(null);

  const matchesInRound = useMemo(
    () => state.golfMatches.filter(m => m.round === round),
    [state.golfMatches, round],
  );

  function setHole(value: number) {
    if (!holeModal) return;
    const { matchId, holeIdx } = holeModal;
    const next = state.golfMatches.map(m => {
      if (m.id !== matchId || m.status === 'Final') return m;
      const newHoles = [...m.holes];
      newHoles[holeIdx] = value;
      return { ...m, holes: newHoles };
    });
    patch({ golfMatches: next });
    setHoleModal(null);
  }

  function finalize(matchId: number) {
    patch({
      golfMatches: state.golfMatches.map(m => (m.id === matchId ? { ...m, status: 'Final' as const } : m)),
    });
  }
  function unfinalize(matchId: number) {
    patch({
      golfMatches: state.golfMatches.map(m => (m.id === matchId ? { ...m, status: 'In Progress' as const } : m)),
    });
  }

  const modalMatch = holeModal ? state.golfMatches.find(m => m.id === holeModal.matchId) : null;
  const harveyLabel = modalMatch?.customHarvey?.length ? modalMatch.customHarvey.join(' & ') : 'Team Harvey';
  const carberyLabel = modalMatch?.customCarbery?.length ? modalMatch.customCarbery.join(' & ') : 'Team Carbery';

  return (
    <>
      {/* Course tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 bg-c-gray-100 rounded-full p-3 sm:p-4 mb-1">
        {ROUND_IDS.map(r => (
          <button
            key={r}
            onClick={() => setRound(r)}
            className={`text-center py-2 sm:py-3 rounded-full text-[12px] sm:text-sm font-semibold transition ${
              round === r ? 'bg-navy text-gold font-bold shadow-md' : 'bg-c-gray-100 text-c-gray-700 hover:bg-navy/10'
            }`}
          >
            {ROUND_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-baseline flex-wrap gap-2 mt-1 mb-3">
        <h2 className="text-lg font-semibold">{ROUND_LABELS[round]}</h2>
        <span className="text-xs text-text-muted font-medium">
          Harvey 7 (1 ghost) · Carbery 7 · 2v2 + 2v2 + 3v3 per round
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {matchesInRound.map(match => (
          <GolfMatchCard
            key={match.id}
            match={match}
            onHoleTap={(holeIdx) => setHoleModal({ matchId: match.id, holeIdx })}
            onFinalize={() => finalize(match.id)}
            onUnfinalize={() => unfinalize(match.id)}
            onEditCaptainPick={(team) => setCaptainTarget({ kind: 'golf', matchId: match.id, team })}
          />
        ))}
      </div>

      {/* Hole-winner modal */}
      <Modal open={!!holeModal} onClose={() => setHoleModal(null)} maxWidth="max-w-sm">
        {modalMatch && holeModal ? (
          <>
            <h3 className="text-center text-xl font-bold mb-5">
              Hole {modalMatch.holeStart + holeModal.holeIdx} Winner
            </h3>
            <div className="flex flex-col gap-3">
              <ModalBtn className="bg-navy text-white hover:opacity-85" onClick={() => setHole(1)}>
                {harveyLabel} Wins
              </ModalBtn>
              <ModalBtn className="bg-navy-blue text-white hover:opacity-85" onClick={() => setHole(2)}>
                Tie
              </ModalBtn>
              <ModalBtn className="bg-gold text-navy hover:opacity-85" onClick={() => setHole(-1)}>
                {carberyLabel} Wins
              </ModalBtn>
              <ModalBtn className="bg-c-gray-200 text-c-gray-700 hover:opacity-85" onClick={() => setHole(0)}>
                Clear / Not Played
              </ModalBtn>
            </div>
          </>
        ) : null}
      </Modal>

      {/* Captain pick modal */}
      <CaptainPickModal target={captainTarget} onClose={() => setCaptainTarget(null)} />
    </>
  );
}

function ModalBtn({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`w-full py-3.5 rounded-xl text-[15px] font-bold transition ${className}`}>
      {children}
    </button>
  );
}

function GolfMatchCard({
  match,
  onHoleTap,
  onFinalize,
  onUnfinalize,
  onEditCaptainPick,
}: {
  match: GolfMatch;
  onHoleTap: (holeIdx: number) => void;
  onFinalize: () => void;
  onUnfinalize: () => void;
  onEditCaptainPick: (team: 'harvey' | 'carbery') => void;
}) {
  const { harvey, carbery } = matchScores(match);
  const allPlayed = match.holes.every(h => h !== 0);
  const isFinal = match.status === 'Final';

  const harveyTbd = !match.customHarvey || !match.customHarvey.length;
  const carberyTbd = !match.customCarbery || !match.customCarbery.length;
  const harveyDisplay = harveyTbd ? 'TBD · Tap to pick' : match.customHarvey!.join(' & ');
  const carberyDisplay = carberyTbd ? 'TBD · Tap to pick' : match.customCarbery!.join(' & ');

  let leadGradient = 'bg-white';
  if (harvey > carbery) leadGradient = 'bg-gradient-to-r from-navy/20 via-navy/8 to-white';
  else if (carbery > harvey) leadGradient = 'bg-gradient-to-l from-gold/40 via-gold/20 to-white';

  let statusText = '';
  let dotClass = 'bg-c-gray-300 opacity-50';
  if (harvey === 0 && carbery === 0) {
    statusText = harveyTbd && carberyTbd ? 'Awaiting captain picks' : 'No scores yet';
  } else if (harvey > carbery) {
    statusText = `${harveyTbd ? 'Team Harvey' : harveyDisplay} ${isFinal ? 'wins' : 'leading'}`;
    dotClass = 'bg-navy';
  } else if (carbery > harvey) {
    statusText = `${carberyTbd ? 'Team Carbery' : carberyDisplay} ${isFinal ? 'wins' : 'leading'}`;
    dotClass = 'bg-gold';
  } else {
    statusText = isFinal ? 'Match Tied' : 'All Square';
    dotClass = 'bg-navy-blue';
  }

  return (
    <article className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <div className={`p-4 sm:p-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 transition-colors duration-300 ${leadGradient}`}>
        <div className="flex flex-col gap-1 sm:gap-2 py-3 sm:py-4">
          <div
            className={`text-base sm:text-2xl md:text-3xl font-black -tracking-[0.5px] leading-tight ${harveyTbd ? 'text-text-soft font-bold italic text-[17px] sm:text-xl' : 'text-text'} ${
              isFinal ? '' : 'cursor-pointer hover:bg-c-gray-100 rounded-lg -mx-1 px-1'
            }`}
            onClick={() => !isFinal && onEditCaptainPick('harvey')}
          >
            {harveyDisplay} {!isFinal && <span className="text-xs text-text-soft">✎</span>}
          </div>
          <div className="text-[12px] sm:text-base font-bold text-navy">Team Harvey</div>
        </div>

        <div className="flex flex-col items-center gap-1 sm:gap-2">
          <span className="inline-block bg-navy text-gold px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider">
            {match.format ?? '2v2'}
          </span>
          <div className="text-center text-[15px] sm:text-lg font-bold text-text-muted">
            Match {match.id} · {match.status}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-4xl sm:text-6xl md:text-7xl font-black -tracking-[1px] leading-none">
            <span className="text-navy">{fmt(harvey)}</span>
            <span className="text-text-soft">-</span>
            <span className="text-gold-dark">{fmt(carbery)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:gap-2 py-3 sm:py-4 items-end text-right">
          <div
            className={`text-base sm:text-2xl md:text-3xl font-black -tracking-[0.5px] leading-tight ${carberyTbd ? 'text-text-soft font-bold italic text-[17px] sm:text-xl' : 'text-text'} ${
              isFinal ? '' : 'cursor-pointer hover:bg-c-gray-100 rounded-lg -mx-1 px-1'
            }`}
            onClick={() => !isFinal && onEditCaptainPick('carbery')}
          >
            {carberyDisplay} {!isFinal && <span className="text-xs text-text-soft">✎</span>}
          </div>
          <div className="text-[12px] sm:text-base font-bold text-gold-dark">Team Carbery</div>
        </div>
      </div>

      <div className="bg-bg p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
          {match.holes.map((v, i) => {
            const cls =
              v === 1
                ? 'bg-navy text-white'
                : v === -1
                  ? 'bg-gold text-navy'
                  : v === 2
                    ? 'bg-navy-blue text-white'
                    : 'bg-c-gray-200 text-c-gray-700';
            return (
              <button
                key={i}
                disabled={isFinal}
                onClick={() => onHoleTap(i)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm font-bold transition flex items-center justify-center ${cls} ${
                  isFinal ? 'cursor-default' : 'hover:scale-110 hover:shadow-lg'
                }`}
              >
                {match.holeStart + i}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <span className={`w-3 h-3 rounded-full ${dotClass}`} />
          {statusText}
        </div>

        <div className="flex justify-center gap-2">
          {!isFinal && allPlayed ? (
            <button
              onClick={onFinalize}
              className="bg-navy text-gold px-4.5 py-2 rounded-full text-[13px] font-semibold hover:opacity-85"
            >
              Finalize Match
            </button>
          ) : null}
          {isFinal ? (
            <button
              onClick={onUnfinalize}
              className="bg-c-gray-500 text-white px-4.5 py-2 rounded-full text-[13px] font-semibold hover:opacity-85"
            >
              Edit Match
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
