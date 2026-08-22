import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await axios.post(url, {
    contents: [{
      parts: [{ text: `You are Sahyadri Agricultural AI assistant.\n\nCROP: Groundnut\nVARIETY: TMV-2\nLOCATION: Shivamogga, Karnataka\nFARMER QUESTION: No rainfall: what to do and how to get higher yield in groundnut crop?` }]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1500,
    }
  });

  console.log('Gemini Response:');
  console.log(res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
}

testGemini().catch(e => console.error(e.response?.data || e.message));
