// TramMovement.js
import * as THREE from 'three';
import gsap from 'gsap';

class TramMovement {
  constructor(tram, gpsTo3DCoords, gpsPoints, offset = new THREE.Vector3(0, 0, 0)) {
    this.tram = tram;
    this.gpsPoints = gpsPoints;
    this.offset = offset;
    this.currentIndex = 0;
    this.isMoving = false;
    this.baseHeight = 2; // Keep tram slightly above ground
    this.currentTween = null;
    
    // Speed settings (units per second) - much slower for realistic movement
    this.tramSpeed = 10; // Slower speed for realistic tram movement
    this.rotationSpeed = 1; // Slower rotation for smoother turning

    // Calculate coordinate system parameters once
    const firstPoint = this.gpsPoints[0];
    const lastPoint = this.gpsPoints[this.gpsPoints.length - 1];
    this.centerLat = (firstPoint.lat + lastPoint.lat) / 2;
    this.centerLon = (firstPoint.lon + lastPoint.lon) / 2;
    this.scale = 100000;

    console.log('✅ TramMovement initialized with', gpsPoints.length, 'GPS points');
  }

  // Helper method to calculate position using same logic as GPS dots
  calculatePosition(lat, lon) {
    return {
      x: (lat - this.centerLat) * this.scale,
      y: this.baseHeight,
      z: (lon - this.centerLon) * this.scale
    };
  }

  start() {
    if (!this.tram || !this.gpsPoints.length) {
      console.warn('⚠️ Cannot start tram movement: missing tram or GPS points');
      return;
    }
    
    this.isMoving = true;
    this.moveToNextPoint();
  }

  stop() {
    this.isMoving = false;
    if (this.currentTween) {
      this.currentTween.kill();
      this.currentTween = null;
    }
  }

  moveToNextPoint() {
    if (!this.isMoving || this.currentIndex >= this.gpsPoints.length) return;

    const gps = this.gpsPoints[this.currentIndex];
    const position = this.calculatePosition(gps.lat, gps.lon);

    // Calculate distance to target
    const dx = position.x - this.tram.position.x;
    const dz = position.z - this.tram.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Skip if distance is too small
    if (distance < 0.5) {
      this.currentIndex++;
      if (this.currentIndex >= this.gpsPoints.length) {
        this.currentIndex = 0;
      }
      setTimeout(() => this.moveToNextPoint(), 300);
      return;
    }

    // Calculate duration based on speed and distance
    const duration = Math.max(1.0, distance / this.tramSpeed);

    // Calculate rotation to face movement direction
    const targetRotation = Math.atan2(dx, dz);

    // Create timeline for movement
    const tl = gsap.timeline();

    // Handle rotation first - make sure tram faces direction before moving
    const currentRotation = this.tram.rotation.y;
    let rotationDiff = targetRotation - currentRotation;
    
    // Handle rotation wrapping
    if (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
    if (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

    // Always rotate first if needed
    if (Math.abs(rotationDiff) > 0.05) {
      const rotationDuration = Math.min(1.0, Math.abs(rotationDiff) / this.rotationSpeed);
      tl.to(this.tram.rotation, {
        duration: rotationDuration,
        y: currentRotation + rotationDiff,
        ease: 'power2.inOut'
      });
    }

    // Move to target after rotation
    tl.to(this.tram.position, {
      duration: duration,
      x: position.x,
      y: position.y,
      z: position.z,
      ease: 'none', // Linear movement for consistent speed
      onComplete: () => {
        this.onPointReached();
      }
    });

    this.currentTween = tl;
  }

  onPointReached() {
    if (!this.isMoving) return;

    // Small delay before moving to next point for more realistic movement
    setTimeout(() => {
      if (this.isMoving) {
        this.moveToNextPoint();
      }
    }, 500); // Longer pause at each GPS point
  }

  // Method to update tram position from live GPS (if needed)
  updateFromLiveGPS(lat, lon) {
    if (!this.tram) return;

    const position = this.calculatePosition(lat, lon);

    // Stop current movement
    if (this.currentTween) {
      this.currentTween.kill();
    }

    // Smoothly move to live GPS position
    gsap.to(this.tram.position, {
      duration: 1.5,
      x: position.x,
      y: position.y,
      z: position.z,
      ease: 'power2.out'
    });
  }

  // Method to set tram speed dynamically
  setSpeed(speed) {
    this.tramSpeed = Math.max(1, speed); // Minimum speed of 1
  }

  // Get current progress information
  getProgress() {
    return {
      currentIndex: this.currentIndex,
      totalPoints: this.gpsPoints.length,
      isMoving: this.isMoving,
      progress: (this.currentIndex / this.gpsPoints.length) * 100
    };
  }
}

export default TramMovement;