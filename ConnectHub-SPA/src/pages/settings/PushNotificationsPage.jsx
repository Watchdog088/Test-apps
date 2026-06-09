// src/pages/settings/PushNotificationsPage.jsx
// MISSING #1 — Push Notification Permission Dashboard
// Shows device permission state + allows enabling/managing push notifications

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const S = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0f0c29,#1a1a3e)', padding: '20px 16px 100px', color: '#f1f5f9' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 800, color: '#f1f5f9' },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: 20, marginBottom: 16 },
  statusBadge: (color) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: `${color}22`, border: `1px solid ${color}55`, color, fontWeight: 700, fontSize: 13 }),
  btn: { width: '100%', padding: '14px', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 12 },
  btnPrimary: { background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: 'white' },
  btnSecondary: { background: 'rgba(255,255,255,0.08)', color: '#94a3b8' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  label: { fontSize: 15, fontWeight: 600, color: '#e2e8f0' },
  sublabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  toggle: (on) => ({ width: 46, height: 26, borderRadius: 13, background: on ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }),
  toggleDot: (on) => ({ position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }),
  infoBox: (color) => ({ background: `${color}11`, border: `1px solid ${color}33`, borderRadius: 14, padding: '14px 16px', marginTop: 12 }),
};

const PREF_TYPES = [
  { key: 'messages',      icon: '💬', label: 'Messages',           sub: 'New messages & replies' },
  { key: 'matches',       icon: '❤️', label: 'Dating Matches',      sub: 'When you get a new match' },
  { key: 'likes',         icon: '👍', label: 'Likes & Reactions',   sub: 'When someone reacts to your posts' },
  { key: 'comments',      icon: '💭', label: 'Comments',            sub: 'When someone comments' },
  { key: 'live',          icon: '🔴', label: 'Live Streams',        sub: 'When followed creators go live' },
  { key: 'events',        icon: '📅', label: 'Events',              sub: 'Event reminders & updates' },
  { key: 'marketplace',   icon: '🛒', label: 'Marketplace',         sub: 'Orders, offers, messages' },
  { key: 'system',        icon: '🔔', label: 'System Alerts',        sub: 'Security, account, and updates' },
];

export default function PushNotificationsPage() {
  const navigate = useNavigate();
  const [permission, setPermission] = useState('default'); // 'default' | 'granted' | 'denied'
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    messages: true, matches: true, likes: false,
    comments: false, live: true, events: true, marketplace: true, system: true,
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    // Load saved prefs
    try {
      const saved = JSON.parse(localStorage.getItem('lynk_notif_prefs') || '{}');
      if (Object.keys(saved).length) setPrefs(p => ({ ...p, ...saved }));
    } catch {}
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications.');
      return;
    }
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        // In production: register with OneSignal here
        // window.OneSignal?.setDefaultNotificationUrl(window.location.origin);
        localStorage.setItem('lynk_push_granted', '1');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem('lynk_notif_prefs', JSON.stringify(next));
  };

  const statusColor = permission === 'granted' ? '#22c55e' : permission === 'denied' ? '#ef4444' : '#f59e0b';
  const statusLabel = permission === 'granted' ? '✅ Enabled' : permission === 'denied' ? '🚫 Blocked' : '⏳ Not Asked';

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <div>
          <div style={S.title}>Push Notifications</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Manage device notification permissions</div>
        </div>
      </div>

      {/* Permission Status Card */}
      <div style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Device Permission</div>
          <div style={S.statusBadge(statusColor)}>{statusLabel}</div>
        </div>

        {permission === 'default' && (
          <>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 8px' }}>
              Enable push notifications to get instant alerts for messages, matches, and live streams — even when the app is in the background.
            </p>
            <button
              style={{ ...S.btn, ...S.btnPrimary }}
              onClick={requestPermission}
              disabled={loading}
            >
              {loading ? '⏳ Requesting...' : '🔔 Enable Push Notifications'}
            </button>
          </>
        )}

        {permission === 'granted' && (
          <div style={S.infoBox('#22c55e')}>
            <div style={{ fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>Push notifications are active!</div>
            <div style={{ fontSize: 13, color: '#86efac' }}>You'll receive alerts based on your preferences below.</div>
          </div>
        )}

        {permission === 'denied' && (
          <>
            <div style={S.infoBox('#ef4444')}>
              <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>Notifications are blocked</div>
              <div style={{ fontSize: 13, color: '#fca5a5', lineHeight: 1.6 }}>
                You previously blocked notifications for this site. To re-enable:
              </div>
              <ol style={{ fontSize: 13, color: '#fca5a5', marginTop: 8, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Click the 🔒 lock icon in your browser's address bar</li>
                <li>Find "Notifications" and set it to "Allow"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </>
        )}
      </div>

      {/* Notification Type Preferences — only show if granted */}
      {permission === 'granted' && (
        <div style={S.card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Notification Types</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Choose what you want to be notified about</div>
          {PREF_TYPES.map((t, i) => (
            <div key={t.key} style={{ ...S.row, borderBottom: i < PREF_TYPES.length - 1 ? S.row.borderBottom : 'none' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <div>
                  <div style={S.label}>{t.label}</div>
                  <div style={S.sublabel}>{t.sub}</div>
                </div>
              </div>
              <button style={S.toggle(prefs[t.key])} onClick={() => togglePref(t.key)} aria-label={`Toggle ${t.label}`}>
                <div style={S.toggleDot(prefs[t.key])} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quiet Hours Link */}
      <div style={S.card}>
        <button
          onClick={() => navigate('/settings/notifications/quiet-hours')}
          style={{ ...S.btn, ...S.btnSecondary, marginTop: 0 }}
        >
          🌙 Set Quiet Hours
        </button>
        <button
          onClick={() => navigate('/settings/notifications')}
          style={{ ...S.btn, ...S.btnSecondary }}
        >
          ⚙️ In-App Notification Settings
        </button>
      </div>
    </div>
  );
}
