FROM node:23-bookworm-slim AS base
RUN npm install --global pnpm
WORKDIR /app
COPY . .

FROM base AS build
RUN rm -rf node_modules && pnpm recursive exec -- rm -rf ./node_modules ./src

FROM ghcr.io/goauthentik/server:2024.12.3 AS prod
COPY --from=build /app/tools/authentik /
