/**
 * LynkApp Section Lazy Loader
 * Loads section HTML snippets on-demand when a user navigates to them.
 * Reduces initial HTML parse from 585KB → ~70KB for fast startup.
 */

(function() {
  'use strict';

  // Cache of loaded section IDs so we never fetch twice
  const _loaded = {};
  // Queue of callbacks waiting for a section to finish loading
  const _pending = {};

  /**
   * Ensure a section is loaded. Returns a Promise that resolves when done.
   * If already loaded, resolves immediately.
   */
  function ensureSection(screenId) {
    const fullId = screenId.endsWith('-screen') ? screenId : (screenId + '-screen');
    const el = document.getElementById(fullId);

    // Already loaded or no lazy attribute
    if (!el || !el.dataset.lazy || _loaded[fullId]) {
      return Promise.resolve();
    }

    // Already fetching — queue up
    if (_pending[fullId]) {
      return new Promise(resolve => _pending[fullId].push(resolve));
    }

    _pending[fullId] = [];
    const url = el.dataset.lazy;

    return fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('Section fetch failed: ' + url + ' (' + r.status + ')');
        return r.text();
      })
      .then(html => {
        // Parse and inject the HTML — replace placeholder content
        const parser = new DOMParser();
        const doc = parser.parseFromString('<div>' + html + '</div>', 'text/html');
        const sectionEl = doc.body.firstChild.firstChild;

        if (sectionEl) {
          // Copy inner content into the existing placeholder div (keep the ID)
          el.innerHTML = sectionEl.innerHTML;
          // Copy any extra classes from the fetched element
          if (sectionEl.className) {
            sectionEl.className.split(' ').forEach(cls => {
              if (cls && !el.classList.contains(cls)) el.classList.add(cls);
            });
          }
        }

        _loaded[fullId] = true;
        delete el.dataset.lazy; // Clean up data attribute

        // Resolve any queued callbacks
        (_pending[fullId] || []).forEach(cb => cb());
        delete _pending[fullId];

        console.log('[SectionLoader] Loaded:', fullId);
      })
      .catch(err => {
        console.error('[SectionLoader] Error loading section:', fullId, err);
        el.innerHTML = '<div style="padding:40px;text-align:center;color:#888;">⚠️ Section could not load. Please refresh.</div>';
        _loaded[fullId] = true;
        (_pending[fullId] || []).forEach(cb => cb());
        delete _pending[fullId];
      });
  }

  /**
   * Wrap a navigation function to lazy-load before showing the screen.
   * originalFn: the original switchPillTab / switchMainTab / switchBottomTab
   */
  function wrapNavFn(originalFn) {
    return function() {
      const args = Array.from(arguments);
      // Determine which screenId is being requested
      let screenId = null;

      // switchPillTab(element, tab) — tab is second arg
      // switchMainTab(tab) — tab is first arg
      // switchBottomTab(tab) — maps to a screen
      const tabArg = args[args.length - 1];
      if (typeof tabArg === 'string') {
        const bottomMap = {
          social: 'feed', dating: 'dating', messages: 'messages',
          media: 'media', friends: 'friends'
        };
        screenId = bottomMap[tabArg] || tabArg;
      }

      if (screenId) {
        ensureSection(screenId).then(() => originalFn.apply(this, args));
      } else {
        originalFn.apply(this, args);
      }
    };
  }

  /**
   * Also intercept direct calls like showSection('dating')
   * or navigateTo('settings') that some buttons use.
   */
  function interceptDirectNav(fnName) {
    if (typeof window[fnName] === 'function') {
      const orig = window[fnName];
      window[fnName] = function() {
        const args = Array.from(arguments);
        const screenId = args[0];
        if (typeof screenId === 'string') {
          ensureSection(screenId).then(() => orig.apply(this, args));
        } else {
          orig.apply(this, args);
        }
      };
    }
  }

  /**
   * Initialize: wrap the core navigation functions once the DOM is ready.
   */
  function init() {
    // Wrap existing nav functions
    ['switchPillTab', 'switchMainTab', 'switchBottomTab', 'openMusicPlayer'].forEach(fnName => {
      if (typeof window[fnName] === 'function') {
        const orig = window[fnName];
        window[fnName] = wrapNavFn(orig);
        console.log('[SectionLoader] Wrapped:', fnName);
      }
    });

    // Intercept any direct showSection / navigateTo / openScreen calls
    ['showSection', 'navigateTo', 'openScreen', 'showScreen'].forEach(interceptDirectNav);

    // Pre-load the most common sections in the background after 3s idle
    setTimeout(() => {
      ['dating', 'messages', 'friends', 'stories'].forEach(s => ensureSection(s));
    }, 3000);

    // Also pre-load when device is idle (requestIdleCallback)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        ['profile', 'notifications', 'settings', 'menu'].forEach(s => ensureSection(s));
      });
    }

    // Load the feed (active/home screen) immediately on startup
    ensureSection('feed');

    console.log('[SectionLoader] ✅ Initialized — sections load on demand');
  }

  // Expose globally so navigation buttons can call it directly if needed
  window.SectionLoader = { ensureSection, init };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Delay slightly so app-main.js nav functions are defined first
    setTimeout(init, 100);
  }

})();
