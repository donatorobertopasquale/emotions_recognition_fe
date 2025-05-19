#!/bin/sh

# Get the BACKEND_ORIGIN from environment variable
# If not set, use a default value
BACKEND_ORIGIN=${BACKEND_ORIGIN:-http://localhost:5000/api/}

echo "Setting backend address to: $BACKEND_ORIGIN"

# Replace the placeholder in nginx.conf
sed -i "s|__backend_address__|$BACKEND_ORIGIN|g" /etc/nginx/nginx.conf

# Start nginx in foreground
exec nginx -g "daemon off;"