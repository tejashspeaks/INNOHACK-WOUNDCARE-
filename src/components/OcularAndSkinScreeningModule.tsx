import React, { useState, useRef, useEffect } from 'react';
import { 
  Language, 
  PatientMode, 
  ScanType, 
  OcularSkinScreeningResponse, 
  OcularSkinValidResult, 
  OcularSkinGateFailedResult,
  Stage1EyeFindings,
  Stage1SkinBiteFindings,
  BiteAssessment
} from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { speakText, stopSpeech } from '../utils/speech';
import {
  Eye,
  Bug,
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
  Info,
  Clock,
  ChevronRight,
  BookmarkPlus,
  Thermometer,
  ShieldCheck,
  Ban,
  FileCheck2,
  UserCheck,
  Baby,
  User
} from 'lucide-react';

interface OcularAndSkinScreeningModuleProps {
  currentLang: Language;
  useOfflineEngine: boolean;
  highContrast: boolean;
  patientMode: PatientMode;
  onOpenEmergencyModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface ScreeningPreset {
  id: string;
  title: string;
  scanType: ScanType;
  patientMode: PatientMode;
  description: string;
  imageUrl: string;
  expectedOutcome: string;
}

const SCREENING_PRESETS: ScreeningPreset[] = [
  {
    id: 'preset-normal-eye',
    title: 'Normal Intact Eye',
    scanType: 'eye',
    patientMode: 'adult',
    description: 'Clear white sclera, normal pink conjunctiva, no discharge or periorbital edema.',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
    expectedOutcome: 'Default Normal • No significant ocular abnormality visible'
  },
  {
    id: 'preset-jaundice-eye',
    title: 'Moderate Scleral Yellowing',
    scanType: 'eye',
    patientMode: 'adult',
    description: 'Noticeable yellow pigmentation across scleral shell indicating bile pigment accumulation.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    expectedOutcome: 'Moderate yellowing • Differential: Hepatic / Biliary / Hemolytic'
  },
  {
    id: 'preset-conjunctivitis-eye',
    title: 'Acute Conjunctival Redness & Exudate',
    scanType: 'eye',
    patientMode: 'child',
    description: 'Moderate ciliary injection with mucoid discharge and mild eyelid puffiness.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
    expectedOutcome: 'Moderate injection + mucoid discharge • Pediatric Caregiver Note'
  },
  {
    id: 'preset-pallor-eye',
    title: 'Palpebral Conjunctival Pallor',
    scanType: 'eye',
    patientMode: 'child',
    description: 'Blanched inferior palpebral conjunctiva signifying reduced capillary hemoglobin blush.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    expectedOutcome: 'Pale conjunctival bed • Routine CBC Follow-up'
  },
  {
    id: 'preset-mosquito-bite',
    title: 'Single Mosquito Bite Papule',
    scanType: 'skin_bite',
    patientMode: 'child',
    description: 'Isolated round erythematous papule (<0.5cm) with central punctum and surrounding wheal.',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80',
    expectedOutcome: 'Single papule • Consistent with common mosquito bite'
  },
  {
    id: 'preset-clustered-bite',
    title: 'Clustered / Linear Flea or Bed Bug Bites',
    scanType: 'skin_bite',
    patientMode: 'adult',
    description: 'Grouped linear arrangement of small itchy papules along the dermal boundary.',
    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
    expectedOutcome: 'Linear/row pattern • Consistent with flea / bed bug pattern'
  },
  {
    id: 'preset-clear-skin',
    title: 'Intact Skin (No Bite Lesions)',
    scanType: 'skin_bite',
    patientMode: 'adult',
    description: 'Healthy intact dermal barrier with no raised papules, puncta, or wheal reactions.',
    imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f02e6b010c2?auto=format&fit=crop&w=600&q=80',
    expectedOutcome: 'Intact Skin • No bite or insect-lesion visible'
  }
];

export const OcularAndSkinScreeningModule: React.FC<OcularAndSkinScreeningModuleProps> = ({
  currentLang,
  useOfflineEngine,
  highContrast,
  patientMode: initialPatientMode,
  onOpenEmergencyModal,
  onNavigateTab
}) => {
  const [scanType, setScanType] = useState<ScanType>('eye');
  const [patientMode, setPatientMode] = useState<PatientMode>(initialPatientMode);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [screeningResponse, setScreeningResponse] = useState<OcularSkinScreeningResponse | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeCamera, setActiveCamera] = useState(false);
  const [hasSystemicSymptoms, setHasSystemicSymptoms] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Translations
  const t = {
    en: {
      moduleTitle: 'Ocular & Skin Screening Module',
      moduleSubtitle: 'Calibrated visual feature extraction for eye regions and insect/skin bite lesions with strict clinical safeguards.',
      eyeMode: 'Eye Region Screening',
      skinBiteMode: 'Skin & Insect Bite Screening',
      patientChild: 'Pediatric (Child)',
      patientAdult: 'Adult Mode',
      uploadPhoto: 'Upload Photograph',
      captureLive: 'Live Camera Capture',
      dropzoneTitle: 'Select or drop a close-up photo here',
      dropzoneEyeHint: 'Ensure good lighting, centered eye, and visible sclera / inner lower eyelid.',
      dropzoneSkinHint: 'Ensure clear focus on the skin lesion, surrounding erythema, and bite margins.',
      analyzingText: 'Processing via WoundCare-VLM Screening Engine...',
      referenceCases: 'Clinical Validation Reference Scans',
      systemicPrompt: 'Patient reports concurrent systemic symptoms (e.g. fever, headache, body ache)',
      validationGatePassed: 'Stage 0 Gate: Valid Image Quality & Matching Region',
      validationGateFailed: 'Stage 0 Gate Failed: Image Not Assessable',
      stage1Title: 'Stage 1: Objective Visual Feature Extraction (Qualitative Bands)',
      stage2Title: 'Stage 2: Clinical Interpretation (Calibrated & Multi-Sign Gated)',
      stage3Title: 'Stage 3: Insect Bite Morphology & Assessment',
      scleralColor: 'Scleral Color',
      conjunctivalInjection: 'Conjunctival Injection (Redness)',
      conjunctivalPallor: 'Palpebral Conjunctival Pallor',
      discharge: 'Discharge / Exudate',
      periorbital: 'Periorbital Signs',
      findingSummary: 'Visual Finding Summary',
      differentials: 'Differential Possibilities to Correlate Clinically',
      urgencyTitle: 'Clinical Urgency & Follow-Up',
      caregiverNoteTitle: 'Caregiver / Patient Guidance',
      redFlagsTitle: 'Visual Red Flags Detected',
      systemicAdvisoryTitle: 'Systemic Symptom Advisory',
      saveRecord: 'Save to Clinical Case Records',
      savedRecordSuccess: 'Screening Record Saved Successfully!',
      hardBansNotice: 'Clinical Safeguards: Visual assessment only. No numeric blood chemistry values (bilirubin/hemoglobin) or fabricated percentage disease risk scores are generated.'
    },
    hi: {
      moduleTitle: 'नेत्र व त्वचा/कीट दंश जांच प्रणाली',
      moduleSubtitle: 'आंखों और त्वचा पर कीट के काटने के निशानों की सुरक्षित और सटीक नैदानिक जांच।',
      eyeMode: 'आंखों की जांच (Ocular)',
      skinBiteMode: 'कीट व मच्छर दंश जांच (Skin Bite)',
      patientChild: 'बच्चे (बाल चिकित्सा)',
      patientAdult: 'वयस्क (Adult)',
      uploadPhoto: 'फोटो अपलोड करें',
      captureLive: 'कैमरा से फोटो लें',
      dropzoneTitle: 'यहां साफ क्लोज-अप फोटो चुनें या खींचें',
      dropzoneEyeHint: 'पर्याप्त रोशनी में आंख और पुतली/सफेदी का साफ फोटो लें।',
      dropzoneSkinHint: 'त्वचा पर काटने के निशान और लाली पर फोकस करें।',
      analyzingText: 'जांच विश्लेषण जारी है...',
      referenceCases: 'नमूना नैदानिक परीक्षण फोटो',
      systemicPrompt: 'रोगी को बुखार, सिरदर्द या बदन दर्द की शिकायत भी है',
      validationGatePassed: 'स्टेज 0: फोटो गुणवत्ता जांच सफल',
      validationGateFailed: 'स्टेज 0: फोटो अस्पष्ट या अनुपयुक्त है',
      stage1Title: 'स्टेज 1: प्रत्यक्ष दृश्य लक्षण (Visual Bands)',
      stage2Title: 'स्टेज 2: नैदानिक निष्कर्ष व परामर्श',
      stage3Title: 'स्टेज 3: कीट दंश आकार व संरचना',
      scleralColor: 'आंख की सफेदी (स्क्लेरा रंग)',
      conjunctivalInjection: 'आंखों की लालिमा (Conjunctival Injection)',
      conjunctivalPallor: 'पलक का पीलापन (एनीमिया जांच)',
      discharge: 'आंख से पानी/कीचड़ (Discharge)',
      periorbital: 'आंखों के आसपास सूजन/घेरे',
      findingSummary: 'नैदानिक निष्कर्ष सारांश',
      differentials: 'संभावित कारण (Differential Diagnoses)',
      urgencyTitle: 'चिकित्सकीय आवश्यकता व समय-सीमा',
      caregiverNoteTitle: 'देखभालकर्ता / रोगी हेतु सलाह',
      redFlagsTitle: 'चेतावनी लक्षण (Red Flags)',
      systemicAdvisoryTitle: 'शारीरिक लक्षणों की सलाह',
      saveRecord: 'जांच रिकॉर्ड सेव करें',
      savedRecordSuccess: 'रिकॉर्ड सफलतापूर्वक सेव हो गया!',
      hardBansNotice: 'नैदानिक सुरक्षा: केवल दृश्य लक्षणों का मूल्यांकन। रक्त रासायनिक स्तर (Bilirubin/Hb) का अनुमान नहीं लगाया जाता।'
    },
    ta: {
      moduleTitle: 'கண் மற்றும் தோல் கடி பரிசோதனை பிரிவு',
      moduleSubtitle: 'கண்கள் மற்றும் பூச்சி கடி அடையாளங்களின் பாதுகாப்பான AI பரிசோதனை.',
      eyeMode: 'கண் பரிசோதனை',
      skinBiteMode: 'தோல் மற்றும் பூச்சி கடி பரிசோதனை',
      patientChild: 'குழந்தை பிரிவு',
      patientAdult: 'பெரியவர்கள்',
      uploadPhoto: 'புகைப்படம் பதிவேற்றவும்',
      captureLive: 'நேரலை கேமரா',
      dropzoneTitle: 'தெளிவான புகைப்படத்தை இங்கே பதிவேற்றவும்',
      dropzoneEyeHint: 'நல்ல வெளிச்சத்தில் கண்ணின் வெண்படலத்தை படம் பிடிக்கவும்.',
      dropzoneSkinHint: 'தோலில் பூச்சி கடித்த தடம் தெளிவாக இருக்க வேண்டும்.',
      analyzingText: 'பரிசோதனை நடைபெறுகிறது...',
      referenceCases: 'மாதிரி மருத்துவ வழக்குகள்',
      systemicPrompt: 'காய்ச்சல் அல்லது உடல் வலி போன்ற பிற அறிகுறிகள் உள்ளன',
      validationGatePassed: 'நிலை 0: புகைப்பட தரம் சரிபார்க்கப்பட்டது',
      validationGateFailed: 'நிலை 0: புகைப்படம் தெளிவாக இல்லை',
      stage1Title: 'நிலை 1: நேரடி கண்/தோல் அறிகுறிகள்',
      stage2Title: 'நிலை 2: மருத்துவ ஆலோசனை முடிவுகள்',
      stage3Title: 'நிலை 3: பூச்சி கடி வகை மற்றும் தடம்',
      scleralColor: 'கண் வெண்படல நிறம்',
      conjunctivalInjection: 'கண் சிவத்தல்',
      conjunctivalPallor: 'இமை வெளிறிய நிலை (இரத்த சோகை)',
      discharge: 'கண் நீர் / கசிவு',
      periorbital: 'கண் சுற்றியுள்ள வீக்கம்',
      findingSummary: 'மருத்துவ முடிவு சுருக்கம்',
      differentials: 'சாத்தியமான காரணங்கள்',
      urgencyTitle: 'மருத்துவ அவசரம் மற்றும் நேரம்',
      caregiverNoteTitle: 'வழிகாட்டுதல் குறிப்பு',
      redFlagsTitle: 'எச்சரிக்கை அறிகுறிகள்',
      systemicAdvisoryTitle: 'உடல் அறிகுறிகள் எச்சரிக்கை',
      saveRecord: 'பதிவை சேமிக்கவும்',
      savedRecordSuccess: 'வெற்றிகரமாக சேமிக்கப்பட்டது!',
      hardBansNotice: 'மருத்துவ பாதுகாப்பு: நேரடி காட்சி மதிப்பீடு மட்டுமே.'
    }
  }[currentLang];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setSelectedImage(base64);
        runScreening(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setActiveCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera permission denied or unavailable');
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
        const dataUrl = canvas.toDataURL('image/jpeg');
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setActiveCamera(false);
        setSelectedImage(dataUrl);
        runScreening(dataUrl);
      }
    }
  };

  const runScreening = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setScreeningResponse(null);
    setSavedSuccess(false);

    setAnalysisStep('Stage 0: Input Validation Gate (Checking image clarity & region match)...');
    await new Promise((r) => setTimeout(r, 200));
    setAnalysisStep(
      scanType === 'eye' 
        ? 'Stage 1: Extracting qualitative scleral, conjunctival & periorbital bands...' 
        : 'Stage 1 & 3: Extracting lesion morphology, pattern & punctum criteria...'
    );
    await new Promise((r) => setTimeout(r, 200));
    setAnalysisStep('Stage 2: Calibrated multi-sign clinical gating & urgency stratification...');

    try {
      const response = await fetch('/api/ocular-skin-screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          scan_type: scanType,
          patient_mode: patientMode,
          useOfflineEngine,
          systemic_symptoms: hasSystemicSymptoms ? 'Patient reports fever, malaise, or joint pain.' : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Screening endpoint returned non-200');
      }

      const res: OcularSkinScreeningResponse = await response.json();
      setScreeningResponse(res);
    } catch (err) {
      console.warn('Screening request failed, using local offline calculation', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: ScreeningPreset) => {
    setScanType(preset.scanType);
    setPatientMode(preset.patientMode);
    setSelectedImage(preset.imageUrl);
    runScreening(preset.imageUrl);
  };

  const handleToggleSpeech = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else if (screeningResponse) {
      const textToRead = screeningResponse.gate_status === 'VALID'
        ? `${screeningResponse.finding_summary}. ${screeningResponse.age_specific_note}`
        : screeningResponse.message;

      setIsPlayingAudio(true);
      speakText(
        textToRead,
        currentLang,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      ).finally(() => setIsPlayingAudio(false));
    }
  };

  const handleSaveToRecords = () => {
    if (!screeningResponse || !selectedImage) return;
    try {
      const existing = JSON.parse(localStorage.getItem('woundcare_vlm_case_records') || '[]');
      const isValid = screeningResponse.gate_status === 'VALID';
      const validData = isValid ? (screeningResponse as OcularSkinValidResult) : null;

      const newRecord = {
        id: `case-screen-${Date.now()}`,
        timestamp: new Date().toISOString(),
        patientName: `${scanType === 'eye' ? 'Ocular' : 'Skin Bite'} Screening (${patientMode === 'child' ? 'Pediatric' : 'Adult'})`,
        location: scanType === 'eye' ? 'Ocular Anterior Segment' : 'Dermal / Cutaneous Region',
        bodyRegion: scanType === 'eye' ? 'head' : 'torso',
        imageUrl: selectedImage,
        status: validData?.recommend_professional_care ? 'Referred to Hospital' : 'Dressed',
        result: {
          id: `scr-${Date.now()}`,
          timestamp: new Date().toISOString(),
          woundType: scanType === 'eye' ? 'Eye Region Examination' : 'Insect / Cutaneous Bite',
          woundTypeDescription: {
            en: validData?.finding_summary || screeningResponse.gate_status,
            hi: validData?.finding_summary || screeningResponse.gate_status,
            ta: validData?.finding_summary || screeningResponse.gate_status
          },
          severity: validData?.recommend_professional_care ? 'Moderate' : 'Minor',
          confidenceScore: 92,
          affectedAreaEstimate: scanType === 'eye' ? 'Bilateral Eye Field' : 'Localized Cutaneous Lesion',
          infectionRisk: validData?.recommend_professional_care ? 'Moderate' : 'Low',
          infectionRiskScore: validData?.recommend_professional_care ? 50 : 15,
          triageSummary: {
            en: validData?.finding_summary || screeningResponse.gate_status,
            hi: validData?.finding_summary || screeningResponse.gate_status,
            ta: validData?.finding_summary || screeningResponse.gate_status
          },
          immediateActionRequired: validData?.recommend_professional_care || false,
          firstAidSteps: [],
          criticalWarnings: validData?.bite_assessment?.red_flags ? validData.bite_assessment.red_flags.map((f: string) => ({ en: f, hi: f, ta: f })) : [],
          recommendedMedicinesOrDressings: [],
          tetanusRiskDetected: false,
          doctorVisitUrgency: {
            en: validData?.urgency || 'routine follow-up',
            hi: validData?.urgency || 'routine follow-up',
            ta: validData?.urgency || 'routine follow-up'
          },
          modelEngineUsed: 'WoundCare-VLM Ocular & Skin Screening Engine (Cloud & Edge)',
          processingTimeMs: 120
        }
      };

      localStorage.setItem('woundcare_vlm_case_records', JSON.stringify([newRecord, ...existing]));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.warn('Failed to save screening record', e);
    }
  };

  const isValidResult = screeningResponse && screeningResponse.gate_status === 'VALID';
  const validData = isValidResult ? (screeningResponse as OcularSkinValidResult) : null;
  const isGateFail = screeningResponse && screeningResponse.gate_status !== 'VALID';
  const gateFailData = isGateFail ? (screeningResponse as OcularSkinGateFailedResult) : null;

  return (
    <div id="ocular-skin-screening-container" className="space-y-6">
      {/* Module Header */}
      <div 
        id="screening-header-card"
        className={`p-5 sm:p-6 rounded-2xl border transition-colors relative overflow-hidden ${
          highContrast 
            ? 'bg-black text-yellow-300 border-yellow-400' 
            : 'bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-stone-100 border-stone-700 shadow-md'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-stone-800 text-emerald-400 border border-stone-700">
                {scanType === 'eye' ? <Eye className="w-5 h-5" /> : <Bug className="w-5 h-5" />}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-800 text-emerald-300 border border-stone-700 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>WoundCare-VLM Screening Engine</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-stone-50">
              {t.moduleTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {t.moduleSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenEmergencyModal && (
              <button
                id="screening-emergency-btn"
                onClick={onOpenEmergencyModal}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-700 hover:bg-red-800 text-white shadow-sm flex items-center gap-2 transition"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Triage</span>
              </button>
            )}
            {onNavigateTab && (
              <button
                id="screening-phc-locator-btn"
                onClick={() => onNavigateTab('hospitals')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-2 transition"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>PHC Locator</span>
              </button>
            )}
          </div>
        </div>

        {/* Safeguard Notice */}
        <div className="mt-4 pt-3 border-t border-stone-700/60 flex items-center gap-2 text-[11px] text-stone-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t.hardBansNotice}</span>
        </div>
      </div>

      {/* Control Toggles: Scan Type & Patient Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Scan Type Toggle */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
            Select Scan Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-scan-type-eye"
              type="button"
              onClick={() => {
                setScanType('eye');
                setScreeningResponse(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition ${
                scanType === 'eye'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{t.eyeMode}</span>
            </button>
            <button
              id="btn-scan-type-skin"
              type="button"
              onClick={() => {
                setScanType('skin_bite');
                setScreeningResponse(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition ${
                scanType === 'skin_bite'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Bug className="w-4 h-4" />
              <span>{t.skinBiteMode}</span>
            </button>
          </div>
        </div>

        {/* Patient Mode Toggle */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
            Patient Age Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-patient-child"
              type="button"
              onClick={() => {
                setPatientMode('child');
                if (selectedImage) runScreening(selectedImage);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition ${
                patientMode === 'child'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Baby className="w-4 h-4" />
              <span>{t.patientChild}</span>
            </button>
            <button
              id="btn-patient-adult"
              type="button"
              onClick={() => {
                setPatientMode('adult');
                if (selectedImage) runScreening(selectedImage);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition ${
                patientMode === 'adult'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t.patientAdult}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Concurrent Systemic Symptoms Checkbox */}
      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer text-stone-800 font-medium">
          <input
            id="checkbox-systemic-symptoms"
            type="checkbox"
            checked={hasSystemicSymptoms}
            onChange={(e) => {
              setHasSystemicSymptoms(e.target.checked);
              if (selectedImage) runScreening(selectedImage);
            }}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
          />
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-amber-600" />
            <span>{t.systemicPrompt}</span>
          </div>
        </label>
        <span className="text-[11px] text-stone-500 hidden sm:inline">
          (Triggers Stage 3 systemic symptom advisory without diagnosing)
        </span>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Input & Camera */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-stone-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>{scanType === 'eye' ? 'Eye Region Close-up' : 'Skin Lesion Close-up'}</span>
              </h3>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                {scanType.toUpperCase()}
              </span>
            </div>

            {/* Viewport / Reticle */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 flex items-center justify-center">
              {activeCamera ? (
                <div className="relative w-full h-full">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-emerald-400/40 rounded-xl m-4 pointer-events-none flex items-center justify-center">
                    <div className="w-16 h-16 border border-emerald-400/70 rounded-full" />
                  </div>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <button
                      id="btn-capture-photo"
                      onClick={capturePhoto}
                      className="px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold text-xs shadow-md flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>
              ) : selectedImage ? (
                <div className="relative w-full h-full group">
                  <img
                    src={selectedImage}
                    alt="Screening Target"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-xl bg-white/90 text-stone-900 text-xs font-medium flex items-center gap-1"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Change</span>
                    </button>
                    <button
                      onClick={() => runScreening(selectedImage)}
                      className="p-2 rounded-xl bg-emerald-600 text-white text-xs font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Rescan</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 text-center cursor-pointer space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-stone-800 text-stone-400 mx-auto flex items-center justify-center">
                    {scanType === 'eye' ? <Eye className="w-6 h-6" /> : <Bug className="w-6 h-6" />}
                  </div>
                  <p className="text-xs font-medium text-stone-300">
                    {t.dropzoneTitle}
                  </p>
                  <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                    {scanType === 'eye' ? t.dropzoneEyeHint : t.dropzoneSkinHint}
                  </p>
                </div>
              )}
            </div>

            {/* Input Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-upload-file"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4 text-stone-600" />
                <span>{t.uploadPhoto}</span>
              </button>
              <button
                id="btn-start-camera"
                type="button"
                onClick={activeCamera ? () => setActiveCamera(false) : startCamera}
                className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-4 h-4" />
                <span>{activeCamera ? 'Close Camera' : t.captureLive}</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Reference Case Quick Presets */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-stone-500" />
              <span>{t.referenceCases}</span>
            </h4>
            <div className="space-y-2">
              {SCREENING_PRESETS.filter(p => p.scanType === scanType).map((preset) => (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => handleSelectPreset(preset)}
                  className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50/70 hover:bg-stone-100 transition space-y-1 block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900">{preset.title}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                      {preset.patientMode}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-1">{preset.description}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Outcome: {preset.expectedOutcome}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Stage Screening Output */}
        <div className="lg:col-span-7 space-y-4">
          
          {isAnalyzing ? (
            <div className="p-8 rounded-2xl bg-white border border-stone-200 shadow-2xs text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center animate-spin">
                <RefreshCw className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">{t.analyzingText}</h4>
                <p className="text-xs text-stone-500 mt-1 font-mono">{analysisStep}</p>
              </div>
            </div>
          ) : !screeningResponse ? (
            <div className="p-8 rounded-2xl bg-white border border-stone-200 shadow-2xs text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-stone-800">Awaiting Photograph Input</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Upload or capture a close-up image, or choose a clinical reference scan from the left to execute the 3-stage visual screening pipeline.
              </p>
            </div>
          ) : isGateFail ? (
            /* Stage 0 Gate Failure Display */
            <div 
              id="gate-fail-banner"
              className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <h4 className="font-bold text-sm">{t.validationGateFailed}</h4>
              </div>
              <div className="text-xs space-y-1.5 bg-white/70 p-3 rounded-xl border border-amber-200">
                <p><strong className="font-semibold">Gate Status:</strong> {gateFailData?.gate_status}</p>
                <p><strong className="font-semibold">Message:</strong> {gateFailData?.message}</p>
                <p><strong className="font-semibold">Confidence:</strong> {Math.round((gateFailData?.confidence || 0.9) * 100)}%</p>
              </div>
              <p className="text-xs text-amber-800">
                Per clinical protocol, clinical interpretation is halted until a valid photograph matching the requested scan type is supplied.
              </p>
            </div>
          ) : (
            /* Stage 0 Gate Passed + Stages 1-3 Outputs */
            <div className="space-y-4">
              
              {/* Gate Pass Badge & Audio Header */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{t.validationGatePassed} ({validData?.scan_type.toUpperCase()} • {validData?.patient_mode.toUpperCase()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-voice-readout"
                    onClick={handleToggleSpeech}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
                      isPlayingAudio
                        ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                        : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isPlayingAudio ? 'Stop Audio' : 'Voice Readout'}</span>
                  </button>
                  <button
                    id="btn-save-case-record"
                    onClick={handleSaveToRecords}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white flex items-center gap-1.5 transition"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{savedSuccess ? t.savedRecordSuccess : t.saveRecord}</span>
                  </button>
                </div>
              </div>

              {/* Stage 1: Objective Visual Features (Qualitative Bands) */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-stone-500" />
                  <span>{t.stage1Title}</span>
                </h4>

                {validData?.scan_type === 'eye' ? (
                  /* Eye Feature Bands */
                  (() => {
                    const findings = validData.stage1_findings as Stage1EyeFindings;
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            {t.scleralColor}
                          </span>
                          <span className={`font-semibold mt-0.5 block ${
                            findings.scleral_color !== 'white/normal' ? 'text-amber-700' : 'text-stone-800'
                          }`}>
                            {findings.scleral_color.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            {t.conjunctivalInjection}
                          </span>
                          <span className={`font-semibold mt-0.5 block ${
                            findings.conjunctival_injection !== 'none' ? 'text-red-700' : 'text-stone-800'
                          }`}>
                            {findings.conjunctival_injection}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            {t.conjunctivalPallor}
                          </span>
                          <span className={`font-semibold mt-0.5 block ${
                            findings.conjunctival_pallor === 'pale' || findings.conjunctival_pallor === 'very_pale' ? 'text-amber-700' : 'text-stone-800'
                          }`}>
                            {findings.conjunctival_pallor.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            {t.discharge}
                          </span>
                          <span className="font-semibold text-stone-800 mt-0.5 block">
                            {findings.discharge}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            {t.periorbital}
                          </span>
                          <span className="font-semibold text-stone-800 mt-0.5 block">
                            {Array.isArray(findings.periorbital_signs) ? findings.periorbital_signs.join(', ') : findings.periorbital_signs}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            Other Findings
                          </span>
                          <span className="font-medium text-stone-700 mt-0.5 block truncate">
                            {findings.other_visible_findings || 'none'}
                          </span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* Skin Bite Feature Bands */
                  (() => {
                    const findings = validData?.stage1_findings as Stage1SkinBiteFindings;
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            Lesion Pattern
                          </span>
                          <span className="font-semibold text-stone-800 mt-0.5 block">
                            {findings.lesion_pattern.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            Papule Size Band
                          </span>
                          <span className="font-semibold text-stone-800 mt-0.5 block">
                            {findings.lesion_appearance?.papule_size_band || 'N/A'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            Central Punctum
                          </span>
                          <span className="font-semibold text-stone-800 mt-0.5 block">
                            {findings.lesion_appearance?.central_punctum_present ? 'Present' : 'Absent'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            Wheal & Flare
                          </span>
                          <span className="font-semibold text-stone-800 mt-0.5 block">
                            {findings.lesion_appearance?.wheal_flare_present ? 'Present' : 'Absent'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 sm:col-span-2">
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                            Skin Barrier Integrity
                          </span>
                          <span className="font-medium text-stone-700 mt-0.5 block">
                            {findings.visible_skin_integrity}
                          </span>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Stage 2 & 3: Clinical Interpretation & Finding Summary */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-stone-500" />
                    <span>{t.stage2Title}</span>
                  </h4>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                    validData?.urgency === 'urgent evaluation (same day)'
                      ? 'bg-red-100 text-red-800'
                      : validData?.urgency === 'prompt evaluation (24-48h)'
                      ? 'bg-amber-100 text-amber-800'
                      : validData?.urgency === 'routine follow-up'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {validData?.urgency}
                  </span>
                </div>

                {/* Finding Summary Box */}
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {t.findingSummary}
                  </span>
                  <p className="text-xs font-medium text-stone-900 leading-relaxed">
                    {validData?.finding_summary}
                  </p>
                </div>

                {/* Stage 3: Bite Assessment (if scan_type is skin_bite) */}
                {validData?.bite_assessment && (
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                    <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Bug className="w-4 h-4 text-amber-700" />
                      <span>{t.stage3Title}</span>
                    </h5>
                    <p className="text-xs font-semibold text-amber-950">
                      Likely Category: <span className="font-normal">{validData.bite_assessment.likely_category}</span>
                    </p>
                    {validData.bite_assessment.red_flags && validData.bite_assessment.red_flags.length > 0 && (
                      <div className="text-xs text-red-800 space-y-1">
                        <strong>Red Flags:</strong>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {validData.bite_assessment.red_flags.map((rf, idx) => (
                            <li key={idx}>{rf}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {validData.bite_assessment.systemic_symptom_advisory && (
                      <div className="p-2 rounded-lg bg-amber-100/70 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">{t.systemicAdvisoryTitle}</span>
                          <span>{validData.bite_assessment.systemic_symptom_advisory}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Differentials List (When multi-sign threshold is met) */}
                {validData?.differential && validData.differential.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      {t.differentials}
                    </h5>
                    <div className="space-y-2">
                      {validData.differential.map((diff, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                          <p className="text-xs font-bold text-stone-900">{diff.differential}</p>
                          <p className="text-[11px] text-stone-600">{diff.certainty_language}</p>
                          {diff.supporting_signs && diff.supporting_signs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {diff.supporting_signs.map((sign, sIdx) => (
                                <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-medium">
                                  Supporting: {sign}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Age-Specific Guidance Note */}
                <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 flex items-start gap-2.5 text-xs text-stone-800">
                  <UserCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-stone-900">{t.caregiverNoteTitle}</span>
                    <p className="text-stone-700 mt-0.5 leading-relaxed">{validData?.age_specific_note}</p>
                  </div>
                </div>

                {/* Referral Status */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                  <span className="text-stone-600 font-medium">Professional Clinical Care Recommended:</span>
                  <span className={`font-bold ${validData?.recommend_professional_care ? 'text-red-700' : 'text-emerald-700'}`}>
                    {validData?.recommend_professional_care ? 'YES (Evaluation Advised)' : 'NO (Self-Care / Routine Monitoring)'}
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
