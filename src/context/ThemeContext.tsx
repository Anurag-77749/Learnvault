import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorTheme = 'volt' | 'alabaster' | 'prismatic';

interface ThemeContextType {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  cycleTheme: () => void;
  themeConfig: {
    id: ColorTheme;
    name: string;
    accentColor: string;
    bgClass: string;
  };
}

const THEME_CONFIGS: Record<ColorTheme, { id: ColorTheme; name: string; accentColor: string; bgClass: string }> = {
  volt: {
    id: 'volt',
    name: 'Titanium Volt',
    accentColor: '#FFD600',
    bgClass: 'theme-volt',
  },
  alabaster: {
    id: 'alabaster',
    name: 'Swiss Alabaster',
    accentColor: '#FF4F00',
    bgClass: 'theme-alabaster',
  },
  prismatic: {
    id: 'prismatic',
    name: 'Liquid Prismatic',
    accentColor: '#FF3366',
    bgClass: 'theme-prismatic',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem('lv_color_theme');
      if (saved === 'volt' || saved === 'alabaster' || saved === 'prismatic') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'volt'; // Fresh new default!
  });

  const setTheme = (newTheme: ColorTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('lv_color_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const cycleTheme = () => {
    if (theme === 'volt') setTheme('alabaster');
    else if (theme === 'alabaster') setTheme('prismatic');
    else setTheme('volt');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        themeConfig: THEME_CONFIGS[theme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
