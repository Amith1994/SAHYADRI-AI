import React from 'react';
import { BookMarked, Info } from 'lucide-react';
import type { Citation } from '../types';
import { SourceCard } from './SourceCard';

interface Props {
  citations: Citation[];
  language: 'en' | 'kn';
  onClose?: () => void;
}

const MANDATORY_DEFAULT_SOURCES: Citation[] = [
  {
    id: 1,
    title: 'KSNUAHS Shivamogga — Official Package of Practices (PoP 2026)',
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

export const SourceList: React.FC<Props> = ({
  citations,
  language,
  onClose,
}) => {
  // Merge mandatory institutions + query citations
  const mergedList: Citation[] = [...MANDATORY_DEFAULT_SOURCES];
  if (citations && citations.length > 0) {
    citations.forEach((c) => {
      if (!mergedList.some((m) => m.title.toLowerCase() === c.title.toLowerCase())) {
        mergedList.push({
          ...c,
          id: mergedList.length + 1,
        });
      }
    });
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F5EE] border-l border-[#DDD4C4] p-4">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DDD4C4]">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-[#384959]" />
          <h2 className="text-sm font-extrabold text-[#0A0A0A] tracking-wide uppercase">
            {language === 'kn' ? 'ಉಲ್ಲೇಖಿತ ಮೂಲಗಳು' : 'Retrieved Sources'} ({mergedList.length})
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-[#0A0A0A] hover:bg-[#F5F0E6] text-xs px-2 py-1 bg-[#FFFFFF] border border-[#DDD4C4] rounded cursor-pointer"
          >
            Close
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 p-2.5 mb-3 rounded-lg bg-[#FFFFFF] border border-[#DDD4C4] text-[11px] text-[#4B5563] shadow-xs font-medium">
        <Info className="w-4 h-4 text-[#636B2F] shrink-0" />
        <span>
          {language === 'kn'
            ? 'KSNUAHS ಶಿವಮೊಗ್ಗ, GKMS ಶಿವಮೊಗ್ಗ, AMFU ಹಿರಿಯೂರು ಹಾಗೂ ಐಸಿಎಆರ್ ಅಧಿಕೃತ ಮೂಲಗಳು.'
            : 'Grounded in KSNUAHS Shivamogga, GKMS Shivamogga, AMFU Hiriyur & ICAR Package of Practices.'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {mergedList.map((c) => (
          <SourceCard key={c.id} citation={c} language={language} />
        ))}
      </div>
    </div>
  );
};
