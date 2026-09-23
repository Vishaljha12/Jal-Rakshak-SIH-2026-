import { useState, useRef, useEffect } from 'react';
import { 
  Download, Globe, Layers, FileCode, Archive, Check, 
  Loader2, ChevronDown, AlertCircle 
} from 'lucide-react';
import { exportSimulatedGISData } from '../../services/gisExportService';

export default function GISExportMenu({ 
  jobId = 'default', 
  floodGeojson = null, 
  damName = 'Simulation',
  provenance = null,
  compact = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [notification, setNotification] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format, label) => {
    setExportingFormat(format);
    setNotification(null);
    try {
      const res = await exportSimulatedGISData({
        format,
        jobId,
        floodGeojson,
        damName,
        provenance: provenance || floodGeojson?.provenance
      });
      setNotification({
        type: 'success',
        message: `${label} exported successfully!`
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Export failed. Check backend connection.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setExportingFormat(null);
      setIsOpen(false);
    }
  };

  const exportOptions = [
    {
      format: 'shp',
      name: 'ESRI Shapefile (.shp)',
      desc: 'Zipped bundle (.shp, .shx, .dbf, .prj) for QGIS & ArcGIS',
      badge: 'NDMA Standard',
      icon: Layers,
      color: 'text-amber-400'
    },
    {
      format: 'kml',
      name: 'Google Earth KML (.kml)',
      desc: 'OGC KML 2.2 multi-tier flood inundation overlay',
      badge: 'Google Earth',
      icon: Globe,
      color: 'text-cyan-400'
    },
    {
      format: 'geojson',
      name: 'GeoJSON Vector (.geojson)',
      desc: 'Standard RFC 7946 spatial contours with depth attributes',
      badge: 'Web GIS',
      icon: FileCode,
      color: 'text-teal-400'
    },
    {
      format: 'bundle',
      name: 'Complete GIS Archive (.zip)',
      desc: 'Full bundle: Shapefile + KML + GeoJSON + Tabular CSV',
      badge: 'Complete',
      icon: Archive,
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={exportingFormat !== null}
        className={`cursor-pointer transition-all flex items-center gap-2 font-bold shadow-lg ${
          compact
            ? 'px-2.5 py-1.5 rounded-lg bg-[#0d222e] hover:bg-[#123040] text-cyan-300 border border-cyan-500/30 text-xs'
            : 'px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 via-cyan-500/25 to-teal-500/20 hover:from-teal-500/30 hover:to-cyan-500/35 text-cyan-200 border border-cyan-400/40 text-xs backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]'
        }`}
        title="Export simulated inundation data in SHP, KML, GeoJSON"
      >
        {exportingFormat ? (
          <Loader2 size={compact ? 13 : 15} className="animate-spin text-cyan-400" />
        ) : (
          <Download size={compact ? 13 : 15} className="text-cyan-400" />
        )}
        <span>{exportingFormat ? 'Exporting...' : compact ? 'Export' : 'Export GIS Data'}</span>
        <ChevronDown size={12} className={`text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Notification Toast */}
      {notification && (
        <div 
          className={`absolute top-full mt-2 right-0 z-[1200] px-3 py-2 rounded-lg text-xs flex items-center gap-2 shadow-2xl border backdrop-blur-xl whitespace-nowrap animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-[#06201b]/95 text-emerald-300 border-emerald-500/40'
              : 'bg-[#290d12]/95 text-rose-300 border-rose-500/40'
          }`}
        >
          {notification.type === 'success' ? (
            <Check size={14} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={14} className="text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-[#091522]/98 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_15px_50px_rgba(0,0,0,0.8)] p-2 z-[1100] animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="px-3 py-2 border-b border-cyan-500/20 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
              <Layers size={11} />
              Export Simulated Vectors
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {jobId ? jobId.slice(0, 14) : 'active'}
            </span>
          </div>

          {/* Options List */}
          <div className="space-y-1">
            {exportOptions.map((opt) => {
              const Icon = opt.icon;
              const isCurrent = exportingFormat === opt.format;
              return (
                <button
                  key={opt.format}
                  type="button"
                  onClick={() => handleExport(opt.format, opt.name)}
                  disabled={exportingFormat !== null}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#0f2438] transition-all cursor-pointer flex items-start gap-3 group border border-transparent hover:border-cyan-500/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#06121e] border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all">
                    {isCurrent ? (
                      <Loader2 size={16} className="animate-spin text-cyan-400" />
                    ) : (
                      <Icon size={16} className={opt.color} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {opt.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-2 pt-2 border-t border-cyan-500/15 px-3 py-1 text-[9.5px] font-mono text-slate-500 text-center">
            All outputs include WGS-84 EPSG:4326 geospatial coordinates & depth tiers.
          </div>
        </div>
      )}
    </div>
  );
}
