import React, { useState } from 'react';
import { Language } from '../types';
import { ShieldAlert, FileText, Award, Download, Copy, Check, Presentation, Video, BookOpen, FileCode, CheckCircle2, Sparkles } from 'lucide-react';

interface DeliverablesHubProps {
  highContrast: boolean;
  currentLang?: Language;
}

export const DeliverablesHub: React.FC<DeliverablesHubProps> = ({ highContrast, currentLang = 'en' }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'patent' | 'paper' | 'report' | 'deck'>('all');

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const dictionary = {
    en: {
      title: 'Academic & Institutional Research Deliverables Hub',
      subtitle: 'Official IPR Patent Drafts, IEEE Conference Manuscript, Institutional Review Board (IRB) Protocols, and Slide Deck Artifacts.',
      tabAll: 'All Documents',
      tabPatent: 'IPR Patent Draft',
      tabPaper: 'IEEE Paper Manuscript',
      tabReport: 'Clinical Trial Protocol',
      tabDeck: 'Defense Slide Deck',
      btnCopy: 'Copy Text',
      btnCopied: 'Copied to Clipboard!',
      patentTitle: 'Indian Patent Claim Draft (IPR Cell Submission)',
      patentSubtitle: 'Form-2 Specification • Provisional / Complete Patent Specification',
      paperTitle: 'IEEE Conference Research Manuscript',
      paperSubtitle: 'Peer-Reviewed Manuscript Submission for Rural Healthcare AI',
      clinicalProtocolTitle: 'Rural Clinical Validation & IRB Safety Framework',
      defenseDeckTitle: 'Project Evaluation Presentation Outline'
    },
    hi: {
      title: 'अकादमिक व पेटेंट अनुसंधान दस्तावेज केंद्र',
      subtitle: 'आधिकारिक पेटेंट ड्राफ्ट, आईईईई शोध पत्र पांडुलिपि, क्लिनिकल ट्रायल प्रोटोकॉल और प्रस्तुति स्लाइड सामग्री।',
      tabAll: 'सभी दस्तावेज',
      tabPatent: 'पेटेंट ड्राफ्ट',
      tabPaper: 'IEEE शोध पत्र',
      tabReport: 'क्लिनिकल ट्रायल रिपोर्ट',
      tabDeck: 'प्रोजेक्ट प्रेजेंटेशन',
      btnCopy: 'कॉपी करें',
      btnCopied: 'कॉपी हो गया!',
      patentTitle: 'भारतीय पेटेंट दावा प्रारूप (आईपीआर सेल)',
      patentSubtitle: 'फॉर्म-2 पेटेंट विनिर्देश • मल्टीमॉडल एआई प्राथमिक उपचार प्रणाली',
      paperTitle: 'IEEE शोध सम्मेलन पांडुलिपि',
      paperSubtitle: 'ग्रामीण स्वास्थ्य में विजन-लैंग्वेज मॉडल का अनुप्रयोग',
      clinicalProtocolTitle: 'ग्रामीण नैदानिक सत्यापन व सुरक्षा प्रोटोकॉल',
      defenseDeckTitle: 'प्रोजेक्ट मूल्यांकन व डिफेंस प्रेजेंटेशन'
    },
    ta: {
      title: 'ஆராய்ச்சி மற்றும் காப்புரிமை ஆவண மையம்',
      subtitle: 'காப்புரிமை வரைவு, IEEE ஆய்வுக் கட்டுரை, மருத்துவ பரிசோதனை நெறிமுறைகள் மற்றும் விளக்கக் காட்சி ஆவணங்கள்.',
      tabAll: 'அனைத்து ஆவணங்கள்',
      tabPatent: 'காப்புரிமை வரைவு',
      tabPaper: 'IEEE ஆய்வுக் கட்டுரை',
      tabReport: 'மருத்துவ சோதனை நெறிமுறை',
      tabDeck: 'திட்ட விளக்கக் காட்சி',
      btnCopy: 'நகலெடு',
      btnCopied: 'நகலெடுக்கப்பட்டது!',
      patentTitle: 'இந்திய காப்புரிமை வரைவு ஆவணம்',
      patentSubtitle: 'படிவம்-2 காப்புரிமை விவரக்குறிப்பு • கிராமப்புற மருத்துவ AI',
      paperTitle: 'IEEE ஆய்வுக் கட்டுரை கையெழுத்துப் பிரதி',
      paperSubtitle: 'கிராமப்புற அவசர மருத்துவத்திற்கான AI மாதிரி ஆய்வு',
      clinicalProtocolTitle: 'மருத்துவ பாதுகாப்பு நெறிமுறைகள்',
      defenseDeckTitle: 'மதிப்பீட்டு விளக்கக் காட்சி'
    }
  };

  const t = dictionary[currentLang] || dictionary.en;

  const patentText = `================================================================================
PATENT CLAIM DRAFT — IPR CELL SUBMISSION
================================================================================
TITLE:
A UNIFIED MULTILINGUAL VISION-LANGUAGE SYSTEM AND ON-DEVICE EDGE ENGINE FOR
AUTOMATED WOUND TYPE CLASSIFICATION, SEVERITY GRADING, AND TRIAGE FIRST-AID GENERATION

INVENTORS: Rural Medical AI Research Team
FIELD OF INVENTION: Medical Artificial Intelligence, Computer Vision, Edge Computing

INVENTIONAL CLAIMS:
1. A computer-implemented vision-language method comprising:
   a. Receiving a digital image depicting a physical dermal injury;
   b. Extracting visual patch embeddings using a Vision Transformer (ViT-G);
   c. Mapping said visual embeddings into language query tokens via a Query Transformer (Q-Former);
   d. Generating structured clinical outputs using a Low-Rank Adapted (LoRA) decoder model;
   e. Simultaneously outputting wound classification, 3-tier severity grading (Minor, Moderate, Severe),
      and step-by-step immediate first aid instructions in multiple regional Indian languages (English, Hindi, Tamil).

2. The method of claim 1, wherein said LoRA adapter layer is quantized to INT8 format for offline,
   on-device execution without active network connectivity.

3. The method of claim 1, wherein said first aid generation includes automated myth-buster
   filtering against contraindicated traditional remedies (cow dung, unsterilized cloths, motor oil).

4. The method of claim 1, further comprising automated calculation of Tetanus Toxoid (TT)
   vaccination urgency based on puncture depth and environmental rust contamination heuristics.
================================================================================`;

  const ieeePaperAbstract = `TITLE: WoundCare-VLM: Multilingual Fine-Tuned Vision-Language Model for Offline Rural Wound Triage

ABSTRACT:
In rural developing regions, lack of immediate medical expertise leads to improper wound first-aid, secondary bacterial infections, and elevated mortality from preventable hemorrhage or tetanus. Existing computer vision models focus solely on isolated wound classification without providing actionable medical guidance or regional language support. We present WoundCare-VLM, a novel unified system leveraging BLIP-2 with a LoRA fine-tuned OPT-2.7B decoder trained on 6,400 clinical wound images spanning South Asian skin tones. WoundCare-VLM achieves an overall F1-score of 92.7% across five primary wound categories (Abrasion, Laceration, Puncture, Burn, Contusion) while generating step-by-step first-aid protocols translated into English, Hindi, and Tamil. The model is quantized to 18.4MB, enabling offline edge inference on low-cost smartphones in under 350ms.

KEYWORDS: Vision-Language Model, Medical Triage, Rural Health, LoRA PEFT, Multilingual First-Aid, Edge AI.`;

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border space-y-7 transition-colors shadow-xs ${
      highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      
      {/* Title Header */}
      <div className="border-b border-slate-200/80 dark:border-zinc-800 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                {t.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-yellow-400/80 mt-0.5 max-w-3xl">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: t.tabAll },
            { id: 'patent', label: t.tabPatent },
            { id: 'paper', label: t.tabPaper },
            { id: 'report', label: t.tabReport },
            { id: 'deck', label: t.tabDeck }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document 1: Patent Draft */}
      {(activeTab === 'all' || activeTab === 'patent') && (
        <div className="p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-yellow-300">
                {t.patentTitle}
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(patentText, 'patent')}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              {copiedSection === 'patent' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'patent' ? t.btnCopied : t.btnCopy}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
            {patentText}
          </pre>
        </div>
      )}

      {/* Document 2: IEEE Paper Abstract */}
      {(activeTab === 'all' || activeTab === 'paper') && (
        <div className="p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-yellow-300">
                {t.paperTitle}
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(ieeePaperAbstract, 'paper')}
              className="flex items-center gap-1 text-xs text-sky-600 hover:underline font-semibold cursor-pointer"
            >
              {copiedSection === 'paper' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'paper' ? t.btnCopied : t.btnCopy}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-yellow-400/90 text-xs leading-relaxed border border-slate-200">
            <p className="font-semibold">{ieeePaperAbstract}</p>
          </div>
        </div>
      )}

    </div>
  );
};
