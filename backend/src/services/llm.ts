import { GoogleGenerativeAI } from '@google/generative-ai';
import { AGRICULTURAL_SYSTEM_PROMPT, buildUserMessage } from '../prompts/agricultural';
import { generateIMDWeatherBulletin } from './weather';

// Lazy init Gemini client
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface LLMResponse {
  answer: string;
  provider: 'gemini' | 'claude' | 'mock';
  model: string;
  isDemo?: boolean;
}

export async function callLLM(params: {
  question: string;
  crop: string | null;
  intent: string;
  language: string;
  context: string;
  sourceList: string;
  weatherContext?: string;
  farmContext?: {
    district?: string;
    region?: string;
    block?: string;
    season?: string;
    variety?: string;
    soil?: string;
  };
  preferredProvider?: 'gemini' | 'claude' | 'auto';
}): Promise<LLMResponse> {
  const provider = params.preferredProvider || (process.env.LLM_PROVIDER as any) || 'gemini';

  if (provider === 'gemini') {
    try {
      return await callGemini(params);
    } catch (err: any) {
      console.warn('[LLM] Gemini call failed, falling back to mock PoP database:', err?.message || err);
      return callMock(params);
    }
  }

  return callMock(params);
}

async function callGemini(params: {
  question: string;
  crop: string | null;
  intent: string;
  language: string;
  context: string;
  sourceList: string;
  weatherContext?: string;
  farmContext?: any;
}): Promise<LLMResponse> {
  const client = getGeminiClient();
  const userMessage = buildUserMessage(params);

  const modelCandidates = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash-lite',
  ];

  let lastError: any = null;

  for (const modelName of modelCandidates) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: AGRICULTURAL_SYSTEM_PROMPT,
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1500,
          },
        });

        const text = result.response.text();
        return {
          answer: text,
          provider: 'gemini',
          model: modelName,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini] Model ${modelName} (attempt ${attempt}) error:`, err?.message || err);
        if (err?.message?.includes('429') && attempt === 1) {
          await new Promise((res) => setTimeout(res, 2000));
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error('All Gemini model candidates failed');
}

/**
 * High-precision mock responses based on official PoP 2026 and real IMD weather forecasts.
 */
export function callMock(params: {
  question: string;
  crop: string | null;
  intent: string;
  language: string;
  farmContext?: any;
}): LLMResponse {
  const isKannada = params.language === 'kn' || /[\u0C80-\u0CFF]/.test(params.question);
  const q = params.question.toLowerCase();
  const district = params.farmContext?.district || 'Shivamogga';
  const block = params.farmContext?.block || district;
  const variety = params.farmContext?.variety;

  // Retrieve exact real weather metrics for district/block
  const bulletin = generateIMDWeatherBulletin(district, block, params.crop || 'Groundnut', isKannada ? 'kn' : 'en');
  const rainTotal = bulletin.records.reduce((sum, r) => sum + r.rainfallMm, 0).toFixed(1);

  let crop = params.crop;
  if (!crop) {
    if (q.includes('rice') || q.includes('paddy') || q.includes('ಭತ್ತ')) crop = 'rice';
    else if (q.includes('maize') || q.includes('corn') || q.includes('ಮೆಕ್ಕೆಜೋಳ')) crop = 'maize';
    else if (q.includes('areca') || q.includes('adike') || q.includes('ಅಡಿಕೆ')) crop = 'arecanut';
    else crop = 'groundnut';
  }

  // ─── 1. Sowing & Weather Forecast Feasibility Query ───────────────────────
  const isSowingAndWeather =
    (q.includes('sow') || q.includes('sowing') || q.includes('ಬಿತ್ತನೆ')) &&
    (q.includes('weather') || q.includes('forecast') || q.includes('rain') || q.includes('ಮಳೆ') || q.includes('ಹವಾಮಾನ'));

  if (isSowingAndWeather) {
    if (isKannada) {
      if (crop === 'rice') {
        return {
          answer: `### ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ನೇರ ಉತ್ತರ
${district} ಜಿಲ್ಲೆಯ 5 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ ಒಟ್ಟು **${rainTotal} ಮಿ.ಮೀ ಮಳೆ**, 21°C–28°C ತಾಪಮಾನ ಮತ್ತು 88%–95% ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ. ಮುಂಗಾರು ಮಳೆಯ ಆರಂಭದ ಈ ಹಂತವು **ಭತ್ತದ (${variety || 'ಜ್ಯೋತಿ / ಬಿಪಿಟಿ-5204'})** ನರ್ಸರಿ (ಸಸಿಮಡಿ) ಬಿತ್ತನೆ ಅಥವಾ ನೇರ ಬಿತ್ತನೆಗೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ಸಮಯವಾಗಿದೆ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **[ಅಧಿಕ ಇಳುವರಿ ಮುಖ್ಯ ಕ್ರಮ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ತಳಿ]**: ಪ್ರತಿ ಹೆಕ್ಟೇರ್‌ಗೆ **20–25 ಕೆಜಿ** ಪ್ರಮಾಣೀಕೃತ ಬೀಜವನ್ನು ಬಳಸಿ (${variety || 'ಜ್ಯೋತಿ, ಬಿಪಿಟಿ-5204, ಐಆರ್-64'}). ಮೊಳಕೆ ಸಾಮರ್ಥ್ಯ >80% ಇರುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ.
2. **[ಸಸಿಮಡಿ ತಯಾರಿ ಮತ್ತು ನಾಟಿ ಅಂತರ]**: ಎತ್ತರಿಸಿದ ಸಸಿಮಡಿಗಳಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ. 20–25 ದಿನಗಳ ಸಸಿಗಳನ್ನು ಮುಖ್ಯ ಹೊಲದಲ್ಲಿ **20 x 10 ಸೆಂ.ಮೀ** ಅಂತರದಲ್ಲಿ ನಾಟಿ ಮಾಡಿ.
3. **[ರೋಗ ಮತ್ತು ಕೀಟ ನಿರ್ವಹಣೆ — ೩ ವಿಧಾನಗಳಲ್ಲಿ]**:
   - **ರಾಸಾಯನಿಕ ನಿರ್ವಹಣೆ (PoP 2026)**: ಬೆಂಕಿ ರೋಗ ತಡೆಯಲು ಪ್ರತಿ ಕೆಜಿ ಬೀಜಕ್ಕೆ **ಕಾರ್ಬೆಂಡಾಜಿಮ್ 50 WP @ 2 ಗ್ರಾಂ** ಬೆರೆಸಿ ಉಪಚರಿಸಿ.
   - **ಜೈವಿಕ ಮತ್ತು ಸಾವಯವ ನಿಯಂತ್ರಣ**: ಪ್ರತಿ ಕೆಜಿ ಬೀಜಕ್ಕೆ **ಟ್ರೈಕೋಡರ್ಮಾ ವಿರಿಡೆ @ 4 ಗ್ರಾಂ** ಮತ್ತು **ಅಜೋಸ್ಪಿರಿಲಮ್ (600 ಗ್ರಾಂ/ಹೆ) + ಪಿಎಸ್‌ಬಿ (600 ಗ್ರಾಂ/ಹೆ)** ಜೈವಿಕ ಗೊಬ್ಬರಗಳಿಂದ ಉಪಚರಿಸಿ.
   - **ಸಮಗ್ರ ಕೀಟ ಹಾಗೂ ರೋಗ ನಿರ್ವಹಣೆ (IPM)**: ಸಸಿಮಡಿ ಸುತ್ತ ನೀರು ಸರಾಗವಾಗಿ ಹರಿಯಲು ಬಸಿಗಾಲುವೆ ನಿರ್ಮಿಸಿ, ಕಳೆ ರಹಿತ ಶುದ್ಧ ಸಸಿಮಡಿ ಕಾಪಾಡಿ.

### 🌦️ ಐಎಂಡಿ 5-ದಿನಗಳ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಪ್ರಶ್ನೆ ಆಧಾರಿತ ಹವಾಮಾನ ಸಲಹೆ]**: ${district} ಜಿಲ್ಲೆಯಲ್ಲಿ 5 ದಿನಗಳಲ್ಲಿ ಒಟ್ಟು ${rainTotal} ಮಿ.ಮೀ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿರುವುದರಿಂದ ಮಣ್ಣಿನಲ್ಲಿ ಹದವಾದ ತೇವಾಂಶ ಸಿಕ್ಕ ಕೂಡಲೇ ನರ್ಸರಿ ಬಿತ್ತನೆ ಮುಗಿಸಿಕೊಳ್ಳಿ.
2. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ (Spray Window)]**: ಸಿಂಪಡಣೆಯನ್ನು ಬೆಳಿಗ್ಗೆ (6:30–9:00 AM) ಅಥವಾ ಸಂಜೆ (4:30–6:30 PM) ಗಾಳಿಯ ವೇಗ ಶಾಂತವಾಗಿದ್ದಾಗ (<8 ಕಿ.ಮೀ/ಗಂಟೆ) ನಡೆಸಿ.
3. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ/ಕೀಟ ಎಚ್ಚರಿಕೆ]**: ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯು ಬೆಂಕಿ ರೋಗ (ಬ್ಲಾಸ್ಟ್) ಉಲ್ಬಣಕ್ಕೆ ಕಾರಣವಾಗುವುದರಿಂದ ಬೀಜೋಪಚಾರವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಕೈಗೊಳ್ಳಿ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ಸಸಿಮಡಿಯಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಮುಖ್ಯ ಹೊಲದಲ್ಲಿ ನಾಟಿಯ ಸಮಯದಲ್ಲಿ ಸಮತೋಲನ ರಸಗೊಬ್ಬರವನ್ನು (100:50:50 NPK) ಶಿಫಾರಸಿನಂತೆ ನೀಡಿ.

### ಮೂಲಗಳು
[1] KSNUAHS Shivamogga — Rice Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIRR Hyderabad — Rice Cultivation Directives
    https://icar-iirr.org/`,
          provider: 'mock',
          model: 'pop-2026-sahyadri',
          isDemo: true,
        };
      }

      if (crop === 'maize') {
        return {
          answer: `### ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ನೇರ ಉತ್ತರ
${district} ಜಿಲ್ಲೆಯ 5 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ ಸುಮಾರು **${rainTotal} ಮಿ.ಮೀ ಮಳೆ** ಮತ್ತು 20°C–29°C ತಾಪಮಾನ ನಿರೀಕ್ಷೆಯಿದೆ. ಈ ಮಳೆಯಿಂದ ಮಣ್ಣಿನಲ್ಲಿ ಉತ್ತಮ ತೇವಾಂಶ ಶೇಖರಣೆಯಾಗುವುದರಿಂದ **ಮೆಕ್ಕೆಜೋಳ (${variety || 'NK-6240'})** ಬಿತ್ತನೆ ಮಾಡಲು ಇದು ಸಕಾಲವಾಗಿದೆ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **[ಅಧಿಕ ಇಳುವರಿ ಮುಖ್ಯ ಕ್ರಮ — ಬಿತ್ತನೆ ಸಾಲು ಅಂತರ ಮತ್ತು ಗಿಡಗಳ ಸಂಖ್ಯೆ]**: ಎಕರೆಗೆ **7.5–8 ಕೆಜಿ** (ಹೆಕ್ಟೇರಿಗೆ 18–20 ಕೆಜಿ) ಹೈಬ್ರಿಡ್ ಬೀಜ ಬಳಸಿ. ಸಾಲಿನಿಂದ ಸಾಲಿಗೆ **60 ಸೆಂ.ಮೀ** ಮತ್ತು ಗಿಡದಿಂದ ಗಿಡಕ್ಕೆ **20 ಸೆಂ.ಮೀ** ಅಂತರದಲ್ಲಿ 4-5 ಸೆಂ.ಮೀ ಆಳಕ್ಕೆ ಬಿತ್ತಿ (ಹೆಕ್ಟೇರಿಗೆ 66,666 ಗಿಡಗಳನ್ನು ಕಾಪಾಡಿ).
2. **[ಬುಡ ಗೊಬ್ಬರ (Basal Dose)]**: ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಶಿಫಾರಸು ಮಾಡಿದ ಸಾರಜನಕದ 30%, ಪೂರ್ಣ ಪ್ರಮಾಣದ ರಂಜಕ (75 ಕೆಜಿ/ಹೆ) ಮತ್ತು ಪೊಟ್ಯಾಷ್ (40 ಕೆಜಿ/ಹೆ) + ಸತು ಸಲ್ಫೇಟ್ (25 ಕೆಜಿ/ಹೆ) ಸಾಲುಗಳಲ್ಲಿ ಹಾಕಿ.
3. **[ರೋಗ ಮತ್ತು ಕೀಟ ನಿರ್ವಹಣೆ — ೩ ವಿಧಾನಗಳಲ್ಲಿ]**:
   - **ರಾಸಾಯನಿಕ ನಿರ್ವಹಣೆ (PoP 2026)**: ಸೈನಿಕ ಹುಳು (FAW) ಬಾಧೆ ತಡೆಯಲು **ಸಯಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 19.8% + ಥಿಯಾಮೆಥಾಕ್ಸಮ್ 19.8% FS @ 6 ಮಿ.ಲೀ/ಕೆಜಿ** ಬೀಜಕ್ಕೆ ಬೆರೆಸಿ ಉಪಚರಿಸಿ.
   - **ಜೈವಿಕ ಮತ್ತು ಸಾವಯವ ನಿಯಂತ್ರಣ**: ಬಿತ್ತನೆಗೆ ಮುನ್ನ **ಟ್ರೈಕೋಡರ್ಮಾ @ 4 ಗ್ರಾಂ/ಕೆಜಿ** ಮತ್ತು 5% ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (NSKE) ತಯಾರಿಸಿಟ್ಟುಕೊಳ್ಳಿ.
   - **ಸಮಗ್ರ ಕೀಟ ಹಾಗೂ ರೋಗ ನಿರ್ವಹಣೆ (IPM)**: ಹೊಲದ ಬದುಗಳಲ್ಲಿ 3-4 ಸಾಲು ಜೋಳ ಅಥವಾ ನೇಪಿಯರ್ ಹುಲ್ಲನ್ನು ಬಲೆ ಬೆಳೆಯಾಗಿ (Trap crop) ಬಿತ್ತಿ.

### 🌦️ ಐಎಂಡಿ 5-ದಿನಗಳ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಪ್ರಶ್ನೆ ಆಧಾರಿತ ಹವಾಮಾನ ಸಲಹೆ]**: ಮುನ್ಸೂಚನೆಯ ${rainTotal} ಮಿ.ಮೀ ಮಳೆಯ ನಂತರ ಮಣ್ಣು ಹದವಾದ ತಕ್ಷಣ (ಅತಿಯಾದ ಕೆಸರು ಇರದಂತೆ) ಬಿತ್ತನೆ ಕೈಗೊಳ್ಳಿ. ಭಾರಿ ಮಳೆ ಸುರಿಯುವ ದಿನ ಬಿತ್ತನೆ ತಪ್ಪಿಸಿ.
2. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ (Spray Window)]**: ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆಯನ್ನು ಶಾಂತ ಗಾಳಿಯ ವೇಳೆಯಲ್ಲಿ (ಗಂಟೆಗೆ <8 ಕಿ.ಮೀ) ಮುಂಜಾನೆ ಕೈಗೊಳ್ಳಿ.
3. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ/ಕೀಟ ಎಚ್ಚರಿಕೆ]**: ಮೊಳಕೆ ಬಂದ 10–15 ದಿನಗಳಲ್ಲಿ ಸುಳಿಯಲ್ಲಿ ಸೈನಿಕ ಹುಳುವಿನ (FAW) ಪಿನ್‌ಹೋಲ್ ರಂಧ್ರಗಳನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಗಮನಿಸಿ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ಸಾಲಿನಲ್ಲಿ ಒಂದೇ ಗಿಡವನ್ನು ಉಳಿಸಿಕೊಂಡು ನಿಖರ ಗಿಡಗಳ ಸಂಖ್ಯೆಯನ್ನು ಕಾಪಾಡುವುದು ಮೆಕ್ಕೆಜೋಳದ ಗರಿಷ್ಠ ಇಳುವರಿಗೆ ಮೊದಲ ಮೆಟ್ಟಿಲು.

### ಮೂಲಗಳು
[1] UAS Dharwad — Maize Package of Practices Karnataka (PoP 2026)
    https://www.uasd.edu/
[2] ICAR-IIMR Ludhiana — Maize Cultivation Guidelines
    https://iimr.icar.gov.in/`,
          provider: 'mock',
          model: 'pop-2026-sahyadri',
          isDemo: true,
        };
      }

      // Groundnut Kannada
      return {
        answer: `### ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ನೇರ ಉತ್ತರ
${district} ಜಿಲ್ಲೆಯ 5 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ ಒಟ್ಟು **${rainTotal} ಮಿ.ಮೀ ಮಳೆ**, 20°C–26°C ತಾಪಮಾನ, 85%–95% ಬೆಳಗಿನ ಆರ್ದ್ರತೆ ಮತ್ತು 8–12 ಕಿ.ಮೀ/ಗಂಟೆ ಗಾಳಿಯ ವೇಗ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ. ಮುಂಗಾರು ಮಳೆಯ ಈ ಹದವಾದ ತೇವಾಂಶವು **ಕಡಲೆಕಾಯಿ (${variety || 'TMV-2 / GPBD-4'})** ಬಿತ್ತನೆ ಮಾಡಲು ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ಸಮಯವಾಗಿದೆ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **[ಅಧಿಕ ಇಳುವರಿ ಮುಖ್ಯ ಕ್ರಮ — ಬಿತ್ತನೆ ಬೀಜ ಪ್ರಮಾಣ ಮತ್ತು ಸಾಲು ಅಂತರ]**: ಎಕರೆಗೆ **50 ಕೆಜಿ** (ಹೆಕ್ಟೇರಿಗೆ 125 ಕೆಜಿ) ಬೀಜದ ಕಾಳುಗಳನ್ನು ಬಳಸಿ. ಸಾಲಿನಿಂದ ಸಾಲಿಗೆ **30 ಸೆಂ.ಮೀ** ಮತ್ತು ಗಿಡದಿಂದ ಗಿಡಕ್ಕೆ **10 ಸೆಂ.ಮೀ** ಅಂತರದಲ್ಲಿ 4–5 ಸೆಂ.ಮೀ ಆಳಕ್ಕೆ ಬಿತ್ತಿ.
2. **[ಬುಡ ಗೊಬ್ಬರ ಮತ್ತು ಪೋಷಕಾಂಶ]**: ಬಿತ್ತನೆ ಕಾಲದಲ್ಲಿ ಎಕರೆಗೆ **10 ಕೆಜಿ ಸಾರಜನಕ, 20 ಕೆಜಿ ರಂಜಕ ಮತ್ತು 10 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ (NPK 25:50:25 kg/ha)** + ಸತು ಸಲ್ಫೇಟ್ (10 ಕೆಜಿ/ಎಕರೆ) ಸಾಲುಗಳಲ್ಲಿ ಹಾಕಿ.
3. **[ರೋಗ ಮತ್ತು ಕೀಟ ನಿರ್ವಹಣೆ — ೩ ವಿಧಾನಗಳಲ್ಲಿ]**:
   - **ರಾಸಾಯನಿಕ ನಿರ್ವಹಣೆ (PoP 2026)**: ಕೊಳೆರೋಗ ತಡೆಯಲು ಪ್ರತಿ ಕೆಜಿ ಬೀಜಕ್ಕೆ **ಮ್ಯಾಂಕೋಜೆಬ್ ಅಥವಾ ಕಾರ್ಬೆಂಡಾಜಿಮ್ 50 WP @ 2 ಗ್ರಾಂ** ಬೆರೆಸಿ ನೆರಳಿನಲ್ಲಿ ಒಣಗಿಸಿ.
   - **ಜೈವಿಕ ಮತ್ತು ಸಾವಯವ ನಿಯಂತ್ರಣ**: ಪ್ರತಿ ಕೆಜಿ ಬೀಜಕ್ಕೆ **ಟ್ರೈಕೋಡರ್ಮಾ @ 4 ಗ್ರಾಂ**, ನಂತರ **ರೈಜೋಬಿಯಂ (600 ಗ್ರಾಂ/ಹೆ)** ಮತ್ತು **ಪಿಎಸ್‌ಬಿ (600 ಗ್ರಾಂ/ಹೆ)** ಬೆರೆಸಿ ಬಿತ್ತಿ.
   - **ಸಮಗ್ರ ಕೀಟ ಹಾಗೂ ರೋಗ ನಿರ್ವಹಣೆ (IPM)**: ಬಿತ್ತನೆ ಸಾಲುಗಳಲ್ಲಿ ಬಸಿಗಾಲುವೆ ನಿರ್ಮಿಸಿ ಮತ್ತು ಹೊಲದ ಸುತ್ತಲೂ 3 ಸಾಲು ಸಜ್ಜೆ ಅಥವಾ ಜೋಳವನ್ನು ಗಡಿ ಬೆಳೆಯಾಗಿ ಬಿತ್ತಿ.

### 🌦️ ಐಎಂಡಿ 5-ದಿನಗಳ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಪ್ರಶ್ನೆ ಆಧಾರಿತ ಹವಾಮಾನ ಸಲಹೆ]**: ${district} ಜಿಲ್ಲೆಯಲ್ಲಿ 5 ದಿನಗಳಲ್ಲಿ ಒಟ್ಟು ${rainTotal} ಮಿ.ಮೀ ಮಳೆ ಮುನ್ಸೂಚನೆಯಿರುವುದರಿಂದ ಮಣ್ಣಿನಲ್ಲಿ ಹದವಾದ ತೇವಾಂಶ (ವಪ್ಸ ಸ್ಥಿತಿ) ಸಿಕ್ಕ ತಕ್ಷಣ ಬಿತ್ತನೆ ಮುಗಿಸಿಕೊಳ್ಳಿ.
2. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ (Spray Window)]**: ಸಿಂಪಡಣೆಯನ್ನು ಮುಂಜಾನೆ (6:30–9:00 AM) ಶಾಂತ ಗಾಳಿಯ ವೇಳೆಯಲ್ಲಿ (<8 ಕಿ.ಮೀ/ಗಂಟೆ) ನಡೆಸಿ.
3. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ/ಕೀಟ ಎಚ್ಚರಿಕೆ]**: ಹೆಚ್ಚಿನ ತೇವಾಂಶದಿಂದ ಕೊಳೆರೋಗ (Collar Rot) ಬರದಂತೆ ತಡೆಯಲು ಕಡ್ಡಾಯವಾಗಿ ಶಿಲೀಂಧ್ರನಾಶಕ ಬೀಜೋಪಚಾರ ಮಾಡಿ. ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ. ಬಿತ್ತನೆ ಮಾಡಿದ 30–35 ದಿನಗಳ ಹಂತದಲ್ಲಿ ಎಕರೆಗೆ 200 ಕೆಜಿ ಜಿಪ್ಸಮ್ ಮಣ್ಣಿಗೆ ಸೇರಿಸುವುದನ್ನು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಮರೆಯಬೇಡಿ.

### ಮೂಲಗಳು
[1] KSNUAHS Shivamogga — Groundnut Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIGR — Directorate of Groundnut Research
    https://www.icar-iigr.org.in/`,
        provider: 'mock',
        model: 'pop-2026-sahyadri',
        isDemo: true,
      };
    }

    // Sowing & Weather English
    if (crop === 'rice') {
      return {
        answer: `### Diagnosis & Direct Answer
The 5-day IMD weather forecast for **${district}** indicates cumulative rainfall of **${rainTotal} mm**, temperatures between **21°C–28°C**, morning relative humidity of **88%–95%**, and moderate winds of **8–14 km/h**. This rainfall and atmospheric moisture create highly favorable soil conditions to commence **Rice (${variety || 'Jyothi / BPT-5204'})** nursery sowing or direct seeded rice (DSR) operations for the Kharif season.

### What to do & Recommended Field Operations
1. **[Core Stage Operation & Higher Yield Priority]**: Use certified seed @ **20–25 kg/ha** for transplanted paddy or **40–50 kg/ha** for direct seeding. Recommended regional varieties include **${variety || 'Jyothi, BPT-5204, IR-64'}**. Ensure high germination (>80%).
2. **[Nursery Raising & Spacing]**: Sow pre-germinated seeds on raised nursery beds. Transplant 20–25 day-old seedlings at **20 x 10 cm spacing** with 2–3 seedlings per hill.
3. **[Pest & Disease Management — 3 Approaches]**:
   - **Chemical Control (PoP 2026)**: Treat seeds with **Carbendazim 50 WP @ 2 g/kg seed** to prevent seed-borne blast and seedling rot.
   - **Biological & Organic Control**: Inoculate with **Trichoderma viride @ 4 g/kg seed**, followed by **Azospirillum @ 600 g/ha** and **Phosphate Solubilizing Bacteria (PSB) @ 600 g/ha** bio-fertilizers.
   - **IPM & Cultural Practices**: Maintain clean raised nursery beds with surrounding 30 cm drainage channels to prevent seedling submergence.

### 🌦️ IMD Agromet 5-Day Weather-Based Advisory
1. **[Question-Specific Weather Advisory]**: With ${rainTotal} mm cumulative rainfall expected in ${district}, commence nursery sowing immediately once soil achieves workable moisture tilth.
2. **[Field Operation / Spray Window]**: Carry out sprays strictly during calm morning hours (6:30–9:00 AM) or late evening (4:30–6:30 PM) under wind speeds <8 km/h.
3. **[Micro-Climate & Agronomic Risk Alert]**: High relative humidity (>90%) combined with overcast skies accelerates fungal spore germination; complete seed treatment prior to sowing.

### ⚠️ Important Message for Farmer
Always test seed germination before sowing. Incorporate basal fertilizer (50% N + 100% P & K) during final puddling.

### Sources
[1] KSNUAHS Shivamogga — Rice Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIRR Hyderabad — Rice Cultivation Directives
    https://icar-iirr.org/`,
        provider: 'mock',
        model: 'pop-2026-sahyadri',
        isDemo: true,
      };
    }

    if (crop === 'maize') {
      return {
        answer: `### Diagnosis & Direct Answer
The 5-day IMD weather forecast for **${district}** shows total expected rainfall of **${rainTotal} mm**, temperatures ranging between **20°C–29°C**, and morning relative humidity of **85%–92%**. With adequate soil moisture accumulating from these rains, it is an optimal time to proceed with **Hybrid Maize (${variety || 'NK-6240'})** sowing for the Kharif season.

### What to do & Recommended Field Operations
1. **[Core Stage Operation & Higher Yield Priority]**: Use hybrid seed @ **18–20 kg/ha (7.5–8 kg/acre)**. Dibble single seeds at **60 cm row-to-row and 20 cm plant-to-plant spacing** at a depth of 4–5 cm to achieve the optimum plant population of 66,666 plants/ha.
2. **[Basal Fertilizer Application]**: Broadcast and incorporate basal fertilizer @ **50 kg N, 75 kg P2O5, and 40 kg K2O per hectare** along with **Zinc Sulphate @ 25 kg/ha** before sowing.
3. **[Pest & Disease Management — 3 Approaches]**:
   - **Chemical Control (PoP 2026)**: Treat seeds with **Cyantraniliprole 19.8% + Thiamethoxam 19.8% FS @ 6 mL/kg seed** for early 20-day protection against Fall Armyworm, followed by **Thiram @ 2.5 g/kg seed**.
   - **Biological & Organic Control**: Apply *Trichoderma harzianum* @ 4 g/kg seed and prepare 5% Neem Seed Kernel Extract (NSKE) for early whorl protection.
   - **IPM & Cultural Practices**: Plant 3–4 border rows of fodder sorghum or pearl millet as a barrier crop against pest migration.

### 🌦️ IMD Agromet 5-Day Weather-Based Advisory
1. **[Question-Specific Weather Advisory]**: Utilize the ${rainTotal} mm rainfall window to sow when soil has received good soaking moisture. Avoid sowing on days with torrential rain forecasts.
2. **[Field Operation / Spray Window]**: Plan any foliar applications during calm morning periods (6:30–9:00 AM) under low wind (<8 km/h).
3. **[Micro-Climate & Agronomic Risk Alert]**: Warm, humid conditions favor rapid germination (4–5 days). Scout the whorls of newly emerged seedlings at 10–12 DAS for early Fall Armyworm pinhole damage.

### ⚠️ Important Message for Farmer
Do not broadcast seeds; dibble single seeds per hill at uniform spacing to achieve the recommended plant population and prevent competition.

### Sources
[1] UAS Dharwad — Maize Package of Practices Karnataka (PoP 2026)
    https://www.uasd.edu/
[2] ICAR-IIMR Ludhiana — Maize Cultivation Guidelines
    https://iimr.icar.gov.in/`,
        provider: 'mock',
        model: 'pop-2026-sahyadri',
        isDemo: true,
      };
    }

    // Default Groundnut Sowing + Weather
    return {
      answer: `### Diagnosis & Direct Answer
The 5-day IMD weather forecast for **${district}** indicates cumulative rainfall of **${rainTotal} mm**, temperatures ranging from **20.8°C to 26°C**, high morning humidity of **90%–97%**, and moderate wind speeds of **8–13 km/h**. This rainfall provides adequate soil moisture, making it an **ideal and opportune window to proceed with sowing Groundnut (${variety || 'TMV-2 / GPBD-4'})** for the Kharif season.

### What to do & Recommended Field Operations
1. **[Core Stage Operation & Higher Yield Priority]**: Use certified kernels @ **125 kg/ha (50 kg/acre)** for spreading/semi-spreading varieties (${variety || 'TMV-2, GPBD-4'}). Sow at a spacing of **30 cm between rows and 10 cm between plants** at a depth of 4–5 cm in sandy loam soil.
2. **[Basal Fertilizer Placement]**: Apply NPK @ **25:50:25 kg/ha (10:20:10 kg/acre)** + **Zinc Sulphate @ 25 kg/ha** as basal placement in seed furrows.
3. **[Pest & Disease Management — 3 Approaches]**:
   - **Chemical Control (PoP 2026)**: Treat kernels first with **Carbendazim 50 WP @ 2 g/kg seed** or **Mancozeb 75 WP @ 3 g/kg seed** and shade dry to prevent seed rot and collar rot (*Aspergillus niger*).
   - **Biological & Organic Control**: Inoculate shade-dried seeds with **Rhizobium @ 600 g/ha** and **Phosphate Solubilizing Bacteria (PSB) @ 600 g/ha** using jaggery water as sticker.
   - **IPM & Cultural Practices**: Form ridges and furrows every 3–4 meters to facilitate drainage and sow 3 border rows of pearl millet as barrier.

### 🌦️ IMD Agromet 5-Day Weather-Based Advisory
1. **[Question-Specific Weather Advisory]**: With ${rainTotal} mm rainfall expected over 5 days in ${district}, sow immediately when soil moisture reaches workable capacity (vapsa). Do not sow in waterlogged or sticky wet soil.
2. **[Field Operation / Spray Window]**: Conduct field operations and spray applications during early morning (6:30–9:00 AM) when wind is calm (<8 km/h).
3. **[Micro-Climate & Agronomic Risk Alert]**: High morning humidity (>95%) accelerates seed germination within 5–7 days, but increases collar rot vulnerability if fungicide seed treatment is neglected.

### ⚠️ Important Message for Farmer
Always use certified seeds with >80% germination rate. Plan for **Gypsum top-dressing @ 500 kg/ha (200 kg/acre) at 30–35 DAS** for superior pod filling and oil synthesis.

### Sources
[1] KSNUAHS Shivamogga — Groundnut Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIGR — Directorate of Groundnut Research
    https://www.icar-iigr.org.in/`,
      provider: 'mock',
      model: 'pop-2026-sahyadri',
      isDemo: true,
    };
  }

  // ─── 2. Groundnut 30 days / vegetative / pegging / rainfall query ──────────
  if (
    crop === 'groundnut' &&
    (q.includes('30 day') || q.includes('30 days') || q.includes('pegging') || q.includes('higher yield') || q.includes('rainfall'))
  ) {
    if (isKannada) {
      return {
        answer: `### ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ನೇರ ಉತ್ತರ
30 ದಿನಗಳ ವಯಸ್ಸಿನ ಕಡಲೆಕಾಯಿ ಬೆಳೆಯು (ವೆಜಿಟೇಟಿವ್‌ನಿಂದ ಕಾಯಿ ಇಳಿಯುವ - Pegging ಹಂತ) ಅಧಿಕ ಇಳುವರಿ ಪಡೆಯಲು ಅತ್ಯಂತ ಪ್ರಮುಖ ಘಟ್ಟದಲ್ಲಿದೆ. ಈ ಸಮಯದಲ್ಲಿ ಮಳೆ ಮುನ್ಸೂಚನೆಗೆ ಅನುಗುಣವಾಗಿ ಸಮರ್ಪಕ ಕಳೆ ನಿಯಂತ್ರಣ, ಜಿಪ್ಸಮ್ ಬಳಕೆ ಹಾಗೂ ರೋಗ ಕಣ್ಗಾವಲು ನಿರ್ವಹಣೆ ಮಾಡುವುದು ಅನಿವಾರ್ಯ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **[ಅಧಿಕ ಇಳುವರಿ ಪ್ರಮುಖ ಅಂಶ — ಜಿಪ್ಸಮ್ ಬಳಕೆ (Gypsum Application)]**: 30 ರಿಂದ 40 ದಿನಗಳ ಹಂತದಲ್ಲಿ ಎಕರೆಗೆ 200 ಕೆಜಿ (ಹೆಕ್ಟೇರಿಗೆ 500 ಕೆಜಿ) ಜಿಪ್ಸಮ್ ಅನ್ನು ಗಿಡಗಳ ಬುಡಕ್ಕೆ ಹಾಕಿ ಮಣ್ಣು ಏರಿಸಬೇಕು. ಕ್ಯಾಲ್ಸಿಯಂ ಅಂಶವು ಕಾಯಿಗಳಲ್ಲಿ ಕಾಳು ತುಂಬಲು (Pod Filling) ಮತ್ತು ಎಣ್ಣೆ ಅಂಶ ಹೆಚ್ಚಿಸಲು #1 ನಿರ್ಣಾಯಕ ಅಂಶವಾಗಿದೆ.
2. **[ಕಳೆ ನಿರ್ವಹಣೆ ಹಾಗೂ ಎಡೆಕುಂಟೆ]**: 30 ದಿನಗಳೊಳಗೆ ಕೊನೆಯ ಕೈಕಳೆ ಮತ್ತು ಲಘು ಎಡೆಕುಂಟೆ ಮುಗಿಸಿಕೊಳ್ಳಿ. **ಗಮನಿಸಿ**: ಕಾಯಿ ಇಳಿಯುವ ಕಡ್ಡಿಗಳು (Pegs) ಮಣ್ಣಿಗೆ ಇಳಿಯಲು ಪ್ರಾರಂಭಿಸಿದ ನಂತರ (35 ದಿನಗಳ ನಂತರ) ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಆಳವಾದ ಎಡೆಕುಂಟೆ ಹೊಡೆಯಬಾರದು.
3. **[ರೋಗ ಮತ್ತು ಕೀಟ ನಿರ್ವಹಣೆ — ೩ ವಿಧಾನಗಳಲ್ಲಿ]**:
   - **ರಾಸಾಯನಿಕ ನಿರ್ವಹಣೆ (PoP 2026)**: ಟಿಕ್ಕಾ ಎಲೆಚುಕ್ಕೆ ರೋಗ ಕಂಡುಬಂದರೆ **ಮ್ಯಾಂಕೋಜೆಬ್ 75 WP @ 2 ಗ್ರಾಂ/ಲೀಟರ್** ಅಥವಾ **ಹೆಕ್ಸಾಕೊನಾಜೋಲ್ 5 EC @ 1 ಮಿ.ಲೀ/ಲೀಟರ್** ಸಿಂಪಡಿಸಿ.
   - **ಜೈವಿಕ ಮತ್ತು ಸಾವಯವ ನಿಯಂತ್ರಣ**: 5% ಬೇವಿನ ಕಷಾಯ (NSKE @ 50 ಮಿ.ಲೀ/ಲೀಟರ್) ಅಥವಾ *ಸ್ಯೂಡೋಮೊನಾಸ್ ಫ್ಲೋರೊಸೆನ್ಸ್* @ 10 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
   - **ಸಮಗ್ರ ಕೀಟ ಹಾಗೂ ರೋಗ ನಿರ್ವಹಣೆ (IPM)**: ಎಲೆ ಸುರುಳಿ ಹುಳು ಮತ್ತು ಸ್ಪೊಡೋಪ್ಟೆರಾ ಕೀಟಕ್ಕೆ ಎಕರೆಗೆ 4-5 ಮೋಹಕ ಬಲೆಗಳನ್ನು (Pheromone traps) ಅಳವಡಿಸಿ.

### 🌦️ ಐಎಂಡಿ 5-ದಿನಗಳ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಪ್ರಶ್ನೆ ಆಧಾರಿತ ಹವಾಮಾನ ಸಲಹೆ]**: ${district} ಜಿಲ್ಲೆಯಲ್ಲಿ 5 ದಿನಗಳಲ್ಲಿ ಒಟ್ಟು ${rainTotal} ಮಿ.ಮೀ ಮಳೆ ನಿರೀಕ್ಷೆಯಿರುವುದರಿಂದ ಜಿಪ್ಸಮ್ ಅನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶವಿರುವಾಗ ಬುಡಕ್ಕೆ ಹಾಕಿ ಲಘು ಮಣ್ಣು ಏರಿಸಿ.
2. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ (Spray Window)]**: ಎಲೆಗಳ ಪೋಷಕಾಂಶ (2% DAP / Planofix) ಅಥವಾ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಣೆಯನ್ನು ಮಳೆ ಇಲ್ಲದ ಶುಷ್ಕ ಮುಂಜಾನೆ (6:30–9:00 AM) ವೇಳೆಯಲ್ಲಿ ಗಾಳಿಯ ವೇಗ <8 ಕಿ.ಮೀ/ಗಂಟೆ ಇದ್ದಾಗ ನಡೆಸಿ.
3. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ/ಕೀಟ ಎಚ್ಚರಿಕೆ]**: ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯಿಂದಾಗಿ ಟಿಕ್ಕಾ ಎಲೆಚುಕ್ಕೆ ರೋಗ ಮತ್ತು ಎಲೆ ತಿನ್ನುವ ಹುಳುಗಳ ಬಾಧೆ ಹೆಚ್ಚಾಗುವ ಸಾಧ್ಯತೆಯಿದ್ದು, ತೋಟವನ್ನು ನಿರಂತರವಾಗಿ ಪರಿಶೀಲಿಸಿ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
${variety ? `**${variety}** ತಳಿಯಲ್ಲಿ 30-40 ದಿನಗಳ ಹಂತದಲ್ಲಿ ಜಿಪ್ಸಮ್ ನೀಡುವುದನ್ನು ಮರೆಯಬೇಡಿ.` : '35 ದಿನಗಳ ನಂತರ ಗಿಡಗಳ ಬೇರು/ಕಡ್ಡಿಗಳಿಗೆ ಹಾನಿಯಾಗದಂತೆ ಎಡೆಕುಂಟೆ ನಿಲ್ಲಿಸಿ.'} ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸದಾ ತೆರೆದಿಡಿ.

### ಮೂಲಗಳು
[1] KSNUAHS Shivamogga — Groundnut Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIGR — Directorate of Groundnut Research
    https://www.icar-iigr.org.in/`,
        provider: 'mock',
        model: 'pop-2026-sahyadri',
        isDemo: true,
      };
    }

    return {
      answer: `### Diagnosis & Direct Answer
At **30 days after sowing (DAS)**, your groundnut crop is transitioning from vegetative growth into the **critical flowering and early pegging stage**. Based on current rainfall and soil moisture conditions in **${district}**, executing timely gypsum application, final light intercultivation, and stage-specific foliar nutrition is decisive for achieving maximum pod filling and yield.

### What to do & Recommended Field Operations
1. **[Core Stage Operation & Higher Yield Priority — Gypsum Top-Dressing @ 500 kg/ha (200 kg/acre)]**: Apply gypsum at 30–40 DAS around the root zone followed by light earthing up. Calcium from gypsum is indispensable for pod development and preventing empty pods ("pops").
2. **[Final Weeding & Intercultivation]**: Complete all hand weeding and light hoeing now (25–30 DAS). **Crucial Warning**: Stop all mechanical intercultivation after 35–40 DAS to avoid severing delicate developing pegs entering the soil.
3. **[Pest & Disease Management — 3 Approaches]**:
   - **Chemical Control (PoP 2026)**: If early Tikka leaf spot lesions appear, spray **Mancozeb 75 WP @ 2 g/L** or **Hexaconazole 5% EC @ 1 mL/L water** (in 500 L/ha).
   - **Biological & Organic Control**: Spray **5% Neem Seed Kernel Extract (NSKE @ 50 mL/L)** or *Pseudomonas fluorescens* 1% WP @ 10 g/L water.
   - **IPM & Cultural Practices**: Install 4–5 pheromone traps per acre for *Spodoptera litura* and ensure clear field furrows for excess water evacuation.

### 🌦️ IMD Agromet 5-Day Weather-Based Advisory
1. **[Question-Specific Weather Advisory]**: With ${rainTotal} mm cumulative rainfall expected across ${district}, broadcast gypsum when soil is moist to facilitate rapid calcium dissolution into the pod zone.
2. **[Field Operation / Spray Window]**: Schedule foliar nutritional (2% DAP / Planofix) or protective sprays strictly during dry morning windows (6:30–9:00 AM) under calm winds (<8 km/h).
3. **[Micro-Climate & Agronomic Risk Alert]**: Forecasted high relative humidity (>85%) combined with warm temperatures elevates micro-climatic risk of early Tikka leaf spot. Ensure field drainage furrows are clear to prevent waterlogging around root zones.

### ⚠️ Important Message for Farmer
${variety ? `For **${variety}**, ensure soil is sufficiently friable for peg penetration.` : 'Strictly avoid deep intercultivation once gynophores (pegs) begin entering the soil.'} Timely gypsum at 30–40 DAS is the #1 yield-determining factor in groundnut.

### Sources
[1] KSNUAHS Shivamogga — Groundnut Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIGR — Directorate of Groundnut Research
    https://www.icar-iigr.org.in/`,
      provider: 'mock',
      model: 'pop-2026-sahyadri',
      isDemo: true,
    };
  }

  // ─── 3. Blast in Rice / Paddy ─────────────────────────────────────────────
  if (q.includes('blast') || (q.includes('disease') && crop === 'rice')) {
    return {
      answer: `### Diagnosis & Direct Answer
Rice blast (*Magnaporthe oryzae*) attacks foliage and panicle necks in **${district}**, presenting as spindle-shaped lesions with grey centers and brown margins. Timely university-approved fungicidal sprays along with balanced nitrogen management provide complete control.

### What to do & Recommended Field Operations
1. **[Core Stage Operation & Higher Yield Priority — Blast Suppression & Panicle Protection]**: Arrest blast lesions before flowering to safeguard grain filling and prevent neck blast.
2. **[Nutrient & Water Balance]**: Immediately stop further urea/nitrogen top-dressing while active spindle lesions are expanding; apply potassium to enhance leaf sheath resistance.
3. **[Pest & Disease Management — 3 Approaches]**:
   - **Chemical Control (PoP 2026)**: Spray **Tricyclazole 75% WP @ 0.6 g/L water** (300 g/ha in 500 L water) or **Isoprothiolane 40% EC @ 1.5 mL/L water** at first appearance.
   - **Biological & Organic Control**: Foliar spray of *Pseudomonas fluorescens* 1% WP @ 10 g/L water at 30 and 45 DAT.
   - **IPM & Cultural Practices**: Maintain 5 cm shallow water level without draining into adjacent fields; avoid excessive dense planting.

### 🌦️ IMD Agromet 5-Day Weather-Based Advisory
1. **[Question-Specific Weather Advisory]**: With ${rainTotal} mm rainfall and overcast conditions in ${district}, inspect lower leaf canopy daily for expanding spindle lesions.
2. **[Field Operation / Spray Window]**: Carry out Tricyclazole foliar sprays strictly during clear morning hours (6:30–9:00 AM) when wind speed is <8 km/h to prevent spray drift.
3. **[Micro-Climate & Agronomic Risk Alert]**: High morning relative humidity (>90%) with intermittent cloud cover strongly accelerates fungal blast spore multiplication; inspect lower leaf whorls immediately.

### ⚠️ Important Message for Farmer
If cultivating **${variety || 'Jyothi / BPT-5204'}**, monitor leaf sheath and neck closely during cloudy weather. Maintain strict spray intervals and never apply nitrogen when active lesions are spreading.

### Sources
[1] ICAR-NRRI & KSNUAHS — Rice Blast Management
    https://icar-iirr.org/
[2] UAS Bengaluru — Package of Practices Karnataka
    https://www.uasbangalore.edu.in/`,
      provider: 'mock',
      model: 'pop-2026-sahyadri',
      isDemo: true,
    };
  }

  // ─── 4. Fall Armyworm in Maize ────────────────────────────────────────────
  if (q.includes('fall armyworm') || (crop === 'maize' && (q.includes('pest') || q.includes('worm')))) {
    return {
      answer: `### Diagnosis & Direct Answer
Fall Armyworm (*Spodoptera frugiperda*) is the most destructive pest in maize in **${district}**, exhibiting characteristic windowing of leaves and central whorl destruction. Early whorl-directed intervention yields maximum efficacy.

### What to do & Recommended Field Operations
1. **[Core Stage Operation & Higher Yield Priority — Whorl Protection]**: Protect central whorls during knee-high (15–30 DAS) to prevent tassel and cob damage.
2. **[Field Sanitation & Scouting]**: Scout 20 consecutive plants in 5 locations; initiate control when 5–10% of plants show early pinhole leaf damage.
3. **[Pest & Disease Management — 3 Approaches]**:
   - **Chemical Control (PoP 2026)**: Spray **Emamectin benzoate 5% SG @ 0.4 g/L water** or **Spinetoram 11.7% SC @ 0.5 mL/L water** directly directed into the plant whorls.
   - **Biological & Organic Control**: Apply *Nomuraea rileyi* @ 2 kg/ha or release *Trichogramma pretiosum* parasitoid cards @ 1,00,000 eggs/ha.
   - **IPM & Cultural Practices**: Apply dry sand-lime mix (9:1) or wood ash into whorls to physically deter feeding larvae.

### 🌦️ IMD Agromet 5-Day Weather-Based Advisory
1. **[Question-Specific Weather Advisory]**: Based on ${rainTotal} mm rainfall in ${district}, plan whorl-directed applications during rain-free windows.
2. **[Field Operation / Spray Window]**: Apply biopesticides or chemical sprays during late afternoon/evening (4:30–6:30 PM) to target active nocturnal larvae and avoid UV degradation.
3. **[Micro-Climate & Agronomic Risk Alert]**: High humidity promotes rapid larval feeding; inspect funnel whorls immediately after rain showers.

### ⚠️ Important Message for Farmer
Direct spray nozzles straight into the central plant whorl where larvae feed.

### Sources
[1] ICAR-IIMR — Fall Armyworm Management in Maize
    https://iimr.icar.gov.in/
[2] AICRP on Maize — IPM Guidelines
    https://aicrpmaize.icar.gov.in/`,
      provider: 'mock',
      model: 'pop-2026-sahyadri',
      isDemo: true,
    };
  }

  // ─── 5. Arecanut Koleroga / Fruit Rot ─────────────────────────────────────
  if (crop === 'arecanut' && (q.includes('koleroga') || q.includes('fruit rot') || q.includes('mahali') || q.includes('rot') || q.includes('ಕೊಳೆರೋಗ'))) {
    if (isKannada) {
      return {
        answer: `### ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ನೇರ ಉತ್ತರ
ಅಡಿಕೆಯಲ್ಲಿ ಕೊಳೆರೋಗ ಅಥವಾ ಮಹಾಳಿ ರೋಗವು (*ಫೈಟೋಫ್ತೋರಾ ಮೀಡಿಯಾ*) ಮುಂಗಾರು ಮಳೆಯ ಸಮಯದಲ್ಲಿ ತೀವ್ರ ಕಾಯಿ ಕೊಳೆತ ಮತ್ತು ಅಕಾಲಿಕ ಕಾಯಿ ಉದುರುವಿಕೆಗೆ ಕಾರಣವಾಗುತ್ತದೆ. ಮಳೆಗಾಲದ ಆರಂಭಕ್ಕೆ ಮುನ್ನ ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಣೆ ಅತ್ಯಂತ ಪರಿಣಾಮಕಾರಿ ನಿಯಂತ್ರಣ ಕ್ರಮವಾಗಿದೆ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **[ಅಧಿಕ ಇಳುವರಿ ಪ್ರಮುಖ ಕ್ರಮ — ಮುನ್ನೆಚ್ಚರಿಕೆ ಬೋರ್ಡೋ ಸಿಂಪಡಣೆ]**: ಮುಂಗಾರು ಮಳೆ ಆರಂಭಕ್ಕೂ ಮುನ್ನ **1% ಬೋರ್ಡೋ ದ್ರಾವಣ** (100 ಲೀಟರ್ ನೀರಿಗೆ 1 ಕೆಜಿ ಮೈಲುತುತ್ತು + 1 ಕೆಜಿ ಸುಣ್ಣ) ಅಥವಾ **ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ 50 WP @ 3 ಗ್ರಾಂ/ಲೀಟರ್** ಅನ್ನು ಅಡಿಕೆ ಗೊಂಚಲುಗಳಿಗೆ ಚೆನ್ನಾಗಿ ತಾಗುವಂತೆ ಸಿಂಪಡಿಸಿ.
2. **[ಗೊಂಚಲು ಕಟ್ಟುವುದು ಮತ್ತು ನೈರ್ಮಲ್ಯ]**: ನಿರಂತರ ಮಳೆಯಿಂದ ಕಾಯಿಗಳನ್ನು ರಕ್ಷಿಸಲು ಪಾಲಿಥಿನ್ ಚೀಲಗಳಿಂದ (100 ಗೇಜ್) ಗೊಂಚಲುಗಳನ್ನು ಕಟ್ಟಿ ಮತ್ತು ಉದುರಿದ ಕೊಳೆತ ಕಾಯಿಗಳನ್ನು ಆರಿಸಿ ನಾಶಪಡಿಸಿ.
3. **[ರೋಗ ಮತ್ತು ಕೀಟ ನಿರ್ವಹಣೆ — ೩ ವಿಧಾನಗಳಲ್ಲಿ]**:
   - **ರಾಸಾಯನಿಕ ನಿರ್ವಹಣೆ (PoP 2026)**: ರೋಗದ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದರೆ **ಮೆಟಾಲಾಕ್ಸಿಲ್ + ಮ್ಯಾಂಕೋಜೆಬ್ 72 WP @ 2 ಗ್ರಾಂ/ಲೀಟರ್** ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.
   - **ಜೈವಿಕ ಮತ್ತು ಸಾವಯವ ನಿಯಂತ್ರಣ**: *ಟ್ರೈಕೋಡರ್ಮಾ ಹರ್ಜಿಯಾನಮ್* ಜೈವಿಕ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು (50 ಗ್ರಾಂ ಪ್ರತಿ ಮರಕ್ಕೆ) ಕಾಂಪೋಸ್ಟ್ ಗೊಬ್ಬರದೊಂದಿಗೆ ಬುಡಕ್ಕೆ ಸೇರಿಸಿ.
   - **ಸಮಗ್ರ ಕೀಟ ಹಾಗೂ ರೋಗ ನಿರ್ವಹಣೆ (IPM)**: ತೋಟದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಆಳವಾದ ಬಸಿಗಾಲುವೆಗಳನ್ನು (45-60 ಸೆಂ.ಮೀ) ನಿರ್ಮಿಸಿ ಸೂರ್ಯನ ಬೆಳಕು ಚೆನ್ನಾಗಿ ಬೀಳುವಂತೆ ತೋಟ ಸ್ವಚ್ಛವಾಗಿಡಿ.

### 🌦️ ಐಎಂಡಿ 5-ದಿನಗಳ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಪ್ರಶ್ನೆ ಆಧಾರಿತ ಹವಾಮಾನ ಸಲಹೆ]**: ${district} ಜಿಲ್ಲೆಯಲ್ಲಿ 5 ದಿನಗಳಲ್ಲಿ ${rainTotal} ಮಿ.ಮೀ ಮಳೆ ಮುನ್ಸೂಚನೆಯಿರುವುದರಿಂದ ಮಳೆ ಬಿಡುವು ಕೊಟ್ಟ ಸಮಯದಲ್ಲಿ ಬೋರ್ಡೋ ಸಿಂಪಡಣೆ ನಡೆಸಿ.
2. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ (Spray Window)]**: ಮಳೆಯಲ್ಲಿ ದ್ರಾವಣ ತೊಳೆದು ಹೋಗದಂತೆ ಬೋರ್ಡೋ ದ್ರಾವಣಕ್ಕೆ ರಾಳ ಅಥವಾ ಅಂಟು ದ್ರಾವಣವನ್ನು (Sticker) ಕಡ್ಡಾಯವಾಗಿ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.
3. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ/ಕೀಟ ಎಚ್ಚರಿಕೆ]**: ನಿರಂತರ ಮೋಡ, ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ (>95%) ರೋಗಾಣು ವೇಗವಾಗಿ ಹರಡಲು ಪ್ರಮುಖ ಕಾರಣವಾಗಿದೆ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ಮುಂಗಾರು ಪೂರ್ವದ ಮೊದಲ ಬೋರ್ಡೋ ಸಿಂಪಡಣೆಯನ್ನು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ತಪ್ಪಿಸಬೇಡಿ. ಸಿಂಪಡಿಸುವಾಗ ರೋಗಗ್ರಸ್ತ ಗೊಂಚಲುಗಳ ಜೊತೆಗೆ ಮರದ ಸುಳಿಗೂ ಔಷಧಿ ತಾಗುವಂತೆ ಸಿಂಪಡಿಸಿ.

### ಮೂಲಗಳು
[1] KSNUAHS Shivamogga & ICAR-CPCRI — Koleroga Management in Arecanut
    https://uahs.edu.in/
[2] UAS Dharwad — Arecanut PoP Karnataka
    https://www.uasd.edu/`,
        provider: 'mock',
        model: 'pop-2026-sahyadri',
        isDemo: true,
      };
    }

    return {
      answer: `### Diagnosis & Direct Answer
Koleroga (Mahali fruit rot caused by *Phytophthora meadii*) causes severe nut rot and premature nut fall in arecanut during monsoon in **${district}**. Prophylactic fungicide sprays before the onset of continuous southwest monsoon are critical for complete protection.

### What to do & Recommended Field Operations
1. **[Core Stage Operation & Higher Yield Priority — Prophylactic Bunch Spraying]**: Spray **1% Bordeaux mixture** (1 kg copper sulphate + 1 kg quicklime in 100 L water) or **Copper Oxychloride 50 WP @ 3 g/L** thoroughly covering all bunches before heavy monsoon onset.
2. **[Bunch Covering & Garden Sanitation]**: Tie 100-gauge polythene bunch covers above nut bunches to shield against continuous direct rainfall; collect and burn fallen infected nuts.
3. **[Pest & Disease Management — 3 Approaches]**:
   - **Chemical Control (PoP 2026)**: Spray **Metalaxyl + Mancozeb 72 WP @ 2 g/L water** if active rot symptoms already appear on bunches.
   - **Biological & Organic Control**: Apply *Trichoderma harzianum* @ 50 g/palm enriched in FYM around the root basin during pre-monsoon.
   - **IPM & Cultural Practices**: Maintain deep drainage channels (45–60 cm depth) between palm rows to prevent water stagnation in gardens.

### 🌦️ IMD Agromet 5-Day Weather-Based Advisory
1. **[Question-Specific Weather Advisory]**: With ${rainTotal} mm rainfall forecasted in ${district}, utilize rain-free breaks to execute mandatory prophylactic bunch sprays.
2. **[Field Operation / Spray Window]**: Always mix adhesive resin/sticker (rosin compound) with Bordeaux mixture to prevent wash-off during showers.
3. **[Micro-Climate & Agronomic Risk Alert]**: Continuous cloudiness, high relative humidity (>95%), and heavy rainfall create epidemic conditions for Phytophthora spread; inspect crown areas weekly.

### ⚠️ Important Message for Farmer
Never skip the pre-monsoon prophylactic spray. Always add sticker/adherent to Bordeaux mixture during monsoon sprays.

### Sources
[1] KSNUAHS Shivamogga & ICAR-CPCRI — Koleroga Management in Arecanut
    https://uahs.edu.in/
[2] UAS Dharwad — Arecanut PoP Karnataka
    https://www.uasd.edu/`,
      provider: 'mock',
      model: 'pop-2026-sahyadri',
      isDemo: true,
    };
  }

  // ─── 6. General Context-Aware Fallback ────────────────────────────────────
  if (isKannada) {
    return {
      answer: `### ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ನೇರ ಉತ್ತರ
${district} ಜಿಲ್ಲೆಯಲ್ಲಿ ನಿಮ್ಮ **${variety || 'ಶಿಫಾರಸು ಮಾಡಿದ'}** ${crop === 'groundnut' ? 'ಕಡಲೆಕಾಯಿ' : crop === 'rice' ? 'ಭತ್ತದ' : crop === 'maize' ? 'ಮೆಕ್ಕೆಜೋಳದ' : 'ಅಡಿಕೆ'} ಬೆಳೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಕೃಷಿ ಕೈಪಿಡಿ ೨೦೨೬ ರ ಪ್ರಕಾರ ಶಿಫಾರಸು ಮಾಡಿದ ಪರಿಹಾರ ಕ್ರಮಗಳು ಇಲ್ಲಿವೆ. 5 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯಲ್ಲಿ ಒಟ್ಟು **${rainTotal} ಮಿ.ಮೀ ಮಳೆ** ನಿರೀಕ್ಷೆಯಿದ್ದು, ಮಣ್ಣಿನ ತೇವಾಂಶಕ್ಕೆ ಅನುಗುಣವಾಗಿ ರಸಗೊಬ್ಬರ ಮತ್ತು ಸಸ್ಯ ಸಂರಕ್ಷಣಾ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಿ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **[ಅಧಿಕ ಇಳುವರಿ ಪ್ರಮುಖ ಕ್ರಮ]**: ಬೆಳೆಯ ಪ್ರಸ್ತುತ ಬೆಳವಣಿಗೆ ಹಂತಕ್ಕೆ ತಕ್ಕಂತೆ ಶಿಫಾರಸು ಮಾಡಿದ ಸಮತೋಲನ NPK ರಸಗೊಬ್ಬರ ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶಗಳನ್ನು ನೀಡಿ.
2. **[ಕಳೆ ಮತ್ತು ತೇವಾಂಶ ನಿರ್ವಹಣೆ]**: ಹೊಲದಲ್ಲಿ ಕಳೆ ಬೆಳೆಯದಂತೆ ನಿಯಂತ್ರಿಸಿ ಹಾಗೂ ಮಳೆ ನೀರಿನ ಸರಾಗ ಹರಿವಿಗೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸಿದ್ಧವಾಗಿಡಿ.
3. **[ರೋಗ ಮತ್ತು ಕೀಟ ನಿರ್ವಹಣೆ — ೩ ವಿಧಾನಗಳಲ್ಲಿ]**:
   - **ರಾಸಾಯನಿಕ ನಿರ್ವಹಣೆ (PoP 2026)**: ಕೀಟ/ರೋಗದ ಬಾಧೆಗೆ ತಕ್ಕಂತೆ ವಿಶ್ವವಿದ್ಯಾಲಯ ಶಿಫಾರಸು ಮಾಡಿದ ನಿಖರ ಕೀಟನಾಶಕವನ್ನು ನಿಗದಿತ ಪ್ರಮಾಣದಲ್ಲಿ ಮಾತ್ರ ಬಳಸಿ.
   - **ಜೈವಿಕ ಮತ್ತು ಸಾವಯವ ನಿಯಂತ್ರಣ**: ಆರಂಭಿಕ ಹಂತದಲ್ಲಿ ಬೇವಿನ ಕಷಾಯ (NSKE 5%) ಅಥವಾ ಜೈವಿಕ ನಿಯಂತ್ರಣ ಕಾರಕಗಳನ್ನು ಬಳಸಿ.
   - **ಸಮಗ್ರ ಕೀಟ ಹಾಗೂ ರೋಗ ನಿರ್ವಹಣೆ (IPM)**: ತೋಟದಲ್ಲಿ ಕೀಟ ಕಣ್ಗಾವಲಿಗೆ ಮೋಹಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ, ನಿಯಮಿತವಾಗಿ ಬೆಳೆ ಪರಿಶೀಲಿಸಿ.

### 🌦️ ಐಎಂಡಿ 5-ದಿನಗಳ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಪ್ರಶ್ನೆ ಆಧಾರಿತ ಹವಾಮಾನ ಸಲಹೆ]**: ${district} ಜಿಲ್ಲೆಯಲ್ಲಿ ಮುಂದಿನ 5 ದಿನಗಳಲ್ಲಿ ಒಟ್ಟು ${rainTotal} ಮಿ.ಮೀ ಮಳೆ ಮುನ್ಸೂಚನೆಯಿರುವುದರಿಂದ ಮಣ್ಣಿನ ಹದ ನೋಡಿಕೊಂಡು ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳನ್ನು ನಡೆಸಿ.
2. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ (Spray Window)]**: ಸಿಂಪಡಣೆಯನ್ನು ಶಾಂತವಾದ ಮುಂಜಾನೆ (6:30–9:00 AM) ಗಾಳಿಯ ವೇಗ <8 ಕಿ.ಮೀ/ಗಂಟೆ ಇದ್ದಾಗ ಮಾತ್ರ ಕೈಗೊಳ್ಳಿ.
3. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ/ಕೀಟ ಎಚ್ಚರಿಕೆ]**: ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯ ಸಮಯದಲ್ಲಿ ಶಿಲೀಂಧ್ರ ರೋಗಗಳ ಬಾಧೆ ಹೆಚ್ಚಾಗುವುದರಿಂದ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಿ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ಅನಗತ್ಯ ರಾಸಾಯನಿಕಗಳ ಅತಿಯಾದ ಬಳಕೆಯನ್ನು ತಪ್ಪಿಸಿ. ಯಾವಾಗಲೂ ಅಧಿಕೃತ ಕೃಷಿ ಕೈಪಿಡಿಯ (PoP 2026) ಶಿಫಾರಸುಗಳನ್ನು ಮಾತ್ರ ಪಾಲಿಸಿ.

### ಮೂಲಗಳು
[1] KSNUAHS Shivamogga — Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR Research Institutes
    https://icar.org.in/`,
      provider: 'mock',
      model: 'pop-2026-sahyadri',
      isDemo: true,
    };
  }

  return {
    answer: `### Diagnosis & Direct Answer
For your **${variety || 'regional'}** ${crop} crop in **${district}**, following the official Package of Practices (PoP 2026) is recommended to maximize yield and prevent stress. Based on current 5-day weather forecast (${rainTotal} mm rainfall expected), ensure proper balanced nutrition, moisture management, and proactive pest monitoring.

### What to do & Recommended Field Operations
1. **[Core Stage Operation & Higher Yield Priority]**: Apply recommended split NPK doses and micronutrients according to the current crop growth stage.
2. **[Drainage & Water Management]**: Maintain clear field drainage furrows to prevent waterlogging around root zones during rainfall.
3. **[Pest & Disease Management — 3 Approaches]**:
   - **Chemical Control (PoP 2026)**: Apply university-approved molecules at exact dosages upon reaching economic threshold levels.
   - **Biological & Organic Control**: Utilize *Trichoderma*, *Pseudomonas*, or botanical neem extract (NSKE 5%) for early preventative control.
   - **IPM & Cultural Practices**: Set up pheromone traps for pest monitoring and maintain field sanitation.

### 🌦️ IMD Agromet 5-Day Weather-Based Advisory
1. **[Question-Specific Weather Advisory]**: With ${rainTotal} mm cumulative rainfall expected in ${district}, plan farm operations according to soil workable moisture.
2. **[Field Operation / Spray Window]**: Schedule foliar nutritional or pest management sprays during calm morning hours (6:30–9:00 AM) under low wind conditions (<8 km/h).
3. **[Micro-Climate & Agronomic Risk Alert]**: Elevated relative humidity favors fungal spore multiplication; scout lower leaves regularly.

### ⚠️ Important Message for Farmer
Always follow balanced fertilizer schedules and avoid excess nitrogen which causes lush growth vulnerable to disease. Consult your local KVK for farm-specific diagnostic checks.

### Sources
[1] KSNUAHS Shivamogga — Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR Research Directorate
    https://icar.org.in/`,
    provider: 'mock',
    model: 'pop-2026-sahyadri',
    isDemo: true,
  };
}
