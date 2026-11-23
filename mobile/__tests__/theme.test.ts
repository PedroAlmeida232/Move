import { fonts, radius, shadow, space, themes, type } from '../src/lib/theme';

// Luminância relativa e razão de contraste (WCAG 2.1), sem biblioteca.
function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(n.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('tema', () => {
  it('usa o azul do protótipo no claro e no escuro', () => {
    expect(themes.light.blue).toBe('#2563EB');
    expect(themes.dark.blue).toBe('#4C8DFF');
  });

  it('usa fundo claro e fundo preto', () => {
    expect(themes.light.bg).toBe('#F2F2F7');
    expect(themes.dark.bg).toBe('#000000');
  });

  it('tem as mesmas chaves nas duas variantes', () => {
    expect(Object.keys(themes.dark).sort()).toEqual(
      Object.keys(themes.light).sort(),
    );
  });

  it('define a fonte do sistema', () => {
    expect(fonts.system).toContain('system-ui');
  });
});

describe('escala de texto', () => {
  it('tem exatamente 6 estilos', () => {
    expect(Object.keys(type).sort()).toEqual(
      ['body', 'callout', 'caption', 'headline', 'largeTitle', 'title'].sort(),
    );
  });

  it.each([
    ['largeTitle', 34],
    ['title', 22],
    ['headline', 17],
    ['body', 17],
    ['callout', 15],
    ['caption', 13],
  ] as const)('%s tem tamanho %i e altura de linha maior que o tamanho', (k, size) => {
    expect(type[k].fontSize).toBe(size);
    expect(type[k].lineHeight).toBeGreaterThan(size);
  });

  it('destaque é semibold e corpo é regular', () => {
    expect(type.headline.fontWeight).toBe('600');
    expect(type.body.fontWeight).toBe('400');
  });
});

describe('espaços, raios e sombra', () => {
  it('usa só 4, 8, 12, 16, 24 e 32', () => {
    expect(Object.values(space).sort((a, b) => a - b)).toEqual([4, 8, 12, 16, 24, 32]);
  });

  it('define raios e sombra de card', () => {
    expect(radius.lg).toBeGreaterThan(radius.md);
    expect(shadow.card).toBeDefined();
  });
});

describe('cores', () => {
  const textColors = ['ink', 'muted', 'blue', 'danger', 'sucesso', 'alerta', 'erro'] as const;

  describe.each(['light', 'dark'] as const)('tema %s', (mode) => {
    const t = themes[mode];

    it('tem cores de sucesso, alerta e erro', () => {
      expect(t.sucesso).toMatch(/^#[0-9A-F]{6}$/i);
      expect(t.alerta).toMatch(/^#[0-9A-F]{6}$/i);
      expect(t.erro).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it.each(textColors)('%s tem contraste AA sobre o fundo e o card', (c) => {
      expect(contrast(t[c], t.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t[c], t.card)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
