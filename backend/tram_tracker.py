import time
import math
import threading
from datetime import datetime
from gps_data import GPS_POINTS, BUILDINGS

class TramTracker:
    def __init__(self):
        # Tram tracking state
        self.current_status = 'Stopped'
        self.current_location = None
        self.last_location = None
        self.is_moving = False
        self.current_speed = 0
        self.direction = None
        self.next_building = None
        self.last_passed_building = None
        
        # Movement detection settings
        self.movement_threshold = 0.00001  # GPS coordinate difference to detect movement
        self.speed_calculation_interval = 2000  # Calculate speed every 2 seconds
        self.stopped_duration = 5000  # Consider stopped after 5 seconds of no movement
        
        # Tracking history
        self.location_history = []
        self.max_history_length = 10
        self.last_update_time = time.time() * 1000
        
        # Building checkpoints
        self.buildings = BUILDINGS
        
        # Define the route sequence (order matters for direction prediction)
        self.route_sequence = [
            'msm_building',
            'it_building', 
            'au_mall',
            'queen_of_sheba'
        ]
        
        # Simulation state
        self.is_simulating = False
        self.simulation_thread = None
        self.simulation_index = 0
        self.simulation_speed = 1.0
        
        print(f'🚋 TramTracker initialized with {len(self.buildings)} building checkpoints')
    
    def update_position(self, lat, lon):
        """Main method to update tram position and calculate status"""
        current_time = time.time() * 1000
        new_location = {"lat": lat, "lon": lon, "timestamp": current_time}
        
        # Store previous location
        self.last_location = self.current_location
        self.current_location = new_location
        
        # Add to history
        self.add_to_history(new_location)
        
        # Calculate movement status
        self.calculate_movement_status()
        
        # Detect nearby buildings
        self.detect_nearby_buildings()
        
        # Predict direction and next building
        self.predict_direction()
        
        # Update overall status
        self.update_status()
        
        self.last_update_time = current_time
        
        # Return current tracking info
        return self.get_tracking_info()
    
    def add_to_history(self, location):
        """Add location to tracking history"""
        self.location_history.append(location)
        if len(self.location_history) > self.max_history_length:
            self.location_history.pop(0)
    
    def calculate_movement_status(self):
        """Calculate if tram is moving and current speed"""
        if not self.last_location or not self.current_location:
            self.is_moving = False
            self.current_speed = 0
            return
        
        # Calculate distance moved
        distance = self.calculate_distance(
            self.last_location["lat"], self.last_location["lon"],
            self.current_location["lat"], self.current_location["lon"]
        )
        
        # Calculate time difference in seconds
        time_diff = (self.current_location["timestamp"] - self.last_location["timestamp"]) / 1000
        
        # Calculate speed (m/s)
        self.current_speed = (distance / time_diff) if time_diff > 0 else 0
        
        # Determine if moving based on threshold
        self.is_moving = distance > self.movement_threshold and self.current_speed > 0.1  # 0.1 m/s threshold
    
    def detect_nearby_buildings(self):
        """Detect nearby buildings based on current position"""
        if not self.current_location:
            return
        
        nearby_buildings = []
        
        for building in self.buildings:
            distance = self.calculate_distance(
                self.current_location["lat"], self.current_location["lon"],
                building["lat"], building["lon"]
            )
            
            # Convert radius to meters for comparison
            radius_in_meters = building["radius"] * 111000  # Rough conversion
            
            if distance <= radius_in_meters:
                nearby_buildings.append({
                    **building,
                    "distance": distance
                })
        
        # Sort by closest distance
        nearby_buildings.sort(key=lambda x: x["distance"])
        
        # Update last passed building if we're near one
        if nearby_buildings and not self.is_moving:
            self.last_passed_building = nearby_buildings[0]
    
    def predict_direction(self):
        """Predict direction and next building based on movement history"""
        if not self.last_passed_building or len(self.location_history) < 3:
            self.next_building = None
            self.direction = None
            return
        
        # Find current building in route sequence
        current_building_index = -1
        for i, building_id in enumerate(self.route_sequence):
            if building_id == self.last_passed_building["id"]:
                current_building_index = i
                break
        
        if current_building_index == -1:
            self.next_building = None
            self.direction = None
            return
        
        # Calculate movement vector from recent history
        recent_history = self.location_history[-3:]
        if len(recent_history) < 2:
            return
        
        old_pos = recent_history[0]
        new_pos = recent_history[-1]
        
        movement_vector = {
            "lat": new_pos["lat"] - old_pos["lat"],
            "lon": new_pos["lon"] - old_pos["lon"]
        }
        
        # Check next building in sequence
        next_building_index = (current_building_index + 1) % len(self.route_sequence)
        next_building_id = self.route_sequence[next_building_index]
        next_building = next(b for b in self.buildings if b["id"] == next_building_id)
        
        if next_building:
            # Calculate vector to next building
            to_building_vector = {
                "lat": next_building["lat"] - self.current_location["lat"],
                "lon": next_building["lon"] - self.current_location["lon"]
            }
            
            # Calculate dot product to determine if moving towards building
            dot_product = (movement_vector["lat"] * to_building_vector["lat"] + 
                          movement_vector["lon"] * to_building_vector["lon"])
            
            if dot_product > 0 and self.is_moving:
                self.next_building = next_building
                self.direction = 'towards'
            else:
                # Check previous building in sequence (might be going backwards)
                prev_building_index = (current_building_index - 1 + len(self.route_sequence)) % len(self.route_sequence)
                prev_building_id = self.route_sequence[prev_building_index]
                prev_building = next(b for b in self.buildings if b["id"] == prev_building_id)
                
                if prev_building:
                    to_prev_building_vector = {
                        "lat": prev_building["lat"] - self.current_location["lat"],
                        "lon": prev_building["lon"] - self.current_location["lon"]
                    }
                    
                    prev_dot_product = (movement_vector["lat"] * to_prev_building_vector["lat"] + 
                                       movement_vector["lon"] * to_prev_building_vector["lon"])
                    
                    if prev_dot_product > 0 and self.is_moving:
                        self.next_building = prev_building
                        self.direction = 'towards'
    
    def update_status(self):
        """Update overall tram status"""
        if not self.is_moving:
            # Check if we've been stopped for a while
            time_since_last_movement = time.time() * 1000 - self.last_update_time
            if time_since_last_movement > self.stopped_duration:
                self.current_status = 'Stopped'
            else:
                self.current_status = 'Slowing Down'
        elif self.next_building and self.direction == 'towards':
            self.current_status = f'Heading to {self.next_building["name"]}'
        else:
            self.current_status = 'Running'
    
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two GPS coordinates in meters"""
        R = 6371000  # Earth's radius in meters
        d_lat = self.degrees_to_radians(lat2 - lat1)
        d_lon = self.degrees_to_radians(lon2 - lon1)
        a = (math.sin(d_lat/2) * math.sin(d_lat/2) +
             math.cos(self.degrees_to_radians(lat1)) * math.cos(self.degrees_to_radians(lat2)) *
             math.sin(d_lon/2) * math.sin(d_lon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c
    
    def degrees_to_radians(self, degrees):
        """Convert degrees to radians"""
        return degrees * (math.pi / 180)
    
    def get_tracking_info(self):
        """Get comprehensive tracking information"""
        return {
            # Basic status
            "status": self.current_status,
            "isMoving": self.is_moving,
            "speed": round(self.current_speed * 3.6, 2),  # Convert to km/h with 2 decimals
            
            # Location info
            "currentLocation": self.current_location,
            "lastPassedBuilding": self.last_passed_building,
            "nextBuilding": self.next_building,
            "direction": self.direction,
            
            # Additional metadata
            "timestamp": int(time.time() * 1000),
            "locationHistoryLength": len(self.location_history)
        }
    
    def get_status_for_api(self):
        """Get status formatted for API/iOS integration"""
        info = self.get_tracking_info()
        
        # Determine currentStatus for iOS
        current_status = 'Stopped'
        if info["isMoving"]:
            current_status = 'Running'
        
        # Determine headingTo for iOS
        heading_to = None
        if info["nextBuilding"]:
            heading_to = f'Heading to {info["nextBuilding"]["name"]}'
        elif info["isMoving"]:
            # If moving but no specific building detected, show general direction
            heading_to = 'Moving along route'
        
        return {
            "tram_id": "tram_01",  # You can make this dynamic
            "currentStatus": current_status,
            "headingTo": heading_to,
            # Additional data for debugging/advanced features
            "speed_kmh": info["speed"],
            "location": {
                "lat": info["currentLocation"]["lat"] if info["currentLocation"] else None,
                "lng": info["currentLocation"]["lon"] if info["currentLocation"] else None
            },
            "last_building": info["lastPassedBuilding"]["name"] if info["lastPassedBuilding"] else None,
            "timestamp": info["timestamp"]
        }
    
    def reset(self):
        """Reset tracking state"""
        self.current_status = 'Stopped'
        self.current_location = None
        self.last_location = None
        self.is_moving = False
        self.current_speed = 0
        self.direction = None
        self.next_building = None
        self.last_passed_building = None
        self.location_history = []
        self.last_update_time = time.time() * 1000
    
    # Simulation methods for testing
    def start_simulation(self, speed_multiplier=1.0):
        """Start simulating tram movement for testing"""
        if self.is_simulating:
            return {"message": "Simulation already running"}
        
        self.is_simulating = True
        self.simulation_speed = speed_multiplier
        self.simulation_index = 0
        
        self.simulation_thread = threading.Thread(target=self._run_simulation)
        self.simulation_thread.daemon = True
        self.simulation_thread.start()
        
        return {
            "message": "Simulation started",
            "speed_multiplier": speed_multiplier,
            "total_points": len(GPS_POINTS)
        }
    
    def stop_simulation(self):
        """Stop the simulation"""
        self.is_simulating = False
        if self.simulation_thread:
            self.simulation_thread.join(timeout=1)
    
    def _run_simulation(self):
        """Internal method to run the simulation"""
        while self.is_simulating and self.simulation_index < len(GPS_POINTS):
            point = GPS_POINTS[self.simulation_index]
            self.update_position(point["lat"], point["lon"])
            
            # Delay based on speed multiplier
            delay = max(0.1, 2.0 / self.simulation_speed)  # Base delay of 2 seconds
            time.sleep(delay)
            
            self.simulation_index += 1
            
            # Loop back to start
            if self.simulation_index >= len(GPS_POINTS):
                self.simulation_index = 0
        
        self.is_simulating = False 