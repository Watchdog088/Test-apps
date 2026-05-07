// LIVE NOTIFICATIONS PAGE — /live/notifications
// BUG-04 FIX: This page was missing, causing 404 on bell icon tap.
// Shows: followers who went live, scheduled stream reminders, raid alerts.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const NOTIF_TYPES = {
  live_start:  { icon:'🔴', label:'went live',          color:'#ef4444' },
  scheduled:   { icon:'📅', label:'scheduled a stream', color:'#f59e0b' },
  raid:        { icon:'⚔️',  label:'raided your channel',color:'#8b5cf6' },
  clip:        { icon:'✂️',  label:'clipped your stream',color:'#06b6d4' },
  milestone:   { icon:'🎉', label:'hit a milestone',    color:'#22c55e' },
};

export default function LiveNotificationsPage() {
  const navigate    = useNavigate();
  const showToast   = useAppStore(s => s.showToast);
  const [notifs,    setNotifs]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');

  useEffect(() => {
    if (!auth.currentUser) { setLoading(false); return; }
    const q = query(
      collection(db, 'liveNotifications'),
      where('recipientId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const markAllRead = async () => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        unreadLiveNotifs: 0,
      });
      showToast('✓ All marked as read');
    } catch { showToast('Could not update'); }
  };

  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter);

  const timeAgo = ts => {
    if (!ts) return '';
    const s = Math.floor((Date.now() - (ts.toMillis ? ts.toMillis() : ts)) / 1000);
    if (s < 60)    return 'just now';
    if (s < 3600)  return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>

      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate('/live')} aria-label="Back to Live"
          style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'22px', cursor:'pointer', padding:'4px' }}>←</button>
        <span style={{ fontSize:'17px', fontWeight:800, color:'#f1f5f9', flex:1 }}>🔔 Live Notifications</span>
        {notifs.length > 0 && (
          <button onClick={markAllRead}
            style={{ background:'none', border:'none', color:'#ef4444', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'6px', padding:'10px 16px', overflowX:'auto', borderBottom:'1px solid #1e293b' }}>
        {[
          { id:'all',       label:'All' },
          { id:'live_start',label:'🔴 Live' },
          { id:'scheduled', label:'📅 Scheduled' },
          { id:'raid',      label:'⚔️ Raids' },
          { id:'milestone', label:'🎉 Milestones' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding:'6px 14px', borderRadius:'20px', border:'none', fontSize:'12px', fontWeight:600,
              cursor:'pointer', flexShrink:0,
              background: filter===f.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b',
              color: filter===f.id ? 'white' : '#94a3b8' }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ padding:'0 16px' }}>

        {loading && (
          <div style={{ padding:'40px', textAlign:'center', color:'#64748b' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>🔴</div>
            Loading notifications…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 16px' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>🔔</div>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'16px', marginBottom:'8px' }}>No notifications yet</div>
            <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'20px' }}>
              Follow streamers to get notified when they go live
            </div>
            <button onClick={() => navigate('/live')}
              style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none', borderRadius:'12px',
                padding:'10px 22px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
              🔴 Browse Live Streams
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ marginTop:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
            {filtered.map(notif => {
              const meta = NOTIF_TYPES[notif.type] || { icon:'🔔', label:'activity', color:'#6366f1' };
              return (
                <div key={notif.id}
                  onClick={() => notif.streamId && navigate(`/live/watch/${notif.streamId}`)}
                  style={{ background: notif.read ? '#1e293b' : 'rgba(239,68,68,0.08)',
                    border: notif.read ? '1px solid #1e293b' : `1px solid ${meta.color}33`,
                    borderRadius:'14px', padding:'12px 14px',
                    cursor: notif.streamId ? 'pointer' : 'default',
                    display:'flex', alignItems:'center', gap:'12px' }}>
                  {/* Avatar / Icon */}
                  <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'#334155',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    fontSize:'20px', overflow:'hidden' }}>
                    {notif.senderAvatarUrl
                      ? <img src={notif.senderAvatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : meta.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:'#f1f5f9', fontSize:'13px', lineHeight:'1.4' }}>
                      <span style={{ fontWeight:700 }}>{notif.senderName || 'Someone'}</span>
                      {' '}<span style={{ color:'#94a3b8' }}>{meta.label}</span>
                      {notif.streamTitle && <span style={{ fontWeight:600 }}> — {notif.streamTitle}</span>}
                    </div>
                    <div style={{ color:'#64748b', fontSize:'11px', marginTop:'2px' }}>
                      {timeAgo(notif.createdAt)}
                    </div>
                  </div>

                  {/* Live badge / CTA */}
                  {notif.type === 'live_start' && notif.streamId && (
                    <div style={{ background:'#ef4444', borderRadius:'8px', padding:'4px 10px',
                      color:'white', fontSize:'11px', fontWeight:800, flexShrink:0 }}>● LIVE</div>
                  )}
                  {!notif.read && (
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: meta.color, flexShrink:0 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Settings link */}
        <div style={{ textAlign:'center', padding:'24px 0', marginTop:'8px' }}>
          <button onClick={() => navigate('/settings')}
            style={{ background:'none', border:'none', color:'#64748b', fontSize:'12px', cursor:'pointer', textDecoration:'underline' }}>
            Manage notification preferences
          </button>
        </div>
      </div>
    </div>
  );
}
