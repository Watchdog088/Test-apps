/**
 * MISSING DASHBOARDS — All 7 remaining pages built and exported here
 * Pages: WalletPage, NotificationPreferencesPage, BlockedUsersPage,
 *        OrderDetailPage, CreatorAnalyticsDashboard, AccountStatusPage, DataPrivacyPage
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import {
  doc, getDoc, updateDoc, collection, getDocs, query, where, orderBy, limit, deleteDoc
} from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

// ─── Shared helpers ────────────────────────────────────────────────
const S = {
  page: { minHeight:'100vh', background:'#0a0a0a', color:'#fff', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  header: { display:'flex', alignItems:'center', gap:12, padding:'16px 20px', borderBottom:'1px solid #1e1e1e', position:'sticky', top:0, background:'#0a0a0a', zIndex:10 },
  backBtn: { background:'none', border:'none', color:'#8b5cf6', fontSize:22, cursor:'pointer' },
  title: { flex:1, margin:0, fontSize:20, fontWeight:700 },
  card: { background:'#111', borderRadius:16, padding:20, margin:'0 16px 16px', border:'1px solid #1e1e1e' },
  label: { fontSize:13, color:'#666', marginBottom:6, fontWeight:500, textTransform:'uppercase', letterSpacing:0.5 },
  value: { fontSize:16, fontWeight:700 },
  btn: { background:'linear-gradient(135deg,#7c3aed,#8b5cf6)', border:'none', color:'#fff', padding:'12px 24px', borderRadius:24, fontSize:14, cursor:'pointer', fontWeight:600, width:'100%' },
  outlineBtn: { background:'transparent', border:'1px solid #444', color:'#ccc', padding:'10px 20px', borderRadius:20, fontSize:13, cursor:'pointer', fontWeight:600 },
  row: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #1a1a1a' },
  sectionTitle: { padding:'20px 20px 8px', fontSize:13, color:'#666', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 },
  toggle: (on) => ({ width:44, height:24, borderRadius:12, background: on ? '#8b5cf6' : '#333', position:'relative', cursor:'pointer', transition:'background 0.2s', border:'none', flexShrink:0 }),
  toggleDot: (on) => ({ position:'absolute', top:2, left: on ? 20 : 2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }),
};

// ─── 1. WALLET PAGE ─────────────────────────────────────────────────
export function WalletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, pending: 0, lifetime: 0, payouts: [] });
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'wallets', user.uid)).then(d => {
      if (d.exists()) setWallet(d.data());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const sources = [
    { icon:'🎁', label:'Live Gifts', amount: wallet.giftEarnings || 0 },
    { icon:'🛍️', label:'Marketplace Sales', amount: wallet.marketplaceEarnings || 0 },
    { icon:'⭐', label:'Creator Subscriptions', amount: wallet.subscriptionEarnings || 0 },
    { icon:'📢', label:'Ad Revenue', amount: wallet.adEarnings || 0 },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
        <h1 style={S.title}>💰 Wallet</h1>
      </div>

      {/* Balance Hero */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', margin:'16px', borderRadius:20, padding:28, textAlign:'center' }}>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>Available Balance</div>
        <div style={{ fontSize:40, fontWeight:800 }}>${(wallet.balance||0).toFixed(2)}</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:6 }}>Pending: ${(wallet.pending||0).toFixed(2)}</div>
        <button style={{ ...S.btn, marginTop:20, background:'rgba(255,255,255,0.2)', borderRadius:30 }}
          onClick={() => setShowPayoutModal(true)}>Request Payout</button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, margin:'0 16px 16px' }}>
        <div style={{ ...S.card, margin:0, textAlign:'center' }}>
          <div style={S.label}>Lifetime Earned</div>
          <div style={{ ...S.value, color:'#22c55e' }}>${(wallet.lifetime||0).toFixed(2)}</div>
        </div>
        <div style={{ ...S.card, margin:0, textAlign:'center' }}>
          <div style={S.label}>Total Payouts</div>
          <div style={{ ...S.value, color:'#8b5cf6' }}>${(wallet.totalPayouts||0).toFixed(2)}</div>
        </div>
      </div>

      {/* Earnings by source */}
      <div style={S.sectionTitle}>Earnings Breakdown</div>
      <div style={S.card}>
        {sources.map(s => (
          <div key={s.label} style={S.row}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <span>{s.label}</span>
            </div>
            <span style={{ fontWeight:700, color:'#22c55e' }}>${s.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Payout history */}
      <div style={S.sectionTitle}>Payout History</div>
      <div style={S.card}>
        {(wallet.payouts||[]).length === 0
          ? <div style={{ textAlign:'center', color:'#444', padding:20 }}>No payouts yet</div>
          : (wallet.payouts||[]).slice(0,5).map((p,i) => (
            <div key={i} style={S.row}>
              <div><div style={{ fontWeight:600 }}>PayPal / Bank</div><div style={{ fontSize:12, color:'#666' }}>{p.date}</div></div>
              <span style={{ color:'#22c55e', fontWeight:700 }}>-${p.amount}</span>
            </div>
          ))
        }
      </div>

      {/* Link payment method */}
      <div style={{ padding:'0 16px' }}>
        <button style={S.btn} onClick={() => {}}>+ Link PayPal / Bank Account</button>
      </div>
    </div>
  );
}

// ─── 2. NOTIFICATION PREFERENCES ───────────────────────────────────
export function NotificationPreferencesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({
    likes: true, comments: true, newFollower: true, mentions: true,
    messages: true, matchAlert: true, liveStart: true, liveGifts: true,
    marketplaceOrder: true, marketplaceSale: true, eventReminder: true,
    groupActivity: false, weeklyDigest: true, promotions: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(d => {
      if (d.data()?.notifPrefs) setPrefs(p => ({ ...p, ...d.data().notifPrefs }));
    });
  }, [user]);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { notifPrefs: prefs });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { title: 'Social', items: [
      { key:'likes', label:'Likes on your posts', icon:'❤️' },
      { key:'comments', label:'Comments on your posts', icon:'💬' },
      { key:'newFollower', label:'New followers', icon:'👤' },
      { key:'mentions', label:'Mentions & tags', icon:'@' },
    ]},
    { title: 'Messages & Connections', items: [
      { key:'messages', label:'New messages', icon:'✉️' },
      { key:'matchAlert', label:'Dating match alerts', icon:'💕' },
    ]},
    { title: 'Live & Creator', items: [
      { key:'liveStart', label:'Someone goes live', icon:'🔴' },
      { key:'liveGifts', label:'Live gifts received', icon:'🎁' },
    ]},
    { title: 'Marketplace', items: [
      { key:'marketplaceOrder', label:'Order updates', icon:'📦' },
      { key:'marketplaceSale', label:'New sales', icon:'🛍️' },
    ]},
    { title: 'Community', items: [
      { key:'eventReminder', label:'Event reminders', icon:'📅' },
      { key:'groupActivity', label:'Group activity', icon:'👥' },
    ]},
    { title: 'Other', items: [
      { key:'weeklyDigest', label:'Weekly activity digest', icon:'📊' },
      { key:'promotions', label:'Promotions & offers', icon:'🎉' },
    ]},
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
        <h1 style={S.title}>🔔 Notification Preferences</h1>
      </div>
      {sections.map(sec => (
        <div key={sec.title}>
          <div style={S.sectionTitle}>{sec.title}</div>
          <div style={S.card}>
            {sec.items.map(item => (
              <div key={item.key} style={S.row}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:20, width:28 }}>{item.icon}</span>
                  <span style={{ fontSize:15 }}>{item.label}</span>
                </div>
                <button style={S.toggle(prefs[item.key])} onClick={() => toggle(item.key)}>
                  <div style={S.toggleDot(prefs[item.key])} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ padding:'0 16px 20px' }}>
        <button style={{ ...S.btn, background: saved ? '#22c55e' : 'linear-gradient(135deg,#7c3aed,#8b5cf6)' }} onClick={save}>
          {saved ? '✓ Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

// ─── 3. BLOCKED USERS ──────────────────────────────────────────────
export function BlockedUsersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(async d => {
      const blockedIds = d.data()?.blocked || [];
      if (!blockedIds.length) { setLoading(false); return; }
      const users = await Promise.all(blockedIds.slice(0,30).map(id => getDoc(doc(db, 'users', id))));
      setBlocked(users.filter(u => u.exists()).map(u => ({ uid: u.id, ...u.data() })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const unblock = async (uid) => {
    const { arrayRemove } = await import('firebase/firestore');
    await updateDoc(doc(db, 'users', user.uid), { blocked: arrayRemove(uid) });
    setBlocked(b => b.filter(u => u.uid !== uid));
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
        <h1 style={S.title}>🚫 Blocked Users</h1>
        <span style={{ background:'#1e1e1e', borderRadius:12, padding:'2px 10px', fontSize:13, color:'#aaa' }}>{blocked.length}</span>
      </div>
      <div style={{ padding:'12px 20px 4px', color:'#666', fontSize:13 }}>
        Blocked users cannot see your profile, posts, or contact you.
      </div>
      <div style={{ padding:'0 20px' }}>
        {loading && [1,2,3].map(i => <div key={i} style={{ height:64, background:'#1e1e1e', borderRadius:12, marginBottom:10 }} />)}
        {!loading && blocked.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#555' }}>
            <div style={{ fontSize:48 }}>✅</div>
            <div style={{ marginTop:12, fontSize:16 }}>No blocked users</div>
          </div>
        )}
        {blocked.map(u => (
          <div key={u.uid} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #1a1a1a' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:'#1e1e1e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, overflow:'hidden' }}>
              {u.photoURL ? <img src={u.photoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                : (u.displayName||'U')[0]}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700 }}>{u.displayName||'Unknown'}</div>
              <div style={{ fontSize:12, color:'#666' }}>@{u.username||u.uid.slice(0,8)}</div>
            </div>
            <button onClick={() => unblock(u.uid)} style={{ ...S.outlineBtn, color:'#8b5cf6', borderColor:'#8b5cf6' }}>Unblock</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4. ORDER DETAIL PAGE ──────────────────────────────────────────
export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    getDoc(doc(db, 'orders', orderId)).then(d => {
      if (d.exists()) setOrder({ id: d.id, ...d.data() });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orderId]);

  const steps = ['Order Placed', 'Payment Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentStep = order?.status === 'delivered' ? 4 : order?.status === 'shipped' ? 2 : order?.status === 'paid' ? 1 : 0;

  if (loading) return <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ fontSize:32 }}>⏳</div></div>;
  if (!order) return <div style={{ ...S.page, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
    <div style={{ fontSize:48 }}>📭</div>
    <div>Order not found</div>
    <button onClick={() => navigate('/marketplace/orders')} style={{ ...S.btn, width:'auto', padding:'10px 20px' }}>My Orders</button>
  </div>;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
        <h1 style={S.title}>📦 Order #{order.id?.slice(-8)}</h1>
      </div>

      {/* Status tracker */}
      <div style={S.card}>
        <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Order Status</div>
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', top:12, left:12, right:12, height:2, background:'#1e1e1e', zIndex:0 }} />
          <div style={{ position:'absolute', top:12, left:12, height:2, background:'#8b5cf6', zIndex:1, width:`${(currentStep / (steps.length-1)) * 100}%`, transition:'width 0.3s' }} />
          <div style={{ display:'flex', justifyContent:'space-between', position:'relative', zIndex:2 }}>
            {steps.map((step, i) => (
              <div key={step} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, maxWidth:60 }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background: i <= currentStep ? '#8b5cf6' : '#1e1e1e', border:'2px solid', borderColor: i <= currentStep ? '#8b5cf6' : '#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>
                  {i < currentStep ? '✓' : i === currentStep ? '●' : ''}
                </div>
                <div style={{ fontSize:10, color: i <= currentStep ? '#fff' : '#555', textAlign:'center', lineHeight:1.3 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tracking */}
      {order.trackingNumber && (
        <div style={S.card}>
          <div style={S.label}>Tracking Number</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ ...S.value, fontSize:14 }}>{order.trackingNumber}</div>
            <button style={S.outlineBtn} onClick={() => window.open(`https://www.google.com/search?q=${order.carrier}+tracking+${order.trackingNumber}`, '_blank')}>Track 🔗</button>
          </div>
          {order.carrier && <div style={{ fontSize:13, color:'#666', marginTop:4 }}>Carrier: {order.carrier}</div>}
          {order.estimatedDelivery && <div style={{ fontSize:13, color:'#22c55e', marginTop:4 }}>Est. Delivery: {order.estimatedDelivery}</div>}
        </div>
      )}

      {/* Items */}
      <div style={S.sectionTitle}>Items Ordered</div>
      <div style={S.card}>
        {(order.items||[{name: order.productName||'Item', quantity:1, price: order.amount}]).map((item,i) => (
          <div key={i} style={S.row}>
            <div>
              <div style={{ fontWeight:600 }}>{item.name}</div>
              <div style={{ fontSize:12, color:'#666' }}>Qty: {item.quantity||1}</div>
            </div>
            <div style={{ fontWeight:700, color:'#22c55e' }}>${item.price?.toFixed(2)||'0.00'}</div>
          </div>
        ))}
        <div style={{ ...S.row, borderBottom:'none' }}>
          <div style={{ fontWeight:700 }}>Total</div>
          <div style={{ fontWeight:800, color:'#8b5cf6', fontSize:18 }}>${(order.total||order.amount||0).toFixed(2)}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding:'0 16px', display:'flex', gap:10 }}>
        <button style={{ ...S.btn, flex:1 }} onClick={() => navigate(`/messages/new?seller=${order.sellerId}`)}>Contact Seller</button>
        {order.status === 'delivered' && (
          <button style={{ ...S.outlineBtn, flex:1 }} onClick={() => navigate(`/marketplace/review/${order.productId}`)}>Leave Review</button>
        )}
      </div>
    </div>
  );
}

// ─── 5. CREATOR ANALYTICS DASHBOARD ────────────────────────────────
export function CreatorAnalyticsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ followers:0, posts:0, totalViews:0, totalLikes:0, revenue:0, topPost:null });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'creatorStats', user.uid)).then(d => {
      if (d.exists()) setStats(s => ({ ...s, ...d.data() }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const metrics = [
    { icon:'👥', label:'Followers', value: stats.followers?.toLocaleString()||'0', change:'+12%', up:true },
    { icon:'👀', label:'Total Views', value: stats.totalViews?.toLocaleString()||'0', change:'+8%', up:true },
    { icon:'❤️', label:'Total Likes', value: stats.totalLikes?.toLocaleString()||'0', change:'+5%', up:true },
    { icon:'💰', label:'Revenue', value: `$${(stats.revenue||0).toFixed(2)}`, change:'+22%', up:true },
    { icon:'📝', label:'Posts', value: stats.posts?.toLocaleString()||'0', change:'+2', up:true },
    { icon:'🔴', label:'Live Streams', value: stats.liveStreams?.toLocaleString()||'0', change:'+1', up:true },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
        <h1 style={S.title}>📊 Creator Analytics</h1>
      </div>

      {/* Period selector */}
      <div style={{ display:'flex', gap:8, padding:'12px 16px', overflowX:'auto' }}>
        {['week','month','3months','year'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding:'8px 16px', borderRadius:20, border:'none', background: period===p ? '#8b5cf6' : '#1e1e1e', color: period===p ? '#fff' : '#aaa', cursor:'pointer', fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>
            {p==='week'?'7 Days':p==='month'?'30 Days':p==='3months'?'90 Days':'1 Year'}
          </button>
        ))}
      </div>

      {/* Metrics grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 16px 16px' }}>
        {metrics.map(m => (
          <div key={m.label} style={{ ...S.card, margin:0, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:4 }}>{m.icon}</div>
            <div style={{ fontSize:22, fontWeight:800 }}>{loading ? '...' : m.value}</div>
            <div style={{ fontSize:12, color:'#666', marginTop:2 }}>{m.label}</div>
            <div style={{ fontSize:11, color: m.up ? '#22c55e' : '#ef4444', marginTop:4 }}>{m.change}</div>
          </div>
        ))}
      </div>

      {/* Quick links to detailed analytics */}
      <div style={S.sectionTitle}>Detailed Analytics</div>
      <div style={S.card}>
        {[
          { label:'Story Analytics', icon:'📖', path:'/stories/analytics' },
          { label:'Live Stream Stats', icon:'🔴', path:'/live/analytics' },
          { label:'Profile Insights', icon:'👤', path:'/profile/insights' },
          { label:'Marketplace Performance', icon:'🛍️', path:'/marketplace/seller/dashboard' },
        ].map(item => (
          <div key={item.label} style={{ ...S.row, cursor:'pointer' }} onClick={() => navigate(item.path)}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>{item.icon}</span>
              <span style={{ fontSize:15 }}>{item.label}</span>
            </div>
            <span style={{ color:'#666' }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6. ACCOUNT STATUS PAGE ────────────────────────────────────────
export function AccountStatusPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState({ standing:'good', warnings:[], strikes:0, restrictions:[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'accountStatus', user.uid)).then(d => {
      if (d.exists()) setStatus(s => ({ ...s, ...d.data() }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const standingColor = status.standing === 'good' ? '#22c55e' : status.standing === 'warning' ? '#f59e0b' : '#ef4444';

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
        <h1 style={S.title}>🔐 Account Status</h1>
      </div>

      {/* Standing */}
      <div style={{ ...S.card, textAlign:'center', borderColor: standingColor }}>
        <div style={{ fontSize:48, marginBottom:8 }}>
          {status.standing === 'good' ? '✅' : status.standing === 'warning' ? '⚠️' : '🚫'}
        </div>
        <div style={{ fontSize:20, fontWeight:800, color: standingColor, textTransform:'capitalize' }}>{status.standing || 'Good Standing'}</div>
        <div style={{ color:'#666', fontSize:13, marginTop:6 }}>
          {status.standing === 'good' ? 'Your account is in good standing. Keep up the great community behavior!' : 'You have active warnings. Please review community guidelines.'}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, margin:'0 16px 16px' }}>
        <div style={{ ...S.card, margin:0, textAlign:'center' }}>
          <div style={{ fontSize:24, fontWeight:800, color:'#f59e0b' }}>{status.strikes||0}</div>
          <div style={{ fontSize:11, color:'#666', marginTop:2 }}>Strikes</div>
        </div>
        <div style={{ ...S.card, margin:0, textAlign:'center' }}>
          <div style={{ fontSize:24, fontWeight:800 }}>{(status.warnings||[]).length}</div>
          <div style={{ fontSize:11, color:'#666', marginTop:2 }}>Warnings</div>
        </div>
        <div style={{ ...S.card, margin:0, textAlign:'center' }}>
          <div style={{ fontSize:24, fontWeight:800, color:'#22c55e' }}>{status.restrictions?.length ? status.restrictions.length : 0}</div>
          <div style={{ fontSize:11, color:'#666', marginTop:2 }}>Restrictions</div>
        </div>
      </div>

      {/* Warnings list */}
      {(status.warnings||[]).length > 0 && (
        <>
          <div style={S.sectionTitle}>Warning History</div>
          <div style={S.card}>
            {status.warnings.map((w,i) => (
              <div key={i} style={S.row}>
                <div>
                  <div style={{ fontWeight:600, color:'#f59e0b' }}>{w.reason||'Community Guidelines Violation'}</div>
                  <div style={{ fontSize:12, color:'#666' }}>{w.date||'Unknown date'}</div>
                </div>
                <span style={{ fontSize:20 }}>⚠️</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Active restrictions */}
      {(status.restrictions||[]).length > 0 && (
        <>
          <div style={S.sectionTitle}>Active Restrictions</div>
          <div style={S.card}>
            {status.restrictions.map((r,i) => (
              <div key={i} style={S.row}>
                <div style={{ fontWeight:600, color:'#ef4444' }}>{r.type}: {r.description}</div>
                <div style={{ fontSize:12, color:'#666' }}>Expires: {r.expires||'Permanent'}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ padding:'0 16px' }}>
        <button style={{ ...S.outlineBtn, width:'100%', padding:'12px', fontSize:14 }} onClick={() => navigate('/help')}>Appeal a Decision</button>
      </div>
    </div>
  );
}

// ─── 7. DATA & PRIVACY PAGE ────────────────────────────────────────
export function DataPrivacyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [requesting, setRequesting] = useState(false);

  const requestDataDownload = async () => {
    setRequesting(true);
    try {
      const { addDoc, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'dataRequests'), {
        uid: user.uid, email: user.email, type: 'download', status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Data download request submitted! You will receive an email within 30 days.');
    } catch { alert('Request failed. Please try again.'); } finally { setRequesting(false); }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') { alert('Please type DELETE to confirm.'); return; }
    try {
      const { addDoc, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'dataRequests'), {
        uid: user.uid, email: user.email, type: 'delete', status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Account deletion request submitted. Your account will be deleted within 30 days.');
    } catch { alert('Request failed. Please try again.'); }
  };

  const dataCategories = [
    { icon:'👤', label:'Profile Information', desc:'Name, photo, bio, contact info' },
    { icon:'📝', label:'Posts & Content', desc:'All posts, stories, comments you created' },
    { icon:'💬', label:'Messages', desc:'All conversations and messages' },
    { icon:'❤️', label:'Interactions', desc:'Likes, follows, reactions' },
    { icon:'🔍', label:'Search History', desc:'Search queries and browsing data' },
    { icon:'📍', label:'Location Data', desc:'Location used for nearby features' },
    { icon:'📱', label:'Device Info', desc:'Device type, OS, app version' },
    { icon:'📊', label:'Analytics', desc:'Usage patterns and engagement data' },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
        <h1 style={S.title}>🛡️ Data & Privacy</h1>
      </div>

      {/* Your data */}
      <div style={S.sectionTitle}>Data We Collect</div>
      <div style={S.card}>
        {dataCategories.map(d => (
          <div key={d.label} style={S.row}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22, width:28 }}>{d.icon}</span>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>{d.label}</div>
                <div style={{ fontSize:12, color:'#666' }}>{d.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={S.sectionTitle}>Your Rights (GDPR/CCPA)</div>
      <div style={S.card}>
        <div style={{ ...S.row, cursor:'pointer' }} onClick={requestDataDownload}>
          <div>
            <div style={{ fontWeight:600 }}>📥 Download My Data</div>
            <div style={{ fontSize:12, color:'#666' }}>Get a copy of all your data (up to 30 days)</div>
          </div>
          <button style={{ ...S.outlineBtn, whiteSpace:'nowrap' }} disabled={requesting}>{requesting ? '...' : 'Request'}</button>
        </div>
        <div style={{ ...S.row, cursor:'pointer' }} onClick={() => navigate('/settings/privacy')}>
          <div>
            <div style={{ fontWeight:600 }}>🔒 Privacy Settings</div>
            <div style={{ fontSize:12, color:'#666' }}>Control who can see your content</div>
          </div>
          <span style={{ color:'#666' }}>›</span>
        </div>
        <div style={{ ...S.row, cursor:'pointer' }} onClick={() => navigate('/settings/ad-preferences')}>
          <div>
            <div style={{ fontWeight:600 }}>📢 Ad Preferences</div>
            <div style={{ fontSize:12, color:'#666' }}>Manage personalized ads</div>
          </div>
          <span style={{ color:'#666' }}>›</span>
        </div>
      </div>

      {/* Legal links */}
      <div style={S.card}>
        <div style={{ ...S.row, cursor:'pointer' }} onClick={() => navigate('/privacy')}><span>Privacy Policy</span><span>›</span></div>
        <div style={{ ...S.row, cursor:'pointer' }} onClick={() => navigate('/terms')}><span>Terms of Service</span><span>›</span></div>
        <div style={{ ...S.row, borderBottom:'none', cursor:'pointer' }} onClick={() => {}}><span>Cookie Policy</span><span>›</span></div>
      </div>

      {/* Danger zone */}
      <div style={S.sectionTitle}>Danger Zone</div>
      {!showDeleteConfirm ? (
        <div style={{ padding:'0 16px 20px' }}>
          <button onClick={() => setShowDeleteConfirm(true)} style={{ ...S.btn, background:'#ef4444' }}>
            🗑️ Delete My Account
          </button>
        </div>
      ) : (
        <div style={{ ...S.card, borderColor:'#ef4444' }}>
          <div style={{ color:'#ef4444', fontWeight:700, marginBottom:8 }}>⚠️ This action is permanent and cannot be undone.</div>
          <div style={{ color:'#aaa', fontSize:13, marginBottom:12 }}>All your data, posts, messages, and earned credits will be permanently deleted.</div>
          <input
            style={{ width:'100%', background:'#1e1e1e', border:'1px solid #ef4444', borderRadius:8, padding:'10px 14px', color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12 }}
            placeholder="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={e => setDeleteConfirmText(e.target.value)}
          />
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ ...S.outlineBtn, flex:1, padding:'10px' }} onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}>Cancel</button>
            <button style={{ ...S.btn, flex:1, background:'#ef4444' }} onClick={deleteAccount}>Delete Account</button>
          </div>
        </div>
      )}
    </div>
  );
}
