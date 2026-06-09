// src/pages/profile/ProfileSetupPage.jsx
// MISSING #3 — Profile Completion Dashboard
// Shows completion percentage + next steps for new users

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const STEPS = [
  { key: 'photo',      icon: '📸', label: 'Add profile photo',        path: '/profile/edit',    points: 25 },
  { key: 'bio',        icon: '✏️', label: 'Write a bio',              path: '/profile/edit',    points: 20 },
  { key: 'interests',  icon: '🎯', label: 'Add your interests',       path: '/profile/edit',    points: 15 },
  { key: 'follow',     icon: '👥', label: 'Follow 3 people',          path: '/friends/find',    points: 20 },
  { key: 'post',       icon: '📝', label: 'Create your first post',   path: '/post/create',     points: 10 },
  { key: 'push',       icon: '🔔', label: 'Enable notifications',     path: '/settings/push-notifications', points: 10 },
];

const S = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0f0c29,#1a1a3e)', padding: '20px 16px 100px', color: '#f1f5f9' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  back: { width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: 20, marginBottom: 16 },
  progressBar: { height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.10)', overflow: 'hidden', margin: '12px 0' },
  progressFill: (pct) => ({ height: '100%', width: `${pct}%`, borderRadius: 4, background: 'linear-gradient(90deg,#6366f1,#ec4899)', transition: 'width 0.6s ease' }),
  stepRow: (done) => ({ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', opacity: done ? 0.5 : 1 }),
  check: (done) => ({ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, background: done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)', border: done ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.12)', color: done ? '#22c55e' : '#475569' }),
  btn: { padding: '8px 18px', borderRadius: 20, border: 'none', background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 },
};

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!auth.currentUser) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const data = snap.data() || {};
        const pushGranted = 'Notification' in window && Notification.permission === 'granted';
        setCompleted({
          photo:     !!data.photoURL,
          bio:       !!data.bio && data.bio.length > 5,
          interests: Array.isArray(data.interests) && data.interests.length > 0,
          follow:    (data.following || []).length >= 3,
          post:      (data.postCount || 0) > 0,
          push:      pushGranted,
        });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const totalPoints = STEPS.reduce((s, st) => s + (completed[st.key] ? st.points : 0), 0);
  const pct = totalPoints; // points == percentage since they sum to 100

  if (loading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#64748b' }}>Loading your profile...</div>
    </div>
  );

  const allDone = pct === 100;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Complete Your Profile</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Help others find and connect with you</div>
        </div>
      </div>

      {/* Progress card */}
      <div style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Profile Strength</div>
          <div style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg,#6366f1,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{pct}%</div>
        </div>
        <div style={S.progressBar}>
          <div style={S.progressFill(pct)} />
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          {allDone ? '🎉 Profile complete! You\'re all set.' : `Complete ${STEPS.filter(s => !completed[s.key]).length} more step${STEPS.filter(s => !completed[s.key]).length > 1 ? 's' : ''} to unlock full profile`}
        </div>
        {/* Level badge */}
        <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: pct >= 80 ? 'rgba(250,204,21,0.15)' : 'rgba(99,102,241,0.15)', border: pct >= 80 ? '1px solid rgba(250,204,21,0.4)' : '1px solid rgba(99,102,241,0.3)', fontSize: 13, fontWeight: 700, color: pct >= 80 ? '#fbbf24' : '#818cf8' }}>
          {pct >= 80 ? '⭐ Pro Member' : pct >= 50 ? '🔥 Getting there!' : '🌱 Just getting started'}
        </div>
      </div>

      {/* Steps */}
      <div style={S.card}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Your Setup Checklist</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Each step earns you points and unlocks features</div>
        {STEPS.map((step, i) => {
          const done = !!completed[step.key];
          return (
            <div key={step.key} style={{ ...S.stepRow(done), borderBottom: i < STEPS.length - 1 ? S.stepRow(done).borderBottom : 'none' }}>
              <div style={S.check(done)}>{done ? '✓' : step.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: done ? '#64748b' : '#f1f5f9', textDecoration: done ? 'line-through' : 'none' }}>{step.label}</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>+{step.points} points</div>
              </div>
              {!done && (
                <button style={S.btn} onClick={() => navigate(step.path)}>
                  Do it →
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {!allDone && (
        <button
          onClick={() => {
            const first = STEPS.find(s => !completed[s.key]);
            if (first) navigate(first.path);
          }}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}
        >
          Continue Setup →
        </button>
      )}
    </div>
  );
}
