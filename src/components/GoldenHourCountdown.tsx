import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, ShieldAlert, PhoneCall, Volume2, VolumeX, Send, RefreshCw, CheckCircle } from 'lucide-react';
import { Language, MultilingualText } from '../types';
import { speakText } from '../utils/speech';

interface GoldenHourCountdownProps {
  currentLang: Language;
  highContrast?: boolean;
  emergencyPhone?: string;
  onTriggerSmsAlert?: () => void;
  onOpenEmergency108?: () => void;
  woundType?: string;
}

export const GoldenHourCountdown: React.FC<GoldenHourCountdownProps> = ({
  currentLang,
  highContrast,
  emergencyPhone = '108',
  onTriggerSmsAlert,
  onOpenEmergency108,
  woundType = 'Severe Injury'
}) => {
  const TOTAL_SECONDS = 60 * 60; // 60 minutes
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [hasAlarmTriggered, setHasAlarmTriggered] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [smsSent, setSmsSent] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Live countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  // Audio Beeper at 10 minutes remaining
  useEffect(() => {
    if (secondsLeft <= 600 && secondsLeft > 0 && !hasAlarmTriggered && !isMuted) {
      setHasAlarmTriggered(true);
      playAlarmSound();
      if (onTriggerSmsAlert && !smsSent) {
        onTriggerSmsAlert();
        setSmsSent(true);
      }
    }
  }, [secondsLeft, hasAlarmTriggered, isMuted]);

  const playAlarmSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      audioContextRef.current = new AudioCtx();
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);

      // Voice warning in selected language
      const msg = currentLang === 'hi' 
        ? 'चेतावनी! गोल्डन आवर के केवल 10 मिनट बचे हैं। तुरंत प्राथमिक स्वास्थ्य केंद्र जाएं।' 
        : currentLang === 'ta' 
        ? 'எச்சரிக்கை! கோல்டன் ஹவர் முடிய 10 நிமிடங்கள் மட்டுமே உள்ளது. உடனடியாக மருத்துவமனைக்கு செல்லவும்.' 
        : 'URGENT MEDICAL WARNING! Only 10 minutes remaining in the Golden Hour. Rush to hospital immediately!';
      speakText(msg, currentLang);
    } catch (e) {
      console.warn('Audio alarm playback failed', e);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progressPercent = Math.max(0, (secondsLeft / TOTAL_SECONDS) * 100);

  // Status tiers
  const isCritical = secondsLeft <= 1800; // 30 minutes
  const isUrgentAlarm = secondsLeft <= 600; // 10 minutes

  const messages: Record<Language, { title: string; desc: string; urge: string }> = {
    en: {
      title: isUrgentAlarm 
        ? 'CRITICAL GOLDEN HOUR ALARM: <10 MIN REMAINING' 
        : isCritical 
        ? 'CRITICAL GOLDEN HOUR COUNTDOWN: <30 MIN REMAINING' 
        : 'GOLDEN HOUR EMERGENCY TIMER ACTIVE',
      desc: isUrgentAlarm 
        ? 'Primary trauma window closing! Reach emergency room or PHC with anti-shock transport immediately.' 
        : isCritical 
        ? 'Tissue ischemia risk escalating. Maintain direct compression and elevate limb while traveling to medical facility.' 
        : 'The first 60 minutes after severe trauma are vital for organ perfusion and hemorrhage control.',
      urge: isUrgentAlarm ? 'STAGE 3: EMERGENCY RESUSCITATION WINDOW' : isCritical ? 'STAGE 2: CRITICAL TRANSPORT MODE' : 'STAGE 1: ACTIVE STABILIZATION'
    },
    hi: {
      title: isUrgentAlarm 
        ? 'अति गंभीर चेतावनी: केवल 10 मिनट शेष' 
        : isCritical 
        ? 'गोल्डन आवर चेतावनी: 30 मिनट से कम समय' 
        : 'गोल्डन आवर आपातकालीन टाइमर',
      desc: isUrgentAlarm 
        ? 'तुरंत निकटतम अस्पताल या PHC पहुंचे। एम्बुलेंस में मरीज को सीधा रखें।' 
        : isCritical 
        ? 'रक्तस्राव रोकने के लिए घाव को दबाकर रखें और एम्बुलेंस में अस्पताल की ओर बढ़ें।' 
        : 'गंभीर चोट के बाद पहले 60 मिनट मरीज की जान बचाने के लिए सबसे महत्वपूर्ण होते हैं।',
      urge: isUrgentAlarm ? 'चरण 3: आपातकालीन एम्बुलेंस मोड' : isCritical ? 'चरण 2: गंभीर अस्पताल मार्ग' : 'चरण 1: घाव नियंत्रण'
    },
    ta: {
      title: isUrgentAlarm 
        ? 'ஆபத்தான நிலை: 10 நிமிடங்கள் மட்டுமே உள்ளது' 
        : isCritical 
        ? 'கோல்டன் ஹவர் எச்சரிக்கை: 30 நிமிடங்களுக்கு கீழ்' 
        : 'கோல்டன் ஹவர் அவசர நேரக்காட்டி',
      desc: isUrgentAlarm 
        ? 'உடனடியாக அருகில் உள்ள ஆரம்ப சுகாதார நிலையத்திற்கு செல்லவும்.' 
        : isCritical 
        ? 'இரத்தப்போக்கை கட்டுப்படுத்தி உடனடியாக மருத்துவமனைக்கு செல்லவும்.' 
        : 'காயமடைந்த முதல் 60 நிமிடங்கள் உயிரைக் காப்பாற்ற மிகவும் முக்கியமானது.',
      urge: isUrgentAlarm ? 'நிலை 3: அவசர சிகிச்சை நிலை' : isCritical ? 'நிலை 2: பயண நிலை' : 'நிலை 1: முதலுதவி நிலை'
    }
  };

  const curr = messages[currentLang] || messages.en;

  return (
    <div
      id="golden-hour-countdown-container"
      className={`p-6 rounded-[24px] border transition-all duration-500 shadow-lg ${
        isUrgentAlarm
          ? 'bg-red-950 text-red-100 border-red-500 animate-pulse'
          : isCritical
          ? 'bg-[#3b0909] text-white border-red-600'
          : highContrast
          ? 'bg-black text-yellow-300 border-yellow-400'
          : 'bg-[#5A5A40] text-white border-[#4a4a34]'
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Badge & Timer */}
        <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-start">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
            isUrgentAlarm ? 'bg-red-600 text-white animate-bounce' : isCritical ? 'bg-red-700 text-white' : 'bg-white/10 text-white'
          }`}>
            <Clock className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                isUrgentAlarm ? 'bg-red-500 text-white animate-pulse' : isCritical ? 'bg-red-800 text-white' : 'bg-white/20 text-white'
              }`}>
                {curr.urge}
              </span>
              {isCritical && (
                <span className="text-xs font-bold text-red-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Critical Red Zone
                </span>
              )}
            </div>

            <h3 className="text-base font-serif font-bold tracking-tight mt-1">
              {curr.title}
            </h3>
            <p className="text-xs opacity-90 mt-0.5 max-w-md">
              {curr.desc}
            </p>
          </div>
        </div>

        {/* Right Side: Big Digital Clock Display */}
        <div className="flex flex-col items-center md:items-end w-full md:w-auto">
          <div className="font-mono font-bold text-4xl md:text-5xl tracking-wider text-yellow-300 bg-black/40 px-6 py-2 rounded-2xl border border-white/10 shadow-inner flex items-center gap-2">
            <span>{String(minutes).padStart(2, '0')}</span>
            <span className="animate-pulse text-red-400">:</span>
            <span>{String(secs).padStart(2, '0')}</span>
            <span className="text-xs text-white/70 uppercase tracking-widest font-sans ml-1">MIN</span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setIsActive(!isActive)}
              className="text-[11px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-white font-bold transition flex items-center gap-1 cursor-pointer"
            >
              {isActive ? 'Pause Timer' : 'Resume Timer'}
            </button>
            <button
              onClick={() => {
                setSecondsLeft(TOTAL_SECONDS);
                setIsActive(true);
                setHasAlarmTriggered(false);
              }}
              className="text-[11px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-white font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Reset 60m
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-[11px] bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-white font-bold transition cursor-pointer"
              title="Mute Sound"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="mt-5 w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/10">
        <div
          className={`h-full transition-all duration-1000 ${
            isUrgentAlarm ? 'bg-red-500' : isCritical ? 'bg-amber-500' : 'bg-emerald-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quick Action Footer Buttons */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-white/80">
          <AlertTriangle className="w-4 h-4 text-yellow-300 shrink-0" />
          <span>Injury: <strong className="text-white">{woundType}</strong> • Emergency Protocol Active</span>
        </div>

        <div className="flex items-center gap-2">
          {onTriggerSmsAlert && (
            <button
              onClick={onTriggerSmsAlert}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                smsSent ? 'bg-emerald-700 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {smsSent ? <CheckCircle className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              <span>{smsSent ? 'SMS Dispatched' : 'Alert Caretaker SMS'}</span>
            </button>
          )}

          <button
            onClick={onOpenEmergency108}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition cursor-pointer animate-pulse"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 108 Ambulance</span>
          </button>
        </div>
      </div>
    </div>
  );
};
