/**
 * AdUnit.jsx — Reusable ad slot component
 *
 * Props:
 *  type         'banner' | 'rectangle' | 'interstitial' | 'rewarded'
 *  placement    label string e.g. 'feed-between-posts'
 *  onClose      () => void   (interstitial only)
 *  onReward     (coins) => void  (rewarded only)
 *  userProfile  {isPremium: bool}  — hides ad for premium users
 *
 * Rendering priority:
 *  1. If premium user → renders nothing
 *  2. If window.adsbygoogle ready → real AdSense unit
 *  3. Fallback → house ad (always fills)
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adService, { HOUSE_ADS } from '@services/ad-service';

// ─────────────────────────────────────────────────────────────
// Banner / Rectangle Ad (inline in feed or sidebar)
// ─────────────────────────────────────────────────────────────
function BannerAd({ placement, userProfile, style: extraStyle }) {
  const navigate      = useNavigate();
  const adRef         = useRef(null);
  const [houseAd]     = useState(() => adService.nextHouseAd('banner'));
  const [adsenseLoaded, setAdsenseLoaded] = useState(false);

  const adsensePublisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || '';
  const adsenseValid = adsensePublisherId && !adsensePublisherId.includes('MISSING') && adsensePublisherId.startsWith('ca-pub-');

  useEffect(() => {
    // Try to push AdSense unit — only if we have a real publisher ID
    if (!adsenseValid) return;
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdsenseLoaded(true);
      }
    } catch (_) {}
    adService.recordBannerImpression();
  }, [adsenseValid]);

  if (adService.shouldShowAds(userProfile) === false) return null;

  return (
    <div style={{
      margin: '8px 12px', borderRadius: 14, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
      ...extraStyle,
    }} data-ad-placement={placement}>

      {/* Real AdSense slot (shown when SDK loaded) */}
      {adsenseLoaded && (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: 80 }}
          data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-REPLACE'}
          data-ad-slot={import.meta.env.VITE_ADSENSE_BANNER_SLOT   || '0000000000'}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}

      {/* House Ad fallback (always visible in dev / when AdSense not loaded) */}
      {!adsenseLoaded && houseAd && (
        <div
          onClick={() => navigate(houseAd.ctaPath)}
          style={{
            background: houseAd.bg,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            cursor: 'pointer',
            minHeight: 72,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'white', marginBottom: 2 }}>
              {houseAd.headline}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
              {houseAd.sub}
            </div>
          </div>
          <button style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 20,
            background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.6)',
            color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}>
            {houseAd.cta}
          </button>
        </div>
      )}

      {/* "Advertisement" label */}
      <div style={{
        textAlign: 'center', padding: '2px 0', fontSize: 9,
        color: 'rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.4)',
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        Advertisement
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Interstitial (full-screen overlay)
// ─────────────────────────────────────────────────────────────
function InterstitialAd({ onClose, userProfile }) {
  const navigate        = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [houseAd]       = useState(() => adService.nextHouseAd('banner'));

  useEffect(() => {
    adService.recordInterstitialShown();
    const t = setInterval(() => setCountdown(c => {
      if (c <= 1) { clearInterval(t); return 0; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  if (!adService.shouldShowAds(userProfile)) { onClose?.(); return null; }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Close button (enabled after countdown) */}
      <button
        onClick={countdown === 0 ? onClose : undefined}
        style={{
          position: 'absolute', top: 20, right: 20,
          width: 36, height: 36, borderRadius: '50%',
          background: countdown === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.2)', color: 'white',
          fontSize: 16, cursor: countdown === 0 ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {countdown > 0 ? countdown : '✕'}
      </button>

      {/* Ad label */}
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Advertisement
      </div>

      {/* Ad card */}
      <div style={{
        width: 'min(360px, 90vw)', borderRadius: 24, overflow: 'hidden',
        background: houseAd.bg, boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{ padding: '40px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>
            {houseAd.headline.split(' ')[0]}
          </div>
          <div style={{ fontWeight: 800, fontSize: 22, color: 'white', marginBottom: 10 }}>
            {houseAd.headline.replace(/^\S+\s/, '')}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
            {houseAd.sub}
          </div>
          <button
            onClick={() => { navigate(houseAd.ctaPath); onClose?.(); }}
            style={{
              padding: '14px 36px', borderRadius: 24,
              background: 'rgba(255,255,255,0.25)', color: 'white',
              fontWeight: 800, fontSize: 16, cursor: 'pointer',
              backdropFilter: 'blur(4px)', border: '2px solid rgba(255,255,255,0.5)',
            }}
          >
            {houseAd.cta}
          </button>
        </div>
      </div>

      {/* Upgrade hint */}
      <button
        onClick={() => { navigate('/premium'); onClose?.(); }}
        style={{ marginTop: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}
      >
        ⭐ Upgrade to Premium to remove ads
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Rewarded Ad (user opts in for coins)
// ─────────────────────────────────────────────────────────────
function RewardedAd({ onReward, onClose, userProfile }) {
  const [phase, setPhase] = useState('prompt'); // 'prompt' | 'watching' | 'done'
  const [progress, setProgress] = useState(0);
  const DURATION = 10; // seconds

  const startWatching = () => {
    setPhase('watching');
    let elapsed = 0;
    const t = setInterval(() => {
      elapsed++;
      setProgress((elapsed / DURATION) * 100);
      if (elapsed >= DURATION) {
        clearInterval(t);
        setPhase('done');
        adService.recordRewardedImpression();
        adService.grantReward();
        onReward?.(50);
      }
    }, 1000);
  };

  if (!adService.shouldShowAds(userProfile)) { onClose?.(); return null; }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {phase === 'prompt' && (
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎬</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#f1f5f9', marginBottom: 10 }}>Watch & Earn</div>
          <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>
            Watch a short 10-second ad to earn <strong style={{ color: '#f59e0b' }}>50 ConnectHub Coins</strong>!
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: 14, background: '#1e293b', border: 'none', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Not Now
            </button>
            <button onClick={startWatching} style={{ padding: '12px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Watch Ad 🎯
            </button>
          </div>
        </div>
      )}

      {phase === 'watching' && (
        <div style={{ textAlign: 'center', maxWidth: 320, width: '100%' }}>
          <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 18, marginBottom: 24 }}>Ad Playing…</div>
          <div style={{ width: '100%', height: 200, borderRadius: 18, background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, marginBottom: 20 }}>
            🎬
          </div>
          <div style={{ background: '#1e293b', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#6366f1,#ec4899)', borderRadius: 8, transition: 'width 0.9s linear' }} />
          </div>
          <div style={{ color: '#64748b', fontSize: 12 }}>Keep watching to earn your reward…</div>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#f1f5f9', marginBottom: 10 }}>Reward Earned!</div>
          <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: 28, marginBottom: 16 }}>+50 Coins 🪙</div>
          <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>Coins added to your wallet!</div>
          <button onClick={onClose} style={{ padding: '14px 36px', borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            🏠 Continue
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main export — dispatches to correct ad type
// ─────────────────────────────────────────────────────────────
export default function AdUnit({ type = 'banner', ...props }) {
  if (type === 'interstitial') return <InterstitialAd {...props} />;
  if (type === 'rewarded')     return <RewardedAd {...props} />;
  return <BannerAd type={type} {...props} />;
}

export { BannerAd, InterstitialAd, RewardedAd };
