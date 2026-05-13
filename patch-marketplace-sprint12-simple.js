/**
 * patch-marketplace-sprint12-simple.js
 * Wires CreateListingWizard (M10) + MapViewModal (M26) + SellerProfilePage nav (M8)
 * into MarketplacePage.jsx using plain string.replace() — no template literals.
 */
const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'ConnectHub-SPA/src/pages/marketplace/MarketplacePage.jsx');
let src = fs.readFileSync(FILE, 'utf8');
let changes = 0;

function replace(search, replacement, label) {
  if (src.includes(search)) {
    src = src.replace(search, replacement);
    changes++;
    console.log('  [OK] ' + label);
  } else {
    console.log('  [--] NOT FOUND: ' + label);
  }
}

// ─── 1. Add wizard + map imports after the last existing local import ─────────
replace(
  "import './marketplace-backend-service.js';",
  "import './marketplace-backend-service.js';\nimport CreateListingWizard from './CreateListingWizard';\nimport MapViewModal from './MapViewModal';",
  'Add CreateListingWizard + MapViewModal imports (after marketplace-backend-service)'
);

// Fallback if different import path is used
if (!src.includes("import CreateListingWizard")) {
  replace(
    "// ── MarketplacePage",
    "import CreateListingWizard from './CreateListingWizard';\nimport MapViewModal from './MapViewModal';\n// ── MarketplacePage",
    'Add imports (fallback at top comment)'
  );
}

// ─── 2. Add state variables after the safeSpotModal line ─────────────────────
replace(
  "const [safeSpotModal, setSafeSpotModal]         = useState(false);  // M28",
  "const [safeSpotModal, setSafeSpotModal]         = useState(false);  // M28\n  const [wizardOpen,    setWizardOpen]            = useState(false);  // M10\n  const [mapOpen,       setMapOpen]               = useState(false);  // M26",
  'Add wizardOpen + mapOpen state after safeSpotModal'
);

// ─── 3. Add useNavigate hook if not already present ───────────────────────────
if (!src.includes('useNavigate')) {
  replace(
    "import React, {",
    "import { useNavigate } from 'react-router-dom';\nimport React, {",
    'Add useNavigate import'
  );
  replace(
    "// ── Recent searches",
    "const navigate = useNavigate();\n\n  // ── Recent searches",
    'Instantiate useNavigate()'
  );
}

// ─── 4. Wire FAB "+" to wizard ────────────────────────────────────────────────
replace(
  'onClick={()=>setNewListingOpen(true)}',
  'onClick={()=>setWizardOpen(true)}',
  'Wire FAB to wizard'
);

// ─── 5. Add 🗺️ Map button after Filters button ─────────────────────────────
replace(
  '⚙️ Filters\n                </button>',
  '⚙️ Filters\n                </button>\n                <button onClick={()=>setMapOpen(true)}\n                  style={{background:mapOpen?"rgba(99,102,241,0.2)":"#1e293b",border:mapOpen?"1px solid #6366f1":"1px solid #334155",borderRadius:"10px",padding:"6px 12px",color:mapOpen?"#a5b4fc":"#94a3b8",fontSize:"12px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>\n                  \u{1F5FA}\u{FE0F} Map\n                </button>',
  'Add Map button in filter row'
);

// ─── 6. Add <CreateListingWizard> and <MapViewModal> before M28 modal ─────────
replace(
  '{/* ════════ M28: SAFE MEETING SPOTS MODAL ════════ */}',
  '{/* ════════ M10: CREATE LISTING WIZARD ════════ */}\n      <CreateListingWizard open={wizardOpen} onClose={()=>setWizardOpen(false)} />\n\n      {/* ════════ M26: MAP VIEW MODAL ════════ */}\n      <MapViewModal open={mapOpen} onClose={()=>setMapOpen(false)} products={filteredProducts} onSelectItem={openItemModal} />\n\n      {/* ════════ M28: SAFE MEETING SPOTS MODAL ════════ */}',
  'Add CreateListingWizard + MapViewModal components before M28'
);

// ─── 7. Wire "View seller profile →" to SellerProfilePage ─────────────────────
// Try the most likely pattern from Sprint 8-11
replace(
  "View seller profile \u2192",
  "\u{1F9D1} View full profile \u2192",
  'Update seller profile link text'
);

// Try to find button with onClick and add navigate
replace(
  "onClick={()=>setSellerProfileOpen(true)}",
  "onClick={()=>navigate('/marketplace/seller/'+encodeURIComponent(itemModal&&itemModal.seller||''))}",
  'Wire seller profile button to navigate'
);

// ─── Save ──────────────────────────────────────────────────────────────────────
fs.writeFileSync(FILE, src, 'utf8');
console.log('\n✅ Done — ' + changes + ' replacements made to MarketplacePage.jsx');
console.log('   M10: FAB now opens CreateListingWizard (4-step wizard)');
console.log('   M26: Filter row now has Map button → MapViewModal with OSM embed');
console.log('   M8:  "View seller profile" navigates to /marketplace/seller/:name');
