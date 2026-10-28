import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UtensilsCrossed,
  GraduationCap,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Hash,
  Building,
  KeyRound,
  QrCode,
  Users,
} from 'lucide-react';
import { UserRole, JoinMode } from '../types';

export const EntryScreen: React.FC = () => {
  const {
    selectRole,
    loginStudent,
    signupStudent,
    loginAdmin,
    registerMess,
    quickDemoLogin,
    data,
  } = useApp();

  // Mode: null (role picker), 'student-login', 'student-signup', 'admin-login', 'admin-register'
  const [authMode, setAuthMode] = useState<
    'picker' | 'student-login' | 'student-signup' | 'admin-login' | 'admin-register'
  >('picker');

  // Form states
  const [studentEmail, setStudentEmail] = useState('');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentPassword, setStudentPassword] = useState('password123');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminName, setAdminName] = useState('');

  // Register Mess state
  const [messName, setMessName] = useState('');
  const [institution, setInstitution] = useState('');
  const [city, setCity] = useState('');
  const [contact, setContact] = useState('');
  const [joinMode, setJoinMode] = useState<JoinMode>('open');
  const [customMessCode, setCustomMessCode] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginStudent(studentEmail, studentRollNo);
    if (!res.success) {
      setErrorMsg(res.error || 'Login failed');
    }
  };

  const handleStudentSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!studentName || !studentRollNo || !studentEmail) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    const res = signupStudent(studentName, studentRollNo, studentEmail);
    if (!res.success) {
      setErrorMsg(res.error || 'Signup failed');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginAdmin(adminEmail);
    if (!res.success) {
      setErrorMsg(res.error || 'Admin login failed');
    }
  };

  const handleAdminRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!messName || !institution || !city || !adminName || !adminEmail) {
      setErrorMsg('Please fill in all details for your mess registration.');
      return;
    }

    const generatedCode =
      customMessCode.trim().toUpperCase() ||
      `SM-${Math.floor(1000 + Math.random() * 9000)}`;

    const res = registerMess(
      {
        name: messName.trim(),
        institution: institution.trim(),
        city: city.trim(),
        contact: contact.trim() || '+91 98000 00000',
        joinMode,
        messCode: generatedCode,
        mealTimings: {
          breakfast: { label: 'Breakfast', start: '07:30', end: '09:30', cutoff: '07:00' },
          lunch: { label: 'Lunch', start: '12:30', end: '14:30', cutoff: '11:30' },
          snacks: { label: 'Evening Snacks', start: '17:00', end: '18:30', cutoff: '16:00' },
          dinner: { label: 'Dinner', start: '19:45', end: '21:45', cutoff: '18:45' },
        },
      },
      {
        name: adminName.trim(),
        email: adminEmail.trim(),
      }
    );

    if (res.success) {
      setSuccessMsg('Mess registered successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-4">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          SmartMess
        </h1>
        <p className="mt-2 text-sm font-medium text-blue-600 uppercase tracking-wider">
          Automated Kitchen Headcount Platform
        </p>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Real-time meal check-ins, automated kitchen prep counters, and AI menu scanning for hostels & dining halls.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* VIEW 1: ROLE SELECTION SCREEN */}
        {authMode === 'picker' && (
          <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200/80 space-y-5">
            <div className="text-center pb-2">
              <h2 className="text-lg font-bold text-slate-900">Choose Your Portal</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select how you want to access SmartMess</p>
            </div>

            {/* Student Button */}
            <button
              onClick={() => {
                setErrorMsg('');
                setAuthMode('student-login');
              }}
              className="w-full group relative flex items-center p-4 bg-linear-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all duration-200 shadow-xs text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 mr-4 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="grow">
                <span className="block text-base font-bold text-slate-900 group-hover:text-blue-700">
                  I'm a Student
                </span>
                <span className="block text-xs text-slate-600 mt-0.5">
                  Check IN/OUT for meals, view daily menu, and avoid food waste.
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform ml-2 shrink-0" />
            </button>

            {/* Mess Admin Button */}
            <button
              onClick={() => {
                setErrorMsg('');
                setAuthMode('admin-login');
              }}
              className="w-full group relative flex items-center p-4 bg-linear-to-r from-slate-50 to-amber-50/50 hover:from-amber-50 hover:to-orange-50 border-2 border-slate-200 hover:border-amber-400 rounded-xl transition-all duration-200 shadow-xs text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25 mr-4 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="grow">
                <span className="block text-base font-bold text-slate-900 group-hover:text-amber-800">
                  I'm a Mess Admin
                </span>
                <span className="block text-xs text-slate-600 mt-0.5">
                  Live kitchen prep counts, student roster, AI menu OCR & reports.
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform ml-2 shrink-0" />
            </button>

            {/* Demo One-Click Access Box */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                  <Sparkles className="w-3 h-3 text-amber-500 mr-1" /> Quick One-Click Demo
                </span>
                <span className="text-[10px] text-slate-400">Pre-seeded accounts</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => quickDemoLogin('student', 'std-1')}
                  className="p-2.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded-lg text-left transition-colors"
                >
                  <p className="text-xs font-bold text-blue-900">Rahul Sharma</p>
                  <p className="text-[10px] text-blue-700">Roll: CS21B001 (Student)</p>
                </button>
                <button
                  onClick={() => quickDemoLogin('admin', 'admin-aryabhatta')}
                  className="p-2.5 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-lg text-left transition-colors"
                >
                  <p className="text-xs font-bold text-amber-900">Chef Sharma</p>
                  <p className="text-[10px] text-amber-700">Aryabhatta Mess (Admin)</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: STUDENT LOGIN / SIGNUP */}
        {(authMode === 'student-login' || authMode === 'student-signup') && (
          <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200/80">
            {/* Header with Switch Role link */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {authMode === 'student-login' ? 'Student Sign In' : 'Create Student Account'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setErrorMsg('');
                  setAuthMode('admin-login');
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline transition-colors"
              >
                Switch role
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {authMode === 'student-login' ? (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Email or Roll Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul.s@smartmess.edu or CS21B001"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md shadow-blue-500/20 transition-all"
                >
                  Sign In as Student
                </button>

                {/* Pre-fill Quick Demo Student */}
                <button
                  type="button"
                  onClick={() => {
                    setStudentEmail('rahul.s@smartmess.edu');
                    setStudentPassword('password123');
                  }}
                  className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Fill demo student credentials (Rahul Sharma)
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">First time here? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setAuthMode('student-signup');
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Sign up once
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStudentSignup} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number / Hostel ID
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS21B001"
                      value={studentRollNo}
                      onChange={(e) => setStudentRollNo(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@college.edu"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Create a password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md shadow-blue-500/20 transition-all"
                >
                  Complete Registration & Pick Mess
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">Already registered? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setAuthMode('student-login');
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Log In
                  </button>
                </div>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setAuthMode('picker')}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                ← Back to main role selection
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: ADMIN LOGIN / MESS REGISTRATION */}
        {(authMode === 'admin-login' || authMode === 'admin-register') && (
          <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200/80">
            {/* Header with Switch Role link */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {authMode === 'admin-login' ? 'Mess Admin Login' : 'Register New Mess'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setErrorMsg('');
                  setAuthMode('student-login');
                }}
                className="text-xs font-semibold text-amber-600 hover:text-amber-800 underline transition-colors"
              >
                Switch role
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {authMode === 'admin-login' ? (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin.aryabhatta@smartmess.edu"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg shadow-md shadow-amber-500/20 transition-all"
                >
                  Access Kitchen Display & Dashboard
                </button>

                {/* Pre-fill Quick Demo Admin */}
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('admin.aryabhatta@smartmess.edu');
                    setAdminPassword('admin123');
                  }}
                  className="w-full text-center text-xs text-amber-700 hover:text-amber-900 font-medium"
                >
                  Fill demo admin credentials (Chef Sharma)
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">Need to register a dining hall? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setAuthMode('admin-register');
                    }}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800"
                  >
                    Register a Mess
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAdminRegister} className="space-y-3.5">
                <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-amber-800">
                  Register your mess facility once. You'll receive a unique Mess Code and printable QR code for students to scan.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mess / Dining Hall Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tagore Hostel Dining Hall"
                      value={messName}
                      onChange={(e) => setMessName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Institution</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IIT Delhi"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Join Mode</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'open', label: 'Open', sub: 'Instant join' },
                      { id: 'code', label: 'Mess Code', sub: 'Code required' },
                      { id: 'approval', label: 'Approval', sub: 'Admin review' },
                    ].map((mode) => (
                      <button
                        type="button"
                        key={mode.id}
                        onClick={() => setJoinMode(mode.id as JoinMode)}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          joinMode === mode.id
                            ? 'bg-amber-100/70 border-amber-500 text-amber-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <p className="text-xs">{mode.label}</p>
                        <p className="text-[10px] text-slate-500 font-normal">{mode.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {joinMode === 'code' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Mess Code (optional)</label>
                    <input
                      type="text"
                      placeholder="Leave blank to auto-generate (e.g. SM-4589)"
                      value={customMessCode}
                      onChange={(e) => setCustomMessCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-sm uppercase tracking-wider font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-800 mb-2">Admin Profile Credentials</p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Admin / Head Chef Name (e.g. Ramesh Kumar)"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Admin Email Address"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg shadow-md shadow-amber-500/20 transition-all"
                >
                  Register Mess & Open Kitchen Display
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">Already registered? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setAuthMode('admin-login');
                    }}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800"
                  >
                    Log In
                  </button>
                </div>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setAuthMode('picker')}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                ← Back to main role selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
