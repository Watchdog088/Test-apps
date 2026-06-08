// src/pages/legal/ContactPage.jsx
// BETA FIX (Jun 2026): Added Contact Us page — critical for beta trust
// Route: /contact

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production wire to Mailgun/Firebase Functions
    // For beta: mailto fallback
    const mailto = `mailto:hello@lynkapp.net?subject=${encodeURIComponent('[' + form.subject + '] ' + form.name)}&body=${encodeURIComponent(form.message + '\n\nFrom: ' + form.email)}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 12, padding: '12px 16px',
    color: '#f1f5f9', fontSize: 15,
    outline: 'none',
  };

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
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link to="/" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: 14 }}>
          ← Back to Home
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Contact Us</span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>

        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8,
          background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Get In Touch
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, marginBottom: 40 }}>
          Whether you're a beta tester, press, investor, or potential partner — we'd love to hear from you.
        </p>

        {/* Quick contact cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 48 }}>
          {[
            { icon: '🐛', title: 'Beta Feedback', desc: 'Report bugs or suggest features', href: null, action: 'Use in-app feedback button' },
            { icon: '📰', title: 'Press / Media', desc: 'Media kit and press inquiries', href: 'mailto:press@lynkapp.net' },
            { icon: '🤝', title: 'Partnerships', desc: 'Business and creator collabs', href: 'mailto:partners@lynkapp.net' },
            { icon: '💼', title: 'Investors', desc: 'Funding and investor relations', href: 'mailto:investors@lynkapp.net' },
          ].map(c => (
            <div key={c.title} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 12 }}>{c.desc}</div>
              {c.href ? (
                <a href={c.href} style={{ color: '#a78bfa', fontSize: 13, textDecoration: 'none' }}>
                  {c.href.replace('mailto:', '')}
                </a>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{c.action}</span>
              )}
            </div>
          ))}
        </div>

        {/* General contact form */}
        {submitted ? (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 16, padding: 32, textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Message Sent!</h3>
            <p style={{ color: 'rgba(255,255,255,0.65)' }}>
              Your email client should have opened. If not, email us directly at{' '}
              <a href="mailto:hello@lynkapp.net" style={{ color: '#a78bfa' }}>hello@lynkapp.net</a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: 32,
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Send a General Message</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Name</label>
                <input style={inputStyle} placeholder="Your name" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Email</label>
                <input style={inputStyle} type="email" placeholder="you@example.com" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Subject</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                <option value="general">General Inquiry</option>
                <option value="press">Press / Media</option>
                <option value="partnership">Partnership</option>
                <option value="investment">Investment</option>
                <option value="beta">Beta Program</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Message</label>
              <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
                placeholder="Tell us what's on your mind..." required
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>

            <button type="submit" style={{
              width: '100%',
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              color: 'white', border: 'none', borderRadius: 50,
              padding: '14px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            }}>
              Send Message ✉️
            </button>
            <p style={{ textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              This opens your email client — no data is sent to our servers via this form
            </p>
          </form>
        )}

        {/* Direct email */}
        <div style={{ textAlign: 'center', marginTop: 40, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          Or email us directly:{' '}
          <a href="mailto:hello@lynkapp.net" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
            hello@lynkapp.net
          </a>
        </div>

        {/* Footer links */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 32, marginTop: 48,
          display: 'flex', gap: 24, flexWrap: 'wrap',
          color: 'rgba(255,255,255,0.5)', fontSize: 13,
        }}>
          <Link to="/about" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>About Us</Link>
          <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms</Link>
          <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy</Link>
          <Link to="/cookie-policy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
}
