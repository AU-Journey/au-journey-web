import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  PCFSoftShadowMap,
  Vector3,
  Box3,
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
import { optimizeRenderer, optimizeMaterial, optimizeScene, disposeObject } from '../utils/renderingOptimizations.js';

class SchoolMap {
  constructor(container) {
    this.container = container;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer({ antialias: true });
    this.controls = null;
    this.mapModel = null;
    this.mapModel2 = null; // Add reference for school_map2.glb
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

    // GPS route points from config (kept for fallback purposes only)
    this.gpsPoints = gpsRoute;
  }

  init() {
    // Renderer setup with optimizations using utility functions
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xbfd1e5); // Sky blue background
    this.container.appendChild(this.renderer.domElement);
    
    // Apply rendering optimizations from utility
    optimizeRenderer(this.renderer);

    // Camera setup: focus on a central area
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
    // Optimize shadow camera for better performance
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
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

    // Load models
    this.loadMapModel();
    this.loadMapModel2(); // Load school_map2.glb

    // Load tram model and let it position itself based on Redis data
    this.loadTramFBXModel();

    // Start animation loop
    this.animate();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  loadMapModel() {
    const loader = new GLTFLoader();
    
    const baseUrl = import.meta.env.BASE_URL || '/';
    // Add cache-busting parameter to prevent browser caching issues
    const cacheBuster = typeof __MODEL_CACHE_BUST__ !== 'undefined' ? __MODEL_CACHE_BUST__ : Date.now();
    const modelPath = `${baseUrl}models/school_map.glb?v=${cacheBuster}`;
    
    loader.load(modelPath, 
      (gltf) => {
        this.mapModel = gltf.scene;
        
        // Set calibrated position, rotation, and scale
        this.mapModel.scale.set(0.908, 0.908, 0.908);
        this.mapModel.rotation.y = MathUtils.degToRad(165);
        this.mapModel.position.set(-300, 0, 220);

        // Fix grass/transparent material and apply optimizations
        this.mapModel.traverse((child) => {
          if (child.isMesh && child.material) {
            // Enhanced grass/transparent material fix
            if (child.material.transparent || (child.material.map && child.material.alphaMap)) {
              // Improved grass rendering to prevent glitching
              child.material.alphaTest = 0.1; // Lower threshold for better grass visibility
              child.material.depthWrite = true; // Enable depth writing for proper sorting
              child.material.side = DoubleSide;
              child.material.transparent = true;
              child.material.opacity = 0.95; // Slightly reduce opacity to help with z-fighting
              
              // Prevent z-fighting by slightly adjusting polygon offset
              child.material.polygonOffset = true;
              child.material.polygonOffsetFactor = 1;
              child.material.polygonOffsetUnits = 1;
            }
            
            // Apply material optimizations
            optimizeMaterial(child.material);
            
            // Shadow settings
            child.receiveShadow = true;
            child.castShadow = true;
            
            // Mark static objects for performance
            if (!child.name.includes('dynamic') && !child.name.includes('animated')) {
              child.userData.static = true;
            }
          }
        });

        this.scene.add(this.mapModel);
        
        // Apply scene optimizations after adding the model
        this.optimizeMapScene();

        // Hide loading UI after map is loaded
        if (this.loadingUI) this.loadingUI.hide();
      },
      undefined,
      (error) => {
        console.error('Error loading map model:', error);
      }
    );
  }

  loadMapModel2() {
    const loader = new GLTFLoader();
    
    const baseUrl = import.meta.env.BASE_URL || '/';
    // Add cache-busting parameter to prevent browser caching issues
    const cacheBuster = typeof __MODEL_CACHE_BUST__ !== 'undefined' ? __MODEL_CACHE_BUST__ : Date.now();
    const modelPath = `${baseUrl}models/school_map2.glb?v=${cacheBuster}`;
    
    loader.load(modelPath, 
      (gltf) => {
        this.mapModel2 = gltf.scene;
        
        // Set calibrated position, rotation, and scale
        this.mapModel2.scale.set(0.908, 0.908, 0.908);
        this.mapModel2.rotation.y = MathUtils.degToRad(165);
        this.mapModel2.position.set(-300, 0, 220);

        // Fix grass/transparent material and apply optimizations
        this.mapModel2.traverse((child) => {
          if (child.isMesh && child.material) {
            // Enhanced grass/transparent material fix
            if (child.material.transparent || (child.material.map && child.material.alphaMap)) {
              // Improved grass rendering to prevent glitching
              child.material.alphaTest = 0.1; // Lower threshold for better grass visibility
              child.material.depthWrite = true; // Enable depth writing for proper sorting
              child.material.side = DoubleSide;
              child.material.transparent = true;
              child.material.opacity = 0.95; // Slightly reduce opacity to help with z-fighting
              
              // Prevent z-fighting by slightly adjusting polygon offset
              child.material.polygonOffset = true;
              child.material.polygonOffsetFactor = 1;
              child.material.polygonOffsetUnits = 1;
            }
            
            // Apply material optimizations
            optimizeMaterial(child.material);
            
            // Shadow settings
            child.receiveShadow = true;
            child.castShadow = true;
            
            // Mark static objects for performance
            if (!child.name.includes('dynamic') && !child.name.includes('animated')) {
              child.userData.static = true;
            }
          }
        });

        this.scene.add(this.mapModel2);
        
        // Apply scene optimizations after adding the model
        this.optimizeMapScene();

        // Hide loading UI after map is loaded
        if (this.loadingUI) this.loadingUI.hide();
      },
      undefined,
      (error) => {
        console.error('Error loading map model:', error);
      }
    );
  }

  // Apply scene optimizations specifically for the map
  optimizeMapScene() {
    // Apply general scene optimizations
    optimizeScene(this.scene);
    
    // Update shadow map only when needed
    this.renderer.shadowMap.needsUpdate = true;
    
    // Force matrix updates for static objects in both models
    if (this.mapModel) {
      this.mapModel.traverse((child) => {
        if (child.userData.static) {
          child.matrixAutoUpdate = false;
          child.updateMatrix();
        }
      });
    }
    
    if (this.mapModel2) {
      this.mapModel2.traverse((child) => {
        if (child.userData.static) {
          child.matrixAutoUpdate = false;
          child.updateMatrix();
        }
      });
    }
    
    console.log('🎯 Scene optimizations applied');
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
    
    this.renderer.render(this.scene, this.camera);
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
  async initializeTramMovement() {
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
    
    console.log('🚊 TramMovement initialized with Redis integration');
    
    // Wait a moment for initial positioning to complete
    setTimeout(() => {
      if (this.tramMovement && this.tramMovement.lastKnownPosition) {
        this.focusCameraOnTram();
        this.cameraFocused = true;
        console.log('📷 Initial camera focus completed');
      }
    }, 2000); // Give time for Redis data to arrive and position tram
  }

  loadTramFBXModel() {
    const loader = new FBXLoader();
    const baseUrl = import.meta.env.BASE_URL || '/';
    const modelPath = `${baseUrl}models/Tram.fbx`;
    loader.load(modelPath, async (object) => {
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

      // Don't position tram at fixed location - let TramMovement handle positioning via Redis
      this.tram.position.set(0, -0.3, 0); // Temporary position until Redis data arrives
      this.tram.rotation.y = Math.PI; // Rotate tram 180 degrees for correct forward direction

      // Apply optimizations to tram model
      this.tram.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Apply material optimizations if material exists
          if (child.material) {
            optimizeMaterial(child.material);
          }
          
          // Mark as dynamic object (not static)
          child.userData.static = false;
          child.frustumCulled = true; // Enable frustum culling
        }
      });

      this.scene.add(this.tram);
      this.renderer.shadowMap.needsUpdate = true;
      
      // Initialize tram movement first, then focus camera after GPS data arrives
      await this.initializeTramMovement();
      
      // Focus camera on a reasonable default position initially
      this.camera.position.set(0, 30, 60);
      this.camera.lookAt(0, 0, 0);
      if (this.controls) {
        this.controls.target.set(0, 0, 0);
        this.controls.update();
      }
    }, undefined, (error) => {
      console.error('Error loading Tram.fbx:', error);
    });
  }

  // Focus camera on tram (called when tram position is updated)
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
      
      // Focus camera on tram when GPS data is available (first time)
      if (!this.cameraFocused && this.tramMovement.lastKnownPosition) {
        this.focusCameraOnTram();
        this.cameraFocused = true;
        console.log('📷 Camera focused on tram at GPS position');
      }
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
    
    // Dispose map model properly
    if (this.mapModel) {
      disposeObject(this.mapModel);
    }
    if (this.mapModel2) {
      disposeObject(this.mapModel2);
    }
    
    // Dispose tram model properly
    if (this.tram) {
      disposeObject(this.tram);
    }
    
    console.log('🧹 SchoolMap resources disposed');
  }
}

export default SchoolMap;