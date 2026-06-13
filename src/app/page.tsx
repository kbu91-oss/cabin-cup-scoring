'use client';

import { useEffect, useState } from 'react';
import { EVENT_IDS, ROUND_LABELS, RESET_SCORES_PASSWORD, type EventId, type RoundId } from '@/lib/cup';
import { useStore } from '@/lib/store';
import { TeamScoreboard } from '@/components/TeamScoreboard';
import { EventTabs } from '@/components/EventTabs';
import { GolfView } from '@/components/GolfView';
import { DrinkingView } from '@/components/DrinkingView';
import { CaptainsBeerPongView } from '@/components/CaptainsBeerPongView';
import { Modal } from '@/components/Modal';

const LAST_EVENT_KEY = 'cabin-cup-last-event';

function loadLastEvent(): EventId | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(LAST_EVENT_KEY);
    return v && (EVENT_IDS as readonly string[]).includes(v) ? (v as EventId) : null;
  } catch {
    return null;
  }
}

export default function ScoreboardPage() {
  // Initial event: URL hash > localStorage > default 'golf'.
  const [selectedEvent, setSelectedEvent] = useState<EventId>(
    () => loadLastEvent() ?? 'golf'
  );
  const [initialRound, setInitialRound] = useState<RoundId | undefined>(undefined);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetPwd, setResetPwd] = useState('');
  const [resetErr, setResetErr] = useState(false);
  const { reset } = useStore();

  // Persist the active event tab so refresh keeps you on the same view.
  useEffect(() => {
    try {
      localStorage.setItem(LAST_EVENT_KEY, selectedEvent);
    } catch {
      /* ignore */
    }
  }, [selectedEvent]);

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

  function tryReset() {
    if (resetPwd !== RESET_SCORES_PASSWORD) {
      setResetErr(true);
      setTimeout(() => setResetErr(false), 500);
      return;
    }
    reset();
    setResetPwd('');
    setResetOpen(false);
  }

  function closeReset() {
    setResetOpen(false);
    setResetPwd('');
    setResetErr(false);
  }

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
          onClick={() => setResetOpen(true)}
          className="bg-transparent border border-border px-4 py-2 rounded-full text-[12px] font-medium text-text-muted hover:bg-c-gray-100"
        >
          Reset all scores
        </button>
      </div>

      <Modal open={resetOpen} onClose={closeReset} maxWidth="max-w-sm">
        <div className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider mb-3 bg-red-soft text-red-600">
          DANGER ZONE
        </div>
        <h3 className="text-lg font-bold mb-1">Reset all scores?</h3>
        <p className="text-xs text-text-muted mb-4">
          Wipes every match, hole, drinking-game winner, and MVP ballot back to zero —
          for every device watching this scoreboard. Captain picks, lunch orders, and
          travel arrivals are kept. Cannot be undone.
        </p>

        <label className="block text-[11px] font-bold tracking-wider text-text-muted mb-2">
          ORGANIZER PASSWORD
        </label>
        <input
          type="password"
          autoFocus
          value={resetPwd}
          onChange={e => setResetPwd(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') tryReset();
          }}
          placeholder="Enter password"
          className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-bg outline-none transition ${
            resetErr ? 'border-red-500 ring-2 ring-red-200' : 'border-border focus:border-navy'
          }`}
        />
        {resetErr ? (
          <p className="text-[12px] text-red-600 mt-1.5 font-medium">Wrong password.</p>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-border pt-4 mt-5">
          <button
            onClick={closeReset}
            className="bg-c-gray-200 text-text px-4 py-2.5 rounded-full text-[13px] font-bold hover:opacity-85"
          >
            Cancel
          </button>
          <button
            onClick={tryReset}
            className="bg-red-500 text-white px-4 py-2.5 rounded-full text-[13px] font-bold hover:opacity-85"
          >
            Reset scores
          </button>
        </div>
      </Modal>
    </>
  );
}
