import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '@fb/config';
import useAppStore from '@store/useAppStore';
import { timeAgo } from '@utils/timeAgo';

const PAGE_SIZE = 10;

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="card" style={{margin:'8px 12px',cursor:'default'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
        <div className="avatar avatar-md" style={{background:'linear-gradient(135deg,#6366f1,#ec4899)'}}>
          {(post.authorName||'U')[0].toUpperCase()}
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:'14px'}}>{post.authorName||'User'}</div>
          <div style={{color:'#64748b',fontSize:'12px'}}>{timeAgo(post.createdAt)}</div>
        </div>
      </div>
      {post.text && <p style={{fontSize:'15px',lineHeight:1.5,marginBottom:'10px'}}>{post.text}</p>}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="post" style={{width:'100%',borderRadius:'12px',marginBottom:'10px',objectFit:'cover',maxHeight:'300px'}}
          onError={e=>e.target.style.display='none'} loading="lazy" />
      )}
      <div style={{display:'flex',gap:'16px',borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'10px'}}>
        {[
          {icon: liked ? '❤️' : '🤍', label: (post.likesCount||0) + (liked?1:0), action: ()=>setLiked(!liked)},
          {icon:'💬', label: post.commentsCount||0},
          {icon:'🔁', label: post.sharesCount||0},
        ].map(({icon,label,action},i) => (
          <button key={i} onClick={action}
            style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'13px',color:'#94a3b8',padding:'2px 6px',borderRadius:'8px'}}>
            <span>{icon}</span><span>{label}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

function SkeletonPost() {
  return (
    <div style={{margin:'8px 12px',padding:'16px',background:'rgba(255,255,255,0.05)',borderRadius:'16px'}}>
      <div style={{display:'flex',gap:'10px',marginBottom:'12px'}}>
        <div className="skeleton" style={{width:44,height:44,borderRadius:'50%'}}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:'6px'}}>
          <div className="skeleton" style={{height:12,width:'40%',borderRadius:6}}/>
          <div className="skeleton" style={{height:10,width:'25%',borderRadius:6}}/>
        </div>
      </div>
      <div className="skeleton" style={{height:12,width:'90%',borderRadius:6,marginBottom:6}}/>
      <div className="skeleton" style={{height:12,width:'75%',borderRadius:6}}/>
    </div>
  );
}

export default function FeedPage() {
  const { feedPosts, setFeedPosts, appendFeedPosts, feedLastDoc, feedLoading, setFeedLoading } = useAppStore();
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (afterDoc = null) => {
    if (feedLoading) return;
    setFeedLoading(true);
    try {
      let q = query(collection(db, 'posts'), orderBy('createdAt','desc'), limit(PAGE_SIZE));
      if (afterDoc) q = query(collection(db,'posts'), orderBy('createdAt','desc'), startAfter(afterDoc), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const last = snap.docs[snap.docs.length - 1] || null;
      if (afterDoc) appendFeedPosts(docs, last);
      else          setFeedPosts(docs);
      setHasMore(docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('[FeedPage] load error:', err);
    } finally {
      setFeedLoading(false);
    }
  }, [feedLoading]);

  useEffect(() => { if (feedPosts.length === 0) loadPosts(); }, []);

  function handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !feedLoading) {
      loadPosts(feedLastDoc);
    }
  }

  return (
    <div onScroll={handleScroll} style={{height:'100%',overflowY:'auto',paddingBottom:'16px'}}>
      <div style={{padding:'12px 12px 0',display:'flex',justifyContent:'flex-end'}}>
        <button style={{
          background:'linear-gradient(135deg,#6366f1,#ec4899)',color:'white',
          border:'none',borderRadius:'12px',padding:'8px 16px',fontWeight:600,fontSize:'13px',
        }}>➕ New Post</button>
      </div>

      {feedLoading && feedPosts.length === 0
        ? Array(3).fill(0).map((_,i) => <SkeletonPost key={i} />)
        : feedPosts.length === 0
          ? (
            <div className="empty-state">
              <div className="icon">📰</div>
              <h3>Your feed is empty</h3>
              <p>Follow people to see their posts here, or create the first post!</p>
            </div>
          )
          : feedPosts.map(p => <PostCard key={p.id} post={p} />)
      }

      {feedLoading && feedPosts.length > 0 && (
        <div style={{textAlign:'center',padding:'16px',color:'#64748b',fontSize:'14px'}}>Loading more…</div>
      )}
      {!hasMore && feedPosts.length > 0 && (
        <div style={{textAlign:'center',padding:'16px',color:'#64748b',fontSize:'13px'}}>You're all caught up! 🎉</div>
      )}
    </div>
  );
}
