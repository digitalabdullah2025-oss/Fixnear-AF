import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  MapPin,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { HERO_INTERIOR_IMAGE } from '../../data/mockDirectory';
import {
  Booking,
  OfferCoupon,
  Professional,
  ServiceCategory,
  ServiceCategoryId,
} from '../../types/fixnear';
import { ProAvatar } from '../common/BrandMark';
import { ServiceIcon } from '../common/ServiceIcon';

interface CustomerHomeProps {
  categories: ServiceCategory[];
  professionals: Professional[];
  bookings: Booking[];
  offers: OfferCoupon[];
  locality: string;
  onSelectCategory: (categoryId: ServiceCategoryId) => void;
  onOpenExplore: (categoryId?: ServiceCategoryId) => void;
  onOpenProfessional: (pro: Professional) => void;
  onStartBooking: (categoryId?: ServiceCategoryId, pro?: Professional) => void;
  onOpenBookings: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  categories,
  professionals,
  bookings,
  offers,
  locality,
  onSelectCategory,
  onOpenExplore,
  onOpenProfessional,
  onStartBooking,
  onOpenBookings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return showAllServices ? categories : categories.slice(0, 8);
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [categories, searchQuery, showAllServices]);

  const availableNearby = useMemo(
    () =>
      professionals
        .filter((p) => p.availability === 'Available')
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [professionals]
  );

  const fastestArriving = useMemo(
    () =>
      [...professionals]
        .filter((p) => p.availability !== 'Offline')
        .sort((a, b) => a.etaMinutesMin - b.etaMinutesMin)
        .slice(0, 3),
    [professionals]
  );

  const topRated = useMemo(
    () => [...professionals].sort((a, b) => b.rating - a.rating).slice(0, 3),
    [professionals]
  );

  const emergencyServices = useMemo(
    () => categories.filter((c) => c.isEmergency),
    [categories]
  );

  const handleCopyCoupon = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Search + Focal Hero Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Service area: {locality}</span>
            </p>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2647] text-balance">
              Find verified home repair experts nearby
            </h1>

            {/* Search bar */}
            <div className="mt-5 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What service do you need today?"
                aria-label="What service do you need today?"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-24 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-blue-100 min-h-[48px]"
              />
              <button
                type="button"
                onClick={() => onOpenExplore()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1E40AF] transition-colors min-h-[36px]"
              >
                Explore
              </button>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-[#0F2647] tabular-nums">
                {availableNearby.length} professionals
              </span>{' '}
              ready nearby · Transparent ₹ inspection quotes
            </div>
            <button
              type="button"
              onClick={() => onStartBooking()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] whitespace-nowrap"
            >
              <span>Quick Book Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-200 relative min-h-[200px]">
          {!heroImgFailed ? (
            <img
              src={HERO_INTERIOR_IMAGE}
              alt="Clean modern Indian apartment interior"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="w-full h-full object-cover lg:h-full"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center p-6 text-center">
              <span className="font-display font-semibold text-[#0F2647]">
                Trusted Indian Home Care
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent p-5 text-white">
            <p className="text-xs font-medium text-blue-200">
              Winter Home Care Offer
            </p>
            <p className="mt-0.5 font-display text-base font-semibold">
              ₹100 off AC & RO Preventive Servicing
            </p>
          </div>
        </div>
      </section>

      {/* 12 Service Categories */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#0F2647]">
              Home Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select a category to see matching verified technicians
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllServices((prev) => !prev)}
            className="text-xs sm:text-sm font-semibold text-[#1D4ED8] hover:text-[#1E40AF] whitespace-nowrap shrink-0 min-h-[40px] px-2"
          >
            {showAllServices ? 'Show Fewer' : 'View All Services'}
          </button>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-900">
              No service matches "{searchQuery}"
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try "AC Repair", "Electrician", "Plumber", or browse all categories.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 rounded-xl bg-[#0F2647] px-4 py-2 text-xs font-medium text-white min-h-[40px]"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="group rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-[#1D4ED8] hover:shadow-xs transition-all flex flex-col justify-between min-h-[120px]"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F2647] group-hover:bg-[#1D4ED8] group-hover:text-white flex items-center justify-center transition-colors">
                  <ServiceIcon categoryId={cat.id} className="w-5 h-5" />
                </div>
                <div className="mt-3">
                  <p className="font-display text-sm font-semibold text-[#0F2647] leading-snug">
                    {cat.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 tabular-nums">
                    Starts {cat.indicativeRange.split('–')[0].trim()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Popular Services & Indicative Pricing */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#0F2647]">
            Popular Services
          </h2>
          <button
            type="button"
            onClick={() => onOpenExplore()}
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-[#1D4ED8] whitespace-nowrap"
          >
            Compare local rates
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories
            .filter((c) => c.isPopular)
            .slice(0, 3)
            .map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#1D4ED8]">
                      Popular Service
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-600 tabular-nums">
                      {cat.indicativeRange}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold text-[#0F2647]">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 tabular-nums">
                    Inspection: {cat.inspectionFee}
                  </span>
                  <button
                    type="button"
                    onClick={() => onStartBooking(cat.id)}
                    className="rounded-lg bg-[#0F2647] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#163663] transition-colors min-h-[38px]"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Available Near You */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#0F2647]">
              Available Near You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Registered professionals ready for dispatch in {locality.split(',')[0]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenExplore()}
            className="text-xs sm:text-sm font-semibold text-[#1D4ED8] hover:text-[#1E40AF] whitespace-nowrap"
          >
            Open Map
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableNearby.slice(0, 4).map((pro) => (
            <div
              key={pro.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between"
            >
              <div className="flex items-start gap-3.5">
                <ProAvatar name={pro.name} src={pro.avatarUrl} sizeClass="w-14 h-14" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-base font-bold text-[#0F2647] truncate">
                      {pro.name}
                    </h3>
                    {pro.verified && (
                      <ShieldCheck
                        className="w-4 h-4 text-[#1D4ED8] shrink-0"
                        aria-label="Verified Professional"
                      />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 truncate">
                    {pro.skills.slice(0, 2).join(' · ')}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 tabular-nums">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {pro.rating.toFixed(1)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{pro.completedJobs} jobs</span>
                    <span aria-hidden="true">·</span>
                    <span>{pro.distanceKm} km away</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium">
                      Arrives {pro.estimatedArrivalWindow}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600 tabular-nums">
                  Est. charges{' '}
                  <span className="font-mono font-semibold text-[#0F2647]">
                    {pro.estimatedPriceRange}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenProfessional(pro)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors min-h-[38px]"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartBooking(pro.primaryCategory, pro)}
                    className="rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1E40AF] transition-colors min-h-[38px]"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fastest Arriving + Top Rated two-column split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-base sm:text-lg font-bold text-[#0F2647]">
            Fastest Arriving Professionals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Shortest travel window from your selected locality
          </p>
          <div className="mt-4 divide-y divide-slate-100">
            {fastestArriving.map((pro) => (
              <div
                key={pro.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ProAvatar name={pro.name} src={pro.avatarUrl} sizeClass="w-11 h-11" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F2647] truncate">
                      {pro.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate tabular-nums">
                      {pro.estimatedArrivalWindow} · {pro.distanceKm} km · {pro.availability}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenProfessional(pro)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] shrink-0 min-h-[36px]"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-base sm:text-lg font-bold text-[#0F2647]">
            Top Rated Professionals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Highest verified customer ratings across completed bookings
          </p>
          <div className="mt-4 divide-y divide-slate-100">
            {topRated.map((pro) => (
              <div
                key={pro.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ProAvatar name={pro.name} src={pro.avatarUrl} sizeClass="w-11 h-11" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F2647] truncate">
                      {pro.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate tabular-nums">
                      {pro.rating.toFixed(1)} ★ ({pro.reviewCount} reviews) · {pro.completedJobs} jobs
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenProfessional(pro)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] shrink-0 min-h-[36px]"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Home Services & Special Offers */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="font-display text-base sm:text-lg font-bold text-[#0F2647]">
              Emergency Home Services
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Urgent water leaks, power tripping, or cooling breakdown support
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {emergencyServices.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onStartBooking(item.id)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-[#1D4ED8] hover:bg-white transition-colors min-h-[44px]"
              >
                <p className="text-xs font-semibold text-[#0F2647]">{item.shortName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                  {item.inspectionFee} visit
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-base sm:text-lg font-bold text-[#0F2647]">
            Special Offers
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Apply verified discount codes during booking checkout
          </p>
          <div className="mt-4 space-y-2.5">
            {offers
              .filter((o) => o.active)
              .map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F2647] truncate">
                      {offer.title}
                    </p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {offer.discountLabel} · Min ₹{offer.minOrderInr} · Valid till {offer.validTill}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(offer.code)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-semibold text-[#1D4ED8] hover:bg-slate-50 shrink-0 min-h-[36px]"
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{offer.code}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Recently Booked Services */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-base sm:text-lg font-bold text-[#0F2647]">
            Recently Booked Services
          </h2>
          <button
            type="button"
            onClick={onOpenBookings}
            className="text-xs sm:text-sm font-semibold text-[#1D4ED8] hover:text-[#1E40AF]"
          >
            All Bookings
          </button>
        </div>
        {bookings.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No bookings yet. Select any category above to schedule your first home visit.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {bookings.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0F2647] truncate">
                    {b.serviceTitle}
                  </p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {b.id} · {b.professionalName} · {b.scheduledDate} · {b.status}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-semibold text-[#0F2647] tabular-nums">
                    ₹{b.quote.estimatedTotal}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenBookings}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[36px]"
                  >
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
