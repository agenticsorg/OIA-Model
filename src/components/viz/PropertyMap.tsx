/**
 * Three defining properties (Persistence, Autonomy, Consequence) with
 * arrows to the layers where each is primarily addressed, per §2.3 of
 * the digest.
 */
const PROPERTIES = [
  {
    name: 'Persistence',
    y: 26,
    addressedAt: 'L8 · L3',
    anchors: [{ y: 14, label: 'L8 Continuity Fabric' }, { y: 60, label: 'L3 Agent Data Substrate' }],
    desc: 'State, memory, learned behaviour across sessions.',
  },
  {
    name: 'Autonomy',
    y: 50,
    addressedAt: 'L7 + L5–L9',
    anchors: [{ y: 26, label: 'L7 Orchestration and Workflow' }],
    desc: 'Goals and judgment exceeding instruction.',
  },
  {
    name: 'Consequence',
    y: 74,
    addressedAt: 'Cross-layer spans',
    anchors: [{ y: 80, label: 'Six horizontal spans' }],
    desc: 'Correctness, accountability, auditability demonstrable.',
  },
];

const LAYER_ANCHORS = [
  { y: 6,  label: 'L9 Human and Browser Interface' },
  { y: 14, label: 'L8 Continuity Fabric ★' },
  { y: 22, label: 'L7 Orchestration and Workflow' },
  { y: 30, label: 'L6 Context and Knowledge' },
  { y: 38, label: 'L5 Inference and Retrieval' },
  { y: 46, label: 'L4 Model Training and Adaptation' },
  { y: 54, label: 'L3 Agent Data Substrate ★' },
  { y: 62, label: 'L2 Sovereign Infrastructure' },
  { y: 70, label: 'L1 Silicon Abstraction' },
  { y: 78, label: 'L0 Physical Compute' },
];

const SPAN_BAND_Y = 88;

export function PropertyMap() {
  return (
    <figure className="mt-6">
      <figcaption className="flex items-center justify-between mb-4">
        <span className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] uppercase">
          Figure · Three Properties → Architectural Home
        </span>
        <span className="text-[0.625rem] font-mono text-white/40 tracking-[0.18em] uppercase">
          §2.3
        </span>
      </figcaption>
      <div className="bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-4 overflow-hidden">
        <svg viewBox="0 0 100 96" className="w-full h-[300px] sm:h-[440px] block" role="img" aria-label="Property to layer mapping">
          {/* layer ladder on the right */}
          {LAYER_ANCHORS.map((a, i) => {
            const stateHolding = a.label.includes('★');
            return (
              <g key={i}>
                <line
                  x1={55}
                  x2={95}
                  y1={a.y}
                  y2={a.y}
                  stroke={stateHolding ? 'rgba(240,81,34,0.35)' : 'rgba(255,255,255,0.10)'}
                  strokeWidth={0.25}
                />
                <text
                  x={56}
                  y={a.y - 0.6}
                  fontSize={1.7}
                  fill={stateHolding ? '#ff8a5c' : 'rgba(255,255,255,0.55)'}
                  fontFamily="ui-monospace, Menlo, monospace"
                  letterSpacing="0.08em"
                >
                  {a.label}
                </text>
              </g>
            );
          })}

          {/* span band at the bottom */}
          <rect x={55} y={SPAN_BAND_Y - 3} width={40} height={4} fill="rgba(240,81,34,0.15)" stroke="rgba(240,81,34,0.5)" strokeWidth={0.3} />
          <text
            x={56}
            y={SPAN_BAND_Y - 0.5}
            fontSize={1.7}
            fill="#ff8a5c"
            fontFamily="ui-monospace, Menlo, monospace"
            letterSpacing="0.08em"
          >
            Cross-layer spans (SEC · SOV · AUD · IDN · ENG · PRV)
          </text>

          {/* property nodes + arrows */}
          {PROPERTIES.map((p) => (
            <g key={p.name}>
              {/* arrows */}
              {p.anchors.map((a, j) => (
                <path
                  key={j}
                  d={`M 20 ${p.y + 2} C 35 ${p.y + 2}, 40 ${a.y}, 55 ${a.y}`}
                  stroke="#f05122"
                  strokeWidth={0.35}
                  fill="none"
                  opacity={0.85}
                />
              ))}

              {/* property bubble */}
              <rect x={2} y={p.y - 4} width={36} height={12} rx={2} fill="rgba(240,81,34,0.08)" stroke="rgba(240,81,34,0.6)" strokeWidth={0.35} />
              <circle cx={6} cy={p.y + 2} r={1.2} fill="#f05122" />
              <text
                x={9}
                y={p.y - 0.5}
                fontSize={2.8}
                fill="#ffffff"
                fontFamily="-apple-system, 'Segoe UI', Roboto, sans-serif"
              >
                {p.name}
              </text>
              <text
                x={9}
                y={p.y + 3}
                fontSize={1.7}
                fill="rgba(255,255,255,0.6)"
                fontFamily="ui-monospace, Menlo, monospace"
                letterSpacing="0.06em"
              >
                {p.desc}
              </text>
              <text
                x={9}
                y={p.y + 6}
                fontSize={1.6}
                fill="#ff8a5c"
                fontFamily="ui-monospace, Menlo, monospace"
                letterSpacing="0.12em"
              >
                → {p.addressedAt}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
