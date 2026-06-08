// src/components/common/VerifiedBadge.jsx
// ─────────────────────────────────────────────────────────────────────────────
// LYNKAPP — Branded Verified Badge System (v2)
// ─────────────────────────────────────────────────────────────────────────────
//
//  VARIANT GUIDE (use the right badge for the right context):
//
//  variant="user"        → 🥇 GOLD   — Regular verified user / celebrity / public figure
//  variant="celebrity"   → 🥇 GOLD   — Alias for "user" (same gold badge)
//  variant="marketplace" → 💜 PURPLE  — Verified marketplace seller (KYC complete)
//  variant="seller"      → 💜 PURPLE  — Alias for "marketplace"
//  variant="dating"      → 💗 PINK    — Verified dating profile
//  variant="creator"     → 🟣 INDIGO  — Content creator / streamer
//  variant="default"     → 🔵 BLUE    — Generic verified (fallback)
//
//  SIZE GUIDE:
//  size="xs"  → 12px  (tight badges inside pill chips, card overlays)
//  size="sm"  → 14px  (inline next to usernames in lists)
//  size="md"  → 16px  (standard — default)
//  size="lg"  → 20px  (profile headers, large avatars)
//  size="xl"  → 26px  (hero sections, profile page banners)
//
//  USAGE:
//    import VerifiedBadge from '@/components/common/VerifiedBadge';
//
//    <VerifiedBadge variant="user" size="md" />              // gold — regular user
//    <VerifiedBadge variant="celebrity" size="lg" />         // gold — celebrity
//    <VerifiedBadge variant="marketplace" size="sm" />       // purple — seller
//    <VerifiedBadge variant="dating" size="xs" />            // pink — dating
//    <VerifiedBadge variant="creator" size="md" />           // indigo — creator
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

// ── Colour palette for each variant ──────────────────────────────────────────
const VARIANTS = {
  // 🥇 Gold — verified users, celebrities, public figures
  user: {
    grad1: '#f59e0b',
    grad2: '#d97706',
    glow:  'rgba(245,158,11,0.5)',
    label: 'Verified user',
  },
  celebrity: {
    grad1: '#f59e0b',
    grad2: '#d97706',
    glow:  'rgba(245,158,11,0.5)',
    label: 'Verified celebrity',
  },

  // 💜 Purple — verified marketplace sellers
  marketplace: {
    grad1: '#a855f7',
    grad2: '#7c3aed',
    glow:  'rgba(168,85,247,0.5)',
    label: 'Verified seller',
  },
  seller: {
    grad1: '#a855f7',
    grad2: '#7c3aed',
    glow:  'rgba(168,85,247,0.5)',
    label: 'Verified seller',
  },

  // 💗 Pink — dating verified profile
  dating: {
    grad1: '#ec4899',
    grad2: '#be185d',
    glow:  'rgba(236,72,153,0.45)',
    label: 'Verified dating profile',
  },

  // 🟣 Indigo — creators & streamers
  creator: {
    grad1: '#6366f1',
    grad2: '#4338ca',
    glow:  'rgba(99,102,241,0.45)',
    label: 'Verified creator',
  },

  // 🔵 Blue — generic fallback
  default: {
    grad1: '#3b82f6',
    grad2: '#1d4ed8',
    glow:  'rgba(59,130,246,0.4)',
    label: 'Verified account',
  },
};

// ── px sizes ─────────────────────────────────────────────────────────────────
const SIZES = {
  xs:  12,
  sm:  14,
  md:  16,
  lg:  20,
  xl:  26,
};

// ─────────────────────────────────────────────────────────────────────────────
export default function VerifiedBadge({
  variant = 'default',
  size    = 'md',
  style   = {},
  className,
}) {
  const cfg = VARIANTS[variant] || VARIANTS.default;
  const px  = SIZES[size]       || 16;
  const id  = `vb-${variant}-${size}`;  // unique gradient id per instance type

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={px}
      height={px}
      aria-label={cfg.label}
      role="img"
      className={className}
      style={{
        display:      'inline-block',
        verticalAlign: 'middle',
        flexShrink:    0,
        filter:        `drop-shadow(0 0 3px ${cfg.glow})`,
        ...style,
      }}
    >
      <title>{cfg.label}</title>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={cfg.grad1} />
          <stop offset="100%" stopColor={cfg.grad2} />
        </linearGradient>
      </defs>

      {/* Shield / badge shape */}
      <path
        d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z"
        fill={`url(#${id})`}
      />

      {/* White checkmark */}
      <polyline
        points="8.5,12.5 11,15 15.5,9.5"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVENIENCE EXPORTS — drop-in aliases for the most common patterns
// ─────────────────────────────────────────────────────────────────────────────

/** Gold verified badge — regular users, celebrities */
export function GoldBadge(props) {
  return <VerifiedBadge variant="user" {...props} />;
}

/** Purple verified badge — marketplace sellers */
export function SellerBadge(props) {
  return <VerifiedBadge variant="marketplace" {...props} />;
}

/** Pink verified badge — dating profiles */
export function DatingBadge(props) {
  return <VerifiedBadge variant="dating" {...props} />;
}

/** Indigo verified badge — creators */
export function CreatorBadge(props) {
  return <VerifiedBadge variant="creator" {...props} />;
}
