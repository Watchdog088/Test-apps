# Option B — React SPA Migration Guide
## Converting `ConnectHub_Mobile_Design.html` → `ConnectHub-SPA/` (React + Vite)

---

## ⚠️ CRITICAL: Source File Rule
**Every single step in this guide reads from EXACTLY one source file:**
```
c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub_Mobile_Design.html
```
This is the file that was fixed (crash patches applied, CSS/JS extracted). It is the ONLY version used.
- `ConnectHub_Mobile_Design_BACKUP.html` = untouched original — DO NOT use as source
- `ConnectHub_Mobile_Design_Complete.html` = old variant — DO NOT use as source
- `ConnectHub_Mobile_Design_Ad_Integrated.html` = old variant — DO NOT use as source

Before EVERY step, verify you are working from the right file:
```bash
# Run this to confirm before each step
node -e "const fs=require('fs'); const h=fs.readFileSync('ConnectHub_Mobile_Design.html','utf8'); console.log('SIZE:'+Math.round(fs.statSync('ConnectHub_Mobile_Design.html').size/1024)+'KB | PATCH:'+h.includes('PRODUCTION SAFETY PATCH'));"
```
**Expected output:** `SIZE:549KB | PATCH:true`  
If you see 1096KB or PATCH:false — STOP and re-run `apply-fixes-now.js` first.

---

## Migration Overview

```
SOURCE (existing monolith):              TARGET (React SPA):
ConnectHub_Mobile_Design.html  →         ConnectHub-SPA/
connecthub-styles.css                    └── src/
connecthub-app.js                            ├── pages/         (20 screen components)
ConnectHub_Mobile_Design_*_System.js         ├── components/    (shared UI)
                                             ├── hooks/         (Firebase + state)
                                             ├── styles/        (CSS per screen)
                                             └── firebase/      (already set up)
```

**Total steps: 8**  
**Total estimated time: 3–4 weeks**  
**Each step has its own ✅ TEST PLAN before you move on.**

---

## STEP 0 — Environment Setup & Verification
**Time: 1–2 hours**  
**Goal:** Confirm Node, npm, and the ConnectHub-SPA project are working before writing any code.

### 0.1 — Confirm the Source File is Correct
```bash
cd c:\Users\Jnewball\Test-apps\Test-apps
node -e "const fs=require('fs'); const h=fs.readFileSync('ConnectHub_Mobile_Design.html','utf8'); console.log('SIZE:'+Math.round(fs.statSync('ConnectHub_Mobile_Design.html').size/1024)+'KB | PATCH:'+h.includes('PRODUCTION SAFETY PATCH'));"
```
✅ Must show: `SIZE:549KB | PATCH:true`

### 0.2 — Install Dependencies in ConnectHub-SPA
```bash
cd c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
npm install
```
Expected: No errors. `node_modules/` folder is created.

### 0.3 — Verify Dev Server Starts
```bash
cd c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
npm run dev
```
Expected: Terminal shows `Local: http://localhost:5173/`

### 0.4 — Copy Environment Variables
```bash
# In ConnectHub-SPA folder
copy .env.example .env
```
Then open `.env` and fill in your Firebase config values from `ConnectHub-Frontend/.env`.

---

### ✅ STEP 0 TEST PLAN
| Test | How to Check | Pass Condition |
|------|-------------|----------------|
| Source file is correct | Run verification command above | Shows `549KB \| PATCH:true` |
| npm install works | Check for errors in terminal | No red error lines |
| Dev server starts | Run `npm run dev` | Browser opens at `http://localhost:5173` |
| No blank white screen | Look at browser | Any content visible (even placeholder) |
| Console is clean | Open browser DevTools → Console | No red errors |

**DO NOT proceed to Step 1 until all 5 tests pass.**

---

## STEP 1 — Audit All 20 Screens in Source HTML
**Time: 2–3 hours**  
**Goal:** Build a complete inventory of every screen, its HTML section ID, its JS file, and its CSS dependencies from `ConnectHub_Mobile_Design.html`. This becomes your migration checklist.

### 1.1 — Run the Screen Inventory Script
Save this as `audit-screens.js` and run it:
```js
// audit-screens.js
const fs = require('fs');
const html = fs.readFileSync('ConnectHub_Mobile_Design.html', 'utf8');

// Find all section/screen container IDs
const ids = [];
const regex = /id="([a-z0-9-]+(?:-section|-screen|-panel|-view))"/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  if (!ids.includes(match[1])) ids.push(match[1]);
}

// Find all companion JS files referenced
const scripts = (html.match(/src="([^"]+\.js)"/gi)||[]).map(s => s.replace(/src="|"/g,''));

console.log('=== SCREENS FOUND IN ConnectHub_Mobile_Design.html ===');
ids.forEach((id, i) => console.log((i+1) + '. ' + id));
console.log('\n=== JS FILES LOADED ===');
scripts.forEach(s => console.log('  - ' + s));
```
```bash
node audit-screens.js
```

### 1.2 — Build Your Migration Checklist
Using the output from 1.1, create a table like this (fill in from actual output):

| # | Screen ID in HTML | React Page File | Companion JS File | Status |
|---|---|---|---|---|
| 1 | `feed-section` | `src/pages/Feed.jsx` | `ConnectHub_Mobile_Design_Feed_System.js` | ⬜ Not started |
| 2 | `messages-section` | `src/pages/Messages.jsx` | `ConnectHub_Mobile_Design_Messages_System.js` | ⬜ Not started |
| 3 | `dating-section` | `src/pages/Dating.jsx` | `ConnectHub_Mobile_Design_Dating_System.js` | ⬜ Not started |
| 4 | `stories-section` | `src/pages/Stories.jsx` | `ConnectHub_Mobile_Design_Stories_System.js` | ⬜ Not started |
| 5 | `trending-section` | `src/pages/Trending.jsx` | `ConnectHub_Mobile_Design_Trending_System.js` | ⬜ Not started |
| 6 | `friends-section` | `src/pages/Friends.jsx` | `ConnectHub_Mobile_Design_Friends_System.js` | ⬜ Not started |
| 7 | `groups-section` | `src/pages/Groups.jsx` | `ConnectHub_Mobile_Design_Groups_System_Complete.js` | ⬜ Not started |
| 8 | `events-section` | `src/pages/Events.jsx` | `ConnectHub_Mobile_Design_Events_System.js` | ⬜ Not started |
| 9 | `notifications-section` | `src/pages/Notifications.jsx` | `ConnectHub_Mobile_Design_Notifications_System.js` | ⬜ Not started |
| 10 | `search-section` | `src/pages/Search.jsx` | `ConnectHub_Mobile_Design_Search_System.js` | ⬜ Not started |
| 11 | `settings-section` | `src/pages/Settings.jsx` | `ConnectHub_Mobile_Design_Settings_System_Complete.js` | ⬜ Not started |
| 12 | `live-section` | `src/pages/LiveStream.jsx` | `ConnectHub_Mobile_Design_Live_System_Backend_Complete.js` | ⬜ Not started |
| 13 | `gaming-section` | `src/pages/Gaming.jsx` | `ConnectHub_Mobile_Design_Gaming_System.js` | ⬜ Not started |
| 14 | `music-section` | `src/pages/Music.jsx` | `ConnectHub_Music_Player_Dashboards_Complete.js` | ⬜ Not started |
| 15 | `ar-vr-section` | `src/pages/ArVr.jsx` | `ConnectHub_Mobile_Design_AR_VR_System.js` | ⬜ Not started |
| 16 | `video-calls-section` | `src/pages/VideoCalls.jsx` | `ConnectHub_Mobile_Design_Video_Calls_System.js` | ⬜ Not started |
| 17 | `marketplace-section` | `src/pages/Marketplace.jsx` | `ConnectHub_Mobile_Design_Marketplace_System.js` | ⬜ Not started |
| 18 | `profile-section` | `src/pages/Profile.jsx` | `ConnectHub_Mobile_Design_Profile_System.js` | ⬜ Not started |
| 19 | `help-section` | `src/pages/HelpSupport.jsx` | `ConnectHub_Mobile_Design_Help_Support_System.js` | ⬜ Not started |
| 20 | `auth-screen` | `src/pages/Auth.jsx` | `ConnectHub_Mobile_Design_Auth_Onboarding_Complete.js` | ⬜ Not started |

---

### ✅ STEP 1 TEST PLAN
| Test | How to Check | Pass Condition |
|------|-------------|----------------|
| audit-screens.js ran on the correct file | Script reads `ConnectHub_Mobile_Design.html` at root | Output shows 549KB file |
| All screens inventoried | Count rows in checklist | At least 18 screens found |
| Each screen has a companion JS file identified | Review checklist | No blank JS file column |
| Source file unchanged after audit | Run verification command | Still `549KB \| PATCH:true` |

---

## STEP 2 — Set Up React Router & App Shell
**Time: 2–3 hours**  
**Goal:** Wire up React Router so navigating to `/feed`, `/messages`, `/dating` etc. loads the correct page. The `ConnectHub-SPA/src/App.jsx` and `AppShell.jsx` already exist — this step wires them together with routing.

### 2.1 — Install React Router
```bash
cd c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
npm install react-router-dom
```

### 2.2 — Update `src/main.jsx` — Wrap App in Router
```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

### 2.3 — Update `src/App.jsx` — Add All Routes with Lazy Loading
```jsx
// src/App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import { useAuth } from './hooks/useAuth.js';

// Lazy load every screen — each becomes its own JS chunk
const Auth        = lazy(() => import('./pages/Auth.jsx'));
const Feed        = lazy(() => import('./pages/Feed.jsx'));
const Messages    = lazy(() => import('./pages/Messages.jsx'));
const Dating      = lazy(() => import('./pages/Dating.jsx'));
const Stories     = lazy(() => import('./pages/Stories.jsx'));
const Trending    = lazy(() => import('./pages/Trending.jsx'));
const Friends     = lazy(() => import('./pages/Friends.jsx'));
const Groups      = lazy(() => import('./pages/Groups.jsx'));
const Events      = lazy(() => import('./pages/Events.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));
const Search      = lazy(() => import('./pages/Search.jsx'));
const Settings    = lazy(() => import('./pages/Settings.jsx'));
const LiveStream  = lazy(() => import('./pages/LiveStream.jsx'));
const Gaming      = lazy(() => import('./pages/Gaming.jsx'));
const Music       = lazy(() => import('./pages/Music.jsx'));
const ArVr        = lazy(() => import('./pages/ArVr.jsx'));
const VideoCalls  = lazy(() => import('./pages/VideoCalls.jsx'));
const Marketplace = lazy(() => import('./pages/Marketplace.jsx'));
const Profile     = lazy(() => import('./pages/Profile.jsx'));
const HelpSupport = lazy(() => import('./pages/HelpSupport.jsx'));

// Loading spinner shown while any lazy page is loading
function PageLoader() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0a0a'}}>
      <div style={{color:'#fff',fontSize:'18px'}}>Loading...</div>
    </div>
  );
}

// Auth guard — redirects to /auth if not logged in
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<PrivateRoute><AppShell /></PrivateRoute>}>
          <Route index         element={<Navigate to="/feed" replace />} />
          <Route path="feed"         element={<Feed />} />
          <Route path="messages"     element={<Messages />} />
          <Route path="dating"       element={<Dating />} />
          <Route path="stories"      element={<Stories />} />
          <Route path="trending"     element={<Trending />} />
          <Route path="friends"      element={<Friends />} />
          <Route path="groups"       element={<Groups />} />
          <Route path="events"       element={<Events />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="search"       element={<Search />} />
          <Route path="settings"     element={<Settings />} />
          <Route path="live"         element={<LiveStream />} />
          <Route path="gaming"       element={<Gaming />} />
          <Route path="music"        element={<Music />} />
          <Route path="ar-vr"        element={<ArVr />} />
          <Route path="video-calls"  element={<VideoCalls />} />
          <Route path="marketplace"  element={<Marketplace />} />
          <Route path="profile"      element={<Profile />} />
          <Route path="help"         element={<HelpSupport />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
```

### 2.4 — Create Placeholder Files for All 20 Pages
Run this script to create stub files for every page so the router doesn't crash:
```js
// save as: create-page-stubs.js  (run from ConnectHub-SPA folder)
const fs = require('fs');
const path = require('path');

const pages = [
  'Auth','Feed','Messages','Dating','Stories','Trending',
  'Friends','Groups','Events','Notifications','Search',
  'Settings','LiveStream','Gaming','Music','ArVr',
  'VideoCalls','Marketplace','Profile','HelpSupport'
];

const dir = path.join(__dirname, 'src', 'pages');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

pages.forEach(name => {
  const file = path.join(dir, name + '.jsx');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `// ${name}.jsx — TODO: migrate from ConnectHub_Mobile_Design.html\nexport default function ${name}() {\n  return <div style={{padding:'20px',color:'#fff'}}><h1>${name}</h1><p>Coming soon — migrating from ConnectHub_Mobile_Design.html</p></div>;\n}\n`);
    console.log('Created stub: ' + name + '.jsx');
  }
});
console.log('Done — all page stubs created.');
```
```bash
cd c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
node create-page-stubs.js
npm run dev
```

---

### ✅ STEP 2 TEST PLAN
| Test | How to Check | Pass Condition |
|------|-------------|----------------|
| Dev server starts after changes | `npm run dev` | No build errors |
| `/auth` route loads | Visit `http://localhost:5173/auth` | Page renders (even if placeholder) |
| `/feed` route loads | Visit `http://localhost:5173/feed` | Page renders without white screen |
| `/dating` route loads | Visit `http://localhost:5173/dating` | Page renders without white screen |
| Auth redirect works | Visit `http://localhost:5173/` without being logged in | Redirects to `/auth` |
| No console errors | DevTools → Console | No red errors |
| Source HTML unchanged | Run verification command | Still `549KB \| PATCH:true` |

---

## STEP 3 — Migrate CSS from Source HTML
**Time: 2–4 hours**  
**Goal:** Move all styles from `connecthub-styles.css` (extracted from `ConnectHub_Mobile_Design.html`) into the React project. The CSS itself does NOT change — only where it lives.

### 3.1 — Copy Global CSS
```bash
# From project root
copy connecthub-styles.css ConnectHub-SPA\src\styles\connecthub-styles.css
```

### 3.2 — Import in `main.jsx`
```jsx
// src/main.jsx — add this import
import './styles/connecthub-styles.css';
```

### 3.3 — Verify No Visual Regressions
Open `ConnectHub_Mobile_Design.html` in a browser side-by-side with the SPA at `http://localhost:5173/feed`. The colors, fonts, and layouts should match.

### 3.4 — Split CSS Per Section (Optional but Recommended)
For each section (e.g., Feed), create a CSS file:
```
src/styles/
  global.css           ← app-wide styles (already exists)
  connecthub-styles.css ← all styles from source HTML
  feed.css             ← feed-specific styles (split out later)
  messages.css
  dating.css
  ... (one per screen)
```
Import in each component:
```jsx
// Feed.jsx
import '../styles/feed.css';
```

---

### ✅ STEP 3 TEST PLAN
| Test | How to Check | Pass Condition |
|------|-------------|----------------|
| CSS file copied correctly | Check `ConnectHub-SPA/src/styles/connecthub-styles.css` exists | File is 53–54 KB |
| No CSS import errors | `npm run dev` terminal | No red errors |
| App background color matches | Compare SPA to `ConnectHub_Mobile_Design.html` | Same dark background |
| Fonts match | Compare SPA to source HTML | Same font family |
| Source file unchanged | Run verification command | Still `549KB \| PATCH:true` |

---

## STEP 4 — Migrate the Auth Screen (Screen 1 of 20)
**Time: 3–4 hours**  
**Goal:** Migrate the login/signup screen from `ConnectHub_Mobile_Design.html` into `src/pages/Auth.jsx`. This is done FIRST because every other screen depends on auth being working.

### 4.1 — Extract Auth HTML from Source
```js
// save as: extract-section.js
const fs = require('fs');

const SOURCE = 'ConnectHub_Mobile_Design.html'; // Always this file
const SECTION_ID = 'auth-screen'; // Change this for each section

const html = fs.readFileSync(SOURCE, 'utf8');

// Extract the section block
const startTag = new RegExp(`<div[^>]+id="${SECTION_ID}"[^>]*>`, 'i');
const match = startTag.exec(html);
if (!match) { console.error('Section not found:', SECTION_ID); process.exit(1); }

let start = match.index;
let depth = 0;
let i = start;
while (i < html.length) {
  if (html[i] === '<' && html[i+1] !== '/') depth++;
  if (html[i] === '<' && html[i+1] === '/') depth--;
  if (depth === 0 && i > start) { i++; break; }
  i++;
}

const sectionHTML = html.slice(start, i);
fs.writeFileSync('extracted-section.html', sectionHTML, 'utf8');
console.log('Extracted', SECTION_ID, '-', sectionHTML.length, 'chars');
console.log('Saved to: extracted-section.html');
```
```bash
node extract-section.js
```

### 4.2 — Convert to JSX
Open `extracted-section.html` and convert the HTML to a React component in `ConnectHub-SPA/src/pages/Auth.jsx`:

**Conversion Rules:**
- `class=` → `className=`
- `for=` → `htmlFor=`
- `onclick="fn()"` → `onClick={fn}` (move function to component body)
- Inline `style="color:red"` → `style={{color:'red'}}`
- Self-closing tags: `<input>` → `<input />`
- `<img src="...">` → `<img src="..." loading="lazy" />`
- Move all `<script>` logic into the component as `useState`, `useEffect`, or handler functions

**Example structure:**
```jsx
// src/pages/Auth.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config.js';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/feed');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    // Paste converted JSX from extracted-section.html here
    // Replace all onclick/class/for attributes as described above
    <div id="auth-screen" className="auth-screen">
      {/* ... rest of JSX ... */}
    </div>
  );
}
```

### 4.3 — Connect Firebase Auth
The `ConnectHub-SPA/src/firebase/config.js` already exists. Import from it:
```js
import { auth } from '../firebase/config.js';
```

---

### ✅ STEP 4 TEST PLAN
| Test | How to Check | Pass Condition |
|------|-------------|----------------|
| Auth page renders | Visit `http://localhost:5173/auth` | Login form visible, no white screen |
| Login form matches original | Compare to `ConnectHub_Mobile_Design.html` auth screen | Same layout and fields |
| Email/password fields work | Type in them | Text appears |
| Login button fires | Click Login | No JS crash, console shows attempt |
| Firebase login works | Use real test account credentials | Redirects to `/feed` after login |
| Invalid login shows error | Use wrong password | Error message displayed |
| Signup works | Switch to signup, create account | New account created, redirected to `/feed` |
| Source HTML unchanged | Run verification command | Still `549KB \| PATCH:true` |

---

## STEP 5 — Migrate the Feed Screen (Screen 2 of 20)
**Time: 4–6 hours**  
**Goal:** Migrate the Feed screen from `ConnectHub_Mobile_Design.html`. This is the first screen users see after login and is the most important to get right.

### 5.1 — Extract Feed HTML
```bash
# Edit extract-section.js, change SECTION_ID to 'feed-section'
# Then run:
node extract-section.js
```

### 5.2 — Identify Feed JS Logic
Open `ConnectHub_Mobile_Design_Feed_System.js` — this is the JavaScript that powered the feed in the original monolith. Read through it and identify:
- What functions it defines
- What DOM IDs it references
- What Firebase calls it makes
- What data it loads

### 5.3 — Convert Feed to React Component
```jsx
// src/pages/Feed.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import '../styles/feed.css'; // if using per-screen CSS

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
        const snap = await getDocs(q);
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.warn('[Feed] Error loading posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  if (loading) return <div className="loading">Loading feed...</div>;

  return (
    <div id="feed-section" className="feed-section">
      {/* Paste converted JSX from extracted-section.html */}
      {/* Replace hardcoded post HTML with: */}
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostCard({ post }) {
  return (
    <div className="post-card">
      <h3>{post.author?.name}</h3>
      <p>{post.content}</p>
      {post.imageUrl && <img src={post.imageUrl} alt="post" loading="lazy" />}
    </div>
  );
}
```

### 5.4 — Update Migration Checklist
Mark Feed as ✅ Complete in your Step 1 checklist.

---

### ✅ STEP 5 TEST PLAN
| Test | How to Check | Pass Condition |
|------|-------------|----------------|
| Feed page renders | Visit `http://localhost:5173/feed` while logged in | Feed visible, no white screen |
| Layout matches original | Compare to `ConnectHub_Mobile_Design.html` feed section | Same structure, same CSS classes |
| Posts load from Firebase | Check if posts appear | Post cards visible (or "no posts" state) |
| Images have lazy loading | Inspect any `<img>` tag in DevTools | Has `loading="lazy"` attribute |
| No console errors | DevTools → Console | No red errors |
| Feed is only screen loaded | DevTools → Network tab, filter JS | Only Feed chunk downloaded, NOT dating/gaming/etc. |
| Navigation works | Click bottom nav tabs | Other sections load (as stubs) |
| Source HTML unchanged | Run verification command | Still `549KB \| PATCH:true` |

---

## STEP 6 — Migrate Remaining 18 Screens (One at a Time)
**Time: 1–2 days per screen, ~2–3 weeks total**  
**Goal:** Repeat the same extract-and-convert process from Steps 4–5 for every remaining screen. Do them in this priority order:

### Priority Order
1. ✅ Auth (done in Step 4)
2. ✅ Feed (done in Step 5)
3. **Messages** — highest daily use
4. **Profile** — second highest daily use
5. **Notifications** — needed for engagement
6. **Search** — core discovery
7. **Friends** — social graph
8. **Dating** — key feature
9. **Stories** — top of feed
10. **Settings** — user configuration
11. **Groups** — community feature
12. **Events** — scheduled content
13. **Trending** — discovery
14. **Live Streaming** — real-time
15. **Video Calls** — real-time
16. **Music** — media
17. **Gaming** — media
18. **Marketplace** — commerce
19. **AR/VR** — advanced feature
20. **Help/Support** — last (rarely visited)

### Process for Each Screen
```bash
# Step A: Verify source file is correct EVERY TIME
node -e "const fs=require('fs'); const h=fs.readFileSync('ConnectHub_Mobile_Design.html','utf8'); console.log('SIZE:'+Math.round(fs.statSync('ConnectHub_Mobile_Design.html').size/1024)+'KB | PATCH:'+h.includes('PRODUCTION SAFETY PATCH'));"
# Must show: SIZE:549KB | PATCH:true

# Step B: Extract the section HTML
# Edit extract-section.js → set SECTION_ID = 'messages-section' (or whichever)
node extract-section.js

# Step C: Read the companion JS file
# Open ConnectHub_Mobile_Design_Messages_System.js
# Identify all functions and Firebase calls

# Step D: Create the React component
# Create ConnectHub-SPA/src/pages/Messages.jsx
# Paste converted JSX + port JS logic to React hooks

# Step E: Run tests (see test plan below)

# Step F: Mark screen as complete in checklist
```

---

### ✅ STEP 6 TEST PLAN (run after EACH screen migration)
| Test | How to Check | Pass Condition |
|------|-------------|----------------|
| Screen renders | Visit its route | No white screen, no JS crash |
| Layout matches source | Side-by-side compare with `ConnectHub_Mobile_Design.html` | Same structure and styles |
| Core functionality works | Use the screen's main feature | Feature works (send message, swipe card, etc.) |
| Firebase reads work | Check if data loads | Data appears OR graceful empty state shown |
| Firebase writes work | Perform a write action | Data saved (verify in Firebase console) |
| No memory leaks | Open DevTools → Memory | No huge growth after navigating in/out |
| Only this screen's JS loaded | Network tab, filter by JS | Only this chunk downloaded, not 18 others |
| Previous screens still work | Navigate to previously migrated screens | All still function correctly |
| Source HTML unchanged | Run verification command | Still `549KB \| PATCH:true` |

---

## STEP 7 — Update Bottom Navigation
**Time: 2–3 hours**  
**Goal:** Wire `ConnectHub-SPA/src/components/layout/BottomNav.jsx` (already exists) to use React Router navigation instead of `showSection()` calls from the original HTML.

### 7.1 — Update BottomNav.jsx
```jsx
// src/components/layout/BottomNav.jsx
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/feed',    icon: '🏠', label: 'Home'     },
  { path: '/search',  icon: '🔍', label: 'Search'   },
  { path: '/stories', icon: '⭕', label: 'Stories'  },
  { path: '/messages',icon: '💬', label: 'Messages' },
  { path: '/profile', icon: '👤', label: 'Profile'  },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

### 7.2 — Update AppShell.jsx
```jsx
// src/components/layout/AppShell.jsx
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';

export default function AppShell() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet /> {/* This renders the active route's page */}
      </main>
      <BottomNav />
    </div>
  );
}
```

---

### ✅ STEP 7 TEST PLAN
| Test | How to Check | Pass Condition |
|------|-------------|----------------|
| Bottom nav is visible | Look at bottom of screen | 5 nav icons visible |
| Tapping Home goes to Feed | Click Home icon | URL changes to `/feed`, Feed loads |
| Tapping Messages works | Click Messages icon | URL changes to `/messages`, Messages loads |
| Active state highlights | Observe current tab icon | Active tab has different style |
| Nav is hidden on Auth screen | Visit `/auth` | Bottom nav NOT visible |
| Back button works | Use browser back | Navigates to previous screen |
| Source HTML unchanged | Run verification command | Still `549KB \| PATCH:true` |

---

## STEP 8 — Build, Test, and Deploy
**Time: 4–8 hours**  
**Goal:** Run the production build, verify all 20 screens, and deploy to AWS S3 or Firebase Hosting.

### 8.1 — Run Production Build
```bash
cd c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
npm run build
```
Expected: `dist/` folder created. Check sizes:
```bash
dir dist\assets\
```
You should see many small `.js` files (one per screen) instead of one giant file.

### 8.2 — Preview Production Build Locally
```bash
npm run preview
```
Visit `http://localhost:4173/` — test every screen.

### 8.3 — Final Verification Against Source HTML
For every screen, open `ConnectHub_Mobile_Design.html` side-by-side with the SPA and verify they match visually and functionally.

### 8.4 — Deploy to AWS S3
```bash
# Upload dist/ to S3
aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
```
Or Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # select dist/ as public dir
firebase deploy
```

---

### ✅ STEP 8 TEST PLAN
| Test | How to Check | Pass Condition |
|------|-------------|----------------|
| Build completes without errors | `npm run build` terminal | No red errors, `dist/` created |
| Chunk splitting happened | `dir dist\assets\` | Multiple small `.js` files, none over 200KB |
| All 20 screens render | Visit each `/route` in preview | All show content, no white screens |
| Auth works on production build | Login with real account | Works and redirects to feed |
| Feed loads posts | Check `/feed` | Posts appear |
| Messages load | Check `/messages` | Messages appear |
| Bottom nav works | Click all tabs | All 5 navigate correctly |
| First load is fast | DevTools → Network → Disable cache → Reload | Initial download under 200KB |
| Only Feed JS downloads on first load | Network tab filter JS | Only Feed chunk, not all 20 |
| Dating JS only downloads when visited | Navigate to /dating | Dating chunk downloads ONLY at that moment |
| No console errors on any screen | DevTools → Console | Zero red errors |
| Source HTML still intact | Run verification command | Still `SIZE:549KB \| PATCH:true` |

---

## Complete Migration Checklist

| Step | Task | Status |
|------|------|--------|
| Step 0 | Environment setup, source file verified | ⬜ |
| Step 1 | All 20 screens inventoried | ⬜ |
| Step 2 | React Router + App Shell + page stubs | ⬜ |
| Step 3 | CSS migrated from connecthub-styles.css | ⬜ |
| Step 4 | Auth screen migrated | ⬜ |
| Step 5 | Feed screen migrated | ⬜ |
| Step 6a | Messages migrated | ⬜ |
| Step 6b | Profile migrated | ⬜ |
| Step 6c | Notifications migrated | ⬜ |
| Step 6d | Search migrated | ⬜ |
| Step 6e | Friends migrated | ⬜ |
| Step 6f | Dating migrated | ⬜ |
| Step 6g | Stories migrated | ⬜ |
| Step 6h | Settings migrated | ⬜ |
| Step 6i | Groups migrated | ⬜ |
| Step 6j | Events migrated | ⬜ |
| Step 6k | Trending migrated | ⬜ |
| Step 6l | Live Streaming migrated | ⬜ |
| Step 6m | Video Calls migrated | ⬜ |
| Step 6n | Music migrated | ⬜ |
| Step 6o | Gaming migrated | ⬜ |
| Step 6p | Marketplace migrated | ⬜ |
| Step 6q | AR/VR migrated | ⬜ |
| Step 6r | Help/Support migrated | ⬜ |
| Step 7 | Bottom navigation wired | ⬜ |
| Step 8 | Production build + deploy | ⬜ |
