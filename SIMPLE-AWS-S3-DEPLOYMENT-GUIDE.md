# Simple AWS S3 Deployment Guide
**Deploy ConnectHub_Mobile_Design.html to AWS in 30 Minutes**

---

## 📋 WHAT YOU'LL DEPLOY

- **File**: `ConnectHub_Mobile_Design.html`
- **Service**: AWS S3 (Static Website Hosting)
- **Cost**: ~$0.50 - $2.00 per month
- **Result**: A public URL where your HTML file is accessible worldwide

---

## 🎯 DEPLOYMENT OVERVIEW

```
Your Computer → AWS CLI → S3 Bucket → Public Website URL
```

---

## STEP 1: Install AWS CLI (5 minutes)

### Download & Install

1. **Open your web browser** and go to:
   ```
   https://awscli.amazonaws.com/AWSCLIV2.msi
   ```

2. **Download the MSI installer** (it will download automatically)

3. **Run the installer**:
   - Double-click `AWSCLIV2.msi`
   - Click "Next" → "Next" → "Install"
   - Click "Finish"

4. **Verify installation**:
   - Open a **NEW Command Prompt** (close any old ones)
   - Run:
     ```cmd
     aws --version
     ```
   - You should see something like: `aws-cli/2.x.x Python/3.x.x Windows/...`

---

## STEP 2: Create AWS Account (10 minutes if you don't have one)

### If You Don't Have an AWS Account:

1. Go to: https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Fill in:
   - Email address
   - Password
   - Account name
4. Choose "Personal" account
5. Enter credit card info (required, but you'll stay in free tier)
6. Verify phone number
7. Select "Basic Support - Free"

### Free Tier Benefits:
- 5 GB of S3 storage (FREE for 12 months)
- 20,000 GET requests per month (FREE)
- 2,000 PUT requests per month (FREE)
- Perfect for hosting HTML files!

---

## STEP 3: Create IAM User & Get Access Keys (5 minutes)

### Why IAM User?
- More secure than using root account
- You can delete/rotate keys if needed

### Steps:

1. **Log into AWS Console**: https://console.aws.amazon.com/

2. **Navigate to IAM**:
   - Search for "IAM" in the top search bar
   - Click "IAM" (Identity and Access Management)

3. **Create User**:
   - Click "Users" in left sidebar
   - Click "Create user"
   - Enter username: `connecthub-deployer`
   - Click "Next"

4. **Set Permissions**:
   - Select "Attach policies directly"
   - Search for and check: `AmazonS3FullAccess`
   - Click "Next"
   - Click "Create user"

5. **Create Access Keys**:
   - Click on the user you just created (`connecthub-deployer`)
   - Click "Security credentials" tab
   - Scroll to "Access keys"
   - Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - Check the confirmation box
   - Click "Next"
   - Add description: "ConnectHub deployment"
   - Click "Create access key"

6. **IMPORTANT - Save Your Keys**:
   ```
   Access Key ID: AKIA........................
   Secret Access Key: wJalrXUtn........................
   ```
   **Copy these NOW** - you won't see the secret again!

---

## STEP 4: Configure AWS CLI (2 minutes)

1. **Open Command Prompt**

2. **Run configuration command**:
   ```cmd
   aws configure
   ```

3. **Enter your information** when prompted:
   ```
   AWS Access Key ID [None]: PASTE_YOUR_ACCESS_KEY_HERE
   AWS Secret Access Key [None]: PASTE_YOUR_SECRET_KEY_HERE
   Default region name [None]: us-east-1
   Default output format [None]: json
   ```

4. **Verify configuration**:
   ```cmd
   aws s3 ls
   ```
   - Should show empty list (no buckets yet) or existing buckets
   - If you see error, check your keys

---

## STEP 5: Deploy Your HTML File (5 minutes)

### Option A: Automatic Deployment (Recommended)

1. **Navigate to your project folder**:
   ```cmd
   cd C:\Users\Jnewball\Test-apps\Test-apps
   ```

2. **Run the deployment script**:
   ```cmd
   deploy-to-s3.bat
   ```
   
3. **Follow the prompts** and your site will be live!

### Option B: Manual Deployment

If the script doesn't work, follow these manual steps:

#### Step 5.1: Create S3 Bucket

```cmd
aws s3 mb s3://connecthub-mobile-design-2026 --region us-east-1
```

**Note**: Bucket names must be globally unique. If this fails, try:
- `connecthub-mobile-design-yourname`
- `connecthub-demo-yourname`
- Add random numbers: `connecthub-12345`

#### Step 5.2: Upload HTML File

```cmd
aws s3 cp ConnectHub_Mobile_Design.html s3://connecthub-mobile-design-2026/ --acl public-read
```

#### Step 5.3: Configure Static Website Hosting

```cmd
aws s3 website s3://connecthub-mobile-design-2026/ --index-document ConnectHub_Mobile_Design.html
```

#### Step 5.4: Set Bucket Policy for Public Access

Create file `bucket-policy.json` with this content (replace BUCKET_NAME):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}
```

Apply the policy:

```cmd
aws s3api put-bucket-policy --bucket connecthub-mobile-design-2026 --policy file://bucket-policy.json
```

#### Step 5.5: Disable Block Public Access

```cmd
aws s3api put-public-access-block --bucket connecthub-mobile-design-2026 --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

---

## STEP 6: Access Your Website! 🎉

Your website will be available at:

```
http://connecthub-mobile-design-2026.s3-website-us-east-1.amazonaws.com
```

**URL Format**:
```
http://[BUCKET-NAME].s3-website-[REGION].amazonaws.com
```

---

## 🔄 UPDATE YOUR WEBSITE

Whenever you make changes to your HTML file:

```cmd
cd C:\Users\Jnewball\Test-apps\Test-apps
aws s3 cp ConnectHub_Mobile_Design.html s3://connecthub-mobile-design-2026/ --acl public-read
```

Or simply run:
```cmd
update-s3.bat
```

---

## 🌐 OPTIONAL: Add Custom Domain

### If You Have a Domain Name:

1. **In AWS Route 53**:
   - Create hosted zone for your domain
   - Add A record pointing to S3 bucket

2. **In AWS CloudFront** (for HTTPS):
   - Create distribution
   - Point to S3 bucket
   - Add SSL certificate

3. **Cost**: ~$0.50/month for Route 53 + ~$0-$10/month for CloudFront

---

## 💰 ESTIMATED MONTHLY COST

For a simple HTML file with moderate traffic:

| Item | Cost |
|------|------|
| S3 Storage (1 MB) | $0.00 |
| 10,000 GET requests/month | $0.00 (Free Tier) |
| Data transfer (1 GB) | $0.09 |
| **TOTAL** | **~$0.09/month** |

**First Year with Free Tier**: Almost FREE!

---

## 🛠️ TROUBLESHOOTING

### Error: "Bucket name already exists"
- Try a different bucket name
- Bucket names must be globally unique across ALL AWS accounts

### Error: "Access Denied"
- Check your IAM user has S3FullAccess permission
- Verify bucket policy is correct
- Check public access settings

### Error: "Invalid credentials"
- Run `aws configure` again
- Verify access key and secret key
- Keys might be expired - create new ones

### Website shows 403 Forbidden
- Check bucket policy is applied correctly
- Verify "Block Public Access" is disabled
- Ensure file is uploaded with `--acl public-read`

### Website shows 404 Not Found
- Check file name matches exactly (case-sensitive)
- Verify index document is set correctly
- Confirm file was uploaded successfully

---

## 🔒 SECURITY BEST PRACTICES

1. **Never share your AWS access keys**
2. **Enable MFA on root account**
3. **Rotate access keys every 90 days**
4. **Only give minimum required permissions**
5. **Monitor AWS Billing Dashboard regularly**

---

## 📊 MONITORING YOUR DEPLOYMENT

### Check Storage Usage:
```cmd
aws s3 ls s3://connecthub-mobile-design-2026 --summarize --human-readable --recursive
```

### View Billing:
- Go to: https://console.aws.amazon.com/billing/
- Check "Bills" to see current month charges
- Set up billing alerts for $1, $5, $10

---

## 🗑️ DELETE DEPLOYMENT (IF NEEDED)

To completely remove everything:

```cmd
aws s3 rm s3://connecthub-mobile-design-2026 --recursive
aws s3 rb s3://connecthub-mobile-design-2026
```

---

## ✅ SUCCESS CHECKLIST

- [ ] AWS CLI installed and configured
- [ ] AWS account created (or logged in)
- [ ] IAM user created with S3 access
- [ ] S3 bucket created
- [ ] HTML file uploaded
- [ ] Static website hosting enabled
- [ ] Bucket policy applied
- [ ] Website accessible via URL
- [ ] URL shared with team/saved

---

## 🆘 NEED HELP?

### AWS Support:
- Free tier includes AWS Support
- Documentation: https://docs.aws.amazon.com/s3/

### Common Issues:
1. **Billing concerns**: Set up billing alerts immediately
2. **Permissions**: Make sure IAM user has correct permissions
3. **URL not working**: Wait 2-3 minutes after configuration
4. **File updates not showing**: Clear browser cache or use Ctrl+F5

---

## 📞 SUPPORT CONTACTS

- AWS Support: https://console.aws.amazon.com/support/
- AWS Free Tier: https://aws.amazon.com/free/
- S3 Documentation: https://docs.aws.amazon.com/s3/

---

**Created**: February 3, 2026
**For**: ConnectHub Mobile Design Deployment
**Estimated Setup Time**: 30 minutes
**Monthly Cost**: $0.09 - $2.00

---

## 🎓 WHAT YOU'VE LEARNED

After completing this guide, you now know how to:
- ✅ Set up AWS infrastructure
- ✅ Deploy static websites to the cloud
- ✅ Manage cloud storage with S3
- ✅ Configure public web hosting
- ✅ Update and maintain cloud deployments

**Next Steps**: Consider adding CloudFront for CDN, custom domain, and HTTPS!
