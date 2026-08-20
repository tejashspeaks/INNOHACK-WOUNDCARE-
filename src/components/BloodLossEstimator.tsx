import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplet, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight, 
  Sliders, 
  RotateCcw, 
  Activity, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { BloodLossData, Language, WoundMeasurement, WoundType, SeverityLevel, ColorSegmentationData } from '../types';

interface BloodLossEstimatorProps {
  data?: BloodLossData;
  measurement?: WoundMeasurement;
  woundType?: WoundType;
  severity?: SeverityLevel;
  isNoWound?: boolean;
  currentLang: Language;
  onLaunchTourniquetGuide?: () => void;
  highContrast?: boolean;
}

export const BloodLossEstimator: React.FC<BloodLossEstimatorProps> = ({
  data,
  measurement,
  woundType,
  severity,
  isNoWound = false,
  currentLang,
  onLaunchTourniquetGuide,
  highContrast
}) => {
  // Base initial values derived from AI scan or fallback defaults
  const initialLength = isNoWound ? 0 : (measurement?.lengthCm ?? 3.5);
  const initialWidth = isNoWound ? 0 : (measurement?.widthCm ?? 1.8);
  const initialDepth = isNoWound 
    ? 'superficial' 
    : (data?.depthCategory ?? (severity === 'Severe' ? 'deep-arterial' : severity === 'Moderate' ? 'partial-thickness' : 'superficial'));
  
  const initialHemorrhage = isNoWound ? 0 : (data?.colorSegmentation?.hemorrhagePercent ?? (severity === 'Severe' ? 65 : severity === 'Moderate' ? 35 : 12));
  const initialGranulation = isNoWound ? 0 : (data?.colorSegmentation?.granulationPercent ?? (severity === 'Severe' ? 20 : 45));
  const initialSlough = isNoWound ? 0 : (data?.colorSegmentation?.sloughPercent ?? 5);
  
  // Interactive tuning state
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [customLength, setCustomLength] = useState<number>(initialLength);
  const [customWidth, setCustomWidth] = useState<number>(initialWidth);
  const [customDepth, setCustomDepth] = useState<'superficial' | 'partial-thickness' | 'full-thickness' | 'deep-arterial'>(initialDepth);
  const [customHemorrhagePercent, setCustomHemorrhagePercent] = useState<number>(initialHemorrhage);
  const [customGranulationPercent, setCustomGranulationPercent] = useState<number>(initialGranulation);
  const [customSloughPercent, setCustomSloughPercent] = useState<number>(initialSlough);
  
  // Tourniquet interactive step modal
  const [showTourniquetModal, setShowTourniquetModal] = useState<boolean>(false);
  const [tourniquetTimerSeconds, setTourniquetTimerSeconds] = useState<number>(0);
  const [isTourniquetTimerActive, setIsTourniquetTimerActive] = useState<boolean>(false);

  // Sync state when new AI data loads
  useEffect(() => {
    setCustomLength(isNoWound ? 0 : (measurement?.lengthCm ?? 3.5));
    setCustomWidth(isNoWound ? 0 : (measurement?.widthCm ?? 1.8));
    setCustomDepth(isNoWound ? 'superficial' : (data?.depthCategory ?? (severity === 'Severe' ? 'deep-arterial' : severity === 'Moderate' ? 'partial-thickness' : 'superficial')));
    setCustomHemorrhagePercent(isNoWound ? 0 : (data?.colorSegmentation?.hemorrhagePercent ?? (severity === 'Severe' ? 65 : severity === 'Moderate' ? 35 : 12)));
    setCustomGranulationPercent(isNoWound ? 0 : (data?.colorSegmentation?.granulationPercent ?? (severity === 'Severe' ? 20 : 45)));
    setCustomSloughPercent(isNoWound ? 0 : (data?.colorSegmentation?.sloughPercent ?? 5));
  }, [data, measurement, isNoWound, severity]);

  // Tourniquet timer interval
  useEffect(() => {
    let interval: any;
    if (isTourniquetTimerActive) {
      interval = setInterval(() => {
        setTourniquetTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTourniquetTimerActive]);

  // Wound type etiology bleeding multiplier
  const etiologyMultiplier = useMemo(() => {
    const typeStr = (woundType || '').toLowerCase();
    if (isNoWound || typeStr.includes('healthy') || typeStr.includes('no wound')) return 0;
    if (typeStr.includes('avulsion') || typeStr.includes('arterial') || typeStr.includes('amputation')) return 3.2;
    if (typeStr.includes('laceration') || typeStr.includes('bite') || typeStr.includes('gunshot')) return 1.8;
    if (typeStr.includes('puncture') || typeStr.includes('stab')) return 1.4;
    if (typeStr.includes('burn') || typeStr.includes('ulcer')) return 0.5;
    if (typeStr.includes('abrasion') || typeStr.includes('contusion') || typeStr.includes('skin tear')) return 0.35;
    return 1.0;
  }, [woundType, isNoWound]);

  // Depth multiplier
  const depthMultiplier = useMemo(() => {
    switch (customDepth) {
      case 'deep-arterial': return 4.5;
      case 'full-thickness': return 2.2;
      case 'partial-thickness': return 1.0;
      case 'superficial':
      default: return 0.35;
    }
  }, [customDepth]);

  // Dynamic Volume Calculation Engine:
  // Surface Area (approx ellipse cm²) = (L * W * 0.785)
  // Blood Loss Volume (mL) = Area * Depth Factor * (Hemorrhage% / 100 * 4.0 + Granulation% / 100 * 0.8) * Etiology Multiplier
  const { 
    calculatedVolumeMl, 
    calculatedAreaCm2, 
    calculatedCategory, 
    requiresTourniquet, 
    bleedingRateMlMin,
    hypovolemicClass 
  } = useMemo(() => {
    if (isNoWound || (customLength === 0 && customWidth === 0)) {
      return {
        calculatedVolumeMl: 0,
        calculatedAreaCm2: 0,
        calculatedCategory: 'Minimal (<50ml)' as const,
        requiresTourniquet: false,
        bleedingRateMlMin: 0,
        hypovolemicClass: 'Normal (Class I / None)'
      };
    }

    const area = parseFloat((customLength * customWidth * 0.785).toFixed(2));
    const activeColorWeight = (customHemorrhagePercent / 100) * 4.2 + (customGranulationPercent / 100) * 0.9;
    
    let vol = Math.round(area * depthMultiplier * activeColorWeight * etiologyMultiplier);
    
    // Floor boundary conditions
    if (customHemorrhagePercent > 50 && vol < 45) vol = 45;
    if (customDepth === 'deep-arterial' && vol < 260) vol = 280;
    if (vol > 1200) vol = 1200; // physiological cap for localized field triage

    let cat: 'Minimal (<50ml)' | 'Moderate (50-250ml)' | 'Severe (>250ml)' = 'Minimal (<50ml)';
    if (vol > 250) {
      cat = 'Severe (>250ml)';
    } else if (vol > 50) {
      cat = 'Moderate (50-250ml)';
    }

    const isTourniquet = vol > 250 || customDepth === 'deep-arterial' || (data?.requiresTourniquet && vol > 150);
    const rate = isTourniquet ? Math.min(60, parseFloat((vol * 0.08).toFixed(1))) : parseFloat((vol * 0.03).toFixed(1));

    let hypClass = 'Class I (<15% Blood Volume Loss)';
    if (vol > 450) {
      hypClass = 'Class III/IV (Severe Hypovolemic Shock Risk)';
    } else if (vol > 250) {
      hypClass = 'Class II (Compensated Tachycardia Risk)';
    }

    return {
      calculatedVolumeMl: vol,
      calculatedAreaCm2: area,
      calculatedCategory: cat,
      requiresTourniquet: !!isTourniquet,
      bleedingRateMlMin: rate,
      hypovolemicClass: hypClass
    };
  }, [
    isNoWound, 
    customLength, 
    customWidth, 
    depthMultiplier, 
    customHemorrhagePercent, 
    customGranulationPercent, 
    etiologyMultiplier, 
    customDepth, 
    data?.requiresTourniquet
  ]);

  const isSevere = calculatedVolumeMl > 250 || requiresTourniquet;
  const isModerate = calculatedVolumeMl > 50 && calculatedVolumeMl <= 250;
  const isMinimal = calculatedVolumeMl <= 50;

  // Visual Gauge needle angle (-90deg to +90deg across 0 to 500 mL)
  const maxMeterMl = 500;
  const gaugePercentage = calculatedVolumeMl === 0 ? 0 : Math.min(100, (calculatedVolumeMl / maxMeterMl) * 100);
  const needleAngle = -90 + (gaugePercentage / 100) * 180;

  // Intact periwound margin calculated remaining
  const intactMarginPercent = Math.max(0, 100 - (customHemorrhagePercent + customGranulationPercent + customSloughPercent));

  // Reset to original AI scan values
  const handleResetCalibration = () => {
    setCustomLength(initialLength);
    setCustomWidth(initialWidth);
    setCustomDepth(initialDepth);
    setCustomHemorrhagePercent(initialHemorrhage);
    setCustomGranulationPercent(initialGranulation);
    setCustomSloughPercent(initialSlough);
  };

  // Multilingual translations
  const labels: Record<Language, {
    title: string;
    gaugeSub: string;
    volumeLabel: string;
    areaLabel: string;
    rateLabel: string;
    classLabel: string;
    colorSegmentationTitle: string;
    hemorrhageKey: string;
    granulationKey: string;
    sloughKey: string;
    intactKey: string;
    calibrateToggle: string;
    resetButton: string;
    lengthSlider: string;
    widthSlider: string;
    depthSlider: string;
    hemorrhageSlider: string;
    tourniquetAlertTitle: string;
    tourniquetAlertBody: string;
    tourniquetBtn: string;
    tourniquetModalTitle: string;
    tourniquetStep1: string;
    tourniquetStep2: string;
    tourniquetStep3: string;
    tourniquetStep4: string;
    startTimer: string;
    stopTimer: string;
    emergencyCallBtn: string;
    closeBtn: string;
    zeroText: string;
  }> = {
    en: {
      title: 'Dynamic Blood Loss Estimator',
      gaugeSub: 'Calibrated via multi-spectral color segmentation & 3D lesion dimensions',
      volumeLabel: 'Estimated Hemorrhage',
      areaLabel: 'Surface Area',
      rateLabel: 'Flow Velocity',
      classLabel: 'Hemodynamic State',
      colorSegmentationTitle: 'Tissue Bed Color Segmentation (Chrominance %)',
      hemorrhageKey: 'Active Blood Pool',
      granulationKey: 'Granulation Bed',
      sloughKey: 'Fibrin / Slough',
      intactKey: 'Intact Margin',
      calibrateToggle: 'Adjust Dimensions & Color Calibration',
      resetButton: 'Reset to AI Scan',
      lengthSlider: 'Wound Length (cm)',
      widthSlider: 'Wound Width (cm)',
      depthSlider: 'Tissue Bed Depth',
      hemorrhageSlider: 'Active Red Blood Chroma (%)',
      tourniquetAlertTitle: 'CRITICAL HEMORRHAGE DETECTED (>250 mL)',
      tourniquetAlertBody: 'Pulsatile arterial or extensive tissue loss detected. Immediate mechanical tourniquet application required to prevent hypovolemic shock.',
      tourniquetBtn: 'Open Emergency Tourniquet Protocol',
      tourniquetModalTitle: 'Emergency Tourniquet Protocol (ATLS Standard)',
      tourniquetStep1: '1. Position Tourniquet: Place band 2-3 inches (5-7 cm) proximal to wound. Never place directly over a joint (elbow/knee).',
      tourniquetStep2: '2. Tighten Windlass: Turn windlass rod with steady torque until all bright red pulsatile bleeding ceases entirely.',
      tourniquetStep3: '3. Lock & Secure: Secure windlass in the retention clip. Check distal pulse to confirm complete vascular occlusion.',
      tourniquetStep4: '4. Record Exact Time: Write application timestamp clearly on patient forehead/tourniquet band (crucial for surgical ischemia window).',
      startTimer: 'Start Application Clock',
      stopTimer: 'Pause Clock',
      emergencyCallBtn: 'Call Emergency Ambulance (108 / 112)',
      closeBtn: 'Dismiss Protocol',
      zeroText: '0 mL (No Hemorrhage Detected - Skin Barrier Intact)'
    },
    hi: {
      title: 'डायनामिक रक्तस्राव मात्रा मापक (Blood Loss Estimator)',
      gaugeSub: 'रंग विभाजन (Color Segmentation) एवं घाव माप द्वारा स्वचालित गणना',
      volumeLabel: 'अनुमानित रक्तस्राव',
      areaLabel: 'घाव का क्षेत्रफल',
      rateLabel: 'बहाव गति',
      classLabel: 'रक्तचाप व शॉक स्थिति',
      colorSegmentationTitle: 'ऊतक रंग विभाजन स्पेक्ट्रम (Tissue Color %)',
      hemorrhageKey: 'सक्रिय रक्तस्राव',
      granulationKey: 'स्वस्थ लाल ऊतक',
      sloughKey: 'पीला स्राव (Slough)',
      intactKey: 'सुरक्षित किनारा',
      calibrateToggle: 'माप व रंग को मैन्युअल समायोजित करें',
      resetButton: 'AI स्कैन पर रीसेट करें',
      lengthSlider: 'घाव की लंबाई (cm)',
      widthSlider: 'घाव की चौड़ाई (cm)',
      depthSlider: 'घाव की गहराई',
      hemorrhageSlider: 'सक्रिय लाल रक्त कवरेज (%)',
      tourniquetAlertTitle: 'अत्यधिक रक्तस्राव चेतावनी (>250 mL)',
      tourniquetAlertBody: 'गंभीर रक्तस्राव! हाइपोवोलेमिक शॉक से बचाव के लिए घाव से 2-3 इंच ऊपर तुरंत कसकर पट्टी (Tourniquet) बांधें।',
      tourniquetBtn: 'आपातकालीन टूर्निकेट प्रोटोकॉल खोलें',
      tourniquetModalTitle: 'आपातकालीन टूर्निकेट निर्देश (Tourniquet Protocol)',
      tourniquetStep1: '1. टूर्निकेट लगाएं: घाव से 2-3 इंच ऊपर बांधें। कभी भी जोड़ (कोहनी/घुटने) पर न बांधें।',
      tourniquetStep2: '2. रॉड घुमाएं: रॉड को तब तक घुमाएं जब तक खून का तेज बहाव पूरी तरह बंद न हो जाए।',
      tourniquetStep3: '3. लॉक करें: रॉड को क्लिप में फंसाएं और नाड़ी (Pulse) चेक करें।',
      tourniquetStep4: '4. समय लिखें: पट्टी बांधने का सही समय मरीज के माथे या पट्टी पर लिख दें।',
      startTimer: 'टाइमर शुरू करें',
      stopTimer: 'टाइमर रोकें',
      emergencyCallBtn: 'एम्बुलेंस कॉल करें (108 / 112)',
      closeBtn: 'बंद करें',
      zeroText: '0 mL (कोई रक्तस्राव नहीं - त्वचा सुरक्षित है)'
    },
    ta: {
      title: 'டைனமிக் இரத்த இழப்பு அளவீடு',
      gaugeSub: 'நிறப் பகுப்பாய்வு மற்றும் பரிமாணங்கள் மூலம் கணக்கிடப்பட்டது',
      volumeLabel: 'மதிப்பிடப்பட்ட இரத்த இழப்பு',
      areaLabel: 'காயத்தின் பரப்பளவு',
      rateLabel: 'இரத்த ஓட்ட வேகம்',
      classLabel: 'அதிர்ச்சி நிலை',
      colorSegmentationTitle: 'திசு நிற பகுப்பாய்வு (Color Segmentation %)',
      hemorrhageKey: 'செயலில் உள்ள இரத்தம்',
      granulationKey: 'ஆரோக்கியமான திசு',
      sloughKey: 'மஞ்சள் சளி/திசு',
      intactKey: 'சுற்றியுள்ள தோல்',
      calibrateToggle: 'அளவுகளை சரிசெய்யவும்',
      resetButton: 'மீட்டமைக்க',
      lengthSlider: 'நீளம் (cm)',
      widthSlider: 'அகலம் (cm)',
      depthSlider: 'காயத்தின் ஆழம்',
      hemorrhageSlider: 'சிவப்பு இரத்த அளவு (%)',
      tourniquetAlertTitle: 'அதிதீவிர இரத்தப்போக்கு கண்டறியப்பட்டது (>250 mL)',
      tourniquetAlertBody: 'கடுமையான இரத்த இழப்பு! உடனடியாக காயத்திற்கு 2-3 அங்குலம் மேலே டூர்னிகெட் (Tourniquet) கட்டு போடவும்.',
      tourniquetBtn: 'டூர்னிகெட் வழிகாட்டியைப் பார்க்கவும்',
      tourniquetModalTitle: 'டூர்னிகெட் அவசர வழிகாட்டுதல் (Tourniquet Protocol)',
      tourniquetStep1: '1. வைக்கவும்: காயத்திற்கு 2-3 அங்குலத்திற்கு மேலே கட்டவும். மூட்டுகளில் கட்ட வேண்டாம்.',
      tourniquetStep2: '2. இறுக்கவும்: இரத்தப்போக்கு நிற்கும் வரை தடியை இறுக்கமாக சுழற்றவும்.',
      tourniquetStep3: '3. பூட்டவும்: தடியை கிளிப்பில் பூட்டவும்.',
      tourniquetStep4: '4. நேரம் குறிக்கவும்: கட்டிய நேரத்தை தெளிவாக குறித்து வைக்கவும்.',
      startTimer: 'நேரத்தை தொடங்கு',
      stopTimer: 'நிறுத்து',
      emergencyCallBtn: '108 அவசர ஊர்தியை அழைக்கவும்',
      closeBtn: 'மூடு',
      zeroText: '0 mL (இரத்தப்போக்கு இல்லை - தோல் ஆரோக்கியமாக உள்ளது)'
    }
  };

  const curr = labels[currentLang] || labels.en;

  // Format stopwatch MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-5 rounded-3xl border space-y-5 transition-all ${
      isSevere 
        ? highContrast ? 'bg-black border-red-500 text-white' : 'bg-red-950/20 border-red-500/80 text-[#2c2c2c] shadow-lg shadow-red-500/10'
        : highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-white border-[#e2dfd5] text-[#2c2c2c] shadow-sm'
    }`}>
      {/* Header with Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2dfd5]/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${
            isSevere ? 'bg-red-600 text-white animate-pulse' : isModerate ? 'bg-amber-500 text-white' : 'bg-[#5A5A40] text-white'
          }`}>
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm tracking-wide flex items-center gap-2">
              <span>{curr.title}</span>
              {isSevere && (
                <span className="text-[10px] bg-red-600 text-white font-mono uppercase px-2 py-0.5 rounded-full animate-bounce">
                  Critical
                </span>
              )}
            </h4>
            <p className="text-[11px] text-[#8e8b82]">
              {curr.gaugeSub}
            </p>
          </div>
        </div>

        {/* Quick Calibration Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCalibrating(!isCalibrating)}
          className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition font-semibold self-start sm:self-auto cursor-pointer ${
            isCalibrating 
              ? 'bg-[#5A5A40] text-white border-[#5A5A40]' 
              : 'bg-[#fdfcf8] hover:bg-[#f0ede4] text-[#5A5A40] border-[#e2dfd5]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{curr.calibrateToggle}</span>
          {isCalibrating ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Dual View: Radial Visual Speedometer Gauge + Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Visual Semicircular Arc Gauge (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5]/80 relative">
          <svg className="w-48 h-28 overflow-visible" viewBox="0 0 200 110">
            {/* Background Arc Tracks */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="25%" stopColor="#84cc16" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="75%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>

            {/* Gray Background Track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e2dfd5"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Colored Severity Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * (gaugePercentage / 100))}
              className="transition-all duration-700 ease-out"
            />

            {/* Tick Markers */}
            <text x="20" y="115" fontSize="9" fill="#8e8b82" fontWeight="bold" textAnchor="middle">0</text>
            <text x="65" y="42" fontSize="8" fill="#8e8b82" fontWeight="bold" textAnchor="middle">50ml</text>
            <text x="100" y="25" fontSize="8" fill="#8e8b82" fontWeight="bold" textAnchor="middle">250ml</text>
            <text x="180" y="115" fontSize="9" fill="#8e8b82" fontWeight="bold" textAnchor="middle">500ml+</text>

            {/* Needle Pivot Center */}
            <g transform={`rotate(${needleAngle}, 100, 100)`} className="transition-transform duration-700 ease-out">
              <line x1="100" y1="100" x2="100" y2="30" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
              <polygon points="97,35 103,35 100,24" fill="#dc2626" />
              <circle cx="100" cy="100" r="7" fill="#1f2937" />
              <circle cx="100" cy="100" r="3" fill="#ffffff" />
            </g>
          </svg>

          {/* Central Live Readout */}
          <div className="text-center mt-1">
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight ${
                isSevere ? 'text-red-600' : isModerate ? 'text-amber-600' : 'text-emerald-700'
              }`}>
                {calculatedVolumeMl}
              </span>
              <span className="text-xs font-bold text-[#8e8b82]">mL</span>
            </div>
            <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-0.5 border ${
              isSevere 
                ? 'bg-red-100 text-red-900 border-red-300' 
                : isModerate 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}>
              {calculatedCategory}
            </span>
          </div>
        </div>

        {/* Clinical Hemodynamic Parameters Grid (7 cols) */}
        <div className="md:col-span-7 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5] flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8b82]">
              {curr.areaLabel}
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-lg font-mono font-bold text-[#2c2c2c]">
                {calculatedAreaCm2}
              </span>
              <span className="text-[10px] text-[#8e8b82]">cm²</span>
            </div>
            <span className="text-[10px] text-[#5A5A40] truncate">
              {customLength}cm × {customWidth}cm
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5] flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8b82]">
              {curr.rateLabel}
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className={`text-lg font-mono font-bold ${isSevere ? 'text-red-600' : 'text-[#2c2c2c]'}`}>
                ~{bleedingRateMlMin}
              </span>
              <span className="text-[10px] text-[#8e8b82]">mL/min</span>
            </div>
            <span className="text-[10px] text-[#5A5A40]">
              {customDepth}
            </span>
          </div>

          <div className="col-span-2 p-3 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8b82] block">
                {curr.classLabel}
              </span>
              <span className={`text-xs font-bold ${isSevere ? 'text-red-700' : 'text-[#2c2c2c]'}`}>
                {hypovolemicClass}
              </span>
            </div>
            <div className={`p-2 rounded-xl ${isSevere ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Color Segmentation Multi-Bar Spectrum */}
      <div className="p-4 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5] space-y-2.5">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-[#5A5A40] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{curr.colorSegmentationTitle}</span>
          </h5>
          <span className="text-[10px] font-mono text-[#8e8b82]">
            RGB/HSV Spectral Decomp
          </span>
        </div>

        {/* Multi-Segment Color Ribbon */}
        <div className="h-3 w-full rounded-full overflow-hidden flex bg-gray-200 border border-black/5">
          <div 
            style={{ width: `${customHemorrhagePercent}%` }} 
            className="bg-red-600 transition-all duration-500" 
            title={`Active Hemorrhage: ${customHemorrhagePercent}%`} 
          />
          <div 
            style={{ width: `${customGranulationPercent}%` }} 
            className="bg-rose-400 transition-all duration-500" 
            title={`Granulation Red: ${customGranulationPercent}%`} 
          />
          <div 
            style={{ width: `${customSloughPercent}%` }} 
            className="bg-amber-400 transition-all duration-500" 
            title={`Slough Fibrin: ${customSloughPercent}%`} 
          />
          <div 
            style={{ width: `${intactMarginPercent}%` }} 
            className="bg-emerald-400 transition-all duration-500" 
            title={`Intact Skin Margin: ${intactMarginPercent}%`} 
          />
        </div>

        {/* Legend Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
            <span className="truncate">{curr.hemorrhageKey} ({customHemorrhagePercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
            <span className="truncate">{curr.granulationKey} ({customGranulationPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <span className="truncate">{curr.sloughKey} ({customSloughPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">{curr.intactKey} ({intactMarginPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Interactive Calibration Accordion Drawer */}
      {isCalibrating && (
        <div className="p-4 rounded-2xl bg-[#f0ede4]/70 border border-[#e2dfd5] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-[#e2dfd5] pb-2">
            <span className="text-xs font-bold text-[#5A5A40] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Real-Time Biometric Calibration Controls</span>
            </span>
            <button
              type="button"
              onClick={handleResetCalibration}
              className="text-[11px] text-[#5A5A40] hover:text-[#2c2c2c] flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{curr.resetButton}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Length Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#5A5A40]">
                <span>{curr.lengthSlider}</span>
                <span className="font-mono font-bold">{customLength} cm</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="25.0"
                step="0.1"
                value={customLength}
                onChange={(e) => setCustomLength(parseFloat(e.target.value))}
                className="w-full accent-[#5A5A40] cursor-pointer"
              />
            </div>

            {/* Width Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#5A5A40]">
                <span>{curr.widthSlider}</span>
                <span className="font-mono font-bold">{customWidth} cm</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="20.0"
                step="0.1"
                value={customWidth}
                onChange={(e) => setCustomWidth(parseFloat(e.target.value))}
                className="w-full accent-[#5A5A40] cursor-pointer"
              />
            </div>

            {/* Depth Grade Selector */}
            <div className="space-y-1.5">
              <span className="text-[#5A5A40] block">{curr.depthSlider}</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['superficial', 'partial-thickness', 'full-thickness', 'deep-arterial'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setCustomDepth(d)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold capitalize transition border cursor-pointer ${
                      customDepth === d
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-white text-[#5A5A40] border-[#e2dfd5] hover:bg-[#fdfcf8]'
                    }`}
                  >
                    {d.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Hemorrhage Chroma % Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#5A5A40]">
                <span>{curr.hemorrhageSlider}</span>
                <span className="font-mono font-bold text-red-600">{customHemorrhagePercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={customHemorrhagePercent}
                onChange={(e) => setCustomHemorrhagePercent(parseInt(e.target.value, 10))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Severe Blood Loss Urgent Banner & Tourniquet Trigger */}
      {isSevere && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl space-y-3.5 border border-red-400">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/20 shrink-0">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <span>{curr.tourniquetAlertTitle}</span>
              </h4>
              <p className="text-xs text-red-100 leading-relaxed mt-1">
                {curr.tourniquetAlertBody}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowTourniquetModal(true)}
              className="flex-1 bg-white text-red-700 hover:bg-red-50 font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{curr.tourniquetBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="tel:108"
              className="bg-red-950/70 hover:bg-red-950 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-red-300/30"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>108 Ambulance</span>
            </a>
          </div>
        </div>
      )}

      {/* Interactive Tourniquet Protocol Guide Modal */}
      {showTourniquetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 space-y-5 border border-red-200 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-serif font-bold text-base text-[#2c2c2c]">
                  {curr.tourniquetModalTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTourniquetModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stopwatch / Tourniquet Clock */}
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-red-800 tracking-wider block">
                    Ischemia Safety Window
                  </span>
                  <span className="font-mono text-xl font-bold text-red-950">
                    {formatTimer(tourniquetTimerSeconds)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTourniquetTimerActive(!isTourniquetTimerActive)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                  isTourniquetTimerActive 
                    ? 'bg-red-600 text-white border-red-700' 
                    : 'bg-white text-red-700 border-red-300'
                }`}
              >
                {isTourniquetTimerActive ? curr.stopTimer : curr.startTimer}
              </button>
            </div>

            {/* 4 Clinical Steps */}
            <div className="space-y-3 text-xs text-[#2c2c2c]">
              <div className="p-3 rounded-xl bg-[#fdfcf8] border border-[#e2dfd5] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{curr.tourniquetStep1}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#fdfcf8] border border-[#e2dfd5] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{curr.tourniquetStep2}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#fdfcf8] border border-[#e2dfd5] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{curr.tourniquetStep3}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#fdfcf8] border border-[#e2dfd5] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{curr.tourniquetStep4}</p>
              </div>
            </div>

            {/* Emergency Action Footer */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
              <a
                href="tel:108"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{curr.emergencyCallBtn}</span>
              </a>
              <button
                type="button"
                onClick={() => setShowTourniquetModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                {curr.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
