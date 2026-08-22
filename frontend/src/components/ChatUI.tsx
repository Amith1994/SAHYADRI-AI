import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2,
  BookMarked,
  Menu,
  X,
  CloudSun,
  BookOpen,
} from 'lucide-react';
import type { Message, Crop, Citation, FarmContextData, IMDWeatherAdvisory } from '../types';
import { sendChatMessage, fetchCrops } from '../services/api';
import { CropSelector } from './CropSelector';
import { FarmContextSelector } from './FarmContextSelector';
import { PromptLibrary } from './PromptLibrary';
import { LanguageSelector } from './LanguageSelector';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { LoadingIndicator } from './LoadingIndicator';
import { WelcomeScreen } from './WelcomeScreen';
import { SourceList } from './SourceList';
import { WeatherInfoBox } from './WeatherInfoBox';

export const ChatUI: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'kn'>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileRightOpen, setIsMobileRightOpen] = useState<boolean>(false);
  const [rightPanelTab, setRightPanelTab] = useState<'weather' | 'sources'>('weather');
  const [latestWeather, setLatestWeather] = useState<IMDWeatherAdvisory | null>(null);

  const [farmContext, setFarmContext] = useState<FarmContextData>({
    district: 'Shivamogga',
    block: 'Shivamogga',
    region: 'Shivamogga',
    season: 'Kharif (Monsoon)',
    variety: 'TMV-2',
    soil: 'Sandy Loam',
  });
  const [sessionId] = useState<string>(() => `session_${Date.now()}`);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load crops on mount
  useEffect(() => {
    fetchCrops().then(setCrops).catch(console.error);
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const DEFAULT_VARIETIES: Record<string, string> = {
    groundnut: 'TMV-2',
    rice: 'Jyothi',
    maize: 'NK-6240',
    arecanut: 'Mohitnagar',
  };

  const handleSelectCrop = (cropId: string | null) => {
    setSelectedCrop(cropId);
    if (cropId && DEFAULT_VARIETIES[cropId]) {
      setFarmContext((prev) => ({
        ...prev,
        variety: DEFAULT_VARIETIES[cropId],
      }));
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Detect if the user's question explicitly mentions a specific crop
    const contentLower = content.toLowerCase();
    let effectiveCrop = selectedCrop;
    if (
      contentLower.includes('paddy') ||
      contentLower.includes('rice') ||
      contentLower.includes('ಭತ್ತ') ||
      contentLower.includes('transplant') ||
      contentLower.includes('blast')
    ) {
      effectiveCrop = 'rice';
    } else if (
      contentLower.includes('groundnut') ||
      contentLower.includes('peanut') ||
      contentLower.includes('ಶೇಂಗಾ') ||
      contentLower.includes('ಕಡಲೆಕಾಯಿ') ||
      contentLower.includes('pegging') ||
      contentLower.includes('tikka')
    ) {
      effectiveCrop = 'groundnut';
    } else if (
      contentLower.includes('maize') ||
      contentLower.includes('corn') ||
      contentLower.includes('ಮೆಕ್ಕೆಜೋಳ') ||
      contentLower.includes('armyworm')
    ) {
      effectiveCrop = 'maize';
    } else if (
      contentLower.includes('arecanut') ||
      contentLower.includes('areca') ||
      contentLower.includes('ಅಡಿಕೆ') ||
      contentLower.includes('koleroga') ||
      contentLower.includes('mahali')
    ) {
      effectiveCrop = 'arecanut';
    }

    // Automatically align variety to the detected crop so cross-crop variety errors never occur
    const effectiveVariety =
      effectiveCrop && DEFAULT_VARIETIES[effectiveCrop]
        ? DEFAULT_VARIETIES[effectiveCrop]
        : farmContext.variety;

    const payloadFarmContext: FarmContextData = {
      ...farmContext,
      variety: effectiveVariety,
    };

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        question: content,
        crop: effectiveCrop,
        language,
        sessionId,
        farmContext: payloadFarmContext,
      });

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: response.answer,
        citations: response.citations,
        crop: response.crop,
        intent: response.intent,
        provider: response.provider,
        isDemo: response.isDemo,
        farmContext: response.farmContext || payloadFarmContext,
        weather: response.weather,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (response.citations && response.citations.length > 0) {
        setActiveCitations(response.citations);
      }
      if (response.weather) {
        setLatestWeather(response.weather);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        sender: 'bot',
        text:
          language === 'kn'
            ? 'ಕ್ಷಮಿಸಿ, ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
            : 'Sorry, I encountered an error retrieving agricultural advisory. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setActiveCitations([]);
  };

  const handleCitationClick = (citation: Citation) => {
    setRightPanelTab('sources');
    setIsMobileRightOpen(true);
    if (citation.url) {
      window.open(citation.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewWeather = (dist?: string, blk?: string) => {
    if (dist) {
      setFarmContext((prev) => ({
        ...prev,
        district: dist,
        block: blk || dist,
        region: dist,
      }));
    }
    setRightPanelTab('weather');
    setIsMobileRightOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2] text-[#0A0A0A] font-sans">
      {/* ─── LEFT SIDEBAR: Crop Selector & Farm Context ──────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#F5F0E6] backdrop-blur-xl border-r border-[#DDD4C4] flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 shadow-sm ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-start justify-between p-3.5 border-b border-[#DDD4C4] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFFFF] border-2 border-[#636B2F] shadow-sm p-0.5 shrink-0">
              <img
                src="/ksnuahs_logo.png"
                alt="KSNUAHS University Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#0A0A0A] font-brand">
                  SAHYADRI AI
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#384959] text-[#FFFFFF] font-bold uppercase">
                  2026
                </span>
              </div>
              <span className="text-[9.5px] text-[#374151] font-bold leading-tight truncate">
                {language === 'kn' ? 'ನೇಗಿಲ ಮೇಲೆಯೇ ನಿಂತಿದೆ ಧರ್ಮ' : 'Negila Meleye Nintide Dharma'}
              </span>
              <span className="text-[9px] text-[#4B5563] font-medium leading-tight truncate mt-0.5">
                KSNUAHS Shivamogga
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden text-[#4B5563] hover:text-black shrink-0 ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F5F0E6]">
          {/* 1. Crop Selector */}
          <CropSelector
            crops={crops}
            selectedCrop={selectedCrop}
            onSelectCrop={(cropId) => {
              handleSelectCrop(cropId);
              setIsMobileSidebarOpen(false);
            }}
            language={language}
          />

          {/* 2. Farm Context Dropdowns (District, Variety, Soil, Season) */}
          <FarmContextSelector
            selectedCrop={selectedCrop}
            language={language}
            onUpdateContext={(ctx) => setFarmContext(ctx)}
          />

          {/* 3. Prompt Library */}
          <PromptLibrary
            selectedCrop={selectedCrop}
            language={language}
            onSelectPrompt={(text) => {
              handleSendMessage(text);
              setIsMobileSidebarOpen(false);
            }}
          />

          {/* 4. Institutional Partners Badge */}
          <div className="p-3.5 mx-3 my-2 rounded-xl bg-[#FFFFFF] border border-[#DDD4C4] text-xs space-y-2 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E3A5F] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#636B2F]" />
              {language === 'kn' ? 'ಜ್ಞಾನ ಪಾಲುದಾರರು' : 'Knowledge Partners'}
            </span>
            <ul className="text-[11px] text-[#111827] space-y-1">
              <li className="font-bold text-[#0A0A0A] flex items-center gap-1">
                <span>🏛️</span> KSNUAHS Shivamogga (AMFU)
              </li>
              <li>• ICAR-IIGR / IIRR / IIMR / CPCRI</li>
              <li>• UAS Dharwad (PoP Karnataka)</li>
              <li>• UAS Bengaluru (GKVK) & UAS Raichur</li>
              <li>• IMD Agromet Advisory Service</li>
            </ul>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-2.5 border-t border-[#DDD4C4] text-[9.5px] text-[#4B5563] font-medium text-center shrink-0 bg-[#F0EAE0]">
          KSNUAHS • Package of Practices v2026 • Karnataka
        </div>
      </aside>

      {/* Backdrop for mobile left sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ─── CENTER: Main Chat Area ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[#FAF7F2]">
        {/* Top Navigation Bar with Full Center Headline */}
        <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-[#DDD4C4] bg-[#FFFFFF] z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg bg-[#F5F0E6] text-[#0A0A0A] border border-[#DDD4C4] md:hidden hover:bg-[#EBE4D5] cursor-pointer"
              title="Open crop selector"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Header Mini University Logo */}
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#DDD4C4] p-0.5 shadow-sm">
              <img
                src="/ksnuahs_logo.png"
                alt="KSNUAHS"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center text-center px-2 min-w-0">
            <div className="flex items-center justify-center gap-2 max-w-full">
              <span className="w-2 h-2 rounded-full bg-[#636B2F] animate-pulse shrink-0" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5F0E6] border border-[#DDD4C4] text-[#111827] shrink-0">
                {language === 'kn' ? 'ಕೆಎಸ್ಎನ್‌ಯುಎಎಚ್‌ಎಸ್ ಶಿವಮೊಗ್ಗ' : 'KSNUAHS Shivamogga'}
              </span>
              <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-[#0A0A0A] font-brand truncate">
                {selectedCrop ? (
                  <>
                    {crops.find((c) => c.id === selectedCrop)?.emoji}{' '}
                    {language === 'kn'
                      ? `${crops.find((c) => c.id === selectedCrop)?.kannada || crops.find((c) => c.id === selectedCrop)?.name} ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ`
                      : `${crops.find((c) => c.id === selectedCrop)?.name} Agricultural Advisory`}
                  </>
                ) : (
                  language === 'kn' ? 'ಸಹ್ಯಾದ್ರಿ ಕೃಷಿ ಎಐ — ಕೃಷಿ ಸಲಹಾ ವ್ಯವಸ್ಥೆ' : 'SahyadriAI — Agricultural Advisory System'
                )}
              </h1>
            </div>
            <span className="text-[10px] text-[#4B5563] font-medium truncate max-w-xl hidden sm:inline mt-0.5">
              {language === 'kn'
                ? 'ಕೆಳದಿ ಶಿವಪ್ಪ ನಾಯಕ ಕೃಷಿ ಮತ್ತು ತೋಟಗಾರಿಕೆ ವಿಜ್ಞಾನಗಳ ವಿಶ್ವವಿದ್ಯಾಲಯ, ಶಿವಮೊಗ್ಗ · ನೇಗಿಲ ಮೇಲೆಯೇ ನಿಂತಿದೆ ಧರ್ಮ'
                : 'Keladi Shivappa Nayaka University of Agricultural and Horticultural Sciences, Shivamogga · PoP 2026'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector language={language} onChange={setLanguage} />

            {/* Mobile Weather Button */}
            <button
              type="button"
              onClick={() => {
                setRightPanelTab('weather');
                setIsMobileRightOpen(true);
              }}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-[#EEF5FC] border border-[#88BDF2] text-[#1E3A5F] cursor-pointer"
              title={language === 'kn' ? 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ತೆರೆಯಿರಿ' : 'Open IMD Weather Advisory'}
            >
              <CloudSun className="w-3.5 h-3.5 text-[#384959]" />
              <span className="hidden sm:inline">{language === 'kn' ? 'ಹವಾಮಾನ' : 'Weather'}</span>
            </button>

            {/* Mobile View Sources Button */}
            <button
              type="button"
              onClick={() => {
                setRightPanelTab('sources');
                setIsMobileRightOpen(true);
              }}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-[#F2F6EC] border border-[#636B2F] text-[#282b19] cursor-pointer"
              title={language === 'kn' ? 'ಮೂಲಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : 'Open Sources'}
            >
              <BookMarked className="w-3.5 h-3.5 text-[#636B2F]" />
              <span>{activeCitations.length}</span>
            </button>

            {/* Clear Chat Button */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="p-2 rounded-lg text-[#4B5563] hover:text-black hover:bg-[#F5F0E6] transition-colors cursor-pointer border border-transparent hover:border-[#DDD4C4]"
                title={language === 'kn' ? 'ಸಂಭಾಷಣೆಯನ್ನು ತೆರವಗೊಳಿಸಿ' : 'Clear conversation'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <WelcomeScreen
              crops={crops}
              selectedCrop={selectedCrop}
              onSelectCrop={(cropId) => handleSelectCrop(cropId)}
              onSelectPrompt={handleSendMessage}
              language={language}
            />
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onCitationClick={handleCitationClick}
                onViewWeather={handleViewWeather}
                language={language}
              />
            ))
          )}

          {isLoading && <LoadingIndicator language={language} />}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Bar */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          language={language}
          selectedCrop={selectedCrop}
        />
      </main>

      {/* ─── RIGHT SIDEBAR: Weather Info Box & Sources Panel ────────────── */}
      <aside className="hidden lg:flex flex-col w-96 shrink-0 h-full border-l border-[#DDD4C4] bg-[#F8F5EE]">
        {/* Right Sidebar Top Tab Switcher */}
        <div className="flex items-center justify-around border-b border-[#DDD4C4] bg-[#F2ECE0] p-2 shrink-0 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => setRightPanelTab('weather')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rightPanelTab === 'weather'
                ? 'bg-[#FFFFFF] text-[#1E3A5F] border border-[#88BDF2] shadow-sm'
                : 'text-[#4B5563] hover:text-black hover:bg-[#FFFFFF]/60'
            }`}
          >
            <CloudSun className="w-4 h-4 text-[#384959]" />
            <span>{language === 'kn' ? 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ' : '🌦️ Weather Advisory'}</span>
          </button>

          <button
            type="button"
            onClick={() => setRightPanelTab('sources')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rightPanelTab === 'sources'
                ? 'bg-[#FFFFFF] text-[#282b19] border border-[#636B2F] shadow-sm'
                : 'text-[#4B5563] hover:text-black hover:bg-[#FFFFFF]/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#636B2F]" />
            <span>
              {language === 'kn' ? 'ಉಲ್ಲೇಖಗಳು' : '📚 Verified Sources'} ({activeCitations.length})
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {rightPanelTab === 'weather' ? (
            <WeatherInfoBox
              farmContext={farmContext}
              selectedCrop={selectedCrop}
              language={language}
              onUpdateContext={(ctx) => setFarmContext(ctx)}
              initialAdvisory={latestWeather}
            />
          ) : (
            <SourceList citations={activeCitations} language={language} />
          )}
        </div>
      </aside>

      {/* Mobile Drawer (Weather or Sources) */}
      {isMobileRightOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="w-96 max-w-[92vw] h-full flex flex-col bg-[#FAF7F2] border-l border-[#DDD4C4]">
            {/* Mobile Tab Switcher */}
            <div className="flex items-center justify-between border-b border-[#DDD4C4] bg-[#F2ECE0] p-2 shrink-0">
              <div className="flex items-center gap-1 flex-1">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('weather')}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    rightPanelTab === 'weather'
                      ? 'bg-[#FFFFFF] text-[#1E3A5F] border border-[#88BDF2]'
                      : 'text-[#4B5563]'
                  }`}
                >
                  <CloudSun className="w-3.5 h-3.5 text-[#384959]" />
                  <span>{language === 'kn' ? 'ಹವಾಮಾನ' : 'Weather'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('sources')}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    rightPanelTab === 'sources'
                      ? 'bg-[#FFFFFF] text-[#282b19] border border-[#636B2F]'
                      : 'text-[#4B5563]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#636B2F]" />
                  <span>{language === 'kn' ? 'ಉಲ್ಲೇಖಗಳು' : 'Sources'} ({activeCitations.length})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileRightOpen(false)}
                className="p-1.5 text-[#4B5563] hover:text-black rounded-lg hover:bg-[#EBE4D5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              {rightPanelTab === 'weather' ? (
                <WeatherInfoBox
                  farmContext={farmContext}
                  selectedCrop={selectedCrop}
                  language={language}
                  onUpdateContext={(ctx) => setFarmContext(ctx)}
                  initialAdvisory={latestWeather}
                  onClose={() => setIsMobileRightOpen(false)}
                />
              ) : (
                <SourceList
                  citations={activeCitations}
                  language={language}
                  onClose={() => setIsMobileRightOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

