import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { SweepLane } from '../components/SweepLane';
import { colophon } from '../content/digest';

export function Colophon() {
  return (
    <TelemetryRegion id="colophon" className="scroll-mt-24">
      <div className="main-inset pt-8 pb-16">
        <CmdPanel eyebrow="End of Transmission" title="Colophon">
          <SweepLane compact />
          <div className="mt-4 flex flex-col gap-2">
            {colophon.lines.map((line) => (
              <div
                key={line}
                className="text-[0.6875rem] font-mono text-white/45 tracking-[0.18em] uppercase"
              >
                {line}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 text-[0.625rem] font-mono text-white/30 tracking-[0.18em] uppercase">
            Rendered from docs/OIA-Model-v0.1-Digest.md and docs/OIA-Model-v0.1-Decision-Log-Digest.md ·
            ADR-0001 · plans/ADR-0001-oia-model-reader-ui.md
          </div>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
