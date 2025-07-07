"""
Tram Tracking Logic for AU University Tram System
"""
import time
import math
import threading
from datetime import datetime
from gps_data import GPS_POINTS, BUILDINGS

class TramTracker:
    def __init__(self):
        self.current_position = None
        self.last_update_time = None
        self.last_movement_time = time.time()  # Track when tram last moved
        self.location_history = []
        self.max_history = 10
        
        # Route tracking - simplified for continuous loop
        self.last_passed_building = None
        self.next_building = None
        self.has_left_building_radius = True  # Track if tram has left the last building's radius
        
        # Movement detection settings
        self.movement_threshold = 0.00001  # GPS coordinate difference to detect movement
        self.stopped_duration = 30 * 60  # 30 minutes in seconds
        
        # Simulation
        self.simulation_thread = None
        self.simulation_running = False
        self.simulation_index = 0
        
        # Debug logging throttle
        self.last_debug_log_time = 0
        self.debug_log_interval = 5  # seconds
        
        # Initialize with MSM as starting point
        self.initialize_route()
        
    def initialize_route(self):
        """Initialize route with MSM as starting point"""
        self.last_passed_building = None
        self.next_building = BUILDINGS[0]  # MSM Building
        self.has_left_building_radius = True
        
    def get_next_building(self, current_building_id):
        """Get the next building in continuous loop: MSM → IT → AU Mall → Queen of Sheba → MSM"""
        # Define the continuous loop sequence
        loop_sequence = ["msm_building", "it_building", "au_mall", "queen_of_sheba"]
        
        if not current_building_id:
            return BUILDINGS[0]  # Start with MSM
            
        try:
            # Find current building in the sequence
            current_index = next(i for i, building_id in enumerate(loop_sequence) if building_id == current_building_id)
            # Get next building in loop (wraps around to MSM after Queen of Sheba)
            next_index = (current_index + 1) % len(loop_sequence)
            next_building_id = loop_sequence[next_index]
            
            # Find the building object
            return next(b for b in BUILDINGS if b["id"] == next_building_id)
            
        except StopIteration:
            return BUILDINGS[0]  # Default to MSM if not found
    
    def detect_movement(self, lat, lon):
        """Detect if the tram has moved significantly"""
        if not self.current_position:
            return True  # First position update counts as movement
            
        # Calculate distance from last position
        distance = self.calculate_distance(
            self.current_position["lat"], self.current_position["lon"],
            lat, lon
        )
        
        # Convert to meters (approximate)
        distance_meters = distance * 111000
        
        # If moved more than ~3 meters, consider it movement (more sensitive)
        if distance_meters > 3:
            self.last_movement_time = time.time()
            return True
            
        return False
    
    def update_position(self, lat, lon):
        """Update tram position and detect buildings"""
        current_time = time.time()
        
        # Detect movement
        has_moved = self.detect_movement(lat, lon)
        
        # Update current position
        self.current_position = {
            "lat": lat,
            "lon": lon,
            "timestamp": current_time
        }
        
        # Debug logging for position updates
        if has_moved:
            print(f"📍 Tram position updated: {lat:.6f}, {lon:.6f}")
        
        # Add to history
        self.location_history.append(self.current_position.copy())
        if len(self.location_history) > self.max_history:
            self.location_history.pop(0)
            
        # Check for nearby buildings
        detected_building = self.detect_building(lat, lon)
        
        if detected_building:
            # We're inside a building's radius
            if not self.last_passed_building or detected_building["id"] != self.last_passed_building["id"]:
                # New building detected
                print(f"🏢 Tram entered building: {detected_building['displayName']}")
                self.last_passed_building = detected_building
                self.next_building = self.get_next_building(detected_building["id"])
                self.has_left_building_radius = False
                print(f"🎯 Next destination updated: {self.next_building['displayName']}")
        else:
            # We're outside any building radius
            if self.last_passed_building and not self.has_left_building_radius:
                # We just left a building's radius
                print(f"🚪 Tram left building: {self.last_passed_building['displayName']}")
                self.has_left_building_radius = True
            
        self.last_update_time = current_time
        
        return self.get_tracking_info()
    
    def detect_building(self, lat, lon):
        """Detect if tram is near a building"""
        current_time = time.time()
        should_log = (current_time - self.last_debug_log_time) >= self.debug_log_interval
        
        for building in BUILDINGS:
            distance = self.calculate_distance(lat, lon, building["lat"], building["lon"])
            # Debug: print distance to each building (throttled)
            if should_log:
                distance_meters = distance * 111000
                print(f"🏢 Distance to {building['displayName']}: {distance_meters:.1f}m (radius: {building['radius']*111000:.1f}m)")
            if distance <= building["radius"]:
                return building
        
        if should_log:
            self.last_debug_log_time = current_time
        
        return None
    
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two GPS coordinates in degrees"""
        return math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2)
    
    def is_tram_stopped(self):
        """Check if tram has been stopped for 30+ minutes"""
        current_time = time.time()
        time_since_movement = current_time - self.last_movement_time
        return time_since_movement >= self.stopped_duration
    
    def get_status(self):
        """Get current tram status"""
        # Check if stopped for 30+ minutes
        if self.is_tram_stopped():
            status = "Stopped"
        else:
            status = "Running"
        
        # Always show "Heading to" next building when tram is running (continuous loop)
        if self.next_building and not self.is_tram_stopped():
            heading_to = f"Heading to {self.next_building['displayName']}"
        else:
            heading_to = None
            
        return {
            "status": status,
            "headingTo": heading_to,
            "lastPassedBuilding": self.last_passed_building,
            "nextBuilding": self.next_building,
            "currentLocation": self.current_position,
            "timestamp": int(time.time() * 1000),
            "timeSinceMovement": int(time.time() - self.last_movement_time)
        }
    
    def get_tracking_info(self):
        """Get detailed tracking information"""
        status_info = self.get_status()
        
        return {
            "status": status_info["status"],
            "headingTo": status_info["headingTo"],
            "lastPassedBuilding": status_info["lastPassedBuilding"],
            "nextBuilding": status_info["nextBuilding"],
            "currentLocation": status_info["currentLocation"],
            "locationHistoryLength": len(self.location_history),
            "timestamp": status_info["timestamp"],
            "timeSinceMovement": status_info["timeSinceMovement"]
        }
    
    def get_status_for_api(self):
        """Get status formatted for iOS API"""
        status = self.get_status()
        
        # Format heading text - always "Heading to" in continuous loop
        heading_text = None
        if status["headingTo"]:
            heading_text = f"Heading to {status['nextBuilding']['displayName']}"
        
        return {
            "tram_id": "tram_01",
            "currentStatus": status["status"],
            "headingTo": heading_text,
            "location": {
                "lat": self.current_position["lat"] if self.current_position else None,
                "lng": self.current_position["lon"] if self.current_position else None
            },
            "last_building": status["lastPassedBuilding"]["name"] if status["lastPassedBuilding"] else None,
            "timestamp": status["timestamp"],
            "time_since_movement_seconds": status["timeSinceMovement"]
        }
    
    def start_simulation(self, speed_multiplier=1.0):
        """Start tram simulation along the route"""
        if self.simulation_running:
            return {"message": "Simulation already running"}
            
        self.simulation_running = True
        
        # Reset movement time when starting simulation
        self.last_movement_time = time.time()
        
        self.simulation_thread = threading.Thread(
            target=self._simulation_loop,
            args=(speed_multiplier,)
        )
        self.simulation_thread.daemon = True
        self.simulation_thread.start()
        
        return {
            "message": "Simulation started",
            "speed_multiplier": speed_multiplier,
            "total_points": len(GPS_POINTS)
        }
    
    def stop_simulation(self):
        """Stop tram simulation"""
        self.simulation_running = False
        if self.simulation_thread:
            self.simulation_thread.join(timeout=1)
        return {"message": "Simulation stopped"}
    
    def _simulation_loop(self, speed_multiplier):
        """Simulation loop that moves tram along GPS points"""
        while self.simulation_running:
            # Get current GPS point
            gps_point = GPS_POINTS[self.simulation_index]
            
            # Update position
            self.update_position(gps_point["lat"], gps_point["lon"])
            
            # Move to next point
            self.simulation_index = (self.simulation_index + 1) % len(GPS_POINTS)
            
            # Sleep based on speed multiplier
            time.sleep(0.5 / speed_multiplier)
    
    def reset(self):
        """Reset tram tracker to initial state"""
        self.current_position = None
        self.last_update_time = None
        self.last_movement_time = time.time()
        self.location_history = []
        self.has_left_building_radius = True
        self.initialize_route()
        self.stop_simulation()
        self.simulation_index = 0 