FROM oven/bun:1.4.4@sha256:1d22548f177f4ff38e0c15baa3c2c46c6c2060ba2d1bc573bb4720b407548f1d AS bun
FROM node:26.13.0-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072 AS base
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

COPY . .
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

ARG PUBLIC_SERVER_URL
ENV PUBLIC_SERVER_URL=${PUBLIC_SERVER_URL}
# SvelteKit 3 reads ORIGIN when the app is built (vite.config.ts `paths.origin`), not at
# runtime. Pass it as a build argument; setting it with `docker run -e` has no effect.
ARG ORIGIN=http://localhost:3001
ENV ORIGIN=${ORIGIN}
ENV NODE_ENV=production
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local cd apps/web && bun run build

ENV HOST=0.0.0.0
ENV PORT=3001
EXPOSE 3001

WORKDIR /app/apps/web
CMD ["node", "build/index.js"]
