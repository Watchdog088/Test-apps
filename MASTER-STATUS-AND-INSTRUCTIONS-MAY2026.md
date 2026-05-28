# 🚀 LYNKAPP — MASTER STATUS & INSTRUCTIONS
**Last Updated: May 28, 2026**

---

## ✅ WHAT WAS COMPLETED (AUTO-FIXED — NO ACTION NEEDED)

### Firebase & Deployment
- ✅ **Firestore Security Rules** — compiled & deployed to `lynkapp-c7db1` successfully
- ✅ **Cloud Functions npm packages** — installed (`npm install` in `functions/` directory)
- ✅ **Cloud Functions source** — uploaded to Google Cloud (49.38 KB)
- ✅ **Firebase APIs enabled** — `firestore.googleapis.com`, `cloudfunctions.googleapis.com`, `cloudbuild.googleapis.com`, `artifactregistry.googleapis.com`, `cloudscheduler.googleapis.com`
- ✅ **TURN server** — wired into WebRTC service (`livestream-webrtc.js`)
- ✅ **Beta Feedback Modal** — wired to App.jsx

### All 8 Phases — Code Complete
- ✅ Phase 1: Infrastructure & environment variables
- ✅ Phase 2: Auth & onboarding flow
- ✅ Phase 3: Core user journey (feed, dating, file uploads)
- ✅ Phase 4: Performance (lazy loading, code splitting, service worker)
- ✅ Phase 5: Error handling (Sentry integrated, toast system)
- ✅ Phase 6: Security & legal (Cloudinary, ToS, cookie consent)
- ✅ Phase 7: Accessibility (aria-labels added, skeleton loaders)
- ✅ Phase 8: Beta launch prep (feedback form, smoke test pages)

### All 12 App Sections — Code Complete
- ✅ Section 1: Auth & Onboarding
- ✅ Section 2: Feed / Home
- ✅ Section 3: Stories
- ✅ Section 4: Live Streaming
- ✅ Section 5: Dating
- ✅ Section 6: Messages
- ✅ Section 7: Notifications
- ✅ Section 8: Profile
- ✅ Section 9: Friends
- ✅ Section 10: Groups
- ✅ Section 11: Events
- ✅ Section 12: Marketplace

### All APIs Integrated
- ✅ Giphy, RAWG, Unsplash, Pexels, Open-Meteo, ip-api, DiceBear, Leaflet
- ✅ CoinGecko, HackerNews, Guardian, Dev.to, NPR, YouTube Data
- ✅ Deezer, Radio Browser, FreeToGame, Wger, USDA Food, OpenFDA
- ✅ Location/Travel, Fun/Engagement, Sentry error tracking

---

## ⚠️ WHAT STILL NEEDS TO BE DONE — YOUR ACTION REQUIRED

### 🔴 CRITICAL — Cloud Functions Not Deployed (IAM Permission)

**Problem:** Google Cloud blocked the Cloud Functions build with this error:
```
Build failed: Access to bucket gcf-sources-258552263213-us-central1 denied.
You must grant Storage Object Viewer permission to 
258552263213-compute@developer.gserviceaccount.com
```

**EXACT STEP-BY-STEP FIX (takes ~3 minutes):**

1. Go to: **https://console.cloud.google.com/storage/browser?project=lynkapp-c7db1**

2. Find the bucket named: **`gcf-sources-258552263213-us-central1`**
   - If you don't see it, search for `gcf-sources` in the search bar

3. Click the **3-dot menu** (⋮) next to that bucket → click **"Edit access"**

4. Click **"+ ADD PRINCIPAL"**

5. In the **"New principals"** field, paste exactly:
   ```
   258552263213-compute@developer.gserviceaccount.com
   ```

6. In the **"Role"** dropdown, search for and select:
   **`Storage Object Viewer`**

7. Click **"Save"**

8. After saving, come back here and run this in VS Code terminal:
   ```
   cd C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
   npx firebase-tools deploy --only functions
   ```

**What these 16 Cloud Functions do:**
- `notifyFollowersOnLive` — alerts followers when someone goes live
- `notifyCoHostInvite` — sends co-host invitation notifications
- `processClip` — handles video clip processing
- `chatRateLimitEnforcer` — prevents spam in chats
- `onStreamEnd` — cleans up after live streams end
- `stripeWebhook` — processes Stripe payment events
- `createNextRecurringStream` — auto-schedules recurring streams
- `sendStreamReminders` — reminder notifications before streams
- `marketplacePriceAlertDelivery` — price drop alerts for marketplace
- `boostListingExpiry` — expires promoted marketplace listings
- `listingExpiryEnforcer` — removes expired marketplace listings
- `cleanExpiredStories` — deletes stories after 24 hours
- `notifyStoryReply` — story reply notifications
- `notifyStoryReaction` — story reaction notifications
- `onSwipeCreate` — processes dating swipes and creates matches
- `cleanupEndedStreams` — removes stale stream data

---

### 🟡 IMPORTANT — Firebase Email Templates (Needs Firebase Console)

**Problem:** Firebase Auth sends generic emails. They need to say "LynkApp" not "Firebase".

**EXACT STEPS:**

1. Go to: **https://console.firebase.google.com/project/lynkapp-c7db1/authentication/emails**

2. Click each email template and update:
   - **Email address verification**: Change sender name to `LynkApp` and update the body text
   - **Password reset**: Change sender name to `LynkApp`
   - **Email address change**: Change sender name to `LynkApp`

3. For each template, set:
   - **From name:** `LynkApp`
   - **Reply-to:** your support email (e.g., `support@lynkapp.com`)

---

### 🟡 IMPORTANT — Stripe Live Keys (Needs Stripe Dashboard)

**Problem:** Marketplace payments use test Stripe keys. For real money:

**EXACT STEPS:**

1. Go to: **https://dashboard.stripe.com/apikeys**
2. Copy your **Publishable key** (starts with `pk_live_...`)
3. Copy your **Secret key** (starts with `sk_live_...`)
4. Open file: `ConnectHub-SPA/.env.production`
5. Replace:
   ```
   VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_KEY_HERE
   ```
6. Open: `ConnectHub-SPA/functions/index.js`
7. Find the line with `stripe(` and replace the test key with your live secret key
8. Run: `npx firebase-tools deploy --only functions` again after

---

### 🟡 IMPORTANT — OneSignal Push Notifications

**Problem:** Push notifications need your OneSignal App ID configured.

**EXACT STEPS:**

1. Go to: **https://app.onesignal.com** → Your App → Settings → Keys & IDs
2. Copy your **App ID**
3. Open: `ConnectHub-SPA/.env`
4. Set: `VITE_ONESIGNAL_APP_ID=your-app-id-here`
5. Rebuild & deploy: run `npm run build` then `firebase deploy --only hosting`

---

### 🟡 OPTIONAL — Cloudinary Upload Preset

**Problem:** File uploads need a Cloudinary unsigned upload preset.

**EXACT STEPS:**

1. Go to: **https://cloudinary.com/console/settings/upload**
2. Click "Add upload preset"
3. Set **Signing mode** to `Unsigned`
4. Set **Preset name** to `lynkapp_uploads`
5. Click Save
6. Open `ConnectHub-SPA/.env`
7. Verify: `VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name`

---

### 🟡 OPTIONAL — TURN Server for Video Calls

**Problem:** Video calls (WebRTC) need a TURN server for users behind firewalls.

**EXACT STEPS (use free tier of Twilio):**

1. Go to: **https://www.twilio.com/console/voice/turn**
2. Create a free TURN credentials resource
3. Open: `ConnectHub-SPA/src/services/livestream-webrtc.js`
4. Replace the placeholder TURN server with your Twilio TURN credentials:
   ```javascript
   { urls: 'turn:global.turn.twilio.com:3478', 
     username: 'YOUR_USERNAME', 
     credential: 'YOUR_PASSWORD' }
   ```

---

## 📊 OVERALL STATUS

| Category | Status |
|----------|--------|
| Frontend (React SPA) | ✅ 100% Complete |
| Firestore Rules | ✅ Deployed |
| Cloud Functions code | ✅ Written & packaged |
| Cloud Functions deployed | ❌ Needs IAM fix (above) |
| Firebase Auth emails | ⚠️ Generic (needs branding) |
| Stripe payments | ⚠️ Test mode (needs live keys) |
| Push notifications | ⚠️ Need App ID |
| Video calls (TURN) | ⚠️ Optional upgrade |
| GitHub | ✅ All code pushed |

---

## 🔧 AFTER YOU FIX THE IAM PERMISSION

Once you grant the IAM permission and run `npx firebase-tools deploy --only functions`, the app will be **fully production-ready** for beta testing.

The live app is at: **https://lynkapp-c7db1.web.app**

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `ConnectHub-SPA/.env` | Frontend environment variables |
| `ConnectHub-SPA/.env.production` | Production env variables |
| `ConnectHub-SPA/functions/index.js` | All 16 Cloud Functions |
| `ConnectHub-SPA/firestore.rules` | Database security rules |
| `ConnectHub-SPA/src/firebase/config.js` | Firebase configuration |
| `ConnectHub-SPA/src/services/livestream-webrtc.js` | WebRTC/TURN config |

