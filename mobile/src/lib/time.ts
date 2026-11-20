import { dayKey } from '../domain/streak';

/** Fuso IANA do aparelho (ex.: `America/Sao_Paulo`). */
export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Dia do calendário de hoje (`YYYY-MM-DD`) no fuso do aparelho. */
export function todayKey(now = new Date()): string {
  return dayKey(now, deviceTimeZone());
}
