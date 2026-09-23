import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function FloodWater({ engine, visible, verticalExaggeration = 1 }) {
  const meshRef = useRef();

  // Create geometry once the engine is initialized
  const geometry = useMemo(() => {
    if (!engine || engine.width === 0) return null;

    // We create a plane with the exact number of segments as the engine grid
    // Segments = width - 1
    const geom = new THREE.PlaneGeometry(
      engine.width * engine.cellSize,
      engine.height * engine.cellSize,
      engine.width - 1,
      engine.height - 1
    );

    // Rotate flat to XZ plane
    geom.rotateX(-Math.PI / 2);

    // Add custom colors attribute for depth coloring
    const colors = new Float32Array(geom.attributes.position.count * 3);
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geom;
  }, [engine]);

  // Update geometry vertices every frame based on engine state
  useFrame(() => {
    if (!visible || !engine || !meshRef.current || !engine.isRunning) return;

    const positions = meshRef.current.geometry.attributes.position.array;
    const colors = meshRef.current.geometry.attributes.color.array;

    const colorShallow = new THREE.Color('#34d399'); // Green/Teal
    const colorMid = new THREE.Color('#fbbf24'); // Yellow
    const colorDeep = new THREE.Color('#f87171'); // Red
    const colorTemp = new THREE.Color();

    for (let i = 0; i < positions.length / 3; i++) {
      // Map vertex index (which goes row by row, top to bottom in PlaneGeometry)
      // to our engine index (z * width + x)
      const x = i % engine.width;
      const z = Math.floor(i / engine.width);
      
      // Engine index
      const idx = z * engine.width + x;

      const depth = engine.depth[idx];
      const waterY = engine.waterLevel[idx];
      const elevY = engine.elevation[idx];

      // Only show water if depth is significant
      if (depth > 0.1) {
        // Apply vertical exaggeration
        const exaggeratedWaterY = elevY + (depth * verticalExaggeration);
        
        // Offset Y slightly above terrain to prevent Z-fighting
        positions[i * 3 + 1] = exaggeratedWaterY + 0.5;

        // Color interpolation based on depth (max assumed 20 for coloring)
        const t = Math.min(depth / 20, 1);
        
        if (t < 0.5) {
          colorTemp.lerpColors(colorShallow, colorMid, t * 2);
        } else {
          colorTemp.lerpColors(colorMid, colorDeep, (t - 0.5) * 2);
        }

        colors[i * 3] = colorTemp.r;
        colors[i * 3 + 1] = colorTemp.g;
        colors[i * 3 + 2] = colorTemp.b;
      } else {
        // Hide vertex by sinking it way below
        positions[i * 3 + 1] = -10000; 
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.attributes.color.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} visible={visible}>
      <meshStandardMaterial 
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        roughness={0.1}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
