/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import {
  Bell,
  CalendarCheck,
  ChevronDown,
  Compass,
  Crosshair,
  Home,
  MapPin,
  User,
  X,
} from 'lucide-react';
import {
  INDIAN_LOCALITIES,
  SAMPLE_BOOKINGS,
  SAMPLE_CHAT_MESSAGES,
  SAMPLE_CUSTOMERS,
  SAMPLE_NOTIFICATIONS,
  SAMPLE_OFFERS,
  SAMPLE_PROFESSIONALS,
  SAMPLE_TICKETS,
  SERVICE_CATEGORIES,
} from './data/mockDirectory';
import {
  Booking,
  BookingStatus,
  ChatMessage,
  CustomerTab,
  NotificationItem,
  OfferCoupon,
  Professional,
  ServiceCategory,
  ServiceCategoryId,
  SupportTicket,
  UserRole,
  UserSession,
} from './types/fixnear';
import { BrandLogo, OfflineIndicator, PWAInstallButton } from './components/common/BrandMark';
import { SplashAndWelcome } from './components/auth/SplashAndWelcome';
import { CustomerHome } from './components/customer/CustomerHome';
import { ExploreDiscovery } from './components/customer/ExploreDiscovery';
import { CustomerBookings } from './components/customer/CustomerBookings';
import { CustomerProfile } from './components/customer/CustomerProfile';
import { ProfessionalProfileModal } from './components/customer/ProfessionalProfileModal';
import { BookingFlowModal } from './components/customer/BookingFlowModal';
import { ProfessionalDashboard } from './components/professional/ProfessionalDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');

  // Shared reactive Phase 1 UI state across Customer, Professional & Admin
  const [categories, setCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES);
  const [professionals, setProfessionals] = useState<Professional[]>(SAMPLE_PROFESSIONALS);
  const [bookings, setBookings] = useState<Booking[]>(SAMPLE_BOOKINGS);
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_CHAT_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);
  const [offers, setOffers] = useState<OfferCoupon[]>(SAMPLE_OFFERS);
  const [tickets, setTickets] = useState<SupportTicket[]>(SAMPLE_TICKETS);

  // Customer UI overlays
  const [exploreCategory, setExploreCategory] = useState<ServiceCategoryId | 'all'>('all');
  const [profileModalPro, setProfileModalPro] = useState<Professional | null>(null);
  const [bookingModalState, setBookingModalState] = useState<{
    open: boolean;
    categoryId?: ServiceCategoryId;
    pro?: Professional | null;
  }>({ open: false });

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const handleRequestGeolocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('Browser geolocation is unavailable on this device.');
      return;
    }
    setGeoStatus('Requesting location permission...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setSession((prev) => (prev ? { ...prev, coordinates: coords } : prev));
        setGeoStatus(
          `GPS permission granted (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(
            4
          )}). Reverse geocoding & live nearby matching connect via Google Maps Platform in Phase 4.`
        );
      },
      (err) => {
        setGeoStatus(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. You can still select your Indian city and locality manually.'
            : 'Unable to detect GPS coordinates right now. Select your locality manually.'
        );
      },
      { timeout: 6000 }
    );
  };

  const handleEnterApp = (newSession: UserSession) => {
    setSession(newSession);
    setCustomerTab('home');
  };

  const handleLogout = () => {
    setSession(null);
    setNotificationsOpen(false);
    setLocationModalOpen(false);
  };

  const handleSwitchRole = (role: UserRole) => {
    setSession((prev) => (prev ? { ...prev, role } : prev));
  };

  // Shared booking/review/chat handlers
  const handleCreateBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Booking Request Submitted',
        message: `${newBooking.serviceTitle} sent to ${newBooking.professionalName}.`,
        timestamp: 'Just now',
        read: false,
        category: 'booking',
      },
      ...prev,
    ]);
    setBookingModalState({ open: false });
    setCustomerTab('bookings');
  };

  const handleApproveExtraQuote = (bookingId: string, approved: boolean) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        if (approved) {
          return {
            ...b,
            quote: { ...b.quote, customerApprovedExtra: true },
          };
        }
        const reducedTotal =
          b.quote.inspectionFee + b.quote.labourCharges + b.quote.materialCharges;
        return {
          ...b,
          quote: {
            ...b.quote,
            additionalCharges: 0,
            additionalWorkNote: 'Declined by customer',
            customerApprovedExtra: true,
            estimatedTotal: reducedTotal,
          },
        };
      })
    );
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
  };

  const handleRescheduleBooking = (
    bookingId: string,
    newDate: string,
    newSlot: string
  ) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, scheduledDate: newDate, scheduledSlot: newSlot }
          : b
      )
    );
  };

  const handleSubmitReview = (bookingId: string, rating: number, comment: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, reviewed: true, userRating: rating, userReviewText: comment }
          : b
      )
    );
    if (target) {
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === target.professionalId
            ? {
                ...p,
                reviewCount: p.reviewCount + 1,
                reviews: [
                  {
                    id: `rev-${Date.now()}`,
                    customerName: target.customerName,
                    rating,
                    date: 'Just now',
                    serviceTitle: target.serviceTitle,
                    comment,
                    verifiedBooking: true,
                  },
                  ...p.reviews,
                ],
              }
            : p
        )
      );
    }
  };

  const handleSendMessage = (
    bookingId: string,
    text: string,
    senderRole: 'customer' | 'professional',
    attachmentLabel?: string
  ) => {
    const senderName =
      senderRole === 'customer'
        ? session?.name || 'Ananya Sharma'
        : activeProfessional.name;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        bookingId,
        senderRole,
        senderName,
        text,
        timestamp: 'Just now',
        attachmentLabel,
      },
    ]);
  };

  const activeProfessional = professionals[0];

  if (!session) {
    return (
      <>
        <SplashAndWelcome onEnterApp={handleEnterApp} />
        <OfflineIndicator />
      </>
    );
  }

  if (session.role === 'professional') {
    return (
      <>
        <ProfessionalDashboard
          session={session}
          professional={activeProfessional}
          bookings={bookings}
          messages={messages}
          onToggleAvailability={(nextStatus) =>
            setProfessionals((prev) =>
              prev.map((p) =>
                p.id === activeProfessional.id
                  ? { ...p, availability: nextStatus }
                  : p
              )
            )
          }
          onUpdateBookingStatus={(bookingId: string, nextStatus: BookingStatus) =>
            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingId ? { ...b, status: nextStatus } : b
              )
            )
          }
          onUpdateQuote={(bookingId, labour, material, extra, extraNote) =>
            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingId
                  ? {
                      ...b,
                      quote: {
                        ...b.quote,
                        labourCharges: labour,
                        materialCharges: material,
                        additionalCharges: extra,
                        additionalWorkNote: extraNote,
                        customerApprovedExtra: extra === 0,
                        estimatedTotal:
                          b.quote.inspectionFee + labour + material + extra,
                      },
                    }
                  : b
              )
            )
          }
          onSendMessage={(bookingId, text) =>
            handleSendMessage(bookingId, text, 'professional')
          }
          onUpdateProfile={(updated) =>
            setProfessionals((prev) =>
              prev.map((p) =>
                p.id === activeProfessional.id ? { ...p, ...updated } : p
              )
            )
          }
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
        />
        <OfflineIndicator />
      </>
    );
  }

  if (session.role === 'admin') {
    return (
      <>
        <AdminDashboard
          professionals={professionals}
          customers={SAMPLE_CUSTOMERS}
          bookings={bookings}
          categories={categories}
          tickets={tickets}
          offers={offers}
          onVerifyProfessional={(proId, status) =>
            setProfessionals((prev) =>
              prev.map((p) =>
                p.id === proId
                  ? {
                      ...p,
                      verificationStatus: status,
                      verified: status === 'Verified',
                    }
                  : p
              )
            )
          }
          onUpdateCategoryPrice={(categoryId, newRange) =>
            setCategories((prev) =>
              prev.map((c) =>
                c.id === categoryId ? { ...c, indicativeRange: newRange } : c
              )
            )
          }
          onUpdateTicketStatus={(ticketId, status) =>
            setTickets((prev) =>
              prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
            )
          }
          onToggleOffer={(offerId) =>
            setOffers((prev) =>
              prev.map((o) => (o.id === offerId ? { ...o, active: !o.active } : o))
            )
          }
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
        />
        <OfflineIndicator />
      </>
    );
  }

  // CUSTOMER APPLICATION SHELL (Mobile-First + Responsive Desktop)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      {/* Compact Sticky Top Bar (<56px mobile height, 3-zone desktop contract) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand + Compact Location Selector */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setCustomerTab('home')}
              className="shrink-0"
              aria-label="FIXNEAR Home"
            >
              <BrandLogo compact={false} />
            </button>
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#0F2647] truncate max-w-[200px] min-h-[36px]"
            >
              <MapPin className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
              <span className="truncate">{session.locality}</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {(
              [
                { id: 'home', label: 'Home' },
                { id: 'explore', label: 'Explore' },
                { id: 'bookings', label: 'Bookings' },
                { id: 'profile', label: 'Profile' },
              ] as { id: CustomerTab; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCustomerTab(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  customerTab === item.id
                    ? 'text-[#0F2647] font-semibold border-b-2 border-[#1D4ED8]'
                    : 'hover:text-[#0F2647]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions (Location on mobile, Notification, Avatar, Install) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="sm:hidden inline-flex items-center gap-1 text-xs font-medium text-slate-700 max-w-[125px] min-h-[40px] px-1.5"
              aria-label="Change locality"
            >
              <MapPin className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
              <span className="truncate">{session.locality.split(',')[0]}</span>
            </button>

            <div className="hidden lg:block">
              <PWAInstallButton />
            </div>

            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1D4ED8] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCustomerTab('profile')}
              className="w-10 h-10 rounded-xl bg-[#0F2647] text-white font-display text-xs font-bold flex items-center justify-center hover:bg-[#163663]"
              aria-label="Open profile"
            >
              {session.name
                .split(' ')
                .slice(0, 2)
                .map((s) => s[0])
                .join('')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        {customerTab === 'home' && (
          <CustomerHome
            categories={categories}
            professionals={professionals}
            bookings={bookings}
            offers={offers}
            locality={`${session.locality}, ${session.city}`}
            onSelectCategory={(categoryId) => {
              setExploreCategory(categoryId);
              setCustomerTab('explore');
            }}
            onOpenExplore={(categoryId) => {
              setExploreCategory(categoryId || 'all');
              setCustomerTab('explore');
            }}
            onOpenProfessional={(pro) => setProfileModalPro(pro)}
            onStartBooking={(categoryId, pro) =>
              setBookingModalState({
                open: true,
                categoryId: categoryId || 'ac-repair',
                pro: pro || null,
              })
            }
            onOpenBookings={() => setCustomerTab('bookings')}
          />
        )}

        {customerTab === 'explore' && (
          <ExploreDiscovery
            professionals={professionals}
            locality={`${session.locality}, ${session.city}`}
            initialCategory={exploreCategory}
            onRequestGeolocation={handleRequestGeolocation}
            geolocationStatus={geoStatus}
            onOpenProfessional={(pro) => setProfileModalPro(pro)}
            onStartBooking={(categoryId, pro) =>
              setBookingModalState({ open: true, categoryId, pro })
            }
          />
        )}

        {customerTab === 'bookings' && (
          <CustomerBookings
            bookings={bookings}
            professionals={professionals}
            messages={messages}
            onApproveExtraQuote={handleApproveExtraQuote}
            onCancelBooking={handleCancelBooking}
            onRescheduleBooking={handleRescheduleBooking}
            onSubmitReview={handleSubmitReview}
            onSendMessage={(bookingId, text, attachmentLabel) =>
              handleSendMessage(bookingId, text, 'customer', attachmentLabel)
            }
            onBookNew={() => setBookingModalState({ open: true })}
          />
        )}

        {customerTab === 'profile' && (
          <CustomerProfile
            session={session}
            onUpdateLocality={(city, locality) =>
              setSession((prev) => (prev ? { ...prev, city, locality } : prev))
            }
            onSwitchRole={handleSwitchRole}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation: Home | Explore | Bookings | Profile */}
      <nav
        aria-label="Customer Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
      >
        <div className="grid grid-cols-4 h-16 items-center">
          {(
            [
              { id: 'home', label: 'Home', Icon: Home },
              { id: 'explore', label: 'Explore', Icon: Compass },
              { id: 'bookings', label: 'Bookings', Icon: CalendarCheck },
              { id: 'profile', label: 'Profile', Icon: User },
            ] as const
          ).map(({ id, label, Icon }) => {
            const active = customerTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCustomerTab(id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  active ? 'text-[#1D4ED8]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium tracking-tight mt-1">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Location Selector Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#0F2647]">
                Select Your Location
              </h2>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700"
                aria-label="Close location modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleRequestGeolocation}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#1D4ED8] bg-blue-50/50 py-3 text-xs font-semibold text-[#1D4ED8] min-h-[44px]"
            >
              <Crosshair className="w-4 h-4" />
              <span>Use Current GPS Location</span>
            </button>
            {geoStatus && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {geoStatus}
              </p>
            )}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {INDIAN_LOCALITIES.map((loc) => (
                <button
                  key={loc.locality}
                  type="button"
                  onClick={() => {
                    setSession((prev) =>
                      prev ? { ...prev, city: loc.city, locality: loc.locality } : prev
                    );
                    setLocationModalOpen(false);
                  }}
                  className="w-full py-3 px-2 text-left flex items-center justify-between hover:bg-slate-50 rounded-lg min-h-[44px]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0F2647]">{loc.locality}</p>
                    <p className="text-xs text-slate-500">{loc.city}</p>
                  </div>
                  {session.locality === loc.locality && (
                    <span className="text-xs font-semibold text-[#1D4ED8]">Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex justify-end">
          <div className="w-full max-w-sm bg-white h-full border-l border-slate-200 p-5 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="font-display text-lg font-bold text-[#0F2647]">
                Notifications
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                  }
                  className="text-xs font-semibold text-[#1D4ED8]"
                >
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-3.5 ${n.read ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#0F2647]">{n.title}</p>
                    <span className="text-[11px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Public Professional Profile Modal */}
      {profileModalPro && (
        <ProfessionalProfileModal
          professional={profileModalPro}
          onClose={() => setProfileModalPro(null)}
          onBookNow={(categoryId, pro) => {
            setProfileModalPro(null);
            setBookingModalState({ open: true, categoryId, pro });
          }}
          onMessageProfessional={() => {
            setProfileModalPro(null);
            setCustomerTab('bookings');
          }}
        />
      )}

      {/* Booking Flow Modal */}
      {bookingModalState.open && (
        <BookingFlowModal
          professionals={professionals}
          locality={`${session.locality}, ${session.city}`}
          customerName={session.name}
          customerPhone={session.phone}
          initialCategoryId={bookingModalState.categoryId}
          initialProfessional={bookingModalState.pro}
          onClose={() => setBookingModalState({ open: false })}
          onSubmitBooking={handleCreateBooking}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}
