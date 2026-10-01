import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Dumbbell, 
  Clock, 
  Scale, 
  Sparkles, 
  Activity, 
  Syringe, 
  Trophy, 
  FileText, 
  Layers, 
  Plus, 
  Minus, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Settings2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Sliders, 
  Droplet, 
  Flame, 
  Check, 
  TrendingUp, 
  X,
  Volume2,
  VolumeX,
  Send,
  Loader2
} from 'lucide-react';
import { 
  GymData, 
  AppSettings, 
  QuickAccessWidgetConfig, 
  QuickAccessWidgetId, 
  Exercise, 
  BodyWeightEntry 
} from '../types';
import { DEFAULT_QUICK_ACCESS_WIDGETS } from '../data/initialData';

interface QuickAccessDashboardProps {
  data: GymData;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onSelectView: (view: string) => void;
  onUpdateExerciseWeight: (weekId: string, dayId: string, exerciseId: string, weight: number) => void;
  onSaveExercisePerformance: (weekId: string, dayId: string, exerciseId: string, weight: number, sets: number, reps: number) => void;
  onAddBodyWeight: (entry: Omit<BodyWeightEntry, 'id'>) => void;
  unit: string;
}

export const QuickAccessDashboard: React.FC<QuickAccessDashboardProps> = ({
  data,
  onUpdateSettings,
  onSelectView,
  onSaveExercisePerformance,
  onAddBodyWeight,
  unit
}) => {
  const settings = data.settings;
  const isAmoled = settings.amoledBlack === true;
  const accentColor = settings.accentColor || 'emerald';
  const cardRadiusClass = settings.cardBorderRadius === 'sharp' ? 'rounded-xs' : settings.cardBorderRadius === 'pill' ? 'rounded-3xl' : 'rounded-2xl';

  // Active workout resolution
  const weeks = data.weeks || [];
  const currentWeek = weeks[0];
  const currentDay = currentWeek?.days.find(d => !d.completed) || currentWeek?.days[0];

  // Quick Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(90);
  const [timerRemaining, setTimerRemaining] = useState<number>(90);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerEndTimestamp, setTimerEndTimestamp] = useState<number | null>(null);

  // Quick Plate Calculator state
  const [plateCalcWeight, setPlateCalcWeight] = useState<number>(100);

  // Quick Water Hydration state (stored in localStorage)
  const [waterMl, setWaterMl] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gymtracker_water_today');
      return saved ? parseInt(saved, 10) : 1250;
    } catch {
      return 1250;
    }
  });

  // Quick Note state
  const [quickNote, setQuickNote] = useState<string>(() => {
    try {
      return localStorage.getItem('gymtracker_quick_note') || 'Pamiętać o rozgrzance stożka rotatorów i mocnym spięciu łopatek.';
    } catch {
      return '';
    }
  });
  const [quickNoteSaved, setQuickNoteSaved] = useState(false);

  // AI Mini Coach state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Quick Weight Input
  const latestWeightObj = data.bodyWeights?.[data.bodyWeights.length - 1];
  const [newWeightInput, setNewWeightInput] = useState<number>(latestWeightObj?.weight || 82.0);
  const [weightSavedSuccess, setWeightSavedSuccess] = useState(false);

  // Customizer Tray Modal
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const widgets: QuickAccessWidgetConfig[] = (settings.quickAccessWidgets && settings.quickAccessWidgets.length > 0)
    ? settings.quickAccessWidgets
    : DEFAULT_QUICK_ACCESS_WIDGETS;

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  // Timer Tick Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerEndTimestamp) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((timerEndTimestamp - Date.now()) / 1000));
        setTimerRemaining(remaining);
        if (remaining <= 0) {
          setIsTimerRunning(false);
          setTimerEndTimestamp(null);
          // Trigger browser vibration if supported
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      }, 250);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerEndTimestamp]);

  const handleStartTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerRemaining(seconds);
    setTimerEndTimestamp(Date.now() + seconds * 1000);
    setIsTimerRunning(true);
  };

  const handleToggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setTimerEndTimestamp(null);
    } else {
      setTimerEndTimestamp(Date.now() + timerRemaining * 1000);
      setIsTimerRunning(true);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerEndTimestamp(null);
    setTimerRemaining(timerSeconds);
  };

  const handleAddWater = (amount: number) => {
    const next = Math.max(0, waterMl + amount);
    setWaterMl(next);
    try {
      localStorage.setItem('gymtracker_water_today', next.toString());
    } catch {}
  };

  const handleSaveQuickNote = () => {
    try {
      localStorage.setItem('gymtracker_quick_note', quickNote);
      setQuickNoteSaved(true);
      setTimeout(() => setQuickNoteSaved(false), 2000);
    } catch {}
  };

  const handleSaveQuickWeight = () => {
    const today = new Date().toISOString().split('T')[0];
    onAddBodyWeight({ weight: newWeightInput, date: today, notes: 'Szybki pomiar z pulpitu' });
    setWeightSavedSuccess(true);
    setTimeout(() => setWeightSavedSuccess(false), 2000);
  };

  // Plate Calculator calculation (20kg bar)
  const calculatePlates = (targetWeight: number) => {
    const barWeight = 20;
    if (targetWeight <= barWeight) return [];
    let perSide = (targetWeight - barWeight) / 2;
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const used: { weight: number; count: number }[] = [];

    for (const p of availablePlates) {
      if (perSide >= p) {
        const count = Math.floor(perSide / p);
        used.push({ weight: p, count });
        perSide -= count * p;
      }
    }
    return used;
  };

  // Mini AI Coach submit
  const handleAskAiCoach = async (queryText?: string) => {
    const promptToSend = queryText || aiPrompt;
    if (!promptToSend.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    try {
      // Direct prompt generation
      const athleteName = data.profile?.name || 'Pasik';
      const prompt = `Jestem zawodnikiem siłowym ${athleteName}. Moje pytanie z pulpitu szybkiego dostępu: "${promptToSend}". Odpowiedz krótko, profesjonalnie i konkretnie (2-3 zdania).`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: [],
          persona: settings.aiAgentPersona || 'balanced'
        })
      });

      if (response.ok) {
        const json = await response.json();
        setAiResponse(json.reply || 'Zalecenie: Utrzymuj progresywne przeładowanie, kontroluj RPE i regenerację.');
      } else {
        setAiResponse('Wskazówka: Skup się na precyzyjnej trajektorii ruchu, 2 minutach przerwy i odpowiedniej retencji sodu.');
      }
    } catch (err) {
      setAiResponse('Wskazówka: Zwiększaj ciężar tylko przy poprawnym RPE poniżej 9. Zadbaj o 3g sodu w dni treningowe.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Widget management helpers
  const handleToggleWidget = (widgetId: string) => {
    const updated = widgets.map(w => w.id === widgetId ? { ...w, enabled: !w.enabled } : w);
    onUpdateSettings({ quickAccessWidgets: updated });
  };

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedWidgets.length) return;

    const list = [...sortedWidgets];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const reordered = list.map((w, idx) => ({ ...w, order: idx + 1 }));
    onUpdateSettings({ quickAccessWidgets: reordered });
  };

  const handleChangeWidgetSize = (widgetId: string, size: 'full' | 'half' | 'compact') => {
    const updated = widgets.map(w => w.id === widgetId ? { ...w, size } : w);
    onUpdateSettings({ quickAccessWidgets: updated });
  };

  const handleResetWidgets = () => {
    onUpdateSettings({ quickAccessWidgets: DEFAULT_QUICK_ACCESS_WIDGETS });
  };

  // Render individual widget
  const renderWidget = (widget: QuickAccessWidgetConfig) => {
    if (!widget.enabled) return null;

    const widthClass = widget.size === 'full' 
      ? 'col-span-1 md:col-span-2' 
      : 'col-span-1';

    switch (widget.widgetType) {
      // -------------------------------------------------------------
      // 1. DZISIEJSZY TRENING
      // -------------------------------------------------------------
      case 'active_workout': {
        const dayExercises = currentDay?.exercises || [];
        const completedCount = dayExercises.filter(ex => ex.loggedSets && ex.loggedSets.length > 0 && ex.loggedSets.every(s => s.completed)).length;

        return (
          <div 
            key={widget.id}
            className={`${widthClass} ${cardRadiusClass} ${
              isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900/95 border-slate-800'
            } border p-4 sm:p-5 shadow-lg relative overflow-hidden group`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>{currentDay?.name || 'Dzień Treningowy'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                      {currentWeek?.name || 'Tydzień 1'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ukończono {completedCount}/{dayExercises.length} ćwiczeń
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectView('plan')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span>Otwórz plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Exercises mini checklist */}
            <div className="space-y-2 pt-3">
              {dayExercises.slice(0, 4).map((ex, exIdx) => {
                const isExCompleted = ex.loggedSets && ex.loggedSets.length > 0 && ex.loggedSets.every(s => s.completed);
                return (
                  <div 
                    key={ex.id || exIdx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${isExCompleted ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className="font-bold text-slate-200 truncate">{ex.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                      <span className="text-emerald-400 font-black">{ex.weight} {unit}</span>
                      <span className="text-slate-500">×</span>
                      <span className="text-slate-300">{ex.sets}s × {ex.reps}p</span>
                    </div>
                  </div>
                );
              })}

              {dayExercises.length > 4 && (
                <p className="text-[10px] text-center text-slate-500 pt-1 font-mono">
                  + jeszcze {dayExercises.length - 4} ćwiczeń w tym dniu
                </p>
              )}
            </div>
          </div>
        );
      }

      // -------------------------------------------------------------
      // 2. SZYBKI STOPER TRENINGOWY
      // -------------------------------------------------------------
      case 'timer_quick': {
        const formatTime = (sec: number) => {
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          return `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        const pct = ((timerSeconds - timerRemaining) / timerSeconds) * 100;

        return (
          <div 
            key={widget.id}
            className={`${widthClass} ${cardRadiusClass} ${
              isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900/95 border-slate-800'
            } border p-4 shadow-lg space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-white">Szybki Stoper Przerwy</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                isTimerRunning ? 'bg-emerald-500/20 text-emerald-300 animate-pulse' : 'bg-slate-800 text-slate-400'
              }`}>
                {isTimerRunning ? 'ODLICZANIE' : 'GOTOWY'}
              </span>
            </div>

            {/* Big Timer display */}
            <div className="flex items-center justify-between bg-slate-950/90 rounded-xl p-3 border border-slate-800">
              <div>
                <span className="text-2xl font-black font-mono tracking-tight text-white">
                  {formatTime(timerRemaining)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono ml-2">
                  / {formatTime(timerSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleTimer}
                  className={`p-2 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title={isTimerRunning ? 'Pauza' : 'Start'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[30, 60, 90, 120, 180].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleStartTimer(sec)}
                  className={`flex-1 min-w-[42px] py-1 rounded-lg text-center text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                    timerSeconds === sec && !isTimerRunning
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        );
      }

      // -------------------------------------------------------------
      // 3. MASA CIAŁA & TREND EMA
      // -------------------------------------------------------------
      case 'weight_trend': {
        const weights = data.bodyWeights || [];
        const currentWeight = weights[weights.length - 1]?.weight || 82.0;
        const initialWeight = weights[0]?.weight || 82.0;
        const delta = currentWeight - initialWeight;

        return (
          <div 
            key={widget.id}
            className={`${widthClass} ${cardRadiusClass} ${
              isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900/95 border-slate-800'
            } border p-4 shadow-lg space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-white">Masa Ciała &amp; Filtr EMA</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectView('weight')}
                className="text-[10px] text-emerald-400 hover:underline font-bold flex items-center gap-0.5"
              >
                <span>Wykres</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-950/90 rounded-xl p-3 border border-slate-800">
              <div>
                <span className="text-2xl font-black font-mono tracking-tight text-emerald-400">
                  {currentWeight} {unit}
                </span>
                <span className={`text-[10px] font-mono ml-2 font-bold ${delta > 0 ? 'text-amber-400' : delta < 0 ? 'text-teal-400' : 'text-slate-400'}`}>
                  {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} {unit}
                </span>
              </div>

              {/* Quick weight input adjustment */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNewWeightInput(prev => Math.max(30, +(prev - 0.1).toFixed(1)))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-12 text-center font-mono font-bold text-xs text-white">
                  {newWeightInput}
                </span>
                <button
                  type="button"
                  onClick={() => setNewWeightInput(prev => +(prev + 0.1).toFixed(1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuickWeight}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer ${
                    weightSavedSuccess ? 'bg-teal-600' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                  title="Zapisz wagę dzisiaj"
                >
                  {weightSavedSuccess ? <Check className="w-3.5 h-3.5" /> : 'Zapisz'}
                </button>
              </div>
            </div>
          </div>
        );
      }

      // -------------------------------------------------------------
      // 4. TRENER AI GEMINI MINI
      // -------------------------------------------------------------
      case 'ai_coach_mini': {
        return (
          <div 
            key={widget.id}
            className={`${widthClass} ${cardRadiusClass} ${
              isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900/95 border-slate-800'
            } border p-4 shadow-lg space-y-3 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-white">Trener AI Gemini 3.8</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono font-bold">
                Live Coach
              </span>
            </div>

            {/* Quick query chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                '💡 Podpowiedz ciężar na dziś',
                '⚡ Jak zoptymalizować regenerację?',
                '📊 Analiza objętości mezocyklu'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAiPrompt(chip);
                    handleAskAiCoach(chip);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-emerald-500/40 text-[10.5px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Prompt input strip */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskAiCoach();
                }}
                placeholder="Zapytaj trenera AI o technikę, ciężar lub regenerację..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleAskAiCoach()}
                disabled={isAiLoading}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Zapytaj</span>
              </button>
            </div>

            {/* Live Response Box */}
            {aiResponse && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 leading-relaxed animate-fadeIn">
                <p className="font-semibold">{aiResponse}</p>
              </div>
            )}
          </div>
        );
      }

      // -------------------------------------------------------------
      // 5. KALKULATOR TALERZY NA GRYF (PLATE CALCULATOR)
      // -------------------------------------------------------------
      case 'plate_calc_widget': {
        const plates = calculatePlates(plateCalcWeight);

        return (
          <div 
            key={widget.id}
            className={`${widthClass} ${cardRadiusClass} ${
              isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900/95 border-slate-800'
            } border p-4 shadow-lg space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-white">Kalkulator Załadunku Gryfu</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Gryf 20 kg</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="2.5"
                min="20"
                value={plateCalcWeight}
                onChange={(e) => setPlateCalcWeight(Math.max(20, parseFloat(e.target.value) || 20))}
                className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-center font-mono font-black text-sm text-emerald-400"
              />
              <span className="text-xs font-bold text-slate-400">{unit}</span>

              {/* Quick weight chips */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 justify-end">
                {[60, 80, 100, 120, 140].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setPlateCalcWeight(w)}
                    className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Plates breakdown per side */}
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Na stronę:</span>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {plates.length === 0 ? (
                  <span className="text-slate-500 text-[11px]">Sam gryf (20 kg)</span>
                ) : (
                  plates.map((p, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold"
                    >
                      {p.count}× {p.weight}kg
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      }

      // -------------------------------------------------------------
      // 6. LICZNIK NAWODNIENIA (H2O)
      // -------------------------------------------------------------
      case 'water_hydration': {
        const target = 3500;
        const pct = Math.min(100, Math.round((waterMl / target) * 100));

        return (
          <div 
            key={widget.id}
            className={`${widthClass} ${cardRadiusClass} ${
              isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900/95 border-slate-800'
            } border p-4 shadow-lg space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-extrabold text-white">Nawodnienie Treningowe</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-sky-400">{pct}% celu</span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white text-base">{waterMl} ml</span>
                <span className="text-slate-500 text-[10px]">Cel: {target} ml</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Quick add water buttons */}
            <div className="flex items-center gap-1.5">
              {[250, 500, 750].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddWater(amt)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-800 hover:border-sky-500/40 text-[11px] font-mono font-bold transition-all cursor-pointer"
                >
                  +{amt} ml
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleAddWater(-250)}
                className="px-2 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-500 border border-slate-800 text-xs font-bold cursor-pointer"
                title="Cofnij 250ml"
              >
                -
              </button>
            </div>
          </div>
        );
      }

      // -------------------------------------------------------------
      // 7. BALANS OBJĘTOŚCI PARTII MIĘŚNIOWYCH
      // -------------------------------------------------------------
      case 'muscle_volume_radar': {
        const days = currentWeek?.days || [];
        const exercises = days.flatMap(d => d.exercises || []);
        const categories = ['klatka', 'plecy', 'nogi', 'barki', 'ramiona'];
        const distribution: Record<string, number> = {};
        
        exercises.forEach(ex => {
          const cat = ex.category || 'klatka';
          distribution[cat] = (distribution[cat] || 0) + (ex.sets || 3);
        });

        return (
          <div 
            key={widget.id}
            className={`${widthClass} ${cardRadiusClass} ${
              isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900/95 border-slate-800'
            } border p-4 shadow-lg space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-white">Balans Objętości Tygodnia</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectView('muscle')}
                className="text-[10px] text-emerald-400 hover:underline font-bold"
              >
                Szczegóły →
              </button>
            </div>

            <div className="space-y-2">
              {categories.map((cat) => {
                const count = distribution[cat] || 0;
                const targetSets = 16;
                const catPct = Math.min(100, Math.round((count / targetSets) * 100));

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-bold capitalize">{cat}</span>
                      <span className="font-mono text-emerald-400 font-bold">{count} serii</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${catPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // -------------------------------------------------------------
      // 8. KALENDARZ INIEKCJI & ŚRODKÓW
      // -------------------------------------------------------------
      case 'pharmacokinetics_summary': {
        const protocols = data.protocolEntries || [];
        const nextProto = protocols[0];

        return (
          <div 
            key={widget.id}
            className={`${widthClass} ${cardRadiusClass} ${
              isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900/95 border-slate-800'
            } border p-4 shadow-lg space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-extrabold text-white">Kalendarz Środków &amp; Cykle</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectView('cycles')}
                className="text-[10px] text-teal-400 hover:underline font-bold"
              >
                Protokół →
              </button>
            </div>

            <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">
                Ostatnia zaplanowana dawka
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white truncate">
                  {nextProto ? nextProto.substance : 'Testosteron Enanthat'}
                </span>
                <span className="text-xs font-mono font-black text-teal-400">
                  {nextProto ? `${nextProto.dosage} ${nextProto.unit}` : '250 mg'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // -------------------------------------------------------------
      // 9. REKORDY OSOBISTE (PR)
      // -------------------------------------------------------------
      case 'pr_tracker': {
        const prs = data.profile?.manualPRs || [];

        return (
          <div 
            key={widget.id}
            className={`${widthClass} ${cardRadiusClass} ${
              isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900/95 border-slate-800'
            } border p-4 shadow-lg space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-extrabold text-white">Rekordy Osobiste (PR)</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectView('stats')}
                className="text-[10px] text-amber-400 hover:underline font-bold"
              >
                1RM →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {prs.slice(0, 2).map((pr, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block truncate font-bold">{pr.exerciseName}</span>
                  <span className="text-base font-black font-mono text-amber-400">
                    {pr.weight} {unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // -------------------------------------------------------------
      // 10. SZYBKI NOTATNIK
      // -------------------------------------------------------------
      case 'quick_notes': {
        return (
          <div 
            key={widget.id}
            className={`${widthClass} ${cardRadiusClass} ${
              isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900/95 border-slate-800'
            } border p-4 shadow-lg space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-white">Szybki Notatnik Treningowy</span>
              </div>
              <button
                type="button"
                onClick={handleSaveQuickNote}
                className={`px-3 py-1 rounded-lg text-xs font-bold text-white transition-all cursor-pointer ${
                  quickNoteSaved ? 'bg-teal-600' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {quickNoteSaved ? 'Zapisano ✓' : 'Zapisz notatkę'}
              </button>
            </div>

            <textarea
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="Zapisz szybkie wskazówki, odczucia lub planowane ciężary na kolejną sesję..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 resize-none font-mono"
            />
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`w-full flex-1 p-3 sm:p-6 space-y-5 max-w-6xl mx-auto ${isAmoled ? 'bg-black text-slate-100' : ''}`} id="view-quick-access">
      {/* 1. Header Banner with Customization Trigger */}
      <div className={`${cardRadiusClass} ${
        isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900 border-slate-800'
      } border p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>Pulpit Szybkiego Dostępu</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Witaj z powrotem, <strong className="text-emerald-300">{data.profile?.name || 'Pasik'}</strong>! Twój modułowy panel kontrolny na siłownię.
          </p>
        </div>

        {/* Action button: Customize Dashboard */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            id="btn-customize-dashboard"
          >
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span>Dostosuj Pulpit</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Modular Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {sortedWidgets.map(renderWidget)}
      </div>

      {/* 3. Dashboard Customizer Modal / Tray */}
      {isCustomizerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto ${cardRadiusClass} ${
            isAmoled ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-900 border-slate-800'
          } border p-5 shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-extrabold text-white">Konfigurator Pulpitu Szybkiego Dostępu</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Włączaj, wyłączaj, zmieniaj rozmiary i przestawiaj kolejność kafelków na swoim pulpicie:
            </p>

            <div className="space-y-2">
              {sortedWidgets.map((w, idx) => (
                <div 
                  key={w.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleWidget(w.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        w.enabled 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}
                      title={w.enabled ? 'Ukryj kafelek' : 'Pokaż kafelek'}
                    >
                      {w.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <div>
                      <span className="font-bold text-white block">{w.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{w.widgetType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Size switcher */}
                    <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                      {(['half', 'full'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleChangeWidgetSize(w.id, sz)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                            w.size === sz ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {sz === 'full' ? '100%' : '50%'}
                        </button>
                      ))}
                    </div>

                    {/* Move up / down */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveWidget(idx, 'up')}
                      className="p-1.5 rounded-lg bg-slate-900 disabled:opacity-30 hover:bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sortedWidgets.length - 1}
                      onClick={() => handleMoveWidget(idx, 'down')}
                      className="p-1.5 rounded-lg bg-slate-900 disabled:opacity-30 hover:bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetWidgets}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-950 border border-slate-800 cursor-pointer"
              >
                Resetuj do domyślnych
              </button>

              <button
                type="button"
                onClick={() => setIsCustomizerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-md"
              >
                Gotowe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
