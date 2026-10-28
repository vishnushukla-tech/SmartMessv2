import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessSelector } from './MessSelector';
import { StudentCheckIn } from './StudentCheckIn';
import { StudentMenu } from './StudentMenu';
import { StudentHistory } from './StudentHistory';
import { StudentProfile } from './StudentProfile';
import {
  UtensilsCrossed,
  BookOpen,
  Calendar,
  User,
  CheckCircle2,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentStudent } = useApp();
  const [activeTab, setActiveTab] = useState<'checkin' | 'menu' | 'history' | 'profile'>('checkin');

  // If student hasn't joined a mess yet or is pending approval, show MessSelector
  if (!currentStudent?.messId || currentStudent.joinStatus !== 'joined') {
    return <MessSelector />;
  }

  return (
    <div className="pb-24 sm:pb-12">
      {/* Desktop Navigation Tabs */}
      <div className="hidden sm:block border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6">
            {[
              { id: 'checkin', label: 'Meal Check-in', icon: UtensilsCrossed },
              { id: 'menu', label: 'Live Menu', icon: BookOpen },
              { id: 'history', label: 'History & Savings', icon: Calendar },
              { id: 'profile', label: 'Profile & Mess', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-bold text-xs flex items-center space-x-2 transition-all ${
                    isActive
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Tab View */}
      <main className="pt-2">
        {activeTab === 'checkin' && <StudentCheckIn />}
        {activeTab === 'menu' && <StudentMenu />}
        {activeTab === 'history' && <StudentHistory />}
        {activeTab === 'profile' && <StudentProfile />}
      </main>

      {/* Phone-First Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'checkin', label: 'Check-in', icon: UtensilsCrossed },
            { id: 'menu', label: 'Menu', icon: BookOpen },
            { id: 'history', label: 'History', icon: Calendar },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive ? 'text-blue-600 font-extrabold bg-blue-50/70' : 'text-slate-500 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
