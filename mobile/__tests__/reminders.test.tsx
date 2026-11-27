import { screen, userEvent } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';

import Ajustes from '../app/ajustes';
import { getPlan } from '../src/features/workout/api';
import { useAuth } from '../src/lib/auth';
import { renderScreen } from '../test-utils/renderScreen';
import { deleteAccount } from '../src/features/account/api';

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

describe('lembretes ao sair da conta', () => {
  const agendados = [{ identifier: 'treino-5' }, { identifier: 'peso' }];

  it('Sair cancela todos os lembretes antes de encerrar a sessão', async () => {
    const signOut = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ signOut, user: { email: 'p@x.com' } });
    N.getAllScheduledNotificationsAsync.mockResolvedValue(agendados);
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    await user.press(screen.getByRole('button', { name: 'Sair' }));

    expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith('treino-5');
    expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith('peso');
    expect(signOut).toHaveBeenCalled();
  });

  it('excluir a conta também cancela os lembretes', async () => {
    const signOut = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ signOut, user: { email: 'p@x.com' } });
    (deleteAccount as jest.Mock).mockResolvedValue(undefined);
    N.getAllScheduledNotificationsAsync.mockResolvedValue(agendados);
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    await user.press(screen.getByRole('button', { name: 'Excluir conta' }));
    await user.press(screen.getByRole('button', { name: 'Excluir definitivamente' }));

    expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith('treino-5');
    expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith('peso');
    expect(signOut).toHaveBeenCalled();
  });
});

describe('horário do lembrete de treino', () => {
  const agendado = (hour: number) => ({
    identifier: 'treino-5',
    trigger: { type: 'calendar', repeats: true, dateComponents: { weekday: 6, hour, minute: 0 } },
  });

  it('com o lembrete ligado, mostra os horários e marca o atual', async () => {
    N.getAllScheduledNotificationsAsync.mockResolvedValue([agendado(20)]);
    await renderScreen(<Ajustes />);

    expect(await screen.findByRole('button', { name: 'Treino às 20h' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Treino às 7h' })).not.toBeSelected();
    expect(
      screen.getByRole('switch', { name: 'Lembrar do treino' }).props.accessibilityHint,
    ).toBe('Nos dias do plano, às 20h');
  });

  it('trocar o horário reagenda os lembretes de treino na nova hora', async () => {
    N.getAllScheduledNotificationsAsync.mockResolvedValue([agendado(18)]);
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    await user.press(await screen.findByRole('button', { name: 'Treino às 7h' }));

    expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith('treino-5');
    expect(N.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'treino-5',
        trigger: { type: 'weekly', weekday: 6, hour: 7, minute: 0 },
      }),
    );
    expect(await screen.findByRole('button', { name: 'Treino às 7h' })).toBeSelected();
  });

  it('com o lembrete desligado, os horários não aparecem', async () => {
    await renderScreen(<Ajustes />);
    await screen.findByRole('switch', { name: 'Lembrar do treino' });

    expect(screen.queryByRole('button', { name: 'Treino às 7h' })).not.toBeOnTheScreen();
  });
});
