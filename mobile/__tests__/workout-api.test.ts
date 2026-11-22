import { apiFetch } from '../src/lib/api';
import { getPlan, postWorkout } from '../src/features/workout/api';

jest.mock('../src/lib/api', () => ({ apiFetch: jest.fn() }));

const mockFetch = apiFetch as jest.Mock;
const resposta = (status: number, body?: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => jest.resetAllMocks());

describe('getPlan', () => {
  it('busca GET /api/v1/plan e dá um id a cada exercício', async () => {
    mockFetch.mockResolvedValue(
      resposta(200, {
        profile: { name: 'Pedro', goal: 'Hipertrofia' },
        trainingDays: [1],
        days: [
          {
            weekday: 1,
            name: 'Costas',
            exercises: [
              { name: 'Remada', sets: 3, reps: '8-10', side: null, note: null },
              { name: 'Remada', sets: 3, reps: '8-10', side: null, note: 'x' },
            ],
          },
        ],
      }),
    );

    await expect(getPlan()).resolves.toEqual({
      days: [
        {
          weekday: 1,
          name: 'Costas',
          exercises: [
            {
              id: '1-0',
              name: 'Remada',
              sets: 3,
              reps: '8-10',
              side: null,
              note: null,
            },
            {
              id: '1-1',
              name: 'Remada',
              sets: 3,
              reps: '8-10',
              side: null,
              note: 'x',
            },
          ],
        },
      ],
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/plan');
  });

  it('falha quando a API responde com erro', async () => {
    mockFetch.mockResolvedValue(resposta(500));

    await expect(getPlan()).rejects.toThrow('Falha ao carregar o plano (500)');
  });
});

describe('postWorkout', () => {
  const workout = {
    performedAt: '2026-11-20T21:30:00.000Z',
    finished: true,
    sets: [
      { exerciseId: 'a', setNumber: 1, kg: 10, reps: 8, done: true },
      { exerciseId: 'a', setNumber: 2, kg: 10, reps: 7, done: true },
      { exerciseId: 'a', setNumber: 3, kg: null, reps: null, done: false },
      { exerciseId: 'b', setNumber: 1, kg: 0, reps: 12, done: true },
      { exerciseId: 'b', setNumber: 2, kg: null, reps: 10, done: true },
      { exerciseId: 'b', setNumber: 3, kg: null, reps: null, done: true },
    ],
  };
  const nomes = { a: 'Remada', b: 'Rosca' };

  it('envia só as séries concluídas, com o nome do exercício e 0 no que ficou em branco', async () => {
    mockFetch.mockResolvedValue(resposta(201, { id: 'w1' }));

    await postWorkout(workout, nomes);

    const [path, init] = mockFetch.mock.calls[0];
    expect(path).toBe('/api/v1/workouts');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({
      performedAt: '2026-11-20T21:30:00.000Z',
      sets: [
        { exercise: 'Remada', weightKg: 10, reps: 8 },
        { exercise: 'Remada', weightKg: 10, reps: 7 },
        { exercise: 'Rosca', weightKg: 0, reps: 12 },
        { exercise: 'Rosca', weightKg: 0, reps: 10 },
        { exercise: 'Rosca', weightKg: 0, reps: 0 },
      ],
    });
  });

  it('falha quando a API recusa o treino', async () => {
    mockFetch.mockResolvedValue(resposta(400));

    await expect(postWorkout(workout, nomes)).rejects.toThrow(
      'Falha ao salvar o treino (400)',
    );
  });
});
