export type Macros = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};
export type MealForm = {
  name: string;
  kcal: string;
  protein: string;
  carbs: string;
  fat: string;
};
export type MealInput = Macros & { name: string };
type MealErrors = Partial<Record<keyof MealForm, string>>;

const POSITIVE = 'Use um número positivo.';

/** Número ≥ 0 a partir do texto digitado (aceita vírgula), ou `null`. */
export function parseAmount(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function validateMeal(form: MealForm): {
  errors: MealErrors;
  meal: MealInput | null;
} {
  const errors: MealErrors = {};
  if (form.name.trim() === '') errors.name = 'Informe o nome da refeição.';

  const kcal = parseAmount(form.kcal);
  if (kcal === null || kcal === 0)
    errors.kcal = 'Informe as calorias (número maior que zero).';

  const macro = (field: 'protein' | 'carbs' | 'fat') => {
    if (form[field].trim() === '') return 0;
    const value = parseAmount(form[field]);
    if (value === null) errors[field] = POSITIVE;
    return value ?? 0;
  };
  const protein = macro('protein');
  const carbs = macro('carbs');
  const fat = macro('fat');

  if (Object.keys(errors).length > 0) return { errors, meal: null };
  return {
    errors,
    meal: { name: form.name.trim(), kcal: kcal as number, protein, carbs, fat },
  };
}

export function dayTotals(meals: Macros[]): Macros {
  return meals.reduce(
    (total, m) => ({
      kcal: total.kcal + m.kcal,
      protein: total.protein + m.protein,
      carbs: total.carbs + m.carbs,
      fat: total.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/** Quanto da meta já foi atingido, em %, de 0 a 100. Sem meta (0), é 0. */
export function goalPct(value: number, goal: number): number {
  return goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
}
