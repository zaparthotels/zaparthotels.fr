FROM node:23-bookworm-slim AS base
RUN npm install --global pnpm
WORKDIR /app
COPY . .

FROM base AS build
RUN pnpm install --frozen-lockfile --filter @zaparthotels/types
RUN pnpm install --frozen-lockfile --filter @zaparthotels/backend
RUN pnpm run --filter @zaparthotels/types build
RUN pnpm run --filter @zaparthotels/backend build

FROM build AS assets
RUN rm -rf node_modules && pnpm recursive exec -- rm -rf ./node_modules ./src

FROM base AS prod
RUN pnpm install --frozen-lockfile --prod --filter @zaparthotels/backend
COPY --from=assets /app .

EXPOSE 3000
ENTRYPOINT ["pnpm", "run", "--filter", "@zaparthotels/backend", "start:prod"]
