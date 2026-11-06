import React, { useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  depth?: number;
  glowColor?: string;
  onClick?: () => void;
}

export const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  children,
  className = '',
  maxTilt = 7,
  depth = 16,
  glowColor = 'rgba(255, 214, 0, 0.15)',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  // Spring physics for buttery 3D tilt
  const mouseX = useSpring(0, { stiffness: 260, damping: 22 });
  const mouseY = useSpring(0, { stiffness: 260, damping: 22 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    mouseX.set(x - 0.5);
    mouseY.set(y - 0.5);
    setGlarePosition({ x: Math.round(x * 100), y: Math.round(y * 100) });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      style={{ perspective: 1200 }}
      className="relative will-change-transform"
      onClick={onClick}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? 1.012 : 1,
          translateZ: isHovered ? depth : 0,
        }}
        transition={{ duration: 0.2 }}
        className={`relative overflow-hidden transition-shadow duration-300 ${className}`}
      >
        {/* Dynamic Specular Glare Sheen following cursor */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle 320px at ${glarePosition.x}% ${glarePosition.y}%, ${glowColor}, transparent 70%)`,
          }}
        />

        {/* 3D Elevated Content */}
        <div 
          style={{ transform: isHovered ? `translateZ(${depth / 2}px)` : 'translateZ(0px)' }}
          className="relative z-10 transition-transform duration-200"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
};
