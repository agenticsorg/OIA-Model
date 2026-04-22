import { useMemo } from 'react';
import { MicroTool, TogglePill, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type Era = 'mainframe' | 'clientserver' | 'cloud' | 'services' | 'intelligent';

const ERAS: { id: Era; label: string; year: string }[] = [
  { id: 'mainframe', label: 'Mainframe', year: '1960s' },
  { id: 'clientserver', label: 'Client–Server', year: '1990s' },
  { id: 'cloud', label: 'Cloud', year: '2000s' },
  { id: 'services', label: 'Services', year: '2010s' },
  { id: 'intelligent', label: 'Intelligent Systems', year: '2020s →' },
];

export function EraTransitionBrief() {
  const [from, setFrom] = useLocalStorage<Era | null>('oia:op:era-from', null);
  const [to, setTo] = useLocalStorage<Era | null>('oia:op:era-to', null);
  const [org, setOrg] = useLocalStorage<string>('oia:op:era-org', '');

  const artifact = useMemo(() => {
    if (!from || !to) return '';
    const fromLabel = ERAS.find((e) => e.id === from)!.label;
    const toLabel = ERAS.find((e) => e.id === to)!.label;
    const orgName = org.trim() || 'Our organization';
    const lines: string[] = [];
    lines.push(`# ${orgName} — computing-era transition brief`);
    lines.push('');
    lines.push(`**Moving from:** ${fromLabel} era`);
    lines.push(`**Moving toward:** ${toLabel} era`);
    lines.push('');
    lines.push('## Implication');
    if (to === 'intelligent') {
      lines.push(
        '- Intelligent systems introduce persistent memory, autonomous action, and consequential output — concerns that our prior reference architectures do not organise.',
      );
      lines.push(
        '- The Agentics Foundation\'s OIA Model (v0.1, 2026) supplies a shared nine-layer vocabulary for the new shape.',
      );
      lines.push(
        '- Action: map our current deployment to the OIA Model, identify coverage gaps, and record a formal review of the eleven open decisions.',
      );
    } else {
      lines.push('- Review whether our current architecture still describes the problem shape.');
      lines.push(
        '- If intelligent systems are part of the near-term roadmap, the OIA Model (v0.1) supplies the target vocabulary.',
      );
    }
    lines.push('');
    lines.push('## Next steps');
    lines.push('1. Run the Architecture Assessment (see OIA tool) to identify layers with known gaps.');
    lines.push('2. Build a per-layer Implementation Roadmap.');
    lines.push('3. Flag the two state-holding layers (L3 Agent Data Substrate, L8 Continuity Fabric) for sovereignty review.');
    return lines.join('\n');
  }, [from, to, org]);

  return (
    <MicroTool
      title="Draft an era-transition brief for your leadership"
      subtitle="The Foreword frames this as a rare structural-shift moment. Use the tool to produce a short brief your exec team can read in two minutes."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-24">
            From
          </span>
          {ERAS.map((e) => (
            <TogglePill key={e.id} active={from === e.id} onClick={() => setFrom(e.id)}>
              {e.label}
            </TogglePill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-24">
            Toward
          </span>
          {ERAS.map((e) => (
            <TogglePill key={e.id} active={to === e.id} onClick={() => setTo(e.id)} strong>
              {e.label}
            </TogglePill>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-24">
            Org name
          </span>
          <input
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="(optional)"
            className="flex-1 max-w-xs bg-black border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-[#f05122]/60"
          />
        </div>
      </div>
      <ArtifactPreview
        text={artifact}
        label="Exec brief · paste into a Notion page or email"
        filename="era-transition-brief.md"
      />
    </MicroTool>
  );
}
