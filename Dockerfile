# syntax=docker/dockerfile:1

# Only used by `docker compose --profile full up --build`. The everyday loop is `npm run dev`
# against the Postgres container, so nothing here is on the critical path for a reviewer.

FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# next build imports every route module to collect its page data, which imports src/lib/env.ts,
# which validates at import time — so the build needs *some* value here even though nothing is
# actually queried during the build. The container gets the real values at runtime from
# docker-compose.yml's `environment:` block on the app service; env.ts re-validates fresh on
# every process start, so these placeholders never reach a real request.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV JWT_SECRET="build-time-placeholder-overridden-at-container-runtime"
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Standalone tracing does not reliably pick up the generated Prisma query engine.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
