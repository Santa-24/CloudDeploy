#!/usr/bin/env bash
set -e

echo "=========================================="
echo " ShipSafe EC2 Instant Update Script"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> [1/4] Copying fresh frontend build to /var/www/html..."
sudo mkdir -p /var/www/html
sudo rm -rf /var/www/html/*
sudo cp -r "$SCRIPT_DIR/frontend/dist"/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

echo "==> [2/4] Configuring Nginx reverse proxy..."
cat << 'EOF' | sudo tee /etc/nginx/sites-available/default > /dev/null
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;

    client_max_body_size 60M;

    # Never cache index.html
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
        expires -1;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /actuator/ {
        proxy_pass http://127.0.0.1:8080/actuator/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Deployed Tenant Websites
    location /sites/ {
        root /home/ubuntu/CloudDeploy/backend/storage;
        index index.html;
        try_files $uri $uri/ =404;
    }

    location /assets/ {
        try_files $uri =404;
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
EOF

sudo rm -rf /etc/nginx/sites-enabled/default: 2>/dev/null || true
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

sudo chmod 755 /home/ubuntu 2>/dev/null || true
sudo chmod -R 775 "$SCRIPT_DIR/backend/storage" 2>/dev/null || true
sudo usermod -aG ubuntu www-data 2>/dev/null || true

echo "==> [3/4] Restarting Nginx..."
sudo nginx -t
sudo systemctl restart nginx

echo "==> [4/4] Verifying Live Output:"
echo -n "  HTML Title: "
curl -s http://localhost | grep -o '<title>[^<]*</title>' || echo "Title not found"

JS_FILE=$(ls "$SCRIPT_DIR/frontend/dist/assets/"*.js | head -n 1 | xargs -n1 basename)
echo -n "  JS Asset ($JS_FILE): "
curl -s -I "http://localhost/assets/$JS_FILE" | head -n 1

echo "=========================================="
echo " [OK] ShipSafe is now live on http://65.0.131.231"
echo "=========================================="

