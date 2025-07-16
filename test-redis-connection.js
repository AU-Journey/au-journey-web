// Test script to verify Redis connection and set sample GPS data

import Redis from 'ioredis';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
  port: parseInt(process.env.REDIS_PORT) || 15238,
  password: process.env.REDIS_PASSWORD || 'HOwS9Ta53CidWxys59VlS51v2yp88tY9',
  db: parseInt(process.env.REDIS_DB) || 0,
  connectTimeout: 60000,
  lazyConnect: true
};

console.log('🔧 Testing Redis connection...');
console.log('📍 Config:', {
  host: redisConfig.host,
  port: redisConfig.port,
  db: redisConfig.db
});

async function testRedisConnection() {
  const redis = new Redis(redisConfig);
  
  try {
    // Test connection
    await redis.ping();
    console.log('✅ Redis connection successful!');
    
    // Set sample GPS data in your format
    const sampleGPSData = {
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
    
    await redis.set('gps_data', JSON.stringify(sampleGPSData));
    console.log('📍 Sample GPS data stored successfully:', sampleGPSData);
    
    // Verify the data was stored
    const storedData = await redis.get('gps_data');
    const parsedData = JSON.parse(storedData);
    console.log('✅ Verified stored data:', parsedData);
    
    // Test with moving GPS data
    console.log('\n🚶 Setting moving GPS data...');
    
    setTimeout(async () => {
      const movingGPSData = {
        c: { 
          lat: 13.612450, 
          lon: 100.836470, 
          t: new Date().toISOString() 
        },
        p: { 
          lat: 13.612441, 
          lon: 100.836478, 
          t: new Date(Date.now() - 3000).toISOString() 
        },
        s: "active"
      };
      
      await redis.set('gps_data', JSON.stringify(movingGPSData));
      console.log('🚶 Moving GPS data set:', movingGPSData);
    }, 2000);
    
    setTimeout(async () => {
      const movingGPSData2 = {
        c: { 
          lat: 13.612460, 
          lon: 100.836460, 
          t: new Date().toISOString() 
        },
        p: { 
          lat: 13.612450, 
          lon: 100.836470, 
          t: new Date(Date.now() - 3000).toISOString() 
        },
        s: "active"
      };
      
      await redis.set('gps_data', JSON.stringify(movingGPSData2));
      console.log('🏃 Moving GPS data 2 set:', movingGPSData2);
      
      // Close connection
      await redis.disconnect();
      console.log('👋 Redis connection closed');
    }, 4000);
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    await redis.disconnect();
  }
}

testRedisConnection(); 