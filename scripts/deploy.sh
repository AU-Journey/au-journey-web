#!/bin/bash
echo "🚀 Deploying AU Journey Web..."

# Stop existing containers
docker-compose -f docker/docker-compose.yml down

# Build and start
docker-compose -f docker/docker-compose.yml up -d --build

echo "✅ Deployment complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "🏥 Health: http://localhost:3001/health"
