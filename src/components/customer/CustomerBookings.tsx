import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Navigation,
  Phone,
  Send,
  Star,
  X,
} from 'lucide-react';
import {
  Booking,
  BookingStatus,
  ChatMessage,
  Professional,
} from '../../types/fixnear';
import { IntegrationNotice, ProAvatar } from '../common/BrandMark';

interface CustomerBookingsProps {
  bookings: Booking[];
  professionals: Professional[];
  messages: ChatMessage[];
  onApproveExtraQuote: (bookingId: string, approved: boolean) => void;
  onCancelBooking: (bookingId: string) => void;
  onRescheduleBooking: (bookingId: string, newDate: string, newSlot: string) => void;
  onSubmitReview: (bookingId: string, rating: number, comment: string) => void;
  onSendMessage: (bookingId: string, text: string, attachmentLabel?: string) => void;
  onBookNew: () => void;
}

const BOOKING_TIMELINE: BookingStatus[] = [
  'Request Pending',
  'Accepted',
  'Professional On The Way',
  'Professional Arrived',
  'Work In Progress',
  'Completed',
];

export const CustomerBookings: React.FC<CustomerBookingsProps> = ({
  bookings,
  professionals,
  messages,
  onApproveExtraQuote,
  onCancelBooking,
  onRescheduleBooking,
  onSubmitReview,
  onSendMessage,
  onBookNew,
}) => {
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    bookings[0]?.id || ''
  );
  const [chatOpenForId, setChatOpenForId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatAttachment, setChatAttachment] = useState<string | null>(null);

  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('Tomorrow, 16 Nov');
  const [newSlot, setNewSlot] = useState('11:00 AM – 12:00 PM');

  const [invoiceBookingId, setInvoiceBookingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (b) => !['Completed', 'Cancelled', 'Rejected'].includes(b.status)
      ),
    [bookings]
  );

  const pastBookings = useMemo(
    () =>
      bookings.filter((b) =>
        ['Completed', 'Cancelled', 'Rejected'].includes(b.status)
      ),
    [bookings]
  );

  const visibleList = tab === 'active' ? activeBookings : pastBookings;
  const activeDetail =
    visibleList.find((b) => b.id === selectedBookingId) || visibleList[0] || null;

  const activePro = activeDetail
    ? professionals.find((p) => p.id === activeDetail.professionalId) || null
    : null;

  const chatBooking = bookings.find((b) => b.id === chatOpenForId) || null;
  const chatThread = messages.filter((m) => m.bookingId === chatOpenForId);

  const invoiceBooking = bookings.find((b) => b.id === invoiceBookingId) || null;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatOpenForId || (!chatInput.trim() && !chatAttachment)) return;
    onSendMessage(
      chatOpenForId,
      chatInput.trim() || 'Shared an image attachment.',
      chatAttachment || undefined
    );
    setChatInput('');
    setChatAttachment(null);
  };

  const handleReviewSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBookingId) return;
    onSubmitReview(reviewBookingId, reviewRating, reviewComment.trim());
    setReviewBookingId(null);
    setReviewComment('');
  };

  const handleRescheduleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBookingId) return;
    onRescheduleBooking(rescheduleBookingId, newDate, newSlot);
    setRescheduleBookingId(null);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0F2647]">
            My Bookings & Live Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track arrival status, review itemized quotations, and message professionals
          </p>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-200/70 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors tabular-nums min-h-[36px] ${
              tab === 'active'
                ? 'bg-white text-[#0F2647] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('past')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors tabular-nums min-h-[36px] ${
              tab === 'past'
                ? 'bg-white text-[#0F2647] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            History ({pastBookings.length})
          </button>
        </div>
      </div>

      {visibleList.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="font-display text-base font-bold text-[#0F2647]">
            No {tab === 'active' ? 'active' : 'past'} bookings yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Book a verified local technician to track arrivals and quotations here.
          </p>
          <button
            type="button"
            onClick={onBookNew}
            className="mt-4 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1E40AF] min-h-[44px]"
          >
            Book a Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Bookings List Column */}
          <div className="lg:col-span-5 space-y-3">
            {visibleList.map((b) => {
              const selected = activeDetail?.id === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBookingId(b.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                    selected
                      ? 'border-[#1D4ED8] bg-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-medium text-slate-500 tabular-nums">
                      {b.id}
                    </span>
                    <span
                      className={`font-semibold ${
                        b.status === 'Completed'
                          ? 'text-emerald-700'
                          : b.status === 'Cancelled' || b.status === 'Rejected'
                          ? 'text-red-700'
                          : 'text-[#1D4ED8]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <h2 className="mt-1.5 font-display text-sm sm:text-base font-bold text-[#0F2647]">
                    {b.serviceTitle}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    {b.professionalName} · {b.scheduledDate} · {b.scheduledSlot}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {b.paymentMethod} · {b.paymentStatus}
                    </span>
                    <span className="font-mono font-semibold text-[#0F2647] tabular-nums">
                      ₹{b.quote.estimatedTotal}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Booking Tracking & Quotation Detail Column */}
          {activeDetail && (
            <div className="lg:col-span-7 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono text-slate-500 tabular-nums">
                      Booking {activeDetail.id} · Created {activeDetail.createdAt}
                    </p>
                    <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-[#0F2647]">
                      {activeDetail.serviceTitle}
                    </h2>
                    <p className="mt-1 text-xs text-slate-600">
                      {activeDetail.address}, {activeDetail.locality}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#1D4ED8]">
                    {activeDetail.status}
                  </span>
                </div>

                {/* Live Tracking Map Preview */}
                {!['Completed', 'Cancelled', 'Rejected'].includes(activeDetail.status) && (
                  <div className="rounded-xl border border-slate-200 bg-[#EEF2F6] overflow-hidden">
                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-semibold text-[#0F2647] flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-[#1D4ED8]" />
                        Live Job Tracking Route Preview
                      </span>
                      <span className="tabular-nums">
                        {activePro?.estimatedArrivalWindow || '15–25 mins'}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-slate-700 space-y-1">
                        <p>
                          <strong>Route:</strong> {activePro?.serviceArea || 'Nearby'} →{' '}
                          {activeDetail.locality}
                        </p>
                        <p className="text-slate-500">
                          Real-time Google Maps routing & live GPS updates activate in Phase 7 only while the professional shares location for this accepted job.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                {activeDetail.status !== 'Cancelled' &&
                  activeDetail.status !== 'Rejected' && (
                    <div className="pt-1">
                      <p className="text-xs font-semibold text-[#0F2647] mb-3">
                        Job Progress
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BOOKING_TIMELINE.map((st, idx) => {
                          const currentIdx = BOOKING_TIMELINE.indexOf(
                            activeDetail.status
                          );
                          const reached = currentIdx >= idx;
                          return (
                            <div
                              key={st}
                              className={`rounded-xl border px-3 py-2 text-[11px] ${
                                reached
                                  ? 'border-[#1D4ED8] bg-blue-50/50 text-[#0F2647] font-semibold'
                                  : 'border-slate-200 bg-slate-50 text-slate-400'
                              }`}
                            >
                              {idx + 1}. {st}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Professional Contact Bar */}
                {activePro && (
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ProAvatar
                        name={activePro.name}
                        src={activePro.avatarUrl}
                        sizeClass="w-11 h-11"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#0F2647]">
                          {activePro.name}
                        </p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          {activePro.rating.toFixed(1)} ★ · {activePro.phoneMasked}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActionNotice(
                            `Masked relay call to ${activePro.name} (${activePro.phoneMasked}) connects in Phase 7.`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[40px]"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#0F2647]" />
                        <span>Call</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatOpenForId(activeDetail.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D4ED8] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1E40AF] min-h-[40px]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Transparent Quotation Breakdown */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-[#0F2647]">
                      Itemized Quotation
                    </h3>
                    <button
                      type="button"
                      onClick={() => setInvoiceBookingId(activeDetail.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Digital Invoice</span>
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                    <div className="px-3.5 py-2.5 flex justify-between">
                      <span className="text-slate-600">Inspection Fee</span>
                      <span className="font-mono font-medium tabular-nums">
                        ₹{activeDetail.quote.inspectionFee}
                      </span>
                    </div>
                    <div className="px-3.5 py-2.5 flex justify-between">
                      <span className="text-slate-600">Labour Charges</span>
                      <span className="font-mono font-medium tabular-nums">
                        ₹{activeDetail.quote.labourCharges}
                      </span>
                    </div>
                    <div className="px-3.5 py-2.5 flex justify-between">
                      <span className="text-slate-600">Material Charges</span>
                      <span className="font-mono font-medium tabular-nums">
                        ₹{activeDetail.quote.materialCharges}
                      </span>
                    </div>
                    {activeDetail.quote.additionalCharges > 0 && (
                      <div className="px-3.5 py-2.5 flex justify-between bg-amber-50/70">
                        <span className="text-amber-900">
                          Additional Work ({activeDetail.quote.additionalWorkNote})
                        </span>
                        <span className="font-mono font-semibold text-amber-900 tabular-nums shrink-0 ml-2">
                          ₹{activeDetail.quote.additionalCharges}
                        </span>
                      </div>
                    )}
                    <div className="px-3.5 py-3 flex justify-between bg-slate-50 font-semibold text-[#0F2647]">
                      <span>Estimated Total</span>
                      <span className="font-mono text-sm tabular-nums">
                        ₹{activeDetail.quote.estimatedTotal}
                      </span>
                    </div>
                  </div>

                  {activeDetail.quote.additionalCharges > 0 &&
                    !activeDetail.quote.customerApprovedExtra && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2 text-xs text-amber-950">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <span>
                            Your approval is required before extra work begins.
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onApproveExtraQuote(activeDetail.id, false)}
                            className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 min-h-[36px]"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => onApproveExtraQuote(activeDetail.id, true)}
                            className="rounded-lg bg-[#0F2647] px-3 py-1.5 text-xs font-medium text-white min-h-[36px]"
                          >
                            Approve ₹{activeDetail.quote.additionalCharges}
                          </button>
                        </div>
                      </div>
                    )}
                </div>

                {/* Booking Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  {!['Completed', 'Cancelled', 'Rejected'].includes(activeDetail.status) && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setRescheduleBookingId(activeDetail.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[40px]"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelBooking(activeDetail.id)}
                        className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50 min-h-[40px]"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}

                  {activeDetail.status === 'Completed' && !activeDetail.reviewed && (
                    <button
                      type="button"
                      onClick={() => setReviewBookingId(activeDetail.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1E40AF] min-h-[42px]"
                    >
                      <Star className="w-4 h-4" />
                      <span>Rate & Review Service</span>
                    </button>
                  )}

                  {activeDetail.status === 'Completed' && activeDetail.reviewed && (
                    <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Reviewed ({activeDetail.userRating} ★) — One review per completed booking
                      </span>
                    </p>
                  )}

                  {activeDetail.paymentStatus !== 'Paid' &&
                    activeDetail.status !== 'Cancelled' && (
                      <button
                        type="button"
                        onClick={() =>
                          setActionNotice(
                            'Razorpay UPI / Online Payment Test Mode integrates in Phase 8. No simulated payment success is triggered in Phase 1.'
                          )
                        }
                        className="rounded-xl bg-[#0F2647] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#163663] min-h-[42px]"
                      >
                        Pay via {activeDetail.paymentMethod} (Phase 8)
                      </button>
                    )}
                </div>

                {actionNotice && (
                  <IntegrationNotice
                    title="Integration Status"
                    detail={actionNotice}
                    compact
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* In-App Chat Drawer */}
      {chatBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-slate-500">{chatBooking.id}</p>
                <h3 className="font-display text-base font-bold text-[#0F2647]">
                  Chat with {chatBooking.professionalName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setChatOpenForId(null)}
                className="p-2 text-slate-500 hover:text-slate-900"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
              {chatBooking.serviceTitle} · {chatBooking.scheduledDate} ({chatBooking.status})
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {chatThread.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.senderRole === 'customer' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                      m.senderRole === 'customer'
                        ? 'bg-[#1D4ED8] text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.attachmentLabel && (
                      <p className="mt-1 text-[11px] opacity-85 underline">
                        Attachment: {m.attachmentLabel}
                      </p>
                    )}
                  </div>
                  <span className="mt-1 text-[10px] text-slate-400">
                    {m.senderName} · {m.timestamp}
                  </span>
                </div>
              ))}
            </div>
            <form
              onSubmit={handleSendChat}
              className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <label
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
                title="Attach photo"
              >
                <ImageIcon className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setChatAttachment(f.name);
                  }}
                />
              </label>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  chatAttachment
                    ? `Attached ${chatAttachment} — add note...`
                    : 'Message professional...'
                }
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#1D4ED8] focus:outline-none min-h-[42px]"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-[#0F2647] text-white flex items-center justify-center hover:bg-[#163663] shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Rating & Review Modal */}
      {reviewBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleReviewSave}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#0F2647]">
                Rate Completed Job
              </h3>
              <button
                type="button"
                onClick={() => setReviewBookingId(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1.5 rounded-lg hover:bg-slate-50"
                  aria-label={`${star} stars`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              required
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share feedback on punctuality, cleanliness, and repair quality..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#1D4ED8] focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#1D4ED8] py-3 text-sm font-semibold text-white hover:bg-[#1E40AF] min-h-[44px]"
            >
              Submit Verified Review
            </button>
          </form>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRescheduleSave}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl"
          >
            <h3 className="font-display text-lg font-bold text-[#0F2647]">
              Reschedule Visit
            </h3>
            <select
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm min-h-[44px]"
            >
              <option value="Tomorrow, 16 Nov">Tomorrow, 16 Nov</option>
              <option value="Mon, 17 Nov">Mon, 17 Nov</option>
              <option value="Tue, 18 Nov">Tue, 18 Nov</option>
            </select>
            <select
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm min-h-[44px]"
            >
              <option value="11:00 AM – 12:00 PM">11:00 AM – 12:00 PM</option>
              <option value="03:00 PM – 04:00 PM">03:00 PM – 04:00 PM</option>
              <option value="06:00 PM – 07:00 PM">06:00 PM – 07:00 PM</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRescheduleBookingId(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 min-h-[44px]"
              >
                Keep Current
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#0F2647] py-2.5 text-xs font-semibold text-white min-h-[44px]"
              >
                Confirm Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Digital Invoice Modal */}
      {invoiceBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-semibold text-[#1D4ED8]">FIXNEAR Digital Invoice</p>
                <p className="font-mono text-sm font-bold text-[#0F2647]">
                  {invoiceBooking.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceBookingId(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs space-y-1.5 text-slate-600">
              <p>
                <strong>Customer:</strong> {invoiceBooking.customerName}
              </p>
              <p>
                <strong>Professional:</strong> {invoiceBooking.professionalName}
              </p>
              <p>
                <strong>Service:</strong> {invoiceBooking.serviceTitle}
              </p>
              <p>
                <strong>Payment:</strong> {invoiceBooking.paymentMethod} ({invoiceBooking.paymentStatus})
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
              <div className="px-3.5 py-2 flex justify-between">
                <span>Inspection Fee</span>
                <span className="font-mono tabular-nums">
                  ₹{invoiceBooking.quote.inspectionFee}
                </span>
              </div>
              <div className="px-3.5 py-2 flex justify-between">
                <span>Labour Charges</span>
                <span className="font-mono tabular-nums">
                  ₹{invoiceBooking.quote.labourCharges}
                </span>
              </div>
              <div className="px-3.5 py-2 flex justify-between">
                <span>Materials & Parts</span>
                <span className="font-mono tabular-nums">
                  ₹{invoiceBooking.quote.materialCharges}
                </span>
              </div>
              <div className="px-3.5 py-2 flex justify-between">
                <span>Approved Additional Work</span>
                <span className="font-mono tabular-nums">
                  ₹{invoiceBooking.quote.additionalCharges}
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex justify-between font-bold text-[#0F2647] bg-slate-50">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums">
                  ₹{invoiceBooking.quote.estimatedTotal}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInvoiceBookingId(null)}
              className="w-full rounded-xl bg-[#0F2647] py-2.5 text-xs font-semibold text-white min-h-[44px]"
            >
              Close Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
