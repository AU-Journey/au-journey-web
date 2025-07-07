# AU Tram Tracking System - Testing Guide

## 🚀 Quick Start

Your tram tracking system is now running! Here's how to test it:

### 1. Backend Server (Port 5001)
```bash
cd backend
source venv/bin/activate
PORT=5001 python app.py
```

### 2. Frontend Server (Port 5173)
```bash
npm run dev
```

## 📡 API Testing

### Health Check
```bash
curl -X GET http://localhost:5001/
```

### Get Tram Status
```bash
curl -X GET http://localhost:5001/api/tram/status
```

### Update Tram Position
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"lat": 13.612263, "lon": 100.836828}' \
  http://localhost:5001/api/tram/position
```

### Start Simulation
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"speed": 2.0}' \
  http://localhost:5001/api/tram/simulate
```

### Stop Simulation
```bash
curl -X POST http://localhost:5001/api/tram/simulate/stop
```

### Get Buildings
```bash
curl -X GET http://localhost:5001/api/buildings
```

### Get Route Points
```bash
curl -X GET http://localhost:5001/api/route
```

## 🌐 Frontend Testing

1. **Open your browser** and go to `http://localhost:5173`
2. **Open Developer Console** (F12) to see API logs
3. **Available Console Commands:**
   ```javascript
   // Get current tram status
   window.getTramStatus()
   
   // Update tram position
   window.updateTramPosition(13.612263, 100.836828)
   
   // Start simulation
   window.startSimulation(2.0)  // 2x speed
   
   // Stop simulation
   window.stopSimulation()
   
   // Subscribe to status updates
   window.subscribeTramStatus((status) => {
     console.log('Tram Status:', status);
   })
   ```

## 🧪 Test Scenarios

### Scenario 1: Basic Status Check
1. Open browser console
2. Run: `window.getTramStatus()`
3. Should show tram status with location and building info

### Scenario 2: Manual Position Update
1. Run: `window.updateTramPosition(13.612263, 100.836828)`
2. Check status: `window.getTramStatus()`
3. Should show tram at MSM Building

### Scenario 3: Simulation Testing
1. Start simulation: `window.startSimulation(1.0)`
2. Watch console for status updates
3. Observe tram movement in 3D scene
4. Stop simulation: `window.stopSimulation()`

### Scenario 4: Building Detection
1. Update position to each building:
   ```javascript
   // MSM Building
   window.updateTramPosition(13.612263, 100.836828)
   
   // IT Building
   window.updateTramPosition(13.613051, 100.83431)
   
   // AU Mall
   window.updateTramPosition(13.613202, 100.833545)
   
   // Queen of Sheba
   window.updateTramPosition(13.614444, 100.83156)
   ```
2. Check status after each update to see building detection

## 📊 Expected Results

### Tram Status Response
```json
{
  "success": true,
  "data": {
    "currentStatus": "Running",
    "headingTo": "Heading to Queen of Sheba",
    "last_building": "MSM Building",
    "location": {
      "lat": 13.613051,
      "lng": 100.83431
    },
    "speed_kmh": 152.11,
    "timestamp": 1751738885518,
    "tram_id": "tram_01"
  }
}
```

### Building Detection
- When tram is within 0.0003 degrees of a building, it should be detected
- Status should show "last_building" and "headingTo" information
- Speed should be calculated based on position changes

## 🔧 Troubleshooting

### Backend Issues
- **Port 5001 in use**: Change PORT in backend startup
- **Module not found**: Ensure `pip install -r requirements.txt` was run
- **CORS errors**: Check Flask-CORS is installed

### Frontend Issues
- **API connection failed**: Ensure backend is running on port 5001
- **3D scene not loading**: Check browser WebGL support
- **Console errors**: Check browser developer tools

### Common Problems
1. **"Failed to connect"**: Backend not running
2. **"CORS error"**: Backend CORS not configured
3. **"Module not found"**: Python dependencies not installed
4. **"Port already in use"**: Change port or kill existing process

## 📱 iOS Integration

The backend provides iOS-compatible endpoints:
- REST API instead of WebSocket
- JSON responses with proper error handling
- Simulation mode for testing without GPS hardware

## 🎯 Performance Testing

### Load Testing
```bash
# Test multiple rapid updates
for i in {1..10}; do
  curl -X POST -H "Content-Type: application/json" \
    -d '{"lat": 13.612263, "lon": 100.836828}' \
    http://localhost:5001/api/tram/position
done
```

### Simulation Speed Testing
```bash
# Test different simulation speeds
curl -X POST -H "Content-Type: application/json" \
  -d '{"speed": 0.5}' http://localhost:5001/api/tram/simulate  # Slow
  
curl -X POST -H "Content-Type: application/json" \
  -d '{"speed": 5.0}' http://localhost:5001/api/tram/simulate  # Fast
```

## 🏁 Success Criteria

✅ Backend starts without errors
✅ Frontend connects to backend
✅ Tram status updates in real-time
✅ Building detection works correctly
✅ Simulation mode functions properly
✅ 3D visualization shows tram movement
✅ Console commands work as expected

## 📝 Next Steps

1. **iOS App Integration**: Use the REST API endpoints
2. **Real GPS Testing**: Replace simulation with actual GPS data
3. **Performance Optimization**: Add caching and rate limiting
4. **Monitoring**: Add logging and analytics
5. **Deployment**: Deploy to production server

---

**🎉 Congratulations!** Your AU Tram Tracking System is now fully functional and ready for testing! 