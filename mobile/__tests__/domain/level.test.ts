import { LEVELS, levelFor } from '../../src/domain/level';

describe('levelFor', () => {
  it('usa os níveis do protótipo', () => {
    expect(LEVELS.map((l) => [l.name, l.at])).toEqual([
      ['Iniciante', 0],
      ['Ativo', 500],
      ['Focado', 2000],
      ['Forte', 6000],
      ['Elite', 15000],
    ]);
  });

  it('com 0 XP é Iniciante e faltam 500 para Ativo', () => {
    expect(levelFor(0)).toEqual({
      index: 0,
      name: 'Iniciante',
      next: { name: 'Ativo', at: 500 },
      xpToNext: 500,
      pct: 0,
    });
  });

  it('499 XP ainda é Iniciante e 500 XP já é Ativo (limite inclusivo)', () => {
    expect(levelFor(499)).toMatchObject({ index: 0, xpToNext: 1, pct: 100 });
    expect(levelFor(500)).toMatchObject({
      index: 1,
      name: 'Ativo',
      xpToNext: 1500,
      pct: 0,
    });
  });

  it('calcula a porcentagem dentro do nível, arredondada', () => {
    // Ativo: 500 a 2000. 1250 é metade do caminho.
    expect(levelFor(1250)).toMatchObject({ index: 1, xpToNext: 750, pct: 50 });
    // 1 de 3 do caminho entre 500 e 2000 = 33,3%.
    expect(levelFor(1000)).toMatchObject({ pct: 33 });
  });

  it('muda de nível exatamente em cada limite', () => {
    expect(levelFor(1999).name).toBe('Ativo');
    expect(levelFor(2000).name).toBe('Focado');
    expect(levelFor(5999).name).toBe('Focado');
    expect(levelFor(6000).name).toBe('Forte');
    expect(levelFor(14999).name).toBe('Forte');
    expect(levelFor(15000).name).toBe('Elite');
  });

  it('no nível máximo não há próximo, não falta XP e a barra fica cheia', () => {
    expect(levelFor(15000)).toEqual({
      index: 4,
      name: 'Elite',
      next: null,
      xpToNext: 0,
      pct: 100,
    });
    expect(levelFor(99999)).toMatchObject({ index: 4, xpToNext: 0, pct: 100 });
  });

  it('trata XP negativo como 0', () => {
    expect(levelFor(-30)).toMatchObject({ index: 0, xpToNext: 500, pct: 0 });
  });
});
