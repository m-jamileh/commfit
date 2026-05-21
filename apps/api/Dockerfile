# ---- base ----
FROM node:22-alpine AS base
ENV PNPM_STORE_DIR=/pnpm/store
RUN npm install -g pnpm@9.15.4

WORKDIR /app

# ---- deps ----
FROM base AS deps
# Copy manifests for dependency install (layer cache)
COPY package.json pnpm-workspace.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/api-client/package.json ./packages/api-client/
COPY apps/api/package.json ./apps/api/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- builder ----
FROM deps AS builder
COPY . .
RUN pnpm --filter @commfit/db build
RUN pnpm --filter @commfit/shared-types build
RUN pnpm --filter @commfit/utils build
RUN pnpm --filter @commfit/api build

# ---- runner ----
FROM node:22-alpine AS runner
ENV NODE_ENV=production
RUN npm install -g pnpm@9.15.4

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/generated ./packages/db/generated
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/package.json
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist
COPY --from=builder /app/packages/utils/package.json ./packages/utils/package.json
COPY --from=builder /app/packages/api-client/dist ./packages/api-client/dist
COPY --from=builder /app/packages/api-client/package.json ./packages/api-client/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
