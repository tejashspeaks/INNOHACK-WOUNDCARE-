import React from 'react';
import { Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { WoundAgeData, Language } from '../types';

interface WoundAgeEstimatorProps {
  data?: WoundAgeData;
  currentLang: Language;
  highContrast?: boolean;
}

export const WoundAgeEstimator: React.FC<WoundAgeEstimatorProps> = ({
  data,
  currentLang,
  highContrast
}) => {
  const hours = data?.hoursOld ?? 4;
  const category = data?.category || (hours <= 6 ? 'Fresh (0-6h)' : hours <= 24 ? 'Recent (6-24h)' : 'Old (>24h)');
  const confidence = data?.confidenceScore || 91;

  const isOld = hours > 24;
  const isOver12h = hours >= 12;

  const labels: Record<Language, { title: string; freshMsg: string; warn12h: string; mandatoryDoctor: string }> = {
    en: {
      title: 'Estimated Wound Age (Elapsed Time)',
      freshMsg: 'FRESH WOUND (<6 Hours): Optimal golden window for primary suturing/closure.',
      warn12h: 'RECENT WOUND (>=12 Hours): Increased bacterial colonization. Primary closure contraindicated without surgical debridement.',
      mandatoryDoctor: 'MANDATORY DOCTOR VISIT (>24 Hours): Secondary intention healing required due to elevated infection risk.'
    },
    hi: {
      title: 'घाव का समय अनुमान (Wound Age)',
      freshMsg: 'ताजा घाव (<6 घंटे): टांके (Stitches) लगाने का सबसे उपयुक्त समय।',
      warn12h: '12+ घंटे पुराना घाव: बैक्टीरिया का खतरा अधिक। डॉक्टर की देखरेख आवश्यक।',
      mandatoryDoctor: 'अति आवश्यक अस्पताल दौरा (>24 घंटे): इन्फेक्शन का उच्च जोखिम।'
    },
    ta: {
      title: 'காயத்தின் வயது கணக்கீடு',
      freshMsg: 'புதிய காயம் (<6 மணி நேரம்): தையல் போட சரியான நேரம்.',
      warn12h: '12+ மணி நேர காயம்: பாக்டீரியா தொற்று அபாயம் அதிகம்.',
      mandatoryDoctor: 'கட்டாய மருத்துவமனை செல்லவும் (>24 மணி நேரம்).'
    }
  };

  const curr = labels[currentLang] || labels.en;

  return (
    <div className={`p-4 rounded-xl border space-y-3 ${
      highContrast 
        ? 'bg-black text-yellow-300 border-yellow-400' 
        : 'bg-[#fdfcf8] border-[#e2dfd5] text-[#2c2c2c]'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#5A5A40]" />
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#5A5A40]">
            {curr.title}
          </h4>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#5A5A40] bg-[#f0ede4] px-2.5 py-0.5 rounded-full border border-[#e2dfd5]">
          ~{hours} Hours Old ({confidence}% Conf.)
        </span>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#e2dfd5]">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
          hours <= 6 ? 'bg-emerald-100 text-emerald-800' : isOver12h ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {hours}h
        </div>

        <div className="text-xs">
          <strong className="block font-bold text-[#2c2c2c]">{category}</strong>
          <p className="text-[#626262] mt-0.5 leading-snug">
            {hours <= 6 ? curr.freshMsg : isOver12h ? curr.warn12h : curr.mandatoryDoctor}
          </p>
        </div>
      </div>
    </div>
  );
};
