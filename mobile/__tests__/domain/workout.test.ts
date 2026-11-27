import {
  formatClock,
  formatLastLoad,
  initialSets,
  lastLoads,
  restWeekdays,
  setsToPayload,
  weekdayOf,
  workoutProgress,
  type ExerciseSets,
} from '../../src/domain/workout';

describe('weekdayOf', () => {
  it('devolve o dia da semana de um dia do calendário (0 = domingo)', () => {
    expect(weekdayOf('2026-11-22')).toBe(0);
    expect(weekdayOf('2026-11-20')).toBe(5);
    expect(weekdayOf('2026-11-21')).toBe(6);
    expect(weekdayOf('2024-02-29')).toBe(4);
  });
});

describe('initialSets', () => {
  it('cria uma série vazia e não feita por série do plano', () => {
    expect(initialSets(3)).toEqual([
      { kg: '', reps: '', done: false },
      { kg: '', reps: '', done: false },
      { kg: '', reps: '', done: false },
    ]);
  });

  it('garante ao menos 1 série', () => {
    expect(initialSets(0)).toHaveLength(1);
    expect(initialSets(-2)).toHaveLength(1);
  });
});

describe('workoutProgress', () => {
  const ex = (...done: boolean[]): ExerciseSets => ({
    exerciseId: 'x',
    sets: done.map((d) => ({ kg: '', reps: '', done: d })),
  });

  it('sem exercícios, não há progresso nem treino completo', () => {
    expect(workoutProgress([])).toEqual({
      done: 0,
      total: 0,
      pct: 0,
      complete: false,
    });
  });

  it('conta séries feitas, porcentagem arredondada e se está completo', () => {
    expect(workoutProgress([ex(true, false), ex(false)])).toEqual({
      done: 1,
      total: 3,
      pct: 33,
      complete: false,
    });
    expect(workoutProgress([ex(true, true), ex(true)])).toEqual({
      done: 3,
      total: 3,
      pct: 100,
      complete: true,
    });
  });
});

describe('setsToPayload', () => {
  it('numera as séries e converte carga e repetições (vírgula decimal aceita)', () => {
    const payload = setsToPayload([
      {
        exerciseId: 'a',
        sets: [
          { kg: '12,5', reps: '10', done: true },
          { kg: '', reps: '', done: false },
        ],
      },
      { exerciseId: 'b', sets: [{ kg: 'abc', reps: '8', done: true }] },
    ]);

    expect(payload).toEqual([
      { exerciseId: 'a', setNumber: 1, kg: 12.5, reps: 10, done: true },
      { exerciseId: 'a', setNumber: 2, kg: null, reps: null, done: false },
      { exerciseId: 'b', setNumber: 1, kg: null, reps: 8, done: true },
    ]);
  });

  it('nunca envia carga ou repetições negativas', () => {
    const [set] = setsToPayload([
      { exerciseId: 'a', sets: [{ kg: '-5', reps: '-1', done: true }] },
    ]);

    expect(set).toMatchObject({ kg: null, reps: null });
  });

  it('repetições são números inteiros', () => {
    const [set] = setsToPayload([
      { exerciseId: 'a', sets: [{ kg: '10', reps: '8,7', done: true }] },
    ]);

    expect(set.reps).toBe(8);
  });
});

describe('restWeekdays', () => {
  const dia = (weekday: number, exercicios: number) => ({
    weekday,
    exercises: Array.from({ length: exercicios }, () => ({})),
  });

  it('são os dias da semana sem exercício no plano', () => {
    expect(restWeekdays([dia(1, 3), dia(3, 2), dia(5, 0)])).toEqual([
      0, 2, 4, 5, 6,
    ]);
  });

  it('sem plano (ou plano sem exercícios), nenhum dia é descanso', () => {
    expect(restWeekdays([])).toEqual([]);
    expect(restWeekdays([dia(2, 0)])).toEqual([]);
  });
});

describe('lastLoads', () => {
  const serie = (exerciseId: string, kg: number | null, reps: number | null, done = true) => ({
    exerciseId,
    setNumber: 1,
    kg,
    reps,
    done,
  });
  const treino = (performedAt: string, sets: ReturnType<typeof serie>[], finished = true) => ({
    performedAt,
    finished,
    sets,
  });

  it('por exercício, a série mais pesada do treino concluído mais recente', () => {
    expect(
      lastLoads([
        treino('2026-11-10T12:00:00Z', [serie('e1', 20, 8)]),
        treino('2026-11-17T12:00:00Z', [serie('e1', 12.5, 10), serie('e1', 15, 6)]),
      ]),
    ).toEqual({ e1: { kg: 15, reps: 6 } });
  });

  it('com a mesma carga, vale a série com mais repetições', () => {
    expect(
      lastLoads([treino('2026-11-17T12:00:00Z', [serie('e1', 15, 6), serie('e1', 15, 9)])]),
    ).toEqual({ e1: { kg: 15, reps: 9 } });
  });

  it('ignora treinos não concluídos, séries sem carga e séries não feitas', () => {
    expect(
      lastLoads([
        treino('2026-11-10T12:00:00Z', [serie('e1', 10, 10)]),
        treino('2026-11-18T12:00:00Z', [serie('e1', 30, 5)], false),
        treino('2026-11-17T12:00:00Z', [serie('e1', null, 12), serie('e1', 40, 3, false)]),
      ]),
    ).toEqual({ e1: { kg: 10, reps: 10 } });
  });

  it('cada exercício olha o seu último treino', () => {
    expect(
      lastLoads([
        treino('2026-11-10T12:00:00Z', [serie('e1', 10, 10), serie('e2', 50, 5)]),
        treino('2026-11-17T12:00:00Z', [serie('e1', 12, 10)]),
      ]),
    ).toEqual({ e1: { kg: 12, reps: 10 }, e2: { kg: 50, reps: 5 } });
  });

  it('sem histórico, vazio', () => {
    expect(lastLoads([])).toEqual({});
  });
});

describe('formatLastLoad', () => {
  it('carga com vírgula e repetições quando houver', () => {
    expect(formatLastLoad({ kg: 12.5, reps: 10 })).toBe('12,5 kg × 10');
    expect(formatLastLoad({ kg: 20, reps: null })).toBe('20 kg');
  });
});

describe('formatClock', () => {
  it('minutos e segundos com dois dígitos', () => {
    expect(formatClock(90)).toBe('1:30');
    expect(formatClock(59)).toBe('0:59');
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(605)).toBe('10:05');
  });
});
