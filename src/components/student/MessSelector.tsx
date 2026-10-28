import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Building2, MapPin, Users, KeyRound, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Mess } from '../../types';

export const MessSelector: React.FC = () => {
  const { data, currentStudent, requestJoinMess } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMess, setSelectedMess] = useState<Mess | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const filteredMesses = data.messes.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.institution.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q)
    );
  });

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMess) return;
    setStatusMessage(null);

    const res = requestJoinMess(selectedMess.id, codeInput);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        setSelectedMess(null);
        setCodeInput('');
      }, 1200);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900">Select Your Mess / Dining Hall</h2>
        <p className="text-sm text-slate-600 mt-1">
          Hello {currentStudent?.name || 'Student'}! Choose the mess you eat at to access live menus and daily headcount check-ins.
        </p>
      </div>

      {/* Pending status warning if already requested */}
      {currentStudent?.joinStatus === 'pending' && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="grow">
            <h4 className="text-sm font-bold text-amber-900">Join Request Pending Approval</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Your request to join your mess has been sent. The mess admin will approve your account shortly. You can choose another mess below if this was sent in error.
            </p>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by mess name, college/institution, or city..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl shadow-xs text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
        />
      </div>

      {/* Mess Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMesses.map((mess) => {
          const isSelected = selectedMess?.id === mess.id;
          return (
            <div
              key={mess.id}
              onClick={() => {
                setSelectedMess(mess);
                setStatusMessage(null);
                setCodeInput('');
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-md'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{mess.name}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {mess.institution}
                    </p>
                  </div>
                  {/* Mode Badge */}
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      mess.joinMode === 'open'
                        ? 'bg-emerald-100 text-emerald-800'
                        : mess.joinMode === 'code'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {mess.joinMode === 'open'
                      ? 'Instant Join'
                      : mess.joinMode === 'code'
                      ? 'Code Required'
                      : 'Approval'}
                  </span>
                </div>

                <div className="mt-4 flex items-center space-x-4 text-xs text-slate-500">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {mess.city}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {mess.activeStudentCount} diners
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600">
                  {isSelected ? 'Selected' : 'Tap to join →'}
                </span>
                {mess.joinMode === 'code' && (
                  <span className="text-[11px] text-slate-400 flex items-center font-mono">
                    <KeyRound className="w-3 h-3 mr-1" /> Code needed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMesses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No messes found</p>
          <p className="text-xs text-slate-400">Try searching for a different institution or city.</p>
        </div>
      )}

      {/* Selected Mess Join Action Modal / Sheet */}
      {selectedMess && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Join {selectedMess.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {selectedMess.institution} • {selectedMess.city}
            </p>

            {statusMessage && (
              <div
                className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center space-x-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleJoinSubmit} className="mt-5 space-y-4">
              {selectedMess.joinMode === 'open' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  This mess has <strong>Open Join</strong> enabled. You will be enrolled immediately and can check-in for meals right away.
                </div>
              )}

              {selectedMess.joinMode === 'code' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Mess Code
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Enter the code provided by your hostel warden (e.g. for Kaveri use{' '}
                    <code className="font-mono font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                      {selectedMess.messCode}
                    </code>
                    )
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Enter Mess Code"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 uppercase font-mono tracking-wider text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              )}

              {selectedMess.joinMode === 'approval' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                  This mess requires admin verification. Submitting will send your name ({currentStudent?.name}) and Roll No ({currentStudent?.rollNo}) to the mess manager for approval.
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMess(null)}
                  className="w-1/2 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  Confirm & Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
