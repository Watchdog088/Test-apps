// LiveCohostPage.jsx — /live/cohost
// SECTION-4 FIX: Co-host invite setup page
// Allows a streamer to invite a friend to co-stream via Firestore cohostInvites collection.
// The Cloud Function notifyCoHostInvite (already in functions/index.js) fires FCM push to invitee.

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  collection, addDoc, onSnapshot, query, where,
  serverTimestamp, updateDoc, doc, getDocs, limit,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const STATUSES = { pending: '⏳ Pending', accepted: '✅ Accepted', declined: '❌ Declined', joined: '🎤 Joined' };

export default function LiveCohostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const streamId = searchParams.get('stream') || '';
  const showToast = useAppStore(s => s.showToast);
  const uid = auth.currentUser?.uid;

  const [inviteeName, setInviteeName] = useState('');
  const [sending, setSending] = useState(false);
  const [invites, setInvites] = useState([]);
  const [myInvite, setMyInvite] = useState(null); // invite sent TO me

  // Load outgoing invites I sent
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'cohostInvites'), where('inviterUid', '==', uid));
    const unsub = onSnapshot(q, snap => {
      setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [uid]);

  // Load incoming invites for me
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'cohostInvites'), where('inviteeId', '==', uid), where('status', '==', 'pending'), limit(1));
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) setMyInvite({ id: snap.docs[0].id, ...snap.docs[0].data() });
      else setMyInvite(null);
    });
    return () => unsub();
  }, [uid]);

  const sendInvite = async () => {
    if (!inviteeName.trim()) { showToast('Enter a username'); return; }
    if (!streamId) { showToast('No stream selected — go live first'); return; }
    setSending(true);
    try {
      await addDoc(collection(db, 'cohostInvites'), {
        inviterUid: uid,
        inviterName: auth.currentUser?.displayName || 'Streamer',
        inviteeName: inviteeName.trim(),
        streamId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      showToast(`📨 Co-host invite sent to @${inviteeName.trim()}`);
      setInviteeName('');
    } catch { showToast('Failed to send invite'); }
    finally { setSending(false); }
  };

  const respondInvite = async (accept) => {
    if (!myInvite) return;
    try {
      await updateDoc(doc(db, 'cohostInvites', myInvite.id), {
        status: accept ? 'accepted' : 'declined',
        respondedAt: serverTimestamp(),
      });
      if (accept) {
        showToast('✅ Co-host accepted! Join the stream with camera on.');
        navigate(`/live/watch/${myInvite.streamId}?guestJoin=1`);
      } else {
        showToast('Declined co-host invite');
        setMyInvite(null);
      }
    } catch { showToast('Failed to respond'); }
  };

  const S = { background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px', color:'#f1f5f9' };
  const card = { background:'#1e293b', borderRadius:'14px', padding:'16px', marginBottom:'12px' };
  const input = { width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'10px',
    padding:'10px 14px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' };
  const btn = (grad) => ({ background: grad || '#334155', border:'none', borderRadius:'10px',
    padding:'10px 18px', color:'white', fontWeight:700, fontSize:'14px', cursor:'pointer' });

  return (
    <div style={S}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate('/live')} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <div>
          <div style={{ fontWeight:800, fontSize:'16px' }}>🎤 Co-Host Setup</div>
          <div style={{ color:'#64748b', fontSize:'11px' }}>Invite a friend to co-stream with you</div>
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {/* Incoming invite */}
        {myInvite && (
          <div style={{ ...card, border:'2px solid #6366f1', background:'rgba(99,102,241,0.1)', marginBottom:'16px' }}>
            <div style={{ fontWeight:800, fontSize:'14px', color:'#818cf8', marginBottom:'6px' }}>📨 Co-Host Invitation</div>
            <div style={{ color:'#94a3b8', fontSize:'13px', marginBottom:'12px' }}>
              <strong style={{ color:'#f1f5f9' }}>{myInvite.inviterName}</strong> is inviting you to co-host their live stream.
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => respondInvite(true)} style={btn('linear-gradient(135deg,#22c55e,#16a34a)')}>✅ Accept</button>
              <button onClick={() => respondInvite(false)} style={btn('#ef4444')}>❌ Decline</button>
            </div>
          </div>
        )}

        {/* Send invite */}
        <div style={card}>
          <div style={{ fontWeight:700, fontSize:'14px', marginBottom:'12px' }}>Invite a Co-Host</div>
          {!streamId && (
            <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)',
              borderRadius:'8px', padding:'8px 12px', marginBottom:'12px', fontSize:'12px', color:'#f59e0b' }}>
              ⚠️ You must be live to send co-host invites. <button onClick={() => navigate('/live/setup')}
                style={{ background:'none', border:'none', color:'#818cf8', fontWeight:700, cursor:'pointer', fontSize:'12px' }}>
                Go Live →
              </button>
            </div>
          )}
          <div style={{ marginBottom:'10px' }}>
            <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'6px' }}>Username</div>
            <input
              style={input}
              value={inviteeName}
              onChange={e => setInviteeName(e.target.value)}
              placeholder="@username"
              onKeyDown={e => e.key === 'Enter' && sendInvite()}
            />
          </div>
          <button onClick={sendInvite} disabled={sending || !streamId}
            style={{ ...btn('linear-gradient(135deg,#6366f1,#818cf8)'), opacity: sending || !streamId ? 0.5 : 1 }}>
            {sending ? 'Sending…' : '📨 Send Invite'}
          </button>
        </div>

        {/* How it works */}
        <div style={card}>
          <div style={{ fontWeight:700, fontSize:'14px', marginBottom:'10px' }}>How Co-Hosting Works</div>
          {[
            ['1', 'You invite a friend by username while you are live'],
            ['2', 'They receive a push notification to accept'],
            ['3', 'When they accept, they join with camera + mic enabled'],
            ['4', 'Both of you appear on screen — your stream, their camera in a split'],
            ['5', 'Either of you can end co-host at any time'],
          ].map(([n, t]) => (
            <div key={n} style={{ display:'flex', gap:'10px', marginBottom:'8px' }}>
              <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'#6366f1',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:800, flexShrink:0 }}>{n}</div>
              <div style={{ color:'#94a3b8', fontSize:'12px', lineHeight:'1.5' }}>{t}</div>
            </div>
          ))}
        </div>

        {/* Sent invites */}
        {invites.length > 0 && (
          <div>
            <div style={{ fontWeight:700, fontSize:'13px', color:'#64748b', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Sent Invites</div>
            {invites.map(inv => (
              <div key={inv.id} style={{ ...card, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:'13px' }}>@{inv.inviteeName}</div>
                  <div style={{ fontSize:'11px', color:'#64748b' }}>Stream: {inv.streamId?.slice(0, 8)}…</div>
                </div>
                <div style={{ fontSize:'12px', color: inv.status === 'accepted' ? '#22c55e' : inv.status === 'declined' ? '#ef4444' : '#f59e0b' }}>
                  {STATUSES[inv.status] || inv.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
