interface Props {
  size?: number;
  className?: string;
}

/** Radar ring ornament, themed to #f05122. */
export function RadarRing({ size = 160, className = '' }: Props) {
  return (
    <div
      className={`relative rounded-full border border-white/10 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="absolute inset-2 rounded-full border border-white/5" />
      <div className="absolute inset-0 rounded-full border border-[#f05122]/15" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div className="w-full h-px bg-[#f05122]" />
        <div className="h-full w-px bg-[#f05122] absolute" />
      </div>
      <div className="absolute inset-0 rounded-full radar-sweep" />
    </div>
  );
}
