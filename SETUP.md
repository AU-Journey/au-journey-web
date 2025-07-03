# Setup Guide - AU Tram Tracking System

This guide will walk you through setting up both the Flask backend API and the frontend 3D visualization.

## 📋 Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)
- **Git** (for cloning)

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd au-journey-web
```

### Step 2: Backend Setup (Flask API)

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install Python dependencies:**
```bash
pip3 install -r requirements.txt
```

3. **Start the Flask server:**
```bash
python3 app.py
```

Or use the startup script:
```bash
chmod +x start.sh
./start.sh
```

4. **Verify backend is running:**
Open http://localhost:5001 in your browser. You should see:
```json
{
  "status": "healthy",
  "service": "AU Tram Tracking API",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Step 3: Frontend Setup (3D Visualization)

1. **Navigate back to project root:**
```bash
cd ..
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open the application:**
Open http://localhost:5173 in your browser.

### Step 4: Test the Integration

1. **Open browser console** (F12)

2. **Test backend connection:**
```javascript
// Check if backend API is connected
window.getTramStatus()
```

3. **Test position updates:**
```javascript
// Update tram position
window.updateTramPosition(13.612263, 100.836828)
```

4. **Start simulation:**
```javascript
// Start automatic simulation
window.startSimulation(1.5)
```

## 🧪 Testing the API

### Using curl (Terminal)
```bash
# Health check
curl http://localhost:5001/

# Get tram status
curl http://localhost:5001/api/tram/status

# Update position
curl -X POST http://localhost:5001/api/tram/position \
  -H "Content-Type: application/json" \
  -d '{"lat": 13.612263, "lon": 100.836828}'

# Start simulation
curl -X POST http://localhost:5001/api/tram/simulate \
  -H "Content-Type: application/json" \
  -d '{"speed": 2.0}'

# Stop simulation
curl -X POST http://localhost:5001/api/tram/simulate/stop
```

### Using JavaScript (Browser Console)
```javascript
// Get current status
await window.getTramStatus()

// Subscribe to updates
window.subscribeTramStatus((status) => {
  console.log('Tram Status:', status.currentStatus);
  console.log('Heading To:', status.headingTo);
  console.log('Speed:', status.speed_kmh, 'km/h');
});

// Start slow simulation for demo
window.startSimulation(0.5)
```

## 📱 iOS Integration Testing

### Swift URLSession Example
```swift
import Foundation

class TramAPI {
    private let baseURL = "http://localhost:5001/api"
    
    func getTramStatus(completion: @escaping (Result<[String: Any], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/tram/status") else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0)))
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                completion(.failure(NSError(domain: "Invalid response", code: 0)))
                return
            }
            
            completion(.success(json))
        }.resume()
    }
    
    func updateTramPosition(lat: Double, lon: Double, completion: @escaping (Bool) -> Void) {
        guard let url = URL(string: "\(baseURL)/tram/position") else {
            completion(false)
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["lat": lat, "lon": lon]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { _, response, _ in
            if let httpResponse = response as? HTTPURLResponse {
                completion(httpResponse.statusCode == 200)
            } else {
                completion(false)
            }
        }.resume()
    }
}

// Usage
let tramAPI = TramAPI()

// Get status
tramAPI.getTramStatus { result in
    switch result {
    case .success(let data):
        if let tramData = data["data"] as? [String: Any] {
            print("Tram Status: \(tramData["currentStatus"] ?? "")")
            print("Heading To: \(tramData["headingTo"] ?? "")")
        }
    case .failure(let error):
        print("Error: \(error)")
    }
}

// Update position
tramAPI.updateTramPosition(lat: 13.612263, lon: 100.836828) { success in
    print("Position updated: \(success)")
}
```

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Flask server won't start
```
ModuleNotFoundError: No module named 'flask'
```
**Solution**: Install dependencies
```bash
cd backend
pip3 install -r requirements.txt
```

**Problem**: Port 5000 already in use (macOS AirPlay Receiver)
**Solution**: Backend now defaults to port 5001. If still conflicts, change in environment:
```bash
cd backend
PORT=5002 python3 app.py
```

**Problem**: CORS errors in browser
**Solution**: Backend includes CORS headers, but if issues persist, check the frontend is running on localhost:5173

### Frontend Issues

**Problem**: 3D models not loading
**Solution**: 
1. Ensure models are in `public/models/`
2. Check browser console for 404 errors
3. Clear browser cache

**Problem**: API connection failed
**Solution**:
1. Verify backend is running on port 5001
2. Check browser console for network errors
3. Test backend endpoints with curl

### iOS Integration Issues

**Problem**: Connection refused
**Solution**: 
1. Use actual IP address instead of localhost when testing on device
2. Ensure backend allows connections from your network
3. Update `HOST=0.0.0.0` in backend/.env

**Problem**: CORS errors from iOS
**Solution**: Backend already includes CORS headers for cross-origin requests

## 🎯 Expected Results

### Backend Running Successfully
```
🚀 Starting AU Tram Tracking API
📡 Server running on http://0.0.0.0:5001
🏢 Buildings: 4
🗺️  Route points: 120
🚋 TramTracker initialized with 4 building checkpoints
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5001
 * Running on http://[your-ip]:5001
```

### Frontend Running Successfully
```
  Local:   http://localhost:5173/
  Network: http://[your-ip]:5173/
```

Browser console should show:
```
🌐 BackendAPI initialized
📡 Backend URL: http://localhost:5001/api
🚀 BackendAPI service started
```

### API Response Examples

**GET /api/tram/status**
```json
{
  "success": true,
  "data": {
    "tram_id": "tram_01",
    "currentStatus": "Stopped",
    "headingTo": null,
    "speed_kmh": 0,
    "location": {
      "lat": null,
      "lng": null
    },
    "last_building": null,
    "timestamp": 1703123456789
  }
}
```

## 🚦 Production Deployment

### Backend (Flask)
```bash
# Install gunicorn
pip3 install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (Static Build)
```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## 📚 Next Steps

1. **Customize GPS Route**: Edit `backend/gps_data.py`
2. **Add Buildings**: Update building list in `gps_data.py`
3. **Modify 3D Models**: Replace models in `public/models/`
4. **Integrate Real GPS**: Connect actual GPS device/service
5. **Deploy to Cloud**: Use services like Heroku, AWS, or DigitalOcean

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review console logs (browser and terminal)
3. Test API endpoints with curl
4. Verify all dependencies are installed 