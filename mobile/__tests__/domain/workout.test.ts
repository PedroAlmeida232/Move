import {
  initialSets,
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
