'use client';

import { useMemo, useState, useEffect } from 'react';
import { Modal } from './Modal';
import {
  HARVEY_ROSTER,
  CARBERY_GOLF_ROSTER,
  CARBERY_DRINKING_ROSTER,
  hcpFor,
} from '@/lib/teams';
import { ROUND_LABELS, type RoundId } from '@/lib/cup';
import { useStore } from '@/lib/store';
import type { DrinkingEventId } from '@/lib/matches';

export type CaptainPickTarget =
  | { kind: 'golf'; matchId: number; team: 'harvey' | 'carbery' }
  | { kind: 'drinking'; eventId: DrinkingEventId; matchId: string; team: 'harvey' | 'carbery' };

export function CaptainPickModal({
  target,
  onClose,
}: {
  target: CaptainPickTarget | null;
  onClose: () => void;
}) {
  const { state, patch } = useStore();
  const [selected, setSelected] = useState<string[]>([]);

  // Initial selection comes from current state when target opens
  useEffect(() => {
    if (!target) return;
    if (target.kind === 'golf') {
      const m = state.golfMatches.find(x => x.id === target.matchId);
      if (!m) return;
      setSelected(target.team === 'harvey' ? (m.customHarvey ?? []) : (m.customCarbery ?? []));
    } else {
      const m = state.drinkingMatches[target.eventId]?.[target.matchId];
      if (!m) return;
      setSelected(target.team === 'harvey' ? (m.customHarvey ?? []) : (m.customCarbery ?? []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.kind, target?.team, target && (target.kind === 'golf' ? target.matchId : target.matchId)]);

  const maxPlayers = useMemo(() => {
    if (!target) return 2;
    if (target.kind === 'golf') {
      const m = state.golfMatches.find(x => x.id === target.matchId);
      return m?.format === '3v3' ? 3 : 2;
    }
    return 2;
  }, [target, state.golfMatches]);

  const isGolf = target?.kind === 'golf';
  const eventIdForRoster = isGolf ? 'golf' : 'drinking';

  const roster = useMemo(() => {
    if (!target) return [];
    if (target.team === 'harvey') return HARVEY_ROSTER;
    return eventIdForRoster === 'golf' ? CARBERY_GOLF_ROSTER : CARBERY_DRINKING_ROSTER;
  }, [target, eventIdForRoster]);

  const usedThisRound = useMemo(() => {
    if (!target || target.kind !== 'golf') return new Set<string>();
    const currentMatch = state.golfMatches.find(x => x.id === target.matchId);
    if (!currentMatch) return new Set<string>();
    const set = new Set<string>();
    state.golfMatches.forEach(m => {
      if (m.id === currentMatch.id) return;
      if (m.round !== currentMatch.round) return;
      const players = target.team === 'harvey' ? m.customHarvey : m.customCarbery;
      if (players) players.forEach(p => set.add(p));
    });
    return set;
  }, [target, state.golfMatches]);

  if (!target) return null;

  function toggle(player: string) {
    setSelected(prev => {
      const idx = prev.indexOf(player);
      if (idx >= 0) return prev.filter(p => p !== player);
      if (prev.length >= maxPlayers) return [...prev.slice(1), player]; // sliding window
      return [...prev, player];
    });
  }

  function commitSelection(next: string[] | null) {
    if (!target) return;
    if (target.kind === 'golf') {
      const updated = state.golfMatches.map(m =>
        m.id === target.matchId
          ? {
              ...m,
              [target.team === 'harvey' ? 'customHarvey' : 'customCarbery']: next,
            }
          : m,
      );
      patch({ golfMatches: updated });
    } else {
      const eventMap = { ...state.drinkingMatches[target.eventId] };
      const matchState = eventMap[target.matchId];
      if (!matchState) return;
      eventMap[target.matchId] = {
        ...matchState,
        [target.team === 'harvey' ? 'customHarvey' : 'customCarbery']: next,
      };
      patch({
        drinkingMatches: {
          ...state.drinkingMatches,
          [target.eventId]: eventMap,
        },
      });
    }
  }

  function save() {
    commitSelection(selected.length > 0 ? [...selected] : null);
    onClose();
  }
  function clear() {
    setSelected([]);
  }

  const showHcp = target.kind === 'golf';
  const teamLabel = target.team === 'harvey' ? 'TEAM HARVEY' : 'TEAM CARBERY';
  const teamPillClass = target.team === 'harvey' ? 'bg-navy text-gold' : 'bg-gold text-navy';

  let title = '';
  let subtitle = '';
  if (target.kind === 'golf') {
    const m = state.golfMatches.find(x => x.id === target.matchId);
    title = `Match ${target.matchId} · ${m?.format ?? ''}`;
    subtitle = `${m ? ROUND_LABELS[m.round as RoundId] : ''} · Select ${maxPlayers} players`;
  } else {
    const eventLabel = { 'beer-die': 'Beer Die', bags: 'Bags', 'beer-pong': 'Beer Pong' }[target.eventId];
    const matchNum = (state.drinkingMatches[target.eventId] ? Object.keys(state.drinkingMatches[target.eventId]).indexOf(target.matchId) : -1) + 1;
    title = `Captain's Pick · Match ${matchNum}`;
    subtitle = `${eventLabel} · Select ${maxPlayers} players`;
  }

  const usedCount = usedThisRound.size;
  const remainingNote = isGolf
    ? usedCount > 0
      ? `${usedCount} player${usedCount === 1 ? '' : 's'} already locked into another match this round (grayed below).`
      : `All ${HARVEY_ROSTER.length} players still available this round.`
    : null;

  const teamSelectClass = target.team === 'harvey' ? 'bg-navy text-white border-navy' : 'bg-gold text-navy border-gold-dark';

  return (
    <Modal open={!!target} onClose={onClose} maxWidth="max-w-md">
      <div className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider mb-3 ${teamPillClass}`}>
        {teamLabel}
      </div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-xs text-text-muted mb-4">{subtitle}</p>

      <div className="bg-bg rounded-xl px-3.5 py-3 mb-4 min-h-[56px]">
        <div className="text-[11px] font-bold tracking-wider text-text-muted mb-2">
          SELECTED ({selected.length} / {maxPlayers})
        </div>
        {selected.length === 0 ? (
          <span className="text-[13px] text-text-soft italic">No players selected yet</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selected.map(p => {
              const hcp = showHcp ? hcpFor(p) : null;
              return (
                <span key={p} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[13px] font-semibold ${teamSelectClass}`}>
                  {p}
                  {hcp !== null ? (
                    <span className="bg-black/15 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{hcp}</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => toggle(p)}
                    className="text-sm font-bold leading-none px-1"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-[11px] font-bold tracking-wider text-text-muted mb-2">ROSTER</div>
      {remainingNote ? (
        <div className="text-xs text-text-muted bg-bg border-l-[3px] border-gold rounded-md py-2 px-3 mb-3">
          {remainingNote}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {roster.map(p => {
          const isSelected = selected.includes(p);
          const isLockedElsewhere = isGolf && usedThisRound.has(p) && !isSelected;
          const hcp = showHcp ? hcpFor(p) : null;
          const baseCls = isSelected
            ? target.team === 'harvey'
              ? 'bg-navy text-white border-navy'
              : 'bg-gold text-navy border-gold-dark'
            : 'bg-surface text-text border-border';
          const disabledCls = isLockedElsewhere ? 'opacity-55 line-through cursor-not-allowed !bg-c-gray-100 !text-text-soft' : 'hover:bg-c-gray-100';
          return (
            <button
              key={p}
              onClick={() => !isLockedElsewhere && toggle(p)}
              disabled={isLockedElsewhere}
              title={isLockedElsewhere ? 'Already picked in another match this round' : undefined}
              className={`px-3 py-2 rounded-full border text-[13px] font-semibold transition ${baseCls} ${disabledCls}`}
            >
              {p}
              {hcp !== null ? (
                <span className="ml-1 bg-black/15 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  HCP {hcp}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between gap-2 border-t border-border pt-4">
        <button onClick={clear} className="bg-transparent text-red-600 text-[13px] font-semibold hover:underline">
          Clear
        </button>
        <div className="flex gap-2">
          <button onClick={onClose} className="bg-c-gray-200 text-text px-4 py-2.5 rounded-full text-[13px] font-bold hover:opacity-85">
            Cancel
          </button>
          <button onClick={save} className="bg-navy text-gold px-4 py-2.5 rounded-full text-[13px] font-bold hover:opacity-85">
            Save Picks
          </button>
        </div>
      </div>
    </Modal>
  );
}
