#!/bin/bash

# DigitalOcean App Platform Production Setup Script

echo "🚀 Setting up AU Journey Web for DigitalOcean deployment..."

# Create production environment file for backend
echo "📝 Creating backend production environment file..."
cat > backend/.env.production << EOF
NODE_ENV=production
PORT=8080
REDIS_HOST=redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=15238
REDIS_PASSWORD=HOwS9Ta53CidWxys59VlS51v2yp88tY9
REDIS_DB=0
FRONTEND_URL=https://your-frontend-app.ondigitalocean.app
EOF

# Create production environment file for frontend
echo "📝 Creating frontend production environment file..."
cat > frontend/.env.production << EOF
VITE_BACKEND_URL=https://your-backend-app.ondigitalocean.app
EOF

# Make sure backend has correct port configuration
echo "🔧 Updating backend server port configuration..."
sed -i.bak 's/const PORT = process.env.PORT || 3000;/const PORT = process.env.PORT || 8080;/' backend/server.js

echo "✅ Production setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update the URLs in .env.production files with your actual DigitalOcean app URLs"
echo "2. Commit and push changes to GitHub"
echo "3. Deploy backend first using .do/app.yaml"
echo "4. Deploy frontend using .do/frontend.yaml"
echo "5. Update FRONTEND_URL in backend app settings on DigitalOcean"
echo ""
echo "📖 See docs/deployment/DIGITALOCEAN_APP_PLATFORM.md for detailed instructions"
