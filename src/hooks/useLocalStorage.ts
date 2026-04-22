import { useEffect, useState } from 'react';

/**
 * State that persists to localStorage. Read on mount; synced on change.
 * Safe for SSR / non-browser environments (falls through to initial).
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / private mode — silently ignore */
    }
  }, [key, value]);

  return [value, setValue];
}

export const LS_KEYS = {
  assessment: 'oia:assessment:v1',
  votes: 'oia:decision-votes:v1',
  voteNotes: 'oia:decision-notes:v1',
  implementation: 'oia:implementation:v1',
} as const;
