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
  it('busca GET /api/v1/plan e devolve os dias', async () => {
    const days = [{ weekday: 1, name: 'Costas', exercises: [] }];
    mockFetch.mockResolvedValue(resposta(200, { days }));

    await expect(getPlan()).resolves.toEqual({ days });
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
    sets: [{ exerciseId: 'a', setNumber: 1, kg: 10, reps: 8, done: true }],
  };

  it('envia POST /api/v1/workouts com JSON', async () => {
    mockFetch.mockResolvedValue(resposta(201, { id: 'w1' }));

    await postWorkout(workout);

    const [path, init] = mockFetch.mock.calls[0];
    expect(path).toBe('/api/v1/workouts');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual(workout);
  });

  it('falha quando a API recusa o treino', async () => {
    mockFetch.mockResolvedValue(resposta(400));

    await expect(postWorkout(workout)).rejects.toThrow(
      'Falha ao salvar o treino (400)',
    );
  });
});
