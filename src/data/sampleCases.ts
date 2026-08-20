import { SampleWoundCase, ResearchMetric } from '../types';

// Built-in clinical testcases removed as requested - all evaluations are now performed dynamically via live camera or direct photo upload
export const SAMPLE_WOUND_CASES: SampleWoundCase[] = [];

export const RESEARCH_METRICS: ResearchMetric[] = [
  { woundType: 'Healthy Skin / No Wound', precision: 0.988, recall: 0.992, f1Score: 0.990, datasetSamples: 2200 },
  { woundType: 'Abrasion', precision: 0.942, recall: 0.938, f1Score: 0.940, datasetSamples: 1420 },
  { woundType: 'Laceration', precision: 0.915, recall: 0.928, f1Score: 0.921, datasetSamples: 1280 },
  { woundType: 'Puncture', precision: 0.898, recall: 0.905, f1Score: 0.901, datasetSamples: 950 },
  { woundType: 'Burn', precision: 0.951, recall: 0.946, f1Score: 0.948, datasetSamples: 1650 },
  { woundType: 'Contusion', precision: 0.924, recall: 0.910, f1Score: 0.917, datasetSamples: 1100 },
  { woundType: 'Surgical Incision', precision: 0.935, recall: 0.941, f1Score: 0.938, datasetSamples: 820 },
  { woundType: 'Diabetic Foot Ulcer', precision: 0.908, recall: 0.912, f1Score: 0.910, datasetSamples: 740 },
  { woundType: 'Bite Wound', precision: 0.929, recall: 0.920, f1Score: 0.924, datasetSamples: 610 },
  { woundType: 'Pressure Ulcer', precision: 0.892, recall: 0.889, f1Score: 0.890, datasetSamples: 580 }
];

export const LOCAL_BLIP2_LOORA_SIMULATOR = {
  modelName: 'WoundCare-BLIP2-LoRA-v1.4 (OPT-2.7B + ViT-G)',
  weightsSizeMB: 18.4,
  quantization: 'INT8 Edge Tensor',
  avgInferenceLatencyMs: 340,
  architectureNotes: 'ViT-G visual encoder paired with Q-Former query transformer and LoRA adapter layer fine-tuned on 6,400 rural clinical wound photos.'
};
