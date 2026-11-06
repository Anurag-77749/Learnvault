import React from 'react';
import { motion } from 'framer-motion';

interface OrbitalLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const OrbitalLogo: React.FC<OrbitalLogoProps> = ({ size = 48, className = '', showText = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Pulsing Ambient Glow */}
        <div
          className="absolute inset-0 rounded-full bg-indigo-500/25 blur-lg animate-pulse"
          style={{ width: size, height: size }}
        />

        {/* Orbit Ring 1 (Rotating Clockwise) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-cyan-400/40"
          style={{ transform: 'rotateX(65deg)' }}
        >
          <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
        </motion.div>

        {/* Orbit Ring 2 (Rotating Counter-Clockwise) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-pink-400/40"
          style={{ transform: 'rotateY(65deg)' }}
        >
          <div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_#ec4899]" />
        </motion.div>

        {/* Central Synaptic Nucleus */}
        <div className="relative z-10 w-1/2 h-1/2 rounded-full bg-gradient-to-tr from-indigo-700 via-indigo-500 to-indigo-300 shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-wider text-white font-mono">NEUROVA</span>
          <span className="text-[10px] tracking-widest text-cyan-400 font-semibold uppercase">Adaptive Intelligence</span>
        </div>
      )}
    </div>
  );
};
