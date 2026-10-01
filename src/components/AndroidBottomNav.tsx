import React from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Scale, 
  Syringe, 
  LayoutGrid
} from 'lucide-react';

interface AndroidBottomNavProps {
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenMoreSheet: () => void;
  isDark?: boolean;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeView,
  onSelectView,
  onOpenMoreSheet,
  isDark = true
}) => {
  const isMoreActive = ['exercises', 'profile', 'settings', 'muscle'].includes(activeView);

  const mainTabs = [
    { id: 'plan', label: 'Trening', icon: Calendar },
    { id: 'stats', label: 'Progres', icon: TrendingUp },
    { id: 'weight', label: 'Pomiary', icon: Scale },
    { id: 'cycles', label: 'Kalendarz', icon: Syringe }
  ];

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t backdrop-blur-xl select-none px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors ${
        isDark 
          ? 'bg-slate-950/95 border-slate-800/90 text-slate-200' 
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-xl'
      }`}
      id="android-bottom-nav-bar"
      aria-label="Dolna nawigacja aplikacji"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mainTabs.map((item) => {
          const Icon = item.icon;
          const isActive = !isMoreActive && (activeView === item.id || (item.id === 'weight' && activeView.startsWith('weight')));

          return (
            <button
              key={item.id}
              type="button"
              id={`android-tab-${item.id}`}
              onClick={() => onSelectView(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer min-h-[52px] ${
                isActive
                  ? isDark
                    ? 'text-emerald-400 font-bold'
                    : 'text-emerald-700 font-bold'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200 active:scale-95'
                    : 'text-slate-500 hover:text-slate-900 active:scale-95'
              }`}
            >
              <div className={`px-4 py-1 rounded-full transition-all flex items-center justify-center mb-0.5 ${
                isActive 
                  ? isDark 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-xs' 
                    : 'bg-emerald-100 text-emerald-800 shadow-xs'
                  : 'bg-transparent'
              }`}>
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className="text-[11px] font-semibold tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* 5th Tab: Więcej (Material 3 Bottom Sheet) */}
        <button
          type="button"
          id="android-tab-more"
          onClick={onOpenMoreSheet}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer min-h-[52px] ${
            isMoreActive
              ? isDark
                ? 'text-emerald-400 font-bold'
                : 'text-emerald-700 font-bold'
              : isDark
                ? 'text-slate-400 hover:text-slate-200 active:scale-95'
                : 'text-slate-500 hover:text-slate-900 active:scale-95'
          }`}
          title="Więcej opcji"
        >
          <div className={`px-4 py-1 rounded-full transition-all flex items-center justify-center mb-0.5 ${
            isMoreActive 
              ? isDark 
                ? 'bg-emerald-500/20 text-emerald-400 shadow-xs' 
                : 'bg-emerald-100 text-emerald-800 shadow-xs'
              : 'bg-transparent'
          }`}>
            <LayoutGrid className={`w-5 h-5 transition-transform ${isMoreActive ? 'scale-110' : ''}`} />
          </div>
          <span className="text-[11px] font-semibold tracking-tight leading-none">Więcej</span>
        </button>
      </div>
    </nav>
  );
};
