import React from 'react';
import { Layers, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MultiWoundItem, Language } from '../types';

interface MultiWoundScannerProps {
  wounds?: MultiWoundItem[];
  imageUrl?: string;
  currentLang: Language;
  highContrast?: boolean;
}

export const MultiWoundScanner: React.FC<MultiWoundScannerProps> = ({
  wounds,
  imageUrl,
  currentLang,
  highContrast
}) => {
  const defaultWounds: MultiWoundItem[] = [
    {
      id: 'w1',
      bbox: [15, 20, 60, 75], // x1, y1, x2, y2 %
      woundType: 'Laceration (Severe)',
      severity: 'Severe',
      priorityOrder: 1,
      firstAidSummary: {
        en: 'Priority 1: Apply direct firm pressure with sterile pad immediately.',
        hi: 'प्राथमिकता 1: मुख्य घाव पर तुरंत कसकर दबाव पट्टी बांधें।',
        ta: 'முன்னுரிமை 1: முக்கிய காயத்திற்கு அழுத்த கட்டு போடவும்.'
      }
    },
    {
      id: 'w2',
      bbox: [65, 30, 85, 55],
      woundType: 'Abrasion (Minor)',
      severity: 'Minor',
      priorityOrder: 2,
      firstAidSummary: {
        en: 'Priority 2: Wash with clean water once severe bleeding is controlled.',
        hi: 'प्राथमिकता 2: मुख्य घाव संभालने के बाद इसे साफ पानी से धोएं।',
        ta: 'முன்னுரிமை 2: இரத்தப்போக்கு நின்ற பின் சுத்தமான நீரால் கழுவவும்.'
      }
    }
  ];

  const items = wounds && wounds.length > 0 ? wounds : defaultWounds;

  const labels: Record<Language, { title: string; subtitle: string }> = {
    en: {
      title: 'Multi-Wound Spatial Scanner (Bounding Box Segmentation)',
      subtitle: 'Multi-lesion triage ranked by hemorrhagic severity & priority order'
    },
    hi: {
      title: 'बहु-घाव स्कैनिंग व प्राथमिकता निर्धारण',
      subtitle: 'गंभीरता व रक्तस्राव के आधार पर घावों की प्राथमिकता सूची'
    },
    ta: {
      title: 'பல காயங்கள் கண்டறிதல் மற்றும் வரிசைப்படுத்துதல்',
      subtitle: 'காயங்களின் தீவிரத்தின் அடிப்படையில் வரிசைப்படுத்தப்பட்ட பட்டியல்'
    }
  };

  const curr = labels[currentLang] || labels.en;

  return (
    <div className={`p-5 rounded-[24px] border space-y-4 shadow-sm ${
      highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-[#fdfcf8] border-[#e2dfd5] text-[#2c2c2c]'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#5A5A40]" />
          <div>
            <h4 className="font-serif font-bold text-sm tracking-wide text-[#5A5A40]">
              {curr.title}
            </h4>
            <p className="text-[11px] text-[#8e8b82]">
              {curr.subtitle}
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-[#5A5A40] text-white px-3 py-1 rounded-full">
          {items.length} Lesions Detected
        </span>
      </div>

      {/* Bounding Box Image Visualizer */}
      {imageUrl && (
        <div className="relative w-full max-w-md mx-auto aspect-video rounded-2xl overflow-hidden border border-[#e2dfd5] shadow-inner bg-black">
          <img src={imageUrl} alt="Multi wound scan" className="w-full h-full object-cover opacity-80" />
          
          {items.map((w) => {
            const [x1, y1, x2, y2] = w.bbox;
            const left = `${x1}%`;
            const top = `${y1}%`;
            const width = `${x2 - x1}%`;
            const height = `${y2 - y1}%`;
            const isP1 = w.priorityOrder === 1;

            return (
              <div
                key={w.id}
                className={`absolute border-2 rounded-lg flex items-start p-1 transition-all animate-pulse ${
                  isP1 ? 'border-red-500 bg-red-500/20' : 'border-amber-400 bg-amber-400/20'
                }`}
                style={{ left, top, width, height }}
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                  isP1 ? 'bg-red-600' : 'bg-amber-600'
                }`}>
                  P{w.priorityOrder}: {w.woundType}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Sequenced Priority Action List */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] block">
          Sequenced First Aid Action Plan:
        </span>

        {items.map((w) => (
          <div key={w.id} className="p-3.5 bg-white rounded-xl border border-[#e2dfd5] flex items-start gap-3">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${
              w.priorityOrder === 1 ? 'bg-red-600 animate-bounce' : 'bg-amber-600'
            }`}>
              #{w.priorityOrder}
            </span>

            <div className="text-xs space-y-0.5">
              <div className="flex items-center gap-2">
                <strong className="font-bold text-[#2c2c2c]">{w.woundType}</strong>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                  w.severity === 'Severe' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {w.severity}
                </span>
              </div>
              <p className="text-[#626262] leading-relaxed">
                {w.firstAidSummary[currentLang] || w.firstAidSummary.en}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
