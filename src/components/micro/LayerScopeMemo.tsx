import { useMemo } from 'react';
import { MicroTool, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { layers } from '../../content/layers';

export function LayerScopeMemo() {
  const [selected, setSelected] = useLocalStorage<Record<string, boolean>>('oia:op:scope-layers', {});

  const inScope = layers.filter((l) => selected[l.id]);
  const outOfScope = layers.filter((l) => !selected[l.id]);

  function toggle(id: string) {
    const n = { ...selected };
    if (n[id]) delete n[id];
    else n[id] = true;
    setSelected(n);
  }

  const artifact = useMemo(() => {
    if (inScope.length === 0) return '';
    const lines: string[] = [];
    lines.push('# Layer-scope memo');
    lines.push('');
    lines.push('This memo defines which OIA Model layers this system addresses, and which it consumes from or defers to another team.');
    lines.push('');
    lines.push('## In scope for our team');
    for (const l of inScope) {
      lines.push(`- **Layer ${l.number} — ${l.name}** · ${l.concerns.length} concerns · ${l.openQuestions.length} open question(s).`);
    }
    lines.push('');
    lines.push('## Out of scope / consumed from another owner');
    for (const l of outOfScope) {
      lines.push(`- Layer ${l.number} — ${l.name}`);
    }
    lines.push('');
    lines.push('## State-holding layer alignment');
    const sh3 = inScope.find((l) => l.number === 3);
    const sh8 = inScope.find((l) => l.number === 8);
    if (sh3 && sh8) lines.push('- Both state-holding layers (L3 data, L8 cognitive) are owned by this team. The pairing must be coherent.');
    else if (sh3) lines.push('- L3 owned here; L8 consumed. Define the provider-side cognitive-state contract.');
    else if (sh8) lines.push('- L8 owned here; L3 consumed. Define the data substrate contract with the data team.');
    else lines.push('- Neither state-holding layer is owned by this team. Both must be covered by an external contract.');
    lines.push('');
    lines.push('_Generated from OIA Model §3 The Nine Layers._');
    return lines.join('\n');
  }, [inScope, outOfScope]);

  return (
    <MicroTool
      title="Write a layer-scope memo"
      subtitle="Select the layers your team owns. The tool writes a scope memo that names both what you own and what you consume — useful for architecture reviews, RACI docs, or interface contracts between teams."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {layers.map((l) => {
          const on = !!selected[l.id];
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => toggle(l.id)}
              aria-pressed={on}
              className={`flex items-start gap-3 p-3 rounded border text-left transition-colors ${
                on
                  ? 'bg-[#f05122]/10 border-[#f05122]/50'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/25'
              }`}
            >
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  on ? 'bg-[#f05122] border-[#f05122]' : 'bg-black border-white/20'
                }`}
                aria-hidden="true"
              >
                {on && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-xs font-mono text-[#ff8a5c] tracking-wide">L{l.number}</span>
                <span className="text-sm text-white">{l.name}</span>
              </span>
            </button>
          );
        })}
      </div>
      <ArtifactPreview
        text={artifact}
        label="Scope memo · paste into a RACI or review doc"
        filename="layer-scope.md"
      />
    </MicroTool>
  );
}
