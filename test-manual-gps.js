// Simple manual GPS testing script
import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
  port: 15238,
  password: 'HOwS9Ta53CidWxys59VlS51v2yp88tY9',
  db: 0,
  lazyConnect: true
});

// Test GPS points around AU campus
const testPoints = [
  { lat: 13.612441, lon: 100.836478, name: "Start Point" },
  { lat: 13.612470, lon: 100.836450, name: "Moving North" },
  { lat: 13.612500, lon: 100.836400, name: "Further North" },
  { lat: 13.612530, lon: 100.836350, name: "Near IT Building" },
  { lat: 13.612560, lon: 100.836300, name: "End Point" }
];

let currentIndex = 0;

async function setGPSPoint() {
  try {
    const current = testPoints[currentIndex];
    const previous = testPoints[Math.max(0, currentIndex - 1)];
    
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
    console.log(`📍 Set GPS to: ${current.name} (${current.lat}, ${current.lon})`);
    
    currentIndex = (currentIndex + 1) % testPoints.length;
    
  } catch (error) {
    console.error('❌ Error setting GPS:', error);
  }
}

console.log('🧪 Manual GPS Test Script');
console.log('📍 Will cycle through 5 test points around AU campus');
console.log('⌨️  Press Enter to move to next point, or Ctrl+C to exit');

// Set initial point
setGPSPoint();

// Listen for Enter key
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', async (key) => {
  if (key[0] === 13) { // Enter key
    await setGPSPoint();
  } else if (key[0] === 3) { // Ctrl+C
    console.log('\n👋 Exiting...');
    await redis.disconnect();
    process.exit(0);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await redis.disconnect();
  process.exit(0);
}); 