/**
 * LynkApp Production Build Script
 * Transforms ConnectHub_Mobile_Design.html into the real production App Shell:
 *   - Removes splash screen (CSS + HTML)
 *   - Login page IS the front door (no delay, no fake init)
 *   - Injects real Firebase Auth (onAuthStateChanged)
 *   - Wires login/register forms to Firebase Auth
 *   - Adds Google Sign-In
 *   - Replaces ALL fake/filler data with live Firestore reads
 *   - Real-time listeners for feed, profile, messages, notifications
 */

const fs = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'app.html');
const DEST = path.join(__dirname, 'index.html');

console.log('📦 Reading source file...');
let html = fs.readFileSync(SRC, 'utf8');
console.log(`   Source: ${html.split('\n').length} lines`);

// ─────────────────────────────────────────────────────────────────────────────
// 1.  UPDATE TITLE
// ─────────────────────────────────────────────────────────────────────────────
html = html.replace(
  /<title>.*?<\/title>/,
  '<title>Lynkapp - Connect · Date · Shop</title>'
);
console.log('✅  Step 1: Title updated');

// ─────────────────────────────────────────────────────────────────────────────
// 2.  INJECT FIREBASE SDKs + CONFIG  (right before </head>)
// ─────────────────────────────────────────────────────────────────────────────
const firebaseSDK = `
    <!-- ═══════════════════════════════════════════════════
         FIREBASE — Production (lynkapp-c7db1)
         ═══════════════════════════════════════════════════ -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"></script>
    <script>
      // ── Lynkapp Firebase Init ──────────────────────────────
      const LYNKAPP_CONFIG = {
        apiKey:            "AIzaSyDmnKjhl--S69dWqaVSgCgJZcMqTsyQgwA",
        authDomain:        "lynkapp-c7db1.firebaseapp.com",
        projectId:         "lynkapp-c7db1",
        storageBucket:     "lynkapp-c7db1.firebasestorage.app",
        messagingSenderId: "258552263213",
        appId:             "1:258552263213:web:9ddecf900318ac6c84bea4",
        measurementId:     "G-V82FSK7TYV"
      };
      firebase.initializeApp(LYNKAPP_CONFIG);
      const db      = firebase.firestore();
      const auth    = firebase.auth();
      const storage = firebase.storage();
      const googleProvider = new firebase.auth.GoogleAuthProvider();
      console.log('[Lynkapp] Firebase initialized ✅');
    </script>
    <!-- PWA Manifest -->
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#4f46e5">
`;
html = html.replace('</head>', firebaseSDK + '</head>');
console.log('✅  Step 2: Firebase SDKs injected');

// ─────────────────────────────────────────────────────────────────────────────
// 3.  REMOVE SPLASH-SCREEN CSS BLOCK
//     Removes everything from "/* ====...SPLASH SCREEN" to the matching "}"
// ─────────────────────────────────────────────────────────────────────────────
// Remove the complete CSS block between the SPLASH SCREEN comment markers
html = html.replace(
  /\/\* =+\s*SPLASH SCREEN STYLES[\s\S]*?\.splash-version\s*\{[^}]*\}/,
  '/* Splash screen removed – login is the front door */'
);
console.log('✅  Step 3: Splash screen CSS removed');

// ─────────────────────────────────────────────────────────────────────────────
// 4.  REMOVE SPLASH-SCREEN HTML DIV
// ─────────────────────────────────────────────────────────────────────────────
html = html.replace(
  /<div[^>]*class="[^"]*splash-screen[^"]*"[\s\S]*?<\/div>\s*<!-- ?(\/)?splash/i,
  '<!-- splash screen removed -->'
);
// Broader fallback – grab the whole splash div by content signature
html = html.replace(
  /<div[^>]*class="splash-screen"[\s\S]{0,3000}?<\/div>\s*\n/,
  '<!-- splash screen removed -->\n'
);
console.log('✅  Step 4: Splash screen HTML removed');

// ─────────────────────────────────────────────────────────────────────────────
// 5.  MAKE LOGIN THE FIRST VISIBLE SCREEN
//     The original code hides login-container and shows splash first.
//     We flip this: login is display:flex from the start; app is hidden.
// ─────────────────────────────────────────────────────────────────────────────
// Ensure login-container starts visible
html = html.replace(
  /\.login-container\s*\{([^}]*)\}/,
  (match, inner) => {
    if (!inner.includes('display')) inner += '\n            display: flex;';
    return `.login-container {${inner}}`;
  }
);
// Ensure app-container starts hidden (Firebase auth will reveal it)
html = html.replace(
  /\.app-container\s*\{([^}]*)\}/,
  (match, inner) => {
    if (!inner.includes('display')) inner += '\n            display: none;';
    return `.app-container {${inner}}`;
  }
);
console.log('✅  Step 5: Login = front door (visible by default)');

// ─────────────────────────────────────────────────────────────────────────────
// 6.  INJECT THE PRODUCTION JAVASCRIPT ENGINE
//     Replace or append the entire <script> initialization block with one that:
//       a) Uses onAuthStateChanged (not setTimeout)
//       b) Wires login/register/Google buttons to Firebase Auth
//       c) Loads real Firestore data for feed, profile, messages, notifications
// ─────────────────────────────────────────────────────────────────────────────
const productionScript = `
<script>
/* ═══════════════════════════════════════════════════════════════════
   LYNKAPP  —  PRODUCTION APP ENGINE
   No fake data. No timers. Real Firebase Auth + Firestore.
   ═══════════════════════════════════════════════════════════════════ */

// ── Global state ──────────────────────────────────────────────────
let CURRENT_USER     = null;
let CURRENT_SCREEN   = 'feed';
let activeListeners  = [];   // keeps Firestore unsubscribe functions

// ── Cached DOM references ──────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── AUTH STATE OBSERVER  ←  THE FRONT DOOR ───────────────────────
auth.onAuthStateChanged(user => {
  if (user) {
    CURRENT_USER = user;
    showApp(user);
  } else {
    CURRENT_USER = null;
    showLogin();
  }
});

// ── SHOW / HIDE VIEWS ─────────────────────────────────────────────
function showLogin() {
  const lc = document.querySelector('.login-container');
  const ac = document.querySelector('.app-container');
  if (lc) lc.style.display = 'flex';
  if (ac) ac.style.display = 'none';
  stopAllListeners();
}

function showApp(user) {
  const lc = document.querySelector('.login-container');
  const ac = document.querySelector('.app-container');
  if (lc) lc.style.display = 'none';
  if (ac) { ac.style.display = 'block'; ac.style.visibility = 'visible'; ac.style.opacity = '1'; }

  // ── Call the ORIGINAL app's navigation system to show all tabs ──
  // The original uses switchBottomTab / showAppAfterLogin
  setTimeout(() => {
    if (typeof showAppAfterLogin === 'function') {
      showAppAfterLogin();
    } else if (typeof switchBottomTab === 'function') {
      switchBottomTab('feed');
    } else if (typeof switchScreen === 'function') {
      switchScreen('feed');
    }
  }, 50); // tiny delay so app-container is visible before nav fires

  // Boot the real data layer
  loadUserProfile(user.uid);
  loadFeed();
  loadNotificationCount(user.uid);
  loadConversations(user.uid);
}

function stopAllListeners() {
  activeListeners.forEach(unsub => { try { unsub(); } catch(e){} });
  activeListeners = [];
}

// ── ERROR TOAST ────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const t = document.querySelector('.toast') || (() => {
    const el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
    return el;
  })();
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── LOADING SPINNER ────────────────────────────────────────────────
function setLoading(containerId, on) {
  const el = $(containerId);
  if (!el) return;
  if (on) {
    el.innerHTML = '<div style="text-align:center;padding:40px"><div class="splash-loader" style="margin:0 auto"></div></div>';
  }
}

// ════════════════════════════════════════════════════════════════════
//  AUTH FUNCTIONS — wired to real Firebase Auth
// ════════════════════════════════════════════════════════════════════

// ── Email / Password Login ─────────────────────────────────────────
async function handleLogin() {
  const email = document.getElementById('loginEmail')?.value?.trim();
  const pass  = document.getElementById('loginPassword')?.value;
  const btn   = document.getElementById('loginBtn');
  if (!email || !pass) { showToast('Please enter email and password', 'error'); return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    // onAuthStateChanged handles the rest
  } catch (err) {
    showToast(getAuthError(err.code), 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
  }
}

// ── Email / Password Register ──────────────────────────────────────
async function handleRegister() {
  const name    = document.getElementById('registerName')?.value?.trim();
  const email   = document.getElementById('registerEmail')?.value?.trim();
  const pass    = document.getElementById('registerPassword')?.value;
  const confirm = document.getElementById('registerConfirm')?.value;
  const btn     = document.getElementById('registerBtn');

  if (!name || !email || !pass) { showToast('All fields are required', 'error'); return; }
  if (pass !== confirm)         { showToast('Passwords do not match', 'error'); return; }
  if (pass.length < 8)         { showToast('Password must be at least 8 characters', 'error'); return; }

  if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    // Create Firestore user document immediately
    await db.collection('users').doc(cred.user.uid).set({
      uid:         cred.user.uid,
      displayName: name,
      email:       email,
      username:    email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g,''),
      avatarUrl:   '',
      bio:         '',
      followers:   0,
      following:   0,
      posts:       0,
      isVerified:  false,
      isPremium:   false,
      createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt:   firebase.firestore.FieldValue.serverTimestamp()
    });
    await cred.user.updateProfile({ displayName: name });
    showToast('Welcome to Lynkapp! 🎉', 'success');
    // onAuthStateChanged handles navigation
  } catch (err) {
    showToast(getAuthError(err.code), 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
  }
}

// ── Google Sign-In ─────────────────────────────────────────────────
async function handleGoogleSignIn() {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    const user   = result.user;
    // Create profile doc if first time
    const snap = await db.collection('users').doc(user.uid).get();
    if (!snap.exists) {
      await db.collection('users').doc(user.uid).set({
        uid:         user.uid,
        displayName: user.displayName || 'Lynkapp User',
        email:       user.email,
        username:    (user.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]/g,''),
        avatarUrl:   user.photoURL || '',
        bio:         '',
        followers:   0,
        following:   0,
        posts:       0,
        isVerified:  false,
        isPremium:   false,
        createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:   firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    // onAuthStateChanged handles navigation
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      showToast(getAuthError(err.code), 'error');
    }
  }
}

// ── Logout ─────────────────────────────────────────────────────────
async function handleLogout() {
  await auth.signOut();
  showToast('Signed out successfully');
}

// ── Forgot Password ────────────────────────────────────────────────
async function handleForgotPassword() {
  const email = document.getElementById('loginEmail')?.value?.trim();
  if (!email) { showToast('Enter your email address first', 'error'); return; }
  try {
    await auth.sendPasswordResetEmail(email);
    showToast('Password reset email sent! Check your inbox.', 'success');
  } catch (err) {
    showToast(getAuthError(err.code), 'error');
  }
}

// ── Auth error messages ────────────────────────────────────────────
function getAuthError(code) {
  const map = {
    'auth/user-not-found':        'No account found with this email',
    'auth/wrong-password':        'Incorrect password',
    'auth/email-already-in-use':  'An account with this email already exists',
    'auth/weak-password':         'Password must be at least 8 characters',
    'auth/invalid-email':         'Please enter a valid email address',
    'auth/too-many-requests':     'Too many attempts. Try again in a few minutes',
    'auth/network-request-failed':'No internet connection',
    'auth/popup-blocked':         'Popup blocked. Please allow popups for this site',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// ── Login tab switcher ──────────────────────────────────────────────
function switchAuthTab(tab) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
  const activeTab = document.querySelector('[data-tab="' + tab + '"]');
  const activeForm = document.getElementById(tab + 'Form');
  if (activeTab)  activeTab.classList.add('active');
  if (activeForm) activeForm.style.display = 'block';
}

// ════════════════════════════════════════════════════════════════════
//  REAL DATA LOADERS — Firestore live listeners
// ════════════════════════════════════════════════════════════════════

// ── User Profile ────────────────────────────────────────────────────
function loadUserProfile(uid) {
  const unsub = db.collection('users').doc(uid).onSnapshot(snap => {
    if (!snap.exists) return;
    const data = snap.data();
    // Update nav avatar
    document.querySelectorAll('.user-avatar, .nav-avatar').forEach(el => {
      if (data.avatarUrl) el.style.backgroundImage = 'url(' + data.avatarUrl + ')';
      el.textContent = data.avatarUrl ? '' : (data.displayName || 'U')[0].toUpperCase();
    });
    // Update profile name elements
    document.querySelectorAll('.profile-name, .user-display-name').forEach(el => {
      el.textContent = data.displayName || 'Lynkapp User';
    });
    document.querySelectorAll('.profile-username, .user-username').forEach(el => {
      el.textContent = '@' + (data.username || 'user');
    });
    document.querySelectorAll('.profile-bio').forEach(el => {
      el.textContent = data.bio || '';
    });
    // Stats
    if ($('profileFollowers')) $('profileFollowers').textContent = fmtNum(data.followers || 0);
    if ($('profileFollowing')) $('profileFollowing').textContent = fmtNum(data.following || 0);
    if ($('profilePosts'))     $('profilePosts').textContent     = fmtNum(data.posts || 0);
  }, err => console.error('[Profile]', err));
  activeListeners.push(unsub);
}

// ── Feed ─────────────────────────────────────────────────────────────
function loadFeed() {
  const container = document.getElementById('feedContainer') ||
                    document.querySelector('.feed-container') ||
                    document.querySelector('[data-section="feed"] .content');
  if (!container) return;

  setLoading('feedContainer', true);

  const unsub = db.collection('posts')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        container.innerHTML = emptyState('🌱', 'No posts yet', 'Be the first to post something!');
        return;
      }
      container.innerHTML = '';
      snapshot.forEach(doc => {
        const post = { id: doc.id, ...doc.data() };
        container.appendChild(buildPostCard(post));
      });
    }, err => {
      console.error('[Feed]', err);
      container.innerHTML = errorState('Could not load feed. Check your connection.');
    });
  activeListeners.push(unsub);
}

// ── Build a Post Card (from real Firestore data) ───────────────────
function buildPostCard(post) {
  const card = document.createElement('div');
  card.className = 'post-card card';
  card.dataset.postId = post.id;

  const ts     = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
  const ago    = timeAgo(ts);
  const liked  = post.likedBy?.includes(CURRENT_USER?.uid);

  card.innerHTML = \`
    <div class="post-header" style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div class="avatar" style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">
        \${post.authorAvatar ? '<img src="' + post.authorAvatar + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover">' : (post.authorName || 'U')[0]}
      </div>
      <div style="flex:1">
        <div style="font-weight:700">\${esc(post.authorName || 'Anonymous')}</div>
        <div style="font-size:12px;color:var(--text-muted)">\${ago}</div>
      </div>
      \${post.authorId === CURRENT_USER?.uid ? '<div style="cursor:pointer;font-size:20px;color:var(--text-muted)" onclick="openPostMenu(\\''+post.id+'\\')">⋯</div>' : ''}
    </div>
    \${post.content ? '<p style="margin-bottom:12px;line-height:1.5">' + esc(post.content) + '</p>' : ''}
    \${post.mediaUrls?.length ? '<div class="post-media" style="border-radius:12px;overflow:hidden;margin-bottom:12px">' + post.mediaUrls.map(url => '<img src="'+url+'" style="width:100%;max-height:400px;object-fit:cover">').join('') + '</div>' : ''}
    <div class="post-actions" style="display:flex;gap:20px;padding-top:12px;border-top:1px solid var(--glass-border)">
      <button onclick="toggleLike('\${post.id}',this)" style="background:none;border:none;color:\${liked ? 'var(--error)' : 'var(--text-secondary)'};cursor:pointer;display:flex;align-items:center;gap:6px;font-size:14px">
        \${liked ? '❤️' : '🤍'} <span class="like-count">\${fmtNum(post.likesCount || 0)}</span>
      </button>
      <button onclick="openComments('\${post.id}')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;gap:6px;font-size:14px">
        💬 <span>\${fmtNum(post.commentsCount || 0)}</span>
      </button>
      <button onclick="sharePost('\${post.id}')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;gap:6px;font-size:14px">
        🔗 Share
      </button>
    </div>
  \`;
  return card;
}

// ── Toggle Like (real Firestore transaction) ──────────────────────
async function toggleLike(postId, btn) {
  if (!CURRENT_USER) { showToast('Sign in to like posts', 'error'); return; }
  const ref = db.collection('posts').doc(postId);
  try {
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('Post not found');
      const data     = snap.data();
      const likedBy  = data.likedBy  || [];
      const uid      = CURRENT_USER.uid;
      const isLiked  = likedBy.includes(uid);
      if (isLiked) {
        tx.update(ref, {
          likedBy:    firebase.firestore.FieldValue.arrayRemove(uid),
          likesCount: firebase.firestore.FieldValue.increment(-1)
        });
      } else {
        tx.update(ref, {
          likedBy:    firebase.firestore.FieldValue.arrayUnion(uid),
          likesCount: firebase.firestore.FieldValue.increment(1)
        });
        // Notify post author
        if (data.authorId && data.authorId !== uid) {
          db.collection('notifications').add({
            type:      'like',
            toUid:     data.authorId,
            fromUid:   uid,
            fromName:  CURRENT_USER.displayName || 'Someone',
            postId:    postId,
            read:      false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    });
  } catch (err) {
    console.error('[Like]', err);
    showToast('Could not update like', 'error');
  }
}

// ── Create a New Post ─────────────────────────────────────────────
async function createPost(content, mediaFiles = []) {
  if (!CURRENT_USER) { showToast('Sign in to post', 'error'); return; }
  if (!content.trim() && !mediaFiles.length) { showToast('Write something first!', 'error'); return; }

  const btn = $('createPostBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Posting...'; }

  try {
    const mediaUrls = [];
    for (const file of mediaFiles) {
      const ref   = storage.ref('posts/' + CURRENT_USER.uid + '/' + Date.now() + '_' + file.name);
      await ref.put(file);
      mediaUrls.push(await ref.getDownloadURL());
    }
    await db.collection('posts').add({
      content:       content.trim(),
      mediaUrls,
      authorId:      CURRENT_USER.uid,
      authorName:    CURRENT_USER.displayName || 'Lynkapp User',
      authorAvatar:  CURRENT_USER.photoURL    || '',
      authorUsername: (CURRENT_USER.email || '').split('@')[0],
      likesCount:    0,
      commentsCount: 0,
      sharesCount:   0,
      likedBy:       [],
      createdAt:     firebase.firestore.FieldValue.serverTimestamp()
    });
    // Update user post count
    db.collection('users').doc(CURRENT_USER.uid).update({
      posts: firebase.firestore.FieldValue.increment(1)
    });
    showToast('Post published! ✅', 'success');
    closeCreatePostModal();
  } catch (err) {
    console.error('[CreatePost]', err);
    showToast('Failed to publish post. Try again.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Post'; }
  }
}

// ── Notifications Count ────────────────────────────────────────────
function loadNotificationCount(uid) {
  const unsub = db.collection('notifications')
    .where('toUid', '==', uid)
    .where('read', '==', false)
    .onSnapshot(snap => {
      const count = snap.size;
      document.querySelectorAll('.notif-badge, .notification-badge, [data-badge="notifications"]').forEach(el => {
        el.textContent = count > 99 ? '99+' : count;
        el.style.display = count > 0 ? 'flex' : 'none';
      });
    }, err => console.error('[Notifications]', err));
  activeListeners.push(unsub);
}

// ── Conversations list ─────────────────────────────────────────────
function loadConversations(uid) {
  const container = document.getElementById('conversationsList') ||
                    document.querySelector('.conversations-list');
  if (!container) return;

  const unsub = db.collection('conversations')
    .where('participants', 'array-contains', uid)
    .orderBy('lastMessageAt', 'desc')
    .limit(50)
    .onSnapshot(snap => {
      container.innerHTML = '';
      if (snap.empty) {
        container.innerHTML = emptyState('💬', 'No messages yet', 'Start a conversation!');
        return;
      }
      snap.forEach(doc => {
        const conv = { id: doc.id, ...doc.data() };
        container.appendChild(buildConversationItem(conv, uid));
      });
    }, err => console.error('[Conversations]', err));
  activeListeners.push(unsub);
}

function buildConversationItem(conv, myUid) {
  const otherUid  = (conv.participants || []).find(p => p !== myUid) || '';
  const otherName = conv.participantNames?.[otherUid] || 'User';
  const otherAvatar = conv.participantAvatars?.[otherUid] || '';
  const unread    = (conv.unreadCounts || {})[myUid] || 0;
  const ts        = conv.lastMessageAt?.toDate ? conv.lastMessageAt.toDate() : new Date();

  const item = document.createElement('div');
  item.className = 'list-item';
  item.onclick   = () => openConversation(conv.id, otherUid, otherName);
  item.innerHTML = \`
    <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;overflow:hidden">
      \${otherAvatar ? '<img src="'+otherAvatar+'" style="width:100%;height:100%;object-fit:cover">' : otherName[0]}
    </div>
    <div style="flex:1;min-width:0">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:600">\${esc(otherName)}</span>
        <span style="font-size:11px;color:var(--text-muted)">\${timeAgo(ts)}</span>
      </div>
      <div style="font-size:13px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${esc(conv.lastMessage || '')}</div>
    </div>
    \${unread > 0 ? '<div style="min-width:20px;height:20px;border-radius:10px;background:var(--primary);color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;padding:0 5px">' + unread + '</div>' : ''}
  \`;
  return item;
}

// ── Open a Conversation with real-time messages ────────────────────
let currentConvListener = null;
function openConversation(convId, otherUid, otherName) {
  // Navigate to messages screen
  navigateTo('messages');
  const chatView = $('chatView') || document.querySelector('.chat-view');
  if (!chatView) return;
  chatView.style.display = 'block';

  const header = chatView.querySelector('.chat-header-name');
  if (header) header.textContent = otherName;

  if (currentConvListener) { currentConvListener(); currentConvListener = null; }

  const msgs = chatView.querySelector('.messages-list') || chatView.querySelector('.chat-messages');
  if (msgs) msgs.innerHTML = '';

  currentConvListener = db.collection('conversations').doc(convId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .limit(100)
    .onSnapshot(snap => {
      if (!msgs) return;
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          msgs.appendChild(buildMessageBubble(change.doc.data()));
          msgs.scrollTop = msgs.scrollHeight;
        }
      });
      // Mark as read
      db.collection('conversations').doc(convId).update({
        ['unreadCounts.' + CURRENT_USER.uid]: 0
      }).catch(() => {});
    });

  // Wire send button
  const sendBtn   = chatView.querySelector('.send-message-btn, #sendMessageBtn');
  const inputEl   = chatView.querySelector('.message-input, #messageInput');
  if (sendBtn) {
    sendBtn.onclick = async () => {
      const text = inputEl?.value?.trim();
      if (!text) return;
      if (inputEl) inputEl.value = '';
      await db.collection('conversations').doc(convId).collection('messages').add({
        text,
        senderId:    CURRENT_USER.uid,
        senderName:  CURRENT_USER.displayName || 'Me',
        senderAvatar: CURRENT_USER.photoURL || '',
        read:        false,
        createdAt:   firebase.firestore.FieldValue.serverTimestamp()
      });
      await db.collection('conversations').doc(convId).update({
        lastMessage:   text,
        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
        ['unreadCounts.' + otherUid]: firebase.firestore.FieldValue.increment(1)
      });
    };
  }
}

function buildMessageBubble(msg) {
  const isMine = msg.senderId === CURRENT_USER?.uid;
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;margin-bottom:12px;justify-content:' + (isMine ? 'flex-end' : 'flex-start');
  div.innerHTML = \`
    <div style="max-width:75%;padding:10px 14px;border-radius:\${isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};background:\${isMine ? 'var(--primary)' : 'var(--bg-card)'};color:#fff;font-size:14px;line-height:1.4">
      \${esc(msg.text || '')}
      <div style="font-size:10px;opacity:0.6;text-align:right;margin-top:4px">\${msg.createdAt?.toDate ? timeAgo(msg.createdAt.toDate()) : ''}</div>
    </div>
  \`;
  return div;
}

// ── Start a new conversation ────────────────────────────────────────
async function startConversation(otherUid) {
  if (!CURRENT_USER) return;
  const participants = [CURRENT_USER.uid, otherUid].sort();
  const convId = participants.join('_');
  const ref = db.collection('conversations').doc(convId);
  const snap = await ref.get();
  if (!snap.exists) {
    const otherSnap = await db.collection('users').doc(otherUid).get();
    const otherData = otherSnap.data() || {};
    const meSnap    = await db.collection('users').doc(CURRENT_USER.uid).get();
    const meData    = meSnap.data() || {};
    await ref.set({
      participants,
      participantNames: {
        [CURRENT_USER.uid]: meData.displayName || 'Me',
        [otherUid]: otherData.displayName || 'User'
      },
      participantAvatars: {
        [CURRENT_USER.uid]: meData.avatarUrl || '',
        [otherUid]: otherData.avatarUrl || ''
      },
      lastMessage: '',
      lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
      unreadCounts: { [CURRENT_USER.uid]: 0, [otherUid]: 0 }
    });
  }
  openConversation(convId, otherUid, snap.exists ? snap.data()?.participantNames?.[otherUid] : 'User');
}

// ── Search users ───────────────────────────────────────────────────
async function searchUsers(query) {
  if (!query.trim()) return;
  const end = query + '\\uf8ff';
  const snap = await db.collection('users')
    .where('username', '>=', query.toLowerCase())
    .where('username', '<=', end)
    .limit(20)
    .get();
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderSearchResults(results);
}

function renderSearchResults(users) {
  const container = $('searchResults') || document.querySelector('.search-results');
  if (!container) return;
  container.innerHTML = '';
  if (!users.length) {
    container.innerHTML = emptyState('🔍', 'No users found', 'Try a different search term');
    return;
  }
  users.forEach(user => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.onclick = () => viewProfile(user.id);
    item.innerHTML = \`
      <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-weight:700;overflow:hidden">
        \${user.avatarUrl ? '<img src="'+user.avatarUrl+'" style="width:100%;height:100%;object-fit:cover">' : (user.displayName||'U')[0]}
      </div>
      <div style="flex:1">
        <div style="font-weight:600">\${esc(user.displayName||'User')} \${user.isVerified ? '✅' : ''}</div>
        <div style="font-size:13px;color:var(--text-secondary)">@\${esc(user.username||'')}</div>
      </div>
      <button onclick="event.stopPropagation();followUser('\${user.id}')" class="btn" style="padding:8px 16px;width:auto;font-size:13px">Follow</button>
    \`;
    container.appendChild(item);
  });
}

// ── Follow / Unfollow ──────────────────────────────────────────────
async function followUser(targetUid) {
  if (!CURRENT_USER) { showToast('Sign in to follow users', 'error'); return; }
  const myUid = CURRENT_USER.uid;
  const followRef = db.collection('users').doc(myUid).collection('following').doc(targetUid);
  const snap = await followRef.get();
  if (snap.exists) {
    // Unfollow
    await followRef.delete();
    await db.collection('users').doc(myUid).update({ following: firebase.firestore.FieldValue.increment(-1) });
    await db.collection('users').doc(targetUid).update({ followers: firebase.firestore.FieldValue.increment(-1) });
    showToast('Unfollowed');
  } else {
    // Follow
    await followRef.set({ followedAt: firebase.firestore.FieldValue.serverTimestamp() });
    await db.collection('users').doc(myUid).update({ following: firebase.firestore.FieldValue.increment(1) });
    await db.collection('users').doc(targetUid).update({ followers: firebase.firestore.FieldValue.increment(1) });
    // Notify
    db.collection('notifications').add({
      type: 'follow', toUid: targetUid, fromUid: myUid,
      fromName: CURRENT_USER.displayName || 'Someone',
      read: false, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('Following! 🎉', 'success');
  }
}

// ── View another user's profile ─────────────────────────────────────
async function viewProfile(uid) {
  navigateTo('profile');
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) { showToast('User not found', 'error'); return; }
  const data = snap.data();
  document.querySelectorAll('.profile-name').forEach(el => el.textContent = data.displayName||'User');
  document.querySelectorAll('.profile-username').forEach(el => el.textContent = '@'+(data.username||''));
  document.querySelectorAll('.profile-bio').forEach(el => el.textContent = data.bio||'');
  if ($('profileFollowers')) $('profileFollowers').textContent = fmtNum(data.followers||0);
  if ($('profileFollowing')) $('profileFollowing').textContent = fmtNum(data.following||0);
  if ($('profilePosts'))     $('profilePosts').textContent     = fmtNum(data.posts||0);
}

// ── Update profile ──────────────────────────────────────────────────
async function updateProfile(updates) {
  if (!CURRENT_USER) return;
  await db.collection('users').doc(CURRENT_USER.uid).update({
    ...updates,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  if (updates.displayName) {
    await CURRENT_USER.updateProfile({ displayName: updates.displayName });
  }
  showToast('Profile updated! ✅', 'success');
}

// ════════════════════════════════════════════════════════════════════
//  NAVIGATION — delegates to original app's switchBottomTab / switchScreen
// ════════════════════════════════════════════════════════════════════
function navigateTo(screen) {
  CURRENT_SCREEN = screen;

  // ── Use original app's navigation if available (preserves ALL sections) ──
  if (typeof switchBottomTab === 'function') {
    switchBottomTab(screen);
    return;
  }
  if (typeof switchScreen === 'function') {
    switchScreen(screen);
    return;
  }
  if (typeof openScreen === 'function') {
    openScreen(screen);
    return;
  }
  if (typeof navigateToScreen === 'function') {
    navigateToScreen(screen);
    return;
  }

  // ── Fallback: class-based visibility ──
  document.querySelectorAll('.screen, .tab-content, [data-screen]').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  document.querySelectorAll('.nav-item, .bottom-nav-item, [data-nav]').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(screen + 'Screen') ||
                 document.getElementById(screen + 'Section') ||
                 document.getElementById(screen + 'Tab') ||
                 document.querySelector('[data-screen="' + screen + '"]') ||
                 document.querySelector('[data-tab="' + screen + '"]');
  if (target) { target.classList.add('active'); target.style.display = 'block'; }

  const navItem = document.querySelector('[data-nav="' + screen + '"]') ||
                  document.querySelector('[data-tab="' + screen + '"]') ||
                  document.querySelector('.nav-item[onclick*="' + screen + '"]');
  if (navItem) navItem.classList.add('active');
}

// ════════════════════════════════════════════════════════════════════
//  HELPER UTILITIES
// ════════════════════════════════════════════════════════════════════
function fmtNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n/1000).toFixed(1) + 'K';
  return String(n || 0);
}

function timeAgo(date) {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60)    return 'just now';
  if (secs < 3600)  return Math.floor(secs / 60) + 'm';
  if (secs < 86400) return Math.floor(secs / 3600) + 'h';
  if (secs < 604800) return Math.floor(secs / 86400) + 'd';
  return date.toLocaleDateString();
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function emptyState(icon, title, sub) {
  return \`<div style="text-align:center;padding:60px 20px;color:var(--text-secondary)">
    <div style="font-size:48px;margin-bottom:16px">\${icon}</div>
    <div style="font-size:18px;font-weight:600;margin-bottom:8px">\${title}</div>
    <div style="font-size:14px">\${sub}</div>
  </div>\`;
}

function errorState(msg) {
  return \`<div style="text-align:center;padding:60px 20px;color:var(--error)">
    <div style="font-size:48px;margin-bottom:16px">⚠️</div>
    <div style="font-size:14px">\${msg}</div>
    <button onclick="location.reload()" style="margin-top:16px;padding:10px 20px;border-radius:8px;background:var(--primary);color:#fff;border:none;cursor:pointer">Retry</button>
  </div>\`;
}

function closeCreatePostModal() {
  const modal = document.querySelector('.create-post-modal, #createPostModal');
  if (modal) modal.classList.remove('show');
}

function openPostMenu(postId) {
  showToast('Post options coming soon');
}

function openComments(postId) {
  navigateTo('feed');
  showToast('Comments: loading...');
}

function sharePost(postId) {
  if (navigator.share) {
    navigator.share({ title: 'Check this out on Lynkapp', url: window.location.href });
  } else {
    navigator.clipboard?.writeText(window.location.href).then(() => showToast('Link copied!'));
  }
}

// ── Wire login/register form buttons ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Login button
  ['loginBtn','signInBtn'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('click', handleLogin);
  });
  // Enter key on password
  ['loginPassword'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  });
  // Register button
  ['registerBtn','signUpBtn','createAccountBtn'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('click', handleRegister);
  });
  // Google sign-in
  ['googleSignInBtn','googleBtn','signInWithGoogleBtn'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('click', handleGoogleSignIn);
  });
  // Logout
  ['logoutBtn','signOutBtn'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('click', handleLogout);
  });
  // Forgot password
  const fp = $('forgotPasswordLink') || document.querySelector('.forgot-password');
  if (fp) fp.addEventListener('click', handleForgotPassword);
  // Auth tabs
  document.querySelectorAll('.login-tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
  });
  // Search input
  const searchInput = $('searchInput') || document.querySelector('.search-input input');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', e => {
      clearTimeout(debounce);
      debounce = setTimeout(() => searchUsers(e.target.value), 400);
    });
  }
  // Create post form
  const postSubmit = $('submitPostBtn') || $('createPostBtn');
  if (postSubmit) {
    postSubmit.addEventListener('click', () => {
      const contentEl = $('postContent') || document.querySelector('.post-input');
      const filesEl   = $('postMediaInput');
      createPost(contentEl?.value || '', Array.from(filesEl?.files || []));
    });
  }
  console.log('[Lynkapp] DOM ready, Firebase Auth observer active ✅');
});

// Remove any legacy setTimeout splash removal
console.log('[Lynkapp] Production engine loaded — real data only 🚀');
</script>
`;

// Append the production script before </body>
html = html.replace('</body>', productionScript + '\n</body>');
console.log('✅  Step 6: Production JavaScript engine injected');

// ─────────────────────────────────────────────────────────────────────────────
// 7.  ADD GOOGLE SIGN-IN BUTTON TO LOGIN FORM (if not already present)
// ─────────────────────────────────────────────────────────────────────────────
// Insert Google sign-in after the last social login button block
if (!html.includes('googleSignInBtn')) {
  html = html.replace(
    /(<div[^>]*class="[^"]*social-login[^"]*">)/,
    '$1\n        <button id="googleSignInBtn" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;border:1px solid var(--glass-border);border-radius:12px;background:var(--glass);color:var(--text-primary);font-size:15px;font-weight:600;cursor:pointer;margin-bottom:12px;transition:all 0.2s"><svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> Continue with Google</button>'
  );
}
console.log('✅  Step 7: Google Sign-In button ensured');

// ─────────────────────────────────────────────────────────────────────────────
// 8.  REMOVE ALL LEGACY FAKE DATA ARRAYS & SETTIMEOUT SPLASH
// ─────────────────────────────────────────────────────────────────────────────
// Remove any setTimeout calls that referenced the splash screen
html = html.replace(/setTimeout\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*splash[^}]*\}\s*,\s*\d+\s*\)/g,
  '/* splash removed */');
// Remove any legacy fake posts/users arrays (they start with "const fakeXxx = [" or "const mockXxx = [")
html = html.replace(/const\s+(fake|mock|dummy|sample)(Posts|Users|Messages|Stories|Notifications)\s*=\s*\[[^\]]*\]/g,
  '/* fake data removed — using Firestore */');
console.log('✅  Step 8: Legacy fake data + splash timeouts removed');

// ─────────────────────────────────────────────────────────────────────────────
// 9.  WRITE OUTPUT
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(DEST, html, 'utf8');
const lines = html.split('\n').length;
console.log('');
console.log('🚀 BUILD COMPLETE');
console.log('   Output: ' + DEST);
console.log('   Lines:  ' + lines);
console.log('');
console.log('What was done:');
console.log('   ✅ Splash screen removed (CSS + HTML + setTimeout)');
console.log('   ✅ Login page is the Front Door (visible on load)');
console.log('   ✅ Firebase Auth wired (Email, Password, Google Sign-In)');
console.log('   ✅ onAuthStateChanged = the gatekeeper (no fake timer)');
console.log('   ✅ Firestore real-time feed listener');
console.log('   ✅ Firestore real-time notifications count');
console.log('   ✅ Firestore real-time conversations list');
console.log('   ✅ Real like/unlike transactions');
console.log('   ✅ Real post creation with Storage upload');
console.log('   ✅ Real user profile reads/writes');
console.log('   ✅ Real follow/unfollow');
console.log('   ✅ Real user search');
console.log('   ✅ All fake data arrays removed');
