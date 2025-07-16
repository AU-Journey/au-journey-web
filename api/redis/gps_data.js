// Vercel serverless function for Redis GPS data
import Redis from 'ioredis';

// Redis configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
  port: parseInt(process.env.REDIS_PORT) || 15238,
  password: process.env.REDIS_PASSWORD || 'HOwS9Ta53CidWxys59VlS51v2yp88tY9',
  db: parseInt(process.env.REDIS_DB) || 0,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryDelayOnFailover: 100,
  connectTimeout: 10000,
  commandTimeout: 5000
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Fetch GPS data from Redis
      const result = await redis.get('gps_data');
      
      if (result) {
        const gpsData = JSON.parse(result);
        res.status(200).json(gpsData);
      } else {
        res.status(404).json({ 
          error: 'No GPS data found',
          message: 'gps_data key not found in Redis'
        });
      }
    } else if (req.method === 'POST') {
      // Store GPS data in Redis
      const gpsData = req.body;
      
      // Validate GPS data format
      if (!gpsData.c || !gpsData.p) {
        return res.status(400).json({
          error: 'Invalid GPS data format',
          message: 'Expected format: {"c": {...}, "p": {...}, "s": "active"}'
        });
      }
      
      await redis.set('gps_data', JSON.stringify(gpsData));
      res.status(200).json({ 
        success: true, 
        message: 'GPS data stored successfully',
        data: gpsData
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Redis error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 