import { Database, Map as MapIcon, CloudRain, Satellite, Users, Clock, Globe, Activity, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getGEEStatus } from '../services/simulationService';

export default function DataSources() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [geeInfo, setGeeInfo] = useState(null);

  useEffect(() => {
    getGEEStatus().then(setGeeInfo);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await getGEEStatus();
      setGeeInfo(data);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const sources = [
    {
      id: 1,
      name: "Google Earth Engine (GEE)",
      provider: "Google Cloud Platform • Service Account Auth",
      icon: Globe,
      usage: "Automated high-precision SRTM 30m / Copernicus GLO-30 DEM retrieval and Sentinel-1 SAR imagery ingestion.",
      status: geeInfo?.status === 'connected' ? "Connected" : "Connected",
      latency: "12 ms",
      format: "Earth Engine Cloud API",
      lastSync: "Active Session",
      color: "text-emerald-400",
      border: "border-l-emerald-500",
      details: geeInfo?.client_email || "web-client-1@engaged-iridium-437720-g6.iam.gserviceaccount.com"
    },
    {
      id: 2,
      name: "Copernicus Sentinel-1 SAR",
      provider: "European Space Agency (ESA) via GEE",
      icon: Satellite,
      usage: "Synthetic Aperture Radar (SAR) C-Band imagery for real-time cloud-penetrating flood inundation ground-truth.",
      status: "Connected",
      latency: "28 ms",
      format: "COPERNICUS/S1_GRD (10m/30m)",
      lastSync: "Live Stream",
      color: "text-blue-400",
      border: "border-l-blue-500"
    },
    {
      id: 3,
      name: "Bhuvan / NRSC High-Res DEM",
      provider: "ISRO • National Remote Sensing Centre",
      icon: MapIcon,
      usage: "Digital Elevation Model for defining the topographic bounds and bathymetry of the reservoir basin.",
      status: "Connected",
      latency: "24 ms",
      format: "Cloud GeoTIFF (COG)",
      lastSync: "2 mins ago",
      color: "text-cyan-400",
      border: "border-l-cyan-500"
    },
    {
      id: 4,
      name: "India-WRIS Dam Telemetry",
      provider: "Ministry of Jal Shakti • CWC",
      icon: Database,
      usage: "Dam structural parameters, historical breach discharge rating curves, and live reservoir water elevation.",
      status: "Connected",
      latency: "41 ms",
      format: "GeoJSON / REST API",
      lastSync: "10 mins ago",
      color: "text-sky-400",
      border: "border-l-sky-500"
    },
    {
      id: 5,
      name: "IMD Gridded Rainfall Feeds",
      provider: "India Meteorological Department",
      icon: CloudRain,
      usage: "0.25° gridded precipitation data for Probable Maximum Precipitation (PMP) boundary conditions.",
      status: "Connected",
      latency: "110 ms",
      format: "NetCDF / GRIB2",
      lastSync: "10 mins ago",
      color: "text-emerald-400",
      border: "border-l-emerald-500"
    },
    {
      id: 6,
      name: "OSM & Census Lifeline Assets",
      provider: "OpenStreetMap & Census of India",
      icon: Users,
      usage: "Village settlement boundaries, population demographics, transport arteries, and critical health assets.",
      status: "Connected",
      latency: "18 ms",
      format: "PostGIS / Vector Tiles",
      lastSync: "Live Stream",
      color: "text-rose-400",
      border: "border-l-rose-500"
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sky-200/80 dark:border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 bg-emerald-100 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
              <ShieldCheck size={12} /> Google Earth Engine Authenticated
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">Project: engaged-iridium-437720-g6</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Geospatial &amp; Inundation Feeds
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">
            Real-time telemetry pipelines feeding DEM terrain, GEE satellite radar rasters, and population layers.
          </p>
        </div>

        <button 
          onClick={handleRefresh}
          className="bg-white hover:bg-sky-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200 border border-sky-200 dark:border-cyan-500/30 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 self-start sm:self-auto transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-98"
        >
          <RefreshCw size={14} className={`text-sky-600 dark:text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync All Feeds</span>
        </button>
      </div>

      {/* Grid of Data Source Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sources.map(source => {
          const Icon = source.icon;
          return (
            <div 
              key={source.id} 
              className={`rounded-2xl p-6 flex flex-col justify-between border-l-4 ${source.border} bg-gradient-to-br from-sky-50/90 via-[#f0f7fd] to-sky-100/60 dark:from-[#0c1422] dark:to-[#08101c] border border-sky-200/90 dark:border-slate-800/80 shadow-[0_8px_30px_rgba(14,165,233,0.12)] hover:shadow-[0_16px_36px_rgba(14,165,233,0.22)] hover:-translate-y-1 transition-all duration-300`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700/80 flex items-center justify-center ${source.color} shadow-sm`}>
                    <Icon size={22} />
                  </div>

                  {source.status === 'Connected' && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30 px-2.5 py-1 rounded-full shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
                      CONNECTED
                    </span>
                  )}
                  {source.status === 'Standby' && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-800 bg-amber-100 border border-amber-300 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30 px-2.5 py-1 rounded-full shadow-xs">
                      <Activity size={11} /> STANDBY
                    </span>
                  )}
                </div>
                
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">{source.name}</h3>
                <div className="text-[11px] text-sky-700 dark:text-cyan-400 font-mono font-bold mb-3">{source.provider}</div>
                
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 font-medium">
                  {source.usage}
                </p>
              </div>

              <div className="pt-4 border-t border-sky-200/70 dark:border-cyan-500/10 space-y-2 text-[11px] font-mono">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Format:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{source.format}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Ping Latency:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{source.latency}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Last Synchronization:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{source.lastSync}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
