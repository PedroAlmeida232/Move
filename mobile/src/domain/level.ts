export const LEVELS = [
  { name: 'Iniciante', at: 0 },
  { name: 'Ativo', at: 500 },
  { name: 'Focado', at: 2000 },
  { name: 'Forte', at: 6000 },
  { name: 'Elite', at: 15000 },
] as const;

export type LevelInfo = {
  index: number;
  name: string;
  next: { name: string; at: number } | null;
  xpToNext: number;
  pct: number;
};

export function levelFor(xp: number): LevelInfo {
  const total = Math.max(0, xp);
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (total >= LEVELS[i].at) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  return {
    index,
    name: current.name,
    next,
    xpToNext: next ? next.at - total : 0,
    pct: next
      ? Math.round(((total - current.at) / (next.at - current.at)) * 100)
      : 100,
  };
}
