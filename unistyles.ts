/**
 * Unistyles theme configuration
 * Defines design tokens for colors, spacing, typography, and breakpoints
 */

import { UnistylesRegistry } from 'react-native-unistyles';

const lightTheme = {
  colors: {
    canvas: '#FFFFFF',
    surface: '#F5F3F0',
    surfaceRaised: '#EBE8E3',
    border: '#D4CCBF',
    ink: '#1A1814',
    inkMuted: '#7A7066',
    amber: '#D9A844',
  },
  spacing: {
    sm: 4,
    mdSm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    displayBold: 'System',
    body: 'System',
  },
  borderRadius: {
    md: 6,
    lg: 8,
  },
};

const darkTheme = {
  colors: {
    canvas: '#1A1814',
    surface: '#2A2420',
    surfaceRaised: '#3A3430',
    border: '#4A4440',
    ink: '#FFFFFF',
    inkMuted: '#B8AFA8',
    amber: '#D9A844',
  },
  spacing: {
    sm: 4,
    mdSm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    displayBold: 'System',
    body: 'System',
  },
  borderRadius: {
    md: 6,
    lg: 8,
  },
};

type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

UnistylesRegistry.addThemes({
  light: lightTheme,
  dark: darkTheme,
});

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}
