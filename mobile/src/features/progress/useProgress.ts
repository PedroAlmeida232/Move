import { summarize, type Progress } from '../../domain/progress';
import { restWeekdays } from '../../domain/workout';
import { deviceTimeZone } from '../../lib/time';
import { useResource } from '../../lib/useResource';
import { getMealHistory, type DayMeals } from '../meal/api';
import { getWeights, type WeightRecord } from '../weight/api';
import {
  getPlan,
  getWorkouts,
  type Plan,
  type WorkoutInput,
} from '../workout/api';

import { getAchievements, type UnlockedAchievement } from './api';

export type ProgressData = {
  plan: Plan;
  sessions: WorkoutInput[];
  meals: DayMeals;
  weights: WeightRecord[];
  achievements: UnlockedAchievement[];
};

async function loadProgress(): Promise<ProgressData> {
  const [plan, sessions, meals, weights, achievements] = await Promise.all([
    getPlan(),
    getWorkouts(),
    getMealHistory(),
    getWeights(),
    getAchievements(),
  ]);
  return { plan, sessions, meals, weights, achievements };
}

/** Todo o histórico necessário para XP, nível, sequência e conquistas. */
export function useProgress() {
  return useResource(loadProgress);
}

export function progressOf(data: ProgressData, today: string): Progress {
  return summarize({
    sessions: data.sessions,
    meals: data.meals.meals,
    weights: data.weights,
    proteinGoal: data.meals.goals.protein,
    restWeekdays: restWeekdays(data.plan.days),
    today,
    timeZone: deviceTimeZone(),
  });
}

export function withSession(
  data: ProgressData,
  session: WorkoutInput,
): ProgressData {
  return { ...data, sessions: [...data.sessions, session] };
}
