/** Porcentagem inteira entre 0 e 100 (valor inválido vira 0). */
export function toPercent(value: number): number {
  return Number.isNaN(value)
    ? 0
    : Math.round(Math.min(100, Math.max(0, value)));
}

export function percentA11y(label: string, pct: number) {
  return {
    accessible: true,
    accessibilityRole: 'progressbar',
    accessibilityLabel: label,
    accessibilityValue: { min: 0, max: 100, now: pct, text: `${pct}%` },
  } as const;
}
