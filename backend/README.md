# AU Tram Tracking Backend API

A Flask-based REST API for tracking tram movement at AU University campus.

## Features

- **Real-time Tram Tracking**: Track tram position, speed, and status
- **Building Detection**: Automatically detect when tram is near campus buildings
- **Direction Prediction**: Predict tram's next destination based on movement patterns
- **REST API**: iOS-compatible endpoints for mobile app integration
- **Simulation Mode**: Test the system without real GPS data

## Installation

1. **Install Python Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Set Environment Variables**
```bash
cp .env.example .env
# Edit .env file as needed
```

3. **Run the Server**
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /
```
Returns server health status and basic information.

### Get Tram Status
```
GET /api/tram/status
```
Returns current tram status, position, and movement information.

**Response:**
```json
{
  "success": true,
  "data": {
    "tram_id": "tram_01",
    "currentStatus": "Running",
    "headingTo": "Heading to IT Building",
    "speed_kmh": 15.2,
    "location": {
      "lat": 13.612263,
      "lng": 100.836828
    },
    "last_building": "MSM Building",
    "timestamp": 1703123456789
  },
  "metadata": {
    "api_version": "1.0",
    "response_time": 1703123456789,
    "buildings_count": 4,
    "route_points": 120
  }
}
```

### Update Tram Position
```
POST /api/tram/position
Content-Type: application/json

{
  "lat": 13.612263,
  "lon": 100.836828
}
```
Updates the tram's current GPS position and recalculates status.

### Start Simulation
```
POST /api/tram/simulate
Content-Type: application/json

{
  "speed": 2.0
}
```
Starts automated simulation of tram movement along the route.

### Stop Simulation
```
POST /api/tram/simulate/stop
```
Stops the current simulation.

### Get Buildings
```
GET /api/buildings
```
Returns all building checkpoints along the route.

### Get Route
```
GET /api/route
```
Returns all GPS points that define the tram route.

### Get API Statistics
```
GET /api/stats
```
Returns API usage statistics and system information.

## iOS Integration

This API is designed to be consumed by iOS applications. Here are some integration examples:

### Swift URLSession Example
```swift
func getTramStatus() {
    guard let url = URL(string: "http://localhost:5000/api/tram/status") else { return }
    
    URLSession.shared.dataTask(with: url) { data, response, error in
        if let data = data {
            // Parse JSON response
            if let tramData = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                print("Tram Status: \(tramData)")
            }
        }
    }.resume()
}
```

### Update Tram Position from iOS
```swift
func updateTramPosition(lat: Double, lon: Double) {
    guard let url = URL(string: "http://localhost:5000/api/tram/position") else { return }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body = ["lat": lat, "lon": lon]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        // Handle response
    }.resume()
}
```

## Development

### Running in Development Mode
```bash
export DEBUG=True
python app.py
```

### Running with Gunicorn (Production)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Testing the API
```bash
# Get current status
curl http://localhost:5000/api/tram/status

# Update position
curl -X POST http://localhost:5000/api/tram/position \
  -H "Content-Type: application/json" \
  -d '{"lat": 13.612263, "lon": 100.836828}'

# Start simulation
curl -X POST http://localhost:5000/api/tram/simulate \
  -H "Content-Type: application/json" \
  -d '{"speed": 1.5}'
```

## Configuration

### Environment Variables
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 5000)
- `DEBUG`: Debug mode (default: True)

### Customizing Building Checkpoints
Edit `gps_data.py` to modify building locations and detection radii:

```python
BUILDINGS = [
    {
        "id": "new_building",
        "name": "New Building",
        "lat": 13.612000,
        "lon": 100.836000,
        "radius": 0.0003  # Detection radius in GPS degrees
    }
]
```

## Architecture

- **Flask**: Web framework for REST API
- **Flask-CORS**: Cross-origin resource sharing for frontend communication
- **TramTracker**: Core logic for position tracking and status calculation
- **Threading**: Background simulation support

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "timestamp": 1703123456789
}
```

## License

MIT License - see LICENSE file for details. 