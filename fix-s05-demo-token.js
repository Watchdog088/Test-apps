// fix-s05-demo-token.js — S-05 Security Fix: Remove hardcoded demo auth tokens
const fs = require('fs');

const OLD = `return localStorage.getItem('authToken') || 'demo_token_123';`;
const NEW = `// S-05 FIX: No hardcoded fallback token — authentication required
        const _authToken = localStorage.getItem('authToken');
        if (!_authToken) { throw new Error('[S-05] No auth token — user must be signed in.'); }
        return _authToken;`;

const files = [
  'ConnectHub-Frontend/src/services/dating-api-service.js',
  'ConnectHub-Frontend/src/services/stories-api-service.js',
  'ConnectHub-Frontend/src/services/complete-features-integration.js',
];

files.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf8');
    const count = content.split(OLD).length - 1;
    if (count === 0) {
      console.log(`SKIP (not found): ${f}`);
      return;
    }
    content = content.split(OLD).join(NEW);
    fs.writeFileSync(f, content, 'utf8');
    console.log(`FIXED ${count} occurrence(s) in: ${f}`);
  } catch (e) {
    console.error(`ERROR on ${f}: ${e.message}`);
  }
});

console.log('S-05 fix complete.');
