import { useActiveSection } from '../hooks/useActiveSection';
import { layers } from '../content/layers';

/**
 * Left-edge vertical rail. At xl width (w-52) the layer name is shown
 * in full, wrapping to two lines as needed — no truncation.
 *
 * Ordering matches §4 of the source digest: Layer 0 at top, Layer 9
 * at bottom, so rail order tracks scroll order through the Layer
 * Definitions section.
 */
export function LayerRail() {
  const layerIds = layers.map((l) => l.id);
  const active = useActiveSection(layerIds);

  return (
    <aside
      aria-label="Layer navigation"
      className="hidden lg:flex fixed left-3 top-28 z-40 flex-col gap-1 w-16 xl:w-52 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1"
    >
      <div className="text-[0.625rem] font-mono text-white/35 tracking-[0.18em] uppercase px-2 pb-2 border-b border-white/5">
        Layers
      </div>
      {layers.map((l) => {
        const isActive = active === l.id;
        return (
          <a
            key={l.id}
            href={`#${l.id}`}
            title={l.name}
            className={`group flex items-start gap-2 px-2 py-1.5 rounded border text-[0.6875rem] font-mono tracking-[0.08em] transition-all ${
              isActive
                ? 'border-[#f05122]/60 bg-[#f05122]/10 text-[#ff8a5c] shadow-[0_0_12px_rgba(240,81,34,0.25)]'
                : 'border-transparent text-white/45 hover:text-white/90 hover:border-white/10'
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full flex-shrink-0 mt-[0.45rem] ${
                isActive ? 'bg-[#f05122] shadow-[0_0_6px_#f05122]' : 'bg-white/20 group-hover:bg-white/50'
              }`}
              aria-hidden="true"
            />
            <span className="w-5 flex-shrink-0 pt-[2px]">L{l.number}</span>
            <span className="hidden xl:block text-[0.6875rem] leading-[1.15] text-white/55 group-hover:text-white/85 break-words whitespace-normal">
              {l.name}
            </span>
          </a>
        );
      })}
    </aside>
  );
}
