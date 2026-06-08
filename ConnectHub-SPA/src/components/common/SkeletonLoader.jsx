// src/components/common/SkeletonLoader.jsx
// IMPROVE-10 FIX: Reusable skeleton loader for Profile, Messages, Dating pages

import React from 'react';

const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

const skeletonBg = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '800px 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: 10,
};

/** Generic shimmer block */
export function SkeletonBlock({ width = '100%', height = 16, radius = 10, style = {} }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ width, height, borderRadius: radius, ...skeletonBg, ...style }} />
    </>
  );
}

/** Profile header skeleton */
export function ProfileSkeleton() {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ padding: '20px 16px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', ...skeletonBg, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '60%', height: 20, ...skeletonBg }} />
                <div style={{ width: '80%', height: 12, ...skeletonBg }} />
              </div>
            ))}
          </div>
        </div>
        {/* Name + bio */}
        <div style={{ width: '50%', height: 18, ...skeletonBg, marginBottom: 8 }} />
        <div style={{ width: '100%', height: 13, ...skeletonBg, marginBottom: 6 }} />
        <div style={{ width: '70%', height: 13, ...skeletonBg, marginBottom: 16 }} />
        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, height: 38, borderRadius: 14, ...skeletonBg }} />
          <div style={{ flex: 1, height: 38, borderRadius: 14, ...skeletonBg }} />
        </div>
      </div>
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: '8px 0' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ aspectRatio: '1', ...skeletonBg, borderRadius: 0 }} />
        ))}
      </div>
    </>
  );
}

/** Post card skeleton (for feed) */
export function PostSkeleton() {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', ...skeletonBg, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '40%', height: 14, ...skeletonBg, marginBottom: 6 }} />
            <div style={{ width: '25%', height: 11, ...skeletonBg }} />
          </div>
        </div>
        <div style={{ width: '95%', height: 13, ...skeletonBg, marginBottom: 6 }} />
        <div style={{ width: '80%', height: 13, ...skeletonBg, marginBottom: 14 }} />
        <div style={{ width: '100%', height: 200, borderRadius: 16, ...skeletonBg }} />
      </div>
    </>
  );
}

/** Conversation row skeleton */
export function ConversationSkeleton() {
  return (
    <>
      <style>{shimmer}</style>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', ...skeletonBg, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '45%', height: 14, ...skeletonBg, marginBottom: 6 }} />
            <div style={{ width: '70%', height: 12, ...skeletonBg }} />
          </div>
          <div style={{ width: 40, height: 11, ...skeletonBg }} />
        </div>
      ))}
    </>
  );
}

/** Dating card stack skeleton */
export function DatingSkeleton() {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ margin: '16px', borderRadius: 28, overflow: 'hidden' }}>
        <div style={{ height: 'min(440px, 58vh)', ...skeletonBg, borderRadius: 28 }} />
      </div>
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', padding: '16px 32px' }}>
        {[64, 52, 64].map((s, i) => (
          <div key={i} style={{ width: s, height: s, borderRadius: '50%', ...skeletonBg }} />
        ))}
      </div>
    </>
  );
}

/** Tab content skeleton */
export function TabSkeleton({ rows = 3 }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ height: 14, width: `${60 + Math.random() * 35}%`, ...skeletonBg }} />
        ))}
      </div>
    </>
  );
}

/** Friend / user list row skeleton */
export function FriendSkeleton({ rows = 4 }) {
  return (
    <>
      <style>{shimmer}</style>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', ...skeletonBg, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '45%', height: 14, ...skeletonBg, marginBottom: 6 }} />
            <div style={{ width: '30%', height: 11, ...skeletonBg }} />
          </div>
          <div style={{ width: 68, height: 32, borderRadius: 20, ...skeletonBg }} />
        </div>
      ))}
    </>
  );
}

/** Event card skeleton */
export function EventSkeleton({ rows = 3 }) {
  return (
    <>
      <style>{shimmer}</style>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ margin: '0 16px 14px', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ height: 130, ...skeletonBg, borderRadius: 0 }} />
          <div style={{ padding: '12px 14px' }}>
            <div style={{ width: '60%', height: 16, ...skeletonBg, marginBottom: 8 }} />
            <div style={{ width: '40%', height: 12, ...skeletonBg, marginBottom: 6 }} />
            <div style={{ width: '30%', height: 11, ...skeletonBg }} />
          </div>
        </div>
      ))}
    </>
  );
}

/** Notification row skeleton */
export function NotificationSkeleton({ rows = 5 }) {
  return (
    <>
      <style>{shimmer}</style>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', ...skeletonBg, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '75%', height: 13, ...skeletonBg, marginBottom: 6 }} />
            <div style={{ width: '50%', height: 11, ...skeletonBg, marginBottom: 8 }} />
            <div style={{ width: '20%', height: 10, ...skeletonBg }} />
          </div>
        </div>
      ))}
    </>
  );
}

/** Marketplace product grid skeleton */
export function MarketplaceSkeleton({ cols = 2, rows = 3 }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: 16 }}>
        {Array.from({ length: cols * rows }).map((_, i) => (
          <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ aspectRatio: '1', ...skeletonBg, borderRadius: 0 }} />
            <div style={{ padding: '10px 12px' }}>
              <div style={{ width: '70%', height: 13, ...skeletonBg, marginBottom: 6 }} />
              <div style={{ width: '40%', height: 16, ...skeletonBg }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Group list row skeleton */
export function GroupSkeleton({ rows = 4 }) {
  return (
    <>
      <style>{shimmer}</style>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, ...skeletonBg, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '50%', height: 14, ...skeletonBg, marginBottom: 6 }} />
            <div style={{ width: '35%', height: 11, ...skeletonBg }} />
          </div>
          <div style={{ width: 56, height: 30, borderRadius: 10, ...skeletonBg }} />
        </div>
      ))}
    </>
  );
}

/** Generic list of text rows (for search results, saved, etc.) */
export function ListSkeleton({ rows = 5 }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ padding: '8px 0' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', ...skeletonBg, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: `${45 + (i * 13) % 35}%`, height: 13, ...skeletonBg, marginBottom: 5 }} />
              <div style={{ width: `${25 + (i * 9) % 25}%`, height: 11, ...skeletonBg }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default SkeletonBlock;
