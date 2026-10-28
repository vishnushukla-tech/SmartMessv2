import React from 'react';
import { useApp } from '../../context/AppContext';
import { UtensilsCrossed, LogOut, Wifi, WifiOff, RefreshCw, Smartphone, ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  onOpenInstall?: () => void;
  canInstall?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInstall, canInstall }) => {
  const {
    userRole,
    currentStudent,
    currentAdmin,
    activeMess,
    logout,
    selectRole,
    quickDemoLogin,
    isOnline,
    resetAllDemoData,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mess Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {}}>
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">SmartMess</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800">
                  {userRole === 'admin' ? 'Kitchen Admin' : userRole === 'student' ? 'Student' : 'Platform'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[180px] sm:max-w-[280px]">
                {activeMess ? activeMess.name : 'Automated Headcount'}
              </p>
            </div>
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Online / Offline indicator */}
            <div
              className={`hidden sm:flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isOnline ? 'Cloud Synced' : 'Working Offline (Cached)'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Install PWA Prompt button */}
            {canInstall && (
              <button
                onClick={onOpenInstall}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                title="Install SmartMess PWA to Home Screen"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Install App</span>
              </button>
            )}

            {/* Demo Quick Switcher */}
            <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => quickDemoLogin('student', 'std-1')}
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  userRole === 'student'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Test as student: Rahul Sharma"
              >
                <span className="flex items-center space-x-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Student Demo</span>
                </span>
              </button>
              <button
                onClick={() => quickDemoLogin('admin', 'admin-aryabhatta')}
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  userRole === 'admin'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Test as mess admin: Chef Sharma"
              >
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Demo</span>
                </span>
              </button>
            </div>

            {/* User profile / Logout */}
            {userRole ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">
                    {userRole === 'student' ? currentStudent?.name || 'Student' : currentAdmin?.name || 'Chef Admin'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {userRole === 'student' ? currentStudent?.rollNo || 'Enrolled' : 'Manager'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
