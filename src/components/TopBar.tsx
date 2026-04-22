import { useEffect, useState } from 'react';

interface NavItem {
  id: string;
  label: string;
}

const items: NavItem[] = [
  { id: 'masthead', label: 'Digest' },
  { id: 'stack-diagram', label: 'Stack' },
  { id: 'assessment', label: 'Assess' },
  { id: 'provider-footprint', label: 'Vendors' },
  { id: 'implementation', label: 'Roadmap' },
  { id: 'explorer', label: 'Explorer' },
  { id: 'layer-definitions', label: 'Layers' },
  { id: 'decision-log', label: 'Decisions' },
];

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const hh = String(Math.floor(s / 3600)).padStart(2, '0');
      const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      setElapsed(`${hh}:${mm}:${ss}`);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="sticky top-0 z-50 tactile-glass border-b border-white/10">
      <div className="main-inset py-3 flex items-center gap-4">
        <a href="#masthead" className="flex items-center gap-3 min-w-0">
          <img
            src="/logo.png"
            alt="Agentics Foundation"
            className="h-7 w-7 flex-shrink-0 select-none"
            draggable={false}
          />
          <span className="hidden sm:flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono text-white tracking-[0.18em] uppercase whitespace-nowrap">
              Agentics Foundation
            </span>
            <span className="text-white/20">·</span>
            <span className="text-xs font-mono text-white/55 tracking-[0.18em] uppercase whitespace-nowrap">
              OIA Model v0.1
            </span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1 ml-auto bg-black p-1 rounded-lg border border-white/10 shadow-inner">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="px-2.5 py-1 text-xs font-normal text-white/55 hover:text-white hover:bg-white/[0.05] rounded transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          onClick={onOpenPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1 text-xs font-mono text-white/45 border border-white/10 rounded hover:text-white hover:border-[#f05122]/50 transition-colors"
          aria-label="Open quick navigation (slash)"
        >
          <kbd className="text-[0.625rem] px-1 py-0.5 rounded border border-white/15 bg-white/[0.03]">
            /
          </kbd>
          <span>jump</span>
        </button>

        <div className="ml-auto md:ml-0 flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
          <span className="hidden lg:inline">Session</span>
          <span className="text-white/80">{elapsed}</span>
        </div>
      </div>
    </div>
  );
}
