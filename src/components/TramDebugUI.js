class TramDebugUI {
  constructor() {
    this.container = null;
    this.statusElement = null;
    this.headingElement = null;
    this.positionElement = null;
    this.buildingElement = null;
    this.backendStatusElement = null;
    this.visible = false;
    
    this.createDebugUI();
  }
  
  createDebugUI() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'tram-debug-ui';
    this.container.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      padding: 15px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      z-index: 1000;
      min-width: 300px;
      max-width: 400px;
      border: 2px solid #00ff00;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    `;
    
    // Create title
    const title = document.createElement('div');
    title.textContent = '🚊 TRAM DEBUG CONSOLE';
    title.style.cssText = `
      font-weight: bold;
      margin-bottom: 10px;
      color: #00ff00;
      text-align: center;
      border-bottom: 1px solid #00ff00;
      padding-bottom: 5px;
    `;
    this.container.appendChild(title);
    
    // Create status elements
    this.statusElement = this.createDebugRow('Status', 'Unknown');
    this.headingElement = this.createDebugRow('Heading To', 'Unknown');
    this.positionElement = this.createDebugRow('Position', 'Unknown');
    this.buildingElement = this.createDebugRow('Last Building', 'Unknown');
    this.backendStatusElement = this.createDebugRow('Backend API', 'Unknown');
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Hide Debug';
    toggleBtn.style.cssText = `
      width: 100%;
      padding: 5px;
      margin-top: 10px;
      background: #333;
      color: #fff;
      border: 1px solid #00ff00;
      border-radius: 4px;
      cursor: pointer;
    `;
    toggleBtn.onclick = () => this.toggle();
    this.container.appendChild(toggleBtn);
    
    // Add to document
    document.body.appendChild(this.container);
    
    // Initially visible
    this.visible = true;
  }
  
  createDebugRow(label, value) {
    const row = document.createElement('div');
    row.style.cssText = `
      margin: 5px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const labelSpan = document.createElement('span');
    labelSpan.textContent = label + ':';
    labelSpan.style.cssText = `
      color: #ffff00;
      font-weight: bold;
      min-width: 120px;
    `;
    
    const valueSpan = document.createElement('span');
    valueSpan.textContent = value;
    valueSpan.style.cssText = `
      color: #fff;
      flex: 1;
      text-align: right;
      word-break: break-word;
    `;
    
    row.appendChild(labelSpan);
    row.appendChild(valueSpan);
    this.container.appendChild(row);
    
    return valueSpan;
  }
  
  updateStatus(statusData) {
    if (!this.visible) return;
    
    // Update frontend status
    if (statusData.frontendStatus) {
      this.statusElement.textContent = statusData.frontendStatus;
      this.statusElement.style.color = statusData.frontendStatus === 'Running' ? '#00ff00' : '#ff6600';
    }
    
    // Update position
    if (statusData.position) {
      this.positionElement.textContent = `${statusData.position.lat.toFixed(6)}, ${statusData.position.lon.toFixed(6)}`;
    }
    
    // Update backend status
    if (statusData.backendStatus) {
      this.backendStatusElement.textContent = statusData.backendStatus.currentStatus || 'Unknown';
      this.backendStatusElement.style.color = statusData.backendStatus.currentStatus === 'Running' ? '#00ff00' : '#ff6600';
      
      // Update heading
      if (statusData.backendStatus.headingTo) {
        this.headingElement.textContent = statusData.backendStatus.headingTo;
        this.headingElement.style.color = '#00ff00';
      } else {
        this.headingElement.textContent = 'Not Set';
        this.headingElement.style.color = '#ff6600';
      }
      
      // Update last building
      if (statusData.backendStatus.last_building) {
        this.buildingElement.textContent = statusData.backendStatus.last_building;
        this.buildingElement.style.color = '#00ff00';
      } else {
        this.buildingElement.textContent = 'None';
        this.buildingElement.style.color = '#ff6600';
      }
    }
  }
  
  toggle() {
    this.visible = !this.visible;
    this.container.style.display = this.visible ? 'block' : 'none';
  }
  
  show() {
    this.visible = true;
    this.container.style.display = 'block';
  }
  
  hide() {
    this.visible = false;
    this.container.style.display = 'none';
  }
  
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

export default TramDebugUI; 