FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/dist ./dist

# Create directory for database
RUN mkdir -p /var/lib/app

# Set environment
ENV NODE_ENV=production
ENV DATABASE_PATH=/var/lib/app/database.sqlite
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
