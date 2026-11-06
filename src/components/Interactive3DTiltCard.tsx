import React, { useRef, useState, useCallback } from 'react';

interface Interactive3DTiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
  spotlightBorderColor?: string;
  onClick?: () => void;
}

export const Interactive3DTiltCard: React.FC<Interactive3DTiltCardProps> = ({
  children,
  className = '',
  maxTilt = 7,
  glowColor = 'rgba(212, 175, 55, 0.08)',
  spotlightBorderColor = 'rgba(246, 230, 194, 0.45)',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;

    setRotateX(rotX);
    setRotateY(rotY);
    setMousePos({ x, y });
  }, [maxTilt]);

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="relative transition-transform duration-300 ease-out h-full select-none"
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${
            isHovered ? 'scale3d(1.015, 1.015, 1.015)' : 'scale3d(1, 1, 1)'
          }`,
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative rounded-xl p-[1px] overflow-hidden group transition-shadow duration-300 ${
          isHovered
            ? 'shadow-[0_20px_45px_-12px_rgba(0,0,0,0.98),0_0_25px_rgba(212,175,55,0.12)]'
            : 'shadow-[0_16px_36px_rgba(0,0,0,0.95)]'
        } ${className}`}
      >
        {/* Dynamic Specular Border Spotlight (Illuminates 1px perimeter where cursor is) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-xl"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightBorderColor}, rgba(212, 175, 55, 0.2) 35%, rgba(255, 255, 255, 0.08) 65%, transparent 100%)`,
          }}
        />

        {/* Ambient default border when not hovered */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-xl border border-[rgba(255,255,255,0.08)]"
          style={{ opacity: isHovered ? 0 : 1 }}
        />

        {/* Card Surface Layer */}
        <div className="relative z-10 h-full w-full rounded-[11px] bg-[#080808] overflow-hidden">
          {/* Surface Ambient Glow Spotlight Tracker */}
          <div
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 70%)`,
            }}
          />

          {/* Children Content */}
          <div className="relative z-30 h-full w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
