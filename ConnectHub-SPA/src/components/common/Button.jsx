/**
 * LynkApp — Wireframe Button Component
 * ─────────────────────────────────────
 * Drop-in reusable button for every screen in the app.
 * CSS lives in global.css → no extra import needed.
 *
 * Props
 * ─────
 * variant  — 'primary' | 'accent' | 'ghost' | 'outline' | 'landing-ghost'
 *             | 'surface' | 'danger' | 'success' | 'warning' | 'live'
 *             (default: 'primary')
 * size     — 'sm' | 'md' | 'lg'    (default: 'md')
 * shape    — 'pill' | 'soft' | 'sq' (default: 'pill')
 * block    — boolean  → full width
 * icon     — boolean  → square icon-only button
 * disabled — boolean
 * as       — 'button' | 'a' | 'Link'  (default: 'button')
 * to       — href for <a> or React Router <Link>
 * onClick  — click handler
 * children — label / icon content
 * className — extra classes
 *
 * Usage examples
 * ──────────────
 * <Button variant="accent" size="lg">Join Free →</Button>
 * <Button variant="ghost" size="sm" onClick={goBack}>← Back</Button>
 * <Button variant="danger" size="sm">Delete</Button>
 * <Button variant="success" block>Buy Now · $24.99</Button>
 * <Button variant="outline" as="a" to="/signup">Create Account</Button>
 * <Button variant="live" size="sm">🔴 Go Live</Button>
 */

import React from 'react';
import { Link } from 'react-router-dom';

const VARIANT_MAP = {
  primary:       'btn-wf-primary',
  accent:        'btn-wf-accent',
  ghost:         'btn-wf-ghost',
  outline:       'btn-wf-outline',
  'landing-ghost': 'btn-wf-landing-ghost',
  surface:       'btn-wf-surface',
  danger:        'btn-wf-danger',
  success:       'btn-wf-success',
  warning:       'btn-wf-warning',
  live:          'btn-wf-live',
};

const SIZE_MAP = {
  sm: 'btn-sm',
  md: '',          // md is the default — no extra class needed
  lg: 'btn-lg',
};

const SHAPE_MAP = {
  pill: 'btn-pill',
  soft: '',        // soft (12 px) is already the default radius
  sq:   'btn-sq',
};

export default function Button({
  variant  = 'primary',
  size     = 'md',
  shape    = 'pill',
  block    = false,
  icon     = false,
  disabled = false,
  as       = 'button',
  to,
  onClick,
  children,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    VARIANT_MAP[variant] || 'btn-wf-primary',
    SIZE_MAP[size]  || '',
    SHAPE_MAP[shape] || '',
    block  ? 'btn-block'  : '',
    icon   ? 'btn-icon'   : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Render as React Router <Link>
  if (as === 'Link' && to) {
    return (
      <Link to={to} className={classes} aria-disabled={disabled} {...rest}>
        {children}
      </Link>
    );
  }

  // Render as plain <a>
  if (as === 'a' && to) {
    return (
      <a href={to} className={classes} aria-disabled={disabled} {...rest}>
        {children}
      </a>
    );
  }

  // Default: <button>
  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
