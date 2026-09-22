#!/bin/bash
# ============================================================
# LynkApp EC2 User-Data Script
# This runs AUTOMATICALLY when EC2 first boots
# Installs Node.js, PM2, Nginx, Redis, and clones the backend
# ============================================================

set -e

# Log everything
exec > >(tee /var/log/userdata.log|logger -t userdata -s 2>/dev/console) 2>&1

echo "========================================================"
echo "  LynkApp EC2 User-Data Boot Script Starting"
echo "  $(date)"
echo "========================================================"

# ── Update system packages ─────────────────────────────────
echo "[1/8] Updating system packages..."
dnf update -y 2>/dev/null || yum update -y 2>/dev/null

# ── Install Node.js 20 ──────────────────────────────────────
echo "[2/8] Installing Node.js 20..."
dnf install -y nodejs npm 2>/dev/null || {
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
}
node --version && npm --version

# ── Install PM2 ─────────────────────────────────────────────
echo "[3/8] Installing PM2..."
npm install -g pm2
pm2 startup systemd -u ec2-user --hp /home/ec2-user

# ── Install Nginx ────────────────────────────────────────────
echo "[4/8] Installing Nginx..."
dnf install -y nginx 2>/dev/null || yum install -y nginx 2>/dev/null
systemctl enable nginx
systemctl start nginx

# ── Install Redis (local, avoids ElastiCache cost) ──────────
echo "[5/8] Installing Redis..."
dnf install -y redis6 2>/dev/null || {
    dnf install -y redis 2>/dev/null || yum install -y redis 2>/dev/null
}
systemctl enable redis6 2>/dev/null || systemctl enable redis 2>/dev/null
systemctl start redis6 2>/dev/null || systemctl start redis 2>/dev/null
echo "Redis running: $(redis-cli ping)"

# ── Configure Nginx reverse proxy ───────────────────────────
echo "[6/8] Configuring Nginx..."
cat > /etc/nginx/conf.d/lynkapp-api.conf << 'NGINXCONF'
server {
    listen 80;
    server_name _;

    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
NGINXCONF

nginx -t && systemctl restart nginx

# ── Create app directory ─────────────────────────────────────
echo "[7/8] Creating app directory..."
mkdir -p /home/ec2-user/lynkapp-backend
chown -R ec2-user:ec2-user /home/ec2-user/lynkapp-backend

# ── Install git and clone from GitHub ───────────────────────
echo "[8/8] Installing git..."
dnf install -y git 2>/dev/null || yum install -y git 2>/dev/null

echo ""
echo "========================================================"
echo "  EC2 User-Data Setup COMPLETE!"
echo "  $(date)"
echo ""
echo "  NEXT: SCP your backend files and .env, then run:"
echo "    ssh -i lynkapp-key.pem ec2-user@THIS_IP"
echo "    cd /home/ec2-user/lynkapp-backend"
echo "    npm install"
echo "    npx prisma migrate deploy"
echo "    pm2 start dist/server.js --name lynkapp-backend"
echo "    pm2 save"
echo "========================================================"
