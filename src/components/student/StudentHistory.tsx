import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { AttendanceRecord } from '../../types';

export const StudentHistory: React.FC = () => {
  const { currentStudent, data, activeMess } = useApp();

  const studentRecords = data.attendance
    .filter((a) => a.studentUid === currentStudent?.uid)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Compute monthly stats
  let totalMealsEaten = 0;
  let totalMealsSkipped = 0;

  studentRecords.forEach((r) => {
    if (r.breakfast) totalMealsEaten++;
    else totalMealsSkipped++;

    if (r.lunch) totalMealsEaten++;
    else totalMealsSkipped++;

    if (r.snacks) totalMealsEaten++;
    else totalMealsSkipped++;

    if (r.dinner) totalMealsEaten++;
    else totalMealsSkipped++;
  });

  const totalRegistered = totalMealsEaten + totalMealsSkipped;
  const attendanceRate = totalRegistered > 0 ? Math.round((totalMealsEaten / totalRegistered) * 100) : 100;

  // Food waste saved estimate (avg ₹75 / $1 per skipped meal correctly informed)
  const estimatedSavings = totalMealsSkipped * 75;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-xl font-extrabold text-slate-900">Attendance History & Savings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track your dining log, verified check-ins, and food waste prevented.
        </p>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Meals Eaten</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{totalMealsEaten}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">Checked IN</p>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center">
          <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Meals Skipped</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{totalMealsSkipped}</p>
          <p className="text-[10px] text-rose-600 mt-0.5 font-medium">Informed OUT</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Waste Saved</p>
          <p className="text-2xl font-black text-blue-700 mt-1">₹{estimatedSavings}</p>
          <p className="text-[10px] text-blue-600 mt-0.5 font-medium">{attendanceRate}% Rate</p>
        </div>
      </div>

      {/* Sustainability Badge */}
      <div className="p-4 bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-300 rounded-2xl flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
            Zero-Waste Hostel Contributor
          </h4>
          <p className="text-xs text-emerald-800 mt-0.5">
            By marking {totalMealsSkipped} meals OUT in advance, you saved roughly{' '}
            <span className="font-bold">{(totalMealsSkipped * 0.45).toFixed(1)} kg</span> of kitchen food waste!
          </p>
        </div>
      </div>

      {/* History Log List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <Calendar className="w-4 h-4 mr-1.5 text-blue-600" />
          Past Check-in Records
        </h3>

        {studentRecords.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No attendance records yet</p>
            <p className="text-[11px] text-slate-400">Submit your check-in today to build your dining history.</p>
          </div>
        ) : (
          studentRecords.map((record) => {
            const dateObj = new Date(record.date);
            const dateLabel = dateObj.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = new Date(record.lastSubmittedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={record.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{dateLabel}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    Updated {formattedTime}
                  </span>
                </div>

                {/* Meals Badges */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { label: 'Breakfast', in: record.breakfast },
                    { label: 'Lunch', in: record.lunch },
                    { label: 'Snacks', in: record.snacks },
                    { label: 'Dinner', in: record.dinner },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className={`py-2 px-2.5 rounded-xl border text-center ${
                        m.in
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <p className="text-[10px] font-semibold text-slate-500 truncate">{m.label}</p>
                      <p className="text-xs font-black mt-0.5">{m.in ? 'IN' : 'OUT'}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
