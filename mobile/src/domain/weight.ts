import { parseAmount } from './diet';
import { formatNumber } from './format';
import { addDays } from './streak';

export type WeightEntry = { date: string; kg: number };
export type ChartPoint = WeightEntry & { x: number; y: number };

export const MIN_KG = 20;
export const MAX_KG = 400;

export function validateWeight(text: string): {
  error: string | null;
  kg: number | null;
} {
  const kg = parseAmount(text);
  if (kg === null || kg < MIN_KG || kg > MAX_KG) {
    return {
      error: `Informe um peso entre ${MIN_KG} e ${MAX_KG} kg.`,
      kg: null,
    };
  }
  return { error: null, kg };
}

export function sortByDate<T extends { date: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Posição de cada registro (já ordenado por data) numa caixa `width` × `height`.
 * O maior peso fica em cima. Variação menor que 0,5 kg ganha margem para a linha não colar.
 */
export function chartPoints(
  entries: WeightEntry[],
  box: { width: number; height: number; padding: number },
): { points: ChartPoint[]; min: number; max: number } {
  if (entries.length === 0) return { points: [], min: 0, max: 0 };

  const values = entries.map((e) => e.kg);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (max - min < 0.5) {
    const middle = (max + min) / 2;
    min = middle - 0.25;
    max = middle + 0.25;
  }

  const innerW = box.width - box.padding * 2;
  const innerH = box.height - box.padding * 2;
  const points = entries.map((e, i) => ({
    ...e,
    x:
      entries.length === 1
        ? box.width / 2
        : box.padding + (i * innerW) / (entries.length - 1),
    y: box.padding + ((max - e.kg) / (max - min)) * innerH,
  }));
  return { points, min, max };
}

export type WeightRange = '30d' | '90d' | 'all';

/** Primeiro dia do período, contando hoje; `all` não tem início. */
export function rangeStart(today: string, range: WeightRange): string | undefined {
  if (range === 'all') return undefined;
  return addDays(today, range === '30d' ? -29 : -89);
}

export type WeightChange = {
  delta: number;
  text: string;
  tone: 'loss' | 'gain' | 'flat';
};

/** Diferença entre o último e o primeiro registro (já ordenados), em décimos de kg. */
export function weightChange(entries: WeightEntry[]): WeightChange {
  const delta =
    entries.length < 2
      ? 0
      : Math.round((entries[entries.length - 1].kg - entries[0].kg) * 10) / 10;
  if (delta === 0) return { delta: 0, text: '0 kg', tone: 'flat' };
  return delta < 0
    ? { delta, text: `−${formatNumber(-delta)} kg`, tone: 'loss' }
    : { delta, text: `+${formatNumber(delta)} kg`, tone: 'gain' };
}
