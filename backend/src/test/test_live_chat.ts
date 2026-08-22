import axios from 'axios';

async function testPestDisease() {
  try {
    console.log('=== TEST 1 (English): Blast in Rice ===');
    const res1 = await axios.post('http://localhost:3001/api/chat', {
      crop: 'rice',
      question: 'How to control blast disease in paddy rice crop?',
      language: 'en',
      sessionId: 'session_rice_blast',
      farmContext: {
        district: 'Shivamogga',
        block: 'Shivamogga',
        region: 'Shivamogga',
        season: 'Kharif (Monsoon)',
        variety: 'Jyothi',
        soil: 'Sandy Loam',
      },
    });

    console.log('Provider:', res1.data.provider);
    console.log('=== FULL ANSWER (English) ===\n' + res1.data.answer + '\n===================');

    console.log('\n=== TEST 2 (Kannada): Groundnut Tikka Disease ===');
    const res2 = await axios.post('http://localhost:3001/api/chat', {
      crop: 'groundnut',
      question: 'ಕಡಲೆಕಾಯಿಯಲ್ಲಿ ಟಿಕ್ಕಾ ಎಲೆಚುಕ್ಕೆ ರೋಗವನ್ನು ಹೇಗೆ ನಿಯಂತ್ರಿಸಬೇಕು?',
      language: 'kn',
      sessionId: 'session_gnut_kn',
      farmContext: {
        district: 'Chitradurga',
        block: 'Hiriyur',
        region: 'Chitradurga',
        season: 'Kharif',
        variety: 'TMV-2',
        soil: 'Red Sandy Loam',
      },
    });

    console.log('=== FULL ANSWER (Kannada) ===\n' + res2.data.answer + '\n===================');
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testPestDisease();
