import type { WeightEntry } from '../../domain/weight';
import { apiFetch } from '../../lib/api';

export type WeightRecord = WeightEntry & { waistCm: number | null };

/** Registros do período; sem período, todos. */
export async function getWeights(
  from?: string,
  to?: string,
): Promise<WeightRecord[]> {
  const query = from && to ? `?from=${from}&to=${to}` : '';
  const resposta = await apiFetch(`/api/v1/weight${query}`);
  if (!resposta.ok)
    throw new Error(`Falha ao carregar o peso (${resposta.status})`);
  const body: { entries: WeightRecord[] } = await resposta.json();
  return body.entries;
}

export async function putWeight(
  date: string,
  kg: number,
): Promise<WeightRecord> {
  const resposta = await apiFetch(`/api/v1/weight/${date}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kg, waistCm: null }),
  });
  if (!resposta.ok)
    throw new Error(`Falha ao salvar o peso (${resposta.status})`);
  return resposta.json();
}
