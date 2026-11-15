import React, { useState } from 'react';
import {
  Briefcase,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../data/mockDirectory';
import { Professional, ServiceCategoryId } from '../../types/fixnear';
import { IntegrationNotice, ProAvatar } from '../common/BrandMark';

interface ProfessionalProfileModalProps {
  professional: Professional;
  onClose: () => void;
  onBookNow: (categoryId: ServiceCategoryId, pro: Professional) => void;
  onMessageProfessional: (pro: Professional) => void;
}

export const ProfessionalProfileModal: React.FC<ProfessionalProfileModalProps> = ({
  professional,
  onClose,
  onBookNow,
  onMessageProfessional,
}) => {
  const [callNotice, setCallNotice] = useState(false);

  const categoryNames = professional.categories.map(
    (id) => SERVICE_CATEGORIES.find((c) => c.id === id)?.name || id
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${professional.name} Profile`}
    >
      <div className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Sticky top header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Service Professional Profile</p>
            <h2 className="font-display text-lg font-bold text-[#0F2647] truncate">
              {professional.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 shrink-0"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Identity Summary */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <ProAvatar
              name={professional.name}
              src={professional.avatarUrl}
              sizeClass="w-20 h-20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl font-bold text-[#0F2647]">
                  {professional.name}
                </h3>
                {professional.verified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
                    Verified Professional
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-700">
                    Verification Pending
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-600">
                {categoryNames.join(' · ')}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700 tabular-nums">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {professional.rating.toFixed(1)} ({professional.reviewCount} reviews)
                </span>
                <span className="text-slate-300">·</span>
                <span>{professional.completedJobs} completed jobs</span>
                <span className="text-slate-300">·</span>
                <span>{professional.experienceYears} yrs experience</span>
              </div>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {professional.bio}
              </p>
            </div>
          </div>

          {/* Operational Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-y border-slate-100 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#1D4ED8] mt-0.5 shrink-0" />
              <div>
                <p className="text-slate-500">Service Area</p>
                <p className="font-medium text-[#0F2647] mt-0.5">
                  {professional.serviceArea}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#1D4ED8] mt-0.5 shrink-0" />
              <div>
                <p className="text-slate-500">Working Hours</p>
                <p className="font-medium text-[#0F2647] mt-0.5 tabular-nums">
                  {professional.workingHours}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Briefcase className="w-4 h-4 text-[#1D4ED8] mt-0.5 shrink-0" />
              <div>
                <p className="text-slate-500">Arrival & Status</p>
                <p className="font-medium text-[#0F2647] mt-0.5 tabular-nums">
                  {professional.availability} · {professional.estimatedArrivalWindow}
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4 className="font-display text-sm font-bold text-[#0F2647]">
              Skills & Specializations
            </h4>
            <p className="mt-1.5 text-sm text-slate-600">
              {professional.skills.join('  ·  ')}
            </p>
          </div>

          {/* Indicative Charges */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-display text-sm font-bold text-[#0F2647]">
                Indicative Service Charges
              </h4>
              <span className="text-[11px] text-slate-500">
                Final extra work requires approval
              </span>
            </div>
            <div className="mt-2.5 rounded-xl border border-slate-200 divide-y divide-slate-100">
              {professional.pricingCatalog.map((item) => (
                <div
                  key={item.name}
                  className="px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    {item.requiresInspection && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Requires on-site inspection before quoting
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-[#0F2647] tabular-nums shrink-0">
                    {item.priceRange}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Customer Reviews */}
          <div>
            <h4 className="font-display text-sm font-bold text-[#0F2647]">
              Verified Customer Reviews
            </h4>
            {professional.reviews.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Verified booking reviews will appear here after completed jobs.
              </p>
            ) : (
              <div className="mt-2.5 space-y-3">
                {professional.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#0F2647]">
                        {rev.customerName}
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {rev.rating.toFixed(1)} ★ · {rev.date}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#1D4ED8] font-medium">
                      {rev.serviceTitle} · Verified Booking
                    </p>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {callNotice && (
            <IntegrationNotice
              title="Masked Call Relay (Phase 7)"
              detail={`Customer & professional phone privacy is protected via masked relay (${professional.phoneMasked}). Direct call relay activates after booking creation.`}
              compact
            />
          )}
        </div>

        {/* Sticky Footer CTA */}
        <div className="p-4 sm:px-6 border-t border-slate-200 bg-white flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCallNotice((prev) => !prev)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
          >
            <Phone className="w-4 h-4 text-[#0F2647]" />
            <span>Call</span>
          </button>
          <button
            type="button"
            onClick={() => onMessageProfessional(professional)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4 text-[#0F2647]" />
            <span>Message</span>
          </button>
          <button
            type="button"
            onClick={() => onBookNow(professional.primaryCategory, professional)}
            className="w-full sm:flex-1 rounded-xl bg-[#1D4ED8] py-3 px-5 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors min-h-[44px]"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
