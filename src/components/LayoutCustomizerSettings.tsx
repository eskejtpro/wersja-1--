import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Type, 
  Monitor, 
  Sliders, 
  LayoutGrid, 
  Check, 
  Sparkles,
  Maximize2,
  Minimize2,
  Laptop,
  Tv,
  Smartphone,
  Calendar,
  TrendingUp,
  Activity,
  Scale,
  Syringe,
  Dumbbell,
  Code2,
  Settings as SettingsIcon,
  User
} from 'lucide-react';
import { AppSettings } from '../types';

interface LayoutCustomizerSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  isDark?: boolean;
}

export const ALL_NAV_MODULES = [
  { id: 'plan', label: 'Plan Treningowy & Rejestr', icon: Calendar, description: 'Dziennik serii, powtórzeń i ciężarów' },
  { id: 'stats', label: 'Progres & Wykresy 1RM', icon: TrendingUp, description: 'Wykresy siły, tonażu i rekordy PR' },
  { id: 'muscle', label: 'Analiza Partii Mięśniowych', icon: Activity, description: 'Balans objętości i zaangażowanie partii' },
  { id: 'weight', label: 'Dziennik Wagi & Obwodów', icon: Scale, description: 'Pomiary sylwetki i średnie kroczące' },
  { id: 'cycles', label: 'Kalendarz', icon: Syringe, description: 'Kalendarz iniekcji i kalkulator stężeń' },
  { id: 'exercises', label: 'Katalog & Baza Ćwiczeń', icon: Dumbbell, description: 'Słownik wzorcowy szablonów ćwiczeń' },
  { id: 'python', label: 'Skrypty Python & Windows EXE', icon: Code2, description: 'Kod źródłowy i pliki wsadowe .BAT' },
  { id: 'profile', label: 'Centrum Synchronizacji & Badania', icon: User, description: 'Badania krwi i połączenie Windows ↔ Android' },
  { id: 'settings', label: 'Ustawienia & Auto-Backup', icon: SettingsIcon, description: 'Konfiguracja kopii i parametrów bazy' },
];

export const LayoutCustomizerSettings: React.FC<LayoutCustomizerSettingsProps> = ({
  settings,
  onUpdateSettings,
  isDark = true
}) => {
  const currentNavOrder = settings.navOrder || ALL_NAV_MODULES.map((m) => m.id);
  const hiddenItems = new Set(settings.hiddenNavItems || []);

  // Ordered list of modules based on current settings
  const orderedModules = currentNavOrder
    .map((id) => ALL_NAV_MODULES.find((m) => m.id === id))
    .filter(Boolean) as typeof ALL_NAV_MODULES;

  // Add any missing modules that might not be in navOrder
  ALL_NAV_MODULES.forEach((m) => {
    if (!orderedModules.some((om) => om.id === m.id)) {
      orderedModules.push(m);
    }
  });

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newOrder = [...orderedModules.map((m) => m.id)];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    onUpdateSettings({ navOrder: newOrder });
  };

  const handleMoveDown = (index: number) => {
    if (index >= orderedModules.length - 1) return;
    const newOrder = [...orderedModules.map((m) => m.id)];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    onUpdateSettings({ navOrder: newOrder });
  };

  const handleToggleVisibility = (id: string) => {
    const updated = new Set(hiddenItems);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      // Prevent hiding both plan and settings (must have at least one way to navigate)
      if (id === 'plan' && updated.has('settings')) return;
      if (id === 'settings' && updated.has('plan')) return;
      updated.add(id);
    }
    onUpdateSettings({ hiddenNavItems: Array.from(updated) });
  };

  const handleApplyPreset = (preset: 'default' | 'simple' | 'analytics' | 'windows') => {
    if (preset === 'default') {
      onUpdateSettings({
        navOrder: ALL_NAV_MODULES.map((m) => m.id),
        hiddenNavItems: []
      });
    } else if (preset === 'simple') {
      onUpdateSettings({
        navOrder: ['plan', 'weight', 'stats', 'exercises', 'settings', 'profile', 'muscle', 'cycles', 'python'],
        hiddenNavItems: ['cycles', 'python', 'muscle']
      });
    } else if (preset === 'analytics') {
      onUpdateSettings({
        navOrder: ['stats', 'muscle', 'plan', 'weight', 'exercises', 'settings', 'cycles', 'python', 'profile'],
        hiddenNavItems: ['python']
      });
    } else if (preset === 'windows') {
      onUpdateSettings({
        navOrder: ['plan', 'python', 'stats', 'exercises', 'weight', 'settings', 'profile', 'muscle', 'cycles'],
        hiddenNavItems: []
      });
    }
  };

  const currentFontSize = settings.fontSizeScale || 100;
  const currentFontFamily = settings.fontFamilyChoice || 'sans';
  const currentContrast = settings.fontContrast || 'standard';
  const currentViewport = settings.windowsViewportMode || 'responsive';

  return (
    <div className="space-y-6">
      {/* 1. Zarządzanie Układem & Kolejnością Funkcji */}
      <div className={`p-5 rounded-xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Dostosowanie Układu i Kolejności Funkcji (Przesuwanie &amp; Ukrywanie)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Przesuwaj moduły w górę lub w dół, aby zmienić ich pozycję w menu bocznym. Ukrywaj rzadziej używane funkcje.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleApplyPreset('default')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Przywróć standardowy układ wszystkich modułów"
            >
              Domyślny Pełny
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('simple')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-800/80 transition-colors cursor-pointer"
              title="Tylko trening, waga i baza ćwiczeń"
            >
              Prosty (Trening + Waga)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('analytics')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Wykresy i analityka na początku menu"
            >
              Analityczny
            </button>
          </div>
        </div>

        {/* Modules Reorder and Visibility List */}
        <div className="space-y-2">
          {orderedModules.map((module, index) => {
            const isHidden = hiddenItems.has(module.id);
            const ModuleIcon = module.icon;

            return (
              <div
                key={module.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isHidden
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-500 font-mono text-xs w-6">
                    #{index + 1}
                  </div>
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isHidden ? 'bg-slate-900 text-slate-500' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    <ModuleIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isHidden ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {module.label}
                      </span>
                      {isHidden ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950/60 text-red-400 border border-red-800/60 font-semibold">
                          Ukryte
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold">
                          Widoczne
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{module.description}</p>
                  </div>
                </div>

                {/* Actions: Move Up, Move Down, Toggle Visibility */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      index === 0
                        ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer'
                    }`}
                    title="Przesuń wyżej"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === orderedModules.length - 1}
                    onClick={() => handleMoveDown(index)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      index === orderedModules.length - 1
                        ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer'
                    }`}
                    title="Przesuń niżej"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(module.id)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isHidden
                        ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-red-300 hover:bg-red-950/40'
                    }`}
                    title={isHidden ? 'Pokaż tę funkcję w menu' : 'Schowaj tę funkcję z menu'}
                  >
                    {isHidden ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    <span className="hidden sm:inline">{isHidden ? 'Pokaż' : 'Schowaj'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Edycja Czcionki (Zwiększ / Zmniejsz / Krój / Kontrast) */}
      <div className={`p-5 rounded-xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Edycja Czcionki &amp; Typografii (Rozmiar, Krój, Kontrast)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Płynne dopasowanie wielkości tekstu, krojów pisma Windows oraz kontrastu dla maksymalnej czytelności na każdym monitorze.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onUpdateSettings({
              fontSizeScale: 100,
              fontFamilyChoice: 'sans',
              fontContrast: 'standard',
              uiDensity: 'standard'
            })}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetuj czcionkę</span>
          </button>
        </div>

        {/* Font Size Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Skala Rozmiaru Czcionki</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                {currentFontSize}%
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="80"
              max="150"
              step="5"
              value={currentFontSize}
              onChange={(e) => onUpdateSettings({ fontSizeScale: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              id="slider-font-size-scale"
            />

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: '85% (Kompaktowa)', val: 85 },
                { label: '100% (Standard)', val: 100 },
                { label: '115% (Powiększona)', val: 115 },
                { label: '130% (Duża)', val: 130 },
                { label: '145% (Bardzo duża)', val: 145 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => onUpdateSettings({ fontSizeScale: preset.val })}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    currentFontSize === preset.val
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family & Contrast */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-emerald-400" />
              <span>Krój Pisma &amp; Styl</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontFamilyChoice: 'sans' })}
                className={`p-2 rounded-lg border text-left font-sans transition-all cursor-pointer ${
                  currentFontFamily === 'sans'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-xs">Nowoczesny Sans</div>
                <div className="text-[10px] text-slate-500">Inter / System UI</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ fontFamilyChoice: 'segoe' })}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  currentFontFamily === 'segoe'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-xs">Windows Segoe UI</div>
                <div className="text-[10px] text-slate-500">Natywny styl Windows 10/11</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ fontFamilyChoice: 'mono' })}
                className={`p-2 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                  currentFontFamily === 'mono'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-xs">Techniczny Monospace</div>
                <div className="text-[10px] text-slate-500">Cascadia / JetBrains</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ fontFamilyChoice: 'condensed' })}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  currentFontFamily === 'condensed'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-xs">Zwięzły (Condensed)</div>
                <div className="text-[10px] text-slate-500">Maksymalna gęstość danych</div>
              </button>
            </div>

            {/* Contrast Options */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Kontrast:</span>
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontContrast: 'standard' })}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  currentContrast === 'standard' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                Standardowy
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontContrast: 'high_contrast' })}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  currentContrast === 'high_contrast' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                Wysoki Kontrast
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontContrast: 'bold_headings' })}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  currentContrast === 'bold_headings' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                Pogrubione Nagłówki
              </button>
            </div>
          </div>
        </div>

        {/* Live Font Preview Card */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Podgląd Na Żywo Wybranej Czcionki &amp; Rozmiaru:</span>
          </div>
          <div 
            className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 transition-all space-y-1"
            style={{ fontSize: `${(currentFontSize / 100) * 14}px` }}
          >
            <div className="font-extrabold text-slate-100 flex items-center justify-between">
              <span>Wyciskanie sztangi leżąc • Seria #1: 100 kg × 8 powt. (RPE 8.5)</span>
              <span className="text-emerald-400 font-mono font-bold">1RM: 126.7 kg</span>
            </div>
            <p className="text-slate-400 text-[0.9em]">
              Zrealizowano pełen zakres ruchu z 1-sekundową pauzą na klatce piersiowej. Wzrost siły +2.5 kg względem poprzedniego tygodnia.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Przygotowanie Rozmiaru Ekranu pod Windows (Viewport & Frame) */}
      <div className={`p-5 rounded-xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Format Ekranu &amp; Optymalizacja pod Windows 10/11
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dostosuj szerokość interfejsu do natywnej rozdzielczości Twojego monitora PC/Laptopa lub włącz symulację okna Windows.
            </p>
          </div>
        </div>

        {/* Viewport Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {[
            { id: 'responsive', label: '100% Pełny Ekran (Responsywny)', desc: 'Dopasowuje się automatycznie do okna', icon: Maximize2 },
            { id: 'fhd_1080p', label: 'Windows Full HD (1920 × 1080)', desc: 'Standardowy format monitorów desktop', icon: Tv },
            { id: 'laptop_768p', label: 'Windows Laptop (1366 × 768)', desc: 'Zoptymalizowany dla ekranów laptopów', icon: Laptop },
            { id: 'wqhd_1440p', label: 'Windows WQHD / 2K (2560 × 1440)', desc: 'Wysoka rozdzielczość i monitory 27-32"', icon: Tv },
            { id: 'classic_1280x800', label: 'Klasyczny Windows (1280 × 800)', desc: 'Format kompaktowy i tablety Windows', icon: Laptop },
          ].map((vp) => {
            const VpIcon = vp.icon;
            const isSelected = currentViewport === vp.id;

            return (
              <button
                key={vp.id}
                type="button"
                onClick={() => onUpdateSettings({ windowsViewportMode: vp.id as any })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500/50 shadow-xs'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                    <VpIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{vp.label}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">{vp.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Windows Frame Simulation Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>Natywna Belka Okna Windows 10/11 (Pasek Tytułowy)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Wyświetla u góry ekranu klasyczny pasek tytułowy okna aplikacji Windows z przyciskami Minimalizuj, Maksymalizuj i Zamknij.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
            <input
              type="checkbox"
              checked={settings.windowsShowDesktopFrame === true}
              onChange={(e) => onUpdateSettings({ windowsShowDesktopFrame: e.target.checked })}
              className="accent-emerald-500 cursor-pointer w-4 h-4"
              id="chk-windows-frame-simulation"
            />
            <span className="text-xs font-semibold text-slate-300">Pokaż Belkę Okna</span>
          </label>
        </div>
      </div>
    </div>
  );
};
