#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────
# DO-Frontend — Build & Deploy Script
# ──────────────────────────────────────────────────────────────

# Load environment variables from ../env/.env (if it exists)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../env/.env"

if [ -f "$ENV_FILE" ]; then
    echo "📄 Loading env from: ${ENV_FILE}"
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "⚠️  No env file found at ${ENV_FILE}, using defaults."
fi

IMAGE_NAME="do-frontend"
IMAGE_TAG="${1:-latest}"
CONTAINER_NAME="do-frontend"
HOST_PORT="${HOST_PORT:-3001}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"

# Extract hostname from BACKEND_URL for nginx Host header (needed for HTTPS/ngrok)
BACKEND_HOST=$(echo "${BACKEND_URL}" | sed -E 's|https?://([^/:]+).*|\1|')

echo "╔══════════════════════════════════════════════════════╗"
echo "║         DO-Frontend  — Build & Deploy               ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  Image:       ${IMAGE_NAME}:${IMAGE_TAG}"
echo "║  Container:   ${CONTAINER_NAME}"
echo "║  Port:        ${HOST_PORT} → 80"
echo "║  Backend URL: ${BACKEND_URL}"
echo "║  Backend Host:${BACKEND_HOST}"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Build Docker image ──────────────────────────────
echo "🔨 Building Docker image..."
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

echo "✅ Image built: ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""

# ── Step 2: Stop & remove existing container (if any) ───────
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "🛑 Stopping existing container '${CONTAINER_NAME}'..."
    docker stop "${CONTAINER_NAME}" 2>/dev/null || true
    docker rm "${CONTAINER_NAME}" 2>/dev/null || true
    echo "✅ Old container removed."
    echo ""
fi

# ── Step 3: Run new container ───────────────────────────────
echo "🚀 Starting container..."
docker run -d \
    --name "${CONTAINER_NAME}" \
    --add-host=host.docker.internal:host-gateway \
    -p "${HOST_PORT}:80" \
    -e BACKEND_URL="${BACKEND_URL}" \
    -e BACKEND_HOST="${BACKEND_HOST}" \
    --restart unless-stopped \
    "${IMAGE_NAME}:${IMAGE_TAG}"

echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ Deployed successfully!"
echo "  🌐 Frontend:  http://localhost:${HOST_PORT}"
echo "  🔗 Backend:   ${BACKEND_URL}"
echo "════════════════════════════════════════════════════════"
