import './style.css';
import SchoolMap from './components/SchoolMap';

// Create a container for the map
const container = document.createElement('div');
container.style.width = '100vw';
container.style.height = '100vh';
document.body.appendChild(container);

// Initialize the school map
const schoolMap = new SchoolMap(container);

// Simulate live GPS updates from predefined path
let index = 0;
setInterval(() => {
  if (index < schoolMap.gpsPoints.length) {
    const gps = schoolMap.gpsPoints[index];
    schoolMap.updateTramPositionFromLiveGPS(gps.lat, gps.lon);
    index++;
  }
}, 3000); // change this to a smaller value (like 1000) for smoother real-time feel
