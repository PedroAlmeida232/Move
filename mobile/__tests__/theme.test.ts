import { fonts, themes } from '../src/lib/theme';

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
