#!/usr/bin/env bash
# ==============================================================================
# CloudDeploy — Free Let's Encrypt SSL & HTTPS Setup Script
# Usage: ./setup-ssl.sh <DOMAIN> <EMAIL>
# Example: ./setup-ssl.sh clouddeploy.duckdns.org your-email@example.com
# ==============================================================================

set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <DOMAIN> <EMAIL>"
    echo "Example: $0 clouddeploy.duckdns.org dev@example.com"
    exit 1
fi

echo "=========================================================="
echo " CloudDeploy -- SSL & HTTPS Setup for: $DOMAIN"
echo "=========================================================="

# 1. Ensure stack is running on HTTP (Port 80)
echo "[1/4] Ensuring Docker stack is running..."
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d nginx

# 2. Issue Certificate via Certbot Docker container
echo "[2/4] Requesting Let's Encrypt SSL certificate..."
docker run --rm \
  -v "clouddeploy_certbot_www:/var/www/certbot" \
  -v "clouddeploy_certbot_conf:/etc/letsencrypt" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# 3. Create SSL-Enabled Nginx Configuration
echo "[3/4] Generating TLS 1.3 Nginx configuration..."
cat << 'EOF' > infrastructure/docker/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    client_max_body_size 60M;

    upstream backend_upstream {
        server backend:8080;
        keepalive 32;
    }

    upstream frontend_upstream {
        server frontend:80;
        keepalive 32;
    }

    # Port 80: ACME Challenge + 301 Redirect to HTTPS
    server {
        listen 80;
        listen [::]:80;
        server_name _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri =404;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # Port 443: SSL Termination (TLS 1.2 / TLS 1.3)
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name DOMAIN_PLACEHOLDER;

        ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:10m;
        ssl_session_tickets off;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri =404;
        }

        location /api/ {
            proxy_pass http://backend_upstream/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_set_header Connection "";

            proxy_connect_timeout 300s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }

        location /actuator/ {
            proxy_pass http://backend_upstream/actuator/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }

        location / {
            proxy_pass http://frontend_upstream;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_set_header Connection "";
        }
    }
}
EOF

sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" infrastructure/docker/nginx.conf

# 4. Restart Nginx to load TLS certificates
echo "[4/4] Reloading Nginx with HTTPS..."
docker compose -f infrastructure/docker/docker-compose.prod.yml restart nginx

echo "=========================================================="
echo " [OK] HTTPS successfully activated!"
echo " Visit: https://$DOMAIN"
echo "=========================================================="
