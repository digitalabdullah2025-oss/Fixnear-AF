import React, { useState } from 'react';
import { Download, Info, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const BrandLogo: React.FC<{ compact?: boolean; light?: boolean }> = ({
  compact = false,
  light = false,
}) => {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        width="30"
        height="30"
        viewBox="0 0 512 512"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="512" height="512" rx="112" fill={light ? '#163663' : '#0F2647'} />
        <path
          d="M256 104C185.3 104 128 161.3 128 232C128 318.2 232.6 402.8 247.3 414.2C252.4 418.2 259.6 418.2 264.7 414.2C279.4 402.8 384 318.2 384 232C384 161.3 326.7 104 256 104Z"
          fill="#2563EB"
        />
        <circle cx="256" cy="230" r="68" fill="#FFFFFF" />
        <path
          d="M279.5 206.5C270.4 197.4 256.8 195.8 245.9 201.6L261.2 216.9L248.9 229.2L233.6 213.9C227.8 224.8 229.4 238.4 238.5 247.5C246.2 255.2 257.4 257.5 267.3 254.3L289.1 276.1C292.3 279.3 297.5 279.3 300.7 276.1L308.1 268.7C311.3 265.5 311.3 260.3 308.1 257.1L286.3 235.3C289.5 225.4 287.2 214.2 279.5 206.5Z"
          fill="#0F2647"
        />
      </svg>
      {!compact && (
        <span
          className={`font-display text-lg font-bold tracking-tight ${
            light ? 'text-white' : 'text-[#0F2647]'
          }`}
        >
          FIXNEAR
        </span>
      )}
    </span>
  );
};

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'card' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'card'
            ? 'inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0 min-h-[44px]'
            : 'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 min-h-[40px]'
        }
      >
        <Download className="w-4 h-4 text-[#1D4ED8]" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
        >
          <Download className="w-4 h-4 text-[#1D4ED8]" />
          <span>Install on iOS</span>
        </button>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  Install FIXNEAR on iOS
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
                  aria-label="Close install guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                1. Tap the <strong>Share</strong> icon in the Safari toolbar.
                <br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#0F2647] py-2.5 text-sm font-medium text-white hover:bg-[#163663] transition-colors min-h-[44px]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-900 shadow-md md:bottom-4"
    >
      <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
      <span>Offline Mode — Viewing cached UI data</span>
    </div>
  );
};

interface ProAvatarProps {
  name: string;
  src?: string;
  sizeClass?: string;
}

export const ProAvatar: React.FC<ProAvatarProps> = ({
  name,
  src,
  sizeClass = 'w-14 h-14',
}) => {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  if (!src || failed) {
    return (
      <div
        className={`${sizeClass} rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-display font-semibold text-[#0F2647] shrink-0 select-none`}
        aria-label={name}
      >
        {initials || 'FN'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${sizeClass} rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100`}
    />
  );
};

export const IntegrationNotice: React.FC<{
  title: string;
  detail: string;
  compact?: boolean;
}> = ({ title, detail, compact = false }) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50/90 ${
        compact ? 'px-3.5 py-2.5' : 'p-4'
      } flex items-start gap-3`}
    >
      <Info className="w-4 h-4 text-[#1D4ED8] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{detail}</p>
      </div>
    </div>
  );
};
