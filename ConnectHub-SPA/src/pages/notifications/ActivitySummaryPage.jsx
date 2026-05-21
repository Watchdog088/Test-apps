// src/pages/notifications/ActivitySummaryPage.jsx — SECTION 7 NEW PAGE (May 2026)
// NEW-N03: Weekly activity digest — shows engagement stats across the week
// Route: /notifications/activity-summary

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const s = {
  page:     { padding: '0 0 80px 0', background: '#0f172a', minHeight: '100vh' },
  header:   { padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px' },
  back:     { fontSize: '20px', cursor: 'pointer', color: '#94a3b8' },
  title:    { fontSize: '20px', fontWeight: 700, color: '#f1f5f9' },
  subtitle: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  section:  { padding: '16px' },
  card:     { background: '#1e293b', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '1px solid #334155' },
  cardTitle:{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' },
  statRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0f172a' },
  statLabel:{ fontSize: '14px', color: '#e2e8f0' },
  statValue:{ fontSize: '18px', fontWeight: 800, color: '#6366f1' },
  positive: { color: '#10b981', fontSize: '12px', fontWeight: 600 },
  negative: { color: '#ef4444', fontSize: '12px', fontWeight: 600 },
  chartBar: { display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', marginTop: '12px' },
  bar:      (h, active) => ({
    flex: 1, height: `${h}%`,
    background: active ? 'linear-gradient(180deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.25)',
    borderRadius: '6px 6px 0 0',
    transition: 'height 0.4s ease',
    minHeight: '4px',
  }),
  dayLabel: { display: 'flex', justifyContent: 'space-around', marginTop: '6px' },
  dayText:  (active) => ({ fontSize: '11px', color: active ? '#6366f1' : '#64748b', fontWeight: active ? 700 : 400, flex: 1, textAlign: 'center' }),
  highlight:{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(236,72,153,0.08))', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '1px solid rgba(99,102,241,0.25)' },
  hlTitle:  { fontSize: '14px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' },
  hlSub:    { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  topPost:  { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1e293b' },
  badge:    { background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 600 },
  cta:      { display: 'flex', gap: '10px', marginTop: '16px' },
  ctaBtn:   { flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none', textAlign: 'center' },
};

// Demo weekly data — in production this would come from Firestore analytics
const WEEK_DATA = {
  days:         ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  barHeights:   [40, 55, 35, 80, 65, 90, 70],
  todayIdx:     6, // Sunday = today (demo)
  stats: [
    { label: 'Total Impressions',   value: '14.2K', delta: '+23%',  positive: true  },
    { label: 'New Likes',           value: '342',   delta: '+18%',  positive: true  },
    { label: 'New Followers',       value: '28',    delta: '-4%',   positive: false },
    { label: 'Comments Received',   value: '87',    delta: '+41%',  positive: true  },
    { label: 'Profile Views',       value: '1,203', delta: '+9%',   positive: true  },
    { label: 'Mentions',            value: '12',    delta: '+200%', positive: true  },
  ],
  topPosts: [
    { thumb: '📸', title: 'Sunset photo at Lake Tahoe', likes: 94, comments: 22 },
    { thumb: '🎵', title: 'New track drop — "Neon Drift"', likes: 73, comments: 41 },
    { thumb: '🎮', title: 'Gaming session highlights', likes: 58, comments: 14 },
  ],
};

const DIGEST_PERIODS = ['This Week', 'Last Week', 'This Month'];

export default function ActivitySummaryPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('This Week');

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.back} onClick={() => navigate(-1)}>←</span>
        <div>
          <div style={s.title}>Activity Summary</div>
          <div style={s.subtitle}>Your content performance at a glance</div>
        </div>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px 0', overflowX: 'auto' }}>
        {DIGEST_PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
              background: period === p ? '#6366f1' : '#1e293b',
              color: period === p ? 'white' : '#94a3b8',
              border: period === p ? 'none' : '1px solid #334155',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={s.section}>
        {/* Engagement chart */}
        <div style={s.card}>
          <div style={s.cardTitle}>Daily Engagement — {period}</div>
          <div style={s.chartBar}>
            {WEEK_DATA.barHeights.map((h, i) => (
              <div key={i} style={s.bar(h, i === WEEK_DATA.todayIdx)} />
            ))}
          </div>
          <div style={s.dayLabel}>
            {WEEK_DATA.days.map((d, i) => (
              <span key={d} style={s.dayText(i === WEEK_DATA.todayIdx)}>{d}</span>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div style={s.card}>
          <div style={s.cardTitle}>Key Metrics</div>
          {WEEK_DATA.stats.map((stat, i) => (
            <div key={i} style={{ ...s.statRow, borderBottom: i === WEEK_DATA.stats.length - 1 ? 'none' : undefined }}>
              <span style={s.statLabel}>{stat.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={stat.positive ? s.positive : s.negative}>{stat.delta}</span>
                <span style={s.statValue}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top performing content */}
        <div style={s.card}>
          <div style={s.cardTitle}>Top Performing Posts</div>
          {WEEK_DATA.topPosts.map((post, i) => (
            <div key={i} style={s.topPost}>
              <div style={{ width: '48px', height: '48px', background: '#0f172a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                {post.thumb}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>{post.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  ❤️ {post.likes} likes · 💬 {post.comments} comments
                </div>
              </div>
              <span style={s.badge}>#{i + 1}</span>
            </div>
          ))}
        </div>

        {/* Best day highlight */}
        <div style={s.highlight}>
          <div style={s.hlTitle}>
            <span>🏆</span> Best Day: Saturday
          </div>
          <div style={s.hlSub}>Your Saturday post got 90% of this week's engagement. Post on Saturdays for max reach!</div>
        </div>

        {/* Mentions highlight */}
        <div style={s.highlight}>
          <div style={s.hlTitle}>
            <span>@</span> Mentions are up 200%!
          </div>
          <div style={s.hlSub}>12 people tagged you this week. Check your Mentions tab to reply and grow your reach.</div>
        </div>

        {/* Actions */}
        <div style={s.cta}>
          <button
            style={{ ...s.ctaBtn, background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: 'white' }}
            onClick={() => navigate('/post/create')}
          >
            ✏️ Create Post
          </button>
          <button
            style={{ ...s.ctaBtn, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
            onClick={() => navigate('/notifications')}
          >
            🔔 All Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
