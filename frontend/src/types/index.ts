export interface Crop {
  id: string;
  name: string;
  kannada: string;
  emoji: string;
  aliases: string[];
}

export interface Citation {
  id: number;
  title: string;
  url: string;
  sourceId: string;
  relevance: number;
  type?: string;
  topic?: string;
  verified?: string;
}

export interface Source {
  id: string;
  name: string;
  shortName: string;
  url: string;
  type: string;
  priority: number;
  region: string;
  crops: string[];
  description: string;
}

export interface FarmContextData {
  district: string;
  block: string;
  region: string;
  season: string;
  variety: string;
  soil: string;
}

export interface WeatherRecord {
  date: string;
  district: string;
  block: string;
  state: string;
  rainfallMm: number;
  tempMaxC: number;
  tempMinC: number;
  rhMorningPct: number;
  rhAfternoonPct: number;
  windSpeedKmh: number;
  windDirection: string;
  cloudCoverOcta: number;
  skyCondition: string;
  warning?: string;
  issuedBy: string;
}

export interface IMDWeatherAdvisory {
  district: string;
  block: string;
  records: WeatherRecord[];
  weatherTableMarkdown: string;
  summary150to200Words: string;
  impactsAdvisories5Points: string[];
  smsAdvisory160Chars: string;
  generalImpacts3Points: string[];
  generalSms160Chars: string;
  fullMarkdown: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  crop?: string | null;
  intent?: string;
  citations?: Citation[];
  provider?: string;
  isDemo?: boolean;
  farmContext?: FarmContextData;
  weather?: IMDWeatherAdvisory;
}

export interface ChatResponse {
  answer: string;
  crop: string | null;
  intent: string;
  citations: Citation[];
  provider: string;
  isDemo: boolean;
  language: string;
  outOfScope: boolean;
  farmContext?: FarmContextData;
  weather?: IMDWeatherAdvisory;
}

