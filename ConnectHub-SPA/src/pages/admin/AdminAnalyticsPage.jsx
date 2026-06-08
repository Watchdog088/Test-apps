/**
 * AdminAnalyticsPage — Beta-launch analytics dashboard for CEO/admin
 * Route: /admin/analytics
 * Shows DAU/MAU, top content, reports queue, new signups, revenue metrics
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, getCountFromServer, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

const S = {
  page: { minHeight:'100vh', background:'#080810', color:'#fff', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  header: { display:'flex', alignItems:'center', gap:12, padding:'16px 20px', borderBottom:'1px solid #1a1a2e', position:'sticky', top:0, background:'#080810', zIndex:10 },
  backBtn: { background:'none', border:'none', color:'#8b5cf6', fontSize:22, cursor:'pointer' },
  title: { flex:1, margin:0, fontSize:20, fontWeight:700 },
  refreshBtn: { background:'none', border:'1px solid #2a2a3e', color:'#8b5cf6', padding:'6px 16px', borderRadius:20, fontSize:13, cursor:'pointer' },
  grid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, padding:'16px' },
  metricCard: (color) => ({ background:`linear-gradient(135deg,${color}22,${color}11)`, border:`1px solid ${color}33`, borderRadius:16, padding:16 }),
  metricNum: { fontSize:28, fontWeight:800, margin:'4px 0 2px' },
  metricLabel: { fontSize:12, color:'#888', fontWeight:500 },
  metricDelta: (up) => ({ fontSize:11, color: up ? '#22c55e' : '#ef4444', fontWeight:600 }),
  section: { padding:'4px 16px 12px' },
  sectionTitle: { fontSize:13, color:'#666', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 },
  tableRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #111' },
  pill: (color) => ({ background:`${color}22`, color, border:`1px solid ${color}33`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700 }),
  navBtn: { background:'linear-gradient(135deg,#7c3aed,#8b5cf6)', border:'none', color:'#fff', padding:'10px 20px', borderRadius:20, fontSize:13, cursor:'pointer', fontWeight:600 },
};

const now = new Date();
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const startOf7Days = new Date(now - 7 * 86400000);
const startOf30Days = new Date(now - 30 * 86400000);

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalUsers: 0, newUsersToday: 0, newUsers7d: 0, newUsers30d: 0,
    totalPosts: 0, postsToday: 0,
    pendingReports: 0, pendingKYC: 0,
    liveStreams: 0, activeMatches: 0,
    totalOrders: 0, revenueEstimate: 0,
  });
  const [topPosts, setTopPosts] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [
        usersCount, newTodayCount, new7dCount, new30dCount,
        postsCount, postsTodayCount,
        reportsCount, kycCount,
        topPostsSnap, recentReportsSnap,
        ordersCount,
      ] = await Promise.allSettled([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(query(collection(db, 'users'), where('createdAt', '>=', Timestamp.fromDate(startOfDay)))),
        getCountFromServer(query(collection(db, 'users'), where('createdAt', '>=', Timestamp.fromDate(startOf7Days)))),
        getCountFromServer(query(collection(db, 'users'), where('createdAt', '>=', Timestamp.fromDate(startOf30Days)))),
        getCountFromServer(collection(db, 'posts')),
        getCountFromServer(query(collection(db, 'posts'), where('createdAt', '>=', Timestamp.fromDate(startOfDay)))),
        getCountFromServer(query(collection(db, 'reports'), where('status', '==', 'pending'))),
        getCountFromServer(query(collection(db, 'kyc_submissions'), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'posts'), orderBy('likesCount', 'desc'), limit(5))),
        getDocs(query(collection(db, 'reports'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(5))),
        getCountFromServer(collection(db, 'orders')),
      ]);

      setMetrics({
        totalUsers: usersCount.status === 'fulfilled' ? usersCount.value.data().count : 0,
        newUsersToday: newTodayCount.status === 'fulfilled' ? newTodayCount.value.data().count : 0,
        newUsers7d: new7dCount.status === 'fulfilled' ? new7dCount.value.data().count : 0,
        newUsers30d: new30dCount.status === 'fulfilled' ? new30dCount.value.data().count : 0,
        totalPosts: postsCount.status === 'fulfilled' ? postsCount.value.data().count : 0,
        postsToday: postsTodayCount.status === 'fulfilled' ? postsTodayCount.value.data().count : 0,
        pendingReports: reportsCount.status === 'fulfilled' ? reportsCount.value.data().count : 0,
        pendingKYC: kycCount.status === 'fulfilled' ? kycCount.value.data().count : 0,
        totalOrders: ordersCount.status === 'fulfilled' ? ordersCount.value.data().count : 0,
      });

      if (topPostsSnap.status === 'fulfilled') {
        setTopPosts(topPostsSnap.value.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      if (recentReportsSnap.status === 'fulfilled') {
        setRecentReports(recentReportsSnap.value.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) {
      console.error('Analytics load error:', e);
    }
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(() => { loadMetrics(); }, []);

  const metricCards = [
    { label:'Total Users', value: metrics.totalUsers.toLocaleString(), delta:'+'+metrics.newUsersToday+' today', up:true, color:'#8b5cf6' },
    { label:'New (7 days)', value: metrics.newUsers7d.toLocaleString(), delta:'30d: '+metrics.newUsers30d, up:true, color:'#6366f1' },
    { label:'Total Posts', value: metrics.totalPosts.toLocaleString(), delta:'+'+metrics.postsToday+' today', up:true, color:'#ec4899' },
    { label:'Pending Reports', value: metrics.pendingReports, delta: metrics.pendingReports > 10 ? 'Needs attention' : 'On track', up: metrics.pendingReports <= 10, color:'#f59e0b' },
    { label:'KYC Queue', value: metrics.pendingKYC, delta:'Awaiting review', up: metrics.pendingKYC <= 5, color:'#10b981' },
    { label:'Total Orders', value: metrics.totalOrders.toLocaleString(), delta:'Marketplace', up:true, color:'#3b82f6' },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate('/admin')} style={S.backBtn}>←</button>
        <h1 style={S.title}>📊 Analytics</h1>
        <button onClick={loadMetrics} style={S.refreshBtn}>↻ Refresh</button>
      </div>

      <p style={{ padding:'8px 20px', color:'#555', fontSize:11 }}>
        Last updated: {lastRefresh.toLocaleTimeString()}
        {loading && ' • Loading…'}
      </p>

      {/* Metric Grid */}
      <div style={S.grid}>
        {metricCards.map(m => (
          <div key={m.label} style={S.metricCard(m.color)}>
            <p style={S.metricLabel}>{m.label}</p>
            <p style={S.metricNum}>{loading ? '…' : m.value}</p>
            <p style={S.metricDelta(m.up)}>{m.up ? '▲' : '▼'} {m.delta}</p>
          </div>
        ))}
      </div>

      {/* Top Posts */}
      <div style={S.section}>
        <p style={S.sectionTitle}>🔥 Top Posts (by likes)</p>
        {topPosts.length === 0 && <p style={{ color:'#555', fontSize:13 }}>No data yet</p>}
        {topPosts.map((post, i) => (
          <div key={post.id} style={S.tableRow}>
            <div style={{ flex:1, overflow:'hidden' }}>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#e2e8f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                #{i+1} {post.text?.slice(0,50) || 'Media post'}
              </p>
              <p style={{ margin:0, fontSize:11, color:'#666' }}>
                ❤️ {post.likesCount || 0} · 💬 {post.commentsCount || 0} · @{post.authorHandle || 'user'}
              </p>
            </div>
            <button onClick={() => navigate(`/post/${post.id}`)} style={{ ...S.pill('#8b5cf6'), cursor:'pointer', marginLeft:8 }}>View</button>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div style={S.section}>
        <p style={S.sectionTitle}>🚩 Pending Reports</p>
        {recentReports.length === 0 && <p style={{ color:'#555', fontSize:13 }}>No pending reports ✓</p>}
        {recentReports.map(r => (
          <div key={r.id} style={S.tableRow}>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:600 }}>{r.reason}</p>
              <p style={{ margin:0, fontSize:11, color:'#666' }}>{r.contentType} · {r.createdAt?.toDate?.().toLocaleDateString()}</p>
            </div>
            <button onClick={() => navigate('/admin/reports')} style={S.pill('#f59e0b')}>Review</button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={S.section}>
        <p style={S.sectionTitle}>⚡ Quick Actions</p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[
            { label:'👥 Users', path:'/admin/users' },
            { label:'🚩 Reports', path:'/admin/reports' },
            { label:'🪪 KYC Queue', path:'/admin/kyc' },
            { label:'✅ Verify', path:'/admin/verification' },
            { label:'📢 Announce', path:'/admin/announcements' },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={S.navBtn}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
