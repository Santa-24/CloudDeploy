#!/usr/bin/env bash
set -e

echo "=========================================="
echo " ShipSafe Backend Restart & Update Script"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> [1/4] Stopping existing backend on port 8080..."
sudo fuser -k 8080/tcp 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:8080 2>/dev/null) 2>/dev/null || true
pkill -9 -f 'spring-boot|clouddeploy' 2>/dev/null || true
sleep 2

echo "==> [2/4] Ensuring build tools are executable..."
chmod +x "$SCRIPT_DIR/backend/mvnw"

echo "==> [3/4] Launching Spring Boot backend in background..."
cd "$SCRIPT_DIR/backend"
nohup ./mvnw spring-boot:run > backend.log 2>&1 &
echo "  Backend process launched (PID: $!)."

echo "==> [4/4] Waiting for backend to become healthy on port 8080..."
for i in {1..35}; do
    if curl -s http://127.0.0.1:8080/actuator/health 2>/dev/null | grep -q '"status":"UP"'; then
        echo ""
        echo "=========================================="
        echo " [OK] Backend is UP and Healthy on port 8080!"
        echo "=========================================="
        exit 0
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "Backend is still starting up. Recent log output:"
tail -n 25 "$SCRIPT_DIR/backend/backend.log"
