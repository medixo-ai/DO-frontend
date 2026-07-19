# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# VITE_API_BASE is left empty so that in production the browser
# makes same-origin requests, which nginx proxies to the backend.
RUN VITE_API_BASE="" npm run build

# ── Stage 2: Serve ──────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx site
RUN rm /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template (uses envsubst for BACKEND_URL)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default backend URL (override at runtime via env)
ENV BACKEND_URL=http://localhost:8000
ENV BACKEND_HOST=localhost

EXPOSE 80

# nginx docker image auto-runs envsubst on /etc/nginx/templates/*.template
CMD ["nginx", "-g", "daemon off;"]
