import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { introduction } from '../content/digest';

export function Introduction() {
  return (
    <TelemetryRegion id="introduction" className="scroll-mt-24">
      <div className="main-inset py-8">
        <CmdPanel
          eyebrow="Section 1"
          title={introduction.heading}
          trailing={<Chip tone="accent">Technology-Agnostic</Chip>}
        >
          <Prose paragraphs={introduction.paragraphs} className="max-w-3xl" />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Persistent', body: 'State and learned behaviour across interactions.' },
              { label: 'Autonomous', body: 'Goals and judgment that may exceed instruction.' },
              { label: 'Consequential', body: 'Correctness, accountability, auditability demonstrable.' },
            ].map((p) => (
              <div
                key={p.label}
                className="p-3 rounded border border-white/10 bg-white/[0.02] flex flex-col gap-1"
              >
                <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
                  Property
                </span>
                <span className="text-sm text-white">{p.label}</span>
                <span className="text-xs text-white/50 leading-relaxed">{p.body}</span>
              </div>
            ))}
          </div>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
