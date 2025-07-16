// Health check endpoint for Vercel deployment
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
  port: parseInt(process.env.REDIS_PORT) || 15238,
  password: process.env.REDIS_PASSWORD || 'HOwS9Ta53CidWxys59VlS51v2yp88tY9',
  db: parseInt(process.env.REDIS_DB) || 0,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  connectTimeout: 10000
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    await redis.ping();
    res.status(200).json({ 
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
} 