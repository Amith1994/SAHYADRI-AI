import type { ChatResponse, Crop, Source, FarmContextData, IMDWeatherAdvisory } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function sendChatMessage(params: {
  question: string;
  crop: string | null;
  language: string;
  sessionId?: string;
  farmContext?: FarmContextData;
}): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to communicate with agricultural AI');
  }

  return res.json();
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

