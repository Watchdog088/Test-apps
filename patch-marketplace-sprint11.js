/**
 * patch-marketplace-sprint11.js
 * Adds Sprint 10 imports + Sprint 11 UI features to MarketplacePage.jsx
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'ConnectHub-SPA/src/pages/marketplace/MarketplacePage.jsx');
let src = fs.readFileSync(FILE, 'utf8');

// ─── 1. Fix import block: add Sprint 10 imports ──────────────────────────────
const OLD_IMPORT_END = `  submitReviewToFirestore,
  submitDisputeToFirestore,
} from '../../services/marketplace-backend-service.js';`;

const NEW_IMPORT_END = `  submitReviewToFirestore,
  submitDisputeToFirestore,
  // ── Sprint 10–11 (BE-10 → BE-15) ─────────────────────────────
  getListingShareURL,
  getQRCodeURL,
  submitReportToModeration,
  savePriceAlert,
  loadPriceAlerts,
  getOfferHistory,
  getSellerResponseTime,
  generateWishlistShareURL,
  calculateBundleDiscount,
} from '../../services/marketplace-backend-service.js';`;

src = src.replace(OLD_IMPORT_END, NEW_IMPORT_END);

// ─── 2. Add Sprint 11 state variables after editTags state ───────────────────
const OLD_EDIT_STATE = `  const [editTags, setEditTags]       = useState('');

  // ── Recent searches`;

const NEW_EDIT_STATE = `  const [editTags, setEditTags]       = useState('');

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

  // ── Recent searches`;

src = src.replace(OLD_EDIT_STATE, NEW_EDIT_STATE);

// ─── 3. M27: Fetch seller response time when item detail opens ────────────────
const OLD_OPEN_ITEM = `  function openItemModal(item){
    setItemModal(item);
    setRecentlyViewed(prev=>[item,...prev.filter(i=>i.id!==item.id)].slice(0,5));
    // BE-08: fetch real shipping rates
    calculateShipping({ itemId:item.id, category:item.category }).then(rates=>{
      if (rates && rates.length) setItemShipping(rates);
    }).catch(()=>setItemShipping(DEFAULT_SHIPPING));
  }`;

const NEW_OPEN_ITEM = `  function openItemModal(item){
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
  }`;

src = src.replace(OLD_OPEN_ITEM, NEW_OPEN_ITEM);

// ─── 4. M24: Compute bundle discount when cart changes ───────────────────────
const OLD_CART_EFFECT = `  // BE-03: Sync cart to Firestore whenever it changes
  useEffect(()=>{
    try { localStorage.setItem('mkt_cart', JSON.stringify(cart)); } catch{}
    syncCartToFirestore(cart).catch(()=>{});
  },[cart]);`;

const NEW_CART_EFFECT = `  // BE-03: Sync cart to Firestore whenever it changes
  useEffect(()=>{
    try { localStorage.setItem('mkt_cart', JSON.stringify(cart)); } catch{}
    syncCartToFirestore(cart).catch(()=>{});
    // M24: compute bundle discount when cart changes
    if (cart.length>1){
      calculateBundleDiscount(cart.map(c=>c.listing)).then(d=>setBundleDiscount(d)).catch(()=>setBundleDiscount(null));
    } else { setBundleDiscount(null); }
  },[cart]);`;

src = src.replace(OLD_CART_EFFECT, NEW_CART_EFFECT);

// ─── 5. M30: Add "Share Wishlist" button in Saved tab header ─────────────────
const OLD_WISHLIST_HDR = `          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontWeight:700,fontSize:'15px',color:'#f1f5f9'}}>❤️ Wishlist ({wishlistItems.length})</span>
          </div>`;

const NEW_WISHLIST_HDR = `          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
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
          </div>`;

src = src.replace(OLD_WISHLIST_HDR, NEW_WISHLIST_HDR);

// ─── 6. M23 + M29: Add price alert bell + QR code button to item detail Share row ──
const OLD_SHARE_ROW = `              <div style={{display:'flex',gap:'8px',marginBottom:'14px'}}>
                <button onClick={()=>shareItem(itemModal)}
                  style={{flex:1,background:'#1e293b',border:'1px solid #334155',borderRadius:'12px',padding:'10px',color:'#94a3b8',fontSize:'13px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                  🔗 Share
                </button>`;

const NEW_SHARE_ROW = `              {/* M27: Seller response time */}
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
                  style={{background:'rgba(245,158,11,0.15)',border:'1px solid #f59e0b',borderRadius:'12px',padding:'10px 12px',color:'#fcd34d',fontSize:'13px',cursor:'pointer'}}>🔔</button>`;

src = src.replace(OLD_SHARE_ROW, NEW_SHARE_ROW);

// ─── 7. M20: Add "📜 History" button in chat header ──────────────────────────
const OLD_CHAT_HDR_BTNS = `                {/* M15: Mark as Sold from chat */}
                <button onClick={markSoldFromChat}
                  style={{background:'rgba(16,185,129,0.2)',border:'1px solid #10b981',borderRadius:'10px',padding:'5px 8px',color:'#6ee7b7',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                  ✅ Sold
                </button>
                <button onClick={()=>setOfferOpen(true)}
                  style={{background:'rgba(99,102,241,0.2)',border:'1px solid #6366f1',borderRadius:'10px',padding:'5px 8px',color:'#a5b4fc',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                  💰 Offer
                </button>`;

const NEW_CHAT_HDR_BTNS = `                {/* M15: Mark as Sold from chat */}
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
                </button>`;

src = src.replace(OLD_CHAT_HDR_BTNS, NEW_CHAT_HDR_BTNS);

// ─── 8. M24: Bundle discount banner in cart ───────────────────────────────────
const OLD_CART_TOTAL = `                <div style={{padding:'16px 20px',borderTop:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{color:'#94a3b8',fontSize:'14px'}}>Total</span>
                  <span style={{fontWeight:800,fontSize:'20px',color:'#f1f5f9'}}>${'$'}{cartTotal}</span>
                </div>`;

const NEW_CART_TOTAL = `                {bundleDiscount&&bundleDiscount.savings>0&&(
                  <div style={{margin:'0 20px 4px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.4)',borderRadius:'10px',padding:'8px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:'#fcd34d',fontSize:'12px',fontWeight:700}}>🎁 Bundle Deal ({bundleDiscount.pct}% off same seller)</span>
                    <span style={{color:'#fcd34d',fontWeight:800,fontSize:'13px'}}>−\${bundleDiscount.savings}</span>
                  </div>
                )}
                <div style={{padding:'16px 20px',borderTop:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{color:'#94a3b8',fontSize:'14px'}}>Total</span>
                  <span style={{fontWeight:800,fontSize:'20px',color:'#f1f5f9'}}>${'$'}{cartTotal}</span>
                </div>`;

src = src.replace(OLD_CART_TOTAL, NEW_CART_TOTAL);

// ─── 9. Add Sprint 11 modals before the TOAST section ────────────────────────
const OLD_TOAST = `      {/* ── TOAST ── */}
      {toast&&(`;

const NEW_TOAST = `      {/* ════════ M29: QR CODE MODAL ════════ */}
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
              <div style={{marginTop:'4px',fontSize:'14px',color:'#10b981',fontWeight:700}}>\${qrModal.price}</div>
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
                  <div style={{color:'#10b981',fontWeight:800,fontSize:'18px',marginBottom:'14px'}}>Current: \${priceAlertModal.price}</div>
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
                    <div style={{fontWeight:700,fontSize:'15px',color:o.status==='accepted'?'#10b981':o.status==='declined'?'#ef4444':'#f1f5f9'}}>\${o.amount}</div>
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
      {toast&&(`;

// Need to escape the dollar signs in the replace string
src = src.replace(OLD_TOAST, NEW_TOAST);

// ─── 10. Add safe spots button to seller info section in item detail ──────────
const OLD_SELLER_MSG_BTN = `                <button onClick={e=>{e.stopPropagation();openMessageFromItem(itemModal);}}
                  style={{background:'#1e293b',border:'none',borderRadius:'10px',padding:'8px 12px',color:'#6366f1',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>
                  💬 Message
                </button>`;

const NEW_SELLER_MSG_BTN = `                <button onClick={e=>{e.stopPropagation();openMessageFromItem(itemModal);}}
                  style={{background:'#1e293b',border:'none',borderRadius:'10px',padding:'8px 12px',color:'#6366f1',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>
                  💬 Message
                </button>
                <button onClick={e=>{e.stopPropagation();setSafeSpotModal(true);}}
                  title="Safe meeting spots"
                  style={{background:'#1e293b',border:'none',borderRadius:'10px',padding:'8px 10px',color:'#94a3b8',fontSize:'15px',cursor:'pointer'}}>
                  📍
                </button>`;

src = src.replace(OLD_SELLER_MSG_BTN, NEW_SELLER_MSG_BTN);

// ─── Write the patched file ───────────────────────────────────────────────────
fs.writeFileSync(FILE, src, 'utf8');
console.log('✅ MarketplacePage.jsx patched with Sprint 10 imports + Sprint 11 UI features!');
console.log('   M20: Offer history button in chat header + modal');
console.log('   M23: Price alert bell in item detail + modal');
console.log('   M24: Bundle discount banner in cart panel');
console.log('   M27: Seller response time fetched on item open');
console.log('   M28: Safe meeting spots modal (📍 button)');
console.log('   M29: QR code button in item detail + modal');
console.log('   M30: Share Wishlist button in Saved tab');
