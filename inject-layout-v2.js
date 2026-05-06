/**
 * inject-layout-v2.js
 * Injects left sidebar, more drawer, feed improvements, and JS helpers
 * into ConnectHub_Mobile_Design.html in a single safe pass.
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'ConnectHub_Mobile_Design.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// ─── 1. Add sidebar-active to app-container ───────────────────────────────
html = html.replace(
  /(<div class="app-container)(")/,
  '$1 sidebar-active" id="appContainer'
);

// ─── 2. Inject left-sidebar + more-drawer RIGHT AFTER app-container opening tag ───
const SIDEBAR_HTML = `
    <!-- ════ LEFT SIDEBAR — PRIMARY NAV ════ -->
    <nav class="left-sidebar" id="leftSidebar">
      <div class="sidebar-logo-spot" onclick="sidebarNav('feed')" title="Home">🔗</div>
      <div class="sidebar-item active" id="sb-feed" onclick="sidebarNav('feed')" title="Home">
        <span class="sidebar-icon">🏠</span><span class="sidebar-label">Home</span>
      </div>
      <div class="sidebar-item" id="sb-live" onclick="sidebarNav('live')" title="Live">
        <span class="sidebar-icon">🔴</span><span class="sidebar-label">Live</span>
        <span class="sidebar-live-dot"></span>
      </div>
      <div class="sidebar-item" id="sb-dating" onclick="sidebarNav('dating')" title="Dating">
        <span class="sidebar-icon">❤️</span><span class="sidebar-label">Dating</span>
      </div>
      <div class="sidebar-item" id="sb-messages" onclick="sidebarNav('messages')" title="Messages">
        <span class="sidebar-icon">💬</span><span class="sidebar-label">Chat</span>
        <span class="sidebar-badge" id="sb-msg-badge" style="display:none">3</span>
      </div>
      <div class="sidebar-item" id="sb-marketplace" onclick="sidebarNav('marketplace')" title="Marketplace">
        <span class="sidebar-icon">🛒</span><span class="sidebar-label">Market</span>
      </div>
      <div class="sidebar-mini-player" onclick="openScreen('musicPlayer')" title="Music Player">
        <span class="mini-player-note">🎵</span><span class="mini-player-label">Music</span>
      </div>
    </nav>
    <!-- ════ MORE OVERFLOW DRAWER ════ -->
    <div class="more-overlay" id="moreOverlay" onclick="closeMoreDrawer()"></div>
    <div class="more-drawer" id="moreDrawer">
      <div class="more-drawer-header">
        <span class="more-drawer-title">More</span>
        <div class="more-drawer-close" onclick="closeMoreDrawer()">✕</div>
      </div>
      <div class="more-section-label">Discover</div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('search')"><div class="more-item-icon">🔍</div><span class="more-item-text">Search &amp; Explore</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('trending')"><div class="more-item-icon">📈</div><span class="more-item-text">Trending</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('events')"><div class="more-item-icon">📅</div><span class="more-item-text">Events</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('groups')"><div class="more-item-icon">👥</div><span class="more-item-text">Groups</span></div>
      <div class="more-divider"></div>
      <div class="more-section-label">You</div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('friends')"><div class="more-item-icon">👫</div><span class="more-item-text">Friends</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('saved')"><div class="more-item-icon">💾</div><span class="more-item-text">Saved</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('notifications')"><div class="more-item-icon">🔔</div><span class="more-item-text">Notifications</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('premium')"><div class="more-item-icon">⭐</div><span class="more-item-text">Premium</span></div>
      <div class="more-divider"></div>
      <div class="more-section-label">Create &amp; Earn</div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('creatorProfile')"><div class="more-item-icon">🎨</div><span class="more-item-text">Creator Studio</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('businessTools')"><div class="more-item-icon">💼</div><span class="more-item-text">Business Tools</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('marketplace')"><div class="more-item-icon">🛒</div><span class="more-item-text">Marketplace</span></div>
      <div class="more-divider"></div>
      <div class="more-section-label">Entertainment</div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('musicPlayer')"><div class="more-item-icon">🎵</div><span class="more-item-text">Music Player</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('gaming')"><div class="more-item-icon">🎮</div><span class="more-item-text">Gaming Hub</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('mediaHub')"><div class="more-item-icon">🎬</div><span class="more-item-text">Media Hub</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('arVr')"><div class="more-item-icon">🌐</div><span class="more-item-text">AR / VR</span></div>
      <div class="more-divider"></div>
      <div class="more-section-label">Account</div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('settings')"><div class="more-item-icon">⚙️</div><span class="more-item-text">Settings</span></div>
      <div class="more-item" onclick="closeMoreDrawer();openScreen('helpSupport')"><div class="more-item-icon">❓</div><span class="more-item-text">Help &amp; Support</span></div>
      <div class="more-item" onclick="closeMoreDrawer();if(typeof handleLogout==='function')handleLogout()"><div class="more-item-icon">🚪</div><span class="more-item-text">Sign Out</span></div>
    </div>
`;

// Insert after <div class="app-container ..."> (now includes id="appContainer")
html = html.replace(
  /(<div class="app-container[^"]*"[^>]*>)/,
  '$1\n' + SIDEBAR_HTML
);

// ─── 3. Wire ☰ menu button to openMoreDrawer ──────────────────────────────
// Replace the hamburger nav-btn that opens 'menu' screen
html = html.replace(
  /onclick="openScreen\('menu'\)">☰/g,
  `onclick="openMoreDrawer()" title="More">☰`
);

// ─── 4. Inject stories carousel + filter pills at top of feed-screen ──────
const FEED_EXTRAS = `
                <!-- ── Stories Row ── -->
                <div class="feed-stories-row" id="feedStoriesRow">
                  <div class="feed-story-bubble" onclick="openModal && openModal('createStory')">
                    <div class="feed-story-ring add-ring"><div class="feed-story-inner" style="font-size:18px">➕</div></div>
                    <span class="feed-story-name">Your Story</span>
                  </div>
                  <div class="feed-story-bubble" onclick="switchPillTab&&switchPillTab(document.querySelector('.pill-nav-button'),'stories')">
                    <div class="feed-story-ring"><div class="feed-story-inner">👤</div></div>
                    <span class="feed-story-name">Alex</span>
                  </div>
                  <div class="feed-story-bubble">
                    <div class="feed-story-ring"><div class="feed-story-inner">😊</div></div>
                    <span class="feed-story-name">Jordan</span>
                  </div>
                  <div class="feed-story-bubble">
                    <div class="feed-story-ring"><div class="feed-story-inner">🎨</div></div>
                    <span class="feed-story-name">Sam</span>
                  </div>
                  <div class="feed-story-bubble">
                    <div class="feed-story-ring"><div class="feed-story-inner">🌟</div></div>
                    <span class="feed-story-name">Taylor</span>
                  </div>
                </div>
                <!-- ── Feed Filter Pills ── -->
                <div class="feed-filter-bar" id="feedFilterBar">
                  <div class="feed-pill active" onclick="setFeedFilter(this,'foryou')">For You</div>
                  <div class="feed-pill" onclick="setFeedFilter(this,'following')">Following</div>
                  <div class="feed-pill" onclick="setFeedFilter(this,'trending')">Trending</div>
                  <div class="feed-pill" onclick="setFeedFilter(this,'friends')">Friends</div>
                  <div class="feed-pill" onclick="setFeedFilter(this,'live')">🔴 Live</div>
                </div>
`;

// Insert right after the feed-screen div opening
html = html.replace(
  /(<div[^>]+id="feed-screen"[^>]*>)/,
  '$1\n' + FEED_EXTRAS
);

// ─── 5. Inject FAB button for creating posts (fixed-position, feed only) ──
const FAB_HTML = `
    <!-- ── Create-Post FAB (shown on feed) ── -->
    <button class="feed-fab" id="createPostFab" onclick="openModal&&openModal('createPost')" title="Create Post" aria-label="Create Post">✏️</button>
`;

// Insert just before </body>
html = html.replace(/<\/body>/i, FAB_HTML + '\n</body>');

// ─── 6. Inject sidebar JS helpers just before </body> ─────────────────────
const JS_HELPERS = `
<script>
/* ── v2 Layout Helpers ─────────────────────────────────────────── */

// Sidebar navigation — updates active state and switches screen
function sidebarNav(screenName) {
  try {
    // Update sidebar active item
    document.querySelectorAll('.sidebar-item').forEach(function(el) {
      el.classList.remove('active');
    });
    var target = document.getElementById('sb-' + screenName);
    if (target) target.classList.add('active');

    // Show FAB only on feed
    var fab = document.getElementById('createPostFab');
    if (fab) fab.style.display = (screenName === 'feed') ? 'flex' : 'none';

    // Navigate using existing openScreen if available
    if (typeof openScreen === 'function') {
      openScreen(screenName);
    } else if (typeof switchPillTab === 'function') {
      // Fallback: find the matching pill button and click it
      var pillBtn = document.querySelector('.pill-nav-button[onclick*="' + screenName + '"]');
      if (pillBtn) switchPillTab(pillBtn, screenName);
    }
  } catch(e) { console.warn('sidebarNav error:', e); }
}

// More drawer
function openMoreDrawer() {
  try {
    document.getElementById('moreDrawer').classList.add('open');
    document.getElementById('moreOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch(e) {}
}

function closeMoreDrawer() {
  try {
    document.getElementById('moreDrawer').classList.remove('open');
    document.getElementById('moreOverlay').classList.remove('open');
    document.body.style.overflow = '';
  } catch(e) {}
}

// Close drawer on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeMoreDrawer();
});

// Feed filter pills
function setFeedFilter(el, filter) {
  try {
    document.querySelectorAll('#feedFilterBar .feed-pill').forEach(function(p) {
      p.classList.remove('active');
    });
    el.classList.add('active');
    // Could trigger real filtering here; for now just a visual update
    console.log('Feed filter:', filter);
  } catch(e) {}
}

// On app ready: show sidebar for authenticated users, hide FAB on non-feed screens
(function initLayoutV2() {
  try {
    var fab = document.getElementById('createPostFab');
    if (fab) fab.style.display = 'flex'; // default shown on feed
  } catch(e) {}
})();
</script>
`;

html = html.replace(/<\/body>/i, JS_HELPERS + '\n</body>');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✅  inject-layout-v2.js complete — sidebar, drawer, feed improvements, JS helpers injected into ConnectHub_Mobile_Design.html');
