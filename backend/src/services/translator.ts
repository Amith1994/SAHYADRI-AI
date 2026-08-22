import { callLLM } from './llm';

const TRANSLATION_SYSTEM_PROMPT = `You are an expert Kannada agricultural translator specializing in Karnataka agriculture, KSNUAHS Shivamogga, and ICAR Package of Practices.

Translate the provided English agricultural advisory text into 100% natural, grammatically sound, fluent KANNADA script (ಕನ್ನಡ).

STRICT RULES:
1. Translate ALL headings accurately:
   - "### Answer" or "### Diagnosis & Direct Answer" ➔ "### ಉತ್ತರ"
   - "### What to do & Recommended Field Operations" ➔ "### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)"
   - "### 🌦️ Weather-Based Agro-Advisory" ➔ "### 🌦️ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ"
   - "### ⚠️ Important Message for Farmer" ➔ "### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ"
   - "### Sources" ➔ "### ಮೂಲಗಳು"
2. Translate all technical terms into standard Kannada agronomy terms (e.g. silking ➔ ತೆನೆ/ರೇಷ್ಮೆ ಹಂತ, tasseling ➔ ಹೂಬಿಡುವ ಹಂತ, pegging ➔ ಕಾಯಿ ಇಳಿಯುವ ಹಂತ, transplanting ➔ ನಾಟಿ, Fall Armyworm ➔ ಲದ್ದಿ ಹುಳು, Tikka ➔ ಟಿಕ್ಕಾ ಎಲೆಚುಕ್ಕೆ ರೋಗ, Koleroga ➔ ಕೊಳೆರೋಗ/ಮಹಾಲಿ).
3. Keep all numbers, chemical names (with Kannada transliteration), dosages (e.g., 0.4 mL/L, 500 kg/ha), and Markdown formatting (bolding, lists) intact.
4. DO NOT add inline bracket citations like [1] or [2] in the body text.
5. Return ONLY the translated markdown text in Kannada.`;

export async function translateToKannada(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;
  
  // If already Kannada
  const kannadaChars = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
  if (kannadaChars > 50) return text;

  try {
    const res = await callLLM(
      TRANSLATION_SYSTEM_PROMPT,
      `Translate this agricultural advisory into complete, fluent Kannada:\n\n${text}`
    );
    return res.text || text;
  } catch (err: any) {
    console.error('[Translator] Error translating to Kannada:', err.message);
    return text;
  }
}
