# ---------- build stage (includes dev deps + build tools for native modules) ----------
FROM node:20-bookworm AS build
WORKDIR /app

# deps
COPY package.json package-lock.json ./
RUN npm ci

# sources needed for both SPA and server builds
COPY tsconfig.json tsconfig.app.json tsconfig.node.json tsconfig.server.json ./
COPY vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY src ./src
COPY public ./public
COPY server ./server
COPY scripts ./scripts
COPY docs ./docs

# Vite build (dist/)
RUN npm run build

# Compile server TS → CommonJS in server-dist/
# The root package.json is "type":"module"; write a tiny package.json in
# server-dist/ so Node treats the compiled output as CommonJS.
RUN npx tsc -p tsconfig.server.json && \
    printf '{"type":"commonjs"}\n' > server-dist/package.json

# ---------- runtime stage (slim, production deps only) ----------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    DB_PATH=/data/feedback.db

# install only runtime deps — better-sqlite3 ships a prebuilt for linux-x64-gnu,
# so this is fast and doesn't need gcc on the final image
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# built artifacts
COPY --from=build /app/dist        ./dist
COPY --from=build /app/server-dist ./server

EXPOSE 8080
CMD ["node", "server/index.js"]
