/**
 * Base URL for the feedback API.
 *
 * - When the SPA is served from the same origin as the API (our
 *   Cloud Run container or local `npm run dev`), this resolves to an
 *   empty string so fetches are same-origin (`/api/feedback`).
 * - When served as a pure static SPA from a different origin
 *   (e.g. oia.agentics.org via GitHub Pages), the build-time
 *   `VITE_API_BASE` env var points fetches at the Cloud Run URL.
 */
export const API_BASE: string = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}
