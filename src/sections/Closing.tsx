import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { closing } from '../content/digest';

export function Closing() {
  return (
    <TelemetryRegion id="closing" className="scroll-mt-24">
      <div className="main-inset py-8">
        <CmdPanel
          eyebrow="Closing"
          title={closing.heading}
          trailing={<Chip tone="accent">Digest Close</Chip>}
        >
          <Prose paragraphs={closing.paragraphs} className="max-w-3xl" />
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
