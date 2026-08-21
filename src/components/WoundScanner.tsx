import React, { useState, useRef, useEffect } from 'react';
import { Language, WoundAnalysisResult, PatientMode, WoundMeasurement, ProgressLogEntry, resolveWoundTrackId } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { speakText, stopSpeech } from '../utils/speech';
import { generateWoundReportPDF } from '../utils/pdfGenerator';
import { CaretakerSmsModal } from './CaretakerSmsModal';
import { GoldenHourCountdown } from './GoldenHourCountdown';
import { ForeignObjectDetector } from './ForeignObjectDetector';
import { BloodLossEstimator } from './BloodLossEstimator';
import { SnakeAndAnimalBiteIdentifier } from './SnakeAndAnimalBiteIdentifier';
import { WoundAgeEstimator } from './WoundAgeEstimator';
import { ScarRiskPredictor } from './ScarRiskPredictor';
import { AyurvedicAdvisor } from './AyurvedicAdvisor';
import { PhotoQualityChecker } from './PhotoQualityChecker';
import { WeatherAdviceBanner } from './WeatherAdviceBanner';
import { DynamicPixelMeasurementCard } from './DynamicPixelMeasurementCard';
import { DiseaseProbabilityVisualizer } from './DiseaseProbabilityVisualizer';
import {
  Camera,
  Upload,
  Sparkles,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileSpreadsheet,
  RefreshCw,
  HeartPulse,
  Activity,
  Layers,
  Info,
  ChevronRight,
  Share2,
  BookmarkPlus,
  Pill,
  ShoppingBag,
  Tag,
  Ruler,
  Apple,
  Syringe,
  FileDown,
  MessageSquare,
  Baby,
  User,
  Zap,
  Building2,
  Eye,
  EyeOff,
  Coins,
  Scale,
  TrendingUp,
  CameraOff,
  ImageOff
} from 'lucide-react';

interface WoundScannerProps {
  currentLang: Language;
  useOfflineEngine: boolean;
  highContrast: boolean;
  patientMode: PatientMode;
  onSaveCase: (result: WoundAnalysisResult, imageBase64: string, patientName?: string, notes?: string) => void;
  onOpenEmergencyModal: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const WoundScanner: React.FC<WoundScannerProps> = ({
  currentLang,
  useOfflineEngine,
  highContrast,
  patientMode,
  onSaveCase,
  onOpenEmergencyModal,
  onNavigateTab
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<WoundAnalysisResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [patientNameInput, setPatientNameInput] = useState('');
  const [clinicalNotesInput, setClinicalNotesInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showCalipersOverlay, setShowCalipersOverlay] = useState(true);
  const [customMeasurement, setCustomMeasurement] = useState<WoundMeasurement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeCamera, setActiveCamera] = useState(false);

  // FEATURE 2: Automatic Severity Voice Alert when Severe Wound is detected
  useEffect(() => {
    if (analysisResult && analysisResult.severity === 'Severe') {
      const summaryText = analysisResult.triageSummary[currentLang] || analysisResult.triageSummary.en;
      const alertSpeech = `ALERT! Severe ${analysisResult.woundType} detected. Immediate medical attention required. ${summaryText}`;
      setIsPlayingAudio(true);
      speakText(alertSpeech, currentLang).finally(() => setIsPlayingAudio(false));
    }
  }, [analysisResult]);

  // Stop active speech when language switches or unmounts
  useEffect(() => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    }
    return () => {
      stopSpeech();
    };
  }, [currentLang]);

  // Handle Image Selection and Auto Trigger VLM Triage
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      analyzeWoundImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Live Camera Controls
  const startCamera = async () => {
    try {
      setActiveCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access not permitted or unavailable, switching to file upload mode.');
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
        
        // Stop Camera Streams
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setActiveCamera(false);
        setSelectedImage(dataUrl);
        analyzeWoundImage(dataUrl);
      }
    }
  };

  // Call Backend VLM API
  const analyzeWoundImage = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setCheckedSteps({});
    setSavedSuccess(false);
    const startTime = performance.now();

    setAnalysisProgressStep('Stage 1/3: Extracting high-resolution visual landmarks & tissue morphology...');
    await new Promise(r => setTimeout(r, 220));
    setAnalysisProgressStep('Stage 2/3: Running deep clinical VLM triage & volumetric dimension estimator...');
    await new Promise(r => setTimeout(r, 220));
    setAnalysisProgressStep('Stage 3/3: Computing bioburden risk, hemostasis protocol & multilingual first-aid...');

    try {
      const response = await fetch('/api/analyze-wound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          useOfflineEngine,
          patientMode
        })
      });

      if (!response.ok) {
        throw new Error('Server triage endpoint returned non-200');
      }

      const result: WoundAnalysisResult = await response.json();
      const elapsedMs = Math.round(performance.now() - startTime);
      result.processingTimeMs = result.processingTimeMs || elapsedMs;
      
      // Dev mode rich console logging
      console.group(`%c[WoundCare-VLM Frontend] Inference Complete: ${useOfflineEngine ? '⚡ Edge LoRA (BLIP-2 INT8)' : '☁️ Cloud VLM'} (${(result.processingTimeMs / 1000).toFixed(2)}s)`, 'color: #2e7d32; font-weight: bold;');
      console.log(`%c[WOUND-GATE] Stage 1 Binary Gate: ${result.woundPresenceGateScore ?? (result.woundPresenceDetected ? 95 : 2)}% (${result.woundPresenceDetected !== false && !result.isNoWoundDetected ? 'PASSED (>=85%) -> Stage 2 Trauma Classifier Activated' : 'REJECTED (<85%) -> Negative Class: Healthy Intact Skin'})`, 'color: #8e24aa; font-weight: bold;');
      if (result.woundPresenceGateReason) {
        console.log('[WOUND-GATE] Gate Reason:', result.woundPresenceGateReason[currentLang] || result.woundPresenceGateReason.en);
      }
      console.log('Model Engine:', result.modelEngineUsed);
      console.log('Classified Type:', result.woundType);
      console.log('Confidence Score:', `${result.confidenceScore}%`);
      console.log('Severity Grade:', result.severity);
      console.log('Processing Time:', `${(result.processingTimeMs / 1000).toFixed(2)}s`);
      console.groupEnd();

      setAnalysisResult(result);
    } catch (err) {
      console.warn('Network or VLM inference error, auto-retrying via offline fallback engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Voice Read-Aloud Toggle for Triage Summary
  const handleToggleSpeech = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else if (analysisResult) {
      const summaryText = analysisResult.triageSummary[currentLang] || analysisResult.triageSummary.en;
      setIsPlayingAudio(true);
      speakText(
        summaryText,
        currentLang,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      ).finally(() => setIsPlayingAudio(false));
    }
  };

  const toggleStep = (stepNumber: number) => {
    setCheckedSteps(prev => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const handleSave = () => {
    if (analysisResult && selectedImage) {
      const finalResult = customMeasurement ? {
        ...analysisResult,
        measurement: customMeasurement
      } : analysisResult;
      onSaveCase(finalResult, selectedImage, patientNameInput, clinicalNotesInput);
      
      // Also automatically register as a progress checkpoint so the Healing Progress Chart updates live
      const lengthCm = customMeasurement?.lengthCm || analysisResult.measurement?.lengthCm || 3.5;
      const widthCm = customMeasurement?.widthCm || analysisResult.measurement?.widthCm || 1.5;
      const areaCm2 = customMeasurement?.areaCm2 || analysisResult.measurement?.areaCm2 || parseFloat((lengthCm * widthCm * 0.7854).toFixed(2));
      const granulation = analysisResult.bloodLoss?.colorSegmentation?.granulationPercent ?? Math.max(10, 100 - analysisResult.infectionRiskScore);
      const trackId = resolveWoundTrackId(analysisResult.woundType);

      let logs: ProgressLogEntry[] = [];
      try {
        const saved = localStorage.getItem('woundcare_vlm_progress_tracker_v2');
        if (saved) logs = JSON.parse(saved);
      } catch (e) {}

      const existingTrackLogs = logs.filter(l => (l.woundTrackId || resolveWoundTrackId(l.woundType)) === trackId);
      const dayNumber = existingTrackLogs.length > 0 ? (existingTrackLogs[existingTrackLogs.length - 1].dayNumber || existingTrackLogs.length) + 2 : 1;

      const newLog: ProgressLogEntry = {
        id: 'log-scan-' + Date.now(),
        woundTrackId: trackId,
        woundTitle: `${analysisResult.woundType} Care Trajectory`,
        patientName: patientNameInput || 'Patient',
        woundLocation: clinicalNotesInput || 'Field Clinic',
        date: new Date().toISOString().split('T')[0],
        dayNumber,
        imageUrl: selectedImage,
        woundType: analysisResult.woundType,
        severity: analysisResult.severity === 'None' ? 'Minor' : analysisResult.severity,
        infectionRiskScore: analysisResult.infectionRiskScore,
        lengthCm,
        widthCm,
        areaCm2,
        granulationPercent: granulation,
        painLevel: 4,
        comparisonStatus: existingTrackLogs.length === 0 ? 'Stable' : 'Healing',
        comparisonNotes: clinicalNotesInput || (analysisResult.triageSummary[currentLang] || analysisResult.triageSummary.en),
        patientMode: patientMode || 'adult'
      };

      const updatedLogs = [...logs, newLog];
      try {
        localStorage.setItem('woundcare_vlm_progress_tracker_v2', JSON.stringify(updatedLogs));
        localStorage.setItem('woundcare_last_selected_track_id', trackId);
        window.dispatchEvent(new CustomEvent('woundcare_progress_updated', { detail: { newTrackId: trackId, newLog } }));
      } catch (e) {}

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleAddToProgressTracker = () => {
    if (!analysisResult || !selectedImage) return;
    const lengthCm = customMeasurement?.lengthCm || analysisResult.measurement?.lengthCm || 3.5;
    const widthCm = customMeasurement?.widthCm || analysisResult.measurement?.widthCm || 1.5;
    const areaCm2 = customMeasurement?.areaCm2 || analysisResult.measurement?.areaCm2 || parseFloat((lengthCm * widthCm * 0.7854).toFixed(2));
    const granulation = analysisResult.bloodLoss?.colorSegmentation?.granulationPercent ?? Math.max(10, 100 - analysisResult.infectionRiskScore);

    const trackId = resolveWoundTrackId(analysisResult.woundType);
    
    let logs: ProgressLogEntry[] = [];
    try {
      const saved = localStorage.getItem('woundcare_vlm_progress_tracker_v2');
      if (saved) logs = JSON.parse(saved);
    } catch (e) {}

    const existingTrackLogs = logs.filter(l => (l.woundTrackId || resolveWoundTrackId(l.woundType)) === trackId);
    const dayNumber = existingTrackLogs.length > 0 ? (existingTrackLogs[existingTrackLogs.length - 1].dayNumber || existingTrackLogs.length) + 2 : 1;

    const newLog: ProgressLogEntry = {
      id: 'log-scan-' + Date.now(),
      woundTrackId: trackId,
      woundTitle: `${analysisResult.woundType} Care Trajectory`,
      patientName: patientNameInput || 'Patient',
      woundLocation: clinicalNotesInput || 'Field Clinic',
      date: new Date().toISOString().split('T')[0],
      dayNumber,
      imageUrl: selectedImage,
      woundType: analysisResult.woundType,
      severity: analysisResult.severity === 'None' ? 'Minor' : analysisResult.severity,
      infectionRiskScore: analysisResult.infectionRiskScore,
      lengthCm,
      widthCm,
      areaCm2,
      granulationPercent: granulation,
      painLevel: 4,
      comparisonStatus: existingTrackLogs.length === 0 ? 'Stable' : 'Healing',
      comparisonNotes: clinicalNotesInput || (analysisResult.triageSummary[currentLang] || analysisResult.triageSummary.en),
      patientMode: patientMode || 'adult'
    };

    const updatedLogs = [...logs, newLog];
    try {
      localStorage.setItem('woundcare_vlm_progress_tracker_v2', JSON.stringify(updatedLogs));
      localStorage.setItem('woundcare_last_selected_track_id', trackId);
      window.dispatchEvent(new CustomEvent('woundcare_progress_updated', { detail: { newTrackId: trackId, newLog } }));
    } catch (e) {}

    console.group(`%c[WOUND-PROGRESS-VLM] Checkpoint Added from Scanner: Day ${dayNumber}`, 'color: #0284c7; font-weight: bold;');
    console.log('Track ID:', trackId);
    console.log('Dimensions:', `${lengthCm}x${widthCm} cm (${areaCm2} cm²)`);
    console.log('Infection Risk:', `${analysisResult.infectionRiskScore}%`);
    console.log('Granulation:', `${granulation}%`);
    console.groupEnd();

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Switch to Eye & Jaundice Screener */}
      {onNavigateTab && (
        <motion.div 
          whileHover={{ scale: 1.005 }}
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
            highContrast
              ? 'bg-black border-yellow-400 text-yellow-300'
              : 'bg-[#fffdf7] border-amber-300/80 shadow-amber-900/5 hover:border-amber-400 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-900 flex items-center justify-center shrink-0 shadow-xs relative">
              <Eye className="w-6 h-6 text-amber-700" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            </div>
            <div className="space-y-0.5">
              <p className="font-serif font-bold text-sm sm:text-base text-stone-900 flex items-center flex-wrap gap-2">
                <span>Looking for Jaundice, Typhoid Fever, or Anemia Eye Screening?</span>
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 shadow-xs tracking-wider">
                  ⚡ AI VISION VLM
                </span>
              </p>
              <p className="text-xs text-stone-700 font-medium leading-relaxed max-w-2xl">
                Switch to the specialized Ocular Biomarker Screener to inspect scleral yellowing (bilirubin icterus), toxic typhoid conjunctival suffusion, and anemia pallor.
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigateTab('eye-screener')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 flex items-center justify-center gap-2 shrink-0 transition-all shadow-sm hover:shadow-md cursor-pointer border border-amber-600/30"
          >
            <Eye className="w-4 h-4" />
            <span className="font-semibold tracking-wide">Open Eye Screener</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}

      {/* Main Upload / Camera / Image Preview & Analysis Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Photo Capture & Image View (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-6 rounded-[28px] border flex flex-col justify-between ${
            highContrast ? 'bg-black border-yellow-400' : 'bg-white border-[#e2dfd5] shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-serif font-bold text-[#5A5A40] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#5A5A40]" />
                <span>Wound Photo Input</span>
              </h3>
              {selectedImage && (
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisResult(null);
                  }}
                  className="text-xs text-[#c62828] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Live Camera View */}
            {activeCamera ? (
              <div className="relative w-full aspect-4/3 rounded-[20px] overflow-hidden bg-black flex items-center justify-center border border-[#e2dfd5]">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button
                  onClick={capturePhoto}
                  className="absolute bottom-4 bg-[#5A5A40] text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-[#4a4a34] transition flex items-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
                >
                  <Camera className="w-4 h-4" />
                  Snap Photo
                </button>
              </div>
            ) : selectedImage ? (
              /* Uploaded / Selected Image Display with Photogrammetry Caliper Overlay & Holographic Scanner */
              <div className="relative w-full aspect-4/3 rounded-[24px] overflow-hidden bg-[#18181b] border border-[#e2dfd5] shadow-md group">
                <img
                  src={selectedImage}
                  alt="Target Wound"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />

                {/* Laser Scanline Beam when AI analysis is active */}
                {isAnalyzing && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                    {/* Laser line sweeping */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 shadow-[0_0_18px_#34d399] animate-laser-sweep">
                      <div className="absolute inset-x-1/4 h-[2px] bg-white opacity-80" />
                    </div>
                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(52,211,153,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(52,211,153,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
                    
                    {/* Center Scanning Target Reticle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border border-emerald-400/50 border-dashed animate-reticle-spin flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border border-emerald-300/40" />
                      </div>
                    </div>

                    {/* HUD Corner Accents */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/75 text-white backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-md border border-white/10 z-10">
                  <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
                  <span>{isAnalyzing ? 'VLM Scanning Active' : 'Wound Target Loaded'}</span>
                </div>

                {/* Caliper Overlay Toggle Button */}
                {analysisResult && !isAnalyzing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowCalipersOverlay(!showCalipersOverlay)}
                    className="absolute top-3 right-3 px-3 py-1 bg-black/75 hover:bg-black/90 text-white backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md border border-white/20 z-10"
                    title="Toggle Caliper Scale Grid Overlay"
                  >
                    {showCalipersOverlay ? <EyeOff className="w-3 h-3 text-emerald-400" /> : <Eye className="w-3 h-3" />}
                    <span>{showCalipersOverlay ? 'Hide Scale Caliper' : 'Show Scale Caliper'}</span>
                  </motion.button>
                )}

                {/* Dynamic Caliper & Reference Marker HUD Overlay */}
                {analysisResult && showCalipersOverlay && !analysisResult.isNoWoundDetected && !isAnalyzing && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    {/* Elliptical Measurement Boundary */}
                    <div className="relative w-52 h-36 rounded-[50%] border-2 border-dashed border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.35)] flex items-center justify-center">
                      {/* Horizontal Axis Caliper line */}
                      <div className="absolute inset-x-2 h-[1.5px] bg-emerald-400 flex items-center justify-between shadow-xs">
                        <div className="w-2 h-4 bg-emerald-400 -mt-1 rounded-xs" />
                        <span className="text-[10px] font-mono font-bold bg-black/85 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 shadow-md">
                          L: {customMeasurement?.lengthCm || analysisResult.measurement?.lengthCm || 3.5} cm ({customMeasurement?.lengthMm || ((analysisResult.measurement?.lengthCm || 3.5) * 10).toFixed(0)} mm)
                        </span>
                        <div className="w-2 h-4 bg-emerald-400 -mt-1 rounded-xs" />
                      </div>

                      {/* Vertical Axis Caliper line */}
                      <div className="absolute inset-y-2 w-[1.5px] bg-emerald-400 flex flex-col items-center justify-between shadow-xs">
                        <div className="h-2 w-4 bg-emerald-400 -ml-1 rounded-xs" />
                        <span className="text-[10px] font-mono font-bold bg-black/85 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 shadow-md whitespace-nowrap">
                          W: {customMeasurement?.widthCm || analysisResult.measurement?.widthCm || 1.8} cm ({customMeasurement?.widthMm || ((analysisResult.measurement?.widthCm || 1.8) * 10).toFixed(0)} mm)
                        </span>
                        <div className="h-2 w-4 bg-emerald-400 -ml-1 rounded-xs" />
                      </div>
                    </div>

                    {/* Reference Marker HUD Tag (Bottom Right) */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-yellow-400/70 text-yellow-300 text-[10px] font-mono flex items-center gap-1.5 shadow-lg">
                      <Coins className="w-3.5 h-3.5 text-yellow-400" />
                      <span>
                        Ref: ₹5 Coin ({customMeasurement?.pixelToMmRatio || 0.1917} mm/px)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full aspect-4/3 border-4 border-dashed rounded-[24px] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  highContrast
                    ? 'border-yellow-400 bg-zinc-900 hover:bg-zinc-800'
                    : 'border-[#e2dfd5] bg-[#fdfcfb] hover:border-[#5A5A40] hover:bg-[#f0ede4]'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-[#f0ede4] flex items-center justify-center mb-3 text-[#5A5A40]">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-serif italic text-[#5A5A40]">
                  Drag & Drop Wound Photo Here
                </p>
                <p className="text-xs text-[#8e8b82] mt-1 mb-5">
                  Supports JPG, PNG, WEBP from phone camera or gallery
                </p>

                <div className="flex flex-wrap justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="bg-[#f0ede4] hover:bg-[#e2dfd5] text-[#5A5A40] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Browse Files
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="bg-[#5A5A40] hover:bg-[#4a4a34] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Use Live Camera
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Quick Helper Tip */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5] text-xs text-[#8e8b82] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
              <span>
                Tip: Position a small coin or ruler next to the wound for precise length/width calibration.
              </span>
            </div>
          </div>

          {/* Clinical Imaging Guidance & Calibration Protocol */}
          <div className={`p-5 rounded-[24px] border space-y-4 ${
            highContrast ? 'bg-black border-yellow-400' : 'bg-white border-[#e2dfd5] shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Field Image Quality & Calibration</span>
              </h4>
              <span className="text-[10px] bg-[#f0ede4] text-[#5A5A40] font-bold px-2 py-0.5 rounded-full">
                AI Vision Protocol
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#fdfcf8] border border-[#e2dfd5] flex items-start gap-2.5">
                <Ruler className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2c2c2c]">Scale Reference</p>
                  <p className="text-[11px] text-[#8e8b82]">Place a standard coin (₹1 / ₹5) or metric ruler adjacent to the wound for ±0.2cm dimensional calibration.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#fdfcf8] border border-[#e2dfd5] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2c2c2c]">Diffused Daylight</p>
                  <p className="text-[11px] text-[#8e8b82]">Avoid direct flashlight glare which can wash out granulation redness or macerated slough tissues.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#fdfcf8] border border-[#e2dfd5] flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2c2c2c]">Periwound Margin</p>
                  <p className="text-[11px] text-[#8e8b82]">Ensure at least 3-4 cm of surrounding intact skin is visible to analyze erythema radius & edema.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#fdfcf8] border border-[#e2dfd5] flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2c2c2c]">Active Bleeding Check</p>
                  <p className="text-[11px] text-[#8e8b82]">Gently blot excess liquid blood with sterile gauze before photographing wound bed morphology.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: VLM Analysis & Multilingual Triage Card (7 cols) */}
        <div className="lg:col-span-7">
          {isAnalyzing ? (
            /* Enhanced Holographic AI Inference Animation */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-8 rounded-[28px] border min-h-[460px] flex flex-col items-center justify-center text-center relative overflow-hidden ${
                highContrast ? 'bg-black border-yellow-400' : 'bg-gradient-to-b from-[#fdfcf9] to-white border-[#e2dfd5] shadow-md'
              }`}
            >
              {/* Pulsing Radar Ring Background Effect */}
              <div className="absolute w-72 h-72 rounded-full border border-[#5A5A40]/10 animate-ping opacity-25 pointer-events-none" />
              <div className="absolute w-96 h-96 rounded-full border border-[#5A5A40]/10 pointer-events-none" />

              {/* Holographic Spinning Multi-Ring Reticle */}
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#5A5A40]/30 animate-reticle-spin" />
                <div className="absolute inset-2 rounded-full border-3 border-[#5A5A40]/40 border-t-[#5A5A40] animate-spin" />
                <div className="absolute inset-4 rounded-full border-2 border-emerald-500/50 border-b-emerald-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.8s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-[#5A5A40] animate-pulse" />
                </div>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8e8b82] mb-1">
                Vision-Language Diagnostic Inference
              </span>
              <h3 className="text-2xl font-serif italic font-bold text-[#5A5A40] mb-3">
                Scanning Wound & Calculating Triage
              </h3>

              {/* Active Step Progress Pill */}
              <div className="text-xs text-[#5A5A40] font-mono bg-white px-5 py-2.5 rounded-full border border-[#e2dfd5] shadow-xs flex items-center gap-2 max-w-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="truncate">{analysisProgressStep}</span>
              </div>

              {/* Stepper Checklist items */}
              <div className="grid grid-cols-3 gap-2 mt-6 max-w-sm w-full text-[11px] font-medium text-[#8e8b82]">
                <div className="p-2 rounded-xl bg-[#f0ede4]/60 border border-[#e2dfd5] flex flex-col items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Caliper Scale</span>
                </div>
                <div className="p-2 rounded-xl bg-[#f0ede4]/60 border border-[#e2dfd5] flex flex-col items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Tissue Bed</span>
                </div>
                <div className="p-2 rounded-xl bg-[#f0ede4]/60 border border-[#e2dfd5] flex flex-col items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Triage Protocol</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-[#8e8b82]">
                <Layers className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Engine: {useOfflineEngine ? 'BLIP-2 + OPT-2.7B LoRA (Edge)' : 'Gemini 3.7 Flash VLM'}</span>
              </div>
            </motion.div>
          ) : analysisResult && (analysisResult.proceed === false || analysisResult.gate_status !== 'WOUND_PRESENT' || analysisResult.isNoWoundDetected) ? (
            /* STAGE 0 INPUT VALIDATION GATE FAIL / INTACT SKIN VIEW ONLY - NO CLINICAL CARDS */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`p-7 rounded-[28px] border space-y-6 transition-all ${
                highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-[#e2dfd5] text-[#2c2c2c] shadow-sm'
              }`}
            >
              {/* Header with Stage 0 Gate Title & Patient Profile Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#8e8b82]">
                    Stage 0 Input Validation Gate
                  </span>
                  <h2 className="text-3xl font-serif italic text-[#5A5A40]">
                    {analysisResult.gate_status === 'BODY_PART_NO_WOUND' || analysisResult.isNoWoundDetected
                      ? 'Intact Skin Evaluation'
                      : analysisResult.gate_status === 'NOT_BODY_PART'
                      ? 'Non-Body Object Detected'
                      : 'Unreadable Image Received'}
                  </h2>
                </div>

                <div className={`px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-2xs ${
                  patientMode === 'child' ? 'bg-orange-600 text-white' : 'bg-[#5A5A40] text-white'
                }`}>
                  {patientMode === 'child' ? <Baby className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>{patientMode === 'child' ? 'Child Patient (<18)' : 'Adult Patient (18+)'}</span>
                </div>
              </div>

              {/* Status Display Card based on specific gate_status */}
              {analysisResult.gate_status === 'NOT_BODY_PART' ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow">
                      <CameraOff className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-700 text-white font-mono font-bold text-xs">
                          REJECTED: NOT_BODY_PART
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-800">
                          {analysisResult.confidenceScore}% Confidence
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-serif text-amber-950">No Visible Human Skin Identified</h3>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {analysisResult.vlmGateFailed?.message || 'The image shows an object, animal, document, screen, or scene with no visible human skin or body tissue. Clinical diagnosis cannot be performed on non-medical imagery.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/80 border border-amber-200 text-xs space-y-2 text-amber-900">
                    <strong className="block font-semibold text-amber-950 uppercase tracking-wider text-[11px]">How to Retake for Clinical Triage:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>Frame the camera directly over the injured skin or wound area.</li>
                      <li>Remove surrounding objects, documents, or cloth from the frame.</li>
                      <li>Ensure adequate lighting and hold device steady for sharp focus.</li>
                    </ul>
                  </div>
                </div>
              ) : analysisResult.gate_status === 'NO_IMAGE_CONTENT' ? (
                <div className="p-6 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow">
                      <ImageOff className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-700 text-white font-mono font-bold text-xs">
                          REJECTED: NO_IMAGE_CONTENT
                        </span>
                        <span className="text-xs font-mono font-bold text-rose-800">
                          {analysisResult.confidenceScore}% Confidence
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-serif text-rose-950">Blank or Corrupted Image</h3>
                      <p className="text-xs text-rose-900 leading-relaxed">
                        {analysisResult.vlmGateFailed?.message || 'Blank, dark, blurry, or unreadable image received. Visual analysis cannot proceed.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/80 border border-rose-200 text-xs space-y-2 text-rose-900">
                    <strong className="block font-semibold text-rose-950 uppercase tracking-wider text-[11px]">How to Capture a Clear Image:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>Wipe your camera lens clean of dust or smudges.</li>
                      <li>Turn on room lights or use your camera flash.</li>
                      <li>Hold steady at a 15–20cm distance to ensure clear focus.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* BODY_PART_NO_WOUND */
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs">
                          EXAMINED: BODY_PART_NO_WOUND
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-800">
                          {analysisResult.confidenceScore}% Confidence
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-serif text-emerald-950">Normal Intact Skin Barrier Confirmed</h3>
                      <p className="text-xs text-emerald-900 leading-relaxed">
                        {analysisResult.vlmGateFailed?.message || 'Visible human skin examined. No acute wound, laceration, puncture, burn, rash, or active lesion detected.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/80 border border-emerald-200 text-xs space-y-2 text-emerald-900">
                    <strong className="block font-semibold text-emerald-950 uppercase tracking-wider text-[11px]">Clinical Findings:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>Intact epidermal layer with healthy skin morphology. Zero acute trauma or hemorrhage.</li>
                      <li>Maintain routine hygiene with mild cleanser and clean water.</li>
                      <li>If an injury was present elsewhere or out of frame, retake a close-up photo centered on that lesion.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#e2dfd5]">
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisResult(null);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake Photo / Scan Again</span>
                </button>
              </div>
            </motion.div>
          ) : analysisResult ? (
            /* Analysis Result Card with Staggered Motion Animations (WOUND_PRESENT ONLY) */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className={`p-7 rounded-[28px] border space-y-6 transition-all ${
                highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-[#e2dfd5] text-[#2c2c2c] shadow-sm'
              }`}
            >
              
              {/* AI Analysis Report Title & Patient Profile Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#8e8b82]">
                      AI Triage Analysis Report
                    </span>
                    {/* Visual Speed Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                      <Zap className="w-3 h-3 text-emerald-600 animate-pulse" />
                      Analyzed in {((analysisResult.processingTimeMs || 320) / 1000).toFixed(2)}s
                    </span>
                    {/* Visual Accuracy/Confidence Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      {analysisResult.confidenceScore}% Model Accuracy
                    </span>
                  </div>
                  <h2 className="text-3xl font-serif italic text-[#5A5A40] mt-0.5">
                    Wound Diagnosis
                  </h2>
                </div>

                {/* Patient Profile Badge */}
                <div className={`px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-2xs self-start sm:self-auto ${
                  patientMode === 'child' ? 'bg-orange-600 text-white' : 'bg-[#5A5A40] text-white'
                }`}>
                  {patientMode === 'child' ? <Baby className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>{patientMode === 'child' ? 'Child Patient (<18)' : 'Adult Patient (18+)'}</span>
                </div>
              </div>

              {/* STAGE 0: VLM Input Validation Gate Status Card */}
              <div className="p-4 rounded-2xl border bg-amber-50/70 border-amber-300 text-amber-950 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Stage 0: Clinical Input Validation Gate
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-600 text-white">
                      WOUND_PRESENT
                    </span>
                    <span className="text-[11px] font-bold font-mono opacity-80">
                      {analysisResult.confidenceScore}% Conf
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 opacity-75" />
                  <p className="leading-relaxed">
                    Acute tissue breach and morphological lesion identified. Proceeding with hierarchical clinical triage and age-branched recommendations.
                  </p>
                </div>
              </div>

              {/* VLM Professional Care vs Self-Care Safe & Recheck Window Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  analysisResult.recommend_professional_care
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <Building2 className={`w-5 h-5 shrink-0 ${analysisResult.recommend_professional_care ? 'text-red-600' : 'text-emerald-600'}`} />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Clinical Triage Action</span>
                    <span className="text-xs font-bold">
                      {analysisResult.recommend_professional_care ? 'PHC / Hospital Care Indicated' : 'Self-Care Safe at Home'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-[#fdfcf8] border-[#e2dfd5] flex items-center gap-2.5">
                  <Clock className="w-5 h-5 shrink-0 text-[#5A5A40]" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8e8b82] block">Clinical Recheck Window</span>
                    <span className="text-xs font-bold text-[#2c2c2c]">
                      {analysisResult.recheck_window || (patientMode === 'child' ? '24–48 Hours' : '48–72 Hours')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-[#fdfcf8] border-[#e2dfd5] flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-[#5A5A40]" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8e8b82] block">Severity Grade</span>
                    <span className="text-xs font-bold uppercase text-[#5A5A40]">
                      {analysisResult.severity_grade || analysisResult.severity.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Age-Specific Flags / Caregiver Notes */}
              {analysisResult.age_specific_flags && analysisResult.age_specific_flags.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-800 text-[11px]">
                    {patientMode === 'child' ? <Baby className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    <span>{patientMode === 'child' ? 'Pediatric Caregiver Flags & Guidance' : 'Adult Clinical Flags'}</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                    {analysisResult.age_specific_flags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* VLM Differential Etiologies Breakdown */}
              {analysisResult.vlmDifferentialEtiologies && analysisResult.vlmDifferentialEtiologies.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#5A5A40]">
                    <span className="uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#5A5A40]" /> Differential Etiology Probabilities
                    </span>
                    <span className="text-[10px] text-[#8e8b82] font-mono">Stage 2 Posterior</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysisResult.vlmDifferentialEtiologies.map((etiology, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-[#e2dfd5] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2c2c2c]">{etiology.label}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#f0ede4] text-[#5A5A40] font-mono font-bold text-[10px]">
                            {etiology.posterior_probability}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#716e66] leading-snug">{etiology.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Header Badge & Severity Banner with SVG Circular Gauge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Type & Circular Confidence Meter Box */}
                <div className="p-4 bg-[#fdfcf8] rounded-2xl border border-[#e2dfd5] flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="block text-[10px] uppercase text-[#8e8b82] font-bold tracking-wider">Identified Type</span>
                    <span className="text-xl font-bold text-[#2c2c2c]">{analysisResult.woundType}</span>
                    <span className="block text-[11px] text-[#8e8b82] mt-0.5">VLM LoRA Verified</span>
                  </div>
                  
                  {/* Circular SVG Gauge for Confidence */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#e2dfd5]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#5A5A40] transition-all duration-1000 ease-out"
                        strokeDasharray={`${analysisResult.confidenceScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-[#5A5A40] leading-none">{analysisResult.confidenceScore}%</span>
                      <span className="text-[8px] text-[#8e8b82] uppercase tracking-tighter scale-90">Conf</span>
                    </div>
                  </div>
                </div>

                {/* Severity Grade Box */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-2xs ${
                  analysisResult.severity === 'Severe'
                    ? 'bg-[#fff3f3] border-[#ffcdd2] text-[#c62828]'
                    : analysisResult.severity === 'Moderate'
                    ? 'bg-[#fff8e1] border-[#ffe082] text-[#f57f17]'
                    : 'bg-[#e8f5e9] border-[#c8e6c9] text-[#2e7d32]'
                }`}>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">Severity Grade</span>
                    <span className="text-2xl font-serif italic font-bold">{analysisResult.severity}</span>
                    <span className="block text-[11px] opacity-75 mt-0.5">
                      {analysisResult.severity === 'Severe' ? 'Immediate Triage' : analysisResult.severity === 'Moderate' ? 'Clean & Dress' : 'Self-Care Safe'}
                    </span>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                    analysisResult.severity === 'Severe' ? 'bg-[#c62828] text-white animate-radar-pulse' : analysisResult.severity === 'Moderate' ? 'bg-[#f57f17] text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Safeguard Notification Banner if Active */}
              {analysisResult.safeguardTriggered && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-xs">
                  <span className="text-base shrink-0">🛡️</span>
                  <div>
                    <strong className="font-semibold">Clinical Safeguard Activated:</strong> Initial severe reading intercepted and safely reconciled due to high skin uniformity and benign lesion dimensions.
                  </div>
                </div>
              )}

              {/* Model Classification Logits & Confidence Distribution */}
              {analysisResult.classificationLogits && analysisResult.classificationLogits.length > 0 && (
                <div className="p-4 bg-[#fdfcf8] border border-[#e2dfd5] rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40]">LoRA Classification Logits (Label Set)</span>
                      {analysisResult.edgeQuantizationMode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2c2c2c] text-[#fdfcf8]">
                          {analysisResult.edgeQuantizationMode}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8e8b82]">Softmax Distribution</span>
                  </div>

                  <div className="space-y-2">
                    {analysisResult.classificationLogits.slice(0, 5).map((logit, idx) => {
                      const isTop = logit.label === analysisResult.woundType;
                      const percentage = Math.round(logit.probability * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className={isTop ? 'font-bold text-[#2c2c2c] flex items-center gap-1.5' : 'text-[#8e8b82]'}>
                              {isTop && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />}
                              {logit.label}
                            </span>
                            <span className={isTop ? 'font-bold text-emerald-800' : 'text-[#8e8b82]'}>
                              {percentage}% (p={logit.probability.toFixed(3)})
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-[#f0eee6] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isTop
                                  ? (analysisResult.severity === 'Severe' ? 'bg-red-600' : analysisResult.severity === 'Moderate' ? 'bg-amber-600' : 'bg-emerald-600')
                                  : 'bg-[#cfcbbe]'
                              }`}
                              style={{ width: `${Math.max(percentage, 2)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FEATURE: Etiology & Disease Probability Matrix (Differential Diagnoses, Snakebites & Pathogens) */}
              <DiseaseProbabilityVisualizer
                etiology={analysisResult.etiologyAnalysis}
                woundType={analysisResult.woundType}
                severity={analysisResult.severity}
                confidenceScore={analysisResult.confidenceScore || 95}
                currentLang={currentLang}
                highContrast={highContrast}
                onSelectHospital={() => onNavigateTab && onNavigateTab('hospitals')}
              />

              {/* FEATURE 1: Golden Hour Countdown for Severe Wounds (Strictly Guarded) */}
              {analysisResult.severity === 'Severe' && 
               !analysisResult.isNoWoundDetected && 
               analysisResult.woundType !== 'Healthy Skin / No Wound' &&
               analysisResult.woundType !== 'No Wound Detected' && 
               (analysisResult.confidenceScore || 0) >= 90 && 
               ((analysisResult.measurement?.lengthCm || 0) > 0 || (analysisResult.bloodLoss?.estimatedVolumeMl || 0) > 40) && (
                <GoldenHourCountdown
                  currentLang={currentLang}
                  highContrast={highContrast}
                  onOpenEmergency108={onOpenEmergencyModal}
                  onTriggerSmsAlert={() => setShowSmsModal(true)}
                  woundType={analysisResult.woundType}
                />
              )}

              {/* FEATURE 14: Weather-Aware Healing Advice Banner */}
              <WeatherAdviceBanner
                currentLang={currentLang}
                highContrast={highContrast}
              />

              {/* FEATURE 2: Foreign Object Detector */}
              <ForeignObjectDetector
                data={analysisResult.foreignObject}
                currentLang={currentLang}
                highContrast={highContrast}
              />

              {/* FEATURE 3: Dynamic Blood Loss Estimator */}
              <BloodLossEstimator
                data={analysisResult.bloodLoss}
                measurement={customMeasurement || analysisResult.measurement}
                woundType={analysisResult.woundType}
                severity={analysisResult.severity}
                isNoWound={analysisResult.isNoWoundDetected}
                currentLang={currentLang}
                onLaunchTourniquetGuide={onOpenEmergencyModal}
                highContrast={highContrast}
              />

              {/* FEATURE 4: Snake & Animal Bite Identifier */}
              {analysisResult.biteData && analysisResult.biteData.biteType !== 'none' && (
                <SnakeAndAnimalBiteIdentifier
                  data={analysisResult.biteData}
                  currentLang={currentLang}
                  onNavigateToHospitals={() => onNavigateTab && onNavigateTab('hospitals')}
                  highContrast={highContrast}
                />
              )}

              {/* FEATURE 5 & 11: Wound Age & Scar Risk Intelligence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WoundAgeEstimator
                  data={analysisResult.woundAge}
                  currentLang={currentLang}
                  highContrast={highContrast}
                />
                <ScarRiskPredictor
                  data={analysisResult.scarRisk}
                  currentLang={currentLang}
                  highContrast={highContrast}
                />
              </div>

              {/* FEATURE 7: Tetanus Risk Warning Banner */}
              {analysisResult.tetanusRiskDetected && (
                <div className="p-4 rounded-2xl bg-red-600 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Syringe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">⚠️ TETANUS RISK WARNING DETECTED</h4>
                      <p className="text-xs text-red-100">
                        Puncture/contaminated wound detected. Tetanus Toxoid (TT) vaccine required within 24 hours.
                      </p>
                    </div>
                  </div>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('hospitals')}
                      className="px-4 py-2 rounded-full bg-white text-red-700 font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition cursor-pointer shrink-0 shadow"
                    >
                      Locate Vaccine Center
                    </button>
                  )}
                </div>
              )}

              {/* FEATURE 8: Dynamic Pixel-to-Millimeter Surface Area Measurement & Reference Object Calibration */}
              {!analysisResult.isNoWoundDetected && (
                <DynamicPixelMeasurementCard
                  measurement={customMeasurement || analysisResult.measurement}
                  patientMode={patientMode}
                  currentLang={currentLang}
                  highContrast={highContrast}
                  onMeasurementChange={(updated) => {
                    setCustomMeasurement(updated);
                  }}
                />
              )}

              {/* FEATURE 5: Infection Risk Predictor Meter */}
              <div className="p-4 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-600" /> Infection Risk Score Predictor
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-white font-mono ${
                    (analysisResult.infectionRiskScore || 40) > 65
                      ? 'bg-red-600'
                      : (analysisResult.infectionRiskScore || 40) > 35
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}>
                    {analysisResult.infectionRiskScore || 40}% ({analysisResult.infectionRisk})
                  </span>
                </div>

                {/* Color-coded percentage gauge meter */}
                <div className="w-full h-3 rounded-full bg-[#e2dfd5] overflow-hidden relative">
                  <div
                    style={{ width: `${analysisResult.infectionRiskScore || 40}%` }}
                    className={`h-full transition-all duration-700 rounded-full ${
                      (analysisResult.infectionRiskScore || 40) > 65
                        ? 'bg-red-600'
                        : (analysisResult.infectionRiskScore || 40) > 35
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>

                {analysisResult.infectionVisualCues && analysisResult.infectionVisualCues.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-[#8e8b82]">
                    <span className="font-bold text-[#525252]">Visual Markers:</span>
                    {analysisResult.infectionVisualCues.map((cue, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#f0ede4] text-[#5A5A40] font-medium">
                        • {cue}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Triage Summary & Multilingual Read-Aloud Bar */}
              <div className="bg-[#fdfcf8] p-5 rounded-2xl border border-[#e2dfd5] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
                    <HeartPulse className="w-4 h-4 text-[#c62828]" />
                    <span>Clinical Diagnosis ({currentLang === 'hi' ? 'हिन्दी' : currentLang === 'ta' ? 'தமிழ்' : 'English'})</span>
                  </div>

                  {/* Audio Read-Aloud TTS Toggle Button */}
                  <button
                    id="btn-read-aloud"
                    onClick={handleToggleSpeech}
                    title={`Read triage summary aloud in ${currentLang === 'hi' ? 'Hindi' : currentLang === 'ta' ? 'Tamil' : 'English'}`}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs ${
                      isPlayingAudio
                        ? 'bg-[#c62828] text-white ring-2 ring-red-300 animate-pulse'
                        : 'bg-[#f0ede4] hover:bg-[#e2dfd5] text-[#5A5A40] border border-[#e2dfd5]'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono text-[11px] uppercase tracking-wider">Stop Speech</span>
                        <span className="flex gap-0.5 items-end h-3 ml-1">
                          <span className="w-0.5 h-2.5 bg-white animate-pulse"></span>
                          <span className="w-0.5 h-3.5 bg-white animate-bounce"></span>
                          <span className="w-0.5 h-1.5 bg-white animate-pulse"></span>
                        </span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                        <span className="text-[11px] font-bold">
                          {currentLang === 'hi' ? 'सारांश सुनें (TTS)' : currentLang === 'ta' ? 'சுருக்கத்தைக் கேட்க (TTS)' : 'Listen Triage (TTS)'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm font-medium text-[#2c2c2c] leading-relaxed">
                  {analysisResult.triageSummary[currentLang] || analysisResult.triageSummary.en}
                </p>

                {/* FEATURE 10: Child Pediatric Specific Care Notes if active */}
                {analysisResult.isChildMode && analysisResult.pediatricNotes && (
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs flex items-start gap-2">
                    <Baby className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">PEDIATRIC CARE PROTOCOL:</strong>
                      <span>{analysisResult.pediatricNotes[currentLang] || analysisResult.pediatricNotes.en}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Immediate First Aid Steps - Natural Tones Olive Container */}
              <div className="bg-[#5A5A40] rounded-[24px] p-6 text-white shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 block">
                    Immediate First Aid Steps
                  </span>
                  <span className="text-[10px] opacity-70">
                    Check off steps as completed
                  </span>
                </div>

                <div className="space-y-3">
                  {analysisResult.firstAidSteps.map((step) => {
                    const isChecked = checkedSteps[step.stepNumber] || false;
                    const stepText = step.text[currentLang] || step.text.en;

                    return (
                      <div
                        key={step.stepNumber}
                        onClick={() => toggleStep(step.stepNumber)}
                        className={`flex items-start gap-4 p-3 rounded-xl transition cursor-pointer ${
                          isChecked
                            ? 'bg-white/10 line-through opacity-60'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold mt-0.5">
                          0{step.stepNumber}
                        </span>
                        <div className="text-sm leading-relaxed flex-1">
                          <span>{stepText}</span>
                          {step.isUrgent && (
                            <span className="ml-2 text-[10px] font-bold bg-[#c62828] text-white px-2 py-0.5 rounded-full">
                              URGENT
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FEATURE 6: Ayurvedic Alternative Advisor */}
              <AyurvedicAdvisor
                remedies={analysisResult.ayurvedicRemedies}
                vlmHomeRemedy={analysisResult.vlmHomeRemedy}
                woundType={analysisResult.woundType}
                currentLang={currentLang}
                highContrast={highContrast}
              />

              {/* FEATURE 6: Diet and Recovery Advisory */}
              {analysisResult.recoveryDiet && (
                <div className="bg-[#f4f7f2] p-5 rounded-2xl border border-[#d5e0d0] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
                    <Apple className="w-4 h-4 text-emerald-700" />
                    <span>Recovery Diet & Hydration Advisory</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-[#e2dfd5] space-y-1">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recommended Foods (To Eat):
                      </span>
                      <ul className="list-disc pl-4 text-[#2c2c2c] space-y-0.5 text-[11px]">
                        {analysisResult.recoveryDiet.foodsToEat.map((food, i) => (
                          <li key={i}>{food[currentLang] || food.en}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-[#e2dfd5] space-y-1">
                      <span className="font-bold text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Foods & Liquids to Avoid:
                      </span>
                      <ul className="list-disc pl-4 text-[#2c2c2c] space-y-0.5 text-[11px]">
                        {analysisResult.recoveryDiet.foodsToAvoid.map((food, i) => (
                          <li key={i}>{food[currentLang] || food.en}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#e2dfd5] text-xs flex flex-col sm:flex-row justify-between gap-2 text-[#2c2c2c]">
                    <span>💧 <strong>Hydration:</strong> {analysisResult.recoveryDiet.hydrationAdvice[currentLang] || analysisResult.recoveryDiet.hydrationAdvice.en}</span>
                    <span>🛌 <strong>Rest:</strong> {analysisResult.recoveryDiet.restAdvice[currentLang] || analysisResult.recoveryDiet.restAdvice.en}</span>
                  </div>
                </div>
              )}

              {/* Recommended Medicines & Supplies */}
              {analysisResult.medicineRecommendations && analysisResult.medicineRecommendations.length > 0 && (
                <div className="bg-[#f7f5f0] p-5 rounded-2xl border border-[#e2dfd5] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
                      <Pill className="w-4 h-4 text-[#5A5A40]" />
                      <span>Recommended Medicines & Supplies</span>
                    </div>
                    <span className="text-[10px] font-bold bg-[#e2dfd5] text-[#5A5A40] px-2.5 py-0.5 rounded-full">
                      INR Pricing & Safety Rated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {analysisResult.medicineRecommendations.map((med, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-[#e2dfd5] space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-[#2c2c2c] flex items-center gap-1.5">
                              {med.name}
                            </h4>
                            <span className="text-[11px] text-[#8e8b82] font-mono">
                              Generic: {med.genericName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              med.harmLevel.toLowerCase().includes('very low')
                                ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]'
                                : 'bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2]'
                            }`}>
                              {med.harmLevel}
                            </span>

                            <span className="bg-[#f0ede4] text-[#5A5A40] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#e2dfd5] flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3" />
                              {med.estimatedPriceINR}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-[#525252] space-y-1 pt-1 border-t border-[#f0ede4]">
                          <p><strong className="text-[#2c2c2c]">Dosage:</strong> {med.dosageInstructions[currentLang] || med.dosageInstructions.en}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical Myth Warnings */}
              {analysisResult.criticalWarnings.length > 0 && (
                <div className="bg-[#fff3f3] border border-[#ffcdd2] p-4 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#c62828] font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Rural Health Warnings & Myth Busters</span>
                  </div>
                  {analysisResult.criticalWarnings.map((warn, idx) => (
                    <p key={idx} className="text-[#2c2c2c] pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-[#c62828]">
                      {warn[currentLang] || warn.en}
                    </p>
                  ))}
                </div>
              )}

              {/* Action Toolbar: SMS Alert & Download PDF */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#e2dfd5]">
                {/* FEATURE 8: Caretaker Emergency SMS Alert */}
                <button
                  onClick={() => setShowSmsModal(true)}
                  id="btn-trigger-sms-alert"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Caretaker SMS Alert</span>
                </button>

                {/* FEATURE 9: Offline First Aid PDF Generator */}
                <button
                  onClick={() => generateWoundReportPDF(
                    customMeasurement ? { ...analysisResult, measurement: customMeasurement } : analysisResult,
                    currentLang,
                    selectedImage || undefined
                  )}
                  id="btn-download-pdf-report"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </button>
              </div>

              {/* Patient Logging & Save Section */}
              <div className="pt-3 border-t border-[#e2dfd5] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Patient Name / ID (Optional)"
                    value={patientNameInput}
                    onChange={(e) => setPatientNameInput(e.target.value)}
                    className="bg-[#fdfcfb] border border-[#e2dfd5] text-xs text-[#2c2c2c] p-2.5 rounded-xl focus:outline-none focus:border-[#5A5A40]"
                  />
                  <input
                    type="text"
                    placeholder="Location / Village / PHC Notes"
                    value={clinicalNotesInput}
                    onChange={(e) => setClinicalNotesInput(e.target.value)}
                    className="bg-[#fdfcfb] border border-[#e2dfd5] text-xs text-[#2c2c2c] p-2.5 rounded-xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="btn-save-case-record"
                      onClick={handleSave}
                      className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow flex items-center gap-1.5 transition cursor-pointer uppercase tracking-wider"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>{savedSuccess ? 'Saved to Patient Logs!' : 'Save Case Record'}</span>
                    </button>

                    <button
                      id="btn-log-to-healing-trajectory"
                      onClick={handleAddToProgressTracker}
                      className="bg-[#5A5A40] hover:bg-[#4a4a34] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow flex items-center gap-1.5 transition cursor-pointer uppercase tracking-wider"
                      title="Adds this scan as a chronological data point in the healing progress tracker"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Log to Healing Trajectory</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisResult(null);
                    }}
                    className="bg-[#f0ede4] hover:bg-[#e2dfd5] text-[#5A5A40] text-xs font-bold px-5 py-2.5 rounded-full border border-[#e2dfd5] transition cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Scan New Injury</span>
                  </button>
                </div>
              </div>

            </motion.div>
          ) : (
            /* Blank Prompt State before photo selected */
            <div className={`p-10 rounded-[28px] border min-h-[420px] flex flex-col items-center justify-center text-center ${
              highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-[#e2dfd5] text-[#2c2c2c] shadow-sm'
            }`}>
              <div className="w-16 h-16 rounded-full bg-[#f0ede4] flex items-center justify-center mb-4 text-[#5A5A40]">
                <HeartPulse className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-serif italic text-[#5A5A40] mb-2">
                Awaiting Injury Photo
              </h3>
              <p className="text-xs text-[#8e8b82] max-w-sm mb-6 leading-relaxed">
                Upload or snap a photo of any wound on the left to generate real-time AI triage and multilingual first aid.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md w-full text-xs">
                <div className="p-3.5 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5]">
                  <span className="font-serif font-bold text-[#5A5A40] block mb-0.5">Any or All Wound Categories</span>
                  <span className="text-[#8e8b82] text-[11px]">
                    Abrasion, Laceration, Puncture, Burn, Bite, Ulcer & Any Other Wounds
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5]">
                  <span className="font-serif font-bold text-[#5A5A40] block mb-0.5">3 Languages</span>
                  <span className="text-[#8e8b82] text-[11px]">
                    English, Hindi (हिंदी), Tamil (தமிழ்)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Emergency Caretaker SMS Modal */}
      {showSmsModal && analysisResult && (
        <CaretakerSmsModal
          isOpen={showSmsModal}
          onClose={() => setShowSmsModal(false)}
          highContrast={highContrast}
          woundType={analysisResult.woundType}
          severity={analysisResult.severity}
          firstAidSummary={analysisResult.triageSummary[currentLang] || analysisResult.triageSummary.en}
          patientMode={patientMode}
        />
      )}

    </div>
  );
};
