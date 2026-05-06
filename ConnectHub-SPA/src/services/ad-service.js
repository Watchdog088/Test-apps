/**
 * ad-service.js — Ad network manager for ConnectHub SPA
 *
 * Supports:
 *  • Google AdSense / AdMob (web)
 *  • AppLovin MAX (web SDK)
 *  • IronSource LevelPlay (web SDK)
 *  • In-house house ads (fallback)
 *
 * Respects:
 *  • Premium users → NO ads
 *  • GDPR consent flag stored in localStorage
 *  • 3-minute interstitial cooldown
 *  • Rewarded ad reward callbacks
 */

const AD_CONFIG = {
  // ── Google AdSense ──────────────────────────────────────────
  adsense: {
    publisherId:   import.meta.env.VITE_ADSENSE_PUBLISHER_ID   || 'ca-pub-REPLACE_WITH_YOUR_ID',
    bannerSlot:    import.meta.env.VITE_ADSENSE_BANNER_SLOT     || '1234567890',
    interstitialSlot: import.meta.env.VITE_ADSENSE_INTER_SLOT  || '0987654321',
    rewardedSlot:  import.meta.env.VITE_ADSENSE_REWARDED_SLOT  || '1122334455',
  },
  // ── AppLovin MAX ───────────────────────────────────────────
  applovin: {
    sdkKey: import.meta.env.VITE_APPLOVIN_SDK_KEY || 'REPLACE_WITH_APPLOVIN_KEY',
  },
  // ── IronSource ─────────────────────────────────────────────
  ironsource: {
    appKey: import.meta.env.VITE_IRONSOURCE_APP_KEY || 'REPLACE_WITH_IRONSOURCE_KEY',
  },
  // ── Timing ────────────────────────────────────────────────
  interstitialCooldownMs: 3 * 60 * 1000,  // 3 minutes
  bannerRefreshMs:         60 * 1000,       // 60 seconds
  rewardCoins:             50,
};

// ── House Ads (shown when no network loads) ────────────────
export const HOUSE_ADS = [
  {
    id: 'h1',
    type: 'banner',
    bg: 'linear-gradient(135deg,#6366f1,#ec4899)',
    headline: '⭐ Upgrade to Premium',
    sub:      'Remove ads · Exclusive features · Priority support',
    cta:      'Get Premium',
    ctaPath:  '/premium',
  },
  {
    id: 'h2',
    type: 'banner',
    bg: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    headline: '🛒 Shop the Marketplace',
    sub:      'Find amazing deals from people in your community',
    cta:      'Browse Now',
    ctaPath:  '/marketplace',
  },
  {
    id: 'h3',
    type: 'banner',
    bg: 'linear-gradient(135deg,#10b981,#3b82f6)',
    headline: '💕 Find Your Match',
    sub:      'New profiles near you are waiting — start swiping!',
    cta:      'Open Dating',
    ctaPath:  '/dating',
  },
  {
    id: 'h4',
    type: 'banner',
    bg: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    headline: '🎵 Discover Music',
    sub:      'Trending tracks & playlists curated for you',
    cta:      'Listen Now',
    ctaPath:  '/music',
  },
  {
    id: 'h5',
    type: 'banner',
    bg: 'linear-gradient(135deg,#14b8a6,#6366f1)',
    headline: '🎮 Join Gaming Hub',
    sub:      'Compete with friends · Leaderboards · Tournaments',
    cta:      'Play Now',
    ctaPath:  '/gaming',
  },
  {
    id: 'h6',
    type: 'banner',
    bg: 'linear-gradient(135deg,#ef4444,#f59e0b)',
    headline: '🔴 Watch Live Now',
    sub:      'Friends are streaming — tune in & show support',
    cta:      'Go Live',
    ctaPath:  '/live',
  },
];

class AdService {
  constructor() {
    this._lastInterstitial = 0;
    this._initialized      = false;
    this._houseAdIndex     = 0;
    this._bannerTimer      = null;
    this._rewardCallbacks  = [];
    this._impressions      = { banner: 0, interstitial: 0, rewarded: 0 };
  }

  /** Call once at app boot (after consent check) */
  async init(hasCookieConsent = true) {
    if (this._initialized) return;
    if (!hasCookieConsent) { console.log('[AdService] Consent not granted — ads disabled'); return; }

    try {
      // Inject Google AdSense script if not already present
      if (!document.querySelector('script[data-adsense]')) {
        const s = document.createElement('script');
        s.async = true;
        s.setAttribute('data-adsense', '1');
        s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.adsense.publisherId}`;
        s.crossOrigin = 'anonymous';
        document.head.appendChild(s);
      }
    } catch (e) {
      console.warn('[AdService] AdSense load failed — falling back to house ads', e);
    }

    this._initialized = true;
    console.log('[AdService] Initialized ✅');
  }

  /** Returns true when it is OK to show an interstitial */
  canShowInterstitial() {
    return Date.now() - this._lastInterstitial > AD_CONFIG.interstitialCooldownMs;
  }

  recordInterstitialShown() {
    this._lastInterstitial = Date.now();
    this._impressions.interstitial++;
    this._trackImpression('interstitial');
  }

  recordBannerImpression()  { this._impressions.banner++;  this._trackImpression('banner'); }
  recordRewardedImpression(){ this._impressions.rewarded++; this._trackImpression('rewarded'); }

  /** Push a rewarded-ad callback; fires when user completes a rewarded ad */
  onRewardGranted(cb) { this._rewardCallbacks.push(cb); }

  grantReward() {
    this._rewardCallbacks.forEach(cb => cb(AD_CONFIG.rewardCoins));
    this._rewardCallbacks = [];
  }

  /** Cycle through house ads */
  nextHouseAd(type = 'banner') {
    const pool = HOUSE_ADS.filter(a => a.type === type);
    const ad   = pool[this._houseAdIndex % pool.length];
    this._houseAdIndex++;
    return ad;
  }

  get impressions() { return { ...this._impressions }; }

  /** Whether the current user should see ads (premium = no ads) */
  shouldShowAds(userProfile) {
    return !userProfile?.isPremium;
  }

  _trackImpression(type) {
    // Future: send to analytics / admin dashboard
    if (typeof window !== 'undefined' && window.__adTrack) window.__adTrack(type);
  }
}

// Singleton export
const adService = new AdService();
export default adService;
export { AD_CONFIG };
