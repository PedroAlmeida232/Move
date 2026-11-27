import { dayKey } from './streak';

export type Mission = { id: string; title: string; done: boolean };

/** "Bom dia", "Boa tarde" ou "Boa noite", com o primeiro nome quando houver. */
export function greeting(hour: number, displayName?: string | null): string {
  const text =
    hour >= 5 && hour < 12
      ? 'Bom dia'
      : hour >= 12 && hour < 18
        ? 'Boa tarde'
        : 'Boa noite';
  const first = displayName?.trim().split(/\s+/)[0];
  return first ? `${text}, ${first}` : text;
}

export type MissionsInput = {
  today: string;
  timeZone: string;
  /** O plano tem exercícios no dia da semana de hoje. */
  trainingDay: boolean;
  sessions: { performedAt: string; finished: boolean }[];
  meals: { date: string; protein: number }[];
  weights: { date: string }[];
  proteinGoal: number;
};

/** As três missões do dia, como no protótipo. */
export function dayMissions(input: MissionsInput): Mission[] {
  const mealsToday = input.meals.filter((m) => m.date === input.today);
  const protein = mealsToday.reduce((sum, m) => sum + m.protein, 0);
  const first: Mission = input.trainingDay
    ? {
        id: 'treino',
        title: 'Complete o treino do dia',
        done: input.sessions.some(
          (s) =>
            s.finished &&
            dayKey(new Date(s.performedAt), input.timeZone) === input.today,
        ),
      }
    : {
        id: 'peso',
        title: 'Registre seu peso',
        done: input.weights.some((w) => w.date === input.today),
      };
  return [
    first,
    {
      id: 'proteina',
      title: 'Bata a meta de proteína',
      done: input.proteinGoal > 0 && protein >= input.proteinGoal,
    },
    {
      id: 'refeicoes',
      title: 'Registre 3 refeições',
      done: mealsToday.length >= 3,
    },
  ];
}

export function missionsPct(missions: Mission[]): number {
  if (missions.length === 0) return 0;
  return Math.round(
    (missions.filter((m) => m.done).length / missions.length) * 100,
  );
}
