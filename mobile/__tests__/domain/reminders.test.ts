import {
  REMINDER_HOURS,
  hourFromTrigger,
  reminderSchedule,
} from '../../src/domain/reminders';

const plano = {
  days: [
    { weekday: 5, name: 'Costas', exercises: [{ id: 'e1', name: 'Remada', sets: 3, reps: '10' }] },
    { weekday: 1, name: 'Peito', exercises: [{ id: 'e2', name: 'Supino', sets: 3, reps: '10' }] },
    { weekday: 3, name: 'Descanso ativo', exercises: [] },
  ],
};

describe('reminderSchedule', () => {
  it('treino: um lembrete às 18h em cada dia do plano com exercícios, em ordem', () => {
    expect(reminderSchedule('treino', plano)).toEqual([
      {
        id: 'treino-1',
        weekday: 2,
        hour: 18,
        minute: 0,
        title: 'Hora do treino',
        body: 'Hoje tem Peito no seu plano.',
      },
      {
        id: 'treino-5',
        weekday: 6,
        hour: 18,
        minute: 0,
        title: 'Hora do treino',
        body: 'Hoje tem Costas no seu plano.',
      },
    ]);
  });

  it('o dia da semana segue o calendário do iPhone (1 = domingo, 7 = sábado)', () => {
    const fimDeSemana = {
      days: [
        { weekday: 0, name: 'A', exercises: plano.days[0].exercises },
        { weekday: 6, name: 'B', exercises: plano.days[0].exercises },
      ],
    };
    expect(reminderSchedule('treino', fimDeSemana).map((r) => r.weekday)).toEqual([1, 7]);
  });

  it('sem plano, nenhum lembrete de treino', () => {
    expect(reminderSchedule('treino', { days: [] })).toEqual([]);
  });

  it('peso: um lembrete aos domingos às 9h, com ou sem plano', () => {
    const peso = [
      {
        id: 'peso',
        weekday: 1,
        hour: 9,
        minute: 0,
        title: 'Dia de se pesar',
        body: 'Registre seu peso no Move, no mesmo horário de sempre.',
      },
    ];
    expect(reminderSchedule('peso', plano)).toEqual(peso);
    expect(reminderSchedule('peso', { days: [] })).toEqual(peso);
  });
});

describe('horário do lembrete de treino', () => {
  it('usa o horário escolhido em todos os dias do plano', () => {
    expect(reminderSchedule('treino', plano, 7).map((r) => r.hour)).toEqual([7, 7]);
  });

  it('o peso continua aos domingos às 9h, seja qual for o horário do treino', () => {
    expect(reminderSchedule('peso', plano, 7)[0].hour).toBe(9);
  });

  it('as opções de horário vão da manhã à noite, com 18h incluído', () => {
    expect(REMINDER_HOURS).toEqual([6, 7, 12, 18, 20]);
  });
});

describe('hourFromTrigger', () => {
  it('lê a hora do gatilho semanal e do formato de calendário do iOS', () => {
    expect(hourFromTrigger({ type: 'weekly', weekday: 2, hour: 7, minute: 0 })).toBe(7);
    expect(
      hourFromTrigger({ type: 'calendar', repeats: true, dateComponents: { weekday: 2, hour: 20 } }),
    ).toBe(20);
  });

  it('sem hora reconhecível, null', () => {
    expect(hourFromTrigger(null)).toBeNull();
    expect(hourFromTrigger({ type: 'timeInterval', seconds: 60 })).toBeNull();
  });
});
