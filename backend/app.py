from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import math
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Import our tram tracking logic
from tram_tracker import TramTracker
from gps_data import GPS_POINTS, BUILDINGS

# Initialize the tram tracker
tram_tracker = TramTracker()

# Global state
current_position = None
last_update_time = time.time()

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "AU Tram Tracking API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/tram/status', methods=['GET'])
def get_tram_status():
    """Get current tram status - REST endpoint for iOS"""
    try:
        status = tram_tracker.get_status_for_api()
        
        return jsonify({
            "success": True,
            "data": status,
            "metadata": {
                "api_version": "1.0",
                "response_time": int(time.time() * 1000),
                "buildings_count": len(BUILDINGS),
                "route_points": len(GPS_POINTS)
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": int(time.time() * 1000)
        }), 500

@app.route('/api/tram/position', methods=['POST'])
def update_tram_position():
    """Update tram position from GPS data"""
    try:
        data = request.get_json()
        
        if not data or 'lat' not in data or 'lon' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required fields: lat, lon"
            }), 400
        
        lat = float(data['lat'])
        lon = float(data['lon'])
        
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return jsonify({
                "success": False,
                "error": "Invalid coordinates"
            }), 400
        
        # Update tram position
        tracking_info = tram_tracker.update_position(lat, lon)
        
        global current_position, last_update_time
        current_position = {"lat": lat, "lon": lon}
        last_update_time = time.time()
        
        return jsonify({
            "success": True,
            "data": tracking_info,
            "timestamp": int(time.time() * 1000)
        })
        
    except ValueError:
        return jsonify({
            "success": False,
            "error": "Invalid coordinate values"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/tram/simulate', methods=['POST'])
def simulate_tram_movement():
    """Simulate tram movement along the route for testing"""
    try:
        data = request.get_json()
        speed_multiplier = data.get('speed', 1.0) if data else 1.0
        
        # Start simulation
        simulation_status = tram_tracker.start_simulation(speed_multiplier)
        
        return jsonify({
            "success": True,
            "message": "Simulation started",
            "data": simulation_status
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/tram/simulate/stop', methods=['POST'])
def stop_tram_simulation():
    """Stop tram simulation"""
    try:
        tram_tracker.stop_simulation()
        
        return jsonify({
            "success": True,
            "message": "Simulation stopped"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/buildings', methods=['GET'])
def get_buildings():
    """Get all building checkpoints"""
    return jsonify({
        "success": True,
        "data": BUILDINGS,
        "count": len(BUILDINGS)
    })

@app.route('/api/route', methods=['GET'])
def get_route():
    """Get GPS route points"""
    return jsonify({
        "success": True,
        "data": GPS_POINTS,
        "count": len(GPS_POINTS)
    })

@app.route('/api/stats', methods=['GET'])
def get_api_stats():
    """Get API statistics"""
    return jsonify({
        "success": True,
        "data": {
            "total_buildings": len(BUILDINGS),
            "total_route_points": len(GPS_POINTS),
            "current_position": current_position,
            "last_update": last_update_time,
            "uptime_seconds": time.time() - app.config.get('START_TIME', time.time())
        }
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found",
        "available_endpoints": [
            "/api/tram/status",
            "/api/tram/position",
            "/api/tram/simulate",
            "/api/buildings",
            "/api/route",
            "/api/stats"
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    app.config['START_TIME'] = time.time()
    
    # Get configuration from environment
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    
    print(f"🚀 Starting AU Tram Tracking API")
    print(f"📡 Server running on http://{host}:{port}")
    print(f"🏢 Buildings: {len(BUILDINGS)}")
    print(f"🗺️  Route points: {len(GPS_POINTS)}")
    
    app.run(host=host, port=port, debug=debug) 