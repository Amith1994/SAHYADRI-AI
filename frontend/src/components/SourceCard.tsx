import React from 'react';
import { ExternalLink, ShieldCheck, BookOpen } from 'lucide-react';
import type { Citation } from '../types';

interface Props {
  citation: Citation;
  language?: 'en' | 'kn';
}

export const SourceCard: React.FC<Props> = ({ citation, language = 'en' }) => {
  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#FFFFFF] border border-[#DDD4C4] hover:border-[#636B2F] transition-all duration-200 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F5F0E6] text-[#0A0A0A] text-xs font-bold border border-[#DDD4C4]">
            [{citation.id}]
          </span>
          <span className="text-xs font-extrabold text-[#0A0A0A] line-clamp-1">
            {citation.title}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#1E3A5F] bg-[#EEF5FC] px-1.5 py-0.5 rounded border border-[#88BDF2] shrink-0 font-bold">
          <ShieldCheck className="w-3 h-3 text-[#384959]" />
          <span>
            {Math.round(citation.relevance * 100)}% {language === 'kn' ? 'ಹೊಂದಾಣಿಕೆ' : 'Match'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#DDD4C4] text-[11px] text-[#4B5563] font-medium">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-[#636B2F]" />
          {citation.type || (language === 'kn' ? 'ಅಧಿಕೃತ ಕೃಷಿ ಮೂಲ' : 'Authoritative Source')}
        </span>
        {citation.url && (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#1E3A5F] hover:text-[#0A0A0A] font-bold hover:underline"
          >
            <span>{language === 'kn' ? 'ಮೂಲ ತೆರೆಯಿರಿ' : 'Open Source'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};

