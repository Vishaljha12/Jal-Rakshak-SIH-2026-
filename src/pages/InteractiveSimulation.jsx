import React, { useState, useEffect } from 'react';
import { FloodSimulation } from '../components/3d/FloodSimulation';
import { SimulationControls } from '../components/3d/SimulationControls';
import { SimulationStats, FloodLegend } from '../components/3d/SimulationOverlays';
import { Loader2 } from 'lucide-react';

export default function InteractiveSimulation() {
  const [engine, setEngine] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // UI State
  const [showTerrain, setShowTerrain] = useState(true);
  const [showWater, setShowWater] = useState(true);
  
  // Simulation Params
  const [speed, setSpeed] = useState(1);
  const [releaseVolume, setReleaseVolume] = useState(10);
  const [damBreakWidth, setDamBreakWidth] = useState(5);
  const [verticalExaggeration, setVerticalExaggeration] = useState(2);

  // Update engine when params change
  useEffect(() => {
    if (engine) {
      engine.setParams({ speed, releaseVolume, damBreakWidth });
    }
  }, [engine, speed, releaseVolume, damBreakWidth]);

  const handleStart = () => {
    if (engine) {
      engine.start();
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    if (engine) {
      engine.pause();
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (engine) {
      engine.reset();
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full h-full relative bg-navy-900 overflow-hidden">
      
      {!engine && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-navy-900/80 backdrop-blur-sm text-teal-400">
          <Loader2 size={48} className="animate-spin mb-4" />
          <h2 className="text-xl font-bold text-slate-200">Loading 3D Terrain...</h2>
          <p className="text-slate-400 mt-2">Processing Hidkal Dam elevation grid (this may take a few seconds)</p>
        </div>
      )}

      {/* Main 3D Canvas */}
      <FloodSimulation 
        terrainUrl="/Models/Hidkal_DEM_REAL_UTM_model.stl.glb"
        onEngineReady={(e) => setEngine(e)}
        showTerrain={showTerrain}
        showWater={showWater}
        verticalExaggeration={verticalExaggeration}
      />

      {/* UI Overlays */}
      {engine && (
        <>
          <SimulationControls 
            engine={engine}
            isRunning={isRunning}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            showTerrain={showTerrain}
            setShowTerrain={setShowTerrain}
            showWater={showWater}
            setShowWater={setShowWater}
            speed={speed}
            setSpeed={setSpeed}
            releaseVolume={releaseVolume}
            setReleaseVolume={setReleaseVolume}
            damBreakWidth={damBreakWidth}
            setDamBreakWidth={setDamBreakWidth}
            verticalExaggeration={verticalExaggeration}
            setVerticalExaggeration={setVerticalExaggeration}
          />
          <SimulationStats engine={engine} />
          <FloodLegend />
        </>
      )}
    </div>
  );
}
