#!/bin/sh

# Get the BACKEND_ORIGIN from environment variable
# If not set, use a default value
BACKEND_ORIGIN=${BACKEND_ORIGIN:-http://localhost:5000/api/}

CLASSIFIER_ORIGIN=${CLASSIFIER_ORIGIN:-http://localhost:5000/api/classifier/}

# Frontend domain for CORS headers
FRONTEND_DOMAIN=${FRONTEND_DOMAIN:-localhost:3000}

# Extract backend and classifier hostnames from origins if not provided
BACKEND_HOST=${BACKEND_HOST:-$(echo "$BACKEND_ORIGIN" | sed 's|https\?://||' | sed 's|/.*||')}
CLASSIFIER_HOST=${CLASSIFIER_HOST:-$(echo "$CLASSIFIER_ORIGIN" | sed 's|https\?://||' | sed 's|/.*||')}

echo "Setting backend address to: $BACKEND_ORIGIN"
echo "Setting classifier address to: $CLASSIFIER_ORIGIN"
echo "Setting frontend domain to: $FRONTEND_DOMAIN"
echo "Setting backend host to: $BACKEND_HOST"
echo "Setting classifier host to: $CLASSIFIER_HOST"

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
sed -i "s|__frontend_domain__|$FRONTEND_DOMAIN|g" /etc/nginx/nginx.conf
sed -i "s|__backend_host__|$BACKEND_HOST|g" /etc/nginx/nginx.conf
sed -i "s|__classifier_host__|$CLASSIFIER_HOST|g" /etc/nginx/nginx.conf

# Start nginx in foreground
exec nginx -g "daemon off;"