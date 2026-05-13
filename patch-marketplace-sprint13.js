/**
 * patch-marketplace-sprint13.js
 * Applies all remaining UX gap fixes from "What Still Needs To Be Done" doc.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ConnectHub-SPA/src/pages/marketplace/MarketplacePage.jsx');
let code = fs.readFileSync(filePath, 'utf8');

let changeCount = 0;

function replace(search, replacement, label) {
  if (code.includes(search)) {
    code = code.replace(search, replacement);
    console.log(`✅ Applied: ${label}`);
    changeCount++;
  } else {
    console.log(`⚠️  SKIP (not found): ${label}`);
  }
}

// ── FIX 1: Add catScrollRef ───────────────────────────────────────
replace(
  `  const chatBottomRef   = useRef(null);
  const chatUnsubRef    = useRef(null); // BE-06`,
  `  const chatBottomRef   = useRef(null);
  const chatUnsubRef    = useRef(null); // BE-06
  const catScrollRef    = useRef(null); // category bar scroll arrows`,
  'Add catScrollRef'
);

// ── FIX 2: Category bar — add left/right scroll arrows + aria-pressed ────
replace(
  `          {/* M20: Category chips with right-fade gradient */}
          <div style={{position:'relative'}}>
            <div style={{position:'absolute',right:0,top:0,bottom:0,width:'40px',
              background:'linear-gradient(to right,transparent,#0f172a)',zIndex:1,pointerEvents:'none'}}/>
            <div style={{display:'flex',gap:'8px',padding:'0 16px 12px',overflowX:'auto',scrollbarWidth:'none'}}>
              {CATEGORIES.map(c=>(
                <button key={c} style={S.catChip(category===c)} onClick={()=>{setCategory(c);setVisibleCount(8);}}>
                  {c}
                </button>
              ))}
            </div>
          </div>`,
  `          {/* M20: Category chips with right-fade gradient + scroll arrows */}
          <div style={{position:'relative',display:'flex',alignItems:'center'}}>
            <button aria-label="Scroll categories left"
              onClick={()=>catScrollRef.current?.scrollBy({left:-160,behavior:'smooth'})}
              style={{flexShrink:0,background:'#1e293b',border:'none',borderRadius:'50%',
                width:'28px',height:'28px',color:'#94a3b8',cursor:'pointer',fontSize:'16px',
                display:'flex',alignItems:'center',justifyContent:'center',marginLeft:'8px',zIndex:2}}>‹</button>
            <div style={{position:'relative',flex:1,overflow:'hidden'}}>
              <div style={{position:'absolute',right:0,top:0,bottom:0,width:'32px',
                background:'linear-gradient(to right,transparent,#0f172a)',zIndex:1,pointerEvents:'none'}}/>
              <div ref={catScrollRef}
                style={{display:'flex',gap:'8px',padding:'0 8px 12px',overflowX:'auto',scrollbarWidth:'none'}}>
                {CATEGORIES.map(c=>(
                  <button key={c} role="button" aria-pressed={category===c}
                    style={S.catChip(category===c)} onClick={()=>{setCategory(c);setVisibleCount(8);}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button aria-label="Scroll categories right"
              onClick={()=>catScrollRef.current?.scrollBy({left:160,behavior:'smooth'})}
              style={{flexShrink:0,background:'#1e293b',border:'none',borderRadius:'50%',
                width:'28px',height:'28px',color:'#94a3b8',cursor:'pointer',fontSize:'16px',
                display:'flex',alignItems:'center',justifyContent:'center',marginRight:'8px',zIndex:2}}>›</button>
          </div>`,
  'Category bar scroll arrows + aria-pressed'
);

// ── FIX 3: aria-pressed on product card heart buttons ────────────
replace(
  `                      <button onClick={e=>{e.stopPropagation();toggleWishlist(item.id);}}
                        aria-label={wishlist.has(item.id)?'Remove from wishlist':'Save to wishlist'}
                        style={{position:'absolute',top:'6px',right:'6px',background:'rgba(0,0,0,0.5)',border:'none',borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {wishlist.has(item.id)?'❤️':'🤍'}
                      </button>`,
  `                      <button onClick={e=>{e.stopPropagation();toggleWishlist(item.id);}}
                        aria-label={wishlist.has(item.id)?'Remove from wishlist':'Save to wishlist'}
                        aria-pressed={wishlist.has(item.id)}
                        style={{position:'absolute',top:'6px',right:'6px',background:'rgba(0,0,0,0.5)',border:'none',borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {wishlist.has(item.id)?'❤️':'🤍'}
                      </button>`,
  'aria-pressed on card heart buttons'
);

// ── FIX 4: Wishlist "Clear All" button ───────────────────────────
replace(
  `          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontWeight:700,fontSize:'15px',color:'#f1f5f9'}}>❤️ Wishlist ({wishlistItems.length})</span>
            {wishlistItems.length>0&&(
              <button onClick={()=>{
                generateWishlistShareURL(wishlistItems).then(url=>{
                  if (navigator.share){ navigator.share({title:'My ConnectHub Wishlist',url}).catch(()=>{}); }
                  else { navigator.clipboard?.writeText(url).then(()=>showToast('🔗 Wishlist link copied!')); }
                }).catch(()=>showToast('🔗 Wishlist shared!'));
              }} style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'10px',padding:'6px 12px',color:'#a5b4fc',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                🔗 Share
              </button>
            )}
          </div>`,
  `          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontWeight:700,fontSize:'15px',color:'#f1f5f9'}}>❤️ Wishlist ({wishlistItems.length})</span>
            <div style={{display:'flex',gap:'8px'}}>
              {wishlistItems.length>0&&(
                <>
                  <button onClick={()=>{
                    generateWishlistShareURL(wishlistItems).then(url=>{
                      if (navigator.share){ navigator.share({title:'My ConnectHub Wishlist',url}).catch(()=>{}); }
                      else { navigator.clipboard?.writeText(url).then(()=>showToast('🔗 Wishlist link copied!')); }
                    }).catch(()=>showToast('🔗 Wishlist shared!'));
                  }} style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'10px',padding:'6px 12px',color:'#a5b4fc',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                    🔗 Share
                  </button>
                  <button onClick={()=>{ setWishlist(new Set()); showToast('🗑️ Wishlist cleared'); }}
                    style={{background:'rgba(239,68,68,0.15)',border:'1px solid #ef4444',borderRadius:'10px',padding:'6px 12px',color:'#fca5a5',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>`,
  'Wishlist Clear All button'
);

// ── FIX 5: Inbox — add visible × delete button per conversation ──
replace(
  `          ):displayedChats.map(chat=>(
            <div key={chat.id} style={S.msgItem} onClick={()=>openChat(chat)} role="button" tabIndex={0}
              aria-label={\`Chat with \${chat.name} about \${chat.item}\`} onKeyDown={e=>e.key==='Enter'&&openChat(chat)}>
              <div style={{width:'42px',height:'42px',borderRadius:'50%',background:chat.bg,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'14px',flexShrink:0}}>{chat.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2px'}}>
                  <span style={{fontWeight:700,fontSize:'14px',color:'#f1f5f9'}}>{chat.name}</span>
                  <span style={{fontSize:'11px',color:'#64748b'}}>{chat.time}</span>
                </div>
                <div style={{fontSize:'12px',color:'#64748b',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>Re: {chat.item}</div>
                <div style={{fontSize:'12px',color:'#94a3b8',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{chat.msg}</div>
              </div>
              {chat.unread>0&&<span style={{...S.badge,position:'static',flexShrink:0}}>{chat.unread}</span>}
            </div>
          ))}`,
  `          ):displayedChats.map(chat=>(
            <div key={chat.id} style={{...S.msgItem,position:'relative'}} role="button" tabIndex={0}
              aria-label={\`Chat with \${chat.name} about \${chat.item}\`}
              onClick={()=>openChat(chat)} onKeyDown={e=>e.key==='Enter'&&openChat(chat)}>
              <div style={{width:'42px',height:'42px',borderRadius:'50%',background:chat.bg,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'14px',flexShrink:0}}>{chat.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2px'}}>
                  <span style={{fontWeight:700,fontSize:'14px',color:'#f1f5f9'}}>{chat.name}</span>
                  <span style={{fontSize:'11px',color:'#64748b'}}>{chat.time}</span>
                </div>
                <div style={{fontSize:'12px',color:'#64748b',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>Re: {chat.item}</div>
                <div style={{fontSize:'12px',color:'#94a3b8',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{chat.msg}</div>
              </div>
              {chat.unread>0&&<span style={{...S.badge,position:'static',flexShrink:0,marginRight:'4px'}}>{chat.unread}</span>}
              <button aria-label={\`Delete conversation with \${chat.name}\`}
                onClick={e=>{e.stopPropagation();setSellerChats(prev=>prev.filter(c=>c.id!==chat.id));showToast('🗑️ Conversation deleted');}}
                style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:'8px',
                  padding:'4px 8px',color:'#fca5a5',fontSize:'13px',fontWeight:700,cursor:'pointer',flexShrink:0}}>×</button>
            </div>
          ))}`,
  'Inbox delete × button per conversation'
);

// ── FIX 6: Orders Sales tab — real sold listings ─────────────────
replace(
  `          {ordersView==='sales'?(
            <div style={{textAlign:'center',padding:'40px',color:'#64748b'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>💰</div>
              <div style={{fontWeight:600,color:'#94a3b8'}}>Sales Orders</div>
              <div style={{fontSize:'13px',marginTop:'6px'}}>When buyers purchase your listings, orders appear here.</div>
              <div style={{fontSize:'13px',color:'#6366f1',marginTop:'8px'}}>
                You have {myListings.filter(l=>l.sold).length} sold listing{myListings.filter(l=>l.sold).length!==1?'s':''}
              </div>
            </div>
          ):`,
  `          {ordersView==='sales'?(
            <div>
              {myListings.filter(l=>l.sold).length===0?(
                <div style={{textAlign:'center',padding:'40px',color:'#64748b'}}>
                  <div style={{fontSize:'40px',marginBottom:'12px'}}>💰</div>
                  <div style={{fontWeight:600,color:'#94a3b8'}}>No sales yet</div>
                  <div style={{fontSize:'13px',marginTop:'6px'}}>When buyers purchase your listings, sale orders appear here.</div>
                </div>
              ):myListings.filter(l=>l.sold).map(listing=>(
                <div key={listing.id} style={{background:'#0f172a',borderRadius:'14px',padding:'14px',marginBottom:'12px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:'40px',height:'40px',borderRadius:'10px',background:listing.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>{listing.emoji||listing.avatar||'📦'}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:'13px',color:'#f1f5f9'}}>{listing.title}</div>
                        <div style={{color:'#10b981',fontWeight:700,fontSize:'14px'}}>\${listing.price}</div>
                      </div>
                    </div>
                    <span style={{background:'rgba(16,185,129,0.2)',border:'1px solid #10b981',borderRadius:'8px',padding:'3px 10px',fontSize:'10px',fontWeight:700,color:'#6ee7b7'}}>✅ Sold</span>
                  </div>
                  <div style={{display:'flex',gap:'16px',fontSize:'11px',color:'#64748b',marginBottom:'8px'}}>
                    <span>👁️ {listing.views||0} views</span>
                    <span>❤️ {listing.likes||0} saves</span>
                    <span>📅 {listing.daysListed||5} days listed</span>
                  </div>
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={()=>openMessageFromItem(listing)}
                      style={{flex:1,padding:'8px',borderRadius:'10px',background:'rgba(99,102,241,0.1)',border:'1px solid #6366f1',color:'#a5b4fc',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                      💬 Message Buyer
                    </button>
                    <button onClick={()=>setWriteReviewItem(listing)}
                      style={{flex:1,padding:'8px',borderRadius:'10px',background:'rgba(245,158,11,0.1)',border:'1px solid #f59e0b',color:'#fcd34d',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                      ✍️ Leave Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ):`,
  'Orders Sales tab — real sold listings'
);

// ── FIX 7: "View full profile →" navigate to full seller page ───
replace(
  `                  <div style={{color:'#6366f1',fontSize:'12px',marginTop:'2px'}}>👆 🧑 View full profile →</div>`,
  `                  <button onClick={e=>{e.stopPropagation();navigate('/marketplace/seller/'+encodeURIComponent(itemModal.seller));}}
                    style={{background:'none',border:'none',color:'#6366f1',fontSize:'12px',marginTop:'2px',cursor:'pointer',padding:0,textAlign:'left'}}>
                    👤 View full seller profile →
                  </button>`,
  '"View full profile →" navigate to SellerProfilePage'
);

// ── FIX 8: aria-label on chat messages (sender name for screen readers) ─
replace(
  `                  <div style={{background:msg.from==='seller'?'linear-gradient(135deg,#6366f1,#ec4899)':'#1e293b',
                               borderRadius:msg.from==='seller'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                               padding:'10px 14px',maxWidth:'75%',fontSize:'14px',color:'#f1f5f9'}}>
                    {/* M14: render image or text */}
                    {msg.imageUrl ? <img src={msg.imageUrl} alt="Photo" style={{maxWidth:'180px',borderRadius:'10px',display:'block'}}/> : msg.text}
                  </div>`,
  `                  <div aria-label={\`\${msg.from==='seller'?'You':chatModal.name}: \${msg.imageUrl?'[Photo]':msg.text}\`}
                    style={{background:msg.from==='seller'?'linear-gradient(135deg,#6366f1,#ec4899)':'#1e293b',
                               borderRadius:msg.from==='seller'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                               padding:'10px 14px',maxWidth:'75%',fontSize:'14px',color:'#f1f5f9'}}>
                    {/* M14: render image or text */}
                    {msg.imageUrl ? <img src={msg.imageUrl} alt="Photo" style={{maxWidth:'180px',borderRadius:'10px',display:'block'}}/> : msg.text}
                  </div>`,
  'aria-label on chat message bubbles (screen reader sender name)'
);

// ── FIX 9: Wire CreateListingWizard onPublish to add to state ───
replace(
  `      {/* ════════ M10: CREATE LISTING WIZARD ════════ */}
      <CreateListingWizard open={wizardOpen} onClose={()=>setWizardOpen(false)} />`,
  `      {/* ════════ M10: CREATE LISTING WIZARD ════════ */}
      <CreateListingWizard open={wizardOpen} onClose={()=>setWizardOpen(false)}
        onPublish={(listing)=>{
          const newListing={...listing,id:Date.now(),sold:false,views:0,likes:0,seller:'You',verified:false};
          setBrowseListings(prev=>[newListing,...prev]);
          setMyListings(prev=>[newListing,...prev]);
          setWizardOpen(false);
          showToast('🚀 Listing published!');
        }}/>`,
  'Wire CreateListingWizard onPublish to add listings to local state'
);

// ── FIX 10: Header comment — add Sprint 13 entry ────────────────
replace(
  ` * SPRINT 4 FIXES (still active): BUG-01 through BUG-20
 * SPRINT 6 ADDITIONS: M5 reviews on all 16 listings
 */`,
  ` * SPRINT 4 FIXES (still active): BUG-01 through BUG-20
 * SPRINT 6 ADDITIONS: M5 reviews on all 16 listings
 *
 * SPRINT 13 UX GAP FIXES (May 2026):
 * ✅ Category bar: left/right scroll arrows + aria-pressed on chips
 * ✅ Product card hearts: aria-pressed state
 * ✅ Wishlist: "Clear All" button to bulk-remove all saved items
 * ✅ Inbox: visible × delete button per conversation row
 * ✅ Orders "Sales" tab: now shows real sold listings with stats + actions
 * ✅ "View full profile →": navigates to /marketplace/seller/:name page
 * ✅ Chat messages: aria-label with sender name for screen readers
 * ✅ CreateListingWizard: onPublish wired to add to browseListings + myListings
 */`,
  'Sprint 13 header comment'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log(`\n✅ patch-marketplace-sprint13.js complete — ${changeCount} changes applied.`);
