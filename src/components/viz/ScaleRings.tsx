/**
 * Three nested rings visualising the three adoption scales from §7:
 * single intelligent system → enterprise portfolio → industry /
 * jurisdiction.
 */

export function ScaleRings() {
  return (
    <figure className="mt-6">
      <figcaption className="flex items-center justify-between mb-4">
        <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
          Figure · Three Scales of Adoption
        </span>
        <span className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
          §7
        </span>
      </figcaption>

      <div className="bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-6 overflow-hidden">
        <svg viewBox="0 0 100 60" className="w-full h-[280px] block" role="img" aria-label="Three scales of adoption">
          {/* outer ring: industry */}
          <circle cx={30} cy={30} r={28} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={0.4} strokeDasharray="1 0.6" />
          <text x={30} y={5} textAnchor="middle" fontSize={2.2} fill="rgba(255,255,255,0.75)" fontFamily="ui-monospace, Menlo, monospace" letterSpacing="0.18em">
            INDUSTRY · JURISDICTION
          </text>

          {/* middle ring: portfolio */}
          <circle cx={30} cy={30} r={18} fill="none" stroke="rgba(240,81,34,0.4)" strokeWidth={0.5} strokeDasharray="1 0.6" />
          <text x={30} y={14} textAnchor="middle" fontSize={2} fill="#ff8a5c" fontFamily="ui-monospace, Menlo, monospace" letterSpacing="0.18em">
            ENTERPRISE PORTFOLIO
          </text>

          {/* core: single system */}
          <circle cx={30} cy={30} r={9} fill="rgba(240,81,34,0.15)" stroke="#f05122" strokeWidth={0.6} />
          <text x={30} y={29} textAnchor="middle" fontSize={2.2} fill="#ffffff" fontFamily="-apple-system, 'Segoe UI', Roboto, sans-serif">
            Single
          </text>
          <text x={30} y={32.5} textAnchor="middle" fontSize={2.2} fill="#ffffff" fontFamily="-apple-system, 'Segoe UI', Roboto, sans-serif">
            system
          </text>

          {/* legend column */}
          <g transform="translate(62 6)">
            <rect x={0} y={0} width={36} height={48} rx={2} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.25} />
            {[
              { y: 6,  dot: '#f05122',                 label: 'Single system', sub: 'Layers describe components & concerns.' },
              { y: 22, dot: 'rgba(240,81,34,0.6)',     label: 'Portfolio',     sub: 'Shared infrastructure & cross-cutting.' },
              { y: 38, dot: 'rgba(255,255,255,0.75)',  label: 'Industry',      sub: 'Shared vocabulary for collective concerns.' },
            ].map((r) => (
              <g key={r.label}>
                <circle cx={2} cy={r.y} r={0.9} fill={r.dot} />
                <text x={5} y={r.y + 0.6} fontSize={2} fill="#ffffff" fontFamily="-apple-system, 'Segoe UI', Roboto, sans-serif">
                  {r.label}
                </text>
                <text x={5} y={r.y + 3.8} fontSize={1.4} fill="rgba(255,255,255,0.55)" fontFamily="ui-monospace, Menlo, monospace" letterSpacing="0.06em">
                  {r.sub}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </figure>
  );
}
