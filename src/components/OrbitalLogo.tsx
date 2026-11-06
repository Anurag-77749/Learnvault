import React from 'react';
import { LearnVaultLogo } from './LearnVaultLogo';

interface OrbitalLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const OrbitalLogo: React.FC<OrbitalLogoProps> = ({ size = 48, className = '', showText = false }) => {
  return (
    <LearnVaultLogo
      size={size}
      className={className}
      showText={showText}
      badge="// OS 2.0"
    />
  );
};
