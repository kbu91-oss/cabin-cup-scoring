import Link from 'next/link';
import { SCHEDULE_DAYS, linkHrefFor, type ScheduleNote, type ScheduleLink } from '@/lib/schedule';

export const metadata = { title: 'Schedule · Cabin Cup 2026' };

export default function SchedulePage() {
  return (
    <>
      <section className="text-center border-b border-border pb-6 mb-2">
        <h1 className="text-3xl font-black tracking-tight">Schedule &amp; Itinerary</h1>
        <p className="text-sm text-text-muted mt-1.5 font-medium">Cabin Cup 2026 · Pour It On</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {SCHEDULE_DAYS.map(day => (
          <DayCard key={day.id} day={day} />
        ))}
      </div>

      <div className="mt-4 p-3 border border-border border-l-4 border-l-gold bg-surface rounded-lg text-xs text-text-muted leading-relaxed">
        Dates carried over from the 2025 itinerary — update <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]">SCHEDULE_DAYS</code> in
        <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]"> src/lib/schedule.ts</code> once 2026 details are confirmed.
        Locations live on the <Link href="/details" className="text-navy underline font-semibold">Details page</Link>.
      </div>
    </>
  );
}

function DayCard({ day }: { day: (typeof SCHEDULE_DAYS)[number] }) {
  return (
    <div className="bg-surface border border-border border-t-4 border-t-navy rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-bg border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-lg font-black -tracking-[0.3px]">{day.label}</div>
          <div className="text-xs text-text-muted mt-0.5">{day.date}</div>
        </div>
        <span className="bg-navy text-gold px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">
          {day.tag}
        </span>
      </div>

      <ul className="py-2">
        {day.events.map((ev, i) => (
          <EventRow key={i} ev={ev} />
        ))}
      </ul>
    </div>
  );
}

function EventRow({ ev }: { ev: (typeof SCHEDULE_DAYS)[number]['events'][number] }) {
  const TitleEl = ev.link ? (
    <LinkLabel link={ev.link} className="text-sm font-bold text-navy hover:underline inline-flex items-center gap-1">
      {ev.title} <span className="text-[11px] opacity-70">→</span>
    </LinkLabel>
  ) : (
    <div className="text-sm font-bold">{ev.title}</div>
  );

  return (
    <li className="grid grid-cols-[90px_1fr] gap-3 px-5 py-2.5 border-b border-c-gray-100 last:border-b-0">
      <div className="text-xs font-bold text-navy pt-0.5">{ev.time}</div>
      <div>
        {TitleEl}
        {ev.sub ? <div className="text-xs text-text-muted mt-0.5">{ev.sub}</div> : null}
        {ev.notes && ev.notes.length ? (
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {ev.notes.map((n, j) => (
              <NoteRow key={j} note={n} />
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function NoteRow({ note }: { note: ScheduleNote }) {
  if (typeof note === 'string') {
    return (
      <li className="text-xs text-text pl-3 relative before:content-['·'] before:absolute before:left-1 before:text-text-soft">
        {note}
      </li>
    );
  }
  return (
    <li className="text-xs pl-3 relative before:content-['·'] before:absolute before:left-1 before:text-text-soft">
      {note.link ? (
        <LinkLabel link={note.link} className="text-navy font-semibold hover:underline inline-flex items-center gap-1">
          {note.text} <span className="text-[11px] opacity-70">→</span>
        </LinkLabel>
      ) : (
        <span className="text-text">{note.text}</span>
      )}
    </li>
  );
}

function LinkLabel({
  link,
  className,
  children,
}: {
  link: ScheduleLink;
  className?: string;
  children: React.ReactNode;
}) {
  const target = linkHrefFor(link);
  if (!target) return <span className={className}>{children}</span>;
  // Hash carries scoreboard event/round hints — the scoreboard page reads them.
  const href = target.hash ? `${target.href}#${target.hash}` : target.href;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
