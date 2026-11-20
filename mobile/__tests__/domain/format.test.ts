import { formatNumber, shortDate } from '../../src/domain/format';

describe('formatNumber', () => {
  it('usa vírgula e no máximo uma casa decimal', () => {
    expect(formatNumber(81.2)).toBe('81,2');
    expect(formatNumber(82)).toBe('82');
    expect(formatNumber(80.46)).toBe('80,5');
    expect(formatNumber(79.99)).toBe('80');
  });
});

describe('shortDate', () => {
  it('mostra dia e mês', () => {
    expect(shortDate('2026-11-01')).toBe('01/11');
    expect(shortDate('2026-02-28')).toBe('28/02');
  });
});
