import { useState, useEffect, useMemo } from 'react';
import { getImpactAnalysis, INDIAN_DAMS_CATALOG, getIndianDams } from '../services/simulationService';
import { exportNDMAAnnexureReport } from '../services/gisExportService';
import { 
  ShieldAlert, 
  Users, 
  Home, 
  Activity, 
  Briefcase, 
  Download, 
  AlertTriangle, 
  Clock, 
  Send, 
  CheckCircle2,
  Navigation,
  FileText,
  Check
} from 'lucide-react';

export default function ImpactAnalysis() {
  const [stats, setStats] = useState(null);
  const [damsList, setDamsList] = useState(INDIAN_DAMS_CATALOG);
  const [selectedDamId, setSelectedDamId] = useState('hidkal');
  const [activeTab, setActiveTab] = useState('settlements');
  const [alertDispatched, setAlertDispatched] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    getIndianDams().then(dams => {
      if (dams && dams.length > 0) setDamsList(dams);
    });
    getImpactAnalysis().then(setStats);
  }, []);

  const selectedDam = useMemo(() => {
    return damsList.find(d => d.id === selectedDamId) || damsList[0] || {
      id: 'hidkal',
      name: 'Hidkal Dam (Raja Lakhamagouda)',
      state: 'Karnataka',
      river: 'Ghataprabha River',
      downstream_villages: ["Hidkal", "Hukkeri", "Sankeshwar", "Ghataprabha"]
    };
  }, [selectedDamId, damsList]);

  const handleDispatchAlert = () => {
    setAlertDispatched(true);
    setTimeout(() => setAlertDispatched(false), 4000);
  };

  const handleExportNDMAReport = async () => {
    setIsExporting(true);
    try {
      await exportNDMAAnnexureReport(selectedDam.id, selectedDam.name);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.error("NDMA Annexure export error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const villages = selectedDam.downstream_villages || ["Valley Reach", "Sector Alpha", "Town Central", "Outflow Basin"];

  const settlementsList = useMemo(() => {
    return villages.map((name, idx) => {
      const step = idx + 1;
      const distance = `${(1.8 + step * 4.2).toFixed(1)} km`;
      const eta = `${Math.round(15 + step * 25)} mins`;
      const depth = `${(4.8 - step * 0.8).toFixed(1)} m`;
      const population = Math.round(2400 + step * 900);
      const risk = step <= 2 ? 'CRITICAL' : step === 3 ? 'HIGH' : 'MODERATE';
      const evacStatus = step === 1 ? 'In Progress' : step === 2 ? 'Alert Sent' : step === 3 ? 'Notified' : 'Standby';
      return { name, distance, eta, depth, population, risk, evacStatus };
    });
  }, [villages]);

  const criticalInfrastructure = useMemo(() => {
    return [
      { name: `${selectedDam.river || 'River'} Causeway Bridge`, type: "Transport", riskLevel: "Extreme Risk", progress: 95, status: "Structural Failure Likely" },
      { name: `${villages[0] || 'Local'} Primary Health Subcenter`, type: "Healthcare", riskLevel: "Critical", progress: 85, status: "Evacuate Patients First" },
      { name: `${villages[1] || 'District'} Electric Substation (66kV)`, type: "Energy Grid", riskLevel: "High Risk", progress: 70, status: "Shutdown Recommended" },
      { name: `${villages[2] || 'Regional'} Water Pumping Station`, type: "Water Supply", riskLevel: "Moderate", progress: 45, status: "Barrier Deployment" },
    ];
  }, [selectedDam, villages]);

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-400">
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Computing spatial exposure and vulnerability matrix...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Inundated Extent", value: `${stats.floodArea} km²`, icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-l-rose-500", detail: "+18% vs Baseline" },
    { label: "Population at Risk", value: stats.population.toLocaleString(), icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-l-cyan-500", detail: "8 Priority Wards" },
    { label: "Downstream Villages", value: `${settlementsList.length} settlements`, icon: Home, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-l-amber-500", detail: "Direct inundation path" },
    { label: "Roadways Severed", value: `${stats.roads} km`, icon: Activity, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-l-teal-500", detail: "Major Arterial Cutoff" },
    { label: "Bridges Vulnerable", value: `${stats.bridges} structures`, icon: Navigation, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-l-indigo-500", detail: "Scour depth > 3.5m" },
    { label: "Critical Facilities", value: `${stats.criticalAssets} units`, icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-l-emerald-500", detail: "2 Primary Health Ctrs" }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#142533]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              Socio-Economic Exposure Matrix
            </span>
            <span className="text-[#3b5869]">•</span>
            <span className="text-xs text-[#7090a0] font-mono">Dam: {selectedDam.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            HADR Impact & Evacuation Priority
          </h1>
          <p className="text-[#8aaab9] text-xs mt-1">
            Hydrodynamic exposure overlays across population centers, highways, and critical medical/shelter assets for {selectedDam.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dam Selector */}
          <div className="flex items-center gap-2 bg-[#09121a] border border-[#1a3848] rounded-lg p-1.5 px-3">
            <span className="text-xs text-slate-400 font-mono">Dam:</span>
            <select
              value={selectedDamId}
              onChange={(e) => setSelectedDamId(e.target.value)}
              className="bg-transparent text-xs font-bold text-emerald-400 outline-none cursor-pointer"
            >
              {damsList.map(dam => (
                <option key={dam.id} value={dam.id} className="bg-[#09121a] text-slate-100">
                  {dam.name} ({dam.state})
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleDispatchAlert}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              alertDispatched 
                ? 'bg-emerald-600 text-slate-950 border border-emerald-400' 
                : 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-sm'
            }`}
          >
            {alertDispatched ? (
              <><CheckCircle2 size={14} /> Emergency Broadcast Sent</>
            ) : (
              <><Send size={14} /> Dispatch NDMA Red Alert</>
            )}
          </button>
          
          <button 
            onClick={handleExportNDMAReport}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg bg-[#0e212b] hover:bg-[#132c3a] border border-[#1a3848] text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {exportSuccess ? (
              <><Check size={14} className="text-emerald-400" /> Exported Report!</>
            ) : isExporting ? (
              <><Clock size={14} className="animate-spin text-emerald-400" /> Packaging...</>
            ) : (
              <><Download size={14} className="text-emerald-400" /> Export NDMA Annexure</>
            )}
          </button>
        </div>
      </div>

      {/* Top 6-Card Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className={`p-4 rounded-lg bg-[#0c1620] border border-[#142533] border-l-4 ${card.border} flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-[11px] font-semibold text-[#769cb0] uppercase tracking-wider">
                  {card.label}
                </div>
                <div className={`p-1.5 rounded ${card.bg} ${card.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white tracking-tight mb-0.5">
                  {card.value}
                </div>
                <div className="text-[10.5px] font-mono text-[#5b7f91]">
                  {card.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evacuation Timeline & Priority Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Priority Tables */}
        <div className="lg:col-span-2 rounded-lg bg-[#0c1620] border border-[#142533] overflow-hidden">
          <div className="p-3.5 px-5 bg-[#09121a] border-b border-[#142533] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Vulnerability Registry
              </span>
            </div>
            
            <div className="flex bg-[#070c12] p-0.5 rounded border border-[#142533] text-xs font-mono">
              <button
                onClick={() => setActiveTab('settlements')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'settlements' ? 'bg-[#0e212b] text-emerald-400 font-bold' : 'text-[#688a9a] hover:text-white'
                }`}
              >
                Villages & Wards
              </button>
              <button
                onClick={() => setActiveTab('infrastructure')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'infrastructure' ? 'bg-[#0e212b] text-emerald-400 font-bold' : 'text-[#688a9a] hover:text-white'
                }`}
              >
                Critical Assets
              </button>
            </div>
          </div>

          <div className="p-4 overflow-x-auto">
            {activeTab === 'settlements' ? (
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] text-[#5b7e90] uppercase border-b border-[#142533] pb-2">
                  <tr>
                    <th className="pb-2 font-semibold">Settlement</th>
                    <th className="pb-2 font-semibold">Distance</th>
                    <th className="pb-2 font-semibold">Flood Wave ETA</th>
                    <th className="pb-2 font-semibold">Peak Depth</th>
                    <th className="pb-2 font-semibold">Population</th>
                    <th className="pb-2 font-semibold">Risk Tier</th>
                    <th className="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#142533]">
                  {settlementsList.map((s, idx) => (
                    <tr key={idx} className="hover:bg-[#0f1d2a] transition-colors">
                      <td className="py-3 font-semibold text-slate-100">{s.name}</td>
                      <td className="py-3 text-[#799caf]">{s.distance}</td>
                      <td className="py-3 font-bold text-amber-400">{s.eta}</td>
                      <td className="py-3 text-cyan-400">{s.depth}</td>
                      <td className="py-3 text-[#799caf]">{s.population.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          s.risk === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          s.risk === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {s.risk}
                        </span>
                      </td>
                      <td className="py-3 text-emerald-400">{s.evacStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] text-[#5b7e90] uppercase border-b border-[#142533] pb-2">
                  <tr>
                    <th className="pb-2 font-semibold">Asset Name</th>
                    <th className="pb-2 font-semibold">Sector</th>
                    <th className="pb-2 font-semibold">Threat Level</th>
                    <th className="pb-2 font-semibold">Vulnerability Index</th>
                    <th className="pb-2 font-semibold">Direct Mandate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#142533]">
                  {criticalInfrastructure.map((inf, idx) => (
                    <tr key={idx} className="hover:bg-[#0f1d2a] transition-colors">
                      <td className="py-3 font-semibold text-slate-100">{inf.name}</td>
                      <td className="py-3 text-[#799caf]">{inf.type}</td>
                      <td className="py-3 text-rose-400 font-bold">{inf.riskLevel}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-[#070c12] h-1.5 rounded-full overflow-hidden border border-[#142533]">
                            <div className="bg-rose-500 h-full" style={{ width: `${inf.progress}%` }}></div>
                          </div>
                          <span className="text-[10px] text-[#799caf]">{inf.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-amber-400">{inf.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: NDMA Command Directives */}
        <div className="rounded-lg bg-[#0c1620] border border-[#142533] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#142533]">
            <AlertTriangle className="text-amber-400" size={16} />
            <h3 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
              NDMA Command Directives
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded bg-[#09121a] border border-[#142533] space-y-1">
              <div className="font-bold text-rose-400 text-[11px]">00:00 - 00:30 (PHASE 1)</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Activate siren systems across Hidkal and Hukkeri. Immediate mandatory evacuation of 2,400 residents in direct 5-meter surge line.
              </p>
            </div>

            <div className="p-3 rounded bg-[#09121a] border border-[#142533] space-y-1">
              <div className="font-bold text-amber-400 text-[11px]">00:30 - 02:00 (PHASE 2)</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Close SH-20 bridge to vehicular traffic. Deploy NDRF 4th Battalion watercraft teams to Sankeshwar junction.
              </p>
            </div>

            <div className="p-3 rounded bg-[#09121a] border border-[#142533] space-y-1">
              <div className="font-bold text-cyan-400 text-[11px]">02:00 - 06:00 (PHASE 3)</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Transfer patients from Hukkeri Subcenter to elevated Belagavi District Hospital. Secure electrical substation cutoff.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
