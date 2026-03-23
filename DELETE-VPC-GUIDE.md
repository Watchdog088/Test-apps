# 🚨 VPC Limit Reached - How to Delete Unused VPCs

## ❌ The Error

```
[ERROR] VPC limit reached (5/5)
```

AWS limits you to **5 VPCs per region** by default. You need to delete an unused VPC to proceed.

---

## ✅ SOLUTION: Delete Unused VPC

### **Option 1: Use AWS Console (Easiest)**

1. **Go to VPC Console:**
   https://console.aws.amazon.com/vpc/

2. **View Your VPCs:**
   - Click "Your VPCs" in the left sidebar
   - You'll see a list of all 5 VPCs

3. **Identify Unused VPCs:**
   Look for VPCs that:
   - Have no associated resources
   - Are not the "default" VPC
   - Don't have "connecthub" in the name (if you want to keep old ones)

4. **Delete VPC and Dependencies:**
   ```
   For each unused VPC:
   a) Select the VPC
   b) Click "Actions" → "Delete VPC"
   c) AWS will show you what will be deleted:
      - Subnets
      - Route tables  
      - Internet gateways
      - Security groups
      - Network ACLs
   d) Type "delete" to confirm
   e) Click "Delete"
   ```

5. **Verify Deletion:**
   - Refresh the VPC list
   - You should now have 4/5 VPCs
   - Run the deployment script again

---

### **Option 2: Use AWS CLI (Faster)**

#### List All VPCs:
```batch
aws ec2 describe-vpcs --query "Vpcs[*].[VpcId,Tags[?Key=='Name'].Value|[0],IsDefault]" --output table
```

#### Delete a Specific VPC:
```batch
REM Replace vpc-xxxxx with the VPC ID you want to delete
aws ec2 delete-vpc --vpc-id vpc-xxxxx
```

**Note:** You may need to manually delete dependencies first (subnets, internet gateways, etc.)

---

### **Option 3: Request Limit Increase**

If you need more than 5 VPCs:

1. Go to: https://console.aws.amazon.com/servicequotas/
2. Search for "VPCs per Region"
3. Click "Request quota increase"
4. Enter new limit (e.g., 10)
5. Submit request
6. Wait for approval (usually 1-2 days)

---

## 🎯 Which VPC Should I Delete?

### **Safe to Delete:**
- VPCs with no EC2 instances
- VPCs with no RDS databases
- VPCs with no ElastiCache clusters
- Test/development VPCs
- VPCs you created accidentally

### **DO NOT Delete:**
- The **default VPC** (usually has name "default")
- VPCs with running applications
- VPCs with production databases
- VPCs you're actively using

---

## 🔍 Check What's Using a VPC

Before deleting, check dependencies:

```batch
REM Check subnets
aws ec2 describe-subnets --filters "Name=vpc-id,Values=vpc-xxxxx"

REM Check EC2 instances
aws ec2 describe-instances --filters "Name=vpc-id,Values=vpc-xxxxx"

REM Check RDS databases
aws rds describe-db-instances --query "DBInstances[?DBSubnetGroup.VpcId=='vpc-xxxxx']"

REM Check security groups
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=vpc-xxxxx"
```

---

## 📋 Step-by-Step Deletion Process

### 1. Delete Internet Gateways
```batch
REM List IGWs for the VPC
aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=vpc-xxxxx"

REM Detach IGW
aws ec2 detach-internet-gateway --internet-gateway-id igw-xxxxx --vpc-id vpc-xxxxx

REM Delete IGW
aws ec2 delete-internet-gateway --internet-gateway-id igw-xxxxx
```

### 2. Delete Subnets
```batch
REM List subnets
aws ec2 describe-subnets --filters "Name=vpc-id,Values=vpc-xxxxx" --query "Subnets[*].SubnetId" --output text

REM Delete each subnet
aws ec2 delete-subnet --subnet-id subnet-xxxxx
```

### 3. Delete Security Groups
```batch
REM List security groups (except default)
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=vpc-xxxxx" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text

REM Delete each security group
aws ec2 delete-security-group --group-id sg-xxxxx
```

### 4. Delete VPC
```batch
aws ec2 delete-vpc --vpc-id vpc-xxxxx
```

---

## ⚡ Quick Clean Script

Save this as `delete-vpc.bat`:

```batch
@echo off
set VPC_ID=vpc-xxxxx

echo Deleting dependencies for VPC: %VPC_ID%

REM Get and detach IGW
for /f %%i in ('aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=%VPC_ID%" --query "InternetGateways[0].InternetGatewayId" --output text') do (
    aws ec2 detach-internet-gateway --internet-gateway-id %%i --vpc-id %VPC_ID%
    aws ec2 delete-internet-gateway --internet-gateway-id %%i
)

REM Delete subnets
for /f %%i in ('aws ec2 describe-subnets --filters "Name=vpc-id,Values=%VPC_ID%" --query "Subnets[*].SubnetId" --output text') do (
    aws ec2 delete-subnet --subnet-id %%i
)

REM Delete security groups
for /f %%i in ('aws ec2 describe-security-groups --filters "Name=vpc-id,Values=%VPC_ID%" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text') do (
    aws ec2 delete-security-group --group-id %%i
)

REM Delete VPC
aws ec2 delete-vpc --vpc-id %VPC_ID%

echo VPC deleted successfully!
pause
```

---

## 🚦 After Deletion

1. **Verify VPC count:**
   ```batch
   aws ec2 describe-vpcs --query "length(Vpcs)"
   ```
   Should show 4 (or less)

2. **Run deployment script again:**
   ```batch
   deploy-databases-FIXED-NOW.bat
   ```

3. **Type YES** when prompted

4. **Script will create new VPC** and deploy databases

---

## 💡 Prevention Tips

1. **Tag your VPCs** with clear names:
   ```batch
   aws ec2 create-tags --resources vpc-xxxxx --tags Key=Name,Value=my-project-vpc Key=Environment,Value=production
   ```

2. **Delete test VPCs** immediately after testing

3. **Keep a VPC inventory** document

4. **Use CloudFormation** to track VPC resources

---

## 🔄 Alternative: Reuse Existing VPC

Instead of creating a new VPC, you can deploy into an existing one:

1. Find your existing VPC ID:
   ```batch
   aws ec2 describe-vpcs --query "Vpcs[*].[VpcId,Tags[?Key=='Name'].Value|[0]]" --output table
   ```

2. Manually edit `.aws-vpc-id` file:
   ```batch
   echo vpc-your-existing-id > .aws-vpc-id
   ```

3. Run deployment:
   ```batch
   deploy-databases-FIXED-NOW.bat
   ```

**Note:** This will create resources in the existing VPC

---

## Summary

**Problem:** AWS account has 5/5 VPCs (limit reached)

**Solution:** Delete an unused VPC via AWS Console or CLI

**Quick Steps:**
1. Go to: https://console.aws.amazon.com/vpc/
2. Select unused VPC
3. Actions → Delete VPC
4. Confirm deletion
5. Run `deploy-databases-FIXED-NOW.bat` again

---

*Last Updated: March 23, 2026*
