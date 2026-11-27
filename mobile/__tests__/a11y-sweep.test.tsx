import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import NotFound from '../app/+not-found';
import RootLayout from '../app/_layout';
import Ajustes from '../app/ajustes';
import TabsLayout from '../app/(tabs)/_layout';
import Hoje from '../app/(tabs)/index';
import Dieta from '../app/(tabs)/dieta';
import Peso from '../app/(tabs)/peso';
import Plano from '../app/(tabs)/plano';
import Progresso from '../app/(tabs)/progresso';
import { fakeToday } from '../test-utils/fakeToday';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('../src/features/account/api', () => ({ deleteAccount: jest.fn() }));
jest.mock('../src/features/workout/api', () => ({
  getPlan: jest.fn(),
  getWorkouts: jest.fn(),
  postWorkout: jest.fn(),
}));
jest.mock('../src/features/meal/api', () => ({
  getMeals: jest.fn(),
  getMealHistory: jest.fn(),
  postMeal: jest.fn(),
}));
jest.mock('../src/features/weight/api', () => ({
  getWeights: jest.fn(),
  putWeight: jest.fn(),
}));
jest.mock('../src/features/progress/api', () => ({
  getAchievements: jest.fn(),
}));

const api = {
  workout: jest.requireMock('../src/features/workout/api'),
  meal: jest.requireMock('../src/features/meal/api'),
  weight: jest.requireMock('../src/features/weight/api'),
  progress: jest.requireMock('../src/features/progress/api'),
};

const rotas = {
  _layout: RootLayout,
  '+not-found': NotFound,
  ajustes: Ajustes,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/index': Hoje,
  '(tabs)/plano': Plano,
  '(tabs)/dieta': Dieta,
  '(tabs)/peso': Peso,
  '(tabs)/progresso': Progresso,
};

const goals = { kcal: 2000, protein: 140, carbs: 200, fat: 60 };
const refeicao = {
  id: 'm1',
  date: '2026-11-27',
  name: 'Almoço',
  kcal: 500,
  protein: 35,
  carbs: 50,
  fat: 15,
};

beforeEach(() => {
  jest.resetAllMocks();
  fakeToday(new Date(2026, 10, 27, 9, 0));
  (getAuth as jest.Mock).mockReturnValue({});
  (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
    callback({ uid: 'u1', email: 'pedro@exemplo.com', displayName: 'Pedro' });
    return jest.fn();
  });
  api.workout.getPlan.mockResolvedValue({
    days: [
      {
        weekday: 5,
        name: 'Costas',
        exercises: [{ id: 'e1', name: 'Remada', sets: 2, reps: '10' }],
      },
    ],
  });
  api.workout.getWorkouts.mockResolvedValue([]);
  api.meal.getMeals.mockResolvedValue({ date: '2026-11-27', goals, meals: [refeicao] });
  api.meal.getMealHistory.mockResolvedValue({ goals, meals: [refeicao] });
  api.weight.getWeights.mockResolvedValue([
    { date: '2026-11-01', kg: 82, waistCm: null },
    { date: '2026-11-20', kg: 81, waistCm: null },
  ]);
  api.progress.getAchievements.mockResolvedValue([]);
});

afterEach(() => jest.useRealTimers());

// O que aparece em cada tela quando os dados chegam.
const TELAS: [string, string][] = [
  ['/', 'Costas'],
  ['/plano', 'Remada'],
  ['/dieta', 'Almoço'],
  ['/peso', '81 kg'],
  ['/progresso', 'Conquistas 0/8'],
  ['/ajustes', 'Política de privacidade'],
];

describe('VoiceOver em todas as telas', () => {
  it.each(TELAS)('%s: todo botão e caixa de marcar tem nome', async (url, pronto) => {
    await renderRouter(rotas, { initialUrl: url });
    await act(async () => {});
    await screen.findAllByText(pronto);

    const controles = [
      ...screen.queryAllByRole('button'),
      ...screen.queryAllByRole('checkbox'),
    ];
    expect(controles.length).toBeGreaterThan(0);
    for (const c of controles) {
      expect(c.props.accessibilityLabel?.trim() || '').not.toBe('');
    }
  });

  it.each(TELAS.filter(([url]) => url !== '/ajustes'))(
    '%s: o título grande é o primeiro cabeçalho da tela',
    async (url, pronto) => {
      await renderRouter(rotas, { initialUrl: url });
      await act(async () => {});
      await screen.findAllByText(pronto);

      const titulos = { '/': 'Hoje', '/plano': 'Plano', '/dieta': 'Dieta', '/peso': 'Peso', '/progresso': 'Progresso' } as Record<string, string>;
      expect(screen.getAllByRole('header')[0]).toHaveTextContent(titulos[url]);
    },
  );
});
