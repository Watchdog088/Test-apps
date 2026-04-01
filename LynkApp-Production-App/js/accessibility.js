/**
 * LynkApp Accessibility Enhancement
 * Phase 4: ARIA labels, keyboard navigation, focus management, screen reader support
 */

(function() {
    'use strict';

    // ══════════════════════════════════════════
    // 1. ARIA LABELS - Add missing labels
    // ══════════════════════════════════════════
    
    function addAriaLabels() {
        // Label all icon-only buttons
        document.querySelectorAll('button, [onclick], [role="button"]').forEach(btn => {
            if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
                const icon = btn.querySelector('i, svg, .icon');
                const title = btn.title || btn.dataset.tooltip || '';
                if (title) btn.setAttribute('aria-label', title);
            }
        });

        // Label navigation elements
        document.querySelectorAll('nav, [role="navigation"]').forEach((nav, i) => {
            if (!nav.getAttribute('aria-label')) {
                nav.setAttribute('aria-label', i === 0 ? 'Main navigation' : `Navigation ${i + 1}`);
            }
        });

        // Label search inputs
        document.querySelectorAll('input[type="search"], input[placeholder*="earch"]').forEach(input => {
            if (!input.getAttribute('aria-label')) {
                input.setAttribute('aria-label', input.placeholder || 'Search');
            }
        });

        // Label form inputs without labels
        document.querySelectorAll('input, textarea, select').forEach(input => {
            if (!input.getAttribute('aria-label') && !input.id) return;
            if (input.id && !document.querySelector(`label[for="${input.id}"]`)) {
                if (!input.getAttribute('aria-label')) {
                    input.setAttribute('aria-label', input.placeholder || input.name || input.type);
                }
            }
        });

        // Label images without alt text
        document.querySelectorAll('img:not([alt])').forEach(img => {
            img.alt = img.title || 'Image';
        });

        // Add role to clickable divs
        document.querySelectorAll('[onclick]:not(button):not(a):not(input)').forEach(el => {
            if (!el.getAttribute('role')) el.setAttribute('role', 'button');
            if (!el.getAttribute('tabindex')) el.setAttribute('tabindex', '0');
        });

        // Label modals/dialogs
        document.querySelectorAll('.modal, .overlay, .popup, [class*="modal"]').forEach(modal => {
            if (!modal.getAttribute('role')) modal.setAttribute('role', 'dialog');
            if (!modal.getAttribute('aria-modal')) modal.setAttribute('aria-modal', 'true');
            const title = modal.querySelector('h1, h2, h3, .title, .header');
            if (title && !modal.getAttribute('aria-label')) {
                modal.setAttribute('aria-label', title.textContent.trim());
            }
        });

        // Label main content regions
        const main = document.querySelector('main, [role="main"], .main-content, .app-content');
        if (main && !main.getAttribute('role')) main.setAttribute('role', 'main');

        // Bottom navigation bar
        const bottomNav = document.querySelector('.bottom-nav, .tab-bar, .navigation-bar');
        if (bottomNav) {
            bottomNav.setAttribute('role', 'tablist');
            bottomNav.setAttribute('aria-label', 'Main sections');
            bottomNav.querySelectorAll('.nav-item, .tab-item, [data-section]').forEach(item => {
                item.setAttribute('role', 'tab');
                const isActive = item.classList.contains('active');
                item.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
        }

        console.log('[Accessibility] ARIA labels applied');
    }

    // ══════════════════════════════════════════
    // 2. KEYBOARD NAVIGATION
    // ══════════════════════════════════════════
    
    function setupKeyboardNavigation() {
        // Enter/Space activates buttons and clickable elements
        document.addEventListener('keydown', (e) => {
            const el = e.target;
            
            // Enter/Space on role="button" elements
            if ((e.key === 'Enter' || e.key === ' ') && el.getAttribute('role') === 'button') {
                e.preventDefault();
                el.click();
            }

            // Escape closes modals/overlays
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active, .overlay.active, [class*="modal"].active, [role="dialog"]:not([hidden])');
                if (activeModal) {
                    activeModal.classList.remove('active');
                    activeModal.setAttribute('hidden', '');
                    // Return focus to trigger element
                    const trigger = document.querySelector('[data-modal-trigger]');
                    if (trigger) trigger.focus();
                }

                // Close any open menus
                const openMenu = document.querySelector('.dropdown.open, .menu.open, .popup.open');
                if (openMenu) openMenu.classList.remove('open');
            }

            // Tab trap in modals
            if (e.key === 'Tab') {
                const modal = document.querySelector('[role="dialog"]:not([hidden]), .modal.active');
                if (modal) {
                    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (focusable.length) {
                        const first = focusable[0];
                        const last = focusable[focusable.length - 1];
                        if (e.shiftKey && document.activeElement === first) {
                            e.preventDefault();
                            last.focus();
                        } else if (!e.shiftKey && document.activeElement === last) {
                            e.preventDefault();
                            first.focus();
                        }
                    }
                }
            }
        });

        // Skip to content link
        if (!document.querySelector('.skip-link')) {
            const skip = document.createElement('a');
            skip.href = '#main-content';
            skip.className = 'skip-link';
            skip.textContent = 'Skip to main content';
            skip.style.cssText = 'position:fixed;top:-100px;left:50%;transform:translateX(-50%);z-index:99999;padding:12px 24px;background:#8b5cf6;color:white;border-radius:0 0 8px 8px;text-decoration:none;font-weight:bold;transition:top 0.2s;';
            skip.addEventListener('focus', () => skip.style.top = '0');
            skip.addEventListener('blur', () => skip.style.top = '-100px');
            document.body.prepend(skip);
        }

        console.log('[Accessibility] Keyboard navigation enabled');
    }

    // ══════════════════════════════════════════
    // 3. FOCUS MANAGEMENT
    // ══════════════════════════════════════════
    
    function setupFocusManagement() {
        // Visible focus indicator styles
        const style = document.createElement('style');
        style.textContent = `
            /* Visible focus ring for keyboard users */
            .using-keyboard *:focus {
                outline: 2px solid #8b5cf6 !important;
                outline-offset: 2px !important;
            }
            .using-keyboard *:focus:not(:focus-visible) {
                outline: none !important;
            }
            *:focus-visible {
                outline: 2px solid #8b5cf6 !important;
                outline-offset: 2px !important;
            }
            
            /* High contrast mode support */
            @media (prefers-contrast: high) {
                *:focus-visible {
                    outline: 3px solid yellow !important;
                    outline-offset: 3px !important;
                }
            }
            
            /* Reduced motion preference */
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            }
            
            /* Screen reader only text */
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
        `;
        document.head.appendChild(style);

        // Detect keyboard vs mouse usage
        let usingKeyboard = false;
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                usingKeyboard = true;
                document.body.classList.add('using-keyboard');
            }
        });
        document.addEventListener('mousedown', () => {
            usingKeyboard = false;
            document.body.classList.remove('using-keyboard');
        });

        console.log('[Accessibility] Focus management initialized');
    }

    // ══════════════════════════════════════════
    // 4. LIVE REGIONS - Screen reader announcements
    // ══════════════════════════════════════════
    
    function setupLiveRegions() {
        // Create live region for announcements
        if (!document.getElementById('a11y-announcer')) {
            const announcer = document.createElement('div');
            announcer.id = 'a11y-announcer';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }

        // Global announce function
        window.LynkA11y = {
            announce(message, priority = 'polite') {
                const announcer = document.getElementById('a11y-announcer');
                if (announcer) {
                    announcer.setAttribute('aria-live', priority);
                    announcer.textContent = '';
                    requestAnimationFrame(() => {
                        announcer.textContent = message;
                    });
                }
            },

            // Announce page/section changes
            announceSection(name) {
                this.announce(`Navigated to ${name}`);
            },

            // Announce loading states
            announceLoading(isLoading) {
                this.announce(isLoading ? 'Loading content...' : 'Content loaded');
            },

            // Announce form errors
            announceError(message) {
                this.announce(message, 'assertive');
            }
        };

        // Hook into navigation to announce section changes
        const originalNavigate = window.navigateToSection || window.showSection;
        if (typeof originalNavigate === 'function') {
            const announceNav = function(...args) {
                const result = originalNavigate.apply(this, args);
                const sectionName = args[0]?.replace(/-/g, ' ').replace(/section|screen/gi, '').trim();
                if (sectionName) window.LynkA11y.announceSection(sectionName);
                return result;
            };
            if (window.navigateToSection) window.navigateToSection = announceNav;
            if (window.showSection) window.showSection = announceNav;
        }

        console.log('[Accessibility] Live regions initialized');
    }

    // ══════════════════════════════════════════
    // 5. COLOR CONTRAST & READABILITY
    // ══════════════════════════════════════════
    
    function enhanceColorContrast() {
        // Add high contrast toggle support
        const style = document.createElement('style');
        style.textContent = `
            /* Ensure minimum contrast ratios */
            .high-contrast-mode {
                --text-primary: #ffffff;
                --text-secondary: #e0e0e0;
                --bg-primary: #000000;
                --bg-secondary: #1a1a1a;
                --border-color: #ffffff;
            }
            
            .high-contrast-mode .text-muted,
            .high-contrast-mode [style*="opacity: 0."],
            .high-contrast-mode [style*="color: rgba"] {
                opacity: 1 !important;
                color: #e0e0e0 !important;
            }
            
            /* Increase text size option */
            .large-text-mode {
                font-size: 18px !important;
            }
            .large-text-mode * {
                font-size: inherit !important;
                line-height: 1.6 !important;
            }
        `;
        document.head.appendChild(style);

        // Check and apply user's OS preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast-mode');
        }

        // Expose toggle functions
        window.LynkA11y.toggleHighContrast = () => {
            document.body.classList.toggle('high-contrast-mode');
            const enabled = document.body.classList.contains('high-contrast-mode');
            localStorage.setItem('lynk-high-contrast', enabled);
            window.LynkA11y.announce(enabled ? 'High contrast mode enabled' : 'High contrast mode disabled');
        };

        window.LynkA11y.toggleLargeText = () => {
            document.body.classList.toggle('large-text-mode');
            const enabled = document.body.classList.contains('large-text-mode');
            localStorage.setItem('lynk-large-text', enabled);
            window.LynkA11y.announce(enabled ? 'Large text mode enabled' : 'Large text mode disabled');
        };

        // Restore saved preferences
        if (localStorage.getItem('lynk-high-contrast') === 'true') {
            document.body.classList.add('high-contrast-mode');
        }
        if (localStorage.getItem('lynk-large-text') === 'true') {
            document.body.classList.add('large-text-mode');
        }

        console.log('[Accessibility] Color contrast enhancements applied');
    }

    // ══════════════════════════════════════════
    // 6. TOUCH TARGET SIZES
    // ══════════════════════════════════════════
    
    function ensureTouchTargets() {
        const style = document.createElement('style');
        style.textContent = `
            /* Ensure minimum 44x44px touch targets (WCAG 2.5.8) */
            button, a, [role="button"], [role="tab"], 
            input[type="checkbox"], input[type="radio"],
            .nav-item, .tab-item, .action-btn, .icon-btn {
                min-width: 44px;
                min-height: 44px;
            }
        `;
        document.head.appendChild(style);
        console.log('[Accessibility] Touch target sizes ensured');
    }

    // ══════════════════════════════════════════
    // INITIALIZE ALL ACCESSIBILITY FEATURES
    // ══════════════════════════════════════════
    
    function initAccessibility() {
        setupFocusManagement();
        setupLiveRegions();
        addAriaLabels();
        setupKeyboardNavigation();
        enhanceColorContrast();
        ensureTouchTargets();

        // Re-apply ARIA labels when DOM changes (for dynamic content)
        if ('MutationObserver' in window) {
            let debounceTimer;
            const observer = new MutationObserver(() => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(addAriaLabels, 500);
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        console.log('[Accessibility] All enhancements initialized ✓');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccessibility);
    } else {
        initAccessibility();
    }

})();
