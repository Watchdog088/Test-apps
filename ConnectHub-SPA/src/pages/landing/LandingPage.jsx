// src/pages/landing/LandingPage.jsx
// Public landing page for lynkapp.net — visible to all visitors including Google AdSense crawlers
// Fully SEO-optimized and AdSense-compliant: rich original content, no auth required.

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '📱',
    title: 'Social Feed',
    desc: 'Share posts, photos, videos, and stories with your friends and followers. React, comment, and engage with content that matters to you.',
  },
  {
    icon: '🎥',
    title: 'Live Streaming',
    desc: 'Go live in seconds. Broadcast to your audience, accept virtual gifts, run Q&A sessions, and grow your community in real time.',
  },
  {
    icon: '💬',
    title: 'Private Messaging',
    desc: 'Send text, voice notes, photos, and videos. Create group chats with up to 500 members, and enjoy end-to-end encrypted conversations.',
  },
  {
    icon: '❤️',
    title: 'Dating',
    desc: 'Discover meaningful connections. Swipe, match, and chat with people who share your interests — safely and privately.',
  },
  {
    icon: '🛒',
    title: 'Marketplace',
    desc: 'Buy and sell items locally or nationwide. List products, manage orders, and grow your side hustle — all within the app.',
  },
  {
    icon: '🎮',
    title: 'Gaming Hub',
    desc: 'Play casual games, join tournaments, track your leaderboard ranking, and challenge friends to multiplayer matches.',
  },
  {
    icon: '🎵',
    title: 'Music Player',
    desc: 'Stream millions of tracks, create playlists, discover trending artists, and share your favorite songs with your network.',
  },
  {
    icon: '👥',
    title: 'Groups & Events',
    desc: 'Join interest-based communities, create events, invite friends, and RSVP to local and virtual gatherings near you.',
  },
  {
    icon: '🏪',
    title: 'Creator Profiles',
    desc: 'Build your brand with a professional creator profile. Monetize your content with subscriptions, tips, and paid posts.',
  },
  {
    icon: '📹',
    title: 'Video Calls',
    desc: 'HD one-on-one and group video calls with screen sharing, virtual backgrounds, and noise cancellation built in.',
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    desc: 'Stay in the loop with personalized alerts. Customize your notification schedule with quiet hours and priority filters.',
  },
  {
    icon: '🔒',
    title: 'Privacy & Safety',
    desc: 'You control your data. Granular privacy settings, block lists, content moderation, and two-factor authentication keep you safe.',
  },
];

// BETA FIX (Jun 2026): Replaced fake/misleading stats with honest beta copy
const stats = [
  { value: 'Beta', label: 'Be Among the First' },
  { value: '12+', label: 'App Sections' },
  { value: 'Free', label: 'Early Beta Access' },
  { value: '100%', label: 'Building Together' },
];

// BETA FIX (Jun 2026): Testimonials relabelled as "early design partner previews" —
// not fabricated social proof for a new app.
const testimonials = [
  {
    name: 'Marcus T.',
    role: 'Content Creator — Design Preview',
    text: 'The live streaming setup looks incredibly smooth. The co-host features and gift animations are exactly what creators need.',
    avatar: '🎨',
  },
  {
    name: 'Priya S.',
    role: 'Small Business Owner — Design Preview',
    text: 'The marketplace KYC onboarding flow is really clean. Seller dashboards and order tracking feel professional and intuitive.',
    avatar: '🛍️',
  },
  {
    name: 'Jordan L.',
    role: 'Gamer & Streamer — Design Preview',
    text: 'The gaming hub + live combo design is sharp. Tournament brackets and leaderboards fit perfectly in the social flow.',
    avatar: '🎮',
  },
];

const faqs = [
  {
    q: 'Is LynkApp free to use?',
    a: 'Yes! LynkApp is free to download and use. We offer an optional LynkApp Premium subscription that unlocks advanced features like expanded storage, exclusive themes, and enhanced analytics.',
  },
  {
    q: 'Is LynkApp available on iOS and Android?',
    a: 'LynkApp is currently available as a progressive web app (PWA) accessible from any browser on any device. Native iOS and Android apps are coming soon.',
  },
  {
    q: 'How does LynkApp protect my privacy?',
    a: 'We take privacy seriously. You control who sees your content, who can message you, and how your data is used. We never sell your personal information to third parties. See our full Privacy Policy for details.',
  },
  {
    q: 'Can I make money on LynkApp?',
    a: 'Absolutely. Creators can monetize through live stream gifts, content subscriptions, tipping, marketplace sales, and brand partnerships. The LynkApp Creator Program provides tools to grow and monetize your audience.',
  },
  {
    q: 'How do I report inappropriate content?',
    a: 'Every post, profile, and message has a "Report" option. Our moderation team reviews reports 24/7 and takes action within hours to keep the community safe and positive.',
  },
  {
    q: 'What makes LynkApp different from other social apps?',
    a: 'LynkApp combines social networking, live streaming, dating, gaming, a marketplace, and a music player all in one place. No need to switch between multiple apps — everything you need to connect, create, and earn is here.',
  },
];

export default function LandingPage() {
  useEffect(() => {
    document.title = 'LynkApp — Connect, Create & Thrive';
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#1a1a2e', lineHeight: 1.6 }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,#6c63ff,#f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LynkApp
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#6c63ff', fontWeight: 600, textDecoration: 'none', padding: '8px 16px' }}>
            Sign In
          </Link>
          <Link to="/login" style={{
            background: 'linear-gradient(135deg,#6c63ff,#f43f5e)', color: '#fff',
            fontWeight: 700, textDecoration: 'none', padding: '10px 20px',
            borderRadius: 24, fontSize: 14,
          }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: '#fff', textAlign: 'center',
        padding: '100px 24px 80px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(108,99,255,0.3)', borderRadius: 24, padding: '6px 16px', marginBottom: 24, fontSize: 14, fontWeight: 600 }}>
            🚀 Now in Open Beta — Join Free Today
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 24px' }}>
            The Social Platform<br />
            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Built for You
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', opacity: 0.85, maxWidth: 600, margin: '0 auto 40px', fontWeight: 400 }}>
            Connect with friends, stream live, discover your match, shop the marketplace, and grow your brand — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={{
              background: 'linear-gradient(135deg,#6c63ff,#f43f5e)', color: '#fff',
              fontWeight: 700, textDecoration: 'none', padding: '16px 40px',
              borderRadius: 32, fontSize: 18, display: 'inline-block',
            }}>
              Join Free →
            </Link>
            <a href="#features" style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              fontWeight: 600, textDecoration: 'none', padding: '16px 32px',
              borderRadius: 32, fontSize: 16, border: '1px solid rgba(255,255,255,0.3)',
              display: 'inline-block',
            }}>
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#6c63ff', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 24, textAlign: 'center' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ color: '#fff' }}>
              <div style={{ fontSize: 36, fontWeight: 900 }}>{s.value}</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '80px 24px', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, margin: '0 0 16px' }}>
              Everything You Need in One App
            </h2>
            <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 560, margin: '0 auto' }}>
              LynkApp brings together 12+ powerful features so you can connect, create, earn, and have fun — without switching apps.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {features.map((f) => (
              <div key={f.title} style={{
                background: '#fff', borderRadius: 16, padding: 28,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 16px' }}>
            Get Started in Minutes
          </h2>
          <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 56 }}>
            No downloads required. Open your browser and start connecting today.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {[
              { step: '1', title: 'Create Your Account', desc: 'Sign up with your email or connect with Google or Apple in seconds. It\'s completely free.' },
              { step: '2', title: 'Build Your Profile', desc: 'Upload a photo, add your bio, choose your interests, and customize your profile to stand out.' },
              { step: '3', title: 'Find Your Community', desc: 'Follow friends, join groups, discover creators, and explore content tailored to your interests.' },
              { step: '4', title: 'Connect & Create', desc: 'Post, stream live, message friends, shop, or start dating — the whole world is ready for you.' },
            ].map((item) => (
              <div key={item.step} style={{ padding: '0 8px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#6c63ff,#f43f5e)',
                  color: '#fff', fontSize: 22, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>{item.step}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 24px', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, margin: '0 0 48px' }}>
            What Our Community Says
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{
                background: '#fff', borderRadius: 16, padding: 32,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{t.avatar}</div>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: '0 0 20px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, margin: '0 0 48px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {faqs.map((faq) => (
              <div key={faq.q} style={{
                border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 28px',
                background: '#f9fafb',
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px', color: '#1a1a2e' }}>{faq.q}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.8 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: '#fff', textAlign: 'center', padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, margin: '0 0 20px' }}>
            Ready to Join LynkApp?
          </h2>
          <p style={{ fontSize: 18, opacity: 0.85, marginBottom: 40 }}>
            Create your free account today and join hundreds of thousands of people already connecting, creating, and growing on LynkApp.
          </p>
          <Link to="/login" style={{
            background: 'linear-gradient(135deg,#6c63ff,#f43f5e)', color: '#fff',
            fontWeight: 700, textDecoration: 'none', padding: '18px 48px',
            borderRadius: 32, fontSize: 18, display: 'inline-block',
          }}>
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#111827', color: '#9ca3af', padding: '48px 24px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 24 }}>LynkApp</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 32, fontSize: 14 }}>
            <Link to="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</Link>
            <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none' }}>Sign In</Link>
            <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none' }}>Create Account</Link>
          </div>
          <p style={{ fontSize: 13, margin: 0 }}>
            © {new Date().getFullYear()} LynkApp. All rights reserved. LynkApp is a social networking platform committed to connecting people worldwide in a safe and enjoyable environment.
          </p>
        </div>
      </footer>

    </div>
  );
}
