import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KitchenDisplay } from './KitchenDisplay';
import { MenuManager } from './MenuManager';
import { AdminStudents } from './AdminStudents';
import { AdminTimings } from './AdminTimings';
import { AdminReports } from './AdminReports';
import { AdminSettings } from './AdminSettings';
import {
  UtensilsCrossed,
  BookOpen,
  Users,
  Clock,
  BarChart3,
  Settings,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { activeMess, data } = useApp();
  const [activeTab, setActiveTab] = useState<
    'kitchen' | 'menu' | 'students' | 'timings' | 'reports' | 'settings'
  >('kitchen');

  const pendingRequestsCount = data.joinRequests.filter(
    (r) => r.messId === activeMess?.id && r.status === 'pending'
  ).length;

  const adminTabs: {
    id: 'kitchen' | 'menu' | 'students' | 'timings' | 'reports' | 'settings';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'kitchen', label: 'Kitchen Display', icon: UtensilsCrossed },
    { id: 'menu', label: 'Live Menu', icon: BookOpen },
    { id: 'students', label: 'Students & Requests', icon: Users, badge: pendingRequestsCount },
    { id: 'timings', label: 'Cut-off Times', icon: Clock },
    { id: 'reports', label: 'Reports & Audit', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Plans', icon: Settings },
  ];

  return (
    <div className="pb-24 sm:pb-12">
      {/* Navigation Subheader */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-1 scrollbar-none">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-3 border-b-2 font-bold text-xs whitespace-nowrap flex items-center space-x-2 transition-all shrink-0 ${
                    isActive
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Tab View */}
      <main className="pt-2">
        {activeTab === 'kitchen' && <KitchenDisplay />}
        {activeTab === 'menu' && <MenuManager />}
        {activeTab === 'students' && <AdminStudents />}
        {activeTab === 'timings' && <AdminTimings />}
        {activeTab === 'reports' && <AdminReports />}
        {activeTab === 'settings' && <AdminSettings />}
      </main>

      {/* Mobile Bottom Navigation for Admin quick access */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 shadow-lg">
        <div className="grid grid-cols-4 gap-1 text-center">
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold ${
              activeTab === 'kitchen' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Kitchen</span>
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold ${
              activeTab === 'menu' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Menu</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold relative ${
              activeTab === 'students' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute top-0 right-4 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold ${
              activeTab === 'reports' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};
