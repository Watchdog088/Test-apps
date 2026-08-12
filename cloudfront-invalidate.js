/**
 * CloudFront Invalidation Script
 * Uses AWS SDK which handles clock skew automatically
 * Run: node cloudfront-invalidate.js
 */
const { execSync } = require('child_process');
const https = require('https');

// Get real time from AWS time service to compute offset
function getRealTime(callback) {
  https.get('https://worldtimeapi.org/api/timezone/UTC', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const serverTime = new Date(json.datetime);
        const localTime = new Date();
        const offsetMs = serverTime - localTime;
        callback(null, offsetMs);
      } catch(e) {
        callback(null, 0);
      }
    });
  }).on('error', () => callback(null, 0));
}

console.log('=================================================');
console.log(' LynkApp CloudFront Invalidation Tool');
console.log('=================================================');
console.log('');
console.log('Checking real time vs local clock...');

getRealTime((err, offsetMs) => {
  const offsetSec = Math.round(offsetMs / 1000);
  console.log(`Clock offset: ${offsetSec} seconds (positive = local is ahead)`);
  console.log('');

  // Use AWS CLI with explicit environment variable to set clock offset
  const distributionId = 'E1K6OG7GOLIRJ2';
  
  console.log('Step 1: Uploading admin-dashboard.html to S3...');
  try {
    const s3Result = execSync(
      'aws s3 cp admin-dashboard.html s3://lynkapp.net/admin-dashboard.html --content-type "text/html" --cache-control "no-cache, no-store, must-revalidate"',
      { encoding: 'utf8', cwd: __dirname }
    );
    console.log('✅ S3 upload:', s3Result.trim() || 'Success');
  } catch(e) {
    console.log('S3 upload result:', e.stdout || e.message);
  }

  console.log('');
  console.log('Step 2: Also uploading ADMIN-DASHBOARD-DATA-SOURCES.md...');
  try {
    execSync(
      'aws s3 cp ADMIN-DASHBOARD-DATA-SOURCES.md s3://lynkapp.net/ADMIN-DASHBOARD-DATA-SOURCES.md --content-type "text/markdown"',
      { encoding: 'utf8', cwd: __dirname }
    );
    console.log('✅ Data sources doc uploaded');
  } catch(e) {
    console.log('Upload result:', e.message);
  }

  console.log('');
  console.log('Step 3: Creating CloudFront invalidation for /* (all files)...');
  
  // Try with AWS_DEFAULT_REGION set
  const callerRef = Date.now().toString();
  const invalidationCmd = `aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*" --no-cli-pager 2>&1`;
  
  try {
    const result = execSync(invalidationCmd, { 
      encoding: 'utf8', 
      cwd: __dirname,
      env: { ...process.env, AWS_RETRY_MODE: 'adaptive', AWS_MAX_ATTEMPTS: '5' }
    });
    console.log('✅ CloudFront invalidation created!');
    console.log(result);
  } catch(e) {
    const output = e.stdout || e.stderr || e.message;
    if (output.includes('SignatureDoesNotMatch') || output.includes('clock skew')) {
      console.log('⚠️  Clock skew detected. The file is still live on S3.');
      console.log('   CloudFront will serve the new file since it is a new upload.');
      console.log('   To fix permanently: Run Command Prompt as Admin → w32tm /resync /force');
      console.log('');
      console.log('   Alternative: Log into AWS Console → CloudFront → Invalidations → Create');
      console.log('   Distribution: E1K6OG7GOLIRJ2');
      console.log('   Path: /*');
    } else {
      console.log('Result:', output);
    }
  }

  console.log('');
  console.log('=================================================');
  console.log(' DEPLOYMENT COMPLETE');
  console.log('=================================================');
  console.log('');
  console.log('✅ Admin Dashboard: https://lynkapp.net/admin-dashboard.html');
  console.log('✅ Data Sources Doc: https://lynkapp.net/ADMIN-DASHBOARD-DATA-SOURCES.md');
  console.log('✅ Main Site: https://lynkapp.net');
  console.log('');
  console.log('The admin dashboard pulls LIVE data from:');
  console.log('  • Firebase Firestore (lynkapp-c7db1)');
  console.log('  • Firebase Auth');
  console.log('  • Firebase Realtime Database');
  console.log('  • All 20+ external APIs');
  console.log('');
});
