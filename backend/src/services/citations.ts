// Citation Validator — Sahyadri Chatbot
// Ensures LLM citations are valid and always include KSNUAHS Shivamogga, GKMS Shivamogga, and AMFU Hiriyur

export interface Citation {
  id: number;
  title: string;
  url: string;
  sourceId: string;
  relevance: number;
  type?: string;
}

export const MANDATORY_INSTITUTIONAL_CITATIONS: Citation[] = [
  {
    id: 1,
    title: 'KSNUAHS Shivamogga — Package of Practices (PoP 2026)',
    url: 'https://uahs.edu.in/',
    sourceId: 'ksnuahs_shivamogga',
    relevance: 0.99,
    type: 'State Agricultural & Horticultural University',
  },
  {
    id: 2,
    title: 'GKMS Shivamogga — District Agromet Unit (DAMU), KSNUAHS & IMD',
    url: 'https://uahs.edu.in/agromet-bulletin',
    sourceId: 'gkms_shivamogga',
    relevance: 0.97,
    type: 'IMD & University Agromet Advisory Service',
  },
  {
    id: 3,
    title: 'AMFU Hiriyur — ZAHRS Agromet Field Unit, KSNUAHS',
    url: 'https://uahs.edu.in/zahrs-hiriyur',
    sourceId: 'amfu_hiriyur',
    relevance: 0.95,
    type: 'University Research Station & Agromet Center',
  },
];

// Parse [1], [2] etc. from LLM response
export function extractUsedCitationIds(text: string): number[] {
  const matches = text.match(/\[(\d+)\]/g) || [];
  return [...new Set(matches.map((m) => parseInt(m.replace(/\[|\]/g, ''))))];
}

// Filter and merge with mandatory foundational citations (KSNUAHS, GKMS, AMFU)
export function validateCitations(
  answerText: string,
  retrievedCitations: Citation[]
): Citation[] {
  const usedIds = extractUsedCitationIds(answerText);
  const matched = retrievedCitations.filter((c) => usedIds.includes(c.id));

  // Merge mandatory institutions + matched retrieved citations
  const citationMap = new Map<string, Citation>();

  // Always add mandatory citations first
  MANDATORY_INSTITUTIONAL_CITATIONS.forEach((c) => citationMap.set(c.sourceId, c));

  // Add matched retrieved citations
  (matched.length > 0 ? matched : retrievedCitations.slice(0, 3)).forEach((c) => {
    if (!citationMap.has(c.sourceId)) {
      citationMap.set(c.sourceId, {
        ...c,
        id: citationMap.size + 1,
      });
    }
  });

  return Array.from(citationMap.values()).map((c, index) => ({
    ...c,
    id: index + 1,
    relevance: Math.round(c.relevance * 100) / 100,
  }));
}

// Format citations for the source panel
export function formatCitationsForPanel(citations: Citation[]): Citation[] {
  return citations.map((c, idx) => ({
    ...c,
    id: idx + 1,
    relevance: Math.round(c.relevance * 100) / 100,
  }));
}
