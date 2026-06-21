FROM oven/bun:1.1.42-slim AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/e2e/package.json apps/e2e/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
RUN bun run --filter @moddery/api prisma:generate
RUN bun run --filter @moddery/api build

FROM deps AS dev
COPY apps/api/prisma apps/api/prisma
RUN bun run --filter @moddery/api prisma:generate

FROM oven/bun:1.1.42-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/packages/shared ./packages/shared
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["bun", "run", "start"]
