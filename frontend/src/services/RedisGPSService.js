// Browser-compatible GPS Service
// Uses HTTP API proxy to communicate with Redis backend

class RedisGPSService {
  constructor(config = {}) {
    // HTTP API proxy configuration for browser use
    this.proxyConfig = {
      baseUrl: config.baseUrl || this.getDefaultProxyUrl(),
      timeout: config.timeout || 5000,
      ...config
    };
    
    this.isConnected = false;
    this.lastFetchTime = 0;
    this.fetchInterval = 1000; // Fetch every 1 second by default
    
    // Cache for GPS data
    this.currentGPS = null;
    this.previousGPS = null;
    
    // Initialize with default simulated data
    this.initializeSimulationData();
    
    console.log('🌐 GPS Service: Initialized for browser environment');
    console.log('🔄 API Base URL:', this.proxyConfig.baseUrl);
    
    // Test connection
    this.testConnection();
  }
  
  initializeSimulationData() {
    // Default position near AU (simulation)
    this.currentGPS = {
      lat: 13.612441,
      lon: 100.836478,
      timestamp: new Date().toISOString()
    };
    
    this.previousGPS = {
      lat: 13.612412,
      lon: 100.836585,
      timestamp: new Date(Date.now() - 2000).toISOString()
    };
    
    // Start realistic GPS simulation
    this.startRealisticGPSSimulation();
  }

  // Get default proxy URL based on environment
  getDefaultProxyUrl() {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = hostname === 'localhost' ? ':3001' : '';
      return `${protocol}//${hostname}${port}/api`;
    }
    return 'http://localhost:3001/api';
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.proxyConfig.baseUrl}/health`, {
        method: 'GET',
        timeout: this.proxyConfig.timeout
      });
      
      if (response.ok) {
        console.log('✅ GPS Service: Backend connection successful');
        this.isConnected = true;
        // Try to get real GPS data
        await this.fetchGPSData();
      } else {
        console.warn('⚠️ GPS Service: Backend not responding, using simulation');
        this.isConnected = false;
      }
    } catch (error) {
      console.warn('⚠️ GPS Service: Backend unavailable, using simulation');
      this.isConnected = false;
    }
  }

  // Parse and store GPS data from API response
  parseAndStoreGPSData(gpsData) {
    if (gpsData && typeof gpsData === 'object') {
      // Handle the format: {"c": {...}, "p": {...}, "s": "active"}
      if (gpsData.c && this.isValidGPSData(gpsData.c)) {
        this.currentGPS = {
          lat: gpsData.c.lat,
          lon: gpsData.c.lon,
          timestamp: gpsData.c.t || new Date().toISOString()
        };
      }
      
      if (gpsData.p && this.isValidGPSData(gpsData.p)) {
        this.previousGPS = {
          lat: gpsData.p.lat,
          lon: gpsData.p.lon,
          timestamp: gpsData.p.t || new Date().toISOString()
        };
      }
      
      console.log('📍 GPS data updated from backend');
    }
  }

  async fetchGPSData() {
    // Try to fetch from backend API first, fallback to simulation
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.proxyConfig.baseUrl}/redis/gps_data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: this.proxyConfig.timeout
        });
        
        if (response.ok) {
          const gpsData = await response.json();
          this.parseAndStoreGPSData(gpsData);
          
          return {
            current: this.currentGPS,
            previous: this.previousGPS,
            fromCache: false,
            timestamp: Date.now(),
            status: gpsData.s || 'unknown',
            source: 'backend-api'
          };
        }
      } catch (error) {
        console.warn('⚠️ GPS Service: Backend fetch failed, using simulation');
        this.isConnected = false;
      }
    }
    
    // Fallback to simulation
    return this.fetchFromSimulation();
  }
  
  fetchFromSimulation() {
    return {
      current: this.currentGPS,
      previous: this.previousGPS,
      fromCache: false,
      timestamp: Date.now(),
      status: 'simulated',
      source: 'simulation'
    };
  }
  
  startRealisticGPSSimulation() {
    // Simulate realistic tram movement every 3 seconds
    setInterval(() => {
      if (!this.currentGPS) return;
      
      // Store current as previous
      this.previousGPS = { ...this.currentGPS };
      
      // Generate realistic movement (small but detectable changes)
      const movementLat = (Math.random() - 0.5) * 0.00003; // ~3 meter movement
      const movementLon = (Math.random() - 0.5) * 0.00003;
      
      this.currentGPS = {
        lat: this.currentGPS.lat + movementLat,
        lon: this.currentGPS.lon + movementLon,
        timestamp: new Date().toISOString()
      };
    }, 3000); // Update every 3 seconds
  }
  
  isValidGPSData(data) {
    if (!data) return false;
    
    const lat = typeof data.lat === 'number' ? data.lat : parseFloat(data.lat);
    const lon = typeof data.lon === 'number' ? data.lon : parseFloat(data.lon);
    
    return !isNaN(lat) && !isNaN(lon) &&
           lat >= -90 && lat <= 90 &&
           lon >= -180 && lon <= 180;
  }
  
  // Get current GPS point
  async getCurrentGPS() {
    const data = await this.fetchGPSData();
    return data.current;
  }
  
  // Get previous GPS point
  async getPreviousGPS() {
    const data = await this.fetchGPSData();
    return data.previous;
  }
  
  // Get both current and previous GPS points
  async getBothGPSPoints() {
    return await this.fetchGPSData();
  }
  
  // Check if GPS coordinates have changed
  hasGPSChanged(current, previous) {
    if (!current || !previous) return false;
    
    const tolerance = 0.000005; // roughly 0.5 meter in GPS coordinates
    const latDiff = Math.abs(current.lat - previous.lat);
    const lonDiff = Math.abs(current.lon - previous.lon);
    
    return latDiff > tolerance || lonDiff > tolerance;
  }
  
  // Check if GPS data is stale
  isGPSDataStale(timestamp, maxAgeMs = 60000) {
    if (!timestamp) return true;
    
    const now = new Date();
    const gpsTime = new Date(timestamp);
    const age = now - gpsTime;
    
    return age > maxAgeMs;
  }
  
  // Calculate distance between two GPS points (in meters)
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
    return degrees * (Math.PI / 180);
  }
  
  // Calculate bearing between two GPS points
  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = this.degreesToRadians(lon2 - lon1);
    const lat1Rad = this.degreesToRadians(lat1);
    const lat2Rad = this.degreesToRadians(lat2);
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x);
    return (bearing * 180 / Math.PI + 360) % 360;
  }
  
  // Set custom fetch interval
  setFetchInterval(intervalMs) {
    this.fetchInterval = Math.max(500, intervalMs);
  }
  
  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasCurrentGPS: this.currentGPS !== null,
      hasPreviousGPS: this.previousGPS !== null,
      lastFetchTime: this.lastFetchTime,
      environment: 'browser',
      connectionType: this.isConnected ? 'backend-api' : 'simulation',
      apiUrl: this.proxyConfig.baseUrl
    };
  }
}

export default RedisGPSService; 