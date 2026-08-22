import { Router, Request, Response } from 'express';
import { runRAGPipeline } from '../services/rag';
import { generateIMDWeatherBulletin, getDistrictWeather } from '../services/weather';
import { translateToKannada } from '../services/translator';
import { CROPS, SOURCES } from '../data/sources';

const router = Router();

// POST /api/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { crop, question, language, sessionId, farmContext } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }
    if (question.trim().length < 3) {
      return res.status(400).json({ error: 'Question is too short' });
    }

    const result = await runRAGPipeline({
      crop: crop || null,
      question: question.trim(),
      language: language || 'en',
      sessionId: sessionId || null,
      farmContext: farmContext || undefined,
    });

    return res.json(result);
  } catch (err: any) {
    console.error('[/api/chat] Error:', err.message);
    return res.status(500).json({
      error: 'Unable to retrieve agricultural information at the moment. Please try again.',
      answer: 'Unable to retrieve agricultural information at the moment. Please try again.',
      citations: [],
    });
  }
});

// POST /api/translate
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    const translated = await translateToKannada(text);
    return res.json({ translatedText: translated });
  } catch (err: any) {
    console.error('[/api/translate] Error:', err.message);
    return res.status(500).json({ error: 'Failed to translate' });
  }
});

// GET /api/weather
router.get('/weather', (req: Request, res: Response) => {
  try {
    const district = (req.query.district as string) || 'Shivamogga';
    const block = (req.query.block as string) || district;
    const crop = (req.query.crop as string) || 'Groundnut';
    const lang = (req.query.lang as string) || 'en';

    const bulletin = generateIMDWeatherBulletin(district, block, crop, lang);
    return res.json(bulletin);
  } catch (err: any) {
    console.error('[/api/weather] Error:', err.message);
    return res.status(500).json({ error: 'Failed to generate weather bulletin' });
  }
});

// GET /api/crops
router.get('/crops', (_req: Request, res: Response) => {
  res.json({ crops: CROPS });
});

// GET /api/sources
router.get('/sources', (_req: Request, res: Response) => {
  res.json({ sources: SOURCES });
});

export default router;

