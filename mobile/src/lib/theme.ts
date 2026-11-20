import { Platform, useColorScheme } from 'react-native';

// Cores e fonte extraídas de prototype/index.html (variantes claro e escuro).
export const themes = {
  light: {
    bg: '#F2F2F7',
    card: '#FFFFFF',
    ink: '#1C1C1E',
    muted: '#6B6B72',
    sep: 'rgba(60,60,67,.16)',
    fill: '#EEEEF2',
    blue: '#2563EB',
    onBlue: '#FFFFFF',
    tint: 'rgba(37,99,235,.11)',
    r2: '#38BDF8',
    r3: '#1E3A8A',
  },
  dark: {
    bg: '#000000',
    card: '#1C1C1E',
    ink: '#F5F5F7',
    muted: '#9A9AA1',
    sep: 'rgba(120,120,128,.34)',
    fill: '#2C2C2E',
    blue: '#4C8DFF',
    onBlue: '#FFFFFF',
    tint: 'rgba(76,141,255,.2)',
    r2: '#5AC8FA',
    r3: '#8E9BFF',
  },
};

export type Theme = typeof themes.light;

export const fonts = {
  // Pilha do protótipo; no app nativo vale a fonte do sistema.
  system:
    '-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",system-ui,"Segoe UI",Roboto,sans-serif',
  native: Platform.select({ ios: 'System', default: 'sans-serif' }),
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? themes.dark : themes.light;
}
