import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Sparkles,
  Sprout,
  ShieldCheck,
  Cpu,
  Droplets,
  ScanLine,
  CloudSun,
  Activity,
  Zap,
} from 'lucide-react';
import ksnuahsLogo from '../assets/ksnuahs_logo.png';

interface Props {
  onFinish: () => void;
}

// Particle & Neural Network Canvas for AI in Agriculture
const AgriTechCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Node types representing agricultural AI concepts
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulse: number;
      pulseSpeed: number;
      type: 'sensor' | 'drone' | 'crop' | 'ai';
    }

    const colors = [
      '#4ade80', // Leaf Emerald
      '#d4de95', // Harvest Lime
      '#88bdf2', // Agromet Sky Blue
      '#60a5fa', // Tech Blue
      '#a3e635', // Bio Green
    ];

    const nodeCount = Math.min(Math.floor((width * height) / 22000), 55);
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        type: ['sensor', 'drone', 'crop', 'ai'][Math.floor(Math.random() * 4)] as Node['type'],
      });
    }

    // Scanning LiDAR beam
    let scanY = 0;
    const scanSpeed = 1.2;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Scanline effect (AI Drone LiDAR Scan across field)
      scanY = (scanY + scanSpeed) % (height + 200);
      const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY);
      grad.addColorStop(0, 'rgba(74, 222, 128, 0)');
      grad.addColorStop(0.8, 'rgba(136, 189, 242, 0.04)');
      grad.addColorStop(1, 'rgba(212, 222, 149, 0.12)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 60, width, 60);

      // Thin scanning laser line
      ctx.strokeStyle = 'rgba(212, 222, 149, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

      // Update & Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        node.pulse += node.pulseSpeed;
        const currentRadius = node.radius + Math.sin(node.pulse) * 0.8;

        // Draw connections (Neural Synapses / IoT Mesh)
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25;
            ctx.strokeStyle = `rgba(180, 220, 160, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();

            // Occasional data packet traveling along line
            if (dist < 90 && Math.sin(node.pulse * 2) > 0.94) {
              const t = (Math.sin(node.pulse * 3) + 1) / 2;
              const px = node.x + (other.x - node.x) * t;
              const py = node.y + (other.y - node.y) * t;
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(px, py, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Draw node glow
        const nodeGlow = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          currentRadius * 3.5
        );
        nodeGlow.addColorStop(0, node.color);
        nodeGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nodeGlow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw node core
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-70"
    />
  );
};

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleStart = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 450);
  };

  // Allow keyboard Enter / Space to trigger launch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-[#0a0f08] text-[#eaf1fa] transition-all duration-500 select-none overflow-x-hidden overflow-y-auto ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Animated AI & Agriculture Canvas */}
      <AgriTechCanvas />

      {/* Ambient Lighting Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#636B2F]/25 via-[#88BDF2]/15 to-[#D4DE95]/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-24 right-4 w-96 h-96 bg-[#384959]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -left-10 w-96 h-96 bg-[#2d3a1f]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Smart Agriculture Activity Telemetry Cards (Desktop & Large Screens) */}
      <div className="hidden lg:block absolute left-6 top-1/2 -translate-y-1/2 space-y-4 pointer-events-none z-10 animate-fade-in">
        {/* Activity 1: AI Drone & Spectral */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#141c10]/85 border border-[#636B2F]/50 backdrop-blur-md shadow-2xl animate-float">
          <div className="w-10 h-10 rounded-xl bg-[#636B2F]/30 border border-[#D4DE95]/40 flex items-center justify-center text-[#D4DE95]">
            <ScanLine className="w-5 h-5 text-[#D4DE95] animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#D4DE95] uppercase tracking-wider">AI Drone Scan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-xs font-extrabold text-white">NDVI Canopy Health: 0.88</div>
            <div className="text-[10px] text-[#BAC095]/80">Multi-Spectral Vigor Scan</div>
          </div>
        </div>

        {/* Activity 2: Vision Pest & Disease */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#141c10]/85 border border-[#88BDF2]/40 backdrop-blur-md shadow-2xl animate-float-slow">
          <div className="w-10 h-10 rounded-xl bg-[#384959]/40 border border-[#88BDF2]/40 flex items-center justify-center text-[#88BDF2]">
            <Cpu className="w-5 h-5 text-[#88BDF2]" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#88BDF2] uppercase tracking-wider">Vision AI Diagnostics</div>
            <div className="text-xs font-extrabold text-white">Tikka, Blast & FAW Models</div>
            <div className="text-[10px] text-[#BAC095]/80">Zero-Shot Image Diagnosis</div>
          </div>
        </div>

        {/* Activity 3: Precision PoP 2026 */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#141c10]/85 border border-[#BAC095]/40 backdrop-blur-md shadow-2xl animate-float">
          <div className="w-10 h-10 rounded-xl bg-[#3D4127]/50 border border-[#BAC095]/40 flex items-center justify-center text-[#BAC095]">
            <Sprout className="w-5 h-5 text-[#BAC095]" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#BAC095] uppercase tracking-wider">Grounded Knowledge</div>
            <div className="text-xs font-extrabold text-white">ICAR PoP Karnataka 2026</div>
            <div className="text-[10px] text-[#BAC095]/80">University Verified Practices</div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 space-y-4 pointer-events-none z-10 animate-fade-in">
        {/* Activity 4: Smart Irrigation & AWD */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#141c10]/85 border border-[#88BDF2]/40 backdrop-blur-md shadow-2xl animate-float-slow">
          <div className="w-10 h-10 rounded-xl bg-[#384959]/40 border border-[#88BDF2]/40 flex items-center justify-center text-[#88BDF2]">
            <Droplets className="w-5 h-5 text-[#88BDF2] animate-bounce-subtle" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#88BDF2] uppercase tracking-wider">Smart Irrigation</div>
            <div className="text-xs font-extrabold text-white">AWD & Drip Micro-Scheduling</div>
            <div className="text-[10px] text-[#BAC095]/80">32% Water Conservation</div>
          </div>
        </div>

        {/* Activity 5: DAMU Agromet Weather */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#141c10]/85 border border-[#D4DE95]/50 backdrop-blur-md shadow-2xl animate-float">
          <div className="w-10 h-10 rounded-xl bg-[#636B2F]/30 border border-[#D4DE95]/40 flex items-center justify-center text-[#D4DE95]">
            <CloudSun className="w-5 h-5 text-[#D4DE95]" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#D4DE95] uppercase tracking-wider">IMD DAMU Agromet</div>
            <div className="text-xs font-extrabold text-white">Shivamogga 5-Day Telemetry</div>
            <div className="text-[10px] text-[#BAC095]/80">Micro-Climate Advisory</div>
          </div>
        </div>

        {/* Activity 6: Split NPK & Nutrient */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#141c10]/85 border border-[#6A89A7]/50 backdrop-blur-md shadow-2xl animate-float-slow">
          <div className="w-10 h-10 rounded-xl bg-[#282b19]/60 border border-[#6A89A7]/40 flex items-center justify-center text-[#BDDDFC]">
            <Zap className="w-5 h-5 text-[#BDDDFC]" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#BDDDFC] uppercase tracking-wider">Nutrient Precision</div>
            <div className="text-xs font-extrabold text-white">3-Stage Split Urea & Gypsum</div>
            <div className="text-[10px] text-[#BAC095]/80">Targeted Crop Nutrition</div>
          </div>
        </div>
      </div>

      {/* Top University Motto & Badge */}
      <div className="relative z-10 pt-2 sm:pt-3 flex flex-col items-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full bg-[#182212]/90 border border-[#636B2F]/70 text-xs sm:text-sm font-bold text-[#D4DE95] shadow-lg backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-[#88BDF2] animate-pulse" />
          <span>ನೇಗಿಲ ಮೇಲೆಯೇ ನಿಂತಿದೆ ಧರ್ಮ • Negila Meleye Nintide Dharma</span>
        </div>
      </div>

      {/* Main Center Content: Logo & AI Branding */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-4 my-auto space-y-4 sm:space-y-5">
        {/* Animated University Logo Badge (Fits Cleanly & Seamlessly in Circle) */}
        <div
          className="relative group cursor-pointer"
          onClick={handleStart}
          title="Click to START Sahyadri AI"
        >
          {/* Outer Pulsing Glow Halo */}
          <div className="absolute -inset-5 bg-gradient-to-r from-[#636B2F] via-[#88BDF2] to-[#D4DE95] rounded-full blur-2xl opacity-65 group-hover:opacity-100 transition duration-500 animate-pulse-glow" />

          {/* Outer Cyber Dashed Orbit Ring */}
          <div className="absolute -inset-3 rounded-full border-2 border-dashed border-[#D4DE95]/50 animate-[spin_25s_linear_infinite] pointer-events-none" />

          {/* Clean Circular Emblem Card with Seamless White Background */}
          <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white border-4 border-[#D4DE95] shadow-[0_0_35px_rgba(212,222,149,0.55)] p-3 sm:p-4 overflow-hidden transition-all duration-300 group-hover:scale-105">
            <img
              src={ksnuahsLogo}
              alt="KSNUAHS Shivamogga University Emblem"
              className="w-full h-full object-contain filter drop-shadow-sm select-none"
            />
          </div>
        </div>

        {/* AI Live Status & Grounding Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#182214]/90 border border-[#636B2F] text-[11px] font-mono font-bold text-[#D4DE95] shadow-md backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span>AI AGRI-CORE ACTIVE</span>
          <span className="text-[#6A89A7]">•</span>
          <span className="text-[#BDDDFC]">PoP 2026 GROUNDED</span>
        </div>

        {/* Title 1: Sahyadri Agricultural AI */}
        <div className="space-y-1 animate-slide-up">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D4DE95] via-[#BDDDFC] to-[#88BDF2] font-brand drop-shadow-sm">
            Sahyadri Agricultural AI
          </h1>
          <p className="text-sm sm:text-lg font-bold text-[#D4DE95] tracking-wide">
            ಸಹ್ಯಾದ್ರಿ ಕೃಷಿ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ವ್ಯವಸ್ಥೆ
          </p>
        </div>

        {/* Title 2: Keladi Shivappa Nayaka University */}
        <div className="space-y-1 max-w-xl pt-2 border-t border-[#3D4127]/80 animate-slide-up">
          <h2 className="text-sm sm:text-base font-extrabold text-[#eaf1fa] leading-snug">
            Keladi Shivappa Nayaka University of Agricultural and Horticultural Sciences, Shivamogga
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#BAC095]">
            ಕೆಳದಿ ಶಿವಪ್ಪ ನಾಯಕ ಕೃಷಿ ಮತ್ತು ತೋಟಗಾರಿಕೆ ವಿಜ್ಞಾನಗಳ ವಿಶ್ವವಿದ್ಯಾಲಯ, ಶಿವಮೊಗ್ಗ (ಕರ್ನಾಟಕ)
          </p>
        </div>

        {/* System Ready Status Indicator (No Timer) */}
        <div className="w-full max-w-lg pt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-mono text-[#BAC095] bg-[#141c10]/80 py-2 px-4 rounded-xl border border-[#3D4127]">
          <span className="flex items-center gap-1.5 text-[#D4DE95] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#88BDF2] shrink-0" />
            Knowledge Base Loaded:
          </span>
          <span className="text-white/90 font-medium">Groundnut • Paddy • Maize • Arecanut</span>
        </div>
      </div>

      {/* Bottom Primary Call-to-Action: Direct Instant START */}
      <div className="relative z-10 pb-3 sm:pb-5 w-full max-w-md flex flex-col items-center gap-2 animate-slide-up">
        <button
          type="button"
          onClick={handleStart}
          className="group w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-[#636B2F] via-[#384959] to-[#88BDF2] text-white font-black text-base sm:text-lg tracking-wider uppercase flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.03] shadow-[0_0_25px_rgba(136,189,242,0.45)] hover:shadow-[0_0_35px_rgba(212,222,149,0.6)] border border-[#D4DE95]/80 ring-2 ring-[#D4DE95]/40 cursor-pointer shimmer-btn active:scale-95"
        >
          <span className="flex items-center gap-2.5">
            <span>ಪ್ರಾರಂಭಿಸಿ</span>
            <span className="text-[#D4DE95]">•</span>
            <span>START</span>
          </span>
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform duration-300" />
        </button>

        <span className="text-xs text-[#BAC095] text-center font-medium">
          ಕೃಷಿ ಸಲಹಾ ವ್ಯವಸ್ಥೆಗೆ ಪ್ರವೇಶಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ • Click START to begin
        </span>
      </div>
    </div>
  );
};
