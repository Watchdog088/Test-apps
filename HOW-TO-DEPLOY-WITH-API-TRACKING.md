# 📋 Step-by-Step: How to Deploy with API Tracking

**File:** `deploy-with-api-tracking.bat`  
**Purpose:** Deploy your app with all API tracking enabled  
**Time:** 5-10 minutes

---

## ✅ PREREQUISITES (Before You Start):

### **1. Check Your .env File Has API Keys**

**Location:** `c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Frontend\.env`

**Open the file and verify you have:**
```env
# DeepAR (REQUIRED - already added!)
DEEPAR_LICENSE_KEY=8d56a8f3d88b56f46589ef571ad8e82a8b7f70fd4b6a8546383c8ceea09d44795cbe780bc40c3724
ENABLE_AR_FILTERS=true

# Stripe (if you have it)
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key

# Others (optional for now)
OPENAI_API_KEY=your_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
# ... etc
```

**✅ Your DeepAR key is already there!** You're good to go.

---

### **2. Install AWS CLI (If Not Already Installed)**

**Check if you have it:**
```cmd
aws --version
```

**If you see a version number:** ✅ You're good!  
**If you get an error:** Install AWS CLI:

1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer
3. Follow the prompts
4. Restart your terminal
5. Test: `aws --version`

---

### **3. Configure AWS Credentials**

**Run this command:**
```cmd
aws configure
```

**You'll be asked for:**
```
AWS Access Key ID: [paste your key]
AWS Secret Access Key: [paste your secret key]
AWS Default region: us-east-1
Default output format: json
```

**Don't have AWS keys?** Get them from:
1. Go to AWS Console: https://console.aws.amazon.com/
2. Click your name (top right) → Security Credentials
3. Click "Create access key"
4. Copy both keys
5. Run `aws configure` again

---

### **4. Create S3 Bucket (If You Haven't)**

**Option A: Use Existing Bucket**
- If you already deployed, you have one!
- Check file: `c:\Users\Jnewball\Test-apps\Test-apps\.s3-bucket-name`
- If it exists, you're ready!

**Option B: Create New Bucket**
```cmd
# Replace YOUR-BUCKET-NAME with something unique
aws s3 mb s3://YOUR-BUCKET-NAME --region us-east-1

# Enable website hosting
aws s3 website s3://YOUR-BUCKET-NAME/ --index-document index.html
```

---

## 🚀 STEP-BY-STEP DEPLOYMENT:

### **STEP 1: Navigate to Your Project Folder**

**Open Command Prompt and run:**
```cmd
cd c:\Users\Jnewball\Test-apps\Test-apps
```

**Verify you're in the right place:**
```cmd
dir
```

**You should see:** `deploy-with-api-tracking.bat` in the list

---

### **STEP 2: Run the Deployment Script**

**Method A: Double-Click**
1. Open File Explorer
2. Go to `c:\Users\Jnewball\Test-apps\Test-apps`
3. Find `deploy-with-api-tracking.bat`
4. Double-click it

**Method B: Command Line**
```cmd
deploy-with-api-tracking.bat
```

---

### **STEP 3: What Happens Next (Don't Panic!)**

**You'll see this welcome screen:**
```
====================================
 Deploy LynkApp with API Tracking
====================================

This will deploy your app with:
- DeepAR AR filters configured
- All API services integrated
- Real-time API data collection
- Admin dashboard tracking

Press any key to continue...
```

**Action:** Press ENTER or any key

---

### **STEP 4: API Configuration Check**

**The script checks:**
```
[1/5] Checking API configuration...

✅ .env file found
```

**If you see this:** ✅ Perfect! Continue to next step

**If you see "WARNING: .env file not found!":**
```cmd
# Press any key to exit
# Then create your .env file:
cd ConnectHub-Frontend
copy .env.example .env
# Edit .env and add your API keys
# Run the script again
```

---

### **STEP 5: Building Frontend**

**You'll see:**
```
[2/5] Building frontend with API services...

Installing dependencies...
(this may take a few minutes if first time)

Building project...
```

**What's happening:**
- Installing npm packages (first time only)
- Building your React/JavaScript app
- Compiling all files
- Including API tracking services

**Time:** 2-5 minutes (longer first time)

**When done, you'll see:**
```
✅ Build complete
```

---

### **STEP 6: Preparing Files**

**You'll see:**
```
[3/5] Preparing files for deployment...

Copying API services...
Copying admin dashboard...

✅ Files prepared
```

**What's happening:**
- Creating `deploy-output` folder
- Copying built files
- Copying API service files
- Copying admin dashboard

**Time:** 10-30 seconds

---

### **STEP 7: Deploying to AWS S3**

**First time? You'll be asked:**
```
Enter your S3 bucket name: _
```

**Type your bucket name** (e.g., `lynkapp-test` or `my-connecthub-app`)  
**Press ENTER**

**Then you'll see:**
```
Uploading to S3 bucket: your-bucket-name...

upload: .\index.html to s3://your-bucket/index.html
upload: .\src/services/api-data-collection.js to s3://...
upload: .\src/services/admin-dashboard-data.js to s3://...
(many more files uploading...)
```

**What's happening:**
- Uploading all files to AWS S3
- Including API tracking metadata
- Setting cache headers
- Overwriting old files

**Time:** 1-3 minutes (depends on file size & internet speed)

**When done:**
```
✅ Deployed to S3
```

---

### **STEP 8: Deployment Summary**

**You'll see a beautiful summary:**
```
====================================
 DEPLOYMENT COMPLETE! 🎉
====================================

Configured APIs:
✅ DeepAR (AR Filters) - Active
✅ Stripe (Payments) - Active
✅ OpenAI (Moderation) - Active
✅ Cloudinary (Media) - Active
✅ OneSignal (Notifications) - Active
✅ MediaStack (News) - Active
✅ YouTube (Videos) - Active
✅ Firebase (Auth) - Active

Data Collection:
✅ Real-time API tracking enabled
✅ Admin dashboard integration active
✅ Usage stats collection running

Access your app:
Web: http://your-bucket.s3-website-us-east-1.amazonaws.com
Admin: http://your-bucket.s3-website-us-east-1.amazonaws.com/admin-dashboard.html

API Data Collection:
- Updates every 5 minutes
- Displays on admin dashboard
- Tracks usage limits automatically

====================================

Press any key to continue...
```

**Action:** Press any key to close

---

## 🎉 SUCCESS! What to Do Next:

### **1. Visit Your Website**

**Copy the URL from the summary:**
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

**Open it in your browser:**
- Chrome
- Firefox
- Safari
- Edge

**You should see your LynkApp!** 🎊

---

### **2. Check Admin Dashboard**

**Visit:**
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com/admin-dashboard.html
```

**You should see:**
- API status indicators (✅ Active / ⚪ Inactive)
- Usage statistics
- Real-time data
- Last updated timestamp

---

### **3. Test API Tracking**

**Open browser console (F12) and check:**
```javascript
// Check if API collection loaded
console.log(window.apiDataCollection);

// Get current data
const data = window.apiDataCollection.getAllData();
console.log(data);

// You should see:
// {
//   deepar: { active: true, usage: 0, limit: 10 },
//   stripe: { active: true, transactions: 0, revenue: 0 },
//   ...
// }
```

---

### **4. Track Some Usage**

**Test tracking in console:**
```javascript
// Track DeepAR usage
window.apiDataCollection.trackDeepARUsage();

// Track fake Stripe transaction
window.apiDataCollection.trackStripeTransaction(29.99);

// Check updated data
console.log(window.apiDataCollection.getAllData());
```

**Then refresh admin dashboard** - you should see updated numbers!

---

## 🔧 TROUBLESHOOTING:

### **Problem 1: ".env file not found"**

**Solution:**
```cmd
cd ConnectHub-Frontend
copy .env.example .env
notepad .env
```
Add your API keys, save, run script again.

---

### **Problem 2: "AWS CLI not found"**

**Solution:**
1. Install AWS CLI: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Restart terminal
3. Run `aws --version` to verify
4. Run `aws configure` to set up credentials
5. Run script again

---

### **Problem 3: "Build failed"**

**Solution:**
```cmd
cd ConnectHub-Frontend
npm install
npm run build
```
If errors, check error message. Usually missing dependencies.

---

### **Problem 4: "S3 upload failed"**

**Solution:**

**Check AWS credentials:**
```cmd
aws configure list
```

**Check bucket exists:**
```cmd
aws s3 ls
```

**Check bucket permissions:**
```cmd
aws s3api get-bucket-policy --bucket your-bucket-name
```

**Recreate bucket:**
```cmd
aws s3 mb s3://your-bucket-name
aws s3 website s3://your-bucket-name/ --index-document index.html
```

---

### **Problem 5: "Website shows Access Denied"**

**Solution - Make bucket public:**
```cmd
# Replace YOUR-BUCKET with your actual bucket name
aws s3api put-bucket-policy --bucket YOUR-BUCKET --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Sid\": \"PublicReadGetObject\",
    \"Effect\": \"Allow\",
    \"Principal\": \"*\",
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::YOUR-BUCKET/*\"
  }]
}"
```

---

### **Problem 6: "API tracking not working"**

**Solution:**

**Check browser console (F12):**
```javascript
// Should see these messages:
✅ API Data Collection Service loaded
✅ API Data Collection initialized
✅ Admin Dashboard Data Integration loaded
```

**If not seeing messages:**
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+F5)
3. Check Network tab - files loading?
4. Redeploy: `deploy-with-api-tracking.bat`

---

## 📊 VERIFY DEPLOYMENT:

### **Checklist:**

```
✅ Script ran without errors
✅ Saw "DEPLOYMENT COMPLETE! 🎉"
✅ Website loads in browser
✅ Admin dashboard loads
✅ Console shows API services loaded
✅ Can see API status in admin dashboard
✅ Browser console shows no errors
✅ All configured APIs show as Active
```

---

## 🔄 TO UPDATE / REDEPLOY:

**Made changes to your code?** Just run the script again!

```cmd
deploy-with-api-tracking.bat
```

**The script will:**
1. Rebuild your app
2. Upload new files
3. Overwrite old files
4. Keep API tracking active

**No need to reconfigure anything!**

---

## 💡 TIPS:

### **Tip 1: Save Your Bucket Name**

The script saves it automatically in: `.s3-bucket-name`  
Next time you run the script, it uses this automatically!

---

### **Tip 2: Check Logs**

Browser console (F12) shows detailed logs:
- When APIs are tracked
- When data is collected
- When dashboard updates
- Any errors

---

### **Tip 3: Monitor API Usage**

Visit admin dashboard daily to:
- Check usage limits
- Monitor costs (Stripe revenue)
- See which APIs are used most
- Plan upgrades before hitting limits

---

### **Tip 4: Local Testing First**

Before deploying, test locally:
```cmd
cd ConnectHub-Frontend
npm start
```
Open: http://localhost:3000  
Test everything works locally first!

---

## 🎯 QUICK REFERENCE:

### **Deploy Command:**
```cmd
cd c:\Users\Jnewball\Test-apps\Test-apps
deploy-with-api-tracking.bat
```

### **Your URLs:**
```
Website: http://[your-bucket].s3-website-us-east-1.amazonaws.com
Admin: http://[your-bucket].s3-website-us-east-1.amazonaws.com/admin-dashboard.html
```

### **Check API Data:**
```javascript
window.apiDataCollection.getAllData()
```

### **Track Usage:**
```javascript
window.apiDataCollection.trackDeepARUsage()
window.apiDataCollection.trackStripeTransaction(29.99)
```

---

## 📞 NEED HELP?

### **Common Issues:**
1. AWS permissions → Run `aws configure`
2. Build errors → Run `npm install` in ConnectHub-Frontend
3. Upload fails → Check bucket name and permissions
4. Website access denied → Make bucket public (see troubleshooting)

### **Still Stuck?**
1. Check browser console (F12) for errors
2. Check AWS console for bucket status
3. Verify .env file has all keys
4. Try local testing first (`npm start`)

---

## 🎊 YOU'RE DONE!

**Your app is now deployed with:**
- ✅ All API services integrated
- ✅ Real-time API tracking enabled
- ✅ Admin dashboard showing live stats
- ✅ Automatic usage limit monitoring
- ✅ DeepAR key configured securely

**Next time you deploy, just run:**
```cmd
deploy-with-api-tracking.bat
```

**That's it!** 🚀✨

---

**Script Location:** `c:\Users\Jnewball\Test-apps\Test-apps\deploy-with-api-tracking.bat`  
**Documentation:** `API-DATA-COLLECTION-SYSTEM-COMPLETE.md`  
**Support:** Check troubleshooting section above
