import { render, screen, userEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import Plano from '../app/(tabs)/plano';
import { getPlan } from '../src/features/workout/api';
import { TodayWorkout } from '../src/features/workout/TodayWorkout';
import { fakeToday } from '../test-utils/fakeToday';
import { renderScreen } from '../test-utils/renderScreen';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('../src/features/workout/api', () => ({
  getPlan: jest.fn(),
  postWorkout: jest.fn(),
}));

const dia = {
  weekday: 5,
  name: 'Costas e postura',
  exercises: [
    { id: 'e1', name: 'Serrote', sets: 2, reps: '10 a 12' },
    { id: 'e2', name: 'Face pull', sets: 2, reps: '15' },
  ],
};
const plano = {
  days: [dia, { weekday: 1, name: 'Peito e ombros', exercises: [] }],
};

beforeEach(() => {
  jest.resetAllMocks();
  fakeToday(new Date(2026, 10, 27, 9, 0)); // sexta
});
afterEach(() => jest.useRealTimers());

describe('treino do dia', () => {
  it('cada exercício fica num card próprio', async () => {
    await render(<TodayWorkout day={dia} />);

    expect(screen.getByTestId('exercicio-e1')).toHaveTextContent(/Serrote/);
    expect(screen.getByTestId('exercicio-e2')).toHaveTextContent(/Face pull/);
  });

  it('marcar uma série atualiza a barra e dá vibração leve', async () => {
    const user = userEvent.setup();
    await render(<TodayWorkout day={dia} />);

    await user.press(
      screen.getByRole('checkbox', { name: 'Concluir série 1 de Serrote' }),
    );

    expect(
      screen.getByRole('progressbar', { name: 'Progresso do treino' }),
    ).toHaveAccessibilityValue({ now: 25 });
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

});

describe('tela Plano', () => {
  it('os exercícios do dia aparecem como linhas de lista', async () => {
    (getPlan as jest.Mock).mockResolvedValue(plano);
    await renderScreen(<Plano />);

    expect(
      await screen.findByLabelText('Serrote, 2 × 10 a 12'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Face pull, 2 × 15')).toBeOnTheScreen();
  });

  it('dia sem exercícios mostra o estado vazio de descanso', async () => {
    (getPlan as jest.Mock).mockResolvedValue(plano);
    const user = userEvent.setup();
    await renderScreen(<Plano />);
    await screen.findByText('Costas e postura');

    await user.press(screen.getByRole('button', { name: 'Seg' }));

    expect(screen.getByText('Dia de descanso')).toBeOnTheScreen();
  });

  it('carregando, mostra o esqueleto', async () => {
    (getPlan as jest.Mock).mockReturnValue(new Promise(() => {}));
    await renderScreen(<Plano />);

    expect(
      screen.getAllByRole('progressbar', { name: 'Carregando' }).length,
    ).toBeGreaterThan(0);
  });
});
