/**
 * VerifiedBadge.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A reusable, branded verification badge for LynkApp.
 *
 * Variants:
 *   "user"     — purple/indigo circle  ✓  (standard verified user)
 *   "official" — gold/amber  circle    ✓  (brand / celebrity / official account)
 *   "seller"   — green circle          ✓  (KYC-approved marketplace seller)
 *   "dating"   — blue circle           ✓  (ID-verified on Dating)
 *
 * Sizes:
 *   "xs"  12 px   — inline next to small text (feed cards, search results)
 *   "sm"  16 px   — default inline use (name rows, message list)
 *   "md"  20 px   — profile header names
 *   "lg"  28 px   — large profile headers / dating card overlays
 *
 * Usage:
 *   import VerifiedBadge from '../components/common/VerifiedBadge';
 *
 *   <VerifiedBadge />                        // sm + user
 *   <VerifiedBadge size="md" />              // md + user
 *   <VerifiedBadge variant="official" />     // gold badge
 *   <VerifiedBadge variant="seller" size="xs" />
 *   <VerifiedBadge tooltip={false} />        // no hover tooltip
 */

import React, { useState } from 'react';

// ── colour maps ───────────────────────────────────────────────────────────────
const BG = {
  user:     'linear-gradient(135deg, #6366f1, #8b5cf6)',   // purple
  official: 'linear-gradient(135deg, #f59e0b, #d97706)',   // gold
  seller:   'linear-gradient(135deg, #10b981, #059669)',   // green
  dating:   'linear-gradient(135deg, #3b82f6, #2563eb)',   // blue
};
const SHADOW = {
  user:     'rgba(99,102,241,0.5)',
  official: 'rgba(245,158,11,0.5)',
  seller:   'rgba(16,185,129,0.5)',
  dating:   'rgba(59,130,246,0.5)',
};
const LABEL = {
  user:     'Verified',
  official: 'Official Account',
  seller:   'Verified Seller',
  dating:   'ID Verified',
};

// ── size map (px) ─────────────────────────────────────────────────────────────
const SIZE = { xs: 12, sm: 16, md: 20, lg: 28 };

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ text, size }) {
  return (
    <div style={{
      position:       'absolute',
      bottom:         size + 6,
      left:           '50%',
      transform:      'translateX(-50%)',
      background:     '#0f172a',
      color:          '#f1f5f9',
      fontSize:       11,
      fontWeight:     600,
      whiteSpace:     'nowrap',
      borderRadius:   8,
      padding:        '4px 10px',
      border:         '1px solid rgba(255,255,255,0.12)',
      pointerEvents:  'none',
      zIndex:         9999,
      boxShadow:      '0 4px 16px rgba(0,0,0,0.5)',
    }}>
      {text}
      {/* arrow */}
      <div style={{
        position:    'absolute',
        top:         '100%',
        left:        '50%',
        transform:   'translateX(-50%)',
        width:       0,
        height:      0,
        borderLeft:  '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop:   '5px solid #0f172a',
      }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VerifiedBadge({
  variant  = 'user',   // 'user' | 'official' | 'seller' | 'dating'
  size     = 'sm',     // 'xs' | 'sm' | 'md' | 'lg'
  tooltip  = true,     // show label on hover
  style    = {},       // extra wrapper styles
}) {
  const [hover, setHover] = useState(false);
  const px = SIZE[size] ?? SIZE.sm;

  // SVG checkmark scaled to the circle
  const stroke = px < 14 ? 2 : px < 20 ? 2.2 : 2.5;

  return (
    <span
      role="img"
      aria-label={LABEL[variant] || 'Verified'}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position:      'relative',
        display:       'inline-flex',
        alignItems:    'center',
        justifyContent:'center',
        width:         px,
        height:        px,
        borderRadius:  '50%',
        background:    BG[variant] || BG.user,
        flexShrink:    0,
        boxShadow:     hover
          ? `0 0 0 3px ${SHADOW[variant] || SHADOW.user}`
          : 'none',
        transition:    'box-shadow 0.2s',
        cursor:        tooltip ? 'default' : 'inherit',
        ...style,
      }}
    >
      {/* White checkmark SVG */}
      <svg
        viewBox="0 0 12 12"
        width={px * 0.58}
        height={px * 0.58}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <polyline
          points="2,6.5 5,9.5 10,3"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Tooltip */}
      {tooltip && hover && <Tooltip text={LABEL[variant] || 'Verified'} size={px} />}
    </span>
  );
}
