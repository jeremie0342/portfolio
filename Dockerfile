# syntax=docker/dockerfile:1

# The image the site runs from.
#
# Four stages, and the split is the point: the machine that serves the pages
# carries neither the toolchain that built them nor the migration tool that
# prepares the database. What ships is the traced server output, the static
# assets, and the two typeface files that are read from disk rather than
# imported.

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# The dev dependencies are wanted here: this layer is also the base of the
# migration image, which needs the Prisma CLI and the TypeScript runner.
RUN npm ci

# ---------------------------------------------------------------------------

FROM node:24-alpine AS builder
WORKDIR /app

# Read at build time and baked into the output, both of them. The origin ends
# up in every canonical URL, alternate, sitemap entry and share image; the
# connection string is needed because the pages are prerendered from the
# database rather than fetched in the browser.
ARG NEXT_PUBLIC_SITE_URL
ARG DATABASE_URL
ARG GITHUB_TOKEN

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    DATABASE_URL=$DATABASE_URL \
    GITHUB_TOKEN=$GITHUB_TOKEN \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate && npm run build

# ---------------------------------------------------------------------------

# Migrations run as their own container, once, before the site starts. Keeping
# the Prisma CLI out of the runtime image means the server has no tool capable
# of altering the schema, which is a property worth having on a machine
# reachable from the internet.
FROM node:24-alpine AS migrator
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
CMD ["npx", "prisma", "migrate", "deploy"]

# ---------------------------------------------------------------------------

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Written to at runtime: the incremental cache holds the pages that regenerate
# on their own schedule, and the process does not run as root.
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
