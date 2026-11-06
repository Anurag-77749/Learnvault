import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorTheme = 'alabaster' | 'obsidian';

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
  alabaster: {
    id: 'alabaster',
    name: 'Swiss Alabaster',
    accentColor: '#FF4F00',
    bgClass: 'theme-alabaster',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Warm Carbon Obsidian',
    accentColor: '#FF4F00',
    bgClass: 'theme-obsidian',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem('lv_color_theme');
      if (saved === 'alabaster' || saved === 'obsidian') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'alabaster'; // Swiss Alabaster default - ZERO NAVY, ZERO BLUE
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
    setTheme(theme === 'alabaster' ? 'obsidian' : 'alabaster');
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
