import type { SetPayload } from '../../domain/workout';
import { apiFetch } from '../../lib/api';

export type PlanExercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  side?: string | null;
  note?: string | null;
};
export type PlanDay = {
  weekday: number;
  name: string;
  exercises: PlanExercise[];
};
export type Plan = { days: PlanDay[] };

export type WorkoutInput = {
  performedAt: string;
  finished: boolean;
  sets: SetPayload[];
};

export async function getPlan(): Promise<Plan> {
  const resposta = await apiFetch('/api/v1/plan');
  if (!resposta.ok)
    throw new Error(`Falha ao carregar o plano (${resposta.status})`);
  return resposta.json();
}

export async function postWorkout(workout: WorkoutInput): Promise<void> {
  const resposta = await apiFetch('/api/v1/workouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workout),
  });
  if (!resposta.ok)
    throw new Error(`Falha ao salvar o treino (${resposta.status})`);
}
