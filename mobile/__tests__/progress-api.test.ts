import { getMealHistory } from '../src/features/meal/api';
import { getAchievements } from '../src/features/progress/api';
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
  beforeEach(() =>
    jest.useFakeTimers().setSystemTime(new Date('2026-11-20T15:00:00Z')),
  );
  afterEach(() => jest.useRealTimers());

  it('getWorkouts pede o último ano e converte as sessões', async () => {
    mockFetch.mockResolvedValue(
      resposta(200, [
        {
          id: 'w1',
          performedAt: '2026-11-19T21:30:00Z',
          name: null,
          sets: [{ exercise: 'Remada', weightKg: 40, reps: 8 }],
        },
      ]),
    );

    await expect(getWorkouts()).resolves.toEqual([
      {
        id: 'w1',
        performedAt: '2026-11-19T21:30:00Z',
        finished: true,
        sets: [
          { exerciseId: 'Remada', setNumber: 1, kg: 40, reps: 8, done: true },
        ],
      },
    ]);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/workouts?from=2025-11-21T15:00:00.000Z&to=2026-11-21T15:00:00.000Z',
    );
  });

  it('getMealHistory traz o dia de hoje enquanto não há histórico na API', async () => {
    mockFetch.mockResolvedValue(
      resposta(200, {
        date: '2026-11-20',
        meals: [],
        totals: { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
        goals: { kcal: 2000, proteinG: 140 },
        remaining: { kcal: 2000, proteinG: 140 },
      }),
    );

    await expect(getMealHistory()).resolves.toEqual({
      meals: [],
      goals: { kcal: 2000, protein: 140, carbs: 220, fat: 60 },
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/meals?date=2026-11-20');
  });

  it('getAchievements devolve só as desbloqueadas, com o código do app', async () => {
    mockFetch.mockResolvedValue(
      resposta(200, [
        {
          code: 'FIRST',
          name: 'Primeiro treino',
          description: 'x',
          unlockedAt: '2026-11-20T21:30:05Z',
        },
        { code: 'STREAK_7', name: '7', description: 'x', unlockedAt: null },
        {
          code: 'PROT_5',
          name: 'P',
          description: 'x',
          unlockedAt: '2026-11-21T10:00:00Z',
        },
      ]),
    );

    await expect(getAchievements()).resolves.toEqual([
      { code: 'first', unlockedAt: '2026-11-20T21:30:05Z' },
      { code: 'prot5', unlockedAt: '2026-11-21T10:00:00Z' },
    ]);
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
