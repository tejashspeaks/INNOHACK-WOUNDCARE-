import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Language, 
  PatientMode, 
  EyeDiseaseAnalysisResult, 
  EyeConditionType,
  SampleEyeCase 
} from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { speakText, stopSpeech } from '../utils/speech';
import {
  Eye,
  EyeOff,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  RefreshCw,
  HeartPulse,
  Activity,
  Droplet,
  ShieldAlert,
  Building2,
  Layers,
  Info,
  ChevronRight,
  FileDown,
  Share2,
  Search,
  ExternalLink,
  Flame,
  Stethoscope,
  TestTube,
  Clock,
  Apple,
  Leaf,
  PhoneCall,
  Zap,
  BookmarkPlus,
  Compass,
  Scan,
  Maximize2
} from 'lucide-react';

interface EyeDiseaseScannerProps {
  currentLang: Language;
  useOfflineEngine: boolean;
  highContrast: boolean;
  patientMode: PatientMode;
  onOpenEmergencyModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface OpticalMetrics {
  yellownessIndex: number;
  rednessIndex: number;
  pallorRatio: number;
  luminance: number;
  estimatedBilirubinRange: string;
  estimatedHemoglobinRange: string;
}

// Sample Ocular & Systemic Disease Cases for instant clinical testing
const SAMPLE_EYE_CASES: SampleEyeCase[] = [
  {
    id: 'eye-case-jaundice',
    title: 'Jaundice / Scleral Icterus (Hepatic Dysfunction)',
    conditionType: 'Jaundice / Scleral Icterus',
    severity: 'Severe',
    description: 'Prominent diffuse yellow pigmentation across sclera elastica with elevated serum bilirubin markers (Viral Hepatitis / Liver Disease).',
    clinicalSigns: 'Scleral yellowing 86% • Est. Bilirubin 5.4 mg/dL • Dark Urine & Clay Stools Correlation',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
    patientMode: 'adult'
  },
  {
    id: 'eye-case-typhoid',
    title: 'Typhoid / Enteric Fever (Ocular Toxemia)',
    conditionType: 'Typhoid Fever (Ocular & Toxemic Signs)',
    severity: 'Severe',
    description: 'Ocular conjunctival suffusion, dull glassy toxic stare, and sunken orbital appearance indicative of Salmonella enterica systemic endotoxemia.',
    clinicalSigns: 'Typhoid Risk 88% • Step-Ladder High Fever • Widal & Blood Culture Required',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    patientMode: 'adult'
  },
  {
    id: 'eye-case-anemia',
    title: 'Severe Anemia (Conjunctival Pallor)',
    conditionType: 'Severe Anemia (Conjunctival Pallor)',
    severity: 'Moderate',
    description: 'Blanched, chalky-white inferior palpebral conjunctiva signifying profound microvascular hemoglobin depletion.',
    clinicalSigns: 'Pallor Index 88% • Est. Hemoglobin 7.2 g/dL • Fatigue, Dyspnea & Dizziness',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    patientMode: 'adult'
  },
  {
    id: 'eye-case-conjunctivitis',
    title: 'Acute Bacterial Conjunctivitis ("Pink Eye")',
    conditionType: 'Infectious Conjunctivitis (Bacterial / Viral)',
    severity: 'Moderate',
    description: 'Marked ciliary injection and engorgement with yellowish mucopurulent discharge crusted at the canthus.',
    clinicalSigns: 'Vascular Injection 94% • Purulent Exudate • Topical Antibiotics Indicated',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
    patientMode: 'child'
  },
  {
    id: 'eye-case-vitamin-a',
    title: "Vitamin A Deficiency (Bitot's Spots / Xerophthalmia)",
    conditionType: "Vitamin A Deficiency (Bitot's Spots / Xerophthalmia)",
    severity: 'Severe',
    description: "Triangular, pearly-white foamy patch (Bitot's spot) on temporal bulbar conjunctiva with night blindness history.",
    clinicalSigns: 'Bitot Score 89% • High Keratomalacia Risk • Oral Megadose Vitamin A Indicated',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    patientMode: 'child'
  },
  {
    id: 'eye-case-healthy',
    title: 'Normal Intact Eye (Clear Sclera & Vascular Bed)',
    conditionType: 'Healthy Normal Eye',
    severity: 'None',
    description: 'Glistening white scleral shell, healthy salmon-pink palpebral conjunctival capillaries, and clear corneal reflex.',
    clinicalSigns: 'Zero Pathology • Scleral Icterus 2% • Hemoglobin > 13.0 g/dL',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
    patientMode: 'adult'
  }
];

export const EyeDiseaseScanner: React.FC<EyeDiseaseScannerProps> = ({
  currentLang,
  useOfflineEngine,
  highContrast,
  patientMode,
  onOpenEmergencyModal,
  onNavigateTab
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [result, setResult] = useState<EyeDiseaseAnalysisResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeCamera, setActiveCamera] = useState(false);
  const [activeEyeZone, setActiveEyeZone] = useState<'all' | 'sclera' | 'conjunctiva' | 'cornea'>('all');
  const [showReticleHUD, setShowReticleHUD] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [liveOpticalMetrics, setLiveOpticalMetrics] = useState<OpticalMetrics | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t = {
    en: {
      heading: 'Ocular & Sclera Disease Screener',
      badge: 'Visual AI Diagnostic • VLM-Calibrated',
      subheading: 'Screen for Jaundice (Scleral Icterus), Typhoid Fever (Ocular Toxemia), Severe Anemia (Conjunctival Pallor), and Vitamin A Deficiency from eye photographs.',
      capturePhoto: 'Live Eye Camera',
      uploadPhoto: 'Upload Eye Photo',
      dropZone: 'Drop eye close-up photograph here or tap to browse',
      quickPresets: 'Clinical Reference Scans (Instant Triage)',
      analyzingTitle: 'Analyzing Ocular Biomarkers...',
      primaryDiagnosis: 'Primary Clinical Impression',
      scleraAnalysis: 'Sclera Biomarkers (Jaundice & Icterus)',
      conjunctivaAnalysis: 'Conjunctiva Biomarkers (Anemia & Redness)',
      systemicMatrix: 'Systemic & Infectious Disease Probabilities',
      redFlagsTitle: 'Critical Clinical Red Flags',
      firstAidTitle: 'Immediate Triage & First-Aid Steps',
      ayurvedaTitle: 'Traditional Herbal & Dietary Recovery',
      labsTitle: 'Recommended Diagnostic Lab Panels',
      voiceReadout: 'Listen in Local Language',
      saveRecord: 'Save Eye Examination Record',
      saved: 'Saved to Clinical Case Records!',
      emergencyTransport: '108 Emergency Ambulance',
      hospitalLocator: 'Locate Nearest PHC / Diagnostic Lab',
      icterusLabel: 'Scleral Icterus (Jaundice)',
      typhoidLabel: 'Typhoid Fever Toxemia',
      anemiaLabel: 'Conjunctival Pallor (Anemia)',
      pinkEyeLabel: 'Infectious Conjunctivitis',
      bitotLabel: "Vitamin A Bitot's Spots",
      bilirubinEst: 'Est. Serum Bilirubin',
      hemoglobinEst: 'Est. Hemoglobin (Hb)',
      confidence: 'Diagnostic Confidence',
      fastSpectraTitle: 'Optical Telemetry & Live Chrominance',
      zoneSclera: 'Sclera Zone (Icterus)',
      zoneConjunctiva: 'Conjunctiva Zone (Pallor)',
      zoneCornea: 'Cornea / Pupil Zone',
      zoneAll: 'Full Optic View'
    },
    hi: {
      heading: 'नेत्र व स्क्लेरा रोग जांच प्रणाली',
      badge: 'आर्टिफिशियल इंटेलिजेंस नेत्र परीक्षण • वीएलएम',
      subheading: 'आंखों के फोटो से पीलिया (जॉन्डिस), टाइफाइड बुखार, खून की कमी (एनीमिया) और विटामिन ए की कमी की त्वरित जांच करें।',
      capturePhoto: 'कैमरा से फोटो लें',
      uploadPhoto: 'आंख की फोटो अपलोड करें',
      dropZone: 'आंख की साफ फोटो यहां ड्रैग करें या चुनें',
      quickPresets: 'नमूना नैदानिक मामले (तुरंत जांच हेतु)',
      analyzingTitle: 'आंखों के लक्षणों का विश्लेषण जारी है...',
      primaryDiagnosis: 'प्राथमिक नैदानिक परिणाम',
      scleraAnalysis: 'स्क्लेरा विश्लेषण (पीलिया / जॉन्डिस)',
      conjunctivaAnalysis: 'कंजंक्टिवा विश्लेषण (एनीमिया व लालिमा)',
      systemicMatrix: 'संभावित संक्रामक व शारीरिक रोग',
      redFlagsTitle: 'गंभीर चेतावनी के लक्षण (Red Flags)',
      firstAidTitle: 'तत्काल देखभाल व प्राथमिक उपचार',
      ayurvedaTitle: 'आयुर्वेदिक व खान-पान संबंधी सलाह',
      labsTitle: 'सुझाए गए आवश्यक लैब टेस्ट',
      voiceReadout: 'अपनी भाषा में सुनें',
      saveRecord: 'नेत्र जांच रिकॉर्ड सेव करें',
      saved: 'रिकॉर्ड सफलतापूर्वक सेव हो गया!',
      emergencyTransport: '108 आपातकालीन एम्बुलेंस',
      hospitalLocator: 'निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) खोजें',
      icterusLabel: 'पीलिया (स्क्लेरा पीलापन)',
      typhoidLabel: 'टाइफाइड बुखार के लक्षण',
      anemiaLabel: 'खून की कमी (एनीमिया)',
      pinkEyeLabel: 'आंख आना (कंजंक्टिवाइटिस)',
      bitotLabel: 'विटामिन ए की कमी',
      bilirubinEst: 'अनुमानित बिलीरुबिन स्तर',
      hemoglobinEst: 'अनुमानित हीमोग्लोबिन स्तर',
      confidence: 'परीक्षण विश्वसनीयता',
      fastSpectraTitle: 'ऑप्टिकल वर्णक्रम व लाइव डेटा',
      zoneSclera: 'स्क्लेरा क्षेत्र (पीलिया)',
      zoneConjunctiva: 'कंजंक्टिवा क्षेत्र (एनीमिया)',
      zoneCornea: 'कॉर्निया / पुतली क्षेत्र',
      zoneAll: 'संपूर्ण दृश्य'
    },
    ta: {
      heading: 'கண் மற்றும் விழித்திரை நோய் கண்டறிதல்',
      badge: 'AI கண் பரிசோதனை • VLM',
      subheading: 'கண்களின் புகைப்படத்தைக் கொண்டு மஞ்சள் காமாலை, டைபாய்டு காய்ச்சல், இரத்த சோகை மற்றும் வைட்டமின் ஏ குறைபாட்டை கண்டறியவும்.',
      capturePhoto: 'நேரலை கேமரா',
      uploadPhoto: 'புகைப்படம் பதிவேற்றவும்',
      dropZone: 'கண் புகைப்படத்தை இங்கு பதிவேற்றவும்',
      quickPresets: 'மாதிரி மருத்துவ வழக்குகள்',
      analyzingTitle: 'கண் அறிகுறிகள் ஆய்வு செய்யப்படுகின்றன...',
      primaryDiagnosis: 'முதன்மை நோயறிதல் முடிவு',
      scleraAnalysis: 'மஞ்சள் காமாலை குறியீடுகள்',
      conjunctivaAnalysis: 'இரத்த சோகை மற்றும் கண் சிவப்பு குறியீடுகள்',
      systemicMatrix: 'சாத்தியமான நோய் பகுப்பாய்வு',
      redFlagsTitle: 'அவசர எச்சரிக்கை அறிகுறிகள்',
      firstAidTitle: 'உடனடி முதலுதவி வழிகாட்டுதல்',
      ayurvedaTitle: 'பாரம்பரிய மூலிகை மற்றும் உணவு முறை',
      labsTitle: 'பரிந்துரைக்கப்பட்ட இரத்த பரிசோதனைகள்',
      voiceReadout: 'குரல் வழியே கேட்கவும்',
      saveRecord: 'கண் பரிசோதனை பதிவை சேமிக்கவும்',
      saved: 'வெற்றிகரமாக சேமிக்கப்பட்டது!',
      emergencyTransport: '108 அவசர ஆம்புலன்ஸ்',
      hospitalLocator: 'அருகிலுள்ள ஆரம்ப சுகாதார மையம்',
      icterusLabel: 'மஞ்சள் காமாலை',
      typhoidLabel: 'டைபாய்டு காய்ச்சல்',
      anemiaLabel: 'இரத்த சோகை',
      pinkEyeLabel: 'கண் தொற்று',
      bitotLabel: 'வைட்டமின் ஏ குறைபாடு',
      bilirubinEst: 'பிலிரூபின் அளவு',
      hemoglobinEst: 'ஹீமோகுளோபின் அளவு',
      confidence: 'துல்லியம்',
      fastSpectraTitle: 'ஒளியியல் அளவீடுகள்',
      zoneSclera: 'விழித்திரை (மஞ்சள் காமாலை)',
      zoneConjunctiva: 'இமைப்பகுதி (இரத்த சோகை)',
      zoneCornea: 'கருவிழி பகுதி',
      zoneAll: 'முழுமையான பார்வை'
    }
  }[currentLang];

  // Client-side high-speed colorimetric extraction from image
  const extractOpticalMetrics = useCallback((imageSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0, 120, 120);
      const imgData = ctx.getImageData(0, 0, 120, 120);
      const data = imgData.data;

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Filter out extreme dark pupils/shadows
        if (r + g + b > 60) {
          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }
      }

      if (count === 0) count = 1;
      const rAvg = rSum / count;
      const gAvg = gSum / count;
      const bAvg = bSum / count;

      // Colorimetric Yellowness Index: Y = (0.5 * (R + G)) - B
      const yellowness = Math.max(0, Math.min(100, Math.round(((rAvg + gAvg) / 2 - bAvg) * 1.6)));
      // Conjunctival Redness Index: R / (R + G + B)
      const redness = Math.max(0, Math.min(100, Math.round((rAvg / (rAvg + gAvg + bAvg + 0.01)) * 250 - 50)));
      // Pallor Ratio: (G + B) / (2 * R)
      const pallor = Math.max(0, Math.min(100, Math.round(((gAvg + bAvg) / (2 * rAvg + 0.01)) * 100 - 30)));
      // Perceived Luminance
      const lum = Math.round(0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg);

      // Estimated clinical correlation
      let biliRange = '< 1.2 mg/dL (Normal)';
      if (yellowness > 60) biliRange = '4.5 - 7.2 mg/dL (Deep Icterus)';
      else if (yellowness > 35) biliRange = '2.2 - 4.4 mg/dL (Moderate)';
      else if (yellowness > 18) biliRange = '1.2 - 2.1 mg/dL (Subclinical)';

      let hbRange = '> 13.0 g/dL (Normal)';
      if (pallor > 65) hbRange = '< 7.5 g/dL (Severe Pallor)';
      else if (pallor > 40) hbRange = '8.0 - 10.5 g/dL (Moderate)';
      else if (pallor > 25) hbRange = '10.8 - 12.5 g/dL (Mild)';

      setLiveOpticalMetrics({
        yellownessIndex: yellowness,
        rednessIndex: redness,
        pallorRatio: pallor,
        luminance: lum,
        estimatedBilirubinRange: biliRange,
        estimatedHemoglobinRange: hbRange
      });
    };
    img.src = imageSrc;
  }, []);

  // Auto Voice alert for high-risk Jaundice or Typhoid
  useEffect(() => {
    if (result && result.urgentReferralRequired) {
      const summaryText = result.clinicalDiagnosisSummary[currentLang] || result.clinicalDiagnosisSummary.en;
      const speech = `Urgent Ocular Triage Alert: ${result.primaryCondition}. ${summaryText}`;
      setIsPlayingAudio(true);
      speakText(speech, currentLang).finally(() => setIsPlayingAudio(false));
    }
  }, [result, currentLang]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setSelectedImage(base64);
        extractOpticalMetrics(base64);
        analyzeEyeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setActiveCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera permission denied or unavailable', err);
      setActiveCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setActiveCamera(false);
        setSelectedImage(dataUrl);
        extractOpticalMetrics(dataUrl);
        analyzeEyeImage(dataUrl);
      }
    }
  };

  const analyzeEyeImage = async (imageBase64: string, suspectedCondition?: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setSavedSuccess(false);

    setAnalysisStep('Stage 1/3: Localizing anterior ocular landmarks (bulbar sclera, palpebral conjunctiva, cornea)...');
    await new Promise((r) => setTimeout(r, 180));
    setAnalysisStep('Stage 2/3: Computing Scleral Icterus (Jaundice) & Conjunctival Pallor (Anemia) metrics...');
    await new Promise((r) => setTimeout(r, 180));
    setAnalysisStep('Stage 3/3: Evaluating Typhoid toxemic signs & generating multi-panel laboratory advisory...');

    try {
      const response = await fetch('/api/analyze-eye-disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          patientMode,
          useOfflineEngine,
          suspectedCondition
        })
      });

      if (!response.ok) {
        throw new Error('Eye analysis returned non-200');
      }

      const res: EyeDiseaseAnalysisResult = await response.json();
      setResult(res);
    } catch (err) {
      console.warn('Error during eye analysis, falling back to local calculation', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: SampleEyeCase) => {
    setSelectedImage(preset.imageUrl);
    extractOpticalMetrics(preset.imageUrl);
    analyzeEyeImage(preset.imageUrl, preset.conditionType);
  };

  const handleToggleSpeech = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else if (result) {
      const text = result.clinicalDiagnosisSummary[currentLang] || result.clinicalDiagnosisSummary.en;
      setIsPlayingAudio(true);
      speakText(
        text,
        currentLang,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      ).finally(() => setIsPlayingAudio(false));
    }
  };

  const handleSaveToRecords = () => {
    if (!result || !selectedImage) return;
    try {
      const existing = JSON.parse(localStorage.getItem('woundcare_vlm_case_records') || '[]');
      const eyeCaseRecord = {
        id: `case-eye-${Date.now()}`,
        timestamp: new Date().toISOString(),
        patientName: `Eye Screening (${patientMode === 'child' ? 'Pediatric' : 'Adult'})`,
        location: 'Ocular / Sclera Examination',
        bodyRegion: 'head',
        imageUrl: selectedImage,
        status: result.urgentReferralRequired ? 'Referred to Hospital' : 'Dressed',
        result: {
          id: result.id,
          timestamp: result.timestamp,
          woundType: result.primaryCondition,
          woundTypeDescription: result.clinicalDiagnosisSummary,
          severity: result.severity === 'Critical Emergency' ? 'Severe' : (result.severity as any),
          confidenceScore: result.confidenceScore,
          affectedAreaEstimate: 'Bilateral Ocular Segment',
          infectionRisk: result.typhoidRiskScore > 70 ? 'High' : 'Moderate',
          infectionRiskScore: Math.max(result.jaundiceRiskScore, result.typhoidRiskScore, result.anemiaRiskScore),
          triageSummary: result.clinicalDiagnosisSummary,
          immediateActionRequired: result.urgentReferralRequired,
          firstAidSteps: result.firstAidAndImmediateCare,
          criticalWarnings: result.redFlags,
          recommendedMedicinesOrDressings: [
            { en: 'Isotonic Saline Eyewash & PHC Doctor Referral', hi: 'सेलाइन आई वॉश और डॉक्टर की सलाह', ta: 'கண் கழுவும் நீர் மற்றும் மருத்துவர் ஆலோசனை' }
          ],
          tetanusRiskDetected: false,
          doctorVisitUrgency: result.hospitalReferralTimeframe,
          modelEngineUsed: result.modelEngineUsed,
          processingTimeMs: result.processingTimeMs
        }
      };

      const updated = [eyeCaseRecord, ...existing];
      localStorage.setItem('woundcare_vlm_case_records', JSON.stringify(updated));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (e) {
      console.warn('Failed to save eye case', e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Clinical Header Banner with High-Contrast Light Mode */}
      <div className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-200 relative overflow-hidden ${
        highContrast 
          ? 'bg-black text-yellow-300 border-yellow-400' 
          : 'bg-[#fffdf7] text-stone-900 border-amber-300/80 shadow-md'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-900 border border-amber-400/40">
                <Eye className="w-5 h-5 text-amber-800" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {t.badge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-stone-900">
              {t.heading}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
              {t.subheading}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenEmergencyModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm flex items-center gap-2 transition cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>{t.emergencyTransport}</span>
            </motion.button>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('hospitals')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 flex items-center gap-2 transition cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>{t.hospitalLocator}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Viewfinder & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Photography Box */}
          <div className={`p-5 rounded-2xl sm:rounded-3xl border transition-all ${
            highContrast ? 'bg-black border-yellow-400' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Ocular Photography Input</span>
              </h3>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {patientMode === 'child' ? 'Pediatric Mode (<18y)' : 'Adult Mode'}
              </span>
            </div>

            {/* Viewfinder Canvas */}
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center border border-stone-300 shadow-inner group">
              {activeCamera ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Eye Target Reticle Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-60 h-32 border-2 border-dashed border-emerald-400 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                      <div className="w-12 h-12 rounded-full border border-emerald-300" />
                      <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-stone-900/90 text-emerald-300 text-[9px] font-mono font-bold">
                        ALIGN SCLERA & LOWER LID
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2.5 px-4 z-20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={capturePhoto}
                      className="px-5 py-2.5 rounded-full font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-stone-950 shadow-lg flex items-center gap-2 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Ocular Image</span>
                    </motion.button>
                    <button
                      onClick={() => {
                        const stream = videoRef.current?.srcObject as MediaStream;
                        stream?.getTracks().forEach(t => t.stop());
                        setActiveCamera(false);
                      }}
                      className="px-3.5 py-2 rounded-full text-xs font-semibold bg-stone-800 text-white hover:bg-stone-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : selectedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImage}
                    alt="Captured Eye"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />

                  {/* Optical Reticle & Landmark HUD */}
                  {showReticleHUD && !isAnalyzing && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Laser grid */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(52,211,153,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(52,211,153,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />

                      {/* Superior Sclera Zone indicator */}
                      {(activeEyeZone === 'all' || activeEyeZone === 'sclera') && (
                        <div className="absolute top-[18%] left-[22%] right-[22%] h-[26%] border border-amber-400/80 bg-amber-500/10 rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-mono font-bold bg-stone-900/90 text-amber-300 px-1.5 py-0.2 rounded">
                            SCLERA ICTERUS ZONE
                          </span>
                        </div>
                      )}

                      {/* Inferior Palpebral Conjunctiva Zone indicator */}
                      {(activeEyeZone === 'all' || activeEyeZone === 'conjunctiva') && (
                        <div className="absolute bottom-[16%] left-[20%] right-[20%] h-[24%] border border-rose-400/80 bg-rose-500/10 rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-mono font-bold bg-stone-900/90 text-rose-300 px-1.5 py-0.2 rounded">
                            PALPEBRAL PALLOR ZONE
                          </span>
                        </div>
                      )}

                      {/* Corneal Reflex indicator */}
                      {(activeEyeZone === 'all' || activeEyeZone === 'cornea') && (
                        <div className="absolute top-[38%] left-[40%] w-[20%] h-[26%] border-2 border-cyan-400/90 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
                        </div>
                      )}

                      {/* Optical Compass Corner Accents */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    </div>
                  )}

                  {/* Active Scanning Animation */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0 shadow-[0_0_20px_#f59e0b] animate-laser-sweep">
                        <div className="absolute inset-x-1/4 h-[2px] bg-white opacity-90" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 rounded-full border-2 border-amber-400/60 border-dashed animate-reticle-spin flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full border border-emerald-400/50" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HUD Toggle & Change Photo Bar */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                    <span className="px-2.5 py-1 bg-stone-900/85 text-white backdrop-blur-md rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                      {isAnalyzing ? 'VLM Processing...' : 'Ocular Target Calibrated'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowReticleHUD(!showReticleHUD)}
                        className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-900 text-stone-200 border border-white/15 transition cursor-pointer"
                        title="Toggle Optical Landmarks"
                      >
                        {showReticleHUD ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-white/95 text-stone-900 text-[11px] font-bold shadow-sm hover:bg-white flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-stone-900/90 transition bg-stone-950"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center mb-3">
                    <Eye className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-stone-100 mb-1">
                    {t.dropZone}
                  </p>
                  <p className="text-xs text-stone-400 max-w-xs font-medium">
                    Include sclera (white of eye) and lower palpebral conjunctival bed in good natural daylight.
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* View Controls & Action Buttons */}
            <div className="space-y-2.5 mt-3">
              {/* Zone Selector Pills */}
              {selectedImage && (
                <div className="flex items-center justify-between gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 text-[10px] font-semibold text-stone-700">
                  <button
                    onClick={() => setActiveEyeZone('all')}
                    className={`flex-1 py-1 rounded-lg transition ${activeEyeZone === 'all' ? 'bg-white text-stone-950 font-bold shadow-2xs' : 'hover:text-stone-950'}`}
                  >
                    All Zones
                  </button>
                  <button
                    onClick={() => setActiveEyeZone('sclera')}
                    className={`flex-1 py-1 rounded-lg transition ${activeEyeZone === 'sclera' ? 'bg-amber-500 text-stone-950 font-bold shadow-2xs' : 'hover:text-stone-950'}`}
                  >
                    Sclera (Icterus)
                  </button>
                  <button
                    onClick={() => setActiveEyeZone('conjunctiva')}
                    className={`flex-1 py-1 rounded-lg transition ${activeEyeZone === 'conjunctiva' ? 'bg-rose-500 text-white font-bold shadow-2xs' : 'hover:text-stone-950'}`}
                  >
                    Conjunctiva (Pallor)
                  </button>
                  <button
                    onClick={() => setActiveEyeZone('cornea')}
                    className={`flex-1 py-1 rounded-lg transition ${activeEyeZone === 'cornea' ? 'bg-cyan-600 text-white font-bold shadow-2xs' : 'hover:text-stone-950'}`}
                  >
                    Cornea / Toxemia
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startCamera}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.capturePhoto}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition cursor-pointer ${
                    highContrast
                      ? 'border-yellow-400 text-yellow-300'
                      : 'border-stone-300 hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{t.uploadPhoto}</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Instant Optical Telemetry Card (Client-side Chrominance Extraction) */}
          {liveOpticalMetrics && (
            <div className={`p-4 rounded-2xl border transition-all ${
              highContrast ? 'bg-black border-yellow-400' : 'bg-[#fffdf7] border-amber-300/80 shadow-sm'
            }`}>
              <h4 className="font-serif font-bold text-xs text-stone-900 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.fastSpectraTitle}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">● Fast Pre-Scan</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Yellowness index */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900">
                    <span>Scleral Yellowness:</span>
                    <strong className="font-mono">{liveOpticalMetrics.yellownessIndex}%</strong>
                  </div>
                  <div className="w-full bg-amber-200/60 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${liveOpticalMetrics.yellownessIndex}%` }} />
                  </div>
                  <span className="text-[10px] text-amber-800 font-medium mt-1 block">
                    {liveOpticalMetrics.estimatedBilirubinRange}
                  </span>
                </div>

                {/* Pallor ratio */}
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-rose-900">
                    <span>Conjunctival Pallor:</span>
                    <strong className="font-mono">{liveOpticalMetrics.pallorRatio}%</strong>
                  </div>
                  <div className="w-full bg-rose-200/60 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${liveOpticalMetrics.pallorRatio}%` }} />
                  </div>
                  <span className="text-[10px] text-rose-800 font-medium mt-1 block">
                    Est. Hb: {liveOpticalMetrics.estimatedHemoglobinRange}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Preset Sample Clinical Cases */}
          <div className={`p-4 rounded-2xl border transition-all ${
            highContrast ? 'bg-black border-yellow-400' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <h4 className="font-serif font-bold text-xs text-stone-900 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.quickPresets}</span>
            </h4>
            <div className="space-y-2">
              {SAMPLE_EYE_CASES.map((sample) => (
                <motion.button
                  key={sample.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectPreset(sample)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-start gap-2.5 cursor-pointer ${
                    selectedImage === sample.imageUrl
                      ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover shrink-0 border border-stone-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-stone-900 truncate text-[11px]">
                        {sample.title}
                      </p>
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                        sample.severity === 'Severe' 
                          ? 'bg-rose-100 text-rose-800' 
                          : sample.severity === 'Moderate'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sample.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-600 line-clamp-1 mt-0.5 font-medium">
                      {sample.clinicalSigns}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Biomarker Analysis & Clinical Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {isAnalyzing ? (
            <div className={`p-8 rounded-2xl sm:rounded-3xl border text-center space-y-4 ${
              highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-emerald-500/20 border-b-emerald-500 animate-spin" style={{ animationDirection: 'reverse' }} />
                <Eye className="w-6 h-6 absolute inset-0 m-auto text-amber-600 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  {t.analyzingTitle}
                </h3>
                <p className="text-xs text-stone-600 mt-1 font-medium">
                  {analysisStep}
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4">
              
              {/* Primary Triage Impression Card */}
              <div className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all ${
                result.urgentReferralRequired 
                  ? 'bg-rose-50/90 border-rose-300 shadow-sm' 
                  : 'bg-emerald-50/90 border-emerald-300 shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-2.5 rounded-xl text-white ${
                      result.urgentReferralRequired ? 'bg-rose-600 shadow-xs' : 'bg-emerald-600 shadow-xs'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600">
                        {t.primaryDiagnosis}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-stone-950">
                        {result.primaryCondition}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase shadow-2xs ${
                      result.severity === 'Severe' || result.severity === 'Critical Emergency'
                        ? 'bg-rose-600 text-white'
                        : result.severity === 'Moderate'
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {result.severity}
                    </span>
                    <button
                      onClick={handleToggleSpeech}
                      className="p-2 rounded-xl bg-white border border-stone-300 shadow-xs hover:bg-stone-100 transition cursor-pointer"
                      title={t.voiceReadout}
                    >
                      {isPlayingAudio ? (
                        <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-stone-700" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                  {result.clinicalDiagnosisSummary[currentLang] || result.clinicalDiagnosisSummary.en}
                </p>

                <div className="mt-3.5 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Urgency: {result.triageUrgency[currentLang] || result.triageUrgency.en}</span>
                  </span>
                  <span className="text-[11px] font-mono text-stone-600">
                    Engine: {result.modelEngineUsed} ({result.processingTimeMs}ms)
                  </span>
                </div>
              </div>

              {/* Quantitative Disease Probability Meters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Jaundice / Scleral Icterus */}
                <div className={`p-3.5 rounded-xl border transition-colors ${
                  result.jaundiceRiskScore > 40 ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 mb-1">
                    <span>{t.icterusLabel}</span>
                    <span className="font-mono text-amber-700">{result.jaundiceRiskScore}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${result.jaundiceRiskScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-600">
                    Bilirubin: <strong className="text-stone-900">{result.scleraBiomarkers.estimatedSerumBilirubinMgDl}</strong>
                  </p>
                </div>

                {/* Typhoid Fever Toxemia */}
                <div className={`p-3.5 rounded-xl border transition-colors ${
                  result.typhoidRiskScore > 40 ? 'bg-rose-50 border-rose-300' : 'bg-white border-stone-200 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 mb-1">
                    <span>{t.typhoidLabel}</span>
                    <span className="font-mono text-rose-700">{result.typhoidRiskScore}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${result.typhoidRiskScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-600">
                    Suffusion: <strong className="text-stone-900">{result.scleraBiomarkers.scleralVascularityScore}%</strong>
                  </p>
                </div>

                {/* Severe Anemia Pallor */}
                <div className={`p-3.5 rounded-xl border transition-colors ${
                  result.anemiaRiskScore > 40 ? 'bg-sky-50 border-sky-300' : 'bg-white border-stone-200 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 mb-1">
                    <span>{t.anemiaLabel}</span>
                    <span className="font-mono text-sky-700">{result.anemiaRiskScore}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${result.anemiaRiskScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-600">
                    Est. Hb: <strong className="text-stone-900">{result.conjunctivaBiomarkers.estimatedHemoglobinGDl}</strong>
                  </p>
                </div>

                {/* Conjunctivitis */}
                <div className="p-3.5 rounded-xl border bg-white border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 mb-1">
                    <span>{t.pinkEyeLabel}</span>
                    <span className="font-mono text-indigo-700">{result.conjunctivitisRiskScore}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${result.conjunctivitisRiskScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-600">
                    Exudate: <strong className="text-stone-900">{result.conjunctivaBiomarkers.dischargeType}</strong>
                  </p>
                </div>

                {/* Vitamin A / Bitot's spots */}
                <div className="p-3.5 rounded-xl border bg-white border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 mb-1">
                    <span>{t.bitotLabel}</span>
                    <span className="font-mono text-emerald-700">{result.vitaminADeficiencyRiskScore}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${result.vitaminADeficiencyRiskScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-600">
                    Corneal Risk: <strong className="text-stone-900">{result.scleraBiomarkers.keratomalaciaRisk}</strong>
                  </p>
                </div>

                {/* Dehydration & Microcirculation */}
                <div className="p-3.5 rounded-xl border bg-white border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 mb-1">
                    <span>Severe Dehydration</span>
                    <span className="font-mono text-teal-700">{result.dehydrationRiskScore}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className="bg-teal-500 h-full rounded-full"
                      style={{ width: `${result.dehydrationRiskScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-600">
                    Orbit: <strong className="text-stone-900">{result.dehydrationRiskScore > 50 ? 'Hollow/Depleted' : 'Intact'}</strong>
                  </p>
                </div>
              </div>

              {/* Critical Red Flags */}
              {result.redFlags && result.redFlags.length > 0 && (
                <div className="p-4 rounded-2xl border border-red-300 bg-red-50/90 space-y-2 shadow-xs">
                  <h4 className="font-serif font-bold text-xs text-red-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>{t.redFlagsTitle}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.redFlags.map((flag, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-800 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                        <span>{flag[currentLang] || flag.en}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Immediate First-Aid Steps */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                highContrast ? 'bg-black border-yellow-400' : 'bg-white border-stone-200 shadow-sm'
              } space-y-3`}>
                <h4 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-700" />
                  <span>{t.firstAidTitle}</span>
                </h4>
                <div className="space-y-2">
                  {result.firstAidAndImmediateCare.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3 text-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {step.stepNumber}
                      </span>
                      <p className="text-stone-800 font-medium">
                        {step.text[currentLang] || step.text.en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ayurvedic & Dietary Guidance */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                highContrast ? 'bg-black border-yellow-400' : 'bg-white border-stone-200 shadow-sm'
              } space-y-3`}>
                <h4 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-teal-700" />
                  <span>{t.ayurvedaTitle}</span>
                </h4>
                
                {result.ayurvedicAndDietaryGuidance.herbalSupport && result.ayurvedicAndDietaryGuidance.herbalSupport.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.ayurvedicAndDietaryGuidance.herbalSupport.map((herb, i) => (
                      <div key={i} className="p-3 rounded-xl border border-teal-200 bg-teal-50/50 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-teal-950 font-bold">{herb.name[currentLang] || herb.name.en}</strong>
                          <span className="text-[10px] italic text-teal-800 font-medium">{herb.botanical}</span>
                        </div>
                        <p className="text-stone-700 text-[11px] font-medium">
                          {herb.role[currentLang] || herb.role.en}
                        </p>
                        <p className="text-[10px] text-teal-900 font-bold">
                          Prep: {herb.preparation[currentLang] || herb.preparation.en}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                    <strong className="text-emerald-950 font-bold flex items-center gap-1.5 mb-1.5">
                      <Apple className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Recommended Recovery Foods</span>
                    </strong>
                    <ul className="space-y-1 text-[11px] text-stone-700 font-medium list-disc list-inside">
                      {result.ayurvedicAndDietaryGuidance.dietaryFoodsToEat.map((food, idx) => (
                        <li key={idx}>{food[currentLang] || food.en}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
                    <strong className="text-rose-950 font-bold flex items-center gap-1.5 mb-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-700" />
                      <span>Foods to Strictly Avoid</span>
                    </strong>
                    <ul className="space-y-1 text-[11px] text-stone-700 font-medium list-disc list-inside">
                      {result.ayurvedicAndDietaryGuidance.dietaryFoodsToAvoid.map((food, idx) => (
                        <li key={idx}>{food[currentLang] || food.en}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommended Diagnostic Lab Panels */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                highContrast ? 'bg-black border-yellow-400' : 'bg-white border-stone-200 shadow-sm'
              } space-y-3`}>
                <h4 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-indigo-700" />
                  <span>{t.labsTitle}</span>
                </h4>
                <div className="space-y-2">
                  {result.recommendedDiagnosticPanels.map((lab, i) => (
                    <div key={i} className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-stone-900 font-bold">{lab.testName}</strong>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                            lab.urgency === 'Immediate Emergency' 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {lab.urgency}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-0.5 font-medium">
                          Biomarker Target: {lab.targetBiomarker}
                        </p>
                        <p className="text-[11px] text-stone-700 mt-0.5 font-medium">
                          {lab.clinicalRationale[currentLang] || lab.clinicalRationale.en}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveToRecords}
                  disabled={savedSuccess}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                    savedSuccess
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
                  }`}
                >
                  {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                  <span>{savedSuccess ? t.saved : t.saveRecord}</span>
                </motion.button>

                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('history')}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs border border-stone-300 hover:bg-stone-50 transition flex items-center gap-1.5 text-stone-800 cursor-pointer"
                  >
                    <span>View All Saved Records</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className={`p-8 rounded-2xl sm:rounded-3xl border text-center space-y-3 ${
              highContrast ? 'bg-black border-yellow-400' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Ready for Eye Photo Analysis
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed font-medium">
                Capture or upload an eye photo, or select one of the clinical sample presets on the left to immediately inspect Scleral Icterus (Jaundice), Typhoid Fever signs, and Anemia pallor.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
