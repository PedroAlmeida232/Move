import { levelFor, type LevelInfo } from './level';
import { bestStreak, dayKey, streak } from './streak';
import { xpFor } from './xp';

export type ProgressInput = {
  sessions: {
    performedAt: string;
    finished: boolean;
    sets: { done: boolean }[];
  }[];
  meals: { date: string; protein: number }[];
  weights: { date: string }[];
  proteinGoal: number;
  /** Dias da semana sem exercício no plano (0 = domingo). */
  restWeekdays: number[];
  today: string;
  timeZone: string;
};

export type Progress = {
  xp: number;
  level: LevelInfo;
  streak: number;
  bestStreak: number;
  workouts: number;
};

/** XP, nível, sequência e treinos completos, calculados só a partir dos dados. */
export function summarize(input: ProgressInput): Progress {
  const sessions = input.sessions.map((s) => ({
    completedSets: s.sets.filter((set) => set.done).length,
    finished: s.finished,
    day: dayKey(new Date(s.performedAt), input.timeZone),
  }));
  const xp = xpFor(sessions, input.meals, input.weights, input.proteinGoal);
  const trainedDays = sessions
    .filter((s) => s.completedSets > 0)
    .map((s) => s.day);

  return {
    xp,
    level: levelFor(xp),
    streak: streak(trainedDays, input.today, input.restWeekdays),
    bestStreak: bestStreak(trainedDays, input.restWeekdays),
    workouts: sessions.filter((s) => s.finished).length,
  };
}
