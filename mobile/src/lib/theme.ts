import { Platform, useColorScheme } from 'react-native';

// Cores extraídas de prototype/index.html (variantes claro e escuro), mais as
// semânticas. Toda cor de texto tem contraste AA (≥ 4,5:1) sobre bg e card.
export const themes = {
  light: {
    bg: '#F2F2F7',
    card: '#FFFFFF',
    ink: '#1C1C1E',
    muted: '#6B6B72',
    sep: 'rgba(60,60,67,.16)',
    fill: '#EEEEF2',
    blue: '#2563EB',
    // Fundo do botão principal: onBlue tem contraste AA sobre ela.
    action: '#2563EB',
    onBlue: '#FFFFFF',
    tint: 'rgba(37,99,235,.11)',
    r2: '#38BDF8',
    r3: '#1E3A8A',
    danger: '#C62828',
    sucesso: '#1E7B34',
    alerta: '#9A5B00',
    erro: '#C62828',
  },
  dark: {
    bg: '#000000',
    card: '#1C1C1E',
    ink: '#F5F5F7',
    muted: '#9A9AA1',
    sep: 'rgba(120,120,128,.34)',
    fill: '#2C2C2E',
    blue: '#4C8DFF',
    action: '#2563EB',
    onBlue: '#FFFFFF',
    tint: 'rgba(76,141,255,.2)',
    r2: '#5AC8FA',
    r3: '#8E9BFF',
    danger: '#FF6B6B',
    sucesso: '#32D74B',
    alerta: '#FFB340',
    erro: '#FF6B6B',
  },
};

export type Theme = typeof themes.light;

export const fonts = {
  // Pilha do protótipo; no app nativo vale a fonte do sistema.
  system:
    '-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",system-ui,"Segoe UI",Roboto,sans-serif',
  native: Platform.select({ ios: 'System', default: 'sans-serif' }),
};

// Escala de texto: os únicos 6 estilos permitidos nas telas.
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  callout: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, full: 999 } as const;

// Tamanho dos ícones, alinhado à escala de texto.
export const iconSize = { sm: 17, md: 22, lg: 34 } as const;

// Altura mínima de tudo que se toca.
export const touchTarget = 44;

// Sombra leve só no claro; no escuro o card já se destaca do fundo preto.
export const shadow = {
  card: Platform.select({
    ios: { shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 } },
    default: { elevation: 2 },
  }),
  none: {},
} as const;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? themes.dark : themes.light;
}
