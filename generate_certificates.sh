#!/bin/sh
set -e

# Use /etc/nginx/ssl as the certificate directory for Docker builds
CERT_DIR="${CERT_DIR:-/etc/nginx/ssl}"
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
    echo "Generating self-signed SSL certificate for development..."
    openssl req -x509 -nodes -days 365 \
        -subj "/C=IT/ST=Italy/L=Milan/O=Dev/OU=Dev/CN=localhost" \
        -newkey rsa:2048 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem"
    echo "Self-signed certificate generated at $CERT_DIR."
else
    echo "SSL certificate already exists."
fi
