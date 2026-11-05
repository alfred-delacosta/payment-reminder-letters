# Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
# Optional multi-stage image. Docker is never required to run the app.
# NODE_VERSION is a required build argument (no pinned default).
# Use the major number that `node --version` prints on your machine.

# ---- build ----
ARG NODE_VERSION
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_BASE_PATH=/paymentreminders/
ENV VITE_BASE_PATH=$VITE_BASE_PATH
RUN npm run build

# ---- serve ----
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
USER 101
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/paymentreminders
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/paymentreminders/ || exit 1
