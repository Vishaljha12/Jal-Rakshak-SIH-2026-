import { useState, useEffect } from 'react';
import { getScenarios } from '../services/simulationService';
import { Layers, Eye, Calendar, Plus, Search, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Scenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getScenarios().then(setScenarios);
  }, []);

  const filteredScenarios = scenarios.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              Scenario Repository
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">Hydrodynamic Catalog</span>
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">
            Scenario Archive & Presets
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Precomputed breach conditions, extreme rainfall scenarios, and historical validation runs.
          </p>
        </div>

        <Link 
          to="/simulation" 
          className="glow-cyan-btn text-[#070c18] font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 self-start sm:self-auto shadow-lg"
        >
          <Plus size={16} /> New Hydro Simulation
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-cyan-500/15">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search scenarios by name or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#090f1d] border border-cyan-500/25 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-400 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono self-end sm:self-auto">
          <span>Total Scenarios:</span>
          <span className="font-bold text-cyan-300">{scenarios.length}</span>
        </div>
      </div>

      {/* Scenarios Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080d1a] border-b border-cyan-500/15 uppercase font-mono tracking-wider text-slate-400">
              <tr>
                <th className="p-4">Scenario Specification</th>
                <th className="p-4">Breach Geometry</th>
                <th className="p-4">Solver Status</th>
                <th className="p-4">Recorded Date</th>
                <th className="p-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredScenarios.map(scen => (
                <tr key={scen.id} className="hover:bg-cyan-500/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-950/80 to-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all">
                        <Layers size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-100 text-sm block">{scen.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">ID: {scen.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1 font-mono">
                      <div className="text-slate-200">
                        Width: <span className="text-cyan-400 font-bold">{scen.breachWidth}m</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Depth: <span className="text-slate-300">{scen.breachDepth}m</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {scen.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-500" />
                      <span>{scen.date}</span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link 
                        to={`/dashboard?jobId=${scen.id}`}
                        className="glass-panel text-cyan-300 hover:text-white px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border border-cyan-500/30 hover:border-cyan-400 transition-all text-xs"
                      >
                        <Eye size={13} /> View On Map <ArrowUpRight size={11} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredScenarios.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">
                    <Layers size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No scenarios match your query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
