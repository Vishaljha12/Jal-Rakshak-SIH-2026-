import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Gauge, Sun, Navigation
} from 'lucide-react';
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
  const [ambientLight, setAmbientLight] = useState(true);
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
    { name: 'Patan', pos: [17.3719, 73.9019], isKey: true },
    { name: 'Koyna Breach Axis', pos: [17.3995, 73.7495], isBreach: true },
    { name: 'Dhebewadi Outpost', pos: [17.325, 73.935], isKey: false }
  ];

  return (
    <div className="min-h-screen bg-[#07141b] text-slate-100 flex flex-col font-sans selection:bg-[#2dd4bf] selection:text-[#06141b] blueprint-grid relative overflow-x-hidden">
      
      {/* Background ambient lighting */}
      {ambientLight && (
        <>
          <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#2dd4bf]/10 via-[#0284c7]/5 to-transparent blur-[140px] pointer-events-none -z-0" />
          <div className="absolute top-1/3 right-10 w-[600px] h-[500px] bg-[#0d9488]/10 rounded-full blur-[130px] pointer-events-none -z-0" />
        </>
      )}

      {/* Background Watermark */}
      <div className="hidden lg:block absolute top-20 right-16 text-xs font-mono tracking-[0.25em] text-[#3b6678]/40 select-none pointer-events-none z-0">
        SCN-2488-17
      </div>

      {/* Top Header / Navigation Bar */}
      <header className="px-6 lg:px-12 py-5 flex items-center justify-between border-b border-[#122c38]/60 bg-[#07141b]/80 backdrop-blur-xl sticky top-0 z-50">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#091b24] border border-[#2dd4bf]/40 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.2)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
              <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
              <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-none">
              JalRakshak
            </span>
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#4d7888] uppercase mt-1">
              FLOOD INTELLIGENCE / HADR
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-[0.16em] text-[#5e8495]">
          <a href="#framework" className="hover:text-[#2dd4bf] transition-colors">FRAMEWORK</a>
          <a href="#workflow" className="hover:text-[#2dd4bf] transition-colors">WORKFLOW</a>
          <a href="#architecture" className="hover:text-[#2dd4bf] transition-colors">ARCHITECTURE</a>
          <a href="#prototype-boundary" className="hover:text-[#2dd4bf] transition-colors">PROTOTYPE BOUNDARY</a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setAmbientLight(!ambientLight)}
            className="w-9 h-9 rounded-lg border border-[#163544] bg-[#0a1c25] hover:bg-[#0f2a38] text-[#7198aa] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Toggle Ambient Illumination"
          >
            <Sun size={17} className={ambientLight ? 'text-amber-400' : 'text-slate-400'} />
          </button>

          <Link 
            to="/dashboard" 
            className="bg-[#2dd4bf] hover:bg-[#3be0cb] text-[#061820] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-teal-500/20 active:scale-[0.98]"
          >
            <span>Open command center</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="framework" className="px-6 lg:px-12 py-12 lg:py-16 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Heading & Core Narrative */}
          <div className="lg:col-span-6 flex flex-col justify-center pt-2">
            {/* Monospace Kicker */}
            <div className="text-[11px] font-mono font-bold tracking-[0.22em] text-[#2dd4bf] mb-5 uppercase">
              DAM-BREAK INUNDATION MODELING FRAMEWORK
            </div>

            {/* Giant Display Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold text-white tracking-tight leading-[1.04] mb-7">
              From breach<br />
              hydrograph<br />
              to <span className="text-[#2dd4bf]">inundation</span><br />
              <span className="text-[#2dd4bf]">intelligence.</span>
            </h1>

            {/* Subtitle / Descriptive Paragraph */}
            <p className="text-[#7d9eaf] text-base sm:text-[17px] leading-relaxed max-w-xl mb-9">
              JalRakshak is a GIS-first framework for configuring dam-break scenarios, tracing hydrodynamic model handoffs and turning flood extent into a reviewable HADR decision frame.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-14">
              <a 
                href="#workflow"
                className="bg-[#2dd4bf] hover:bg-[#3be0cb] text-[#061820] font-bold text-sm px-5 py-3 rounded-lg flex items-center gap-2.5 transition-all shadow-lg shadow-teal-500/15"
              >
                <Gauge size={17} />
                Explore the framework
              </a>

              <a 
                href="#architecture"
                className="bg-[#0b202a] hover:bg-[#102b38] text-white border border-[#1b3e4f] hover:border-[#2dd4bf]/50 font-medium text-sm px-5 py-3 rounded-lg flex items-center gap-2 transition-all"
              >
                See the modeling chain <ArrowRight size={15} />
              </a>
            </div>

            {/* Spec Bar (Bottom of Left Column) */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-[11px] font-mono tracking-wider pt-6 border-t border-[#122c38]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#2dd4bf]">30 M</span>
                <span className="text-[#557c8d]">TERRAIN BASIS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#2dd4bf]">GEOJSON</span>
                <span className="text-[#557c8d]">SPATIAL OUTPUTS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#2dd4bf]">HADR</span>
                <span className="text-[#557c8d]">IMPACT LAYER</span>
              </div>
            </div>
          </div>

          {/* Right Column: Tactical Operational GIS View */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Top kicker label */}
            <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#4d7888] mb-2.5 uppercase text-left">
              LOCAL GIS / OPERATIONAL VIEW
            </div>

            {/* HUD Card Frame (With subtle tactical tilt) */}
            <div 
              className="bg-[#091720]/95 backdrop-blur-xl border border-[#1a3c4e] rounded-xl p-3 sm:p-4 shadow-[0_12px_45px_rgba(0,0,0,0.6)] relative overflow-hidden"
              style={{ transform: 'perspective(1200px) rotateY(-1.2deg) rotateX(0.8deg)' }}
            >
              {/* Card Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#142e3b] text-xs font-mono mb-3">
                <span className="text-[#8cb0c0] font-medium tracking-wider text-[11px]">
                  FRAMEWORK / SCN-2488-17
                </span>
                <span className="bg-[#241a0e] text-[#f59e0b] border border-[#78350f]/70 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  DEMO DATA
                </span>
              </div>

              {/* Live Interactive GIS Map Box */}
              <div className="relative w-full h-[360px] sm:h-[400px] rounded-lg overflow-hidden border border-[#163544] bg-[#061218]">
                
                {/* Floating Chip Top-Left */}
                <div className="absolute top-3 left-3 z-[1000] bg-[#091720]/95 backdrop-blur-md border border-[#18394a] rounded px-3 py-2 text-left pointer-events-none shadow-xl">
                  <div className="text-[11px] font-bold text-white tracking-wider">
                    SATARA / MAHARASHTRA
                  </div>
                  <div className="text-[9px] font-mono text-[#2dd4bf]/90 tracking-wider">
                    SCN-2488-17 • DEMO DATA • OSM BASE
                  </div>
                </div>

                {/* Floating Chip Top-Right */}
                <div className="absolute top-3 right-12 z-[1000] bg-[#091720]/95 backdrop-blur-md border border-[#18394a] rounded px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-mono text-[#94a3b8] pointer-events-none shadow-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  spatial layer rendered locally
                </div>

                {/* Tactical Custom Controls */}
                <div className="absolute top-12 right-3 z-[1000] flex flex-col gap-1">
                  <button 
                    type="button"
                    onClick={() => mapInstance?.zoomIn()}
                    className="w-7 h-7 rounded bg-[#091720]/95 hover:bg-[#122e3e] border border-[#1b3e50] text-slate-200 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shadow-md"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button 
                    type="button"
                    onClick={() => mapInstance?.zoomOut()}
                    className="w-7 h-7 rounded bg-[#091720]/95 hover:bg-[#122e3e] border border-[#1b3e50] text-slate-200 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shadow-md"
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <button 
                    type="button"
                    onClick={() => mapInstance?.setView(mapCenter, 11)}
                    className="w-7 h-7 rounded bg-[#091720]/95 hover:bg-[#122e3e] border border-[#1b3e50] text-slate-200 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-md"
                    title="Reset Tactical Center"
                  >
                    <Navigation size={12} className="rotate-45 text-[#2dd4bf]" />
                  </button>
                </div>

                {/* Floating Map Legend (Bottom-Left) */}
                <div className="absolute bottom-3 left-3 z-[1000] bg-[#08151d]/95 backdrop-blur-md border border-[#163342] rounded-md p-2.5 text-left shadow-2xl pointer-events-none">
                  <div className="text-[9px] font-mono font-bold text-[#648496] tracking-wider uppercase mb-1.5">
                    MAP LEGEND
                  </div>
                  <div className="flex flex-col gap-1.5 text-[10px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-2 rounded-[2px] bg-[#2dd4bf]/40 border border-[#2dd4bf]"></span>
                      <span>DEMO inundation extent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-0.5 bg-[#f97316]"></span>
                      <span>route / breach axis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
                      <span>settlement / facility</span>
                    </div>
                  </div>
                </div>

                {/* Leaflet Map */}
                <MapContainer
                  center={mapCenter}
                  zoom={11}
                  zoomControl={false}
                  attributionControl={true}
                  className="w-full h-full"
                  style={{ background: '#08141b' }}
                >
                  <MapStateBridge onMapReady={setMapInstance} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    maxZoom={18}
                  />

                  {/* Shaded Inundation Extent Polygon */}
                  <Polygon
                    positions={floodInundationPolygon}
                    pathOptions={{
                      color: '#2dd4bf',
                      weight: 1.5,
                      fillColor: '#2dd4bf',
                      fillOpacity: 0.35,
                      dashArray: '2, 4'
                    }}
                  >
                    <Tooltip sticky className="tactical-tooltip">
                      <span className="text-[10px] font-mono">DEMO Inundation Extent (42.8 km²)</span>
                    </Tooltip>
                  </Polygon>

                  {/* Route / Breach Axis Polyline */}
                  <Polyline
                    positions={breachAxisRoute}
                    pathOptions={{
                      color: '#f97316',
                      weight: 2.8,
                      opacity: 0.95
                    }}
                  />

                  {/* Settlement Points */}
                  {settlements.map((s, idx) => (
                    <CircleMarker
                      key={idx}
                      center={s.pos}
                      radius={s.isKey ? 6 : 4}
                      pathOptions={{
                        color: '#f97316',
                        fillColor: s.isKey ? '#fb923c' : '#ea580c',
                        fillOpacity: 1,
                        weight: 2
                      }}
                    >
                      <Tooltip permanent direction="top" offset={[0, -8]} className="settlement-marker-label">
                        <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_black]">
                          {s.name}
                        </span>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>

              {/* Bottom 3 Metrics Row */}
              <div className="grid grid-cols-3 gap-4 pt-4 px-2">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    42.8
                  </div>
                  <div className="text-[11px] font-mono text-[#587e90] mt-0.5">
                    km² flood extent
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    18,420
                  </div>
                  <div className="text-[11px] font-mono text-[#587e90] mt-0.5">
                    population exposed
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    +04:00
                  </div>
                  <div className="text-[11px] font-mono text-[#587e90] mt-0.5">
                    peak arrival window
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* WORKFLOW PIPELINE TRACK */}
      <section id="workflow" className="px-6 lg:px-12 py-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="border-t border-[#142e3b] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              { num: '01', title: 'Data', sub: 'Ground the scenario', link: '/data-sources' },
              { num: '02', title: 'Simulation', sub: 'Test the breach', link: '/simulation' },
              { num: '03', title: 'Inundation', sub: 'See water move', link: '/flood-map' },
              { num: '04', title: 'Validation', sub: 'Name the gap', link: '/validation' },
              { num: '05', title: 'Impact', sub: 'Prioritise action', link: '/impact-analysis' },
            ].map((step, idx) => (
              <Link
                key={idx}
                to={step.link}
                className="group border-l border-[#163544] pl-4 hover:border-[#2dd4bf] transition-all"
              >
                <div className="text-[11px] font-mono text-[#587e90] group-hover:text-[#2dd4bf] mb-1 transition-colors">
                  {step.num}
                </div>
                <div className="text-base font-bold text-white group-hover:text-[#2dd4bf] transition-colors">
                  {step.title}
                </div>
                <div className="text-xs text-[#7d9eaf] mt-0.5">
                  {step.sub}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE DIRECTION SECTION */}
      <section id="architecture" className="px-6 lg:px-12 py-16 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Narrative */}
          <div className="lg:col-span-5">
            <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#f97316] mb-4 uppercase">
              ARCHITECTURE DIRECTION
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-snug mb-5">
              Every layer earns its place in the decision.
            </h2>
            <p className="text-[#7d9eaf] text-sm sm:text-[15px] leading-relaxed max-w-md">
              Built around a swappable FastAPI service boundary. The interface keeps source provenance, model assumptions and prototype limitations beside the result instead of hiding them in a settings menu.
            </p>
          </div>

          {/* Right 2x2 Grid of Principles */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="border-t border-[#1b3d4f] pt-4">
              <h3 className="text-[#2dd4bf] font-semibold text-base mb-1.5">
                Evidence in frame
              </h3>
              <p className="text-xs sm:text-[13px] text-[#7d9eaf] leading-relaxed">
                DEM, rainfall and network sources stay attached to the scenario that used them.
              </p>
            </div>

            <div className="border-t border-[#1b3d4f] pt-4">
              <h3 className="text-[#2dd4bf] font-semibold text-base mb-1.5">
                Spatial by default
              </h3>
              <p className="text-xs sm:text-[13px] text-[#7d9eaf] leading-relaxed">
                Map-first views make flood extent and exposed corridors legible before charts.
              </p>
            </div>

            <div className="border-t border-[#1b3d4f] pt-4">
              <h3 className="text-[#2dd4bf] font-semibold text-base mb-1.5">
                Authentic Telemetry
              </h3>
              <p className="text-xs sm:text-[13px] text-[#7d9eaf] leading-relaxed">
                Hydrodynamic simulation metrics and GIS contours stream directly from local DualSPHysics and Delft3D engines.
              </p>
            </div>

            <div className="border-t border-[#1b3d4f] pt-4">
              <h3 className="text-[#2dd4bf] font-semibold text-base mb-1.5">
                Dual-Solver Kernel
              </h3>
              <p className="text-xs sm:text-[13px] text-[#7d9eaf] leading-relaxed">
                FastAPI backend couples 3D SPH fluid dynamics with regional 2D shallow-water equations in real time.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* OPERATIONAL STATUS CALLOUT */}
      <section id="operational-status" className="px-6 lg:px-12 py-10 max-w-7xl mx-auto w-full relative z-10">
        <div className="bg-[#0e212b]/80 border border-[#1b3e50] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl backdrop-blur-md">
          <div className="max-w-2xl">
            <h4 className="text-base sm:text-lg font-bold text-[#2dd4bf] mb-1.5">
              Live Core Status: Coupled Hydrodynamic Simulation Core Active
            </h4>
            <p className="text-xs sm:text-sm text-[#7397a7] leading-relaxed">
              DualSPHysics 3D GPU SPH engine, Delft3D 2D SWE model, and Google Earth Engine Sentinel-1 SAR telemetry integrated on port 8080.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-cyan-950/40"
          >
            <span>Enter Tactical Dashboard</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 text-center border-t border-[#122c38]/70 bg-[#061217]/90 text-[11px] font-mono text-[#4a7283]">
        JalRakshak • designed for district resilience teams • frontend prototype / 2024
      </footer>

    </div>
  );
}

