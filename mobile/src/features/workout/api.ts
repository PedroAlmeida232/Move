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

type PlanResponse = {
  days: {
    weekday: number;
    name: string;
    exercises: Omit<PlanExercise, 'id'>[];
  }[];
};

/** A API não numera os exercícios; o id é `dia-posição`, único no plano. */
export async function getPlan(): Promise<Plan> {
  const resposta = await apiFetch('/api/v1/plan');
  if (!resposta.ok)
    throw new Error(`Falha ao carregar o plano (${resposta.status})`);
  const body: PlanResponse = await resposta.json();
  return {
    days: body.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((e, i) => ({
        ...e,
        id: `${day.weekday}-${i}`,
      })),
    })),
  };
}

/**
 * Só as séries concluídas vão para a API, com o nome do exercício
 * (`nomes` traduz o id do plano). Carga ou repetições em branco vão como 0.
 */
export async function postWorkout(
  workout: WorkoutInput,
  nomes: Record<string, string>,
): Promise<void> {
  const sets = workout.sets
    .filter((s) => s.done)
    .map((s) => ({
      exercise: nomes[s.exerciseId],
      weightKg: s.kg ?? 0,
      reps: s.reps ?? 0,
    }));
  const resposta = await apiFetch('/api/v1/workouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ performedAt: workout.performedAt, sets }),
  });
  if (!resposta.ok)
    throw new Error(`Falha ao salvar o treino (${resposta.status})`);
}

export type WorkoutSession = WorkoutInput & { id: string };

type WorkoutResponse = {
  id: string;
  performedAt: string;
  sets: { exercise: string; weightKg: number; reps: number }[];
};

const DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Treinos do último ano (a API exige `from` e `to`, até 366 dias). Toda sessão
 * salva é de treino concluído e só tem séries feitas.
 */
export async function getWorkouts(): Promise<WorkoutSession[]> {
  const fim = new Date(Date.now() + DIA_MS);
  const inicio = new Date(fim.getTime() - 365 * DIA_MS);
  const resposta = await apiFetch(
    `/api/v1/workouts?from=${inicio.toISOString()}&to=${fim.toISOString()}`,
  );
  if (!resposta.ok)
    throw new Error(`Falha ao carregar os treinos (${resposta.status})`);
  const body: WorkoutResponse[] = await resposta.json();
  return body.map((w) => ({
    id: w.id,
    performedAt: w.performedAt,
    finished: true,
    sets: w.sets.map((s, i) => ({
      exerciseId: s.exercise,
      setNumber: i + 1,
      kg: s.weightKg,
      reps: s.reps,
      done: true,
    })),
  }));
}
