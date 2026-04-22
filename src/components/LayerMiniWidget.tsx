/**
 * Per-layer mini-widget — each layer panel's sidebar ornament.
 * Four types (radar, ring, bars, lane) assigned deterministically
 * by layer number so each layer reads visually distinct.
 */

interface Props {
  layer: number;
  isStateHolding: boolean;
}

type WidgetKind = 'radar' | 'ring' | 'bars' | 'lane';

const ASSIGN: Record<number, WidgetKind> = {
  0: 'radar',
  1: 'bars',
  2: 'ring',
  3: 'lane',
  4: 'ring',
  5: 'bars',
  6: 'radar',
  7: 'lane',
  8: 'ring',
  9: 'bars',
};

export function LayerMiniWidget({ layer, isStateHolding }: Props) {
  const kind = ASSIGN[layer] ?? 'radar';
  return (
    <div className="flex flex-col items-end gap-3 min-w-[156px]">
      <div className="relative w-36 h-36 bg-black rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-dots opacity-40" aria-hidden="true" />
        {kind === 'radar' && <MiniRadar layer={layer} />}
        {kind === 'ring' && <MiniRing layer={layer} />}
        {kind === 'bars' && <MiniBars />}
        {kind === 'lane' && <MiniLane />}
      </div>
      <div className="text-right">
        <div className="text-[0.625rem] font-mono text-white/35 tracking-[0.18em] uppercase">
          {isStateHolding ? 'State-Holding' : kindLabel(kind)}
        </div>
        <div className="text-[0.625rem] font-mono text-[#ff8a5c]/70 tracking-[0.18em] uppercase mt-0.5">
          L{layer} · Nominal
        </div>
      </div>
    </div>
  );
}

function kindLabel(kind: WidgetKind): string {
  switch (kind) {
    case 'radar': return 'Scanning';
    case 'ring': return 'Thermal';
    case 'bars': return 'Throughput';
    case 'lane': return 'Uplink';
  }
}

function MiniRadar({ layer }: { layer: number }) {
  return (
    <div className="relative w-28 h-28 rounded-full border border-white/10 flex items-center justify-center">
      <div className="absolute inset-2 rounded-full border border-white/5" />
      <div className="absolute inset-0 rounded-full border border-[#f05122]/15" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-full h-px bg-[#f05122]" />
        <div className="h-full w-px bg-[#f05122] absolute" />
      </div>
      <div className="absolute inset-0 rounded-full radar-sweep" />
      <span className="relative text-2xl font-normal text-white display-font">L{layer}</span>
    </div>
  );
}

function MiniRing({ layer }: { layer: number }) {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="transparent"
          stroke="#f05122"
          strokeWidth="8"
          strokeDasharray="314"
          strokeLinecap="round"
          className="thermal-ring drop-shadow-[0_0_10px_rgba(240,81,34,0.5)]"
          style={{ strokeDashoffset: 110 }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-normal text-white display-font leading-none">L{layer}</div>
        <div className="text-[0.625rem] font-mono text-[#ff8a5c] tracking-[0.18em] mt-0.5 uppercase">
          Active
        </div>
      </div>
    </div>
  );
}

function MiniBars() {
  return (
    <div className="relative w-full h-full flex items-end justify-center gap-2 px-6 py-4">
      <div
        className="w-4 rounded-t compute-bar-1"
        style={{ height: '30%', background: 'linear-gradient(0deg, #c43e17, #f05122)' }}
      />
      <div
        className="w-4 rounded-t compute-bar-2"
        style={{ height: '60%', background: 'linear-gradient(0deg, #f05122, #ff8a5c)' }}
      />
      <div
        className="w-4 rounded-t compute-bar-3"
        style={{ height: '38%', background: 'linear-gradient(0deg, #9b3013, #e44921)' }}
      />
    </div>
  );
}

function MiniLane() {
  return (
    <div className="relative w-[110px] h-8 bg-black rounded border border-white/10 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
      <div className="absolute inset-0 signal-texture opacity-30" aria-hidden="true" />
      <div className="sweep-block absolute inset-y-0 border-x flex items-center justify-between px-1">
        <div className="w-px h-4 bg-[#ff8a5c]/80 shadow-[0_0_6px_rgba(255,138,92,0.8)]" />
        <div className="w-px h-4 bg-[#ff8a5c]/80 shadow-[0_0_6px_rgba(255,138,92,0.8)]" />
      </div>
    </div>
  );
}
