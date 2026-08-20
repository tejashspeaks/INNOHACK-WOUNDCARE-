# WoundCare-VLM 🩺🩹

**AI Vision-Language Model for Rural Wound Classification, Severity Grading, Multilingual First-Aid Triage & Clinical Screening**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_/_3.7_Flash-orange.svg?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary

**WoundCare-VLM** is a production-grade, multimodal medical triage and diagnostic assistance system engineered for rural primary healthcare centers (PHCs), field paramedics, community health workers (ASHA/ANM), and remote industrial sites. 

By combining Google Gemini Vision-Language Models with zero-latency deterministic offline clinical heuristic trees, WoundCare-VLM provides immediate trauma assessment, multi-wound triage, physical ruler-based dimensional measurement, emergency golden-hour countdowns, ocular/skin screening with strict clinical safeguards, and multilingual voice-guided first-aid protocols in **English**, **हिंदी (Hindi)**, and **தமிழ் (Tamil)**.

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 WoundCare-VLM Ecosystem                 │
                  │   Edge & Cloud Vision-Language Medical Triage Suite     │
                  └────────────────────────────┬────────────────────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ▼                                                               ▼
  ┌─────────────────────────┐                                     ┌─────────────────────────┐
  │   Trauma & Wound Suite  │                                     │  Screening & Ocular     │
  │ • Morphological VLM     │                                     │ • 3-Stage Ocular Gate   │
  │ • Multi-Site Batch Scan │                                     │ • Insect Bite Module    │
  │ • Pixel Calibration cm² │                                     │ • Scleral Biomarkers    │
  │ • Hemorrhage Class I-IV │                                     │ • Zero-Hallucination    │
  └────────────┬────────────┘                                     └────────────┬────────────┘
               │                                                               │
               └───────────────────────────────┬───────────────────────────────┘
                                               │
                                               ▼
                              ┌─────────────────────────────────┐
                              │  Emergency & Safety Dispatch    │
                              │ • Golden Hour Countdown         │
                              │ • PHC / Hospital Geolocation    │
                              │ • Allergy Cross-Check Engine    │
                              │ • Twilio Caretaker SMS Alerts   │
                              │ • Multilingual Voice TTS        │
                              └─────────────────────────────────┘
```

---

## 🌟 Comprehensive Feature Matrix

### 1. 👁️ Core Wound Classification & Vision-Language Triage
* **Morphological Classification**: Accurately classifies acute and chronic wounds: *lacerations, abrasions, puncture wounds, incised wounds, burns (1st–3rd degree), contusions, animal/snake bites, and diabetic foot ulcers*.
* **Severity & Urgency Stratification**: Classifies into **Minor**, **Moderate**, and **Severe/Critical** categories with calibrated confidence scores and doctor referral timelines.
* **Infection Biomarker Detection**: Evaluates perilesional erythema, purulent/serous discharge, localized edema, maceration, and necrotic slough.
* **Tetanus & Pathogen Risk Engine**: Evaluates exposure mechanisms (rusty farm tools, soil, animal saliva) and issues Tetanus Toxoid (TT) vaccination urgencies.
* **Batch Multi-Wound Scanner**: Allows simultaneous capture and independent analysis of multiple trauma sites on a single patient.

---

### 2. 🔬 Ocular & Skin Screening Module (Strict Clinical Protocol)
* **Stage 0 Input Validation Gate**: Prevents false diagnostics by validating image sharpness, illumination, and anatomic matching (`eye` vs `skin_bite`) before executing clinical models.
* **Stage 1 Qualitative Feature Extraction**: Replaces fabricated numbers with calibrated qualitative bands:
  * *Scleral color*: `white/normal`, `mild_yellowing`, `moderate_yellowing`, `marked_yellowing`.
  * *Conjunctival injection*: `none`, `mild`, `moderate`, `severe`.
  * *Palpebral conjunctival pallor*: `normal`, `pale`, `very_pale`, `not_assessable_from_image`.
  * *Discharge & Periorbital signs*: `watery`, `mucoid`, `purulent`, swelling, ptosis.
* **Stage 2 Calibrated Multi-Sign Gating**: Disease differentials are only suggested if at least two independent abnormal signs are present with non-specific certainty language.
* **Stage 3 Insect Bite Morphology**: Identifies bite arrangements (*single, clustered, linear/row*) and wheal/flare characteristics without speculating on insect species or vector-borne pathogens.
* **Zero-Hallucination Hard Bans**:
  * ❌ Strict ban on simulated blood chemistry values (e.g., fabricated `mg/dL` bilirubin or `g/dL` hemoglobin).
  * ❌ Ban on assigning systemic disease names as primary visual diagnoses.
  * ❌ Default baseline is strictly **NORMAL** unless positive visual criteria are met.

---

### 3. 📐 Advanced Pixel Measurement & Calibration
* **Metric Reference Card Calibration**: Automatically detects standard physical reference cards (credit card, ID-1 standard, 10mm coins) in the camera frame to compute pixels-per-millimeter ($PPM$).
* **Real-World Surface Area Calculation**: Calculates exact wound length, width, and surface area in $\text{cm}^2$ with confidence intervals.
* **Wound Healing Progression Velocity**: Compares time-series baseline photos to measure surface area delta ($\Delta \text{cm}^2$) and track healing trajectories.

---

### 4. 🩸 Emergency Trauma & Hemorrhage Management
* **Golden Hour Countdown**: Real-time timer triggered during severe trauma, integrating one-tap Indian emergency dispatch (**108** / **112**) and GPS coordinates.
* **Blood Loss Estimator**: Classifies hemorrhage stages (Class I–IV), estimates blood volume lost ($\text{mL}$), and displays step-by-step arterial vs venous pressure protocols.
* **Embedded Foreign Object Detection**: Warns against dangerous extraction of impaled glass, wood splinters, or metallic shrapnel.
* **Venomous Snake & Animal Bite Identifier**: Differentiates viper/elapid twin fang punctures from non-venomous U-shaped dental arches and directs patients to facilities with stocked Polyvalent Anti-Snake Venom (ASV).
* **Twilio Caretaker SMS System**: Transmits patient location, triage summary, and severity directly to emergency contacts via SMS.

---

### 5. 🌿 Holistic Personalization & Clinical Safety
* **Patient Allergy Safety Cross-Check**: Enforces safety checks against *Povidone-Iodine, Latex, Adhesive bandages, Penicillin, and Aspirin*, substituting non-allergenic alternatives in the first-aid steps.
* **Diabetic Microvascular Safeguard**: Modifies pressure and dressing recommendations when Diabetic Foot Ulcer (DFU) mode is active.
* **Ayurvedic Complementary Care**: Curates validated traditional wound remedies (*Turmeric paste, Neem extract, Honey dressing, Aloe Vera*) alongside conventional protocols.
* **Weather-Aware Healing Banner**: Considers local ambient temperature and humidity to warn against bacterial overgrowth or dressing desiccation.
* **Scar Risk & Age Predictor**: Predicts cellular healing phase (*Hemostasis, Inflammatory, Proliferative, Maturation*) and keloid/hypertrophic scar likelihood.

---

### 6. 🌐 Multilingual Voice & Clinical Export
* **Trilingual Translation**: Complete localization in **English**, **हिंदी (Hindi)**, and **தமிழ் (Tamil)**.
* **Auditory Voice Assistance (TTS)**: Web Speech Synthesis plays audible step-by-step first aid commands in high-stress emergency environments.
* **PDF Clinical Dossier**: Exports publication-ready medical reports featuring ICD-10 codes, photographic evidence, GPS coordinates, triage urgency, and doctor sign-off blocks.
* **PHC & Hospital Geolocation**: Displays nearby primary health centers, community health centers, and district hospitals with bed counts and direct call actions.

---

## 🏗️ Technical Architecture & Pipeline

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT FRONTEND                                   │
│  React 19 • TypeScript • Tailwind CSS v4 • Motion Animations • Lucide Icons       │
└──────────────────────┬────────────────────────────────────┬──────────────────────┘
                       │                                    │
                       ▼ (HTTP POST /api/*)                 ▼ (Local Web Workers)
┌──────────────────────────────────────────────┐   ┌────────────────────────────────┐
│             EXPRESS BACKEND SERVER           │   │    OFFLINE HEURISTIC ENGINE    │
│  Node.js • TSX • Port 3000 Ingress Routing   │   │  • Deterministic Decision Tree │
└──────────────────────┬───────────────────────┘   │  • Fallback Edge Simulators    │
                       │                           └────────────────────────────────┘
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     GOOGLE GEMINI API     │   │      TWILIO REST API      │
│  • Gemini 2.5 / 3.7 Flash │   │  • Automated SMS Alerts   │
│  • Multimodal VLM Prompts │   │  • Caretaker Broadcasts   │
│  • Structured JSON Output │   └───────────────────────────┘
└───────────────────────────┘
```

---

## 💻 Tech Stack & Dependencies

| Category | Technology | Purpose |
|---|---|---|
| **Core Framework** | React 19, TypeScript 5.8 | Modern reactive component architecture & type safety |
| **Styling & UI** | Tailwind CSS v4, Motion | Responsive medical HUD, animations, and high-contrast modes |
| **Icons** | Lucide React | Standardized accessible SVG iconography |
| **VLM & AI** | `@google/genai` (Gemini 2.5 / 3.7 Flash) | Vision-language image understanding & triage extraction |
| **Backend Proxy** | Express.js 4.21, Node.js, `tsx` | Secure server-side API proxying (zero client API key leaks) |
| **Telephony** | Twilio SDK | Automated SMS alerts to emergency contacts and caregivers |
| **Document Export** | `jspdf` | Generating downloadable clinical triage dossiers |
| **Data Viz** | Recharts, D3 | Recovery curves, healing velocity graphs, biomarker charts |

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** / **yarn** / **pnpm**
- **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/woundcare-vlm.git
cd woundcare-vlm
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Google Gemini API Key (Required for AI Vision features)
GEMINI_API_KEY="your_google_gemini_api_key"

# Optional: Twilio Credentials for Caretaker SMS
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="your_twilio_phone"
```

### 3. Launch Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your web browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Repository Directory Structure

```text
├── server.ts                               # Full-Stack Express server & Gemini VLM endpoints
├── index.html                              # HTML5 application shell & viewport configuration
├── metadata.json                           # AI Studio application manifest & permissions
├── package.json                            # Scripts, dependencies, and build config
├── tsconfig.json                           # TypeScript compiler configuration
├── vite.config.ts                          # Vite bundler & Tailwind CSS v4 configuration
└── src/
    ├── main.tsx                            # React DOM application mount
    ├── App.tsx                             # Top-level state manager, navigation, & sub-tabs
    ├── index.css                           # Global Tailwind CSS, custom animations & medical grid
    ├── types.ts                            # Global TypeScript interfaces, schemas & enums
    ├── data/
    │   └── sampleCases.ts                  # Diverse anatomical reference seed cases
    ├── utils/
    │   ├── speech.ts                       # Web Speech API TTS voice engine
    │   ├── pdfGenerator.ts                 # jsPDF clinical dossier export generator
    │   ├── pixelMeasurement.ts             # Card detection & PPM metric surface calculations
    │   └── imageOptimizer.ts               # Client-side image compression & format handling
    └── components/
        ├── Header.tsx                      # App header, language selector & contrast toggles
        ├── WoundScanner.tsx                # Single-wound VLM analysis with camera viewfinder
        ├── MultiWoundScanner.tsx           # Multi-site batch wound inspection
        ├── OcularAndSkinScreeningModule.tsx# 3-Stage Ocular & Insect Bite Screening module
        ├── EyeDiseaseScanner.tsx           # Multi-biomarker scleral laboratory view
        ├── DynamicPixelMeasurementCard.tsx # Metric calibration & surface area measurement
        ├── BleedingControlGuide.tsx        # Step-by-step hemorrhage management
        ├── BloodLossEstimator.tsx          # Class I-IV shock assessment
        ├── GoldenHourCountdown.tsx         # Trauma timer with 108 emergency dispatch
        ├── SnakeAndAnimalBiteIdentifier.tsx# Venomous fang mark identification
        ├── ForeignObjectDetector.tsx       # Embedded object safety guidance
        ├── CaseHistory.tsx                 # Searchable case history logbook
        ├── WoundProgressTracker.tsx        # Healing progression & time-series comparisons
        ├── PatientProfileTab.tsx           # Allergy profile & diabetic safety toggles
        ├── HospitalLocator.tsx             # PHC, CHC & Trauma center locator
        ├── AyurvedicAdvisor.tsx            # Traditional complementary herbal care
        ├── WeatherAdviceBanner.tsx         # Ambient climate-aware wound advice
        ├── ScarRiskPredictor.tsx           # Hypertrophic scar probability calculator
        ├── WoundAgeEstimator.tsx           # Tissue healing phase estimator
        ├── PhotoQualityChecker.tsx         # Real-time blur, lighting & glare checker
        ├── ModelArchitectureAndMetrics.tsx # Benchmarks, confusion matrices & pipeline specs
        ├── RuralFieldGuide.tsx             # Printable offline clinical handbook
        ├── CaretakerSmsModal.tsx           # SMS broadcast modal
        └── EmergencyModal.tsx              # Emergency triage dialog
```

---

## 🔒 Security & Privacy Practices

1. **Server-Side API Proxying**: All Gemini API keys and Twilio tokens remain exclusively on the server (`server.ts`). No secrets are ever exposed to the client browser.
2. **Local Processing Priority**: Image preprocessing, cropping, and measurement calibration take place in-browser before transmission.
3. **No Unsolicited Lab Values**: Strict clinical guardrails prevent the hallucination of blood chemistry metrics (such as bilirubin or hemoglobin concentrations) from photographic data alone.
4. **Local Data Persistence**: Patient logs and case records are stored in browser local storage or session memory unless exported by authorized healthcare personnel.

---

## ⚕️ Clinical Disclaimer

> **IMPORTANT MEDICAL NOTICE**:  
> **WoundCare-VLM** is designed strictly as an assistive triage aid, educational platform, and clinical decision support system for remote first-aid and community health workers. It does **NOT** substitute for formal diagnosis, surgical treatment, or clinical decisions by a licensed physician or surgeon. For all life-threatening emergencies, immediately dial national emergency dispatch (**108** / **112** in India, **911** in the USA, or **999** in the UK) or proceed directly to the nearest emergency trauma department.

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).
