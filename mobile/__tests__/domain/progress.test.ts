import { summarize } from '../../src/domain/progress';

const SP = 'America/Sao_Paulo';
const sessao = (performedAt: string, done: boolean[], finished = true) => ({
  performedAt,
  finished,
  sets: done.map((d) => ({ done: d })),
});

describe('summarize', () => {
  it('sem histórico: 0 XP, Iniciante, sem sequência', () => {
    expect(
      summarize({
        sessions: [],
        meals: [],
        weights: [],
        proteinGoal: 0,
        restWeekdays: [],
        today: '2026-11-20',
        timeZone: SP,
      }),
    ).toEqual({
      xp: 0,
      level: expect.objectContaining({ index: 0, name: 'Iniciante', xpToNext: 500 }),
      streak: 0,
      bestStreak: 0,
      workouts: 0,
    });
  });

  it('calcula XP, nível, sequência atual, recorde e treinos completos a partir dos dados', () => {
    const result = summarize({
      sessions: [
        // 18/11 e 19/11 completos; 20/11 às 23h30 em SP (já 21/11 em UTC) parcial.
        sessao('2026-11-18T12:00:00Z', [true, true, true]),
        sessao('2026-11-19T12:00:00Z', [true, true]),
        sessao('2026-11-21T02:30:00Z', [true, false], false),
        // sessão aberta sem nenhuma série feita não conta como dia de treino.
        sessao('2026-11-10T12:00:00Z', [false], false),
      ],
      meals: [
        { date: '2026-11-19', protein: 150 },
        { date: '2026-11-20', protein: 20 },
      ],
      weights: [{ date: '2026-11-19' }],
      proteinGoal: 140,
      restWeekdays: [],
      today: '2026-11-20',
      timeZone: SP,
    });

    // séries 3+2+1 = 6 → 60; 2 treinos completos → 100; 2 refeições → 10; proteína 1 dia → 30; peso → 15
    expect(result.xp).toBe(215);
    expect(result.level).toMatchObject({ index: 0, xpToNext: 285 });
    expect(result.streak).toBe(3);
    expect(result.bestStreak).toBe(3);
    expect(result.workouts).toBe(2);
  });
});
