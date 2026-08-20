import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ScarRiskData, Language } from '../types';

interface ScarRiskPredictorProps {
  data?: ScarRiskData;
  currentLang: Language;
  highContrast?: boolean;
}

export const ScarRiskPredictor: React.FC<ScarRiskPredictorProps> = ({
  data,
  currentLang,
  highContrast
}) => {
  const score = data?.scorePercent ?? 65;
  const category = data?.riskCategory || (score > 70 ? 'High' : score > 35 ? 'Medium' : 'Low');
  const fadeTime = data?.estimatedFadeTime || '6 - 12 Months';

  const labels: Record<Language, { title: string; recsTitle: string; fadeTitle: string }> = {
    en: {
      title: 'Scar Risk & Aesthetic Recovery Predictor',
      recsTitle: 'Dermatological Anti-Scar Protocol:',
      fadeTitle: 'Est. Scar Fading Timeline:'
    },
    hi: {
      title: 'निशान/दाग (Scar) का जोखिम अनुमान',
      recsTitle: 'त्वचा के निशान कम करने के उपाय:',
      fadeTitle: 'निशान हल्का होने की समयावधि:'
    },
    ta: {
      title: 'தழும்பு உருவாகும் ஆபத்து கணிப்பு',
      recsTitle: 'தழும்பை தடுக்கும் வழிமுறைகள்:',
      fadeTitle: 'தழும்பு மறையும் காலம்:'
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
          <Sparkles className="w-4 h-4 text-[#5A5A40]" />
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#5A5A40]">
            {curr.title}
          </h4>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
          category === 'High' 
            ? 'bg-amber-100 text-amber-900 border-amber-300' 
            : category === 'Medium' 
            ? 'bg-blue-100 text-blue-900 border-blue-300' 
            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
        }`}>
          {category.toUpperCase()} SCAR RISK ({score}%)
        </span>
      </div>

      {/* Progress Gauge */}
      <div className="space-y-1">
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              category === 'High' ? 'bg-amber-500' : category === 'Medium' ? 'bg-blue-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        <div className="bg-white p-2.5 rounded-lg border border-[#e2dfd5]">
          <span className="text-[10px] uppercase font-bold text-[#8e8b82] block">{curr.recsTitle}</span>
          <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[#2c2c2c]">
            {data?.recommendations?.[0]?.[currentLang] || data?.recommendations?.[0]?.en ? (
              data.recommendations.map((rec, i) => (
                <li key={i}>{rec[currentLang] || rec.en}</li>
              ))
            ) : (
              <>
                <li>Apply silicone gel sheeting once wound closes.</li>
                <li>Massage Vitamin E oil daily; apply SPF 50+ sunblock.</li>
              </>
            )}
          </ul>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-[#e2dfd5] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8e8b82] block">{curr.fadeTitle}</span>
            <span className="text-sm font-serif font-bold text-[#5A5A40] mt-1 block">
              {fadeTime}
            </span>
          </div>
          <span className="text-[10px] text-[#8e8b82] mt-1">
            *Avoid picking scabs to minimize hyperpigmentation.
          </span>
        </div>
      </div>
    </div>
  );
};
