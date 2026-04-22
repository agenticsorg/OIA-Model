import { useMemo } from 'react';
import { MicroTool, TogglePill, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type Properties = { persistent: boolean; autonomous: boolean; consequential: boolean };

export function SystemScopeGenerator() {
  const [props, setProps] = useLocalStorage<Properties>('oia:op:scope-props', {
    persistent: false,
    autonomous: false,
    consequential: false,
  });
  const [systemName, setSystemName] = useLocalStorage<string>('oia:op:scope-name', '');
  const [context, setContext] = useLocalStorage<string>('oia:op:scope-context', '');

  const toggle = (k: keyof Properties) => setProps({ ...props, [k]: !props[k] });

  const artifact = useMemo(() => {
    if (!props.persistent && !props.autonomous && !props.consequential) return '';
    const name = systemName.trim() || 'the system';
    const ctx = context.trim();
    const applies: string[] = [];
    if (props.persistent) applies.push('persistent');
    if (props.autonomous) applies.push('autonomous');
    if (props.consequential) applies.push('consequential');

    const lines: string[] = [];
    lines.push(`# Project scope — ${name}`);
    lines.push('');
    if (ctx) {
      lines.push(`**Context.** ${ctx}`);
      lines.push('');
    }
    lines.push(
      `**Classification (per OIA Model §1).** ${capitalise(name)} is a ${applies.join(' · ')} intelligent system and therefore requires architectural treatment of the following:`,
    );
    lines.push('');
    if (props.persistent) {
      lines.push('- **Persistence** — cognitive state carried across sessions. Primarily Layer 8 (Continuity Fabric), secondarily Layer 3 (Agent Data Substrate).');
    }
    if (props.autonomous) {
      lines.push('- **Autonomy** — the system acts with goals that may exceed explicit instruction. Primarily Layer 7 (Orchestration and Workflow); distributed across Layers 5–9.');
    }
    if (props.consequential) {
      lines.push('- **Consequence** — outputs whose correctness, accountability, and auditability must be demonstrable. Addressed through the cross-layer spans (Security, Sovereignty, Auditability, Identity, Energy, Provenance).');
    }
    lines.push('');
    lines.push('## In-scope concerns');
    const layersInScope = new Set<number>();
    if (props.persistent) { layersInScope.add(8); layersInScope.add(3); }
    if (props.autonomous) { layersInScope.add(7); [5,6,7,8,9].forEach(n => layersInScope.add(n)); }
    if (props.consequential) { [3,4,5,6,7,8,9].forEach(n => layersInScope.add(n)); }
    lines.push(`- Layers in initial scope: ${[...layersInScope].sort((a,b)=>a-b).map(n => `L${n}`).join(' · ')}`);
    lines.push('- Cross-layer spans coherent: required from L3 upward');
    lines.push('');
    lines.push('_Generated from OIA Model §1 Introduction._');
    return lines.join('\n');
  }, [props, systemName, context]);

  return (
    <MicroTool
      title="Generate a project-scope statement"
      subtitle="Decide which of the three defining properties apply to your system; the tool writes the classification paragraph that belongs in your project charter."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-28">
            Applies?
          </span>
          <TogglePill active={props.persistent} onClick={() => toggle('persistent')} strong title="Maintains memory / learned behaviour across sessions">
            Persistent
          </TogglePill>
          <TogglePill active={props.autonomous} onClick={() => toggle('autonomous')} strong title="Acts with goals that may exceed instruction">
            Autonomous
          </TogglePill>
          <TogglePill active={props.consequential} onClick={() => toggle('consequential')} strong title="Outputs require correctness, accountability, auditability">
            Consequential
          </TogglePill>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-28">
            System name
          </span>
          <input
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder="e.g. Project Atlas"
            className="flex-1 max-w-sm bg-black border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-[#f05122]/60"
          />
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-28 pt-1">
            Context
          </span>
          <input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="one sentence on what the system does"
            className="flex-1 bg-black border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-[#f05122]/60"
          />
        </div>
      </div>
      <ArtifactPreview
        text={artifact}
        label="Scope statement · paste into your project charter"
        filename="system-scope.md"
      />
    </MicroTool>
  );
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
