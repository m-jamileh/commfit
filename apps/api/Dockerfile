# ---- base ----
FROM node:22-alpine AS base
RUN npm install -g pnpm@9.15.4

WORKDIR /app

# ---- deps ----
FROM base AS deps
# Copy manifests for dependency install (layer cache)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/api-client/package.json ./packages/api-client/
COPY apps/api/package.json ./apps/api/
RUN PRISMA_GENERATE_SKIP_AUTOINSTALL=true pnpm install --frozen-lockfile

# ---- builder ----
FROM deps AS builder
COPY . .
RUN rm -rf /root/.cache/prisma /root/.cache/prisma-engines 2>/dev/null || true
RUN pnpm --filter @commfit/db build \
    && rm -f packages/db/generated/client/libquery_engine-linux-musl.so.node
RUN pnpm --filter @commfit/shared-types build
RUN pnpm --filter @commfit/utils build
RUN pnpm --filter @commfit/api build

# ---- runner ----
FROM node:22-alpine AS runner
ENV NODE_ENV=production
RUN npm install -g pnpm@9.15.4
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/generated ./packages/db/generated
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/package.json
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist
COPY --from=builder /app/packages/utils/package.json ./packages/utils/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
