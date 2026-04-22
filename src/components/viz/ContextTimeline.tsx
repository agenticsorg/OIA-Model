/**
 * Horizontal 2026 timeline marking the three contemporary-context
 * developments from §2.2 of the digest.
 */

const EVENTS = [
  {
    month: 'Apr 2026',
    title: 'Mythos System Card + Project Glasswing',
    subtitle: 'Frontier capability threshold crossed — defensive ecosystem lags.',
    pos: 30,
    emphasized: true,
  },
  {
    month: 'Throughout 2026',
    title: 'Agentic deployment at scale',
    subtitle: 'Regulated-sector fragmentation — no shared structural vocabulary.',
    pos: 55,
  },
  {
    month: '2025–26',
    title: 'Unanticipated model behaviours',
    subtitle: 'Strategic concealment · unauthorised capability expansion.',
    pos: 80,
  },
];

export function ContextTimeline() {
  return (
    <figure className="mt-6">
      <figcaption className="flex items-center justify-between mb-4">
        <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
          Figure · Why 2026 — Three Developments
        </span>
        <span className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
          §2.2
        </span>
      </figcaption>

      <div className="bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-6 overflow-hidden">
        <div className="relative">
          {/* track */}
          <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/30 to-[#f05122]" />

          {/* month ticks */}
          <div className="mt-2 flex items-center justify-between text-[0.625rem] font-mono text-white/35 tracking-[0.18em] uppercase">
            <span>2024</span>
            <span>2025</span>
            <span className="text-[#ff8a5c]">2026 · NOW</span>
            <span>2027 →</span>
          </div>

          {/* event pins */}
          <div className="relative mt-6 h-[360px] sm:h-[280px]">
            {EVENTS.map((e, i) => (
              <div
                key={i}
                className="absolute top-0 w-64 max-w-[70%]"
                style={{ left: `calc(${e.pos}% - 6rem)` }}
              >
                {/* drop line */}
                <div className="mx-auto w-px h-6 bg-gradient-to-b from-transparent to-[#f05122]" />
                {/* marker */}
                <div className="flex justify-center">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      e.emphasized ? 'bg-[#f05122] shadow-[0_0_12px_rgba(240,81,34,0.7)] pulse-accent' : 'bg-white/60'
                    }`}
                    aria-hidden="true"
                  />
                </div>
                {/* card */}
                <div
                  className={`mt-3 p-3 rounded-lg border ${
                    e.emphasized
                      ? 'border-[#f05122]/60 bg-[#f05122]/10'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div
                    className={`text-[0.625rem] font-mono tracking-[0.18em] uppercase ${
                      e.emphasized ? 'text-[#ff8a5c]' : 'text-white/45'
                    }`}
                  >
                    {e.month}
                  </div>
                  <div className="text-sm text-white mt-1">{e.title}</div>
                  <div className="text-[0.75rem] text-white/60 leading-relaxed mt-1">
                    {e.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
