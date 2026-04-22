import { useMemo } from 'react';
import { MicroTool, TogglePill, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type Scale = 'system' | 'portfolio' | 'industry';
type Start = 'existing' | 'new' | 'vendor' | 'regulator';

const SCALE_LABEL: Record<Scale, string> = {
  system: 'Single intelligent system',
  portfolio: 'Enterprise portfolio',
  industry: 'Industry / jurisdiction',
};

const START_LABEL: Record<Start, string> = {
  existing: 'Existing deployment (diagnostic)',
  new: 'New deployment (design vocabulary)',
  vendor: 'Vendor positioning',
  regulator: 'Regulatory locator',
};

export function AdoptionPlaybook() {
  const [scale, setScale] = useLocalStorage<Scale | null>('oia:op:scale', null);
  const [start, setStart] = useLocalStorage<Start | null>('oia:op:starting-point', null);

  const artifact = useMemo(() => {
    if (!scale || !start) return '';
    const lines: string[] = [];
    lines.push(`# Adoption playbook — ${SCALE_LABEL[scale]}, ${START_LABEL[start]}`);
    lines.push('');
    lines.push('## Your first four steps');
    if (scale === 'system') {
      lines.push('1. Use the Architecture Assessment to rate your 10 layers — surface the state-holding pair (L3, L8) first.');
      lines.push('2. Build the Implementation Roadmap from your concerns and open questions.');
      lines.push('3. Generate the span gap memo — share with security / audit.');
      lines.push('4. File decision-log feedback on any of the 11 decisions that conflict with your choices.');
    } else if (scale === 'portfolio') {
      lines.push('1. Map every production intelligent system to the nine layers — diagnostic pass, portfolio-wide.');
      lines.push('2. Identify shared infrastructure (L0–L2) and shared cross-layer spans.');
      lines.push('3. Assign layer owners across teams; make the state-holding layers (L3, L8) explicit RACI entries.');
      lines.push('4. Publish a portfolio-level governance stack spec from §6.');
    } else {
      lines.push('1. Publish a jurisdiction-level mapping of regulatory requirements → OIA layers / spans.');
      lines.push('2. Fund open-question resolution work at the layers where consensus has not emerged.');
      lines.push('3. Sponsor neutral evaluation benchmarks — Layer 4, Layer 8 verification especially.');
      lines.push('4. Return community feedback on the 11 decisions + the four deferrals.');
    }
    lines.push('');
    lines.push(`## Starting-point notes (${START_LABEL[start]})`);
    if (start === 'existing') lines.push('- Treat the digest as a diagnostic instrument. Expect to find displaced or omitted concerns.');
    if (start === 'new') lines.push('- Treat the digest as a design vocabulary. Pick reference tech per layer from §4.');
    if (start === 'vendor') lines.push('- Treat the digest as a positioning instrument. Use the Provider Footprint matrix to see where you are vertical.');
    if (start === 'regulator') lines.push('- Treat the digest as a locator. Spans (§5) and Deferrals (§8) are the primary surface.');
    lines.push('');
    lines.push('_Generated from OIA Model §7 Adoption._');
    return lines.join('\n');
  }, [scale, start]);

  return (
    <MicroTool
      title="Generate an adoption playbook"
      subtitle="Pick your scale and starting point. The tool writes a four-step adoption playbook tuned to your situation — paste into a program kickoff or a steering-committee doc."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-24">
            Scale
          </span>
          {(Object.keys(SCALE_LABEL) as Scale[]).map((s) => (
            <TogglePill key={s} active={scale === s} onClick={() => setScale(s)} strong>
              {SCALE_LABEL[s]}
            </TogglePill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-24">
            Starting
          </span>
          {(Object.keys(START_LABEL) as Start[]).map((s) => (
            <TogglePill key={s} active={start === s} onClick={() => setStart(s)}>
              {START_LABEL[s]}
            </TogglePill>
          ))}
        </div>
      </div>
      <ArtifactPreview
        text={artifact}
        label="Playbook · paste into a program kickoff"
        filename="adoption-playbook.md"
      />
    </MicroTool>
  );
}
