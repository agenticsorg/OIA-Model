import { useMemo } from 'react';
import { MicroTool, TogglePill, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const PIECES = [
  { id: 'osi',   label: 'OSI',              use: 'networking' },
  { id: '42001', label: 'ISO/IEC 42001',    use: 'management system' },
  { id: 'csf',   label: 'NIST CSF',         use: 'cybersecurity programme structure' },
  { id: 'airmf', label: 'NIST AI RMF',      use: 'AI risk governance' },
  { id: 'atlas', label: 'MITRE ATLAS',      use: 'threat awareness' },
  { id: 'owasp', label: 'OWASP LLM Top 10', use: 'LLM risk awareness' },
  { id: 'oia',   label: 'OIA Model',        use: 'architecture of the intelligent system' },
];

export function StackSpec() {
  const [picked, setPicked] = useLocalStorage<Record<string, boolean>>('oia:op:composition', {
    oia: true,
  });

  function toggle(id: string) {
    const n = { ...picked };
    if (n[id]) delete n[id];
    else n[id] = true;
    setPicked(n);
  }

  const active = PIECES.filter((p) => picked[p.id]);

  const artifact = useMemo(() => {
    if (active.length === 0) return '';
    const lines: string[] = [];
    lines.push('# Governance stack specification');
    lines.push('');
    lines.push('This spec composes the frameworks our organisation runs on, following OIA Model §6.');
    lines.push('');
    lines.push('## Composition');
    for (const p of active) lines.push(`- **${p.label}** · ${p.use}`);
    lines.push('');
    lines.push('## Architectural spine');
    if (picked.oia) {
      lines.push('- The OIA Model supplies the architectural spine (9 layers + 6 cross-layer spans). All other frameworks listed are functional overlays.');
    } else {
      lines.push('- ⚠ No architectural spine selected. Add the OIA Model to gain a shared structural vocabulary for intelligent systems.');
    }
    lines.push('');
    lines.push('## Gaps');
    const missing = PIECES.filter((p) => !picked[p.id]);
    if (missing.length === 0) lines.push('- None — stack fully composed per §6.');
    else for (const p of missing) lines.push(`- Missing: **${p.label}** for ${p.use}.`);
    lines.push('');
    lines.push('_Generated from OIA Model §6 Relationship to Other Reference Models._');
    return lines.join('\n');
  }, [active, picked]);

  return (
    <MicroTool
      title="Compose your governance stack specification"
      subtitle="Pick the frameworks your organisation commits to. The tool writes a stack spec paragraph naming the composition and flagging gaps — useful for architecture review boards or RFP responses."
    >
      <div className="flex flex-wrap gap-2">
        {PIECES.map((p) => (
          <TogglePill key={p.id} active={!!picked[p.id]} onClick={() => toggle(p.id)} strong={p.id === 'oia'}>
            {p.label}
          </TogglePill>
        ))}
      </div>
      <ArtifactPreview
        text={artifact}
        label="Stack spec · paste into an ARB or RFP"
        filename="governance-stack.md"
      />
    </MicroTool>
  );
}
