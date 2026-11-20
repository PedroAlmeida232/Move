import { getMealHistory } from '../src/features/meal/api';
import { getAchievements } from '../src/features/progress/api';
import { getWeights } from '../src/features/weight/api';
import { getWorkouts } from '../src/features/workout/api';
import { apiFetch } from '../src/lib/api';

jest.mock('../src/lib/api', () => ({ apiFetch: jest.fn() }));

const mockFetch = apiFetch as jest.Mock;
const resposta = (status: number, body?: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => jest.resetAllMocks());

describe('histórico', () => {
  it('getWorkouts busca todas as sessões', async () => {
    const sessions = [{ id: 'w1', performedAt: 'x', finished: true, sets: [] }];
    mockFetch.mockResolvedValue(resposta(200, { sessions }));

    await expect(getWorkouts()).resolves.toEqual(sessions);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/workouts');
  });

  it('getMealHistory busca todas as refeições e as metas', async () => {
    const body = {
      meals: [],
      goals: { kcal: 2000, protein: 140, carbs: 0, fat: 0 },
    };
    mockFetch.mockResolvedValue(resposta(200, body));

    await expect(getMealHistory()).resolves.toEqual(body);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/meals');
  });

  it('getWeights sem período busca todos os registros', async () => {
    mockFetch.mockResolvedValue(resposta(200, { entries: [] }));

    await expect(getWeights()).resolves.toEqual([]);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/weight');
  });

  it('getAchievements devolve as conquistas desbloqueadas', async () => {
    const achievements = [
      { code: 'first', unlockedAt: '2026-11-20T21:30:05.000Z' },
    ];
    mockFetch.mockResolvedValue(resposta(200, { achievements }));

    await expect(getAchievements()).resolves.toEqual(achievements);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/achievements');
  });

  it.each([
    ['getWorkouts', () => getWorkouts(), 'Falha ao carregar os treinos (500)'],
    [
      'getMealHistory',
      () => getMealHistory(),
      'Falha ao carregar as refeições (500)',
    ],
    [
      'getAchievements',
      () => getAchievements(),
      'Falha ao carregar as conquistas (500)',
    ],
  ])(
    '%s falha com o status quando a API responde com erro',
    async (_nome, chamar, mensagem) => {
      mockFetch.mockResolvedValue(resposta(500));
      await expect(chamar()).rejects.toThrow(mensagem);
    },
  );
});
