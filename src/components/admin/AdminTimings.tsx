import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Check,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { MealType, MessMealSchedule } from '../../types';

export const AdminTimings: React.FC = () => {
  const { activeMess, updateMessTimings } = useApp();

  const [timings, setTimings] = useState<MessMealSchedule>(
    activeMess?.mealTimings || {
      breakfast: { label: 'Breakfast', start: '07:30', end: '09:30', cutoff: '07:00' },
      lunch: { label: 'Lunch', start: '12:30', end: '14:30', cutoff: '11:30' },
      snacks: { label: 'Evening Snacks', start: '17:00', end: '18:30', cutoff: '16:00' },
      dinner: { label: 'Dinner', start: '19:45', end: '21:45', cutoff: '18:45' },
    }
  );

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleTimingChange = (
    meal: MealType,
    field: 'start' | 'end' | 'cutoff',
    value: string
  ) => {
    setTimings((prev) => ({
      ...prev,
      [meal]: {
        ...prev[meal],
        [field]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMessTimings(timings);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const mealRows: {
    id: MealType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }[] = [
    {
      id: 'breakfast',
      label: 'Breakfast',
      icon: Coffee,
      desc: 'Morning service & inventory cut-off',
    },
    {
      id: 'lunch',
      label: 'Lunch',
      icon: Sun,
      desc: 'Mid-day meal service & preparation cut-off',
    },
    {
      id: 'snacks',
      label: 'Evening Snacks',
      icon: Sunset,
      desc: 'Evening tea time and bakery cut-off',
    },
    {
      id: 'dinner',
      label: 'Dinner',
      icon: Moon,
      desc: 'Night dinner buffet and chef prep cut-off',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Cut-off Times & Meal Timings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure service hours and automated attendance lock cut-offs for {activeMess?.name}.
        </p>
      </div>

      <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-start space-x-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Automated Meal Lock Policy</p>
          <p className="mt-0.5 text-blue-800">
            Once the clock reaches the specified Cut-off Time on the day of the meal, students can no longer alter their IN/OUT state. This gives your kitchen crew a finalized prep headcount.
          </p>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-bold text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Meal timings and cut-off schedule saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealRows.map((meal) => {
            const Icon = meal.icon;
            const current = timings[meal.id];

            return (
              <div
                key={meal.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{meal.label}</h3>
                    <p className="text-[11px] text-slate-400">{meal.desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Service Starts
                    </label>
                    <input
                      type="time"
                      required
                      value={current.start}
                      onChange={(e) => handleTimingChange(meal.id, 'start', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Service Ends
                    </label>
                    <input
                      type="time"
                      required
                      value={current.end}
                      onChange={(e) => handleTimingChange(meal.id, 'end', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-extrabold text-amber-800 mb-1 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Attendance Cut-off Time (Lock threshold)
                  </label>
                  <input
                    type="time"
                    required
                    value={current.cutoff}
                    onChange={(e) => handleTimingChange(meal.id, 'cutoff', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-extrabold text-amber-900 bg-amber-50/50 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Check-in is locked at this exact minute on meal day.
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Timings & Cut-offs</span>
          </button>
        </div>
      </form>
    </div>
  );
};
