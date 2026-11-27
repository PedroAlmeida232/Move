import { exportFileName, exportPayload } from '../../src/domain/export';

describe('exportPayload', () => {
  it('junta os dados da pessoa num formato versionado, com a data da exportação', () => {
    const dados = {
      email: 'pedro@exemplo.com',
      plan: { days: [] },
      workouts: [{ id: 'w1', performedAt: '2026-11-20T15:00:00Z', finished: true, sets: [] }],
      meals: [{ id: 'm1', date: '2026-11-20', name: 'Almoço', kcal: 500, protein: 30, carbs: 50, fat: 10 }],
      goals: { kcal: 2000, protein: 140, carbs: 200, fat: 60 },
      weights: [{ date: '2026-11-20', kg: 80, waistCm: null }],
      achievements: [{ code: 'first', unlockedAt: '2026-11-20T15:05:00Z' }],
    };

    expect(exportPayload(dados, '2026-11-27T20:00:00.000Z')).toEqual({
      app: 'Move',
      formato: 1,
      exportadoEm: '2026-11-27T20:00:00.000Z',
      conta: { email: 'pedro@exemplo.com' },
      plano: dados.plan,
      treinos: dados.workouts,
      refeicoes: dados.meals,
      metas: dados.goals,
      pesos: dados.weights,
      conquistas: dados.achievements,
    });
  });

  it('sem e-mail no perfil, a conta fica sem e-mail', () => {
    const payload = exportPayload(
      {
        email: null,
        plan: { days: [] },
        workouts: [],
        meals: [],
        goals: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
        weights: [],
        achievements: [],
      },
      '2026-11-27T20:00:00.000Z',
    );
    expect(payload.conta).toEqual({ email: null });
  });
});

describe('exportFileName', () => {
  it('leva a data do dia', () => {
    expect(exportFileName('2026-11-27')).toBe('move-dados-2026-11-27.json');
  });
});
