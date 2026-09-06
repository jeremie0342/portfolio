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

# The origin is baked into the output: it ends up in every canonical URL,
# alternate, sitemap entry, share image and link inside the curriculum vitae.
# There is deliberately no database here. Nothing is prerendered from it, so
# the build has nothing to connect to and cannot fail for want of a service
# that this same deployment is about to create.
ARG NEXT_PUBLIC_SITE_URL
ARG GITHUB_TOKEN

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
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
COPY package.json prisma.config.ts ./
COPY prisma ./prisma

# The seed writes through the generated client, which lives outside the prisma
# directory and is produced by the generator rather than committed. Generating
# it here rather than copying it from the builder keeps this stage independent
# of the one that compiles the site.
RUN npx prisma generate

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
