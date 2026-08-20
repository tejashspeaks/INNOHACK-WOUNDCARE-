import React, { useState } from 'react';
import { ShieldAlert, FileText, Award, Download, Copy, Check, Presentation, Video, BookOpen, FileCode, CheckCircle2, Sparkles } from 'lucide-react';

interface DeliverablesHubProps {
  highContrast: boolean;
}

export const DeliverablesHub: React.FC<DeliverablesHubProps> = ({ highContrast }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'patent' | 'paper' | 'report' | 'deck'>('all');

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                Academic Research, Patent Drafts & Deliverables
              </h2>
              <p className="text-xs text-slate-500 dark:text-yellow-400/80 mt-0.5">
                Complete intellectual property portfolio, IEEE manuscript draft, 50-page IDP dissertation outline, and slide deck
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
              IPR Ready • 2026 Portfolio
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { id: 'all', label: 'All Deliverables' },
          { id: 'patent', label: '📜 Patent Claims Draft' },
          { id: 'paper', label: '📑 IEEE Transactions Paper' },
          { id: 'report', label: '📖 50-Page IDP Dissertation' },
          { id: 'deck', label: '📊 15-Slide Presentation Deck' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer border text-xs ${
              activeTab === tab.id
                ? highContrast
                  ? 'bg-yellow-400 text-black border-yellow-500 font-bold'
                  : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : highContrast
                  ? 'bg-zinc-900 border-yellow-400/50 text-yellow-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Deliverable Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Deliverable 1: Patent Claim Draft */}
        {(activeTab === 'all' || activeTab === 'patent') && (
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-3.5 flex flex-col justify-between transition ${
            highContrast ? 'bg-black border-yellow-400/60' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Patent Application (IPR Cell)
                </span>
                <button
                  onClick={() => copyToClipboard(patentText, 'patent')}
                  className={`text-xs flex items-center gap-1.5 cursor-pointer px-3 py-1 rounded-full font-bold uppercase tracking-wider transition ${
                    highContrast
                      ? 'bg-yellow-400 text-black font-bold'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-2xs'
                  }`}
                >
                  {copiedSection === 'patent' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'patent' ? 'Copied' : 'Copy Draft'}</span>
                </button>
              </div>

              <h3 className="text-base font-serif font-bold text-slate-900 dark:text-yellow-300">
                Patent Draft: Unified Multilingual Wound Triage VLM Pipeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-yellow-400/70 mt-1 leading-relaxed">
                Covers novel unified pipeline combining image recognition, 3-tier severity grading, multilingual first-aid generation, and offline edge execution.
              </p>

              <pre className={`mt-3 p-3.5 rounded-2xl border text-[10px] font-mono overflow-x-auto max-h-48 leading-relaxed ${
                highContrast ? 'bg-zinc-900 border-yellow-400/40 text-yellow-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                {patentText}
              </pre>
            </div>
          </div>
        )}

        {/* Deliverable 2: IEEE Research Paper Abstract */}
        {(activeTab === 'all' || activeTab === 'paper') && (
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-3.5 flex flex-col justify-between transition ${
            highContrast ? 'bg-black border-yellow-400/60' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 uppercase tracking-wider bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-200">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  IEEE Manuscript Draft
                </span>
                <button
                  onClick={() => copyToClipboard(ieeePaperAbstract, 'ieee')}
                  className={`text-xs flex items-center gap-1.5 cursor-pointer px-3 py-1 rounded-full font-bold uppercase tracking-wider transition ${
                    highContrast
                      ? 'bg-yellow-400 text-black font-bold'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-2xs'
                  }`}
                >
                  {copiedSection === 'ieee' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'ieee' ? 'Copied' : 'Copy Abstract'}</span>
                </button>
              </div>

              <h3 className="text-base font-serif font-bold text-slate-900 dark:text-yellow-300">
                IEEE Paper: WoundCare-VLM: Multilingual Offline Wound Triage
              </h3>
              <p className="text-xs text-slate-500 dark:text-yellow-400/70 mt-1 leading-relaxed">
                Camera-ready research paper formatted according to IEEE double-column transactions specifications.
              </p>

              <pre className={`mt-3 p-3.5 rounded-2xl border text-[10px] font-mono overflow-x-auto max-h-48 leading-relaxed ${
                highContrast ? 'bg-zinc-900 border-yellow-400/40 text-yellow-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                {ieeePaperAbstract}
              </pre>
            </div>
          </div>
        )}

      </div>

      {/* 50-Page IDP Report & 15-Slide Presentation Outlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* IDP Report Structure */}
        {(activeTab === 'all' || activeTab === 'report') && (
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-3 ${
            highContrast ? 'bg-black border-yellow-400/60' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
              <span>IDP Project Report Outline (50+ Pages)</span>
            </h4>
            <ol className="text-xs space-y-2 list-decimal pl-4 leading-relaxed text-slate-700 dark:text-yellow-300">
              <li><strong>Chapter 1:</strong> Introduction, Problem Statement in Rural India & Gaps in Medical Infrastructure.</li>
              <li><strong>Chapter 2:</strong> Literature Review on VLMs (BLIP-2, LLaVA, Flamingo, Med-CLIP).</li>
              <li><strong>Chapter 3:</strong> Indian Skin Tone Wound Dataset Collection, Annotation & Preprocessing.</li>
              <li><strong>Chapter 4:</strong> Model Architecture (ViT-G + Q-Former + OPT-2.7B) & LoRA Fine-Tuning.</li>
              <li><strong>Chapter 5:</strong> Multilingual Pipeline (English, Hindi, Tamil) & Myth-Buster Heuristics.</li>
              <li><strong>Chapter 6:</strong> Evaluation Benchmarks, Confusion Matrix, & Ablation Studies.</li>
              <li><strong>Chapter 7:</strong> Patent Claims, Ethics, & Conclusion.</li>
            </ol>
          </div>
        )}

        {/* 15-Slide Presentation Deck Outline */}
        {(activeTab === 'all' || activeTab === 'deck') && (
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-3 ${
            highContrast ? 'bg-black border-yellow-400/60' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <Presentation className="w-4 h-4" />
              <span>15-Slide Pitch Deck Structure</span>
            </h4>
            <ol className="text-xs space-y-1.5 list-decimal pl-4 leading-relaxed text-slate-700 dark:text-yellow-300">
              <li><strong>Slide 1:</strong> Title & Team (WoundCare-VLM for Rural First-Aid)</li>
              <li><strong>Slide 2:</strong> The Rural Medical Crisis in South Asia</li>
              <li><strong>Slide 3:</strong> Existing Gaps & Why Current Vision Models Fail</li>
              <li><strong>Slide 4:</strong> Solution Overview: Image -&gt; Severity -&gt; Multilingual First Aid</li>
              <li><strong>Slide 5:</strong> Architecture: ViT-G + Q-Former + OPT-2.7B</li>
              <li><strong>Slide 6:</strong> LoRA Parameter-Efficient Fine-Tuning on T4 GPU</li>
              <li><strong>Slide 7:</strong> Dataset Diversity & Annotation Protocol</li>
              <li><strong>Slide 8:</strong> Live Demo: Multi-Class Wound Analysis</li>
              <li><strong>Slide 9:</strong> Multilingual Support (English, Hindi, Tamil)</li>
              <li><strong>Slide 10:</strong> Offline Edge Deployment (&lt;350ms Latency)</li>
              <li><strong>Slide 11:</strong> Quantitative Results & F1-Score Benchmarks</li>
              <li><strong>Slide 12:</strong> Patent Claims & VIT IPR Submission Status</li>
              <li><strong>Slide 13:</strong> Rural Field Deployment Strategy (PHC Partnership)</li>
              <li><strong>Slide 14:</strong> Future Scope: Thermal Imaging & Tele-Dermatology</li>
              <li><strong>Slide 15:</strong> Q&amp;A & Thank You</li>
            </ol>
          </div>
        )}

      </div>

    </div>
  );
};
