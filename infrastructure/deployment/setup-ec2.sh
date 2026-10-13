#!/usr/bin/env bash
# ==============================================================================
# CloudDeploy — Production EC2 Server Provisioning Script
# Target OS: Ubuntu 22.04 LTS / Amazon Linux 2023
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo " CloudDeploy -- Automated Production Server Provisioning"
echo "=========================================================="

# 1. Update system packages
echo "[1/5] Updating operating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y || sudo dnf update -y

# 2. Configure 2GB Swap Memory (Crucial for Java 21 compilation on small instances)
echo "[2/5] Checking and configuring swap memory..."
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

# 3. Install Docker Engine & Docker Compose Plugin
echo "[3/5] Installing Docker Engine & Docker Compose..."
if ! command -v docker &> /dev/null; then
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# 4. Enable Docker without sudo for current user
echo "[4/5] Configuring user permissions for Docker..."
CURRENT_USER=$(whoami)
sudo usermod -aG docker "$CURRENT_USER" || true
sudo systemctl enable docker
sudo systemctl start docker

# 5. Verify Installation
echo "[5/5] Verifying tool installations..."
docker --version
docker compose version

echo "=========================================================="
echo " [OK] Server provisioning complete!"
echo " Log out and log back in (or run 'newgrp docker') to use"
echo " docker without sudo privileges."
echo "=========================================================="
