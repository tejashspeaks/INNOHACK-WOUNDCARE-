import React, { useState, useEffect, useMemo } from 'react';
import { 
  Ruler, 
  Coins, 
  CreditCard, 
  Bandage, 
  Baby, 
  User, 
  Sliders, 
  RotateCcw, 
  CheckCircle2, 
  Layers, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Language, PatientMode, WoundMeasurement } from '../types';
import { 
  REFERENCE_OBJECT_PRESETS, 
  ReferenceObjectOption, 
  calculateDynamicPixelToMillimeter,
  DynamicPixelMeasurementResult 
} from '../utils/pixelMeasurement';

interface DynamicPixelMeasurementCardProps {
  measurement?: WoundMeasurement;
  patientMode: PatientMode;
  currentLang: Language;
  highContrast?: boolean;
  onMeasurementChange?: (updated: WoundMeasurement) => void;
}

export const DynamicPixelMeasurementCard: React.FC<DynamicPixelMeasurementCardProps> = ({
  measurement,
  patientMode,
  currentLang,
  highContrast,
  onMeasurementChange
}) => {
  // Initial default pixel spans if none provided
  const initialLengthCm = measurement?.lengthCm || 3.5;
  const initialWidthCm = measurement?.widthCm || 1.8;

  // Selected Reference Object Preset
  const [selectedPresetId, setSelectedPresetId] = useState<ReferenceObjectOption['id']>('coin_5inr');
  const [customKnownMm, setCustomKnownMm] = useState<number>(23.0);
  
  // Pixel measurements (estimated from image coordinates)
  // Assuming default ~120px for reference coin (~0.19 mm/px)
  const [refObjectPx, setRefObjectPx] = useState<number>(120);
  const [woundPxLength, setWoundPxLength] = useState<number>(Math.round((initialLengthCm * 10) / 0.1917));
  const [woundPxWidth, setWoundPxWidth] = useState<number>(Math.round((initialWidthCm * 10) / 0.1917));
  
  // Anatomical location for curvature correction
  const [anatomicalLocation, setAnatomicalLocation] = useState<'extremity_limb' | 'torso_flat' | 'face_neck' | 'hand_foot'>('extremity_limb');
  
  // Calibration drawer open state
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);

  // When preset changes, update default mm
  const handlePresetSelect = (presetId: ReferenceObjectOption['id']) => {
    setSelectedPresetId(presetId);
    const preset = REFERENCE_OBJECT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      if (preset.id === 'anatomical_fingernail') {
        setCustomKnownMm(patientMode === 'child' ? 9.5 : 14.0);
      } else {
        setCustomKnownMm(preset.defaultDimensionMm);
      }
    }
  };

  // Synchronize when patientMode toggles (e.g. child fingernail vs adult fingernail)
  useEffect(() => {
    if (selectedPresetId === 'anatomical_fingernail') {
      setCustomKnownMm(patientMode === 'child' ? 9.5 : 14.0);
    }
  }, [patientMode, selectedPresetId]);

  // Compute live dynamic pixel-to-millimeter results
  const result: DynamicPixelMeasurementResult = useMemo(() => {
    return calculateDynamicPixelToMillimeter({
      woundPixelLength: woundPxLength,
      woundPixelWidth: woundPxWidth,
      referenceObjectPixelSpan: refObjectPx,
      referenceObjectKnownMm: customKnownMm,
      referenceObjectType: selectedPresetId,
      patientMode,
      anatomicalLocation
    });
  }, [
    woundPxLength, 
    woundPxWidth, 
    refObjectPx, 
    customKnownMm, 
    selectedPresetId, 
    patientMode, 
    anatomicalLocation
  ]);

  // Propagate changes upwards when calculated
  useEffect(() => {
    if (onMeasurementChange) {
      onMeasurementChange({
        lengthCm: result.lengthCm,
        widthCm: result.widthCm,
        lengthMm: result.lengthMm,
        widthMm: result.widthMm,
        areaMm2: result.areaMm2,
        areaCm2: result.areaCm2,
        perimeterMm: result.perimeterMm,
        formattedText: result.formattedText,
        pixelToMmRatio: result.pixelToMmRatio,
        calibration: result.calibration
      });
    }
  }, [result]);

  // Reset calibration
  const handleResetCalibration = () => {
    setSelectedPresetId('coin_5inr');
    setCustomKnownMm(23.0);
    setRefObjectPx(120);
    setWoundPxLength(Math.round((initialLengthCm * 10) / 0.1917));
    setWoundPxWidth(Math.round((initialWidthCm * 10) / 0.1917));
    setAnatomicalLocation('extremity_limb');
  };

  // Translations
  const labels: Record<Language, {
    title: string;
    subTitle: string;
    lengthLabel: string;
    widthLabel: string;
    areaLabel: string;
    perimeterLabel: string;
    ratioLabel: string;
    patientModeLabel: string;
    childModeNote: string;
    adultModeNote: string;
    referenceObjectLabel: string;
    calibrationToggle: string;
    resetBtn: string;
    refPxSlider: string;
    woundLengthPxSlider: string;
    woundWidthPxSlider: string;
    locationLabel: string;
    extremityOption: string;
    torsoOption: string;
    faceOption: string;
    handOption: string;
  }> = {
    en: {
      title: 'Pixel-to-Millimeter Surface Area Estimator',
      subTitle: 'Dynamic photogrammetric scale calibrated with reference object ratio & patient anatomy',
      lengthLabel: 'Length',
      widthLabel: 'Width',
      areaLabel: 'Surface Area',
      perimeterLabel: 'Perimeter',
      ratioLabel: 'Scale Resolution',
      patientModeLabel: patientMode === 'child' ? 'Pediatric Mode (<18)' : 'Adult Mode (18+)',
      childModeNote: 'Pediatric anatomical correction applied (+14% limb cylindrical curvature index & thinner dermis compliance).',
      adultModeNote: 'Adult standard planar projection with +8% limb contour curvature compensation.',
      referenceObjectLabel: 'Reference Calibration Object',
      calibrationToggle: 'Fine-Tune Reference Scale & Dimensions',
      resetBtn: 'Reset Scale',
      refPxSlider: 'Reference Object Pixel Span (px)',
      woundLengthPxSlider: 'Wound Long-Axis (px)',
      woundWidthPxSlider: 'Wound Short-Axis (px)',
      locationLabel: 'Anatomical Region',
      extremityOption: 'Limb / Arm / Leg (Cylindrical)',
      torsoOption: 'Torso / Chest / Back (Planar)',
      faceOption: 'Face / Neck (Contoured)',
      handOption: 'Hand / Foot / Digits'
    },
    hi: {
      title: 'पिक्सेल-से-मिलीमीटर सटीक घाव क्षेत्रफल मापक',
      subTitle: 'रेफरेंस ऑब्जेक्ट व मरीज की आयु (बाल/वयस्क) के अनुसार कैलिब्रेटेड वास्तविक माप',
      lengthLabel: 'लंबाई',
      widthLabel: 'चौड़ाई',
      areaLabel: 'घाव का क्षेत्रफल',
      perimeterLabel: 'परिमाप (Perimeter)',
      ratioLabel: 'पिक्सेल-से-mm अनुपात',
      patientModeLabel: patientMode === 'child' ? 'बाल रोगी (Pediatric <18)' : 'वयस्क रोगी (Adult 18+)',
      childModeNote: 'बाल चिकित्सा शारीरिक सुधार लागू (+14% वक्रता इंडेक्स एवं पतली त्वचा समायोजन)।',
      adultModeNote: 'वयस्क मानक शारीरिक वक्रता (+8% लिम्ब समोच्च मुआवजा)।',
      referenceObjectLabel: 'कैलिब्रेशन रेफरेंस वस्तु',
      calibrationToggle: 'पैमाना व पिक्सेल माप समायोजित करें',
      resetBtn: 'पैमाना रीसेट करें',
      refPxSlider: 'रेफरेंस वस्तु पिक्सेल आकार (px)',
      woundLengthPxSlider: 'घाव की लंबाई (पिक्सेल)',
      woundWidthPxSlider: 'घाव की चौड़ाई (पिक्सेल)',
      locationLabel: 'शारीरिक भाग',
      extremityOption: 'हाथ / पैर (बेलनाकार वक्रता)',
      torsoOption: 'धड़ / छाती / पीठ (समतल)',
      faceOption: 'चेहरा / गर्दन',
      handOption: 'हथेली / पंजा / उंगलियां'
    },
    ta: {
      title: 'பிக்சல்-டு-மில்லிமீட்டர் காயம் பரப்பளவு அளவீடு',
      subTitle: 'துல்லியமான புகைப்பட அளவீடு மற்றும் நோயாளி வயது அடிப்படையிலான கணக்கீடு',
      lengthLabel: 'நீளம்',
      widthLabel: 'அகலம்',
      areaLabel: 'மேற்பரப்பு பரப்பளவு',
      perimeterLabel: 'சுற்றளவு',
      ratioLabel: 'பிக்சல்-மிமீ விகிதம்',
      patientModeLabel: patientMode === 'child' ? 'குழந்தை பயன்முறை (<18)' : 'பெரியவர் பயன்முறை (18+)',
      childModeNote: 'குழந்தைகளுக்கான சிறப்பு உடற்கூறு சரிசெய்தல் (+14% வளைவு குறியீடு).',
      adultModeNote: 'பெரியவர்களுக்கான நிலையான அளவீடு (+8% வளைவு இழப்பீடு).',
      referenceObjectLabel: 'அளவீட்டு குறிப்புப் பொருள்',
      calibrationToggle: 'அளவுகோலை சரிசெய்யவும்',
      resetBtn: 'மீட்டமைக்க',
      refPxSlider: 'குறிப்புப் பொருள் பிக்சல் அளவு (px)',
      woundLengthPxSlider: 'காயத்தின் நீளப் பிக்சல்',
      woundWidthPxSlider: 'காயத்தின் அகலப் பிக்சல்',
      locationLabel: 'உடற்கூறு பகுதி',
      extremityOption: 'கை / கால் (வளைந்த மேற்பரப்பு)',
      torsoOption: 'மார்பு / முதுகு (சமதளம்)',
      faceOption: 'முகம் / கழுத்து',
      handOption: 'உள்ளங்கை / பாதம்'
    }
  };

  const curr = labels[currentLang] || labels.en;

  const currentPreset = REFERENCE_OBJECT_PRESETS.find(p => p.id === selectedPresetId);

  return (
    <div className={`p-5 rounded-3xl border space-y-4 transition-all ${
      highContrast 
        ? 'bg-black border-yellow-400 text-white' 
        : 'bg-[#f8faf5] border-[#d4decb] text-[#2c2c2c] shadow-xs'
    }`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d4decb]/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#5A5A40] text-white">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-[#2c2c2c] flex items-center gap-2">
              <span>{curr.title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                patientMode === 'child' ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {patientMode === 'child' ? <Baby className="w-3 h-3" /> : <User className="w-3 h-3" />}
                <span>{curr.patientModeLabel}</span>
              </span>
            </h4>
            <p className="text-[11px] text-[#5A5A40]">
              {curr.subTitle}
            </p>
          </div>
        </div>

        {/* Calibration Accordion Toggle */}
        <button
          type="button"
          onClick={() => setIsCalibrating(!isCalibrating)}
          className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition font-semibold self-start sm:self-auto cursor-pointer ${
            isCalibrating 
              ? 'bg-[#5A5A40] text-white border-[#5A5A40]' 
              : 'bg-white hover:bg-[#eef2e6] text-[#5A5A40] border-[#d4decb]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{curr.calibrationToggle}</span>
          {isCalibrating ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Measurements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Surface Area Box */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#d4decb] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8b82]">
            {curr.areaLabel}
          </span>
          <div className="my-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-extrabold text-[#5A5A40]">
                {result.areaCm2}
              </span>
              <span className="text-xs font-bold text-[#8e8b82]">cm²</span>
            </div>
            <span className="text-[11px] font-mono text-[#8e8b82]">
              (~{result.areaMm2} mm²)
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Elliptical Surface Model
          </span>
        </div>

        {/* Length & Width Dimensions */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#d4decb] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8b82]">
            {curr.lengthLabel} × {curr.widthLabel}
          </span>
          <div className="my-1">
            <span className="text-base font-mono font-bold text-[#2c2c2c] block">
              {result.lengthCm} × {result.widthCm} <span className="text-xs text-[#8e8b82]">cm</span>
            </span>
            <span className="text-[11px] font-mono text-[#8e8b82] block">
              {result.lengthMm} × {result.widthMm} mm
            </span>
          </div>
          <span className="text-[10px] text-[#5A5A40]">
            Long × Short Axis
          </span>
        </div>

        {/* Perimeter */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#d4decb] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8b82]">
            {curr.perimeterLabel}
          </span>
          <div className="my-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-bold text-[#2c2c2c]">
                {result.perimeterMm}
              </span>
              <span className="text-xs font-bold text-[#8e8b82]">mm</span>
            </div>
            <span className="text-[11px] font-mono text-[#8e8b82]">
              (~{(result.perimeterMm / 10).toFixed(1)} cm)
            </span>
          </div>
          <span className="text-[10px] text-[#5A5A40]">
            Ramanujan's Contour
          </span>
        </div>

        {/* Pixel-to-mm Ratio */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#d4decb] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8b82]">
            {curr.ratioLabel}
          </span>
          <div className="my-1">
            <span className="text-base font-mono font-bold text-[#5A5A40] block">
              {result.pixelToMmRatio} <span className="text-xs text-[#8e8b82]">mm/px</span>
            </span>
            <span className="text-[11px] font-mono text-[#8e8b82] block">
              {result.pixelsPerMm} px/mm
            </span>
          </div>
          <span className="text-[10px] text-[#5A5A40] truncate" title={currentPreset?.name}>
            Ref: {currentPreset?.name.split('(')[0] || 'Standard'}
          </span>
        </div>
      </div>

      {/* Patient Mode Anatomical Note */}
      <div className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 border ${
        patientMode === 'child' 
          ? 'bg-orange-50/80 border-orange-200 text-orange-900' 
          : 'bg-[#eef2e6] border-[#d4decb] text-[#5A5A40]'
      }`}>
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">
            {patientMode === 'child' ? 'Pediatric Biometric Calibration Active: ' : 'Adult Biometric Scale Active: '}
          </span>
          <span>
            {patientMode === 'child' ? curr.childModeNote : curr.adultModeNote}
          </span>
        </div>
      </div>

      {/* Interactive Calibration Drawer */}
      {isCalibrating && (
        <div className="p-4 rounded-2xl bg-white border border-[#d4decb] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-[#e2dfd5] pb-2">
            <span className="text-xs font-bold text-[#5A5A40] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Reference Object Scale & Photogrammetry Calibration</span>
            </span>
            <button
              type="button"
              onClick={handleResetCalibration}
              className="text-[11px] text-[#5A5A40] hover:text-[#2c2c2c] flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{curr.resetBtn}</span>
            </button>
          </div>

          {/* Reference Object Preset Selection Chips */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#5A5A40] block">
              {curr.referenceObjectLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {REFERENCE_OBJECT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-start gap-2 ${
                    selectedPresetId === preset.id
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                      : 'bg-[#fdfcf8] hover:bg-[#f5f7f2] text-[#2c2c2c] border-[#e2dfd5]'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    selectedPresetId === preset.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#5A5A40]'
                  }`}>
                    {preset.id.includes('coin') ? <Coins className="w-3.5 h-3.5" /> :
                     preset.id.includes('card') ? <CreditCard className="w-3.5 h-3.5" /> :
                     preset.id.includes('bandage') ? <Bandage className="w-3.5 h-3.5" /> :
                     <Ruler className="w-3.5 h-3.5" />}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold truncate">
                      {currentLang === 'hi' ? preset.nameHi : currentLang === 'ta' ? preset.nameTa : preset.name}
                    </div>
                    <div className={`text-[10px] ${selectedPresetId === preset.id ? 'text-white/80' : 'text-[#8e8b82]'}`}>
                      {preset.defaultDimensionMm} mm physical size
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dimension & Anatomical Location Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            {/* Known Object Physical mm */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#5A5A40]">
                <span>Reference Object Known Physical Size (mm)</span>
                <span className="font-mono font-bold">{customKnownMm} mm</span>
              </div>
              <input
                type="number"
                min="1.0"
                max="300.0"
                step="0.1"
                value={customKnownMm}
                onChange={(e) => setCustomKnownMm(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full p-2 rounded-xl border border-[#d4decb] bg-[#fdfcf8] text-xs font-mono font-bold"
              />
            </div>

            {/* Anatomical Region Selector */}
            <div className="space-y-1.5">
              <span className="text-[#5A5A40] block font-bold">{curr.locationLabel}</span>
              <select
                value={anatomicalLocation}
                onChange={(e: any) => setAnatomicalLocation(e.target.value)}
                className="w-full p-2 rounded-xl border border-[#d4decb] bg-[#fdfcf8] text-xs font-semibold cursor-pointer"
              >
                <option value="extremity_limb">{curr.extremityOption}</option>
                <option value="torso_flat">{curr.torsoOption}</option>
                <option value="face_neck">{curr.faceOption}</option>
                <option value="hand_foot">{curr.handOption}</option>
              </select>
            </div>
          </div>

          {/* Pixel Slider Fine-Tuning */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-[#e2dfd5]">
            {/* Reference Object Pixel Span */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#5A5A40]">
                <span>{curr.refPxSlider}</span>
                <span className="font-mono font-bold text-[#5A5A40]">{refObjectPx} px</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="1"
                value={refObjectPx}
                onChange={(e) => setRefObjectPx(parseInt(e.target.value, 10))}
                className="w-full accent-[#5A5A40] cursor-pointer"
              />
            </div>

            {/* Wound Long Axis px */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#5A5A40]">
                <span>{curr.woundLengthPxSlider}</span>
                <span className="font-mono font-bold text-[#5A5A40]">{woundPxLength} px</span>
              </div>
              <input
                type="range"
                min="10"
                max="800"
                step="1"
                value={woundPxLength}
                onChange={(e) => setWoundPxLength(parseInt(e.target.value, 10))}
                className="w-full accent-[#5A5A40] cursor-pointer"
              />
            </div>

            {/* Wound Short Axis px */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#5A5A40]">
                <span>{curr.woundWidthPxSlider}</span>
                <span className="font-mono font-bold text-[#5A5A40]">{woundPxWidth} px</span>
              </div>
              <input
                type="range"
                min="10"
                max="800"
                step="1"
                value={woundPxWidth}
                onChange={(e) => setWoundPxWidth(parseInt(e.target.value, 10))}
                className="w-full accent-[#5A5A40] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
