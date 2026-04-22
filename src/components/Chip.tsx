import React from 'react';

/**
 * Tone API is preserved so every call site compiles unchanged, but
 * every colored tone collapses to the single accent (#f05122).
 * `zinc` renders as the mono chip. (ADR-0001 rethemed to black +
 * white + #f05122.)
 */
export type ChipTone = 'emerald' | 'orange' | 'indigo' | 'red' | 'zinc' | 'accent' | 'mono' | 'strong';

interface Props {
  children: React.ReactNode;
  tone?: ChipTone;
  className?: string;
  dot?: boolean;
  pulseDot?: boolean;
  ariaLabel?: string;
}

const toneClass: Record<ChipTone, string> = {
  emerald: 'chip-accent',
  orange: 'chip-accent',
  indigo: 'chip-accent',
  red: 'chip-strong',
  accent: 'chip-accent',
  strong: 'chip-strong',
  zinc: 'chip-mono',
  mono: 'chip-mono',
};

export function Chip({ children, tone = 'mono', className = '', dot, pulseDot, ariaLabel }: Props) {
  const isAccent = tone !== 'zinc' && tone !== 'mono';
  return (
    <span className={`chip ${toneClass[tone]} ${className}`} aria-label={ariaLabel}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isAccent ? 'bg-[#f05122] shadow-[0_0_8px_#f05122]' : 'bg-white/70'
          } ${pulseDot ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
