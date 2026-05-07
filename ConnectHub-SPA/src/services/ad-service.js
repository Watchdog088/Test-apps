// src/services/ad-service.js
// UX-16 FIX: Interstitials limited to max once per session after 5+ navigations
// Prevents aggressive ad interruptions that cause high churn

// ── House Ads (fallback when AdSense not loaded) ──────────────────────────────
export const HOUSE_ADS = [
  {
    id: 'ha-1',
    type: 'banner',
    bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    headline: '⭐ Go Premium',
    sub: 'Remove ads, unlock exclusive features & boost your profile',
    cta: 'Upgrade',
    ctaPath: '/premium',
  },
  {
    id: 'ha-2',
    type: 'banner',
    bg: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    headline: '🎯 Lynk Dating',
    sub: 'Find your perfect match — thousands of people nearby',
    cta: 'Meet People',
    ctaPath: '/dating',
  },
  {
    id: 'ha-3',
    type: 'banner',
    bg: 'linear-gradient(135deg,#10b981,#06b6d4)',
    headline: '🛍️ Marketplace',
    sub: 'Buy & sell items in your community. List for free!',
    cta: 'Browse Now',
    ctaPath: '/marketplace',
  },
  {
    id: 'ha-4',
    type: 'banner',
    bg: 'linear-gradient(135deg,#ec4899,#a855f7)',
    headline: '🎬 Go Live',
    sub: 'Start streaming to your followers right now',
    cta: 'Go Live',
    ctaPath: '/live',
  },
  {
    id: 'ha-5',
    type: 'banner',
    bg: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
    headline: '👥 Find Friends',
    sub: 'Connect with people who share your interests',
    cta: 'Explore',
    ctaPath: '/friends',
  },
];

const AD_SERVICE_CONFIG = {
  enableAds: true,
  bannerRefreshInterval: 30000,
  interstitialCooldownMs: 3600000, // 1 hour between interstitials
  minNavsBeforeInterstitial: 5,    // UX-16: at least 5 page navigations first
};

class AdService {
  constructor() {
    this.lastInterstitialTime = 0;
    this.sessionNavCount = 0;          // UX-16: track navigations this session
    this.interstitialShownThisSession = false; // UX-16: max 1 per session
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[AdService] Initialized');
  }

  /** Call this on every page navigation so we can track navigation count */
  onNavigation() {
    this.sessionNavCount++;
  }

  /**
   * UX-16 FIX: Interstitial only shows if:
   *  1. Ads are enabled
   *  2. User has navigated 5+ times this session
   *  3. Has NOT already shown one interstitial this session
   *  4. At least 1 hour has passed since the last one (across sessions via localStorage)
   */
  canShowInterstitial() {
    if (!AD_SERVICE_CONFIG.enableAds) return false;

    // UX-16: Must have done minimum navigations first
    if (this.sessionNavCount < AD_SERVICE_CONFIG.minNavsBeforeInterstitial) return false;

    // UX-16: Only once per session
    if (this.interstitialShownThisSession) return false;

    // Cooldown check (persisted across page reloads)
    const stored = parseInt(localStorage.getItem('lastInterstitialTime') || '0', 10);
    const now = Date.now();
    if (now - stored < AD_SERVICE_CONFIG.interstitialCooldownMs) return false;

    return true;
  }

  recordInterstitialShown() {
    this.lastInterstitialTime = Date.now();
    this.interstitialShownThisSession = true;
    localStorage.setItem('lastInterstitialTime', String(this.lastInterstitialTime));
  }

  canShowBanner() {
    return AD_SERVICE_CONFIG.enableAds;
  }

  canShowRewardedVideo() {
    return AD_SERVICE_CONFIG.enableAds;
  }

  getAdUnitId(type) {
    const ids = {
      banner:       import.meta.env.VITE_AD_BANNER_ID       || 'banner-demo',
      interstitial: import.meta.env.VITE_AD_INTERSTITIAL_ID || 'interstitial-demo',
      rewarded:     import.meta.env.VITE_AD_REWARDED_ID     || 'rewarded-demo',
    };
    return ids[type] || 'ad-demo';
  }

  /** Returns whether ads should be shown (hidden for premium users) */
  shouldShowAds(userProfile) {
    if (!AD_SERVICE_CONFIG.enableAds) return false;
    if (userProfile?.isPremium) return false;
    return true;
  }

  /** Cycle through house ads round-robin */
  nextHouseAd(/* type */) {
    if (!this._houseAdIndex) this._houseAdIndex = 0;
    const ad = HOUSE_ADS[this._houseAdIndex % HOUSE_ADS.length];
    this._houseAdIndex++;
    return ad;
  }

  recordBannerImpression() {
    // Analytics hook — no-op in dev
  }

  recordRewardedImpression() {
    // Analytics hook — no-op in dev
  }

  grantReward() {
    // In production this would credit the user's wallet
    console.log('[AdService] Reward granted');
  }
}

export const adService = new AdService();
export default adService;
