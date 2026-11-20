export const XP = {
  set: 10,
  workout: 50,
  meal: 5,
  mealCap: 5,
  prot: 30,
  weight: 15,
} as const;

export type WorkoutSession = { completedSets: number; finished: boolean };
export type Meal = { date: string; protein: number };
export type WeightEntry = { date: string };

export function xpFor(
  sessions: WorkoutSession[],
  meals: Meal[],
  weights: WeightEntry[],
  proteinGoal = 0,
): number {
  let xp = 0;
  for (const s of sessions) {
    xp += s.completedSets * XP.set + (s.finished ? XP.workout : 0);
  }

  const proteinByDay = new Map<string, { count: number; protein: number }>();
  for (const m of meals) {
    const day = proteinByDay.get(m.date) ?? { count: 0, protein: 0 };
    day.count += 1;
    day.protein += m.protein;
    proteinByDay.set(m.date, day);
  }
  for (const day of proteinByDay.values()) {
    xp += Math.min(day.count, XP.mealCap) * XP.meal;
    if (proteinGoal > 0 && day.protein >= proteinGoal) xp += XP.prot;
  }

  return xp + weights.length * XP.weight;
}
