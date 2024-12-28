FROM node:23-bookworm-slim AS base
RUN npm install --global pnpm
WORKDIR /app
COPY . .

FROM base AS build
RUN pnpm install --filter @zaparthotels/frontend
RUN pnpm run --filter @zaparthotels/frontend build

FROM build AS assets
RUN rm -rf node_modules && pnpm recursive exec -- rm -rf ./node_modules ./src

FROM base AS prod
RUN pnpm install --prod --filter @zaparthotels/frontend
COPY --from=assets /app .
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
ENTRYPOINT ["pnpm", "run", "--filter", "@zaparthotels/frontend", "start:prod"]