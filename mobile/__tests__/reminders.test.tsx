import { screen, userEvent } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';

import Ajustes from '../app/ajustes';
import { getPlan } from '../src/features/workout/api';
import { useAuth } from '../src/lib/auth';
import { renderScreen } from '../test-utils/renderScreen';

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { WEEKLY: 'weekly' },
}));
jest.mock('../src/lib/auth', () => ({ useAuth: jest.fn() }));
jest.mock('../src/features/account/api', () => ({ deleteAccount: jest.fn() }));
jest.mock('../src/features/workout/api', () => ({ getPlan: jest.fn() }));

const N = Notifications as unknown as Record<string, jest.Mock>;
const plano = {
  days: [{ weekday: 5, name: 'Costas', exercises: [{ id: 'e1', name: 'Remada', sets: 3, reps: '10' }] }],
};

beforeEach(() => {
  jest.resetAllMocks();
  (useAuth as jest.Mock).mockReturnValue({ signOut: jest.fn(), user: { email: 'p@x.com' } });
  (getPlan as jest.Mock).mockResolvedValue(plano);
  N.getAllScheduledNotificationsAsync.mockResolvedValue([]);
  N.requestPermissionsAsync.mockResolvedValue({ granted: true });
});

describe('lembretes', () => {
  it('começam desligados quando nada está agendado', async () => {
    await renderScreen(<Ajustes />);

    expect(await screen.findByRole('switch', { name: 'Lembrar do treino' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Lembrar de se pesar' })).not.toBeChecked();
  });

  it('aparecem ligados quando já há lembretes agendados', async () => {
    N.getAllScheduledNotificationsAsync.mockResolvedValue([{ identifier: 'treino-5' }]);
    await renderScreen(<Ajustes />);

    expect(await screen.findByRole('switch', { name: 'Lembrar do treino' })).toBeChecked();
  });

  it('ligar o do treino pede permissão e agenda um lembrete por dia do plano', async () => {
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    await user.press(await screen.findByRole('switch', { name: 'Lembrar do treino' }));

    expect(N.requestPermissionsAsync).toHaveBeenCalled();
    expect(N.scheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: 'treino-5',
      content: { title: 'Hora do treino', body: 'Hoje tem Costas no seu plano.' },
      trigger: { type: 'weekly', weekday: 6, hour: 18, minute: 0 },
    });
    expect(await screen.findByRole('switch', { name: 'Lembrar do treino' })).toBeChecked();
  });

  it('desligar cancela os lembretes daquele tipo', async () => {
    N.getAllScheduledNotificationsAsync.mockResolvedValue([
      { identifier: 'treino-5' },
      { identifier: 'treino-1' },
      { identifier: 'peso' },
    ]);
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    await user.press(await screen.findByRole('switch', { name: 'Lembrar do treino' }));

    expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith('treino-5');
    expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith('treino-1');
    expect(N.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('peso');
    expect(await screen.findByRole('switch', { name: 'Lembrar do treino' })).not.toBeChecked();
  });

  it('sem permissão, explica como liberar e continua desligado', async () => {
    N.requestPermissionsAsync.mockResolvedValue({ granted: false });
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    await user.press(await screen.findByRole('switch', { name: 'Lembrar de se pesar' }));

    expect(
      await screen.findByText('Ative as notificações do Move nos Ajustes do iPhone para receber lembretes.'),
    ).toBeOnTheScreen();
    expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(screen.getByRole('switch', { name: 'Lembrar de se pesar' })).not.toBeChecked();
  });
});
