/**
 * Horizontal 2026 timeline marking the three contemporary-context
 * developments from §2.2 of the digest.
 *
 * Layout: a thin year track on top, with one tick per event positioned
 * along it; the cards themselves sit in a 3-column grid beneath the
 * track so they can never overlap regardless of viewport width.
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
        {/* Year track */}
        <div className="relative">
          <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/30 to-[#f05122]" />

          {/* Event ticks on the track */}
          <div className="relative h-3 -mt-[5px]">
            {EVENTS.map((e, i) => (
              <span
                key={i}
                className={`absolute -top-[1px] w-2.5 h-2.5 -ml-[5px] rounded-full ${
                  e.emphasized
                    ? 'bg-[#f05122] shadow-[0_0_12px_rgba(240,81,34,0.7)] pulse-accent'
                    : 'bg-white/60'
                }`}
                style={{ left: `${e.pos}%` }}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Year labels */}
          <div className="mt-2 flex items-center justify-between text-[0.625rem] font-mono text-white/35 tracking-[0.18em] uppercase">
            <span>2024</span>
            <span>2025</span>
            <span className="text-[#ff8a5c]">2026 · NOW</span>
            <span>2027 →</span>
          </div>
        </div>

        {/* Event cards — fixed 3-column grid, never overlap */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {EVENTS.map((e, i) => (
            <article
              key={i}
              className={`p-3.5 rounded-lg border flex flex-col gap-1.5 ${
                e.emphasized
                  ? 'border-[#f05122]/60 bg-[#f05122]/10 shadow-[0_0_24px_rgba(240,81,34,0.12)]'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[0.625rem] font-mono tracking-[0.18em] uppercase ${
                    e.emphasized ? 'text-[#ff8a5c]' : 'text-white/45'
                  }`}
                >
                  {e.month}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    e.emphasized ? 'bg-[#f05122]' : 'bg-white/40'
                  }`}
                  aria-hidden="true"
                />
              </div>
              <div className="text-sm text-white leading-snug">{e.title}</div>
              <div className="text-[0.75rem] text-white/60 leading-relaxed">{e.subtitle}</div>
            </article>
          ))}
        </div>
      </div>
    </figure>
  );
}
