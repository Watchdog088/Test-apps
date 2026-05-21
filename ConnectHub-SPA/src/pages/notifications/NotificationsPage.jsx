// src/pages/notifications/NotificationsPage.jsx — SECTION 7 COMPLETE (May 2026)
// ─── FIXES APPLIED ─────────────────────────────────────────────────────────
// FIX-N01: Deep-link routing — likes/comments route to /post/:id, follows to /profile/:uid,
//          mentions to /post/:id, system to /feed (no more blanket /feed fallback)
// FIX-N02: Mark all as read — clears visual unread state AND resets store unreadNotifications to 0
// FIX-N03: Badge count — synced to store unreadNotifications on mount + after markAllRead
// FIX-N04: Real-time demo — simulated interval delivers a new notification & triggers in-app toast
// FIX-N05: Mentions tab — now functional via correct typeToTab mapping
// NEW-N01: Activity Summary link added to header settings menu
// NEW-N02: Quiet Hours shortcut added to settings gear

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

// ── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page:    { padding: '0 0 80px 0', background: '#0f172a', minHeight: '100vh' },
  header:  { padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  titleRow:{ display: 'flex', alignItems: 'center', gap: '8px' },
  title:   { fontSize: '20px', fontWeight: 700, color: '#f1f5f9' },
  badge:   { fontSize: '13px', background: '#6366f1', color: 'white', borderRadius: '10px', padding: '2px 8px', fontWeight: 700 },
  actions: { display: 'flex', alignItems: 'center', gap: '12px' },
  markAll: { fontSize: '13px', color: '#6366f1', cursor: 'pointer', fontWeight: 600 },
  settingsIcon: { fontSize: '18px', cursor: 'pointer', opacity: 0.7, padding: '4px' },
  tabs:    { display: 'flex', borderBottom: '1px solid #1e293b', overflowX: 'auto' },
  tab:     (active) => ({ padding: '12px 20px', fontSize: '14px', fontWeight: active ? 700 : 500, color: active ? '#6366f1' : '#64748b', borderBottom: active ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }),
  notifItem: (unread) => ({ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', background: unread ? 'rgba(99,102,241,0.06)' : 'transparent', borderBottom: '1px solid #1e293b', cursor: 'pointer', transition: 'background 0.2s' }),
  avatarPlaceholder: (color) => ({ width: '44px', height: '44px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }),
  notifContent: { flex: 1 },
  notifText:    { fontSize: '14px', color: '#e2e8f0', lineHeight: '1.4' },
  notifUser:    { fontWeight: 700 },
  notifTime:    { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  unreadDot:    { width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', marginTop: '8px', flexShrink: 0 },
  thumbnail:    { width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  sectionLabel: { padding: '10px 16px 6px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  empty:        { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: '12px', textAlign: 'center' },
  actionBtn:    { color: 'white', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  settingsMenu: { position: 'fixed', top: '60px', right: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '8px 0', zIndex: 500, minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  menuItem:     { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', fontSize: '14px', color: '#e2e8f0', cursor: 'pointer' },
};

// ── Data ─────────────────────────────────────────────────────────────────────
const TABS = ['All', 'Likes', 'Comments', 'Follows', 'Mentions'];

// FIX-N05: mentions are now included in typeToTab
const typeToTab = { like: 'Likes', comment: 'Comments', follow: 'Follows', mention: 'Mentions' };

// FIX-N01: Each type maps to a real deep-link path
// postId / uid are fictional demo IDs — would come from Firestore in production
const buildRoute = (n) => {
  switch (n.type) {
    case 'like':    return n.postId ? `/post/${n.postId}` : '/feed';
    case 'comment': return n.postId ? `/post/${n.postId}` : '/feed';
    case 'mention': return n.postId ? `/post/${n.postId}` : '/feed';
    case 'follow':  return n.uid    ? `/profile/${n.uid}` : '/profile';
    case 'system':  return '/settings/notifications';
    default:        return '/feed';
  }
};

const DEMO_NOTIFICATIONS = [
  { id: 1,  type: 'like',    user: 'Jordan M.',  text: 'liked your post',                       time: '2m ago',  unread: true,  emoji: '🔥', color: '#ec4899', postThumb: '📸', postId: 'p001', uid: 'u001' },
  { id: 2,  type: 'follow',  user: 'Alex Chen',  text: 'started following you',                  time: '15m ago', unread: true,  emoji: '👤', color: '#6366f1', action: true,    uid: 'u002' },
  { id: 3,  type: 'comment', user: 'Riley K.',   text: 'commented: "This is so amazing! 🔥"',   time: '1h ago',  unread: true,  emoji: '💬', color: '#10b981', postThumb: '🎵', postId: 'p002', uid: 'u003' },
  { id: 4,  type: 'mention', user: 'Sam Rivera', text: 'mentioned you in a comment',             time: '2h ago',  unread: false, emoji: '@',  color: '#f59e0b', postThumb: '📝', postId: 'p003', uid: 'u004' },
  { id: 5,  type: 'like',    user: 'Morgan T.',  text: 'and 12 others liked your photo',         time: '3h ago',  unread: false, emoji: '❤️', color: '#ec4899', postThumb: '🌆', postId: 'p004', uid: 'u005' },
  { id: 6,  type: 'follow',  user: 'Casey L.',   text: 'started following you',                  time: '5h ago',  unread: false, emoji: '👤', color: '#3b82f6', action: true,    uid: 'u006' },
  { id: 7,  type: 'comment', user: 'Drew P.',    text: 'replied to your comment: "Totally agree!"', time: '8h ago', unread: false, emoji: '💬', color: '#8b5cf6', postThumb: '🎮', postId: 'p005', uid: 'u007' },
  { id: 8,  type: 'like',    user: 'Taylor S.',  text: 'liked your story',                       time: '1d ago',  unread: false, emoji: '❤️', color: '#ec4899', postThumb: '✨', postId: 'p006', uid: 'u008' },
  { id: 9,  type: 'mention', user: 'Jamie Fox',  text: 'mentioned you in their post',            time: '1d ago',  unread: false, emoji: '@',  color: '#f59e0b', postThumb: '📢', postId: 'p007', uid: 'u009' },
  { id: 10, type: 'follow',  user: 'Quinn B.',   text: 'started following you',                  time: '2d ago',  unread: false, emoji: '👤', color: '#10b981', action: true,    uid: 'u010' },
];

// Fake stream of new notifications for demo purposes
const INCOMING_POOL = [
  { type: 'like',    user: 'Nova Lee',    text: 'liked your latest post',        emoji: '🔥', color: '#ec4899', postId: 'p_new1', uid: 'u_new1' },
  { type: 'follow',  user: 'Skyler M.',  text: 'started following you',          emoji: '👤', color: '#6366f1', action: true,    uid: 'u_new2' },
  { type: 'comment', user: 'Zoe D.',     text: 'commented: "Love this 🙌"',     emoji: '💬', color: '#10b981', postId: 'p_new2', uid: 'u_new3' },
  { type: 'mention', user: 'Bex K.',     text: 'mentioned you in a story',       emoji: '@',  color: '#f59e0b', postId: 'p_new3', uid: 'u_new4' },
];

let _incomingIdx = 0;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const setUnreadNotifications = useAppStore((s) => s.setUnreadNotifications);
  const showToast              = useAppStore((s) => s.showToast);

  const [activeTab,      setActiveTab]      = useState('All');
  const [notifications,  setNotifications]  = useState(DEMO_NOTIFICATIONS);
  const [following,      setFollowing]      = useState({});
  const [settingsOpen,   setSettingsOpen]   = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  // FIX-N03: Sync badge count to store on mount and whenever unreadCount changes
  useEffect(() => {
    setUnreadNotifications(unreadCount);
  }, [unreadCount, setUnreadNotifications]);

  // FIX-N04: Simulated real-time notification delivery (demo only)
  // In production: replace with Firestore onSnapshot on user's notifications collection
  useEffect(() => {
    const timer = setInterval(() => {
      const incoming = INCOMING_POOL[_incomingIdx % INCOMING_POOL.length];
      _incomingIdx++;
      const newNotif = {
        id:        Date.now(),
        type:      incoming.type,
        user:      incoming.user,
        text:      incoming.text,
        emoji:     incoming.emoji,
        color:     incoming.color,
        postId:    incoming.postId,
        uid:       incoming.uid,
        action:    incoming.action || false,
        postThumb: incoming.postId ? '🆕' : undefined,
        time:      'just now',
        unread:    true,
      };
      setNotifications(prev => [newNotif, ...prev]);
      // FIX-N04: Trigger in-app toast when new notification arrives
      showToast(`🔔 ${incoming.user} ${incoming.text}`, 'info', 4000);
    }, 30000); // Every 30 seconds (demo)

    return () => clearInterval(timer);
  }, [showToast]);

  // FIX-N02: Mark all as read — clears UI state AND resets store badge to 0
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadNotifications(0);
  }, [setUnreadNotifications]);

  const toggleFollow = (id) => setFollowing(prev => ({ ...prev, [id]: !prev[id] }));

  // FIX-N01: Route to the correct deep-link
  const handleNotifTap = (n) => {
    // Mark individual notification as read
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x));
    navigate(buildRoute(n));
  };

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter(n => typeToTab[n.type] === activeTab);

  const newNotifs    = filtered.filter(n => n.unread);
  const earlierNotifs = filtered.filter(n => !n.unread);

  return (
    <div style={s.page} onClick={() => settingsOpen && setSettingsOpen(false)}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.title}>Notifications</span>
          {unreadCount > 0 && <span style={s.badge}>{unreadCount}</span>}
        </div>
        <div style={s.actions}>
          {unreadCount > 0 && (
            <span style={s.markAll} onClick={markAllRead}>Mark all read</span>
          )}
          <span
            style={s.settingsIcon}
            onClick={(e) => { e.stopPropagation(); setSettingsOpen(o => !o); }}
            title="Notification settings"
          >
            ⚙️
          </span>
        </div>
      </div>

      {/* Settings drop-down */}
      {settingsOpen && (
        <div style={s.settingsMenu} onClick={e => e.stopPropagation()}>
          <div style={s.menuItem} onClick={() => { setSettingsOpen(false); navigate('/settings/notifications'); }}>
            🔔 Notification Preferences
          </div>
          <div style={s.menuItem} onClick={() => { setSettingsOpen(false); navigate('/settings/notifications/quiet-hours'); }}>
            🌙 Quiet Hours
          </div>
          <div style={s.menuItem} onClick={() => { setSettingsOpen(false); navigate('/notifications/activity-summary'); }}>
            📊 Activity Summary
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={s.tabs}>
        {TABS.map(t => (
          <div key={t} style={s.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
            {t}
            {t === 'Mentions' && notifications.filter(n => n.type === 'mention' && n.unread).length > 0 && (
              <span style={{ marginLeft: '5px', background: '#f59e0b', color: 'white', borderRadius: '8px', padding: '0px 5px', fontSize: '11px', fontWeight: 700 }}>
                {notifications.filter(n => n.type === 'mention' && n.unread).length}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: '48px' }}>🔔</div>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>No {activeTab.toLowerCase()} notifications yet</p>
          <p style={{ color: '#64748b', fontSize: '12px' }}>We'll notify you when something happens</p>
        </div>
      ) : (
        <>
          {newNotifs.length > 0 && (
            <>
              <div style={s.sectionLabel}>New</div>
              {newNotifs.map(n => (
                <NotifItem
                  key={n.id}
                  n={n}
                  following={following}
                  onFollow={toggleFollow}
                  onTap={handleNotifTap}
                />
              ))}
            </>
          )}
          {earlierNotifs.length > 0 && (
            <>
              <div style={s.sectionLabel}>Earlier</div>
              {earlierNotifs.map(n => (
                <NotifItem
                  key={n.id}
                  n={n}
                  following={following}
                  onFollow={toggleFollow}
                  onTap={handleNotifTap}
                />
              ))}
            </>
          )}
        </>
      )}

      {/* Activity Summary shortcut */}
      <div
        style={{ margin: '24px 16px', padding: '14px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        onClick={() => navigate('/notifications/activity-summary')}
      >
        <span style={{ fontSize: '24px' }}>📊</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>Weekly Activity Summary</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>See how your content performed this week</div>
        </div>
        <span style={{ marginLeft: 'auto', color: '#6366f1', fontSize: '18px' }}>›</span>
      </div>
    </div>
  );
}

// ── NotifItem Component ───────────────────────────────────────────────────────
function NotifItem({ n, following, onFollow, onTap }) {
  return (
    <div style={s.notifItem(n.unread)} onClick={() => onTap(n)}>
      <div style={s.avatarPlaceholder(n.color)}>{n.emoji}</div>

      <div style={s.notifContent}>
        <div style={s.notifText}>
          <span style={s.notifUser}>{n.user}</span> {n.text}
        </div>
        <div style={s.notifTime}>{n.time}</div>
      </div>

      {n.action ? (
        // FIX-N01: Follow button stop-propagation prevents navigating to profile on follow click
        <button
          style={{
            ...s.actionBtn,
            background: following[n.id] ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#ec4899)',
            color: following[n.id] ? '#94a3b8' : 'white',
            border: following[n.id] ? '1px solid #334155' : 'none',
          }}
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
