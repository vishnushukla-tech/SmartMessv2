import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Coffee,
  Sun,
  Sunset,
  Moon,
  Check,
  X,
  Clock,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { MealType } from '../../types';
import { getTodayDateString, getTomorrowDateString } from '../../data/seedData';

export const StudentCheckIn: React.FC = () => {
  const {
    currentStudent,
    activeMess,
    submitStudentAttendance,
    getStudentAttendanceForDate,
    getMenuForDate,
    checkCutoff,
  } = useApp();

  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const [activeDateTab, setActiveDateTab] = useState<string>(today);

  // Meals state for the active tab (Breakfast, Lunch, Snacks, Dinner)
  const [meals, setMeals] = useState<{
    breakfast: boolean;
    lunch: boolean;
    snacks: boolean;
    dinner: boolean;
  }>({
    breakfast: true,
    lunch: true,
    snacks: true,
    dinner: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Existing attendance record for selected student & date
  const existingRecord = currentStudent
    ? getStudentAttendanceForDate(currentStudent.uid, activeDateTab)
    : undefined;

  // Tomorrow record (to check if reminder banner needed)
  const tomorrowRecord = currentStudent
    ? getStudentAttendanceForDate(currentStudent.uid, tomorrow)
    : undefined;

  // Sync state whenever active date or student changes
  useEffect(() => {
    if (existingRecord) {
      setMeals({
        breakfast: existingRecord.breakfast,
        lunch: existingRecord.lunch,
        snacks: existingRecord.snacks,
        dinner: existingRecord.dinner,
      });
    } else {
      // All IN by default per specification!
      setMeals({
        breakfast: true,
        lunch: true,
        snacks: true,
        dinner: true,
      });
    }
    setFeedbackMsg(null);
  }, [activeDateTab, existingRecord]);

  // Current menu for active date
  const activeMenu = getMenuForDate(activeDateTab);

  const mealCards: {
    id: MealType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    timeRange: string;
    cutoffTime: string;
    menuItems: string[];
  }[] = [
    {
      id: 'breakfast',
      label: 'Breakfast',
      icon: Coffee,
      timeRange: activeMess?.mealTimings.breakfast
        ? `${activeMess.mealTimings.breakfast.start} - ${activeMess.mealTimings.breakfast.end}`
        : '07:30 - 09:30',
      cutoffTime: activeMess?.mealTimings.breakfast.cutoff || '07:00',
      menuItems: activeMenu?.breakfast || ['Chef Special Breakfast'],
    },
    {
      id: 'lunch',
      label: 'Lunch',
      icon: Sun,
      timeRange: activeMess?.mealTimings.lunch
        ? `${activeMess.mealTimings.lunch.start} - ${activeMess.mealTimings.lunch.end}`
        : '12:30 - 14:30',
      cutoffTime: activeMess?.mealTimings.lunch.cutoff || '11:30',
      menuItems: activeMenu?.lunch || ['Chef Special Lunch Buffet'],
    },
    {
      id: 'snacks',
      label: 'Evening Snacks',
      icon: Sunset,
      timeRange: activeMess?.mealTimings.snacks
        ? `${activeMess.mealTimings.snacks.start} - ${activeMess.mealTimings.snacks.end}`
        : '17:00 - 18:30',
      cutoffTime: activeMess?.mealTimings.snacks.cutoff || '16:00',
      menuItems: activeMenu?.snacks || ['Evening Tea & Snacks'],
    },
    {
      id: 'dinner',
      label: 'Dinner',
      icon: Moon,
      timeRange: activeMess?.mealTimings.dinner
        ? `${activeMess.mealTimings.dinner.start} - ${activeMess.mealTimings.dinner.end}`
        : '19:45 - 21:45',
      cutoffTime: activeMess?.mealTimings.dinner.cutoff || '18:45',
      menuItems: activeMenu?.dinner || ['Night Dinner Spread'],
    },
  ];

  const handleToggle = (mealId: MealType) => {
    // Check cutoff lock
    const cutoffStatus = checkCutoff(mealId, activeDateTab);
    if (cutoffStatus.isLocked) {
      setFeedbackMsg({
        type: 'error',
        text: `Cannot change ${mealId}: ${cutoffStatus.reason}`,
      });
      return;
    }

    setMeals((prev) => ({
      ...prev,
      [mealId]: !prev[mealId],
    }));
    setFeedbackMsg(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedbackMsg(null);

    const res = await submitStudentAttendance(activeDateTab, meals);
    setIsSubmitting(false);

    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: `Attendance registered! Last updated at ${new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
      });
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.message,
      });
    }
  };

  const formatLastUpdated = (isoString?: string) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Date Switcher: Today / Tomorrow */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center">
        <button
          onClick={() => setActiveDateTab(today)}
          className={`w-1/2 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
            activeDateTab === today
              ? 'bg-white text-blue-700 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Today ({new Date(today).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })})</span>
        </button>
        <button
          onClick={() => setActiveDateTab(tomorrow)}
          className={`w-1/2 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
            activeDateTab === tomorrow
              ? 'bg-white text-blue-700 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tomorrow ({new Date(tomorrow).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })})</span>
        </button>
      </div>

      {/* Reminder Banner when Tomorrow's meals are not yet submitted */}
      {!tomorrowRecord && activeDateTab === today && (
        <div className="p-4 rounded-2xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Tomorrow's Headcount Pending
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Help the kitchen staff prevent food waste by checking your meals for tomorrow in advance.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveDateTab(tomorrow)}
            className="text-xs font-bold text-amber-900 underline whitespace-nowrap ml-3"
          >
            Check Tomorrow →
          </button>
        </div>
      )}

      {/* Live Notice / Special Today */}
      {activeMenu?.specialNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center space-x-2 text-xs text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold">Notice:</span>
          <span>{activeMenu.specialNotice}</span>
        </div>
      )}

      {/* Status or Success Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-red-50 text-red-800 border border-red-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 4 Big Meal Check-in Cards */}
      <div className="space-y-4">
        {mealCards.map((card) => {
          const isMealIn = meals[card.id];
          const cutoff = checkCutoff(card.id, activeDateTab);
          const isLocked = cutoff.isLocked;
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className={`p-5 rounded-2xl border-2 transition-all bg-white ${
                isMealIn
                  ? 'border-emerald-500/80 shadow-md shadow-emerald-500/5'
                  : 'border-red-400/80 shadow-md shadow-red-500/5'
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Meal Info */}
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isMealIn ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-900">{card.label}</h3>
                      {isLocked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {card.timeRange}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">Cut-off: {card.cutoffTime}</span>
                    </div>
                  </div>
                </div>

                {/* Big Green IN / Red OUT Toggle Buttons */}
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => !isMealIn && handleToggle(card.id)}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center space-x-1 ${
                      isMealIn
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                        : 'text-slate-500 hover:text-slate-800'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>IN</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => isMealIn && handleToggle(card.id)}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center space-x-1 ${
                      !isMealIn
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                        : 'text-slate-500 hover:text-slate-800'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                    <span>OUT</span>
                  </button>
                </div>
              </div>

              {/* Cutoff Warning message if locked */}
              {isLocked && (
                <div className="mt-3 text-[11px] text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  ⚠️ {cutoff.reason}. Headcount finalized for kitchen prep.
                </div>
              )}

              {/* Menu items preview */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  <Utensils className="w-3 h-3" />
                  <span>Menu for {card.label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {card.menuItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Submit Button & Last Updated Info */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl space-y-2">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <span>Saving Attendance...</span>
          ) : (
            <>
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Submit Attendance ({activeDateTab === today ? 'Today' : 'Tomorrow'})</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            {existingRecord?.lastSubmittedAt ? (
              <span className="flex items-center text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Last updated at {formatLastUpdated(existingRecord.lastSubmittedAt)}
              </span>
            ) : (
              <span className="text-amber-600 font-medium">Not submitted yet (All IN by default)</span>
            )}
          </span>
          <span className="text-slate-400">One record per day • Updates overwrite</span>
        </div>
      </div>
    </div>
  );
};
