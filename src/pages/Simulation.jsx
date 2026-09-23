import { useState, useEffect } from 'react';
import { 
  Play, Loader2, CheckCircle2, Database, AlertCircle, Cpu, Sliders, 
  ArrowRight, Globe, MapPin, Search, Check, Filter, 
  Compass, Waves, Building2, ChevronRight, RefreshCw, Activity
} from 'lucide-react';
import { runSimulation, getSimulationStatus, importDEMFromGEE, getIndianDams } from '../services/simulationService';
import { useNavigate, Link } from 'react-router-dom';
import SimulationAnalyticsSuite from '../components/analytics/SimulationAnalyticsSuite';
import GISExportMenu from '../components/map/GISExportMenu';
import ResultProvenanceBadge from '../components/analytics/ResultProvenanceBadge';

export default function Simulation() {
  const [damsList, setDamsList] = useState([]);
  const [selectedDamId, setSelectedDamId] = useState('hidkal');
  const [areaMode, setAreaMode] = useState('preset'); // 'preset' or 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');
  
  const [status, setStatus] = useState('idle'); // idle, submitting, running, complete, failed
  const [jobId, setJobId] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isImportingDEM, setIsImportingDEM] = useState(false);
  const [demImportSuccess, setDemImportSuccess] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dam_id: 'hidkal',
    dam_name: 'Hidkal Dam (Raja Lakhamagouda)',
    dam_lat: 16.1558,
    dam_lon: 74.6403,
    breach_width: 120,
    reservoir_volume: 1445000000,
    particle_spacing: 1.0,
    dem_source: 'SRTM',
    solver: 'dualsphysics'
  });

  // Load Indian Dams Catalog on mount
  useEffect(() => {
    getIndianDams().then(dams => {
      if (dams && dams.length > 0) {
        setDamsList(dams);
        const defaultDam = dams[0];
        setSelectedDamId(defaultDam.id);
        const initialForm = {
          ...formData,
          dam_id: defaultDam.id,
          dam_name: defaultDam.name,
          dam_lat: defaultDam.lat,
          dam_lon: defaultDam.lon,
          breach_width: defaultDam.default_breach_width_m || 100,
          reservoir_volume: defaultDam.capacity_m3 || 500000000
        };
        setFormData(initialForm);
        executeSimulation(initialForm);
      }
    });
  }, []);

  const executeSimulation = async (dataToRun) => {
    setStatus('submitting');
    setErrorMsg(null);
    
    try {
      const res = await runSimulation(dataToRun || formData);
      setSimResult(res);
      const generatedJobId = res.job_id || res.jobId || `SCN-${Date.now()}`;
      setJobId(generatedJobId);
      setStatus('running');

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await getSimulationStatus(generatedJobId);
          if (statusRes.status === 'done' || statusRes.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setStatus('complete');
          } else if (statusRes.status === 'failed' || statusRes.status === 'FAILED') {
            clearInterval(pollInterval);
            setStatus('failed');
            setErrorMsg(statusRes.error || "Simulation failed during execution.");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 1000);
    } catch (err) {
      console.error("Submission error:", err);
      setStatus('failed');
      setErrorMsg(err.message || "Failed to submit simulation to backend.");
    }
  };

  // Handle dam selection from preset grid & auto-run
  const handleSelectDam = (dam) => {
    setSelectedDamId(dam.id);
    setDemImportSuccess(null);
    const updated = {
      ...formData,
      dam_id: dam.id,
      dam_name: dam.name,
      dam_lat: dam.lat,
      dam_lon: dam.lon,
      breach_width: dam.default_breach_width_m || 100,
      reservoir_volume: dam.capacity_m3 || 500000000
    };
    setFormData(updated);
    executeSimulation(updated);
  };

  const handleChange = (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleImportGEE = async () => {
    setIsImportingDEM(true);
    setDemImportSuccess(null);
    try {
      const res = await importDEMFromGEE({
        lat: formData.dam_lat,
        lon: formData.dam_lon,
        buffer_km: 8.0,
        dataset: formData.dem_source
      });
      setDemImportSuccess(res.message || `Elevation DEM mesh successfully imported from Google Earth Engine (${formData.dem_source})!`);
    } catch (err) {
      console.error("GEE import failed:", err);
      setErrorMsg("Failed to fetch DEM from Google Earth Engine. Please check coordinates.");
    } finally {
      setIsImportingDEM(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSimulation(formData);
  };

  // Filter dams by search and state
  const statesList = ['ALL', ...new Set(damsList.map(d => d.state.split('/')[0].trim()))];
  const filteredDams = damsList.filter(dam => {
    const matchesSearch = dam.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dam.river.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dam.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedStateFilter === 'ALL' || dam.state.includes(selectedStateFilter);
    return matchesSearch && matchesState;
  });

  const selectedDamObj = damsList.find(d => d.id === selectedDamId) || {
    name: formData.dam_name,
    state: "Custom Coordinate Domain",
    river: "Custom Hydrologic Basin",
    lat: formData.dam_lat,
    lon: formData.dam_lon,
    capacity_m3: formData.reservoir_volume,
    downstream_villages: ["Downstream Reach 1", "Downstream Reach 2"]
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto pb-24 space-y-7">
      {/* Solver Navigation Hub Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0a0f1d] border border-cyan-500/20 text-xs font-semibold shadow-lg">
        <span className="text-slate-500 uppercase tracking-widest text-[10px] px-3 font-bold">Solver Suites:</span>
        <span className="bg-cyan-500 text-slate-950 px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
          <Play size={13} /> Unified Core Dispatcher
        </span>
        <Link 
          to="/dualsphysics" 
          className="text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
        >
          <Waves size={13} className="text-cyan-400" /> DualSPHysics (3D SPH)
        </Link>
        <Link 
          to="/delft3d" 
          className="text-slate-400 hover:text-teal-300 hover:bg-slate-800/60 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
        >
          <Globe size={13} className="text-teal-400" /> Delft3D-FLOW (2D SWE)
        </Link>
        <Link 
          to="/solver-comparison" 
          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/20 transition-all flex items-center gap-1.5 ml-auto"
        >
          <Activity size={13} /> Multi-Parameter Comparison
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Hydrodynamic Solver Hub
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">DualSPHysics GPU + GEE v5.2</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-100">
            Dam-Break Simulation Core
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Choose a target dam or custom geographic area across India, auto-import Google Earth Engine elevation models, and solve Navier-Stokes hydrodynamic equations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="glass-card px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs border border-emerald-500/30 text-emerald-400 font-mono">
            <Cpu size={14} /> GPU Acceleration: ON
          </div>
        </div>
      </div>

      {/* STEP 1: Area & Dam Selector Section */}
      <div className="glass-card rounded-2xl overflow-hidden border border-cyan-500/25 shadow-2xl">
        <div className="p-4 px-6 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-950/40 via-[#0d1527] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm font-bold text-cyan-300">
            <MapPin size={18} className="text-cyan-400" />
            <span>Step 1: Select Simulation Target Area / Dam</span>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center bg-[#070c18] p-1 rounded-xl border border-cyan-500/20 text-xs">
            <button
              type="button"
              onClick={() => setAreaMode('preset')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                areaMode === 'preset'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Indian Dams Catalog ({damsList.length})
            </button>
            <button
              type="button"
              onClick={() => setAreaMode('custom')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                areaMode === 'custom'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Coordinates / Area
            </button>
          </div>
        </div>

        {areaMode === 'preset' ? (
          <div className="p-6 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by dam name, river, or state (e.g., Tehri, Mullaperiyar, Narmada)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#070c18] border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={14} className="text-cyan-400 shrink-0" />
                <select
                  value={selectedStateFilter}
                  onChange={(e) => setSelectedStateFilter(e.target.value)}
                  className="bg-[#070c18] border border-cyan-500/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {statesList.map(st => (
                    <option key={st} value={st} className="bg-[#0a0f1d]">{st === 'ALL' ? 'All States' : st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid of Dam Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredDams.map(dam => {
                const isSelected = selectedDamId === dam.id;
                return (
                  <div
                    key={dam.id}
                    onClick={() => handleSelectDam(dam)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950/70 to-[#0a1224] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                        : 'bg-[#070c18]/80 hover:bg-[#0d1527] border-cyan-500/15 hover:border-cyan-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-xs text-slate-100 leading-snug">
                          {dam.name}
                        </h4>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-medium mb-2">
                        <Compass size={12} />
                        <span>{dam.river}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{dam.state}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {dam.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-cyan-500/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <div>
                        <span>Lat/Lon: </span>
                        <strong className="text-slate-200">{dam.lat.toFixed(2)}°N, {dam.lon.toFixed(2)}°E</strong>
                      </div>
                      <div className="text-cyan-300 font-semibold">
                        {(dam.capacity_m3 / 1000000).toFixed(0)}M m³
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Custom Area Coordinates Mode */
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-3">
              <Compass size={20} className="text-cyan-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Custom Geographic Domain Mode</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enter any latitude and longitude in India or worldwide. The system will slice a 30m DEM mesh via Google Earth Engine and execute hydrodynamic modeling.
                </p>
              </div>
            </div>

            {/* Quick Regional Presets */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Regional Coordinates Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Western Ghats (Belagavi)", lat: 16.1558, lon: 74.6403, width: 120, vol: 1445000000 },
                  { name: "Kerala Highlands (Periyar)", lat: 9.5297, lon: 77.1419, width: 90, vol: 443000000 },
                  { name: "Himalayan Basin (Tehri)", lat: 30.3776, lon: 78.4803, width: 180, vol: 3540000000 },
                  { name: "Narmada Valley (Gujarat)", lat: 21.8317, lon: 73.7483, width: 250, vol: 9500000000 },
                  { name: "Mahanadi Basin (Hirakud)", lat: 21.5700, lon: 83.8700, width: 300, vol: 5890000000 },
                  { name: "Krishna Basin (Nagarjuna)", lat: 16.5744, lon: 79.3144, width: 220, vol: 11400000000 }
                ].map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setSelectedDamId('custom');
                      setFormData(prev => ({
                        ...prev,
                        dam_id: 'custom',
                        dam_name: p.name,
                        dam_lat: p.lat,
                        dam_lon: p.lon,
                        breach_width: p.width,
                        reservoir_volume: p.vol
                      }));
                    }}
                    className="text-xs bg-[#070c18] hover:bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 px-3 py-1.5 rounded-lg text-slate-300 font-medium transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Custom Location / Dam Name</label>
                <input
                  type="text"
                  name="dam_name"
                  value={formData.dam_name}
                  onChange={handleChange}
                  className="w-full bg-[#070c18] border border-cyan-500/25 rounded-xl p-2.5 text-xs text-slate-100 font-medium outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Selected Area Banner */}
        <div className="p-4 px-6 bg-[#060a14] border-t border-cyan-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-300 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <div className="font-bold text-slate-100 flex items-center gap-2">
                <span>Active Target: {formData.dam_name}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  {formData.dam_lat.toFixed(4)}°N, {formData.dam_lon.toFixed(4)}°E
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Reservoir: {(formData.reservoir_volume / 1000000).toLocaleString()} Million m³ • Breach Width: {formData.breach_width}m
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleImportGEE}
            disabled={isImportingDEM}
            className="glow-cyan-btn disabled:opacity-50 text-[#070c18] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            {isImportingDEM ? (
              <><Loader2 size={13} className="animate-spin" /> Fetching GEE DEM...</>
            ) : (
              <><Database size={13} /> Auto-Import GEE Elevation Mesh</>
            )}
          </button>
        </div>
      </div>

      {demImportSuccess && (
        <div className="glass-card border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 p-4 rounded-xl flex items-center gap-2.5 text-xs font-mono shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{demImportSuccess}</span>
        </div>
      )}

      {/* Error Banner */}
      {status === 'failed' && errorMsg && (
        <div className="glass-card border border-rose-500/50 bg-rose-500/10 text-rose-200 p-5 rounded-2xl flex items-start gap-3 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
          <AlertCircle className="shrink-0 text-rose-400 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-rose-300 mb-1">Simulation Execution Error</h4>
            <pre className="text-xs font-mono bg-slate-950/60 p-3 rounded-xl border border-rose-500/20 max-h-40 overflow-y-auto">{errorMsg}</pre>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-3 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3.5 py-1.5 rounded-lg transition-colors font-medium"
            >
              Reset Parameters & Retry
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Parameters Configuration Form */}
      <div className="glass-card rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl">
        <div className="p-4 px-6 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-950/30 via-[#0d1527] to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
            <Sliders size={16} className="text-cyan-400" />
            <span>Step 2: Hydrodynamic & Solver Parameters</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">COORDINATE SYSTEM: WGS84</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dam Lat */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex justify-between">
                <span>Dam Latitude</span>
                <span className="text-cyan-400 font-mono">°N</span>
              </label>
              <input 
                type="number" 
                step="0.0001" 
                name="dam_lat" 
                value={formData.dam_lat} 
                onChange={handleChange} 
                className="w-full bg-[#0d1527] border border-cyan-500/25 rounded-xl p-3 text-slate-100 font-mono text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all" 
                required 
              />
            </div>

            {/* Dam Lon */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex justify-between">
                <span>Dam Longitude</span>
                <span className="text-cyan-400 font-mono">°E</span>
              </label>
              <input 
                type="number" 
                step="0.0001" 
                name="dam_lon" 
                value={formData.dam_lon} 
                onChange={handleChange} 
                className="w-full bg-[#0d1527] border border-cyan-500/25 rounded-xl p-3 text-slate-100 font-mono text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all" 
                required 
              />
            </div>

            {/* Breach Width */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex justify-between">
                <span>Breach Opening Width</span>
                <span className="text-cyan-400 font-mono">Meters (m)</span>
              </label>
              <input 
                type="number" 
                name="breach_width" 
                value={formData.breach_width} 
                onChange={handleChange} 
                className="w-full bg-[#0d1527] border border-cyan-500/25 rounded-xl p-3 text-slate-100 font-mono text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all" 
                required 
              />
            </div>

            {/* Reservoir Volume */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex justify-between">
                <span>Total Reservoir Capacity</span>
                <span className="text-cyan-400 font-mono">m³</span>
              </label>
              <input 
                type="number" 
                name="reservoir_volume" 
                value={formData.reservoir_volume} 
                onChange={handleChange} 
                className="w-full bg-[#0d1527] border border-cyan-500/25 rounded-xl p-3 text-slate-100 font-mono text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all" 
                required 
              />
            </div>

            {/* DEM Source Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex justify-between">
                <span>GEE Terrain Elevation Source</span>
                <span className="text-cyan-400 font-mono">30m DEM</span>
              </label>
              <select 
                name="dem_source"
                value={formData.dem_source}
                onChange={handleChange}
                className="w-full bg-[#0d1527] border border-cyan-500/25 rounded-xl p-3 text-slate-100 font-medium text-sm focus:border-cyan-400 outline-none"
              >
                <option value="SRTM">NASA SRTM 30m Global DEM (USGS/SRTMGL1_003)</option>
                <option value="COPERNICUS">Copernicus GLO-30 Digital Elevation (COPERNICUS/DEM/GLO30)</option>
                <option value="NASADEM">NASADEM Merged Global DEM</option>
              </select>
            </div>

            {/* Solver Architecture Radio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Computational Backend
              </label>
              <div className="glass-card p-3 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">DualSPHysics CUDA SPH</div>
                    <div className="text-[10px] text-cyan-400 font-mono">GPU-accelerated Navier-Stokes solver</div>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
              </div>
            </div>
          </div>

          {/* Action Submission */}
          <div className="pt-4 border-t border-cyan-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Selected: <strong className="text-cyan-300">{formData.dam_name}</strong> • Runtime: <strong className="text-cyan-300 font-mono">~3-5 seconds</strong>
            </div>

            <button 
              type="submit" 
              disabled={status === 'submitting' || status === 'running'}
              className="glow-cyan-btn disabled:opacity-50 disabled:cursor-not-allowed text-[#070c18] px-8 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            >
              {status === 'idle' || status === 'failed' ? (
                <><Play size={17} /> Launch Simulation Solver</>
              ) : status === 'complete' ? (
                <><CheckCircle2 size={17} /> Simulation Complete</>
              ) : (
                <><Loader2 size={17} className="animate-spin" /> Solving SPH Equations...</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Multi-stage Status HUD Tracker */}
      {(status === 'running' || status === 'complete' || status === 'submitting') && (
        <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/15 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-300">
                <Database size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Active Simulation Dispatch</div>
                <div className="font-mono text-sm font-bold text-cyan-300">
                  {jobId || 'Allocating Worker...'} • {formData.dam_name}
                </div>
              </div>
            </div>

            {status === 'complete' && (
              <button 
                onClick={() => navigate(`/dashboard?jobId=${jobId}`)} 
                className="glow-cyan-btn text-[#070c18] px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                <span>View Results on Map</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
          
          {/* Stepper Pipeline */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {/* Step 1 */}
            <div className="relative flex items-center gap-3.5">
              <div className={`w-5 h-5 -ml-6 rounded-full flex items-center justify-center ring-4 ring-[#0a0f1d] z-10 ${
                status !== 'idle' ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800'
              }`}>
                <CheckCircle2 size={12} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Domain Geometry & GEE Terrain Slicing</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Coordinates: {formData.dam_lat.toFixed(4)}°N, {formData.dam_lon.toFixed(4)}°E (30m mesh)
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center gap-3.5">
              <div className={`w-5 h-5 -ml-6 rounded-full flex items-center justify-center ring-4 ring-[#0a0f1d] z-10 ${
                status === 'running' ? 'bg-cyan-400 text-slate-950 animate-pulse' : status === 'complete' ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800'
              }`}>
                {status === 'running' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">DualSPHysics GPU Particle Solver</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Hydrodynamic wave propagation with breach width {formData.breach_width}m
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center gap-3.5">
              <div className={`w-5 h-5 -ml-6 rounded-full flex items-center justify-center ring-4 ring-[#0a0f1d] z-10 ${
                status === 'complete' ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800'
              }`}>
                {status === 'complete' ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">GeoJSON Inundation & Multi-Tier Hazard Contours</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {status === 'complete' ? 'GIS Polygon generated and ready for map visualization' : 'Awaiting solver convergence...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Spectrum Statistical Analytics & Tabulation Suite */}
      {simResult && (
        <div className="pt-6 border-t border-cyan-500/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Activity size={11} /> Unified Simulation Analytics
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">Statistical Ledger, Histograms & Hydrographs</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                Simulated Parameters Tabulation & Statistical Suite
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs text-slate-400 font-mono">
                Status: <span className={simResult?.provenance?.mode === 'LIVE_SOLVER' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {status === 'running' 
                    ? 'COMPUTING...' 
                    : simResult?.provenance?.mode === 'LIVE_SOLVER' 
                      ? 'LIVE SOLVER CONVERGED' 
                      : 'APPROXIMATION GENERATED'}
                </span>
              </div>
              <GISExportMenu 
                jobId={jobId || `DSPH-${formData.dam_id}`}
                floodGeojson={simResult.flood_geojson}
                damName={formData.dam_name}
                provenance={simResult.provenance}
              />
            </div>
          </div>

          {/* Result Provenance Notice Banner */}
          <ResultProvenanceBadge 
            provenance={simResult.provenance} 
            variant="banner" 
          />

          <SimulationAnalyticsSuite 
            statistics={simResult.statistics}
            floodGeojson={simResult.flood_geojson}
            solverName={formData.solver === 'dualsphysics' ? 'DualSPHysics 3D GPU SPH' : 'Delft3D-FLOW 2D SWE'}
            damName={formData.dam_name}
            damLat={formData.dam_lat}
            damLon={formData.dam_lon}
            jobId={jobId}
            provenance={simResult.provenance}
          />
        </div>
      )}
    </div>
  );
}
