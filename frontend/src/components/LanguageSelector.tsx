import React from 'react';
import { Globe } from 'lucide-react';

interface Props {
  language: 'en' | 'kn';
  onChange: (lang: 'en' | 'kn') => void;
}

export const LanguageSelector: React.FC<Props> = ({ language, onChange }) => {
  return (
    <div className="flex items-center gap-1 bg-[#F5F0E6] border border-[#DDD4C4] rounded-full p-1 shadow-sm">
      <div className="flex items-center gap-1 text-xs text-[#4B5563] px-2 font-bold">
        <Globe className="w-3.5 h-3.5 text-[#384959]" />
        <span className="hidden sm:inline">Lang:</span>
      </div>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
          language === 'en'
            ? 'bg-[#FFFFFF] text-[#0A0A0A] shadow-sm border border-[#DDD4C4]'
            : 'text-[#4B5563] hover:text-[#0A0A0A] hover:bg-[#EBE4D5]'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange('kn')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
          language === 'kn'
            ? 'bg-[#FFFFFF] text-[#0A0A0A] shadow-sm border border-[#DDD4C4]'
            : 'text-[#4B5563] hover:text-[#0A0A0A] hover:bg-[#EBE4D5]'
        }`}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
};
