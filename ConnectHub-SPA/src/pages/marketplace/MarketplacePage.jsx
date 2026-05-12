/**
 * MarketplacePage.jsx — Full Marketplace (Bug-Fixed Version)
 *
 * FIXES APPLIED (from Beta Test Reports):
 * ✅ FIX-01: Chat send button now appends messages to thread (was no-op)
 * ✅ FIX-02: Enter key in chat now sends message (was just clearing input)
 * ✅ FIX-03: Checkout has 2-step flow — Shipping Address then Payment
 * ✅ FIX-04: Photo upload area now opens real file picker (useRef hidden input)
 * ✅ FIX-05: Notification badge is dynamic, clears to 0 when panel opened
 * ✅ FIX-06: Newly published listings appear in Browse tab (unified state)
 * ✅ FIX-07: Cart has +/- quantity controls (not just remove)
 * ✅ FIX-08: Seller stats "Active" count is dynamic from myListings state
 * ✅ FIX-09: My Listings cards are clickable → Manage modal (Edit/Delete/Mark Sold)
 * ✅ FIX-10: "Message" from item detail adds chat to Messages list (no orphan)
 * ✅ FIX-11: Cart persisted to localStorage (survives page refresh)
 * ✅ FIX-12: Toast bottom raised to 140px so it doesn't collide with FAB
 * ✅ FIX-13: Tab labels shortened to prevent overflow truncation
 * ✅ FIX-14: "Add to Cart" shows a brief toast confirmation
 * ✅ FIX-15: Notifications panel has "Mark all as read" button
 * ✅ FIX-16: Create Listing form has Location field + Tags field
 * ✅ FIX-17: Checkout card form has Cardholder Name field
 * ✅ FIX-18: Chat modal shows "Make Offer" button
 * ✅ FIX-19: Manage listing modal allows Edit title/price/desc + Delete + Mark Sold
 *
 * STILL NEEDS (future sprints — backend/infra required):
 * ⏳ Real API integration (marketplace-api-service.js not yet wired)
 * ⏳ Real product photo upload to Cloudinary/S3
 * ⏳ Order history / My Purchases tab
 * ⏳ Product reviews & ratings system
 * ⏳ Seller profile page
 * ⏳ Price range + sort + condition filters
 * ⏳ Buyer protection / dispute resolution UI
 * ⏳ Seller verification badges
 */

import React, { useState, useRef, useEffect } from 'react';

// ── Seed Data ──────────────────────────────────────────────────
const SEED_LISTINGS = [
  { id:1,  title:'Vintage Vinyl Records (Set of 10)', price:45,  seller:'Jordan M.',  avatar:'🎵', color:'#ec4899', category:'Music',      condition:'Good',    location:'Brooklyn, NY',  desc:'Rare 70s/80s collection. All in great condition. Includes Led Zeppelin, Pink Floyd, and more.', tags:'vintage,vinyl,records,music' },
  { id:2,  title:'Pro Camera Lens 50mm f/1.8',        price:299, seller:'Alex C.',    avatar:'📸', color:'#6366f1', category:'Electronics', condition:'Like New', location:'Los Angeles, CA', desc:'Used only twice. Nikon mount. Includes original box and lens cap. Sharp images guaranteed.', tags:'camera,lens,photography,nikon' },
  { id:3,  title:'Fitness Equipment Bundle',           price:120, seller:'Riley J.',  avatar:'💪', color:'#10b981', category:'Fitness',     condition:'Good',    location:'Austin, TX',     desc:'Resistance bands, dumbbells (5–25 lb), yoga mat. Perfect for home gym setup.', tags:'fitness,gym,exercise,weights' },
  { id:4,  title:'Handmade Ceramic Bowl Set (6pc)',   price:68,  seller:'Morgan T.', avatar:'🏺', color:'#f59e0b', category:'Art',         condition:'New',     location:'Portland, OR',   desc:'Each piece is hand-thrown and glazed. Food-safe. Dishwasher-safe. Ships in 3 days.', tags:'ceramic,handmade,bowls,art' },
  { id:5,  title:'Gaming Chair RGB Lighting',          price:189, seller:'Casey L.',  avatar:'🎮', color:'#3b82f6', category:'Gaming',      condition:'Good',    location:'Chicago, IL',    desc:'Ergonomic lumbar support. USB RGB control. Slightly used — perfect condition.', tags:'gaming,chair,rgb,furniture' },
  { id:6,  title:'Cooking Masterclass Book Bundle',    price:25,  seller:'Sam R.',    avatar:'📚', color:'#8b5cf6', category:'Books',       condition:'Good',    location:'Seattle, WA',    desc:'4 books: Julia Child, Ottolenghi, Baking Bible, Noma Guide. All paperback.', tags:'books,cooking,recipes,food' },
  { id:7,  title:'Mechanical Keyboard TKL',            price:145, seller:'Drew K.',   avatar:'⌨️', color:'#06b6d4', category:'Electronics', condition:'Like New', location:'Denver, CO',    desc:'Cherry MX Blue switches. PBT keycaps. USB-C. Includes carrying case.', tags:'keyboard,mechanical,gaming,pc' },
  { id:8,  title:'Acoustic Guitar (Yamaha FG800)',     price:220, seller:'Quinn P.',  avatar:'🎸', color:'#ef4444', category:'Music',       condition:'Good',    location:'Nashville, TN',  desc:'Excellent beginner/intermediate guitar. Includes gig bag and tuner.', tags:'guitar,acoustic,yamaha,music' },
  { id:9,  title:'Standing Desk Converter',            price:85,  seller:'Jamie A.',  avatar:'🖥️', color:'#64748b', category:'Office',      condition:'Good',    location:'Boston, MA',     desc:'Height adjustable. Fits two monitors. Solid aluminum build. Easy assembly.', tags:'desk,office,standup,ergonomic' },
  { id:10, title:'Air Fryer XL 5.8QT',                price:55,  seller:'Taylor H.', avatar:'🍳', color:'#f97316', category:'Kitchen',     condition:'Good',    location:'Phoenix, AZ',    desc:'Used 20 times. Non-stick basket. Digital display. Includes recipe book.', tags:'airfryer,kitchen,cooking,appliance' },
  { id:11, title:'Skateboard Complete Setup',          price:95,  seller:'Blake V.',  avatar:'🛹', color:'#84cc16', category:'Sports',      condition:'Good',    location:'San Diego, CA',  desc:'8" deck, Indy trucks, 54mm wheels. Bearings recently replaced.', tags:'skateboard,sports,outdoor,skate' },
  { id:12, title:'Polaroid Now Camera + Film',         price:78,  seller:'Avery N.',  avatar:'📷', color:'#a855f7', category:'Electronics', condition:'Like New', location:'Miami, FL',     desc:'Includes two packs of film (20 shots). Strap included.', tags:'polaroid,camera,film,photography' },
  { id:13, title:'Plant Bundle (Succulents ×5)',        price:30,  seller:'Peyton G.', avatar:'🌵', color:'#22c55e', category:'Home',        condition:'New',     location:'Austin, TX',     desc:'Variety pack. Each in 3" pot. Easy care. Ships Monday/Wednesday.', tags:'plants,succulents,home,garden' },
  { id:14, title:'Lego Star Wars Millennium Falcon',   price:350, seller:'Reese T.',  avatar:'🚀', color:'#0ea5e9', category:'Toys',        condition:'Like New', location:'NYC, NY',       desc:'99% complete (checking last bag). Box included. Retired set 75105.', tags:'lego,starwars,toys,collectible' },
  { id:15, title:'Yoga Mat Premium (6mm)',              price:38,  seller:'Sage M.',   avatar:'🧘', color:'#fb923c', category:'Fitness',     condition:'New',     location:'Denver, CO',     desc:'Never used. Non-slip. Includes carrying strap. Regular retail $75.', tags:'yoga,fitness,mat,exercise' },
  { id:16, title:'Smart Watch (Fitbit Versa 3)',        price:99,  seller:'Cody R.',   avatar:'⌚', color:'#2563eb', category:'Electronics', condition:'Good',    location:'Atlanta, GA',    desc:'GPS + heart rate. All-day battery. Includes 2 bands. Charger included.', tags:'smartwatch,fitbit,fitness,tech' },
];

const INITIAL_MY_LISTINGS = [
  { id:101, title:'MacBook Pro 13" 2021', price:850, emoji:'💻', color:'#6366f1', sold:false, views:247, likes:18, location:'Washington, DC', desc:'M1 chip, 8GB RAM, 256GB SSD. Battery at 94%. Minor scuff on bottom.' },
  { id:102, title:'Nikon D3500 DSLR Kit', price:420, emoji:'📷', color:'#ec4899', sold:true,  views:189, likes:32, location:'Washington, DC', desc:'Body + 18-55mm lens + 70-300mm lens. Low shutter count (~3,000).' },
  { id:103, title:'iPad Air 4th Gen',     price:450, emoji:'📱', color:'#10b981', sold:false, views:95,  likes:7,  location:'Washington, DC', desc:'64GB, Space Gray. Comes with Apple Pencil 2nd gen and Smart Folio case.' },
];

const INITIAL_CHATS = [
  { id:'c1', name:'Sarah Miller',  avatar:'SM', bg:'#6366f1', item:'Vintage Vinyl Records', msg:'Is this still available?', time:'2m',  unread:2 },
  { id:'c2', name:'James W.',      avatar:'JW', bg:'#ec4899', item:'Pro Camera Lens',       msg:'Can you do $280?',         time:'15m', unread:0 },
  { id:'c3', name:'Emma L.',       avatar:'EL', bg:'#10b981', item:'Fitness Bundle',         msg:'Thanks! Will pick up Sat', time:'1h',  unread:0 },
  { id:'c4', name:'Marcus T.',     avatar:'MT', bg:'#f59e0b', item:'Gaming Chair RGB',       msg:'Does it ship to Texas?',   time:'3h',  unread:1 },
];

// Initial message threads per chat
const INITIAL_THREADS = {
  c1: [
    { from:'buyer', text:'Hi! Is this still available?' },
    { from:'seller', text:'Yes, still available! Feel free to make an offer.' },
    { from:'buyer', text:'Would you take $35 for it?' },
  ],
  c2: [
    { from:'buyer', text:'Love the lens — can you do $280?' },
    { from:'seller', text:'Best I can do is $290, it\'s like new.' },
  ],
  c3: [
    { from:'buyer', text:'Is the bundle still for sale?' },
    { from:'seller', text:'Yes! Everything is in great shape.' },
    { from:'buyer', text:'Thanks! Will pick up Sat morning.' },
  ],
  c4: [
    { from:'buyer', text:'Does it ship to Texas? How much?' },
  ],
};

const INITIAL_NOTIFICATIONS = [
  { id:'n1', icon:'💰', text:'Sarah Miller offered $40 for your Vinyl Records', time:'5m ago',  read:false },
  { id:'n2', icon:'❤️', text:'12 people liked your Camera Lens listing',        time:'1h ago',  read:false },
  { id:'n3', icon:'📦', text:'Your order from Alex C. shipped! Track: #12945',  time:'2h ago',  read:false },
  { id:'n4', icon:'⭐', text:'You received a 5-star review from Emma L.',        time:'1d ago',  read:true  },
];

const CATEGORIES = ['All','Electronics','Music','Fitness','Art','Gaming','Books','Office','Kitchen','Sports','Home','Toys'];

// ── Load cart from localStorage ─────────────────────────────────
function loadCart() {
  try {
    const saved = localStorage.getItem('connecthub_marketplace_cart');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

// ── Style helpers ───────────────────────────────────────────────
const S = {
  page:    { background:'#0f172a', minHeight:'100vh', paddingBottom:'20px', color:'#f1f5f9' },
  topBar:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px',
             borderBottom:'1px solid #1e293b', position:'sticky', top:0, background:'#0f172a', zIndex:10 },
  title:   { fontSize:'20px', fontWeight:800, background:'linear-gradient(135deg,#6366f1,#ec4899)',
             WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  iconBtn: { position:'relative', background:'#1e293b', border:'none', borderRadius:'12px',
             width:'40px', height:'40px', cursor:'pointer', display:'flex', alignItems:'center',
             justifyContent:'center', fontSize:'18px', color:'#f1f5f9' },
  badge:   { position:'absolute', top:'-4px', right:'-4px', background:'#ef4444', color:'white',
             borderRadius:'50%', width:'18px', height:'18px', fontSize:'10px', fontWeight:800,
             display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #0f172a' },
  search:  { display:'flex', alignItems:'center', gap:'10px', padding:'10px 16px',
             background:'#1e293b', margin:'12px 16px', borderRadius:'14px', border:'1px solid #334155' },
  tabRow:  { display:'flex', borderBottom:'1px solid #1e293b', overflowX:'auto', scrollbarWidth:'none' },
  tab:     (active) => ({
    flex:'1 1 0', padding:'11px 4px', fontSize:'12px', fontWeight:active?700:500,
    color:active?'#6366f1':'#64748b', cursor:'pointer', whiteSpace:'nowrap', background:'none',
    border:'none', borderBottom:active?'2px solid #6366f1':'2px solid transparent', textAlign:'center',
  }),
  catChip: (active) => ({
    flex:'0 0 auto', padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:active?700:500,
    background:active?'#6366f1':'#1e293b', color:active?'white':'#94a3b8', cursor:'pointer', border:'none',
  }),
  grid2:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', padding:'12px 16px' },
  card:    { background:'#1e293b', borderRadius:'16px', overflow:'hidden', cursor:'pointer', border:'1px solid #334155' },
  cardImg: (color)=>({ height:'110px', background:color, display:'flex', alignItems:'center',
                        justifyContent:'center', fontSize:'42px', position:'relative' }),
  cardBody:{ padding:'10px' },
  modal:   { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex',
             alignItems:'flex-end', backdropFilter:'blur(4px)' },
  modalBox:{ background:'#1e293b', borderRadius:'24px 24px 0 0', width:'100%', maxHeight:'90vh',
             overflowY:'auto', padding:'0 0 24px' },
  modalHdr:{ display:'flex', alignItems:'center', justifyContent:'space-between',
             padding:'16px 20px 12px', borderBottom:'1px solid #334155' },
  input:   { width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'12px',
             padding:'12px 14px', color:'#f1f5f9', fontSize:'14px', marginBottom:'10px', boxSizing:'border-box' },
  btn:     (variant='primary') => ({
    width:'100%', padding:'14px', borderRadius:'14px', border:'none', cursor:'pointer', fontWeight:700,
    fontSize:'15px', background:variant==='primary'?'linear-gradient(135deg,#6366f1,#ec4899)':'#334155',
    color:'white', marginTop:'8px',
  }),
  statCard:{ background:'#0f172a', borderRadius:'12px', padding:'12px', textAlign:'center', flex:1 },
  msgItem: { display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px',
             borderBottom:'1px solid #1e293b', cursor:'pointer' },
  closeBtn:{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' },
};

// ── Component ──────────────────────────────────────────────────
export default function MarketplacePage() {
  const [tab, setTab]                 = useState('browse');
  const [category, setCategory]       = useState('All');
  const [search, setSearch]           = useState('');
  const [wishlist, setWishlist]       = useState(new Set([2,5]));
  const [cart, setCart]               = useState(loadCart);
  const [browseListings, setBrowseListings] = useState(SEED_LISTINGS); // unified — new listings appended here
  const [myListings, setMyListings]   = useState(INITIAL_MY_LISTINGS);
  const [sellerChats, setSellerChats] = useState(INITIAL_CHATS);
  const [chatThreads, setChatThreads] = useState(INITIAL_THREADS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // modals
  const [itemModal, setItemModal]         = useState(null);
  const [cartOpen, setCartOpen]           = useState(false);
  const [checkoutOpen, setCheckoutOpen]   = useState(false);
  const [checkoutStep, setCheckoutStep]   = useState('shipping'); // 'shipping' | 'payment'
  const [createOpen, setCreateOpen]       = useState(false);
  const [chatModal, setChatModal]         = useState(null);
  const [notiOpen, setNotiOpen]           = useState(false);
  const [manageModal, setManageModal]     = useState(null); // listing being managed
  const [offerOpen, setOfferOpen]         = useState(false);
  const [offerAmount, setOfferAmount]     = useState('');

  // chat input
  const [chatMsg, setChatMsg]   = useState('');

  // checkout
  const [payMethod, setPayMethod]   = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shipping, setShipping]     = useState({ name:'', street:'', city:'', state:'', zip:'' });
  const [cardName, setCardName]     = useState('');

  // cart toast
  const [cartToast, setCartToast]   = useState('');

  // create listing form
  const [newTitle, setNewTitle]     = useState('');
  const [newPrice, setNewPrice]     = useState('');
  const [newCat, setNewCat]         = useState('Electronics');
  const [newCond, setNewCond]       = useState('Good');
  const [newDesc, setNewDesc]       = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTags, setNewTags]       = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  // manage listing edit fields
  const [editTitle, setEditTitle]   = useState('');
  const [editPrice, setEditPrice]   = useState('');
  const [editDesc, setEditDesc]     = useState('');

  // refs
  const fileInputRef  = useRef(null);
  const chatBottomRef = useRef(null);

  // ── Cart localStorage sync ─────────────────────────
  useEffect(() => {
    try { localStorage.setItem('connecthub_marketplace_cart', JSON.stringify(cart)); } catch {}
  }, [cart]);

  // ── Scroll chat to bottom on new message ──────────
  useEffect(() => {
    if (chatBottomRef.current) chatBottomRef.current.scrollIntoView({ behavior:'smooth' });
  }, [chatModal, chatThreads]);

  // ── Derived ────────────────────────────────────────
  const cartTotal       = cart.reduce((s,c) => s + c.listing.price * c.qty, 0);
  const wishlistItems   = browseListings.filter(l => wishlist.has(l.id));
  const unreadCount     = notifications.filter(n => !n.read).length;
  const activeListings  = myListings.filter(l => !l.sold).length;

  const filtered = browseListings.filter(l => {
    const catOk    = category==='All' || l.category===category;
    const searchOk = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.seller?.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  // ── Actions ────────────────────────────────────────
  function toggleWishlist(id) {
    setWishlist(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  }

  function addToCart(listing) {
    setCart(prev => {
      const ex = prev.find(c => c.listing.id===listing.id);
      if (ex) return prev.map(c => c.listing.id===listing.id ? {...c, qty:c.qty+1} : c);
      return [...prev, {listing, qty:1}];
    });
    // show toast
    setCartToast(listing.title.length>28 ? listing.title.slice(0,28)+'…' : listing.title);
    setTimeout(() => setCartToast(''), 2000);
    setItemModal(null);
  }

  function updateQty(id, delta) {
    setCart(prev => prev
      .map(c => c.listing.id===id ? {...c, qty: c.qty+delta} : c)
      .filter(c => c.qty > 0)
    );
  }

  function removeFromCart(id) { setCart(prev => prev.filter(c => c.listing.id!==id)); }

  function publishListing() {
    if (!newTitle || !newPrice) return;
    const nl = {
      id: Date.now(), title:newTitle, price:parseInt(newPrice), seller:'You',
      avatar:'📦', emoji:'📦', color:'#6366f1', category:newCat, condition:newCond,
      desc:newDesc, location:newLocation, tags:newTags, sold:false, views:0, likes:0,
    };
    setBrowseListings(prev => [nl, ...prev]);
    setMyListings(prev => [nl, ...prev]);
    setNewTitle(''); setNewPrice(''); setNewDesc(''); setNewLocation(''); setNewTags('');
    setPhotoPreview(null);
    setCreateOpen(false);
  }

  function placeOrder() {
    setCart([]); setCheckoutOpen(false); setOrderPlaced(true);
    setCheckoutStep('shipping'); setShipping({name:'',street:'',city:'',state:'',zip:''});
    setTimeout(() => setOrderPlaced(false), 3500);
  }

  // ── Chat ───────────────────────────────────────────
  function openChat(chat) {
    setChatModal(chat);
    // mark unread as read in list
    setSellerChats(prev => prev.map(c => c.id===chat.id ? {...c, unread:0} : c));
  }

  function sendMessage() {
    if (!chatMsg.trim() || !chatModal) return;
    const key = chatModal.id;
    setChatThreads(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { from:'seller', text: chatMsg.trim() }],
    }));
    // Also update preview in chat list
    setSellerChats(prev => prev.map(c => c.id===key ? {...c, msg:chatMsg.trim(), time:'now'} : c));
    setChatMsg('');
  }

  function openMessageFromItem(item) {
    setItemModal(null);
    const existingId = 'item_' + item.id;
    const existing = sellerChats.find(c => c.id===existingId);
    let chat;
    if (!existing) {
      chat = { id:existingId, name:item.seller, avatar:item.seller.slice(0,2).toUpperCase(),
               bg:'#6366f1', item:item.title, msg:'', time:'now', unread:0 };
      setSellerChats(prev => [chat, ...prev]);
      setChatThreads(prev => ({ ...prev, [existingId]: [] }));
    } else {
      chat = existing;
    }
    setTab('messages');
    setTimeout(() => setChatModal(chat), 50);
  }

  function sendOffer() {
    if (!offerAmount || !chatModal) return;
    const key = chatModal.id;
    const txt = `💰 I'd like to offer $${offerAmount} for this item.`;
    setChatThreads(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { from:'seller', text: txt }],
    }));
    setOfferAmount(''); setOfferOpen(false);
  }

  // ── Notifications ──────────────────────────────────
  function openNotifications() {
    setNotiOpen(true);
    setNotifications(prev => prev.map(n => ({...n, read:true})));
  }

  // ── Manage Listing ─────────────────────────────────
  function openManage(item) {
    setManageModal(item);
    setEditTitle(item.title); setEditPrice(String(item.price)); setEditDesc(item.desc||'');
  }

  function saveListing() {
    if (!editTitle || !editPrice) return;
    setMyListings(prev => prev.map(l => l.id===manageModal.id
      ? {...l, title:editTitle, price:parseInt(editPrice), desc:editDesc} : l));
    setBrowseListings(prev => prev.map(l => l.id===manageModal.id
      ? {...l, title:editTitle, price:parseInt(editPrice), desc:editDesc} : l));
    setManageModal(null);
  }

  function deleteListing(id) {
    setMyListings(prev => prev.filter(l => l.id!==id));
    setBrowseListings(prev => prev.filter(l => l.id!==id));
    setManageModal(null);
  }

  function markSold(id) {
    setMyListings(prev => prev.map(l => l.id===id ? {...l, sold:true} : l));
    setBrowseListings(prev => prev.map(l => l.id===id ? {...l, sold:true} : l));
    setManageModal(null);
  }

  // ── Photo upload ───────────────────────────────────
  function handlePhotoSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  }

  // ══════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════
  return (
    <div style={S.page}>

      {/* ── TOP BAR ─────────────────────────── */}
      <div style={S.topBar}>
        <span style={S.title}>🛒 Marketplace</span>
        <div style={{display:'flex', gap:'8px'}}>
          <button style={S.iconBtn} onClick={openNotifications} aria-label="Notifications">
            🔔
            {unreadCount>0 && <span style={S.badge}>{unreadCount}</span>}
          </button>
          <button style={S.iconBtn} onClick={()=>setCartOpen(true)} aria-label="Cart">
            🛒
            {cart.length>0 && <span style={S.badge}>{cart.length}</span>}
          </button>
        </div>
      </div>

      {/* ── NOTIFICATIONS PANEL ─────────────── */}
      {notiOpen && (
        <div style={S.modal} onClick={()=>setNotiOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700, fontSize:'16px'}}>🔔 Notifications</span>
              <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <button
                  onClick={()=>setNotifications(prev=>prev.map(n=>({...n,read:true})))}
                  style={{background:'none',border:'none',color:'#6366f1',fontSize:'12px',fontWeight:600,cursor:'pointer'}}
                >Mark all read</button>
                <button style={S.closeBtn} onClick={()=>setNotiOpen(false)}>✕</button>
              </div>
            </div>
            {notifications.map((n,i) => (
              <div key={n.id} style={{display:'flex',gap:'12px',padding:'14px 20px',
                borderBottom:'1px solid #1e293b',alignItems:'flex-start',
                background:n.read?'transparent':'rgba(99,102,241,0.06)'}}>
                <span style={{fontSize:'22px'}}>{n.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',color:'#f1f5f9',lineHeight:1.4}}>{n.text}</div>
                  <div style={{fontSize:'11px',color:'#64748b',marginTop:'4px'}}>{n.time}</div>
                </div>
                {!n.read && <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#6366f1',flexShrink:0,marginTop:'4px'}}/>}
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
          placeholder="Search items, sellers, tags..." autoComplete="off"
          style={{background:'none',border:'none',color:'#f1f5f9',fontSize:'14px',flex:1,outline:'none'}}
        />
        {search && <button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:'16px'}}>✕</button>}
      </div>

      {/* ── TABS (shortened labels to prevent overflow) ── */}
      <div style={S.tabRow}>
        {[['browse','🏪 Browse'],['selling','📦 Sell'],['wishlist','❤️ Saved'],['messages','💬 Inbox']].map(([key,label])=>(
          <button key={key} style={S.tab(tab===key)} onClick={()=>setTab(key)}>{label}</button>
        ))}
      </div>

      {/* ════════════════════════════════════
           TAB: BROWSE
         ════════════════════════════════════ */}
      {tab==='browse' && (
        <>
          {/* Category chips */}
          <div style={{display:'flex',gap:'8px',padding:'12px 16px',overflowX:'auto',scrollbarWidth:'none'}}>
            {CATEGORIES.map(c=>(
              <button key={c} style={S.catChip(category===c)} onClick={()=>setCategory(c)}>{c}</button>
            ))}
          </div>

          {/* Section header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px 10px'}}>
            <span style={{fontWeight:700,fontSize:'15px'}}>
              {search?`Results for "${search}"`:category==='All'?'Featured Listings':category}
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
              {filtered.map(item => (
                <div key={item.id} style={{...S.card, opacity:item.sold?0.5:1}} onClick={()=>!item.sold&&setItemModal(item)}>
                  <div style={S.cardImg(item.color)}>
                    <span style={{fontSize:'44px'}}>{item.avatar}</span>
                    {!item.sold && (
                      <button
                        onClick={e=>{e.stopPropagation();toggleWishlist(item.id);}}
                        style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.45)',
                                border:'none',borderRadius:'50%',width:'30px',height:'30px',
                                cursor:'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center'}}
                        aria-label={wishlist.has(item.id)?'Remove from wishlist':'Add to wishlist'}
                      >{wishlist.has(item.id)?'❤️':'🤍'}</button>
                    )}
                    <span style={{position:'absolute',bottom:'6px',left:'8px',background:'rgba(0,0,0,0.5)',
                                  borderRadius:'6px',padding:'2px 7px',fontSize:'10px',color:'white'}}>
                      {item.sold ? 'SOLD' : item.condition}
                    </span>
                  </div>
                  <div style={S.cardBody}>
                    <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'12px',lineHeight:1.3,marginBottom:'3px',
                                 overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                      {item.title}
                    </div>
                    <div style={{color:'#64748b',fontSize:'11px',marginBottom:'8px'}}>{item.seller}</div>
                    {!item.sold && (
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <span style={{color:'#10b981',fontWeight:800,fontSize:'15px'}}>${item.price}</span>
                        <button
                          onClick={e=>{e.stopPropagation();addToCart(item);}}
                          style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',color:'white',
                                  border:'none',borderRadius:'10px',padding:'5px 10px',fontSize:'11px',
                                  fontWeight:600,cursor:'pointer'}}
                        >+ Cart</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════
           TAB: SELLING
         ════════════════════════════════════ */}
      {tab==='selling' && (
        <>
          {/* Seller Stats — Active count is now dynamic */}
          <div style={{display:'flex',gap:'10px',padding:'16px',overflowX:'auto'}}>
            {[
              ['💰','$1,240','Revenue'],
              ['📦', String(activeListings),'Active'],
              ['⭐','4.9','Rating'],
              ['👁️','531','Views']
            ].map(([icon,val,lbl])=>(
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

          {/* My Listings — clickable to manage */}
          <div style={{padding:'0 16px 8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontWeight:700,fontSize:'15px'}}>My Listings</span>
            <span style={{color:'#64748b',fontSize:'13px'}}>{myListings.length} items</span>
          </div>
          <div style={S.grid2}>
            {myListings.map(item => (
              <div key={item.id} style={{...S.card,opacity:item.sold?0.6:1}} onClick={()=>openManage(item)}>
                <div style={S.cardImg(item.color)}>
                  <span style={{fontSize:'44px'}}>{item.emoji||item.avatar||'📦'}</span>
                  {item.sold && (
                    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',
                                 alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'16px'}}>
                      SOLD
                    </div>
                  )}
                  {!item.sold && (
                    <span style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.5)',
                                  borderRadius:'8px',padding:'2px 6px',fontSize:'10px',color:'white'}}>
                      ✏️ Edit
                    </span>
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
              {wishlistItems.map(item => (
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
           TAB: MESSAGES (INBOX)
         ════════════════════════════════════ */}
      {tab==='messages' && (
        <>
          <div style={{padding:'16px 16px 8px',fontWeight:700,fontSize:'15px'}}>💬 Inbox</div>
          {sellerChats.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',color:'#64748b'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>🗨️</div>
              <div style={{fontWeight:700,fontSize:'16px',color:'#f1f5f9',marginBottom:'8px'}}>No messages yet</div>
              <div style={{fontSize:'13px'}}>Browse listings and tap 💬 to start a conversation</div>
            </div>
          ) : sellerChats.map(chat => (
            <div key={chat.id} style={S.msgItem} onClick={()=>openChat(chat)}>
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
            <div style={{height:'200px',background:itemModal.color,display:'flex',alignItems:'center',
                         justifyContent:'center',fontSize:'80px',borderRadius:'24px 24px 0 0',position:'relative'}}>
              {itemModal.avatar}
              <button onClick={()=>setItemModal(null)}
                style={{position:'absolute',top:'12px',right:'12px',background:'rgba(0,0,0,0.5)',
                        border:'none',borderRadius:'50%',width:'32px',height:'32px',
                        color:'white',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'8px'}}>
                <h2 style={{fontSize:'18px',fontWeight:800,color:'#f1f5f9',margin:0,flex:1,paddingRight:'12px'}}>{itemModal.title}</h2>
                <span style={{color:'#10b981',fontWeight:800,fontSize:'22px',flexShrink:0}}>${itemModal.price}</span>
              </div>

              <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>📦 {itemModal.condition}</span>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>📍 {itemModal.location}</span>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>🏷️ {itemModal.category}</span>
              </div>

              <p style={{color:'#94a3b8',fontSize:'14px',lineHeight:1.6,marginBottom:'16px'}}>{itemModal.desc}</p>

              {/* Seller info */}
              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',
                           background:'#0f172a',borderRadius:'12px',marginBottom:'16px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'#334155',
                             display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>👤</div>
                <div>
                  <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'14px'}}>{itemModal.seller}</div>
                  <div style={{color:'#64748b',fontSize:'12px'}}>⭐ 4.8 · 23 sales · Member since 2022</div>
                </div>
                <button
                  onClick={()=>openMessageFromItem(itemModal)}
                  style={{marginLeft:'auto',background:'#1e293b',border:'none',borderRadius:'10px',
                          padding:'8px 12px',color:'#6366f1',fontWeight:600,fontSize:'13px',cursor:'pointer'}}
                >💬 Message</button>
              </div>

              <div style={{display:'flex',gap:'10px'}}>
                <button
                  onClick={()=>toggleWishlist(itemModal.id)}
                  style={{flex:'0 0 auto',padding:'14px 18px',borderRadius:'14px',border:'1px solid #334155',
                          background:'#1e293b',color:wishlist.has(itemModal.id)?'#ef4444':'#94a3b8',cursor:'pointer',fontSize:'20px'}}
                  aria-label="Save to wishlist"
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
              <button style={S.closeBtn} onClick={()=>setCartOpen(false)}>✕</button>
            </div>
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
                      <div style={{color:'#10b981',fontWeight:700,fontSize:'14px'}}>${c.listing.price * c.qty}</div>
                    </div>
                    {/* Quantity controls */}
                    <div style={{display:'flex',alignItems:'center',gap:'6px',flexShrink:0}}>
                      <button onClick={()=>updateQty(c.listing.id,-1)}
                        style={{background:'#334155',border:'none',borderRadius:'6px',width:'26px',height:'26px',
                                color:'#f1f5f9',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                      <span style={{fontSize:'14px',fontWeight:700,color:'#f1f5f9',minWidth:'16px',textAlign:'center'}}>{c.qty}</span>
                      <button onClick={()=>updateQty(c.listing.id,1)}
                        style={{background:'#334155',border:'none',borderRadius:'6px',width:'26px',height:'26px',
                                color:'#f1f5f9',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                      <button onClick={()=>removeFromCart(c.listing.id)}
                        style={{background:'#1e293b',border:'1px solid #475569',borderRadius:'6px',width:'26px',height:'26px',
                                color:'#94a3b8',cursor:'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',marginLeft:'4px'}}>×</button>
                    </div>
                  </div>
                ))}
                <div style={{padding:'16px 20px',borderTop:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{color:'#94a3b8',fontSize:'14px'}}>Total</span>
                  <span style={{fontWeight:800,fontSize:'20px',color:'#f1f5f9'}}>${cartTotal}</span>
                </div>
                <div style={{padding:'0 20px'}}>
                  <button style={S.btn()} onClick={()=>{setCartOpen(false);setCheckoutOpen(true);setCheckoutStep('shipping');}}>
                    Checkout — ${cartTotal}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
           MODAL: CHECKOUT (2 Steps)
         ════════════════════════════════════ */}
      {checkoutOpen && (
        <div style={S.modal} onClick={()=>setCheckoutOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <div>
                <span style={{fontWeight:700,fontSize:'16px'}}>💳 Checkout</span>
                <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>
                  Step {checkoutStep==='shipping'?'1':'2'} of 2 — {checkoutStep==='shipping'?'Shipping Address':'Payment'}
                </div>
              </div>
              <button style={S.closeBtn} onClick={()=>setCheckoutOpen(false)}>✕</button>
            </div>

            {orderPlaced ? (
              <div style={{textAlign:'center',padding:'40px'}}>
                <div style={{fontSize:'60px',marginBottom:'16px'}}>✅</div>
                <div style={{fontWeight:700,fontSize:'18px',color:'#f1f5f9'}}>Order Placed!</div>
                <div style={{color:'#64748b',marginTop:'8px'}}>You'll receive a confirmation shortly.</div>
                <div style={{color:'#64748b',fontSize:'12px',marginTop:'4px'}}>Delivering to: {shipping.city}, {shipping.state}</div>
              </div>
            ) : checkoutStep==='shipping' ? (
              <div style={{padding:'20px'}}>
                <div style={{fontWeight:600,fontSize:'13px',color:'#94a3b8',marginBottom:'12px'}}>SHIPPING ADDRESS</div>
                <input style={S.input} placeholder="Full Name *" value={shipping.name}
                  onChange={e=>setShipping(s=>({...s,name:e.target.value}))} />
                <input style={S.input} placeholder="Street Address *" value={shipping.street}
                  onChange={e=>setShipping(s=>({...s,street:e.target.value}))} />
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                  <input style={{...S.input,marginBottom:0}} placeholder="City *" value={shipping.city}
                    onChange={e=>setShipping(s=>({...s,city:e.target.value}))} />
                  <input style={{...S.input,marginBottom:0}} placeholder="State" value={shipping.state}
                    onChange={e=>setShipping(s=>({...s,state:e.target.value}))} />
                </div>
                <input style={S.input} placeholder="ZIP Code" value={shipping.zip}
                  onChange={e=>setShipping(s=>({...s,zip:e.target.value}))} />

                {/* Local pickup option */}
                <div onClick={()=>setShipping({name:'Local Pickup',street:'',city:'Pickup',state:'',zip:''})}
                  style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px',borderRadius:'12px',
                          border:'1px solid #334155',cursor:'pointer',marginBottom:'10px',background:'transparent'}}>
                  <span style={{fontSize:'20px'}}>📍</span>
                  <span style={{color:'#94a3b8',fontSize:'13px'}}>Or select <strong style={{color:'#f1f5f9'}}>Local Pickup</strong> instead</span>
                </div>

                <button style={S.btn()} onClick={()=>{if(shipping.name&&shipping.city)setCheckoutStep('payment');}}>
                  Continue to Payment →
                </button>
              </div>
            ) : (
              <div style={{padding:'20px'}}>
                {/* Total summary */}
                <div style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',borderRadius:'16px',padding:'20px',textAlign:'center',marginBottom:'20px'}}>
                  <div style={{fontSize:'12px',opacity:0.9,marginBottom:'4px'}}>Total Amount</div>
                  <div style={{fontSize:'38px',fontWeight:800,color:'white'}}>${cartTotal}</div>
                  <div style={{fontSize:'11px',opacity:0.8,marginTop:'2px'}}>{cart.length} item{cart.length!==1?'s':''} · Shipping to {shipping.city||'Pickup'}</div>
                </div>

                {/* Payment method */}
                <div style={{marginBottom:'14px'}}>
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

                {/* Card fields */}
                {payMethod==='card' && (
                  <>
                    <input style={S.input} placeholder="Cardholder Name" value={cardName} onChange={e=>setCardName(e.target.value)} />
                    <input style={S.input} placeholder="Card Number" />
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                      <input style={{...S.input,marginBottom:0}} placeholder="MM/YY" />
                      <input style={{...S.input,marginBottom:0}} placeholder="CVV" />
                    </div>
                    <div style={{height:'10px'}}/>
                  </>
                )}

                <div style={{display:'flex',gap:'10px'}}>
                  <button style={{...S.btn('secondary'),flex:'0 0 auto',width:'auto',padding:'14px 18px'}}
                    onClick={()=>setCheckoutStep('shipping')}>← Back</button>
                  <button style={{...S.btn(),flex:1,marginTop:'8px'}} onClick={placeOrder}>
                    🔒 Place Order — ${cartTotal}
                  </button>
                </div>
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
              <button style={S.closeBtn} onClick={()=>setCreateOpen(false)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {/* Hidden file input */}
              <input type="file" ref={fileInputRef} accept="image/*" multiple
                style={{display:'none'}} onChange={handlePhotoSelect} />

              {/* Photo upload — now functional */}
              <div
                onClick={()=>fileInputRef.current&&fileInputRef.current.click()}
                style={{height:'120px',background:'#0f172a',borderRadius:'14px',
                        border:`2px dashed ${photoPreview?'#6366f1':'#334155'}`,
                        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                        marginBottom:'14px',cursor:'pointer',color:'#64748b',overflow:'hidden',position:'relative'}}>
                {photoPreview ? (
                  <img src={photoPreview} alt="preview"
                    style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'12px'}} />
                ) : (
                  <>
                    <div style={{fontSize:'32px',marginBottom:'6px'}}>📷</div>
                    <div style={{fontSize:'13px'}}>Tap to add photos</div>
                  </>
                )}
              </div>

              <input style={S.input} placeholder="Item Title *" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
              <input style={S.input} placeholder="Price ($) *" type="number" value={newPrice} onChange={e=>setNewPrice(e.target.value)} />
              <input style={S.input} placeholder="📍 Location (city, state)" value={newLocation} onChange={e=>setNewLocation(e.target.value)} />

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <select style={{...S.input,marginBottom:0}} value={newCat} onChange={e=>setNewCat(e.target.value)}>
                  {CATEGORIES.slice(1).map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <select style={{...S.input,marginBottom:0}} value={newCond} onChange={e=>setNewCond(e.target.value)}>
                  {['New','Like New','Good','Fair','Poor'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>

              <textarea
                style={{...S.input,minHeight:'70px',resize:'vertical',fontFamily:'inherit'}}
                placeholder="Description — add details to sell faster!"
                value={newDesc} onChange={e=>setNewDesc(e.target.value)}
              />
              <input style={S.input} placeholder="Tags (comma-separated): vintage, vinyl, 70s"
                value={newTags} onChange={e=>setNewTags(e.target.value)} />

              <button style={S.btn()} onClick={publishListing}>🚀 Publish Listing</button>
              <button style={S.btn('secondary')} onClick={()=>setCreateOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
           MODAL: MANAGE LISTING
         ════════════════════════════════════ */}
      {manageModal && (
        <div style={S.modal} onClick={()=>setManageModal(null)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>⚙️ Manage Listing</span>
              <button style={S.closeBtn} onClick={()=>setManageModal(null)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {/* Listing preview */}
              <div style={{display:'flex',gap:'12px',marginBottom:'20px',padding:'12px',background:'#0f172a',borderRadius:'12px'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'10px',background:manageModal.color,
                             display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',flexShrink:0}}>
                  {manageModal.emoji||manageModal.avatar||'📦'}
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'13px'}}>{manageModal.title}</div>
                  <div style={{color:'#10b981',fontSize:'13px',fontWeight:700}}>${manageModal.price}</div>
                  <div style={{color:'#64748b',fontSize:'11px'}}>👁️ {manageModal.views} views · ❤️ {manageModal.likes} likes</div>
                </div>
              </div>

              {/* Edit fields */}
              <div style={{fontWeight:600,fontSize:'13px',color:'#94a3b8',marginBottom:'10px'}}>EDIT LISTING</div>
              <input style={S.input} placeholder="Title" value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
              <input style={S.input} placeholder="Price ($)" type="number" value={editPrice} onChange={e=>setEditPrice(e.target.value)} />
              <textarea style={{...S.input,minHeight:'60px',resize:'vertical',fontFamily:'inherit'}}
                placeholder="Description" value={editDesc} onChange={e=>setEditDesc(e.target.value)} />

              <button style={S.btn()} onClick={saveListing}>💾 Save Changes</button>

              {/* Action buttons */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'12px'}}>
                {!manageModal.sold && (
                  <button
                    onClick={()=>markSold(manageModal.id)}
                    style={{padding:'12px',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:600,
                            fontSize:'13px',background:'#10b981',color:'white'}}>
                    ✅ Mark as Sold
                  </button>
                )}
                <button
                  onClick={()=>deleteListing(manageModal.id)}
                  style={{padding:'12px',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:600,
                          fontSize:'13px',background:'#ef4444',color:'white',
                          gridColumn:manageModal.sold?'1 / -1':'auto'}}>
                  🗑️ Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
           MODAL: SELLER CHAT (functional send)
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
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <button
                  onClick={()=>setOfferOpen(true)}
                  style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'10px',
                          padding:'6px 10px',color:'#a5b4fc',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                  💰 Offer
                </button>
                <button style={S.closeBtn} onClick={()=>setChatModal(null)}>✕</button>
              </div>
            </div>

            {/* Message thread — now rendered from state */}
            <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
              {(chatThreads[chatModal.id] || []).map((msg, i) => (
                <div key={i} style={{display:'flex',justifyContent:msg.from==='seller'?'flex-end':'flex-start'}}>
                  <div style={{
                    background: msg.from==='seller'
                      ? 'linear-gradient(135deg,#6366f1,#ec4899)'
                      : '#1e293b',
                    borderRadius: msg.from==='seller'
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                    padding:'10px 14px',maxWidth:'75%',fontSize:'14px',
                    color: msg.from==='seller'?'white':'#f1f5f9',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input area */}
            <div style={{display:'flex',gap:'10px',padding:'12px 16px',borderTop:'1px solid #1e293b'}}>
              <input
                value={chatMsg}
                onChange={e=>setChatMsg(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter') sendMessage(); }}
                placeholder="Type a message..."
                style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:'20px',
                        padding:'10px 16px',color:'#f1f5f9',fontSize:'14px',outline:'none'}}
              />
              <button
                onClick={sendMessage}
                style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',borderRadius:'50%',
                        width:'40px',height:'40px',color:'white',cursor:'pointer',fontSize:'18px',flexShrink:0,
                        display:'flex',alignItems:'center',justifyContent:'center'}}
                aria-label="Send message"
              >➤</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
           MODAL: MAKE OFFER
         ════════════════════════════════════ */}
      {offerOpen && (
        <div style={S.modal} onClick={()=>setOfferOpen(false)}>
          <div style={{...S.modalBox,maxHeight:'40vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>💰 Make an Offer</span>
              <button style={S.closeBtn} onClick={()=>setOfferOpen(false)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'12px'}}>
                Re: {chatModal?.item} — enter your offer price:
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                <span style={{color:'#10b981',fontSize:'20px',fontWeight:800}}>$</span>
                <input
                  type="number" placeholder="0.00" value={offerAmount}
                  onChange={e=>setOfferAmount(e.target.value)}
                  style={{...S.input,marginBottom:0,flex:1,fontSize:'20px',fontWeight:700}}
                />
              </div>
              <button style={S.btn()} onClick={sendOffer}>Send Offer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CART-ADD TOAST ───────────────────────── */}
      {cartToast && (
        <div style={{position:'fixed',bottom:'140px',left:'50%',transform:'translateX(-50%)',
                     background:'#1e293b',border:'1px solid #6366f1',color:'#f1f5f9',
                     padding:'10px 20px',borderRadius:'12px',fontWeight:600,zIndex:200,
                     whiteSpace:'nowrap',fontSize:'13px',boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
          🛒 Added: {cartToast}
        </div>
      )}

      {/* ── ORDER SUCCESS TOAST ──────────────────── */}
      {orderPlaced && (
        <div style={{position:'fixed',bottom:'140px',left:'50%',transform:'translateX(-50%)',
                     background:'#10b981',color:'white',padding:'12px 24px',borderRadius:'12px',
                     fontWeight:700,zIndex:200,whiteSpace:'nowrap'}}>
          ✅ Order placed successfully!
        </div>
      )}

      {/* ── FAB (raised to 100px so no toast collision) ── */}
      {tab!=='selling' && (
        <button
          onClick={()=>setCreateOpen(true)}
          aria-label="Create new listing"
          style={{position:'fixed',bottom:'100px',right:'20px',width:'52px',height:'52px',borderRadius:'50%',
                  background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',color:'white',
                  fontSize:'24px',cursor:'pointer',zIndex:50,boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
                  display:'flex',alignItems:'center',justifyContent:'center'}}
        >+</button>
      )}
    </div>
  );
}
