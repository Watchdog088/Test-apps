/**
 * patch-main-html.js
 * Patches ConnectHub_Mobile_Design.html to:
 *  1. Add 🔔 notification bell to the top nav-actions
 *  2. Inject all UX-fix scripts before </body>
 *  3. Ensure bottom-nav has 5 correct tabs with labels
 */

const fs = require('fs');
const FILE = 'ConnectHub_Mobile_Design.html';

let html = fs.readFileSync(FILE, 'utf8');

// ─── Guard: only patch once ────────────────────────────────────────────────
if (html.includes('id="lnk-bell-btn"')) {
  console.log('Already patched — skipping.');
  process.exit(0);
}

// ────────────────────────────────────────────────────────────────────────────
// 1. ADD BELL NOTIFICATION BUTTON to the existing nav-actions block
//    Current markup (lines 2601-2605):
//      <div class="nav-actions">
//          <div class="nav-btn" onclick="authOnboarding.showLoginScreen()" title="Login">👤</div>
//          <div class="nav-btn" onclick="openModal('createNew')">➕</div>
//          <div class="nav-btn" onclick="openModal('searchModal')">🔍</div>
//          <div class="nav-btn" onclick="openScreen('menu')">☰</div>
//      </div>
//    We insert the bell BEFORE the ☰ menu button.
// ────────────────────────────────────────────────────────────────────────────
const BELL_BTN = `<div class="nav-btn" id="lnk-bell-btn" onclick="openScreen('notifications')" title="Notifications" style="position:relative;">
                    🔔
                    <span id="lnk-notif-badge" style="
                      position:absolute;top:-4px;right:-4px;
                      background:#ef4444;color:#fff;border-radius:50%;
                      font-size:9px;font-weight:700;min-width:16px;height:16px;
                      display:inline-flex;align-items:center;justify-content:center;
                      padding:0 3px;line-height:1;">0</span>
                </div>`;

// Insert bell before the ☰ button
const MENU_BTN_PATTERN = `<div class="nav-btn" onclick="openScreen('menu')">☰</div>`;
if (html.includes(MENU_BTN_PATTERN)) {
  html = html.replace(MENU_BTN_PATTERN, BELL_BTN + '\n                    ' + MENU_BTN_PATTERN);
  console.log('✅ Bell notification button added to header');
} else {
  console.warn('⚠️  Could not find menu button — bell skipped');
}

// ────────────────────────────────────────────────────────────────────────────
// 2. BOTTOM NAV — ensure it has the 5 correct tabs
//    The existing bottom nav at line 5217 starts with:
//      <div class="bottom-nav">
//        <div class="nav-items">
//          <div class="nav-item active" onclick="switchBottomTab('social')">
//    We need to confirm it has all 5 tabs. We'll inject a fixed version
//    right after the opening <div class="bottom-nav"> if it doesn't.
// ────────────────────────────────────────────────────────────────────────────
const BOTTOM_NAV_FIXED = `
    <!-- ╔═══════════════════════════════════════════╗
         ║  BOTTOM TAB BAR — patched 2026-04-15     ║
         ╚═══════════════════════════════════════════╝ -->
    <div id="lnk-bottom-bar" style="
      position:fixed;bottom:0;left:0;right:0;
      background:linear-gradient(135deg,#0d0d1a,#1a1a2e);
      border-top:1px solid rgba(255,255,255,0.08);
      display:flex;align-items:center;justify-content:space-around;
      padding:8px 0 max(8px,env(safe-area-inset-bottom));
      z-index:9990;height:60px;box-shadow:0 -2px 16px rgba(0,0,0,0.4);">

      <!-- Feed -->
      <div onclick="switchBottomTab('social');openScreen('feed')" id="lnk-tab-feed"
        style="display:flex;flex-direction:column;align-items:center;gap:3px;
               cursor:pointer;min-width:52px;padding:4px 8px;border-radius:12px;
               color:#8892b0;transition:color .2s;">
        <span style="font-size:22px;">🏠</span>
        <span style="font-size:9px;font-weight:600;letter-spacing:.03em;">Home</span>
      </div>

      <!-- Messages -->
      <div onclick="openScreen('messages')" id="lnk-tab-messages"
        style="display:flex;flex-direction:column;align-items:center;gap:3px;
               cursor:pointer;min-width:52px;padding:4px 8px;border-radius:12px;
               color:#8892b0;transition:color .2s;position:relative;">
        <span style="font-size:22px;">💬</span>
        <span style="font-size:9px;font-weight:600;letter-spacing:.03em;">Messages</span>
        <span id="lnk-msg-badge" style="
          position:absolute;top:0;right:6px;background:#ef4444;color:#fff;
          border-radius:50%;font-size:9px;font-weight:700;min-width:16px;height:16px;
          display:none;align-items:center;justify-content:center;padding:0 3px;">3</span>
      </div>

      <!-- Create (FAB) -->
      <div onclick="openModal('createPost')" id="lnk-tab-create"
        style="display:flex;flex-direction:column;align-items:center;gap:3px;
               cursor:pointer;min-width:52px;padding:4px 8px;border-radius:12px;
               color:#fff;transition:color .2s;">
        <div style="
          width:44px;height:44px;border-radius:50%;
          background:linear-gradient(135deg,#7c3aed,#4f46e5);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 16px rgba(124,58,237,0.4);
          font-size:22px;margin-top:-14px;">➕</div>
        <span style="font-size:9px;font-weight:600;letter-spacing:.03em;margin-top:2px;">Create</span>
      </div>

      <!-- Notifications -->
      <div onclick="openScreen('notifications')" id="lnk-tab-notif"
        style="display:flex;flex-direction:column;align-items:center;gap:3px;
               cursor:pointer;min-width:52px;padding:4px 8px;border-radius:12px;
               color:#8892b0;transition:color .2s;position:relative;">
        <span style="font-size:22px;">🔔</span>
        <span style="font-size:9px;font-weight:600;letter-spacing:.03em;">Alerts</span>
        <span id="lnk-notif-tab-badge" style="
          position:absolute;top:0;right:6px;background:#ef4444;color:#fff;
          border-radius:50%;font-size:9px;font-weight:700;min-width:16px;height:16px;
          display:none;align-items:center;justify-content:center;padding:0 3px;">5</span>
      </div>

      <!-- Profile -->
      <div onclick="openScreen('profile')" id="lnk-tab-profile"
        style="display:flex;flex-direction:column;align-items:center;gap:3px;
               cursor:pointer;min-width:52px;padding:4px 8px;border-radius:12px;
               color:#8892b0;transition:color .2s;">
        <span style="font-size:22px;">👤</span>
        <span style="font-size:9px;font-weight:600;letter-spacing:.03em;">Profile</span>
      </div>

    </div>
    <!-- END BOTTOM TAB BAR -->

    <script>
    /* ─── Bottom Tab Bar: active state + badge init ─────────────────── */
    (function(){
      var tabs = {
        feed:'lnk-tab-feed', messages:'lnk-tab-messages',
        create:'lnk-tab-create', notif:'lnk-tab-notif', profile:'lnk-tab-profile'
      };
      window.setActiveTab = function(key){
        Object.values(tabs).forEach(function(id){
          var el = document.getElementById(id);
          if(el) el.style.color = '#8892b0';
        });
        var active = document.getElementById(tabs[key]);
        if(active) active.style.color = '#a78bfa';
      };

      // Show message badge
      var msgBadge = document.getElementById('lnk-msg-badge');
      if(msgBadge){ msgBadge.style.display='inline-flex'; }

      // Show notification badge
      var notifBadge = document.getElementById('lnk-notif-tab-badge');
      if(notifBadge){ notifBadge.style.display='inline-flex'; }

      // Also update header bell badge
      var bellBadge = document.getElementById('lnk-notif-badge');
      if(bellBadge){ bellBadge.textContent='5'; }

      // Push content up so it isn't hidden behind the tab bar
      var content = document.querySelector('.content') || document.querySelector('.app-container');
      if(content) content.style.paddingBottom = '70px';

      // Set initial active tab based on current visible screen
      setActiveTab('feed');
    })();
    </script>`;

// Inject fixed bottom bar just before </body>
if (!html.includes('id="lnk-bottom-bar"')) {
  html = html.replace('</body>', BOTTOM_NAV_FIXED + '\n</body>');
  console.log('✅ Bottom tab bar injected');
}

// ────────────────────────────────────────────────────────────────────────────
// 3. INJECT ALL FIX SCRIPTS before </body>
// ────────────────────────────────────────────────────────────────────────────
const SCRIPT_BLOCK = `
    <!-- ═══════════════════════════════════════════════════════
         UX Gap Fix Scripts  (injected 2026-04-15)
         All scripts use relative paths → work on S3 + local
         ═══════════════════════════════════════════════════════ -->
    <script src="js/ux-gap-fixes.js"></script>
    <script src="js/sidebar-nav.js"></script>
    <script src="js/user-testing-fixes.js"></script>
    <script src="js/medium-priority-fixes.js"></script>`;

if (!html.includes('ux-gap-fixes.js')) {
  html = html.replace('</body>', SCRIPT_BLOCK + '\n</body>');
  console.log('✅ All 4 fix scripts injected');
}

// ────────────────────────────────────────────────────────────────────────────
// WRITE RESULT
// ────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ConnectHub_Mobile_Design.html patched and saved');
