import { getMeals, postMeal } from '../src/features/meal/api';
import { getWeights, putWeight } from '../src/features/weight/api';
import { apiFetch } from '../src/lib/api';

jest.mock('../src/lib/api', () => ({ apiFetch: jest.fn() }));

const mockFetch = apiFetch as jest.Mock;
const resposta = (status: number, body?: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => jest.resetAllMocks());

describe('refeições', () => {
  it('getMeals busca o dia e converte para o formato do app', async () => {
    mockFetch.mockResolvedValue(
      resposta(200, {
        date: '2026-11-20',
        meals: [
          {
            id: 'm1',
            date: '2026-11-20',
            name: 'Almoço',
            kcal: 650,
            proteinG: 42.5,
            carbsG: 70,
            fatG: 18,
          },
        ],
        totals: { kcal: 650, proteinG: 42.5, carbsG: 70, fatG: 18 },
        goals: { kcal: 2000, proteinG: 140 },
        remaining: { kcal: 1350, proteinG: 97.5 },
      }),
    );

    await expect(getMeals('2026-11-20')).resolves.toEqual({
      meals: [
        {
          id: 'm1',
          date: '2026-11-20',
          name: 'Almoço',
          kcal: 650,
          protein: 42.5,
          carbs: 70,
          fat: 18,
        },
      ],
      goals: { kcal: 2000, protein: 140, carbs: 220, fat: 60 },
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/meals?date=2026-11-20');
  });

  it('postMeal envia os campos do backend e devolve a refeição criada', async () => {
    const meal = {
      date: '2026-11-20',
      name: 'Almoço',
      kcal: 650,
      protein: 42,
      carbs: 70,
      fat: 18,
    };
    mockFetch.mockResolvedValue(
      resposta(201, {
        id: 'm1',
        date: '2026-11-20',
        name: 'Almoço',
        kcal: 650,
        proteinG: 42,
        carbsG: 70,
        fatG: 18,
      }),
    );

    await expect(postMeal(meal)).resolves.toEqual({ id: 'm1', ...meal });
    const [path, init] = mockFetch.mock.calls[0];
    expect(path).toBe('/api/v1/meals');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({
      date: '2026-11-20',
      name: 'Almoço',
      kcal: 650,
      proteinG: 42,
      carbsG: 70,
      fatG: 18,
    });
  });

  it('falha com o status quando a API responde com erro', async () => {
    mockFetch.mockResolvedValue(resposta(500));
    await expect(getMeals('2026-11-20')).rejects.toThrow(
      'Falha ao carregar as refeições (500)',
    );

    mockFetch.mockResolvedValue(resposta(400));
    await expect(
      postMeal({
        date: '2026-11-20',
        name: 'x',
        kcal: 1,
        protein: 0,
        carbs: 0,
        fat: 0,
      }),
    ).rejects.toThrow('Falha ao salvar a refeição (400)');
  });
});

describe('peso', () => {
  afterEach(() => jest.useRealTimers());

  it('getWeights busca o período pedido e converte weightKg em kg', async () => {
    mockFetch.mockResolvedValue(
      resposta(200, [{ date: '2026-11-20', weightKg: 80.4, waistCm: null }]),
    );

    await expect(getWeights('2026-08-23', '2026-11-20')).resolves.toEqual([
      { date: '2026-11-20', kg: 80.4, waistCm: null },
    ]);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/weight?from=2026-08-23&to=2026-11-20',
    );
  });

  it('getWeights sem período pede o último ano (o backend exige from e to)', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-20T15:00:00Z'));
    mockFetch.mockResolvedValue(resposta(200, []));

    await expect(getWeights()).resolves.toEqual([]);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/weight?from=2025-11-20&to=2026-11-20',
    );
  });

  it('putWeight envia weightKg e devolve o registro convertido', async () => {
    mockFetch.mockResolvedValue(
      resposta(200, { date: '2026-11-20', weightKg: 80.4, waistCm: null }),
    );

    await expect(putWeight('2026-11-20', 80.4)).resolves.toEqual({
      date: '2026-11-20',
      kg: 80.4,
      waistCm: null,
    });
    const [path, init] = mockFetch.mock.calls[0];
    expect(path).toBe('/api/v1/weight/2026-11-20');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ weightKg: 80.4, waistCm: null });
  });

  it('falha com o status quando a API responde com erro', async () => {
    mockFetch.mockResolvedValue(resposta(503));
    await expect(getWeights('a', 'b')).rejects.toThrow(
      'Falha ao carregar o peso (503)',
    );

    mockFetch.mockResolvedValue(resposta(400));
    await expect(putWeight('2026-11-20', 500)).rejects.toThrow(
      'Falha ao salvar o peso (400)',
    );
  });
});
