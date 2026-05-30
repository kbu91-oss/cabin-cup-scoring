'use client';

import { useStore } from '@/lib/store';
import { TOTAL_POINTS, WIN_THRESHOLD, fmt } from '@/lib/cup';
import { teamTotals } from '@/lib/scoring';

export function TeamScoreboard() {
  const { state } = useStore();
  const totals = teamTotals({
    golfMatches: state.golfMatches,
    drinking: state.drinkingMatches,
    captainsBeerPongWinner: state.beerPongWinner,
  });
  const harveyTarget = totals.harvey >= WIN_THRESHOLD ? 'WINNER!' : `NEEDS ${fmt(WIN_THRESHOLD - totals.harvey)} TO WIN`;
  const carberyTarget = totals.carbery >= WIN_THRESHOLD ? 'WINNER!' : `NEEDS ${fmt(WIN_THRESHOLD - totals.carbery)} TO WIN`;
  const navyPct = Math.min((totals.harvey / TOTAL_POINTS) * 100, 50);
  const goldPct = Math.min((totals.carbery / TOTAL_POINTS) * 100, 50);

  return (
    <section className="bg-surface border border-border rounded-2xl p-5 sm:p-8 shadow-sm flex flex-col gap-3">
      <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-4 h-4 sm:w-6 sm:h-6 bg-navy rounded-full" />
            <span className="text-xs sm:text-xl font-bold">Team Harvey</span>
          </div>
          <div className="text-5xl sm:text-7xl md:text-8xl font-black text-navy -tracking-[2px] leading-none">
            {fmt(totals.harvey)}
          </div>
          <div className="text-[10px] sm:text-xs font-semibold text-text-muted tracking-wider text-center">
            {harveyTarget}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          {/* Using <img> because Next/Image needs config we haven't set up yet */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cabin-cup-logo.png"
            alt="Cabin Cup logo"
            className="w-16 h-16 sm:w-28 sm:h-28 rounded-lg object-contain bg-c-gray-100"
          />
          <div className="text-xs sm:text-[28px] font-black -tracking-[0.5px]">CABIN CUP</div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-xl font-bold">Team Carbery</span>
            <span className="w-4 h-4 sm:w-6 sm:h-6 bg-gold border border-gold-dark rounded-full" />
          </div>
          <div className="text-5xl sm:text-7xl md:text-8xl font-black text-gold-dark -tracking-[2px] leading-none">
            {fmt(totals.carbery)}
          </div>
          <div className="text-[10px] sm:text-xs font-semibold text-text-muted tracking-wider text-center">
            {carberyTarget}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6 sm:pt-8 mt-4 flex flex-col gap-3">
        <div className="text-center text-xs sm:text-sm text-text-muted font-medium">
          {TOTAL_POINTS} Total Cup Points
        </div>
        <div
          className="relative w-full h-10 sm:h-16 rounded-xl overflow-visible"
          style={{
            background:
              'linear-gradient(to right, rgba(10,34,64,0.12), rgba(10,34,64,0.06), var(--color-c-gray-200))',
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 bg-navy rounded-l-xl transition-[width] duration-500"
            style={{ width: `${navyPct}%` }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 rounded-r-xl transition-[width] duration-500"
            style={{
              width: `${goldPct}%`,
              background: 'linear-gradient(180deg, var(--color-gold), var(--color-gold-dark))',
            }}
          />
          <div className="absolute left-1/2 -top-1 -bottom-1 w-2 bg-white -translate-x-1/2 rounded-full shadow ring-1 ring-c-gray-300" />
        </div>
        <div className="flex justify-between text-[11px] sm:text-xs text-text-soft">
          <span>Team Harvey: {fmt(totals.harvey)}</span>
          <span>Team Carbery: {fmt(totals.carbery)}</span>
        </div>
      </div>
    </section>
  );
}
