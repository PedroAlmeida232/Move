import {
  chartPoints,
  sortByDate,
  validateWeight,
} from '../../src/domain/weight';

describe('validateWeight', () => {
  it('aceita de 20 a 400 kg (limites inclusivos), com vírgula', () => {
    expect(validateWeight('80,4')).toEqual({ error: null, kg: 80.4 });
    expect(validateWeight('20')).toEqual({ error: null, kg: 20 });
    expect(validateWeight('400')).toEqual({ error: null, kg: 400 });
  });

  it.each(['', 'abc', '19,9', '400,1', '-80'])('recusa "%s"', (texto) => {
    expect(validateWeight(texto)).toEqual({
      error: 'Informe um peso entre 20 e 400 kg.',
      kg: null,
    });
  });
});

describe('sortByDate', () => {
  it('ordena do mais antigo ao mais recente sem mudar a lista original', () => {
    const entries = [
      { date: '2026-11-20', kg: 80 },
      { date: '2026-11-01', kg: 82 },
    ];
    expect(sortByDate(entries).map((e) => e.date)).toEqual([
      '2026-11-01',
      '2026-11-20',
    ]);
    expect(entries[0].date).toBe('2026-11-20');
  });
});

describe('chartPoints', () => {
  const box = { width: 300, height: 100, padding: 10 };

  it('sem registros não há pontos', () => {
    expect(chartPoints([], box)).toEqual({ points: [], min: 0, max: 0 });
  });

  it('um registro fica no centro', () => {
    const { points } = chartPoints([{ date: '2026-11-20', kg: 80 }], box);
    expect(points).toEqual([{ x: 150, y: 50, date: '2026-11-20', kg: 80 }]);
  });

  it('distribui na largura e põe o maior peso em cima e o menor embaixo', () => {
    const { points, min, max } = chartPoints(
      [
        { date: '2026-11-01', kg: 82 },
        { date: '2026-11-10', kg: 81 },
        { date: '2026-11-20', kg: 80 },
      ],
      box,
    );
    expect(min).toBe(80);
    expect(max).toBe(82);
    expect(points.map((p) => [p.x, p.y])).toEqual([
      [10, 10],
      [150, 50],
      [290, 90],
    ]);
  });

  it('pesos quase iguais ganham uma margem para a linha não ficar colada', () => {
    const { min, max, points } = chartPoints(
      [
        { date: '2026-11-01', kg: 80 },
        { date: '2026-11-02', kg: 80.2 },
      ],
      box,
    );
    expect(min).toBeCloseTo(79.85);
    expect(max).toBeCloseTo(80.35);
    expect(points[0].y).toBeGreaterThan(10);
    expect(points[1].y).toBeLessThan(90);
  });
});
