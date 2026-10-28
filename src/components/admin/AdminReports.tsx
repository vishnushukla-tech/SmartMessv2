import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  BarChart3,
  TrendingDown,
  Download,
  Clock,
  User,
  ShieldAlert,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Leaf,
  FileSpreadsheet,
} from 'lucide-react';
import { getTodayDateString } from '../../data/seedData';

export const AdminReports: React.FC = () => {
  const { activeMess, data } = useApp();
  const [reportDate, setReportDate] = useState<string>(getTodayDateString());

  // Mess students
  const messStudents = data.students.filter((s) => s.messId === activeMess?.id);
  const totalStudents = messStudents.length;

  // Audit logs for this mess
  const messLogs = data.auditLogs.filter((l) => l.messId === activeMess?.id);

  // Compute stats across all attendance records for this mess
  const allMessAttendance = data.attendance.filter((a) => a.messId === activeMess?.id);

  let totalMealsEatenAll = 0;
  let totalMealsSkippedAll = 0;

  allMessAttendance.forEach((rec) => {
    rec.breakfast ? totalMealsEatenAll++ : totalMealsSkippedAll++;
    rec.lunch ? totalMealsEatenAll++ : totalMealsSkippedAll++;
    rec.snacks ? totalMealsEatenAll++ : totalMealsSkippedAll++;
    rec.dinner ? totalMealsEatenAll++ : totalMealsSkippedAll++;
  });

  // Calculate waste prevented: avg ₹70 per meal not wasted
  const moneySaved = totalMealsSkippedAll * 70;
  const foodSavedKg = (totalMealsSkippedAll * 0.45).toFixed(1);

  // Date specific records
  const dateRecords = allMessAttendance.filter((a) => a.date === reportDate);
  let bIn = 0, lIn = 0, sIn = 0, dIn = 0;
  dateRecords.forEach((r) => {
    if (r.breakfast) bIn++;
    if (r.lunch) lIn++;
    if (r.snacks) sIn++;
    if (r.dinner) dIn++;
  });

  const handleExportFullCSV = () => {
    const headers = ['Record ID', 'Mess ID', 'Date', 'Student UID', 'Student Name', 'Roll No', 'Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Last Submitted'];
    const rows = allMessAttendance.map((r) => [
      r.id,
      r.messId,
      r.date,
      r.studentUid,
      `"${r.studentName}"`,
      r.studentRollNo,
      r.breakfast ? 'IN' : 'OUT',
      r.lunch ? 'IN' : 'OUT',
      r.snacks ? 'IN' : 'OUT',
      r.dinner ? 'IN' : 'OUT',
      r.lastSubmittedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartMess_FullReport_${activeMess?.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Kitchen Analytics & Audit Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Attendance history, waste mitigation savings, and student audit trail for {activeMess?.name}.
          </p>
        </div>

        <button
          onClick={handleExportFullCSV}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Complete Attendance CSV</span>
        </button>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Food Waste Prevented</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{foodSavedKg} kg</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{totalMealsSkippedAll} meals marked OUT</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Budget Saved</p>
            <p className="text-2xl font-black text-blue-700 mt-0.5">₹{moneySaved.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Overproduction avoided</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Servings Logged</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalMealsEatenAll}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Recorded across all dates</p>
          </div>
        </div>
      </div>

      {/* DATE BREAKDOWN VISUAL CHART */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Headcount Distribution for Selected Date</h3>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Select Date:</span>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Visual Bar Graphs per meal */}
        <div className="space-y-3.5 pt-2">
          {[
            { label: 'Breakfast', inCount: bIn, icon: Coffee, color: 'bg-amber-500' },
            { label: 'Lunch', inCount: lIn, icon: Sun, color: 'bg-orange-500' },
            { label: 'Evening Snacks', inCount: sIn, icon: Sunset, color: 'bg-purple-500' },
            { label: 'Dinner', inCount: dIn, icon: Moon, color: 'bg-indigo-500' },
          ].map((bar, idx) => {
            const percentage = Math.round((bar.inCount / (totalStudents || 1)) * 100);
            const Icon = bar.icon;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center text-slate-700">
                    <Icon className="w-4 h-4 mr-1.5 text-slate-500" />
                    {bar.label}
                  </span>
                  <span className="text-slate-900">
                    {bar.inCount} IN ({percentage}%) • {totalStudents - bar.inCount} OUT
                  </span>
                </div>
                {/* Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full ${bar.color} transition-all duration-500`}
                    style={{ width: `${Math.max(percentage, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AUDIT LOG SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Audit Trail (Who changed what & when)
            </h3>
          </div>
          <span className="text-xs text-slate-400">{messLogs.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4">Updated By</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Change Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {messLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{log.date}</td>
                  <td className="py-3 px-4 font-semibold text-blue-700">{log.updatedBy}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{log.details}</td>
                </tr>
              ))}

              {messLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
