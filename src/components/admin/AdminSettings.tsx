import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  KeyRound,
  QrCode,
  Users,
  CreditCard,
  Printer,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Download,
  Phone,
  MapPin,
} from 'lucide-react';
import QRCode from 'qrcode';

export const AdminSettings: React.FC = () => {
  const { activeMess, currentAdmin, data, resetAllDemoData } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activePlan, setActivePlan] = useState<'starter' | 'growth' | 'pro'>('growth');
  const [trialActive, setTrialActive] = useState(true);

  // Generate QR code for this mess
  useEffect(() => {
    if (activeMess) {
      const qrPayload = JSON.stringify({
        app: 'SmartMess',
        messId: activeMess.id,
        name: activeMess.name,
        code: activeMess.messCode,
        url: window.location.origin,
      });

      QRCode.toDataURL(qrPayload, { width: 300, margin: 2 }, (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      });
    }
  }, [activeMess]);

  const copyMessCode = () => {
    if (!activeMess) return;
    navigator.clipboard.writeText(activeMess.messCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrintQR = () => {
    window.print();
  };

  // Staff accounts in this mess
  const staffMembers = data.admins.filter((a) => a.messId === activeMess?.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Mess Settings & Billing</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Mess configuration, printable diner QR code, staff roster, and subscription tier.
        </p>
      </div>

      {/* MESS PROFILE & UNIQUE CODE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Mess Facility Profile</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Facility Name</span>
              <span className="font-bold text-slate-900 text-sm">{activeMess?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Institution / Campus</span>
              <span className="font-bold text-slate-900 text-sm">{activeMess?.institution}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Location</span>
              <span className="font-bold text-slate-900">{activeMess?.city}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Kitchen Contact</span>
              <span className="font-bold text-slate-900">{activeMess?.contact}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Student Join Mode</span>
              <span className="font-bold text-blue-700 capitalize bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                {activeMess?.joinMode === 'open'
                  ? 'Open (Instant Join)'
                  : activeMess?.joinMode === 'code'
                  ? 'Mess Code Required'
                  : 'Admin Approval'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Active Headcount</span>
              <span className="font-bold text-emerald-700">
                {activeMess?.activeStudentCount} Registered Students
              </span>
            </div>
          </div>

          {/* Unique Mess Code Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Unique Student Enrollment Code
              </span>
              <span className="font-mono text-xl font-black text-blue-700 tracking-wider">
                {activeMess?.messCode}
              </span>
            </div>

            <button
              onClick={copyMessCode}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PRINTABLE QR CODE CARD */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-between text-center">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center justify-center space-x-1.5">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Printable Mess QR Card</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Paste at dining entrance for easy student enrollment.
            </p>
          </div>

          <div className="my-4 p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Mess QR Code" className="w-44 h-44 object-contain" />
            ) : (
              <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
            <p className="text-[11px] font-mono font-bold text-slate-800 mt-1">{activeMess?.messCode}</p>
          </div>

          <div className="w-full flex space-x-2">
            <button
              onClick={handlePrintQR}
              className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`SmartMess_${activeMess?.messCode}_QR.png`}
                className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* STAFF ACCOUNTS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Kitchen Staff & Admin Accounts</h3>
          </div>
          <span className="text-xs text-slate-400">{staffMembers.length} Staff</span>
        </div>

        <div className="divide-y divide-slate-100">
          {staffMembers.map((staff) => (
            <div key={staff.uid} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">{staff.name}</p>
                <p className="text-slate-400">{staff.email}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full font-bold uppercase text-[10px] bg-slate-100 text-slate-700">
                {staff.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PLANS & BILLING (UI ONLY) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-base text-slate-900">Subscription Plans & SaaS Tiers</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simple headcount platform plans for college hostels, boarding schools & corporate cafeterias.
            </p>
          </div>

          {/* Free Trial Pill */}
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">
              {trialActive ? '14-Day Free Trial Active' : 'Trial Finished'}
            </span>
            <button
              onClick={() => setTrialActive(!trialActive)}
              className="text-[10px] text-emerald-600 underline font-medium ml-1"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Starter Plan */}
          <div
            onClick={() => setActivePlan('starter')}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              activePlan === 'starter'
                ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-1">Hostel Basic</h4>
              <p className="text-xs text-slate-500 mt-1">For small mess facilities & PG hostels.</p>
              <div className="mt-4 flex items-baseline space-x-1">
                <span className="text-3xl font-black text-slate-900">Free</span>
                <span className="text-xs text-slate-400 font-bold">forever</span>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>Up to 50 active students</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>Live 4-meal kitchen counters</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>Daily attendance roster</span>
                </li>
              </ul>
            </div>

            <button
              className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                activePlan === 'starter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {activePlan === 'starter' ? 'Current Plan' : 'Select Starter'}
            </button>
          </div>

          {/* Growth Plan (Popular) */}
          <div
            onClick={() => setActivePlan('growth')}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
              activePlan === 'growth'
                ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-md bg-linear-to-b from-blue-50/20 to-transparent'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="absolute -top-3 right-5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
              Most Popular
            </span>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Growth</span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-1">Campus Mess</h4>
              <p className="text-xs text-slate-500 mt-1">For standard college dining complexes.</p>
              <div className="mt-4 flex items-baseline space-x-1">
                <span className="text-3xl font-black text-slate-900">₹2,499</span>
                <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>Up to 350 active students</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>AI Multimodal Menu Scanning</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>Waste Analytics & CSV Reports</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>Printable QR enrollment cards</span>
                </li>
              </ul>
            </div>

            <button
              className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                activePlan === 'growth'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {activePlan === 'growth' ? 'Active Subscription' : 'Upgrade to Growth'}
            </button>
          </div>

          {/* Pro Plan */}
          <div
            onClick={() => setActivePlan('pro')}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              activePlan === 'pro'
                ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pro Enterprise</span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-1">Multi-Dining Hall</h4>
              <p className="text-xs text-slate-500 mt-1">Universities with multiple mess wings.</p>
              <div className="mt-4 flex items-baseline space-x-1">
                <span className="text-3xl font-black text-slate-900">₹5,999</span>
                <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>Unlimited diners & messes</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>Priority Gemini OCR processing</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>Multi-role staff RBAC permissions</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                  <span>Automated email audit dispatches</span>
                </li>
              </ul>
            </div>

            <button
              className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                activePlan === 'pro'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {activePlan === 'pro' ? 'Selected Pro' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center italic">
          Plans shown for demonstration purposes. No live credit card required in prototype preview.
        </p>
      </div>

      {/* Reset Demo Data Helper */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            if (confirm('Reset SmartMess to initial seeded state (two messes, 10 students)?')) {
              resetAllDemoData();
              window.location.reload();
            }
          }}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline transition-colors"
        >
          Reset Demo Data to Initial Seeds
        </button>
      </div>
    </div>
  );
};
