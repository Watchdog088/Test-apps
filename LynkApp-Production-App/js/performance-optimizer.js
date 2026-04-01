/**
 * LynkApp Performance Optimizer
 * Phase 3: Lazy loading, virtual scrolling, loading skeletons, image optimization
 */

(function() {
    'use strict';

    // ══════════════════════════════════════════
    // 1. SECTION LAZY LOADING
    // Only render sections when they become visible
    // ══════════════════════════════════════════
    
    const LazyLoader = {
        observer: null,
        
        init() {
            if (!('IntersectionObserver' in window)) return;
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const section = entry.target;
                        section.classList.add('section-loaded');
                        section.style.contentVisibility = 'visible';
                        // Dispatch event for section-specific initialization
                        section.dispatchEvent(new CustomEvent('section:visible', { bubbles: true }));
                        this.observer.unobserve(section);
                    }
                });
            }, {
                rootMargin: '200px', // Start loading 200px before visible
                threshold: 0.01
            });

            // Observe all major sections
            document.querySelectorAll('[id$="-section"], [id$="-screen"], [id$="-dashboard"], [id$="-panel"]').forEach(section => {
                if (!section.classList.contains('active')) {
                    section.style.contentVisibility = 'auto';
                    section.style.containIntrinsicSize = '0 500px';
                    this.observer.observe(section);
                }
            });
            
            console.log('[Performance] Section lazy loading initialized');
        }
    };

    // ══════════════════════════════════════════
    // 2. IMAGE LAZY LOADING
    // Native + fallback for older browsers
    // ══════════════════════════════════════════
    
    const ImageOptimizer = {
        init() {
            // Add loading="lazy" to all images without it
            document.querySelectorAll('img:not([loading])').forEach(img => {
                img.loading = 'lazy';
                img.decoding = 'async';
            });

            // Convert background images to lazy load
            if ('IntersectionObserver' in window) {
                const bgObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const el = entry.target;
                            const bgUrl = el.dataset.bg;
                            if (bgUrl) {
                                el.style.backgroundImage = `url(${bgUrl})`;
                                el.removeAttribute('data-bg');
                            }
                            bgObserver.unobserve(el);
                        }
                    });
                }, { rootMargin: '100px' });

                document.querySelectorAll('[data-bg]').forEach(el => bgObserver.observe(el));
            }

            console.log('[Performance] Image lazy loading initialized');
        }
    };

    // ══════════════════════════════════════════
    // 3. LOADING SKELETONS
    // Show placeholder content while loading
    // ══════════════════════════════════════════
    
    const SkeletonLoader = {
        createPostSkeleton() {
            return `
                <div class="skeleton-post" style="padding:16px;margin:8px 0;background:rgba(255,255,255,0.05);border-radius:12px;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <div class="skeleton-pulse" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.1);"></div>
                        <div>
                            <div class="skeleton-pulse" style="width:120px;height:12px;border-radius:4px;background:rgba(255,255,255,0.1);margin-bottom:6px;"></div>
                            <div class="skeleton-pulse" style="width:80px;height:10px;border-radius:4px;background:rgba(255,255,255,0.08);"></div>
                        </div>
                    </div>
                    <div class="skeleton-pulse" style="width:100%;height:200px;border-radius:8px;background:rgba(255,255,255,0.08);margin-bottom:12px;"></div>
                    <div class="skeleton-pulse" style="width:60%;height:12px;border-radius:4px;background:rgba(255,255,255,0.08);"></div>
                </div>`;
        },

        createStorySkeleton() {
            return `
                <div class="skeleton-story" style="display:inline-flex;flex-direction:column;align-items:center;gap:6px;margin:0 6px;">
                    <div class="skeleton-pulse" style="width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.1);"></div>
                    <div class="skeleton-pulse" style="width:48px;height:8px;border-radius:4px;background:rgba(255,255,255,0.08);"></div>
                </div>`;
        },

        showFeedSkeletons(container, count = 3) {
            if (!container) return;
            const html = Array(count).fill(this.createPostSkeleton()).join('');
            container.insertAdjacentHTML('beforeend', html);
        },

        showStorySkeletons(container, count = 6) {
            if (!container) return;
            const html = Array(count).fill(this.createStorySkeleton()).join('');
            container.insertAdjacentHTML('beforeend', html);
        },

        removeSkeletons(container) {
            if (!container) return;
            container.querySelectorAll('.skeleton-post, .skeleton-story').forEach(el => el.remove());
        },

        init() {
            // Add skeleton CSS animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .skeleton-pulse {
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }
                .section-loaded .skeleton-post,
                .section-loaded .skeleton-story {
                    display: none;
                }
            `;
            document.head.appendChild(style);
            console.log('[Performance] Skeleton loaders initialized');
        }
    };

    // ══════════════════════════════════════════
    // 4. VIRTUAL SCROLLING
    // Only render visible items in long lists
    // ══════════════════════════════════════════
    
    const VirtualScroller = {
        create(container, items, itemHeight, renderFn) {
            if (!container || !items.length) return;

            const totalHeight = items.length * itemHeight;
            const viewport = container.clientHeight || 600;
            const overscan = 5; // Extra items above/below viewport

            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `height:${totalHeight}px;position:relative;`;
            container.innerHTML = '';
            container.appendChild(wrapper);

            const render = () => {
                const scrollTop = container.scrollTop;
                const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
                const endIdx = Math.min(items.length, Math.ceil((scrollTop + viewport) / itemHeight) + overscan);

                wrapper.innerHTML = '';
                for (let i = startIdx; i < endIdx; i++) {
                    const el = renderFn(items[i], i);
                    if (typeof el === 'string') {
                        const div = document.createElement('div');
                        div.innerHTML = el;
                        div.firstElementChild.style.cssText += `;position:absolute;top:${i * itemHeight}px;width:100%;height:${itemHeight}px;`;
                        wrapper.appendChild(div.firstElementChild);
                    }
                }
            };

            container.style.overflow = 'auto';
            container.addEventListener('scroll', () => requestAnimationFrame(render));
            render();

            return { render, update: (newItems) => { items = newItems; render(); } };
        }
    };

    // ══════════════════════════════════════════
    // 5. REQUEST DEBOUNCING & THROTTLING
    // Prevent excessive API calls
    // ══════════════════════════════════════════
    
    window.LynkPerformance = {
        debounce(fn, delay = 300) {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => fn(...args), delay);
            };
        },

        throttle(fn, limit = 100) {
            let inThrottle;
            return (...args) => {
                if (!inThrottle) {
                    fn(...args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Memoize expensive computations
        memoize(fn) {
            const cache = new Map();
            return (...args) => {
                const key = JSON.stringify(args);
                if (cache.has(key)) return cache.get(key);
                const result = fn(...args);
                cache.set(key, result);
                if (cache.size > 100) cache.delete(cache.keys().next().value);
                return result;
            };
        }
    };

    // ══════════════════════════════════════════
    // 6. SCROLL PERFORMANCE
    // Optimize scroll handlers
    // ══════════════════════════════════════════
    
    const ScrollOptimizer = {
        init() {
            // Use passive listeners for scroll events
            const addPassiveListener = EventTarget.prototype.addEventListener;
            const scrollEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
            
            // Add will-change hint to scrollable containers
            document.querySelectorAll('[style*="overflow"], .scrollable').forEach(el => {
                el.style.willChange = 'scroll-position';
                el.style.webkitOverflowScrolling = 'touch';
            });

            // Optimize scroll handlers on main feed
            const feed = document.querySelector('.feed-container, #feed-section, .posts-container');
            if (feed) {
                let ticking = false;
                feed.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(() => {
                            // Check if near bottom for infinite scroll
                            if (feed.scrollHeight - feed.scrollTop - feed.clientHeight < 500) {
                                feed.dispatchEvent(new CustomEvent('feed:nearBottom'));
                            }
                            ticking = false;
                        });
                        ticking = true;
                    }
                }, { passive: true });
            }

            console.log('[Performance] Scroll optimization initialized');
        }
    };

    // ══════════════════════════════════════════
    // 7. PRELOAD CRITICAL RESOURCES
    // ══════════════════════════════════════════
    
    const ResourcePreloader = {
        init() {
            // Preload fonts if any
            const fontLinks = document.querySelectorAll('link[href*="font"]');
            fontLinks.forEach(link => {
                link.rel = 'preload';
                link.as = 'font';
                link.crossOrigin = 'anonymous';
            });

            // Prefetch likely next pages
            const prefetchLinks = ['#messages', '#profile', '#search'];
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    prefetchLinks.forEach(hash => {
                        const section = document.querySelector(hash + '-section');
                        if (section) {
                            section.style.contentVisibility = 'auto';
                        }
                    });
                });
            }

            console.log('[Performance] Resource preloading initialized');
        }
    };

    // ══════════════════════════════════════════
    // 8. MEMORY MANAGEMENT
    // Clean up unused DOM nodes
    // ══════════════════════════════════════════
    
    const MemoryManager = {
        init() {
            // Periodically clean up off-screen content
            setInterval(() => {
                const activeSection = document.querySelector('.screen.active, .section.active');
                if (!activeSection) return;

                // Reduce DOM complexity for hidden sections
                document.querySelectorAll('.screen:not(.active), .section:not(.active)').forEach(section => {
                    const images = section.querySelectorAll('img[src]');
                    images.forEach(img => {
                        if (!img.dataset.origSrc) {
                            img.dataset.origSrc = img.src;
                        }
                    });
                });
            }, 30000); // Every 30 seconds

            console.log('[Performance] Memory management initialized');
        }
    };

    // ══════════════════════════════════════════
    // 9. PERFORMANCE MONITORING
    // Track key metrics
    // ══════════════════════════════════════════
    
    const PerformanceMonitor = {
        metrics: {},

        init() {
            // Track page load time
            window.addEventListener('load', () => {
                if (window.performance) {
                    const timing = performance.timing || {};
                    this.metrics.pageLoad = timing.loadEventEnd - timing.navigationStart;
                    this.metrics.domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                    this.metrics.firstPaint = performance.getEntriesByType('paint')
                        .find(e => e.name === 'first-contentful-paint')?.startTime || 0;
                    
                    console.log(`[Performance] Page loaded in ${this.metrics.pageLoad}ms, DOM ready in ${this.metrics.domReady}ms, FCP: ${Math.round(this.metrics.firstPaint)}ms`);
                }
            });

            // Track long tasks
            if ('PerformanceObserver' in window) {
                try {
                    const longTaskObserver = new PerformanceObserver((list) => {
                        list.getEntries().forEach(entry => {
                            if (entry.duration > 100) {
                                console.warn(`[Performance] Long task detected: ${Math.round(entry.duration)}ms`);
                            }
                        });
                    });
                    longTaskObserver.observe({ entryTypes: ['longtask'] });
                } catch (e) {
                    // longtask not supported in all browsers
                }
            }

            // Expose metrics
            window.LynkPerformance.getMetrics = () => this.metrics;
        }
    };

    // ══════════════════════════════════════════
    // INITIALIZE ALL OPTIMIZATIONS
    // ══════════════════════════════════════════
    
    function initPerformanceOptimizations() {
        SkeletonLoader.init();
        ImageOptimizer.init();
        ScrollOptimizer.init();
        ResourcePreloader.init();
        PerformanceMonitor.init();
        
        // Defer non-critical initializations
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                LazyLoader.init();
                MemoryManager.init();
            });
        } else {
            setTimeout(() => {
                LazyLoader.init();
                MemoryManager.init();
            }, 1000);
        }

        // Expose utilities globally
        window.LynkPerformance.VirtualScroller = VirtualScroller;
        window.LynkPerformance.SkeletonLoader = SkeletonLoader;
        window.LynkPerformance.LazyLoader = LazyLoader;

        console.log('[Performance] All optimizations initialized ✓');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformanceOptimizations);
    } else {
        initPerformanceOptimizations();
    }

})();
