import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Info, Eye } from 'lucide-react';
import { ForeignObjectData, Language } from '../types';

interface ForeignObjectDetectorProps {
  data?: ForeignObjectData;
  currentLang: Language;
  highContrast?: boolean;
}

export const ForeignObjectDetector: React.FC<ForeignObjectDetectorProps> = ({
  data,
  currentLang,
  highContrast
}) => {
  if (!data) return null;

  const isDeep = data.depth === 'deep';
  const objectType = data.objectType || 'foreign debris';

  const texts: Record<Language, { title: string; warningTitle: string; deepWarning: string; superficialWarning: string; rationaleTitle: string; rationaleText: string }> = {
    en: {
      title: 'Foreign Object Detection Analysis',
      warningTitle: isDeep ? 'CRITICAL WARNING: DO NOT REMOVE EMBEDDED OBJECT!' : 'SUPERFICIAL DEBRIS DETECTED',
      deepWarning: `Embedded object detected (${objectType.toUpperCase()}). LEAVE OBJECT IN PLACE. Do NOT pull, twist, or extract object.`,
      superficialWarning: `Superficial debris detected (${objectType.toUpperCase()}). Lightly irrigate with clean saline/water. Do not scrub.`,
      rationaleTitle: 'Medical Rationale & Physiological Risk',
      rationaleText: isDeep 
        ? 'Deeply embedded objects act as a mechanical plug against severed arteries and deep tissue vessels. Removing the object relieves pressure, causing sudden, uncontrollable arterial hemorrhage and irreversible tissue damage.' 
        : 'Superficial debris should be gently rinsed to prevent bacterial inoculation. If grit or glass remains stuck, seek medical assistance for sterile debridement.'
    },
    hi: {
      title: 'विदेशी पदार्थ (Foreign Object) जांच रिपोर्ट',
      warningTitle: isDeep ? 'अति आवश्यक चेतावनी: फंसे हुए पदार्थ को न निकालें!' : 'घाव पर बाहरी धूल/शीशा पाया गया',
      deepWarning: `घाव के अंदर पदार्थ (${objectType}) फंसा हुआ है। इसे खींचकर या दबाकर बाहर न निकालें।`,
      superficialWarning: `घाव की सतह पर हल्का कचरा/कंकड़ है। साफ उबले पानी से बहने दें, रगड़ें नहीं।`,
      rationaleTitle: 'चिकित्सकीय कारण (Medical Reason)',
      rationaleText: isDeep 
        ? 'गहरा फंसा पदार्थ कटी हुई रक्त धमनियों पर प्लग की तरह काम करता है। इसे खींचने से भारी आंतरिक रक्तस्राव शुरू हो सकता है जो जानलेवा हो सकता है।' 
        : 'सतही कचरे को धीरे से पानी से धोएं ताकि संक्रमण न फैले।'
    },
    ta: {
      title: 'வெளிப்புற பொருள் கண்டறிதல் அறிக்கை',
      warningTitle: isDeep ? 'எச்சரிக்கை: காயத்தில் உள்ள பொருளை வெளியே எடுக்க வேண்டாம்!' : 'மேலோட்டமான தூசிகள் கண்டறியப்பட்டது',
      deepWarning: `காயத்திற்குள் பொருள் (${objectType}) உள்ளது. அதை வெளியில் இழுக்க வேண்டாம்.`,
      superficialWarning: `காயத்தின் மேல் பகுதியில் தூசிகள் உள்ளன. சுத்தமான நீரால் கழுவவும்.`,
      rationaleTitle: 'மருத்துவக் காரணம்',
      rationaleText: isDeep 
        ? 'ஆழமாக உள்ள பொருட்கள் இரத்தக் குழாய்களை அடைத்துக் கொண்டிருக்கும். அதை வெளியே எடுத்தால் அதிக இரத்தப்போக்கு ஏற்படும்.' 
        : 'மேலோட்டமான தூசிகளை தண்ணீரில் மெதுவாகக் கழுவ வேண்டும்.'
    }
  };

  const curr = texts[currentLang] || texts.en;

  return (
    <div className={`p-5 rounded-2xl border space-y-4 ${
      isDeep 
        ? 'bg-red-950/20 border-red-500 text-red-100' 
        : 'bg-[#fdfcf8] border-[#e2dfd5] text-[#2c2c2c]'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className={`w-5 h-5 ${isDeep ? 'text-red-500' : 'text-[#5A5A40]'}`} />
          <h4 className="font-serif font-bold text-sm tracking-wide">
            {curr.title}
          </h4>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
          data.detected 
            ? isDeep ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-amber-100 text-amber-800 border-amber-300'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
        }`}>
          {data.detected ? `${data.depth?.toUpperCase()} ${objectType.toUpperCase()}` : 'NO FOREIGN OBJECT'}
        </span>
      </div>

      {data.detected ? (
        <>
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isDeep ? 'bg-red-900/40 border-red-500 text-white' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <strong className="block text-xs uppercase font-bold tracking-wider mb-1 text-red-300">
                {curr.warningTitle}
              </strong>
              <p className="text-xs leading-relaxed font-medium">
                {isDeep ? curr.deepWarning : curr.superficialWarning}
              </p>
            </div>
          </div>

          {/* Medical Rationale Explanation Box */}
          <div className="p-3.5 rounded-xl bg-black/20 border border-white/10 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Info className="w-4 h-4" />
              <span>{curr.rationaleTitle}</span>
            </div>
            <p className="text-[#d0d0d0] leading-relaxed">
              {curr.rationaleText}
            </p>
          </div>

          {/* Stabilization First Aid */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8b82] block">
              {isDeep ? 'Ring-Pad Stabilization Protocol:' : 'Cleansing Protocol:'}
            </span>
            <ul className="text-xs space-y-1.5 list-disc pl-5">
              {isDeep ? (
                <>
                  <li>Build a ring-pad (doughnut bandage) around the protruding object base.</li>
                  <li>Bandage securely OVER the ring-pad without pressing down on the object.</li>
                  <li>Immobilize the limb and transport patient immediately to hospital.</li>
                </>
              ) : (
                <>
                  <li>Flush with sterile saline or clean lukewarm water for 3 to 5 minutes.</li>
                  <li>Do NOT use tweezers unless instruments are flame-sterilized.</li>
                  <li>Apply antiseptic ointment and sterile gauze bandage.</li>
                </>
              )}
            </ul>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>VLM visual analysis detected no embedded glass, metal, wood, or gravel debris in wound bed.</span>
        </div>
      )}
    </div>
  );
};
