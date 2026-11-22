import type { WeightEntry } from '../../domain/weight';
import { addDays } from '../../domain/streak';
import { apiFetch } from '../../lib/api';
import { todayKey } from '../../lib/time';

export type WeightRecord = WeightEntry & { waistCm: number | null };

type WeightResponse = {
  date: string;
  weightKg: number;
  waistCm: number | null;
};

function toRecord(e: WeightResponse): WeightRecord {
  return { date: e.date, kg: e.weightKg, waistCm: e.waistCm };
}

/** Registros do período. A API exige `from` e `to` (até 366 dias); sem período, o último ano. */
export async function getWeights(
  from?: string,
  to?: string,
): Promise<WeightRecord[]> {
  const fim = to ?? todayKey();
  const inicio = from ?? addDays(fim, -365);
  const resposta = await apiFetch(`/api/v1/weight?from=${inicio}&to=${fim}`);
  if (!resposta.ok)
    throw new Error(`Falha ao carregar o peso (${resposta.status})`);
  const entries: WeightResponse[] = await resposta.json();
  return entries.map(toRecord);
}

export async function putWeight(
  date: string,
  kg: number,
): Promise<WeightRecord> {
  const resposta = await apiFetch(`/api/v1/weight/${date}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weightKg: kg, waistCm: null }),
  });
  if (!resposta.ok)
    throw new Error(`Falha ao salvar o peso (${resposta.status})`);
  return toRecord(await resposta.json());
}
