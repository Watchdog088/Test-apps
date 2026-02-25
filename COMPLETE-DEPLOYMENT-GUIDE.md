# ConnectHub - Complete AWS Deployment Guide

## 🎯 Overview

This guide covers the **COMPLETE** deployment of ConnectHub to AWS, including:
- ✅ Database Infrastructure (PostgreSQL, Redis, S3)
- ✅ Backend API Server (Node.js/Express)
- ✅ Database Schema Initialization
- ✅ EC2 Server Setup

---

## 📦 What Gets Deployed

### **Database Infrastructure**
- **PostgreSQL RDS** (db.t3.micro) - Main database
- **Redis ElastiCache** (cache.t3.micro) - Caching layer
- **S3 Bucket** - File storage for uploads
- **VPC & Networking** - Secure network infrastructure
- **Security Groups** - Firewall rules

### **Backend Server**
- **EC2 Instance** (t3.small) - Backend API server
- **Node.js 18** - Runtime environment
- **PM2** - Process manager
- **Built Application** - Compiled TypeScript code
- **Database Schema** - All tables and relationships

---

## 🚀 Deployment Options

### **Option 1: Complete Deployment (Recommended)**
Deploys everything in one go - databases + backend server.

```batch
deploy-complete-to-aws.bat
```

### **Option 2: Database Only**
Only deploy the database infrastructure (if you want to deploy backend separately).

```batch
deploy-databases-to-aws-ULTIMATE-FIX.bat
```

---

## 📋 Prerequisites

### **1. AWS Account Setup**
- ✅ AWS account created
- ✅ AWS CLI installed: https://awscli.amazonaws.com/AWSCLIV2.msi
- ✅ AWS configured with credentials: `aws configure`

### **2. AWS Permissions**
Grant your IAM user these permissions (see HOW-TO-GRANT-AWS-IAM-PERMISSIONS.md):
- PowerUserAccess (recommended) OR
- EC2, RDS, ElastiCache, S3, Secrets Manager access

### **3. Local Software**
- ✅ Node.js 18+ installed: https://nodejs.org/
- ✅ Git (optional but recommended)

### **4. SSH Key Pair (For EC2 Access)**
Create an AWS key pair before deployment:

```batch
aws ec2 create-key-pair --key-name connecthub-key --query "KeyMaterial" --output text > connecthub-key.pem
```

**Important**: Keep this file safe! You'll need it to access your EC2 instance.

---

## 🎬 Step-by-Step Deployment

### **Step 1: Grant AWS Permissions**

Before deploying, ensure you have the correct permissions:

1. Go to: https://console.aws.amazon.com/iam/
2. Click: Users → Your username
3. Click: Add permissions → Attach policies directly
4. Search and attach: **PowerUserAccess**
5. Click: Add permissions

📚 **Detailed Guide**: See `HOW-TO-GRANT-AWS-IAM-PERMISSIONS.md`

---

### **Step 2: Create SSH Key Pair**

```batch
aws ec2 create-key-pair --key-name connecthub-key --query "KeyMaterial" --output text > connecthub-key.pem
```

✅ This creates a private key file for SSH access to your backend server.

---

### **Step 3: Run Complete Deployment**

```batch
deploy-complete-to-aws.bat
```

**What happens:**
1. ✅ Deploys database infrastructure (~10-15 minutes)
2. ✅ Builds backend application (~3-5 minutes)
3. ✅ Initializes database schema (~1-2 minutes)
4. ✅ Creates EC2 instance (~2-3 minutes)
5. ✅ Provides deployment instructions

**Total time**: ~20-25 minutes

---

### **Step 4: Deploy Code to EC2**

After the script completes, you'll need to manually deploy the code to EC2:

#### **On Windows (using SCP):**

```batch
# Upload files to EC2
scp -i connecthub-key.pem -r ConnectHub-Backend/dist ConnectHub-Backend/node_modules ConnectHub-Backend/package.json ConnectHub-Backend/.env.production ec2-user@YOUR_EC2_IP:/home/ec2-user/connecthub-backend/
```

#### **Connect to EC2 and Start Server:**

```batch
# Connect via SSH
ssh -i connecthub-key.pem ec2-user@YOUR_EC2_IP

# Start the application
cd connecthub-backend
pm2 start dist/server-phase1.js --name connecthub-api
pm2 save
pm2 startup
```

---

### **Step 5: Test Your Deployment**

#### **Test Database Connection:**
```batch
# Test PostgreSQL
psql "postgresql://connecthubadmin:ConnectHub2024SecurePass!@YOUR_DB_ENDPOINT:5432/connecthub"
```

#### **Test Backend API:**
```batch
# Health check
curl http://YOUR_EC2_IP:3001/health

# Should return: {"status": "ok"}
```

#### **Test Frontend Connection:**
Update your frontend API URL to: `http://YOUR_EC2_IP:3001`

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                    AWS CLOUD                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐      ┌──────────────────┐    │
│  │   VPC           │      │  Internet        │    │
│  │  10.0.0.0/16    │◄─────┤  Gateway         │    │
│  └─────────────────┘      └──────────────────┘    │
│         │                                          │
│         ├─ Public Subnets (10.0.1.0/24, 10.0.2.0/24)
│         │  └── EC2 Backend Server (Your API)      │
│         │      - Node.js + Express                │
│         │      - PM2 Process Manager              │
│         │      - Port 3001                        │
│         │                                          │
│         ├─ Private Subnets (10.0.11.0/24, 10.0.12.0/24)
│         │  ├── RDS PostgreSQL                     │
│         │  │   - Main Database                    │
│         │  │   - Port 5432                        │
│         │  │                                       │
│         │  └── ElastiCache Redis                  │
│         │      - Cache Layer                      │
│         │      - Port 6379                        │
│         │                                          │
│         └─ S3 Bucket                               │
│            - File Storage                          │
│            - User uploads                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 💰 Cost Breakdown

### **Monthly Costs** (US East 1)

| Service | Configuration | Cost | Free Tier |
|---------|--------------|------|-----------|
| **RDS PostgreSQL** | db.t3.micro | $15/month | FREE (750 hrs) |
| **ElastiCache Redis** | cache.t3.micro | $12/month | Not eligible |
| **EC2 Backend** | t3.small | $15/month | FREE (750 hrs) |
| **S3 Storage** | 100GB | $5/month | FREE (5GB) |
| **Data Transfer** | 10GB out | $1/month | FREE (100GB) |
| **Total** | | **$48/month** | **~$12/month** |

**With AWS Free Tier (first 12 months)**: ~$12/month
**After Free Tier**: ~$48/month

---

## 📁 Files Created During Deployment

After successful deployment, these files will be created:

### **In Project Root:**
- ✅ `.env.production` - Production environment variables
- ✅ `.aws-vpc-id` - VPC identifier
- ✅ `.aws-db-endpoint` - PostgreSQL endpoint
- ✅ `.aws-redis-endpoint` - Redis endpoint  
- ✅ `.aws-uploads-bucket` - S3 bucket name
- ✅ `.aws-backend-instance-id` - EC2 instance ID
- ✅ `.aws-backend-ip` - Backend server public IP
- ✅ `.aws-deployment-info.txt` - Complete deployment details

### **In ConnectHub-Backend:**
- ✅ `dist/` - Compiled TypeScript application
- ✅ `.env.production` - Backend environment config
- ✅ `node_modules/` - Dependencies

---

## 🔧 Post-Deployment Configuration

### **1. Update Frontend API URL**

Update `ConnectHub-Frontend/.env`:
```env
REACT_APP_API_URL=http://YOUR_EC2_IP:3001
```

### **2. Set Up Domain (Optional)**

Point your domain to the EC2 public IP:
```
api.yourdomain.com → YOUR_EC2_IP
```

### **3. Enable HTTPS (Recommended)**

Use AWS Certificate Manager + Application Load Balancer for SSL.

### **4. Set Up Monitoring**

Enable CloudWatch monitoring for:
- EC2 CPU/Memory usage
- RDS connections
- Redis cache hits
- S3 storage usage

---

## 🛠️ Troubleshooting

### **Problem: "Cannot query VPCs"**
**Solution**: Grant IAM permissions (see HOW-TO-GRANT-AWS-IAM-PERMISSIONS.md)

### **Problem: "VPC limit reached"**
**Solution**: Delete unused VPCs or request limit increase

### **Problem: "Failed to create EC2 instance"**
**Solution**: Create SSH key pair first:
```batch
aws ec2 create-key-pair --key-name connecthub-key --query "KeyMaterial" --output text > connecthub-key.pem
```

### **Problem: "Database migration failed"**
**Solution**: Check database endpoint is correct and accessible:
```batch
psql "postgresql://connecthubadmin:ConnectHub2024SecurePass!@YOUR_ENDPOINT:5432/connecthub"
```

### **Problem: "Backend not responding"**
**Solution**: 
1. Check EC2 security group allows port 3001
2. Verify PM2 process is running: `pm2 status`
3. Check logs: `pm2 logs connecthub-api`

---

## 📞 Getting Help

### **Check Deployment Status:**
```batch
# VPC
aws ec2 describe-vpcs --vpc-ids $(cat .aws-vpc-id)

# RDS Database
aws rds describe-db-instances --db-instance-identifier connecthub-db-prod

# EC2 Backend
aws ec2 describe-instances --instance-ids $(cat .aws-backend-instance-id)

# Redis Cache
aws elasticache describe-cache-clusters --cache-cluster-id connecthub-redis-prod
```

### **View Logs:**
```batch
# Connect to EC2
ssh -i connecthub-key.pem ec2-user@YOUR_EC2_IP

# View PM2 logs
pm2 logs connecthub-api

# View system logs
sudo journalctl -u pm2-ec2-user
```

### **Restart Services:**
```batch
# Connect to EC2
ssh -i connecthub-key.pem ec2-user@YOUR_EC2_IP

# Restart backend
pm2 restart connecthub-api

# Or reload (zero-downtime)
pm2 reload connecthub-api
```

---

## 🔄 Updating Your Deployment

### **Update Backend Code:**

```batch
# On local machine
cd ConnectHub-Backend
npm run build

# Upload to EC2
scp -i connecthub-key.pem -r dist ec2-user@YOUR_EC2_IP:/home/ec2-user/connecthub-backend/

# Restart on EC2
ssh -i connecthub-key.pem ec2-user@YOUR_EC2_IP
pm2 reload connecthub-api
```

### **Update Database Schema:**

```batch
# On local machine
cd ConnectHub-Backend
npx prisma migrate deploy --schema prisma/schema-enhanced.prisma
```

---

## 🗑️ Cleanup / Teardown

To delete all AWS resources and stop incurring costs:

### **1. Delete EC2 Instance:**
```batch
aws ec2 terminate-instances --instance-ids $(cat .aws-backend-instance-id)
```

### **2. Delete RDS Database:**
```batch
aws rds delete-db-instance --db-instance-identifier connecthub-db-prod --skip-final-snapshot
```

### **3. Delete Redis Cluster:**
```batch
aws elasticache delete-cache-cluster --cache-cluster-id connecthub-redis-prod
```

### **4. Delete S3 Bucket:**
```batch
aws s3 rb s3://$(cat .aws-uploads-bucket) --force
```

### **5. Delete VPC and Networking:**
```batch
# This will fail if resources still exist - delete them first
aws ec2 delete-vpc --vpc-id $(cat .aws-vpc-id)
```

---

## 📚 Additional Resources

- **HOW-TO-GRANT-AWS-IAM-PERMISSIONS.md** - IAM permission setup
- **VPC-ERROR-FIX-DOCUMENTATION.md** - VPC error troubleshooting
- **AWS-DEPLOYMENT-GUIDE.md** - General AWS deployment info
- **PHASE1-CRITICAL-INFRASTRUCTURE-DEPLOYMENT-GUIDE.md** - Infrastructure details

---

## ✅ Deployment Checklist

Use this checklist to track your deployment:

- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] IAM permissions granted (PowerUserAccess)
- [ ] Node.js 18+ installed locally
- [ ] SSH key pair created (`connecthub-key.pem`)
- [ ] Run `deploy-complete-to-aws.bat`
- [ ] Database deployment completed
- [ ] Backend build completed
- [ ] Database schema initialized
- [ ] EC2 instance created
- [ ] Code deployed to EC2
- [ ] Backend started with PM2
- [ ] API health check passed
- [ ] Frontend API URL updated
- [ ] Test complete end-to-end flow

---

## 🎉 Success Indicators

You'll know deployment succeeded when:

✅ Script completes without errors
✅ All AWS resources show as "Available" or "Running"
✅ Health check returns 200 OK: `curl http://YOUR_EC2_IP:3001/health`
✅ Database accepts connections
✅ Frontend can communicate with backend
✅ File uploads work to S3

---

**Deployment Date**: February 2026  
**Version**: Complete Deployment v1.0  
**Estimated Time**: 20-25 minutes  
**Estimated Cost**: $12-48/month  

**🚀 Happy Deploying!**
