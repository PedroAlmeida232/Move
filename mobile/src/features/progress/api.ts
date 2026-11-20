import { apiFetch } from '../../lib/api';

export type UnlockedAchievement = { code: string; unlockedAt: string };

export async function getAchievements(): Promise<UnlockedAchievement[]> {
  const resposta = await apiFetch('/api/v1/achievements');
  if (!resposta.ok)
    throw new Error(`Falha ao carregar as conquistas (${resposta.status})`);
  const body: { achievements: UnlockedAchievement[] } = await resposta.json();
  return body.achievements;
}
