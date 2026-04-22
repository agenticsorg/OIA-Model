import { useEffect, useMemo, useRef, useState } from 'react';
import { layers } from '../content/layers';
import { spans } from '../content/spans';
import { decisions } from '../content/decision-log';

interface Entry {
  id: string;
  label: string;
  hint: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo<Entry[]>(
    () => [
      { id: 'masthead', label: 'Masthead', hint: 'Top of page' },
      { id: 'hero-dashboard', label: 'Live Telemetry Dashboard', hint: 'Hero' },
      { id: 'stack-diagram', label: 'Stack Diagram — layer × span canvas', hint: 'Implementation tool' },
      { id: 'assessment', label: 'Architecture Assessment — rate your stack', hint: 'Implementation tool' },
      { id: 'provider-footprint', label: 'Provider Footprint — vendor × layer matrix', hint: 'Implementation tool' },
      { id: 'implementation', label: 'Implementation Roadmap — per-layer checklists', hint: 'Implementation tool' },
      { id: 'explorer', label: 'Explorer — search concerns / tech / OQs', hint: 'Implementation tool' },
      { id: 'on-reading', label: 'On Reading This Digest', hint: 'Preface' },
      { id: 'foreword', label: 'Foreword by Reuven Cohen', hint: '§Foreword' },
      { id: 'introduction', label: 'Introduction', hint: '§1' },
      { id: 'foundations', label: 'Foundations', hint: '§2' },
      { id: 'nine-layers-overview', label: 'The Nine Layers (table)', hint: '§3' },
      { id: 'layer-definitions', label: 'Layer Definitions', hint: '§4' },
      ...layers.map((l) => ({ id: l.id, label: `Layer ${l.number} — ${l.name}`, hint: `§4.${l.number}` })),
      { id: 'cross-layer-spans', label: 'Cross-Layer Spans', hint: '§5' },
      ...spans.map((s) => ({ id: s.id, label: s.name, hint: s.code })),
      { id: 'relationship-to-others', label: 'Relationship to Other Reference Models', hint: '§6' },
      { id: 'adoption', label: 'Adoption', hint: '§7' },
      { id: 'deferrals', label: 'What This Draft Defers', hint: '§8' },
      { id: 'closing', label: 'Closing', hint: 'Digest close' },
      { id: 'decision-log', label: 'Decision Log Digest', hint: '11 decisions' },
      ...decisions.map((d) => ({ id: d.id, label: `Decision ${d.number} — ${d.title}`, hint: d.category })),
      { id: 'using-this-log', label: 'On Using This Log', hint: 'Decision Log close' },
      { id: 'colophon', label: 'Colophon', hint: 'Bottom of page' },
    ],
    [],
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return entries.slice(0, 14);
    const lq = q.toLowerCase();
    return entries.filter((e) => e.label.toLowerCase().includes(lq) || e.hint.toLowerCase().includes(lq)).slice(0, 24);
  }, [q, entries]);

  useEffect(() => {
    if (open) {
      setQ('');
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Section navigator"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="cmd-panel relative w-full max-w-2xl z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cmd-panel-header">
          <span className="text-xs text-white/45 font-mono uppercase tracking-[0.18em]">
            Jump to section
          </span>
          <span className="text-[0.625rem] text-white/30 font-mono">Esc to close</span>
        </div>
        <div className="cmd-panel-body">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search layers, spans, decisions…"
            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-[#f05122]/60"
          />
          <ul className="mt-3 max-h-80 overflow-auto divide-y divide-white/5">
            {filtered.map((e) => (
              <li key={e.id}>
                <a
                  href={`#${e.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-2 py-2 hover:bg-white/[0.04] rounded"
                >
                  <span className="text-sm text-white/85 truncate">{e.label}</span>
                  <span className="text-[0.6875rem] font-mono text-[#ff8a5c]/80 ml-4 flex-shrink-0">
                    {e.hint}
                  </span>
                </a>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2 py-3 text-sm text-white/40">no matches</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
