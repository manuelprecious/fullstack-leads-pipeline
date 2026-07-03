# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Stage 2: Minimal Runtime Environment
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built artifacts and node_modules from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

# ADD THESE TWO LINES: Bring Knex configs and migrations into the final runtime
COPY --from=builder /app/knexfile.js ./
COPY --from=builder /app/migrations ./migrations

EXPOSE 5000

CMD ["node", "src/server.js"]