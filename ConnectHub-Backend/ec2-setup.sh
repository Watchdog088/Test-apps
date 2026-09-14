#!/bin/bash
# ============================================================
# LynkApp — EC2 Server Setup Script
# Run once on a fresh Amazon Linux 2 / Amazon Linux 2023 EC2
# The DEPLOY-BACKEND-EC2.bat uploads and calls this automatically
# ============================================================

set -e

echo ""
echo "============================================================"
echo "  LynkApp EC2 Server Setup"
echo "  $(date)"
echo "============================================================"
echo ""

# ── STEP 1: Update system packages ─────────────────────────────
echo "[1/9] Updating system packages..."
sudo dnf update -y 2>/dev/null || sudo yum update -y 2>/dev/null
echo "      Done."

# ── STEP 2: Install Node.js 20 ──────────────────────────────────
echo "[2/9] Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    # Amazon Linux 2023
    sudo dnf install -y nodejs npm 2>/dev/null || {
        # Amazon Linux 2 fallback — use NodeSource
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs
    }
fi
node --version
npm --version
echo "      Node.js installed."

# ── STEP 3: Install PM2 (process manager) ──────────────────────
echo "[3/9] Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    sudo pm2 startup systemd -u ec2-user --hp /home/ec2-user
fi
pm2 --version
echo "      PM2 installed."

# ── STEP 4: Install Nginx (reverse proxy for HTTPS) ────────────
echo "[4/9] Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo dnf install -y nginx 2>/dev/null || sudo yum install -y nginx 2>/dev/null
    sudo systemctl enable nginx
fi
echo "      Nginx installed."

# ── STEP 5: Install Certbot for SSL ────────────────────────────
echo "[5/9] Installing Certbot (for SSL/HTTPS)..."
if ! command -v certbot &> /dev/null; then
    sudo dnf install -y python3-certbot-nginx 2>/dev/null || {
        sudo yum install -y epel-release 2>/dev/null
        sudo yum install -y certbot python3-certbot-nginx 2>/dev/null
    }
fi
echo "      Certbot ready."

# ── STEP 6: Configure Nginx as reverse proxy ───────────────────
echo "[6/9] Configuring Nginx reverse proxy..."
sudo bash -c 'cat > /etc/nginx/conf.d/lynkapp-api.conf << EOF
server {
    listen 80;
    server_name api.lynkapp.net;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF'

sudo nginx -t && sudo systemctl restart nginx
echo "      Nginx configured."

# ── STEP 7: Open firewall ports ────────────────────────────────
echo "[7/9] Configuring firewall..."
# Note: AWS Security Group must also allow ports 80 and 443
# This just handles the local firewall if enabled
sudo firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true
sudo firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true
sudo firewall-cmd --permanent --add-port=5000/tcp 2>/dev/null || true
sudo firewall-cmd --reload 2>/dev/null || true
echo "      Ports 80, 443, 5000 opened."

# ── STEP 8: Set up log directory ────────────────────────────────
echo "[8/9] Setting up log directories..."
mkdir -p /home/ec2-user/logs
pm2 install pm2-logrotate 2>/dev/null || true
echo "      Logs directory ready."

# ── STEP 9: Display environment variable status ─────────────────
echo "[9/9] Checking .env configuration..."
ENV_FILE="/home/ec2-user/lynkapp-backend/.env"
if [ -f "$ENV_FILE" ]; then
    echo "      .env file found. Checking required variables:"
    
    check_var() {
        local VAR=$1
        local VAL=$(grep "^${VAR}=" "$ENV_FILE" | cut -d'=' -f2- | head -1)
        if [ -z "$VAL" ] || [ "$VAL" = "" ]; then
            echo "      ❌ MISSING: $VAR"
        elif echo "$VAL" | grep -qi "MISSING\|YOUR_\|CHANGE_ME\|placeholder"; then
            echo "      ⚠️  PLACEHOLDER: $VAR = $VAL"
        else
            echo "      ✅ SET: $VAR"
        fi
    }
    
    check_var "DATABASE_URL"
    check_var "REDIS_URL"
    check_var "JWT_SECRET"
    check_var "STRIPE_SECRET_KEY"
    check_var "STRIPE_WEBHOOK_SECRET"
    check_var "MUX_TOKEN_ID"
    check_var "MUX_WEBHOOK_SIGNING_SECRET"
    check_var "S3_BUCKET"
    check_var "AWS_REGION"
    check_var "CLOUDINARY_API_SECRET"
    check_var "FIREBASE_SERVICE_ACCOUNT"
else
    echo "      ❌ ERROR: .env file not found at $ENV_FILE"
fi

echo ""
echo "============================================================"
echo "  EC2 Setup Complete!"
echo ""
echo "  NEXT STEPS (run manually after DB is ready):"
echo ""
echo "  1. Update DATABASE_URL in .env to your RDS endpoint:"
echo "     nano /home/ec2-user/lynkapp-backend/.env"
echo ""
echo "  2. Run Prisma migrations:"
echo "     cd /home/ec2-user/lynkapp-backend"
echo "     npx prisma generate"
echo "     npx prisma migrate deploy"
echo ""
echo "  3. Start the server:"
echo "     pm2 start dist/server.js --name lynkapp-backend"
echo "     pm2 save"
echo ""
echo "  4. Enable HTTPS (after DNS points to this server):"
echo "     sudo certbot --nginx -d api.lynkapp.net"
echo ""
echo "  5. Test health endpoint:"
echo "     curl http://localhost:5000/health"
echo "============================================================"
echo ""
