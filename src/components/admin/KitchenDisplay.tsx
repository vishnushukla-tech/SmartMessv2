import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  RefreshCw,
  Archive,
  Lock,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { MealType } from '../../types';
import { getTodayDateString, getTomorrowDateString } from '../../data/seedData';

export const KitchenDisplay: React.FC = () => {
  const {
    activeMess,
    data,
    selectedDate,
    setSelectedDate,
    archiveAttendanceForDate,
    logout,
  } = useApp();

  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMeal, setFilterMeal] = useState<'all' | 'unsubmitted' | MealType>('all');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Filter students belonging to this mess
  const messStudents = data.students.filter((s) => s.messId === activeMess?.id);

  // Attendance records for this mess & selectedDate
  const currentAttendance = data.attendance.filter(
    (a) => a.messId === activeMess?.id && a.date === selectedDate
  );

  // Calculate live counts
  let breakfastCount = 0;
  let lunchCount = 0;
  let snacksCount = 0;
  let dinnerCount = 0;

  currentAttendance.forEach((rec) => {
    if (rec.breakfast) breakfastCount++;
    if (rec.lunch) lunchCount++;
    if (rec.snacks) snacksCount++;
    if (rec.dinner) dinnerCount++;
  });

  const totalRegistered = messStudents.length;

  // Student roster rows: merge student profile with attendance record if present
  const rosterRows = messStudents.map((student) => {
    const record = currentAttendance.find((a) => a.studentUid === student.uid);
    return {
      student,
      record,
      hasSubmitted: !!record,
    };
  });

  // Filter rows based on search and filters
  const filteredRows = rosterRows.filter(({ student, record, hasSubmitted }) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMeal === 'all') return true;
    if (filterMeal === 'unsubmitted') return !hasSubmitted;

    // Filter by specific meal IN
    if (filterMeal === 'breakfast') return record?.breakfast ?? false;
    if (filterMeal === 'lunch') return record?.lunch ?? false;
    if (filterMeal === 'snacks') return record?.snacks ?? false;
    if (filterMeal === 'dinner') return record?.dinner ?? false;

    return true;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 450);
  };

  const handleArchive = () => {
    archiveAttendanceForDate(selectedDate);
    setShowArchiveModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Date', 'Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Submitted At'];
    const rows = rosterRows.map(({ student, record, hasSubmitted }) => [
      student.rollNo,
      `"${student.name}"`,
      selectedDate,
      record ? (record.breakfast ? 'IN' : 'OUT') : 'NOT SUBMITTED (DEFAULT IN)',
      record ? (record.lunch ? 'IN' : 'OUT') : 'NOT SUBMITTED (DEFAULT IN)',
      record ? (record.snacks ? 'IN' : 'OUT') : 'NOT SUBMITTED (DEFAULT IN)',
      record ? (record.dinner ? 'IN' : 'OUT') : 'NOT SUBMITTED (DEFAULT IN)',
      record?.lastSubmittedAt ? new Date(record.lastSubmittedAt).toLocaleTimeString() : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartMess_${activeMess?.name}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Date Switcher */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setSelectedDate(today)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDate === today ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(tomorrow)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDate === tomorrow ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tomorrow
            </button>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-hidden text-xs font-bold cursor-pointer"
            />
          </div>
        </div>

        {/* Live Status and Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Pulsing Live Beacon */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Auto-syncing live</span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all"
            title="Refresh Headcount"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">CSV</span>
          </button>

          <button
            onClick={() => setShowArchiveModal(true)}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all"
            title="Archive current headcount data"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Clear / Archive</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-xl transition-all"
            title="Lock Kitchen Display"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* 4 HUGE LIVE KITCHEN PREP COUNTERS */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Live Kitchen Prep Count</h2>
            <p className="text-xs text-slate-500">
              Total enrolled diners: <span className="font-bold text-slate-800">{totalRegistered}</span> • Target: {selectedDate}
            </p>
          </div>
          <span className="text-[11px] text-slate-400">Refreshed: {lastRefreshedAt}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Breakfast Counter */}
          <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500/30 shadow-md shadow-emerald-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center">
                <Coffee className="w-4 h-4 mr-1.5 text-amber-600" /> Breakfast
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {Math.round((breakfastCount / (totalRegistered || 1)) * 100)}% IN
              </span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {breakfastCount}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ {totalRegistered} Plates</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-bold">● {breakfastCount} IN</span>
              <span className="text-rose-600 font-bold">○ {totalRegistered - breakfastCount} OUT</span>
            </div>
          </div>

          {/* Lunch Counter */}
          <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500/30 shadow-md shadow-emerald-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center">
                <Sun className="w-4 h-4 mr-1.5 text-orange-500" /> Lunch
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {Math.round((lunchCount / (totalRegistered || 1)) * 100)}% IN
              </span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {lunchCount}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ {totalRegistered} Plates</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-bold">● {lunchCount} IN</span>
              <span className="text-rose-600 font-bold">○ {totalRegistered - lunchCount} OUT</span>
            </div>
          </div>

          {/* Snacks Counter */}
          <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500/30 shadow-md shadow-emerald-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center">
                <Sunset className="w-4 h-4 mr-1.5 text-purple-600" /> Snacks
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {Math.round((snacksCount / (totalRegistered || 1)) * 100)}% IN
              </span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {snacksCount}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ {totalRegistered} Plates</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-bold">● {snacksCount} IN</span>
              <span className="text-rose-600 font-bold">○ {totalRegistered - snacksCount} OUT</span>
            </div>
          </div>

          {/* Dinner Counter */}
          <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500/30 shadow-md shadow-emerald-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center">
                <Moon className="w-4 h-4 mr-1.5 text-indigo-600" /> Dinner
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {Math.round((dinnerCount / (totalRegistered || 1)) * 100)}% IN
              </span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {dinnerCount}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ {totalRegistered} Plates</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-bold">● {dinnerCount} IN</span>
              <span className="text-rose-600 font-bold">○ {totalRegistered - dinnerCount} OUT</span>
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT ROSTER TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative grow max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search student by roll no or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            {[
              { id: 'all', label: 'All Students' },
              { id: 'unsubmitted', label: '⚠️ Unsubmitted' },
              { id: 'breakfast', label: 'Breakfast IN' },
              { id: 'lunch', label: 'Lunch IN' },
              { id: 'snacks', label: 'Snacks IN' },
              { id: 'dinner', label: 'Dinner IN' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMeal(f.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  filterMeal === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4 text-center">Breakfast</th>
                <th className="py-3.5 px-4 text-center">Lunch</th>
                <th className="py-3.5 px-4 text-center">Snacks</th>
                <th className="py-3.5 px-4 text-center">Dinner</th>
                <th className="py-3.5 px-4 text-right">Submission Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRows.map(({ student, record, hasSubmitted }) => {
                const isUnsubmitted = !hasSubmitted;

                return (
                  <tr
                    key={student.uid}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isUnsubmitted ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        {isUnsubmitted && (
                          <span
                            title="Student has not submitted check-in yet"
                            className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                          />
                        )}
                        <span>{student.rollNo}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-800">
                      <div>
                        <span className="font-bold">{student.name}</span>
                        {isUnsubmitted && (
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            Auto IN
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Meal Badges: Green IN / Red OUT */}
                    <td className="py-3 px-4 text-center">
                      <MealBadge isIn={record ? record.breakfast : true} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <MealBadge isIn={record ? record.lunch : true} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <MealBadge isIn={record ? record.snacks : true} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <MealBadge isIn={record ? record.dinner : true} />
                    </td>

                    <td className="py-3 px-4 text-right text-slate-400 font-mono">
                      {record?.lastSubmittedAt ? (
                        new Date(record.lastSubmittedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      ) : (
                        <span className="text-amber-700 font-sans italic text-[11px]">Pending manual submit</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No students match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Clear / Archive */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Archive Headcount Data?</h3>
            </div>
            <p className="text-xs text-slate-600">
              This will archive the current attendance records for{' '}
              <span className="font-bold">{selectedDate}</span> and create an audit log. Data is preserved in audit archives rather than deleted.
            </p>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                className="w-1/2 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-colors"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MealBadge: React.FC<{ isIn: boolean }> = ({ isIn }) => {
  if (isIn) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
        IN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5" />
      OUT
    </span>
  );
};
