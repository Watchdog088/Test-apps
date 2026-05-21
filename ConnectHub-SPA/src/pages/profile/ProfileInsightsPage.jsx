// src/pages/profile/ProfileInsightsPage.jsx
// SECTION-8 NEW: /profile/insights — reach, impressions, top posts, audience analytics
// Reads from Firestore analytics/{uid} document (falls back to demo data)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';

function formatCount(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

const DEMO_ANALYTICS = {
  reach: 8420,
  impressions: 24700,
  profileVisits: 1290,
  accountsReached: 5840,
  followerGrowth: 143,
  followersGained: 168,
  followersLost: 25,
  weeklyReach: [320, 450, 310, 690, 820, 540, 490],
};

const DEMO_TOP_POSTS = [
  { id: 'p1', emoji: '🎵', likes: 1240, comments: 89, reach: 5420, color: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'p2', emoji: '✈️', likes: 980, comments: 67, reach: 3810, color: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'p3', emoji: '💪', likes: 756, comments: 45, reach: 2900, color: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
];

const AUDIENCE_DEMOGRAPHICS = [
  { label: '18–24', pct: 34, color: '#6366f1' },
  { label: '25–34', pct: 41, color: '#ec4899' },
  { label: '35–44', pct: 16, color: '#f59e0b' },
  { label: '45+', pct: 9, color: '#10b981' },
];

export default function ProfileInsightsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        // Load analytics doc
        const snap = await getDoc(doc(db, 'analytics', user.uid));
        setAnalytics(snap.exists() ? snap.data() : DEMO_ANALYTICS);

        // Load top posts
        const postsSnap = await getDocs(
          query(collection(db, 'posts'), where('userId', '==', user.uid), orderBy('likesCount', 'desc'), limit(3))
        );
        const posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTopPosts(posts.length > 0 ? posts : DEMO_TOP_POSTS);
      } catch {
        setAnalytics(DEMO_ANALYTICS);
        setTopPosts(DEMO_TOP_POSTS);
      }
      setLoading(false);
    })();
  }, [user]);

  const data = analytics || DEMO_ANALYTICS;

  const metrics = [
    { label: 'Reach', value: formatCount(data.reach), change: '+12%', icon: '📡', color: '#6366f1' },
    { label: 'Impressions', value: formatCount(data.impressions), change: '+8%', icon: '👁️', color: '#ec4899' },
    { label: 'Profile Visits', value: formatCount(data.profileVisits), change: '+24%', icon: '🔍', color: '#f59e0b' },
    { label: 'New Followers', value: formatCount(data.followerGrowth), change: '+19%', icon: '👥', color: '#10b981' },
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekData = data.weeklyReach || DEMO_ANALYTICS.weeklyReach;
  const maxBar = Math.max(...weekData);

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80, fontFamily: 'system-ui,sans-serif', color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>📊 Profile Insights</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Your performance overview</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ padding: '0 0 16px' }}>
          {/* Period Selector */}
          <div style={{ display: 'flex', gap: 8, padding: '16px 16px 8px', overflowX: 'auto' }}>
            {[['7d', '7 Days'], ['30d', '30 Days'], ['90d', '3 Months']].map(([val, label]) => (
              <button key={val} onClick={() => setPeriod(val)} style={{
                padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                background: period === val ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.07)',
                border: period === val ? 'none' : '1px solid rgba(255,255,255,0.12)',
                color: period === val ? '#fff' : '#94a3b8',
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '8px 16px' }}>
            {metrics.map(m => (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: '#10b981', marginTop: 4, fontWeight: 600 }}>{m.change} this week</div>
              </div>
            ))}
          </div>

          {/* Weekly Reach Chart */}
          <div style={{ margin: '8px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📈 Weekly Reach</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {weekData.map((val, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', background: i === 6 ? 'linear-gradient(180deg,#6366f1,#ec4899)' : 'rgba(99,102,241,0.4)', borderRadius: '4px 4px 0 0', height: `${(val / maxBar) * 70}px`, minHeight: 4, transition: 'height 0.3s' }} />
                  <div style={{ fontSize: 9, color: '#475569' }}>{weekDays[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Follower Stats */}
          <div style={{ margin: '8px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>👥 Follower Activity</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>+{data.followersGained || 168}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Gained</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>-{data.followersLost || 25}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Lost</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(99,102,241,0.1)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8' }}>+{(data.followersGained || 168) - (data.followersLost || 25)}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Net</div>
              </div>
            </div>
          </div>

          {/* Audience Age */}
          <div style={{ margin: '8px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>🎯 Audience Age</div>
            {AUDIENCE_DEMOGRAPHICS.map(d => (
              <div key={d.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#94a3b8' }}>{d.label}</span>
                  <span style={{ fontWeight: 700, color: d.color }}>{d.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${d.pct}%`, height: '100%', background: d.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Top Posts */}
          <div style={{ padding: '8px 16px 4px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Top Posts This Period</div>
          <div style={{ margin: '4px 16px 0' }}>
            {topPosts.map((post, i) => (
              <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: post.imageUrl ? 'none' : (post.color || '#1e293b'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden', flexShrink: 0 }}>
                  {post.imageUrl ? <img src={post.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (post.emoji || '📸')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8' }}>
                    <span>❤️ {formatCount(post.likesCount || post.likes || 0)}</span>
                    <span>💬 {formatCount(post.commentsCount || post.comments || 0)}</span>
                    <span>📡 {formatCount(post.reach || 0)} reach</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                    {post.caption?.slice(0, 50) || 'No caption'}
                  </div>
                </div>
                <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#818cf8' }}>#{i + 1}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ margin: '16px 16px 0', background: 'rgba(99,102,241,0.1)', borderRadius: 16, padding: 16, border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>🚀</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Boost your reach</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Get Premium for advanced insights, audience heatmaps, and content scheduling.</div>
            <button onClick={() => navigate('/premium')} style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 12, padding: '10px 24px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
