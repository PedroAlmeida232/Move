import { act, render, screen, userEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { TodayWorkout } from '../src/features/workout/TodayWorkout';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('../src/features/workout/api', () => ({ postWorkout: jest.fn() }));

const dia = {
  weekday: 5,
  name: 'Costas',
  exercises: [
    { id: 'e1', name: 'Remada', sets: 2, reps: '10' },
    { id: 'e2', name: 'Prancha', sets: 1, reps: '30 s' },
  ],
};

beforeEach(() => jest.resetAllMocks());
afterEach(() => jest.useRealTimers());

describe('carga da última vez', () => {
  it('mostra a carga anterior e sugere no campo de carga', async () => {
    await render(<TodayWorkout day={dia} lastLoads={{ e1: { kg: 12.5, reps: 10 } }} />);

    expect(screen.getByText('Da última vez: 12,5 kg × 10')).toBeOnTheScreen();
    expect(screen.getByLabelText('Carga da série 1 de Remada').props.placeholder).toBe(
      '12,5',
    );
  });

  it('sem histórico do exercício, não mostra nada', async () => {
    await render(<TodayWorkout day={dia} lastLoads={{ e1: { kg: 12.5, reps: 10 } }} />);

    expect(screen.getAllByText(/Da última vez/)).toHaveLength(1);
    expect(screen.getByLabelText('Carga da série 1 de Prancha').props.placeholder).toBe(
      'kg',
    );
  });
});

describe('descanso entre séries', () => {
  async function marcar(nome: string) {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('checkbox', { name: nome }));
    return user;
  }

  it('marcar uma série inicia o descanso de 90 s, que conta para baixo', async () => {
    jest.useFakeTimers();
    await render(<TodayWorkout day={dia} />);

    await marcar('Concluir série 1 de Remada');
    expect(screen.getByRole('timer', { name: 'Descanso: 1:30' })).toBeOnTheScreen();

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    expect(screen.getByRole('timer', { name: 'Descanso: 1:00' })).toBeOnTheScreen();
  });

  it('Pular encerra o descanso', async () => {
    jest.useFakeTimers();
    await render(<TodayWorkout day={dia} />);
    const user = await marcar('Concluir série 1 de Remada');

    await user.press(screen.getByRole('button', { name: 'Pular descanso' }));

    expect(screen.queryByRole('timer')).not.toBeOnTheScreen();
  });

  it('ao chegar a zero, vibra e some', async () => {
    jest.useFakeTimers();
    await render(<TodayWorkout day={dia} />);
    await marcar('Concluir série 1 de Remada');

    await act(async () => {
      jest.advanceTimersByTime(90_000);
    });

    expect(screen.queryByRole('timer')).not.toBeOnTheScreen();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('desmarcar uma série não inicia descanso', async () => {
    jest.useFakeTimers();
    await render(<TodayWorkout day={dia} />);
    const user = await marcar('Concluir série 1 de Remada');
    await user.press(screen.getByRole('button', { name: 'Pular descanso' }));

    await user.press(
      screen.getByRole('checkbox', { name: 'Concluir série 1 de Remada' }),
    );

    expect(screen.queryByRole('timer')).not.toBeOnTheScreen();
  });
});
