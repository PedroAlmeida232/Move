export type ReminderKind = 'treino' | 'peso';

/** Lembrete semanal. `weekday` no calendário do iPhone: 1 = domingo, 7 = sábado. */
export type Reminder = {
  id: string;
  weekday: number;
  hour: number;
  minute: number;
  title: string;
  body: string;
};

type PlanLike = {
  days: { weekday: number; name: string; exercises: unknown[] }[];
};

export const TRAINING_HOUR = 18;
/** Horários oferecidos para o lembrete de treino. */
export const REMINDER_HOURS = [6, 7, 12, 18, 20];
export const WEIGHT_HOUR = 9;

/** Lembretes de um tipo. Treino: nos dias do plano com exercícios. Peso: domingo de manhã. */
export function reminderSchedule(
  kind: ReminderKind,
  plan: PlanLike,
  trainingHour: number = TRAINING_HOUR,
): Reminder[] {
  if (kind === 'peso') {
    return [
      {
        id: 'peso',
        weekday: 1,
        hour: WEIGHT_HOUR,
        minute: 0,
        title: 'Dia de se pesar',
        body: 'Registre seu peso no Move, no mesmo horário de sempre.',
      },
    ];
  }
  return plan.days
    .filter((d) => d.exercises.length > 0)
    .sort((a, b) => a.weekday - b.weekday)
    .map((d) => ({
      id: `treino-${d.weekday}`,
      // O plano usa 0 = domingo; o iPhone, 1 = domingo.
      weekday: d.weekday + 1,
      hour: trainingHour,
      minute: 0,
      title: 'Hora do treino',
      body: `Hoje tem ${d.name} no seu plano.`,
    }));
}

export function isKind(id: string, kind: ReminderKind): boolean {
  return kind === 'peso' ? id === 'peso' : id.startsWith('treino-');
}

/** Hora de um lembrete já agendado: o iOS devolve o gatilho semanal como calendário. */
export function hourFromTrigger(trigger: unknown): number | null {
  if (!trigger || typeof trigger !== 'object') return null;
  const t = trigger as { hour?: unknown; dateComponents?: { hour?: unknown } };
  const hour = t.hour ?? t.dateComponents?.hour;
  return typeof hour === 'number' ? hour : null;
}
