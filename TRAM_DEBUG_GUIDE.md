# Tram Tracking Debug Guide

## Overview
This guide explains how to debug tram tracking issues and monitor the system's behavior in real-time.

## Debug Features Added

### 1. Debug UI Console
- **Location**: Top-right corner of the screen
- **Toggle**: Press `D` key to show/hide
- **Information displayed**:
  - Status: Current tram status (Running/Stopped)
  - Heading To: Next destination from backend
  - Position: Current GPS coordinates
  - Last Building: Most recently detected building
  - Backend API: Backend connection status

### 2. Enhanced Console Logging
- **Frontend**: Detailed position updates when tram is moving
- **Backend**: Building detection distances and collision events

### 3. Increased Detection Range
- **Previous**: 0.0005 degrees (~55 meters)
- **Current**: 0.001 degrees (~110 meters)
- **Reason**: Better collision detection for tram stops

## How to Debug Tram Tracking

### Step 1: Start the System
1. Start the backend server: `cd backend && python app.py`
2. Start the frontend: `npm run dev`
3. Open browser to `http://localhost:5173`

### Step 2: Enable Debug Mode
1. Press `D` key to show debug console
2. Press `Space` to start tram movement
3. Watch the debug console for real-time updates

### Step 3: Monitor Building Detection
- **Console Output**: Check browser console for position updates
- **Backend Terminal**: Watch for building detection messages:
  ```
  📍 Tram position updated: 13.612263, 100.836828
  🏢 Distance to MSM Building: 45.2m (radius: 111.0m)
  🏢 Tram entered building: MSM Building
  🚪 Tram left building: MSM Building
  ```

### Step 4: Check Backend API
- **Status Endpoint**: `http://localhost:5000/api/tram/status`
- **Debug Console**: Shows if backend is responding
- **Expected Response**:
  ```json
  {
    "success": true,
    "data": {
      "currentStatus": "Running",
      "headingTo": "Heading to IT Building",
      "last_building": "MSM Building"
    }
  }
  ```

## Common Issues and Solutions

### Issue: HeadingTo shows "Null"
**Cause**: Tram not detected near any building
**Solution**: 
- Check if tram is within 110m of a building
- Verify building coordinates in `backend/gps_data.py`
- Increase detection radius if needed

### Issue: Backend not receiving position updates
**Cause**: Frontend not sending GPS coordinates
**Solution**:
- Check browser console for API errors
- Verify backend is running on port 5000
- Check network connection

### Issue: Tram status stuck on "Stopped"
**Cause**: Movement detection threshold too high
**Solution**:
- Check if tram is moving more than 5 meters between updates
- Verify GPS coordinates are changing
- Restart backend if needed

## Keyboard Shortcuts
- `Space`: Start/Stop tram movement
- `D`: Toggle debug console

## API Testing Commands
Open browser console and try:
```javascript
// Get current status
window.getTramStatus()

// Update position manually
window.updateTramPosition(13.612263, 100.836828)

// Start simulation
window.startSimulation(2.0)

// Stop simulation
window.stopSimulation()
```

## Building Coordinates
Current tram stops with detection radius:
- **MSM Building**: 13.612565, 100.836516 (±111m)
- **IT Building**: 13.612177, 100.836425 (±111m)
- **AU Mall**: 13.612764, 100.833440 (±111m)
- **Queen of Sheba**: 13.614219, 100.832132 (±111m)

## Next Steps
1. Monitor the debug console while tram moves
2. Check backend terminal for building detection logs
3. Verify HeadingTo updates when tram enters/exits buildings
4. Test with different movement speeds if needed

## Troubleshooting Tips
- If debug UI doesn't appear, check browser console for errors
- If backend doesn't respond, verify it's running on port 5000
- If building detection fails, check GPS coordinate accuracy
- Clear browser cache if updates don't appear 