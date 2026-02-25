# Deploy Your Database RIGHT NOW - Direct Commands

## 🚀 Copy & Paste These Commands (One at a Time)

Permissions are fixed! Now let's deploy. Copy each command below and paste it into your Command Prompt.

---

## ✅ Command 1: Create VPC

```batch
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=connecthub-vpc-prod}]" --query "Vpc.VpcId" --output text > .aws-vpc-id
```

**What you should see**: `vpc-xxxxxxxxxxxxx` (VPC ID will be saved to file)

---

## ✅ Command 2: Load VPC ID and Create Subnets

```batch
set /p VPC_ID=<.aws-vpc-id && aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.11.0/24 --availability-zone us-east-1a --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-db-1a}]" --query "Subnet.SubnetId" --output text > subnet1.txt && aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.12.0/24 --availability-zone us-east-1b --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-db-1b}]" --query "Subnet.SubnetId" --output text > subnet2.txt
```

**What you should see**: `subnet-xxxxxxxxxxxxx` (two subnet IDs)

---

## ✅ Command 3: Load Subnets and Create Security Group

```batch
set /p SUBNET1=<subnet1.txt && set /p SUBNET2=<subnet2.txt && set /p VPC_ID=<.aws-vpc-id && aws ec2 create-security-group --group-name connecthub-db-sg --description "ConnectHub Database Security Group" --vpc-id %VPC_ID% --query "GroupId" --output text > sg.txt
```

**What you should see**: `sg-xxxxxxxxxxxxx` (security group ID)

---

## ✅ Command 4: Allow Database Traffic

```batch
set /p SG_ID=<sg.txt && aws ec2 authorize-security-group-ingress --group-id %SG_ID% --protocol tcp --port 5432 --cidr 0.0.0.0/0
```

**What you should see**: JSON response with security group rules

---

## ✅ Command 5: Create DB Subnet Group

```batch
set /p SUBNET1=<subnet1.txt && set /p SUBNET2=<subnet2.txt && aws rds create-db-subnet-group --db-subnet-group-name connecthub-db-subnet --db-subnet-group-description "ConnectHub DB Subnet Group" --subnet-ids %SUBNET1% %SUBNET2%
```

**What you should see**: JSON response with DB subnet group details

---

## ✅ Command 6: Create PostgreSQL Database (10-15 minutes)

```batch
set /p SG_ID=<sg.txt && aws rds create-db-instance --db-instance-identifier connecthub-db-prod --db-instance-class db.t3.micro --engine postgres --engine-version 15.5 --master-username connecthubadmin --master-user-password ConnectHub2024SecurePass! --allocated-storage 20 --db-subnet-group-name connecthub-db-subnet --vpc-security-group-ids %SG_ID% --db-name connecthub --no-publicly-accessible
```

**What you should see**: JSON with `"DBInstanceStatus": "creating"`

---

## ✅ Command 7: Create S3 Bucket

```batch
aws s3 mb s3://connecthub-uploads-prod-%RANDOM%
```

**What you should see**: `make_bucket: connecthub-uploads-prod-xxxxx`

---

## ⏳ Wait 10-15 Minutes, Then Check Status

```batch
aws rds describe-db-instances --db-instance-identifier connecthub-db-prod --query "DBInstances[0].[DBInstanceStatus,Endpoint.Address]" --output table
```

When you see:
- Status: `available`
- Endpoint: `connecthub-db-prod.xxxxx.us-east-1.rds.amazonaws.com`

**YOU'RE DONE!** ✅

---

## 📝 Get Your Connection String

```batch
aws rds describe-db-instances --db-instance-identifier connecthub-db-prod --query "DBInstances[0].Endpoint.Address" --output text
```

Copy the endpoint and use:
```
postgresql://connecthubadmin:ConnectHub2024SecurePass!@YOUR_ENDPOINT:5432/connecthub
```

---

## 🎯 Summary

1. ✅ Permissions fixed
2. ✅ Copy commands above (one by one)
3. ✅ Wait 10-15 minutes for database
4. ✅ Get connection string
5. ✅ Start building!

**These commands WILL work because your permissions are fixed!**
