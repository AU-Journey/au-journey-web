#!/bin/bash

# AU Tram Tracking Backend Startup Script

echo "🚀 Starting AU Tram Tracking Backend API..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip."
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies. Please check requirements.txt"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "⚠️ No requirements.txt found. Continuing..."
fi

# Load environment variables
if [ -f ".env" ]; then
    echo "📋 Loading environment variables..."
    export $(cat .env | xargs)
    echo "✅ Environment variables loaded"
else
    echo "⚠️ No .env file found. Using default configuration."
fi

# Set default values if not set
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-5000}
export DEBUG=${DEBUG:-True}

echo "🌐 Server configuration:"
echo "   Host: $HOST"
echo "   Port: $PORT"
echo "   Debug: $DEBUG"

# Start the Flask application
echo "🚀 Starting Flask server..."
python3 app.py

# If we reach here, the server stopped
echo "⏹️ Flask server stopped" 