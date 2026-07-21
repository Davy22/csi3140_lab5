FROM php:8.2-apache

# Install required system packages and PHP extensions for Moodle
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libicu-dev \
    libxml2-dev \
    mariadb-client \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) mysqli gd intl zip soap opcache exif \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Increase PHP limits so the Moodle installation wizard doesn't complain
RUN echo "max_input_vars = 5000\npost_max_size = 50M\nupload_max_filesize = 50M" > /usr/local/etc/php/conf.d/moodle.ini

# Download and extract the latest stable Moodle 4.3 source code
RUN curl -L https://download.moodle.org/download.php/direct/stable403/moodle-latest-403.tgz -o moodle.tgz \
    && tar -xzf moodle.tgz -C /var/www/html --strip-components=1 \
    && rm moodle.tgz

# Set up Moodle data directory and grant proper permissions
RUN mkdir -p /var/www/moodledata \
    && chown -R www-data:www-data /var/www/html /var/www/moodledata \
    && chmod -R 777 /var/www/moodledata

# Enable Apache mod_rewrite
RUN a2enmod rewrite