import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { Terrain } from './Terrain';
import { FloodWater } from './FloodWater';
import { SimulationEngine } from './simulationEngine';

// A helper component to step the engine inside the R3F loop
function EngineStepper({ engine }) {
  useFrame((state, delta) => {
    // Limit delta to avoid huge spikes if tab is backgrounded
    const dt = Math.min(delta, 0.1); 
    if (engine && engine.isRunning) {
      engine.step(dt);
    }
  });
  return null;
}

export function FloodSimulation({ 
  terrainUrl, 
  onEngineReady, 
  showTerrain = true, 
  showWater = true,
  verticalExaggeration = 1 
}) {
  const [engineReady, setEngineReady] = useState(false);
  
  // Keep a single instance of the engine
  const engine = useMemo(() => new SimulationEngine(), []);

  // When terrain mesh is loaded, initialize the engine's grid
  const handleTerrainLoad = async (mesh) => {
    // Use a reasonable resolution for interactive performance (e.g., 150x150)
    await engine.initializeFromMesh(mesh, 150);
    setEngineReady(true);
    if (onEngineReady) onEngineReady(engine);
  };

  return (
    <Canvas 
      camera={{ position: [0, 2000, 3000], fov: 45 }}
      shadows
    >
      <color attach="background" args={['#0f172a']} />
      
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[1000, 2000, 1000]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={10000}
        shadow-camera-left={-2000}
        shadow-camera-right={2000}
        shadow-camera-top={2000}
        shadow-camera-bottom={-2000}
      />
      
      <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
      
      <Terrain 
        url={terrainUrl} 
        onLoad={handleTerrainLoad} 
        visible={showTerrain} 
      />
      
      {engineReady && (
        <FloodWater 
          engine={engine} 
          visible={showWater} 
          verticalExaggeration={verticalExaggeration}
        />
      )}
      
      <EngineStepper engine={engine} />
      
      <OrbitControls 
        makeDefault 
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below ground
        minDistance={100}
        maxDistance={8000}
      />
    </Canvas>
  );
}
