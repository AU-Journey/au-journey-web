import './style.css';
import SchoolMap from './components/SchoolMap';

const container = document.createElement('div');
container.style.width = '100vw';
container.style.height = '100vh';
document.body.appendChild(container);

const schoolMap = new SchoolMap(container);

// Enhanced GPS-based tram tracking system with checkpoint detection
console.log('🚊 Enhanced Tram Tracking System Initialized');
console.log('📍 Available tram stops:');
console.log('   1. MSM Building');
console.log('   2. IT Building');
console.log('   3. AU Mall');
console.log('   4. Queen of Sheba Building');
console.log('');
console.log('🖱️ Click on map to get coordinates for new tram stops');
console.log('⌨️ Press SPACEBAR to start/stop tram movement');
console.log('📡 Use browser console commands for advanced testing:');
console.log('   • window.startTramTracking() - Start enhanced tracking');
console.log('   • window.testStopDetection() - Test stop detection');
console.log('   • window.updateTramPos(lat, lon) - Manually update position');

// Add global test functions
window.startTramTracking = () => {
  console.log('🚀 Starting enhanced tram tracking with checkpoint detection...');
  schoolMap.tramStatusDisplay.show();
  
  let index = 0;
  const trackingInterval = setInterval(() => {
    if (index < schoolMap.gpsPoints.length) {
      const gps = schoolMap.gpsPoints[index];
      schoolMap.updateTramPositionFromLiveGPS(gps.lat, gps.lon);
      index++;
    } else {
      index = 0; // Loop back to start
      console.log('🔄 Tram route completed, starting new loop...');
    }
  }, 2000); // Move every 2 seconds for realistic tracking
  
  // Store interval ID for stopping
  window.tramTrackingInterval = trackingInterval;
  
  console.log('✅ Tram tracking started! Watch the status display for checkpoint updates.');
  return trackingInterval;
};

window.stopTramTracking = () => {
  if (window.tramTrackingInterval) {
    clearInterval(window.tramTrackingInterval);
    window.tramTrackingInterval = null;
    console.log('⏹️ Tram tracking stopped.');
  }
};

window.testStopDetection = () => {
  console.log('🧪 Testing stop detection at each tram stop...');
  const stops = [
    { name: 'MSM Building', lat: 13.612263, lon: 100.836828 },
    { name: 'IT Building', lat: 13.613051, lon: 100.834310 },
    { name: 'AU Mall', lat: 13.613202, lon: 100.833545 },
    { name: 'Queen of Sheba', lat: 13.614444, lon: 100.831560 }
  ];
  
  let stopIndex = 0;
  const testInterval = setInterval(() => {
    if (stopIndex < stops.length) {
      const stop = stops[stopIndex];
      console.log(`🚏 Testing stop detection at: ${stop.name}`);
      schoolMap.updateTramPositionFromLiveGPS(stop.lat, stop.lon);
      stopIndex++;
    } else {
      clearInterval(testInterval);
      console.log('✅ Stop detection test completed!');
    }
  }, 3000);
};

window.updateTramPos = (lat, lon) => {
  console.log(`📍 Manually updating tram position to: ${lat}, ${lon}`);
  schoolMap.updateTramPositionFromLiveGPS(lat, lon);
};

// Auto-start status display after a short delay
setTimeout(() => {
  if (schoolMap.tramStatusDisplay) {
    schoolMap.tramStatusDisplay.show();
    console.log('📊 Tram status display is now visible (toggle with 📍 button)');
  }
}, 3000);
