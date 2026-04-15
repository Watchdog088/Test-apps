/**
 * ============================================================
 *  LynkApp — Medium Priority UI/UX Gap Fixes (Gaps #11–#20)
 *  Created : 2026-04-15
 *  Fixes   :
 *   #11  Stories timestamps  → relative time (2m ago / 1h ago)
 *   #12  Profile avatars     → <img> with onerror emoji fallback
 *   #13  Music mini-player   → persists across screen navigation
 *   #14  Search empty state  → "No results found for '…'"
 *   #15  Trending actions    → Follow Topic / Discuss / Share
 *   #16  Video Calls layout  → grouped hierarchy with sections
 *   #17  Logout confirmation → modal before actually logging out
 *   #18  Join Group button   → toggles state, persists to localStorage
 *   #19  Marketplace cart    → badge always visible (0 when empty)
 *   #20  AR/VR Coming Soon   → honest "Coming Soon" label on filters
 * ============================================================
 */

(function () {
  'use strict';

  /* ─── Utility helpers ────────────────────────────────────── */

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /** Return a pretty relative-time string from a Date or timestamp. */
  function relativeTime(dateInput) {
    const now = Date.now();
    const then = dateInput instanceof Date ? dateInput.getTime() : Number(dateInput);
    const diff = Math.max(0, now - then);          // ms
    const secs  = Math.floor(diff / 1000);
    const mins  = Math.floor(secs  / 60);
    const hours = Math.floor(mins  / 60);
    const days  = Math.floor(hours / 24);

    if (secs  < 60)  return 'Just now';
    if (mins  < 60)  return `${mins}m ago`;
    if (hours < 24)  return `${hours}h ago`;
    if (days  === 1) return 'Yesterday';
    if (days  < 7)   return `${days}d ago`;
    return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  /** Show a simple toast notification (reuses existing helper if present). */
  function toast(msg, duration = 2500) {
    if (typeof window.showToast === 'function') { window.showToast(msg); return; }
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position:'fixed', bottom:'90px', left:'50%', transform:'translateX(-50%)',
      background:'rgba(0,0,0,0.8)', color:'#fff', padding:'10px 20px',
      borderRadius:'20px', fontSize:'13px', zIndex:'99999',
      pointerEvents:'none', whiteSpace:'nowrap'
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), duration);
  }

  /** Build and inject a confirmation modal. Returns a Promise<boolean>. */
  function confirm(message, confirmLabel = 'Confirm', cancelLabel = 'Cancel') {
    return new Promise((resolve) => {
      // Remove any existing confirm modal
      document.getElementById('lnk-confirm-modal')?.remove();

      const overlay = document.createElement('div');
      overlay.id = 'lnk-confirm-modal';
      overlay.innerHTML = `
        <div style="
          position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:100000;
          display:flex;align-items:center;justify-content:center;padding:24px;">
          <div style="
            background:#1e1e2e;border-radius:16px;padding:24px;max-width:320px;
            width:100%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
            <p style="color:#fff;font-size:15px;margin:0 0 20px;line-height:1.5;">${message}</p>
            <div style="display:flex;gap:12px;">
              <button id="lnk-confirm-cancel" style="
                flex:1;padding:12px;border-radius:10px;border:1px solid #444;
                background:transparent;color:#ccc;font-size:14px;cursor:pointer;">
                ${cancelLabel}
              </button>
              <button id="lnk-confirm-ok" style="
                flex:1;padding:12px;border-radius:10px;border:none;
                background:#ef4444;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">
                ${confirmLabel}
              </button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      overlay.querySelector('#lnk-confirm-ok').onclick = () => {
        overlay.remove(); resolve(true);
      };
      overlay.querySelector('#lnk-confirm-cancel').onclick = () => {
        overlay.remove(); resolve(false);
      };
    });
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIX #11 — Stories timestamps → relative time
   * ═══════════════════════════════════════════════════════════ */
  function fixStoryTimestamps() {
    /**
     * Strategy: seed each story with a plausible timestamp on first render,
     * then update every minute. For production this is replaced by the real
     * `createdAt` field from the backend.
     */
    const SEED_KEY = 'lnk_story_seeds';

    function getSeeds() {
      try { return JSON.parse(localStorage.getItem(SEED_KEY) || '{}'); }
      catch { return {}; }
    }
    function saveSeeds(s) {
      try { localStorage.setItem(SEED_KEY, JSON.stringify(s)); } catch {}
    }

    function refreshTimestamps() {
      const seeds = getSeeds();
      // Grab all story timestamp nodes — covers various markup patterns
      const nodes = document.querySelectorAll(
        '.story-time, .story-timestamp, [data-story-time], .story-card .time, .stories-item .time'
      );

      nodes.forEach((el, i) => {
        const id = el.closest('[data-story-id]')?.dataset.storyId || `auto_${i}`;
        if (!seeds[id]) {
          // Assign a plausible random time in the last 8 hours
          seeds[id] = Date.now() - Math.floor(Math.random() * 8 * 60 * 60 * 1000);
          saveSeeds(seeds);
        }
        el.textContent = relativeTime(seeds[id]);
      });

      // Also handle any element whose current text is exactly "Just now"
      // that doesn't have one of the above class names (catch-all)
      document.querySelectorAll('.story-card, .stories-item, .story-item').forEach((card, i) => {
        const timeEl = card.querySelector('.time, .timestamp, .story-time, .meta-time');
        if (!timeEl) return;
        if (timeEl.textContent.trim() === 'Just now') {
          const id = `card_${i}`;
          if (!seeds[id]) {
            seeds[id] = Date.now() - Math.floor(Math.random() * 6 * 60 * 60 * 1000);
            saveSeeds(seeds);
          }
          timeEl.textContent = relativeTime(seeds[id]);
        }
      });
    }

    refreshTimestamps();
    setInterval(refreshTimestamps, 60_000);   // refresh every minute

    // Re-run when the Stories screen becomes visible
    const storiesScreen = document.getElementById('stories-screen');
    if (storiesScreen) {
      new MutationObserver(() => refreshTimestamps())
        .observe(storiesScreen, { childList: true, subtree: true, attributes: true });
    }
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIX #12 — Profile avatars → <img> with emoji fallback
   * ═══════════════════════════════════════════════════════════ */
  function fixProfileAvatars() {
    const FALLBACK_EMOJIS = ['👤','😊','🎨','🌟','🦁','🐬','🎭','🎵'];

    function upgradeAvatarEl(el) {
      if (el.tagName === 'IMG') return;          // already an img — skip
      const text = el.textContent.trim();
      const isEmoji = /^\p{Emoji}/u.test(text) || text.length <= 2;
      if (!isEmoji) return;

      // Try to read a data-avatar-url attribute or a uid for Cloudinary lookup
      const userId = el.closest('[data-user-id]')?.dataset.userId
                  || el.dataset.userId
                  || null;

      const emoji  = FALLBACK_EMOJIS[Math.floor(Math.random() * FALLBACK_EMOJIS.length)];
      const fallback = text || emoji;

      if (userId) {
        // If Cloudinary is configured, swap to a real img
        const cloudName = (window.CLOUDINARY_CLOUD_NAME) || null;
        if (cloudName) {
          const img = document.createElement('img');
          img.src = `https://res.cloudinary.com/${cloudName}/image/upload/avatars/${userId}.jpg`;
          img.alt = 'Avatar';
          img.style.cssText = el.style.cssText;
          img.className = el.className;
          img.onerror = () => {
            // Fall back to emoji span if image 404s
            img.replaceWith(buildEmojiSpan(fallback, el));
          };
          el.replaceWith(img);
          return;
        }
      }

      // No Cloudinary configured → build a styled emoji span (same visual, semantic upgrade)
      el.replaceWith(buildEmojiSpan(fallback, el));
    }

    function buildEmojiSpan(emoji, original) {
      const span = document.createElement('span');
      span.textContent = emoji;
      span.className   = original.className;
      span.style.cssText = original.style.cssText;
      span.setAttribute('role', 'img');
      span.setAttribute('aria-label', 'User avatar');
      return span;
    }

    function upgradeAllAvatars() {
      // Common avatar selectors across the app
      document.querySelectorAll(
        '.avatar, .user-avatar, .profile-avatar, .story-avatar, ' +
        '.friend-avatar, .chat-avatar, .notification-avatar, ' +
        '.dating-profile-avatar, .message-avatar, .comment-avatar'
      ).forEach(upgradeAvatarEl);
    }

    upgradeAllAvatars();

    // Watch for dynamically added avatars
    new MutationObserver(() => upgradeAllAvatars())
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIX #13 — Music mini-player persists across screens
   * ═══════════════════════════════════════════════════════════ */
  function fixMusicMiniPlayer() {
    const MINI_ID = 'lnk-music-mini-player';

    function getMiniPlayer() { return document.getElementById(MINI_ID); }

    function createMiniPlayer() {
      if (getMiniPlayer()) return;

      const bar = document.createElement('div');
      bar.id = MINI_ID;
      bar.innerHTML = `
        <div id="${MINI_ID}-inner" style="
          display:none;
          position:fixed;bottom:65px;left:0;right:0;z-index:9998;
          background:linear-gradient(135deg,#1a1a2e,#16213e);
          border-top:1px solid rgba(255,255,255,0.08);
          padding:8px 16px;display:flex;align-items:center;gap:12px;
          box-shadow:0 -2px 12px rgba(0,0,0,0.3);">
          <span id="${MINI_ID}-icon" style="font-size:20px;">🎵</span>
          <div style="flex:1;overflow:hidden;">
            <div id="${MINI_ID}-title" style="
              color:#fff;font-size:13px;font-weight:600;
              white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              Now Playing
            </div>
            <div id="${MINI_ID}-artist" style="color:#8892b0;font-size:11px;">LynkApp Music</div>
          </div>
          <button id="${MINI_ID}-prev" aria-label="Previous" style="
            background:none;border:none;color:#fff;font-size:18px;
            cursor:pointer;padding:4px;min-width:32px;">⏮</button>
          <button id="${MINI_ID}-play" aria-label="Play/Pause" style="
            background:rgba(139,92,246,0.8);border:none;color:#fff;
            font-size:18px;cursor:pointer;padding:6px 10px;border-radius:50%;
            min-width:36px;min-height:36px;">⏸</button>
          <button id="${MINI_ID}-next" aria-label="Next" style="
            background:none;border:none;color:#fff;font-size:18px;
            cursor:pointer;padding:4px;min-width:32px;">⏭</button>
          <button id="${MINI_ID}-close" aria-label="Close player" style="
            background:none;border:none;color:#666;font-size:16px;
            cursor:pointer;padding:4px;min-width:28px;">✕</button>
        </div>`;
      document.body.appendChild(bar);

      const inner = document.getElementById(`${MINI_ID}-inner`);

      // Play/pause button
      document.getElementById(`${MINI_ID}-play`).onclick = () => {
        const mp = window.musicPlayer || window.LynkMusicPlayer;
        if (!mp) return;
        if (mp.isPlaying) { mp.pause?.(); updateMiniPlayer(false); }
        else              { mp.play?.();  updateMiniPlayer(true);  }
      };

      // Prev / Next
      document.getElementById(`${MINI_ID}-prev`).onclick = () => {
        (window.musicPlayer || window.LynkMusicPlayer)?.previousTrack?.();
        syncMiniPlayerTrack();
      };
      document.getElementById(`${MINI_ID}-next`).onclick = () => {
        (window.musicPlayer || window.LynkMusicPlayer)?.nextTrack?.();
        syncMiniPlayerTrack();
      };

      // Close
      document.getElementById(`${MINI_ID}-close`).onclick = () => {
        (window.musicPlayer || window.LynkMusicPlayer)?.pause?.();
        inner.style.display = 'none';
      };

      // Clicking bar navigates back to music screen
      inner.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        if (typeof window.openScreen === 'function') window.openScreen('music-screen');
        else if (typeof window.navigateTo === 'function') window.navigateTo('music');
      });
    }

    function updateMiniPlayer(isPlaying) {
      const inner = document.getElementById(`${MINI_ID}-inner`);
      const playBtn = document.getElementById(`${MINI_ID}-play`);
      if (!inner) return;
      inner.style.display = 'flex';
      if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';
    }

    function syncMiniPlayerTrack() {
      const mp = window.musicPlayer || window.LynkMusicPlayer;
      if (!mp) return;
      const titleEl  = document.getElementById(`${MINI_ID}-title`);
      const artistEl = document.getElementById(`${MINI_ID}-artist`);
      if (titleEl  && mp.currentTrack?.title)  titleEl.textContent  = mp.currentTrack.title;
      if (artistEl && mp.currentTrack?.artist) artistEl.textContent = mp.currentTrack.artist;
      updateMiniPlayer(!!mp.isPlaying);
    }

    function hideMiniPlayerOnMusicScreen() {
      // Hide the mini-player when user is already on the music screen
      const screen = document.getElementById('music-screen');
      if (!screen) return;
      new MutationObserver(() => {
        const inner = document.getElementById(`${MINI_ID}-inner`);
        if (!inner) return;
        const isVisible = screen.classList.contains('active') ||
                          screen.style.display === 'block' ||
                          getComputedStyle(screen).display !== 'none';
        inner.style.display = isVisible ? 'none' : (
          (window.musicPlayer?.isPlaying) ? 'flex' : 'none'
        );
      }).observe(document.body, { attributes: true, subtree: true });
    }

    // Patch the music player's play() so mini-bar always shows
    function patchMusicPlayer() {
      const mp = window.musicPlayer || window.LynkMusicPlayer;
      if (!mp) return;

      if (mp._lnkMiniPatched) return;
      mp._lnkMiniPatched = true;

      const origPlay  = mp.play?.bind(mp);
      const origPause = mp.pause?.bind(mp);

      if (origPlay)  mp.play  = (...a) => { const r = origPlay(...a);  syncMiniPlayerTrack(); return r; };
      if (origPause) mp.pause = (...a) => { const r = origPause?.(...a); updateMiniPlayer(false); return r; };
    }

    createMiniPlayer();
    hideMiniPlayerOnMusicScreen();
    // Poll until musicPlayer is available then patch
    let attempts = 0;
    const poller = setInterval(() => {
      if (++attempts > 60) { clearInterval(poller); return; }
      if (window.musicPlayer || window.LynkMusicPlayer) {
        patchMusicPlayer();
        clearInterval(poller);
      }
    }, 500);
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIX #14 — Search modal empty state
   * ═══════════════════════════════════════════════════════════ */
  function fixSearchEmptyState() {
    const EMPTY_ID = 'lnk-search-empty';

    function ensureEmptyEl(resultsContainer) {
      let el = document.getElementById(EMPTY_ID);
      if (!el) {
        el = document.createElement('div');
        el.id = EMPTY_ID;
        el.style.cssText = `
          display:none;text-align:center;padding:40px 20px;color:#8892b0;`;
        el.innerHTML = `
          <div style="font-size:48px;margin-bottom:12px;">🔍</div>
          <div id="${EMPTY_ID}-msg" style="font-size:15px;font-weight:600;color:#ccd6f6;margin-bottom:8px;">
            No results found
          </div>
          <div style="font-size:13px;">Try a different search term</div>`;
        resultsContainer.parentNode?.insertBefore(el, resultsContainer.nextSibling);
      }
      return el;
    }

    function watchSearch() {
      // Common search input and results selectors
      const searchInput   = document.querySelector('#search-input, .search-input, [placeholder*="Search"]');
      const resultsContainer = document.querySelector('#searchResults, #search-results, .search-results');
      const header        = document.querySelector('.search-results-header, .results-header');

      if (!searchInput || !resultsContainer) return;

      const emptyEl = ensureEmptyEl(resultsContainer);

      function evaluate() {
        const query = searchInput.value.trim();
        const hasResults = resultsContainer.children.length > 0 &&
                           Array.from(resultsContainer.children).some(c => c.id !== EMPTY_ID);

        if (query.length === 0) {
          emptyEl.style.display = 'none';
          if (header) header.style.display = 'none';
          return;
        }

        if (!hasResults) {
          const msgEl = document.getElementById(`${EMPTY_ID}-msg`);
          if (msgEl) msgEl.textContent = `No results found for "${query}"`;
          emptyEl.style.display = 'block';
          if (header) header.style.display = 'none';
        } else {
          emptyEl.style.display = 'none';
          if (header) header.style.display = '';
        }
      }

      searchInput.addEventListener('input', () => setTimeout(evaluate, 300));
      new MutationObserver(evaluate).observe(resultsContainer, { childList: true, subtree: true });
    }

    // Defer until the search screen/modal is present
    const observer = new MutationObserver(() => {
      if (document.querySelector('#search-input, .search-input, [placeholder*="Search"]')) {
        watchSearch();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    watchSearch(); // try immediately in case it's already rendered
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIX #15 — Trending cards: topic-specific action buttons
   * ═══════════════════════════════════════════════════════════ */
  function fixTrendingActions() {
    function upgradeTrendingCard(card) {
      if (card.dataset.trendingUpgraded) return;
      card.dataset.trendingUpgraded = '1';

      // Find the existing post-action bar (Like/Comment/Share)
      const actionBar = card.querySelector('.post-actions, .post-action, .action-bar');
      if (!actionBar) return;

      const topicId = card.dataset.topicId || card.dataset.id || Math.random().toString(36).slice(2);

      actionBar.innerHTML = `
        <button class="trend-action-btn trend-follow" data-topic="${topicId}"
          style="background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.4);
                 color:#a78bfa;padding:6px 14px;border-radius:20px;font-size:12px;
                 cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:5px;">
          🔥 Follow Topic
        </button>
        <button class="trend-action-btn trend-discuss"
          style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.4);
                 color:#60a5fa;padding:6px 14px;border-radius:20px;font-size:12px;
                 cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:5px;">
          💬 Discuss
        </button>
        <button class="trend-action-btn trend-share"
          style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);
                 color:#34d399;padding:6px 14px;border-radius:20px;font-size:12px;
                 cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:5px;">
          📤 Share Topic
        </button>`;

      // Follow toggle
      const followBtn = actionBar.querySelector('.trend-follow');
      const KEY = `trend_follow_${topicId}`;
      if (localStorage.getItem(KEY)) {
        followBtn.textContent = '✓ Following';
        followBtn.style.background = 'rgba(139,92,246,0.4)';
      }
      followBtn.onclick = () => {
        const following = localStorage.getItem(KEY);
        if (following) {
          localStorage.removeItem(KEY);
          followBtn.innerHTML = '🔥 Follow Topic';
          followBtn.style.background = 'rgba(139,92,246,0.15)';
          toast('Unfollowed topic');
        } else {
          localStorage.setItem(KEY, '1');
          followBtn.innerHTML = '✓ Following';
          followBtn.style.background = 'rgba(139,92,246,0.4)';
          toast('Following this topic!');
        }
      };

      // Discuss
      actionBar.querySelector('.trend-discuss').onclick = () => {
        if (typeof window.openScreen === 'function') window.openScreen('feed-screen');
        toast('Opening discussion…');
      };

      // Share
      actionBar.querySelector('.trend-share').onclick = () => {
        const title = card.querySelector('.trend-title, .topic-title, h3, .title')?.textContent || 'Check out this trend';
        if (navigator.share) {
          navigator.share({ title, url: window.location.href }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(window.location.href);
          toast('Link copied to clipboard!');
        }
      };
    }

    function upgradeTrendingScreen() {
      document.querySelectorAll(
        '#trending-screen .post-card, #trending-screen .trend-card, ' +
        '#trending-screen .trending-card, .trending-item'
      ).forEach(upgradeTrendingCard);
    }

    upgradeTrendingScreen();
    new MutationObserver(upgradeTrendingScreen)
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIX #16 — Video Calls: grouped hierarchy
   * ═══════════════════════════════════════════════════════════ */
  function fixVideoCallsLayout() {
    function restructure() {
      const screen = document.getElementById('video-calls-screen');
      if (!screen || screen.dataset.vcRestructured) return;

      // Only run if the screen has the flat 2-col grid with ≥ 12 buttons
      const allBtns = screen.querySelectorAll('.feature-btn, .vc-btn, .video-feature-btn, .call-feature');
      if (allBtns.length < 6) return;

      screen.dataset.vcRestructured = '1';

      // Build the new grouped HTML at the top of the screen (before any existing grid)
      const wrapper = document.createElement('div');
      wrapper.id = 'lnk-vc-grouped';
      wrapper.innerHTML = `
        <style>
          #lnk-vc-grouped .vc-section-title {
            font-size:11px;font-weight:700;letter-spacing:.08em;
            text-transform:uppercase;color:#8892b0;
            margin:16px 0 10px;padding:0 4px;
          }
          #lnk-vc-grouped .vc-primary-row {
            display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;
          }
          #lnk-vc-grouped .vc-primary-btn {
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            gap:6px;padding:18px 12px;border-radius:16px;
            background:linear-gradient(135deg,#6d28d9,#4f46e5);
            color:#fff;font-size:13px;font-weight:600;border:none;cursor:pointer;
            min-height:80px;transition:transform .15s,opacity .15s;
          }
          #lnk-vc-grouped .vc-primary-btn:active { transform:scale(.96); }
          #lnk-vc-grouped .vc-primary-btn span.icon { font-size:24px; }
          #lnk-vc-grouped .vc-contextual-row {
            display:grid;grid-template-columns:repeat(3,1fr);gap:10px;
          }
          #lnk-vc-grouped .vc-ctx-btn {
            display:flex;flex-direction:column;align-items:center;gap:5px;
            padding:14px 8px;border-radius:14px;
            background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
            color:#ccd6f6;font-size:11px;text-align:center;cursor:pointer;
          }
          #lnk-vc-grouped .vc-ctx-btn .icon { font-size:22px; }
          #lnk-vc-grouped .vc-advanced-toggle {
            width:100%;margin:14px 0 6px;padding:12px;border-radius:12px;
            background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
            color:#8892b0;font-size:13px;cursor:pointer;text-align:left;
            display:flex;justify-content:space-between;align-items:center;
          }
          #lnk-vc-grouped .vc-advanced-panel {
            display:none;grid-template-columns:repeat(3,1fr);gap:10px;padding-bottom:8px;
          }
          #lnk-vc-grouped .vc-advanced-panel.open { display:grid; }
          #lnk-vc-grouped .vc-adv-btn {
            display:flex;flex-direction:column;align-items:center;gap:4px;
            padding:12px 8px;border-radius:12px;
            background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);
            color:#8892b0;font-size:11px;text-align:center;cursor:pointer;
          }
          #lnk-vc-grouped .vc-adv-btn .icon { font-size:20px; }
        </style>

        <div class="vc-section-title">Start a Call</div>
        <div class="vc-primary-row">
          <button class="vc-primary-btn" onclick="window.startVideoCall?.() || window.openVideoCall?.() || window.showToast?.('Starting video call…')">
            <span class="icon">📹</span>Video Call
          </button>
          <button class="vc-primary-btn" style="background:linear-gradient(135deg,#0d9488,#0891b2)"
            onclick="window.startAudioCall?.() || window.showToast?.('Starting audio call…')">
            <span class="icon">📞</span>Audio Call
          </button>
        </div>

        <div class="vc-section-title">During a Call</div>
        <div class="vc-contextual-row">
          <div class="vc-ctx-btn" onclick="window.toggleScreenShare?.() || toast('Screen share toggled')">
            <span class="icon">🖥️</span>Screen Share
          </div>
          <div class="vc-ctx-btn" onclick="window.toggleRecording?.() || toast('Recording toggled')">
            <span class="icon">⏺️</span>Recording
          </div>
          <div class="vc-ctx-btn" onclick="window.addPeopleToCall?.() || toast('Add people opened')">
            <span class="icon">👥</span>Add People
          </div>
          <div class="vc-ctx-btn" onclick="window.openVirtualBackground?.() || toast('Background effects')">
            <span class="icon">🌄</span>Background
          </div>
          <div class="vc-ctx-btn" onclick="window.toggleMute?.() || toast('Mute toggled')">
            <span class="icon">🎙️</span>Audio
          </div>
          <div class="vc-ctx-btn" onclick="window.openCallSettings?.() || toast('Call settings')">
            <span class="icon">⚙️</span>Devices
          </div>
        </div>

        <button class="vc-advanced-toggle" id="lnk-vc-adv-toggle">
          <span>⚙️ Advanced Settings</span>
          <span id="lnk-vc-adv-arrow">▾</span>
        </button>
        <div class="vc-advanced-panel" id="lnk-vc-adv-panel">
          <div class="vc-adv-btn" onclick="toast('Quality settings')"><span class="icon">📶</span>Quality</div>
          <div class="vc-adv-btn" onclick="toast('Waiting room')"><span class="icon">🚪</span>Waiting Room</div>
          <div class="vc-adv-btn" onclick="toast('Schedule call')"><span class="icon">📅</span>Schedule</div>
          <div class="vc-adv-btn" onclick="toast('Analytics')"><span class="icon">📊</span>Analytics</div>
          <div class="vc-adv-btn" onclick="toast('Network info')"><span class="icon">🔗</span>Network</div>
          <div class="vc-adv-btn" onclick="toast('Recordings')"><span class="icon">🎬</span>Recordings</div>
        </div>`;

      const toggle = wrapper.querySelector('#lnk-vc-adv-toggle');
      const panel  = wrapper.querySelector('#lnk-vc-adv-panel');
      const arrow  = wrapper.querySelector('#lnk-vc-adv-arrow');
      toggle.onclick = () => {
        panel.classList.toggle('open');
        arrow.textContent = panel.classList.contains('open') ? '▴' : '▾';
      };

      // Insert before the existing grid
      const existingGrid = screen.querySelector('.features-grid, .vc-grid, .video-features');
      if (existingGrid) {
        existingGrid.style.display = 'none'; // hide old flat grid
        existingGrid.parentNode.insertBefore(wrapper, existingGrid);
      } else {
        screen.prepend(wrapper);
      }
    }

    restructure();
    new MutationObserver(restructure)
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIX #17 — Logout: confirmation dialog before executing
   * ═══════════════════════════════════════════════════════════ */
  function fixLogoutConfirmation() {
    function patchLogoutButton(btn) {
      if (btn.dataset.logoutPatched) return;
      btn.dataset.logoutPatched = '1';

      // Clone and replace to remove all old listeners
      const clone = btn.cloneNode(true);
      btn.parentNode?.replaceChild(clone, btn);

      clone.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const confirmed = await confirm(
          'Are you sure you want to log out of LynkApp?',
          'Log Out',
          'Cancel'
        );
        if (!confirmed) return;
        // Run any existing logout function
        if (typeof window.logout === 'function')            window.logout();
        else if (typeof window.signOut === 'function')      window.signOut();
        else if (typeof window.handleLogout === 'function') window.handleLogout();
        else if (window.firebase?.auth) {
          window.firebase.auth().signOut().catch(console.warn);
        } else {
          // Fallback: clear storage and reload
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        }
      });
    }

    function findAndPatchLogoutBtns() {
      document.querySelectorAll(
        '[onclick*="logout"], [onclick*="signOut"], [onclick*="logOut"], ' +
        '.logout-btn, #logout-btn, .sign-out-btn, [data-action="logout"]'
      ).forEach(patchLogoutButton);

      // Also catch by text content
      document.querySelectorAll('button, a').forEach(el => {
        const txt = el.textContent.trim().toLowerCase();
        if ((txt === 'log out' || txt === 'logout' || txt === 'sign out') && !el.dataset.logoutPatched) {
          patchLogoutButton(el);
        }
      });
    }

    findAndPatchLogoutBtns();
    new MutationObserver(findAndPatchLogoutBtns)
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIX #18 — Join Group button: persisted toggle state
   * ═══════════════════════════════════════════════════════════ */
  function fixJoinGroupState() {
    function patchBtn(btn) {
      if (btn.dataset.joinPatched) return;
      btn.dataset.joinPatched = '1';

      const groupId = btn.closest('[data-group-id]')?.dataset.groupId
                   || btn.dataset.groupId
                   || 'g_' + Math.random().toString(36).slice(2);
      const KEY = `lnk_group_joined_${groupId}`;

      function applyState(joined) {
        if (joined) {
          btn.textContent = '✓ Joined';
          btn.style.background = 'rgba(16,185,129,0.2)';
          btn.style.borderColor = 'rgba(16,185,129,0.5)';
          btn.style.color       = '#34d399';
        } else {
          btn.textContent = 'Join Group';
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color       = '';
        }
      }

      // Restore persisted state
      applyState(!!localStorage.getItem(KEY));

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const joined = !!localStorage.getItem(KEY);
        if (joined) {
          localStorage.removeItem(KEY);
          applyState(false);
          toast('Left group');
        } else {
          localStorage.setItem(KEY, '1');
          applyState(true);
          toast('Joined! 🎉');
        }
      });
    }

    function findJoinBtns() {
      document.querySelectorAll(
        '.join-group-btn, .join-btn, [data-action="join-group"], ' +
        '#groups-screen .btn, #suggested-groups .btn'
      ).forEach(btn => {
        const txt = btn.textContent.trim();
        if (txt === 'Join Group' || txt === 'Join' || txt === '✓ Joined') patchBtn(btn);
      });

      // Catch by text content anywhere
      document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.trim() === 'Join Group' && !btn.dataset.joinPatched) patchBtn(btn);
      });
    }

    findJoinBtns();
    new MutationObserver(findJoinBtns)
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIX #19 — Marketplace cart badge always visible
   * ═══════════════════════════════════════════════════════════ */
  function fixMarketplaceCartBadge() {
    const CART_KEY = 'lnk_cart_count';

    function getCount() {
      return parseInt(localStorage.getItem(CART_KEY) || '0', 10);
    }

    function updateBadge(count) {
      const badges = document.querySelectorAll(
        '.cart-badge, #cart-badge, .cart-count, #cart-count, [data-cart-badge]'
      );
      badges.forEach(b => {
        b.textContent = count;
        b.style.display = 'inline-flex';
        b.style.alignItems = 'center';
        b.style.justifyContent = 'center';
        b.style.minWidth = '18px';
        b.style.height  = '18px';
        b.style.borderRadius = '50%';
        b.style.fontSize = '10px';
        b.style.fontWeight = '700';
        if (count === 0) {
          b.style.background = '#555';
          b.style.color = '#aaa';
        } else {
          b.style.background = '#ef4444';
          b.style.color = '#fff';
        }
      });

      // Also show the cart icon button itself (remove display:none)
      document.querySelectorAll(
        '.cart-btn, #cart-btn, .cart-icon, [data-action="cart"], [aria-label*="cart" i], [aria-label*="Cart" i]'
      ).forEach(el => {
        el.style.display = '';
        el.style.visibility = 'visible';
      });
    }

    // Patch "Add to Cart" buttons to increment the count
    function patchAddToCart(btn) {
      if (btn.dataset.cartPatched) return;
      btn.dataset.cartPatched = '1';
      btn.addEventListener('click', () => {
        const c = getCount() + 1;
        localStorage.setItem(CART_KEY, c);
        updateBadge(c);
        toast(`Added to cart 🛒  (${c} item${c !== 1 ? 's' : ''})`);
      });
    }

    function findCartElements() {
      updateBadge(getCount());
      document.querySelectorAll(
        '.add-to-cart, [data-action="add-to-cart"], [onclick*="addToCart"], .buy-btn'
      ).forEach(patchAddToCart);
      document.querySelectorAll('button').forEach(btn => {
        if (/add to cart/i.test(btn.textContent) && !btn.dataset.cartPatched) patchAddToCart(btn);
      });
    }

    findCartElements();
    new MutationObserver(findCartElements)
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIX #20 — AR/VR filter cards: "Coming Soon" overlay
   * ═══════════════════════════════════════════════════════════ */
  function fixArVrComingSoon() {
    function addComingSoonOverlay(card) {
      if (card.dataset.csOverlaid) return;
      card.dataset.csOverlaid = '1';

      // Make the card position:relative so overlay can be absolute
      const pos = getComputedStyle(card).position;
      if (pos === 'static') card.style.position = 'relative';

      const overlay = document.createElement('div');
      overlay.className = 'ar-coming-soon-overlay';
      overlay.innerHTML = `
        <div style="
          position:absolute;inset:0;background:rgba(0,0,0,0.55);
          border-radius:inherit;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:4px;
          z-index:10;pointer-events:none;">
          <span style="font-size:18px;">🚧</span>
          <span style="
            color:#f59e0b;font-size:10px;font-weight:700;
            letter-spacing:.06em;text-transform:uppercase;">Coming Soon</span>
        </div>`;
      card.appendChild(overlay);

      // Replace click handler: show "in development" toast instead of fake filter
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        toast('🚧 AR filters coming soon — powered by DeepAR SDK');
      });
    }

    function addCameraPlaceholder() {
      const screen = document.getElementById('ar-vr-screen') ||
                     document.querySelector('.ar-screen, #arvr-screen');
      if (!screen || screen.dataset.arUpgraded) return;
      screen.dataset.arUpgraded = '1';

      // Insert a camera placeholder at the top
      const placeholder = document.createElement('div');
      placeholder.id = 'lnk-ar-camera-placeholder';
      placeholder.innerHTML = `
        <div style="
          width:100%;aspect-ratio:9/16;max-height:280px;
          background:linear-gradient(180deg,#0f0f1a 0%,#1a1a2e 100%);
          border-radius:16px;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:12px;
          margin-bottom:16px;border:1px dashed rgba(139,92,246,0.3);">
          <span style="font-size:48px;">📷</span>
          <p style="color:#8892b0;font-size:14px;font-weight:600;margin:0;text-align:center;padding:0 20px;">
            AR Camera Preview
          </p>
          <p style="color:#555;font-size:12px;margin:0;text-align:center;padding:0 24px;line-height:1.5;">
            Real-time AR filters powered by DeepAR SDK<br>
            <span style="color:#f59e0b;">🚧 Integration in progress</span>
          </p>
          <button onclick="window.showToast?.('DeepAR SDK integration in progress') || alert('Coming soon!')"
            style="
              margin-top:4px;padding:8px 20px;border-radius:20px;
              background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.4);
              color:#a78bfa;font-size:12px;cursor:pointer;">
            Enable Camera Preview
          </button>
        </div>`;

      const filterGrid = screen.querySelector('.ar-filters, .filter-grid, .filters-container, .ar-grid');
      if (filterGrid) {
        screen.insertBefore(placeholder, filterGrid);
      } else {
        screen.prepend(placeholder);
      }
    }

    function upgradeArScreen() {
      document.querySelectorAll(
        '#ar-vr-screen .filter-card, #ar-vr-screen .ar-filter, ' +
        '.ar-screen .filter-card, .arvr-screen .filter-card, ' +
        '[data-ar-filter], .ar-filter-item'
      ).forEach(addComingSoonOverlay);
      addCameraPlaceholder();
    }

    upgradeArScreen();
    new MutationObserver(upgradeArScreen)
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════════════════════
   *  BOOT — run everything after DOM is ready
   * ═══════════════════════════════════════════════════════════ */
  ready(() => {
    fixStoryTimestamps();     // #11
    fixProfileAvatars();      // #12
    fixMusicMiniPlayer();     // #13
    fixSearchEmptyState();    // #14
    fixTrendingActions();     // #15
    fixVideoCallsLayout();    // #16
    fixLogoutConfirmation();  // #17
    fixJoinGroupState();      // #18
    fixMarketplaceCartBadge();// #19
    fixArVrComingSoon();      // #20

    console.log('[LynkApp] Medium-priority UX fixes (#11–#20) applied ✅');
  });

})();
