import React from 'react';
import { motion } from 'framer-motion';

interface LearnVaultLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
  badge?: string;
}

export const LearnVaultLogo: React.FC<LearnVaultLogoProps> = ({
  size = 32,
  className = '',
  showText = false,
  animated = true,
  badge = '// OS 2.0',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Kinetic Holographic Vault Prism */}
      <div 
        className="relative group cursor-pointer shrink-0" 
        style={{ width: size, height: size }}
      >
        {/* Ambient Orange Photon Glow */}
        <div 
          className="absolute inset-0 rounded-full bg-[#FF5500]/20 blur-md pointer-events-none transition-all duration-500 group-hover:bg-[#FF5500]/35 group-hover:scale-125"
        />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 transition-transform duration-300 ease-out group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Metallic Gradients */}
            <linearGradient id="lv-metal-top" x1="12" y1="6" x2="88" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4A4A52" />
              <stop offset="50%" stopColor="#28282E" />
              <stop offset="100%" stopColor="#18181D" />
            </linearGradient>

            <linearGradient id="lv-metal-left" x1="12" y1="28" x2="50" y2="94" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2A2A30" />
              <stop offset="60%" stopColor="#151518" />
              <stop offset="100%" stopColor="#0B0B0D" />
            </linearGradient>

            <linearGradient id="lv-metal-right" x1="88" y1="28" x2="50" y2="94" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E1E22" />
              <stop offset="60%" stopColor="#111114" />
              <stop offset="100%" stopColor="#070709" />
            </linearGradient>

            {/* Glowing Core Gradient */}
            <linearGradient id="lv-core-grad" x1="50" y1="36" x2="50" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFA040" />
              <stop offset="50%" stopColor="#FF5500" />
              <stop offset="100%" stopColor="#CC2200" />
            </linearGradient>

            {/* Specular Rim Light */}
            <linearGradient id="lv-specular" x1="12" y1="6" x2="88" y2="94" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
            </linearGradient>

            {/* Core Bloom Filter */}
            <filter id="lv-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Chamfered Hexagon (The Solid Vault Body) */}
          <polygon
            points="50,4 90,27 90,73 50,96 10,73 10,27"
            fill="#0A0A0C"
            stroke="url(#lv-specular)"
            strokeWidth="1.2"
          />

          {/* Top Isometric Facet (Titanium Deck) */}
          <polygon
            points="50,8 86,29 50,48 14,29"
            fill="url(#lv-metal-top)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.8"
          />

          {/* Left Isometric Facet (Architectural 'L' Pillar) */}
          <polygon
            points="14,31 48,49 48,91 14,71"
            fill="url(#lv-metal-left)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.8"
          />

          {/* Right Isometric Facet (Converging 'V' Chevron) */}
          <polygon
            points="86,31 86,71 52,91 52,49"
            fill="url(#lv-metal-right)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.8"
          />

          {/* Precision Micro-Etchings & Vernier Caliper Ticks */}
          {/* Top facet laser ticks */}
          <line x1="42" y1="20" x2="46" y2="18" stroke="#FF5500" strokeWidth="0.8" strokeOpacity="0.8" />
          <line x1="54" y1="18" x2="58" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          
          {/* Left 'L' facet precision horizontal step */}
          <line x1="22" y1="52" x2="38" y2="61" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" />
          <line x1="22" y1="57" x2="32" y2="62" stroke="#FF5500" strokeWidth="0.7" strokeOpacity="0.7" />

          {/* Right 'V' facet diagonal guide line */}
          <line x1="62" y1="61" x2="78" y2="52" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" />

          {/* Geometric Interlocking Monogram Path ('L' and 'V') */}
          {/* Stylized 'L' cut */}
          <path
            d="M 28 42 L 36 46 L 36 68 L 46 73 L 44 76 L 28 68 Z"
            fill="#FF5500"
            fillOpacity="0.85"
            className="transition-opacity group-hover:fill-opacity-100"
          />

          {/* Stylized 'V' cut */}
          <path
            d="M 72 42 L 56 68 L 54 68 L 60 76 L 76 50 Z"
            fill="#FFFFFF"
            fillOpacity="0.8"
            className="transition-opacity group-hover:fill-opacity-100"
          />

          {/* Central Floating Radiant Core (The Vault Singularity) */}
          <g filter="url(#lv-glow)">
            <polygon
              points="50,38 60,50 50,62 40,50"
              fill="url(#lv-core-grad)"
            />
            {/* White Hot Focal Pinpoint */}
            <circle cx="50" cy="50" r="2.2" fill="#FFFFFF" />
          </g>

          {/* Precision Laser Ring Orbit with Traveling Photon */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="rgba(255,85,0,0.25)"
            strokeWidth="0.6"
            strokeDasharray="3 3"
          />
        </svg>

        {/* CSS Animated Micro-Satellite Photon Dot */}
        {animated && (
          <div 
            className="absolute inset-0 pointer-events-none animate-spin"
            style={{ animationDuration: '9s', animationTimingFunction: 'linear' }}
          >
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-1 h-1 rounded-full bg-[#FF5500] shadow-[0_0_6px_#FF5500]"
            />
          </div>
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-black text-xs sm:text-sm tracking-tight text-[#F5F5F7] group-hover:text-white transition-colors">
              LEARNVAULT
            </span>
            <span className="text-[9px] font-mono text-[#9898A0] font-bold tracking-wider">
              {badge}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
