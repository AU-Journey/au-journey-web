// TramMovement.js
import * as THREE from 'three';
import gsap from 'gsap';

class TramMovement {
  constructor(tram, gpsTo3DCoords, gpsPoints, offset = new THREE.Vector3(0, 0, 0)) {
    this.tram = tram;
    this.gpsTo3DCoords = gpsTo3DCoords;
    this.gpsPoints = gpsPoints;
    this.offset = offset;
    this.currentIndex = 0;
    this.isMoving = false;
    this.baseHeight = 2; // Keep tram slightly above ground
    this.currentTween = null;
    
    // Speed settings (units per second)
    this.tramSpeed = 30; // Adjusted for the new scale
    this.rotationSpeed = 2; // How fast the tram rotates to face direction

    // Log initial setup
    const firstPos = this.gpsTo3DCoords(gpsPoints[0].lat, gpsPoints[0].lon);
    console.log('TramMovement initialized:', {
      startPosition: firstPos,
      totalPoints: gpsPoints.length
    });
  }

  start() {
    if (!this.tram || !this.gpsPoints.length) {
      console.warn('⚠️ Cannot start tram movement: missing tram or GPS points');
      return;
    }
    
    //console.log(`🚋 Starting tram movement with ${this.gpsPoints.length} GPS points`);
    this.isMoving = true;
    this.moveToNextPoint();
  }

  stop() {
    this.isMoving = false;
    if (this.currentTween) {
      this.currentTween.kill();
      this.currentTween = null;
    }
    //console.log('🛑 Tram movement stopped');
  }

  moveToNextPoint() {
    if (!this.isMoving || this.currentIndex >= this.gpsPoints.length) return;

    const gps = this.gpsPoints[this.currentIndex];
    const targetPos = this.gpsTo3DCoords(gps.lat, gps.lon);
    
    // No need to apply offset since it's handled in the conversion
    const position = {
      x: targetPos.x,
      y: this.baseHeight,
      z: targetPos.z
    };

    // Calculate distance to target
    const dx = position.x - this.tram.position.x;
    const dz = position.z - this.tram.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Skip if distance is too small
    if (distance < 1) {
      this.currentIndex++;
      if (this.currentIndex >= this.gpsPoints.length) {
        this.currentIndex = 0;
      }
      setTimeout(() => this.moveToNextPoint(), 100);
      return;
    }

    // Calculate duration based on speed and distance
    const duration = Math.max(0.5, distance / this.tramSpeed);

    // Calculate rotation to face movement direction
    const targetRotation = Math.atan2(dx, dz);

    // Create timeline for movement
    const tl = gsap.timeline();

    // Handle rotation
    const currentRotation = this.tram.rotation.y;
    let rotationDiff = targetRotation - currentRotation;
    
    // Handle rotation wrapping
    if (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
    if (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

    if (Math.abs(rotationDiff) > 0.1) {
      tl.to(this.tram.rotation, {
        duration: Math.min(0.5, Math.abs(rotationDiff) / this.rotationSpeed),
        y: currentRotation + rotationDiff,
        ease: 'power2.out'
      });
    }

    // Move to target
    tl.to(this.tram.position, {
      duration: duration,
      x: position.x,
      y: position.y,
      z: position.z,
      ease: 'power1.inOut',
      onComplete: () => {
        this.onPointReached();
      }
    }, ">-0.2");

    this.currentTween = tl;
  }

  onPointReached() {
    if (!this.isMoving) return;

    this.currentIndex++;
    
    // Loop back to start when reaching the end
    if (this.currentIndex >= this.gpsPoints.length) {
      //console.log('🔄 Looping back to start of route');
      this.currentIndex = 0;
    }

    // Small delay before moving to next point for more realistic movement
    setTimeout(() => {
      this.moveToNextPoint();
    }, 200);
  }

  // Method to update tram position from live GPS (if needed)
  updateFromLiveGPS(lat, lon) {
    if (!this.tram) return;

    const rawPos = this.gpsTo3DCoords(lat, lon);
    const targetPos = {
      x: rawPos.x + this.offset.x,
      y: this.baseHeight,
      z: rawPos.z + this.offset.z
    };

    // Stop current movement
    if (this.currentTween) {
      this.currentTween.kill();
    }

    // Smoothly move to live GPS position
    gsap.to(this.tram.position, {
      duration: 1.5,
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      ease: 'power2.out'
    });

    //console.log(`📡 Updated tram position from live GPS: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
  }

  // Method to set tram speed dynamically
  setSpeed(speed) {
    this.tramSpeed = Math.max(1, speed); // Minimum speed of 1
    //console.log(`🏃 Tram speed set to ${this.tramSpeed} units/second`);
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