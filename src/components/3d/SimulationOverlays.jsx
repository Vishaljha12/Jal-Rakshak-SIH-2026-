import React, { useEffect, useState } from 'react';
import { Clock, ShieldAlert, Activity } from 'lucide-react';

export function SimulationStats({ engine }) {
  const [stats, setStats] = useState({ time: 0, depth: 0, area: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      if (engine && engine.isRunning) {
        setStats({
          time: engine.time,
          depth: engine.maxDepth,
          area: engine.floodedArea
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [engine]);

  const formatTime = (t) => {
    const hours = Math.floor(t / 3600);
    const mins = Math.floor((t % 3600) / 60);
    const secs = Math.floor(t % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-4 right-4 glass-panel border border-cyan-500/30 rounded-2xl shadow-2xl p-4 text-slate-200 z-10 w-72">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-cyan-500/15">
        <h3 className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
          3D Hydro Telemetry
        </h3>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-[#080d1a]/60 p-2.5 rounded-xl border border-cyan-500/10">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Simulated Elapsed</div>
            <div className="font-mono font-bold text-sm text-slate-100">{formatTime(stats.time)}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-[#080d1a]/60 p-2.5 rounded-xl border border-rose-500/10">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
            <ShieldAlert size={16} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Peak Crest Depth</div>
            <div className="font-mono font-bold text-sm text-rose-400">
              {stats.depth.toFixed(1)} <span className="text-xs text-slate-400 font-normal">meters</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#080d1a]/60 p-2.5 rounded-xl border border-teal-500/10">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-400">
            <Activity size={16} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Inundated Polygon Area</div>
            <div className="font-mono font-bold text-sm text-cyan-300">
              {stats.area.toFixed(2)} <span className="text-xs text-slate-400 font-normal">km²</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FloodLegend() {
  return (
    <div className="absolute bottom-4 right-4 glass-panel border border-cyan-500/30 rounded-2xl p-3.5 text-slate-200 z-10 text-xs shadow-xl">
      <div className="font-mono text-[10px] uppercase font-bold text-cyan-400 mb-2">Depth Scale (m)</div>
      <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px]">
        <div className="w-3.5 h-3.5 rounded bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
        <span>&lt; 5.0m (Shallow)</span>
      </div>
      <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px]">
        <div className="w-3.5 h-3.5 rounded bg-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
        <span>5.0m - 10.0m (Moderate)</span>
      </div>
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <div className="w-3.5 h-3.5 rounded bg-[#f87171] shadow-[0_0_8px_rgba(248,113,113,0.5)]"></div>
        <span>&gt; 10.0m (Severe Torrent)</span>
      </div>
    </div>
  );
}
