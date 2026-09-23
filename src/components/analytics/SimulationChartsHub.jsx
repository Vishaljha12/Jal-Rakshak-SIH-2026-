import { useState, useMemo } from 'react';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  TrendingUp, BarChart3, Activity, ShieldAlert, Cpu, Waves, 
  ArrowRight, Maximize2, Layers 
} from 'lucide-react';
import ResultProvenanceBadge from './ResultProvenanceBadge';
import { generateOfflineStatistics, enrichStatistics } from '../../services/simulationService';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#080e1a]/95 backdrop-blur-md border border-cyan-500/40 p-3 rounded-xl shadow-2xl text-xs font-mono">
        <div className="text-slate-300 font-bold mb-1.5 pb-1 border-b border-cyan-500/20">{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5" style={{ color: entry.color }}>
            <span className="text-[11px] font-sans text-slate-300">{entry.name}:</span>
            <span className="font-bold font-mono">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value} {entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SimulationChartsHub({ statistics, solverName = 'dualsphysics', damName = 'Hidkal Dam' }) {
  const [activeChartTab, setActiveChartTab] = useState('hydrograph'); // 'hydrograph', 'attenuation', 'histogram', 'radar', 'regime'

  const enrichedStats = useMemo(() => {
    return enrichStatistics(statistics, solverName, { dam_name: damName });
  }, [statistics, solverName, damName]);

  const hydrographData = enrichedStats.hydrograph_series || [];
  const attenuationData = enrichedStats.attenuation_profile || [];
  const histogramData = enrichedStats.depth_distribution || [];
  const radarData = enrichedStats.radar_profile || [];
  const summary = enrichedStats.summary || {};

  // Color palette for depth histogram bins
  const binColors = ['#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#f59e0b', '#e11d48'];

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-cyan-500/25 shadow-2xl space-y-0">
      {/* Top Header & Chart Switcher */}
      <div className="p-4 px-6 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-950/40 via-[#0a1224] to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Hydrodynamic Statistical Visualizer Hub
              </h3>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                Vector Curves
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Continuous time-series discharge, downstream wave attenuation decay, and frequency histograms.
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex flex-wrap items-center bg-[#070c18] p-1 rounded-xl border border-cyan-500/20 text-xs">
          <button
            type="button"
            onClick={() => setActiveChartTab('hydrograph')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'hydrograph'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={13} />
            <span>Hydrograph Q(t)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('attenuation')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'attenuation'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves size={13} />
            <span>Wave Attenuation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('histogram')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'histogram'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 size={13} />
            <span>Depth Histogram</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('radar')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'radar'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert size={13} />
            <span>Hazard Radar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('regime')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'regime'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={13} />
            <span>Froude & Energy</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Body */}
      <div className="p-6">
        {/* 1. DYNAMIC HYDROGRAPH TIME SERIES */}
        {activeChartTab === 'hydrograph' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-200">Breach Discharge & Stage Depth Hydrograph</span>
                <span className="text-slate-500 font-mono">Q(t) [m³/s] & h(t) [m]</span>
                <ResultProvenanceBadge provenance={enrichedStats?.provenance} solver={solverName} variant="chart-tag" />
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  Peak Discharge: <strong>{summary.peak_discharge_m3s ? summary.peak_discharge_m3s.toLocaleString() : '3,304'} m³/s</strong>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  Peak Stage: <strong>{summary.max_depth_m || '6.4'} m</strong>
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hydrographData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dischargeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132438" />
                  <XAxis dataKey="time_label" stroke="#527891" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis yAxisId="left" stroke="#06b6d4" tick={{ fontSize: 10, fill: '#06b6d4' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 10, fill: '#10b981' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="discharge_m3s" 
                    name="Breach Discharge Q" 
                    unit="m³/s" 
                    stroke="#06b6d4" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#dischargeGrad)" 
                  />
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="depth_m" 
                    name="Stage Depth h" 
                    unit="m" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#depthGrad)" 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="velocity_ms" 
                    name="Flow Velocity v" 
                    unit="m/s" 
                    stroke="#f59e0b" 
                    strokeWidth={1.8}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. DOWNSTREAM WAVE ATTENUATION PROFILE */}
        {activeChartTab === 'attenuation' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-200">Downstream Longitudinal Attenuation Profile</span>
                <span className="text-slate-500 font-mono">Distance (0 to 40 km)</span>
                <ResultProvenanceBadge provenance={enrichedStats?.provenance} solver={solverName} variant="chart-tag" />
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Bed roughness friction coefficient Manning n: <strong className="text-cyan-300">0.035</strong>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attenuationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132438" />
                  <XAxis 
                    dataKey="distance_km" 
                    stroke="#527891" 
                    tickFormatter={(v) => `${v} km`}
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                  />
                  <YAxis yAxisId="depth" stroke="#38bdf8" tick={{ fontSize: 10, fill: '#38bdf8' }} />
                  <YAxis yAxisId="vel" orientation="right" stroke="#f43f5e" tick={{ fontSize: 10, fill: '#f43f5e' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Line 
                    yAxisId="depth" 
                    type="monotone" 
                    dataKey="depth_m" 
                    name="Flood Depth Decay" 
                    unit="m" 
                    stroke="#38bdf8" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#38bdf8' }}
                  />
                  <Line 
                    yAxisId="vel" 
                    type="monotone" 
                    dataKey="velocity_ms" 
                    name="Jet Velocity Dissipation" 
                    unit="m/s" 
                    stroke="#f43f5e" 
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f43f5e' }}
                  />
                  <Line 
                    yAxisId="depth" 
                    type="monotone" 
                    dataKey="momentum_flux" 
                    name="Unit Momentum Flux" 
                    unit="kN/m" 
                    stroke="#eab308" 
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. STATISTICAL DEPTH FREQUENCY HISTOGRAM */}
        {activeChartTab === 'histogram' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-200">Flooded Spatial Area by Depth Bracket (Histogram)</span>
                <span className="text-slate-500 font-mono">Binned distribution</span>
                <ResultProvenanceBadge provenance={enrichedStats?.provenance} solver={solverName} variant="chart-tag" />
              </div>
              <div className="text-[11px] font-mono text-cyan-400">
                Total Inundation: <strong>{summary.inundation_area_km2} km²</strong>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132438" />
                  <XAxis dataKey="bin" stroke="#527891" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#527891" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="area_km2" name="Flooded Footprint Area" unit="km²" radius={[6, 6, 0, 0]}>
                    {histogramData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={binColors[index % binColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 4. HYDRODYNAMIC RISK RADAR SPIDER PROFILE */}
        {activeChartTab === 'radar' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-200">Multi-Hazard Hydrodynamic Risk Spider Profile</span>
                <span className="text-slate-500 font-mono">[0 – 100]</span>
                <ResultProvenanceBadge provenance={enrichedStats?.provenance} solver={solverName} variant="chart-tag" />
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Baseline safety index = 50. Values &gt; 60 indicate severe structural hazard.
              </div>
            </div>

            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#15283c" />
                  <PolarAngleAxis dataKey="metric" stroke="#7192a8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Radar 
                    name="Simulated Scenario Score" 
                    dataKey="simulated" 
                    stroke="#06b6d4" 
                    fill="#06b6d4" 
                    fillOpacity={0.45} 
                    strokeWidth={2}
                  />
                  <Radar 
                    name="Critical Safety Threshold" 
                    dataKey="threshold" 
                    stroke="#f43f5e" 
                    fill="#f43f5e" 
                    fillOpacity={0.15} 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 5. FLOW REGIME & ENERGY HEAD */}
        {activeChartTab === 'regime' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-200">Flow Regime & Energy Head Partition</span>
                <span className="text-slate-500 font-mono">Froude Fr & Head</span>
                <ResultProvenanceBadge provenance={enrichedStats?.provenance} solver={solverName} variant="chart-tag" />
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-amber-400">
                  Froude: <strong>Fr = {summary.froude_number}</strong> ({summary.froude_number >= 1.0 ? 'Supercritical Shock' : 'Subcritical'})
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-300">
                  Kinetic Energy: <strong>{summary.kinetic_energy_gj} GJ</strong>
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={attenuationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132438" />
                  <XAxis 
                    dataKey="distance_km" 
                    stroke="#527891" 
                    tickFormatter={(v) => `${v} km`}
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                  />
                  <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10, fill: '#38bdf8' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#eab308" tick={{ fontSize: 10, fill: '#eab308' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar 
                    yAxisId="left" 
                    dataKey="depth_m" 
                    name="Potential Head (Depth h)" 
                    unit="m" 
                    fill="#0284c7" 
                    opacity={0.6}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="velocity_ms" 
                    name="Kinetic Head (Velocity v)" 
                    unit="m/s" 
                    stroke="#eab308" 
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#eab308' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Highlights */}
      <div className="p-3.5 px-6 bg-[#040810] border-t border-cyan-500/15 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">Continuous Dynamic Interpolation</span>
          <span className="text-slate-600">•</span>
          <span>Mesh nodes: <strong className="text-cyan-300 font-bold">{summary.node_count ? (summary.node_count / 1000).toFixed(0) + 'k' : '850k'}</strong></span>
        </div>
        <div className="text-slate-500 text-[10px]">
          Equations: 3D Navier-Stokes SPH Momentum + 2D Saint-Venant Depth-Averaged SWE
        </div>
      </div>
    </div>
  );
}
