import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { runRAGPipeline } from '../services/rag';

async function main() {
  console.log('--- TEST 1: English Weather + Sowing Query ---');
  const res1 = await runRAGPipeline({
    crop: null,
    question: 'what is the weather forecast and now i want to sowing of the crop what u say',
    language: 'en',
    sessionId: 'test_session_en',
    farmContext: {
      district: 'Shivamogga',
      block: 'Shivamogga',
      season: 'Kharif',
      variety: 'TMV-2',
      soil: 'Sandy Loam'
    }
  });
  console.log('PROVIDER:', res1.provider);
  console.log('CROP:', res1.crop);
  console.log('ANSWER:\n' + res1.answer);

  console.log('\n--- TEST 2: Kannada Weather + Sowing Query ---');
  const res2 = await runRAGPipeline({
    crop: null,
    question: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಏನಿದೆ ಮತ್ತು ಈಗ ನಾನು ಬಿತ್ತನೆ ಮಾಡಬಹುದೇ?',
    language: 'kn',
    sessionId: 'test_session_kn',
    farmContext: {
      district: 'Shivamogga',
      block: 'Shivamogga',
      season: 'Kharif',
      variety: 'TMV-2',
      soil: 'Sandy Loam'
    }
  });
  console.log('PROVIDER:', res2.provider);
  console.log('CROP:', res2.crop);
  console.log('ANSWER:\n' + res2.answer);
}

main().catch(console.error);
