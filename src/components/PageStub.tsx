export function PageStub({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-sm">
      <div className="text-5xl mb-3">{emoji}</div>
      <h1 className="text-2xl font-black mb-2">{title}</h1>
      <p className="text-text-muted max-w-md mx-auto text-sm leading-relaxed">{children}</p>
      <div className="mt-6 inline-block text-[11px] tracking-wider uppercase font-bold text-gold-dark bg-gold/10 px-3 py-1 rounded-full">
        Porting from HTML prototype
      </div>
    </div>
  );
}
