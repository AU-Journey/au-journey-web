// Simulate realistic tram movement by updating GPS coordinates
import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
  port: 15238,
  password: 'HOwS9Ta53CidWxys59VlS51v2yp88tY9',
  db: 0,
  lazyConnect: true
});

// Starting position (near MSM Building)
let currentLat = 13.612441;
let currentLon = 100.836478;

// Movement parameters
const moveDistance = 0.00003; // About 3 meters per update
const updateInterval = 3000; // Update every 3 seconds

// Direction vectors for realistic movement
const directions = [
  { lat: 1, lon: 0 },    // North
  { lat: 1, lon: 1 },    // Northeast
  { lat: 0, lon: 1 },    // East
  { lat: -1, lon: 1 },   // Southeast
  { lat: -1, lon: 0 },   // South
  { lat: -1, lon: -1 },  // Southwest
  { lat: 0, lon: -1 },   // West
  { lat: 1, lon: -1 }    // Northwest
];

let currentDirection = 0;
let stepsSameDirection = 0;
const maxStepsPerDirection = 3;

console.log('🚊 Starting GPS movement simulation...');
console.log('📍 Initial position:', { lat: currentLat, lon: currentLon });

async function updateGPSPosition() {
  try {
    // Store current position as previous
    const previousLat = currentLat;
    const previousLon = currentLon;
    
    // Change direction occasionally for realistic movement
    stepsSameDirection++;
    if (stepsSameDirection >= maxStepsPerDirection) {
      currentDirection = (currentDirection + 1) % directions.length;
      stepsSameDirection = 0;
      console.log(`🔄 Changed direction: ${['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'][currentDirection]}`);
    }
    
    // Calculate new position
    const direction = directions[currentDirection];
    currentLat += direction.lat * moveDistance;
    currentLon += direction.lon * moveDistance;
    
    // Create GPS data in your format
    const gpsData = {
      c: {
        lat: currentLat,
        lon: currentLon,
        t: new Date().toISOString()
      },
      p: {
        lat: previousLat,
        lon: previousLon,
        t: new Date(Date.now() - 3000).toISOString()
      },
      s: "active"
    };
    
    // Store in Redis
    await redis.set('gps_data', JSON.stringify(gpsData));
    
    console.log('📍 GPS updated:', {
      current: { lat: currentLat.toFixed(6), lon: currentLon.toFixed(6) },
      previous: { lat: previousLat.toFixed(6), lon: previousLon.toFixed(6) }
    });
    
  } catch (error) {
    console.error('❌ Error updating GPS:', error);
  }
}

// Start the simulation
const interval = setInterval(updateGPSPosition, updateInterval);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Stopping GPS simulation...');
  clearInterval(interval);
  await redis.disconnect();
  process.exit(0);
});

console.log(`🚀 GPS simulation running. Updates every ${updateInterval/1000} seconds.`);
console.log('Press Ctrl+C to stop simulation.');

// Do initial update
updateGPSPosition(); 