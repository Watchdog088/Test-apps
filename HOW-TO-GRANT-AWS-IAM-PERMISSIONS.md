# How to Grant AWS IAM Permissions - Step-by-Step Guide

## 🎯 Goal
Fix the "Cannot query VPCs. Insufficient AWS permissions" error by granting your AWS user the necessary permissions.

---

## 📋 Prerequisites
- AWS Console access
- Your AWS account username/email
- Admin access to AWS IAM (or ask your administrator to do this)

---

## 🚀 Method 1: Quick Fix - Attach PowerUserAccess (RECOMMENDED)

This is the fastest and easiest solution for development/testing.

### **Step 1: Log into AWS Console**
1. Go to: **https://console.aws.amazon.com/**
2. Sign in with your AWS account credentials
3. Make sure you're in the **us-east-1** region (check top-right corner)

### **Step 2: Open IAM Console**
1. In the search bar at the top, type: **IAM**
2. Click on **IAM** (Identity and Access Management)
3. Or go directly to: **https://console.aws.amazon.com/iam/**

### **Step 3: Find Your User**
1. In the left sidebar, click **Users**
2. You'll see a list of IAM users
3. **Find and click on YOUR username** (the one you're using for AWS CLI)

**💡 How to check which user you're using:**
```batch
aws sts get-caller-identity
```
This shows your UserName/Arn - use this to find yourself in the IAM users list.

### **Step 4: Attach PowerUserAccess Policy**
1. Once you're viewing your user, click the **Permissions** tab
2. Click the blue **Add permissions** button
3. Select **Attach policies directly**
4. In the search box, type: **PowerUserAccess**
5. **Check the box** next to **PowerUserAccess** policy
6. Scroll down and click **Next**
7. Click **Add permissions** button

✅ **Done!** You now have sufficient permissions to deploy databases.

### **Step 5: Test Your Permissions**
```batch
# Run this command to verify
aws ec2 describe-vpcs

# If it works without errors, you're good to go!
```

### **Step 6: Run the Fixed Deployment Script**
```batch
deploy-databases-to-aws-ULTIMATE-FIX.bat
```

---

## 🔧 Method 2: Specific Permissions Only (More Restrictive)

If you can't use PowerUserAccess or want minimal permissions, attach these individual policies:

### **Step 1-3: Same as Method 1** (Log in, go to IAM, find your user)

### **Step 4: Attach Multiple Policies**
1. Click **Add permissions** → **Attach policies directly**
2. Search and check these policies one by one:
   - ✅ **AmazonEC2FullAccess**
   - ✅ **AmazonRDSFullAccess**
   - ✅ **AmazonElastiCacheFullAccess**
   - ✅ **AmazonS3FullAccess**
   - ✅ **SecretsManagerReadWrite**
3. Click **Next** → **Add permissions**

---

## 🛠️ Method 3: Create Custom Policy (Advanced)

If you need fine-grained control, create a custom policy with only required permissions.

### **Step 1: Go to IAM Policies**
1. In AWS Console, go to **IAM** → **Policies** (left sidebar)
2. Click **Create policy**
3. Click the **JSON** tab

### **Step 2: Paste This Policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EC2VPCAccess",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeVpcs",
        "ec2:CreateVpc",
        "ec2:ModifyVpcAttribute",
        "ec2:DescribeSubnets",
        "ec2:CreateSubnet",
        "ec2:DescribeSecurityGroups",
        "ec2:CreateSecurityGroup",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:DescribeInternetGateways",
        "ec2:CreateInternetGateway",
        "ec2:AttachInternetGateway",
        "ec2:DescribeRouteTables",
        "ec2:CreateRouteTable",
        "ec2:CreateRoute",
        "ec2:AssociateRouteTable",
        "ec2:CreateTags",
        "ec2:DescribeAvailabilityZones"
      ],
      "Resource": "*"
    },
    {
      "Sid": "RDSAccess",
      "Effect": "Allow",
      "Action": [
        "rds:CreateDBInstance",
        "rds:DescribeDBInstances",
        "rds:CreateDBSubnetGroup",
        "rds:DescribeDBSubnetGroups"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ElastiCacheAccess",
      "Effect": "Allow",
      "Action": [
        "elasticache:CreateCacheCluster",
        "elasticache:DescribeCacheClusters",
        "elasticache:CreateCacheSubnetGroup"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:PutBucketVersioning",
        "s3:PutBucketCors",
        "s3:PutBucketPolicy",
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SecretsManagerAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:UpdateSecret",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

### **Step 3: Name and Create Policy**
1. Click **Next: Tags** (skip tags)
2. Click **Next: Review**
3. Policy name: **ConnectHubDatabaseDeployment**
4. Description: **Permissions for deploying ConnectHub database infrastructure**
5. Click **Create policy**

### **Step 4: Attach to Your User**
1. Go to **IAM** → **Users** → **Your username**
2. Click **Add permissions** → **Attach policies directly**
3. Search for: **ConnectHubDatabaseDeployment**
4. Check the box and click **Add permissions**

---

## 🔍 Troubleshooting

### **Problem: "I can't see the IAM section"**
**Solution**: You don't have admin access. Ask your AWS account administrator to:
1. Go to IAM → Users → Your username
2. Attach the **PowerUserAccess** policy
3. Or send them this document

### **Problem: "Which user am I?"**
**Solution**: Run this command to find your username:
```batch
aws sts get-caller-identity
```
Look for the "Arn" line - your username is after "user/":
```
arn:aws:iam::123456789:user/YourUsername
                              ^^^^^^^^^^^
```

### **Problem: "I'm still getting permission errors"**
**Solution**: 
1. Make sure you attached the policy to the CORRECT user
2. Wait 1-2 minutes for permissions to propagate
3. Run `aws configure` to verify you're using the right credentials
4. Try logging out and back into AWS CLI:
   ```batch
   aws configure
   # Re-enter your Access Key ID and Secret Access Key
   ```

### **Problem: "I can't attach policies (Access Denied)"**
**Solution**: You need someone with Administrator access to grant you permissions. Options:
1. Ask your AWS account owner/administrator
2. If you're the account owner, use root user temporarily:
   - Log in with root account email
   - Grant permissions to your IAM user
   - Log out and use IAM user again

---

## ✅ Verification Steps

After granting permissions, verify they work:

### **Test 1: VPC Access**
```batch
aws ec2 describe-vpcs
```
✅ **Success**: Shows list of VPCs or empty list (no error)
❌ **Fail**: "UnauthorizedOperation" or "AccessDenied" error

### **Test 2: RDS Access**
```batch
aws rds describe-db-instances
```
✅ **Success**: Shows DB instances or empty list
❌ **Fail**: Permission error

### **Test 3: S3 Access**
```batch
aws s3 ls
```
✅ **Success**: Shows your S3 buckets
❌ **Fail**: Permission error

### **Test 4: Run Deployment**
```batch
deploy-databases-to-aws-ULTIMATE-FIX.bat
```
✅ **Success**: Script proceeds past VPC check
❌ **Fail**: Still shows permission error

---

## 📸 Visual Guide (What You Should See)

### **1. IAM Console - Users List**
```
┌─────────────────────────────────────────┐
│  IAM > Users                            │
├─────────────────────────────────────────┤
│  🔍 Search users...                     │
├─────────────────────────────────────────┤
│  ☐ admin                                │
│  ☐ developer         ← YOUR USER        │
│  ☐ test-user                            │
└─────────────────────────────────────────┘
```

### **2. User Permissions Tab**
```
┌─────────────────────────────────────────────────┐
│  developer                                      │
├─────────────────────────────────────────────────┤
│  [Permissions] [Groups] [Tags] [Security]       │
├─────────────────────────────────────────────────┤
│  Permissions policies (0)                       │
│  No policies attached                           │
│                                                 │
│  [+ Add permissions] ← CLICK HERE               │
└─────────────────────────────────────────────────┘
```

### **3. Add Permissions Screen**
```
┌─────────────────────────────────────────────────┐
│  Grant permissions                              │
├─────────────────────────────────────────────────┤
│  ⦿ Attach policies directly  ← SELECT THIS     │
│  ○ Add user to group                            │
│  ○ Copy permissions                             │
├─────────────────────────────────────────────────┤
│  🔍 Filter policies: PowerUserAccess            │
│                                                 │
│  ☑ PowerUserAccess ← CHECK THIS BOX            │
│     AWS managed - job function                  │
│                                                 │
│  [Next] ← CLICK NEXT                            │
└─────────────────────────────────────────────────┘
```

### **4. Review and Confirm**
```
┌─────────────────────────────────────────────────┐
│  Review and confirm                             │
├─────────────────────────────────────────────────┤
│  Permissions to add:                            │
│  • PowerUserAccess                              │
│                                                 │
│  [Add permissions] ← FINAL CLICK                │
└─────────────────────────────────────────────────┘
```

### **5. Success Message**
```
┌─────────────────────────────────────────────────┐
│  ✅ Permissions added successfully              │
│                                                 │
│  developer now has PowerUserAccess              │
└─────────────────────────────────────────────────┘
```

---

## 🎯 What Each Permission Does

| Permission | Why You Need It | Used For |
|-----------|-----------------|----------|
| **ec2:DescribeVpcs** | Query existing VPCs | Check VPC limits, verify VPC exists |
| **ec2:CreateVpc** | Create new VPC | Database network isolation |
| **ec2:CreateSubnet** | Create subnets | Public/private network zones |
| **ec2:CreateSecurityGroup** | Firewall rules | Database access control |
| **rds:CreateDBInstance** | Deploy database | PostgreSQL instance |
| **elasticache:CreateCacheCluster** | Deploy cache | Redis instance |
| **s3:CreateBucket** | File storage | Upload/media storage |
| **secretsmanager:CreateSecret** | Store credentials | Secure password storage |

---

## 🔐 Security Best Practices

### ✅ DO:
- Use **PowerUserAccess** for development/testing
- Create separate IAM user for deployments (not root user)
- Enable MFA (Multi-Factor Authentication) on your user
- Regularly review attached policies
- Remove unused permissions

### ❌ DON'T:
- Share AWS access keys in code or git repositories
- Use root account for daily operations
- Give more permissions than needed in production
- Leave old/unused access keys active

---

## 📞 Still Need Help?

### **Option 1: AWS Support**
- Free tier: Community forums
- Paid: Open support ticket in AWS Console

### **Option 2: Ask Your Team**
If this is a company AWS account:
1. Contact your DevOps team
2. Ask your AWS administrator
3. Check your company's AWS documentation

### **Option 3: Verify Credentials**
Your AWS CLI might be using the wrong credentials:
```batch
# Check which credentials you're using
aws configure list

# Check who you are
aws sts get-caller-identity

# Reconfigure if needed
aws configure
```

---

## ✅ Success Checklist

Before running the deployment script again:

- [ ] Logged into AWS Console
- [ ] Opened IAM → Users
- [ ] Found your IAM username
- [ ] Attached **PowerUserAccess** policy (or equivalent)
- [ ] Waited 1-2 minutes for permissions to propagate
- [ ] Tested with: `aws ec2 describe-vpcs`
- [ ] No errors from test command
- [ ] Ready to run: `deploy-databases-to-aws-ULTIMATE-FIX.bat`

---

## 🎉 After Permissions Are Granted

Once you have the right permissions, run:

```batch
deploy-databases-to-aws-ULTIMATE-FIX.bat
```

The script will now:
1. ✅ Check AWS CLI (should pass)
2. ✅ Check credentials (should pass)
3. ✅ Query VPCs (should pass - this was failing before!)
4. ✅ Create VPC
5. ✅ Deploy databases
6. ✅ Complete successfully!

---

**Last Updated**: February 9, 2026  
**Script Version**: ULTIMATE-FIX v1.0

---

## 📝 Quick Reference Card

```
┌──────────────────────────────────────────────────┐
│  QUICK FIX FOR VPC PERMISSION ERROR              │
├──────────────────────────────────────────────────┤
│  1. Go to: https://console.aws.amazon.com/iam/   │
│  2. Click: Users → Your username                 │
│  3. Click: Add permissions                       │
│  4. Select: Attach policies directly             │
│  5. Search: PowerUserAccess                      │
│  6. Check box and click: Add permissions         │
│  7. Wait 1 minute                                │
│  8. Run: deploy-databases-to-aws-ULTIMATE-FIX.bat│
└──────────────────────────────────────────────────┘
```

**That's it! Follow these steps and your permission error will be fixed!** 🎉
