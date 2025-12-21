# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install all dependencies (including devDependencies) for build
RUN npm install

COPY . .

# Set dummy DATABASE_URL for prisma generate to work (it validates the config)
ARG DATABASE_URL
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# Create logs directory and set permissions
RUN mkdir -p logs && chown -R node:node logs

COPY package*.json ./
# Install only production dependencies
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder --chown=node:node /app/dist ./dist
# Copy Prisma Client (needed for runtime)
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma
# Copy Prisma Schema and Migrations for migrate deploy
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/prisma.config.ts ./

# Switch to non-root user for security
USER node

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]