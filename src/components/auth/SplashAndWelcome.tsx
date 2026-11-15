import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { HERO_INTERIOR_IMAGE, INDIAN_LOCALITIES } from '../../data/mockDirectory';
import { UserRole, UserSession } from '../../types/fixnear';
import { BrandLogo, IntegrationNotice, PWAInstallButton } from '../common/BrandMark';

interface SplashAndWelcomeProps {
  onEnterApp: (session: UserSession) => void;
  showSplashInitially?: boolean;
}

type AuthStep = 'welcome' | 'auth' | 'forgot-password' | 'create-profile';
type AuthMethod = 'otp' | 'google' | 'email';

export const SplashAndWelcome: React.FC<SplashAndWelcomeProps> = ({
  onEnterApp,
  showSplashInitially = true,
}) => {
  const [showSplash, setShowSplash] = useState(showSplashInitially);
  const [step, setStep] = useState<AuthStep>('welcome');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('otp');

  // Form states
  const [phone, setPhone] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedLocalityIdx, setSelectedLocalityIdx] = useState(0);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  useEffect(() => {
    if (!showSplash) return;
    const timer = window.setTimeout(() => setShowSplash(false), 1100);
    return () => window.clearTimeout(timer);
  }, [showSplash]);

  const startPreviewSession = (role: UserRole) => {
    const loc = INDIAN_LOCALITIES[selectedLocalityIdx] || INDIAN_LOCALITIES[0];
    const defaultNames: Record<UserRole, string> = {
      customer: fullName.trim() || 'Ananya Sharma',
      professional: fullName.trim() || 'Rahul Sharma',
      admin: fullName.trim() || 'Operations Admin',
    };
    onEnterApp({
      role,
      isPreviewMode: true,
      name: defaultNames[role],
      phone: phone ? `+91 ${phone}` : '+91 98450 11201',
      email: email || `${role}@fixnear.in`,
      city: loc.city,
      locality: loc.locality,
      coordinates: null,
    });
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setFormFeedback('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setFormFeedback(
      'Firebase Phone Authentication is scheduled for Phase 2. Production OTP is never simulated—use UI Preview below to inspect all screens.'
    );
    setOtpRequested(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setFormFeedback('Enter the 6-digit verification code.');
      return;
    }
    setFormFeedback(
      'Live OTP verification requires Firebase Authentication configuration in Phase 2. Click "Open Phase 1 UI Preview" to explore the workspace.'
    );
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setFormFeedback('Enter a valid email address and password (6+ characters).');
      return;
    }
    setFormFeedback(
      'Firebase Email/Password authentication connects in Phase 2. Use "Open Phase 1 UI Preview" below to test the application screens.'
    );
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setFormFeedback('Enter your registered email address.');
      return;
    }
    setFormFeedback(
      'Password reset emails will dispatch via Firebase Auth once Phase 2 credentials are linked.'
    );
  };

  const handleCreateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormFeedback('Please enter your full name.');
      return;
    }
    startPreviewSession(selectedRole);
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0F2647] text-white flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center text-center max-w-xs">
          <div className="w-20 h-20 rounded-2xl bg-[#163663] border border-white/10 flex items-center justify-center shadow-lg">
            <BrandLogo compact light />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-white">
            FIXNEAR
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-blue-200">
            Find. Book. Fix.
          </p>
          <button
            type="button"
            onClick={() => setShowSplash(false)}
            className="mt-10 text-xs font-medium text-blue-200/80 hover:text-white underline underline-offset-4 transition-colors min-h-[44px] px-4"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Clean 3-zone top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('customer');
                setStep('auth');
                setFormFeedback(null);
              }}
              className="hover:text-[#0F2647] transition-colors whitespace-nowrap shrink-0"
            >
              Book a Service
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('professional');
                setStep('auth');
                setFormFeedback(null);
              }}
              className="hover:text-[#0F2647] transition-colors whitespace-nowrap shrink-0"
            >
              Partner With Us
            </button>
            <button
              type="button"
              onClick={() => startPreviewSession('admin')}
              className="hover:text-[#0F2647] transition-colors whitespace-nowrap shrink-0"
            >
              Admin Console
            </button>
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <PWAInstallButton />
            {step === 'welcome' ? (
              <button
                type="button"
                onClick={() => startPreviewSession('customer')}
                className="rounded-xl bg-[#1D4ED8] px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
              >
                Explore App
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStep('welcome');
                  setFormFeedback(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {step === 'welcome' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left primary welcome block */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-wide text-[#1D4ED8]">
                Verified Home Repairs Across India
              </p>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F2647] text-balance leading-[1.12]">
                Home Repairs Made Simple.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Find trusted professionals near you. Get your home fixed without the hassle.
              </p>

              {/* Two primary role buttons */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('customer');
                    setStep('auth');
                    setFormFeedback(null);
                  }}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#1D4ED8] px-5 py-4 text-left text-white shadow-sm hover:bg-[#1E40AF] transition-colors min-h-[64px]"
                >
                  <div>
                    <span className="block font-display text-base font-semibold">
                      Continue as Customer
                    </span>
                    <span className="block text-xs text-blue-100 mt-0.5">
                      Find & book local experts
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('professional');
                    setStep('auth');
                    setFormFeedback(null);
                  }}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-[#0F2647] shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-colors min-h-[64px]"
                >
                  <div>
                    <span className="block font-display text-base font-semibold">
                      Join as Service Professional
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      Manage jobs & earnings
                    </span>
                  </div>
                  <Wrench className="w-5 h-5 text-[#1D4ED8] shrink-0" />
                </button>
              </div>

              {/* Quick Phase 1 UI Preview Jump Bar */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-500">
                  Phase 1 UI Preview — Inspect any role workspace directly:
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => startPreviewSession('customer')}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors min-h-[40px]"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Customer Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startPreviewSession('professional')}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors min-h-[40px]"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Professional Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startPreviewSession('admin')}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors min-h-[40px]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Control Panel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right editorial hero visual */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="relative flex-1 min-h-[280px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-200 shadow-sm">
                {!heroImgFailed ? (
                  <img
                    src={HERO_INTERIOR_IMAGE}
                    alt="Modern Indian apartment living room with split AC unit"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover lg:h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center p-8 text-center">
                    <div>
                      <Wrench className="w-10 h-10 text-[#0F2647] mx-auto" />
                      <p className="mt-3 font-display font-semibold text-[#0F2647]">
                        Trusted Local Home Care
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-5 sm:p-6 text-white">
                  <p className="font-display text-base sm:text-lg font-semibold">
                    Transparent ₹ estimates before work begins
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-200">
                    AC Repair · Electricians · Plumbers · Appliance Specialists
                  </p>
                </div>
              </div>
            </div>

            {/* Full-width 3-column value strip below hero split */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <CheckCircle2 className="w-5 h-5 text-[#1D4ED8]" />
                <h2 className="mt-3 font-display text-base font-semibold text-[#0F2647]">
                  Verified Local Professionals
                </h2>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  Government ID checks, skill reviews, and verified ratings from completed household bookings.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <Smartphone className="w-5 h-5 text-[#1D4ED8]" />
                <h2 className="mt-3 font-display text-base font-semibold text-[#0F2647]">
                  Live Arrival & Route Visibility
                </h2>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  Track real-time arrival windows and communicate directly via in-app chat or call.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <KeyRound className="w-5 h-5 text-[#1D4ED8]" />
                <h2 className="mt-3 font-display text-base font-semibold text-[#0F2647]">
                  Approval-First Quotations
                </h2>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  Inspection charges, labour, and extra parts are itemized and require customer approval.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Authentication & Profile Creation Panel */
          <div className="max-w-md mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#1D4ED8]">
                    {selectedRole === 'customer'
                      ? 'Customer Account'
                      : 'Service Professional Account'}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-[#0F2647]">
                    {step === 'forgot-password'
                      ? 'Reset Password'
                      : step === 'create-profile'
                      ? 'Create Your Profile'
                      : 'Sign in to FIXNEAR'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedRole((prev) =>
                      prev === 'customer' ? 'professional' : 'customer'
                    )
                  }
                  className="text-xs font-medium text-slate-600 hover:text-[#1D4ED8] underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  Switch to {selectedRole === 'customer' ? 'Professional' : 'Customer'}
                </button>
              </div>

              {step === 'auth' && (
                <>
                  {/* Auth method tabs */}
                  <div className="mt-6 grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('otp');
                        setFormFeedback(null);
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        authMethod === 'otp'
                          ? 'bg-white text-[#0F2647] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Mobile OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('google');
                        setFormFeedback(null);
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        authMethod === 'google'
                          ? 'bg-white text-[#0F2647] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('email');
                        setFormFeedback(null);
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        authMethod === 'email'
                          ? 'bg-white text-[#0F2647] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Email
                    </button>
                  </div>

                  {authMethod === 'otp' && (
                    <form onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="mobile-input" className="block text-xs font-medium text-slate-700">
                          Indian Mobile Number
                        </label>
                        <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-blue-100 overflow-hidden">
                          <span className="px-3.5 py-3 text-sm font-mono font-medium text-slate-600 bg-slate-50 border-r border-slate-200">
                            +91
                          </span>
                          <input
                            id="mobile-input"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="98450 11201"
                            className="w-full px-3.5 py-3 text-sm text-slate-900 font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      {otpRequested && (
                        <div>
                          <label htmlFor="otp-input" className="block text-xs font-medium text-slate-700">
                            6-Digit OTP
                          </label>
                          <input
                            id="otp-input"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 6-digit code"
                            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-mono tracking-widest text-slate-900 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#1D4ED8] py-3 text-sm font-medium text-white hover:bg-[#1E40AF] transition-colors min-h-[44px] flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{otpRequested ? 'Verify OTP' : 'Send Verification OTP'}</span>
                      </button>
                    </form>
                  )}

                  {authMethod === 'google' && (
                    <div className="mt-6 space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Sign in quickly using your Google account. Firebase Google OAuth provider connects in Phase 2.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setFormFeedback(
                            'Google Sign-In requires Firebase Authentication configuration in Phase 2. Use "Open Phase 1 UI Preview" below to inspect the dashboard.'
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors min-h-[44px] flex items-center justify-center gap-2.5"
                      >
                        <span className="font-display font-bold text-[#1D4ED8]">G</span>
                        <span>Continue with Google</span>
                      </button>
                    </div>
                  )}

                  {authMethod === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="email-input" className="block text-xs font-medium text-slate-700">
                          Email Address
                        </label>
                        <input
                          id="email-input"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.in"
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="pass-input" className="block text-xs font-medium text-slate-700">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setStep('forgot-password');
                              setFormFeedback(null);
                            }}
                            className="text-xs font-medium text-[#1D4ED8] hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <input
                          id="pass-input"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#1D4ED8] py-3 text-sm font-medium text-white hover:bg-[#1E40AF] transition-colors min-h-[44px] flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Sign In</span>
                      </button>
                    </form>
                  )}

                  <div className="mt-5 flex items-center justify-between text-xs text-slate-600">
                    <span>New to FIXNEAR?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('create-profile');
                        setFormFeedback(null);
                      }}
                      className="font-semibold text-[#1D4ED8] hover:underline"
                    >
                      Create Profile
                    </button>
                  </div>
                </>
              )}

              {step === 'forgot-password' && (
                <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
                  <p className="text-sm text-slate-600">
                    Enter your registered email to receive a password reset link.
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.in"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 focus:border-[#1D4ED8] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#1D4ED8] py-3 text-sm font-medium text-white hover:bg-[#1E40AF] transition-colors min-h-[44px]"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('auth')}
                    className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Return to Sign In
                  </button>
                </form>
              )}

              {step === 'create-profile' && (
                <form onSubmit={handleCreateProfileSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ananya Sharma"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 focus:border-[#1D4ED8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Mobile Number (+91)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9845011201"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-mono text-slate-900 focus:border-[#1D4ED8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">City & Locality</label>
                    <select
                      value={selectedLocalityIdx}
                      onChange={(e) => setSelectedLocalityIdx(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 bg-white focus:border-[#1D4ED8] focus:outline-none"
                    >
                      {INDIAN_LOCALITIES.map((loc, idx) => (
                        <option key={loc.locality} value={idx}>
                          {loc.city} — {loc.locality}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#1D4ED8] py-3 text-sm font-medium text-white hover:bg-[#1E40AF] transition-colors min-h-[44px]"
                  >
                    Continue in Phase 1 Preview
                  </button>
                </form>
              )}

              {formFeedback && (
                <div className="mt-5">
                  <IntegrationNotice
                    title="Authentication Notice (Phase 2)"
                    detail={formFeedback}
                    compact
                  />
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => startPreviewSession(selectedRole)}
                  className="w-full rounded-xl bg-[#0F2647] py-3 text-sm font-medium text-white hover:bg-[#163663] transition-colors min-h-[44px]"
                >
                  Open Phase 1 UI Preview as{' '}
                  {selectedRole === 'customer' ? 'Customer' : 'Service Professional'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
