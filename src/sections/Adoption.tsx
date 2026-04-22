import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { adoption } from '../content/digest';

export function Adoption() {
  return (
    <TelemetryRegion id="adoption" className="scroll-mt-24">
      <div className="main-inset py-8">
        <CmdPanel
          eyebrow="Section 7"
          title={adoption.heading}
          trailing={<Chip tone="accent">Three Scales</Chip>}
        >
          <Prose paragraphs={adoption.paragraphs.slice(0, 1)} className="max-w-3xl" />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {adoption.scales.map((s, i) => (
              <div
                key={s.name}
                className="bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-4 flex flex-col gap-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
                    Scale 0{i + 1}
                  </span>
                  <Chip tone="mono">Adoption</Chip>
                </div>
                <h4 className="text-sm text-white font-normal">{s.name}</h4>
                <p className="text-[0.8125rem] text-white/60 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Prose paragraphs={adoption.paragraphs.slice(1)} className="max-w-3xl" />
          </div>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
