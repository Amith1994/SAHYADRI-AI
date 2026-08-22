import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react';

interface Props {
  onSend: (question: string) => void;
  disabled?: boolean;
  language: 'en' | 'kn';
  selectedCrop: string | null;
}

export const ChatInput: React.FC<Props> = ({
  onSend,
  disabled,
  language,
  selectedCrop,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert(
        language === 'kn'
          ? 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ.'
          : 'Voice input is not supported in this browser.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  const placeholder =
    language === 'kn'
      ? selectedCrop
        ? `${selectedCrop.toUpperCase()} ಬಗ್ಗೆ ಬೀಜದ ಪ್ರಮಾಣ, ರಸಗೊಬ್ಬರ, ಕೀಟ ರೋಗ ಅಥವಾ ನೀರಾವರಿ ಬಗ್ಗೆ ಕೇಳಿ...`
        : 'ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಉದಾ: ಶೇಂಗಾ ಬೀಜದ ಪ್ರಮಾಣ, ಭತ್ತದ ರೋಗ ನಿರ್ವಹಣೆ)...'
      : selectedCrop
      ? `Ask about ${selectedCrop} seed rate, NPK fertilizer dose, pests, irrigation, or harvesting...`
      : 'Ask any agricultural question (e.g., groundnut spacing, blast control in rice)...';

  return (
    <div className="flex flex-col gap-2 p-3 bg-[#FAF7F2] border-t border-[#DDD4C4]">
      <div className="relative flex items-end gap-2 bg-[#FFFFFF] border-2 border-[#DDD4C4] rounded-2xl p-2 focus-within:border-[#636B2F] focus-within:ring-2 focus-within:ring-[#636B2F]/20 transition-all duration-300 shadow-sm">
        <button
          type="button"
          onClick={toggleVoice}
          className={`p-2.5 rounded-xl transition-all duration-300 shrink-0 cursor-pointer ${
            isListening
              ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] animate-pulse'
              : 'text-[#0A0A0A] hover:bg-[#F5F0E6] hover:scale-105 border border-transparent'
          }`}
          title={isListening ? 'Stop listening' : 'Voice Input (Kannada / English)'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#384959]" />}
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-xs sm:text-sm text-[#0A0A0A] placeholder:text-[#6B7280] font-bold resize-none outline-none py-2 px-1 max-h-32 leading-relaxed"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`p-2.5 rounded-xl text-white font-bold transition-all duration-300 shrink-0 ${
            input.trim() && !disabled
              ? 'bg-[#636B2F] hover:bg-[#3D4127] hover:scale-105 shadow-sm ring-2 ring-[#636B2F]/20 cursor-pointer'
              : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed opacity-60'
          }`}
          title="Send Question"
        >
          <Send className={`w-4 h-4 ${input.trim() && !disabled ? 'text-white translate-x-0.5 -translate-y-0.5 transition-transform' : ''}`} />
        </button>
      </div>

      <div className="flex items-center justify-between px-2 text-[10px] text-[#4B5563] font-semibold">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#636B2F]" />
          <span>
            {language === 'kn'
              ? 'ಕೆಎಸ್ಎನ್‌ಯುಎಎಚ್‌ಎಸ್ ಶಿವಮೊಗ್ಗ ಹಾಗೂ ಐಸಿಎಆರ್ ಅಧಿಕೃತ ಕೃಷಿ ಕೈಪಿಡಿ ೨೦೨೬'
              : 'Official KSNUAHS & ICAR Package of Practices 2026'}
          </span>
        </span>
        <span className="hidden sm:inline text-[#6B7280]">
          {language === 'kn' ? 'Enter ಒತ್ತಿ ಕಳುಹಿಸಿ • ಹೊಸ ಸಾಲಿಗೆ Shift+Enter' : 'Press Enter to send • Shift+Enter for new line'}
        </span>
      </div>
    </div>
  );
};
