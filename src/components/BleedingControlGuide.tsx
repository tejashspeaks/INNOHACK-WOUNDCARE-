import React, { useState, useEffect } from 'react';
import { ShieldAlert, Play, Pause, RotateCcw, Volume2, PhoneCall, ArrowRight, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { Language } from '../types';
import { speakText } from '../utils/speech';

interface BleedingControlGuideProps {
  currentLang: Language;
  onOpenEmergency108?: () => void;
  highContrast?: boolean;
}

export const BleedingControlGuide: React.FC<BleedingControlGuideProps> = ({
  currentLang,
  onOpenEmergency108,
  highContrast
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [timerSeconds, setTimerSeconds] = useState<number>(600); // 10 minutes default for direct pressure
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Handle narration on step change
  const playStepNarration = (stepNum: number) => {
    const text = getStepText(stepNum, currentLang);
    speakText(text, currentLang);
  };

  const getStepText = (stepNum: number, lang: Language): string => {
    if (stepNum === 1) {
      return lang === 'hi'
        ? 'चरण 1: सीधे दबाव डालें। साफ कपड़े या बाँधने वाले पैड को घाव पर कसकर 10 मिनट तक बिना उठाए दबाकर रखें।'
        : lang === 'ta'
        ? 'படி 1: நேரடியாக அழுத்தம் கொடுக்கவும். காயத்தின் மேல் சுத்தமான துணியை வைத்து 10 நிமிடங்கள் அழுத்தவும்.'
        : 'Step 1: Direct Firm Pressure. Press a clean sterile cloth or gloved hand directly onto bleeding wound firmly for 10 full minutes without lifting.';
    } else if (stepNum === 2) {
      return lang === 'hi'
        ? 'चरण 2: घाव वाले अंग को दिल के स्तर से ऊपर उठाएं ताकि रक्त का प्रवाह धीमा हो सके।'
        : lang === 'ta'
        ? 'படி 2: காயமடைந்த உறுப்பை இதயத்தின் மட்டத்திற்கு மேலே உயர்த்தவும்.'
        : 'Step 2: Limb Elevation. Raise the bleeding arm or leg above heart level while continuing firm direct pressure.';
    } else {
      return lang === 'hi'
        ? 'चरण 3: अर्टेरियल टूर्निकेट। घाव से 2 से 3 इंच ऊपर कसकर टूर्निकेट या चौड़ी पट्टी बांधें और मोड़ें जब तक खून बहना बंद न हो जाए।'
        : lang === 'ta'
        ? 'படி 3: டூர்னிகெட் கட்டவும். காயத்திற்கு 2-3 அங்குலம் மேலே டூர்னிகெட்டை இறுக்கமாக கட்டவும்.'
        : 'Step 3: Tourniquet Application. Apply tourniquet 2 to 3 inches ABOVE wound (not on joint). Tighten until bleeding stops completely. Note exact application time on patient forehead.';
    }
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  return (
    <div className={`p-6 rounded-[28px] border space-y-6 ${
      highContrast 
        ? 'bg-black text-yellow-300 border-yellow-400' 
        : 'bg-[#5A5A40] text-white border-[#4a4a34] shadow-xl'
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-lg animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-red-300 font-bold block">
              Emergency Resuscitation Protocol
            </span>
            <h3 className="text-xl font-serif font-bold text-white">
              Real-Time Bleeding Control Guide
            </h3>
          </div>
        </div>

        <button
          onClick={onOpenEmergency108}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow animate-pulse cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 108 Emergency</span>
        </button>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((step) => (
          <button
            key={step}
            onClick={() => {
              setCurrentStep(step);
              setIsTimerRunning(false);
              setTimerSeconds(step === 1 ? 600 : step === 2 ? 300 : 7200);
              playStepNarration(step);
            }}
            className={`p-3 rounded-2xl border text-xs font-bold text-center transition cursor-pointer flex flex-col items-center gap-1 ${
              currentStep === step
                ? 'bg-white text-[#5A5A40] border-white shadow-lg'
                : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest opacity-80">STEP 0{step}</span>
            <span className="text-sm font-serif">
              {step === 1 ? '1. Direct Pressure' : step === 2 ? '2. Limb Elevation' : '3. Tourniquet'}
            </span>
          </button>
        ))}
      </div>

      {/* Main Step Detail Card */}
      <div className="bg-black/30 p-6 rounded-2xl border border-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-yellow-300 uppercase tracking-widest">
            ACTIVE PROTOCOL • STEP {currentStep} OF 3
          </span>

          <button
            onClick={() => playStepNarration(currentStep)}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-yellow-300" />
            <span>Voice Guide ({currentLang.toUpperCase()})</span>
          </button>
        </div>

        {/* Step Explanation */}
        <p className="text-sm md:text-base leading-relaxed font-medium text-white/90">
          {getStepText(currentStep, currentLang)}
        </p>

        {/* Anatomical Diagram / Illustration */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          {currentStep === 1 && (
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-red-300 mx-auto animate-pulse">
                <span className="text-2xl font-bold">10 MIN</span>
              </div>
              <p className="text-xs text-red-200">
                Hold constant two-handed pressure on wound. Do NOT peek or lift gauze to check bleeding.
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-full bg-amber-600/30 border-2 border-amber-400 flex items-center justify-center text-amber-200 mx-auto">
                <span className="text-2xl font-bold">↑ HEARTS</span>
              </div>
              <p className="text-xs text-amber-100">
                Elevate affected arm or leg above chest level while continuing firm pressure.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-2 max-w-md">
              <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-left text-xs space-y-1">
                <strong className="text-yellow-300 block uppercase font-bold">
                  Tourniquet Placement Rules:
                </strong>
                <ol className="list-decimal pl-4 space-y-1 text-red-100">
                  <li>Place 2-3 inches ABOVE wound site on single bone (upper arm or thigh).</li>
                  <li>NEVER place tourniquet directly over a joint (elbow or knee).</li>
                  <li>Twist windlass rod until bright red spurting bleeding stops completely.</li>
                  <li>Lock windlass in place and write exact application time on patient (e.g. T 14:35).</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Step Countdown Timer */}
        <div className="bg-black/50 p-4 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-300 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold block">
                Pressure Maintenance Timer
              </span>
              <span className="text-2xl font-mono font-bold text-yellow-300">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTimerRunning ? 'Pause' : 'Start Timer'}</span>
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(currentStep === 1 ? 600 : currentStep === 2 ? 300 : 7200);
              }}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Step Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={currentStep === 1}
          onClick={() => {
            const next = Math.max(1, currentStep - 1);
            setCurrentStep(next);
            playStepNarration(next);
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
            currentStep === 1
              ? 'opacity-40 cursor-not-allowed bg-white/10 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white cursor-pointer'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        <button
          disabled={currentStep === 3}
          onClick={() => {
            const next = Math.min(3, currentStep + 1);
            setCurrentStep(next);
            playStepNarration(next);
          }}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition ${
            currentStep === 3
              ? 'opacity-40 cursor-not-allowed bg-white/10 text-white'
              : 'bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer font-bold'
          }`}
        >
          <span>Next Step</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
