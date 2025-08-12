// Simplified server for debugging deployment issues
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;

console.log('🔧 Starting AU Journey Web Server (Simple Version)...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('🌐 Port:', PORT);

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'AU Journey Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 AU Journey Web Server running on http://0.0.0.0:${PORT}`);
  console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down AU Journey Web Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down AU Journey Web Server...');
  process.exit(0);
});
