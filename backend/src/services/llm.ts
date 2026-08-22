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
  const isKannada = userMessage.includes('LANGUAGE: Kannada');

  // Extract selected variety if specified
  const varietyMatch = userMessage.match(/SELECTED VARIETY:\s*([^\r\n]+)/i);
  const variety =
    varietyMatch && varietyMatch[1] && !varietyMatch[1].includes('General')
      ? varietyMatch[1].trim()
      : null;

  // 1. Groundnut 30 days / vegetative / pegging / rainfall query
  if (
    q.includes('groundnut') &&
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

  // 2. Blast in Rice / Paddy
  if (q.includes('blast') || (q.includes('disease') && q.includes('rice'))) {
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

  // 3. Fall Armyworm in Maize
  if (q.includes('fall armyworm') || (q.includes('maize') && (q.includes('pest') || q.includes('worm')))) {
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

  // 4. Arecanut Koleroga / Fruit Rot / Nut Drop
  if (q.includes('arecanut') && (q.includes('koleroga') || q.includes('fruit rot') || q.includes('mahali') || q.includes('rot'))) {
    return `### Answer
Koleroga (Mahali fruit rot caused by *Phytophthora meadii*) causes severe nut rot and premature nut fall in arecanut during monsoon [1].

### What to do & Recommended Field Operations
1. **Prophylactic Spray**: Spray **1% Bordeaux mixture** (1 kg copper sulphate + 1 kg quicklime in 100 L water) or **Copper Oxychloride 50 WP @ 3 g/L** thoroughly covering all bunches before heavy monsoon onset [1].
2. **Curative Spray**: Spray **Metalaxyl + Mancozeb 72 WP @ 2 g/L water** if rot symptoms already appear [1].
3. **Mechanical Protection**: Tie polythene covers (bunch covers) to prevent continuous rainwater contact with nut bunches [2].
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

  // 5. Default Context-Aware Response
  return `### Answer
Based on the verified agricultural package of practices for Karnataka and your specified farm context, here is the agronomic guidance for **${userMessage.match(/CROP:\s*([^\r\n]+)/i)?.[1] || 'your crop'}**${variety ? ` (Variety: **${variety}**)` : ''} [1].

### What to do & Recommended Field Operations
1. Adhere to Karnataka University (KSNUAHS Shivamogga / UAS Dharwad / UAS Bengaluru) package of practices for current crop growth stage [1].
2. Implement balanced nutrient management and top-dressing according to soil moisture and crop age [1].
3. Practice regular field surveillance to detect any initial pest or disease symptoms before taking control measures [2].
4. Maintain proper drainage channels to prevent water stagnation in the root zone during rainfall [2].

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
