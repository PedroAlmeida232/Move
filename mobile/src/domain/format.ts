/** Número em português com no máximo uma casa decimal: 81.2 → "81,2", 82 → "82". */
export function formatNumber(value: number): string {
  return String(Math.round(value * 10) / 10).replace('.', ',');
}

/** `YYYY-MM-DD` → `DD/MM`. */
export function shortDate(day: string): string {
  const [, month, date] = day.split('-');
  return `${date}/${month}`;
}
