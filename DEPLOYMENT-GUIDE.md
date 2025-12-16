# ConnectHub Production Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Frontend Deployment](#frontend-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Database Setup](#database-setup)
6. [Cloud Services Configuration](#cloud-services-configuration)
7. [CDN Configuration](#cdn-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Security Configuration](#security-configuration)
10. [Post-Deployment Steps](#post-deployment-steps)
11. [Rollback Procedures](#rollback-procedures)
12. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage meets minimum requirements (80%+)
- [ ] No critical security vulnerabilities
- [ ] Code review completed and approved
- [ ] Documentation updated
- [ ] Changelog updated

### Performance
- [ ] Performance benchmarks met
- [ ] Bundle size optimized
- [ ] Images and assets optimized
- [ ] Lazy loading implemented
- [ ] Caching strategies configured

### Security
- [ ] All API endpoints secured
- [ ] HTTPS certificates configured
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] CORS policies set
- [ ] Security headers configured

### Infrastructure
- [ ] Database backed up
- [ ] CDN configured
- [ ] Load balancer configured
- [ ] Auto-scaling rules set
- [ ] Monitoring tools configured
- [ ] Error tracking configured

---

## Environment Setup

### Development Environment Variables

```bash
# .env.development
NODE_ENV=development
API_URL=http://localhost:5000
SOCKET_URL=http://localhost:5000
DATABASE_URL=postgresql://localhost:5432/connecthub_dev
REDIS_URL=redis://localhost:6379
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
AWS_S3_BUCKET=connecthub-dev
AWS_REGION=us-east-1
```

### Production Environment Variables

```bash
# .env.production
NODE_ENV=production
API_URL=https://api.connecthub.com
SOCKET_URL=https://socket.connecthub.com
DATABASE_URL=postgresql://production-db:5432/connecthub_prod
DATABASE_POOL_SIZE=20
REDIS_URL=redis://production-redis:6379
FIREBASE_API_KEY=production_firebase_key
FIREBASE_AUTH_DOMAIN=connecthub.firebaseapp.com
FIREBASE_PROJECT_ID=connecthub-prod
AWS_S3_BUCKET=connecthub-production
AWS_CLOUDFRONT_URL=https://cdn.connecthub.com
AWS_REGION=us-east-1
JWT_SECRET=your_production_secret
ENCRYPTION_KEY=your_encryption_key
SENTRY_DSN=your_sentry_dsn
STRIPE_SECRET_KEY=your_stripe_key
TWILIO_ACCOUNT_SID=your_twilio_sid
SENDGRID_API_KEY=your_sendgrid_key
```

---

## Frontend Deployment

### Option 1: Vercel Deployment

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Configure vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "ConnectHub-Frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/ConnectHub-Frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### 3. Deploy
```bash
cd ConnectHub-Frontend
vercel --prod
```

### Option 2: AWS S3 + CloudFront

#### 1. Build Frontend
```bash
cd ConnectHub-Frontend
npm run build
```

#### 2. Upload to S3
```bash
aws s3 sync dist/ s3://connecthub-production --delete
```

#### 3. Invalidate CloudFront Cache
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Option 3: Netlify Deployment

#### 1. Create netlify.toml
```toml
[build]
  base = "ConnectHub-Frontend"
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer"
```

#### 2. Deploy
```bash
netlify deploy --prod
```

---

## Backend Deployment

### Option 1: AWS EC2 with Docker

#### 1. Create Dockerfile
```dockerfile
# ConnectHub-Backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

#### 2. Build and Push Docker Image
```bash
# Build image
docker build -t connecthub-backend:latest ./ConnectHub-Backend

# Tag for ECR
docker tag connecthub-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/connecthub-backend:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/connecthub-backend:latest
```

#### 3. Deploy to EC2
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Pull and run container
docker pull 123456789.dkr.ecr.us-east-1.amazonaws.com/connecthub-backend:latest
docker run -d -p 5000:5000 --env-file .env.production connecthub-backend:latest
```

### Option 2: Heroku Deployment

#### 1. Create Procfile
```
web: npm run start:prod
```

#### 2. Deploy to Heroku
```bash
cd ConnectHub-Backend
heroku login
heroku create connecthub-api
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your_database_url
git push heroku main
```

### Option 3: Google Cloud Run

#### 1. Deploy to Cloud Run
```bash
# Build and deploy
gcloud run deploy connecthub-backend \
  --source ./ConnectHub-Backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### Option 4: Kubernetes (Production Scale)

#### 1. Create Kubernetes Deployment
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: connecthub-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: connecthub-backend
  template:
    metadata:
      labels:
        app: connecthub-backend
    spec:
      containers:
      - name: backend
        image: connecthub-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: connecthub-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: connecthub-backend-service
spec:
  selector:
    app: connecthub-backend
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
```

#### 2. Apply Kubernetes Configs
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

---

## Database Setup

### PostgreSQL Production Setup

#### 1. Create Production Database
```sql
CREATE DATABASE connecthub_prod;
CREATE USER connecthub_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE connecthub_prod TO connecthub_user;
```

#### 2. Run Migrations
```bash
cd ConnectHub-Backend
npx prisma migrate deploy
```

#### 3. Seed Initial Data (if needed)
```bash
npx prisma db seed
```

#### 4. Configure Connection Pooling
```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  connectionLimit = 20
}
```

### Redis Setup

#### 1. Configure Redis for Production
```bash
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
```

#### 2. Start Redis with Config
```bash
redis-server /path/to/redis.conf
```

---

## Cloud Services Configuration

### Firebase Setup

#### 1. Create Firebase Project
- Go to Firebase Console
- Create new project: "ConnectHub Production"
- Enable Authentication, Realtime Database, Cloud Storage

#### 2. Configure Firebase in Backend
```javascript
// ConnectHub-Backend/src/config/firebase.ts
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
```

### AWS S3 Configuration

#### 1. Create S3 Buckets
```bash
# Media storage bucket
aws s3 mb s3://connecthub-media-production

# Static assets bucket
aws s3 mb s3://connecthub-assets-production
```

#### 2. Configure Bucket Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::connecthub-media-production/*"
    }
  ]
}
```

#### 3. Enable CORS
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://connecthub.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Twilio Configuration (SMS/Voice)

```javascript
// ConnectHub-Backend/src/services/twilio.service.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to: string, message: string) => {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to,
  });
};
```

---

## CDN Configuration

### CloudFront Setup

#### 1. Create Distribution
```bash
aws cloudfront create-distribution \
  --origin-domain-name connecthub-assets-production.s3.amazonaws.com \
  --default-root-object index.html
```

#### 2. Configure Cache Behaviors
```json
{
  "CacheBehaviors": {
    "Quantity": 2,
    "Items": [
      {
        "PathPattern": "/api/*",
        "TargetOriginId": "backend-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
          "Quantity": 7,
          "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
        },
        "CachedMethods": {
          "Quantity": 2,
          "Items": ["GET", "HEAD"]
        },
        "ForwardedValues": {
          "QueryString": true,
          "Cookies": {
            "Forward": "all"
          },
          "Headers": {
            "Quantity": 3,
            "Items": ["Authorization", "Origin", "Host"]
          }
        }
      },
      {
        "PathPattern": "/static/*",
        "TargetOriginId": "s3-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "Compress": true,
        "MinTTL": 31536000
      }
    ]
  }
}
```

---

## Monitoring & Logging

### Sentry Setup (Error Tracking)

#### Frontend
```javascript
// ConnectHub-Frontend/src/main.js
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Backend
```javascript
// ConnectHub-Backend/src/app.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### CloudWatch Setup

```javascript
// ConnectHub-Backend/src/utils/logger.ts
import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const logger = winston.createLogger({
  transports: [
    new CloudWatchTransport({
      logGroupName: '/connecthub/production',
      logStreamName: 'backend-logs',
      awsRegion: 'us-east-1',
    }),
  ],
});
```

### DataDog Setup

```bash
# Install DataDog agent
DD_API_KEY=your_api_key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

---

## Security Configuration

### SSL/TLS Certificates

#### Using Let's Encrypt
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d connecthub.com -d www.connecthub.com
```

### Security Headers (Nginx)

```nginx
# /etc/nginx/sites-available/connecthub
server {
    listen 443 ssl http2;
    server_name connecthub.com www.connecthub.com;

    ssl_certificate /etc/letsencrypt/live/connecthub.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/connecthub.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    location / {
        root /var/www/connecthub/frontend;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Post-Deployment Steps

### 1. Smoke Tests
```bash
# Test frontend
curl -I https://connecthub.com

# Test API
curl https://api.connecthub.com/health

# Test WebSocket
wscat -c wss://socket.connecthub.com
```

### 2. Monitor Error Rates
- Check Sentry dashboard
- Review CloudWatch metrics
- Monitor database connections

### 3. Performance Check
```bash
# Lighthouse audit
lighthouse https://connecthub.com --output=html --output-path=./report.html

# Load test
k6 run loadtest.js
```

### 4. Verify Backups
```bash
# Test database backup
pg_dump -U connecthub_user connecthub_prod > backup_test.sql
```

---

## Rollback Procedures

### Frontend Rollback

#### Vercel
```bash
vercel rollback
```

#### AWS S3
```bash
# Restore from previous version
aws s3 sync s3://connecthub-production-backup/v1.2.3 s3://connecthub-production --delete
```

### Backend Rollback

#### Docker
```bash
# Pull previous version
docker pull connecthub-backend:1.2.3

# Stop current container
docker stop connecthub-backend

# Start previous version
docker run -d --name connecthub-backend connecthub-backend:1.2.3
```

#### Kubernetes
```bash
# Rollback to previous revision
kubectl rollout undo deployment/connecthub-backend
```

### Database Rollback

```bash
# Restore from backup
pg_restore -U connecthub_user -d connecthub_prod backup_before_deploy.sql
```

---

## Troubleshooting

### Common Issues

#### 1. High Latency
```bash
# Check database connection pool
SELECT count(*) FROM pg_stat_activity;

# Check Redis memory
redis-cli INFO memory

# Review slow queries
SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

#### 2. Memory Leaks
```bash
# Monitor Node.js memory
node --inspect server.js

# Check container memory
docker stats connecthub-backend
```

#### 3. WebSocket Connection Issues
```bash
# Check WebSocket connections
netstat -an | grep :3000 | grep ESTABLISHED | wc -l

# Test WebSocket endpoint
wscat -c wss://socket.connecthub.com
```

#### 4. Database Connection Errors
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < current_timestamp - INTERVAL '10 minutes';
```

---

## Deployment Automation

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: cd ConnectHub-Frontend && npm ci
      - name: Build
        run: cd ConnectHub-Frontend && npm run build
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t connecthub-backend ./ConnectHub-Backend
      - name: Push to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker tag connecthub-backend:latest ${{ secrets.ECR_REGISTRY }}/connecthub-backend:latest
          docker push ${{ secrets.ECR_REGISTRY }}/connecthub-backend:latest
      - name: Deploy to ECS
        run: aws ecs update-service --cluster connecthub --service backend --force-new-deployment
```

---

## Support & Maintenance

### Health Check Endpoints

```javascript
// Backend health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});
```

### Contact Information

- **DevOps Team**: devops@connecthub.com
- **On-Call Engineer**: +1-xxx-xxx-xxxx
- **Slack Channel**: #connecthub-deployments
- **Documentation**: https://docs.connecthub.com

---

## Conclusion

This deployment guide provides comprehensive instructions for deploying ConnectHub to production. Always test in staging environment before deploying to production, and maintain regular backups.

**Last Updated**: December 16, 2025
