import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing apiKey:', apiKey);
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    console.log('Available models:', res.data.models.map((m: any) => m.name));
  } catch (err: any) {
    console.error('List models error:', err.response?.status, err.response?.data || err.message);
  }
}

listModels();
