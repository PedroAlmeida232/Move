import type { Macros, MealInput } from '../../domain/diet';
import { apiFetch } from '../../lib/api';

export type Meal = MealInput & { id: string; date: string };
export type DayMeals = { meals: Meal[]; goals: Macros };

export async function getMeals(date: string): Promise<DayMeals> {
  const resposta = await apiFetch(`/api/v1/meals?date=${date}`);
  if (!resposta.ok)
    throw new Error(`Falha ao carregar as refeições (${resposta.status})`);
  return resposta.json();
}

export async function postMeal(
  meal: MealInput & { date: string },
): Promise<Meal> {
  const resposta = await apiFetch('/api/v1/meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meal),
  });
  if (!resposta.ok)
    throw new Error(`Falha ao salvar a refeição (${resposta.status})`);
  return resposta.json();
}
