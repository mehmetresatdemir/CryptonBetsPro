# CryptonBets Production Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache     postgresql-client     nginx     certbot     certbot-nginx

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S cryptonbets -u 1001

# Set permissions
RUN chown -R cryptonbets:nodejs /app
USER cryptonbets

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3   CMD curl -f http://localhost:5000/health || exit 1

# Start application
CMD ["npm", "start"]
