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
  console.log('\n--- TEST 3: 45 DAS Pest and Disease Query (English) ---');
  const res3 = await runRAGPipeline({
    crop: 'groundnut',
    question: 'my crop is at 45 DAS. WHAT ARE THE PEST AND DISEASES?',
    language: 'en',
    sessionId: 'test_session_45das_en',
    farmContext: {
      district: 'Shivamogga',
      block: 'Shivamogga',
      season: 'Kharif',
      variety: 'TMV-2',
      soil: 'Sandy Loam'
    }
  });
  console.log('PROVIDER:', res3.provider);
  console.log('CROP:', res3.crop);
  console.log('ANSWER:\n' + res3.answer);

  console.log('\n--- TEST 4: 45 DAS Pest and Disease Query (Kannada) ---');
  const res4 = await runRAGPipeline({
    crop: 'groundnut',
    question: 'ನನ್ನ ಬೆಳೆ 45 ದಿನಗಳ ಹಂತದಲ್ಲಿದೆ (45 DAS). ಯಾವ ಕೀಟ ಮತ್ತು ರೋಗಗಳು ಬರುತ್ತವೆ?',
    language: 'kn',
    sessionId: 'test_session_45das_kn',
    farmContext: {
      district: 'Shivamogga',
      block: 'Shivamogga',
      season: 'Kharif',
      variety: 'TMV-2',
      soil: 'Sandy Loam'
    }
  });
  console.log('PROVIDER:', res4.provider);
  console.log('CROP:', res4.crop);
  console.log('ANSWER:\n' + res4.answer);
}

main().catch(console.error);
