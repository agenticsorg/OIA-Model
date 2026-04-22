import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { Prose } from '../components/Prose';
import { LayerMiniWidget } from '../components/LayerMiniWidget';
import { layers } from '../content/layers';
import type { Layer } from '../content/types';

function LayerPanel({ layer }: { layer: Layer }) {
  const isStateHolding = layer.number === 3 || layer.number === 8;
  return (
    <CmdPanel
      id={layer.id}
      className="scroll-mt-24"
      eyebrow={`Layer ${layer.number}`}
      title={layer.name}
      trailing={
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {layer.statusChips.map((c) => (
            <Chip key={c.label} tone={c.tone}>
              {c.label}
            </Chip>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
        <div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-[#f05122]" aria-hidden="true" />
              <div className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
                Purpose
              </div>
            </div>
            <Prose paragraphs={[layer.purpose]} className="max-w-3xl" />
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-[#f05122]" aria-hidden="true" />
              <div className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
                Key Concerns — {layer.concerns.length}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {layer.concerns.map((c) => (
                <Chip key={c} tone="mono">
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-[#f05122]" aria-hidden="true" />
              <div className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
                Reference Technologies
              </div>
            </div>
            <Prose paragraphs={[layer.referenceTechnologies]} className="max-w-3xl" />
            {layer.extraNote && (
              <div className="mt-3 px-3 py-2 rounded border border-[#f05122]/40 bg-[#f05122]/10 text-sm text-[#ffb08c] leading-relaxed">
                <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase block mb-1">
                  Maturity Note
                </span>
                {layer.extraNote}
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-[#f05122]" aria-hidden="true" />
              <div className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
                Open Questions — {layer.openQuestions.length}
              </div>
            </div>
            <ul className="space-y-1.5 max-w-3xl">
              {layer.openQuestions.map((q) => (
                <li key={q} className="flex items-start gap-3 text-sm text-white/75 leading-relaxed">
                  <span className="text-[#ff8a5c] font-mono text-[0.625rem] pt-1 flex-shrink-0 tracking-[0.18em]">
                    OQ
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="hidden lg:block">
          <LayerMiniWidget layer={layer.number} isStateHolding={isStateHolding} />
          <div className="mt-4 text-[0.625rem] font-mono text-white/35 tracking-[0.18em] uppercase text-right">
            Depends on L0–L{Math.max(layer.number - 1, 0)}
          </div>
        </aside>
      </div>
    </CmdPanel>
  );
}

export function LayerDefinitions() {
  return (
    <TelemetryRegion id="layer-definitions" className="scroll-mt-24">
      <div className="main-inset py-8">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono text-white/40 tracking-[0.18em] uppercase">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent"
                aria-hidden="true"
              />
              Section 4
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-normal text-white display-font">
              §4  Layer Definitions
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-2xl leading-relaxed">
              Each layer is presented below in compressed form: purpose, scope, key concerns as short
              phrases, reference technologies in a single paragraph, and open questions named briefly.
              The full treatment of each layer, with expanded scope and reference implementations, is
              available in the full draft.
            </p>
          </div>
          <Chip tone="accent">10 panels · L0 → L9</Chip>
        </header>
        <div className="flex flex-col gap-6">
          {layers.map((l) => (
            <LayerPanel key={l.id} layer={l} />
          ))}
        </div>
      </div>
    </TelemetryRegion>
  );
}
