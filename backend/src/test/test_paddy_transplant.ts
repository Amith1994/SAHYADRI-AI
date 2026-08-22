import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { runRAGPipeline } from '../services/rag';

async function main() {
  console.log('Testing Paddy Transplanting Query...');
  const userQuery = 'shall i go for paddy transplanting now';

  // Simulate payload where user previously had groundnut / TMV-2 selected
  const res = await runRAGPipeline({
    question: userQuery,
    crop: 'groundnut', // Stale crop from previous session
    language: 'en',
    sessionId: `test_session_${Date.now()}`,
    farmContext: {
      district: 'Shivamogga',
      block: 'Shivamogga',
      season: 'Kharif',
      variety: 'TMV-2', // Stale groundnut variety
      soil: 'Clay Loam',
    },
  });

  console.log('Detected Crop:', res.crop);
  console.log('Sanitized Variety in FarmContext:', res.farmContext?.variety);
  console.log('Provider:', res.provider);
  console.log('--- ANSWER ---');
  console.log(res.answer);

  // Assertions
  const lowerAnswer = res.answer.toLowerCase();
  if (lowerAnswer.includes('groundnut') || lowerAnswer.includes('tmv-2') || lowerAnswer.includes('tmv 2')) {
    console.error('❌ FAILED: Answer contains cross-crop Groundnut or TMV-2 mention!');
    process.exit(1);
  } else {
    console.log('✅ PASSED: Answer contains zero cross-crop Groundnut/TMV-2 confusion!');
  }
}

main().catch(console.error);
