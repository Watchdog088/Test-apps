// HelpPage.jsx — Help & Support hub
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HelpPage() {
  const nav = useNavigate();
  return (
    <div style={{ padding: '24px 20px', color: '#f1f5f9', maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>❓ Help & Support</h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
        Find answers, report issues, or contact our support team.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: '📖', label: 'FAQ', sub: 'Frequently asked questions', path: '/help/faq' },
          { icon: '🎫', label: 'Support Ticket', sub: 'Get help from our team', path: '/help/ticket' },
          { icon: '💬', label: 'Feedback', sub: 'Share your thoughts', path: '/feedback' },
          { icon: '📄', label: 'Terms of Service', sub: 'Read our terms', path: '/terms' },
          { icon: '🔒', label: 'Privacy Policy', sub: 'How we protect your data', path: '/privacy' },
          { icon: '📧', label: 'Contact Us', sub: 'Reach out directly', path: '/contact' },
        ].map(item => (
          <button key={item.path} onClick={() => nav(item.path)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '16px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', color: '#f1f5f9'
            }}>
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{item.label}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{item.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
