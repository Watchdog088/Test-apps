// src/pages/legal/CookiePolicyPage.jsx
// BETA FIX (Jun 2026): Added Cookie Policy — required for GDPR/CCPA with AdSense
// Route: /cookie-policy

import React from 'react';
import { Link } from 'react-router-dom';

export default function CookiePolicyPage() {
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
        <span style={{ fontWeight: 700, fontSize: 16 }}>Cookie Policy</span>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8,
          background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Cookie Policy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 40 }}>
          Last updated: June 8, 2026
        </p>

        <PolicySection title="1. What Are Cookies?">
          <p>
            Cookies are small text files that are placed on your device when you visit LynkApp. They help us
            remember your preferences, keep you logged in, and understand how you use our platform so we can
            improve your experience.
          </p>
        </PolicySection>

        <PolicySection title="2. What Cookies We Use">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#a78bfa' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#a78bfa' }}>Examples</th>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#a78bfa' }}>Can Opt Out?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cat: '🔒 Essential', ex: 'Authentication, session management, security tokens', opt: 'No — required for the app to function' },
                { cat: '📊 Analytics', ex: 'Firebase Analytics — page views, session duration, feature usage', opt: 'Yes — via cookie preferences' },
                { cat: '🐛 Error Tracking', ex: 'Sentry — crash reports and error logs (no personal data)', opt: 'Yes — via cookie preferences' },
                { cat: '💼 Advertising', ex: 'Google AdSense — interest-based ads for non-premium users', opt: 'Yes — via cookie preferences or Premium upgrade' },
                { cat: '⚙️ Preferences', ex: 'Theme, language, notification settings', opt: 'Yes — clearing disables saved preferences' },
              ].map(row => (
                <tr key={row.cat} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '12px 0 12px', verticalAlign: 'top', fontWeight: 600, whiteSpace: 'nowrap', paddingRight: 16 }}>{row.cat}</td>
                  <td style={{ padding: '12px 0', color: 'rgba(255,255,255,0.65)', paddingRight: 16 }}>{row.ex}</td>
                  <td style={{ padding: '12px 0', color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{row.opt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PolicySection>

        <PolicySection title="3. Third-Party Cookies">
          <p>The following third-party services may set cookies when you use LynkApp:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            <li><strong>Google Firebase</strong> — Authentication and real-time database (Google Privacy Policy applies)</li>
            <li><strong>Google AdSense</strong> — Advertising for non-premium users (you can opt out via <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>Google Ad Settings</a>)</li>
            <li><strong>Sentry</strong> — Error monitoring (anonymized crash reports only)</li>
            <li><strong>Stripe</strong> — Payment processing (set only on checkout pages)</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. Managing Your Cookie Preferences">
          <p>You have the following options for managing cookies:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            <li><strong>Cookie Consent Banner</strong> — When you first visit LynkApp, you can accept or decline non-essential cookies</li>
            <li><strong>Browser Settings</strong> — You can block or delete cookies through your browser settings</li>
            <li><strong>Opt-Out Links</strong> — For Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>Google Analytics Opt-Out</a></li>
            <li><strong>LynkApp Premium</strong> — Premium subscribers can use LynkApp completely ad-free</li>
          </ul>
          <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Note: Disabling essential cookies will prevent you from logging in and using core features of the app.
          </p>
        </PolicySection>

        <PolicySection title="5. Cookie Retention">
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            <li>Session cookies: Deleted when you close your browser</li>
            <li>Authentication cookies: Up to 30 days (or 1 year with "Remember Me")</li>
            <li>Analytics cookies: Up to 2 years</li>
            <li>Advertising cookies: Up to 2 years (Google manages these)</li>
          </ul>
        </PolicySection>

        <PolicySection title="6. GDPR & CCPA Rights">
          <p>
            If you are in the European Economic Area (EEA) or California (USA), you have the right to:
          </p>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            <li>Access the personal data we hold about you</li>
            <li>Request deletion of your data (see <Link to="/settings/delete-account" style={{ color: '#a78bfa' }}>Delete Account</Link>)</li>
            <li>Withdraw consent for non-essential cookies at any time</li>
            <li>Lodge a complaint with your local data protection authority</li>
          </ul>
        </PolicySection>

        <PolicySection title="7. Contact Us">
          <p>
            If you have questions about this Cookie Policy, contact us at:{' '}
            <a href="mailto:privacy@lynkapp.net" style={{ color: '#a78bfa' }}>privacy@lynkapp.net</a>
          </p>
        </PolicySection>

        {/* Footer links */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 32, marginTop: 48,
          display: 'flex', gap: 24, flexWrap: 'wrap',
          color: 'rgba(255,255,255,0.5)', fontSize: 13,
        }}>
          <Link to="/about" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>About Us</Link>
          <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/contact" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Contact</Link>
        </div>
      </div>
    </div>
  );
}

function PolicySection({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, color: '#e2e8f0' }}>{title}</h2>
      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}
