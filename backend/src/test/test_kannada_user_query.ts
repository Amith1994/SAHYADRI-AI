import { runRAGPipeline } from '../services/rag';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testKannada() {
  console.log('Testing Kannada 30-Day Query...');
  try {
    const res = await runRAGPipeline({
      crop: 'groundnut',
      question: 'ನನ್ನ ಕಡಲೆಕಾಯಿ ಬೆಳೆ 30 ದಿನಗಳಾಗಿದ್ದು, ಪ್ರಸ್ತುತ ಮಳೆಯ ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಅಧಿಕ ಇಳುವರಿ ಪಡೆಯಲು ಯಾವ ಕೃಷಿ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಬೇಕು?',
      language: 'kn',
      sessionId: 'test_kn_30_days',
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

testKannada();
