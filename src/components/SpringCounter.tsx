import React, { useEffect, useState } from 'react';
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
  const [currentVal, setCurrentVal] = useState<number>(value);

  const spring = useSpring(value, {
    stiffness: 80,
    damping: 16,
    mass: 0.7,
  });

  const display = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on('change', (latest) => {
      setCurrentVal(latest);
    });
    return () => unsubscribe();
  }, [value, spring, display]);

  return (
    <span className={`inline-flex items-baseline tabular-nums font-mono ${className}`}>
      {prefix && <span>{prefix}</span>}
      <motion.span>{currentVal}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
};
