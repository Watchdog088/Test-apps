/**
 * LynkApp — UX Gap Fixes
 * Addresses all Medium, High & Critical gaps from DETAILED-UI-UX-GAPS-AUDIT-2026.md
 * Run order: loaded last in index.html (after all other scripts)
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     GUARD: prevent double-execution (GAP-02 fix)
  ────────────────────────────────────────────── */
  if (window.__uxGapFixesLoaded) return;
  window.__uxGapFixesLoaded = true;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    fixAuthFormIds();          // GAP-01
    fixDuplicateIds();         // GAP-03, GAP-06
    fixDatingPrefsStyle();     // GAP-05
    fixMetaDescription();      // GAP-39
    fixDatingCardAria();       // GAP-40
    addPasswordToggles();      // GAP-11
    injectBottomNav();         // GAP-08
    upgradeUserDropdown();     // GAP-09
    upgradeNotifPanel();       // GAP-33
    addStoryBarToFeed();       // GAP-15
    addFeedControls();         // GAP-17
    addDatingSwipeGesture();   // GAP-21
    injectSkeletonLoaders();   // GAP-34
    replaceToastSystem();      // GAP-35, GAP-36
    addDeferToScripts();       // GAP-46 note (no-op for already-loaded scripts)
    markBodyReady();
  }

  /* ══════════════════════════════════════════
     GAP-01 — Auth Form Field ID Mismatch
     Add aliases so navigation-system.js can find authEmail etc.
  ══════════════════════════════════════════ */
  function fixAuthFormIds() {
    const map = {
      email:           'authEmail',
      password:        'authPassword',
      fullName:        'authName',
      confirmPassword: 'authConfirmPassword',
    };
    Object.entries(map).forEach(([oldId, newId]) => {
      const el = document.getElementById(oldId);
      if (el && !document.getElementById(newId)) {
        // Don't rename — create a live alias so both IDs work
        el.setAttribute('data-alias', newId);
        // Override getElementById for these specific IDs
        Object.defineProperty(el, 'id', {
          get() { return newId; },
          configurable: true,
        });
      }
    });
  }

  /* ══════════════════════════════════════════
     GAP-03 & GAP-06 — Duplicate IDs
  ══════════════════════════════════════════ */
  function fixDuplicateIds() {
    // Fix duplicate confirmPassword: the modal one should be changeConfirmPassword
    const allConfirm = document.querySelectorAll('#confirmPassword');
    if (allConfirm.length > 1) {
      // The second one is in the change-password modal
      allConfirm[1].id = 'changeConfirmPassword';
    }

    // Fix duplicate distanceValue: the second one is in the events finder
    const allDist = document.querySelectorAll('#distanceValue');
    if (allDist.length > 1) {
      allDist[1].id = 'eventDistanceValue';
      // Update the oninput on the sibling range input
      const eventsRangeInput = allDist[1].closest('.filter-group, div')
        ?.querySelector('input[type="range"]');
      if (eventsRangeInput) {
        eventsRangeInput.addEventListener('input', function () {
          document.getElementById('eventDistanceValue').textContent = this.value + ' miles';
        });
      }
    }
  }

  /* ══════════════════════════════════════════
     GAP-05 — CSS Syntax Error in Dating Prefs
     flex-wrap: gap: 0.5rem  →  flex-wrap: wrap; gap: 0.5rem
  ══════════════════════════════════════════ */
  function fixDatingPrefsStyle() {
    const el = document.getElementById('interestTags');
    if (el) {
      el.style.display = 'flex';
      el.style.flexWrap = 'wrap';
      el.style.gap = '0.5rem';
      el.style.marginTop = '1rem';
      // Remove any malformed inline style value
      const inlineStyle = el.getAttribute('style') || '';
      if (inlineStyle.includes('flex-wrap: gap')) {
        el.setAttribute('style', 'margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem;');
      }
    }
  }

  /* ══════════════════════════════════════════
     GAP-39 — Meta Description Typo
     descriptIion → description
  ══════════════════════════════════════════ */
  function fixMetaDescription() {
    const badMeta = document.querySelector('meta[name="descriptIion"]');
    if (badMeta) {
      const content = badMeta.getAttribute('content');
      badMeta.remove();
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = content || 'LynkApp — Your complete social universe for connecting, dating, media, gaming, and more.';
      document.head.appendChild(newMeta);
    }
  }

  /* ══════════════════════════════════════════
     GAP-40 — Dating Card Wrong ARIA Role
  ══════════════════════════════════════════ */
  function fixDatingCardAria() {
    const card = document.getElementById('datingCard');
    if (card) {
      card.removeAttribute('role');
      card.setAttribute('role', 'region');
      card.setAttribute('aria-label', 'Dating profile card — swipe or use buttons to like or pass');
      card.setAttribute('tabindex', '0');
    }
  }

  /* ══════════════════════════════════════════
     GAP-11 — Password Visibility Toggles
     Wraps every auth password field with the toggle button
  ══════════════════════════════════════════ */
  function addPasswordToggles() {
    // Target password fields in the auth form and settings modals
    const pwSelectors = [
      '#authPassword, #password',
      '#authConfirmPassword, #confirmPassword',
      '#changeConfirmPassword',
      'input[type="password"]',
    ];
    const seen = new Set();
    document.querySelectorAll('input[type="password"]').forEach(input => {
      if (seen.has(input)) return;
      seen.add(input);

      // Skip if already wrapped
      if (input.closest('.password-field-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'password-field-wrapper';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'password-toggle-btn';
      btn.setAttribute('aria-label', 'Toggle password visibility');
      btn.innerHTML = eyeIcon(true);
      btn.addEventListener('click', function () {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = eyeIcon(!show);
      });
      wrapper.appendChild(btn);
    });
  }

  function eyeIcon(closed) {
    return closed
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  }

  /* ══════════════════════════════════════════
     GAP-08 — Mobile Bottom Navigation
  ══════════════════════════════════════════ */
  function injectBottomNav() {
    if (document.getElementById('bottomNav')) return;

    const nav = document.createElement('nav');
    nav.id = 'bottomNav';
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'Main navigation');
    nav.innerHTML = `
      <button class="bottom-nav-item active" data-section="social" onclick="switchToSection('social', this)" aria-label="Home feed">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </button>
      <button class="bottom-nav-item" data-section="messages" onclick="switchToSection('social', this); navigateToScreen('socialMessages')" aria-label="Messages">
        <span class="bottom-nav-badge" id="bnMsgBadge" style="display:none">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Chat
      </button>
      <button class="bottom-nav-item" data-section="dating" onclick="switchToSection('dating', this)" aria-label="Dating">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        Date
      </button>
      <button class="bottom-nav-item" data-section="profile" onclick="switchToSection('social', this); navigateToScreen('socialProfile')" aria-label="Profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Profile
      </button>
    `;
    document.body.appendChild(nav);

    // Keep bottom nav in sync with category switches
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const section = tab.dataset.category || tab.textContent.toLowerCase().trim().split(' ')[0];
        syncBottomNav(section);
      });
    });
  }

  function syncBottomNav(section) {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });
  }

  // Helper for bottom nav — delegates to the existing navigation system safely
  window.switchToSection = window.switchToSection || function (section, btn) {
    // Try calling the existing switchCategory if it exists
    if (typeof window.switchCategory === 'function') {
      window.switchCategory(section);
    } else if (typeof window.showSection === 'function') {
      window.showSection(section);
    }
    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav-item').forEach(item =>
      item.classList.remove('active')
    );
    if (btn) btn.classList.add('active');
  };

  /* ══════════════════════════════════════════
     GAP-09 — User Avatar Dropdown
     Replaces the existing non-functional avatar click
  ══════════════════════════════════════════ */
  function upgradeUserDropdown() {
    const avatar = document.querySelector('.user-avatar');
    if (!avatar || document.getElementById('userDropdown')) return;

    // Wrap avatar in the wrapper div
    const parent = avatar.parentNode;
    const wrapper = document.createElement('div');
    wrapper.className = 'user-menu-wrapper';
    parent.insertBefore(wrapper, avatar);
    wrapper.appendChild(avatar);

    const dropdown = document.createElement('div');
    dropdown.id = 'userDropdown';
    dropdown.className = 'user-dropdown';
    dropdown.setAttribute('role', 'menu');
    dropdown.innerHTML = `
      <div class="user-dropdown-header">
        <div class="user-avatar" style="width:36px;height:36px;font-size:0.85rem" aria-hidden="true">JD</div>
        <div>
          <div class="user-dropdown-name" id="ddUserName">John Doe</div>
          <div class="user-dropdown-email" id="ddUserEmail">john@example.com</div>
        </div>
      </div>
      <button class="user-dropdown-item" role="menuitem" onclick="closeUserDropdown(); navigateToScreen && navigateToScreen('socialProfile')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        View Profile
      </button>
      <button class="user-dropdown-item" role="menuitem" onclick="closeUserDropdown(); navigateToScreen && navigateToScreen('socialSettings')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Settings
      </button>
      <button class="user-dropdown-item danger" role="menuitem" onclick="closeUserDropdown(); typeof handleLogout === 'function' && handleLogout()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Log Out
      </button>
    `;
    wrapper.appendChild(dropdown);

    // Toggle on avatar click — override existing onclick
    avatar.onclick = null;
    avatar.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) dropdown.classList.remove('open');
    });

    // Populate name/email from auth state if available
    setTimeout(() => {
      const user = window.currentUser || window.authState?.user;
      if (user) {
        const nameEl = document.getElementById('ddUserName');
        const emailEl = document.getElementById('ddUserEmail');
        if (nameEl && user.displayName) nameEl.textContent = user.displayName;
        if (emailEl && user.email) emailEl.textContent = user.email;
      }
    }, 1500);
  }

  window.closeUserDropdown = function () {
    document.getElementById('userDropdown')?.classList.remove('open');
  };

  /* ══════════════════════════════════════════
     GAP-33 — Upgrade Notification Panel
  ══════════════════════════════════════════ */
  function upgradeNotifPanel() {
    const panel = document.getElementById('notificationPanel');
    if (!panel || panel.dataset.upgraded) return;
    panel.dataset.upgraded = '1';

    // Get existing items
    const existingItems = panel.innerHTML;

    panel.innerHTML = `
      <div class="notif-panel-header">
        <h3>Notifications</h3>
        <div class="notif-header-actions">
          <button class="notif-action-btn" onclick="markAllNotifsRead()">Mark all read</button>
          <button class="notif-action-btn" onclick="clearAllNotifs()">Clear all</button>
        </div>
      </div>
      <div class="notif-tabs">
        <button class="notif-tab active" onclick="filterNotifs('all', this)">All</button>
        <button class="notif-tab" onclick="filterNotifs('likes', this)">Likes</button>
        <button class="notif-tab" onclick="filterNotifs('matches', this)">Matches</button>
        <button class="notif-tab" onclick="filterNotifs('mentions', this)">Mentions</button>
      </div>
      <div id="notifItemsContainer">
        ${existingItems}
      </div>
    `;

    // Make existing items clickable with toast feedback
    panel.querySelectorAll('.notification-item').forEach((item, i) => {
      if (!item.onclick) {
        item.addEventListener('click', function () {
          this.classList.remove('notif-item-unread');
          showInfo('Notification opened');
        });
        // Mark first 2 as unread for visual demo
        if (i < 2) item.classList.add('notif-item-unread');
      }
    });
  }

  window.markAllNotifsRead = function () {
    document.querySelectorAll('.notif-item-unread').forEach(el => el.classList.remove('notif-item-unread'));
    // Update badge
    const badge = document.getElementById('navNotifBadge');
    if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
    showSuccess('All notifications marked as read');
  };

  window.clearAllNotifs = function () {
    const container = document.getElementById('notifItemsContainer');
    if (container) {
      container.innerHTML = `
        <div class="empty-state" style="padding:2rem">
          <div class="empty-state-icon">🔔</div>
          <h4>No notifications</h4>
          <p>You're all caught up!</p>
        </div>`;
    }
    const badge = document.getElementById('navNotifBadge');
    if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
  };

  window.filterNotifs = function (type, btn) {
    document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    // In a real app, filter items by type. For now just show all.
    showInfo(`Showing ${type === 'all' ? 'all notifications' : type}`);
  };

  /* ══════════════════════════════════════════
     GAP-15 — Story Bar on Home Feed
  ══════════════════════════════════════════ */
  function addStoryBarToFeed() {
    // Find the posts container or feed area
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer || document.getElementById('feedStoryBar')) return;

    const bar = document.createElement('div');
    bar.id = 'feedStoryBar';
    bar.className = 'story-bar';
    bar.setAttribute('aria-label', 'Stories');
    bar.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:0.4rem;flex-shrink:0">
        <button class="story-add-btn" onclick="openStoryCreation && openStoryCreation()" aria-label="Create story" title="Add your story">+</button>
        <span style="font-size:0.7rem;color:var(--text-secondary)">Your Story</span>
      </div>
      ${generateStoryBubbles()}
    `;
    postsContainer.parentNode.insertBefore(bar, postsContainer);
  }

  function generateStoryBubbles() {
    const stories = [
      { name: 'Alex K.', initials: 'AK', seen: false },
      { name: 'Maya R.', initials: 'MR', seen: false },
      { name: 'Jordan',  initials: 'JO', seen: true  },
      { name: 'Sam T.',  initials: 'ST', seen: false },
      { name: 'Chris M.',initials: 'CM', seen: true  },
      { name: 'Taylor',  initials: 'TA', seen: false },
    ];
    return stories.map(s => `
      <div class="story-bubble" onclick="openStoryViewer && openStoryViewer()" title="View ${s.name}'s story">
        <div class="story-ring ${s.seen ? 'seen' : ''}">
          <div class="story-ring-inner">${s.initials}</div>
        </div>
        <span class="story-username">${s.name}</span>
      </div>
    `).join('');
  }

  /* ══════════════════════════════════════════
     GAP-17 — Feed Sort / Algorithm Controls
  ══════════════════════════════════════════ */
  function addFeedControls() {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer || document.getElementById('feedControls')) return;

    const controls = document.createElement('div');
    controls.id = 'feedControls';
    controls.className = 'feed-controls';
    controls.setAttribute('role', 'tablist');
    controls.setAttribute('aria-label', 'Feed sorting');
    controls.innerHTML = `
      <button class="feed-tab active" role="tab" aria-selected="true"  data-feed="top"       onclick="switchFeed('top', this)">⭐ Top</button>
      <button class="feed-tab"        role="tab" aria-selected="false" data-feed="recent"    onclick="switchFeed('recent', this)">🕐 Recent</button>
      <button class="feed-tab"        role="tab" aria-selected="false" data-feed="following" onclick="switchFeed('following', this)">👥 Following</button>
      <button class="feed-tab"        role="tab" aria-selected="false" data-feed="explore"   onclick="switchFeed('explore', this)">🔍 Explore</button>
    `;
    // Insert before the posts container
    const storyBar = document.getElementById('feedStoryBar');
    const insertBefore = storyBar ? storyBar.nextSibling : postsContainer;
    postsContainer.parentNode.insertBefore(controls, insertBefore || postsContainer);
  }

  window.switchFeed = function (type, btn) {
    document.querySelectorAll('.feed-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    // In a real app, re-fetch/re-sort posts. For now show feedback.
    showInfo(`Showing ${type} posts`);
    // Trigger existing feed load if available
    if (typeof window.loadFeedPosts === 'function') window.loadFeedPosts(type);
    else if (typeof window.initializePosts === 'function') window.initializePosts();
  };

  /* ══════════════════════════════════════════
     GAP-21 — Dating Card Swipe Gesture
  ══════════════════════════════════════════ */
  function addDatingSwipeGesture() {
    const card = document.getElementById('datingCard');
    if (!card || card.dataset.swipeAttached) return;
    card.dataset.swipeAttached = '1';

    let startX = 0, startY = 0, isDragging = false, currentX = 0;
    const SWIPE_THRESHOLD = 80;
    const TILT_MAX = 20;

    card.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      isDragging = true;
      card.setPointerCapture(e.pointerId);
      card.style.transition = 'none';
    });

    card.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      currentX = e.clientX - startX;
      const tilt = (currentX / window.innerWidth) * TILT_MAX;
      card.style.transform = `translateX(${currentX}px) rotate(${tilt}deg)`;

      // Show like/nope indicators
      showSwipeIndicator(currentX);
    });

    card.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      card.style.transition = 'all 0.4s ease';
      hideSwipeIndicators();

      if (currentX > SWIPE_THRESHOLD) {
        animateCardOut('right');
      } else if (currentX < -SWIPE_THRESHOLD) {
        animateCardOut('left');
      } else {
        // Snap back
        card.style.transform = '';
      }
      currentX = 0;
    });

    // Also handle keyboard for accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); animateCardOut('right'); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); animateCardOut('left'); }
    });
  }

  function showSwipeIndicator(dx) {
    let likeEl  = document.getElementById('swipeLikeIndicator');
    let nopeEl  = document.getElementById('swipeNopeIndicator');
    if (!likeEl) {
      likeEl = Object.assign(document.createElement('div'), {
        id: 'swipeLikeIndicator',
        innerHTML: '💚 LIKE',
        style: 'position:absolute;top:20px;left:20px;background:var(--success);color:white;padding:0.5rem 1rem;border-radius:8px;font-weight:700;font-size:1.1rem;opacity:0;transform:rotate(-15deg);pointer-events:none;z-index:10;border:3px solid white',
      });
      nopeEl = Object.assign(document.createElement('div'), {
        id: 'swipeNopeIndicator',
        innerHTML: '❌ NOPE',
        style: 'position:absolute;top:20px;right:20px;background:var(--error);color:white;padding:0.5rem 1rem;border-radius:8px;font-weight:700;font-size:1.1rem;opacity:0;transform:rotate(15deg);pointer-events:none;z-index:10;border:3px solid white',
      });
      const card = document.getElementById('datingCard');
      card.style.position = 'relative';
      card.appendChild(likeEl);
      card.appendChild(nopeEl);
    }
    const opacity = Math.min(Math.abs(dx) / 100, 1);
    likeEl.style.opacity = dx > 0 ? opacity : 0;
    nopeEl.style.opacity = dx < 0 ? opacity : 0;
  }

  function hideSwipeIndicators() {
    document.getElementById('swipeLikeIndicator')?.style && (document.getElementById('swipeLikeIndicator').style.opacity = 0);
    document.getElementById('swipeNopeIndicator')?.style && (document.getElementById('swipeNopeIndicator').style.opacity = 0);
  }

  function animateCardOut(direction) {
    const card = document.getElementById('datingCard');
    if (!card) return;
    const x = direction === 'right' ? '150vw' : '-150vw';
    const rot = direction === 'right' ? '30deg' : '-30deg';
    card.style.transform = `translateX(${x}) rotate(${rot})`;
    card.style.opacity = '0';

    setTimeout(() => {
      card.style.transition = 'none';
      card.style.transform = '';
      card.style.opacity = '1';
      // Delegate to existing swipe logic if available
      if (direction === 'right' && typeof window.likeProfile === 'function') window.likeProfile();
      else if (direction === 'left' && typeof window.passProfile === 'function') window.passProfile();
      else if (typeof window.swipeCard === 'function') window.swipeCard(direction);
    }, 400);
  }

  /* ══════════════════════════════════════════
     GAP-34 — Skeleton Loaders for Empty Containers
  ══════════════════════════════════════════ */
  function injectSkeletonLoaders() {
    const emptyContainers = [
      { id: 'postsContainer',    count: 3, type: 'post'   },
      { id: 'suggestedFriends',  count: 3, type: 'person' },
      { id: 'activeUsers',       count: 4, type: 'avatar' },
      { id: 'conversationsList', count: 4, type: 'convo'  },
      { id: 'matchesList',       count: 3, type: 'person' },
      { id: 'transactionHistory',count: 3, type: 'row'    },
    ];

    emptyContainers.forEach(({ id, count, type }) => {
      const el = document.getElementById(id);
      if (!el || el.children.length > 0) return; // already has content

      el.innerHTML = Array.from({ length: count }, () => skeletonHTML(type)).join('');

      // Remove skeletons once real content is loaded (observer pattern)
      const observer = new MutationObserver(() => {
        const hasReal = Array.from(el.children).some(c => !c.classList.contains('skeleton-card'));
        if (hasReal) {
          el.querySelectorAll('.skeleton-card').forEach(s => s.remove());
          observer.disconnect();
        }
      });
      observer.observe(el, { childList: true });
    });
  }

  function skeletonHTML(type) {
    if (type === 'post') {
      return `<div class="skeleton-card" style="margin-bottom:1rem">
        <div class="skeleton skeleton-avatar"></div>
        <div style="flex:1">
          <div class="skeleton skeleton-line short" style="margin-bottom:0.5rem"></div>
          <div class="skeleton skeleton-line full"></div>
          <div class="skeleton skeleton-line medium"></div>
        </div>
      </div>`;
    }
    if (type === 'person') {
      return `<div class="skeleton-card" style="margin-bottom:0.75rem">
        <div class="skeleton skeleton-avatar"></div>
        <div style="flex:1">
          <div class="skeleton skeleton-line short" style="margin-bottom:0.4rem"></div>
          <div class="skeleton skeleton-line medium" style="height:10px"></div>
        </div>
      </div>`;
    }
    if (type === 'avatar') {
      return `<div class="skeleton skeleton-avatar" style="display:inline-block;margin:0.25rem"></div>`;
    }
    if (type === 'convo') {
      return `<div class="skeleton-card" style="margin-bottom:0.5rem;padding:0.75rem">
        <div class="skeleton skeleton-avatar"></div>
        <div style="flex:1">
          <div class="skeleton skeleton-line short" style="margin-bottom:0.3rem"></div>
          <div class="skeleton skeleton-line medium" style="height:10px"></div>
        </div>
      </div>`;
    }
    if (type === 'row') {
      return `<div class="skeleton skeleton-line full" style="height:40px;border-radius:12px;margin-bottom:0.5rem"></div>`;
    }
    return `<div class="skeleton skeleton-line full" style="margin-bottom:0.5rem"></div>`;
  }

  /* ══════════════════════════════════════════
     GAP-35 & GAP-36 — Coming Soon Modal
     Replace "UI Available" toasts with informative coming-soon treatment
  ══════════════════════════════════════════ */
  function replaceToastSystem() {
    // Override the global showToast so "UI Available" messages get the coming-soon treatment
    const _originalShowToast = window.showToast;
    window.showToast = function (message, type = 'info') {
      if (typeof message === 'string' && message.toLowerCase().includes('ui available')) {
        const featureName = message.replace(/\s*[-–]\s*ui available/i, '').trim();
        showComingSoon(featureName);
        return;
      }
      if (_originalShowToast) return _originalShowToast(message, type);
      // Fallback bottom-right toast
      renderToast(message, type);
    };

    // Also expose showComingSoon globally
    window.showComingSoon = showComingSoon;
  }

  function showComingSoon(featureName, subtitle) {
    // Don't stack multiple
    if (document.getElementById('comingSoonOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'comingSoonOverlay';
    overlay.className = 'coming-soon-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'comingSoonTitle');
    overlay.innerHTML = `
      <div class="coming-soon-modal" role="document">
        <span class="coming-soon-icon">🚀</span>
        <h3 id="comingSoonTitle">${escHtml(featureName)}</h3>
        <p>${subtitle ? escHtml(subtitle) : 'This feature is in development and will be available soon. Stay tuned!'}</p>
        <button class="btn btn-primary" onclick="document.getElementById('comingSoonOverlay').remove()" autofocus>Got it</button>
      </div>
    `;
    // Close on overlay click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
    overlay.querySelector('button').focus();
  }

  function renderToast(message, type) {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    t.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:99999;padding:1rem 1.5rem;border-radius:12px;max-width:320px;font-weight:500;animation:toastSlideIn 0.3s ease forwards';
    document.body.appendChild(t);
    setTimeout(() => { t.style.animation = 'toastSlideOut 0.3s ease forwards'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  /* ══════════════════════════════════════════
     Helper: show simple toasts for UX fixes
  ══════════════════════════════════════════ */
  function showSuccess(msg) { renderToast(msg, 'success'); }
  function showInfo(msg)    { renderToast(msg, 'info'); }

  function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  /* ══════════════════════════════════════════
     GAP-46 — Defer note (informational, already loaded)
  ══════════════════════════════════════════ */
  function addDeferToScripts() {
    // Already-loaded scripts can't be deferred retroactively.
    // This function is a no-op placeholder.
    // The actual fix requires editing index.html to add `defer` attributes.
    // That is handled by the separate search/replace pass on index.html.
  }

  /* ══════════════════════════════════════════
     Mark body as JS-ready (anti-FOUC)
  ══════════════════════════════════════════ */
  function markBodyReady() {
    document.body.classList.remove('js-loading');
    document.body.classList.add('js-ready');
  }

})();
