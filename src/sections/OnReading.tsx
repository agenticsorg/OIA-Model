import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { onReading } from '../content/digest';

export function OnReading() {
  return (
    <TelemetryRegion id="on-reading" className="">
      <div className="main-inset py-8">
        <CmdPanel
          eyebrow="Preface"
          title={onReading.heading}
          trailing={<Chip tone="mono">40 min read</Chip>}
        >
          <Prose paragraphs={onReading.paragraphs} className="max-w-3xl" />
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
