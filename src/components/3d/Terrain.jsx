import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function Terrain({ url, onLoad, visible }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef(null);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (scene && !notifiedRef.current) {
      // Find the first mesh and set up materials
      scene.traverse((child) => {
        if (child.isMesh) {
          meshRef.current = child;
          
          // Apply a generic terrain material
          child.material = new THREE.MeshStandardMaterial({
            color: '#8b7355', // Earthy brown
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
          });
          
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Center the geometry
          child.geometry.computeBoundingBox();
          const center = new THREE.Vector3();
          child.geometry.boundingBox.getCenter(center);
          child.geometry.translate(-center.x, -center.y, -center.z);
          
          // Recompute bounding box after translation
          child.geometry.computeBoundingBox();
        }
      });
      
      // Notify parent that mesh is loaded (so simulation engine can read it)
      if (meshRef.current && onLoad) {
        notifiedRef.current = true;
        onLoad(meshRef.current);
      }
    }
  }, [scene, onLoad]);

  return (
    <primitive 
      object={scene} 
      visible={visible} 
      position={[0, 0, 0]} 
    />
  );
}

// Preload the model
useGLTF.preload('/Models/Hidkal_DEM_REAL_UTM_model.stl.glb');
