'use client';

import { EVENT_IDS, type EventId, fmt } from '@/lib/cup';
import { useStore } from '@/lib/store';
import { eventTotal } from '@/lib/scoring';

const LABELS: Record<EventId, string> = {
  golf: 'Golf',
  'captains-beer-pong': "Captains' Beer Pong",
  'beer-die': 'Beer Die',
  bags: 'Bags',
  'beer-pong': 'Beer Pong',
};
const MAX_PTS: Partial<Record<EventId, number>> = {
  golf: 108,
  'captains-beer-pong': 1,
  'beer-die': 36,
  bags: 36,
  'beer-pong': 36,
};

export function EventTabs({
  selected,
  onSelect,
}: {
  selected: EventId;
  onSelect: (id: EventId) => void;
}) {
  const { state } = useStore();
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-border pb-1 -mx-4 sm:mx-0 px-4 sm:px-0">
      {EVENT_IDS.map(id => {
        const t = eventTotal(id, {
          golfMatches: state.golfMatches,
          drinking: state.drinkingMatches,
          captainsBeerPongWinner: state.beerPongWinner,
        });
        const max = MAX_PTS[id];
        const isActive = selected === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex-none px-3 sm:px-5 py-2.5 sm:py-3 border-b-[3px] text-[13px] sm:text-[15px] font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              isActive
                ? 'border-gold text-navy font-bold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <span>{LABELS[id]}</span>
            <span
              className={`text-[10px] sm:text-[11px] font-bold tracking-[0.3px] px-2 py-0.5 rounded-full ${
                isActive ? 'bg-navy text-gold' : 'bg-c-gray-100 text-text-muted'
              }`}
            >
              {fmt(t.harvey + t.carbery)}/{max}
            </span>
          </button>
        );
      })}
    </div>
  );
}
