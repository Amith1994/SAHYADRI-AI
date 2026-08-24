import React, { useState, useEffect } from 'react';
import {
  User,
  Sparkles,
  BookOpen,
  CloudSun,
  MapPin,
  Beaker,
  Leaf,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  FileText,
  Languages,
  Volume2,
  Square,
} from 'lucide-react';
import ksnuahsLogo from '../assets/ksnuahs_logo.png';
import type { Message, Citation } from '../types';
import { translateText } from '../services/api';
import { speakText, stopSpeech } from '../services/speech';

interface Props {
  message: Message;
  onCitationClick?: (citation: Citation) => void;
  onViewWeather?: (district?: string, block?: string) => void;
  language: 'en' | 'kn';
}

type SectionType =
  | 'answer'
  | 'what_to_do'
  | 'chemical'
  | 'bio'
  | 'ipm'
  | 'weather'
  | 'important'
  | 'sources'
  | 'general';

interface ParsedSection {
  type: SectionType;
  heading: string;
  lines: string[];
}

const SECTION_CONFIGS: Record<
  SectionType,
  {
    container: string;
    headerBg: string;
    titleColor: string;
    icon: React.ReactNode;
    badgeText: { en: string; kn: string };
    badgeBg: string;
  }
> = {
  answer: {
    container: 'border-[#D8D0C0] bg-[#FFFFFF] shadow-sm',
    headerBg: 'bg-[#FAF6EF] border-b border-[#D8D0C0]',
    titleColor: 'text-[#000000]',
    icon: <span className="text-base">🌱</span>,
    badgeText: { en: 'DIAGNOSIS & DIRECT ANSWER', kn: 'ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ಉತ್ತರ' },
    badgeBg: 'bg-[#636B2F] text-[#FFFFFF] border-[#636B2F]',
  },
  what_to_do: {
    container: 'border-[#CAD6B8] bg-[#FAFDF7] shadow-sm',
    headerBg: 'bg-[#EFF5E8] border-b border-[#CAD6B8]',
    titleColor: 'text-[#000000]',
    icon: <CheckCircle2 className="w-4 h-4 text-[#636B2F]" />,
    badgeText: { en: 'WHAT TO DO & MANAGEMENT', kn: 'ಏನು ಮಾಡಬೇಕು & ನಿರ್ವಹಣೆ' },
    badgeBg: 'bg-[#4F5626] text-[#FFFFFF] border-[#4F5626]',
  },
  chemical: {
    container: 'border-[#BACEE5] bg-[#F7FAFD] shadow-sm',
    headerBg: 'bg-[#EAF1F8] border-b border-[#BACEE5]',
    titleColor: 'text-[#000000]',
    icon: <Beaker className="w-4 h-4 text-[#384959]" />,
    badgeText: { en: 'CHEMICAL CONTROL (PoP 2026)', kn: 'ರಾಸಾಯನಿಕ ನಿರ್ವಹಣೆ' },
    badgeBg: 'bg-[#384959] text-[#FFFFFF] border-[#384959]',
  },
  bio: {
    container: 'border-[#BFD6A7] bg-[#F6FBF2] shadow-sm',
    headerBg: 'bg-[#EAF4E2] border-b border-[#BFD6A7]',
    titleColor: 'text-[#000000]',
    icon: <Leaf className="w-4 h-4 text-[#636B2F]" />,
    badgeText: { en: 'BIOLOGICAL & ORGANIC CONTROL', kn: 'ಜೈವಿಕ ಮತ್ತು ಸಾವಯವ' },
    badgeBg: 'bg-[#636B2F] text-[#FFFFFF] border-[#636B2F]',
  },
  ipm: {
    container: 'border-[#DACBB0] bg-[#FCFAF6] shadow-sm',
    headerBg: 'bg-[#F4EFE5] border-b border-[#DACBB0]',
    titleColor: 'text-[#000000]',
    icon: <ShieldAlert className="w-4 h-4 text-[#384959]" />,
    badgeText: { en: 'IPM & CULTURAL PRACTICES', kn: 'ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ' },
    badgeBg: 'bg-[#384959] text-[#FFFFFF] border-[#384959]',
  },
  weather: {
    container: 'border-2 border-[#88BDF2] bg-[#FFFFFF] shadow-sm',
    headerBg: 'bg-[#EEF5FC] border-b border-[#88BDF2]',
    titleColor: 'text-[#000000]',
    icon: <CloudSun className="w-4 h-4 text-[#1E3A5F] animate-pulse" />,
    badgeText: { en: 'IMD AGROMET 5-DAY ADVISORY', kn: 'ಐಎಂಡಿ ಹವಾಮಾನ ಕೃಷಿ ಸಲಹೆ' },
    badgeBg: 'bg-[#1E3A5F] text-[#FFFFFF] border-[#1E3A5F]',
  },
  important: {
    container: 'border-2 border-[#EA580C] bg-[#FFFBF7] shadow-md',
    headerBg: 'bg-[#FFEDD5] border-b border-[#FDBA74]',
    titleColor: 'text-[#9A3412]',
    icon: <AlertTriangle className="w-4 h-4 text-[#C2410C]" />,
    badgeText: { en: 'IMPORTANT MESSAGE FOR FARMER', kn: 'ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ' },
    badgeBg: 'bg-[#C2410C] text-[#FFFFFF] border-[#C2410C]',
  },
  sources: {
    container: 'border-[#DDD4C4] bg-[#FAF7F2] shadow-sm',
    headerBg: 'bg-[#EFE8DC] border-b border-[#DDD4C4]',
    titleColor: 'text-[#000000]',
    icon: <BookOpen className="w-4 h-4 text-[#636B2F]" />,
    badgeText: { en: 'POP VERIFIED REPOSITORIES', kn: 'ಅಧಿಕೃತ ಮೂಲಗಳು' },
    badgeBg: 'bg-[#4B5563] text-[#FFFFFF] border-[#4B5563]',
  },
  general: {
    container: 'border-[#D8D0C0] bg-[#FFFFFF] shadow-sm',
    headerBg: 'bg-[#F8F5EE] border-b border-[#D8D0C0]',
    titleColor: 'text-[#000000]',
    icon: <Sparkles className="w-4 h-4 text-[#636B2F]" />,
    badgeText: { en: 'AGRICULTURAL ADVISORY', kn: 'ಕೃಷಿ ಸಲಹೆ' },
    badgeBg: 'bg-[#636B2F] text-[#FFFFFF] border-[#636B2F]',
  },
};

const SECTION_TITLES: Record<SectionType, { en: string; kn: string }> = {
  answer: { en: 'Diagnosis & Direct Answer', kn: 'ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ನೇರ ಉತ್ತರ' },
  what_to_do: { en: 'What to do & Recommended Field Operations', kn: 'ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕ್ರಮಗಳು)' },
  chemical: { en: 'Chemical Control (PoP 2026)', kn: 'ರಾಸಾಯನಿಕ ನಿರ್ವಹಣೆ (ಕೃಷಿ ಕೈಪಿಡಿ ೨೦೨೬)' },
  bio: { en: 'Biological & Organic Control', kn: 'ಜೈವಿಕ ಮತ್ತು ಸಾವಯವ ನಿರ್ವಹಣೆ' },
  ipm: { en: 'Integrated Pest Management (IPM)', kn: 'ಸಮಗ್ರ ಕೀಟ ಹಾಗೂ ರೋಗ ನಿರ್ವಹಣೆ (IPM)' },
  weather: { en: 'IMD Agromet 5-Day Weather-Based Advisory', kn: 'ಐಎಂಡಿ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ' },
  important: { en: 'Important Message for Farmer', kn: 'ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ' },
  sources: { en: 'Verified University Sources', kn: 'ಅಧಿಕೃತ ವಿಶ್ವವಿದ್ಯಾಲಯ ಮೂಲಗಳು' },
  general: { en: 'Agricultural Advisory', kn: 'ಕೃಷಿ ಸಲಹಾ ಮಾಹಿತಿ' },
};

function parseSections(text: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = text.split('\n');
  let currentSection: ParsedSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const headerMatch = rawLine.match(/^#{1,4}\s+(.+)$/);

    if (headerMatch) {
      if (currentSection && currentSection.lines.some((l) => l.trim().length > 0)) {
        sections.push(currentSection);
      }

      const h = headerMatch[1].trim();
      const lowerH = h.toLowerCase();
      let type: SectionType = 'general';

      if (lowerH.includes('answer') || lowerH.includes('ಉತ್ತರ') || lowerH.includes('diagnosis')) {
        type = 'answer';
      } else if (
        lowerH.includes('what to do') ||
        lowerH.includes('management') ||
        lowerH.includes('operation') ||
        lowerH.includes('ಏನು ಮಾಡಬೇಕು') ||
        lowerH.includes('ನಿರ್ವಹಣಾ')
      ) {
        type = 'what_to_do';
      } else if (lowerH.includes('chemical') || lowerH.includes('ರಾಸಾಯನಿಕ')) {
        type = 'chemical';
      } else if (lowerH.includes('biological') || lowerH.includes('organic') || lowerH.includes('ಜೈವಿಕ') || lowerH.includes('ಸಾವಯವ')) {
        type = 'bio';
      } else if (lowerH.includes('ipm') || lowerH.includes('integrated') || lowerH.includes('ಸಮಗ್ರ')) {
        type = 'ipm';
      } else if (lowerH.includes('weather') || lowerH.includes('ಹವಾಮಾನ')) {
        type = 'weather';
      } else if (
        lowerH.includes('important') ||
        lowerH.includes('warning') ||
        lowerH.includes('alert') ||
        lowerH.includes('ಮುಖ್ಯ') ||
        lowerH.includes('ಪ್ರಮುಖ') ||
        lowerH.includes('ಸಂದೇಶ')
      ) {
        type = 'important';
      } else if (lowerH.includes('source') || lowerH.includes('ಮೂಲ')) {
        type = 'sources';
      }

      currentSection = {
        type,
        heading: h,
        lines: [],
      };
    } else {
      if (!currentSection) {
        currentSection = {
          type: 'answer',
          heading: '',
          lines: [],
        };
      }
      currentSection.lines.push(rawLine);
    }
  }

  if (currentSection && currentSection.lines.some((l) => l.trim().length > 0)) {
    sections.push(currentSection);
  }

  return sections;
}

export const ChatMessage: React.FC<Props> = ({
  message,
  onCitationClick,
  onViewWeather,
  language,
}) => {
  const isBot = message.sender === 'bot';
  const [isSourcesExpanded, setIsSourcesExpanded] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [displayText, setDisplayText] = useState<string>(message.text);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const textToSpeak = isBot ? displayText : message.text;
      const started = speakText(textToSpeak, language, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
      if (!started) setIsSpeaking(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const kannadaChars = (message.text.match(/[\u0C80-\u0CFF]/g) || []).length;
    if (language === 'kn' && kannadaChars < 40 && message.sender === 'bot') {
      setIsTranslating(true);
      translateText(message.text, 'kn')
        .then((translated) => {
          if (isMounted && translated) {
            setDisplayText(translated);
          }
        })
        .finally(() => {
          if (isMounted) setIsTranslating(false);
        });
    } else if (language === 'en') {
      setDisplayText(message.text);
    }
    return () => {
      isMounted = false;
    };
  }, [language, message.text, message.sender]);

  // Helper to format values/numbers with distinct highlight styling
  const highlightValues = (text: string, keyPrefix: string, isAlert: boolean = false) => {
    const valueRegex =
      /(@\s*[\d.]+\s*(?:g|ml|mL|kg|L)\/(?:L|kg|ha|acre)(?:\s*water)?|\b\d+(?:\.\d+)?\s*(?:g|ml|mL|kg|L|ha|acre|quintals?|tonnes?|cm|mm|%|°C|days?|hours?|weeks?|DAT|DAS)\b|\b\d+:\d+(?:–\d+:\d+)?\s*(?:AM|PM)\b|\b\d+(?:–\d+)?\s*(?:WP|EC|SC|SP|SL|SG|WDG|FS|DP|GR|g\/L|mL\/L|kg\/ha|g\/ha)\b)/gi;

    const tokens = text.split(valueRegex);

    return tokens.map((token, tIdx) => {
      if (!token) return null;
      if (token.match(valueRegex)) {
        return (
          <span
            key={`${keyPrefix}-val-${tIdx}`}
            className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded font-extrabold text-[12px] sm:text-[12.5px] align-baseline transition-colors ${
              isAlert
                ? 'bg-[#FEF3C7] text-[#9A3412] border border-[#FDE68A]'
                : 'bg-[#EBF5FB] text-[#1E3A5F] border border-[#BDDDFC]'
            }`}
          >
            {token}
          </span>
        );
      }
      return token;
    });
  };

  // Helper to render inline formatting with bracket citations [1] stripped
  const renderInline = (inlineText: string, keyPrefix: string, isAlert: boolean = false) => {
    const cleanedText = inlineText
      .replace(/\[\d+(?:[\s,–-]+\d+)*\]/g, '')
      .replace(/\s+([.,;:])/g, '$1')
      .trim();

    if (!cleanedText) return null;

    const boldParts = cleanedText.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
      <span key={`${keyPrefix}-txt`}>
        {boldParts.map((sub, sIdx) => {
          if (sub.startsWith('**') && sub.endsWith('**')) {
            const innerBold = sub.slice(2, -2);
            return (
              <strong
                key={`${keyPrefix}-b-${sIdx}`}
                className="font-extrabold text-[#000000] tracking-tight"
              >
                {highlightValues(innerBold, `${keyPrefix}-b-${sIdx}`, isAlert)}
              </strong>
            );
          }
          if (sub.startsWith('*') && sub.endsWith('*')) {
            return (
              <em key={`${keyPrefix}-i-${sIdx}`} className="italic text-[#111827]">
                {highlightValues(sub.slice(1, -1), `${keyPrefix}-i-${sIdx}`, isAlert)}
              </em>
            );
          }
          return (
            <React.Fragment key={`${keyPrefix}-p-${sIdx}`}>
              {highlightValues(sub, `${keyPrefix}-p-${sIdx}`, isAlert)}
            </React.Fragment>
          );
        })}
      </span>
    );
  };

  // Render Content Lines
  const renderContentLines = (lines: string[], secKey: string, isAlert: boolean = false) => {
    const renderedElements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = (pIdx: number) => {
      if (currentParagraph.length === 0) return;
      const combined = currentParagraph.join(' ').trim();
      currentParagraph = [];
      if (!combined) return;

      renderedElements.push(
        <p
          key={`${secKey}-p-${pIdx}`}
          className={`text-xs sm:text-[13.5px] leading-report font-report text-[#000000] text-justify-report ${
            isAlert ? 'text-[#9A3412] font-extrabold' : 'font-normal'
          }`}
        >
          {renderInline(combined, `${secKey}-p-${pIdx}`, isAlert)}
        </p>
      );
    };

    lines.forEach((line, lIdx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph(lIdx);
        return;
      }

      // 1. Numbered List Item
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        flushParagraph(lIdx);
        const itemNum = numMatch[1];
        const itemBody = numMatch[2];

        renderedElements.push(
          <div
            key={`${secKey}-num-${lIdx}`}
            className="flex items-start gap-2.5 my-2.5 p-2 sm:p-2.5 rounded-xl bg-[#FFFFFF] border border-[#DDD4C4] shadow-xs"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1E3A5F] text-[#FFFFFF] text-[11px] font-mono font-extrabold shrink-0 mt-0.5">
              {itemNum}
            </span>
            <div className="text-xs sm:text-[13.5px] leading-report font-report text-[#000000] flex-1 text-justify-report">
              {renderInline(itemBody, `${secKey}-num-${lIdx}`, isAlert)}
            </div>
          </div>
        );
        return;
      }

      // 2. Bullet Point Item
      const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
      if (bulletMatch) {
        flushParagraph(lIdx);
        const itemBody = bulletMatch[1];

        renderedElements.push(
          <div
            key={`${secKey}-bullet-${lIdx}`}
            className="flex items-start gap-2.5 my-1.5 p-2 rounded-lg bg-[#FAF8F5] border border-[#EBE3D5]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#636B2F] shrink-0 mt-2" />
            <div className="text-xs sm:text-[13.5px] leading-report font-report text-[#000000] flex-1 text-justify-report">
              {renderInline(itemBody, `${secKey}-b-${lIdx}`, isAlert)}
            </div>
          </div>
        );
        return;
      }

      currentParagraph.push(trimmed);
    });

    flushParagraph(lines.length);
    return renderedElements;
  };

  // Render User Message
  if (!isBot) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#DDD4C4] text-[#000000] ml-auto max-w-2xl shadow-sm font-report">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F0E6] text-[#000000] border border-[#DDD4C4] shrink-0 shadow-sm">
          <User className="w-4 h-4" />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#000000] uppercase tracking-wider">
              {language === 'kn' ? 'ರೈತರು / ಬಳಕೆದಾರರು' : 'Farmer / User'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSpeak}
                className={`px-2 py-0.5 rounded-md text-[10.5px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] animate-pulse'
                    : 'bg-[#F5F0E6] hover:bg-[#EBE4D5] text-[#000000] border border-[#DDD4C4]'
                }`}
                title={isSpeaking ? 'Stop speaking' : (language === 'kn' ? 'ಪ್ರಶ್ನೆಯನ್ನು ಆಲಿಸಿ' : 'Listen to question')}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3 h-3 text-[#991B1B] fill-current" />
                    <span>{language === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : 'Stop'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#636B2F]" />
                    <span>{language === 'kn' ? 'ಆಲಿಸಿ 🔊' : 'Listen 🔊'}</span>
                  </>
                )}
              </button>
              <span className="text-[10px] text-[#4B5563] font-medium">{message.timestamp}</span>
            </div>
          </div>
          <p className="text-xs sm:text-[13.5px] leading-report text-[#000000] font-bold whitespace-pre-wrap text-justify-report">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  // Parse bot message into distinct sections
  const parsedSections = parseSections(displayText);

  return (
    <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#FDFBF7] border border-[#DDD4C4] text-[#000000] shadow-sm font-report">
      {/* Bot Avatar with University Emblem */}
      <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFFFF] border-2 border-[#636B2F] shadow-sm p-0.5 shrink-0">
        <img
          src={ksnuahsLogo}
          alt="KSNUAHS Logo"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-col gap-3 min-w-0 flex-1">
        {/* Bot Header Metadata Report Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#DDD4C4]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-[14px] font-black text-[#000000] flex items-center gap-1.5">
              <span>{language === 'kn' ? 'ಸಹ್ಯಾದ್ರಿ ಕೃಷಿ ಎಐ' : 'Sahyadri Agricultural AI'}</span>
              <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[#1E3A5F] text-[#FFFFFF] font-mono font-extrabold uppercase">
                KSNUAHS PoP 2026
              </span>
            </span>

            {/* Read Aloud Trigger in Bot Header */}
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isSpeaking
                  ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] animate-pulse'
                  : 'bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]'
              }`}
              title={isSpeaking ? 'Stop speaking' : (language === 'kn' ? 'ಉತ್ತರವನ್ನು ಧ್ವನಿ ಮೂಲಕ ಆಲಿಸಿ' : 'Read answer aloud')}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-3 h-3 text-[#991B1B] fill-current" />
                  <span>{language === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ ⏹️' : 'Stop Audio ⏹️'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#166534]" />
                  <span>{language === 'kn' ? 'ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ 🔊' : 'Read Aloud 🔊'}</span>
                </>
              )}
            </button>

            {isTranslating && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1 font-bold animate-pulse">
                <Languages className="w-3 h-3" />
                <span>ಕನ್ನಡಕ್ಕೆ ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...</span>
              </span>
            )}

            {message.farmContext && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F5F0E6] text-[#000000] border border-[#DDD4C4] flex items-center gap-1.5 font-bold">
                <span>🌱 {message.crop || 'Crop'}</span>
                {message.farmContext.variety && (
                  <>
                    <span className="text-[#6B7280]">•</span>
                    <strong className="text-[#000000]">{message.farmContext.variety}</strong>
                  </>
                )}
                {message.farmContext.district && (
                  <>
                    <span className="text-[#6B7280]">•</span>
                    <span className="flex items-center gap-0.5 text-[#1E3A5F]">
                      <MapPin className="w-2.5 h-2.5 text-[#384959]" />
                      {message.farmContext.district}
                    </span>
                  </>
                )}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#4B5563] font-mono font-semibold">{message.timestamp}</span>
        </div>

        {/* ─── SECTIONWISE COLOR CARDS CONTAINER ─────────────────────────── */}
        <div className="space-y-3.5">
          {parsedSections.map((sec, sIdx) => {
            // Handle Sources Section Separately (COLLAPSED BY DEFAULT)
            if (sec.type === 'sources') {
              return (
                <div
                  key={`section-${sIdx}`}
                  className="rounded-2xl border border-[#DDD4C4] bg-[#FAF7F2] overflow-hidden shadow-sm transition-all"
                >
                  {/* Collapsible Sources Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 bg-[#EFE8DC] hover:bg-[#E5DDCF] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="w-4 h-4 text-[#636B2F] shrink-0" />
                      <span className="text-xs sm:text-[13.5px] font-black text-[#000000] truncate">
                        {language === 'kn'
                          ? '📚 ಅಧಿಕೃತ ಕೃಷಿ ಮೂಲಗಳು ಮತ್ತು ಉಲ್ಲೇಖಗಳು (ಕ್ಲಿಕ್ ಮಾಡಿ ವೀಕ್ಷಿಸಿ)'
                          : '📚 Verified University Sources & References (Click to View Sources)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9.5px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-[#4B5563] text-[#FFFFFF] uppercase">
                        {isSourcesExpanded
                          ? language === 'kn'
                            ? 'ಮರೆಮಾಡಿ ▲'
                            : 'HIDE ▲'
                          : language === 'kn'
                          ? 'ತೋರಿಸಿ ▼'
                          : 'SHOW ▼'}
                      </span>
                      {isSourcesExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#000000]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#000000]" />
                      )}
                    </div>
                  </button>

                  {/* Collapsed/Expanded Content with Clickable University Portal Links */}
                  {isSourcesExpanded && (
                    <div className="p-3.5 space-y-2.5 border-t border-[#DDD4C4] bg-[#FFFFFF] animate-fade-in">
                      <div className="text-[11px] text-[#4B5563] font-medium flex items-center gap-1.5 pb-1">
                        <FileText className="w-3.5 h-3.5 text-[#636B2F]" />
                        <span>
                          {language === 'kn'
                            ? 'ಈ ಕೆಳಗಿನ ಅಧಿಕೃತ ವಿಶ್ವವಿದ್ಯಾಲಯ ಹಾಗೂ ಐಸಿಎಆರ್ ಕೃಷಿ ಶಿಫಾರಸು ಪೋರ್ಟಲ್‌ಗಳಿಗೆ ಭೇಟಿ ನೀಡಿ:'
                            : 'Click any university or ICAR portal below to inspect verified Package of Practices:'}
                        </span>
                      </div>
                      {(() => {
                        const sourceItems: { num: string; title: string; url: string }[] = [];
                        let curNum = '';
                        let curTitle = '';

                        sec.lines.forEach((l) => {
                          const t = l.trim();
                          if (!t) return;
                          const m = t.match(/^\[(\d+)\]\s*(.+)$/);
                          if (m) {
                            if (curTitle) {
                              sourceItems.push({
                                num: curNum || '1',
                                title: curTitle,
                                url: 'https://uahs.edu.in/',
                              });
                            }
                            curNum = m[1];
                            curTitle = m[2];
                          } else if (t.startsWith('http://') || t.startsWith('https://')) {
                            sourceItems.push({
                              num: curNum || '1',
                              title: curTitle || t,
                              url: t,
                            });
                            curNum = '';
                            curTitle = '';
                          } else if (t) {
                            if (curTitle) {
                              sourceItems.push({
                                num: curNum || '1',
                                title: curTitle,
                                url: 'https://uahs.edu.in/',
                              });
                            }
                            curTitle = t;
                          }
                        });

                        if (curTitle) {
                          sourceItems.push({
                            num: curNum || '1',
                            title: curTitle,
                            url: 'https://uahs.edu.in/',
                          });
                        }

                        return sourceItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-[#F8F5EE] border border-[#DDD4C4] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-[#88BDF2] transition-colors"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1E3A5F] text-[#FFFFFF] text-[10px] font-mono font-black shrink-0 mt-0.5">
                                {item.num}
                              </span>
                              <div className="flex flex-col min-w-0">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs sm:text-[13px] font-bold text-[#1E3A5F] hover:underline flex items-center gap-1.5 truncate"
                                  title="Open official university portal"
                                >
                                  <span>{item.title}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0 text-[#384959]" />
                                </a>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10.5px] text-[#4B5563] font-mono hover:text-[#1E3A5F] truncate underline mt-0.5"
                                >
                                  {item.url}
                                </a>
                              </div>
                            </div>

                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1E3A5F] hover:bg-[#132742] text-[#FFFFFF] rounded-lg text-[11px] font-extrabold shadow-xs transition-all shrink-0 cursor-pointer"
                            >
                              <span>{language === 'kn' ? 'ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ' : 'Open Link'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              );
            }

            const config = SECTION_CONFIGS[sec.type] || SECTION_CONFIGS.general;
            const isAlert = sec.type === 'important';

            // Ensure 100% language-consistent header text
            const displayTitle = language === 'kn' ? SECTION_TITLES[sec.type]?.kn : SECTION_TITLES[sec.type]?.en;

            return (
              <div
                key={`section-${sIdx}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${config.container}`}
              >
                {/* Section Header Bar */}
                <div className={`px-3.5 py-2 flex items-center justify-between gap-2 ${config.headerBg}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{config.icon}</span>
                    <span
                      className={`text-xs sm:text-[13.5px] font-black tracking-tight truncate ${config.titleColor}`}
                    >
                      {displayTitle}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full border uppercase shrink-0 ${config.badgeBg}`}
                  >
                    {isAlert
                      ? language === 'kn'
                        ? 'ಮುಖ್ಯ ಸೂಚನೆ'
                        : 'IMPORTANT'
                      : language === 'kn'
                      ? config.badgeText.kn
                      : config.badgeText.en}
                  </span>
                </div>

                {/* Section Body Lines with Sharp Deep Black Text & Full Justification */}
                <div className="p-3.5 sm:p-4 space-y-1">
                  {renderContentLines(sec.lines, `sec-${sIdx}`, isAlert)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Row for Bot: Speak + Weather button + Sources */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#DDD4C4]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`text-[10.5px] px-3 py-1.5 rounded-full font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isSpeaking
                  ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] animate-pulse'
                  : 'bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-3.5 h-3.5 text-[#991B1B] fill-current" />
                  <span>{language === 'kn' ? 'ನಿಲ್ಲಿಸಿ (Stop Audio)' : 'Stop Audio'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#166534]" />
                  <span>{language === 'kn' ? '🔊 ಉತ್ತರವನ್ನು ಆಲಿಸಿ' : '🔊 Listen to Answer'}</span>
                </>
              )}
            </button>

            {message.citations && message.citations.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                  className="text-[11px] font-black text-[#1E3A5F] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#636B2F]" />
                  <span>
                    {language === 'kn'
                      ? `ಉಲ್ಲೇಖಗಳು (${message.citations.length}):`
                      : `Sources (${message.citations.length}):`}
                  </span>
                </button>
                {message.citations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      if (c.url) {
                        window.open(c.url, '_blank', 'noopener,noreferrer');
                      } else if (onCitationClick) {
                        onCitationClick(c);
                      }
                    }}
                    className="text-[10px] bg-[#FFFFFF] hover:bg-[#EEF5FC] text-[#1E3A5F] hover:text-[#0F172A] font-extrabold px-2.5 py-0.5 rounded-full border border-[#88BDF2] transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                    title={`Open ${c.title}`}
                  >
                    <span>[{c.id}] {c.title.split('—')[0].trim()}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-[#384959]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {onViewWeather && (
            <button
              type="button"
              onClick={() => onViewWeather(message.farmContext?.district, message.farmContext?.block)}
              className="text-[10.5px] font-extrabold px-3 py-1.5 rounded-full bg-[#EEF5FC] hover:bg-[#D9E9FA] text-[#1E3A5F] border border-[#88BDF2] flex items-center gap-1.5 transition-all shadow-xs ml-auto cursor-pointer"
              title="Open 5-day IMD Agromet weather forecast"
            >
              <CloudSun className="w-3.5 h-3.5 text-[#384959]" />
              <span>
                {language === 'kn' ? 'ಹವಾಮಾನ ಕೋಷ್ಟಕ' : '🌦️ IMD Weather'}
              </span>
            </button>
          )}
        </div>

        {message.isDemo && (
          <div className="flex items-center gap-1 text-[10px] text-[#4B5563] bg-[#F5F0E6] px-2 py-1 rounded-lg border border-[#DDD4C4] mt-0.5">
            <Sparkles className="w-3 h-3 text-[#636B2F] shrink-0" />
            <span>Local Agricultural Knowledge Engine (Demo Mode)</span>
          </div>
        )}
      </div>
    </div>
  );
};
