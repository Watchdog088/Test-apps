import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const s = {
  page: { padding: '0 0 80px 0', background: '#0f172a', minHeight: '100vh' },
  header: { padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: '20px', fontWeight: 700, color: '#f1f5f9' },
  markAll: { fontSize: '13px', color: '#6366f1', cursor: 'pointer', fontWeight: 600 },
  tabs: { display: 'flex', borderBottom: '1px solid #1e293b', overflowX: 'auto' },
  tab: (active) => ({ padding: '12px 20px', fontSize: '14px', fontWeight: active ? 700 : 500, color: active ? '#6366f1' : '#64748b', borderBottom: active ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }),
  notifItem: (unread) => ({ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', background: unread ? 'rgba(99,102,241,0.06)' : 'transparent', borderBottom: '1px solid #1e293b', cursor: 'pointer' }),
  avatar: { width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder: (color) => ({ width: '44px', height: '44px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }),
  notifContent: { flex: 1 },
  notifText: { fontSize: '14px', color: '#e2e8f0', lineHeight: '1.4' },
  notifUser: { fontWeight: 700 },
  notifTime: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  unreadDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', marginTop: '8px', flexShrink: 0 },
  thumbnail: { width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  sectionLabel: { padding: '10px 16px 6px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: '12px', textAlign: 'center' },
  actionBtn: { background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: 'white', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
};

const TABS = ['All', 'Likes', 'Comments', 'Follows', 'Mentions'];

const avatarColors = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6'];

const DEMO_NOTIFICATIONS = [
  { id: 1, type: 'like', user: 'Jordan M.', text: 'liked your post', time: '2m ago', unread: true, emoji: '🔥', color: '#ec4899', postThumb: '📸' },
  { id: 2, type: 'follow', user: 'Alex Chen', text: 'started following you', time: '15m ago', unread: true, emoji: '👤', color: '#6366f1', action: true },
  { id: 3, type: 'comment', user: 'Riley K.', text: 'commented: "This is so amazing! 🔥"', time: '1h ago', unread: true, emoji: '💬', color: '#10b981', postThumb: '🎵' },
  { id: 4, type: 'mention', user: 'Sam Rivera', text: 'mentioned you in a comment', time: '2h ago', unread: false, emoji: '@', color: '#f59e0b', postThumb: '📝' },
  { id: 5, type: 'like', user: 'Morgan T.', text: 'and 12 others liked your photo', time: '3h ago', unread: false, emoji: '❤️', color: '#ec4899', postThumb: '🌆' },
  { id: 6, type: 'follow', user: 'Casey L.', text: 'started following you', time: '5h ago', unread: false, emoji: '👤', color: '#3b82f6', action: true },
  { id: 7, type: 'comment', user: 'Drew P.', text: 'replied to your comment: "Totally agree!"', time: '8h ago', unread: false, emoji: '💬', color: '#8b5cf6', postThumb: '🎮' },
  { id: 8, type: 'like', user: 'Taylor S.', text: 'liked your story', time: '1d ago', unread: false, emoji: '❤️', color: '#ec4899', postThumb: '✨' },
  { id: 9, type: 'mention', user: 'Jamie Fox', text: 'mentioned you in their post', time: '1d ago', unread: false, emoji: '@', color: '#f59e0b', postThumb: '📢' },
  { id: 10, type: 'follow', user: 'Quinn B.', text: 'started following you', time: '2d ago', unread: false, emoji: '👤', color: '#10b981', action: true },
];

const typeToTab = { like: 'Likes', comment: 'Comments', follow: 'Follows', mention: 'Mentions' };

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [following, setFollowing] = useState({});

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter(n => typeToTab[n.type] === activeTab);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  const toggleFollow = (id) => setFollowing(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.title}>
          Notifications {unreadCount > 0 && <span style={{ fontSize: '14px', background: '#6366f1', color: 'white', borderRadius: '10px', padding: '1px 8px', marginLeft: '6px' }}>{unreadCount}</span>}
        </span>
        {unreadCount > 0 && <span style={s.markAll} onClick={markAllRead}>Mark all read</span>}
      </div>

      <div style={s.tabs}>
        {TABS.map(t => (
          <div key={t} style={s.tab(activeTab === t)} onClick={() => setActiveTab(t)}>{t}</div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: '48px' }}>🔔</div>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>No {activeTab.toLowerCase()} yet</p>
        </div>
      ) : (
        <>
          {filtered.some(n => n.unread) && <div style={s.sectionLabel}>New</div>}
          {filtered.filter(n => n.unread).map(n => <NotifItem key={n.id} n={n} following={following} onFollow={toggleFollow} onNavigate={navigate} />)}
          {filtered.some(n => !n.unread) && <div style={s.sectionLabel}>Earlier</div>}
          {filtered.filter(n => !n.unread).map(n => <NotifItem key={n.id} n={n} following={following} onFollow={toggleFollow} onNavigate={navigate} />)}
        </>
      )}
    </div>
  );
}

function NotifItem({ n, following, onFollow, onNavigate }) {
  return (
    <div style={s.notifItem(n.unread)} onClick={() => n.type === 'follow' ? onNavigate('/profile') : onNavigate('/feed')}>
      <div style={s.avatarPlaceholder(n.color)}>{n.emoji}</div>
      <div style={s.notifContent}>
        <div style={s.notifText}>
          <span style={s.notifUser}>{n.user}</span> {n.text}
        </div>
        <div style={s.notifTime}>{n.time}</div>
      </div>
      {n.action ? (
        <button
          style={{ ...s.actionBtn, background: following[n.id] ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#ec4899)', color: following[n.id] ? '#94a3b8' : 'white', border: following[n.id] ? '1px solid #334155' : 'none' }}
          onClick={e => { e.stopPropagation(); onFollow(n.id); }}
        >
          {following[n.id] ? 'Following' : 'Follow'}
        </button>
      ) : n.postThumb ? (
        <div style={s.thumbnail}>{n.postThumb}</div>
      ) : null}
      {n.unread && <div style={s.unreadDot} />}
    </div>
  );
}
