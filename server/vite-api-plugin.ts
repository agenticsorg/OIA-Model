import type { Plugin, ViteDevServer, PreviewServer } from 'vite';
import { handleApi } from './handlers';

/**
 * Mounts the /api routes onto Vite's dev and preview servers so
 * feedback submissions persist to SQLite during development and
 * `npm run preview`.
 */
export function apiPlugin(): Plugin {
  const mount = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use('/api', async (req, res, next) => {
      try {
        const handled = await handleApi(req, res);
        if (!handled) next();
      } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error: (e as Error).message }));
      }
    });
  };
  return {
    name: 'oia-api',
    configureServer: mount,
    configurePreviewServer: mount,
  };
}
