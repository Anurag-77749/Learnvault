import React, { useRef, useState } from 'react';

interface Interactive3DTiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
  onClick?: () => void;
}

export const Interactive3DTiltCard: React.FC<Interactive3DTiltCardProps> = ({
  children,
  className = '',
  maxTilt = 8,
  glowColor = 'rgba(249, 217, 118, 0.22)',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setSpotlightPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="relative transition-transform duration-300 ease-out"
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? 'scale3d(1.015, 1.015, 1.015)' : 'scale3d(1, 1, 1)'}`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
        }}
        className={`relative overflow-hidden ${className}`}
      >
        {/* Radial Golden Spotlight Cursor Tracker */}
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle 180px at ${spotlightPos.x}% ${spotlightPos.y}%, ${glowColor}, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-20 h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
