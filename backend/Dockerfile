# Multi-stage build for production optimization
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies including Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    make \
    g++ \
    udev \
    ttf-liberation \
    font-noto-emoji \
    wqy-zenhei

# Tell Puppeteer to skip installing Chromium. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/ && test -f dist/main.js

# Production stage
FROM node:22-alpine AS production

# Install system dependencies for production
RUN apk add --no-cache \
    dumb-init \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wget \
    udev \
    ttf-liberation \
    font-noto-emoji \
    wqy-zenhei

# Tell Puppeteer to skip installing Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production \
    CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/bin/chromium-browser

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Create directories for uploads and logs
RUN mkdir -p uploads logs tmp && chown -R nestjs:nodejs uploads logs tmp

# Verify the main.js file exists
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found!" && exit 1)

# Test Chromium installation
RUN /usr/bin/chromium-browser --version

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]