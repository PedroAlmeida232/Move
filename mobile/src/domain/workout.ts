import { formatNumber } from './format';

export type SetEntry = { kg: string; reps: string; done: boolean };
export type ExerciseSets = { exerciseId: string; sets: SetEntry[] };
export type SetPayload = {
  exerciseId: string;
  setNumber: number;
  kg: number | null;
  reps: number | null;
  done: boolean;
};

/** Dia da semana de um `YYYY-MM-DD` (0 = domingo), sem depender do fuso do aparelho. */
export function weekdayOf(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function initialSets(count: number): SetEntry[] {
  return Array.from({ length: Math.max(1, count) }, () => ({
    kg: '',
    reps: '',
    done: false,
  }));
}

export function workoutProgress(exercises: ExerciseSets[]) {
  const sets = exercises.flatMap((e) => e.sets);
  const done = sets.filter((s) => s.done).length;
  const total = sets.length;
  return {
    done,
    total,
    pct: total === 0 ? 0 : Math.round((done / total) * 100),
    complete: total > 0 && done === total,
  };
}

function toNumber(text: string, integer = false): number | null {
  const n = parseFloat(text.replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return null;
  return integer ? Math.trunc(n) : n;
}

export function setsToPayload(exercises: ExerciseSets[]): SetPayload[] {
  return exercises.flatMap(({ exerciseId, sets }) =>
    sets.map((s, i) => ({
      exerciseId,
      setNumber: i + 1,
      kg: toNumber(s.kg),
      reps: toNumber(s.reps, true),
      done: s.done,
    })),
  );
}

/**
 * Dias da semana sem exercício no plano (0 = domingo). Sem plano, nenhum dia é
 * descanso: senão a sequência nunca quebraria.
 */
export function restWeekdays(
  days: { weekday: number; exercises: unknown[] }[],
): number[] {
  const training = new Set(
    days.filter((d) => d.exercises.length > 0).map((d) => d.weekday),
  );
  if (training.size === 0) return [];
  return [0, 1, 2, 3, 4, 5, 6].filter((weekday) => !training.has(weekday));
}

export type LastLoad = { kg: number; reps: number | null };

/**
 * Carga da última vez de cada exercício: a série feita mais pesada (empate: mais repetições)
 * do treino concluído mais recente que tem carga para aquele exercício.
 */
export function lastLoads(
  sessions: { performedAt: string; finished: boolean; sets: SetPayload[] }[],
): Record<string, LastLoad> {
  const newestFirst = sessions
    .filter((s) => s.finished)
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt));
  const result: Record<string, LastLoad> = {};
  const decided = new Set<string>();
  for (const session of newestFirst) {
    const here = new Set<string>();
    for (const set of session.sets) {
      if (!set.done || set.kg === null || decided.has(set.exerciseId)) continue;
      here.add(set.exerciseId);
      const best = result[set.exerciseId];
      const heavier =
        !best ||
        set.kg > best.kg ||
        (set.kg === best.kg && (set.reps ?? 0) > (best.reps ?? 0));
      if (heavier) result[set.exerciseId] = { kg: set.kg, reps: set.reps };
    }
    here.forEach((id) => decided.add(id));
  }
  return result;
}

export function formatLastLoad({ kg, reps }: LastLoad): string {
  const load = `${formatNumber(kg)} kg`;
  return reps === null ? load : `${load} × ${reps}`;
}

/** Segundos como `m:ss`. */
export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
