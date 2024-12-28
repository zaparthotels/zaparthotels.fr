FROM composer:2.8.4 AS base
WORKDIR /app
COPY . .

FROM base AS build
WORKDIR /app/apps/backend
RUN composer install
RUN composer require symfony/requirements-checker
ENV APP_ENV=prod
ENV APP_DEBUG=0
RUN php bin/console cache:clear

FROM dunglas/frankenphp:1.3.4-php8.4.2-bookworm AS prod
RUN cp $PHP_INI_DIR/php.ini-production $PHP_INI_DIR/php.ini
COPY --from=build /app/apps/backend /app

EXPOSE 3000
ENV SERVER_NAME=:3000