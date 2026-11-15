import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../data/mockDirectory';
import { Booking, Professional, ServiceCategoryId } from '../../types/fixnear';
import { IntegrationNotice, ProAvatar } from '../common/BrandMark';

interface BookingFlowModalProps {
  professionals: Professional[];
  locality: string;
  customerName: string;
  customerPhone: string;
  initialCategoryId?: ServiceCategoryId;
  initialProfessional?: Professional | null;
  onClose: () => void;
  onSubmitBooking: (booking: Booking) => void;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  professionals,
  locality,
  customerName,
  customerPhone,
  initialCategoryId = 'ac-repair',
  initialProfessional = null,
  onClose,
  onSubmitBooking,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialProfessional ? 2 : 1);
  const [categoryId, setCategoryId] = useState<ServiceCategoryId>(initialCategoryId);
  const [problemDescription, setProblemDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState<{ name: string; previewUrl: string; isVideo: boolean }[]>([]);
  const [address, setAddress] = useState('Flat 304, Palm Grove Residency, 12th Main');
  const [scheduledDate, setScheduledDate] = useState('Today, 15 Nov');
  const [scheduledSlot, setScheduledSlot] = useState('02:00 PM – 03:00 PM');
  const [selectedProId, setSelectedProId] = useState<string>(
    initialProfessional?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'Cash on Completion' | 'UPI' | 'Online Payment'
  >('UPI');
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => SERVICE_CATEGORIES.find((c) => c.id === categoryId) || SERVICE_CATEGORIES[0],
    [categoryId]
  );

  // Intelligent matching ranking: category match, availability, distance, ETA, rating
  const matchedProfessionals = useMemo(() => {
    const exactMatches = professionals.filter(
      (p) => p.categories.includes(categoryId) && p.availability !== 'Offline'
    );
    const pool =
      exactMatches.length > 0
        ? exactMatches
        : professionals.filter((p) => p.availability !== 'Offline');

    return [...pool].sort((a, b) => {
      if (a.availability !== b.availability) {
        return a.availability === 'Available' ? -1 : 1;
      }
      return a.etaMinutesMin - b.etaMinutesMin || b.rating - a.rating;
    });
  }, [professionals, categoryId]);

  const activePro = useMemo(
    () =>
      matchedProfessionals.find((p) => p.id === selectedProId) ||
      matchedProfessionals[0] ||
      null,
    [matchedProfessionals, selectedProId]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const next = Array.from(files)
      .slice(0, 4)
      .map((f) => ({
        name: f.name,
        previewUrl: URL.createObjectURL(f),
        isVideo: f.type.startsWith('video/'),
      }));
    setMediaFiles((prev) => [...prev, ...next].slice(0, 4));
  };

  const inspectionFee = activePro?.inspectionFeeInr ?? 149;
  const labourEstimate = activePro?.startingPriceInr ?? 299;
  const estimatedTotal = inspectionFee + labourEstimate;

  const handleNext = () => {
    setValidationError(null);
    if (step === 2) {
      if (problemDescription.trim().length < 6) {
        setValidationError('Please describe the issue briefly (e.g., "My AC is not cooling properly").');
        return;
      }
      if (!address.trim()) {
        setValidationError('Please enter your complete house/flat address.');
        return;
      }
    }
    if (step === 3 && !activePro) {
      setValidationError('Please select a matching professional.');
      return;
    }
    setStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : prev));
  };

  const handleConfirmSubmit = () => {
    if (!activePro) return;
    const newBooking: Booking = {
      id: `FXN-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhoneMasked: customerPhone,
      address,
      locality,
      serviceCategory: categoryId,
      serviceTitle: `${selectedCategory.shortName}: ${problemDescription.slice(0, 42)}`,
      problemDescription,
      scheduledDate,
      scheduledSlot,
      professionalId: activePro.id,
      professionalName: activePro.name,
      status: 'Request Pending',
      paymentMethod,
      paymentStatus: 'Pending',
      quote: {
        inspectionFee,
        labourCharges: labourEstimate,
        materialCharges: 0,
        additionalCharges: 0,
        customerApprovedExtra: true,
        estimatedTotal,
      },
      createdAt: 'Just now (UI Preview)',
      mediaNames: mediaFiles.map((m) => m.name),
    };
    onSubmitBooking(newBooking);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Book Home Service"
    >
      <div className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                aria-label="Previous step"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#1D4ED8] tabular-nums">
                Step {step} of 4 · {selectedCategory.name}
              </p>
              <h2 className="font-display text-lg font-bold text-[#0F2647] truncate">
                {step === 1 && 'Select Service Category'}
                {step === 2 && 'Describe Problem & Address'}
                {step === 3 && 'Select Matching Professional'}
                {step === 4 && 'Review Quotation & Submit'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 shrink-0"
            aria-label="Close booking dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`rounded-xl border p-3.5 text-left transition-colors min-h-[76px] ${
                    categoryId === cat.id
                      ? 'border-[#1D4ED8] bg-blue-50/50 text-[#0F2647]'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <p className="font-display text-xs sm:text-sm font-semibold">
                    {cat.name}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 tabular-nums">
                    {cat.indicativeRange}
                  </p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F2647]">
                  Describe the issue
                </label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Example: My AC is not cooling properly and water drips from the indoor unit."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2647]">
                  Upload photos or short videos (optional)
                </label>
                <label className="mt-1.5 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-xs font-medium text-slate-600 hover:border-[#1D4ED8] cursor-pointer">
                  <Upload className="w-4 h-4 text-[#1D4ED8]" />
                  <span>Attach up to 4 images or videos of the problem</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
                {mediaFiles.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {mediaFiles.map((file) => (
                      <div
                        key={file.name}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700"
                      >
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F2647]">
                    Visit Date
                  </label>
                  <select
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 min-h-[44px]"
                  >
                    <option value="Today, 15 Nov">Today, 15 Nov</option>
                    <option value="Tomorrow, 16 Nov">Tomorrow, 16 Nov</option>
                    <option value="Mon, 17 Nov">Mon, 17 Nov</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F2647]">
                    Preferred Time Slot
                  </label>
                  <select
                    value={scheduledSlot}
                    onChange={(e) => setScheduledSlot(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 min-h-[44px]"
                  >
                    <option value="10:30 AM – 11:30 AM">10:30 AM – 11:30 AM</option>
                    <option value="02:00 PM – 03:00 PM">02:00 PM – 03:00 PM</option>
                    <option value="05:00 PM – 06:00 PM">05:00 PM – 06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2647]">
                  Service Address ({locality})
                </label>
                <div className="mt-1.5 relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-[#1D4ED8] focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Ranked by matching category, distance, availability, working hours, and estimated arrival window:
              </p>
              {matchedProfessionals.map((pro) => {
                const isSelected = activePro?.id === pro.id;
                return (
                  <button
                    key={pro.id}
                    type="button"
                    onClick={() => setSelectedProId(pro.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#1D4ED8] bg-blue-50/40'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProAvatar name={pro.name} src={pro.avatarUrl} sizeClass="w-12 h-12" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-display text-sm font-bold text-[#0F2647] truncate">
                            {pro.name}
                          </p>
                          {pro.verified && (
                            <ShieldCheck className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 tabular-nums mt-0.5">
                          <Star className="w-3 h-3 inline fill-amber-400 text-amber-400 mr-0.5" />
                          {pro.rating.toFixed(1)} · {pro.distanceKm} km · Arriving in{' '}
                          {pro.estimatedArrivalWindow}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs font-semibold text-[#0F2647] tabular-nums">
                        {pro.estimatedPriceRange}
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {pro.availability}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && activePro && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ProAvatar
                    name={activePro.name}
                    src={activePro.avatarUrl}
                    sizeClass="w-12 h-12"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-[#0F2647]">
                      {activePro.name}
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#1D4ED8]" />
                      <span>
                        {scheduledDate} · {scheduledSlot}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-600 tabular-nums shrink-0">
                  {activePro.estimatedArrivalWindow}
                </span>
              </div>

              {/* Transparent Quotation Breakdown */}
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                <div className="px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Inspection & Visit Charge</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    ₹{inspectionFee}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Estimated Base Labour</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    ₹{labourEstimate}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Materials / Spare Parts</span>
                  <span className="text-xs text-slate-500">
                    Quoted only after inspection
                  </span>
                </div>
                <div className="px-4 py-3.5 flex items-center justify-between bg-slate-50">
                  <span className="font-display text-sm font-bold text-[#0F2647]">
                    Estimated Starting Total
                  </span>
                  <span className="font-mono text-base font-bold text-[#0F2647] tabular-nums">
                    ₹{estimatedTotal}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#0F2647]">
                  Preferred Payment Method
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(['UPI', 'Cash on Completion', 'Online Payment'] as const).map(
                    (method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-xl border py-2.5 px-2 text-xs font-medium transition-colors min-h-[44px] ${
                          paymentMethod === method
                            ? 'border-[#1D4ED8] bg-blue-50/50 text-[#0F2647]'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        {method}
                      </button>
                    )
                  )}
                </div>
              </div>

              <IntegrationNotice
                title="Phase 1 UI Preview Submission"
                detail="Additional work or spare parts always require your explicit approval. Live Firebase booking dispatch & Razorpay payment verification activate in Phases 3, 6 & 8."
                compact
              />
            </div>
          )}

          {validationError && (
            <p role="alert" className="text-xs font-medium text-red-700">
              {validationError}
            </p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:px-6 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 tabular-nums">
            {step >= 3 && activePro ? (
              <>
                Est. Total:{' '}
                <strong className="font-mono text-sm text-[#0F2647]">
                  ₹{estimatedTotal}
                </strong>
              </>
            ) : (
              <span>Indicative {selectedCategory.indicativeRange}</span>
            )}
          </div>
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl bg-[#1D4ED8] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors min-h-[44px]"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F2647] px-6 py-3 text-sm font-semibold text-white hover:bg-[#163663] transition-colors min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Booking Request</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
