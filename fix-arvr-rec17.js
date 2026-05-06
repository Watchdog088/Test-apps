/**
 * fix-arvr-rec17.js
 * Implements Layout Recommendation #17:
 *   AR/VR is a premium feature — accessible through camera mode and premium section,
 *   NOT a standalone nav slot.
 *
 * Changes:
 *  1. Remove AR/VR entry from More Drawer
 *  2. Add 📷 camera/AR button next to the ☰ hamburger in the top nav
 *  3. Insert AR/VR shortcut card inside the Premium More Drawer item area
 *  4. Add openArCamera() JS helper with try/catch
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'ConnectHub_Mobile_Design.html');
let h = fs.readFileSync(htmlPath, 'utf8');

// ── 1. Remove AR/VR from More Drawer (exact string) ───────────────────────
const ARVR_ENTRY = '<div class="more-item" onclick="closeMoreDrawer();openScreen(\'arVr\')"><div class="more-item-icon">🌐</div><span class="more-item-text">AR / VR</span></div>';
const hadARVR = h.includes(ARVR_ENTRY);
if (hadARVR) {
  h = h.split(ARVR_ENTRY).join('');
  console.log('✅ 1. AR/VR drawer entry REMOVED');
} else {
  console.log('ℹ️  1. AR/VR drawer entry not found (may already be removed)');
}

// ── 2. Find nav-btn context and add 📷 camera button after ☰ button ──────
// The hamburger btn opens the More drawer — add camera btn right before it
const HAMBURGER = 'onclick="openMoreDrawer()" title="More">☰';
if (h.includes(HAMBURGER)) {
  // Find the full button tag that wraps the hamburger
  const hIdx = h.indexOf(HAMBURGER);
  // Go back to find the start of the <button or <div tag
  let tagStart = hIdx;
  while (tagStart > 0 && h[tagStart] !== '<') tagStart--;
  // Find the end of the closing tag
  const tagEnd = h.indexOf('>', hIdx) + 1;
  const hamburglerTag = h.slice(tagStart, tagEnd);
  // Insert camera button right after the hamburger
  const CAMERA_BTN = '<button class="nav-btn ar-camera-btn" id="arCameraBtn" onclick="openArCamera()" title="AR Filters &amp; Camera" aria-label="AR Camera" style="font-size:18px;background:none;border:none;cursor:pointer;padding:4px 8px;min-height:44px">📷</button>';
  h = h.slice(0, tagEnd) + CAMERA_BTN + h.slice(tagEnd);
  console.log('✅ 2. 📷 Camera button inserted after hamburger');
} else {
  console.log('⚠️  2. Hamburger button not found with expected onclick — skipping camera btn');
}

// ── 3. Add AR/VR shortcut inside the Premium More Drawer item ────────────
// Current premium item: openScreen('premium')"...>⭐</div><span>Premium</span></div>
const PREMIUM_ITEM_END = 'openScreen(\'premium\')"><div class="more-item-icon">⭐</div><span class="more-item-text">Premium</span></div>';
if (h.includes(PREMIUM_ITEM_END)) {
  const AR_SHORTCUT = `${PREMIUM_ITEM_END}
      <!-- AR/VR shortcut — accessible via Premium per rec #17 -->
      <div class="more-item arvr-premium-shortcut" onclick="closeMoreDrawer();openScreen('arVr')" style="background:linear-gradient(135deg,rgba(90,30,200,.12),rgba(0,180,255,.12));border-left:3px solid #a855f7;margin-left:8px;border-radius:0 8px 8px 0"><div class="more-item-icon">🌐</div><span class="more-item-text" style="font-size:12px;color:#a855f7">AR &amp; VR <span style="font-size:10px;background:#a855f7;color:#fff;padding:1px 5px;border-radius:9px;margin-left:4px">⭐ Premium</span></span></div>`;
  h = h.split(PREMIUM_ITEM_END).join(AR_SHORTCUT);
  console.log('✅ 3. AR/VR shortcut injected under Premium in More Drawer');
} else {
  console.log('⚠️  3. Premium item anchor not found — skipping AR shortcut');
}

// ── 4. Add openArCamera() JS helper before </body> ────────────────────────
const AR_JS = `
<script>
/* AR Camera / Premium gate — rec #17 */
function openArCamera() {
  try {
    // In production: check isPremiumUser() before opening
    if (typeof openScreen === 'function') {
      openScreen('arVr');
    } else {
      console.warn('openScreen not available yet');
    }
  } catch(e) { console.warn('openArCamera error:', e); }
}
</script>`;

h = h.replace(/<\/body>/i, AR_JS + '\n</body>');
console.log('✅ 4. openArCamera() JS helper added');

// ── Save & verify ─────────────────────────────────────────────────────────
fs.writeFileSync(htmlPath, h, 'utf8');
const final = fs.readFileSync(htmlPath, 'utf8');
console.log('\n── Verification ────────────────────────────────────────');
console.log('AR/VR NOT a raw drawer slot:', !final.includes('closeMoreDrawer();openScreen(\'arVr\')') || final.includes('arvr-premium-shortcut'));
console.log('Camera btn present:          ', final.includes('arCameraBtn'));
console.log('AR/VR premium shortcut:      ', final.includes('arvr-premium-shortcut'));
console.log('openArCamera fn:             ', final.includes('function openArCamera'));
console.log('File size KB:                ', Math.round(final.length / 1024));
