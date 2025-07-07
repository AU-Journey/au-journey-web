import * as THREE from 'three';

class TramTracker {
  constructor() {
    // Simplified tram tracking state - mainly for frontend display
    this.currentStatus = 'Stopped';
    this.currentLocation = null;
    this.lastLocation = null;
    this.isMoving = false;
    this.nextBuilding = null;
    this.lastPassedBuilding = null;
    
    // Movement detection settings
    this.movementThreshold = 0.00001; // GPS coordinate difference to detect movement
    this.stoppedDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    // Tracking history
    this.locationHistory = [];
    this.maxHistoryLength = 10;
    this.lastUpdateTime = Date.now();
    this.lastMovementTime = Date.now();
    
    // Updated building coordinates with optimized radius to match backend
    this.buildings = [
      {
        id: 'msm_building',
        name: 'MSM Building',
        displayName: 'MSM Building',
        lat: 13.612565,
        lon: 100.836516,
        radius: 0.0005,  // Optimized radius: ~55 meters for reliable detection
        stopIndex: 0
      },
      {
        id: 'it_building',
        name: 'IT Building',
        displayName: 'IT Building',
        lat: 13.612177,
        lon: 100.836425,
        radius: 0.0005,  // Optimized radius: ~55 meters for reliable detection
        stopIndex: 1
      },
      {
        id: 'au_mall',
        name: 'AU Mall',
        displayName: 'AU Mall',
        lat: 13.612764,
        lon: 100.833440,
        radius: 0.0005,  // Optimized radius: ~55 meters for reliable detection
        stopIndex: 2
      },
      {
        id: 'queen_of_sheba',
        name: 'Queen of Sheba',
        displayName: 'Queen of Sheba',
        lat: 13.614219,
        lon: 100.832132,
        radius: 0.0005,  // Optimized radius: ~55 meters for reliable detection
        stopIndex: 3
      }
    ];
    
    // Continuous loop sequence - MSM → IT → AU Mall → Queen of Sheba → MSM
    this.loopSequence = [
      'msm_building',
      'it_building',
      'au_mall',
      'queen_of_sheba'
    ];
    
    // Status change callbacks
    this.statusChangeCallbacks = [];
    this.lastNotifiedStatus = null;
    
    console.log('🚋 TramTracker initialized with continuous loop logic');
    console.log('📍 Tram stops (continuous loop):', this.buildings.map(b => b.displayName).join(' → ') + ' → MSM');
  }
  
  // Get next building in continuous loop: MSM → IT → AU Mall → Queen of Sheba → MSM
  getNextBuilding(currentBuildingId) {
    if (!currentBuildingId) {
      return this.buildings[0]; // Start with MSM
    }
    
    try {
      // Find current building in the loop sequence
      const currentIndex = this.loopSequence.findIndex(id => id === currentBuildingId);
      if (currentIndex === -1) {
        return this.buildings[0]; // Default to MSM if not found
      }
      
      // Get next building in loop (wraps around to MSM after Queen of Sheba)
      const nextIndex = (currentIndex + 1) % this.loopSequence.length;
      const nextBuildingId = this.loopSequence[nextIndex];
      
      // Find the building object
      return this.buildings.find(b => b.id === nextBuildingId) || this.buildings[0];
      
    } catch (error) {
      console.error('Error getting next building:', error);
      return this.buildings[0]; // Default to MSM
    }
  }
  
  // Improved position update with continuous loop logic
  updatePosition(lat, lon) {
    const currentTime = Date.now();
    const newLocation = { lat, lon, timestamp: currentTime };
    
    // Store previous location
    this.lastLocation = this.currentLocation;
    this.currentLocation = newLocation;
    
    // Add to history
    this.addToHistory(newLocation);
    
    // Detect movement
    this.detectMovement();
    
    // Check for building detection
    this.detectBuilding(lat, lon);
    
    // Update status with continuous loop logic
    this.updateStatus();
    
    this.lastUpdateTime = currentTime;
    
    return this.getTrackingInfo();
  }
  
  addToHistory(location) {
    this.locationHistory.push(location);
    if (this.locationHistory.length > this.maxHistoryLength) {
      this.locationHistory.shift();
    }
  }
  
  // Detect if tram is near a building
  detectBuilding(lat, lon) {
    for (const building of this.buildings) {
      const distance = this.calculateDistance(lat, lon, building.lat, building.lon);
      
      if (distance <= building.radius) {
        // We're inside a building's radius
        if (!this.lastPassedBuilding || building.id !== this.lastPassedBuilding.id) {
          // New building detected
          console.log(`🏢 Frontend: Tram entered building: ${building.displayName}`);
          this.lastPassedBuilding = building;
          this.nextBuilding = this.getNextBuilding(building.id);
          console.log(`🎯 Frontend: Next destination updated: ${this.nextBuilding.displayName} (continuous loop)`);
        }
        return building;
      }
    }
    return null;
  }
  
  // Improved movement detection
  detectMovement() {
    if (!this.lastLocation || !this.currentLocation) {
      this.isMoving = false;
      return;
    }
    
    // Calculate distance moved
    const distance = this.calculateDistance(
      this.lastLocation.lat, this.lastLocation.lon,
      this.currentLocation.lat, this.currentLocation.lon
    );
    
    // Check if moved significantly (more sensitive threshold)
    if (distance > this.movementThreshold) {
      this.isMoving = true;
      this.lastMovementTime = Date.now();
    } else {
      // Check if stopped for 30 minutes
      const timeSinceMovement = Date.now() - this.lastMovementTime;
      this.isMoving = timeSinceMovement < this.stoppedDuration;
    }
  }
  
  // Improved status update with continuous loop logic
  updateStatus() {
    const currentTime = Date.now();
    const timeSinceMovement = currentTime - this.lastMovementTime;
    
    if (timeSinceMovement >= this.stoppedDuration) {
      // Stopped for 30+ minutes
      this.currentStatus = 'Stopped';
    } else {
      // Running - show continuous loop heading status
      this.currentStatus = 'Running';
    }
    
    // Notify status change if needed
    this.checkStatusChange();
  }
  
  // Get heading status - always "Heading to" in continuous loop
  getHeadingStatus() {
    if (this.nextBuilding && this.currentStatus === 'Running') {
      return `Heading to ${this.nextBuilding.displayName}`;
    }
    return null;
  }
  
  // Check for status changes and notify subscribers
  checkStatusChange() {
    if (this.currentStatus !== this.lastNotifiedStatus) {
      console.log(`📊 Frontend Tram status: ${this.lastNotifiedStatus || 'Unknown'} → ${this.currentStatus}`);
      
      // Notify all status change callbacks
      this.statusChangeCallbacks.forEach(callback => {
        try {
          callback({
            oldStatus: this.lastNotifiedStatus,
            newStatus: this.currentStatus,
            location: this.currentLocation,
            headingTo: this.getHeadingStatus(),
            timestamp: Date.now()
          });
        } catch (error) {
          console.error('Error calling status change callback:', error);
        }
      });
      
      this.lastNotifiedStatus = this.currentStatus;
    }
  }
  
  // Subscribe to status changes
  onStatusChange(callback) {
    if (typeof callback === 'function') {
      this.statusChangeCallbacks.push(callback);
      return true;
    }
    return false;
  }
  
  // Unsubscribe from status changes
  offStatusChange(callback) {
    const index = this.statusChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.statusChangeCallbacks.splice(index, 1);
      return true;
    }
    return false;
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
  
  // Improved tracking info with continuous loop
  getTrackingInfo() {
    return {
      status: this.currentStatus,
      headingTo: this.getHeadingStatus(),
      isMoving: this.isMoving,
      currentLocation: this.currentLocation,
      lastPassedBuilding: this.lastPassedBuilding,
      nextBuilding: this.nextBuilding,
      timestamp: Date.now(),
      locationHistoryLength: this.locationHistory.length,
      timeSinceLastMovement: Date.now() - this.lastMovementTime
    };
  }
  
  // Improved API status with continuous loop
  getStatusForAPI() {
    const info = this.getTrackingInfo();
    
    return {
      tram_id: 'tram_01_frontend',
      currentStatus: this.currentStatus,
      headingTo: info.headingTo,
      location: {
        lat: info.currentLocation?.lat || null,
        lng: info.currentLocation?.lon || null
      },
      last_building: info.lastPassedBuilding?.name || null,
      timestamp: info.timestamp,
      is_moving: this.isMoving,
      time_since_movement_ms: info.timeSinceLastMovement
    };
  }
  
  // Reset tracking state
  reset() {
    this.currentStatus = 'Stopped';
    this.currentLocation = null;
    this.lastLocation = null;
    this.isMoving = false;
    this.nextBuilding = null;
    this.lastPassedBuilding = null;
    this.locationHistory = [];
    this.lastUpdateTime = Date.now();
    this.lastMovementTime = Date.now();
  }
  
  // Get all buildings
  getBuildings() {
    return this.buildings;
  }
}

export default TramTracker; 