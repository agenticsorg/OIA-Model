import { useActiveSection } from '../hooks/useActiveSection';
import { spans } from '../content/spans';

export function SpanRail() {
  const ids = spans.map((s) => s.id);
  const active = useActiveSection(ids);
  return (
    <aside
      aria-label="Cross-layer span navigation"
      className="hidden lg:flex fixed right-3 top-28 z-40 flex-col gap-1 w-14 max-h-[calc(100vh-8rem)] overflow-y-auto pl-1"
    >
      <div className="text-[0.625rem] font-mono text-white/35 tracking-[0.18em] uppercase px-2 pb-2 border-b border-white/5 text-right">
        Spans
      </div>
      {spans.map((s) => {
        const isActive = active === s.id;
        const short = s.code.replace('SPAN-', '');
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            title={s.name}
            className={`flex items-center justify-end gap-2 px-2 py-1 rounded border text-[0.6875rem] font-mono tracking-[0.12em] transition-all ${
              isActive
                ? 'border-[#f05122]/60 bg-[#f05122]/10 text-[#ff8a5c]'
                : 'border-transparent text-white/45 hover:text-white/90 hover:border-white/10'
            }`}
          >
            <span>{short}</span>
            <span
              className={`w-1 h-1 rounded-full ${
                isActive ? 'bg-[#f05122] shadow-[0_0_6px_#f05122]' : 'bg-white/20'
              }`}
              aria-hidden="true"
            />
          </a>
        );
      })}
    </aside>
  );
}
