import { screen, userEvent } from '@testing-library/react-native';

import Hoje from '../app/(tabs)/index';
import { getMealHistory } from '../src/features/meal/api';
import { getAchievements } from '../src/features/progress/api';
import { getWeights } from '../src/features/weight/api';
import { getPlan, getWorkouts } from '../src/features/workout/api';
import { useDisplayName } from '../src/lib/auth';
import { fakeToday } from '../test-utils/fakeToday';
import { renderScreen } from '../test-utils/renderScreen';

jest.mock('../src/lib/auth', () => ({ useDisplayName: jest.fn() }));
jest.mock('../src/features/workout/api', () => ({
  getPlan: jest.fn(),
  getWorkouts: jest.fn(),
  postWorkout: jest.fn(),
}));
jest.mock('../src/features/meal/api', () => ({ getMealHistory: jest.fn() }));
jest.mock('../src/features/weight/api', () => ({ getWeights: jest.fn() }));
jest.mock('../src/features/progress/api', () => ({
  getAchievements: jest.fn(),
}));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const mocks = {
  name: useDisplayName as jest.Mock,
  plan: getPlan as jest.Mock,
  workouts: getWorkouts as jest.Mock,
  meals: getMealHistory as jest.Mock,
  weights: getWeights as jest.Mock,
  achievements: getAchievements as jest.Mock,
};

// Sexta-feira, 27/11, 9h no fuso do teste. O plano tem treino na sexta (5).
const plano = {
  days: [
    {
      weekday: 5,
      name: 'Costas e postura',
      exercises: [
        { id: 'e1', name: 'Serrote', sets: 2, reps: '10' },
        { id: 'e2', name: 'Face pull', sets: 2, reps: '12' },
        { id: 'e3', name: 'Prancha', sets: 3, reps: '30 s' },
      ],
    },
  ],
};

function treino(dia: string) {
  return {
    id: dia,
    performedAt: `${dia}T15:00:00.000Z`,
    finished: true,
    sets: [{ exerciseId: 'e1', setNumber: 1, kg: null, reps: null, done: true }],
  };
}

function refeicao(i: number, protein: number) {
  return {
    id: `m${i}`,
    date: '2026-11-27',
    name: 'x',
    kcal: 300,
    protein,
    carbs: 0,
    fat: 0,
  };
}

function dados({
  plan = plano as unknown,
  sessions = [] as unknown[],
  meals = [] as unknown[],
} = {}) {
  mocks.plan.mockResolvedValue(plan);
  mocks.workouts.mockResolvedValue(sessions);
  mocks.meals.mockResolvedValue({
    meals,
    goals: { kcal: 2000, protein: 100, carbs: 0, fat: 0 },
  });
  mocks.weights.mockResolvedValue([]);
  mocks.achievements.mockResolvedValue([]);
}

beforeEach(() => {
  jest.resetAllMocks();
  fakeToday(new Date(2026, 10, 27, 9, 0));
});

afterEach(() => jest.useRealTimers());

describe('tela Hoje', () => {
  it('a saudação usa o primeiro nome do perfil', async () => {
    mocks.name.mockReturnValue('Pedro Almeida');
    dados();
    await renderScreen(<Hoje />);

    expect(await screen.findByText('Bom dia, Pedro')).toBeOnTheScreen();
  });

  it('o anel mostra a porcentagem das missões do dia', async () => {
    // Proteína batida (60 + 40 = 100) e 3 refeições; treino ainda não: 2 de 3.
    dados({ meals: [refeicao(1, 60), refeicao(2, 40), refeicao(3, 0)] });
    await renderScreen(<Hoje />);

    expect(
      await screen.findByRole('progressbar', { name: 'Missões do dia' }),
    ).toHaveAccessibilityValue({ now: 67 });
    expect(screen.getByText('2 de 3')).toBeOnTheScreen();
  });

  it('lista as missões do dia marcando as feitas', async () => {
    dados({ meals: [refeicao(1, 100)] });
    await renderScreen(<Hoje />);

    expect(
      await screen.findByRole('checkbox', { name: 'Bata a meta de proteína' }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Complete o treino do dia' }),
    ).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Registre 3 refeições' }),
    ).not.toBeChecked();
  });

  it('mostra a sequência de dias', async () => {
    dados({ sessions: [treino('2026-11-26'), treino('2026-11-25')] });
    await renderScreen(<Hoje />);

    expect(
      await screen.findByLabelText('Sequência: 2 dias'),
    ).toBeOnTheScreen();
  });

  it('o card do treino de hoje mostra o nome e abre os exercícios em Começar treino', async () => {
    dados();
    const user = userEvent.setup();
    await renderScreen(<Hoje />);

    expect(await screen.findByText('Costas e postura')).toBeOnTheScreen();
    expect(screen.getByText('3 exercícios')).toBeOnTheScreen();
    expect(screen.queryByText('Serrote')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Começar treino' }));

    expect(screen.getByText('Serrote')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Concluir treino' }),
    ).toBeOnTheScreen();
  });

  it('com o treino de hoje já concluído, o card avisa', async () => {
    dados({ sessions: [treino('2026-11-27')] });
    await renderScreen(<Hoje />);

    expect(await screen.findByText('Treino de hoje concluído')).toBeOnTheScreen();
  });

  it('sem treino hoje, mostra o estado vazio de descanso', async () => {
    dados({ plan: { days: [{ ...plano.days[0], weekday: 1 }] } });
    await renderScreen(<Hoje />);

    expect(await screen.findByText('Dia de descanso')).toBeOnTheScreen();
    expect(
      screen.getByText('Recuperar também faz parte do treino.'),
    ).toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Começar treino' }),
    ).not.toBeOnTheScreen();
  });

  it('carregando, mostra os blocos de esqueleto', async () => {
    const { name, ...api } = mocks;
    name.mockReturnValue(null);
    for (const m of Object.values(api)) m.mockReturnValue(new Promise(() => {}));
    await renderScreen(<Hoje />);

    expect(
      screen.getAllByRole('progressbar', { name: 'Carregando' }).length,
    ).toBeGreaterThan(0);
  });

  it('erro ao carregar o treino mostra o estado de erro com tentar de novo', async () => {
    dados();
    mocks.plan.mockReset();
    mocks.plan.mockRejectedValueOnce(new Error('rede'));
    mocks.plan.mockResolvedValue(plano);
    const user = userEvent.setup();
    await renderScreen(<Hoje />);

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Não foi possível carregar o treino. Verifique sua conexão.');

    await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Costas e postura')).toBeOnTheScreen();
  });
});
