import React from 'react';
import type { Crop } from '../types';

interface Props {
  crops: Crop[];
  selectedCrop: string | null;
  onSelectCrop: (cropId: string | null) => void;
  language: 'en' | 'kn';
}

const CROP_BUTTON_THEMES: Record<string, {
  selected: string;
  idle: string;
  dot: string;
}> = {
  groundnut: {
    selected: 'bg-[#FFFFFF] border-2 border-[#636B2F] text-[#0A0A0A] shadow-md ring-2 ring-[#636B2F]/20',
    idle: 'bg-[#FFFFFF] border border-[#DDD4C4] hover:border-[#636B2F] hover:bg-[#F6F1E7] text-[#0A0A0A]',
    dot: 'bg-[#636B2F]',
  },
  rice: {
    selected: 'bg-[#FFFFFF] border-2 border-[#636B2F] text-[#0A0A0A] shadow-md ring-2 ring-[#636B2F]/20',
    idle: 'bg-[#FFFFFF] border border-[#DDD4C4] hover:border-[#636B2F] hover:bg-[#F6F1E7] text-[#0A0A0A]',
    dot: 'bg-[#636B2F]',
  },
  maize: {
    selected: 'bg-[#FFFFFF] border-2 border-[#384959] text-[#0A0A0A] shadow-md ring-2 ring-[#384959]/20',
    idle: 'bg-[#FFFFFF] border border-[#DDD4C4] hover:border-[#384959] hover:bg-[#F4F7FA] text-[#0A0A0A]',
    dot: 'bg-[#384959]',
  },
  arecanut: {
    selected: 'bg-[#FFFFFF] border-2 border-[#384959] text-[#0A0A0A] shadow-md ring-2 ring-[#384959]/20',
    idle: 'bg-[#FFFFFF] border border-[#DDD4C4] hover:border-[#384959] hover:bg-[#F4F7FA] text-[#0A0A0A]',
    dot: 'bg-[#384959]',
  },
};

export const CropSelector: React.FC<Props> = ({
  crops,
  selectedCrop,
  onSelectCrop,
  language,
}) => {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between px-1 mb-0.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#636B2F] animate-pulse" />
          {language === 'kn' ? 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ' : 'Select Crop'}
        </span>
        {selectedCrop && (
          <button
            type="button"
            onClick={() => onSelectCrop(null)}
            className="text-[10.5px] px-2 py-0.5 rounded-md bg-[#FFFFFF] hover:bg-[#F5F0E6] text-[#0A0A0A] border border-[#DDD4C4] font-bold transition-colors cursor-pointer shadow-sm"
          >
            {language === 'kn' ? 'ಎಲ್ಲಾ ಬೆಳೆ ↺' : 'All Crops ↺'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {crops.map((crop) => {
          const isSelected = selectedCrop === crop.id;
          const theme = CROP_BUTTON_THEMES[crop.id] || CROP_BUTTON_THEMES.groundnut;
          return (
            <button
              key={crop.id}
              type="button"
              onClick={() => onSelectCrop(isSelected ? null : crop.id)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left hover:translate-x-1 cursor-pointer shadow-sm ${
                isSelected ? theme.selected : theme.idle
              }`}
            >
              <span className="text-2xl filter drop-shadow-sm">{crop.emoji}</span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-extrabold tracking-tight truncate text-[#0A0A0A]">
                  {crop.name}
                </span>
                <span className="text-[11px] text-[#4B5563] font-semibold truncate">
                  {crop.kannada}
                </span>
              </div>
              {isSelected && (
                <span className="flex h-2.5 w-2.5 relative ml-auto">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.dot} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${theme.dot}`} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

