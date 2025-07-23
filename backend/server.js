// Production server for DigitalOcean deployment
import express from 'express';
import Redis from 'ioredis';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Redis configuration - use environment variables in production
const redisConfig = {
  host: process.env.REDIS_HOST || 'redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
  port: parseInt(process.env.REDIS_PORT) || 15238,
  password: process.env.REDIS_PASSWORD || 'HOwS9Ta53CidWxys59VlS51v2yp88tY9',
  db: parseInt(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 1000,
  maxRetriesPerRequest: 3,
  keepAlive: 30000,
  connectTimeout: 60000,
  lazyConnect: true
};

console.log('🔧 Starting AU Journey Web Server...');
console.log('📍 Redis Config:', {
  host: redisConfig.host,
  port: redisConfig.port,
  db: redisConfig.db
});

// Create Redis client
const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
  console.log('✅ Connected to Redis successfully!');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('ready', () => {
  console.log('🚀 Redis client is ready!');
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await redis.ping();
    res.json({ 
      status: 'healthy', 
      redis: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      redis: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
// Get GPS data from Redis
app.get('/api/redis/gps_data', async (req, res) => {
  try {
    console.log('📍 Fetching GPS data from Redis...');
    
    const result = await redis.get('gps_data');
    
    if (result) {
      const gpsData = JSON.parse(result);
      res.json(gpsData);
    } else {
      console.warn('⚠️ No GPS data found in Redis');
      res.status(404).json({ 
        error: 'No GPS data found',
        message: 'gps_data key not found in Redis'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching GPS data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch GPS data',
      message: error.message 
    });
  }
});

// Set GPS data in Redis
app.post('/api/redis/gps_data', async (req, res) => {
  try {
    const gpsData = req.body;
    
    // Validate GPS data format
    if (!gpsData.c || !gpsData.p) {
      return res.status(400).json({
        error: 'Invalid GPS data format',
        message: 'Expected format: {"c": {...}, "p": {...}, "s": "active"}'
      });
    }
    
    // Store in Redis
    await redis.set('gps_data', JSON.stringify(gpsData));
    
    console.log('📍 GPS data stored in Redis:', gpsData);
    res.json({ 
      success: true, 
      message: 'GPS data stored successfully',
      data: gpsData
    });
  } catch (error) {
    console.error('❌ Error storing GPS data:', error);
    res.status(500).json({ 
      error: 'Failed to store GPS data',
      message: error.message 
    });
  }
});

// Test endpoint to set sample GPS data
app.post('/api/test/set-sample-gps', async (req, res) => {
  try {
    const sampleGPS = {
      c: { 
        lat: 13.612441, 
        lon: 100.836478, 
        t: new Date().toISOString() 
      },
      p: { 
        lat: 13.612412, 
        lon: 100.836585, 
        t: new Date(Date.now() - 5000).toISOString() 
      },
      s: "active"
    };
    
    await redis.set('gps_data', JSON.stringify(sampleGPS));
    
    console.log('🧪 Sample GPS data set:', sampleGPS);
    res.json({ 
      success: true, 
      message: 'Sample GPS data set successfully',
      data: sampleGPS
    });
  } catch (error) {
    console.error('❌ Error setting sample GPS data:', error);
    res.status(500).json({ 
      error: 'Failed to set sample GPS data',
      message: error.message 
    });
  }
});

// List all Redis keys (for debugging)
app.get('/api/redis/keys', async (req, res) => {
  try {
    const keys = await redis.keys('*');
    res.json({ keys });
  } catch (error) {
    console.error('❌ Error fetching Redis keys:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Redis keys',
      message: error.message 
    });
  }
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 AU Journey Web Server running on http://0.0.0.0:${PORT}`);
  console.log(`📍 GPS endpoint: http://0.0.0.0:${PORT}/api/redis/gps_data`);
  console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down AU Journey Web Server...');
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down AU Journey Web Server...');
  await redis.disconnect();
  process.exit(0);
}); 