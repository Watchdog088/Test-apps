/**
 * LynkApp Monolith Splitter
 * Extracts 25 screen sections from index.html into separate HTML snippet files
 * and replaces them with lazy-load placeholders
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname);
const HTML_FILE = path.join(BASE, 'index.html');
const SECTIONS_DIR = path.join(BASE, 'sections');

// Make sure sections directory exists
if (!fs.existsSync(SECTIONS_DIR)) fs.mkdirSync(SECTIONS_DIR);

let html = fs.readFileSync(HTML_FILE, 'utf8');

// Screens to extract (all except feed which loads first)
const SCREENS_TO_EXTRACT = [
  'stories', 'live', 'trending', 'groups', 'friends',
  'dating', 'profile', 'saved', 'events', 'gaming',
  'media', 'musicPlayer', 'liveStreaming', 'videoCalls',
  'arVR', 'business', 'creator', 'premium', 'settings',
  'messages', 'notifications', 'help', 'menu', 'marketplace'
];

let extractedCount = 0;
let totalBytesSaved = 0;

for (const screenId of SCREENS_TO_EXTRACT) {
  const fullId = `${screenId}-screen`;
  
  // Find the screen div start — look for the opening tag with this ID
  const openTagPattern = new RegExp(`<div[^>]+id="${fullId}"[^>]*>`, 'i');
  const openTagMatch = html.match(openTagPattern);
  
  if (!openTagMatch) {
    console.log(`  ⚠️  Screen not found: ${fullId}`);
    continue;
  }
  
  const openTagIndex = html.indexOf(openTagMatch[0]);
  
  // Walk forward to find the matching closing </div>
  let depth = 0;
  let pos = openTagIndex;
  let inTag = false;
  let tagStart = -1;
  let foundClose = -1;
  
  while (pos < html.length) {
    if (html[pos] === '<') {
      inTag = true;
      tagStart = pos;
    }
    
    if (inTag && html[pos] === '>') {
      const tag = html.slice(tagStart, pos + 1);
      inTag = false;
      
      if (/^<div/i.test(tag) && !/\/>$/.test(tag)) {
        depth++;
      } else if (/^<\/div>/i.test(tag)) {
        depth--;
        if (depth === 0) {
          foundClose = pos + 1;
          break;
        }
      }
    }
    pos++;
  }
  
  if (foundClose === -1) {
    console.log(`  ⚠️  Could not find closing div for: ${fullId}`);
    continue;
  }
  
  const screenHtml = html.slice(openTagIndex, foundClose);
  const outputFile = path.join(SECTIONS_DIR, `${screenId}.html`);
  
  fs.writeFileSync(outputFile, screenHtml, 'utf8');
  
  const savedBytes = screenHtml.length;
  totalBytesSaved += savedBytes;
  
  // Replace in main HTML with a lightweight placeholder
  const placeholder = `<div class="screen" id="${fullId}" data-lazy="sections/${screenId}.html"></div>`;
  html = html.slice(0, openTagIndex) + placeholder + html.slice(foundClose);
  
  console.log(`  ✅ Extracted: ${fullId} (${Math.round(savedBytes/1024)}KB → sections/${screenId}.html)`);
  extractedCount++;
}

// Write updated index.html
fs.writeFileSync(HTML_FILE, html, 'utf8');

const newSize = Buffer.byteLength(html, 'utf8');
console.log(`\n✅ Done! Extracted ${extractedCount} sections`);
console.log(`  Removed from index.html: ${Math.round(totalBytesSaved/1024)}KB`);
console.log(`  New index.html size: ${Math.round(newSize/1024)}KB (was 585KB)`);
