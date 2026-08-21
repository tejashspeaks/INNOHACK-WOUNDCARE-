import React from 'react';
import { PhoneCall, ShieldAlert, X, HeartPulse, MapPin, AlertTriangle, Droplet, Ambulance, Phone, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  highContrast: boolean;
  currentLang?: Language;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, highContrast, currentLang = 'en' }) => {
  const t = {
    en: {
      header: 'RURAL EMERGENCY HOTLINES',
      sub: 'Immediate trauma transport, toxicology & health helpline for rural India',
      protocolTitle: 'Acute Trauma & Arterial Bleeding Protocol:',
      step1: 'Direct Occlusive Pressure: Press firmly on the bleeding epicenter with clean gauze or cloth for at least 10 continuous minutes without lifting to check.',
      step2: 'Limb Elevation: Elevate the wounded limb above chest level if no fracture is suspected to reduce hydrostatic pressure.',
      step3: 'Hospital Transport: Dispatch vehicle toward the nearest Secondary Care Trauma Hospital or PHC equipped with antivenom & blood bank.',
      returnBtn: 'Return to Assessment',
      callBtn: 'Call'
    },
    hi: {
      header: 'ग्रामीण आपातकालीन हेल्पलाइन नंबर',
      sub: 'तत्काल एम्बुलेंस, विष विज्ञान एवं प्राथमिक स्वास्थ्य सहायता',
      protocolTitle: 'गंभीर रक्तस्राव व आपातकालीन प्राथमिक प्रोटोकॉल:',
      step1: 'सीधा दबाव: साफ कपड़े या पट्टी से बहते खून पर लगातार 10 मिनट तक बिना हटाए मजबूती से दबाव बनाएं।',
      step2: 'अंग को ऊपर उठाएं: यदि हड्डी टूटने का संदेह न हो, तो घायल हाथ/पैर को दिल के स्तर से ऊपर उठाएं।',
      step3: 'अस्पताल परिवहन: तुरंत मरीज को निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) या ट्रॉमा अस्पताल ले जाएं।',
      returnBtn: 'वापस जांच स्क्रीन पर जाएं',
      callBtn: 'कॉल करें'
    },
    ta: {
      header: 'கிராமப்புற அவசர உதவி எண்கள்',
      sub: 'உடனடி ஆம்புலன்ஸ், நச்சு கட்டுப்பாடு மற்றும் மருத்துவ உதவி',
      protocolTitle: 'தீவிர இரத்தப்போக்கு அவசர முதலுதவி நெறிமுறை:',
      step1: 'நேரடி அழுத்தம்: இரத்தம் வழியும் இடத்தில் சுத்தமான துணியால் தொடர்ந்து 10 நிமிடங்கள் அழுத்திப் பிடிக்கவும்.',
      step2: 'உறுப்பை உயர்த்துதல்: எலும்பு முறிவு இல்லாவிடில் காயமடைந்த பகுதியை இதய மட்டத்திற்கு மேல் உயர்த்தவும்.',
      step3: 'மருத்துவமனை பயணம்: உடனடியாக அருகிலுள்ள ஆரம்ப சுகாதார மையம் அல்லது அவசர சிகிச்சை மையத்திற்கு செல்லவும்.',
      returnBtn: 'திரும்ப செல்லவும்',
      callBtn: 'அழைக்க'
    }
  }[currentLang];

  const hotlines = [
    {
      number: '108',
      title: { en: 'National Emergency Ambulance', hi: 'राष्ट्रीय आपातकालीन 108 एम्बुलेंस', ta: '108 தேசிய அவசர ஆம்புலன்ஸ்' }[currentLang],
      desc: { en: 'Free 24/7 Rural Emergency & Trauma Medical Transport', hi: 'निःशुल्क 24/7 ग्रामीण आपातकालीन व ट्रॉमा एम्बुलेंस सेवा', ta: 'இலவச 24/7 அவசர மருத்துவ ஊர்தி' }[currentLang],
      badge: { en: 'Immediate Dispatch', hi: 'तत्काल सेवा', ta: 'உடனடி சேவை' }[currentLang],
      primary: true
    },
    {
      number: '104',
      title: { en: 'State Health Advice & Triage Helpline', hi: 'राज्य स्वास्थ्य परामर्श व टेली-ट्राइएज हेल्पलाइन', ta: 'மாநில சுகாதார ஆலோசனை உதவி எண்' }[currentLang],
      desc: { en: 'Medical counseling, doctor on call, PHC stock verification', hi: 'डॉक्टर से परामर्श, स्वास्थ्य सलाह व प्राथमिक केंद्र जानकारी', ta: 'மருத்துவ ஆலோசனை மற்றும் உதவி' }[currentLang],
      badge: { en: 'Health Advice', hi: 'स्वास्थ्य परामर्श', ta: 'சுகாதார ஆலோசனை' }[currentLang]
    },
    {
      number: '1800 116 117',
      title: { en: 'National Poison Information Centre (AIIMS)', hi: 'राष्ट्रीय विष सूचना केंद्र (एम्स नई दिल्ली)', ta: 'தேசிய நச்சு தகவல் மையம் (AIIMS)' }[currentLang],
      desc: { en: 'Snakebite envenomation, agrochemical poison & toxin guidance', hi: 'सर्पदंश, कीटनाशक विष व रासायनिक विषाक्तता मार्गदर्शन', ta: 'பாம்பு கடி மற்றும் பூச்சிக்கொல்லி நச்சு வழிகாட்டுதல்' }[currentLang],
      badge: { en: 'Toxicology & Antivenom', hi: 'एंटीवेनम व विष नियंत्रण', ta: 'பாம்பு கடி விஷமுறிவு' }[currentLang]
    },
    {
      number: '102',
      title: { en: 'Janani Shishu Suraksha Karyakram (JSSK)', hi: 'जननी शिशु सुरक्षा कार्यक्रम (JSSK)', ta: 'தாய் சேய் நலம் அவசர ஊர்தி (JSSK)' }[currentLang],
      desc: { en: 'Maternal & Neonatal transport for rural mothers & infants', hi: 'गर्भवती महिलाओं व नवजात शिशुओं के लिए निःशुल्क परिवहन', ta: 'கர்ப்பிணிகள் மற்றும் பச்சிளம் குழந்தைகளுக்கான சேவை' }[currentLang],
      badge: { en: 'Maternal Care', hi: 'मातृ एवं शिशु देखभाल', ta: 'தாய் சேய் பராமரிப்பு' }[currentLang]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className={`w-full max-w-xl rounded-3xl border p-6 sm:p-7 space-y-5 shadow-2xl relative my-8 transition-colors ${
              highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-5 right-5 p-2 rounded-full cursor-pointer transition ${
                highContrast ? 'bg-zinc-800 text-yellow-300 hover:bg-zinc-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 border-b border-slate-200/80 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 animate-radar-pulse shadow-md shadow-red-600/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-red-600 uppercase tracking-wide">
                    {t.header}
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <p className="text-xs text-slate-500 dark:text-yellow-400/80">
                  {t.sub}
                </p>
              </div>
            </div>

            {/* Hotlines List */}
            <div className="space-y-3">
              {hotlines.map((hl) => (
                <div
                  key={hl.number}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    hl.primary
                      ? 'bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white border-red-600 shadow-md'
                      : highContrast
                        ? 'bg-zinc-900 border-yellow-400/60 text-yellow-300'
                        : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:bg-slate-100/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        hl.primary 
                          ? 'bg-white/20 text-white' 
                          : highContrast ? 'bg-yellow-400/20 text-yellow-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {hl.badge}
                      </span>
                      <span className="text-xs font-semibold">{hl.title}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-serif font-bold ${hl.primary ? 'text-white' : highContrast ? 'text-yellow-300' : 'text-slate-950'}`}>
                        {hl.number}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${hl.primary ? 'text-red-100' : 'text-slate-500'}`}>
                      {hl.desc}
                    </p>
                  </div>

                  <a
                    href={`tel:${hl.number.replace(/\s+/g, '')}`}
                    className={`font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0 ${
                      hl.primary
                        ? 'bg-white text-red-700 hover:bg-red-50'
                        : highContrast
                          ? 'bg-yellow-400 text-black font-bold hover:bg-yellow-300'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t.callBtn} {hl.number}</span>
                  </a>
                </div>
              ))}
            </div>

            {/* Life-Threatening Hemorrhage Triage Protocol */}
            <div className="space-y-2.5 text-xs">
              <h3 className="font-serif font-bold text-slate-800 dark:text-yellow-300 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-red-600" />
                <span>{t.protocolTitle}</span>
              </h3>

              <div className={`p-4 rounded-2xl border space-y-2 leading-relaxed text-xs ${
                highContrast ? 'bg-zinc-900 border-yellow-400/40 text-yellow-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-start gap-2.5">
                  <span className="bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>{t.step1}</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>{t.step2}</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p>{t.step3}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer Action */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className={`w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${
                  highContrast
                    ? 'bg-zinc-800 text-yellow-300 border-yellow-400/50 hover:bg-zinc-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {t.returnBtn}
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
