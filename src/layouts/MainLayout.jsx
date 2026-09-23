import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Gauge,
  PlayCircle,
  Activity,
  Waves,
  Layers,
  Crosshair,
  ShieldAlert,
  Database,
  FileText,
  Settings as SettingsIcon,
  Terminal,
  ShieldCheck,
  Bell,
  HelpCircle,
  User,
  Sliders
} from 'lucide-react';
import JudgeVerificationModal from '../components/analytics/JudgeVerificationModal';

export default function MainLayout() {
  const location = useLocation();
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);

  // Tactical navigation structure
  const navigationSections = [
    {
      title: 'CONTROL ROOM',
      items: [
        { name: 'Command center', path: '/dashboard', icon: Gauge },
        { name: 'Simulation core', path: '/simulation', icon: PlayCircle },
        { name: 'DualSPHysics (3D SPH)', path: '/dualsphysics', icon: Waves },
        { name: 'Delft3D (2D SWE)', path: '/delft3d', icon: Activity },
      ]
    },
    {
      title: 'EVIDENCE & IMPACT',
      items: [
        { name: 'Compare models', path: '/solver-comparison', icon: Layers },
        { name: 'Satellite validation', path: '/validation', icon: Crosshair },
        { name: 'HADR impact', path: '/impact-analysis', icon: ShieldAlert },
      ]
    },
    {
      title: 'WORKSPACE',
      items: [
        { name: 'Dataset registry', path: '/data-sources', icon: Database },
        { name: 'Reports & GIS export', path: '/flood-map', icon: FileText },
        { name: 'Admin diagnostics', path: '/admin', icon: Terminal, badge: 'CORE' },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
      ]
    }
  ];

  // Derive breadcrumb from current path
  const getBreadcrumbName = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Command center';
      case '/simulation': return 'Dam-Break Simulation Core';
      case '/dualsphysics': return 'DualSPHysics (3D SPH)';
      case '/delft3d': return 'Delft3D Companion';
      case '/solver-comparison': return 'Model Benchmark & Comparison';
      case '/validation': return 'Sentinel-1 SAR Satellite Validation';
      case '/impact-analysis': return 'HADR Impact & Evacuation';
      case '/data-sources': return 'Dataset Registry & GEE';
      case '/flood-map': return 'Reports & GIS Export';
      case '/scenarios': return 'Scenario Laboratory';
      case '/settings': return 'Settings';
      case '/admin': return 'Admin Diagnostics & Provenance';
      default: return 'Command center';
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#070c12] text-[#d1dce5] overflow-hidden font-sans select-none tactical-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-[#09121a] border-r border-[#142533] flex flex-col z-30 shrink-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#142533]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0e1d28] border border-[#1b394e] flex items-center justify-center text-emerald-400 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6c3-1.8 6 1.8 9 0s6-1.8 9 0" />
                <path d="M2 12c3-1.8 6 1.8 9 0s6-1.8 9 0" />
                <path d="M2 18c3-1.8 6 1.8 9 0s6-1.8 9 0" />
              </svg>
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white leading-tight">
                JalRakshak
              </div>
              <p className="text-[8.5px] tracking-widest font-mono uppercase text-[#527d91] font-semibold">
                HYDRODYNAMIC / HADR
              </p>
            </div>
          </div>
        </div>

        {/* District Operations Console Pill */}
        <div className="mx-3.5 my-3 px-3 py-2 rounded-lg bg-[#0b1620] border border-[#142836] flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-[#7f9fae]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="truncate">District Operations</span>
          </div>
          <span className="text-emerald-400 font-bold text-[9.5px]">v1.0</span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-2.5 pb-3 space-y-4 overflow-y-auto">
          {navigationSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              <div className="px-3 py-1.5 text-[9.5px] uppercase font-mono tracking-widest text-[#416272] font-bold">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                      isActive
                        ? 'bg-[#0e212b] text-emerald-400 border border-[#16384a]'
                        : 'text-[#819ca9] hover:bg-[#0c1a24] hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon size={15} className={isActive ? 'text-emerald-400' : 'text-[#567a8b] group-hover:text-emerald-400'} />
                      <span className="tracking-wide text-[12.5px]">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.2 text-[8.5px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Direct Judge Verification Bottom Shortcut */}
        <div className="p-3 border-t border-[#142533]">
          <button
            onClick={() => setIsJudgeModalOpen(true)}
            className="w-full py-2 px-3 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Verify Model (Judges)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-12 bg-[#070c12] border-b border-[#142533] flex items-center px-6 shrink-0 justify-between z-20">
          {/* Breadcrumbs on Left */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#54798b] tracking-wider uppercase">
            <span>JALRAKSHAK</span>
            <span>/</span>
            <span>OPS</span>
            <span>/</span>
            <span className="text-[#a4bcc8] font-bold">{getBreadcrumbName()}</span>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-3">
            {/* Direct Judge Verification Top Button */}
            <button
              onClick={() => setIsJudgeModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>JUDGES VERIFICATION</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0b1822] border border-[#153444] text-[10px] font-mono text-[#76a0b2]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="tracking-wider uppercase font-semibold text-emerald-400">CORE : 8080</span>
            </div>

            <button 
              onClick={() => setIsJudgeModalOpen(true)}
              title="Differential Physics & Model Proof"
              className="w-7 h-7 rounded-lg bg-[#0a151e] hover:bg-[#0f212c] border border-[#142836] text-[#6b92a5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Sliders size={13} />
            </button>

            <button 
              onClick={() => alert("Notification Center: All 8 Indian Dam hydrodynamic meshes and Sentinel-1 SAR links nominal.")}
              title="System Notifications"
              className="w-7 h-7 rounded-lg bg-[#0a151e] hover:bg-[#0f212c] border border-[#142836] text-[#6b92a5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Bell size={13} />
            </button>

            <button 
              onClick={() => setIsJudgeModalOpen(true)}
              title="Evaluator Documentation & FAQ"
              className="w-7 h-7 rounded-lg bg-[#0a151e] hover:bg-[#0f212c] border border-[#142836] text-[#6b92a5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <HelpCircle size={13} />
            </button>
          </div>
        </header>

        {/* Main Outlet */}
        <main className="flex-1 overflow-auto bg-[#070c12] relative">
          <Outlet />
        </main>
      </div>

      {/* Embedded Judge Verification Modal */}
      <JudgeVerificationModal 
        isOpen={isJudgeModalOpen} 
        onClose={() => setIsJudgeModalOpen(false)} 
      />
    </div>
  );
}
