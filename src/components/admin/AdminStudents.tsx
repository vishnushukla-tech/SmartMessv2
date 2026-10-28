import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Trash2,
  Mail,
  Hash,
  Sparkles,
} from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const {
    activeMess,
    data,
    approveJoinRequest,
    rejectJoinRequest,
    removeStudentFromMess,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'enrolled'>('requests');
  const [searchQuery, setSearchQuery] = useState('');

  // Pending requests for this mess
  const pendingRequests = data.joinRequests.filter(
    (r) => r.messId === activeMess?.id && r.status === 'pending'
  );

  // Active enrolled students for this mess
  const enrolledStudents = data.students.filter(
    (s) => s.messId === activeMess?.id && s.joinStatus === 'joined'
  );

  const filteredEnrolled = enrolledStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Student Membership & Join Requests
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student diner registrations and approvals for {activeMess?.name}.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center shrink-0">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'requests'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending Requests</span>
            {pendingRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'enrolled'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Enrolled Diners ({enrolledStudents.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PENDING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">All caught up!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                There are no pending student join requests waiting for approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900">{req.studentName}</h4>
                        <p className="text-xs font-mono font-bold text-blue-600 mt-0.5">
                          Roll No: {req.studentRollNo}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Pending</span>
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-slate-500 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.studentEmail}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex space-x-2">
                    <button
                      onClick={() => rejectJoinRequest(req.id)}
                      className="w-1/2 py-2 px-3 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => approveJoinRequest(req.id)}
                      className="w-1/2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve & Enroll</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ENROLLED STUDENTS ROSTER */}
      {activeTab === 'enrolled' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search enrolled students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Dietary Preference</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEnrolled.map((std) => (
                  <tr key={std.uid} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{std.rollNo}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{std.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{std.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {std.dietaryPref || 'Veg'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${std.name} (${std.rollNo}) from ${activeMess?.name}?`)) {
                            removeStudentFromMess(std.uid);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredEnrolled.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No enrolled students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
