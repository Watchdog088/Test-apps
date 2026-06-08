// src/pages/legal/AboutPage.jsx
// BETA FIX (Jun 2026): Added About Us page — critical for beta trust
// Route: /about

import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      color: '#f1f5f9',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '0 0 80px 0',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Link to="/" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: 14 }}>
          ← Back to Home
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <span style={{ fontWeight: 700, fontSize: 16 }}>About LynkApp</span>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 20px',
          }}>🔗</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16,
            background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            About LynkApp
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
            A next-generation social platform built to connect people in a more meaningful,
            feature-rich, and community-first way.
          </p>
          <div style={{
            display: 'inline-block',
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 50, padding: '6px 18px', fontSize: 13,
            color: '#a78bfa', marginTop: 16,
          }}>
            🚀 Now in Open Beta — June 2026
          </div>
        </div>

        {/* Mission */}
        <Section title="🎯 Our Mission">
          <p>
            LynkApp was built from the ground up with one goal: give creators, communities,
            and everyday users a single platform that does it all — social feed, live streaming,
            dating, marketplace, gaming, music, video calls, and more.
          </p>
          <p style={{ marginTop: 12 }}>
            We believe social apps should be powerful without being overwhelming, private without
            being isolating, and community-driven without sacrificing individual expression.
          </p>
        </Section>

        {/* What We're Building */}
        <Section title="🛠️ What We're Building">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: '📱', label: 'Social Feed' },
              { icon: '🎥', label: 'Live Streaming' },
              { icon: '❤️', label: 'Dating' },
              { icon: '🛒', label: 'Marketplace' },
              { icon: '💬', label: 'Messaging' },
              { icon: '🎮', label: 'Gaming Hub' },
              { icon: '🎵', label: 'Music Player' },
              { icon: '📹', label: 'Video Calls' },
              { icon: '👥', label: 'Groups & Events' },
              { icon: '📖', label: 'Stories' },
              { icon: '🏪', label: 'Creator Tools' },
              { icon: '🔍', label: 'Discovery' },
            ].map(f => (
              <div key={f.label} style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Beta Program */}
        <Section title="🧪 Beta Program">
          <p>
            LynkApp is currently in <strong style={{ color: '#a78bfa' }}>Open Beta</strong>.
            We're inviting early adopters to test the platform, discover new features, and help
            shape the future of LynkApp through direct feedback.
          </p>
          <ul style={{ marginTop: 12, paddingLeft: 20, lineHeight: 1.9 }}>
            <li>All beta features are free to use during the beta period</li>
            <li>Beta testers receive a special <strong>Beta Pioneer</strong> badge</li>
            <li>Your feedback directly influences our development roadmap</li>
            <li>Early beta users get priority access to premium features at launch</li>
          </ul>
          <div style={{ marginTop: 20 }}>
            <Link to="/login" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              color: 'white', textDecoration: 'none',
              padding: '12px 28px', borderRadius: 50,
              fontWeight: 700, fontSize: 15,
            }}>
              Join the Beta — It's Free
            </Link>
          </div>
        </Section>

        {/* Values */}
        <Section title="💜 Our Values">
          {[
            { icon: '🔒', title: 'Privacy First', desc: 'You own your data. Granular controls, transparent policies, GDPR-compliant.' },
            { icon: '🌍', title: 'Community Driven', desc: 'Features are shaped by real user feedback. Your voice matters here.' },
            { icon: '⚡', title: 'Always Improving', desc: 'We ship updates regularly. Beta feedback turns into features in days, not months.' },
            { icon: '🤝', title: 'Inclusive by Design', desc: 'Built for everyone — all backgrounds, interests, and communities are welcome.' },
          ].map(v => (
            <div key={v.title} style={{
              display: 'flex', gap: 16, marginBottom: 20,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12, padding: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{v.icon}</span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{v.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.6 }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </Section>

        {/* Contact */}
        <Section title="📬 Get in Touch">
          <p style={{ marginBottom: 16 }}>
            Have questions? Want to partner with us? Press inquiries welcome.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="mailto:hello@lynkapp.net" style={{
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.4)',
              color: '#a78bfa', textDecoration: 'none',
              padding: '10px 20px', borderRadius: 50, fontSize: 14, fontWeight: 600,
            }}>
              ✉️ hello@lynkapp.net
            </a>
            <Link to="/contact" style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#f1f5f9', textDecoration: 'none',
              padding: '10px 20px', borderRadius: 50, fontSize: 14, fontWeight: 600,
            }}>
              Contact Us →
            </Link>
          </div>
        </Section>

        {/* Footer links */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 32, marginTop: 48,
          display: 'flex', gap: 24, flexWrap: 'wrap',
          color: 'rgba(255,255,255,0.5)', fontSize: 13,
        }}>
          <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/cookie-policy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Cookie Policy</Link>
          <Link to="/contact" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Contact</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>{title}</h2>
      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}
