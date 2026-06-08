// src/components/common/EmptyState.jsx
// Feature #1: Illustrated empty states with CTAs for all list pages

import React from 'react';

/**
 * Universal empty state component
 * Usage: <EmptyState emoji="👫" title="No friends yet" subtitle="..." ctaLabel="Find People" ctaOnClick={...} />
 */
export default function EmptyState({
  emoji = '📭',
  title = 'Nothing here yet',
  subtitle = 'Check back soon or be the first to add something.',
  ctaLabel = null,
  ctaOnClick = null,
  ctaSecondaryLabel = null,
  ctaSecondaryOnClick = null,
  compact = false,
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: compact ? '24px 20px' : '48px 32px',
      textAlign: 'center',
      minHeight: compact ? 0 : 280,
    }}>
      {/* Illustrated emoji in a glowing circle */}
      <div style={{
        width: compact ? 72 : 96,
        height: compact ? 72 : 96,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.05) 70%)',
        border: '1.5px solid rgba(99,102,241,0.20)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: compact ? 32 : 44,
        marginBottom: compact ? 12 : 20,
        boxShadow: '0 0 32px rgba(99,102,241,0.12)',
      }}>
        {emoji}
      </div>

      {/* Title */}
      <h3 style={{
        margin: '0 0 8px',
        fontSize: compact ? 15 : 18,
        fontWeight: 700,
        color: '#e2e8f0',
        lineHeight: 1.3,
      }}>
        {title}
      </h3>

      {/* Subtitle */}
      <p style={{
        margin: '0 0 24px',
        fontSize: compact ? 13 : 14,
        color: '#64748b',
        maxWidth: 260,
        lineHeight: 1.5,
      }}>
        {subtitle}
      </p>

      {/* Primary CTA */}
      {ctaLabel && ctaOnClick && (
        <button
          onClick={ctaOnClick}
          style={{
            padding: '11px 28px',
            borderRadius: 14,
            border: 'none',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            color: 'white',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: ctaSecondaryLabel ? 10 : 0,
            minHeight: 44,
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {ctaLabel}
        </button>
      )}

      {/* Secondary CTA */}
      {ctaSecondaryLabel && ctaSecondaryOnClick && (
        <button
          onClick={ctaSecondaryOnClick}
          style={{
            padding: '9px 24px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)',
            color: '#94a3b8',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          {ctaSecondaryLabel}
        </button>
      )}
    </div>
  );
}

// ── Pre-built empty state configs for common pages ─────────────────────────

export const EMPTY_STATES = {
  friends:      { emoji:'👫', title:'No friends yet',           subtitle:'Find people you know and start connecting.',     ctaLabel:'Find People' },
  followers:    { emoji:'👥', title:'No followers yet',          subtitle:'Share your profile to gain followers.',           ctaLabel:'Share Profile' },
  following:    { emoji:'🔍', title:'Not following anyone',      subtitle:'Explore and follow people who interest you.',     ctaLabel:'Explore' },
  messages:     { emoji:'💬', title:'No messages yet',           subtitle:'Start a conversation with a friend.',             ctaLabel:'New Message' },
  notifications:{ emoji:'🔔', title:'All caught up!',            subtitle:"You're up to date — no new notifications.",       ctaLabel: null },
  feed:         { emoji:'📱', title:'Your feed is empty',        subtitle:'Follow people or join groups to see posts here.', ctaLabel:'Discover People' },
  stories:      { emoji:'✨', title:'No stories right now',      subtitle:'Stories disappear after 24 hours. Be the first!', ctaLabel:'Add Your Story' },
  events:       { emoji:'📅', title:'No events found',           subtitle:'Create an event or adjust your search filters.',  ctaLabel:'Create Event' },
  groups:       { emoji:'🏘️', title:'No groups yet',             subtitle:'Join a group that matches your interests.',       ctaLabel:'Browse Groups' },
  marketplace:  { emoji:'🛒', title:'No listings found',         subtitle:'Be the first to sell something here!',            ctaLabel:'Create Listing' },
  orders:       { emoji:'📦', title:'No orders yet',             subtitle:'Browse the marketplace and find something you love.', ctaLabel:'Browse Marketplace' },
  saved:        { emoji:'💾', title:'Nothing saved yet',         subtitle:'Tap the bookmark icon on posts to save them here.',ctaLabel:'Browse Feed' },
  search:       { emoji:'🔍', title:'No results found',          subtitle:'Try different keywords or check your spelling.',   ctaLabel: null },
  matches:      { emoji:'💘', title:'No matches yet',            subtitle:'Keep swiping — your match is out there!',         ctaLabel: null },
  live:         { emoji:'📡', title:'No live streams right now', subtitle:'Go live or check back in a bit.',                 ctaLabel:'Go Live' },
  gaming:       { emoji:'🎮', title:'No games found',            subtitle:'Browse the gaming hub or add friends to play.',   ctaLabel:'Browse Games' },
  media:        { emoji:'🎬', title:'No media yet',              subtitle:'Your photos and videos will appear here.',        ctaLabel: null },
  reports:      { emoji:'✅', title:'No pending reports',        subtitle:'Great — everything is clean!',                    ctaLabel: null },
  kyc:          { emoji:'🪪', title:'No pending KYC',            subtitle:'All submissions have been reviewed.',             ctaLabel: null },
  comments:     { emoji:'💭', title:'No comments yet',           subtitle:'Be the first to share your thoughts.',            ctaLabel: null },
  birthdays:    { emoji:'🎂', title:'No birthdays this month',   subtitle:"None of your friends have birthdays coming up.",  ctaLabel: null },
};
