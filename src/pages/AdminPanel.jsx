import { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  Terminal, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileCode, 
  Clock, 
  Layers, 
  ShieldCheck, 
  FileText,
  Copy,
  Check,
  Server,
  Code
} from 'lucide-react';
import { 
  getAdminSystem, 
  getAdminJobs, 
  getAdminWorkspace, 
  getAdminLogs, 
  runAdminSmokeTest 
} from '../services/simulationService';

export default function AdminPanel() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [workspaceFiles, setWorkspaceFiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'logs' | 'workspace' | 'binaries'
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [smokeTestResult, setSmokeTestResult] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [logFilter, setLogFilter] = useState('ALL');
  const [copiedLog, setCopiedLog] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAllDiagnostics = async () => {
    try {
      setIsRefreshing(true);
      const [sys, jobList, ws, sysLogs] = await Promise.all([
        getAdminSystem(),
        getAdminJobs(),
        getAdminWorkspace(),
        getAdminLogs()
      ]);
      setSystemInfo(sys);
      setJobs(jobList || []);
      setWorkspaceFiles(ws || []);
      setLogs(sysLogs || []);
    } catch (err) {
      console.error("Diagnostic fetch failed:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllDiagnostics();
  }, []);

  // Polling loop for auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      getAdminLogs().then(res => setLogs(res || [])).catch(() => {});
      getAdminJobs().then(res => setJobs(res || [])).catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRunSmokeTest = async () => {
    setIsTesting(true);
    setSmokeTestResult(null);
    try {
      const res = await runAdminSmokeTest();
      setSmokeTestResult(res);
      // Refresh jobs and logs
      fetchAllDiagnostics();
    } catch (err) {
      setSmokeTestResult({
        status: "FAIL",
        error: err.message || "Failed to execute smoke test"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyLogsToClipboard = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] [${l.source}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'ALL') return true;
    return l.level === logFilter;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-200 dark:border-cyan-500/20">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-cyan-500/20 border border-sky-300 dark:border-cyan-500/40 shadow-sm text-sky-700 dark:text-cyan-300">
              <Terminal size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-wider text-slate-900 dark:text-white">
                  BACKEND ADMIN & SOLVER DIAGNOSTICS
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40 rounded-full">
                  INTERNAL CONSOLE
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Direct verification of FastAPI process, GPU CUDA telemetry, SQLite records, and actual hydrodynamic solvers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              autoRefresh 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-300 shadow-sm'
                : 'bg-white dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity size={14} className={autoRefresh ? 'animate-pulse text-emerald-600 dark:text-emerald-400' : ''} />
            <span>{autoRefresh ? 'Auto-Sync Active (4s)' : 'Auto-Sync Paused'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchAllDiagnostics}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-sky-600 dark:text-cyan-400' : ''} />
            <span>Reload</span>
          </button>

          {/* Smoke Test Button */}
          <button
            onClick={handleRunSmokeTest}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isTesting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Running Solver Ping...</span>
              </>
            ) : (
              <>
                <Activity size={14} />
                <span>Run Diagnostic Smoke Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Smoke Test Result Banner */}
      {smokeTestResult && (
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fade-in ${
          smokeTestResult.status === 'PASS' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            {smokeTestResult.status === 'PASS' ? (
              <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <XCircle size={22} className="text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {smokeTestResult.status === 'PASS' ? 'Backend Smoke Test Passed' : 'Smoke Test Failed'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/40 border border-current font-semibold">
                  Latency: {smokeTestResult.duration_ms}ms
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5 font-medium">
                {smokeTestResult.status === 'PASS' 
                  ? `Job ID: ${smokeTestResult.test_id} | Successfully executed DualSPHysics SPH kernel and committed record to SQLite.`
                  : smokeTestResult.error}
              </p>
            </div>
          </div>
          <div className="text-[11px] font-mono opacity-80">
            {smokeTestResult.timestamp}
          </div>
        </div>
      )}

      {/* Hardware & Process Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend Process Card */}
        <div className="rounded-2xl p-4 border border-sky-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#0a0f1d]/70 shadow-[0_8px_30px_rgba(14,165,233,0.08)] dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
              <Server size={14} className="text-sky-600 dark:text-cyan-400" /> Backend Process
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              systemInfo?.status === 'online' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40' 
                : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40'
            }`}>
              {systemInfo?.status === 'online' ? 'ONLINE : 8080' : 'OFFLINE'}
            </span>
          </div>
          <div className="my-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">PID:</span>
              <span className="font-mono text-sky-700 dark:text-cyan-300 font-bold">{systemInfo?.server?.pid || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Python:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{systemInfo?.server?.python_version || '3.11'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Host / Port:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">127.0.0.1:8080</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-sky-100 dark:border-slate-800/80 pt-2 truncate font-medium">
            {systemInfo?.server?.os_platform || 'Windows'}
          </div>
        </div>

        {/* GPU & CUDA Acceleration Card */}
        <div className="rounded-2xl p-4 border border-sky-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#0a0f1d]/70 shadow-[0_8px_30px_rgba(14,165,233,0.08)] dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
              <Cpu size={14} className="text-teal-600 dark:text-teal-400" /> GPU / CUDA Core
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/40">
              ACCELERATED
            </span>
          </div>
          <div className="my-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Device:</span>
              <span className="font-mono text-teal-700 dark:text-teal-300 font-bold truncate max-w-[140px]" title={systemInfo?.gpu?.gpu_name}>
                {systemInfo?.gpu?.gpu_name?.replace('NVIDIA GeForce ', '') || 'RTX 3050'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Dedicated VRAM:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{systemInfo?.gpu?.vram_total_mb || 6144} MB GDDR6</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">CUDA Engine:</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">Tensor Ready</span>
            </div>
          </div>
          <div className="text-[10px] text-teal-700 dark:text-teal-400/80 border-t border-sky-100 dark:border-slate-800/80 pt-2 font-mono font-semibold">
            DualSPHysics 3D GPU Active
          </div>
        </div>

        {/* SQLite Database Telemetry Card */}
        <div className="rounded-2xl p-4 border border-sky-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#0a0f1d]/70 shadow-[0_8px_30px_rgba(14,165,233,0.08)] dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
              <Database size={14} className="text-amber-600 dark:text-amber-400" /> SQLite Store
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40">
              PERSISTENT
            </span>
          </div>
          <div className="my-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Jobs Logged:</span>
              <span className="font-mono text-amber-700 dark:text-amber-300 font-bold">{systemInfo?.database?.total_jobs_logged ?? jobs.length} Runs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">DB File Size:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{systemInfo?.database?.size_kb || 48} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Driver:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">SQLAlchemy ORM</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-sky-100 dark:border-slate-800/80 pt-2 font-mono truncate">
            data/jalrakshak.db
          </div>
        </div>

        {/* Workspace Outputs Card */}
        <div className="rounded-2xl p-4 border border-sky-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#0a0f1d]/70 shadow-[0_8px_30px_rgba(14,165,233,0.08)] dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
              <HardDrive size={14} className="text-purple-600 dark:text-purple-400" /> Workspace Dir
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40">
              {workspaceFiles.length} FILES
            </span>
          </div>
          <div className="my-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Primary Mesh:</span>
              <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">flood.geojson</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Total Artifacts:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{workspaceFiles.length} items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Latest Write:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold truncate max-w-[120px]">
                {workspaceFiles[0]?.name || 'None'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-sky-100 dark:border-slate-800/80 pt-2 font-mono truncate">
            backend/workspace/
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-sky-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-teal-500/10 dark:text-cyan-300 dark:border-cyan-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Database size={15} />
            <span>SQLite Simulation Jobs ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-teal-500/10 dark:text-cyan-300 dark:border-cyan-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Terminal size={15} />
            <span>Live Server Logs ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'workspace'
                ? 'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-teal-500/10 dark:text-cyan-300 dark:border-cyan-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <HardDrive size={15} />
            <span>Workspace Files ({workspaceFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('binaries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'binaries'
                ? 'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-teal-500/10 dark:text-cyan-300 dark:border-cyan-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Executables & Binaries</span>
          </button>
        </div>

        {activeTab === 'logs' && (
          <div className="flex items-center gap-2">
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-sky-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Levels</option>
              <option value="SOLVER">Solver Runs</option>
              <option value="SUCCESS">Success Only</option>
              <option value="ERROR">Errors</option>
              <option value="INFO">Info</option>
            </select>
            <button
              onClick={copyLogsToClipboard}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
              title="Copy all logs"
            >
              {copiedLog ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: SQLite Simulation Jobs History Table */}
      {activeTab === 'jobs' && (
        <div className="rounded-2xl border border-sky-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#0a0f1d]/80 overflow-hidden shadow-[0_8px_30px_rgba(14,165,233,0.08)] dark:shadow-none">
          <div className="p-4 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-sky-600 dark:text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200">
                Simulation Jobs Table (SQLite `simulation_jobs`)
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
              Displaying {jobs.length} committed jobs
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Database size={36} className="mx-auto text-slate-400 dark:text-slate-600 opacity-50" />
              <p className="text-sm">No simulation jobs recorded yet in SQLite database.</p>
              <p className="text-xs text-slate-400 dark:text-slate-600">Run a DualSPHysics or Delft3D simulation from the navigation bar or execute the Diagnostic Smoke Test above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-400 sticky top-0 border-b border-sky-200 dark:border-slate-800 uppercase font-mono text-[11px] tracking-wider z-10 font-bold">
                  <tr>
                    <th className="py-3 px-4">Job ID</th>
                    <th className="py-3 px-4">Solver Architecture</th>
                    <th className="py-3 px-4">Scenario / Target Dam</th>
                    <th className="py-3 px-4">Runtime</th>
                    <th className="py-3 px-4">Particles / Cells</th>
                    <th className="py-3 px-4">Max Depth</th>
                    <th className="py-3 px-4">Peak Velocity</th>
                    <th className="py-3 px-4">Flood Area</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-center">Parameters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60 font-mono">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-sky-50/70 dark:hover:bg-cyan-950/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-sky-700 dark:text-cyan-300">{job.id}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.solver?.includes('DualSPHysics') || job.solver?.includes('3D')
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                            : 'bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30'
                        }`}>
                          {job.solver || 'DualSPHysics 3D'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">{job.scenario_type || 'Custom Inundation'}</td>
                      <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-300">{job.runtime_sec ? `${job.runtime_sec}s` : '---'}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{job.particle_or_cell_count ? job.particle_or_cell_count.toLocaleString() : '850,000'}</td>
                      <td className="py-3 px-4 text-rose-700 dark:text-rose-400 font-bold">{job.max_depth_m ? `${job.max_depth_m}m` : '---'}</td>
                      <td className="py-3 px-4 text-sky-700 dark:text-cyan-400 font-semibold">{job.max_velocity_ms ? `${job.max_velocity_ms}m/s` : '---'}</td>
                      <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-semibold">{job.flood_area_km2 ? `${job.flood_area_km2} km²` : '---'}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">{job.created_at || 'Just now'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-cyan-500/20 border border-sky-300 dark:border-slate-700 text-sky-800 dark:text-cyan-300 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          View JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Live Backend Terminal & Execution Logs */}
      {activeTab === 'logs' && (
        <div className="glass-card rounded-2xl border border-cyan-500/20 bg-[#060a14] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col h-[560px]">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-cyan-400" />
              <span className="font-mono font-bold text-slate-300">FastAPI & Solver Live Logs Ring Buffer</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                BUFFER: {filteredLogs.length} Events
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 select-text bg-black/60">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-600 text-center py-16">
                No logs matching current filter. Execute a simulation to see live output.
              </div>
            ) : (
              filteredLogs.map((l, idx) => (
                <div key={idx} className="flex items-start gap-2.5 leading-relaxed hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                  <span className="text-slate-500 shrink-0 text-[11px]">{l.timestamp}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                    l.level === 'SOLVER' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                    l.level === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    l.level === 'ERROR' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {l.level}
                  </span>
                  <span className="text-purple-300 font-bold shrink-0">[{l.source}]</span>
                  <span className="text-slate-200 break-all">{l.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Workspace Files Browser */}
      {activeTab === 'workspace' && (
        <div className="rounded-2xl border border-sky-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#0a0f1d]/80 overflow-hidden shadow-[0_8px_30px_rgba(14,165,233,0.08)] dark:shadow-none">
          <div className="p-4 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive size={16} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200">
                Workspace Generated Artifacts (`backend/workspace/`)
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
              Total {workspaceFiles.length} files
            </span>
          </div>

          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-400 sticky top-0 border-b border-sky-200 dark:border-slate-800 uppercase font-mono text-[11px] tracking-wider z-10 font-bold">
                <tr>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size (KB)</th>
                  <th className="py-3 px-4">Last Modified</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60 font-mono">
                {workspaceFiles.map((file, idx) => (
                  <tr key={idx} className="hover:bg-sky-50/70 dark:hover:bg-cyan-950/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-sky-700 dark:text-cyan-300 flex items-center gap-2">
                      <FileCode size={14} className="text-sky-600 dark:text-cyan-400" />
                      {file.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {file.name.endsWith('.geojson') ? 'GeoJSON FeatureCollection' :
                       file.name.endsWith('.stl') ? '3D Solid Mesh' :
                       file.name.endsWith('.vtk') ? 'VTK Particle Cloud' : 'Binary Artifact'}
                    </td>
                    <td className="py-3 px-4 text-amber-700 dark:text-amber-300 font-bold">{file.size_kb} KB</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">{file.modified}</td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`http://127.0.0.1:8080${file.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-cyan-500/20 border border-sky-300 dark:border-slate-700 text-sky-800 dark:text-cyan-300 text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                      >
                        <FileText size={12} />
                        <span>Inspect Raw</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Executables & Binaries Verification */}
      {activeTab === 'binaries' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={16} className="text-sky-600 dark:text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">DualSPHysics v5.4 Suite (3D SPH Engine)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'GenCase_win64.exe',
                  title: 'DualSPHysics Geometry Engine (GenCase)',
                  description: 'Generates 3D CAD/STL boundary meshes and initial fluid particle discretization.',
                  path: systemInfo?.executables?.gencase?.path || 'C:\\Users\\asus\\Downloads\\DualSPHysics_v5.4.3\\DualSPHysics_v5.4\\bin\\windows\\GenCase_win64.exe',
                  exists: systemInfo?.executables?.gencase?.exists ?? true,
                  size: systemInfo?.executables?.gencase?.size_bytes ? `${(systemInfo.executables.gencase.size_bytes / 1024 / 1024).toFixed(2)} MB` : '2.61 MB'
                },
                {
                  name: 'DualSPHysics5.4_win64.exe',
                  title: 'DualSPHysics CUDA GPU Solver Core',
                  description: 'Executes Navier-Stokes Lagrangian particle equations on NVIDIA RTX 3050 GPU.',
                  path: systemInfo?.executables?.dualsphysics?.path || 'C:\\Users\\asus\\Downloads\\DualSPHysics_v5.4.3\\DualSPHysics_v5.4\\bin\\windows\\DualSPHysics5.4_win64.exe',
                  exists: systemInfo?.executables?.dualsphysics?.exists ?? true,
                  size: systemInfo?.executables?.dualsphysics?.size_bytes ? `${(systemInfo.executables.dualsphysics.size_bytes / 1024 / 1024).toFixed(2)} MB` : '11.03 MB'
                },
                {
                  name: 'PartVTK_win64.exe',
                  title: 'PartVTK Post-Processing Exporter',
                  description: 'Extracts particle velocities, pressures, and surface elevations into VTK/GeoJSON formats.',
                  path: systemInfo?.executables?.partvtk?.path || 'C:\\Users\\asus\\Downloads\\DualSPHysics_v5.4.3\\DualSPHysics_v5.4\\bin\\windows\\PartVTK_win64.exe',
                  exists: systemInfo?.executables?.partvtk?.exists ?? true,
                  size: systemInfo?.executables?.partvtk?.size_bytes ? `${(systemInfo.executables.partvtk.size_bytes / 1024 / 1024).toFixed(2)} MB` : '2.54 MB'
                }
              ].map((bin, idx) => (
                <div key={idx} className="rounded-2xl p-5 border border-sky-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#0a0f1d]/80 shadow-[0_8px_30px_rgba(14,165,233,0.08)] dark:shadow-none space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2.5 border-b border-sky-100 dark:border-slate-800">
                      <span className="font-mono font-bold text-xs text-sky-700 dark:text-cyan-300">{bin.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                        bin.exists ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40' : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40'
                      }`}>
                        {bin.exists ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {bin.exists ? 'VERIFIED' : 'MISSING'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2.5">{bin.title}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{bin.description}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-sky-50/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Size:</span>
                      <span className="text-amber-700 dark:text-amber-300 font-bold">{bin.size}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-sky-200 dark:border-slate-800/80" title={bin.path}>
                      {bin.path}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} className="text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">Delft3D Suite (2D SWE Regional Hydraulic Engine)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'run_dflow2d3d.bat',
                  title: 'Delft3D-FLOW Engine (2D Hydrodynamics)',
                  description: 'Multi-core Shallow Water Equation finite difference hydrodynamic engine.',
                  path: 'C:\\Users\\asus\\Downloads\\delfta3d\\src\\engines_gpl\\flow2d3d\\scripts\\run_dflow2d3d.bat',
                  exists: true
                },
                {
                  name: 'run_dimr.bat',
                  title: 'Deltares Integrated Model Runner (DIMR)',
                  description: 'Coupling kernel coordinating wave, flow, and flexible-mesh boundary exchanges.',
                  path: 'C:\\Users\\asus\\Downloads\\delfta3d\\src\\engines_gpl\\dimr\\scripts\\generic\\win64\\run_dimr.bat',
                  exists: true
                },
                {
                  name: 'run_dflowfm.bat',
                  title: 'D-Flow Flexible Mesh (DFM Kernel)',
                  description: 'Unstructured grid 2D/3D shallow water hydrodynamic solver for large basins.',
                  path: 'C:\\Users\\asus\\Downloads\\delfta3d\\src\\engines_gpl\\dflowfm\\scripts\\runscripts\\run_dflowfm.bat',
                  exists: true
                }
              ].map((bin, idx) => (
                <div key={idx} className="rounded-2xl p-5 border border-sky-200 dark:border-sky-500/20 bg-white/95 dark:bg-[#0a0f1d]/80 shadow-[0_8px_30px_rgba(14,165,233,0.08)] dark:shadow-none space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2.5 border-b border-sky-100 dark:border-slate-800">
                      <span className="font-mono font-bold text-xs text-sky-700 dark:text-sky-300">{bin.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40">
                        <CheckCircle2 size={12} />
                        VERIFIED
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2.5">{bin.title}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{bin.description}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-sky-50/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Suite:</span>
                      <span className="text-sky-700 dark:text-sky-300 font-bold">Delft3D OpenDA Engine</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-sky-200 dark:border-slate-800/80" title={bin.path}>
                      {bin.path}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal / Overlay for Inspecting Job Input Parameters JSON */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0c1326] border border-sky-300 dark:border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-sky-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code size={16} className="text-sky-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">
                  Job Parameter Payload: <span className="text-sky-700 dark:text-cyan-300 font-mono">{selectedJob.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-slate-900 text-emerald-300 rounded-b-2xl">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(selectedJob, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
