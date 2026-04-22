import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { nineLayersOverview } from '../content/digest';
import { LayerScopeMemo } from '../components/micro/LayerScopeMemo';

export function NineLayersOverview() {
  return (
    <TelemetryRegion id="nine-layers-overview" className="">
      <div className="main-inset py-8">
        <CmdPanel
          eyebrow="Section 3"
          title={nineLayersOverview.heading}
          trailing={<Chip tone="mono">10 positions · L0 → L9</Chip>}
        >
          <Prose paragraphs={nineLayersOverview.intro} className="max-w-3xl" />

          <div className="mt-6 bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_2fr] gap-4 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <span className="text-[0.625rem] text-white/40 font-mono tracking-[0.18em] uppercase w-14">
                Layer
              </span>
              <span className="text-[0.625rem] text-white/40 font-mono tracking-[0.18em] uppercase">
                Name
              </span>
              <span className="text-[0.625rem] text-white/40 font-mono tracking-[0.18em] uppercase">
                Primary Purpose
              </span>
            </div>
            {nineLayersOverview.tableRows.map((row) => {
              const isStateHolding = row.layer === 3 || row.layer === 8;
              return (
                <a
                  key={row.layer}
                  href={`#layer-${row.layer}`}
                  className={`grid grid-cols-[auto_1fr_2fr] gap-4 px-4 py-3 items-start border-b border-white/5 last:border-b-0 transition-colors group ${
                    isStateHolding ? 'bg-[#f05122]/[0.04] hover:bg-[#f05122]/[0.08]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`w-14 text-sm font-mono flex items-center gap-2 ${
                      isStateHolding ? 'text-[#ff8a5c]' : 'text-white/65'
                    }`}
                  >
                    {isStateHolding && (
                      <span
                        className="w-1 h-1 rounded-full bg-[#f05122] shadow-[0_0_6px_#f05122]"
                        aria-hidden="true"
                      />
                    )}
                    L{row.layer}
                  </span>
                  <span
                    className={`text-sm ${
                      isStateHolding ? 'text-white' : 'text-white/85'
                    } group-hover:text-white transition-colors`}
                  >
                    {row.name}
                  </span>
                  <span className="text-sm text-white/55 leading-relaxed">{row.purpose}</span>
                </a>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[0.6875rem] font-mono text-white/50 tracking-[0.14em] uppercase">
            <Chip tone="accent" dot>
              State-Holding
            </Chip>
            <span className="text-white/55">
              L3 substrate · L8 fabric — bracketing the operational layers 4 through 7
            </span>
          </div>

          <div className="mt-6">
            <Prose paragraphs={nineLayersOverview.relational} className="max-w-3xl" />
          </div>
          <LayerScopeMemo />
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
