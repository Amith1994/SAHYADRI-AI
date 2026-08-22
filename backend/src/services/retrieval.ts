// TF-IDF Vector Retrieval — Sahyadri Chatbot
// Local cosine similarity — no external vector DB needed for MVP

import fs from 'fs';
import path from 'path';

export interface KnowledgeDoc {
  id: string;
  crop: string;
  topic: string; // matches Intent
  title: string;
  content: string;
  source_name: string;
  source_short: string;
  source_id: string;
  source_url: string;
  source_type: string;
  state: string;
  language: string;
  last_verified: string;
  authority: number; // 1=highest
}

export interface RetrievalResult {
  doc: KnowledgeDoc;
  score: number;
}

// ─── Load Knowledge Base ─────────────────────────────────────────────────────
// Helper to parse CSV lines safely
function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let insideQuotes = false;
    let currentVal = '';

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    if (values.length >= headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = (values[idx] || '').replace(/^"|"$/g, '').trim();
      });
      rows.push(row);
    }
  }
  return rows;
}

let _knowledgeBase: KnowledgeDoc[] | null = null;

export function loadKnowledgeBase(): KnowledgeDoc[] {

  if (_knowledgeBase) return _knowledgeBase;

  const kbPath = path.join(__dirname, '../../../knowledge_base');
  const dataPath = path.join(__dirname, '../data');
  const docs: KnowledgeDoc[] = [];

  // 1. Load JSON files from knowledge_base directory
  if (fs.existsSync(kbPath)) {
    const crops = ['groundnut', 'rice', 'maize', 'arecanut'];
    const topics = ['production', 'soil_nutrition', 'irrigation', 'pests', 'diseases', 'harvest'];

    for (const crop of crops) {
      for (const topic of topics) {
        const dirPath = path.join(kbPath, crop, topic);
        if (!fs.existsSync(dirPath)) continue;

        const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
        for (const file of files) {
          try {
            let content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
            content = content.replace(/^\uFEFF/, '').trim();
            const doc = JSON.parse(content) as KnowledgeDoc;
            docs.push(doc);
          } catch (e) {
            console.error(`[Retrieval] Failed to load ${file}:`, e);
          }
        }
      }
    }
  }

  // 2. Ingest chemical_management.csv
  const chemCsvPath = path.join(dataPath, 'chemical_management.csv');
  if (fs.existsSync(chemCsvPath)) {
    try {
      const rows = parseCSV(fs.readFileSync(chemCsvPath, 'utf-8'));
      rows.forEach((r, idx) => {
        const cropLower = (r.crop || 'general').toLowerCase().replace('paddy', 'rice');
        docs.push({
          id: `chem_${cropLower}_${idx}`,
          crop: cropLower,
          topic: 'pests',
          title: `Chemical Management: ${r.pest_disease} in ${r.crop}`,
          content: `Pest / Disease: ${r.pest_disease}\nActive Ingredient: ${r.active_ingredient} (${r.formulation})\nDosage: ${r.dose} in ${r.water_volume || '500 L/ha water'}\nApplication Method: ${r.application_method}\nApplication Timing: ${r.timing}\nRepeat Interval: ${r.repeat_interval || '10-14 days'}\nPre-Harvest Interval (PHI / Waiting Period): ${r.waiting_period}\nApproval Status: ${r.approval_status} in Karnataka (PoP 2026)\nNotes & Precautions: ${r.notes}`,
          source_name: `${r.source || 'Karnataka PoP 2026'} — Chemical Database`,
          source_short: 'Karnataka PoP / ICAR',
          source_id: 'chem_db',
          source_url: 'https://uahs.edu.in/',
          source_type: 'Package of Practices / University Research',
          state: 'Karnataka',
          language: 'en',
          last_verified: '2026-08',
          authority: 1,
        });
      });
    } catch (err) {
      console.error('[Retrieval] Failed to load chemical_management.csv:', err);
    }
  }

  // 3. Ingest biocontrol_database.csv
  const bioCsvPath = path.join(dataPath, 'biocontrol_database.csv');
  if (fs.existsSync(bioCsvPath)) {
    try {
      const rows = parseCSV(fs.readFileSync(bioCsvPath, 'utf-8'));
      rows.forEach((r, idx) => {
        const cropLower = (r.crop || 'general').toLowerCase().replace('paddy', 'rice');
        docs.push({
          id: `bio_${cropLower}_${idx}`,
          crop: cropLower,
          topic: 'pests',
          title: `Biological & Organic Control: ${r.pest_disease} in ${r.crop}`,
          content: `Target Pest/Disease: ${r.pest_disease}\nBiocontrol Agent: ${r.biocontrol_agent} (${r.scientific_name})\nAgent Classification: ${r.agent_type} targeting ${r.target}\nApplication Method & Dose/Rate: ${r.application_method} @ ${r.dose_or_release_rate}\nApplication Timing: ${r.timing}\nCompatibility: ${r.compatibility}\nNotes: ${r.notes}`,
          source_name: `${r.source || 'ICAR / UAS Bio-agent Repository'} — Biological Database`,
          source_short: 'ICAR / UAS Bio-agent Repository',
          source_id: 'bio_db',
          source_url: 'https://icar.org.in/',
          source_type: 'National Agricultural Research System',
          state: 'Karnataka',
          language: 'en',
          last_verified: '2026-08',
          authority: 1,
        });
      });
    } catch (err) {
      console.error('[Retrieval] Failed to load biocontrol_database.csv:', err);
    }
  }

  // 4. Ingest ipm_database.csv
  const ipmCsvPath = path.join(dataPath, 'ipm_database.csv');
  if (fs.existsSync(ipmCsvPath)) {
    try {
      const rows = parseCSV(fs.readFileSync(ipmCsvPath, 'utf-8'));
      rows.forEach((r, idx) => {
        const cropLower = (r.crop || 'general').toLowerCase().replace('paddy', 'rice');
        docs.push({
          id: `ipm_${cropLower}_${idx}`,
          crop: cropLower,
          topic: 'pests',
          title: `Integrated Pest Management (IPM) & Cultural Practices: ${r.pest_disease} in ${r.crop}`,
          content: `Target Pest/Disease: ${r.pest_disease}\nMonitoring & Traps: ${r.monitoring}\nEconomic Threshold Level (ETL): ${r.threshold}\nCultural Practices: ${r.cultural}\nMechanical & Physical Control: ${r.mechanical} / ${r.physical}\nBiological Tactics: ${r.biological}\nChemical Timing: ${r.chemical}\nNotes: ${r.notes}`,
          source_name: `${r.source || 'Karnataka PoP / ICAR IPM Network'} — IPM Database`,
          source_short: 'Karnataka PoP IPM',
          source_id: 'ipm_db',
          source_url: 'https://uasd.edu/',
          source_type: 'University IPM Guidelines',
          state: 'Karnataka',
          language: 'en',
          last_verified: '2026-08',
          authority: 1,
        });
      });
    } catch (err) {
      console.error('[Retrieval] Failed to load ipm_database.csv:', err);
    }
  }

  console.log(`[Retrieval] Loaded ${docs.length} knowledge documents (JSON + Chemical + Biocontrol + IPM datasets)`);
  _knowledgeBase = docs;
  return docs;
}


// ─── TF-IDF Tokenizer ───────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0C80-\u0CFF\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function computeTFIDF(queryTokens: string[], docText: string): number {
  const docTokens = tokenize(docText);
  const docSet = new Set(docTokens);
  
  let score = 0;
  for (const qt of queryTokens) {
    if (docSet.has(qt)) {
      // TF component: frequency in doc
      const tf = docTokens.filter(t => t === qt).length / docTokens.length;
      score += tf + 0.1; // boost for presence
    }
    // Partial match boost
    for (const dt of docSet) {
      if (dt.includes(qt) || qt.includes(dt)) {
        score += 0.05;
        break;
      }
    }
  }
  return score;
}

// ─── Main Retrieval Function ─────────────────────────────────────────────────
export function retrieveDocuments(params: {
  query: string;
  crop: string | null;
  intent: string;
  topK?: number;
}): RetrievalResult[] {
  const { query, crop, intent, topK = 6 } = params;
  const docs = loadKnowledgeBase();

  if (docs.length === 0) return [];

  const queryTokens = tokenize(query);

  const INTENT_TO_TOPIC: Record<string, string[]> = {
    crop_production:      ['production'],
    nutrient_soil:        ['soil_nutrition'],
    pest_disease:         ['pests', 'diseases'],
    irrigation_water:     ['irrigation'],
    harvest_postharvest:  ['harvest'],
    general:              ['production', 'soil_nutrition', 'irrigation', 'pests', 'diseases', 'harvest'],
  };
  const relevantTopics = INTENT_TO_TOPIC[intent] || [];

  const scored: RetrievalResult[] = docs.map(doc => {
    let score = computeTFIDF(queryTokens, `${doc.title} ${doc.content}`);

    // Boost: crop match
    if (crop && doc.crop === crop) score *= 2.5;

    // Boost: topic/intent match
    if (relevantTopics.includes(doc.topic)) score *= 1.8;

    // Boost: Karnataka-specific sources
    if (doc.state === 'Karnataka') score *= 1.3;

    // Boost: higher-authority sources (priority 1 > 2 > 3 > 4)
    score *= (5 - doc.authority) / 4;

    return { doc, score };
  });

  return scored
    .filter(r => r.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ─── Format Context for LLM ─────────────────────────────────────────────────
export function formatContext(results: RetrievalResult[]): {
  contextText: string;
  sourceList: string;
  citations: Array<{ id: number; title: string; url: string; sourceId: string; relevance: number }>;
} {
  if (results.length === 0) {
    return {
      contextText: 'No relevant information found in knowledge base.',
      sourceList: '',
      citations: [],
    };
  }

  const contextText = results.map((r, i) => `
[${i + 1}] ${r.doc.title} (${r.doc.source_short}, ${r.doc.state})
Crop: ${r.doc.crop} | Topic: ${r.doc.topic}
---
${r.doc.content}
`).join('\n');

  const sourceList = results.map((r, i) =>
    `[${i + 1}] ${r.doc.source_name}\n    ${r.doc.source_url}`
  ).join('\n');

  const citations = results.map((r, i) => ({
    id: i + 1,
    title: r.doc.source_name,
    url: r.doc.source_url,
    sourceId: r.doc.source_id,
    relevance: Math.min(0.99, r.score / (results[0].score || 1)),
  }));

  return { contextText, sourceList, citations };
}
