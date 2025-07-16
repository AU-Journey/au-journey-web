// Browser-compatible Redis GPS Service
// Supports both direct Redis (Node.js) and HTTP API proxy (Browser)

class RedisGPSService {
  constructor(redisConfig = {}) {
    // Safely access environment variables (only available in Node.js)
    const env = (typeof process !== 'undefined' && process.env) ? process.env : {};
    
    this.config = {
      host: redisConfig.host || env.REDIS_HOST || 'redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
      port: redisConfig.port || env.REDIS_PORT || 15238,
      password: redisConfig.password || env.REDIS_PASSWORD || 'HOwS9Ta53CidWxys59VlS51v2yp88tY9',
      db: redisConfig.db || env.REDIS_DB || 0,
      ...redisConfig
    };
    
    // HTTP API proxy configuration for browser use
    this.proxyConfig = {
      baseUrl: redisConfig.proxyUrl || env.REDIS_PROXY_URL || this.getDefaultProxyUrl(),
      ...redisConfig.proxy
    };
    
    this.redis = null;
    this.isConnected = false;
    this.lastFetchTime = 0;
    this.fetchInterval = 1000; // Fetch every 1 second by default
    
    // Cache for GPS data
    this.currentGPS = null;
    this.previousGPS = null;
    
    // Connection retry settings
    this.maxRetries = 5;
    this.retryCount = 0;
    this.retryDelay = 2000;
    
    // Browser compatibility check
    this.isBrowserEnvironment = typeof window !== 'undefined';
    this.isNodeEnvironment = typeof process !== 'undefined' && process.versions && process.versions.node;
    
    // Only log in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('🔧 Redis GPS Service: Initialized for', this.isBrowserEnvironment ? 'Browser' : 'Node.js');
    }
    
    // Initialize connection based on environment
    this.initializeConnection();
  }
  
  async initializeConnection() {
    if (this.isBrowserEnvironment) {
      console.log('🌐 Redis GPS Service: Browser environment detected');
      console.log('🔄 Attempting to use HTTP proxy for Redis connection');
      await this.initializeBrowserMode();
    } else {
      await this.initializeRedisConnection();
    }
  }
  
  async initializeBrowserMode() {
    console.log('🎯 Redis GPS Service: Initializing browser-compatible mode');
    
    // Try to fetch data via HTTP proxy first
    try {
      const response = await fetch(`${this.proxyConfig.baseUrl}/redis/gps_data`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Redis GPS Service: HTTP proxy connection successful');
        this.isConnected = true;
        this.parseAndStoreGPSData(data);
        return;
      }
    } catch (error) {
      console.warn('⚠️ Redis HTTP proxy not available:', error.message);
    }
    
    // Fallback to simulation mode with realistic data
    console.log('🔄 Falling back to simulation mode');
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
    
    this.isConnected = true; // Mark as connected for simulation
    
    // Start simulated GPS updates that mimic real tram movement
    this.startRealisticGPSSimulation();
    
    // Reduced logging
  }

  // Get default proxy URL based on environment
  getDefaultProxyUrl() {
    // If running on localhost, use local proxy
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:3001/api';
    }
    
    // If running on Vercel/production, use the current domain
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api`;
    }
    
    // Fallback for server-side
    return 'http://localhost:3001/api';
  }

  // Parse and store GPS data from Redis format
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
      
      // Only log in development
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('📍 GPS data updated');
      }
    }
  }

  async initializeRedisConnection() {
    try {
      // Dynamic import for Redis client (Node.js only)
      const { default: Redis } = await import('ioredis');
      
      this.redis = new Redis(this.config);
      
      this.redis.on('connect', () => {
        console.log('🔗 Redis GPS Service: Connected to Redis directly');
        this.isConnected = true;
        this.retryCount = 0;
      });
      
      this.redis.on('error', (error) => {
        console.error('❌ Redis GPS Service: Connection error:', error);
        this.isConnected = false;
        this.handleConnectionError();
      });
      
      this.redis.on('close', () => {
        console.log('🔌 Redis GPS Service: Connection closed');
        this.isConnected = false;
      });
      
      // Test connection
      await this.redis.ping();
      console.log('✅ Redis GPS Service: Direct Redis connection test successful');
      
    } catch (error) {
      console.error('❌ Redis GPS Service: Failed to initialize Redis connection:', error);
      this.handleConnectionError();
    }
  }

  handleConnectionError() {
    // Don't retry if we're in a browser environment (use proxy instead)
    if (this.isBrowserEnvironment) {
      console.warn('🚫 Redis GPS Service: Browser detected - use HTTP API proxy instead');
      return;
    }
    
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Redis GPS Service: Retrying connection (${this.retryCount}/${this.maxRetries}) in ${this.retryDelay}ms`);
      
      setTimeout(() => {
        this.initializeRedisConnection();
      }, this.retryDelay);
      
      // Exponential backoff
      this.retryDelay *= 2;
    } else {
      console.error('💥 Redis GPS Service: Max retries reached. GPS data unavailable.');
      this.isConnected = false;
    }
  }
  
  async fetchGPSData() {
    // Use appropriate method based on environment
    if (this.isBrowserEnvironment) {
      return await this.fetchFromBrowser();
    } else if (this.isConnected && this.redis) {
      return await this.fetchFromRedis();
    } else {
      console.warn('⚠️ Redis GPS Service: Not connected to Redis');
      return {
        current: null,
        previous: null,
        fromCache: false,
        error: 'Redis not connected'
      };
    }
  }

  async fetchFromBrowser() {
    // Try to fetch from HTTP proxy first, fallback to simulation
    try {
      const url = `${this.proxyConfig.baseUrl}/redis/gps_data`;
      const response = await fetch(url);
      
      if (response.ok) {
        const gpsData = await response.json();
        this.parseAndStoreGPSData(gpsData);
        
        return {
          current: this.currentGPS,
          previous: this.previousGPS,
          fromCache: false,
          timestamp: Date.now(),
          status: gpsData.s || 'unknown',
          source: 'http-proxy'
        };
      }
    } catch (error) {
      // Silent fallback - only log critical errors in development
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('⚠️ Redis proxy unavailable, using simulation');
      }
    }
    
    // Fallback to simulation
    return this.fetchFromSimulation();
  }
  
  fetchFromSimulation() {
    // Return current simulation data
    return {
      current: this.currentGPS,
      previous: this.previousGPS,
      fromCache: false,
      timestamp: Date.now(),
      status: 'simulated'
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
      
      // Minimal logging for simulation
    }, 3000); // Update every 3 seconds
  }
  
  async fetchFromRedis() {
    // Throttle fetching to avoid overwhelming Redis
    const now = Date.now();
    if (now - this.lastFetchTime < this.fetchInterval) {
      return this.fetchFromCache();
    }
    
    try {
      // Fetch GPS data from Redis using your format
      // Expected format: {"c": {"lat": 13.612441, "lon": 100.836478, "t": "2025-07-15 07:39:12"}, "p": {"lat": 13.612412, "lon": 100.836585, "t": "2025-07-15 07:39:10"}, "s": "active"}
      const result = await this.redis.get('gps_data');
      
      if (result) {
        const gpsData = JSON.parse(result);
        
        // Use the parseAndStoreGPSData method for consistency
        this.parseAndStoreGPSData(gpsData);
        
        this.lastFetchTime = now;
        
        return {
          current: this.currentGPS,
          previous: this.previousGPS,
          fromCache: false,
          timestamp: now,
          status: gpsData.s || 'unknown'
        };
      } else {
        console.warn('⚠️ No GPS data found in Redis');
        return this.fetchFromCache();
      }
      
    } catch (error) {
      console.error('❌ Redis GPS Service: Failed to fetch GPS data:', error);
      return this.fetchFromCache();
    }
  }
  
  fetchFromCache() {
    return {
      current: this.currentGPS,
      previous: this.previousGPS,
      fromCache: true
    };
  }
  
  isValidGPSData(data) {
    if (!data) return false;
    
    // Handle both formats: direct {lat, lon} and Redis format
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
    
    // More sensitive change detection (about 0.5 meter)
    const tolerance = 0.000005; // roughly 0.5 meter in GPS coordinates
    const latDiff = Math.abs(current.lat - previous.lat);
    const lonDiff = Math.abs(current.lon - previous.lon);
    
    return latDiff > tolerance || lonDiff > tolerance;
  }
  
  // Check if GPS data is stale (no updates for a while)
  isGPSDataStale(timestamp, maxAgeMs = 60000) { // 60 seconds default (increased tolerance)
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
    return (bearing * 180 / Math.PI + 360) % 360; // Convert to degrees
  }
  
  // Set custom fetch interval
  setFetchInterval(intervalMs) {
    this.fetchInterval = Math.max(500, intervalMs); // Minimum 500ms
  }
  
  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      retryCount: this.retryCount,
      hasCurrentGPS: this.currentGPS !== null,
      hasPreviousGPS: this.previousGPS !== null,
      lastFetchTime: this.lastFetchTime,
      environment: this.isBrowserEnvironment ? 'browser' : 'node',
      connectionType: this.isBrowserEnvironment ? 'simulation' : 'direct-redis'
    };
  }
  
  // Cleanup and disconnect
  async disconnect() {
    if (this.redis) {
      await this.redis.disconnect();
      this.redis = null;
      this.isConnected = false;
      console.log('🔌 Redis GPS Service: Disconnected from Redis');
    } else {
      console.log('🔌 Redis GPS Service: Browser simulation stopped');
    }
  }
}

export default RedisGPSService; 