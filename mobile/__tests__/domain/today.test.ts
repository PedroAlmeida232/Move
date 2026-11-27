import { dayMissions, greeting, missionsPct } from '../../src/domain/today';

describe('greeting', () => {
  it.each([
    [4, 'Boa noite'],
    [5, 'Bom dia'],
    [11, 'Bom dia'],
    [12, 'Boa tarde'],
    [17, 'Boa tarde'],
    [18, 'Boa noite'],
    [23, 'Boa noite'],
  ])('às %ih diz "%s"', (hour, text) => {
    expect(greeting(hour)).toBe(text);
  });

  it('usa só o primeiro nome do perfil', () => {
    expect(greeting(9, '  Pedro Rodrigues Almeida ')).toBe('Bom dia, Pedro');
  });

  it('sem nome no perfil, cumprimenta sem nome', () => {
    expect(greeting(9, null)).toBe('Bom dia');
    expect(greeting(9, '   ')).toBe('Bom dia');
  });
});

const TZ = 'America/Sao_Paulo';
const HOJE = '2026-11-27';
const base = {
  today: HOJE,
  timeZone: TZ,
  trainingDay: true,
  sessions: [],
  meals: [],
  weights: [],
  proteinGoal: 120,
};

describe('dayMissions', () => {
  it('dia de treino: treino, proteína e 3 refeições, nada feito', () => {
    expect(dayMissions(base)).toEqual([
      { id: 'treino', title: 'Complete o treino do dia', done: false },
      { id: 'proteina', title: 'Bata a meta de proteína', done: false },
      { id: 'refeicoes', title: 'Registre 3 refeições', done: false },
    ]);
  });

  it('o treino só conta se foi concluído hoje, no fuso do aparelho', () => {
    const ontemTarde = {
      performedAt: '2026-11-27T01:00:00Z', // 22h do dia 26 em São Paulo
      finished: true,
    };
    const parcialHoje = { performedAt: '2026-11-27T12:00:00Z', finished: false };
    expect(
      dayMissions({ ...base, sessions: [ontemTarde, parcialHoje] })[0].done,
    ).toBe(false);

    const hoje = { performedAt: '2026-11-27T12:00:00Z', finished: true };
    expect(dayMissions({ ...base, sessions: [hoje] })[0].done).toBe(true);
  });

  it('dia de descanso: a primeira missão é registrar o peso', () => {
    const descanso = { ...base, trainingDay: false };
    expect(dayMissions(descanso)[0]).toEqual({
      id: 'peso',
      title: 'Registre seu peso',
      done: false,
    });
    expect(
      dayMissions({
        ...descanso,
        weights: [{ date: '2026-11-26' }, { date: HOJE }],
      })[0].done,
    ).toBe(true);
  });

  it('proteína: soma só as refeições de hoje e compara com a meta', () => {
    const meals = [
      { date: '2026-11-26', protein: 200 },
      { date: HOJE, protein: 70 },
      { date: HOJE, protein: 49 },
    ];
    expect(dayMissions({ ...base, meals })[1].done).toBe(false);
    expect(
      dayMissions({ ...base, meals: [...meals, { date: HOJE, protein: 1 }] })[1]
        .done,
    ).toBe(true);
  });

  it('sem meta de proteína, a missão não conta como feita', () => {
    expect(
      dayMissions({
        ...base,
        proteinGoal: 0,
        meals: [{ date: HOJE, protein: 10 }],
      })[1].done,
    ).toBe(false);
  });

  it('3 refeições registradas hoje completam a missão', () => {
    const meal = { date: HOJE, protein: 0 };
    expect(dayMissions({ ...base, meals: [meal, meal] })[2].done).toBe(false);
    expect(dayMissions({ ...base, meals: [meal, meal, meal] })[2].done).toBe(
      true,
    );
  });
});

describe('missionsPct', () => {
  it('é a parte feita, arredondada', () => {
    const m = (done: boolean) => ({ id: 'x', title: 'x', done });
    expect(missionsPct([m(false), m(false), m(false)])).toBe(0);
    expect(missionsPct([m(true), m(false), m(false)])).toBe(33);
    expect(missionsPct([m(true), m(true), m(false)])).toBe(67);
    expect(missionsPct([m(true), m(true), m(true)])).toBe(100);
  });

  it('sem missões é 0', () => {
    expect(missionsPct([])).toBe(0);
  });
});
