import { runRAGPipeline } from '../services/rag';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testUserQuery() {
  console.log('Testing User Query...');
  try {
    const res = await runRAGPipeline({
      crop: 'groundnut',
      question: 'by looking to the current rainfall status and my groundnut crop is 30 days what i need to do operation for getting higher yield',
      language: 'en',
      sessionId: 'test_30_days',
      farmContext: {
        district: 'Shivamogga',
        block: 'Shivamogga',
        season: 'Kharif',
        variety: 'TMV-2',
        soil: 'Sandy Loam',
      },
    });

    console.log('Provider:', res.provider);
    console.log('Answer:\n', res.answer);
  } catch (err: any) {
    console.error('Error during test:', err);
  }
}

testUserQuery();
