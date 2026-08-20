import React, { useState } from 'react';
import { Language } from '../types';
import { BookOpen, Search, ShieldAlert, Heart, Droplet, Flame, Bug, ShieldCheck, Check, Syringe, Sparkles, Filter, AlertTriangle } from 'lucide-react';

interface RuralFieldGuideProps {
  currentLang: Language;
  highContrast: boolean;
}

interface GuideTopic {
  id: string;
  category: string;
  icon: React.ReactNode;
  title: { en: string; hi: string; ta: string };
  summary: { en: string; hi: string; ta: string };
  steps: { en: string[]; hi: string[]; ta: string[] };
  myths: { en: string[]; hi: string[]; ta: string[] };
}

const FIELD_GUIDE_TOPICS: GuideTopic[] = [
  {
    id: 'bleeding',
    category: 'Trauma & Hemorrhage',
    icon: <Droplet className="w-5 h-5 text-red-500" />,
    title: {
      en: 'Severe Arterial Bleeding Control',
      hi: 'गंभीर खून बहना रोकना (रक्तस्राव नियंत्रण)',
      ta: 'கடுமையான இரத்தப்போக்கு கட்டுப்பாடு'
    },
    summary: {
      en: 'Arterial spurting can lead to fatal hypovolemic shock within minutes. Continuous occlusive direct pressure is paramount.',
      hi: 'धमनी से बहता खून 3 मिनट में जानलेवा हो सकता है। सीधा तेज दबाव बनाएं।',
      ta: '3 நிமிடங்களில் அதிக இரத்தப்போக்கு உயிருக்கு ஆபத்தானது. தொடர் அழுத்தம் கொடுக்கவும்.'
    },
    steps: {
      en: [
        'Press firmly directly over the bleeding epicenter with sterile gauze or clean cloth.',
        'Do NOT release pressure to inspect the wound for at least 10 continuous minutes.',
        'Elevate the injured limb above heart level if bone fracture is not suspected.',
        'Apply a secure compression bandage over the initial pad.',
        'If blood soaks through, do NOT remove the first pad; add a second pad on top.',
        'Dispatch 108 Ambulance immediately for secondary trauma hospital transfer.'
      ],
      hi: [
        'साफ कपड़े या दस्ताने से खून बहने वाले स्थान पर सीधा तेज दबाव बनाएं।',
        'कम से कम 10 मिनट तक पट्टी हटाकर घाव को देखने की गलती न करें।',
        'यदि हड्डी न टूटी हो, तो घायल अंग को छाती के स्तर से ऊपर उठाएं।',
        'कपड़े के ऊपर कसकर पट्टी बांधें।',
        'यदि पहली पट्टी खून से भीग जाए, तो उसे न हटाएं; उसके ऊपर दूसरी पट्टी रखें।',
        'तुरंत 108 एम्बुलेंस को कॉल करें।'
      ],
      ta: [
        'சுத்தமான துணியால் இரத்தம் வரும் இடத்தின் மீது நேரடியாக அழுத்தம் கொடுக்கவும்.',
        '10 நிமிடங்களுக்கு கட்டை அவிழ்த்து காயத்தைப் பார்க்கக் கூடாது.',
        'எலும்பு முறிவு இல்லையெனில், காயம்பட்ட உறுப்பை உயர்த்திப் பிடிக்கவும்.',
        'துணியின் மீது இறுக்கமாகக் கட்டு போடவும்.',
        'முதல் துணி இரத்தத்தில் நனைந்தால், அதை அகற்றாமல் அதன் மேல் மற்றொரு துணியை வைக்கவும்.',
        'உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும்.'
      ]
    },
    myths: {
      en: [
        'DO NOT apply thin ropes, wires, or tight plastic bags as improvised tourniquets; they cause irreversible ischemia and limb amputation.',
        'DO NOT apply turmeric, coffee powder, mud, cow dung, or tree sap on open spurting arteries.'
      ],
      hi: [
        'रस्सी या पतले तार को कसकर न बांधें, इससे नसें हमेशा के लिए खराब हो सकती हैं।',
        'गहरे घाव पर कॉफी पाउडर, मिट्टी या गोबर न लगाएं।'
      ],
      ta: [
        'கயிற்றால் இறுக்கமாகக் கட்டக் கூடாது; நரம்புகள் செயலிழக்கக் கூடும்.',
        'காயத்தில் காபி தூள், மண் அல்லது சாணம் இடக் கூடாது.'
      ]
    }
  },
  {
    id: 'snakebite',
    category: 'Toxicology & Bites',
    icon: <Bug className="w-5 h-5 text-amber-500" />,
    title: {
      en: 'Snakebite Emergency Field Protocol (DO IT Protocol)',
      hi: 'सर्पदंश (सांप काटने) का प्राथमिक उपचार',
      ta: 'பாம்பு கடி அவசர சிகிச்சை நெறிமுறை'
    },
    summary: {
      en: 'Immediate immobilization and rapid transfer to a PHC with Polyvalent Anti-Snake Venom (ASV) saves lives. 70% of fatal bites in India are Big Four species (Russell’s Viper, Cobra, Krait, Saw-scaled Viper).',
      hi: 'सांप काटने पर मरीज को शांत रखें, अंग को स्थिर करें और तुरंत एएसवी (ASV) वाले अस्पताल ले जाएं।',
      ta: 'பாம்பு கடித்த நபரை அசையாமல் வைத்து, உடனடியாக ASV மருந்துள்ள மருத்துவமனைக்கு அழைத்துச் செல்லவும்.'
    },
    steps: {
      en: [
        'Immobilize the bitten limb with a rigid splint/stick and loose bandage (like a fractured bone).',
        'Keep the victim calm, seated or lying still; reassure them that most bites are non-venomous or dry.',
        'Remove rings, bangles, watches, and tight footwear before swelling begins.',
        'Transport immediately to the nearest hospital with Polyvalent ASV and 24/7 ICU.'
      ],
      hi: [
        'काटे गए अंग को लकड़ी की पट्टी से स्थिर करें ताकि जहर शरीर में तेजी से न फैले।',
        'मरीज को शांत रखें और ज्यादा चलने या भागने न दें।',
        'अंगूठी, कंगन या जूते तुरंत उतार दें।',
        'तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र ले जाएं जहां एंटी-स्नेक वेनम उपलब्ध हो।'
      ],
      ta: [
        'கடித்த உறுப்பை ஒரு மரக்குச்சியுடன் சேர்த்து அசையாமல் கட்டவும்.',
        'பாதிக்கப்பட்டவரை அமைதியாக இருக்கச் செய்யவும்.',
        'மோதிரம், வளையல் போன்றவற்றை உடனடியாக கழற்றவும்.',
        'உடனடியாக ASV உள்ள அரசு மருத்துவமனைக்குக் கொண்டு செல்லவும்.'
      ]
    },
    myths: {
      en: [
        'NEVER cut, incise, or suction the bite wound with mouth or devices.',
        'NEVER apply tight arterial tourniquets or burn the wound with matches.',
        'DO NOT waste time with traditional healers, tantriks, or herbal stones.'
      ],
      hi: [
        'घाव पर चीरा न लगाएं और न ही मुंह से जहर चूसने की कोशिश करें।',
        'झाड़-फूंक या तांत्रिक के चक्कर में समय बर्बाद न करें।'
      ],
      ta: [
        'வாயால் விஷத்தை உறிஞ்சக் கூடாது; கத்தியால் கீறக் கூடாது.',
        'நாட்டு வைத்தியம் செய்து பொன்னான நேரத்தை வீணடிக்காதீர்கள்.'
      ]
    }
  },
  {
    id: 'tetanus',
    category: 'Infection Protocol',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    title: {
      en: 'Tetanus Toxoid (TT) Immunization Protocol',
      hi: 'टिटनेस का टीका और सुरक्षा नियम',
      ta: 'டெட்டானஸ் தடுப்பூசி வழிகாட்டுதல்'
    },
    summary: {
      en: 'Clostridium tetani spores thrive in agricultural soil and animal manure. Punctures from rusty nails, thorns, or farm tools carry high risk.',
      hi: 'मिट्टी और गोबर में टिटनेस के जीवाणु पाए जाते हैं। जंग लगी वस्तु या कांटे के घाव में अधिक खतरा होता है।',
      ta: 'மண் மற்றும் சாணத்தில் டெட்டானஸ் கிருமிகள் உள்ளன. ஆழமான துளைக் காயங்களுக்கு அதிக ஆபத்து.'
    },
    steps: {
      en: [
        'Irrigate deep or contaminated wounds with clean running water and mild soap.',
        'Check patient immunization history: administer 0.5 mL Tetanus Toxoid (TT) IM within 24 hours if last dose was >5 years ago.',
        'For high-risk deep contamination with devitalized tissue, administer Tetanus Immunoglobulin (TIG) 250 IU.'
      ],
      hi: [
        'मिट्टी से गंदे सभी घावों को बहते साफ पानी से धोएं।',
        'यदि आखिरी टिटनेस का टीका 5 साल से अधिक पुराना है, तो 24 घंटे में टीका लगवाएं।',
        'अत्यधिक गंदे घाव में टिटनेस इम्यूनोग्लोबुलिन (TIG) का इंजेक्शन लगवाएं।'
      ],
      ta: [
        'மண்ணால் அழுக்கான காயங்களை ஓடும் நீரில் கழுவவும்.',
        'கடைசி தடுப்பூசி போட்டு 5 ஆண்டுகளுக்கு மேலாகியிருந்தால், 24 மணி நேரத்திற்குள் டெட்டானஸ் ஊசி போடவும்.'
      ]
    },
    myths: {
      en: ['DO NOT rely on washing with kerosene, petrol, or battery water to kill tetanus spores.'],
      hi: ['टिटनेस खत्म करने के लिए घाव पर मिट्टी का तेल या पेट्रोल न डालें।'],
      ta: ['டெட்டானஸ் கிருமிகளை அழிக்க பெட்ரோல் ஊற்றக் கூடாது.']
    }
  },
  {
    id: 'burns',
    category: 'Thermal Care',
    icon: <Flame className="w-5 h-5 text-rose-500" />,
    title: {
      en: 'Cookstove & Scald Burn First Aid',
      hi: 'जले हुए स्थान का तुरंत उपचार (बर्न केयर)',
      ta: 'தீக்காய முதலுदவி சிகிச்சை'
    },
    summary: {
      en: 'Copious tap water irrigation stops continuous dermal heat injury and limits burn depth progression.',
      hi: 'जले हुए स्थान पर ठंडा पानी डालने से जलन और घाव की गहराई कम होती है।',
      ta: 'குளிர்ந்த நீரை ஊற்றுவது தோலின் ஆழமான பாதிப்பைத் தடுக்கும்.'
    },
    steps: {
      en: [
        'Immediately irrigate the burn area with cool running tap water for 15 to 20 continuous minutes.',
        'Gently remove rings, bracelets, or constrictive clothing before acute edema sets in.',
        'Apply Silver Sulfadiazine 1% cream or sterile hydrogel dressing for superficial partial-thickness burns.',
        'Cover loosely with a sterile non-adherent dressing.'
      ],
      hi: [
        'जले हुए स्थान पर तुरंत 15 से 20 मिनट तक ठंडा बहता पानी डालें।',
        'सूजन आने से पहले अंगूठी या कसकर बंधे कपड़े उतार दें।',
        'सिल्वर सल्फाडायजीन क्रीम या बर्न जेल धीरे से लगाएं।',
        'साफ और सूखे सूती कपड़े से ढके।'
      ],
      ta: [
        'எரிந்த இடத்தில் 15-20 நிமிடங்கள் குளிர்ந்த நீரை ஊற்றவும்.',
        'வீக்கம் அடைவதற்கு முன் மோதிரம் போன்றவற்றை கழற்றவும்.',
        'பர்ன் ஜெல் அல்லது கிரீம் தடவவும்.',
        'சுத்தமான துணியால் லேசாக மூடவும்.'
      ]
    },
    myths: {
      en: ['NEVER apply toothpaste, raw eggs, engine oil, ghee, or cow dung. They trap heat and breed severe bacterial infections.'],
      hi: ['टूथपेस्ट, घी, कच्चा अंडा या मक्खन न लगाएं। इनसे संक्रमण का खतरा बढ़ता है।'],
      ta: ['டூத்பேஸ்ட், நெய் அல்லது முட்டை தடவக் கூடாது; இது கிருமித் தொற்றை உண்டாக்கும்.']
    }
  }
];

export const RuralFieldGuide: React.FC<RuralFieldGuideProps> = ({ currentLang, highContrast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Trauma & Hemorrhage', 'Toxicology & Bites', 'Infection Protocol', 'Thermal Care'];

  const filteredTopics = FIELD_GUIDE_TOPICS.filter((topic) => {
    const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
    const titleText = topic.title[currentLang] || topic.title.en;
    const summaryText = topic.summary[currentLang] || topic.summary.en;
    const matchesSearch = (
      titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summaryText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 transition-colors shadow-xs ${
      highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-600/10 text-teal-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
              {currentLang === 'hi' ? 'ग्रामीण प्राथमिक उपचार फील्ड गाइड' : currentLang === 'ta' ? 'கிராமப்புற முதலுதவி வழிகாட்டி' : 'Rural First-Aid Reference Field Guide'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-yellow-400/80 mt-0.5">
              Verified clinical protocols for ASHA volunteers, ANM health workers, and rural first responders
            </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search protocols (e.g. arterial bleeding, snakebite, burn, tetanus, infection)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-2xl pl-11 pr-4 py-2.5 text-xs transition focus:outline-none ${
              highContrast
                ? 'bg-black border-yellow-400 text-yellow-300 focus:border-yellow-300'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
            }`}
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer border text-xs ${
                selectedCategory === cat
                  ? highContrast
                    ? 'bg-yellow-400 text-black border-yellow-500 font-bold'
                    : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : highContrast
                    ? 'bg-zinc-900 border-yellow-400/50 text-yellow-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Cards */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className={`p-5 sm:p-6 rounded-3xl border space-y-4 transition ${
              highContrast ? 'bg-black border-yellow-400/60 text-yellow-300' : 'bg-slate-50 border-slate-200/80 text-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${
                  highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  {topic.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-yellow-400/80 block">
                    {topic.category}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-yellow-300">
                    {topic.title[currentLang] || topic.title.en}
                  </h3>
                </div>
              </div>
            </div>

            <p className={`text-xs p-3.5 rounded-2xl border leading-relaxed ${
              highContrast ? 'bg-zinc-900 border-yellow-400/40 text-yellow-200' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              {topic.summary[currentLang] || topic.summary.en}
            </p>

            {/* Action Steps */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Check className="w-4 h-4" />
                <span>Step-by-Step Action Protocol</span>
              </h4>
              <ul className="space-y-1.5 text-xs pl-2">
                {(topic.steps[currentLang] || topic.steps.en).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contraindicated Myths */}
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs space-y-1.5">
              <span className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" /> Dangerous Rural Myths (Contraindicated)
              </span>
              {(topic.myths[currentLang] || topic.myths.en).map((m, idx) => (
                <p key={idx} className="text-red-950 dark:text-red-200 pl-4 relative before:content-['✕'] before:absolute before:left-0 before:text-red-600 font-medium leading-relaxed text-[11px]">
                  {m}
                </p>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
