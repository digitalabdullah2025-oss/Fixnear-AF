import React, { useState } from 'react';
import {
  Bell,
  HelpCircle,
  LogOut,
  MapPin,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react';
import { INDIAN_LOCALITIES } from '../../data/mockDirectory';
import { UserRole, UserSession } from '../../types/fixnear';
import { IntegrationNotice, PWAInstallButton } from '../common/BrandMark';

interface CustomerProfileProps {
  session: UserSession;
  onUpdateLocality: (city: string, locality: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  session,
  onUpdateLocality,
  onSwitchRole,
  onLogout,
}) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [supportText, setSupportText] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportText.trim()) return;
    setSupportSubmitted(true);
    setSupportText('');
  };

  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0F2647]">
          Account & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your Indian service address, notifications, and workspace role
        </p>
      </div>

      {/* Customer Identity Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F2647] text-white flex items-center justify-center font-display text-lg font-bold shrink-0">
            {session.name
              .split(' ')
              .slice(0, 2)
              .map((s) => s[0])
              .join('')}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[#0F2647]">
              {session.name}
            </h2>
            <p className="text-xs text-slate-600 font-mono tabular-nums mt-0.5">
              {session.phone} · {session.email}
            </p>
            <p className="text-xs text-[#1D4ED8] mt-1 font-medium">
              {session.isPreviewMode ? 'Phase 1 UI Preview Session' : 'Verified Customer'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <PWAInstallButton variant="card" />
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saved Service Address */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1D4ED8]" />
            <h3 className="font-display text-base font-bold text-[#0F2647]">
              Primary Service Locality
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Used to match nearby verified professionals and estimate travel windows.
          </p>
          <select
            value={`${session.city}|${session.locality}`}
            onChange={(e) => {
              const [city, locality] = e.target.value.split('|');
              onUpdateLocality(city, locality);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 min-h-[44px]"
          >
            {INDIAN_LOCALITIES.map((loc) => (
              <option key={loc.locality} value={`${loc.city}|${loc.locality}`}>
                {loc.city} — {loc.locality}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1D4ED8]" />
            <h3 className="font-display text-base font-bold text-[#0F2647]">
              Booking Alerts & Push
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Receive booking acceptance, arrival, and quotation approval alerts via FCM (Phase 7).
          </p>
          <label className="flex items-center justify-between pt-2 cursor-pointer">
            <span className="text-sm font-medium text-slate-800">
              Job Status Updates
            </span>
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
              className="w-5 h-5 accent-[#1D4ED8]"
            />
          </label>
        </div>
      </div>

      {/* Role Switcher for Testing Phase 1 Workspaces */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h3 className="font-display text-base font-bold text-[#0F2647]">
          Switch Workspace Role (Phase 1 Review)
        </h3>
        <p className="text-xs text-slate-600">
          Inspect all three FIXNEAR role experiences — Customer, Service Professional, and Admin Control Panel.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onSwitchRole('customer')}
            className="flex items-center gap-2.5 rounded-xl border border-[#1D4ED8] bg-blue-50/40 px-4 py-3 text-left text-xs font-semibold text-[#0F2647] min-h-[48px]"
          >
            <User className="w-4 h-4 text-[#1D4ED8]" />
            <span>Customer App (Active)</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchRole('professional')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-xs font-semibold text-[#0F2647] hover:border-[#1D4ED8] min-h-[48px]"
          >
            <Wrench className="w-4 h-4 text-[#1D4ED8]" />
            <span>Service Professional</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchRole('admin')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-xs font-semibold text-[#0F2647] hover:border-[#1D4ED8] min-h-[48px]"
          >
            <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
            <span>Admin Control Panel</span>
          </button>
        </div>
      </div>

      {/* Help & Issue Reporting */}
      <form
        onSubmit={handleSupportSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#1D4ED8]" />
          <h3 className="font-display text-base font-bold text-[#0F2647]">
            Complaints & Support
          </h3>
        </div>
        <textarea
          rows={2}
          value={supportText}
          onChange={(e) => setSupportText(e.target.value)}
          placeholder="Describe a booking issue, pricing question, or feedback..."
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#1D4ED8] focus:outline-none"
        />
        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            className="rounded-xl bg-[#0F2647] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#163663] min-h-[40px]"
          >
            Raise Support Ticket
          </button>
          {supportSubmitted && (
            <span className="text-xs font-medium text-emerald-700">
              Ticket logged in UI preview. Live ticket sync connects in Phase 3.
            </span>
          )}
        </div>
      </form>

      <IntegrationNotice
        title="Backend & Auth Readiness"
        detail="Phase 1 runs with clean local UI state. Phase 2 connects Firebase Authentication (Mobile OTP, Google, Email), followed by Firestore, Google Maps Platform, and Razorpay."
      />
    </div>
  );
};
