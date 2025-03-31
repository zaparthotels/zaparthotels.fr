FROM node:23-bookworm-slim AS base
RUN npm install --global pnpm
WORKDIR /app
COPY . .

FROM base AS build
RUN cd /app/tools/directus \
  && npm install \
  && cd node_modules \
  && find . -maxdepth 1 -type d -name "directus-extension-*" -exec mv {} ../ \;
RUN rm -rf node_modules && pnpm recursive exec -- rm -rf ./node_modules ./src

FROM directus/directus:11.6.0 AS prod
COPY --from=build /app/tools/directus ./extensions
COPY ./tools/directus/schema-sync ./schema-sync
