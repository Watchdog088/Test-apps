// src/pages/beta/BetaWelcomePage.jsx
// GAP #13 — Full-screen Beta Tester Welcome / Onboarding page
// Shown to users who arrive via a beta invite link (?beta=1 or state.fromBeta).
// Replaces BetaWelcomeTooltip with an immersive first-time screen.

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

const FEATURES_TO_TEST = [
  { emoji: '📰', label: 'Feed & Stories', route: '/feed', desc: 'Post, react, comment, share stories' },
  { emoji: '🔴', label: 'Live Streaming', route: '/live', desc: 'Go live or watch others stream' },
  { emoji: '❤️', label: 'Dating', route: '/dating', desc: 'Swipe, match, and chat' },
  { emoji: '💬', label: 'Messages', route: '/messages', desc: 'DMs, group chats, voice notes' },
  { emoji: '🛒', label: 'Marketplace', route: '/marketplace', desc: 'Buy, sell, list products' },
  { emoji: '📹', label: 'Video Calls', route: '/videocalls', desc: 'P2P and group video calls' },
  { emoji: '👥', label: 'Groups', route: '/groups', desc: 'Create or join communities' },
  { emoji: '📅', label: 'Events', route: '/events', desc: 'Discover and RSVP to events' },
];

const STEPS = [
  {
    icon: '🎉',
    title: 'Welcome, Beta Tester!',
    subtitle: 'You\'re one of the first people to try LynkApp.',
    body: 'Your feedback will directly shape the final product. We\'re counting on you to help us find bugs, test features, and tell us what you love (and what needs work).',
    cta: 'Let\'s Get Started →',
  },
  {
    icon: '🔬',
    title: 'What You\'re Testing',
    subtitle: '8 core feature areas — explore them all.',
    body: null, // rendered as feature grid
    cta: 'Got It →',
  },
  {
    icon: '🐛',
    title: 'How to Report Bugs',
    subtitle: 'Your reports are our gold.',
    body: '1. Tap the 💬 button (bottom-right corner) on any page.\n2. Describe what you expected vs. what happened.\n3. Include the page name and steps to reproduce.\n\n⚠️ Data may be reset during beta. Don\'t store anything important.',
    cta: 'Understood →',
  },
  {
    icon: '🚀',
    title: 'You\'re Ready!',
    subtitle: 'The adventure starts now.',
    body: 'Start by completing your profile, following some people, and making your first post. The 💬 feedback button is always available. Have fun — and thank you!',
    cta: 'Enter LynkApp →',
  },
];

export default function BetaWelcomePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      // Mark user as beta-welcomed in Firestore
      if (auth.currentUser) {
        try {
          await setDoc(
            doc(db, 'users', auth.currentUser.uid),
            { betaWelcomed: true, betaWelcomedAt: serverTimestamp() },
            { merge: true }
          );
        } catch (_) {}
      }
      localStorage.setItem('lynk_beta_welcomed', '1');
      navigate('/profile/setup');
    } else {
      setStep(s => s + 1);
    }
  };

  const skip = async () => {
    localStorage.setItem('lynk_beta_welcomed', '1');
    navigate('/feed');
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #1a0533 50%, #0f0c29 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '24px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i === step ? '#6366f1' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 24, padding: '32px 24px',
        maxWidth: 440, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
      }}>
        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366f1,#ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 20px',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        }}>
          {current.icon}
        </div>

        {/* Title */}
        <h1 style={{
          color: '#f1f5f9', fontSize: 22, fontWeight: 800,
          textAlign: 'center', margin: '0 0 8px',
        }}>{current.title}</h1>

        {/* Subtitle */}
        <p style={{
          color: '#94a3b8', fontSize: 14, textAlign: 'center',
          margin: '0 0 20px', lineHeight: 1.5,
        }}>{current.subtitle}</p>

        {/* Body text or feature grid */}
        {current.body && (
          <p style={{
            color: '#cbd5e1', fontSize: 14, lineHeight: 1.7,
            margin: '0 0 24px', whiteSpace: 'pre-line',
          }}>{current.body}</p>
        )}

        {/* Feature grid (step 1) */}
        {step === 1 && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 10, marginBottom: 24,
          }}>
            {FEATURES_TO_TEST.map((f) => (
              <div key={f.label} style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.18)',
                borderRadius: 12, padding: '10px 12px',
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{f.emoji}</span>
                <div>
                  <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 12 }}>{f.label}</div>
                  <div style={{ color: '#64748b', fontSize: 10, lineHeight: 1.3 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Beta badge */}
        {step === 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 24, padding: '6px 14px',
            margin: '0 auto 24px', display: 'flex', justifyContent: 'center',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'livePulse 1.4s infinite' }} />
            <span style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 700 }}>Beta Tester — June 2026</span>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleNext}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            border: 'none', borderRadius: 14,
            color: 'white', fontSize: 15, fontWeight: 800,
            cursor: 'pointer', letterSpacing: 0.3,
            boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
            transition: 'transform 0.15s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {current.cta}
        </button>
      </div>

      {/* Skip */}
      {!isLast && (
        <button
          onClick={skip}
          style={{
            marginTop: 16, color: '#475569', fontSize: 13,
            background: 'none', border: 'none', cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Skip intro
        </button>
      )}
    </div>
  );
}
