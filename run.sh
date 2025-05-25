#!/bin/sh

# Get the BACKEND_ORIGIN from environment variable
# If not set, use a default value
BACKEND_ORIGIN=${BACKEND_ORIGIN:-http://localhost:5000/api/}

CLASSIFIER_ORIGIN=${CLASSIFIER_ORIGIN:-http://localhost:5000/api/classifier/}

echo "Setting backend address to: $BACKEND_ORIGIN"
echo "Setting classifier address to: $CLASSIFIER_ORIGIN"

USE_HTTPS=${USE_HTTPS:-true}

if [ "$USE_HTTPS" = "true" ]; then
    cp /etc/nginx/nginx_ssl.conf /etc/nginx/nginx.conf
else
    rm -f /etc/nginx/nginx_ssl.conf
    rm -rf /etc/nginx/ssl
fi

# Replace the placeholder in nginx.conf
sed -i "s|__backend_address__|$BACKEND_ORIGIN|g" /etc/nginx/nginx.conf
sed -i "s|__classifier_address__|$CLASSIFIER_ORIGIN|g" /etc/nginx/nginx.conf

# Start nginx in foreground
exec nginx -g "daemon off;"