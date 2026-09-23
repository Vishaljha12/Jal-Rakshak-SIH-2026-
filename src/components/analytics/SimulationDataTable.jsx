import { useState, useMemo } from 'react';
import { 
  Table, Search, ArrowUpDown, ArrowUp, ArrowDown, Download, Copy, Check, 
  Filter, Info, ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2, 
  Layers, MapPin, Waves, Gauge, Database, Compass
} from 'lucide-react';
import ResultProvenanceBadge from './ResultProvenanceBadge';
import { exportTableToCSV, copyDataToClipboard, enrichStatistics } from '../../services/simulationService';

export default function SimulationDataTable({ statistics, solverName = 'dualsphysics', damName = 'Hidkal Dam' }) {
  const [activeTab, setActiveTab] = useState('parameters'); // 'parameters', 'reaches', 'tiers'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedHazard, setSelectedHazard] = useState('ALL');
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeFormulaTooltip, setActiveFormulaTooltip] = useState(null);

  const enrichedStats = useMemo(() => {
    return enrichStatistics(statistics, solverName, { dam_name: damName });
  }, [statistics, solverName, damName]);

  const parameterRows = enrichedStats.parameter_table || [];
  const reachRows = enrichedStats.reaches_table || [];
  const tierRows = enrichedStats.tier_breakdown || [];

  // Filter categories
  const categories = useMemo(() => {
    return ['ALL', ...new Set(parameterRows.map(p => p.category))];
  }, [parameterRows]);

  // Filtered and sorted parameters
  const filteredParameters = useMemo(() => {
    return parameterRows.filter(param => {
      const matchesSearch = 
        param.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        param.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (param.formula && param.formula.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || param.category === selectedCategory;
      const matchesHazard = selectedHazard === 'ALL' || param.hazard_level === selectedHazard;
      return matchesSearch && matchesCategory && matchesHazard;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toString().toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA - valB) : (valB - valA);
    });
  }, [parameterRows, searchQuery, selectedCategory, selectedHazard, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    if (activeTab === 'parameters') {
      const headers = {
        name: "Parameter Name",
        symbol: "Symbol",
        category: "Category",
        value: "Simulated Value",
        unit: "Unit",
        min: "Minimum",
        mean: "Mean",
        median: "Median",
        max: "Maximum",
        std_dev: "Standard Deviation (σ)",
        p95: "95th Percentile (P95)",
        hazard_level: "Hazard Level",
        threshold: "Threshold Basis",
        formula: "Mathematical Formulation"
      };
      exportTableToCSV(filteredParameters, headers, `${damName || 'dam'}_simulated_parameters.csv`);
    } else if (activeTab === 'reaches') {
      const headers = {
        name: "Downstream Reach",
        distance_km: "Chainage Distance (km)",
        arrival_time_min: "Wave Arrival (min)",
        peak_depth_m: "Peak Depth (m)",
        peak_velocity_ms: "Peak Velocity (m/s)",
        momentum_flux_kn_m: "Momentum Flux (kN/m)",
        exposed_pop: "Exposed Census Population",
        warning_status: "Evacuation Warning Status"
      };
      exportTableToCSV(reachRows, headers, `${damName || 'dam'}_reach_impacts.csv`);
    } else {
      const headers = {
        tier: "Hazard Tier",
        area_km2: "Footprint Area (km²)",
        percentage: "Domain Percentage (%)",
        volume_million_m3: "Volume (Million m³)",
        velocity_range: "Velocity Envelope",
        hazard: "Hazard Consequence"
      };
      exportTableToCSV(tierRows, headers, `${damName || 'dam'}_depth_tiers.csv`);
    }
  };

  const handleCopyJSON = async () => {
    const dataToCopy = 
      activeTab === 'parameters' ? filteredParameters :
      activeTab === 'reaches' ? reachRows : tierRows;
    const ok = await copyDataToClipboard(dataToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getHazardBadge = (level) => {
    switch (level) {
      case 'Catastrophic':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
            <ShieldAlert size={10} className="text-rose-400" />
            Catastrophic
          </span>
        );
      case 'Danger':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50">
            <AlertTriangle size={10} className="text-amber-400" />
            Danger
          </span>
        );
      case 'Advisory':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/50">
            <AlertCircle size={10} className="text-cyan-400" />
            Advisory
          </span>
        );
      case 'Safe':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
            <CheckCircle2 size={10} className="text-emerald-400" />
            Normal / Safe
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-cyan-500/25 shadow-2xl space-y-0">
      {/* Top Header & Tab Controls */}
      <div className="p-4 px-6 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-950/40 via-[#0a1224] to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Table size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Statistical Parameter Ledger & Tabulation
              </h3>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                {solverName || 'Hydrodynamic Core'}
              </span>
              <ResultProvenanceBadge provenance={enrichedStats?.provenance} solver={solverName} variant="chart-tag" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Exact mathematical moments, confidence quantiles, and hazard threshold analysis for all simulated parameters.
            </p>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center bg-[#070c18] p-1 rounded-xl border border-cyan-500/20 text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('parameters')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'parameters'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge size={13} />
            <span>Parameters ({parameterRows.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reaches')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reaches'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin size={13} />
            <span>Reaches ({reachRows.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tiers')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tiers'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={13} />
            <span>Depth Tiers ({tierRows.length})</span>
          </button>
        </div>
      </div>

      {/* Action Toolbar: Search, Filters, CSV/JSON Export */}
      <div className="p-4 px-6 bg-[#060a14] border-b border-cyan-500/15 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search parameter, symbol, formula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090f1d] border border-cyan-500/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Category Filter */}
          {activeTab === 'parameters' && (
            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-cyan-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#090f1d] border border-cyan-500/20 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#070c18]">{cat === 'ALL' ? 'All Domains' : cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Hazard Filter */}
          {activeTab === 'parameters' && (
            <select
              value={selectedHazard}
              onChange={(e) => setSelectedHazard(e.target.value)}
              className="bg-[#090f1d] border border-cyan-500/20 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL" className="bg-[#070c18]">All Hazard Levels</option>
              <option value="Catastrophic" className="bg-[#070c18]">Catastrophic</option>
              <option value="Danger" className="bg-[#070c18]">Danger</option>
              <option value="Advisory" className="bg-[#070c18]">Advisory</option>
              <option value="Safe" className="bg-[#070c18]">Normal / Safe</option>
            </select>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJSON}
            className="px-3 py-1.5 rounded-xl border border-cyan-500/20 hover:border-cyan-400/40 bg-[#090f1d] text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            title="Copy as formatted JSON"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="glow-cyan-btn text-[#070c18] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            title="Download CSV table"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      {activeTab === 'parameters' && (
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead className="bg-[#080d1a] border-b border-cyan-500/20 text-[11px] font-mono uppercase tracking-wider text-slate-400 sticky top-0 z-10">
              <tr>
                <th className="p-3.5 pl-6 cursor-pointer hover:text-cyan-300" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    <span>Parameter & Symbol</span>
                    <ArrowUpDown size={12} className="opacity-60" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:text-cyan-300" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1.5">
                    <span>Domain</span>
                    <ArrowUpDown size={12} className="opacity-60" />
                  </div>
                </th>
                <th className="p-3.5 text-right cursor-pointer hover:text-cyan-300" onClick={() => handleSort('value')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Simulated Value</span>
                    <ArrowUpDown size={12} className="opacity-60" />
                  </div>
                </th>
                <th className="p-3.5 text-right">Min</th>
                <th className="p-3.5 text-right">Mean (μ)</th>
                <th className="p-3.5 text-right">Median</th>
                <th className="p-3.5 text-right">Max</th>
                <th className="p-3.5 text-right">Std Dev (σ)</th>
                <th className="p-3.5 text-right font-bold text-cyan-300">P95</th>
                <th className="p-3.5">Hazard Status</th>
                <th className="p-3.5 pr-6">Formulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10 font-mono text-[11px]">
              {filteredParameters.map((param) => {
                const isTooltipOpen = activeFormulaTooltip === param.id;
                return (
                  <tr key={param.id} className="hover:bg-cyan-500/5 transition-colors group">
                    {/* Name & Symbol */}
                    <td className="p-3.5 pl-6 font-sans">
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>{param.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-1.5 py-0.2 rounded font-semibold">
                          {param.symbol}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5 font-sans">
                      <span className="text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded font-medium">
                        {param.category}
                      </span>
                    </td>

                    {/* Simulated Value */}
                    <td className="p-3.5 text-right font-bold text-cyan-300 text-xs">
                      {param.value.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{param.unit}</span>
                    </td>

                    {/* Min */}
                    <td className="p-3.5 text-right text-slate-400">
                      {param.min?.toLocaleString()}
                    </td>

                    {/* Mean */}
                    <td className="p-3.5 text-right text-slate-300 font-semibold">
                      {param.mean?.toLocaleString()}
                    </td>

                    {/* Median */}
                    <td className="p-3.5 text-right text-slate-400">
                      {param.median?.toLocaleString()}
                    </td>

                    {/* Max */}
                    <td className="p-3.5 text-right text-slate-200 font-bold">
                      {param.max?.toLocaleString()}
                    </td>

                    {/* Std Dev */}
                    <td className="p-3.5 text-right text-slate-400">
                      ±{param.std_dev?.toLocaleString()}
                    </td>

                    {/* P95 */}
                    <td className="p-3.5 text-right font-bold text-emerald-400">
                      {param.p95?.toLocaleString()}
                    </td>

                    {/* Hazard Status */}
                    <td className="p-3.5 font-sans">
                      {getHazardBadge(param.hazard_level)}
                    </td>

                    {/* Formula */}
                    <td className="p-3.5 pr-6 font-sans relative">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span className="truncate max-w-[150px] font-mono text-slate-300" title={param.formula}>
                          {param.formula || 'Empirical'}
                        </span>
                        {param.threshold && (
                          <button
                            type="button"
                            onClick={() => setActiveFormulaTooltip(isTooltipOpen ? null : param.id)}
                            className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5 cursor-pointer"
                            title="View engineering safety threshold"
                          >
                            <Info size={12} />
                          </button>
                        )}
                      </div>

                      {isTooltipOpen && (
                        <div className="absolute right-6 top-8 z-30 w-64 bg-[#0a1224] border border-cyan-500/40 rounded-xl p-3 shadow-2xl text-[10px] space-y-1">
                          <div className="font-bold text-cyan-300">Engineering Safety Threshold:</div>
                          <div className="text-slate-200 font-mono">{param.threshold}</div>
                          <div className="text-slate-400 pt-1 border-t border-cyan-500/20">
                            Mathematical Formulation: <strong className="text-slate-300 font-mono">{param.formula}</strong>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reaches Downstream Table */}
      {activeTab === 'reaches' && (
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead className="bg-[#080d1a] border-b border-cyan-500/20 text-[11px] font-mono uppercase tracking-wider text-slate-400 sticky top-0 z-10">
              <tr>
                <th className="p-3.5 pl-6">Downstream Settlement Reach</th>
                <th className="p-3.5 text-right">Distance (km)</th>
                <th className="p-3.5 text-right">Wave Arrival Time</th>
                <th className="p-3.5 text-right">Peak Depth (m)</th>
                <th className="p-3.5 text-right">Peak Velocity (m/s)</th>
                <th className="p-3.5 text-right">Momentum Flux (kN/m)</th>
                <th className="p-3.5 text-right">Census Exposed Population</th>
                <th className="p-3.5 pr-6">Warning Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10 font-mono text-[11px]">
              {reachRows.map((reach) => (
                <tr key={reach.reach_id} className="hover:bg-cyan-500/5 transition-colors">
                  <td className="p-3.5 pl-6 font-sans">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: reach.color }}></span>
                      <span>{reach.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-right text-slate-300 font-semibold">
                    {reach.distance_km} km
                  </td>
                  <td className="p-3.5 text-right font-bold text-amber-300">
                    {reach.arrival_time_min} mins
                  </td>
                  <td className="p-3.5 text-right font-bold text-cyan-300">
                    {reach.peak_depth_m} m
                  </td>
                  <td className="p-3.5 text-right text-emerald-400 font-semibold">
                    {reach.peak_velocity_ms} m/s
                  </td>
                  <td className="p-3.5 text-right text-slate-200">
                    {reach.momentum_flux_kn_m} kN/m
                  </td>
                  <td className="p-3.5 text-right font-bold text-rose-400">
                    {reach.exposed_pop.toLocaleString()}
                  </td>
                  <td className="p-3.5 pr-6 font-sans">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono" style={{
                      backgroundColor: `${reach.color}22`,
                      color: reach.color,
                      border: `1px solid ${reach.color}66`
                    }}>
                      {reach.warning_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Depth Tiers Table */}
      {activeTab === 'tiers' && (
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead className="bg-[#080d1a] border-b border-cyan-500/20 text-[11px] font-mono uppercase tracking-wider text-slate-400 sticky top-0 z-10">
              <tr>
                <th className="p-3.5 pl-6">Hydrodynamic Inundation Tier</th>
                <th className="p-3.5 text-right">Flooded Footprint Area</th>
                <th className="p-3.5 text-right">% of Inundation</th>
                <th className="p-3.5 text-right">Retained Water Volume</th>
                <th className="p-3.5">Flow Velocity Range</th>
                <th className="p-3.5 pr-6">Structural & HADR Consequence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10 font-mono text-[11px]">
              {tierRows.map((tier) => (
                <tr key={tier.tier_key} className="hover:bg-cyan-500/5 transition-colors">
                  <td className="p-3.5 pl-6 font-sans">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-md shadow-sm" style={{ backgroundColor: tier.color }}></span>
                      <span>{tier.tier}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-right font-bold text-cyan-300">
                    {tier.area_km2} km²
                  </td>
                  <td className="p-3.5 text-right text-slate-300 font-semibold">
                    {tier.percentage}%
                  </td>
                  <td className="p-3.5 text-right text-emerald-400 font-bold">
                    {tier.volume_million_m3} Million m³
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {tier.velocity_range}
                  </td>
                  <td className="p-3.5 pr-6 font-sans text-slate-300">
                    {tier.hazard}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer Summary Ribbon */}
      <div className="p-3 px-6 bg-[#040810] border-t border-cyan-500/15 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span>Active Dam Domain: <strong className="text-slate-200 font-sans">{damName || 'Target Dam'}</strong></span>
          <span>•</span>
          <span>Filtered Parameters: <strong className="text-cyan-300">{filteredParameters.length}</strong> of {parameterRows.length}</span>
        </div>
        <div className="text-slate-500 text-[10px]">
          Confidence Interval: 95% Bayesian Discretization • All spatial layers reprojected to EPSG:4326 WGS84
        </div>
      </div>
    </div>
  );
}
