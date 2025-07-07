# 🚊 Enhanced GPS-Based Tram Stop Checkpoint System

## Overview

This enhanced tram tracking system provides real-time GPS-based checkpoint detection for tram stops with advanced status tracking and visual feedback.

## Features

### ✅ Implemented Features

1. **GPS-Based Stop Detection**
   - Automatically detects when tram enters designated stop areas
   - Uses configurable radius zones around each stop
   - Real-time position tracking with enhanced accuracy

2. **Smart Status Tracking**
   - "At [Station Name]" when stopped at stations
   - "Heading to [Next Station]" when moving toward stops
   - "Arriving at [Station]" when approaching (< 100m)
   - Intelligent next stop prediction based on movement direction

3. **Visual Indicators**
   - 🟡 Gold cylindrical markers for tram stops on the map
   - 🔵 Orange labels above each stop
   - Real-time status display panel
   - Click-to-get-coordinates functionality

4. **Enhanced Backend Integration**
   - Improved API endpoints with detailed stop information
   - Real-time status broadcasting
   - iOS-compatible data format

## Current Tram Stops

The system is configured with four tram stops:

1. **MSM Building** (Stop 1)
   - GPS: 13.612263, 100.836828
   - Status: Starting point

2. **IT Building** (Stop 2)
   - GPS: 13.613051, 100.834310
   - Status: Mid-route stop

3. **AU Mall** (Stop 3)
   - GPS: 13.613202, 100.833545
   - Status: Commercial area

4. **Queen of Sheba Building** (Stop 4)
   - GPS: 13.614444, 100.831560
   - Status: End point

## How to Use

### Basic Operation

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **View Status Display**
   - Status panel appears automatically after 3 seconds
   - Toggle visibility with the 📍 button (top-right)

3. **Get Coordinates for New Stops**
   - Click anywhere on the map
   - Check browser console for GPS coordinates
   - Copy coordinates in format: `{ lat: X.XXXXXX, lon: Y.YYYYYY }`

### Advanced Testing

Open browser console and use these commands:

```javascript
// Start enhanced tracking simulation
window.startTramTracking()

// Stop tracking simulation
window.stopTramTracking()

// Test stop detection at all stations
window.testStopDetection()

// Manually update tram position
window.updateTramPos(13.612263, 100.836828)

// Start backend simulation
window.startSimulation(1.0)  // 1.0x speed

// Get current tram status
window.getTramStatus()
```

### Manual Controls

- **SPACEBAR**: Start/stop visual tram movement (independent of tracking)
- **Mouse**: Camera navigation (orbit, zoom, pan)
- **Click Map**: Get GPS coordinates for new stops

## Status Messages

The system provides detailed status messages:

| Status | Description |
|--------|-------------|
| `At [Station Name]` | Tram is stopped at a station |
| `Heading to [Station Name]` | Tram is moving toward a specific station |
| `Arriving at [Station Name]` | Tram is within 100m of a station |
| `Running` | Tram is moving but destination unclear |
| `Stopped` | Tram is stopped away from any station |

## API Integration

### Backend Endpoints

```
GET  /api/tram/status        - Get current status
POST /api/tram/position      - Update GPS position
POST /api/tram/simulate      - Start simulation
GET  /api/buildings          - Get all tram stops
```

### Status Data Format

```json
{
  "tram_id": "tram_01",
  "currentStatus": "Heading to IT Building",
  "headingTo": "Heading to IT Building",
  "current_stop": "MSM Building",
  "next_stop": "IT Building",
  "speed_kmh": 15.3,
  "location": {
    "lat": 13.612500,
    "lng": 100.836500
  },
  "stops_available": [
    {"id": "msm_building", "name": "MSM Building", "index": 0},
    {"id": "it_building", "name": "IT Building", "index": 1}
  ]
}
```

## Adding New Tram Stops

### Method 1: Using Click Function

1. Click on map at desired location
2. Copy coordinates from console
3. Add to configuration files

### Method 2: Manual Configuration

Edit these files to add new stops:

**Frontend (src/components/TramTracker.js):**
```javascript
this.buildings = [
  // ... existing stops ...
  {
    id: 'new_stop_id',
    name: 'New Stop',
    displayName: 'New Stop Building',
    lat: 13.XXXXXX,
    lon: 100.YYYYYY,
    radius: 0.0005,
    stopIndex: 4  // Next index
  }
];
```

**Backend (backend/gps_data.py):**
```python
BUILDINGS = [
    # ... existing stops ...
    {
        "id": "new_stop_id",
        "name": "New Stop Building",
        "lat": 13.XXXXXX,
        "lon": 100.YYYYYY,
        "radius": 0.0005
    }
]
```

## Technical Details

### Detection Algorithm

1. **Distance Calculation**: Uses Haversine formula for GPS distance
2. **Stop Detection**: 55m radius zones around each stop
3. **Direction Prediction**: Analyzes movement vectors from location history
4. **Status Timing**: 3-second delay for "stopped" status, 5-second approach detection

### Coordinate System

- **GPS to 3D Conversion**: Scales GPS differences by 100,000x
- **Center Point**: Calculated from route start/end points
- **Y-Axis**: Fixed heights for different elements (dots, stops, tram)

### Performance Optimizations

- **Update Frequency**: 2-second intervals for realistic tracking
- **History Management**: 20-point location history for direction analysis
- **Status Change Detection**: Only updates UI when status actually changes

## Troubleshooting

### Common Issues

1. **Stops Not Detected**
   - Check GPS coordinates accuracy
   - Verify radius settings (increase if needed)
   - Ensure tram is stationary for 3+ seconds

2. **Wrong Next Stop Prediction**
   - Check movement history length
   - Verify route sequence configuration
   - Increase minimum movement threshold

3. **Visual Elements Missing**
   - Ensure models are loaded
   - Check console for errors
   - Verify coordinate conversion

### Debug Information

Enable detailed logging:
```javascript
// Check tram tracker status
console.log(schoolMap.tramTracker.getTrackingInfo());

// Check API status
console.log(schoolMap.backendAPI.getAPIStats());

// Check backend health
schoolMap.backendAPI.getBackendHealth();
```

## Future Enhancements

- [ ] Real GPS integration via device location API
- [ ] Multiple tram support
- [ ] Route scheduling and timing
- [ ] Historical tracking data
- [ ] Mobile app integration
- [ ] Real-time passenger information system 