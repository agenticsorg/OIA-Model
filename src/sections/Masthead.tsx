import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';
import { RadarRing } from '../components/RadarRing';
import { masthead } from '../content/digest';

export function Masthead() {
  return (
    <TelemetryRegion id="masthead" className="scroll-mt-24">
      <div className="main-inset pt-12 pb-8">
        <CmdPanel
          eyebrow={masthead.publisher}
          trailing={
            <Chip tone="accent" dot pulseDot>
              Active · v0.1
            </Chip>
          }
          bodyClassName="p-0"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 md:gap-10 px-6 sm:px-10 py-10 md:py-14 relative overflow-hidden">
            <div
              className="absolute inset-0 grid-lines opacity-60 pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <img
                  src="/logo.png"
                  alt="Agentics Foundation"
                  className="h-10 w-auto select-none"
                  draggable={false}
                />
                <span className="inline-flex items-center gap-1.5 text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.22em] uppercase">
                  <span className="w-2 h-2 bg-[#f05122]" aria-hidden="true" />
                  Reference Architecture · 2026
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white leading-[1.02] display-font">
                {masthead.title}
              </h1>
              <p className="mt-3 text-2xl sm:text-3xl font-normal text-white/85">
                {masthead.subtitle}
              </p>
              <p className="mt-2 text-sm sm:text-base text-white/55 max-w-xl">
                {masthead.tagline}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Chip tone="accent">{masthead.version}</Chip>
                <Chip tone="mono">{masthead.year}</Chip>
                <Chip tone="mono">9 Layers · 6 Spans · 11 Decisions</Chip>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <a
                  href="#assessment"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#f05122] hover:bg-[#ff7a4a] text-white text-sm font-normal rounded transition-colors shadow-[0_0_20px_rgba(240,81,34,0.4)]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Assess your architecture
                </a>
                <a
                  href="#decision-log"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white/85 text-sm font-normal rounded transition-colors"
                >
                  Review the decisions →
                </a>
                <a
                  href="#explorer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-white/55 hover:text-white text-sm font-normal rounded transition-colors"
                >
                  Explore reference tech ↗
                </a>
              </div>
            </div>
            <div className="flex-shrink-0 justify-self-center md:justify-self-end relative z-10">
              <RadarRing size={200} />
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/60 px-6 sm:px-10 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-[0.625rem] font-mono text-white/40 tracking-[0.22em] uppercase">
            <span>{masthead.version}</span>
            <span className="text-white/15">·</span>
            <span>{masthead.year}</span>
            <span className="text-white/15">·</span>
            <span>{masthead.publisher}</span>
          </div>
        </CmdPanel>
      </div>
    </TelemetryRegion>
  );
}
