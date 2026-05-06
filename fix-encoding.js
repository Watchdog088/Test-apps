/**
 * fix-encoding.js
 * Fixes Mojibake (double-encoded UTF-8) in LynkApp-Production-App/index.html
 * The file's emoji/special chars were encoded as cp1252 then stored as UTF-8,
 * producing garbled output. This reverses that: treats each char as cp1252,
 * collects the original bytes, and re-decodes as UTF-8.
 */

const fs = require('fs');
const path = require('path');

// Windows-1252 special mapping for bytes 0x80-0x9F
const cp1252map = {
  0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026,
  0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160,
  0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D,
  0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022,
  0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161,
  0x9B: 0x203A, 0x9C: 0x0153, 0x9E: 0x017E, 0x9F: 0x0178
};

// Build reverse mapping: Unicode codepoint → cp1252 byte value
const cp1252reverse = {};
// Standard Latin-1 range (0x00-0x7F and 0xA0-0xFF map directly)
for (let i = 0; i <= 0xFF; i++) {
  cp1252reverse[i] = i; // default: codepoint == byte value for 0x00-0xFF
}
// Override with cp1252 special chars (0x80-0x9F range)
for (const [byteVal, codePoint] of Object.entries(cp1252map)) {
  cp1252reverse[codePoint] = parseInt(byteVal);
}

function fixMojibake(content) {
  const bytes = [];
  let i = 0;
  while (i < content.length) {
    const codePoint = content.codePointAt(i);
    const isSupplementary = codePoint > 0xFFFF;

    if (codePoint <= 0x7F) {
      // Plain ASCII - pass through as-is
      bytes.push(codePoint);
    } else if (cp1252reverse[codePoint] !== undefined) {
      // Character exists in cp1252 encoding - convert back to byte
      bytes.push(cp1252reverse[codePoint]);
    } else {
      // Character not in cp1252 (shouldn't happen after fix, but be safe)
      // Encode as UTF-8 directly
      const encoded = Buffer.from(String.fromCodePoint(codePoint), 'utf8');
      for (const b of encoded) bytes.push(b);
    }

    i += isSupplementary ? 2 : 1; // Supplementary chars use 2 UTF-16 code units
  }
  return Buffer.from(bytes).toString('utf8');
}

const filePath = path.join(__dirname, 'LynkApp-Production-App', 'index.html');
console.log('Reading:', filePath);
const original = fs.readFileSync(filePath, 'utf8');
console.log('Original length:', original.length);

// Quick sanity check - look for known mojibake pattern
if (!original.includes('ðŸ"—') && !original.includes('â€¢')) {
  console.log('File does not appear to have Mojibake. Aborting to be safe.');
  process.exit(0);
}

console.log('Mojibake detected. Fixing...');
const fixed = fixMojibake(original);
console.log('Fixed length:', fixed.length);

// Backup original
fs.writeFileSync(filePath + '.backup', original, 'utf8');
console.log('Backup saved to index.html.backup');

// Write fixed file
fs.writeFileSync(filePath, fixed, 'utf8');
console.log('Done! index.html has been fixed.');

// Verify fix
if (fixed.includes('🔗') || fixed.includes('•')) {
  console.log('✅ Verification passed - emoji characters look correct.');
} else {
  console.log('⚠️  Could not verify fix - please check manually.');
}
