import { useEffect, useState } from 'react';

interface NavItem {
  id: string;
  label: string;
}

const items: NavItem[] = [
  { id: 'masthead', label: 'Digest' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'stack-diagram', label: 'Stack' },
  { id: 'assessment', label: 'Assess' },
  { id: 'provider-footprint', label: 'Vendors' },
  { id: 'implementation', label: 'Roadmap' },
  { id: 'explorer', label: 'Explorer' },
  { id: 'layer-definitions', label: 'Layers' },
  { id: 'decision-log', label: 'Decisions' },
  { id: 'chat', label: 'Chat' },
  { id: 'feedback', label: 'Feedback' },
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
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4">
        <a href="#masthead" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <img
            src="/logo.png"
            alt="Agentics Foundation"
            className="h-7 w-7 flex-shrink-0 select-none"
            draggable={false}
          />
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-[0.6875rem] sm:text-xs font-mono text-white tracking-[0.18em] uppercase whitespace-nowrap">
              Agentics Foundation
            </span>
            <span className="text-[0.5625rem] sm:text-[0.625rem] font-mono text-white/55 tracking-[0.22em] uppercase whitespace-nowrap mt-0.5">
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

        {/* Mobile menu button — visible below md, triggers palette */}
        <button
          onClick={onOpenPalette}
          className="md:hidden ml-auto flex items-center gap-1.5 px-2.5 py-1.5 border border-[#f05122]/50 bg-[#f05122]/10 rounded text-[#ff8a5c] hover:text-white hover:bg-[#f05122]/20 transition-colors"
          aria-label="Open navigation menu"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <line x1="3" y1="6"  x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="text-[0.6875rem] font-mono tracking-[0.14em] uppercase">Menu</span>
        </button>

        <button
          onClick={onOpenPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1 text-xs font-mono text-white/45 border border-white/10 rounded hover:text-white hover:border-[#f05122]/50 transition-colors"
          aria-label="Open quick navigation (slash)"
        >
          <kbd className="text-[0.625rem] px-1 py-0.5 rounded border border-white/15 bg-white/[0.03]">
            /
          </kbd>
          <span>jump</span>
        </button>

        <div className="hidden lg:flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
          <span>Session</span>
          <span className="text-white/80">{elapsed}</span>
        </div>
      </div>
    </div>
  );
}
