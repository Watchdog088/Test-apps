/**
 * LynkApp Monitoring & Analytics
 * Phase 5: Error tracking, user analytics, session recording, crash reporting
 */

(function() {
    'use strict';

    const APP_VERSION = '2.5.1';
    const SESSION_ID = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // ══════════════════════════════════════════
    // 1. ERROR TRACKING & CRASH REPORTING
    // ══════════════════════════════════════════
    
    const ErrorTracker = {
        errors: [],
        maxErrors: 50,

        init() {
            // Catch unhandled errors
            window.addEventListener('error', (event) => {
                this.logError({
                    type: 'runtime',
                    message: event.message,
                    source: event.filename,
                    line: event.lineno,
                    col: event.colno,
                    stack: event.error?.stack || ''
                });
            });

            // Catch unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                this.logError({
                    type: 'promise',
                    message: event.reason?.message || String(event.reason),
                    stack: event.reason?.stack || ''
                });
            });

            // Catch resource loading failures
            window.addEventListener('error', (event) => {
                if (event.target !== window && event.target.tagName) {
                    this.logError({
                        type: 'resource',
                        message: `Failed to load ${event.target.tagName}: ${event.target.src || event.target.href}`,
                        element: event.target.tagName
                    });
                }
            }, true);

            console.log('[Monitoring] Error tracking initialized');
        },

        logError(error) {
            const entry = {
                ...error,
                timestamp: new Date().toISOString(),
                sessionId: SESSION_ID,
                url: window.location.href,
                userAgent: navigator.userAgent,
                appVersion: APP_VERSION
            };
            this.errors.push(entry);
            if (this.errors.length > this.maxErrors) this.errors.shift();
            
            // Store in localStorage for persistence
            try {
                const stored = JSON.parse(localStorage.getItem('lynk-errors') || '[]');
                stored.push(entry);
                if (stored.length > 100) stored.splice(0, stored.length - 100);
                localStorage.setItem('lynk-errors', JSON.stringify(stored));
            } catch(e) {}

            // Send to backend if available
            this.sendToBackend(entry);

            console.error(`[Error Tracker] ${error.type}: ${error.message}`);
        },

        async sendToBackend(error) {
            try {
                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/errors', JSON.stringify(error));
                }
            } catch(e) {}
        },

        getErrors() { return [...this.errors]; },
        clearErrors() { this.errors = []; localStorage.removeItem('lynk-errors'); }
    };

    // ══════════════════════════════════════════
    // 2. USER ANALYTICS & EVENT TRACKING
    // ══════════════════════════════════════════
    
    const Analytics = {
        events: [],
        sessionStart: Date.now(),

        init() {
            // Track page views
            this.track('page_view', { url: window.location.href });

            // Track section navigation
            document.addEventListener('click', (e) => {
                const navItem = e.target.closest('[data-section], .nav-item, [onclick*="navigate"], [onclick*="show"]');
                if (navItem) {
                    const section = navItem.dataset.section || navItem.textContent.trim().substring(0, 30);
                    this.track('navigation', { section });
                }
            });

            // Track button clicks
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('button, [role="button"], .btn');
                if (btn) {
                    this.track('button_click', {
                        text: (btn.textContent || btn.getAttribute('aria-label') || '').trim().substring(0, 50),
                        id: btn.id || '',
                        class: btn.className?.substring?.(0, 50) || ''
                    });
                }
            });

            // Track form submissions
            document.addEventListener('submit', (e) => {
                const form = e.target;
                this.track('form_submit', {
                    id: form.id || '',
                    action: form.action || ''
                });
            });

            // Track search queries
            document.addEventListener('input', this._debounce((e) => {
                if (e.target.type === 'search' || e.target.placeholder?.toLowerCase().includes('search')) {
                    this.track('search', { query: e.target.value.substring(0, 100) });
                }
            }, 1000));

            // Track session duration on page unload
            window.addEventListener('beforeunload', () => {
                const duration = Math.round((Date.now() - this.sessionStart) / 1000);
                this.track('session_end', { duration_seconds: duration });
                this.flush();
            });

            // Track visibility changes
            document.addEventListener('visibilitychange', () => {
                this.track('visibility_change', { hidden: document.hidden });
            });

            console.log('[Monitoring] Analytics initialized');
        },

        track(eventName, data = {}) {
            const event = {
                event: eventName,
                data,
                timestamp: new Date().toISOString(),
                sessionId: SESSION_ID,
                appVersion: APP_VERSION
            };
            this.events.push(event);

            // Flush periodically
            if (this.events.length >= 20) this.flush();
        },

        flush() {
            if (!this.events.length) return;
            const batch = [...this.events];
            this.events = [];
            
            try {
                // Store locally
                const stored = JSON.parse(localStorage.getItem('lynk-analytics') || '[]');
                stored.push(...batch);
                if (stored.length > 500) stored.splice(0, stored.length - 500);
                localStorage.setItem('lynk-analytics', JSON.stringify(stored));

                // Send to backend
                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/analytics', JSON.stringify({ events: batch }));
                }
            } catch(e) {}
        },

        getEvents() { return JSON.parse(localStorage.getItem('lynk-analytics') || '[]'); },
        clearEvents() { this.events = []; localStorage.removeItem('lynk-analytics'); },

        _debounce(fn, delay) {
            let timer;
            return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
        }
    };

    // ══════════════════════════════════════════
    // 3. PERFORMANCE METRICS COLLECTION
    // ══════════════════════════════════════════
    
    const PerfMetrics = {
        metrics: {},

        init() {
            window.addEventListener('load', () => {
                setTimeout(() => this.collectMetrics(), 1000);
            });
            console.log('[Monitoring] Performance metrics initialized');
        },

        collectMetrics() {
            // Navigation Timing
            if (performance.timing) {
                const t = performance.timing;
                this.metrics.dns = t.domainLookupEnd - t.domainLookupStart;
                this.metrics.tcp = t.connectEnd - t.connectStart;
                this.metrics.ttfb = t.responseStart - t.requestStart;
                this.metrics.domLoad = t.domContentLoadedEventEnd - t.navigationStart;
                this.metrics.pageLoad = t.loadEventEnd - t.navigationStart;
                this.metrics.domInteractive = t.domInteractive - t.navigationStart;
            }

            // Core Web Vitals
            if ('PerformanceObserver' in window) {
                // Largest Contentful Paint (LCP)
                try {
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const last = entries[entries.length - 1];
                        this.metrics.lcp = Math.round(last.startTime);
                        Analytics.track('web_vital', { name: 'LCP', value: this.metrics.lcp });
                    }).observe({ type: 'largest-contentful-paint', buffered: true });
                } catch(e) {}

                // First Input Delay (FID)
                try {
                    new PerformanceObserver((list) => {
                        const entry = list.getEntries()[0];
                        this.metrics.fid = Math.round(entry.processingStart - entry.startTime);
                        Analytics.track('web_vital', { name: 'FID', value: this.metrics.fid });
                    }).observe({ type: 'first-input', buffered: true });
                } catch(e) {}

                // Cumulative Layout Shift (CLS)
                try {
                    let clsValue = 0;
                    new PerformanceObserver((list) => {
                        list.getEntries().forEach(entry => {
                            if (!entry.hadRecentInput) clsValue += entry.value;
                        });
                        this.metrics.cls = Math.round(clsValue * 1000) / 1000;
                        Analytics.track('web_vital', { name: 'CLS', value: this.metrics.cls });
                    }).observe({ type: 'layout-shift', buffered: true });
                } catch(e) {}

                // First Contentful Paint (FCP)
                try {
                    const fcp = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
                    if (fcp) {
                        this.metrics.fcp = Math.round(fcp.startTime);
                        Analytics.track('web_vital', { name: 'FCP', value: this.metrics.fcp });
                    }
                } catch(e) {}
            }

            // Memory usage
            if (performance.memory) {
                this.metrics.memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                };
            }

            // Connection info
            if (navigator.connection) {
                this.metrics.connection = {
                    type: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt
                };
            }

            // Device info
            this.metrics.device = {
                screen: `${screen.width}x${screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                dpr: window.devicePixelRatio,
                cores: navigator.hardwareConcurrency || 'unknown',
                touch: 'ontouchstart' in window
            };

            Analytics.track('performance_metrics', this.metrics);
            console.log('[Monitoring] Metrics collected:', this.metrics);
        },

        getMetrics() { return { ...this.metrics }; }
    };

    // ══════════════════════════════════════════
    // 4. USER SESSION TRACKING
    // ══════════════════════════════════════════
    
    const SessionTracker = {
        init() {
            // Track session count
            const sessionCount = parseInt(localStorage.getItem('lynk-session-count') || '0') + 1;
            localStorage.setItem('lynk-session-count', sessionCount);

            // Track first visit
            if (!localStorage.getItem('lynk-first-visit')) {
                localStorage.setItem('lynk-first-visit', new Date().toISOString());
                Analytics.track('first_visit');
            }

            // Track returning user
            if (sessionCount > 1) {
                Analytics.track('returning_user', { sessionCount });
            }

            // Track active time
            let activeTime = 0;
            let lastActive = Date.now();
            
            const updateActive = () => {
                const now = Date.now();
                if (now - lastActive < 30000) { // 30s threshold
                    activeTime += now - lastActive;
                }
                lastActive = now;
            };

            ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
                document.addEventListener(evt, this._throttle(updateActive, 5000), { passive: true });
            });

            // Report active time on unload
            window.addEventListener('beforeunload', () => {
                Analytics.track('active_time', { seconds: Math.round(activeTime / 1000) });
            });

            console.log('[Monitoring] Session tracking initialized (Session #' + sessionCount + ')');
        },

        _throttle(fn, limit) {
            let inThrottle;
            return (...args) => {
                if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); }
            };
        }
    };

    // ══════════════════════════════════════════
    // 5. FEATURE USAGE TRACKING
    // ══════════════════════════════════════════
    
    const FeatureTracker = {
        init() {
            // Track which sections users visit most
            const sectionCounts = JSON.parse(localStorage.getItem('lynk-section-usage') || '{}');

            // Override section navigation to track usage
            const observer = new MutationObserver(() => {
                const activeScreen = document.querySelector('.screen.active, .section.active');
                if (activeScreen) {
                    const id = activeScreen.id || activeScreen.className;
                    sectionCounts[id] = (sectionCounts[id] || 0) + 1;
                    localStorage.setItem('lynk-section-usage', JSON.stringify(sectionCounts));
                }
            });
            observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

            console.log('[Monitoring] Feature usage tracking initialized');
        },

        getUsageStats() {
            return JSON.parse(localStorage.getItem('lynk-section-usage') || '{}');
        }
    };

    // ══════════════════════════════════════════
    // 6. HEALTH CHECK & DIAGNOSTICS
    // ══════════════════════════════════════════
    
    const HealthCheck = {
        async run() {
            const results = {
                timestamp: new Date().toISOString(),
                appVersion: APP_VERSION,
                online: navigator.onLine,
                serviceWorker: 'serviceWorker' in navigator,
                localStorage: this._testLocalStorage(),
                cookiesEnabled: navigator.cookieEnabled,
                webGL: this._testWebGL(),
                indexedDB: 'indexedDB' in window,
                notifications: 'Notification' in window ? Notification.permission : 'not-supported',
                memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB' : 'unknown',
                errors: ErrorTracker.errors.length,
                sessionId: SESSION_ID
            };

            console.log('[Health Check]', results);
            return results;
        },

        _testLocalStorage() {
            try { localStorage.setItem('__test', '1'); localStorage.removeItem('__test'); return true; }
            catch(e) { return false; }
        },

        _testWebGL() {
            try { return !!document.createElement('canvas').getContext('webgl'); }
            catch(e) { return false; }
        }
    };

    // ══════════════════════════════════════════
    // 7. ADMIN DASHBOARD DATA EXPORT
    // ══════════════════════════════════════════
    
    const DataExport = {
        getFullReport() {
            return {
                session: {
                    id: SESSION_ID,
                    count: parseInt(localStorage.getItem('lynk-session-count') || '0'),
                    firstVisit: localStorage.getItem('lynk-first-visit'),
                    duration: Math.round((Date.now() - Analytics.sessionStart) / 1000)
                },
                errors: ErrorTracker.getErrors(),
                analytics: Analytics.getEvents().slice(-100),
                performance: PerfMetrics.getMetrics(),
                featureUsage: FeatureTracker.getUsageStats(),
                appVersion: APP_VERSION
            };
        },

        downloadReport() {
            const report = this.getFullReport();
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lynkapp-report-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },

        clearAllData() {
            ErrorTracker.clearErrors();
            Analytics.clearEvents();
            localStorage.removeItem('lynk-section-usage');
            localStorage.removeItem('lynk-session-count');
            localStorage.removeItem('lynk-first-visit');
            console.log('[Monitoring] All data cleared');
        }
    };

    // ══════════════════════════════════════════
    // INITIALIZE ALL MONITORING
    // ══════════════════════════════════════════
    
    function initMonitoring() {
        ErrorTracker.init();
        Analytics.init();
        PerfMetrics.init();
        SessionTracker.init();
        FeatureTracker.init();

        // Expose global API
        window.LynkMonitoring = {
            getErrors: () => ErrorTracker.getErrors(),
            getAnalytics: () => Analytics.getEvents(),
            getMetrics: () => PerfMetrics.getMetrics(),
            getFeatureUsage: () => FeatureTracker.getUsageStats(),
            getFullReport: () => DataExport.getFullReport(),
            downloadReport: () => DataExport.downloadReport(),
            healthCheck: () => HealthCheck.run(),
            clearAll: () => DataExport.clearAllData(),
            track: (name, data) => Analytics.track(name, data),
            logError: (error) => ErrorTracker.logError(error)
        };

        // Auto health check
        HealthCheck.run();

        // Flush analytics every 30 seconds
        setInterval(() => Analytics.flush(), 30000);

        console.log('[Monitoring] All systems initialized ✓');
        console.log('[Monitoring] Session ID:', SESSION_ID);
        console.log('[Monitoring] Use window.LynkMonitoring to access data');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMonitoring);
    } else {
        initMonitoring();
    }

})();
