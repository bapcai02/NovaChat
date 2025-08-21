FROM php:8.2-fpm

# Cài hệ thống và extension cần thiết
RUN apt-get update && apt-get install -y \
    git curl zip unzip supervisor libpng-dev libjpeg-dev libfreetype6-dev \
    libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring bcmath xml zip sockets pcntl

# Cài Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Cài Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY ./supervisor /etc/supervisor/conf.d

EXPOSE 9000

CMD ["php-fpm"]
