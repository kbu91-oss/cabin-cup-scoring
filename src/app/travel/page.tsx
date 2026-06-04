'use client';

import { useState } from 'react';
import { useStore, type TravelArrival } from '@/lib/store';
import { VOTERS, TEAMS, type Voter } from '@/lib/teams';

export default function TravelPage() {
  const { state, patch } = useStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const selectedVoter = VOTERS.find(v => v.id === selectedPlayerId) ?? null;
  const myArrival = state.travelArrivals.find(a => a.playerId === selectedPlayerId) ?? null;

  function save(entry: TravelArrival) {
    const existing = state.travelArrivals.some(a => a.playerId === entry.playerId);
    const next = existing
      ? state.travelArrivals.map(a => (a.playerId === entry.playerId ? entry : a))
      : [...state.travelArrivals, entry];
    patch({ travelArrivals: next });
  }

  function clear(playerId: string) {
    patch({ travelArrivals: state.travelArrivals.filter(a => a.playerId !== playerId) });
  }

  // Sort arrivals chronologically.
  const sorted = [...state.travelArrivals].sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );

  return (
    <>
      <section className="text-center border-b border-border pb-6 mb-2">
        <h1 className="text-3xl font-black tracking-tight">Travel & Arrivals</h1>
        <p className="text-sm text-text-muted mt-1.5 font-medium">
          Drop your arrival time so the group knows when to grab you
        </p>
      </section>

      <div className="flex flex-col gap-4 max-w-2xl w-full mx-auto">
        <VoterPicker
          voters={VOTERS}
          selectedId={selectedPlayerId}
          onSelect={setSelectedPlayerId}
          arrivals={state.travelArrivals}
        />
        {selectedVoter ? (
          <ArrivalForm
            voter={selectedVoter}
            existing={myArrival}
            onSave={save}
            onClear={() => clear(selectedVoter.id)}
          />
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-6 text-center text-sm text-text-muted">
            Tap your name above to enter or update your arrival.
          </div>
        )}
      </div>

      <ArrivalsList arrivals={sorted} />
    </>
  );
}

// --- components ---

function VoterPicker({
  voters, selectedId, onSelect, arrivals,
}: {
  voters: Voter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  arrivals: TravelArrival[];
}) {
  const hasEntry = (id: string) => arrivals.some(a => a.playerId === id);
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
      <div className="text-[11px] font-bold tracking-wider text-text-muted mb-3">
        WHO ARE YOU?
      </div>
      <div className="flex flex-wrap gap-1.5">
        {voters.map(v => {
          const selected = v.id === selectedId;
          const entered = hasEntry(v.id);
          const base = selected
            ? v.team === 'harvey' ? 'bg-navy text-white border-navy' : 'bg-gold text-navy border-gold-dark'
            : 'bg-surface text-text border-border hover:bg-c-gray-100';
          return (
            <button
              key={v.id}
              onClick={() => onSelect(v.id)}
              className={`px-3 py-2 rounded-full border text-[13px] font-semibold inline-flex items-center gap-1.5 transition ${base}`}
            >
              {v.display}
              {entered ? <span className="text-[11px]">✓</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Convert a "HH:MM" 24-hour string into { hour12, minute, ampm } for the picker.
function parseHHMM(hhmm: string): { hour12: number; minute: number; ampm: 'AM' | 'PM' } {
  const [hRaw, mRaw] = hhmm.split(':').map(Number);
  const h = Number.isNaN(hRaw) ? 15 : hRaw;
  const m = Number.isNaN(mRaw) ? 0 : mRaw;
  const ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { hour12, minute: m, ampm };
}

function toHHMM(hour12: number, minute: number, ampm: 'AM' | 'PM'): string {
  let h24 = hour12 % 12;
  if (ampm === 'PM') h24 += 12;
  return `${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function ArrivalForm({
  voter, existing, onSave, onClear,
}: {
  voter: Voter;
  existing: TravelArrival | null;
  onSave: (entry: TravelArrival) => void;
  onClear: () => void;
}) {
  // Default date — most folks are arriving Thursday June 11 ahead of the weekend.
  const [date, setDate] = useState(existing?.date ?? '2026-06-11');

  const initialTime = parseHHMM(existing?.time ?? '15:00');
  const [hour12, setHour12] = useState(initialTime.hour12);
  const [minute, setMinute] = useState(initialTime.minute);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(initialTime.ampm);

  const [notes, setNotes] = useState(existing?.notes ?? '');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    onSave({
      playerId: voter.id,
      date,
      time: toHHMM(hour12, minute, ampm),
      notes: notes.trim() || undefined,
      timestamp: Date.now(),
    });
  }

  const teamAccent = voter.team === 'harvey' ? 'border-t-navy' : 'border-t-gold';

  // 1..12 hours, every 5-min granularity for minutes.
  const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
  const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <form
      onSubmit={submit}
      className={`bg-surface border border-border border-t-4 ${teamAccent} rounded-2xl p-4 sm:p-5 flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold">{voter.display}&apos;s arrival</div>
          <div className="text-xs text-text-muted">
            {existing ? 'Update or clear your arrival' : 'When are you getting in?'}
          </div>
        </div>
        {existing ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-600 font-semibold hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div>
        <Label>ARRIVAL DATE</Label>
        <input
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-bg outline-none focus:border-navy"
        />
      </div>

      <div>
        <Label>ARRIVAL TIME</Label>
        <div className="grid grid-cols-3 gap-2">
          <TimeSelect value={hour12} onChange={setHour12} options={HOURS} format={n => String(n)} ariaLabel="Hour" />
          <TimeSelect value={minute} onChange={setMinute} options={MINUTES} format={n => n.toString().padStart(2, '0')} ariaLabel="Minute" />
          <select
            aria-label="AM or PM"
            value={ampm}
            onChange={e => setAmpm(e.target.value as 'AM' | 'PM')}
            className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-bg outline-none focus:border-navy font-semibold"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      <div>
        <Label>NOTES (airline, flight #, driving, etc.)</Label>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. DL5121 from JFK · or · driving from Boston with Yuri"
          className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-bg outline-none focus:border-navy"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-navy text-gold px-5 py-2.5 rounded-full text-[13px] font-bold hover:opacity-85"
        >
          {existing ? 'Update arrival' : 'Save arrival'}
        </button>
      </div>
    </form>
  );
}

function TimeSelect({
  value, onChange, options, format, ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  options: number[];
  format: (n: number) => string;
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-bg outline-none focus:border-navy font-semibold"
    >
      {options.map(n => <option key={n} value={n}>{format(n)}</option>)}
    </select>
  );
}

function ArrivalsList({ arrivals }: { arrivals: TravelArrival[] }) {
  if (arrivals.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center max-w-2xl w-full mx-auto">
        <div className="text-[11px] font-bold tracking-wider text-text-muted mb-2">ARRIVING</div>
        <div className="text-sm text-text-muted">No arrivals shared yet.</div>
      </div>
    );
  }

  // Group by date for visual grouping.
  const byDate = new Map<string, TravelArrival[]>();
  arrivals.forEach(a => {
    if (!byDate.has(a.date)) byDate.set(a.date, []);
    byDate.get(a.date)!.push(a);
  });

  return (
    <div className="bg-surface border border-border border-t-4 border-t-gold rounded-2xl p-5 max-w-2xl w-full mx-auto">
      <div className="text-[11px] font-bold tracking-wider text-text-muted mb-3">
        ARRIVING · {arrivals.length} {arrivals.length === 1 ? 'PERSON' : 'PEOPLE'}
      </div>
      <div className="flex flex-col gap-4">
        {Array.from(byDate.entries()).map(([date, entries]) => (
          <div key={date} className="flex flex-col gap-1.5">
            <div className="text-xs font-bold text-navy uppercase tracking-wider border-b border-border pb-1.5">
              {formatDate(date)}
            </div>
            {entries.map(a => <ArrivalRow key={a.playerId} arrival={a} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrivalRow({ arrival }: { arrival: TravelArrival }) {
  const voter = VOTERS.find(v => v.id === arrival.playerId);
  if (!voter) return null;
  const team = TEAMS[voter.team];
  const dotClass = voter.team === 'harvey' ? 'bg-navy' : 'bg-gold';
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotClass}`} title={team.name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <div className="text-sm font-bold">{voter.display}</div>
          <div className="text-xs font-semibold text-text-muted whitespace-nowrap">
            {formatTime(arrival.time)}
          </div>
        </div>
        {arrival.notes ? (
          <div className="text-[13px] text-text-muted leading-snug mt-0.5">{arrival.notes}</div>
        ) : null}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold tracking-wider text-text-muted mb-1.5">{children}</div>;
}

function formatDate(iso: string): string {
  // iso is YYYY-MM-DD. Build a local Date by hand to avoid timezone shenanigans.
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d);
  return dt.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const ampm = h >= 12 ? 'pm' : 'am';
  const hr12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr12}:${m.toString().padStart(2, '0')}${ampm}`;
}
