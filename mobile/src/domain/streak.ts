/** Dia do calendário (`YYYY-MM-DD`) de um instante, no fuso IANA informado. */
export function dayKey(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

function parse(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Soma dias de calendário a um `YYYY-MM-DD` (sem depender de fuso nem de horário de verão). */
export function addDays(day: string, amount: number): string {
  return new Date(parse(day) + amount * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Dias de treino seguidos, contando para trás a partir de `today`.
 * Hoje sem treino não quebra; dia de treino passado sem treino quebra;
 * `restWeekdays` (0 = domingo) são dias de descanso: não quebram e não somam.
 */
export function streak(
  days: string[],
  today: string,
  restWeekdays: number[] = [],
): number {
  const trained = new Set(days.filter((d) => d <= today));
  if (trained.size === 0) return 0;
  const earliest = [...trained].sort()[0];

  let count = 0;
  for (let day = today; day >= earliest; day = addDays(day, -1)) {
    if (trained.has(day)) count += 1;
    else if (day === today) continue;
    else if (restWeekdays.includes(new Date(parse(day)).getUTCDay())) continue;
    else break;
  }
  return count;
}
