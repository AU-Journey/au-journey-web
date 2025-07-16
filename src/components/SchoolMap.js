import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  PCFSoftShadowMap,
  MeshBasicMaterial,
  SphereGeometry,
  Mesh,
  Vector3,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  CylinderGeometry,
  Box3,
  Raycaster,
  Vector2,
  MathUtils,
  DoubleSide
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TramMovement from './TramMovement.js';
import LoadingUI from './LoadingUI';
import WeatherSystem from './WeatherSystem.js';
import WeatherDisplay from './WeatherDisplay.js';
import TramTracker from './TramTracker.js';
import { gpsRoute } from '../config/gpsRoute.js';

class SchoolMap {
  constructor(container) {
    this.container = container;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer({ antialias: true });
    this.controls = null;
    this.mapModel = null;
    this.tramMovement = null;
    this.weatherSystem = null;
    this.weatherDisplay = null;
    this.tramTracker = null;
    
    // Debug UI throttling
    this.lastDebugUpdate = 0;
    this.debugUpdateInterval = 1000; // 1 second

    // Loading UI
    this.loadingUI = new LoadingUI();
    this.loadingUI.show();

    this.init();

    // GPS route points from config
    this.gpsPoints = gpsRoute;
  }

  init() {
    // Renderer setup with optimizations
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setClearColor(0xbfd1e5); // Sky blue background
    this.renderer.shadowMap.autoUpdate = false; // Manual update for performance
    this.renderer.powerPreference = "high-performance";
    this.container.appendChild(this.renderer.domElement);

    // Camera setup: focus near tram start
    // We'll set the camera after tram is loaded, but set a reasonable default here
    this.camera.position.set(0, 20, 50);
    this.camera.lookAt(0, 0, 0);

    // Lighting setup
    const ambientLight = new AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    this.ambientLight = ambientLight; // Store reference for weather system

    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    this.directionalLight = directionalLight; // Store reference for weather system

    // Initialize weather system
    this.weatherSystem = new WeatherSystem(this.scene, this.renderer);
    
    // Initialize weather display
    this.weatherDisplay = new WeatherDisplay();
    this.weatherDisplay.show();
    
    // Initialize enhanced tram tracking system
    this.tramTracker = new TramTracker();

    // Controls setup
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1; // Prevent camera from going below ground
    this.controls.minDistance = 20; // Prevent zooming too close
    this.controls.maxDistance = 200; // Prevent zooming too far

    // Setup click handler for coordinate detection
    this.setupClickHandler();

    // Load models
    this.loadMapModel();

    // Load tram model and place at first GPS point
    this.loadTramFBXModel();

    // Start animation loop
    this.animate();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  // GPS to 3D coordinate conversion (without offset - GPS dots should be positioned correctly)
  gpsTo3DCoords(lat, lon) {
    // Calculate center point of GPS coordinates for better positioning
    const firstPoint = this.gpsPoints[0];
    const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
    const centerLat = (firstPoint.lat + lastPoint.lat) / 2;
    const centerLon = (firstPoint.lon + lastPoint.lon) / 2;
    
    // Use the same scale as dots for consistency
    const scale = 100000;
    
    return {
      x: (lat - centerLat) * scale,
      y: 2, // Keep slightly above ground
      z: (lon - centerLon) * scale
    };
  }

  loadMapModel() {
    const loader = new GLTFLoader();
    
    const baseUrl = import.meta.env.BASE_URL || '/';
    const modelPath = `${baseUrl}models/school_map.glb`;
    
    loader.load(modelPath, 
      (gltf) => {
        this.mapModel = gltf.scene;
        
        // Set calibrated position, rotation, and scale
        this.mapModel.scale.set(0.908, 0.908, 0.908);
        this.mapModel.rotation.y = MathUtils.degToRad(165);
        this.mapModel.position.set(-300, 0, 220);

        // --- Grass/transparent material fix ---
        this.mapModel.traverse((child) => {
          if (child.isMesh && child.material) {
            // If the material is transparent (likely grass), apply fixes
            if (child.material.transparent || (child.material.map && child.material.alphaMap)) {
              child.material.alphaTest = 0.5;
              child.material.depthWrite = false;
              child.material.side = DoubleSide;
            }
            child.receiveShadow = true;
            child.castShadow = true;
          }
        });
        // --- End fix ---

        this.scene.add(this.mapModel);

        // Hide loading UI after map is loaded
        if (this.loadingUI) this.loadingUI.hide();

        this.addGPSDots();
        this.addRouteVisualization();
        this.addTramStopIndicators();
      },
      undefined,
      (error) => {
        console.error('Error loading map model:', error);
      }
    );
  }

  addGPSDots() {
    const material = new MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8
    });
    // Reduce point size for red dots
    const geometry = new SphereGeometry(2, 10, 10);

    // Add first and last points with different colors
    const firstPoint = this.gpsPoints[0];
    const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
    
    // Calculate center point of GPS coordinates for better positioning
    const centerLat = (firstPoint.lat + lastPoint.lat) / 2;
    const centerLon = (firstPoint.lon + lastPoint.lon) / 2;
    
    // Increase scale factor much more to make the path more visible
    // Since GPS differences are around 0.003 degrees, we need a larger scale
    const scale = 100000;
    
    // First point (blue)
    const firstDot = new Mesh(
      geometry,
      new MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.8 })
    );
    const firstDotPos = {
      x: (firstPoint.lat - centerLat) * scale,
      y: 4,
      z: (firstPoint.lon - centerLon) * scale
    };
    firstDot.position.set(firstDotPos.x, firstDotPos.y, firstDotPos.z);
    this.scene.add(firstDot);
    
    // Last point (green)
    const lastDot = new Mesh(
      geometry,
      new MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 })
    );
    lastDot.position.set(
      (lastPoint.lat - centerLat) * scale,
      4,
      (lastPoint.lon - centerLon) * scale
    );
    this.scene.add(lastDot);

    // Add remaining points
    this.gpsPoints.forEach((gps, i) => {
      if (i === 0 || i === this.gpsPoints.length - 1) return;
      
      const dot = new Mesh(geometry, material);
      dot.position.set(
        (gps.lat - centerLat) * scale,
        2,
        (gps.lon - centerLon) * scale
      );
      dot.name = `gps-dot-${i}`;
      this.scene.add(dot);
    });


  }

  addRouteVisualization() {
    // Use same positioning logic as GPS dots - no offset needed
    const firstPoint = this.gpsPoints[0];
    const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
    const centerLat = (firstPoint.lat + lastPoint.lat) / 2;
    const centerLon = (firstPoint.lon + lastPoint.lon) / 2;
    const scale = 100000;

    const points = this.gpsPoints.map(gps => {
      return new Vector3(
        (gps.lat - centerLat) * scale,
        1.5, // Slightly above dots
        (gps.lon - centerLon) * scale
      );
    });

    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ 
      color: 0x00ff00, 
      linewidth: 2,
      transparent: true,
      opacity: 0.7
    });

    const line = new Line(geometry, material);
    line.name = 'route-line';
    this.scene.add(line);
  }
  
  // Add visual indicators for tram stops
  addTramStopIndicators() {
    const stops = this.tramTracker.getBuildings();
    
    // Use same positioning logic as GPS dots
    const firstPoint = this.gpsPoints[0];
    const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
    const centerLat = (firstPoint.lat + lastPoint.lat) / 2;
    const centerLon = (firstPoint.lon + lastPoint.lon) / 2;
    const scale = 100000;
    
    stops.forEach((stop, index) => {
      // Create stop indicator with distinctive appearance
      const geometry = new CylinderGeometry(4, 4, 8, 8);
      const material = new MeshBasicMaterial({
        color: 0xffd700, // Gold color for stops
        transparent: true,
        opacity: 0.9
      });
      
      const stopIndicator = new Mesh(geometry, material);
      
      // Position using same coordinate system
      const position = {
        x: (stop.lat - centerLat) * scale,
        y: 6, // Higher than GPS dots
        z: (stop.lon - centerLon) * scale
      };
      
      stopIndicator.position.set(position.x, position.y, position.z);
      stopIndicator.name = `stop-${stop.id}`;
      this.scene.add(stopIndicator);
      
      // Add stop label
      this.addStopLabel(stop, position);
      
    });
  }
  
  // Add text labels for tram stops (simplified version)
  addStopLabel(stop, position) {
    // Create a simple text representation using a colored sphere
    const labelGeometry = new SphereGeometry(1.5, 8, 8);
    const labelMaterial = new MeshBasicMaterial({
      color: 0xff6600, // Orange for labels
      transparent: true,
      opacity: 0.8
    });
    
    const label = new Mesh(labelGeometry, labelMaterial);
    label.position.set(position.x, position.y + 5, position.z);
    label.name = `label-${stop.id}`;
    this.scene.add(label);
    
    // Store stop info for potential interaction
    label.userData = {
      stopName: stop.displayName,
      stopId: stop.id
    };
  }



  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    if (this.controls) {
      this.controls.update();
    }
    
    // Update weather system
    if (this.weatherSystem) {
      this.weatherSystem.update(performance.now());
      
      // Update weather display
      if (this.weatherDisplay) {
        const weatherInfo = this.weatherSystem.getWeatherInfo();
        this.weatherDisplay.update(weatherInfo);
      }
    }
    
    // Update tram tracking if tram is moving
    this.updateTramTracking();
    
    // Update target indicator
    this.updateTargetIndicator();
    
    this.renderer.render(this.scene, this.camera);
  }



  // Add target indicator to show which GPS point tram is moving towards
  addTargetIndicator() {
    const geometry = new SphereGeometry(3, 8, 8);
    const material = new MeshBasicMaterial({ 
      color: 0xffff00, 
      transparent: true, 
      opacity: 0.8,
      wireframe: true
    });
    
    this.targetIndicator = new Mesh(geometry, material);
    this.targetIndicator.name = 'target-indicator';
    this.scene.add(this.targetIndicator);
    
    // Initially hide it
    this.targetIndicator.visible = false;
  }

  // Update target indicator position
  updateTargetIndicator() {
    if (!this.tramMovement || !this.targetIndicator) return;
    
    const progress = this.tramMovement.getProgress();
    
    // In real-time mode, show current GPS position as target
    if (progress.realTimeMode && progress.currentGPS) {
      // Use same positioning as GPS dots
      const firstPoint = this.gpsPoints[0];
      const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
      const centerLat = (firstPoint.lat + lastPoint.lat) / 2;
      const centerLon = (firstPoint.lon + lastPoint.lon) / 2;
      const scale = 100000;
      
      const targetPos = {
        x: (progress.currentGPS.lat - centerLat) * scale,
        y: 6, // Higher than other dots
        z: (progress.currentGPS.lon - centerLon) * scale
      };
      
      this.targetIndicator.position.set(targetPos.x, targetPos.y, targetPos.z);
      this.targetIndicator.visible = true;
      
      // Change color to indicate real-time mode
      if (this.targetIndicator.material) {
        this.targetIndicator.material.color.setHex(0x00ffff); // Cyan for real-time
      }
    } else if (progress.isMoving && progress.currentIndex < this.gpsPoints.length) {
      // Fallback mode - use static GPS points
      const targetGPS = this.gpsPoints[progress.currentIndex];
      
      const firstPoint = this.gpsPoints[0];
      const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
      const centerLat = (firstPoint.lat + lastPoint.lat) / 2;
      const centerLon = (firstPoint.lon + lastPoint.lon) / 2;
      const scale = 100000;
      
      const targetPos = {
        x: (targetGPS.lat - centerLat) * scale,
        y: 6, // Higher than other dots
        z: (targetGPS.lon - centerLon) * scale
      };
      
      this.targetIndicator.position.set(targetPos.x, targetPos.y, targetPos.z);
      this.targetIndicator.visible = true;
      
      // Change color to indicate fallback mode
      if (this.targetIndicator.material) {
        this.targetIndicator.material.color.setHex(0xffff00); // Yellow for fallback
      }
    } else {
      this.targetIndicator.visible = false;
    }
  }

  // Method to update tram position from live GPS (legacy method - Redis is now primary)
  updateTramPositionFromLiveGPS(lat, lon) {
    console.log('📍 Legacy GPS update called - Redis is now primary data source');
    
    // This method is primarily for fallback when Redis is unavailable
    if (this.tramMovement) {
      const redisStatus = this.tramMovement.getRedisStatus();
      if (!redisStatus.isConnected) {
        console.log('🔄 Using legacy GPS update as Redis fallback');
        this.tramMovement.updateFromLiveGPS(lat, lon);
      }
    }
    
    // Always update local tracking system as secondary data source
    if (this.tramTracker) {
      this.tramTracker.updatePosition(lat, lon);
    }
  }

  // Initialize tram movement system
  initializeTramMovement() {
    if (!this.tram) {
      console.warn('Cannot initialize tram movement: tram model not loaded');
      return;
    }

    // Redis configuration - will use defaults in RedisGPSService
    // In browser environment, this will use HTTP proxy automatically
    const redisConfig = {
      // Let RedisGPSService handle environment detection and defaults
    };

    // Create TramMovement instance with Redis integration
    this.tramMovement = new TramMovement(
      this.tram,
      null,
      this.gpsPoints, // Fallback GPS points
      new Vector3(0, 0, 0),
      redisConfig
    );
    
    // Add current target indicator
    this.addTargetIndicator();
    
    console.log('🚊 TramMovement initialized with Redis integration');
  }

  loadTramFBXModel() {
    const loader = new FBXLoader();
    const baseUrl = import.meta.env.BASE_URL || '/';
    const modelPath = `${baseUrl}models/Tram.fbx`;
    loader.load(modelPath, (object) => {
      this.tram = object;
      // Center and scale tram model
      const bbox = new Box3().setFromObject(this.tram);
      const size = bbox.getSize(new Vector3());
      const center = bbox.getCenter(new Vector3());
      this.tram.position.sub(center); // Center the model

      // Scale tram to reasonable size (12,4,8)
      const targetSize = new Vector3(12, 4, 8);
      const scale = new Vector3(
        targetSize.x / size.x,
        targetSize.y / size.y,
        targetSize.z / size.z
      );
      const uniformScale = (scale.x + scale.y + scale.z) / 3;
      this.tram.scale.set(uniformScale, uniformScale, uniformScale);

      // Place at first GPS point (same as blue dot)
      const firstPoint = this.gpsPoints[0];
      const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
      const centerLat = (firstPoint.lat + lastPoint.lat) / 2;
      const centerLon = (firstPoint.lon + lastPoint.lon) / 2;
      const coordScale = 100000;
      const pos = {
        x: (firstPoint.lat - centerLat) * coordScale,
        y: -0.3, // Lowered from 4 to 2 to sit on the ground
        z: (firstPoint.lon - centerLon) * coordScale
      };
      this.tram.position.set(pos.x, pos.y, pos.z);
      // Rotate tram 180 degrees around Y axis for correct forward direction
      this.tram.rotation.y = Math.PI;

      // Remove forced yellow material: do not override child.material
      this.tram.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.scene.add(this.tram);
      this.renderer.shadowMap.needsUpdate = true;
      this.focusCameraOnTram();
      this.initializeTramMovement();
    }, undefined, (error) => {
      console.error('Error loading Tram.fbx:', error);
    });
  }

  // After tram is loaded and positioned, set camera to focus near tram
  focusCameraOnTram() {
    if (!this.tram) return;
    // Offset the camera to be above and behind the tram
    const offset = new Vector3(0, 30, 60); // Y: height, Z: behind
    const tramPos = this.tram.position.clone();
    const camPos = tramPos.clone().add(offset);
    this.camera.position.copy(camPos);
    this.camera.lookAt(tramPos);
    if (this.controls) {
      this.controls.target.copy(tramPos);
      this.controls.update();
    }
  }
  




  // Update tram tracking system continuously for Redis GPS data
  updateTramTracking() {
    if (!this.tramMovement || !this.tramTracker || !this.tramMovement.tram) return;
    
    // Get current tram progress (now includes Redis GPS data)
    const progress = this.tramMovement.getProgress();
    if (!progress) return;
    
    // Use real-time GPS data from Redis if available
    if (progress.currentGPS) {
      // Update local tracker with real-time GPS data
      this.tramTracker.updatePosition(progress.currentGPS.lat, progress.currentGPS.lon);
      
      // Update debug UI if available
      this.updateDebugUI(progress.currentGPS, progress);
    } else if (progress.realTimeMode === false && this.gpsPoints && progress.currentIndex < this.gpsPoints.length) {
      // Fallback to static GPS points if Redis is unavailable
      const currentGPS = this.gpsPoints[progress.currentIndex];
      if (currentGPS) {
        this.tramTracker.updatePosition(currentGPS.lat, currentGPS.lon);
        this.updateDebugUI(currentGPS, progress);
      }
    }
  }
  
  // Update debug UI with current status
  async updateDebugUI(currentGPS, progress) {
    if (!this.tramDebugUI) return;
    
    // Throttle debug UI updates
    const currentTime = Date.now();
    if (currentTime - this.lastDebugUpdate < this.debugUpdateInterval) {
      return;
    }
    this.lastDebugUpdate = currentTime;
    
    try {
      // Prepare debug data
      const debugData = {
        frontendStatus: progress.isMoving ? 'Running' : 'Stopped',
        position: currentGPS
      };
      
      // Update debug UI
      this.tramDebugUI.updateStatus(debugData);
      
    } catch (error) {
      console.warn('⚠️ Debug UI update failed:', error);
    }
  }
  
  // Get current tram status for API (fallback to local tracker)
  getTramStatusAPI() {
    if (!this.tramTracker) return null;
    return this.tramTracker.getStatusForAPI();
  }
  
  // Reset tram tracking
  resetTramTracking() {
    if (this.tramTracker) {
      this.tramTracker.reset();
    }
  }

  // Setup click handler for coordinate detection
  setupClickHandler() {
    const raycaster = new Raycaster();
    const mouse = new Vector2();
    
    this.renderer.domElement.addEventListener('click', (event) => {
      // Prevent triggering when dragging camera
      if (this.controls && this.controls.getDistance() !== this.controls.getDistance()) return;
      
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      const rect = this.renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Cast ray from camera through mouse position
      raycaster.setFromCamera(mouse, this.camera);
      
      // Find intersections with the map model
      const intersects = raycaster.intersectObjects(this.scene.children, true);
      
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const point = intersect.point;
        
        // Convert 3D coordinates back to GPS coordinates
        const gpsCoords = this.threeDToGPS(point.x, point.z);
        
        // Add a temporary marker at the clicked position
        this.addTemporaryMarker(point);
      }
    });
  }
  
  // Convert 3D coordinates back to GPS coordinates
  threeDToGPS(x, z) {
    // Use same calculation parameters as the GPS to 3D conversion
    const firstPoint = this.gpsPoints[0];
    const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
    const centerLat = (firstPoint.lat + lastPoint.lat) / 2;
    const centerLon = (firstPoint.lon + lastPoint.lon) / 2;
    const scale = 100000;
    
    return {
      lat: (x / scale) + centerLat,
      lon: (z / scale) + centerLon
    };
  }
  
  // Add temporary marker to show clicked position
  addTemporaryMarker(position) {
    // Remove previous temporary marker
    const existingMarker = this.scene.getObjectByName('temp-marker');
    if (existingMarker) {
      this.scene.remove(existingMarker);
    }
    
    // Create new marker
    const geometry = new SphereGeometry(3, 8, 8);
    const material = new MeshBasicMaterial({ 
      color: 0xff00ff, 
      transparent: true, 
      opacity: 0.8 
    });
    
    const marker = new Mesh(geometry, material);
    marker.position.set(position.x, position.y + 5, position.z);
    marker.name = 'temp-marker';
    this.scene.add(marker);
    
    // Remove marker after 5 seconds
    setTimeout(() => {
      this.scene.remove(marker);
    }, 5000);
  }

  // Dispose of resources and cleanup
  dispose() {
    // Dispose tram movement system and Redis connection
    if (this.tramMovement) {
      this.tramMovement.dispose();
      this.tramMovement = null;
    }
    
    // Dispose weather system
    if (this.weatherSystem) {
      this.weatherSystem.dispose();
      this.weatherSystem = null;
    }
    
    // Dispose weather display
    if (this.weatherDisplay) {
      this.weatherDisplay.dispose();
      this.weatherDisplay = null;
    }
    
    console.log('🧹 SchoolMap resources disposed');
  }
}

export default SchoolMap;