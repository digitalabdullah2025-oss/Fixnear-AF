export type UserRole = 'customer' | 'professional' | 'admin';

export type CustomerTab = 'home' | 'explore' | 'bookings' | 'profile';

export type BookingStatus =
  | 'Request Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Professional On The Way'
  | 'Professional Arrived'
  | 'Work In Progress'
  | 'Completed'
  | 'Cancelled';

export type ServiceCategoryId =
  | 'ac-repair'
  | 'electrician'
  | 'plumber'
  | 'carpenter'
  | 'refrigerator-repair'
  | 'washing-machine-repair'
  | 'ro-repair'
  | 'home-cleaning'
  | 'painting'
  | 'pest-control'
  | 'cctv-installation'
  | 'other-repairs';

export interface ServiceRateItem {
  name: string;
  priceRange: string;
  requiresInspection?: boolean;
  notes?: string;
}

export interface ServiceCategory {
  id: ServiceCategoryId;
  name: string;
  shortName: string;
  description: string;
  indicativeRange: string;
  inspectionFee: string;
  isPopular?: boolean;
  isEmergency?: boolean;
  sampleRates: ServiceRateItem[];
}

export interface ProfessionalReview {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  serviceTitle: string;
  comment: string;
  verifiedBooking: boolean;
}

export interface Professional {
  id: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
  verificationStatus: 'Verified' | 'Pending Review' | 'Suspended';
  primaryCategory: ServiceCategoryId;
  categories: ServiceCategoryId[];
  skills: string[];
  experienceYears: number;
  bio: string;
  serviceArea: string;
  city: string;
  workingHours: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  availability: 'Available' | 'Busy' | 'Offline';
  distanceKm: number;
  estimatedArrivalWindow: string;
  etaMinutesMin: number;
  inspectionFeeInr: number;
  startingPriceInr: number;
  estimatedPriceRange: string;
  mapPosition: { xPercent: number; yPercent: number };
  phoneMasked: string;
  pricingCatalog: ServiceRateItem[];
  reviews: ProfessionalReview[];
  governmentIdMasked?: string;
}

export interface QuoteBreakdown {
  inspectionFee: number;
  labourCharges: number;
  materialCharges: number;
  additionalCharges: number;
  additionalWorkNote?: string;
  customerApprovedExtra: boolean;
  estimatedTotal: number;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhoneMasked: string;
  address: string;
  locality: string;
  serviceCategory: ServiceCategoryId;
  serviceTitle: string;
  problemDescription: string;
  scheduledDate: string;
  scheduledSlot: string;
  professionalId: string;
  professionalName: string;
  status: BookingStatus;
  paymentMethod: 'Cash on Completion' | 'UPI' | 'Online Payment';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  quote: QuoteBreakdown;
  createdAt: string;
  mediaNames?: string[];
  reviewed?: boolean;
  userRating?: number;
  userReviewText?: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderRole: 'customer' | 'professional';
  senderName: string;
  text: string;
  timestamp: string;
  attachmentLabel?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'booking' | 'offer' | 'system';
}

export interface OfferCoupon {
  id: string;
  code: string;
  title: string;
  discountLabel: string;
  minOrderInr: number;
  validTill: string;
  active: boolean;
}

export interface SupportTicket {
  id: string;
  bookingId: string;
  raisedBy: string;
  role: 'Customer' | 'Professional';
  subject: string;
  status: 'Open' | 'In Review' | 'Resolved';
  createdAt: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  city: string;
  phoneMasked: string;
  totalBookings: number;
  joinedDate: string;
  status: 'Active' | 'Flagged';
}

export interface UserSession {
  role: UserRole;
  isPreviewMode: boolean;
  name: string;
  phone: string;
  email: string;
  city: string;
  locality: string;
  coordinates?: { lat: number; lng: number } | null;
}
