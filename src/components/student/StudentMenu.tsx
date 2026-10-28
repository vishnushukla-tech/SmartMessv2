import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coffee, Sun, Sunset, Moon, Sparkles, Calendar, Clock, UtensilsCrossed } from 'lucide-react';
import { getTodayDateString, getTomorrowDateString } from '../../data/seedData';

export const StudentMenu: React.FC = () => {
  const { activeMess, getMenuForDate } = useApp();
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const [dateTab, setDateTab] = useState<string>(today);
  const currentMenu = getMenuForDate(dateTab);

  const mealSections = [
    {
      id: 'breakfast',
      title: 'Breakfast',
      icon: Coffee,
      timing: activeMess?.mealTimings.breakfast
        ? `${activeMess.mealTimings.breakfast.start} - ${activeMess.mealTimings.breakfast.end}`
        : '07:30 - 09:30',
      items: currentMenu?.breakfast || ['Breakfast items not updated yet'],
    },
    {
      id: 'lunch',
      title: 'Lunch',
      icon: Sun,
      timing: activeMess?.mealTimings.lunch
        ? `${activeMess.mealTimings.lunch.start} - ${activeMess.mealTimings.lunch.end}`
        : '12:30 - 14:30',
      items: currentMenu?.lunch || ['Lunch items not updated yet'],
    },
    {
      id: 'snacks',
      title: 'Evening Snacks',
      icon: Sunset,
      timing: activeMess?.mealTimings.snacks
        ? `${activeMess.mealTimings.snacks.start} - ${activeMess.mealTimings.snacks.end}`
        : '17:00 - 18:30',
      items: currentMenu?.snacks || ['Snacks not updated yet'],
    },
    {
      id: 'dinner',
      title: 'Dinner',
      icon: Moon,
      timing: activeMess?.mealTimings.dinner
        ? `${activeMess.mealTimings.dinner.start} - ${activeMess.mealTimings.dinner.end}`
        : '19:45 - 21:45',
      items: currentMenu?.dinner || ['Dinner items not updated yet'],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Date Switcher */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center">
        <button
          onClick={() => setDateTab(today)}
          className={`w-1/2 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
            dateTab === today ? 'bg-white text-blue-700 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Today's Menu</span>
        </button>
        <button
          onClick={() => setDateTab(tomorrow)}
          className={`w-1/2 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
            dateTab === tomorrow ? 'bg-white text-blue-700 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tomorrow's Menu</span>
        </button>
      </div>

      {/* Notice Card */}
      {currentMenu?.specialNotice && (
        <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Chef's Daily Notice</h4>
            <p className="text-xs text-blue-800 mt-0.5">{currentMenu.specialNotice}</p>
          </div>
        </div>
      )}

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mealSections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{section.title}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {section.timing}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="space-y-2">
                {section.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-400 pt-2">
        Live menu synced with {activeMess?.name || 'Mess Kitchen'}.
      </div>
    </div>
  );
};
