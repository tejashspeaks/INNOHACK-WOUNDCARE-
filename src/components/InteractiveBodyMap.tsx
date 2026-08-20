import React, { useState } from 'react';
import { BodyRegion, CaseRecord, Language } from '../types';
import { User, Activity, RotateCw, Filter, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InteractiveBodyMapProps {
  cases: CaseRecord[];
  selectedRegion: BodyRegion | 'all';
  onSelectRegion: (region: BodyRegion | 'all') => void;
  highContrast: boolean;
  currentLang: Language;
}

interface RegionMetadata {
  id: BodyRegion;
  name: { en: string; hi: string; ta: string };
  description: string;
}

export const REGIONS_META: RegionMetadata[] = [
  { id: 'head', name: { en: 'Head & Face', hi: 'सिर और चेहरा', ta: 'தலை மற்றும் முகம்' }, description: 'Cranial, facial, temporal & scalp' },
  { id: 'neck', name: { en: 'Neck & Throat', hi: 'गर्दन और गला', ta: 'கழுத்து' }, description: 'Cervical spine & carotid zone' },
  { id: 'torso', name: { en: 'Torso & Chest', hi: 'धड़ और छाती', ta: 'மார்பு / வயிறு' }, description: 'Pectoral, abdominal & flank' },
  { id: 'right-arm', name: { en: 'Right Arm', hi: 'दायां हाथ/बांह', ta: 'வலது கை' }, description: 'Right shoulder, bicep & forearm' },
  { id: 'left-arm', name: { en: 'Left Arm', hi: 'बायां हाथ/बांह', ta: 'இடது கை' }, description: 'Left shoulder, bicep & forearm' },
  { id: 'hands-feet', name: { en: 'Hands & Feet', hi: 'हथेलियां और पैर', ta: 'கைகள் / பாதங்கள்' }, description: 'Palms, wrists, plantar heel & toes' },
  { id: 'right-leg', name: { en: 'Right Leg', hi: 'दायीं टांग', ta: 'வலது கால்' }, description: 'Right thigh, patella & calf' },
  { id: 'left-leg', name: { en: 'Left Leg', hi: 'बायीं टांग', ta: 'இடது கால்' }, description: 'Left thigh, patella & calf' }
];

// Helper to determine the body region of a case record
export function extractCaseRegion(record: CaseRecord): BodyRegion {
  if (record.bodyRegion) return record.bodyRegion;
  
  const text = `${record.location || ''} ${record.notes || ''} ${record.result.woundTypeDescription?.en || ''} ${record.result.triageSummary?.en || ''}`.toLowerCase();
  
  if (/head|face|forehead|scalp|eye|cheek|chin|ear|nose|cranial/i.test(text)) return 'head';
  if (/neck|throat|cervical|carotid/i.test(text)) return 'neck';
  if (/chest|abdomen|torso|belly|rib|flank|back|stomach|pectoral/i.test(text)) return 'torso';
  if (/right\s*(arm|forearm|bicep|shoulder|elbow)/i.test(text)) return 'right-arm';
  if (/left\s*(arm|forearm|bicep|shoulder|elbow)/i.test(text)) return 'left-arm';
  if (/arm|forearm|bicep|shoulder|elbow/i.test(text)) return 'right-arm'; // Default arm
  if (/hand|palm|wrist|finger|thumb|foot|feet|heel|sole|toe|plantar/i.test(text)) return 'hands-feet';
  if (/right\s*(leg|thigh|knee|patella|shin|calf)/i.test(text)) return 'right-leg';
  if (/left\s*(leg|thigh|knee|patella|shin|calf)/i.test(text)) return 'left-leg';
  if (/leg|thigh|knee|patella|shin|calf/i.test(text)) return 'left-leg'; // Default leg

  // Fallback distribution by case index if unassigned
  return 'torso';
}

export const InteractiveBodyMap: React.FC<InteractiveBodyMapProps> = ({
  cases,
  selectedRegion,
  onSelectRegion,
  highContrast,
  currentLang
}) => {
  const [viewMode, setViewMode] = useState<'anterior' | 'posterior'>('anterior');
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);

  // Compute counts per body region
  const regionCounts = React.useMemo(() => {
    const counts: Record<BodyRegion, number> = {
      'head': 0,
      'neck': 0,
      'torso': 0,
      'left-arm': 0,
      'right-arm': 0,
      'hands-feet': 0,
      'left-leg': 0,
      'right-leg': 0
    };

    cases.forEach(c => {
      const reg = extractCaseRegion(c);
      if (counts[reg] !== undefined) {
        counts[reg] += 1;
      }
    });

    return counts;
  }, [cases]);

  // Check if a region contains severe cases
  const regionHasSevere = (region: BodyRegion) => {
    return cases.some(c => extractCaseRegion(c) === region && c.result.severity === 'Severe');
  };

  const getRegionFill = (region: BodyRegion) => {
    const isSelected = selectedRegion === region;
    const isHovered = hoveredRegion === region;
    const count = regionCounts[region] || 0;
    const hasSevere = regionHasSevere(region);

    if (isSelected) {
      return highContrast ? '#eab308' : '#5A5A40'; // Primary active olive / yellow
    }
    if (isHovered) {
      return highContrast ? '#ca8a04' : '#787858';
    }
    if (count > 0) {
      if (hasSevere) return '#ef4444'; // Red for severe wounds
      return highContrast ? '#854d0e' : '#a3a380'; // Tinted olive for active wounds
    }
    return highContrast ? '#27272a' : '#eae7de'; // Neutral body tone
  };

  const getRegionStroke = (region: BodyRegion) => {
    if (selectedRegion === region) return highContrast ? '#fef08a' : '#2c2c20';
    if (hoveredRegion === region) return '#5A5A40';
    return highContrast ? '#52525b' : '#d1cdbf';
  };

  const activeMeta = REGIONS_META.find(r => r.id === selectedRegion);

  return (
    <div className={`p-5 rounded-3xl border transition shadow-sm space-y-4 ${
      highContrast ? 'bg-zinc-950 border-yellow-400 text-yellow-300' : 'bg-[#fcfbf9] border-[#e2dfd5] text-[#2c2c2c]'
    }`}>
      
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#e2dfd5]">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#5A5A40]" />
            <h3 className="text-sm font-serif font-bold text-[#5A5A40]">
              {currentLang === 'hi' ? 'इंटरएक्टिव बॉडी मैप फ़िल्टर' : currentLang === 'ta' ? 'உடல் பகுதி வடிகட்டி' : 'Interactive Anatomical Body Map'}
            </h3>
          </div>
          <p className="text-[11px] text-[#8e8b82]">
            Tap any anatomical region on the mannequin to filter recorded wound cases by body location.
          </p>
        </div>

        {/* View Angle & Reset */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'anterior' ? 'posterior' : 'anterior')}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-[#e2dfd5] text-[#5A5A40] hover:bg-[#f0ede4] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Rotate Anterior/Posterior view"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="capitalize">{viewMode === 'anterior' ? 'Front (Anterior)' : 'Back (Posterior)'}</span>
          </button>

          {selectedRegion !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectRegion('all')}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#5A5A40] text-white hover:bg-[#4a4a34] transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>Show All ({cases.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Side: Interactive SVG Mannequin (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-[#e2dfd5] relative shadow-inner min-h-[340px]">
          
          {/* Mannequin SVG */}
          <svg
            viewBox="0 0 240 380"
            className="w-48 h-80 select-none cursor-pointer transition duration-200 drop-shadow-xs"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Grid Accent Lines */}
            <g stroke="#f0ede4" strokeWidth="0.5" strokeDasharray="3 3">
              <line x1="120" y1="10" x2="120" y2="370" />
              <line x1="20" y1="110" x2="220" y2="110" />
              <line x1="20" y1="210" x2="220" y2="210" />
            </g>

            {/* 1. HEAD & FACE */}
            <g
              onClick={() => onSelectRegion(selectedRegion === 'head' ? 'all' : 'head')}
              onMouseEnter={() => setHoveredRegion('head')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="transition cursor-pointer"
            >
              <ellipse
                cx="120"
                cy="38"
                rx="24"
                ry="28"
                fill={getRegionFill('head')}
                stroke={getRegionStroke('head')}
                strokeWidth={selectedRegion === 'head' ? '2.5' : '1.5'}
              />
              {/* Head Count Badge */}
              {regionCounts.head > 0 && (
                <g>
                  <circle cx="138" cy="22" r="8" fill="#c62828" stroke="#fff" strokeWidth="1.5" />
                  <text x="138" y="25" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                    {regionCounts.head}
                  </text>
                </g>
              )}
            </g>

            {/* 2. NECK & THROAT */}
            <g
              onClick={() => onSelectRegion(selectedRegion === 'neck' ? 'all' : 'neck')}
              onMouseEnter={() => setHoveredRegion('neck')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="transition cursor-pointer"
            >
              <path
                d="M 112 66 L 128 66 L 132 82 L 108 82 Z"
                fill={getRegionFill('neck')}
                stroke={getRegionStroke('neck')}
                strokeWidth={selectedRegion === 'neck' ? '2.5' : '1.5'}
              />
              {regionCounts.neck > 0 && (
                <g>
                  <circle cx="138" cy="74" r="7" fill="#c62828" stroke="#fff" strokeWidth="1.5" />
                  <text x="138" y="77" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">
                    {regionCounts.neck}
                  </text>
                </g>
              )}
            </g>

            {/* 3. TORSO & CHEST */}
            <g
              onClick={() => onSelectRegion(selectedRegion === 'torso' ? 'all' : 'torso')}
              onMouseEnter={() => setHoveredRegion('torso')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="transition cursor-pointer"
            >
              <path
                d="M 96 82 L 144 82 L 152 135 L 140 185 L 100 185 L 88 135 Z"
                fill={getRegionFill('torso')}
                stroke={getRegionStroke('torso')}
                strokeWidth={selectedRegion === 'torso' ? '2.5' : '1.5'}
                rx="6"
              />
              {/* Torso Center Marker / Badge */}
              {regionCounts.torso > 0 && (
                <g>
                  <circle cx="120" cy="130" r="10" fill="#c62828" stroke="#fff" strokeWidth="2" />
                  <text x="120" y="133.5" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                    {regionCounts.torso}
                  </text>
                </g>
              )}
            </g>

            {/* 4. RIGHT ARM (Viewer's Left) */}
            <g
              onClick={() => onSelectRegion(selectedRegion === 'right-arm' ? 'all' : 'right-arm')}
              onMouseEnter={() => setHoveredRegion('right-arm')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="transition cursor-pointer"
            >
              {/* Upper Arm & Forearm */}
              <path
                d="M 94 84 L 70 100 L 52 145 L 64 150 L 82 110 L 92 98 Z"
                fill={getRegionFill('right-arm')}
                stroke={getRegionStroke('right-arm')}
                strokeWidth={selectedRegion === 'right-arm' ? '2.5' : '1.5'}
              />
              {regionCounts['right-arm'] > 0 && (
                <g>
                  <circle cx="58" cy="120" r="8" fill="#c62828" stroke="#fff" strokeWidth="1.5" />
                  <text x="58" y="123" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                    {regionCounts['right-arm']}
                  </text>
                </g>
              )}
            </g>

            {/* 5. LEFT ARM (Viewer's Right) */}
            <g
              onClick={() => onSelectRegion(selectedRegion === 'left-arm' ? 'all' : 'left-arm')}
              onMouseEnter={() => setHoveredRegion('left-arm')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="transition cursor-pointer"
            >
              <path
                d="M 146 84 L 170 100 L 188 145 L 176 150 L 158 110 L 148 98 Z"
                fill={getRegionFill('left-arm')}
                stroke={getRegionStroke('left-arm')}
                strokeWidth={selectedRegion === 'left-arm' ? '2.5' : '1.5'}
              />
              {regionCounts['left-arm'] > 0 && (
                <g>
                  <circle cx="182" cy="120" r="8" fill="#c62828" stroke="#fff" strokeWidth="1.5" />
                  <text x="182" y="123" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                    {regionCounts['left-arm']}
                  </text>
                </g>
              )}
            </g>

            {/* 6. HANDS & FEET EXTREMITIES */}
            <g
              onClick={() => onSelectRegion(selectedRegion === 'hands-feet' ? 'all' : 'hands-feet')}
              onMouseEnter={() => setHoveredRegion('hands-feet')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="transition cursor-pointer"
            >
              {/* Right Hand */}
              <ellipse
                cx="46"
                cy="160"
                rx="8"
                ry="11"
                fill={getRegionFill('hands-feet')}
                stroke={getRegionStroke('hands-feet')}
                strokeWidth={selectedRegion === 'hands-feet' ? '2.5' : '1.5'}
              />
              {/* Left Hand */}
              <ellipse
                cx="194"
                cy="160"
                rx="8"
                ry="11"
                fill={getRegionFill('hands-feet')}
                stroke={getRegionStroke('hands-feet')}
                strokeWidth={selectedRegion === 'hands-feet' ? '2.5' : '1.5'}
              />
              {/* Right Foot */}
              <path
                d="M 94 345 L 110 345 L 114 362 L 88 362 Z"
                fill={getRegionFill('hands-feet')}
                stroke={getRegionStroke('hands-feet')}
                strokeWidth={selectedRegion === 'hands-feet' ? '2.5' : '1.5'}
              />
              {/* Left Foot */}
              <path
                d="M 130 345 L 146 345 L 152 362 L 126 362 Z"
                fill={getRegionFill('hands-feet')}
                stroke={getRegionStroke('hands-feet')}
                strokeWidth={selectedRegion === 'hands-feet' ? '2.5' : '1.5'}
              />
              {regionCounts['hands-feet'] > 0 && (
                <g>
                  <circle cx="194" cy="174" r="8" fill="#c62828" stroke="#fff" strokeWidth="1.5" />
                  <text x="194" y="177" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                    {regionCounts['hands-feet']}
                  </text>
                </g>
              )}
            </g>

            {/* 7. RIGHT LEG (Viewer's Left) */}
            <g
              onClick={() => onSelectRegion(selectedRegion === 'right-leg' ? 'all' : 'right-leg')}
              onMouseEnter={() => setHoveredRegion('right-leg')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="transition cursor-pointer"
            >
              {/* Right Thigh & Shin */}
              <path
                d="M 98 188 L 118 188 L 114 265 L 112 342 L 94 342 L 96 265 Z"
                fill={getRegionFill('right-leg')}
                stroke={getRegionStroke('right-leg')}
                strokeWidth={selectedRegion === 'right-leg' ? '2.5' : '1.5'}
              />
              {regionCounts['right-leg'] > 0 && (
                <g>
                  <circle cx="104" cy="260" r="8" fill="#c62828" stroke="#fff" strokeWidth="1.5" />
                  <text x="104" y="263" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                    {regionCounts['right-leg']}
                  </text>
                </g>
              )}
            </g>

            {/* 8. LEFT LEG (Viewer's Right) */}
            <g
              onClick={() => onSelectRegion(selectedRegion === 'left-leg' ? 'all' : 'left-leg')}
              onMouseEnter={() => setHoveredRegion('left-leg')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="transition cursor-pointer"
            >
              {/* Left Thigh & Shin */}
              <path
                d="M 122 188 L 142 188 L 144 265 L 146 342 L 128 342 L 126 265 Z"
                fill={getRegionFill('left-leg')}
                stroke={getRegionStroke('left-leg')}
                strokeWidth={selectedRegion === 'left-leg' ? '2.5' : '1.5'}
              />
              {regionCounts['left-leg'] > 0 && (
                <g>
                  <circle cx="136" cy="260" r="8" fill="#c62828" stroke="#fff" strokeWidth="1.5" />
                  <text x="136" y="263" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                    {regionCounts['left-leg']}
                  </text>
                </g>
              )}
            </g>
          </svg>

          {/* Region Hover Indicator tooltip */}
          <div className="absolute bottom-2 inset-x-3 text-center pointer-events-none">
            <span className="text-[10px] font-mono bg-black/75 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
              {hoveredRegion
                ? REGIONS_META.find(r => r.id === hoveredRegion)?.name[currentLang] || hoveredRegion
                : selectedRegion !== 'all'
                ? `Selected: ${activeMeta?.name[currentLang] || selectedRegion}`
                : 'Click any body region to filter'}
            </span>
          </div>
        </div>

        {/* Right Side: Region Selector Chips & Summary (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] font-serif flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#5A5A40]" />
              Anatomical Regions
            </span>
            <span className="text-[11px] text-[#8e8b82] font-mono">
              Total Logged: <strong>{cases.length} Wounds</strong>
            </span>
          </div>

          {/* Region Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
            {REGIONS_META.map((reg) => {
              const count = regionCounts[reg.id] || 0;
              const isSelected = selectedRegion === reg.id;
              const isHovered = hoveredRegion === reg.id;
              const hasSevere = regionHasSevere(reg.id);

              return (
                <button
                  key={reg.id}
                  onClick={() => onSelectRegion(isSelected ? 'all' : reg.id)}
                  onMouseEnter={() => setHoveredRegion(reg.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                      : isHovered
                      ? 'bg-[#f0ede4] text-[#2c2c2c] border-[#5A5A40]'
                      : 'bg-white text-[#2c2c2c] border-[#e2dfd5] hover:bg-[#faf8f5]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate">
                        {reg.name[currentLang] || reg.name.en}
                      </span>
                      {hasSevere && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Contains Severe Wounds" />
                      )}
                    </div>
                    <span className={`text-[10px] block truncate ${isSelected ? 'text-[#e2dfd5]' : 'text-[#8e8b82]'}`}>
                      {reg.description}
                    </span>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : count > 0
                      ? 'bg-[#e2dfd5] text-[#5A5A40]'
                      : 'bg-[#f0ede4] text-[#a8a59b]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Callout Card */}
          {activeMeta && (
            <div className="p-3.5 rounded-2xl bg-[#f0ede4]/80 border border-[#e2dfd5] text-xs flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[#5A5A40] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Filtering by: {activeMeta.name[currentLang] || activeMeta.name.en}
                </span>
                <p className="text-[11px] text-[#8e8b82] mt-0.5">
                  Showing {regionCounts[activeMeta.id]} recorded wound cases in this anatomical sector.
                </p>
              </div>
              <button
                onClick={() => onSelectRegion('all')}
                className="px-3 py-1 rounded-full bg-white text-[#5A5A40] border border-[#e2dfd5] hover:bg-[#e2dfd5] transition text-[10px] font-bold uppercase tracking-wider shrink-0 cursor-pointer shadow-2xs"
              >
                Clear Filter
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
