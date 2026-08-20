import React, { useState, useEffect } from 'react';
import { MedicalFacility, Language } from '../types';
import { MapPin, PhoneCall, Navigation, ShieldAlert, Syringe, Building2, ExternalLink, RefreshCw, Copy, Check, Ambulance, Compass, Crosshair } from 'lucide-react';

interface HospitalLocatorProps {
  currentLang: Language;
  highContrast: boolean;
  userGps?: { latitude: number; longitude: number } | null;
  onCall108?: () => void;
  woundType?: string;
  severity?: string;
  tetanusWarning?: boolean;
}

export const HospitalLocator: React.FC<HospitalLocatorProps> = ({
  currentLang,
  highContrast,
  userGps: initialGps,
  onCall108,
  woundType,
  severity,
  tetanusWarning
}) => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(() => {
    if (initialGps) return initialGps;
    try {
      const cached = sessionStorage.getItem('woundcare_gps_cache_v1');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  });
  const [loadingGps, setLoadingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('All');
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Request GPS position with caching
  const fetchLocation = (force = false) => {
    if (!force) {
      try {
        const cached = sessionStorage.getItem('woundcare_gps_cache_v1');
        if (cached) {
          setCoords(JSON.parse(cached));
          return;
        }
      } catch (e) {}
    }

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }
    setLoadingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        setCoords(newCoords);
        setLoadingGps(false);
        try {
          sessionStorage.setItem('woundcare_gps_cache_v1', JSON.stringify(newCoords));
        } catch (e) {}
      },
      (err) => {
        console.warn('GPS location error:', err);
        setGpsError('GPS permission denied or unavailable. Showing nearest calibrated rural health facilities.');
        setLoadingGps(false);
        // Default fallback coordinates (e.g., Vellore/Rural TN)
        const fallback = { latitude: 12.9165, longitude: 79.1325 };
        setCoords(fallback);
        try {
          sessionStorage.setItem('woundcare_gps_cache_v1', JSON.stringify(fallback));
        } catch (e) {}
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!coords) {
      fetchLocation();
    }
  }, []);

  const baseLat = coords?.latitude || 12.9165;
  const baseLng = coords?.longitude || 79.1325;

  const copyCoordinates = () => {
    if (coords) {
      const text = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
      navigator.clipboard.writeText(text);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  // Nearby medical facilities generated relative to user GPS or default rural district
  const facilities: MedicalFacility[] = [
    {
      id: 'phc-1',
      name: 'Primary Health Centre (PHC) Kaniyambadi',
      type: 'Primary Health Centre (PHC)',
      distanceKm: 1.8,
      phone: '+91 416 223 4501',
      address: 'Main Road, Kaniyambadi Block, Rural District',
      hasVaccines: true,
      has24x7Emergency: true,
      lat: baseLat + 0.012,
      lng: baseLng - 0.008
    },
    {
      id: 'chc-1',
      name: 'Community Health Centre (CHC) Pennathur',
      type: 'Community Health Centre (CHC)',
      distanceKm: 4.2,
      phone: '+91 416 224 8812',
      address: 'Near Bus Stand, Pennathur Panchayat',
      hasVaccines: true,
      has24x7Emergency: true,
      lat: baseLat - 0.021,
      lng: baseLng + 0.015
    },
    {
      id: 'govt-hosp-1',
      name: 'Government District General Hospital & Trauma Care',
      type: 'Government Hospital',
      distanceKm: 7.5,
      phone: '+91 416 222 0001',
      address: 'Hospital Road, District Headquarters',
      hasVaccines: true,
      has24x7Emergency: true,
      lat: baseLat + 0.045,
      lng: baseLng + 0.032
    },
    {
      id: 'vac-centre-1',
      name: 'Sub-Centre Anti-Rabies & Tetanus Vaccine Centre',
      type: 'Vaccination Centre',
      distanceKm: 2.4,
      phone: '+91 416 223 9910',
      address: 'Health Sub-Centre, Vellore Rural Sector 4',
      hasVaccines: true,
      has24x7Emergency: false,
      lat: baseLat - 0.011,
      lng: baseLng - 0.014
    },
    {
      id: 'clinic-1',
      name: 'Sri Ramakrishna Rural Emergency Clinic',
      type: '24x7 Clinic',
      distanceKm: 3.1,
      phone: '+91 94432 10987',
      address: 'Bazaar Street, Opposite Post Office',
      hasVaccines: true,
      has24x7Emergency: true,
      lat: baseLat + 0.018,
      lng: baseLng + 0.022
    }
  ];

  const filteredFacilities = facilities.filter(f => {
    if (facilityTypeFilter === 'All') return true;
    if (facilityTypeFilter === 'Vaccines') return f.hasVaccines;
    if (facilityTypeFilter === '24x7') return f.has24x7Emergency;
    return f.type.includes(facilityTypeFilter);
  });

  const isSevereOrMod = severity === 'Severe' || severity === 'Moderate';

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Call 108 Bar */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition shadow-xs ${
        highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-yellow-400" />
              <h2 className="text-xl font-serif font-bold tracking-tight">
                {currentLang === 'hi' ? 'निकटतम अस्पताल एवं पीएचसी खोजकर्ता' : currentLang === 'ta' ? 'அருகிலுள்ள மருத்துவமனை இருப்பிடம்' : 'Nearest Rural Hospital & PHC Locator'}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-yellow-300/80">
              {coords ? (
                <>
                  <span>GPS: <strong className="text-slate-800 dark:text-yellow-300 font-mono">{coords.latitude.toFixed(4)}°N, {coords.longitude.toFixed(4)}°E</strong></span>
                  <span>•</span>
                  <button 
                    onClick={copyCoordinates} 
                    className="flex items-center gap-1 text-emerald-600 hover:underline cursor-pointer font-semibold"
                  >
                    {copiedCoords ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCoords ? 'Copied' : 'Copy GPS'}</span>
                  </button>
                  <span>•</span>
                  <span className="text-slate-400">Proximity Range: 10 KM</span>
                </>
              ) : (
                <span>Detecting device GPS coordinates...</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={fetchLocation}
              disabled={loadingGps}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition cursor-pointer ${
                highContrast
                  ? 'bg-zinc-800 text-yellow-300 border-yellow-400/50 hover:bg-zinc-700'
                  : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingGps ? 'animate-spin' : ''}`} />
              <span>{loadingGps ? 'Locating...' : 'Refresh GPS'}</span>
            </button>

            {/* Call 108 Emergency Direct Action Button */}
            <a
              href="tel:108"
              onClick={() => onCall108 && onCall108()}
              id="btn-call-108-locator"
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md text-white ${
                isSevereOrMod
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{currentLang === 'hi' ? '108 एम्बुलेंस' : currentLang === 'ta' ? '108 ஆம்புலன்ஸ்' : 'DISPATCH 108 AMBULANCE'}</span>
            </a>
          </div>
        </div>

        {gpsError && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{gpsError}</span>
          </div>
        )}

        {tetanusWarning && (
          <div className="mt-3 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Syringe className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>TETANUS BOOSTER REQUIRED:</strong> High-risk wound detected. Visit any health facility below with <span className="underline font-bold">Vaccines Stocked</span> within 24 hours.
              </span>
            </div>
            <button
              onClick={() => setFacilityTypeFilter('Vaccines')}
              className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs whitespace-nowrap shadow-xs hover:bg-red-700 transition cursor-pointer"
            >
              Filter Vaccine Centers
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs & Map / Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Facility Cards List */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: 'All', label: 'All Centers' },
              { id: 'Vaccines', label: '💉 Vaccines (TT/Rabies)' },
              { id: '24x7', label: '⚡ 24x7 Emergency' },
              { id: 'Primary Health Centre', label: '🏥 PHCs' },
              { id: 'Government Hospital', label: '🏛️ District Hospital' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFacilityTypeFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer border text-xs ${
                  facilityTypeFilter === tab.id
                    ? highContrast 
                      ? 'bg-yellow-400 text-black border-yellow-500 font-bold' 
                      : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : highContrast
                      ? 'bg-zinc-900 border-yellow-400/50 text-yellow-300'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredFacilities.map((facility) => {
              const isSelected = selectedFacilityId === facility.id;
              return (
                <div
                  key={facility.id}
                  onClick={() => setSelectedFacilityId(facility.id)}
                  className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer ${
                    isSelected
                      ? highContrast
                        ? 'bg-zinc-900 border-yellow-400 ring-2 ring-yellow-400/50'
                        : 'bg-emerald-50/40 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : highContrast
                        ? 'bg-zinc-900/80 border-yellow-500/40 text-yellow-200 hover:border-yellow-400'
                        : 'bg-white border-slate-200 text-slate-800 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          facility.type.includes('PHC') 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : facility.type.includes('Government') 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {facility.type}
                        </span>

                        {facility.hasVaccines && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Syringe className="w-3 h-3 text-emerald-600" /> TT / Rabies Stock
                          </span>
                        )}

                        {facility.has24x7Emergency && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                            24/7 Trauma
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-serif font-bold text-slate-900 dark:text-yellow-300">
                        {facility.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-yellow-400/70 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                        <span>{facility.address}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-yellow-300 text-xs font-bold font-mono">
                        <Compass className="w-3 h-3 text-emerald-600" />
                        {facility.distanceKm} km
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 dark:text-yellow-400/80 font-mono text-[11px]">
                      {facility.phone}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${facility.phone.replace(/[^0-9+]/g, '')}`}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PhoneCall className="w-3 h-3" /> Call Center
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${facility.lat},${facility.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Navigation className="w-3 h-3" /> Route <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Simulated Rural Map Radar */}
        <div className="lg:col-span-5">
          <div className={`p-5 sm:p-6 rounded-3xl border h-full flex flex-col justify-between shadow-xs ${
            highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold font-serif uppercase tracking-wider flex items-center gap-1.5 text-slate-800 dark:text-yellow-300">
                  <Crosshair className="w-4 h-4 text-emerald-600" /> Rural Proximity Radar
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-400">Range: 10 KM</span>
              </div>

              {/* Graphical Visual Proximity Radar Screen */}
              <div className="relative w-full h-80 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                {/* Radar Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />

                {/* Concentric Distance Rings */}
                <div className="absolute w-64 h-64 rounded-full border border-dashed border-emerald-500/20" />
                <div className="absolute w-44 h-44 rounded-full border border-dashed border-emerald-500/30" />
                <div className="absolute w-24 h-24 rounded-full border border-emerald-500/40" />
                
                {/* Crosshairs */}
                <div className="absolute inset-x-0 h-px bg-emerald-500/25" />
                <div className="absolute inset-y-0 w-px bg-emerald-500/25" />

                {/* Rotating Radar Sweep Beam */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div 
                    className="w-72 h-72 rounded-full border-r-2 border-emerald-400/60 animate-spin" 
                    style={{ 
                      animationDuration: '6s', 
                      background: 'conic-gradient(from 0deg, transparent 270deg, rgba(16,185,129,0.15) 360deg)' 
                    }} 
                  />
                </div>

                {/* Center User Location Pin */}
                <div className="relative z-20 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold shadow-lg animate-ping absolute opacity-70" />
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shadow-lg border-2 border-white relative z-10">
                    YOU
                  </div>
                  <span className="bg-slate-900/90 text-sky-300 border border-sky-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow mt-1 whitespace-nowrap">
                    Current Clinic
                  </span>
                </div>

                {/* Facility Markers around radar */}
                {filteredFacilities.map((f, i) => {
                  const offsets = [
                    { top: '20%', left: '70%' },
                    { top: '68%', left: '26%' },
                    { top: '18%', left: '24%' },
                    { top: '76%', left: '74%' },
                    { top: '46%', left: '80%' }
                  ];
                  const pos = offsets[i % offsets.length];
                  const isSelected = selectedFacilityId === f.id;

                  return (
                    <div 
                      key={f.id} 
                      className={`absolute z-20 group transition-transform ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`} 
                      style={pos}
                    >
                      <button
                        onClick={() => setSelectedFacilityId(f.id)}
                        className="flex flex-col items-center cursor-pointer text-left"
                      >
                        <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-slate-900 transition ${
                          f.type.includes('PHC') ? 'bg-emerald-500' : f.type.includes('Government') ? 'bg-rose-500' : 'bg-sky-500'
                        }`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shadow mt-1 whitespace-nowrap border ${
                          isSelected
                            ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                            : 'bg-slate-900/90 text-white border-slate-700'
                        }`}>
                          {f.name.split(' ')[0]} ({f.distanceKm}km)
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-zinc-800 text-left text-xs text-slate-500 dark:text-yellow-400/80 space-y-1.5">
              <p className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><strong>Primary Health Centres (PHCs):</strong> Free first aid, Tetanus Toxoid, wound debridement & basic sutures.</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span><strong>National 108 Ambulance:</strong> Free 24/7 emergency response across all rural Panchayats.</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
