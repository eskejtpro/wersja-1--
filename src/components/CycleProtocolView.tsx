import React, { useState, useMemo } from 'react';
import { 
  Syringe, 
  Calendar as CalendarIcon, 
  CalendarDays, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Info,
  CalendarCheck,
  CalendarX,
  Search,
  TrendingUp,
  Scale,
  Ruler,
  Sparkles,
  Layers
} from 'lucide-react';
import { ProtocolEntry, TrainingWeek, AppSettings, BodyWeightEntry, BodyPartMeasurement } from '../types';
import { BloodConcentrationCalculator } from './BloodConcentrationCalculator';
import { BODY_PART_CONFIG } from '../utils/bodyMeasurements';

interface CycleProtocolViewProps {
  protocolEntries: ProtocolEntry[];
  weeks: TrainingWeek[];
  settings: AppSettings;
  bodyWeights?: BodyWeightEntry[];
  bodyPartMeasurements?: BodyPartMeasurement[];
  onAddProtocolEntry: (entry: Omit<ProtocolEntry, 'id'>) => void;
  onDeleteProtocolEntry: (id: string) => void;
  onUpdateWeekStartDate?: (weekId: string, startDate: string) => void;
  onAddWeekFromGap?: (startDate: string, weekNumber: number) => void;
}

const PRESET_PROTOCOLS = [
  { name: 'Testosteron Enanthat', dosage: 250, unit: 'mg' as const, route: 'IM' as const, badge: 'Test 250mg' },
  { name: 'Testosteron Cypionat (TRT)', dosage: 125, unit: 'mg' as const, route: 'IM' as const, badge: 'TRT 125mg' },
  { name: 'HCG (Gonadotropina)', dosage: 500, unit: 'IU' as const, route: 'SC' as const, badge: 'HCG 500 IU' },
  { name: 'HCG (Dawka stała)', dosage: 250, unit: 'IU' as const, route: 'SC' as const, badge: 'HCG 250 IU' },
  { name: 'Masteron (Drostanolon)', dosage: 100, unit: 'mg' as const, route: 'IM' as const, badge: 'Masteron 100mg' },
  { name: 'Primobolan (Methenolon)', dosage: 100, unit: 'mg' as const, route: 'IM' as const, badge: 'Primo 100mg' },
  { name: 'Nandrolon NPP', dosage: 100, unit: 'mg' as const, route: 'IM' as const, badge: 'NPP 100mg' },
  { name: 'Oxandrolon (Anavar)', dosage: 20, unit: 'mg' as const, route: 'Oral' as const, badge: 'Anavar 20mg' },
  { name: 'Clomifen (Clomid)', dosage: 50, unit: 'mg' as const, route: 'Oral' as const, badge: 'Clomid 50mg' },
];

export const CycleProtocolView: React.FC<CycleProtocolViewProps> = ({
  protocolEntries = [],
  weeks = [],
  settings,
  bodyWeights = [],
  bodyPartMeasurements = [],
  onAddProtocolEntry,
  onDeleteProtocolEntry,
  onUpdateWeekStartDate,
  onAddWeekFromGap
}) => {
  const isDark = settings.theme === 'dark';
  const [activeTab, setActiveTab] = useState<'calendar' | 'weeks' | 'calculator'>('calendar');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);

  // Calendar display filter: all vs doses vs measurements
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'doses' | 'measurements'>('all');

  // Bottom table mode: doses log vs combined correlation log
  const [bottomTableMode, setBottomTableMode] = useState<'doses' | 'correlation'>('doses');

  // Form State
  const [substance, setSubstance] = useState('Testosteron Enanthat');
  const [dosage, setDosage] = useState('250');
  const [unit, setUnit] = useState<'mg' | 'IU' | 'mcg' | 'ml' | 'tab'>('mg');
  const [route, setRoute] = useState<'IM' | 'SC' | 'Oral'>('IM');
  const [time, setTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Editing week start date inline
  const [editingWeekId, setEditingWeekId] = useState<string | null>(null);
  const [tempStartDate, setTempStartDate] = useState('');

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  const daysOfWeek = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Generate calendar days for current month view
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    // In Poland: Monday is 0, Sunday is 6
    const adjustedFirstDay = (firstDayIndex + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNumber: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // Prev month filler
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      const str = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr: str, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr: str, isCurrentMonth: true });
    }

    // Next month filler to complete 35 or 42 cells
    const remaining = 42 - days.length;
    if (remaining > 0 && remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextDate = new Date(year, month + 1, d);
        const str = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ dayNumber: d, dateStr: str, isCurrentMonth: false });
      }
    }

    return days;
  }, [year, month]);

  // Entries grouped by date
  const entriesByDate = useMemo(() => {
    const map = new Map<string, ProtocolEntry[]>();
    protocolEntries.forEach(entry => {
      const list = map.get(entry.date) || [];
      list.push(entry);
      map.set(entry.date, list);
    });
    return map;
  }, [protocolEntries]);

  // Body weights grouped by date
  const weightsByDate = useMemo(() => {
    const map = new Map<string, BodyWeightEntry>();
    bodyWeights.forEach(w => map.set(w.date, w));
    return map;
  }, [bodyWeights]);

  // Body part measurements grouped by date
  const measurementsByDate = useMemo(() => {
    const map = new Map<string, BodyPartMeasurement[]>();
    bodyPartMeasurements.forEach(m => {
      const list = map.get(m.date) || [];
      list.push(m);
      map.set(m.date, list);
    });
    return map;
  }, [bodyPartMeasurements]);

  const sortedWeights = useMemo(() => [...bodyWeights].sort((a, b) => a.date.localeCompare(b.date)), [bodyWeights]);
  const latestWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1] : null;
  const sortedParts = useMemo(() => [...bodyPartMeasurements].sort((a, b) => a.date.localeCompare(b.date)), [bodyPartMeasurements]);
  const latestPart = sortedParts.length > 0 ? sortedParts[sortedParts.length - 1] : null;

  // Selected date weight and body measurements
  const selectedDateWeight = weightsByDate.get(selectedDateStr);
  const selectedDateMeasurements = measurementsByDate.get(selectedDateStr) || [];

  // Combined dates for cycle correlation table
  const combinedLogDates = useMemo(() => {
    const setOfDates = new Set<string>();
    protocolEntries.forEach(p => setOfDates.add(p.date));
    bodyWeights.forEach(w => setOfDates.add(w.date));
    bodyPartMeasurements.forEach(m => setOfDates.add(m.date));
    return Array.from(setOfDates).sort((a, b) => b.localeCompare(a));
  }, [protocolEntries, bodyWeights, bodyPartMeasurements]);

  // Handle Preset Apply
  const applyPreset = (preset: typeof PRESET_PROTOCOLS[0]) => {
    setSubstance(preset.name);
    setDosage(String(preset.dosage));
    setUnit(preset.unit);
    setRoute(preset.route);
  };

  // Submit new protocol entry
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!substance.trim()) return;
    const numDosage = parseFloat(dosage) || 0;
    if (numDosage <= 0) return;

    onAddProtocolEntry({
      date: selectedDateStr,
      substance: substance.trim(),
      dosage: numDosage,
      unit,
      route,
      time,
      notes: notes.trim() || undefined
    });

    setNotes('');
  };

  // Filtered entries for log
  const filteredEntries = useMemo(() => {
    return [...protocolEntries]
      .sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')))
      .filter(item => {
        if (!searchFilter) return true;
        const q = searchFilter.toLowerCase();
        return (
          item.substance.toLowerCase().includes(q) ||
          item.date.includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q))
        );
      });
  }, [protocolEntries, searchFilter]);

  // Selected date entries
  const selectedDateEntries = entriesByDate.get(selectedDateStr) || [];

  // ==========================================
  // LOGIKA ANALIZY HISTORII TYGODNI I CYKLI
  // ==========================================
  interface WeekTimelineItem {
    type: 'completed' | 'in_progress' | 'gap_empty';
    weekId?: string;
    weekNumber?: number;
    weekName?: string;
    startDate: string;
    endDate: string;
    completedDays?: number;
    totalDays?: number;
    totalSets?: number;
    totalVolumeKg?: number;
  }

  const weekTimeline = useMemo(() => {
    if (!weeks || weeks.length === 0) return [];

    // Helper to calculate end date (startDate + 6 days)
    const addDays = (dateStr: string, daysToAdd: number): string => {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + daysToAdd);
      return d.toISOString().split('T')[0];
    };

    const diffInDays = (d1: string, d2: string): number => {
      const ms = new Date(d2).getTime() - new Date(d1).getTime();
      return Math.round(ms / (1000 * 60 * 60 * 24));
    };

    // Sort weeks by parsed startDate or order
    const sortedWeeks = [...weeks].sort((a, b) => {
      if (a.startDate && b.startDate) {
        return a.startDate.localeCompare(b.startDate);
      }
      return a.number - b.number;
    });

    const items: WeekTimelineItem[] = [];

    for (let i = 0; i < sortedWeeks.length; i++) {
      const w = sortedWeeks[i];
      // Default fallback date if not set
      const sDate = w.startDate || `2026-09-${String(1 + (w.number - 1) * 7).padStart(2, '0')}`;
      const eDate = addDays(sDate, 6);

      // Check gap between previous week's end and this week's start
      if (i > 0) {
        const prevW = sortedWeeks[i - 1];
        const prevSDate = prevW.startDate || `2026-09-${String(1 + (prevW.number - 1) * 7).padStart(2, '0')}`;
        const prevEDate = addDays(prevSDate, 6);
        const gapDays = diffInDays(prevEDate, sDate);

        // If gap is more than 1 day (e.g. 7 or more days missing)
        if (gapDays > 1) {
          const gapStartDate = addDays(prevEDate, 1);
          const gapEndDate = addDays(sDate, -1);
          items.push({
            type: 'gap_empty',
            startDate: gapStartDate,
            endDate: gapEndDate,
            weekName: `Przerwa / Deload (${gapDays - 1} dni bez zaplanowanego treningu)`
          });
        }
      }

      // Compute stats for current week
      const totalDays = w.days.length;
      const completedDays = w.days.filter(d => d.completed).length;
      const isCompleted = totalDays > 0 && completedDays === totalDays;

      let setsCount = 0;
      let volKg = 0;
      w.days.forEach(d => {
        d.exercises.forEach(ex => {
          setsCount += ex.sets;
          volKg += ex.sets * ex.reps * ex.weight;
        });
      });

      items.push({
        type: isCompleted ? 'completed' : 'in_progress',
        weekId: w.id,
        weekNumber: w.number,
        weekName: w.name,
        startDate: sDate,
        endDate: eDate,
        completedDays,
        totalDays,
        totalSets: setsCount,
        totalVolumeKg: volKg
      });
    }

    return items;
  }, [weeks]);

  // Timeline summary counts
  const completedCount = weekTimeline.filter(w => w.type === 'completed').length;
  const inProgressCount = weekTimeline.filter(w => w.type === 'in_progress').length;
  const emptyGapsCount = weekTimeline.filter(w => w.type === 'gap_empty').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto" id="cycle-protocol-view">
      {/* Top Banner with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm tracking-wide">
            <Syringe className="w-5 h-5 text-emerald-400" />
            <span>KONTROLA CYKLU & DZIENNIK DAWEK</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Kalendarz Środków, HCG & Historia Tygodni
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Precyzyjny zapis iniekcji i dawek z dokładnością do godziny oraz pełna oś czasu ukończonych, aktywnych i pustych tygodni cyklu.
          </p>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Wpisy dawek</div>
              <div className="font-extrabold text-white text-sm">{protocolEntries.length} podań</div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Ukończone tyg.</div>
              <div className="font-extrabold text-emerald-400 text-sm">{completedCount}</div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <CalendarX className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">W toku / Puste</div>
              <div className="font-extrabold text-amber-400 text-sm">{inProgressCount} / {emptyGapsCount}</div>
            </div>
          </div>

          {latestWeight && (
            <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Waga na cyklu</div>
                <div className="font-extrabold text-amber-300 text-sm">{latestWeight.weight} {settings.unit}</div>
              </div>
            </div>
          )}

          {latestPart && (
            <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">
                  {BODY_PART_CONFIG[latestPart.part]?.label || 'Obwód'}
                </div>
                <div className="font-extrabold text-purple-300 text-sm">{latestPart.value} cm</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Selection: Kalendarz vs Historia Tygodni */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          id="tab-btn-calendar"
        >
          <CalendarDays className="w-4 h-4" />
          <span>Kalendarz</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {protocolEntries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('weeks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'weeks'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          id="tab-btn-weeks-history"
        >
          <Clock className="w-4 h-4" />
          <span>Historia tygodni</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {weekTimeline.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'calculator'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          id="tab-btn-blood-concentration"
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Kalkulator stężeń</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: KALENDARZ INIEKCJI & REJESTRACJA DAWEK */}
      {/* ======================================================== */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center: Interactive Month Calendar (7 cols on lg) */}
          <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">
                  {monthNames[month]} {year}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter for Calendar Badges */}
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setCalendarFilter('all')}
                    className={`px-2 py-1 rounded-md font-bold transition-all ${
                      calendarFilter === 'all'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Wszystko
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFilter('doses')}
                    className={`px-2 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                      calendarFilter === 'doses'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Syringe className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Dawki</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFilter('measurements')}
                    className={`px-2 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                      calendarFilter === 'measurements'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Ruler className="w-2.5 h-2.5 text-purple-400" />
                    <span>Pomiary</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Poprzedni miesiąc"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleToday}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold transition-colors"
                  >
                    Dzisiaj
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Następny miesiąc"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center py-2 text-xs font-mono font-bold text-slate-400">
              {daysOfWeek.map((d, i) => (
                <div key={d} className={i >= 5 ? 'text-emerald-500/70' : ''}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 flex-1 min-h-[320px]">
              {calendarDays.map(({ dayNumber, dateStr, isCurrentMonth }) => {
                const isSelected = dateStr === selectedDateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const dayEntries = entriesByDate.get(dateStr) || [];
                const dayWeight = weightsByDate.get(dateStr);
                const dayMeasurements = measurementsByDate.get(dateStr) || [];
                const hasEntries = dayEntries.length > 0 || !!dayWeight || dayMeasurements.length > 0;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[68px] p-1.5 rounded-xl text-left flex flex-col justify-between transition-all border ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/15 shadow-sm ring-1 ring-emerald-400/40'
                        : isToday
                        ? 'border-emerald-500/40 bg-slate-950/80'
                        : isCurrentMonth
                        ? 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-700'
                        : 'border-transparent bg-transparent opacity-35 hover:opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-bold rounded-md px-1 ${
                          isSelected
                            ? 'text-emerald-300 font-black'
                            : isToday
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {dayNumber}
                      </span>
                      {hasEntries && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>

                    {/* Entry Badges inside cell */}
                    <div className="space-y-0.5 mt-1 overflow-hidden w-full">
                      {/* Doses Badges */}
                      {calendarFilter !== 'measurements' &&
                        dayEntries.slice(0, 2).map(entry => (
                          <div
                            key={entry.id}
                            className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                              entry.substance.toLowerCase().includes('hcg')
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : entry.route === 'Oral'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                            title={`${entry.substance} ${entry.dosage}${entry.unit} (${entry.route})`}
                          >
                            {entry.substance.split(' ')[0]} {entry.dosage}{entry.unit}
                          </div>
                        ))}

                      {/* Weight Badge */}
                      {calendarFilter !== 'doses' && dayWeight && (
                        <div
                          className="text-[9px] px-1 py-0.5 rounded truncate font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono"
                          title={`Waga ciała: ${dayWeight.weight} ${settings.unit}${dayWeight.notes ? ` (${dayWeight.notes})` : ''}`}
                        >
                          <span className="text-[8px]">⚖️</span>
                          <span className="truncate">{dayWeight.weight}{settings.unit}</span>
                        </div>
                      )}

                      {/* Muscle Circumferences Badge */}
                      {calendarFilter !== 'doses' && dayMeasurements.length > 0 && (
                        <div
                          className="text-[9px] px-1 py-0.5 rounded truncate font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-mono"
                          title={dayMeasurements.map(m => `${BODY_PART_CONFIG[m.part]?.label || m.part}: ${m.value} cm`).join(', ')}
                        >
                          <span className="text-[8px]">📐</span>
                          <span className="truncate">
                            {dayMeasurements.length === 1
                              ? `${BODY_PART_CONFIG[dayMeasurements[0].part]?.label.slice(0, 3)} ${dayMeasurements[0].value}`
                              : `${dayMeasurements.length} pomiary`}
                          </span>
                        </div>
                      )}

                      {calendarFilter === 'all' && dayEntries.length > 2 && (
                        <div className="text-[8px] text-slate-400 font-mono pl-1">
                          +{dayEntries.length - 2} więcej dawek
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-400 pt-3 border-t border-slate-800 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Iniekcja IM</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>HCG / SC</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span>Doustne</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>⚖️ Waga ciała</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>📐 Obwody partii</span>
              </span>
            </div>
          </div>

          {/* Right: Quick Entry Form & Day Details (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Box: Add Dose for Selected Date */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      Zapisz Dawkę dla: <span className="text-emerald-400 font-mono">{selectedDateStr}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">Wybierz gotowy szablon lub wpisz parametry</p>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  Szybkie szablony (1-klik):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PROTOCOLS.map(preset => (
                    <button
                      key={preset.badge}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 transition-colors"
                    >
                      {preset.badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleAddEntry} className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Data</label>
                    <input
                      type="date"
                      value={selectedDateStr}
                      onChange={e => setSelectedDateStr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Godzina</label>
                    <input
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Nazwa Związku / Preparatu</label>
                  <input
                    type="text"
                    value={substance}
                    onChange={e => setSubstance(e.target.value)}
                    placeholder="np. Testosteron Enanthat, HCG, Masteron..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Dawka</label>
                    <input
                      type="number"
                      step="any"
                      value={dosage}
                      onChange={e => setDosage(e.target.value)}
                      placeholder="250"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Jednostka</label>
                    <select
                      value={unit}
                      onChange={e => setUnit(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="mg">mg</option>
                      <option value="IU">IU (j.m.)</option>
                      <option value="mcg">mcg</option>
                      <option value="ml">ml</option>
                      <option value="tab">tabl.</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Droga</label>
                    <select
                      value={route}
                      onChange={e => setRoute(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="IM">IM (Domięśniowo)</option>
                      <option value="SC">SC (Podskórnie)</option>
                      <option value="Oral">Doustnie</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Miejsce iniekcji / Notatki</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="np. Prawy pośladek, bark lewy, fałd brzuszny..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
                  id="btn-save-protocol-entry"
                >
                  <Plus className="w-4 h-4" />
                  <span>Zapisz Podanie w Kalendarzu</span>
                </button>
              </form>
            </div>

            {/* Selected Date Entries List */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-md space-y-3">
              <h5 className="font-extrabold text-xs text-white flex items-center justify-between">
                <span>Podania dawek z dnia {selectedDateStr}:</span>
                <span className="text-[11px] font-mono text-emerald-400">{selectedDateEntries.length} wpisów</span>
              </h5>

              {selectedDateEntries.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Brak wpisów dawek dla wybranego dnia. Kliknij powyżej, aby dodać podanie.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedDateEntries.map(entry => (
                    <div
                      key={entry.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white truncate">{entry.substance}</span>
                          <span className="font-mono text-emerald-400 font-extrabold text-xs">
                            {entry.dosage} {entry.unit}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {entry.route}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {entry.time && <span>🕒 {entry.time}</span>}
                          {entry.notes && <span className="truncate">📍 {entry.notes}</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteProtocolEntry(entry.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Usuń wpis"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Box: Body Metrics for Selected Date */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-md space-y-3">
              <h5 className="font-extrabold text-xs text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-purple-400" />
                  <span>Wyniki pomiarów ciała z dnia {selectedDateStr}:</span>
                </span>
                {(selectedDateWeight || selectedDateMeasurements.length > 0) && (
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-md">
                    Zarejestrowano
                  </span>
                )}
              </h5>

              {!selectedDateWeight && selectedDateMeasurements.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-1">
                  Brak wpisów wagi ani obwodów partii w tym dniu. Pomiary dodasz w sekcji „Waga i Pomiary”.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {selectedDateWeight && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Masa ciała</span>
                          <span className="font-mono font-extrabold text-amber-300 text-sm">
                            {selectedDateWeight.weight} {settings.unit}
                          </span>
                        </div>
                      </div>
                      {selectedDateWeight.notes && (
                        <span className="text-[11px] text-slate-400 max-w-[150px] truncate" title={selectedDateWeight.notes}>
                          💬 {selectedDateWeight.notes}
                        </span>
                      )}
                    </div>
                  )}

                  {selectedDateMeasurements.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
                        Wymiary partii mięśniowych:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {selectedDateMeasurements.map(m => {
                          const cfg = BODY_PART_CONFIG[m.part];
                          return (
                            <div key={m.id} className="p-2 rounded-xl bg-slate-950 border border-purple-500/20">
                              <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                                <span>📏</span>
                                <span className="truncate">{cfg?.label || m.part}</span>
                              </div>
                              <div className="text-xs font-bold font-mono text-purple-300 mt-1">
                                {m.value} cm
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Full Past Entries Log Table & Correlation Table */}
          <div className="lg:col-span-12 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              {/* Table Mode Selector */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBottomTableMode('doses')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    bottomTableMode === 'doses'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Historia Wszystkich Podań</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {protocolEntries.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBottomTableMode('correlation')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    bottomTableMode === 'correlation'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Zestawienie: Dawki vs Waga & Obwody</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {combinedLogDates.length}
                  </span>
                </button>
              </div>

              {bottomTableMode === 'doses' && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="Filtruj np. HCG, Testosteron..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* TAB CONTENT: DOSES LOG */}
            {bottomTableMode === 'doses' && (
              <>
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Brak wpisów pasujących do filtra.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                          <th className="py-2.5 px-3">Data & Godzina</th>
                          <th className="py-2.5 px-3">Substancja</th>
                          <th className="py-2.5 px-3">Dawka</th>
                          <th className="py-2.5 px-3">Droga</th>
                          <th className="py-2.5 px-3">Notatki / Miejsce</th>
                          <th className="py-2.5 px-3 text-right">Akcja</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {filteredEntries.map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-slate-300">
                              {entry.date} {entry.time ? `• ${entry.time}` : ''}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-white">
                              {entry.substance}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-extrabold text-emerald-400">
                              {entry.dosage} {entry.unit}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                entry.route === 'IM'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : entry.route === 'SC'
                                  ? 'bg-cyan-500/15 text-cyan-400'
                                  : 'bg-purple-500/15 text-purple-400'
                              }`}>
                                {entry.route === 'IM' ? 'Domięśniowo (IM)' : entry.route === 'SC' ? 'Podskórnie (SC)' : 'Doustnie'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                              {entry.notes || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => onDeleteProtocolEntry(entry.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Usuń wpis"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* TAB CONTENT: CORRELATION LOG (DOSES + WEIGHT + BODY PART MEASUREMENTS) */}
            {bottomTableMode === 'correlation' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">
                  Zestawienie chronologiczne dawek z zarejestrowaną wagą ciała oraz obwodami mięśniowymi z każdego dnia:
                </p>

                {combinedLogDates.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Brak wpisów dawek ani pomiarów ciała.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                          <th className="py-2.5 px-3">Data</th>
                          <th className="py-2.5 px-3">Przyjęte Środki & Dawki</th>
                          <th className="py-2.5 px-3">Waga Ciała</th>
                          <th className="py-2.5 px-3">Zmierzone Partie Mięśniowe</th>
                          <th className="py-2.5 px-3">Notatki</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {combinedLogDates.map(dateStr => {
                          const doses = entriesByDate.get(dateStr) || [];
                          const weightEntry = weightsByDate.get(dateStr);
                          const parts = measurementsByDate.get(dateStr) || [];

                          return (
                            <tr key={dateStr} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-200 whitespace-nowrap">
                                {dateStr}
                              </td>

                              {/* Doses */}
                              <td className="py-2.5 px-3">
                                {doses.length === 0 ? (
                                  <span className="text-slate-600 italic">-</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5">
                                    {doses.map(d => (
                                      <span
                                        key={d.id}
                                        className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                      >
                                        {d.substance}: {d.dosage} {d.unit} ({d.route})
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>

                              {/* Weight */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {weightEntry ? (
                                  <span className="text-xs font-mono font-extrabold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                                    ⚖️ {weightEntry.weight} {settings.unit}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 italic">-</span>
                                )}
                              </td>

                              {/* Body parts */}
                              <td className="py-2.5 px-3">
                                {parts.length === 0 ? (
                                  <span className="text-slate-600 italic">-</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5">
                                    {parts.map(p => {
                                      const cfg = BODY_PART_CONFIG[p.part];
                                      return (
                                        <span
                                          key={p.id}
                                          className="text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1"
                                        >
                                          <span>📏</span>
                                          <span>{cfg?.label || p.part}:</span>
                                          <strong className="text-white">{p.value} cm</strong>
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>

                              {/* Notes */}
                              <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                                {doses.find(d => d.notes)?.notes || weightEntry?.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: HISTORIA TYGODNI CYKLI Z DATAMI (UKOŃCZONE, NIEUKOŃCZONE, PUSTE) */}
      {/* ======================================================== */}
      {activeTab === 'weeks' && (
        <div className="space-y-6">
          {/* Explanation banner */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-md flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <h4 className="font-extrabold text-white text-sm">
                Inteligentna Analiza Osi Czasu i Ciągłości Cyklu Treningowego
              </h4>
              <p className="text-slate-400 leading-relaxed">
                System automatycznie grupuje tygodnie na:
                <strong className="text-emerald-400"> Ukończone </strong> (100% zrealizowanych zaplanowanych dni),
                <strong className="text-amber-400"> W trakcie / Częściowe </strong> (część treningów wykonana) oraz
                <strong className="text-slate-200"> Puste / Niezaplanowane Tygodnie </strong> (luki w datach oznaczające przerwy regeneracyjne lub deload).
              </p>
            </div>
          </div>

          {/* Timeline Cards */}
          <div className="space-y-3">
            {weekTimeline.map((item, index) => {
              if (item.type === 'gap_empty') {
                return (
                  <div
                    key={`gap-${index}`}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-dashed border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                        <CalendarX className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold uppercase">
                            Pusty Tydzień / Przerwa
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {item.startDate} — {item.endDate}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-300 mt-0.5">
                          {item.weekName}
                        </h5>
                      </div>
                    </div>

                    {onAddWeekFromGap && (
                      <button
                        type="button"
                        onClick={() => onAddWeekFromGap(item.startDate, (item.weekNumber || index) + 1)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-emerald-300 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Zaplanuj Tydzień Treningowy</span>
                      </button>
                    )}
                  </div>
                );
              }

              const isCompleted = item.type === 'completed';

              return (
                <div
                  key={item.weekId || index}
                  className={`p-5 rounded-2xl border transition-all shadow-md ${
                    isCompleted
                      ? 'bg-slate-900 border-emerald-500/30'
                      : 'bg-slate-900 border-amber-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                            : 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <AlertCircle className="w-6 h-6" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-black uppercase ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {isCompleted ? '✓ Ukończony (100%)' : '⚡ W Trakcie / Częściowy'}
                          </span>

                          <span className="text-xs font-mono font-bold text-slate-300">
                            📅 {item.startDate} — {item.endDate}
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-white mt-1">
                          {item.weekName}
                        </h4>
                      </div>
                    </div>

                    {/* Progress Metrics */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                      <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase">Zrealizowane Dni</span>
                        <span className="font-extrabold text-white">
                          {item.completedDays} / {item.totalDays} dni
                        </span>
                      </div>

                      <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase">Objętość & Serie</span>
                        <span className="font-extrabold text-emerald-400">
                          {item.totalSets} serii • {item.totalVolumeKg?.toLocaleString()} kg
                        </span>
                      </div>

                      {/* Edit Start Date Button */}
                      {onUpdateWeekStartDate && item.weekId && (
                        <div>
                          {editingWeekId === item.weekId ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="date"
                                value={tempStartDate}
                                onChange={e => setTempStartDate(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (tempStartDate) {
                                    onUpdateWeekStartDate(item.weekId!, tempStartDate);
                                  }
                                  setEditingWeekId(null);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                              >
                                Zapisz
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingWeekId(null)}
                                className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                              >
                                Anuluj
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingWeekId(item.weekId!);
                                setTempStartDate(item.startDate);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                              title="Zmień datę rozpoczęcia tygodnia"
                            >
                              Zmień datę
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: KALKULATOR PÓŁTRWANIA & KRZYWA STĘŻEŃ */}
      {/* ======================================================== */}
      {activeTab === 'calculator' && (
        <BloodConcentrationCalculator
          protocolEntries={protocolEntries}
          theme={settings.theme}
        />
      )}
    </div>
  );
};
