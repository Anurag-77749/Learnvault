import React, { useRef, useState, useCallback, useEffect } from 'react';

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
  maxTilt = 6,
  glowColor = 'rgba(212, 175, 55, 0.06)',
  spotlightBorderColor = 'rgba(255, 240, 220, 0.35)',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detect touch / mobile devices for zero lag on old phones
    if (typeof window !== 'undefined') {
      const touchMatch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
      setIsTouch(touchMatch);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !cardRef.current) return;
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
  }, [isTouch, maxTilt]);

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      style={{ perspective: isTouch ? 'none' : 1000 }}
      className="relative transition-transform duration-300 ease-out h-full"
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: !isTouch && isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`
            : 'scale3d(1, 1, 1)',
          transformStyle: isTouch ? 'flat' : 'preserve-3d',
          transition: !isTouch && isHovered
            ? 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative rounded-xl p-[1px] overflow-hidden group transition-shadow duration-300 ${
          isHovered
            ? 'shadow-[0_18px_36px_-8px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.08)]'
            : 'shadow-[0_12px_28px_rgba(0,0,0,0.85)]'
        } ${className}`}
      >
        {/* Dynamic 1px Specular Border that follows cursor along perimeter (Desktop only) */}
        {!isTouch && (
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-xl"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(260px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightBorderColor}, rgba(255, 240, 220, 0.07) 50%, transparent 100%)`,
            }}
          />
        )}

        {/* Default 1px Studio Lighting Border (0.07 opacity with top-edge inset highlight) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-xl border border-[rgba(255,240,220,0.07)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
        />

        {/* Primary Card Surface: #110E0E with backdrop blur & vertical surface gradient */}
        <div className="relative z-10 h-full w-full rounded-[11px] bg-[#110E0E] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-md overflow-hidden">
          {/* Surface Ambient Glow Spotlight Tracker (Desktop only) */}
          {!isTouch && (
            <div
              className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 70%)`,
              }}
            />
          )}

          {/* Children Content */}
          <div className="relative z-30 h-full w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
