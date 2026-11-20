import { render, screen, userEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { renderRouter, testRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import Hoje from '../app/(tabs)/index';
import Progresso from '../app/(tabs)/progresso';
import { getMealHistory } from '../src/features/meal/api';
import { getAchievements } from '../src/features/progress/api';
import { getWeights } from '../src/features/weight/api';
import { getPlan, getWorkouts, postWorkout } from '../src/features/workout/api';
import { fakeToday } from '../test-utils/fakeToday';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));
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

const mocks = {
  plan: getPlan as jest.Mock,
  workouts: getWorkouts as jest.Mock,
  post: postWorkout as jest.Mock,
  meals: getMealHistory as jest.Mock,
  weights: getWeights as jest.Mock,
  achievements: getAchievements as jest.Mock,
};

// Sexta-feira, 20/11. O plano só tem treino na sexta.
const plano = {
  days: [
    {
      weekday: 5,
      name: 'Costas',
      exercises: [
        { id: 'e1', name: 'Serrote', sets: 2, reps: '10' },
        { id: 'e2', name: 'Face pull', sets: 2, reps: '12' },
      ],
    },
  ],
};

/** `n` treinos completos com 1 série cada, em dias seguidos terminando em `ultimoDia`. */
function treinos(n: number, ultimoDia = 20) {
  return Array.from({ length: n }, (_, i) => ({
    id: `w${i}`,
    performedAt: `2026-11-${String(ultimoDia - i).padStart(2, '0')}T15:00:00.000Z`,
    finished: true,
    sets: [
      { exerciseId: 'e1', setNumber: 1, kg: null, reps: null, done: true },
    ],
  }));
}

function historico({
  sessions = [] as unknown[],
  meals = 0,
  weights = 0,
  achievements = [] as unknown[],
} = {}) {
  mocks.plan.mockResolvedValue(plano);
  mocks.workouts.mockResolvedValue(sessions);
  mocks.meals.mockResolvedValue({
    meals: Array.from({ length: meals }, (_, i) => ({
      id: `m${i}`,
      date: `2026-11-${String(10 + i).padStart(2, '0')}`,
      name: 'x',
      kcal: 100,
      protein: 0,
      carbs: 0,
      fat: 0,
    })),
    goals: { kcal: 2000, protein: 140, carbs: 0, fat: 0 },
  });
  mocks.weights.mockResolvedValue(
    Array.from({ length: weights }, (_, i) => ({
      date: `2026-11-0${i + 1}`,
      kg: 80,
      waistCm: null,
    })),
  );
  mocks.achievements.mockResolvedValue(achievements);
}

beforeEach(() => {
  jest.resetAllMocks();
  fakeToday(new Date('2026-11-20T15:00:00Z'));
});

afterEach(() => jest.useRealTimers());

const rotas = { index: Progresso, outra: () => <Text>Outra tela</Text> };

describe('tela Progresso', () => {
  it('a barra de nível reflete o XP calculado pelas funções puras', async () => {
    // 10 treinos × (10 + 50) = 600; 7 refeições × 5 = 35; 1 peso = 15 → 650 XP
    historico({ sessions: treinos(10), meals: 7, weights: 1 });
    await renderRouter(rotas, { initialUrl: '/' });

    expect(await screen.findByText('Nível 2 · Ativo')).toBeOnTheScreen();
    expect(screen.getByText('650 XP')).toBeOnTheScreen();
    expect(
      screen.getByRole('progressbar', { name: 'Progresso do nível' }),
    ).toHaveAccessibilityValue({ now: 10 });
    expect(screen.getByText('Faltam 1350 XP para Focado')).toBeOnTheScreen();
  });

  it('mostra a sequência atual, o recorde e os treinos completos', async () => {
    historico({ sessions: treinos(10) });
    await renderRouter(rotas, { initialUrl: '/' });

    expect(await screen.findByText('10 dias seguidos')).toBeOnTheScreen();
    expect(screen.getByText('Recorde: 10 dias')).toBeOnTheScreen();
    expect(screen.getByText('10 treinos completos')).toBeOnTheScreen();
  });

  it('no começo: Iniciante, sem sequência e todas as conquistas bloqueadas', async () => {
    historico();
    await renderRouter(rotas, { initialUrl: '/' });

    expect(await screen.findByText('Nível 1 · Iniciante')).toBeOnTheScreen();
    expect(screen.getByText('0 dias seguidos')).toBeOnTheScreen();
    expect(screen.getByText('Conquistas 0/8')).toBeOnTheScreen();
    expect(screen.getAllByText('Bloqueada')).toHaveLength(8);
  });

  it('no nível máximo, avisa que não há próximo', async () => {
    // 250 treinos × 60 = 15000 XP (Elite). A data não importa para o XP.
    const sessions = treinos(250).map((s) => ({
      ...s,
      performedAt: '2026-11-20T15:00:00.000Z',
    }));
    historico({ sessions });
    await renderRouter(rotas, { initialUrl: '/' });

    expect(await screen.findByText('Nível 5 · Elite')).toBeOnTheScreen();
    expect(screen.getByText('Nível máximo')).toBeOnTheScreen();
  });

  it('conquista desbloqueada aparece na lista com a data', async () => {
    historico({
      sessions: treinos(1),
      achievements: [{ code: 'first', unlockedAt: '2026-11-20T15:05:00.000Z' }],
    });
    await renderRouter(rotas, { initialUrl: '/' });

    expect(await screen.findByText('Conquistas 1/8')).toBeOnTheScreen();
    expect(
      screen.getByLabelText(
        'Primeiro treino, desbloqueada em 20/11. Conclua um treino completo',
      ),
    ).toBeOnTheScreen();
    expect(screen.getAllByText('Bloqueada')).toHaveLength(7);
  });

  it('busca de novo ao voltar para a aba, e a conquista nova aparece', async () => {
    historico({ sessions: treinos(1) });
    await renderRouter(rotas, { initialUrl: '/' });
    expect(await screen.findByText('Conquistas 0/8')).toBeOnTheScreen();

    mocks.achievements.mockResolvedValue([
      { code: 'first', unlockedAt: '2026-11-20T15:05:00.000Z' },
    ]);
    await testRouter.navigate('/outra');
    await testRouter.back('/');

    expect(await screen.findByText('Conquistas 1/8')).toBeOnTheScreen();
    expect(screen.getByText('Desbloqueada em 20/11')).toBeOnTheScreen();
  });

  it('mostra carregando e erro com nova tentativa', async () => {
    historico();
    mocks.workouts.mockReset();
    mocks.workouts
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await renderRouter(rotas, { initialUrl: '/' });

    expect(
      await screen.findByText(
        'Não foi possível carregar o progresso. Verifique sua conexão.',
      ),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Nível 1 · Iniciante')).toBeOnTheScreen();
  });

  it('mostra o estado de carregando', async () => {
    historico();
    mocks.achievements.mockReturnValue(new Promise(() => {}));
    await renderRouter(rotas, { initialUrl: '/' });

    expect(screen.getByText('Carregando progresso…')).toBeOnTheScreen();
  });
});

describe('celebração de nível na tela Hoje', () => {
  async function concluirTreino(user: ReturnType<typeof userEvent.setup>) {
    await screen.findByText('Serrote');
    for (const nome of ['Serrote', 'Face pull']) {
      for (const n of [1, 2]) {
        await user.press(
          screen.getByRole('checkbox', {
            name: `Concluir série ${n} de ${nome}`,
          }),
        );
      }
    }
    await user.press(screen.getByRole('button', { name: 'Concluir treino' }));
    await screen.findByText('Treino concluído!');
  }

  it('concluir um treino que sobe de nível mostra a celebração', async () => {
    // 8 treinos de dias anteriores × 60 = 480 XP; o de hoje soma 4 séries × 10 + 50 = 90 → 570 (Ativo)
    historico({ sessions: treinos(8, 19) });
    mocks.post.mockResolvedValue(undefined);
    const user = userEvent.setup();
    await render(<Hoje />);

    await concluirTreino(user);

    expect(await screen.findByText('Nível novo!')).toBeOnTheScreen();
    expect(screen.getByText('Você chegou ao nível Ativo.')).toBeOnTheScreen();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');

    await user.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.queryByText('Nível novo!')).not.toBeOnTheScreen();
  });

  it('um treino que não sobe de nível não mostra a celebração', async () => {
    historico();
    mocks.post.mockResolvedValue(undefined);
    const user = userEvent.setup();
    await render(<Hoje />);

    await concluirTreino(user);

    expect(screen.queryByText('Nível novo!')).not.toBeOnTheScreen();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('se o histórico não carregou, o treino funciona e não há celebração', async () => {
    historico({ sessions: treinos(8, 19) });
    mocks.workouts.mockReset();
    mocks.workouts.mockRejectedValue(new Error('rede'));
    mocks.post.mockResolvedValue(undefined);
    const user = userEvent.setup();
    await render(<Hoje />);

    await concluirTreino(user);

    expect(screen.queryByText('Nível novo!')).not.toBeOnTheScreen();
  });
});
