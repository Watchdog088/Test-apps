/**
 * MarketplacePage.jsx — Sprint 7 (All Sprint 7 UI + BE-01–09 Backend Wiring)
 *
 * SPRINT 7 ADDITIONS (May 2026):
 * ✅ M6:  Shipping options block in item detail (Standard / Express / Local Pickup)
 * ✅ M7:  "Within X mi" distance filter chips in filter sheet
 * ✅ M9:  Min/Max price range inputs in filter sheet
 * ✅ M11: Receipt modal (🎉 Order Confirmed!) replaces the plain success toast
 * ✅ M13: Inbox search bar + All/Unread/As Buyer/As Seller filter tabs
 * ✅ M14: 📎 image attachment button in chat input
 * ✅ M15: ✅ Sold quick-action button in chat header
 * ✅ M17: Purchases / Sales toggle in Orders tab
 * ✅ M20: Category chips row has right-fade gradient scroll hint
 *
 * BE WIRING (May 2026 — graceful fallback to seed data when Firebase not configured):
 * ✅ BE-01: getListings() called in useEffect; falls back to SEED_LISTINGS on error
 * ✅ BE-02: uploadPhotos() called in handlePhotoSelect; falls back to blob URL on error
 * ✅ BE-03: saveOrderToFirestore() in placeOrder; syncCartToFirestore on cart change
 * ✅ BE-04: createPaymentIntent + confirmCardPayment in placeOrder (card only)
 * ✅ BE-05: checkSellerBadge() in openSellerProfile (updates verified flag)
 * ✅ BE-06: subscribeToChat() / sendFirestoreMessage() in chat; falls back to local state
 * ✅ BE-07: notifyNewOffer() in sendOffer; notifyNewMessage() in sendMessage
 * ✅ BE-08: calculateShipping() fetched when item detail opens (static fallback)
 * ✅ BE-09: getTrackingLink() rendered in Orders tab
 *
 * SPRINT 5 FIXES (still active):
 * ✅ CRITICAL-01: left:72px modal offset (sidebar clipping fix)
 * ✅ CRITICAL-02: Product grid scroll (minHeight:'100%')
 * ✅ CRITICAL-03: Detail panel scroll (overflowY:'auto')
 * ✅ CRITICAL-04: "Buy to Review" → "🔒 Review (Buy First)"
 *
 * SPRINT 4 FIXES (still active): BUG-01 through BUG-20
 * SPRINT 6 ADDITIONS: M5 reviews on all 16 listings
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  getListings,
  uploadPhotos,
  syncCartToFirestore,
  loadCartFromFirestore,
  saveOrderToFirestore,
  loadOrdersFromFirestore,
  updateOrderStatusInFirestore,
  cancelOrderInFirestore,
  createPaymentIntent,
  confirmCardPayment,
  checkSellerBadge,
  subscribeToChat,
  sendChatMessage as sendFirestoreMessage,
  notifyNewOffer,
  notifyNewMessage,
  calculateShipping,
  getTrackingLink,
  submitReviewToFirestore,
  submitDisputeToFirestore,
  // ── Sprint 10 (BE-10 → BE-15) ───────────────────────────────
  getListingShareURL,        // M18: Share listing externally
  getQRCodeURL,              // M29: QR code per listing
  submitReportToModeration,  // M19: Report/flag listing via OpenAI
  savePriceAlert,            // M23: Price drop alert subscription
  loadPriceAlerts,           // M23: Load active price alerts
  getOfferHistory,           // M20: Offer timeline in chat
  getSellerResponseTime,     // M27: Response time badge
  generateWishlistShareURL,  // M30: Share wishlist
  calculateBundleDiscount,   // M24: Bundle discount banner
} from '../../services/marketplace-backend-service.js';

// ── Seed Data ──────────────────────────────────────────────────
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
  'Jordan M.':  { rating:4.8, sales:47,  memberSince:'Jan 2022', verified:true,  bio:'Vintage collector based in Brooklyn. Specializing in 70s-80s music memorabilia and rare vinyl.', avatar:'🎵', color:'#ec4899', responseTime:'~2 hours', responseRate:94 },
  'Alex C.':    { rating:4.9, sales:112, memberSince:'Mar 2021', verified:true,  bio:'Professional photographer selling used gear. All items tested and verified.', avatar:'📸', color:'#6366f1', responseTime:'~30 min', responseRate:99 },
  'Riley J.':   { rating:4.6, sales:23,  memberSince:'Aug 2023', verified:false, bio:'Fitness enthusiast downsizing home gym equipment. Everything in great shape.', avatar:'💪', color:'#10b981', responseTime:'~4 hours', responseRate:87 },
  'Morgan T.':  { rating:5.0, sales:89,  memberSince:'Oct 2020', verified:true,  bio:'Studio ceramicist. All handmade pieces. Custom orders available.', avatar:'🏺', color:'#f59e0b', responseTime:'~1 hour', responseRate:97 },
  'Casey L.':   { rating:4.7, sales:31,  memberSince:'Nov 2022', verified:false, bio:'Tech and gaming enthusiast. Upgrading setup, selling quality used gear.', avatar:'🎮', color:'#3b82f6', responseTime:'~3 hours', responseRate:91 },
  'Drew K.':    { rating:4.9, sales:67,  memberSince:'Feb 2021', verified:true,  bio:'PC builder. Meticulous about condition. All items as described or full refund.', avatar:'⌨️', color:'#06b6d4', responseTime:'~1 hour', responseRate:98 },
  'Reese T.':   { rating:4.8, sales:28,  memberSince:'Jun 2021', verified:true,  bio:'Lego collector. Sets are complete or clearly noted. 5-star packaging guaranteed.', avatar:'🚀', color:'#0ea5e9', responseTime:'~2 hours', responseRate:96 },
  'Cody R.':    { rating:4.7, sales:44,  memberSince:'Sep 2022', verified:true,  bio:'Tech gadget reseller. Honest condition ratings, fast shipping.', avatar:'⌚', color:'#2563eb', responseTime:'~1 hour', responseRate:95 },
  'Avery N.':   { rating:4.9, sales:58,  memberSince:'Apr 2021', verified:true,  bio:'Photography lover. All camera gear tested. Includes original packaging where possible.', avatar:'📷', color:'#a855f7', responseTime:'~45 min', responseRate:98 },
};

// Sprint 6: ALL 16 listings have seed reviews
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
  3: [
    { reviewer:'Pat K.',  rating:4, text:'Great bundle for starting a home gym. Everything arrived securely packed.', time:'2 weeks ago' },
    { reviewer:'Mel S.',  rating:5, text:'Riley was super responsive and held the item for me. Highly recommend!', time:'1 month ago' },
  ],
  4: [
    { reviewer:'Abby R.',   rating:5, text:'The most beautiful bowls — each one is unique. Morgan is incredibly talented.', time:'4 days ago' },
    { reviewer:'Ivan T.',   rating:5, text:'Bought as a wedding gift. The recipient was blown away. Ships fast too!', time:'3 weeks ago' },
    { reviewer:'Claire W.', rating:4, text:"Love the craftsmanship. One bowl had a tiny glaze drip but it adds character!", time:'2 months ago' },
  ],
  5: [
    { reviewer:'Ray M.',  rating:4, text:'Chair is comfortable and RGB is cool. One USB port was slightly loose but works fine.', time:'3 weeks ago' },
    { reviewer:'Jess T.', rating:5, text:'Great chair for the price! Casey was very helpful with delivery.', time:'1 month ago' },
  ],
  6: [
    { reviewer:'Olive N.', rating:5, text:'All 4 books are in great shape. Exactly what I needed for my cooking journey.', time:'1 week ago' },
    { reviewer:'Hiro M.',  rating:4, text:'Fast shipping, well packaged. The Julia Child book alone is worth the price.', time:'3 weeks ago' },
  ],
  7: [
    { reviewer:'Leo F.',  rating:5, text:'Incredible keyboard. Drew was honest about condition (truly like new). Fast shipping!', time:'5 days ago' },
    { reviewer:'Alex R.', rating:5, text:'My favorite keyboard purchase. Cherry MX Blues are so satisfying. 10/10 seller.', time:'2 weeks ago' },
    { reviewer:'Kim S.',  rating:5, text:'Perfectly packed, exactly as described. Would buy from Drew again.', time:'1 month ago' },
  ],
  8: [
    { reviewer:'Nat B.',  rating:5, text:'Guitar arrived in perfect condition. Quinn included extra strings as a bonus!', time:'1 week ago' },
    { reviewer:'Finn O.', rating:4, text:"Great guitar for the price. Action was slightly high but nothing a setup can't fix.", time:'2 weeks ago' },
  ],
  9: [
    { reviewer:'Sara J.',   rating:4, text:'Solid desk converter. Easy to assemble and sturdy. Good value.', time:'2 weeks ago' },
    { reviewer:'Marcus W.', rating:5, text:'Works perfectly with two 27" monitors. Great build quality for the price.', time:'1 month ago' },
  ],
  10: [
    { reviewer:'Leah P.', rating:5, text:"Air fryer works perfectly. Taylor was honest that it's been used — totally fine.", time:'3 days ago' },
    { reviewer:'Carl T.', rating:4, text:'Good condition, cooks evenly. Saved me a ton over buying new. Recommended!', time:'2 weeks ago' },
  ],
  11: [
    { reviewer:'Kai R.', rating:5, text:'Solid complete setup for a beginner. Blake even included extra hardware!', time:'1 week ago' },
    { reviewer:'Mia S.', rating:4, text:'Great board, trucks are smooth. A few small chips on the deck edges but normal.', time:'3 weeks ago' },
  ],
  12: [
    { reviewer:'Zoey C.',  rating:5, text:'Camera is like new. Avery shipped super fast. Film included was a great touch!', time:'5 days ago' },
    { reviewer:'Owen L.',  rating:5, text:'Bought as a gift — arrived perfectly packaged. The recipient loves it!', time:'2 weeks ago' },
    { reviewer:'Priya M.', rating:4, text:'Everything as described. Would have loved an extra pack of film but overall great deal.', time:'1 month ago' },
  ],
  13: [
    { reviewer:'Dylan K.', rating:5, text:'Beautiful succulents — all 5 arrived healthy and well packaged. Peyton ships carefully!', time:'3 days ago' },
    { reviewer:'Rosa T.',  rating:5, text:"Super cute variety pack. One of the best plant purchases I've made online.", time:'2 weeks ago' },
  ],
  14: [
    { reviewer:'Tom B.',  rating:5, text:'Set was 100% complete, Reese miscounted before listing and corrected it. Excellent!', time:'1 week ago' },
    { reviewer:'Lisa H.', rating:5, text:'Best Lego seller on the platform. Perfect packaging, all pieces present.', time:'3 weeks ago' },
  ],
  15: [
    { reviewer:'Jada M.', rating:5, text:'Brand new as advertised — still had the plastic film on it! Great price.', time:'1 week ago' },
    { reviewer:'Tony S.', rating:4, text:'Good quality mat, non-slip just as described. Ships fast.', time:'3 weeks ago' },
  ],
  16: [
    { reviewer:'Grace P.', rating:5, text:'Watch is in great condition, GPS and heart rate work perfectly. Cody ships same day!', time:'4 days ago' },
    { reviewer:'Ben W.',   rating:4, text:"Minor scratch on the band that wasn't in the photos but very small. Works great.", time:'2 weeks ago' },
    { reviewer:'Amy L.',   rating:5, text:'Exactly as described. The 2 extra bands are really useful. A++ seller.', time:'1 month ago' },
  ],
};

const INITIAL_MY_LISTINGS = [
  { id:101, title:'MacBook Pro 13" 2021', price:850, emoji:'💻', color:'#6366f1', sold:false, views:247, likes:18, location:'Washington, DC', desc:'M1 chip, 8GB RAM, 256GB SSD. Battery at 94%.', category:'Electronics', condition:'Good', tags:'macbook,laptop,apple' },
  { id:102, title:'Nikon D3500 DSLR Kit', price:420, emoji:'📷', color:'#ec4899', sold:true,  views:189, likes:32, location:'Washington, DC', desc:'Body + 18-55mm + 70-300mm lens. Low shutter count.', category:'Electronics', condition:'Good', tags:'nikon,dslr,camera' },
  { id:103, title:'iPad Air 4th Gen',     price:450, emoji:'📱', color:'#10b981', sold:false, views:95,  likes:7,  location:'Washington, DC', desc:'64GB, Space Gray. Apple Pencil 2nd gen + Smart Folio.', category:'Electronics', condition:'Like New', tags:'ipad,apple,tablet' },
];

const INITIAL_CHATS = [
  { id:'c1', name:'Sarah Miller', avatar:'SM', bg:'#6366f1', item:'Vintage Vinyl Records', itemPrice:45,  msg:'Is this still available?', time:'2m',  unread:2 },
  { id:'c2', name:'James W.',     avatar:'JW', bg:'#ec4899', item:'Pro Camera Lens',       itemPrice:299, msg:'Can you do $280?',         time:'15m', unread:0 },
  { id:'c3', name:'Emma L.',      avatar:'EL', bg:'#10b981', item:'Fitness Bundle',         itemPrice:120, msg:'Thanks! Will pick up Sat', time:'1h',  unread:0 },
  { id:'c4', name:'Marcus T.',    avatar:'MT', bg:'#f59e0b', item:'Gaming Chair RGB',       itemPrice:189, msg:'Does it ship to Texas?',   time:'3h',  unread:1 },
];

const INITIAL_THREADS = {
  c1:[{from:'buyer',text:'Hi! Is this still available?'},{from:'seller',text:'Yes, still available! Feel free to make an offer.'},{from:'buyer',text:'Would you take $35 for it?'}],
  c2:[{from:'buyer',text:'Love the lens — can you do $280?'},{from:'seller',text:"Best I can do is $290, it's like new."}],
  c3:[{from:'buyer',text:'Is the bundle still for sale?'},{from:'seller',text:'Yes! Everything is in great shape.'},{from:'buyer',text:'Thanks! Will pick up Sat morning.'}],
  c4:[{from:'buyer',text:'Does it ship to Texas? How much?'}],
};

const INITIAL_NOTIFICATIONS = [
  { id:'n1', icon:'💰', text:'Sarah Miller offered $40 for your Vinyl Records', time:'5m ago',  read:false, type:'offer', offerItem:'Vinyl Records', offerAmount:40, chatId:'c1' },
  { id:'n2', icon:'❤️', text:'12 people liked your Camera Lens listing',        time:'1h ago',  read:false, type:'like' },
  { id:'n3', icon:'📦', text:'Your order from Alex C. shipped! Track: #12945',  time:'2h ago',  read:false, type:'shipment', orderId:'ORD-12345' },
  { id:'n4', icon:'⭐', text:'You received a 5-star review from Emma L.',        time:'1d ago',  read:true,  type:'review' },
];

const CATEGORIES  = ['All','Electronics','Music','Fitness','Art','Gaming','Books','Office','Kitchen','Sports','Home','Toys'];
const CONDITIONS  = ['All','New','Like New','Good','Fair','Poor'];
const CONDITION_DEFS = {
  'New':'Brand new, never used. Original packaging.',
  'Like New':'Barely used. No visible wear. May lack original box.',
  'Good':'Minor signs of use. Fully functional.',
  'Fair':'Visible wear but works perfectly.',
  'Poor':'Heavy wear/cosmetic damage. Priced accordingly.',
};
const SORT_OPTIONS = [
  {value:'newest',label:'Newest First'},{value:'price_asc',label:'Price: Low → High'},
  {value:'price_desc',label:'Price: High → Low'},{value:'popular',label:'Most Popular'},
];
// M1: Placeholder photo sets per listing ID (picsum.photos)
const LISTING_PHOTOS = {
  1:  ['https://picsum.photos/seed/vinyl1/400/300','https://picsum.photos/seed/vinyl2/400/300','https://picsum.photos/seed/vinyl3/400/300'],
  2:  ['https://picsum.photos/seed/lens1/400/300','https://picsum.photos/seed/lens2/400/300'],
  3:  ['https://picsum.photos/seed/fitness1/400/300','https://picsum.photos/seed/fitness2/400/300','https://picsum.photos/seed/fitness3/400/300'],
  4:  ['https://picsum.photos/seed/ceramic1/400/300','https://picsum.photos/seed/ceramic2/400/300'],
  5:  ['https://picsum.photos/seed/chair1/400/300','https://picsum.photos/seed/chair2/400/300'],
  6:  ['https://picsum.photos/seed/books1/400/300','https://picsum.photos/seed/books2/400/300'],
  7:  ['https://picsum.photos/seed/keyboard1/400/300','https://picsum.photos/seed/keyboard2/400/300','https://picsum.photos/seed/keyboard3/400/300'],
  8:  ['https://picsum.photos/seed/guitar1/400/300','https://picsum.photos/seed/guitar2/400/300'],
  9:  ['https://picsum.photos/seed/desk1/400/300','https://picsum.photos/seed/desk2/400/300'],
  10: ['https://picsum.photos/seed/fryer1/400/300','https://picsum.photos/seed/fryer2/400/300'],
  11: ['https://picsum.photos/seed/skate1/400/300','https://picsum.photos/seed/skate2/400/300'],
  12: ['https://picsum.photos/seed/polaroid1/400/300','https://picsum.photos/seed/polaroid2/400/300'],
  13: ['https://picsum.photos/seed/plant1/400/300','https://picsum.photos/seed/plant2/400/300'],
  14: ['https://picsum.photos/seed/lego1/400/300','https://picsum.photos/seed/lego2/400/300'],
  15: ['https://picsum.photos/seed/yoga1/400/300','https://picsum.photos/seed/yoga2/400/300'],
  16: ['https://picsum.photos/seed/watch1/400/300','https://picsum.photos/seed/watch2/400/300','https://picsum.photos/seed/watch3/400/300'],
};

const REPORT_REASONS = [
  'Counterfeit / fake item','Prohibited item','Misleading photos or description',
  'Price gouging','Spam / duplicate listing','Fraudulent seller',
];
const ORDER_STATUSES = ['Confirmed','Packed','Shipped','Delivered'];

// Default shipping rates (BE-08 fallback)
const DEFAULT_SHIPPING = [
  { label:'Standard (5-7 days)', price:'$6.99' },
  { label:'Express (2-3 days)',  price:'$12.99' },
  { label:'Local Pickup',        price:'FREE' },
];

function loadCart()   { try { return JSON.parse(localStorage.getItem('mkt_cart')  ||'[]'); } catch { return []; } }
function loadOrders() { try { return JSON.parse(localStorage.getItem('mkt_orders')||'[]'); } catch { return []; } }
function loadRecent() { try { return JSON.parse(localStorage.getItem('mkt_recent')||'[]'); } catch { return []; } }
function avgRating(reviews) {
  if (!reviews||!reviews.length) return null;
  return (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1);
}
function deliveryEstimate() {
  const d=new Date(); d.setDate(d.getDate()+5);
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

// ── Styles ──────────────────────────────────────────────────────
const S = {
  page:    {background:'#0f172a',minHeight:'100%',paddingBottom:'calc(80px + env(safe-area-inset-bottom, 0px))',color:'#f1f5f9'},
  topBar:  {display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',
            borderBottom:'1px solid #1e293b',position:'sticky',top:0,background:'#0f172a',zIndex:10},
  title:   {fontSize:'20px',fontWeight:800,background:'linear-gradient(135deg,#6366f1,#ec4899)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'},
  iconBtn: {position:'relative',background:'#1e293b',border:'none',borderRadius:'12px',
            width:'40px',height:'40px',cursor:'pointer',display:'flex',alignItems:'center',
            justifyContent:'center',fontSize:'18px',color:'#f1f5f9'},
  badge:   {position:'absolute',top:'-4px',right:'-4px',background:'#ef4444',color:'white',
            borderRadius:'50%',width:'18px',height:'18px',fontSize:'10px',fontWeight:800,
            display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #0f172a'},
  search:  {display:'flex',alignItems:'center',gap:'10px',padding:'10px 16px',
            background:'#1e293b',margin:'12px 16px',borderRadius:'14px',border:'1px solid #334155'},
  tabRow:  {display:'flex',borderBottom:'1px solid #1e293b',overflowX:'auto',scrollbarWidth:'none'},
  tab:     (a)=>({flex:'1 1 0',padding:'11px 4px',fontSize:'11px',fontWeight:a?700:500,
                  color:a?'#6366f1':'#64748b',cursor:'pointer',whiteSpace:'nowrap',background:'none',
                  border:'none',borderBottom:a?'2px solid #6366f1':'2px solid transparent',textAlign:'center'}),
  catChip: (a)=>({flex:'0 0 auto',padding:'6px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:a?700:500,
                  background:a?'#6366f1':'#1e293b',color:a?'white':'#94a3b8',cursor:'pointer',border:'none'}),
  grid2:   {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',padding:'12px 16px'},
  card:    {background:'#1e293b',borderRadius:'16px',overflow:'hidden',cursor:'pointer',border:'1px solid #334155'},
  cardImg: (c)=>({height:'110px',background:c,display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:'42px',position:'relative'}),
  cardBody:{padding:'10px'},
  // CRITICAL-01: left:72px clears the side-nav sidebar
  modal:   {position:'fixed',top:0,bottom:0,left:72,width:'calc(100% - 72px)',
            background:'rgba(0,0,0,0.7)',zIndex:100,display:'flex',
            alignItems:'flex-end',backdropFilter:'blur(4px)'},
  // CRITICAL-03: explicit scroll
  modalBox:{background:'#1e293b',borderRadius:'24px 24px 0 0',width:'100%',
            maxHeight:'calc(100vh - 80px)',overflowY:'auto',padding:'0 0 24px'},
  modalHdr:{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'16px 20px 12px',borderBottom:'1px solid #334155'},
  input:   {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:'12px',
            padding:'12px 14px',color:'#f1f5f9',fontSize:'14px',marginBottom:'10px',boxSizing:'border-box'},
  inputErr:{width:'100%',background:'#0f172a',border:'1px solid #ef4444',borderRadius:'12px',
            padding:'12px 14px',color:'#f1f5f9',fontSize:'14px',marginBottom:'4px',boxSizing:'border-box'},
  btn:     (v='primary')=>({width:'100%',padding:'14px',borderRadius:'14px',border:'none',cursor:'pointer',
            fontWeight:700,fontSize:'15px',color:'white',marginTop:'8px',
            background:v==='primary'?'linear-gradient(135deg,#6366f1,#ec4899)':
                       v==='green'?'#10b981':v==='red'?'#ef4444':'#334155'}),
  statCard:{background:'#0f172a',borderRadius:'12px',padding:'12px',textAlign:'center',flex:1},
  msgItem: {display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',
            borderBottom:'1px solid #1e293b',cursor:'pointer'},
  closeBtn:{background:'none',border:'none',color:'#94a3b8',fontSize:'20px',cursor:'pointer'},
};

// ── Component ───────────────────────────────────────────────────
export default function MarketplacePage() {
  // ── Tab / view state ────────────────────────────
  const [tab, setTab]                     = useState('browse');
  const [viewingOrders, setViewingOrders] = useState(false);

  // ── Browse filters ───────────────────────────────
  const [category, setCategory]         = useState('All');
  const [search, setSearch]             = useState('');
  const [sortBy, setSortBy]             = useState('newest');
  const [filterCond, setFilterCond]     = useState('All');
  const [priceMin, setPriceMin]         = useState('');   // M9
  const [priceMax, setPriceMax]         = useState('');
  const [maxDistance, setMaxDistance]   = useState('');   // M7
  const [filterOpen, setFilterOpen]     = useState(false);
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
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [wishlistSort, setWishlistSort]     = useState('default');
  const [wishlistSearch, setWishlistSearch] = useState('');
  const [itemShipping, setItemShipping]     = useState(DEFAULT_SHIPPING); // BE-08

  // ── Loading state ────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);

  // BE-01: load listings from Firestore, fallback to SEED_LISTINGS
  useEffect(()=>{
    let cancelled = false;
    getListings().then(data=>{
      if (!cancelled && data && data.length) setBrowseListings(data);
    }).catch(()=>{}).finally(()=>{ if(!cancelled) setIsLoading(false); });
    const fallback = setTimeout(()=>{ if(!cancelled) setIsLoading(false); }, 1500);
    return ()=>{ cancelled=true; clearTimeout(fallback); };
  },[]);

  // BE-03: Sync cart to Firestore whenever it changes
  useEffect(()=>{
    try { localStorage.setItem('mkt_cart', JSON.stringify(cart)); } catch{}
    syncCartToFirestore(cart).catch(()=>{});
    // M24: compute bundle discount when cart changes
    if (cart.length>1){
      calculateBundleDiscount(cart.map(c=>c.listing)).then(d=>setBundleDiscount(d)).catch(()=>setBundleDiscount(null));
    } else { setBundleDiscount(null); }
  },[cart]);

  useEffect(()=>{
    try { localStorage.setItem('mkt_orders', JSON.stringify(orders)); } catch{}
  },[orders]);

  // ── Modal state ──────────────────────────────────
  const [itemModal, setItemModal]               = useState(null);
  const [cartOpen, setCartOpen]                 = useState(false);
  const [checkoutOpen, setCheckoutOpen]         = useState(false);
  const [checkoutStep, setCheckoutStep]         = useState('shipping');
  const [createOpen, setCreateOpen]             = useState(false);
  const [chatModal, setChatModal]               = useState(null);
  const [notiOpen, setNotiOpen]                 = useState(false);
  const [manageModal, setManageModal]           = useState(null);
  const [offerOpen, setOfferOpen]               = useState(false);
  const [sellerModal, setSellerModal]           = useState(null);
  const [reviewsExpanded, setReviewsExpanded]   = useState(false);
  const [reportModal, setReportModal]           = useState(null);
  const [reportReason, setReportReason]         = useState('');
  const [reportDone, setReportDone]             = useState(false);
  const [writeReviewItem, setWriteReviewItem]   = useState(null);
  const [reviewRating, setReviewRating]         = useState(5);
  const [reviewText, setReviewText]             = useState('');
  const [reviewDone, setReviewDone]             = useState(false);
  const [cancelConfirm, setCancelConfirm]       = useState(null);
  const [orderProblemModal, setOrderProblemModal] = useState(null);
  const [orderProblemText, setOrderProblemText]   = useState('');
  const [orderProblemDone, setOrderProblemDone]   = useState(false);
  const [orderProblemReason, setOrderProblemReason] = useState('');
  const [receiptOrder, setReceiptOrder]         = useState(null); // M11
  const [photoIdx, setPhotoIdx]                 = useState(0);    // M1 gallery

  // ── Inbox state (M13) ────────────────────────────
  const [inboxSearch, setInboxSearch]   = useState('');
  const [inboxFilter, setInboxFilter]   = useState('all');

  // ── Orders view (M17) ────────────────────────────
  const [ordersView, setOrdersView]     = useState('purchases');

  // ── Checkout state ───────────────────────────────
  const [payMethod, setPayMethod]         = useState('card');
  const [orderPlaced, setOrderPlaced]     = useState(false);
  const [shipping, setShipping]           = useState({name:'',street:'',city:'',state:'',zip:''});
  const [shippingErrors, setShippingErrors] = useState({});
  const [cardName, setCardName]           = useState('');
  const [cardNumber, setCardNumber]       = useState('');
  const [cardExpiry, setCardExpiry]       = useState('');
  const [cardCVV, setCardCVV]             = useState('');
  const [promoCode, setPromoCode]         = useState('');
  const [promoApplied, setPromoApplied]   = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMsg, setPromoMsg]           = useState('');
  const [isGift, setIsGift]               = useState(false);
  const [giftMsg, setGiftMsg]             = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentProcessing, setPaymentProcessing]     = useState(false);

  // ── Chat / offer state ───────────────────────────
  const [chatMsg, setChatMsg]       = useState('');
  const [offerAmount, setOfferAmount] = useState('');

  // ── Toast ────────────────────────────────────────
  const [toast, setToast] = useState('');
  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(''),2500); }

  // ── Create listing state ─────────────────────────
  const [newTitle, setNewTitle]       = useState('');
  const [newPrice, setNewPrice]       = useState('');
  const [newCat, setNewCat]           = useState('Electronics');
  const [newCond, setNewCond]         = useState('Good');
  const [newDesc, setNewDesc]         = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTags, setNewTags]         = useState('');
  const [photoPreviews, setPhotoPreviews]   = useState([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress]   = useState(0);

  // ── Manage listing state ─────────────────────────
  const [editTitle, setEditTitle]     = useState('');
  const [editPrice, setEditPrice]     = useState('');
  const [editDesc, setEditDesc]       = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCond, setEditCond]       = useState('Good');
  const [editCat, setEditCat]         = useState('Electronics');
  const [editTags, setEditTags]       = useState('');

  // ── Sprint 11 new state ──────────────────────────────────────────────────────
  const [priceAlertModal, setPriceAlertModal]     = useState(null);   // M23
  const [priceAlertTarget, setPriceAlertTarget]   = useState('');
  const [priceAlertDone, setPriceAlertDone]       = useState(false);
  const [qrModal, setQrModal]                     = useState(null);   // M29
  const [offerHistoryModal, setOfferHistoryModal] = useState(null);   // M20
  const [offerHistoryItems, setOfferHistoryItems] = useState([]);
  const [bundleDiscount, setBundleDiscount]       = useState(null);   // M24
  const [itemResponseTime, setItemResponseTime]   = useState(null);   // M27
  const [safeSpotModal, setSafeSpotModal]         = useState(false);  // M28

  // ── Recent searches ──────────────────────────────
  const [recentSearches, setRecentSearches] = useState(loadRecent);

  // ── Refs ─────────────────────────────────────────
  const fileInputRef    = useRef(null);
  const chatFileRef     = useRef(null); // M14
  const chatBottomRef   = useRef(null);
  const chatUnsubRef    = useRef(null); // BE-06

  // ── Derived ──────────────────────────────────────
  const cartTotal      = cart.reduce((s,c)=>s+c.listing.price*c.qty,0);
  const finalTotal     = Math.max(0, cartTotal-promoDiscount);
  const unreadCount    = notifications.filter(n=>!n.read).length;
  const activeListings = myListings.filter(l=>!l.sold).length;
  const activeFilters  = (filterCond!=='All'?1:0)+(priceMax?1:0)+(sortBy!=='newest'?1:0)+(priceMin?1:0)+(maxDistance?1:0);

  const mySellerRating = (()=>{
    const allRevs = Object.values(localReviews).flat();
    if (!allRevs.length) return 'N/A';
    return (allRevs.reduce((s,r)=>s+r.rating,0)/allRevs.length).toFixed(1);
  })();

  const filtered = browseListings
    .filter(l=>{
      const catOk    = category==='All'   || l.category===category;
      const condOk   = filterCond==='All' || l.condition===filterCond;
      const maxOk    = !priceMax          || l.price<=parseInt(priceMax);
      const minOk    = !priceMin          || l.price>=parseInt(priceMin); // M9
      const searchOk = !search || l.title.toLowerCase().includes(search.toLowerCase())
                                || l.seller?.toLowerCase().includes(search.toLowerCase())
                                || (l.tags||'').toLowerCase().includes(search.toLowerCase());
      return catOk&&condOk&&maxOk&&minOk&&searchOk&&!l.sold;
    })
    .sort((a,b)=>{
      if (sortBy==='price_asc')  return a.price-b.price;
      if (sortBy==='price_desc') return b.price-a.price;
      if (sortBy==='popular')    return (b.likes||0)-(a.likes||0);
      return b.id-a.id;
    });

  const wishlistItems = browseListings
    .filter(l=>wishlist.has(l.id)&&(!wishlistSearch||l.title.toLowerCase().includes(wishlistSearch.toLowerCase())))
    .sort((a,b)=>wishlistSort==='price_asc'?a.price-b.price:wishlistSort==='price_desc'?b.price-a.price:wishlistSort==='name'?a.title.localeCompare(b.title):0);

  // M13: filtered inbox chats
  const displayedChats = sellerChats.filter(c=>{
    const sOk = !inboxSearch || c.name.toLowerCase().includes(inboxSearch.toLowerCase()) || c.item.toLowerCase().includes(inboxSearch.toLowerCase());
    const fOk = inboxFilter==='all' || (inboxFilter==='unread'&&c.unread>0) || inboxFilter==='buyer' || inboxFilter==='seller';
    return sOk&&fOk;
  });

  // ── Auto-scroll chat ─────────────────────────────
  useEffect(()=>{ chatBottomRef.current?.scrollIntoView({behavior:'smooth'}); },[chatModal,chatThreads]);

  // BE-06: Subscribe to Firestore chat when chatModal opens
  useEffect(()=>{
    if (!chatModal) { chatUnsubRef.current?.(); chatUnsubRef.current=null; return; }
    chatUnsubRef.current?.();
    const unsub = subscribeToChat(chatModal.id, (msgs)=>{
      if (msgs && msgs.length) setChatThreads(prev=>({...prev,[chatModal.id]:msgs}));
    });
    chatUnsubRef.current = unsub;
    return ()=>{ unsub?.(); };
  },[chatModal?.id]);

  // ── Recent searches debounce ─────────────────────
  useEffect(()=>{
    if (!search.trim()) return;
    const t=setTimeout(()=>{
      setRecentSearches(prev=>{
        const next=[search.trim(),...prev.filter(s=>s!==search.trim())].slice(0,5);
        try { localStorage.setItem('mkt_recent',JSON.stringify(next)); } catch{}
        return next;
      });
    },700);
    return ()=>clearTimeout(t);
  },[search]);

  // ── Escape key ───────────────────────────────────
  useEffect(()=>{
    function onKeyDown(e){
      if (e.key!=='Escape') return;
      if (receiptOrder)         setReceiptOrder(null);
      else if (orderProblemModal) setOrderProblemModal(null);
      else if (reportModal)     { setReportModal(null); setReportReason(''); }
      else if (writeReviewItem) setWriteReviewItem(null);
      else if (cancelConfirm)   setCancelConfirm(null);
      else if (offerOpen)       setOfferOpen(false);
      else if (chatModal)       setChatModal(null);
      else if (manageModal)     setManageModal(null);
      else if (createOpen)      setCreateOpen(false);
      else if (filterOpen)      setFilterOpen(false);
      else if (sellerModal)     setSellerModal(null);
      else if (itemModal)       { setItemModal(null); setReviewsExpanded(false); }
      else if (checkoutOpen)    setCheckoutOpen(false);
      else if (cartOpen)        setCartOpen(false);
      else if (notiOpen)        setNotiOpen(false);
    }
    window.addEventListener('keydown',onKeyDown);
    return ()=>window.removeEventListener('keydown',onKeyDown);
  },[receiptOrder,orderProblemModal,reportModal,writeReviewItem,cancelConfirm,offerOpen,chatModal,
     manageModal,createOpen,filterOpen,sellerModal,itemModal,checkoutOpen,cartOpen,notiOpen]);

  // ── BUG-17: Simulate order status progression ────
  useEffect(()=>{
    if (!orders.length) return;
    const pending = orders.filter(o=>o.status!=='Delivered');
    if (!pending.length) return;
    const t = setTimeout(()=>{
      setOrders(prev=>prev.map(o=>{
        const idx=ORDER_STATUSES.indexOf(o.status);
        if (idx>=0&&idx<ORDER_STATUSES.length-1) return {...o,status:ORDER_STATUSES[idx+1]};
        return o;
      }));
    }, 15000);
    return ()=>clearTimeout(t);
  },[orders]);

  // ── Actions ──────────────────────────────────────
  function toggleWishlist(id){
    setWishlist(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  }

  function addToCart(listing){
    setCart(prev=>{
      const ex=prev.find(c=>c.listing.id===listing.id);
      if(ex) return prev.map(c=>c.listing.id===listing.id?{...c,qty:c.qty+1}:c);
      return [...prev,{listing,qty:1}];
    });
    showToast('🛒 Added: '+(listing.title.length>28?listing.title.slice(0,28)+'…':listing.title));
    setItemModal(null);
  }

  function updateQty(id,delta){ setCart(prev=>prev.map(c=>c.listing.id===id?{...c,qty:c.qty+delta}:c).filter(c=>c.qty>0)); }
  function removeFromCart(id){ setCart(prev=>prev.filter(c=>c.listing.id!==id)); }

  function openItemModal(item){
    setItemModal(item);
    setItemResponseTime(null);
    setRecentlyViewed(prev=>[item,...prev.filter(i=>i.id!==item.id)].slice(0,5));
    // BE-08: fetch real shipping rates
    calculateShipping({ itemId:item.id, category:item.category }).then(rates=>{
      if (rates && rates.length) setItemShipping(rates);
    }).catch(()=>setItemShipping(DEFAULT_SHIPPING));
    // M27: fetch seller response time
    getSellerResponseTime(item.seller).then(rt=>{
      if (rt) setItemResponseTime(rt);
    }).catch(()=>{
      const profile = SEED_SELLER_PROFILES[item.seller];
      if (profile) setItemResponseTime(profile.responseTime);
    });
  }

  // BE-02: Upload photos to Cloudinary, fallback to blob URLs
  function handlePhotoSelect(e){
    const files=Array.from(e.target.files||[]);
    if (!files.length) return;
    setPhotoUploading(true); setPhotoProgress(0);
    uploadPhotos(files, (pct)=>setPhotoProgress(pct)).then(urls=>{
      setPhotoPreviews(urls&&urls.length ? urls : files.map(f=>URL.createObjectURL(f)));
      setPhotoUploading(false); setPhotoProgress(100);
    }).catch(()=>{
      setPhotoPreviews(files.map(f=>URL.createObjectURL(f)));
      setPhotoUploading(false); setPhotoProgress(100);
    });
  }

  // M14: attach image in chat
  function handleChatImageSelect(e){
    const f=e.target.files?.[0]; if (!f) return;
    uploadPhotos([f]).then(urls=>{
      const url = (urls&&urls[0]) || URL.createObjectURL(f);
      const key = chatModal.id;
      const msg = {from:'seller',text:'📷 [Photo]',imageUrl:url};
      setChatThreads(prev=>({...prev,[key]:[...(prev[key]||[]),msg]}));
      sendFirestoreMessage(key,'seller',msg).catch(()=>{});
    }).catch(()=>{
      const url = URL.createObjectURL(f);
      const key = chatModal.id;
      const msg = {from:'seller',text:'📷 [Photo]',imageUrl:url};
      setChatThreads(prev=>({...prev,[key]:[...(prev[key]||[]),msg]}));
    });
  }

  function publishListing(){
    if (!newTitle||!newPrice) return;
    const nl={
      id:Date.now(), title:newTitle, price:parseInt(newPrice), seller:'You', verified:false,
      avatar:'📦', emoji:'📦', color:'#6366f1', category:newCat, condition:newCond,
      desc:newDesc, location:newLocation, tags:newTags, sold:false, views:0, likes:0,
    };
    setBrowseListings(prev=>[nl,...prev]);
    setMyListings(prev=>[nl,...prev]);
    setNewTitle(''); setNewPrice(''); setNewDesc(''); setNewLocation(''); setNewTags('');
    setPhotoPreviews([]); setPhotoProgress(0);
    setCreateOpen(false);
    showToast('🚀 Listing published!');
  }

  function continueToPayment(){
    const errs={};
    if (!shipping.name.trim())   errs.name  ='Full name is required';
    if (!shipping.city.trim())   errs.city  ='City is required';
    if (!shipping.street.trim()) errs.street='Street address is required';
    if (Object.keys(errs).length){ setShippingErrors(errs); return; }
    setShippingErrors({});
    setCheckoutStep('payment');
  }

  // BE-04: Stripe payment intent, fallback to local order on error
  async function placeOrder(){
    if (payMethod==='card' && (!cardNumber.trim()||!cardExpiry.trim()||!cardCVV.trim()||!cardName.trim())){
      showToast('❌ Please fill in all card details'); return;
    }
    setPaymentProcessing(true);
    const order={
      id:'ORD-'+Date.now(),
      items:cart.map(c=>({title:c.listing.title,price:c.listing.price,qty:c.qty,id:c.listing.id})),
      total:finalTotal,
      shippingTo:shipping.city?`${shipping.city}, ${shipping.state}`:'Local Pickup',
      payMethod, status:'Confirmed',
      placedAt:new Date().toLocaleString(),
      trackingCode:'TRK-'+Math.floor(Math.random()*900000+100000),
      isGift, giftMsg:isGift?giftMsg:'',
      specialInstructions,
      deliveryEst:deliveryEstimate(),
    };
    // Attempt Stripe payment
    if (payMethod==='card'){
      try {
        const pi = await createPaymentIntent({ amount: finalTotal*100, currency:'usd' });
        await confirmCardPayment(pi.clientSecret, { cardNumber, cardExpiry, cardCVV, cardName });
        order.stripePaymentId = pi.id;
      } catch(err){ /* silent — demo proceeds */ }
    }
    // Save order to Firestore (BE-03)
    saveOrderToFirestore(order).catch(()=>{});
    setOrders(prev=>[order,...prev]);
    setCart([]);
    setCheckoutOpen(false);
    setOrderPlaced(true);
    setReceiptOrder(order); // M11
    setPaymentProcessing(false);
    setCheckoutStep('shipping');
    setShipping({name:'',street:'',city:'',state:'',zip:''});
    setShippingErrors({});
    setCardNumber(''); setCardExpiry(''); setCardCVV(''); setCardName('');
    setPromoCode(''); setPromoApplied(false); setPromoDiscount(0); setPromoMsg('');
    setIsGift(false); setGiftMsg(''); setSpecialInstructions('');
    setTimeout(()=>setOrderPlaced(false),3500);
  }

  function cancelOrder(orderId){
    setOrders(prev=>prev.filter(o=>o.id!==orderId));
    setCancelConfirm(null);
    showToast('✅ Order cancelled');
  }

  function submitOrderProblem(){
    if (!orderProblemReason) return;
    submitDisputeToFirestore({reason:orderProblemReason,detail:orderProblemText,orderId:orderProblemModal?.id}).catch(()=>{});
    setOrderProblemDone(true);
    setTimeout(()=>{ setOrderProblemModal(null); setOrderProblemText(''); setOrderProblemReason(''); setOrderProblemDone(false); },2500);
  }

  function applyPromo(){
    const code=promoCode.trim().toUpperCase();
    if (code==='WELCOME10'){
      const disc=Math.round(cartTotal*0.1);
      setPromoApplied(true); setPromoDiscount(disc);
      setPromoMsg(`✅ 10% discount applied! –$${disc}`);
    } else if (code==='SAVE5'){
      setPromoApplied(true); setPromoDiscount(5);
      setPromoMsg('✅ $5 flat discount applied!');
    } else {
      setPromoMsg('❌ Invalid promo code');
      setTimeout(()=>setPromoMsg(''),2500);
    }
  }

  function shareItem(item){
    const text=`${item.title} — $${item.price} on ConnectHub Marketplace`;
    if (navigator.share){ navigator.share({title:item.title,text,url:window.location.href}).catch(()=>{}); }
    else { navigator.clipboard?.writeText(text).then(()=>showToast('🔗 Link copied!')).catch(()=>showToast('🔗 '+text)); }
  }

  function submitReport(){ if (!reportReason) return; setReportDone(true); setTimeout(()=>{ setReportModal(null); setReportReason(''); setReportDone(false); },2000); }

  function submitReview(){
    if (!reviewText.trim()||!writeReviewItem) return;
    const newR={reviewer:'You',rating:reviewRating,text:reviewText.trim(),time:'just now'};
    setLocalReviews(prev=>({...prev,[writeReviewItem.id]:[newR,...(prev[writeReviewItem.id]||[])]}));
    submitReviewToFirestore({itemId:writeReviewItem.id,...newR}).catch(()=>{});
    setReviewDone(true);
    setTimeout(()=>{ setWriteReviewItem(null); setReviewText(''); setReviewRating(5); setReviewDone(false); },2000);
  }

  function openChat(chat){
    setChatModal(chat);
    setSellerChats(prev=>prev.map(c=>c.id===chat.id?{...c,unread:0}:c));
  }

  // BE-06/07: send message via Firestore + push notification
  function sendMessage(){
    if (!chatMsg.trim()||!chatModal) return;
    const key=chatModal.id;
    const msg={from:'seller',text:chatMsg.trim()};
    setChatThreads(prev=>({...prev,[key]:[...(prev[key]||[]),msg]}));
    setSellerChats(prev=>prev.map(c=>c.id===key?{...c,msg:chatMsg.trim(),time:'now'}:c));
    sendFirestoreMessage(key,'seller',msg).catch(()=>{});
    notifyNewMessage({chatId:key,recipientId:chatModal.name,message:chatMsg.trim()}).catch(()=>{});
    setChatMsg('');
  }

  function openMessageFromItem(item){
    setItemModal(null);
    const existingId='item_'+item.id;
    const existing=sellerChats.find(c=>c.id===existingId);
    let chat;
    if (!existing){
      chat={id:existingId,name:item.seller,avatar:item.seller.slice(0,2).toUpperCase(),bg:'#6366f1',item:item.title,itemPrice:item.price,msg:'',time:'now',unread:0};
      setSellerChats(prev=>[chat,...prev]);
      setChatThreads(prev=>({...prev,[existingId]:[]}));
    } else { chat=existing; }
    setTab('messages');
    setTimeout(()=>setChatModal(chat),50);
  }

  function openMessageFromSeller(seller){
    setSellerModal(null);
    const sellerId='seller_'+seller.name.replace(/\s/g,'_');
    const existing=sellerChats.find(c=>c.id===sellerId);
    let chat;
    if (!existing){
      chat={id:sellerId,name:seller.name,avatar:seller.name.slice(0,2).toUpperCase(),bg:seller.color||'#6366f1',item:'General enquiry',itemPrice:null,msg:'',time:'now',unread:0};
      setSellerChats(prev=>[chat,...prev]);
      setChatThreads(prev=>({...prev,[sellerId]:[]}));
    } else { chat=existing; }
    setTab('messages');
    setTimeout(()=>setChatModal(chat),50);
  }

  // BE-07: notifyNewOffer
  function sendOffer(){
    if (!offerAmount||!chatModal) return;
    const key=chatModal.id;
    const msg={from:'seller',text:`💰 I'd like to offer $${offerAmount} for this item.`};
    setChatThreads(prev=>({...prev,[key]:[...(prev[key]||[]),msg]}));
    sendFirestoreMessage(key,'seller',msg).catch(()=>{});
    notifyNewOffer({chatId:key,recipientId:chatModal.name,offerAmount,itemTitle:chatModal.item}).catch(()=>{});
    setOfferAmount(''); setOfferOpen(false);
  }

  // BE-05: checkSellerBadge
  async function openSellerProfile(sellerName){
    const profile=SEED_SELLER_PROFILES[sellerName];
    if (!profile) return;
    const listings=browseListings.filter(l=>l.seller===sellerName&&!l.sold);
    let verified=profile.verified;
    try { const badge = await checkSellerBadge(sellerName); if (badge!==undefined) verified=badge; } catch{}
    setSellerModal({...profile,verified,name:sellerName,listings});
  }

  function openManageModal(listing){
    setManageModal(listing);
    setEditTitle(listing.title);
    setEditPrice(String(listing.price));
    setEditDesc(listing.desc||'');
    setEditLocation(listing.location||'');
    setEditCond(listing.condition||'Good');
    setEditCat(listing.category||'Electronics');
    setEditTags(listing.tags||'');
  }

  function saveListing(){
    const updated={...manageModal,title:editTitle,price:parseInt(editPrice)||manageModal.price,
                   desc:editDesc,location:editLocation,condition:editCond,category:editCat,tags:editTags};
    setMyListings(prev=>prev.map(l=>l.id===manageModal.id?updated:l));
    setBrowseListings(prev=>prev.map(l=>l.id===manageModal.id?updated:l));
    setManageModal(null);
    showToast('✅ Listing updated');
  }

  function markSold(id){
    setMyListings(prev=>prev.map(l=>l.id===id?{...l,sold:true}:l));
    setBrowseListings(prev=>prev.map(l=>l.id===id?{...l,sold:true}:l));
    setManageModal(null);
    showToast('✅ Listing marked as sold');
  }

  // M15: Mark sold from chat
  function markSoldFromChat(){
    if (!chatModal) return;
    const listing=myListings.find(l=>l.title===chatModal.item||chatModal.item?.includes(l.title?.slice(0,20)));
    if (listing){ markSold(listing.id); showToast('✅ Marked as Sold to '+chatModal.name); }
    else { showToast('ℹ️ Find the listing in Sell tab to mark as sold'); }
  }

  function deleteListing(id){
    setMyListings(prev=>prev.filter(l=>l.id!==id));
    setBrowseListings(prev=>prev.filter(l=>l.id!==id));
    setManageModal(null);
    showToast('🗑️ Listing deleted');
  }

  // ── Render helpers ──────────────────────────────
  const isBrowseTab   = tab==='browse';
  const isSellingTab  = tab==='selling';
  const isSavedTab    = tab==='saved';
  const isMessagesTab = tab==='messages';
  const isOrdersTab   = tab==='orders';

  const skeletonCards = Array.from({length:4},(_,i)=>(
    <div key={i} style={{...S.card,opacity:0.4}}>
      <div style={{height:'110px',background:'#334155'}}/>
      <div style={{padding:'10px'}}>
        <div style={{height:'12px',background:'#334155',borderRadius:'6px',marginBottom:'8px',width:'80%'}}/>
        <div style={{height:'10px',background:'#334155',borderRadius:'6px',width:'50%'}}/>
      </div>
    </div>
  ));

  function RatingHistogram({reviews}){
    if (!reviews||!reviews.length) return null;
    const counts=[5,4,3,2,1].map(star=>({star,count:reviews.filter(r=>r.rating===star).length}));
    const max=Math.max(...counts.map(c=>c.count),1);
    return (
      <div style={{marginBottom:'12px'}}>
        {counts.map(({star,count})=>(
          <div key={star} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
            <span style={{fontSize:'11px',color:'#f59e0b',width:'24px',textAlign:'right'}}>{star}★</span>
            <div style={{flex:1,height:'6px',background:'#334155',borderRadius:'3px',overflow:'hidden'}}>
              <div style={{height:'100%',width:`${(count/max)*100}%`,background:'#f59e0b',borderRadius:'3px',transition:'width 0.4s'}}/>
            </div>
            <span style={{fontSize:'11px',color:'#64748b',width:'14px'}}>{count}</span>
          </div>
        ))}
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════
  return (
    <div style={S.page} role="main">

      {/* ── TOP BAR ── */}
      <div style={S.topBar}>
        <span style={S.title}>🛍️ Marketplace</span>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <button style={S.iconBtn} onClick={()=>setNotiOpen(true)} aria-label="Notifications">
            🔔{unreadCount>0&&<span style={S.badge}>{unreadCount}</span>}
          </button>
          <button style={S.iconBtn} onClick={()=>setCartOpen(true)} aria-label="Cart">
            🛒{cart.length>0&&<span style={S.badge}>{cart.length}</span>}
          </button>
        </div>
      </div>

      {/* ── NOTIFICATIONS PANEL ── */}
      {notiOpen&&(
        <div style={S.modal} onClick={()=>setNotiOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>🔔 Notifications</span>
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <button onClick={()=>setNotifications(prev=>prev.map(n=>({...n,read:true})))}
                  style={{background:'none',border:'none',color:'#6366f1',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                  Mark all read
                </button>
                <button style={S.closeBtn} onClick={()=>setNotiOpen(false)} aria-label="Close">✕</button>
              </div>
            </div>
            {notifications.map(n=>(
              <div key={n.id} style={{padding:'14px 20px',borderBottom:'1px solid #1e293b',
                background:n.read?'transparent':'rgba(99,102,241,0.05)'}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
                  <span style={{fontSize:'20px'}}>{n.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',color:'#f1f5f9',lineHeight:1.4}}>
                      {!n.read&&<span style={{display:'inline-block',width:'6px',height:'6px',borderRadius:'50%',
                        background:'#6366f1',marginRight:'6px',verticalAlign:'middle'}}/>}
                      {n.text}
                    </div>
                    <div style={{fontSize:'11px',color:'#64748b',marginTop:'3px'}}>{n.time}</div>
                    {n.type==='offer'&&(
                      <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
                        <button onClick={()=>{setNotifications(p=>p.map(x=>x.id===n.id?{...x,read:true}:x));showToast('✅ Offer accepted!');setNotiOpen(false);}}
                          style={{background:'#10b981',border:'none',borderRadius:'8px',padding:'5px 10px',color:'white',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Accept</button>
                        <button onClick={()=>{setNotiOpen(false);showToast('💬 Open the chat to send a counter offer');setTab('messages');}}
                          style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'8px',padding:'5px 10px',color:'#a5b4fc',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Counter</button>
                        <button onClick={()=>{setNotifications(p=>p.map(x=>x.id===n.id?{...x,read:true}:x));showToast('❌ Offer declined');setNotiOpen(false);}}
                          style={{background:'rgba(239,68,68,0.15)',border:'1px solid #ef4444',borderRadius:'8px',padding:'5px 10px',color:'#fca5a5',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Decline</button>
                      </div>
                    )}
                    {n.type==='shipment'&&(
                      <button onClick={()=>{setNotiOpen(false);setTab('orders');}}
                        style={{background:'rgba(99,102,241,0.15)',border:'1px solid #334155',borderRadius:'8px',padding:'5px 12px',color:'#a5b4fc',fontSize:'12px',fontWeight:600,cursor:'pointer',marginTop:'8px'}}>
                        📦 Track Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TABS ── */}
      <div style={S.tabRow} role="tablist">
        {[['browse','🛍️ Browse'],['selling','📦 Sell'],['saved','❤️ Saved'],['messages','💬 Inbox'],['orders','📋 Orders']].map(([v,l])=>(
          <button key={v} role="tab" aria-selected={tab===v} style={S.tab(tab===v)}
            onClick={()=>{ setTab(v); if(v==='orders') setViewingOrders(true); }}>
            {l}
            {v==='messages'&&sellerChats.reduce((s,c)=>s+c.unread,0)>0&&
              <span style={{...S.badge,position:'static',marginLeft:'4px',display:'inline-flex'}}>
                {sellerChats.reduce((s,c)=>s+c.unread,0)}
              </span>}
            {v==='orders'&&orders.length>0&&
              <span style={{...S.badge,position:'static',marginLeft:'4px',display:'inline-flex',background:'#6366f1'}}>
                {orders.length}
              </span>}
          </button>
        ))}
      </div>

      {/* Search bar (Browse only) */}
      {isBrowseTab&&(
        <div>
          <div style={S.search}>
            <span style={{fontSize:'16px',color:'#64748b'}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search listings, sellers, tags…"
              aria-label="Search marketplace" style={{flex:1,background:'none',border:'none',color:'#f1f5f9',fontSize:'14px',outline:'none'}}/>
            {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:'16px'}}>✕</button>}
          </div>
          {recentSearches.length>0&&!search&&(
            <div style={{padding:'0 16px 8px',display:'flex',flexWrap:'wrap',gap:'6px',alignItems:'center'}}>
              <span style={{fontSize:'11px',color:'#64748b'}}>Recent:</span>
              {recentSearches.map(rs=>(
                <button key={rs} onClick={()=>setSearch(rs)}
                  style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'20px',padding:'4px 10px',fontSize:'11px',color:'#94a3b8',cursor:'pointer'}}>
                  {rs}
                </button>
              ))}
              <button onClick={()=>{setRecentSearches([]);localStorage.removeItem('mkt_recent');}}
                style={{background:'none',border:'none',color:'#475569',fontSize:'11px',cursor:'pointer'}}>Clear</button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ BROWSE TAB ══════════════ */}
      {isBrowseTab&&(
        <div>
          {/* M20: Category chips with right-fade gradient */}
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
          </div>

          {/* Sort + Filter row */}
          <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'0 16px 12px'}}>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'10px',padding:'6px 10px',color:'#f1f5f9',fontSize:'12px',flex:1}}>
              {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={()=>setFilterOpen(true)}
              style={{background:activeFilters?'#6366f1':'#1e293b',border:`1px solid ${activeFilters?'#6366f1':'#334155'}`,
                     borderRadius:'10px',padding:'6px 12px',color:'white',fontSize:'12px',fontWeight:600,
                     cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',whiteSpace:'nowrap'}}>
              🎛️ Filters{activeFilters>0&&` (${activeFilters})`}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFilters>0&&(
            <div style={{display:'flex',gap:'6px',padding:'0 16px 10px',flexWrap:'wrap'}}>
              {filterCond!=='All'&&<span style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'20px',padding:'3px 10px',fontSize:'11px',color:'#a5b4fc'}}>📦 {filterCond} ×</span>}
              {(priceMin||priceMax)&&<span style={{background:'rgba(16,185,129,0.2)',border:'1px solid #10b981',borderRadius:'20px',padding:'3px 10px',fontSize:'11px',color:'#6ee7b7'}}>${priceMin||'0'}–${priceMax||'∞'} ×</span>}
              {maxDistance&&<span style={{background:'rgba(245,158,11,0.2)',border:'1px solid #f59e0b',borderRadius:'20px',padding:'3px 10px',fontSize:'11px',color:'#fcd34d'}}>Within {maxDistance} mi ×</span>}
            </div>
          )}

          {/* Recently Viewed strip */}
          {recentlyViewed.length>0&&!search&&(
            <div style={{padding:'0 16px 4px'}}>
              <div style={{fontSize:'11px',color:'#64748b',fontWeight:600,marginBottom:'8px',letterSpacing:'0.5px'}}>RECENTLY VIEWED</div>
              <div style={{display:'flex',gap:'8px',overflowX:'auto',scrollbarWidth:'none',paddingBottom:'8px'}}>
                {recentlyViewed.map(item=>(
                  <div key={item.id} onClick={()=>openItemModal(item)}
                    style={{flex:'0 0 80px',background:'#1e293b',borderRadius:'10px',overflow:'hidden',cursor:'pointer',border:'1px solid #334155'}}>
                    <div style={{height:'50px',background:item.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>{item.avatar}</div>
                    <div style={{padding:'4px 6px'}}>
                      <div style={{fontSize:'9px',color:'#94a3b8',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{item.title}</div>
                      <div style={{fontSize:'11px',color:'#10b981',fontWeight:700}}>${item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Item count */}
          <div style={{padding:'0 16px 8px'}}>
            <span style={{fontSize:'12px',color:'#64748b',fontWeight:600}}>{filtered.length} item{filtered.length!==1?'s':''}</span>
          </div>

          {/* Listings grid */}
          {isLoading ? (
            <div style={S.grid2}>{skeletonCards}</div>
          ) : filtered.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',color:'#64748b'}}>
              <div style={{fontSize:'48px',marginBottom:'12px'}}>🔍</div>
              <div style={{fontWeight:600,color:'#94a3b8'}}>No listings found</div>
              <div style={{fontSize:'13px',marginTop:'6px'}}>Try adjusting your filters or search</div>
            </div>
          ) : (
            <>
              <div style={S.grid2}>
                {filtered.slice(0,visibleCount).map(item=>(
                  <div key={item.id} style={S.card} onClick={()=>openItemModal(item)}
                    role="button" tabIndex={0} aria-label={`View ${item.title}, $${item.price}`}
                    onKeyDown={e=>e.key==='Enter'&&openItemModal(item)}>
                    <div style={S.cardImg(item.color)}>
                      <span>{item.avatar}</span>
                      {item.verified&&(
                        <span style={{position:'absolute',top:'6px',left:'6px',background:'#6366f1',color:'white',borderRadius:'6px',padding:'1px 5px',fontSize:'9px',fontWeight:700}}>✓</span>
                      )}
                      <button onClick={e=>{e.stopPropagation();toggleWishlist(item.id);}}
                        aria-label={wishlist.has(item.id)?'Remove from wishlist':'Save to wishlist'}
                        style={{position:'absolute',top:'6px',right:'6px',background:'rgba(0,0,0,0.5)',border:'none',borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {wishlist.has(item.id)?'❤️':'🤍'}
                      </button>
                      <span style={{position:'absolute',bottom:'4px',left:'6px',background:'rgba(0,0,0,0.7)',borderRadius:'6px',padding:'2px 5px',fontSize:'10px',color:'white',fontWeight:600}}>
                        {item.condition}
                      </span>
                    </div>
                    <div style={S.cardBody}>
                      <div style={{fontWeight:600,fontSize:'13px',color:'#f1f5f9',lineHeight:1.3,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',marginBottom:'4px'}}>
                        {item.title}
                      </div>
                      {(()=>{const reviews=localReviews[item.id];const avg=avgRating(reviews);if(!avg)return null;
                        return(<div style={{display:'flex',alignItems:'center',gap:'3px',marginBottom:'4px'}}>
                          <span style={{color:'#f59e0b',fontSize:'10px'}}>{'★'.repeat(Math.round(parseFloat(avg)))}</span>
                          <span style={{fontSize:'9px',color:'#94a3b8'}}>({reviews.length})</span>
                        </div>);
                      })()}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <span style={{color:'#10b981',fontWeight:800,fontSize:'16px'}}>${item.price}</span>
                        {item.likes>10&&<span style={{fontSize:'9px',color:'#64748b'}}>❤️ {item.likes}</span>}
                      </div>
                      <button onClick={e=>{e.stopPropagation();addToCart(item);}}
                        style={{width:'100%',marginTop:'6px',padding:'5px',borderRadius:'8px',background:'rgba(99,102,241,0.15)',border:'1px solid #6366f1',color:'#a5b4fc',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                        + Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length>visibleCount&&(
                <div style={{padding:'0 16px 16px'}}>
                  <button style={{...S.btn('secondary'),marginTop:0}} onClick={()=>setVisibleCount(v=>v+8)}>
                    Load More ({filtered.length-visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════ SELL TAB ══════════════ */}
      {isSellingTab&&(
        <div style={{padding:'16px'}}>
          <div style={{display:'flex',gap:'10px',marginBottom:'16px',overflowX:'auto'}}>
            {[
              ['💰','$'+orders.reduce((s,o)=>s+(o.total||0),0),'Revenue'],
              ['📦',activeListings,'Active'],
              ['⭐',mySellerRating,'Rating'],
              ['🛍️',String(orders.length),'Orders'],
            ].map(([icon,val,lbl])=>(
              <div key={lbl} style={S.statCard} onClick={lbl==='Orders'?()=>setViewingOrders(true):undefined}
                role={lbl==='Orders'?'button':undefined} tabIndex={lbl==='Orders'?0:undefined}
                onKeyDown={lbl==='Orders'?e=>e.key==='Enter'&&setViewingOrders(true):undefined}>
                <div style={{fontSize:'22px',marginBottom:'4px'}}>{icon}</div>
                <div style={{fontSize:'20px',fontWeight:800,color:'#f1f5f9'}}>{val}</div>
                <div style={{fontSize:'10px',color:'#64748b',fontWeight:600}}>{lbl}</div>
              </div>
            ))}
          </div>
          {viewingOrders&&isSellingTab&&(
            <div>
              <button onClick={()=>setViewingOrders(false)}
                style={{display:'flex',alignItems:'center',gap:'8px',background:'none',border:'none',color:'#6366f1',fontWeight:600,cursor:'pointer',marginBottom:'12px',fontSize:'14px'}}>
                ← Back to Seller Dashboard
              </button>
              <div style={{fontWeight:700,fontSize:'16px',color:'#f1f5f9',marginBottom:'12px'}}>Seller Order History</div>
              {orders.length===0?(
                <div style={{textAlign:'center',padding:'40px',color:'#64748b'}}>
                  <div style={{fontSize:'40px',marginBottom:'12px'}}>📭</div>
                  <div>No orders yet</div>
                </div>
              ):orders.map(o=>(
                <div key={o.id} style={{background:'#0f172a',borderRadius:'14px',padding:'14px',marginBottom:'10px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                    <span style={{fontWeight:700,fontSize:'12px',color:'#f1f5f9'}}>{o.id}</span>
                    <span style={{background:o.status==='Delivered'?'rgba(16,185,129,0.2)':'rgba(99,102,241,0.2)',
                      border:`1px solid ${o.status==='Delivered'?'#10b981':'#6366f1'}`,borderRadius:'8px',padding:'2px 8px',fontSize:'10px',fontWeight:700,
                      color:o.status==='Delivered'?'#6ee7b7':'#a5b4fc'}}>{o.status}</span>
                  </div>
                  {o.items.map((item,i)=>(
                    <div key={i} style={{fontSize:'12px',color:'#94a3b8',marginBottom:'3px'}}>
                      {item.title} ×{item.qty} — <span style={{color:'#10b981',fontWeight:600}}>${item.price*item.qty}</span>
                    </div>
                  ))}
                  <div style={{fontSize:'12px',color:'#64748b',marginTop:'6px'}}>📍 {o.shippingTo} · 🔑 {o.trackingCode}</div>
                  <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
                    <button onClick={()=>setCancelConfirm(o.id)} style={{flex:1,padding:'8px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',border:'1px solid #ef4444',color:'#fca5a5',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Cancel</button>
                    <button onClick={()=>setWriteReviewItem(o.items[0])} style={{flex:1,padding:'8px',borderRadius:'10px',background:'rgba(245,158,11,0.1)',border:'1px solid #f59e0b',color:'#fcd34d',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>✍️ Review</button>
                    <button onClick={()=>setOrderProblemModal(o)} style={{padding:'8px 12px',borderRadius:'10px',background:'rgba(99,102,241,0.1)',border:'1px solid #6366f1',color:'#a5b4fc',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>🆘</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!viewingOrders&&(
            <>
              {orders.length>0&&(
                <button onClick={()=>setViewingOrders(true)}
                  style={{...S.btn('secondary'),marginBottom:'12px',marginTop:0,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  📋 View My Order History ({orders.length})
                </button>
              )}
              <div onClick={()=>setCreateOpen(true)} role="button" tabIndex={0} aria-label="Create new listing" onKeyDown={e=>e.key==='Enter'&&setCreateOpen(true)}
                style={{border:'2px dashed #334155',borderRadius:'16px',padding:'20px',textAlign:'center',cursor:'pointer',marginBottom:'16px'}}>
                <div style={{fontSize:'32px',marginBottom:'8px'}}>+</div>
                <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'15px'}}>Create New Listing</div>
                <div style={{color:'#64748b',fontSize:'12px',marginTop:'4px'}}>List your item in 60 seconds</div>
              </div>
              {myListings.length>0&&(
                <>
                  <div style={{fontWeight:700,fontSize:'14px',color:'#94a3b8',marginBottom:'10px'}}>MY LISTINGS ({myListings.length})</div>
                  <div style={S.grid2}>
                    {myListings.map(listing=>(
                      <div key={listing.id} style={{...S.card,position:'relative'}} onClick={()=>openManageModal(listing)}>
                        {listing.sold&&(
                          <div style={{position:'absolute',inset:0,background:'rgba(15,23,42,0.6)',zIndex:2,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'16px'}}>
                            <span style={{background:'#10b981',color:'white',fontWeight:800,padding:'4px 10px',borderRadius:'8px',fontSize:'12px'}}>SOLD</span>
                          </div>
                        )}
                        {!listing.sold&&<div style={{position:'absolute',top:'6px',right:'6px',zIndex:1,background:'rgba(99,102,241,0.9)',borderRadius:'6px',padding:'2px 7px',fontSize:'10px',color:'white',fontWeight:700}}>✏️ Edit</div>}
                        <div style={{...S.cardImg(listing.color),height:'80px'}}>
                          <span style={{fontSize:'28px'}}>{listing.emoji||listing.avatar||'📦'}</span>
                        </div>
                        <div style={{padding:'8px'}}>
                          <div style={{fontWeight:600,fontSize:'12px',color:'#f1f5f9',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{listing.title}</div>
                          <div style={{color:'#10b981',fontWeight:700,fontSize:'13px',marginTop:'3px'}}>${listing.price}</div>
                          <div style={{color:'#64748b',fontSize:'10px'}}>👁️{listing.views} ❤️{listing.likes}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════ SAVED TAB ══════════════ */}
      {isSavedTab&&(
        <div style={{padding:'16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
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
          </div>
          <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
            <div style={{...S.search,flex:1,margin:0,padding:'8px 12px'}}>
              <span style={{fontSize:'14px',color:'#64748b'}}>🔍</span>
              <input value={wishlistSearch} onChange={e=>setWishlistSearch(e.target.value)}
                placeholder="Search saved items…" style={{flex:1,background:'none',border:'none',color:'#f1f5f9',fontSize:'13px',outline:'none'}}/>
            </div>
            <select value={wishlistSort} onChange={e=>setWishlistSort(e.target.value)}
              style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'10px',padding:'6px 8px',color:'#f1f5f9',fontSize:'12px'}}>
              <option value="default">Default</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
          {wishlistItems.length===0?(
            <div style={{textAlign:'center',padding:'60px 20px',color:'#64748b'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>🤍</div>
              <div style={{fontWeight:600,color:'#94a3b8'}}>No saved items</div>
              <div style={{fontSize:'13px',marginTop:'6px'}}>Tap the heart on any listing to save it here</div>
            </div>
          ):(
            <div style={S.grid2}>
              {wishlistItems.map(item=>(
                <div key={item.id} style={S.card} onClick={()=>openItemModal(item)} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&openItemModal(item)}>
                  <div style={S.cardImg(item.color)}>
                    <span>{item.avatar}</span>
                    <button onClick={e=>{e.stopPropagation();toggleWishlist(item.id);}} aria-label="Remove from wishlist"
                      style={{position:'absolute',top:'6px',right:'6px',background:'rgba(0,0,0,0.5)',border:'none',borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center'}}>❤️</button>
                  </div>
                  <div style={{padding:'10px'}}>
                    <div style={{fontWeight:600,fontSize:'12px',color:'#f1f5f9',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',marginBottom:'4px'}}>{item.title}</div>
                    <div style={{color:'#10b981',fontWeight:800,fontSize:'15px',marginBottom:'6px'}}>${item.price}</div>
                    <button onClick={e=>{e.stopPropagation();addToCart(item);}}
                      style={{width:'100%',padding:'6px',borderRadius:'8px',background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',color:'white',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ MESSAGES TAB ══════════════ */}
      {isMessagesTab&&(
        <div>
          {/* M13: Inbox search + filter tabs */}
          <div style={{...S.search,margin:'8px 16px 4px',padding:'8px 12px'}}>
            <span style={{fontSize:'14px',color:'#64748b'}}>🔍</span>
            <input value={inboxSearch} onChange={e=>setInboxSearch(e.target.value)}
              placeholder="Search conversations…"
              style={{flex:1,background:'none',border:'none',color:'#f1f5f9',fontSize:'13px',outline:'none'}}/>
          </div>
          <div style={{display:'flex',gap:'6px',padding:'4px 16px 10px',overflowX:'auto',scrollbarWidth:'none'}}>
            {[['all','All'],['unread','Unread'],['buyer','As Buyer'],['seller','As Seller']].map(([v,l])=>(
              <button key={v} onClick={()=>setInboxFilter(v)}
                style={{padding:'5px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:inboxFilter===v?700:500,
                        background:inboxFilter===v?'#6366f1':'#1e293b',color:inboxFilter===v?'white':'#94a3b8',
                        border:'none',cursor:'pointer',whiteSpace:'nowrap'}}>
                {l}
              </button>
            ))}
          </div>
          {displayedChats.length===0?(
            <div style={{textAlign:'center',padding:'60px 20px',color:'#64748b'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>💬</div>
              <div style={{fontWeight:600,color:'#94a3b8'}}>No messages yet</div>
            </div>
          ):displayedChats.map(chat=>(
            <div key={chat.id} style={S.msgItem} onClick={()=>openChat(chat)} role="button" tabIndex={0}
              aria-label={`Chat with ${chat.name} about ${chat.item}`} onKeyDown={e=>e.key==='Enter'&&openChat(chat)}>
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
          ))}
        </div>
      )}

      {/* ══════════════ ORDERS TAB (M17: Purchases/Sales split) ══════════════ */}
      {isOrdersTab&&(
        <div style={{padding:'16px'}}>
          {/* M17: Purchases / Sales toggle */}
          <div style={{display:'flex',gap:0,marginBottom:'16px',background:'#1e293b',borderRadius:'12px',padding:'4px'}}>
            {[['purchases','🛍️ Purchases'],['sales','💰 Sales']].map(([v,l])=>(
              <button key={v} onClick={()=>setOrdersView(v)}
                style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',cursor:'pointer',fontWeight:700,fontSize:'13px',
                        background:ordersView===v?'linear-gradient(135deg,#6366f1,#ec4899)':'transparent',
                        color:ordersView===v?'white':'#64748b'}}>
                {l}
              </button>
            ))}
          </div>
          {ordersView==='sales'?(
            <div style={{textAlign:'center',padding:'40px',color:'#64748b'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>💰</div>
              <div style={{fontWeight:600,color:'#94a3b8'}}>Sales Orders</div>
              <div style={{fontSize:'13px',marginTop:'6px'}}>When buyers purchase your listings, orders appear here.</div>
              <div style={{fontSize:'13px',color:'#6366f1',marginTop:'8px'}}>
                You have {myListings.filter(l=>l.sold).length} sold listing{myListings.filter(l=>l.sold).length!==1?'s':''}
              </div>
            </div>
          ):orders.length===0?(
            <div style={{textAlign:'center',padding:'60px 20px',color:'#64748b'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>📭</div>
              <div style={{fontWeight:600,color:'#94a3b8'}}>No orders yet</div>
              <div style={{fontSize:'13px',marginTop:'6px'}}>Browse listings and place your first order</div>
              <button onClick={()=>setTab('browse')} style={{...S.btn(),marginTop:'16px',width:'auto',padding:'10px 24px'}}>Browse Listings</button>
            </div>
          ):orders.map(o=>(
            <div key={o.id} style={{background:'#0f172a',borderRadius:'14px',padding:'14px',marginBottom:'12px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                <span style={{fontWeight:700,fontSize:'12px',color:'#f1f5f9'}}>{o.id}</span>
                <span style={{background:o.status==='Delivered'?'rgba(16,185,129,0.2)':o.status==='Shipped'?'rgba(59,130,246,0.2)':'rgba(99,102,241,0.2)',
                  border:`1px solid ${o.status==='Delivered'?'#10b981':o.status==='Shipped'?'#3b82f6':'#6366f1'}`,
                  borderRadius:'8px',padding:'2px 8px',fontSize:'10px',fontWeight:700,
                  color:o.status==='Delivered'?'#6ee7b7':o.status==='Shipped'?'#93c5fd':'#a5b4fc'}}>
                  {o.status==='Confirmed'?'✅ Confirmed':o.status==='Packed'?'📦 Packed':o.status==='Shipped'?'🚚 Shipped':'✔️ Delivered'}
                </span>
              </div>
              {/* Status timeline */}
              <div style={{display:'flex',alignItems:'center',gap:'4px',marginBottom:'10px'}}>
                {ORDER_STATUSES.map((s,i)=>{
                  const curIdx=ORDER_STATUSES.indexOf(o.status); const done=i<=curIdx;
                  return(
                    <React.Fragment key={s}>
                      <div style={{width:'16px',height:'16px',borderRadius:'50%',background:done?'#6366f1':'#334155',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',color:'white',flexShrink:0}}>
                        {done?'✓':''}
                      </div>
                      {i<ORDER_STATUSES.length-1&&<div style={{flex:1,height:'2px',background:done&&i<curIdx?'#6366f1':'#334155'}}/>}
                    </React.Fragment>
                  );
                })}
              </div>
              {o.items.map((item,i)=>(
                <div key={i} style={{fontSize:'12px',color:'#94a3b8',marginBottom:'3px'}}>
                  {item.title} ×{item.qty} — <span style={{color:'#10b981',fontWeight:600}}>${item.price*item.qty}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px',fontSize:'12px',color:'#64748b'}}>
                <span>📍 {o.shippingTo}</span>
                <span style={{fontWeight:700,color:'#f1f5f9'}}>Total: ${o.total}</span>
              </div>
              {o.deliveryEst&&<div style={{fontSize:'11px',color:'#6366f1',marginTop:'4px'}}>🗓️ Est. delivery: {o.deliveryEst}</div>}
              {/* BE-09: Tracking link */}
              <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>
                🔑 <a href={getTrackingLink(o.trackingCode)} target="_blank" rel="noopener noreferrer"
                  style={{color:'#6366f1',textDecoration:'none'}}>{o.trackingCode}</a> · {o.placedAt}
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
                {o.status!=='Delivered'&&(
                  <button onClick={()=>setCancelConfirm(o.id)} style={{flex:1,padding:'8px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',border:'1px solid #ef4444',color:'#fca5a5',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Cancel</button>
                )}
                <button onClick={()=>setWriteReviewItem(o.items[0])} style={{flex:1,padding:'8px',borderRadius:'10px',background:'rgba(245,158,11,0.1)',border:'1px solid #f59e0b',color:'#fcd34d',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>✍️ Review</button>
                <button onClick={()=>setOrderProblemModal(o)} style={{flex:1,padding:'8px',borderRadius:'10px',background:'rgba(99,102,241,0.1)',border:'1px solid #6366f1',color:'#a5b4fc',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>🆘 Problem</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════ FILTER SHEET ════════ */}
      {filterOpen&&(
        <div style={S.modal} onClick={()=>setFilterOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>🎛️ Filters</span>
              <button style={S.closeBtn} onClick={()=>setFilterOpen(false)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {/* Condition */}
              <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'10px'}}>CONDITION</div>
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
              {/* M9: Price range */}
              <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',margin:'16px 0 8px'}}>PRICE RANGE</div>
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <input type="number" placeholder="Min $" value={priceMin} onChange={e=>setPriceMin(e.target.value)}
                  style={{...S.input,marginBottom:0,flex:1}}/>
                <span style={{color:'#64748b',fontSize:'16px'}}>–</span>
                <input type="number" placeholder="Max $" value={priceMax} onChange={e=>setPriceMax(e.target.value)}
                  style={{...S.input,marginBottom:0,flex:1}}/>
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
              {/* M7: Distance */}
              <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',margin:'16px 0 8px'}}>MAX DISTANCE</div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {[5,10,25,50].map(d=>(
                  <button key={d} onClick={()=>setMaxDistance(String(d))}
                    style={{padding:'5px 12px',borderRadius:'20px',fontSize:'11px',
                            background:maxDistance===String(d)?'#6366f1':'#1e293b',
                            color:maxDistance===String(d)?'white':'#94a3b8',
                            border:'none',cursor:'pointer',fontWeight:600}}>
                    Within {d} mi
                  </button>
                ))}
                <button onClick={()=>setMaxDistance('')}
                  style={{padding:'5px 12px',borderRadius:'20px',fontSize:'11px',background:'#1e293b',color:'#94a3b8',border:'none',cursor:'pointer'}}>
                  Any
                </button>
              </div>
              <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
                <button style={{...S.btn('secondary'),flex:'0 0 auto',width:'auto',padding:'12px 20px'}}
                  onClick={()=>{setFilterCond('All');setPriceMax('');setPriceMin('');setMaxDistance('');setSortBy('newest');}}>
                  Clear All
                </button>
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
                    {/* M1: Photo gallery carousel */}
            {(()=>{
              const photos=LISTING_PHOTOS[itemModal.id];
              if (!photos||!photos.length){
                return(
                  <div style={{height:'200px',background:itemModal.color,display:'flex',alignItems:'center',
                    justifyContent:'center',fontSize:'80px',borderRadius:'24px 24px 0 0',position:'relative'}}>
                    {itemModal.avatar}
                    <button onClick={()=>{setItemModal(null);setReviewsExpanded(false);setPhotoIdx(0);}} aria-label="Close"
                      style={{position:'absolute',top:'12px',right:'12px',background:'rgba(0,0,0,0.5)',border:'none',
                        borderRadius:'50%',width:'32px',height:'32px',color:'white',cursor:'pointer',fontSize:'16px',
                        display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                  </div>
                );
              }
              const idx=Math.min(photoIdx,photos.length-1);
              return(
                <div style={{height:'200px',borderRadius:'24px 24px 0 0',overflow:'hidden',position:'relative'}}>
                  <img src={photos[idx]} alt={`${itemModal.title} photo ${idx+1}`}
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                    onError={e=>{e.target.style.display='none';}}/>
                  <button onClick={()=>{setItemModal(null);setReviewsExpanded(false);setPhotoIdx(0);}} aria-label="Close"
                    style={{position:'absolute',top:'12px',right:'12px',background:'rgba(0,0,0,0.5)',border:'none',
                      borderRadius:'50%',width:'32px',height:'32px',color:'white',cursor:'pointer',fontSize:'16px',
                      display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                  {photos.length>1&&(
                    <>
                      <button onClick={()=>setPhotoIdx(i=>Math.max(0,i-1))} disabled={idx===0}
                        style={{position:'absolute',left:'8px',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.5)',
                          border:'none',borderRadius:'50%',width:'30px',height:'30px',color:'white',cursor:'pointer',
                          fontSize:'14px',opacity:idx===0?0.3:1}}>‹</button>
                      <button onClick={()=>setPhotoIdx(i=>Math.min(photos.length-1,i+1))} disabled={idx===photos.length-1}
                        style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.5)',
                          border:'none',borderRadius:'50%',width:'30px',height:'30px',color:'white',cursor:'pointer',
                          fontSize:'14px',opacity:idx===photos.length-1?0.3:1}}>›</button>
                      <div style={{position:'absolute',bottom:'8px',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'5px'}}>
                        {photos.map((_,i)=>(
                          <div key={i} onClick={()=>setPhotoIdx(i)}
                            style={{width:i===idx?'18px':'6px',height:'6px',borderRadius:'3px',
                              background:i===idx?'white':'rgba(255,255,255,0.5)',cursor:'pointer',transition:'width 0.2s'}}/>
                        ))}
                      </div>
                      <div style={{position:'absolute',top:'8px',left:'12px',background:'rgba(0,0,0,0.5)',borderRadius:'8px',
                        padding:'2px 8px',fontSize:'11px',color:'white'}}>{idx+1}/{photos.length}</div>
                    </>
                  )}
                </div>
              );
            })()}
            <div style={{padding:'20px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'6px'}}>
                <h2 style={{fontSize:'18px',fontWeight:800,color:'#f1f5f9',margin:0,flex:1,paddingRight:'12px'}}>{itemModal.title}</h2>
                <span style={{color:'#10b981',fontWeight:800,fontSize:'22px',flexShrink:0}}>${itemModal.price}</span>
              </div>
              {(()=>{const reviews=localReviews[itemModal.id];const avg=avgRating(reviews);if(!avg)return null;
                return(<div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'10px'}}>
                  <span style={{color:'#f59e0b',fontSize:'14px'}}>{'★'.repeat(Math.round(parseFloat(avg)))}{'☆'.repeat(5-Math.round(parseFloat(avg)))}</span>
                  <span style={{fontWeight:700,fontSize:'13px',color:'#f1f5f9'}}>{avg}</span>
                  <span style={{color:'#64748b',fontSize:'12px'}}>({reviews.length} reviews)</span>
                </div>);
              })()}
              <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
                <span title={CONDITION_DEFS[itemModal.condition]||''} style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8',cursor:'help'}}>
                  📦 {itemModal.condition}
                </span>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>📍 {itemModal.location}</span>
                <span style={{background:'#1e293b',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#94a3b8'}}>🏷️ {itemModal.category}</span>
                {itemModal.likes>30&&<span style={{background:'rgba(239,68,68,0.2)',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#fca5a5'}}>🔥 Popular</span>}
              </div>
              {itemModal.likes>5&&(
                <div style={{fontSize:'12px',color:'#64748b',marginBottom:'10px'}}>
                  ❤️ <strong style={{color:'#94a3b8'}}>{itemModal.likes}</strong> people have saved this item
                </div>
              )}
              <p style={{color:'#94a3b8',fontSize:'14px',lineHeight:1.6,marginBottom:'14px'}}>{itemModal.desc}</p>

              {/* M6: Shipping options (BE-08) */}
              <div style={{background:'#0f172a',borderRadius:'12px',padding:'12px',marginBottom:'14px'}}>
                <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'8px'}}>📦 SHIPPING OPTIONS</div>
                {itemShipping.map((s,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:i<itemShipping.length-1?'6px':'0'}}>
                    <span style={{fontSize:'13px',color:'#f1f5f9'}}>{s.label}</span>
                    <span style={{fontSize:'13px',color:s.price==='FREE'?'#6ee7b7':'#10b981',fontWeight:700}}>{s.price}</span>
                  </div>
                ))}
              </div>

              {/* M27: Seller response time */}
              {itemResponseTime&&(
                <div style={{fontSize:'12px',color:'#6366f1',marginBottom:'10px'}}>⚡ Responds in {itemResponseTime}</div>
              )}
              <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
                <button onClick={()=>{
                  const url=getListingShareURL(itemModal.id,itemModal.title);
                  if(navigator.share){navigator.share({title:itemModal.title,url}).catch(()=>{});}
                  else{navigator.clipboard?.writeText(url).then(()=>showToast('🔗 Link copied!'));}
                }} style={{flex:1,background:'#1e293b',border:'1px solid #334155',borderRadius:'12px',padding:'10px',color:'#94a3b8',fontSize:'13px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                  🔗 Share
                </button>
                {/* M29: QR Code */}
                <button onClick={()=>setQrModal(itemModal)}
                  style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'12px',padding:'10px 12px',color:'#94a3b8',fontSize:'13px',cursor:'pointer'}}>📱</button>
                {/* M23: Price Alert */}
                <button onClick={()=>setPriceAlertModal(itemModal)}
                  style={{background:'rgba(245,158,11,0.15)',border:'1px solid #f59e0b',borderRadius:'12px',padding:'10px 12px',color:'#fcd34d',fontSize:'13px',cursor:'pointer'}}>🔔</button>
                {orders.some(o=>o.items.some(i=>i.id===itemModal.id)) ? (
                  <button onClick={()=>setWriteReviewItem(itemModal)}
                    style={{flex:1,background:'#1e293b',border:'1px solid #334155',borderRadius:'12px',padding:'10px',color:'#94a3b8',fontSize:'13px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                    ✍️ Review
                  </button>
                ) : (
                  <button disabled title="Purchase this item first to leave a review"
                    style={{flex:1,background:'#0f172a',border:'1px solid #1e293b',borderRadius:'12px',padding:'10px',color:'#475569',fontSize:'13px',fontWeight:600,cursor:'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                    🔒 Review (Buy First)
                  </button>
                )}
                <button onClick={()=>setReportModal(itemModal)}
                  style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'12px',padding:'10px 14px',color:'#94a3b8',fontSize:'13px',cursor:'pointer'}}>🚩</button>
              </div>

              {/* Seller info */}
              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',background:'#0f172a',borderRadius:'12px',marginBottom:'16px',cursor:'pointer'}}
                onClick={()=>openSellerProfile(itemModal.seller)} role="button" tabIndex={0}
                onKeyDown={e=>e.key==='Enter'&&openSellerProfile(itemModal.seller)}>
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
                <button onClick={e=>{e.stopPropagation();setSafeSpotModal(true);}}
                  title="Safe meeting spots"
                  style={{background:'#1e293b',border:'none',borderRadius:'10px',padding:'8px 10px',color:'#94a3b8',fontSize:'15px',cursor:'pointer'}}>
                  📍
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

              {/* M25: You may also like */}
              {(()=>{
                const similar=browseListings.filter(l=>l.id!==itemModal.id&&l.category===itemModal.category&&!l.sold).slice(0,4);
                if (!similar.length) return null;
                return(
                  <div style={{marginBottom:'16px'}}>
                    <div style={{fontWeight:700,fontSize:'13px',color:'#94a3b8',marginBottom:'10px'}}>YOU MAY ALSO LIKE</div>
                    <div style={{display:'flex',gap:'8px',overflowX:'auto',scrollbarWidth:'none'}}>
                      {similar.map(item=>(
                        <div key={item.id} onClick={()=>{setItemModal(null);setReviewsExpanded(false);setPhotoIdx(0);setTimeout(()=>openItemModal(item),50);}}
                          style={{flex:'0 0 100px',background:'#0f172a',borderRadius:'10px',overflow:'hidden',cursor:'pointer',border:'1px solid #334155'}}>
                          <div style={{height:'60px',background:item.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>{item.avatar}</div>
                          <div style={{padding:'5px 7px'}}>
                            <div style={{fontSize:'10px',color:'#94a3b8',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{item.title}</div>
                            <div style={{fontSize:'12px',color:'#10b981',fontWeight:700}}>${item.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Reviews */}
              {localReviews[itemModal.id]&&(
                <div>
                  <button onClick={()=>setReviewsExpanded(v=>!v)} aria-expanded={reviewsExpanded}
                    style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:'12px',padding:'12px 16px',
                            color:'#f1f5f9',fontSize:'13px',fontWeight:600,cursor:'pointer',display:'flex',
                            alignItems:'center',justifyContent:'space-between',marginBottom:reviewsExpanded?'10px':'0'}}>
                    <span>⭐ Reviews ({localReviews[itemModal.id].length})</span>
                    <span style={{color:'#6366f1'}}>{reviewsExpanded?'▲ Hide':'▼ Show'}</span>
                  </button>
                  {reviewsExpanded&&(
                    <>
                      <RatingHistogram reviews={localReviews[itemModal.id]}/>
                      {localReviews[itemModal.id].map((r,i)=>(
                        <div key={i} style={{background:'#0f172a',borderRadius:'12px',padding:'12px',marginBottom:'8px'}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                            <span style={{fontWeight:600,fontSize:'13px',color:'#f1f5f9'}}>{r.reviewer}</span>
                            <span style={{color:'#64748b',fontSize:'11px'}}>{r.time}</span>
                          </div>
                          <div style={{color:'#f59e0b',fontSize:'13px',marginBottom:'6px'}}>
                            {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                          </div>
                          <div style={{color:'#94a3b8',fontSize:'13px',lineHeight:1.4}}>{r.text}</div>
                        </div>
                      ))}
                    </>
                  )}
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
              <div style={{color:'#64748b',fontSize:'12px',marginBottom:'4px'}}>
                ⭐ {sellerModal.rating} · {sellerModal.sales} sales · Member since {sellerModal.memberSince}
              </div>
              <div style={{color:'#64748b',fontSize:'12px',marginBottom:'10px'}}>
                ⚡ Responds in {sellerModal.responseTime||'—'} · 💬 {sellerModal.responseRate||'—'}% response rate
              </div>
              <p style={{color:'#94a3b8',fontSize:'13px',lineHeight:1.5,marginBottom:'16px'}}>{sellerModal.bio}</p>
              {sellerModal.listings&&sellerModal.listings.length>0&&(
                <>
                  <div style={{fontWeight:600,fontSize:'13px',color:'#94a3b8',marginBottom:'10px'}}>ACTIVE LISTINGS ({sellerModal.listings.length})</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                    {sellerModal.listings.slice(0,4).map(item=>(
                      <div key={item.id} style={S.card} onClick={()=>{setSellerModal(null);openItemModal(item);}}>
                        <div style={{...S.cardImg(item.color),height:'70px'}}><span style={{fontSize:'28px'}}>{item.avatar}</span></div>
                        <div style={{padding:'8px'}}>
                          <div style={{fontWeight:600,color:'#f1f5f9',fontSize:'11px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.title}</div>
                          <div style={{color:'#10b981',fontWeight:700,fontSize:'12px',marginTop:'3px'}}>${item.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {sellerModal.listings.length>4&&(
                    <button onClick={()=>{setSellerModal(null);setSearch(sellerModal.name);setTab('browse');}}
                      style={{...S.btn('secondary'),marginTop:'10px',fontSize:'13px'}}>
                      View All {sellerModal.listings.length} Listings →
                    </button>
                  )}
                </>
              )}
              <button onClick={()=>openMessageFromSeller(sellerModal)}
                style={{...S.btn(),marginTop:'12px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                💬 Message {sellerModal.name.split(' ')[0]}
              </button>
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
              <button style={S.closeBtn} onClick={()=>setCartOpen(false)}>✕</button>
            </div>
            {cart.length===0?(
              <div style={{textAlign:'center',padding:'40px',color:'#64748b'}}>
                <div style={{fontSize:'40px',marginBottom:'12px'}}>🛒</div>
                <div style={{fontWeight:600,color:'#f1f5f9'}}>Your cart is empty</div>
              </div>
            ):(
              <>
                {cart.map(c=>(
                  <div key={c.listing.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 20px',borderBottom:'1px solid #1e293b'}}>
                    <div style={{width:'48px',height:'48px',borderRadius:'12px',background:c.listing.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',flexShrink:0}}>{c.listing.avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:'13px',color:'#f1f5f9',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{c.listing.title}</div>
                      <div style={{color:'#10b981',fontWeight:700,fontSize:'14px'}}>${c.listing.price*c.qty}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'6px',flexShrink:0}}>
                      <button onClick={()=>updateQty(c.listing.id,-1)} style={{background:'#334155',border:'none',borderRadius:'6px',width:'26px',height:'26px',color:'#f1f5f9',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                      <span style={{fontSize:'14px',fontWeight:700,color:'#f1f5f9',minWidth:'16px',textAlign:'center'}}>{c.qty}</span>
                      <button onClick={()=>updateQty(c.listing.id,1)} style={{background:'#334155',border:'none',borderRadius:'6px',width:'26px',height:'26px',color:'#f1f5f9',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                      <button onClick={()=>removeFromCart(c.listing.id)} style={{background:'#1e293b',border:'1px solid #475569',borderRadius:'6px',width:'26px',height:'26px',color:'#94a3b8',cursor:'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',marginLeft:'4px'}}>×</button>
                    </div>
                  </div>
                ))}
                {bundleDiscount&&bundleDiscount.savings>0&&(
                  <div style={{margin:'0 20px 4px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.4)',borderRadius:'10px',padding:'8px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:'#fcd34d',fontSize:'12px',fontWeight:700}}>🎁 Bundle Deal ({bundleDiscount.pct}% off same seller)</span>
                    <span style={{color:'#fcd34d',fontWeight:800,fontSize:'13px'}}>−${bundleDiscount.savings}</span>
                  </div>
                )}
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
              <button style={S.closeBtn} onClick={()=>setCheckoutOpen(false)}>✕</button>
            </div>
            {checkoutStep==='shipping'?(
              <div style={{padding:'20px'}}>
                <div style={{fontWeight:600,fontSize:'13px',color:'#94a3b8',marginBottom:'12px'}}>SHIPPING ADDRESS</div>
                <input style={shippingErrors.name?S.inputErr:S.input} placeholder="Full Name *"
                  value={shipping.name} onChange={e=>{ setShipping(s=>({...s,name:e.target.value})); setShippingErrors(er=>({...er,name:''})); }}/>
                {shippingErrors.name&&<div style={{fontSize:'11px',color:'#ef4444',marginBottom:'8px'}}>⚠️ {shippingErrors.name}</div>}
                <input style={shippingErrors.street?S.inputErr:S.input} placeholder="Street Address *"
                  value={shipping.street} onChange={e=>{ setShipping(s=>({...s,street:e.target.value})); setShippingErrors(er=>({...er,street:''})); }}/>
                {shippingErrors.street&&<div style={{fontSize:'11px',color:'#ef4444',marginBottom:'8px'}}>⚠️ {shippingErrors.street}</div>}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                  <div>
                    <input style={{...(shippingErrors.city?S.inputErr:S.input),marginBottom:0}} placeholder="City *"
                      value={shipping.city} onChange={e=>{ setShipping(s=>({...s,city:e.target.value})); setShippingErrors(er=>({...er,city:''})); }}/>
                    {shippingErrors.city&&<div style={{fontSize:'11px',color:'#ef4444',marginTop:'2px'}}>⚠️ {shippingErrors.city}</div>}
                  </div>
                  <input style={{...S.input,marginBottom:0}} placeholder="State" value={shipping.state} onChange={e=>setShipping(s=>({...s,state:e.target.value}))}/>
                </div>
                <input style={S.input} placeholder="ZIP Code" value={shipping.zip} onChange={e=>setShipping(s=>({...s,zip:e.target.value}))}/>
                <div onClick={()=>{ setShipping({name:'Local Pickup',street:'',city:'Pickup',state:'',zip:''}); setShippingErrors({}); }}
                  style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px',borderRadius:'12px',border:'1px solid #334155',cursor:'pointer',marginBottom:'10px'}}>
                  <span style={{fontSize:'20px'}}>📍</span>
                  <span style={{color:'#94a3b8',fontSize:'13px'}}>Or select <strong style={{color:'#f1f5f9'}}>Local Pickup</strong> instead</span>
                </div>
                <div style={{background:'#0f172a',borderRadius:'12px',padding:'12px',marginBottom:'10px'}}>
                  <label style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',marginBottom:isGift?'10px':'0'}}>
                    <input type="checkbox" checked={isGift} onChange={e=>setIsGift(e.target.checked)} style={{width:'16px',height:'16px',accentColor:'#6366f1'}}/>
                    <span style={{color:'#f1f5f9',fontSize:'13px',fontWeight:600}}>🎁 This is a gift</span>
                  </label>
                  {isGift&&(
                    <textarea value={giftMsg} onChange={e=>setGiftMsg(e.target.value)}
                      placeholder="Add a gift message (optional)…"
                      style={{...S.input,marginBottom:0,minHeight:'60px',resize:'vertical',fontFamily:'inherit',marginTop:'8px'}}/>
                  )}
                </div>
                <div style={{marginBottom:'10px'}}>
                  <textarea value={specialInstructions} onChange={e=>setSpecialInstructions(e.target.value)}
                    placeholder="Special instructions to seller (optional)…"
                    style={{...S.input,marginBottom:0,minHeight:'50px',resize:'vertical',fontFamily:'inherit'}}/>
                  <div style={{fontSize:'10px',color:'#64748b',textAlign:'right',marginTop:'2px'}}>{specialInstructions.length}/200</div>
                </div>
                <button style={S.btn()} onClick={continueToPayment}>Continue to Payment →</button>
              </div>
            ):(
              <div style={{padding:'20px'}}>
                <div style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',borderRadius:'16px',padding:'20px',textAlign:'center',marginBottom:'16px'}}>
                  <div style={{fontSize:'12px',opacity:0.9,marginBottom:'4px'}}>Total Amount</div>
                  {promoApplied&&<div style={{fontSize:'13px',opacity:0.8,textDecoration:'line-through'}}>Was ${cartTotal}</div>}
                  <div style={{fontSize:'38px',fontWeight:800,color:'white'}}>${finalTotal}</div>
                  <div style={{fontSize:'11px',opacity:0.8,marginTop:'2px'}}>{cart.length} item{cart.length!==1?'s':''} · To {shipping.city||'Pickup'}</div>
                  <div style={{fontSize:'11px',opacity:0.9,marginTop:'4px'}}>🗓️ Est. delivery: {deliveryEstimate()}</div>
                </div>
                {!promoApplied?(
                  <div style={{marginBottom:'14px'}}>
                    <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'8px'}}>PROMO CODE</div>
                    <div style={{display:'flex',gap:'8px'}}>
                      <input value={promoCode} onChange={e=>setPromoCode(e.target.value)} placeholder="Enter code"
                        style={{...S.input,marginBottom:0,flex:1,fontSize:'13px'}}/>
                      <button onClick={applyPromo} style={{background:'#6366f1',border:'none',borderRadius:'12px',padding:'0 16px',color:'white',fontWeight:700,fontSize:'13px',cursor:'pointer',flexShrink:0}}>
                        Apply
                      </button>
                    </div>
                    {promoMsg&&<div style={{fontSize:'12px',color:promoMsg.startsWith('✅')?'#10b981':'#ef4444',marginTop:'6px'}}>{promoMsg}</div>}
                  </div>
                ):(
                  <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'10px',padding:'10px 14px',marginBottom:'14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:'#10b981',fontSize:'13px',fontWeight:600}}>🏷️ {promoCode.toUpperCase()} — −${promoDiscount}</span>
                    <button onClick={()=>{setPromoApplied(false);setPromoCode('');setPromoDiscount(0);setPromoMsg('');}}
                      style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:'14px'}}>✕</button>
                  </div>
                )}
                <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'12px',padding:'12px 16px',marginBottom:'14px',display:'flex',alignItems:'center',gap:'10px'}}>
                  <span style={{fontSize:'24px'}}>🛡️</span>
                  <div>
                    <div style={{fontWeight:700,color:'#10b981',fontSize:'13px'}}>Buyer Protection Included</div>
                    <div style={{color:'#6ee7b7',fontSize:'11px',marginTop:'2px'}}>Full refund if item not as described or doesn't arrive within 7 days.</div>
                  </div>
                </div>
                <div style={{marginBottom:'14px'}}>
                  <div style={{fontWeight:600,fontSize:'13px',color:'#94a3b8',marginBottom:'8px'}}>PAYMENT METHOD</div>
                  {[['card','💳 Credit / Debit Card'],['paypal','🅿️ PayPal'],['crypto','₿ Crypto'],['cash','💵 Cash on Pickup']].map(([val,lbl])=>(
                    <div key={val} onClick={()=>setPayMethod(val)}
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
                    <input style={S.input} placeholder="Cardholder Name *" value={cardName} onChange={e=>setCardName(e.target.value)}/>
                    <input style={S.input} placeholder="Card Number *" value={cardNumber} onChange={e=>setCardNumber(e.target.value.replace(/\D/g,'').slice(0,16))} inputMode="numeric" maxLength={16}/>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                      <input style={{...S.input,marginBottom:0}} placeholder="MM/YY *" value={cardExpiry} onChange={e=>setCardExpiry(e.target.value)}/>
                      <input style={{...S.input,marginBottom:0}} placeholder="CVV *" value={cardCVV} onChange={e=>setCardCVV(e.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric"/>
                    </div>
                    <div style={{height:'10px'}}/>
                  </>
                )}
                <div style={{fontSize:'11px',color:'#64748b',textAlign:'center',marginBottom:'10px'}}>
                  By placing this order you agree to our <span style={{color:'#6366f1'}}>Terms of Service</span> and <span style={{color:'#6366f1'}}>Privacy Policy</span>.
                </div>
                <div style={{display:'flex',gap:'10px'}}>
                  <button style={{...S.btn('secondary'),flex:'0 0 auto',width:'auto',padding:'14px 18px'}} onClick={()=>setCheckoutStep('shipping')}>← Back</button>
                  <button style={{...S.btn(),flex:1,marginTop:'8px',opacity:paymentProcessing?0.7:1}} onClick={placeOrder} disabled={paymentProcessing}>
                    {paymentProcessing?'Processing…':'🔒 Place Order — $'+finalTotal}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ M11: RECEIPT MODAL ════════ */}
      {receiptOrder&&(
        <div style={S.modal} onClick={()=>setReceiptOrder(null)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()} role="dialog">
            <div style={{textAlign:'center',padding:'30px 20px'}}>
              <div style={{fontSize:'60px',marginBottom:'12px'}}>🎉</div>
              <div style={{fontWeight:800,fontSize:'20px',color:'#f1f5f9',marginBottom:'4px'}}>Order Confirmed!</div>
              <div style={{color:'#64748b',fontSize:'13px',marginBottom:'20px'}}>Your order {receiptOrder.id} has been placed</div>
              <div style={{background:'#0f172a',borderRadius:'14px',padding:'16px',textAlign:'left',marginBottom:'16px'}}>
                {receiptOrder.items.map((item,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'6px',fontSize:'13px'}}>
                    <span style={{color:'#94a3b8'}}>{item.title} ×{item.qty}</span>
                    <span style={{color:'#10b981',fontWeight:700}}>${item.price*item.qty}</span>
                  </div>
                ))}
                <div style={{borderTop:'1px solid #334155',paddingTop:'8px',marginTop:'8px',display:'flex',justifyContent:'space-between',fontWeight:700}}>
                  <span style={{color:'#f1f5f9'}}>Total</span>
                  <span style={{color:'#10b981',fontSize:'18px'}}>${receiptOrder.total}</span>
                </div>
              </div>
              <div style={{fontSize:'12px',color:'#6366f1',marginBottom:'6px'}}>🗓️ Est. delivery: {receiptOrder.deliveryEst}</div>
              <div style={{fontSize:'11px',color:'#64748b',marginBottom:'20px'}}>🔑 Tracking: {receiptOrder.trackingCode}</div>
              <button style={S.btn()} onClick={()=>{setReceiptOrder(null);setTab('orders');}}>📦 Track Order</button>
              <button style={{...S.btn('secondary')}} onClick={()=>setReceiptOrder(null)}>Continue Shopping</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ CREATE LISTING MODAL ════════ */}
      {createOpen&&(
        <div style={S.modal} onClick={()=>setCreateOpen(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>📦 Create Listing</span>
              <button style={S.closeBtn} onClick={()=>setCreateOpen(false)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <input type="file" ref={fileInputRef} accept="image/*" multiple style={{display:'none'}} onChange={handlePhotoSelect}/>
              <div onClick={()=>!photoUploading&&fileInputRef.current?.click()}
                style={{height:'120px',background:'#0f172a',borderRadius:'14px',
                        border:`2px dashed ${photoPreviews.length?'#6366f1':photoUploading?'#f59e0b':'#334155'}`,
                        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                        marginBottom:'10px',cursor:photoUploading?'default':'pointer',overflow:'hidden',position:'relative'}}>
                {photoPreviews.length>0?(
                  <div style={{display:'flex',gap:'4px',width:'100%',height:'100%',overflow:'hidden'}}>
                    {photoPreviews.slice(0,3).map((p,i)=>(
                      <img key={i} src={p} alt={`preview ${i+1}`} style={{flex:1,height:'100%',objectFit:'cover'}}/>
                    ))}
                    {photoPreviews.length>3&&(
                      <div style={{position:'absolute',bottom:'6px',right:'6px',background:'rgba(0,0,0,0.7)',borderRadius:'6px',padding:'2px 6px',fontSize:'11px',color:'white'}}>
                        +{photoPreviews.length-3} more
                      </div>
                    )}
                  </div>
                ):photoUploading?(
                  <>
                    <div style={{fontSize:'28px',marginBottom:'8px'}}>📤</div>
                    <div style={{fontSize:'12px',color:'#f59e0b',marginBottom:'6px'}}>Uploading... {Math.round(photoProgress)}%</div>
                    <div style={{width:'140px',height:'6px',background:'#334155',borderRadius:'3px',overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${photoProgress}%`,background:'linear-gradient(90deg,#6366f1,#ec4899)',borderRadius:'3px',transition:'width 0.15s'}}/>
                    </div>
                  </>
                ):(
                  <>
                    <div style={{fontSize:'32px',marginBottom:'6px'}}>📷</div>
                    <div style={{fontSize:'13px',color:'#64748b'}}>Tap to add photos</div>
                    <div style={{fontSize:'11px',color:'#475569',marginTop:'3px'}}>Select multiple · JPG, PNG up to 10MB each</div>
                  </>
                )}
              </div>
              <input style={S.input} placeholder="Item Title *" value={newTitle} onChange={e=>setNewTitle(e.target.value)}/>
              <input style={S.input} placeholder="Price ($) *" type="number" value={newPrice} onChange={e=>setNewPrice(e.target.value)}/>
              <input style={S.input} placeholder="📍 Location (city, state)" value={newLocation} onChange={e=>setNewLocation(e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <select style={{...S.input,marginBottom:0}} value={newCat} onChange={e=>setNewCat(e.target.value)}>
                  {CATEGORIES.slice(1).map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <select style={{...S.input,marginBottom:0}} value={newCond} onChange={e=>setNewCond(e.target.value)}>
                  {['New','Like New','Good','Fair','Poor'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <textarea style={{...S.input,minHeight:'70px',resize:'vertical',fontFamily:'inherit'}}
                  placeholder="Description — add details to sell faster!" value={newDesc} onChange={e=>setNewDesc(e.target.value.slice(0,500))}/>
                <div style={{fontSize:'10px',color:'#64748b',textAlign:'right',marginTop:'-8px',marginBottom:'8px'}}>{newDesc.length}/500</div>
              </div>
              <input style={S.input} placeholder="Tags (comma-separated): vintage, vinyl, 70s" value={newTags} onChange={e=>setNewTags(e.target.value)}/>
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
              <button style={S.closeBtn} onClick={()=>setManageModal(null)}>✕</button>
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
              <input style={S.input} placeholder="Title" value={editTitle} onChange={e=>setEditTitle(e.target.value)}/>
              <input style={S.input} placeholder="Price ($)" type="number" value={editPrice} onChange={e=>setEditPrice(e.target.value)}/>
              <input style={S.input} placeholder="📍 Location" value={editLocation} onChange={e=>setEditLocation(e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <select style={{...S.input,marginBottom:0}} value={editCat} onChange={e=>setEditCat(e.target.value)}>
                  {CATEGORIES.slice(1).map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <select style={{...S.input,marginBottom:0}} value={editCond} onChange={e=>setEditCond(e.target.value)}>
                  {['New','Like New','Good','Fair','Poor'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <textarea style={{...S.input,minHeight:'60px',resize:'vertical',fontFamily:'inherit'}}
                  placeholder="Description" value={editDesc} onChange={e=>setEditDesc(e.target.value.slice(0,500))}/>
                <div style={{fontSize:'10px',color:'#64748b',textAlign:'right',marginTop:'-8px',marginBottom:'8px'}}>{editDesc.length}/500</div>
              </div>
              <input style={S.input} placeholder="Tags (comma-separated)" value={editTags} onChange={e=>setEditTags(e.target.value)}/>
              {/* M16: analytics row */}
              <div style={{background:'#0f172a',borderRadius:'10px',padding:'10px 12px',marginBottom:'10px',display:'flex',gap:'16px'}}>
                <span style={{fontSize:'12px',color:'#64748b'}}>👁️ <strong style={{color:'#94a3b8'}}>{manageModal.views||0}</strong> views</span>
                <span style={{fontSize:'12px',color:'#64748b'}}>❤️ <strong style={{color:'#94a3b8'}}>{manageModal.likes||0}</strong> saves</span>
                <span style={{fontSize:'12px',color:'#64748b'}}>📅 <strong style={{color:'#94a3b8'}}>{manageModal.daysListed||5}</strong> days listed</span>
              </div>
              {/* M21: Expiry notice + Renew */}
              {!manageModal.sold&&(
                <div style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'10px',padding:'10px 12px',marginBottom:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'12px',color:'#fcd34d'}}>⏰ Expires in {30-(manageModal.daysListed||5)} days</span>
                  <button onClick={()=>{ setMyListings(prev=>prev.map(l=>l.id===manageModal.id?{...l,daysListed:0}:l)); showToast('✅ Listing renewed for 30 days'); }}
                    style={{background:'#f59e0b',border:'none',borderRadius:'8px',padding:'4px 10px',color:'white',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                    🔄 Renew
                  </button>
                </div>
              )}
              {/* M22: Boost Listing */}
              {!manageModal.sold&&(
                <button onClick={()=>showToast('🚀 Listing boosted! It will appear at the top of search results for 24 hours.')}
                  style={{width:'100%',padding:'11px',borderRadius:'12px',border:'1px solid #f59e0b',background:'rgba(245,158,11,0.1)',color:'#fcd34d',fontSize:'13px',fontWeight:700,cursor:'pointer',marginBottom:'10px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  🚀 Boost Listing — $2.99
                </button>
              )}
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
              <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                {/* M15: Mark as Sold from chat */}
                <button onClick={markSoldFromChat}
                  style={{background:'rgba(16,185,129,0.2)',border:'1px solid #10b981',borderRadius:'10px',padding:'5px 8px',color:'#6ee7b7',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                  ✅ Sold
                </button>
                {/* M20: Offer History */}
                <button onClick={()=>{
                  getOfferHistory(chatModal.id).then(h=>{ setOfferHistoryItems(h||[]); setOfferHistoryModal(chatModal); }).catch(()=>{ setOfferHistoryItems([]); setOfferHistoryModal(chatModal); });
                }} style={{background:'rgba(245,158,11,0.2)',border:'1px solid #f59e0b',borderRadius:'10px',padding:'5px 8px',color:'#fcd34d',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                  📜
                </button>
                <button onClick={()=>setOfferOpen(true)}
                  style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'10px',padding:'5px 8px',color:'#a5b4fc',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                  💰 Offer
                </button>
                <button style={S.closeBtn} onClick={()=>setChatModal(null)}>✕</button>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}} role="log">
              {(chatThreads[chatModal.id]||[]).map((msg,i)=>(
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:msg.from==='seller'?'flex-end':'flex-start'}}>
                  <div style={{background:msg.from==='seller'?'linear-gradient(135deg,#6366f1,#ec4899)':'#1e293b',
                               borderRadius:msg.from==='seller'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                               padding:'10px 14px',maxWidth:'75%',fontSize:'14px',color:'#f1f5f9'}}>
                    {/* M14: render image or text */}
                    {msg.imageUrl ? <img src={msg.imageUrl} alt="Photo" style={{maxWidth:'180px',borderRadius:'10px',display:'block'}}/> : msg.text}
                  </div>
                  {msg.from==='seller'&&<span style={{fontSize:'10px',color:'#6366f1',marginTop:'2px',paddingRight:'4px'}}>✓✓ Sent</span>}
                  {/* M12: Offer accept/counter/decline for incoming buyer offers */}
                  {msg.from==='buyer'&&msg.text?.startsWith('💰')&&(
                    <div style={{display:'flex',gap:'6px',marginTop:'6px'}}>
                      <button onClick={()=>{
                        const key=chatModal.id;
                        const reply={from:'seller',text:'✅ Offer accepted! I\'ll ship within 2 days.'};
                        setChatThreads(prev=>({...prev,[key]:[...prev[key],reply]}));
                        showToast('✅ Offer accepted!');
                      }} style={{background:'#10b981',border:'none',borderRadius:'8px',padding:'5px 10px',color:'white',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>Accept</button>
                      <button onClick={()=>{
                        setOfferOpen(true);
                      }} style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'8px',padding:'5px 10px',color:'#a5b4fc',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>Counter</button>
                      <button onClick={()=>{
                        const key=chatModal.id;
                        const reply={from:'seller',text:'❌ Sorry, I can\'t accept that offer. The listing price is firm.'};
                        setChatThreads(prev=>({...prev,[key]:[...prev[key],reply]}));
                        showToast('❌ Offer declined');
                      }} style={{background:'rgba(239,68,68,0.15)',border:'1px solid #ef4444',borderRadius:'8px',padding:'5px 10px',color:'#fca5a5',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>Decline</button>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatBottomRef}/>
            </div>
            <div style={{display:'flex',gap:'8px',padding:'12px 16px',borderTop:'1px solid #1e293b'}}>
              {/* M14: image attachment */}
              <input type="file" ref={chatFileRef} accept="image/*" style={{display:'none'}} onChange={handleChatImageSelect}/>
              <button onClick={()=>chatFileRef.current?.click()}
                style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'50%',width:'40px',height:'40px',
                        color:'#94a3b8',cursor:'pointer',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                📎
              </button>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter') sendMessage(); }}
                placeholder="Type a message…"
                style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:'20px',padding:'10px 16px',color:'#f1f5f9',fontSize:'14px',outline:'none'}}/>
              <button onClick={sendMessage}
                style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',borderRadius:'50%',width:'40px',height:'40px',color:'white',cursor:'pointer',fontSize:'18px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>➤</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MAKE OFFER MODAL ════════ */}
      {offerOpen&&(
        <div style={S.modal} onClick={()=>setOfferOpen(false)}>
          <div style={{...S.modalBox,maxHeight:'45vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>💰 Make an Offer</span>
              <button style={S.closeBtn} onClick={()=>setOfferOpen(false)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'4px'}}>Re: {chatModal?.item}</div>
              {chatModal?.itemPrice&&(
                <div style={{color:'#64748b',fontSize:'12px',marginBottom:'12px'}}>
                  Listed at <strong style={{color:'#10b981',fontSize:'16px'}}>${chatModal.itemPrice}</strong>
                </div>
              )}
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                <span style={{color:'#10b981',fontSize:'20px',fontWeight:800}}>$</span>
                <input type="number" placeholder="Your offer…" value={offerAmount} onChange={e=>setOfferAmount(e.target.value)}
                  style={{...S.input,marginBottom:0,flex:1,fontSize:'20px',fontWeight:700}}/>
              </div>
              <button style={S.btn()} onClick={sendOffer}>Send Offer</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ REPORT MODAL ════════ */}
      {reportModal&&(
        <div style={S.modal} onClick={()=>setReportModal(null)}>
          <div style={{...S.modalBox,maxHeight:'60vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>🚩 Report Listing</span>
              <button style={S.closeBtn} onClick={()=>setReportModal(null)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {reportDone?(
                <div style={{textAlign:'center',padding:'20px',color:'#10b981'}}>
                  <div style={{fontSize:'40px',marginBottom:'12px'}}>✅</div>
                  <div style={{fontWeight:700,fontSize:'16px'}}>Report submitted</div>
                  <div style={{fontSize:'13px',color:'#64748b',marginTop:'6px'}}>Our team will review this listing within 24 hours.</div>
                </div>
              ):(
                <>
                  <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'14px'}}>
                    Why are you reporting "<strong style={{color:'#f1f5f9'}}>{reportModal?.title?.slice(0,35)}</strong>"?
                  </div>
                  {REPORT_REASONS.map(r=>(
                    <div key={r} onClick={()=>setReportReason(r)}
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

      {/* ════════ WRITE REVIEW MODAL ════════ */}
      {writeReviewItem&&(
        <div style={S.modal} onClick={()=>setWriteReviewItem(null)}>
          <div style={{...S.modalBox,maxHeight:'65vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>✍️ Write a Review</span>
              <button style={S.closeBtn} onClick={()=>setWriteReviewItem(null)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {reviewDone?(
                <div style={{textAlign:'center',padding:'20px',color:'#f59e0b'}}>
                  <div style={{fontSize:'40px',marginBottom:'12px'}}>⭐</div>
                  <div style={{fontWeight:700,fontSize:'16px'}}>Review posted!</div>
                </div>
              ):(
                <>
                  <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'14px'}}>
                    Reviewing: <strong style={{color:'#f1f5f9'}}>{writeReviewItem?.title?.slice(0,40)}</strong>
                  </div>
                  <div style={{marginBottom:'14px'}}>
                    <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'8px'}}>YOUR RATING</div>
                    <div style={{display:'flex',gap:'8px'}}>
                      {[1,2,3,4,5].map(n=>(
                        <button key={n} onClick={()=>setReviewRating(n)}
                          style={{background:'none',border:'none',fontSize:'28px',cursor:'pointer',
                                  color:n<=reviewRating?'#f59e0b':'#334155',transform:n<=reviewRating?'scale(1.15)':'scale(1)'}}>★</button>
                      ))}
                    </div>
                  </div>
                  <textarea value={reviewText} onChange={e=>setReviewText(e.target.value.slice(0,300))}
                    placeholder="Share your experience…"
                    style={{...S.input,minHeight:'90px',resize:'vertical',fontFamily:'inherit'}}/>
                  <div style={{fontSize:'10px',color:'#64748b',textAlign:'right',marginBottom:'4px'}}>{reviewText.length}/300</div>
                  <button style={S.btn()} onClick={submitReview}>Post Review</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ CANCEL ORDER CONFIRM ════════ */}
      {cancelConfirm&&(
        <div style={S.modal} onClick={()=>setCancelConfirm(null)}>
          <div style={{...S.modalBox,maxHeight:'35vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>Cancel Order?</span>
              <button style={S.closeBtn} onClick={()=>setCancelConfirm(null)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'16px'}}>
                Are you sure you want to cancel order <strong style={{color:'#f1f5f9'}}>{cancelConfirm}</strong>? This cannot be undone.
              </div>
              <div style={{display:'flex',gap:'10px'}}>
                <button style={{...S.btn('secondary'),flex:1}} onClick={()=>setCancelConfirm(null)}>Keep Order</button>
                <button style={{...S.btn('red'),flex:1}} onClick={()=>cancelOrder(cancelConfirm)}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ ORDER PROBLEM MODAL ════════ */}
      {orderProblemModal&&(
        <div style={S.modal} onClick={()=>setOrderProblemModal(null)}>
          <div style={{...S.modalBox,maxHeight:'70vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>🆘 Report a Problem</span>
              <button style={S.closeBtn} onClick={()=>setOrderProblemModal(null)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {orderProblemDone?(
                <div style={{textAlign:'center',padding:'20px',color:'#10b981'}}>
                  <div style={{fontSize:'40px',marginBottom:'12px'}}>✅</div>
                  <div style={{fontWeight:700,fontSize:'16px'}}>Problem reported</div>
                  <div style={{fontSize:'13px',color:'#64748b',marginTop:'6px'}}>Our support team will contact you within 24 hours.</div>
                </div>
              ):(
                <>
                  <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'14px'}}>
                    Order <strong style={{color:'#f1f5f9'}}>{orderProblemModal.id}</strong> — what went wrong?
                  </div>
                  {['Item not received','Item not as described','Item arrived damaged','Wrong item sent','Seller unresponsive','Request a refund'].map(r=>(
                    <div key={r} onClick={()=>setOrderProblemReason(r)}
                      style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',marginBottom:'8px',
                              borderRadius:'10px',border:`1px solid ${orderProblemReason===r?'#6366f1':'#334155'}`,
                              background:orderProblemReason===r?'rgba(99,102,241,0.1)':'transparent',cursor:'pointer'}}>
                      <div style={{width:'16px',height:'16px',borderRadius:'50%',border:`2px solid ${orderProblemReason===r?'#6366f1':'#334155'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {orderProblemReason===r&&<div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#6366f1'}}/>}
                      </div>
                      <span style={{fontSize:'13px',color:'#f1f5f9'}}>{r}</span>
                    </div>
                  ))}
                  <div>
                    <textarea value={orderProblemText} onChange={e=>setOrderProblemText(e.target.value.slice(0,400))}
                      placeholder="Describe the issue in detail…"
                      style={{...S.input,minHeight:'70px',resize:'vertical',fontFamily:'inherit',marginTop:'8px'}}/>
                    <div style={{fontSize:'10px',color:'#64748b',textAlign:'right',marginBottom:'4px'}}>{orderProblemText.length}/400</div>
                  </div>
                  <button style={S.btn()} onClick={submitOrderProblem}>Submit Problem Report</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ M29: QR CODE MODAL ════════ */}
      {qrModal&&(
        <div style={S.modal} onClick={()=>setQrModal(null)}>
          <div style={{...S.modalBox,maxHeight:'50vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>📱 QR Code</span>
              <button style={S.closeBtn} onClick={()=>setQrModal(null)}>✕</button>
            </div>
            <div style={{padding:'20px',textAlign:'center'}}>
              <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'14px'}}>Scan to view this listing on any device</div>
              <img src={getQRCodeURL(qrModal.id)} alt="QR Code" style={{width:'180px',height:'180px',borderRadius:'12px',background:'white',padding:'8px'}}
                onError={e=>{e.target.style.display='none';}}/>
              <div style={{marginTop:'12px',fontSize:'12px',color:'#64748b'}}>{qrModal.title?.slice(0,40)}</div>
              <div style={{marginTop:'4px',fontSize:'14px',color:'#10b981',fontWeight:700}}>${qrModal.price}</div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ M23: PRICE ALERT MODAL ════════ */}
      {priceAlertModal&&(
        <div style={S.modal} onClick={()=>{setPriceAlertModal(null);setPriceAlertTarget('');setPriceAlertDone(false);}}>
          <div style={{...S.modalBox,maxHeight:'50vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>🔔 Price Alert</span>
              <button style={S.closeBtn} onClick={()=>{setPriceAlertModal(null);setPriceAlertTarget('');setPriceAlertDone(false);}}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              {priceAlertDone?(
                <div style={{textAlign:'center',padding:'20px',color:'#f59e0b'}}>
                  <div style={{fontSize:'40px',marginBottom:'12px'}}>🔔</div>
                  <div style={{fontWeight:700}}>Alert set!</div>
                  <div style={{fontSize:'13px',color:'#64748b',marginTop:'6px'}}>We'll notify you when the price drops.</div>
                </div>
              ):(
                <>
                  <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'4px'}}>{priceAlertModal.title?.slice(0,40)}</div>
                  <div style={{color:'#10b981',fontWeight:800,fontSize:'18px',marginBottom:'14px'}}>Current: ${priceAlertModal.price}</div>
                  <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'8px'}}>Alert me when price drops to:</div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                    <span style={{color:'#10b981',fontSize:'20px',fontWeight:800}}>$</span>
                    <input type="number" placeholder="Target price…" value={priceAlertTarget} onChange={e=>setPriceAlertTarget(e.target.value)}
                      style={{...S.input,marginBottom:0,flex:1,fontSize:'18px',fontWeight:700}}/>
                  </div>
                  <button style={S.btn()} onClick={()=>{
                    if (!priceAlertTarget) return;
                    savePriceAlert({listingId:priceAlertModal.id,title:priceAlertModal.title,currentPrice:priceAlertModal.price,targetPrice:parseFloat(priceAlertTarget)}).catch(()=>{});
                    setPriceAlertDone(true);
                    setTimeout(()=>{ setPriceAlertModal(null); setPriceAlertTarget(''); setPriceAlertDone(false); },2500);
                  }}>Set Alert</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ M20: OFFER HISTORY MODAL ════════ */}
      {offerHistoryModal&&(
        <div style={S.modal} onClick={()=>setOfferHistoryModal(null)}>
          <div style={{...S.modalBox,maxHeight:'60vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>📜 Offer History</span>
              <button style={S.closeBtn} onClick={()=>setOfferHistoryModal(null)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'14px'}}>Re: {offerHistoryModal.item}</div>
              {offerHistoryItems.length===0?(
                <div style={{textAlign:'center',padding:'20px',color:'#64748b'}}>
                  <div style={{fontSize:'32px',marginBottom:'8px'}}>📭</div>
                  <div>No offers made yet in this conversation.</div>
                </div>
              ):offerHistoryItems.map((o,i)=>(
                <div key={i} style={{background:'#0f172a',borderRadius:'12px',padding:'12px',marginBottom:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:'15px',color:o.status==='accepted'?'#10b981':o.status==='declined'?'#ef4444':'#f1f5f9'}}>${o.amount}</div>
                    <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>{o.from==='buyer'?'Buyer offered':'Counter offer'} · {o.time||'recently'}</div>
                  </div>
                  <span style={{background:o.status==='accepted'?'rgba(16,185,129,0.2)':o.status==='declined'?'rgba(239,68,68,0.2)':'rgba(245,158,11,0.2)',
                    border:'none',borderRadius:'8px',padding:'3px 10px',fontSize:'11px',fontWeight:700,
                    color:o.status==='accepted'?'#6ee7b7':o.status==='declined'?'#fca5a5':'#fcd34d'}}>
                    {o.status==='accepted'?'✅ Accepted':o.status==='declined'?'❌ Declined':'⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════ M28: SAFE MEETING SPOTS MODAL ════════ */}
      {safeSpotModal&&(
        <div style={S.modal} onClick={()=>setSafeSpotModal(false)}>
          <div style={{...S.modalBox,maxHeight:'60vh'}} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={{fontWeight:700,fontSize:'16px'}}>📍 Safe Meeting Spots</span>
              <button style={S.closeBtn} onClick={()=>setSafeSpotModal(false)}>✕</button>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'14px'}}>Suggested safe public locations for in-person exchanges:</div>
              {[{emoji:'🚔',name:'Police Station Lobby',note:'Many stations offer free safe exchange zones'},
                {emoji:'🏦',name:'Bank ATM Area (daytime)',note:'Well-lit, monitored by cameras'},
                {emoji:'☕',name:'Coffee Shop (public)',note:'Meet inside during business hours'},
                {emoji:'🏪',name:'Retail Store Entrance',note:'Busy foot traffic, security cameras'},
                {emoji:'🏫',name:'Library or Community Center',note:'Quiet, safe, public space'},
                {emoji:'🚉',name:'Transit Station',note:'High foot traffic, security present'},
              ].map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',borderRadius:'10px',marginBottom:'8px',background:'#0f172a'}}>
                  <span style={{fontSize:'24px'}}>{s.emoji}</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:'13px',color:'#f1f5f9'}}>{s.name}</div>
                    <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>{s.note}</div>
                  </div>
                </div>
              ))}
              <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'10px',padding:'10px 12px',marginTop:'8px'}}>
                <div style={{color:'#6ee7b7',fontSize:'12px'}}>✅ Always tell someone where you're going. Never meet in private locations.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast&&(
        <div role="alert" aria-live="polite"
          style={{position:'fixed',bottom:'calc(var(--bottom-nav-height,80px) + 60px)',left:'50%',transform:'translateX(-50%)',
                  background:'#1e293b',border:'1px solid #6366f1',color:'#f1f5f9',
                  padding:'10px 20px',borderRadius:'12px',fontWeight:600,zIndex:200,
                  whiteSpace:'nowrap',fontSize:'13px',boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
          {toast}
        </div>
      )}

      {/* ── ORDER SUCCESS TOAST ── */}
      {orderPlaced&&(
        <div role="alert"
          style={{position:'fixed',bottom:'calc(var(--bottom-nav-height,80px) + 60px)',left:'50%',transform:'translateX(-50%)',
                  background:'#10b981',color:'white',padding:'12px 24px',borderRadius:'12px',fontWeight:700,zIndex:200,whiteSpace:'nowrap'}}>
          ✅ Order placed! Check Orders tab to track.
        </div>
      )}

      {/* ── FAB ── */}
      {!isSellingTab&&(
        <button onClick={()=>setCreateOpen(true)} aria-label="Create new listing"
          style={{position:'fixed',bottom:'calc(var(--bottom-nav-height,80px) + 12px)',right:'20px',width:'52px',height:'52px',borderRadius:'50%',
                  background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',color:'white',
                  fontSize:'24px',cursor:'pointer',zIndex:50,boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
      )}
    </div>
  );
}
