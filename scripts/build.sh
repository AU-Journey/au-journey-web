#!/bin/bash
echo "🔨 Building AU Journey Web..."

# Build frontend
echo "📱 Building frontend..."
cd frontend && npm install && npm run build

# Build backend
echo "🔧 Building backend..."
cd ../backend && npm install

# Build Docker images
echo "🐳 Building Docker images..."
cd ../docker && docker-compose build

echo "✅ Build complete!"
