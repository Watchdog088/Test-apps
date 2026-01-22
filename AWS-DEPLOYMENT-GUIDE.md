# ConnectHub AWS Deployment Guide
**Complete AWS Infrastructure Setup for Production Deployment**

---

## 📋 OVERVIEW

This guide provides step-by-step instructions to deploy ConnectHub to AWS (Amazon Web Services) for production use. The deployment includes backend API, database, file storage, and real-time messaging capabilities.

---

## 🏗️ AWS ARCHITECTURE

### Infrastructure Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Route 53 (DNS)                          │
│                   connecthub.com                            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              CloudFront (CDN)                               │
│         SSL/TLS Certificate (ACM)                           │
└────────────┬───────────────────────┬────────────────────────┘
             │                       │
    ┌────────▼────────┐     ┌───────▼──────────┐
    │   S3 Bucket     │     │  Application     │
    │  (Frontend)     │     │  Load Balancer   │
    └─────────────────┘     └───────┬──────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
            ┌────────▼────┐  ┌─────▼─────┐ ┌─────▼─────┐
            │   ECS Task  │  │ ECS Task  │ │ ECS Task  │
            │  (Backend)  │  │ (Backend) │ │ (Backend) │
            └────────┬────┘  └─────┬─────┘ └─────┬─────┘
                     │             │             │
                     └─────────────┼─────────────┘
                                   │
                     ┌─────────────▼─────────────┐
                     │                           │
              ┌──────▼──────┐          ┌────────▼────────┐
              │   RDS       │          │  ElastiCache   │
              │ (PostgreSQL)│          │    (Redis)     │
              └─────────────┘          └─────────────────┘
                     
              ┌───────────────────────────────────────┐
              │         S3 Bucket                     │
              │   (User Uploads/Media Files)          │
              └───────────────────────────────────────┘
```

### AWS Services Used

1. **EC2 / ECS Fargate** - Backend API hosting
2. **RDS (PostgreSQL)** - Primary database
3. **ElastiCache (Redis)** - Caching and sessions
4. **S3** - File storage (uploads, static files)
5. **CloudFront** - CDN for global distribution
6. **Application Load Balancer** - Traffic distribution
7. **Route 53** - DNS management
8. **ACM** - SSL/TLS certificates
9. **CloudWatch** - Monitoring and logging
10. **IAM** - Security and permissions

---

## 💰 ESTIMATED COSTS

### Monthly Cost Breakdown (Beta/Small Scale)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| ECS Fargate | 2 vCPU, 4GB RAM, 2 tasks | $70 |
| RDS PostgreSQL | db.t3.micro (1 vCPU, 1GB) | $15 |
| ElastiCache Redis | cache.t3.micro | $12 |
| S3 Storage | 100GB + requests | $5 |
| ALB | Application Load Balancer | $20 |
| CloudFront | 1TB transfer | $85 |
| Route 53 | 1 hosted zone | $0.50 |
| **TOTAL** | **Beta/Development** | **~$207/month** |

### Production Scale (1,000+ active users)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| ECS Fargate | 4 vCPU, 8GB RAM, 4 tasks | $280 |
| RDS PostgreSQL | db.t3.large (2 vCPU, 8GB) | $120 |
| ElastiCache Redis | cache.t3.medium | $48 |
| S3 Storage | 500GB + requests | $15 |
| ALB + CloudFront | With higher traffic | $300 |
| **TOTAL** | **Production** | **~$763/month** |

---

## 🚀 DEPLOYMENT METHODS

### Option 1: AWS Elastic Beanstalk (Easiest)
**Best for:** Quick deployment, beginners
**Pros:** Automated, managed service
**Cons:** Less control, slightly higher cost

### Option 2: ECS with Fargate (Recommended)
**Best for:** Production, scalability
**Pros:** Containerized, auto-scaling, no server management
**Cons:** More complex initial setup

### Option 3: EC2 Instances (Traditional)
**Best for:** Full control, custom requirements
**Pros:** Complete control
**Cons:** Manual management, security updates

**This guide focuses on Option 2 (ECS with Fargate)**

---

## 📝 PREREQUISITES

### 1. AWS Account Setup
- AWS account with billing enabled
- AWS CLI installed locally
- IAM user with AdministratorAccess (for setup)

### 2. Required Tools
```bash
# Install AWS CLI
# Windows (using MSI installer)
# Download from: https://aws.amazon.com/cli/

# Verify installation
aws --version

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter region (e.g., us-east-1)
# Enter output format (json)
```

### 3. Docker Installation
```bash
# Install Docker Desktop for Windows
# Download from: https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
```

### 4. Domain Name (Optional but Recommended)
- Purchase domain from Route 53 or external provider
- Example: `connecthub.com`

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### Step 1: Prepare Backend for AWS

#### 1.1 Create Dockerfile
Create `ConnectHub-Backend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/server-phase1.js"]
```

#### 1.2 Create .dockerignore
Create `ConnectHub-Backend/.dockerignore`:

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
dist
uploads/*
logs/*
```

#### 1.3 Build and Test Docker Image Locally

```bash
cd ConnectHub-Backend

# Build image
docker build -t connecthub-backend:latest .

# Test locally
docker run -p 3001:3001 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  connecthub-backend:latest
```

### Step 2: Set Up AWS Infrastructure

#### 2.1 Create VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=connecthub-vpc}]'

# Note the VPC ID from output
VPC_ID="vpc-xxxxx"

# Create public subnets (for ALB)
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-public-1a}]'

aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-public-1b}]'

# Create private subnets (for ECS tasks and RDS)
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.11.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-private-1a}]'

aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.12.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-private-1b}]'
```

#### 2.2 Create RDS Database

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name connecthub-db-subnet \
  --db-subnet-group-description "ConnectHub database subnet group" \
  --subnet-ids subnet-xxxxx subnet-yyyyy

# Create security group for RDS
aws ec2 create-security-group \
  --group-name connecthub-rds-sg \
  --description "Security group for ConnectHub RDS" \
  --vpc-id $VPC_ID

# Allow PostgreSQL access from ECS tasks
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-ecs-tasks

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier connecthub-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username admin \
  --master-user-password "YourSecurePassword123!" \
  --allocated-storage 20 \
  --db-subnet-group-name connecthub-db-subnet \
  --vpc-security-group-ids sg-xxxxx \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --storage-encrypted \
  --no-publicly-accessible

# Get database endpoint (wait 5-10 minutes for creation)
aws rds describe-db-instances \
  --db-instance-identifier connecthub-db \
  --query 'DBInstances[0].Endpoint.Address'
```

#### 2.3 Create S3 Buckets

```bash
# Create bucket for user uploads
aws s3 mb s3://connecthub-uploads-prod --region us-east-1

# Create bucket for frontend static files
aws s3 mb s3://connecthub-frontend-prod --region us-east-1

# Enable versioning for uploads bucket
aws s3api put-bucket-versioning \
  --bucket connecthub-uploads-prod \
  --versioning-configuration Status=Enabled

# Configure CORS for uploads bucket
aws s3api put-bucket-cors \
  --bucket connecthub-uploads-prod \
  --cors-configuration file://cors-config.json
```

Create `cors-config.json`:
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["https://connecthub.com", "https://www.connecthub.com"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }]
}
```

#### 2.4 Create ECR Repository

```bash
# Create repository for Docker images
aws ecr create-repository \
  --repository-name connecthub-backend \
  --region us-east-1

# Get repository URI
aws ecr describe-repositories \
  --repository-names connecthub-backend \
  --query 'repositories[0].repositoryUri'
# Example output: 123456789.dkr.ecr.us-east-1.amazonaws.com/connecthub-backend
```

#### 2.5 Push Docker Image to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag connecthub-backend:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/connecthub-backend:latest

# Push image
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/connecthub-backend:latest
```

### Step 3: Create ECS Cluster and Service

#### 3.1 Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster \
  --cluster-name connecthub-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1 \
    capacityProvider=FARGATE_SPOT,weight=4
```

#### 3.2 Create Task Definition

Create `task-definition.json`:
```json
{
  "family": "connecthub-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::123456789:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789:role/ecsTaskRole",
  "containerDefinitions": [{
    "name": "connecthub-backend",
    "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/connecthub-backend:latest",
    "portMappings": [{
      "containerPort": 3001,
      "protocol": "tcp"
    }],
    "environment": [
      { "name": "NODE_ENV", "value": "production" },
      { "name": "PORT", "value": "3001" }
    ],
    "secrets": [
      {
        "name": "DATABASE_URL",
        "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:connecthub/database-url"
      },
      {
        "name": "JWT_SECRET",
        "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:connecthub/jwt-secret"
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/connecthub-backend",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    },
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"],
      "interval": 30,
      "timeout": 5,
      "retries": 3,
      "startPeriod": 60
    }
  }]
}
```

Register task definition:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

#### 3.3 Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name connecthub-alb \
  --subnets subnet-public-1a subnet-public-1b \
  --security-groups sg-alb \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4

# Create target group
aws elbv2 create-target-group \
  --name connecthub-tg \
  --protocol HTTP \
  --port 3001 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

#### 3.4 Create ECS Service

```bash
aws ecs create-service \
  --cluster connecthub-cluster \
  --service-name connecthub-backend-service \
  --task-definition connecthub-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-private-1a,subnet-private-1b],
    securityGroups=[sg-ecs-tasks],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=connecthub-backend,containerPort=3001" \
  --health-check-grace-period-seconds 60 \
  --enable-execute-command
```

### Step 4: Deploy Frontend to S3 + CloudFront

#### 4.1 Build Frontend

```bash
cd ConnectHub-Frontend

# Update environment variables
echo "VITE_API_URL=https://api.connecthub.com/api/v1" > .env.production
echo "VITE_WS_URL=https://api.connecthub.com" >> .env.production

# Build
npm run build
```

#### 4.2 Upload to S3

```bash
# Sync build files to S3
aws s3 sync dist/ s3://connecthub-frontend-prod/ --delete

# Set bucket policy for public read
aws s3api put-bucket-policy \
  --bucket connecthub-frontend-prod \
  --policy file://bucket-policy.json
```

#### 4.3 Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name connecthub-frontend-prod.s3.amazonaws.com \
  --default-root-object index.html \
  --comment "ConnectHub Frontend Distribution"
```

### Step 5: Configure Domain and SSL

#### 5.1 Request SSL Certificate

```bash
# Request certificate in ACM
aws acm request-certificate \
  --domain-name connecthub.com \
  --subject-alternative-names www.connecthub.com api.connecthub.com \
  --validation-method DNS \
  --region us-east-1
```

#### 5.2 Configure Route 53

```bash
# Create hosted zone (if not exists)
aws route53 create-hosted-zone \
  --name connecthub.com \
  --caller-reference $(date +%s)

# Create A record for main domain (pointing to CloudFront)
# Create A record for API subdomain (pointing to ALB)
```

---

## 🔐 SECURITY SETUP

### 1. Store Secrets in AWS Secrets Manager

```bash
# Store database URL
aws secretsmanager create-secret \
  --name connecthub/database-url \
  --secret-string "postgresql://admin:password@dbhost:5432/connecthub"

# Store JWT secret
aws secretsmanager create-secret \
  --name connecthub/jwt-secret \
  --secret-string "your-super-secret-jwt-key"

# Store refresh token secret
aws secretsmanager create-secret \
  --name connecthub/refresh-token-secret \
  --secret-string "your-refresh-token-secret"
```

### 2. Configure IAM Roles

```bash
# Create ECS task execution role
# Create ECS task role with S3 access
# Create CloudWatch logs permissions
```

### 3. Security Groups Configuration

```
ALB Security Group:
- Allow inbound 443 (HTTPS) from 0.0.0.0/0
- Allow inbound 80 (HTTP) from 0.0.0.0/0 (redirect to HTTPS)

ECS Tasks Security Group:
- Allow inbound 3001 from ALB security group
- Allow outbound all

RDS Security Group:
- Allow inbound 5432 from ECS tasks security group
```

---

## 📊 MONITORING AND MAINTENANCE

### CloudWatch Logs

```bash
# View logs
aws logs tail /ecs/connecthub-backend --follow

# Create alarms
aws cloudwatch put-metric-alarm \
  --alarm-name connecthub-high-cpu \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --period 300 \
  --statistic Average \
  --threshold 80
```

### Auto Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/connecthub-cluster/connecthub-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/connecthub-cluster/connecthub-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

---

## 🧪 TESTING DEPLOYMENT

```bash
# Test health endpoint
curl https://api.connecthub.com/health

# Test API
curl https://api.connecthub.com/api/v1/docs

# Load test with Apache Bench
ab -n 1000 -c 100 https://api.connecthub.com/health
```

---

## 🔄 CI/CD WITH GITHUB ACTIONS

See separate GitHub Actions workflow file for automated deployments.

---

## 📞 SUPPORT

For deployment issues:
1. Check CloudWatch Logs
2. Verify security group rules
3. Check ECS service events
4. Review task definition

---

**Last Updated:** January 22, 2026
**Version:** 1.0.0
**Estimated Deployment Time:** 2-4 hours
