// Speech Synthesis Service for Sahyadri Chatbot (Kannada & English TTS)

export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Remove Sources section completely from speech (farmers do not need URLs recited)
  cleaned = cleaned.replace(/###\s*(Sources|ಮೂಲಗಳು)[\s\S]*$/i, '');

  // Clean Markdown headers to smooth natural speech prefixes
  cleaned = cleaned.replace(/###\s*(?:Diagnosis & Direct Answer|Answer)/gi, 'Answer: ');
  cleaned = cleaned.replace(/###\s*(?:What to do & Recommended Field Operations|What to do)/gi, 'Recommended field operations: ');
  cleaned = cleaned.replace(/###\s*(?:[🌦️⛅]\s*)?Weather-Based Agro-Advisory/gi, 'Weather-based agro advisory: ');
  cleaned = cleaned.replace(/###\s*(?:[⚠️❗]\s*)?Important Message for Farmer/gi, 'Important message for farmer: ');

  // Kannada headers
  cleaned = cleaned.replace(/###\s*ಉತ್ತರ/g, 'ಉತ್ತರ: ');
  cleaned = cleaned.replace(/###\s*ಏನು ಮಾಡಬೇಕು[^\n]*/g, 'ಶಿಫಾರಸು ಮಾಡಿದ ಕೃಷಿ ಕ್ರಮಗಳು: ');
  cleaned = cleaned.replace(/###\s*[🌦️⛅]?\s*ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ/g, 'ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ: ');
  cleaned = cleaned.replace(/###\s*[⚠️❗]?\s*ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ/g, 'ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ: ');

  // Remove other Markdown symbols
  cleaned = cleaned
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[\d+(?:,\s*\d+)*\]/g, '') // Remove bracket citations [1]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links [text](url) -> text
    .replace(/https?:\/\/[^\s]+/g, '') // Remove naked URLs
    .replace(/[🌱🌾🌽🌴🥜🧪🌿🛡️🌦️⚠️📚📋🔍]/g, '') // Remove decorative emojis
    .replace(/^\s*[-*•]\s+/gm, '') // Remove bullet characters
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbering digits for cleaner flow
    .replace(/@\s*/g, 'at ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking && currentUtterance !== null;
  }
  return false;
}

export function getCurrentUtterance(): SpeechSynthesisUtterance | null {
  return currentUtterance;
}

export function speakText(
  rawText: string,
  language: 'en' | 'kn',
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): boolean {
  if (!isSpeechSupported()) {
    console.warn('Speech synthesis is not supported on this browser.');
    return false;
  }

  // Always cancel any ongoing speech before starting new speech
  stopSpeech();

  const speechText = cleanTextForSpeech(rawText);
  if (!speechText) return false;

  const utterance = new SpeechSynthesisUtterance(speechText);
  currentUtterance = utterance;

  // Determine language code: Kannada has kn-IN, English uses en-IN
  const langCode = language === 'kn' ? 'kn-IN' : 'en-IN';
  utterance.lang = langCode;

  // Find best available voice for language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice =
    voices.find((v) => v.lang.toLowerCase() === langCode.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(language === 'kn' ? 'kn' : 'en'));

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  // Optimize speed and pitch for crisp clarity
  utterance.rate = language === 'kn' ? 0.88 : 0.94; // slightly slower for regional terms
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('[Speech] Synthesis error:', e);
    currentUtterance = null;
    callbacks?.onError?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}
