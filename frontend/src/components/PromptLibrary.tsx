import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface Props {
  selectedCrop: string | null;
  language: 'en' | 'kn';
  onSelectPrompt: (promptText: string) => void;
}

const BEST_QUESTIONS: Record<string, { en: { emoji: string; text: string }[]; kn: { emoji: string; text: string }[] }> = {
  groundnut: {
    en: [
      { emoji: '🌱', text: 'Recommended seed rate & spacing for TMV-2 / GPBD-4?' },
      { emoji: '🧪', text: 'Basal NPK dose & Gypsum 500 kg/ha timing?' },
      { emoji: '🐛', text: 'How to control Tikka leaf spot and Collar rot?' },
      { emoji: '💧', text: 'Critical irrigation stages for flowering & pegging?' },
      { emoji: '🌾', text: 'Maturity indicators and safe kernel moisture (8%)?' },
    ],
    kn: [
      { emoji: '🌱', text: 'ಶೇಂಗಾ ಬಿತ್ತನೆಗೆ ಶಿಫಾರಸು ಮಾಡಿದ ಬೀಜದ ಪ್ರಮಾಣ ಎಷ್ಟು?' },
      { emoji: '🧪', text: 'ಕಡಲೆಕಾಯಿಗೆ ಜಿಪ್ಸಮ್ ಮತ್ತು ರಸಗೊಬ್ಬರ ಯಾವಾಗ ಹಾಕಬೇಕು?' },
      { emoji: '🐛', text: 'ಶೇಂಗಾದಲ್ಲಿ ಟಿಕ್ಕಾ ಎಲೆಚುಕ್ಕೆ ರೋಗ ನಿಯಂತ್ರಣ ಹೇಗೆ?' },
      { emoji: '💧', text: 'ಕಡಲೆಕಾಯಿಯ ಪ್ರಮುಖ ನೀರಾವರಿ ಹಂತಗಳು ಯಾವುವು?' },
      { emoji: '🌾', text: 'ಕಡಲೆಕಾಯಿ ಕಟಾವಿಗೆ ಬಂದಿರುವುದನ್ನು ತಿಳಿಯುವುದು ಹೇಗೆ?' },
    ],
  },
  rice: {
    en: [
      { emoji: '🌾', text: 'Nursery preparation & seed rate for Jyothi paddy?' },
      { emoji: '🧪', text: 'Split NPK (120:50:50) schedule for paddy?' },
      { emoji: '🐛', text: 'Leaf blast & Neck blast chemical management?' },
      { emoji: '💧', text: 'Alternate Wetting & Drying (AWD) water saving?' },
      { emoji: '🍚', text: 'Harvest moisture (20-22%) for maximum milling?' },
    ],
    kn: [
      { emoji: '🌾', text: 'ಭತ್ತದ ನಾಟಿಗೆ ನರ್ಸರಿ ತಯಾರಿಕೆ ಮತ್ತು ಬೀಜದ ಪ್ರಮಾಣ?' },
      { emoji: '🧪', text: 'ಜ್ಯೋತಿ ಭತ್ತದ ತಳಿಗೆ ರಸಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿ?' },
      { emoji: '🐛', text: 'ಭತ್ತದಲ್ಲಿ ಬೆಂಕಿ ರೋಗ (Blast) ನಿಯಂತ್ರಿಸುವುದು ಹೇಗೆ?' },
      { emoji: '💧', text: 'ಕಡಿಮೆ ನೀರಿನಲ್ಲಿ ಭತ್ತ ಬೆಳೆಯಲು AWD ವಿಧಾನ?' },
      { emoji: '🍚', text: 'ಭತ್ತದ ಕಟಾವು ಮತ್ತು ಸರಿಯಾದ ತೇವಾಂಶ ನಿರ್ವಹಣೆ?' },
    ],
  },
  maize: {
    en: [
      { emoji: '🌽', text: 'Row spacing (60 cm) & plant population for hybrid maize?' },
      { emoji: '🧪', text: '180:60:40 kg NPK split dose application schedule?' },
      { emoji: '🐛', text: 'Fall Armyworm (FAW) whorl spray management?' },
      { emoji: '💧', text: 'Water stress prevention during tasseling & silking?' },
      { emoji: '📦', text: 'Black layer maturity and safe grain storage (12%)?' },
    ],
    kn: [
      { emoji: '🌽', text: 'ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಿದ ಸಾಲಿನ ಅಂತರ ಎಷ್ಟು?' },
      { emoji: '🧪', text: 'ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಯೂರಿಯಾ ಗೊಬ್ಬರ 3 ಹಂತಗಳಲ್ಲಿ ಹೇಗೆ ಹಾಕಬೇಕು?' },
      { emoji: '🐛', text: 'ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಲದ್ದಿ ಹುಳು (FAW) ನಿಯಂತ್ರಣ ಹೇಗೆ?' },
      { emoji: '💧', text: 'ಮೆಕ್ಕೆಜೋಳದ ಪ್ರಮುಖ ನೀರಾವರಿ ಹಂತಗಳು ಯಾವುವು?' },
      { emoji: '📦', text: 'ಮೆಕ್ಕೆಜೋಳ ಕಟಾವು ಮತ್ತು ಸುರಕ್ಷಿತ ದಾಸ್ತಾನು ತೇವಾಂಶ?' },
    ],
  },
  arecanut: {
    en: [
      { emoji: '🌴', text: 'Pit size (90×90×90 cm) & spacing for Mangala planting?' },
      { emoji: '🧪', text: 'NPK 200:80:280g + FYM 12kg schedule for bearing palm?' },
      { emoji: '🍄', text: '1% Bordeaux mixture schedule for Koleroga (Mahali)?' },
      { emoji: '💧', text: 'Drip irrigation 200 L/palm/week in dry summer?' },
      { emoji: '🥥', text: 'Tender green chali vs ripe red arecanut harvest?' },
    ],
    kn: [
      { emoji: '🌴', text: 'ಅಡಿಕೆ ಸಸಿ ನಾಟಿಗೆ ಗುಂಡಿ ಅಳತೆ ಮತ್ತು ಅಂತರ ಎಷ್ಟು?' },
      { emoji: '🧪', text: 'ಫಸಲು ಬಿಡುವ ಅಡಿಕೆ ಮರಗಳಿಗೆ ವಾರ್ಷಿಕ ಗೊಬ್ಬರ ಪ್ರಮಾಣ?' },
      { emoji: '🍄', text: 'ಅಡಿಕೆಯಲ್ಲಿ ಕೊಳೆರೋಗ (ಮಹಾಲಿ) ತಡೆಗಟ್ಟಲು ಬೋರ್ಡೋ ದ್ರಾವಣ?' },
      { emoji: '💧', text: 'ಬೇಸಿಗೆಯಲ್ಲಿ ಅಡಿಕೆಗೆ ಹನಿ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ?' },
      { emoji: '🥥', text: 'ಕಲ್ಲು ಅಡಿಕೆ (ಹಸಿ ಅಡಿಕೆ) ಮತ್ತು ಗೋಟು ಅಡಿಕೆ ಕಟಾವು ವಿಧಾನ?' },
    ],
  },
};

const DYNAMIC_NEXT_QUESTIONS: Record<string, { en: string[]; kn: string[] }> = {
  groundnut: {
    en: [
      '🌱 Rhizobium & PSB biofertilizer seed treatment method?',
      '🧪 Micronutrient Zinc & Boron deficiency correction in groundnut?',
      '🌿 Pre-emergence herbicide Pendimethalin application rate?',
    ],
    kn: [
      '🌱 ರೈಜೋಬಿಯಂ ಮತ್ತು ಪಿಎಸ್ಬಿ ಜೈವಿಕ ಗೊಬ್ಬರ ಬೀಜೋಪಚಾರ ವಿಧಾನ?',
      '🧪 ಶೇಂಗಾದಲ್ಲಿ ಸತು ಮತ್ತು ಬೋರಾನ್ ಲಘು ಪೋಷಕಾಂಶ ಕೊರತೆ ನಿವಾರಣೆ?',
      '🌿 ಕಳೆ ನಿಯಂತ್ರಣಕ್ಕೆ ಪೆಂಡಿಮಿಥಾಲಿನ್ ಬಳಕೆ ಪ್ರಮಾಣ ಎಷ್ಟು?',
    ],
  },
  rice: {
    en: [
      '🌱 SRI method spacing and seedling age at transplanting?',
      '🐛 Brown Plant Hopper (BPH) control without resurgence?',
      '🧪 Zinc deficiency (Khaira disease) foliar spray dose?',
    ],
    kn: [
      '🌱 ಶ್ರೀ (SRI) ಪದ್ಧತಿಯಲ್ಲಿ ಭತ್ತದ ನಾಟಿ ಅಂತರ ಮತ್ತು ಸಸಿಗಳ ವಯಸ್ಸು?',
      '🐛 ಭತ್ತದಲ್ಲಿ ಕಂದು ಜಿಗಿಹುಳು (BPH) ಹತೋಟಿಗೆ ಪರಿಹಾರ?',
      '🧪 ಭತ್ತದಲ್ಲಿ ಸತುವಿನ ಕೊರತೆ (ಖೈರಾ ರೋಗ) ನಿವಾರಣೆಗೆ ಸಿಂಪಡಣೆ?',
    ],
  },
  maize: {
    en: [
      '🐛 Biological NPV spray & Trichogramma cards for FAW?',
      '🍄 Downy mildew seed treatment with Metalaxyl?',
      '💧 Pre-sowing irrigation requirement for Rabi maize?',
    ],
    kn: [
      '🐛 ಲದ್ದಿ ಹುಳು ನಿಯಂತ್ರಣಕ್ಕೆ ಎನ್‌ಪಿವಿ ಮತ್ತು ಟ್ರೈಕೋಗ್ರಾಮಾ ಬಳಕೆ?',
      '🍄 ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಬೆಂಕಿ/ಬೂದಿ ರೋಗಕ್ಕೆ ಮೆಟಲಾಕ್ಸಿಲ್ ಬೀಜೋಪಚಾರ?',
      '💧 ಹಿಂಗಾರು ಮೆಕ್ಕೆಜೋಳ ಬಿತ್ತನೆಗೆ ಮುಂಚಿನ ನೀರಾವರಿ ಕ್ರಮಗಳು?',
    ],
  },
  arecanut: {
    en: [
      '🐛 Red Palm Weevil pheromone trap (Ferrolure+) setup?',
      '🌴 Stem bleeding treatment with Bordeaux paste scraping?',
      '🌿 Green manure & organic mulching in arecanut basins?',
    ],
    kn: [
      '🐛 ಅಡಿಕೆಯಲ್ಲಿ ಕೆಂಪು ಮೂತಿ ಹುಳುವಿಗೆ ಫೆರೋಮೋನ್ ಬಲೆಗಳ ಬಳಕೆ?',
      '🌴 ಅಡಿಕೆ ಕಾಂಡ ಸೋರುವ ರೋಗಕ್ಕೆ ಬೋರ್ಡೋ ಪೇಸ್ಟ್ ಲೇಪನ ವಿಧಾನ?',
      '🌿 ಅಡಿಕೆ ಪಾತಿಗಳಲ್ಲಿ ಹಸಿರೆಲೆ ಗೊಬ್ಬರ ಮತ್ತು ಹೊದಿಕೆ ನಿರ್ವಹಣೆ?',
    ],
  },
};

export const PromptLibrary: React.FC<Props> = ({
  selectedCrop,
  language,
  onSelectPrompt,
}) => {
  const activeCrop = selectedCrop || 'groundnut';
  const cropQuestions = BEST_QUESTIONS[activeCrop] || BEST_QUESTIONS.groundnut;
  const questionsList = cropQuestions[language] || cropQuestions.en;
  const nextDict = DYNAMIC_NEXT_QUESTIONS[activeCrop] || DYNAMIC_NEXT_QUESTIONS.groundnut;
  const nextList = nextDict[language] || nextDict.en;

  return (
    <div className="p-3 mx-3 my-2 rounded-xl bg-[#FFFFFF] border border-[#DDD4C4] text-xs space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#636B2F]" />
          {language === 'kn' ? 'ಪ್ರಶ್ನೆ ಗ್ರಂಥಾಲಯ' : 'Prompt Library'}
        </span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#384959] text-[#FFFFFF] font-mono font-bold uppercase shadow-sm">
          PoP 2026
        </span>
      </div>

      {/* Best Questions */}
      <div className="space-y-1.5">
        <span className="text-[9.5px] font-extrabold uppercase text-[#0A0A0A] block flex items-center gap-1">
          <span>🌟</span> {language === 'kn' ? 'ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು' : 'Best Questions'}
        </span>
        <div className="space-y-1.5">
          {questionsList.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(q.text)}
              className="w-full text-left p-2 rounded-xl bg-[#F5F0E6] hover:bg-[#EBE4D5] border border-[#DDD4C4] hover:border-[#636B2F] text-[11px] text-[#0A0A0A] font-bold transition-all duration-200 flex items-start gap-1.5 leading-snug hover:translate-x-1 shadow-xs cursor-pointer"
            >
              <span className="shrink-0">{q.emoji}</span>
              <span className="truncate">{q.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Next */}
      <div className="space-y-1.5 pt-1.5 border-t border-[#DDD4C4]">
        <span className="text-[9.5px] font-extrabold uppercase text-[#1E3A5F] block flex items-center gap-1">
          <span>⚡</span> {language === 'kn' ? 'ಮುಂದಿನ ಸಲಹೆಗಳು' : 'Suggested Next'}
        </span>
        <div className="space-y-1.5">
          {nextList.slice(0, 2).map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(q)}
              className="w-full text-left p-2 rounded-xl bg-[#EEF5FC] hover:bg-[#D9E9FA] border border-[#88BDF2] text-[11px] text-[#1E3A5F] font-bold transition-all duration-200 flex items-start gap-1.5 leading-snug hover:translate-x-1 shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#384959] shrink-0 mt-0.5" />
              <span className="truncate">{q}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
