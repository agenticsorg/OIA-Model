/**
 * Production Node server — serves the built SPA from ./dist and
 * mounts the /api handlers. DB path comes from $DB_PATH so we can
 * point it at the Cloud Run volume mount (/data/feedback.db).
 */

import express from 'express';
import { resolve } from 'node:path';
import { handleApi } from './handlers';

const app = express();
const PORT = Number(process.env.PORT ?? 8080);
const DIST = resolve(process.cwd(), 'dist');

// minimal request log (stderr on Cloud Run)
app.use((req, _res, next) => {
  process.stderr.write(`${new Date().toISOString()}  ${req.method} ${req.url}\n`);
  next();
});

// /api/* — delegate to the shared handler stack
app.use('/api', async (req, res, next) => {
  try {
    const handled = await handleApi(req, res);
    if (!handled) next();
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error).message });
  }
});

// static assets — keep short cache on html, longer on hashed assets
app.use(express.static(DIST, {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (/\.(js|css|png|svg|woff2?)$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

// SPA fallback — hash-based deep links fall through to index.html
app.get(/.*/, (_req, res) => {
  res.sendFile(resolve(DIST, 'index.html'));
});

app.listen(PORT, () => {
  process.stderr.write(`oia-model-reader listening on :${PORT}\n`);
});
