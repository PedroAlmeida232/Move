import { apiFetch } from '../../lib/api';

export type UnlockedAchievement = { code: string; unlockedAt: string };

/** `STREAK_7` na API é `streak7` no app. */
const toAppCode = (code: string) => code.toLowerCase().replace(/_/g, '');

/** A API lista o catálogo todo; aqui ficam só as desbloqueadas. */
export async function getAchievements(): Promise<UnlockedAchievement[]> {
  const resposta = await apiFetch('/api/v1/achievements');
  if (!resposta.ok)
    throw new Error(`Falha ao carregar as conquistas (${resposta.status})`);
  const body: { code: string; unlockedAt: string | null }[] =
    await resposta.json();
  return body
    .filter((a) => a.unlockedAt !== null)
    .map((a) => ({
      code: toAppCode(a.code),
      unlockedAt: a.unlockedAt as string,
    }));
}
