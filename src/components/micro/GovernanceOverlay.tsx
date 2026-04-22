import { useMemo } from 'react';
import { MicroTool, TogglePill, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';

/**
 * Which frameworks is the org already using? The tool produces a
 * governance-overlay table mapping each framework to the OIA layers
 * it covers, and flags the gaps the OIA Model plugs.
 */

interface Framework {
  id: string;
  label: string;
  covers: string;
  oiaRole: string;
}

const FRAMEWORKS: Framework[] = [
  { id: 'osi',    label: 'ISO/IEC 7498 (OSI)',          covers: 'Networking',         oiaRole: 'consumed at L2' },
  { id: 'csf',    label: 'NIST CSF',                    covers: 'Cyber programme',    oiaRole: 'applies at every layer' },
  { id: 'atlas',  label: 'MITRE ATT&CK / ATLAS',        covers: 'Threat taxonomy',    oiaRole: 'informs concerns at each layer' },
  { id: 'airmf',  label: 'NIST AI RMF',                 covers: 'AI risk governance', oiaRole: 'intersects audit / provenance / sovereignty spans' },
  { id: 'owasp',  label: 'OWASP LLM Top 10',            covers: 'LLM risks',          oiaRole: 'manifests at specific OIA layers' },
  { id: '42001',  label: 'ISO/IEC 42001',               covers: 'AI management system', oiaRole: 'complements OIA at management level' },
  { id: 'euact',  label: 'EU AI Act',                   covers: 'Regulatory',         oiaRole: 'maps to sovereignty + auditability spans' },
  { id: 'mcp',    label: 'Model Context Protocol',      covers: 'L7 interop',         oiaRole: 'dominant interop protocol at L7' },
];

export function GovernanceOverlay() {
  const [selected, setSelected] = useLocalStorage<Record<string, boolean>>('oia:op:frameworks', {});

  function toggle(id: string) {
    const n = { ...selected };
    if (n[id]) delete n[id];
    else n[id] = true;
    setSelected(n);
  }

  const active = useMemo(() => FRAMEWORKS.filter((f) => selected[f.id]), [selected]);
  const missing = useMemo(() => FRAMEWORKS.filter((f) => !selected[f.id]), [selected]);

  const artifact = useMemo(() => {
    if (active.length === 0) return '';
    const lines: string[] = [];
    lines.push('# Governance overlay — frameworks in use + OIA Model fit');
    lines.push('');
    lines.push('## Frameworks currently in use');
    lines.push('| Framework | Covers | Role relative to OIA |');
    lines.push('|---|---|---|');
    for (const f of active) lines.push(`| ${f.label} | ${f.covers} | ${f.oiaRole} |`);
    lines.push('');
    lines.push('## Recommended additions');
    if (missing.length === 0) lines.push('- None — you cite every framework named in §2.1.');
    else {
      for (const f of missing) lines.push(`- **${f.label}** — ${f.covers}. ${f.oiaRole}.`);
    }
    lines.push('');
    lines.push('## Where OIA plugs the gap');
    lines.push('- None of the above organise the architecture of intelligent systems themselves — that is the OIA Model\'s specific contribution.');
    lines.push('- Use OIA as the architectural spine; keep the frameworks above for their functional coverage (cyber, AI risk, management, threats, regulatory).');
    lines.push('');
    lines.push('_Generated from OIA Model §2.1 Reference Architecture Lineage._');
    return lines.join('\n');
  }, [active, missing]);

  return (
    <MicroTool
      title="Map your current governance stack"
      subtitle="Select the frameworks your organisation already uses. The tool writes a governance-overlay document that names coverage, recommended additions, and the gap the OIA Model is meant to plug."
    >
      <div className="flex flex-wrap gap-2">
        {FRAMEWORKS.map((f) => (
          <TogglePill key={f.id} active={!!selected[f.id]} onClick={() => toggle(f.id)} strong>
            {f.label}
          </TogglePill>
        ))}
      </div>
      <div className="mt-3 text-[0.6875rem] font-mono text-white/45 tracking-wide">
        {active.length} of {FRAMEWORKS.length} selected · {missing.length} candidate addition(s)
      </div>
      <ArtifactPreview
        text={artifact}
        label="Governance overlay · paste into a policy document"
        filename="governance-overlay.md"
      />
    </MicroTool>
  );
}
