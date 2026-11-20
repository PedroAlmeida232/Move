import type { Macros, MealInput } from '../../domain/diet';
import { apiFetch } from '../../lib/api';

export type Meal = MealInput & { id: string; date: string };
export type DayMeals = { meals: Meal[]; goals: Macros };

async function fetchMeals(path: string): Promise<DayMeals> {
  const resposta = await apiFetch(path);
  if (!resposta.ok)
    throw new Error(`Falha ao carregar as refeições (${resposta.status})`);
  return resposta.json();
}

export function getMeals(date: string): Promise<DayMeals> {
  return fetchMeals(`/api/v1/meals?date=${date}`);
}

/** Todas as refeições do histórico e as metas atuais. */
export function getMealHistory(): Promise<DayMeals> {
  return fetchMeals('/api/v1/meals');
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
