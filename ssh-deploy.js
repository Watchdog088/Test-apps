/**
 * ssh-deploy.js — Deploys LynkApp backend to EC2 using Node.js ssh2 library
 * Usage: node ssh-deploy.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const EC2_IP = '100.48.76.239';
const KEY_PATH = path.join(process.env.USERPROFILE || process.env.HOME, '.ssh', 'lynkapp-key.pem');
const BACKEND_DIR = path.join(__dirname, 'ConnectHub-Backend');
const SSH_OPTS = `-i "${KEY_PATH}" -o StrictHostKeyChecking=no -o ConnectTimeout=20 -o BatchMode=yes`;

function run(cmd, label) {
  console.log(`\n▶ ${label}`);
  try {
    const out = execSync(cmd, { encoding: 'utf8', timeout: 120000 });
    console.log(out.trim());
    return out;
  } catch (e) {
    console.error(`✗ ${label} failed:`, e.message);
    return null;
  }
}

function ssh(remoteCmd) {
  return run(`ssh ${SSH_OPTS} ec2-user@${EC2_IP} "${remoteCmd.replace(/"/g, '\\"')}"`, remoteCmd.substring(0, 60));
}

function scp(localPath, remotePath) {
  return run(`scp ${SSH_OPTS} -r "${localPath}" ec2-user@${EC2_IP}:${remotePath}`, `scp ${path.basename(localPath)}`);
}

async function deploy() {
  console.log('='.repeat(60));
  console.log(' LynkApp Backend Deployment to ' + EC2_IP);
  console.log('='.repeat(60));

  // Test SSH
  const test = ssh('echo SSH_OK && uname -a');
  if (!test || !test.includes('SSH_OK')) {
    console.error('SSH connection failed. Make sure port 22 is open.');
    process.exit(1);
  }

  // Create directories
  ssh('mkdir -p /home/ec2-user/lynkapp-backend');

  // Upload files
  console.log('\n▶ Uploading backend files...');
  scp(path.join(BACKEND_DIR, 'src'), '/home/ec2-user/lynkapp-backend/');
  scp(path.join(BACKEND_DIR, 'prisma'), '/home/ec2-user/lynkapp-backend/');
  scp(path.join(BACKEND_DIR, 'package.json'), '/home/ec2-user/lynkapp-backend/');

  const tsconfig = path.join(BACKEND_DIR, 'tsconfig.json');
  if (fs.existsSync(tsconfig)) scp(tsconfig, '/home/ec2-user/lynkapp-backend/');

  const envFile = path.join(BACKEND_DIR, '.env.production');
  if (fs.existsSync(envFile)) {
    scp(envFile, '/home/ec2-user/lynkapp-backend/.env');
  } else {
    console.warn('⚠ .env.production not found — skipping. Server may fail to start without it.');
  }

  // Install, build, migrate
  ssh('cd /home/ec2-user/lynkapp-backend && npm install 2>&1 | tail -3');
  ssh('cd /home/ec2-user/lynkapp-backend && npx tsc --skipLibCheck 2>&1 | tail -5');
  ssh('cd /home/ec2-user/lynkapp-backend && npx prisma generate 2>&1 | tail -3');
  ssh('cd /home/ec2-user/lynkapp-backend && npx prisma migrate deploy 2>&1 | tail -5');

  // Start PM2
  ssh('pm2 stop lynkapp-backend 2>/dev/null || true');
  ssh('cd /home/ec2-user/lynkapp-backend && pm2 start dist/server.js --name lynkapp-backend');
  ssh('pm2 save');

  // Test health
  setTimeout(() => {
    const health = ssh('curl -s http://localhost:5000/health');
    console.log('\n' + '='.repeat(60));
    console.log(' DEPLOYMENT COMPLETE');
    console.log('='.repeat(60));
    console.log(' Health endpoint: http://' + EC2_IP + ':5000/health');
    console.log(' SSH: ssh -i ' + KEY_PATH + ' ec2-user@' + EC2_IP);
    console.log(' Logs: pm2 logs lynkapp-backend');
  }, 3000);
}

deploy();
