import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';

/**
 * Structural break between the prose digest (Foreword → Closing) and
 * the interactive tools that follow. Makes the shift from "reading the
 * reference architecture" to "applying it" explicit, and names the
 * tools as proposed implementations — not part of the model itself.
 */
export function ToolsIntro() {
  return (
    <TelemetryRegion id="tools-intro" className="">
      <div className="main-inset py-10">
        <CmdPanel
          eyebrow="Section II · Apply the model"
          title="Proposed implementations"
          trailing={
            <div className="flex items-center gap-2">
              <Chip tone="accent" dot pulseDot>Interactive</Chip>
              <Chip tone="mono">Not part of the model</Chip>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
            <div className="max-w-3xl flex flex-col gap-3">
              <p className="text-base sm:text-lg text-white/85 leading-relaxed">
                Everything from here down is a <span className="text-white">proposed way
                to put the reference architecture into practice</span> — not a claim about
                the architecture itself. The model is what you just read. These panels are
                instruments built on top of it.
              </p>
              <p className="text-sm text-white/65 leading-relaxed">
                Use them to test the architecture against your own context: map what you
                ship today, name the gaps, vote on the decisions that drove the draft, and
                walk out with a single review package you can hand to a team.
              </p>
            </div>

            <aside className="lg:w-[260px] flex-shrink-0 p-4 rounded-xl border border-[#f05122]/30 bg-[#f05122]/[0.04] shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
              <div className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase mb-2">
                Caveat
              </div>
              <p className="text-sm text-white/85 leading-relaxed">
                Disagreement with a tool is not disagreement with the model. Push back on
                the <a href="#decision-log" className="text-[#ff8a5c] hover:text-white">Decision Log</a> by number
                for that.
              </p>
            </aside>
          </div>

          <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <ToolLink href="#workspace" label="Workspace" body="Aggregates everything you do across the tools into a single exportable review package." />
            <ToolLink href="#stack-diagram" label="Stack Diagram" body="The nine layers as a navigable visual — the diagram the model is missing." />
            <ToolLink href="#assessment" label="Assessment" body="Rate your coverage layer-by-layer; surface where concerns are displaced or absent." />
            <ToolLink href="#provider-footprint" label="Provider Footprint" body="See where named vendors sit in the stack — and where they extend beyond it." />
            <ToolLink href="#implementation" label="Implementation Roadmap" body="Turn the model into a sequence of concrete tasks you can stage." />
            <ToolLink href="#explorer" label="Layer Explorer" body="Drill into any single layer's purpose, concerns, and open questions." />
            <ToolLink href="#decision-log" label="Decision Log" body="Eleven addressable decisions made during drafting — push back by number." />
            <ToolLink href="#feedback" label="Feedback" body="Send specific pushback to the editors while the v0.1 review window is open." />
          </ul>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}

function ToolLink({ href, label, body }: { href: string; label: string; body: string }) {
  return (
    <li>
      <a
        href={href}
        className="block p-3 rounded border border-white/10 bg-white/[0.02] hover:border-[#f05122]/50 hover:bg-[#f05122]/[0.04] transition-colors h-full"
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm text-white">{label}</span>
          <span className="text-[#ff8a5c] text-xs font-mono">→</span>
        </div>
        <span className="text-xs text-white/55 leading-relaxed">{body}</span>
      </a>
    </li>
  );
}
