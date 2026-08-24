// LLM Provider Abstraction — Sahyadri Chatbot
// Supports: Gemini (with multi-model fallback ladder), OpenAI, and Intelligent Mock

import axios from 'axios';

export type LLMProvider = 'gemini' | 'openai' | 'mock';

interface LLMResponse {
  text: string;
  provider: LLMProvider;
  modelUsed?: string;
  tokensUsed?: number;
}

// Gemini Model Priority Ladder for high reliability & zero rate limit downtime
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.7-flash',
];

// Helper delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Gemini Provider with Intelligent Multi-Model Fallback & Retries ────────
async function callGemini(systemPrompt: string, userMessage: string): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const modelLadder = [
    preferredModel,
    ...GEMINI_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError: any = null;

  for (const model of modelLadder) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await axios.post(
          url,
          {
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
              },
            ],
            generationConfig: {
              temperature: 0.15,
              maxOutputTokens: 3500,
              topP: 0.85,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            ],
          },
          { timeout: 15000 }
        );

        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return { text: text.trim(), modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const status = err.response?.status;
        const isRateLimit = status === 429;
        const errMsg = err.response?.data?.error?.message || err.message;
        console.warn(`[Gemini] Model ${model} (attempt ${attempt}) error [${status}]: ${errMsg}`);

        if (isRateLimit && attempt === 1) {
          await sleep(1000);
          continue;
        }
        // If second attempt or other error, break to try next model in ladder
        break;
      }
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
}

// ─── OpenAI Provider ─────────────────────────────────────────────────────────
async function callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.15,
      max_tokens: 3500,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    }
  );

  return res.data?.choices?.[0]?.message?.content || '';
}

// ─── Smart Dynamic Mock Provider (Offline / Fallback Mode) ───────────────────
function callMock(userMessage: string): string {
  const q = userMessage.toLowerCase();
  const isKannada = userMessage.includes('LANGUAGE: Kannada') || /[\u0C80-\u0CFF]/.test(userMessage);

  // Extract selected variety if specified
  const varietyMatch = userMessage.match(/SELECTED VARIETY:\s*([^\r\n]+)/i);
  const variety =
    varietyMatch && varietyMatch[1] && !varietyMatch[1].includes('General') && !varietyMatch[1].includes('Not specified')
      ? varietyMatch[1].trim()
      : null;

  // Extract location / district
  const districtMatch = userMessage.match(/LOCATION:\s*([^,\r\n]+)/i);
  const district = districtMatch && districtMatch[1] ? districtMatch[1].trim() : 'Shivamogga';

  // Extract detected crop
  const cropMatch = userMessage.match(/CROP:\s*([^\r\n]+)/i);
  let crop = cropMatch && cropMatch[1] ? cropMatch[1].trim().toLowerCase() : 'groundnut';
  if (crop === 'not specified' || crop === 'none') {
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
        return `### ಉತ್ತರ
${district} ಜಿಲ್ಲೆಯ 5 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ ಸುಮಾರು **25–45 ಮಿ.ಮೀ ಮಳೆ**, 22°C–28°C ತಾಪಮಾನ ಮತ್ತು 85%–95% ಹೆಚ್ಚಿನ ತೇವಾಂಶ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ. ಮುಂಗಾರು ಮಳೆಯ ಆರಂಭದ ಈ ಹಂತವು **ಭತ್ತದ (${variety || 'ಜ್ಯೋತಿ / ಬಿಪಿಟಿ-5204'})** ನರ್ಸರಿ (ಮಡಿ) ಬಿತ್ತನೆ ಅಥವಾ ನೇರ ಬಿತ್ತನೆಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **ಬಿತ್ತನೆ ಬೀಜದ ಪ್ರಮಾಣ ಮತ್ತು ತಳಿ**: ಪ್ರತಿ ಹೆಕ್ಟೇರ್‌ಗೆ **20–25 ಕೆಜಿ** ಪ್ರಮಾಣೀಕೃತ ಬೀಜವನ್ನು ಬಳಸಿ (${variety || 'ಜ್ಯೋತಿ, ಬಿಪಿಟಿ-5204, ಐಆರ್-64'}).
2. **ಕಡ್ಡಾಯ ಬೀಜೋಪಚಾರ**: ಪ್ರತಿ ಕೆಜಿ ಬೀಜಕ್ಕೆ **ಕಾರ್ಬೆಂಡಾಜಿಮ್ 50 WP @ 2 ಗ್ರಾಂ** ಅಥವಾ **ಟ್ರೈಕೋಡರ್ಮಾ @ 4 ಗ್ರಾಂ** ಬೆರೆಸಿ ಉಪಚರಿಸಿ. ನಂತರ **ಅಜೋಸ್ಪಿರಿಲಮ್ (600 ಗ್ರಾಂ/ಹೆ)** ಮತ್ತು **ಪಿಎಸ್‌ಬಿ (600 ಗ್ರಾಂ/ಹೆ)** ಜೈವಿಕ ಗೊಬ್ಬರಗಳಿಂದ ಉಪಚರಿಸಿ ಬಿತ್ತಿ.
3. **ಸಸಿಮಡಿ / ನಾಟಿ ಅಂತರ**: ಸಸಿಮಡಿಯಲ್ಲಿ 20–25 ದಿನಗಳ ಸಸಿಗಳನ್ನು ಮುಖ್ಯ ಹೊಲದಲ್ಲಿ **20 x 10 ಸೆಂ.ಮೀ** ಅಂತರದಲ್ಲಿ ನಾಟಿ ಮಾಡಿ.

### 🌦️ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಬಿತ್ತನೆ ಸಮಯ]**: ಮಳೆ ಆರಂಭವಾಗಿ ಮಣ್ಣಿನಲ್ಲಿ ಹದವಾದ ತೇವಾಂಶ ಸಿಕ್ಕ ಕೂಡಲೇ ನರ್ಸರಿ ಬಿತ್ತನೆ ಮುಗಿಸಿಕೊಳ್ಳಿ. ಬಿತ್ತನೆ ಮುಗಿದ ಕೂಡಲೇ ಹೆಚ್ಚು ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ತೆರೆದಿಡಿ.
2. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ ಎಚ್ಚರಿಕೆ]**: ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯು ಬೆಂಕಿ ರೋಗ (ಬ್ರೌನ್ ಸ್ಪಾಟ್/ಬ್ಲಾಸ್ಟ್) ಉಲ್ಬಣಕ್ಕೆ ಕಾರಣವಾಗುವುದರಿಂದ ಬೀಜೋಪಚಾರವನ್ನು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಬಿಡಬೇಡಿ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ಯಾವಾಗಲೂ ಮೊಳಕೆ ಸಾಮರ್ಥ್ಯ (>80%) ಪರಿಶೀಲಿಸಿದ ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ ಮತ್ತು ಸಮತೋಲನ ರಸಗೊಬ್ಬರವನ್ನು (100:50:50 NPK) ಹಂತಗಳಲ್ಲಿ ನೀಡಿ.

### ಮೂಲಗಳು
[1] KSNUAHS Shivamogga — Rice Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIRR Hyderabad — Rice Cultivation Directives
    https://icar-iirr.org/`;
      }

      if (crop === 'maize') {
        return `### ಉತ್ತರ
${district} ಜಿಲ್ಲೆಯ 5 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ ಸುಮಾರು **30–45 ಮಿ.ಮೀ ಮಳೆ** ಮತ್ತು 20°C–29°C ತಾಪಮಾನ ನಿರೀಕ್ಷೆಯಿದೆ. ಈ ಮಳೆಯಿಂದ ಮಣ್ಣಿನಲ್ಲಿ ಉತ್ತಮ ತೇವಾಂಶ ಶೇಖರಣೆಯಾಗುವುದರಿಂದ **ಮೆಕ್ಕೆಜೋಳ (${variety || 'NK-6240'})** ಬಿತ್ತನೆ ಮಾಡಲು ಇದು ಸಕಾಲವಾಗಿದೆ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ಅಂತರ**: ಎಕರೆಗೆ **7.5–8 ಕೆಜಿ** (ಹೆಕ್ಟೇರಿಗೆ 18–20 ಕೆಜಿ) ಹೈಬ್ರಿಡ್ ಬೀಜ ಬಳಸಿ. ಸಾಲಿನಿಂದ ಸಾಲಿಗೆ **60 ಸೆಂ.ಮೀ** ಮತ್ತು ಗಿಡದಿಂದ ಗಿಡಕ್ಕೆ **20 ಸೆಂ.ಮೀ** ಅಂತರದಲ್ಲಿ 4-5 ಸೆಂ.ಮೀ ಆಳಕ್ಕೆ ಬಿತ್ತಿ.
2. **ಬೀಜೋಪಚಾರ**: ಕತ್ತರಿಸುವ ಹುಳು ಮತ್ತು ಸೈನಿಕ ಹುಳು (FAW) ಬಾಧೆ ತಡೆಯಲು **ಸಯಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 19.8% + ಥಿಯಾಮೆಥಾಕ್ಸಮ್ 19.8% FS @ 6 ಮಿ.ಲೀ/ಕೆಜಿ** ಬೀಜಕ್ಕೆ ಬೆರೆಸಿ ಉಪಚರಿಸಿ.
3. **ಬುಡ ಗೊಬ್ಬರ (Basal Dose)**: ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಶಿಫಾರಸು ಮಾಡಿದ ಸಾರಜನಕದ 30%, ಪೂರ್ಣ ಪ್ರಮಾಣದ ರಂಜಕ (75 ಕೆಜಿ/ಹೆ) ಮತ್ತು ಪೊಟ್ಯಾಷ್ (40 ಕೆಜಿ/ಹೆ) ಅನ್ನು ಸಾಲುಗಳಲ್ಲಿ ಹಾಕಿ.

### 🌦️ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಬಿತ್ತನೆ ಸಮಯ]**: ಮಳೆ ಸುರಿದು ಮಣ್ಣು ಹದವಾದ ತಕ್ಷಣ (ಅತಿಯಾದ ತೇವಾಂಶ ಇರದಂತೆ) ಬಿತ್ತನೆ ಕೈಗೊಳ್ಳಿ. ಬಿತ್ತನೆ ದಿನ ಭಾರಿ ಮಳೆ ಸುರಿಯುವ ಸೂಚನೆ ಇದ್ದರೆ ಬೀಜ ಕೊಳೆಯದಂತೆ ಎಚ್ಚರವಹಿಸಿ.
2. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ಕೀಟ ಎಚ್ಚರಿಕೆ]**: ಮೊಳಕೆ ಬಂದ ತಕ್ಷಣ (10-15 ದಿನಗಳಲ್ಲಿ) ಸೈನಿಕ ಹುಳುವಿನ (Fall Armyworm) ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ಸಾಲಿನಲ್ಲಿ ಒಂದೇ ಗಿಡವನ್ನು ಉಳಿಸಿಕೊಂಡು ನಿಖರ ಗಿಡಗಳ ಸಂಖ್ಯೆಯನ್ನು (ಹೆಕ್ಟೇರಿಗೆ 66,666 ಗಿಡಗಳು) ಕಾಪಾಡುವುದು ಮೆಕ್ಕೆಜೋಳದ ಗರಿಷ್ಠ ಇಳುವರಿಗೆ ಮೊದಲ ಮೆಟ್ಟಿಲು.

### ಮೂಲಗಳು
[1] UAS Dharwad — Maize Package of Practices Karnataka (PoP 2026)
    https://www.uasd.edu/
[2] ICAR-IIMR Ludhiana — Maize Cultivation Guidelines
    https://iimr.icar.gov.in/`;
      }

      // Groundnut Kannada
      return `### ಉತ್ತರ
${district} ಜಿಲ್ಲೆಯ 5 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ ಒಟ್ಟು **30–40 ಮಿ.ಮೀ ಮಳೆ**, 20°C–26°C ತಾಪಮಾನ, 85%–95% ಬೆಳಗಿನ ಆರ್ದ್ರತೆ ಮತ್ತು 8–12 ಕಿ.ಮೀ/ಗಂಟೆ ಗಾಳಿಯ ವೇಗ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ. ಮುಂಗಾರು ಮಳೆಯ ಈ ಹದವಾದ ತೇವಾಂಶವು **ಕಡಲೆಕಾಯಿ (${variety || 'TMV-2 / GPBD-4'})** ಬಿತ್ತನೆ ಮಾಡಲು ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ಸಮಯವಾಗಿದೆ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **ಬೀಜದ ಪ್ರಮಾಣ ಮತ್ತು ಅಂತರ**: ಎಕರೆಗೆ **50 ಕೆಜಿ** (ಹೆಕ್ಟೇರಿಗೆ 125 ಕೆಜಿ) ಬೀಜದ ಕಾಳುಗಳನ್ನು ಬಳಸಿ. ಸಾಲಿನಿಂದ ಸಾಲಿಗೆ **30 ಸೆಂ.ಮೀ** ಮತ್ತು ಗಿಡದಿಂದ ಗಿಡಕ್ಕೆ **10 ಸೆಂ.ಮೀ** ಅಂತರದಲ್ಲಿ 4–5 ಸೆಂ.ಮೀ ಆಳಕ್ಕೆ ಬಿತ್ತಿ.
2. **ಕಡ್ಡಾಯ ದ್ವಿವಿಧ ಬೀಜೋಪಚಾರ**:
   - ಮೊದಲು ಶಿಲೀಂಧ್ರನಾಶಕ: ಪ್ರತಿ ಕೆಜಿ ಬೀಜಕ್ಕೆ **ಮ್ಯಾಂಕೋಜೆಬ್ ಅಥವಾ ಕಾರ್ಬೆಂಡಾಜಿಮ್ @ 2 ಗ್ರಾಂ** ಅಥವಾ **ಟ್ರೈಕೋಡರ್ಮಾ @ 4 ಗ್ರಾಂ** ಬೆರೆಸಿ ನೆರಳಿನಲ್ಲಿ ಒಣಗಿಸಿ.
   - ನಂತರ ಜೈವಿಕ ಗೊಬ್ಬರ: **ರೈಜೋಬಿಯಂ (600 ಗ್ರಾಂ/ಹೆ)** ಮತ್ತು **ಪಿಎಸ್‌ಬಿ (600 ಗ್ರಾಂ/ಹೆ)** ಬೆರೆಸಿ ಬಿತ್ತಿ.
3. **ಬುಡ ಗೊಬ್ಬರ**: ಬಿತ್ತನೆ ಕಾಲದಲ್ಲಿ ಎಕರೆಗೆ **10 ಕೆಜಿ ಸಾರಜನಕ, 20 ಕೆಜಿ ರಂಜಕ ಮತ್ತು 10 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ (NPK 25:50:25 kg/ha)** ರಸಗೊಬ್ಬರವನ್ನು ಸಾಲುಗಳಲ್ಲಿ ಹಾಕಿ.

### 🌦️ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಬಿತ್ತನೆ ಸಮಯ]**: ಮಳೆ ಸುರಿದು ಮಣ್ಣಿನಲ್ಲಿ ಹದವಾದ ತೇವಾಂಶ (ವಪ್ಸ ಸ್ಥಿತಿ) ಬಂದಾಗ ತಕ್ಷಣ ಬಿತ್ತನೆ ಮುಗಿಸಿಕೊಳ್ಳಿ. ಮಣ್ಣು ಕೆಸರಾಗಿದ್ದಾಗ ಬಿತ್ತನೆ ಮಾಡಬೇಡಿ.
2. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ ಎಚ್ಚರಿಕೆ]**: ಹೆಚ್ಚಿನ ತೇವಾಂಶದಿಂದ ಕೊಳೆರೋಗ (Collar Rot) ಬರದಂತೆ ತಡೆಯಲು ಕಡ್ಡಾಯವಾಗಿ ಶಿಲೀಂಧ್ರನಾಶಕ ಬೀಜೋಪಚಾರ ಮಾಡಿ. ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸಿದ್ಧವಾಗಿಡಿ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ. ಬಿತ್ತನೆ ಮಾಡಿದ 30–35 ದಿನಗಳ ಹಂತದಲ್ಲಿ ಎಕರೆಗೆ 200 ಕೆಜಿ ಜಿಪ್ಸಮ್ ಮಣ್ಣಿಗೆ ಸೇರಿಸುವುದನ್ನು ಮರೆಯಬೇಡಿ.

### ಮೂಲಗಳು
[1] KSNUAHS Shivamogga — Groundnut Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIGR — Directorate of Groundnut Research
    https://www.icar-iigr.org.in/`;
    }

    // Sowing & Weather English
    if (crop === 'rice') {
      return `### Answer
The 5-day IMD weather forecast for **${district}** indicates cumulative rainfall of **25–45 mm**, temperatures between **21°C–28°C**, morning relative humidity of **88%–95%**, and moderate winds of **8–14 km/h**. This rainfall and atmospheric moisture create highly favorable soil conditions to commence **Rice (${variety || 'Jyothi / BPT-5204'})** nursery sowing or direct seeded rice (DSR) operations for the Kharif season.

### What to do & Recommended Field Operations
1. **Seed Rate & Variety Selection**: Use certified seed @ **20–25 kg/ha** for transplanted paddy or **40–50 kg/ha** for direct seeding. Recommended regional varieties include **${variety || 'Jyothi, BPT-5204, IR-64'}**.
2. **Mandatory Seed Treatment**:
   - Treat seeds with **Carbendazim 50 WP @ 2 g/kg seed** or **Trichoderma viride @ 4 g/kg** to prevent seed/soil-borne blast and sheath rot.
   - Follow with **Azospirillum @ 600 g/ha** and **Phosphate Solubilizing Bacteria (PSB) @ 600 g/ha** bio-fertilizers.
3. **Nursery Raising & Spacing**: Sow pre-germinated seeds on raised nursery beds. Transplant 20–25 day-old seedlings at **20 x 10 cm spacing** with 2–3 seedlings per hill.

### 🌦️ Weather-Based Agro-Advisory
1. **[Field Operation / Sowing Window]**: Sow nursery beds after receiving initial soaking rains when soil has good tilth. Ensure raised beds have surrounding drainage channels so heavy rainfall does not submerge emerging sprouts.
2. **[Micro-Climate & Agronomic Risk Alert]**: High humidity (>90%) with intermittent cloud cover accelerates fungal spore germination; ensure seed treatment is strictly completed before sowing.

### ⚠️ Important Message for Farmer
Always test seed germination (>80%) before nursery sowing. Ensure basal fertilizer (50% N + 100% P & K) is incorporated during final puddling.

### Sources
[1] KSNUAHS Shivamogga — Rice Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIRR Hyderabad — Rice Cultivation Directives
    https://icar-iirr.org/`;
    }

    if (crop === 'maize') {
      return `### Answer
The 5-day IMD weather forecast for **${district}** shows total expected rainfall of **30–45 mm**, temperatures ranging between **20°C–29°C**, and morning relative humidity of **85%–92%**. With adequate soil moisture accumulating from these rains, it is an optimal time to proceed with **Hybrid Maize (${variety || 'NK-6240'})** sowing for the Kharif season.

### What to do & Recommended Field Operations
1. **Seed Rate & Spacing**: Use hybrid seed @ **18–20 kg/ha (7.5–8 kg/acre)**. Sow at **60 cm row-to-row and 20 cm plant-to-plant spacing** at a depth of 4–5 cm to maintain an optimum plant population of 66,666 plants/ha.
2. **Seed Treatment for Fall Armyworm & Seedling Blight**: Treat seeds with **Cyantraniliprole 19.8% + Thiamethoxam 19.8% FS @ 6 mL/kg seed** for early 20-day protection against Fall Armyworm, followed by **Thiram / Captan @ 2.5 g/kg seed**.
3. **Basal Fertilizer Application**: Broadcast and incorporate basal fertilizer @ **50 kg N, 75 kg P2O5, and 40 kg K2O per hectare** along with **Zinc Sulphate @ 25 kg/ha** before sowing.

### 🌦️ Weather-Based Agro-Advisory
1. **[Field Operation / Sowing Window]**: Sow when the soil has received sufficient soaking moisture (vapsa condition). Avoid sowing on days with forecasted heavy downpours to prevent seed rotting or soil crusting.
2. **[Micro-Climate & Agronomic Risk Alert]**: Warm, humid conditions favor rapid germination (4–5 days). Scout the whorls of newly emerged seedlings at 10–12 DAS for early Fall Armyworm pinhole damage.

### ⚠️ Important Message for Farmer
Do not broadcast seeds; dibble single seeds per hill at uniform spacing to achieve the recommended plant population and prevent competition.

### Sources
[1] UAS Dharwad — Maize Package of Practices Karnataka (PoP 2026)
    https://www.uasd.edu/
[2] ICAR-IIMR Ludhiana — Maize Cultivation Guidelines
    https://iimr.icar.gov.in/`;
    }

    // Default Groundnut Sowing + Weather
    return `### Answer
The 5-day IMD weather forecast for **${district}** indicates cumulative rainfall of **30–40 mm**, temperatures ranging from **20.8°C to 26°C**, high morning humidity of **90%–97%**, and moderate wind speeds of **8–13 km/h**. This rainfall provides adequate soil moisture, making it an **ideal and opportune window to proceed with sowing Groundnut (${variety || 'TMV-2 / GPBD-4'})** for the Kharif season.

### What to do & Recommended Field Operations
1. **Seed Rate & Spacing**: Use certified kernels @ **125 kg/ha (50 kg/acre)** for spreading/semi-spreading varieties (${variety || 'TMV-2, GPBD-4'}). Sow at a spacing of **30 cm between rows and 10 cm between plants** at a depth of 4–5 cm.
2. **Mandatory Dual Seed Treatment**:
   - **Fungicide First**: Treat kernels with **Carbendazim 50 WP @ 2 g/kg** or **Trichoderma viride @ 4 g/kg seed** and shade dry to prevent seed rot and collar rot (*Aspergillus niger*).
   - **Biofertilizers Second**: Inoculate treated seeds with **Rhizobium @ 600 g/ha** and **Phosphate Solubilizing Bacteria (PSB) @ 600 g/ha** using jaggery water as sticker.
3. **Basal Fertilizer**: Apply NPK @ **25:50:25 kg/ha (10:20:10 kg/acre)** + **Zinc Sulphate @ 25 kg/ha** as basal placement in seed furrows.

### 🌦️ Weather-Based Agro-Advisory
1. **[Field Operation / Sowing Window]**: Sow when soil moisture is at workable capacity (vapsa). Do not sow in flooded or sticky wet soil. Ensure field furrows allow drainage in case of heavy showers.
2. **[Micro-Climate & Agronomic Risk Alert]**: High morning humidity (>95%) combined with soil moisture accelerates seed germination within 5–7 days, but also increases collar rot vulnerability if fungicide seed treatment is neglected.

### ⚠️ Important Message for Farmer
Always use certified seeds with >80% germination rate. Plan for **Gypsum top-dressing @ 500 kg/ha (200 kg/acre) at 30–35 DAS** for superior pod filling and oil synthesis.

### Sources
[1] KSNUAHS Shivamogga — Groundnut Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIGR — Directorate of Groundnut Research
    https://www.icar-iigr.org.in/`;
  }

  // ─── 2. Groundnut 30 days / vegetative / pegging / rainfall query ──────────
  if (
    crop === 'groundnut' &&
    (q.includes('30 day') || q.includes('30 days') || q.includes('pegging') || q.includes('higher yield') || q.includes('rainfall'))
  ) {
    if (isKannada) {
      return `### ಉತ್ತರ
30 ದಿನಗಳ ವಯಸ್ಸಿನ ಕಡಲೆಕಾಯಿ ಬೆಳೆಯು (ವೆಜಿಟೇಟಿವ್‌ನಿಂದ ಕಾಯಿ ಇಳಿಯುವ - Pegging ಹಂತ) ಅಧಿಕ ಇಳುವರಿ ಪಡೆಯಲು ಅತ್ಯಂತ ಪ್ರಮುಖ ಘಟ್ಟದಲ್ಲಿದೆ [1]. ಈ ಸಮಯದಲ್ಲಿ ಮಳೆ ಮುನ್ಸೂಚನೆಗೆ ಅನುಗುಣವಾಗಿ ಸಮರ್ಪಕ ಕಳೆ ನಿಯಂತ್ರಣ, ಜಿಪ್ಸಮ್ ಬಳಕೆ ಹಾಗೂ ರೋಗ ಕಣ್ಗಾವಲು ನಿರ್ವಹಣೆ ಮಾಡಬೇಕು.

### ಏನು ಮಾಡಬೇಕು (ನಿರ್ವಹಣಾ ಕ್ರಮಗಳು)
1. **ಜಿಪ್ಸಮ್ ಬಳಕೆ (Gypsum Application)**: 30 ರಿಂದ 40 ದಿನಗಳ ಹಂತದಲ್ಲಿ ಎಕರೆಗೆ 200 ಕೆಜಿ (ಹೆಕ್ಟೇರಿಗೆ 500 ಕೆಜಿ) ಜಿಪ್ಸಮ್ ಅನ್ನು ಗಿಡಗಳ ಬುಡಕ್ಕೆ ಹಾಕಿ ಮಣ್ಣು ಏರಿಸಬೇಕು. ಇದು ಕಾಯಿಗಳಲ್ಲಿ ಕಾಳು ತುಂಬಲು (Pod Filling) ಮತ್ತು ಎಣ್ಣೆ ಅಂಶ ಹೆಚ್ಚಿಸಲು ಅತ್ಯಗತ್ಯ [1].
2. **ಕಳೆ ನಿರ್ವಹಣೆ ಹಾಗೂ ಎಡೆಕುಂಟೆ**: 30 ದಿನಗಳೊಳಗೆ ಕೊನೆಯ ಕೈಕಳೆ ಮತ್ತು ಲಘು ಎಡೆಕುಂಟೆ ಮುಗಿಸಿಕೊಳ್ಳಿ. **ಗಮನಿಸಿ**: ಕಾಯಿ ಇಳಿಯುವ ಕಡ್ಡಿಗಳು (Pegs) ಮಣ್ಣಿಗೆ ಇಳಿಯಲು ಪ್ರಾರಂಭಿಸಿದ ನಂತರ (35 ದಿನಗಳ ನಂತರ) ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಆಳವಾದ ಎಡೆಕುಂಟೆ ಹೊಡೆಯಬಾರದು [2].
3. **ಪೋಷಕಾಂಶಗಳ ಸಿಂಪಡಣೆ**: ಹೂವಾಡುವಿಕೆ ಉತ್ತೇಜಿಸಲು 2% ಡಿಎಪಿ (DAP @ 20 ಗ್ರಾಂ/ಲೀಟರ್) ಅಥವಾ ಪ್ಲಾನೋಫಿಕ್ಸ್ (NAA @ 0.25 ಮಿ.ಲೀ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ [1].
4. **ರೋಗ ಕಣ್ಗಾವಲು (ಟಿಕ್ಕಾ ರೋಗ)**: ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು/ಕಂದು ಚುಕ್ಕೆಗಳು ಕಂಡುಬಂದರೆ ಮ್ಯಾಂಕೋಜೆಬ್ 75 WP @ 2 ಗ್ರಾಂ/ಲೀಟರ್ ಅಥವಾ ಹೆಕ್ಸಾಕೊನಾಜೋಲ್ 5 EC @ 1 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ [1].

### 🌦️ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ]**: ಮುನ್ಸೂಚನೆಯಲ್ಲಿ ಲಘು ಮಳೆ ನಿರೀಕ್ಷೆಯಿರುವುದರಿಂದ ಜಿಪ್ಸಮ್ ಅನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶವಿರುವಾಗ ಬುಡಕ್ಕೆ ಹಾಕಿ. ಎಲೆಗಳ ಸಿಂಪಡಣೆಯನ್ನು ಮಳೆ ಇಲ್ಲದ ಶುಷ್ಕ ಮುಂಜಾನೆ (6:30–9:00 AM) ವೇಳೆಯಲ್ಲಿ ನಡೆಸಿ.
2. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ/ಕೀಟ ಎಚ್ಚರಿಕೆ]**: ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯಿಂದಾಗಿ ಟಿಕ್ಕಾ ಎಲೆಚುಕ್ಕೆ ರೋಗ ಮತ್ತು ಎಲೆ ತಿನ್ನುವ ಹುಳುಗಳ ಬಾಧೆ ಹೆಚ್ಚಾಗುವ ಸಾಧ್ಯತೆಯಿದ್ದು, ತೋಟವನ್ನು ನಿರಂತರವಾಗಿ ಪರಿಶೀಲಿಸಿ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
${variety ? `**${variety}** ತಳಿಯಲ್ಲಿ 30-40 ದಿನಗಳ ಹಂತದಲ್ಲಿ ಜಿಪ್ಸಮ್ ನೀಡುವುದನ್ನು ಮರೆಯಬೇಡಿ.` : '35 ದಿನಗಳ ನಂತರ ಗಿಡಗಳ ಬೇರು/ಕಡ್ಡಿಗಳಿಗೆ ಹಾನಿಯಾಗದಂತೆ ಎಡೆಕುಂಟೆ ನಿಲ್ಲಿಸಿ.'} ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸದಾ ತೆರೆದಿಡಿ.

### ಮೂಲಗಳು
[1] KSNUAHS Shivamogga — Groundnut Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIGR — Directorate of Groundnut Research
    https://www.icar-iigr.org.in/`;
    }

    return `### Answer
At **30 days after sowing (DAS)**, your groundnut crop is transitioning from vegetative growth into the **critical flowering and early pegging stage** [1]. Based on current rainfall and soil conditions, executing timely gypsum application, final light intercultivation, and foliar booster nutrition is decisive for achieving maximum pod filling and yield [1].

### What to do & Recommended Field Operations
1. **Top-Dress Gypsum @ 500 kg/ha (200 kg/acre)**: Apply gypsum at 30–40 DAS around the root zone followed by light earthing up. Calcium from gypsum is indispensable for pod development and preventing empty pods ("pops") [1].
2. **Final Weeding & Intercultivation**: Complete all hand weeding and light hoeing now (25–30 DAS). **Crucial Warning**: Stop all mechanical intercultivation after 35–40 DAS to avoid severing delicate developing pegs entering the soil [1, 2].
3. **Foliar Nutrition & Flower Retention**: Spray **2% DAP (20 g/L)** or **Planofix (NAA) @ 0.25 mL/L water** at flowering to arrest flower drop and boost pod set [1].
4. **Disease Scouting (Tikka Leaf Spot)**: Inspect lower leaves for circular brown/black Tikka spots. If early symptoms appear, apply **Mancozeb 75 WP @ 2 g/L** or **Hexaconazole 5% EC @ 1 mL/L** [1].

### 🌦️ Weather-Based Agro-Advisory
1. **[Field Operation / Spraying Window]**: With current forecast indicating localized light rainfall showers, broadcast gypsum when soil is moist to facilitate calcium solubilization. Schedule foliar nutritional/fungicide sprays strictly during dry morning windows (6:30–9:00 AM) under calm winds (<8 km/h).
2. **[Micro-Climate & Agronomic Risk Alert]**: Forecasted high relative humidity (>85%) combined with warm temperatures elevates micro-climatic risk of early Tikka leaf spot and collar rot. Ensure field drainage furrows are clear to prevent waterlogging around root zones.

### ⚠️ Important Message for Farmer
${variety ? `For **${variety}**, ensure soil is sufficiently friable for peg penetration.` : 'Strictly avoid deep intercultivation once gynophores (pegs) begin entering the soil.'} Timely gypsum at 30–40 DAS is the #1 yield-determining factor in groundnut.

### Sources
[1] KSNUAHS Shivamogga — Groundnut Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR-IIGR — Directorate of Groundnut Research
    https://www.icar-iigr.org.in/`;
  }

  // ─── 3. Blast in Rice / Paddy ─────────────────────────────────────────────
  if (q.includes('blast') || (q.includes('disease') && crop === 'rice')) {
    return `### Answer
Rice blast (*Magnaporthe oryzae*) attacks foliage and panicle necks. Timely university-approved fungicidal sprays along with balanced nitrogen management provide effective control [1].

### What to do & Recommended Field Operations
1. **Leaf Blast**: Spray **Tricyclazole 75% WP @ 0.6 g/L water** (in 500 L/ha) or **Isoprothiolane 40% EC @ 1.5 mL/L water** at first appearance of spindle lesions [1].
2. **Neck Blast Prevention**: Apply **Tricyclazole 75% WP @ 0.6 g/L** or **Carbendazim 50% WP @ 1 g/L** at boot leaf stage [1].
3. **Biological Control**: Spray *Pseudomonas fluorescens* 1% WP @ 10 g/L water at 30 and 45 DAT [2].
4. **Cultural Measure**: Avoid excessive top-dressing of urea/nitrogen fertilizers which aggravates blast severity [2].

### 🌦️ Weather-Based Agro-Advisory
1. **[Field Operation / Spraying Window]**: Carry out Tricyclazole foliar sprays strictly during clear morning hours (6:30–9:00 AM) when wind speed is <8 km/h to prevent spray drift and maximize canopy adhesion.
2. **[Micro-Climate & Agronomic Risk Alert]**: High morning relative humidity (>90%) with intermittent cloud cover strongly accelerates fungal blast spore multiplication; inspect lower leaf whorls immediately.

### ⚠️ Important Message for Farmer
${variety ? `If cultivating **${variety}**, monitor leaf sheath and neck closely during cloudy weather.` : 'Maintain strict spray intervals and never apply nitrogen when active lesions are spreading.'}

### Sources
[1] ICAR-NRRI & KSNUAHS — Rice Blast Management
    https://icar-iirr.org/
[2] UAS Bengaluru — Package of Practices Karnataka
    https://www.uasbangalore.edu.in/`;
  }

  // ─── 4. Fall Armyworm in Maize ────────────────────────────────────────────
  if (q.includes('fall armyworm') || (crop === 'maize' && (q.includes('pest') || q.includes('worm')))) {
    return `### Answer
Fall Armyworm (*Spodoptera frugiperda*) is the most damaging pest in maize. Early whorl-directed intervention yields maximum efficacy [1].

### What to do & Recommended Field Operations
1. **Chemical Control**: Spray **Emamectin benzoate 5% SG @ 0.4 g/L water** or **Spinetoram 11.7% SC @ 0.5 mL/L water** directly into the plant whorls [1].
2. **Biological Control**: Apply *Nomuraea rileyi* @ 2 kg/ha or release *Trichogramma pretiosum* parasitoid cards @ 1,00,000 eggs/ha [1].
3. **Botanical Option**: Spray 5% Neem Seed Kernel Extract (NSKE) or Azadirachtin 1500 ppm @ 5 mL/L at early window-pane leaf damage [2].

### 🌦️ Weather-Based Agro-Advisory
1. **[Field Operation / Spraying Window]**: Apply biopesticides or chemical sprays during late afternoon/evening (4:30–6:30 PM) to target active nocturnal larvae and prevent UV degradation.
2. **[Micro-Climate & Agronomic Risk Alert]**: Inspect funnel whorls after light rains for larval migration and apply sand-lime mix (9:1) if rain prevents spraying.

### ⚠️ Important Message for Farmer
Direct spray nozzles straight into the central plant whorl where larvae feed.

### Sources
[1] ICAR-IIMR — Fall Armyworm Management in Maize
    https://iimr.icar.gov.in/
[2] AICRP on Maize — IPM Guidelines
    https://aicrpmaize.icar.gov.in/`;
  }

  // ─── 5. Arecanut Koleroga / Fruit Rot ─────────────────────────────────────
  if (crop === 'arecanut' && (q.includes('koleroga') || q.includes('fruit rot') || q.includes('mahali') || q.includes('rot') || q.includes('ಕೊಳೆರೋಗ'))) {
    if (isKannada) {
      return `### ಉತ್ತರ
ಅಡಿಕೆಯಲ್ಲಿ ಕೊಳೆರೋಗ ಅಥವಾ ಮಹಾಳಿ ರೋಗವು (*ಫೈಟೋಫ್ತೋರಾ ಮೀಡಿಯಾ*) ಮುಂಗಾರು ಮಳೆಯ ಸಮಯದಲ್ಲಿ ತೀವ್ರ ಕಾಯಿ ಕೊಳೆತ ಮತ್ತು ಅಕಾಲಿಕ ಕಾಯಿ ಉದುರುವಿಕೆಗೆ ಕಾರಣವಾಗುತ್ತದೆ [1]. ಮಳೆಗಾಲದ ಆರಂಭಕ್ಕೆ ಮುನ್ನ ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಣೆ ಅತ್ಯಂತ ಪರಿಣಾಮಕಾರಿ ನಿಯಂತ್ರಣ ಕ್ರಮವಾಗಿದೆ.

### ಏನು ಮಾಡಬೇಕು (ನಿರ್ವಹಣಾ ಕ್ರಮಗಳು)
1. **ಮುನ್ನೆಚ್ಚರಿಕೆ ಸಿಂಪಡಣೆ (Prophylactic Spray)**: ಮುಂಗಾರು ಮಳೆ ಆರಂಭಕ್ಕೂ ಮುನ್ನ **1% ಬೋರ್ಡೋ ದ್ರಾವಣ** (100 ಲೀಟರ್ ನೀರಿಗೆ 1 ಕೆಜಿ ಮೈಲುತುತ್ತು + 1 ಕೆಜಿ ಸುಣ್ಣ) ಅಥವಾ **ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ 50 WP @ 3 ಗ್ರಾಂ/ಲೀಟರ್** ಅನ್ನು ಅಡಿಕೆ ಗೊಂಚಲುಗಳಿಗೆ ಚೆನ್ನಾಗಿ ತಾಗುವಂತೆ ಸಿಂಪಡಿಸಿ [1].
2. **ರೋಗ ಕಂಡುಬಂದಾಗ (Curative Spray)**: ರೋಗದ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದರೆ **ಮೆಟಾಲಾಕ್ಸಿಲ್ + ಮ್ಯಾಂಕೋಜೆಬ್ 72 WP @ 2 ಗ್ರಾಂ/ಲೀಟರ್** ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ [1].
3. **ಗೊಂಚಲು ಕಟ್ಟುವುದು (Bunch Covering)**: ನಿರಂತರ ಮಳೆಯಿಂದ ಕಾಯಿಗಳನ್ನು ರಕ್ಷಿಸಲು ಪಾಲಿಥಿನ್ ಚೀಲಗಳಿಂದ (100 ಗೇಜ್) ಗೊಂಚಲುಗಳನ್ನು ಕಟ್ಟಿ [2].
4. **ತೋಟದ ನೈರ್ಮಲ್ಯ**: ಉದುರಿದ ರೋಗಗ್ರಸ್ತ ಅಡಿಕೆಗಳನ್ನು ಆರಿಸಿ ನಾಶಪಡಿಸಿ [1].

### 🌦️ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ]**: ಮಳೆ ಬಿಡುವು ಕೊಟ್ಟ ಸಮಯದಲ್ಲಿ ಸಿಂಪಡಣೆ ನಡೆಸಿ. ಮಳೆಯಲ್ಲಿ ದ್ರಾವಣ ತೊಳೆದು ಹೋಗದಂತೆ ಬೋರ್ಡೋ ದ್ರಾವಣಕ್ಕೆ ರಾಳ ಅಥವಾ ಅಂಟು ದ್ರಾವಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಬೆರೆಸಿ.
2. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ ಎಚ್ಚರಿಕೆ]**: ನಿರಂತರ ಮೋಡ, ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ (>95%) ರೋಗಾಣು ವೇಗವಾಗಿ ಹರಡಲು ಪ್ರಮುಖ ಕಾರಣವಾಗಿದೆ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ಮುಂಗಾರು ಪೂರ್ವದ ಮೊದಲ ಬೋರ್ಡೋ ಸಿಂಪಡಣೆಯನ್ನು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ತಪ್ಪಿಸಬೇಡಿ. ಸಿಂಪಡಿಸುವಾಗ ರೋಗಗ್ರಸ್ತ ಗೊಂಚಲುಗಳ ಜೊತೆಗೆ ಮರದ ಸುಳಿಗೂ ಔಷಧಿ ತಾಗುವಂತೆ ಸಿಂಪಡಿಸಿ.

### ಮೂಲಗಳು
[1] KSNUAHS Shivamogga & ICAR-CPCRI — Koleroga Management in Arecanut
    https://uahs.edu.in/
[2] UAS Dharwad — Arecanut PoP Karnataka
    https://www.uasd.edu/`;
    }

    return `### Answer
Koleroga (Mahali fruit rot caused by *Phytophthora meadii*) causes severe nut rot and premature nut fall in arecanut during monsoon [1]. Prophylactic fungicide sprays before the onset of continuous southwest monsoon are critical for complete protection [1].

### What to do & Recommended Field Operations
1. **Prophylactic Spray**: Spray **1% Bordeaux mixture** (1 kg copper sulphate + 1 kg quicklime in 100 L water) or **Copper Oxychloride 50 WP @ 3 g/L** thoroughly covering all bunches before heavy monsoon onset [1].
2. **Curative Spray**: Spray **Metalaxyl + Mancozeb 72 WP @ 2 g/L water** if rot symptoms already appear [1].
3. **Mechanical Protection**: Tie polythene covers (100 gauge bunch covers) to prevent continuous rainwater contact with nut bunches [2].
4. **Sanitation**: Collect and destroy all fallen diseased nuts and rotting bunches to eliminate inoculum sources [1].

### 🌦️ Weather-Based Agro-Advisory
1. **[Field Operation / Spraying Window]**: Spray Bordeaux mixture during dry weather breaks; ensure resin or sticker (rosin compound) is added to prevent wash-off during rains.
2. **[Micro-Climate & Agronomic Risk Alert]**: Continuous cloudiness, high relative humidity (>95%), and heavy rainfall create epidemic conditions for Phytophthora spread; inspect crown areas weekly.

### ⚠️ Important Message for Farmer
Never skip the pre-monsoon prophylactic spray. Always add sticker/adherent to Bordeaux mixture during monsoon sprays.

### Sources
[1] KSNUAHS Shivamogga & ICAR-CPCRI — Koleroga Management in Arecanut
    https://uahs.edu.in/
[2] UAS Dharwad — Arecanut PoP Karnataka
    https://www.uasd.edu/`;
  }

  // ─── 6. Default Context-Aware Response ────────────────────────────────────
  return `### Answer
Based on the verified agricultural package of practices for Karnataka and your specified farm context, here is the agronomic guidance for **${crop}**${variety ? ` (Variety: **${variety}**)` : ''} in **${district}** [1].

### What to do & Recommended Field Operations
1. **Package of Practices Adherence**: Adhere to Karnataka University (KSNUAHS Shivamogga / UAS Dharwad / UAS Bengaluru) package of practices for the current crop growth stage [1].
2. **Nutrient Management**: Implement balanced NPK nutrient management and top-dressing according to soil moisture and crop age [1].
3. **Surveillance & Scouting**: Practice regular field surveillance to detect any initial pest or disease symptoms before taking control measures [2].
4. **Drainage Management**: Maintain proper drainage channels to prevent water stagnation in the root zone during rainfall [2].

### 🌦️ Weather-Based Agro-Advisory
1. **[Field Operation / Spraying Window]**: Schedule spraying and foliar operations during early morning (6:30–9:00 AM) under calm wind conditions (<8 km/h) to ensure optimal chemical absorption.
2. **[Micro-Climate & Agronomic Risk Alert]**: Adjust irrigation and drainage based on localized 5-day rainfall forecast and relative humidity trends.

### ⚠️ Important Message for Farmer
${variety ? `Follow certified agronomic recommendations for **${variety}** under local agro-climatic conditions.` : 'Always wear protective gear during chemical spray operations and adhere to recommended dosages.'}

### Sources
[1] KSNUAHS Shivamogga — Package of Practices Karnataka 2026
    https://uahs.edu.in/
[2] ICAR Agricultural Extension Network
    https://icar.org.in/`;
}

// ─── Main LLM Caller ─────────────────────────────────────────────────────────
export async function callLLM(
  systemPrompt: string,
  userMessage: string
): Promise<LLMResponse> {
  const provider = (process.env.LLM_PROVIDER || 'gemini') as LLMProvider;

  // 1. Try Gemini
  if (provider === 'gemini') {
    try {
      const { text, modelUsed } = await callGemini(systemPrompt, userMessage);
      return { text, provider: 'gemini', modelUsed };
    } catch (err: any) {
      console.warn('[LLM] Gemini ladder exhausted, trying fallback...', err.message);
    }
  }

  // 2. Try OpenAI fallback if configured
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('[LLM] Calling OpenAI fallback...');
      const text = await callOpenAI(systemPrompt, userMessage);
      return { text, provider: 'openai', modelUsed: process.env.OPENAI_MODEL || 'gpt-4o-mini' };
    } catch (err: any) {
      console.warn('[LLM] OpenAI fallback error:', err.message);
    }
  }

  // 3. Fall back to smart dynamic mock
  console.log('[LLM] Using intelligent offline agricultural engine...');
  const text = callMock(userMessage);
  return { text, provider: 'mock' };
}
