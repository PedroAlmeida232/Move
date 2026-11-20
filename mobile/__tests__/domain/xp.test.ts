import { XP, xpFor } from '../../src/domain/xp';

const dia = '2026-11-20';
const refeicoes = (n: number, date = dia, protein = 0) =>
  Array.from({ length: n }, () => ({ date, protein }));

describe('xpFor', () => {
  it('vale 0 com entradas vazias', () => {
    expect(xpFor([], [], [])).toBe(0);
  });

  it('usa os valores do protótipo', () => {
    expect(XP).toEqual({ set: 10, workout: 50, meal: 5, mealCap: 5, prot: 30, weight: 15 });
  });

  it('soma 10 por série concluída e 50 por treino concluído', () => {
    const sessions = [
      { completedSets: 12, finished: true },
      { completedSets: 3, finished: false },
    ];
    expect(xpFor(sessions, [], [])).toBe(15 * 10 + 1 * 50);
  });

  it('soma 5 por refeição', () => {
    expect(xpFor([], refeicoes(3), [])).toBe(15);
  });

  it('limita as refeições a 5 por dia, mas cada dia tem o seu limite', () => {
    const meals = [...refeicoes(7, '2026-11-19'), ...refeicoes(2, '2026-11-20')];
    expect(xpFor([], meals, [])).toBe(5 * 5 + 2 * 5);
  });

  it('soma 15 por peso registrado', () => {
    expect(xpFor([], [], [{ date: '2026-11-20' }, { date: '2026-11-13' }])).toBe(30);
  });

  it('dá 30 de bônus uma vez por dia em que a proteína bate a meta (limite inclusivo)', () => {
    const meals = [
      { date: '2026-11-19', protein: 60 },
      { date: '2026-11-19', protein: 60 },
      { date: '2026-11-20', protein: 119 },
    ];
    expect(xpFor([], meals, [], 120)).toBe(3 * 5 + 30);
  });

  it('não dá bônus de proteína sem meta (meta 0 ou omitida)', () => {
    const meals = refeicoes(1, dia, 200);
    expect(xpFor([], meals, [], 0)).toBe(5);
    expect(xpFor([], meals, [])).toBe(5);
  });
});
