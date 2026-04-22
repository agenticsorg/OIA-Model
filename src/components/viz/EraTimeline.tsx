/**
 * Horizontal timeline of computing-era transitions named in the
 * Foreword: "mainframe → client-server → on-premises to cloud →
 * applications to services" and the current moment — intelligent
 * systems. The current era is highlighted with a pulsing accent.
 */
const ERAS = [
  { label: 'Mainframe', era: '1960s' },
  { label: 'Client–Server', era: '1990s' },
  { label: 'Cloud', era: '2000s' },
  { label: 'Services', era: '2010s' },
  { label: 'Intelligent Systems', era: '2020s →', current: true },
];

export function EraTimeline() {
  return (
    <figure className="mt-6 mb-2">
      <figcaption className="flex items-center justify-between mb-4">
        <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
          Figure · Computing-Era Transitions
        </span>
        <span className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
          "We are in one of those moments now"
        </span>
      </figcaption>

      <div className="bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-6 overflow-hidden">
        <div className="relative">
          {/* track */}
          <div className="absolute left-0 right-0 top-4 h-px bg-gradient-to-r from-white/10 via-white/25 to-[#f05122]" />

          {/* sweep-tick glow at current era */}
          <div className="absolute right-[2%] top-[0.4rem] w-3 h-3 rounded-full bg-[#f05122] shadow-[0_0_16px_rgba(240,81,34,0.8)] pulse-accent" />

          {/* era nodes */}
          <div className="relative grid grid-cols-5 gap-2">
            {ERAS.map((e, i) => (
              <div key={e.label} className="flex flex-col items-start">
                <div className="relative h-9 w-full flex items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      e.current
                        ? 'bg-[#f05122] shadow-[0_0_10px_#f05122]'
                        : i === 0
                          ? 'bg-white/40'
                          : 'bg-white/60'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`ml-2 text-[0.625rem] font-mono tracking-[0.18em] uppercase ${
                      e.current ? 'text-[#ff8a5c]' : 'text-white/40'
                    }`}
                  >
                    {e.era}
                  </span>
                </div>
                <span
                  className={`text-sm tracking-tight ${
                    e.current ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {e.label}
                </span>
                {e.current && (
                  <span className="text-[0.6875rem] font-mono text-[#ff8a5c]/70 tracking-wide mt-0.5">
                    OIA Model — v0.1
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-[0.6875rem] font-mono text-white/40 tracking-[0.14em] uppercase">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            Previous eras had a reference architecture
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f05122] pulse-accent" />
            This one is the gap
          </span>
        </div>
      </div>
    </figure>
  );
}
