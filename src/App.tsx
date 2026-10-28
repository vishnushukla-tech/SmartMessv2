/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { EntryScreen } from './components/EntryScreen';
import { StudentDashboard } from './components/student/StudentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { usePwaInstall, PwaInstallBanner } from './components/common/PwaInstallPrompt';

function MainApp() {
  const { userRole } = useApp();
  const { isInstallable, triggerInstall } = usePwaInstall();
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Sticky Global Header */}
        <Header
          canInstall={isInstallable}
          onOpenInstall={() => setShowInstallBanner(true)}
        />

        {/* View Routing based on Role */}
        {!userRole && <EntryScreen />}
        {userRole === 'student' && <StudentDashboard />}
        {userRole === 'admin' && <AdminDashboard />}
      </div>

      {/* PWA In-App Install Prompt Banner */}
      <PwaInstallBanner
        isOpen={showInstallBanner}
        onClose={() => setShowInstallBanner(false)}
        onInstall={triggerInstall}
      />

      {/* Clean Global Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            SmartMess — Automated Kitchen Headcount Platform for Multi-Tenant Messes
          </p>
          <p className="text-slate-400">
            Real-time Firestore Sync • Zero-Waste Headcount AI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
