'use client';

import { useStore } from '@/lib/store';

const CHOICES: { value: 'harvey' | 'carbery' | null; label: string; sub: string; icon: string; accent: 'harvey' | 'carbery' | 'none' }[] = [
  { value: 'harvey', label: 'Clay Harvey', sub: 'Team Harvey wins +1', icon: 'CH', accent: 'harvey' },
  { value: null, label: 'Not Played', sub: 'No points awarded yet', icon: '—', accent: 'none' },
  { value: 'carbery', label: 'Dan Carbery', sub: 'Team Carbery wins +1', icon: 'DC', accent: 'carbery' },
];

export function CaptainsBeerPongView() {
  const { state, patch } = useStore();
  const winner = state.beerPongWinner;
  const isFinal = state.beerPongStatus === 'final';

  function setWinner(v: 'harvey' | 'carbery' | null) {
    if (isFinal) return;
    patch({ beerPongWinner: v });
  }
  function finalize() {
    if (!winner) return;
    patch({ beerPongStatus: 'final' });
  }
  function unfinalize() {
    patch({ beerPongStatus: 'in-progress' });
  }

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center gap-4 border-b border-border pb-5 flex-wrap">
        <div className="w-12 h-12 bg-navy text-gold rounded-xl flex items-center justify-center font-black text-lg">
          CB
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold">Captains&apos; Beer Pong</div>
          <div className="text-[13px] text-text-muted">
            Night 1 · Captain vs. Captain · Winner takes 1 point
          </div>
        </div>
        <span
          className={`text-[11px] tracking-wider px-3 py-1.5 rounded-full font-semibold ${
            isFinal ? 'bg-navy text-gold' : 'bg-c-gray-100 text-text-muted'
          }`}
        >
          {isFinal ? 'FINAL' : '1 PT TOTAL'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CHOICES.map(c => {
          const active = winner === c.value;
          const baseBorder =
            active && c.accent === 'harvey'
              ? 'border-navy bg-navy/5'
              : active && c.accent === 'carbery'
                ? 'border-gold-dark bg-gold/10'
                : active && c.accent === 'none'
                  ? 'border-c-gray-300 bg-c-gray-100'
                  : 'border-border';
          const iconBase =
            c.accent === 'harvey'
              ? 'bg-navy text-white'
              : c.accent === 'carbery'
                ? 'bg-gold text-navy'
                : 'bg-c-gray-200 text-text-muted';
          return (
            <button
              key={c.label}
              disabled={isFinal && !active}
              onClick={() => setWinner(c.value)}
              className={`p-6 rounded-xl border-2 ${baseBorder} flex flex-col items-center gap-2 transition ${
                isFinal ? 'cursor-default' : 'hover:border-text-muted'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${iconBase}`}>
                {c.icon}
              </div>
              <div className="text-sm font-bold">{c.label}</div>
              <div className="text-[11px] text-text-muted">{c.sub}</div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        {isFinal ? (
          <button
            onClick={unfinalize}
            className="bg-c-gray-500 text-white px-5 py-2.5 rounded-full text-[13px] font-semibold hover:opacity-85"
          >
            Edit Match
          </button>
        ) : winner ? (
          <button
            onClick={finalize}
            className="bg-navy text-gold px-5 py-2.5 rounded-full text-[13px] font-semibold hover:opacity-85"
          >
            Finalize Match
          </button>
        ) : null}
      </div>
    </div>
  );
}
