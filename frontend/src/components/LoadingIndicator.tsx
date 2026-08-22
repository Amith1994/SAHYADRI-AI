import React from 'react';
import { Sprout } from 'lucide-react';

interface Props {
  language: 'en' | 'kn';
}

export const LoadingIndicator: React.FC<Props> = ({ language }) => {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#DDD4C4] max-w-xl animate-fade-in shadow-sm">
      <div className="w-8 h-8 rounded-full bg-[#F5F0E6] border border-[#DDD4C4] flex items-center justify-center text-[#636B2F] shrink-0">
        <Sprout className="w-4 h-4 animate-bounce text-[#636B2F]" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#0A0A0A]">
            {language === 'kn' ? 'ಸಹ್ಯಾದ್ರಿ ಎಐ ಹುಡುಕುತ್ತಿದೆ...' : 'Sahyadri AI is analyzing...'}
          </span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#636B2F] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#384959] animate-pulse delay-75" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#88BDF2] animate-pulse delay-150" />
          </div>
        </div>
        <p className="text-xs text-[#374151] font-semibold leading-relaxed">
          {language === 'kn'
            ? 'ಐಸಿಎಆರ್ ಮತ್ತು ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳ ಜ್ಞಾನ ಭಂಡಾರದಿಂದ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ...'
            : 'Retrieving verified agronomic package of practices from ICAR & State Agricultural Universities...'}
        </p>
      </div>
    </div>
  );
};
