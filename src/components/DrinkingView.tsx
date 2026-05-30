'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { DRINKING_MATCH_LISTS, type DrinkingEventId, type DrinkingMatch } from '@/lib/matches';
import { DRINKING_POINTS_PER_WIN, fmt } from '@/lib/cup';
import { drinkingEventTotals } from '@/lib/scoring';
import { CaptainPickModal, type CaptainPickTarget } from './CaptainPickModal';

const META: Record<DrinkingEventId, { icon: string; label: string; sub: string }> = {
  'beer-die': {
    icon: 'BD',
    label: 'Beer Die',
    sub: '2v2 match play · win or loss · 2 pts per win',
  },
  bags: {
    icon: 'BG',
    label: 'Bags (Cornhole)',
    sub: '2v2 match play · win or loss · 2 pts per win',
  },
  'beer-pong': {
    icon: 'BP',
    label: 'Beer Pong',
    sub: '2v2 match play · 2 pts per win · separate from Captains\'',
  },
};

export function DrinkingView({ eventId }: { eventId: DrinkingEventId }) {
  const { state, patch } = useStore();
  const [captainTarget, setCaptainTarget] = useState<CaptainPickTarget | null>(null);
  const matches = DRINKING_MATCH_LISTS[eventId];
  const stateMap = state.drinkingMatches[eventId];
  const totals = useMemo(
    () => drinkingEventTotals(eventId, state.drinkingMatches),
    [eventId, state.drinkingMatches],
  );

  const wins = Object.values(stateMap).reduce(
    (acc, s) => {
      if (s.winner === 'harvey') acc.harvey++;
      else if (s.winner === 'carbery') acc.carbery++;
      return acc;
    },
    { harvey: 0, carbery: 0 },
  );
  const playedCount = wins.harvey + wins.carbery;
  const finalCount = Object.values(stateMap).filter(s => s.status === 'final').length;

  function setWinner(matchId: string, winner: 'harvey' | 'carbery' | null) {
    const current = stateMap[matchId];
    if (!current || current.status === 'final') return;
    patch({
      drinkingMatches: {
        ...state.drinkingMatches,
        [eventId]: {
          ...stateMap,
          [matchId]: { ...current, winner },
        },
      },
    });
  }
  function finalize(matchId: string) {
    const current = stateMap[matchId];
    if (!current || !current.winner) return;
    patch({
      drinkingMatches: {
        ...state.drinkingMatches,
        [eventId]: { ...stateMap, [matchId]: { ...current, status: 'final' } },
      },
    });
  }
  function unfinalize(matchId: string) {
    const current = stateMap[matchId];
    if (!current) return;
    patch({
      drinkingMatches: {
        ...state.drinkingMatches,
        [eventId]: { ...stateMap, [matchId]: { ...current, status: 'in-progress' } },
      },
    });
  }

  const rotation = matches.filter(m => m.type === 'rotation');
  const captainPicks = matches.filter(m => m.type === 'captain-pick');
  const slotGroups: Record<number, DrinkingMatch[]> = {};
  rotation.forEach(m => {
    (slotGroups[m.slot] ??= []).push(m);
  });
  const slotKeys = Object.keys(slotGroups)
    .map(Number)
    .sort((a, b) => a - b);

  const meta = META[eventId];
  let globalIdx = 0;

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 sm:gap-4 border-b border-border pb-4 flex-wrap">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-navy text-gold rounded-xl flex items-center justify-center font-black text-base sm:text-lg">
            {meta.icon}
          </div>
          <div className="flex-1">
            <div className="text-lg sm:text-xl font-bold">{meta.label}</div>
            <div className="text-xs sm:text-[13px] text-text-muted">{meta.sub}</div>
          </div>
          <span className="text-[11px] text-text-muted tracking-wider bg-c-gray-100 px-3 py-1.5 rounded-full font-semibold">
            36 PTS TOTAL
          </span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center bg-bg rounded-xl px-5 py-4 gap-3">
          <div className="flex flex-col items-start gap-0.5">
            <div className="text-[11px] font-bold tracking-wider text-text-muted">TEAM HARVEY</div>
            <div className="text-2xl sm:text-4xl font-black text-navy leading-none">{fmt(totals.harvey)}</div>
            <div className="text-[11px] font-medium text-text-soft">{wins.harvey} wins</div>
          </div>
          <div className="text-xl font-bold text-text-soft">vs</div>
          <div className="flex flex-col items-end gap-0.5">
            <div className="text-[11px] font-bold tracking-wider text-text-muted">TEAM CARBERY</div>
            <div className="text-2xl sm:text-4xl font-black text-gold-dark leading-none">{fmt(totals.carbery)}</div>
            <div className="text-[11px] font-medium text-text-soft">{wins.carbery} wins</div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-text-muted -mt-2">
          <span>
            {playedCount} of {matches.length} matches played · {finalCount} finalized
          </span>
          <span>
            {fmt(totals.harvey + totals.carbery)} of 36 points awarded
          </span>
        </div>

        {/* Slot sections */}
        {slotKeys.map(slotNum => (
          <div key={slotNum} className="mt-2">
            <div className="text-xs font-bold tracking-wider text-navy uppercase bg-c-gray-100 px-3 py-2 rounded-lg">
              Slot {slotNum} · Two games at once
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {slotGroups[slotNum].map(m => {
                globalIdx++;
                const s = stateMap[m.id];
                return (
                  <MatchRow
                    key={m.id}
                    match={m}
                    matchNumber={globalIdx}
                    state={s}
                    onSetWinner={(w) => setWinner(m.id, w)}
                    onFinalize={() => finalize(m.id)}
                    onUnfinalize={() => unfinalize(m.id)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Captain picks */}
        {captainPicks.length ? (
          <div className="mt-2">
            <div className="text-xs font-bold tracking-wider text-navy uppercase bg-c-gray-100 px-3 py-2 rounded-lg">
              Captain&apos;s Picks · Captains choose pairings
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {captainPicks.map(m => {
                globalIdx++;
                const s = stateMap[m.id];
                const harveyNames = s.customHarvey?.length ? s.customHarvey.join(' & ') : 'TBD · Tap to pick';
                const carberyNames = s.customCarbery?.length ? s.customCarbery.join(' & ') : 'TBD · Tap to pick';
                return (
                  <MatchRow
                    key={m.id}
                    match={{ ...m, harvey: harveyNames, carbery: carberyNames }}
                    matchNumber={globalIdx}
                    isCaptainPick
                    state={s}
                    onSetWinner={(w) => setWinner(m.id, w)}
                    onFinalize={() => finalize(m.id)}
                    onUnfinalize={() => unfinalize(m.id)}
                    onEditHarvey={() =>
                      setCaptainTarget({ kind: 'drinking', eventId, matchId: m.id, team: 'harvey' })
                    }
                    onEditCarbery={() =>
                      setCaptainTarget({ kind: 'drinking', eventId, matchId: m.id, team: 'carbery' })
                    }
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <CaptainPickModal target={captainTarget} onClose={() => setCaptainTarget(null)} />
    </>
  );
}

function MatchRow({
  match,
  matchNumber,
  state,
  isCaptainPick,
  onSetWinner,
  onFinalize,
  onUnfinalize,
  onEditHarvey,
  onEditCarbery,
}: {
  match: DrinkingMatch;
  matchNumber: number;
  state: { winner: 'harvey' | 'carbery' | null; status: 'in-progress' | 'final'; customHarvey: string[] | null; customCarbery: string[] | null };
  isCaptainPick?: boolean;
  onSetWinner: (w: 'harvey' | 'carbery' | null) => void;
  onFinalize: () => void;
  onUnfinalize: () => void;
  onEditHarvey?: () => void;
  onEditCarbery?: () => void;
}) {
  const isFinal = state.status === 'final';
  const winner = state.winner;
  const leadCls =
    winner === 'harvey'
      ? 'bg-gradient-to-r from-navy/12 via-navy/5 to-white'
      : winner === 'carbery'
        ? 'bg-gradient-to-l from-gold/25 via-gold/10 to-white'
        : 'bg-surface';
  const harveyActive = winner === 'harvey';
  const carberyActive = winner === 'carbery';
  const noneActive = !winner;

  const showFinal = isFinal;
  const tbdHarvey = isCaptainPick && (!state.customHarvey || state.customHarvey.length === 0);
  const tbdCarbery = isCaptainPick && (!state.customCarbery || state.customCarbery.length === 0);

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-4 px-4 py-3 border border-border rounded-xl transition ${leadCls} ${
        showFinal ? 'opacity-90' : ''
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="text-[11px] font-bold text-text-soft">
          MATCH {matchNumber}
          {isCaptainPick ? ' · CAPTAIN PICK' : ''}
          {isFinal ? (
            <span className="ml-1 bg-navy text-gold px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider">
              FINAL
            </span>
          ) : null}
        </div>
        <div
          className={`text-[15px] font-bold ${tbdHarvey ? 'text-text-soft italic' : 'text-text'} ${
            isCaptainPick && !isFinal && onEditHarvey ? 'cursor-pointer hover:bg-c-gray-100 rounded -mx-1 px-1' : ''
          }`}
          onClick={() => !isFinal && isCaptainPick && onEditHarvey?.()}
        >
          {match.harvey} {isCaptainPick && !isFinal ? <span className="text-xs text-text-soft">✎</span> : null}
        </div>
        <div className="text-[11px] font-semibold text-navy tracking-[0.3px]">Team Harvey</div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1.5 items-center">
          <ToggleBtn active={harveyActive} accent="harvey" disabled={isFinal} onClick={() => onSetWinner('harvey')}>
            HARVEY
          </ToggleBtn>
          <ToggleBtn active={noneActive} accent="none" disabled={isFinal} onClick={() => onSetWinner(null)}>
            —
          </ToggleBtn>
          <ToggleBtn active={carberyActive} accent="carbery" disabled={isFinal} onClick={() => onSetWinner('carbery')}>
            CARBERY
          </ToggleBtn>
        </div>
        {isFinal ? (
          <button onClick={onUnfinalize} className="text-[11px] font-bold tracking-wider bg-c-gray-500 text-white px-3.5 py-1 rounded-full">
            Edit
          </button>
        ) : winner ? (
          <button onClick={onFinalize} className="text-[11px] font-bold tracking-wider bg-navy text-gold px-3.5 py-1 rounded-full">
            Finalize
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5 md:items-end md:text-right">
        <div className="text-[11px] font-bold text-text-soft md:invisible">&nbsp;</div>
        <div
          className={`text-[15px] font-bold ${tbdCarbery ? 'text-text-soft italic' : 'text-text'} ${
            isCaptainPick && !isFinal && onEditCarbery ? 'cursor-pointer hover:bg-c-gray-100 rounded -mx-1 px-1' : ''
          }`}
          onClick={() => !isFinal && isCaptainPick && onEditCarbery?.()}
        >
          {match.carbery} {isCaptainPick && !isFinal ? <span className="text-xs text-text-soft">✎</span> : null}
        </div>
        <div className="text-[11px] font-semibold text-gold-dark tracking-[0.3px]">Team Carbery</div>
      </div>
    </div>
  );
}

function ToggleBtn({
  children,
  active,
  accent,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  accent: 'harvey' | 'carbery' | 'none';
  disabled: boolean;
  onClick: () => void;
}) {
  const baseActive =
    accent === 'harvey'
      ? 'bg-navy text-white border-navy'
      : accent === 'carbery'
        ? 'bg-gold text-navy border-gold-dark'
        : 'bg-c-gray-200 text-text border-c-gray-200';
  const cls = active
    ? `${baseActive} active`
    : 'bg-surface text-text-muted border-border hover:bg-c-gray-100';
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`min-w-[56px] px-2.5 py-2 rounded-full border text-[11px] font-bold tracking-wider transition ${cls} ${
        disabled ? 'opacity-60 cursor-default' : ''
      }`}
    >
      {children}
    </button>
  );
}
