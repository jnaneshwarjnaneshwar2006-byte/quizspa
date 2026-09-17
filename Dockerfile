FROM php:8.2-cli

# Install PHP MySQL database extensions
RUN docker-php-ext-install pdo_mysql mysqli

WORKDIR /app

COPY . .

EXPOSE 10000

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t /app"]