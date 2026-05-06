/**
 * FIX #1 — Slim Down index.html
 * Adds data-lazy attributes to all 25 section divs
 * and replaces their massive inner content with a loading skeleton.
 * The section-loader.js will then fetch each section on demand.
 *
 * Run from inside LynkApp-Production-App/:
 *   node fix1-slim-index.js
 */

'use strict';
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('ERROR: index.html not found. Run this from inside LynkApp-Production-App/');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// ── Map: screen element ID  →  section file to lazy-load ──────────────────
const sectionMap = {
  'feed-screen':           'sections/feed.html',
  'stories-screen':        'sections/stories.html',
  'live-screen':           'sections/live.html',
  'trending-screen':       'sections/trending.html',
  'groups-screen':         'sections/groups.html',
  'friends-screen':        'sections/friends.html',
  'dating-screen':         'sections/dating.html',
  'profile-screen':        'sections/profile.html',
  'saved-screen':          'sections/saved.html',
  'events-screen':         'sections/events.html',
  'gaming-screen':         'sections/gaming.html',
  'media-screen':          'sections/media.html',
  'business-screen':       'sections/business.html',
  'creator-screen':        'sections/creator.html',
  'premium-screen':        'sections/premium.html',
  'settings-screen':       'sections/settings.html',
  'messages-screen':       'sections/messages.html',
  'notifications-screen':  'sections/notifications.html',
  'help-screen':           'sections/help.html',
  'menu-screen':           'sections/menu.html',
  'marketplace-screen':    'sections/marketplace.html',
  'musicPlayer-screen':    'sections/musicPlayer.html',
  'liveStreaming-screen':  'sections/liveStreaming.html',
  'videoCalls-screen':     'sections/videoCalls.html',
  'arVR-screen':           'sections/arVR.html',
};

// ── Finds the position of the matching </div> for an already-opened <div> ──
// openTagEnd = index right after the '>' of the opening tag
function findMatchingClose(source, openTagEnd) {
  let depth = 1;
  let i = openTagEnd;

  while (i < source.length && depth > 0) {
    const nextOpen  = source.indexOf('<div', i);
    const nextClose = source.indexOf('</div', i);

    if (nextClose === -1) break; // malformed

    if (nextOpen !== -1 && nextOpen < nextClose) {
      // another opening div before next close — go deeper
      depth++;
      i = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) return nextClose;
      i = nextClose + 6;
    }
  }
  return -1;
}

// ── Loading skeleton injected inside each slimmed section div ──────────────
const skeleton = [
  '',
  '            <div class="section-loading-skeleton"',
  '                 style="display:flex;align-items:center;justify-content:center;',
  '                        padding:60px;color:rgba(255,255,255,0.35);font-size:14px;">',
  '                <div style="text-align:center;">',
  '                    <div style="font-size:32px;margin-bottom:12px;animation:spin 1s linear infinite;">⟳</div>',
  '                    Loading…',
  '                </div>',
  '            </div>',
  '        ',
].join('\n');

const originalSize = html.length;
let replaced = 0;
let skipped  = 0;
let missing  = 0;

for (const [screenId, sectionFile] of Object.entries(sectionMap)) {
  const idAttr = `id="${screenId}"`;
  const idPos  = html.indexOf(idAttr);

  if (idPos === -1) {
    console.log(`⚠️  NOT FOUND in HTML: ${screenId}`);
    missing++;
    continue;
  }

  // Walk backwards from id= to find the start of the opening <div tag
  const divStart = html.lastIndexOf('<div', idPos);
  if (divStart === -1) { missing++; continue; }

  // Find the end of the opening tag (closing '>')
  let tagEnd = html.indexOf('>', idPos);
  if (tagEnd === -1) { missing++; continue; }
  tagEnd++; // position after '>'

  const openTag = html.substring(divStart, tagEnd);

  if (openTag.includes('data-lazy')) {
    console.log(`✓  Already slim: ${screenId}`);
    skipped++;
    continue;
  }

  // Find the matching </div> for this section
  const closeStart = findMatchingClose(html, tagEnd);
  if (closeStart === -1) {
    console.log(`⚠️  Can't find close-div for: ${screenId}`);
    missing++;
    continue;
  }

  // Build new opening tag — insert data-lazy just before the final '>'
  const newOpenTag = openTag.slice(0, -1) + ` data-lazy="${sectionFile}">`;

  // Reassemble: everything-before + new-tag + skeleton + </div> + everything-after
  html = html.substring(0, divStart)
       + newOpenTag
       + skeleton
       + '</div>'
       + html.substring(closeStart + 6); // 6 = length of '</div>'

  console.log(`✅ Slimmed: ${screenId}  →  ${sectionFile}`);
  replaced++;
}

// ── Save ───────────────────────────────────────────────────────────────────
// Back up the original first (only once)
const backupPath = path.join(__dirname, 'index.html.pre-fix1');
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(indexPath, backupPath);
  console.log(`\n📁 Backup saved: index.html.pre-fix1`);
}

fs.writeFileSync(indexPath, html, 'utf8');

const newSize = html.length;
const savedKB = Math.round((originalSize - newSize) / 1024);

console.log('\n─────────────────────────────────────────');
console.log(`✅  Sections slimmed : ${replaced}`);
console.log(`⏭   Already slim     : ${skipped}`);
console.log(`⚠️   Could not find   : ${missing}`);
console.log(`📦  Before           : ${Math.round(originalSize / 1024)} KB`);
console.log(`📦  After            : ${Math.round(newSize / 1024)} KB`);
console.log(`💾  Saved            : ~${savedKB} KB`);
console.log('─────────────────────────────────────────');
console.log('Next step: serve with "npx serve ." and open in browser to test.');
