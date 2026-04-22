/**
 * Reference-architecture lineage as a constellation: OIA at center,
 * four primary source frameworks as inner orbit, four secondary
 * sources as outer orbit. Maps §2.1 of the digest.
 */

const PRIMARY = [
  { label: 'OSI', full: 'ISO/IEC 7498', angle: -90 },
  { label: 'NIST CSF', full: 'Cybersecurity Framework', angle: 0 },
  { label: 'MITRE ATLAS', full: 'AI threat taxonomy', angle: 90 },
  { label: 'NIST AI RMF', full: 'AI Risk Management', angle: 180 },
];

const SECONDARY = [
  { label: 'OWASP LLM Top 10', angle: -135 },
  { label: 'EU AI Act', angle: -45 },
  { label: 'ISO/IEC 42001', angle: 45 },
  { label: 'Model Context Protocol', angle: 135 },
];

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function LineageConstellation() {
  const cx = 50;
  const cy = 50;
  const r1 = 24; // primary orbit
  const r2 = 40; // secondary orbit

  return (
    <figure className="mt-6">
      <figcaption className="flex items-center justify-between mb-4">
        <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
          Figure · Reference-Architecture Lineage
        </span>
        <span className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
          §2.1
        </span>
      </figcaption>
      <div className="bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-4 overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-[300px] sm:h-[440px] block" role="img" aria-label="Lineage constellation">
          {/* orbital rings */}
          <circle cx={cx} cy={cy} r={r1} fill="none" stroke="rgba(240,81,34,0.25)" strokeDasharray="1 1" strokeWidth={0.25} />
          <circle cx={cx} cy={cy} r={r2} fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="1 1" strokeWidth={0.2} />

          {/* primary framework lines */}
          {PRIMARY.map((f) => {
            const p = polar(cx, cy, r1, f.angle);
            return (
              <line
                key={f.label}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke="rgba(240,81,34,0.5)"
                strokeWidth={0.35}
              />
            );
          })}

          {/* center: OIA */}
          <circle cx={cx} cy={cy} r={8} fill="rgba(240,81,34,0.18)" stroke="#f05122" strokeWidth={0.5} />
          <text x={cx} y={cy - 0.5} textAnchor="middle" fontSize={2.4} fill="#ffffff" fontFamily="-apple-system, 'Segoe UI', Roboto, sans-serif">
            OIA Model
          </text>
          <text x={cx} y={cy + 2.6} textAnchor="middle" fontSize={1.5} fill="#ff8a5c" fontFamily="ui-monospace, Menlo, monospace" letterSpacing="0.12em">
            v0.1 · 2026
          </text>

          {/* primary nodes */}
          {PRIMARY.map((f) => {
            const p = polar(cx, cy, r1, f.angle);
            return (
              <g key={f.label}>
                <circle cx={p.x} cy={p.y} r={5} fill="rgba(240,81,34,0.08)" stroke="#f05122" strokeWidth={0.35} />
                <text x={p.x} y={p.y - 0.2} textAnchor="middle" fontSize={1.8} fill="#ffffff" fontFamily="-apple-system, 'Segoe UI', Roboto, sans-serif">
                  {f.label}
                </text>
                <text x={p.x} y={p.y + 2} textAnchor="middle" fontSize={1.2} fill="rgba(255,255,255,0.55)" fontFamily="ui-monospace, Menlo, monospace" letterSpacing="0.06em">
                  {f.full}
                </text>
              </g>
            );
          })}

          {/* secondary nodes */}
          {SECONDARY.map((f) => {
            const p = polar(cx, cy, r2, f.angle);
            return (
              <g key={f.label}>
                <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth={0.2} strokeDasharray="0.4 0.6" />
                <circle cx={p.x} cy={p.y} r={3} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.35)" strokeWidth={0.3} />
                <text x={p.x} y={p.y + 0.6} textAnchor="middle" fontSize={1.4} fill="rgba(255,255,255,0.75)" fontFamily="ui-monospace, Menlo, monospace" letterSpacing="0.08em">
                  {f.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-2 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-[0.6875rem] font-mono text-white/45 tracking-[0.14em] uppercase">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border border-[#f05122] bg-[#f05122]/20" />
            Primary lineage · 4 sources
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border border-white/35 bg-white/5" />
            Additional sources consulted
          </span>
        </div>
      </div>
    </figure>
  );
}
