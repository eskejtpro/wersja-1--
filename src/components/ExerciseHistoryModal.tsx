import React, { useState } from 'react';
import { X, TrendingUp, Calendar, Trash2, Plus } from 'lucide-react';
import { Exercise, ExerciseHistoryPoint } from '../types';
import { getTodayDateString } from '../utils/calculations';

interface ExerciseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
  onUpdateHistory: (exerciseId: string, history: ExerciseHistoryPoint[]) => void;
  unit: string;
}

export const ExerciseHistoryModal: React.FC<ExerciseHistoryModalProps> = ({
  isOpen,
  onClose,
  exercise,
  onUpdateHistory,
  unit
}) => {
  const [newDate, setNewDate] = useState(getTodayDateString());
  const [newWeight, setNewWeight] = useState('');
  const [newReps, setNewReps] = useState('8');
  const [newSets, setNewSets] = useState('4');

  if (!isOpen || !exercise) return null;

  const history = exercise.history || [];

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight.replace(',', '.'));
    const r = parseInt(newReps, 10);
    const s = parseInt(newSets, 10);
    if (isNaN(w) || isNaN(r) || isNaN(s)) return;

    const newPoint: ExerciseHistoryPoint = {
      date: newDate || getTodayDateString(),
      weight: w,
      reps: r,
      sets: s
    };

    const updated = [...history, newPoint].sort((a, b) => a.date.localeCompare(b.date));
    onUpdateHistory(exercise.id, updated);
    setNewWeight('');
  };

  const handleDeletePoint = (index: number) => {
    const updated = history.filter((_, i) => i !== index);
    onUpdateHistory(exercise.id, updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Historia Progresu: {exercise.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Form to add historical log point */}
          <form onSubmit={handleAddPoint} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dodaj punkt pomiarowy do osi czasu</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block">Data:</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block">Ciężar ({unit}):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="85"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block">Serie:</label>
                <input
                  type="number"
                  value={newSets}
                  onChange={(e) => setNewSets(e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block">Powt.:</label>
                <input
                  type="number"
                  value={newReps}
                  onChange={(e) => setNewReps(e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1 mt-1"
            >
              Dodaj wpis do bazy
            </button>
          </form>

          {/* Table of historical entries */}
          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Ciężar</th>
                  <th className="py-2 px-3">Serie x Powt.</th>
                  <th className="py-2 px-3">Szac. 1RM</th>
                  <th className="py-2 px-3 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-200">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-500">
                      Brak wcześniejszej historii dla tego ćwiczenia.
                    </td>
                  </tr>
                ) : (
                  history.map((point, i) => {
                    const oneRm = point.reps > 1 ? (point.weight * (1 + point.reps / 30)).toFixed(1) : point.weight;
                    return (
                      <tr key={i} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 font-mono">{point.date}</td>
                        <td className="py-2 px-3 font-bold text-emerald-400 font-mono">
                          {point.weight} {unit}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400">
                          {point.sets} x {point.reps}
                        </td>
                        <td className="py-2 px-3 text-emerald-400 font-mono font-bold">
                          {oneRm} {unit}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePoint(i)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded"
                            title="Usuń wpis"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
