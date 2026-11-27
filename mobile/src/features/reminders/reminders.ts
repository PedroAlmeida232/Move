import * as Notifications from 'expo-notifications';

import { isKind, reminderSchedule, type ReminderKind } from '../../domain/reminders';
import { getPlan } from '../workout/api';

// Notificações só locais: agendadas no próprio iPhone, nada sai do aparelho.

async function scheduledIds(): Promise<string[]> {
  try {
    const list = (await Notifications.getAllScheduledNotificationsAsync()) ?? [];
    return list.map((n) => n.identifier);
  } catch {
    return [];
  }
}

/** Quais tipos de lembrete estão ligados agora. */
export async function enabledKinds(): Promise<Record<ReminderKind, boolean>> {
  const ids = await scheduledIds();
  return {
    treino: ids.some((id) => isKind(id, 'treino')),
    peso: ids.some((id) => isKind(id, 'peso')),
  };
}

export async function disableReminders(kind: ReminderKind) {
  const ids = (await scheduledIds()).filter((id) => isKind(id, kind));
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

/** Pede permissão (só na primeira vez o iPhone pergunta) e agenda. `false` sem permissão. */
export async function enableReminders(kind: ReminderKind): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;
  const plan = kind === 'treino' ? await getPlan() : { days: [] };
  await disableReminders(kind);
  await Promise.all(
    reminderSchedule(kind, plan).map((r) =>
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
