import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // also default

import { callLLM } from '../services/llm';

async function test() {
  console.log('LLM_PROVIDER:', process.env.LLM_PROVIDER);
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(0, 10) + '...' : 'NOT SET');
  console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL);

  const res = await callLLM({
    question: 'No rainfall: what to do and how to get higher yield in groundnut?',
    crop: 'groundnut',
    intent: 'general_advisory',
    language: 'en',
    context: 'Package of Practices for Groundnut in Karnataka (PoP 2026)',
    sourceList: 'KSNUAHS Groundnut PoP 2026',
  });
  console.log('RESULT PROVIDER:', res.provider);
  console.log('RESULT TEXT:\n', res.answer);
}

test().catch(console.error);
