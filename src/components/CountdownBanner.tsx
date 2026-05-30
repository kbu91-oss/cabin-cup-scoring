'use client';

import { useEffect, useState } from 'react';
import { CUP_START, CUP_END, CUP_LABEL } from '@/lib/cup';

type State =
  | { phase: 'before'; label: string; value: string }
  | { phase: 'live'; label: string; value: string }
  | { phase: 'after'; label: string; value: string };

function compute(now: Date): State {
  if (now < CUP_START) {
    const diff = CUP_START.getTime() - now.getTime();
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const mins = Math.floor((diff % 3_600_000) / 60_000);
    const value =
      days > 0
        ? `${days} day${days !== 1 ? 's' : ''} · ${hours} hr · ${mins} min`
        : hours > 0
          ? `${hours} hr · ${mins} min`
          : `${mins} min`;
    return { phase: 'before', label: `${CUP_LABEL} starts in`, value };
  }
  if (now <= CUP_END) {
    const day = Math.floor((now.getTime() - CUP_START.getTime()) / 86_400_000) + 1;
    return { phase: 'live', label: `🔴 ${CUP_LABEL} · Live`, value: `Day ${day}` };
  }
  return { phase: 'after', label: `${CUP_LABEL} · Complete`, value: 'See you next year' };
}

export function CountdownBanner() {
  // Static placeholder for first paint (server) — replaced once mounted to avoid hydration mismatch.
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    setState(compute(new Date()));
    const id = setInterval(() => setState(compute(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!state) {
    return (
      <div className="bg-navy text-gold py-2 px-6 border-b border-white/10">
        <div className="max-w-[1440px] mx-auto text-center text-xs tracking-wider opacity-70">
          {CUP_LABEL}
        </div>
      </div>
    );
  }

  const isLive = state.phase === 'live';
  const isAfter = state.phase === 'after';
  const bgClass = isLive
    ? 'bg-gradient-to-r from-green-600 to-green-700'
    : isAfter
      ? 'bg-c-gray-100'
      : 'bg-gradient-to-r from-navy to-[#15315e]';
  const labelColor = isAfter ? 'text-text-soft' : 'text-white/70';
  const valueColor = isAfter ? 'text-text-muted' : isLive ? 'text-white' : 'text-gold';

  return (
    <div className={`${bgClass} py-2 px-6 border-b border-white/10`}>
      <div className="max-w-[1440px] mx-auto flex items-center justify-center gap-3 flex-wrap text-sm font-semibold">
        <span className={`uppercase tracking-wider text-[11px] ${labelColor}`}>{state.label}</span>
        <span className={`font-bold ${valueColor}`}>{state.value}</span>
      </div>
    </div>
  );
}
