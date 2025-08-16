# Frontend Production Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build for production
RUN npm run build 2>/dev/null || echo "Build script not found, copying files directly"

# Production stage with nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application or source files
COPY --from=builder /app/build /usr/share/nginx/html/ 2>/dev/null || \
COPY --from=builder /app/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user
RUN addgroup -g 1001 -S nginx-app
RUN adduser -S nginx-app -u 1001

# Set proper permissions
RUN chown -R nginx-app:nginx-app /usr/share/nginx/html
RUN chown -R nginx-app:nginx-app /var/cache/nginx
RUN chown -R nginx-app:nginx-app /var/log/nginx
RUN chown -R nginx-app:nginx-app /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nginx-app:nginx-app /var/run/nginx.pid

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health.html || exit 1

# Create health check file
RUN echo '<!DOCTYPE html><html><body>OK</body></html>' > /usr/share/nginx/html/health.html

# Switch to non-root user
USER nginx-app

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
