# Quick Start: AWS Database Deployment

## 🎯 PROBLEM & SOLUTION

**Problem:** Your databases are running locally (Docker) and NOT deployed to AWS.  
**Solution:** Run `deploy-databases-to-aws.bat` to deploy all databases to AWS.

---

## ⚡ QUICK START (3 Steps)

### Step 1: Deploy Databases
```cmd
cd C:\Users\Jnewball\Test-apps\Test-apps
deploy-databases-to-aws.bat
```

**What it does:**
- Creates AWS VPC and networking
- Deploys PostgreSQL (RDS)
- Deploys Redis (ElastiCache)  
- Creates S3 storage buckets
- Stores credentials in AWS Secrets Manager

**Time:** 10-15 minutes  
**Cost:** ~$33/month (FREE with AWS Free Tier for 12 months)

### Step 2: Initialize Database
```cmd
cd ConnectHub-Backend
copy ..\.env.production .env
npx prisma migrate deploy --schema prisma/schema-enhanced.prisma
```

### Step 3: Verify
```cmd
aws rds describe-db-instances --db-instance-identifier connecthub-db-prod
```

---

## 📋 CURRENT STATUS

| Component | Status | Location |
|-----------|--------|----------|
| Frontend | ✅ DEPLOYED | AWS S3 (lynkapp.net) |
| PostgreSQL | ❌ NOT DEPLOYED | Local Docker |
| Redis | ❌ NOT DEPLOYED | Local Docker |
| MongoDB | ❌ NOT DEPLOYED | Local Docker |
| File Storage | ❌ NOT DEPLOYED | None |

**After running the script:**

| Component | Status | Location |
|-----------|--------|----------|
| Frontend | ✅ DEPLOYED | AWS S3 (lynkapp.net) |
| PostgreSQL | ✅ DEPLOYED | AWS RDS |
| Redis | ✅ DEPLOYED | AWS ElastiCache |
| File Storage | ✅ DEPLOYED | AWS S3 |

---

## 💰 COST SUMMARY

### With AWS Free Tier (First 12 Months)
**Total: $0/month**

- RDS PostgreSQL: FREE (750 hours/month)
- ElastiCache Redis: FREE (750 hours/month)
- S3 Storage: FREE (5GB)

### After Free Tier Expires
**Total: ~$33/month**

- RDS PostgreSQL: $15/month
- ElastiCache Redis: $12/month
- S3 Storage: $5/month
- Secrets Manager: $0.50/month

---

## 📁 GENERATED FILES

After deployment, you'll have:

1. **`.env.production`** - All database connection strings
2. **`.aws-deployment-info.txt`** - Deployment metadata
3. **`.aws-vpc-id`** - VPC identifier
4. **`.aws-db-endpoint`** - Database endpoint
5. **`.aws-redis-endpoint`** - Redis endpoint

---

## 🔐 SECURITY

- All databases in **private subnets** (not publicly accessible)
- Credentials stored in **AWS Secrets Manager**
- **Encrypted** at rest and in transit
- **Automated backups** enabled

---

## ✅ VERIFICATION COMMANDS

Check RDS:
```cmd
aws rds describe-db-instances --db-instance-identifier connecthub-db-prod --query "DBInstances[0].DBInstanceStatus"
```

Check Redis:
```cmd
aws elasticache describe-cache-clusters --cache-cluster-id connecthub-redis-prod --query "CacheClusters[0].CacheClusterStatus"
```

Check S3:
```cmd
aws s3 ls | findstr connecthub
```

---

## 🆘 TROUBLESHOOTING

### "VPC limit exceeded"
**Fix:** Delete unused VPCs or request limit increase from AWS Support

### "Insufficient instance capacity"
**Fix:** Try a different region or wait a few minutes and retry

### "Access Denied"
**Fix:** Run `aws configure` and enter your credentials

---

## 📚 MORE DOCUMENTATION

- **DATABASE-DEPLOYMENT-STATUS-AND-FIX.md** - Complete guide with troubleshooting
- **AWS-DEPLOYMENT-GUIDE.md** - Full AWS architecture and deployment
- **docker-compose-databases.yml** - Local database configuration

---

## 🎉 NEXT STEPS

1. ✅ Deploy databases to AWS
2. ⏭️ Initialize database schema
3. ⏭️ Deploy backend API to AWS ECS/EC2
4. ⏭️ Update frontend to use production API
5. ⏭️ Set up monitoring (CloudWatch)

---

**Need Help?** Check `DATABASE-DEPLOYMENT-STATUS-AND-FIX.md` for detailed troubleshooting and step-by-step instructions.
