import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import {
  relationships,
  relationshipsIntro,
  relationshipsComposition,
  practicalCompositionChips,
} from '../content/relationships';

export function RelationshipToOthers() {
  return (
    <TelemetryRegion id="relationship-to-others" className="scroll-mt-24">
      <div className="main-inset py-8 flex flex-col gap-6">
        <CmdPanel
          eyebrow="Section 6"
          title="§6  Relationship to Other Reference Models"
          trailing={<Chip tone="mono">6 frameworks</Chip>}
        >
          <Prose paragraphs={[relationshipsIntro]} className="max-w-3xl" />
        </CmdPanel>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relationships.map((r) => (
            <CmdPanel
              key={r.id}
              id={r.id}
              className="scroll-mt-24"
              eyebrow={r.shortName}
              title={r.name}
              trailing={<Chip tone="accent">Framework</Chip>}
            >
              <Prose paragraphs={[r.body]} />
            </CmdPanel>
          ))}
        </div>

        <CmdPanel
          eyebrow="Practical Composition"
          title="How the frameworks compose"
          trailing={<Chip tone="accent">Additive</Chip>}
        >
          <Prose paragraphs={[relationshipsComposition]} className="max-w-3xl" />
          <div className="mt-5 flex flex-wrap gap-2">
            {practicalCompositionChips.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-2 px-2 py-1 rounded border border-white/10 bg-white/[0.02] text-xs"
              >
                <span className="font-mono text-white tracking-wide">{c.name}</span>
                <span className="text-white/30">for</span>
                <span className="text-white/60">{c.use}</span>
              </span>
            ))}
          </div>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
