/**
 * MarketplacePage.jsx — Full Marketplace matching ConnectHub_Mobile_Design.html
 *
 * CROSS-REFERENCE vs HTML DESIGN:
 * ✅ 4 tabs: Browse | Selling | Wishlist | Messages
 * ✅ Top bar: notifications badge + cart badge
 * ✅ Search bar with live filter
 * ✅ Category filter chips (Browse tab)
 * ✅ 2-col listings grid with like, buy, item-detail
 * ✅ Seller stats dashboard (Selling tab)
 * ✅ Create listing modal (title, price, category, description)
 * ✅ My listings grid (Selling tab)
 * ✅ Wishlist / saved items (Wishlist tab) + empty state
 * ✅ Seller chat list (Messages tab)
 * ✅ Item detail modal (image, price, seller, add-to-cart, wishlist, message)
 * ✅ Cart modal (item list, remove, total, checkout)
 * ✅ Checkout modal (payment method, confirm)
 * ✅ Chat modal (message thread)
 * ✅ Notifications panel
 */

import React, { useState, useRef } from 'react';

// ── Seed Data ──────────────────────────────────────────────────
const SEED_LISTINGS = [
  { id:1,  title:'Vintage Vinyl Records (Set of 10)', price:45,  seller:'Jordan M.',  avatar:'🎵', color:'#ec4899', category:'Music',      condition:'Good',    location:'Brooklyn, NY',  desc:'Rare 70s/80s collection. All in great condition. Includes Led Zeppelin, Pink Floyd, and more.' },
  { id:2,  title:'Pro Camera Lens 50mm f/1.8',        price:299, seller:'Alex C.',    avatar:'📸', color:'#6366f1', category:'Electronics', condition:'Like New', location:'Los Angeles, CA', desc:'Used only twice. Nikon mount. Includes original box and lens cap. Sharp images guaranteed.' },
  { id:3,  title:'Fitness Equipment Bundle',           price:120, seller:'Riley J.',  avatar:'💪', color:'#10b981', category:'Fitness',     condition:'Good',    location:'Austin, TX',     desc:'Resistance bands, dumbbells (5–25 lb), yoga mat. Perfect for home gym setup.' },
  { id:4,  title:'Handmade Ceramic Bowl Set (6pc)',   price:68,  seller:'Morgan T.', avatar:'🏺', color:'#f59e0b', category:'Art',         condition:'New',     location:'Portland, OR',   desc:'Each piece is hand-thrown and glazed. Food-safe. Dishwasher-safe. Ships in 3 days.' },
  { id:5,  title:'Gaming Chair RGB Lighting',          price:189, seller:'Casey L.',  avatar:'🎮', color:'#3b82f6', category:'Gaming',      condition:'Good',    location:'Chicago, IL',    desc:'Ergonomic lumbar support. USB RGB control. Slightly used — perfect condition.' },
  { id:6,  title:'Cooking Masterclass Book Bundle',    price:25,  seller:'Sam R.',    avatar:'📚', color:'#8b5cf6', category:'Books',       condition:'Good',    location:'Seattle, WA',    desc:'4 books: Julia Child, Ottolenghi, Baking Bible, Noma Guide. All paperback.' },
  { id:7,  title:'Mechanical Keyboard TKL',            price:145, seller:'Drew K.',   avatar:'⌨️', color:'#06b6d4', category:'Electronics', condition:'Like New', location:'Denver, CO',    desc:'Cherry MX Blue switches. PBT keycaps. USB-C. Includes carrying case.' },
  { id:8,  title:'Acoustic Guitar (Yamaha FG800)',     price:220, seller:'Quinn P.',  avatar:'🎸', color:'#ef4444', category:'Music',       condition:'Good',    location:'Nashville, TN',  desc:'Excellent beginner/intermediate guitar. Includes gig bag and tuner.' },
  { id:9,  title:'Standing Desk Converter',            price:85,  seller:'Jamie A.',  avatar:'🖥️', color:'#64748b', category:'Office',      condition:'Good',    location:'Boston, MA',     desc:'Height adjustable. Fits two monitors. Solid aluminum build. Easy assembly.' },
  { id:10, title:'Air Fryer XL 5.8QT',                price:55,  seller:'Taylor H.', avatar:'🍳', color:'#f97316', category:'Kitchen',     condition:'Good',    location:'Phoenix, AZ',    desc:'Used 20 times. Non-stick basket. Digital display. Includes recipe book.' },
  { id:11, title:'Skateboard Complete Setup',          price:95,  seller:'Blake V.',  avatar:'🛹', color:'#84cc16', category:'Sports',      condition:'Good',    location:'San Diego, CA',  desc:'8" deck, Indy trucks, 54mm wheels. Bearings recently replaced.' },
  { id:12, title:'Polaroid Now Camera + Film',         price:78,  seller:'Avery N.',  avatar:'📷', color:'#a855f7', category:'Electronics', condition:'Like New', location:'Miami, FL',     desc:'Includes two packs of film (20 shots). Strap included.' },
  { id:13, title:'Plant Bundle (Succulents ×5)',        price:30,  seller:'Peyton G.', avatar:'🌵', color:'#22c55e', category:'Home',        condition:'New',     location:'Austin, TX',     desc:'Variety pack. Each in 3" pot. Easy care. Ships Monday/Wednesday.' },
  { id:14, title:'Lego Star Wars Millennium Falcon',   price:350, seller:'Reese T.',  avatar:'🚀', color:'#0ea5e9', category:'Toys',        condition:'Like New', location:'NYC, NY',       desc:'99% complete (checking last bag). Box included. Retired set 75105.' },
  { id:15, title:'Yoga Mat Premium (6mm)',              price:38,  seller:'Sage M.',   avatar:'🧘', color:'#fb923c', category:'Fitness',     condition:'New',     location:'Denver, CO',     desc:'Never used. Non-slip. Includes carrying strap. Regular retail $75.' },
  { id:16, title:'Smart Watch (Fitbit Versa 3)',        price:99,  seller:'Cody R.',   avatar:'⌚', color:'#2563eb', category:'Electronics', condition:'Good',    location:'Atlanta, GA',    desc:'GPS + heart rate. All-day battery. Includes 2 bands. Charger included.' },
];

const MY_LISTINGS = [
  { id:101, title:'MacBook Pro 13" 2021', price:850, emoji:'💻', color:'#6366f1', sold:false, views:247, likes:18 },
  { id:102, title:'Nikon D3500 DSLR Kit', price:420, emoji:'📷', color:'#ec4899', sold:true,  views:189, likes:32 },
  { id:103, title:'iPad Air 4th Gen',     price:450, emoji:'📱', color:'#10b981', sold:false, views:95,  likes:7  },
];

const SELLER_CHATS = [
  { id:'c1', name:'Sarah Miller',  avatar:'SM', bg:'#6366f1', item:'Vintage Vinyl Records', msg:'Is this still available?', time:'2m',  unread:2 },
  { id:'c2', name:'James W.',      avatar:'JW', bg:'#ec4899', item:'Pro Camera Lens',       msg:'Can you do $280?',         time:'15m', unread:0 },
  { id:'c3', name:'Emma L.',       avatar:'EL', bg:'#10b981', item:'Fitness Bundle',         msg:'Thanks! Will pick up Sat', time:'1h',  unread:0 },
  { id:'c4', name:'Marcus T.',     avatar:'MT', bg:'#f59e0b', item:'Gaming Chair RGB',       msg:'Does it ship to Texas?',   time:'3h',  unread:1 },
];

const NOTIFICATIONS_DATA = [
  { icon:'💰', text:'Sarah Miller offered $40 for your Vinyl Records', time:'5m ago' },
  { icon:'❤️', text:'12 people liked your Camera Lens listing',         time:'1h ago' },
  { icon:'📦', text:'Your order from Alex C. shipped! Track: #12945',  time:'2h ago' },
  { icon:'⭐', text:'You received a 5-star review from Emma L.',         time:'1d ago' },
];

const CATEGORIES = ['All','Electronics','Music','Fitness','Art','Gaming','Books','Office','Kitchen','Sports','Home','Toys'];

// ── Helpers ────────────────────────────────────────────────────
const S = {
  page:  { background:'#0f172a', minHeight:'100vh', paddingBottom:'20px', color:'#f1f5f9' },
  topBar:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px',
           borderBottom:'1px solid #1e293b', position:'sticky', top:0, background:'#0f172a', zIndex:10 },
  title: { fontSize:'20px', fontWeight:800, background:'linear-gradient(135deg,#6366f1,#ec4899)',
           WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  iconBtn:{ position:'relative', background:'#1e293b', border:'none', borderRadius:'12px',
            width:'40px', height:'40px', cursor:'pointer', display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:'18px', color:'#f1f5f9' },
  badge: { position:'absolute', top:'-4px', right:'-4px', background:'#ef4444', color:'white',
           borderRadius:'50%', width:'18px', height:'18px', fontSize:'10px', fontWeight:800,
           display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #0f172a' },
  search:{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 16px',
           background:'#1e293b', margin:'12px 16px', borderRadius:'14px', border:'1px solid #334155' },
  tabRow:{ display:'flex', borderBottom:'1px solid #1e293b', overflowX:'auto' },
  tab:   (active) => ({
    flex:'0 0 auto', padding:'12px 18px', fontSize:'13px', fontWeight:active?700:500,
    color:active?'#6366f1':'#64748b',
    cursor:'pointer', whiteSpace:'nowrap', background:'none', border:'none',
    borderBottom:active?'2px solid #6366f1':'2px solid transparent',
  }),
  catChip:(active) => ({
    flex:'0 0 auto', padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:active?700:500,
    background:active?'#6366f1':'#1e293b', color:active?'white':'#94a3b8', cursor:'pointer', border:'none',
  }),
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', padding:'12px 16px' },
  card:  { background:'#1e293b', borderRadius:'16px', overflow:'hidden', cursor:'pointer', border:'1px solid #334155' },
  cardImg:(color)=>({ height:'110px', background:color, display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:'42px', position:'relative' }),
  cardBody:{ padding:'10px' },
  modal: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex',
           alignItems:'flex-end', backdropFilter:'blur(4px)' },
  modalBox:{ background:'#1e293b', borderRadius:'24px 24px 0 0', width:'100%', maxHeight:'90vh',
             overflowY:'auto', padding:'0 0 24px' },
  modalHdr:{ display:'flex', alignItems:'center', justifyContent:'space-between',
             padding:'16px 20px 12px', borderBottom:'1px solid #334155' },
  input: { width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'12px',
           padding:'12px 14px', color:'#f1f5f9', fontSize:'14px', marginBottom:'10px', boxSizing:'border-box' },
  btn:   (variant='primary') => ({
    width:'100%', padding:'14px', borderRadius:'14px', border:'none', cursor:'pointer', fontWeight:700,
    fontSize:'15px', background:variant==='primary'?'linear-gradient(135deg,#6366f1,#ec4899)':'#334155',
    color:'white', marginTop:'8px',
  }),
  statCard:{ background:'#0f172a', borderRadius:'12px', padding:'12px', textAlign:'center', flex:1 },
  msgItem:{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px',
            borderBottom:'1px solid #1e293b', cursor:'pointer' },
};

// ── Component ──────────────────────────────────────────────────
export default function MarketplacePage() {
  const [tab, setTab]               = useState('browse');
  const [category, setCategory]     = useState('All');
  const [search, setSearch]         = useState('');
  const [wishlist, setWishlist]     = useState(new Set([2,5]));
  const [cart, setCart]             = useState([]);   // array of {listing, qty}
  const [myListings, setMyListings] = useState(MY_LISTINGS);

  // modals
  const [itemModal, setItemModal]     = useState(null);   // listing object
  const [cartOpen, setCartOpen]       = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [createOpen, setCreateOpen]   = useState(false);
  const [chatModal, setChatModal]     = useState(null);   // chat object
  const [notiOpen, setNotiOpen]       = useState(false);
  const [chatMsg, setChatMsg]         = useState('');
  const [payMethod, setPayMethod]     = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);

  // create listing form
  const [newTitle, setNewTitle]     = useState('');
  const [newPrice, setNewPrice]     = useState('');
  const [newCat, setNewCat]         = useState('Electronics');
  const [newCond, setNewCond]       = useState('Good');
  const [newDesc, setNewDesc]       = useState('');

  // cart total
  const cartTotal = cart.reduce((s,c)=>s+c.listing.price*c.qty, 0);

  function toggleWishlist(id) {
    setWishlist(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function addToCart(listing) {
    setCart(prev => {
      const ex = prev.find(c=>c.listing.id===listing.id);
      if (ex) return prev.map(c=>c.listing.id===listing.id?{...c,qty:c.qty+1}:c);
      return [...prev,{listing,qty:1}];
    });
    setItemModal(null);
  }

  function removeFromCart(id) {
    setCart(prev=>prev.filter(c=>c.listing.id!==id));
  }

  function publishListing() {
    if (!newTitle||!newPrice) return;
    const nl = { id:Date.now(), title:newTitle, price:parseInt(newPrice), emoji:'📦',
                 color:'#6366f1', sold:false, views:0, likes:0 };
    setMyListings(prev=>[nl,...prev]);
    setNewTitle(''); setNewPrice(''); setNewDesc('');
    setCreateOpen(false);
  }

  function placeOrder() {
    setCart([]);
    setCheckoutOpen(false);
    setOrderPlaced(true);
    setTimeout(()=>setOrderPlaced(false),3000);
  }

  // filtered listings
  const filtered = SEED_LISTINGS.filter(l => {
    const catOk = category==='All'||l.category===category;
    const searchOk = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.seller.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  const wishlistItems = SEED_LISTINGS.filter(l=>wishlist.has(l.id));

  return (
    <div style={S.page}>

      {/* ── TOP BAR ─────────────────────────── */}
      <div style={S.topBar}>
        <span style={S.title}>🛒 Marketplace</span>
        <div style={{display:'flex',gap:'8px'}}>
          <button style={S.iconBtn} onClick={()=>setNotiOpen(true)}>
            🔔
            <span style={S.badge}>3</span>
          </button>
          <button style={S.iconBtn} onClick={()=>setCartOpen(true)}>
            🛒
            {cart.length>0 && <span style={S.badge}>{cart.length}</span>}
          </button>
        </div>
      </div>

      {/* ── NOTIFICATIONS PANEL ─────────────── */}
      {notiOpen && (
        <div style={S.modal} onClick={()=>setNotiOpen(false)}>
          <div style={{...S.modalBox}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>🔔 Notifications</span>
              <button style={{background:'none',border:'none',color:'#94a3b8',fontSize:'20px',cursor:'pointer'}} onClick={()=>setNotiOpen(false)}>✕</button>
            </div>
            {NOTIFICATIONS_DATA.map((n,i)=>(
              <div key={i} style={{display:'flex',gap:'12px',padding:'14px 20px',borderBottom:'1px solid #1e293b',alignItems:'flex-start'}}>
                <span style={{fontSize:'22px'}}>{n.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',color:'#f1f5f9',lineHeight:1.4}}>{n.text}</div>
                  <div style={{fontSize:'11px',color:'#64748b',marginTop:'4px'}}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEARCH BAR ──────────────────────── */}
      <div style={S.search}>
        <span style={{fontSize:'16px',color:'#64748b'}}>🔍</span>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search items, sellers..." autoComplete="off"
          style={{background:'none',border:'none',color:'#f1f5f9',fontSize:'14px',flex:1,outline:'none'}}
        />
        {search && <button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:'16px'}}>✕</button>}
      </div>

      {/* ── TABS ────────────────────────────── */}
      <div style={S.tabRow}>
        {[['browse','🏪 Browse'],['selling','📦 My Listings'],['wishlist','❤️ Wishlist'],['messages','💬 Messages']].map(([key,label])=>(
          <button key={key} style={S.tab(tab===key)} onClick={()=>setTab(key)}>{label}</button>
        ))}
      </div>

      {/* ════════════════════════════════════
           TAB: BROWSE
         ════════════════════════════════════ */}
      {tab==='browse' && (
        <>
          {/* Category chips */}
          <div style={{display:'flex',gap:'8px',padding:'12px 16px',overflowX:'auto'}}>
            {CATEGORIES.map(c=>(
              <button key={c} style={S.catChip(category===c)} onClick={()=>setCategory(c)}>{c}</button>
            ))}
          </div>

          {/* Section header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px 10px'}}>
            <span style={{fontWeight:700,fontSize:'15px'}}>
              {search ? `Results for "${search}"` : category==='All' ? 'Featured Listings' : category}
            </span>
            <span style={{color:'#64748b',fontSize:'13px'}}>{filtered.length} items</span>
          </div>

          {/* Listings grid */}
          {filtered.length===0 ? (
            <div style={{textAlign:'center',padding:'40px',color:'#64748b'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>🔍</div>
              <div style={{fontWeight:600}}>No items found</div>
              <div style={{fontSize:'13px',marginTop:'6px'}}>Try a different search or category</div>
            </div>
          ) : (
            <div style={S.grid2}>
              {filtered.map(item=>(
                <div key={item.id} style={S.card} onClick={()=>setItemModal(item)}>
                  <div style={S.cardImg(item.color)}>
                    <span style={{fontSize:'44px'}}>{item.avatar}</span>
                    <button
                      onClick={e=>{e.stopPropagation();toggleWishlist(item.id);}}
                      style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.45)',
                              border:'none',borderRadius:'50%',width:'30px',height:'30px',
                              cursor:'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center'}}
                    >{wishlist.has(item.id)?'❤️':'🤍'}</button>
                    <span style={{position:'absolute',bottom:'6px',left:'8px',background:'rgba(0,0,0,0.5)',
                                  borderRadius:'6px',padding:'2px 7px',fontSize:'10px',color:'white'}}>
                      {item.condition}
                    </span>
                  </div>
                  <div style={S.cardBody}>
                    <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'12px',lineHeight:1.3,marginBottom:'3px',
                                 overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                      {item.title}
                    </div>
                    <div style={{color:'#64748b',fontSize:'11px',marginBottom:'8px'}}>{item.seller}</div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{color:'#10b981',fontWeight:800,fontSize:'15px'}}>${item.price}</span>
                      <button
                        onClick={e=>{e.stopPropagation();addToCart(item);}}
                        style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',color:'white',
                                border:'none',borderRadius:'10px',padding:'5px 10px',fontSize:'11px',
                                fontWeight:600,cursor:'pointer'}}
                      >+ Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════
           TAB: MY LISTINGS (SELLING)
         ════════════════════════════════════ */}
      {tab==='selling' && (
        <>
          {/* Seller Stats */}
          <div style={{display:'flex',gap:'10px',padding:'16px',overflowX:'auto'}}>
            {[['💰','$1,240','Revenue'],['📦','3','Active'],['⭐','4.9','Rating'],['👁️','531','Views']].map(([icon,val,lbl])=>(
              <div key={lbl} style={{...S.statCard,minWidth:'80px'}}>
                <div style={{fontSize:'22px',marginBottom:'4px'}}>{icon}</div>
                <div style={{fontWeight:800,fontSize:'18px',color:'#f1f5f9'}}>{val}</div>
                <div style={{color:'#64748b',fontSize:'11px'}}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* Create Listing Button */}
          <div style={{padding:'0 16px 16px'}}>
            <button onClick={()=>setCreateOpen(true)} style={{
              width:'100%',padding:'14px',borderRadius:'14px',border:'2px dashed rgba(99,102,241,0.4)',
              background:'rgba(99,102,241,0.08)',color:'#a5b4fc',fontWeight:700,fontSize:'14px',
              cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'
            }}>
              ➕ Create New Listing
            </button>
          </div>

          {/* My Listings Section */}
          <div style={{padding:'0 16px 8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontWeight:700,fontSize:'15px'}}>My Listings</span>
            <span style={{color:'#64748b',fontSize:'13px'}}>{myListings.length} items</span>
          </div>
          <div style={S.grid2}>
            {myListings.map(item=>(
              <div key={item.id} style={{...S.card,opacity:item.sold?0.6:1}}>
                <div style={S.cardImg(item.color)}>
                  <span style={{fontSize:'44px'}}>{item.emoji}</span>
                  {item.sold && (
                    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',
                                 alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'16px'}}>
                      SOLD
                    </div>
                  )}
                </div>
                <div style={S.cardBody}>
                  <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'12px',lineHeight:1.3,marginBottom:'4px',
                               overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                    {item.title}
                  </div>
                  <div style={{color:'#10b981',fontWeight:800,fontSize:'14px',marginBottom:'6px'}}>${item.price}</div>
                  <div style={{display:'flex',gap:'8px',fontSize:'11px',color:'#64748b'}}>
                    <span>👁️ {item.views}</span>
                    <span>❤️ {item.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════════════════════════════════════
           TAB: WISHLIST
         ════════════════════════════════════ */}
      {tab==='wishlist' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 16px 8px'}}>
            <span style={{fontWeight:700,fontSize:'15px'}}>❤️ Saved Items</span>
            <span style={{color:'#64748b',fontSize:'13px'}}>{wishlistItems.length} items</span>
          </div>
          {wishlistItems.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',color:'#64748b'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>🔖</div>
              <div style={{fontWeight:700,fontSize:'16px',color:'#f1f5f9',marginBottom:'8px'}}>No saved items yet</div>
              <div style={{fontSize:'13px'}}>Tap ❤️ on any listing to save it here</div>
            </div>
          ) : (
            <div style={S.grid2}>
              {wishlistItems.map(item=>(
                <div key={item.id} style={S.card} onClick={()=>setItemModal(item)}>
                  <div style={S.cardImg(item.color)}>
                    <span style={{fontSize:'44px'}}>{item.avatar}</span>
                    <button
                      onClick={e=>{e.stopPropagation();toggleWishlist(item.id);}}
                      style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.45)',
                              border:'none',borderRadius:'50%',width:'30px',height:'30px',
                              cursor:'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center'}}
                    >❤️</button>
                  </div>
                  <div style={S.cardBody}>
                    <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'12px',lineHeight:1.3,marginBottom:'4px',
                                 overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                      {item.title}
                    </div>
                    <div style={{color:'#64748b',fontSize:'11px',marginBottom:'6px'}}>{item.seller}</div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{color:'#10b981',fontWeight:800,fontSize:'14px'}}>${item.price}</span>
                      <button
                        onClick={e=>{e.stopPropagation();addToCart(item);}}
                        style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',color:'white',
                                border:'none',borderRadius:'10px',padding:'5px 10px',fontSize:'11px',
                                fontWeight:600,cursor:'pointer'}}
                      >+ Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════
           TAB: MESSAGES
         ════════════════════════════════════ */}
      {tab==='messages' && (
        <>
          <div style={{padding:'16px 16px 8px',fontWeight:700,fontSize:'15px'}}>💬 Seller Messages</div>
          {SELLER_CHATS.map(chat=>(
            <div key={chat.id} style={S.msgItem} onClick={()=>setChatModal(chat)}>
              <div style={{width:'44px',height:'44px',borderRadius:'50%',background:chat.bg,
                           display:'flex',alignItems:'center',justifyContent:'center',
                           fontWeight:700,fontSize:'14px',flexShrink:0}}>
                {chat.avatar}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2px'}}>
                  <span style={{fontWeight:700,fontSize:'14px',color:'#f1f5f9'}}>{chat.name}</span>
                  <span style={{color:'#64748b',fontSize:'11px'}}>{chat.time}</span>
                </div>
                <div style={{color:'#64748b',fontSize:'12px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                  Re: {chat.item}
                </div>
                <div style={{color:'#94a3b8',fontSize:'12px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                  {chat.msg}
                </div>
              </div>
              {chat.unread>0 && (
                <div style={{background:'#6366f1',color:'white',borderRadius:'50%',width:'20px',height:'20px',
                             fontSize:'11px',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* ════════════════════════════════════
           MODAL: ITEM DETAIL
         ════════════════════════════════════ */}
      {itemModal && (
        <div style={S.modal} onClick={()=>setItemModal(null)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            {/* Hero image */}
            <div style={{height:'200px',background:itemModal.color,display:'flex',alignItems:'center',
                         justifyContent:'center',fontSize:'80px',borderRadius:'24px 24px 0 0',position:'relative'}}>
              {itemModal.avatar}
              <button onClick={()=>setItemModal(null)}
                style={{position:'absolute',top:'12px',right:'12px',background:'rgba(0,0,0,0.5)',
                        border:'none',borderRadius:'50%',width:'32px',height:'32px',
                        color:'white',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {/* Title + price */}
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'8px'}}>
                <h2 style={{fontSize:'18px',fontWeight:800,color:'#f1f5f9',margin:0,flex:1,paddingRight:'12px'}}>{itemModal.title}</h2>
                <span style={{color:'#10b981',fontWeight:800,fontSize:'22px',flexShrink:0}}>${itemModal.price}</span>
              </div>

              {/* Meta pills */}
              <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>
                  📦 {itemModal.condition}
                </span>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>
                  📍 {itemModal.location}
                </span>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>
                  🏷️ {itemModal.category}
                </span>
              </div>

              {/* Description */}
              <p style={{color:'#94a3b8',fontSize:'14px',lineHeight:1.6,marginBottom:'16px'}}>{itemModal.desc}</p>

              {/* Seller */}
              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',
                           background:'#0f172a',borderRadius:'12px',marginBottom:'16px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'#334155',
                             display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>
                  👤
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'14px'}}>{itemModal.seller}</div>
                  <div style={{color:'#64748b',fontSize:'12px'}}>⭐ 4.8 · 23 sales · Member since 2022</div>
                </div>
                <button
                  onClick={()=>{setItemModal(null);setChatModal({name:itemModal.seller,avatar:itemModal.seller.slice(0,2).toUpperCase(),bg:'#6366f1',item:itemModal.title,msg:'',unread:0});setTab('messages');}}
                  style={{marginLeft:'auto',background:'#1e293b',border:'none',borderRadius:'10px',
                          padding:'8px 12px',color:'#6366f1',fontWeight:600,fontSize:'13px',cursor:'pointer'}}
                >
                  💬 Message
                </button>
              </div>

              {/* Action buttons */}
              <div style={{display:'flex',gap:'10px'}}>
                <button
                  onClick={()=>toggleWishlist(itemModal.id)}
                  style={{flex:'0 0 auto',padding:'14px 18px',borderRadius:'14px',border:'1px solid #334155',
                          background:'#1e293b',color:wishlist.has(itemModal.id)?'#ef4444':'#94a3b8',
                          cursor:'pointer',fontSize:'20px'}}
                >{wishlist.has(itemModal.id)?'❤️':'🤍'}</button>
                <button onClick={()=>addToCart(itemModal)} style={S.btn()}>
                  🛒 Add to Cart — ${itemModal.price}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
           MODAL: CART
         ════════════════════════════════════ */}
      {cartOpen && (
        <div style={S.modal} onClick={()=>setCartOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>🛒 Cart ({cart.length})</span>
              <button style={{background:'none',border:'none',color:'#94a3b8',fontSize:'20px',cursor:'pointer'}} onClick={()=>setCartOpen(false)}>✕</button>
            </div>
            <div style={{padding:'0 0 8px'}}>
              {cart.length===0 ? (
                <div style={{textAlign:'center',padding:'40px',color:'#64748b'}}>
                  <div style={{fontSize:'40px',marginBottom:'12px'}}>🛒</div>
                  <div style={{fontWeight:600,color:'#f1f5f9'}}>Your cart is empty</div>
                  <div style={{fontSize:'13px',marginTop:'6px'}}>Browse listings to add items</div>
                </div>
              ) : (
                <>
                  {cart.map(c=>(
                    <div key={c.listing.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 20px',borderBottom:'1px solid #1e293b'}}>
                      <div style={{width:'48px',height:'48px',borderRadius:'12px',background:c.listing.color,
                                   display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',flexShrink:0}}>
                        {c.listing.avatar}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:'13px',color:'#f1f5f9',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                          {c.listing.title}
                        </div>
                        <div style={{color:'#10b981',fontWeight:700,fontSize:'14px'}}>${c.listing.price}</div>
                      </div>
                      <button onClick={()=>removeFromCart(c.listing.id)}
                        style={{background:'#334155',border:'none',borderRadius:'8px',width:'28px',height:'28px',
                                color:'#94a3b8',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        ×
                      </button>
                    </div>
                  ))}
                  <div style={{padding:'16px 20px',borderTop:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:'#94a3b8',fontSize:'14px'}}>Total</span>
                    <span style={{fontWeight:800,fontSize:'20px',color:'#f1f5f9'}}>${cartTotal}</span>
                  </div>
                  <div style={{padding:'0 20px'}}>
                    <button style={S.btn()} onClick={()=>{setCartOpen(false);setCheckoutOpen(true);}}>
                      Checkout — ${cartTotal}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
           MODAL: CHECKOUT
         ════════════════════════════════════ */}
      {checkoutOpen && (
        <div style={S.modal} onClick={()=>setCheckoutOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>💳 Checkout</span>
              <button style={{background:'none',border:'none',color:'#94a3b8',fontSize:'20px',cursor:'pointer'}} onClick={()=>setCheckoutOpen(false)}>✕</button>
            </div>
            {orderPlaced ? (
              <div style={{textAlign:'center',padding:'40px'}}>
                <div style={{fontSize:'60px',marginBottom:'16px'}}>✅</div>
                <div style={{fontWeight:700,fontSize:'18px',color:'#f1f5f9'}}>Order Placed!</div>
                <div style={{color:'#64748b',marginTop:'8px'}}>You'll receive a confirmation shortly</div>
              </div>
            ) : (
              <div style={{padding:'20px'}}>
                {/* Total */}
                <div style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',borderRadius:'16px',padding:'24px',textAlign:'center',marginBottom:'20px'}}>
                  <div style={{fontSize:'13px',opacity:0.9,marginBottom:'4px'}}>Total Amount</div>
                  <div style={{fontSize:'42px',fontWeight:800,color:'white'}}>${cartTotal}</div>
                  <div style={{fontSize:'12px',opacity:0.8,marginTop:'4px'}}>{cart.length} item{cart.length!==1?'s':''}</div>
                </div>

                {/* Payment Method */}
                <div style={{marginBottom:'16px'}}>
                  <div style={{fontWeight:600,fontSize:'13px',color:'#94a3b8',marginBottom:'8px'}}>PAYMENT METHOD</div>
                  {[['card','💳 Credit / Debit Card'],['paypal','🅿️ PayPal'],['crypto','₿ Crypto'],['cash','💵 Cash on Pickup']].map(([val,lbl])=>(
                    <div key={val} onClick={()=>setPayMethod(val)}
                      style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',marginBottom:'8px',
                              borderRadius:'12px',border:`1px solid ${payMethod===val?'#6366f1':'#334155'}`,
                              background:payMethod===val?'rgba(99,102,241,0.1)':'transparent',cursor:'pointer'}}>
                      <div style={{width:'20px',height:'20px',borderRadius:'50%',border:`2px solid ${payMethod===val?'#6366f1':'#334155'}`,
                                   display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {payMethod===val && <div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#6366f1'}}/>}
                      </div>
                      <span style={{fontSize:'14px',color:'#f1f5f9'}}>{lbl}</span>
                    </div>
                  ))}
                </div>

                {payMethod==='card' && (
                  <>
                    <input style={S.input} placeholder="Card Number" />
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                      <input style={{...S.input,marginBottom:0}} placeholder="MM/YY" />
                      <input style={{...S.input,marginBottom:0}} placeholder="CVV" />
                    </div>
                    <div style={{height:'10px'}}/>
                  </>
                )}

                <button style={S.btn()} onClick={placeOrder}>
                  🔒 Place Order — ${cartTotal}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
           MODAL: CREATE LISTING
         ════════════════════════════════════ */}
      {createOpen && (
        <div style={S.modal} onClick={()=>setCreateOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>📦 Create Listing</span>
              <button style={{background:'none',border:'none',color:'#94a3b8',fontSize:'20px',cursor:'pointer'}} onClick={()=>setCreateOpen(false)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {/* Photo upload placeholder */}
              <div style={{height:'120px',background:'#0f172a',borderRadius:'14px',border:'2px dashed #334155',
                           display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                           marginBottom:'14px',cursor:'pointer',color:'#64748b'}}>
                <div style={{fontSize:'32px',marginBottom:'6px'}}>📷</div>
                <div style={{fontSize:'13px'}}>Tap to add photos</div>
              </div>

              <input style={S.input} placeholder="Item Title *" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
              <input style={S.input} placeholder="Price ($) *" type="number" value={newPrice} onChange={e=>setNewPrice(e.target.value)} />

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <select style={{...S.input,marginBottom:0}} value={newCat} onChange={e=>setNewCat(e.target.value)}>
                  {CATEGORIES.slice(1).map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <select style={{...S.input,marginBottom:0}} value={newCond} onChange={e=>setNewCond(e.target.value)}>
                  {['New','Like New','Good','Fair','Poor'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>

              <textarea
                style={{...S.input,minHeight:'80px',resize:'vertical',fontFamily:'inherit'}}
                placeholder="Description — add details to sell faster!"
                value={newDesc} onChange={e=>setNewDesc(e.target.value)}
              />
              <button style={S.btn()} onClick={publishListing}>🚀 Publish Listing</button>
              <button style={S.btn('secondary')} onClick={()=>setCreateOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
           MODAL: SELLER CHAT
         ════════════════════════════════════ */}
      {chatModal && (
        <div style={S.modal} onClick={()=>setChatModal(null)}>
          <div style={{...S.modalBox,maxHeight:'80vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:chatModal.bg,
                             display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'13px'}}>
                  {chatModal.avatar}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:'14px',color:'#f1f5f9'}}>{chatModal.name}</div>
                  <div style={{color:'#64748b',fontSize:'11px'}}>Re: {chatModal.item}</div>
                </div>
              </div>
              <button style={{background:'none',border:'none',color:'#94a3b8',fontSize:'20px',cursor:'pointer'}} onClick={()=>setChatModal(null)}>✕</button>
            </div>

            {/* Message thread */}
            <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
              <div style={{display:'flex',justifyContent:'flex-start'}}>
                <div style={{background:'#1e293b',borderRadius:'16px 16px 16px 4px',padding:'10px 14px',maxWidth:'75%',fontSize:'14px',color:'#f1f5f9'}}>
                  {chatModal.msg || 'Hi! Is this still available?'}
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <div style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',borderRadius:'16px 16px 4px 16px',padding:'10px 14px',maxWidth:'75%',fontSize:'14px',color:'white'}}>
                  Yes, still available! Feel free to make an offer.
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-start'}}>
                <div style={{background:'#1e293b',borderRadius:'16px 16px 16px 4px',padding:'10px 14px',maxWidth:'75%',fontSize:'14px',color:'#f1f5f9'}}>
                  Would you take $35 for it?
                </div>
              </div>
            </div>

            {/* Input area */}
            <div style={{display:'flex',gap:'10px',padding:'12px 16px',borderTop:'1px solid #1e293b'}}>
              <input
                value={chatMsg}
                onChange={e=>setChatMsg(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&chatMsg.trim()){ setChatMsg(''); } }}
                placeholder="Type a message..."
                style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:'20px',
                        padding:'10px 16px',color:'#f1f5f9',fontSize:'14px',outline:'none'}}
              />
              <button
                onClick={()=>setChatMsg('')}
                style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',borderRadius:'50%',
                        width:'40px',height:'40px',color:'white',cursor:'pointer',fontSize:'18px',flexShrink:0}}
              >➤</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ORDER SUCCESS TOAST ──────────────── */}
      {orderPlaced && (
        <div style={{position:'fixed',bottom:'90px',left:'50%',transform:'translateX(-50%)',
                     background:'#10b981',color:'white',padding:'12px 24px',borderRadius:'12px',
                     fontWeight:700,zIndex:200,whiteSpace:'nowrap'}}>
          ✅ Order placed successfully!
        </div>
      )}

      {/* ── CREATE LISTING FAB ───────────────── */}
      {tab!=='selling' && (
        <button
          onClick={()=>setCreateOpen(true)}
          style={{position:'fixed',bottom:'90px',right:'20px',width:'52px',height:'52px',borderRadius:'50%',
                  background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',color:'white',
                  fontSize:'24px',cursor:'pointer',zIndex:50,boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
                  display:'flex',alignItems:'center',justifyContent:'center'}}
        >+</button>
      )}
    </div>
  );
}
