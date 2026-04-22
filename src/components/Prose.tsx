import React from 'react';

interface Props {
  paragraphs: string[];
  className?: string;
}

/**
 * Renders a list of verbatim paragraphs with minimal Markdown-ish
 * enrichment: text between * * is rendered in italic (used by the
 * Decision Log Digest's *reopen decision 04, because…* phrase).
 * No other transforms are applied, so the source text carries through
 * unchanged per the ADR-0001 §7 fidelity checklist.
 */
export function Prose({ paragraphs, className = '' }: Props) {
  return (
    <div className={`prose-telemetry ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i}>{renderWithEmphasis(p)}</p>
      ))}
    </div>
  );
}

function renderWithEmphasis(text: string): React.ReactNode[] {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
