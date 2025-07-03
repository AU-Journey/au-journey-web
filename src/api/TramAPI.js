class TramAPI {
  constructor(schoolMap) {
    this.schoolMap = schoolMap;
    this.subscribers = [];
    this.lastStatusUpdate = null;
    this.updateInterval = 1000; // Update every 1 second
    this.isRunning = false;
    
    // Bind methods
    this.startAPI = this.startAPI.bind(this);
    this.stopAPI = this.stopAPI.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    
    console.log('🌐 TramAPI initialized');
  }
  
  // Start the API service
  startAPI() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(this.updateStatus, this.updateInterval);
    
    // Also expose global methods for testing
    window.getTramStatus = () => this.getCurrentStatus();
    window.subscribeTramStatus = (callback) => this.subscribe(callback);
    window.unsubscribeTramStatus = (callback) => this.unsubscribe(callback);
    
    console.log('🚀 TramAPI service started');
    console.log('💡 Use window.getTramStatus() in console to get current status');
    console.log('💡 Use window.subscribeTramStatus(callback) to listen for updates');
  }
  
  // Stop the API service
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
    
    console.log('⏹️ TramAPI service stopped');
  }
  
  // Update status and notify subscribers
  updateStatus() {
    if (!this.schoolMap) return;
    
    const currentStatus = this.schoolMap.getTramStatusAPI();
    if (!currentStatus) return;
    
    // Only notify if status has meaningfully changed
    if (this.hasStatusChanged(currentStatus)) {
      this.lastStatusUpdate = { ...currentStatus, api_timestamp: Date.now() };
      this.notifySubscribers(this.lastStatusUpdate);
    }
  }
  
  // Check if status has meaningfully changed
  hasStatusChanged(newStatus) {
    if (!this.lastStatusUpdate) return true;
    
    const keys = ['currentStatus', 'headingTo', 'last_building'];
    return keys.some(key => this.lastStatusUpdate[key] !== newStatus[key]);
  }
  
  // Get current tram status (REST endpoint simulation)
  getCurrentStatus() {
    if (!this.schoolMap) {
      return {
        error: 'Tram system not initialized',
        timestamp: Date.now()
      };
    }
    
    const status = this.schoolMap.getTramStatusAPI();
    if (!status) {
      return {
        tram_id: 'tram_01',
        currentStatus: 'Stopped',
        headingTo: null,
        speed_kmh: 0,
        location: { lat: null, lng: null },
        last_building: null,
        timestamp: Date.now(),
        api_timestamp: Date.now()
      };
    }
    
    return {
      ...status,
      api_timestamp: Date.now()
    };
  }
  
  // Subscribe to status updates (WebSocket simulation)
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.error('❌ Subscribe callback must be a function');
      return false;
    }
    
    if (!this.subscribers.includes(callback)) {
      this.subscribers.push(callback);
      console.log('✅ New subscriber added. Total subscribers:', this.subscribers.length);
      
      // Send current status immediately
      const currentStatus = this.getCurrentStatus();
      try {
        callback(currentStatus);
      } catch (error) {
        console.error('❌ Error calling subscriber callback:', error);
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
      updateInterval: this.updateInterval
    };
  }
  
  // Set update interval
  setUpdateInterval(milliseconds) {
    this.updateInterval = Math.max(500, milliseconds); // Minimum 500ms
    
    if (this.isRunning) {
      this.stopAPI();
      this.startAPI();
    }
    
    console.log('⏱️ Update interval set to', this.updateInterval, 'ms');
  }
  
  // iOS Integration Helper - Format for URLSession
  getIOSCompatibleStatus() {
    const status = this.getCurrentStatus();
    
    return {
      success: true,
      data: status,
      metadata: {
        api_version: '1.0',
        response_time: Date.now(),
        buildings_count: this.schoolMap?.tramTracker?.buildings?.length || 0,
        route_points: this.schoolMap?.gpsPoints?.length || 0
      }
    };
  }
  
  // Simulate network delay for realistic API behavior
  async getStatusWithDelay(delay = 100) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getIOSCompatibleStatus());
      }, delay);
    });
  }
  
  // Demo method for iOS developers
  startIOSDemo() {
    console.log('📱 Starting iOS Demo Mode...');
    console.log('💡 iOS developers can use these patterns:');
    console.log('');
    console.log('// Polling Pattern (URLSession)');
    console.log('const response = await window.getTramStatus();');
    console.log('');
    console.log('// WebSocket-like Pattern (Real-time updates)');
    console.log('window.subscribeTramStatus((status) => {');
    console.log('  console.log("Status update:", status);');
    console.log('});');
    console.log('');
    console.log('// iOS URLSession compatible format');
    console.log('const iosData = tramAPI.getIOSCompatibleStatus();');
    
    // Start API if not running
    if (!this.isRunning) {
      this.startAPI();
    }
    
    // Add a demo subscriber
    this.subscribe((status) => {
      console.log(`📱 iOS Update: currentStatus="${status.currentStatus}" | headingTo="${status.headingTo || 'None'}"`);
      console.log('📊 Full API Response:', JSON.stringify(status, null, 2));
    });
  }
}

export default TramAPI; 