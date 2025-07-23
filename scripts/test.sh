#!/bin/bash
echo "🧪 Running tests..."

# Test backend
echo "🔧 Testing backend..."
cd backend && npm test

# Test frontend
echo "📱 Testing frontend..."
cd ../frontend && npm test

echo "✅ Tests complete!"
