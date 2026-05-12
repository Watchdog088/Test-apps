/**
 * MarketplacePage.jsx — Full Marketplace (Sprint 3 Complete Version)
 *
 * ROUND 1 (19 fixes, 58→73): chat, checkout, photo upload, badge, unified state,
 *   cart qty, active count, manage modal, orphan chat, localStorage, FAB/toast,
 *   tabs, cart toast, mark-all-read, location+tags, cardholder, offer, manage
 *
 * ROUND 2 (8 additions, 73→88): P-01 loading states, P-02 photo progress,
 *   P-03 order history, P-04 filters, P-05 reviews, P-06 seller profile,
 *   P-07 buyer protection, P-08 verification badges
 *
 * ROUND 3 (12 additions, 88→95):
 * ✅ R3-01: Report Listing modal (reason picker + submit)
 * ✅ R3-02: Write a Review modal (star picker + text + submits to localReviews)
 * ✅ R3-03: Share Listing button (Web Share API + clipboard fallback)
 * ✅ R3-04: Promo Code in checkout (WELCOME10=10% off, SAVE5=flat $5)
 * ✅ R3-05: Message read receipts (✓✓ Sent on outbound chat messages)
 * ✅ R3-06: Actionable notifications (Accept/Counter/Decline offer, Track Order)
 * ✅ R3-07: Recent Searches (last 5, localStorage, chips below search bar)
 * ✅ R3-08: Load More pagination (8 per page, Load More button)
 * ✅ R3-09: Order cancellation with confirm dialog
 * ✅ R3-10: Leave Review button from Order History
 * ✅ R3-11: localReviews state (new reviews persist in session)
 * ✅ R3-12: Escape key closes all modals (keyboard accessibility)
 *
 * STILL NEEDS REAL BACKEND:
 * ⏳ BE-01: Replace setTimeout with marketplaceApi.getListings()
 * ⏳ BE-02: Replace blob URL with Cloudinary.upload()
 * ⏳ BE-03: Move orders from localStorage to Firestore/DB
 * ⏳ BE-04: Stripe/PayPal real payment SDK
 * ⏳ BE-05: Identity verification service for seller badges
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ── Seed Data ─────────────────────────────────────────────────
const SEED_LISTINGS = [
  { id:1,  title:'Vintage Vinyl Records (Set of 10)', price:45,  seller:'Jordan M.',  verified:true,  avatar:'🎵', color:'#ec4899', category:'Music',      condition:'Good',    location:'Brooklyn, NY',   desc:'Rare 70s/80s collection. All in great condition. Includes Led Zeppelin, Pink Floyd, and more.', tags:'vintage,vinyl,records,music', likes:24 },
  { id:2,  title:'Pro Camera Lens 50mm f/1.8',        price:299, seller:'Alex C.',    verified:true,  avatar:'📸', color:'#6366f1', category:'Electronics', condition:'Like New', location:'Los Angeles, CA', desc:'Used only twice. Nikon mount. Includes original box and lens cap. Sharp images guaranteed.', tags:'camera,lens,photography,nikon', likes:41 },
  { id:3,  title:'Fitness Equipment Bundle',           price:120, seller:'Riley J.',  verified:false, avatar:'💪', color:'#10b981', category:'Fitness',     condition:'Good',    location:'Austin, TX',     desc:'Resistance bands, dumbbells (5–25 lb), yoga mat. Perfect for home gym setup.', tags:'fitness,gym,exercise,weights', likes:18 },
  { id:4,  title:'Handmade Ceramic Bowl Set (6pc)',   price:68,  seller:'Morgan T.', verified:true,  avatar:'🏺', color:'#f59e0b', category:'Art',         condition:'New',     location:'Portland, OR',   desc:'Each piece is hand-thrown and glazed. Food-safe. Dishwasher-safe. Ships in 3 days.', tags:'ceramic,handmade,bowls,art', likes:37 },
  { id:5,  title:'Gaming Chair RGB Lighting',          price:189, seller:'Casey L.',  verified:false, avatar:'🎮', color:'#3b82f6', category:'Gaming',      condition:'Good',    location:'Chicago, IL',    desc:'Ergonomic lumbar support. USB RGB control. Slightly used — perfect condition.', tags:'gaming,chair,rgb,furniture', likes:52 },
  { id:6,  title:'Cooking Masterclass Book Bundle',    price:25,  seller:'Sam R.',    verified:false, avatar:'📚', color:'#8b5cf6', category:'Books',       condition:'Good',    location:'Seattle, WA',    desc:'4 books: Julia Child, Ottolenghi, Baking Bible, Noma Guide. All paperback.', tags:'books,cooking,recipes,food', likes:9 },
  { id:7,  title:'Mechanical Keyboard TKL',            price:145, seller:'Drew K.',   verified:true,  avatar:'⌨️', color:'#06b6d4', category:'Electronics', condition:'Like New', location:'Denver, CO',    desc:'Cherry MX Blue switches. PBT keycaps. USB-C. Includes carrying case.', tags:'keyboard,mechanical,gaming,pc', likes:63 },
  { id:8,  title:'Acoustic Guitar (Yamaha FG800)',     price:220, seller:'Quinn P.',  verified:false, avatar:'🎸', color:'#ef4444', category:'Music',       condition:'Good',    location:'Nashville, TN',  desc:'Excellent beginner/intermediate guitar. Includes gig bag and tuner.', tags:'guitar,acoustic,yamaha,music', likes:28 },
  { id:9,  title:'Standing Desk Converter',            price:85,  seller:'Jamie A.',  verified:false, avatar:'🖥️', color:'#64748b', category:'Office',      condition:'Good',    location:'Boston, MA',     desc:'Height adjustable. Fits two monitors. Solid aluminum build. Easy assembly.', tags:'desk,office,standup,ergonomic', likes:15 },
  { id:10, title:'Air Fryer XL 5.8QT',                price:55,  seller:'Taylor H.', verified:false, avatar:'🍳', color:'#f97316', category:'Kitchen',     condition:'Good',    location:'Phoenix, AZ',    desc:'Used 20 times. Non-stick basket. Digital display. Includes recipe book.', tags:'airfryer,kitchen,cooking,appliance', likes:33 },
  { id:11, title:'Skateboard Complete Setup',          price:95,  seller:'Blake V.',  verified:false, avatar:'🛹', color:'#84cc16', category:'Sports',      condition:'Good',    location:'San Diego, CA',  desc:'8" deck, Indy trucks, 54mm wheels. Bearings recently replaced.', tags:'skateboard,sports,outdoor,skate', likes:21 },
  { id:12, title:'Polaroid Now Camera + Film',         price:78,  seller:'Avery N.',  verified:true,  avatar:'📷', color:'#a855f7', category:'Electronics', condition:'Like New', location:'Miami, FL',     desc:'Includes two packs of film (20 shots). Strap included.', tags:'polaroid,camera,film,photography', likes:47 },
  { id:13, title:'Plant Bundle (Succulents ×5)',        price:30,  seller:'Peyton G.', verified:false, avatar:'🌵', color:'#22c55e', category:'Home',        condition:'New',     location:'Austin, TX',     desc:'Variety pack. Each in 3" pot. Easy care. Ships Monday/Wednesday.', tags:'plants,succulents,home,garden', likes:29 },
  { id:14, title:'Lego Star Wars Millennium Falcon',   price:350, seller:'Reese T.',  verified:true,  avatar:'🚀', color:'#0ea5e9', category:'Toys',        condition:'Like New', location:'NYC, NY',       desc:'99% complete. Box included. Retired set 75105.', tags:'lego,starwars,toys,collectible', likes:88 },
  { id:15, title:'Yoga Mat Premium (6mm)',              price:38,  seller:'Sage M.',   verified:false, avatar:'🧘', color:'#fb923c', category:'Fitness',     condition:'New',     location:'Denver, CO',     desc:'Never used. Non-slip. Includes carrying strap. Regular retail $75.', tags:'yoga,fitness,mat,exercise', likes:16 },
  { id:16, title:'Smart Watch (Fitbit Versa 3)',        price:99,  seller:'Cody R.',   verified:true,  avatar:'⌚', color:'#2563eb', category:'Electronics', condition:'Good',    location:'Atlanta, GA',    desc:'GPS + heart rate. All-day battery. Includes 2 bands. Charger included.', tags:'smartwatch,fitbit,fitness,tech', likes:54 },
];

const SEED_SELLER_PROFILES = {
  'Jordan M.':  { rating:4.8, sales:47,  memberSince:'Jan 2022', verified:true,  bio:'Vintage collector based in Brooklyn. Specializing in 70s-80s music memorabilia and rare vinyl.', avatar:'🎵', color:'#ec4899' },
  'Alex C.':    { rating:4.9, sales:112, memberSince:'Mar 2021', verified:true,  bio:'Professional photographer selling used gear. All items tested and verified.', avatar:'📸', color:'#6366f1' },
  'Riley J.':   { rating:4.6, sales:23,  memberSince:'Aug 2023', verified:false, bio:'Fitness enthusiast downsizing home gym equipment. Everything in great shape.', avatar:'💪', color:'#10b981' },
  'Morgan T.':  { rating:5.0, sales:89,  memberSince:'Oct 2020', verified:true,  bio:'Studio ceramicist. All handmade pieces. Custom orders available.', avatar:'🏺', color:'#f59e0b' },
  'Casey L.':   { rating:4.7, sales:31,  memberSince:'Nov 2022', verified:false, bio:'Tech and gaming enthusiast. Upgrading setup, selling quality used gear.', avatar:'🎮', color:'#3b82f6' },
  'Drew K.':    { rating:4.9, sales:67,  memberSince:'Feb 2021', verified:true,  bio:'PC builder. Meticulous about condition. All items as described or full refund.', avatar:'⌨️', color:'#06b6d4' },
  'Reese T.':   { rating:4.8, sales:28,  memberSince:'Jun 2021', verified:true,  bio:'Lego collector. Sets are complete or clearly noted. 5-star packaging guaranteed.', avatar:'🚀', color:'#0ea5e9' },
  'Cody R.':    { rating:4.7, sales:44,  memberSince:'Sep 2022', verified:true,  bio:'Tech gadget reseller. Honest condition ratings, fast shipping.', avatar:'⌚', color:'#2563eb' },
  'Avery N.':   { rating:4.9, sales:58,  memberSince:'Apr 2021', verified:true,  bio:'Photography lover. All camera gear tested. Includes original packaging where possible.', avatar:'📷', color:'#a855f7' },
};

const SEED_REVIEWS = {
  1: [
    { reviewer:'Emma L.',  rating:5, text:'Amazing collection! Records in perfect condition. Jordan packed them super carefully.', time:'2 weeks ago' },
    { reviewer:'Chris B.', rating:4, text:'Good variety, a couple sleeves had minor wear but records played perfectly. Fast shipping!', time:'1 month ago' },
    { reviewer:'Nora P.',  rating:5, text:'Exactly as described. Incredible find for a collector!', time:'2 months ago' },
  ],
  2: [
    { reviewer:'Sam W.',  rating:5, text:'Lens is absolutely like new. Alex shipped same day. Highly recommend!', time:'1 week ago' },
    { reviewer:'Dana K.', rating:5, text:'Perfect condition, great price for a 50mm f/1.8. Already used it for a portrait shoot.', time:'3 weeks ago' },
  ],
  5: [
    { reviewer:'Ray M.',  rating:4, text:'Chair is comfortable and RGB is cool. One USB port was slightly loose but works fine.', time:'3 weeks ago' },
    { reviewer:'Jess T.', rating:5, text:'Great chair for the price! Casey was very helpful with delivery.', time:'1 month ago' },
  ],
  7: [
    { reviewer:'Leo F.',  rating:5, text:'Incredible keyboard. Drew was honest about condition (truly like new). Fast shipping!', time:'5 days ago' },
    { reviewer:'Alex R.', rating:5, text:'My favorite keyboard purchase. Cherry MX Blues are so satisfying. 10/10 seller.', time:'2 weeks ago' },
    { reviewer:'Kim S.',  rating:5, text:'Perfectly packed, exactly as described. Would buy from Drew again.', time:'1 month ago' },
  ],
  14: [
    { reviewer:'Tom B.',  rating:5, text:'Set was 100% complete, Reese miscounted before listing and corrected it. Excellent!', time:'1 week ago' },
    { reviewer:'Lisa H.', rating:5, text:'Best Lego seller on the platform. Perfect packaging, all pieces present.', time:'3 weeks ago' },
  ],
};

const INITIAL_MY_LISTINGS = [
  { id:101, title:'MacBook Pro 13" 2021', price:850, emoji:'💻', color:'#6366f1', sold:false, views:247, likes:18, location:'Washington, DC', desc:'M1 chip, 8GB RAM, 256GB SSD. Battery at 94%.', category:'Electronics', condition:'Good' },
  { id:102, title:'Nikon D3500 DSLR Kit', price:420, emoji:'📷', color:'#ec4899', sold:true,  views:189, likes:32, location:'Washington, DC', desc:'Body + 18-55mm + 70-300mm lens. Low shutter count.', category:'Electronics', condition:'Good' },
  { id:103, title:'iPad Air 4th Gen',     price:450, emoji:'📱', color:'#10b981', sold:false, views:95,  likes:7,  location:'Washington, DC', desc:'64GB, Space Gray. Apple Pencil 2nd gen + Smart Folio.', category:'Electronics', condition:'Like New' },
];

const INITIAL_CHATS = [
  { id:'c1', name:'Sarah Miller', avatar:'SM', bg:'#6366f1', item:'Vintage Vinyl Records', msg:'Is this still available?', time:'2m',  unread:2 },
  { id:'c2', name:'James W.',     avatar:'JW', bg:'#ec4899', item:'Pro Camera Lens',       msg:'Can you do $280?',         time:'15m', unread:0 },
  { id:'c3', name:'Emma L.',      avatar:'EL', bg:'#10b981', item:'Fitness Bundle',         msg:'Thanks! Will pick up Sat', time:'1h',  unread:0 },
  { id:'c4', name:'Marcus T.',    avatar:'MT', bg:'#f59e0b', item:'Gaming Chair RGB',       msg:'Does it ship to Texas?',   time:'3h',  unread:1 },
];

const INITIAL_THREADS = {
  c1: [
    { from:'buyer',  text:'Hi! Is this still available?' },
    { from:'seller', text:'Yes, still available! Feel free to make an offer.' },
    { from:'buyer',  text:'Would you take $35 for it?' },
  ],
  c2: [
    { from:'buyer',  text:'Love the lens — can you do $280?' },
    { from:'seller', text:"Best I can do is $290, it's like new." },
  ],
  c3: [
    { from:'buyer',  text:'Is the bundle still for sale?' },
    { from:'seller', text:'Yes! Everything is in great shape.' },
    { from:'buyer',  text:'Thanks! Will pick up Sat morning.' },
  ],
  c4: [{ from:'buyer', text:'Does it ship to Texas? How much?' }],
};

const INITIAL_NOTIFICATIONS = [
  { id:'n1', icon:'💰', text:'Sarah Miller offered $40 for your Vinyl Records', time:'5m ago',  read:false },
  { id:'n2', icon:'❤️', text:'12 people liked your Camera Lens listing',        time:'1h ago',  read:false },
  { id:'n3', icon:'📦', text:'Your order from Alex C. shipped! Track: #12945',  time:'2h ago',  read:false },
  { id:'n4', icon:'⭐', text:'You received a 5-star review from Emma L.',        time:'1d ago',  read:true  },
];

const CATEGORIES  = ['All','Electronics','Music','Fitness','Art','Gaming','Books','Office','Kitchen','Sports','Home','Toys'];
const CONDITIONS  = ['All','New','Like New','Good','Fair','Poor'];
const SORT_OPTIONS = [
  { value:'newest',     label:'Newest First' },
  { value:'price_asc',  label:'Price: Low → High' },
  { value:'price_desc', label:'Price: High → Low' },
  { value:'popular',    label:'Most Popular' },
];
const REPORT_REASONS = [
  'Counterfeit / fake item',
  'Prohibited item',
  'Misleading photos or description',
  'Price gouging',
  'Spam / duplicate listing',
  'Fraudulent seller',
];

function loadCart()   { try { return JSON.parse(localStorage.getItem('mkt_cart')  ||'[]'); } catch { return []; } }
function loadOrders() { try { return JSON.parse(localStorage.getItem('mkt_orders')||'[]'); } catch { return []; } }
function loadRecent() { try { return JSON.parse(localStorage.getItem('mkt_recent')||'[]'); } catch { return []; } }
function avgRating(reviews) {
  if (!reviews || !reviews.length) return null;
  return (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1);
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  page:    { background:'#0f172a', minHeight:'100vh', paddingBottom:'80px', color:'#f1f5f9' },
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
  tab:     (a)=>({ flex:'1 1 0', padding:'11px 4px', fontSize:'12px', fontWeight:a?700:500,
                   color:a?'#6366f1':'#64748b', cursor:'pointer', whiteSpace:'nowrap', background:'none',
                   border:'none', borderBottom:a?'2px solid #6366f1':'2px solid transparent', textAlign:'center' }),
  catChip: (a)=>({ flex:'0 0 auto', padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:a?700:500,
                   background:a?'#6366f1':'#1e293b', color:a?'white':'#94a3b8', cursor:'pointer', border:'none' }),
  grid2:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', padding:'12px 16px' },
  card:    { background:'#1e293b', borderRadius:'16px', overflow:'hidden', cursor:'pointer', border:'1px solid #334155' },
  cardImg: (c)=>({ height:'110px', background:c, display:'flex', alignItems:'center',
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
  btn:     (v='primary')=>({ width:'100%', padding:'14px', borderRadius:'14px', border:'none', cursor:'pointer',
             fontWeight:700, fontSize:'15px', color:'white', marginTop:'8px',
             background:v==='primary'?'linear-gradient(135deg,#6366f1,#ec4899)':
                        v==='green'?'#10b981':v==='red'?'#ef4444':'#334155' }),
  statCard:{ background:'#0f172a', borderRadius:'12px', padding:'12px', textAlign:'center', flex:1 },
  msgItem: { display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px',
             borderBottom:'1px solid #1e293b', cursor:'pointer' },
  closeBtn:{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' },
};

// ── Component ─────────────────────────────────────────────────
export default function MarketplacePage() {
  // ── Tab / view state ─────────────────────────────
  const [tab, setTab]                     = useState('browse');
  const [viewingOrders, setViewingOrders] = useState(false);

  // ── Browse filters ───────────────────────────────
  const [category, setCategory]     = useState('All');
  const [search, setSearch]         = useState('');
  const [sortBy, setSortBy]         = useState('newest');
  const [filterCond, setFilterCond] = useState('All');
  const [priceMax, setPriceMax]     = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  // ── Data state ───────────────────────────────────
  const [browseListings, setBrowseListings] = useState(SEED_LISTINGS);
  const [myListings, setMyListings]         = useState(INITIAL_MY_LISTINGS);
  const [sellerChats, setSellerChats]       = useState(INITIAL_CHATS);
  const [chatThreads, setChatThreads]       = useState(INITIAL_THREADS);
  const [notifications, setNotifications]   = useState(INITIAL_NOTIFICATIONS);
  const [wishlist, setWishlist]             = useState(new Set([2,5]));
  const [cart, setCart]                     = useState(loadCart);
  const [orders, setOrders]                 = useState(loadOrders);
  const [localReviews, setLocalReviews]     = useState(SEED_REVIEWS);

  // ── Loading state (API pattern) ──────────────────
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { const t=setTimeout(()=>setIsLoading(false),900); return ()=>clearTimeout(t); }, []);

  // ── Modal state ──────────────────────────────────
  const [itemModal, setItemModal]           = useState(null);
  const [cartOpen, setCartOpen]             = useState(false);
  const [checkoutOpen, setCheckoutOpen]     = useState(false);
  const [checkoutStep, setCheckoutStep]     = useState('shipping');
  const [createOpen, setCreateOpen]         = useState(false);
  const [chatModal, setChatModal]           = useState(null);
  const [notiOpen, setNotiOpen]             = useState(false);
  const [manageModal, setManageModal]       = useState(null);
  const [offerOpen, setOfferOpen]           = useState(false);
  const [sellerModal, setSellerModal]       = useState(null);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

  // ── Round 3 modal state ──────────────────────────
  const [reportModal, setReportModal]       = useState(null);
  const [reportReason, setReportReason]     = useState('');
  const [reportDone, setReportDone]         = useState(false);
  const [writeReviewItem, setWriteReviewItem] = useState(null);
  const [reviewRating, setReviewRating]     = useState(5);
  const [reviewText, setReviewText]         = useState('');
  const [reviewDone, setReviewDone]         = useState(false);
  const [cancelConfirm, setCancelConfirm]   = useState(null);

  // ── Checkout state ───────────────────────────────
  const [payMethod, setPayMethod]     = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shipping, setShipping]       = useState({ name:'', street:'', city:'', state:'', zip:'' });
  const [cardName, setCardName]       = useState('');
  const [promoCode, setPromoCode]     = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMsg, setPromoMsg]       = useState('');

  // ── Chat / offer state ───────────────────────────
  const [chatMsg, setChatMsg]         = useState('');
  const [offerAmount, setOfferAmount] = useState('');

  // ── Toast ────────────────────────────────────────
  const [toast, setToast] = useState('');
  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''),2500); }

  // ── Create listing state ─────────────────────────
  const [newTitle, setNewTitle]       = useState('');
  const [newPrice, setNewPrice]       = useState('');
  const [newCat, setNewCat]           = useState('Electronics');
  const [newCond, setNewCond]         = useState('Good');
  const [newDesc, setNewDesc]         = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTags, setNewTags]         = useState('');
  const [photoPreview, setPhotoPreview]   = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress]   = useState(0);

  // ── Manage listing state ─────────────────────────
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc]   = useState('');

  // ── Recent searches ──────────────────────────────
  const [recentSearches, setRecentSearches] = useState(loadRecent);

  // ── Refs ─────────────────────────────────────────
  const fileInputRef  = useRef(null);
  const chatBottomRef = useRef(null);

  // ── Derived ──────────────────────────────────────
  const cartTotal      = cart.reduce((s,c)=>s+c.listing.price*c.qty, 0);
  const finalTotal     = Math.max(0, cartTotal - promoDiscount);
  const wishlistItems  = browseListings.filter(l=>wishlist.has(l.id));
  const unreadCount    = notifications.filter(n=>!n.read).length;
  const activeListings = myListings.filter(l=>!l.sold).length;
  const activeFilters  = (filterCond!=='All'?1:0)+(priceMax?1:0)+(sortBy!=='newest'?1:0);

  const filtered = browseListings
    .filter(l => {
      const catOk   = category==='All'  || l.category===category;
      const condOk  = filterCond==='All'|| l.condition===filterCond;
      const priceOk = !priceMax || l.price<=parseInt(priceMax);
      const searchOk = !search  || l.title.toLowerCase().includes(search.toLowerCase())
                                || l.seller?.toLowerCase().includes(search.toLowerCase())
                                || (l.tags||'').toLowerCase().includes(search.toLowerCase());
      return catOk && condOk && priceOk && searchOk && !l.sold;
    })
    .sort((a,b) => {
      if (sortBy==='price_asc')  return a.price - b.price;
      if (sortBy==='price_desc') return b.price - a.price;
      if (sortBy==='popular')    return (b.likes||0)-(a.likes||0);
      return b.id - a.id;
    });

  // ── Persistence ──────────────────────────────────
  useEffect(()=>{ try { localStorage.setItem('mkt_cart', JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(()=>{ try { localStorage.setItem('mkt_orders', JSON.stringify(orders)); } catch {} }, [orders]);

  // ── Auto-scroll chat ─────────────────────────────
  useEffect(()=>{ chatBottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chatModal, chatThreads]);

  // ── Recent searches: debounce add ───────────────
  useEffect(()=>{
    if (!search.trim()) return;
    const t = setTimeout(()=>{
      setRecentSearches(prev=>{
        const next = [search.trim(), ...prev.filter(s=>s!==search.trim())].slice(0,5);
        try { localStorage.setItem('mkt_recent', JSON.stringify(next)); } catch {}
        return next;
      });
    }, 700);
    return ()=>clearTimeout(t);
  }, [search]);

  // ── Escape key closes modals (R3-12) ────────────
  useEffect(()=>{
    function onKeyDown(e) {
      if (e.key!=='Escape') return;
      if (reportModal)     { setReportModal(null); setReportReason(''); }
      else if (writeReviewItem) { setWriteReviewItem(null); }
      else if (cancelConfirm)   { setCancelConfirm(null); }
      else if (offerOpen)  setOfferOpen(false);
      else if (chatModal)  setChatModal(null);
      else if (manageModal) setManageModal(null);
      else if (createOpen) setCreateOpen(false);
      else if (filterOpen) setFilterOpen(false);
      else if (sellerModal) setSellerModal(null);
      else if (itemModal)  { setItemModal(null); setReviewsExpanded(false); }
      else if (checkoutOpen) setCheckoutOpen(false);
      else if (cartOpen)   setCartOpen(false);
      else if (notiOpen)   setNotiOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return ()=>window.removeEventListener('keydown', onKeyDown);
  }, [reportModal, writeReviewItem, cancelConfirm, offerOpen, chatModal, manageModal,
      createOpen, filterOpen, sellerModal, itemModal, checkoutOpen, cartOpen, notiOpen]);

  // ── Actions ───────────────────────────────────────
  function toggleWishlist(id) {
    setWishlist(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  }

  function addToCart(listing) {
    setCart(prev=>{
      const ex=prev.find(c=>c.listing.id===listing.id);
      if(ex) return prev.map(c=>c.listing.id===listing.id?{...c,qty:c.qty+1}:c);
      return [...prev,{listing,qty:1}];
    });
    showToast('🛒 Added: '+(listing.title.length>28?listing.title.slice(0,28)+'…':listing.title));
    setItemModal(null);
  }

  function updateQty(id,delta) {
    setCart(prev=>prev.map(c=>c.listing.id===id?{...c,qty:c.qty+delta}:c).filter(c=>c.qty>0));
  }
  function removeFromCart(id) { setCart(prev=>prev.filter(c=>c.listing.id!==id)); }

  function publishListing() {
    if (!newTitle||!newPrice) return;
    const nl = {
      id:Date.now(), title:newTitle, price:parseInt(newPrice), seller:'You', verified:false,
      avatar:'📦', emoji:'📦', color:'#6366f1', category:newCat, condition:newCond,
      desc:newDesc, location:newLocation, tags:newTags, sold:false, views:0, likes:0,
    };
    setBrowseListings(prev=>[nl,...prev]);
    setMyListings(prev=>[nl,...prev]);
    setNewTitle(''); setNewPrice(''); setNewDesc(''); setNewLocation(''); setNewTags('');
    setPhotoPreview(null); setPhotoProgress(0);
    setCreateOpen(false);
    showToast('🚀 Listing published!');
  }

  function placeOrder() {
    const order = {
      id:'ORD-'+Date.now(),
      items:cart.map(c=>({title:c.listing.title,price:c.listing.price,qty:c.qty,id:c.listing.id})),
      total:finalTotal,
      shippingTo:shipping.city?`${shipping.city}, ${shipping.state}`:'Local Pickup',
      payMethod,
      status:'Confirmed',
      placedAt:new Date().toLocaleString(),
      trackingCode:'TRK-'+Math.floor(Math.random()*900000+100000),
    };
    setOrders(prev=>[order,...prev]);
    setCart([]);
    setCheckoutOpen(false);
    setOrderPlaced(true);
    setCheckoutStep('shipping');
    setShipping({name:'',street:'',city:'',state:'',zip:''});
    setPromoCode(''); setPromoApplied(false); setPromoDiscount(0); setPromoMsg('');
    setTimeout(()=>setOrderPlaced(false), 3500);
  }

  function cancelOrder(orderId) {
    setOrders(prev=>prev.filter(o=>o.id!==orderId));
    setCancelConfirm(null);
    showToast('✅ Order cancelled');
  }

  function applyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (code==='WELCOME10') {
      const disc = Math.round(cartTotal*0.1);
      setPromoApplied(true); setPromoDiscount(disc);
      setPromoMsg(`✅ 10% discount applied! –$${disc}`);
    } else if (code==='SAVE5') {
      setPromoApplied(true); setPromoDiscount(5);
      setPromoMsg('✅ $5 flat discount applied!');
    } else {
      setPromoMsg('❌ Invalid promo code. Try WELCOME10');
      setTimeout(()=>setPromoMsg(''),2500);
    }
  }

  // ── Share (R3-03) ─────────────────────────────────
  function shareItem(item) {
    const text = `${item.title} — $${item.price} on ConnectHub Marketplace`;
    if (navigator.share) {
      navigator.share({ title:item.title, text, url:window.location.href }).catch(()=>{});
    } else {
      navigator.clipboard?.writeText(text).then(()=>showToast('🔗 Link copied!')).catch(()=>showToast('🔗 '+text));
    }
  }

  // ── Report (R3-01) ────────────────────────────────
  function submitReport() {
    if (!reportReason) return;
    setReportDone(true);
    setTimeout(()=>{ setReportModal(null); setReportReason(''); setReportDone(false); }, 2000);
  }

  // ── Write Review (R3-02) ─────────────────────────
  function submitReview() {
    if (!reviewText.trim()||!writeReviewItem) return;
    const newReview = { reviewer:'You', rating:reviewRating, text:reviewText.trim(), time:'just now' };
    setLocalReviews(prev=>({...prev,[writeReviewItem.id]:[newReview,...(prev[writeReviewItem.id]||[])]}));
    setReviewDone(true);
    setTimeout(()=>{ setWriteReviewItem(null); setReviewText(''); setReviewRating(5); setReviewDone(false); }, 2000);
  }

  // ── Chat actions ──────────────────────────────────
  function openChat(chat) {
    setChatModal(chat);
    setSellerChats(prev=>prev.map(c=>c.id===chat.id?{...c,unread:0}:c));
  }

  function sendMessage() {
    if (!chatMsg.trim()||!chatModal) return;
    const key=chatModal.id;
    setChatThreads(prev=>({...prev,[key]:[...(prev[key]||[]),{from:'seller',text:chatMsg.trim()}]}));
    setSellerChats(prev=>prev.map(c=>c.id===key?{...c,msg:chatMsg.trim(),time:'now'}:c));
    setChatMsg('');
  }

  function openMessageFromItem(item) {
    setItemModal(null);
    const existingId='item_'+item.id;
    const existing=sellerChats.find(c=>c.id===existingId);
    let chat;
    if (!existing) {
      chat={id:existingId,name:item.seller,avatar:item.seller.slice(0,2).toUpperCase(),bg:'#6366f1',item:item.title,msg:'',time:'now',unread:0};
      setSellerChats(prev=>[chat,...prev]);
      setChatThreads(prev=>({...prev,[existingId]:[]}));
    } else { chat=existing; }
    setTab('messages');
    setTimeout(()=>setChatModal(chat),50);
  }

  function sendOffer() {
    if (!offerAmount||!chatModal) return;
    const key=chatModal.id;
    setChatThreads(prev=>({...prev,[key]:[...(prev[key]||[]),{from:'seller',text:`💰 I'd like to offer $${offerAmount} for this item.`}]}));
    setOfferAmount(''); setOfferOpen(false);
  }

  // ── Notifications ────────────────────────────────
  function openNotifications() {
    setNotiOpen(true);
    setNotifications(prev=>prev.map(n=>({...n,read:true})));
  }

  // ── Manage listing ───────────────────────────────
  function openManage(item) {
    setManageModal(item);
    setEditTitle(item.title); setEditPrice(String(item.price)); setEditDesc(item.desc||'');
  }
  function saveListing() {
    if (!editTitle||!editPrice) return;
    const upd={title:editTitle,price:parseInt(editPrice),desc:editDesc};
    setMyListings(prev=>prev.map(l=>l.id===manageModal.id?{...l,...upd}:l));
    setBrowseListings(prev=>prev.map(l=>l.id===manageModal.id?{...l,...upd}:l));
    setManageModal(null);
  }
  function deleteListing(id) {
    setMyListings(prev=>prev.filter(l=>l.id!==id));
    setBrowseListings(prev=>prev.filter(l=>l.id!==id));
    setManageModal(null);
  }
  function markSold(id) {
    setMyListings(prev=>prev.map(l=>l.id===id?{...l,sold:true}:l));
    setBrowseListings(prev=>prev.map(l=>l.id===id?{...l,sold:true}:l));
    setManageModal(null);
  }

  // ── Photo upload ──────────────────────────────────
  function handlePhotoSelect(e) {
    const file=e.target.files&&e.target.files[0];
    if (!file) return;
    const url=URL.createObjectURL(file);
    setPhotoUploading(true); setPhotoProgress(0);
    let p=0;
    const interval=setInterval(()=>{
      p+=Math.random()*25;
      if (p>=100) { p=100; clearInterval(interval); setPhotoUploading(false); setPhotoPreview(url); }
      setPhotoProgress(Math.min(p,100));
    },150);
  }

  // ── Seller profile ────────────────────────────────
  function openSellerProfile(sellerName) {
    const profile=SEED_SELLER_PROFILES[sellerName]||{
      rating:4.5, sales:10, memberSince:'2023', verified:false, bio:'Marketplace seller.',
      avatar:sellerName.slice(0,2).toUpperCase(), color:'#334155',
    };
    setSellerModal({name:sellerName,...profile,listings:browseListings.filter(l=>l.seller===sellerName&&!l.sold)});
    setItemModal(null);
  }

  // ── RENDER ────────────────────────────────────────
  return (
    <div style={S.page} role="main" aria-label="Marketplace">

      {/* ── TOP BAR ─────────────────────── */}
      <div style={S.topBar}>
        <span style={S.title}>🛒 Marketplace</span>
        <div style={{display:'flex',gap:'8px'}}>
          <button style={S.iconBtn} onClick={openNotifications} aria-label="Notifications">
            🔔{unreadCount>0&&<span style={S.badge}>{unreadCount}</span>}
          </button>
          <button style={S.iconBtn} onClick={()=>setCartOpen(true)} aria-label="Cart">
            🛒{cart.length>0&&<span style={S.badge}>{cart.length}</span>}
          </button>
        </div>
      </div>

      {/* ── NOTIFICATIONS PANEL ─────────── */}
      {notiOpen && (
        <div style={S.modal} onClick={()=>setNotiOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()} role="dialog" aria-label="Notifications">
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>🔔 Notifications</span>
              <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                <button onClick={()=>setNotifications(p=>p.map(n=>({...n,read:true})))}
                  style={{background:'none',border:'none',color:'#6366f1',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                  Mark all read
                </button>
                <button style={S.closeBtn} onClick={()=>setNotiOpen(false)} aria-label="Close">✕</button>
              </div>
            </div>
            {notifications.map(n=>(
              <div key={n.id} style={{display:'flex',gap:'12px',padding:'14px 20px',borderBottom:'1px solid #1e293b',
                alignItems:'flex-start',background:n.read?'transparent':'rgba(99,102,241,0.06)'}}>
                <span style={{fontSize:'22px'}}>{n.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',color:'#f1f5f9',lineHeight:1.4}}>{n.text}</div>
                  <div style={{fontSize:'11px',color:'#64748b',marginTop:'4px'}}>{n.time}</div>
                  {/* R3-06: Actionable notifications */}
                  {n.icon==='💰' && (
                    <div style={{display:'flex',gap:'6px',marginTop:'8px',flexWrap:'wrap'}}>
                      <button onClick={()=>{ setNotiOpen(false); showToast('✅ Offer accepted!'); }}
                        style={{background:'#10b981',border:'none',borderRadius:'8px',padding:'5px 12px',color:'white',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                        ✅ Accept
                      </button>
                      <button style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'8px',padding:'5px 12px',color:'#94a3b8',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                        Counter
                      </button>
                      <button onClick={()=>showToast('❌ Offer declined')}
                        style={{background:'#1e293b',border:'1px solid #ef4444',borderRadius:'8px',padding:'5px 12px',color:'#ef4444',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                        Decline
                      </button>
                    </div>
                  )}
                  {n.icon==='📦' && (
                    <button onClick={()=>{ setNotiOpen(false); setViewingOrders(true); setTab('selling'); }}
                      style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'8px',
                              padding:'5px 12px',color:'#a5b4fc',fontSize:'11px',fontWeight:600,cursor:'pointer',marginTop:'8px'}}>
                      📦 Track Order →
                    </button>
                  )}
                </div>
                {!n.read&&<div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#6366f1',flexShrink:0,marginTop:'4px'}}/>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEARCH ──────────────────────── */}
      <div style={S.search}>
        <span style={{fontSize:'16px',color:'#64748b'}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search items, sellers, tags..." autoComplete="off" aria-label="Search marketplace"
          style={{background:'none',border:'none',color:'#f1f5f9',fontSize:'14px',flex:1,outline:'none'}} />
        {search && <button onClick={()=>setSearch('')} aria-label="Clear search"
          style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:'16px'}}>✕</button>}
      </div>

      {/* R3-07: Recent Searches */}
      {tab==='browse' && !search && recentSearches.length>0 && (
        <div style={{padding:'0 16px 8px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
            <span style={{fontSize:'11px',color:'#64748b',fontWeight:600}}>RECENT SEARCHES</span>
            <button onClick={()=>{ setRecentSearches([]); localStorage.removeItem('mkt_recent'); }}
              style={{background:'none',border:'none',color:'#6366f1',fontSize:'11px',cursor:'pointer'}}>Clear</button>
          </div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {recentSearches.map((s,i)=>(
              <button key={i} onClick={()=>setSearch(s)}
                style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'20px',padding:'4px 10px',
                        fontSize:'12px',color:'#94a3b8',cursor:'pointer'}}>🕐 {s}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── TABS ────────────────────────── */}
      <div style={S.tabRow} role="tablist">
        {[['browse','🏪 Browse'],['selling','📦 Sell'],['wishlist','❤️ Saved'],['messages','💬 Inbox']].map(([key,lbl])=>(
          <button key={key} role="tab" aria-selected={tab===key} style={S.tab(tab===key)}
            onClick={()=>{ setTab(key); setViewingOrders(false); }}>{lbl}</button>
        ))}
      </div>

      {/* ════════ BROWSE TAB ════════ */}
      {tab==='browse' && (
        <>
          <div style={{display:'flex',gap:'8px',padding:'12px 16px',overflowX:'auto',scrollbarWidth:'none'}}>
            {CATEGORIES.map(c=>(
              <button key={c} style={S.catChip(category===c)} onClick={()=>{ setCategory(c); setVisibleCount(8); }}>{c}</button>
            ))}
          </div>

          {/* Filter bar */}
          <div style={{display:'flex',gap:'8px',padding:'0 16px 10px',alignItems:'center'}}>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} aria-label="Sort listings"
              style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'10px',padding:'7px 10px',
                      color:'#f1f5f9',fontSize:'12px',cursor:'pointer',flex:1}}>
              {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={()=>setFilterOpen(true)} aria-label="Open filters"
              style={{background:activeFilters?'rgba(99,102,241,0.2)':'#1e293b',
                      border:`1px solid ${activeFilters?'#6366f1':'#334155'}`,borderRadius:'10px',
                      padding:'7px 12px',color:activeFilters?'#a5b4fc':'#94a3b8',fontSize:'12px',
                      fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'5px'}}>
              ⚙️ Filters {activeFilters>0&&<span style={{background:'#6366f1',color:'white',borderRadius:'50%',
                width:'16px',height:'16px',fontSize:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>{activeFilters}</span>}
            </button>
            {activeFilters>0&&(
              <button onClick={()=>{setFilterCond('All');setPriceMax('');setSortBy('newest');}}
                style={{background:'none',border:'none',color:'#ef4444',fontSize:'11px',cursor:'pointer',whiteSpace:'nowrap'}}>
                Clear
              </button>
            )}
          </div>

          {(filterCond!=='All'||priceMax)&&(
            <div style={{display:'flex',gap:'6px',padding:'0 16px 8px',flexWrap:'wrap'}}>
              {filterCond!=='All'&&<span style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'20px',padding:'3px 10px',fontSize:'11px',color:'#a5b4fc'}}>Condition: {filterCond}</span>}
              {priceMax&&<span style={{background:'rgba(16,185,129,0.2)',border:'1px solid #10b981',borderRadius:'20px',padding:'3px 10px',fontSize:'11px',color:'#6ee7b7'}}>Max: ${priceMax}</span>}
            </div>
          )}

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px 10px'}}>
            <span style={{fontWeight:700,fontSize:'15px'}}>
              {search?`Results for "${search}"`:category==='All'?'Featured Listings':category}
            </span>
            <span style={{color:'#64748b',fontSize:'13px'}}>{filtered.length} items</span>
          </div>

          {isLoading ? (
            <div style={S.grid2}>
              {[1,2,3,4].map(i=>(
                <div key={i} style={{...S.card,overflow:'hidden'}}>
                  <div style={{height:'110px',background:'#334155'}}/>
                  <div style={{padding:'10px'}}>
                    <div style={{height:'12px',background:'#334155',borderRadius:'4px',marginBottom:'6px'}}/>
                    <div style={{height:'10px',background:'#334155',borderRadius:'4px',width:'60%'}}/>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length===0 ? (
            <div style={{textAlign:'center',padding:'40px',color:'#64748b'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>🔍</div>
              <div style={{fontWeight:600}}>No items found</div>
              <div style={{fontSize:'13px',marginTop:'6px'}}>Try adjusting your search or filters</div>
            </div>
          ) : (
            <>
              <div style={S.grid2}>
                {filtered.slice(0,visibleCount).map(item=>{
                  const reviews=localReviews[item.id];
                  const avg=avgRating(reviews);
                  return (
                    <div key={item.id} style={S.card} onClick={()=>setItemModal(item)} role="button" tabIndex={0}
                      aria-label={`${item.title}, $${item.price}`}
                      onKeyDown={e=>e.key==='Enter'&&setItemModal(item)}>
                      <div style={S.cardImg(item.color)}>
                        <span style={{fontSize:'44px'}}>{item.avatar}</span>
                        <button onClick={e=>{e.stopPropagation();toggleWishlist(item.id);}}
                          style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.45)',
                                  border:'none',borderRadius:'50%',width:'30px',height:'30px',
                                  cursor:'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center'}}
                          aria-label={wishlist.has(item.id)?'Remove from wishlist':'Save to wishlist'}>
                          {wishlist.has(item.id)?'❤️':'🤍'}
                        </button>
                        <span style={{position:'absolute',bottom:'6px',left:'8px',background:'rgba(0,0,0,0.5)',
                                      borderRadius:'6px',padding:'2px 7px',fontSize:'10px',color:'white'}}>
                          {item.condition}
                        </span>
                        {item.verified&&(
                          <span style={{position:'absolute',top:'8px',left:'8px',background:'rgba(99,102,241,0.8)',
                                        borderRadius:'6px',padding:'2px 6px',fontSize:'9px',color:'white',fontWeight:700}}>
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div style={S.cardBody}>
                        <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'12px',lineHeight:1.3,marginBottom:'2px',
                                     overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                          {item.title}
                        </div>
                        <div style={{color:'#64748b',fontSize:'10px',marginBottom:'4px'}}>{item.seller}</div>
                        {avg&&(
                          <div style={{fontSize:'10px',color:'#f59e0b',marginBottom:'4px'}}>
                            {'★'.repeat(Math.round(parseFloat(avg)))}{'☆'.repeat(5-Math.round(parseFloat(avg)))} {avg}
                            <span style={{color:'#64748b'}}> ({reviews.length})</span>
                          </div>
                        )}
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <span style={{color:'#10b981',fontWeight:800,fontSize:'15px'}}>${item.price}</span>
                          <button onClick={e=>{e.stopPropagation();addToCart(item);}}
                            style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',color:'white',
                                    border:'none',borderRadius:'10px',padding:'5px 10px',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                            + Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* R3-08: Load More */}
              {filtered.length>visibleCount && (
                <div style={{padding:'8px 16px 16px',textAlign:'center'}}>
                  <button onClick={()=>setVisibleCount(v=>v+8)}
                    style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'12px',padding:'12px 32px',
                            color:'#a5b4fc',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>
                    Load More ({filtered.length-visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ════════ SELL TAB ════════ */}
      {tab==='selling' && !viewingOrders && (
        <>
          <div style={{display:'flex',gap:'10px',padding:'16px',overflowX:'auto'}}>
            {[['💰','$'+(orders.reduce((s,o)=>s+(o.total||0),0)||1240),'Revenue'],
              ['📦',String(activeListings),'Active'],
              ['⭐','4.9','Rating'],
              ['📋',String(orders.length),'Orders']].map(([icon,val,lbl])=>(
              <div key={lbl} onClick={lbl==='Orders'?()=>setViewingOrders(true):undefined}
                style={{...S.statCard,minWidth:'80px',cursor:lbl==='Orders'?'pointer':'default',
                        border:lbl==='Orders'?'1px solid #334155':'1px solid transparent'}}>
                <div style={{fontSize:'22px',marginBottom:'4px'}}>{icon}</div>
                <div style={{fontWeight:800,fontSize:'18px',color:'#f1f5f9'}}>{val}</div>
                <div style={{color:'#64748b',fontSize:'11px'}}>{lbl}</div>
              </div>
            ))}
          </div>

          {orders.length>0&&(
            <div style={{padding:'0 16px 12px'}}>
              <button onClick={()=>setViewingOrders(true)}
                style={{width:'100%',padding:'11px',borderRadius:'12px',background:'rgba(99,102,241,0.1)',
                        border:'1px solid rgba(99,102,241,0.3)',color:'#a5b4fc',fontWeight:600,
                        fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                📋 View My Order History ({orders.length} orders)
              </button>
            </div>
          )}

          <div style={{padding:'0 16px 16px'}}>
            <button onClick={()=>setCreateOpen(true)}
              style={{width:'100%',padding:'14px',borderRadius:'14px',
                      border:'2px dashed rgba(99,102,241,0.4)',background:'rgba(99,102,241,0.08)',
                      color:'#a5b4fc',fontWeight:700,fontSize:'14px',cursor:'pointer',
                      display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              ➕ Create New Listing
            </button>
          </div>

          <div style={{padding:'0 16px 8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontWeight:700,fontSize:'15px'}}>My Listings</span>
            <span style={{color:'#64748b',fontSize:'13px'}}>{myListings.length} items</span>
          </div>
          <div style={S.grid2}>
            {myListings.map(item=>(
              <div key={item.id} style={{...S.card,opacity:item.sold?0.6:1}} onClick={()=>openManage(item)}>
                <div style={S.cardImg(item.color)}>
                  <span style={{fontSize:'44px'}}>{item.emoji||item.avatar||'📦'}</span>
                  {item.sold&&<div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'16px'}}>SOLD</div>}
                  {!item.sold&&<span style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.5)',borderRadius:'8px',padding:'2px 6px',fontSize:'10px',color:'white'}}>✏️ Edit</span>}
                </div>
                <div style={S.cardBody}>
                  <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'12px',lineHeight:1.3,marginBottom:'4px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.title}</div>
                  <div style={{color:'#10b981',fontWeight:800,fontSize:'14px',marginBottom:'6px'}}>${item.price}</div>
                  <div style={{display:'flex',gap:'8px',fontSize:'11px',color:'#64748b'}}>
                    <span>👁️ {item.views}</span><span>❤️ {item.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════════ ORDER HISTORY ════════ */}
      {tab==='selling' && viewingOrders && (
        <>
          <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 16px 8px'}}>
            <button onClick={()=>setViewingOrders(false)}
              style={{background:'#1e293b',border:'none',borderRadius:'10px',width:'32px',height:'32px',color:'#94a3b8',cursor:'pointer',fontSize:'18px'}}>←</button>
            <span style={{fontWeight:700,fontSize:'16px'}}>📋 Order History</span>
          </div>
          {orders.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',color:'#64748b'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>📦</div>
              <div style={{fontWeight:700,fontSize:'16px',color:'#f1f5f9',marginBottom:'8px'}}>No orders yet</div>
              <div style={{fontSize:'13px'}}>Browse listings and check out to see orders here</div>
            </div>
          ) : orders.map(order=>(
            <div key={order.id} style={{margin:'0 16px 12px',background:'#1e293b',borderRadius:'14px',padding:'14px',border:'1px solid #334155'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'13px'}}>{order.id}</span>
                <span style={{background:'rgba(16,185,129,0.2)',color:'#10b981',borderRadius:'8px',padding:'3px 8px',fontSize:'11px',fontWeight:600}}>✅ {order.status}</span>
              </div>
              {order.items.map((it,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#94a3b8',marginBottom:'3px'}}>
                  <span>{it.title} ×{it.qty}</span>
                  <span>${it.price*it.qty}</span>
                </div>
              ))}
              <div style={{borderTop:'1px solid #334155',marginTop:'8px',paddingTop:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'12px',color:'#64748b'}}>📍 {order.shippingTo}</span>
                <span style={{fontWeight:700,color:'#10b981',fontSize:'14px'}}>${order.total}</span>
              </div>
              <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>{order.placedAt}</div>
              <div style={{fontSize:'11px',color:'#6366f1',marginTop:'4px'}}>📦 Tracking: {order.trackingCode}</div>
              {/* R3-09 + R3-10: Cancel and Review actions */}
              <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
                <button onClick={()=>setCancelConfirm(order.id)}
                  style={{flex:1,background:'#1e293b',border:'1px solid #ef4444',borderRadius:'10px',
                          padding:'8px',color:'#ef4444',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                  🚫 Cancel Order
                </button>
                <button onClick={()=>{
                    const firstItem = browseListings.find(l=>l.id===order.items[0]?.id)||{id:order.items[0]?.id||Date.now(),title:order.items[0]?.title||'Order'};
                    setWriteReviewItem(firstItem); setViewingOrders(false);
                  }}
                  style={{flex:1,background:'rgba(245,158,11,0.1)',border:'1px solid #f59e0b',borderRadius:'10px',
                          padding:'8px',color:'#f59e0b',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                  ⭐ Leave Review
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ════════ WISHLIST TAB ════════ */}
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
                    <button onClick={e=>{e.stopPropagation();toggleWishlist(item.id);}}
                      style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.45)',
                              border:'none',borderRadius:'50%',width:'30px',height:'30px',
                              cursor:'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center'}}>❤️</button>
                  </div>
                  <div style={S.cardBody}>
                    <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'12px',lineHeight:1.3,marginBottom:'4px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.title}</div>
                    <div style={{color:'#64748b',fontSize:'11px',marginBottom:'6px'}}>{item.seller}</div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{color:'#10b981',fontWeight:800,fontSize:'14px'}}>${item.price}</span>
                      <button onClick={e=>{e.stopPropagation();addToCart(item);}}
                        style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',color:'white',border:'none',borderRadius:'10px',padding:'5px 10px',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                        + Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════ MESSAGES TAB ════════ */}
      {tab==='messages' && (
        <>
          <div style={{padding:'16px 16px 8px',fontWeight:700,fontSize:'15px'}}>💬 Inbox</div>
          {sellerChats.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',color:'#64748b'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>🗨️</div>
              <div style={{fontWeight:700,fontSize:'16px',color:'#f1f5f9',marginBottom:'8px'}}>No messages yet</div>
              <div style={{fontSize:'13px'}}>Browse listings and tap 💬 to start a conversation</div>
            </div>
          ) : sellerChats.map(chat=>(
            <div key={chat.id} style={S.msgItem} onClick={()=>openChat(chat)}>
              <div style={{width:'44px',height:'44px',borderRadius:'50%',background:chat.bg,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'14px',flexShrink:0}}>{chat.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2px'}}>
                  <span style={{fontWeight:700,fontSize:'14px',color:'#f1f5f9'}}>{chat.name}</span>
                  <span style={{color:'#64748b',fontSize:'11px'}}>{chat.time}</span>
                </div>
                <div style={{color:'#64748b',fontSize:'12px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>Re: {chat.item}</div>
                <div style={{color:'#94a3b8',fontSize:'12px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{chat.msg}</div>
              </div>
              {chat.unread>0&&<div style={{background:'#6366f1',color:'white',borderRadius:'50%',width:'20px',height:'20px',fontSize:'11px',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{chat.unread}</div>}
            </div>
          ))}
        </>
      )}

      {/* ════════ FILTER SHEET ════════ */}
      {filterOpen&&(
        <div style={S.modal} onClick={()=>setFilterOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()} role="dialog" aria-label="Filters">
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>⚙️ Filter & Sort</span>
              <button style={S.closeBtn} onClick={()=>setFilterOpen(false)} aria-label="Close">✕</button>
            </div>
            <div style={{padding:'16px 20px'}}>
              <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'8px'}}>SORT BY</div>
              {SORT_OPTIONS.map(o=>(
                <div key={o.value} onClick={()=>setSortBy(o.value)}
                  style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 12px',marginBottom:'6px',
                          borderRadius:'10px',border:`1px solid ${sortBy===o.value?'#6366f1':'#334155'}`,
                          background:sortBy===o.value?'rgba(99,102,241,0.1)':'transparent',cursor:'pointer'}}>
                  <div style={{width:'16px',height:'16px',borderRadius:'50%',border:`2px solid ${sortBy===o.value?'#6366f1':'#334155'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {sortBy===o.value&&<div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#6366f1'}}/>}
                  </div>
                  <span style={{fontSize:'14px',color:'#f1f5f9'}}>{o.label}</span>
                </div>
              ))}
              <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',margin:'16px 0 8px'}}>CONDITION</div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {CONDITIONS.map(c=>(
                  <button key={c} onClick={()=>setFilterCond(c)}
                    style={{padding:'6px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:filterCond===c?700:500,
                            background:filterCond===c?'#6366f1':'#1e293b',color:filterCond===c?'white':'#94a3b8',
                            border:`1px solid ${filterCond===c?'#6366f1':'#334155'}`,cursor:'pointer'}}>
                    {c}
                  </button>
                ))}
              </div>
              <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',margin:'16px 0 8px'}}>MAX PRICE</div>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{color:'#10b981',fontWeight:700,fontSize:'16px'}}>$</span>
                <input type="number" placeholder="Any price" value={priceMax} onChange={e=>setPriceMax(e.target.value)}
                  style={{...S.input,marginBottom:0,flex:1}} />
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'8px',flexWrap:'wrap'}}>
                {[50,100,200,500].map(p=>(
                  <button key={p} onClick={()=>setPriceMax(String(p))}
                    style={{padding:'5px 12px',borderRadius:'20px',fontSize:'11px',background:priceMax===String(p)?'#10b981':'#1e293b',
                            color:priceMax===String(p)?'white':'#94a3b8',border:'none',cursor:'pointer',fontWeight:600}}>
                    Under ${p}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
                <button style={{...S.btn('secondary'),flex:'0 0 auto',width:'auto',padding:'12px 20px'}}
                  onClick={()=>{setFilterCond('All');setPriceMax('');setSortBy('newest');}}>Clear All</button>
                <button style={{...S.btn(),flex:1}} onClick={()=>setFilterOpen(false)}>Apply Filters</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ ITEM DETAIL MODAL ════════ */}
      {itemModal&&(
        <div style={S.modal} onClick={()=>{setItemModal(null);setReviewsExpanded(false);}}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()} role="dialog" aria-label={itemModal.title}>
            <div style={{height:'200px',background:itemModal.color,display:'flex',alignItems:'center',
                         justifyContent:'center',fontSize:'80px',borderRadius:'24px 24px 0 0',position:'relative'}}>
              {itemModal.avatar}
              <button onClick={()=>{setItemModal(null);setReviewsExpanded(false);}} aria-label="Close"
                style={{position:'absolute',top:'12px',right:'12px',background:'rgba(0,0,0,0.5)',border:'none',
                        borderRadius:'50%',width:'32px',height:'32px',color:'white',cursor:'pointer',fontSize:'16px',
                        display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'6px'}}>
                <h2 style={{fontSize:'18px',fontWeight:800,color:'#f1f5f9',margin:0,flex:1,paddingRight:'12px'}}>{itemModal.title}</h2>
                <span style={{color:'#10b981',fontWeight:800,fontSize:'22px',flexShrink:0}}>${itemModal.price}</span>
              </div>

              {(()=>{
                const reviews=localReviews[itemModal.id];
                const avg=avgRating(reviews);
                if (!avg) return null;
                return (
                  <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'10px'}}>
                    <span style={{color:'#f59e0b',fontSize:'14px',letterSpacing:'1px'}}>
                      {'★'.repeat(Math.round(parseFloat(avg)))}{'☆'.repeat(5-Math.round(parseFloat(avg)))}
                    </span>
                    <span style={{fontWeight:700,fontSize:'13px',color:'#f1f5f9'}}>{avg}</span>
                    <span style={{color:'#64748b',fontSize:'12px'}}>({reviews.length} reviews)</span>
                  </div>
                );
              })()}

              <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>📦 {itemModal.condition}</span>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>📍 {itemModal.location}</span>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>🏷️ {itemModal.category}</span>
                {itemModal.likes>30&&<span style={{background:'rgba(239,68,68,0.2)',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#fca5a5'}}>🔥 Popular</span>}
              </div>

              <p style={{color:'#94a3b8',fontSize:'14px',lineHeight:1.6,marginBottom:'16px'}}>{itemModal.desc}</p>

              {/* R3-03: Share + Write Review + Report row */}
              <div style={{display:'flex',gap:'8px',marginBottom:'14px'}}>
                <button onClick={()=>shareItem(itemModal)}
                  style={{flex:1,background:'#1e293b',border:'1px solid #334155',borderRadius:'12px',padding:'10px',
                          color:'#94a3b8',fontSize:'13px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                  🔗 Share
                </button>
                <button onClick={()=>setWriteReviewItem(itemModal)}
                  style={{flex:1,background:'#1e293b',border:'1px solid #334155',borderRadius:'12px',padding:'10px',
                          color:'#94a3b8',fontSize:'13px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                  ✍️ Review
                </button>
                <button onClick={()=>setReportModal(itemModal)} aria-label="Report listing"
                  style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'12px',padding:'10px 14px',
                          color:'#94a3b8',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
                  🚩
                </button>
              </div>

              {/* Seller info */}
              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',background:'#0f172a',borderRadius:'12px',marginBottom:'16px',cursor:'pointer'}}
                onClick={()=>openSellerProfile(itemModal.seller)} role="button" tabIndex={0}
                onKeyDown={e=>e.key==='Enter'&&openSellerProfile(itemModal.seller)} aria-label={`View ${itemModal.seller}'s profile`}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'#334155',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>
                  {itemModal.avatar}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                    <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'14px'}}>{itemModal.seller}</span>
                    {itemModal.verified&&<span style={{background:'#6366f1',color:'white',borderRadius:'6px',padding:'1px 6px',fontSize:'10px',fontWeight:700}}>✓ Verified</span>}
                  </div>
                  <div style={{color:'#6366f1',fontSize:'12px',marginTop:'2px'}}>👆 View seller profile →</div>
                </div>
                <button onClick={e=>{e.stopPropagation();openMessageFromItem(itemModal);}}
                  style={{background:'#1e293b',border:'none',borderRadius:'10px',padding:'8px 12px',color:'#6366f1',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>
                  💬 Message
                </button>
              </div>

              <div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
                <button onClick={()=>toggleWishlist(itemModal.id)} aria-label="Save to wishlist"
                  style={{flex:'0 0 auto',padding:'14px 18px',borderRadius:'14px',border:'1px solid #334155',
                          background:'#1e293b',color:wishlist.has(itemModal.id)?'#ef4444':'#94a3b8',cursor:'pointer',fontSize:'20px'}}>
                  {wishlist.has(itemModal.id)?'❤️':'🤍'}
                </button>
                <button onClick={()=>addToCart(itemModal)} style={{...S.btn(),flex:1,marginTop:0}}>
                  🛒 Add to Cart — ${itemModal.price}
                </button>
              </div>

              {/* R3-11: localReviews (includes newly submitted) */}
              {localReviews[itemModal.id]&&(
                <div>
                  <button onClick={()=>setReviewsExpanded(v=>!v)} aria-expanded={reviewsExpanded}
                    style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:'12px',padding:'12px 16px',
                            color:'#f1f5f9',fontSize:'13px',fontWeight:600,cursor:'pointer',display:'flex',
                            alignItems:'center',justifyContent:'space-between',marginBottom:reviewsExpanded?'10px':'0'}}>
                    <span>⭐ Reviews ({localReviews[itemModal.id].length})</span>
                    <span style={{color:'#6366f1'}}>{reviewsExpanded?'▲ Hide':'▼ Show'}</span>
                  </button>
                  {reviewsExpanded&&localReviews[itemModal.id].map((r,i)=>(
                    <div key={i} style={{background:'#0f172a',borderRadius:'12px',padding:'12px',marginBottom:'8px'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                        <span style={{fontWeight:600,fontSize:'13px',color:'#f1f5f9'}}>{r.reviewer}</span>
                        <span style={{color:'#64748b',fontSize:'11px'}}>{r.time}</span>
                      </div>
                      <div style={{color:'#f59e0b',fontSize:'13px',marginBottom:'6px',letterSpacing:'2px'}}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                      </div>
                      <div style={{color:'#94a3b8',fontSize:'13px',lineHeight:1.4}}>{r.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ SELLER PROFILE MODAL ════════ */}
      {sellerModal&&(
        <div style={S.modal} onClick={()=>setSellerModal(null)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={{height:'100px',background:`linear-gradient(135deg,${sellerModal.color||'#6366f1'},#0f172a)`,
                         borderRadius:'24px 24px 0 0',position:'relative',display:'flex',alignItems:'flex-end',padding:'0 20px 12px'}}>
              <div style={{width:'56px',height:'56px',borderRadius:'50%',background:sellerModal.color||'#6366f1',
                           display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',border:'3px solid #0f172a'}}>
                {sellerModal.avatar}
              </div>
              <button onClick={()=>setSellerModal(null)} aria-label="Close"
                style={{position:'absolute',top:'12px',right:'12px',background:'rgba(0,0,0,0.5)',border:'none',
                        borderRadius:'50%',width:'30px',height:'30px',color:'white',cursor:'pointer',fontSize:'16px',
                        display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{padding:'12px 20px 20px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                <span style={{fontWeight:800,fontSize:'18px',color:'#f1f5f9'}}>{sellerModal.name}</span>
                {sellerModal.verified&&<span style={{background:'#6366f1',color:'white',borderRadius:'8px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>✓ Verified Seller</span>}
              </div>
              <div style={{color:'#64748b',fontSize:'12px',marginBottom:'10px'}}>
                ⭐ {sellerModal.rating} · {sellerModal.sales} sales · Member since {sellerModal.memberSince}
              </div>
              <p style={{color:'#94a3b8',fontSize:'13px',lineHeight:1.5,marginBottom:'16px'}}>{sellerModal.bio}</p>
              {sellerModal.listings&&sellerModal.listings.length>0&&(
                <>
                  <div style={{fontWeight:600,fontSize:'13px',color:'#94a3b8',marginBottom:'10px'}}>ACTIVE LISTINGS ({sellerModal.listings.length})</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                    {sellerModal.listings.slice(0,4).map(item=>(
                      <div key={item.id} style={S.card} onClick={()=>{setSellerModal(null);setItemModal(item);}}>
                        <div style={{...S.cardImg(item.color),height:'70px'}}><span style={{fontSize:'28px'}}>{item.avatar}</span></div>
                        <div style={{padding:'8px'}}>
                          <div style={{fontWeight:600,color:'#f1f5f9',fontSize:'11px',lineHeight:1.3,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.title}</div>
                          <div style={{color:'#10b981',fontWeight:700,fontSize:'12px',marginTop:'3px'}}>${item.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ CART MODAL ════════ */}
      {cartOpen&&(
        <div style={S.modal} onClick={()=>setCartOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>🛒 Cart ({cart.length})</span>
              <button style={S.closeBtn} onClick={()=>setCartOpen(false)} aria-label="Close">✕</button>
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
                    <div style={{width:'48px',height:'48px',borderRadius:'12px',background:c.listing.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',flexShrink:0}}>{c.listing.avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:'13px',color:'#f1f5f9',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{c.listing.title}</div>
                      <div style={{color:'#10b981',fontWeight:700,fontSize:'14px'}}>${c.listing.price*c.qty}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'6px',flexShrink:0}}>
                      <button onClick={()=>updateQty(c.listing.id,-1)} aria-label="Decrease quantity"
                        style={{background:'#334155',border:'none',borderRadius:'6px',width:'26px',height:'26px',color:'#f1f5f9',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                      <span style={{fontSize:'14px',fontWeight:700,color:'#f1f5f9',minWidth:'16px',textAlign:'center'}}>{c.qty}</span>
                      <button onClick={()=>updateQty(c.listing.id,1)} aria-label="Increase quantity"
                        style={{background:'#334155',border:'none',borderRadius:'6px',width:'26px',height:'26px',color:'#f1f5f9',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                      <button onClick={()=>removeFromCart(c.listing.id)} aria-label="Remove from cart"
                        style={{background:'#1e293b',border:'1px solid #475569',borderRadius:'6px',width:'26px',height:'26px',color:'#94a3b8',cursor:'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',marginLeft:'4px'}}>×</button>
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

      {/* ════════ CHECKOUT MODAL ════════ */}
      {checkoutOpen&&(
        <div style={S.modal} onClick={()=>setCheckoutOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <div>
                <span style={{fontWeight:700,fontSize:'16px'}}>💳 Checkout</span>
                <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>
                  Step {checkoutStep==='shipping'?'1':'2'} of 2 — {checkoutStep==='shipping'?'Shipping Address':'Payment'}
                </div>
              </div>
              <button style={S.closeBtn} onClick={()=>setCheckoutOpen(false)} aria-label="Close">✕</button>
            </div>

            {checkoutStep==='shipping' ? (
              <div style={{padding:'20px'}}>
                <div style={{fontWeight:600,fontSize:'13px',color:'#94a3b8',marginBottom:'12px'}}>SHIPPING ADDRESS</div>
                <input style={S.input} placeholder="Full Name *" value={shipping.name} onChange={e=>setShipping(s=>({...s,name:e.target.value}))} aria-required="true" />
                <input style={S.input} placeholder="Street Address *" value={shipping.street} onChange={e=>setShipping(s=>({...s,street:e.target.value}))} />
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                  <input style={{...S.input,marginBottom:0}} placeholder="City *" value={shipping.city} onChange={e=>setShipping(s=>({...s,city:e.target.value}))} />
                  <input style={{...S.input,marginBottom:0}} placeholder="State" value={shipping.state} onChange={e=>setShipping(s=>({...s,state:e.target.value}))} />
                </div>
                <input style={S.input} placeholder="ZIP Code" value={shipping.zip} onChange={e=>setShipping(s=>({...s,zip:e.target.value}))} />
                <div onClick={()=>setShipping({name:'Local Pickup',street:'',city:'Pickup',state:'',zip:''})}
                  style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px',borderRadius:'12px',border:'1px solid #334155',cursor:'pointer',marginBottom:'10px'}}>
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
                <div style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',borderRadius:'16px',padding:'20px',textAlign:'center',marginBottom:'16px'}}>
                  <div style={{fontSize:'12px',opacity:0.9,marginBottom:'4px'}}>Total Amount</div>
                  {promoApplied&&<div style={{fontSize:'13px',opacity:0.8,textDecoration:'line-through'}}>Was ${cartTotal}</div>}
                  <div style={{fontSize:'38px',fontWeight:800,color:'white'}}>${finalTotal}</div>
                  <div style={{fontSize:'11px',opacity:0.8,marginTop:'2px'}}>{cart.length} item{cart.length!==1?'s':''} · To {shipping.city||'Pickup'}</div>
                </div>

                {/* R3-04: Promo code */}
                {!promoApplied ? (
                  <div style={{marginBottom:'14px'}}>
                    <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'8px'}}>PROMO CODE</div>
                    <div style={{display:'flex',gap:'8px'}}>
                      <input value={promoCode} onChange={e=>setPromoCode(e.target.value)} placeholder="Try WELCOME10"
                        style={{...S.input,marginBottom:0,flex:1,fontSize:'13px'}} aria-label="Promo code" />
                      <button onClick={applyPromo}
                        style={{background:'#6366f1',border:'none',borderRadius:'12px',padding:'0 16px',color:'white',fontWeight:700,fontSize:'13px',cursor:'pointer',flexShrink:0}}>
                        Apply
                      </button>
                    </div>
                    {promoMsg&&<div style={{fontSize:'12px',color:promoMsg.startsWith('✅')?'#10b981':'#ef4444',marginTop:'6px'}}>{promoMsg}</div>}
                  </div>
                ) : (
                  <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'10px',padding:'10px 14px',marginBottom:'14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:'#10b981',fontSize:'13px',fontWeight:600}}>🏷️ {promoCode.toUpperCase()} — −${promoDiscount}</span>
                    <button onClick={()=>{setPromoApplied(false);setPromoCode('');setPromoDiscount(0);setPromoMsg('');}}
                      style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:'14px'}}>✕</button>
                  </div>
                )}

                {/* Buyer Protection (P-07) */}
                <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',
                             borderRadius:'12px',padding:'12px 16px',marginBottom:'14px',display:'flex',alignItems:'center',gap:'10px'}}>
                  <span style={{fontSize:'24px'}}>🛡️</span>
                  <div>
                    <div style={{fontWeight:700,color:'#10b981',fontSize:'13px'}}>Buyer Protection Included</div>
                    <div style={{color:'#6ee7b7',fontSize:'11px',marginTop:'2px'}}>Full refund if item not as described or doesn't arrive within 7 days.</div>
                  </div>
                </div>

                {/* Payment method */}
                <div style={{marginBottom:'14px'}}>
                  <div style={{fontWeight:600,fontSize:'13px',color:'#94a3b8',marginBottom:'8px'}}>PAYMENT METHOD</div>
                  {[['card','💳 Credit / Debit Card'],['paypal','🅿️ PayPal'],['crypto','₿ Crypto'],['cash','💵 Cash on Pickup']].map(([val,lbl])=>(
                    <div key={val} onClick={()=>setPayMethod(val)} role="radio" aria-checked={payMethod===val}
                      style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',marginBottom:'8px',
                              borderRadius:'12px',border:`1px solid ${payMethod===val?'#6366f1':'#334155'}`,
                              background:payMethod===val?'rgba(99,102,241,0.1)':'transparent',cursor:'pointer'}}>
                      <div style={{width:'20px',height:'20px',borderRadius:'50%',border:`2px solid ${payMethod===val?'#6366f1':'#334155'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {payMethod===val&&<div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#6366f1'}}/>}
                      </div>
                      <span style={{fontSize:'14px',color:'#f1f5f9'}}>{lbl}</span>
                    </div>
                  ))}
                </div>

                {payMethod==='card'&&(
                  <>
                    <input style={S.input} placeholder="Cardholder Name" value={cardName} onChange={e=>setCardName(e.target.value)} aria-label="Cardholder name" />
                    <input style={S.input} placeholder="Card Number" aria-label="Card number" inputMode="numeric" />
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                      <input style={{...S.input,marginBottom:0}} placeholder="MM/YY" aria-label="Expiry" />
                      <input style={{...S.input,marginBottom:0}} placeholder="CVV" aria-label="CVV" inputMode="numeric" />
                    </div>
                    <div style={{height:'10px'}}/>
                  </>
                )}

                <div style={{fontSize:'11px',color:'#64748b',textAlign:'center',marginBottom:'10px'}}>
                  By placing this order you agree to our <span style={{color:'#6366f1'}}>Terms of Service</span> and <span style={{color:'#6366f1'}}>Privacy Policy</span>.
                </div>
                <div style={{display:'flex',gap:'10px'}}>
                  <button style={{...S.btn('secondary'),flex:'0 0 auto',width:'auto',padding:'14px 18px'}} onClick={()=>setCheckoutStep('shipping')}>← Back</button>
                  <button style={{...S.btn(),flex:1,marginTop:'8px'}} onClick={placeOrder}>🔒 Place Order — ${finalTotal}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ CREATE LISTING MODAL ════════ */}
      {createOpen&&(
        <div style={S.modal} onClick={()=>setCreateOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>📦 Create Listing</span>
              <button style={S.closeBtn} onClick={()=>setCreateOpen(false)} aria-label="Close">✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <input type="file" ref={fileInputRef} accept="image/*" multiple style={{display:'none'}} onChange={handlePhotoSelect} aria-label="Upload photo" />
              <div onClick={()=>!photoUploading&&fileInputRef.current&&fileInputRef.current.click()}
                style={{height:'120px',background:'#0f172a',borderRadius:'14px',
                        border:`2px dashed ${photoPreview?'#6366f1':photoUploading?'#f59e0b':'#334155'}`,
                        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                        marginBottom:'14px',cursor:photoUploading?'default':'pointer',overflow:'hidden',position:'relative'}}>
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'12px'}} />
                ) : photoUploading ? (
                  <>
                    <div style={{fontSize:'28px',marginBottom:'8px'}}>📤</div>
                    <div style={{fontSize:'12px',color:'#f59e0b',marginBottom:'6px'}}>Uploading... {Math.round(photoProgress)}%</div>
                    <div style={{width:'140px',height:'6px',background:'#334155',borderRadius:'3px',overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${photoProgress}%`,background:'linear-gradient(90deg,#6366f1,#ec4899)',borderRadius:'3px',transition:'width 0.15s'}}/>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{fontSize:'32px',marginBottom:'6px'}}>📷</div>
                    <div style={{fontSize:'13px',color:'#64748b'}}>Tap to add photos</div>
                    <div style={{fontSize:'11px',color:'#475569',marginTop:'3px'}}>JPG, PNG up to 10MB</div>
                  </>
                )}
              </div>
              <input style={S.input} placeholder="Item Title *" value={newTitle} onChange={e=>setNewTitle(e.target.value)} aria-required="true" />
              <input style={S.input} placeholder="Price ($) *" type="number" value={newPrice} onChange={e=>setNewPrice(e.target.value)} aria-required="true" />
              <input style={S.input} placeholder="📍 Location (city, state)" value={newLocation} onChange={e=>setNewLocation(e.target.value)} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <select style={{...S.input,marginBottom:0}} value={newCat} onChange={e=>setNewCat(e.target.value)} aria-label="Category">
                  {CATEGORIES.slice(1).map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <select style={{...S.input,marginBottom:0}} value={newCond} onChange={e=>setNewCond(e.target.value)} aria-label="Condition">
                  {['New','Like New','Good','Fair','Poor'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <textarea style={{...S.input,minHeight:'70px',resize:'vertical',fontFamily:'inherit'}}
                placeholder="Description — add details to sell faster!" value={newDesc} onChange={e=>setNewDesc(e.target.value)} />
              <input style={S.input} placeholder="Tags (comma-separated): vintage, vinyl, 70s" value={newTags} onChange={e=>setNewTags(e.target.value)} />
              <button style={S.btn()} onClick={publishListing}>🚀 Publish Listing</button>
              <button style={S.btn('secondary')} onClick={()=>setCreateOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MANAGE LISTING MODAL ════════ */}
      {manageModal&&(
        <div style={S.modal} onClick={()=>setManageModal(null)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>⚙️ Manage Listing</span>
              <button style={S.closeBtn} onClick={()=>setManageModal(null)} aria-label="Close">✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{display:'flex',gap:'12px',marginBottom:'20px',padding:'12px',background:'#0f172a',borderRadius:'12px'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'10px',background:manageModal.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',flexShrink:0}}>
                  {manageModal.emoji||manageModal.avatar||'📦'}
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'13px'}}>{manageModal.title}</div>
                  <div style={{color:'#10b981',fontSize:'13px',fontWeight:700}}>${manageModal.price}</div>
                  <div style={{color:'#64748b',fontSize:'11px'}}>👁️ {manageModal.views} views · ❤️ {manageModal.likes} likes</div>
                </div>
              </div>
              <div style={{fontWeight:600,fontSize:'13px',color:'#94a3b8',marginBottom:'10px'}}>EDIT LISTING</div>
              <input style={S.input} placeholder="Title" value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
              <input style={S.input} placeholder="Price ($)" type="number" value={editPrice} onChange={e=>setEditPrice(e.target.value)} />
              <textarea style={{...S.input,minHeight:'60px',resize:'vertical',fontFamily:'inherit'}}
                placeholder="Description" value={editDesc} onChange={e=>setEditDesc(e.target.value)} />
              <button style={S.btn()} onClick={saveListing}>💾 Save Changes</button>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'12px'}}>
                {!manageModal.sold&&(
                  <button onClick={()=>markSold(manageModal.id)}
                    style={{padding:'12px',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:600,fontSize:'13px',background:'#10b981',color:'white'}}>
                    ✅ Mark as Sold
                  </button>
                )}
                <button onClick={()=>deleteListing(manageModal.id)}
                  style={{padding:'12px',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:600,fontSize:'13px',background:'#ef4444',color:'white',gridColumn:manageModal.sold?'1 / -1':'auto'}}>
                  🗑️ Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ CHAT MODAL ════════ */}
      {chatModal&&(
        <div style={S.modal} onClick={()=>setChatModal(null)}>
          <div style={{...S.modalBox,maxHeight:'80vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:chatModal.bg,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'13px'}}>{chatModal.avatar}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:'14px',color:'#f1f5f9'}}>{chatModal.name}</div>
                  <div style={{color:'#64748b',fontSize:'11px'}}>Re: {chatModal.item}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <button onClick={()=>setOfferOpen(true)}
                  style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'10px',padding:'6px 10px',color:'#a5b4fc',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                  💰 Offer
                </button>
                <button style={S.closeBtn} onClick={()=>setChatModal(null)} aria-label="Close">✕</button>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}} role="log" aria-label="Chat messages">
              {(chatThreads[chatModal.id]||[]).map((msg,i)=>(
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:msg.from==='seller'?'flex-end':'flex-start'}}>
                  <div style={{background:msg.from==='seller'?'linear-gradient(135deg,#6366f1,#ec4899)':'#1e293b',
                               borderRadius:msg.from==='seller'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                               padding:'10px 14px',maxWidth:'75%',fontSize:'14px',color:'#f1f5f9'}}>
                    {msg.text}
                  </div>
                  {/* R3-05: Read receipts on outgoing messages */}
                  {msg.from==='seller'&&(
                    <span style={{fontSize:'10px',color:'#6366f1',marginTop:'2px',paddingRight:'4px'}}>✓✓ Sent</span>
                  )}
                </div>
              ))}
              <div ref={chatBottomRef}/>
            </div>
            <div style={{display:'flex',gap:'10px',padding:'12px 16px',borderTop:'1px solid #1e293b'}}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter')sendMessage();}}
                placeholder="Type a message..." aria-label="Chat message"
                style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:'20px',padding:'10px 16px',color:'#f1f5f9',fontSize:'14px',outline:'none'}} />
              <button onClick={sendMessage} aria-label="Send message"
                style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',borderRadius:'50%',width:'40px',height:'40px',color:'white',cursor:'pointer',fontSize:'18px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>➤</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MAKE OFFER MODAL ════════ */}
      {offerOpen&&(
        <div style={S.modal} onClick={()=>setOfferOpen(false)}>
          <div style={{...S.modalBox,maxHeight:'40vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>💰 Make an Offer</span>
              <button style={S.closeBtn} onClick={()=>setOfferOpen(false)} aria-label="Close">✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'12px'}}>Re: {chatModal?.item} — enter your offer price:</div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                <span style={{color:'#10b981',fontSize:'20px',fontWeight:800}}>$</span>
                <input type="number" placeholder="0.00" value={offerAmount} onChange={e=>setOfferAmount(e.target.value)}
                  style={{...S.input,marginBottom:0,flex:1,fontSize:'20px',fontWeight:700}} aria-label="Offer amount" />
              </div>
              <button style={S.btn()} onClick={sendOffer}>Send Offer</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ R3-01: REPORT MODAL ════════ */}
      {reportModal&&(
        <div style={S.modal} onClick={()=>setReportModal(null)}>
          <div style={{...S.modalBox,maxHeight:'60vh'}} onClick={e=>e.stopPropagation()} role="dialog" aria-label="Report listing">
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>🚩 Report Listing</span>
              <button style={S.closeBtn} onClick={()=>setReportModal(null)} aria-label="Close">✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {reportDone ? (
                <div style={{textAlign:'center',padding:'20px',color:'#10b981'}}>
                  <div style={{fontSize:'40px',marginBottom:'12px'}}>✅</div>
                  <div style={{fontWeight:700,fontSize:'16px'}}>Report submitted</div>
                  <div style={{fontSize:'13px',color:'#64748b',marginTop:'6px'}}>Our team will review this listing within 24 hours.</div>
                </div>
              ) : (
                <>
                  <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'14px'}}>
                    Why are you reporting "<strong style={{color:'#f1f5f9'}}>{reportModal?.title?.slice(0,35)}</strong>"?
                  </div>
                  {REPORT_REASONS.map(r=>(
                    <div key={r} onClick={()=>setReportReason(r)} role="radio" aria-checked={reportReason===r}
                      style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',marginBottom:'8px',
                              borderRadius:'10px',border:`1px solid ${reportReason===r?'#ef4444':'#334155'}`,
                              background:reportReason===r?'rgba(239,68,68,0.1)':'transparent',cursor:'pointer'}}>
                      <div style={{width:'16px',height:'16px',borderRadius:'50%',border:`2px solid ${reportReason===r?'#ef4444':'#334155'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {reportReason===r&&<div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#ef4444'}}/>}
                      </div>
                      <span style={{fontSize:'13px',color:'#f1f5f9'}}>{r}</span>
                    </div>
                  ))}
                  <button style={{...S.btn('red'),marginTop:'12px'}} onClick={submitReport}>Submit Report</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ R3-02: WRITE REVIEW MODAL ════════ */}
      {writeReviewItem&&(
        <div style={S.modal} onClick={()=>setWriteReviewItem(null)}>
          <div style={{...S.modalBox,maxHeight:'65vh'}} onClick={e=>e.stopPropagation()} role="dialog" aria-label="Write a review">
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>✍️ Write a Review</span>
              <button style={S.closeBtn} onClick={()=>setWriteReviewItem(null)} aria-label="Close">✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {reviewDone ? (
                <div style={{textAlign:'center',padding:'20px',color:'#f59e0b'}}>
                  <div style={{fontSize:'40px',marginBottom:'12px'}}>⭐</div>
                  <div style={{fontWeight:700,fontSize:'16px'}}>Review posted!</div>
                  <div style={{fontSize:'13px',color:'#64748b',marginTop:'6px'}}>Thank you for your feedback.</div>
                </div>
              ) : (
                <>
                  <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'14px'}}>
                    Reviewing: <strong style={{color:'#f1f5f9'}}>{writeReviewItem?.title?.slice(0,40)}</strong>
                  </div>
                  <div style={{marginBottom:'14px'}}>
                    <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'8px'}}>YOUR RATING</div>
                    <div style={{display:'flex',gap:'8px'}} role="radiogroup" aria-label="Star rating">
                      {[1,2,3,4,5].map(n=>(
                        <button key={n} onClick={()=>setReviewRating(n)} aria-label={`${n} star${n>1?'s':''}`}
                          style={{background:'none',border:'none',fontSize:'28px',cursor:'pointer',
                                  color:n<=reviewRating?'#f59e0b':'#334155',transition:'transform 0.1s',
                                  transform:n<=reviewRating?'scale(1.15)':'scale(1)'}}>★</button>
                      ))}
                    </div>
                  </div>
                  <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'6px'}}>YOUR REVIEW</div>
                  <textarea value={reviewText} onChange={e=>setReviewText(e.target.value)}
                    placeholder="Share your experience with this item and seller..."
                    style={{...S.input,minHeight:'90px',resize:'vertical',fontFamily:'inherit'}} aria-label="Review text" />
                  <button style={S.btn()} onClick={submitReview}>Post Review</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ R3-09: CANCEL ORDER CONFIRM ════════ */}
      {cancelConfirm&&(
        <div style={S.modal} onClick={()=>setCancelConfirm(null)}>
          <div style={{...S.modalBox,maxHeight:'35vh'}} onClick={e=>e.stopPropagation()} role="dialog" aria-label="Cancel order confirmation">
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>Cancel Order?</span>
              <button style={S.closeBtn} onClick={()=>setCancelConfirm(null)} aria-label="Close">✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'16px'}}>
                Are you sure you want to cancel order <strong style={{color:'#f1f5f9'}}>{cancelConfirm}</strong>?
                This action cannot be undone.
              </div>
              <div style={{display:'flex',gap:'10px'}}>
                <button style={{...S.btn('secondary'),flex:1}} onClick={()=>setCancelConfirm(null)}>Keep Order</button>
                <button style={{...S.btn('red'),flex:1}} onClick={()=>cancelOrder(cancelConfirm)}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── UNIFIED TOAST ────────────────── */}
      {toast&&(
        <div role="alert" aria-live="polite"
          style={{position:'fixed',bottom:'140px',left:'50%',transform:'translateX(-50%)',
                  background:'#1e293b',border:'1px solid #6366f1',color:'#f1f5f9',
                  padding:'10px 20px',borderRadius:'12px',fontWeight:600,zIndex:200,
                  whiteSpace:'nowrap',fontSize:'13px',boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
          {toast}
        </div>
      )}

      {/* ── ORDER SUCCESS TOAST ──────────── */}
      {orderPlaced&&(
        <div role="alert"
          style={{position:'fixed',bottom:'140px',left:'50%',transform:'translateX(-50%)',
                  background:'#10b981',color:'white',padding:'12px 24px',
                  borderRadius:'12px',fontWeight:700,zIndex:200,whiteSpace:'nowrap'}}>
          ✅ Order placed! Check Order History to track.
        </div>
      )}

      {/* ── FAB ─────────────────────────── */}
      {tab!=='selling'&&(
        <button onClick={()=>setCreateOpen(true)} aria-label="Create new listing"
          style={{position:'fixed',bottom:'100px',right:'20px',width:'52px',height:'52px',borderRadius:'50%',
                  background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',color:'white',
                  fontSize:'24px',cursor:'pointer',zIndex:50,boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
      )}
    </div>
  );
}
