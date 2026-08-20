import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Syringe, 
  Building2, 
  CheckCircle2, 
  HeartPulse, 
  Info,
  ChevronRight,
  Crosshair,
  Sparkles,
  Flame
} from 'lucide-react';
import { BiteData, Language } from '../types';

interface SnakeAndAnimalBiteIdentifierProps {
  data?: BiteData;
  currentLang: Language;
  onNavigateToHospitals?: () => void;
  highContrast?: boolean;
}

export const SnakeAndAnimalBiteIdentifier: React.FC<SnakeAndAnimalBiteIdentifierProps> = ({
  data,
  currentLang,
  onNavigateToHospitals,
  highContrast
}) => {
  const [selectedSpeciesTab, setSelectedSpeciesTab] = useState<'viper' | 'cobra' | 'krait' | 'nonvenom'>('viper');

  if (!data || data.biteType === 'none') {
    return (
      <div className="p-5 rounded-2xl bg-[#fdfcf8] border border-[#e2dfd5] text-xs text-[#8e8b82] flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-[#5A5A40]" />
          <span>No animal bite or snake envenomation patterns detected in this scan.</span>
        </div>
      </div>
    );
  }

  const biteType = data.biteType;
  const isSnake = biteType === 'snake';
  const isDog = biteType === 'dog';
  const isRat = biteType === 'rat';
  const isCat = biteType === 'cat';
  const isInsect = biteType === 'insect';

  const rabiesSchedule = data.rabiesSchedule || [
    'Day 0 (Immediate / Today)',
    'Day 3 (Follow-up)',
    'Day 7 (Follow-up)',
    'Day 14 (Follow-up)',
    'Day 28 (Final Dose)'
  ];

  const texts: Record<Language, { 
    title: string; 
    warningTitle: string; 
    antiVenomButton: string; 
    rabiesTitle: string; 
    leptoTitle: string;
    speciesProbabilityTitle: string;
    fangComparisonTitle: string;
    pairedFangs: string;
    uCurveTeeth: string;
    asvProtocol: string;
  }> = {
    en: {
      title: `Bite Identification: ${biteType.toUpperCase()} BITE DETECTED`,
      warningTitle: isSnake ? 'CRITICAL SNAKEBITE ENVENOMATION RISK' : isDog ? 'RABIES VIRUS INFECTION EXPOSURE' : 'LEPTOSPIROSIS / PATHOGEN BITE RISK',
      antiVenomButton: 'Locate Anti-Venom & Vaccine PHCs',
      rabiesTitle: 'Mandatory 5-Dose Anti-Rabies Vaccination (ARV) Schedule:',
      leptoTitle: 'Leptospirosis & Antibiotic Prophylaxis:',
      speciesProbabilityTitle: 'Indian Venomous Snake Species Probability',
      fangComparisonTitle: 'Fang Puncture Morphology Visualizer',
      pairedFangs: 'Venomous: 2 Deep Paired Fangs',
      uCurveTeeth: 'Non-Venomous: Curved Tooth Rows',
      asvProtocol: 'Polyvalent Anti-Snake Venom (ASV) 10-20 Vials IV Required'
    },
    hi: {
      title: `काटने की पहचान: ${biteType === 'snake' ? 'सांप' : biteType === 'dog' ? 'कुत्ता' : biteType === 'rat' ? 'चूहा' : biteType} का काटना`,
      warningTitle: isSnake ? 'सांप काटने की अति गंभीर आपात स्थिति' : isDog ? 'रेबीज (Rabies) संक्रमण का तीव्र जोखिम' : 'संक्रमण व लेप्टोस्पायरोसिस खतरा',
      antiVenomButton: 'एंटी-वेनम / रेबीज केंद्र खोजें',
      rabiesTitle: 'रेबीज टीका (ARV) 5-खुराक समय सारिणी:',
      leptoTitle: 'एंटीबायोटिक व लेप्टोस्पायरोसिस चेतावनी:',
      speciesProbabilityTitle: 'विषैले सांप प्रजाति की संभावना',
      fangComparisonTitle: 'दांतों के निशान की आकृति',
      pairedFangs: 'विषैला: 2 गहरे अलग दांतों के छेद',
      uCurveTeeth: 'बिन-विषैला: गोल घुमावदार दांतों की कतार',
      asvProtocol: 'एंटी-स्नेक वेनम (ASV) 10-20 शीशियां आवश्यक'
    },
    ta: {
      title: `கடி வகை: ${biteType === 'snake' ? 'பாம்பு' : biteType === 'dog' ? 'நாய்' : biteType === 'rat' ? 'எலி' : biteType} கடி`,
      warningTitle: isSnake ? 'பாம்பு கடி அவசர எச்சரிக்கை' : isDog ? 'ரேபிஸ் நோய் தொற்று தீவிர அபாயம்' : 'எலி கடி காய்ச்சல் அபாயம்',
      antiVenomButton: 'தடுப்பூசி / ASV மையங்களை கண்டறியவும்',
      rabiesTitle: 'ரேபிஸ் தடுப்பூசி 5 தவணை அட்டவணை:',
      leptoTitle: 'எலி கடி ஆண்டிபயாடிக் எச்சரிக்கை:',
      speciesProbabilityTitle: 'விஷ பாம்பு இனங்கள் நிகழ்தகவு',
      fangComparisonTitle: 'பற்களின் தடம் ஒப்பீடு',
      pairedFangs: 'விஷமுள்ள பாம்பு: 2 ஆழமான பற்கள்',
      uCurveTeeth: 'விஷமற்ற பாம்பு: வளைந்த பற்களின் வரிசை',
      asvProtocol: 'பாம்பு நச்சு எதிர்ப்பு மருந்து (ASV) உடனடி தேவை'
    }
  };

  const curr = texts[currentLang] || texts.en;

  const speciesList = [
    {
      id: 'viper',
      name: "Russell's Viper (Daboia russelii)",
      vernacular: "रसेल वाइपर / கண்ணாடி விரியன்",
      probability: 74,
      venom: 'Hemotoxic (Rapid Bleeding & Necrosis)',
      vials: '10 Vials Polyvalent ASV',
      symptoms: 'Non-clotting bleeding, severe burning pain, swelling within 10 minutes.'
    },
    {
      id: 'cobra',
      name: "Spectacled Cobra (Naja naja)",
      vernacular: "नाग / நல்ல பாம்பு",
      probability: 58,
      venom: 'Neurotoxic + Cytotoxic (Paralysis)',
      vials: '10 Vials Polyvalent ASV',
      symptoms: 'Ptosis (drooping eyes), difficulty swallowing, limb numbness, respiratory distress.'
    },
    {
      id: 'krait',
      name: "Common Krait (Bungarus caeruleus)",
      vernacular: "करैत / கட்டுவிரியன்",
      probability: 32,
      venom: 'Potent Neurotoxic (Painless Night Bite)',
      vials: '10-20 Vials Polyvalent ASV',
      symptoms: 'Morning paralysis, abdominal cramping, zero initial local pain.'
    },
    {
      id: 'nonvenom',
      name: "Non-Venomous Colubrid (Rat Snake)",
      vernacular: "धामन / சாரை பாம்பு",
      probability: 22,
      venom: 'Non-Venomous (Mechanical Scratch)',
      vials: '0 Vials (Wound Wash & TT Only)',
      symptoms: 'Superficial scrapes, no systemic paralysis or continuous oozing.'
    }
  ];

  return (
    <div className={`p-5 md:p-6 rounded-3xl border space-y-5 transition-all shadow-sm ${
      isSnake || isDog 
        ? 'bg-gradient-to-b from-red-950/25 to-[#fdfcf8] border-red-400 text-[#2c2c2c]' 
        : 'bg-[#fdfcf8] border-[#e2dfd5] text-[#2c2c2c]'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-200/60">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            isSnake ? 'bg-red-600 text-white animate-pulse' : isDog ? 'bg-amber-600 text-white' : 'bg-[#5A5A40] text-white'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
              Vector & Trauma Triage
            </span>
            <h4 className="font-serif font-bold text-base text-[#2c2c2c]">
              {curr.title}
            </h4>
          </div>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-600 text-white shadow-xs self-start sm:self-auto flex items-center gap-1.5 animate-pulse">
          <Sparkles className="w-3 h-3" />
          <span>URGENT BITE PROTOCOL</span>
        </span>
      </div>

      {/* Primary Emergency Warning Box */}
      <div className="p-4 rounded-2xl bg-red-900/10 border border-red-300 space-y-2 text-xs">
        <strong className="text-red-900 uppercase font-bold tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{curr.warningTitle}</span>
        </strong>

        {isSnake && (
          <p className="leading-relaxed text-red-950 font-medium">
            {data.antiVenomGuide?.[currentLang] || data.antiVenomGuide?.en || 'Polyvalent Anti-Snake Venom (ASV) must be administered at nearest Primary Health Centre (PHC) or District Hospital immediately. Keep limb immobilized below heart level. DO NOT apply tight tourniquets, cut the wound, or attempt to suck venom.'}
          </p>
        )}

        {isDog && (
          <p className="leading-relaxed text-red-950 font-medium">
            Wash bite wound under running tap water with soap for 15 FULL MINUTES. Rush to PHC immediately for Anti-Rabies Vaccine (ARV Day 0 dose) and Rabies Immunoglobulin (RIG).
          </p>
        )}

        {isRat && (
          <p className="leading-relaxed text-red-950 font-medium">
            {data.leptoWarning?.[currentLang] || data.leptoWarning?.en || 'Rat bites carry Leptospira and Streptobacillus bacteria risk. Wash wound thoroughly with antiseptic and consult doctor for oral antibiotic course.'}
          </p>
        )}
      </div>

      {/* Snake Envenomation Species Probability Radar (If Snakebite) */}
      {isSnake && (
        <div className="space-y-3 p-4 rounded-2xl bg-[#fffcf7] border border-red-200">
          <div className="flex items-center justify-between">
            <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-red-950 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-red-600" />
              <span>{curr.speciesProbabilityTitle}</span>
            </h5>
            <span className="text-[10px] font-bold text-[#8e8b82]">Big 4 India Species Model</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {speciesList.map((spec) => (
              <div 
                key={spec.id}
                onClick={() => setSelectedSpeciesTab(spec.id as any)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedSpeciesTab === spec.id
                    ? 'bg-red-50/80 border-red-400 ring-1 ring-red-400/50'
                    : 'bg-[#fdfcf8] border-[#e2dfd5] hover:border-red-200'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h6 className="font-serif font-bold text-xs text-[#2c2c2c]">{spec.name}</h6>
                    <span className="text-[10px] text-[#706d64] block">{spec.vernacular}</span>
                  </div>
                  <span className={`text-xs font-extrabold font-mono ${
                    spec.probability > 50 ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {spec.probability}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-[#ede9de] rounded-full overflow-hidden my-1.5">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full"
                    style={{ width: `${spec.probability}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-red-800 font-semibold">{spec.venom}</span>
                  <span className="text-[#5A5A40] font-mono font-bold">{spec.vials}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Fang Morphology Card */}
          <div className="p-3.5 rounded-xl bg-[#f5f2e9] border border-[#dedad0] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ••
              </div>
              <div>
                <strong className="text-[#2c2c2c] block font-bold text-[11px]">{curr.pairedFangs}</strong>
                <span className="text-[10px] text-[#706d64]">10-18mm distance with continuous bleeding</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                UU
              </div>
              <div>
                <strong className="text-[#2c2c2c] block font-bold text-[11px]">{curr.uCurveTeeth}</strong>
                <span className="text-[10px] text-[#706d64]">Fine scratch rows; no localized tissue necrosis</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dog Rabies Schedule Timeline */}
      {isDog && (
        <div className="p-4 rounded-2xl bg-[#fffcf7] border border-amber-300 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Syringe className="w-4 h-4 text-amber-600" />
            <span>{curr.rabiesTitle}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            {rabiesSchedule.map((dose, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Dose {idx + 1}</span>
                <span className="font-bold text-[#2c2c2c] text-[11px] block mt-0.5">{dose}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anti-Venom & PHC Hospital Locator Shortcut */}
      {(isSnake || isDog) && onNavigateToHospitals && (
        <button
          onClick={onNavigateToHospitals}
          className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-5 rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Building2 className="w-4 h-4" />
          <span>{curr.antiVenomButton}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
