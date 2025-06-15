import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import TramMovement from './TramMovement';

class SchoolMap {
  constructor(container) {
    this.container = container;
    this.origin = this.gpsTo3DCoords(13.612250851950218, 100.83675678938899);
    this.offset = new THREE.Vector3(200, 0, -500);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = null;
    this.mapModel = null;
    this.tram = null;
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
    this.loadTramModel();

    // Start animation loop
    this.animate();
    
    // Enable debugging features
    this.enableClickToLogPosition();
    this.setupKeyboardControls();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  gpsTo3DCoords(lat, lon) {
    const x = -30392.5743 * lon + -101453.9810 * lat + 4619483.1813;
    const z = -114233.6226 * lon + 31468.6022 * lat + 9802466.3411;
    return { x, y: 0, z };
  }

  loadMapModel() {
    console.log('🗺️ Starting to load map model...');
    const loader = new GLTFLoader();
    
    // Get base URL for assets
    const baseUrl = import.meta.env.BASE_URL || '/';
    const modelPath = `${baseUrl}models/school_map.glb`;
    console.log('📍 Attempting to load map from:', modelPath);
    
    loader.load(modelPath, 
      (gltf) => {
        console.log('✅ Map model loaded successfully');
        this.mapModel = gltf.scene;
        this.mapModel.scale.set(1, 1, 1);
        
        // Position map model
        this.mapModel.position.set(
          this.origin.x + this.offset.x, 
          0, 
          this.origin.z + this.offset.z
        );

        // Enable shadows
        this.mapModel.traverse((child) => {
          if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = true;
          }
        });

        this.scene.add(this.mapModel);
        console.log('✅ Map added to scene');

        // Auto-center camera
        const box = new THREE.Box3().setFromObject(this.mapModel);
        const center = new THREE.Vector3();
        box.getCenter(center);

        this.camera.position.set(center.x, center.y + 150, center.z + 300);
        this.camera.lookAt(center);

        if (this.controls) {
          this.controls.target.copy(center);
          this.controls.update();
        }

        this.addGPSDots();
        this.addRouteVisualization();
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(2);
        //console.log(`📊 Map loading progress: ${percent}%`);
      },
      (error) => {
        console.error('❌ Error loading map model:', error);
        console.error('Failed path:', modelPath);
      }
    );
  }

  loadTramModel() {
    console.log('🚋 Starting to load tram model...');
    const loader = new GLTFLoader();
    
    // Get base URL for assets
    const baseUrl = import.meta.env.BASE_URL || '/';
    const modelPath = `${baseUrl}models/tram.glb`;
    console.log('📍 Attempting to load tram from:', modelPath);
    
    loader.load(modelPath,
      (gltf) => {
        console.log('✅ Tram model loaded successfully');
        this.tram = gltf.scene;
        this.tram.scale.set(1, 1, 1);

        // Enable shadows
        this.tram.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Position tram at first GPS point
        const firstGPS = this.gpsTo3DCoords(this.gpsPoints[0].lat, this.gpsPoints[0].lon);
        this.tram.position.set(
          firstGPS.x + this.offset.x, 
          2, // Slightly above ground
          firstGPS.z + this.offset.z
        );

        this.scene.add(this.tram);
        console.log('✅ Tram added to scene');

        // Initialize tram movement
        this.tramMovement = new TramMovement(
          this.tram, 
          this.gpsTo3DCoords.bind(this), 
          this.gpsPoints, 
          this.offset
        );

        // Start tram movement
        this.tramMovement.start();
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(2);
        console.log(`📊 Tram loading progress: ${percent}%`);
      },
      (error) => {
        console.error('❌ Error loading tram model:', error);
        console.error('Failed path:', modelPath);
      }
    );
  }

  addGPSDots() {
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8
    });
    const geometry = new THREE.SphereGeometry(1.5, 12, 12);

    if (!this.gpsPoints || this.gpsPoints.length === 0) {
      console.warn('⚠️ No GPS points found!');
      return;
    }

    this.gpsPoints.forEach((gps, i) => {
      const pos = this.gpsTo3DCoords(gps.lat, gps.lon);
      const dot = new THREE.Mesh(geometry, material);
      dot.position.set(
        pos.x + this.offset.x, 
        1, // Slightly above ground
        pos.z + this.offset.z
      );
      dot.name = `gps-dot-${i}`;
      this.scene.add(dot);
    });

    //console.log(`📍 Added ${this.gpsPoints.length} GPS dots`);
  }

  addRouteVisualization() {
    const points = this.gpsPoints.map(gps => {
      const pos = this.gpsTo3DCoords(gps.lat, gps.lon);
      return new THREE.Vector3(
        pos.x + this.offset.x,
        1.5, // Slightly above dots
        pos.z + this.offset.z
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

    //console.log('📏 Added route visualization');
  }

  setupKeyboardControls() {
    window.addEventListener('keydown', (event) => {
      if (!this.tramMovement) return;

      switch(event.key.toLowerCase()) {
        case ' ': // Spacebar to toggle movement
          if (this.tramMovement.isMoving) {
            this.tramMovement.stop();
            //console.log('⏸️ Tram movement paused');
          } else {
            this.tramMovement.start();
            //console.log('▶️ Tram movement resumed');
          }
          break;
        case 'r': // R to reset to first point
          this.tramMovement.stop();
          this.tramMovement.currentIndex = 0;
          this.tramMovement.start();
          //console.log('🔄 Tram reset to start');
          break;
        case '=':
        case '+': // Increase speed
          this.tramMovement.setSpeed(this.tramMovement.tramSpeed + 5);
          break;
        case '-': // Decrease speed
          this.tramMovement.setSpeed(this.tramMovement.tramSpeed - 5);
          break;
      }
    });

    //console.log('⌨️ Keyboard controls enabled: Space (pause/resume), R (reset), +/- (speed)');
  }

  updateTramPositionFromLiveGPS(lat, lon) {
    if (this.tramMovement) {
      this.tramMovement.updateFromLiveGPS(lat, lon);
    }
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
    
    this.renderer.render(this.scene, this.camera);
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
}

export default SchoolMap;