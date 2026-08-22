import { detectAll, detectCrop } from './cropDetect';
import { retrieveDocuments, formatContext } from './retrieval';
import { callLLM } from './llm';
import { validateCitations, formatCitationsForPanel } from './citations';
import { AGRICULTURAL_SYSTEM_PROMPT, buildUserMessage } from '../prompts/agricultural';
import { generateIMDWeatherBulletin, IMDWeatherAdvisory } from './weather';

export interface RAGInput {
  crop: string | null;
  question: string;
  language: string;
  sessionId: string | null;
  farmContext?: {
    district?: string;
    region?: string;
    block?: string;
    season?: string;
    variety?: string;
    soil?: string;
  };
}

export interface RAGOutput {
  answer: string;
  crop: string | null;
  intent: string;
  citations: Array<{ id: number; title: string; url: string; sourceId: string; relevance: number }>;
  provider: string;
  isDemo: boolean;
  language: string;
  outOfScope: boolean;
  weather?: IMDWeatherAdvisory;
  farmContext?: {
    district?: string;
    region?: string;
    block?: string;
    season?: string;
    variety?: string;
    soil?: string;
  };
}

// Session memory (in-process, per sessionId)
const sessions: Map<string, { crop: string | null; language: string }> = new Map();

export async function runRAGPipeline(input: RAGInput): Promise<RAGOutput> {
  const { question, sessionId, farmContext } = input;

  // ─── Step 1: Session Memory ──────────────────────────────────────────────
  let sessionCrop = input.crop;
  let sessionLang = input.language || 'en';

  if (sessionId) {
    const prev = sessions.get(sessionId);
    if (prev) {
      if (!sessionCrop && prev.crop) sessionCrop = prev.crop;
      if (!sessionLang && prev.language) sessionLang = prev.language;
    }
  }

  // ─── Step 2: Detect crop, intent, language, rewrite query ────────────────
  const detection = detectAll(question, sessionCrop, farmContext?.variety);
  const finalCrop = detection.crop || sessionCrop || 'groundnut';
  
  // Explicit UI language selection (e.g. 'kn') takes absolute precedence.
  // If the user selected Kannada, or wrote in Kannada script, ALWAYS respond in Kannada.
  const finalLang: 'en' | 'kn' =
    input.language === 'kn' || detection.language === 'kn'
      ? 'kn'
      : (input.language === 'en' ? 'en' : (sessionLang === 'kn' ? 'kn' : 'en'));

  // Update session
  if (sessionId) {
    sessions.set(sessionId, { crop: finalCrop, language: finalLang });
  }

  // ─── Step 3: Out-of-scope crop check ────────────────────────────────────
  const mentionedCrop = detectCrop(question);
  if (!mentionedCrop && !sessionCrop) {
    const nonSupportedKeywords = ['ragi','sugarcane','cotton','tomato','onion','potato','coconut','mango','pomegranate','banana','wheat','soybean','soya'];
    const lq = question.toLowerCase();
    const badCrop = nonSupportedKeywords.find(k => lq.includes(k));
    if (badCrop) {
      return {
        answer: `This version of Sahyadri Chatbot currently focuses on **Groundnut (🥜), Rice/Paddy (🌾), Maize (🌽), and Arecanut (🌴)**.\n\nFor questions about ${badCrop}, please consult your local KVK or agricultural extension officer.`,
        crop: null,
        intent: 'general',
        citations: [],
        provider: 'system',
        isDemo: false,
        language: finalLang,
        outOfScope: true,
      };
    }
  }

  // ─── Step 4: Retrieve Relevant Documents ─────────────────────────────────
  const results = retrieveDocuments({
    query: detection.rewrittenQuery,
    crop: finalCrop,
    intent: detection.intent,
    topK: 7,
  });

  const { contextText, sourceList, citations } = formatContext(results);

  // ─── Step 5: Fetch IMD Weather Data for Farmer's Location ───────────────
  const district = farmContext?.district || farmContext?.region || 'Shivamogga';
  const block = farmContext?.block || district;
  const weatherBulletin = generateIMDWeatherBulletin(district, block, finalCrop, finalLang);

  const totalRain = weatherBulletin.records.reduce((s, r) => s + r.rainfallMm, 0).toFixed(1);
  const maxTemp = Math.max(...weatherBulletin.records.map((r) => r.tempMaxC));
  const minTemp = Math.min(...weatherBulletin.records.map((r) => r.tempMinC));
  const morningRh = weatherBulletin.records[0]?.rhMorningPct ?? 88;
  const afternoonRh = weatherBulletin.records[0]?.rhAfternoonPct ?? 65;
  const windSpeed = weatherBulletin.records[0]?.windSpeedKmh ?? 11;
  const windDir = weatherBulletin.records[0]?.windDirection ?? 'WSW';
  const cloudCover = weatherBulletin.records[0]?.cloudCoverOcta ?? 4;

  const weatherContext = `Location: ${district} (${block}) | 5-Day Total Rain: ${totalRain} mm | Temp: ${minTemp}°C–${maxTemp}°C | Morning RH: ${morningRh}% | Afternoon RH: ${afternoonRh}% | Wind: ${windSpeed} km/h from ${windDir} | Cloud Cover: ${cloudCover}/8 octa.
IMD Bulletin Summary: ${weatherBulletin.summary150to200Words}`;

const VALID_CROP_VARIETIES: Record<string, string[]> = {
  groundnut: ['tmv-2', 'tmv 2', 'gpbd-4', 'gpbd 4', 'girnar-2', 'kadiri-6', 'jl-24', 'tag-24', 'krg-1', 'dh-86', 'icgv-91114', 'k-6'],
  rice: ['jyothi', 'bpt-5204', 'bpt 5204', 'sona masuri', 'sindhu', 'ir-64', 'ir 64', 'krh-2', 'intan', 'jaya', 'tunga', 'mtu-1001', 'mtu-1010', 'rnr-15048', 'kpr-1', 'mukthi'],
  maize: ['nk-6240', 'nk 6240', 'cp-818', 'dkc-9108', 'pioneer', '30v92', 'nithyashree', 'kaveri', 'kmh-3712', 'hema', 'nah-1137'],
  arecanut: ['mangala', 'sumangala', 'sreemangala', 'mohitnagar', 'shivamogga local', 'sirsi local', 'skpa-1', 'south kanara local', 'thirthahalli'],
};

const DEFAULT_CROP_VARIETY: Record<string, string> = {
  groundnut: 'TMV-2',
  rice: 'Jyothi',
  maize: 'NK-6240',
  arecanut: 'Mohitnagar',
};

function sanitizeFarmContext(farmCtx: RAGInput['farmContext'], crop: string): RAGInput['farmContext'] {
  if (!farmCtx) return farmCtx;

  const currentVariety = farmCtx.variety?.trim();
  if (!currentVariety) return farmCtx;

  const validVarieties = VALID_CROP_VARIETIES[crop] || [];
  const lowerVar = currentVariety.toLowerCase();
  const isValid = validVarieties.some((v) => lowerVar.includes(v) || v.includes(lowerVar));

  if (!isValid) {
    const correctedVariety = DEFAULT_CROP_VARIETY[crop] || 'Recommended Regional Variety';
    return {
      ...farmCtx,
      variety: correctedVariety,
    };
  }

  return farmCtx;
}

  // ─── Step 6: Build LLM Messages with Validated Farm Context, Variety, and Weather ──
  const sanitizedFarmContext = sanitizeFarmContext(farmContext, finalCrop);

  const userMessage = buildUserMessage({
    question,
    crop: finalCrop,
    intent: detection.intent,
    language: finalLang,
    context: contextText,
    sourceList,
    weatherContext,
    farmContext: sanitizedFarmContext,
  });

  // ─── Step 7: Generate Answer with Gemini / LLM ────────────────────────────
  const llmResult = await callLLM(AGRICULTURAL_SYSTEM_PROMPT, userMessage);

  // ─── Step 8: Validate Citations ───────────────────────────────────────────
  const validCitations = validateCitations(llmResult.text, citations);
  const formattedCitations = formatCitationsForPanel(validCitations);

  return {
    answer: llmResult.text,
    crop: finalCrop,
    intent: detection.intent,
    citations: formattedCitations,
    provider: llmResult.provider,
    isDemo: llmResult.provider === 'mock',
    language: finalLang,
    outOfScope: false,
    weather: weatherBulletin,
    farmContext: sanitizedFarmContext,
  };
}

