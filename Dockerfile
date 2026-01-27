# syntax = docker/dockerfile:1

# Dockerfile for Next.js + Bun on Fly.io
ARG BUN_VERSION=1.2
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"

WORKDIR /app

# Set production environment
ENV NEXT_TELEMETRY_DISABLED="1" \
    NODE_ENV="production"

# Build stage
FROM base AS build

# Build arguments for NEXT_PUBLIC_* variables (required at build time)
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

# Install packages needed to build node modules (for sharp and other native deps)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential python3 pkg-config

# Install node modules
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build application with NEXT_PUBLIC_* env vars
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

RUN bun run build

# Production stage
FROM base AS runner

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public folder if exists
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
