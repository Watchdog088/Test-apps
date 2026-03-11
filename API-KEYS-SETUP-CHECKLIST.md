# 🔑 API Keys & Setup Checklist - LynkApp

**Status:** Setup Required  
**Date:** March 9, 2026  
**Priority:** Get your app production-ready!

---

## 🎯 CRITICAL - DO THESE FIRST (Week 1)

### ✅ **1. OneSignal (Push Notifications)** - 5 minutes
**Status:** ⚠️ **NEEDS SETUP**  
**Cost:** FREE (unlimited)  
**Priority:** 🔴 **CRITICAL**

**Steps:**
1. Go to: https://onesignal.com/signup
2. Create FREE account
3. Create new app: "LynkApp"
4. Copy **App ID** & **REST API Key**
5. Update files:
   - `ConnectHub-Frontend/src/services/onesignal-service.js` (line 7)
   - `ConnectHub-Backend/.env`

**Add to .env:**
```env
ONESIGNAL_APP_ID=your_app_id_here
ONESIGNAL_REST_API_KEY=your_rest_api_key_here
```

**Why Critical:** Users need notifications for messages, friend requests, etc.

---

### ✅ **2. Cloudinary (Media Storage)** - 5 minutes
**Status:** ⚠️ **NEEDS SETUP**  
**Cost:** FREE (25GB)  
**Priority:** 🔴 **CRITICAL**

**Steps:**
1. Go to: https://cloudinary.com/console
2. Your account exists: Cloud Name = `do6ue7mgf`
3. Get **API Secret** from dashboard
4. Create upload preset: `lynkapp_uploads` (unsigned)
5. Update `ConnectHub-Backend/.env`

**Add to .env:**
```env
CLOUDINARY_CLOUD_NAME=do6ue7mgf
CLOUDINARY_API_KEY=919359489477421
CLOUDINARY_API_SECRET=your_secret_here  ⚠️ ADD THIS
```

**Why Critical:** Users can't upload images/videos without this.

---

### ✅ **3. Firebase (Backend Services)** - 10 minutes
**Status:** ⚠️ **NEEDS SETUP**  
**Cost:** FREE (Spark plan)  
**Priority:** 🔴 **CRITICAL**

**Steps:**
1. Go to: https://console.firebase.google.com
2. Create new project: "LynkApp"
3. Enable Authentication (Email/Password, Google, Facebook)
4. Enable Firestore Database
5. Enable Storage
6. Get config from Project Settings

**Add to .env:**
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=lynkapp.firebaseapp.com
FIREBASE_PROJECT_ID=lynkapp
FIREBASE_STORAGE_BUCKET=lynkapp.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

**Update:** `ConnectHub-Frontend/src/services/firebase-config.js`

**Why Critical:** Core authentication & real-time data.

---

### ✅ **4. NewsAPI (Trending Content)** - 2 minutes
**Status:** ✅ **ALREADY ADDED**  
**Cost:** FREE  
**Priority:** 🟡 **IMPORTANT**

**Your Key:** `fda0b282e51d46d48ebdac882172d0c3`

**Already in:** `ConnectHub-Backend/.env`

**Why Important:** Powers trending news section.

---

## 🎨 IMPORTANT - DO THESE NEXT (Week 2)

### ✅ **5. OpenAI (Content Moderation)** - 5 minutes
**Status:** ⚠️ **NEEDS KEY**  
**Cost:** FREE tier available  
**Priority:** 🟡 **IMPORTANT**

**Steps:**
1. Go to: https://platform.openai.com/signup
2. Create account
3. Go to API Keys
4. Create new key
5. Update `ConnectHub-Backend/.env`

**Add to .env:**
```env
OPENAI_API_KEY=sk-your_key_here
OPENAI_MODEL=gpt-4
OPENAI_MODERATION_MODEL=text-moderation-latest
```

**Why Important:** Auto-moderate harmful content.

---

### ✅ **6. Stripe (Payments)** - 15 minutes
**Status:** ⚠️ **NEEDS SETUP**  
**Cost:** FREE (pay per transaction)  
**Priority:** 🟡 **IMPORTANT**

**Steps:**
1. Go to: https://dashboard.stripe.com/register
2. Create account
3. Get **Publishable Key** & **Secret Key**
4. Set up webhook endpoint
5. Update `ConnectHub-Backend/.env`

**Add to .env:**
```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Why Important:** Premium subscriptions, marketplace payments.

---

### ✅ **7. AWS (Infrastructure)** - 30 minutes
**Status:** ⚠️ **NEEDS SETUP**  
**Cost:** FREE tier (12 months)  
**Priority:** 🟡 **IMPORTANT**

**Steps:**
1. Go to: https://aws.amazon.com/free
2. Create AWS account
3. Create IAM user with proper permissions
4. Get **Access Key** & **Secret Key**
5. Create S3 bucket: `lynkapp-media`
6. Update `ConnectHub-Backend/.env`

**Add to .env:**
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=lynkapp-media
```

**Why Important:** Media storage, CDN, scalability.

---

## 🚀 OPTIONAL - NICE TO HAVE (Week 3+)

### ✅ **8. Google OAuth** - 10 minutes
**Status:** ⚠️ **NEEDS SETUP**  
**Cost:** FREE  
**Priority:** 🟢 **OPTIONAL**

**Steps:**
1. Go to: https://console.cloud.google.com
2. Create new project: "LynkApp"
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

**Add to .env:**
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://lynkapp.com/api/auth/google/callback
```

---

### ✅ **9. Facebook OAuth** - 10 minutes
**Status:** ⚠️ **NEEDS SETUP**  
**Cost:** FREE  
**Priority:** 🟢 **OPTIONAL**

**Steps:**
1. Go to: https://developers.facebook.com
2. Create new app: "LynkApp"
3. Add Facebook Login product
4. Get App ID & Secret
5. Configure OAuth redirect URIs

**Add to .env:**
```env
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_CALLBACK_URL=https://lynkapp.com/api/auth/facebook/callback
```

---

### ✅ **10. Twilio (SMS Verification)** - 10 minutes
**Status:** ⚠️ **NEEDS SETUP**  
**Cost:** Pay per SMS ($0.0075/SMS)  
**Priority:** 🟢 **OPTIONAL**

**Steps:**
1. Go to: https://www.twilio.com/try-twilio
2. Create FREE account ($15 credit)
3. Get Account SID & Auth Token
4. Get phone number
5. Update `ConnectHub-Backend/.env`

**Add to .env:**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

### ✅ **11. SendGrid (Email)** - 10 minutes
**Status:** ⚠️ **NEEDS SETUP**  
**Cost:** FREE (100 emails/day)  
**Priority:** 🟢 **OPTIONAL**

**Steps:**
1. Go to: https://signup.sendgrid.com
2. Create FREE account
3. Create API Key
4. Verify sender email
5. Update `ConnectHub-Backend/.env`

**Add to .env:**
```env
SENDGRID_API_KEY=SG.your_api_key
EMAIL_FROM=noreply@lynkapp.com
```

---

### ✅ **12. DeepAR (AR Filters)** - 5 minutes
**Status:** ⚠️ **NEEDS SETUP**  
**Cost:** FREE (10 users), $99/month (unlimited)  
**Priority:** 🟢 **OPTIONAL**

**Steps:**
1. Go to: https://www.deepar.ai/
2. Create FREE account
3. Create new project
4. Copy License Key
5. Update your AR service

**Add to config:**
```javascript
const deepAR = DeepAR({
    licenseKey: 'your_license_key_here'
});
```

---

## 📊 COMPLETE CHECKLIST

### **Critical (Must Have - Week 1):**
- [ ] OneSignal - Push notifications
- [ ] Cloudinary - Media storage  
- [ ] Firebase - Backend & auth
- [x] NewsAPI - Trending content (DONE)

### **Important (Should Have - Week 2):**
- [ ] OpenAI - Content moderation
- [ ] Stripe - Payments
- [ ] AWS - Infrastructure

### **Optional (Nice to Have - Week 3+):**
- [ ] Google OAuth - Social login
- [ ] Facebook OAuth - Social login
- [ ] Twilio - SMS verification
- [ ] SendGrid - Email
- [ ] DeepAR - AR filters

---

## 🎯 PRIORITY SETUP PLAN

### **Day 1 (Today):**
1. ✅ OneSignal (5 min) - Push notifications
2. ✅ Cloudinary (5 min) - Image/video uploads
3. ✅ Firebase (10 min) - Authentication

**Total Time:** 20 minutes  
**Result:** Core features working

---

### **Day 2 (Tomorrow):**
4. ✅ OpenAI (5 min) - Content moderation
5. ✅ Stripe (15 min) - Payments

**Total Time:** 20 minutes  
**Result:** Premium features ready

---

### **Day 3 (This Week):**
6. ✅ AWS (30 min) - Production infrastructure
7. ✅ Google OAuth (10 min) - Easy login

**Total Time:** 40 minutes  
**Result:** Production-ready platform

---

## 💰 COST BREAKDOWN

### **FREE Forever:**
- OneSignal: $0 (unlimited)
- Cloudinary: $0 (25GB)
- Firebase: $0 (Spark plan)
- NewsAPI: $0 (already have key)
- Google OAuth: $0
- Facebook OAuth: $0

### **FREE Tier (Then Paid):**
- OpenAI: FREE tier, then pay-per-use
- Stripe: FREE (2.9% + $0.30 per transaction)
- AWS: FREE 12 months, then pay-per-use
- Twilio: $15 FREE credit, then $0.0075/SMS
- SendGrid: FREE 100/day, then $19.95/mo

### **Paid (Optional):**
- DeepAR: $99/month (for unlimited AR users)

**Total Monthly Cost:**
- **Minimum:** $0/month (using all free tiers)
- **Recommended:** $99-199/month (for production features)
- **Full Stack:** $299-499/month (all premium features)

---

## 🚀 QUICK START SCRIPT

### **Setup All Critical Keys (20 minutes):**

```bash
# 1. OneSignal
# Visit: https://onesignal.com/signup
# Get: App ID & REST API Key

# 2. Cloudinary
# Visit: https://cloudinary.com/console
# Get: API Secret
# Create preset: lynkapp_uploads

# 3. Firebase
# Visit: https://console.firebase.google.com
# Create project: LynkApp
# Enable: Authentication, Firestore, Storage
# Get: Config object

# 4. Update .env files
cd ConnectHub-Backend
notepad .env
# Add all keys

cd ../ConnectHub-Frontend
notepad .env
# Add Firebase config
```

---

## ✅ VERIFICATION CHECKLIST

### **Test Each Service:**

**OneSignal:**
```bash
# Open admin dashboard
# Click "Test Notification"
# Should see notification on your device
```

**Cloudinary:**
```bash
# Upload an image in app
# Check Cloudinary dashboard
# Image should appear
```

**Firebase:**
```bash
# Try to sign up
# Check Firebase console
# User should be created
```

**Stripe:**
```bash
# Try premium purchase
# Use test card: 4242 4242 4242 4242
# Check Stripe dashboard
```

---

## 📝 ENVIRONMENT FILE TEMPLATE

### **ConnectHub-Backend/.env (Complete):**

```env
# ============================================================================
# CRITICAL KEYS (MUST HAVE)
# ============================================================================

# OneSignal (Push Notifications)
ONESIGNAL_APP_ID=your_app_id_here  # ⚠️ ADD THIS
ONESIGNAL_REST_API_KEY=your_rest_api_key_here  # ⚠️ ADD THIS

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=do6ue7mgf  # ✅ ALREADY SET
CLOUDINARY_API_KEY=919359489477421  # ✅ ALREADY SET
CLOUDINARY_API_SECRET=your_secret_here  # ⚠️ ADD THIS

# Firebase (Backend)
FIREBASE_API_KEY=your_api_key  # ⚠️ ADD THIS
FIREBASE_PROJECT_ID=lynkapp  # ⚠️ ADD THIS

# NewsAPI (Trending)
NEWS_API_KEY=fda0b282e51d46d48ebdac882172d0c3  # ✅ ALREADY SET

# ============================================================================
# IMPORTANT KEYS (SHOULD HAVE)
# ============================================================================

# OpenAI (Content Moderation)
OPENAI_API_KEY=sk-your_key  # ⚠️ ADD THIS

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_your_key  # ⚠️ ADD THIS
STRIPE_PUBLISHABLE_KEY=pk_test_your_key  # ⚠️ ADD THIS

# AWS (Infrastructure)
AWS_ACCESS_KEY_ID=your_access_key  # ⚠️ ADD THIS
AWS_SECRET_ACCESS_KEY=your_secret_key  # ⚠️ ADD THIS

# ============================================================================
# OPTIONAL KEYS (NICE TO HAVE)
# ============================================================================

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Facebook OAuth
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token

# SendGrid (Email)
SENDGRID_API_KEY=SG.your_api_key
```

---

## 🎊 SUMMARY

### **What You Need Right Now:**
1. **OneSignal** - Notifications (5 min)
2. **Cloudinary** - Images/Videos (5 min)
3. **Firebase** - Auth & Database (10 min)

**Total:** 20 minutes to get core features working!

### **What You Need Soon:**
4. **OpenAI** - Safety (5 min)
5. **Stripe** - Money (15 min)
6. **AWS** - Scale (30 min)

**Total:** Another 50 minutes for production features

### **What You Can Add Later:**
7-12. Social logins, SMS, Email, AR (1-2 hours)

---

## 📞 SUPPORT LINKS

**Get Help:**
- OneSignal: https://documentation.onesignal.com
- Cloudinary: https://cloudinary.com/documentation
- Firebase: https://firebase.google.com/docs
- OpenAI: https://platform.openai.com/docs
- Stripe: https://stripe.com/docs
- AWS: https://aws.amazon.com/getting-started

**Free Credits:**
- Twilio: $15 FREE
- SendGrid: 100 emails/day FREE
- AWS: 12 months FREE tier
- Stripe: No fees to test

---

## ✅ NEXT ACTIONS

**Right Now (5 minutes each):**
1. Sign up for OneSignal → Get App ID
2. Get Cloudinary API Secret → Create preset
3. Create Firebase project → Get config

**Then (1 hour):**
1. Add all keys to `.env` files
2. Test each service
3. Deploy & celebrate! 🎉

---

**Status:** ✅ Checklist Complete  
**Priority:** Do critical keys NOW (20 min)  
**Result:** Fully functional LynkApp!  

*Let's get these keys and launch! 🚀*
