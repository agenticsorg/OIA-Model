import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { deferrals } from '../content/digest';

export function Deferrals() {
  return (
    <TelemetryRegion id="deferrals" className="scroll-mt-24">
      <div className="main-inset py-8">
        <CmdPanel
          eyebrow="Section 8"
          title={deferrals.heading}
          trailing={<Chip tone="strong">4 Deferrals</Chip>}
        >
          <Prose paragraphs={[deferrals.intro]} className="max-w-3xl" />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {deferrals.list.map((d, i) => (
              <article
                key={d.id}
                id={d.id}
                className="bg-black rounded-xl border border-[#f05122]/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-5 flex flex-col gap-3 scroll-mt-24 relative overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f05122] to-transparent"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
                    Deferral 0{i + 1}
                  </span>
                  <Chip tone="strong">Deferred</Chip>
                </div>
                <h4 className="text-base text-white font-normal">{d.title}</h4>
                <p className="text-[0.8125rem] text-white/60 leading-relaxed">{d.body}</p>
              </article>
            ))}
          </div>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
