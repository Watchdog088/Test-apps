#!/bin/bash

# ConnectHub Production Deployment Script
# Usage: ./deploy-production.sh [option]
# Options: quick, professional, enterprise

set -e

echo "🚀 ConnectHub Production Deployment"
echo "=================================="

# Parse deployment option
DEPLOYMENT_TYPE=${1:-quick}

echo "📋 Deployment Type: $DEPLOYMENT_TYPE"

# Step 1: Environment Setup
echo ""
echo "🔧 Step 1: Environment Setup"
echo "----------------------------"

# Check if production environment files exist
if [ ! -f "ConnectHub-Backend/.env.production" ]; then
    echo "❌ Production environment file not found!"
    echo "Please configure ConnectHub-Backend/.env.production first"
    exit 1
fi

if [ ! -f "ConnectHub-Frontend/src/js/config.prod.js" ]; then
    echo "❌ Frontend production config not found!"
    echo "Please configure ConnectHub-Frontend/src/js/config.prod.js first"
    exit 1
fi

echo "✅ Environment files found"

# Step 2: Build Backend
echo ""
echo "🏗️  Step 2: Building Backend"
echo "----------------------------"

cd ConnectHub-Backend
echo "Installing backend dependencies..."
npm install --production

echo "Building TypeScript..."
npm run build

echo "Running database migrations..."
npx prisma migrate deploy

echo "✅ Backend built successfully"
cd ..

# Step 3: Build Frontend
echo ""
echo "🎨 Step 3: Building Frontend"
echo "----------------------------"

cd ConnectHub-Frontend
echo "Installing frontend dependencies..."
npm install --production

echo "Building frontend for production..."
npm run build 2>/dev/null || echo "Build command not found, using source files directly"

echo "✅ Frontend prepared successfully"
cd ..

# Step 4: Deploy based on type
echo ""
echo "🚀 Step 4: Deployment ($DEPLOYMENT_TYPE)"
echo "----------------------------------------"

case $DEPLOYMENT_TYPE in
    "quick")
        echo "🚀 Quick Deployment (Vercel + Railway)"
        echo "1. Install deployment tools:"
        echo "   npm install -g vercel @railway/cli"
        echo ""
        echo "2. Deploy Backend (Railway):"
        echo "   cd ConnectHub-Backend"
        echo "   railway login"
        echo "   railway link"
        echo "   railway up"
        echo ""
        echo "3. Deploy Frontend (Vercel):"
        echo "   cd ConnectHub-Frontend"
        echo "   vercel --prod"
        echo ""
        echo "⏱️  Estimated time: 30 minutes"
        ;;
        
    "professional")
        echo "🏢 Professional Deployment (Netlify + Heroku)"
        echo "1. Install deployment tools:"
        echo "   npm install -g netlify-cli heroku"
        echo ""
        echo "2. Deploy Backend (Heroku):"
        echo "   cd ConnectHub-Backend"
        echo "   heroku login"
        echo "   heroku create connecthub-api"
        echo "   git push heroku main"
        echo ""
        echo "3. Deploy Frontend (Netlify):"
        echo "   cd ConnectHub-Frontend"
        echo "   netlify deploy --prod"
        echo ""
        echo "⏱️  Estimated time: 2 hours"
        ;;
        
    "enterprise")
        echo "🏗️  Enterprise Deployment (AWS)"
        echo "1. Install AWS CLI:"
        echo "   aws configure"
        echo ""
        echo "2. Deploy Infrastructure:"
        echo "   aws cloudformation deploy --template-file aws-template.yml"
        echo ""
        echo "3. Deploy Applications:"
        echo "   docker build -t connecthub-backend ConnectHub-Backend/"
        echo "   docker build -t connecthub-frontend ConnectHub-Frontend/"
        echo "   # Push to ECR and deploy to ECS"
        echo ""
        echo "⏱️  Estimated time: 1 day"
        ;;
        
    *)
        echo "❌ Invalid deployment type: $DEPLOYMENT_TYPE"
        echo "Valid options: quick, professional, enterprise"
        exit 1
        ;;
esac

# Step 5: Post-deployment checklist
echo ""
echo "✅ Step 5: Post-Deployment Checklist"
echo "------------------------------------"
echo "□ Update DNS records"
echo "□ Configure SSL certificates"
echo "□ Set up monitoring"
echo "□ Test all endpoints"
echo "□ Run security scan"
echo "□ Update documentation"
echo ""

echo "🎉 Deployment preparation complete!"
echo ""
echo "📖 Next Steps:"
echo "1. Follow the deployment commands above"
echo "2. Update your domain DNS settings"
echo "3. Test the live application"
echo "4. Monitor deployment logs"
echo ""
echo "📚 For detailed instructions, see PRODUCTION-DEPLOYMENT-GUIDE.md"
