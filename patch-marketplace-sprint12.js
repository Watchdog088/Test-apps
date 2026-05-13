/**
 * patch-marketplace-sprint12.js
 * Adds M10 (4-step Create Listing wizard) + M26 (Map view via OpenStreetMap)
 * Also wires "View seller profile →" link to navigate to /marketplace/seller/:name
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'ConnectHub-SPA/src/pages/marketplace/MarketplacePage.jsx');
let src = fs.readFileSync(FILE, 'utf8');

// ─── 1. Add useNavigate import if missing ──────────────────────────────────────
if (!src.includes('useNavigate')) {
  src = src.replace(
    `import React, {`,
    `import { useNavigate } from 'react-router-dom';\nimport React, {`
  );
}

// ─── 2. Add Sprint 12 state variables ─────────────────────────────────────────
const AFTER_S11_STATE = `  const [safeSpotModal, setSafeSpotModal]         = useState(false);  // M28

  // ── Recent searches`;

const SPRINT12_STATE = `  const [safeSpotModal, setSafeSpotModal]         = useState(false);  // M28

  // ── Sprint 12 state ──────────────────────────────────────────────────────────
  const [mapOpen, setMapOpen]                     = useState(false);   // M26
  const [mapSelectedItem, setMapSelectedItem]     = useState(null);    // M26
  const [wizardOpen, setWizardOpen]               = useState(false);   // M10
  const [wizardStep, setWizardStep]               = useState(1);       // M10
  const [wizardDraft, setWizardDraft]             = useState({         // M10
    photoUrl:'', title:'', category:'', condition:'', description:'',
    price:'', acceptsOffers:false, shipping:'standard', localPickup:false, tags:''
  });
  const [wizardPublished, setWizardPublished]     = useState(false);   // M10

  // ── Recent searches`;

src = src.replace(AFTER_S11_STATE, SPRINT12_STATE);

// ─── 3. Wire useNavigate in component body ────────────────────────────────────
// Find where the function body starts and add navigate
const FUNC_BODY = `  // ── Recent searches`;
if (!src.includes('const navigate = useNavigate()')) {
  src = src.replace(FUNC_BODY, `  const navigate = useNavigate();\n\n  // ── Recent searches`);
}

// ─── 4. Wire "View seller profile →" button to navigate ───────────────────────
// Replace the existing "View seller profile" link text/handler
src = src.replace(
  `'View seller profile →'`,
  `'🧑 View full profile →'`
);
// Now find the existing onClick handler for view seller profile link
// It might be onClick={}; let's replace the text-based handler
const OLD_VIEW_PROFILE = `style={{color:'#6366f1',background:'none',border:'none',fontSize:'12px',cursor:'pointer',fontWeight:700}}>
                  View seller profile →`;
const NEW_VIEW_PROFILE = `style={{color:'#6366f1',background:'none',border:'none',fontSize:'12px',cursor:'pointer',fontWeight:700}} onClick={()=>navigate('/marketplace/seller/'+encodeURIComponent(itemModal?.seller||''))}>
                  🧑 View full profile →`;
if (src.includes(OLD_VIEW_PROFILE)) {
  src = src.replace(OLD_VIEW_PROFILE, NEW_VIEW_PROFILE);
}

// ─── 5. Add 🗺️ Map button next to the Filters button in Browse ───────────────
// Look for the setFiltersOpen(true) button pattern
const OLD_FILTER_BTN = `onClick={()=>setFiltersOpen(true)}
                  style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'10px',padding:'6px 12px',color:'#94a3b8',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                  ⚙️ Filters`;
const NEW_FILTER_BTN = `onClick={()=>setFiltersOpen(true)}
                  style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'10px',padding:'6px 12px',color:'#94a3b8',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                  ⚙️ Filters`;

// Simpler approach — find the filter row and add Map after it
// Look for a pattern unique to the filter/sort row
const OLD_SORT_ROW_END = `</select>
                </div>`;

// Add map button after the filters button in the sort row
// Find the filters button's closing element by a wider pattern
const FILTER_CLOSE_TAG = `⚙️ Filters
                </button>`;
const FILTER_CLOSE_WITH_MAP = `⚙️ Filters
                </button>
                {/* M26: Map view toggle */}
                <button onClick={()=>setMapOpen(true)}
                  style={{background:mapOpen?'rgba(99,102,241,0.2)':'#1e293b',border:mapOpen?'1px solid #6366f1':'1px solid #334155',borderRadius:'10px',padding:'6px 12px',color:mapOpen?'#a5b4fc':'#94a3b8',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                  🗺️ Map
                </button>`;

if (src.includes(FILTER_CLOSE_TAG)) {
  src = src.replace(FILTER_CLOSE_TAG, FILTER_CLOSE_WITH_MAP);
} else {
  console.log('⚠️  Filter close tag not found — Map button not added to filter row');
}

// ─── 6. Add wizard + map modals before TOAST ──────────────────────────────────
const BEFORE_TOAST = `      {/* ════════ M28: SAFE MEETING SPOTS MODAL ════════ */}`;

const NEW_MODALS_BEFORE_TOAST = `      {/* ════════ M10: 4-STEP CREATE LISTING WIZARD ════════ */}
      {wizardOpen&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>{if(!wizardPublished){setWizardOpen(false);setWizardStep(1);}}}>
          <div style={{background:'#1e293b',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:'480px',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            {/* Step indicator */}
            <div style={{padding:'20px 20px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontWeight:800,fontSize:'16px',color:'#f1f5f9'}}>{wizardPublished?'🎉 Published!':`📋 New Listing · Step ${wizardStep} of 4`}</span>
              <button style={{background:'none',border:'none',color:'#94a3b8',fontSize:'20px',cursor:'pointer'}} onClick={()=>{setWizardOpen(false);setWizardStep(1);setWizardPublished(false);}}>✕</button>
            </div>
            {/* Progress bar */}
            {!wizardPublished&&(
              <div style={{margin:'12px 20px',height:'4px',background:'#0f172a',borderRadius:'2px'}}>
                <div style={{height:'100%',borderRadius:'2px',background:'linear-gradient(90deg,#6366f1,#ec4899)',width:\`\${(wizardStep/4)*100}%\`,transition:'width 0.3s ease'}}/>
              </div>
            )}
            <div style={{padding:'16px 20px 32px'}}>
              {wizardPublished?(
                <div style={{textAlign:'center',padding:'20px 0'}}>
                  <div style={{fontSize:'64px',marginBottom:'16px'}}>🎉</div>
                  <div style={{fontWeight:800,fontSize:'20px',color:'#f1f5f9',marginBottom:'8px'}}>Your listing is live!</div>
                  <div style={{color:'#64748b',fontSize:'14px',marginBottom:'20px'}}>"{wizardDraft.title}" is now visible to buyers.</div>
                  <div style={{background:'#0f172a',borderRadius:'14px',padding:'16px',marginBottom:'20px',textAlign:'left'}}>
                    <div style={{fontWeight:700,fontSize:'15px',color:'#f1f5f9',marginBottom:'4px'}}>{wizardDraft.title||'Untitled Listing'}</div>
                    <div style={{color:'#10b981',fontWeight:800,fontSize:'18px'}}>\${wizardDraft.price||'0'}</div>
                    <div style={{fontSize:'12px',color:'#64748b',marginTop:'4px'}}>{wizardDraft.condition} · {wizardDraft.category} · {wizardDraft.shipping==='local'?'Local pickup':'Ships nationwide'}</div>
                  </div>
                  <button style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',borderRadius:'14px',padding:'14px 32px',color:'white',fontWeight:700,fontSize:'15px',cursor:'pointer',width:'100%'}} onClick={()=>{setWizardOpen(false);setWizardStep(1);setWizardPublished(false);setWizardDraft({photoUrl:'',title:'',category:'',condition:'',description:'',price:'',acceptsOffers:false,shipping:'standard',localPickup:false,tags:''});}}>
                    ✅ Done
                  </button>
                </div>
              ):wizardStep===1?(
                <>
                  <div style={{fontWeight:700,fontSize:'14px',color:'#94a3b8',marginBottom:'12px'}}>📷 Step 1 — Add Photos</div>
                  <div style={{border:'2px dashed #334155',borderRadius:'14px',padding:'30px',textAlign:'center',marginBottom:'16px',cursor:'pointer',background:wizardDraft.photoUrl?'#0f172a':'transparent'}} onClick={()=>{const url=\`https://picsum.photos/seed/\${Math.floor(Math.random()*1000)}/400/300\`;setWizardDraft(d=>({...d,photoUrl:url}));}}>
                    {wizardDraft.photoUrl?(
                      <img src={wizardDraft.photoUrl} alt="Preview" style={{width:'100%',maxHeight:'160px',objectFit:'cover',borderRadius:'10px'}}/>
                    ):(
                      <>
                        <div style={{fontSize:'40px',marginBottom:'8px'}}>📷</div>
                        <div style={{color:'#94a3b8',fontSize:'13px',fontWeight:600}}>Tap to add a photo</div>
                        <div style={{color:'#475569',fontSize:'11px',marginTop:'4px'}}>(Uses a random photo in demo mode)</div>
                      </>
                    )}
                  </div>
                  {wizardDraft.photoUrl&&<div style={{fontSize:'12px',color:'#6ee7b7',marginBottom:'12px',textAlign:'center'}}>✅ Photo added</div>}
                  <div style={{color:'#64748b',fontSize:'11px',marginBottom:'16px'}}>In production, this will open your camera roll. Up to 8 photos supported. First photo becomes the cover.</div>
                  <button style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',borderRadius:'14px',padding:'14px',color:'white',fontWeight:700,fontSize:'14px',cursor:'pointer',width:'100%'}} onClick={()=>setWizardStep(2)}>
                    Next: Item Details →
                  </button>
                </>
              ):wizardStep===2?(
                <>
                  <div style={{fontWeight:700,fontSize:'14px',color:'#94a3b8',marginBottom:'12px'}}>📝 Step 2 — Item Details</div>
                  {[{key:'title',label:'Title *',placeholder:'e.g. Nike Air Max 90, Size 10'},
                    {key:'description',label:'Description',placeholder:'Describe the item: age, usage, any defects...', multiline:true},
                  ].map(f=>(
                    <div key={f.key} style={{marginBottom:'14px'}}>
                      <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'6px'}}>{f.label}</div>
                      {f.multiline?(
                        <textarea placeholder={f.placeholder} value={wizardDraft[f.key]} onChange={e=>setWizardDraft(d=>({...d,[f.key]:e.target.value}))} rows={3}
                          style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:'10px',padding:'10px 12px',color:'#f1f5f9',fontSize:'13px',outline:'none',boxSizing:'border-box',resize:'vertical'}}/>
                      ):(
                        <input type="text" placeholder={f.placeholder} value={wizardDraft[f.key]} onChange={e=>setWizardDraft(d=>({...d,[f.key]:e.target.value}))}
                          style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:'10px',padding:'10px 12px',color:'#f1f5f9',fontSize:'13px',outline:'none',boxSizing:'border-box'}}/>
                      )}
                    </div>
                  ))}
                  <div style={{marginBottom:'14px'}}>
                    <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'6px'}}>Category *</div>
                    <select value={wizardDraft.category} onChange={e=>setWizardDraft(d=>({...d,category:e.target.value}))}
                      style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:'10px',padding:'10px 12px',color:'#f1f5f9',fontSize:'13px',outline:'none'}}>
                      <option value="">Select category…</option>
                      {['Electronics','Fitness','Gaming','Music','Art','Books','Clothing','Sports','Home','Kitchen','Toys','Office'].map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{marginBottom:'16px'}}>
                    <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'8px'}}>Condition *</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                      {['New','Like New','Good','Fair','Poor'].map(c=>(
                        <button key={c} onClick={()=>setWizardDraft(d=>({...d,condition:c}))}
                          style={{padding:'7px 14px',borderRadius:'10px',border:wizardDraft.condition===c?'1px solid #6366f1':'1px solid #334155',background:wizardDraft.condition===c?'rgba(99,102,241,0.2)':'#0f172a',color:wizardDraft.condition===c?'#a5b4fc':'#94a3b8',fontWeight:600,fontSize:'12px',cursor:'pointer'}}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:'14px',padding:'12px',color:'#94a3b8',fontWeight:600,fontSize:'14px',cursor:'pointer'}} onClick={()=>setWizardStep(1)}>← Back</button>
                    <button style={{flex:2,background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',borderRadius:'14px',padding:'12px',color:'white',fontWeight:700,fontSize:'14px',cursor:'pointer',opacity:wizardDraft.title&&wizardDraft.category&&wizardDraft.condition?1:0.5}} onClick={()=>{if(wizardDraft.title&&wizardDraft.category&&wizardDraft.condition)setWizardStep(3);}}>Next: Pricing →</button>
                  </div>
                </>
              ):wizardStep===3?(
                <>
                  <div style={{fontWeight:700,fontSize:'14px',color:'#94a3b8',marginBottom:'12px'}}>💰 Step 3 — Price & Shipping</div>
                  <div style={{marginBottom:'14px'}}>
                    <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'6px'}}>Price *</div>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <span style={{color:'#10b981',fontSize:'24px',fontWeight:800}}>$</span>
                      <input type="number" placeholder="0.00" value={wizardDraft.price} onChange={e=>setWizardDraft(d=>({...d,price:e.target.value}))} min="0"
                        style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:'10px',padding:'10px 12px',color:'#f1f5f9',fontSize:'20px',fontWeight:700,outline:'none'}}/>
                    </div>
                    <div style={{fontSize:'11px',color:'#475569',marginTop:'6px'}}>Similar items in {wizardDraft.category||'this category'} sell for $25–$200</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px',padding:'12px',background:'#0f172a',borderRadius:'10px'}}>
                    <input type="checkbox" id="acceptsOffers" checked={wizardDraft.acceptsOffers} onChange={e=>setWizardDraft(d=>({...d,acceptsOffers:e.target.checked}))} style={{width:'18px',height:'18px'}}/>
                    <label htmlFor="acceptsOffers" style={{color:'#f1f5f9',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>💰 Accept offers / negotiate price</label>
                  </div>
                  <div style={{marginBottom:'14px'}}>
                    <div style={{fontWeight:600,fontSize:'12px',color:'#94a3b8',marginBottom:'8px'}}>Shipping</div>
                    {[{val:'standard',label:'📦 Standard shipping ($5–$15)'},
                      {val:'express',label:'⚡ Express shipping ($15–$30)'},
                      {val:'local',label:'📍 Local pickup only (Free)'},
                      {val:'both',label:'🌐 Ships + Local pickup'},
                    ].map(s=>(
                      <div key={s.val} onClick={()=>setWizardDraft(d=>({...d,shipping:s.val}))} style={{padding:'10px 14px',borderRadius:'10px',marginBottom:'6px',cursor:'pointer',border:wizardDraft.shipping===s.val?'1px solid #6366f1':'1px solid #1e293b',background:wizardDraft.shipping===s.val?'rgba(99,102,241,0.12)':'#0f172a',color:'#f1f5f9',fontSize:'13px'}}>
                        {s.label}
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:'14px',padding:'12px',color:'#94a3b8',fontWeight:600,fontSize:'14px',cursor:'pointer'}} onClick={()=>setWizardStep(2)}>← Back</button>
                    <button style={{flex:2,background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',borderRadius:'14px',padding:'12px',color:'white',fontWeight:700,fontSize:'14px',cursor:'pointer',opacity:wizardDraft.price?1:0.5}} onClick={()=>{if(wizardDraft.price)setWizardStep(4);}}>Preview →</button>
                  </div>
                </>
              ):(
                <>
                  <div style={{fontWeight:700,fontSize:'14px',color:'#94a3b8',marginBottom:'12px'}}>👁 Step 4 — Preview & Publish</div>
                  <div style={{background:'#0f172a',borderRadius:'14px',overflow:'hidden',marginBottom:'16px'}}>
                    {wizardDraft.photoUrl&&<img src={wizardDraft.photoUrl} alt="listing" style={{width:'100%',height:'160px',objectFit:'cover'}}/>}
                    <div style={{padding:'14px'}}>
                      <div style={{fontWeight:800,fontSize:'17px',color:'#f1f5f9',marginBottom:'6px'}}>{wizardDraft.title}</div>
                      <div style={{color:'#10b981',fontWeight:800,fontSize:'22px',marginBottom:'8px'}}>\${wizardDraft.price}</div>
                      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'8px'}}>
                        <span style={{background:'rgba(99,102,241,0.15)',border:'1px solid #6366f1',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',color:'#a5b4fc'}}>{wizardDraft.condition}</span>
                        <span style={{background:'rgba(16,185,129,0.1)',border:'1px solid #10b981',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',color:'#6ee7b7'}}>{wizardDraft.category}</span>
                        {wizardDraft.acceptsOffers&&<span style={{background:'rgba(245,158,11,0.1)',border:'1px solid #f59e0b',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',color:'#fcd34d'}}>💰 Offers OK</span>}
                      </div>
                      {wizardDraft.description&&<div style={{fontSize:'13px',color:'#94a3b8',lineHeight:'1.5'}}>{wizardDraft.description.slice(0,120)}{wizardDraft.description.length>120?'…':''}</div>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:'14px',padding:'12px',color:'#94a3b8',fontWeight:600,fontSize:'14px',cursor:'pointer'}} onClick={()=>setWizardStep(3)}>← Edit</button>
                    <button style={{flex:2,background:'linear-gradient(135deg,#10b981,#6366f1)',border:'none',borderRadius:'14px',padding:'12px',color:'white',fontWeight:700,fontSize:'15px',cursor:'pointer'}} onClick={()=>{setWizardPublished(true);}}>
                      🚀 Publish Listing
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ M26: MAP VIEW MODAL (OpenStreetMap embed) ════════ */}
      {mapOpen&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:300,display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',background:'#1e293b',borderBottom:'1px solid #334155'}}>
            <span style={{fontWeight:700,fontSize:'16px',color:'#f1f5f9'}}>🗺️ Nearby Listings</span>
            <button style={{background:'none',border:'none',color:'#94a3b8',fontSize:'20px',cursor:'pointer'}} onClick={()=>{setMapOpen(false);setMapSelectedItem(null);}}>✕</button>
          </div>
          {/* OpenStreetMap embed — no API key required */}
          <div style={{flex:1,position:'relative',overflow:'hidden'}}>
            <iframe
              title="Nearby listings map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-77.15%2C38.85%2C-76.95%2C38.97&layer=mapnik"
              style={{width:'100%',height:'100%',border:'none'}}
              loading="lazy"
            />
            {/* Listing pins overlay */}
            <div style={{position:'absolute',top:'12px',left:'12px',display:'flex',flexDirection:'column',gap:'6px',zIndex:10,pointerEvents:'none'}}>
              <div style={{background:'rgba(10,10,24,0.85)',backdropFilter:'blur(8px)',borderRadius:'12px',padding:'8px 12px',border:'1px solid #334155'}}>
                <div style={{color:'#94a3b8',fontSize:'11px',fontWeight:600}}>📍 {filteredProducts.slice(0,8).length} listings near you</div>
              </div>
            </div>
            {/* Simulated map pins */}
            {[{x:'25%',y:'35%',p:0},{x:'45%',y:'55%',p:1},{x:'60%',y:'30%',p:2},{x:'35%',y:'65%',p:3},{x:'70%',y:'50%',p:4},{x:'20%',y:'60%',p:5}].map((pin,i)=>{
              const item = filteredProducts[pin.p];
              if (!item) return null;
              return (
                <div key={i} style={{position:'absolute',left:pin.x,top:pin.y,transform:'translate(-50%,-50%)',zIndex:20,cursor:'pointer',pointerEvents:'auto'}} onClick={()=>setMapSelectedItem(item)}>
                  <div style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',borderRadius:'50% 50% 50% 0',width:'32px',height:'32px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',transform:'rotate(-45deg)',boxShadow:'0 4px 12px rgba(0,0,0,0.4)'}}>
                    <span style={{transform:'rotate(45deg)'}}>{item.emoji||'📦'}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Selected item card */}
          {mapSelectedItem?(
            <div style={{background:'#1e293b',borderTop:'1px solid #334155',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:'48px',height:'48px',borderRadius:'10px',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>{mapSelectedItem.emoji||'📦'}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:'14px',color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{mapSelectedItem.title}</div>
                <div style={{display:'flex',gap:'8px',alignItems:'center',marginTop:'3px'}}>
                  <span style={{color:'#10b981',fontWeight:800,fontSize:'16px'}}>\${mapSelectedItem.price}</span>
                  <span style={{color:'#64748b',fontSize:'11px'}}>📍 {mapSelectedItem.distance||'< 2 mi away'}</span>
                </div>
              </div>
              <button onClick={()=>{setMapOpen(false);setMapSelectedItem(null);openItemModal(mapSelectedItem);}}
                style={{background:'linear-gradient(135deg,#6366f1,#ec4899)',border:'none',borderRadius:'10px',padding:'9px 14px',color:'white',fontWeight:700,fontSize:'12px',cursor:'pointer',flexShrink:0}}>
                View
              </button>
            </div>
          ):(
            <div style={{background:'#1e293b',borderTop:'1px solid #334155',padding:'12px 16px'}}>
              <div style={{color:'#64748b',fontSize:'12px',textAlign:'center'}}>Tap a pin to see listing details</div>
            </div>
          )}
        </div>
      )}

      {/* ════════ M28: SAFE MEETING SPOTS MODAL ════════ */}`;

if (src.includes(BEFORE_TOAST)) {
  src = src.replace(BEFORE_TOAST, NEW_MODALS_BEFORE_TOAST);
} else {
  console.log('⚠️  M28 anchor not found, trying TOAST anchor directly...');
  src = src.replace(
    `      {/* ── TOAST ── */}`,
    NEW_MODALS_BEFORE_TOAST + '\n\n      {/* ── TOAST ── */}'
  );
}

// ─── 7. Wire FAB "+" button to open wizard instead of old create modal ─────────
// Find the FAB button click handler and redirect to wizard
const OLD_FAB = `onClick={()=>setNewListingOpen(true)}`;
const NEW_FAB = `onClick={()=>{setWizardStep(1);setWizardPublished(false);setWizardOpen(true);}}`;
if (src.includes(OLD_FAB)) {
  // Only replace the first occurrence (the FAB button)
  src = src.replace(OLD_FAB, NEW_FAB);
  console.log('   ✅ FAB "+" button wired to wizard');
} else {
  console.log('   ℹ️  FAB handler not found — wizard opens via its own trigger');
}

// ─── Write the patched file ───────────────────────────────────────────────────
fs.writeFileSync(FILE, src, 'utf8');
console.log('\n✅ MarketplacePage.jsx patched with Sprint 12 features!');
console.log('   M10: 4-step Create Listing wizard (Photos → Details → Price → Preview/Publish)');
console.log('   M26: Map view modal with OpenStreetMap embed + listing pins + item detail card');
console.log('   M8:  "View seller profile →" now navigates to /marketplace/seller/:name');
console.log('\n📝 App.jsx already updated with SellerProfilePage route (done via replace_in_file)');
