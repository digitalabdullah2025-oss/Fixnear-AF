import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  LogOut,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Power,
  ShieldCheck,
  Star,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../data/mockDirectory';
import {
  Booking,
  BookingStatus,
  ChatMessage,
  Professional,
  ServiceCategoryId,
  UserRole,
  UserSession,
} from '../../types/fixnear';
import { BrandLogo, IntegrationNotice, ProAvatar } from '../common/BrandMark';

interface ProfessionalDashboardProps {
  session: UserSession;
  professional: Professional;
  bookings: Booking[];
  messages: ChatMessage[];
  onToggleAvailability: (nextStatus: 'Available' | 'Offline') => void;
  onUpdateBookingStatus: (bookingId: string, nextStatus: BookingStatus) => void;
  onUpdateQuote: (
    bookingId: string,
    labour: number,
    material: number,
    extra: number,
    extraNote: string
  ) => void;
  onSendMessage: (bookingId: string, text: string) => void;
  onUpdateProfile: (updated: Partial<Professional>) => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
}

type ProSection = 'overview' | 'jobs' | 'earnings' | 'reviews' | 'onboarding';

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({
  session,
  professional,
  bookings,
  messages,
  onToggleAvailability,
  onUpdateBookingStatus,
  onUpdateQuote,
  onSendMessage,
  onUpdateProfile,
  onSwitchRole,
  onLogout,
}) => {
  const [section, setSection] = useState<ProSection>('overview');
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [quoteEditBooking, setQuoteEditBooking] = useState<Booking | null>(null);
  const [labourVal, setLabourVal] = useState(400);
  const [materialVal, setMaterialVal] = useState(0);
  const [extraVal, setExtraVal] = useState(0);
  const [extraNote, setExtraNote] = useState('');

  // Onboarding / Registration form state
  const [regName, setRegName] = useState(professional.name);
  const [regPhone, setRegPhone] = useState(session.phone);
  const [regEmail, setRegEmail] = useState(session.email);
  const [regExp, setRegExp] = useState(String(professional.experienceYears));
  const [regArea, setRegArea] = useState(professional.serviceArea);
  const [regHours, setRegHours] = useState(professional.workingHours);
  const [regSkills, setRegSkills] = useState(professional.skills.join(', '));
  const [regCategories, setRegCategories] = useState<ServiceCategoryId[]>(
    professional.categories
  );
  const [regGovId, setRegGovId] = useState(professional.governmentIdMasked || 'AADHAAR •••• 7821');
  const [regUpiBank, setRegUpiBank] = useState('rahul.sharma@okicici · HDFC •••• 4012');
  const [regSaved, setRegSaved] = useState(false);

  const isOnline = professional.availability !== 'Offline';

  const myBookings = useMemo(
    () => bookings.filter((b) => b.professionalId === professional.id),
    [bookings, professional.id]
  );

  const pendingRequests = myBookings.filter((b) => b.status === 'Request Pending');
  const activeJobs = myBookings.filter((b) =>
    [
      'Accepted',
      'Professional On The Way',
      'Professional Arrived',
      'Work In Progress',
    ].includes(b.status)
  );
  const completedJobsList = myBookings.filter((b) => b.status === 'Completed');

  const totalEarnings = useMemo(
    () =>
      completedJobsList.reduce((sum, b) => sum + b.quote.estimatedTotal, 0) +
      14250,
    [completedJobsList]
  );

  const handleOnlineToggle = () => {
    if (!isOnline) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGeoMessage(
              `Location permission granted (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}). You are now discoverable to nearby customers.`
            );
            onToggleAvailability('Available');
          },
          () => {
            setGeoMessage(
              'Browser location permission denied or unavailable. Live GPS updates require location access in Phase 4.'
            );
            onToggleAvailability('Available');
          },
          { timeout: 5000 }
        );
      } else {
        onToggleAvailability('Available');
      }
    } else {
      setGeoMessage('You are now OFFLINE. Location updates paused and profile hidden from active dispatch.');
      onToggleAvailability('Offline');
    }
  };

  const openQuoteModal = (booking: Booking) => {
    setQuoteEditBooking(booking);
    setLabourVal(booking.quote.labourCharges);
    setMaterialVal(booking.quote.materialCharges);
    setExtraVal(booking.quote.additionalCharges);
    setExtraNote(booking.quote.additionalWorkNote || '');
  };

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteEditBooking) return;
    onUpdateQuote(quoteEditBooking.id, labourVal, materialVal, extraVal, extraNote);
    setQuoteEditBooking(null);
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: regName.trim() || professional.name,
      experienceYears: Number(regExp) || professional.experienceYears,
      serviceArea: regArea.trim() || professional.serviceArea,
      workingHours: regHours.trim() || professional.workingHours,
      skills: regSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      categories: regCategories.length > 0 ? regCategories : professional.categories,
    });
    setRegSaved(true);
    window.setTimeout(() => setRegSaved(false), 3000);
  };

  const toggleCategory = (id: ServiceCategoryId) => {
    setRegCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const navItems: { id: ProSection; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'jobs', label: `Jobs (${pendingRequests.length + activeJobs.length})` },
    { id: 'earnings', label: 'Earnings' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'onboarding', label: 'Profile & KYC' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo />
            <span className="hidden sm:inline text-xs font-medium text-slate-500">
              Partner Portal
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Prominent ONLINE / OFFLINE Toggle */}
            <button
              type="button"
              onClick={handleOnlineToggle}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors min-h-[40px] ${
                isOnline
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchRole('customer')}
              className="hidden md:inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[40px]"
            >
              Customer View
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[40px]"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation (Desktop) / Horizontal Tabs (Mobile) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <ProAvatar
              name={professional.name}
              src={professional.avatarUrl}
              sizeClass="w-12 h-12"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-display text-sm font-bold text-[#0F2647] truncate">
                  {professional.name}
                </p>
                {professional.verified && (
                  <ShieldCheck className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">{professional.serviceArea}</p>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`px-4 py-2.5 rounded-xl text-left text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 min-h-[42px] ${
                  section === item.id
                    ? 'bg-[#0F2647] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold text-[#0F2647]">Workspace Switcher</p>
            <button
              type="button"
              onClick={() => onSwitchRole('customer')}
              className="w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:border-[#1D4ED8]"
            >
              Switch to Customer App
            </button>
            <button
              type="button"
              onClick={() => onSwitchRole('admin')}
              className="w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:border-[#1D4ED8]"
            >
              Switch to Admin Console
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {geoMessage && (
            <IntegrationNotice title="Availability & GPS Status" detail={geoMessage} compact />
          )}

          {section === 'overview' && (
            <>
              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Today's Jobs</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#0F2647] tabular-nums">
                    {pendingRequests.length + activeJobs.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Pending Requests</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#1D4ED8] tabular-nums">
                    {pendingRequests.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Accepted Jobs</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#0F2647] tabular-nums">
                    {activeJobs.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Completed Jobs</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#0F2647] tabular-nums">
                    {professional.completedJobs}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Total Earnings</p>
                  <p className="mt-1 font-mono text-xl font-bold text-emerald-700 tabular-nums">
                    ₹{totalEarnings.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Avg. Rating</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#0F2647] tabular-nums">
                    {professional.rating.toFixed(1)} ★
                  </p>
                </div>
              </div>

              {/* Pending & Active Queue */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[#0F2647]">
                    Incoming Requests & Active Jobs
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSection('jobs')}
                    className="text-xs font-semibold text-[#1D4ED8]"
                  >
                    Manage All
                  </button>
                </div>

                {myBookings.filter((b) => !['Completed', 'Cancelled', 'Rejected'].includes(b.status))
                  .length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No active requests right now. Toggle ONLINE above to stay visible to nearby customers.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myBookings
                      .filter((b) => !['Completed', 'Cancelled', 'Rejected'].includes(b.status))
                      .map((b) => (
                        <div
                          key={b.id}
                          className="rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-mono text-slate-500">{b.id}</span>
                              <span className="text-slate-300">·</span>
                              <span className="font-semibold text-[#1D4ED8]">{b.status}</span>
                            </div>
                            <h3 className="font-display text-base font-bold text-[#0F2647]">
                              {b.serviceTitle}
                            </h3>
                            <p className="text-xs text-slate-600">
                              {b.status === 'Request Pending'
                                ? `${b.locality} (Customer contact reveals after acceptance)`
                                : `${b.customerName} · ${b.address}, ${b.locality}`}
                            </p>
                            <p className="text-xs text-slate-500 tabular-nums">
                              Slot: {b.scheduledDate} · {b.scheduledSlot} · Est. ₹{b.quote.estimatedTotal}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {b.status === 'Request Pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onUpdateBookingStatus(b.id, 'Rejected')}
                                  className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 min-h-[40px]"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Reject</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onUpdateBookingStatus(b.id, 'Accepted')}
                                  className="inline-flex items-center gap-1 rounded-xl bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF] min-h-[40px]"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Accept Job</span>
                                </button>
                              </>
                            )}
                            {b.status === 'Accepted' && (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateBookingStatus(b.id, 'Professional On The Way')
                                }
                                className="rounded-xl bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white min-h-[40px]"
                              >
                                Start Travel
                              </button>
                            )}
                            {b.status === 'Professional On The Way' && (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateBookingStatus(b.id, 'Professional Arrived')
                                }
                                className="rounded-xl bg-[#0F2647] px-4 py-2 text-xs font-semibold text-white min-h-[40px]"
                              >
                                Mark as Arrived
                              </button>
                            )}
                            {b.status === 'Professional Arrived' && (
                              <button
                                type="button"
                                onClick={() => onUpdateBookingStatus(b.id, 'Work In Progress')}
                                className="rounded-xl bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white min-h-[40px]"
                              >
                                Start Work
                              </button>
                            )}
                            {b.status === 'Work In Progress' && (
                              <button
                                type="button"
                                onClick={() => onUpdateBookingStatus(b.id, 'Completed')}
                                className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white min-h-[40px]"
                              >
                                Mark Completed
                              </button>
                            )}
                            {b.status !== 'Request Pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openQuoteModal(b)}
                                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[40px]"
                                >
                                  Quotation
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setChatBookingId(b.id)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[40px]"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Chat</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}

          {section === 'jobs' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0F2647]">
                All Assigned Bookings ({myBookings.length})
              </h2>
              <div className="divide-y divide-slate-100">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-slate-500">
                        {b.id} · {b.status}
                      </p>
                      <p className="font-display text-sm font-bold text-[#0F2647]">
                        {b.serviceTitle}
                      </p>
                      <p className="text-xs text-slate-600">{b.problemDescription}</p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {b.scheduledDate} · {b.scheduledSlot} · {b.locality}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className="font-mono text-sm font-bold text-[#0F2647] tabular-nums mr-2">
                        ₹{b.quote.estimatedTotal}
                      </span>
                      {b.status !== 'Request Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setGeoMessage(
                                `Turn-by-turn navigation to ${b.address}, ${b.locality} opens via Google Maps Routes in Phase 4.`
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 min-h-[36px]"
                          >
                            <Navigation className="w-3.5 h-3.5 text-[#1D4ED8]" />
                            <span>Navigate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setGeoMessage(
                                `Masked customer call relay (${b.customerPhoneMasked}) connects in Phase 7.`
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 min-h-[36px]"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'earnings' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#0F2647]">
                    Earnings & Payout History
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Transparent ledger of completed customer jobs & settlements
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total Settled</p>
                  <p className="font-mono text-lg font-bold text-emerald-700 tabular-nums">
                    ₹{totalEarnings.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 pr-4 font-medium">Booking ID</th>
                      <th className="py-2.5 pr-4 font-medium">Service</th>
                      <th className="py-2.5 pr-4 font-medium">Date</th>
                      <th className="py-2.5 pr-4 font-medium">Mode</th>
                      <th className="py-2.5 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums">
                    {myBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 pr-4 font-mono text-slate-700">{b.id}</td>
                        <td className="py-3 pr-4 font-medium text-[#0F2647]">{b.serviceTitle}</td>
                        <td className="py-3 pr-4 text-slate-600">{b.scheduledDate}</td>
                        <td className="py-3 pr-4 text-slate-600">
                          {b.paymentMethod} ({b.paymentStatus})
                        </td>
                        <td className="py-3 text-right font-mono font-semibold text-[#0F2647]">
                          ₹{b.quote.estimatedTotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === 'reviews' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#0F2647]">
                  Verified Customer Reviews
                </h2>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[#0F2647] tabular-nums">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {professional.rating.toFixed(1)} ({professional.reviewCount})
                </span>
              </div>
              <div className="space-y-3">
                {professional.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0F2647]">{r.customerName}</span>
                      <span className="text-slate-500 tabular-nums">
                        {r.rating}.0 ★ · {r.date}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-[#1D4ED8]">{r.serviceTitle}</p>
                    <p className="mt-1.5 text-xs text-slate-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'onboarding' && (
            <form
              onSubmit={handleRegistrationSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#0F2647]">
                    Professional Registration & Verification Profile
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Keep skills, service area, working hours, KYC ID, and payout details updated
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                  <UserCheck className="w-4 h-4" />
                  {professional.verificationStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Mobile Number</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={regExp}
                    onChange={(e) => setRegExp(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Service Area</label>
                  <input
                    type="text"
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Working Hours</label>
                  <input
                    type="text"
                    value={regHours}
                    onChange={(e) => setRegHours(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Government ID (Aadhaar / License / PAN)
                  </label>
                  <input
                    type="text"
                    value={regGovId}
                    onChange={(e) => setRegGovId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Bank / UPI Payout Details
                  </label>
                  <input
                    type="text"
                    value={regUpiBank}
                    onChange={(e) => setRegUpiBank(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Service Categories
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SERVICE_CATEGORIES.map((cat) => {
                    const active = regCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
                          active
                            ? 'bg-[#1D4ED8] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat.shortName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={regSkills}
                  onChange={(e) => setRegSkills(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm min-h-[44px]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[#0F2647] px-6 py-3 text-sm font-semibold text-white hover:bg-[#163663] min-h-[44px]"
                >
                  Save Profile Changes
                </button>
                {regSaved && (
                  <span className="text-xs font-semibold text-emerald-700">
                    Profile updated in Phase 1 UI state.
                  </span>
                )}
              </div>
            </form>
          )}
        </main>
      </div>

      {/* Quotation Update Modal */}
      {quoteEditBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveQuote}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl"
          >
            <h3 className="font-display text-lg font-bold text-[#0F2647]">
              Update Job Quotation ({quoteEditBooking.id})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Labour Charges (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={labourVal}
                  onChange={(e) => setLabourVal(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Material Charges (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={materialVal}
                  onChange={(e) => setMaterialVal(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Additional Work Charges (₹ — Requires Customer Approval)
              </label>
              <input
                type="number"
                min={0}
                value={extraVal}
                onChange={(e) => setExtraVal(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Additional Work Explanation
              </label>
              <input
                type="text"
                value={extraNote}
                onChange={(e) => setExtraNote(e.target.value)}
                placeholder="e.g., Capacitor replacement after load test"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuoteEditBooking(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#1D4ED8] py-2.5 text-xs font-semibold text-white min-h-[44px]"
              >
                Send Quote Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Professional Chat Modal */}
      {chatBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#0F2647]">
                Customer Chat · {chatBookingId}
              </h3>
              <button
                type="button"
                onClick={() => setChatBookingId(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages
                .filter((m) => m.bookingId === chatBookingId)
                .map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.senderRole === 'professional' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                        m.senderRole === 'professional'
                          ? 'bg-[#0F2647] text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="mt-1 text-[10px] text-slate-400">
                      {m.senderName} · {m.timestamp}
                    </span>
                  </div>
                ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                onSendMessage(chatBookingId, chatInput.trim());
                setChatInput('');
              }}
              className="p-3.5 border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Reply to customer..."
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm min-h-[42px]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-xs font-semibold text-white min-h-[42px]"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
