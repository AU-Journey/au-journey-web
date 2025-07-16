// Redis Proxy Server Example
// This server bridges between browser and Redis for GPS data access
// Run with: node redis-proxy-example.js

const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');

const app = express();
const PORT = 3001;

// Enable CORS for browser access
app.use(cors());
app.use(express.json());

// Redis configuration - use your actual Redis credentials
const redis = new Redis({
  host: 'redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
  port: 15238,
  password: 'HOwS9Ta53CidWxys59VlS51v2yp88tY9',
  db: 0
});

redis.on('connect', () => {
  console.log('🔗 Redis Proxy: Connected to Redis');
});

redis.on('error', (error) => {
  console.error('❌ Redis Proxy: Connection error:', error);
});

// API endpoint to get GPS data
app.get('/api/gps', async (req, res) => {
  try {
    // Fetch GPS data from Redis
    const gpsData = await redis.get('gps_data');
    
    if (gpsData) {
      const parsedData = JSON.parse(gpsData);
      
      // Return in the format expected by the frontend
      res.json({
        current: {
          lat: parsedData.c.lat,
          lon: parsedData.c.lon,
          timestamp: parsedData.c.t
        },
        previous: {
          lat: parsedData.p.lat,
          lon: parsedData.p.lon,
          timestamp: parsedData.p.t
        },
        status: parsedData.s,
        fromCache: false,
        success: true
      });
    } else {
      res.status(404).json({
        error: 'No GPS data found',
        success: false
      });
    }
  } catch (error) {
    console.error('❌ Error fetching GPS data:', error);
    res.status(500).json({
      error: 'Failed to fetch GPS data',
      success: false
    });
  }
});

// API endpoint to set GPS data (for testing)
app.post('/api/gps', async (req, res) => {
  try {
    const { current, previous, status } = req.body;
    
    const gpsData = {
      c: {
        lat: current.lat,
        lon: current.lon,
        t: current.timestamp || new Date().toISOString()
      },
      p: {
        lat: previous.lat,
        lon: previous.lon,
        t: previous.timestamp || new Date().toISOString()
      },
      s: status || 'active'
    };
    
    await redis.set('gps_data', JSON.stringify(gpsData));
    
    res.json({
      message: 'GPS data updated successfully',
      success: true
    });
  } catch (error) {
    console.error('❌ Error setting GPS data:', error);
    res.status(500).json({
      error: 'Failed to set GPS data',
      success: false
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`🚀 Redis Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 GPS API available at http://localhost:${PORT}/api/gps`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Redis Proxy Server...');
  await redis.disconnect();
  process.exit(0);
}); 