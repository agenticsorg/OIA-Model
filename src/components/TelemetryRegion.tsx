import { useTelemetryInView } from '../hooks/useTelemetryInView';

interface Props {
  id?: string;
  children: React.ReactNode;
  className?: string;
  /** Smaller threshold for very short sections */
  threshold?: number;
  /** Render without section semantics (for nested regions) */
  as?: 'section' | 'div';
}

/**
 * Wraps a block with the IntersectionObserver gate from ADR-0001 §3.2.
 * While visible, the ancestor carries `.telemetry-in`, which activates
 * the scoped CSS animations in `src/styles/telemetry.css`.
 */
export function TelemetryRegion({ id, children, className = '', threshold = 0.12, as = 'section' }: Props) {
  const { ref, inView } = useTelemetryInView<HTMLElement>(threshold);
  const Tag = as as 'section';
  return (
    <Tag
      id={id}
      ref={ref as React.RefObject<HTMLElement>}
      className={`telemetry-region ${inView ? 'telemetry-in' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}
