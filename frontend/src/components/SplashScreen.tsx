import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Sprout, ShieldCheck } from 'lucide-react';

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const totalDuration = 5000; // 5 seconds
    const intervalMs = 50;
    const step = (intervalMs / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    const countdownTimer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-launch at 5.2 seconds if user does not manually click START
    const autoLaunchTimer = setTimeout(() => {
      handleStart();
    }, 5200);

    return () => {
      clearInterval(timer);
      clearInterval(countdownTimer);
      clearTimeout(autoLaunchTimer);
    };
  }, []);

  const handleStart = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#191b10] text-[#eaf1fa] transition-all duration-700 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Radial Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#636B2F]/30 via-[#88BDF2]/20 to-[#D4DE95]/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-[#384959]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -left-10 w-96 h-96 bg-[#3D4127]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top University Motto & Badge */}
      <div className="relative z-10 pt-4 flex flex-col items-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#282b19]/90 border border-[#636B2F]/60 text-xs font-bold text-[#D4DE95] shadow-lg backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#88BDF2] animate-pulse" />
          <span>ನೇಗಿಲ ಮೇಲೆಯೇ ನಿಂತಿದೆ ಧರ್ಮ • Negila Meleye Nintide Dharma</span>
        </div>
      </div>

      {/* Main Center Content: Logo & Texts */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-4 my-auto space-y-6">
        {/* Animated University Logo with Multi-Ring Halo */}
        <div className="relative group cursor-pointer" onClick={handleStart}>
          <div className="absolute -inset-4 bg-gradient-to-r from-[#636B2F] via-[#88BDF2] to-[#D4DE95] rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition duration-700 animate-pulse-glow" />
          <div className="relative flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#191b10] border-4 border-[#D4DE95] shadow-2xl p-3 animate-float">
            <img
              src="/ksnuahs_logo.png"
              alt="KSNUAHS University Emblem"
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(212,222,149,0.6)]"
            />
          </div>
        </div>

        {/* Title 1: Sahyadri Agricultural AI */}
        <div className="space-y-1.5 animate-slide-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#384959]/90 border border-[#6A89A7] text-[11px] font-mono font-bold text-[#BDDDFC] uppercase tracking-wider mb-1">
            <Sprout className="w-3.5 h-3.5 text-[#D4DE95]" />
            PoP 2026 Grounded Intelligence
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D4DE95] via-[#BDDDFC] to-[#88BDF2] font-brand">
            Sahyadri Agricultural AI
          </h1>
          <p className="text-sm sm:text-base font-bold text-[#D4DE95] tracking-wide">
            ಸಹ್ಯಾದ್ರಿ ಕೃಷಿ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ವ್ಯವಸ್ಥೆ
          </p>
        </div>

        {/* Title 2: Keladi Shivappa Nayaka University of Agricultural and Horticultural Sciences, Shivamogga */}
        <div className="space-y-1 max-w-xl pt-2 border-t border-[#3D4127] animate-slide-up">
          <h2 className="text-sm sm:text-lg font-extrabold text-[#eaf1fa] leading-snug">
            Keladi Shivappa Nayaka University of Agricultural and Horticultural Sciences, Shivamogga
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#BAC095]">
            ಕೆಳದಿ ಶಿವಪ್ಪ ನಾಯಕ ಕೃಷಿ ಮತ್ತು ತೋಟಗಾರಿಕೆ ವಿಜ್ಞಾನಗಳ ವಿಶ್ವವಿದ್ಯಾಲಯ, ಶಿವಮೊಗ್ಗ (ಕರ್ನಾಟಕ)
          </p>
        </div>

        {/* 5-Second Animated Progress Bar with Countdown */}
        <div className="w-full max-w-md pt-2 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#BAC095]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#88BDF2]" />
              {progress >= 100 ? 'Ready to launch' : 'Loading agricultural knowledge...'}
            </span>
            <span className="text-[#D4DE95] font-bold">
              {progress >= 100 ? 'Complete' : `${secondsLeft}s`}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#282b19] border border-[#3D4127] overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#636B2F] via-[#88BDF2] to-[#D4DE95] transition-all duration-75 ease-out shadow-[0_0_12px_rgba(136,189,242,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Start Button Area */}
      <div className="relative z-10 pb-6 w-full max-w-md flex flex-col items-center gap-2 animate-slide-up">
        <button
          type="button"
          onClick={handleStart}
          className="group w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#636B2F] via-[#384959] to-[#88BDF2] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.03] shadow-glow-sky border border-[#D4DE95]/60 ring-2 ring-[#D4DE95]/30 cursor-pointer shimmer-btn active:scale-95"
        >
          <span className="flex items-center gap-2">
            <span>ಪ್ರಾರಂಭಿಸಿ</span>
            <span>•</span>
            <span>START</span>
          </span>
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
        </button>

        <span className="text-[10px] text-[#BAC095]/80 text-center">
          Click START to explore or wait for automatic launch
        </span>
      </div>
    </div>
  );
};
