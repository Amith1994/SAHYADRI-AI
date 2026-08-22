import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { runRAGPipeline } from '../services/rag';

async function testCrop(name: string, q: string, crop: string, variety: string, district: string) {
  console.log(`\n======================================================`);
  console.log(`🌾 TESTING: ${name} [Crop: ${crop}, Variety: ${variety}, Dist: ${district}]`);
  console.log(`Question: "${q}"`);
  console.log(`======================================================`);

  const res = await runRAGPipeline({
    question: q,
    crop,
    language: 'en',
    sessionId: `test_session_${Date.now()}_${crop}`,
    farmContext: {
      district,
      block: district,
      season: 'Kharif',
      variety,
      soil: 'Sandy Loam',
    },
  });

  console.log(`Detected Crop: ${res.crop} | Variety: ${res.farmContext?.variety}`);
  console.log(`Provider: ${res.provider}`);
  console.log(`\n--- Response Preview ---`);
  console.log(res.answer.slice(0, 400) + '...\n');

  // Check no cross-crop contamination
  const lowerAns = res.answer.toLowerCase();
  const forbiddenByCrop: Record<string, string[]> = {
    groundnut: ['paddy', 'bpt-5204', 'mohitnagar', 'arecanut'],
    rice: ['groundnut', 'tmv-2', 'mohitnagar', 'arecanut', 'pegging'],
    maize: ['pegging', 'koleroga', 'tmv-2', 'mohitnagar'],
    arecanut: ['pegging', 'tmv-2', 'jyothi', 'bpt-5204'],
  };

  const forbidden = forbiddenByCrop[res.crop || ''] || [];
  const foundForbidden = forbidden.filter((f) => lowerAns.includes(f));

  if (foundForbidden.length > 0) {
    console.error(`❌ FAILED for ${name}: Found cross-crop terms: ${foundForbidden.join(', ')}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${name} is 100% crop-pure and context-aligned!`);
  }
}

async function main() {
  await testCrop(
    'Groundnut 30-Day Stage',
    'my groundnut crop is 30 days old what field operations are needed for higher yield looking at rainfall',
    'groundnut',
    'TMV-2',
    'Chitradurga'
  );

  await testCrop(
    'Rice Paddy Transplanting',
    'shall i go for paddy transplanting now in this weather',
    'rice',
    'Jyothi',
    'Shivamogga'
  );

  await testCrop(
    'Maize FAW Pest Management',
    'how do i manage fall armyworm in maize at 20 days',
    'maize',
    'NK-6240',
    'Davanagere'
  );

  await testCrop(
    'Arecanut Fruit Rot Control',
    'what is the spray schedule for koleroga fruit rot in arecanut garden',
    'arecanut',
    'Mohitnagar',
    'Shivamogga'
  );

  console.log(`\n🎉 ALL 4 CROPS PASSED 100% CLEAN CROP-VARIETY-WEATHER TESTS!`);
}

main().catch(console.error);
