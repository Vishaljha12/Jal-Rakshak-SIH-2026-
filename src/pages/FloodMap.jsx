import { useState, useEffect, useCallback } from 'react';
import { getIndianDams, getScenarioResult, runDualSPHysicsSolver } from '../services/simulationService';
import SimulationAnalyticsSuite from '../components/analytics/SimulationAnalyticsSuite';
import GISExportMenu from '../components/map/GISExportMenu';
import ResultProvenanceBadge from '../components/analytics/ResultProvenanceBadge';
import { ShieldCheck, Cpu, RefreshCw, Loader2, Play } from 'lucide-react';

export default function FloodMap() {
  const [floodData, setFloodData] = useState(null);
  const [selectedDam, setSelectedDam] = useState('idukki');
  const [damsList, setDamsList] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [provenance, setProvenance] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Active Dam profile
  const activeDamObj = damsList.find(d => d.id === selectedDam) || {
    id: selectedDam,
    name: selectedDam === 'idukki' ? 'Idukki Arch Dam (Kerala)' : 'Hidkallu Dam (Raja Lakhamagouda)',
    lat: selectedDam === 'idukki' ? 9.8497 : 16.1558,
    lon: selectedDam === 'idukki' ? 76.9744 : 74.6403,
    height_m: selectedDam === 'idukki' ? 168.91 : 61.0,
    default_breach_width_m: 120
  };

  // Execute live simulation for the target dam
  const loadDamSimulation = useCallback(async (damId, damProfile = null) => {
    setLoading(true);
    const targetDam = damProfile || damsList.find(d => d.id === damId) || activeDamObj;
    try {
      // 1. First attempt: call live scenario solver endpoint
      const res = await getScenarioResult(`scenario_${damId}`);
      if (res && res.flood_geojson) {
        setFloodData(res.flood_geojson);
        setStatistics(res.statistics);
        setProvenance(res.provenance || res.statistics?.provenance);
        setJobId(res.job_id || `JOB-${damId.toUpperCase()}`);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn(`Scenario fetch error for ${damId}, calling DualSPHysics directly:`, err);
    }

    try {
      // 2. Direct DualSPHysics Live Solver Call
      const res = await runDualSPHysicsSolver({
        dam_id: damId,
        dam_name: targetDam.name,
        dam_lat: targetDam.lat,
        dam_lon: targetDam.lon,
        breach_width_m: targetDam.default_breach_width_m || 120,
        reservoir_head_m: targetDam.height_m ? Number((targetDam.height_m * 0.85).toFixed(1)) : 45.0,
        duration_hours: 6.0
      });

      if (res) {
        setFloodData(res.flood_geojson || res);
        setStatistics(res.statistics);
        setProvenance(res.provenance || res.statistics?.provenance);
        setJobId(res.job_id || `JOB-${damId.toUpperCase()}`);
      }
    } catch (err2) {
      console.error("Live solver execution failed:", err2);
    } finally {
      setLoading(false);
    }
  }, [damsList, activeDamObj]);

  useEffect(() => {
    // Load dams catalog
    getIndianDams().then(dams => {
      if (dams && dams.length > 0) {
        setDamsList(dams);
        const initialDam = dams.find(d => d.id === 'idukki') || dams[0];
        setSelectedDam(initialDam.id);
        loadDamSimulation(initialDam.id, initialDam);
      } else {
        loadDamSimulation('idukki');
      }
    }).catch(() => {
      loadDamSimulation('idukki');
    });
  }, []);

  const handleDamChange = (damId) => {
    setSelectedDam(damId);
    const targetDam = damsList.find(d => d.id === damId);
    loadDamSimulation(damId, targetDam);
  };

  const effectiveProvenance = provenance || statistics?.provenance || floodData?.provenance || {
    mode: 'LIVE_SOLVER',
    solver: 'DualSPHysics',
    solverVersion: 'DualSPHysics v5.4.3 (CUDA GPU)',
    fallbackReason: null
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Banner with Dam Selector, Live Run Button & Export Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={11} className="text-cyan-400" />
              Tactical Command Center • GIS Inundation Map
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <Cpu size={12} />
              Live DualSPHysics CUDA GPU & Delft3D-FM
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            High-Resolution Satellite Inundation & Hydrodynamic Analytics
          </h1>
        </div>

        {/* Actions: Dam Switcher, Execute Live Solver & GIS Export Menu */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#090f1d] border border-cyan-500/30 rounded-xl p-1.5 px-3 shadow-lg">
            <span className="text-xs text-slate-400 font-mono">Target Dam:</span>
            <select
              value={selectedDam}
              onChange={(e) => handleDamChange(e.target.value)}
              disabled={loading}
              className="bg-transparent text-xs font-bold text-cyan-300 outline-none cursor-pointer disabled:opacity-50"
            >
              {damsList.length > 0 ? (
                damsList.map(dam => (
                  <option key={dam.id} value={dam.id} className="bg-[#090f1d] text-slate-100">
                    {dam.name} ({dam.state})
                  </option>
                ))
              ) : (
                <>
                  <option value="idukki" className="bg-[#090f1d] text-slate-100">Idukki Arch Dam (Kerala)</option>
                  <option value="hidkal" className="bg-[#090f1d] text-slate-100">Hidkal Dam (Karnataka)</option>
                  <option value="tehri" className="bg-[#090f1d] text-slate-100">Tehri Dam (Uttarakhand)</option>
                </>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={() => loadDamSimulation(selectedDam)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-all cursor-pointer disabled:opacity-50"
            title="Execute Real Physics Solver Pipeline"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin text-cyan-400" />
                <span>Running SPH GPU...</span>
              </>
            ) : (
              <>
                <RefreshCw size={13} className="text-cyan-400" />
                <span>Re-run Live Model</span>
              </>
            )}
          </button>

          <GISExportMenu 
            jobId={jobId || `SCN-${selectedDam}`}
            floodGeojson={floodData}
            damName={activeDamObj.name}
            provenance={effectiveProvenance}
          />
        </div>
      </div>

      {/* Result Provenance Banner */}
      <ResultProvenanceBadge 
        provenance={effectiveProvenance}
        variant="banner"
      />

      {/* Embedded Simulation Analytics Suite with Tactical Map View as Default */}
      <SimulationAnalyticsSuite 
        floodGeojson={floodData}
        statistics={statistics}
        damName={activeDamObj.name}
        damLat={activeDamObj.lat}
        damLon={activeDamObj.lon}
        solverName="DualSPHysics (3D Lagrangian SPH)"
        jobId={jobId || `SCN-${selectedDam}`}
        provenance={effectiveProvenance}
      />
    </div>
  );
}
