/**
 * fix-service-key.js
 * Repairs serviceAccountKey.json when the private_key contains
 * actual newlines instead of \n escape sequences (Windows copy artefact).
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const keyPath = path.resolve(__dirname, 'serviceAccountKey.json');
let raw = fs.readFileSync(keyPath, 'utf8');

// First, try to parse as-is
let parsed;
try {
  parsed = JSON.parse(raw);
  console.log('✅ JSON already valid — no repair needed.');
  process.exit(0);
} catch (_) {
  console.log('⚠️  JSON invalid — attempting repair...');
}

// Strategy: extract everything, then re-join lines inside the private_key value.
// Approach: split on the pattern that starts/ends the private_key block.
//   "private_key": "<BEGIN...  (possible real newlines) ...END...>"
const pkStart = raw.indexOf('"private_key"');
if (pkStart === -1) {
  console.error('❌ Could not find "private_key" field — cannot repair.');
  process.exit(1);
}

// Find the opening quote after the colon
const colon    = raw.indexOf(':', pkStart);
const openQ    = raw.indexOf('"', colon + 1);
// Find the closing quote — the private key value ends at a " not preceded by \
let closeQ = openQ + 1;
while (closeQ < raw.length) {
  if (raw[closeQ] === '"' && raw[closeQ - 1] !== '\\') break;
  closeQ++;
}

const before = raw.slice(0, openQ + 1);
const value  = raw.slice(openQ + 1, closeQ);
const after  = raw.slice(closeQ);

// Replace any real newlines/CRs inside the value with \n
const fixedValue = value.replace(/\r\n/g, '\\n').replace(/\r/g, '\\n').replace(/\n/g, '\\n');

const repaired = before + fixedValue + after;

// Verify it parses now
try {
  parsed = JSON.parse(repaired);
} catch (e) {
  console.error('❌ Repair failed — JSON still invalid:', e.message);
  process.exit(1);
}

fs.writeFileSync(keyPath, repaired, 'utf8');
console.log('✅ serviceAccountKey.json repaired and saved!');
console.log('   project_id:', parsed.project_id);
console.log('   client_email:', parsed.client_email);
