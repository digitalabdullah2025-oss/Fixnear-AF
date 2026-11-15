import React, { useMemo, useState } from 'react';
import {
  Check,
  LogOut,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  Booking,
  CustomerRecord,
  OfferCoupon,
  Professional,
  ServiceCategory,
  ServiceCategoryId,
  SupportTicket,
  UserRole,
} from '../../types/fixnear';
import { BrandLogo, IntegrationNotice, ProAvatar } from '../common/BrandMark';

interface AdminDashboardProps {
  professionals: Professional[];
  customers: CustomerRecord[];
  bookings: Booking[];
  categories: ServiceCategory[];
  tickets: SupportTicket[];
  offers: OfferCoupon[];
  onVerifyProfessional: (
    proId: string,
    status: 'Verified' | 'Pending Review' | 'Suspended'
  ) => void;
  onUpdateCategoryPrice: (categoryId: ServiceCategoryId, newRange: string) => void;
  onUpdateTicketStatus: (
    ticketId: string,
    status: 'Open' | 'In Review' | 'Resolved'
  ) => void;
  onToggleOffer: (offerId: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
}

type AdminSection =
  | 'overview'
  | 'professionals'
  | 'customers'
  | 'bookings'
  | 'pricing'
  | 'support'
  | 'offers'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  professionals,
  customers,
  bookings,
  categories,
  tickets,
  offers,
  onVerifyProfessional,
  onUpdateCategoryPrice,
  onUpdateTicketStatus,
  onToggleOffer,
  onSwitchRole,
  onLogout,
}) => {
  const [section, setSection] = useState<AdminSection>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCatId, setEditingCatId] = useState<ServiceCategoryId | null>(null);
  const [priceDraft, setPriceDraft] = useState('');

  const verifiedProsCount = professionals.filter(
    (p) => p.verificationStatus === 'Verified'
  ).length;
  const pendingProsCount = professionals.filter(
    (p) => p.verificationStatus === 'Pending Review'
  ).length;
  const activeBookingsCount = bookings.filter(
    (b) => !['Completed', 'Cancelled', 'Rejected'].includes(b.status)
  ).length;
  const completedBookingsCount = bookings.filter(
    (b) => b.status === 'Completed'
  ).length;
  const cancelledBookingsCount = bookings.filter(
    (b) => b.status === 'Cancelled'
  ).length;

  const grossRevenue = useMemo(
    () =>
      bookings
        .filter((b) => b.status !== 'Cancelled' && b.status !== 'Rejected')
        .reduce((sum, b) => sum + b.quote.estimatedTotal, 0),
    [bookings]
  );

  const navItems: { id: AdminSection; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'professionals', label: `Professionals (${pendingProsCount} pending)` },
    { id: 'customers', label: 'Customers' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'pricing', label: 'Services & Pricing' },
    { id: 'support', label: 'Support & Reviews' },
    { id: 'offers', label: 'Offers & Coupons' },
    { id: 'settings', label: 'Platform Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo />
            <span className="hidden sm:inline text-xs font-medium text-slate-500">
              Admin Control Panel
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onSwitchRole('customer')}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[40px]"
            >
              Customer View
            </button>
            <button
              type="button"
              onClick={() => onSwitchRole('professional')}
              className="hidden sm:inline-flex rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[40px]"
            >
              Partner View
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F2647] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#163663] min-h-[40px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
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
        </aside>

        {/* Main Panel */}
        <main className="lg:col-span-9 space-y-6">
          {section === 'overview' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Registered Customers</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#0F2647] tabular-nums">
                    {customers.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Total Professionals</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#0F2647] tabular-nums">
                    {professionals.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Verified Professionals</p>
                  <p className="mt-1 font-display text-2xl font-bold text-emerald-700 tabular-nums">
                    {verifiedProsCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Pending Verifications</p>
                  <p className="mt-1 font-display text-2xl font-bold text-amber-700 tabular-nums">
                    {pendingProsCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Active Bookings</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#1D4ED8] tabular-nums">
                    {activeBookingsCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Completed Bookings</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#0F2647] tabular-nums">
                    {completedBookingsCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Cancelled Bookings</p>
                  <p className="mt-1 font-display text-2xl font-bold text-red-700 tabular-nums">
                    {cancelledBookingsCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Booking Volume</p>
                  <p className="mt-1 font-mono text-xl font-bold text-[#0F2647] tabular-nums">
                    ₹{grossRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <IntegrationNotice
                title="Admin RBAC & Cloud Functions Notice"
                detail="Phase 1 demonstrates all Admin controls against local preview state. Production role-based security rules (admins collection) and trusted Cloud Functions connect in Phases 3 & 8."
              />
            </>
          )}

          {section === 'professionals' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-[#0F2647]">
                  Professional Verification & Account Control
                </h2>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search professionals..."
                    className="rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs w-full sm:w-56"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {professionals
                  .filter((p) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((pro) => (
                    <div
                      key={pro.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <ProAvatar
                          name={pro.name}
                          src={pro.avatarUrl}
                          sizeClass="w-12 h-12"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-display text-sm font-bold text-[#0F2647]">
                              {pro.name}
                            </p>
                            <span
                              className={`text-xs font-semibold ${
                                pro.verificationStatus === 'Verified'
                                  ? 'text-emerald-700'
                                  : pro.verificationStatus === 'Pending Review'
                                  ? 'text-amber-700'
                                  : 'text-red-700'
                              }`}
                            >
                              {pro.verificationStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {pro.serviceArea} · {pro.experienceYears} yrs exp ·{' '}
                            <span className="font-mono">{pro.governmentIdMasked}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onVerifyProfessional(pro.id, 'Verified')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 min-h-[36px]"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onVerifyProfessional(pro.id, 'Suspended')}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 min-h-[36px]"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {section === 'customers' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0F2647]">
                Registered Customers
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 pr-4 font-medium">Name</th>
                      <th className="py-2.5 pr-4 font-medium">City</th>
                      <th className="py-2.5 pr-4 font-medium">Mobile</th>
                      <th className="py-2.5 pr-4 font-medium text-right">Bookings</th>
                      <th className="py-2.5 font-medium text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 pr-4 font-semibold text-[#0F2647]">{c.name}</td>
                        <td className="py-3 pr-4 text-slate-600">{c.city}</td>
                        <td className="py-3 pr-4 font-mono text-slate-600">{c.phoneMasked}</td>
                        <td className="py-3 pr-4 text-right font-mono">{c.totalBookings}</td>
                        <td className="py-3 text-right text-slate-500">{c.joinedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === 'bookings' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0F2647]">
                Platform Bookings Ledger
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 pr-4 font-medium">ID</th>
                      <th className="py-2.5 pr-4 font-medium">Service</th>
                      <th className="py-2.5 pr-4 font-medium">Customer</th>
                      <th className="py-2.5 pr-4 font-medium">Professional</th>
                      <th className="py-2.5 pr-4 font-medium">Status</th>
                      <th className="py-2.5 text-right font-medium">Estimate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums">
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 pr-4 font-mono text-slate-700">{b.id}</td>
                        <td className="py-3 pr-4 font-medium text-[#0F2647]">{b.serviceTitle}</td>
                        <td className="py-3 pr-4 text-slate-600">{b.customerName}</td>
                        <td className="py-3 pr-4 text-slate-600">{b.professionalName}</td>
                        <td className="py-3 pr-4 font-medium text-[#1D4ED8]">{b.status}</td>
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

          {section === 'pricing' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0F2647]">
                  Service Categories & Indicative Pricing Ranges
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure transparent sample price ranges across all 12 home service categories
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-display text-sm font-bold text-[#0F2647]">
                        {cat.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Inspection: {cat.inspectionFee} · {cat.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {editingCatId === cat.id ? (
                        <>
                          <input
                            type="text"
                            value={priceDraft}
                            onChange={(e) => setPriceDraft(e.target.value)}
                            className="w-32 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (priceDraft.trim()) {
                                onUpdateCategoryPrice(cat.id, priceDraft.trim());
                              }
                              setEditingCatId(null);
                            }}
                            className="p-2 rounded-lg bg-[#1D4ED8] text-white"
                            aria-label="Save price range"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600"
                            aria-label="Cancel edit"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-xs font-semibold text-[#0F2647] tabular-nums">
                            {cat.indicativeRange}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setPriceDraft(cat.indicativeRange);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[34px]"
                          >
                            Edit Range
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'support' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0F2647]">
                Complaints & Support Tickets
              </h2>
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-mono text-slate-500">
                        {t.id} · Booking {t.bookingId} · {t.createdAt}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#0F2647]">{t.subject}</p>
                      <p className="text-xs text-slate-500">
                        Raised by {t.raisedBy} ({t.role})
                      </p>
                    </div>
                    <select
                      value={t.status}
                      onChange={(e) =>
                        onUpdateTicketStatus(
                          t.id,
                          e.target.value as 'Open' | 'In Review' | 'Resolved'
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium min-h-[40px]"
                    >
                      <option value="Open">Open</option>
                      <option value="In Review">In Review</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'offers' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0F2647]">
                Offers & Coupons
              </h2>
              <div className="divide-y divide-slate-100">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-mono text-sm font-bold text-[#1D4ED8]">
                        {offer.code} · {offer.discountLabel}
                      </p>
                      <p className="text-xs text-slate-700 mt-0.5">{offer.title}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        Min order ₹{offer.minOrderInr} · Valid till {offer.validTill}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleOffer(offer.id)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-semibold min-h-[38px] ${
                        offer.active
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {offer.active ? 'Active' : 'Paused'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'settings' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0F2647]">
                Platform Integration Readiness (Phases 2–8)
              </h2>
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0F2647]">Firebase Authentication</p>
                    <p className="text-xs text-slate-500">Phone OTP (+91), Google Sign-In, Email/Password</p>
                  </div>
                  <span className="text-xs font-medium text-amber-700">Scheduled Phase 2</span>
                </div>
                <div className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0F2647]">Firestore & Security Rules</p>
                    <p className="text-xs text-slate-500">14 collections + RBAC rules + Cloud Functions</p>
                  </div>
                  <span className="text-xs font-medium text-amber-700">Scheduled Phase 3</span>
                </div>
                <div className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0F2647]">Google Maps Platform</p>
                    <p className="text-xs text-slate-500">Maps JS SDK, Places, Routes API ETA, Geocoding</p>
                  </div>
                  <span className="text-xs font-medium text-amber-700">Scheduled Phase 4</span>
                </div>
                <div className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0F2647]">Razorpay Payment Gateway (India)</p>
                    <p className="text-xs text-slate-500">UPI, Cards, Cash on Completion, Refund verification</p>
                  </div>
                  <span className="text-xs font-medium text-amber-700">Scheduled Phase 8</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
