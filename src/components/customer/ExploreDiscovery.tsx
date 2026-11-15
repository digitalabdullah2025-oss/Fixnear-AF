import React, { useMemo, useState } from 'react';
import {
  Crosshair,
  List,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Navigation,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { Professional, ServiceCategoryId } from '../../types/fixnear';
import { IntegrationNotice, ProAvatar } from '../common/BrandMark';
import { ServiceIcon } from '../common/ServiceIcon';

interface ExploreDiscoveryProps {
  professionals: Professional[];
  locality: string;
  initialCategory?: ServiceCategoryId | 'all';
  onRequestGeolocation: () => void;
  geolocationStatus: string | null;
  onOpenProfessional: (pro: Professional) => void;
  onStartBooking: (categoryId: ServiceCategoryId, pro: Professional) => void;
}

type MapFilterKey =
  | 'all'
  | 'ac-repair'
  | 'electrician'
  | 'plumber'
  | 'carpenter'
  | 'appliance';

type SortOption = 'nearest' | 'fastest' | 'rating' | 'price';

export const ExploreDiscovery: React.FC<ExploreDiscoveryProps> = ({
  professionals,
  locality,
  initialCategory = 'all',
  onRequestGeolocation,
  geolocationStatus,
  onOpenProfessional,
  onStartBooking,
}) => {
  const mapInitialFilter = (cat: ServiceCategoryId | 'all'): MapFilterKey => {
    if (cat === 'ac-repair' || cat === 'electrician' || cat === 'plumber' || cat === 'carpenter') {
      return cat;
    }
    if (
      cat === 'refrigerator-repair' ||
      cat === 'washing-machine-repair' ||
      cat === 'ro-repair'
    ) {
      return 'appliance';
    }
    return 'all';
  };

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [categoryFilter, setCategoryFilter] = useState<MapFilterKey>(
    mapInitialFilter(initialCategory)
  );
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(5);
  const [sortBy, setSortBy] = useState<SortOption>('nearest');
  const [selectedProId, setSelectedProId] = useState<string | null>(
    professionals[0]?.id ?? null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredProfessionals = useMemo(() => {
    return professionals
      .filter((p) => p.availability !== 'Offline')
      .filter((p) => p.distanceKm <= maxDistanceKm)
      .filter((p) => {
        if (categoryFilter === 'all') return true;
        if (categoryFilter === 'appliance') {
          return p.categories.some((c) =>
            ['refrigerator-repair', 'washing-machine-repair', 'ro-repair'].includes(c)
          );
        }
        return p.categories.includes(categoryFilter);
      })
      .sort((a, b) => {
        if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
        if (sortBy === 'fastest') return a.etaMinutesMin - b.etaMinutesMin;
        if (sortBy === 'rating') return b.rating - a.rating;
        return a.startingPriceInr - b.startingPriceInr;
      });
  }, [professionals, maxDistanceKm, categoryFilter, sortBy]);

  const selectedPro = useMemo(
    () =>
      filteredProfessionals.find((p) => p.id === selectedProId) ||
      filteredProfessionals[0] ||
      null,
    [filteredProfessionals, selectedProId]
  );

  const filterButtons: { key: MapFilterKey; label: string }[] = [
    { key: 'all', label: 'All Services' },
    { key: 'ac-repair', label: 'AC Repair' },
    { key: 'electrician', label: 'Electrician' },
    { key: 'plumber', label: 'Plumber' },
    { key: 'carpenter', label: 'Carpenter' },
    { key: 'appliance', label: 'Appliance Repair' },
  ];

  const distanceOptions = [1, 3, 5, 10];

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-50 flex flex-col p-4 sm:p-6 overflow-y-auto'
          : 'space-y-5 pb-8'
      }
    >
      {/* Header & View Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0F2647]">
            Explore Nearby Professionals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 tabular-nums">
            Showing {filteredProfessionals.length} matching specialists within {maxDistanceKm} km of{' '}
            {locality}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRequestGeolocation}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors min-h-[40px]"
          >
            <Crosshair className="w-4 h-4 text-[#1D4ED8]" />
            <span>Detect Location</span>
          </button>

          <div className="flex items-center p-1 rounded-xl bg-slate-200/70">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[34px] ${
                viewMode === 'map'
                  ? 'bg-white text-[#0F2647] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[34px] ${
                viewMode === 'list'
                  ? 'bg-white text-[#0F2647] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            aria-label={isFullscreen ? 'Exit fullscreen map' : 'Expand map to fullscreen'}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white w-10 h-10 text-slate-700 hover:bg-slate-50"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {geolocationStatus && (
        <IntegrationNotice
          title="Location Permission Status"
          detail={geolocationStatus}
          compact
        />
      )}

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setCategoryFilter(btn.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                categoryFilter === btn.key
                  ? 'bg-[#0F2647] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-slate-500 mr-1">Radius:</span>
            {distanceOptions.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setMaxDistanceKm(km)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium tabular-nums transition-colors min-h-[34px] ${
                  maxDistanceKm === km
                    ? 'bg-[#1D4ED8] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Within {km} KM
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-pros" className="text-xs font-medium text-slate-500">
              Sort:
            </label>
            <select
              id="sort-pros"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-[#1D4ED8] focus:outline-none min-h-[36px]"
            >
              <option value="nearest">Nearest First</option>
              <option value="fastest">Fastest Arrival</option>
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Estimated Price</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Interactive Map Discovery Canvas (Phase 1 Preview + Google Maps Integration Point) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span className="font-medium text-[#0F2647]">
                Neighborhood Discovery Canvas · {locality}
              </span>
              <span className="text-[11px] text-slate-500">
                Google Maps Platform live SDK connects in Phase 4 (UI preview markers shown)
              </span>
            </div>

            <div className="relative flex-1 min-h-[380px] sm:min-h-[440px] bg-[#EEF2F6] overflow-hidden select-none">
              {/* Architectural road grid SVG */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 800 500"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect width="800" height="500" fill="#F1F5F9" />
                <path
                  d="M0 120 L800 120 M0 250 L800 250 M0 370 L800 370 M160 0 L160 500 M380 0 L380 500 M610 0 L610 500"
                  stroke="#E2E8F0"
                  strokeWidth="12"
                />
                <path
                  d="M80 0 L240 500 M520 0 L470 500 M0 190 L800 310"
                  stroke="#FFFFFF"
                  strokeWidth="6"
                />
                {/* Radius coverage ring around customer center */}
                <circle
                  cx="400"
                  cy="250"
                  r={Math.min(220, 75 + maxDistanceKm * 15)}
                  fill="#1D4ED8"
                  fillOpacity="0.06"
                  stroke="#1D4ED8"
                  strokeOpacity="0.35"
                  strokeDasharray="6 6"
                  strokeWidth="2"
                />
              </svg>

              {/* Customer center location marker */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none"
                title="Your Selected Location"
              >
                <div className="w-9 h-9 rounded-full bg-[#0F2647] border-2 border-white shadow-md flex items-center justify-center text-white">
                  <Navigation className="w-4 h-4" />
                </div>
                <span className="mt-1 rounded bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-[#0F2647] shadow-xs border border-slate-200">
                  Your Location
                </span>
              </div>

              {/* Professional interactive markers */}
              {filteredProfessionals.map((pro) => {
                const isSelected = selectedPro?.id === pro.id;
                const isAvailable = pro.availability === 'Available';
                return (
                  <button
                    key={pro.id}
                    type="button"
                    onClick={() => setSelectedProId(pro.id)}
                    style={{
                      left: `${pro.mapPosition.xPercent}%`,
                      top: `${pro.mapPosition.yPercent}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-transform ${
                      isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                    }`}
                    aria-label={`${pro.name}, ${pro.distanceKm} km away, ${pro.availability}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl border-2 border-white shadow-md flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#1D4ED8] text-white'
                          : isAvailable
                          ? 'bg-white text-[#0F2647]'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <ServiceIcon categoryId={pro.primaryCategory} className="w-4 h-4" />
                    </div>
                    <span
                      className={`mt-1 px-2 py-0.5 rounded text-[11px] font-medium shadow-xs border whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#0F2647] text-white border-[#0F2647]'
                          : 'bg-white/95 text-slate-800 border-slate-200'
                      }`}
                    >
                      {pro.name.split(' ')[0]} · {pro.distanceKm} km
                    </span>
                  </button>
                );
              })}

              {/* Legend */}
              <div className="absolute left-3 bottom-3 bg-white/95 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-600 flex items-center gap-3 shadow-xs">
                <span>Blue Pin: Selected</span>
                <span aria-hidden="true">·</span>
                <span>White Pin: Available</span>
                <span aria-hidden="true">·</span>
                <span>Grey Pin: Busy</span>
              </div>
            </div>
          </div>

          {/* Selected Professional Info Card */}
          <div className="lg:col-span-4 flex flex-col">
            {selectedPro ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <ProAvatar
                        name={selectedPro.name}
                        src={selectedPro.avatarUrl}
                        sizeClass="w-16 h-16"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="font-display text-lg font-bold text-[#0F2647]">
                            {selectedPro.name}
                          </h2>
                          {selectedPro.verified && (
                            <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {selectedPro.serviceArea}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs tabular-nums">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {selectedPro.rating.toFixed(1)}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600">
                            {selectedPro.completedJobs} completed jobs
                          </span>
                        </div>
                      </div>
                    </div>
                    {isFullscreen && (
                      <button
                        type="button"
                        onClick={() => setIsFullscreen(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-700"
                        aria-label="Close fullscreen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500">Distance</p>
                      <p className="mt-0.5 font-mono font-semibold text-[#0F2647] tabular-nums">
                        {selectedPro.distanceKm} km away
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Availability</p>
                      <p
                        className={`mt-0.5 font-semibold ${
                          selectedPro.availability === 'Available'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {selectedPro.availability}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Est. Arrival Window</p>
                      <p className="mt-0.5 font-semibold text-[#0F2647] tabular-nums">
                        {selectedPro.estimatedArrivalWindow}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Est. Service Charge</p>
                      <p className="mt-0.5 font-mono font-semibold text-[#0F2647] tabular-nums">
                        {selectedPro.estimatedPriceRange}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-700">Specialties</p>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {selectedPro.skills.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenProfessional(selectedPro)}
                    className="rounded-xl border border-slate-200 bg-white py-3 text-xs font-semibold text-[#0F2647] hover:bg-slate-50 transition-colors min-h-[44px]"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onStartBooking(selectedPro.primaryCategory, selectedPro)
                    }
                    className="rounded-xl bg-[#1D4ED8] py-3 text-xs font-semibold text-white hover:bg-[#1E40AF] transition-colors min-h-[44px]"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center flex flex-col justify-center items-center flex-1">
                <p className="font-display font-semibold text-[#0F2647]">
                  No professionals match this filter
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Expand your distance radius to 10 km or select All Services.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('all');
                    setMaxDistanceKm(10);
                  }}
                  className="mt-4 rounded-xl bg-[#0F2647] px-4 py-2 text-xs font-medium text-white min-h-[40px]"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProfessionals.length === 0 ? (
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="font-display font-semibold text-[#0F2647]">
                No professionals found within {maxDistanceKm} km
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('all');
                  setMaxDistanceKm(10);
                }}
                className="mt-3 rounded-xl bg-[#1D4ED8] px-4 py-2 text-xs font-medium text-white min-h-[40px]"
              >
                Show All Within 10 KM
              </button>
            </div>
          ) : (
            filteredProfessionals.map((pro) => (
              <div
                key={pro.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <ProAvatar name={pro.name} src={pro.avatarUrl} sizeClass="w-14 h-14" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="font-display text-base font-bold text-[#0F2647] truncate">
                          {pro.name}
                        </h3>
                        {pro.verified && (
                          <ShieldCheck className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold shrink-0 ${
                          pro.availability === 'Available'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {pro.availability}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">
                      {pro.serviceArea} · {pro.workingHours}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-700 tabular-nums">
                      {pro.rating.toFixed(1)} ★ ({pro.reviewCount}) · {pro.completedJobs} jobs ·{' '}
                      {pro.distanceKm} km · Arrives {pro.estimatedArrivalWindow}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-600 tabular-nums">
                    Est. <strong className="font-mono text-[#0F2647]">{pro.estimatedPriceRange}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenProfessional(pro)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[38px]"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartBooking(pro.primaryCategory, pro)}
                      className="rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1E40AF] min-h-[38px]"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
