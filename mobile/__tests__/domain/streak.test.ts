import { addDays, bestStreak, dayKey, streak } from '../../src/domain/streak';

describe('dayKey', () => {
  it('converte o instante para o dia do calendário no fuso informado', () => {
    // 20/11 às 23h30 em São Paulo (UTC-3) já é 21/11 em UTC.
    const instante = new Date('2026-11-21T02:30:00Z');
    expect(dayKey(instante, 'America/Sao_Paulo')).toBe('2026-11-20');
    expect(dayKey(instante, 'UTC')).toBe('2026-11-21');
  });

  it('vira o dia à meia-noite local', () => {
    expect(dayKey(new Date('2026-11-21T02:59:59Z'), 'America/Sao_Paulo')).toBe(
      '2026-11-20',
    );
    expect(dayKey(new Date('2026-11-21T03:00:00Z'), 'America/Sao_Paulo')).toBe(
      '2026-11-21',
    );
  });
});

describe('addDays', () => {
  it('soma e subtrai dias atravessando mês e ano', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-11-20', 0)).toBe('2026-11-20');
  });

  it('não sofre com horário de verão (sempre dias de calendário)', () => {
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(addDays('2026-11-01', 1)).toBe('2026-11-02');
  });
});

describe('streak', () => {
  const hoje = '2026-11-20'; // sexta-feira

  it('vale 0 sem dias de treino', () => {
    expect(streak([], hoje)).toBe(0);
  });

  it('conta os dias seguidos terminando hoje', () => {
    expect(streak(['2026-11-18', '2026-11-19', '2026-11-20'], hoje)).toBe(3);
  });

  it('hoje sem treino não quebra: conta a partir de ontem', () => {
    expect(streak(['2026-11-18', '2026-11-19'], hoje)).toBe(2);
  });

  it('quebra depois de 1 dia de treino sem treino', () => {
    expect(streak(['2026-11-17', '2026-11-19', '2026-11-20'], hoje)).toBe(2);
    // ontem (19) sem treino quebrou: o treino do dia 18 já não conta.
    expect(streak(['2026-11-18'], hoje)).toBe(0);
  });

  it('ignora datas repetidas e datas futuras', () => {
    const days = [
      '2026-11-19',
      '2026-11-19',
      '2026-11-20',
      '2026-11-21',
      '2026-11-25',
    ];
    expect(streak(days, hoje)).toBe(2);
  });

  it('só datas futuras valem 0', () => {
    expect(streak(['2026-11-21'], hoje)).toBe(0);
  });

  it('dias de descanso não quebram nem somam', () => {
    // 20/11 sex, 19 qui, 18 qua (descanso), 17 ter. Descanso: quarta (3).
    expect(streak(['2026-11-17', '2026-11-19', '2026-11-20'], hoje, [3])).toBe(
      3,
    );
  });

  it('hoje sendo descanso e sem treino segue de ontem', () => {
    expect(streak(['2026-11-18', '2026-11-19'], hoje, [5])).toBe(2);
  });

  it('atravessa mês e ano', () => {
    expect(
      streak(['2025-12-31', '2026-01-01', '2026-01-02'], '2026-01-02'),
    ).toBe(3);
  });

  it('usa o dia local: treino às 23h30 em São Paulo conta no dia certo', () => {
    const noite = dayKey(new Date('2026-11-21T02:30:00Z'), 'America/Sao_Paulo'); // 2026-11-20
    const hojeLocal = dayKey(
      new Date('2026-11-21T10:00:00Z'),
      'America/Sao_Paulo',
    ); // 2026-11-21
    expect(streak([noite], hojeLocal)).toBe(1);
    // dois dias depois sem treino, a sequência acabou.
    expect(streak([noite], addDays(hojeLocal, 2))).toBe(0);
  });
});

describe('bestStreak', () => {
  it('vale 0 sem dias de treino', () => {
    expect(bestStreak([])).toBe(0);
  });

  it('é a maior sequência do histórico, não a atual', () => {
    const days = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06'];
    expect(bestStreak(days)).toBe(3);
  });

  it('ignora repetidas e aceita fora de ordem', () => {
    expect(bestStreak(['2026-11-03', '2026-11-01', '2026-11-02', '2026-11-02'])).toBe(3);
  });

  it('dias de descanso não quebram nem somam', () => {
    // 17/11 ter, 18 qua (descanso), 19 qui
    expect(bestStreak(['2026-11-17', '2026-11-19'], [3])).toBe(2);
    expect(bestStreak(['2026-11-17', '2026-11-19'])).toBe(1);
  });
});
