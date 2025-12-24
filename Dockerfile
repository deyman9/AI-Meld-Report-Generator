# Dockerfile for Meld Report Generator
# Optimized for Next.js standalone output

# Build stage
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Install sharp for image optimization
RUN npm install sharp

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Install OpenSSL for Prisma and sharp dependencies
RUN apk add --no-cache openssl vips-dev

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NODE_OPTIONS="--max-old-space-size=6144"

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy sharp
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp

# Create directories with proper permissions
RUN mkdir -p /app/uploads/templates \
    /app/uploads/models \
    /app/uploads/reports \
    /app/uploads/outlooks \
    /app/uploads/examples \
    /app/.next/cache \
    && chmod -R 777 /app/uploads /app/.next/cache

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
