/**
 * Rendering optimization utilities for Three.js
 */
import { PCFSoftShadowMap, LOD, Object3D } from 'three';

/**
 * Configure renderer for optimal performance
 * @param {WebGLRenderer} renderer - Three.js renderer instance
 */
export function optimizeRenderer(renderer) {
  // Enable hardware acceleration
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
  
  // Shadow optimizations
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // Manual update only when needed
  
  // Additional optimizations
  renderer.powerPreference = "high-performance";
  renderer.antialias = true;
  renderer.stencil = false; // Disable if not needed
  renderer.depth = true;
}

/**
 * Optimize material for better performance
 * @param {Material} material - Three.js material
 */
export function optimizeMaterial(material) {
  // Reduce overdraw for transparent materials
  if (material.transparent) {
    material.alphaTest = material.alphaTest || 0.5;
    material.depthWrite = false;
  }
  
  // Enable frustum culling
  material.frustumCulled = true;
}

/**
 * Setup LOD (Level of Detail) for complex objects
 * @param {Object3D} object - Three.js object
 * @param {Camera} camera - Three.js camera
 */
export function setupLOD(object, camera) {
  const lod = new LOD();
  
  // High detail for close range
  lod.addLevel(object, 0);
  
  // Medium detail clone for medium range (if needed)
  // lod.addLevel(mediumDetailObject, 50);
  
  // Low detail or hide for far range
  lod.addLevel(new Object3D(), 200);
  
  return lod;
}

/**
 * Dispose of Three.js resources properly
 * @param {Object3D} object - Three.js object to dispose
 */
export function disposeObject(object) {
  if (object.geometry) {
    object.geometry.dispose();
  }
  
  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach(material => material.dispose());
    } else {
      object.material.dispose();
    }
  }
  
  if (object.texture) {
    object.texture.dispose();
  }
}

/**
 * Optimize scene for better performance
 * @param {Scene} scene - Three.js scene
 */
export function optimizeScene(scene) {
  // Enable auto-clear for better performance
  scene.autoUpdate = false; // Update manually when needed
  
  // Traverse and optimize all objects
  scene.traverse((child) => {
    if (child.isMesh) {
      // Enable frustum culling
      child.frustumCulled = true;
      
      // Optimize materials
      if (child.material) {
        optimizeMaterial(child.material);
      }
      
      // Set matrix auto update based on whether object moves
      if (child.userData.static) {
        child.matrixAutoUpdate = false;
        child.updateMatrix();
      }
    }
  });
} 