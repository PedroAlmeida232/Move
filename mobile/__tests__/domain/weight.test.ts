import {
  chartPoints,
  rangeStart,
  sortByDate,
  validateWeight,
  weightChange,
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

describe('weightChange', () => {
  const e = (date: string, kg: number) => ({ date, kg });

  it('perda: delta negativo, sinal de menos e tom de perda', () => {
    expect(weightChange([e('2026-11-01', 82), e('2026-11-20', 80.4)])).toEqual({
      delta: -1.6,
      text: '−1,6 kg',
      tone: 'loss',
    });
  });

  it('ganho: sinal de mais e tom de ganho', () => {
    expect(weightChange([e('2026-11-01', 80), e('2026-11-20', 80.6)])).toEqual({
      delta: 0.6,
      text: '+0,6 kg',
      tone: 'gain',
    });
  });

  it('sem mudança, ou só um registro: 0 kg, neutro', () => {
    const flat = { delta: 0, text: '0 kg', tone: 'flat' };
    expect(weightChange([e('2026-11-01', 80), e('2026-11-20', 80.04)])).toEqual(
      flat,
    );
    expect(weightChange([e('2026-11-20', 80)])).toEqual(flat);
    expect(weightChange([])).toEqual(flat);
  });
});

describe('rangeStart', () => {
  it('30 e 90 dias contam hoje; tudo não tem início', () => {
    expect(rangeStart('2026-11-30', '30d')).toBe('2026-11-01');
    expect(rangeStart('2026-11-30', '90d')).toBe('2026-09-01');
    expect(rangeStart('2026-11-30', 'all')).toBeUndefined();
  });
});
