// Test script simulating external GPS data sender
import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
  port: 15238,
  password: 'HOwS9Ta53CidWxys59VlS51v2yp88tY9',
  db: 0,
  lazyConnect: true
});

// Simulate a route around AU campus
const route = [
  { lat: 13.612441, lon: 100.836478 }, // Start
  { lat: 13.612470, lon: 100.836450 }, // North
  { lat: 13.612500, lon: 100.836420 }, // Further north
  { lat: 13.612530, lon: 100.836390 }, // IT Building area
  { lat: 13.612560, lon: 100.836360 }, // Continue
  { lat: 13.612590, lon: 100.836330 }, // End point
];

let currentIndex = 0;

async function sendGPSUpdate() {
  try {
    const current = route[currentIndex];
    const previous = route[Math.max(0, currentIndex - 1)];
    
    // Send GPS data in your format (only current position, like external scripts would)
    const gpsData = {
      c: {
        lat: current.lat,
        lon: current.lon,
        t: new Date().toISOString()
      },
      p: {
        lat: previous.lat,
        lon: previous.lon,
        t: new Date(Date.now() - 3000).toISOString()
      },
      s: "active"
    };
    
    await redis.set('gps_data', JSON.stringify(gpsData));
    console.log(`📍 GPS ${currentIndex + 1}/${route.length}: ${current.lat.toFixed(6)}, ${current.lon.toFixed(6)}`);
    
    currentIndex = (currentIndex + 1) % route.length;
    
  } catch (error) {
    console.error('❌ Error sending GPS:', error);
  }
}

console.log('🚛 External GPS Simulator');
console.log('📍 Sending GPS updates every 4 seconds...');
console.log('🛑 Press Ctrl+C to stop');

// Send initial update
await sendGPSUpdate();

// Send updates every 4 seconds
const interval = setInterval(sendGPSUpdate, 4000);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Stopping GPS simulation...');
  clearInterval(interval);
  await redis.disconnect();
  process.exit(0);
}); 