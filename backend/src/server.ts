import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import chatRouter from './routes/chat';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '2mb' }));

// Routes
app.use('/api', chatRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Sahyadri Chatbot API',
    version: '1.0.0',
    llmProvider: process.env.LLM_PROVIDER || 'mock',
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`\n🌱 Sahyadri Chatbot Backend running on http://localhost:${PORT}`);
  console.log(`   LLM Provider: ${process.env.LLM_PROVIDER || 'mock (demo mode)'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
