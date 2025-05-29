# Deployment Documentation - Emotion Recognition Frontend

## Table of Contents
1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Docker Deployment](#docker-deployment)
5. [Production Build](#production-build)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Nginx Configuration](#nginx-configuration)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Scaling and Performance](#scaling-and-performance)
10. [Backup and Recovery](#backup-and-recovery)
11. [Security Considerations](#security-considerations)
12. [Troubleshooting](#troubleshooting)

## Deployment Overview

The Emotion Recognition Frontend is designed for containerized deployment using Docker with Nginx as the production web server. The application supports both HTTP and HTTPS configurations with automatic SSL certificate generation.

### Deployment Architecture
```
Internet → Load Balancer → Nginx (Docker) → React App (Static Files)
                    ↓
              SSL Termination
                    ↓
              API Proxy (Backend)
```

### Deployment Options
1. **Docker Container**: Recommended for production (included)
2. **Static Hosting**: For CDN deployment (build output)
3. **Traditional Server**: Standard web server deployment

## Prerequisites

### System Requirements
- **Docker**: Version 20.0+ with Docker Compose
- **Node.js**: Version 18+ for local development
- **Memory**: Minimum 512MB RAM for container
- **Storage**: 100MB for application files
- **Network**: Ports 80 (HTTP) and 443 (HTTPS)

### Development Tools
```bash
# Verify prerequisites
node --version    # Should be 18+
npm --version     # Should be 8+
docker --version  # Should be 20+
```

## Environment Configuration

### Environment Variables

#### Production Environment
```bash
# API Configuration
REACT_APP_API_URL=https://api.emotions.example.com
REACT_APP_ENVIRONMENT=production

# Application Settings
REACT_APP_APP_NAME=Emotion Recognition
REACT_APP_VERSION=1.0.0

# SSL Configuration (Docker)
SSL_COUNTRY=US
SSL_STATE=California
SSL_CITY=San Francisco
SSL_ORGANIZATION=Your Organization
SSL_UNIT=IT Department
SSL_COMMON_NAME=emotions.example.com
```

#### Development Environment
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development

# Debug Settings
REACT_APP_DEBUG=true
```

### Configuration Files

#### .env.production
```bash
# Production environment variables
REACT_APP_API_URL=https://api.emotions.example.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

#### .env.local (for local development)
```bash
# Local development overrides
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DEBUG=true
```

## Docker Deployment

### Docker Configuration

#### Dockerfile Analysis
```dockerfile
# Stage 1: Build React application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
RUN apk add --no-cache openssl
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY generate_certificates.sh /generate_certificates.sh
COPY run.sh /run.sh
RUN chmod +x /generate_certificates.sh /run.sh
EXPOSE 80 443
ENTRYPOINT ["/run.sh"]
```

### Build and Run Commands

#### Basic Docker Commands
```bash
# Build the Docker image
docker build -t emotion-recognition-fe .

# Run the container (HTTP only)
docker run -p 80:80 emotion-recognition-fe

# Run with HTTPS support
docker run -p 80:80 -p 443:443 emotion-recognition-fe

# Run with environment variables
docker run -p 80:80 -p 443:443 \
  -e REACT_APP_API_URL=https://api.example.com \
  emotion-recognition-fe
```

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      - REACT_APP_API_URL=https://api.emotions.example.com
      - REACT_APP_ENVIRONMENT=production
    volumes:
      - ssl_certs:/etc/nginx/ssl
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  ssl_certs:
```

#### Deploy with Docker Compose
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## Production Build

### Build Process

#### Manual Build
```bash
# Install dependencies
npm install

# Create production build
npm run build

# Verify build output
ls -la build/
```

#### Build Optimization
```bash
# Analyze bundle size
npm run analyze

# Run production build locally
npx serve -s build -p 3000
```

### Build Output Structure
```
build/
├── static/
│   ├── css/           # Compiled CSS files
│   ├── js/            # Compiled JavaScript bundles
│   └── media/         # Images and other assets
├── index.html         # Main HTML file
├── manifest.json      # PWA manifest
└── robots.txt         # Search engine directives
```

### Build Verification
```bash
# Check build size
du -sh build/

# Verify critical files
ls -la build/static/js/main.*.js
ls -la build/static/css/main.*.css
```

## SSL/TLS Configuration

### Automatic Certificate Generation

#### SSL Script (generate_certificates.sh)
```bash
#!/bin/sh
# Generate self-signed certificates for development/testing

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=${SSL_COUNTRY:-US}/ST=${SSL_STATE:-CA}/L=${SSL_CITY:-SF}/O=${SSL_ORGANIZATION:-Org}/OU=${SSL_UNIT:-IT}/CN=${SSL_COMMON_NAME:-localhost}"
```

### Production SSL Certificates

#### Let's Encrypt Integration
```bash
# Install Certbot
apt-get update && apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d emotions.example.com

# Auto-renewal setup
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

#### Custom Certificate Installation
```bash
# Copy certificates to container
docker cp your_certificate.crt container_name:/etc/nginx/ssl/nginx.crt
docker cp your_private.key container_name:/etc/nginx/ssl/nginx.key

# Restart Nginx
docker exec container_name nginx -s reload
```

## Nginx Configuration

### Main Configuration (nginx.conf)
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # HTTP server (redirect to HTTPS)
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }
    
    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name _;
        
        # SSL configuration
        ssl_certificate /etc/nginx/ssl/nginx.crt;
        ssl_certificate_key /etc/nginx/ssl/nginx.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        
        # Document root
        root /usr/share/nginx/html;
        index index.html;
        
        # React Router support
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API proxy (if needed)
        location /api/ {
            proxy_pass http://backend:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Nginx Optimization
```nginx
# Performance optimizations
worker_processes auto;
worker_cpu_affinity auto;

# File caching
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
open_file_cache_errors on;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

## Monitoring and Logging

### Application Monitoring

#### Health Checks
```bash
# Container health check
docker exec container_name curl -f http://localhost/health

# SSL certificate expiry check
echo | openssl s_client -servername emotions.example.com \
  -connect emotions.example.com:443 2>/dev/null | \
  openssl x509 -noout -dates
```

#### Performance Monitoring
```bash
# Container resource usage
docker stats container_name

# Nginx status
docker exec container_name nginx -t
docker exec container_name nginx -s reload
```

### Logging Configuration

#### Log Collection
```bash
# View application logs
docker logs -f container_name

# View Nginx access logs
docker exec container_name tail -f /var/log/nginx/access.log

# View Nginx error logs
docker exec container_name tail -f /var/log/nginx/error.log
```

#### Log Rotation
```bash
# Nginx log rotation
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        docker exec container_name nginx -s reload
    endscript
}
```

### Metrics and Alerting
```bash
# Disk usage monitoring
df -h

# Memory usage
free -m

# Network connections
netstat -an | grep :443 | wc -l
```

## Scaling and Performance

### Horizontal Scaling

#### Load Balancer Configuration
```nginx
# Load balancer setup
upstream frontend_cluster {
    server frontend1:443;
    server frontend2:443;
    server frontend3:443;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    location / {
        proxy_pass https://frontend_cluster;
    }
}
```

#### Docker Swarm Deployment
```yaml
# docker-compose.swarm.yml
version: '3.8'

services:
  frontend:
    image: emotion-recognition-fe:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - frontend_network

networks:
  frontend_network:
    driver: overlay
```

### Performance Optimization

#### CDN Integration
```nginx
# CDN configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin "*";
}
```

#### Browser Caching
```nginx
# Cache headers for different file types
location ~* \.(?:manifest|appcache|html?|xml|json)$ {
    expires -1;
}

location ~* \.(?:css|js)$ {
    expires 1y;
    access_log off;
    add_header Cache-Control "public";
}

location ~* \.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc)$ {
    expires 1M;
    access_log off;
    add_header Cache-Control "public";
}
```

## Backup and Recovery

### Data Backup Strategy

#### Configuration Backup
```bash
# Backup Docker volumes
docker run --rm -v ssl_certs:/source -v /backup:/backup \
  alpine tar czf /backup/ssl_certs_$(date +%Y%m%d).tar.gz -C /source .

# Backup environment configuration
cp .env.production /backup/env_$(date +%Y%m%d).backup
```

#### Automated Backups
```bash
#!/bin/bash
# backup.sh - Automated backup script

BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup SSL certificates
docker run --rm -v ssl_certs:/source -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/ssl_certs.tar.gz -C /source .

# Backup configuration
cp docker-compose.yml $BACKUP_DIR/
cp .env.production $BACKUP_DIR/

# Upload to cloud storage (optional)
# aws s3 sync $BACKUP_DIR s3://backup-bucket/emotion-recognition/
```

### Disaster Recovery

#### Recovery Procedures
```bash
# Restore SSL certificates
docker volume create ssl_certs
docker run --rm -v ssl_certs:/target -v /backup:/backup \
  alpine tar xzf /backup/ssl_certs.tar.gz -C /target

# Restore configuration
cp /backup/docker-compose.yml .
cp /backup/.env.production .

# Restart services
docker-compose up -d
```

#### Rollback Strategy
```bash
# Rollback to previous version
docker tag emotion-recognition-fe:latest emotion-recognition-fe:backup
docker pull emotion-recognition-fe:previous
docker tag emotion-recognition-fe:previous emotion-recognition-fe:latest
docker-compose up -d
```

## Security Considerations

### Container Security

#### Security Best Practices
```dockerfile
# Run as non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Remove unnecessary packages
RUN apk del --purge build-dependencies

# Set proper file permissions
RUN chmod 644 /etc/nginx/nginx.conf
```

#### Runtime Security
```bash
# Run container with security options
docker run --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  -p 80:80 -p 443:443 \
  emotion-recognition-fe
```

### Network Security

#### Firewall Configuration
```bash
# Configure iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -j DROP
```

#### SSL Security
```nginx
# Enhanced SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
```

## Troubleshooting

### Common Deployment Issues

#### Container Startup Problems
```bash
# Check container logs
docker logs container_name

# Check container status
docker ps -a

# Inspect container configuration
docker inspect container_name
```

#### SSL Certificate Issues
```bash
# Verify certificate validity
openssl x509 -in /etc/nginx/ssl/nginx.crt -text -noout

# Test SSL configuration
curl -k https://localhost

# Check certificate expiry
openssl x509 -in /etc/nginx/ssl/nginx.crt -noout -enddate
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats --no-stream

# Check Nginx configuration
docker exec container_name nginx -t

# Monitor network connections
netstat -an | grep :443
```

### Debug Commands

#### Network Debugging
```bash
# Test connectivity to backend API
curl -k https://api.emotions.example.com/health

# Check DNS resolution
nslookup emotions.example.com

# Test SSL handshake
openssl s_client -connect emotions.example.com:443
```

#### Application Debugging
```bash
# Access container shell
docker exec -it container_name /bin/sh

# Check file permissions
ls -la /usr/share/nginx/html/

# Test internal connectivity
wget -O- http://localhost/health
```

### Recovery Procedures

#### Service Recovery
```bash
# Restart Nginx
docker exec container_name nginx -s reload

# Restart container
docker restart container_name

# Full redeployment
docker-compose down && docker-compose up -d
```

#### Emergency Procedures
```bash
# Emergency SSL certificate regeneration
docker exec container_name /generate_certificates.sh
docker exec container_name nginx -s reload

# Emergency rollback
docker-compose down
docker pull emotion-recognition-fe:stable
docker-compose up -d
```

For more technical details, see the [Technical Documentation](./TECHNICAL.md).
For user workflow information, see the [Functional Documentation](./FUNCTIONAL.md).
