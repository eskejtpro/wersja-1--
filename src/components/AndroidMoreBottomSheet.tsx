import React from 'react';
import { 
  Dumbbell, 
  UserCheck, 
  Settings, 
  RefreshCw, 
  Moon, 
  Sun, 
  X, 
  Scale, 
  Activity, 
  FileText, 
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types';

interface AndroidMoreBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  profile?: UserProfile;
}

export const AndroidMoreBottomSheet: React.FC<AndroidMoreBottomSheetProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  settings,
  onUpdateSettings,
  profile
}) => {
  if (!isOpen) return null;

  const isDark = settings.theme === 'dark';
  const athleteName = profile?.name || settings.athleteName || 'Zawodnik';

  const menuSections = [
    {
      title: 'Baza i Narzędzia',
      items: [
        {
          id: 'exercises',
          label: 'Katalog & Baza Wzorcowa Ćwiczeń',
          description: 'Słownik ćwiczeń, wzorce techniczne i warianty',
          icon: Dumbbell,
          badge: 'Baza'
        },
        {
          id: 'muscle',
          label: 'Rozkład Partii Mięśniowych',
          description: 'Analiza objętości serii na poszczególne mięśnie',
          icon: Activity
        }
      ]
    },
    {
      title: 'Profil & Dane Zdrowotne',
      items: [
        {
          id: 'profile',
          label: 'Centrum Badań & Synchronizacja',
          description: 'Rejestr wyników krwi, profil i synchronizacja',
          icon: UserCheck
        }
      ]
    },
    {
      title: 'Aplikacja & System',
      items: [
        {
          id: 'settings',
          label: 'Ustawienia & Kopie JSON',
          description: 'Auto-backup, import/eksport i diagnostyka',
          icon: Settings
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden animate-fadeIn select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Material 3 Bottom Sheet Container */}
      <div 
        className={`relative z-10 w-full max-h-[85vh] rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden pb-[max(1rem,env(safe-area-inset-bottom))] animate-slideUp ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* M3 Drag Handle */}
        <div className="flex flex-col items-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-slate-500/40" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              {athleteName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{athleteName}</h3>
              <p className="text-[11px] text-slate-400">PlanPasika v3.0 • Xiaomi 14T</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Szybki przełącznik motywu */}
            <button
              type="button"
              onClick={() => onUpdateSettings({ theme: isDark ? 'light' : 'dark' })}
              className={`p-2 rounded-xl border transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-amber-400' 
                  : 'bg-slate-100 border-slate-200 text-indigo-600'
              }`}
              title="Zmień motyw"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Zamknij */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Zamknij menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Sheet Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      id={`bottom-sheet-item-${item.id}`}
                      onClick={() => {
                        onSelectView(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all cursor-pointer min-h-[52px] ${
                        isActive
                          ? isDark
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold'
                            : 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold'
                          : isDark
                            ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-transparent'
                            : 'bg-slate-100/70 hover:bg-slate-100 text-slate-800 border border-transparent'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        isActive
                          ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-600 text-white'
                          : isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600 shadow-xs'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
