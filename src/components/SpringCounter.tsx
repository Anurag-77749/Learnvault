import React, { useEffect } from 'react';
import { useSpring, useTransform, motion } from 'framer-motion';

interface SpringCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const SpringCounter: React.FC<SpringCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const spring = useSpring(0, {
    stiffness: 85,
    damping: 18,
    mass: 0.8,
  });

  const display = useTransform(spring, (current) => {
    return Math.round(current);
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <span className={`inline-flex items-baseline tabular-nums font-mono ${className}`}>
      {prefix && <span>{prefix}</span>}
      <motion.span>{display}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
};
