import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { detectAll } from '../services/cropDetect';
import { retrieveDocuments, formatContext } from '../services/retrieval';
import { runRAGPipeline } from '../services/rag';

const TEST_SUITE = [
  // ─── Groundnut (5 questions) ─────────────────────────────────────────────
  {
    crop: 'groundnut',
    intent: 'crop_production',
    q: 'What is the recommended seed rate for groundnut in Karnataka?',
  },
  {
    crop: 'groundnut',
    intent: 'nutrient_soil',
    q: 'When should I apply gypsum to groundnut and what is the dose?',
  },
  {
    crop: 'groundnut',
    intent: 'pest_disease',
    q: 'How do I control Tikka leaf spot disease in groundnut?',
  },
  {
    crop: 'groundnut',
    intent: 'irrigation_water',
    q: 'What are the critical irrigation stages for groundnut?',
  },
  {
    crop: 'groundnut',
    intent: 'harvest_postharvest',
    q: 'How do I know groundnut is ready for harvest?',
  },

  // ─── Rice / Paddy (5 questions) ──────────────────────────────────────────
  {
    crop: 'rice',
    intent: 'crop_production',
    q: 'What is the nursery area and seed rate for transplanting paddy?',
  },
  {
    crop: 'rice',
    intent: 'nutrient_soil',
    q: 'What is the NPK fertilizer schedule for Jyothi rice variety?',
  },
  {
    crop: 'rice',
    intent: 'pest_disease',
    q: 'How can I manage blast disease in paddy?',
  },
  {
    crop: 'rice',
    intent: 'irrigation_water',
    q: 'How does Alternate Wetting and Drying (AWD) work in rice?',
  },
  {
    crop: 'rice',
    intent: 'harvest_postharvest',
    q: 'What are the maturity indicators and storage moisture for paddy?',
  },

  // ─── Maize (5 questions) ────────────────────────────────────────────────
  {
    crop: 'maize',
    intent: 'crop_production',
    q: 'What is the recommended row spacing and plant population for hybrid maize?',
  },
  {
    crop: 'maize',
    intent: 'nutrient_soil',
    q: 'How should 180 kg N be applied in split doses for maize?',
  },
  {
    crop: 'maize',
    intent: 'pest_disease',
    q: 'How do I control Fall Armyworm in maize?',
  },
  {
    crop: 'maize',
    intent: 'irrigation_water',
    q: 'When is water stress most damaging in maize crop?',
  },
  {
    crop: 'maize',
    intent: 'harvest_postharvest',
    q: 'What is the black layer maturity indicator in maize?',
  },

  // ─── Arecanut (5 questions) ─────────────────────────────────────────────
  {
    crop: 'arecanut',
    intent: 'crop_production',
    q: 'What is the recommended pit size and spacing for arecanut planting?',
  },
  {
    crop: 'arecanut',
    intent: 'nutrient_soil',
    q: 'What fertilizer and FYM dose is required for bearing arecanut palms?',
  },
  {
    crop: 'arecanut',
    intent: 'pest_disease',
    q: 'How to control Koleroga Mahali fruit rot disease in arecanut?',
  },
  {
    crop: 'arecanut',
    intent: 'irrigation_water',
    q: 'What is the water requirement for arecanut during summer months?',
  },
  {
    crop: 'arecanut',
    intent: 'harvest_postharvest',
    q: 'When should green chali vs ripe red arecanut be harvested?',
  },

  // ─── Kannada Query Test ─────────────────────────────────────────────────
  {
    crop: 'arecanut',
    intent: 'pest_disease',
    q: 'ಅಡಿಕೆಯಲ್ಲಿ ಕೊಳೆರೋಗವನ್ನು ಹೇಗೆ ನಿಯಂತ್ರಿಸಬೇಕು?',
  },

  // ─── Out of Scope Test ──────────────────────────────────────────────────
  {
    crop: null,
    intent: 'general',
    q: 'How do I grow sugarcane and what is the fertilizer dose?',
  },
];

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🌱 SAHYADRI CHATBOT — AUTOMATED TEST SUITE (22 Test Cases)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < TEST_SUITE.length; i++) {
    const test = TEST_SUITE[i];
    console.log(`[Test ${i + 1}/${TEST_SUITE.length}] "${test.q}"`);

    // 1. Detection Test
    const detection = detectAll(test.q);
    const cropMatch = test.crop === null ? detection.crop === null : detection.crop === test.crop;
    
    // 2. Retrieval Test
    const results = retrieveDocuments({
      query: detection.rewrittenQuery,
      crop: detection.crop,
      intent: detection.intent,
      topK: 5,
    });

    const retrievedOk = test.crop === null || results.length > 0;

    // 3. Full Pipeline Test
    try {
      const res = await runRAGPipeline({
        crop: null,
        question: test.q,
        language: detection.language,
        sessionId: 'test_session',
      });

      const hasAnswer = res.answer && res.answer.length > 20;
      const citationsOk = test.crop === null ? res.outOfScope : (res.citations.length > 0 || res.isDemo);

      if (hasAnswer && (retrievedOk || res.outOfScope)) {
        console.log(`  ✅ PASSED | Detected: Crop=${detection.crop || 'none'} | Intent=${detection.intent} | Language=${detection.language} | Citations=${res.citations.length}`);
        passed++;
      } else {
        console.log(`  ❌ FAILED | Answer length: ${res.answer?.length}, Citations: ${res.citations?.length}`);
        failed++;
      }
    } catch (err: any) {
      console.log(`  ❌ ERROR: ${err.message}`);
      failed++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED (Total: ${TEST_SUITE.length})`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

runTests().catch(console.error);
