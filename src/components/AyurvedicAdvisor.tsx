import React, { useState } from 'react';
import { Leaf, BookOpen, AlertCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { AyurvedicRemedy, Language, WoundType, VLMHomeRemedy } from '../types';

interface AyurvedicAdvisorProps {
  remedies?: AyurvedicRemedy[];
  vlmHomeRemedy?: VLMHomeRemedy;
  woundType?: WoundType;
  currentLang: Language;
  highContrast?: boolean;
}

export const AyurvedicAdvisor: React.FC<AyurvedicAdvisorProps> = ({
  remedies,
  vlmHomeRemedy,
  woundType = 'Abrasion',
  currentLang,
  highContrast
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Default Remedies database matched against Sushruta Samhita classical texts
  const defaultRemedies: Record<string, AyurvedicRemedy> = {
    Abrasion: {
      remedyName: {
        en: 'Haridra (Turmeric) & Nimba (Neem) Antimicrobial Paste',
        hi: 'हरिद्रा (हल्दी) और निम्ब (नीम) जीवाणुरोधी लेप',
        ta: 'மஞ்சள் மற்றும் வேப்பிலை கிருமி நாசினி பூச்சு'
      },
      ingredients: [
        { en: 'Pure Raw Organic Turmeric Powder (Haridra)', hi: 'शुद्ध कच्ची हल्दी पाउडर', ta: 'தூய மஞ்சள் தூள்' },
        { en: 'Fresh Neem Leaves Paste (Nimba Swarasa)', hi: 'ताजा नीम की पत्तियों का पेस्ट', ta: 'பசுமையான வேப்பிலை கூழ்' },
        { en: 'Pure Sesame Oil (Tila Taila)', hi: 'शुद्ध तिल का तेल', ta: 'நல்லெண்ணெய்' }
      ],
      applicationMethod: {
        en: 'Mix equal parts turmeric and neem leaf paste with 3 drops of warm sesame oil. Apply gently over cleaned abrasion twice daily.',
        hi: 'हल्दी और नीम के पेस्ट को तिल के तेल में मिलाकर घाव पर दिन में दो बार लगाएं।',
        ta: 'மஞ்சள் மற்றும் வேப்பிலை கூழை நல்லெண்ணெயில் கலந்து காயத்தில் தடவவும்.'
      },
      classicalSource: 'Sushruta Samhita • Vrana Chikitsa (Ch. 22)'
    },
    Burn: {
      remedyName: {
        en: 'Ghritkumari (Aloe Vera) & Narikela (Coconut Oil) Cooling Application',
        hi: 'घृतकुमारी (एलोवेरा) और नारियल तेल शीतलीकरण लेप',
        ta: 'கற்றாழை மற்றும் தேங்காய் எண்ணெய் குளிர்ச்சி பூச்சு'
      },
      ingredients: [
        { en: 'Fresh Aloe Vera Inner Gel (Ghritkumari Maja)', hi: 'ताजा एलोवेरा जेल', ta: 'பசுமையான கற்றாழை சோறு' },
        { en: 'Cold-Pressed Virgin Coconut Oil (Narikela Taila)', hi: 'नारियल तेल', ta: 'தேங்காய் எண்ணெய்' }
      ],
      applicationMethod: {
        en: 'Rinse burn with cool water. Coat immediately with fresh aloe gel blended with virgin coconut oil to soothe thermal inflammation.',
        hi: 'जले हुए स्थान पर ठंडा पानी डालें और फिर एलोवेरा जेल व नारियल तेल मिलाकर लगाएं।',
        ta: 'காயத்தை குளிர்ந்த நீரால் கழுவி கற்றாழை சோறு மற்றும் தேங்காய் எண்ணெய் தடவவும்.'
      },
      classicalSource: 'Ashtanga Hridayam • Agnidagdha Chikitsa'
    },
    Contusion: {
      remedyName: {
        en: 'Karpura (Camphor) & Taila Cold Compress for Hematoma',
        hi: 'कर्पूर (कपूर) और ठंडी सेक की मालिश',
        ta: 'கற்பூரம் மற்றும் குளிர்ந்த ஒத்தடம்'
      },
      ingredients: [
        { en: 'Natural Camphor (Bhimseni Karpura)', hi: 'भीमसेनी प्राकृतिक कपूर', ta: 'பச்சைக் கற்பூரம்' },
        { en: 'Mustard or Coconut Base Oil', hi: 'सरसों या नारियल तेल', ta: 'கடுகு அல்லது தேங்காய் எண்ணெய்' }
      ],
      applicationMethod: {
        en: 'Dissolve pinch of natural camphor in warm oil. Allow to cool and apply as light compress around blunt contusion without heavy rubbing.',
        hi: 'तेल में कपूर घोलकर चोट के आसपास हल्के हाथ से लगाएं और ठंडा सेक दें।',
        ta: 'எண்ணெயில் கற்பூரம் கலந்து காயத்தை சுற்றி மெதுவாக பூசவும்.'
      },
      classicalSource: 'Charaka Samhita • Shothahara Chikitsa'
    },
    Laceration: {
      remedyName: {
        en: 'Madhu (Raw Honey) & Haridra Antibacterial Dressing',
        hi: 'मधु (शहद) और हल्दी जीवाणुरोधी ड्रेसिंग',
        ta: 'தேன் மற்றும் மஞ்சள் கிருமி நாசினி கட்டு'
      },
      ingredients: [
        { en: 'Raw Unfiltered Honey (Madhu)', hi: 'शुद्ध प्राकृतिक शहद', ta: 'தூய்மையான இயற்கை தேன்' },
        { en: 'Turmeric (Haridra)', hi: 'हल्दी पाउडर', ta: 'மஞ்சள் தூள்' }
      ],
      applicationMethod: {
        en: 'After stopping bleeding, dab raw unpasteurized honey mixed with turmeric over laceration edges. Cover with sterile gauze.',
        hi: 'रक्तस्राव रुकने के बाद घाव के किनारों पर शहद और हल्दी का लेप लगाकर पट्टी बांधें।',
        ta: 'இரத்தம் நின்ற பின் தேன் மற்றும் மஞ்சள் கலந்து காயத்தில் தடவி கட்டு போடவும்.'
      },
      classicalSource: 'Sushruta Samhita • Sadyovrana Adhyaya'
    }
  };

  const remedyKey = Object.keys(defaultRemedies).find((k) => woundType.toLowerCase().includes(k.toLowerCase())) || 'Abrasion';
  const activeRemedy: AyurvedicRemedy = vlmHomeRemedy ? {
    remedyName: { en: vlmHomeRemedy.name, hi: vlmHomeRemedy.name, ta: vlmHomeRemedy.name },
    ingredients: vlmHomeRemedy.ingredients.map(ing => ({ en: ing, hi: ing, ta: ing })),
    applicationMethod: { en: vlmHomeRemedy.method, hi: vlmHomeRemedy.method, ta: vlmHomeRemedy.method },
    classicalSource: vlmHomeRemedy.source_citation || 'Classical Ayurvedic Texts & Clinical Guidelines'
  } : (remedies?.[0] || defaultRemedies[remedyKey] || defaultRemedies.Abrasion);

  const labels: Record<Language, { title: string; subtitle: string; source: string; disclaimer: string }> = {
    en: {
      title: 'Ayurvedic Natural Home Remedies (Classical Veda Protocol)',
      subtitle: 'Validated Against Ancient Indian Medical Texts',
      source: 'Classical Source:',
      disclaimer: vlmHomeRemedy?.disclaimer || 'DISCLAIMER: Ayurvedic home remedies are supplementary herbal applications intended for mild comfort. They do NOT replace emergency clinical care, tetanus prophylaxis, or antibiotic treatment.'
    },
    hi: {
      title: 'आयुर्वेदिक प्राकृतिक घरेलू उपचार (संहिता आधारित)',
      subtitle: 'प्राचीन भारतीय चिकित्सा ग्रंथों द्वारा प्रमाणित',
      source: 'शास्त्रीय स्रोत:',
      disclaimer: 'अस्वीकरण: आयुर्वेदिक घरेलू उपचार केवल पूरक देखभाल के लिए हैं। ये आपातकालीन डॉक्टर परामर्श, टिटनेस के टीके या एंटीबायोटिक का विकल्प नहीं हैं।'
    },
    ta: {
      title: 'ஆயுர்வேத இயற்கை முதலுதவி வழிமுறைகள்',
      subtitle: 'பண்டைய மருத்துவ நூல்களின் அடிப்படையில் சான்றளிக்கப்பட்டவை',
      source: 'மூல நூல்:',
      disclaimer: 'பொறுப்புத் துறப்பு: ஆயுர்வேத மூலிகை சிகிச்சைகள் துணைப் பயன்பாட்டிற்கு மட்டுமே. இவை அவசர மருத்துவ சிகிச்சைக்கு மாற்றாகாது.'
    }
  };

  const curr = labels[currentLang] || labels.en;

  return (
    <div className={`rounded-2xl border transition-all ${
      highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-[#f7f5f0] border-[#e2dfd5] text-[#2c2c2c]'
    }`}>
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2e7d32] text-white flex items-center justify-center font-bold">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-[#2e7d32] flex items-center gap-2">
              <span>{curr.title}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </h4>
            <p className="text-[11px] text-[#8e8b82] font-medium">
              {curr.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e8f5e9] text-[#2e7d32] px-2.5 py-0.5 rounded-full border border-[#c8e6c9]">
            Herbal Supplement
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-[#5A5A40]" /> : <ChevronDown className="w-4 h-4 text-[#5A5A40]" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-[#e2dfd5] space-y-3 mt-1">
          {/* Remedy Card */}
          <div className="bg-white p-4 rounded-xl border border-[#e2dfd5] space-y-2.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h5 className="font-serif font-bold text-sm text-[#2c2c2c]">
                {activeRemedy.remedyName[currentLang] || activeRemedy.remedyName.en}
              </h5>
              <span className="text-[10px] font-mono text-[#2e7d32] font-bold bg-[#f0f9f0] px-2 py-0.5 rounded border border-[#c8e6c9]">
                {curr.source} {activeRemedy.classicalSource}
              </span>
            </div>

            {/* Ingredients */}
            <div className="space-y-1 text-xs">
              <strong className="text-[#5A5A40] block font-bold uppercase text-[10px] tracking-wider">
                Natural Ingredients:
              </strong>
              <div className="flex flex-wrap gap-1.5">
                {activeRemedy.ingredients.map((ing, idx) => (
                  <span key={idx} className="bg-[#f0ede4] text-[#2c2c2c] px-2.5 py-1 rounded-lg border border-[#e2dfd5] font-medium">
                    🌿 {ing[currentLang] || ing.en}
                  </span>
                ))}
              </div>
            </div>

            {/* Method */}
            <div className="text-xs space-y-1 pt-1 border-t border-[#f0ede4]">
              <strong className="text-[#5A5A40] block font-bold uppercase text-[10px] tracking-wider">
                Classical Application Method:
              </strong>
              <p className="text-[#2c2c2c] leading-relaxed">
                {activeRemedy.applicationMethod[currentLang] || activeRemedy.applicationMethod.en}
              </p>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="p-3 rounded-xl bg-[#fff8e1] border border-[#ffe082] text-[11px] text-[#f57f17] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {curr.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
