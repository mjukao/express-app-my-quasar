# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install all dependencies (including devDependencies) for build
RUN npm ci

COPY . .

# Stage 2: Production
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# Create logs directory and set permissions
RUN mkdir -p logs && chown -R node:node logs

# Copy application files from builder with correct ownership
COPY --from=builder --chown=node:node /app /app

# Switch to non-root user for security
USER node

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/api/demo || exit 1

EXPOSE 3000

CMD ["node", "server.js"]