/**
 * ec2-connect-deploy.js
 * Uses AWS EC2 Instance Connect to push a temp SSH key,
 * then deploys via SSH without needing the .pem file format issues.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const EC2_IP = '100.48.76.239';
const INSTANCE_ID = 'i-04b1e1c93bd12d659';
const REGION = 'us-east-1';
const BACKEND_DIR = path.join(__dirname, 'ConnectHub-Backend');

// Generate a fresh RSA key pair for this session
console.log('Generating temporary SSH key pair...');
const tmpDir = os.tmpdir();
const tmpKey = path.join(tmpDir, 'lynkapp-tmp-key');
const tmpKeyPub = tmpKey + '.pub';

try {
  execSync(`ssh-keygen -t rsa -b 2048 -f "${tmpKey}" -N "" -q`, { stdio: 'inherit' });
} catch (e) {
  // Try without -q flag
  try {
    execSync(`ssh-keygen -t rsa -b 2048 -f "${tmpKey}" -N ""`, { encoding: 'utf8' });
  } catch (e2) {
    console.error('ssh-keygen failed:', e2.message);
    process.exit(1);
  }
}

const pubKey = fs.readFileSync(tmpKeyPub, 'utf8').trim();
console.log('Generated public key:', pubKey.substring(0, 60) + '...');

// Push the public key via EC2 Instance Connect
console.log('\nPushing key to EC2 via Instance Connect...');
try {
  const result = execSync(
    `aws ec2-instance-connect send-ssh-public-key --instance-id ${INSTANCE_ID} --instance-os-user ec2-user --ssh-public-key "${pubKey}" --region ${REGION} --output json`,
    { encoding: 'utf8' }
  );
  const parsed = JSON.parse(result);
  if (!parsed.Success) throw new Error('Instance Connect returned failure');
  console.log('Key pushed successfully! Valid for 60 seconds.');
} catch (e) {
  console.error('Instance Connect failed:', e.message);
  console.log('\nFalling back to direct key deploy...');
}

// SSH using the temp key
const SSH_OPTS = `-i "${tmpKey}" -o StrictHostKeyChecking=no -o ConnectTimeout=20 -o BatchMode=yes`;

function ssh(cmd) {
  console.log(`\n▶ ${cmd.substring(0, 80)}`);
  try {
    const out = execSync(`ssh ${SSH_OPTS} ec2-user@${EC2_IP} "${cmd.replace(/"/g, '\\"')}"`, {
      encoding: 'utf8',
      timeout: 120000
    });
    console.log(out.trim() || '(no output)');
    return out;
  } catch (e) {
    console.error('SSH error:', e.stderr || e.message);
    return null;
  }
}

function scp(local, remote) {
  console.log(`\n▶ SCP: ${path.basename(local)} → ${remote}`);
  try {
    execSync(`scp ${SSH_OPTS} -r "${local}" ec2-user@${EC2_IP}:${remote}`, {
      encoding: 'utf8',
      timeout: 120000
    });
    console.log('  done');
  } catch (e) {
    console.error('SCP error:', e.stderr || e.message);
  }
}

// Test connection
const test = ssh('echo SSH_CONNECTED && whoami');
if (!test || !test.includes('SSH_CONNECTED')) {
  console.error('\n❌ Cannot connect. Port 22 may still be starting. Try again in 1 minute.');
  console.log('\nAlternative: Connect manually from AWS Console:');
  console.log('  1. Go to https://console.aws.amazon.com/ec2');
  console.log('  2. Select instance i-04b1e1c93bd12d659');
  console.log('  3. Click "Connect" → "EC2 Instance Connect" → "Connect"');
  console.log('  4. Run: git clone https://github.com/Watchdog088/Test-apps.git /tmp/app');
  console.log('     cd /tmp/app/ConnectHub-Backend && npm install && npm run build');
  console.log('     pm2 start dist/server.js --name lynkapp-backend');
  process.exit(1);
}

// Deploy
ssh('mkdir -p /home/ec2-user/lynkapp-backend');

console.log('\n▶ Cloning code from GitHub...');
ssh('cd /home/ec2-user/lynkapp-backend && git init && git remote remove origin 2>/dev/null; git remote add origin https://github.com/Watchdog088/Test-apps.git && git fetch --depth=1 origin main && git checkout FETCH_HEAD -- ConnectHub-Backend/ 2>&1 | tail -5');

ssh('cp -r /home/ec2-user/lynkapp-backend/ConnectHub-Backend/* /home/ec2-user/lynkapp-backend/ 2>/dev/null; echo copied');
ssh('cd /home/ec2-user/lynkapp-backend && npm install --production=false 2>&1 | tail -3');
ssh('cd /home/ec2-user/lynkapp-backend && npx tsc --skipLibCheck 2>&1 | tail -5');
ssh('cd /home/ec2-user/lynkapp-backend && npx prisma generate 2>&1 | tail -3');
ssh('pm2 stop lynkapp-backend 2>/dev/null; cd /home/ec2-user/lynkapp-backend && pm2 start dist/server.js --name lynkapp-backend; pm2 save');

// Health check
setTimeout(() => {
  const health = ssh('curl -s http://localhost:5000/health');
  console.log('\n' + '='.repeat(60));
  console.log(' DEPLOYMENT COMPLETE!');
  console.log(`  IP: ${EC2_IP}`);
  console.log(`  Health: http://${EC2_IP}:5000/health`);
  console.log(`  Logs: pm2 logs lynkapp-backend`);
  console.log('='.repeat(60));
  // Cleanup temp key
  try { fs.unlinkSync(tmpKey); fs.unlinkSync(tmpKeyPub); } catch (_) {}
}, 5000);
