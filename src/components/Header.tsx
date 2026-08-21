import React, { useState } from 'react';
import { Language, PatientMode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Globe, 
  Cpu, 
  Sun, 
  Moon,
  PhoneCall, 
  Radio, 
  WifiOff, 
  Sparkles, 
  User, 
  Baby, 
  Activity, 
  Building2, 
  UserCheck, 
  Heart,
  Menu,
  X,
  Stethoscope,
  BookOpen,
  FileCheck2,
  Zap,
  Info,
  Eye
} from 'lucide-react';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  useOfflineEngine: boolean;
  onToggleEngine: (offline: boolean) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenEmergencyModal: () => void;
  patientMode: PatientMode;
  onTogglePatientMode: (mode: PatientMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  useOfflineEngine,
  onToggleEngine,
  highContrast,
  onToggleHighContrast,
  onOpenEmergencyModal,
  patientMode,
  onTogglePatientMode,
  activeTab,
  setActiveTab
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = {
    en: {
      scanner: 'Scanner & Triage',
      eyeScreener: 'Eye & Disease Screener',
      profile: 'Patient Profile',
      progress: 'Healing Progress',
      hospitals: 'Hospital Locator',
      history: 'Case Records',
      architecture: 'BLIP-2 Benchmarks',
      deliverables: 'Research & Patent',
      guide: 'Rural Field Guide',
      emergencyBanner: 'CRITICAL TRIAGE: Arterial spurting, deep penetrating puncture, or snake envenomation requires immediate hospital transport.',
      dispatch108: 'DISPATCH 108 AMBULANCE',
      adultMode: 'Adult',
      childMode: 'Child (<18)',
      edgeLoRA: 'Edge LoRA',
      cloudVLM: 'Cloud VLM'
    },
    hi: {
      scanner: 'घाव स्कैनर व जांच',
      eyeScreener: 'नेत्र व रोग जांच (पीलिया/टाइफाइड)',
      profile: 'रोगी प्रोफ़ाइल',
      progress: 'सुधार चार्ट',
      hospitals: 'अस्पताल खोजें',
      history: 'केस रिकॉर्ड',
      architecture: 'एआई मॉडल आर्किटेक्चर',
      deliverables: 'शोध व रिपोर्ट',
      guide: 'ग्रामीण प्राथमिक गाइड',
      emergencyBanner: 'गंभीर आपातकाल: अत्यधिक रक्तस्राव, गहरा घाव या सर्पदंश होने पर तुरंत नजदीकी अस्पताल जाएं।',
      dispatch108: '108 एम्बुलेंस बुलाएं',
      adultMode: 'वयस्क',
      childMode: 'बच्चे (<18)',
      edgeLoRA: 'एज LoRA',
      cloudVLM: 'क्लाउड VLM'
    },
    ta: {
      scanner: 'காய ஸ்கேனர் & முதலுதவி',
      eyeScreener: 'கண் & நோய் பரிசோதனை',
      profile: 'நோயாளி விவரம்',
      progress: 'குணமடைதல் பதிவு',
      hospitals: 'மருத்துவமனை',
      history: 'வழக்கு பதிவுகள்',
      architecture: 'AI மாதிரி செயல்திறன்',
      deliverables: 'ஆராய்ச்சி & காப்புரிமை',
      guide: 'கள வழிகாட்டி',
      emergencyBanner: 'அவசர சிகிச்சை: தீவிர இரத்தப்போக்கு அல்லது பாம்பு கடிக்கு உடனடியாக ஆம்புலன்ஸ் அழைக்கவும்.',
      dispatch108: '108 ஆம்புலன்ஸ் அழைக்க',
      adultMode: 'பெரியவர்',
      childMode: 'குழந்தை (<18)',
      edgeLoRA: 'எட்ஜ் LoRA',
      cloudVLM: 'கிளவுட் VLM'
    }
  }[currentLang];

  const navItems = [
    { id: 'scanner', label: t.scanner, icon: <Cpu className="w-4 h-4" />, badge: 'AI VLM' },
    { id: 'eye-screener', label: t.eyeScreener, icon: <Eye className="w-4 h-4 text-amber-500" />, badge: { en: 'Jaundice / Typhoid', hi: 'पीलिया/टाइफाइड', ta: 'காமாலை/டைபாய்டு' }[currentLang] },
    { id: 'profile', label: t.profile, icon: <UserCheck className="w-4 h-4 text-sky-500" /> },
    { id: 'progress', label: t.progress, icon: <Activity className="w-4 h-4 text-emerald-500" />, badge: { en: 'Charts', hi: 'चार्ट', ta: 'வரைபடம்' }[currentLang] },
    { id: 'hospitals', label: t.hospitals, icon: <Building2 className="w-4 h-4 text-rose-500" /> },
    { id: 'history', label: t.history, icon: <Radio className="w-4 h-4 text-amber-500" /> },
    { id: 'architecture', label: t.architecture, icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
    { id: 'deliverables', label: t.deliverables, icon: <FileCheck2 className="w-4 h-4 text-indigo-500" /> },
    { id: 'guide', label: t.guide, icon: <BookOpen className="w-4 h-4 text-teal-500" /> }
  ];

  return (
    <header className={`border-b transition-colors sticky top-0 z-40 backdrop-blur-md ${
      highContrast 
        ? 'bg-black/95 text-yellow-300 border-yellow-400/80 shadow-lg shadow-yellow-400/10' 
        : 'bg-white/95 text-slate-800 border-slate-200/80 shadow-xs'
    }`}>
      {/* Top Banner for Emergency & Rural Triage Notice */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white px-4 sm:px-6 py-1.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2 shadow-inner relative overflow-hidden">
        {/* Ambient shimmer line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer pointer-events-none" />
        
        <div className="flex items-center gap-2 relative z-10">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-3.5 h-3.5 rounded-full bg-yellow-300/80 animate-ping" />
            <ShieldAlert className="w-4 h-4 text-yellow-300 relative z-10" />
          </div>
          <span className="tracking-tight text-[11px] sm:text-xs font-semibold">
            {t.emergencyBanner}
          </span>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenEmergencyModal}
            id="btn-emergency-108"
            className="bg-white text-red-700 hover:bg-red-50 px-3 py-0.5 sm:py-1 rounded-full font-bold transition flex items-center gap-1.5 shadow-sm text-[11px] uppercase tracking-wider cursor-pointer"
          >
            <PhoneCall className="w-3 h-3 text-red-600 animate-bounce" />
            <span>{t.dispatch108}</span>
          </motion.button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 4, scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={() => setActiveTab('scanner')}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-serif font-bold text-xl shadow-md border relative overflow-hidden cursor-pointer ${
                highContrast 
                  ? 'bg-yellow-400 text-black border-yellow-500 shadow-yellow-400/20' 
                  : 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700 shadow-slate-900/20'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center">
                <CrossIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500/40 rounded-full blur-xs" />
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <h1 
                  onClick={() => setActiveTab('scanner')}
                  className={`text-xl sm:text-2xl font-serif font-bold tracking-tight cursor-pointer ${
                    highContrast ? 'text-yellow-300' : 'text-slate-900'
                  }`}
                >
                  WoundCare<span className={highContrast ? 'text-yellow-400' : 'text-emerald-600'}>-VLM</span>
                </h1>
                
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border shadow-2xs hidden xs:inline-flex items-center gap-1 ${
                  highContrast 
                    ? 'bg-yellow-400 text-black border-yellow-500' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Rural Triage V2.0
                </span>
              </div>
              
              <p className={`text-[11px] font-medium hidden sm:flex items-center gap-1.5 ${
                highContrast ? 'text-yellow-300/80' : 'text-slate-500'
              }`}>
                <span>Visual Clinical AI</span>
                <span>•</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Fine-Tuned BLIP-2 LoRA</span>
                <span>•</span>
                <span>English / हिंदी / தமிழ்</span>
              </p>
            </div>
          </div>

          {/* Quick Controls Toolbar */}
          <div className="flex items-center gap-2">
            
            {/* Patient Mode Toggle (Adult / Child) */}
            <div className={`flex items-center rounded-full p-0.5 border text-xs shadow-2xs ${
              highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                id="btn-mode-adult"
                onClick={() => onTogglePatientMode('adult')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer ${
                  patientMode === 'adult'
                    ? highContrast 
                      ? 'bg-yellow-400 text-black font-bold' 
                      : 'bg-slate-900 text-white shadow-xs'
                    : highContrast ? 'text-yellow-300/70 hover:text-yellow-300' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Adult Clinical Guidelines"
              >
                <User className="w-3 h-3" />
                <span className="hidden xs:inline">{t.adultMode}</span>
              </button>

              <button
                id="btn-mode-child"
                onClick={() => onTogglePatientMode('child')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer ${
                  patientMode === 'child'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : highContrast ? 'text-yellow-300/70 hover:text-yellow-300' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Pediatric Weight & Dose Scaling (<18y)"
              >
                <Baby className="w-3 h-3" />
                <span className="hidden xs:inline">{t.childMode}</span>
              </button>
            </div>

            {/* Language Selector */}
            <div className={`flex items-center rounded-full p-0.5 border text-xs shadow-2xs ${
              highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-slate-100 border-slate-200'
            }`}>
              <Globe className={`w-3.5 h-3.5 ml-1.5 mr-0.5 hidden sm:block ${
                highContrast ? 'text-yellow-400' : 'text-slate-400'
              }`} />
              {(['en', 'hi', 'ta'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  id={`btn-lang-${lang}`}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                    currentLang === lang
                      ? highContrast
                        ? 'bg-yellow-400 text-black font-bold'
                        : 'bg-white text-slate-900 shadow-xs font-bold'
                      : highContrast ? 'text-yellow-300/70 hover:text-yellow-300' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'தமிழ்'}
                </button>
              ))}
            </div>

            {/* Offline vs Online VLM Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              id="btn-toggle-engine"
              onClick={() => onToggleEngine(!useOfflineEngine)}
              title={useOfflineEngine ? "Using On-Device BLIP-2 LoRA (Offline Edge Engine)" : "Using Cloud Gemini VLM (Online Engine)"}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-2xs ${
                useOfflineEngine
                  ? highContrast 
                    ? 'bg-zinc-900 text-emerald-400 border-emerald-500'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : highContrast
                    ? 'bg-zinc-900 text-sky-400 border-sky-500'
                    : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
              }`}
            >
              {useOfflineEngine ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <WifiOff className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.edgeLoRA}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.cloudVLM}</span>
                </>
              )}
            </motion.button>

            {/* Outdoor High Contrast Toggle */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              id="btn-toggle-contrast"
              onClick={onToggleHighContrast}
              title={highContrast ? "Switch to Standard Clinical Theme" : "Toggle Outdoor High-Contrast Mode for Direct Sunlight"}
              className={`p-2 rounded-full border text-xs transition cursor-pointer shadow-2xs ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-500 font-bold'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-full border transition cursor-pointer ${
                highContrast ? 'bg-zinc-900 text-yellow-400 border-yellow-400' : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-200/70 overflow-x-auto text-xs font-medium no-scrollbar">
          {navItems.map((item) => (
            <TabButton
              key={item.id}
              id={`tab-${item.id}`}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              highContrast={highContrast}
            />
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`lg:hidden border-t px-4 py-3 space-y-1.5 overflow-hidden ${
              highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="grid grid-cols-2 gap-2 pb-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition ${
                    activeTab === item.id
                      ? highContrast
                        ? 'bg-yellow-400 text-black font-bold'
                        : 'bg-slate-900 text-white shadow-xs'
                      : highContrast
                        ? 'bg-zinc-900 text-yellow-300 hover:bg-zinc-800'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile VLM Engine Switcher */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
              highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200'
            }`}>
              <span className="font-semibold">VLM AI Engine:</span>
              <button
                onClick={() => onToggleEngine(!useOfflineEngine)}
                className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                  useOfflineEngine
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-600 text-white'
                }`}
              >
                {useOfflineEngine ? 'Offline Edge LoRA' : 'Online Gemini VLM'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

interface TabButtonProps {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  highContrast: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ id, active, onClick, icon, label, badge, highContrast }) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs uppercase tracking-wider font-semibold z-10 ${
        active
          ? highContrast
            ? 'text-black font-bold'
            : 'text-white'
          : highContrast
            ? 'text-yellow-300/70 hover:text-yellow-300 hover:bg-zinc-900'
            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeTabBadge"
          transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}
          className={`absolute inset-0 rounded-full shadow-sm -z-10 ${
            highContrast ? 'bg-yellow-400' : 'bg-slate-900'
          }`}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon}
        <span>{label}</span>
        {badge && (
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tight ${
            active 
              ? 'bg-white/20 text-white' 
              : highContrast ? 'bg-yellow-400/20 text-yellow-300' : 'bg-slate-200 text-slate-700'
          }`}>
            {badge}
          </span>
        )}
      </span>
    </button>
  );
};

function CrossIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 4v16" />
      <path d="M4 12h16" />
    </svg>
  );
}
