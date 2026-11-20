import { dayKey } from '../domain/streak';

/** Dia do calendário de hoje (`YYYY-MM-DD`) no fuso do aparelho. */
export function todayKey(now = new Date()): string {
  return dayKey(now, Intl.DateTimeFormat().resolvedOptions().timeZone);
}
