# 🔄 DEMO TO LIVE APP TRANSFORMATION GUIDE
## LynkApp / ConnectHub — Complete Roadmap
**Prepared:** May 26, 2026  
**Purpose:** Every single thing needed to turn the current demo into a real, live app real users can sign up for and use.

---

## 🧠 UNDERSTANDING THE PROBLEM — WHAT IS "DEMO MODE"?

Right now the app runs in **demo mode** by default. Here is what that means in plain terms:

| In Demo Mode | In Live Mode |
|---|---|
| All data is hardcoded in JavaScript arrays | All data comes from and goes to Firestore (real database) |
| "Signing in" does nothing — you're always the same fake user | Real Firebase Authentication with email + Google sign-in |
| Posting, liking, swiping only updates memory (lost on refresh) | Every action is saved to Firestore permanently |
| All profiles are fake (5 hardcoded dating profiles, etc.) | Real user accounts with real profiles |
| Notifications are decorative numbers | Real push notifications via OneSignal |
| Payments don't process | Real Stripe payments |
| Messages are not stored | Real DMs stored in Firestore in real time |
| Media uploads create temporary blob URLs | Media uploads go to Firebase Storage permanently |

**The app LOOKS real but IS NOT real.** Every button works visually, but nothing persists.

---

## 📋 THE COMPLETE CHECKLIST — DEMO → LIVE

There are **6 layers** to transform. Work through them in order.

---

# LAYER 1: AUTHENTICATION (Days 1–2)
*Make real users able to sign up, sign in, and stay logged in*

### Step 1.1 — Remove the Demo Mode Lock ✅ DONE
**File:** `ConnectHub-SPA/src/hooks/useAuth.js`  
**What was done:** Removed `if (demoMode) return;` guard. Firebase auth now always runs. `setDemoMode(false)` is called when a real user logs in.  
**Status:** ✅ Fixed (May 26, 2026)

### Step 1.2 — Wire Email Verification Gate ❌ NEEDED
**File:** `ConnectHub-SPA/src/components/layout/AppShell.jsx`  
**What to do:**
```jsx
// After auth check, before showing app:
if (user && !user.emailVerified) {
  return <Navigate to="/verify-email" replace />;
}
```
**Why:** Without this, fake email accounts bypass verification. Real apps require email confirmation.

### Step 1.3 — Create Real User Document in Firestore on First Login ❌ NEEDED
**File:** `ConnectHub-SPA/src/hooks/useAuth.js`  
**What to do:** When `onAuthStateChanged` fires for the first time, check if `users/{uid}` exists. If not, create it:
```js
const userRef = doc(db, 'users', firebaseUser.uid);
const snap = await getDoc(userRef);
if (!snap.exists()) {
  await setDoc(userRef, {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || '',
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL || '',
    createdAt: serverTimestamp(),
    onboardingComplete: false,
    premium: false,
    followers: 0,
    following: 0,
    postsCount: 0,
  });
}
```
**Why:** Without this, user profiles don't exist in the database. Every profile page will be blank.

### Step 1.4 — Save Onboarding Interests to Firestore ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/onboarding/OnboardingPage.jsx`  
**What to do:** On "Complete Setup" button:
```js
await updateDoc(doc(db, 'users', user.uid), {
  interests: selectedInterests,
  onboardingComplete: true,
  updatedAt: serverTimestamp(),
});
navigate('/feed');
```

### Step 1.5 — Verify Firebase Project Credentials ❌ VERIFY
**File:** `ConnectHub-SPA/.env`  
**What to do:** Open Firebase Console → Project Settings → Your Apps → Web app → Copy config  
Check that `.env` has all of these filled in:
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

---

# LAYER 2: DATA PERSISTENCE (Days 2–5)
*Make every user action save to the real database*

This is the biggest layer. Every feature that currently works "in memory only" needs a Firestore write added.

### Step 2.1 — Feed: Post Creation → Firebase Storage + Firestore ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/feed/FeedSubPages.jsx` — CreatePostPage  
**The problem:** Media files create temporary blob URLs. Text posts don't get saved at all.  
**What to do:**
```js
// 1. Upload media to Firebase Storage first:
async function uploadMedia(file) {
  const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
  const snap = await uploadBytes(storageRef, file);
  return await getDownloadURL(snap.ref);
}

// 2. Then save post document to Firestore:
const mediaUrl = mediaFile ? await uploadMedia(mediaFile) : null;
await addDoc(collection(db, 'posts'), {
  authorUid: user.uid,
  authorName: user.displayName,
  authorPhoto: user.photoURL || '',
  content: postText,
  mediaUrl,
  mediaType: mediaFile?.type?.startsWith('video') ? 'video' : 'image',
  likes: 0,
  comments: 0,
  shares: 0,
  likedBy: [],
  createdAt: serverTimestamp(),
  visibility: 'public',
});
```

### Step 2.2 — Feed: Post Likes → Firestore ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/feed/FeedPage.jsx` — `handleReaction`  
```js
await updateDoc(doc(db, 'posts', post.id), {
  likedBy: wasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
  likes: increment(wasLiked ? -1 : 1),
  [`reactions.${user.uid}`]: wasLiked ? deleteField() : emoji,
});
```

### Step 2.3 — Feed: Comments → Firestore ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/feed/FeedSubPages.jsx` — `CommentThreadPage`  
```js
await addDoc(collection(db, 'posts', postId, 'comments'), {
  text: commentText,
  authorUid: user.uid,
  authorName: user.displayName,
  createdAt: serverTimestamp(),
  likes: 0,
});
await updateDoc(doc(db, 'posts', postId), { comments: increment(1) });
```

### Step 2.4 — Feed: Post Delete → Firestore ❌ NEEDED
```js
await deleteDoc(doc(db, 'posts', post.id));
// Also delete from Storage if mediaUrl exists
```

### Step 2.5 — Feed: Load Real Posts from Firestore ❌ NEEDED
Currently the feed loads demo posts. Replace with:
```js
useEffect(() => {
  const q = query(
    collection(db, 'posts'),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const unsub = onSnapshot(q, (snap) => {
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  });
  return () => unsub();
}, []);
```

### Step 2.6 — Profile Edit Save → Firestore ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/profile/ProfileEditPage.jsx`  
```js
await updateDoc(doc(db, 'users', user.uid), {
  displayName: formData.displayName,
  bio: formData.bio,
  location: formData.location,
  website: formData.website,
  updatedAt: serverTimestamp(),
});
// If photo changed, upload to Storage first:
if (newPhoto) {
  const photoRef = ref(storage, `profiles/${user.uid}/avatar`);
  const snap = await uploadBytes(photoRef, newPhoto);
  const photoURL = await getDownloadURL(snap.ref);
  await updateDoc(doc(db, 'users', user.uid), { photoURL });
  await updateProfile(firebaseUser, { photoURL });
}
```

### Step 2.7 — Messages: Send → Firestore ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/messages/MessagesPage.jsx`  
```js
// Create conversation if it doesn't exist:
async function getOrCreateConversation(otherUid) {
  const ids = [user.uid, otherUid].sort().join('_');
  const convoRef = doc(db, 'conversations', ids);
  const snap = await getDoc(convoRef);
  if (!snap.exists()) {
    await setDoc(convoRef, {
      participants: [user.uid, otherUid],
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      unreadCount: { [user.uid]: 0, [otherUid]: 0 },
    });
  }
  return ids;
}

// Send message:
async function sendMessage(convoId, text) {
  await addDoc(collection(db, 'conversations', convoId, 'messages'), {
    text,
    senderUid: user.uid,
    senderName: user.displayName,
    createdAt: serverTimestamp(),
    read: false,
  });
  await updateDoc(doc(db, 'conversations', convoId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${otherUid}`]: increment(1),
  });
}
```

### Step 2.8 — Load Real Conversations from Firestore ❌ NEEDED
```js
const q = query(
  collection(db, 'conversations'),
  where('participants', 'array-contains', user.uid),
  orderBy('lastMessageAt', 'desc')
);
const unsub = onSnapshot(q, snap => {
  setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});
```

### Step 2.9 — Stories: Create → Firestore + Storage ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/stories/StoryCreatePage.jsx`  
```js
// Upload to Storage:
const mediaRef = ref(storage, `stories/${user.uid}/${Date.now()}`);
const snap = await uploadBytes(mediaRef, mediaFile);
const mediaUrl = await getDownloadURL(snap.ref);

// Save story:
await addDoc(collection(db, 'stories'), {
  authorUid: user.uid,
  authorName: user.displayName,
  mediaUrl,
  type: mediaType, // 'image'|'video'|'text'
  text: caption,
  bgColor,
  views: [],
  reactions: {},
  createdAt: serverTimestamp(),
  expiresAt: Timestamp.fromDate(new Date(Date.now() + 86400000)), // 24h
});
```

### Step 2.10 — Load Real Stories from Firestore ❌ NEEDED
```js
const q = query(
  collection(db, 'stories'),
  where('expiresAt', '>', Timestamp.now()),
  orderBy('expiresAt', 'desc')
);
```

### Step 2.11 — Settings Persistence → Firestore ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/settings/SettingsPage.jsx`  
On every toggle:
```js
await updateDoc(doc(db, 'users', user.uid), {
  [`settings.${settingKey}`]: newValue,
  updatedAt: serverTimestamp(),
});
```
On app load in `useAuth.js`:
```js
const userSnap = await getDoc(doc(db, 'users', uid));
setUserSettings(userSnap.data()?.settings || DEFAULT_SETTINGS);
```

### Step 2.12 — Saved Posts Page → Read from Firestore ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/saved/SavedPage.jsx`  
```js
const savedSnap = await getDocs(collection(db, 'users', user.uid, 'saved'));
const postIds = savedSnap.docs.map(d => d.id);
const postDocs = await Promise.all(postIds.map(id => getDoc(doc(db, 'posts', id))));
setSavedPosts(postDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })));
```

---

# LAYER 3: DATING BACKEND (Days 5–8)
*Turn the fake swipe deck into a real matchmaking system*

### Step 3.1 — Load Real Dating Profiles from Firestore ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/dating/DatingPage.jsx`  
Replace the 5 hardcoded DEMO_PROFILES array:
```js
useEffect(() => {
  async function loadProfiles() {
    // Get UIDs already swiped
    const swipedSnap = await getDocs(collection(db, 'users', user.uid, 'swipes'));
    const swipedUids = new Set(swipedSnap.docs.map(d => d.id));
    swipedUids.add(user.uid); // exclude self

    const q = query(
      collection(db, 'users'),
      where('datingProfile.active', '==', true),
      limit(20)
    );
    const snap = await getDocs(q);
    const profiles = snap.docs
      .filter(d => !swipedUids.has(d.id))
      .map(d => ({ uid: d.id, ...d.data() }));
    setProfiles(profiles);
  }
  loadProfiles();
}, [user?.uid]);
```

### Step 3.2 — Save Swipe Decisions to Firestore ❌ NEEDED
```js
async function handleSwipe(targetUid, action) { // action: 'like' | 'pass'
  await setDoc(doc(db, 'users', user.uid, 'swipes', targetUid), {
    action,
    timestamp: serverTimestamp(),
  });
  
  if (action === 'like') {
    // Check if target already liked us (mutual like = match)
    const theirSwipe = await getDoc(doc(db, 'users', targetUid, 'swipes', user.uid));
    if (theirSwipe.exists() && theirSwipe.data().action === 'like') {
      await createMatch(user.uid, targetUid);
    }
  }
}
```

### Step 3.3 — Create Matches in Firestore ❌ NEEDED
```js
async function createMatch(uid1, uid2) {
  const matchId = [uid1, uid2].sort().join('_');
  await setDoc(doc(db, 'matches', matchId), {
    participants: [uid1, uid2],
    createdAt: serverTimestamp(),
    lastMessage: '',
    conversationId: matchId,
  });
  // Notify both users (handled by Cloud Function — see Layer 4)
}
```

### Step 3.4 — Dating Profile Setup → Save Active Flag ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/dating/DatingProfileEditPage.jsx`  
When user saves their dating profile:
```js
await updateDoc(doc(db, 'users', user.uid), {
  'datingProfile.active': true,
  'datingProfile.bio': bio,
  'datingProfile.age': age,
  'datingProfile.photos': photoUrls, // uploaded to Storage
  'datingProfile.interests': interests,
  'datingProfile.location': location,
  updatedAt: serverTimestamp(),
});
```

### Step 3.5 — Dating → Messages: Auto-Create Conversation on Match ❌ NEEDED
When match modal shows "Send a Message":
```js
async function startMatchConversation(matchId, otherUid) {
  await setDoc(doc(db, 'conversations', matchId), {
    participants: [user.uid, otherUid],
    matchId,
    createdAt: serverTimestamp(),
    lastMessage: '',
    isMatchConversation: true,
  });
  navigate(`/messages/${matchId}`);
}
```

---

# LAYER 4: CLOUD FUNCTIONS & PUSH NOTIFICATIONS (Days 8–11)
*Make the app react to events in real time — notifications, matches, moderation*

### Step 4.1 — Set Up Firebase Cloud Functions ❌ NEEDED
**File:** `ConnectHub-SPA/functions/index.js`  
This file exists but is mostly empty. These Cloud Functions are needed:

#### Function 1: notifyOnNewLike
```js
exports.notifyOnNewLike = functions.firestore
  .document('posts/{postId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const newLikers = after.likedBy.filter(uid => !before.likedBy.includes(uid));
    if (newLikers.length === 0) return;
    
    const liker = await admin.firestore().doc(`users/${newLikers[0]}`).get();
    await sendPushNotification(before.authorUid, {
      title: `${liker.data().displayName} liked your post`,
      body: after.content?.substring(0, 60) || 'Check it out!',
      url: `/post/${context.params.postId}`,
    });
  });
```

#### Function 2: notifyOnNewMessage
```js
exports.notifyOnNewMessage = functions.firestore
  .document('conversations/{convoId}/messages/{msgId}')
  .onCreate(async (snap, context) => {
    const msg = snap.data();
    const convo = await admin.firestore().doc(`conversations/${context.params.convoId}`).get();
    const recipientUid = convo.data().participants.find(uid => uid !== msg.senderUid);
    
    await sendPushNotification(recipientUid, {
      title: `New message from ${msg.senderName}`,
      body: msg.text?.substring(0, 80),
      url: `/messages/${context.params.convoId}`,
    });
  });
```

#### Function 3: notifyOnMatch (Dating)
```js
exports.notifyOnMatch = functions.firestore
  .document('matches/{matchId}')
  .onCreate(async (snap, context) => {
    const { participants } = snap.data();
    for (const uid of participants) {
      const other = participants.find(u => u !== uid);
      const otherUser = await admin.firestore().doc(`users/${other}`).get();
      await sendPushNotification(uid, {
        title: "💘 It's a Match!",
        body: `You and ${otherUser.data().displayName} liked each other!`,
        url: `/messages/${context.params.matchId}`,
      });
    }
  });
```

#### Helper: sendPushNotification (OneSignal)
```js
async function sendPushNotification(uid, { title, body, url }) {
  const userDoc = await admin.firestore().doc(`users/${uid}`).get();
  const onesignalId = userDoc.data()?.onesignalId;
  if (!onesignalId) return;
  
  await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [onesignalId],
      headings: { en: title },
      contents: { en: body },
      url,
    }),
  });
}
```

### Step 4.2 — Register OneSignal Player ID After Login ❌ NEEDED
**File:** `ConnectHub-SPA/src/hooks/useAuth.js` — after `setUser()`
```js
// Register OneSignal ID after login
if (window.OneSignal) {
  const onesignalId = await window.OneSignal.getUserId();
  if (onesignalId) {
    await updateDoc(doc(db, 'users', uid), { onesignalId });
  }
  window.OneSignal.setExternalUserId(uid);
}
```

### Step 4.3 — Deploy Cloud Functions ❌ NEEDED
```bash
cd ConnectHub-SPA
npm install firebase-functions firebase-admin
firebase deploy --only functions
```

---

# LAYER 5: PAYMENTS (Days 11–13)
*Make premium subscriptions and marketplace payments work*

### Step 5.1 — Add Stripe Keys ❌ NEEDED
```
# ConnectHub-SPA/.env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# ConnectHub-Backend/.env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
> ⚠️ **NEVER put `sk_live_` in frontend code.** Only `pk_` publishable key in frontend.

### Step 5.2 — Premium Checkout Flow ❌ NEEDED
**File:** `ConnectHub-SPA/src/pages/premium/PremiumPage.jsx`  
```js
async function handleUpgrade(planId) {
  const resp = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await user.getIdToken()}` },
    body: JSON.stringify({ planId, userId: user.uid }),
  });
  const { url } = await resp.json();
  window.location.href = url; // Redirect to Stripe Checkout
}
```

**File:** `ConnectHub-Backend/src/routes/` (new file `premium-payments.ts`):
```ts
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: req.user.email,
    line_items: [{ price: PLAN_PRICE_IDS[req.body.planId], quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/premium`,
    metadata: { userId: req.user.uid },
  });
  res.json({ url: session.url });
});
```

### Step 5.3 — Stripe Webhook: Unlock Premium ❌ NEEDED
```ts
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], WEBHOOK_SECRET);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    await admin.firestore().doc(`users/${userId}`).update({
      premium: true,
      premiumPlan: session.metadata.planId,
      premiumExpiry: new Date(Date.now() + 30 * 86400000), // 30 days
      premiumStripeCustomerId: session.customer,
    });
  }
  
  if (event.type === 'customer.subscription.deleted') {
    // Find user by customerId and revoke premium
    const usersSnap = await admin.firestore()
      .collection('users')
      .where('premiumStripeCustomerId', '==', event.data.object.customer)
      .get();
    usersSnap.docs.forEach(d => d.ref.update({ premium: false }));
  }
  
  res.json({ received: true });
});
```

### Step 5.4 — Marketplace Payments: Server-Side Price Validation ❌ NEEDED
Currently checkout sends price from client-side. This must be backend-validated:
```ts
router.post('/marketplace/create-payment-intent', authMiddleware, async (req, res) => {
  // Get actual price from Firestore — never trust client
  const listing = await admin.firestore().doc(`marketplace/${req.body.listingId}`).get();
  const actualPrice = listing.data().price;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(actualPrice * 100), // cents
    currency: 'usd',
    metadata: { buyerUid: req.user.uid, listingId: req.body.listingId },
  });
  res.json({ clientSecret: paymentIntent.client_secret });
});
```

---

# LAYER 6: SECURITY & INFRASTRUCTURE (Days 13–14)
*Lock down the app so it's safe for real users*

### Step 6.1 — Tighten Firestore Security Rules ❌ NEEDED
**File:** `ConnectHub-SPA/firestore.rules`  
Replace with ownership-enforced rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only edit their own profile
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
      
      match /swipes/{targetUid} { allow read, write: if request.auth.uid == uid; }
      match /saved/{postId} { allow read, write: if request.auth.uid == uid; }
      match /following/{fid} { allow read, write: if request.auth.uid == uid; }
      match /followers/{fid} { allow read: if request.auth != null; allow write: if request.auth.uid == fid; }
    }
    
    // Posts — only author can edit/delete
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.authorUid == request.auth.uid;
      allow update: if request.auth.uid == resource.data.authorUid 
        || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes','likedBy','reactions','comments','shares']);
      allow delete: if request.auth.uid == resource.data.authorUid;
      
      match /comments/{commentId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow delete: if request.auth.uid == resource.data.authorUid;
      }
    }
    
    // Conversations — only participants can read/write
    match /conversations/{convoId} {
      allow read, write: if request.auth.uid in resource.data.participants;
      match /messages/{msgId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/conversations/$(convoId)).data.participants;
        allow create: if request.auth.uid in get(/databases/$(database)/documents/conversations/$(convoId)).data.participants;
      }
    }
    
    // Matches — only participants can see
    match /matches/{matchId} {
      allow read: if request.auth.uid in resource.data.participants;
    }
    
    // Notifications — only recipient
    match /notifications/{nid} {
      allow read, write: if request.auth.uid == resource.data.recipientUid;
    }
    
    // Stories — anyone can read active, only author can write
    match /stories/{storyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.authorUid == request.auth.uid;
      allow delete: if request.auth.uid == resource.data.authorUid;
    }
    
    // Reports — anyone can create, nobody can read (admin only via Cloud Function)
    match /reports/{rid} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
  }
}
```

**Deploy:**
```bash
firebase deploy --only firestore:rules
```

### Step 6.2 — Configure Firebase Storage CORS ❌ NEEDED
Create `cors.json`:
```json
[{
  "origin": ["https://lynkapp.com", "https://www.lynkapp.com"],
  "method": ["GET", "POST", "PUT", "DELETE"],
  "maxAgeSeconds": 3600
}]
```
Run:
```bash
gsutil cors set cors.json gs://YOUR-PROJECT.appspot.com
```

### Step 6.3 — Remove API Keys from Git ❌ NEEDED (SECURITY EMERGENCY)
```bash
# Add to .gitignore first
echo "ConnectHub-SPA/.env" >> .gitignore
echo "ConnectHub-Backend/.env" >> .gitignore

# Remove from git tracking
git rm --cached ConnectHub-SPA/.env ConnectHub-Backend/.env

# Commit the removal
git add .gitignore
git commit -m "security: remove .env files from tracking"
git push
```
Then **immediately rotate all keys** in Firebase Console, Stripe Dashboard, OneSignal, etc.

### Step 6.4 — Enable Firebase App Check ❌ NEEDED
This prevents unauthorized apps from using your Firebase keys.  
In Firebase Console → App Check → Enable for each service.  
In `ConnectHub-SPA/src/firebase/config.js`:
```js
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true,
});
```

### Step 6.5 — Deploy Firestore Indexes ❌ NEEDED
**File:** `ConnectHub-SPA/firestore.indexes.json` (already exists)
```bash
firebase deploy --only firestore:indexes
```

### Step 6.6 — Add Back Button to TopNav on Nested Routes ❌ NEEDED
**File:** `ConnectHub-SPA/src/components/layout/TopNav.jsx`
```jsx
const isNested = location.pathname.split('/').length > 2;
// In render:
{isNested && (
  <button onClick={() => navigate(-1)} aria-label="Go back"
    style={{ background:'none', border:'none', color:'#f1f5f9', fontSize:22, cursor:'pointer', minWidth:44, minHeight:44, padding:'0 8px' }}>
    ‹
  </button>
)}
```

### Step 6.7 — Add Global Error Boundary ❌ NEEDED
**File:** `ConnectHub-SPA/src/App.jsx`
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('App crashed:', error, info); }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding:40, textAlign:'center', color:'#f1f5f9', background:'#0a0a1a', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:48 }}>😵</div>
        <h2 style={{ marginTop:16 }}>Something went wrong</h2>
        <p style={{ color:'#64748b' }}>Please refresh the page or contact support.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop:20, padding:'12px 24px', background:'#6366f1', border:'none', borderRadius:12, color:'white', cursor:'pointer', fontWeight:700 }}>
          Refresh App
        </button>
      </div>
    );
    return this.props.children;
  }
}
// Wrap routes: <ErrorBoundary><Routes>...</Routes></ErrorBoundary>
```

### Step 6.8 — Add Rate Limiting to All Write Operations ❌ NEEDED
```jsx
// Reusable hook — add to any submit handler:
const [submitting, setSubmitting] = useState(false);
const [lastSubmit, setLastSubmit] = useState(0);

async function handleSubmit() {
  const now = Date.now();
  if (submitting || now - lastSubmit < 3000) return; // 3s cooldown
  setSubmitting(true);
  setLastSubmit(now);
  try {
    await doFirestoreWrite();
  } finally {
    setSubmitting(false);
  }
}
```
Apply to: CreatePostPage, StoryCreatePage, CommentBox, MessagesPage, GroupCreatePage, EventCreatePage.

---

# LAYER 7: MUSIC PLAYER (Days 14–15)
*Make music actually play*

### Step 7.1 — Add Global Audio State to Store ❌ NEEDED
**File:** `ConnectHub-SPA/src/store/useAppStore.js`
```js
// Add to store:
currentTrack: null,
isPlaying: false,
setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: !!track }),
setIsPlaying: (v) => set({ isPlaying: v }),
```

### Step 7.2 — Add Audio Element to AppShell ❌ NEEDED
**File:** `ConnectHub-SPA/src/components/layout/AppShell.jsx`
```jsx
const audioRef = useRef(new Audio());
const { currentTrack, isPlaying, setIsPlaying } = useAppStore();

useEffect(() => {
  if (!currentTrack?.url) return;
  audioRef.current.src = currentTrack.url;
  audioRef.current.play()
    .then(() => setIsPlaying(true))
    .catch(e => { console.warn('Audio play blocked:', e); setIsPlaying(false); });
  
  // OS media controls
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: [{ src: currentTrack.artwork || '', sizes: '512x512', type: 'image/png' }],
    });
    navigator.mediaSession.setActionHandler('play', () => { audioRef.current.play(); setIsPlaying(true); });
    navigator.mediaSession.setActionHandler('pause', () => { audioRef.current.pause(); setIsPlaying(false); });
  }
}, [currentTrack]);

// Mini player controls use audioRef.current.play/pause
```

### Step 7.3 — Wire Radio Browser to Play Button ❌ NEEDED
**File:** Media Hub / Music page — play button onClick:
```js
import { setCurrentTrack } from '../../store/useAppStore';
// When user taps Play on a station:
setCurrentTrack({
  url: station.url_resolved,    // Direct stream URL from Radio Browser API
  title: station.name,
  artist: station.country || 'Radio Station',
  artwork: station.favicon || '/default-radio.png',
});
```
> ✅ `radio-browser-service.js` already returns `url_resolved` — this is the only connection needed.

---

# LAYER 8: FINAL VERIFICATION CHECKLIST (Day 15–16)

Run this complete smoke test before inviting beta users:

### Smoke Test — 5 Critical Flows

**Flow 1: Full Auth Cycle**
```
[ ] 1. Open app in incognito browser (no cache)
[ ] 2. See splash screen + login page (NOT demo/feed)
[ ] 3. Sign up with new email
[ ] 4. Get verification email → click link
[ ] 5. Complete onboarding → select interests → submit
[ ] 6. Land on Feed (empty but real)
[ ] 7. Sign out → sign back in → interests still there
[ ] 8. Profile page shows real name/email
```

**Flow 2: Post & Interact**
```
[ ] 1. Create a text post → appears in feed
[ ] 2. Refresh page → post is still there (Firestore persistence)
[ ] 3. Like the post → like count goes up
[ ] 4. Refresh → like is still there
[ ] 5. Comment on post → comment is visible
[ ] 6. Comment visible to another test account
[ ] 7. Delete post → gone after refresh
```

**Flow 3: Messaging**
```
[ ] 1. Find a user via Search
[ ] 2. Tap "Message" → new conversation created
[ ] 3. Type and send a message
[ ] 4. On second device/account → message is visible
[ ] 5. Reply from second account → first account sees reply in real time
```

**Flow 4: Dating**
```
[ ] 1. Set up dating profile (photos, bio, age)
[ ] 2. See real user profiles in swipe deck (not 5 fake ones)
[ ] 3. Like a profile that has already liked you
[ ] 4. Match popup appears
[ ] 5. "Send a Message" opens DM conversation
[ ] 6. Both users get push notification about the match
```

**Flow 5: Marketplace**
```
[ ] 1. Create a listing with real photo upload
[ ] 2. See listing in Marketplace
[ ] 3. Add to cart → proceed to checkout
[ ] 4. Stripe payment form appears (not just UI)
[ ] 5. Use Stripe test card (4242 4242 4242 4242) → payment succeeds
[ ] 6. Order appears in "My Orders" for buyer
[ ] 7. Order appears in Seller Dashboard
```

---

## 📅 COMPLETE TIMELINE — DEMO TO LIVE

| Week | Work | Result |
|------|------|--------|
| **Week 1, Days 1–3** | Layer 1: Auth (remove demo lock ✅, email verification, user doc creation, onboarding save) | Real users can sign up and stay logged in |
| **Week 1, Days 3–7** | Layer 2: Data persistence (feed CRUD, profile save, messages, stories, settings) | Everything saves and loads from real database |
| **Week 2, Days 8–11** | Layer 3: Dating backend + Layer 4: Cloud Functions + Push | Real swipes, real matches, real notifications |
| **Week 2, Days 11–13** | Layer 5: Payments (Stripe premium + marketplace) | Revenue works |
| **Week 2, Days 13–14** | Layer 6: Security (Firestore rules, CORS, App Check, rate limiting) | App is safe for real users |
| **Week 3, Day 15** | Layer 7: Music player real audio | Music actually plays |
| **Week 3, Day 16** | Layer 8: Full smoke test + bug fixes | Beta launch |

---

## 🚀 LAUNCH COMMAND SEQUENCE (When All Layers Are Done)

```bash
# 1. Build the production app
cd ConnectHub-SPA
npm run build

# 2. Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# 3. Deploy Cloud Functions
firebase deploy --only functions

# 4. Deploy frontend to S3/CloudFront
cd ..
.\deploy-to-s3.bat

# 5. Verify the live URL works
start https://lynkapp.com

# 6. Test sign-up flow on live site
# 7. Invite beta testers
```

---

## 💰 ESTIMATED COSTS (Monthly at 1,000 Beta Users)

| Service | Cost |
|---------|------|
| Firebase Firestore | ~$10–25/mo (Spark plan is free to 50k reads/day) |
| Firebase Storage | ~$5/mo (first 5GB free) |
| Firebase Cloud Functions | ~$5–10/mo (first 2M invocations free) |
| AWS S3 + CloudFront | ~$5–10/mo |
| Stripe | 2.9% + $0.30 per transaction (no monthly fee) |
| OneSignal | Free up to 10,000 subscribers |
| Sentry | Free up to 5,000 errors/month |
| **TOTAL** | **~$25–50/month for first 1,000 users** |

---

*Last updated: May 26, 2026*  
*Maintained by: Development Team*
