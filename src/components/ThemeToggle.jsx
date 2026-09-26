import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ variant = 'pill', className = '' }) {
  const { theme, isLight, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            !isLight
              ? 'bg-slate-900 text-emerald-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
          title="Command Center Dark Mode"
        >
          <Moon size={13} className={!isLight ? 'text-emerald-400' : 'text-slate-400'} />
          <span>Tactical Night</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isLight
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Daylight Operations Light Mode"
        >
          <Sun size={13} className={isLight ? 'text-amber-500' : 'text-slate-400'} />
          <span>Daylight Ops</span>
        </button>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-2 h-9 px-3.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs select-none ${
          isLight
            ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 shadow-slate-200/50'
            : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
        } ${className}`}
        title={isLight ? 'Switch to Tactical Night Mode' : 'Switch to Daylight Operations (Light Mode)'}
      >
        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 ${isLight ? 'rotate-0' : 'rotate-180'}`}>
          {isLight ? (
            <Sun size={14} className="text-amber-500" />
          ) : (
            <Moon size={14} className="text-cyan-400" />
          )}
        </div>
        <span className="text-[11px] font-medium tracking-tight">
          {isLight ? 'Daylight Mode' : 'Night Mode'}
        </span>
      </button>
    );
  }

  // Default 'icon' variant
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
        isLight
          ? 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs'
          : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white'
      } ${className}`}
      title={isLight ? 'Switch to Tactical Night (Dark Mode)' : 'Switch to Daylight Operations (Light Mode)'}
      aria-label="Toggle theme"
    >
      {isLight ? (
        <Sun size={15} className="text-amber-500 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon size={15} className="text-cyan-400 transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
}
