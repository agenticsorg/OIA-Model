import { useEffect, useState } from 'react';

/**
 * Tracks which of a set of anchor IDs is currently closest to the top
 * of the viewport. Used by the layer rail and span rail to highlight
 * the in-view layer / span.
 */
export function useActiveSection(ids: string[], topOffset = 120): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    function onScroll() {
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top - topOffset <= 0) current = id;
      }
      setActive(current);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ids, topOffset]);

  return active;
}
