/**
 * LEFT SIDEBAR NAVIGATION SYSTEM — LynkApp
 * =========================================
 * Features:
 *  • Transparent glassmorphic design — matches app tokens
 *  • Three states: hidden | collapsed (icons only) | expanded (icons + labels)
 *  • Pinnable — locks open, shifts main content
 *  • Hover-to-peek on desktop (auto-expands on hover when collapsed)
 *  • Click toggle button to expand/collapse
 *  • Pin button to lock expanded state
 *  • Mobile: off-screen → swipe-right or hamburger button to open
 *  • Swipe-left or overlay click to close on mobile
 *  • Persists pin state in localStorage
 *  • Keyboard: Escape closes, arrow keys navigate items
 *  • ARIA roles for screen readers
 */

(function () {
    'use strict';

    // ── Config ──────────────────────────────────────────────────────────────
    const SIDEBAR_WIDTH_EXPANDED  = 240;
    const SIDEBAR_WIDTH_COLLAPSED = 64;
    const MOBILE_BREAKPOINT       = 768;
    const STORAGE_KEY             = 'lynk_sidebar_pinned';
    const HOVER_DELAY_MS          = 120;   // ms before hover expands
    const SWIPE_THRESHOLD         = 60;    // px of horizontal swipe needed

    // ── Nav Data ────────────────────────────────────────────────────────────
    const NAV_DATA = [
        {
            id: 'social',
            label: 'Social',
            icon: '📱',
            items: [
                { screen: 'home',     label: 'Home',      icon: '🏠' },
                { screen: 'messages', label: 'Messages',  icon: '💬', badge: 'msgBadge' },
                { screen: 'stories',  label: 'Stories',   icon: '✨' },
                { screen: 'profile',  label: 'Profile',   icon: '👤' },
                { screen: 'groups',   label: 'Groups',    icon: '👥' },
                { screen: 'events',   label: 'Events',    icon: '📅' },
                { screen: 'explore',  label: 'Explore',   icon: '🌟' },
                { screen: 'search',   label: 'Search',    icon: '🔍' },
                { screen: 'settings', label: 'Settings',  icon: '⚙️' },
            ],
        },
        {
            id: 'dating',
            label: 'Dating',
            icon: '💕',
            items: [
                { screen: 'swipe',       label: 'Discover',    icon: '💫' },
                { screen: 'matches',     label: 'Matches',     icon: '💕' },
                { screen: 'chat',        label: 'Chat',        icon: '💬' },
                { screen: 'preferences', label: 'Preferences', icon: '🎯' },
            ],
        },
        {
            id: 'media',
            label: 'Media',
            icon: '🎵',
            items: [
                { screen: 'music',  label: 'Music',       icon: '🎵' },
                { screen: 'live',   label: 'Live',        icon: '📺' },
                { screen: 'video',  label: 'Video Calls', icon: '📹' },
                { screen: 'ar',     label: 'AR / VR',     icon: '🥽' },
            ],
        },
        {
            id: 'extra',
            label: 'Extra',
            icon: '🎮',
            items: [
                { screen: 'games',       label: 'Games',       icon: '🎮' },
                { screen: 'marketplace', label: 'Marketplace', icon: '🛒' },
                { screen: 'business',    label: 'Business',    icon: '💼' },
                { screen: 'wallet',      label: 'Wallet',      icon: '💰' },
                { screen: 'analytics',   label: 'Analytics',   icon: '📊' },
                { screen: 'help',        label: 'Help',        icon: '❓' },
            ],
        },
    ];

    // ── State ───────────────────────────────────────────────────────────────
    let isPinned    = localStorage.getItem(STORAGE_KEY) === 'true';
    let isExpanded  = isPinned;
    let isMobileOpen = false;
    let hoverTimer  = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let activeCategory = 'social';
    let activeScreen   = 'home';

    // ── DOM References ──────────────────────────────────────────────────────
    let sidebar, overlay, toggleBtn, pinBtn, navList, hamburgerBtn;

    // ── Build HTML ──────────────────────────────────────────────────────────
    function buildSidebar () {
        // Remove existing if present (re-init safe)
        const existing = document.getElementById('leftSidebar');
        if (existing) existing.remove();
        const existingOv = document.getElementById('sidebarOverlay');
        if (existingOv) existingOv.remove();
        const existingHb = document.getElementById('sidebarHamburger');
        if (existingHb) existingHb.remove();

        // ── Overlay (mobile) ──
        overlay = document.createElement('div');
        overlay.id = 'sidebarOverlay';
        overlay.className = 'sidebar-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.addEventListener('click', closeMobile);
        document.body.appendChild(overlay);

        // ── Sidebar ──
        sidebar = document.createElement('aside');
        sidebar.id = 'leftSidebar';
        sidebar.className = 'left-sidebar' + (isPinned ? ' pinned' : '') + (isExpanded ? ' expanded' : '');
        sidebar.setAttribute('role', 'navigation');
        sidebar.setAttribute('aria-label', 'Main navigation');

        sidebar.innerHTML = `
            <!-- Brand row -->
            <div class="sidebar-brand">
                <div class="sidebar-logo-mark" aria-hidden="true">
                    <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                        <circle cx="16" cy="16" r="14" fill="url(#sb-grad)"/>
                        <path d="M10 16 L16 10 L22 16 L16 22 Z" fill="white" opacity="0.9"/>
                        <defs>
                            <linearGradient id="sb-grad" x1="0" y1="0" x2="32" y2="32">
                                <stop offset="0%" stop-color="#4f46e5"/>
                                <stop offset="100%" stop-color="#ec4899"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <span class="sidebar-brand-name">Lynk</span>
                <button class="sidebar-pin-btn" id="sidebarPinBtn"
                        title="Pin sidebar open"
                        aria-pressed="${isPinned}"
                        aria-label="${isPinned ? 'Unpin sidebar' : 'Pin sidebar'}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="17" x2="12" y2="22"/>
                        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                    </svg>
                </button>
            </div>

            <!-- Collapse / expand toggle -->
            <button class="sidebar-toggle-btn" id="sidebarToggle"
                    aria-expanded="${isExpanded}"
                    aria-controls="sidebarNavList"
                    aria-label="${isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}">
                <svg class="sidebar-toggle-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <line x1="3" y1="6"  x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
                <span class="sidebar-toggle-label">Menu</span>
            </button>

            <!-- Nav list -->
            <nav class="sidebar-nav-scroll" id="sidebarNavList" role="list">
                ${buildNavHTML()}
            </nav>

            <!-- Footer -->
            <div class="sidebar-footer">
                <button class="sidebar-item sidebar-footer-item" onclick="switchToScreen('social','settings')" aria-label="Settings">
                    <span class="sidebar-icon" aria-hidden="true">⚙️</span>
                    <span class="sidebar-item-label">Settings</span>
                </button>
                <button class="sidebar-item sidebar-footer-item" onclick="showAuthScreen ? showAuthScreen() : null" aria-label="Sign out">
                    <span class="sidebar-icon" aria-hidden="true">🚪</span>
                    <span class="sidebar-item-label">Sign Out</span>
                </button>
            </div>
        `;

        document.body.appendChild(sidebar);

        // ── Hamburger button (top-left, visible only on mobile) ──
        hamburgerBtn = document.createElement('button');
        hamburgerBtn.id = 'sidebarHamburger';
        hamburgerBtn.className = 'sidebar-hamburger';
        hamburgerBtn.setAttribute('aria-label', 'Open navigation menu');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>`;
        hamburgerBtn.addEventListener('click', toggleMobile);
        document.body.appendChild(hamburgerBtn);

        // Cache refs
        toggleBtn = document.getElementById('sidebarToggle');
        pinBtn    = document.getElementById('sidebarPinBtn');
        navList   = document.getElementById('sidebarNavList');

        bindEvents();
        applyState(false /* no animation on init */);
        highlightActive();
        adjustMainContent();
    }

    // ── Build nav HTML ───────────────────────────────────────────────────────
    function buildNavHTML () {
        return NAV_DATA.map(cat => `
            <div class="sidebar-category-group" data-category="${cat.id}">
                <button class="sidebar-category-btn"
                        data-cat="${cat.id}"
                        aria-label="Switch to ${cat.label}"
                        title="${cat.label}">
                    <span class="sidebar-icon" aria-hidden="true">${cat.icon}</span>
                    <span class="sidebar-item-label sidebar-cat-label">${cat.label}</span>
                    <svg class="sidebar-cat-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <div class="sidebar-items-list" role="list">
                    ${cat.items.map(item => `
                        <button class="sidebar-item"
                                data-category="${cat.id}"
                                data-screen="${item.screen}"
                                role="listitem"
                                title="${item.label}"
                                aria-label="${item.label}">
                            <span class="sidebar-icon" aria-hidden="true">${item.icon}</span>
                            <span class="sidebar-item-label">${item.label}</span>
                            ${item.badge ? `<span class="sidebar-badge" id="${item.badge}" style="display:none">0</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // ── Events ───────────────────────────────────────────────────────────────
    function bindEvents () {
        // Toggle collapse/expand
        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                toggleMobile();
            } else {
                toggleExpand();
            }
        });

        // Pin
        pinBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            togglePin();
        });

        // Hover to peek (desktop only, when collapsed and not pinned)
        sidebar.addEventListener('mouseenter', function () {
            if (window.innerWidth <= MOBILE_BREAKPOINT) return;
            if (!isPinned && !isExpanded) {
                hoverTimer = setTimeout(function () {
                    expand(true /* isHover */);
                }, HOVER_DELAY_MS);
            }
        });
        sidebar.addEventListener('mouseleave', function () {
            clearTimeout(hoverTimer);
            if (window.innerWidth <= MOBILE_BREAKPOINT) return;
            if (!isPinned && isExpanded) {
                collapse();
            }
        });

        // Category group click
        sidebar.addEventListener('click', function (e) {
            const catBtn = e.target.closest('.sidebar-category-btn');
            if (catBtn) {
                const cat = catBtn.dataset.cat;
                toggleCategory(cat);
                return;
            }

            const item = e.target.closest('.sidebar-item[data-screen]');
            if (item && !item.classList.contains('sidebar-footer-item')) {
                const cat    = item.dataset.category;
                const screen = item.dataset.screen;
                navigateTo(cat, screen);
            }
        });

        // Keyboard navigation
        sidebar.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    closeMobile();
                } else if (!isPinned) {
                    collapse();
                }
            }
        });

        // Touch / swipe (mobile)
        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchend',   onTouchEnd,   { passive: true });
    }

    // ── Touch swipe support ──────────────────────────────────────────────────
    function onTouchStart (e) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }

    function onTouchEnd (e) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Only fire if horizontal swipe is dominant
        if (Math.abs(dx) < Math.abs(dy) * 1.5) return;

        if (window.innerWidth > MOBILE_BREAKPOINT) return;

        if (dx > SWIPE_THRESHOLD && touchStartX < 40 && !isMobileOpen) {
            // Swipe right from left edge → open
            openMobile();
        } else if (dx < -SWIPE_THRESHOLD && isMobileOpen) {
            // Swipe left → close
            closeMobile();
        }
    }

    // ── State management ─────────────────────────────────────────────────────
    function expand (isHover) {
        isExpanded = true;
        sidebar.classList.add('expanded');
        sidebar.classList.remove('collapsed');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.setAttribute('aria-label', 'Collapse sidebar');
        }
        if (!isHover) adjustMainContent();
    }

    function collapse () {
        isExpanded = false;
        sidebar.classList.remove('expanded');
        sidebar.classList.add('collapsed');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.setAttribute('aria-label', 'Expand sidebar');
        }
        adjustMainContent();
    }

    function toggleExpand () {
        if (isExpanded) collapse();
        else expand(false);
    }

    function togglePin () {
        isPinned = !isPinned;
        localStorage.setItem(STORAGE_KEY, isPinned);
        sidebar.classList.toggle('pinned', isPinned);
        if (pinBtn) {
            pinBtn.setAttribute('aria-pressed', isPinned);
            pinBtn.setAttribute('aria-label', isPinned ? 'Unpin sidebar' : 'Pin sidebar');
            pinBtn.classList.toggle('active', isPinned);
        }
        if (isPinned) expand(false);
        adjustMainContent();
    }

    function openMobile () {
        isMobileOpen = true;
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        hamburgerBtn && hamburgerBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobile () {
        isMobileOpen = false;
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        hamburgerBtn && hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function toggleMobile () {
        if (isMobileOpen) closeMobile();
        else openMobile();
    }

    function applyState (animate) {
        if (!sidebar) return;
        if (!animate) sidebar.classList.add('no-transition');
        if (isPinned) {
            sidebar.classList.add('pinned', 'expanded');
            isExpanded = true;
        } else if (!isExpanded) {
            sidebar.classList.add('collapsed');
        }
        if (!animate) {
            requestAnimationFrame(function () {
                sidebar.classList.remove('no-transition');
            });
        }
    }

    // ── Navigation ───────────────────────────────────────────────────────────
    function toggleCategory (catId) {
        const group = sidebar.querySelector(`.sidebar-category-group[data-category="${catId}"]`);
        if (!group) return;

        const isOpen = group.classList.contains('open');

        // If expanding and sidebar collapsed, expand it first
        if (!isExpanded && !isPinned) expand(false);

        if (isOpen) {
            group.classList.remove('open');
        } else {
            // Close others
            sidebar.querySelectorAll('.sidebar-category-group.open').forEach(function (g) {
                if (g !== group) g.classList.remove('open');
            });
            group.classList.add('open');
            activeCategory = catId;

            // Also call selectCategory if that global fn exists
            if (typeof selectCategory === 'function') {
                selectCategory(catId);
            }
        }
    }

    function navigateTo (cat, screen) {
        activeCategory = cat;
        activeScreen   = screen;

        // Call the app's routing functions
        if (typeof selectCategory === 'function') {
            selectCategory(cat);
        }
        if (typeof switchToScreen === 'function') {
            switchToScreen(cat, screen);
        }

        highlightActive();

        // Close on mobile after tap
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            setTimeout(closeMobile, 200);
        }
    }

    // ── Highlight active item ─────────────────────────────────────────────────
    function highlightActive () {
        if (!sidebar) return;
        sidebar.querySelectorAll('.sidebar-item').forEach(function (btn) {
            const isCat    = btn.dataset.category === activeCategory;
            const isScr    = btn.dataset.screen   === activeScreen;
            btn.classList.toggle('active', isCat && isScr);
        });

        // Open active category group
        const activeGroup = sidebar.querySelector(`.sidebar-category-group[data-category="${activeCategory}"]`);
        if (activeGroup && !activeGroup.classList.contains('open')) {
            activeGroup.classList.add('open');
        }

        // Highlight category button
        sidebar.querySelectorAll('.sidebar-category-btn').forEach(function (btn) {
            btn.classList.toggle('cat-active', btn.dataset.cat === activeCategory);
        });
    }

    // ── Adjust main content margin ────────────────────────────────────────────
    function adjustMainContent () {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        const margin = isMobile ? 0 : (isPinned && isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED);

        // Apply to .main-container, .sub-nav, .navbar if they exist
        const targets = [
            document.querySelector('.navbar'),
            document.querySelector('.sub-nav'),
            document.querySelector('.main-container'),
        ];

        targets.forEach(function (el) {
            if (!el) return;
            el.style.transition = 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.marginLeft = margin + 'px';
        });
    }

    // ── Update badge ──────────────────────────────────────────────────────────
    window.updateSidebarBadge = function (badgeId, count) {
        const el = document.getElementById(badgeId);
        if (!el) return;
        if (count > 0) {
            el.textContent = count > 99 ? '99+' : count;
            el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    };

    // ── Public API ────────────────────────────────────────────────────────────
    window.lynkSidebar = {
        open   : openMobile,
        close  : closeMobile,
        pin    : function () { if (!isPinned) togglePin(); },
        unpin  : function () { if (isPinned)  togglePin(); },
        expand : function () { expand(false); },
        collapse: collapse,
        setActive: function (cat, screen) {
            activeCategory = cat || activeCategory;
            activeScreen   = screen || activeScreen;
            highlightActive();
        },
        rebuild: buildSidebar,
    };

    // ── Resize handler ────────────────────────────────────────────────────────
    window.addEventListener('resize', function () {
        adjustMainContent();
        if (window.innerWidth > MOBILE_BREAKPOINT && isMobileOpen) {
            closeMobile();
        }
    });

    // ── Hide old bottom-nav and top category nav to avoid duplication ─────────
    function hideOldNav () {
        const oldBottomNav = document.querySelector('.bottom-nav');
        if (oldBottomNav) oldBottomNav.style.display = 'none';

        // Hide mainNav category tabs inside navbar (replaced by sidebar)
        const mainNav = document.getElementById('mainNav');
        if (mainNav) {
            mainNav.style.display = 'none';
        }

        // Optionally hide subNav (sidebar now handles sub-items)
        // Keeping subNav visible but it will shift with sidebar margin
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    function init () {
        buildSidebar();
        hideOldNav();

        // Reflect current app state if routing vars exist
        if (typeof currentCategory !== 'undefined' && currentCategory) {
            activeCategory = currentCategory;
        }
        if (typeof currentScreen !== 'undefined' && currentScreen) {
            activeScreen = currentScreen;
        }
        highlightActive();

        // Open active category group
        toggleCategory(activeCategory);

        console.log('✅ Left Sidebar Nav initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // If DOM already ready (late script load)
        init();
    }
})();
