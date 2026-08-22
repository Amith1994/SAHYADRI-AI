// Crop and Source Registry — Sahyadri Chatbot
// Sources ranked by priority: ICAR > Karnataka Universities > Other Ag Universities > Govt Portals

export const CROPS = [
  {
    id: 'groundnut',
    name: 'Groundnut',
    kannada: 'ಕಡಲೆಕಾಯಿ / ಶೇಂಗಾ',
    emoji: '🥜',
    aliases: ['groundnut', 'peanut', 'moongphali', 'shenga', 'kadalekayi', 'ಶೇಂಗಾ', 'ಕಡಲೆಕಾಯಿ'],
  },
  {
    id: 'rice',
    name: 'Rice / Paddy',
    kannada: 'ಭತ್ತ',
    emoji: '🌾',
    aliases: ['rice', 'paddy', 'bhatta', 'ಭತ್ತ', 'dhan', 'dhaan'],
  },
  {
    id: 'maize',
    name: 'Maize',
    kannada: 'ಮೆಕ್ಕೆಜೋಳ',
    emoji: '🌽',
    aliases: ['maize', 'corn', 'makka', 'mekkejoola', 'ಮೆಕ್ಕೆಜೋಳ', 'makka jowar'],
  },
  {
    id: 'arecanut',
    name: 'Arecanut',
    kannada: 'ಅಡಿಕೆ',
    emoji: '🌴',
    aliases: ['arecanut', 'areca', 'betelnut', 'supari', 'adike', 'ಅಡಿಕೆ', 'betel nut'],
  },
];

export interface Source {
  id: string;
  name: string;
  shortName: string;
  url: string;
  type: string;
  priority: number; // 1=highest (ICAR), 2=Karnataka Univ, 3=Other Univ, 4=Govt Portal
  region: string;
  crops: string[];
  description: string;
}

export const SOURCES: Source[] = [
  // Mandatory Core Institutions (KSNUAHS, GKMS Shivamogga, AMFU Hiriyur)
  {
    id: 'ksnuahs_shivamogga',
    name: 'Keladi Shivappa Nayaka University of Agricultural and Horticultural Sciences, Shivamogga (KSNUAHS)',
    shortName: 'KSNUAHS Shivamogga',
    url: 'https://uahs.edu.in/',
    type: 'State Agricultural & Horticultural University',
    priority: 1,
    region: 'Karnataka',
    crops: ['groundnut', 'rice', 'maize', 'arecanut'],
    description: 'Official Package of Practices (PoP 2026) for Karnataka — Central, Malnad & Coastal agro-climatic zones.',
  },
  {
    id: 'gkms_shivamogga',
    name: 'Gramin Krishi Mausam Sewa (GKMS) — District Agromet Unit (DAMU), KSNUAHS Shivamogga',
    shortName: 'GKMS Shivamogga',
    url: 'https://uahs.edu.in/agromet-bulletin',
    type: 'IMD & University Agromet Advisory Service',
    priority: 1,
    region: 'Karnataka - Shivamogga Zone',
    crops: ['groundnut', 'rice', 'maize', 'arecanut'],
    description: 'Dynamic 5-day weather forecast, micro-climate agro-met bulletins, and impact-based farmer advisories.',
  },
  {
    id: 'amfu_hiriyur',
    name: 'Agromet Field Unit (AMFU) — Zonal Agricultural and Horticultural Research Station (ZAHRS), Hiriyur, KSNUAHS',
    shortName: 'AMFU Hiriyur (KSNUAHS)',
    url: 'https://uahs.edu.in/zahrs-hiriyur',
    type: 'University Research Station & Agromet Center',
    priority: 1,
    region: 'Karnataka - Central Dry Zone',
    crops: ['groundnut', 'rice', 'maize', 'arecanut'],
    description: 'Dryland crop agronomy, seasonal pest-weather forecasting, and operational farm weather advisories.',
  },
  // Priority 1 — ICAR Institutes
  {
    id: 'icar_iigr',
    name: 'ICAR-Indian Institute of Groundnut Research',
    shortName: 'ICAR-IIGR',
    url: 'https://www.icar-iigr.org.in/',
    type: 'ICAR Research Institute',
    priority: 1,
    region: 'National',
    crops: ['groundnut'],
    description: 'Premier national institute for groundnut research, varieties, and Package of Practices.',
  },
  {
    id: 'icar_iirr',
    name: 'ICAR-Indian Institute of Rice Research',
    shortName: 'ICAR-IIRR',
    url: 'https://icar-iirr.org/',
    type: 'ICAR Research Institute',
    priority: 1,
    region: 'National',
    crops: ['rice'],
    description: 'National institute for rice research, varieties, and IPM recommendations.',
  },
  {
    id: 'icar_nrri',
    name: 'ICAR-National Rice Research Institute',
    shortName: 'ICAR-NRRI',
    url: 'https://icar-nrri.in/',
    type: 'ICAR Research Institute',
    priority: 1,
    region: 'National',
    crops: ['rice'],
    description: 'Research on rice genetics, crop management and disease management.',
  },
  {
    id: 'icar_iimr',
    name: 'ICAR-Indian Institute of Maize Research',
    shortName: 'ICAR-IIMR',
    url: 'https://iimr.icar.gov.in/',
    type: 'ICAR Research Institute',
    priority: 1,
    region: 'National',
    crops: ['maize'],
    description: 'National maize research — hybrid varieties, FAW management, production practices.',
  },
  {
    id: 'aicrp_maize',
    name: 'AICRP on Maize',
    shortName: 'AICRP-Maize',
    url: 'https://aicrpmaize.icar.gov.in/',
    type: 'ICAR Coordinated Program',
    priority: 1,
    region: 'National',
    crops: ['maize'],
    description: 'All India Coordinated Research Project on Maize — variety trials, agronomy.',
  },
  {
    id: 'icar_cpcri',
    name: 'ICAR-Central Plantation Crops Research Institute',
    shortName: 'ICAR-CPCRI',
    url: 'https://cpcri.icar.gov.in/',
    type: 'ICAR Research Institute',
    priority: 1,
    region: 'National',
    crops: ['arecanut'],
    description: 'National institute for plantation crops including arecanut — diseases, nutrition, IPM.',
  },
  // Priority 2 — Karnataka Agricultural Universities
  {
    id: 'uas_dharwad',
    name: 'University of Agricultural Sciences Dharwad',
    shortName: 'UAS Dharwad',
    url: 'https://www.uasd.edu/',
    type: 'Karnataka Agricultural University',
    priority: 2,
    region: 'Karnataka',
    crops: ['groundnut', 'rice', 'maize', 'arecanut'],
    description: 'Package of Practices for Karnataka — North Karnataka crop recommendations.',
  },
  {
    id: 'uas_raichur',
    name: 'University of Agricultural Sciences Raichur',
    shortName: 'UAS Raichur',
    url: 'https://uasraichur.karnataka.gov.in/',
    type: 'Karnataka Agricultural University',
    priority: 2,
    region: 'Karnataka',
    crops: ['groundnut', 'rice', 'maize'],
    description: 'Package of Practices — Raichur-Hyderabad Karnataka region crop recommendations.',
  },
  {
    id: 'uas_bengaluru',
    name: 'University of Agricultural Sciences Bengaluru (GKVK)',
    shortName: 'UAS Bengaluru',
    url: 'https://www.uasbangalore.edu.in/',
    type: 'Karnataka Agricultural University',
    priority: 2,
    region: 'Karnataka',
    crops: ['groundnut', 'rice', 'maize', 'arecanut'],
    description: 'GKVK — South Karnataka Package of Practices, variety trials, agronomy.',
  },
  // Priority 3 — Other Agricultural Universities
  {
    id: 'tnau',
    name: 'TNAU Agritech Portal',
    shortName: 'TNAU',
    url: 'https://agritech.tnau.ac.in/',
    type: 'Agricultural University',
    priority: 3,
    region: 'Tamil Nadu',
    crops: ['groundnut', 'rice', 'maize', 'arecanut'],
    description: 'Tamil Nadu Agricultural University — comprehensive crop production guides.',
  },
  // Priority 4 — Government Portals
  {
    id: 'vikaspedia',
    name: 'Vikaspedia Agriculture',
    shortName: 'Vikaspedia',
    url: 'https://agriculture.vikaspedia.in/',
    type: 'Government Portal',
    priority: 4,
    region: 'National',
    crops: ['groundnut', 'rice', 'maize', 'arecanut'],
    description: 'Government of India agriculture information portal.',
  },
  {
    id: 'kvk_portal',
    name: 'KVK Portal — ICAR',
    shortName: 'KVK Portal',
    url: 'https://kvk.icar.gov.in/',
    type: 'Government Extension',
    priority: 4,
    region: 'National',
    crops: ['groundnut', 'rice', 'maize', 'arecanut'],
    description: 'Krishi Vigyan Kendra farmer extension services and advisories.',
  },
  {
    id: 'rice_portal',
    name: 'Rice Knowledge Management Portal',
    shortName: 'RKMP',
    url: 'https://riceportal.in/',
    type: 'Government Portal',
    priority: 4,
    region: 'National',
    crops: ['rice'],
    description: 'ICAR rice knowledge portal — varieties, agronomy, pest management.',
  },
];
