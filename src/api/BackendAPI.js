/**
 * Backend API Client for AU Tram Tracking
 * Connects to Flask backend instead of local tracking logic
 */
class BackendAPI {
  constructor() {
    this.baseURL = 'http://localhost:5001/api';
    this.subscribers = [];
    this.lastStatusUpdate = null;
    this.updateInterval = 2000; // Poll every 2 seconds
    this.isRunning = false;
    this.intervalId = null;
    
    console.log('🌐 BackendAPI initialized');
    console.log('📡 Backend URL:', this.baseURL);
  }
  
  // Start polling the backend for updates
  startAPI() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => this.pollTramStatus(), this.updateInterval);
    
    // Initial status fetch
    this.pollTramStatus();
    
    // Expose global methods for testing
    window.getTramStatus = () => this.getCurrentStatus();
    window.subscribeTramStatus = (callback) => this.subscribe(callback);
    window.unsubscribeTramStatus = (callback) => this.unsubscribe(callback);
    window.updateTramPosition = (lat, lon) => this.updateTramPosition(lat, lon);
    window.startSimulation = (speed = 1.0) => this.startSimulation(speed);
    window.stopSimulation = () => this.stopSimulation();
    
    console.log('🚀 BackendAPI service started');
    console.log('💡 Available commands:');
    console.log('   - window.getTramStatus() - Get current status');
    console.log('   - window.updateTramPosition(lat, lon) - Update position');
    console.log('   - window.startSimulation(speed) - Start simulation');
    console.log('   - window.stopSimulation() - Stop simulation');
  }
  
  // Stop polling the backend
  stopAPI() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Clean up global methods
    delete window.getTramStatus;
    delete window.subscribeTramStatus;
    delete window.unsubscribeTramStatus;
    delete window.updateTramPosition;
    delete window.startSimulation;
    delete window.stopSimulation;
    
    console.log('⏹️ BackendAPI service stopped');
  }
  
  // Poll tram status from backend
  async pollTramStatus() {
    try {
      const response = await fetch(`${this.baseURL}/tram/status`);
      const result = await response.json();
      
      if (result.success) {
        const status = result.data;
        
        // Only notify if status has meaningfully changed
        if (this.hasStatusChanged(status)) {
          this.lastStatusUpdate = { ...status, api_timestamp: Date.now() };
          this.notifySubscribers(this.lastStatusUpdate);
        }
      } else {
        console.warn('❌ Backend API error:', result.error);
      }
    } catch (error) {
      console.error('❌ Failed to fetch tram status:', error);
      // Could implement fallback or retry logic here
    }
  }
  
  // Check if status has meaningfully changed
  hasStatusChanged(newStatus) {
    if (!this.lastStatusUpdate) return true;
    
    const keys = ['currentStatus', 'headingTo', 'last_building'];
    return keys.some(key => this.lastStatusUpdate[key] !== newStatus[key]);
  }
  
  // Get current tram status (REST endpoint)
  async getCurrentStatus() {
    try {
      const response = await fetch(`${this.baseURL}/tram/status`);
      const result = await response.json();
      
      if (result.success) {
        return {
          ...result.data,
          api_timestamp: Date.now()
        };
      } else {
        return {
          error: result.error,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      return {
        error: 'Failed to connect to backend',
        timestamp: Date.now()
      };
    }
  }
  
  // Update tram position via backend
  async updateTramPosition(lat, lon) {
    try {
      const response = await fetch(`${this.baseURL}/tram/position`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lon })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Position updated:', lat, lon);
        // Force an immediate status update
        this.pollTramStatus();
        return result.data;
      } else {
        console.error('❌ Failed to update position:', result.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Network error updating position:', error);
      return null;
    }
  }
  
  // Start simulation via backend
  async startSimulation(speed = 1.0) {
    try {
      const response = await fetch(`${this.baseURL}/tram/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ speed })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Simulation started:', result.message);
        return result.data;
      } else {
        console.error('❌ Failed to start simulation:', result.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Network error starting simulation:', error);
      return null;
    }
  }
  
  // Stop simulation via backend
  async stopSimulation() {
    try {
      const response = await fetch(`${this.baseURL}/tram/simulate/stop`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Simulation stopped:', result.message);
        return true;
      } else {
        console.error('❌ Failed to stop simulation:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Network error stopping simulation:', error);
      return false;
    }
  }
  
  // Subscribe to status updates
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.error('❌ Subscribe callback must be a function');
      return false;
    }
    
    if (!this.subscribers.includes(callback)) {
      this.subscribers.push(callback);
      console.log('✅ New subscriber added. Total subscribers:', this.subscribers.length);
      
      // Send current status immediately if available
      if (this.lastStatusUpdate) {
        try {
          callback(this.lastStatusUpdate);
        } catch (error) {
          console.error('❌ Error calling subscriber callback:', error);
        }
      }
      
      return true;
    }
    
    return false;
  }
  
  // Unsubscribe from status updates
  unsubscribe(callback) {
    const index = this.subscribers.indexOf(callback);
    if (index > -1) {
      this.subscribers.splice(index, 1);
      console.log('✅ Subscriber removed. Total subscribers:', this.subscribers.length);
      return true;
    }
    return false;
  }
  
  // Notify all subscribers
  notifySubscribers(status) {
    if (this.subscribers.length === 0) return;
    
    console.log('📡 Broadcasting to', this.subscribers.length, 'subscribers:', 
                `${status.currentStatus} | ${status.headingTo || 'No destination'}`);
    
    this.subscribers.forEach((callback, index) => {
      try {
        callback(status);
      } catch (error) {
        console.error(`❌ Error calling subscriber ${index}:`, error);
        // Remove problematic subscribers
        this.subscribers.splice(index, 1);
      }
    });
  }
  
  // Get API statistics
  getAPIStats() {
    return {
      isRunning: this.isRunning,
      subscribers: this.subscribers.length,
      lastUpdate: this.lastStatusUpdate?.api_timestamp || null,
      updateInterval: this.updateInterval,
      backendURL: this.baseURL
    };
  }
  
  // Set update interval
  setUpdateInterval(milliseconds) {
    this.updateInterval = Math.max(1000, milliseconds); // Minimum 1 second
    
    if (this.isRunning) {
      this.stopAPI();
      this.startAPI();
    }
    
    console.log('⏱️ Update interval set to', this.updateInterval, 'ms');
  }
  
  // Get backend health
  async getBackendHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/`);
      const result = await response.json();
      
      console.log('🏥 Backend health:', result);
      return result;
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  // Get buildings from backend
  async getBuildings() {
    try {
      const response = await fetch(`${this.baseURL}/buildings`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        console.error('❌ Failed to get buildings:', result.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Network error getting buildings:', error);
      return [];
    }
  }
  
  // Get route from backend
  async getRoute() {
    try {
      const response = await fetch(`${this.baseURL}/route`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        console.error('❌ Failed to get route:', result.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Network error getting route:', error);
      return [];
    }
  }
  
  // iOS Integration Helper - Format for URLSession
  getIOSCompatibleStatus() {
    return this.getCurrentStatus();
  }
  
  // Demo method for iOS developers
  async startIOSDemo() {
    console.log('📱 Starting iOS Demo Mode...');
    console.log('💡 Backend API endpoints:');
    console.log(`   GET  ${this.baseURL}/tram/status - Get tram status`);
    console.log(`   POST ${this.baseURL}/tram/position - Update position`);
    console.log(`   POST ${this.baseURL}/tram/simulate - Start simulation`);
    console.log(`   GET  ${this.baseURL}/buildings - Get buildings`);
    console.log('');
    console.log('💡 JavaScript examples:');
    console.log('   window.getTramStatus() - Get current status');
    console.log('   window.updateTramPosition(13.612263, 100.836828) - Update position');
    console.log('   window.startSimulation(2.0) - Start fast simulation');
    
    // Start API if not running
    if (!this.isRunning) {
      this.startAPI();
    }
    
    // Check backend health
    const health = await this.getBackendHealth();
    console.log('🏥 Backend health check:', health);
    
    // Add a demo subscriber
    this.subscribe((status) => {
      console.log(`📱 iOS Update: currentStatus="${status.currentStatus}" | headingTo="${status.headingTo || 'None'}"`);
      console.log('📊 Full API Response:', JSON.stringify(status, null, 2));
    });
    
    // Start a slow simulation for demo
    setTimeout(() => {
      this.startSimulation(0.5); // Slow simulation
      console.log('🎬 Demo simulation started at 0.5x speed');
    }, 2000);
  }
}

export default BackendAPI; 