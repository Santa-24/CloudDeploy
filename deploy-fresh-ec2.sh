#!/usr/bin/env bash
# ==============================================================================
# ShipSafe — Complete 1-Click Production Deployment Script for Fresh Ubuntu AMI
# Compatible with Ubuntu 22.04 / 24.04 LTS (x86_64 / arm64)
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "  🚀 Starting ShipSafe 1-Click Fresh Server Deployment"
echo "=========================================================="

APP_DIR="/home/ubuntu/CloudDeploy"
REPO_URL="https://github.com/Santa-24/CloudDeploy.git"

# 1. Update APT and install essential packages
echo "==> [1/7] Installing system dependencies (Java 21, Nginx, Git, build tools)..."
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get install -y openjdk-21-jdk nginx git curl unzip psmisc || sudo apt-get install -y default-jdk nginx git curl unzip psmisc

# 2. Configure 2GB Swap Memory (prevents out-of-memory during Maven compile on small instances)
echo "==> [2/7] Checking and configuring swap memory..."
if [ ! -f /swapfile ]; then
    echo "  Creating 2GB swapfile..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "  Swap configured successfully."
else
    echo "  Swapfile already exists."
fi

# 3. Clone or pull repository
echo "==> [3/7] Setting up repository at $APP_DIR..."
if [ ! -d "$APP_DIR" ]; then
    git clone "$REPO_URL" "$APP_DIR"
else
    cd "$APP_DIR"
    git fetch origin main
    git reset --hard origin/main
fi

cd "$APP_DIR"
sudo chown -R ubuntu:ubuntu "$APP_DIR"

# 4. Deploy Frontend to Nginx root
echo "==> [4/7] Deploying pre-compiled ShipSafe frontend..."
sudo mkdir -p /var/www/html
sudo rm -rf /var/www/html/*
sudo cp -r "$APP_DIR/frontend/dist"/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 5. Configure Nginx Reverse Proxy
echo "==> [5/7] Configuring Nginx reverse proxy..."
cat << 'EOF' | sudo tee /etc/nginx/sites-available/default > /dev/null
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;
    client_max_body_size 60M;

    # Anti-cache for SPA index.html
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
        expires -1;
    }

    # API Proxy to Spring Boot Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Actuator Health Checks
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

    # Static Assets (ShipSafe UI)
    location /assets/ {
        try_files $uri =404;
        access_log off;
    }

    # SPA Client-Side Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
EOF

sudo rm -rf /etc/nginx/sites-enabled/default: 2>/dev/null || true
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 6. Build Backend and configure systemd service
echo "==> [6/7] Building backend JAR package..."
cd "$APP_DIR/backend"
chmod +x mvnw
./mvnw clean package -DskipTests

# Create local storage directories and configure permissions for Nginx access
mkdir -p "$APP_DIR/backend/storage/h2db"
mkdir -p "$APP_DIR/backend/storage/uploads"
mkdir -p "$APP_DIR/backend/storage/sites"
sudo chmod 755 /home/ubuntu
sudo chmod -R 775 "$APP_DIR/backend/storage"
sudo usermod -aG ubuntu www-data 2>/dev/null || true

echo "==> Configuring systemd service: shipsafe-backend..."
cat << EOF | sudo tee /etc/systemd/system/shipsafe-backend.service > /dev/null
[Unit]
Description=ShipSafe Spring Boot Backend Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=$APP_DIR/backend
ExecStart=/usr/bin/java -jar $APP_DIR/backend/target/clouddeploy-backend-1.0.0.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=always
RestartSec=5
Environment="SPRING_PROFILES_ACTIVE=local"
Environment="APP_STORAGE_MODE=local"

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable shipsafe-backend
sudo systemctl restart shipsafe-backend

# 7. Verification & Health Check
echo "==> [7/7] Verifying system health..."
echo -n "  Waiting for Spring Boot to start on port 8080"
HEALTHY=false
for i in {1..30}; do
    if curl -s http://127.0.0.1:8080/actuator/health 2>/dev/null | grep -q '"status":"UP"'; then
        HEALTHY=true
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

PUBLIC_IP=$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo "your-ec2-ip")

if [ "$HEALTHY" = true ]; then
    echo "=========================================================="
    echo "  🎉 SUCCESS! ShipSafe is completely deployed and LIVE!"
    echo "=========================================================="
    echo "  Web Interface:    http://$PUBLIC_IP"
    echo "  API Endpoint:     http://$PUBLIC_IP/api/"
    echo "  Health Status:    http://$PUBLIC_IP/actuator/health (UP)"
    echo "  Service Status:   sudo systemctl status shipsafe-backend"
    echo "  Backend Logs:     sudo journalctl -u shipsafe-backend -f"
    echo "=========================================================="
else
    echo "=========================================================="
    echo "  ⚠️ Backend is starting up. Check status with:"
    echo "     sudo systemctl status shipsafe-backend"
    echo "     sudo journalctl -u shipsafe-backend -n 30"
    echo "=========================================================="
fi

