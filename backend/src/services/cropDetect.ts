// Crop Detection & Intent Classification — Sahyadri Chatbot

import { CROPS } from '../data/sources';

export type CropId = 'groundnut' | 'rice' | 'maize' | 'arecanut' | null;
export type Intent =
  | 'crop_production'
  | 'nutrient_soil'
  | 'pest_disease'
  | 'irrigation_water'
  | 'harvest_postharvest'
  | 'general';

interface DetectionResult {
  crop: CropId;
  intent: Intent;
  language: 'en' | 'kn';
  rewrittenQuery: string;
}

// ─── Language Detection (Kannada Unicode range) ────────────────────────────
export function detectLanguage(text: string): 'en' | 'kn' {
  // Kannada Unicode: \u0C80-\u0CFF
  const kannadaChars = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
  return kannadaChars > 2 ? 'kn' : 'en';
}

// ─── Crop Detection ─────────────────────────────────────────────────────────
export function detectCrop(text: string, provided?: string | null): CropId {
  const lower = text.toLowerCase();

  // 1. FIRST check if the user's question explicitly mentions any crop or alias
  for (const crop of CROPS) {
    for (const alias of crop.aliases) {
      // Use regex word boundary or contains for Kannada script
      const regex = new RegExp(`(?:^|[\\s,.!?()_/-])${alias.toLowerCase()}(?:$|[\\s,.!?()_/-])`, 'i');
      if (regex.test(lower) || lower.includes(alias.toLowerCase())) {
        return crop.id as CropId;
      }
    }
  }

  // 2. Only if no crop is explicitly mentioned in the question, fall back to provided / selected tab
  if (provided) {
    const id = provided.toLowerCase().replace(/[^a-z]/g, '');
    if (['groundnut', 'peanut', 'shenga', 'kadlekayi'].includes(id)) return 'groundnut';
    if (['rice', 'paddy', 'bhatta'].includes(id)) return 'rice';
    if (['maize', 'corn', 'makkajola'].includes(id)) return 'maize';
    if (['arecanut', 'areca', 'adike'].includes(id)) return 'arecanut';
  }

  return null;
}

// ─── Intent Detection ───────────────────────────────────────────────────────
const INTENT_KEYWORDS: Record<Intent, string[]> = {
  crop_production: [
    'seed rate', 'sowing', 'spacing', 'variety', 'planting', 'transplant',
    'land preparation', 'nursery', 'germination', 'establishment', 'cultivation',
    'ಬಿತ್ತನೆ', 'ತಳಿ', 'ಸಸಿ', 'ಅಂತರ',
  ],
  nutrient_soil: [
    'fertilizer', 'npk', 'nutrient', 'manure', 'soil', 'urea', 'dap', 'potash',
    'micronutrient', 'deficiency', 'compost', 'organic', 'gypsum', 'lime', 'ph',
    'ಗೊಬ್ಬರ', 'ಮಣ್ಣು', 'ಪೋಷಕಾಂಶ',
  ],
  pest_disease: [
    'pest', 'disease', 'insect', 'fungus', 'blight', 'spot', 'rot', 'wilt',
    'control', 'spray', 'pesticide', 'fungicide', 'ipm', 'biological', 'armyworm',
    'blast', 'leafspot', 'tikka', 'koleroga', 'yellow leaf', 'virus', 'symptom',
    'ರೋಗ', 'ಕೀಟ', 'ಸಿಂಪಡಣೆ', 'ಹಳದಿ ಎಲೆ',
  ],
  irrigation_water: [
    'irrigat', 'water', 'moisture', 'rainfall', 'drought', 'drip', 'flood',
    'furrow', 'schedule', 'critical stage', 'waterlogging', 'drainage',
    'ನೀರಾವರಿ', 'ನೀರು', 'ಮಳೆ',
  ],
  harvest_postharvest: [
    'harvest', 'yield', 'maturity', 'storage', 'post-harvest', 'drying',
    'processing', 'threshing', 'milling', 'shelf life', 'ready', 'picking',
    'ಕಟಾವು', 'ಸಂಗ್ರಹ', 'ಬೆಳೆ ಸಾರ',
  ],
  general: [],
};

export function detectIntent(text: string): Intent {
  const lower = text.toLowerCase();
  let bestIntent: Intent = 'general';
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [Intent, string[]][]) {
    if (intent === 'general') continue;
    const score = keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; bestIntent = intent; }
  }
  return bestIntent;
}

// ─── Query Rewriter ──────────────────────────────────────────────────────────
export function rewriteQuery(question: string, crop: CropId, intent: Intent, variety?: string | null): string {
  const intentLabels: Record<Intent, string> = {
    crop_production: 'production sowing variety seed rate spacing cultivation',
    nutrient_soil:   'fertilizer nutrient management NPK dose soil',
    pest_disease:    'pest disease identification management control spray',
    irrigation_water:'irrigation water management critical stages schedule',
    harvest_postharvest: 'harvest maturity yield post-harvest storage',
    general:         'agronomy production management',
  };
  const cropTerm = crop || 'crop';
  const intentTerm = intentLabels[intent];
  const varietyTerm = variety ? `${variety} variety` : '';
  return `${cropTerm} ${varietyTerm} ${intentTerm} Karnataka recommendation ${question}`;
}

// ─── Master Detector ─────────────────────────────────────────────────────────
export function detectAll(question: string, providedCrop?: string | null, variety?: string | null): DetectionResult {
  const language = detectLanguage(question);
  const crop     = detectCrop(question, providedCrop);
  const intent   = detectIntent(question);
  const rewrittenQuery = rewriteQuery(question, crop, intent, variety);

  return { crop, intent, language, rewrittenQuery };
}

