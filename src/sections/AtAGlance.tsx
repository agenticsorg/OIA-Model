import { useEffect, useState } from 'react';
import { TelemetryRegion } from '../components/TelemetryRegion';
import { CmdPanel } from '../components/CmdPanel';
import { Chip } from '../components/Chip';

const PANELS = [
  {
    src: '/images/header-1.jpeg',
    alt: 'OIA in one picture — nine stacked layers, six cross-layer spans, one coherent architecture.',
    eyebrow: 'Panel 01 · The shape',
    caption: 'The 9 layers · 6 cross-layer spans · 1 coherent architecture.',
  },
  {
    src: '/images/header-2.jpeg',
    alt: 'How OIA solves the problem — from fragmented systems to coherent intelligence.',
    eyebrow: 'Panel 02 · The problem it answers',
    caption: 'From fragmented systems to coherent intelligence.',
  },
];

export function AtAGlance() {
  const [zoom, setZoom] = useState<(typeof PANELS)[number] | null>(null);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoom]);

  return (
    <TelemetryRegion id="at-a-glance" className="">
      <div className="main-inset pt-2 pb-6">
        <CmdPanel
          eyebrow="At a glance"
          title="The whole model in two pictures"
          trailing={
            <div className="flex items-center gap-2">
              <Chip tone="accent" dot>Visual summary</Chip>
              <Chip tone="mono">Click to zoom</Chip>
            </div>
          }
        >
          <p className="text-sm sm:text-base text-white/65 leading-relaxed max-w-3xl mb-5">
            Before the prose: the shape of the architecture and the gap it answers,
            on one screen each. Click either panel to zoom in; the full read-through
            is below.
          </p>
          <div className="flex flex-col gap-5">
            {PANELS.map((p, i) => (
              <figure
                key={p.src}
                className="rounded-xl border border-white/10 bg-black overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]"
              >
                <figcaption className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-[0.625rem] font-mono text-white/45 tracking-[0.22em] uppercase">
                  <span className="text-[#ff8a5c]">{p.eyebrow}</span>
                  <span className="text-white/55">click to zoom · esc to close</span>
                </figcaption>
                <button
                  type="button"
                  onClick={() => setZoom(p)}
                  className="block w-full cursor-zoom-in group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f05122]"
                  aria-label={`Zoom: ${p.alt}`}
                >
                  <img
                    src={p.src}
                    alt={p.alt}
                    width={1536}
                    height={1024}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-auto block transition-opacity group-hover:opacity-95"
                    draggable={false}
                  />
                </button>
                <div className="px-4 py-2 border-t border-white/10 text-xs sm:text-sm text-white/60 leading-relaxed">
                  {p.caption}
                </div>
              </figure>
            ))}
          </div>
        </CmdPanel>
      </div>

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm overflow-auto p-4 sm:p-8 flex items-start sm:items-center justify-center cursor-zoom-out"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(null);
            }}
            className="fixed top-3 right-3 z-[101] inline-flex items-center gap-2 px-3 py-1.5 rounded border border-white/15 bg-black/70 text-xs font-mono text-white/85 tracking-[0.18em] uppercase hover:bg-white/10"
            aria-label="Close"
          >
            Close ✕
          </button>
          <img
            src={zoom.src}
            alt={zoom.alt}
            width={1536}
            height={1024}
            onClick={(e) => e.stopPropagation()}
            className="max-w-none w-auto h-auto block shadow-[0_0_60px_rgba(240,81,34,0.2)] rounded cursor-default"
            draggable={false}
          />
        </div>
      )}
    </TelemetryRegion>
  );
}
