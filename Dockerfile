
FROM node:20-alpine AS build

# Set working directory in aria's home
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# STAGE 2 - serve
#
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# copy everything into a temp area first
COPY ssl/fullchain.pem ssl/privkey.pem /etc/nginx/ssl/
COPY nginx_ssl.conf /etc/nginx/

COPY run.sh /run.sh
RUN chmod +x /run.sh

EXPOSE 80
EXPOSE 443
ENTRYPOINT ["/run.sh"]