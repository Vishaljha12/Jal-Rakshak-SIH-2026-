import { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
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
  Bell,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function MainLayout() {
  const location = useLocation();

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
      case '/settings': return 'Settings & Preferences';
      case '/admin': return 'Admin Diagnostics';
      default: return 'Command center';
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f7fc] dark:bg-[#080d16] text-slate-800 dark:text-slate-100 overflow-hidden font-sans select-none tactical-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-white/95 dark:bg-[#0c1422] border-r border-sky-100/90 dark:border-slate-800/80 flex flex-col z-30 shrink-0 shadow-xs">
        {/* Brand Header */}
        <div className="p-4 border-b border-sky-100/80 dark:border-slate-800/70">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer" title="Go to JalRakshak Homepage">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6c3-1.8 6 1.8 9 0s6-1.8 9 0" />
                <path d="M2 12c3-1.8 6 1.8 9 0s6-1.8 9 0" />
                <path d="M2 18c3-1.8 6 1.8 9 0s6-1.8 9 0" />
              </svg>
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                JalRakshak
              </div>
              <p className="text-[9px] tracking-wider font-mono uppercase text-slate-400 dark:text-slate-500 font-semibold">
                HYDRODYNAMIC / HADR
              </p>
            </div>
          </Link>
        </div>

        {/* District Operations Console Pill */}
        <div className="mx-3.5 my-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#09101c] border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-[11px] truncate">District Operations</span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">v1.0</span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 pb-3 space-y-4 overflow-y-auto">
          {navigationSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 py-1 text-[9.5px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 text-xs ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 font-semibold border border-emerald-500/20 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon size={16} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'} />
                      <span className="tracking-tight text-[12.5px]">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[8.5px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-14 bg-white/80 dark:bg-[#0c1422]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center px-6 shrink-0 justify-between z-20 shadow-xs">
          {/* Breadcrumbs on Left */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link to="/" className="font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer" title="Go to JalRakshak Homepage">
              JalRakshak
            </Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Operations</span>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-slate-900 dark:text-white font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]">
              {getBreadcrumbName()}
            </span>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2.5">
            {/* Core Port Badge */}
            <div className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">8080</span>
            </div>

            {/* Theme Toggle Pill */}
            <ThemeToggle variant="pill" />

            {/* Quick Utility Icon Buttons */}
            <button 
              onClick={() => alert("Notification Center: All Indian Dam hydrodynamic meshes and Sentinel-1 SAR links nominal.")}
              title="System Notifications"
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Bell size={14} />
            </button>

            <button 
              onClick={() => alert("JalRakshak Hydrodynamic Decision Support System. Documentation & API specs available via /admin.")}
              title="Documentation & Information"
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <HelpCircle size={14} />
            </button>
          </div>
        </header>

        {/* Main Outlet */}
        <main className="flex-1 overflow-auto bg-gradient-to-b from-[#f0f7fc] via-[#eaf4fb] to-[#f4f9fd] dark:bg-[#080d16] relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
