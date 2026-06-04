'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore, type SyncStatus } from '@/lib/store';

const NAV = [
  { href: '/',         label: 'Scoreboard' },
  { href: '/teams',    label: 'Teams' },
  { href: '/mvp',      label: 'Al Carbone MVP' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/details',  label: 'Details' },
  { href: '/history',  label: 'History' },
  { href: '/lunch',    label: 'Lunch Order' },
  { href: '/travel',   label: 'Travel' },
];

const STATUS_STYLES: Record<SyncStatus, { bg: string; border: string; dot: string; text: string; label: string; pulse: boolean }> = {
  live:       { bg: 'bg-green-50',   border: 'border-green-200',  dot: 'bg-green-500',  text: 'text-green-700',  label: 'LIVE',       pulse: true  },
  connecting: { bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-500',  text: 'text-amber-700',  label: 'SYNCING',    pulse: true  },
  error:      { bg: 'bg-red-soft',   border: 'border-red-border', dot: 'bg-red-500',    text: 'text-red-600',    label: 'SYNC ERROR', pulse: false },
  offline:    { bg: 'bg-c-gray-100', border: 'border-c-gray-200', dot: 'bg-c-gray-400', text: 'text-text-muted', label: 'LOCAL',      pulse: false },
};

export function SiteHeader() {
  const pathname = usePathname();
  const { syncStatus } = useStore();
  const s = STATUS_STYLES[syncStatus];
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cabin-cup-logo.png"
            alt="Cabin Cup logo"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-contain bg-bg"
          />
          <div className="hidden sm:block">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none">CABIN CUP</h1>
            <div className="text-[10px] font-semibold text-text-soft tracking-[2px] mt-1">POUR IT ON · EST. 2010</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium tracking-[0.5px] transition-colors whitespace-nowrap ${
                isActive(item.href)
                  ? 'text-navy-blue font-bold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          className={`flex items-center gap-1.5 ${s.bg} border ${s.border} rounded-full px-3 py-1.5 shrink-0`}
          title={
            syncStatus === 'live'       ? 'Connected to live scoreboard — changes sync across devices'
            : syncStatus === 'connecting' ? 'Connecting to live scoreboard…'
            : syncStatus === 'error'    ? 'Sync error — your changes are saved locally and will retry'
            :                             'Local mode — changes save only to this device'
          }
        >
          <span className={`w-2 h-2 ${s.dot} rounded-full ${s.pulse ? 'animate-pulse-dot' : ''}`} />
          <span className={`text-[11px] font-bold ${s.text} tracking-wider`}>{s.label}</span>
        </div>
      </div>

      {/* Mobile / tablet nav — horizontal scroll */}
      <nav className="lg:hidden flex gap-1 overflow-x-auto px-2 pb-2 border-t border-border">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition ${
              isActive(item.href)
                ? 'bg-navy text-gold'
                : 'text-text-muted hover:bg-c-gray-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
