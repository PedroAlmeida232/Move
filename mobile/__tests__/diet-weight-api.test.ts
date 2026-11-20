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
  it('getMeals busca as refeições e metas do dia', async () => {
    const body = { meals: [], goals: { kcal: 2000, protein: 140, carbs: 220, fat: 60 } };
    mockFetch.mockResolvedValue(resposta(200, body));

    await expect(getMeals('2026-11-20')).resolves.toEqual(body);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/meals?date=2026-11-20');
  });

  it('postMeal envia a refeição e devolve a criada', async () => {
    const meal = { date: '2026-11-20', name: 'Almoço', kcal: 650, protein: 42, carbs: 70, fat: 18 };
    mockFetch.mockResolvedValue(resposta(201, { id: 'm1', ...meal }));

    await expect(postMeal(meal)).resolves.toEqual({ id: 'm1', ...meal });
    const [path, init] = mockFetch.mock.calls[0];
    expect(path).toBe('/api/v1/meals');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual(meal);
  });

  it('falha com o status quando a API responde com erro', async () => {
    mockFetch.mockResolvedValue(resposta(500));
    await expect(getMeals('2026-11-20')).rejects.toThrow('Falha ao carregar as refeições (500)');

    mockFetch.mockResolvedValue(resposta(400));
    await expect(
      postMeal({ date: '2026-11-20', name: 'x', kcal: 1, protein: 0, carbs: 0, fat: 0 }),
    ).rejects.toThrow('Falha ao salvar a refeição (400)');
  });
});

describe('peso', () => {
  it('getWeights busca o período pedido', async () => {
    const entries = [{ date: '2026-11-20', kg: 80.4, waistCm: null }];
    mockFetch.mockResolvedValue(resposta(200, { entries }));

    await expect(getWeights('2026-08-23', '2026-11-20')).resolves.toEqual(entries);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/weight?from=2026-08-23&to=2026-11-20');
  });

  it('putWeight grava o peso do dia', async () => {
    mockFetch.mockResolvedValue(resposta(200, { date: '2026-11-20', kg: 80.4, waistCm: null }));

    await expect(putWeight('2026-11-20', 80.4)).resolves.toEqual({
      date: '2026-11-20',
      kg: 80.4,
      waistCm: null,
    });
    const [path, init] = mockFetch.mock.calls[0];
    expect(path).toBe('/api/v1/weight/2026-11-20');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ kg: 80.4, waistCm: null });
  });

  it('falha com o status quando a API responde com erro', async () => {
    mockFetch.mockResolvedValue(resposta(503));
    await expect(getWeights('a', 'b')).rejects.toThrow('Falha ao carregar o peso (503)');

    mockFetch.mockResolvedValue(resposta(400));
    await expect(putWeight('2026-11-20', 500)).rejects.toThrow('Falha ao salvar o peso (400)');
  });
});
