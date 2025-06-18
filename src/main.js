import './style.css';
import SchoolMap from './components/SchoolMap';

const container = document.createElement('div');
container.style.width = '100vw';
container.style.height = '100vh';
document.body.appendChild(container);

const schoolMap = new SchoolMap(container);

// Automatic GPS simulation is disabled - use SPACEBAR to control tram movement manually
// If you want to enable automatic GPS simulation, uncomment the code below:
/*
let index = 0;
setInterval(() => {
  if (index < schoolMap.gpsPoints.length) {
    const gps = schoolMap.gpsPoints[index];
    schoolMap.updateTramPositionFromLiveGPS(gps.lat, gps.lon);
    index++;
  } else {
    index = 0; // Loop back to start
  }
}, 3000); // Move every 3 seconds (can adjust to 1000 for smoother)
*/
