import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, Colors, Typography, Spacing } from '../theme';
import { StorageService } from '../services/storage';

interface ThemeContextType {
  isDark: boolean;
  theme: ReturnType<typeof getTheme>;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('light');

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const theme = getTheme(isDark);

  useEffect(() => {
    StorageService.getSettings().then((settings) => {
      if (settings.theme) {
        setThemeModeState(settings.theme);
      }
    });
  }, []);

  const toggleTheme = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setThemeModeState(nextMode);
  };

  const setThemeMode = (mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setThemeMode, themeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
