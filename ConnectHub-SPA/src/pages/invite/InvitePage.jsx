// src/pages/invite/InvitePage.jsx
// Beta Referral / Invite Friends page — Jun 2026
// ✅ Unique referral link generation (Firebase UID based)
// ✅ One-tap share to WhatsApp / Twitter / Email / clipboard
// ✅ Beta Pioneer badge incentive
// ✅ Referral counter (stored in Firestore user doc)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';

export default function InvitePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  const referralLink = user
    ? `https://lynkapp.net/?ref=${user.uid.slice(0, 8)}`
    : 'https://lynkapp.net';

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setReferralCount(snap.data().referralCount || 0);
    }).catch(() => {});
  }, [user]);

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // fallback
      const el = document.createElement('textarea');
      el.value = referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const shareText = encodeURIComponent(
    `I'm testing LynkApp — a new social platform with live streaming, dating, marketplace & more. Join the beta free! ${referralLink}`
  );

  const shareOptions = [
    {
      label: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      url: `https://wa.me/?text=${shareText}`,
    },
    {
      label: 'Twitter / X',
      icon: '✖️',
      color: '#000000',
      url: `https://twitter.com/intent/tweet?text=${shareText}`,
    },
    {
      label: 'Email',
      icon: '✉️',
      color: '#6366f1',
      url: `mailto:?subject=Join%20LynkApp%20Beta&body=${shareText}`,
    },
    {
      label: 'Facebook',
      icon: '👥',
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
    },
  ];

  const milestones = [
    { count: 1,  reward: '🎖️ Early Adopter badge' },
    { count: 3,  reward: '🌟 Beta Pioneer badge' },
    { count: 10, reward: '🏆 Ambassador badge + profile highlight' },
  ];

  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      padding: '24px 16px 80px',
      color: '#f1f5f9',
      fontFamily: 'system-ui,sans-serif',
    },
    card: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 20,
      padding: '20px',
      marginBottom: 16,
    },
    title: { fontSize: 22, fontWeight: 800, marginBottom: 4 },
    sub:   { fontSize: 13, color: '#94a3b8' },
    linkBox: {
      background: 'rgba(99,102,241,0.12)',
      border: '1.5px solid rgba(99,102,241,0.35)',
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 16,
    },
    copyBtn: {
      padding: '8px 16px',
      borderRadius: 10,
      background: copied ? '#10b981' : 'linear-gradient(135deg,#6366f1,#ec4899)',
      border: 'none',
      color: 'white',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'background 0.3s',
    },
    shareBtn: (color) => ({
      flex: 1,
      minWidth: 70,
      padding: '10px 6px',
      borderRadius: 12,
      background: 'rgba(255,255,255,0.06)',
      border: `1px solid rgba(255,255,255,0.10)`,
      color: '#f1f5f9',
      fontWeight: 600,
      fontSize: 12,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      textDecoration: 'none',
    }),
  };

  if (!user) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <p style={{ color: '#94a3b8' }}>Sign in to get your referral link.</p>
          <button onClick={() => navigate('/login')}
            style={{ padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', marginTop: 16 }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>←</button>
        <div>
          <h1 style={{ ...s.title, marginBottom: 2 }}>Invite Friends 🎉</h1>
          <p style={s.sub}>Invite friends to LynkApp Beta — earn badges!</p>
        </div>
      </div>

      {/* Progress */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Your Referrals</div>
          <div style={{
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            borderRadius: 20, padding: '4px 14px',
            fontSize: 13, fontWeight: 700,
          }}>
            {referralCount} joined
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min((referralCount / 10) * 100, 100)}%`,
            height: '100%',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            borderRadius: 8,
            transition: 'width 0.6s',
          }} />
        </div>
        <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
          Next milestone: {referralCount < 1 ? '1 referral → Early Adopter badge' : referralCount < 3 ? '3 referrals → Beta Pioneer badge' : referralCount < 10 ? '10 referrals → Ambassador badge' : '🏆 Ambassador achieved!'}
        </p>
      </div>

      {/* Referral Link */}
      <div style={s.card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Your Unique Link</div>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 0 }}>Share this link — we track who you brought in.</p>
        <div style={s.linkBox}>
          <span style={{ fontSize: 12, color: '#a5b4fc', wordBreak: 'break-all', flex: 1 }}>{referralLink}</span>
          <button onClick={copyLink} style={s.copyBtn}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Share Options */}
      <div style={s.card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Share via</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {shareOptions.map(({ label, icon, url }) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={s.shareBtn()}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
            </a>
          ))}
          <button onClick={copyLink} style={{ ...s.shareBtn(), flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 20 }}>🔗</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Copy Link</span>
          </button>
        </div>
      </div>

      {/* Milestones */}
      <div style={s.card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🏅 Milestone Rewards</div>
        {milestones.map(({ count, reward }) => (
          <div key={count} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: referralCount >= count ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: referralCount >= count ? 'white' : '#64748b',
            }}>
              {referralCount >= count ? '✓' : count}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: referralCount >= count ? '#10b981' : '#f1f5f9' }}>{reward}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{count} friend{count > 1 ? 's' : ''} must join</div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ ...s.card, background: 'rgba(99,102,241,0.08)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>ℹ️ How it works</div>
        {[
          'Share your unique link with friends',
          'They sign up using your link',
          'Their account is linked to your referral count',
          'Earn badges as your count grows',
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#818cf8',
            }}>{i + 1}</div>
            <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
