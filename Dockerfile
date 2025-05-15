# --------- PHASE 1: Builder ---------
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies separately for better caching
COPY package*.json ./

RUN npm ci

COPY . .

# Optional: Build app (e.g., if using TypeScript)
RUN npm run build

FROM node:22-alpine

# Set environment variables
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy only what is needed from the builder
COPY --from=builder /app .

# Expose the port the app runs on
EXPOSE 3000

# Use a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

# Start the app
CMD ["npm", "start"]
