import type { Macros, MealInput } from '../../domain/diet';
import { apiFetch } from '../../lib/api';
import { todayKey } from '../../lib/time';

export type Meal = MealInput & { id: string; date: string };
export type DayMeals = { meals: Meal[]; goals: Macros };

/** A API só guarda meta de calorias e proteína; as de carboidrato e gordura são do app. */
const CARBS_GOAL = 220;
const FAT_GOAL = 60;

type MealResponse = {
  id: string;
  date: string;
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

function toMeal(m: MealResponse): Meal {
  return {
    id: m.id,
    date: m.date,
    name: m.name,
    kcal: m.kcal,
    protein: m.proteinG,
    carbs: m.carbsG,
    fat: m.fatG,
  };
}

export async function getMeals(date: string): Promise<DayMeals> {
  const resposta = await apiFetch(`/api/v1/meals?date=${date}`);
  if (!resposta.ok)
    throw new Error(`Falha ao carregar as refeições (${resposta.status})`);
  const body: {
    meals: MealResponse[];
    goals: { kcal: number; proteinG: number };
  } = await resposta.json();
  return {
    meals: body.meals.map(toMeal),
    goals: {
      kcal: body.goals.kcal,
      protein: body.goals.proteinG,
      carbs: CARBS_GOAL,
      fat: FAT_GOAL,
    },
  };
}

/**
 * Provisório: a API ainda não lista refeições de vários dias (pedido em
 * docs/fila-backend.md). Por enquanto traz só o dia de hoje e as metas.
 */
export function getMealHistory(): Promise<DayMeals> {
  return getMeals(todayKey());
}

export async function postMeal(
  meal: MealInput & { date: string },
): Promise<Meal> {
  const resposta = await apiFetch('/api/v1/meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: meal.date,
      name: meal.name,
      kcal: meal.kcal,
      proteinG: meal.protein,
      carbsG: meal.carbs,
      fatG: meal.fat,
    }),
  });
  if (!resposta.ok)
    throw new Error(`Falha ao salvar a refeição (${resposta.status})`);
  return toMeal(await resposta.json());
}
