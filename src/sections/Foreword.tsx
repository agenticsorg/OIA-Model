import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { foreword } from '../content/digest';
import { EraTimeline } from '../components/viz/EraTimeline';
import { EraTransitionBrief } from '../components/micro/EraTransitionBrief';

/**
 * Accent "Voice Exception" chip flags this as the one place the
 * institutional voice breaks (Decision 08).
 */
export function Foreword() {
  return (
    <TelemetryRegion id="foreword" className="">
      <div className="main-inset py-8">
        <CmdPanel
          eyebrow="Foreword · Personal Register"
          title="by Reuven Cohen"
          trailing={
            <Chip tone="strong" dot>
              Voice Exception
            </Chip>
          }
        >
          <div className="mb-6 flex flex-col gap-1 border-l-2 border-[#f05122]/60 pl-4">
            <span className="text-xs text-white/70 font-mono uppercase tracking-[0.18em]">
              {foreword.byline}
            </span>
            <span className="text-xs text-white/40 font-mono uppercase tracking-[0.18em]">
              {foreword.role}
            </span>
          </div>
          <Prose paragraphs={foreword.paragraphs.slice(0, 3)} className="max-w-3xl" />
          <EraTimeline />
          <div className="mt-6">
            <Prose paragraphs={foreword.paragraphs.slice(3)} className="max-w-3xl" />
          </div>
          <EraTransitionBrief />
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-1">
            {foreword.signOff.map((line) => (
              <span key={line} className="text-sm text-white/85">
                {line}
              </span>
            ))}
          </div>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
