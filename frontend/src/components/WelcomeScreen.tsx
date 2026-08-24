import React from 'react';
import { HelpCircle, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import ksnuahsLogo from '../assets/ksnuahs_logo.png';
import type { Crop } from '../types';

interface Props {
  crops: Crop[];
  selectedCrop: string | null;
  onSelectCrop: (cropId: string) => void;
  onSelectPrompt: (prompt: string) => void;
  language: 'en' | 'kn';
}

const CROP_STYLES: Record<string, {
  bg: string;
  border: string;
  activeBg: string;
  glow: string;
  badge: string;
  gradient: string;
}> = {
  groundnut: {
    bg: 'bg-[#FFFFFF] hover:bg-[#F6F1E7]',
    border: 'border-[#DDD4C4] hover:border-[#636B2F]',
    activeBg: 'bg-[#F6F1E7] border-2 border-[#636B2F] ring-2 ring-[#636B2F]/20 shadow-sm',
    glow: 'shadow-sm',
    badge: 'bg-[#636B2F] text-[#FFFFFF] border-[#636B2F]',
    gradient: 'from-[#636B2F]/10 via-transparent to-transparent',
  },
  rice: {
    bg: 'bg-[#FFFFFF] hover:bg-[#EFF5E8]',
    border: 'border-[#DDD4C4] hover:border-[#636B2F]',
    activeBg: 'bg-[#EFF5E8] border-2 border-[#636B2F] ring-2 ring-[#636B2F]/20 shadow-sm',
    glow: 'shadow-sm',
    badge: 'bg-[#636B2F] text-[#FFFFFF] border-[#636B2F]',
    gradient: 'from-[#636B2F]/10 via-transparent to-transparent',
  },
  maize: {
    bg: 'bg-[#FFFFFF] hover:bg-[#EEF5FC]',
    border: 'border-[#DDD4C4] hover:border-[#384959]',
    activeBg: 'bg-[#EEF5FC] border-2 border-[#384959] ring-2 ring-[#384959]/20 shadow-sm',
    glow: 'shadow-sm',
    badge: 'bg-[#384959] text-[#FFFFFF] border-[#384959]',
    gradient: 'from-[#88BDF2]/10 via-transparent to-transparent',
  },
  arecanut: {
    bg: 'bg-[#FFFFFF] hover:bg-[#F0F3F6]',
    border: 'border-[#DDD4C4] hover:border-[#384959]',
    activeBg: 'bg-[#F0F3F6] border-2 border-[#384959] ring-2 ring-[#384959]/20 shadow-sm',
    glow: 'shadow-sm',
    badge: 'bg-[#384959] text-[#FFFFFF] border-[#384959]',
    gradient: 'from-[#6A89A7]/10 via-transparent to-transparent',
  },
};

export const WelcomeScreen: React.FC<Props> = ({
  crops,
  selectedCrop,
  onSelectCrop,
  onSelectPrompt,
  language,
}) => {
  const sampleQuestions: Record<string, string[]> = {
    groundnut:
      language === 'kn'
        ? [
            '🥜 ಶೇಂಗಾ ಬಿತ್ತನೆಗೆ ಶಿಫಾರಸು ಮಾಡಿದ ಬೀಜದ ಪ್ರಮಾಣ ಮತ್ತು ಬೀಜೋಪಚಾರ ವಿಧಾನ?',
            '🧪 ಕಡಲೆಕಾಯಿಗೆ ರಸಗೊಬ್ಬರ ಮತ್ತು ಜಿಪ್ಸಮ್ ಬಳಕೆ ವೇಳಾಪಟ್ಟಿ ತಿಳಿಸಿ?',
            '🍄 ಶೇಂಗಾದಲ್ಲಿ ಟಿಕ್ಕಾ ಎಲೆಚುಕ್ಕೆ ರೋಗದ ಲಕ್ಷಣ ಹಾಗೂ ನಿಯಂತ್ರಣ ಕ್ರಮಗಳು?',
            '💧 ಕಡಲೆಕಾಯಿ ಬೆಳೆಯ ಪ್ರಮುಖ ನೀರಾವರಿ ಹಂತಗಳು ಯಾವುವು?',
          ]
        : [
            '🥜 What is the recommended seed rate and seed treatment for groundnut?',
            '🧪 What is the fertilizer and gypsum schedule for groundnut?',
            '🍄 How do I diagnose and control Tikka leaf spot in groundnut?',
            '💧 What are the critical irrigation stages for groundnut pods?',
          ],
    rice:
      language === 'kn'
        ? [
            '🌾 ಭತ್ತದ ನಾಟಿಗೆ ನರ್ಸರಿ ತಯಾರಿಕೆ ಮತ್ತು ಬೀಜದ ಪ್ರಮಾಣ?',
            '🔥 ಭತ್ತದಲ್ಲಿ ಬ್ಲಾಸ್ಟ್ (ಬೆಂಕಿ ರೋಗ) ತಡೆಗಟ್ಟುವ ಕ್ರಮಗಳು?',
            '🌱 ಜ್ಯೋತಿ ಭತ್ತದ ತಳಿಗೆ ಶಿಫಾರಸು ಮಾಡಿದ ರಸಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿ?',
            '💧 ಕಡಿಮೆ ನೀರಿನಲ್ಲಿ ಭತ್ತ ಬೆಳೆಯಲು AWD (ಆಲ್ಟರ್ನೇಟ್ ವೆಟ್ಟಿಂಗ್) ವಿಧಾನ?',
          ]
        : [
            '🌾 What is the nursery preparation and seed rate for paddy?',
            '🔥 How can I manage and prevent blast disease in rice?',
            '🌱 What fertilizer schedule is recommended for Jyothi paddy variety?',
            '💧 How does Alternate Wetting and Drying (AWD) save irrigation water?',
          ],
    maize:
      language === 'kn'
        ? [
            '🌽 ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಿದ ಸಾಲಿನ ಅಂತರ ಮತ್ತು ಬಿತ್ತನೆ ಕ್ರಮ?',
            '🐛 ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಲದ್ದಿ ಹುಳು (Fall Armyworm) ಸಮಗ್ರ ನಿಯಂತ್ರಣ?',
            '🧪 ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಯೂರಿಯಾ ಗೊಬ್ಬರ ಯಾವಾಗ ಮತ್ತು ಎಷ್ಟು ಪ್ರಮಾಣದಲ್ಲಿ ಹಾಕಬೇಕು?',
            '💧 ಮೆಕ್ಕೆಜೋಳದ ಪ್ರಮುಖ ನೀರಾವರಿ ಹಂತಗಳು ಯಾವುವು?',
          ]
        : [
            '🌽 What is the recommended spacing and seed rate for maize in Karnataka?',
            '🐛 How do I identify and manage Fall Armyworm (FAW) in maize?',
            '🧪 What is the 3-stage split application of Urea in hybrid maize?',
            '💧 What are the critical water management stages in maize?',
          ],
    arecanut:
      language === 'kn'
        ? [
            '🌴 ಅಡಿಕೆ ನಾಟಿಗೆ ಗುಂಡಿ ತೆಗೆಯುವ ಅಳತೆ ಮತ್ತು ಸಾಲಿನ ಅಂತರ ಎಷ್ಟು?',
            '🍄 ಅಡಿಕೆಯಲ್ಲಿ ಕೊಳೆರೋಗ (ಮಹಾಲಿ) ರೋಗಕ್ಕೆ ಬೋರ್ಡೋ ದ್ರಾವಣ ತಯಾರಿಕೆ?',
            '🧪 ಫಸಲು ಬಿಡುವ ಅಡಿಕೆ ಮರಗಳಿಗೆ ವಾರ್ಷಿಕ ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ ಎಷ್ಟು?',
            '💧 ಬೇಸಿಗೆಯಲ್ಲಿ ಅಡಿಕೆ ತೋಟಕ್ಕೆ ಹನಿ ನೀರಾವರಿ ನಿರ್ವಹಣೆ ಹೇಗೆ?',
          ]
        : [
            '🌴 What is the spacing and pit dimension for planting Mangala arecanut?',
            '🍄 How do I prepare and apply 1% Bordeaux mixture for Koleroga?',
            '🧪 What is the annual fertilizer dosage for bearing arecanut palm?',
            '💧 What is the summer drip irrigation schedule for arecanut garden?',
          ],
  };

  const activeCrop = selectedCrop || 'groundnut';
  const questions = sampleQuestions[activeCrop] || sampleQuestions.groundnut;

  return (
    <div className="flex flex-col items-center justify-center max-w-3xl mx-auto my-auto p-4 sm:p-6 text-center animate-slide-up">
      {/* University Logo Hero Banner */}
      <div className="relative mb-4 group cursor-pointer">
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FFFFFF] border-3 border-[#636B2F] shadow-lg p-2 animate-float">
          <img
            src={ksnuahsLogo}
            alt="KSNUAHS University Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* University Title & Motto Badge */}
      <div className="inline-flex flex-col sm:flex-row items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFFFFF] border border-[#DDD4C4] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider mb-2 shadow-sm">
        <span className="flex items-center gap-1 text-[#636B2F]">
          <Sparkles className="w-3.5 h-3.5 text-[#636B2F]" />
          {language === 'kn' ? 'ನೇಗಿಲ ಮೇಲೆಯೇ ನಿಂತಿದೆ ಧರ್ಮ' : 'Negila Meleye Nintide Dharma'}
        </span>
        <span className="hidden sm:inline text-[#C4BAA7]">•</span>
        <span className="text-[#374151]">
          {language === 'kn'
            ? 'ಕೆಳದಿ ಶಿವಪ್ಪ ನಾಯಕ ಕೃಷಿ ಮತ್ತು ತೋಟಗಾರಿಕೆ ವಿಜ್ಞಾನಗಳ ವಿಶ್ವವಿದ್ಯಾಲಯ, ಶಿವಮೊಗ್ಗ'
            : 'KSNUAHS Shivamogga (Est. 2012)'}
        </span>
      </div>

      <h1 className="text-2xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight mb-2 font-brand">
        {language === 'kn' ? 'ಸಹ್ಯಾದ್ರಿ ಕೃಷಿ ಎಐ ಸಹಾಯಕ' : 'Sahyadri Agricultural AI'}
      </h1>

      <p className="text-xs sm:text-sm text-[#374151] max-w-xl mb-6 leading-relaxed font-semibold">
        {language === 'kn'
          ? 'ಕರ್ನಾಟಕದ ರೈತರಿಗಾಗಿ ಕೃಷಿ ಕೈಪಿಡಿ (PoP 2026) ಮತ್ತು ಐಎಂಡಿ ಹವಾಮಾನ ಆಧಾರಿತ ಅಧಿಕೃತ ಕೀಟ, ರೋಗ ಹಾಗೂ ಪೋಷಕಾಂಶ ಸಲಹಾ ವ್ಯವಸ್ಥೆ.'
          : 'Official Package of Practices (PoP 2026) & IMD Agromet Advisory for Groundnut, Paddy/Rice, Maize, and Arecanut farmers.'}
      </p>

      {/* 4 Crop Selection Cards */}
      <div className="w-full mb-6">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#0A0A0A] mb-2.5 px-1">
          <span>{language === 'kn' ? '🌾 ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:' : '🌾 Select Your Crop:'}</span>
          <span className="text-[10px] text-[#4B5563]">4 Major Crops</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {crops.map((crop) => {
            const isSelected = selectedCrop === crop.id;
            const style = CROP_STYLES[crop.id] || CROP_STYLES.groundnut;
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => onSelectCrop(crop.id)}
                className={`relative overflow-hidden flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all duration-300 hover:scale-105 shadow-sm cursor-pointer ${
                  isSelected ? style.activeBg : `${style.bg} ${style.border}`
                }`}
              >
                <div className="text-3xl filter drop-shadow-sm">
                  {crop.emoji}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-extrabold text-[#0A0A0A]">
                    {crop.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#4B5563] mt-0.5">
                    {crop.kannada}
                  </span>
                </div>
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#636B2F] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#636B2F]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Questions Grid with Clean Cards */}
      <div className="w-full text-left">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#0A0A0A] mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#384959]" />
            <span>
              {language === 'kn'
                ? `ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು (${crops.find((c) => c.id === activeCrop)?.kannada || activeCrop}):`
                : `Verified Prompts for ${activeCrop.toUpperCase()}:`}
            </span>
          </div>
          <span className="text-[10px] text-[#1E3A5F] font-mono font-bold">PoP 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {questions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(q)}
              className="group flex items-center justify-between p-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F6F1E7] border border-[#DDD4C4] hover:border-[#636B2F] text-left text-xs text-[#0A0A0A] transition-all duration-200 shadow-sm cursor-pointer"
            >
              <span className="leading-relaxed pr-2 font-bold text-[#0A0A0A]">{q}</span>
              <ArrowRight className="w-4 h-4 text-[#636B2F] group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Institutional Badges Footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 pt-4 border-t border-[#DDD4C4] text-[11px] text-[#4B5563] font-semibold">
        <span className="flex items-center gap-1 font-bold text-[#0A0A0A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#636B2F]" />
          KSNUAHS Shivamogga
        </span>
        <span>•</span>
        <span>GKMS / DAMU Agromet</span>
        <span>•</span>
        <span>ICAR PoP Karnataka 2026</span>
        <span>•</span>
        <span>IMD Bengaluru</span>
      </div>
    </div>
  );
};
