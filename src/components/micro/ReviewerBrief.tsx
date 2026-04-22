import { useMemo } from 'react';
import { MicroTool, TogglePill, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type Stance = 'implementer' | 'reviewer' | 'researcher' | 'skeptic';

const STANCE_LABEL: Record<Stance, string> = {
  implementer: 'Implementer',
  reviewer: 'Official reviewer',
  researcher: 'Researcher',
  skeptic: 'Skeptic',
};

const STANCE_ADVICE: Record<Stance, string[]> = {
  implementer: [
    'Focus on decisions that constrain design: 04 (nine layers), 05 (state-holding bracket), 06 (cross-layer spans as their own section), 10 (correctly opinionated stance on MCP / WebAssembly / vertical extension).',
    'For each, decide: does it reshape my roadmap? If yes, file a vote + note.',
    'Pair the review with the Implementation Roadmap tool to make the impact concrete.',
  ],
  reviewer: [
    'Work through every decision by number. Use the voting tool to mark Reopen / Hold / Confirm.',
    'Pay special attention to 02 (Continuity Fabric naming — revisit trigger is explicit), 08 (institutional voice), 09 (branding discipline).',
    'Export your full review and submit it through your organisation\'s channels.',
  ],
  researcher: [
    'Prioritise the open questions: the model acknowledges unresolved areas at every layer.',
    'Decisions 06 and 07 (cross-layer structure, open questions per layer) define how the model invites research.',
    'Decisions 10 explicitly names where the domain has converged vs not.',
  ],
  skeptic: [
    'Go straight to 04 (nine layers vs seven vs twelve) and 05 (state-holding bracket) — if the decomposition is wrong, the model is wrong.',
    'Check 01 (the name itself) and 02 (Layer 8 naming) — both have explicit revisit triggers.',
    'File specific, numbered feedback. "Reopen decision N, because …" is the requested form.',
  ],
};

export function ReviewerBrief() {
  const [stance, setStance] = useLocalStorage<Stance | null>('oia:op:stance', null);

  const artifact = useMemo(() => {
    if (!stance) return '';
    const lines: string[] = [];
    lines.push(`# Reviewer brief — ${STANCE_LABEL[stance]}`);
    lines.push('');
    lines.push(`Review protocol tailored to reviewers reading the OIA Model as ${STANCE_LABEL[stance].toLowerCase()}s.`);
    lines.push('');
    lines.push('## How to spend your review time');
    for (const line of STANCE_ADVICE[stance]) lines.push(`- ${line}`);
    lines.push('');
    lines.push('## Output format the Foundation requests');
    lines.push('- `reopen decision NN, because …` — one per decision you want reopened.');
    lines.push('- A short paragraph per decision where you want the draft held or confirmed.');
    lines.push('');
    lines.push('_Generated from OIA Model Decision Log Digest · On Using This Log._');
    return lines.join('\n');
  }, [stance]);

  return (
    <MicroTool
      title="Get a reviewer brief for your stance"
      subtitle="Different reviewer stances should spend time differently. Pick yours — the tool writes a brief for how to approach the 11 decisions."
    >
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STANCE_LABEL) as Stance[]).map((s) => (
          <TogglePill key={s} active={stance === s} onClick={() => setStance(stance === s ? null : s)} strong>
            {STANCE_LABEL[s]}
          </TogglePill>
        ))}
      </div>
      <ArtifactPreview
        text={artifact}
        label="Reviewer brief · paste into your review notebook"
        filename="reviewer-brief.md"
      />
    </MicroTool>
  );
}
