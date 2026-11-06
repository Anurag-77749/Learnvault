import React from 'react';
import { ScreenId } from './Navigation';

interface KineticDomainBadgeProps {
  screenId: ScreenId;
  size?: number;
}

export const KineticDomainBadge: React.FC<KineticDomainBadgeProps> = ({ screenId, size = 64 }) => {
  switch (screenId) {
    case 'today':
      return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full bg-[var(--accent-primary)]/15 blur-md animate-pulse" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
            {/* Outer Orbit Ring */}
            <circle cx="50" cy="50" r="42" stroke="var(--accent-primary)" strokeWidth="1.5" strokeDasharray="6 4" className="animate-spin" style={{ animationDuration: '14s' }} />
            {/* Inner Gyro Ring */}
            <ellipse cx="50" cy="50" rx="32" ry="14" stroke="var(--accent-secondary)" strokeWidth="1.2" transform="rotate(-30 50 50)" />
            {/* Core Icosahedron Mark */}
            <polygon points="50,26 70,38 70,62 50,74 30,62 30,38" fill="rgba(15,17,23,0.9)" stroke="var(--accent-primary)" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="4" fill="var(--accent-primary)" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'timer':
      return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full bg-[var(--accent-primary)]/15 blur-md" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            <circle cx="50" cy="50" r="40" stroke="var(--accent-primary)" strokeWidth="3" strokeDasharray="180 80" className="animate-spin" style={{ animationDuration: '8s' }} />
            {/* 12 Hour Ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="14"
                x2="50"
                y2="20"
                stroke={deg % 90 === 0 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.3)'}
                strokeWidth={deg % 90 === 0 ? '2' : '1'}
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
            {/* Sweeping Needle */}
            <g className="animate-spin origin-center" style={{ animationDuration: '4s', transformOrigin: '50px 50px' }}>
              <line x1="50" y1="50" x2="50" y2="24" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'plan':
      return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full bg-[var(--accent-secondary)]/15 blur-md" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
            {/* 3D Isometric Timeline Pillars */}
            <rect x="20" y="44" width="12" height="36" rx="3" fill="var(--accent-primary)" fillOpacity="0.85" />
            <rect x="44" y="30" width="12" height="50" rx="3" fill="var(--accent-secondary)" fillOpacity="0.95" />
            <rect x="68" y="20" width="12" height="60" rx="3" fill="#38BDF8" fillOpacity="0.85" />
            {/* Interconnecting Laser Rail */}
            <path d="M 26 44 L 50 30 L 74 20" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="26" cy="44" r="3" fill="#FFFFFF" />
            <circle cx="50" cy="30" r="3" fill="#FFFFFF" />
            <circle cx="74" cy="20" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'learn':
      return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full bg-[var(--accent-primary)]/15 blur-md" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
            {/* Knowledge Constellation Orbit */}
            <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4" className="animate-spin" style={{ animationDuration: '20s' }} />
            {/* Synaptic Laser Web */}
            <line x1="50" y1="50" x2="28" y2="34" stroke="var(--accent-primary)" strokeWidth="1.2" strokeOpacity="0.6" />
            <line x1="50" y1="50" x2="72" y2="34" stroke="var(--accent-secondary)" strokeWidth="1.2" strokeOpacity="0.6" />
            <line x1="50" y1="50" x2="68" y2="68" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.6" />
            <line x1="50" y1="50" x2="32" y2="68" stroke="#C084FC" strokeWidth="1.2" strokeOpacity="0.6" />
            {/* Nodes */}
            <circle cx="28" cy="34" r="4.5" fill="var(--accent-primary)" />
            <circle cx="72" cy="34" r="4.5" fill="var(--accent-secondary)" />
            <circle cx="68" cy="68" r="4.5" fill="#38BDF8" />
            <circle cx="32" cy="68" r="4.5" fill="#C084FC" />
            {/* Central Master Singularity */}
            <polygon points="50,40 58,50 50,60 42,50" fill="var(--accent-primary)" />
            <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'dsa':
      return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full bg-[var(--accent-secondary)]/15 blur-md" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
            {/* Algorithmic Tree Lattice */}
            <line x1="50" y1="24" x2="32" y2="48" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <line x1="50" y1="24" x2="68" y2="48" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <line x1="32" y1="48" x2="22" y2="74" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <line x1="32" y1="48" x2="42" y2="74" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <line x1="68" y1="48" x2="58" y2="74" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <line x1="68" y1="48" x2="78" y2="74" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            {/* Colored Difficulty Nodes */}
            <circle cx="50" cy="24" r="6" fill="var(--accent-secondary)" stroke="#FFFFFF" strokeWidth="1.2" />
            <circle cx="32" cy="48" r="5" fill="var(--accent-primary)" />
            <circle cx="68" cy="48" r="5" fill="var(--accent-secondary)" />
            <circle cx="22" cy="74" r="4" fill="#00F59B" />
            <circle cx="42" cy="74" r="4" fill="#FFD600" />
            <circle cx="58" cy="74" r="4" fill="#FFD600" />
            <circle cx="78" cy="74" r="4" fill="#FF3366" />
          </svg>
        </div>
      );

    case 'jobs':
      return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full bg-[var(--accent-secondary)]/15 blur-md" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
            {/* Radar Globe Circles */}
            <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
            <circle cx="50" cy="50" r="26" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx="50" cy="50" r="14" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="12" y1="50" x2="88" y2="50" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="50" y1="12" x2="50" y2="88" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            {/* Sweeping Radar Scanner Line */}
            <g className="animate-spin origin-center" style={{ animationDuration: '3.5s', transformOrigin: '50px 50px' }}>
              <line x1="50" y1="50" x2="84" y2="30" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round" />
            </g>
            {/* Beacon Target Points */}
            <circle cx="68" cy="38" r="3.5" fill="var(--accent-primary)" className="animate-ping" style={{ animationDuration: '2.5s' }} />
            <circle cx="68" cy="38" r="3" fill="var(--accent-primary)" />
            <circle cx="36" cy="62" r="2.5" fill="#00F59B" />
          </svg>
        </div>
      );

    case 'vault':
      return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full bg-purple-500/15 blur-md" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
            {/* Faceted Memory Crystal */}
            <polygon points="50,18 78,38 78,66 50,86 22,66 22,38" fill="rgba(24,18,36,0.85)" stroke="#C084FC" strokeWidth="1.5" />
            <polygon points="50,18 78,38 50,52 22,38" fill="rgba(192,132,252,0.2)" stroke="#C084FC" strokeWidth="1" />
            <polygon points="22,38 50,52 50,86 22,66" fill="rgba(192,132,252,0.1)" stroke="#C084FC" strokeWidth="1" />
            <polygon points="78,38 50,52 50,86 78,66" fill="rgba(192,132,252,0.3)" stroke="#C084FC" strokeWidth="1" />
            <circle cx="50" cy="52" r="3.5" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'projects':
      return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full bg-sky-500/15 blur-md" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
            {/* 3 Isometric Layer Slabs */}
            <polygon points="50,20 80,32 50,44 20,32" fill="rgba(56,189,248,0.25)" stroke="#38BDF8" strokeWidth="1.5" />
            <polygon points="50,38 80,50 50,62 20,50" fill="rgba(255,214,0,0.25)" stroke="var(--accent-primary)" strokeWidth="1.5" />
            <polygon points="50,56 80,68 50,80 20,68" fill="rgba(0,245,155,0.25)" stroke="var(--accent-secondary)" strokeWidth="1.5" />
            <circle cx="50" cy="32" r="2.5" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
            <circle cx="50" cy="68" r="2.5" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'progress':
      return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full bg-[var(--accent-secondary)]/15 blur-md" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
            {/* 3D Dynamic Bar Matrix */}
            <rect x="20" y="52" width="10" height="28" rx="2" fill="var(--accent-primary)" fillOpacity="0.8" />
            <rect x="36" y="38" width="10" height="42" rx="2" fill="var(--accent-secondary)" fillOpacity="0.9" />
            <rect x="52" y="24" width="10" height="56" rx="2" fill="#38BDF8" fillOpacity="0.85" />
            <rect x="68" y="44" width="10" height="36" rx="2" fill="#C084FC" fillOpacity="0.8" />
            <line x1="16" y1="80" x2="84" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'wasted':
      return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full bg-rose-500/15 blur-md" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
            {/* Hourglass Silhouette */}
            <polygon points="28,24 72,24 50,50" fill="rgba(244,63,94,0.2)" stroke="#F43F5E" strokeWidth="1.5" />
            <polygon points="28,76 72,76 50,50" fill="rgba(244,63,94,0.3)" stroke="#F43F5E" strokeWidth="1.5" />
            <line x1="24" y1="24" x2="76" y2="24" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="24" y1="76" x2="76" y2="76" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="3" fill="#FFFFFF" className="animate-ping" style={{ animationDuration: '2s' }} />
          </svg>
        </div>
      );

    default:
      return null;
  }
};
