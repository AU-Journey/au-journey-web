// Redis HTTP Proxy Server
// This server connects to your Redis database and provides HTTP endpoints for browser access

import express from 'express';
import Redis from 'ioredis';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Redis configuration - use your actual Redis credentials
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

console.log('🔧 Starting Redis HTTP Proxy Server...');
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

// Get GPS data from Redis
app.get('/api/redis/gps_data', async (req, res) => {
  try {
    console.log('📍 Fetching GPS data from Redis...');
    
    // Fetch the GPS data from Redis
    const result = await redis.get('gps_data');
    
    if (result) {
      const gpsData = JSON.parse(result);
      console.log('📍 GPS data retrieved:', gpsData);
      
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

// Set GPS data in Redis (for testing)
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

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Redis HTTP Proxy Server running on http://localhost:${PORT}`);
  console.log(`📍 GPS endpoint: http://localhost:${PORT}/api/redis/gps_data`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Redis HTTP Proxy Server...');
  await redis.disconnect();
  process.exit(0);
}); 