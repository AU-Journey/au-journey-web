import './style.css';
import SchoolMap from './components/SchoolMap';

const container = document.createElement('div');
container.style.width = '100vw';
container.style.height = '100vh';
document.body.appendChild(container);

const schoolMap = new SchoolMap(container);

let index = 0;
setInterval(() => {
  if (index < schoolMap.gpsPoints.length) {
    const gps = schoolMap.gpsPoints[index];
    schoolMap.updateTramPositionFromLiveGPS(gps.lat, gps.lon);
    index++;
  }
}, 3000); // Move every 3 seconds (can adjust to 1000 for smoother)
