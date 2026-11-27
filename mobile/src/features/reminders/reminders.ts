import * as Notifications from 'expo-notifications';

import {
  hourFromTrigger,
  isKind,
  reminderSchedule,
  TRAINING_HOUR,
  type ReminderKind,
} from '../../domain/reminders';
import { getPlan } from '../workout/api';

// Notificações só locais: agendadas no próprio iPhone, nada sai do aparelho.

async function scheduled(): Promise<
  { identifier: string; trigger?: unknown }[]
> {
  try {
    return (await Notifications.getAllScheduledNotificationsAsync()) ?? [];
  } catch {
    return [];
  }
}

async function scheduledIds(): Promise<string[]> {
  return (await scheduled()).map((n) => n.identifier);
}

/** Quais tipos de lembrete estão ligados agora. */
export async function enabledKinds(): Promise<
  Record<ReminderKind, boolean> & { trainingHour: number }
> {
  const list = await scheduled();
  const treino = list.find((n) => isKind(n.identifier, 'treino'));
  return {
    treino: !!treino,
    peso: list.some((n) => isKind(n.identifier, 'peso')),
    trainingHour: (treino && hourFromTrigger(treino.trigger)) ?? TRAINING_HOUR,
  };
}

export async function disableReminders(kind: ReminderKind) {
  const ids = (await scheduledIds()).filter((id) => isKind(id, kind));
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}

/** Pede permissão (só na primeira vez o iPhone pergunta) e agenda. `false` sem permissão. */
export async function enableReminders(
  kind: ReminderKind,
  trainingHour: number = TRAINING_HOUR,
): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;
  const plan = kind === 'treino' ? await getPlan() : { days: [] };
  await disableReminders(kind);
  await Promise.all(
    reminderSchedule(kind, plan, trainingHour).map((r) =>
      Notifications.scheduleNotificationAsync({
        identifier: r.id,
        content: { title: r.title, body: r.body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: r.weekday,
          hour: r.hour,
          minute: r.minute,
        },
      }),
    ),
  );
  return true;
}

/** Cancela todos os lembretes (ao sair ou excluir a conta). Falha aqui não impede a saída. */
export async function disableAllReminders() {
  try {
    await Promise.all([disableReminders('treino'), disableReminders('peso')]);
  } catch {
    // O aparelho pode recusar; a sessão encerra mesmo assim.
  }
}
