
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# STAGE 2 - serve
#
FROM nginx:alpine

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Copy certificate generation script and nginx SSL config
COPY generate_certificates.sh /generate_certificates.sh
COPY nginx_ssl.conf /etc/nginx/

# Generate SSL certificates during build
RUN chmod +x /generate_certificates.sh && \
    mkdir -p /etc/nginx/ssl && \
    /generate_certificates.sh

COPY run.sh /run.sh
RUN chmod +x /run.sh

EXPOSE 80
EXPOSE 443
ENTRYPOINT ["/run.sh"]