interface Props {
  layerRange: number[];
  tone?: 'emerald' | 'orange' | 'indigo' | 'red' | 'accent';
}

/**
 * Mini layer-range indicator — ten cells (L0..L9), with touched cells
 * filled. All tones collapse to the #f05122 accent (the `tone` prop is
 * kept for API compatibility).
 */
export function SignalLane({ layerRange }: Props) {
  const set = new Set(layerRange);
  return (
    <div className="w-full">
      <div className="h-10 w-full bg-black rounded-lg border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute inset-0 signal-texture opacity-25" aria-hidden="true" />
        <div className="absolute inset-0 grid grid-cols-10">
          {Array.from({ length: 10 }).map((_, i) => {
            const on = set.has(i);
            return (
              <div
                key={i}
                className={`relative border-r last:border-r-0 border-white/5 flex items-center justify-center ${
                  on ? 'bg-[#f05122]/15 border-[#f05122]/40' : ''
                }`}
                title={`Layer ${i}`}
              >
                {on && (
                  <span
                    className="w-1 h-1 rounded-full bg-[#ff8a5c]"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between mt-1 px-1 text-[0.625rem] font-mono text-white/40 tracking-[0.12em]">
        <span>L0</span>
        <span>L1</span>
        <span>L2</span>
        <span>L3</span>
        <span>L4</span>
        <span>L5</span>
        <span>L6</span>
        <span>L7</span>
        <span>L8</span>
        <span>L9</span>
      </div>
    </div>
  );
}
