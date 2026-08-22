import { runRAGPipeline } from '../services/rag';
import { generateIMDWeatherBulletin } from '../services/weather';

async function main() {
  console.log('=== TEST 1: Groundnut with TMV-2 ===');
  const res1 = await runRAGPipeline({
    crop: 'groundnut',
    question: 'What is the recommended seed rate and spacing?',
    language: 'en',
    sessionId: 'session_test_1',
    farmContext: {
      district: 'Shivamogga',
      block: 'Shivamogga',
      region: 'Shivamogga',
      season: 'Kharif (Monsoon)',
      variety: 'TMV-2',
      soil: 'Sandy Loam',
    },
  });

  console.log('\n--- SAHYADRI AGRICULTURAL AI ANSWER ---');
  console.log(res1.answer);
  console.log('\nCitations count:', res1.citations.length);
  console.log('Weather attached district:', res1.weather?.district, 'Block:', res1.weather?.block);
  console.log('Weather records count:', res1.weather?.records.length);

  console.log('\n=== TEST 2: Weather Bulletin for Shivamogga ===');
  const bulletin = generateIMDWeatherBulletin('Shivamogga', 'Shivamogga', 'Groundnut', 'en');
  console.log('Weather Table Preview:\n' + bulletin.weatherTableMarkdown);
  console.log('SMS Alert:\n' + bulletin.smsAdvisory160Chars);
  console.log('\nAll tests completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
