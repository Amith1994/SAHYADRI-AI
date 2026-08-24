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
  Zap,
  Radio,
  Tractor,
  Dna,
} from 'lucide-react';
import ksnuahsLogo from '../assets/ksnuahs_logo.png';

interface Props {
  onFinish: () => void;
}

// Particle, Drone LiDAR, Field Furrow & Vision AI Canvas
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

    // Node types representing agricultural IoT sensors & neural points
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulse: number;
      pulseSpeed: number;
      label?: string;
    }

    const sensorColors = [
      '#4ade80', // Leaf Emerald
      '#d4de95', // Harvest Lime
      '#88bdf2', // Agromet Sky Blue
      '#60a5fa', // Tech Blue
      '#a3e635', // Bio Green
      '#fbbf24', // Sun Amber
    ];

    const sensorLabels = [
      'Soil NPK',
      'Moisture',
      'pH 6.8',
      'IMD Rain',
      'NDVI 0.88',
      'Solar Rad',
      'AWD Level',
      'Temp 26°C',
    ];

    const nodeCount = Math.min(Math.floor((width * height) / 20000), 50);
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.85,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2.2 + 1.8,
        color: sensorColors[Math.floor(Math.random() * sensorColors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        label: Math.random() > 0.65 ? sensorLabels[Math.floor(Math.random() * sensorLabels.length)] : undefined,
      });
    }

    // Drone flight state
    let droneX = 80;
    let droneY = height * 0.18;
    let droneSpeed = 1.1;
    let droneAngle = 0;

    // AI Computer Vision Bounding Box Target state
    let targetX = width * 0.28;
    let targetY = height * 0.62;
    let targetTimer = 0;
    let targetBoxAlpha = 0;
    let targetLabel = 'VISION AI: HEALTHY LEAF (99.4%)';

    // Expanding Drip Irrigation moisture ripples
    interface MoistureRipple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
    }
    const ripples: MoistureRipple[] = [];
    let rippleTimer = 0;

    // Scanning LiDAR beam
    let scanY = 0;
    const scanSpeed = 1.0;

    // Terrain Furrow wave phase
    let wavePhase = 0;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      wavePhase += 0.015;

      // 1. Draw Digital Agricultural Field Topography / Furrows at Bottom
      const furrowBaseY = height * 0.82;
      for (let f = 0; f < 4; f++) {
        const rowY = furrowBaseY + f * 38;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(180, 215, 140, ${0.08 + f * 0.04})`;
        ctx.lineWidth = 1.5;

        for (let x = 0; x <= width; x += 25) {
          const y = rowY + Math.sin((x * 0.006) + wavePhase + f) * 12 + Math.cos((x * 0.012) + wavePhase) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          // Seedling / Sowing pulse dot along furrow
          if (x % 100 === 0 && f === 1) {
            const seedPulse = (Math.sin(wavePhase * 2 + x) + 1) / 2;
            ctx.fillStyle = `rgba(212, 222, 149, ${0.3 + seedPulse * 0.4})`;
            ctx.beginPath();
            ctx.arc(x, y - 4, 2 + seedPulse * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.stroke();
      }

      // 2. Automated Smart Drip Moisture Ripples
      rippleTimer++;
      if (rippleTimer % 110 === 0) {
        ripples.push({
          x: width * 0.2 + Math.random() * (width * 0.6),
          y: furrowBaseY + Math.random() * 80,
          radius: 2,
          maxRadius: 40 + Math.random() * 30,
          alpha: 0.6,
        });
      }

      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += 0.6;
        rip.alpha = (1 - rip.radius / rip.maxRadius) * 0.5;

        if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(136, 189, 242, ${rip.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, rip.radius * 1.6, rip.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Scanline effect (AI Drone LiDAR Scan across field)
      scanY = (scanY + scanSpeed) % (height + 250);
      const grad = ctx.createLinearGradient(0, scanY - 70, 0, scanY);
      grad.addColorStop(0, 'rgba(74, 222, 128, 0)');
      grad.addColorStop(0.8, 'rgba(136, 189, 242, 0.03)');
      grad.addColorStop(1, 'rgba(212, 222, 149, 0.12)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 70, width, 70);

      // Laser scan beam line
      ctx.strokeStyle = 'rgba(212, 222, 149, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

      // 4. Update & Draw Neural / IoT Sensor Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height * 0.85) node.vy *= -1;

        node.pulse += node.pulseSpeed;
        const currentRadius = node.radius + Math.sin(node.pulse) * 0.8;

        // Draw connections (Neural Synapses / Smart Farming IoT Mesh)
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            const alpha = (1 - dist / 135) * 0.28;
            ctx.strokeStyle = `rgba(180, 225, 160, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();

            // Traveling AI telemetry data packet
            if (dist < 95 && Math.sin(node.pulse * 2.5) > 0.93) {
              const t = (Math.sin(node.pulse * 3) + 1) / 2;
              const px = node.x + (other.x - node.x) * t;
              const py = node.y + (other.y - node.y) * t;
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(px, py, 1.6, 0, Math.PI * 2);
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

        // Optional Telemetry Tag
        if (node.label && distToCenter(node.x, node.y, width / 2, height / 2) > 160) {
          ctx.font = '9px monospace';
          ctx.fillStyle = 'rgba(212, 222, 149, 0.45)';
          ctx.fillText(node.label, node.x + 6, node.y - 4);
        }
      }

      // 5. Autonomous Flying Agri-Drone & Scanning Cone
      droneAngle += 0.03;
      droneX += droneSpeed;
      if (droneX > width + 60) {
        droneX = -60;
        droneY = height * 0.12 + Math.random() * (height * 0.15);
      }
      const droneWobbleY = droneY + Math.sin(droneAngle) * 5;

      // Draw Drone LiDAR Cone
      const coneHeight = 160;
      const coneWidth = 90;
      const coneGrad = ctx.createRadialGradient(
        droneX,
        droneWobbleY,
        5,
        droneX,
        droneWobbleY + coneHeight,
        coneWidth
      );
      coneGrad.addColorStop(0, 'rgba(136, 189, 242, 0.35)');
      coneGrad.addColorStop(0.7, 'rgba(74, 222, 128, 0.12)');
      coneGrad.addColorStop(1, 'rgba(212, 222, 149, 0)');

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(droneX, droneWobbleY + 4);
      ctx.lineTo(droneX - coneWidth, droneWobbleY + coneHeight);
      ctx.lineTo(droneX + coneWidth, droneWobbleY + coneHeight);
      ctx.closePath();
      ctx.fill();

      // Drone Ground Radar Reticle
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(droneX, droneWobbleY + coneHeight, coneWidth * 0.7, 12, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Drone Body
      ctx.fillStyle = '#1e291e';
      ctx.strokeStyle = '#D4DE95';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(droneX, droneWobbleY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Drone Rotors (4 Arms)
      const armSpan = 14;
      ctx.strokeStyle = '#88BDF2';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(droneX - armSpan, droneWobbleY - 3);
      ctx.lineTo(droneX + armSpan, droneWobbleY + 3);
      ctx.moveTo(droneX + armSpan, droneWobbleY - 3);
      ctx.lineTo(droneX - armSpan, droneWobbleY + 3);
      ctx.stroke();

      // Blinking Navigation LEDs
      ctx.fillStyle = Math.sin(droneAngle * 4) > 0 ? '#ef4444' : '#22c55e';
      ctx.beginPath();
      ctx.arc(droneX - armSpan, droneWobbleY - 3, 2, 0, Math.PI * 2);
      ctx.arc(droneX + armSpan, droneWobbleY + 3, 2, 0, Math.PI * 2);
      ctx.fill();

      // 6. Computer Vision AI Bounding Box Reticle
      targetTimer++;
      if (targetTimer % 240 === 0) {
        // Move to new target location
        targetX = width * 0.2 + Math.random() * (width * 0.6);
        targetY = height * 0.45 + Math.random() * (height * 0.3);
        const labels = [
          'VISION AI: TIKKA SPOT [0-SHOT DETECTED]',
          'VISION AI: HEALTHY CANOPY (NDVI 0.88)',
          'VISION AI: AWD MOISTURE 5cm [OPTIMAL]',
          'VISION AI: FALL ARMYWORM SCAN [CLEAN]',
          'VISION AI: 3-STAGE NPK DOSE [READY]',
        ];
        targetLabel = labels[Math.floor(Math.random() * labels.length)];
      }

      // Smooth fade in / out of target box
      targetBoxAlpha = (Math.sin(targetTimer * 0.04) + 1) / 2 * 0.7 + 0.2;

      // Draw Corner Brackets
      const boxSize = 50;
      const cornerLen = 10;
      ctx.strokeStyle = `rgba(212, 222, 149, ${targetBoxAlpha})`;
      ctx.lineWidth = 1.8;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(targetX - boxSize / 2, targetY - boxSize / 2 + cornerLen);
      ctx.lineTo(targetX - boxSize / 2, targetY - boxSize / 2);
      ctx.lineTo(targetX - boxSize / 2 + cornerLen, targetY - boxSize / 2);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(targetX + boxSize / 2 - cornerLen, targetY - boxSize / 2);
      ctx.lineTo(targetX + boxSize / 2, targetY - boxSize / 2);
      ctx.lineTo(targetX + boxSize / 2, targetY - boxSize / 2 + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(targetX - boxSize / 2, targetY + boxSize / 2 - cornerLen);
      ctx.lineTo(targetX - boxSize / 2, targetY + boxSize / 2);
      ctx.lineTo(targetX - boxSize / 2 + cornerLen, targetY + boxSize / 2);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(targetX + boxSize / 2 - cornerLen, targetY + boxSize / 2);
      ctx.lineTo(targetX + boxSize / 2, targetY + boxSize / 2);
      ctx.lineTo(targetX + boxSize / 2, targetY + boxSize / 2 - cornerLen);
      ctx.stroke();

      // Target Label
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = `rgba(136, 189, 242, ${targetBoxAlpha})`;
      ctx.fillText(targetLabel, targetX - boxSize / 2, targetY - boxSize / 2 - 6);

      animationFrameId = requestAnimationFrame(render);
    };

    function distToCenter(x: number, y: number, cx: number, cy: number) {
      const dx = x - cx;
      const dy = y - cy;
      return Math.sqrt(dx * dx + dy * dy);
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-75"
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-[#090e07] text-[#eaf1fa] transition-all duration-500 select-none overflow-x-hidden overflow-y-auto ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Animated AI & Agriculture Canvas */}
      <AgriTechCanvas />

      {/* Ambient Lighting Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] bg-gradient-to-tr from-[#636B2F]/25 via-[#88BDF2]/15 to-[#D4DE95]/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-24 right-4 w-96 h-96 bg-[#384959]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -left-10 w-96 h-96 bg-[#2d3a1f]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Smart Agriculture Operations & AI Telemetry Cards (Left Side) */}
      <div className="hidden lg:block absolute left-6 top-1/2 -translate-y-1/2 space-y-3.5 pointer-events-none z-10 animate-fade-in">
        {/* Op 1: Autonomous Sowing & Tillage */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#141c10]/85 border border-[#636B2F]/50 backdrop-blur-md shadow-2xl animate-float">
          <div className="w-9 h-9 rounded-xl bg-[#636B2F]/30 border border-[#D4DE95]/40 flex items-center justify-center text-[#D4DE95]">
            <Tractor className="w-5 h-5 text-[#D4DE95]" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#D4DE95] uppercase tracking-wider">Smart Sowing & Tillage</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-xs font-extrabold text-white">Precision Spacing: 30cm × 10cm</div>
            <div className="text-[10px] text-[#BAC095]/80">GPS Sowing Rate: 100 kg/ha</div>
          </div>
        </div>

        {/* Op 2: AI Drone LiDAR & Spectral Scan */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#141c10]/85 border border-[#88BDF2]/40 backdrop-blur-md shadow-2xl animate-float-slow">
          <div className="w-9 h-9 rounded-xl bg-[#384959]/40 border border-[#88BDF2]/40 flex items-center justify-center text-[#88BDF2]">
            <ScanLine className="w-5 h-5 text-[#88BDF2] animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#88BDF2] uppercase tracking-wider">AI Drone LiDAR Scan</span>
            </div>
            <div className="text-xs font-extrabold text-white">NDVI Canopy Vigor: 0.88</div>
            <div className="text-[10px] text-[#BAC095]/80">Multi-Spectral Live Telemetry</div>
          </div>
        </div>

        {/* Op 3: Computer Vision Pest & Disease */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#141c10]/85 border border-[#BAC095]/40 backdrop-blur-md shadow-2xl animate-float">
          <div className="w-9 h-9 rounded-xl bg-[#3D4127]/50 border border-[#BAC095]/40 flex items-center justify-center text-[#BAC095]">
            <Cpu className="w-5 h-5 text-[#BAC095]" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#BAC095] uppercase tracking-wider">Computer Vision AI</div>
            <div className="text-xs font-extrabold text-white">Tikka, Blast & FAW Models</div>
            <div className="text-[10px] text-[#BAC095]/80">Zero-Shot Image Diagnosis</div>
          </div>
        </div>

        {/* Op 4: Grounded ICAR Knowledge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#141c10]/85 border border-[#6A89A7]/40 backdrop-blur-md shadow-2xl animate-float-slow">
          <div className="w-9 h-9 rounded-xl bg-[#282b19]/60 border border-[#6A89A7]/40 flex items-center justify-center text-[#BDDDFC]">
            <Sprout className="w-5 h-5 text-[#BDDDFC]" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#BDDDFC] uppercase tracking-wider">PoP 2026 Grounding</div>
            <div className="text-xs font-extrabold text-white">ICAR & University Standards</div>
            <div className="text-[10px] text-[#BAC095]/80">Groundnut • Paddy • Maize • Areca</div>
          </div>
        </div>
      </div>

      {/* Floating Smart Agriculture Operations & AI Telemetry Cards (Right Side) */}
      <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 space-y-3.5 pointer-events-none z-10 animate-fade-in">
        {/* Op 5: Smart Drip & AWD Irrigation */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#141c10]/85 border border-[#88BDF2]/40 backdrop-blur-md shadow-2xl animate-float-slow">
          <div className="w-9 h-9 rounded-xl bg-[#384959]/40 border border-[#88BDF2]/40 flex items-center justify-center text-[#88BDF2]">
            <Droplets className="w-5 h-5 text-[#88BDF2] animate-bounce-subtle" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#88BDF2] uppercase tracking-wider">Smart AWD & Drip Water</div>
            <div className="text-xs font-extrabold text-white">Soil Moisture: 78% (Optimal)</div>
            <div className="text-[10px] text-[#BAC095]/80">32% Alternate Wetting Savings</div>
          </div>
        </div>

        {/* Op 6: DAMU Agromet Weather Telemetry */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#141c10]/85 border border-[#D4DE95]/50 backdrop-blur-md shadow-2xl animate-float">
          <div className="w-9 h-9 rounded-xl bg-[#636B2F]/30 border border-[#D4DE95]/40 flex items-center justify-center text-[#D4DE95]">
            <CloudSun className="w-5 h-5 text-[#D4DE95]" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#D4DE95] uppercase tracking-wider">IMD DAMU Agromet</div>
            <div className="text-xs font-extrabold text-white">Shivamogga 5-Day Telemetry</div>
            <div className="text-[10px] text-[#BAC095]/80">Micro-Climate Rainfall Radar</div>
          </div>
        </div>

        {/* Op 7: Precision 3-Stage NPK & Nutrient */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#141c10]/85 border border-[#6A89A7]/50 backdrop-blur-md shadow-2xl animate-float-slow">
          <div className="w-9 h-9 rounded-xl bg-[#282b19]/60 border border-[#6A89A7]/40 flex items-center justify-center text-[#BDDDFC]">
            <Zap className="w-5 h-5 text-[#BDDDFC]" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#BDDDFC] uppercase tracking-wider">Precision NPK Nutrition</div>
            <div className="text-xs font-extrabold text-white">3-Stage Split Urea & Gypsum</div>
            <div className="text-[10px] text-[#BAC095]/80">Targeted Nutrient Efficiency</div>
          </div>
        </div>

        {/* Op 8: Genomic Phenotyping AI */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#141c10]/85 border border-[#4ade80]/40 backdrop-blur-md shadow-2xl animate-float">
          <div className="w-9 h-9 rounded-xl bg-[#1c2e1b]/60 border border-[#4ade80]/40 flex items-center justify-center text-[#4ade80]">
            <Dna className="w-5 h-5 text-[#4ade80]" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#4ade80] uppercase tracking-wider">Crop Phenotyping AI</div>
            <div className="text-xs font-extrabold text-white">Climate & Drought Resilience</div>
            <div className="text-[10px] text-[#BAC095]/80">Varietal Optimization Models</div>
          </div>
        </div>
      </div>

      {/* Top University Motto & Badge: 2 LINES (1st Kannada, 2nd English) */}
      <div className="relative z-10 pt-2 sm:pt-3 flex flex-col items-center animate-fade-in">
        <div className="inline-flex flex-col items-center justify-center px-6 sm:px-8 py-2 rounded-2xl bg-[#141c10]/92 border border-[#636B2F]/80 text-center shadow-xl backdrop-blur-md">
          {/* Line 1: Kannada */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#D4DE95] tracking-wide">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#88BDF2] animate-pulse shrink-0" />
            <span>ನೇಗಿಲ ಮೇಲೆಯೇ ನಿಂತಿದೆ ಧರ್ಮ</span>
          </div>
          {/* Line 2: English */}
          <div className="text-[10px] sm:text-[11px] font-bold text-[#BAC095] tracking-wider font-mono mt-0.5">
            Negila Meleye Nintide Dharma
          </div>
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#141c10]/90 border border-[#636B2F] text-[11px] font-mono font-bold text-[#D4DE95] shadow-md backdrop-blur-sm">
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
