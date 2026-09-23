import React from 'react';
import { Play, Pause, RotateCcw, Layers, Eye, EyeOff, Sliders } from 'lucide-react';

export function SimulationControls({ 
  _engine, 
  onStart, 
  onPause, 
  onReset, 
  isRunning,
  showTerrain,
  setShowTerrain,
  showWater,
  setShowWater,
  speed,
  setSpeed,
  releaseVolume,
  setReleaseVolume,
  damBreakWidth,
  setDamBreakWidth,
  verticalExaggeration,
  setVerticalExaggeration
}) {
  return (
    <div className="absolute top-4 left-4 w-80 glass-panel rounded-2xl shadow-2xl text-slate-200 z-10 overflow-hidden border border-cyan-500/30">
      <div className="p-3.5 px-4 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-950/40 via-[#0d1527] to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-cyan-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-100">3D Simulation Controls</h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
          DUAL-SPH
        </span>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Playback Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <button 
              onClick={onStart} 
              className="flex-1 glow-cyan-btn text-[#070c18] font-bold py-2 rounded-xl flex items-center justify-center gap-2 text-xs transition-transform"
            >
              <Play size={14} fill="currentColor" /> Start Inundation
            </button>
          ) : (
            <button 
              onClick={onPause} 
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            >
              <Pause size={14} fill="currentColor" /> Pause Flow
            </button>
          )}
          <button 
            onClick={onReset} 
            className="glass-card hover:border-cyan-500/40 text-slate-200 px-3.5 py-2 rounded-xl flex items-center justify-center transition-colors text-xs"
            title="Reset Simulation"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Parameters */}
        <div className="space-y-3 pt-3 border-t border-cyan-500/15 text-xs">
          <div>
            <div className="flex justify-between text-[11px] mb-1 text-slate-400 font-mono">
              <label>Sim Time Step Speed</label>
              <span className="text-cyan-400 font-bold">{speed}x</span>
            </div>
            <input 
              type="range" min="0.1" max="10" step="0.1" 
              value={speed} 
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-[11px] mb-1 text-slate-400 font-mono">
              <label>Breach Discharge / Inflow</label>
              <span className="text-cyan-400 font-bold">{releaseVolume} m³/s</span>
            </div>
            <input 
              type="range" min="1" max="50" step="1" 
              value={releaseVolume} 
              onChange={(e) => setReleaseVolume(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1 text-slate-400 font-mono">
              <label>Breach Width Aperture</label>
              <span className="text-cyan-400 font-bold">{damBreakWidth} cells</span>
            </div>
            <input 
              type="range" min="1" max="20" step="1" 
              value={damBreakWidth} 
              onChange={(e) => setDamBreakWidth(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1 text-slate-400 font-mono">
              <label>Vertical Exaggeration (Z)</label>
              <span className="text-cyan-400 font-bold">{verticalExaggeration}x</span>
            </div>
            <input 
              type="range" min="1" max="10" step="0.5" 
              value={verticalExaggeration} 
              onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="space-y-2 pt-3 border-t border-cyan-500/15">
          <button 
            onClick={() => setShowTerrain(!showTerrain)}
            className={`w-full text-left text-xs px-3 py-2 rounded-xl flex items-center justify-between border transition-all ${
              showTerrain 
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <span className="flex items-center gap-2"><Layers size={13}/> Elevation DEM Mesh</span>
            {showTerrain ? <Eye size={13} className="text-cyan-400"/> : <EyeOff size={13} className="text-slate-500"/>}
          </button>
          
          <button 
            onClick={() => setShowWater(!showWater)}
            className={`w-full text-left text-xs px-3 py-2 rounded-xl flex items-center justify-between border transition-all ${
              showWater 
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <span className="flex items-center gap-2"><Layers size={13}/> Dynamic Hydro Fluid</span>
            {showWater ? <Eye size={13} className="text-cyan-400"/> : <EyeOff size={13} className="text-slate-500"/>}
          </button>
        </div>
      </div>
    </div>
  );
}
