// src/components/common/SafeImage.jsx
// Feature #5: Image upload fallbacks — shows default avatar on broken/missing images

import React, { useState } from 'react';

/**
 * SafeImage: renders an <img> and falls back to a DiceBear initials avatar if it fails.
 *
 * Props:
 *   src      - image URL (may be undefined/null/broken)
 *   alt      - alt text
 *   name     - display name used to generate fallback avatar (e.g. "Alex Smith")
 *   size     - pixel size (used for width/height if no style provided)
 *   style    - extra inline styles
 *   circle   - boolean, makes it border-radius 50%
 */
export default function SafeImage({
  src,
  alt = 'User avatar',
  name = 'User',
  size = 40,
  style = {},
  circle = true,
  className,
}) {
  const [failed, setFailed] = useState(false);

  // DiceBear "initials" avatar — free, no API key needed
  const seed = encodeURIComponent((name || 'User').trim().slice(0, 20));
  const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=6366f1,ec4899,8b5cf6&backgroundType=gradientLinear&fontSize=36`;

  const effectiveSrc = (!src || failed) ? fallback : src;

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: circle ? '50%' : 8,
    objectFit: 'cover',
    flexShrink: 0,
    background: 'rgba(99,102,241,0.15)',
    ...style,
  };

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      style={baseStyle}
      onError={() => setFailed(true)}
    />
  );
}
