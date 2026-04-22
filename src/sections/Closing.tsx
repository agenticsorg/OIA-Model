import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { closing } from '../content/digest';
import { ArtefactTriad } from '../components/viz/ArtefactTriad';

export function Closing() {
  return (
    <TelemetryRegion id="closing" className="">
      <div className="main-inset py-8">
        <CmdPanel
          eyebrow="Closing"
          title={closing.heading}
          trailing={<Chip tone="accent">Digest Close</Chip>}
        >
          <Prose paragraphs={closing.paragraphs.slice(0, 2)} className="max-w-3xl" />
          <ArtefactTriad />
          <div className="mt-6">
            <Prose paragraphs={closing.paragraphs.slice(2)} className="max-w-3xl" />
          </div>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
