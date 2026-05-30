'use client';

import { useEffect, useState } from 'react';
import { EVENT_IDS, ROUND_LABELS, type EventId, type RoundId } from '@/lib/cup';
import { useStore } from '@/lib/store';
import { TeamScoreboard } from '@/components/TeamScoreboard';
import { EventTabs } from '@/components/EventTabs';
import { GolfView } from '@/components/GolfView';
import { DrinkingView } from '@/components/DrinkingView';
import { CaptainsBeerPongView } from '@/components/CaptainsBeerPongView';

export default function ScoreboardPage() {
  const [selectedEvent, setSelectedEvent] = useState<EventId>('golf');
  const [initialRound, setInitialRound] = useState<RoundId | undefined>(undefined);
  const { reset } = useStore();

  // Read URL hash for cross-links from Schedule page (e.g. /#event=golf&round=mountain-front).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const ev = params.get('event');
    if (ev && (EVENT_IDS as readonly string[]).includes(ev)) {
      setSelectedEvent(ev as EventId);
    }
    const r = params.get('round');
    if (r && r in ROUND_LABELS) setInitialRound(r as RoundId);
  }, []);

  return (
    <>
      <TeamScoreboard />
      <EventTabs selected={selectedEvent} onSelect={setSelectedEvent} />

      {selectedEvent === 'golf' ? <GolfView initialRound={initialRound} /> : null}
      {selectedEvent === 'captains-beer-pong' ? <CaptainsBeerPongView /> : null}
      {selectedEvent === 'beer-die' ? <DrinkingView eventId="beer-die" /> : null}
      {selectedEvent === 'bags' ? <DrinkingView eventId="bags" /> : null}
      {selectedEvent === 'beer-pong' ? <DrinkingView eventId="beer-pong" /> : null}

      <div className="flex justify-center pt-4">
        <button
          onClick={() => {
            if (confirm('Reset all match scores and event totals back to zero? This cannot be undone.')) {
              reset();
            }
          }}
          className="bg-transparent border border-border px-4 py-2 rounded-full text-[12px] font-medium text-text-muted hover:bg-c-gray-100"
        >
          Reset all scores
        </button>
      </div>
    </>
  );
}
