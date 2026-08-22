import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
const models = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3.7-flash',
];

async function testModels() {
  console.log('Testing Gemini API with models...');
  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const t0 = Date.now();
      const res = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: 'Hello, respond with ONE short sentence.' }] }],
        },
        { timeout: 10000 }
      );
      console.log(
        `✅ Model: ${m} | Time: ${Date.now() - t0}ms | Response:`,
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      );
    } catch (err: any) {
      console.log(
        `❌ Model: ${m} | Status: ${err.response?.status} | Error:`,
        err.response?.data?.error?.message || err.message
      );
    }
  }
}

testModels();
