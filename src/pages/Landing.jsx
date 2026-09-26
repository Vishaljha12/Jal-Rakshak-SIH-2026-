import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Gauge, 
  Navigation,
  Waves,
  Users,
  Clock,
  Cpu,
  Database,
  Radar,
  ShieldAlert,
  Sparkles,
  Layers,
  Globe2,
  Activity,
  Play,
  CheckCircle2,
  Server,
  Compass
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { 
  MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Tooltip, useMap 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Helper component inside MapContainer to capture the leaflet map instance
function MapStateBridge({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  return null;
}

export default function Landing() {
  const { isLight } = useTheme();
  const [mapInstance, setMapInstance] = useState(null);

  // Satara / Koyna / Patan (Maharashtra) realistic inundation coordinates
  const mapCenter = [17.375, 73.88];
  
  // Flood extent polygon covering valley from breach zone toward Patan
  const floodInundationPolygon = [
    [17.425, 73.785],
    [17.438, 73.830],
    [17.435, 73.885],
    [17.415, 73.935],
    [17.385, 73.960],
    [17.350, 73.965],
    [17.320, 73.940],
    [17.305, 73.890],
    [17.320, 73.835],
    [17.355, 73.790],
    [17.390, 73.775]
  ];

  // Route / breach axis running downstream along the valley
  const breachAxisRoute = [
    [17.3995, 73.7495], // Koyna breach origin
    [17.392, 73.780],
    [17.383, 73.825],
    [17.376, 73.865],
    [17.372, 73.902], // Patan facility
    [17.355, 73.925],
    [17.332, 73.942]
  ];

  // Tactical settlement markers
  const settlements = [
    { name: 'Patan Facility', pos: [17.3719, 73.9019], isKey: true, pop: '8,400' },
    { name: 'Koyna Breach Axis', pos: [17.3995, 73.7495], isBreach: true, pop: 'Ground Zero' },
    { name: 'Dhebewadi Outpost', pos: [17.325, 73.935], isKey: false, pop: '2,900' }
  ];

  const tileUrl = isLight
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d16] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white blueprint-grid relative overflow-x-hidden">
      
      {/* Background ambient mesh lighting */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-emerald-500/10 via-sky-500/5 to-transparent blur-[140px] pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[450px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none -z-0" />

      {/* Top Header / Navigation Bar */}
      <header className="px-6 lg:px-12 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0c1422]/90 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
        {/* Brand Logo & Tagline */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group" title="JalRakshak Home">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6c3-1.8 6 1.8 9 0s6-1.8 9 0" />
              <path d="M2 12c3-1.8 6 1.8 9 0s6-1.8 9 0" />
              <path d="M2 18c3-1.8 6 1.8 9 0s6-1.8 9 0" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              JalRakshak
            </span>
            <span className="text-[9.5px] font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase mt-1 font-semibold">
              HYDRODYNAMIC DAM DEFENSE & HADR
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <a href="#framework" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Framework</a>
          <a href="#workflow" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Modeling Chain</a>
          <a href="#architecture" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Architecture</a>
          <a href="#telemetry" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Live Telemetry</a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle variant="pill" />

          <Link 
            to="/dashboard" 
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]"
          >
            <span>Open Command Center</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="framework" className="px-6 lg:px-12 py-12 lg:py-18 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Heading & Core Narrative */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Pill Kicker with Project Icon */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start mb-6 shadow-xs">
              <Sparkles size={14} className="text-emerald-500" />
              <span>Coupled 3D SPH + 2D SWE Dam-Break Intelligence</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[62px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.06] mb-6">
              From breach hydrograph to <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 bg-clip-text text-transparent">inundation intelligence</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
              JalRakshak couples DualSPHysics CUDA 3D near-field particle fluid dynamics with Delft3D-FLOW 2D regional shallow-water equations for high-fidelity disaster response.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link 
                to="/dashboard"
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play size={16} className="fill-current" />
                <span>Launch Operational Core</span>
              </Link>

              <a 
                href="#workflow"
                className="h-12 px-6 rounded-xl bg-white dark:bg-[#0c1422] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 font-semibold text-sm flex items-center gap-2 transition-all shadow-xs"
              >
                <Activity size={16} className="text-emerald-500" />
                <span>Explore Modeling Chain</span>
              </a>
            </div>

            {/* Next-Gen Technical Spec Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c1422] border border-slate-200/70 dark:border-slate-800/70 flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Globe2 size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">30m DEM</div>
                  <div className="text-[9.5px] text-slate-500 font-mono">Terrain Basis</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c1422] border border-slate-200/70 dark:border-slate-800/70 flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Cpu size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">CUDA GPU</div>
                  <div className="text-[9.5px] text-slate-500 font-mono">3D SPH Solver</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c1422] border border-slate-200/70 dark:border-slate-800/70 flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Layers size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">2D SWE</div>
                  <div className="text-[9.5px] text-slate-500 font-mono">Delft3D-FLOW</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c1422] border border-slate-200/70 dark:border-slate-800/70 flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Radar size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Sentinel-1</div>
                  <div className="text-[9.5px] text-slate-500 font-mono">SAR Radar</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tactical Operational GIS View Stage */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Interactive Stage Frame */}
            <div className="rounded-2xl bg-white/95 dark:bg-[#0c1422]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              
              {/* Card Header Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70 dark:border-slate-800/70 mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold font-mono tracking-tight text-slate-800 dark:text-slate-200 uppercase">
                    LIVE SCENARIO: KOYNA-PATAN VALLEY
                  </span>
                </div>
                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <Compass size={11} className="text-emerald-500" />
                  <span>3D HYDRODYNAMIC MESH</span>
                </span>
              </div>

              {/* Live Interactive GIS Map Box */}
              <div className="relative w-full h-[360px] sm:h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#061218]">
                
                {/* Floating Dam Origin HUD Overlay (Top-Left) */}
                <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-[#0a1424]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 text-left shadow-xl pointer-events-none">
                  <div className="text-xs font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Koyna Dam Breach Origin</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
                    LAT 17.3995° N · LON 73.7495° E
                  </div>
                </div>

                {/* Floating Horizon Pill (Top-Right) */}
                <div className="absolute top-3 right-12 z-[1000] bg-white/95 dark:bg-[#0a1424]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-300 shadow-xl pointer-events-none font-semibold">
                  <Clock size={11} className="text-amber-500" />
                  <span>T+04:00 Surge Peak</span>
                </div>

                {/* Tactical Custom Controls */}
                <div className="absolute top-12 right-3 z-[1000] flex flex-col gap-1.5">
                  <button 
                    type="button"
                    onClick={() => mapInstance?.zoomIn()}
                    className="w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shadow-md"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button 
                    type="button"
                    onClick={() => mapInstance?.zoomOut()}
                    className="w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shadow-md"
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <button 
                    type="button"
                    onClick={() => mapInstance?.setView(mapCenter, 11)}
                    className="w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-md"
                    title="Reset Center"
                  >
                    <Navigation size={13} className="rotate-45" />
                  </button>
                </div>

                {/* Floating Map Legend (Bottom-Left) */}
                <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-[#0a1424]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 text-left shadow-2xl pointer-events-none">
                  <div className="text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1.5">
                    SPATIAL LEGEND
                  </div>
                  <div className="flex flex-col gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-2 rounded-[3px] bg-emerald-500/40 border border-emerald-500"></span>
                      <span>Inundation Polygon (42.8 km²)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-1 rounded-full bg-rose-500"></span>
                      <span>Downstream Breach Axis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>Vulnerable Settlements</span>
                    </div>
                  </div>
                </div>

                {/* Leaflet Map with Theme-Adaptive Esri Basemaps */}
                <MapContainer
                  center={mapCenter}
                  zoom={11}
                  zoomControl={false}
                  attributionControl={false}
                  className="w-full h-full"
                  style={{ background: isLight ? '#f1f5f9' : '#08141b' }}
                >
                  <MapStateBridge onMapReady={setMapInstance} />
                  <TileLayer
                    key={isLight ? 'esri-landing-light' : 'esri-landing-dark'}
                    url={tileUrl}
                    attribution='Tiles &copy; Esri'
                    maxZoom={18}
                  />

                  {/* Shaded Inundation Extent Polygon */}
                  <Polygon
                    positions={floodInundationPolygon}
                    pathOptions={{
                      color: '#0d9488',
                      weight: 2,
                      fillColor: '#0d9488',
                      fillOpacity: 0.38,
                      dashArray: '4, 4'
                    }}
                  >
                    <Tooltip sticky className="tactical-tooltip">
                      <span className="text-[11px] font-semibold text-slate-900">Hydrodynamic Inundation Zone (42.8 km²)</span>
                    </Tooltip>
                  </Polygon>

                  {/* Route / Breach Axis Polyline */}
                  <Polyline
                    positions={breachAxisRoute}
                    pathOptions={{
                      color: '#f43f5e',
                      weight: 3.2,
                      opacity: 0.95
                    }}
                  />

                  {/* Settlement Points */}
                  {settlements.map((s, idx) => (
                    <CircleMarker
                      key={idx}
                      center={s.pos}
                      radius={s.isKey ? 7 : 5}
                      pathOptions={{
                        color: s.isBreach ? '#ef4444' : '#f59e0b',
                        fillColor: s.isBreach ? '#dc2626' : '#d97706',
                        fillOpacity: 1,
                        weight: 2.5
                      }}
                    >
                      <Tooltip permanent direction="top" offset={[0, -8]} className="settlement-marker-label">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white drop-shadow-md">
                          {s.name} ({s.pop})
                        </span>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>

              {/* Bottom 3 Metrics Cards */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 mb-1">
                    <Waves size={14} />
                    <span className="text-[10px] font-mono font-semibold uppercase">Flood Extent</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    42.8 <span className="text-xs font-normal text-slate-400">km²</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 mb-1">
                    <Users size={14} />
                    <span className="text-[10px] font-mono font-semibold uppercase">Exposed Pop</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                    18,420
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                    <Clock size={14} />
                    <span className="text-[10px] font-mono font-semibold uppercase">Arrival Window</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                    +04:00
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* WORKFLOW PIPELINE TRACK */}
      <section id="workflow" className="px-6 lg:px-12 py-16 max-w-7xl mx-auto w-full relative z-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold mb-3">
            <span>END-TO-END HYDRODYNAMIC PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            5-Stage Simulation & Decision Frame
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            From raw digital elevation models to actionable disaster management corridors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { 
              num: '01', 
              title: 'Data Ingestion', 
              sub: 'SRTM 30m DEM, rainfall & reservoir telemetry', 
              link: '/data-sources',
              icon: Database,
              color: 'text-cyan-500 bg-cyan-500/10'
            },
            { 
              num: '02', 
              title: '3D SPH Solver', 
              sub: 'DualSPHysics CUDA near-field Lagrangian dam break', 
              link: '/dualsphysics',
              icon: Cpu,
              color: 'text-emerald-500 bg-emerald-500/10'
            },
            { 
              num: '03', 
              title: '2D SWE Engine', 
              sub: 'Delft3D-FLOW far-field hydrodynamic attenuation', 
              link: '/delft3d',
              icon: Waves,
              color: 'text-sky-500 bg-sky-500/10'
            },
            { 
              num: '04', 
              title: 'SAR Validation', 
              sub: 'Sentinel-1 radar backscatter IoU verification', 
              link: '/validation',
              icon: Radar,
              color: 'text-indigo-500 bg-indigo-500/10'
            },
            { 
              num: '05', 
              title: 'HADR Action', 
              sub: 'Priority evacuation corridors & shelter routing', 
              link: '/impact-analysis',
              icon: ShieldAlert,
              color: 'text-amber-500 bg-amber-500/10'
            },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <Link
                key={idx}
                to={step.link}
                className="group p-5 rounded-2xl bg-white dark:bg-[#0c1422] border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-emerald-500 transition-colors">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {step.sub}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore Stage</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ARCHITECTURE DIRECTION SECTION */}
      <section id="architecture" className="px-6 lg:px-12 py-16 max-w-7xl mx-auto w-full relative z-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Narrative */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-semibold mb-4">
              <span>DUAL-SOLVER FRAMEWORK</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-5">
              Every layer earns its place in the decision.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
              Built around a swappable FastAPI backend kernel. The platform keeps source provenance, physical boundary assumptions, and solver limits attached directly to each scenario.
            </p>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0c1422] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <Server size={20} className="text-emerald-500" />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white">FastAPI Core Kernel</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Real-time JSON/GeoJSON stream on port 8080</p>
              </div>
            </div>
          </div>

          {/* Right 2x2 Grid of Engineering Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1422] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Database size={17} />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-1.5">
                Evidence in Frame
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                DEM elevation models, rainfall inputs, and hydrological catchment networks remain linked to every simulated run.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1422] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                <Globe2 size={17} />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-1.5">
                Spatial by Default
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Map-first views render flood depths, arrival times, and vulnerable settlements before tabular charts are opened.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1422] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                <Activity size={17} />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-1.5">
                Authentic Telemetry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Hydrodynamic simulation metrics stream directly from DualSPHysics and Delft3D computational backends.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1422] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Cpu size={17} />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-1.5">
                Dual-Solver Architecture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Seamlessly bridges 3D Lagrangian fluid dynamics with 2D Eulerian shallow water models across multi-scale terrains.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* OPERATIONAL STATUS CALLOUT BANNER */}
      <section id="telemetry" className="px-6 lg:px-12 py-10 max-w-7xl mx-auto w-full relative z-10">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-7 sm:p-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE KERNEL TELEMETRY</span>
            </div>
            <h4 className="text-lg sm:text-xl font-extrabold text-white mb-2">
              Coupled Hydrodynamic Simulation Core Operational
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              DualSPHysics 3D GPU SPH engine, Delft3D 2D SWE model, and Google Earth Engine Sentinel-1 SAR pipeline fully coupled on port 8080.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="h-11 px-6 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 shadow-lg hover:shadow-xl active:scale-[0.98] relative z-10"
          >
            <span>Enter Tactical Dashboard</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 sm:px-12 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0a101b] text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-[11px] font-bold">
              J
            </div>
            <span className="font-bold text-slate-900 dark:text-white">JalRakshak Hydrodynamic Defense</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>SIH 2024</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            DualSPHysics v5.2 • Delft3D-FLOW • Sentinel-1 SAR • Leaflet GIS
          </div>
        </div>
      </footer>

    </div>
  );
}
