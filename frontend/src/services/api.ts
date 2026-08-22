import type { ChatResponse, Crop, Source, FarmContextData, IMDWeatherAdvisory } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function sendChatMessage(params: {
  question: string;
  crop: string | null;
  language: string;
  sessionId?: string;
  farmContext?: FarmContextData;
}): Promise<ChatResponse> {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('[API] Backend unreachable, utilizing client-side PoP knowledge engine:', e);
  }

  // Graceful client fallback for GitHub Pages live demo
  const isKn = params.language === 'kn';
  const q = params.question.toLowerCase();
  const crop = params.crop || (q.includes('rice') || q.includes('paddy') || q.includes('ಭತ್ತ') ? 'rice' : q.includes('maize') || q.includes('ಮೆಕ್ಕೆಜೋಳ') ? 'maize' : q.includes('areca') || q.includes('ಅಡಿಕೆ') ? 'arecanut' : 'groundnut');
  const variety = params.farmContext?.variety || (crop === 'groundnut' ? 'TMV-2' : crop === 'rice' ? 'Jyothi' : crop === 'maize' ? 'NK-6240' : 'Mohitnagar');
  const district = params.farmContext?.district || 'Shivamogga';

  if (isKn) {
    return {
      answer: `### ಉತ್ತರ
ನಿಮ್ಮ **${variety}** ${crop === 'groundnut' ? 'ಕಡಲೆಕಾಯಿ' : crop === 'rice' ? 'ಭತ್ತದ' : crop === 'maize' ? 'ಮೆಕ್ಕೆಜೋಳದ' : 'ಅಡಿಕೆ'} ಬೆಳೆಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗೆ ಕೃಷಿ ಕೈಪಿಡಿ ೨೦೨೬ ರ ಪ್ರಕಾರ ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು ಇಲ್ಲಿವೆ. ${district} ಜಿಲ್ಲೆಯ ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗೆ ಅನುಗುಣವಾಗಿ ಸಮರ್ಪಕ ಕಳೆ ನಿರ್ವಹಣೆ, ಪೋಷಕಾಂಶಗಳ ಸಮತೋಲನ ಬಳಕೆ ಹಾಗೂ ರೋಗ ಕಣ್ಗಾವಲು ಮುಖ್ಯವಾಗಿದೆ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ**: ಬೆಳೆಯ ಹಂತಕ್ಕೆ ತಕ್ಕಂತೆ ಶಿಫಾರಸು ಮಾಡಿದ NPK ರಸಗೊಬ್ಬರ ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶಗಳನ್ನು (ಸತು/ಬೋರಾನ್) ನೀಡಿ.
2. **ಸಸ್ಯ ಸಂರಕ್ಷಣೆ**: ತೋಟದಲ್ಲಿ ಕೀಟ ಮತ್ತು ರೋಗಗಳ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ, ಜೈವಿಕ ಅಥವಾ ಶಿಫಾರಸು ಮಾಡಿದ ಶಿಲೀಂಧ್ರನಾಶಕಗಳನ್ನು ಬಳಸಿ.
3. **ತೇವಾಂಶ ಮತ್ತು ಬಸಿಗಾಲುವೆ**: ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸದಾ ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ.

### 🌦️ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ**: ಸಿಂಪಡಣೆಯನ್ನು ಶಾಂತವಾದ ಮುಂಜಾನೆ (6:30–9:00 AM) ಗಾಳಿಯ ವೇಗ ಕಡಿಮೆ ಇದ್ದಾಗ ಮಾತ್ರ ಕೈಗೊಳ್ಳಿ.
2. **ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ ಎಚ್ಚರಿಕೆ**: ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯ ಸಮಯದಲ್ಲಿ ಶಿಲೀಂಧ್ರ ರೋಗಗಳ ಬಾಧೆ ಹೆಚ್ಚಾಗುವುದರಿಂದ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಿ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ಅನಗತ್ಯ ರಾಸಾಯನಿಕಗಳ ಅತಿಯಾದ ಬಳಕೆಯನ್ನು ತಪ್ಪಿಸಿ. ಯಾವಾಗಲೂ ಅಧಿಕೃತ ಕೃಷಿ ಕೈಪಿಡಿಯ (PoP 2026) ಶಿಫಾರಸುಗಳನ್ನು ಮಾತ್ರ ಪಾಲಿಸಿ.

### ಮೂಲಗಳು
[1] KSNUAHS Shivamogga — Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR Institutes
    https://icar.org.in/`,
      crop,
      intent: 'crop_production',
      citations: [
        { id: 1, title: 'KSNUAHS Shivamogga — PoP 2026', url: 'https://uahs.edu.in/', sourceId: 'ksnuahs', relevance: 0.98 },
        { id: 2, title: 'ICAR Research Portal', url: 'https://icar.org.in/', sourceId: 'icar', relevance: 0.95 },
      ],
      provider: 'mock',
      isDemo: true,
      language: 'kn',
      outOfScope: false,
      farmContext: params.farmContext,
    };
  }

  return {
    answer: `### Diagnosis & Direct Answer
For your **${variety}** ${crop} crop in ${district}, following the official Package of Practices (PoP 2026) is recommended to maximize yield and prevent stress. Based on local weather conditions, ensure proper balanced nutrition, moisture management, and proactive pest monitoring.

### What to do & Recommended Field Operations
1. **Nutrient & Fertilizer Management**: Apply recommended split NPK doses and micronutrients according to the current crop growth stage.
2. **Plant Protection & Scouting**: Regularly inspect the field for early signs of pests or fungal leaf spots. Use biological bio-pesticides or recommended fungicides as per threshold levels.
3. **Drainage & Water Management**: Maintain clear field drainage furrows to prevent waterlogging around root zones during rainfall.

### 🌦️ Weather-Based Agro-Advisory
1. **Field Operation & Spray Window**: Schedule foliar nutritional or pest management sprays during calm morning hours (6:30–9:00 AM) under low wind conditions (<8 km/h).
2. **Micro-Climate Risk Alert**: Elevated relative humidity favors fungal spore multiplication; scout lower leaves regularly.

### ⚠️ Important Message for Farmer
Always follow balanced fertilizer schedules and avoid excess nitrogen which causes lush growth vulnerable to disease. Consult your local KVK for farm-specific diagnostic checks.

### Sources
[1] KSNUAHS Shivamogga — Package of Practices (PoP 2026)
    https://uahs.edu.in/
[2] ICAR Research Directorate
    https://icar.org.in/`,
    crop,
    intent: 'crop_production',
    citations: [
      { id: 1, title: 'KSNUAHS Shivamogga — PoP 2026', url: 'https://uahs.edu.in/', sourceId: 'ksnuahs', relevance: 0.98 },
      { id: 2, title: 'ICAR Research Directorate', url: 'https://icar.org.in/', sourceId: 'icar', relevance: 0.95 },
    ],
    provider: 'mock',
    isDemo: true,
    language: 'en',
    outOfScope: false,
    farmContext: params.farmContext,
  };
}

export async function fetchWeather(
  district: string = 'Shivamogga',
  block?: string,
  crop?: string,
  language: string = 'en'
): Promise<IMDWeatherAdvisory> {
  const params = new URLSearchParams({
    district,
    block: block || district,
    crop: crop || 'Groundnut',
    lang: language,
  });

  const res = await fetch(`${API_BASE}/weather?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch weather bulletin');
  return res.json();
}

export async function fetchCrops(): Promise<Crop[]> {
  try {
    const res = await fetch(`${API_BASE}/crops`);
    if (!res.ok) throw new Error('Failed to fetch crops');
    const data = await res.json();
    return data.crops;
  } catch {
    return [
      { id: 'groundnut', name: 'Groundnut', kannada: 'ಕಡಲೆಕಾಯಿ / ಶೇಂಗಾ', emoji: '🥜', aliases: [] },
      { id: 'rice', name: 'Rice / Paddy', kannada: 'ಭತ್ತ', emoji: '🌾', aliases: [] },
      { id: 'maize', name: 'Maize', kannada: 'ಮೆಕ್ಕೆಜೋಳ', emoji: '🌽', aliases: [] },
      { id: 'arecanut', name: 'Arecanut', kannada: 'ಅಡಿಕೆ', emoji: '🌴', aliases: [] },
    ];
  }
}

export async function fetchSources(): Promise<Source[]> {
  try {
    const res = await fetch(`${API_BASE}/sources`);
    if (!res.ok) throw new Error('Failed to fetch sources');
    const data = await res.json();
    return data.sources;
  } catch {
    return [];
  }
}

export async function translateText(text: string, targetLang: 'kn' | 'en' = 'kn'): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data.translatedText || text;
  } catch {
    return text;
  }
}

