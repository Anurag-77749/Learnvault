import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Sparkles, Eye, Shield, Gauge } from 'lucide-react';
import { Interactive3DTiltCard } from './Interactive3DTiltCard';

interface ChronometerCubeShowcaseProps {
  currentDay?: number;
  totalDays?: number;
  topicsLearned?: number;
  totalTopics?: number;
}

export const ChronometerCubeShowcase: React.FC<ChronometerCubeShowcaseProps> = ({
  currentDay = 7,
  totalDays = 1460,
  topicsLearned = 0,
  totalTopics = 892,
}) => {
  const [viewMode, setViewMode] = useState<'assembled' | 'exploded'>('assembled');
  const [sliderVal, setSliderVal] = useState(0); // 0 (assembled) to 100 (exploded)
  const [isHovered, setIsHovered] = useState(false);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseParallax({ x: x * 14, y: y * 14 });
  }, []);

  const explodedOpacity = sliderVal / 100;
  const assembledOpacity = 1 - explodedOpacity;

  return (
    <Interactive3DTiltCard maxTilt={4} glowColor="rgba(212, 175, 55, 0.12)" className="w-full">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMouseParallax({ x: 0, y: 0 });
        }}
        className="relative rounded-xl overflow-hidden bg-[#080808] border border-[rgba(255,255,255,0.08)] p-4 sm:p-6"
      >
        {/* Subtle Ambient Radial Glow */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-40 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(212, 175, 55, 0.12), transparent 70%)',
          }}
        />

        {/* Header HUD */}
        <div className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">
                  PRECISION 3D CHRONOMETER
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#110E0E] text-[#9E958E] border border-white/[0.08]">
                  120 FPS
                </span>
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-[#F5F2EB] tracking-tight">
                Obsidian & Gold Core Engine
              </h3>
            </div>
          </div>

          {/* Interactive Mode Pills & Slider */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setViewMode('assembled');
                setSliderVal(0);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer ${
                sliderVal < 50
                  ? 'btn-liquid-gold text-black shadow-sm'
                  : 'text-[#9E958E] hover:text-[#F5F2EB] bg-white/[0.04]'
              }`}
            >
              Assembled
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('exploded');
                setSliderVal(100);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer ${
                sliderVal >= 50
                  ? 'btn-liquid-gold text-black shadow-sm'
                  : 'text-[#9E958E] hover:text-[#F5F2EB] bg-white/[0.04]'
              }`}
            >
              Exploded View
            </button>
          </div>
        </div>

        {/* Visual 3D Viewport Area */}
        <div className="relative z-10 w-full h-56 sm:h-72 my-3 rounded-lg overflow-hidden bg-[#030303] flex items-center justify-center border border-white/[0.04]">
          {/* Parallax Container */}
          <motion.div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              x: mouseParallax.x,
              y: mouseParallax.y,
              transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
            }}
          >
            {/* Layer 1: Assembled Cube */}
            <img
              src="/images/chronometer_assembled.jpg"
              alt="Assembled LearnVault Chronometer Cube"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300"
              style={{
                opacity: assembledOpacity,
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.9))',
              }}
            />

            {/* Layer 2: Exploded Internal View */}
            <img
              src="/images/chronometer_exploded.jpg"
              alt="Exploded 3D Chronometer Disassembly"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300"
              style={{
                opacity: explodedOpacity,
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.9))',
              }}
            />

            {/* Floating Kinetic HUD Overlays */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/[0.08] text-[10px] font-mono text-[#D4AF37] flex items-center gap-1.5 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
              <span>{sliderVal < 50 ? 'CUBE LOCKED' : 'INTERNAL SUSPENDED VIEW'}</span>
            </div>

            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/[0.08] text-[10px] font-mono text-[#9E958E] pointer-events-none">
              {sliderVal < 50 ? 'BURGUNDY ANODIZED CASING' : 'GOLDEN GEARS & AMBER CORE'}
            </div>
          </motion.div>
        </div>

        {/* Scrubbing Disassembly Slider */}
        <div className="relative z-20 space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#9E958E] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Mechanical Disassembly Scrub:</span>
              <strong className="text-[#F6E6C2]">{sliderVal}%</strong>
            </span>
            <span className="text-[#635B55] text-[10px] hidden sm:inline">
              DRAG TO INSPECT INTERNAL ANATOMY
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderVal}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSliderVal(val);
                setViewMode(val >= 50 ? 'exploded' : 'assembled');
              }}
              className="w-full h-1.5 bg-[#151212] rounded-lg appearance-none cursor-ew-resize accent-[#D4AF37] transition-all"
            />
          </div>
        </div>

        {/* Spec Sheet Footer Metrics */}
        <div className="relative z-20 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-[rgba(255,255,255,0.06)] text-[10px] font-mono">
          <div className="p-2 rounded bg-black/40 border border-white/[0.04]">
            <span className="text-[#635B55] block">CHRONOMETER RATIO</span>
            <span className="text-[#F5F2EB] font-bold">Day {currentDay} / {totalDays}</span>
          </div>
          <div className="p-2 rounded bg-black/40 border border-white/[0.04]">
            <span className="text-[#635B55] block">CURRICULUM SYNC</span>
            <span className="text-[#D4AF37] font-bold">{topicsLearned}/{totalTopics} Topics</span>
          </div>
          <div className="p-2 rounded bg-black/40 border border-white/[0.04]">
            <span className="text-[#635B55] block">CORE FREQUENCY</span>
            <span className="text-[#E5A970] font-bold">120 Hz Crystal</span>
          </div>
          <div className="p-2 rounded bg-black/40 border border-white/[0.04]">
            <span className="text-[#635B55] block">OPTICS & GLASS</span>
            <span className="text-[#9E958E] font-bold">Matte Obsidian</span>
          </div>
        </div>
      </div>
    </Interactive3DTiltCard>
  );
};
