// src/pages/settings/SettingsSubPages.jsx
// All 8 settings sub-dashboards in one file, exported individually
// Routes: /settings/privacy, /settings/security, /settings/notifications,
//         /settings/blocked, /settings/data, /settings/linked-accounts,
//         /settings/locale, /settings/payments

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

// ─────────────────────────────────────────────────────────
// Shared header component
function PageHeader({ title, emoji }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
      <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>{emoji} {title}</span>
    </div>
  );
}

function ToggleRow({ label, subtitle, initial = false }) {
  const [on, setOn] = useState(initial);
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{label}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <button onClick={() => setOn(v => !v)} style={{
        width: 48, height: 26, borderRadius: 13, background: on ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0,
      }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: on ? 25 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  );
}

function SelectRow({ label, options, initial }) {
  const [val, setVal] = useState(initial);
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{label}</div>
      <select value={val} onChange={e => setVal(e.target.value)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 12px', color: '#f1f5f9', fontSize: 13, cursor: 'pointer' }}>
        {options.map(o => <option key={o} value={o} style={{ background: '#1a1a2e' }}>{o}</option>)}
      </select>
    </div>
  );
}

function SectionHeader({ label }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 20, marginBottom: 4 }}>{label}</div>;
}

// ─────────────────────────────────────────────────────────
// 1. PRIVACY SETTINGS
export function PrivacySettingsPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Privacy" emoji="🔒" />
      <div style={{ padding: '0 16px' }}>
        <SectionHeader label="Post Visibility" />
        <SelectRow label="Who sees my posts" options={['Everyone', 'Friends Only', 'Only Me']} initial="Everyone" />
        <SelectRow label="Who sees my stories" options={['Everyone', 'Friends Only', 'Close Friends', 'Only Me']} initial="Friends Only" />
        <SelectRow label="Who can tag me" options={['Everyone', 'Friends Only', 'No One']} initial="Friends Only" />
        <SectionHeader label="Profile Visibility" />
        <SelectRow label="Profile visibility" options={['Public', 'Friends Only', 'Private']} initial="Public" />
        <ToggleRow label="Show online status" subtitle="Let others see when you're active" initial={true} />
        <ToggleRow label="Show last seen" subtitle="Display your last active time" initial={false} />
        <SectionHeader label="Messaging" />
        <SelectRow label="Who can message me" options={['Everyone', 'Friends Only', 'No One']} initial="Everyone" />
        <SelectRow label="Who can see my phone number" options={['Everyone', 'Friends Only', 'Only Me']} initial="Only Me" />
        <SectionHeader label="Dating Privacy" />
        <ToggleRow label="Show in dating discovery" subtitle="Appear in other users' dating cards" initial={true} />
        <ToggleRow label="Hide exact location" subtitle="Show region only, not exact distance" initial={false} />
        <div style={{ marginTop: 20 }}>
          <button onClick={() => showToast('✅ Privacy settings saved!', 'success')} style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 2. SECURITY SETTINGS
export function SecuritySettingsPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [sessions] = useState([
    { device: 'iPhone 15 Pro', location: 'New York, NY', current: true, time: 'Now' },
    { device: 'MacBook Pro', location: 'New York, NY', current: false, time: '2h ago' },
    { device: 'Chrome on Windows', location: 'Brooklyn, NY', current: false, time: '3d ago' },
  ]);
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Security" emoji="🛡️" />
      <div style={{ padding: '0 16px' }}>
        <SectionHeader label="Account Security" />
        <button onClick={() => showToast('Password reset email sent!', 'success')} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginBottom: 10 }}>
          🔑 Change Password →
        </button>
        <button onClick={() => showToast('2FA setup coming soon!', 'info')} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginBottom: 10 }}>
          📱 Enable Two-Factor Authentication (Recommended) →
        </button>
        <SectionHeader label="Active Sessions" />
        {sessions.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {s.device.includes('iPhone') ? '📱' : s.device.includes('Mac') ? '💻' : '🖥️'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{s.device} {s.current && <span style={{ fontSize: 10, background: 'rgba(34,197,94,0.2)', color: '#22c55e', borderRadius: 6, padding: '1px 6px' }}>Current</span>}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.location} · {s.time}</div>
            </div>
            {!s.current && <button onClick={() => showToast('Session revoked', 'success')} style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontWeight: 600 }}>Revoke</button>}
          </div>
        ))}
        <button onClick={() => showToast('All other sessions signed out', 'success')} style={{ width: '100%', marginTop: 14, padding: '12px', borderRadius: 14, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Sign Out All Other Devices
        </button>
        <SectionHeader label="Login History" />
        {[['✅ Successful login', 'New York, NY — May 20, 2026'], ['✅ Successful login', 'Brooklyn, NY — May 17, 2026'], ['❌ Failed attempt', 'Unknown — May 14, 2026']].map(([label, detail], i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 13, color: '#f1f5f9' }}>{label}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 3. NOTIFICATION PREFERENCES
export function NotificationPreferencesPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Notifications" emoji="🔔" />
      <div style={{ padding: '0 16px' }}>
        <SectionHeader label="Social Activity" />
        <ToggleRow label="Likes on my posts" initial={true} />
        <ToggleRow label="Comments on my posts" initial={true} />
        <ToggleRow label="New followers" initial={true} />
        <ToggleRow label="Friend requests" initial={true} />
        <ToggleRow label="Mentions (@me)" initial={true} />
        <SectionHeader label="Messages" />
        <ToggleRow label="New direct messages" initial={true} />
        <ToggleRow label="Group messages" initial={true} />
        <ToggleRow label="Message requests" initial={true} />
        <SectionHeader label="Dating" />
        <ToggleRow label="New matches" initial={true} />
        <ToggleRow label="Messages from matches" initial={true} />
        <ToggleRow label="Super Likes received" initial={true} />
        <ToggleRow label="Profile views (Premium)" initial={false} />
        <SectionHeader label="Live & Content" />
        <ToggleRow label="When someone I follow goes live" initial={true} />
        <ToggleRow label="New posts from followed creators" initial={false} />
        <ToggleRow label="Events near me" initial={true} />
        <SectionHeader label="Marketing" />
        <ToggleRow label="Promotions & deals" subtitle="Sales, discounts in the marketplace" initial={false} />
        <ToggleRow label="LynkApp product updates" initial={true} />
        <div style={{ marginTop: 20 }}>
          <button onClick={() => showToast('✅ Notification settings saved!', 'success')} style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 4. BLOCKED USERS
export function BlockedUsersPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [blocked, setBlocked] = useState([
    { uid: 'bk1', name: 'Blocked User 1', emoji: '👤', date: 'May 12, 2026' },
    { uid: 'bk2', name: 'Blocked User 2', emoji: '👤', date: 'April 28, 2026' },
  ]);
  function unblock(uid) {
    setBlocked(prev => prev.filter(u => u.uid !== uid));
    showToast('User unblocked', 'success');
  }
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Blocked Users" emoji="🚫" />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Blocked users cannot see your profile, posts, or message you. You won't see their content either.</div>
        {blocked.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>No blocked users</div>
          </div>
        ) : blocked.map(u => (
          <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{u.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{u.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Blocked on {u.date}</div>
            </div>
            <button onClick={() => unblock(u.uid)} style={{ padding: '7px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Unblock</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 5. DATA & STORAGE
export function DataSettingsPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Data & Storage" emoji="💾" />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>Storage Used</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9' }}>284</span>
            <span style={{ fontSize: 16, color: '#94a3b8' }}>MB</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', marginBottom: 6 }}>
            <div style={{ width: '28%', height: '100%', borderRadius: 3, background: 'linear-gradient(135deg,#6366f1,#ec4899)' }} />
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>284 MB of 1 GB used (28%)</div>
        </div>
        <SectionHeader label="Your Data" />
        <button onClick={() => showToast('📦 Data export requested! You\'ll receive an email within 24h', 'success')} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginBottom: 10 }}>
          📦 Download My Data (GDPR) →
        </button>
        <button onClick={() => showToast('Cache cleared! (42 MB freed)', 'success')} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginBottom: 10 }}>
          🗑️ Clear Cache (42 MB) →
        </button>
        <SectionHeader label="Account Deletion" />
        <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 14, padding: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: 14, color: '#fca5a5', marginBottom: 12 }}>⚠️ Deleting your account is permanent. All data, posts, messages, and matches will be removed after a 30-day cool-off period.</div>
          <button onClick={() => showToast('Account deletion request filed. You have 30 days to cancel.', 'warning')} style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 6. LINKED ACCOUNTS
export function LinkedAccountsPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [accounts, setAccounts] = useState([
    { id: 'google', name: 'Google', icon: '🔵', linked: true, email: 'user@gmail.com' },
    { id: 'apple', name: 'Apple', icon: '🍎', linked: false, email: null },
    { id: 'facebook', name: 'Facebook', icon: '👤', linked: false, email: null },
  ]);
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Linked Accounts" emoji="🔗" />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Link social accounts to sign in faster and share content across platforms.</div>
        {accounts.map(acc => (
          <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{acc.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{acc.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{acc.linked ? acc.email : 'Not connected'}</div>
            </div>
            <button onClick={() => {
              setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, linked: !a.linked } : a));
              showToast(acc.linked ? `${acc.name} disconnected` : `${acc.name} connected!`, 'success');
            }} style={{
              padding: '8px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: acc.linked ? 'rgba(239,68,68,0.12)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
              border: acc.linked ? '1px solid rgba(239,68,68,0.3)' : 'none',
              color: acc.linked ? '#ef4444' : 'white',
            }}>{acc.linked ? 'Disconnect' : 'Connect'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 7. LOCALE / LANGUAGE
export function LocaleSettingsPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [lang, setLang] = useState('English (US)');
  const [region, setRegion] = useState('United States');
  const [timezone, setTimezone] = useState('Eastern Time (UTC-4)');
  const [currency, setCurrency] = useState('USD ($)');
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Language & Region" emoji="🌍" />
      <div style={{ padding: '0 16px' }}>
        <SectionHeader label="Language" />
        <SelectRow label="App Language" options={['English (US)', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Korean', 'Arabic']} initial={lang} />
        <SectionHeader label="Region" />
        <SelectRow label="Country / Region" options={['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil']} initial={region} />
        <SelectRow label="Timezone" options={['Eastern Time (UTC-4)', 'Central Time (UTC-5)', 'Mountain Time (UTC-6)', 'Pacific Time (UTC-7)', 'UTC', 'GMT+1', 'GMT+2']} initial={timezone} />
        <SectionHeader label="Format" />
        <SelectRow label="Currency" options={['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)', 'AUD ($)', 'JPY (¥)']} initial={currency} />
        <SelectRow label="Date Format" options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} initial="MM/DD/YYYY" />
        <SelectRow label="Temperature" options={['Fahrenheit (°F)', 'Celsius (°C)']} initial="Fahrenheit (°F)" />
        <div style={{ marginTop: 20 }}>
          <button onClick={() => showToast('✅ Language & Region saved!', 'success')} style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 8. PAYMENT METHODS
export function PaymentMethodsPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [cards] = useState([
    { id: 'c1', type: 'Visa', last4: '4242', expiry: '12/27', default: true },
    { id: 'c2', type: 'Mastercard', last4: '5555', expiry: '08/25', default: false },
  ]);
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Payment Methods" emoji="💳" />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>Saved Cards</div>
        {cards.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px', marginBottom: 12, border: `1px solid ${c.default ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: c.type === 'Visa' ? 'rgba(30,66,159,0.3)' : 'rgba(235,0,27,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {c.type === 'Visa' ? '💳' : '🃏'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{c.type} •••• {c.last4}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Expires {c.expiry} {c.default && '· Default'}</div>
            </div>
            <button onClick={() => showToast('Card removed', 'info')} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button onClick={() => showToast('Card addition coming soon (Stripe)', 'info')} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(99,102,241,0.15)', border: '1px dashed rgba(99,102,241,0.4)', color: '#818cf8', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>
          + Add New Card
        </button>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>Billing History</div>
        {[['May 2026', 'LynkApp Premium', '$14.99'], ['April 2026', 'LynkApp Premium', '$14.99'], ['April 2026', 'Dating Boost (30min)', '$4.99']].map(([date, desc, amt], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{desc}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{date}</div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{amt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
