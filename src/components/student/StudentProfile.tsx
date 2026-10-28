import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Hash,
  Mail,
  Building2,
  LogOut,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Utensils,
  KeyRound,
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { currentStudent, activeMess, updateStudentProfile, leaveOrChangeMess, logout } = useApp();

  const [name, setName] = useState(currentStudent?.name || '');
  const [rollNo, setRollNo] = useState(currentStudent?.rollNo || '');
  const [dietaryPref, setDietaryPref] = useState(currentStudent?.dietaryPref || 'Veg');
  const [newPassword, setNewPassword] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile({
      name: name.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      dietaryPref: dietaryPref as any,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Student Profile & Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage your identity, dining mess, and dietary preferences.</p>
      </div>

      {/* Current Mess Info Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Enrolled Mess</h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Active Member
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="font-bold text-sm text-slate-800">{activeMess?.name || 'No Mess Assigned'}</p>
          <p className="text-xs text-slate-500">{activeMess?.institution} • {activeMess?.city}</p>
        </div>

        <button
          onClick={leaveOrChangeMess}
          className="w-full py-2.5 px-3 border border-slate-300 hover:border-red-400 hover:text-red-600 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
        >
          <span>Change / Transfer Mess</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">Personal Details</h3>

        {savedFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile changes saved successfully!</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number / Hostel ID</label>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-3 py-2 text-sm uppercase font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Preference</label>
          <div className="grid grid-cols-4 gap-2">
            {['Veg', 'Non-Veg', 'Jain', 'All'].map((pref) => (
              <button
                type="button"
                key={pref}
                onClick={() => setDietaryPref(pref as any)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  dietaryPref === pref
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Change Password (optional)</label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
        >
          Save Profile Updates
        </button>
      </form>

      {/* Logout */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of SmartMess</span>
        </button>
      </div>
    </div>
  );
};
