import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

export default function FollowingPage() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const targetUid = uid || user?.uid;
  const isOwnPage = targetUid === user?.uid;

  useEffect(() => {
    if (!targetUid) return;
    const load = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'users', targetUid));
        const followingIds = profileDoc.data()?.following || [];
        if (followingIds.length === 0) { setLoading(false); return; }
        const users = await Promise.all(
          followingIds.slice(0, 50).map(id => getDoc(doc(db, 'users', id)))
        );
        setFollowing(users.filter(d => d.exists()).map(d => ({ uid: d.id, ...d.data() })));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, [targetUid]);

  const unfollow = async (targetId) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { following: arrayRemove(targetId) });
      await updateDoc(doc(db, 'users', targetId), { followers: arrayRemove(user.uid) });
      setFollowing(f => f.filter(u => u.uid !== targetId));
    } catch (e) { console.error(e); }
  };

  const filtered = following.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
        <h1 style={styles.title}>Following</h1>
        <span style={styles.count}>{following.length}</span>
      </div>
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input style={styles.search} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search following..." />
      </div>
      <div style={styles.list}>
        {loading && [1,2,3,4,5].map(i => <div key={i} style={styles.skeleton} />)}
        {!loading && filtered.length === 0 && (
          <div style={styles.empty}>
            <div style={{ fontSize: 48 }}>👥</div>
            <div style={styles.emptyTitle}>{isOwnPage ? "You're not following anyone yet" : "Not following anyone yet"}</div>
            {isOwnPage && <button onClick={() => navigate('/friends/find')} style={styles.discoverBtn}>Discover People</button>}
          </div>
        )}
        {filtered.map(u => (
          <div key={u.uid} style={styles.userRow}>
            <div style={styles.avatar} onClick={() => navigate(`/profile/${u.uid}`)}>
              {u.photoURL ? <img src={u.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : <span style={styles.avatarInitial}>{(u.displayName || 'U')[0]}</span>}
            </div>
            <div style={styles.userInfo} onClick={() => navigate(`/profile/${u.uid}`)}>
              <div style={styles.displayName}>{u.displayName || 'Unknown'}{u.verified && ' ✓'}</div>
              <div style={styles.username}>@{u.username || u.uid.slice(0,8)}</div>
              {u.bio && <div style={styles.bio}>{u.bio.slice(0,60)}{u.bio.length>60?'...':''}</div>}
            </div>
            {isOwnPage && (
              <button onClick={() => unfollow(u.uid)} style={styles.unfollowBtn}>Following</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui,sans-serif', paddingBottom: 80 },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 },
  backBtn: { background: 'none', border: 'none', color: '#8b5cf6', fontSize: 22, cursor: 'pointer' },
  title: { flex: 1, margin: 0, fontSize: 20, fontWeight: 700 },
  count: { background: '#1e1e1e', borderRadius: 12, padding: '2px 10px', fontSize: 13, color: '#aaa' },
  searchWrap: { position: 'relative', margin: '12px 20px' },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 },
  search: { width: '100%', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 24, padding: '10px 16px 10px 36px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  list: { padding: '0 20px' },
  skeleton: { height: 68, background: 'linear-gradient(90deg,#1e1e1e 25%,#2a2a2a 50%,#1e1e1e 75%)', borderRadius: 12, marginBottom: 10, animation: 'shimmer 1.2s infinite' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, color: '#666' },
  discoverBtn: { background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 24, fontSize: 14, cursor: 'pointer', fontWeight: 600, marginTop: 8 },
  userRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #1a1a1a' },
  avatar: { width: 48, height: 48, borderRadius: '50%', background: '#1e1e1e', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' },
  avatarInitial: { fontSize: 18, fontWeight: 700, color: '#8b5cf6' },
  userInfo: { flex: 1, cursor: 'pointer' },
  displayName: { fontWeight: 700, fontSize: 15 },
  username: { color: '#666', fontSize: 13, marginTop: 1 },
  bio: { color: '#aaa', fontSize: 12, marginTop: 2 },
  unfollowBtn: { background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: 600, flexShrink: 0 },
};
