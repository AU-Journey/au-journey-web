import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import TramMovement from './TramMovement.js';

class SchoolMap {
  constructor(container) {
    this.container = container;
    // Remove GPS conversion related properties
    this.offset = new THREE.Vector3(-300, 0, -30);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = null;
    this.mapModel = null;
    this.tram = null;
    this.simpleTram = null; // Simple object to act as tram
    this.tramMovement = null;

    this.init();

    // GPS route points
    this.gpsPoints = [
      { lat: 13.612263, lon: 100.836828 },
      { lat: 13.612389, lon: 100.836676 },
      { lat: 13.612412, lon: 100.836585 },
      { lat: 13.612441, lon: 100.836478 },
      { lat: 13.612473, lon: 100.836363 },
      { lat: 13.612508, lon: 100.836238 },
      { lat: 13.612534, lon: 100.836147 },
      { lat: 13.612633, lon: 100.835787 },
      { lat: 13.612686, lon: 100.835602 },
      { lat: 13.612740, lon: 100.835415 },
      { lat: 13.612796, lon: 100.835222 },
      { lat: 13.612860, lon: 100.835001 },
      { lat: 13.612950, lon: 100.834689 },
      { lat: 13.613051, lon: 100.834310 },
      { lat: 13.613115, lon: 100.833858 },
      { lat: 13.613170, lon: 100.833660 },
      { lat: 13.613202, lon: 100.833545 },
      { lat: 13.613137, lon: 100.833424 },
      { lat: 13.613034, lon: 100.833390 },
      { lat: 13.612942, lon: 100.833365 },
      { lat: 13.612815, lon: 100.833320 },
      { lat: 13.612710, lon: 100.833239 },
      { lat: 13.612659, lon: 100.833162 },
      { lat: 13.612630, lon: 100.833066 },
      { lat: 13.612630, lon: 100.832969 },
      { lat: 13.612650, lon: 100.832864 },
      { lat: 13.612673, lon: 100.832775 },
      { lat: 13.612708, lon: 100.832643 },
      { lat: 13.612734, lon: 100.832550 },
      { lat: 13.612763, lon: 100.832447 },
      { lat: 13.612791, lon: 100.832348 },
      { lat: 13.612818, lon: 100.832253 },
      { lat: 13.612844, lon: 100.832160 },
      { lat: 13.612869, lon: 100.832071 },
      { lat: 13.612906, lon: 100.831941 },
      { lat: 13.612937, lon: 100.831829 },
      { lat: 13.612962, lon: 100.831739 },
      { lat: 13.612986, lon: 100.831645 },
      { lat: 13.613009, lon: 100.831551 },
      { lat: 13.613034, lon: 100.831459 },
      { lat: 13.613068, lon: 100.831338 },
      { lat: 13.613114, lon: 100.831223 },
      { lat: 13.613205, lon: 100.831203 },
      { lat: 13.613314, lon: 100.831234 },
      { lat: 13.613409, lon: 100.831262 },
      { lat: 13.613503, lon: 100.831290 },
      { lat: 13.613596, lon: 100.831317 },
      { lat: 13.613692, lon: 100.831346 },
      { lat: 13.613789, lon: 100.831373 },
      { lat: 13.613881, lon: 100.831400 },
      { lat: 13.613968, lon: 100.831425 },
      { lat: 13.614096, lon: 100.831462 },
      { lat: 13.614223, lon: 100.831500 },
      { lat: 13.614341, lon: 100.831533 },
      { lat: 13.614444, lon: 100.831560 },
      { lat: 13.614511, lon: 100.831654 },
      { lat: 13.614485, lon: 100.831764 },
      { lat: 13.614458, lon: 100.831869 },
      { lat: 13.614430, lon: 100.831970 },
      { lat: 13.614375, lon: 100.832160 },
      { lat: 13.614337, lon: 100.832286 },
      { lat: 13.614310, lon: 100.832388 },
      { lat: 13.614277, lon: 100.832501 },
      { lat: 13.614220, lon: 100.832695 },
      { lat: 13.614193, lon: 100.832788 },
      { lat: 13.614158, lon: 100.832906 },
      { lat: 13.614128, lon: 100.833007 },
      { lat: 13.614067, lon: 100.833220 },
      { lat: 13.614040, lon: 100.833315 },
      { lat: 13.614005, lon: 100.833436 },
      { lat: 13.613983, lon: 100.833545 },
      { lat: 13.613884, lon: 100.833614 },
      { lat: 13.613775, lon: 100.833604 },
      { lat: 13.613670, lon: 100.833580 },
      { lat: 13.613572, lon: 100.833552 },
      { lat: 13.613482, lon: 100.833526 },
      { lat: 13.613395, lon: 100.833500 },
      { lat: 13.613309, lon: 100.833474 },
      { lat: 13.613202, lon: 100.833545 },
      { lat: 13.613141, lon: 100.833766 },
      { lat: 13.613044, lon: 100.834096 },
      { lat: 13.613051, lon: 100.834310 },
      { lat: 13.613028, lon: 100.834406 },
      { lat: 13.612269, lon: 100.836708 },
      { lat: 13.612305, lon: 100.836591 },
      { lat: 13.612336, lon: 100.836485 },
      { lat: 13.612364, lon: 100.836388 },
      { lat: 13.612392, lon: 100.836290 },
      { lat: 13.612420, lon: 100.836193 },
      { lat: 13.612449, lon: 100.836096 },
      { lat: 13.612505, lon: 100.835902 },
      { lat: 13.612560, lon: 100.835712 },
      { lat: 13.612586, lon: 100.835620 },
      { lat: 13.612612, lon: 100.835529 },
      { lat: 13.612663, lon: 100.835346 },
      { lat: 13.612688, lon: 100.835254 },
      { lat: 13.612738, lon: 100.835072 },
      { lat: 13.612763, lon: 100.834983 },
      { lat: 13.612802, lon: 100.834851 },
      { lat: 13.612840, lon: 100.834719 },
      { lat: 13.612877, lon: 100.834590 },
      { lat: 13.612913, lon: 100.834469 },
      { lat: 13.612950, lon: 100.834343 },
      { lat: 13.612989, lon: 100.834218 },
      { lat: 13.613077, lon: 100.833994 },
      { lat: 13.613077, lon: 100.837091 },
      { lat: 13.613279, lon: 100.837156 },
      { lat: 13.613257, lon: 100.837379 },
      { lat: 13.613170, lon: 100.837694 },
      { lat: 13.613046, lon: 100.838149 },
      { lat: 13.612858, lon: 100.838805 },
      { lat: 13.612714, lon: 100.839304 },
      { lat: 13.612734, lon: 100.839536 },
      { lat: 13.612683, lon: 100.839619 },
      { lat: 13.612557, lon: 100.839575 },
      { lat: 13.612595, lon: 100.839452 },
      { lat: 13.612612, lon: 100.839687 },
      { lat: 13.612574, lon: 100.839796 },
      { lat: 13.612548, lon: 100.839886 },
      { lat: 13.612485, lon: 100.839503 },
      { lat: 13.612376, lon: 100.839465 },
      { lat: 13.612515, lon: 100.840012 },
      { lat: 13.612460, lon: 100.840202 },
      { lat: 13.612423, lon: 100.840328 },
      { lat: 13.612397, lon: 100.840418 },
      { lat: 13.612330, lon: 100.840650 },
      { lat: 13.612613, lon: 100.840080 },
      { lat: 13.612721, lon: 100.840114 },
      { lat: 13.612847, lon: 100.840148 },
      { lat: 13.612956, lon: 100.840176 },
      { lat: 13.612992, lon: 100.840298 },
      { lat: 13.612943, lon: 100.840410 },
      { lat: 13.612824, lon: 100.840404 },
      { lat: 13.612731, lon: 100.840379 },
      { lat: 13.612615, lon: 100.840347 },
      { lat: 13.612527, lon: 100.840321 }
    ];
  }

  init() {
    // Renderer setup
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Camera setup
    this.camera.position.set(0, 20, 50);
    this.camera.lookAt(0, 0, 0);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Controls setup
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going below ground

    // Load models
    this.loadMapModel();
    this.loadTramModel(); // Keep original tram loading for now

    // Start animation loop
    this.animate();
    
    // Enable debugging features
    this.enableClickToLogPosition();
    this.setupKeyboardControls();

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
    console.log('🗺️ Starting to load map model...');
    const loader = new GLTFLoader();
    
    const baseUrl = import.meta.env.BASE_URL || '/';
    const modelPath = `${baseUrl}models/school_map.glb`;
    
    loader.load(modelPath, 
      (gltf) => {
        console.log('✅ Map model loaded successfully');
        this.mapModel = gltf.scene;
        
        // Set calibrated position, rotation, and scale
        this.mapModel.scale.set(0.908, 0.908, 0.908);
        this.mapModel.rotation.y = THREE.MathUtils.degToRad(165); // Convert 165 degrees to radians
        this.mapModel.position.set(-300, 0, 220);

        // Enable shadows
        this.mapModel.traverse((child) => {
          if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = true;
          }
        });

        this.scene.add(this.mapModel);

        // Keep the adjustment controls for fine-tuning if needed
        this.setupMapAdjustmentControls();

        this.addGPSDots();
        this.addRouteVisualization();
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(2);
      },
      (error) => {
        console.error('❌ Error loading map model:', error);
      }
    );
  }

  loadTramModel() {
    console.log('🚋 Starting to load tram model...');
    const loader = new GLTFLoader();
    
    const baseUrl = import.meta.env.BASE_URL || '/';
    const modelPath = `${baseUrl}models/tram.glb`;
    
    loader.load(modelPath,
      (gltf) => {
        console.log('✅ Tram model loaded successfully');
        this.tram = gltf.scene;

        // Scale tram to match map scale
        this.tram.scale.set(0.908, 0.908, 0.908);

        // Enable shadows
        this.tram.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Position tram at the first GPS point - same logic as GPS dots
        const firstPoint = this.gpsPoints[0];
        const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
        const centerLat = (firstPoint.lat + lastPoint.lat) / 2;
        const centerLon = (firstPoint.lon + lastPoint.lon) / 2;
        const scale = 100000;
        
        const calculatedPos = {
          x: (firstPoint.lat - centerLat) * scale,
          y: 2,
          z: (firstPoint.lon - centerLon) * scale
        };
        
        this.tram.position.set(calculatedPos.x, calculatedPos.y, calculatedPos.z);
        
        this.scene.add(this.tram);
        console.log('✅ Tram added to scene at GPS-aligned position:', this.tram.position);
        
        // Create simple tram and initialize movement system
        this.createSimpleTram();
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(2);
      },
      (error) => {
        console.error('❌ Error loading tram model:', error);
      }
    );
  }

  addGPSDots() {
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8
    });
    // Keep point size reasonable
    const geometry = new THREE.SphereGeometry(5, 12, 12);

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
    const firstDot = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.8 })
    );
    const firstDotPos = {
      x: (firstPoint.lat - centerLat) * scale,
      y: 4,
      z: (firstPoint.lon - centerLon) * scale
    };
    firstDot.position.set(firstDotPos.x, firstDotPos.y, firstDotPos.z);
    this.scene.add(firstDot);
    
    // Last point (green)
    const lastDot = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 })
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
      
      const dot = new THREE.Mesh(geometry, material);
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
      return new THREE.Vector3(
        (gps.lat - centerLat) * scale,
        1.5, // Slightly above dots
        (gps.lon - centerLon) * scale
      );
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      linewidth: 2,
      transparent: true,
      opacity: 0.7
    });

    const line = new THREE.Line(geometry, material);
    line.name = 'route-line';
    this.scene.add(line);
  }

  setupKeyboardControls() {
    window.addEventListener('keydown', (event) => {
      const moveStep = 10;
      const mapRotateStep = Math.PI / 36; // 5 degrees for map
      const tramRotateStep = Math.PI / 72; // 2.5 degrees for tram - more precise rotation

      // Tram movement controls
      switch(event.key) {
        case ' ': // Spacebar to toggle tram movement
          event.preventDefault();
          this.toggleTramMovement();
          return;
        case '+':
        case '=':
          if (this.tramMovement) {
            const currentSpeed = this.tramMovement.tramSpeed;
            this.setTramSpeed(currentSpeed + 5);
            console.log(`🏃 Tram speed increased to ${currentSpeed + 5}`);
          }
          return;
        case '-':
        case '_':
          if (this.tramMovement) {
            const currentSpeed = this.tramMovement.tramSpeed;
            this.setTramSpeed(Math.max(5, currentSpeed - 5));
            console.log(`🐌 Tram speed decreased to ${Math.max(5, currentSpeed - 5)}`);
          }
          return;
      }

      // Map controls with arrow keys
      if (this.mapModel) {
        switch(event.key.toLowerCase()) {
          case 'arrowup':
            this.mapModel.position.z -= moveStep;
            console.log('Map position:', this.mapModel.position);
            break;
          case 'arrowdown':
            this.mapModel.position.z += moveStep;
            console.log('Map position:', this.mapModel.position);
            break;
          case 'arrowleft':
            this.mapModel.position.x -= moveStep;
            console.log('Map position:', this.mapModel.position);
            break;
          case 'arrowright':
            this.mapModel.position.x += moveStep;
            console.log('Map position:', this.mapModel.position);
            break;
          case 'q':
            this.mapModel.rotation.y += mapRotateStep;
            console.log('Map rotation:', THREE.MathUtils.radToDeg(this.mapModel.rotation.y));
            break;
          case 'e':
            this.mapModel.rotation.y -= mapRotateStep;
            console.log('Map rotation:', THREE.MathUtils.radToDeg(this.mapModel.rotation.y));
            break;
          case '[':
            this.mapModel.scale.multiplyScalar(0.9);
            console.log('Map scale:', this.mapModel.scale);
            break;
          case ']':
            this.mapModel.scale.multiplyScalar(1.1);
            console.log('Map scale:', this.mapModel.scale);
            break;
        }
      }

      // Simple tram controls with WASD
      if (this.simpleTram) {
        // Store current rotation for movement direction
        const currentRotation = this.simpleTram.rotation.y;
        
        switch(event.key.toLowerCase()) {
          case 'w': // Forward in tram's direction
            this.simpleTram.position.x += Math.sin(currentRotation) * moveStep;
            this.simpleTram.position.z += Math.cos(currentRotation) * moveStep;
            break;
          case 's': // Backward in tram's direction
            this.simpleTram.position.x -= Math.sin(currentRotation) * moveStep;
            this.simpleTram.position.z -= Math.cos(currentRotation) * moveStep;
            break;
          case 'a': // Strafe left relative to tram's direction
            this.simpleTram.position.x -= Math.cos(currentRotation) * moveStep;
            this.simpleTram.position.z += Math.sin(currentRotation) * moveStep;
            break;
          case 'd': // Strafe right relative to tram's direction
            this.simpleTram.position.x += Math.cos(currentRotation) * moveStep;
            this.simpleTram.position.z -= Math.sin(currentRotation) * moveStep;
            break;
          case 'r': // Rotate left
            this.simpleTram.rotation.y += tramRotateStep;
            this.simpleTram.rotation.y = this.simpleTram.rotation.y % (Math.PI * 2);
            break;
          case 't': // Rotate right
            this.simpleTram.rotation.y -= tramRotateStep;
            if (this.simpleTram.rotation.y < 0) {
              this.simpleTram.rotation.y += Math.PI * 2;
            }
            break;
          case 'f': // Scale down
            this.simpleTram.scale.multiplyScalar(0.95);
            break;
          case 'g': // Scale up
            this.simpleTram.scale.multiplyScalar(1.05);
            break;
        }
      }
    });

    console.log('Controls: SPACE=Start/Stop tram, +/-=Speed, WASD=Manual, Arrows=Map');
  }

  enableClickToLogPosition() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);

      const intersects = raycaster.intersectObjects(this.scene.children, true);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        console.log(`🟢 Clicked Position: x=${point.x.toFixed(2)}, y=${point.y.toFixed(2)}, z=${point.z.toFixed(2)}`);

        // Add temporary marker
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(2, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 })
        );
        dot.position.copy(point);
        this.scene.add(dot);

        // Remove marker after 3 seconds
        setTimeout(() => {
          this.scene.remove(dot);
        }, 3000);
      }
    });
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
    
    // Update target indicator
    this.updateTargetIndicator();
    
    this.renderer.render(this.scene, this.camera);
  }

  // Create simple tram object
  createSimpleTram() {
    console.log('🚋 Creating simple tram object...');
    
    // Create a simple box that looks like a tram
    const geometry = new THREE.BoxGeometry(12, 4, 8); // Width, Height, Depth
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x0066cc, // Blue color for the tram
      transparent: false
    });
    
    this.simpleTram = new THREE.Mesh(geometry, material);
    this.simpleTram.name = 'simple-tram';
    
    // Add some details to make it look more like a tram
    const roofGeometry = new THREE.BoxGeometry(12, 1, 8);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x004499 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 2.5;
    this.simpleTram.add(roof);
    
    // Position at first GPS point - same logic as GPS dots
    const firstPoint = this.gpsPoints[0];
    const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
    const centerLat = (firstPoint.lat + lastPoint.lat) / 2;
    const centerLon = (firstPoint.lon + lastPoint.lon) / 2;
    const scale = 100000;
    
    this.simpleTram.position.set(
      (firstPoint.lat - centerLat) * scale,
      2, // Ground level
      (firstPoint.lon - centerLon) * scale
    );
    
    // Enable shadows
    this.simpleTram.castShadow = true;
    this.simpleTram.receiveShadow = true;
    roof.castShadow = true;
    
    this.scene.add(this.simpleTram);
    console.log('✅ Simple tram created at position:', this.simpleTram.position);
    
    // Initialize movement system immediately
    this.initializeTramMovement();
  }

  // Initialize tram movement system
  initializeTramMovement() {
    if (!this.simpleTram) {
      console.warn('⚠️ Cannot initialize tram movement: simple tram not created');
      return;
    }

    // Create TramMovement instance using simple tram
    this.tramMovement = new TramMovement(
      this.simpleTram,
      null, // No longer needed since we use direct coordinate calculation
      this.gpsPoints,
      new THREE.Vector3(0, 0, 0) // No offset needed
    );

    console.log('🚋 Simple tram movement system initialized');
    console.log('🎮 Press SPACE to start/stop tram movement');
    
    // Add current target indicator
    this.addTargetIndicator();
  }

  // Start or stop tram movement
  toggleTramMovement() {
    if (!this.tramMovement) return;
    
    if (this.tramMovement.isMoving) {
      this.tramMovement.stop();
      console.log('🛑 Tram movement stopped');
    } else {
      this.tramMovement.start();
      console.log('▶️ Tram movement started');
    }
  }

  // Add target indicator to show which GPS point tram is moving towards
  addTargetIndicator() {
    const geometry = new THREE.SphereGeometry(3, 8, 8);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffff00, 
      transparent: true, 
      opacity: 0.8,
      wireframe: true
    });
    
    this.targetIndicator = new THREE.Mesh(geometry, material);
    this.targetIndicator.name = 'target-indicator';
    this.scene.add(this.targetIndicator);
    
    // Initially hide it
    this.targetIndicator.visible = false;
  }



  // Update target indicator position
  updateTargetIndicator() {
    if (!this.tramMovement || !this.targetIndicator) return;
    
    const progress = this.tramMovement.getProgress();
    if (progress.isMoving && progress.currentIndex < this.gpsPoints.length) {
      const targetGPS = this.gpsPoints[progress.currentIndex];
      
      // Use same positioning as GPS dots
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
    } else {
      this.targetIndicator.visible = false;
    }
  }

  // Method to update tram position from live GPS (called from main.js)
  updateTramPositionFromLiveGPS(lat, lon) {
    if (this.tramMovement) {
      this.tramMovement.updateFromLiveGPS(lat, lon);
    }
  }

  // Utility methods
  getTramProgress() {
    return this.tramMovement ? this.tramMovement.getProgress() : null;
  }

  setTramSpeed(speed) {
    if (this.tramMovement) {
      this.tramMovement.setSpeed(speed);
    }
  }

  // Add new method for map rotation controls
  setupMapAdjustmentControls() {
    window.addEventListener('keydown', (event) => {
        if (!this.mapModel) return;

        const moveStep = 10;
        const rotateStep = Math.PI / 36; // 5 degrees

        switch(event.key.toLowerCase()) {
            case 'arrowup':
                this.mapModel.position.z -= moveStep;
                break;
            case 'arrowdown':
                this.mapModel.position.z += moveStep;
                break;
            case 'arrowleft':
                this.mapModel.position.x -= moveStep;
                break;
            case 'arrowright':
                this.mapModel.position.x += moveStep;
                break;
            case 'q':
                this.mapModel.rotation.y += rotateStep;
                break;
            case 'e':
                this.mapModel.rotation.y -= rotateStep;
                break;
            case '[':
                this.mapModel.scale.multiplyScalar(0.9);
                break;
            case ']':
                this.mapModel.scale.multiplyScalar(1.1);
                break;
        }


    });


  }
}

export default SchoolMap;