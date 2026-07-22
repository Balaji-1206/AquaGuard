import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing } from './spacing';

export { Colors, Typography, Spacing };

export const getTheme = (isDark: boolean) => {
  const palette = isDark ? Colors.dark : Colors.light;
  return {
    isDark,
    colors: {
      ...Colors,
      ...palette,
    },
    typography: Typography,
    spacing: Spacing,
  };
};
