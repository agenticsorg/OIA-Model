import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { usingThisLog } from '../content/decision-log';

export function UsingThisLog() {
  return (
    <TelemetryRegion id="using-this-log" className="scroll-mt-24">
      <div className="main-inset py-8">
        <CmdPanel
          eyebrow="Decision Log Close"
          title={usingThisLog.heading}
          trailing={<Chip tone="accent">Review Protocol</Chip>}
        >
          <Prose paragraphs={usingThisLog.paragraphs} className="max-w-3xl" />
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
