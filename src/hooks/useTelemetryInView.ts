import { useEffect, useRef, useState } from 'react';

/**
 * ADR-0001 §3.2 / §6 — mirrors the IntersectionObserver gate from the
 * reference snippet. Returns a ref to attach to a section element and
 * a boolean that flips true while the section is intersecting the
 * viewport, so animations only play on entry (and reset when the user
 * scrolls away and back).
 */
export function useTelemetryInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { threshold, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}
