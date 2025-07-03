import * as THREE from 'three';

class TramTracker {
  constructor() {
    // Tram tracking state
    this.currentStatus = 'Stopped';
    this.currentLocation = null;
    this.lastLocation = null;
    this.isMoving = false;
    this.currentSpeed = 0;
    this.direction = null;
    this.nextBuilding = null;
    this.lastPassedBuilding = null;
    
    // Movement detection settings
    this.movementThreshold = 0.00001; // GPS coordinate difference to detect movement
    this.speedCalculationInterval = 2000; // Calculate speed every 2 seconds
    this.stoppedDuration = 5000; // Consider stopped after 5 seconds of no movement
    
    // Tracking history
    this.locationHistory = [];
    this.maxHistoryLength = 10;
    this.lastUpdateTime = Date.now();
    
    // Building checkpoints (AU University campus - Your specific route)
    // Note: Please provide the actual GPS coordinates for these buildings
    this.buildings = [
      {
        id: 'msm_building',
        name: 'MSM Building',
        lat: 13.612263, // Replace with actual coordinates
        lon: 100.836828, // Replace with actual coordinates
        radius: 0.0003 // ~30 meters detection radius
      },
      {
        id: 'it_building',
        name: 'IT Building',
        lat: 13.613051, // Replace with actual coordinates
        lon: 100.834310, // Replace with actual coordinates
        radius: 0.0003
      },
      {
        id: 'au_mall',
        name: 'AU Mall',
        lat: 13.613202, // Replace with actual coordinates
        lon: 100.833545, // Replace with actual coordinates
        radius: 0.0003
      },
      {
        id: 'queen_of_sheba',
        name: 'Queen of Sheba',
        lat: 13.614444, // Replace with actual coordinates
        lon: 100.831560, // Replace with actual coordinates
        radius: 0.0003
      }
    ];
    
    // Define the route sequence (order matters for direction prediction)
    this.routeSequence = [
      'msm_building',
      'it_building',
      'au_mall',
      'queen_of_sheba'
    ];
    
    console.log('🚋 TramTracker initialized with', this.buildings.length, 'building checkpoints');
  }
  
  // Main method to update tram position and calculate status
  updatePosition(lat, lon) {
    const currentTime = Date.now();
    const newLocation = { lat, lon, timestamp: currentTime };
    
    // Store previous location
    this.lastLocation = this.currentLocation;
    this.currentLocation = newLocation;
    
    // Add to history
    this.addToHistory(newLocation);
    
    // Calculate movement status
    this.calculateMovementStatus();
    
    // Detect nearby buildings
    this.detectNearbyBuildings();
    
    // Predict direction and next building
    this.predictDirection();
    
    // Update overall status
    this.updateStatus();
    
    this.lastUpdateTime = currentTime;
    
    // Return current tracking info
    return this.getTrackingInfo();
  }
  
  addToHistory(location) {
    this.locationHistory.push(location);
    if (this.locationHistory.length > this.maxHistoryLength) {
      this.locationHistory.shift();
    }
  }
  
  calculateMovementStatus() {
    if (!this.lastLocation || !this.currentLocation) {
      this.isMoving = false;
      this.currentSpeed = 0;
      return;
    }
    
    // Calculate distance moved
    const distance = this.calculateDistance(
      this.lastLocation.lat, this.lastLocation.lon,
      this.currentLocation.lat, this.currentLocation.lon
    );
    
    // Calculate time difference in seconds
    const timeDiff = (this.currentLocation.timestamp - this.lastLocation.timestamp) / 1000;
    
    // Calculate speed (m/s)
    this.currentSpeed = timeDiff > 0 ? (distance / timeDiff) : 0;
    
    // Determine if moving based on threshold
    this.isMoving = distance > this.movementThreshold && this.currentSpeed > 0.1; // 0.1 m/s threshold
  }
  
  detectNearbyBuildings() {
    if (!this.currentLocation) return;
    
    const nearbyBuildings = [];
    
    for (const building of this.buildings) {
      const distance = this.calculateDistance(
        this.currentLocation.lat, this.currentLocation.lon,
        building.lat, building.lon
      );
      
      // Convert radius to meters for comparison
      const radiusInMeters = building.radius * 111000; // Rough conversion
      
      if (distance <= radiusInMeters) {
        nearbyBuildings.push({
          ...building,
          distance: distance
        });
      }
    }
    
    // Sort by closest distance
    nearbyBuildings.sort((a, b) => a.distance - b.distance);
    
    // Update last passed building if we're near one
    if (nearbyBuildings.length > 0 && !this.isMoving) {
      this.lastPassedBuilding = nearbyBuildings[0];
    }
  }
  
  predictDirection() {
    if (!this.lastPassedBuilding || this.locationHistory.length < 3) {
      this.nextBuilding = null;
      this.direction = null;
      return;
    }
    
    // Find current building in route sequence
    const currentBuildingIndex = this.routeSequence.indexOf(this.lastPassedBuilding.id);
    
    if (currentBuildingIndex === -1) {
      this.nextBuilding = null;
      this.direction = null;
      return;
    }
    
    // Calculate movement vector from recent history
    const recentHistory = this.locationHistory.slice(-3);
    if (recentHistory.length < 2) return;
    
    const oldPos = recentHistory[0];
    const newPos = recentHistory[recentHistory.length - 1];
    
    const movementVector = {
      lat: newPos.lat - oldPos.lat,
      lon: newPos.lon - oldPos.lon
    };
    
    // Check next building in sequence
    const nextBuildingIndex = (currentBuildingIndex + 1) % this.routeSequence.length;
    const nextBuildingId = this.routeSequence[nextBuildingIndex];
    const nextBuilding = this.buildings.find(b => b.id === nextBuildingId);
    
    if (nextBuilding) {
      // Calculate vector to next building
      const toBuildingVector = {
        lat: nextBuilding.lat - this.currentLocation.lat,
        lon: nextBuilding.lon - this.currentLocation.lon
      };
      
      // Calculate dot product to determine if moving towards building
      const dotProduct = movementVector.lat * toBuildingVector.lat + 
                        movementVector.lon * toBuildingVector.lon;
      
      if (dotProduct > 0 && this.isMoving) {
        this.nextBuilding = nextBuilding;
        this.direction = 'towards';
      } else {
        // Check previous building in sequence (might be going backwards)
        const prevBuildingIndex = (currentBuildingIndex - 1 + this.routeSequence.length) % this.routeSequence.length;
        const prevBuildingId = this.routeSequence[prevBuildingIndex];
        const prevBuilding = this.buildings.find(b => b.id === prevBuildingId);
        
        if (prevBuilding) {
          const toPrevBuildingVector = {
            lat: prevBuilding.lat - this.currentLocation.lat,
            lon: prevBuilding.lon - this.currentLocation.lon
          };
          
          const prevDotProduct = movementVector.lat * toPrevBuildingVector.lat + 
                                movementVector.lon * toPrevBuildingVector.lon;
          
          if (prevDotProduct > 0 && this.isMoving) {
            this.nextBuilding = prevBuilding;
            this.direction = 'towards';
          }
        }
      }
    }
  }
  
  updateStatus() {
    if (!this.isMoving) {
      // Check if we've been stopped for a while
      const timeSinceLastMovement = Date.now() - this.lastUpdateTime;
      if (timeSinceLastMovement > this.stoppedDuration) {
        this.currentStatus = 'Stopped';
      } else {
        this.currentStatus = 'Slowing Down';
      }
    } else if (this.nextBuilding && this.direction === 'towards') {
      this.currentStatus = `Heading to ${this.nextBuilding.name}`;
    } else {
      this.currentStatus = 'Running';
    }
  }
  
  // Calculate distance between two GPS coordinates in meters
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  degreesToRadians(degrees) {
    return degrees * (Math.PI/180);
  }
  
  // Get comprehensive tracking information
  getTrackingInfo() {
    return {
      // Basic status
      status: this.currentStatus,
      isMoving: this.isMoving,
      speed: Math.round(this.currentSpeed * 3.6 * 100) / 100, // Convert to km/h with 2 decimals
      
      // Location info
      currentLocation: this.currentLocation,
      lastPassedBuilding: this.lastPassedBuilding,
      nextBuilding: this.nextBuilding,
      direction: this.direction,
      
      // Additional metadata
      timestamp: Date.now(),
      locationHistoryLength: this.locationHistory.length
    };
  }
  
  // Get status for API/iOS integration
  getStatusForAPI() {
    const info = this.getTrackingInfo();
    
    // Determine currentStatus for iOS
    let currentStatus = 'Stopped';
    if (info.isMoving) {
      currentStatus = 'Running';
    }
    
    // Determine headingTo for iOS
    let headingTo = null;
    if (info.nextBuilding) {
      headingTo = `Heading to ${info.nextBuilding.name}`;
    } else if (info.isMoving) {
      // If moving but no specific building detected, show general direction
      headingTo = 'Moving along route';
    }
    
    return {
      tram_id: 'tram_01', // You can make this dynamic
      currentStatus: currentStatus,
      headingTo: headingTo,
      // Additional data for debugging/advanced features
      speed_kmh: info.speed,
      location: {
        lat: info.currentLocation?.lat || null,
        lng: info.currentLocation?.lon || null
      },
      last_building: info.lastPassedBuilding?.name || null,
      timestamp: info.timestamp
    };
  }
  
  // Reset tracking state
  reset() {
    this.currentStatus = 'Stopped';
    this.currentLocation = null;
    this.lastLocation = null;
    this.isMoving = false;
    this.currentSpeed = 0;
    this.direction = null;
    this.nextBuilding = null;
    this.lastPassedBuilding = null;
    this.locationHistory = [];
    this.lastUpdateTime = Date.now();
  }
  
  // Add or update building checkpoints
  addBuilding(building) {
    const existingIndex = this.buildings.findIndex(b => b.id === building.id);
    if (existingIndex !== -1) {
      this.buildings[existingIndex] = building;
    } else {
      this.buildings.push(building);
    }
  }
  
  // Get all buildings
  getBuildings() {
    return this.buildings;
  }
  
  // Update route sequence
  updateRouteSequence(sequence) {
    this.routeSequence = sequence;
  }
}

export default TramTracker; 