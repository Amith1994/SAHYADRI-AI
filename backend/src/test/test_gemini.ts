import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // also default

import { callLLM } from '../services/llm';

async function test() {
  console.log('LLM_PROVIDER:', process.env.LLM_PROVIDER);
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(0, 10) + '...' : 'NOT SET');
  console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL);

  const res = await callLLM('You are an agricultural assistant.', 'CROP: groundnut\nQUESTION: No rainfall: what to do and how to get higher yield in groundnut?');
  console.log('RESULT PROVIDER:', res.provider);
  console.log('RESULT TEXT:\n', res.text);
}

test().catch(console.error);
