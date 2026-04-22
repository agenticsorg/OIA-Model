import { useMemo } from 'react';
import { MicroTool, TogglePill, ArtifactPreview } from './MicroTool';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { deferrals } from '../../content/digest';

type Priority = 'high' | 'med' | 'low' | 'skip';
type Notes = Partial<Record<string, string>>;

const PRI_LABEL: Record<Priority, string> = {
  high: 'Critical',
  med: 'Important',
  low: 'Nice-to-have',
  skip: 'Defer further',
};

export function CommunityInput() {
  const [priorities, setPriorities] = useLocalStorage<Partial<Record<string, Priority>>>(
    'oia:op:deferral-priority',
    {},
  );
  const [notes, setNotes] = useLocalStorage<Notes>('oia:op:deferral-notes', {});
  const [submitter, setSubmitter] = useLocalStorage<string>('oia:op:deferral-submitter', '');

  function setPriority(id: string, p: Priority | null) {
    const n = { ...priorities };
    if (p === null) delete n[id];
    else n[id] = p;
    setPriorities(n);
  }

  function setNote(id: string, text: string) {
    const n = { ...notes };
    if (!text.trim()) delete n[id];
    else n[id] = text;
    setNotes(n);
  }

  const artifact = useMemo(() => {
    const rated = deferrals.list.filter((d) => priorities[d.id]);
    if (rated.length === 0) return '';
    const from = submitter.trim() || 'Anonymous reviewer';
    const lines: string[] = [];
    lines.push(`# Community input — OIA Model §8 deferrals`);
    lines.push('');
    lines.push(`**Submitted by:** ${from}`);
    lines.push('');
    lines.push('## Our priorities for the deferred work');
    const order: Priority[] = ['high', 'med', 'low', 'skip'];
    for (const p of order) {
      const members = deferrals.list.filter((d) => priorities[d.id] === p);
      if (members.length === 0) continue;
      lines.push(`### ${PRI_LABEL[p]}`);
      for (const d of members) {
        lines.push(`- **${d.title.replace(/\.$/, '')}**`);
        const note = notes[d.id]?.trim();
        if (note) lines.push(`  - Our note: ${note}`);
      }
      lines.push('');
    }
    lines.push('_Prepared for the Agentics Foundation community review process._');
    return lines.join('\n');
  }, [priorities, notes, submitter]);

  return (
    <MicroTool
      title="Compose community input for the Foundation"
      subtitle="Rate each deferred item and add a note explaining what matters to your organisation. The tool formats a submission ready to send back to the Agentics Foundation."
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[0.625rem] font-mono text-white/45 tracking-[0.18em] uppercase w-24">
          From
        </span>
        <input
          value={submitter}
          onChange={(e) => setSubmitter(e.target.value)}
          placeholder="Your name / organisation"
          className="flex-1 max-w-sm bg-black border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-[#f05122]/60"
        />
      </div>
      <div className="flex flex-col gap-3">
        {deferrals.list.map((d) => (
          <div key={d.id} className="p-3 rounded border border-white/10 bg-white/[0.02]">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white">{d.title}</div>
                <div className="text-[0.75rem] text-white/55 leading-relaxed mt-1">{d.body}</div>
              </div>
              <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                {(Object.keys(PRI_LABEL) as Priority[]).map((p) => (
                  <TogglePill
                    key={p}
                    active={priorities[d.id] === p}
                    onClick={() => setPriority(d.id, priorities[d.id] === p ? null : p)}
                    strong={p === 'high'}
                  >
                    {PRI_LABEL[p]}
                  </TogglePill>
                ))}
              </div>
            </div>
            <input
              value={notes[d.id] ?? ''}
              onChange={(e) => setNote(d.id, e.target.value)}
              placeholder="Your note (optional — what makes this matter to you?)"
              className="mt-3 w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-[#f05122]/60"
            />
          </div>
        ))}
      </div>
      <ArtifactPreview
        text={artifact}
        label="Community input · send to the Agentics Foundation"
        filename="community-input.md"
      />
    </MicroTool>
  );
}
