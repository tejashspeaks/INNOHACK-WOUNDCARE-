export type PrimaryWoundType = 'Healthy Skin / No Wound' | 'No Wound Detected' | 'Healthy Intact Skin' | 'Abrasion' | 'Laceration' | 'Puncture' | 'Burn' | 'Contusion';
export type ExtendedWoundType = 
  | 'Surgical Incision' 
  | 'Diabetic Foot Ulcer' 
  | 'Bite Wound' 
  | 'Snakebite / Envenomation'
  | 'Pressure Ulcer' 
  | 'Avulsion' 
  | 'Abscess / Infection'
  | 'Chemical Burn'
  | 'Electrical Burn'
  | 'Skin Tear'
  | 'Venous Leg Ulcer'
  | 'Gunshot / Penetrating Trauma';
export type WoundType = PrimaryWoundType | ExtendedWoundType | (string & {});

export type SeverityLevel = 'None' | 'Minor' | 'Moderate' | 'Severe';
export type PatientMode = 'adult' | 'child';

export type Language = 'en' | 'hi' | 'ta';

export interface MultilingualText {
  en: string;
  hi: string;
  ta: string;
}

export interface FirstAidStep {
  stepNumber: number;
  text: MultilingualText;
  iconType: 'pressure' | 'water' | 'antiseptic' | 'bandage' | 'hospital' | 'ice' | 'clean' | 'elevation';
  isUrgent?: boolean;
}

export type MedicineCategory = 'Mild & Safe (OTC)' | 'Topical Antiseptic' | 'Pain Relief (Analgesic)' | 'Prescription Antibiotic' | 'Vaccine / Immunoglobulin';

export type HarmLevel = 'Very Low (Safe OTC)' | 'Low (Mild External)' | 'Moderate (Follow Dosage)' | 'High Caution (Rx Required)';

export interface MedicineRecommendation {
  name: string; // e.g. "Povidone-Iodine 5% Ointment (Betadine)"
  genericName: string; // e.g. "Povidone-Iodine"
  category: MedicineCategory;
  harmLevel: HarmLevel;
  estimatedPriceINR: string; // e.g. "₹35 - ₹65"
  estimatedPriceUSD?: string; // e.g. "$0.40 - $0.80"
  purpose: MultilingualText;
  dosageInstructions: MultilingualText;
  safetyPrecautions: MultilingualText;
  requiresPrescription: boolean;
}

export interface ReferenceObjectCalibration {
  objectType: 'coin_5inr' | 'coin_10inr' | 'id_card' | 'bandage_1in' | 'ruler_marker' | 'anatomical_fingernail' | 'custom';
  objectName: string;
  knownDimensionMm: number; // e.g. 23.0 for 5 INR coin
  pixelDimension: number; // pixel span in image
  pixelToMmRatio: number; // mm per pixel
  patientModeCorrection: number; // scale multiplier for pediatric curvature vs adult
}

export interface WoundMeasurement {
  lengthCm: number;
  widthCm: number;
  lengthMm?: number;
  widthMm?: number;
  areaMm2?: number;
  areaCm2?: number;
  perimeterMm?: number;
  formattedText: string; // e.g. "3.5 cm x 1.8 cm (Est. Area ~4.9 cm²)"
  pixelToMmRatio?: number;
  calibration?: ReferenceObjectCalibration;
}

export interface RecoveryDiet {
  foodsToEat: MultilingualText[];
  foodsToAvoid: MultilingualText[];
  hydrationAdvice: MultilingualText;
  restAdvice: MultilingualText;
}

export interface ProgressLogEntry {
  id: string;
  woundTrackId?: string; // Identifier for grouping scans of the same wound
  woundTitle?: string; // Descriptive title e.g. "Forearm Laceration", "Right Heel Ulcer"
  patientName?: string;
  woundLocation?: string; // e.g. "Left Arm", "Right Leg", "Lower Back"
  date: string; // YYYY-MM-DD timestamp
  dayNumber?: number; // Day 1, Day 3, Day 5, etc.
  imageUrl: string;
  woundType: WoundType;
  severity: SeverityLevel;
  infectionRiskScore: number; // 0-100%
  lengthCm: number;
  widthCm: number;
  areaCm2?: number; // Calculated or measured surface area in cm²
  granulationPercent?: number; // 0-100% healthy healing tissue
  painLevel?: number; // 1-10 VAS score
  comparisonStatus: 'Healing' | 'Stable' | 'Worsening';
  comparisonNotes: string;
  patientMode: PatientMode;
}

export const resolveWoundTrackId = (woundType?: string, customTrackId?: string): string => {
  if (customTrackId && customTrackId !== 'all') return customTrackId;
  const wt = (woundType || '').toLowerCase();
  if (wt.includes('lacerat')) return 'track-laceration-forearm';
  if (wt.includes('ulcer') || wt.includes('diabet')) return 'track-ulcer-heel';
  if (wt.includes('abras')) return 'track-pediatric-abrasion';
  if (wt.includes('burn')) return 'track-burn-recovery';
  if (wt.includes('punct')) return 'track-puncture-foot';
  if (wt.includes('surg') || wt.includes('incis')) return 'track-surgical-abdomen';
  return `track-${wt.replace(/[^a-z0-9]+/g, '-') || 'general'}`;
};

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface MedicalFacility {
  id: string;
  name: string;
  type: 'Primary Health Centre (PHC)' | 'Community Health Centre (CHC)' | 'Government Hospital' | '24x7 Clinic' | 'Vaccination Centre';
  distanceKm: number;
  phone: string;
  address: string;
  hasVaccines: boolean;
  has24x7Emergency: boolean;
  lat: number;
  lng: number;
}

export interface ForeignObjectData {
  detected: boolean;
  objectType?: 'glass' | 'metal' | 'wood' | 'gravel' | 'fabric' | 'unknown' | string;
  depth?: 'superficial' | 'deep';
  warningMessage?: MultilingualText;
  medicalRationale?: MultilingualText;
  firstAidSteps?: FirstAidStep[];
}

export interface ColorSegmentationData {
  hemorrhagePercent: number; // % fresh red active blood pool
  granulationPercent: number; // % healthy vascular red/pink tissue bed
  sloughPercent: number; // % yellowish devitalized fibrin
  necroticPercent: number; // % black/brown eschar
  intactMarginPercent: number; // % epithelializing border
}

export interface BloodLossData {
  estimatedVolumeMl: number;
  category: 'Minimal (<50ml)' | 'Moderate (50-250ml)' | 'Severe (>250ml)';
  requiresTourniquet: boolean;
  visualCueDescription?: MultilingualText;
  colorSegmentation?: ColorSegmentationData;
  depthCategory?: 'superficial' | 'partial-thickness' | 'full-thickness' | 'deep-arterial';
  hemorrhageRateMlMin?: number;
}

export interface BiteData {
  biteType: 'snake' | 'dog' | 'cat' | 'rat' | 'insect' | 'none';
  matchedSpecies?: string;
  isVenomous?: boolean;
  antiVenomGuide?: MultilingualText;
  rabiesSchedule?: string[]; // Day 0, Day 3, Day 7, Day 14, Day 28
  leptoWarning?: MultilingualText;
  antibioticAdvice?: MultilingualText;
}

export interface WoundAgeData {
  hoursOld: number;
  category: 'Fresh (0-6h)' | 'Recent (6-24h)' | 'Old (>24h)';
  closureGuidance: MultilingualText;
  confidenceScore: number;
  requiresMandatoryDoctor: boolean;
}

export interface AyurvedicRemedy {
  remedyName: MultilingualText;
  ingredients: MultilingualText[];
  applicationMethod: MultilingualText;
  classicalSource: string; // e.g., "Sushruta Samhita • Chikitsa Sthana"
}

export interface AllergyProfile {
  iodine: boolean;
  latex: boolean;
  adhesiveBandages: boolean;
  penicillin: boolean;
  aspirin: boolean;
}

export interface ScarRiskData {
  scorePercent: number; // 0-100%
  riskCategory: 'Low' | 'Medium' | 'High';
  recommendations: MultilingualText[];
  estimatedFadeTime: string; // e.g., "6 - 12 Months"
}

export interface PhotoQuality {
  scorePercent: number; // 0-100%
  isAcceptable: boolean;
  brightnessScore: number;
  sharpnessScore: number;
  centeringScore: number;
  issues: string[];
  suggestions: string[];
}

export interface MultiWoundItem {
  id: string;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] percentages 0-100
  woundType: WoundType;
  severity: SeverityLevel;
  priorityOrder: number;
  firstAidSummary: MultilingualText;
}

export interface WeatherData {
  tempC: number;
  humidityPercent: number;
  condition: string;
  isRaining: boolean;
  advice: MultilingualText;
}

export interface WorkplaceReport {
  id: string;
  companyName: string;
  employeeName: string;
  dateTime: string;
  locationGps: string;
  woundType: string;
  severity: string;
  firstAidAdministered: string;
  witnessName: string;
  supervisorName: string;
  hospitalVisitRequired: boolean;
  digitalSignature?: string;
}

export interface InsuranceClaim {
  id: string;
  patientName: string;
  dateTime: string;
  locationGps: string;
  woundType: string;
  severity: string;
  firstAidSteps: string;
  estimatedExpensesINR: number;
  hospitalName: string;
  policyNumber: string;
  providerName: string;
  qrCodeDataUrl?: string;
}

export interface ClassificationLogit {
  label: WoundType;
  probability: number; // 0.0 to 1.0 (or % percentage)
  rawScore?: number;
}

export interface SnakeSpeciesProbability {
  speciesName: string; // e.g. "Russell's Viper (Daboia russelii)", "Spectacled Cobra (Naja naja)"
  localName: MultilingualText;
  probability: number; // 0.0 - 1.0 (e.g. 0.84)
  venomType: 'Hemotoxic (Coagulopathy / Bleeding)' | 'Neurotoxic (Paralysis / Respiratory)' | 'Cytotoxic / Local Tissue Necrosis' | 'Non-Venomous';
  punctureMorphology: string; // e.g. "2 distinct paired fangs (14-16mm apart)"
  antivenomVialsIndicated: number; // e.g. 10 vials polyvalent ASV
  dangerLevel: 'Critical Emergency' | 'High Emergency' | 'Moderate' | 'Low / Non-Venomous';
  symptomsToWatch: MultilingualText;
  firstAidRecommendation: MultilingualText;
}

export interface PathogenProbability {
  pathogenName: string; // e.g. "Staphylococcus aureus / MRSA", "Pseudomonas aeruginosa", "Clostridium tetani"
  probability: number; // 0.0 - 1.0
  type: 'Bacterial (Gram+)' | 'Bacterial (Gram-)' | 'Anaerobic Spore' | 'Fungal Opportunistic';
  biofilmRisk: 'High' | 'Medium' | 'Low';
  firstLineAntibacterial: string; // e.g. "Povidone-Iodine 5% / Framycetin 1% Ointment"
  clinicalSign: MultilingualText;
}

export interface UnderlyingDiseaseEtiology {
  condition: string; // e.g. "Type 2 Diabetic Microangiopathy & Neuropathy", "Chronic Venous Insufficiency (CVI)", "Peripheral Arterial Occlusion", "Mechanical Kinetic Shearing", "Healthy Intact Skin"
  probability: number; // 0.0 - 1.0
  severityImpact: 'Primary Etiology' | 'Aggravating Comorbidity' | 'Secondary Trigger' | 'None';
  recommendations: MultilingualText;
  relevantVitalsOrLabs: string[]; // e.g. ["HbA1c & Fasting Glucose", "Ankle-Brachial Index (ABI)", "CBC Leukocyte Count"]
}

export interface EtiologyAnalysis {
  primaryCause: MultilingualText;
  primaryCategory: 'Trauma & Mechanical' | 'Snakebite & Envenomation' | 'Animal / Vector Bite' | 'Infectious / Bacterial Bioburden' | 'Chronic Vascular / Diabetic' | 'Thermal / Burn' | 'Healthy Epidermal Tissue';
  confidenceScore: number; // 0 - 100
  overallEnvenomationProbability: number; // 0 - 100%
  overallInfectionProbability: number; // 0 - 100%
  overallChronicDiseaseProbability: number; // 0 - 100%
  snakeSpeciesBreakdown?: SnakeSpeciesProbability[];
  pathogenProbabilities?: PathogenProbability[];
  underlyingDiseases?: UnderlyingDiseaseEtiology[];
  differentialDiagnoses: {
    diagnosisName: MultilingualText;
    probability: number;
    category: string;
    clinicalSupportRationale: MultilingualText;
  }[];
}

// VLM Schema Specification Types
export type GateStatus = 'NO_IMAGE_CONTENT' | 'NOT_BODY_PART' | 'BODY_PART_NO_WOUND' | 'WOUND_PRESENT';
export type SeverityGrade = 'minor' | 'moderate' | 'severe' | 'emergency';

export interface VLMGateFailedResult {
  gate_status: 'NO_IMAGE_CONTENT' | 'NOT_BODY_PART' | 'BODY_PART_NO_WOUND';
  confidence: number;
  message: string;
  proceed: false;
}

export interface VLMDifferentialEtiology {
  label: string;
  posterior_probability: number;
  reasoning: string;
}

export interface VLMHomeRemedy {
  name: string;
  source_citation: string;
  ingredients: string[];
  method: string;
  disclaimer: string;
}

export interface VLMDietHydrationAdvisory {
  eat: string[];
  avoid: string[];
  hydration: string;
  rest: string;
}

export interface VLMWoundPresentResult {
  gate_status: 'WOUND_PRESENT';
  patient_mode: 'child' | 'adult';
  wound_type: string;
  visual_markers: string[];
  estimated_size_cm: string;
  severity_grade: SeverityGrade;
  confidence: number;
  differential_etiologies: VLMDifferentialEtiology[];
  clinical_diagnosis_summary: string;
  recommend_professional_care: boolean;
  self_care_safe: boolean;
  age_specific_flags: string[];
  first_aid_steps: string[];
  home_remedy: VLMHomeRemedy;
  diet_hydration_advisory: VLMDietHydrationAdvisory;
  recheck_window: string;
}

export type VLMAnalysisResponse = VLMGateFailedResult | VLMWoundPresentResult;

export interface WoundAnalysisResult {
  id: string;
  timestamp: string;
  woundType: WoundType;
  woundTypeDescription: MultilingualText;
  severity: SeverityLevel;
  confidenceScore: number; // 0-100
  affectedAreaEstimate: string; // e.g. "approx 3.5cm x 1.8cm"
  measurement?: WoundMeasurement;
  infectionRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  infectionRiskScore: number; // 0 to 100 percentage
  infectionVisualCues?: string[]; // e.g. ['Redness/Erythema', 'Tissue Swelling', 'Erythematous border']
  triageSummary: MultilingualText;
  immediateActionRequired: boolean;
  firstAidSteps: FirstAidStep[];
  criticalWarnings: MultilingualText[];
  recommendedMedicinesOrDressings: MultilingualText[];
  medicineRecommendations?: MedicineRecommendation[];
  recoveryDiet?: RecoveryDiet;
  tetanusRiskDetected: boolean;
  pediatricNotes?: MultilingualText;
  isChildMode?: boolean;
  doctorVisitUrgency: MultilingualText;
  modelEngineUsed: string;
  processingTimeMs: number;
  isNoWoundDetected?: boolean;
  woundPresenceDetected?: boolean;
  woundPresenceGateScore?: number; // 0 - 100 percentage from Stage 1 Binary Gate
  woundPresenceGateReason?: MultilingualText;
  classificationLogits?: ClassificationLogit[];
  edgeQuantizationMode?: string;
  safeguardTriggered?: boolean;

  // WoundCare-VLM Strict Schema Integration
  gate_status?: GateStatus;
  severity_grade?: SeverityGrade;
  visual_markers?: string[];
  estimated_size_cm?: string;
  recommend_professional_care?: boolean;
  self_care_safe?: boolean;
  age_specific_flags?: string[];
  recheck_window?: string;
  vlmHomeRemedy?: VLMHomeRemedy;
  diet_hydration_advisory?: VLMDietHydrationAdvisory;
  vlmDifferentialEtiologies?: VLMDifferentialEtiology[];
  vlmGateFailed?: VLMGateFailedResult;
  vlmWoundPresent?: VLMWoundPresentResult;
  rawVLMJson?: any;
  proceed?: boolean;
  gateMessage?: MultilingualText;
  
  // Brand New Feature Analysis Extensions
  etiologyAnalysis?: EtiologyAnalysis;
  foreignObject?: ForeignObjectData;
  bloodLoss?: BloodLossData;
  biteData?: BiteData;
  woundAge?: WoundAgeData;
  ayurvedicRemedies?: AyurvedicRemedy[];
  scarRisk?: ScarRiskData;
  photoQuality?: PhotoQuality;
  multiWounds?: MultiWoundItem[];
  weatherData?: WeatherData;
  isDiabeticMode?: boolean;
  allergiesFiltered?: string[];
}


export interface SampleWoundCase {
  id: string;
  title: string;
  woundType: WoundType;
  severity: SeverityLevel;
  description: string;
  patientContext: string;
  imageUrl: string;
}

export type BodyRegion = 'head' | 'neck' | 'torso' | 'left-arm' | 'right-arm' | 'left-leg' | 'right-leg' | 'hands-feet';

export interface CaseRecord {
  id: string;
  timestamp: string;
  patientName?: string;
  location?: string;
  bodyRegion?: BodyRegion;
  imageUrl: string;
  result: WoundAnalysisResult;
  notes?: string;
  status: 'Fresh' | 'Dressed' | 'Healing' | 'Referred to Hospital';
}

export interface ResearchMetric {
  woundType: WoundType;
  precision: number;
  recall: number;
  f1Score: number;
  datasetSamples: number;
}

// -------------------------------------------------------------
// OCULAR & SKIN SCREENING MODULE TYPES
// -------------------------------------------------------------
export type ScanType = 'eye' | 'skin_bite';
export type OcularSkinGateStatus = 'NO_IMAGE_CONTENT' | 'NOT_MATCHING_SCAN_TYPE' | 'POOR_QUALITY' | 'VALID';
export type ScleralColorBand = 'white/normal' | 'mild_yellowing' | 'moderate_yellowing' | 'marked_yellowing';
export type ConjunctivalInjectionBand = 'none' | 'mild' | 'moderate' | 'severe';
export type ConjunctivalPallorBand = 'normal' | 'pale' | 'very_pale' | 'not_assessable_from_image';
export type DischargeBand = 'none' | 'watery' | 'mucoid' | 'purulent';
export type UrgencyBand = 'no follow-up needed' | 'routine follow-up' | 'prompt evaluation (24-48h)' | 'urgent evaluation (same day)';

export interface Stage1EyeFindings {
  scleral_color: ScleralColorBand;
  conjunctival_injection: ConjunctivalInjectionBand;
  conjunctival_pallor: ConjunctivalPallorBand;
  discharge: DischargeBand;
  periorbital_signs: Array<'swelling' | 'dark_circles' | 'ptosis'> | 'none';
  other_visible_findings: string;
}

export interface Stage1SkinBiteFindings {
  lesion_pattern: 'single' | 'clustered_tight' | 'linear/row' | 'scattered_multiple' | 'none_visible';
  lesion_appearance?: {
    papule_size_band: 'small <0.5cm' | 'medium 0.5-1cm' | 'large >1cm' | 'not_applicable';
    central_punctum_present: boolean;
    wheal_flare_present: boolean;
    blistering_present: boolean;
  };
  visible_skin_integrity: string;
}

export interface DifferentialItem {
  differential: string;
  supporting_signs: string[];
  certainty_language: string;
}

export interface BiteAssessment {
  lesion_pattern: 'single' | 'clustered_tight' | 'linear/row' | 'scattered_multiple';
  lesion_appearance: {
    papule_size_band: 'small <0.5cm' | 'medium 0.5-1cm' | 'large >1cm';
    central_punctum_present: boolean;
    wheal_flare_present: boolean;
    blistering_present: boolean;
  };
  likely_category: 
    | 'consistent with common mosquito bite'
    | 'consistent with flea/bed bug pattern (clustered/linear)'
    | 'consistent with spider or larger arthropod bite'
    | 'indeterminate insect bite'
    | 'not clearly an insect bite — consider other dermatologic cause';
  red_flags: string[];
  systemic_symptom_advisory?: string;
}

export interface OcularSkinGateFailedResult {
  gate_status: 'NO_IMAGE_CONTENT' | 'NOT_MATCHING_SCAN_TYPE' | 'POOR_QUALITY';
  confidence: number;
  message: string;
  proceed: false;
}

export interface OcularSkinValidResult {
  gate_status: 'VALID';
  scan_type: ScanType;
  patient_mode: PatientMode;
  stage1_findings: Stage1EyeFindings | Stage1SkinBiteFindings;
  finding_summary: string;
  differential?: DifferentialItem[];
  bite_assessment?: BiteAssessment;
  recommend_professional_care: boolean;
  urgency: UrgencyBand;
  age_specific_note: string;
}

export type OcularSkinScreeningResponse = OcularSkinGateFailedResult | OcularSkinValidResult;

// -------------------------------------------------------------
// EYE & SYSTEMIC DISEASE SCREENING TYPES (Jaundice, Typhoid, Anemia, etc.)
// -------------------------------------------------------------
export type EyeConditionType =
  | 'Healthy Normal Eye'
  | 'Jaundice / Scleral Icterus'
  | 'Typhoid Fever (Ocular & Toxemic Signs)'
  | 'Severe Anemia (Conjunctival Pallor)'
  | 'Infectious Conjunctivitis (Bacterial / Viral)'
  | 'Vitamin A Deficiency (Bitot\'s Spots / Xerophthalmia)'
  | 'Severe Dehydration (Sunken Eye / Microcirculation)'
  | 'Subconjunctival Hemorrhage'
  | 'Allergic Blepharoconjunctivitis'
  | 'Corneal Abrasion / Keratitis';

export interface ScleraBiomarkers {
  scleralIcterusScore: number; // 0 - 100% yellowing severity
  estimatedSerumBilirubinMgDl: string; // e.g. "3.8 - 6.2 mg/dL" or "< 1.2 mg/dL"
  scleralVascularityScore: number; // 0 - 100% injection/redness
  subconjunctivalHemorrhagePresent: boolean;
  yellowingZone: 'None' | 'Peripheral Sclera' | 'Diffuse 360° Sclera' | 'Severe Deep Icteric';
  keratomalaciaRisk: 'None' | 'Low' | 'Moderate' | 'High';
}

export interface ConjunctivaBiomarkers {
  conjunctivalPallorScore: number; // 0 - 100% pallor severity (anemia)
  estimatedHemoglobinGDl: string; // e.g. "6.5 - 8.2 g/dL" or "> 13.0 g/dL"
  conjunctivalInjectionScore: number; // 0 - 100% typhoid / conjunctivitis redness
  cobblestonePapillae: boolean;
  dischargeType: 'None' | 'Watery / Serous' | 'Purulent / Mucopurulent' | 'Crusted';
  chemosisGrade: 'None' | 'Mild' | 'Moderate' | 'Severe';
}

export interface SystemicDiseaseScore {
  name: string;
  category: 'Hepatic / Biliary' | 'Enteric / Infectious' | 'Hematologic' | 'Ocular Local' | 'Nutritional / Metabolic';
  probabilityPercent: number;
  clinicalSignsObserved: string[];
  recommendedLabTests: string[];
  dangerLevel: 'Safe' | 'Moderate' | 'High' | 'Emergency';
}

export interface EyeDiseaseAnalysisResult {
  id: string;
  timestamp: string;
  eyeExamined: 'Left Eye (OS)' | 'Right Eye (OD)' | 'Both Eyes (OU)' | 'Periorbital / Facial';
  primaryCondition: EyeConditionType;
  confidenceScore: number; // 0 - 100%
  severity: 'None' | 'Minor' | 'Moderate' | 'Severe' | 'Critical Emergency';
  scleraBiomarkers: ScleraBiomarkers;
  conjunctivaBiomarkers: ConjunctivaBiomarkers;
  
  // Quantitative Disease Probability Scores
  jaundiceRiskScore: number; // 0 - 100
  typhoidRiskScore: number; // 0 - 100
  anemiaRiskScore: number; // 0 - 100
  conjunctivitisRiskScore: number; // 0 - 100
  vitaminADeficiencyRiskScore: number; // 0 - 100
  dehydrationRiskScore: number; // 0 - 100

  systemicDiseaseBreakdown: SystemicDiseaseScore[];
  
  differentialDiagnoses: {
    condition: EyeConditionType;
    probability: number;
    reasoning: MultilingualText;
  }[];

  clinicalDiagnosisSummary: MultilingualText;
  triageUrgency: MultilingualText;
  urgentReferralRequired: boolean;
  hospitalReferralTimeframe: MultilingualText;
  redFlags: MultilingualText[];
  firstAidAndImmediateCare: FirstAidStep[];
  
  ayurvedicAndDietaryGuidance: {
    herbalSupport: {
      name: MultilingualText;
      botanical: string;
      role: MultilingualText;
      preparation: MultilingualText;
    }[];
    dietaryFoodsToEat: MultilingualText[];
    dietaryFoodsToAvoid: MultilingualText[];
    hydrationGuideline: MultilingualText;
  };

  recommendedDiagnosticPanels: {
    testName: string;
    targetBiomarker: string;
    clinicalRationale: MultilingualText;
    urgency: 'Routine' | 'Within 24 Hours' | 'Immediate Emergency';
  }[];

  modelEngineUsed: string;
  processingTimeMs: number;
}

export interface SampleEyeCase {
  id: string;
  title: string;
  conditionType: EyeConditionType;
  severity: SeverityLevel | 'Critical Emergency';
  description: string;
  clinicalSigns: string;
  imageUrl: string;
  patientMode: PatientMode;
}

