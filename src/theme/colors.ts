export const Colors = {
  // Primary Hydro / Ocean Blue Palette
  primary: '#0284C7', // Pure Ocean Blue
  primaryLight: '#38BDF8', // Crystal Sky Blue
  primaryDark: '#0369A1', // Deep Sea Blue
  primaryBg: '#F0F9FF', // Hydro Ice Light Background
  
  // Aqua Secondary Palette
  secondary: '#0EA5E9', // Vivid Aqua
  secondaryLight: '#7DD3FC', // Light Aqua Wave
  secondaryDark: '#0284C7',

  // Pure Water Safety & Warning Indicators
  success: '#10B981', // Pure Water Emerald
  successLight: '#34D399',
  successBg: '#ECFDF5',
  warning: '#F59E0B', // Mineral Warning Amber
  warningLight: '#FBBF24',
  warningBg: '#FFFBEB',
  danger: '#EF4444', // Contamination Alert Red
  dangerLight: '#F87171',
  dangerBg: '#FEF2F2',
  info: '#06B6D4', // Cyan Info

  // Light Hydro Theme Palette
  light: {
    background: '#F0F9FF', // Hydro Ice
    card: '#FFFFFF',
    cardGlass: 'rgba(255, 255, 255, 0.92)',
    textPrimary: '#0C4A6E', // Deep Sea Text
    textSecondary: '#0369A1', // Ocean Subtext
    textMuted: '#64748B',
    border: '#BAE6FD', // Light Aqua Border
    shadow: 'rgba(2, 132, 199, 0.08)',
    statusBarStyle: 'dark' as const,
  },

  // Dark Ocean Theme Palette
  dark: {
    background: '#0B132B', // Deep Navy Abyss
    card: '#1C2541', // Deep Ocean Card
    cardGlass: 'rgba(28, 37, 65, 0.9)',
    textPrimary: '#F0F9FF', // Ice White Text
    textSecondary: '#7DD3FC', // Light Aqua Subtext
    textMuted: '#64748B',
    border: '#3A506B', // Deep Ocean Border
    shadow: 'rgba(0, 0, 0, 0.4)',
    statusBarStyle: 'light' as const,
  },

  // Water Quality Status Specific Colors
  status: {
    SAFE: '#10B981',
    BORDERLINE: '#F59E0B',
    UNSAFE: '#EA580C',
    HAZARDOUS: '#EF4444',
  },
};
