/**
 * Quantum relay uplink primitive, themed to #f05122.
 */
export function SweepLane({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`w-full relative ${compact ? 'py-2' : 'py-4'}`}>
      <div className="h-8 w-full bg-black rounded-lg border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute inset-0 signal-texture opacity-25" aria-hidden="true" />

        <div className="absolute inset-y-0 right-0 w-[15%] bg-[#f05122]/5 border-l border-[#f05122]/30 border-dashed animate-pulse flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#f05122] shadow-[0_0_8px_#f05122]" />
        </div>
        <div className="absolute inset-y-0 left-0 w-[15%] bg-[#f05122]/5 border-r border-[#f05122]/30 border-dashed animate-pulse flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#f05122] shadow-[0_0_8px_#f05122]" />
        </div>

        <div className="sweep-block absolute inset-y-0 border-x flex items-center justify-between px-2 z-10">
          <div className="w-px h-4 bg-[#ff8a5c]/80 shadow-[0_0_8px_rgba(255,138,92,0.8)]" />
          <div className="w-px h-4 bg-[#ff8a5c]/80 shadow-[0_0_8px_rgba(255,138,92,0.8)]" />
        </div>
      </div>
    </div>
  );
}
